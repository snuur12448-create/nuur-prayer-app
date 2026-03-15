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

const PI = Math.PI;
const sin = (d: number) => Math.sin(d * PI / 180);
const cos = (d: number) => Math.cos(d * PI / 180);
const tan = (d: number) => Math.tan(d * PI / 180);
const arctan = (x: number) => Math.atan(x) * 180 / PI;
const arcsin = (x: number) => Math.asin(x) * 180 / PI;
const arccos = (x: number) => Math.acos(x) * 180 / PI;
const fixHour = (h: number) => h - 24 * Math.floor(h / 24);
const fixAngle = (a: number) => a - 360 * Math.floor(a / 360);
const dtr = (d: number) => d * PI / 180;

function julianDay(year: number, month: number, day: number, tz = 0): number {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5 - tz / 24;
}

function sunEquation(jd: number): { decl: number; eqt: number } {
  const D = jd - 2451545;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = Math.atan2(cos(e) * sin(L), cos(L)) * 180 / PI / 15;
  const eqt = q / 15 - fixHour(RA);
  const decl = arcsin(sin(e) * sin(L));
  return { decl, eqt };
}

/**
 * Compute the hour angle from solar noon.
 * angle: positive = sun below horizon (depression); negative = sun above horizon (altitude).
 * Follows the PrayTimes.org convention: cosVal = (-sin(angle) - sin(lat)*sin(decl)) / (cos(lat)*cos(decl))
 */
function hourAngle(angle: number, lat: number, decl: number): number {
  const cosVal =
    (-sin(angle) - sin(lat) * sin(decl)) /
    (cos(lat) * cos(decl));
  if (cosVal < -1 || cosVal > 1) return NaN;
  return arccos(cosVal) / 15;
}

export function calculatePrayerTimes(
  lat: number,
  lng: number,
  timezone: number,
  date: Date = new Date()
): PrayerTimesResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = julianDay(year, month, day, timezone);
  const { decl, eqt } = sunEquation(jd);

  // Solar noon in UTC
  const noon = 12 - eqt - lng / 15;

  // Hour angles (hours before/after solar noon)
  const fajrHA    = hourAngle(18, lat, decl);     // 18° depression (MWL method)
  const sunriseHA = hourAngle(0.833, lat, decl);  // 0.833° for refraction
  const asrAngle  = -arctan(1 / (1 + tan(Math.abs(lat - decl)))); // Hanafi=2, Shafi=1
  const asrHA     = hourAngle(asrAngle, lat, decl);
  const maghribHA = hourAngle(0.833, lat, decl);  // same as sunset
  const ishaHA    = hourAngle(17, lat, decl);     // 17° depression (MWL method)

  const toLocal = (base: number, ha: number, isRise: boolean) =>
    fixHour(base + timezone + (isRise ? -ha : ha));

  const fajrHour    = toLocal(noon, fajrHA, true);
  const sunriseHour = toLocal(noon, sunriseHA, true);
  const dhuhrHour   = fixHour(noon + timezone);
  const asrHour     = toLocal(noon, asrHA, false);
  const maghribHour = toLocal(noon, maghribHA, false);
  const ishaHour    = toLocal(noon, ishaHA, false);

  const toDate = (hour: number): Date => {
    const d = new Date(date);
    if (isNaN(hour)) { d.setHours(0, 0, 0, 0); return d; }
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60) % 60;
    d.setHours(h, m, 0, 0);
    return d;
  };

  const fmt = (d: Date): string => {
    const h = d.getHours();
    const m = d.getMinutes();
    if (isNaN(h) || isNaN(m)) return "--:--";
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = h % 12 || 12;
    return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const mk = (name: string, arabic: string, hour: number): PrayerTime => {
    const t = toDate(hour);
    return { name, arabicName: arabic, time: t, timeString: fmt(t) };
  };

  return {
    fajr:    mk("Fajr",    "الفجر",  fajrHour),
    sunrise: mk("Sunrise", "الشروق", sunriseHour),
    dhuhr:   mk("Dhuhr",   "الظهر",  dhuhrHour),
    asr:     mk("Asr",     "العصر",  asrHour),
    maghrib: mk("Maghrib", "المغرب", maghribHour),
    isha:    mk("Isha",    "العشاء", ishaHour),
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
  if (diff <= 0) return "Now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
