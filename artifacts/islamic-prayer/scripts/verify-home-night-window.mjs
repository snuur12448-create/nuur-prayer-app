import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { buildHomeNightWindow } = require("../utils/homeNightWindow.ts");
const { calculatePrayerTimes, applyPrayerOffsets, DEFAULT_PRAYER_OFFSETS } = require("../utils/prayerTimes.ts");
const { dateForCivilDateInTimeZone, dateByAddingDaysInTimeZone, formatTimeInTimeZone } = require("../utils/timeZone.ts");
const zone = "Europe/London";
const offsets = { ...DEFAULT_PRAYER_OFFSETS, fajr: 2, sunrise: -1, maghrib: 1, isha: 3 };
const calculate = date => applyPrayerOffsets(calculatePrayerTimes(51.5074, -0.1278, zone,
  date, "MoonsightingCommittee", "Shafi", "TwilightAngle", "24h", "AqrabBalad", "fixed90"), offsets, zone, "24h");
const day = value => calculate(dateForCivilDateInTimeZone(...value.split("-").map(Number), zone));
const windowFor = (today, now) => buildHomeNightWindow(today, Date.parse(now),
  offset => calculate(dateByAddingDaysInTimeZone(dateForCivilDateInTimeZone(
    today.date.getFullYear(), today.date.getMonth() + 1, today.date.getDate(), zone), zone, offset)),
  date => formatTimeInTimeZone(date, zone, "24h"));

// Render derivation without mounting React or touching device services.
const Module = require("node:module");
const originalLoad = Module._load;
Module._load = function(name, parent, isMain) {
  if (name === "react") return { useMemo: fn => fn(), useState: value => [value, () => {}], useEffect: () => {} };
  if (name === "react-native") return { Platform: { OS: "web", select: choices => choices.web ?? choices.default }, AccessibilityInfo: {} };
  if (name === "expo-haptics") return {};
  return originalLoad.apply(this, arguments);
};
let useSkyState;
try { ({ useSkyState } = require("../components/home/useSkyState.ts")); }
finally { Module._load = originalLoad; }

for (const [todayDate, tomorrowDate, evening, morning] of [
  ["2026-10-08", "2026-10-09", "2026-10-08T21:48:00Z", "2026-10-09T00:30:00Z"],
  ["2026-10-24", "2026-10-25", "2026-10-24T21:48:00Z", "2026-10-25T03:30:00Z"], // autumn DST
  ["2026-03-28", "2026-03-29", "2026-03-28T22:48:00Z", "2026-03-29T01:30:00Z"], // spring DST
]) {
  const today = day(todayDate);
  const tomorrow = day(tomorrowDate);
  const originalToday = JSON.stringify(today);
  const beforeMidnight = windowFor(today, evening);
  const afterMidnight = windowFor(tomorrow, morning);
  assert.ok(beforeMidnight && afterMidnight);
  assert.notEqual(today.fajr.timeString, tomorrow.fajr.timeString, "fixture must expose changing dawn labels");
  for (const key of ["maghrib", "isha", "fajr", "sunrise", "lastThird"]) {
    assert.equal(beforeMidnight[key].time.getTime(), afterMidnight[key].time.getTime(), `${todayDate}: ${key} must not jump at midnight`);
    assert.equal(beforeMidnight[key].timeString, afterMidnight[key].timeString);
  }
  assert.equal(beforeMidnight.maghrib.time.getTime(), today.maghrib.time.getTime());
  assert.equal(beforeMidnight.isha.time.getTime(), today.isha.time.getTime());
  assert.equal(beforeMidnight.fajr.time.getTime(), tomorrow.fajr.time.getTime());
  assert.equal(beforeMidnight.sunrise.time.getTime(), tomorrow.sunrise.time.getTime());
  assert.notEqual(beforeMidnight.sunrise.time.getTime(), today.sunrise.time.getTime() + 86_400_000, "no fixed-day sunrise approximation");
  assert.equal(JSON.stringify(today), originalToday, "night model must not mutate today's tracker inputs");
  let previousAngle = -180;
  for (const [prayerTimes, nightWindow, instant] of [[today, beforeMidnight, evening], [tomorrow, afterMidnight, morning]]) {
    const sky = useSkyState({ prayerTimes, nightWindow, currentPrayer: nightWindow.isha,
      nextPrayer: nightWindow.fajr, nowMs: Date.parse(instant), isNight: true, W: 390, cy: 298, R: 138, cx: 195 });
    for (const key of ["maghrib", "isha", "fajr", "sunrise", "lastThird"]) {
      assert.equal(sky.nightArcPrayers.find(anchor => anchor.id === key).time, nightWindow[key].timeString, `${key} arc must use the exact night label`);
    }
    assert.equal(sky.nightPrayers.find(anchor => anchor.id === "fajr").time, tomorrow.fajr.timeString);
    assert.equal(sky.nightArcPrayers.find(anchor => anchor.id === "fajr").status, "next");
    assert.ok(sky.nightBodyDeg > previousAngle, "night progress moves forward across midnight");
    previousAngle = sky.nightBodyDeg;
  }
}

const originalTZ = process.env.TZ;
try {
  let expected;
  for (const deviceZone of ["Europe/London", "Pacific/Honolulu", "Pacific/Kiritimati", "Asia/Tokyo"]) {
    process.env.TZ = deviceZone;
    const selectedNight = windowFor(day("2026-10-08"), "2026-10-08T21:48:00Z");
    const values = ["maghrib", "isha", "fajr", "sunrise", "lastThird"].map(key => [selectedNight[key].time.getTime(), selectedNight[key].timeString]);
    if (!expected) expected = values;
    else assert.deepEqual(values, expected, `remote London night must ignore device zone ${deviceZone}`);
  }
} finally {
  if (originalTZ === undefined) delete process.env.TZ;
  else process.env.TZ = originalTZ;
}

const source = async path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const home = await source("components/HomeV2.tsx");
assert.match(home, /const endStr = progressEndPrayer\?\.timeString/, "Isha end and countdown must share the exact target");
assert.match(home, /nightWindow\?\.sunrise\.timeString/);
assert.match(home, /<EarlierTodayStrip[\s\S]*?prayerTimes=\{prayerTimes\}/, "tracker strip still receives today's schedule");
assert.doesNotMatch(home, /24 \* 3600/);
const sky = await source("components/home/useSkyState.ts");
assert.doesNotMatch(sky, /24 \* 3600|intoWin/);
const screen = await source("app/(tabs)/index.tsx");
assert.match(screen, /next = nightWindow\?\.fajr/);
assert.match(screen, /dateForCivilDateInTimeZone\(prayerTimes\.date\.getFullYear\(\)/);
assert.match(screen, /nightWindow\?\.lastThird\.timeString/);
assert.match(screen, /adjacentDate, calcMethod, madhab, highLatRule, timeFormat, polarResolution, ummAlQuraIshaPolicy/);
console.log("Home night QA passed: exact London dawn, evening/midnight continuity, both DST changes, offsets, sky labels, Isha target and unchanged tracker inputs.");
