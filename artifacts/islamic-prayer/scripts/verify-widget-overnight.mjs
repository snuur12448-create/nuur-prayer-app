import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import timeZoneModule from "../utils/timeZone.ts";
import widgetScheduleModule from "../utils/widgetPrayerSchedule.ts";

const { dateKeyInTimeZone } = timeZoneModule;
const { buildWidgetPrayerSchedule, WIDGET_PRAYER_CACHE_DAYS } = widgetScheduleModule;

const input = {
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: "Europe/London",
  days: WIDGET_PRAYER_CACHE_DAYS,
  calcMethod: "MoonsightingCommittee",
  madhab: "Shafi",
  highLatRule: "TwilightAngle",
  polarResolution: "AqrabBalad",
  timeFormat: "24h",
  prayerOffsets: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
};

function build(startDate) {
  return buildWidgetPrayerSchedule({ ...input, startDate });
}

function slots(schedule) {
  return schedule
    .flatMap((day) => ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"].map((prayer) => ({
      prayer,
      dateKey: day.dateKey,
      date: new Date(day[prayer]),
    })))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function nextSlot(after, schedule) {
  return slots(schedule).find((slot) => slot.date > after);
}

const spring = build(new Date("2026-03-27T12:00:00Z"));
assert.equal(spring.length, 35, "widget cache must cover five full weeks");
assert.deepEqual(
  spring.slice(0, 5).map((day) => day.dateKey),
  ["2026-03-27", "2026-03-28", "2026-03-29", "2026-03-30", "2026-03-31"],
  "spring-forward must not skip or repeat a local date",
);
assert.equal(spring.at(-1)?.dateKey, "2026-04-30");
assert.equal(new Set(spring.map((day) => day.dateKey)).size, spring.length);

for (const day of spring) {
  for (const prayer of ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]) {
    const instant = new Date(day[prayer]);
    assert.ok(!Number.isNaN(instant.getTime()), `${day.dateKey} ${prayer} must be valid`);
    assert.equal(
      dateKeyInTimeZone(instant, input.timezone),
      day.dateKey,
      `${day.dateKey} ${prayer} must stay on its intended local date`,
    );
  }
}

const firstIsha = new Date(spring[0].isha);
const afterIsha = new Date(firstIsha.getTime() + 1_000);
const overnight = nextSlot(afterIsha, spring);
assert.equal(overnight?.prayer, "fajr");
assert.equal(overnight?.dateKey, "2026-03-28", "after Isha the widget must advance to tomorrow's Fajr");

const afterDstMidnight = new Date("2026-03-29T23:30:00Z"); // 00:30 BST on 30 March
assert.equal(dateKeyInTimeZone(afterDstMidnight, input.timezone), "2026-03-30");
const afterMidnightSlot = nextSlot(afterDstMidnight, spring);
assert.equal(afterMidnightSlot?.prayer, "fajr");
assert.equal(afterMidnightSlot?.dateKey, "2026-03-30");

const fall = build(new Date("2026-10-23T12:00:00Z"));
assert.deepEqual(
  fall.slice(0, 5).map((day) => day.dateKey),
  ["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27"],
  "fall-back must not skip or repeat a local date",
);
assert.equal(fall.at(-1)?.dateKey, "2026-11-26");

async function swift(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), "utf8");
}

const sources = {
  bundle: await swift("../ios/NuurWidget/NuurWidgetBundle.swift"),
  mainGenerated: await swift("../ios/NuurWidget/NuurWidget.swift"),
  mainReplacement: await swift("../native/NuurWidget-replacements/NuurWidget.swift"),
  squareGenerated: await swift("../ios/NuurWidget/NuurSquareWidget.swift"),
  squareReplacement: await swift("../native/NuurWidget-replacements/NuurSquareWidget.swift"),
  qiblaGenerated: await swift("../ios/NuurWidget/NuurQiblaWidget.swift"),
  qiblaReplacement: await swift("../native/NuurWidget-replacements/NuurQiblaWidget.swift"),
  adhkarGenerated: await swift("../ios/NuurWidget/NuurAdhkarWidget.swift"),
  adhkarReplacement: await swift("../native/NuurWidget-replacements/NuurAdhkarWidget.swift"),
  timetable: await swift("../native/NuurWidget-replacements/NuurTimetableWidget.swift"),
  lockGenerated: await swift("../ios/NuurWidget/NuurLockWidget.swift"),
  lockReplacement: await swift("../native/NuurWidget-replacements/NuurLockWidget.swift"),
  countdown: await swift("../ios/NuurWidget/CountdownText.swift"),
  large: await swift("../ios/NuurWidget/DailyCompanionLarge.swift"),
  liveActivity: await swift("../ios/NuurWidget/NuurWidgetLiveActivity.swift"),
};

