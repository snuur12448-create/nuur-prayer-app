import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Line,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import type { PrayerTime } from "@/utils/prayerTimes";

// ─── palette per prayer (time-of-day responsive) ──────────────────────────
type PaletteKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

type Palette = {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  ember: string;
  emberBright: string;
  emberDim: string;
  horizonGlowAlpha: number;
  starCount: number;
  starOpacity: number;
  arabicTextColor: string;
};

const PALETTES: Record<PaletteKey, Palette> = {
  fajr: {
    skyTop: "#0D1733",
    skyMid: "#2E1F3A",
    skyHorizon: "#6B3548",
    ember: "#D4708F",
    emberBright: "#F4C2D2",
    emberDim: "#7A3550",
    horizonGlowAlpha: 0.4,
    starCount: 6,
    starOpacity: 0.55,
    arabicTextColor: "#FFE8EE",
  },
  sunrise: {
    skyTop: "#1A1538",
    skyMid: "#5A3548",
    skyHorizon: "#E89460",
    ember: "#F4A77E",
    emberBright: "#FFD4A8",
    emberDim: "#A8623E",
    horizonGlowAlpha: 0.55,
    starCount: 2,
    starOpacity: 0.3,
    arabicTextColor: "#FFE8D8",
  },
  dhuhr: {
    skyTop: "#0F2D3D",
    skyMid: "#1F4E5F",
    skyHorizon: "#C99B3A",
    ember: "#F4C84A",
    emberBright: "#FFEDA8",
    emberDim: "#A8782A",
    horizonGlowAlpha: 0.55,
    starCount: 0,
    starOpacity: 0,
    arabicTextColor: "#FFF8DC",
  },
  asr: {
    skyTop: "#1F2A1A",
    skyMid: "#4A3520",
    skyHorizon: "#A6712A",
    ember: "#E89A3A",
    emberBright: "#FFD080",
    emberDim: "#8C5520",
    horizonGlowAlpha: 0.45,
    starCount: 0,
    starOpacity: 0,
    arabicTextColor: "#FFF0D0",
  },
  maghrib: {
    skyTop: "#1A0F22",
    skyMid: "#3D1830",
    skyHorizon: "#7A2818",
    ember: "#E07A2A",
    emberBright: "#FFB055",
    emberDim: "#9C4A1F",
    horizonGlowAlpha: 0.45,
    starCount: 10,
    starOpacity: 0.55,
    arabicTextColor: "#FFF6E0",
  },
  isha: {
    skyTop: "#070D1F",
    skyMid: "#0F1845",
    skyHorizon: "#1A2A5F",
    ember: "#9BA8E8",
    emberBright: "#E8E8FF",
    emberDim: "#5060A8",
    horizonGlowAlpha: 0.18,
    starCount: 22,
    starOpacity: 0.75,
    arabicTextColor: "#E8EEFF",
  },
};

const PRAYER_ORDER: PaletteKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

const PRAYER_STATIC_ARABIC: Record<PaletteKey, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

