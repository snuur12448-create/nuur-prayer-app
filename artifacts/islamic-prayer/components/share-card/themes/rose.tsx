import React from "react";
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Dawn Glow
 * Wine / burgundy gradient with a soft peach radial sun-glow centred on
 * the Arabic line. Optimised for morning adhkar, fajr du'a, and any
 * dawn-time content.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#3F1A22",
  bgMid:    "#2B121C",
  bgBottom: "#1A080F",
  accent:     "#F2D7B5",
  accentSoft: "#C9933A",
  text:       "rgba(248,234,219,0.98)",
  textMuted:  "rgba(248,234,219,0.62)",
  rule:       "rgba(242,215,181,0.32)",
};

function RoseBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const bgId   = `rose_bg_${width.toFixed(0)}_${height.toFixed(0)}`;
  const glowId = `rose_glow_${width.toFixed(0)}_${height.toFixed(0)}`;
  const haloId = `rose_halo_${width.toFixed(0)}_${height.toFixed(0)}`;

  // Sun glow centre — sits behind the Arabic block (~upper third on card,
  // ~middle on wallpaper, just below the clock zone).
  const cx = width / 2;
  const cy = mode === "wallpaper" ? height * 0.50 : height * 0.36;
  const glowR = width * 0.65;

  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <SvgLinearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"  stopColor={p.bgTop} />
          <Stop offset="55%" stopColor={p.bgMid} />
          <Stop offset="100%" stopColor={p.bgBottom} />
        </SvgLinearGradient>
        <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={p.accent} stopOpacity={0.55} />
          <Stop offset="40%"  stopColor={p.accent} stopOpacity={0.25} />
          <Stop offset="100%" stopColor={p.accent} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={p.accentSoft} stopOpacity={0.40} />
          <Stop offset="100%" stopColor={p.accentSoft} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${bgId})`} />

      {/* Outer warm halo */}
      <Ellipse cx={cx} cy={cy} rx={glowR * 1.15} ry={glowR * 1.0} fill={`url(#${haloId})`} />
      {/* Inner cream-peach glow */}
      <Ellipse cx={cx} cy={cy} rx={glowR * 0.78} ry={glowR * 0.62} fill={`url(#${glowId})`} />

      {/* Faint horizon line beneath the glow — adds the "dawn" cue */}
      <G>
        <Rect
          x={width * 0.15}
          y={cy + glowR * 0.45}
          width={width * 0.70}
          height={1}
          fill={p.accent}
          opacity={0.30}
        />
      </G>
    </Svg>
  );
}

export const RoseTheme: ShareTheme = {
  id: "rose",
  label: "Dawn Glow",
  blurb: "Burgundy · soft sunlight",
  palette,
  Background: RoseBackground,
};
