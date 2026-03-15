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

export type ThemeDefinition = {
  name: ThemeName;
  label: string;
  swatch: [string, string];
  colors: ThemeColors;
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
  },
};

export const DEFAULT_THEME: ThemeName = "emerald";
