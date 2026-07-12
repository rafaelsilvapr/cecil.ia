import { resolveLearnerId } from './client';
import {
  deleteTelemetryMeta,
  enqueueTelemetry,
  getTelemetryMeta,
  setTelemetryMeta,
} from './db';
import { startTelemetrySync, syncTelemetryQueue } from './sync';
import type {
  AudioTargetType,
  AudioTriggerType,
  PhaseEventType,
  QueueItem,
  SessionEndReason,
  SessionMeta,
  TelemetryRpc,
  TelemetryTable,
} from './types';

const APP_VERSION = '0.0.0';

type ActivePhase = {
  levelIndex: number;
  sectionIndex: number;
  exerciseCount: number;
  startedAtMs: number;
  completed: boolean;
};

type ActivePresentation = {
  id: string;
  word: string;
  shownAtMs: number;
  timingEligibleAtMs: number | null;
  listens: number;
  attemptsByPosition: Map<number, number>;
};

const clampDuration = (duration: number, maximum = 7_200_000) =>
  Math.max(0, Math.min(Math.round(duration), maximum));

const queueItem = (
  id: string,
  kind: QueueItem['kind'],
  target: TelemetryTable | TelemetryRpc,
  payload: Record<string, unknown>,
): QueueItem => ({
  id,
  kind,
  target,
  payload,
  state: 'pending',
  attempts: 0,
  next_retry_at: Date.now(),
  created_at: Date.now(),
});

class TelemetryService {
  private initialization: Promise<void> | null = null;
  private learnerId: string | null = null;
  private session: SessionMeta | null = null;
  private activePhase: ActivePhase | null = null;
  private activePresentation: ActivePresentation | null = null;
  private closing = false;

  initialize(startLevel: number) {
    if (this.initialization) return this.initialization;
    this.initialization = this.initializeInternal(startLevel).catch(() => undefined);
    return this.initialization;
  }

  private async initializeInternal(startLevel: number) {
    this.learnerId = await resolveLearnerId();
    if (!this.learnerId) return;
    startTelemetrySync();

    const previousSession = await getTelemetryMeta<SessionMeta>('open_session');
    if (previousSession) {
      const endedAt = new Date().toISOString();
      await enqueueTelemetry(queueItem(
        `rpc:close_session:${previousSession.id}`,
        'rpc',
        'close_session',
        {
          p_session_id: previousSession.id,
          p_ended_at: endedAt,
          p_duration_ms: clampDuration(Date.now() - previousSession.startedAtMs),
          p_end_level: previousSession.currentLevel,
          p_reason: 'crash_recovered',
        },
      ));
    }

    const now = new Date();
    this.session = {
      id: crypto.randomUUID(),
      learnerId: this.learnerId,
      startedAt: now.toISOString(),
      startedAtMs: now.getTime(),
      startLevel,
      currentLevel: startLevel,
    };
    await enqueueTelemetry(queueItem(
      this.session.id,
      'table',
      'sessions',
      {
        id: this.session.id,
        learner_id: this.learnerId,
        started_at: this.session.startedAt,
        start_level: startLevel,
        app_version: APP_VERSION,
      },
    ));
    await setTelemetryMeta('open_session', this.session);
    void syncTelemetryQueue();
  }

  private dispatch(action: () => Promise<void>) {
    void (this.initialization ?? Promise.resolve())
      .then(() => action())
      .then(() => syncTelemetryQueue())
      .catch(() => undefined);
  }

  private enqueueTable(table: TelemetryTable, payload: Record<string, unknown>) {
    const id = payload.id;
    if (typeof id !== 'string') return Promise.resolve();
    return enqueueTelemetry(queueItem(id, 'table', table, payload));
  }

  setCurrentLevel(levelIndex: number) {
    if (!this.session) return;
    this.session.currentLevel = levelIndex;
    void setTelemetryMeta('open_session', this.session).catch(() => undefined);
  }

  startPhase(levelIndex: number, exerciseCount: number, replayed: boolean) {
    this.activePhase = {
      levelIndex,
      sectionIndex: Math.floor(levelIndex / 10),
      exerciseCount,
      startedAtMs: Date.now(),
      completed: false,
    };
    this.setCurrentLevel(levelIndex);
    const eventType: PhaseEventType = replayed ? 'replayed' : 'started';

    this.dispatch(async () => {
      if (!this.learnerId || !this.session || !this.activePhase) return;
      await this.enqueueTable('phase_events', {
        id: crypto.randomUUID(),
        learner_id: this.learnerId,
        session_id: this.session.id,
        event_type: eventType,
        level_index: levelIndex,
        section_index: Math.floor(levelIndex / 10),
        exercise_count: exerciseCount,
        occurred_at: new Date().toISOString(),
      });
    });
  }

