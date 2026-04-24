import type React from "react";

/* Public types shared across the share-card module. */

export type ShareCardMode = "card" | "wallpaper";

export type ShareThemeId =
  | "midnight"
  | "starry"
  | "emerald"
  | "rose"
  | "sepia"
  | "parchment";

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

/** A theme module. Each theme file exports one of these. */
export interface ShareTheme {
  id: ShareThemeId;
  label: string;
  /** Short adjective shown under the theme name in the picker. */
  blurb: string;
  palette: ShareThemePalette;
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
