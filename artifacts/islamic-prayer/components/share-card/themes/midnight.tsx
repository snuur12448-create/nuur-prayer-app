import React from "react";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Midnight Compass  (matches IMG_7894 card / IMG_7895 wallpaper)
 *
 * Deep navy gradient + a very faint diamond watermark + ONE thin gold
 * hairline frame with tiny corner ticks + a small navy emblem badge at
 * top-centre containing a gold compass rose.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#10243F",
  bgMid:    "#0A1A30",
  bgBottom: "#040C18",
  accent:     "#C9933A",
  accentSoft: "#7A5A24",
  text:       "rgba(247,238,218,0.97)",
  textMuted:  "rgba(247,238,218,0.55)",
  rule:       "rgba(201,147,58,0.40)",
};

/** Compass rose — 8-point star inside a circle, used in the top emblem. */
function CompassRose({ cx, cy, r, color, opacity = 1 }: {
  cx: number; cy: number; r: number; color: string; opacity?: number;
}) {
  // 8-point star = two diamonds rotated 45°, large + small alternating.
  const big   = r * 0.95;
  const small = r * 0.32;
  const pts = Array.from({ length: 8 }).map((_, i) => {
    const a   = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const x   = cx + Math.cos(a) * big;
    const y   = cy + Math.sin(a) * big;
    const am  = a + Math.PI / 8;
    const xm  = cx + Math.cos(am) * small;
    const ym  = cy + Math.sin(am) * small;
    return { x, y, xm, ym };
  });
  let d = `M ${pts[0].x} ${pts[0].y} `;
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length];
    d += `L ${pts[i].xm} ${pts[i].ym} L ${next.x} ${next.y} `;
  }
  d += "Z";
  return (
    <G opacity={opacity}>
      <Circle cx={cx} cy={cy} r={r * 1.05} fill="none" stroke={color} strokeWidth={1.0} />
      <Path d={d} fill={color} />
      <Circle cx={cx} cy={cy} r={r * 0.18} fill={color === "#0A1A30" ? color : "#0A1A30"} />
    </G>
  );
}

function MidnightBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const id = `midnight_${width.toFixed(0)}_${height.toFixed(0)}`;

  /* ── Faint diamond watermark — very low opacity grid of small squares
   *    rotated 45°. One single subtle layer.                           */
  const cols = 5;
  const rows = Math.max(6, Math.round((height / width) * cols));
  const cellW = width / cols;
  const cellH = height / rows;
  const sq    = Math.min(cellW, cellH) * 0.18;

  const watermarks: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = cellW * (c + 0.5);
      const cy = cellH * (r + 0.5);
      watermarks.push(
        <G
          key={`w_${r}_${c}`}
          transform={`translate(${cx},${cy}) rotate(45)`}
          opacity={0.07}
        >
          <Rect x={-sq} y={-sq} width={sq * 2} height={sq * 2} fill="none" stroke={p.accent} strokeWidth={0.6} />
          <Circle cx={0} cy={0} r={sq * 0.18} fill={p.accent} />
        </G>,
      );
    }
  }

  /* ── Thin hairline frame + corner ticks ─────────────────────────────── */
  const inset = Math.max(28, width * 0.045);

  /* ── Top compass emblem ─────────────────────────────────────────────── */
  // On the card it sits just above the eyebrow. On the wallpaper it sits
  // at the very top (above the iOS clock zone).
  const emblemH = mode === "wallpaper" ? width * 0.075 : width * 0.08;
  const emblemW = emblemH * 1.55;
  const emblemY = mode === "wallpaper" ? height * 0.04  : inset + width * 0.005;
  const emblemX = (width - emblemW) / 2;

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

      {/* Diamond watermark grid */}
      <G>{watermarks}</G>

      {/* Single thin hairline frame */}
      <Rect
        x={inset}
        y={inset}
        width={width - inset * 2}
        height={height - inset * 2}
        fill="none"
        stroke={p.accent}
        strokeWidth={0.9}
        opacity={0.55}
      />

      {/* Tiny corner ticks (small + crosses) */}
      {[
        [inset, inset],
        [width - inset, inset],
        [inset, height - inset],
        [width - inset, height - inset],
      ].map(([x, y], i) => (
        <G key={`c_${i}`} opacity={0.7}>
          <Line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke={p.accent} strokeWidth={1.0} />
          <Line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke={p.accent} strokeWidth={1.0} />
        </G>
      ))}

      {/* Top emblem — a darker navy badge with gold compass rose */}
      <G>
        <Rect
          x={emblemX}
          y={emblemY}
          width={emblemW}
          height={emblemH}
          fill="#06121F"
          stroke={p.accent}
          strokeWidth={0.6}
          opacity={0.95}
          rx={1}
        />
        <CompassRose
          cx={emblemX + emblemW / 2}
          cy={emblemY + emblemH / 2}
          r={emblemH * 0.34}
          color={p.accent}
        />
      </G>
    </Svg>
  );
}

export const MidnightTheme: ShareTheme = {
  id: "midnight",
  label: "Midnight Compass",
  blurb: "Navy · gold compass",
  palette,
  Background: MidnightBackground,
};
