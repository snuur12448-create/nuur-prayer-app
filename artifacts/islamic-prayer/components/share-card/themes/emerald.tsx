import React from "react";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Garden Emerald  (matches IMG_7898)
 *
 * Deep emerald gradient + a very faint eye-shape leaf scatter watermark
 * + ONE symmetric gold leaf pair drooping from a small centre stem at
 * the top of the card. No frame.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#163E2C",
  bgMid:    "#0F2C20",
  bgBottom: "#061811",
  accent:     "#C9A659",
  accentSoft: "#7B6230",
  text:       "rgba(247,239,221,0.97)",
  textMuted:  "rgba(247,239,221,0.60)",
  rule:       "rgba(201,166,89,0.32)",
};

/**
 * A single leaf — eye-shape drawn from origin (0,0). Length runs along +x.
 */
function leafPath(len: number, fat: number): string {
  const fy = fat;
  return (
    `M 0 0 ` +
    `C ${len * 0.30} ${-fy}, ${len * 0.70} ${-fy}, ${len} 0 ` +
    `C ${len * 0.70} ${fy}, ${len * 0.30} ${fy}, 0 0 Z`
  );
}

/** Stable pseudo-random in [0,1). */
function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function EmeraldBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const bgId   = `emerald_${width.toFixed(0)}_${height.toFixed(0)}`;
  const haloId = `emerald_h_${width.toFixed(0)}_${height.toFixed(0)}`;

  /* ── Faint eye-leaf scatter watermark (very low opacity) ────────────── */
  const COUNT = mode === "wallpaper" ? 26 : 14;
  const watermarks: React.ReactNode[] = [];
  for (let i = 0; i < COUNT; i++) {
    const cx  = rand(i + 1) * width;
    const cy  = rand(i + 7) * height;
    const len = (mode === "wallpaper" ? width * 0.16 : width * 0.20) * (0.7 + rand(i + 11) * 0.5);
    const rot = rand(i + 17) * 360;
    watermarks.push(
      <G
        key={`w_${i}`}
        transform={`translate(${cx},${cy}) rotate(${rot})`}
        opacity={0.06}
      >
        <Path d={leafPath(len, len * 0.30)} fill="none" stroke={p.accent} strokeWidth={0.7} />
      </G>,
    );
  }

  /* ── Top centre garland: a small stem with a pair of drooping leaves ─ */
  const garlandY = mode === "wallpaper" ? height * 0.06 : height * 0.05;
  const cx = width / 2;
  const leafLen = mode === "wallpaper" ? width * 0.20 : width * 0.24;
  const fat     = leafLen * 0.18;

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

      {/* Subtle warm halo behind Arabic */}
      <Circle
        cx={cx}
        cy={mode === "wallpaper" ? height * 0.62 : height * 0.42}
        r={width * 0.55}
        fill={`url(#${haloId})`}
      />

      {/* Watermark */}
      <G>{watermarks}</G>

      {/* Top garland: a thin vertical stem + small dot + two leaves drooping
       *  outwards & downwards from the stem base.                         */}
      <G>
        {/* central drop stem */}
        <Path
          d={`M ${cx} ${garlandY} L ${cx} ${garlandY + leafLen * 0.18}`}
          stroke={p.accent}
          strokeWidth={1.0}
          opacity={0.85}
        />
        {/* central node */}
        <Circle cx={cx} cy={garlandY + leafLen * 0.20} r={leafLen * 0.04} fill={p.accent} opacity={0.95} />

        {/* Right leaf — drooping outwards */}
        <G transform={`translate(${cx},${garlandY + leafLen * 0.20}) rotate(20)`}>
          <Path d={leafPath(leafLen, fat)} fill="none" stroke={p.accent} strokeWidth={1.0} opacity={0.8} />
          <Path d={`M 0 0 L ${leafLen * 0.92} 0`} stroke={p.accent} strokeWidth={0.6} opacity={0.55} />
        </G>
        {/* Left leaf */}
        <G transform={`translate(${cx},${garlandY + leafLen * 0.20}) rotate(160)`}>
          <Path d={leafPath(leafLen, fat)} fill="none" stroke={p.accent} strokeWidth={1.0} opacity={0.8} />
          <Path d={`M 0 0 L ${leafLen * 0.92} 0`} stroke={p.accent} strokeWidth={0.6} opacity={0.55} />
        </G>

        {/* Tiny end nodes */}
        <Circle
          cx={cx + Math.cos(20  * Math.PI / 180) * leafLen}
          cy={garlandY + leafLen * 0.20 + Math.sin(20 * Math.PI / 180) * leafLen}
          r={leafLen * 0.025}
          fill={p.accent}
        />
        <Circle
          cx={cx + Math.cos(160 * Math.PI / 180) * leafLen}
          cy={garlandY + leafLen * 0.20 + Math.sin(160 * Math.PI / 180) * leafLen}
          r={leafLen * 0.025}
          fill={p.accent}
        />
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
