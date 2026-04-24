import React from "react";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Mihrab Sepia  (matches IMG_7901 card / IMG_7902 wallpaper)
 *
 * Walnut / sepia gradient with a faint compass-cross watermark scatter
 * and ONE thin gold pointed-arch outline (the mihrab) framing the
 * content. A small diamond sits at the apex of the arch.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#4A311E",
  bgMid:    "#33210F",
  bgBottom: "#1B0F08",
  accent:     "#D4A24A",
  accentSoft: "#7A5224",
  text:       "rgba(248,232,205,0.97)",
  textMuted:  "rgba(248,232,205,0.60)",
  rule:       "rgba(212,162,74,0.32)",
};

function SepiaBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const bgId   = `sepia_${width.toFixed(0)}_${height.toFixed(0)}`;
  const haloId = `sepia_h_${width.toFixed(0)}_${height.toFixed(0)}`;

  /* ── Faint compass-cross watermark ──────────────────────────────────── */
  const cols = 5;
  const rows = Math.max(7, Math.round((height / width) * cols));
  const cellW = width / cols;
  const cellH = height / rows;
  const r = Math.min(cellW, cellH) * 0.18;

  const watermarks: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = cellW * (col + 0.5);
      const cy = cellH * (row + 0.5);
      watermarks.push(
        <G key={`w_${row}_${col}`} opacity={0.06}>
          <Circle cx={cx} cy={cy} r={r} fill="none" stroke={p.accent} strokeWidth={0.6} />
          <Line x1={cx - r * 1.3} y1={cy} x2={cx + r * 1.3} y2={cy} stroke={p.accent} strokeWidth={0.6} />
          <Line x1={cx} y1={cy - r * 1.3} x2={cx} y2={cy + r * 1.3} stroke={p.accent} strokeWidth={0.6} />
        </G>,
      );
    }
  }

  /* ── Mihrab arch outline ────────────────────────────────────────────── */
  // Arch covers 80 % of the width and stretches from a top apex down to
  // near the bottom edge.
  const archMargin   = width * 0.10;
  const archX        = archMargin;
  const archW        = width - archMargin * 2;
  const archMidX     = width / 2;
  const archBottomY  = height * (mode === "wallpaper" ? 0.97 : 0.96);
  const archShoulder = mode === "wallpaper" ? height * 0.10 : height * 0.18;
  const archApexY    = mode === "wallpaper" ? height * 0.04 : height * 0.06;

  // SVG path: vertical sides → quadratic Bezier converging to apex.
  const archPath =
    `M ${archX} ${archBottomY}` +
    ` L ${archX} ${archShoulder}` +
    ` Q ${archX} ${archApexY + (archShoulder - archApexY) * 0.30} ${archMidX} ${archApexY}` +
    ` Q ${archX + archW} ${archApexY + (archShoulder - archApexY) * 0.30} ${archX + archW} ${archShoulder}` +
    ` L ${archX + archW} ${archBottomY}`;

  // Apex ornament — a small diamond resting on the arch tip.
  const apexD = width * 0.018;

  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <SvgLinearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"  stopColor={p.bgTop} />
          <Stop offset="55%" stopColor={p.bgMid} />
          <Stop offset="100%" stopColor={p.bgBottom} />
        </SvgLinearGradient>
        <RadialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"  stopColor={p.accent} stopOpacity={0.10} />
          <Stop offset="100%" stopColor={p.accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={height} fill={`url(#${bgId})`} />

      {/* Soft warm halo behind Arabic */}
      <Circle
        cx={archMidX}
        cy={mode === "wallpaper" ? height * 0.62 : height * 0.42}
        r={width * 0.50}
        fill={`url(#${haloId})`}
      />

      {/* Watermark */}
      <G>{watermarks}</G>

      {/* The arch outline — single thin stroke + a slightly inset hairline
       *   for a quiet "double frame" look that matches the reference.    */}
      <Path d={archPath} fill="none" stroke={p.accent} strokeWidth={1.1} opacity={0.75} />
      <Path
        d={
          `M ${archX + 6} ${archBottomY}` +
          ` L ${archX + 6} ${archShoulder + 4}` +
          ` Q ${archX + 6} ${archApexY + (archShoulder - archApexY) * 0.30 + 6} ${archMidX} ${archApexY + 8}` +
          ` Q ${archX + archW - 6} ${archApexY + (archShoulder - archApexY) * 0.30 + 6} ${archX + archW - 6} ${archShoulder + 4}` +
          ` L ${archX + archW - 6} ${archBottomY}`
        }
        fill="none"
        stroke={p.accent}
        strokeWidth={0.5}
        opacity={0.40}
      />

      {/* Apex diamond ornament */}
      <Path
        d={`M ${archMidX} ${archApexY - apexD * 1.2}
            L ${archMidX + apexD} ${archApexY - apexD * 0.2}
            L ${archMidX} ${archApexY + apexD * 0.8}
            L ${archMidX - apexD} ${archApexY - apexD * 0.2} Z`}
        fill={p.accent}
        opacity={0.95}
      />
      {/* tiny crowning flourish lines either side of the apex */}
      <Line
        x1={archMidX - apexD * 3.2} y1={archApexY - apexD * 0.4}
        x2={archMidX - apexD * 1.5} y2={archApexY - apexD * 0.4}
        stroke={p.accent} strokeWidth={0.7} opacity={0.6}
      />
      <Line
        x1={archMidX + apexD * 1.5} y1={archApexY - apexD * 0.4}
        x2={archMidX + apexD * 3.2} y2={archApexY - apexD * 0.4}
        stroke={p.accent} strokeWidth={0.7} opacity={0.6}
      />
    </Svg>
  );
}

export const SepiaTheme: ShareTheme = {
  id: "sepia",
  label: "Mihrab Sepia",
  blurb: "Walnut · arched niche",
  palette,
  Background: SepiaBackground,
};
