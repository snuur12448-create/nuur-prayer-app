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
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Line, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
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
  const w = size;
  const h = size;

  // Main cube body — classic Ka'bah proportions
  const bodyW = w * 0.54;
  const bodyH = h * 0.52;
  const bodyX = (w - bodyW) / 2;
  const bodyY = h * 0.28;

  // Kiswa band (gold stripe ~1/3 from top)
  const bandH = bodyH * 0.13;
  const bandY = bodyY + bodyH * 0.28;

  // Door
  const doorW = bodyW * 0.22;
  const doorH = bodyH * 0.34;
  const doorX = bodyX + bodyW / 2 - doorW / 2;
  const doorY = bodyY + bodyH * 0.36;
  const doorArcR = doorW * 0.5;

  // Steps
  const stepsY = bodyY + bodyH;
  const step1W = bodyW * 1.08;
  const step2W = bodyW * 1.18;
  const step1H = h * 0.035;
  const step2H = h * 0.028;

  // Maqam Ibrahim (small structure to the right)
  const maqamW = w * 0.07;
  const maqamH = h * 0.14;
  const maqamX = bodyX + bodyW + w * 0.05;
  const maqamY = stepsY - maqamH;

  // Corner columns
  const colW = bodyW * 0.05;

  // Crescent + star top
  const crescentCY = bodyY - h * 0.08;
  const crescentCX = w / 2;

  return (
    <Svg width={w} height={h}>
      {/* Shadow/base */}
      <Rect
        x={(w - step2W) / 2}
        y={stepsY + step1H + step2H}
        width={step2W}
        height={h * 0.02}
        rx={4}
        fill={color}
        opacity={0.12}
      />

      {/* Step 2 (bottom) */}
      <Rect
        x={(w - step2W) / 2}
        y={stepsY + step1H}
        width={step2W}
        height={step2H}
        rx={2}
        fill={color}
        opacity={0.45}
      />

      {/* Step 1 */}
      <Rect
        x={(w - step1W) / 2}
        y={stepsY}
        width={step1W}
        height={step1H}
        rx={2}
        fill={color}
        opacity={0.5}
      />

      {/* Main Ka'bah body */}
      <Rect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH}
        rx={2}
        fill={color}
        opacity={0.68}
      />

      {/* Corner columns */}
      <Rect x={bodyX - colW * 0.4} y={bodyY} width={colW} height={bodyH} rx={1} fill={color} opacity={0.3} />
      <Rect x={bodyX + bodyW - colW * 0.6} y={bodyY} width={colW} height={bodyH} rx={1} fill={color} opacity={0.3} />

      {/* Kiswa gold band */}
      <Rect
        x={bodyX}
        y={bandY}
        width={bodyW}
        height={bandH}
        fill={color}
        opacity={0.35}
      />
      {/* Calligraphy dots in band */}
      {Array.from({ length: 5 }, (_, i) => (
        <Rect
          key={i}
          x={bodyX + bodyW * 0.1 + i * bodyW * 0.17}
          y={bandY + bandH * 0.3}
          width={bodyW * 0.07}
          height={bandH * 0.45}
          rx={1}
          fill={color}
          opacity={0.25}
        />
      ))}

      {/* Door arch */}
      <Path
        d={`M ${doorX} ${doorY + doorH} L ${doorX} ${doorY + doorArcR} A ${doorArcR} ${doorArcR} 0 0 1 ${doorX + doorW} ${doorY + doorArcR} L ${doorX + doorW} ${doorY + doorH} Z`}
        fill={color}
        opacity={0.2}
      />
      <Path
        d={`M ${doorX} ${doorY + doorH} L ${doorX} ${doorY + doorArcR} A ${doorArcR} ${doorArcR} 0 0 1 ${doorX + doorW} ${doorY + doorArcR} L ${doorX + doorW} ${doorY + doorH}`}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
      />

      {/* Maqam Ibrahim */}
      <Rect x={maqamX} y={maqamY} width={maqamW} height={maqamH} rx={1} fill={color} opacity={0.3} />
      <Path
        d={`M ${maqamX - 1} ${maqamY} Q ${maqamX + maqamW / 2} ${maqamY - maqamH * 0.3} ${maqamX + maqamW + 1} ${maqamY} Z`}
        fill={color}
        opacity={0.3}
      />

      {/* Finial pole */}
      <Rect
        x={w / 2 - 1}
        y={bodyY - h * 0.15}
        width={2}
        height={h * 0.15}
        fill={color}
        opacity={0.55}
      />

      {/* Crescent */}
      <Path
        d={`M ${crescentCX - 7} ${crescentCY - 5} A 8 8 0 1 1 ${crescentCX + 7} ${crescentCY - 5} A 5 5 0 1 0 ${crescentCX - 7} ${crescentCY - 5} Z`}
        fill={color}
        opacity={0.65}
      />
    </Svg>
  );
}

