import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const runtimeRequire = createRequire(import.meta.url);
const NodeModule = runtimeRequire('node:module');
const originalLoad = NodeModule._load;
const definitions = new Map();
const registrations = new Set(['com.nuur.widget-refresh']);
const calls = [];
const storage = new Map();
const platform = { OS: 'ios' };
let available = true;
let status = 2;
let unregisterFails = false;
let notificationFails = false;
let snapshotFails = false;
let snapshot;
globalThis.__DEV__ = false;
const taskManager = {
  isTaskDefined: (name) => definitions.has(name),
  defineTask: (name, task) => definitions.set(name, task),
  isAvailableAsync: async () => available,
  isTaskRegisteredAsync: async (name) => registrations.has(name),
  unregisterTaskAsync: async (name) => {
    calls.push(['unregister', name]);
    if (unregisterFails) throw new Error('mock unregister failure');
    registrations.delete(name);
  },
};
const backgroundTask = {
  BackgroundTaskStatus: { Restricted: 1, Available: 2 },
  BackgroundTaskResult: { Success: 1, Failed: 2 },
  getStatusAsync: async () => status,
  registerTaskAsync: async (name, options) => {
    if (registrations.has(name)) return;
    calls.push(['register', name, options]);
    registrations.add(name);
  },
};
NodeModule._load = function(request, parent, isMain) {
  if (request === 'react-native') return { Platform: platform };
  if (request === 'expo-background-task') return backgroundTask;
  if (request === 'expo-task-manager') return taskManager;
  if (request === '@react-native-async-storage/async-storage') return { getItem: async key => storage.get(key) ?? null };
  if (request === '@/utils/notifications') return {
    refreshPrayerNotificationsFromStorage: async () => {
      calls.push(['notifications']);
      if (notificationFails) throw new Error('mock notification failure');
      return false;
    },
  };
  if (request === '@/utils/nuurBridge') return {
    pushWidgetSnapshot: async payload => {
      calls.push(['widget']);
      if (snapshotFails) throw new Error('mock widget failure');
      snapshot = payload;
      return true;
    },
  };
  return originalLoad.call(this, request, parent, isMain);
};

let runtime;
try {
  runtime = runtimeRequire('../utils/widgetBackgroundTask.ts');
} finally {
  NodeModule._load = originalLoad;
}

const taskName = 'com.nuur.widget-refresh.v2';
assert.equal(definitions.size, 1, 'task definition must be available at module scope');
assert.ok(definitions.has(taskName));
await Promise.all([runtime.registerWidgetBackgroundTask(), runtime.registerWidgetBackgroundTask()]);
assert.deepEqual(calls, [
  ['unregister', 'com.nuur.widget-refresh'],
  ['register', taskName, { minimumInterval: 60 }],
], 'migrate the old worker exactly once and use minutes, not seconds');
await runtime.registerWidgetBackgroundTask();
assert.equal(calls.length, 2, 'subsequent opens must not duplicate native registration');

registrations.clear();
status = 1;
await runtime.registerWidgetBackgroundTask();
assert.equal(registrations.size, 0, 'restricted simulator/Expo Go must not register');
status = 2;
available = false;
await runtime.registerWidgetBackgroundTask();
assert.equal(registrations.size, 0, 'unavailable task manager must not register');
available = true;
platform.OS = 'web';
await runtime.registerWidgetBackgroundTask();
assert.equal(registrations.size, 0, 'web must not register');
platform.OS = 'android';
await runtime.registerWidgetBackgroundTask();
assert.ok(registrations.has(taskName), 'Android should also replenish its rolling notification queue');

registrations.clear();
registrations.add('com.nuur.widget-refresh');
unregisterFails = true;
await runtime.registerWidgetBackgroundTask();
assert.equal(registrations.has(taskName), false, 'do not overlap an old worker that failed migration');
unregisterFails = false;
await runtime.registerWidgetBackgroundTask();
assert.equal(registrations.has('com.nuur.widget-refresh'), false);
assert.ok(registrations.has(taskName), 'a failed migration must be retryable');

const run = definitions.get(taskName);
assert.equal(await run(), backgroundTask.BackgroundTaskResult.Success, 'no saved location/disabled notifications is a successful no-op');
storage.set('location_data', JSON.stringify({ latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh', city: 'Makkah' }));
storage.set('umm_al_qura_isha_policy', 'fixed120');
assert.equal(await run(), backgroundTask.BackgroundTaskResult.Success);
assert.ok(snapshot.prayerDays.length >= 35);
assert.equal((Date.parse(snapshot.isha) - Date.parse(snapshot.maghrib)) / 60_000, 120, 'persisted Isha policy must reach the background snapshot');
assert.ok(snapshot.prayerDays.every(day => (Date.parse(day.isha) - Date.parse(day.maghrib)) / 60_000 === 120));
assert.ok(snapshot.generatedAt && snapshot.validThrough);

notificationFails = true;
assert.equal(await run(), backgroundTask.BackgroundTaskResult.Failed, 'widget success must not hide notification failure');
notificationFails = false;
snapshotFails = true;
const before = calls.filter(call => call[0] === 'notifications').length;
assert.equal(await run(), backgroundTask.BackgroundTaskResult.Failed);
assert.equal(calls.filter(call => call[0] === 'notifications').length, before + 1, 'notification refresh must run even if widget update fails');

console.log('Background task QA passed: legacy migration, concurrent registration, platform/status gates, retry, no-op, partial failure, and 35-day snapshots with saved Isha policy.');
