import assert from 'node:assert/strict';
import prayerModule from '../utils/prayerTimes.ts';
import policyModule from '../utils/ummAlQuraIsha.ts';
import widgetModule from '../utils/widgetPrayerSchedule.ts';
import zoneModule from '../utils/timeZone.ts';

const { calculatePrayerTimes, applyPrayerOffsets, DEFAULT_PRAYER_OFFSETS, CALC_METHODS } = prayerModule;
const { normalizeUmmAlQuraIshaPolicy, resolveUmmAlQuraIsha } = policyModule;
const { buildWidgetPrayerSchedule } = widgetModule;
const { dateForCivilDateInTimeZone } = zoneModule;
const zone = 'Asia/Riyadh';
const atNoon = (ymd, tz = zone) => dateForCivilDateInTimeZone(...ymd.split('-').map(Number), tz);
const calculate = (date, policy = 'calendar', method = 'UmmAlQura', polar = 'AqrabBalad') =>
  calculatePrayerTimes(21.4225, 39.8262, zone, atNoon(date), method, 'Shafi', 'TwilightAngle', '24h', polar, policy);
const interval = (times) => (times.isha.time.getTime() - times.maghrib.time.getTime()) / 60_000;

assert.equal(normalizeUmmAlQuraIshaPolicy(null), 'fixed90', 'migration must not silently change existing prayer times');
assert.equal(normalizeUmmAlQuraIshaPolicy('unknown'), 'fixed90');
assert.equal(normalizeUmmAlQuraIshaPolicy('calendar'), 'calendar');

// These are fixed ICU Umm al-Qura calendar vectors, not a claim that a local
// moon-sighting authority will use the same fasting dates. Isha uses the night
// beginning at sunset: first Ramadan eve included, Eid eve excluded.
for (const [ymd, expected] of [
  ['2025-02-27', 90], ['2025-02-28', 120], ['2025-03-28', 120], ['2025-03-29', 90],
  ['2026-02-16', 90], ['2026-02-17', 120], ['2026-03-18', 120], ['2026-03-19', 90],
]) {
  const times = calculate(ymd);
  assert.equal(interval(times), expected, `${ymd}: Isha night boundary`);
  assert.equal(times.ummAlQuraIsha.calendarStatus, 'used');
  assert.equal(times.ummAlQuraIsha.ramadanNight, expected === 120);
  const baseline = calculate(ymd, 'fixed90');
  for (const key of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib']) {
    assert.equal(times[key].time.getTime(), baseline[key].time.getTime(), `${ymd}: ${key} must be unchanged`);
  }
}

assert.equal(interval(calculate('2026-03-01', 'fixed90')), 90);
assert.equal(interval(calculate('2026-07-01', 'fixed120')), 120);
assert.equal(interval(calculatePrayerTimes(21.4225, 39.8262, zone, atNoon('2026-03-01'))), 90);
for (const { id: method } of CALC_METHODS.filter(method => method.id !== 'UmmAlQura')) {
  const normal = calculate('2026-03-01', 'fixed90', method);
  const selected = calculate('2026-03-01', 'fixed120', method);
  assert.equal(selected.isha.time.getTime(), normal.isha.time.getTime(), `${method} must ignore Umm al-Qura policy`);
  assert.equal(selected.ummAlQuraIsha, null);
}

const sameInstant = new Date('2026-02-16T10:30:00Z');
assert.equal(resolveUmmAlQuraIsha(sameInstant, 'Pacific/Kiritimati', 'calendar').intervalMinutes, 120);
assert.equal(resolveUmmAlQuraIsha(sameInstant, 'Pacific/Honolulu', 'calendar').intervalMinutes, 90);
assert.equal(resolveUmmAlQuraIsha(sameInstant, 14, 'calendar').intervalMinutes, 120);
assert.equal(resolveUmmAlQuraIsha(sameInstant, -10, 'calendar').intervalMinutes, 90);

