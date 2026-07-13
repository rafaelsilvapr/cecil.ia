export type FamilyMemberRow = {
  family_id: string;
  user_id: string;
  caregiver_label: 'pai' | 'mae';
};

export type SessionRow = {
  id: string;
  learner_id: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  start_level: number;
  end_level: number | null;
  ended_reason: 'normal' | 'background' | 'crash_recovered' | null;
};

export type PhaseEventRow = {
  id: string;
  session_id: string;
  event_type: 'started' | 'completed' | 'replayed' | 'abandoned';
  level_index: number;
  duration_ms: number | null;
  occurred_at: string;
};

export type AttemptRow = {
  id: string;
  session_id: string;
  presentation_id: string;
  word: string;
  expected_syllable: string;
  clicked_syllable: string;
  syllable_position: number;
  attempt_number: number;
  response_time_ms: number;
  page_visible: boolean;
  timing_eligible: boolean;
  is_correct: boolean;
  occurred_at: string;
};

export type AudioEventRow = {
  id: string;
  trigger_type: 'automatic' | 'user';
  occurred_at: string;
};

export type MasteryRow = {
  syllable: string;
  opportunities: number;
  first_try_successes: number;
  beta_alpha: number;
  beta_beta: number;
  last_seen_at: string | null;
};

export type CatalogRow = {
  syllable: string;
  family_key: string;
};

export type DashboardData = {
  caregiverLabel: 'pai' | 'mae';
  familyMembers: FamilyMemberRow[];
  sessions: SessionRow[];
  phaseEvents: PhaseEventRow[];
  attempts: AttemptRow[];
  audioEvents: AudioEventRow[];
  mastery: MasteryRow[];
  catalog: CatalogRow[];
};

export type FamilySummary = {
  key: string;
  opportunities: number;
  accuracy: number | null;
  consolidated: number;
  developing: number;
};

export type ConfusionSummary = {
  expected: string;
  clicked: string;
  count: number;
};

export type FluencySummary = {
  syllable: string;
  currentMedianMs: number;
  previousMedianMs: number;
  changePercent: number;
};

export type DashboardModel = {
  caregiverLabel: 'pai' | 'mae';
  guardianCount: number;
  lastSession: {
    startedAt: string;
    durationMinutes: number;
    completedPhases: number;
    words: string[];
  } | null;
  streakDays: number;
  week: {
    sessions: number;
    activeMinutes: number;
    completedPhases: number;
    replayedPhases: number;
    voluntaryListens: number;
    effortRate: number | null;
    abandonmentRate: number | null;
  };
  families: FamilySummary[];
  consolidatedSyllables: string[];
  consolidatedWords: string[];
  confusions: ConfusionSummary[];
  fluency: FluencySummary[];
  totalFirstAttempts: number;
  totalSessions: number;
  thresholdsAreProvisional: boolean;
};
