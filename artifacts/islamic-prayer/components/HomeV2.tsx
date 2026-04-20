import React, { useMemo } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import type { PrayerTimesResult, PrayerTime } from "@/utils/prayerTimes";
import type { TrackerPrayerKey } from "@/context/PrayerTrackerContext";

/**
 * HomeV2 — Celestial Dome v2 hero for the Prayer home tab.
 *
 * Mirrors `mockups/home-redesign/CelestialDomeV2.tsx`:
 *   • Full-bleed sky dome hero (410px) with sun/moon traveling along an arc,
 *     daytime prayer anchors (Dhuhr/Asr/Maghrib) on the arc + night-side
 *     crescent moons (Fajr/Isha) at the base. Top bar with location pill,
 *     hijri date, and bell floats inside the sky.
 *   • Progress hairline with moving dot + left/right anchors.
 *   • NOW/NEXT card: gold "Mark prayed" pill, serif countdown, rosebud
 *     "X of 5 today" row + View tracker link.
 *   • Verse of the day with bismillah divider + Read/Share buttons.
 *   • Quick actions strip (Qibla/Quran/Adhkar — Tahajjud at night).
 *
 * App-state banners (location denied / error / auto-method) slot in via the
 * `banners` prop and render between the NOW/NEXT card and the verse card.
 */

export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  tint: string;
  gold: string;
  prayerCard: string;
};

const TRACKER_FIVE: TrackerPrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const ARABIC: Record<string, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

// Time-of-day sky gradients (top → horizon), keyed by current prayer name.
const SKY: Record<string, string[]> = {
  fajr:    ["#06081C", "#0E0F2A", "#2D1A3A", "#4A2A3E"],
  sunrise: ["#1A2B4A", "#3D4F70", "#A87B5A", "#E4A579"],
  dhuhr:   ["#1B3A5E", "#3A6B9E", "#7BB0DC", "#B5DBED"],
  asr:     ["#2A2545", "#5A3E5A", "#A06840", "#D89055"],
  maghrib: ["#1A1530", "#3A1F2E", "#7A3826", "#C26835"],
  isha:    ["#02030E", "#060820", "#0A0E2A", "#101638"],
};

function skyFor(name?: string | null) {
  if (!name) return SKY.dhuhr;
  return SKY[name.toLowerCase()] ?? SKY.dhuhr;
}

function horizonOf(grad: string[]): string {
  return grad[grad.length - 1];
}

