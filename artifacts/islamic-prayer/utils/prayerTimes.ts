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

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
function fixAngle(a: number): number {
  return a - 360 * Math.floor(a / 360);
}
function fixHour(a: number): number {
  return a - 24 * Math.floor(a / 24);
}

function sunPosition(jd: number) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * Math.sin(toRad(g)) + 0.02 * Math.sin(toRad(2 * g)));
  const e = 23.439 - 0.00000036 * D;
  const RA = toDeg(Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(L)), Math.cos(toRad(L)))) / 15;
  const eqt = q / 15 - fixHour(RA);
  const decl = toDeg(Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(L))));
  return { eqt, decl };
}

function julianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function computePrayerTime(
  angle: number,
  lat: number,
  lng: number,
  decl: number,
  eqt: number,
  isRise: boolean
): number {
  const cosT = (Math.cos(toRad(angle)) - Math.sin(toRad(lat)) * Math.sin(toRad(decl))) /
    (Math.cos(toRad(lat)) * Math.cos(toRad(decl)));
  if (cosT < -1 || cosT > 1) return NaN;
  const T = (isRise ? -1 : 1) * toDeg(Math.acos(cosT)) / 15;
  return 12 - eqt - lng / 15 + T;
}

function asrTime(factor: number, lat: number, decl: number, eqt: number, lng: number): number {
  const G = toDeg(Math.atan(1 / (factor + Math.tan(toRad(Math.abs(lat - decl))))));
  return computePrayerTime(-G, lat, lng, decl, eqt, false);
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

  const jd = julianDate(year, month, day - timezone / 24);
  const { eqt, decl } = sunPosition(jd);

  const fajrHour = fixHour(computePrayerTime(18, lat, lng, decl, eqt, true) + timezone);
  const sunriseHour = fixHour(computePrayerTime(0.833, lat, lng, decl, eqt, true) + timezone);
  const dhuhrHour = fixHour(12 - eqt - lng / 15 + timezone);
  const asrHour = fixHour(asrTime(1, lat, decl, eqt, lng) + timezone);
  const maghribHour = fixHour(computePrayerTime(0.833, lat, lng, decl, eqt, false) + timezone);
  const ishaHour = fixHour(computePrayerTime(17, lat, lng, decl, eqt, false) + timezone);

  const toDate = (hour: number): Date => {
    if (isNaN(hour)) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const d = new Date(date);
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const formatTime = (d: Date): string => {
    try {
      let h = d.getHours();
      const m = d.getMinutes();
      if (isNaN(h) || isNaN(m)) return "--:--";
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
    } catch {
      return "--:--";
    }
  };

  const makePrayer = (name: string, arabicName: string, hour: number): PrayerTime => {
    const t = toDate(hour);
    return { name, arabicName, time: t, timeString: formatTime(t) };
  };

  return {
    fajr: makePrayer("Fajr", "الفجر", fajrHour),
    sunrise: makePrayer("Sunrise", "الشروق", sunriseHour),
    dhuhr: makePrayer("Dhuhr", "الظهر", dhuhrHour),
    asr: makePrayer("Asr", "العصر", asrHour),
    maghrib: makePrayer("Maghrib", "المغرب", maghribHour),
    isha: makePrayer("Isha", "العشاء", ishaHour),
    date,
  };
}

export function getNextPrayer(prayers: PrayerTimesResult): PrayerTime | null {
  const now = new Date();
  const prayerList: PrayerTime[] = [
    prayers.fajr,
    prayers.dhuhr,
    prayers.asr,
    prayers.maghrib,
    prayers.isha,
  ];
  for (const prayer of prayerList) {
    if (prayer.time > now) return prayer;
  }
  return null;
}

export function getTimeUntilPrayer(prayer: PrayerTime): string {
  const now = new Date();
  const diff = prayer.time.getTime() - now.getTime();
  if (diff <= 0) return "Now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
