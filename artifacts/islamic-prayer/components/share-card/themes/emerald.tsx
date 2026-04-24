import React from "react";
import Svg, {
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Garden Emerald
 * Deep emerald gradient with a stylised gold leaf garland that arcs
 * across the top. The garland is mirrored for symmetry. Pairs naturally
 * with Qur'an verses about creation, gardens, du'a of gratitude.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#143727",
  bgMid:    "#0E2A1E",
  bgBottom: "#061A11",
  accent:     "#C9A659",
  accentSoft: "#7B6230",
  text:       "rgba(247,239,221,0.97)",
  textMuted:  "rgba(247,239,221,0.62)",
  rule:       "rgba(201,166,89,0.28)",
};

/** A single stylised leaf, drawn from origin (0,0). */
function Leaf({ x, y, scale, rotate, fill }: { x: number; y: number; scale: number; rotate: number; fill: string }) {
  return (
    <G transform={`translate(${x},${y}) rotate(${rotate}) scale(${scale})`}>
      <Path
        d="M 0 0 C 12 -10, 28 -8, 36 0 C 28 8, 12 10, 0 0 Z"
        fill={fill}
        opacity={0.85}
      />
      {/* central vein */}
      <Path d="M 2 0 L 34 0" stroke={fill} strokeWidth={0.6} opacity={0.6} />
    </G>
  );
}

function EmeraldBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const id = `emerald_${width.toFixed(0)}_${height.toFixed(0)}`;
  // Garland sits just below the clock-block on wallpaper, near the top on card.
  const baseY = mode === "wallpaper" ? height * 0.36 : height * 0.10;
  const cx = width / 2;

  // Six leaves on each side, increasing rotation toward the centre.
  const leaves: React.ReactNode[] = [];
  const span = width * 0.42;
  const stepX = span / 6;
  const scale = Math.min(1.6, width / 700);
  for (let i = 0; i < 6; i++) {
    const offX = stepX * (i + 0.5);
    const yWobble = -Math.sin((i / 5) * Math.PI) * 18;
    const rotR = -10 + i * -12;
    const rotL = 190 + i * 12;
    leaves.push(
      <Leaf key={`lr_${i}`} x={cx + offX} y={baseY + yWobble} scale={scale * 0.9} rotate={rotR} fill={p.accent} />,
    );
    leaves.push(
      <Leaf key={`ll_${i}`} x={cx - offX} y={baseY + yWobble} scale={scale * 0.9} rotate={rotL} fill={p.accent} />,
    );
  }

  // Central rosette — small 6-petal flower at the apex of the garland.
  const rosette = Array.from({ length: 6 }).map((_, i) => {
    const a = (i / 6) * Math.PI * 2;
    const px = cx + Math.cos(a) * 9 * scale;
    const py = baseY - 18 + Math.sin(a) * 9 * scale;
    return (
      <Path
        key={`r_${i}`}
        d={`M ${cx} ${baseY - 18} Q ${px * 0.55 + cx * 0.45} ${py * 0.55 + (baseY - 18) * 0.45} ${px} ${py}`}
        stroke={p.accent}
        strokeWidth={1.3}
        fill="none"
        opacity={0.9}
      />
    );
  });

  // Bottom thin rule with two leaves
  const ruleY = height * (mode === "wallpaper" ? 0.94 : 0.92);

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

      {/* Top garland */}
      <G>
        {leaves}
        {rosette}
      </G>

      {/* Bottom rule + tiny leaves */}
      <G>
        <Rect x={width * 0.18} y={ruleY} width={width * 0.64} height={1} fill={p.accent} opacity={0.4} />
        <Leaf x={width * 0.18} y={ruleY + 1} scale={scale * 0.6} rotate={180} fill={p.accent} />
        <Leaf x={width * 0.82} y={ruleY + 1} scale={scale * 0.6} rotate={0}   fill={p.accent} />
      </G>
    </Svg>
  );
}

export const EmeraldTheme: ShareTheme = {
  id: "emerald",
  label: "Garden Emerald",
  blurb: "Deep green · gold leaves",
  palette,
  Background: EmeraldBackground,
};
