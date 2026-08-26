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

const generatedLockWidget = await readFile(new URL("../ios/NuurWidget/NuurLockWidget.swift", import.meta.url), "utf8");
const replacementLockWidget = await readFile(new URL("../native/NuurWidget-replacements/NuurLockWidget.swift", import.meta.url), "utf8");
for (const [name, source] of [
  ["generated", generatedLockWidget],
  ["replacement", replacementLockWidget],
]) {
  assert.match(source, /36 \* 60 \* 60/, `${name} Lock Screen timeline must span the next night`);
  assert.match(source, /matching: DateComponents\(hour: 0/, `${name} Lock Screen timeline must include local midnight`);
  assert.match(source, /style: \.timer/, `${name} countdowns must advance without minute-by-minute reloads`);
}

console.log("Widget overnight QA passed for 35-day caches, midnight rollover, DST, and native 36-hour timelines.");
