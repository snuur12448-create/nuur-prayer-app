import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Rect } from "react-native-svg";

/**
 * Type-only share / wallpaper card for Nuur.
 *
 * Brand-aligned: dark green background (#09150D), gold accent (#C9933A),
 * pure typography (Inter + AmiriQuran — both already loaded by the app).
 * No photos, no ornaments — just restrained editorial layout.
 *
 * One component, two aspect-ratio modes:
 *   - "card"      → 4:5 portrait (1080×1350 export)
 *   - "wallpaper" → 9:19.5 portrait (1170×2535 export); top ~38% kept clear
 *                   so the iOS clock area sits over empty space.
 */

const BG = "#09150D";
const GOLD = "#C9933A";
const TEXT = "rgba(245,238,220,0.96)";
const TEXT_MUTED = "rgba(245,238,220,0.62)";
const RULE = "rgba(245,238,220,0.14)";

export type QuoteCardMode = "card" | "wallpaper";

export interface QuoteCardProps {
  mode: QuoteCardMode;
  /** Render width in dp/px. Height derived from mode aspect. */
  width: number;

  /** Small uppercase eyebrow at top, e.g. "QUR'AN" or "HADITH". */
  eyebrow: string;
  /** Right-aligned ref number, e.g. "1:3" or "Bukhari 1". */
  reference?: string;

  /** Primary Arabic text (optional). */
  arabic?: string;
  /** Italic transliteration line (optional). */
  transliteration?: string;
  /** English translation / meaning. */
  body: string;
  /** Optional small line above the body (e.g. transliterated name). */
  caption?: string;
  /** Footer attribution, e.g. "Sahih al-Bukhari · 1". */
  attribution?: string;
}

export function QuoteCard(props: QuoteCardProps) {
  const { mode, width } = props;
  const aspect = mode === "wallpaper" ? 19.5 / 9 : 5 / 4;
  const height = width * aspect;

  // Scale relative to a fixed reference width per mode so spacing/sizing is
  // consistent at preview AND export resolutions.
  const refW = mode === "wallpaper" ? 1170 : 1080;
  const s = width / refW;

  const padX = 56 * s;
  const padTop = mode === "wallpaper" ? height * 0.38 : 56 * s;
  const padBottom = mode === "wallpaper" ? height * 0.06 : 48 * s;

  return (
    <View style={[styles.outer, { width, height }]} collapsable={false}>
      {/* Solid brand background. */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />

      {/* Subtle radial-ish glow centred on the content area, faked with
          a top-down dark→neutral→dark linear gradient. */}
      <LinearGradient
        colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          { paddingTop: padTop, paddingBottom: padBottom, paddingHorizontal: padX },
        ]}
      >
        {/* Masthead */}
        <View style={[styles.masthead, { paddingBottom: 14 * s }]}>
          <View style={styles.mastheadLeft}>
            <Text style={[styles.brand, { fontSize: 11 * s, letterSpacing: 4 * s }]}>NUUR</Text>
            <View style={[styles.mastheadDot, { backgroundColor: GOLD, width: 3 * s, height: 3 * s, borderRadius: 1.5 * s, marginHorizontal: 8 * s }]} />
            <Text style={[styles.eyebrow, { fontSize: 10 * s, letterSpacing: 2 * s }]}>
              {props.eyebrow.toUpperCase()}
            </Text>
          </View>
          {props.reference ? (
            <Text style={[styles.reference, { fontSize: 10 * s, letterSpacing: 1 * s }]}>
              {props.reference}
            </Text>
          ) : null}
          <View style={[styles.mastheadRule, { backgroundColor: RULE }]} />
        </View>

        {/* Body block */}
        <View style={styles.body}>
          {props.arabic ? (
            <Text
              style={[
                styles.arabic,
                {
                  fontSize: arabicSize(mode, props.arabic) * s,
                  lineHeight: arabicSize(mode, props.arabic) * 1.7 * s,
                },
              ]}
              allowFontScaling={false}
            >
              {props.arabic}
            </Text>
          ) : null}

          {props.caption ? (
            <Text
              style={[
                styles.caption,
                { color: GOLD, fontSize: 12 * s, letterSpacing: 3 * s, marginTop: (props.arabic ? 26 : 0) * s },
              ]}
            >
              {props.caption.toUpperCase()}
            </Text>
          ) : null}

          {props.transliteration ? (
            <Text
              style={[
                styles.transliteration,
                { fontSize: 14 * s, lineHeight: 22 * s, marginTop: 16 * s },
              ]}
            >
              {props.transliteration}
            </Text>
          ) : null}

          <Text
            style={[
              styles.bodyText,
              { fontSize: bodySize(mode) * s, lineHeight: bodySize(mode) * 1.55 * s, marginTop: (props.arabic || props.caption || props.transliteration ? 18 : 0) * s },
            ]}
          >
            {props.body}
          </Text>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { paddingTop: 16 * s, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: RULE }]}>
          {props.attribution ? (
            <Text style={[styles.attribution, { fontSize: 11 * s, letterSpacing: 0.4 * s }]}>
              {props.attribution}
            </Text>
          ) : <View />}
          <View style={styles.footerBrand}>
            <CompassMark size={18 * s} color={GOLD} />
            <Text style={[styles.brand, { color: GOLD, fontSize: 11 * s, letterSpacing: 5 * s, marginLeft: 8 * s }]}>
              NUUR
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ── Sizing helpers ─────────────────────────────────────────────────── */

function arabicSize(mode: QuoteCardMode, arabic: string): number {
  const len = arabic.length;
  if (mode === "wallpaper") {
    if (len < 30) return 56;
    if (len < 80) return 40;
    return 32;
  }
  // card
  if (len < 30) return 60;
  if (len < 80) return 36;
  return 28;
}

function bodySize(mode: QuoteCardMode): number {
  return mode === "wallpaper" ? 22 : 17;
}

/* ── Compass mark (single-purpose, kept inline to minimize files) ───── */

function CompassMark({ size = 18, color = GOLD }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect x="3" y="3" width="58" height="58" rx="11" fill="none" stroke={color} strokeWidth="1.4" opacity={0.85} />
      <G stroke={color} strokeWidth="1.3" strokeLinecap="round">
        <Line x1="32" y1="13" x2="32" y2="20" />
        <Line x1="32" y1="44" x2="32" y2="51" />
        <Line x1="13" y1="32" x2="20" y2="32" />
        <Line x1="44" y1="32" x2="51" y2="32" />
      </G>
      <Circle cx="32" cy="32" r="4" fill={color} />
    </Svg>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
    backgroundColor: BG,
  },
  content: {
    flex: 1,
    width: "100%",
  },
  /* Masthead */
  masthead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    position: "relative",
  },
  mastheadLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  mastheadDot: {},
  mastheadRule: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
  brand: {
    fontFamily: "Inter_700Bold",
    color: TEXT,
  },
  eyebrow: {
    fontFamily: "Inter_500Medium",
    color: TEXT_MUTED,
  },
  reference: {
    fontFamily: "Inter_500Medium",
    color: TEXT_MUTED,
  },
  /* Body */
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  arabic: {
    fontFamily: "AmiriQuran_400Regular",
    color: TEXT,
    textAlign: "center",
    writingDirection: "rtl",
    paddingHorizontal: 4,
  },
  caption: {
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  transliteration: {
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    color: "rgba(245,238,220,0.7)",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  bodyText: {
    fontFamily: "Inter_400Regular",
    color: TEXT,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  /* Footer */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  attribution: {
    fontFamily: "Inter_500Medium",
    color: TEXT_MUTED,
    flex: 1,
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
  },
});
