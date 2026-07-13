import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isParentDashboardConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const parentSupabase = isParentDashboardConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        storageKey: 'jardim-silabas-parent-auth',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
