import type {
  AttemptRow,
  DashboardData,
  DashboardModel,
  FamilySummary,
  FluencySummary,
} from './types';

const DAY_MS = 86_400_000;
const SAO_PAULO = 'America/Sao_Paulo';

const median = (values: number[]) => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;
  return sorted[middle];
};

const dateKey = (value: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SAO_PAULO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

const streakFromSessions = (startedAtValues: string[]) => {
  const uniqueDays = [...new Set(startedAtValues.map(dateKey))].sort().reverse();
  if (uniqueDays.length === 0) return 0;
  let streak = 1;
  let cursor = new Date(`${uniqueDays[0]}T12:00:00Z`);
  for (let index = 1; index < uniqueDays.length; index += 1) {
    cursor = new Date(cursor.getTime() - DAY_MS);
    if (uniqueDays[index] !== cursor.toISOString().slice(0, 10)) break;
    streak += 1;
  }
  return streak;
};

const posterior = (alpha: number, beta: number) => alpha / (alpha + beta);

const buildConsolidatedSyllables = (data: DashboardData) => {
  const firstAttempts = data.attempts.filter(attempt => attempt.attempt_number === 1);
  return data.mastery
    .filter(item => {
      const lastFive = firstAttempts
        .filter(attempt => attempt.expected_syllable === item.syllable)
        .slice(0, 5);
      return item.opportunities >= 12
        && posterior(Number(item.beta_alpha), Number(item.beta_beta)) >= 0.8
        && lastFive.length === 5
        && lastFive.filter(attempt => attempt.is_correct).length >= 4;
    })
    .map(item => item.syllable)
    .sort((left, right) => left.localeCompare(right, 'pt-BR'));
};

const buildFamilySummaries = (data: DashboardData, consolidated: Set<string>): FamilySummary[] => {
  const familyBySyllable = new Map(data.catalog.map(item => [item.syllable, item.family_key]));
  const firstAttempts = data.attempts.filter(attempt => attempt.attempt_number === 1);
  const keys = [...new Set(data.mastery.map(item => familyBySyllable.get(item.syllable) ?? 'OUTRA'))];

  return keys.map(key => {
    const syllables = data.mastery.filter(item => (familyBySyllable.get(item.syllable) ?? 'OUTRA') === key);
    const syllableSet = new Set(syllables.map(item => item.syllable));
    const attempts = firstAttempts.filter(attempt => syllableSet.has(attempt.expected_syllable));
    return {
      key,
      opportunities: attempts.length,
      accuracy: attempts.length >= 5
        ? attempts.filter(attempt => attempt.is_correct).length / attempts.length
        : null,
      consolidated: syllables.filter(item => consolidated.has(item.syllable)).length,
      developing: syllables.filter(item => !consolidated.has(item.syllable)).length,
    };
  }).sort((left, right) => right.opportunities - left.opportunities || left.key.localeCompare(right.key));
};

const buildConfusions = (attempts: AttemptRow[]) => {
  const firstAttempts = attempts.filter(attempt => attempt.attempt_number === 1);
  const opportunities = new Map<string, number>();
  const counts = new Map<string, number>();
  firstAttempts.forEach(attempt => {
    opportunities.set(attempt.expected_syllable, (opportunities.get(attempt.expected_syllable) ?? 0) + 1);
    if (!attempt.is_correct) {
      const key = `${attempt.expected_syllable}\u0000${attempt.clicked_syllable}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });
  return [...counts.entries()]
    .map(([key, count]) => {
      const [expected, clicked] = key.split('\u0000');
      return { expected, clicked, count };
    })
    .filter(item => item.count >= 3 && (opportunities.get(item.expected) ?? 0) >= 5)
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);
};

const buildFluency = (attempts: AttemptRow[], now: number): FluencySummary[] => {
  const currentStart = now - 7 * DAY_MS;
  const previousStart = now - 14 * DAY_MS;
  const eligible = attempts.filter(attempt => attempt.attempt_number === 1 && attempt.is_correct
    && attempt.page_visible && attempt.timing_eligible
    && attempt.response_time_ms >= 150 && attempt.response_time_ms <= 60_000);
  const syllables = [...new Set(eligible.map(attempt => attempt.expected_syllable))];

  return syllables.flatMap(syllable => {
    const matching = eligible.filter(attempt => attempt.expected_syllable === syllable);
    const current = matching.filter(attempt => new Date(attempt.occurred_at).getTime() >= currentStart);
    const previous = matching.filter(attempt => {
      const time = new Date(attempt.occurred_at).getTime();
      return time >= previousStart && time < currentStart;
    });
    if (current.length < 10 || previous.length < 10) return [];
    const currentMedianMs = median(current.map(attempt => attempt.response_time_ms));
    const previousMedianMs = median(previous.map(attempt => attempt.response_time_ms));
    return [{
      syllable,
      currentMedianMs,
      previousMedianMs,
      changePercent: ((currentMedianMs - previousMedianMs) / previousMedianMs) * 100,
    }];
  }).sort((left, right) => left.changePercent - right.changePercent);
};

const buildConsolidatedWords = (attempts: AttemptRow[], consolidated: Set<string>) => {
  const presentations = new Map<string, AttemptRow[]>();
  attempts.forEach(attempt => {
    const current = presentations.get(attempt.presentation_id) ?? [];
    current.push(attempt);
    presentations.set(attempt.presentation_id, current);
  });
  const byWord = new Map<string, AttemptRow[][]>();
  presentations.forEach(group => {
    const word = group[0]?.word;
    if (!word) return;
    const current = byWord.get(word) ?? [];
    current.push(group);
    byWord.set(word, current);
  });

  return [...byWord.entries()].flatMap(([word, groups]) => {
    const requiredPositions = Math.max(...groups.map(group => new Set(group.map(item => item.syllable_position)).size));
    const syllables = new Set(groups.flatMap(group => group.map(item => item.expected_syllable)));
    const lastThree = groups
      .sort((left, right) => new Date(right[0].occurred_at).getTime() - new Date(left[0].occurred_at).getTime())
      .slice(0, 3);
    const cleanCompletions = lastThree.filter(group =>
      new Set(group.map(item => item.syllable_position)).size === requiredPositions
      && group.every(item => item.attempt_number === 1 && item.is_correct),
    ).length;
    if (lastThree.length < 3 || cleanCompletions < 2 || [...syllables].some(item => !consolidated.has(item))) return [];
    return [word];
  }).sort((left, right) => left.localeCompare(right, 'pt-BR'));
};

export const buildDashboardModel = (data: DashboardData, now = Date.now()): DashboardModel => {
  const weekStart = now - 7 * DAY_MS;
  const isThisWeek = (value: string) => new Date(value).getTime() >= weekStart;
  const weekSessions = data.sessions.filter(session => isThisWeek(session.started_at));
  const weekPhases = data.phaseEvents.filter(event => isThisWeek(event.occurred_at));
  const weekAudio = data.audioEvents.filter(event => isThisWeek(event.occurred_at));
  const firstAttempts = data.attempts.filter(attempt => attempt.attempt_number === 1);
  const weekFirstAttempts = firstAttempts.filter(attempt => isThisWeek(attempt.occurred_at));
  const consolidatedSyllables = buildConsolidatedSyllables(data);
  const consolidatedSet = new Set(consolidatedSyllables);
  const latestSession = data.sessions[0] ?? null;
  const latestSessionPhases = latestSession
    ? data.phaseEvents.filter(event => event.session_id === latestSession.id && event.event_type === 'completed')
    : [];
  const latestWords = latestSession
    ? [...new Set(data.attempts.filter(attempt => attempt.session_id === latestSession.id).map(attempt => attempt.word))]
    : [];

  const attemptsByOpportunity = new Map<string, AttemptRow[]>();
  data.attempts.forEach(attempt => {
    const key = `${attempt.presentation_id}:${attempt.syllable_position}`;
    const group = attemptsByOpportunity.get(key) ?? [];
    group.push(attempt);
    attemptsByOpportunity.set(key, group);
  });
  const recentTwenty = [...weekFirstAttempts].slice(0, 20);
  const highEffort = recentTwenty.filter(attempt => {
    const group = attemptsByOpportunity.get(`${attempt.presentation_id}:${attempt.syllable_position}`) ?? [];
    return group.filter(item => !item.is_correct).length >= 2;
  }).length;
  const phaseStarts = weekPhases.filter(event => event.event_type === 'started' || event.event_type === 'replayed').length;
  const abandonments = weekPhases.filter(event => event.event_type === 'abandoned').length;

  return {
    caregiverLabel: data.caregiverLabel,
    guardianCount: new Set(data.familyMembers.map(member => member.user_id)).size,
    lastSession: latestSession ? {
      startedAt: latestSession.started_at,
      durationMinutes: Math.max(0, Math.round((latestSession.duration_ms ?? 0) / 60_000)),
      completedPhases: latestSessionPhases.length,
      words: latestWords.slice(0, 8),
    } : null,
    streakDays: streakFromSessions(data.sessions.map(session => session.started_at)),
    week: {
      sessions: weekSessions.length,
      activeMinutes: Math.round(weekSessions.reduce((total, session) => total + (session.duration_ms ?? 0), 0) / 60_000),
      completedPhases: weekPhases.filter(event => event.event_type === 'completed').length,
      replayedPhases: weekPhases.filter(event => event.event_type === 'replayed').length,
      voluntaryListens: weekAudio.filter(event => event.trigger_type === 'user').length,
      effortRate: recentTwenty.length >= 5 ? highEffort / recentTwenty.length : null,
      abandonmentRate: phaseStarts >= 5 ? abandonments / phaseStarts : null,
    },
    families: buildFamilySummaries(data, consolidatedSet),
    consolidatedSyllables,
    consolidatedWords: buildConsolidatedWords(data.attempts, consolidatedSet),
    confusions: buildConfusions(data.attempts),
    fluency: buildFluency(data.attempts, now),
    totalFirstAttempts: firstAttempts.length,
    totalSessions: data.sessions.length,
    thresholdsAreProvisional: firstAttempts.length < 100 || data.sessions.length < 3,
  };
};
