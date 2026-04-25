import type React from "react";
import type { ImageSourcePropType } from "react-native";

/* Public types shared across the share-card module. */

export type ShareCardMode = "card" | "wallpaper";

export type ShareThemeId =
  | "midnight"
  | "starry"
  | "emerald"
  | "rose"
  | "sepia"
  | "parchment"
  /** New ornate "frame" themes — exclusive to dua / adhkar share cards. */
  | "frame01"
  | "frame02"
  | "frame03"
  | "frame04"
  | "frame05"
  | "frame06";

/** Content category — drives auto-selection and a small label hint. */
export type ShareContentKind = "quran" | "hadith" | "dua" | "name" | "adhkar";

/** Five canonical prayer windows, used for time-of-day theme bias. */
export type PrayerWindow = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

/** Color palette for one theme. Light themes set `isLight` true. */
export interface ShareThemePalette {
  isLight: boolean;
  /** Background colour stops, top → mid → bottom. */
  bgTop: string;
  bgMid: string;
  bgBottom: string;
  /** Primary accent (gold-ish on dark themes, deep teal etc. on light). */
  accent: string;
  /** Softer accent for ornament strokes. */
  accentSoft: string;
  /** Body text colour. */
  text: string;
  /** Muted variant for source/eyebrow secondary parts. */
  textMuted: string;
  /** Divider rule colour (semi-transparent accent). */
  rule: string;
}

/** Props passed to a theme's Background renderer. */
export interface ThemeBackgroundProps {
  width: number;
  height: number;
  mode: ShareCardMode;
  palette: ShareThemePalette;
}

/**
 * Frame-style theme metadata. When present, ShareCard switches to the
 * "ornate frame" render path: a centred painted-arch panel with content
 * laid out inside the arch's safe area.
 */
export interface ShareFrameMeta {
  /** Bundled square panel image (512×512 source, scaled at render time). */
  image: ImageSourcePropType;
  /** Foreground tone — drives text colour & shadow strategy. */
  tone: "ink" | "cream";
  /** Safe area inside the arch, expressed in 512-px source coordinates. */
  safe: { t: number; r: number; b: number; l: number };
  /** Solid colour used to fill the letterbox bands outside the square panel. */
  bgFill: string;
  /** Optional accent override (gold) — defaults vary by tone. */
  accent?: string;
}

/** A theme module. Each theme file exports one of these. */
export interface ShareTheme {
  id: ShareThemeId;
  label: string;
  /** Short adjective shown under the theme name in the picker. */
  blurb: string;
  palette: ShareThemePalette;
  /** Default ("default") = SVG chrome layout. "frame" = painted-arch layout. */
  chrome?: "default" | "frame";
  /** Required when `chrome === "frame"`. */
  frame?: ShareFrameMeta;
  /** Renders the full-bleed background incl. ornaments. */
  Background: React.ComponentType<ThemeBackgroundProps>;
}

/** Content payload for the card. All fields optional except `body`. */
export interface ShareCardContent {
  /** Eyebrow ("HADITH · INTENTIONS", "AL-MULK · 67:5", "MORNING ADHKĀR"). */
  eyebrow: string;
  /** Optional Arabic text (rendered with AmiriQuran font). */
  arabic?: string;
  /** Optional transliteration (italic, between Arabic and English). */
  transliteration?: string;
  /** English (or other latin-script) translation / body text. */
  body: string;
  /** Caption shown under Arabic — used for the Names of Allah meaning line. */
  caption?: string;
  /** Source / attribution rendered as a small caps line near the bottom. */
  attribution?: string;
}