// Keep this explicit: adding/removing a widget kind must be an intentional QA
// change, not something silently missed by an overnight test.
const registeredWidgets = [...sources.bundle.matchAll(/^\s+(Nuur\w+)\(\)\s*$/gm)]
  .map((match) => match[1]);
assert.deepEqual(registeredWidgets, [
  "NuurWidget",
  "NuurSquareWidget",
  "NuurQiblaWidget",
  "NuurAdhkarWidget",
  "NuurTimetableWidget",
  "NuurLockInlineWidget",
  "NuurLockRectWidget",
  "NuurLockCircularCountdownWidget",
  "NuurLockCircularTimeWidget",
  "NuurLockCircularProgressWidget",
  "NuurWidgetLiveActivity",
]);

const familyChecks = [
  ["main", sources.mainGenerated, /\.supportedFamilies\(\[\.systemMedium, \.systemLarge\]\)/],
  ["square", sources.squareGenerated, /\.supportedFamilies\(\[\.systemSmall\]\)/],
  ["qibla", sources.qiblaGenerated, /\.supportedFamilies\(\[\.systemSmall\]\)/],
  ["adhkar", sources.adhkarGenerated, /\.supportedFamilies\(\[\.systemMedium\]\)/],
  ["timetable", sources.timetable, /\.supportedFamilies\(\[\.systemMedium\]\)/],
  ["lock inline", sources.lockGenerated, /\.supportedFamilies\(\[\.accessoryInline\]\)/],
  ["lock rectangular", sources.lockGenerated, /\.supportedFamilies\(\[\.accessoryRectangular\]\)/],
];
for (const [name, source, pattern] of familyChecks) {
  assert.match(source, pattern, `${name} family declaration must remain covered`);
}
assert.equal(
  (sources.lockGenerated.match(/\.supportedFamilies\(\[\.accessoryCircular\]\)/g) ?? []).length,
  3,
  "all three circular Lock Screen widgets must remain registered",
);

for (const [name, source] of [
  ["generated main", sources.mainGenerated],
  ["replacement main", sources.mainReplacement],
]) {
  assert.match(source, /7 \* 24 \* 60 \* 60/, `${name} timeline must preload seven days`);
  assert.match(source, /\[-30, -10, 0, 5\]/, `${name} must preload urgency and prayer boundaries`);
  assert.match(source, /\$0\.date >= now/, `${name} must preserve the exact T-0 prayer state`);
  assert.match(source, /date\(bySettingHour: 4/, `${name} must rotate late-night verse state at 04:00`);
}
for (const [name, source] of [
  ["generated lock", sources.lockGenerated],
  ["replacement lock", sources.lockReplacement],
]) {
  assert.match(source, /7 \* 24 \* 60 \* 60/, `${name} timeline must preload seven days`);
  assert.match(source, /matching: DateComponents\(hour: 0/, `${name} timeline must include local midnight`);
  assert.match(source, /style: \.timer/, `${name} countdowns must move without reloads`);
}
for (const [name, source] of [
  ["generated adhkar", sources.adhkarGenerated],
  ["replacement adhkar", sources.adhkarReplacement],
]) {
  assert.match(source, /date\(byAdding: \.day, value: 7/, `${name} timeline must preload seven days`);
  assert.match(source, /for raw in \[day\.fajr, day\.asr\]/, `${name} must preload both daily window changes`);
  assert.match(source, /persisted\.dateISO == dateKey/, `${name} must reset future-day completion state`);
}
assert.match(sources.timetable, /date\(byAdding: \.day, value: 7/, "timetable must preload seven days");
assert.match(sources.timetable, /matching: DateComponents\(hour: 0/, "timetable must roll at local midnight");
assert.match(sources.qiblaGenerated, /6 \* 3600/, "qibla must periodically re-read shared location data");
assert.match(sources.qiblaReplacement, /6 \* 3600/, "replacement qibla must periodically re-read shared location data");

// Medium, large, square, and Lock Screen countdowns must animate from the
// system clock between sparse timeline entries.
assert.match(sources.countdown, /timerInterval:/, "medium countdown must use a system timer");
assert.match(sources.large, /timerInterval:/, "large countdown must use a system timer");
assert.match(sources.squareGenerated, /timerInterval:/, "square countdown must use a system timer");
assert.match(sources.squareReplacement, /timerInterval:/, "replacement square countdown must use a system timer");

assert.match(sources.liveActivity, /DynamicIsland/, "Live Activity must retain Dynamic Island coverage");

console.log(
  "Widget family QA passed: 35-day/DST cache, 11 bundle entries, all 6 WidgetFamily sizes, " +
  "three circular variants, seven-day timelines, system-clock countdowns, and T-0 rollover.",
);
