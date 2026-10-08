import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

import queueModule from "../utils/latestOnlyQueue.ts";
import ownershipModule from "../utils/notificationOwnership.ts";
import planModule from "../utils/notificationPlan.ts";
import prayerNotifModule from "../utils/prayerNotifData.ts";

const { createLatestOnlyMutationQueue } = queueModule;
const { buildManagedNotificationIdentifier, isNuurManagedNotification } = ownershipModule;
const { buildPrayerAlertPlan, takeRoundRobin } = planModule;
const { shouldPresentForegroundAdhan } = prayerNotifModule;

// Calls queued in the same turn are coalesced before any native mutation starts.
const enqueueSameTurn = createLatestOnlyMutationQueue();
const sameTurnEvents = [];
await Promise.all([
  enqueueSameTurn(async () => { sameTurnEvents.push("superseded"); }),
  enqueueSameTurn(async () => { sameTurnEvents.push("latest"); }),
]);
assert.deepEqual(sameTurnEvents, ["latest"]);

// If a replacement is already running, later requests wait for it. Only the
// newest waiting request runs, and cancel/create phases never overlap.
const enqueueDuringRun = createLatestOnlyMutationQueue();
const events = [];
let active = 0;
let maxActive = 0;
let releaseFirst;
let markFirstStarted;
const firstStarted = new Promise((resolve) => { markFirstStarted = resolve; });
const firstGate = new Promise((resolve) => { releaseFirst = resolve; });

const first = enqueueDuringRun(async () => {
  active += 1;
  maxActive = Math.max(maxActive, active);
  events.push("first:start");
  markFirstStarted();
  await firstGate;
  events.push("first:end");
  active -= 1;
});
await firstStarted;

const superseded = enqueueDuringRun(async () => { events.push("superseded"); });
const latest = enqueueDuringRun(async () => {
  active += 1;
  maxActive = Math.max(maxActive, active);
  events.push("latest:start");
  events.push("latest:end");
  active -= 1;
});
releaseFirst();
await Promise.all([first, superseded, latest]);

assert.equal(maxActive, 1, "notification replacement jobs must never interleave");
assert.deepEqual(events, ["first:start", "first:end", "latest:start", "latest:end"]);

// The actual prayer-time alert is always present and always ordered before its
// optional preparation reminder. The reminder augments; it never replaces.
const baseTime = Date.UTC(2026, 9, 8, 12, 0, 0);
const foregroundAdhanSettings = {
  enabled: true,
  type: "adhan",
  adhanStyleId: "mishary",
  adhanMode: "full",
  days: [4],
};
const foregroundAdhanOptions = {
  notificationsEnabled: true,
  prayerTimeMs: baseTime,
  snoozeUntil: 0,
  dayOfWeek: 4,
};
assert.equal(shouldPresentForegroundAdhan(foregroundAdhanSettings, foregroundAdhanOptions), true);
assert.equal(shouldPresentForegroundAdhan(
  { ...foregroundAdhanSettings, type: "notification" },
  foregroundAdhanOptions,
), false, "banner-only prayers must not start foreground Adhan audio");
assert.equal(shouldPresentForegroundAdhan(
  foregroundAdhanSettings,
  { ...foregroundAdhanOptions, notificationsEnabled: false },
), false, "the master notification switch must stop foreground playback");
assert.equal(shouldPresentForegroundAdhan(
  foregroundAdhanSettings,
  { ...foregroundAdhanOptions, snoozeUntil: baseTime + 1 },
), false, "snoozed prayers must not start foreground playback");
assert.equal(shouldPresentForegroundAdhan(
  foregroundAdhanSettings,
  { ...foregroundAdhanOptions, dayOfWeek: 5 },
), false, "a prayer excluded on this weekday must not start foreground playback");
const onePrayerPlan = buildPrayerAlertPlan([
  { dayIndex: 0, key: "asr", fireTimeMs: baseTime, dayOfWeek: 4, enabled: true, allowedDays: [4] },
], { nowMs: baseTime - 60 * 60_000, snoozeUntil: 0, preReminderMinutes: 15 });
assert.deepEqual(onePrayerPlan.map(({ kind, fireTimeMs }) => ({ kind, fireTimeMs })), [
  { kind: "prayer", fireTimeMs: baseTime },
  { kind: "prayer-pre-reminder", fireTimeMs: baseTime - 15 * 60_000 },
]);

