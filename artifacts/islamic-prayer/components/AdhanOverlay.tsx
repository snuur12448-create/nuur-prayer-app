import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";

interface Props {
  prayerName: string;
  prayerArabicName: string;
  reciter: string;
  styleName: string;
  onStop: () => void;
}

export function AdhanOverlay({ prayerName, prayerArabicName, reciter, styleName, onStop }: Props) {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: false }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
      ])
    );
    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(ringAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    );
    pulse.start();
    ring.start();

    return () => {
      pulse.stop();
      ring.stop();
    };
  }, []);

  const ringScale = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const ringOpacity = ringAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.1, 0] });

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          paddingTop: Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top,
          paddingBottom: insets.bottom + 20,
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Subtle top gradient glow */}
      <View style={[styles.topGlow, { backgroundColor: colors.gold + "18" }]} />

      {/* Centre content */}
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        {/* Pulsing ring behind icon */}
        <View style={styles.iconWrap}>
          <Animated.View
            style={[
              styles.ring,
              {
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
                backgroundColor: colors.gold,
              },
            ]}
          />

          {/* Main crescent icon */}
          <Animated.View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.gold + "20",
                borderColor: colors.gold + "55",
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={[styles.crescentIcon, { color: colors.gold }]}>☽</Text>
          </Animated.View>
        </View>

        {/* Now Playing label */}
        <View style={[styles.nowPlayingBadge, { backgroundColor: colors.tint + "22", borderColor: colors.tint + "44" }]}>
          <View style={[styles.playingDot, { backgroundColor: colors.tint }]} />
          <Text style={[styles.nowPlayingText, { color: colors.tint }]}>ADHAN PLAYING</Text>
        </View>

        {/* Arabic prayer name */}
        <Text style={[styles.arabicName, { color: colors.text }]}>{prayerArabicName}</Text>
        {/* English prayer name */}
        <Text style={[styles.englishName, { color: colors.textSecondary }]}>{prayerName} Prayer</Text>

        {/* Gold divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.gold + "33" }]} />
          <Text style={[styles.dividerStar, { color: colors.gold }]}>✦</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.gold + "33" }]} />
        </View>

        {/* Reciter */}
        <View style={styles.reciterRow}>
          <Feather name="mic" size={13} color={colors.textSecondary} />
          <Text style={[styles.reciterText, { color: colors.textSecondary }]}>{reciter}</Text>
        </View>
        <View style={styles.styleRow}>
          <Feather name="music" size={11} color={colors.textSecondary} />
          <Text style={[styles.styleText, { color: colors.textSecondary }]}>{styleName} style</Text>
        </View>
      </Animated.View>

      {/* Stop button */}
      <Pressable
        onPress={onStop}
        style={({ pressed }) => [
          styles.stopBtn,
          {
            backgroundColor: pressed ? colors.gold + "30" : colors.surfaceElevated,
            borderColor: colors.gold + "55",
          },
        ]}
      >
        <Feather name="square" size={16} color={colors.gold} />
        <Text style={[styles.stopText, { color: colors.gold }]}>Stop Adhan</Text>
      </Pressable>

      <Text style={[styles.swipeHint, { color: colors.textSecondary }]}>
        Adhan will stop automatically when finished
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  content: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  ring: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  crescentIcon: {
    fontSize: 44,
  },
  nowPlayingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 4,
  },
  playingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  nowPlayingText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  arabicName: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 2,
    lineHeight: 68,
  },
  englishName: {
    fontSize: 22,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: -4,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "60%",
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerStar: {
    fontSize: 12,
  },
  reciterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reciterText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  styleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: -6,
  },
  styleText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  stopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 1,
    marginTop: 48,
  },
  stopText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  swipeHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 16,
    opacity: 0.6,
  },
});
