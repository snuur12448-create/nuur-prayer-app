import React from "react";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  G,
  Line,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Midnight Compass
 * Deep navy + warm gold. Faint 8-point star tessellation watermark, a
 * thin gold double-line frame, and small compass-rose corners. Pairs
 * with hadith / scholarly content.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#102239",
  bgMid:    "#0B1A2D",
  bgBottom: "#06101D",
  accent:     "#C9933A",
  accentSoft: "#7A5A24",
  text:       "rgba(247,238,218,0.97)",
  textMuted:  "rgba(247,238,218,0.62)",
  rule:       "rgba(201,147,58,0.30)",
};

function MidnightBackground({ width, height, palette: p }: ThemeBackgroundProps) {
  const id = `midnight_${width.toFixed(0)}_${height.toFixed(0)}`;
  // Watermark grid: gentle 8-point stars repeated in a 4-col grid.
  const cols = 4;
  const rows = Math.max(5, Math.round((height / width) * cols));
  const cellW = width / cols;
  const cellH = height / rows;
  const starR = Math.min(cellW, cellH) * 0.18;

  const star = (cx: number, cy: number, r: number) => {
    // 8-point star = two squares rotated 45°, drawn as a single path.
    const s = r;
    const c = r * 0.4142; // tan(22.5°)
    return (
      <Path
        d={`M ${cx} ${cy - s}
            L ${cx + c} ${cy - c}
            L ${cx + s} ${cy}
            L ${cx + c} ${cy + c}
            L ${cx} ${cy + s}
            L ${cx - c} ${cy + c}
            L ${cx - s} ${cy}
            L ${cx - c} ${cy - c} Z`}
        fill="none"
        stroke={p.accent}
        strokeWidth={0.7}
        opacity={0.18}
      />
    );
  };

  const stars: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = cellW * (c + 0.5);
      const cy = cellH * (r + 0.5);
      stars.push(<G key={`s_${r}_${c}`}>{star(cx, cy, starR)}</G>);
    }
  }

  // Frame inset (proportional padding so it works for both card + wallpaper).
  const inset = Math.max(28, width * 0.045);

  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <SvgLinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={p.bgTop} />
          <Stop offset="55%" stopColor={p.bgMid} />
          <Stop offset="100%" stopColor={p.bgBottom} />
        </SvgLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${id})`} />
      <G>{stars}</G>
      {/* Outer thin frame */}
      <Rect
        x={inset}
        y={inset}
        width={width - inset * 2}
        height={height - inset * 2}
        fill="none"
        stroke={p.accent}
        strokeWidth={1.4}
        opacity={0.9}
      />
      {/* Inner hairline frame */}
      <Rect
        x={inset + 8}
        y={inset + 8}
        width={width - (inset + 8) * 2}
        height={height - (inset + 8) * 2}
        fill="none"
        stroke={p.accent}
        strokeWidth={0.6}
        opacity={0.55}
      />
      {/* Tiny corner crosses */}
      {[
        [inset, inset],
        [width - inset, inset],
        [inset, height - inset],
        [width - inset, height - inset],
      ].map(([x, y], i) => (
        <G key={`c_${i}`}>
          <Line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke={p.accent} strokeWidth={1.2} />
          <Line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke={p.accent} strokeWidth={1.2} />
        </G>
      ))}
    </Svg>
  );
}

export const MidnightTheme: ShareTheme = {
  id: "midnight",
  label: "Midnight Compass",
  blurb: "Navy · gold filigree",
  palette,
  Background: MidnightBackground,
};
