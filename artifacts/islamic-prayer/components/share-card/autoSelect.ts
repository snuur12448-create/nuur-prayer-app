import type { PrayerTimesResult } from "@/utils/prayerTimes";

import { themeIdFor } from "./themes";
import type { PrayerWindow, ShareContentKind, ShareThemeId, ShareVariant } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
 * Auto-selection of the default premium share variant.
 *
 * Each kind has 4 variants (V1..V4). The default variant is biased by
 * the current prayer window so the card matches the time of day:
 *
 *   • Fajr / Sunrise   → V1 (warm light, soft cream)
 *   • Dhuhr            → V4 (bright, golden)
 *   • Asr              → V3 (cooler, late-day)
 *   • Maghrib          → V2 (twilight, deeper saturation)
 *   • Isha             → V2 / V3 (deep night)
 *
 * Falls back to V1 when no prayer-window context is available.
 * ──────────────────────────────────────────────────────────────────────── */

function nameToWindow(name: string | null | undefined): PrayerWindow | null {
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.includes("fajr") || n.includes("sunrise")) return "fajr";
  if (n.includes("dhuhr") || n.includes("zuhr")) return "dhuhr";
  if (n.includes("asr")) return "asr";
  if (n.includes("maghrib")) return "maghrib";
  if (n.includes("isha")) return "isha";
  return null;
}

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

  for (let i = order.length - 1; i >= 0; i--) {
    if (t >= order[i].time.getTime()) return order[i].window;
  }
  return "isha";
}

function defaultVariantForWindow(window: PrayerWindow | null): ShareVariant {
  switch (window) {
    case "fajr":    return 1;
    case "dhuhr":   return 4;
    case "asr":     return 3;
    case "maghrib": return 2;
    case "isha":    return 2;
    default:        return 1;
  }
}

export function pickDefaultTheme(
  kind: ShareContentKind,
  window: PrayerWindow | null,
): ShareThemeId {
  return themeIdFor(kind, defaultVariantForWindow(window));
}

export { nameToWindow as _nameToWindow };
