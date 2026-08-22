import type { ImageSourcePropType } from "react-native";

import type {
  PremiumTheme,
  ShareContentKind,
  ShareThemeId,
  ShareVariant,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
 * Premium share-card themes.
 *
 * 4 visual variants × 4 content kinds = 16 themes. Each entry references
 * a pair of bundled photo plates (square card + 9:16 wallpaper) under
 * `assets/share-premium/`. The renderer uses these alongside the per-theme
 * ink/overlay metadata to produce the final card.
 *
 * The art direction for each entry mirrors the polished mockups in
 * `mockup-sandbox/src/components/mockups/nuur-premium/*` — see the
 * `<Kind><Mode>V<n>.tsx` files for the source-of-truth visual references
 * captured in `mockup-sandbox/public/canvas-thumbs/*.jpg`.
 * ──────────────────────────────────────────────────────────────────────── */

/* All 32 background plates, eagerly required so Metro bundles them. */
const ASSET = {
  "dua-card-v1":      require("@/assets/share-premium/dua-share-v1.png") as ImageSourcePropType,
  "dua-card-v2":      require("@/assets/share-premium/dua-share-v2.png") as ImageSourcePropType,
  "dua-card-v3":      require("@/assets/share-premium/dua-share-v3.png") as ImageSourcePropType,
  "dua-card-v4":      require("@/assets/share-premium/dua-share-v4.png") as ImageSourcePropType,
  "dua-wp-v1":        require("@/assets/share-premium/dua-wallpaper-v1.png") as ImageSourcePropType,
  "dua-wp-v2":        require("@/assets/share-premium/dua-wallpaper-v2.png") as ImageSourcePropType,
  "dua-wp-v3":        require("@/assets/share-premium/dua-wallpaper-v3.png") as ImageSourcePropType,
  "dua-wp-v4":        require("@/assets/share-premium/dua-wallpaper-v4.png") as ImageSourcePropType,
  "ayah-card-v1":     require("@/assets/share-premium/ayah-share-v1.png") as ImageSourcePropType,
  "ayah-card-v2":     require("@/assets/share-premium/ayah-share-v2.png") as ImageSourcePropType,
  "ayah-card-v3":     require("@/assets/share-premium/ayah-share-v3.png") as ImageSourcePropType,
  "ayah-card-v4":     require("@/assets/share-premium/ayah-share-v4.png") as ImageSourcePropType,
  "ayah-wp-v1":       require("@/assets/share-premium/ayah-wallpaper-v1.png") as ImageSourcePropType,
  "ayah-wp-v2":       require("@/assets/share-premium/ayah-wallpaper-v2.png") as ImageSourcePropType,
  "ayah-wp-v3":       require("@/assets/share-premium/ayah-wallpaper-v3.png") as ImageSourcePropType,
  "ayah-wp-v4":       require("@/assets/share-premium/ayah-wallpaper-v4.png") as ImageSourcePropType,
  "hadith-card-v1":   require("@/assets/share-premium/hadith-share-v1.png") as ImageSourcePropType,
  "hadith-card-v2":   require("@/assets/share-premium/hadith-share-v2.png") as ImageSourcePropType,
  "hadith-card-v3":   require("@/assets/share-premium/hadith-share-v3.png") as ImageSourcePropType,
  "hadith-card-v4":   require("@/assets/share-premium/hadith-share-v4.png") as ImageSourcePropType,
  "hadith-wp-v1":     require("@/assets/share-premium/hadith-wallpaper-v1.png") as ImageSourcePropType,
  "hadith-wp-v2":     require("@/assets/share-premium/hadith-wallpaper-v2.png") as ImageSourcePropType,
  "hadith-wp-v3":     require("@/assets/share-premium/hadith-wallpaper-v3.png") as ImageSourcePropType,
  "hadith-wp-v4":     require("@/assets/share-premium/hadith-wallpaper-v4.png") as ImageSourcePropType,
  "name-card-v1":     require("@/assets/share-premium/name-share-v1.png") as ImageSourcePropType,
  "name-card-v2":     require("@/assets/share-premium/name-share-v2.png") as ImageSourcePropType,
  "name-card-v3":     require("@/assets/share-premium/name-share-v3.png") as ImageSourcePropType,
  "name-card-v4":     require("@/assets/share-premium/name-share-v4.png") as ImageSourcePropType,
  "name-wp-v1":       require("@/assets/share-premium/name-wallpaper-v1.png") as ImageSourcePropType,
  "name-wp-v2":       require("@/assets/share-premium/name-wallpaper-v2.png") as ImageSourcePropType,
  "name-wp-v3":       require("@/assets/share-premium/name-wallpaper-v3.png") as ImageSourcePropType,
  "name-wp-v4":       require("@/assets/share-premium/name-wallpaper-v4.png") as ImageSourcePropType,
} as const;

/* Common shadow / overlay presets ─────────────────────────────────────── */
const SOFT_DARK_SHADOW  = { color: "rgba(0,0,0,0.55)", radius: 6, offsetY: 1 };
const STRONG_DARK_SHADOW = { color: "rgba(0,0,0,0.65)", radius: 8, offsetY: 2 };
const SOFT_LIGHT_SHADOW = { color: "rgba(255,255,255,0.55)", radius: 6, offsetY: 1 };

/* ── DUA / ADHKAR (4) ──────────────────────────────────────────────────── */

const DUA_THEMES: PremiumTheme[] = [
  {
    id: "dua-v1", kind: "dua", variant: 1,
    label: "Pastel Horizon", blurb: "Soft sunrise over distant hills",
    cardBg: ASSET["dua-card-v1"], wallpaperBg: ASSET["dua-wp-v1"],
    fallbackBg: "#F4D8C4",
    ink: "#2A1B2E", inkDim: "rgba(42, 27, 46, 0.72)",
    brandColor: "#2A1B2E", brandDim: "rgba(42, 27, 46, 0.82)",
    ruleColor: "rgba(42, 27, 46, 0.4)",
    textShadow: SOFT_LIGHT_SHADOW,
  },
  {
    id: "dua-v2", kind: "dua", variant: 2,
    label: "Moonlit Summit", blurb: "Crescent moon over a single peak",
    cardBg: ASSET["dua-card-v2"], wallpaperBg: ASSET["dua-wp-v2"],
    fallbackBg: "#0F2230",
    ink: "#EDF2F4", inkDim: "rgba(237, 242, 244, 0.7)",
    brandColor: "#EDF2F4", brandDim: "rgba(237, 242, 244, 0.6)",
    ruleColor: "rgba(237, 242, 244, 0.45)",
    overlays: [
      { type: "radial", innerColor: "rgba(15, 34, 48, 0.10)", outerColor: "rgba(8, 18, 28, 0.55)" },
    ],
    textShadow: STRONG_DARK_SHADOW,
  },
  {
    id: "dua-v3", kind: "dua", variant: 3,
    label: "Saharan Dusk", blurb: "Golden hour over the dunes",
    cardBg: ASSET["dua-card-v3"], wallpaperBg: ASSET["dua-wp-v3"],
    fallbackBg: "#F2C46A",
    ink: "#3A1B05", inkDim: "rgba(58, 27, 5, 0.78)",
    brandColor: "#3A1B05", brandDim: "rgba(58, 27, 5, 0.88)",
    ruleColor: "rgba(58, 27, 5, 0.45)",
    textShadow: SOFT_LIGHT_SHADOW,
  },
  {
    id: "dua-v4", kind: "dua", variant: 4,
    label: "Frosted Horizon", blurb: "Distant peaks at twilight",
    cardBg: ASSET["dua-card-v4"], wallpaperBg: ASSET["dua-wp-v4"],
    fallbackBg: "#D4DEE8",
    ink: "#1B2A3F", inkDim: "rgba(27, 42, 63, 0.72)",
    brandColor: "#1B2A3F", brandDim: "rgba(27, 42, 63, 0.85)",
    ruleColor: "rgba(27, 42, 63, 0.4)",
    textShadow: SOFT_LIGHT_SHADOW,
  },
];

/* ── AYAH (4) ──────────────────────────────────────────────────────────── */

const AYAH_THEMES: PremiumTheme[] = [
  {
    id: "ayah-v1", kind: "ayah", variant: 1,
    label: "Midnight Sky", blurb: "Cool stars, calligraphic ease",
    cardBg: ASSET["ayah-card-v1"], wallpaperBg: ASSET["ayah-wp-v1"],
    fallbackBg: "#0A1628",
    ink: "#EDE6D6", inkDim: "rgba(237, 230, 214, 0.6)",
    brandColor: "#EDE6D6", brandDim: "rgba(237, 230, 214, 0.6)",
    ruleColor: "rgba(237, 230, 214, 0.45)",
    overlays: [
      { type: "radial", innerColor: "rgba(0,0,0,0)", outerColor: "rgba(8, 18, 36, 0.55)" },
    ],
    textShadow: STRONG_DARK_SHADOW,
  },
  {
    id: "ayah-v2", kind: "ayah", variant: 2,
    label: "Slate Horizon", blurb: "Cool mountains at dusk",
    cardBg: ASSET["ayah-card-v2"], wallpaperBg: ASSET["ayah-wp-v2"],
    fallbackBg: "#0B111A",
    ink: "#E2E8F0", inkDim: "rgba(226, 232, 240, 0.65)",
    brandColor: "#E2E8F0", brandDim: "rgba(226, 232, 240, 0.55)",
    ruleColor: "rgba(226, 232, 240, 0.45)",
    overlays: [
      { type: "linear", stops: [
        ["rgba(11, 17, 26, 0.30)", 0],
        ["rgba(11, 17, 26, 0.10)", 0.4],
        ["rgba(11, 17, 26, 0.85)", 1],
      ]},
    ],
    textShadow: STRONG_DARK_SHADOW,
  },
  {
    id: "ayah-v3", kind: "ayah", variant: 3,
    label: "Plum Velvet", blurb: "Soft violet hour",
    cardBg: ASSET["ayah-card-v3"], wallpaperBg: ASSET["ayah-wp-v3"],
    fallbackBg: "#1B1530",
    ink: "#F2E5DC", inkDim: "rgba(216, 180, 160, 0.7)",
    brandColor: "#F2E5DC", brandDim: "rgba(216, 180, 160, 0.6)",
    ruleColor: "rgba(216, 180, 160, 0.5)",
    overlays: [
      { type: "linear", stops: [
        ["rgba(27, 21, 48, 0.25)", 0],
        ["rgba(27, 21, 48, 0.55)", 1],
      ]},
    ],
    textShadow: STRONG_DARK_SHADOW,
  },
  {
    id: "ayah-v4", kind: "ayah", variant: 4,
    label: "Berry Glow", blurb: "Magenta dusk over silhouette",
    cardBg: ASSET["ayah-card-v4"], wallpaperBg: ASSET["ayah-wp-v4"],
    fallbackBg: "#3A1730",
    ink: "#FFE9D8", inkDim: "rgba(255, 201, 168, 0.7)",
    brandColor: "#FFE9D8", brandDim: "rgba(255, 201, 168, 0.6)",
    ruleColor: "rgba(255, 201, 168, 0.55)",
    overlays: [
      { type: "linear", stops: [
        ["rgba(46, 15, 46, 0.30)", 0],
        ["rgba(46, 15, 46, 0.15)", 0.35],
        ["rgba(80, 25, 30, 0.55)", 0.7],
        ["rgba(20, 5, 12, 0.90)", 1],
      ]},
    ],
    textShadow: STRONG_DARK_SHADOW,
  },
];

/* ── HADITH (4) ────────────────────────────────────────────────────────── */

const HADITH_THEMES: PremiumTheme[] = [
  {
    id: "hadith-v1", kind: "hadith", variant: 1,
    label: "Slate Library", blurb: "Daylight on a scholar's wall",
    cardBg: ASSET["hadith-card-v1"], wallpaperBg: ASSET["hadith-wp-v1"],
    fallbackBg: "#1E2A33",
    ink: "#E8EEF2", inkDim: "rgba(232, 238, 242, 0.7)",
    brandColor: "#E8EEF2", brandDim: "rgba(232, 238, 242, 0.55)",
    ruleColor: "rgba(232, 238, 242, 0.45)",
    overlays: [
      { type: "radial", innerColor: "rgba(20, 30, 38, 0.20)", outerColor: "rgba(12, 20, 28, 0.75)" },
    ],
    textShadow: STRONG_DARK_SHADOW,
    brandScrim: true,
  },
  {
    id: "hadith-v2", kind: "hadith", variant: 2,
    label: "Vellum Scholar", blurb: "Sepia ink on aged ivory",
    cardBg: ASSET["hadith-card-v2"], wallpaperBg: ASSET["hadith-wp-v2"],
    fallbackBg: "#F2E8D0",
    ink: "#2A1A0E", inkDim: "rgba(42, 26, 14, 0.72)",
    brandColor: "#5A3A1E", brandDim: "rgba(90, 58, 30, 0.75)",
    ruleColor: "rgba(90, 58, 30, 0.45)",
    overlays: [
      { type: "radial", innerColor: "rgba(248, 240, 220, 0.25)", outerColor: "rgba(232, 218, 188, 0)" },
    ],
    textShadow: SOFT_LIGHT_SHADOW,
  },
  {
    id: "hadith-v3", kind: "hadith", variant: 3,
    label: "Midnight Sage", blurb: "Copper arch in jade hall",
    cardBg: ASSET["hadith-card-v3"], wallpaperBg: ASSET["hadith-wp-v3"],
    fallbackBg: "#13332C",
    ink: "#F2E0C4", inkDim: "rgba(242, 224, 196, 0.70)",
    brandColor: "#D49A6A", brandDim: "rgba(212, 154, 106, 0.65)",
    ruleColor: "rgba(212, 154, 106, 0.55)",
    overlays: [
      { type: "linear", stops: [
        ["rgba(19, 51, 44, 0.15)", 0],
        ["rgba(10, 32, 26, 0.65)", 1],
      ]},
    ],
    textShadow: STRONG_DARK_SHADOW,
    brandScrim: true,
  },
  {
    id: "hadith-v4", kind: "hadith", variant: 4,
    label: "Burgundy Velvet", blurb: "Gilt filigree on deep wine",
    cardBg: ASSET["hadith-card-v4"], wallpaperBg: ASSET["hadith-wp-v4"],
    fallbackBg: "#3A0E18",
    ink: "#F0DDC0", inkDim: "rgba(240, 221, 192, 0.72)",
    brandColor: "#D4AF37", brandDim: "rgba(212, 175, 55, 0.6)",
    ruleColor: "rgba(212, 175, 55, 0.5)",
    overlays: [
      { type: "radial", innerColor: "rgba(58, 14, 24, 0.15)", outerColor: "rgba(30, 6, 12, 0.70)" },
    ],
    textShadow: STRONG_DARK_SHADOW,
    brandScrim: true,
  },
];

/* ── 99 NAMES (4) ──────────────────────────────────────────────────────── */

const NAME_THEMES: PremiumTheme[] = [
  {
    id: "name-v1", kind: "name", variant: 1,
    label: "Lapis Mihrab", blurb: "Gold arch under starlit navy",
    cardBg: ASSET["name-card-v1"], wallpaperBg: ASSET["name-wp-v1"],
    fallbackBg: "#0B1530",
    ink: "#F3E3B6", inkDim: "rgba(212, 175, 55, 0.7)",
    brandColor: "#D4AF37", brandDim: "rgba(212, 175, 55, 0.45)",
    ruleColor: "rgba(212, 175, 55, 0.4)",
    overlays: [
      { type: "radial", innerColor: "rgba(11, 21, 48, 0.20)", outerColor: "rgba(8, 14, 32, 0.75)" },
    ],
    arch: true,
    textShadow: STRONG_DARK_SHADOW,
    brandScrim: true,
  },
  {
    id: "name-v2", kind: "name", variant: 2,
    label: "Onyx Marble", blurb: "Veined gold on polished black",
    cardBg: ASSET["name-card-v2"], wallpaperBg: ASSET["name-wp-v2"],
    fallbackBg: "#0E0A06",
    ink: "#F3E3B6", inkDim: "rgba(212, 175, 55, 0.65)",
    brandColor: "#D4AF37", brandDim: "rgba(212, 175, 55, 0.45)",
    ruleColor: "rgba(212, 175, 55, 0.4)",
    overlays: [
      { type: "linear", stops: [
        ["rgba(14, 10, 6, 0.25)", 0],
        ["rgba(14, 10, 6, 0.10)", 0.4],
        ["rgba(14, 10, 6, 0.80)", 1],
      ]},
    ],
    arch: true,
    textShadow: STRONG_DARK_SHADOW,
    brandScrim: true,
  },
  {
    id: "name-v3", kind: "name", variant: 3,
    label: "Forest Sanctuary", blurb: "Brass lanterns in jade hall",
    cardBg: ASSET["name-card-v3"], wallpaperBg: ASSET["name-wp-v3"],
    fallbackBg: "#0E2A20",
    ink: "#F3E3B6", inkDim: "rgba(212, 175, 55, 0.7)",
    brandColor: "#D4AF37", brandDim: "rgba(212, 175, 55, 0.45)",
    ruleColor: "rgba(212, 175, 55, 0.4)",
    overlays: [
      { type: "linear", stops: [
        ["rgba(14, 42, 32, 0.20)", 0],
        ["rgba(8, 28, 20, 0.65)", 1],
      ]},
    ],
    arch: true,
    textShadow: STRONG_DARK_SHADOW,
    brandScrim: true,
  },
  {
    id: "name-v4", kind: "name", variant: 4,
    label: "Sapphire Vault", blurb: "Stars beneath the dome",
    cardBg: ASSET["name-card-v4"], wallpaperBg: ASSET["name-wp-v4"],
    fallbackBg: "#0A1530",
    ink: "#F3E3B6", inkDim: "rgba(212, 175, 55, 0.7)",
    brandColor: "#D4AF37", brandDim: "rgba(212, 175, 55, 0.5)",
    ruleColor: "rgba(212, 175, 55, 0.4)",
    overlays: [
      { type: "radial", innerColor: "rgba(10, 21, 48, 0.20)", outerColor: "rgba(6, 12, 28, 0.75)" },
    ],
    arch: true,
    textShadow: STRONG_DARK_SHADOW,
    brandScrim: true,
  },
];

const ALL_THEMES: PremiumTheme[] = [
  ...DUA_THEMES,
  ...AYAH_THEMES,
  ...HADITH_THEMES,
  ...NAME_THEMES,
];

export const THEMES: Record<ShareThemeId, PremiumTheme> = ALL_THEMES.reduce(
  (acc, t) => { acc[t.id] = t; return acc; },
  {} as Record<ShareThemeId, PremiumTheme>,
);

/* Display orders per kind — V1..V4 left → right in the picker. */
const DUA_ORDER:    ShareThemeId[] = ["dua-v1", "dua-v2", "dua-v3", "dua-v4"];
const AYAH_ORDER:   ShareThemeId[] = ["ayah-v1", "ayah-v2", "ayah-v3", "ayah-v4"];
const HADITH_ORDER: ShareThemeId[] = ["hadith-v1", "hadith-v2", "hadith-v3", "hadith-v4"];
const NAME_ORDER:   ShareThemeId[] = ["name-v1", "name-v2", "name-v3", "name-v4"];

/**
 * Default theme used when the requested id is unknown. Always returns a
 * dua theme so the renderer never crashes; callers should always resolve
 * the correct kind via `getThemesForKind`.
 */
export const DEFAULT_THEME_ID: ShareThemeId = "dua-v1";

/** Look up a theme by id, falling back to the dua-v1 default. */
export function getTheme(id: ShareThemeId | string | null | undefined): PremiumTheme {
  if (id && id in THEMES) return THEMES[id as ShareThemeId];
  return THEMES[DEFAULT_THEME_ID];
}

/**
 * Map a content kind to the bucket of themes available for it. Adhkar
 * shares the dua frames (no separate plates were designed). Quran maps
 * to ayah. Everything else is direct.
 */
function kindBucket(kind: ShareContentKind): "dua" | "ayah" | "hadith" | "name" {
  if (kind === "adhkar") return "dua";
  if (kind === "quran") return "ayah";
  return kind;
}

export function getThemesForKind(kind: ShareContentKind): ShareThemeId[] {
  const bucket = kindBucket(kind);
  if (bucket === "dua") return DUA_ORDER;
  if (bucket === "ayah") return AYAH_ORDER;
  if (bucket === "hadith") return HADITH_ORDER;
  return NAME_ORDER;
}

/** Pick a specific variant within a kind (1..4). Used by autoSelect. */
export function themeIdFor(kind: ShareContentKind, variant: ShareVariant): ShareThemeId {
  const bucket = kindBucket(kind);
  return `${bucket}-v${variant}` as ShareThemeId;
}
