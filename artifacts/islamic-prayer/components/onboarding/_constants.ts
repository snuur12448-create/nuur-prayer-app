import type { ThemeColors } from "@/constants/themes";

export const BG = "#09150D";
export const GOLD = "#C9933A";
export const TEXT = "#F0EDE4";
export const TEXT_DIM = "rgba(240,237,228,0.5)";
export const SURFACE = "rgba(255,255,255,0.05)";
export const SURFACE_ACTIVE = "rgba(201,147,58,0.13)";
export const BORDER_DIM = "rgba(255,255,255,0.1)";

// Dark palette for the manual city picker so the modal blends into the
// onboarding background instead of flashing the user's saved theme.
export const ONBOARDING_PICKER_COLORS: ThemeColors = {
  text: TEXT,
  textSecondary: TEXT_DIM,
  background: BG,
  surface: "#121C16",
  surfaceElevated: "#172620",
  border: BORDER_DIM,
  tint: GOLD,
  tintLight: GOLD + "33",
  gold: GOLD,
  goldLight: GOLD + "33",
  goldGradient: [GOLD, "#8C6420"],
  glow: GOLD + "22",
  tabIconDefault: TEXT_DIM,
  tabIconSelected: GOLD,
  prayerCard: SURFACE,
  prayerTime: TEXT,
  accent: GOLD,
  red: "#D9534F",
};
