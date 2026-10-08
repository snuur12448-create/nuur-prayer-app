import React, { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { PrayerTimesResult, PrayerTime } from "@/utils/prayerTimes";
import type { HomeNightWindow } from "@/utils/homeNightWindow";
import type { TrackerPrayerKey } from "@/context/PrayerTrackerContext";
import type { PrayerKey } from "@/utils/prayerNotifData";
import { ARABIC, TRACKER_FIVE, type ThemeColors } from "./home/constants";
import { tapHaptic, timeFractionOfDay, timeFractionOfNight } from "./home/skyMath";
import { useSkyState } from "./home/useSkyState";
import { CelestialDome } from "./home/CelestialDome";
import { ProgressHairline } from "./home/ProgressHairline";
import { NowNextCard } from "./home/NowNextCard";
import { EarlierTodayStrip } from "./home/EarlierTodayStrip";
import { VerseOfDayCard } from "./home/VerseOfDayCard";
import { QuickActions } from "./home/QuickActions";

/**
 * HomeV2 — Celestial Dome v2 hero for the Prayer home tab.
 *
 * Thin orchestrator that wires app state into the home/* presentational
 * components: CelestialDome (sky + arc + sun/moon + top bar), ProgressHairline,
 * NowNextCard, EarlierTodayStrip (night-mode only), VerseOfDayCard,
 * QuickActions. Heavy sky/twilight/body derivations live in
 * `home/useSkyState`.
 */

export type { ThemeColors };

export interface HomeV2Props {
  colors: ThemeColors;
  topPad: number;
  prayerTimes: PrayerTimesResult | null;
  nightWindow: HomeNightWindow | null;
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
  /** True between midnight and Fajr — taps on the tracker record against
   * yesterday's date. Drives the "Recording for …" hint on the NOW card. */
  recordingForYesterday?: boolean;
  /** Short label of the date being recorded for, e.g. "Sat, Mar 14". */
  yesterdayLabel?: string;

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
  notifEnabled?: Partial<Record<PrayerKey, boolean>>;

  onLocationPress: () => void;
  onCalendarPress: () => void;
  onBellPress?: () => void;
  onTogglePrayed: (key: TrackerPrayerKey) => void;
  /** Tap on any prayer anchor on the dome → open that prayer's settings. */
  onPrayerSettingsPress?: (key: PrayerKey) => void;
  onViewTracker: () => void;
  onCopyAyah: () => void;
  onShareAyah: () => void;
  onReadAyah: () => void;
  onTasbeeh: () => void;
  onTracker: () => void;
  onHadith: () => void;
  onTahajjud: () => void;
}

export function HomeV2(props: HomeV2Props) {
  const {
    colors, topPad, prayerTimes, nightWindow, currentPrayer, nextPrayer, progressEndPrayer,
    timeRemaining, nowMs, isNight, locationLabel, hijriLabel, prayed,
    prayedCount, nowPrayedAtMs, recordingForYesterday, yesterdayLabel,
    ayah, isVerseOfNight, ayahCopied, bell, banners,
    notifEnabled, onLocationPress, onCalendarPress, onBellPress, onTogglePrayed,
    onPrayerSettingsPress, onViewTracker, onCopyAyah, onShareAyah, onReadAyah,
    onTasbeeh, onTracker, onHadith, onTahajjud,
  } = props;

  // ── Geometry ──────────────────────────────────────────────────────────────
  const { width: winW } = useWindowDimensions();
  const W = Math.min(winW, 480); // Cap width on web so the dome stays mobile-shaped
  const HERO_H = 410;
  const cx = W / 2;
  const cy = 298;
  const R = Math.min(138, W / 2 - 50);

  // ── Sky / body / anchor derivations ───────────────────────────────────────
  const sky = useSkyState({ prayerTimes, nightWindow, currentPrayer, nextPrayer, nowMs, isNight, W, cy, R, cx });
  const {
    curName, isDay, horizonColor, inkSoft, swapT, nightActive,
    sunsetFlash, isDawnFlash,
  } = sky;

  // ── Progress hairline values ──────────────────────────────────────────────
  const barFraction = useMemo(() => {
    if (!prayerTimes) return 0;
    const sunriseMs = prayerTimes.sunrise.time.getTime();
    const maghribMs = prayerTimes.maghrib.time.getTime();
    if (isDay) {
      return timeFractionOfDay(nowMs, sunriseMs, maghribMs);
    }
    if (!nightWindow) return 0;
    return timeFractionOfNight(nowMs, nightWindow.maghrib.time.getTime(), nightWindow.sunrise.time.getTime());
  }, [prayerTimes, nightWindow, nowMs, isDay]);

  const barLeft = isDay ? prayerTimes?.sunrise.timeString ?? "" : nightWindow?.maghrib.timeString ?? "";
  const barRight = isDay ? prayerTimes?.maghrib.timeString ?? "" : nightWindow?.sunrise.timeString ?? "";
  const barCentre = isDay
    ? `${Math.round(barFraction * 100)}% OF DAYLIGHT`
    : `NIGHT · ${Math.round(barFraction * 100)}% ELAPSED`;
  const barAccent = isDay ? "#FFF1C4" : "#C9D4F0";

  // ── NOW / NEXT card values ────────────────────────────────────────────────
  const isCurrentTracked = !!curName && (TRACKER_FIVE as string[]).includes(curName);
  const nowEn = currentPrayer?.name ?? "—";
  const nowAr = curName ? ARABIC[curName] ?? "" : "";
  // Display NEXT from the same target the countdown is built against
  // (`progressEndPrayer`). During Fajr that's Sunrise, not Dhuhr.
  const nextDisp = progressEndPrayer ?? nextPrayer;
  const nextEn = nextDisp?.name ?? "—";
  const nextDispName = nextDisp?.name?.toLowerCase();
  const nextAr = nextDispName ? ARABIC[nextDispName] ?? "" : "";
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
    const endStr = progressEndPrayer?.timeString ?? "—";
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
    if (!nextDispName) return "NEXT";
    if (nextDispName === "sunrise") return "UNTIL SUNRISE";
    return `UNTIL ${nextEn.toUpperCase()}`;
  })();

  // Quick actions (Tahajjud variant at night)
  const showTahajjud = isNight && curName === "isha";

  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* Page-wide sunset/sunrise glow — the dome's own flash overlay handles
          the bright core; this one carries the warmth into the cards below
          so the whole page feels lit by the setting sun. */}
      {sunsetFlash > 0.005 && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { opacity: Math.min(1, sunsetFlash * 0.85), zIndex: 50 },
          ]}
        >
          <LinearGradient
            colors={
              isDawnFlash
                ? [
                    "rgba(255,210,170,0.85)",
                    "rgba(255,200,160,0.55)",
                    "rgba(255,190,150,0.25)",
                    "rgba(255,180,140,0)",
                  ]
                : [
                    "rgba(255,160,90,0.9)",
                    "rgba(255,140,70,0.5)",
                    "rgba(255,120,60,0.22)",
                    "rgba(255,110,55,0)",
                  ] as any
            }
            locations={[0, 0.35, 0.65, 1] as any}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      {/* SKY DOME HERO */}
      <CelestialDome
        W={W}
        HERO_H={HERO_H}
        winW={winW}
        cx={cx}
        cy={cy}
        R={R}
        topPad={topPad}
        colors={colors}
        prayerTimes={prayerTimes}
        locationLabel={locationLabel}
        hijriLabel={hijriLabel}
        bell={bell}
        notifEnabled={notifEnabled}
        sky={sky}
        onLocationPress={onLocationPress}
        onCalendarPress={onCalendarPress}
        onBellPress={onBellPress}
        onPrayerSettingsPress={onPrayerSettingsPress}
      />

      {/* Under-hero soft fade */}
      <LinearGradient
        colors={[horizonColor, colors.background]}
        style={{ height: 24 }}
      />

      {/* PROGRESS HAIRLINE */}
      <ProgressHairline
        colors={colors}
        fraction={barFraction}
        leftLabel={barLeft}
        rightLabel={barRight}
        centreLabel={barCentre}
        inkSoft16={inkSoft(0.16)}
        accent={barAccent}
      />

      {/* NOW / NEXT CARD */}
      <NowNextCard
        colors={colors}
        nowEn={nowEn}
        nowAr={nowAr}
        nowSub={prayedAgo ?? nowHasPeriod}
        prayedAgoIsGold={!!prayedAgo}
        isCurrentTracked={isCurrentTracked}
        isPrayedNow={!!isPrayedNow}
        onToggleNow={handleToggleNow}
        nextLabel={nextLabel}
        nextAt={nextAt}
        nextAr={nextAr}
        cd={cd}
        prayed={prayed}
        prayedCount={prayedCount}
        onToggleBud={handleToggleBud}
        onViewTracker={onViewTracker}
        recordingForYesterday={recordingForYesterday}
        yesterdayLabel={yesterdayLabel}
      />

      {/* EARLIER TODAY (night-mode chip strip) */}
      {prayerTimes && nightActive && (
        <EarlierTodayStrip
          colors={colors}
          prayerTimes={prayerTimes}
          prayed={prayed}
          swapT={swapT}
          onToggleBud={handleToggleBud}
        />
      )}

      {/* BANNERS */}
      {banners ? <View style={{ paddingHorizontal: 20 }}>{banners}</View> : null}

      {/* VERSE OF THE DAY */}
      <VerseOfDayCard
        colors={colors}
        ayah={ayah}
        isVerseOfNight={isVerseOfNight}
        ayahCopied={ayahCopied}
        onReadAyah={onReadAyah}
        onCopyAyah={onCopyAyah}
        onShareAyah={onShareAyah}
      />

      {/* QUICK ACTIONS + ornament */}
      <QuickActions
        colors={colors}
        showTahajjud={showTahajjud}
        onTasbeeh={onTasbeeh}
        onTracker={onTracker}
        onHadith={onHadith}
        onTahajjud={onTahajjud}
      />
    </View>
  );
}
