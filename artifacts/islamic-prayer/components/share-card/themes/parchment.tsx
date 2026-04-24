import React from "react";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Manuscript Cream  (matches IMG_7903 card / IMG_7904 wallpaper)
 *
 * Warm cream / parchment background with very faint concentric circle
 * watermarks scattered behind the content, an "II." Roman numeral mark
 * in the upper-left corner, and a small compass-cross icon in the
 * upper-right. No frame.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: true,
  bgTop:    "#F4ECD8",
  bgMid:    "#EEE2C4",
  bgBottom: "#E2D2A7",
  accent:     "#9C7B3A",   // gold-brown ink
  accentSoft: "#7A5A24",
  text:       "#2A1F11",
  textMuted:  "rgba(42,31,17,0.55)",
  rule:       "rgba(156,123,58,0.40)",
};

/** A single faint concentric-circle ornament. */
function CircleStack({ cx, cy, r, color, opacity }: {
  cx: number; cy: number; r: number; color: string; opacity: number;
}) {
  return (
    <G opacity={opacity}>
      <Circle cx={cx} cy={cy} r={r}        fill="none" stroke={color} strokeWidth={0.8} />
      <Circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke={color} strokeWidth={0.7} />
      <Circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke={color} strokeWidth={0.6} />
    </G>
  );
}

/** Small compass-cross icon (used in upper-right corner). */
function CompassCross({ cx, cy, r, color, opacity = 1 }: {
  cx: number; cy: number; r: number; color: string; opacity?: number;
}) {
  return (
    <G opacity={opacity}>
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={0.9} />
      <Circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke={color} strokeWidth={0.6} />
      {/* main 4 cardinals */}
      <Line x1={cx} y1={cy - r * 1.05} x2={cx} y2={cy + r * 1.05} stroke={color} strokeWidth={0.9} />
      <Line x1={cx - r * 1.05} y1={cy} x2={cx + r * 1.05} y2={cy} stroke={color} strokeWidth={0.9} />
      {/* short intermediates */}
      <Line x1={cx - r * 0.7} y1={cy - r * 0.7} x2={cx + r * 0.7} y2={cy + r * 0.7} stroke={color} strokeWidth={0.5} opacity={0.7} />
      <Line x1={cx + r * 0.7} y1={cy - r * 0.7} x2={cx - r * 0.7} y2={cy + r * 0.7} stroke={color} strokeWidth={0.5} opacity={0.7} />
      <Circle cx={cx} cy={cy} r={r * 0.10} fill={color} />
    </G>
  );
}

function ParchmentBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const bgId   = `parch_${width.toFixed(0)}_${height.toFixed(0)}`;
  const haloId = `parch_h_${width.toFixed(0)}_${height.toFixed(0)}`;

  /* ── Concentric circle watermarks scattered behind the content ─────── */
  const positions: [number, number, number, number][] = mode === "wallpaper"
    ? [
        [width * 0.18, height * 0.50,  width * 0.22, 0.08],
        [width * 0.85, height * 0.62,  width * 0.16, 0.07],
        [width * 0.30, height * 0.82,  width * 0.20, 0.07],
        [width * 0.78, height * 0.90,  width * 0.15, 0.07],
      ]
    : [
        [width * 0.10, height * 0.55,  width * 0.20, 0.08],
        [width * 0.90, height * 0.45,  width * 0.16, 0.08],
        [width * 0.30, height * 0.92,  width * 0.18, 0.07],
        [width * 0.85, height * 0.85,  width * 0.14, 0.07],
      ];

  /* ── Top corner marks ───────────────────────────────────────────────── */
  // Card: corners sit ~5 % from the top. Wallpaper: corners are pushed
  // down so they hang just under the iOS-clock zone.
  const cornerInset = Math.max(28, width * 0.06);
  const cornerY     = mode === "wallpaper" ? height * 0.04 : cornerInset;

  // "II." mark dimensions — a small Roman two-numeral mark drawn as
  // two thin vertical bars + a square dot. Drawn as plain rects/lines
  // so it renders identically across iOS, Android, and web.
  const markH      = width * (mode === "wallpaper" ? 0.040 : 0.055);
  const barW       = markH * 0.10;
  const barGap     = markH * 0.12;
  const dotSize    = markH * 0.13;
  const dotGap     = markH * 0.10;
  const markBaselineY = cornerY + markH;
  const markX     = cornerInset;

  // Top serifs / feet for the bars — small horizontal hairlines for a
  // classical-Roman-numeral feel without depending on a system serif.
  const serifW     = barW * 4.5;

  const compassR  = width * (mode === "wallpaper" ? 0.022 : 0.026);
  const compassX  = width - cornerInset - compassR;
  const compassY  = cornerY + markH * 0.55;

  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <SvgLinearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"  stopColor={p.bgTop} />
          <Stop offset="55%" stopColor={p.bgMid} />
          <Stop offset="100%" stopColor={p.bgBottom} />
        </SvgLinearGradient>
        <RadialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"  stopColor="#FFFFFF" stopOpacity={0.30} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Cream base */}
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${bgId})`} />

      {/* Soft halo behind Arabic for a touch of depth */}
      <Circle
        cx={width / 2}
        cy={mode === "wallpaper" ? height * 0.62 : height * 0.42}
        r={width * 0.55}
        fill={`url(#${haloId})`}
      />

      {/* Watermarks */}
      <G>
        {positions.map(([cx, cy, r, op], i) => (
          <CircleStack key={`wm_${i}`} cx={cx} cy={cy} r={r} color={p.accent} opacity={op} />
        ))}
      </G>

      {/* Top-left "II." Roman numeral mark — vector primitives so it
       *   renders identically on every platform.                       */}
      <G opacity={0.88}>
        {/* First "I" with top + bottom serifs */}
        <Rect x={markX} y={cornerY} width={barW} height={markH} fill={p.accent} />
        <Rect x={markX - (serifW - barW) / 2} y={cornerY} width={serifW} height={barW * 0.85} fill={p.accent} />
        <Rect x={markX - (serifW - barW) / 2} y={markBaselineY - barW * 0.85} width={serifW} height={barW * 0.85} fill={p.accent} />
        {/* Second "I" with top + bottom serifs */}
        <Rect x={markX + barW + barGap} y={cornerY} width={barW} height={markH} fill={p.accent} />
        <Rect x={markX + barW + barGap - (serifW - barW) / 2} y={cornerY} width={serifW} height={barW * 0.85} fill={p.accent} />
        <Rect x={markX + barW + barGap - (serifW - barW) / 2} y={markBaselineY - barW * 0.85} width={serifW} height={barW * 0.85} fill={p.accent} />
        {/* Trailing dot */}
        <Rect
          x={markX + barW * 2 + barGap + serifW * 0.5 + dotGap}
          y={markBaselineY - dotSize}
          width={dotSize}
          height={dotSize}
          fill={p.accent}
        />
      </G>

      {/* Top-right small compass cross */}
      <CompassCross cx={compassX} cy={compassY} r={compassR} color={p.accent} opacity={0.8} />
    </Svg>
  );
}

export const ParchmentTheme: ShareTheme = {
  id: "parchment",
  label: "Manuscript Cream",
  blurb: "Parchment · gold-brown ink",
  palette,
  Background: ParchmentBackground,
};
