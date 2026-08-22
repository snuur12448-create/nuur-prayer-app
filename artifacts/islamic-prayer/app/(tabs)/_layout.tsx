import { BlurView } from "expo-blur";
import { router, Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useQuranPlayer } from "@/context/QuranPlayerContext";

/** Detect dark theme by sampling the luminance of the surface color.
 *  More reliable than useColorScheme(), which reflects the iOS system mode
 *  rather than the user's chosen in-app theme. */
function isThemeDark(colors: { surface: string }): boolean {
  const hex = colors.surface.replace("#", "");
  if (hex.length < 6) return true;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Rec. 709 luma; <128 = dark surface.
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
}

function MiniPlayer() {
  const { themeColors: colors } = useAppContext();
  const {
    playState,
    playingVerse,
    currentSurahNum,
    currentSurahArabic,
    currentSurahName,
    selectedReciter,
    autoAdvance,
    setAutoAdvance,
    stopAudio,
    togglePlayPause,
    skipNext,
    skipPrevious,
  } = useQuranPlayer();

  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  const TAB_H = isWeb ? 84 : isIOS ? 49 + insets.bottom : 60;

  if ((playState !== "playing" && playState !== "paused") || currentSurahNum === null) {
    return null;
  }

  const handlePlayPause = async () => {
    if (!playingVerse || !currentSurahArabic || !currentSurahName) return;
    await togglePlayPause(
      { number: playingVerse, text: "", translation: "", transliteration: "", numberInQuran: 0 },
      currentSurahNum,
      currentSurahArabic,
      currentSurahName,
      []
    );
  };

  return (
    <Pressable
      style={[styles.miniPlayer, { bottom: TAB_H, backgroundColor: colors.surface, borderTopColor: colors.tint + "55" }]}
      onPress={() => router.push({ pathname: "/quran/[id]", params: { id: String(currentSurahNum) } })}
    >
      <View style={[styles.miniAccent, { backgroundColor: colors.tint }]} />
      <View style={styles.miniInfo}>
        <Text style={[styles.miniSurah, { color: colors.text }]} numberOfLines={1}>
          {currentSurahArabic}
          {currentSurahName ? <Text style={[styles.miniSurahEn, { color: colors.textSecondary }]}> · {currentSurahName}</Text> : null}
        </Text>
        <Text style={[styles.miniMeta, { color: colors.textSecondary }]} numberOfLines={1}>
          Verse {playingVerse} · {selectedReciter.name.split(" ").slice(0, 2).join(" ")}
        </Text>
      </View>
      <View style={styles.miniControls}>
        <TouchableOpacity
          onPress={() => setAutoAdvance(!autoAdvance)}
          hitSlop={12}
          style={[styles.miniRepeatBtn, autoAdvance && { backgroundColor: colors.tint + "20", borderRadius: 6 }]}
        >
          <Feather name="repeat" size={13} color={autoAdvance ? colors.tint : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => skipPrevious()} hitSlop={12} style={styles.miniSkipBtn}>
          <Feather name="skip-back" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause} style={[styles.miniBtn, { backgroundColor: colors.tint + "20" }]} hitSlop={10}>
          <Feather name={playState === "playing" ? "pause" : "play"} size={16} color={colors.tint} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => skipNext()} hitSlop={12} style={styles.miniSkipBtn}>
          <Feather name="skip-forward" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => stopAudio()} style={styles.miniStopBtn} hitSlop={10}>
          <Feather name="x" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const { themeColors: colors } = useAppContext();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: "Inter_500Medium",
            marginBottom: isIOS ? 0 : 4,
          },
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.surface,
            borderTopWidth: isWeb ? 1 : 0,
            borderTopColor: colors.border,
            elevation: 0,
            ...(isWeb ? { height: 84 } : {}),
          },
          tabBarBackground: () =>
            isIOS ? (
              <View style={StyleSheet.absoluteFill}>
                {/* Frosted-glass blur for the iOS look. Tint follows the theme's
                    actual surface color (not system colorScheme — those can
                    disagree, e.g. dark theme on a light-mode iPhone). */}
                <BlurView
                  intensity={70}
                  tint={isThemeDark(colors) ? "dark" : "light"}
                  style={StyleSheet.absoluteFill}
                />
                {/* Soft scrim — enough opacity for icons to read clearly, but
                    light enough that the blur still feels glassy. */}
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: colors.surface, opacity: 0.45 },
                  ]}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth,
                    backgroundColor: isThemeDark(colors) ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  }}
                />
              </View>
            ) : isWeb ? (
              <View
                style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]}
              />
            ) : null,
        }}
      >
        {/* ── 5 visible tabs ── */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Prayer",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="moon.stars.fill" tintColor={color} size={24} />
              ) : (
                <MaterialCommunityIcons name="moon-waning-crescent" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="quran"
          options={{
            title: "Quran",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="book.fill" tintColor={color} size={24} />
              ) : (
                <MaterialCommunityIcons name="book-open-page-variant" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="dua"
          options={{
            title: "Adhkar",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="hands.sparkles.fill" tintColor={color} size={24} />
              ) : (
                <MaterialCommunityIcons name="hands-pray" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="qibla"
          options={{
            title: "Qibla",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="location.north.line.fill" tintColor={color} size={24} />
              ) : (
                <Feather name="navigation" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="ellipsis.circle.fill" tintColor={color} size={24} />
              ) : (
                <Feather name="grid" size={22} color={color} />
              ),
          }}
        />

        {/* ── Hidden from tab bar — accessible via More screen ── */}
        {/* dua, names, tasbeeh, settings, mosques, guide, hadiths now live as
            root Stack screens (see app/_layout.tsx) — they push on top of the
            tab navigator instead of pretending to be hidden tabs. */}
      </Tabs>
      <MiniPlayer />
    </View>
  );
}

export default function TabLayout() {
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  miniPlayer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  miniAccent: {
    width: 3,
    height: 36,
    borderRadius: 2,
  },
  miniInfo: {
    flex: 1,
    gap: 2,
  },
  miniSurah: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  miniSurahEn: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  miniMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  miniControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  miniStopBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  miniSkipBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  miniRepeatBtn: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
});
