import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";

interface Props {
  onComplete: () => void;
}

const GOLD = "#C9933A";
const GOLD_BRIGHT = "#E8B85C";
const GOLD_DEEP = "#8B6420";
const GOLD_SOFT = "#C9933A55";
const GOLD_FAINT = "#C9933A18";

// Dawn-to-dusk sky stops. The sky reads as deep night when the splash mounts,
// then warms slightly toward the bottom (false horizon glow) so the lantern
// feels like it's hanging in the predawn air just before Fajr — the moment
// the muezzin's voice would be reaching the sleeping streets.
const SKY_TOP = "#070C18";        // deepest pre-dawn sky
const SKY_MID = "#0F1A33";        // night-indigo
const SKY_HORIZON = "#2A1E3D";    // false horizon — first bruise of color
const SKY_GLOW = "#5A3A4A";       // hint of warmth at the floor

// Stars twinkle at fixed positions; randomising on each render would re-seed
// every animation frame and make them dance. These are hand-placed to feel
// natural without obscuring the lantern.
const STAR_FIELD: { x: number; y: number; r: number; delay: number }[] = [
  { x: 0.12, y: 0.10, r: 1.5, delay: 0    },
  { x: 0.22, y: 0.18, r: 1,   delay: 600  },
  { x: 0.78, y: 0.08, r: 2,   delay: 200  },
  { x: 0.88, y: 0.22, r: 1,   delay: 900  },
  { x: 0.08, y: 0.32, r: 1.2, delay: 1100 },
  { x: 0.92, y: 0.40, r: 1.5, delay: 400  },
  { x: 0.18, y: 0.55, r: 1,   delay: 1400 },
  { x: 0.82, y: 0.58, r: 1.2, delay: 800  },
  { x: 0.06, y: 0.72, r: 1,   delay: 300  },
  { x: 0.94, y: 0.74, r: 1.5, delay: 1000 },
  { x: 0.32, y: 0.06, r: 1,   delay: 700  },
  { x: 0.68, y: 0.04, r: 1.2, delay: 1300 },
];

function useTwinkle(delay: number) {
  const v = useRef(new Animated.Value(0.2)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(v, { toValue: 0.2, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, v]);
  return v;
}

function Star({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) {
  const opacity = useTwinkle(delay);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        backgroundColor: "#FFFFFF",
        opacity,
      }}
    />
  );
}

