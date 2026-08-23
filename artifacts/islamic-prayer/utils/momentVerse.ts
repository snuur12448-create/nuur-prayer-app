/**
 * Verse of the Moment — JS-side resolver for the home screen.
 *
 * Mirrors the Swift `VerseResolver` in `native/NuurShared/VerseOfMoment.swift`
 * and the content source of truth in `assets/data/verses-of-the-moment.json`,
 * with two differences:
 *   • Includes full English translation (the widget can't fit it).
 *   • Skips weather triggers (rain / thunderstorm / snow). The widget reads
 *     a cached WeatherKit condition from the App Group; the home screen has
 *     no equivalent cache to read, and we don't want to fetch weather just
 *     to pick the home-screen verse. Friday + late_night still apply.
 *
 * Output shape matches `DailyAyah` so it drops into the existing
 * VerseOfDayCard without further plumbing.
 */
import type { PrayerTimesResult } from "./prayerTimes";
import { civilPartsInTimeZone, dayOfWeekInTimeZone, type TimeZoneValue } from "./timeZone";
// Single source of truth — same JSON the widget mirrors into Swift. Edit the
// JSON to add/change verses; the Swift mirror in
// `native/NuurShared/VerseOfMoment.swift` must be updated to match (the
// widget extension can't do file I/O at render time, so it ships a
// compile-time copy of the same data).
import VERSES_JSON from "@/assets/data/verses-of-the-moment.json";

export type MomentWindow = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
// Weather triggers (rain/thunderstorm/snow) only fire on the widget — the
// home page doesn't fetch weather. Verses tagged with weather-only triggers
// are filtered out of the JS candidate set.
export type MomentTrigger = "friday" | "late_night";
const JS_TRIGGERS: ReadonlySet<string> = new Set<MomentTrigger>(["friday", "late_night"]);

export interface MomentVerse {
  id: string;
  windows: MomentWindow[];
  triggers: MomentTrigger[];
  priority: number;
  arabic: string;
  translation: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
}

export interface ResolvedMomentVerse extends MomentVerse {
  /** Active context label, e.g. "FAJR", "JUMU'AH", "NIGHT". */
  label: string;
}

// Parse the JSON into the shape the resolver expects. surahName is derived
// from the "reference" field (everything before " · ").
interface RawVerse {
  id: string;
  windows: string[];
  triggers: string[];
  priority: number;
  surah: number;
  ayah: number;
  reference: string;
  arabic: string;
  translation: string;
}
interface VersesFile { version: number; verses: RawVerse[] }

function parseVerse(v: RawVerse): MomentVerse {
  const surahName = v.reference.split(" · ")[0] ?? "";
  return {
    id: v.id,
    windows: v.windows as MomentWindow[],
    // Drop weather-only triggers so they're never considered on the home page.
    triggers: v.triggers.filter((t) => JS_TRIGGERS.has(t)) as MomentTrigger[],
    priority: v.priority,
    arabic: v.arabic,
    translation: v.translation,
    surahName,
    surahNumber: v.surah,
    ayahNumber: v.ayah,
  };
}

// All verses from the JSON whose triggers can fire in JS (either
// window-based or friday/late_night). Verses with ONLY weather triggers
// are excluded — the home page can never show them.
export const MOMENT_VERSES: MomentVerse[] = (VERSES_JSON as VersesFile).verses
  .filter((v) => v.windows.length > 0 || v.triggers.some((t) => JS_TRIGGERS.has(t)))
  .map(parseVerse);

// Output shape compatible with the existing VerseOfDayCard props.
export interface MomentAyah {
  arabic: string;
  translation: string;
  transliteration: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
}

const TRIGGER_LABELS: Record<MomentTrigger, string> = {
  friday: "JUMU'AH",
  late_night: "NIGHT",
};

