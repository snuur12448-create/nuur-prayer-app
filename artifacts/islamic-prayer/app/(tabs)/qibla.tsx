import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Line, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import { useFocusEffect } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { calculateQiblaDirection, getDistanceToKaaba } from "@/utils/qibla";
import { bearingDelta, solarPosition } from "@/utils/solar";
import QiblaMapView from "@/components/QiblaMapView";

// Cross-platform tiny vibration / haptic helpers — no-op if unavailable.
function tickHaptic() {
  if (Platform.OS === "web") {
    try { (navigator as any)?.vibrate?.(8); } catch {}
    return;
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
function lockHaptic() {
  if (Platform.OS === "web") {
    try { (navigator as any)?.vibrate?.([20, 40, 20]); } catch {}
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

// ── Ka'bah silhouette ─────────────────────────────────────────────────────────
function KaabahSilhouette({ size, color }: { size: number; color: string }) {
  // Refined: dark cube + gold hizam band + small door on right.
  // No crescent, plinth, minaret, maqam, finial. Square overall footprint.
  const w = size;
  const h = size;

  const bodyW = w * 0.62;
  const bodyH = h * 0.7;
  const bodyX = (w - bodyW) / 2;
  const bodyY = (h - bodyH) / 2;

  // Hizam (gold band) — about 1/3 from top
  const bandH = bodyH * 0.11;
  const bandY = bodyY + bodyH * 0.30;

  // Door — small, on right side per user request
  const doorW = bodyW * 0.13;
  const doorH = bodyH * 0.30;
  const doorX = bodyX + bodyW * 0.74;
  const doorY = bodyY + bodyH - doorH - bodyH * 0.05;
  const doorArcR = doorW * 0.5;

  const KAABA_DARK = "#0a0a0a";
  const KAABA_EDGE = "#1a1a1a";

  return (
    <Svg width={w} height={h}>
      {/* Cube body — flat black silhouette */}
      <Rect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH}
        rx={1.5}
        fill={KAABA_DARK}
      />
      {/* Subtle edge highlight on top to give it dimension */}
      <Rect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH * 0.04}
        fill={KAABA_EDGE}
      />

      {/* Hizam (gold band) */}
      <Rect
        x={bodyX}
        y={bandY}
        width={bodyW}
        height={bandH}
        fill={color}
        opacity={0.92}
      />
      {/* Subtle calligraphy texture on the hizam */}
      {Array.from({ length: 9 }, (_, i) => (
        <Rect
          key={i}
          x={bodyX + bodyW * 0.06 + i * bodyW * 0.10}
          y={bandY + bandH * 0.28}
          width={bodyW * 0.045}
          height={bandH * 0.44}
          rx={0.5}
          fill={KAABA_DARK}
          opacity={0.55}
        />
      ))}

      {/* Door — gold rectangle with arched top, on the right */}
      <Path
        d={`M ${doorX} ${doorY + doorH} L ${doorX} ${doorY + doorArcR} A ${doorArcR} ${doorArcR} 0 0 1 ${doorX + doorW} ${doorY + doorArcR} L ${doorX + doorW} ${doorY + doorH} Z`}
        fill={color}
        opacity={0.85}
      />
    </Svg>
  );
}

// SVG canvas needs ~16px breathing room around the dial: the brass bezel
// extends OUTER_R+7 from center and the drop-shadow even further. We keep the
// visual dial size identical (OUTER_R = 144 just like before) and grow the
// outer canvas instead, so the bezel + shadow no longer get clipped.
const COMPASS_SIZE = 348;
const CX = COMPASS_SIZE / 2;
const OUTER_R = COMPASS_SIZE / 2 - 14; // = 144 (preserves prior dial diameter)
const INNER_R = OUTER_R - 28;
const FACE_R = INNER_R - 4;

function shortestRotation(current: number, target: number): number {
  let diff = ((target - current) % 360 + 360) % 360;
  if (diff > 180) diff -= 360;
  return current + diff;
}

function IslamicGeometricPattern({ size, color }: { size: number; color: string }) {
  const cx = size / 2;
  const r = size / 2;
  const points8 = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 - 22.5) * (Math.PI / 180);
    return { x: cx + r * 0.55 * Math.cos(angle), y: cx + r * 0.55 * Math.sin(angle) };
  });
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a1 = (i * 45) * (Math.PI / 180);
    const a2 = ((i * 45) + 45) * (Math.PI / 180);
    const mid = ((i * 45) + 22.5) * (Math.PI / 180);
    const p1 = { x: cx + r * 0.35 * Math.cos(a1), y: cx + r * 0.35 * Math.sin(a1) };
    const p2 = { x: cx + r * 0.35 * Math.cos(a2), y: cx + r * 0.35 * Math.sin(a2) };
    const ctrl = { x: cx + r * 0.62 * Math.cos(mid), y: cx + r * 0.62 * Math.sin(mid) };
    return `M ${cx} ${cx} Q ${p1.x} ${p1.y} ${ctrl.x} ${ctrl.y} Q ${p2.x} ${p2.y} ${cx} ${cx} Z`;
  });
  return (
    <Svg width={size} height={size}>
      {/* Outer ring */}
      <Circle cx={cx} cy={cx} r={r * 0.72} fill="none" stroke={color} strokeWidth={0.8} opacity={0.3} />
      <Circle cx={cx} cy={cx} r={r * 0.52} fill="none" stroke={color} strokeWidth={0.8} opacity={0.25} />
      {/* 8-petal flower */}
      {petals.map((d, i) => (
        <Path key={i} d={d} fill={color} opacity={0.15} />
      ))}
      {/* Star dots */}
      {points8.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} opacity={0.3} />
      ))}
      {/* Center circle */}
      <Circle cx={cx} cy={cx} r={r * 0.1} fill={color} opacity={0.25} />
    </Svg>
  );
}

