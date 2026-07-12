import { createClient } from '@supabase/supabase-js';
import { getTelemetryMeta, setTelemetryMeta } from './db';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isTelemetryConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isTelemetryConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

let anonymousSessionPromise: ReturnType<NonNullable<typeof supabase>['auth']['signInAnonymously']> | null = null;

export const ensureAnonymousSession = async () => {
  if (!supabase) return null;
  const { data: current } = await supabase.auth.getSession();
  if (current.session) return current.session;

  if (!anonymousSessionPromise) {
    anonymousSessionPromise = supabase.auth.signInAnonymously();
  }
  try {
    const { data, error } = await anonymousSessionPromise;
    if (error) throw error;
    return data.session;
  } finally {
    anonymousSessionPromise = null;
  }
};

const pairingCodeFromUrl = () => {
  const url = new URL(window.location.href);
  if (url.pathname !== '/configurar') return null;
  return url.searchParams.get('codigo')?.trim() || null;
};

export const resolveLearnerId = async (): Promise<string | null> => {
  const storedLearnerId = await getTelemetryMeta<string>('learner_id');
  if (!supabase) return storedLearnerId;

  const pairingCode = pairingCodeFromUrl();
  if (pairingCode) {
    await ensureAnonymousSession();
    const { data, error } = await supabase.rpc('claim_learner', { p_code: pairingCode });
    if (error) throw error;
    if (typeof data !== 'string') throw new Error('invalid_learner_id');
    await setTelemetryMeta('learner_id', data);
    window.history.replaceState({}, '', '/');
    return data;
  }

  if (storedLearnerId) return storedLearnerId;

  await ensureAnonymousSession();
  const { data, error } = await supabase.from('learners').select('id').limit(1).maybeSingle();
  if (error) throw error;
  if (!data?.id) return null;
  await setTelemetryMeta('learner_id', data.id);
  return data.id;
};
