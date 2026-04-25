import React from "react";
import { View } from "react-native";

import type { ShareThemePalette, ThemeBackgroundProps } from "../types";

/**
 * Frame themes have their own self-contained painted background (the panel
 * PNG), so the SVG Background slot becomes a no-op. We still need to satisfy
 * the `ShareTheme` contract though.
 */
export function FrameNoopBackground(_: ThemeBackgroundProps) {
  return <View />;
}

/**
 * A neutral palette that works for both ink-tone and cream-tone frames.
 * Frame themes don't actually draw the SVG chrome (eyebrow/divider/etc.
 * provided by ShareCard) because their layout is fully bespoke — but
 * `palette.accent` and `palette.text` are still consumed by a few
 * cross-cutting helpers, so we set sensible defaults here.
 */
export function makeFramePalette(opts: {
  ink: boolean;
  bgFill: string;
  accent?: string;
}): ShareThemePalette {
  const ink = opts.ink;
  const accent = opts.accent ?? (ink ? "#7A5A2E" : "#D4A24A");
  return {
    isLight: ink,
    bgTop: opts.bgFill,
    bgMid: opts.bgFill,
    bgBottom: opts.bgFill,
    accent,
    accentSoft: accent + "88",
    text: ink ? "#2A2018" : "#F4ECD8",
    textMuted: ink ? "rgba(42,32,24,0.72)" : "rgba(244,236,216,0.78)",
    rule: accent + "70",
  };
}