function CompassFace({
  tintColor = "#C9933A",
  faceColor = "#162A1A",
  ringColor = "#C9933A",
  textColor = "#E8D5A3",
  qiblaAngle = null,
}: {
  tintColor?: string;
  faceColor?: string;
  ringColor?: string;
  textColor?: string;
  qiblaAngle?: number | null;
}) {
  // Brass tones — used regardless of theme tint so the dial reads as metal.
  const BRASS_HI = "#ebd7a3";
  const BRASS_MID = "#D4A017";
  const BRASS_LO = "#5b461c";
  const BRASS_DIM = "#8e733b";

  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  // English cardinals — N is the user's primary mental anchor (cream/gold);
  // E/S/W are softer cream so N reads as the reference direction.
  const CARDINAL_PRIMARY = BRASS_HI;
  const CARDINAL_MUTED = "rgba(244, 234, 212, 0.7)";
  const cardinalAngles = [
    { label: "N", angle: 0, color: CARDINAL_PRIMARY, size: 16 },
    { label: "E", angle: 90, color: CARDINAL_MUTED, size: 16 },
    { label: "S", angle: 180, color: CARDINAL_MUTED, size: 16 },
    { label: "W", angle: 270, color: CARDINAL_MUTED, size: 16 },
  ];
  const degreeLabels = [30, 60, 120, 150, 210, 240, 300, 330];

  return (
    <Svg width={COMPASS_SIZE} height={COMPASS_SIZE}>
      <Defs>
        {/* Dial face — deep ink-green with subtle warm glow toward center */}
        <RadialGradient id="faceGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#1a2b1f" stopOpacity="1" />
          <Stop offset="70%" stopColor="#122016" stopOpacity="1" />
          <Stop offset="100%" stopColor="#06100a" stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="tintGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={BRASS_MID} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={BRASS_MID} stopOpacity="0" />
        </RadialGradient>
        {/* Brass bezel — top-lit metal: light at top, deep amber at bottom */}
        <SvgLinearGradient id="brassBezel" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={BRASS_HI} stopOpacity="1" />
          <Stop offset="35%" stopColor={BRASS_MID} stopOpacity="1" />
          <Stop offset="70%" stopColor={BRASS_DIM} stopOpacity="1" />
          <Stop offset="100%" stopColor={BRASS_LO} stopOpacity="1" />
        </SvgLinearGradient>
        {/* Inner brass shoulder — reverse-lit so the bezel reads as 3D */}
        <SvgLinearGradient id="brassShoulder" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={BRASS_LO} stopOpacity="1" />
          <Stop offset="100%" stopColor={BRASS_HI} stopOpacity="0.85" />
        </SvgLinearGradient>
      </Defs>

      {/* ── Outer brass bezel ─────────────────────────────── */}
      {/* Drop shadow base */}
      <Circle cx={CX} cy={CX + 3} r={OUTER_R + 8} fill="#000" opacity={0.55} />
      {/* Main bezel ring */}
      <Circle cx={CX} cy={CX} r={OUTER_R + 7} fill="url(#brassBezel)" />
      {/* Inner shoulder for 3D depth */}
      <Circle cx={CX} cy={CX} r={OUTER_R + 2} fill="url(#brassShoulder)" />
      {/* Deep recess line where bezel meets dial face */}
      <Circle cx={CX} cy={CX} r={OUTER_R - 1} fill="#04090a" />

      {/* Decorative gold engraving — 8 small ornament arcs along bezel */}
      {Array.from({ length: 8 }, (_, i) => {
        const a1 = ((i * 45 - 14) - 90) * (Math.PI / 180);
        const a2 = ((i * 45 + 14) - 90) * (Math.PI / 180);
        const r = OUTER_R + 5;
        return (
          <Path
            key={i}
            d={`M ${CX + r * Math.cos(a1)} ${CX + r * Math.sin(a1)} A ${r} ${r} 0 0 1 ${CX + r * Math.cos(a2)} ${CX + r * Math.sin(a2)}`}
            fill="none"
            stroke={BRASS_LO}
            strokeWidth={1.5}
            opacity={0.7}
          />
        );
      })}

      {/* ── Compass face ────────────────────────────────── */}
      <Circle cx={CX} cy={CX} r={OUTER_R - 2} fill="url(#faceGrad)" />
      <Circle cx={CX} cy={CX} r={OUTER_R - 2} fill="url(#tintGlow)" />
      {/* Hairline brass frame around face */}
      <Circle cx={CX} cy={CX} r={OUTER_R - 2} fill="none" stroke={BRASS_DIM} strokeWidth={0.8} opacity={0.7} />

      {/* ── Inner engraved rings ─────────────────────────── */}
      <Circle cx={CX} cy={CX} r={INNER_R + 14} fill="none" stroke={BRASS_DIM} strokeWidth={0.5} opacity={0.35} />
      <Circle cx={CX} cy={CX} r={INNER_R} fill="none" stroke={BRASS_DIM} strokeWidth={0.6} opacity={0.45} />

      {/* ── Engraved tick marks ─────────────────────────── */}
      {ticks.map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const isMajor = deg % 90 === 0;
        const isMid = deg % 45 === 0 && !isMajor;
        const isMinor30 = deg % 30 === 0 && !isMajor && !isMid;
        const tickLen = isMajor ? 14 : isMid ? 11 : isMinor30 ? 8 : 4;
        const r1 = OUTER_R - 4;
        const r2 = r1 - tickLen;
        const stroke = isMajor ? BRASS_HI : isMid ? BRASS_MID : isMinor30 ? BRASS_DIM : `${BRASS_DIM}99`;
        return (
          <Line
            key={deg}
            x1={CX + r1 * Math.cos(rad)} y1={CX + r1 * Math.sin(rad)}
            x2={CX + r2 * Math.cos(rad)} y2={CX + r2 * Math.sin(rad)}
            stroke={stroke}
            strokeWidth={isMajor ? 2 : isMid ? 1.5 : 1}
            opacity={isMajor ? 0.95 : 0.8}
          />
        );
      })}

      {/* ── Engraved degree numerals ──────────────────────
          Skip any numeral within ±15° of the qibla angle so it
          doesn't collide with the rim marker + QIBLA label. */}
      {degreeLabels.map((deg) => {
        if (qiblaAngle !== null) {
          const diff = Math.abs(((deg - qiblaAngle + 540) % 360) - 180);
          const sep = 180 - diff; // angular distance, 0..180
          if (sep < 15) return null;
        }
        const rad = (deg - 90) * (Math.PI / 180);
        const r = OUTER_R - 24;
        const DegText = SvgText as any;
        return (
          <DegText
            key={deg}
            x={CX + r * Math.cos(rad)} y={CX + r * Math.sin(rad)}
            dy={2.8}
            textAnchor="middle"
            fill={BRASS_DIM} fontSize="8" opacity={0.85}
          >
            {deg}
          </DegText>
        );
      })}

      {/* ── English cardinal letters (Inter SemiBold) ────────────
          Positioned well inside the major tick ring (ticks end at
          OUTER_R-18; letters sit at OUTER_R-40 with ~6px clearance).
          Vertical centering uses explicit dy because react-native-svg
          does not honor dominantBaseline on iOS reliably. */}
      {cardinalAngles.map(({ label, angle, color, size }) => {
        const rad = (angle - 90) * (Math.PI / 180);
        const r = OUTER_R - 40;
        const CardinalText = SvgText as any;
        return (
          <CardinalText
            key={label}
            x={CX + r * Math.cos(rad)}
            y={CX + r * Math.sin(rad)}
            dy={size * 0.35}
            textAnchor="middle"
            fill={color}
            fontSize={size.toString()}
            fontFamily="Inter_600SemiBold"
          >
            {label}
          </CardinalText>
        );
      })}

      {/* ── Crosshair lines ──────────────────────────────── */}
      <Line x1={CX} y1={CX - INNER_R + 4} x2={CX} y2={CX - FACE_R + 2} stroke={BRASS_MID} strokeWidth={0.6} opacity={0.18} />
      <Line x1={CX} y1={CX + INNER_R - 4} x2={CX} y2={CX + FACE_R - 2} stroke={BRASS_MID} strokeWidth={0.6} opacity={0.18} />
      <Line x1={CX - INNER_R + 4} y1={CX} x2={CX - FACE_R + 2} y2={CX} stroke={BRASS_MID} strokeWidth={0.6} opacity={0.18} />
      <Line x1={CX + INNER_R - 4} y1={CX} x2={CX + FACE_R - 2} y2={CX} stroke={BRASS_MID} strokeWidth={0.6} opacity={0.18} />

      {/* ── Qibla target marker on the rim ──────────────── */}
      {qiblaAngle !== null && (() => {
        const rad = (qiblaAngle - 90) * (Math.PI / 180);
        const r = OUTER_R - 8;
        const dx = CX + r * Math.cos(rad);
        const dy = CX + r * Math.sin(rad);

        // QIBLA label sits INSIDE the dial face, well clear of the
        // degree numeral ring (which is at OUTER_R-24). We place it at
        // OUTER_R-46 so there's ~22px between dot and label, plus 8px
        // breathing room from the (now-hidden) nearest degree numeral.
        const labelR = OUTER_R - 46;
        const lx = CX + labelR * Math.cos(rad);
        const ly = CX + labelR * Math.sin(rad);
        // Tangent-rotate so text reads upright relative to the marker;
        // flip 180° on the bottom half so it never appears upside-down.
        const angleDeg = qiblaAngle;
        const flip = angleDeg > 90 && angleDeg < 270;
        const rot = flip ? angleDeg + 90 : angleDeg - 90;
        const QiblaLabel = SvgText as any;
        const FONT = 9;

        return (
          <>
            {/* Outer halo glow — soft, low-opacity ring */}
            <Circle cx={dx} cy={dy} r={13} fill={BRASS_HI} opacity={0.18} />
            <Circle cx={dx} cy={dy} r={9} fill={BRASS_HI} opacity={0.4} />
            {/* Solid dot — 20% larger (3.6 → 4.3) */}
            <Circle cx={dx} cy={dy} r={4.3} fill={BRASS_HI} />
            <Circle cx={dx} cy={dy} r={4.3} fill="none" stroke={BRASS_LO} strokeWidth={0.8} opacity={0.9} />

            {/* QIBLA label — inside dial, clear of degree numerals */}
            <QiblaLabel
              x={lx}
              y={ly}
              dy={FONT * 0.35}
              textAnchor="middle"
              fill={BRASS_HI}
              fontSize={FONT.toString()}
              fontFamily="Inter_600SemiBold"
              transform={`rotate(${rot} ${lx} ${ly})`}
            >
              QIBLA
            </QiblaLabel>
          </>
        );
      })()}
    </Svg>
  );
}

