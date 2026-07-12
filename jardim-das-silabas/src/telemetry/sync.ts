import { ensureAnonymousSession, isTelemetryConfigured, supabase } from './client';
import {
  deleteQueueItems,
  getDueQueueItems,
  moveToDeadLetter,
  recoverSyncingItems,
  updateQueueItem,
} from './db';
import type { QueueItem, TelemetryTable } from './types';

const RETRY_DELAYS = [5_000, 30_000, 120_000, 600_000, 3_600_000];
const PRIORITY: Record<QueueItem['target'], number> = {
  sessions: 0,
  phase_events: 1,
  attempts: 1,
  audio_events: 1,
  close_session: 2,
  complete_mission: 2,
};

let syncPromise: Promise<void> | null = null;
let syncStarted = false;
let retryTimer: number | null = null;
let retryDeadline = Number.POSITIVE_INFINITY;

const scheduleRetry = (nextRetryAt: number) => {
  if (nextRetryAt >= retryDeadline) return;
  if (retryTimer !== null) window.clearTimeout(retryTimer);
  retryDeadline = nextRetryAt;
  retryTimer = window.setTimeout(() => {
    retryTimer = null;
    retryDeadline = Number.POSITIVE_INFINITY;
    void syncTelemetryQueue();
  }, Math.max(0, nextRetryAt - Date.now()));
};

const retryAt = (attempts: number) => {
  const baseDelay = RETRY_DELAYS[Math.min(attempts - 1, RETRY_DELAYS.length - 1)] ?? 21_600_000;
  const delay = attempts > RETRY_DELAYS.length ? 21_600_000 : baseDelay;
  const jitter = 0.8 + Math.random() * 0.4;
  return Date.now() + Math.round(delay * jitter);
};

const errorDetails = (error: unknown) => {
  if (!error || typeof error !== 'object') return { code: 'network_error', status: 0 };
  const value = error as { code?: string; status?: number; message?: string };
  return {
    code: value.code || value.message || 'sync_error',
    status: value.status ?? 0,
  };
};

const handleFailure = async (item: QueueItem, error: unknown, responseStatus = 0) => {
  const details = errorDetails(error);
  const status = responseStatus || details.status;
  const attempts = item.attempts + 1;
  const logicalConflict = details.code === '23505';
  const validationFailure = status >= 400 && status < 500;

  if (logicalConflict || (validationFailure && attempts >= 3)) {
    await moveToDeadLetter({ ...item, attempts, state: 'pending' }, details.code);
    return;
  }

  const nextRetryAt = retryAt(attempts);
  await updateQueueItem({
    ...item,
    attempts,
    state: 'pending',
    next_retry_at: nextRetryAt,
  });
  scheduleRetry(nextRetryAt);
};

const sendTableItems = async (table: TelemetryTable, items: QueueItem[]) => {
  if (!supabase) return;
  const payloads = items.map(item => item.payload);
  let batchResult;
  try {
    batchResult = await supabase.from(table).upsert(payloads, {
      onConflict: 'id',
      ignoreDuplicates: true,
    });
  } catch (error) {
    await Promise.all(items.map(item => handleFailure(item, error)));
    return;
  }
  const { error } = batchResult;
  if (!error) {
    await deleteQueueItems(items.map(item => item.id));
    return;
  }

  for (const item of items) {
    let result;
    try {
      result = await supabase.from(table).upsert(item.payload, {
        onConflict: 'id',
        ignoreDuplicates: true,
      });
    } catch (individualError) {
      await handleFailure(item, individualError);
      continue;
    }
    if (result.error) await handleFailure(item, result.error, result.status);
    else await deleteQueueItems([item.id]);
  }
};

const sendRpcItem = async (item: QueueItem) => {
  if (!supabase || (item.target !== 'close_session' && item.target !== 'complete_mission')) return;
  let result;
  try {
    result = await supabase.rpc(item.target, item.payload);
  } catch (rpcError) {
    await handleFailure(item, rpcError);
    return;
  }
  if (result.error) await handleFailure(item, result.error, result.status);
  else await deleteQueueItems([item.id]);
};

const performSync = async () => {
  if (!isTelemetryConfigured || !supabase || !navigator.onLine) return;
  await ensureAnonymousSession();
  const items = (await getDueQueueItems(100)).sort((left, right) =>
    PRIORITY[left.target] - PRIORITY[right.target] || left.created_at - right.created_at,
  );
  if (items.length === 0) return;

  await Promise.all(items.map(item => updateQueueItem({ ...item, state: 'syncing' })));

  const tableTargets: TelemetryTable[] = ['sessions', 'phase_events', 'attempts', 'audio_events'];
  for (const table of tableTargets) {
    const tableItems = items.filter(item => item.kind === 'table' && item.target === table);
    if (tableItems.length > 0) await sendTableItems(table, tableItems);
  }

  for (const item of items.filter(candidate => candidate.kind === 'rpc')) {
    await sendRpcItem(item);
  }
};

export const syncTelemetryQueue = () => {
  if (syncPromise) return syncPromise;
  syncPromise = performSync()
    .catch(async () => {
      await recoverSyncingItems().catch(() => undefined);
    })
    .finally(() => {
      syncPromise = null;
    });
  return syncPromise;
};

export const startTelemetrySync = () => {
  if (syncStarted || !isTelemetryConfigured) return;
  syncStarted = true;
  void recoverSyncingItems().then(syncTelemetryQueue).catch(() => undefined);
  window.addEventListener('online', () => void syncTelemetryQueue());
  window.setInterval(() => void syncTelemetryQueue(), 30_000);
};
