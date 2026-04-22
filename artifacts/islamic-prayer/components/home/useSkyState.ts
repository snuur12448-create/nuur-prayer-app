import { useMemo } from "react";
import type { PrayerTimesResult, PrayerTime } from "@/utils/prayerTimes";
import { ARABIC } from "./constants";
import {
  blendedSky,
  buildStars,
  formatHm,
  horizonOf,
  skyFor,
  timeFractionOfDay,
  timeFractionOfNight,
  useReduceMotion,
} from "./skyMath";

export type ArcSpec = {
  id: "dhuhr" | "asr" | "maghrib";
  en: string;
  time: string;
  angle: number;
  status: "past" | "now" | "next" | "upcoming";
};

export type NightSpec = {
  id: "fajr" | "isha";
  en: string;
  time: string;
  sub: string;
  side: "left" | "right";
  status: "past" | "now" | "next" | "upcoming";
};

export type NightArcSpec = {
  id: "maghrib" | "isha" | "lastThird" | "fajr" | "sunrise";
  label: string;
  time: string;
  ar?: string;
  sub?: string;
  angle: number;
  kind: "prayer" | "gateway" | "window";
  status: "past" | "now" | "next" | "upcoming";
};

export interface UseSkyStateInput {
  prayerTimes: PrayerTimesResult | null;
  currentPrayer: PrayerTime | null;
  nextPrayer: PrayerTime | null;
  nowMs: number;
  isNight: boolean;
  W: number;
  cy: number;
  R: number;
  cx: number;
}

export interface SkyState {
  reduceMotion: boolean;
  curName: string | null;
  isDay: boolean;
  // Sky
  grad: string[];
  twilight: number;
  horizonColor: string;
  ink: string;
  inkSoft: (a: number) => string;
  // Bodies
  dayBodyDeg: number;
  nightBodyDeg: number;
  bodyDeg: number;
  dayBodyX: number;
  dayBodyY: number;
  nightBodyX: number;
  nightBodyY: number;
  bodyX: number;
  bodyY: number;
  bodyElev: number;
  horizonProx: number;
  glowBoost: number;
  // Transitions
  nightT: number;
  swapT: number;
  sunsetFlash: number;
  isDawnFlash: boolean;
  nightActive: boolean;
  dayActive: boolean;
  // Anchors
  arcPrayers: ArcSpec[];
  nightPrayers: NightSpec[];
  nightArcPrayers: NightArcSpec[];
  preDawn: boolean;
  // Misc
  nowLabel: string;
  stars: ReturnType<typeof buildStars>;
}

