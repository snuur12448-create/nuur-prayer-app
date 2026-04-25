import type { ShareContentKind, ShareTheme, ShareThemeId } from "./types";

import { MidnightTheme } from "./themes/midnight";
import { StarryTheme } from "./themes/starry";
import { EmeraldTheme } from "./themes/emerald";
import { RoseTheme } from "./themes/rose";
import { SepiaTheme } from "./themes/sepia";
import { ParchmentTheme } from "./themes/parchment";
import { Frame01Theme } from "./themes/frame01";
import { Frame02Theme } from "./themes/frame02";
import { Frame03Theme } from "./themes/frame03";
import { Frame04Theme } from "./themes/frame04";
import { Frame05Theme } from "./themes/frame05";
import { Frame06Theme } from "./themes/frame06";

/**
 * Display order for the *non-dua* kinds. These are the legacy themes
 * (gradient + SVG chrome). Keep this stable — auto-select assumes it.
 */
export const THEME_ORDER: ShareThemeId[] = [
  "midnight",
  "starry",
  "emerald",
  "rose",
  "sepia",
  "parchment",
];

/**
 * Display order for dua / adhkar — *exclusively* the new ornate frame
 * themes. The legacy themes are intentionally excluded for these kinds.
 */
export const DUA_FRAME_ORDER: ShareThemeId[] = [
  "frame01",
  "frame02",
  "frame03",
  "frame04",
  "frame05",
  "frame06",
];

export const THEMES: Record<ShareThemeId, ShareTheme> = {
  midnight:  MidnightTheme,
  starry:    StarryTheme,
  emerald:   EmeraldTheme,
  rose:      RoseTheme,
  sepia:     SepiaTheme,
  parchment: ParchmentTheme,
  frame01:   Frame01Theme,
  frame02:   Frame02Theme,
  frame03:   Frame03Theme,
  frame04:   Frame04Theme,
  frame05:   Frame05Theme,
  frame06:   Frame06Theme,
};

export const DEFAULT_THEME_ID: ShareThemeId = "midnight";

export function getTheme(id: ShareThemeId | string | null | undefined): ShareTheme {
  if (id && id in THEMES) return THEMES[id as ShareThemeId];
  return THEMES[DEFAULT_THEME_ID];
}

/**
 * Return the ordered list of themes available for the given content kind.
 *
 *  - `dua` and `adhkar`  → ornate painted frames only (DUA_FRAME_ORDER)
 *  - everything else     → legacy gradient themes (THEME_ORDER)
 *
 * The picker uses this to render the pager + dot row, and ShareCard uses it
 * via `getTheme()` for both kinds.
 */
export function getThemesForKind(kind: ShareContentKind): ShareThemeId[] {
  if (kind === "dua" || kind === "adhkar") return DUA_FRAME_ORDER;
  return THEME_ORDER;
}
