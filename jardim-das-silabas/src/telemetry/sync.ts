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

const handleFailure = async (item: QueueItem, error: unknown) => {
  const details = errorDetails(error);
  const attempts = item.attempts + 1;
  const logicalConflict = details.code === '23505';
  const validationFailure = details.status >= 400 && details.status < 500;

  if (logicalConflict || (validationFailure && attempts >= 3)) {
    await moveToDeadLetter({ ...item, attempts, state: 'pending' }, details.code);
    return;
  }

  await updateQueueItem({
    ...item,
    attempts,
    state: 'pending',
    next_retry_at: retryAt(attempts),
  });
};

const sendTableItems = async (table: TelemetryTable, items: QueueItem[]) => {
  if (!supabase) return;
  const payloads = items.map(item => item.payload);
  const { error } = await supabase.from(table).upsert(payloads, {
    onConflict: 'id',
    ignoreDuplicates: true,
  });
  if (!error) {
    await deleteQueueItems(items.map(item => item.id));
    return;
  }

  for (const item of items) {
    const result = await supabase.from(table).upsert(item.payload, {
      onConflict: 'id',
      ignoreDuplicates: true,
    });
    if (result.error) await handleFailure(item, result.error);
    else await deleteQueueItems([item.id]);
  }
};

const sendRpcItem = async (item: QueueItem) => {
  if (!supabase || (item.target !== 'close_session' && item.target !== 'complete_mission')) return;
  const { error } = await supabase.rpc(item.target, item.payload);
  if (error) await handleFailure(item, error);
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
