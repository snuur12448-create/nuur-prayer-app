import { NativeModules, Platform } from 'react-native';
import { reloadAppAsync } from 'expo';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import * as Notifications from 'expo-notifications';
import AppStorage, {
  beginStorageMaintenance, finishStorageRecovery, maintenanceStorage,
  isStorageMaintenanceActive, storageReady, DATA_TRANSACTION_KEY,
} from './AppStorage';
import { stopAllAudioForMaintenance } from './audioFocus';
import { cancelAllPrayerNotifications } from './notifications';
import { drainAuxiliaryNotifications } from './auxiliaryNotifications';
import { BACKUP_KEYS, createBackupPayload, validateBackupPayload, MAX_ENCRYPTED_BACKUP_BYTES, utf8ByteLength, type BackupPayload } from './backupSchema';
import { applyDataTransaction, recoverDataTransaction } from './dataTransaction';

interface BackupNative {
  encryptBackup(plaintext: string, passphrase: string): Promise<string>;
  decryptBackup(envelope: string, passphrase: string): Promise<string>;
  beginDataMaintenance(): Promise<void>;
  endDataMaintenance(): Promise<void>;
  clearSharedData(): Promise<void>;
}
function nativeBackup(): BackupNative {
  const native = NativeModules.NuurBridge as Partial<BackupNative> | undefined;
  if (Platform.OS !== 'ios' || !native ||
      ['encryptBackup', 'decryptBackup', 'beginDataMaintenance', 'endDataMaintenance', 'clearSharedData'].some(key => typeof native[key as keyof BackupNative] !== 'function')) {
    throw new Error('Encrypted backups and data reset require the current Nuur iPhone build.');
  }
  return native as BackupNative;
}
export function supportsDataControls(): boolean {
  try { nativeBackup(); return true; } catch { return false; }
}

let startup: Promise<'none' | 'rolled-back' | 'completed'> | null = null;
/** Must complete before mounting AppContext, audio, onboarding or widget writers. */
export function initializeDataControls(): Promise<'none' | 'rolled-back' | 'completed'> {
  if (startup) return startup;
  startup = (async () => {
    await beginStorageMaintenance();
    const store = maintenanceStorage();
    const hasJournal = await store.getItem(DATA_TRANSACTION_KEY);
    let result: 'none' | 'rolled-back' | 'completed' = 'none';
    if (hasJournal) {
      const bridge = nativeBackup();
      await bridge.beginDataMaintenance();
      // An interrupted transaction may have left native requests scheduled.
      // Never resume application providers until the queue is verified empty.
      await cancelAndVerifyNotifications();
      result = await recoverDataTransaction(store, () => bridge.clearSharedData());
    }
    if (supportsDataControls()) await nativeBackup().endDataMaintenance();
    await clearTemporaryBackups();
    await finishStorageRecovery();
    return result;
  })().catch(error => { startup = null; throw error; });
  return startup;
}

function checkPassword(passphrase: string): void {
  const Segmenter = (Intl as unknown as {
    Segmenter?: new (locale?: string, options?: { granularity: 'grapheme' }) => { segment(text: string): Iterable<unknown> };
  }).Segmenter;
  const characters = Segmenter
    ? Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(passphrase)).length
    : Array.from(passphrase).length;
  // Native Swift repeats this using full grapheme clusters, including on a
  // runtime without Intl.Segmenter. Never weaken the native minimum.
  if (characters < 12 || utf8ByteLength(passphrase) > 1024) {
    throw new Error('Use a password of at least 12 characters (up to 1,024 UTF-8 bytes).');
  }
}

let busy = false;
async function exclusive<T>(operation: () => Promise<T>): Promise<T> {
  if (busy) throw new Error('Another data operation is still running.');
  busy = true;
  try { return await operation(); } finally { busy = false; }
}

