import React from "react";
import { AccessibilityInfo, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { SKY } from "./constants";

export function skyFor(name?: string | null) {
  if (!name) return SKY.dhuhr;
  return SKY[name.toLowerCase()] ?? SKY.dhuhr;
}

export function horizonOf(grad: string[]): string {
  return grad[grad.length - 1];
}

export function formatHm(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── Color helpers (hex ↔ rgb, mix) ──────────────────────────────────────────
export function hexToRgb(h: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h.trim());
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
export function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}
export function mixGradient(a: string[], b: string[], t: number): string[] {
  const n = Math.min(a.length, b.length);
  return Array.from({ length: n }, (_, i) => mixHex(a[i], b[i], t));
}

/**
 * Time-of-day twilight blending. Within ±20 min of Sunrise / Maghrib we
 * smoothly cross-fade between adjacent SKY palettes so the sky doesn't snap
 * between phases. Returns the blended gradient + the "warmth" amount used to
 * intensify the sun's glow at the horizon.
 */
const TWILIGHT_MS = 20 * 60 * 1000;
export function blendedSky(curName: string | null, nowMs: number, ptSunriseMs: number | null, ptMaghribMs: number | null) {
  const base = skyFor(curName);
  if (!curName || !ptSunriseMs || !ptMaghribMs) return { grad: base, twilight: 0 };
  const lower = curName.toLowerCase();
  // Sunrise window: Fajr(left) ↔ Sunrise(centre) ↔ Dhuhr(right)
  const dSr = nowMs - ptSunriseMs;
  if (Math.abs(dSr) <= TWILIGHT_MS && (lower === "fajr" || lower === "sunrise" || lower === "dhuhr")) {
    if (dSr <= 0) {
      const t = 1 + dSr / TWILIGHT_MS; // 0→1 as we approach sunrise
      return { grad: mixGradient(SKY.fajr, SKY.sunrise, t), twilight: t };
    }
    const t = dSr / TWILIGHT_MS;
    return { grad: mixGradient(SKY.sunrise, SKY.dhuhr, t), twilight: 1 - t };
  }
  // Maghrib window: Asr(left) ↔ Maghrib(centre) ↔ Isha(right)
  const dMg = nowMs - ptMaghribMs;
  if (Math.abs(dMg) <= TWILIGHT_MS && (lower === "asr" || lower === "maghrib" || lower === "isha")) {
    if (dMg <= 0) {
      const t = 1 + dMg / TWILIGHT_MS;
      return { grad: mixGradient(SKY.asr, SKY.maghrib, t), twilight: t };
    }
    const t = dMg / TWILIGHT_MS;
    return { grad: mixGradient(SKY.maghrib, SKY.isha, t), twilight: 1 - t };
  }
  return { grad: base, twilight: 0 };
}

export function useReduceMotion(): boolean {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => mounted && setReduce(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (v) => mounted && setReduce(!!v));
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);
  return reduce;
}

export function tapHaptic(kind: "selection" | "light" = "selection") {
  if (Platform.OS === "web") return;
  try {
    if (kind === "light") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else void Haptics.selectionAsync();
  } catch {
    /* haptics unavailable */
  }
}

// Deterministic star field for the dome (denser at night).
export function buildStars(boost: number, w: number, cy: number) {
  const n = Math.round(14 * boost);
  return Array.from({ length: n }, (_, i) => ({
    x: (i * 47) % w,
    y: 10 + ((i * 13.7) % (cy - 30)),
    r: 1.0 + (i % 3 === 0 ? 0.4 : 0),
    o: 0.35 + (i % 3) * 0.18,
  }));
}

export function timeFractionOfDay(now: number, sunriseMs: number, sunsetMs: number) {
  if (sunsetMs <= sunriseMs) return 0.5;
  return Math.max(0, Math.min(1, (now - sunriseMs) / (sunsetMs - sunriseMs)));
}

export function timeFractionOfNight(now: number, startMs: number, endMs: number) {
  if (endMs <= startMs) return 0.5;
  return Math.max(0, Math.min(1, (now - startMs) / (endMs - startMs)));
}
