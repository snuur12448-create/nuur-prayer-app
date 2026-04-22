import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SERIF, type ThemeColors } from "./constants";

export interface QuickActionsProps {
  colors: ThemeColors;
  showTahajjud: boolean;
  onQibla: () => void;
  onQuran: () => void;
  onAdhkar: () => void;
  onTahajjud: () => void;
}

function QuickActionsInner({
  colors, showTahajjud, onQibla, onQuran, onAdhkar, onTahajjud,
}: QuickActionsProps) {
  const actions = showTahajjud
    ? [
        { icon: "moon" as const, label: "Tahajjud", onPress: onTahajjud },
        { icon: "book" as const, label: "Quran", onPress: onQuran },
        { icon: "star" as const, label: "Adhkar", onPress: onAdhkar },
      ]
    : [
        { icon: "compass" as const, label: "Qibla", onPress: onQibla },
        { icon: "book" as const, label: "Quran", onPress: onQuran },
        { icon: "star" as const, label: "Adhkar", onPress: onAdhkar },
      ];

  return (
    <>
      <View style={styles.quickRow}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.label}
            onPress={a.onPress}
            activeOpacity={0.85}
            style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name={a.icon} size={18} color={colors.gold} />
            <Text style={[styles.quickLabel, { color: colors.text }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.ornament}>
        <View style={[styles.ornamentLine, { backgroundColor: colors.gold + "38" }]} />
        <Text style={[styles.ornamentMark, { color: colors.gold, fontFamily: SERIF }]}>۞</Text>
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
  quickCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 13,
    alignItems: "center",
    gap: 6,
  },
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
