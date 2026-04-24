import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";

/**
 * Nuur — share / wallpaper card.
 *
 * Single source of truth for both 4:5 share cards (1080×1350) and
 * 9:19.5 phone wallpapers (1170×2535). Pure typography + SVG; no images,
 * no extra fonts (Inter + AmiriQuran only — both already loaded at boot).
 *
 * Visual language: Islamic manuscript. Inner frame, corner ornaments,
 * an 8-point rub el hizb mark above the masthead, geometric star divider,
 * and a delicate per-category palette (Qur'an emerald, Hadith walnut,
 * Du'a midnight, Name burgundy).
 */

export type QuoteCardMode = "card" | "wallpaper";
export type QuoteCardPalette = "quran" | "hadith" | "dua" | "name";

interface PaletteSpec {
  bgTop: string;
  bgMid: string;
  bgBottom: string;
  accent: string;       // primary gold/brass/etc.
  accentSoft: string;   // darker accent for ornament strokes
  text: string;
  textMuted: string;
  rule: string;
  glowTint: string;     // very subtle radial tint behind Arabic
}

const PALETTES: Record<QuoteCardPalette, PaletteSpec> = {
  // Default / Qur'an — deep emerald, classic gold.
  quran: {
    bgTop:    "#0B1A11",
    bgMid:    "#091510",
    bgBottom: "#050C08",
    accent:     "#D4A24A",
    accentSoft: "#7C5A22",
    text:       "rgba(247,239,221,0.97)",
    textMuted:  "rgba(247,239,221,0.62)",
    rule:       "rgba(212,162,74,0.22)",
    glowTint:   "rgba(212,162,74,0.10)",
  },
  // Hadith — warm walnut / sepia, brass accent (manuscript ink).
  hadith: {
    bgTop:    "#1B130C",
    bgMid:    "#140D08",
    bgBottom: "#0A0604",
    accent:     "#C99458",
    accentSoft: "#7A5224",
    text:       "rgba(247,236,214,0.97)",
    textMuted:  "rgba(247,236,214,0.60)",
    rule:       "rgba(201,148,88,0.22)",
    glowTint:   "rgba(201,148,88,0.10)",
  },
  // Du'a — deep indigo midnight, silvered gold (night prayer).
  dua: {
    bgTop:    "#101626",
    bgMid:    "#0A0F1B",
    bgBottom: "#050811",
    accent:     "#D9B574",
    accentSoft: "#6B5530",
    text:       "rgba(243,238,224,0.97)",
    textMuted:  "rgba(243,238,224,0.60)",
    rule:       "rgba(217,181,116,0.22)",
    glowTint:   "rgba(217,181,116,0.10)",
  },
  // Names of Allah — deep burgundy, rose gold.
  name: {
    bgTop:    "#1A0E13",
    bgMid:    "#13080C",
    bgBottom: "#080306",
    accent:     "#D9A678",
    accentSoft: "#7A4A36",
    text:       "rgba(247,234,221,0.97)",
    textMuted:  "rgba(247,234,221,0.60)",
    rule:       "rgba(217,166,120,0.22)",
    glowTint:   "rgba(217,166,120,0.10)",
  },
};

export interface QuoteCardProps {
  mode: QuoteCardMode;
  /** Render width in dp/px. Height derived from mode aspect. */
  width: number;

  /** Color system. Defaults to "quran". */
  palette?: QuoteCardPalette;

  /** Small uppercase eyebrow at top, e.g. "QUR'AN" or "HADITH". */
  eyebrow: string;
  /** Right-aligned ref number, e.g. "24:35" or "Bukhari 1". */
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

  const refW = mode === "wallpaper" ? 1170 : 1080;
  const s = width / refW;

  const p = PALETTES[props.palette ?? "quran"];

  const padX = 64 * s;
  const padTop = mode === "wallpaper" ? height * 0.36 : 56 * s;
  const padBottom = mode === "wallpaper" ? height * 0.07 : 52 * s;

  // Inner frame inset (manuscript-style hairline border).
  const frameInset = mode === "wallpaper" ? 28 * s : 24 * s;
  const frameTop   = mode === "wallpaper" ? height * 0.32 : frameInset;
  const frameBottom = mode === "wallpaper" ? height * 0.04 : frameInset;

  return (
    <View style={[styles.outer, { width, height, backgroundColor: p.bgBottom }]} collapsable={false}>
      {/* Layered background gradient */}
      <LinearGradient
        colors={[p.bgTop, p.bgMid, p.bgBottom]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Soft centered accent glow behind the Arabic */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { alignItems: "center", justifyContent: "center" },
        ]}
        pointerEvents="none"
      >
        <View
          style={{
            width: width * 0.95,
            height: width * 0.95,
            borderRadius: width,
            backgroundColor: p.glowTint,
            opacity: 0.9,
            transform: [{ translateY: mode === "wallpaper" ? height * 0.04 : 0 }],
          }}
        />
      </View>

