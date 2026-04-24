import type { ShareTheme, ShareThemeId } from "./types";

import { MidnightTheme } from "./themes/midnight";
import { StarryTheme } from "./themes/starry";
import { EmeraldTheme } from "./themes/emerald";
import { RoseTheme } from "./themes/rose";
import { SepiaTheme } from "./themes/sepia";
import { ParchmentTheme } from "./themes/parchment";

/** Display order in the picker. Keep this stable — auto-select assumes it. */
export const THEME_ORDER: ShareThemeId[] = [
  "midnight",
  "starry",
  "emerald",
  "rose",
  "sepia",
  "parchment",
];

export const THEMES: Record<ShareThemeId, ShareTheme> = {
  midnight: MidnightTheme,
  starry: StarryTheme,
  emerald: EmeraldTheme,
  rose: RoseTheme,
  sepia: SepiaTheme,
  parchment: ParchmentTheme,
};

export const DEFAULT_THEME_ID: ShareThemeId = "midnight";

export function getTheme(id: ShareThemeId | string | null | undefined): ShareTheme {
  if (id && id in THEMES) return THEMES[id as ShareThemeId];
  return THEMES[DEFAULT_THEME_ID];
}