/** Active triggers at `now` (JS-side: friday + late_night only). */
function activeTriggers(now: Date, timeZone?: TimeZoneValue): Set<MomentTrigger> {
  const active = new Set<MomentTrigger>();
  // Friday: getDay() returns 0 (Sun) … 5 (Fri) … 6 (Sat).
  if ((timeZone === undefined ? now.getDay() : dayOfWeekInTimeZone(now, timeZone)) === 5) active.add("friday");
  // Late night: 00:00–03:59 local.
  const hour = timeZone === undefined ? now.getHours() : civilPartsInTimeZone(now, timeZone).hour;
  if (hour < 4) active.add("late_night");
  return active;
}

/**
 * Current prayer window — defined as "which prayer should I be reflecting on
 * right now". Fajr is only the active window until Sunrise; the post-sunrise
 * morning rolls into the Dhuhr verse (closest approximation to Duha). If no
 * prayer times available, falls back to clock hour.
 */
function currentWindow(now: Date, pt?: PrayerTimesResult | null): MomentWindow {
  if (pt) {
    const t = now.getTime();
    if (t < pt.fajr.time.getTime())    return "isha";    // pre-dawn
    if (t < pt.sunrise.time.getTime()) return "fajr";    // fajr window
    if (t < pt.dhuhr.time.getTime())   return "dhuhr";   // post-sunrise → dhuhr
    if (t < pt.asr.time.getTime())     return "dhuhr";
    if (t < pt.maghrib.time.getTime()) return "asr";
    if (t < pt.isha.time.getTime())    return "maghrib";
    return "isha";
  }
  const h = now.getHours();
  if (h < 5)  return "isha";
  if (h < 7)  return "fajr";
  if (h < 15) return "dhuhr";
  if (h < 18) return "asr";
  if (h < 20) return "maghrib";
  return "isha";
}

function dayOfYear(d: Date, timeZone?: TimeZoneValue): number {
  const p = timeZone === undefined
    ? { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
    : civilPartsInTimeZone(d, timeZone);
  const start = Date.UTC(p.year, 0, 0);
  return Math.floor((Date.UTC(p.year, p.month - 1, p.day) - start) / 86_400_000);
}

function stableHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return h;
}

/**
 * Resolve which verse to show at `now`. Deterministic: same inputs → same
 * output. Ties at equal priority are broken by a stable hash of
 * (dayOfYear, verse.id) so equal-priority candidates don't flicker.
 */
export function resolveMomentVerse(
  now: Date,
  prayerTimes?: PrayerTimesResult | null,
  timeZone?: TimeZoneValue,
): ResolvedMomentVerse {
  const win = currentWindow(now, prayerTimes);
  const active = activeTriggers(now, timeZone);

  // Candidate set: contextual matches OR base verses for the current window.
  const candidates = MOMENT_VERSES.filter((v) => {
    if (v.triggers.length > 0) {
      return v.triggers.some((t) => active.has(t));
    }
    return v.windows.includes(win);
  });

  const day = dayOfYear(now, timeZone);
  const winner = candidates.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return stableHash(`${day}-${b.id}`) - stableHash(`${day}-${a.id}`);
  })[0]
    ?? MOMENT_VERSES.find((v) => v.triggers.length === 0 && v.windows.includes(win))
    ?? MOMENT_VERSES[0];

  // Label: first matching active trigger (alphabetical for determinism) or window.
  const triggerLabel = winner.triggers
    .filter((t) => active.has(t))
    .sort()[0];
  const label = triggerLabel ? TRIGGER_LABELS[triggerLabel] : win.toUpperCase();

  return { ...winner, label };
}

/** Convenience: resolve and convert to the DailyAyah shape used by VerseOfDayCard. */
export function getMomentAyah(
  now: Date = new Date(),
  prayerTimes?: PrayerTimesResult | null,
  timeZone?: TimeZoneValue,
): MomentAyah {
  const v = resolveMomentVerse(now, prayerTimes, timeZone);
  return {
    arabic: v.arabic,
    translation: v.translation,
    transliteration: "",
    surahName: v.surahName,
    surahNumber: v.surahNumber,
    ayahNumber: v.ayahNumber,
  };
}
