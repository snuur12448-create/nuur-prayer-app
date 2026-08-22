import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import type { PrayerTime, PrayerTimesResult } from "@/utils/prayerTimes";

/**
 * Night dome — Maghrib → Sunrise arc with the moon as your time-marker.
 * Anchors on the arc: Maghrib · Isha · Last 1/3 · Fajr · Sunrise.
 * All daytime prayers collapse into a chip strip below (rendered separately).
 *
 * Geometry mirrors CelestialArcCard but with a richer set of anchors and a
 * night palette. Width 358 fits the same 16-px-padded card slot.
 */

type Status = "past" | "now" | "next" | "upcoming";

const W = 358;
const H = 220;
const PAD_X = 24;
const PAD_TOP = 28;
const PAD_BOTTOM = 36;
const sag = H - PAD_TOP - PAD_BOTTOM;
const chord = W - PAD_X * 2;
const ARC_R = sag / 2 + (chord * chord) / (8 * sag);
const CX = W / 2;
const CY = PAD_TOP + ARC_R;
const halfAngle = Math.asin((chord / 2) / ARC_R);
const thetaStart = -Math.PI / 2 - halfAngle;
const thetaEnd = -Math.PI / 2 + halfAngle;

function pointAt(t: number) {
  const theta = thetaStart + t * (thetaEnd - thetaStart);
  return { x: CX + ARC_R * Math.cos(theta), y: CY + ARC_R * Math.sin(theta), theta };
}

const STAR_FIELD = [
  { x: 14, y: 22, r: 1.0, o: 0.55 },
  { x: 38, y: 12, r: 0.7, o: 0.4 },
  { x: 64, y: 36, r: 1.2, o: 0.7 },
  { x: 92, y: 18, r: 0.6, o: 0.45 },
  { x: 124, y: 28, r: 0.9, o: 0.6 },
  { x: 156, y: 10, r: 0.8, o: 0.55 },
  { x: 188, y: 22, r: 0.6, o: 0.4 },
  { x: 218, y: 14, r: 1.0, o: 0.65 },
  { x: 246, y: 32, r: 0.7, o: 0.45 },
  { x: 278, y: 18, r: 0.9, o: 0.55 },
  { x: 310, y: 26, r: 0.6, o: 0.4 },
  { x: 336, y: 14, r: 0.8, o: 0.5 },
  { x: 22, y: 50, r: 0.5, o: 0.35 },
  { x: 84, y: 64, r: 0.7, o: 0.45 },
  { x: 174, y: 66, r: 0.6, o: 0.4 },
  { x: 264, y: 60, r: 0.5, o: 0.35 },
  { x: 326, y: 52, r: 0.7, o: 0.45 },
  { x: 50, y: 80, r: 0.4, o: 0.3 },
  { x: 200, y: 86, r: 0.5, o: 0.35 },
  { x: 304, y: 78, r: 0.4, o: 0.3 },
];

export interface CelestialDomeNightProps {
  prayerTimes: PrayerTimesResult | null;
  /** ms since epoch for "now" in the night (used to position the moon) */
  nowMs: number;
  /** sunset time used as the start of the night (= Maghrib) */
  nightStartMs: number;
  /** next sunrise time used as the end of the night */
  nightEndMs: number;
  /** When near Fajr / dawn, the right side gets a pre-dawn glow */
  dawnApproaching: boolean;
  themeGold: string;
  /** Status of Isha / Fajr for marker styling */
  ishaStatus: Status;
  fajrStatus: Status;
  countdownLabel: string;
  countdownValue: string;
  isNow: boolean;
}

