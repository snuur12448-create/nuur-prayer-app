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
  tabIconDefault: string;
  tabIconSelected: string;
  prayerCard: string;
  prayerTime: string;
  accent: string;
  red: string;
};

export type ThemeName = "emerald" | "midnight" | "amber" | "violet" | "rose";
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
      tabIconDefault: "#4A6357",
      tabIconSelected: "#4ADE80",
      prayerCard: "#152A1A",
      prayerTime: "#F0EDE5",
      accent: "#F4C842",
      red: "#E55555",
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
      tabIconDefault: "#7AAF8A",
      tabIconSelected: "#15803D",
      prayerCard: "#D1FAE5",
      prayerTime: "#0D2919",
      accent: "#92400E",
      red: "#DC2626",
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
      tabIconDefault: "#3A5570",
      tabIconSelected: "#60A5FA",
      prayerCard: "#101E34",
      prayerTime: "#E8F0FF",
      accent: "#93C5FD",
      red: "#F87171",
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
      tabIconDefault: "#6A8EC2",
      tabIconSelected: "#1D4ED8",
      prayerCard: "#DBEAFE",
      prayerTime: "#0A1A3D",
      accent: "#3B82F6",
      red: "#DC2626",
    },
  },
  amber: {
    name: "amber",
    label: "Desert",
    swatch: ["#F59E0B", "#160D00"],
    colors: {
      text: "#FFF3E0",
      textSecondary: "#B08050",
      background: "#160D00",
      surface: "#231400",
      surfaceElevated: "#321C00",
      border: "#3D2200",
      tint: "#F59E0B",
      tintLight: "#7C4A00",
      gold: "#FBBF24",
      goldLight: "#FDE68A",
      tabIconDefault: "#7C5A2A",
      tabIconSelected: "#F59E0B",
      prayerCard: "#1E1000",
      prayerTime: "#FFF3E0",
      accent: "#FBBF24",
      red: "#F87171",
    },
    lightColors: {
      text: "#2C1400",
      textSecondary: "#7C4A15",
      background: "#FFFBF0",
      surface: "#FFFFFF",
      surfaceElevated: "#FEF3C7",
      border: "#EDD090",
      tint: "#D97706",
      tintLight: "#FDE68A",
      gold: "#92400E",
      goldLight: "#FCD34D",
      tabIconDefault: "#B08040",
      tabIconSelected: "#D97706",
      prayerCard: "#FEF3C7",
      prayerTime: "#2C1400",
      accent: "#92400E",
      red: "#DC2626",
    },
  },
  violet: {
    name: "violet",
    label: "Royal",
    swatch: ["#A78BFA", "#0D0A18"],
    colors: {
      text: "#EDE8FF",
      textSecondary: "#8B7AAF",
      background: "#0D0A18",
      surface: "#150F28",
      surfaceElevated: "#1D1638",
      border: "#251D3F",
      tint: "#A78BFA",
      tintLight: "#4C1D95",
      gold: "#C4B5FD",
      goldLight: "#DDD6FE",
      tabIconDefault: "#5B4A8A",
      tabIconSelected: "#A78BFA",
      prayerCard: "#110D22",
      prayerTime: "#EDE8FF",
      accent: "#C4B5FD",
      red: "#F87171",
    },
    lightColors: {
      text: "#1A0A38",
      textSecondary: "#5B4A8A",
      background: "#F5F0FF",
      surface: "#FFFFFF",
      surfaceElevated: "#ECE5FF",
      border: "#C4B5F8",
      tint: "#6D28D9",
      tintLight: "#DDD6FE",
      gold: "#4C1D95",
      goldLight: "#EDE9FE",
      tabIconDefault: "#8B7AC8",
      tabIconSelected: "#6D28D9",
      prayerCard: "#EDE9FE",
      prayerTime: "#1A0A38",
      accent: "#7C3AED",
      red: "#DC2626",
    },
  },
  rose: {
    name: "rose",
    label: "Rose",
    swatch: ["#F472B6", "#150A0D"],
    colors: {
      text: "#FFE8EF",
      textSecondary: "#AF7A8A",
      background: "#150A0D",
      surface: "#1E0F14",
      surfaceElevated: "#2A141C",
      border: "#371820",
      tint: "#F472B6",
      tintLight: "#9D174D",
      gold: "#FB923C",
      goldLight: "#FDBA74",
      tabIconDefault: "#7A4A58",
      tabIconSelected: "#F472B6",
      prayerCard: "#1C0D13",
      prayerTime: "#FFE8EF",
      accent: "#FB923C",
      red: "#F87171",
    },
    lightColors: {
      text: "#38060D",
      textSecondary: "#8B3A50",
      background: "#FFF0F5",
      surface: "#FFFFFF",
      surfaceElevated: "#FFE0EC",
      border: "#F9B8CF",
      tint: "#BE185D",
      tintLight: "#FBCFE8",
      gold: "#C2410C",
      goldLight: "#FED7AA",
      tabIconDefault: "#C08A9A",
      tabIconSelected: "#BE185D",
      prayerCard: "#FFE0EC",
      prayerTime: "#38060D",
      accent: "#C2410C",
      red: "#DC2626",
    },
  },
};

export const DEFAULT_THEME: ThemeName = "emerald";
export const DEFAULT_DISPLAY_MODE: DisplayMode = "auto";