function QiblaNeedle({ size, aligned }: { size: number; aligned: boolean }) {
  const cx = size / 2;

  // Brass tones — match CompassFace
  const BRASS_HI = "#ebd7a3";
  const BRASS_MID = "#D4A017";
  const BRASS_LO = "#5b461c";
  const BRASS_DARK = "#2a2110";
  const GREEN_LOCK = "#2ECC71";

  // When aligned, swap brass for emerald — the lock moment must be visually unmistakable
  const lightSide = aligned ? "#7ee0a8" : BRASS_HI;
  const midSide = aligned ? GREEN_LOCK : BRASS_MID;
  const darkSide = aligned ? "#0e6b3a" : BRASS_LO;
  const tailDark = aligned ? "rgba(14,107,58,0.85)" : BRASS_DARK;
  const tailDarker = aligned ? "rgba(6,40,22,0.95)" : "#1a140a";
  const accent = aligned ? GREEN_LOCK : BRASS_MID;

  // Needle geometry — Fraunces-style refined gold pointer.
  // Slimmer head, longer reach to rim, refined diamond tail.
  const tipY = cx - size * 0.36;
  const baseY = cx + size * 0.26;
  const halfW = 8;
  const tailHalfW = 5;

  return (
    <Svg width={size} height={size}>
      <Defs>
        {/* Bright (left) side of needle — top-lit brass / emerald */}
        <SvgLinearGradient id="needleLight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={lightSide} stopOpacity="1" />
          <Stop offset="100%" stopColor={midSide} stopOpacity="1" />
        </SvgLinearGradient>
        {/* Shadowed (right) side of needle */}
        <SvgLinearGradient id="needleDark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={midSide} stopOpacity="1" />
          <Stop offset="100%" stopColor={darkSide} stopOpacity="1" />
        </SvgLinearGradient>
        {/* Tail — dark steel/iron */}
        <SvgLinearGradient id="tailLeft" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={tailDark} stopOpacity="1" />
          <Stop offset="100%" stopColor={tailDarker} stopOpacity="1" />
        </SvgLinearGradient>
        <SvgLinearGradient id="tailRight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={tailDarker} stopOpacity="1" />
          <Stop offset="100%" stopColor="#06040a" stopOpacity="1" />
        </SvgLinearGradient>
        {/* Brass pivot — polished orb */}
        <RadialGradient id="pivotGrad" cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor={lightSide} stopOpacity="1" />
          <Stop offset="55%" stopColor={midSide} stopOpacity="1" />
          <Stop offset="100%" stopColor={darkSide} stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* ── Qibla (top) half — split-shaded brass ridge ── */}
      {/* Light (left) face */}
      <Path
        d={`M ${cx} ${tipY} L ${cx - halfW} ${cx} L ${cx} ${cx + 4} Z`}
        fill="url(#needleLight)"
      />
      {/* Dark (right) face */}
      <Path
        d={`M ${cx} ${tipY} L ${cx + halfW} ${cx} L ${cx} ${cx + 4} Z`}
        fill="url(#needleDark)"
      />
      {/* Crisp center ridge highlight */}
      <Line x1={cx} y1={tipY + 2} x2={cx} y2={cx + 2} stroke={lightSide} strokeWidth={0.7} opacity={0.85} />

      {/* Tiny brass cap at the very tip — refined finish */}
      <Circle cx={cx} cy={tipY + 4} r={1.6} fill={lightSide} opacity={0.95} />

      {/* ── Tail (bottom) half — dark forged steel ──────── */}
      <Path
        d={`M ${cx - tailHalfW} ${cx} L ${cx} ${cx + 4} L ${cx} ${baseY} Z`}
        fill="url(#tailLeft)"
      />
      <Path
        d={`M ${cx + tailHalfW} ${cx} L ${cx} ${cx + 4} L ${cx} ${baseY} Z`}
        fill="url(#tailRight)"
      />

      {/* Ka'bah finial removed — the needle alone is cleaner and lets the
          dial face read at full strength without a competing focal point. */}

      {/* ── Brass center pivot ───────────────────────────── */}
      {/* Outer shadow ring */}
      <Circle cx={cx} cy={cx + 1.5} r={15} fill="#000" opacity={0.45} />
      {/* Polished orb */}
      <Circle cx={cx} cy={cx} r={14} fill="url(#pivotGrad)" />
      {/* Engraved socket */}
      <Circle cx={cx} cy={cx} r={5.5} fill="#0a0804" opacity={0.85} />
      <Circle cx={cx - 1.2} cy={cx - 1.2} r={1.4} fill={lightSide} opacity={0.6} />
    </Svg>
  );
}

