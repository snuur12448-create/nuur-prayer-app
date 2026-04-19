import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import type { QiblaMapViewProps } from "./QiblaMapView";

/**
 * Web fallback for the Qibla map view.
 *
 * Web doesn't have a free Apple/Google MapKit equivalent without API keys,
 * so we render a stylized "globe slice" diagram: a curved great-circle line
 * from the user (left) to the Kaaba (right) with the bearing labelled.
 * Communicates the same idea — your direction is a real geographic line
 * across the Earth — without needing a real map tile provider.
 */
export default function QiblaMapView({
  qiblaBearing,
  distanceKm,
  tintColor,
  goldColor,
  surfaceColor,
  textColor,
  textSecondaryColor,
}: QiblaMapViewProps) {
  const W = 320;
  const H = 320;

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="globeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={tintColor} stopOpacity="0.10" />
            <Stop offset="1" stopColor={tintColor} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Globe disc */}
        <Circle cx={W / 2} cy={H / 2} r={W / 2 - 20} fill="url(#globeGrad)" stroke={tintColor} strokeWidth={1} strokeOpacity={0.25} />
        {/* Latitude lines (decorative) */}
        {[-30, 0, 30].map((lat) => (
          <Path
            key={lat}
            d={`M 25 ${H / 2 - lat * 1.5} Q ${W / 2} ${H / 2 - lat * 1.5 - 18} ${W - 25} ${H / 2 - lat * 1.5}`}
            fill="none"
            stroke={tintColor}
            strokeWidth={0.6}
            strokeOpacity={0.18}
          />
        ))}

        {/* Great-circle line — gentle arc from user to Kaaba */}
        <Path
          d={`M 70 ${H / 2 + 30} Q ${W / 2} ${H / 2 - 70} ${W - 70} ${H / 2 - 30}`}
          fill="none"
          stroke={goldColor}
          strokeWidth={2.5}
          strokeDasharray="6 6"
          strokeLinecap="round"
        />

        {/* User dot */}
        <Circle cx={70} cy={H / 2 + 30} r={7} fill={tintColor} stroke={surfaceColor} strokeWidth={2} />

        {/* Kaaba marker */}
        <Circle cx={W - 70} cy={H / 2 - 30} r={11} fill={goldColor} stroke={surfaceColor} strokeWidth={2} />
      </Svg>

      {/* Kaaba icon overlay (RN icon, positioned over the SVG marker) */}
      <View style={[styles.kaabaIconOverlay]} pointerEvents="none">
        <MaterialCommunityIcons name="cube" size={11} color="#0A1A0E" />
      </View>

      {/* Labels */}
      <Text style={[styles.youLabel, { color: textSecondaryColor }]}>You</Text>
      <Text style={[styles.kaabaLabel, { color: textSecondaryColor }]}>Kaaba</Text>

      {/* Floating info pill */}
      <View style={[styles.infoPill, { backgroundColor: surfaceColor + "EE", borderColor: goldColor + "55" }]}>
        <Text style={[styles.infoBearing, { color: textColor }]}>{Math.round(qiblaBearing)}° bearing</Text>
        <Text style={[styles.infoDistance, { color: textSecondaryColor }]}>
          {distanceKm.toLocaleString()} km to Kaaba
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 360,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  kaabaIconOverlay: {
    position: "absolute",
    // Match SVG marker position: cx=W-70, cy=H/2-30 in 320x320 viewBox.
    // Container is square; convert ratios to percentages.
    right: "21.875%",
    top: "40.625%",
    transform: [{ translateX: 6 }, { translateY: -6 }],
  },
  youLabel: {
    position: "absolute",
    left: "21.875%",
    top: "59.375%",
    transform: [{ translateX: -6 }, { translateY: 12 }],
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  kaabaLabel: {
    position: "absolute",
    right: "21.875%",
    top: "40.625%",
    transform: [{ translateX: 8 }, { translateY: -22 }],
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  infoPill: {
    position: "absolute",
    left: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoBearing: { fontSize: 12, fontFamily: "Inter_700Bold" },
  infoDistance: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1 },
});
