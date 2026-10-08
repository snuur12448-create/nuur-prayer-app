import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { alertHealth, notificationSoundHealth, widgetHealth } = require("../utils/healthStatus.ts");
const { readWithDeadline } = require("../utils/readWithDeadline.ts");
const now = Date.UTC(2026, 9, 8, 12);
const future = (days) => new Date(now + days * 86400000).toISOString();
const alerts = { permission: "granted", configuredEnabled: true, actualPrayerCount: 45,
  duplicateCount: 0, nextPrayerAt: future(0.1), scheduledThrough: future(9), error: null };
assert.equal(alertHealth(alerts, now).level, "good");
assert.equal(alertHealth({ ...alerts, duplicateCount: 1 }, now).level, "warning");
assert.equal(alertHealth({ ...alerts, permission: "blocked" }, now).level, "warning");
assert.equal(alertHealth({ ...alerts, configuredEnabled: false, actualPrayerCount: 0, preReminderCount: 0 }, now).level, "notice");
assert.equal(alertHealth({ ...alerts, configuredEnabled: false }, now).level, "warning", "requests left after disabling alerts must not look fully off");
assert.equal(alertHealth({ ...alerts, actualPrayerCount: 0 }, now).level, "warning");
assert.equal(alertHealth({ ...alerts, nextPrayerAt: future(-1) }, now).level, "warning");
assert.equal(alertHealth({ ...alerts, scheduledThrough: future(0.5) }, now).level, "warning");
assert.equal(alertHealth({ ...alerts, error: "native queue unavailable" }, now).level, "warning");
assert.equal(alertHealth(null, now).level, "warning");
assert.equal(alertHealth({ ...alerts, nextPrayerAt: "invalid" }, now).level, "warning");
assert.equal(alertHealth({ ...alerts, scheduledThrough: "invalid" }, now).level, "warning");
assert.equal(alertHealth({ ...alerts, nextPrayerAt: future(12) }, now).level, "warning");
const widget = { available: true, generatedAt: future(-1), validThrough: future(34), prayerDayCount: 35 };
assert.equal(widgetHealth(widget, now).level, "good");
assert.match(widgetHealth(widget, now).message, /not the time iOS last rendered/);
assert.equal(widgetHealth({ ...widget, available: false }, now).level, "notice");
for (const patch of [{ generatedAt: null }, { prayerDayCount: 0 }, { validThrough: future(-1) },
  { validThrough: future(0.5) }, { generatedAt: future(1) }, { generatedAt: "invalid" },
  { prayerDayCount: -1 }, { prayerDayCount: NaN }, { prayerDayCount: 0.5 },
  { generatedAt: future(-2), validThrough: future(-3) }]) {
  assert.equal(widgetHealth({ ...widget, ...patch }, now).level, "warning");
}
assert.equal(widgetHealth(null, now).level, "warning");
assert.match(notificationSoundHealth({ granted: false, provisional: false, allowsSound: true }), /not granted/, "denial must override stale sound subfields");
assert.match(notificationSoundHealth({ granted: false, provisional: true, allowsSound: true }), /quietly/);
assert.match(notificationSoundHealth({ granted: true, provisional: false, allowsSound: false }), /disabled/);
assert.match(notificationSoundHealth({ granted: true, provisional: false, allowsSound: true }), /Silent Mode and Focus/);
assert.match(notificationSoundHealth(null), /Could not check/);
assert.equal(await readWithDeadline(async () => "success", 30), "success");
await assert.rejects(readWithDeadline(() => { throw new Error("native read unavailable"); }, 30), /native read unavailable/);
await assert.rejects(readWithDeadline(async () => { throw new Error("denied"); }, 30), /denied/);
let finishLate;
const delayed = readWithDeadline(() => new Promise(resolve => { finishLate = resolve; }), 5);
await assert.rejects(delayed, /timed out/);
finishLate("old result");
await assert.rejects(delayed, /timed out/, "late native completion must not replace a timed-out read");
assert.equal(await readWithDeadline(async () => "retried", 30), "retried");
const source = async path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const screen = await source("app/health.tsx");
assert.match(screen, /readWithDeadline\(readNotificationScheduleStatus\)/);
assert.match(screen, /readWithDeadline\(readWidgetDiagnostics\)/);
assert.match(screen, /AppState\.addEventListener\("change"/);
assert.match(screen, /subscription\.remove\(\)/);
assert.match(screen, /accessibilityState=\{\{ disabled: busy, busy \}\}/);
const layout = await source("app/_layout.tsx");
assert.match(layout, /DataRecoveryGate><ReadyApp/);
assert.doesNotMatch(layout, /setOnboardingDone\(true\); \/\/ fail open/);
assert.match(layout, /readWithDeadline\(\(\) => Promise\.all/);
assert.match(layout, /Retry loading saved settings/);
assert.match(layout, /<ErrorBoundary onError=.*SplashScreen\.hideAsync/);
assert.equal((layout.match(/<SafeAreaProvider>/g) ?? []).length, 1);
assert.ok(layout.indexOf('if (onboardingDone === null || notifRitualDone === null) {') < layout.indexOf('<QueryClientProvider'), "startup error/pending must gate provider mount");
console.log("Health/startup QA passed: denial, invalid caches, read timeout/retry/late results, foreground refresh, and startup failure gates.");
