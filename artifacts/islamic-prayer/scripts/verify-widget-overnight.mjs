import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import timeZoneModule from "../utils/timeZone.ts";
import widgetScheduleModule from "../utils/widgetPrayerSchedule.ts";

const { dateKeyInTimeZone } = timeZoneModule;
const {
  buildWidgetPrayerSchedule,
  widgetScheduleValidThrough,
  WIDGET_CACHE_EXPIRY_GRACE_MS,
  WIDGET_PRAYER_CACHE_DAYS,
} = widgetScheduleModule;
const execFileAsync = promisify(execFile);

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

const springValidThrough = widgetScheduleValidThrough(spring);
assert.ok(springValidThrough, "a non-empty prayer cache must have an expiry boundary");
assert.equal(
  springValidThrough,
  new Date(new Date(spring.at(-1).isha).getTime() + WIDGET_CACHE_EXPIRY_GRACE_MS).toISOString(),
  "cache expiry must be final Isha plus the T-0 grace period",
);
assert.equal(widgetScheduleValidThrough([]), undefined, "an empty cache must not claim validity");

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
  countdownReplacement: await swift("../native/NuurShared/CountdownText.swift"),
  large: await swift("../ios/NuurWidget/DailyCompanionLarge.swift"),
  largeReplacement: await swift("../native/NuurShared/DailyCompanionLarge.swift"),
  freshness: await swift("../ios/NuurWidget/WidgetFreshness.swift"),
  freshnessReplacement: await swift("../native/NuurShared/WidgetFreshness.swift"),
  liveActivity: await swift("../ios/NuurWidget/NuurWidgetLiveActivity.swift"),
  project: await swift("../ios/Nuur.xcodeproj/project.pbxproj"),
};

assert.equal(
  sources.freshness,
  sources.freshnessReplacement,
  "compiled and canonical countdown/expiry helpers must stay identical",
);

function synchronizedTargetExceptions(targetName) {
  const escapedTarget = targetName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = sources.project.match(new RegExp(
    `Exceptions for \\"NuurWidget\\" folder in \\"${escapedTarget}\\" target \\*\\/ = \\{` +
    `[\\s\\S]*?membershipExceptions = \\(([\\s\\S]*?)\\);`,
  ));
  assert.ok(match, `NuurWidget synchronized-group exceptions for ${targetName} must exist`);
  return new Set([...match[1].matchAll(/^\s+([^,]+),$/gm)].map((entry) => entry[1]));
}

