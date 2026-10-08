import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import prayerTimesModule from "../utils/prayerTimes.ts";
import timeZoneModule from "../utils/timeZone.ts";

const { calculatePrayerTimes } = prayerTimesModule;
const { civilPartsInTimeZone, dateForCivilDateInTimeZone } = timeZoneModule;

const FIXTURE_ROOT = new URL("../tests/fixtures/adhan-v4.4.3/", import.meta.url);
const FIXTURE_FILES = [
  "Ankara-Turkey.json",
  "Doha-Qatar.json",
  "Dubai-Gulf.json",
  "Kuwait City-Kuwait.json",
  "London-MoonsightingCommittee.json",
  "Makkah-UmmAlQura.json",
  "Singapore-Singapore.json",
  "Tehran-Tehran.json",
];
const FIXTURE_SHA256 = {
  "Ankara-Turkey.json": "fe2936ccb68715ab969b35d3c1685c3c5824c7a8ef11e8598759c2464bf21638",
  "Doha-Qatar.json": "dee4502f5addf059ac77227739ad98e9753f9c1ddc2259ef5f8cf849853b8008",
  "Dubai-Gulf.json": "54d47da3c7d104d16f021b288ca46b00510077cfd3f02d8c23d2fb20b488c029",
  "Kuwait City-Kuwait.json": "b0c5208795e8dc6e9a467af784351cbae08f1ca3eba6903e6e1b6d4ab3e7909b",
  "London-MoonsightingCommittee.json": "959ca817d8918f031485b720b1cb8040d4c64c2614702f6b3818be8016894bff",
  "Makkah-UmmAlQura.json": "d283f8a2b616e3ccdeef5d6b0df0b667a6ab309ca1868f1e70da1f99c2bbb2d6",
  "Singapore-Singapore.json": "873e3f0a5b0d83f0fd39c10c58d7f9c51e7b47f544be58b27448326451bd103f",
  "Tehran-Tehran.json": "6dcc82070c4324cbca01e204f426404e61ad4318882728e941af02492bc5cbf8",
};
const PRAYER_KEYS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

function parseCivilDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  assert.ok(match, `invalid fixture date: ${value}`);
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function parseClockMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})\s+(AM|PM)$/.exec(value);
  assert.ok(match, `invalid fixture clock: ${value}`);
  let hour = Number(match[1]) % 12;
  if (match[3] === "PM") hour += 12;
  return hour * 60 + Number(match[2]);
}

function actualClockMinutes(date, timezone) {
  const parts = civilPartsInTimeZone(date, timezone);
  return parts.hour * 60 + parts.minute;
}

function circularMinuteDifference(left, right) {
  const direct = Math.abs(left - right);
  return Math.min(direct, 24 * 60 - direct);
}

function appHighLatitudeRule(upstreamRule) {
  if (upstreamRule === "SeventhOfTheNight") return "SeventhOfNight";
  if (upstreamRule === "MiddleOfTheNight") return "MiddleOfNight";
  return "TwilightAngle";
}

let fixtureRows = 0;
let prayerAssertions = 0;
const failures = [];
for (const filename of FIXTURE_FILES) {
  const rawFixture = await readFile(new URL(filename, FIXTURE_ROOT));
  assert.equal(
    createHash("sha256").update(rawFixture).digest("hex"),
    FIXTURE_SHA256[filename],
    `${filename}: vendored fixture checksum changed`,
  );
  const fixture = JSON.parse(rawFixture.toString("utf8"));
  const {
    latitude,
    longitude,
    timezone,
    method,
    madhab,
    highLatitudeRule,
  } = fixture.params;
  const variance = fixture.variance || 0;

  assert.ok(
    (typeof fixture.source === "string" && fixture.source.trim().length > 0) ||
      (Array.isArray(fixture.source) && fixture.source.length > 0),
    `${filename}: source is required`,
  );
  assert.ok(Array.isArray(fixture.times) && fixture.times.length > 0, `${filename}: times are required`);

  for (const expected of fixture.times) {
    const { year, month, day } = parseCivilDate(expected.date);
    const inputDate = dateForCivilDateInTimeZone(year, month, day, timezone);
    const actual = calculatePrayerTimes(
      latitude,
      longitude,
      timezone,
      inputDate,
      method,
      madhab,
      appHighLatitudeRule(highLatitudeRule),
      "24h",
      "AqrabBalad",
    );

    for (const prayer of PRAYER_KEYS) {
      const expectedMinutes = parseClockMinutes(expected[prayer]);
      const actualMinutes = actualClockMinutes(actual[prayer].time, timezone);
      const difference = circularMinuteDifference(actualMinutes, expectedMinutes);
      if (difference > variance) {
        failures.push(
          `${filename} ${expected.date} ${prayer}: expected ${expected[prayer]} ±${variance}m, got ${actual[prayer].timeString} (Δ${difference}m)`,
        );
      }
      prayerAssertions += 1;
    }
    fixtureRows += 1;
  }
}

assert.equal(FIXTURE_FILES.length, 8);
assert.equal(fixtureRows, 462);
assert.equal(prayerAssertions, 2772);
assert.equal(
  failures.length,
  0,
  `Prayer reference mismatches (${failures.length}):\n${failures.slice(0, 40).join("\n")}`,
);

console.log(
  `Prayer reference QA passed: ${FIXTURE_FILES.length} upstream files, ${fixtureRows} dated rows, ${prayerAssertions} prayer comparisons.`,
);
