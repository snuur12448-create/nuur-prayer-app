import assert from "node:assert/strict";

import prayerTimesModule from "../utils/prayerTimes.ts";

const { calculatePrayerTimes } = prayerTimesModule;

const PRAYER_KEYS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
const LOCATIONS = [
  { name: "Tromsø", latitude: 69.6492, longitude: 18.9553 },
  { name: "Longyearbyen", latitude: 78.2232, longitude: 15.6469 },
  { name: "Utqiagvik", latitude: 71.2906, longitude: -156.7886 },
];

function isValid(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function assertAllTimesValid(result, context) {
  for (const key of PRAYER_KEYS) {
    assert.ok(isValid(result[key].time), `${context}: ${key} must be a valid Date`);
    assert.notEqual(result[key].timeString, "--:--", `${context}: ${key} must be displayable`);
  }
}

// Cover every day, including both polar seasons and the transition into and
// out of them. Both supported estimation opinions must always return usable
// values for the app, notifications, and widget cache.
for (const location of LOCATIONS) {
  for (const resolution of ["AqrabBalad", "AqrabYaum"]) {
    let fallbackDays = 0;
    let transitions = 0;
    let previousApplied = null;

    for (let day = 0; day < 365; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day, 12));
      const result = calculatePrayerTimes(
        location.latitude,
        location.longitude,
        0,
        date,
        "MoonsightingCommittee",
        "Shafi",
        "TwilightAngle",
        "24h",
        resolution,
      );
      assertAllTimesValid(result, `${location.name} ${date.toISOString().slice(0, 10)} ${resolution}`);

      const applied = result.polarFallback !== null;
      if (applied) {
        fallbackDays += 1;
        assert.equal(result.polarFallback.resolution, resolution);
      }
      if (previousApplied !== null && applied !== previousApplied) transitions += 1;
      previousApplied = applied;
    }

    assert.ok(fallbackDays > 0, `${location.name} ${resolution}: must exercise polar fallback`);
    assert.ok(transitions >= 2, `${location.name} ${resolution}: must cover entry and exit transitions`);
  }
}

// Users who select "No Estimate" should still see the library's unavailable
// values, making it explicit that they must follow their trusted timetable.
const unresolved = calculatePrayerTimes(
  69.6492, 18.9553, 2, new Date("2026-06-15T12:00:00Z"),
  "MoonsightingCommittee", "Shafi", "TwilightAngle", "24h", "Unresolved",
);
assert.equal(unresolved.polarFallback, null);
assert.ok(
  PRAYER_KEYS.some((key) => !isValid(unresolved[key].time)),
  "Tromsø polar summer must remain unavailable when estimation is disabled",
);

// The automatic fallback must be inert outside polar day/night.
const londonDate = new Date("2026-06-15T12:00:00Z");
const londonAutomatic = calculatePrayerTimes(
  51.5074, -0.1278, 1, londonDate,
  "MoonsightingCommittee", "Shafi", "TwilightAngle", "24h", "AqrabBalad",
);
const londonUnresolved = calculatePrayerTimes(
  51.5074, -0.1278, 1, londonDate,
  "MoonsightingCommittee", "Shafi", "TwilightAngle", "24h", "Unresolved",
);
assert.equal(londonAutomatic.polarFallback, null);
for (const key of PRAYER_KEYS) {
  assert.equal(londonAutomatic[key].time.getTime(), londonUnresolved[key].time.getTime());
}

console.log("Polar prayer-time QA passed for 3 Arctic locations across all of 2026.");
