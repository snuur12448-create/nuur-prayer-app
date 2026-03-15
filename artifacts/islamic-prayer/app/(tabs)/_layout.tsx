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

function MiniPlayer() {
  const { themeColors: colors } = useAppContext();
  const {
    playState,
    playingVerse,
    currentSurahNum,
    currentSurahArabic,
    currentSurahName,
    selectedReciter,
    stopAudio,
    togglePlayPause,
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
        <TouchableOpacity onPress={handlePlayPause} style={[styles.miniBtn, { backgroundColor: colors.tint + "20" }]} hitSlop={10}>
          <Feather name={playState === "playing" ? "pause" : "play"} size={16} color={colors.tint} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => stopAudio()} style={styles.miniStopBtn} hitSlop={10}>
          <Feather name="x" size={16} color={colors.textSecondary} />
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
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
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
                <Feather name="book" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="tracker"
          options={{
            title: "Tracker",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="checkmark.circle.fill" tintColor={color} size={24} />
              ) : (
                <Feather name="check-circle" size={22} color={color} />
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
        <Tabs.Screen name="dua"      options={{ href: null }} />
        <Tabs.Screen name="names"    options={{ href: null }} />
        <Tabs.Screen name="tasbeeh"  options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="mosques"  options={{ href: null }} />
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
