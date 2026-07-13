import type { User } from '@supabase/supabase-js';
import { parentSupabase } from './client';
import type {
  AttemptRow,
  AudioEventRow,
  CatalogRow,
  DashboardData,
  FamilyMemberRow,
  MasteryRow,
  PhaseEventRow,
  SessionRow,
} from './types';

const throwIfError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export const loadDashboardData = async (user: User): Promise<DashboardData | null> => {
  if (!parentSupabase) return null;

  const membersResult = await parentSupabase
    .from('family_members')
    .select('family_id,user_id,caregiver_label');
  throwIfError(membersResult.error);
  const familyMembers = (membersResult.data ?? []) as FamilyMemberRow[];
  const ownMembership = familyMembers.find(member => member.user_id === user.id);
  if (!ownMembership) return null;

  const learnerResult = await parentSupabase
    .from('learners')
    .select('id')
    .eq('family_id', ownMembership.family_id)
    .limit(1)
    .maybeSingle();
  throwIfError(learnerResult.error);
  if (!learnerResult.data?.id) return null;
  const learnerId = learnerResult.data.id as string;

  const [sessionsResult, phasesResult, attemptsResult, audioResult, masteryResult, catalogResult] = await Promise.all([
    parentSupabase.from('sessions').select('id,learner_id,started_at,ended_at,duration_ms,start_level,end_level,ended_reason')
      .eq('learner_id', learnerId).order('started_at', { ascending: false }).limit(365),
    parentSupabase.from('phase_events').select('id,session_id,event_type,level_index,duration_ms,occurred_at')
      .eq('learner_id', learnerId).order('occurred_at', { ascending: false }).limit(2000),
    parentSupabase.from('attempts').select('id,session_id,presentation_id,word,expected_syllable,clicked_syllable,syllable_position,attempt_number,response_time_ms,page_visible,timing_eligible,is_correct,occurred_at')
      .eq('learner_id', learnerId).order('occurred_at', { ascending: false }).limit(5000),
    parentSupabase.from('audio_events').select('id,trigger_type,occurred_at')
      .eq('learner_id', learnerId).order('occurred_at', { ascending: false }).limit(2000),
    parentSupabase.from('mastery').select('syllable,opportunities,first_try_successes,beta_alpha,beta_beta,last_seen_at')
      .eq('learner_id', learnerId),
    parentSupabase.from('syllable_catalog').select('syllable,family_key'),
  ]);

  [sessionsResult, phasesResult, attemptsResult, audioResult, masteryResult, catalogResult]
    .forEach(result => throwIfError(result.error));

  return {
    caregiverLabel: ownMembership.caregiver_label,
    familyMembers,
    sessions: (sessionsResult.data ?? []) as SessionRow[],
    phaseEvents: (phasesResult.data ?? []) as PhaseEventRow[],
    attempts: (attemptsResult.data ?? []) as AttemptRow[],
    audioEvents: (audioResult.data ?? []) as AudioEventRow[],
    mastery: (masteryResult.data ?? []) as MasteryRow[],
    catalog: (catalogResult.data ?? []) as CatalogRow[],
  };
};