      {/* Watermark star, very subtle, behind everything */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { alignItems: "center", justifyContent: "center" },
        ]}
        pointerEvents="none"
      >
        <RubElHizb
          size={width * 0.62}
          color={p.accent}
          opacity={0.045}
        />
      </View>

      {/* Inner manuscript frame with corner ornaments */}
      <ManuscriptFrame
        x={frameInset}
        y={frameTop}
        w={width - frameInset * 2}
        h={height - frameTop - frameBottom}
        color={p.accent}
        accentSoft={p.accentSoft}
        s={s}
      />

      {/* Content layer */}
      <View
        style={[
          styles.content,
          { paddingTop: padTop, paddingBottom: padBottom, paddingHorizontal: padX },
        ]}
      >
        {/* Masthead */}
        <View style={styles.masthead}>
          <View style={{ alignItems: "center" }}>
            <RubElHizb size={20 * s} color={p.accent} opacity={0.95} />
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 * s }}>
              <Text style={[styles.brand, { color: p.text, fontSize: 11 * s, letterSpacing: 5 * s }]}>
                NUUR
              </Text>
              <View style={[styles.dot, { backgroundColor: p.accent, width: 3 * s, height: 3 * s, borderRadius: 1.5 * s, marginHorizontal: 12 * s }]} />
              <Text style={[styles.eyebrow, { color: p.textMuted, fontSize: 10 * s, letterSpacing: 4 * s }]}>
                {props.eyebrow.toUpperCase()}
              </Text>
              {props.reference ? (
                <>
                  <View style={[styles.dot, { backgroundColor: p.accent, width: 3 * s, height: 3 * s, borderRadius: 1.5 * s, marginHorizontal: 12 * s }]} />
                  <Text style={[styles.reference, { color: p.textMuted, fontSize: 10 * s, letterSpacing: 2 * s }]}>
                    {props.reference}
                  </Text>
                </>
              ) : null}
            </View>
            <View style={{ marginTop: 16 * s }}>
              <OrnamentRule
                width={Math.min(width * 0.55, 320 * s)}
                color={p.accent}
                accentSoft={p.accentSoft}
                s={s}
              />
            </View>
          </View>
        </View>

        {/* Body — centered, generous breathing room */}
        <View style={styles.body}>
          {props.arabic ? (
            <Text
              style={[
                styles.arabic,
                {
                  color: p.text,
                  fontSize: arabicSize(mode, props.arabic) * s,
                  lineHeight: arabicSize(mode, props.arabic) * 1.75 * s,
                },
              ]}
              allowFontScaling={false}
            >
              {props.arabic}
            </Text>
          ) : null}

          {props.arabic && (props.transliteration || props.body || props.caption) ? (
            <View style={{ marginTop: 28 * s }}>
              <StarDivider color={p.accent} accentSoft={p.accentSoft} s={s} />
            </View>
          ) : null}

          {props.caption ? (
            <Text
              style={[
                styles.caption,
                { color: p.accent, fontSize: 12 * s, letterSpacing: 4 * s, marginTop: (props.arabic ? 22 : 0) * s },
              ]}
            >
              {props.caption.toUpperCase()}
            </Text>
          ) : null}

          {props.transliteration ? (
            <Text
              style={[
                styles.transliteration,
                { color: p.textMuted, fontSize: 14 * s, lineHeight: 22 * s, marginTop: (props.caption ? 12 : 18) * s },
              ]}
            >
              {props.transliteration}
            </Text>
          ) : null}

          <Text
            style={[
              styles.bodyText,
              {
                color: p.text,
                fontSize: bodySize(mode, props.body) * s,
                lineHeight: bodySize(mode, props.body) * 1.55 * s,
                marginTop: (props.arabic || props.caption || props.transliteration ? 18 : 0) * s,
              },
            ]}
          >
            {props.body}
          </Text>
        </View>

        {/* Footer */}
        <View style={{ alignItems: "center" }}>
          <View style={{ marginBottom: 18 * s }}>
            <OrnamentRule
              width={Math.min(width * 0.55, 320 * s)}
              color={p.accent}
              accentSoft={p.accentSoft}
              s={s}
            />
          </View>
          <View style={styles.footerRow}>
            {props.attribution ? (
              <Text style={[styles.attribution, { color: p.textMuted, fontSize: 11 * s, letterSpacing: 0.6 * s }]}>
                {props.attribution}
              </Text>
            ) : <View style={{ flex: 1 }} />}
            <View style={styles.footerBrand}>
              <Text style={[styles.brand, { color: p.accent, fontSize: 11 * s, letterSpacing: 5 * s, marginRight: 8 * s }]}>
                NUUR
              </Text>
              <RubElHizb size={12 * s} color={p.accent} opacity={1} />
            </View>
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
    if (len < 25) return 64;
    if (len < 60) return 48;
    if (len < 120) return 38;
    return 30;
  }
  // card
  if (len < 25) return 64;
  if (len < 60) return 44;
  if (len < 120) return 32;
  return 26;
}

