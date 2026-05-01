import type { ImageSourcePropType } from "react-native";

/* ─────────────────────────────────────────────────────────────────────────
 * Public types for the share-card module — premium photo-card system.
 *
 * 16 themes total: 4 visual variants per content kind (dua, ayah, hadith,
 * name). Each theme bundles a square card background and a 9:16 wallpaper
 * background — both are full-bleed photographic plates designed to pair
 * with a centred typographic cluster + NUUR brand mark at the bottom.
 *
 * Adhkar shares the dua frames.
 * ──────────────────────────────────────────────────────────────────────── */

export type ShareCardMode = "card" | "wallpaper";

/** Variant index 1..4 — order matches the 4 designs per kind. */
export type ShareVariant = 1 | 2 | 3 | 4;

export type ShareThemeId =
  | "dua-v1" | "dua-v2" | "dua-v3" | "dua-v4"
  | "ayah-v1" | "ayah-v2" | "ayah-v3" | "ayah-v4"
  | "hadith-v1" | "hadith-v2" | "hadith-v3" | "hadith-v4"
  | "name-v1" | "name-v2" | "name-v3" | "name-v4";

/** Content category — drives auto-selection and the renderer's layout path. */
export type ShareContentKind = "quran" | "hadith" | "dua" | "name" | "adhkar";

/** Five canonical prayer windows, used for time-of-day theme bias. */
export type PrayerWindow = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

/**
 * One premium share-card theme. Visual identity comes entirely from the
 * pre-rendered background plate; this metadata controls the colour of the
 * typographic cluster sitting on top.
 */
export interface PremiumTheme {
  id: ShareThemeId;
  /** Which content kind this theme is allowed for. */
  kind: "dua" | "ayah" | "hadith" | "name";
  /** Variant index within the kind (1..4). */
  variant: ShareVariant;
  /** Display label ("Cream Leaves", "Night Mosque" …) shown in the picker. */
  label: string;
  /** Short adjective shown under the label in the picker. */
  blurb: string;
  /** Bundled square (1:1) photo plate. */
  cardBg: ImageSourcePropType;
  /** Bundled 9:16 photo plate. */
  wallpaperBg: ImageSourcePropType;
  /** Solid fallback / letterbox colour while the plate loads. */
  fallbackBg: string;
  /** Primary text colour (Arabic + English body). */
  ink: string;
  /** Muted secondary tone (source caption + tagline). */
  inkDim: string;
  /** Brand mark + wordmark colour. */
  brandColor: string;
  /** Tagline tint. */
  brandDim: string;
  /** Hairline divider colour (between Arabic and translation). */
  ruleColor: string;
  /**
   * Optional CSS-style overlay specs to draw on top of the photo for legibility.
   * Each is rendered with `expo-linear-gradient`; the renderer interprets
   * "kind" as either a vertical gradient or a centre radial scrim.
   */
  overlays?: ThemeOverlay[];
  /** Names-only — render an arched border ornament inside the card. */
  arch?: boolean;
  /** Optional shadow on text for legibility on busy bg. Omit for light bgs. */
  textShadow?: { color: string; radius: number; offsetY?: number };
  /** Render a soft contrast scrim behind the brand footer. */
  brandScrim?: boolean;
}

/**
 * A single overlay drawn between the photo and the content. The renderer
 * supports two shapes: a top→bottom linear gradient, and a centred radial
 * scrim. Both compile down to expo-linear-gradient under the hood (radial
 * is faked with a soft outer fade).
 */
export type ThemeOverlay =
  | {
      type: "linear";
      /** Stops as [color, position 0..1]. */
      stops: Array<[string, number]>;
    }
  | {
      type: "radial";
      /** Centre opacity 0..1 (hex/rgba color implied via outer/inner fade). */
      innerColor: string;
      outerColor: string;
      /** Centre Y position 0..1 (default 0.5). */
      centerY?: number;
    };

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
