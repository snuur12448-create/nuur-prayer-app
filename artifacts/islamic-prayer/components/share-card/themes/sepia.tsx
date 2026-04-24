import React from "react";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import type { ShareTheme, ThemeBackgroundProps } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * Mihrab Sepia
 * Brown / sepia gradient with a large faint mihrab arch outline behind
 * the content, plus a tiny geometric pattern fill at its apex. Suits
 * scholarly hadith, classical du'a.
 * ──────────────────────────────────────────────────────────────────────── */

const palette = {
  isLight: false,
  bgTop:    "#43301E",
  bgMid:    "#2E2014",
  bgBottom: "#1A100A",
  accent:     "#D4A24A",
  accentSoft: "#7A5224",
  text:       "rgba(248,232,205,0.97)",
  textMuted:  "rgba(248,232,205,0.62)",
  rule:       "rgba(212,162,74,0.28)",
};

function SepiaBackground({ width, height, mode, palette: p }: ThemeBackgroundProps) {
  const id = `sepia_${width.toFixed(0)}_${height.toFixed(0)}`;

  // Mihrab arch — a tall pointed arch that fills most of the card.
  const archMargin = width * 0.14;
  const archX = archMargin;
  const archW = width - archMargin * 2;
  const archTopY = mode === "wallpaper" ? height * 0.36 : height * 0.10;
  const archBottomY = height * (mode === "wallpaper" ? 0.95 : 0.92);
  const archApexY = archTopY - archW * 0.18; // pointed apex above the arch top
  const archMidX = width / 2;

  const archPath =
    `M ${archX} ${archBottomY}` +
    ` L ${archX} ${archTopY}` +
    ` Q ${archX} ${archTopY - archW * 0.32} ${archMidX} ${archApexY}` +
    ` Q ${archX + archW} ${archTopY - archW * 0.32} ${archX + archW} ${archTopY}` +
    ` L ${archX + archW} ${archBottomY}`;

  // Small 8-point star pattern inside the arch apex.
  const apexY = archApexY + 30;
  const stars: React.ReactNode[] = [];
  const STAR_R = Math.min(width, height) * 0.025;
  const positions = [
    [0, 0], [-1, 1], [1, 1], [-2, 2], [0, 2], [2, 2],
  ];
  for (const [dx, dy] of positions) {
    const cx = archMidX + dx * STAR_R * 2.6;
    const cy = apexY + dy * STAR_R * 2.6;
    stars.push(
      <G key={`p_${dx}_${dy}`}>
        <Circle cx={cx} cy={cy} r={STAR_R * 0.4} fill={p.accent} opacity={0.20} />
        <Circle cx={cx} cy={cy} r={STAR_R} fill="none" stroke={p.accent} strokeWidth={0.6} opacity={0.30} />
      </G>,
    );
  }

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

      {/* The arch outline */}
      <Path d={archPath} fill="none" stroke={p.accent} strokeWidth={1.4} opacity={0.55} />
      {/* Inner hairline arch for depth */}
      <Path
        d={archPath}
        fill="none"
        stroke={p.accent}
        strokeWidth={0.6}
        opacity={0.30}
        transform={`translate(${0},${0})`}
      />

      {/* Pattern at apex */}
      <G>{stars}</G>

      {/* Bottom rule */}
      <G>
        <Rect
          x={width * 0.20}
          y={height * (mode === "wallpaper" ? 0.96 : 0.94)}
          width={width * 0.60}
          height={1}
          fill={p.accent}
          opacity={0.4}
        />
      </G>
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
