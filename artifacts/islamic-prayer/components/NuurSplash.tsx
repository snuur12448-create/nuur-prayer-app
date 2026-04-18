import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

interface Props {
  onComplete: () => void;
}

const BG = "#09150D";
const GOLD = "#C9933A";
const GOLD_BRIGHT = "#E8B85C";
const GOLD_DIM = "#C9933A44";
const GOLD_FAINT = "#C9933A18";

// Eight rays radiating from the core. We animate them in sequence (sweeping
// clockwise) so the logo literally "lights up" rather than just appearing —
// reads as "Nuur" (light) emerging into being.
const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function NuurSplash({ onComplete }: Props) {
  // Container starts fully opaque and only fades OUT when exiting.
  const exitAnim = useRef(new Animated.Value(1)).current;

  // Core glyph (ن) entry — fades in from 0 with a slight scale settle
  const coreFade = useRef(new Animated.Value(0)).current;
  const coreScale = useRef(new Animated.Value(0.6)).current;

  // Each ray has its own animated value so we can stagger them
  const rayValues = useRef(RAY_ANGLES.map(() => new Animated.Value(0))).current;

  // Inner & outer glow rings pulse together once everything is in place
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  // Text reveal
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    // Phase 1 — core glyph emerges first (the seed of light)
    Animated.parallel([
      Animated.timing(coreFade, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.spring(coreScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: false }),
    ]).start(() => {
      // Phase 2 — rays sweep into existence clockwise from the core
      Animated.stagger(
        70,
        rayValues.map((v) =>
          Animated.timing(v, {
            toValue: 1,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          })
        )
      ).start(() => {
        // Phase 3 — glow pulse & text reveal
        Animated.parallel([
          Animated.timing(textFade, { toValue: 1, duration: 500, useNativeDriver: false }),
        ]).start();

        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(glowScale, { toValue: 1.18, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
              Animated.timing(glowOpacity, { toValue: 0.8, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            ]),
            Animated.parallel([
              Animated.timing(glowScale, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
              Animated.timing(glowOpacity, { toValue: 0.4, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            ]),
          ])
        ).start();
      });
    });

    // Total: core ~600ms + rays (8 × 70 stagger + 380) ~940ms + display ~1800ms + exit 600ms
    const exitTimer = setTimeout(() => {
      Animated.timing(exitAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }).start(() => onComplete());
    }, 3600);

    return () => clearTimeout(exitTimer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: exitAnim }]}>
      {/* Logo mark */}
      <View style={styles.logoArea}>
        {/* Outer pulsing glow ring */}
        <Animated.View
          style={[
            styles.glowRingOuter,
            { transform: [{ scale: glowScale }], opacity: glowOpacity },
          ]}
        />
        {/* Mid glow ring (also pulses, slightly dimmer) */}
        <Animated.View
          style={[
            styles.glowRingMid,
            {
              transform: [{ scale: glowScale }],
              opacity: Animated.multiply(glowOpacity, 0.7) as any,
            },
          ]}
        />

        {/* Eight rays — each animated independently to sweep in sequence.
            translateY moves each ray outward from the core; opacity fades in. */}
        {RAY_ANGLES.map((angle, i) => (
          <Animated.View
            key={angle}
            style={[
              styles.rayWrap,
              {
                transform: [{ rotate: `${angle}deg` }],
                opacity: rayValues[i],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.ray,
                {
                  transform: [
                    {
                      translateY: rayValues[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-8, 0],
                      }),
                    },
                  ],
                },
              ]}
            />
          </Animated.View>
        ))}

        {/* Inner circle — the core that holds the ن */}
        <Animated.View
          style={[
            styles.innerCircle,
            { opacity: coreFade, transform: [{ scale: coreScale }] },
          ]}
        >
          <Text style={styles.coreGlyph}>ن</Text>
        </Animated.View>
      </View>

      {/* Text block */}
      <Animated.View style={[styles.textBlock, { opacity: textFade }]}>
        <Text style={styles.arabicName}>نُور</Text>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerStar}>✸</Text>
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
    opacity: 0.85,
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
    fontSize: 38,
    color: GOLD_BRIGHT,
    includeFontPadding: false,
    textShadowColor: GOLD,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  textBlock: {
    alignItems: "center",
    gap: 8,
  },
  arabicName: {
    fontSize: 52,
    color: GOLD_BRIGHT,
    letterSpacing: 2,
    includeFontPadding: false,
    lineHeight: 64,
    textShadowColor: GOLD,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
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
  dividerStar: {
    fontSize: 11,
    color: GOLD,
  },
  latinName: {
    fontSize: 18,
    color: GOLD_BRIGHT,
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