export function NuurSplash({ onComplete }: Props) {
  // Container starts fully opaque and only fades OUT when exiting.
  const exitAnim = useRef(new Animated.Value(1)).current;

  // Sky warming progression — drives the bottom horizon glow brightening as
  // dawn approaches. Goes 0 → 1 over the splash lifetime.
  const dawnProgress = useRef(new Animated.Value(0)).current;

  // Lantern entry — rises from below with scale + fade.
  const lanternRise = useRef(new Animated.Value(40)).current;
  const lanternFade = useRef(new Animated.Value(0)).current;
  const lanternScale = useRef(new Animated.Value(0.85)).current;

  // Lantern flame (the crescent inside) — soft ongoing breath.
  const flameGlow = useRef(new Animated.Value(0.4)).current;
  const flameScale = useRef(new Animated.Value(0.95)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;

  // Lantern subtle sway — hangs from a chain so it can drift a hair.
  const sway = useRef(new Animated.Value(0)).current;

  // Text reveal.
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    // Phase 1 — lantern enters (rise + fade + settle scale)
    Animated.parallel([
      Animated.timing(lanternRise, { toValue: 0, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(lanternFade, { toValue: 1, duration: 700, useNativeDriver: false }),
      Animated.spring(lanternScale, { toValue: 1, tension: 40, friction: 8, useNativeDriver: false }),
    ]).start(() => {
      // Phase 2 — flame catches: halo blooms, flame settles into a slow breath
      Animated.parallel([
        Animated.timing(haloOpacity, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(textFade, { toValue: 1, duration: 600, useNativeDriver: false }),
      ]).start();

      // Slow flame breath
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(flameGlow,  { toValue: 0.95, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(flameScale, { toValue: 1.05, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(flameGlow,  { toValue: 0.55, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(flameScale, { toValue: 0.95, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          ]),
        ])
      ).start();

      // Lantern sway — barely perceptible drift left-right
      Animated.loop(
        Animated.sequence([
          Animated.timing(sway, { toValue: 1,  duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(sway, { toValue: -1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      ).start();
    });

    // Sky dawn warming runs across full lifetime, independent of phases
    Animated.timing(dawnProgress, {
      toValue: 1,
      duration: 4200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // After display time, fade container OUT and signal completion.
    const exitTimer = setTimeout(() => {
      Animated.timing(exitAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }).start(() => onComplete());
    }, 4200);

    return () => clearTimeout(exitTimer);
  }, []);

  // Glow opacity for the bottom horizon — interpolates from faint to warmer
  const horizonGlow = dawnProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  const swayDeg = sway.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-1.2deg", "1.2deg"],
  });

  // Render — stars are memoised so their fixed positions don't re-mount.
  const stars = useMemo(
    () => STAR_FIELD.map((s, i) => <Star key={i} {...s} />),
    []
  );

  return (
    <Animated.View style={[styles.container, { opacity: exitAnim }]}>
      {/* Night sky base gradient */}
      <LinearGradient
        colors={[SKY_TOP, SKY_MID, SKY_HORIZON]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Animated horizon warm wash — brightens as dawn progresses */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: horizonGlow }]} pointerEvents="none">
        <LinearGradient
          colors={["transparent", "transparent", SKY_GLOW]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Star field */}
      {stars}

      {/* Lantern halo — soft golden bloom around the lantern that follows
          the flame's breath. Sits behind the lantern body. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            opacity: Animated.multiply(haloOpacity, flameGlow) as any,
            transform: [{ scale: Animated.add(0.9, Animated.multiply(flameScale, 0.4)) as any }],
          },
        ]}
      />

      {/* Lantern + chain group */}
      <Animated.View
        style={[
          styles.lanternGroup,
          {
            opacity: lanternFade,
            transform: [
              { translateY: lanternRise },
              { rotate: swayDeg },
              { scale: lanternScale },
            ],
          },
        ]}
      >
        {/* Hanging chain (top of screen → lantern handle) */}
        <View style={styles.chain} />

        {/* Handle ring */}
        <View style={styles.handleRing} />

        {/* Top finial dome */}
        <View style={styles.topDome} />

        {/* Lantern neck */}
        <View style={styles.neck} />

        {/* Lantern body — chamfered hex silhouette built from a rect + two triangles */}
        <View style={styles.bodyWrap}>
          <View style={styles.bodyShoulder} />
          <View style={styles.bodyMain}>
            {/* Inner glow layer */}
            <Animated.View
              style={[
                styles.innerGlow,
                {
                  opacity: flameGlow,
                  transform: [{ scale: flameScale }],
                },
              ]}
            />
            {/* Crescent — the "flame" of the lantern, doubling as Islamic motif */}
            <Animated.Text
              style={[
                styles.crescent,
                {
                  opacity: flameGlow,
                  transform: [{ scale: flameScale }],
                },
              ]}
            >
              ☾
            </Animated.Text>
            {/* Vertical lattice bars across the lantern face */}
            <View style={[styles.bar, { left: "22%" }]} />
            <View style={[styles.bar, { left: "50%", marginLeft: -0.5 }]} />
            <View style={[styles.bar, { right: "22%" }]} />
          </View>
          <View style={styles.bodyBase} />
        </View>

        {/* Bottom finial */}
        <View style={styles.bottomFinial} />
        <View style={styles.bottomDrop} />
      </Animated.View>

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

const LANTERN_WIDTH = 84;
const LANTERN_BODY_HEIGHT = 92;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SKY_TOP,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    overflow: "hidden",
  },

  // ── Halo ──────────────────────────────────────────────
  halo: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: GOLD_FAINT,
    // Soft golden bloom — multiple layers via shadow on iOS, fallback fine on Android
    shadowColor: GOLD_BRIGHT,
    shadowOpacity: 0.6,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    top: "30%",
  },

  // ── Lantern group ─────────────────────────────────────
  lanternGroup: {
    alignItems: "center",
    marginBottom: 40,
    // Anchor the rotation around the chain attachment point at the top
    transformOrigin: "50% 0%" as any,
  },
  chain: {
    width: 1,
    height: 60,
    backgroundColor: GOLD_DEEP,
    opacity: 0.7,
  },
  handleRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: GOLD,
    marginTop: -2,
  },
  topDome: {
    width: 28,
    height: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: GOLD_DEEP,
    borderWidth: 1,
    borderColor: GOLD,
    borderBottomWidth: 0,
    marginTop: 4,
  },
  neck: {
    width: 36,
    height: 6,
    backgroundColor: GOLD_DEEP,
    borderWidth: 1,
    borderColor: GOLD,
  },
  bodyWrap: {
    width: LANTERN_WIDTH,
    alignItems: "center",
  },
  // The shoulder is the chamfered top of the hexagonal body — a trapezoid
  // approximated with a top-rounded rectangle that's narrower than the main.
  bodyShoulder: {
    width: LANTERN_WIDTH * 0.85,
    height: 12,
    backgroundColor: GOLD_DEEP,
    borderWidth: 1,
    borderColor: GOLD,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
  },
  bodyMain: {
    width: LANTERN_WIDTH,
    height: LANTERN_BODY_HEIGHT,
    backgroundColor: "#1A130A",
    borderWidth: 1.5,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  innerGlow: {
    position: "absolute",
    width: LANTERN_WIDTH * 1.4,
    height: LANTERN_WIDTH * 1.4,
    borderRadius: LANTERN_WIDTH * 0.7,
    backgroundColor: GOLD_BRIGHT,
    opacity: 0.5,
  },
  crescent: {
    fontSize: 38,
    color: "#FFE6A8",
    includeFontPadding: false,
    textShadowColor: GOLD_BRIGHT,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  bar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: GOLD_DEEP,
    opacity: 0.85,
  },
  bodyBase: {
    width: LANTERN_WIDTH * 0.85,
    height: 10,
    backgroundColor: GOLD_DEEP,
    borderWidth: 1,
    borderColor: GOLD,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopWidth: 0,
  },
  bottomFinial: {
    width: 24,
    height: 6,
    backgroundColor: GOLD_DEEP,
    borderWidth: 1,
    borderColor: GOLD,
    marginTop: 0,
  },
  bottomDrop: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
    marginTop: 2,
  },

  // ── Text block ────────────────────────────────────────
  textBlock: {
    alignItems: "center",
    gap: 6,
    marginTop: 20,
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
    width: 36,
    height: 1,
    backgroundColor: GOLD_SOFT,
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
    color: "#B89A7A",
    letterSpacing: 1.5,
    marginTop: 4,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", web: "Georgia, serif" }),
    fontStyle: "italic",
  },
});