const COMPASS_SIZE = 300;
const CX = COMPASS_SIZE / 2;
const OUTER_R = COMPASS_SIZE / 2 - 6;
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
}: {
  tintColor?: string;
  faceColor?: string;
  ringColor?: string;
  textColor?: string;
}) {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  const cardinalAngles = [
    { label: "N", angle: 0, color: "#FF5C5C", size: 17, weight: "bold" as const },
    { label: "S", angle: 180, color: textColor, size: 14, weight: "bold" as const },
    { label: "E", angle: 90, color: textColor, size: 14, weight: "bold" as const },
    { label: "W", angle: 270, color: textColor, size: 14, weight: "bold" as const },
  ];
  const degreeLabels = [30, 60, 120, 150, 210, 240, 300, 330];
  // 8 intercardinal markers (NE, SE, SW, NW + midpoints)
  const intercardinals = [
    { label: "NE", angle: 45 }, { label: "SE", angle: 135 },
    { label: "SW", angle: 225 }, { label: "NW", angle: 315 },
  ];

  return (
    <Svg width={COMPASS_SIZE} height={COMPASS_SIZE}>
      <Defs>
        <RadialGradient id="faceGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={faceColor} stopOpacity="1" />
          <Stop offset="75%" stopColor={faceColor} stopOpacity="1" />
          <Stop offset="100%" stopColor="#0A1A0E" stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="tintGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={tintColor} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={tintColor} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* ── Outer bezel ring ─────────────────────────────── */}
      <Circle cx={CX} cy={CX} r={OUTER_R + 4} fill={ringColor} opacity={0.9} />
      <Circle cx={CX} cy={CX} r={OUTER_R + 2} fill="#0A1A0E" />
      {/* Decorative gold ring segments (8 notches) */}
      {Array.from({ length: 8 }, (_, i) => {
        const a1 = ((i * 45 - 18) - 90) * (Math.PI / 180);
        const a2 = ((i * 45 + 18) - 90) * (Math.PI / 180);
        const r = OUTER_R + 3;
        return (
          <Path
            key={i}
            d={`M ${CX + r * Math.cos(a1)} ${CX + r * Math.sin(a1)} A ${r} ${r} 0 0 1 ${CX + r * Math.cos(a2)} ${CX + r * Math.sin(a2)}`}
            fill="none"
            stroke={ringColor}
            strokeWidth={3}
            opacity={0.6}
          />
        );
      })}

      {/* ── Compass face ────────────────────────────────── */}
      <Circle cx={CX} cy={CX} r={OUTER_R} fill="url(#faceGrad)" />
      <Circle cx={CX} cy={CX} r={OUTER_R} fill="url(#tintGlow)" />
      {/* Face inner border */}
      <Circle cx={CX} cy={CX} r={OUTER_R} fill="none" stroke={ringColor} strokeWidth={1.5} opacity={0.5} />

      {/* ── Degree ring border ──────────────────────────── */}
      <Circle cx={CX} cy={CX} r={INNER_R + 14} fill="none" stroke={ringColor} strokeWidth={0.5} opacity={0.3} />
      <Circle cx={CX} cy={CX} r={INNER_R} fill="none" stroke={ringColor} strokeWidth={1} opacity={0.4} />

      {/* ── Tick marks ──────────────────────────────────── */}
      {ticks.map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const isMajor = deg % 90 === 0;
        const isMid = deg % 45 === 0 && !isMajor;
        const isMinor30 = deg % 30 === 0 && !isMajor && !isMid;
        const tickLen = isMajor ? 16 : isMid ? 12 : isMinor30 ? 8 : 4;
        const r1 = OUTER_R - 2;
        const r2 = r1 - tickLen;
        const stroke = isMajor
          ? ringColor
          : isMid
          ? ringColor
          : isMinor30
          ? `${textColor}99`
          : `${textColor}44`;
        return (
          <Line
            key={deg}
            x1={CX + r1 * Math.cos(rad)} y1={CX + r1 * Math.sin(rad)}
            x2={CX + r2 * Math.cos(rad)} y2={CX + r2 * Math.sin(rad)}
            stroke={stroke}
            strokeWidth={isMajor ? 2.5 : isMid ? 1.8 : 1}
            opacity={isMajor ? 1 : 0.85}
          />
        );
      })}

      {/* ── Degree number labels ─────────────────────────── */}
      {degreeLabels.map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const r = OUTER_R - 24;
        const DegText = SvgText as any;
        return (
          <DegText
            key={deg}
            x={CX + r * Math.cos(rad)} y={CX + r * Math.sin(rad)}
            textAnchor="middle" dominantBaseline="central"
            fill={textColor} fontSize="8" opacity={0.6}
          >
            {deg}
          </DegText>
        );
      })}

      {/* ── Intercardinal labels (NE/SE/SW/NW) ──────────── */}
      {intercardinals.map(({ label, angle }) => {
        const rad = (angle - 90) * (Math.PI / 180);
        const r = OUTER_R - 22;
        const IntercardinalText = SvgText as any;
        return (
          <IntercardinalText
            key={label}
            x={CX + r * Math.cos(rad)} y={CX + r * Math.sin(rad)}
            textAnchor="middle" dominantBaseline="central"
            fill={textColor} fontSize="9" opacity={0.75}
          >
            {label}
          </IntercardinalText>
        );
      })}

      {/* ── Cardinal labels ──────────────────────────────── */}
      {cardinalAngles.map(({ label, angle, color, size, weight }) => {
        const rad = (angle - 90) * (Math.PI / 180);
        const r = OUTER_R - 21;
        const CardinalText = SvgText as any;
        return (
          <CardinalText
            key={label}
            x={CX + r * Math.cos(rad)} y={CX + r * Math.sin(rad)}
            textAnchor="middle" dominantBaseline="central"
            fill={color} fontSize={size.toString()} fontWeight={weight}
          >
            {label}
          </CardinalText>
        );
      })}

      {/* ── Crosshair lines ──────────────────────────────── */}
      <Line x1={CX} y1={CX - INNER_R + 4} x2={CX} y2={CX - FACE_R + 2} stroke={ringColor} strokeWidth={0.8} opacity={0.2} />
      <Line x1={CX} y1={CX + INNER_R - 4} x2={CX} y2={CX + FACE_R - 2} stroke={ringColor} strokeWidth={0.8} opacity={0.2} />
      <Line x1={CX - INNER_R + 4} y1={CX} x2={CX - FACE_R + 2} y2={CX} stroke={ringColor} strokeWidth={0.8} opacity={0.2} />
      <Line x1={CX + INNER_R - 4} y1={CX} x2={CX + FACE_R - 2} y2={CX} stroke={ringColor} strokeWidth={0.8} opacity={0.2} />
    </Svg>
  );
}

