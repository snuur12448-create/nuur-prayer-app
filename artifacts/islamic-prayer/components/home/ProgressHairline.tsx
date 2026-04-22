import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ThemeColors } from "./constants";

export interface ProgressHairlineProps {
  colors: ThemeColors;
  fraction: number;
  leftLabel: string;
  rightLabel: string;
  centreLabel: string;
  inkSoft16: string;
  accent: string;
}

function ProgressHairlineInner({
  colors, fraction, leftLabel, rightLabel, centreLabel, inkSoft16, accent,
}: ProgressHairlineProps) {
  return (
    <View style={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 14 }}>
      <View style={[styles.barTrack, { backgroundColor: inkSoft16 }]}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.round(fraction * 100)}%`, backgroundColor: accent },
          ]}
        />
        <View
          style={[
            styles.barDot,
            {
              left: `${Math.round(fraction * 100)}%`,
              backgroundColor: accent,
              shadowColor: accent,
            },
          ]}
        />
      </View>
      <View style={styles.barLabels}>
        <Text style={[styles.barTime, { color: colors.textSecondary }]}>{leftLabel}</Text>
        <Text style={[styles.barTime, { color: colors.textSecondary }]} numberOfLines={1}>
          {centreLabel}
        </Text>
        <Text style={[styles.barTime, { color: colors.textSecondary }]}>{rightLabel}</Text>
      </View>
    </View>
  );
}

export const ProgressHairline = memo(ProgressHairlineInner);

const styles = StyleSheet.create({
  barTrack: {
    height: 2,
    borderRadius: 1,
    position: "relative",
  },
  barFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 2,
    borderRadius: 1,
  },
  barDot: {
    position: "absolute",
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    shadowOpacity: 0.85,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  barTime: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
});
