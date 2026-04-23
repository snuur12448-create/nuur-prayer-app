import React, { memo } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import type { PrayerTimesResult } from "@/utils/prayerTimes";
import type { PrayerKey } from "@/utils/prayerNotifData";
import type { ThemeColors } from "./constants";
import type { SkyState } from "./useSkyState";
import { tapHaptic } from "./skyMath";

export interface CelestialDomeProps {
  W: number;
  HERO_H: number;
  winW: number;
  cx: number;
  cy: number;
  R: number;
  topPad: number;
  colors: ThemeColors;
  prayerTimes: PrayerTimesResult | null;
  locationLabel: string;
  hijriLabel: string;
  bell?: {
    iconName: keyof typeof Feather.glyphMap;
    iconColor: string;
    bg: string;
    showDot: boolean;
  } | null;
  notifEnabled?: Partial<Record<PrayerKey, boolean>>;
  sky: SkyState;
  onLocationPress: () => void;
  onCalendarPress: () => void;
  onBellPress?: () => void;
  onPrayerSettingsPress?: (key: PrayerKey) => void;
}

function CelestialDomeInner(props: CelestialDomeProps) {
  const {
    W, HERO_H, winW, cx, cy, R, topPad, colors, prayerTimes,
    locationLabel, hijriLabel, bell, notifEnabled, sky,
    onLocationPress, onCalendarPress, onBellPress, onPrayerSettingsPress,
  } = props;

  const {
    grad, ink, inkSoft, isDay, swapT, nightActive, dayActive,
    sunsetFlash, isDawnFlash, glowBoost,
    dayBodyX, dayBodyY, nightBodyX, nightBodyY, nightBodyDeg, bodyDeg,
    nowLabel, stars, arcPrayers, nightPrayers, nightArcPrayers,
  } = sky;

  return (
    <View style={{ height: HERO_H, width: "100%", overflow: "hidden", position: "relative" }}>
      <LinearGradient
        colors={grad as any}
        locations={[0, 0.4, 0.8, 1] as any}
        style={StyleSheet.absoluteFill}
      />

      {/* Stars + dome SVG */}
      <Svg width={W} height={HERO_H} style={{ position: "absolute", left: (winW - W) / 2, top: 0 }}>
        {stars.map((s, i) => (
          <Circle key={`s-${i}`} cx={s.x} cy={s.y} r={s.r} fill={`rgba(220,232,255,${s.o})`} opacity={isDay ? 0.55 : 1} />
        ))}

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

        {/* Sunrise tick (left horizon — daytime) */}
        {prayerTimes && dayActive && (
          <G opacity={1 - swapT}>
            <Circle cx={cx - R} cy={cy - 4} r={2.2} fill={inkSoft(0.6)} />
            <SvgText x={cx - R} y={cy - 22} textAnchor="middle" fill={inkSoft(0.55)} fontSize={7.5} fontWeight="700">
              SUNRISE
            </SvgText>
            <SvgText x={cx - R} y={cy - 11} textAnchor="middle" fill={inkSoft(0.7)} fontSize={9} fontWeight="600">
              {prayerTimes.sunrise.timeString}
            </SvgText>
            {notifEnabled?.sunrise && (
              <Circle cx={cx - R + 10} cy={cy + 6} r={2} fill="#FFD27A" opacity={0.95} />
            )}
          </G>
        )}

        {/* Daytime arc prayers */}
        {prayerTimes && dayActive && (
          <G opacity={1 - swapT}>
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
                    fill={inkSoft(1)}
                    fontSize={11}
                    fontWeight="800"
                    opacity={groupOpacity}
                  >
                    {p.en.toUpperCase()}
                  </SvgText>
                  <SvgText
                    x={x + dx}
                    y={y + timeDy}
                    textAnchor={anchor}
                    fill={inkSoft(0.88)}
                    fontSize={10.5}
                    fontWeight="600"
                    opacity={groupOpacity}
                  >
                    {p.time}
                  </SvgText>
                  {notifEnabled?.[p.id] && (
                    <Circle cx={x + 13} cy={above ? y + 8 : y - 8} r={2} fill="#FFD27A" opacity={0.95} />
                  )}
                </React.Fragment>
              );
            })}
          </G>
        )}

        {/* Night-side moons (Fajr / Isha) — daytime convention. */}
        {prayerTimes && dayActive && (
          <G opacity={1 - swapT}>
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
                    y={y - 4}
                    textAnchor={anchor}
                    fill={now ? "rgba(255,228,181,1)" : "rgba(232,240,252,1)"}
                    fontSize={11.5}
                    fontWeight="800"
                  >
                    {p.en.toUpperCase()}
                  </SvgText>
                  <SvgText
                    x={isLeft ? x + 14 : x - 14}
                    y={y + 10}
                    textAnchor={anchor}
                    fill={now ? "rgba(255,228,181,0.9)" : "rgba(232,240,252,0.85)"}
                    fontSize={10.5}
                    fontWeight="600"
                  >
                    {p.time}
                  </SvgText>
                  <SvgText
                    x={isLeft ? x + 14 : x - 14}
                    y={y + 23}
                    textAnchor={anchor}
                    fill="rgba(232,240,252,0.6)"
                    fontSize={9}
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

        {/* Night arc anchors */}
        {prayerTimes && nightActive && (
          <G opacity={swapT}>
            {nightArcPrayers.map((a) => {
              const r = (a.angle * Math.PI) / 180;
              const x = cx + R * Math.cos(r);
              const y = cy + R * Math.sin(r);
              const isPrayer = a.kind === "prayer";
              const past = a.status === "past";
              const now = a.status === "now";
              const next = a.status === "next";
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
                    fill={isPrayer ? "rgba(255,228,181,1)" : "rgba(220,228,248,0.95)"}
                    fontSize={isPrayer ? 11 : 10}
                    fontWeight="800"
                  >
                    {a.label}
                  </SvgText>
                  {/* Suppress time + subtitle for past gateways (in practice
                      Maghrib, which is the very anchor point of the night arc).
                      When the moon is near Maghrib (the first ~30 min of night)
                      its label gets flipped above to dodge the moon, which then
                      crashes into Isha's labels just to the right. The time and
                      "sunset · night begins" hint are also redundant once
                      Maghrib is in the past — the EARLIER TODAY chip below
                      already shows the exact time. Keep just the marker + tiny
                      "MAGHRIB" label as a quiet visual anchor. */}
                  {!(a.kind === "gateway" && past) && (
                    <SvgText
                      x={x + dx}
                      y={y + timeDy}
                      textAnchor={anchor}
                      fill={isPrayer ? "rgba(255,228,181,0.88)" : "rgba(220,228,248,0.78)"}
                      fontSize={10.5}
                      fontWeight="600"
                    >
                      {a.time}
                    </SvgText>
                  )}
                  {a.sub && !(a.kind === "gateway" && past) && (
                    <SvgText
                      x={x + dx}
                      y={y + subDy}
                      textAnchor={anchor}
                      fill="rgba(220,228,248,0.62)"
                      fontSize={9}
                      fontWeight="500"
                      fontStyle="italic"
                    >
                      {a.sub}
                    </SvgText>
                  )}
                  {(() => {
                    const notifKey =
                      a.id === "lastThird" ? "tahajjud" : (a.id as PrayerKey);
                    if (!notifEnabled?.[notifKey]) return null;
                    return <Circle cx={x + 13} cy={y - 8} r={2} fill="#FFD27A" opacity={0.95} />;
                  })()}
                </G>
              );
            })}
          </G>
        )}

        {/* The body (sun by day, moon by night).
            NOTE: react-native-svg does not reliably propagate <G opacity> to children
            whose fill is a gradient reference (url(#...)). So we ALSO conditionally
            skip rendering the wrong body to avoid a "ghost sun" lingering at night
            (or a ghost moon during the day). Keeps crossfade for the brief swap window. */}
        {prayerTimes && dayActive && (
          <G opacity={1 - swapT}>
            {(glowBoost > 0.05 || sunsetFlash > 0.01) && (
              <Circle
                cx={dayBodyX}
                cy={dayBodyY}
                r={32 + 22 * glowBoost + 260 * sunsetFlash}
                fill="url(#sunGlow)"
                opacity={Math.min(1, 0.55 + 0.4 * glowBoost + 0.5 * sunsetFlash)}
              />
            )}
            <Circle cx={dayBodyX} cy={dayBodyY} r={32 + 8 * sunsetFlash} fill="url(#sunGlow)" />
            <Circle cx={dayBodyX} cy={dayBodyY} r={11 + 4 * sunsetFlash} fill="#FFF1C4" />
            <SvgText
              x={dayBodyX + 18}
              y={dayBodyY + 3.5}
              fill="#FFF8DC"
              fontSize={12.5}
              fontWeight="800"
              opacity={1 - sunsetFlash * 0.85}
            >
              {nowLabel}
            </SvgText>
          </G>
        )}
        {prayerTimes && nightActive && (
          <G opacity={swapT}>
            {(glowBoost > 0.05 || sunsetFlash > 0.01) && (
              <Circle
                cx={nightBodyX}
                cy={nightBodyY}
                r={28 + 16 * glowBoost + 80 * sunsetFlash}
                fill="url(#moonGlow)"
                opacity={Math.min(1, 0.5 + 0.4 * glowBoost + 0.4 * sunsetFlash)}
              />
            )}
            <Circle cx={nightBodyX} cy={nightBodyY} r={28} fill="url(#moonGlow)" />
            <Circle cx={nightBodyX} cy={nightBodyY} r={13} fill="#E8EEFF" />
            <Circle
              cx={nightBodyX + (nightBodyDeg < -90 ? -4 : 5)}
              cy={nightBodyY - 1.5}
              r={11}
              fill={grad[0]}
            />
            <SvgText
              x={nightBodyX + 22}
              y={nightBodyY + 3}
              fill="#E8EEFF"
              fontSize={11}
              fontWeight="700"
              opacity={1 - sunsetFlash * 0.6}
            >
              {nowLabel}
            </SvgText>
          </G>
        )}
      </Svg>

      {/* Sunset / sunrise flash overlay */}
      {sunsetFlash > 0.005 && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { opacity: Math.min(1, sunsetFlash * 1.1) },
          ]}
        >
          <LinearGradient
            colors={
              isDawnFlash
                ? [
                    "rgba(255,210,170,0)",
                    "rgba(255,200,160,0.55)",
                    "rgba(255,180,140,0.85)",
                    "rgba(255,165,120,0.55)",
                    "rgba(255,165,120,0)",
                  ]
                : [
                    "rgba(255,170,80,0)",
                    "rgba(255,150,70,0.55)",
                    "rgba(255,135,60,0.95)",
                    "rgba(255,110,50,0.55)",
                    "rgba(255,90,40,0)",
                  ] as any
            }
            locations={[0, 0.32, 0.55, 0.78, 1] as any}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[
              "rgba(255,255,235,0)",
              `rgba(255,248,210,${0.85 * sunsetFlash})`,
              "rgba(255,210,140,0)",
            ] as any}
            locations={[0, 0.5, 1] as any}
            start={{ x: isDawnFlash ? 0.15 : 0.85, y: 0.55 }}
            end={{ x: isDawnFlash ? 0.85 : 0.15, y: 0.55 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      {/* Tappable hit boxes over each prayer anchor */}
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
          {!nightActive && arcPrayers.map((p) => {
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
          {!nightActive && nightPrayers.map((p) => {
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
          {nightActive && nightArcPrayers.map((p) => {
            const settingsKey: PrayerKey | null =
              p.id === "maghrib" || p.id === "isha" || p.id === "fajr"
                ? p.id
                : p.id === "lastThird"
                ? "tahajjud"
                : p.id === "sunrise"
                ? "sunrise"
                : null;
            if (!settingsKey) return null;
            const r = (p.angle * Math.PI) / 180;
            const x = cx + R * Math.cos(r);
            const y = cy + R * Math.sin(r);
            return (
              <Pressable
                key={`hit-night-${p.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${p.label} notification settings`}
                onPress={() => {
                  tapHaptic("selection");
                  onPrayerSettingsPress(settingsKey);
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
        </View>
      )}

      {/* Empty-state CTA */}
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
  );
}

export const CelestialDome = memo(CelestialDomeInner);

const styles = StyleSheet.create({
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
});
