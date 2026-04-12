import { AdhanMode, DEFAULT_ADHAN_MODE, DEFAULT_ADHAN_STYLE_ID } from "./adhanData";

export type PrayerNotifType = "silent" | "notification" | "adhan";
export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "sunrise";

export interface PrayerNotifSettings {
  enabled: boolean;
  type: PrayerNotifType;
  adhanStyleId: string;
  adhanMode: AdhanMode;
  days: number[]; // 0=Sun … 6=Sat; all 7 = every day
  minutesBefore?: 10 | 20 | 30; // Sunrise only — reminder X min before sunrise
}

export type PrayerNotifConfig = Record<PrayerKey, PrayerNotifSettings>;

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;
export const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export const SUNRISE_MINUTES_OPTIONS = [10, 20, 30] as const;
export type SunriseMinutesBefore = typeof SUNRISE_MINUTES_OPTIONS[number];

export const DEFAULT_PRAYER_NOTIF_SETTINGS: PrayerNotifSettings = {
  enabled: true,
  type: "adhan",
  adhanStyleId: DEFAULT_ADHAN_STYLE_ID,
  adhanMode: DEFAULT_ADHAN_MODE,
  days: [...ALL_DAYS],
};

export const DEFAULT_SUNRISE_NOTIF_SETTINGS: PrayerNotifSettings = {
  enabled: false,
  type: "notification",
  adhanStyleId: DEFAULT_ADHAN_STYLE_ID,
  adhanMode: DEFAULT_ADHAN_MODE,
  days: [...ALL_DAYS],
  minutesBefore: 20,
};

export const DEFAULT_PRAYER_NOTIF_CONFIG: PrayerNotifConfig = {
  fajr:    { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
  sunrise: { ...DEFAULT_SUNRISE_NOTIF_SETTINGS },
  dhuhr:   { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
  asr:     { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
  maghrib: { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
  isha:    { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
};

export const PRAYER_ARABIC: Record<PrayerKey, string> = {
  fajr:    "الفجر",
  sunrise: "الشروق",
  dhuhr:   "الظهر",
  asr:     "العصر",
  maghrib: "المغرب",
  isha:    "العشاء",
};

export const PRAYER_EMOJI: Record<PrayerKey, string> = {
  fajr:    "🌙",
  sunrise: "🌅",
  dhuhr:   "☀️",
  asr:     "🌤",
  maghrib: "🌇",
  isha:    "🌃",
};

export interface NotifTypeInfo {
  id: PrayerNotifType;
  label: string;
  icon: string;
  description: string;
}

export const NOTIF_TYPES: NotifTypeInfo[] = [
  { id: "silent",       label: "Silent",       icon: "bell-off",  description: "No sound or alert at prayer time" },
  { id: "notification", label: "Notification", icon: "bell",      description: "Banner alert with default sound, no adhan" },
  { id: "adhan",        label: "Adhan",        icon: "volume-2",  description: "Full adhan played + banner notification" },
];

// Sunrise only gets silent + notification (no adhan at sunrise)
export const SUNRISE_NOTIF_TYPES: NotifTypeInfo[] = [
  { id: "silent",       label: "Silent",       icon: "bell-off",  description: "Vibrate only — no sound" },
  { id: "notification", label: "Notification", icon: "bell",      description: "Banner alert with default sound" },
];

export function formatDays(days: number[]): string {
  if (days.length === 0) return "Never";
  if (days.length === 7) return "Every day";
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "Weekdays";
  if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";
  if (days.length === 1) return DAY_FULL[days[0]];
  return days.map(d => DAY_LABELS[d]).join(", ");
}
