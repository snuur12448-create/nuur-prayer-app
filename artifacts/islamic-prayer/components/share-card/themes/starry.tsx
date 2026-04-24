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
 * Starry Sky
 * Deep indigo gradient with a scatter of stars, a few faint constellation
 * lines, and a gold crescent moon in the upper-right region. Suits Qur'an
 * verses read at night, Isha-time du'a, evening adhkar.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#1A1F4A",
  bgMid:    "#0F1335",
  bgBottom: "#070920",
  accent:     "#E0BE7A",
  accentSoft: "#7A5E2E",
  text:       "rgba(245,240,225,0.97)",
  textMuted:  "rgba(245,240,225,0.62)",
  rule:       "rgba(224,190,122,0.28)",
};

/** Stable pseudo-random in [0,1) — keeps stars in the same place each render. */
function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function StarryBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const id = `starry_${width.toFixed(0)}_${height.toFixed(0)}`;
  const STAR_COUNT = 65;

  const stars: React.ReactNode[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const cx = rand(i + 1) * width;
    const cy = rand(i + 7) * height * 0.95;
    const r  = 0.6 + rand(i + 13) * 1.6;
    const op = 0.35 + rand(i + 19) * 0.55;
    stars.push(<Circle key={`st_${i}`} cx={cx} cy={cy} r={r} fill={p.accent} opacity={op} />);
  }

  // A soft constellation in the lower-left (5 dots + connecting lines).
  const cx0 = width * 0.18;
  const cy0 = height * (mode === "wallpaper" ? 0.78 : 0.68);
  const cs = [
    [cx0,             cy0],
    [cx0 + width * 0.06, cy0 - 20],
    [cx0 + width * 0.13, cy0 + 8],
    [cx0 + width * 0.18, cy0 - 28],
    [cx0 + width * 0.22, cy0 + 14],
  ] as const;

  // Crescent moon — upper-right (or just under clock-block on wallpaper).
  const moonR  = width * 0.075;
  const moonCx = width - moonR - width * 0.13;
  const moonCy = mode === "wallpaper" ? height * 0.31 : height * 0.10;

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

      {/* Stars */}
      <G>{stars}</G>

      {/* Constellation lines */}
      <G>
        {cs.map((pt, i) => {
          if (i === 0) return null;
          const prev = cs[i - 1];
          return (
            <Line
              key={`cl_${i}`}
              x1={prev[0]} y1={prev[1]} x2={pt[0]} y2={pt[1]}
              stroke={p.accent} strokeWidth={0.7} opacity={0.32}
            />
          );
        })}
        {cs.map((pt, i) => (
          <Circle key={`cd_${i}`} cx={pt[0]} cy={pt[1]} r={2.2} fill={p.accent} opacity={0.85} />
        ))}
      </G>

      {/* Crescent moon — composed of two overlapping circles */}
      <G>
        <Circle cx={moonCx} cy={moonCy} r={moonR} fill={p.accent} opacity={0.95} />
        <Circle cx={moonCx + moonR * 0.42} cy={moonCy - moonR * 0.10} r={moonR * 0.92} fill={p.bgMid} />
        {/* Small star next to the moon */}
        <Path
          d={`M ${moonCx + moonR * 1.3} ${moonCy + moonR * 0.4}
              l 4 0 l 0 -4 l 1 0 l 0 4 l 4 0 l 0 1 l -4 0 l 0 4 l -1 0 l 0 -4 l -4 0 z`}
          fill={p.accent}
          opacity={0.85}
        />
      </G>
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
