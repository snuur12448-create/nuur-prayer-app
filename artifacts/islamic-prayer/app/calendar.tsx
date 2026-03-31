import { router } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IslamicCalendar } from "@/components/IslamicCalendar";
import { useAppContext } from "@/context/AppContext";

export default function CalendarScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: topPad,
        paddingBottom: insets.bottom,
      }}
    >
      <IslamicCalendar onClose={() => router.back()} />
    </View>
  );
}
