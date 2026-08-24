import React, { memo } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { PrayerTimesResult } from "@/utils/prayerTimes";
import type { TrackerPrayerKey } from "@/context/PrayerTrackerContext";
import type { ThemeColors } from "./constants";

export interface EarlierTodayStripProps {
  colors: ThemeColors;
  prayerTimes: PrayerTimesResult;
  prayed: Record<TrackerPrayerKey, boolean>;
  swapT: number;
  onToggleBud: (k: TrackerPrayerKey) => void;
}

function EarlierTodayStripInner({
  colors, prayerTimes, prayed, swapT, onToggleBud,
}: EarlierTodayStripProps) {
  const { fontScale } = useWindowDimensions();
  const accessibilityLayout = fontScale >= 1.6;

  return (
    <View
      style={{ paddingHorizontal: 20, paddingTop: 0, paddingBottom: 14, opacity: swapT }}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: accessibilityLayout ? "stretch" : "center",
          flexWrap: accessibilityLayout ? "wrap" : "nowrap",
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 9,
            letterSpacing: 1.4,
            color: colors.textSecondary,
            fontWeight: "700",
            marginRight: 4,
            width: accessibilityLayout ? "100%" : undefined,
          }}
          maxFontSizeMultiplier={1.6}
        >
          EARLIER TODAY
        </Text>
        {(["fajr", "dhuhr", "asr", "maghrib"] as const).map((id) => {
          const src =
            id === "fajr" ? prayerTimes.fajr
              : id === "dhuhr" ? prayerTimes.dhuhr
                : id === "asr" ? prayerTimes.asr
                  : prayerTimes.maghrib;
          const done = !!prayed[id];
          const label = id.charAt(0).toUpperCase() + id.slice(1);
          return (
            <Pressable
              key={id}
              onPress={() => onToggleBud(id)}
              hitSlop={6}
              style={{
                flex: accessibilityLayout ? 0 : 1,
                width: accessibilityLayout ? "48%" : undefined,
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                paddingVertical: 4,
                paddingHorizontal: 2,
                borderRadius: 10,
                backgroundColor: done ? colors.gold + "14" : "transparent",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                {done ? (
                  <Feather name="check" size={9} color={colors.gold} />
                ) : (
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                )}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: done ? colors.text : colors.textSecondary,
                  }}
                  maxFontSizeMultiplier={1.6}
                >
                  {label}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 8.5,
                  color: colors.textSecondary,
                  letterSpacing: 0.3,
                }}
                maxFontSizeMultiplier={1.6}
              >
                {src.timeString}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const EarlierTodayStrip = memo(EarlierTodayStripInner);