function bodySize(mode: QuoteCardMode, body: string): number {
  const len = body.length;
  if (mode === "wallpaper") {
    if (len < 100) return 24;
    if (len < 220) return 20;
    return 17;
  }
  if (len < 100) return 19;
  if (len < 220) return 16;
  return 14;
}

/* ── Decorative SVGs ────────────────────────────────────────────────── */

/**
 * Rub el hizb — the classic 8-point Islamic star
 * (two overlapping squares rotated 45°). Drawn from a 64-unit viewBox.
 */
function RubElHizb({
  size,
  color,
  opacity = 1,
}: {
  size: number;
  color: string;
  opacity?: number;
}) {
  // Two squares centered at (32,32). Square A axis-aligned, Square B rotated 45°.
  // Square A vertices at radius r1; Square B vertices at radius r2.
  const r = 28;
  const a = [
    `${32 - r},${32 - r}`,
    `${32 + r},${32 - r}`,
    `${32 + r},${32 + r}`,
    `${32 - r},${32 + r}`,
  ].join(" ");
  const b = [
    `${32},${32 - r * 1.15}`,
    `${32 + r * 1.15},${32}`,
    `${32},${32 + r * 1.15}`,
    `${32 - r * 1.15},${32}`,
  ].join(" ");
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Polygon points={a} fill="none" stroke={color} strokeWidth="1.6" opacity={opacity} />
      <Polygon points={b} fill="none" stroke={color} strokeWidth="1.6" opacity={opacity} />
      <Circle cx="32" cy="32" r="2.2" fill={color} opacity={opacity} />
    </Svg>
  );
}

/**
 * Small four-point star used as a divider centerpiece.
 */
function FourStar({ size, color }: { size: number; color: string }) {
  // 4-point sharp star.
  const c = 32;
  const p = [
    `${c},${c - 28}`,
    `${c + 8},${c - 8}`,
    `${c + 28},${c}`,
    `${c + 8},${c + 8}`,
    `${c},${c + 28}`,
    `${c - 8},${c + 8}`,
    `${c - 28},${c}`,
    `${c - 8},${c - 8}`,
  ].join(" ");
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Polygon points={p} fill={color} />
    </Svg>
  );
}

/**
 * Centered ornament rule: hairline ── ✦ ── hairline.
 * Used above the body and below the body for a manuscript divider feel.
 */
function OrnamentRule({
  width,
  color,
  accentSoft,
  s,
}: {
  width: number;
  color: string;
  accentSoft: string;
  s: number;
}) {
  const starSize = 10 * s;
  const lineLen = (width - starSize - 16 * s) / 2;
  return (
    <Svg width={width} height={Math.max(starSize, 4 * s)} viewBox={`0 0 ${width} ${Math.max(starSize, 4 * s)}`}>
      <Defs>
        <SvgLinearGradient id="orL" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={accentSoft} stopOpacity="0" />
          <Stop offset="1" stopColor={color} stopOpacity="0.9" />
        </SvgLinearGradient>
        <SvgLinearGradient id="orR" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity="0.9" />
          <Stop offset="1" stopColor={accentSoft} stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>
      <Line
        x1="0"
        y1={starSize / 2}
        x2={lineLen}
        y2={starSize / 2}
        stroke="url(#orL)"
        strokeWidth={1}
      />
      <G x={lineLen + 8 * s} y={0}>
        <FourStar size={starSize} color={color} />
      </G>
      <Line
        x1={lineLen + starSize + 16 * s}
        y1={starSize / 2}
        x2={width}
        y2={starSize / 2}
        stroke="url(#orR)"
        strokeWidth={1}
      />
    </Svg>
  );
}

/**
 * Smaller star divider used between Arabic and translation.
 */
function StarDivider({
  color,
  accentSoft,
  s,
}: {
  color: string;
  accentSoft: string;
  s: number;
}) {
  const w = 80 * s;
  const h = 12 * s;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <SvgLinearGradient id="sdL" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={accentSoft} stopOpacity="0" />
          <Stop offset="1" stopColor={color} stopOpacity="0.85" />
        </SvgLinearGradient>
        <SvgLinearGradient id="sdR" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity="0.85" />
          <Stop offset="1" stopColor={accentSoft} stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>
      <Line x1="0" y1={h / 2} x2={w / 2 - 6 * s} y2={h / 2} stroke="url(#sdL)" strokeWidth={1} />
      <Circle cx={w / 2} cy={h / 2} r={2.4 * s} fill={color} />
      <Line x1={w / 2 + 6 * s} y1={h / 2} x2={w} y2={h / 2} stroke="url(#sdR)" strokeWidth={1} />
    </Svg>
  );
}

