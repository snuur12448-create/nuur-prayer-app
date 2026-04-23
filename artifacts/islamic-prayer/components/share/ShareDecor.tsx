/**
 * Shared visual primitives for Nuur share cards & wallpapers.
 *
 * Design language:
 *   - near-black base + a soft dawn-glow radial in the upper third
 *   - a faint constellation of stars (seeded — same dots every render)
 *   - one large 8-point Khatam (rub-el-hizb) medallion behind the content
 *     as the hero ornament, instead of a busy repeating swatch
 *   - double-line gold mushaf-style frame
 *   - cohesive Nuur lockup (crescent + star → نور → NUUR wordmark)
 *
 * Used by AyahShareSheet (Quran) and ContentShareSheet (Hadith / Dua / Name).
 */
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const NUUR_ICON = require("@/assets/images/icon.png");
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

/** Stable per-mount unique id for SVG <Defs> ids, so two share sheets
 * (or repeated mounts) cannot collide on a "dawn"/"warmth"/"nm-gold" id. */
function useSvgId(prefix: string): string {
  // React.useId is available on RN ≥ 0.71 / React 18 — Expo SDK 50+.
  const id = (React as unknown as { useId?: () => string }).useId?.();
  return `${prefix}-${(id ?? Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

// ─── Palette ───────────────────────────────────────────────────────────────

export const GOLD       = "#C9933A";
export const GOLD_LIGHT = "#E6C173";
export const GOLD_DEEP  = "#8C6420";
export const CREAM      = "#F5ECD7";
export const CREAM_DIM  = "rgba(245, 236, 215, 0.72)";
export const CREAM_FAINT = "rgba(245, 236, 215, 0.42)";
export const INK        = "#06080C";

export type SharePalette = {
  /** the warm centre of the dawn-glow */
  glow:   string;
  /** mid tone of the gradient */
  mid:    string;
  /** deepest edge / vignette */
  edge:   string;
  /** accent for stars + secondary hairlines */
  accent: string;
};

export type ShareTheme = "quran" | "hadith" | "dua" | "name";

export const PALETTES: Record<ShareTheme, SharePalette> = {
  quran:  { glow: "#1F4D3A", mid: "#0F2A20", edge: "#06120D", accent: "#7FE3B0" },
  hadith: { glow: "#1E2D5C", mid: "#0F1A38", edge: "#070B1C", accent: "#9BB6F2" },
  dua:    { glow: "#3A1A2A", mid: "#220F1B", edge: "#10070C", accent: "#E8A8C4" },
  name:   { glow: "#2C1A4D", mid: "#180E2C", edge: "#0A0616", accent: "#C7A8F2" },
};

// ─── Background (gradient + constellation) ────────────────────────────────

export function ShareBackground({
  w, h, palette,
}: {
  w: number;
  h: number;
  palette: SharePalette;
}) {
  // seeded constellation — same stars every render so screenshots are stable
  const stars = React.useMemo(() => {
    const out: { x: number; y: number; r: number; o: number }[] = [];
    let seed = 0xC9933A;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed & 0xffffff) / 0xffffff;
    };
    const count = Math.round((w * h) / 7000);
    for (let i = 0; i < count; i++) {
      out.push({
        x: rnd() * w,
        y: rnd() * h,
        r: 0.5 + rnd() * 1.4,
        o: 0.18 + rnd() * 0.55,
      });
    }
    return out;
  }, [w, h]);

  const dawnId   = useSvgId("dawn");
  const warmthId = useSvgId("warmth");

  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id={dawnId} cx="50%" cy="22%" r="78%" fx="50%" fy="22%">
          <Stop offset="0%"   stopColor={palette.glow} stopOpacity="1" />
          <Stop offset="55%"  stopColor={palette.mid}  stopOpacity="1" />
          <Stop offset="100%" stopColor={palette.edge} stopOpacity="1" />
        </RadialGradient>
        <LinearGradient id={warmthId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={GOLD}      stopOpacity="0.06" />
          <Stop offset="35%"  stopColor={GOLD}      stopOpacity="0" />
          <Stop offset="100%" stopColor={INK}       stopOpacity="0.55" />
        </LinearGradient>
      </Defs>
      <Rect width={w} height={h} fill={`url(#${dawnId})`} />
      <Rect width={w} height={h} fill={`url(#${warmthId})`} />
      {stars.map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={i % 7 === 0 ? palette.accent : CREAM} opacity={s.o} />
      ))}
    </Svg>
  );
}