// Simulate iOS's 60-slot budget with ten full days. All 50 actual prayers are
// planned ahead of preparation reminders, so the cap cannot evict an actual.
const tenDayCandidates = Array.from({ length: 10 }, (_, dayIndex) =>
  ["fajr", "dhuhr", "asr", "maghrib", "isha"].map((key, prayerIndex) => ({
    dayIndex,
    key,
    fireTimeMs: baseTime + (dayIndex * 24 * 60 + prayerIndex * 120) * 60_000,
    dayOfWeek: (4 + dayIndex) % 7,
    enabled: true,
    allowedDays: [0, 1, 2, 3, 4, 5, 6],
  })),
).flat();
const cappedPlan = buildPrayerAlertPlan(tenDayCandidates, {
  nowMs: baseTime - 60_000,
  snoozeUntil: 0,
  preReminderMinutes: 15,
}).slice(0, 60);
assert.equal(cappedPlan.filter((alert) => alert.kind === "prayer").length, 50);
assert.equal(cappedPlan.filter((alert) => alert.kind === "prayer-pre-reminder").length, 10);

// The optional budget is fair across features: a long pre-prayer queue cannot
// consume every remaining slot before nearer Jummah/Ayah/Hadith reminders.
const optionalPlan = takeRoundRobin([
  ["pre-1", "pre-2", "pre-3", "pre-4", "pre-5"],
  ["sunrise-1", "sunrise-2"],
  ["jummah-1"],
  ["ayah-1", "ayah-2"],
  ["hadith-1", "hadith-2"],
  ["event-1"],
], 10);
assert.deepEqual(optionalPlan.slice(0, 6), [
  "pre-1", "sunrise-1", "jummah-1", "ayah-1", "hadith-1", "event-1",
]);
assert.equal(optionalPlan.length, 10);

// Foreground/background double scheduling converges on identical identifiers;
// actual and pre-prayer alerts remain distinct. A manual offset intentionally
// changes the identifier, and cleanup owns both the old and replacement IDs.
const actualId = buildManagedNotificationIdentifier("prayer", "asr", baseTime);
const repeatedActualId = buildManagedNotificationIdentifier("prayer", "asr", baseTime);
const preId = buildManagedNotificationIdentifier("prayer-pre-reminder", "asr", baseTime - 15 * 60_000);
const offsetActualId = buildManagedNotificationIdentifier("prayer", "asr", baseTime + 5 * 60_000);
assert.equal(actualId, repeatedActualId);
assert.notEqual(actualId, preId);
assert.notEqual(actualId, offsetActualId);
assert.equal(new Set([actualId, repeatedActualId]).size, 1);

// Legacy standalone builds used Expo UUIDs. They must be recognized from Nuur
// payload/content without matching independent test or streak alerts.
assert.equal(isNuurManagedNotification({
  identifier: "A5FC01C7-8DE7-4B49-A76A-OLDUUID",
  content: { title: "Asr in 15 min", body: "Prepare for Asr prayer at 3:44 PM", data: { type: "prayer-pre-reminder", key: "asr" } },
}), true);
assert.equal(isNuurManagedNotification({
  identifier: "another-old-uuid",
  content: { title: "🕓 Asr at 3:44 PM", body: "Guard your prayers", data: null },
}), true);
assert.equal(isNuurManagedNotification({
  identifier: "first-release-uuid",
  content: { title: "🌙 Fajr Prayer", body: "It is time for Fajr in London", data: null },
}), true);
assert.equal(isNuurManagedNotification({
  identifier: "old-jummah-uuid",
  content: { title: "Jummah Mubarak 🕌", body: "Friday prayer begins soon", data: null },
}), true);
assert.equal(isNuurManagedNotification({
  identifier: "old-event-uuid",
  content: { title: "🌙 First Day of Ramadan", body: "أول يوم رمضان المبارك", data: null },
}), true);
assert.equal(isNuurManagedNotification({
  identifier: "streak-id",
  content: { title: "Prayer Streak 🕌", body: "Seven days", data: null },
}), false);
assert.equal(isNuurManagedNotification({
  identifier: "test-id",
  content: { title: "Nuur · Test Notification", body: "Diagnostic", data: { type: "test" } },
}), false);

