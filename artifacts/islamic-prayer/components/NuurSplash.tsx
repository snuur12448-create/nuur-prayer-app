import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

interface Props {
  onComplete: () => void;
}

const BG = "#09150D";
const GOLD = "#C9933A";
const GOLD_DIM = "#C9933A44";
const GOLD_FAINT = "#C9933A18";

export function NuurSplash({ onComplete }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.55)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  // Hide the native OS splash screen now that our custom splash is painted —
  // this prevents any blank-frame flash between the two.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: false }),
    ]).start(() => {
      Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: false }).start();

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(glowScale, { toValue: 1.15, duration: 1400, useNativeDriver: false }),
            Animated.timing(glowOpacity, { toValue: 0.85, duration: 1400, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(glowScale, { toValue: 1, duration: 1400, useNativeDriver: false }),
            Animated.timing(glowOpacity, { toValue: 0.55, duration: 1400, useNativeDriver: false }),
          ]),
        ])
      ).start();

      setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 550, useNativeDriver: false }).start(
          () => onComplete()
        );
      }, 2200);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Logo mark */}
      <Animated.View style={[styles.logoArea, { transform: [{ scale: scaleAnim }] }]}>
        {/* Outer glow ring */}
        <Animated.View
          style={[
            styles.glowRingOuter,
            { transform: [{ scale: glowScale }], opacity: glowOpacity },
          ]}
        />
        {/* Mid glow ring */}
        <Animated.View
          style={[
            styles.glowRingMid,
            {
              transform: [{ scale: glowScale }],
              opacity: Animated.multiply(glowOpacity, 0.7) as any,
            },
          ]}
        />

        {/* Rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <View
            key={angle}
            style={[styles.rayWrap, { transform: [{ rotate: `${angle}deg` }] }]}
          >
            <View style={styles.ray} />
          </View>
        ))}

        {/* Inner circle */}
        <View style={styles.innerCircle}>
          {/* Arabic nun — نور initial */}
          <Text style={styles.coreGlyph}>ن</Text>
        </View>
      </Animated.View>

      {/* Text block */}
      <Animated.View style={[styles.textBlock, { opacity: textFade }]}>
        <Text style={styles.arabicName}>نُور</Text>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerDot}>✦</Text>
          <View style={styles.dividerLine} />
        </View>
        <Text style={styles.latinName}>NUUR</Text>
        <Text style={styles.tagline}>Light for your daily deen</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    gap: 0,
  },
  logoArea: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  glowRingOuter: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: GOLD_FAINT,
    borderWidth: 1,
    borderColor: GOLD_DIM,
  },
  glowRingMid: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: GOLD + "10",
    borderWidth: 1,
    borderColor: GOLD + "55",
  },
  rayWrap: {
    position: "absolute",
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  ray: {
    width: 2,
    height: 26,
    borderRadius: 1,
    backgroundColor: GOLD,
    opacity: 0.7,
    marginTop: 4,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GOLD + "22",
    borderWidth: 1.5,
    borderColor: GOLD + "88",
    alignItems: "center",
    justifyContent: "center",
  },
  coreGlyph: {
    fontSize: 34,
    color: GOLD,
    includeFontPadding: false,
  },
  textBlock: {
    alignItems: "center",
    gap: 8,
  },
  arabicName: {
    fontSize: 52,
    color: GOLD,
    letterSpacing: 2,
    includeFontPadding: false,
    lineHeight: 64,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    width: 40,
    height: 1,
    backgroundColor: GOLD + "55",
  },
  dividerDot: {
    fontSize: 10,
    color: GOLD + "99",
  },
  latinName: {
    fontSize: 18,
    color: "#E8D5A8",
    letterSpacing: 8,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", web: "Georgia, serif" }),
  },
  tagline: {
    fontSize: 13,
    color: "#8BAF8E",
    letterSpacing: 1.5,
    marginTop: 4,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", web: "Georgia, serif" }),
    fontStyle: "italic",
  },
});
