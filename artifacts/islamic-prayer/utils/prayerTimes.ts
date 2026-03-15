import {
  Coordinates,
  CalculationMethod,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
} from 'adhan';

export interface PrayerTime {
  name: string;
  arabicName: string;
  time: Date;
  timeString: string;
}

export interface PrayerTimesResult {
  fajr: PrayerTime;
  sunrise: PrayerTime;
  dhuhr: PrayerTime;
  asr: PrayerTime;
  maghrib: PrayerTime;
  isha: PrayerTime;
  date: Date;
}

/**
 * Format a UTC Date using the target location's UTC offset.
 * adhan returns absolute UTC timestamps, so we offset manually for display
 * rather than relying on the browser's local timezone (which may differ from
 * the prayer location).
 */
function fmtWithTz(d: Date, tz: number): string {
  if (!d || isNaN(d.getTime())) return '--:--';
  const totalMins = d.getUTCHours() * 60 + d.getUTCMinutes() + Math.round(tz * 60);
  const h24 = ((Math.floor(totalMins / 60)) % 24 + 24) % 24;
  const m = ((totalMins % 60) + 60) % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const hh = h24 % 12 || 12;
  return `${hh}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function calculatePrayerTimes(
  lat: number,
  lng: number,
  timezone: number,
  date: Date = new Date()
): PrayerTimesResult {
  const coordinates = new Coordinates(lat, lng);

  // NorthAmerica (ISNA) base: Fajr 15°, Isha 15°
  // Fajr angle raised to 15.5° — matches UK mosque timetables (e.g. 4:39 for London mid-March)
  // HighLatitudeRule.TwilightAngle prevents invalid times in summer at high latitudes
  const params = CalculationMethod.NorthAmerica();
  params.madhab = Madhab.Shafi;
  params.fajrAngle = 15.5;
  params.highLatitudeRule = HighLatitudeRule.TwilightAngle;

  const pt = new PrayerTimes(coordinates, date, params);

  const mk = (name: string, arabic: string, d: Date): PrayerTime => ({
    name,
    arabicName: arabic,
    time: d,
    timeString: fmtWithTz(d, timezone),
  });

  return {
    fajr:    mk('Fajr',    'الفجر',  pt.fajr),
    sunrise: mk('Sunrise', 'الشروق', pt.sunrise),
    dhuhr:   mk('Dhuhr',   'الظهر',  pt.dhuhr),
    asr:     mk('Asr',     'العصر',  pt.asr),
    maghrib: mk('Maghrib', 'المغرب', pt.maghrib),
    isha:    mk('Isha',    'العشاء', pt.isha),
    date,
  };
}

export function getNextPrayer(prayers: PrayerTimesResult): PrayerTime | null {
  const now = new Date();
  const list = [prayers.fajr, prayers.dhuhr, prayers.asr, prayers.maghrib, prayers.isha];
  for (const p of list) {
    if (p.time > now) return p;
  }
  return null;
}

export function getTimeUntilPrayer(prayer: PrayerTime): string {
  const diff = prayer.time.getTime() - Date.now();
  if (diff <= 0) return 'Now';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
