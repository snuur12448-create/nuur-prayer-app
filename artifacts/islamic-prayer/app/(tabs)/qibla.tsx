import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import { useAppContext } from "@/context/AppContext";
import { calculateQiblaDirection, getDistanceToKaaba } from "@/utils/qibla";

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

function CompassFace({ tintColor = "#2ECC71" }: { tintColor?: string }) {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  const cardinalAngles = [
    { label: "N", angle: 0, color: "#FF4040", size: 16, weight: "bold" as const },
    { label: "S", angle: 180, color: "#fff", size: 13, weight: "normal" as const },
    { label: "E", angle: 90, color: "#fff", size: 13, weight: "normal" as const },
    { label: "W", angle: 270, color: "#fff", size: 13, weight: "normal" as const },
  ];
  const degreeLabels = [30, 60, 120, 150, 210, 240, 300, 330];

  return (
    <Svg width={COMPASS_SIZE} height={COMPASS_SIZE}>
      <Defs>
        <RadialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={tintColor} stopOpacity="0.25" />
          <Stop offset="60%" stopColor={tintColor} stopOpacity="0.08" />
          <Stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </RadialGradient>
        <RadialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={tintColor} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={tintColor} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Outer ring background */}
      <Circle cx={CX} cy={CX} r={OUTER_R} fill="#111" />
      {/* Outer ring border */}
      <Circle cx={CX} cy={CX} r={OUTER_R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2} />

      {/* Inner compass face */}
      <Circle cx={CX} cy={CX} r={INNER_R} fill="url(#bgGrad)" />
      {/* Glow layer */}
      <Circle cx={CX} cy={CX} r={INNER_R} fill="url(#glowGrad)" />
      {/* Inner border */}
      <Circle cx={CX} cy={CX} r={INNER_R} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />

      {/* Tick marks on outer ring */}
      {ticks.map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const isMajor = deg % 90 === 0;
        const isMid = deg % 30 === 0 && !isMajor;
        const tickLen = isMajor ? 14 : isMid ? 9 : 5;
        const r1 = OUTER_R - 3;
        const r2 = r1 - tickLen;
        return (
          <Line
            key={deg}
            x1={CX + r1 * Math.cos(rad)} y1={CX + r1 * Math.sin(rad)}
            x2={CX + r2 * Math.cos(rad)} y2={CX + r2 * Math.sin(rad)}
            stroke={isMajor ? "rgba(255,255,255,0.9)" : isMid ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}
            strokeWidth={isMajor ? 2 : 1}
          />
        );
      })}

      {/* Degree number labels */}
      {degreeLabels.map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const r = OUTER_R - 21;
        return (
          <SvgText
            key={deg}
            x={CX + r * Math.cos(rad)} y={CX + r * Math.sin(rad)}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(255,255,255,0.6)" fontSize="8"
          >
            {deg}
          </SvgText>
        );
      })}

      {/* Cardinal labels */}
      {cardinalAngles.map(({ label, angle, color, size, weight }) => {
        const rad = (angle - 90) * (Math.PI / 180);
        const r = OUTER_R - 20;
        return (
          <SvgText
            key={label}
            x={CX + r * Math.cos(rad)} y={CX + r * Math.sin(rad)}
            textAnchor="middle" dominantBaseline="central"
            fill={color} fontSize={size.toString()} fontWeight={weight}
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

function QiblaNeedle({ size, aligned }: { size: number; aligned: boolean }) {
  const cx = size / 2;
  const needleColor = aligned ? "#2ECC71" : "#D4A017";
  const glowColor = aligned ? "rgba(46,204,113,0.4)" : "rgba(212,160,23,0.3)";
  const tipY = cx - size * 0.35;
  const baseY = cx + size * 0.15;
  const halfW = 10;
  const waist = 3;

  return (
    <Svg width={size} height={size}>
      {/* Glow */}
      <Path
        d={`M ${cx} ${tipY - 8} L ${cx - halfW - 4} ${baseY + 4} L ${cx} ${cx + 2} L ${cx + halfW + 4} ${baseY + 4} Z`}
        fill={glowColor}
      />
      {/* Main needle */}
      <Path
        d={`M ${cx} ${tipY} L ${cx - halfW} ${baseY} L ${cx - waist} ${cx} L ${cx} ${cx + size * 0.12} L ${cx + waist} ${cx} L ${cx + halfW} ${baseY} Z`}
        fill={needleColor}
        opacity={0.95}
      />
      {/* Highlight */}
      <Path
        d={`M ${cx} ${tipY} L ${cx - halfW * 0.5} ${(tipY + baseY) / 2} L ${cx} ${(tipY + baseY) / 2 + 4} Z`}
        fill="rgba(255,255,255,0.35)"
      />
      {/* Center knob */}
      <Circle cx={cx} cy={cx} r={10} fill={needleColor} />
      <Circle cx={cx} cy={cx} r={5} fill="#fff" opacity={0.9} />
      {/* Kaaba glyph at tip */}
      <Path
        d={`M ${cx - 6} ${tipY + 4} h 12 v 9 h -12 Z`}
        fill="#fff" opacity={0.9}
      />
      <Path
        d={`M ${cx - 4} ${tipY + 4} v -3 h 8 v 3`}
        fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.7}
      />
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

  const compassAnimRef = useRef(new Animated.Value(0));
  const needleAnimRef = useRef(new Animated.Value(0));
  const compassCurrentRef = useRef(0);
  const needleCurrentRef = useRef(0);
  const headingSubRef = useRef<any>(null);

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
    setAligned(diff < 8);
  }, []);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Qibla Direction</Text>
            {qiblaAngle !== null && (
              <Text style={[styles.headerAngle, { color: colors.gold }]}>{Math.round(qiblaAngle)}° from North</Text>
            )}
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
          </View>
        </View>
      </View>

      {/* Main compass area */}
      <View style={styles.compassArea}>
        {/* Distance info */}
        {distance !== null && (
          <Text style={styles.distanceText}>
            {distance.toLocaleString()} km to Kaaba
          </Text>
        )}

        {/* Compass */}
        <View style={styles.compassOuter}>
          {/* Rotating compass face */}
          <Animated.View
            style={[styles.absoluteFill, { transform: [{ rotate: compassRotate }] }]}
          >
            <CompassFace tintColor={colors.tint} />
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
              <Text style={styles.noCompassText}>Detecting compass…</Text>
            </View>
          )}

          {/* Permission needed */}
          {needsPermission && (
            <View style={styles.noCompassOverlay}>
              <Feather name="rotate-cw" size={28} color={colors.tint} />
              <Text style={styles.noCompassText}>Compass permission needed</Text>
              <Pressable style={[styles.permBtn, { borderColor: colors.tint, backgroundColor: `${colors.tint}22` }]} onPress={startCompass}>
                <Text style={[styles.permBtnText, { color: colors.tint }]}>Enable Compass</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Status text */}
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

        {/* Heading display */}
        {hasCompass && (
          <View style={styles.headingRow}>
            <View style={styles.headingCard}>
              <Text style={styles.headingValue}>{Math.round(compassHeading)}°</Text>
              <Text style={styles.headingLabel}>Device Heading</Text>
            </View>
            {qiblaAngle !== null && (
              <View style={styles.headingCard}>
                <Text style={[styles.headingValue, { color: aligned ? colors.tint : colors.gold }]}>
                  {Math.round(Math.abs(((compassHeading - qiblaAngle + 180 + 360) % 360) - 180))}°
                </Text>
                <Text style={styles.headingLabel}>Off Qibla</Text>
              </View>
            )}
            {distance !== null && (
              <View style={styles.headingCard}>
                <Text style={styles.headingValue}>{distance.toLocaleString()}</Text>
                <Text style={styles.headingLabel}>km to Kaaba</Text>
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
    fontSize: 22,
    fontFamily: "Inter_700Bold",
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
  },
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
});