const schedulerSource = await readFile(new URL("../utils/notifications.ts", import.meta.url), "utf8");
assert.match(schedulerSource, /await cancelManagedScheduledNotifications\(\);[\s\S]*scheduleNotificationAsync/, "old requests must be removed before replacements are created");
assert.match(schedulerSource, /buildManagedNotificationIdentifier\(kind, key, fireTimeMs\)/, "every prayer request must have a stable owned identifier");
assert.match(schedulerSource, /getAllScheduledNotificationsAsync/, "cleanup must discover requests after interrupted runs");
assert.doesNotMatch(schedulerSource, /cancelAllScheduledNotificationsAsync/, "prayer migration must preserve unrelated app alerts");
assert.match(schedulerSource, /remaining\.length > 0[\s\S]*throw new Error/, "replacement must stop if managed requests remain after cancellation");
assert.match(schedulerSource, /catch \(error\)[\s\S]*cancelManagedScheduledNotifications/, "partial schedules must be cleaned up after failure");

// Execute the real notifications.ts module against deterministic native mocks.
// This catches integration regressions that source-pattern checks cannot: an
// Expo UUID migration, two complete rebuilds, permission revocation, and
// failures during both cancellation and creation.
const runtimeRequire = createRequire(import.meta.url);
const NodeModule = runtimeRequire("node:module");
const originalLoad = NodeModule._load;
const storage = new Map([
  ["nuur_managed_notification_ids_v1", "[]"],
  ["notif_snooze_until", "0"],
  ["prayer_pre_reminder_minutes", "15"],
  ["notifications_enabled", "true"],
  ["location_data", JSON.stringify({ latitude: 21.4225, longitude: 39.8262, city: "Makkah", timezone: "Asia/Riyadh" })],
]);
const nativeQueue = new Map();
let permissionStatus = { status: "granted", canAskAgain: true };
let failedCancelId = null;
let schedulesUntilFailure = Number.POSITIVE_INFINITY;
let scheduleCalls = 0;
const notificationMock = {
  SchedulableTriggerInputTypes: { DATE: "date", TIME_INTERVAL: "timeInterval" },
  IosAuthorizationStatus: { NOT_DETERMINED: 0, DENIED: 1, AUTHORIZED: 2, PROVISIONAL: 3, EPHEMERAL: 4 },
  AndroidNotificationVisibility: { PUBLIC: "public" },
  AndroidImportance: { MAX: 5, HIGH: 4 },
  AndroidAudioUsage: { ALARM: 4 },
  AndroidAudioContentType: { MUSIC: 2 },
  setNotificationHandler() {},
  async getPermissionsAsync() { return permissionStatus; },
  async requestPermissionsAsync() { return permissionStatus; },
  async getAllScheduledNotificationsAsync() { return [...nativeQueue.values()]; },
  async cancelScheduledNotificationAsync(identifier) {
    if (identifier === failedCancelId) throw new Error("mock cancellation failure");
    nativeQueue.delete(identifier);
  },
  async scheduleNotificationAsync(request) {
    scheduleCalls += 1;
    if (schedulesUntilFailure <= 0) throw new Error("mock scheduling failure");
    schedulesUntilFailure -= 1;
    const identifier = request.identifier ?? `mock-${scheduleCalls}`;
    // Match the installed Expo iOS implementation: JS DATE input is converted
    // to UNTimeIntervalNotificationTrigger and read back with relative seconds.
    const date = request.trigger?.date;
    const nativeTrigger = date instanceof Date || typeof date === "number"
      ? {
          type: "timeInterval",
          repeats: false,
          seconds: ((date instanceof Date ? date.getTime() : date) - Date.now()) / 1000,
        }
      : request.trigger;
    nativeQueue.set(identifier, { ...request, identifier, trigger: nativeTrigger });
    return identifier;
  },
};
const storageMock = {
  async getItem(key) { return storage.get(key) ?? null; },
  async setItem(key, value) { storage.set(key, String(value)); },
  async removeItem(key) { storage.delete(key); },
  async multiSet(entries) { for (const [key, value] of entries) storage.set(key, String(value)); },
};
NodeModule._load = function(request, parent, isMain) {
  if (request === "expo-notifications") return notificationMock;
  if (request === "react-native") return { Platform: { OS: "ios" } };
  if (request === "@react-native-async-storage/async-storage") return storageMock;
  return originalLoad.call(this, request, parent, isMain);
};

let notificationRuntime;
try {
  notificationRuntime = runtimeRequire("../utils/notifications.ts");
} finally {
  NodeModule._load = originalLoad;
}