function QiblaNeedle({ size, aligned }: { size: number; aligned: boolean }) {
  const cx = size / 2;
  const gold = "#C9933A";
  const green = "#2ECC71";
  const needleColor = aligned ? green : gold;
  const tailColor = aligned ? "rgba(46,204,113,0.55)" : "rgba(40,40,40,0.75)";

  // Needle geometry — kept well inside the SVG bounds
  const tipY = cx - size * 0.32;   // top tip:  150 - 96 = 54px from top ✓
  const baseY = cx + size * 0.22;  // bottom:   150 + 66 = 216px ✓
  const halfW = 12;
  const tailHalfW = 8;

  // Kaaba icon centred just inside the upper needle face
  const kaabaW = 20;
  const kaabaH = 15;
  const kaabaMidY = tipY + 30;          // centre of Kaaba body (well inside SVG)
  const kaabaX = cx - kaabaW / 2;
  const kaabaTY = kaabaMidY - kaabaH / 2;

  // Pole from needle tip up to Kaaba bottom
  const poleTop = tipY + 2;
  const poleBot = kaabaTY;

  return (
    <Svg width={size} height={size}>
      {/* ── Qibla (top) half — gold/green ──────────────── */}
      <Path
        d={`M ${cx} ${tipY} L ${cx - halfW} ${cx} L ${cx} ${cx + 6} L ${cx + halfW} ${cx} Z`}
        fill={needleColor}
        opacity={0.97}
      />
      {/* Depth shading */}
      <Path
        d={`M ${cx} ${tipY} L ${cx - halfW} ${cx} L ${cx} ${cx + 6} Z`}
        fill="rgba(0,0,0,0.14)"
      />
      {/* Highlight streak */}
      <Path
        d={`M ${cx} ${tipY + 8} L ${cx - halfW * 0.3} ${cx - 6} L ${cx} ${cx - 8} Z`}
        fill="rgba(255,255,255,0.22)"
      />

      {/* ── Tail (bottom) half — dark ───────────────────── */}
      <Path
        d={`M ${cx - tailHalfW} ${cx} L ${cx} ${cx + 6} L ${cx + tailHalfW} ${cx} L ${cx} ${baseY} Z`}
        fill={tailColor}
      />

      {/* ── Ka'bah icon inside the needle tip ────────────── */}
      {/* Finial pole from needle tip to Ka'bah base */}
      <Rect x={cx - 1.2} y={poleTop} width={2.4} height={Math.max(poleBot - poleTop, 0)} fill={needleColor} opacity={0.7} rx={1} />

      {/* Ka'bah body */}
      <Rect
        x={kaabaX} y={kaabaTY}
        width={kaabaW} height={kaabaH}
        rx={1.5}
        fill="#061008"
        stroke={needleColor}
        strokeWidth={1.4}
        opacity={0.97}
      />
      {/* Kiswa stripe */}
      <Rect
        x={kaabaX} y={kaabaTY + kaabaH * 0.28}
        width={kaabaW} height={kaabaH * 0.17}
        fill={needleColor}
        opacity={0.75}
      />
      {/* Door arch */}
      <Path
        d={`M ${cx - 3} ${kaabaTY + kaabaH - 1}
            L ${cx - 3} ${kaabaTY + kaabaH * 0.6}
            A 3 3 0 0 1 ${cx + 3} ${kaabaTY + kaabaH * 0.6}
            L ${cx + 3} ${kaabaTY + kaabaH - 1} Z`}
        fill={needleColor}
        opacity={0.35}
      />
      {/* Steps */}
      <Rect x={kaabaX - 2} y={kaabaTY + kaabaH} width={kaabaW + 4} height={2} rx={0.8} fill={needleColor} opacity={0.5} />
      <Rect x={kaabaX - 4} y={kaabaTY + kaabaH + 2} width={kaabaW + 8} height={1.5} rx={0.8} fill={needleColor} opacity={0.3} />

      {/* ── Center pivot ─────────────────────────────────── */}
      <Circle cx={cx} cy={cx} r={14} fill="#061008" stroke={needleColor} strokeWidth={2.2} opacity={0.97} />
      <Circle cx={cx} cy={cx} r={7} fill={needleColor} opacity={0.92} />
      <Circle cx={cx} cy={cx} r={3} fill="#fff" opacity={0.8} />
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

  // Track viewMode in a ref so the compass callbacks (which capture state
  // at creation time) can read the live value without resubscribing.
  const viewModeRef = useRef<"compass" | "map">("compass");
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  const fireHaptic = useCallback((kind: "tick" | "lock") => {
    // Suppress all haptic feedback when the user is on the map view —
    // the compass UI is hidden so unsolicited buzzes would be confusing.
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Qibla Direction</Text>
            <View style={styles.headerSubRow}>
              {qiblaAngle !== null && (
                <Text style={[styles.headerAngle, { color: colors.gold }]}>{Math.round(qiblaAngle)}° from North</Text>
              )}
              {accuracyInfo && (
                <View
                  style={[
                    styles.accuracyChip,
                    {
                      backgroundColor:
                        accuracyInfo.tone === "good" ? "rgba(46,204,113,0.14)"
                        : accuracyInfo.tone === "warn" ? "rgba(212,160,23,0.16)"
                        : "rgba(255,92,92,0.16)",
                      borderColor:
                        accuracyInfo.tone === "good" ? "rgba(46,204,113,0.45)"
                        : accuracyInfo.tone === "warn" ? "rgba(212,160,23,0.5)"
                        : "rgba(255,92,92,0.5)",
                    },
                  ]}
                >
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
                      styles.accuracyChipText,
                      {
                        color:
                          accuracyInfo.tone === "good" ? "#2ECC71"
                          : accuracyInfo.tone === "warn" ? "#D4A017"
                          : "#FF5C5C",
                      },
                    ]}
                  >
                    {accuracyInfo.label}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={colors.tint} />
            ) : (
              <Pressable style={[styles.locationBtn, { borderColor: `${colors.tint}55`, backgroundColor: `${colors.tint}15` }]} onPress={requestLocation}>
                <Feather name="crosshair" size={14} color={colors.tint} />
                <Text style={[styles.locationBtnText, { color: colors.tint }]}>
                  {usingDefaultLocation ? "Detect" : location?.city ?? "Locate"}
                </Text>
              </Pressable>
            )}
            {/* Compass / Map view toggle — segmented control */}
            <View style={[styles.viewToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable
                onPress={() => setViewMode("compass")}
                style={[
                  styles.viewToggleSeg,
                  viewMode === "compass" && { backgroundColor: colors.gold + "22" },
                ]}
                accessibilityLabel="Compass view"
              >
                <Feather
                  name="compass"
                  size={13}
                  color={viewMode === "compass" ? colors.gold : colors.textSecondary}
                />
              </Pressable>
              <Pressable
                onPress={() => setViewMode("map")}
                style={[
                  styles.viewToggleSeg,
                  viewMode === "map" && { backgroundColor: colors.gold + "22" },
                ]}
                accessibilityLabel="Map view"
              >
                <Feather
                  name="map"
                  size={13}
                  color={viewMode === "map" ? colors.gold : colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Main compass area */}
      <View style={styles.compassArea}>
        {/* Ka'bah watermark background — compass view only */}
        {viewMode === "compass" && (
          <View style={styles.kaabahBg} pointerEvents="none">
            <KaabahSilhouette size={220} color={colors.tint} />
          </View>
        )}

        {/* Distance info — only in compass view (map shows its own pill) */}
        {viewMode === "compass" && distance !== null && (
          <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
            {distance.toLocaleString()} km to Kaaba
          </Text>
        )}

        {/* Map view */}
        {viewMode === "map" && (
          location && qiblaAngle !== null && distance !== null ? (
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
          )
        )}

        {/* Compass */}
        {viewMode === "compass" && (
        <View style={styles.compassOuter}>
          {/* Rotating compass face */}
          <Animated.View
            style={[styles.absoluteFill, { transform: [{ rotate: compassRotate }] }]}
          >
            <CompassFace
              tintColor={colors.gold}
              faceColor={colors.surface}
              ringColor={colors.gold}
              textColor={colors.text}
            />
          </Animated.View>

          {/* Islamic pattern on compass face (static decoration) */}
          <View style={[styles.absoluteFill, styles.patternWrap]} pointerEvents="none">
            <IslamicGeometricPattern size={FACE_R * 2} color={colors.tint} />
          </View>

          {/* Qibla needle (rotates to point toward Mecca) */}
          {qiblaAngle !== null && (
            <Animated.View
              style={[styles.absoluteFill, { transform: [{ rotate: needleRotate }] }]}
            >
              <QiblaNeedle size={COMPASS_SIZE} aligned={aligned} />
            </Animated.View>
          )}

          {/* No compass message */}
          {showCompassStatus && !needsPermission && (
            <View style={styles.noCompassOverlay}>
              <ActivityIndicator color={colors.tint} />
              <Text style={[styles.noCompassText, { color: "rgba(255,255,255,0.7)" }]}>Detecting compass…</Text>
            </View>
          )}

          {/* Permission needed */}
          {needsPermission && (
            <View style={styles.noCompassOverlay}>
              <Feather name="rotate-cw" size={28} color={colors.tint} />
              <Text style={[styles.noCompassText, { color: "rgba(255,255,255,0.7)" }]}>Compass permission needed</Text>
              <Pressable style={[styles.permBtn, { borderColor: colors.tint, backgroundColor: `${colors.tint}22` }]} onPress={startCompass}>
                <Text style={[styles.permBtnText, { color: colors.tint }]}>Enable Compass</Text>
              </Pressable>
            </View>
          )}
        </View>
        )}

        {/* Status text — only meaningful when actively rotating the device */}
        {viewMode === "compass" && (
        <View style={styles.statusArea}>
          {alignedText ? (
            <View style={[styles.alignedCard, { borderColor: `${colors.tint}80`, backgroundColor: `${colors.tint}22` }]}>
              <Text style={[styles.alignedEmoji, { color: colors.tint }]}>✓</Text>
              <Text style={[styles.alignedText, { color: colors.tint }]}>You're facing Mecca</Text>
            </View>
          ) : qiblaAngle !== null ? (
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {hasCompass
                ? "Rotate until the arrow points up"
                : `Qibla is ${Math.round(qiblaAngle)}° from North`}
            </Text>
          ) : (
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>Locating…</Text>
          )}
        </View>

        )}

        {/* Heading display */}
        {viewMode === "compass" && hasCompass && (
          <View style={styles.headingRow}>
            <View style={[styles.headingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.headingValue, { color: colors.text }]}>{Math.round(compassHeading)}°</Text>
              <Text style={[styles.headingLabel, { color: colors.textSecondary }]}>Device Heading</Text>
            </View>
            {qiblaAngle !== null && (
              <View style={[styles.headingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.headingValue, { color: aligned ? colors.tint : colors.gold }]}>
                  {Math.round(Math.abs(((compassHeading - qiblaAngle + 180 + 360) % 360) - 180))}°
                </Text>
                <Text style={[styles.headingLabel, { color: colors.textSecondary }]}>Off Qibla</Text>
              </View>
            )}
            {distance !== null && (
              <View style={[styles.headingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.headingValue, { color: colors.text }]}>{distance.toLocaleString()}</Text>
                <Text style={[styles.headingLabel, { color: colors.textSecondary }]}>km to Kaaba</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Sun-shadow method card ─────────────────────────────────────── */}
        {/* Works without a compass — useful in steel buildings, planes, etc. */}
        {sunInfo && (
          <View style={[styles.sunCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sunHeader}>
              <View style={[styles.sunIconWrap, { backgroundColor: colors.gold + "22" }]}>
                <MaterialCommunityIcons
                  name={sunInfo.altitude > 0 ? "white-balance-sunny" : "weather-night"}
                  size={16}
                  color={colors.gold}
                />
              </View>
              <Text style={[styles.sunTitle, { color: colors.text }]}>Sun-shadow method</Text>
            </View>
            {sunInfo.altitude <= 0 ? (
              <Text style={[styles.sunBody, { color: colors.textSecondary }]}>
                The sun is below the horizon right now. This method becomes available at sunrise.
              </Text>
            ) : Math.abs(sunInfo.delta) < 1 ? (
              <Text style={[styles.sunBody, { color: colors.tint }]}>
                The sun is directly aligned with Qibla right now. Face the sun — you're facing Mecca.
              </Text>
            ) : (
              <Text style={[styles.sunBody, { color: colors.textSecondary }]}>
                Face the sun, then turn{" "}
                <Text style={{ color: colors.text, fontFamily: "Inter_700Bold" }}>
                  {Math.round(Math.abs(sunInfo.delta))}° to your {sunInfo.delta > 0 ? "right" : "left"}
                </Text>
                {" "}— you'll be facing Qibla.
              </Text>
            )}
            {sunInfo.altitude > 0 && (
              <View style={styles.sunMetaRow}>
                <Text style={[styles.sunMeta, { color: colors.textSecondary }]}>
                  Sun bearing {Math.round(sunInfo.azimuth)}°
                </Text>
                <View style={[styles.sunMetaDot, { backgroundColor: colors.border }]} />
                <Text style={[styles.sunMeta, { color: colors.textSecondary }]}>
                  Altitude {Math.round(sunInfo.altitude)}°
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
    color: "#fff",
  },
  headerAngle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#D4A017",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  // Compass / Map segmented control — sits under the Locate button.
  viewToggle: {
    flexDirection: "row",
    borderRadius: 9,
    borderWidth: 1,
    overflow: "hidden",
  },
  viewToggleSeg: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
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
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(46,204,113,0.3)",
    backgroundColor: "rgba(46,204,113,0.08)",
  },
  locationBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#2ECC71",
    maxWidth: 100,
  },
  compassArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    position: "relative",
  },
  kaabahBg: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    opacity: 0.07,
    zIndex: 0,
  },
  distanceText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
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
  patternWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  noCompassOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
  },
  noCompassText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  permBtn: {
    backgroundColor: "rgba(46,204,113,0.2)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2ECC71",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  permBtnText: {
    color: "#2ECC71",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  statusArea: {
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  alignedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(46,204,113,0.15)",
    borderWidth: 1,
    borderColor: "rgba(46,204,113,0.5)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  alignedEmoji: {
    fontSize: 22,
    color: "#2ECC71",
    fontFamily: "Inter_700Bold",
  },
  alignedText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#2ECC71",
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  headingRow: {
    flexDirection: "row",
    gap: 12,
  },
  headingCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minWidth: 80,
  },
  headingValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  headingLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
    textAlign: "center",
  },
  // Header sub-row — holds the angle text and the accuracy chip side-by-side.
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
    flexWrap: "wrap",
  },
  accuracyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  accuracyDot: { width: 5, height: 5, borderRadius: 2.5 },
  accuracyChipText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  // Sun-shadow card — the page's most useful "fallback" tool. Lives directly
  // under the data tiles and is full-width with comfortable padding so the
  // page no longer feels like a dead end below the compass.
  sunCard: {
    width: "100%",
    maxWidth: 420,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  sunHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sunIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sunTitle: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
  sunBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  sunMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sunMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sunMetaDot: { width: 3, height: 3, borderRadius: 1.5 },
});