/** Only encrypted bytes touch the temporary file. No password is persisted. */
export async function exportEncryptedBackup(passphrase: string): Promise<void> {
  return exclusive(async () => {
    checkPassword(passphrase);
    if (isStorageMaintenanceActive()) throw new Error('Restart Nuur to finish the pending data change.');
    const bridge = nativeBackup();
    if (!FileSystem.cacheDirectory || !await Sharing.isAvailableAsync()) throw new Error('File sharing is unavailable on this device.');
    const entries = await AppStorage.multiGet(BACKUP_KEYS);
    const payload = createBackupPayload(entries);
    const encrypted = await bridge.encryptBackup(JSON.stringify(payload), passphrase);
    const directory = `${FileSystem.cacheDirectory}nuur-encrypted-backups/`;
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    const file = `${directory}Nuur-${new Date().toISOString().slice(0, 10)}-${Crypto.randomUUID()}.nuurbackup`;
    try {
      await FileSystem.writeAsStringAsync(file, encrypted, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(file, { dialogTitle: 'Save encrypted Nuur backup', mimeType: 'application/json', UTI: 'public.json' });
    } finally {
      await FileSystem.deleteAsync(file, { idempotent: true });
    }
  });
}

/** Select/decrypt/validate only. Nothing is changed until the separate confirmed restore. */
export async function chooseBackupToRestore(passphrase: string): Promise<BackupPayload | null> {
  return exclusive(async () => {
    checkPassword(passphrase);
    const bridge = nativeBackup();
    if (isStorageMaintenanceActive()) throw new Error('Restart Nuur to finish the pending data change.');
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: false, copyToCacheDirectory: true });
    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset) throw new Error('No backup file was selected.');
    try {
      const info = await FileSystem.getInfoAsync(asset.uri);
      if (!info.exists || info.isDirectory || !Number.isFinite(info.size) || info.size > MAX_ENCRYPTED_BACKUP_BYTES) {
        throw new Error('Select a Nuur backup smaller than 3 MB.');
      }
      const envelope = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
      if (utf8ByteLength(envelope) > MAX_ENCRYPTED_BACKUP_BYTES) throw new Error('The backup is too large.');
      const plaintext = await bridge.decryptBackup(envelope, passphrase);
      return validateBackupPayload(JSON.parse(plaintext));
    } finally {
      // Delete only the picker-owned local copy, never the original file.
      if (FileSystem.cacheDirectory && asset.uri.startsWith(FileSystem.cacheDirectory)) {
        await FileSystem.deleteAsync(asset.uri, { idempotent: true });
      }
    }
  });
}

async function cancelAndVerifyNotifications(): Promise<void> {
  await cancelAllPrayerNotifications(); // drains any in-flight serialized rebuild
  await drainAuxiliaryNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  if (pending.length) throw new Error('Could not cancel every scheduled alert. No data change can proceed.');
  await Notifications.dismissAllNotificationsAsync();
}

async function clearTemporaryBackups(): Promise<void> {
  if (FileSystem.cacheDirectory) await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}nuur-encrypted-backups/`, { idempotent: true });
}

async function changeData(kind: 'restore' | 'clear', payload?: BackupPayload): Promise<void> {
  return exclusive(async () => {
    const bridge = nativeBackup();
    const validated = payload ? validateBackupPayload(payload) : undefined;
    await storageReady();
    if (isStorageMaintenanceActive()) throw new Error('Restart Nuur to finish the pending data change.');
    await beginStorageMaintenance();
    await bridge.beginDataMaintenance();
    await stopAllAudioForMaintenance();
    await cancelAndVerifyNotifications();
    await applyDataTransaction(maintenanceStorage(), kind, validated?.values ?? {}, async () => {
      await bridge.clearSharedData();
      await clearTemporaryBackups();
    });
    // Keep both gates closed. A full JS reload invalidates every old async
    // callback; a component-only remount would not provide that guarantee.
    await reloadAfterDataChange();
  });
}

export const restorePersonalData = (payload: BackupPayload) => changeData('restore', payload);
export const clearPersonalData = () => changeData('clear');
export async function reloadAfterDataChange(): Promise<void> {
  try { await reloadAppAsync('Nuur data maintenance'); }
  catch { throw new Error('The data operation is paused safely. Close and reopen Nuur to finish. Do not uninstall it.'); }
}