/**
 * Inner manuscript frame — hairline rectangle with small star ornaments
 * inset at each corner. Drawn as one absolutely-positioned SVG.
 */
function ManuscriptFrame({
  x, y, w, h, color, accentSoft, s,
}: {
  x: number; y: number; w: number; h: number;
  color: string; accentSoft: string; s: number;
}) {
  const cornerInset = 18 * s;
  const cornerLen = 22 * s;
  const starSize = 9 * s;
  return (
    <View
      style={{
        position: "absolute",
        left: x, top: y, width: w, height: h,
      }}
      pointerEvents="none"
    >
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <SvgLinearGradient id="frameStrokeV" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="0.5" stopColor={color} stopOpacity="0.55" />
            <Stop offset="1" stopColor={color} stopOpacity="0.3" />
          </SvgLinearGradient>
          <SvgLinearGradient id="frameStrokeH" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="0.5" stopColor={color} stopOpacity="0.55" />
            <Stop offset="1" stopColor={color} stopOpacity="0.3" />
          </SvgLinearGradient>
        </Defs>
        {/* Outer thin rectangle */}
        <Rect
          x={0.5} y={0.5}
          width={w - 1} height={h - 1}
          fill="none"
          stroke={color}
          strokeOpacity={0.18}
          strokeWidth={1}
          rx={2}
        />
        {/* Corner accent bars (top-left) */}
        <G stroke={color} strokeWidth={1.4} strokeOpacity={0.55} strokeLinecap="round">
          {/* TL */}
          <Line x1={cornerInset} y1={cornerInset} x2={cornerInset + cornerLen} y2={cornerInset} />
          <Line x1={cornerInset} y1={cornerInset} x2={cornerInset} y2={cornerInset + cornerLen} />
          {/* TR */}
          <Line x1={w - cornerInset} y1={cornerInset} x2={w - cornerInset - cornerLen} y2={cornerInset} />
          <Line x1={w - cornerInset} y1={cornerInset} x2={w - cornerInset} y2={cornerInset + cornerLen} />
          {/* BL */}
          <Line x1={cornerInset} y1={h - cornerInset} x2={cornerInset + cornerLen} y2={h - cornerInset} />
          <Line x1={cornerInset} y1={h - cornerInset} x2={cornerInset} y2={h - cornerInset - cornerLen} />
          {/* BR */}
          <Line x1={w - cornerInset} y1={h - cornerInset} x2={w - cornerInset - cornerLen} y2={h - cornerInset} />
          <Line x1={w - cornerInset} y1={h - cornerInset} x2={w - cornerInset} y2={h - cornerInset - cornerLen} />
        </G>
        {/* Tiny star at each corner inside the L */}
        <G fill={color}>
          <CornerStar cx={cornerInset} cy={cornerInset} size={starSize} color={color} />
          <CornerStar cx={w - cornerInset} cy={cornerInset} size={starSize} color={color} />
          <CornerStar cx={cornerInset} cy={h - cornerInset} size={starSize} color={color} />
          <CornerStar cx={w - cornerInset} cy={h - cornerInset} size={starSize} color={color} />
        </G>
        {/* Reference accentSoft to keep TS happy if otherwise unused. */}
        <Path d="M0 0" stroke={accentSoft} />
      </Svg>
    </View>
  );
}

function CornerStar({
  cx, cy, size, color,
}: {
  cx: number; cy: number; size: number; color: string;
}) {
  // Build a four-point star centered at (cx,cy) directly in parent SVG.
  const r = size / 2;
  const inner = r * 0.32;
  const pts = [
    `${cx},${cy - r}`,
    `${cx + inner},${cy - inner}`,
    `${cx + r},${cy}`,
    `${cx + inner},${cy + inner}`,
    `${cx},${cy + r}`,
    `${cx - inner},${cy + inner}`,
    `${cx - r},${cy}`,
    `${cx - inner},${cy - inner}`,
  ].join(" ");
  return <Polygon points={pts} fill={color} />;
}

/* ── Styles ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  masthead: {
    width: "100%",
    alignItems: "center",
  },
  dot: {},
  brand: {
    fontFamily: "Inter_700Bold",
  },
  eyebrow: {
    fontFamily: "Inter_500Medium",
  },
  reference: {
    fontFamily: "Inter_500Medium",
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  arabic: {
    fontFamily: "AmiriQuran_400Regular",
    textAlign: "center",
    writingDirection: "rtl",
    paddingHorizontal: 4,
  },
  caption: {
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  transliteration: {
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  bodyText: {
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  attribution: {
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
  },
});
