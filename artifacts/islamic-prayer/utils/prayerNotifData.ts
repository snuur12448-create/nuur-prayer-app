import { AdhanMode, DEFAULT_ADHAN_MODE, DEFAULT_ADHAN_STYLE_ID } from "./adhanData";

export type PrayerNotifType = "silent" | "notification" | "adhan";
export type PrayerKey =
  | "fajr"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha"
  | "sunrise"
  | "tahajjud";

// Offset prayers are pseudo-prayers fired *relative to* an astronomical event
// (Sunrise = end of Fajr window; Tahajjud = start of the last third of night).
// They never play an adhan and are scheduled with a `minutesBefore` lead time.
export const OFFSET_PRAYER_KEYS: PrayerKey[] = ["sunrise", "tahajjud"];
export function isOffsetPrayer(k: PrayerKey): boolean {
  return k === "sunrise" || k === "tahajjud";
}

export interface PrayerNotifSettings {
  enabled: boolean;
  type: PrayerNotifType;
  adhanStyleId: string;
  adhanMode: AdhanMode;
  days: number[]; // 0=Sun … 6=Sat; all 7 = every day
  minutesBefore?: 10 | 20 | 30; // Offset prayers only (Sunrise / Tahajjud)
}

export type PrayerNotifConfig = Record<PrayerKey, PrayerNotifSettings>;

export const OBLIGATORY_PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

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

// Tahajjud defaults: off (would otherwise wake people at ~3 AM unsolicited),
// 30-minute lead time so the user has time to do wudu before the window opens.
export const DEFAULT_TAHAJJUD_NOTIF_SETTINGS: PrayerNotifSettings = {
  enabled: false,
  type: "notification",
  adhanStyleId: DEFAULT_ADHAN_STYLE_ID,
  adhanMode: DEFAULT_ADHAN_MODE,
  days: [...ALL_DAYS],
  minutesBefore: 30,
};

export const DEFAULT_PRAYER_NOTIF_CONFIG: PrayerNotifConfig = {
  fajr:     { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
  sunrise:  { ...DEFAULT_SUNRISE_NOTIF_SETTINGS },
  dhuhr:    { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
  asr:      { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
  maghrib:  { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
  isha:     { ...DEFAULT_PRAYER_NOTIF_SETTINGS },
  tahajjud: { ...DEFAULT_TAHAJJUD_NOTIF_SETTINGS },
};

function normalizeDays(value: unknown, fallback: number[]): number[] {
  if (!Array.isArray(value)) return [...fallback];
  return Array.from(new Set(value.filter((day): day is number =>
    Number.isInteger(day) && day >= 0 && day <= 6,
  ))).sort((a, b) => a - b);
}

/** Safely migrate partial/corrupt persisted notification settings. */
export function normalizePrayerNotifConfig(value: unknown): PrayerNotifConfig {
  const stored = value && typeof value === "object"
    ? value as Partial<Record<PrayerKey, Partial<PrayerNotifSettings>>>
    : {};
  const result = {} as PrayerNotifConfig;
  for (const key of Object.keys(DEFAULT_PRAYER_NOTIF_CONFIG) as PrayerKey[]) {
    const fallback = DEFAULT_PRAYER_NOTIF_CONFIG[key];
    const item = stored[key];
    const type = item?.type === "silent" || item?.type === "notification" || item?.type === "adhan"
      ? item.type
      : fallback.type;
    const adhanMode = item?.adhanMode === "full" || item?.adhanMode === "short" || item?.adhanMode === "silent"
      ? item.adhanMode
      : fallback.adhanMode;
    const rawMinutes = item?.minutesBefore;
    const minutesBefore = rawMinutes === 10 || rawMinutes === 20 || rawMinutes === 30
      ? rawMinutes
      : fallback.minutesBefore;
    result[key] = {
      ...fallback,
      enabled: typeof item?.enabled === "boolean" ? item.enabled : fallback.enabled,
      type,
      adhanStyleId: typeof item?.adhanStyleId === "string" && item.adhanStyleId.length > 0
        ? item.adhanStyleId
        : fallback.adhanStyleId,
      adhanMode,
      days: normalizeDays(item?.days, fallback.days),
      ...(minutesBefore === undefined ? {} : { minutesBefore }),
    };
  }
  return result;
}

/** Apply one global sound/style choice to the five obligatory prayers only. */
export function patchObligatoryPrayerNotifications(
  config: PrayerNotifConfig,
  patch: Partial<PrayerNotifSettings>,
): PrayerNotifConfig {
  const next = { ...config };
  for (const key of OBLIGATORY_PRAYER_KEYS) {
    next[key] = { ...config[key], ...patch };
  }
  return next;
}

/** Keep foreground playback aligned with the exact native prayer alert. */
export function shouldPresentForegroundAdhan(
  settings: PrayerNotifSettings,
  options: {
    notificationsEnabled: boolean;
    prayerTimeMs: number;
    snoozeUntil: number;
    dayOfWeek: number;
  },
): boolean {
  return options.notificationsEnabled &&
    settings.enabled &&
    settings.type === "adhan" &&
    settings.days.includes(options.dayOfWeek) &&
    options.prayerTimeMs >= options.snoozeUntil;
}

export const PRAYER_ARABIC: Record<PrayerKey, string> = {
  fajr:     "الفجر",
  sunrise:  "الشروق",
  dhuhr:    "الظهر",
  asr:      "العصر",
  maghrib:  "المغرب",
  isha:     "العشاء",
  tahajjud: "التهجد",
};

export const PRAYER_EMOJI: Record<PrayerKey, string> = {
  fajr:     "🌙",
  sunrise:  "🌅",
  dhuhr:    "☀️",
  asr:      "🌤",
  maghrib:  "🌇",
  isha:     "🌃",
  tahajjud: "🌌",
};

export interface NotifTypeInfo {
  id: PrayerNotifType;
  label: string;
  icon: string;
  description: string;
}

export const NOTIF_TYPES: NotifTypeInfo[] = [
  { id: "silent",       label: "Silent",       icon: "bell-off",  description: "Banner without sound" },
  { id: "notification", label: "Notification", icon: "bell",      description: "Banner alert with default sound, no adhan" },
  { id: "adhan",        label: "Adhan",        icon: "volume-2",  description: "Adhan alert; full playback while the app is open" },
];

// Offset prayers (Sunrise, Tahajjud) only get silent + notification — there
// is no adhan associated with either event.
export const SUNRISE_NOTIF_TYPES: NotifTypeInfo[] = [
  { id: "silent",       label: "Silent",       icon: "bell-off",  description: "Banner without sound" },
  { id: "notification", label: "Notification", icon: "bell",      description: "Banner alert with default sound" },
];
export const OFFSET_NOTIF_TYPES = SUNRISE_NOTIF_TYPES;

export function formatDays(days: number[]): string {
  if (days.length === 0) return "Never";
  if (days.length === 7) return "Every day";
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "Weekdays";
  if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";
  if (days.length === 1) return DAY_FULL[days[0]];
  return days.map(d => DAY_LABELS[d]).join(", ");
}