export default function QiblaScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { location, isLoadingLocation, usingDefaultLocation, requestLocation, themeColors: colors } = useAppContext();

  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [hasCompass, setHasCompass] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [aligned, setAligned] = useState(false);
  // Compass vs Map view toggle. The map shows the great-circle line from
  // the user to the Kaaba and reassures users the direction is real.
  const [viewMode, setViewMode] = useState<"compass" | "map">("compass");
  // Heading accuracy:
  //   iOS Location.watchHeadingAsync → 0=unreliable, 1=low, 2=medium, 3=high
  //   Web has no accuracy data → null (we hide the chip)
  const [accuracy, setAccuracy] = useState<number | null>(null);
  // Tick clock to refresh sun position each minute (it drifts ~0.25°/min).
  const [nowTick, setNowTick] = useState(() => Date.now());

  const compassAnimRef = useRef(new Animated.Value(0));
  const needleAnimRef = useRef(new Animated.Value(0));
  const compassCurrentRef = useRef(0);
  const needleCurrentRef = useRef(0);
  const headingSubRef = useRef<any>(null);
  // ── Haptic gating state ────────────────────────────────────────────────
  // Goals: no spam from sensor jitter at boundaries, and no repeated ticks
  // for the same threshold within one approach.
  //   • Alignment uses hysteresis: enter at <8°, exit at >12°.
  //   • Approach ticks fire once per threshold (40/30/20/10) and the set
  //     resets only when diff drifts back past 45° (a fresh approach).
  //   • A 600ms global cooldown gates any haptic call.
  const prevDiffRef = useRef<number>(180);
  const wasAlignedRef = useRef<boolean>(false);
  const lastHapticAtRef = useRef<number>(0);
  const ticksFiredRef = useRef<Set<number>>(new Set());

  // Track viewMode + screen focus in refs so the compass callbacks (which
  // capture state at creation time) can read the live values without
  // resubscribing. The magnetometer keeps streaming in the background, so
  // without these gates the haptic would fire on other tabs too.
  const viewModeRef = useRef<"compass" | "map">("compass");
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
  const isFocusedRef = useRef<boolean>(true);
  useFocusEffect(useCallback(() => {
    isFocusedRef.current = true;
    return () => { isFocusedRef.current = false; };
  }, []));

  const fireHaptic = useCallback((kind: "tick" | "lock") => {
    // Suppress all haptic feedback when the user is on the map view or
    // has navigated away from the Qibla tab entirely.
    if (!isFocusedRef.current) return;
    if (viewModeRef.current !== "compass") return;
    const now = Date.now();
    if (now - lastHapticAtRef.current < 600) return;
    lastHapticAtRef.current = now;
    if (kind === "lock") lockHaptic(); else tickHaptic();
  }, []);

  // Refresh sun position once per minute.
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  useEffect(() => {
    if (location) {
      const angle = calculateQiblaDirection(location.latitude, location.longitude);
      const dist = getDistanceToKaaba(location.latitude, location.longitude);
      setQiblaAngle(angle);
      setDistance(dist);
    }
  }, [location]);

  // Animate compass ring rotation (rotates so N always faces geographic North)
  const animateCompass = useCallback((heading: number) => {
    const target = shortestRotation(compassCurrentRef.current, -heading);
    compassCurrentRef.current = target;
    Animated.timing(compassAnimRef.current, {
      toValue: target,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, []);

  // Animate needle (rotates to point toward Qibla)
  const animateNeedle = useCallback((heading: number, qibla: number) => {
    const needleTarget = qibla - heading;
    const target = shortestRotation(needleCurrentRef.current, needleTarget);
    needleCurrentRef.current = target;
    Animated.timing(needleAnimRef.current, {
      toValue: target,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const diff = Math.abs(((heading - qibla + 180 + 360) % 360) - 180);

    // Hysteresis: enter the aligned zone at <8°, but only leave once we've
    // drifted past 12°. Prevents jitter at the boundary from flapping.
    const wasAligned = wasAlignedRef.current;
    const nowAligned = wasAligned ? diff < 12 : diff < 8;

    // Reset the per-approach tick set when the user drifts well away — a
    // fresh approach is allowed to play its milestone ticks again.
    if (diff > 45) ticksFiredRef.current.clear();

    if (nowAligned && !wasAligned) {
      // Just entered the lock zone.
      fireHaptic("lock");
    } else if (!nowAligned) {
      // Approach milestones — fire each at most once per approach session.
      const prev = prevDiffRef.current;
      for (const t of [40, 30, 20, 10]) {
        if (prev > t && diff <= t && !ticksFiredRef.current.has(t)) {
          ticksFiredRef.current.add(t);
          fireHaptic("tick");
          break;
        }
      }
    }
    wasAlignedRef.current = nowAligned;
    prevDiffRef.current = diff;

    setAligned(nowAligned);
  }, [fireHaptic]);

  const updateHeading = useCallback((heading: number) => {
    setCompassHeading(heading);
    setHasCompass(true);
    animateCompass(heading);
    if (qiblaAngle !== null) {
      animateNeedle(heading, qiblaAngle);
    }
  }, [qiblaAngle, animateCompass, animateNeedle]);

  // Re-animate needle when qibla updates
  useEffect(() => {
    if (qiblaAngle !== null && hasCompass) {
      animateNeedle(compassHeading, qiblaAngle);
    }
  }, [qiblaAngle]);

  // Start compass listening
  const startCompass = useCallback(async () => {
    if (Platform.OS === "web") {
      // iOS requires explicit permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        try {
          const result = await (DeviceOrientationEvent as any).requestPermission();
          if (result !== "granted") {
            setNeedsPermission(true);
            return;
          }
        } catch {
          setNeedsPermission(true);
          return;
        }
      }

      const handler = (e: DeviceOrientationEvent) => {
        // webkitCompassHeading is most reliable on iOS Safari
        const webkitHeading = (e as any).webkitCompassHeading;
        if (webkitHeading !== undefined && webkitHeading !== null) {
          updateHeading(webkitHeading);
          return;
        }
        // For Android Chrome: deviceorientationabsolute gives absolute alpha
        if ((e as any).absolute && e.alpha !== null) {
          updateHeading((360 - e.alpha!) % 360);
          return;
        }
        // Fallback for relative alpha
        if (e.alpha !== null) {
          updateHeading((360 - e.alpha!) % 360);
        }
      };

      window.addEventListener("deviceorientationabsolute", handler as any, true);
      window.addEventListener("deviceorientation", handler as any, true);
      setNeedsPermission(false);
      return () => {
        window.removeEventListener("deviceorientationabsolute", handler as any, true);
        window.removeEventListener("deviceorientation", handler as any, true);
      };
    } else {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const sub = await Location.watchHeadingAsync((data) => {
          const h = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          // expo-location reports accuracy 0–3 (3 = high). Some platforms
          // report it under different names; fall back gracefully.
          const acc = (data as any).accuracy;
          if (typeof acc === "number") setAccuracy(acc);
          updateHeading(h);
        });
        headingSubRef.current = sub;
      } catch {}
    }
  }, [updateHeading]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    startCompass().then((c) => { cleanup = c; });
    return () => {
      cleanup?.();
      headingSubRef.current?.remove?.();
    };
  }, [startCompass]);

  const compassRotate = compassAnimRef.current.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ["-360deg", "0deg", "360deg"],
    extrapolate: "extend",
  });

  const needleRotate = needleAnimRef.current.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ["-360deg", "0deg", "360deg"],
    extrapolate: "extend",
  });

  const showCompassStatus = !hasCompass;
  const alignedText = aligned && qiblaAngle !== null;

  // ── Accuracy chip descriptor (iOS only) ─────────────────────────────────
  // Maps the 0–3 accuracy value into a friendly label + colour. Returns null
  // for web / when no reading has arrived yet so the chip simply hides.
  const accuracyInfo = useMemo(() => {
    if (isWeb || accuracy === null) return null;
    if (accuracy >= 3) return { label: "High accuracy", tone: "good" as const };
    if (accuracy >= 2) return { label: "Good accuracy", tone: "good" as const };
    if (accuracy >= 1) return { label: "Low — calibrate", tone: "warn" as const };
    return { label: "Unreliable — calibrate", tone: "bad" as const };
  }, [accuracy, isWeb]);

  // ── Sun-shadow method ─────────────────────────────────────────────────────
  // Compute where the Sun is right now relative to Qibla. If the Sun is up,
  // the user can face it and turn N° to reach Qibla — works even when the
  // magnetometer is wrong (steel buildings, planes, basements).
  const sunInfo = useMemo(() => {
    if (!location || qiblaAngle === null) return null;
    const { azimuth, altitude } = solarPosition(location.latitude, location.longitude, new Date(nowTick));
    const delta = bearingDelta(azimuth, qiblaAngle); // signed: +ve = Qibla is right of sun
    return { azimuth, altitude, delta };
  }, [location, qiblaAngle, nowTick]);

  // Off-qibla angle (signed for arrow nudge, abs for display)
  const offQiblaSigned = qiblaAngle !== null
    ? ((compassHeading - qiblaAngle + 180 + 360) % 360) - 180
    : 0;
  const offQiblaAbs = Math.round(Math.abs(offQiblaSigned));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      {/* ── Minimal top bar ──────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: topPad + 12 }]}>
        {isLoadingLocation ? (
          <ActivityIndicator size="small" color={colors.tint} />
        ) : (
          <Pressable
            style={[styles.cityPill, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={requestLocation}
          >
            <Feather name="map-pin" size={11} color={colors.gold} />
            <Text style={[styles.cityPillText, { color: colors.text }]} numberOfLines={1}>
              {usingDefaultLocation ? "Detect" : location?.city ?? "Locate"}
            </Text>
          </Pressable>
        )}

        <View style={[styles.viewToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            onPress={() => setViewMode("compass")}
            style={[styles.viewToggleSeg, viewMode === "compass" && { backgroundColor: colors.gold + "22" }]}
            accessibilityLabel="Compass view"
          >
            <Feather name="compass" size={13} color={viewMode === "compass" ? colors.gold : colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => setViewMode("map")}
            style={[styles.viewToggleSeg, viewMode === "map" && { backgroundColor: colors.gold + "22" }]}
            accessibilityLabel="Map view"
          >
            <Feather name="map" size={13} color={viewMode === "map" ? colors.gold : colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* MAP MODE */}
      {viewMode === "map" && (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 100 }}>
          {location && qiblaAngle !== null && distance !== null ? (
            <QiblaMapView
              userLat={location.latitude}
              userLng={location.longitude}
              qiblaBearing={qiblaAngle}
              distanceKm={distance}
              tintColor={colors.tint}
              goldColor={colors.gold}
              surfaceColor={colors.surface}
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
            />
          ) : (
            <View style={[styles.mapLoading, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ActivityIndicator color={colors.tint} />
              <Text style={[styles.mapLoadingText, { color: colors.textSecondary }]}>
                {isLoadingLocation ? "Locating you…" : "Waiting for location"}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── COMPASS MODE ─────────────────────────────────────────────────── */}
      {viewMode === "compass" && (
        <View style={[styles.compassPage, { paddingBottom: insets.bottom + 80 }]}>
          {/* Top spacer pushes compass down to vertical center */}
          <View style={{ flex: 1 }} />

          {/* Compass with Kaaba in center */}
          <View style={styles.compassStage}>
            {/* Halo glow */}
            <View
              style={[
                styles.compassHalo,
                {
                  backgroundColor: aligned ? `${colors.tint}1F` : `${colors.gold}14`,
                  shadowColor: aligned ? colors.tint : colors.gold,
                },
              ]}
              pointerEvents="none"
            />

            <View style={styles.compassOuter}>
              {/* Rotating compass face */}
              <Animated.View style={[styles.absoluteFill, { transform: [{ rotate: compassRotate }] }]}>
                <CompassFace
                  tintColor={colors.gold}
                  faceColor={colors.surface}
                  ringColor={colors.gold}
                  textColor={colors.text}
                  qiblaAngle={qiblaAngle}
                />
              </Animated.View>

              {/* Kaaba in center (replaces flower pattern) */}
              <View style={[styles.absoluteFill, styles.kaabaCenter]} pointerEvents="none">
                <KaabahSilhouette size={Math.round(FACE_R * 0.66)} color={colors.gold} />
              </View>

              {/* Qibla needle */}
              {qiblaAngle !== null && (
                <Animated.View style={[styles.absoluteFill, { transform: [{ rotate: needleRotate }] }]}>
                  <QiblaNeedle size={COMPASS_SIZE} aligned={aligned} />
                </Animated.View>
              )}

              {showCompassStatus && !needsPermission && (
                <View style={styles.noCompassOverlay}>
                  <ActivityIndicator color={colors.tint} />
                  <Text style={[styles.noCompassText, { color: "rgba(255,255,255,0.7)" }]}>Detecting compass…</Text>
                </View>
              )}

              {needsPermission && (
                <View style={styles.noCompassOverlay}>
                  <Feather name="rotate-cw" size={28} color={colors.tint} />
                  <Text style={[styles.noCompassText, { color: "rgba(255,255,255,0.7)" }]}>Compass permission needed</Text>
                  <Pressable
                    style={[styles.permBtn, { borderColor: colors.tint, backgroundColor: `${colors.tint}22` }]}
                    onPress={startCompass}
                  >
                    <Text style={[styles.permBtnText, { color: colors.tint }]}>Enable Compass</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* HERO ALIGNMENT READING — the centerpiece */}
          <View style={styles.heroRead}>
            {alignedText ? (
              <>
                <Text style={[styles.alignedHeroNumber, { color: colors.tint }]}>✓</Text>
                <Text style={[styles.alignedHeroLabel, { color: colors.tint }]}>
                  YOU'RE FACING MAKKAH
                </Text>
              </>
            ) : qiblaAngle !== null && hasCompass ? (
              <Text style={[styles.heroInline, { color: colors.text }]}>
                <Text style={styles.heroInlineWord}>Turn </Text>
                <Text style={[styles.heroInlineNumber, { color: colors.gold }]}>
                  {offQiblaAbs}°
                </Text>
                <Text style={styles.heroInlineWord}>
                  {" "}{offQiblaSigned > 0 ? "left" : "right"}
                </Text>
              </Text>
            ) : qiblaAngle !== null ? (
              <Text style={[styles.heroInline, { color: colors.text }]}>
                <Text style={styles.heroInlineWord}>Heading </Text>
                <Text style={[styles.heroInlineNumber, { color: colors.gold }]}>
                  {Math.round(qiblaAngle)}°
                </Text>
              </Text>
            ) : (
              <Text style={[styles.heroLabel, { color: colors.textSecondary, fontSize: 12 }]}>LOCATING…</Text>
            )}
          </View>

          {/* Bottom spacer */}
          <View style={{ flex: 1 }} />

          {/* Slim info row */}
          <View style={styles.infoRow}>
            {qiblaAngle !== null && (
              <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
                <Text style={{ color: colors.text, fontFamily: "Inter_700Bold" }}>
                  {Math.round(qiblaAngle)}°
                </Text>{" "}FROM N
              </Text>
            )}
            {accuracyInfo && (
              <>
                <View style={[styles.infoSep, { backgroundColor: colors.border }]} />
                <View style={styles.infoChunk}>
                  <View
                    style={[
                      styles.accuracyDot,
                      {
                        backgroundColor:
                          accuracyInfo.tone === "good" ? "#2ECC71"
                          : accuracyInfo.tone === "warn" ? "#D4A017"
                          : "#FF5C5C",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.infoItem,
                      {
                        color:
                          accuracyInfo.tone === "good" ? "#2ECC71"
                          : accuracyInfo.tone === "warn" ? "#D4A017"
                          : "#FF5C5C",
                      },
                    ]}
                  >
                    {accuracyInfo.label.toUpperCase()}
                  </Text>
                </View>
              </>
            )}
            {distance !== null && (
              <>
                <View style={[styles.infoSep, { backgroundColor: colors.border }]} />
                <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
                  <Text style={{ color: colors.text, fontFamily: "Inter_700Bold" }}>
                    {distance.toLocaleString()}
                  </Text>{" "}KM
                </Text>
              </>
            )}
          </View>

          {/* Sun-shadow strip — minimal, on-brand */}
          {sunInfo && (
            <View style={[styles.sunStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.sunIconWrap, { backgroundColor: colors.gold + "1A" }]}>
                <MaterialCommunityIcons
                  name={sunInfo.altitude > 0 ? "white-balance-sunny" : "weather-night"}
                  size={14}
                  color={colors.gold}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sunStripEyebrow, { color: colors.gold }]}>
                  SUN GUIDANCE
                </Text>
                <Text style={[styles.sunStripBody, { color: colors.text }]}>
                  {sunInfo.altitude <= 0
                    ? "Available after sunrise"
                    : Math.abs(sunInfo.delta) < 1
                    ? "Face the sun — you face Makkah"
                    : `Face the sun, turn ${Math.round(Math.abs(sunInfo.delta))}° ${sunInfo.delta > 0 ? "right" : "left"}`}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Top bar ─────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  cityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  cityPillText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
    maxWidth: 140,
  },
  viewToggle: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
  },
  viewToggleSeg: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Map ─────────────────────────────────────────────────────────────────
  mapLoading: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  mapLoadingText: { fontSize: 13, fontFamily: "Inter_400Regular" },

  // ── Compass page (vertically centered, generous spacing) ────────────────
  compassPage: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 18,
  },

  compassStage: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  compassHalo: {
    position: "absolute",
    width: COMPASS_SIZE + 80,
    height: COMPASS_SIZE + 80,
    borderRadius: (COMPASS_SIZE + 80) / 2,
    top: -40,
    shadowOpacity: 0.7,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  compassOuter: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  absoluteFill: {
    position: "absolute",
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  kaabaCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  noCompassOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.78)",
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
  },
  noCompassText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  permBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  permBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // ── Hero alignment reading ──────────────────────────────────────────────
  heroRead: {
    alignItems: "center",
    marginTop: 36,
    minHeight: 84,
  },
  heroInline: {
    textAlign: "center",
    lineHeight: 64,
  },
  heroInlineWord: {
    fontSize: 28,
    fontFamily: "CormorantGaramond_400Regular_Italic",
    letterSpacing: 0.2,
  },
  heroInlineNumber: {
    fontSize: 56,
    fontFamily: "CormorantGaramond_500Medium",
    letterSpacing: -1.5,
  },
  heroLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
    marginTop: 4,
  },
  alignedHeroNumber: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    lineHeight: 60,
  },
  alignedHeroLabel: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
    marginTop: 6,
  },

  // ── Slim info row ───────────────────────────────────────────────────────
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  infoChunk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoItem: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  infoSep: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  accuracyDot: { width: 6, height: 6, borderRadius: 3 },

  // ── Sun-shadow strip ────────────────────────────────────────────────────
  sunStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 420,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  sunIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  sunStripEyebrow: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.6,
    marginBottom: 2,
  },
  sunStripBody: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 17,
  },
});