export function CelestialDomeNight({
  prayerTimes,
  nowMs,
  nightStartMs,
  nightEndMs,
  dawnApproaching,
  themeGold,
  ishaStatus,
  fajrStatus,
  countdownLabel,
  countdownValue,
  isNow,
}: CelestialDomeNightProps) {
  const totalNight = Math.max(1, nightEndMs - nightStartMs);
  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  // Position helpers
  const pctOf = (ms: number) => clamp((ms - nightStartMs) / totalNight);

  // Last 1/3 of the night
  const lastThirdMs = nightStartMs + (2 / 3) * totalNight;

  // Anchors (filter out missing ones gracefully)
  const anchors = useMemo(() => {
    const ms = (p: PrayerTime | null | undefined) => p?.time?.getTime();
    const list: Array<{
      id: string;
      label: string;
      time: string | null;
      pct: number;
      kind: "gateway" | "prayer" | "window";
      status: Status;
      sub?: string;
    }> = [];
    list.push({
      id: "maghrib",
      label: "MAGHRIB",
      time: prayerTimes?.maghrib.timeString ?? null,
      pct: 0,
      kind: "gateway",
      status: "past",
      sub: "night begins",
    });
    const ishaT = ms(prayerTimes?.isha);
    if (ishaT) {
      list.push({
        id: "isha",
        label: "ISHA",
        time: prayerTimes?.isha.timeString ?? null,
        pct: pctOf(ishaT),
        kind: "prayer",
        status: ishaStatus,
      });
    }
    list.push({
      id: "lastThird",
      label: "LAST 1/3",
      time: formatClock(lastThirdMs),
      pct: pctOf(lastThirdMs),
      kind: "window",
      status: nowMs >= lastThirdMs ? "past" : "upcoming",
      sub: "tahajjud",
    });
    // Fajr — could be tomorrow's Fajr if night spans midnight. We approximate by
    // mapping Fajr's wall-clock to its position within the night window.
    const fajrT = ms(prayerTimes?.fajr);
    if (fajrT) {
      // If the prayerTimes.fajr is today's Fajr in the morning (i.e. before sunset),
      // it likely already passed. We need tomorrow's Fajr position. Detect by clock.
      const fajrPct =
        fajrT < nightStartMs
          ? pctOf(fajrT + 24 * 60 * 60 * 1000) // shift forward a day
          : pctOf(fajrT);
      list.push({
        id: "fajr",
        label: "FAJR",
        time: prayerTimes?.fajr.timeString ?? null,
        pct: clamp(fajrPct),
        kind: "prayer",
        status: fajrStatus,
      });
    }
    list.push({
      id: "sunrise",
      label: "SUNRISE",
      time: prayerTimes?.sunrise.timeString ?? null,
      pct: 1,
      kind: "gateway",
      status: fajrStatus === "now" ? "next" : "upcoming",
      sub: "fajr ends",
    });
    return list;
  }, [prayerTimes, nightStartMs, nightEndMs, ishaStatus, fajrStatus, nowMs, lastThirdMs, totalNight]);

  const moonPct = clamp((nowMs - nightStartMs) / totalNight);
  const moon = pointAt(moonPct);

  const arcLeft = pointAt(0);
  const arcRight = pointAt(1);

  // Decide label position (above / below) so the moon doesn't overlap labels
  const labelAboveBelow = (anchorPct: number, kind: "gateway" | "prayer" | "window") => {
    if (kind === "gateway") return "below" as const;
    const moonClose = Math.abs(anchorPct - moonPct) < 0.06;
    return moonClose ? "above" : "below" as const;
  };

  return (
    <View style={styles.card}>
      {/* Sky gradient — deep midnight; for dawn-approaching the right edge warms */}
      <LinearGradient
        colors={["#02030E", "#060820", "#0A0E2A"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      {dawnApproaching && (
        <LinearGradient
          colors={["transparent", "rgba(74,42,62,0.45)", "rgba(180,90,80,0.35)"]}
          start={{ x: 0.55, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}

      {/* Stars */}
      <Svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {STAR_FIELD.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#DCE8FF" opacity={s.o} />
        ))}
      </Svg>

      {/* Dome SVG */}
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <SvgLinearGradient id="nightArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0" stopColor="#C9D4F0" stopOpacity={0.18} />
            <Stop offset="0.5" stopColor="#C9D4F0" stopOpacity={0.5} />
            <Stop offset="1" stopColor="#C9D4F0" stopOpacity={0.18} />
          </SvgLinearGradient>
          <RadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#E8EEFF" stopOpacity={0.55} />
            <Stop offset="55%" stopColor="#A8B4DC" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#A8B4DC" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Dotted dome */}
        <Path
          d={`M ${arcLeft.x} ${arcLeft.y} A ${ARC_R} ${ARC_R} 0 0 1 ${arcRight.x} ${arcRight.y}`}
          fill="none"
          stroke="url(#nightArc)"
          strokeWidth={1.2}
          strokeDasharray="2 5"
        />

        {/* Horizon */}
        <Path
          d={`M ${PAD_X / 2} ${arcLeft.y + 2} L ${W - PAD_X / 2} ${arcRight.y + 2}`}
          stroke="rgba(201,212,240,0.32)"
          strokeWidth={1}
          fill="none"
        />

        {/* Anchors */}
        {anchors.map((a) => {
          const p = pointAt(a.pct);
          const isPrayer = a.kind === "prayer";
          const isWindow = a.kind === "window";
          const past = a.status === "past";
          const now = a.status === "now";
          const next = a.status === "next";
          const labelDir = labelAboveBelow(a.pct, a.kind);
          const labelDy = labelDir === "above" ? -16 : 16;
          const timeDy = labelDir === "above" ? -6 : 26;
          const subDy = labelDir === "above" ? -27 : 36;
          // Use side-anchored labels well into the arc so early/late prayers
          // (Isha just after Maghrib, Fajr just before Sunrise) don't get
          // their labels clipped by the view edge.
          const anchor: "start" | "middle" | "end" =
            a.pct < 0.22 ? "start" : a.pct > 0.78 ? "end" : "middle";
          const dx = anchor === "start" ? 8 : anchor === "end" ? -8 : 0;
          const markerColor = isPrayer ? "#FFE4B5" : isWindow ? "#C9D4F0" : "rgba(201,212,240,0.85)";
          const r = now ? 6 : isPrayer ? 4.5 : 3;
          const opacity = past && !isPrayer ? 0.5 : isWindow ? 0.75 : 1;
          return (
            <React.Fragment key={a.id}>
              <Circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={now || past ? markerColor : "transparent"}
                stroke={markerColor}
                strokeWidth={now ? 1.8 : 1.4}
                opacity={opacity}
              />
              {now && <Circle cx={p.x} cy={p.y} r={10} fill="none" stroke={markerColor} strokeWidth={1} opacity={0.4} />}
              {next && (
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={8}
                  fill="none"
                  stroke={markerColor}
                  strokeWidth={1}
                  opacity={0.55}
                  strokeDasharray="2 2"
                />
              )}
              {past && isPrayer && (
                <SvgText
                  x={p.x}
                  y={p.y + 2.5}
                  textAnchor="middle"
                  fontSize={6.5}
                  fontWeight="900"
                  fill="#0A0E2A"
                >
                  ✓
                </SvgText>
              )}
              <SvgText
                x={p.x + dx}
                y={p.y + labelDy}
                textAnchor={anchor}
                fontSize={isPrayer ? 8.5 : 7.5}
                fontWeight="700"
                fill={isPrayer ? "rgba(255,228,181,0.95)" : "rgba(201,212,240,0.85)"}
                letterSpacing={1}
              >
                {a.label}
              </SvgText>
              {a.time && (
                <SvgText
                  x={p.x + dx}
                  y={p.y + timeDy}
                  textAnchor={anchor}
                  fontSize={8}
                  fontWeight="500"
                  fill={isPrayer ? "rgba(255,228,181,0.7)" : "rgba(201,212,240,0.6)"}
                >
                  {a.time}
                </SvgText>
              )}
              {a.sub && (
                <SvgText
                  x={p.x + dx}
                  y={p.y + subDy}
                  textAnchor={anchor}
                  fontSize={7}
                  fontWeight="500"
                  fontStyle="italic"
                  fill="rgba(201,212,240,0.42)"
                >
                  {a.sub}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}

        {/* Moon — your time-marker */}
        <Circle cx={moon.x} cy={moon.y} r={28} fill="url(#moonGlow)" />
        <Circle cx={moon.x} cy={moon.y} r={11} fill="#E8EEFF" />
        {/* crescent cut, decorative */}
        <Circle cx={moon.x + (dawnApproaching ? 4.5 : -3.5)} cy={moon.y - 1} r={9} fill="#060820" />
      </Svg>

      {/* Now / countdown overlay */}
      <View style={styles.contentRow}>
        <View style={styles.nameCol}>
          <View style={styles.nowPillRow}>
            <View style={[styles.nowDot, { backgroundColor: themeGold }]} />
            <Text style={[styles.nowLabel, { color: themeGold }]}>{isNow ? "NOW · IN PROGRESS" : "UPCOMING"}</Text>
          </View>
          <View style={styles.nameLine}>
            <Text style={styles.englishName}>{isNow ? "Isha" : fajrStatus === "now" ? "Fajr" : "Fajr"}</Text>
            <Text style={[styles.arabicName, { color: themeGold }]}>
              {isNow ? "العشاء" : "الفجر"}
            </Text>
          </View>
        </View>
        <View style={styles.timeCol}>
          <Text style={styles.countdownLabel}>{countdownLabel}</Text>
          <Text style={styles.countdownValue}>{countdownValue}</Text>
        </View>
      </View>
    </View>
  );
}

function formatClock(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201,212,240,0.18)",
    marginTop: 14,
    backgroundColor: "#02030E",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14 },
      android: { elevation: 6 },
      default: {},
    }),
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,
  },
  nameCol: { flex: 1, minWidth: 0 },
  nowPillRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  nowDot: { width: 6, height: 6, borderRadius: 3 },
  nowLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.6,
  },
  nameLine: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  englishName: { fontSize: 20, color: "#E8EAE6", fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  arabicName: { fontSize: 18, fontFamily: "AmiriQuran_400Regular", includeFontPadding: false },
  timeCol: { alignItems: "flex-end" },
  countdownLabel: { fontSize: 9, color: "rgba(201,212,240,0.6)", fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  countdownValue: {
    fontSize: 22,
    color: "#E8EAE6",
    fontFamily: "Inter_400Regular",
    fontVariant: ["tabular-nums"],
    marginTop: 2,
  },
});
