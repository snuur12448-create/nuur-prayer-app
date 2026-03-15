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
  isSilent: boolean;
  onStop: () => void;
}

export function AdhanOverlay({ prayerName, prayerArabicName, reciter, styleName, isSilent, onStop }: Props) {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: false }),
    ]).start();

    if (!isSilent) {
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
    }
  }, [isSilent]);

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
          backgroundColor: isSilent
            ? colors.background + "F5"
            : colors.background,
        },
      ]}
    >
      {/* Subtle top glow — only when playing audio */}
      {!isSilent && (
        <View style={[styles.topGlow, { backgroundColor: colors.gold + "18" }]} />
      )}

      {/* Centre content */}
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        {/* Icon + ring */}
        <View style={styles.iconWrap}>
          {!isSilent && (
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
          )}

          <Animated.View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isSilent ? colors.surfaceElevated : colors.gold + "20",
                borderColor: isSilent ? colors.border : colors.gold + "55",
                transform: [{ scale: isSilent ? 1 : pulseAnim }],
              },
            ]}
          >
            {isSilent ? (
              <Feather name="bell" size={36} color={colors.textSecondary} />
            ) : (
              <Text style={[styles.crescentIcon, { color: colors.gold }]}>☽</Text>
            )}
          </Animated.View>
        </View>

        {/* Status badge */}
        {isSilent ? (
          <View style={[styles.nowPlayingBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Feather name="volume-x" size={10} color={colors.textSecondary} />
            <Text style={[styles.nowPlayingText, { color: colors.textSecondary }]}>SILENT PRAYER ALERT</Text>
          </View>
        ) : (
          <View style={[styles.nowPlayingBadge, { backgroundColor: colors.tint + "22", borderColor: colors.tint + "44" }]}>
            <View style={[styles.playingDot, { backgroundColor: colors.tint }]} />
            <Text style={[styles.nowPlayingText, { color: colors.tint }]}>ADHAN PLAYING</Text>
          </View>
        )}

        {/* Arabic prayer name */}
        <Text style={[styles.arabicName, { color: colors.text }]}>{prayerArabicName}</Text>
        <Text style={[styles.englishName, { color: colors.textSecondary }]}>{prayerName} Prayer</Text>

        {/* Gold divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: isSilent ? colors.border : colors.gold + "33" }]} />
          <Text style={[styles.dividerStar, { color: isSilent ? colors.textSecondary : colors.gold }]}>✦</Text>
          <View style={[styles.dividerLine, { backgroundColor: isSilent ? colors.border : colors.gold + "33" }]} />
        </View>

        {/* Reciter / silent note */}
        {isSilent ? (
          <View style={styles.reciterRow}>
            <Feather name="info" size={13} color={colors.textSecondary} />
            <Text style={[styles.reciterText, { color: colors.textSecondary }]}>
              Dismisses automatically in a few seconds
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.reciterRow}>
              <Feather name="mic" size={13} color={colors.textSecondary} />
              <Text style={[styles.reciterText, { color: colors.textSecondary }]}>{reciter}</Text>
            </View>
            <View style={styles.styleRow}>
              <Feather name="music" size={11} color={colors.textSecondary} />
              <Text style={[styles.styleText, { color: colors.textSecondary }]}>{styleName} style</Text>
            </View>
          </>
        )}
      </Animated.View>

      {/* Stop / Dismiss button */}
      <Pressable
        onPress={onStop}
        style={({ pressed }) => [
          styles.stopBtn,
          {
            backgroundColor: pressed
              ? (isSilent ? colors.border : colors.gold + "30")
              : colors.surfaceElevated,
            borderColor: isSilent ? colors.border : colors.gold + "55",
          },
        ]}
      >
        <Feather
          name={isSilent ? "x" : "square"}
          size={16}
          color={isSilent ? colors.textSecondary : colors.gold}
        />
        <Text style={[styles.stopText, { color: isSilent ? colors.textSecondary : colors.gold }]}>
          {isSilent ? "Dismiss" : "Stop Adhan"}
        </Text>
      </Pressable>

      {!isSilent && (
        <Text style={[styles.swipeHint, { color: colors.textSecondary }]}>
          Adhan will stop automatically when finished
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
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
  crescentIcon: { fontSize: 44 },
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
  dividerLine: { flex: 1, height: 1 },
  dividerStar: { fontSize: 12 },
  reciterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reciterText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    flex: 1,
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
