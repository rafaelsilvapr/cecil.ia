import type { DeadLetterItem, QueueItem } from './types';

const DATABASE_NAME = 'jardim-silabas-telemetry';
const DATABASE_VERSION = 1;
const MAX_QUEUE_ITEMS = 50_000;

const QUEUE_STORE = 'telemetry_queue';
const META_STORE = 'telemetry_meta';
const DEAD_LETTER_STORE = 'telemetry_dead_letter';

type MetaRecord<T = unknown> = { key: string; value: T };

let databasePromise: Promise<IDBDatabase> | null = null;

const requestResult = <T>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('indexeddb_request_failed'));
});

const transactionDone = (transaction: IDBTransaction) => new Promise<void>((resolve, reject) => {
  transaction.oncomplete = () => resolve();
  transaction.onerror = () => reject(transaction.error ?? new Error('indexeddb_transaction_failed'));
  transaction.onabort = () => reject(transaction.error ?? new Error('indexeddb_transaction_aborted'));
});

export const openTelemetryDatabase = () => {
  if (!('indexedDB' in window)) return Promise.reject(new Error('indexeddb_unavailable'));
  if (databasePromise) return databasePromise;

  databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(QUEUE_STORE)) {
        const queue = database.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        queue.createIndex('state_next_retry', ['state', 'next_retry_at']);
        queue.createIndex('created_at', 'created_at');
      }
      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, { keyPath: 'key' });
      }
      if (!database.objectStoreNames.contains(DEAD_LETTER_STORE)) {
        database.createObjectStore(DEAD_LETTER_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error('indexeddb_open_failed'));
    };
  });

  return databasePromise;
};

export const getTelemetryMeta = async <T>(key: string): Promise<T | null> => {
  const database = await openTelemetryDatabase();
  const transaction = database.transaction(META_STORE, 'readonly');
  const record = await requestResult(transaction.objectStore(META_STORE).get(key)) as MetaRecord<T> | undefined;
  return record?.value ?? null;
};

export const setTelemetryMeta = async <T>(key: string, value: T) => {
  const database = await openTelemetryDatabase();
  const transaction = database.transaction(META_STORE, 'readwrite');
  transaction.objectStore(META_STORE).put({ key, value } satisfies MetaRecord<T>);
  await transactionDone(transaction);
};

export const deleteTelemetryMeta = async (key: string) => {
  const database = await openTelemetryDatabase();
  const transaction = database.transaction(META_STORE, 'readwrite');
  transaction.objectStore(META_STORE).delete(key);
  await transactionDone(transaction);
};

const enforceQueueLimit = async (database: IDBDatabase) => {
  const countTransaction = database.transaction(QUEUE_STORE, 'readonly');
  const count = await requestResult(countTransaction.objectStore(QUEUE_STORE).count());
  if (count <= MAX_QUEUE_ITEMS) return;

  let remainingToDelete = count - MAX_QUEUE_ITEMS;
  let droppedAutomaticAudio = 0;
  const transaction = database.transaction([QUEUE_STORE, META_STORE], 'readwrite');
  const queue = transaction.objectStore(QUEUE_STORE);
  const cursorRequest = queue.index('created_at').openCursor();

  await new Promise<void>((resolve, reject) => {
    cursorRequest.onerror = () => reject(cursorRequest.error ?? new Error('indexeddb_cursor_failed'));
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor || remainingToDelete <= 0) {
        resolve();
        return;
      }
      const item = cursor.value as QueueItem;
      if (
        item.kind === 'table' &&
        item.target === 'audio_events' &&
        item.payload.trigger_type === 'automatic'
      ) {
        cursor.delete();
        remainingToDelete -= 1;
        droppedAutomaticAudio += 1;
      }
      cursor.continue();
    };
  });

  if (droppedAutomaticAudio > 0) {
    const metaStore = transaction.objectStore(META_STORE);
    const current = await requestResult(metaStore.get('dropped_automatic_audio')) as MetaRecord<number> | undefined;
    metaStore.put({
      key: 'dropped_automatic_audio',
      value: (current?.value ?? 0) + droppedAutomaticAudio,
    });
  }
  await transactionDone(transaction);
};

export const enqueueTelemetry = async (item: QueueItem) => {
  const database = await openTelemetryDatabase();
  const transaction = database.transaction(QUEUE_STORE, 'readwrite');
  transaction.objectStore(QUEUE_STORE).put(item);
  await transactionDone(transaction);
  void enforceQueueLimit(database).catch(() => undefined);
};

export const getDueQueueItems = async (limit = 100): Promise<QueueItem[]> => {
  const database = await openTelemetryDatabase();
  const transaction = database.transaction(QUEUE_STORE, 'readonly');
  const request = transaction.objectStore(QUEUE_STORE).openCursor();
  const now = Date.now();
  const items: QueueItem[] = [];

  await new Promise<void>((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error('indexeddb_cursor_failed'));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || items.length >= limit) {
        resolve();
        return;
      }
      const item = cursor.value as QueueItem;
      if (item.state === 'pending' && item.next_retry_at <= now) items.push(item);
      cursor.continue();
    };
  });

  return items;
};

export const updateQueueItem = async (item: QueueItem) => {
  const database = await openTelemetryDatabase();
  const transaction = database.transaction(QUEUE_STORE, 'readwrite');
  transaction.objectStore(QUEUE_STORE).put(item);
  await transactionDone(transaction);
};

export const deleteQueueItems = async (ids: string[]) => {
  if (ids.length === 0) return;
  const database = await openTelemetryDatabase();
  const transaction = database.transaction(QUEUE_STORE, 'readwrite');
  const store = transaction.objectStore(QUEUE_STORE);
  ids.forEach(id => store.delete(id));
  await transactionDone(transaction);
};

export const moveToDeadLetter = async (item: QueueItem, errorCode: string) => {
  const database = await openTelemetryDatabase();
  const transaction = database.transaction([QUEUE_STORE, DEAD_LETTER_STORE], 'readwrite');
  transaction.objectStore(QUEUE_STORE).delete(item.id);
  transaction.objectStore(DEAD_LETTER_STORE).put({
    ...item,
    state: 'pending',
    failed_at: Date.now(),
    error_code: errorCode.slice(0, 120),
  } satisfies DeadLetterItem);
  await transactionDone(transaction);
};

export const recoverSyncingItems = async () => {
  const database = await openTelemetryDatabase();
  const transaction = database.transaction(QUEUE_STORE, 'readwrite');
  const store = transaction.objectStore(QUEUE_STORE);
  const request = store.openCursor();

  await new Promise<void>((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error('indexeddb_cursor_failed'));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }
      const item = cursor.value as QueueItem;
      if (item.state === 'syncing') cursor.update({ ...item, state: 'pending' });
      cursor.continue();
    };
  });
  await transactionDone(transaction);
};
