export type ThemeColors = {
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  tint: string;
  tintLight: string;
  gold: string;
  goldLight: string;
  /** Two-stop gradient for hero gold elements — feels like leaf gold, not paint. */
  goldGradient: [string, string];
  /** Warm/theme-tinted glow color for elevated cards (use at low opacity). */
  glow: string;
  tabIconDefault: string;
  tabIconSelected: string;
  prayerCard: string;
  prayerTime: string;
  accent: string;
  red: string;
  /**
   * Mushaf-leaf paper palette. The leaf insert (Verse-of-the-Day, hadith
   * scholars card, etc.) uses these instead of the surrounding chrome colors
   * so it always reads as a printed-paper artefact — but tinted slightly per
   * theme so the cream parchment doesn't clash against burgundy / midnight /
   * slate surfaces. The rule color picks up the theme accent at low chroma.
   *
   * Convention: paperRuleSoft is derived as `paperRule + "66"` at consumer.
   */
  paperTop: string;     // top of the paper gradient
  paperBot: string;     // bottom of the paper gradient
  paperBand: string;    // surah-header band fill
  paperInk: string;     // primary ink (Arabic body)
  paperInkDim: string;  // secondary ink (caption text on paper)
  paperRule: string;    // rule lines, ornaments, ayah stamp
};

export type ThemeName = "emerald" | "midnight" | "gold" | "slate" | "burgundy";
export type DisplayMode = "auto" | "dark" | "light";

export type ThemeDefinition = {
  name: ThemeName;
  label: string;
  swatch: [string, string];
  colors: ThemeColors;
  lightColors: ThemeColors;
};

