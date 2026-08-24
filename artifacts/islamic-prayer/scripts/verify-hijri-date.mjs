import assert from "node:assert/strict";
import islamicData from "../utils/islamicData.ts";

const { getIslamicDateForDate } = islamicData;

const expected = { day: 10, month: "Rabi al-Awwal", year: 1448 };
const localMidnight = new Date(2026, 7, 24, 0, 0, 0);
const localMidday = new Date(2026, 7, 24, 12, 0, 0);
const lateEvening = new Date(2026, 7, 24, 23, 59, 59);

assert.deepEqual(getIslamicDateForDate(localMidnight), expected);
assert.deepEqual(getIslamicDateForDate(localMidday), expected);
assert.deepEqual(getIslamicDateForDate(lateEvening), expected);

const nextDay = getIslamicDateForDate(new Date(2026, 7, 25, 0, 0, 0));
assert.deepEqual(nextDay, { day: 11, month: "Rabi al-Awwal", year: 1448 });

console.log("Hijri civil-date checks passed.");
