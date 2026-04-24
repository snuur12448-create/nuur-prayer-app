import React from "react";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Line,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Manuscript Cream
 * Warm cream / parchment background with dark-teal text. Faint compass
 * watermarks scattered behind the content; a small compass medallion in
 * the upper-right and a roman-numeral-style mark in the upper-left.
 * Suits classical Qur'an verses, day-time reflection.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: true,
  bgTop:    "#F2E8D2",
  bgMid:    "#EADFC4",
  bgBottom: "#DFD0AE",
  accent:     "#1F4438",   // dark teal — the "ink"
  accentSoft: "#7A2A1F",   // burgundy small accent
  text:       "#1B2E27",
  textMuted:  "rgba(31,68,56,0.55)",
  rule:       "rgba(31,68,56,0.30)",
};

function CompassMedallion({ cx, cy, r, color, opacity = 1 }: {
  cx: number; cy: number; r: number; color: string; opacity?: number;
}) {
  // Compass rose: outer ring + 8-point star.
  const tips = Array.from({ length: 8 }).map((_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(a) * r * 0.95;
    const y1 = cy + Math.sin(a) * r * 0.95;
    return <Line key={`t_${i}`} x1={cx} y1={cy} x2={x1} y2={y1} stroke={color} strokeWidth={i % 2 === 0 ? 1.1 : 0.6} opacity={opacity} />;
  });
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1.0} opacity={opacity} />
      <Circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke={color} strokeWidth={0.6} opacity={opacity * 0.7} />
      {tips}
      <Circle cx={cx} cy={cy} r={r * 0.10} fill={color} opacity={opacity} />
    </G>
  );
}

function ParchmentBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const id = `parch_${width.toFixed(0)}_${height.toFixed(0)}`;

  // Faint scattered compass watermarks.
  const watermarks: React.ReactNode[] = [];
  const positions: [number, number, number][] = mode === "wallpaper"
    ? [
        [width * 0.20, height * 0.60, width * 0.16],
        [width * 0.80, height * 0.78, width * 0.12],
        [width * 0.50, height * 0.92, width * 0.20],
      ]
    : [
        [width * 0.18, height * 0.78, width * 0.13],
        [width * 0.82, height * 0.82, width * 0.10],
        [width * 0.50, height * 0.95, width * 0.16],
      ];
  positions.forEach(([cx, cy, r], i) => {
    watermarks.push(
      <G key={`wm_${i}`} opacity={0.10}>
        <CompassMedallion cx={cx} cy={cy} r={r} color={p.accent} />
      </G>,
    );
  });

  // Inset frame
  const inset = Math.max(28, width * 0.045);

  // Top corner ornaments — burgundy roman-numeral block + teal compass
  const cornerY = inset + Math.max(20, width * 0.04);
  const numeralX = inset + Math.max(16, width * 0.035);
  const compassX = width - inset - Math.max(24, width * 0.05);

  // Wallpaper: drop these well below the clock-block, ~38% from top.
  const cornerOffsetY = mode === "wallpaper" ? height * 0.34 : 0;

  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <SvgLinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"  stopColor={p.bgTop} />
          <Stop offset="55%" stopColor={p.bgMid} />
          <Stop offset="100%" stopColor={p.bgBottom} />
        </SvgLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${id})`} />

      {/* Compass watermarks */}
      <G>{watermarks}</G>

      {/* Frame */}
      <Rect
        x={inset} y={inset}
        width={width - inset * 2} height={height - inset * 2}
        fill="none"
        stroke={p.accent}
        strokeWidth={1.1}
        opacity={0.55}
      />

      {/* Top-right compass medallion */}
      <CompassMedallion
        cx={compassX}
        cy={cornerY + cornerOffsetY}
        r={Math.max(18, width * 0.038)}
        color={p.accent}
        opacity={0.85}
      />

      {/* Top-left burgundy "ornamental notch" — a small filled square mark */}
      <G transform={`translate(${numeralX},${cornerY + cornerOffsetY - Math.max(18, width * 0.038)})`}>
        <Rect x={0} y={0} width={Math.max(16, width * 0.032)} height={3} fill={p.accentSoft} />
        <Rect x={0} y={Math.max(36, width * 0.075)} width={Math.max(16, width * 0.032)} height={3} fill={p.accentSoft} />
      </G>
    </Svg>
  );
}

export const ParchmentTheme: ShareTheme = {
  id: "parchment",
  label: "Manuscript Cream",
  blurb: "Parchment · teal ink",
  palette,
  Background: ParchmentBackground,
};