export function useSkyState(input: UseSkyStateInput): SkyState {
  const { prayerTimes, currentPrayer, nextPrayer, nowMs, isNight, W, cy, R, cx } = input;

  const reduceMotion = useReduceMotion();
  const curName = currentPrayer?.name?.toLowerCase() ?? null;
  const ptSunriseMs = prayerTimes ? prayerTimes.sunrise.time.getTime() : null;
  const ptMaghribMs = prayerTimes ? prayerTimes.maghrib.time.getTime() : null;
  const blended = useMemo(
    () => blendedSky(curName, nowMs, ptSunriseMs, ptMaghribMs),
    [curName, nowMs, ptSunriseMs, ptMaghribMs],
  );
  const grad = reduceMotion ? skyFor(curName) : blended.grad;
  const twilight = reduceMotion ? 0 : blended.twilight;
  const horizonColor = horizonOf(grad);
  const isDay = !isNight;
  const ink = isDay ? "#FFE4B5" : "#C9D4F0";
  const inkSoft = (a: number) => (isDay ? `rgba(255,228,181,${a})` : `rgba(201,212,240,${a})`);

  // ── Body angle (sun by day, moon by night) ────────────────────────────────
  const dayBodyDeg = useMemo(() => {
    if (!prayerTimes) return -90;
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const sunsetMs = prayerTimes.maghrib.time.getTime();
    const f = timeFractionOfDay(nowMs, sunriseMs, sunsetMs);
    return -180 + f * 180;
  }, [prayerTimes, nowMs]);
  const nightBodyDeg = useMemo(() => {
    if (!prayerTimes) return -90;
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const sunsetMs = prayerTimes.maghrib.time.getTime();
    const beforeMaghrib = nowMs < sunsetMs;
    const startMs = beforeMaghrib ? sunsetMs - 24 * 3600 * 1000 : sunsetMs;
    const endMs = sunriseMs > startMs ? sunriseMs : sunriseMs + 24 * 3600 * 1000;
    const f = timeFractionOfNight(nowMs, startMs, endMs);
    return -180 + f * 180;
  }, [prayerTimes, nowMs]);
  const bodyDeg = isDay ? dayBodyDeg : nightBodyDeg;

  // ── Day→Night cross-fade (sunset animation) ──────────────────────────────
  const nightT = useMemo(() => {
    if (!prayerTimes) return isNight ? 1 : 0;
    const maghribMs = prayerTimes.maghrib.time.getTime();
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const SUNSET_FADE_START = maghribMs - 5 * 60 * 1000;
    const SUNSET_FADE_END = maghribMs + 25 * 60 * 1000;
    const SUNRISE_FADE_START = sunriseMs - 5 * 60 * 1000;
    const SUNRISE_FADE_END = sunriseMs + 5 * 60 * 1000;
    if (nowMs < maghribMs) {
      if (nowMs <= SUNRISE_FADE_START) return 1;
      if (nowMs >= SUNRISE_FADE_END) return 0;
      return 1 - (nowMs - SUNRISE_FADE_START) / (SUNRISE_FADE_END - SUNRISE_FADE_START);
    }
    if (nowMs <= SUNSET_FADE_START) return 0;
    if (nowMs >= SUNSET_FADE_END) return 1;
    return (nowMs - SUNSET_FADE_START) / (SUNSET_FADE_END - SUNSET_FADE_START);
  }, [prayerTimes, nowMs, isNight]);

  // ── Sharp body swap ───────────────────────────────────────────────────────
  const swapT = useMemo(() => {
    if (!prayerTimes) return isNight ? 1 : 0;
    if (reduceMotion) return isNight ? 1 : 0;
    const maghribMs = prayerTimes.maghrib.time.getTime();
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const HALF = 30 * 1000;
    if (nowMs >= maghribMs) {
      const dt = (nowMs - (maghribMs + 15 * 1000)) / HALF;
      return 1 / (1 + Math.exp(-6 * dt));
    }
    const dt = (nowMs - (sunriseMs - 15 * 1000)) / HALF;
    return 1 / (1 + Math.exp(6 * dt));
  }, [prayerTimes, nowMs, isNight, reduceMotion]);

  const sunsetFlash = useMemo(() => {
    if (!prayerTimes || reduceMotion) return 0;
    const maghribMs = prayerTimes.maghrib.time.getTime();
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const APPROACH = 3 * 60 * 1000;
    const RECEDE = 3 * 60 * 1000;
    const ramp = (peakMs: number) => {
      const dt = nowMs - peakMs;
      if (dt < -APPROACH || dt > RECEDE) return 0;
      if (dt <= 0) {
        const x = 1 - Math.abs(dt) / APPROACH;
        return x * x * x;
      }
      const x = 1 - dt / RECEDE;
      return x * x;
    };
    return Math.max(ramp(maghribMs + 15 * 1000), ramp(sunriseMs - 15 * 1000));
  }, [prayerTimes, nowMs, reduceMotion]);

  const nightActive = swapT > 0.01;
  const dayActive = swapT < 0.99;
  const isDawnFlash = useMemo(() => {
    if (!prayerTimes) return false;
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    return Math.abs(nowMs - sunriseMs) < 6 * 60 * 1000;
  }, [prayerTimes, nowMs]);

  // ── Independent body coords ──────────────────────────────────────────────
  const dayBodyRad = (dayBodyDeg * Math.PI) / 180;
  const dayBodyX = cx + R * Math.cos(dayBodyRad);
  const dayBodyY = cy + R * Math.sin(dayBodyRad);
  const nightBodyRad = (nightBodyDeg * Math.PI) / 180;
  const nightBodyX = cx + R * Math.cos(nightBodyRad);
  const nightBodyY = cy + R * Math.sin(nightBodyRad);
  const bodyRad = (bodyDeg * Math.PI) / 180;
  const bodyX = isDay ? dayBodyX : nightBodyX;
  const bodyY = isDay ? dayBodyY : nightBodyY;
  const bodyElev = Math.max(0, Math.min(1, -Math.sin(bodyRad)));
  const horizonProx = 1 - bodyElev;
  const glowBoost = reduceMotion ? 0 : Math.max(horizonProx * 0.7, twilight);

  const nowLabel = useMemo(() => {
    const d = new Date(nowMs);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }, [nowMs]);

  // ── Arc prayers (Dhuhr / Asr / Maghrib) ──────────────────────────────────
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

  const nightArcPrayers = useMemo<NightArcSpec[]>(() => {
    if (!prayerTimes) return [];
    const maghribMs = prayerTimes.maghrib.time.getTime();
    const fajrMs = prayerTimes.fajr.time.getTime();
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const ishaMs = prayerTimes.isha.time.getTime();
    const startMs = nowMs < maghribMs ? maghribMs - 24 * 3600 * 1000 : maghribMs;
    const endMs = sunriseMs > startMs ? sunriseMs : sunriseMs + 24 * 3600 * 1000;
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

  return {
    reduceMotion,
    curName,
    isDay,
    grad,
    twilight,
    horizonColor,
    ink,
    inkSoft,
    dayBodyDeg,
    nightBodyDeg,
    bodyDeg,
    dayBodyX,
    dayBodyY,
    nightBodyX,
    nightBodyY,
    bodyX,
    bodyY,
    bodyElev,
    horizonProx,
    glowBoost,
    nightT,
    swapT,
    sunsetFlash,
    isDawnFlash,
    nightActive,
    dayActive,
    arcPrayers,
    nightPrayers,
    nightArcPrayers,
    preDawn,
    nowLabel,
    stars,
  };
}