function formatHm(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── Color helpers (hex ↔ rgb, mix) ──────────────────────────────────────────
function hexToRgb(h: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h.trim());
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}
function mixGradient(a: string[], b: string[], t: number): string[] {
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
function blendedSky(curName: string | null, nowMs: number, ptSunriseMs: number | null, ptMaghribMs: number | null) {
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

function useReduceMotion(): boolean {
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

function tapHaptic(kind: "selection" | "light" = "selection") {
  if (Platform.OS === "web") return;
  try {
    if (kind === "light") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else void Haptics.selectionAsync();
  } catch {
    /* haptics unavailable */
  }
}

// Deterministic star field for the dome (denser at night).
function buildStars(boost: number, w: number, cy: number) {
  const n = Math.round(14 * boost);
  return Array.from({ length: n }, (_, i) => ({
    x: (i * 47) % w,
    y: 10 + ((i * 13.7) % (cy - 30)),
    r: 1.0 + (i % 3 === 0 ? 0.4 : 0),
    o: 0.35 + (i % 3) * 0.18,
  }));
}

function timeFractionOfDay(now: number, sunriseMs: number, sunsetMs: number) {
  if (sunsetMs <= sunriseMs) return 0.5;
  return Math.max(0, Math.min(1, (now - sunriseMs) / (sunsetMs - sunriseMs)));
}

function timeFractionOfNight(now: number, startMs: number, endMs: number) {
  if (endMs <= startMs) return 0.5;
  return Math.max(0, Math.min(1, (now - startMs) / (endMs - startMs)));
}

export interface HomeV2Props {
  colors: ThemeColors;
  topPad: number;
  prayerTimes: PrayerTimesResult | null;
  currentPrayer: PrayerTime | null;
  nextPrayer: PrayerTime | null;
  progressEndPrayer: PrayerTime | null;
  progress: number;
  timeRemaining: string;
  nowMs: number;
  isNight: boolean;

  locationLabel: string;
  hijriLabel: string; // e.g. "2 SHAWWĀL · 1447"

  prayed: Record<TrackerPrayerKey, boolean>;
  prayedCount: number;
  /** Unix ms when the *current* tracked prayer was last marked. Drives the
   * "prayed Xm ago" sub-label on the NOW card. */
  nowPrayedAtMs?: number | null;

  ayah: {
    arabic: string;
    translation: string;
    surahName: string;
    surahNumber: number;
    ayahNumber: number;
  };
  isVerseOfNight: boolean;
  ayahCopied: boolean;

  bell?: {
    iconName: keyof typeof Feather.glyphMap;
    iconColor: string;
    bg: string;
    showDot: boolean;
  } | null;

  banners?: React.ReactNode;

  /** Per-prayer notification on/off state. Drives the small gold dot rendered
   * next to each tappable prayer anchor on the dome. */
  notifEnabled?: Partial<Record<TrackerPrayerKey, boolean>>;

  onLocationPress: () => void;
  onCalendarPress: () => void;
  onBellPress?: () => void;
  onTogglePrayed: (key: TrackerPrayerKey) => void;
  /** Tap on any prayer anchor (Fajr/Dhuhr/Asr/Maghrib/Isha) on the dome →
   * open that prayer's notification settings sheet. */
  onPrayerSettingsPress?: (key: TrackerPrayerKey) => void;
  onViewTracker: () => void;
  onCopyAyah: () => void;
  onShareAyah: () => void;
  onReadAyah: () => void;
  onQibla: () => void;
  onQuran: () => void;
  onAdhkar: () => void;
  onTahajjud: () => void;
}

const SERIF = Platform.select({ ios: "Georgia", android: "serif", web: "Georgia, serif" });

export function HomeV2(props: HomeV2Props) {
  const {
    colors,
    topPad,
    prayerTimes,
    currentPrayer,
    nextPrayer,
    progressEndPrayer,
    progress,
    timeRemaining,
    nowMs,
    isNight,
    locationLabel,
    hijriLabel,
    prayed,
    prayedCount,
    nowPrayedAtMs,
    ayah,
    isVerseOfNight,
    ayahCopied,
    bell,
    banners,
    notifEnabled,
    onLocationPress,
    onCalendarPress,
    onBellPress,
    onTogglePrayed,
    onPrayerSettingsPress,
    onViewTracker,
    onCopyAyah,
    onShareAyah,
    onReadAyah,
    onQibla,
    onQuran,
    onAdhkar,
    onTahajjud,
  } = props;

  const { width: winW } = useWindowDimensions();
  const W = Math.min(winW, 480); // Cap width on web so the dome stays mobile-shaped
  const HERO_H = 410;
  const cx = W / 2;
  const cy = 280;
  const R = Math.min(138, W / 2 - 50);

  const reduceMotion = useReduceMotion();
  const curName = currentPrayer?.name?.toLowerCase() ?? null;
  const ptSunriseMs = prayerTimes ? prayerTimes.sunrise.time.getTime() : null;
  const ptMaghribMs = prayerTimes ? prayerTimes.maghrib.time.getTime() : null;
  const blended = useMemo(
    () => blendedSky(curName, nowMs, ptSunriseMs, ptMaghribMs),
    [curName, nowMs, ptSunriseMs, ptMaghribMs],
  );
  // Honour prefers-reduced-motion: drop the smooth twilight cross-fade and
  // halo swell so the scene doesn't pulse for users who've opted out.
  const grad = reduceMotion ? skyFor(curName) : blended.grad;
  const twilight = reduceMotion ? 0 : blended.twilight;
  const horizonColor = horizonOf(grad);
  const isDay = !isNight;
  const ink = isDay ? "#FFE4B5" : "#C9D4F0";
  const inkSoft = (a: number) => (isDay ? `rgba(255,228,181,${a})` : `rgba(201,212,240,${a})`);

  // ── Body angle (sun by day, moon by night) ────────────────────────────────
  const bodyDeg = useMemo(() => {
    if (!prayerTimes) return -90;
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const sunsetMs = prayerTimes.maghrib.time.getTime();
    if (isDay) {
      const f = timeFractionOfDay(nowMs, sunriseMs, sunsetMs);
      return -180 + f * 180;
    }
    // Night moon: traverses the dome from Maghrib (LEFT horizon, sunset) to
    // Sunrise (RIGHT horizon, fajr ends). Time reads left→right at night
    // just like the day, so the moon rises in the upper-left at Isha, hangs
    // overhead at Last 1/3, and sets at Sunrise on the right.
    const todayMaghribMs = sunsetMs;
    const beforeMaghrib = nowMs < todayMaghribMs;
    const startMs = beforeMaghrib ? todayMaghribMs - 24 * 3600 * 1000 : todayMaghribMs;
    const endMs = sunriseMs > startMs ? sunriseMs : sunriseMs + 24 * 3600 * 1000;
    const f = timeFractionOfNight(nowMs, startMs, endMs);
    return -180 + f * 180;
  }, [prayerTimes, nowMs, isDay]);

  // ── Day→Night cross-fade (sunset animation) ──────────────────────────────
  // Smooth 0..1 ramp tied to Maghrib so the dome morphs from the daytime
  // scene (sun + Dhuhr/Asr/Maghrib anchors) to the night scene (moon +
  // Maghrib/Isha/Last1/3/Fajr/Sunrise anchors) over a 30-min window.
  const nightT = useMemo(() => {
    if (!prayerTimes) return isNight ? 1 : 0;
    const maghribMs = prayerTimes.maghrib.time.getTime();
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const SUNSET_FADE_START = maghribMs - 5 * 60 * 1000;
    const SUNSET_FADE_END = maghribMs + 25 * 60 * 1000;
    const SUNRISE_FADE_START = sunriseMs - 5 * 60 * 1000;
    const SUNRISE_FADE_END = sunriseMs + 5 * 60 * 1000;
    // Pre-dawn (post-midnight, before today's Maghrib): we're still in
    // last night. Run the sunrise ramp; otherwise solid night = 1.
    if (nowMs < maghribMs) {
      if (nowMs <= SUNRISE_FADE_START) return 1;
      if (nowMs >= SUNRISE_FADE_END) return 0;
      return 1 - (nowMs - SUNRISE_FADE_START) / (SUNRISE_FADE_END - SUNRISE_FADE_START);
    }
    // Post-Maghrib: ramp 0 → 1 across the sunset window.
    if (nowMs <= SUNSET_FADE_START) return 0;
    if (nowMs >= SUNSET_FADE_END) return 1;
    return (nowMs - SUNSET_FADE_START) / (SUNSET_FADE_END - SUNSET_FADE_START);
  }, [prayerTimes, nowMs, isNight]);
  const nightActive = nightT > 0.01;
  const dayActive = nightT < 0.99;

  const bodyRad = (bodyDeg * Math.PI) / 180;
  const bodyX = cx + R * Math.cos(bodyRad);
  const bodyY = cy + R * Math.sin(bodyRad);
  // 0 at horizon, 1 at apex. Drives glow swell at sunrise/sunset.
  const bodyElev = Math.max(0, Math.min(1, -Math.sin(bodyRad)));
  const horizonProx = 1 - bodyElev; // 1 near horizon
  // Combine with explicit twilight blend for stronger sunrise/sunset glow.
  const glowBoost = reduceMotion ? 0 : Math.max(horizonProx * 0.7, twilight);

  // Live time label embedded next to the body.
  const nowLabel = useMemo(() => {
    const d = new Date(nowMs);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }, [nowMs]);

  // ── Arc prayers (Dhuhr / Asr / Maghrib) at proportional positions ─────────
  type ArcSpec = {
    id: "dhuhr" | "asr" | "maghrib";
    en: string;
    time: string;
    angle: number;
    status: "past" | "now" | "next" | "upcoming";
  };
  const arcPrayers = useMemo<ArcSpec[]>(() => {
    if (!prayerTimes) return [];
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const sunsetMs = prayerTimes.maghrib.time.getTime();
    const at = (ms: number) => {
      const f = timeFractionOfDay(ms, sunriseMs, sunsetMs);
      return -180 + f * 180;
    };
    const nextName = nextPrayer?.name?.toLowerCase();
    const isPreDawn = isNight && nowMs < prayerTimes.maghrib.time.getTime();
    const mk = (id: ArcSpec["id"], src: PrayerTime): ArcSpec => {
      const ms = src.time.getTime();
      let status: ArcSpec["status"];
      if (curName === id) status = "now";
      else if (nextName === id) status = "next";
      // Pre-dawn: yesterday's day prayers are all already past — same-day
      // timestamps point to the *upcoming* day, so flip them to `past`.
      else if (isPreDawn) status = "past";
      else if (ms <= nowMs) status = "past";
      else status = "upcoming";
      return { id, en: src.name, time: src.timeString, angle: at(ms), status };
    };
    return [
      mk("dhuhr", prayerTimes.dhuhr),
      mk("asr", prayerTimes.asr),
      mk("maghrib", prayerTimes.maghrib),
    ];
  }, [prayerTimes, curName, nextPrayer, nowMs, isNight]);

  // ── Night-side prayers (Fajr / Isha) at the base of the dome ──────────────
  // Pre-dawn window (nowMs < today's Maghrib while still night): yesterday's
  // Isha already happened, and Fajr is the active period — so we can't trust
  // raw same-day timestamps. Detect that window and stamp Isha `past`.
  type NightSpec = {
    id: "fajr" | "isha";
    en: string;
    time: string;
    sub: string;
    side: "left" | "right";
    status: "past" | "now" | "next" | "upcoming";
  };
  const preDawn = !!prayerTimes && isNight && nowMs < prayerTimes.maghrib.time.getTime();
  const nightPrayers = useMemo<NightSpec[]>(() => {
    if (!prayerTimes) return [];
    const nextName = nextPrayer?.name?.toLowerCase();
    const mk = (id: NightSpec["id"], src: PrayerTime, side: "left" | "right", sub: string): NightSpec => {
      const ms = src.time.getTime();
      let status: NightSpec["status"];
      if (curName === id) status = "now";
      else if (nextName === id) status = "next";
      else if (preDawn && id === "isha") status = "past";
      else if (ms <= nowMs) status = "past";
      else status = "upcoming";
      return { id, en: src.name, time: src.timeString, sub, side, status };
    };
    return [
      mk("fajr", prayerTimes.fajr, "left", "pre-dawn"),
      mk("isha", prayerTimes.isha, "right", "after sunset"),
    ];
  }, [prayerTimes, curName, nextPrayer, nowMs, preDawn]);

  // ── Night arc anchors (Maghrib · Isha · Last 1/3 · Fajr · Sunrise) ───────
  // Mirrors the agreed CelestialDomeNight mockup: at night the dome shows
  // Maghrib at the LEFT horizon (sunset · night begins), then Isha rising,
  // Last 1/3 near the apex (tahajjud window), Fajr descending on the right,
  // and Sunrise at the RIGHT horizon (fajr ends). Replaces the daytime
  // Dhuhr/Asr/Maghrib arc + the corner Fajr/Isha crescents while at night.
  type NightArcSpec = {
    id: "maghrib" | "isha" | "lastThird" | "fajr" | "sunrise";
    label: string;
    time: string;
    ar?: string;
    sub?: string;
    angle: number;
    kind: "prayer" | "gateway" | "window";
    status: "past" | "now" | "next" | "upcoming";
  };
  const nightArcPrayers = useMemo<NightArcSpec[]>(() => {
    if (!prayerTimes) return [];
    const maghribMs = prayerTimes.maghrib.time.getTime();
    const fajrMs = prayerTimes.fajr.time.getTime();
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const ishaMs = prayerTimes.isha.time.getTime();
    // Night spans: today's Maghrib → tomorrow's Sunrise (wrap if needed).
    const startMs = nowMs < maghribMs ? maghribMs - 24 * 3600 * 1000 : maghribMs;
    const endMs = sunriseMs > startMs ? sunriseMs : sunriseMs + 24 * 3600 * 1000;
    // Normalise prayer timestamps into the active [startMs, endMs] window so
    // pre-dawn (when "today's" Isha is ~16h in the future) maps Isha back to
    // *yesterday's* Isha — the one that actually happened during this night.
    const DAY = 24 * 3600 * 1000;
    const intoWin = (ms: number) => {
      let m = ms;
      if (m < startMs) m += DAY;
      else if (m > endMs) m -= DAY;
      return m;
    };
    const fajrAdjMs = intoWin(fajrMs);
    const ishaAdjMs = intoWin(ishaMs);
    const lastThirdMs = startMs + ((fajrAdjMs - startMs) * 2) / 3;
    const at = (ms: number) => {
      const f = Math.max(0, Math.min(1, (ms - startMs) / (endMs - startMs)));
      return -180 + f * 180;
    };
    const nextName = nextPrayer?.name?.toLowerCase();
    const status = (id: NightArcSpec["id"], ms: number): NightArcSpec["status"] => {
      if (id === "isha" && curName === "isha") return "now";
      if (id === "fajr" && curName === "fajr") return "now";
      if (id === "isha" && nextName === "isha") return "next";
      if (id === "fajr" && nextName === "fajr") return "next";
      if (id === "sunrise" && nextName === "sunrise") return "next";
      if (ms <= nowMs) return "past";
      return "upcoming";
    };
    return [
      {
        id: "maghrib",
        label: "MAGHRIB",
        time: prayerTimes.maghrib.timeString,
        sub: "sunset · night begins",
        angle: at(startMs),
        kind: "gateway",
        status: status("maghrib", startMs),
      },
      {
        id: "isha",
        label: "ISHA",
        ar: ARABIC.isha,
        time: prayerTimes.isha.timeString,
        angle: at(ishaAdjMs),
        kind: "prayer",
        status: status("isha", ishaAdjMs),
      },
      {
        id: "lastThird",
        label: "LAST 1/3",
        time: formatHm(lastThirdMs),
        sub: "tahajjud window",
        angle: at(lastThirdMs),
        kind: "window",
        status: status("lastThird", lastThirdMs),
      },
      {
        id: "fajr",
        label: "FAJR",
        ar: ARABIC.fajr,
        time: prayerTimes.fajr.timeString,
        angle: at(fajrAdjMs),
        kind: "prayer",
        status: status("fajr", fajrAdjMs),
      },
      {
        id: "sunrise",
        label: "SUNRISE",
        time: prayerTimes.sunrise.timeString,
        sub: "fajr ends",
        angle: at(endMs),
        kind: "gateway",
        status: status("sunrise", endMs),
      },
    ];
  }, [prayerTimes, curName, nextPrayer, nowMs]);

  const stars = useMemo(() => buildStars(isDay ? 1 : 3.2, W, cy), [isDay, W, cy]);

  // ── Progress hairline ─────────────────────────────────────────────────────
  // Day = sunrise→maghrib elapsed. Night = maghrib→fajr elapsed (wrapping
  // across midnight). We compute these locally instead of reusing the
  // `progress` prop (which tracks the *current prayer period* and therefore
  // resets to 0% every prayer transition — looking like a backwards jump).
  const barFraction = useMemo(() => {
    if (!prayerTimes) return 0;
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const maghribMs = prayerTimes.maghrib.time.getTime();
    if (isDay) {
      return timeFractionOfDay(nowMs, sunriseMs, maghribMs);
    }
    // Night runs from today's Maghrib to tomorrow's Sunrise (the new night
    // arc convention — Sunrise is the end of night). Wrap if we're in the
    // pre-dawn window before today's Maghrib.
    const beforeMaghrib = nowMs < maghribMs;
    const startMs = beforeMaghrib ? maghribMs - 24 * 3600 * 1000 : maghribMs;
    const endMs = sunriseMs > startMs ? sunriseMs : sunriseMs + 24 * 3600 * 1000;
    return timeFractionOfNight(nowMs, startMs, endMs);
  }, [prayerTimes, nowMs, isDay]);

  const barLeft = isDay ? prayerTimes?.sunrise.timeString ?? "" : prayerTimes?.maghrib.timeString ?? "";
  const barRight = isDay ? prayerTimes?.maghrib.timeString ?? "" : prayerTimes?.sunrise.timeString ?? "";
  const barCentre = isDay
    ? `${Math.round(barFraction * 100)}% OF DAYLIGHT`
    : `NIGHT · ${Math.round(barFraction * 100)}% ELAPSED`;
  const barAccent = isDay ? "#FFF1C4" : "#C9D4F0";

  // ── NOW / NEXT card values ────────────────────────────────────────────────
  const isCurrentTracked = !!curName && (TRACKER_FIVE as string[]).includes(curName);
  const nowEn = currentPrayer?.name ?? "—";
  const nowAr = curName ? ARABIC[curName] ?? "" : "";
  // Display NEXT from the same target the countdown is built against
  // (`progressEndPrayer`). During Fajr that's Sunrise, not Dhuhr — so the
  // card label, Arabic name, and "at HH:MM" all stay in sync with the timer.
  const nextDisp = progressEndPrayer ?? nextPrayer;
  const nextEn = nextDisp?.name ?? "—";
  const nextName = nextDisp?.name?.toLowerCase();
  const nextAr = nextName ? ARABIC[nextName] ?? "" : "";
  const nextAt = nextDisp?.timeString ?? "";

  // Split countdown like "2h 40m" into h/m parts for serif display.
  const cd = useMemo(() => {
    const t = (timeRemaining ?? "").trim();
    if (!t || /^now$/i.test(t)) return { h: "0", m: "00" };
    const m = /(\d+)\s*h\s*(\d+)\s*m/i.exec(t);
    if (m) return { h: m[1], m: m[2].padStart(2, "0") };
    const m2 = /(\d+)\s*m/i.exec(t);
    if (m2) return { h: "0", m: m2[1].padStart(2, "0") };
    return { h: "0", m: "00" };
  }, [timeRemaining]);

  const nowHasPeriod = (() => {
    if (!isCurrentTracked || !currentPrayer || !prayerTimes) return null;
    const startStr = currentPrayer.timeString;
    let endStr = "";
    if (curName === "fajr") endStr = prayerTimes.sunrise.timeString;
    else if (curName === "dhuhr") endStr = prayerTimes.asr.timeString;
    else if (curName === "asr") endStr = prayerTimes.maghrib.timeString;
    else if (curName === "maghrib") endStr = prayerTimes.isha.timeString;
    else if (curName === "isha") endStr = prayerTimes.fajr.timeString;
    return `started ${startStr} · ends ${endStr}`;
  })();

  const isPrayedNow = isCurrentTracked && prayed[curName as TrackerPrayerKey];

  // "prayed Xm ago" sub-label after marking the current prayer.
  const prayedAgo = useMemo(() => {
    if (!isPrayedNow || !nowPrayedAtMs) return null;
    const diff = Math.max(0, Math.floor((nowMs - nowPrayedAtMs) / 60000));
    if (diff < 1) return "prayed just now";
    if (diff < 60) return `prayed ${diff}m ago`;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `prayed ${h}h ${m}m ago`;
  }, [isPrayedNow, nowPrayedAtMs, nowMs]);

  const handleToggleNow = () => {
    tapHaptic("light");
    if (curName) onTogglePrayed(curName as TrackerPrayerKey);
  };
  const handleToggleBud = (k: TrackerPrayerKey) => {
    tapHaptic("selection");
    onTogglePrayed(k);
  };

  const nextLabel = (() => {
    if (!nextName) return "NEXT";
    if (nextName === "sunrise") return "UNTIL SUNRISE";
    return `UNTIL ${nextEn.toUpperCase()}`;
  })();

  // ── Quick actions (Tahajjud variant at night) ─────────────────────────────
  const showTahajjud = isNight && curName === "isha";

  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* ───────── SKY DOME HERO ───────── */}
      <View style={{ height: HERO_H, width: "100%", overflow: "hidden", position: "relative" }}>
        <LinearGradient
          colors={grad as any}
          locations={[0, 0.4, 0.8, 1] as any}
          style={StyleSheet.absoluteFill}
        />

        {/* Stars layer */}
        <Svg width={W} height={HERO_H} style={{ position: "absolute", left: (winW - W) / 2, top: 0 }}>
          {stars.map((s, i) => (
            <Circle key={`s-${i}`} cx={s.x} cy={s.y} r={s.r} fill={`rgba(220,232,255,${s.o})`} opacity={isDay ? 0.55 : 1} />
          ))}

          {/* Dome dotted arc */}
          <Defs>
            <SvgLinearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={inkSoft(0.18)} />
              <Stop offset="50%" stopColor={inkSoft(0.5)} />
              <Stop offset="100%" stopColor={inkSoft(0.18)} />
            </SvgLinearGradient>
            <RadialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0%" stopColor="#FFF1C4" stopOpacity="1" />
              <Stop offset="40%" stopColor="#FFC97A" stopOpacity="0.65" />
              <Stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0%" stopColor="#E8EEFF" stopOpacity="0.55" />
              <Stop offset="60%" stopColor="#A8B4DC" stopOpacity="0.18" />
              <Stop offset="100%" stopColor="#A8B4DC" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <Path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth={1.4}
            strokeDasharray="2 5"
          />
          <Line x1={16} y1={cy} x2={W - 16} y2={cy} stroke={inkSoft(0.32)} strokeWidth={1} />

          {/* Sunrise tick (left horizon — daytime convention only). Hidden
              once we cross into the night scene where Sunrise re-anchors to
              the right horizon as the end of night. */}
          {prayerTimes && dayActive && (
            <G opacity={1 - nightT}>
              <Circle cx={cx - R} cy={cy - 4} r={2.2} fill={inkSoft(0.6)} />
              <SvgText x={cx - R} y={cy - 22} textAnchor="middle" fill={inkSoft(0.55)} fontSize={7.5} fontWeight="700">
                SUNRISE
              </SvgText>
              <SvgText x={cx - R} y={cy - 11} textAnchor="middle" fill={inkSoft(0.7)} fontSize={9} fontWeight="600">
                {prayerTimes.sunrise.timeString}
              </SvgText>
            </G>
          )}

          {/* Daytime arc prayers — only when we have prayer times. Fades out
              as the sunset transition advances so Dhuhr/Asr stop sitting on
              the dome at night. */}
          {prayerTimes && dayActive && (
          <G opacity={1 - nightT}>
          {arcPrayers.map((p) => {
            const r = (p.angle * Math.PI) / 180;
            const x = cx + R * Math.cos(r);
            const y = cy + R * Math.sin(r);
            const past = p.status === "past";
            const now = p.status === "now";
            const upcoming = p.status === "upcoming";
            const apex = Math.abs(p.angle + 90) < 8;
            const above = apex || (isDay && Math.abs(bodyDeg - p.angle) < 8);
            const labelDy = above ? -22 : 22;
            const timeDy = above ? -10 : 33;
            const anchor: "start" | "middle" | "end" =
              p.angle <= -120 ? "start" : p.angle >= -10 ? "end" : "middle";
            const dx = anchor === "start" ? 7 : anchor === "end" ? -7 : 0;
            const groupOpacity = past ? 0.55 : upcoming && !isDay ? 0.35 : 1;

            return (
              <React.Fragment key={p.id}>
                <Circle
                  cx={x}
                  cy={y}
                  r={now ? 7 : 5}
                  fill={now ? ink : past ? inkSoft(0.85) : "transparent"}
                  stroke={ink}
                  strokeWidth={now ? 2 : 1.5}
                  opacity={groupOpacity}
                />
                {now && <Circle cx={x} cy={y} r={11} fill="none" stroke={ink} strokeWidth={1} opacity={0.45} />}
                {past && (
                  <SvgText
                    x={x}
                    y={y + 2.5}
                    textAnchor="middle"
                    fill={isDay ? "#7A3826" : "#101638"}
                    fontSize={7}
                    fontWeight="900"
                    opacity={groupOpacity}
                  >
                    ✓
                  </SvgText>
                )}
                <SvgText
                  x={x + dx}
                  y={y + labelDy}
                  textAnchor={anchor}
                  fill={inkSoft(0.95)}
                  fontSize={9.5}
                  fontWeight="700"
                  opacity={groupOpacity}
                >
                  {p.en.toUpperCase()}
                </SvgText>
                <SvgText
                  x={x + dx}
                  y={y + timeDy}
                  textAnchor={anchor}
                  fill={inkSoft(0.65)}
                  fontSize={9}
                  fontWeight="500"
                  opacity={groupOpacity}
                >
                  {p.time}
                </SvgText>
                {notifEnabled?.[p.id] && (
                  <Circle cx={x + 13} cy={y - 8} r={2} fill="#FFD27A" opacity={0.95} />
                )}
              </React.Fragment>
            );
          })}
          </G>
          )}

          {/* Night-side moons (Fajr / Isha) — daytime convention. Replaced by
              proper arc anchors once we cross into the night scene. */}
          {prayerTimes && dayActive && (
          <G opacity={1 - nightT}>
          {nightPrayers.map((p) => {
            const isLeft = p.side === "left";
            const x = isLeft ? 28 : W - 28;
            const y = cy + 70;
            const past = p.status === "past";
            const now = p.status === "now";
            const moonFill = now ? "#FFE4B5" : "rgba(180,200,230,0.92)";
            const cutFill = now ? "#3A1F2E" : "rgba(20,20,40,0.95)";
            const moonR = now ? 8.5 : 7;
            const cutR = now ? 7.5 : 6;
            const opacity = past ? 0.5 : 0.95;
            const anchor: "start" | "end" = isLeft ? "start" : "end";

            return (
              <React.Fragment key={p.id}>
                {now && <Circle cx={x} cy={y} r={13} fill="none" stroke="#FFE4B5" strokeWidth={1} opacity={0.55} />}
                <Circle cx={x} cy={y} r={moonR} fill={moonFill} opacity={opacity} />
                <Circle cx={x + (isLeft ? 3 : -3)} cy={y - 1} r={cutR} fill={cutFill} opacity={opacity} />
                {past && (
                  <SvgText
                    x={x + (isLeft ? -2 : 2)}
                    y={y + 2.5}
                    textAnchor="middle"
                    fill="#1A1530"
                    fontSize={7}
                    fontWeight="900"
                  >
                    ✓
                  </SvgText>
                )}
                <Line
                  x1={x}
                  y1={y - 8}
                  x2={x}
                  y2={cy + 2}
                  stroke={now ? "rgba(255,228,181,0.45)" : "rgba(180,200,230,0.3)"}
                  strokeWidth={1}
                  strokeDasharray="1 3"
                />
                <SvgText
                  x={isLeft ? x + 14 : x - 14}
                  y={y - 3}
                  textAnchor={anchor}
                  fill={now ? "rgba(255,228,181,1)" : "rgba(210,222,238,0.95)"}
                  fontSize={10}
                  fontWeight="700"
                >
                  {p.en.toUpperCase()}
                </SvgText>
                <SvgText
                  x={isLeft ? x + 14 : x - 14}
                  y={y + 9}
                  textAnchor={anchor}
                  fill={now ? "rgba(255,228,181,0.75)" : "rgba(210,222,238,0.65)"}
                  fontSize={9}
                  fontWeight="500"
                >
                  {p.time}
                </SvgText>
                <SvgText
                  x={isLeft ? x + 14 : x - 14}
                  y={y + 21}
                  textAnchor={anchor}
                  fill="rgba(210,222,238,0.4)"
                  fontSize={8}
                  fontWeight="500"
                  fontStyle="italic"
                >
                  {now ? "in progress" : p.sub}
                </SvgText>
                {notifEnabled?.[p.id] && (
                  <Circle
                    cx={isLeft ? x + 12 : x - 12}
                    cy={y - 12}
                    r={2}
                    fill="#FFD27A"
                    opacity={0.95}
                  />
                )}
              </React.Fragment>
            );
          })}
          </G>
          )}

          {/* Night arc anchors (Maghrib · Isha · Last 1/3 · Fajr · Sunrise).
              Reveals as the sunset transition advances. Maghrib pinned to the
              LEFT horizon (sunset · night begins), Sunrise to the RIGHT
              (fajr ends), Fajr just before sunrise on the right. Mirrors the
              CelestialDomeNight mockup. */}
          {prayerTimes && nightActive && (
          <G opacity={nightT}>
          {nightArcPrayers.map((a) => {
            const r = (a.angle * Math.PI) / 180;
            const x = cx + R * Math.cos(r);
            const y = cy + R * Math.sin(r);
            const isPrayer = a.kind === "prayer";
            const past = a.status === "past";
            const now = a.status === "now";
            const next = a.status === "next";
            // Apex / above-arc labels: place above the arc, otherwise below.
            const apex = Math.abs(a.angle + 90) < 12;
            const moonOnMe = Math.abs(bodyDeg - a.angle) < 8;
            const above = apex || moonOnMe;
            const labelDy = above ? -22 : 22;
            const timeDy = above ? -10 : 33;
            const subDy = above ? -34 : 44;
            const anchor: "start" | "middle" | "end" =
              a.angle <= -120 ? "start" : a.angle >= -10 ? "end" : "middle";
            const dx = anchor === "start" ? 7 : anchor === "end" ? -7 : 0;
            const markerColor = isPrayer ? "#FFE4B5" : "rgba(201,212,240,0.7)";
            const markerR = now ? 7 : isPrayer ? 5 : 3;
            const groupOp = past ? 0.55 : !isPrayer ? 0.7 : 1;

            return (
              <G key={`na-${a.id}`} opacity={groupOp}>
                <Circle
                  cx={x}
                  cy={y}
                  r={markerR}
                  fill={now || past ? markerColor : "transparent"}
                  stroke={markerColor}
                  strokeWidth={now ? 2 : 1.5}
                />
                {past && isPrayer && (
                  <SvgText x={x} y={y + 2.5} textAnchor="middle" fill="#0A0E2A" fontSize={7} fontWeight="900">
                    ✓
                  </SvgText>
                )}
                {now && (
                  <Circle cx={x} cy={y} r={11} fill="none" stroke={markerColor} strokeWidth={1} opacity={0.45} />
                )}
                {next && (
                  <Circle
                    cx={x}
                    cy={y}
                    r={9}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth={1}
                    opacity={0.6}
                    strokeDasharray="2 2"
                  />
                )}
                <SvgText
                  x={x + dx}
                  y={y + labelDy}
                  textAnchor={anchor}
                  fill={isPrayer ? "rgba(255,228,181,0.95)" : "rgba(201,212,240,0.85)"}
                  fontSize={isPrayer ? 9.5 : 8.5}
                  fontWeight="700"
                >
                  {a.label}
                </SvgText>
                <SvgText
                  x={x + dx}
                  y={y + timeDy}
                  textAnchor={anchor}
                  fill={isPrayer ? "rgba(255,228,181,0.7)" : "rgba(201,212,240,0.6)"}
                  fontSize={9}
                  fontWeight="500"
                >
                  {a.time}
                </SvgText>
                {a.sub && (
                  <SvgText
                    x={x + dx}
                    y={y + subDy}
                    textAnchor={anchor}
                    fill="rgba(201,212,240,0.42)"
                    fontSize={7.5}
                    fontWeight="500"
                    fontStyle="italic"
                  >
                    {a.sub}
                  </SvgText>
                )}
                {isPrayer && notifEnabled?.[a.id as "fajr" | "isha"] && (
                  <Circle cx={x + 13} cy={y - 8} r={2} fill="#FFD27A" opacity={0.95} />
                )}
              </G>
            );
          })}
          </G>
          )}

          {/* The body (sun by day, moon by night). Cross-fades between the
              two during the sunset transition. Hidden when there is no
              location to anchor it. */}
          {prayerTimes && dayActive && (
            <G opacity={1 - nightT}>
              {/* Outer warm halo (only visible near horizon / twilight) */}
              {glowBoost > 0.05 && (
                <Circle
                  cx={bodyX}
                  cy={bodyY}
                  r={32 + 22 * glowBoost}
                  fill="url(#sunGlow)"
                  opacity={0.55 + 0.4 * glowBoost}
                />
              )}
              <Circle cx={bodyX} cy={bodyY} r={32} fill="url(#sunGlow)" />
              <Circle cx={bodyX} cy={bodyY} r={11} fill="#FFF1C4" />
              <SvgText x={bodyX + 18} y={bodyY + 3} fill="#FFF1C4" fontSize={11} fontWeight="700">
                {nowLabel}
              </SvgText>
            </G>
          )}
          {prayerTimes && nightActive && (
            <G opacity={nightT}>
              {glowBoost > 0.05 && (
                <Circle
                  cx={bodyX}
                  cy={bodyY}
                  r={28 + 16 * glowBoost}
                  fill="url(#moonGlow)"
                  opacity={0.5 + 0.4 * glowBoost}
                />
              )}
              <Circle cx={bodyX} cy={bodyY} r={28} fill="url(#moonGlow)" />
              <Circle cx={bodyX} cy={bodyY} r={13} fill="#E8EEFF" />
              {/* Crescent cut — phase hint, not astronomical */}
              <Circle cx={bodyX + (bodyDeg < -90 ? -4 : 5)} cy={bodyY - 1.5} r={11} fill={grad[0]} />
              <SvgText x={bodyX + 22} y={bodyY + 3} fill="#E8EEFF" fontSize={11} fontWeight="700">
                {nowLabel}
              </SvgText>
            </G>
          )}
        </Svg>

        {/* Tappable hit boxes over each prayer anchor — opens the per-prayer
            notification settings sheet. These sit above the SVG so the small
            anchor circles get a generous tap target without breaking the
            visual. */}
        {prayerTimes && onPrayerSettingsPress && (
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              left: (winW - W) / 2,
              top: 0,
              width: W,
              height: HERO_H,
            }}
          >
            {arcPrayers.map((p) => {
              const r = (p.angle * Math.PI) / 180;
              const x = cx + R * Math.cos(r);
              const y = cy + R * Math.sin(r);
              return (
                <Pressable
                  key={`hit-${p.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.en} notification settings`}
                  onPress={() => {
                    tapHaptic("selection");
                    onPrayerSettingsPress(p.id);
                  }}
                  hitSlop={6}
                  style={{
                    position: "absolute",
                    left: x - 30,
                    top: y - 30,
                    width: 60,
                    height: 60,
                  }}
                />
              );
            })}
            {nightPrayers.map((p) => {
              const isLeft = p.side === "left";
              const x = isLeft ? 28 : W - 28;
              const y = cy + 70;
              return (
                <Pressable
                  key={`hit-${p.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.en} notification settings`}
                  onPress={() => {
                    tapHaptic("selection");
                    onPrayerSettingsPress(p.id);
                  }}
                  hitSlop={6}
                  style={{
                    position: "absolute",
                    left: isLeft ? x - 14 : x - 70,
                    top: y - 18,
                    width: 84,
                    height: 52,
                  }}
                />
              );
            })}
          </View>
        )}

        {/* Empty-state CTA: when there are no prayer times yet, swap the dome
            anchors for a single, calm "Set location" call-to-action so the
            hero never reads as broken. */}
        {!prayerTimes && (
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: cy - 40,
              alignItems: "center",
            }}
          >
            <Text style={{ color: ink, fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 1.4, marginBottom: 12 }}>
              {locationLabel?.toUpperCase() ?? "NO LOCATION"}
            </Text>
            <TouchableOpacity
              onPress={onLocationPress}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: inkSoft(0.55),
                backgroundColor: "rgba(0,0,0,0.25)",
              }}
            >
              <Feather name="map-pin" size={13} color={ink} />
              <Text style={{ color: ink, fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 0.4 }}>
                Set your location
              </Text>
            </TouchableOpacity>
            <Text style={{ color: inkSoft(0.6), fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 8, textAlign: "center", paddingHorizontal: 28 }}>
              Prayer times are calculated from your position.
            </Text>
          </View>
        )}

        {/* Floating top bar */}
        <View
          style={[
            styles.topBar,
            { paddingTop: topPad + 8, paddingHorizontal: 20 },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity onPress={onLocationPress} activeOpacity={0.7} style={styles.locPill}>
            <Feather name="map-pin" size={11} color={ink} />
            <Text style={[styles.locText, { color: ink }]} numberOfLines={1}>
              {locationLabel}
            </Text>
            <Feather name="chevron-down" size={11} color={ink} />
          </TouchableOpacity>

          <View style={styles.topBarRight}>
            <TouchableOpacity onPress={onCalendarPress} activeOpacity={0.7} hitSlop={8}>
              <Text style={[styles.dateText, { color: inkSoft(0.85) }]} numberOfLines={1}>
                {hijriLabel}
              </Text>
            </TouchableOpacity>
            {bell && onBellPress && (
              <Pressable onPress={onBellPress} style={[styles.bellBtn, { backgroundColor: bell.bg }]} hitSlop={10}>
                <Feather name={bell.iconName} size={14} color={bell.iconColor} />
                {bell.showDot && (
                  <View
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: colors.tint,
                      borderWidth: 1.5,
                      borderColor: colors.surface,
                    }}
                  />
                )}
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Under-hero soft fade */}
      <LinearGradient
        colors={[horizonColor, colors.background]}
        style={{ height: 24 }}
      />

      {/* ───────── PROGRESS HAIRLINE ───────── */}
      <View style={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 14 }}>
        <View style={[styles.barTrack, { backgroundColor: inkSoft(0.16) }]}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.round(barFraction * 100)}%`, backgroundColor: barAccent },
            ]}
          />
          <View
            style={[
              styles.barDot,
              {
                left: `${Math.round(barFraction * 100)}%`,
                backgroundColor: barAccent,
                shadowColor: barAccent,
              },
            ]}
          />
        </View>
        <View style={styles.barLabels}>
          <Text style={[styles.barTime, { color: colors.textSecondary }]}>{barLeft}</Text>
          <Text style={[styles.barTime, { color: colors.textSecondary }]} numberOfLines={1}>
            {barCentre}
          </Text>
          <Text style={[styles.barTime, { color: colors.textSecondary }]}>{barRight}</Text>
        </View>
      </View>

      {/* ───────── NOW / NEXT CARD ───────── */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <View style={[styles.nowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Soft gold corner glow */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -50,
              top: -50,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: colors.gold + "22",
              opacity: 0.6,
            }}
          />

          {/* NOW row */}
          <View style={styles.nowRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nowEyebrow, { color: colors.gold }]}>● NOW · IN PROGRESS</Text>
              <View style={styles.nowTitleRow}>
                <Text style={[styles.nowTitle, { color: colors.text }]} numberOfLines={1}>
                  {nowEn}
                </Text>
                {!!nowAr && (
                  <Text style={[styles.nowAr, { color: colors.gold, fontFamily: SERIF }]} numberOfLines={1}>
                    {nowAr}
                  </Text>
                )}
              </View>
              {(prayedAgo || nowHasPeriod) && (
                <Text
                  style={[
                    styles.nowSub,
                    { color: prayedAgo ? colors.gold : colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {prayedAgo ?? nowHasPeriod}
                </Text>
              )}
            </View>

            {isCurrentTracked && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleToggleNow}
                style={[
                  styles.markBtn,
                  isPrayedNow
                    ? { backgroundColor: colors.gold + "26", borderWidth: 1, borderColor: colors.gold + "55" }
                    : { backgroundColor: colors.gold },
                ]}
              >
                <Feather
                  name="check"
                  size={13}
                  color={isPrayedNow ? colors.gold : "#0A1612"}
                />
                <Text
                  style={[
                    styles.markBtnText,
                    { color: isPrayedNow ? colors.gold : "#0A1612" },
                  ]}
                >
                  {isPrayedNow ? "Prayed" : "Mark prayed"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* NEXT row */}
          <View style={styles.nextRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nextEyebrow, { color: colors.textSecondary }]}>{nextLabel}</Text>
              <View style={styles.nextLineRow}>
                <Text style={[styles.nextAt, { color: colors.textSecondary }]}>at</Text>
                <Text style={[styles.nextTime, { color: colors.text }]}>{nextAt}</Text>
                {!!nextAr && (
                  <Text style={[styles.nextAr, { color: colors.textSecondary, fontFamily: SERIF }]}>· {nextAr}</Text>
                )}
              </View>
            </View>
            <View style={styles.cdRow}>
              <Text style={[styles.cdNum, { color: colors.text, fontFamily: SERIF }]}>{cd.h}</Text>
              <Text style={[styles.cdUnit, { color: colors.gold, fontFamily: SERIF }]}>h</Text>
              <Text style={[styles.cdNum, { color: colors.text, fontFamily: SERIF }]}>{cd.m}</Text>
              <Text style={[styles.cdUnit, { color: colors.gold, fontFamily: SERIF }]}>m</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Rosebud "X of 5 today" + View tracker */}
          <View style={styles.rosebudRow}>
            <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
              {TRACKER_FIVE.map((k) => {
                const filled = !!prayed[k];
                return (
                  <Pressable
                    key={k}
                    onPress={() => handleToggleBud(k)}
                    hitSlop={6}
                    style={[
                      styles.bud,
                      {
                        backgroundColor: filled ? colors.gold : "transparent",
                        borderColor: filled ? colors.gold + "B3" : colors.border,
                      },
                    ]}
                  >
                    {filled && <View style={styles.budDot} />}
                  </Pressable>
                );
              })}
              <Text style={[styles.rosebudCount, { color: colors.textSecondary }]} numberOfLines={1}>
                {prayedCount} of 5 today
              </Text>
            </View>
            <TouchableOpacity onPress={onViewTracker} hitSlop={8} activeOpacity={0.7}>
              <Text style={[styles.viewTracker, { color: colors.gold }]}>↗ View tracker</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ───────── EARLIER TODAY (night-mode chip strip) ─────────
          Once the dome switches into the night scene, the daytime prayers
          (Fajr/Dhuhr/Asr/Maghrib) leave the arc — surface them here so they
          stay one tap away. Mirrors the agreed CelestialDomeNight mockup. */}
      {prayerTimes && nightActive && (
        <View
          style={{ paddingHorizontal: 20, paddingTop: 0, paddingBottom: 14, opacity: nightT }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              paddingVertical: 10,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                letterSpacing: 1.4,
                color: colors.textSecondary,
                fontWeight: "700",
                marginRight: 4,
              }}
            >
              EARLIER TODAY
            </Text>
            {(["fajr", "dhuhr", "asr", "maghrib"] as const).map((id) => {
              const src =
                id === "fajr" ? prayerTimes.fajr
                  : id === "dhuhr" ? prayerTimes.dhuhr
                    : id === "asr" ? prayerTimes.asr
                      : prayerTimes.maghrib;
              const done = !!prayed[id];
              const label = id.charAt(0).toUpperCase() + id.slice(1);
              return (
                <Pressable
                  key={id}
                  onPress={() => handleToggleBud(id)}
                  hitSlop={6}
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    paddingVertical: 4,
                    paddingHorizontal: 2,
                    borderRadius: 10,
                    backgroundColor: done ? colors.gold + "14" : "transparent",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                    {done ? (
                      <Feather name="check" size={9} color={colors.gold} />
                    ) : (
                      <View
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 3.5,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: done ? colors.text : colors.textSecondary,
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 8.5,
                      color: colors.textSecondary,
                      letterSpacing: 0.3,
                    }}
                  >
                    {src.timeString}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* ───────── BANNERS (location-denied / error / auto-method) ───────── */}
      {banners ? <View style={{ paddingHorizontal: 20 }}>{banners}</View> : null}

      {/* ───────── VERSE OF THE DAY ───────── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14 }}>
        <View style={styles.verseHeader}>
          <Text style={[styles.verseEyebrow, { color: colors.textSecondary }]}>
            {isVerseOfNight ? "VERSE OF THE NIGHT" : "VERSE OF THE DAY"}
          </Text>
          <Text style={[styles.verseEyebrowAr, { color: colors.gold, fontFamily: "AmiriQuran_400Regular" }]}>
            {isVerseOfNight ? "آية الليل" : "آية اليوم"}
          </Text>
        </View>
        <View style={[styles.verseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Soft top glow */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 80,
              backgroundColor: colors.gold + "10",
              opacity: 0.6,
            }}
          />
          {/* Bismillah divider */}
          <View style={styles.bismillahRow}>
            <View style={[styles.bisLine, { backgroundColor: colors.gold + "40" }]} />
            <Text style={[styles.bismillahMark, { color: colors.gold, fontFamily: "AmiriQuran_400Regular" }]}>﷽</Text>
            <View style={[styles.bisLine, { backgroundColor: colors.gold + "40" }]} />
          </View>
          {/* Arabic */}
          <Text
            style={[
              styles.verseArabic,
              { color: colors.text, fontFamily: "AmiriQuran_400Regular" },
            ]}
          >
            {ayah.arabic}
          </Text>
          {/* Translation */}
          <Text style={[styles.verseTranslation, { color: colors.text + "DD", fontFamily: SERIF }]}>
            “{ayah.translation}”
          </Text>
          {/* Footer */}
          <View style={[styles.verseFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.verseSrc, { color: colors.gold }]}>
              SŪRAH {ayah.surahName.toUpperCase()} · {ayah.surahNumber}:{ayah.ayahNumber}
            </Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <TouchableOpacity
                onPress={onReadAyah}
                activeOpacity={0.8}
                style={[styles.verseBtn, { backgroundColor: colors.gold + "1E" }]}
              >
                <Feather name="book-open" size={11} color={colors.gold} />
                <Text style={[styles.verseBtnText, { color: colors.gold }]}>Read</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onCopyAyah}
                activeOpacity={0.8}
                style={[styles.verseBtn, { backgroundColor: colors.gold + "1E" }]}
              >
                <Feather name={ayahCopied ? "check" : "copy"} size={11} color={colors.gold} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onShareAyah}
                activeOpacity={0.8}
                style={[styles.verseBtn, { backgroundColor: colors.gold + "1E" }]}
              >
                <Feather name="share-2" size={11} color={colors.gold} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ───────── QUICK ACTIONS ───────── */}
      <View style={styles.quickRow}>
        {(showTahajjud
          ? [
              { icon: "moon" as const, label: "Tahajjud", onPress: onTahajjud },
              { icon: "book" as const, label: "Quran", onPress: onQuran },
              { icon: "star" as const, label: "Adhkar", onPress: onAdhkar },
            ]
          : [
              { icon: "compass" as const, label: "Qibla", onPress: onQibla },
              { icon: "book" as const, label: "Quran", onPress: onQuran },
              { icon: "star" as const, label: "Adhkar", onPress: onAdhkar },
            ]
        ).map((a) => (
          <TouchableOpacity
            key={a.label}
            onPress={a.onPress}
            activeOpacity={0.85}
            style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name={a.icon} size={18} color={colors.gold} />
            <Text style={[styles.quickLabel, { color: colors.text }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ornament */}
      <View style={styles.ornament}>
        <View style={[styles.ornamentLine, { backgroundColor: colors.gold + "38" }]} />
        <Text style={[styles.ornamentMark, { color: colors.gold, fontFamily: SERIF }]}>۞</Text>
        <View style={[styles.ornamentLine, { backgroundColor: colors.gold + "38" }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 3,
  },
  locPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    maxWidth: "55%",
  },
  locText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  dateText: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 1 },
  bellBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // Progress bar
  barTrack: {
    height: 2,
    borderRadius: 1,
    position: "relative",
  },
  barFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 2,
    borderRadius: 1,
  },
  barDot: {
    position: "absolute",
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    shadowOpacity: 0.85,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  barTime: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },

  // NOW/NEXT card
  nowCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  nowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  nowEyebrow: { fontSize: 9, letterSpacing: 2, fontFamily: "Inter_700Bold" },
  nowTitleRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 4 },
  nowTitle: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  nowAr: { fontSize: 16 },
  nowSub: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  markBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  markBtnText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },

  nextRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nextEyebrow: { fontSize: 9, letterSpacing: 2, fontFamily: "Inter_700Bold" },
  nextLineRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 2 },
  nextAt: { fontSize: 11 },
  nextTime: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nextAr: { fontSize: 11 },
  cdRow: { flexDirection: "row", alignItems: "baseline" },
  cdNum: { fontSize: 38, lineHeight: 42, letterSpacing: -1 },
  cdUnit: { fontSize: 22, paddingHorizontal: 2 },

  rosebudRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bud: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.5,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  budDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#FFEEC2" },
  rosebudCount: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginLeft: 4 },
  viewTracker: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },

  // Verse
  verseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  verseEyebrow: { fontSize: 10, letterSpacing: 2, fontFamily: "Inter_700Bold" },
  verseEyebrowAr: { fontSize: 12 },
  verseCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 20,
    overflow: "hidden",
  },
  bismillahRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  bisLine: { flex: 1, height: 1 },
  bismillahMark: { fontSize: 18 },
  verseArabic: {
    fontSize: 22,
    lineHeight: 44,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 12,
  },
  verseTranslation: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  verseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  verseSrc: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, flexShrink: 1, marginRight: 8 },
  verseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  verseBtnText: { fontSize: 10, fontFamily: "Inter_700Bold" },

  // Quick actions
  quickRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 13,
    alignItems: "center",
    gap: 6,
  },
  quickLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  ornament: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
    paddingVertical: 14,
    gap: 12,
  },
  ornamentLine: { flex: 1, height: 1 },
  ornamentMark: { fontSize: 14 },
});
