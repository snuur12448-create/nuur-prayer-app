import { BACKUP_KEYS, isClearableAppKey, MAX_BACKUP_BYTES, utf8ByteLength, validateBackupPayload } from './backupSchema';

export const DATA_TRANSACTION_JOURNAL = 'nuur_data_transaction_v1';
type Pair = [string, string];
export interface TransactionStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
  getAllKeys(): Promise<readonly string[]>;
  multiGet(keys: string[]): Promise<readonly (readonly [string, string | null])[]>;
  multiSet(entries: Pair[]): Promise<unknown>;
  multiRemove(keys: string[]): Promise<unknown>;
}
interface Journal { version: 1; phase: 'prepared' | 'committed'; keys: string[]; before: Pair[] }
const runtimeKeys = ['notifications_enabled', 'notif_snooze_until', 'notif_last_scheduled_at', 'nuur_managed_notification_ids_v1'];
const preservedKeys = new Set([...BACKUP_KEYS, ...runtimeKeys, 'nuur_onboarding_done', 'nuur_notif_ritual_done']);

function parseJournal(raw: string): Journal {
  if (utf8ByteLength(raw) > MAX_BACKUP_BYTES * 2) throw new Error('Recovery journal is too large.');
  const value = JSON.parse(raw) as Journal;
  if (!value || value.version !== 1 || !['prepared', 'committed'].includes(value.phase) ||
      !Array.isArray(value.keys) || value.keys.length > 4096 ||
      value.keys.some(key => typeof key !== 'string' || !isClearableAppKey(key)) ||
      !Array.isArray(value.before) || value.before.length > preservedKeys.size ||
      value.before.some(pair => !Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' ||
        typeof pair[1] !== 'string' || !preservedKeys.has(pair[0]) || !value.keys.includes(pair[0])) ||
      new Set(value.keys).size !== value.keys.length || new Set(value.before.map(pair => pair[0])).size !== value.before.length) {
    throw new Error('Recovery journal is invalid; no data was changed.');
  }
  return value;
}

async function restoreBefore(store: TransactionStorage, journal: Journal): Promise<void> {
  await store.multiRemove(journal.keys);
  if (journal.before.length) await store.multiSet(journal.before);
  // Neither a restore nor an interrupted/rolled-back change may silently
  // activate alerts. The user deliberately enables them again after review.
  await store.setItem('notifications_enabled', 'false');
}

export async function recoverDataTransaction(store: TransactionStorage, clearSharedData: () => Promise<void>): Promise<'none' | 'rolled-back' | 'completed'> {
  const raw = await store.getItem(DATA_TRANSACTION_JOURNAL);
  if (!raw) return 'none';
  const journal = parseJournal(raw);
  if (journal.phase === 'prepared') await restoreBefore(store, journal);
  else {
    await store.setItem('notifications_enabled', 'false');
    await clearSharedData();
  }
  await store.removeItem(DATA_TRANSACTION_JOURNAL);
  return journal.phase === 'prepared' ? 'rolled-back' : 'completed';
}

/** Caller must hold both storage/native maintenance gates and stop/cancel all
 * audio + notification work before entering. A prepared write-ahead journal
 * makes interrupted restores/clears recoverable before app providers mount.
 * Download caches are disposable; only personal values are journaled. */
export async function applyDataTransaction(
  store: TransactionStorage,
  kind: 'restore' | 'clear',
  values: Record<string, string>,
  clearSharedData: () => Promise<void>,
): Promise<void> {
  if (kind === 'restore') validateBackupPayload({ format: 'nuur-personal-data', version: 1, createdAt: new Date().toISOString(), values });
  if (await store.getItem(DATA_TRANSACTION_JOURNAL)) throw new Error('Finish the pending data recovery before making another change.');
  const existing = await store.getAllKeys();
  const keys = kind === 'clear'
    ? existing.filter(isClearableAppKey)
    : [...new Set([...BACKUP_KEYS, ...runtimeKeys, 'nuur_onboarding_done', 'nuur_notif_ritual_done'])];
  if (keys.length > 4096) throw new Error('Too many stored records to change safely.');
  const before = (await store.multiGet(keys.filter(key => preservedKeys.has(key))))
    .filter((pair): pair is readonly [string, string] => pair[1] !== null)
    .map(([key, value]): Pair => [key, value]);
  const journal: Journal = { version: 1, phase: 'prepared', keys, before };
  const encoded = JSON.stringify(journal);
  if (utf8ByteLength(encoded) > MAX_BACKUP_BYTES * 2) throw new Error('Stored personal data is too large to change safely.');
  await store.setItem(DATA_TRANSACTION_JOURNAL, encoded);
  try {
    await store.multiRemove(keys);
    if (kind === 'restore') {
      await store.multiSet(Object.entries(values));
      // A restored location is a deliberate saved city, never silent consent
      // to ask GPS for coordinates on a different phone.
      if (values.location_data) await store.setItem('location_source', 'manual');
      await store.multiSet([['nuur_onboarding_done', 'true'], ['nuur_notif_ritual_done', 'true']]);
    }
    await store.setItem('notifications_enabled', 'false');
    await store.setItem(DATA_TRANSACTION_JOURNAL, JSON.stringify({ ...journal, phase: 'committed' }));
  } catch (error) {
    try {
      await restoreBefore(store, journal);
      await store.removeItem(DATA_TRANSACTION_JOURNAL);
    } catch {
      throw new Error('The change could not finish and recovery is still pending. Restart Nuur; do not uninstall it.');
    }
    throw new Error('The change failed. Your personal data was restored and reminders remain off. Restart Nuur to continue.');
  }
  // Only clear widget/adhkar data after the personal-data commit point. An
  // error here must finish forward at startup, never pretend already-cleared
  // native personal data can be rolled back from the JS journal.
  try {
    await clearSharedData();
    await store.removeItem(DATA_TRANSACTION_JOURNAL);
  } catch {
    throw new Error('Your data change was saved, but cleanup is still pending. Restart Nuur to finish; do not uninstall it.');
  }
}
