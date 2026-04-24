import React from "react";
import Svg, {
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Dawn Glow  (matches IMG_7899 wallpaper / IMG_7900 card)
 *
 * Deep wine / burgundy gradient with a single LARGE soft cream-to-peach
 * radial sun-glow centred behind the Arabic. No frame, no extra
 * ornament — the glow IS the ornament.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#3A0F1B",
  bgMid:    "#270A14",
  bgBottom: "#15050A",
  accent:     "#F4DEC5",
  accentSoft: "#C9933A",
  text:       "rgba(252,242,228,0.98)",
  textMuted:  "rgba(252,242,228,0.62)",
  rule:       "rgba(244,222,197,0.34)",
};

function RoseBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const bgId      = `rose_bg_${width.toFixed(0)}_${height.toFixed(0)}`;
  const sunId     = `rose_sun_${width.toFixed(0)}_${height.toFixed(0)}`;
  const haloId    = `rose_halo_${width.toFixed(0)}_${height.toFixed(0)}`;
  const bottomId  = `rose_bot_${width.toFixed(0)}_${height.toFixed(0)}`;

  // Sun centre — sits behind the Arabic block.
  // Card: ~38 % from top.   Wallpaper: ~22 % from top (under the clock zone).
  const cx = width / 2;
  const sunCy = mode === "wallpaper" ? height * 0.22 : height * 0.38;

  // Sun radius
  const sunR  = width * (mode === "wallpaper" ? 0.35 : 0.45);
  const haloR = sunR * 2.5;

  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <SvgLinearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"  stopColor={p.bgTop} />
          <Stop offset="55%" stopColor={p.bgMid} />
          <Stop offset="100%" stopColor={p.bgBottom} />
        </SvgLinearGradient>
        <RadialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={p.accent} stopOpacity={0.40} />
          <Stop offset="35%"  stopColor={p.accent} stopOpacity={0.22} />
          <Stop offset="65%"  stopColor={p.accent} stopOpacity={0.10} />
          <Stop offset="100%" stopColor={p.accent} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={sunId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#FFFAEC" stopOpacity={0.95} />
          <Stop offset="20%"  stopColor="#FBEBC9" stopOpacity={0.70} />
          <Stop offset="55%"  stopColor={p.accent} stopOpacity={0.35} />
          <Stop offset="100%" stopColor={p.accent} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={bottomId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#7A2A3E" stopOpacity={0.45} />
          <Stop offset="100%" stopColor="#7A2A3E" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Base burgundy gradient */}
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${bgId})`} />

      {/* Outer warm halo (the dawn glow) */}
      <Ellipse cx={cx} cy={sunCy} rx={haloR} ry={haloR * 0.95} fill={`url(#${haloId})`} />

      {/* Inner cream-peach sun disc */}
      <Ellipse cx={cx} cy={sunCy} rx={sunR} ry={sunR} fill={`url(#${sunId})`} />

      {/* Soft burgundy bloom near the bottom — gives the references' lift */}
      {mode === "wallpaper" ? (
        <Ellipse
          cx={cx}
          cy={height * 0.86}
          rx={width * 0.55}
          ry={width * 0.55}
          fill={`url(#${bottomId})`}
        />
      ) : null}
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