const mainTargetWidgetMembers = synchronizedTargetExceptions("Nuur");
const widgetTargetExclusions = synchronizedTargetExceptions("NuurWidgetExtension");
for (const helper of ["CountdownText.swift", "WidgetFreshness.swift"]) {
  assert.ok(
    mainTargetWidgetMembers.has(helper),
    `${helper} must compile in the Nuur target with the shared Live Activity sources`,
  );
  assert.ok(
    !widgetTargetExclusions.has(helper),
    `${helper} must compile in NuurWidgetExtension`,
  );
}

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
  assert.match(source, /requiresRefresh/, `${name} must render an explicit exhausted-cache state`);
  assert.match(source, /snapshotHasExpired/, `${name} must stop using an expired cache`);
}
for (const [name, source] of [
  ["generated lock", sources.lockGenerated],
  ["replacement lock", sources.lockReplacement],
]) {
  assert.match(source, /7 \* 24 \* 60 \* 60/, `${name} timeline must preload seven days`);
  assert.match(source, /matching: DateComponents\(hour: 0/, `${name} timeline must include local midnight`);
  assert.match(source, /style: \.timer/, `${name} countdowns must move without reloads`);
  assert.match(source, /requiresRefresh/, `${name} must render an explicit exhausted-cache state`);
  assert.match(source, /lockHasExpired/, `${name} must stop using an expired cache`);
}
for (const [name, source] of [
  ["generated adhkar", sources.adhkarGenerated],
  ["replacement adhkar", sources.adhkarReplacement],
]) {
  assert.match(source, /date\(byAdding: \.day, value: 7/, `${name} timeline must preload seven days`);
  assert.match(source, /for raw in \[day\.fajr, day\.asr\]/, `${name} must preload both daily window changes`);
  assert.match(source, /persisted\.dateISO == dateKey/, `${name} must reset future-day completion state`);
  assert.match(source, /Open Nuur to refresh/, `${name} must disclose an exhausted cache`);
  assert.match(source, /adhkarHasExpired/, `${name} must stop deriving windows from an expired cache`);
}
assert.match(sources.timetable, /date\(byAdding: \.day, value: 7/, "timetable must preload seven days");
assert.match(sources.timetable, /matching: DateComponents\(hour: 0/, "timetable must roll at local midnight");
assert.match(sources.timetable, /requiresRefresh/, "timetable must render an explicit exhausted-cache state");
assert.match(sources.timetable, /ttHasExpired/, "timetable must stop using an expired cache");
assert.match(sources.squareGenerated, /entry\.requiresRefresh/, "square widget must render exhausted-cache state");
assert.match(sources.squareReplacement, /entry\.requiresRefresh/, "replacement square widget must render exhausted-cache state");
assert.match(sources.qiblaGenerated, /6 \* 3600/, "qibla must periodically re-read shared location data");
assert.match(sources.qiblaReplacement, /6 \* 3600/, "replacement qibla must periodically re-read shared location data");

// Medium, large, square, and Lock Screen countdowns must animate from the
// system clock between sparse timeline entries.
for (const [name, source] of [
  ["medium", sources.countdown],
  ["replacement medium", sources.countdownReplacement],
  ["large", sources.large],
  ["replacement large", sources.largeReplacement],
  ["square", sources.squareGenerated],
  ["replacement square", sources.squareReplacement],
]) {
  assert.match(source, /timerInterval:/, `${name} countdown must use a system timer`);
  assert.match(
    source,
    /nuurCountdownInterval\(to: target\)/,
    `${name} countdown must clamp equal and past targets`,
  );
  assert.doesNotMatch(
    source,
    /Date\(\)\s*\.\.\.\s*target/,
    `${name} countdown must not create a reversed ClosedRange`,
  );
}

assert.match(sources.liveActivity, /DynamicIsland/, "Live Activity must retain Dynamic Island coverage");

async function verifySwiftFreshnessRuntime() {
  if (process.platform !== "darwin") return false;

  const workingDirectory = await mkdtemp(join(tmpdir(), "nuur-widget-freshness-"));
  try {
    const mainPath = join(workingDirectory, "main.swift");
    const executablePath = join(workingDirectory, "widget-freshness-test");
    const moduleCachePath = join(workingDirectory, "module-cache");
    await writeFile(mainPath, `
import Foundation

let now = Date(timeIntervalSince1970: 1_000)
let future = Date(timeIntervalSince1970: 2_000)
let past = Date(timeIntervalSince1970: 500)

let futureRange = nuurCountdownInterval(to: future, now: now)
precondition(futureRange.lowerBound == now && futureRange.upperBound == future)

let equalRange = nuurCountdownInterval(to: now, now: now)
precondition(equalRange.lowerBound == now && equalRange.upperBound == now)

let pastRange = nuurCountdownInterval(to: past, now: now)
precondition(pastRange.lowerBound == now && pastRange.upperBound == now)

precondition(!nuurSnapshotHasExpired(validThrough: now, at: now))
precondition(nuurSnapshotHasExpired(validThrough: now, at: future))
precondition(!nuurSnapshotHasExpired(validThrough: nil, at: future))
`);

    await execFileAsync("xcrun", [
      "swiftc",
      fileURLToPath(new URL("../ios/NuurWidget/WidgetFreshness.swift", import.meta.url)),
      mainPath,
      "-o",
      executablePath,
    ], {
      env: {
        ...process.env,
        CLANG_MODULE_CACHE_PATH: moduleCachePath,
        SWIFT_MODULECACHE_PATH: moduleCachePath,
      },
    });
    await execFileAsync(executablePath);
    return true;
  } finally {
    await rm(workingDirectory, { recursive: true, force: true });
  }
}

const testedSwiftRuntime = await verifySwiftFreshnessRuntime();

console.log(
  "Widget family QA passed: 35-day/DST cache, 11 bundle entries, all 6 WidgetFamily sizes, " +
  "three circular variants, seven-day timelines, safe system-clock countdowns, T-0 rollover, " +
  `and cache-expiry states${testedSwiftRuntime ? " (Swift boundary runtime verified)" : ""}.`,
);
