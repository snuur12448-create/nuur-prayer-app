import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SERIF, type ThemeColors } from "./constants";

export interface QuickActionsProps {
  colors: ThemeColors;
  showTahajjud: boolean;
  onTasbeeh: () => void;
  onTracker: () => void;
  onHadith: () => void;
  onTahajjud: () => void;
}

function QuickActionsInner({
  colors, showTahajjud, onTasbeeh, onTracker, onHadith, onTahajjud,
}: QuickActionsProps) {
  const { fontScale } = useWindowDimensions();
  const accessibilityLayout = fontScale >= 1.6;

  // Day: Tasbeeh · Tracker · Hadith — surfaces second-tier worship tools
  // that otherwise live only under More. At night, swap Hadith for the
  // Tahajjud prompt so the screen still nudges the actionable night
  // prayer rather than reading material.
  const actions = showTahajjud
    ? [
        { icon: "circle" as const, label: "Tasbeeh", onPress: onTasbeeh },
        { icon: "zap" as const, label: "Tracker", onPress: onTracker },
        { icon: "moon" as const, label: "Tahajjud", onPress: onTahajjud },
      ]
    : [
        { icon: "circle" as const, label: "Tasbeeh", onPress: onTasbeeh },
        { icon: "zap" as const, label: "Tracker", onPress: onTracker },
        { icon: "book-open" as const, label: "Hadith", onPress: onHadith },
      ];

  return (
    <>
      <View style={[styles.quickRow, accessibilityLayout && styles.quickRowAccessibility]}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.label}
            onPress={a.onPress}
            activeOpacity={0.85}
            style={[
              styles.quickCard,
              accessibilityLayout && styles.quickCardAccessibility,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Feather name={a.icon} size={18} color={colors.gold} />
            <Text style={[styles.quickLabel, { color: colors.text }]} maxFontSizeMultiplier={2}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.ornament}>
        <View style={[styles.ornamentLine, { backgroundColor: colors.gold + "38" }]} />
        <Text style={[styles.ornamentMark, { color: colors.gold, fontFamily: SERIF }]} maxFontSizeMultiplier={1.5}>۞</Text>
        <View style={[styles.ornamentLine, { backgroundColor: colors.gold + "38" }]} />
      </View>
    </>
  );
}

export const QuickActions = memo(QuickActionsInner);

const styles = StyleSheet.create({
  quickRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  quickRowAccessibility: { flexDirection: "column" },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 13,
    alignItems: "center",
    gap: 6,
  },
  quickCardAccessibility: { flex: 0, minHeight: 56, flexDirection: "row", justifyContent: "center" },
  quickLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  ornament: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
    paddingVertical: 14,
    gap: 12,
  },
  ornamentLine: { flex: 1, height: 1 },
  ornamentMark: { fontSize: 14 },
});
