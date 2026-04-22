import { Platform } from "react-native";
import type { TrackerPrayerKey } from "@/context/PrayerTrackerContext";

export const TRACKER_FIVE: TrackerPrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export const ARABIC: Record<string, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

// Time-of-day sky gradients (top → horizon), keyed by current prayer name.
export const SKY: Record<string, string[]> = {
  fajr:    ["#06081C", "#0E0F2A", "#2D1A3A", "#4A2A3E"],
  sunrise: ["#1A2B4A", "#3D4F70", "#A87B5A", "#E4A579"],
  dhuhr:   ["#1B3A5E", "#3A6B9E", "#7BB0DC", "#B5DBED"],
  asr:     ["#2A2545", "#5A3E5A", "#A06840", "#D89055"],
  maghrib: ["#1A1530", "#3A1F2E", "#7A3826", "#C26835"],
  isha:    ["#02030E", "#060820", "#0A0E2A", "#101638"],
};

export const SERIF = Platform.select({ ios: "Georgia", android: "serif", web: "Georgia, serif" });

export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  tint: string;
  gold: string;
  prayerCard: string;
};
