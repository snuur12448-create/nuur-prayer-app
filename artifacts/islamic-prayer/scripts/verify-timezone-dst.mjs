import assert from "node:assert/strict";

import prayerTimesModule from "../utils/prayerTimes.ts";
import calcMethodModule from "../utils/calcMethodByCountry.ts";
import timeZoneModule from "../utils/timeZone.ts";
import widgetScheduleModule from "../utils/widgetPrayerSchedule.ts";

const { calculatePrayerTimes, DEFAULT_CALC_METHOD } = prayerTimesModule;
const { suggestCalcMethod } = calcMethodModule;
const {
  dateByAddingDaysInTimeZone,
  dateKeyInTimeZone,
  dayOfWeekInTimeZone,
  formatTimeInTimeZone,
  timeZoneAtCoordinates,
  timeZoneOffsetHours,
} = timeZoneModule;
const { buildWidgetPrayerSchedule } = widgetScheduleModule;

assert.equal(timeZoneAtCoordinates(51.5074, -0.1278), "Europe/London");
assert.equal(timeZoneAtCoordinates(40.7128, -74.006), "America/New_York");

assert.equal(timeZoneOffsetHours("Europe/London", new Date("2026-01-15T12:00:00Z")), 0);
assert.equal(timeZoneOffsetHours("Europe/London", new Date("2026-07-15T12:00:00Z")), 1);
assert.equal(timeZoneOffsetHours("America/New_York", new Date("2026-01-15T12:00:00Z")), -5);
assert.equal(timeZoneOffsetHours("America/New_York", new Date("2026-07-15T12:00:00Z")), -4);

assert.equal(formatTimeInTimeZone(new Date("2026-03-29T00:30:00Z"), "Europe/London", "24h"), "00:30");
assert.equal(formatTimeInTimeZone(new Date("2026-03-29T01:30:00Z"), "Europe/London", "24h"), "02:30");
assert.equal(formatTimeInTimeZone(new Date("2026-10-25T00:30:00Z"), "Europe/London", "24h"), "01:30");
assert.equal(formatTimeInTimeZone(new Date("2026-10-25T01:30:00Z"), "Europe/London", "24h"), "01:30");

const springDays = Array.from({ length: 5 }, (_, offset) =>
  dateByAddingDaysInTimeZone(new Date("2026-03-27T12:00:00Z"), "Europe/London", offset),
);
assert.deepEqual(
  springDays.map((date) => dateKeyInTimeZone(date, "Europe/London")),
  ["2026-03-27", "2026-03-28", "2026-03-29", "2026-03-30", "2026-03-31"],
);
assert.equal(springDays[1].getTime() - springDays[0].getTime(), 86_400_000);
assert.equal(springDays[2].getTime() - springDays[1].getTime(), 82_800_000);

const londonSchedule = buildWidgetPrayerSchedule({
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: "Europe/London",
  startDate: new Date("2026-10-23T12:00:00Z"),
  days: 5,
  calcMethod: "MoonsightingCommittee",
  madhab: "Shafi",
  highLatRule: "TwilightAngle",
  polarResolution: "AqrabBalad",
  timeFormat: "24h",
  prayerOffsets: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
});
assert.deepEqual(
  londonSchedule.map((day) => day.dateKey),
  ["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27"],
);
for (const day of londonSchedule) {
  for (const key of ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]) {
    assert.ok(!Number.isNaN(new Date(day[key]).getTime()), `${day.dateKey} ${key} must be valid`);
  }
}

const londonPrayer = calculatePrayerTimes(
  51.5074,
  -0.1278,
  "Europe/London",
  new Date("2026-07-15T23:30:00-07:00"),
  "MoonsightingCommittee",
  "Shafi",
  "TwilightAngle",
  "24h",
  "AqrabBalad",
);
assert.equal(dateKeyInTimeZone(londonPrayer.dhuhr.time, "Europe/London"), "2026-07-16");
assert.equal(dayOfWeekInTimeZone(londonPrayer.dhuhr.time, "Europe/London"), 4);

// The no-location fallback is Makkah, so it must use Saudi Arabia's Umm
// al-Qura convention rather than Nuur's UK convention. These fixed instants
// protect the release from accidental method/timezone drift.
assert.equal(DEFAULT_CALC_METHOD, "UmmAlQura");
assert.equal(suggestCalcMethod("SA"), "UmmAlQura");
const makkahFixture = calculatePrayerTimes(
  21.4225,
  39.8262,
  "Asia/Riyadh",
  new Date("2026-01-15T12:00:00Z"),
  DEFAULT_CALC_METHOD,
  "Shafi",
  "TwilightAngle",
  "24h",
  "AqrabBalad",
);
assert.deepEqual(
  ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"].map((key) => makkahFixture[key].time.toISOString()),
  [
    "2026-01-15T02:41:00.000Z",
    "2026-01-15T04:01:00.000Z",
    "2026-01-15T09:30:00.000Z",
    "2026-01-15T12:38:00.000Z",
    "2026-01-15T14:59:00.000Z",
    "2026-01-15T16:29:00.000Z",
  ],
);

// Legacy snapshots remain readable while startup migrates them to IANA IDs.
assert.equal(formatTimeInTimeZone(new Date("2026-07-15T12:05:00Z"), 1, "24h"), "13:05");

console.log("Timezone/DST QA passed for spring-forward, fall-back, remote locations, and widget caches.");