const PRAYER_LABEL_FALLBACK: Record<PaletteKey, string> = {
  fajr: "Fajr",
  sunrise: "Shurūq",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

function paletteKeyFor(name: string | undefined | null): PaletteKey {
  const n = (name ?? "dhuhr").toLowerCase();
  if (n === "fajr" || n === "sunrise" || n === "dhuhr" || n === "asr" || n === "maghrib" || n === "isha") {
    return n;
  }
  return "dhuhr";
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Fixed star slots — predictable, sized down for taste
const STAR_SLOTS = [
  { x: 12, y: 18, r: 0.8, o: 0.6 },
  { x: 48, y: 32, r: 0.5, o: 0.4 },
  { x: 88, y: 14, r: 0.7, o: 0.5 },
  { x: 142, y: 40, r: 0.6, o: 0.45 },
  { x: 198, y: 22, r: 0.9, o: 0.7 },
  { x: 246, y: 50, r: 0.5, o: 0.4 },
  { x: 290, y: 18, r: 0.7, o: 0.55 },
  { x: 332, y: 36, r: 0.6, o: 0.45 },
  { x: 24, y: 60, r: 0.4, o: 0.3 },
  { x: 312, y: 62, r: 0.5, o: 0.4 },
  { x: 60, y: 8, r: 0.6, o: 0.5 },
  { x: 110, y: 56, r: 0.5, o: 0.4 },
  { x: 168, y: 68, r: 0.4, o: 0.35 },
  { x: 220, y: 8, r: 0.7, o: 0.55 },
  { x: 264, y: 28, r: 0.4, o: 0.35 },
  { x: 304, y: 48, r: 0.5, o: 0.4 },
  { x: 78, y: 46, r: 0.4, o: 0.3 },
  { x: 184, y: 14, r: 0.5, o: 0.4 },
  { x: 232, y: 70, r: 0.6, o: 0.45 },
  { x: 348, y: 22, r: 0.4, o: 0.35 },
  { x: 4, y: 38, r: 0.5, o: 0.4 },
  { x: 124, y: 26, r: 0.6, o: 0.5 },
];

// ─── component ────────────────────────────────────────────────────────────
export type CelestialArcCardProps = {
  currentPrayer: PrayerTime | null;
  nextPrayer: PrayerTime | null;
  progressEndPrayer: PrayerTime | null;
  progress: number; // 0–1
  timeRemaining: string;
  isLoading: boolean;
  themeGold: string;
};

export function CelestialArcCard({
  currentPrayer,
  nextPrayer,
  progressEndPrayer,
  progress,
  timeRemaining,
  isLoading,
  themeGold,
}: CelestialArcCardProps) {
  // Display state: "now" if a current period exists, else "upcoming" before Fajr
  const isNow = !!currentPrayer;
  const display = currentPrayer ?? nextPrayer;

  const paletteKey = paletteKeyFor(display?.name);
  const palette = PALETTES[paletteKey];

  // Window edges — what ends the current window, what's just past
  const idx = PRAYER_ORDER.indexOf(paletteKey);
  const prevLabel = PRAYER_LABEL_FALLBACK[PRAYER_ORDER[(idx - 1 + 6) % 6]];
  const nextLabel = progressEndPrayer?.name ?? PRAYER_LABEL_FALLBACK[PRAYER_ORDER[(idx + 1) % 6]];

  const arabic = display?.arabicName ?? PRAYER_STATIC_ARABIC[paletteKey];
  const englishName = display?.name ?? PRAYER_LABEL_FALLBACK[paletteKey];
  const time = display?.timeString ?? "--:--";

  // Arc geometry — shallow circular arc fitted to the banner band so the
  // marker (moon/sun) stays visible across the FULL sweep, edge to edge.
  // We compute R from the chord (horizontal span) and sagitta (rise height).
  const W = 358;
  const H = 66;
  const PAD_TOP = 14;          // breathing room above the apex
  const PAD_BOTTOM = 6;        // small baseline gap
  const PAD_X = 16;            // horizontal margin so marker doesn't touch edges
  const sag = H - PAD_TOP - PAD_BOTTOM; // arc rise height
  const chord = W - PAD_X * 2;          // horizontal arc span
  const ARC_R = sag / 2 + (chord * chord) / (8 * sag);
  const CX = W / 2;
  const CY = PAD_TOP + ARC_R;           // center sits below the band
  const halfAngle = Math.asin((chord / 2) / ARC_R);
  const thetaStart = -Math.PI / 2 - halfAngle;
  const thetaEnd = -Math.PI / 2 + halfAngle;
  const t = Math.max(0, Math.min(1, progress));
  const theta = thetaStart + t * (thetaEnd - thetaStart);
  const markerX = CX + ARC_R * Math.cos(theta);
  const markerY = CY + ARC_R * Math.sin(theta);
  // Path endpoints — left and right horizon
  const arcLeftX = CX + ARC_R * Math.cos(thetaStart);
  const arcLeftY = CY + ARC_R * Math.sin(thetaStart);
  const arcRightX = CX + ARC_R * Math.cos(thetaEnd);
  const arcRightY = CY + ARC_R * Math.sin(thetaEnd);

  const stars = useMemo(() => STAR_SLOTS.slice(0, palette.starCount), [palette.starCount]);

  const countdownText = isNow ? `${timeRemaining} left` : `in ${timeRemaining}`;
  const windowNote = isNow && progressEndPrayer
    ? `window closes at ${progressEndPrayer.timeString} (${progressEndPrayer.name})`
    : nextPrayer
      ? `begins at ${nextPrayer.timeString}`
      : "";

  const a11yLabel = isLoading
    ? "Loading prayer times"
    : isNow
      ? `${englishName} prayer in progress, ${timeRemaining} remaining${progressEndPrayer ? `, window closes at ${progressEndPrayer.timeString}` : ""}`
      : `Upcoming prayer ${englishName} at ${time}, in ${timeRemaining}`;

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={a11yLabel}
      style={[
        styles.card,
        {
          borderColor: palette.emberDim + "55",
          shadowColor: palette.ember,
        },
      ]}
    >
      {/* Sky gradient */}
      <LinearGradient
        colors={[palette.skyTop, palette.skyMid, palette.skyHorizon]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft horizon glow at the bottom */}
      <LinearGradient
        colors={["transparent", hexA(palette.ember, palette.horizonGlowAlpha * 0.6), hexA(palette.ember, palette.horizonGlowAlpha)]}
        style={[StyleSheet.absoluteFill, { top: "55%" }]}
        pointerEvents="none"
      />

      {/* Stars (smaller field across the arc band only) */}
      {stars.length > 0 && (
        <Svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={styles.stars}
          pointerEvents="none"
        >
          {stars.map((s, i) => (
            <Circle
              key={i}
              cx={s.x}
              cy={(s.y / 90) * H}
              r={s.r}
              fill="#F4E4C5"
              opacity={s.o * palette.starOpacity}
            />
          ))}
        </Svg>
      )}

      {/* Arc band — flat banner across the top */}
      <View style={styles.arcBand}>
        <Svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            <SvgLinearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0" stopColor="#F4E4C5" stopOpacity={0.18} />
              <Stop offset={String(t)} stopColor={palette.emberBright} stopOpacity={0.95} />
              <Stop offset={String(Math.min(t + 0.01, 1))} stopColor="#F4E4C5" stopOpacity={0.18} />
              <Stop offset="1" stopColor="#F4E4C5" stopOpacity={0.18} />
            </SvgLinearGradient>
          </Defs>

          {/* Faint full arc — visible portion only */}
          <Path
            d={`M ${arcLeftX} ${arcLeftY} A ${ARC_R} ${ARC_R} 0 0 1 ${arcRightX} ${arcRightY}`}
            stroke="#F4E4C533"
            strokeWidth={1}
            fill="none"
          />
          {/* Walked + glowing arc */}
          <Path
            d={`M ${arcLeftX} ${arcLeftY} A ${ARC_R} ${ARC_R} 0 0 1 ${markerX} ${markerY}`}
            stroke="url(#arcGrad)"
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />

          {/* Horizon labels — previous/next prayer */}
          <SvgText
            x={6}
            y={H - 5}
            fontSize={8}
            fill="#F4E4C5"
            opacity={0.55}
            textAnchor="start"
          >
            {prevLabel}
          </SvgText>
          <SvgText
            x={W - 6}
            y={H - 5}
            fontSize={8}
            fill="#F4E4C5"
            opacity={0.55}
            textAnchor="end"
          >
            {nextLabel}
          </SvgText>

          {/* Marker — concentric halo */}
          <Circle cx={markerX} cy={markerY} r={11} fill={palette.ember} opacity={0.18} />
          <Circle cx={markerX} cy={markerY} r={7} fill={palette.ember} opacity={0.4} />
          <Circle cx={markerX} cy={markerY} r={4.5} fill={palette.emberBright} />
          <Circle cx={markerX} cy={markerY} r={1.8} fill="#FFFFFF" />
        </Svg>

        {/* NOW / UPCOMING corner badge */}
        <View
          style={[
            styles.cornerPill,
            {
              backgroundColor: hexA(palette.ember, 0.22),
              borderColor: hexA(palette.ember, 0.5),
            },
          ]}
        >
          <View
            style={[
              styles.nowPillDot,
              {
                backgroundColor: palette.emberBright,
                shadowColor: palette.emberBright,
              },
            ]}
          />
          <Text
            maxFontSizeMultiplier={1.2}
            style={[styles.nowPillText, { color: palette.emberBright }]}
          >
            {isNow ? "NOW" : "NEXT"}
          </Text>
        </View>
      </View>

      {/* Content row — name on the left, time + countdown on the right */}
      <View style={styles.contentRow}>
        <View style={styles.nameCol}>
          <Text
            maxFontSizeMultiplier={1.15}
            adjustsFontSizeToFit
            style={[
              styles.arabicInline,
              {
                color: isLoading ? "transparent" : palette.arabicTextColor,
                textShadowColor: hexA(palette.ember, 0.55),
              },
            ]}
            numberOfLines={1}
          >
            {arabic}
          </Text>
          <Text
            maxFontSizeMultiplier={1.3}
            style={[styles.englishInline, { color: isLoading ? "transparent" : "#F4E4C5" }]}
            numberOfLines={1}
          >
            {englishName}
            {!!windowNote && !isLoading ? (
              <Text style={styles.windowNoteInline}>  ·  {windowNote}</Text>
            ) : null}
          </Text>
        </View>

        <View style={styles.timeCol}>
          <Text
            maxFontSizeMultiplier={1.25}
            style={[styles.timeInline, { color: isLoading ? "transparent" : palette.arabicTextColor }]}
            numberOfLines={1}
          >
            {time}
          </Text>
          <LinearGradient
            colors={[palette.emberBright, palette.ember]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.countdownPill}
          >
            <Text
              maxFontSizeMultiplier={1.25}
              style={styles.countdownText}
              numberOfLines={1}
            >
              {isLoading ? "—" : countdownText}
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Filigree hairline — single thin gradient line, no arches */}
      <Svg width="100%" height={3} viewBox="0 0 320 3" preserveAspectRatio="none" style={styles.hairline}>
        <Defs>
          <SvgLinearGradient id="filigreeFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0" stopColor={themeGold} stopOpacity={0} />
            <Stop offset="0.5" stopColor={themeGold} stopOpacity={0.7} />
            <Stop offset="1" stopColor={themeGold} stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>
        <Line x1={0} y1={1.5} x2={320} y2={1.5} stroke="url(#filigreeFade)" strokeWidth={0.6} />
        <Circle cx={160} cy={1.5} r={1.4} fill={themeGold} opacity={0.85} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginTop: 14,
    paddingBottom: 10,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
      android: { elevation: 6 },
      default: {},
    }),
  },
  stars: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  arcBand: {
    height: 66,
    width: "100%",
    position: "relative",
  },
  cornerPill: {
    position: "absolute",
    top: 8,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  nowPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 3 },
      android: { elevation: 2 },
      default: {},
    }),
  },
  nowPillText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
    includeFontPadding: false,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 10,
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
  },
  arabicInline: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 30,
    lineHeight: 38,
    includeFontPadding: false,
    writingDirection: "rtl",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
    textAlign: "left",
  },
  englishInline: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    marginTop: 1,
    includeFontPadding: false,
  },
  windowNoteInline: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#F4E4C599",
    fontStyle: "italic",
    letterSpacing: 0,
  },
  timeCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  timeInline: {
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  countdownPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  countdownText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.4,
    color: "#1A0F00",
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  hairline: {
    marginTop: 4,
    paddingHorizontal: 16,
  },
});