for (const identifier of ["legacy-expo-uuid-1", "legacy-expo-uuid-2"]) {
  nativeQueue.set(identifier, {
    identifier,
    content: {
      title: "Asr in 15 min",
      body: "Prepare for Asr prayer at 3:44 PM",
      data: { type: "prayer-pre-reminder", key: "asr" },
    },
    trigger: { type: "timeInterval", repeats: false, seconds: 2 * 60 * 60 },
  });
}
for (const [identifier, title, body] of [
  ["first-release-prayer", "🌙 Fajr Prayer", "It is time for Fajr in London"],
  ["first-release-jummah", "Jummah Mubarak 🕌", "Friday prayer begins soon"],
  ["first-release-event", "🌙 First Day of Ramadan", "أول يوم رمضان المبارك"],
]) {
  nativeQueue.set(identifier, {
    identifier,
    content: { title, body, data: {} },
    trigger: { type: "timeInterval", repeats: false, seconds: 3 * 60 * 60 },
  });
}
nativeQueue.set("unrelated-streak", {
  identifier: "unrelated-streak",
  content: { title: "Prayer Streak 🕌", body: "Seven days", data: {} },
  trigger: { type: "timeInterval", seconds: 1 },
});
for (let index = 0; index < 8; index += 1) {
  nativeQueue.set(`unrelated-${index}`, {
    identifier: `unrelated-${index}`,
    content: { title: `Independent reminder ${index}`, body: "Preserve me", data: {} },
    trigger: { type: "timeInterval", seconds: 60 + index },
  });
}

const beforeMigration = await notificationRuntime.readNotificationScheduleStatus();
assert.equal(beforeMigration.duplicateCount, 1, "diagnostics must reproduce the duplicate screenshot");

const scheduleArgs = [
  21.4225, 39.8262, "Asia/Riyadh", "Makkah",
  true, 30,
  true, 8, 0,
  true, 9, 0,
  true,
];
await notificationRuntime.schedulePrayerNotifications(...scheduleArgs);
assert.equal(nativeQueue.has("legacy-expo-uuid-1"), false);
assert.equal(nativeQueue.has("legacy-expo-uuid-2"), false);
assert.equal(nativeQueue.has("first-release-prayer"), false);
assert.equal(nativeQueue.has("first-release-jummah"), false);
assert.equal(nativeQueue.has("first-release-event"), false);
assert.equal(nativeQueue.has("unrelated-streak"), true, "migration must preserve unrelated alerts");

function managedRequests() {
  return [...nativeQueue.values()].filter((request) => request.content.data?.nuurManaged === true);
}
function logicalDuplicates(requests) {
  const seen = new Set();
  let duplicates = 0;
  for (const request of requests) {
    const data = request.content.data ?? {};
    const fire = Number(data.nuurFireTimeMs);
    const signature = `${data.type}|${data.key}|${fire}|${request.content.body ?? ""}`;
    if (seen.has(signature)) duplicates += 1;
    seen.add(signature);
  }
  return duplicates;
}

const firstManaged = managedRequests();
assert.ok(nativeQueue.size <= 64, "the managed iOS budget must account for preserved unrelated requests");
assert.ok(firstManaged.filter((request) => request.content.data?.type === "prayer").length >= 45);
assert.ok(firstManaged.some((request) => request.content.data?.type === "prayer-pre-reminder"));
for (const expectedType of [
  "prayer-pre-reminder",
  "jummah-reminder",
  "ayah-reminder",
  "hadith-reminder",
  "islamic-event",
]) {
  assert.ok(
    firstManaged.some((request) => request.content.data?.type === expectedType),
    `the iOS optional budget must reserve a fair slot for ${expectedType}`,
  );
}
for (const type of new Set(firstManaged.map((request) => request.content.data?.type))) {
  if (type === "prayer") continue;
  const times = firstManaged
    .filter((request) => request.content.data?.type === type)
    .map((request) => Number(request.content.data?.nuurFireTimeMs));
  assert.deepEqual(times, [...times].sort((left, right) => left - right), `${type} must be nearest-first`);
}
assert.equal(logicalDuplicates(firstManaged), 0);
const firstStatus = await notificationRuntime.readNotificationScheduleStatus();
assert.equal(firstStatus.duplicateCount, 0);
assert.ok(firstStatus.scheduledThrough, "diagnostics must recover the exact horizon from iOS trigger serialization");
const firstIdentifiers = new Set(firstManaged.map((request) => request.identifier));

await notificationRuntime.schedulePrayerNotifications(...scheduleArgs);
const secondManaged = managedRequests();
assert.equal(logicalDuplicates(secondManaged), 0, "a second full rebuild must not duplicate alerts");
assert.deepEqual(new Set(secondManaged.map((request) => request.identifier)), firstIdentifiers);

