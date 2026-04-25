import type { PrayerTimesResult } from "@/utils/prayerTimes";
import type { PrayerWindow, ShareContentKind, ShareThemeId } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
 * Auto-selection of the default share theme.
 *
 * Bias rules (in priority order):
 *   1. Adhkar bias  →  morning glow (rose) / starry night
 *   2. Time-of-day → window-specific theme
 *   3. Content kind → kind-specific default
 * ──────────────────────────────────────────────────────────────────────── */

/** Map a prayer name from the engine to our window enum. */
function nameToWindow(name: string | null | undefined): PrayerWindow | null {
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.includes("fajr")) return "fajr";
  if (n.includes("sunrise")) return "fajr";
  if (n.includes("dhuhr") || n.includes("zuhr")) return "dhuhr";
  if (n.includes("asr")) return "asr";
  if (n.includes("maghrib")) return "maghrib";
  if (n.includes("isha")) return "isha";
  return null;
}

/**
 * Determine the *current* prayer window from a `PrayerTimesResult`. Returns
 * which prayer window we are in *right now* — i.e. the most recently elapsed
 * adhan. Returns `null` before fajr (treated as fajr/dawn).
 */
export function getCurrentPrayerWindow(
  prayers: PrayerTimesResult | null | undefined,
  now: Date = new Date(),
): PrayerWindow | null {
  if (!prayers) return null;

  const t = now.getTime();
  const order: { window: PrayerWindow; time: Date }[] = [
    { window: "fajr",     time: prayers.fajr.time },
    { window: "dhuhr",    time: prayers.dhuhr.time },
    { window: "asr",      time: prayers.asr.time },
    { window: "maghrib",  time: prayers.maghrib.time },
    { window: "isha",     time: prayers.isha.time },
  ];

  // Walk in reverse — first prayer whose time is <= now wins.
  for (let i = order.length - 1; i >= 0; i--) {
    if (t >= order[i].time.getTime()) return order[i].window;
  }
  // Before fajr today → still treat as the prior night's isha window.
  return "isha";
}

/**
 * Pick the default share theme for a given content kind + current prayer
 * window. The mapping below was tuned with the user — quran defaults to
 * emerald, hadith to midnight, names/dua get window-driven biases.
 */
export function pickDefaultTheme(
  kind: ShareContentKind,
  window: PrayerWindow | null,
): ShareThemeId {
  // 1. Dua / Adhkar share cards are restricted to the painted-frame themes
  //    (frame01..frame06). Pick a default frame that fits the time of day.
  if (kind === "dua" || kind === "adhkar") {
    // Morning windows → cream / palm / sage panels (warm light).
    if (window === "fajr") return "frame01";
    if (window === "dhuhr") return "frame03";
    if (window === "asr") return "frame04";
    // Evening / night windows → deep-tone panels.
    if (window === "maghrib") return "frame02";
    if (window === "isha") return "frame05";
    return "frame01";
  }

  // 2. Time-of-day biases (mild) for the other kinds.
  const windowBias: Partial<Record<PrayerWindow, ShareThemeId>> = {
    fajr:    "rose",
    dhuhr:   "parchment",
    asr:     "sepia",
    maghrib: "midnight",
    isha:    "starry",
  };

  // 3. Per-kind default. We start from the kind default, then nudge towards
  //    the window bias for kinds where time-of-day genuinely matters.
  const kindDefault: Record<ShareContentKind, ShareThemeId> = {
    quran:  "emerald",
    hadith: "midnight",
    dua:    "frame01",   // unreachable — handled above, kept for completeness
    name:   "midnight",
    adhkar: "frame01",   // unreachable — handled above
  };

  const def = kindDefault[kind];
  if (window && windowBias[window]) {
    // Hadith reads great in either midnight or sepia → respect window.
    if (kind === "hadith" && window === "asr") return "sepia";
    // Quran in early-morning daylight reads best on parchment.
    if (kind === "quran" && window === "dhuhr") return "parchment";
    // Quran in evening looks gorgeous on starry sky.
    if (kind === "quran" && window === "isha") return "starry";
  }
  return def;
}

/** Public re-export for components that already have a window. */
export { nameToWindow as _nameToWindow };
