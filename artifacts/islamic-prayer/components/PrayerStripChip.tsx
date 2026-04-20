import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { TRACKER_PRAYERS, type TrackerPrayerKey } from "@/context/PrayerTrackerContext";

/**
 * Compact pill row showing the day's 5 obligatory prayers with their prayed
 * status. Tap a chip to toggle prayed (writes to PrayerTrackerContext, which
 * also drives the Tracker tab).
 *
 * Used on the Home screen below the celestial dome.
 */

export type PrayerStripStatus = "past" | "now" | "next" | "upcoming";

export interface PrayerStripChipProps {
  /** Section eyebrow (e.g. "EARLIER TODAY", "TODAY") */
  label: string;
  /** Map prayer → prayed boolean (read from tracker context). */
  prayed: Record<TrackerPrayerKey, boolean>;
  /** Map prayer → time string ("12:18" / "8:31 PM"). */
  times: Record<TrackerPrayerKey, string>;
  /** Per-prayer status to indicate now / next visually. */
  statuses?: Partial<Record<TrackerPrayerKey, PrayerStripStatus>>;
  /** Toggle handler — wired to PrayerTrackerContext.togglePrayer */
  onToggle: (prayer: TrackerPrayerKey) => void;
  themeColors: {
    text: string;
    textSecondary: string;
    border: string;
    surface: string;
    background: string;
    gold: string;
    tint: string;
  };
}

const PRAYER_NAMES: Record<TrackerPrayerKey, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export function PrayerStripChip({ label, prayed, times, statuses, onToggle, themeColors }: PrayerStripChipProps) {
  const gold = themeColors.gold ?? themeColors.tint;
  return (
    <View style={[styles.wrap, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
      <Text style={[styles.eyebrow, { color: themeColors.textSecondary }]}>{label}</Text>
      <View style={styles.row}>
        {TRACKER_PRAYERS.map((p) => {
          const isDone = !!prayed[p];
          const status = statuses?.[p] ?? "upcoming";
          const isNow = status === "now";
          const isNext = status === "next";
          return (
            <Pressable
              key={p}
              onPress={() => onToggle(p)}
              hitSlop={6}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isDone
                    ? gold + "1A"
                    : isNow
                      ? gold + "12"
                      : "transparent",
                  borderColor: isDone ? gold + "55" : isNow ? gold + "66" : themeColors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={styles.chipTop}>
                {isDone ? (
                  <View style={[styles.checkDot, { backgroundColor: gold }]}>
                    <Feather name="check" size={8} color={themeColors.background} />
                  </View>
                ) : (
                  <View style={[styles.emptyDot, { borderColor: isNow ? gold : themeColors.border }]} />
                )}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.name,
                    {
                      color: isDone ? themeColors.text : isNow ? themeColors.text : themeColors.textSecondary,
                      fontFamily: isNow || isDone ? "Inter_700Bold" : "Inter_500Medium",
                    },
                  ]}
                >
                  {PRAYER_NAMES[p]}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.time,
                  {
                    color: isNow ? gold : themeColors.textSecondary,
                    fontFamily: isNext ? "Inter_600SemiBold" : "Inter_500Medium",
                  },
                ]}
              >
                {times[p] || "--:--"}
              </Text>
              {isNext && <View style={[styles.nextRing, { borderColor: gold }]} pointerEvents="none" />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  eyebrow: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 6,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    gap: 3,
    position: "relative",
  },
  chipTop: { flexDirection: "row", alignItems: "center", gap: 4 },
  checkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.2,
  },
  name: {
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
  time: {
    fontSize: 9.5,
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.3,
  },
  nextRing: {
    position: "absolute",
    inset: -1 as any,
    top: -1,
    bottom: -1,
    left: -1,
    right: -1,
    borderRadius: 11,
    borderWidth: 1,
    borderStyle: "dashed",
    opacity: 0.5,
  },
});