export const THEMES: Record<ThemeName, ThemeDefinition> = {
  emerald: {
    name: "emerald",
    label: "Emerald",
    swatch: ["#4ADE80", "#0A1A0E"],
    colors: {
      text: "#F0EDE5",
      textSecondary: "#8FA99A",
      background: "#0A1A0E",
      surface: "#111F14",
      surfaceElevated: "#172B1B",
      border: "#1F3526",
      tint: "#4ADE80",
      tintLight: "#2D6A4F",
      gold: "#F4C842",
      goldLight: "#F9D97A",
      goldGradient: ["#F9D97A", "#C99A2A"],
      glow: "#F4C842",
      tabIconDefault: "#4A6357",
      tabIconSelected: "#4ADE80",
      prayerCard: "#152A1A",
      prayerTime: "#F0EDE5",
      accent: "#F4C842",
      red: "#E55555",
      paperTop: "#F4EDD6", paperBot: "#EBE0BD", paperBand: "#E5D6A8",
      paperInk: "#1F1A12", paperInkDim: "#6B5A3B", paperRule: "#9D8F4A",
    },
    lightColors: {
      text: "#0D2919",
      textSecondary: "#3D6B50",
      background: "#F0FAF3",
      surface: "#FFFFFF",
      surfaceElevated: "#E0F2E7",
      border: "#B8DFC5",
      tint: "#15803D",
      tintLight: "#BBF7D0",
      gold: "#92400E",
      goldLight: "#FDE68A",
      goldGradient: ["#B97A1E", "#7A4F0E"],
      glow: "#92400E",
      tabIconDefault: "#7AAF8A",
      tabIconSelected: "#15803D",
      prayerCard: "#D1FAE5",
      prayerTime: "#0D2919",
      accent: "#92400E",
      red: "#DC2626",
      paperTop: "#F4EDD6", paperBot: "#EBE0BD", paperBand: "#E5D6A8",
      paperInk: "#1F1A12", paperInkDim: "#6B5A3B", paperRule: "#9D8F4A",
    },
  },
  midnight: {
    name: "midnight",
    label: "Midnight",
    swatch: ["#60A5FA", "#08101E"],
    colors: {
      text: "#E8F0FF",
      textSecondary: "#7B96B5",
      background: "#08101E",
      surface: "#0E1828",
      surfaceElevated: "#152035",
      border: "#1C2D42",
      tint: "#60A5FA",
      tintLight: "#1E3A5F",
      gold: "#93C5FD",
      goldLight: "#BFDBFE",
      goldGradient: ["#BFDBFE", "#3B82F6"],
      glow: "#60A5FA",
      tabIconDefault: "#3A5570",
      tabIconSelected: "#60A5FA",
      prayerCard: "#101E34",
      prayerTime: "#E8F0FF",
      accent: "#93C5FD",
      red: "#F87171",
      paperTop: "#EFEAD7", paperBot: "#E3DDC1", paperBand: "#DAD3AE",
      paperInk: "#1A1F2E", paperInkDim: "#5C5840", paperRule: "#9A8E58",
    },
    lightColors: {
      text: "#0A1A3D",
      textSecondary: "#3A5E90",
      background: "#EEF4FF",
      surface: "#FFFFFF",
      surfaceElevated: "#DCE8FF",
      border: "#B0CCEE",
      tint: "#1D4ED8",
      tintLight: "#BFDBFE",
      gold: "#1E40AF",
      goldLight: "#DBEAFE",
      goldGradient: ["#3B82F6", "#1E3A8A"],
      glow: "#3B82F6",
      tabIconDefault: "#6A8EC2",
      tabIconSelected: "#1D4ED8",
      prayerCard: "#DBEAFE",
      prayerTime: "#0A1A3D",
      accent: "#3B82F6",
      red: "#DC2626",
      paperTop: "#EFEAD7", paperBot: "#E3DDC1", paperBand: "#DAD3AE",
      paperInk: "#1A1F2E", paperInkDim: "#5C5840", paperRule: "#9A8E58",
    },
  },
  gold: {
    name: "gold",
    label: "Gold",
    swatch: ["#D4AF37", "#1A1400"],
    colors: {
      text: "#FFF8E7",
      textSecondary: "#9A8B5A",
      background: "#1A1400",
      surface: "#221C00",
      surfaceElevated: "#2C2400",
      border: "#3A3000",
      tint: "#D4AF37",
      tintLight: "#6B5200",
      gold: "#D4AF37",
      goldLight: "#E8CD70",
      goldGradient: ["#F0CC5A", "#A8851E"],
      glow: "#D4AF37",
      tabIconDefault: "#7A6A3A",
      tabIconSelected: "#D4AF37",
      prayerCard: "#1E1800",
      prayerTime: "#FFF8E7",
      accent: "#D4AF37",
      red: "#F87171",
      paperTop: "#F6EDD6", paperBot: "#EFE3C6", paperBand: "#EBDDB8",
      paperInk: "#1F1A12", paperInkDim: "#6B5A3B", paperRule: "#B89856",
    },
    lightColors: {
      text: "#2C2000",
      textSecondary: "#7A5A00",
      background: "#FFFDF0",
      surface: "#FFFFFF",
      surfaceElevated: "#FFF8D6",
      border: "#E8D070",
      tint: "#A07800",
      tintLight: "#FFF8D6",
      gold: "#7A5A00",
      goldLight: "#FFF0A0",
      goldGradient: ["#A07800", "#5A4000"],
      glow: "#A07800",
      tabIconDefault: "#B08A30",
      tabIconSelected: "#A07800",
      prayerCard: "#FFF8D6",
      prayerTime: "#2C2000",
      accent: "#7A5A00",
      red: "#DC2626",
    },
  },
  slate: {
    name: "slate",
    label: "Slate",
    swatch: ["#94A3B8", "#0D1117"],
    colors: {
      text: "#E6EDF3",
      textSecondary: "#8B949E",
      background: "#0D1117",
      surface: "#161B22",
      surfaceElevated: "#1C2128",
      border: "#21262D",
      tint: "#94A3B8",
      tintLight: "#30363D",
      gold: "#94A3B8",
      goldLight: "#B8C4D2",
      goldGradient: ["#CBD5E1", "#64748B"],
      glow: "#94A3B8",
      tabIconDefault: "#484F58",
      tabIconSelected: "#94A3B8",
      prayerCard: "#121820",
      prayerTime: "#E6EDF3",
      accent: "#94A3B8",
      red: "#F87171",
    },
    lightColors: {
      text: "#0A1628",
      textSecondary: "#3A5070",
      background: "#F0F4F8",
      surface: "#FFFFFF",
      surfaceElevated: "#E1E8F0",
      border: "#B0C0D0",
      tint: "#475569",
      tintLight: "#CBD5E1",
      gold: "#334155",
      goldLight: "#E2E8F0",
      goldGradient: ["#475569", "#1E293B"],
      glow: "#475569",
      tabIconDefault: "#6A8090",
      tabIconSelected: "#475569",
      prayerCard: "#E1E8F0",
      prayerTime: "#0A1628",
      accent: "#475569",
      red: "#DC2626",
    },
  },
  burgundy: {
    name: "burgundy",
    label: "Burgundy",
    swatch: ["#C2185B", "#1A0810"],
    colors: {
      text: "#FFE8F0",
      textSecondary: "#AF7A90",
      background: "#1A0810",
      surface: "#240D18",
      surfaceElevated: "#2E1020",
      border: "#3A1428",
      tint: "#C2185B",
      tintLight: "#6B0030",
      gold: "#E91E8C",
      goldLight: "#F48CC0",
      goldGradient: ["#F48CC0", "#C2185B"],
      glow: "#E91E8C",
      tabIconDefault: "#7A3A54",
      tabIconSelected: "#C2185B",
      prayerCard: "#200B15",
      prayerTime: "#FFE8F0",
      accent: "#C2185B",
      red: "#F87171",
    },
    lightColors: {
      text: "#38060D",
      textSecondary: "#8B1A40",
      background: "#FFF0F5",
      surface: "#FFFFFF",
      surfaceElevated: "#FFE0EE",
      border: "#F0B0CC",
      tint: "#880E4F",
      tintLight: "#FFDDE8",
      gold: "#7C0D38",
      goldLight: "#FFB0D0",
      goldGradient: ["#A0144A", "#5A0726"],
      glow: "#880E4F",
      tabIconDefault: "#C0709A",
      tabIconSelected: "#880E4F",
      prayerCard: "#FFE0EE",
      prayerTime: "#38060D",
      accent: "#880E4F",
      red: "#DC2626",
    },
  },
};

export const DEFAULT_THEME: ThemeName = "emerald";
export const DEFAULT_DISPLAY_MODE: DisplayMode = "auto";