// ─── Hero medallion (rub-el-hizb / 8-point Khatam) ────────────────────────

/**
 * Hero rub-el-hizb medallion. Renders as a self-contained square SVG.
 * Wrap in an absolutely-positioned <View> to place it in the layout.
 */
export function HeroMedallion({
  size, opacity = 0.18,
}: { size: number; opacity?: number }) {
  const c = size / 2;
  const r = size * 0.42;
  // Two overlapping squares at 45° = 8-point Islamic star (Khatam Sulayman)
  const sq1 = `${c - r},${c} ${c},${c - r} ${c + r},${c} ${c},${c + r}`;
  const d   = r * Math.SQRT1_2;
  const sq2 = `${c - d},${c - d} ${c + d},${c - d} ${c + d},${c + d} ${c - d},${c + d}`;
  return (
    <Svg width={size} height={size} pointerEvents="none">
      <Circle cx={c} cy={c} r={r * 1.32} fill="none" stroke={GOLD} strokeWidth="0.4" opacity={opacity * 0.5} />
      <Circle cx={c} cy={c} r={r * 1.18} fill="none" stroke={GOLD} strokeWidth="0.7" opacity={opacity * 0.7} />
      <Polygon points={sq1} fill="none" stroke={GOLD} strokeWidth="1.1" opacity={opacity} />
      <Polygon points={sq2} fill="none" stroke={GOLD} strokeWidth="1.1" opacity={opacity} />
      <Circle cx={c} cy={c} r={r * 0.55} fill="none" stroke={GOLD} strokeWidth="0.5" opacity={opacity * 0.65} />
      <Circle cx={c} cy={c} r={r * 0.18} fill={GOLD} opacity={opacity * 1.5} />
    </Svg>
  );
}

// ─── Frame (double-line, classic mushaf border) ──────────────────────────

export function ShareFrame({
  w, h, inset = 12,
}: { w: number; h: number; inset?: number }) {
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect
        x={inset} y={inset}
        width={w - inset * 2} height={h - inset * 2}
        rx={14} fill="none"
        stroke={GOLD} strokeWidth="0.9" opacity="0.55"
      />
      <Rect
        x={inset + 5} y={inset + 5}
        width={w - (inset + 5) * 2} height={h - (inset + 5) * 2}
        rx={11} fill="none"
        stroke={GOLD} strokeWidth="0.4" opacity="0.32"
      />
    </Svg>
  );
}

// ─── Corner floret (small geometric flourish at each corner) ──────────────

export function CornerFloret({ size = 30 }: { size?: number }) {
  const s = size;
  // small 4-point inside two arcs — distinctly Islamic, not a generic L-bracket
  return (
    <Svg width={s} height={s}>
      <Path
        d={`M${s * 0.08},${s * 0.5} Q${s * 0.08},${s * 0.08} ${s * 0.5},${s * 0.08}`}
        stroke={GOLD} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85"
      />
      <Path
        d={`M${s * 0.18},${s * 0.5} Q${s * 0.18},${s * 0.18} ${s * 0.5},${s * 0.18}`}
        stroke={GOLD} strokeWidth="0.55" fill="none" strokeLinecap="round" opacity="0.45"
      />
      <Polygon
        points={`${s * 0.34},${s * 0.18} ${s * 0.42},${s * 0.26} ${s * 0.34},${s * 0.34} ${s * 0.26},${s * 0.26}`}
        fill={GOLD} opacity="0.85"
      />
      <Circle cx={s * 0.5} cy={s * 0.5} r={1.4} fill={GOLD} opacity="0.7" />
    </Svg>
  );
}

// ─── Ornamental divider with central diamond ─────────────────────────────

export function OrnamentalDivider({ width }: { width: number }) {
  const cx = width / 2;
  const y  = 10;
  const armEnd = Math.min(cx - 18, 90);
  return (
    <Svg width={width} height={20}>
      <Line x1={cx - armEnd} y1={y} x2={cx - 14} y2={y} stroke={GOLD} strokeWidth="0.9" opacity="0.7" />
      <Line x1={cx + 14}     y1={y} x2={cx + armEnd} y2={y} stroke={GOLD} strokeWidth="0.9" opacity="0.7" />
      {/* tiny tick marks for texture */}
      <Line x1={cx - armEnd - 5} y1={y - 3} x2={cx - armEnd - 5} y2={y + 3} stroke={GOLD} strokeWidth="0.7" opacity="0.5" />
      <Line x1={cx + armEnd + 5} y1={y - 3} x2={cx + armEnd + 5} y2={y + 3} stroke={GOLD} strokeWidth="0.7" opacity="0.5" />
      {/* central diamond inside a hairline ring */}
      <Circle cx={cx} cy={y} r={7} fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.55" />
      <Polygon points={`${cx},${y - 4} ${cx + 4},${y} ${cx},${y + 4} ${cx - 4},${y}`} fill={GOLD} opacity="0.95" />
    </Svg>
  );
}

