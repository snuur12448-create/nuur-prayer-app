import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Text as SvgText, G } from "react-native-svg";
import Colors from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";
import { calculateQiblaDirection, getDistanceToKaaba } from "@/utils/qibla";

export default function QiblaScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { location } = useAppContext();

  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const needleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  useEffect(() => {
    if (location) {
      const angle = calculateQiblaDirection(location.latitude, location.longitude);
      const dist = getDistanceToKaaba(location.latitude, location.longitude);
      setQiblaAngle(angle);
      setDistance(dist);
    }
  }, [location]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (qiblaAngle !== null) {
      Animated.timing(needleAnim, {
        toValue: qiblaAngle,
        duration: 800,
        easing: Easing.out(Easing.elastic(1.2)),
        useNativeDriver: false,
      }).start();
    }
  }, [qiblaAngle]);

  const needleRotate = needleAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const CompassSvg = ({ size }: { size: number }) => {
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 10;
    const innerR = outerR - 20;
    const markLen = 12;

    const cardinals = [
      { label: "N", angle: 0 },
      { label: "E", angle: 90 },
      { label: "S", angle: 180 },
      { label: "W", angle: 270 },
    ];

    const subMarks = Array.from({ length: 36 }, (_, i) => i * 10).filter(
      (a) => a % 90 !== 0
    );

    return (
      <Svg width={size} height={size}>
        {/* Outer ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
          strokeWidth={2}
        />
        {/* Inner ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={innerR}
          fill={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
          stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}
          strokeWidth={1}
        />

        {/* Tick marks */}
        {subMarks.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = cx + (outerR - 4) * Math.sin(rad);
          const y1 = cy - (outerR - 4) * Math.cos(rad);
          const x2 = cx + (outerR - 4 - (deg % 30 === 0 ? 8 : 4)) * Math.sin(rad);
          const y2 = cy - (outerR - 4 - (deg % 30 === 0 ? 8 : 4)) * Math.cos(rad);
          return (
            <Line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}
              strokeWidth={deg % 30 === 0 ? 1.5 : 0.8}
            />
          );
        })}

        {/* Cardinal points */}
        {cardinals.map(({ label, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const r = outerR - 30;
          const x = cx + r * Math.sin(rad);
          const y = cy - r * Math.cos(rad);
          return (
            <SvgText
              key={label}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={label === "N" ? "#E55" : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)")}
              fontSize={label === "N" ? "14" : "12"}
              fontWeight={label === "N" ? "bold" : "normal"}
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  const compassSize = 280;
  const cx = compassSize / 2;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Qibla Direction</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Direction of the Kaaba
        </Text>
      </View>

      <View style={styles.compassSection}>
        {/* Location info */}
        {location && (
          <View style={[styles.locationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.locationInfo}>
              <Feather name="map-pin" size={14} color={colors.tint} />
              <Text style={[styles.locationText, { color: colors.text }]}>{location.city}</Text>
            </View>
            {distance !== null && (
              <View style={styles.distanceInfo}>
                <Feather name="navigation" size={14} color={colors.gold} />
                <Text style={[styles.distanceText, { color: colors.gold }]}>
                  {distance.toLocaleString()} km to Kaaba
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Compass */}
        <View style={styles.compassContainer}>
          <Animated.View style={[styles.compassWrapper, { transform: [{ scale: pulseAnim }] }]}>
            {/* Static compass ring */}
            <CompassSvg size={compassSize} />

            {/* Rotating Qibla needle */}
            {qiblaAngle !== null && (
              <Animated.View
                style={[
                  styles.needle,
                  {
                    width: compassSize,
                    height: compassSize,
                    transform: [{ rotate: needleRotate }],
                  },
                ]}
              >
                <Svg width={compassSize} height={compassSize}>
                  {/* Needle pointing to Qibla */}
                  <Path
                    d={`M ${cx} ${cx - compassSize * 0.32} L ${cx - 8} ${cx + 8} L ${cx} ${cx + 20} L ${cx + 8} ${cx + 8} Z`}
                    fill={colors.gold}
                    opacity={0.9}
                  />
                  {/* Kaaba icon dot */}
                  <Circle cx={cx} cy={cx - compassSize * 0.32 + 6} r={4} fill="#fff" opacity={0.9} />
                  {/* Center circle */}
                  <Circle cx={cx} cy={cx} r={10} fill={colors.gold} />
                  <Circle cx={cx} cy={cx} r={5} fill="#fff" />
                </Svg>
              </Animated.View>
            )}

            {!location && (
              <View style={[styles.noLocationOverlay]}>
                <Feather name="map-pin" size={32} color={colors.textSecondary} />
                <Text style={[styles.noLocationText, { color: colors.textSecondary }]}>
                  Location needed
                </Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Qibla angle info */}
        {qiblaAngle !== null && (
          <View style={[styles.angleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.angleRow}>
              <View style={styles.angleItem}>
                <Text style={[styles.angleValue, { color: colors.gold }]}>
                  {Math.round(qiblaAngle)}°
                </Text>
                <Text style={[styles.angleLabel, { color: colors.textSecondary }]}>
                  Qibla Direction
                </Text>
              </View>
              <View style={[styles.angleDivider, { backgroundColor: colors.border }]} />
              <View style={styles.angleItem}>
                <Text style={[styles.angleValue, { color: colors.tint }]}>
                  {getCompassLabel(qiblaAngle)}
                </Text>
                <Text style={[styles.angleLabel, { color: colors.textSecondary }]}>
                  Compass
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={[styles.instructionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            The golden arrow indicates the direction of the Kaaba (Qibla) from your current location. Face this direction when performing Salah.
          </Text>
        </View>
      </View>
    </View>
  );
}

function getCompassLabel(degrees: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(degrees / 45) % 8];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  compassSection: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
  locationCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  compassContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  compassWrapper: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  needle: {
    position: "absolute",
  },
  noLocationOverlay: {
    position: "absolute",
    alignItems: "center",
    gap: 8,
  },
  noLocationText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  angleCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
  },
  angleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  angleItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  angleValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  angleLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  angleDivider: {
    width: 1,
    height: 40,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
  },
  instructionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
  },
});