  completePhase() {
    const phase = this.activePhase;
    if (!phase || phase.completed) return;
    phase.completed = true;
    this.dispatch(async () => {
      if (!this.learnerId || !this.session) return;
      await this.enqueueTable('phase_events', {
        id: crypto.randomUUID(),
        learner_id: this.learnerId,
        session_id: this.session.id,
        event_type: 'completed',
        level_index: phase.levelIndex,
        section_index: phase.sectionIndex,
        duration_ms: clampDuration(Date.now() - phase.startedAtMs),
        exercise_count: phase.exerciseCount,
        occurred_at: new Date().toISOString(),
      });
    });
  }

  beginPresentation(word: string) {
    const id = crypto.randomUUID();
    this.activePresentation = {
      id,
      word,
      shownAtMs: performance.now(),
      timingEligibleAtMs: null,
      listens: 0,
      attemptsByPosition: new Map(),
    };
    return id;
  }

  markAutomaticAudioComplete(presentationId: string) {
    if (this.activePresentation?.id === presentationId) {
      this.activePresentation.timingEligibleAtMs = performance.now();
    }
  }

  recordAudio(targetType: AudioTargetType, targetText: string, triggerType: AudioTriggerType) {
    const presentation = this.activePresentation;
    if (presentation) presentation.listens = Math.min(presentation.listens + 1, 20);

    this.dispatch(async () => {
      if (!this.learnerId || !this.session) return;
      await this.enqueueTable('audio_events', {
        id: crypto.randomUUID(),
        learner_id: this.learnerId,
        session_id: this.session.id,
        presentation_id: presentation?.id ?? null,
        target_type: targetType,
        target_text: targetText.slice(0, 100),
        trigger_type: triggerType,
        occurred_at: new Date().toISOString(),
      });
    });
  }

  recordAttempt(clickedSyllable: string, expectedSyllable: string, syllablePosition: number) {
    const presentation = this.activePresentation;
    const phase = this.activePhase;
    if (!presentation || !phase) return;

    const attemptNumber = (presentation.attemptsByPosition.get(syllablePosition) ?? 0) + 1;
    presentation.attemptsByPosition.set(syllablePosition, attemptNumber);
    const now = performance.now();
    const timingEligible = presentation.timingEligibleAtMs !== null;
    const timingStart = presentation.timingEligibleAtMs ?? presentation.shownAtMs;

    this.dispatch(async () => {
      if (!this.learnerId || !this.session) return;
      await this.enqueueTable('attempts', {
        id: crypto.randomUUID(),
        learner_id: this.learnerId,
        session_id: this.session.id,
        presentation_id: presentation.id,
        word: presentation.word,
        expected_syllable: expectedSyllable,
        clicked_syllable: clickedSyllable,
        syllable_position: syllablePosition,
        attempt_number: attemptNumber,
        response_time_ms: clampDuration(now - timingStart, 120_000),
        listens_before_attempt: presentation.listens,
        level_index: phase.levelIndex,
        section_index: phase.sectionIndex,
        page_visible: document.visibilityState === 'visible',
        timing_eligible: timingEligible,
        occurred_at: new Date().toISOString(),
      });
    });
  }

  close(reason: SessionEndReason) {
    if (this.closing) return;
    this.closing = true;
    const phase = this.activePhase;
    if (phase && !phase.completed) {
      this.dispatch(async () => {
        if (!this.learnerId || !this.session) return;
        await this.enqueueTable('phase_events', {
          id: crypto.randomUUID(),
          learner_id: this.learnerId,
          session_id: this.session.id,
          event_type: 'abandoned',
          level_index: phase.levelIndex,
          section_index: phase.sectionIndex,
          duration_ms: clampDuration(Date.now() - phase.startedAtMs),
          exercise_count: phase.exerciseCount,
          occurred_at: new Date().toISOString(),
        });
      });
    }

    this.dispatch(async () => {
      if (!this.session) return;
      await enqueueTelemetry(queueItem(
        `rpc:close_session:${this.session.id}`,
        'rpc',
        'close_session',
        {
          p_session_id: this.session.id,
          p_ended_at: new Date().toISOString(),
          p_duration_ms: clampDuration(Date.now() - this.session.startedAtMs),
          p_end_level: this.session.currentLevel,
          p_reason: reason,
        },
      ));
      await deleteTelemetryMeta('open_session');
    });
  }
}

export const telemetry = new TelemetryService();
