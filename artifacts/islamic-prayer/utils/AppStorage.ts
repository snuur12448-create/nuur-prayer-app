import NativeStorage from '@react-native-async-storage/async-storage';

export const STORAGE_MAINTENANCE_KEY = 'nuur_data_maintenance_v1';
export const DATA_TRANSACTION_KEY = 'nuur_data_transaction_v1';

let maintenance = false;
let generation = 0;
let writes: Promise<unknown> = Promise.resolve();
let initialization: Promise<void> | null = null;

/** A persisted gate also protects headless workers after an interrupted change. */
export function storageReady(): Promise<void> {
  if (!initialization) {
    initialization = NativeStorage.getItem(STORAGE_MAINTENANCE_KEY).then(value => {
      if (value === '1') maintenance = true;
    }).catch(error => {
      maintenance = true;
      // A protected-data/transient native read failure may resolve after the
      // device unlocks. Retry recovery must perform a fresh read, not inherit
      // the same rejected promise forever.
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

export function isStorageMaintenanceActive(): boolean { return maintenance; }

function mutate<T>(operation: () => Promise<T>): Promise<T | undefined> {
  const requestedGeneration = generation;
  const run = writes.then(async () => {
    await storageReady();
    if (maintenance || requestedGeneration !== generation) return undefined;
    return operation();
  });
  writes = run.catch(() => {});
  return run;
}

async function read<T>(operation: () => Promise<T>): Promise<T> {
  await storageReady();
  await writes;
  return operation();
}

export async function beginStorageMaintenance(): Promise<void> {
  // Close synchronously, before awaiting a native read or an in-flight write.
  maintenance = true;
  generation += 1;
  await storageReady();
  await writes;
  await NativeStorage.setItem(STORAGE_MAINTENANCE_KEY, '1');
}

/** Call only at startup after recovery, before mounting any stateful providers. */
export async function finishStorageRecovery(): Promise<void> {
  await NativeStorage.removeItem(STORAGE_MAINTENANCE_KEY);
  generation += 1;
  maintenance = false;
}

/** Transaction coordinator only; ordinary app writes must use the facade. */
export function maintenanceStorage(): typeof NativeStorage {
  if (!maintenance) throw new Error('Storage maintenance is not active');
  return NativeStorage;
}

const AppStorage = {
  getItem: (key: string) => read(() => NativeStorage.getItem(key)),
  multiGet: (keys: readonly string[]) => read(() => NativeStorage.multiGet([...keys])),
  getAllKeys: () => read(() => NativeStorage.getAllKeys()),
  setItem: (key: string, value: string) => mutate(() => NativeStorage.setItem(key, value)),
  removeItem: (key: string) => mutate(() => NativeStorage.removeItem(key)),
  multiSet: (entries: readonly (readonly [string, string])[]) => mutate(() => NativeStorage.multiSet(entries.map(([key, value]) => [key, value]))),
  multiRemove: (keys: readonly string[]) => mutate(() => NativeStorage.multiRemove([...keys])),
  mergeItem: (key: string, value: string) => mutate(() => NativeStorage.mergeItem(key, value)),
  multiMerge: (entries: readonly (readonly [string, string])[]) => mutate(() => NativeStorage.multiMerge(entries.map(([key, value]) => [key, value]))),
  clear: async () => { throw new Error('Unscoped storage clearing is prohibited. Use Data Controls.'); },
};

export default AppStorage;