const snoozeUntil = Date.now() + 15 * 24 * 60 * 60_000;
storage.set("notif_snooze_until", String(snoozeUntil));
await notificationRuntime.schedulePrayerNotifications(...scheduleArgs);
assert.ok(managedRequests().length > 0, "longer-range optional alerts remain available after a snooze");
assert.ok(
  managedRequests().every((request) => Number(request.content.data?.nuurFireTimeMs) >= snoozeUntil),
  "app-wide snooze must suppress every managed notification category before its deadline",
);
storage.set("notif_snooze_until", "0");
await notificationRuntime.schedulePrayerNotifications(...scheduleArgs);

permissionStatus = { status: "denied", canAskAgain: false };
const queueBeforeRevocationCheck = nativeQueue.size;
assert.equal(await notificationRuntime.refreshPrayerNotificationsFromStorage({ force: true }), false);
assert.equal(nativeQueue.size, queueBeforeRevocationCheck, "revoked permission must not mutate the queue");
permissionStatus = { status: "granted", canAskAgain: true };

permissionStatus = { status: "undetermined", canAskAgain: true, ios: { status: 3 } };
assert.equal(await notificationRuntime.getNotificationPermissionState(), "granted", "iOS provisional authorization can deliver notifications");
permissionStatus = { status: "granted", canAskAgain: true };

// Foreground and headless refresh must both respect the persisted explicit
// Isha policy. Verify native request timestamps, not only calculator output.
storage.set("umm_al_qura_isha_policy", "fixed90");
await notificationRuntime.refreshPrayerNotificationsFromStorage({ force: true });
const ishaByDate = () => new Map(managedRequests()
  .filter(request => request.content.data?.type === "prayer" && request.content.data?.key === "isha")
  .map(request => {
    const fire = Number(request.content.data.nuurFireTimeMs);
    return [new Date(fire).toISOString().slice(0, 10), fire];
  }));
const ninetyMinuteIsha = ishaByDate();
storage.set("umm_al_qura_isha_policy", "fixed120");
await notificationRuntime.refreshPrayerNotificationsFromStorage({ force: true });
const twoHourIsha = ishaByDate();
assert.ok(ninetyMinuteIsha.size >= 9);
for (const [date, fire] of ninetyMinuteIsha) {
  assert.equal(twoHourIsha.get(date) - fire, 30 * 60_000, `${date}: persisted 120-minute Isha must update actual alert time`);
}
assert.equal(logicalDuplicates(managedRequests()), 0, "changing Isha policy must replace, not duplicate, alerts");
storage.delete("umm_al_qura_isha_policy");
await notificationRuntime.schedulePrayerNotifications(...scheduleArgs);

nativeQueue.set("cache-owned-opaque", {
  identifier: "cache-owned-opaque",
  content: { title: "Opaque old request", body: "No recognizable ownership payload", data: {} },
  trigger: { type: "timeInterval", repeats: false, seconds: 3600 },
});
storage.set("nuur_managed_notification_ids_v1", JSON.stringify([
  ...managedRequests().map((request) => request.identifier),
  "cache-owned-opaque",
]));
failedCancelId = "cache-owned-opaque";
const callsBeforeFailedCancel = scheduleCalls;
await assert.rejects(notificationRuntime.schedulePrayerNotifications(...scheduleArgs), /Could not remove/);
assert.equal(scheduleCalls, callsBeforeFailedCancel, "replacement must not start after a failed cancellation");
assert.equal(nativeQueue.has("cache-owned-opaque"), true, "verification must catch cached-only requests that failed to cancel");
failedCancelId = null;

await notificationRuntime.schedulePrayerNotifications(...scheduleArgs);
schedulesUntilFailure = 2;
await assert.rejects(notificationRuntime.schedulePrayerNotifications(...scheduleArgs), /mock scheduling failure/);
assert.equal(managedRequests().length, 0, "a partial schedule must be removed after creation failure");
assert.equal(nativeQueue.has("unrelated-streak"), true);
assert.equal(
  await notificationRuntime.getMillisSinceLastSchedule(),
  Number.POSITIVE_INFINITY,
  "a failed replacement must invalidate freshness so the next opportunity retries",
);

console.log("Notification scheduler QA passed with real module mocks for actual/pre priority, idempotent rebuilds, legacy migration, permissions, and failure cleanup.");
