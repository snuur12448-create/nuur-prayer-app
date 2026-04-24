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
 * Starry Sky  (matches IMG_7896 card / IMG_7897 wallpaper)
 *
 * Indigo gradient with a sparse star scatter, two or three thin
 * constellation hints, and ONE prominent gold crescent moon in the
 * upper-right quadrant. No frame.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#1F2467",
  bgMid:    "#171B4D",
  bgBottom: "#0A0C28",
  accent:     "#E0BE7A",
  accentSoft: "#7A5E2E",
  text:       "rgba(245,240,225,0.97)",
  textMuted:  "rgba(245,240,225,0.62)",
  rule:       "rgba(224,190,122,0.32)",
};

/** Stable pseudo-random in [0,1) — keeps stars in the same place each render. */
function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Crescent moon — outer disc + inner disc (cut-out in bg colour). */
function CrescentMoon({ cx, cy, r, fill, cutoutFill }: {
  cx: number; cy: number; r: number; fill: string; cutoutFill: string;
}) {
  return (
    <G>
      {/* Soft halo around the moon */}
      <Circle cx={cx} cy={cy} r={r * 1.45} fill={fill} opacity={0.06} />
      <Circle cx={cx} cy={cy} r={r * 1.20} fill={fill} opacity={0.10} />
      {/* Disc */}
      <Circle cx={cx} cy={cy} r={r} fill={fill} opacity={0.95} />
      {/* Cut-out giving the crescent shape */}
      <Circle cx={cx + r * 0.42} cy={cy - r * 0.10} r={r * 0.92} fill={cutoutFill} />
    </G>
  );
}

/** A small 4-point sparkle star. */
function Sparkle({ cx, cy, r, color, opacity }: {
  cx: number; cy: number; r: number; color: string; opacity: number;
}) {
  const long = r * 1.6;
  return (
    <Path
      d={`M ${cx} ${cy - long} L ${cx + r * 0.4} ${cy - r * 0.4}
          L ${cx + long} ${cy} L ${cx + r * 0.4} ${cy + r * 0.4}
          L ${cx} ${cy + long} L ${cx - r * 0.4} ${cy + r * 0.4}
          L ${cx - long} ${cy} L ${cx - r * 0.4} ${cy - r * 0.4} Z`}
      fill={color}
      opacity={opacity}
    />
  );
}

function StarryBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const bgId   = `starry_${width.toFixed(0)}_${height.toFixed(0)}`;
  const haloId = `starry_h_${width.toFixed(0)}_${height.toFixed(0)}`;

  /* ── Sparse star scatter ─────────────────────────────────────────────── */
  const STAR_COUNT = mode === "wallpaper" ? 60 : 38;
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const cx = rand(i + 1) * width;
    const cy = rand(i + 7) * height * 0.97;
    const r  = 0.5 + rand(i + 13) * 1.2;
    const op = 0.30 + rand(i + 19) * 0.55;
    stars.push(<Circle key={`st_${i}`} cx={cx} cy={cy} r={r} fill={p.accent} opacity={op} />);
  }

  /* A few bigger 4-point sparkles for visual interest */
  const sparkles: { x: number; y: number; r: number; o: number }[] = mode === "wallpaper"
    ? [
        { x: width * 0.13, y: height * 0.045, r: 4, o: 0.8 },
        { x: width * 0.28, y: height * 0.30,  r: 3, o: 0.7 },
        { x: width * 0.85, y: height * 0.55,  r: 3, o: 0.7 },
        { x: width * 0.12, y: height * 0.80,  r: 4, o: 0.75 },
        { x: width * 0.78, y: height * 0.92,  r: 3, o: 0.7 },
      ]
    : [
        { x: width * 0.15, y: height * 0.08, r: 4, o: 0.85 },
        { x: width * 0.85, y: height * 0.45, r: 3, o: 0.7 },
        { x: width * 0.18, y: height * 0.78, r: 4, o: 0.8 },
        { x: width * 0.82, y: height * 0.85, r: 3, o: 0.7 },
      ];

  /* ── 2-3 thin constellation hints (dot-line-dot patterns) ───────────── */
  const constellations = mode === "wallpaper"
    ? [
        // upper-left
        [[0.05, 0.05], [0.18, 0.07], [0.30, 0.05], [0.42, 0.08]] as const,
        // mid-right
        [[0.65, 0.50], [0.78, 0.52], [0.90, 0.48]] as const,
        // lower-left
        [[0.05, 0.78], [0.18, 0.80], [0.32, 0.79], [0.45, 0.82]] as const,
        // lower-right
        [[0.62, 0.93], [0.80, 0.93], [0.93, 0.90]] as const,
      ]
    : [
        [[0.05, 0.06], [0.20, 0.10], [0.32, 0.07]] as const,
        [[0.05, 0.78], [0.18, 0.82], [0.30, 0.79], [0.42, 0.83]] as const,
        [[0.66, 0.92], [0.82, 0.92], [0.94, 0.88]] as const,
      ];

  /* ── Crescent moon — large in upper-right (card) or upper-right just
   *    below the clock band (wallpaper).                                */
  const moonR  = mode === "wallpaper" ? width * 0.085 : width * 0.115;
  const moonCx = width - moonR - width * 0.10;
  const moonCy = mode === "wallpaper" ? height * 0.07 : height * 0.13;

  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <SvgLinearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={p.bgTop} />
          <Stop offset="55%"  stopColor={p.bgMid} />
          <Stop offset="100%" stopColor={p.bgBottom} />
        </SvgLinearGradient>
        <RadialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={p.accent} stopOpacity={0.18} />
          <Stop offset="60%"  stopColor={p.accent} stopOpacity={0.05} />
          <Stop offset="100%" stopColor={p.accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Base gradient */}
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${bgId})`} />

      {/* Soft halo behind the Arabic content area */}
      <G>
        <Circle
          cx={width / 2}
          cy={mode === "wallpaper" ? height * 0.62 : height * 0.40}
          r={width * 0.55}
          fill={`url(#${haloId})`}
        />
      </G>

      {/* Star scatter */}
      <G>{stars}</G>

      {/* Sparkles */}
      <G>
        {sparkles.map((s, i) => (
          <Sparkle key={`sp_${i}`} cx={s.x} cy={s.y} r={s.r} color={p.accent} opacity={s.o} />
        ))}
      </G>

      {/* Constellation hints */}
      <G>
        {constellations.map((line, ci) => (
          <G key={`con_${ci}`} opacity={0.42}>
            {line.map((pt, i) => {
              if (i === 0) return null;
              const prev = line[i - 1];
              return (
                <Line
                  key={`l_${ci}_${i}`}
                  x1={prev[0] * width} y1={prev[1] * height}
                  x2={pt[0]   * width} y2={pt[1]   * height}
                  stroke={p.accent}
                  strokeWidth={0.55}
                  opacity={0.55}
                />
              );
            })}
            {line.map((pt, i) => (
              <Circle
                key={`d_${ci}_${i}`}
                cx={pt[0] * width} cy={pt[1] * height}
                r={1.6}
                fill={p.accent}
                opacity={0.85}
              />
            ))}
          </G>
        ))}
      </G>

      {/* Crescent moon — primary ornament */}
      <CrescentMoon cx={moonCx} cy={moonCy} r={moonR} fill={p.accent} cutoutFill={p.bgMid} />
    </Svg>
  );
}

export const StarryTheme: ShareTheme = {
  id: "starry",
  label: "Starry Sky",
  blurb: "Indigo · crescent moon",
  palette,
  Background: StarryBackground,
};