const originalTZ = process.env.TZ;
try {
  const expected = calculate('2026-02-17').isha.time.getTime();
  for (const deviceZone of ['Pacific/Honolulu', 'Pacific/Kiritimati', 'America/New_York', 'Europe/London']) {
    process.env.TZ = deviceZone;
    assert.equal(calculate('2026-02-17').isha.time.getTime(), expected, `device zone ${deviceZone} must not change remote Isha`);
  }
} finally {
  if (originalTZ === undefined) delete process.env.TZ;
  else process.env.TZ = originalTZ;
}

for (const date of ['2026-03-07', '2026-03-08', '2026-03-09']) {
  const target = atNoon(date, 'America/New_York');
  const times = calculatePrayerTimes(40.7128, -74.006, 'America/New_York', target, 'UmmAlQura', 'Hanafi', 'TwilightAngle', '24h', 'AqrabBalad', 'calendar');
  assert.equal(interval(times), 120, 'DST must not change the elapsed Isha interval');
}

const raw = calculate('2026-03-01');
const offset = applyPrayerOffsets(raw, { ...DEFAULT_PRAYER_OFFSETS, maghrib: 3, isha: -7 }, zone, '24h');
assert.equal(offset.isha.time.getTime() - raw.isha.time.getTime(), -7 * 60_000);
assert.equal(offset.maghrib.time.getTime() - raw.maghrib.time.getTime(), 3 * 60_000);
assert.equal(interval(offset), 110, 'manual prayer offsets remain independent and additive');
assert.deepEqual(offset.ummAlQuraIsha, raw.ummAlQuraIsha);

for (const resolution of ['AqrabBalad', 'AqrabYaum']) {
  const times = calculatePrayerTimes(69.6492, 18.9553, 'Europe/Oslo', atNoon('2026-06-21', 'Europe/Oslo'), 'UmmAlQura', 'Shafi', 'TwilightAngle', '24h', resolution, 'fixed120');
  assert.equal(interval(times), 120);
  assert.ok(times.polarFallback?.applied);
}
const unresolved = calculatePrayerTimes(69.6492, 18.9553, 'Europe/Oslo', atNoon('2026-06-21', 'Europe/Oslo'), 'UmmAlQura', 'Shafi', 'TwilightAngle', '24h', 'Unresolved', 'fixed120');
assert.ok(Number.isNaN(unresolved.isha.time.getTime()), 'No Estimate must remain unavailable at polar night/day');

const days = buildWidgetPrayerSchedule({
  latitude: 21.4225, longitude: 39.8262, timezone: zone, startDate: atNoon('2026-02-16'), days: 3,
  calcMethod: 'UmmAlQura', madhab: 'Shafi', highLatRule: 'TwilightAngle', polarResolution: 'AqrabBalad',
  timeFormat: '24h', prayerOffsets: DEFAULT_PRAYER_OFFSETS, ummAlQuraIshaPolicy: 'calendar',
});
assert.deepEqual(days.map(day => (Date.parse(day.isha) - Date.parse(day.maghrib)) / 60_000), [90, 120, 120]);

// Simulate a runtime silently substituting Gregorian for an unsupported
// calendar. Never substitute the app's tabular Hijri calendar for this policy.
const NativeDateTimeFormat = Intl.DateTimeFormat;
try {
  Intl.DateTimeFormat = function(locale, options) {
    if (options?.calendar === 'islamic-umalqura') {
      return { resolvedOptions: () => ({ calendar: 'gregory' }) };
    }
    return new NativeDateTimeFormat(locale, options);
  };
  const unavailable = resolveUmmAlQuraIsha(atNoon('2026-03-01'), zone, 'calendar');
  assert.deepEqual(unavailable, { policy: 'calendar', intervalMinutes: 90, calendarStatus: 'unavailable', ramadanNight: null });
} finally {
  Intl.DateTimeFormat = NativeDateTimeFormat;
}

console.log('Umm al-Qura Isha QA passed: migration, Ramadan-night boundaries, manual overrides, travel zones, DST, offsets, polar estimates, widget cache, and unsupported calendar disclosure.');
