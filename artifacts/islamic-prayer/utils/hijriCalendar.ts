// ── Hijri (Tabular / Kuwaiti algorithm) ↔ Gregorian conversion ────────────────

export const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah",
];

export const HIJRI_MONTHS_AR = [
  "مُحَرَّم", "صَفَر", "رَبِيع الأَوَّل", "رَبِيع الثَّانِي",
  "جُمَادَى الأُولَى", "جُمَادَى الآخِرَة", "رَجَب", "شَعْبَان",
  "رَمَضَان", "شَوَّال", "ذُو الْقَعْدَة", "ذُو الْحِجَّة",
];

/** Convert a Hijri date to a Julian Day Number using the tabular algorithm. */
export function hijriToJD(year: number, month: number, day: number): number {
  return (
    Math.floor((11 * year + 3) / 30) +
    354 * year +
    30 * month -
    Math.floor((month - 1) / 2) +
    day +
    1948440 -
    385
  );
}

/** Convert a Julian Day Number to a JS Date (UTC midnight). */
export function jdToDate(JD: number): Date {
  // JD 2440588 = Unix epoch 1970-01-01 00:00 UTC
  return new Date((JD - 2440588) * 86400000);
}

/** How many days are in a given Hijri month? (29 or 30) */
export function getDaysInHijriMonth(year: number, month: number): number {
  const jd1 = hijriToJD(year, month, 1);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const jd2 = hijriToJD(nextYear, nextMonth, 1);
  return jd2 - jd1;
}

/**
 * What day of the week (0=Sun … 6=Sat) does the 1st of a Hijri month fall on?
 */
export function getFirstWeekdayOfHijriMonth(year: number, month: number): number {
  const date = jdToDate(hijriToJD(year, month, 1));
  return date.getUTCDay();
}

/** Convert a Gregorian JS Date to {hYear, hMonth, hDay}. */
export function gregorianToHijri(date: Date): { hYear: number; hMonth: number; hDay: number } {
  const JD = Math.floor(date.getTime() / 86400000) + 2440588;
  const L = JD - 1948440 + 10632;
  const N = Math.floor((L - 1) / 10631);
  const LL = L - 10631 * N + 354;
  const J =
    Math.floor((10985 - LL) / 5316) * Math.floor((50 * LL) / 17719) +
    Math.floor(LL / 5670) * Math.floor((43 * LL) / 15238);
  const LL2 =
    LL -
    Math.floor((30 - J) / 15) * Math.floor((17719 * J) / 50) -
    Math.floor(J / 16) * Math.floor((15238 * J) / 43) +
    29;
  const hMonth = Math.floor((24 * LL2) / 709);
  const hDay = LL2 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * N + J - 30;
  return { hYear, hMonth, hDay };
}

// ── Islamic events ─────────────────────────────────────────────────────────────

export interface IslamicEvent {
  name: string;
  arabic: string;
  /** accent colour override (optional) */
  color?: string;
}

interface RawEvent {
  month: number;
  day: number;
  name: string;
  arabic: string;
  color?: string;
}

const RAW_EVENTS: RawEvent[] = [
  { month: 1,  day: 1,  name: "Islamic New Year",        arabic: "رأس السنة الهجرية",        color: "#C9933A" },
  { month: 1,  day: 10, name: "Day of Ashura",           arabic: "يوم عاشوراء",              color: "#6BAF92" },
  { month: 3,  day: 12, name: "Mawlid al-Nabi ﷺ",       arabic: "المولد النبوي الشريف",      color: "#C9933A" },
  { month: 7,  day: 27, name: "Laylat al-Mi'raj",        arabic: "ليلة المعراج",              color: "#9C88D4" },
  { month: 8,  day: 15, name: "Laylat al-Bara'ah",       arabic: "ليلة البراءة",              color: "#6BAF92" },
  { month: 9,  day: 1,  name: "First Day of Ramadan",    arabic: "أول يوم رمضان المبارك",    color: "#C9933A" },
  { month: 9,  day: 21, name: "Possible Laylatul Qadr",  arabic: "ليلة القدر المحتملة",      color: "#E8D88A" },
  { month: 9,  day: 23, name: "Possible Laylatul Qadr",  arabic: "ليلة القدر المحتملة",      color: "#E8D88A" },
  { month: 9,  day: 25, name: "Possible Laylatul Qadr",  arabic: "ليلة القدر المحتملة",      color: "#E8D88A" },
  { month: 9,  day: 27, name: "Possible Laylatul Qadr",  arabic: "ليلة القدر المحتملة",      color: "#E8D88A" },
  { month: 9,  day: 29, name: "Possible Laylatul Qadr",  arabic: "ليلة القدر المحتملة",      color: "#E8D88A" },
  { month: 10, day: 1,  name: "Eid ul-Fitr",             arabic: "عيد الفطر المبارك",        color: "#C9933A" },
  { month: 12, day: 9,  name: "Day of Arafah",           arabic: "يوم عرفة",                 color: "#6BAF92" },
  { month: 12, day: 10, name: "Eid ul-Adha",             arabic: "عيد الأضحى المبارك",       color: "#C9933A" },
];

/**
 * Returns a Map from Hijri day → IslamicEvent for the given Hijri month/year.
 * Days that have no event are absent from the map.
 */
export function getIslamicEventsForMonth(
  hYear: number,
  hMonth: number
): Map<number, IslamicEvent> {
  const map = new Map<number, IslamicEvent>();
  for (const e of RAW_EVENTS) {
    if (e.month === hMonth) {
      map.set(e.day, { name: e.name, arabic: e.arabic, color: e.color });
    }
  }
  return map;
}

// ── Helper: short Gregorian month/year label for a Hijri month ─────────────────

/** Returns a string like "Mar–Apr 2026" showing which Gregorian months overlap. */
export function hijriMonthToGregorianRange(hYear: number, hMonth: number): string {
  const firstDay = jdToDate(hijriToJD(hYear, hMonth, 1));
  const lastDay = jdToDate(
    hijriToJD(hYear, hMonth, getDaysInHijriMonth(hYear, hMonth))
  );
  const opts: Intl.DateTimeFormatOptions = { month: "short" };
  const firstLabel = firstDay.toLocaleDateString("en-US", { ...opts, year: "numeric", timeZone: "UTC" });
  if (
    firstDay.getUTCMonth() === lastDay.getUTCMonth() &&
    firstDay.getUTCFullYear() === lastDay.getUTCFullYear()
  ) {
    return firstLabel;
  }
  const lastLabel = lastDay.toLocaleDateString("en-US", { ...opts, year: "numeric", timeZone: "UTC" });
  return `${firstDay.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}–${lastLabel}`;
}