// ─── Nuur brandmark (crescent + star inside ring + wordmark) ─────────────

export function NuurMark({ size = 30 }: { size?: number }) {
  // Crescent constructed as the difference of two arcs; small 5-point star tucked in
  const goldId = useSvgId("nm-gold");
  return (
    <Image
      source={NUUR_ICON}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
      }}
      resizeMode="cover"
      accessibilityLabel="Nuur"
    />
  );
}

export function NuurLockup({
  size = "sm",
  showTagline = true,
}: { size?: "sm" | "md" | "lg"; showTagline?: boolean }) {
  const cfg = {
    sm: { mark: 26, nun: 16, name: 9.5,  tag: 8.5,  gap: 4 },
    md: { mark: 32, nun: 20, name: 11,   tag: 9.5,  gap: 5 },
    lg: { mark: 40, nun: 26, name: 13,   tag: 10.5, gap: 6 },
  }[size];
  return (
    <View style={[brand.row, { gap: cfg.gap + 2 }]}>
      <NuurMark size={cfg.mark} />
      <View style={brand.text}>
        <Text style={[brand.nun, { fontSize: cfg.nun, lineHeight: cfg.nun * 1.05 }]}>نور</Text>
        <View style={brand.wordRow}>
          <Text style={[brand.name, { fontSize: cfg.name }]}>NUUR</Text>
          {showTagline && (
            <>
              <View style={brand.dot} />
              <Text style={[brand.tag, { fontSize: cfg.tag }]}>nuur.app</Text>
            </>
          )}
        </View>
        {showTagline && (
          <Text style={[brand.tagline, { fontSize: cfg.tag - 0.5 }]}>
            Light for your daily deen
          </Text>
        )}
      </View>
    </View>
  );
}

const brand = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  nun: {
    color: GOLD_LIGHT,
    fontFamily: "AmiriQuran_400Regular",
    letterSpacing: 0,
    marginBottom: -1,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    color: GOLD,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4.5,
  },
  dot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: GOLD,
    opacity: 0.55,
    marginHorizontal: 6,
  },
  tag: {
    color: CREAM_FAINT,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.2,
  },
  tagline: {
    color: CREAM_FAINT,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginTop: 1,
    letterSpacing: 0.3,
  },
});

// ─── Section label ("CHAPTER · 2:255" style) ──────────────────────────────

export function RefRow({ label, scale = 1 }: { label: string; scale?: number }) {
  return (
    <View style={ref.row}>
      <View style={ref.dot} />
      <View style={ref.bar} />
      <Text style={[ref.text, { fontSize: 9.5 * scale }]}>{label}</Text>
      <View style={ref.bar} />
      <View style={ref.dot} />
    </View>
  );
}

const ref = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: GOLD,
    opacity: 0.85,
  },
  bar: {
    width: 12, height: 1,
    backgroundColor: GOLD,
    opacity: 0.45,
  },
  text: {
    color: GOLD,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
  },
});

// ─── Bismillah (in Amiri, used at top of wallpaper) ──────────────────────

export function Bismillah({ scale = 1 }: { scale?: number }) {
  return (
    <Text style={[bism.text, { fontSize: 17 * scale, lineHeight: 28 * scale }]}>
      بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
    </Text>
  );
}

const bism = StyleSheet.create({
  text: {
    color: GOLD_LIGHT,
    fontFamily: "AmiriQuran_400Regular",
    textAlign: "center",
    opacity: 0.85,
    writingDirection: "rtl",
  },
});

// ─── Corner positioning helper ───────────────────────────────────────────

export const cornerPos = StyleSheet.create({
  base: { position: "absolute" },
  tl:   { top: 14, left: 14 },
  tr:   { top: 14, right: 14, transform: [{ scaleX: -1 }] },
  bl:   { bottom: 14, left: 14, transform: [{ scaleY: -1 }] },
  br:   { bottom: 14, right: 14, transform: [{ scale: -1 }] },
});
