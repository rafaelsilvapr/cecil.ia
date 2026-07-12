export type TelemetryTable = 'sessions' | 'phase_events' | 'attempts' | 'audio_events';
export type TelemetryRpc = 'close_session' | 'complete_mission';

export type QueueItem = {
  id: string;
  kind: 'table' | 'rpc';
  target: TelemetryTable | TelemetryRpc;
  payload: Record<string, unknown>;
  state: 'pending' | 'syncing';
  attempts: number;
  next_retry_at: number;
  created_at: number;
};

export type DeadLetterItem = QueueItem & {
  failed_at: number;
  error_code: string;
};

export type SessionMeta = {
  id: string;
  learnerId: string;
  startedAt: string;
  startedAtMs: number;
  startLevel: number;
  currentLevel: number;
};

export type PhaseEventType = 'started' | 'completed' | 'replayed' | 'abandoned';
export type SessionEndReason = 'normal' | 'background' | 'crash_recovered';
export type AudioTargetType = 'word' | 'syllable' | 'celebration';
export type AudioTriggerType = 'automatic' | 'user';
