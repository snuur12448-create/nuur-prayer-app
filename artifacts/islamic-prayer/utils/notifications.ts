import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  calculatePrayerTimes, applyPrayerOffsets, DEFAULT_PRAYER_OFFSETS, PrayerOffsets,
  CalcMethodId, MadhabId, HighLatRuleId, PolarResolutionId,
  DEFAULT_CALC_METHOD, DEFAULT_MADHAB, DEFAULT_HIGH_LAT_RULE, DEFAULT_POLAR_RESOLUTION,
} from "./prayerTimes";
import { getDailyAyahForDate } from "./ayahData";
import { getDailyHadithForDate } from "./hadithData";
import { RAW_EVENTS as ISLAMIC_RAW_EVENTS, hijriToJD, jdToDate, gregorianToHijri } from "./hijriCalendar";
import { ADHAN_STYLES, getAdhanStyle } from "./adhanData";
import { PrayerNotifConfig, PrayerKey } from "./prayerNotifData";
import {
  dateByAddingDaysInTimeZone,
  dayOfWeekInTimeZone,
  type TimeZoneValue,
} from "./timeZone";

// Storage keys for the home-screen notification quick-sheet controls.
// Read directly inside schedulePrayerNotifications so the existing 8+ callsites
// don't need new arguments — context writes here, scheduler reads here.
export const NOTIF_SNOOZE_UNTIL_KEY = "notif_snooze_until";
export const PRAYER_PRE_REMINDER_KEY = "prayer_pre_reminder_minutes";

// Wall-clock timestamp (ms) of the last successful schedulePrayerNotifications
// call. Used by the AppState foreground listener in AppContext to decide whether
// the rolling notification window needs to be refreshed. Without this,
// users who keep the app installed but rarely open settings will silently run
// out of scheduled notifications when the platform-specific queue drains.
export const NOTIF_LAST_SCHEDULED_KEY = "notif_last_scheduled_at";

// Identifiers created by Nuur's rolling scheduler. Keeping this list lets a
// reschedule replace only Nuur-managed reminders instead of wiping unrelated
// pending notifications (for example a one-off test or streak reminder).
const MANAGED_NOTIFICATION_IDS_KEY = "nuur_managed_notification_ids_v1";
const MANAGED_NOTIFICATION_ID_PREFIX = "nuur-managed-v1-";

// Scheduling is a replace operation (cancel old -> create new). Several UI
// settings can request that operation at nearly the same time, so serialize
// every mutation and coalesce jobs that have not started yet. Without this,
// two calls can interleave their cancel/create phases and leave duplicates or
// a half-empty schedule.
let notificationMutationQueue: Promise<void> = Promise.resolve();
let latestNotificationMutation = 0;

function enqueueLatestNotificationMutation(task: () => Promise<void>): Promise<void> {
  const generation = ++latestNotificationMutation;
  const run = async () => {
    if (generation !== latestNotificationMutation) return;
    await task();
  };
  const result = notificationMutationQueue.then(run, run);
  notificationMutationQueue = result.catch(() => {});
  return result;
}

async function cancelManagedScheduledNotifications(): Promise<void> {
  let raw: string | null = null;
  try {
    raw = await AsyncStorage.getItem(MANAGED_NOTIFICATION_IDS_KEY);
  } catch {
    // If the ownership index cannot be read, a broad cleanup is the only safe
    // way to prevent an old schedule from remaining alongside the new one.
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  let prefixedIdentifiers: string[];
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    prefixedIdentifiers = pending
      .map((request) => request.identifier)
      .filter((id) => id.startsWith(MANAGED_NOTIFICATION_ID_PREFIX));
  } catch {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(MANAGED_NOTIFICATION_IDS_KEY, "[]").catch(() => {});
    return;
  }

  if (raw === null) {
    // One-time migration from releases that did not record identifiers.
    await Notifications.cancelAllScheduledNotificationsAsync();
  } else {
    try {
      const identifiers = JSON.parse(raw) as unknown;
      if (!Array.isArray(identifiers) || identifiers.some((id) => typeof id !== "string")) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      } else {
        const ownedIdentifiers = Array.from(new Set([...identifiers, ...prefixedIdentifiers]));
        await Promise.all(
          ownedIdentifiers.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})),
        );
      }
    } catch {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  // Mark migration complete before creating the replacement schedule. If the
  // process stops midway, every subsequently-created identifier is persisted
  // by scheduleOne below and can be cleaned up on the next attempt.
  await AsyncStorage.setItem(MANAGED_NOTIFICATION_IDS_KEY, "[]");
}

/**
 * Returns the age in ms of the most recent schedule, or Number.POSITIVE_INFINITY
 * if we've never scheduled (or storage is unreadable). Callers use this to
 * decide whether to reschedule on app foreground.
 */
export async function getMillisSinceLastSchedule(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_LAST_SCHEDULED_KEY);
    if (!raw) return Number.POSITIVE_INFINITY;
    const t = Number(raw);
    if (!Number.isFinite(t)) return Number.POSITIVE_INFINITY;
    return Math.max(0, Date.now() - t);
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

async function readSnoozeUntil(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_SNOOZE_UNTIL_KEY);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

async function readPreReminderMinutes(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(PRAYER_PRE_REMINDER_KEY);
    if (!raw) return 0;
    const n = Number(raw);
    return [0, 5, 10, 15].includes(n) ? n : 0;
  } catch {
    return 0;
  }
}

// Only the 5 obligatory prayers go through the per-day scheduling loop.
// Sunrise + Tahajjud are pseudo-prayers and are scheduled in their own
// dedicated blocks below (different time math, no adhan).
type ObligatoryPrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
const PRAYER_KEYS: ObligatoryPrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

// Prayer notifications intentionally use no emojis — keeps the lock-screen
// presentation serious and consistent with established prayer apps.
const PRAYER_BODY: Record<string, string> = {
  Fajr: "The best deed is prayer at its proper time (Bukhari). Rise and pray.",
  Dhuhr: "Beloved to Allah is prayer at its proper time (Muslim). Pray Dhuhr.",
  Asr: "Guard your prayers, especially the middle prayer (Quran 2:238).",
  Maghrib: "The Ummah remains upon goodness by not delaying Maghrib (Ahmad). Pray now.",
  Isha: "Whoever prays Isha in congregation gets the reward of half the night (Muslim).",
};

// Android 8+ locks a channel's sound the first time that channel is created.
// Versioned IDs let an app upgrade move users away from the old single
// default-sound channel without deleting or mutating their OS preferences.
const ANDROID_CHANNEL_VERSION = "v2";
const ANDROID_DEFAULT_PRAYER_CHANNEL = `prayer-reminders-${ANDROID_CHANNEL_VERSION}`;
const ANDROID_SILENT_PRAYER_CHANNEL = `prayer-silent-${ANDROID_CHANNEL_VERSION}`;

function androidAdhanChannelId(styleId: string): string {
  return `prayer-adhan-${ANDROID_CHANNEL_VERSION}-${getAdhanStyle(styleId).id}`;
}

export async function ensureAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  const shared = {
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: false,
  };

  await Notifications.setNotificationChannelAsync(ANDROID_DEFAULT_PRAYER_CHANNEL, {
    ...shared,
    name: "Prayer reminders",
    description: "Prayer times and preparation reminders",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
  });

  await Notifications.setNotificationChannelAsync(ANDROID_SILENT_PRAYER_CHANNEL, {
    ...shared,
    name: "Silent prayer reminders",
    description: "Prayer reminders without sound or vibration",
    importance: Notifications.AndroidImportance.HIGH,
    sound: null,
    enableVibrate: false,
  });

  await Promise.all(ADHAN_STYLES.map(async (style) => {
    await Notifications.setNotificationChannelAsync(androidAdhanChannelId(style.id), {
      ...shared,
      name: `Adhan · ${style.name}`,
      description: `${style.name} Adhan at prayer time`,
      importance: Notifications.AndroidImportance.MAX,
      sound: style.notificationSoundFilename,
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.MUSIC,
      },
    });
  }));
}

export interface PrayerNotificationPresentation {
  sound: boolean | string;
  androidChannelId: string;
}

export function resolvePrayerNotificationPresentation(
  type: "silent" | "notification" | "adhan",
  adhanMode: "full" | "short" | "silent",
  adhanStyleId: string,
): PrayerNotificationPresentation {
  if (type === "silent" || (type === "adhan" && adhanMode === "silent")) {
    return { sound: false, androidChannelId: ANDROID_SILENT_PRAYER_CHANNEL };
  }
  if (type === "notification") {
    return { sound: true, androidChannelId: ANDROID_DEFAULT_PRAYER_CHANNEL };
  }

  const style = getAdhanStyle(adhanStyleId);
  return {
    sound: style.notificationSoundFilename,
    androidChannelId: androidAdhanChannelId(style.id),
  };
}

function dateTrigger(date: Date, androidChannelId?: string): Notifications.DateTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    ...(Platform.OS === "android" && androidChannelId ? { channelId: androidChannelId } : {}),
  };
}

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // When the app is in the foreground, suppress the .caf sound for adhan-type
    // prayer notifications — the in-app adhan watcher handles audio within 15 s
    // of prayer time and we don't want both sounds playing at once.
    // All other notification types (jummah, ayah, hadith, etc.) keep their sound.
    const data = notification.request.content.data as Record<string, unknown> | undefined;
    const isPrayerAdhan = data?.type === "prayer" && data?.notifType === "adhan";
    return {
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: !isPrayerAdhan,
      shouldSetBadge: false,
    };
  },
});

export type NotifPermissionResult = "granted" | "denied" | "blocked" | "unsupported";

export async function requestNotificationPermission(): Promise<boolean> {
  const r = await requestNotificationPermissionDetailed();
  return r === "granted";
}

/**
 * Same as requestNotificationPermission but returns *why* it failed so the UI
 * can show a useful alert instead of silently doing nothing.
 *
 *   "granted"     — permission given, scheduling will work
 *   "denied"      — user dismissed the request this time, can ask again later
 *   "blocked"     — previously denied at the OS level; only Settings can fix
 *   "unsupported" — running on web, or expo-notifications threw (e.g. Expo Go
 *                   on Android since SDK 53 dropped push support). Caller can
 *                   decide whether to still toggle on for local-only behaviour.
 */
export async function requestNotificationPermissionDetailed(): Promise<NotifPermissionResult> {
  if (Platform.OS === "web") return "unsupported";

  if (Platform.OS === "android") {
    try {
      await ensureAndroidNotificationChannels();
    } catch {}
  }

  // expo-notifications can throw inside Expo Go (notably Android since SDK 53
  // removed push support). Treat any throw as "unsupported" so the caller can
  // decide what to do, instead of leaving the toggle stuck in a no-op state.
  let existing: Notifications.NotificationPermissionsStatus;
  try {
    existing = await Notifications.getPermissionsAsync();
  } catch {
    return "unsupported";
  }
  if (existing.status === "granted") return "granted";
  if (existing.canAskAgain === false) return "blocked";

  let next: Notifications.NotificationPermissionsStatus;
  try {
    // Explicitly request all notification permissions so iOS shows the proper
    // dialog and grants Time Sensitive (auto-granted when the app has the
    // com.apple.developer.usernotifications.time-sensitive entitlement).
    next = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowDisplayInCarPlay: false,
        allowCriticalAlerts: false,
        provideAppNotificationSettings: true,
        allowProvisional: false,
      },
    });
  } catch {
    return "unsupported";
  }
  if (next.status === "granted") return "granted";
  if (next.canAskAgain === false) return "blocked";
  return "denied";
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1) + "…";
}

const EVENT_EMOJI: Record<string, string> = {
  "Islamic New Year": "🌙",
  "Day of Ashura": "💧",
  "Mawlid al-Nabi ﷺ": "💛",
  "Laylat al-Mi'raj": "🌟",
  "Laylat al-Bara'ah": "✨",
  "First Day of Ramadan": "🌙",
  "Possible Laylatul Qadr": "✨",
  "Eid ul-Fitr": "🎉",
  "Day of Arafah": "🤲",
  "Eid ul-Adha": "🎉",
};

const MAJOR_EVENTS = new Set([
  "First Day of Ramadan",
  "Eid ul-Fitr",
  "Eid ul-Adha",
  "Day of Arafah",
  "Islamic New Year",
  "Day of Ashura",
]);

// iOS hard-limits scheduled local notifications to 64.
// We use 60 as our cap so a few slots remain for system/other app use.
// Notifications are scheduled in priority order: prayers first, then
// Jummah, Ayah/Hadith, and Islamic events last.
const IOS_NOTIF_CAP = 60;
const IOS_PRAYER_SCHEDULE_DAYS = 10;
const ANDROID_PRAYER_SCHEDULE_DAYS = 30;

async function performPrayerNotificationSchedule(
  lat: number,
  lng: number,
  tz: TimeZoneValue,
  city: string,
  jummahEnabled = false,
  jummahMinutesBefore = 30,
  ayahEnabled = false,
  ayahHour = 8,
  ayahMinute = 0,
  hadithEnabled = false,
  hadithHour = 8,
  hadithMinute = 0,
  islamicEventsEnabled = false,
  prayerNotifConfig?: PrayerNotifConfig,
  prayerOffsets?: PrayerOffsets,
  calcMethodId: CalcMethodId = DEFAULT_CALC_METHOD,
  madhabId: MadhabId = DEFAULT_MADHAB,
  highLatRuleId: HighLatRuleId = DEFAULT_HIGH_LAT_RULE,
  polarResolutionId: PolarResolutionId = DEFAULT_POLAR_RESOLUTION,
): Promise<void> {
  if (Platform.OS === "web") return;
  if (Platform.OS === "android") await ensureAndroidNotificationChannels();
  await cancelManagedScheduledNotifications();

  const now = new Date();
  const scheduleRunId = now.getTime();
  const offsets = prayerOffsets ?? DEFAULT_PRAYER_OFFSETS;
  let scheduled = 0; // running count — stops scheduling when IOS_NOTIF_CAP is reached

  // Quick-sheet controls — snooze suppresses everything below the timestamp,
  // pre-reminder fires an extra "X in N min" alert before each obligatory prayer.
  const snoozeUntil = await readSnoozeUntil();
  const preReminderMinutes = await readPreReminderMinutes();

  // Helper: schedule one notification and track the count.
  // Returns false if the cap has been reached (caller should stop scheduling).
  const scheduleOne = async (req: Notifications.NotificationRequestInput): Promise<boolean> => {
    if (Platform.OS === "ios" && scheduled >= IOS_NOTIF_CAP) return false;
    // A recognizable identifier makes the operation recoverable even if the
    // app is suspended midway: the next run can query and remove every owned
    // request without relying on a storage write after each notification.
    await Notifications.scheduleNotificationAsync({
      ...req,
      identifier: req.identifier ?? `${MANAGED_NOTIFICATION_ID_PREFIX}${scheduleRunId}-${scheduled}`,
    });
    scheduled++;
    return true;
  };

  // Precompute the rolling window so we can schedule in priority passes
  // without recalculating. iOS gets 10 full days of obligatory prayers (50
  // slots, leaving 10 for optional reminders); Android has no 64-slot ceiling
  // and receives a 30-day window.
  const dayTimes: { targetDate: Date; times: ReturnType<typeof applyPrayerOffsets> }[] = [];
  const prayerScheduleDays = Platform.OS === "ios"
    ? IOS_PRAYER_SCHEDULE_DAYS
    : ANDROID_PRAYER_SCHEDULE_DAYS;
  for (let dayOffset = 0; dayOffset < prayerScheduleDays; dayOffset++) {
    const targetDate = dateByAddingDaysInTimeZone(now, tz, dayOffset);
    const raw = calculatePrayerTimes(
      lat, lng, tz, targetDate, calcMethodId, madhabId, highLatRuleId, '12h', polarResolutionId,
    );
    const times = applyPrayerOffsets(raw, offsets, tz, "12h");
    dayTimes.push({ targetDate, times });
  }

  // ── PASS 1: 5 obligatory prayer notifications for every day FIRST ──
  // This is the app's primary reliability contract: the five daily prayers
  // must ALWAYS be scheduled in full, no matter how many optional extras
  // (pre-reminders, ayah, hadith, events) the user has enabled. iOS caps
  // pending notifications at 64 — if we scheduled day-by-day and bundled
  // each day's pre-reminders + sunrise + tahajjud with its prayers, the cap
  // could be hit by day 5, silently dropping Fajr/Dhuhr/etc on days 6-7.
  // On iOS, 5 × 10 = 50 slots — leaves 10 for optional extras.
  for (const { times } of dayTimes) {
    for (const key of PRAYER_KEYS) {
      const prayer = times[key];
      if (Number.isNaN(prayer.time.getTime())) continue;
      if (prayer.time <= now) continue;
      if (snoozeUntil > prayer.time.getTime()) continue;

      const cfg = prayerNotifConfig?.[key];

      if (cfg) {
        if (!cfg.enabled) continue;
        const dow = dayOfWeekInTimeZone(prayer.time, tz);
        if (!cfg.days.includes(dow)) continue;

        const presentation = resolvePrayerNotificationPresentation(cfg.type, cfg.adhanMode, cfg.adhanStyleId);
        await scheduleOne({
          content: {
            title: `${prayer.name} at ${prayer.timeString}${times.polarFallback ? ' · Estimated' : ''}`,
            body: PRAYER_BODY[prayer.name] ?? `It is time for ${prayer.name} in ${city}`,
            sound: presentation.sound,
            interruptionLevel: "timeSensitive",
            data: {
              type: "prayer",
              key,
              notifType: cfg.type,
              adhanStyleId: cfg.adhanStyleId,
              adhanMode: cfg.adhanMode,
            },
          },
          trigger: dateTrigger(prayer.time, presentation.androidChannelId),
        });
      } else {
        await scheduleOne({
          content: {
            title: `${prayer.name} at ${prayer.timeString}${times.polarFallback ? ' · Estimated' : ''}`,
            body: PRAYER_BODY[prayer.name] ?? `It is time for ${prayer.name} in ${city}`,
            sound: true,
            interruptionLevel: "timeSensitive",
            data: { type: "prayer", key },
          },
          trigger: dateTrigger(prayer.time, ANDROID_DEFAULT_PRAYER_CHANNEL),
        });
      }
    }
  }

  // ── PASS 2: Pre-prayer reminders (optional, only if cap allows) ──
  // Fires N minutes before each obligatory prayer. Lower priority than the
  // prayers themselves — gets cut if cap is reached.
  if (preReminderMinutes > 0) {
    for (const { times } of dayTimes) {
      for (const key of PRAYER_KEYS) {
        const prayer = times[key];
        if (Number.isNaN(prayer.time.getTime())) continue;
        const cfg = prayerNotifConfig?.[key];
        if (cfg && !cfg.enabled) continue;
        if (cfg && !cfg.days.includes(dayOfWeekInTimeZone(prayer.time, tz))) continue;

        const reminderTime = new Date(prayer.time.getTime() - preReminderMinutes * 60_000);
        if (reminderTime <= now) continue;
        if (snoozeUntil > reminderTime.getTime()) continue;

        await scheduleOne({
          content: {
            title: `${prayer.name} in ${preReminderMinutes} min${times.polarFallback ? ' · Estimated' : ''}`,
            body: `Prepare for ${prayer.name} prayer at ${prayer.timeString}`,
            sound: true,
            interruptionLevel: "timeSensitive",
            data: { type: "prayer-pre-reminder", key },
          },
          trigger: dateTrigger(reminderTime, ANDROID_DEFAULT_PRAYER_CHANNEL),
        });
      }
    }
  }

  // ── PASS 3: Sunrise + Tahajjud reminders (per-day, lower priority) ──
  for (let dayOffset = 0; dayOffset < dayTimes.length; dayOffset++) {
    const { targetDate, times } = dayTimes[dayOffset];

    // ── Sunrise reminder (X minutes before, if enabled) ──
    const sunriseCfg = prayerNotifConfig?.sunrise;
    if (sunriseCfg?.enabled && !Number.isNaN(times.sunrise.time.getTime())) {
      const minutesBefore = sunriseCfg.minutesBefore ?? 20;
      const reminderTime = new Date(times.sunrise.time.getTime() - minutesBefore * 60_000);
      if (reminderTime > now) {
        const dow = dayOfWeekInTimeZone(reminderTime, tz);
        if (sunriseCfg.days.includes(dow)) {
          const presentation = resolvePrayerNotificationPresentation(
            sunriseCfg.type,
            sunriseCfg.adhanMode,
            sunriseCfg.adhanStyleId,
          );
          await scheduleOne({
            content: {
              title: `Sunrise in ${minutesBefore} minutes${times.polarFallback ? ' · Estimated' : ''}`,
              body: "Fajr time is ending soon. Ensure you have prayed.",
              sound: presentation.sound,
              interruptionLevel: "timeSensitive",
            },
            trigger: dateTrigger(reminderTime, presentation.androidChannelId),
          });
        }
      }
    }

    // ── Tahajjud reminder (X minutes before the last third of the night) ──
    // Last third = Maghrib + (Fajr_next - Maghrib) * 2/3. We use *tomorrow's*
    // Fajr because the night runs from today's Maghrib into tomorrow morning,
    // so the last-third anchor lives in tomorrow's calendar day. The reminder
    // is then placed `minutesBefore` ahead of that anchor so the user has
    // time to do wudu before the window opens.
    const tahajjudCfg = prayerNotifConfig?.tahajjud;
    if (tahajjudCfg?.enabled) {
      const minutesBefore = tahajjudCfg.minutesBefore ?? 30;
      const tomorrow = dateByAddingDaysInTimeZone(targetDate, tz, 1);
      const tomorrowRaw = calculatePrayerTimes(
        lat, lng, tz, tomorrow, calcMethodId, madhabId, highLatRuleId, '12h', polarResolutionId,
      );
      const tomorrowTimes = applyPrayerOffsets(tomorrowRaw, offsets, tz, "12h");
      const maghribMs = times.maghrib.time.getTime();
      const nextFajrMs = tomorrowTimes.fajr.time.getTime();
      if (nextFajrMs > maghribMs) {
        const lastThirdMs = maghribMs + ((nextFajrMs - maghribMs) * 2) / 3;
        const reminderTime = new Date(lastThirdMs - minutesBefore * 60_000);
        if (reminderTime > now && snoozeUntil <= reminderTime.getTime()) {
          const dow = dayOfWeekInTimeZone(reminderTime, tz);
          if (tahajjudCfg.days.includes(dow)) {
            const presentation = resolvePrayerNotificationPresentation(
              tahajjudCfg.type,
              tahajjudCfg.adhanMode,
              tahajjudCfg.adhanStyleId,
            );
            await scheduleOne({
              content: {
                title: `Tahajjud window in ${minutesBefore} min`,
                body: "The last third of the night is approaching — the most beloved time for night prayer.",
                sound: presentation.sound,
                interruptionLevel: "timeSensitive",
                data: { type: "prayer", key: "tahajjud", notifType: tahajjudCfg.type },
              },
              trigger: dateTrigger(reminderTime, presentation.androidChannelId),
            });
          }
        }
      }
    }
  }

  // ── Jummah reminder (next 4 Fridays = 28-day scan) ──
  if (jummahEnabled) {
    for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
      const targetDate = dateByAddingDaysInTimeZone(now, tz, dayOffset);
      if (dayOfWeekInTimeZone(targetDate, tz) !== 5) continue;

      const times = calculatePrayerTimes(
        lat, lng, tz, targetDate, calcMethodId, madhabId, highLatRuleId, '12h', polarResolutionId,
      );
      const reminderTime = new Date(
        times.dhuhr.time.getTime() - jummahMinutesBefore * 60_000,
      );
      if (reminderTime > now) {
        await scheduleOne({
          content: {
            title: "Jummah Mubarak 🕌",
            body: "The best day the sun rises upon is Friday (Abu Dawud). Prayer begins soon.",
            sound: true,
            interruptionLevel: "timeSensitive",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderTime,
          },
        });
      }
    }
  }

  // ── Ayah of the Day (next 7 days) ──
  if (ayahEnabled) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + dayOffset);
      targetDate.setHours(ayahHour, ayahMinute, 0, 0);
      if (targetDate > now) {
        const ayah = getDailyAyahForDate(targetDate);
        await scheduleOne({
          content: {
            title: "☀️ Ayah of the Day",
            body: `${truncate(ayah.translation, 110)} — ${ayah.surahName} ${ayah.surahNumber}:${ayah.ayahNumber}`,
            sound: false,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: targetDate,
          },
        });
      }
    }
  }

  // ── Hadith of the Day (next 7 days) ──
  if (hadithEnabled) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + dayOffset);
      targetDate.setHours(hadithHour, hadithMinute, 0, 0);
      if (targetDate > now) {
        const hadith = getDailyHadithForDate(targetDate);
        await scheduleOne({
          content: {
            title: "📖 Hadith of the Day",
            body: `${truncate(hadith.translation, 110)} — ${hadith.source}`,
            sound: false,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: targetDate,
          },
        });
      }
    }
  }

  // ── Islamic Calendar Events (next ~12 months) ──
  if (islamicEventsEnabled) {
    const { hYear: currentHijriYear } = gregorianToHijri(now);
    const maxFutureMs = 370 * 24 * 60 * 60 * 1000;
    const scheduledEventKeys = new Set<string>();

    for (const yearOffset of [0, 1]) {
      const hijriYear = currentHijriYear + yearOffset;

      for (const event of ISLAMIC_RAW_EVENTS) {
        const eventKey = `${hijriYear}-${event.month}-${event.day}`;
        if (scheduledEventKeys.has(eventKey)) continue;

        const eventDateUTC = jdToDate(hijriToJD(hijriYear, event.month, event.day));
        const isNightEvent = event.name.startsWith("Laylat") || event.name.includes("Laylatul");

        if (isNightEvent) {
          const nightTime = new Date(eventDateUTC);
          nightTime.setHours(21, 0, 0, 0);
          if (nightTime > now && nightTime.getTime() - now.getTime() <= maxFutureMs) {
            scheduledEventKeys.add(eventKey);
            const emoji = EVENT_EMOJI[event.name] ?? "🌙";
            await scheduleOne({
              content: {
                title: `${emoji} ${event.name}`,
                body: `${event.arabic} — Seek forgiveness and worship tonight`,
                sound: false,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: nightTime,
              },
            });
          }
        } else {
          const morningTime = new Date(eventDateUTC);
          morningTime.setHours(7, 0, 0, 0);
          if (morningTime > now && morningTime.getTime() - now.getTime() <= maxFutureMs) {
            scheduledEventKeys.add(eventKey);
            const emoji = EVENT_EMOJI[event.name] ?? "🌙";
            const ok = await scheduleOne({
              content: {
                title: `${emoji} ${event.name}`,
                body: event.arabic,
                sound: false,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: morningTime,
              },
            });
            if (!ok) break; // cap reached — stop scheduling

            if (MAJOR_EVENTS.has(event.name)) {
              const eveTime = new Date(eventDateUTC);
              eveTime.setDate(eveTime.getDate() - 1);
              eveTime.setHours(20, 0, 0, 0);
              if (eveTime > now && eveTime.getTime() - now.getTime() <= maxFutureMs) {
                await scheduleOne({
                  content: {
                    title: `🌙 Tomorrow: ${event.name}`,
                    body: "Prepare your heart, intentions, and du'a",
                    sound: false,
                  },
                  trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: eveTime,
                  },
                });
              }
            }
          }
        }
      }
    }
  }

  // Mark this schedule run so the foreground listener can decide when the
  // rolling window has gone stale (see getMillisSinceLastSchedule).
  // Wrapped in try/catch so AsyncStorage failures never bubble up — the
  // notifications themselves were already scheduled successfully above.
  try {
    await AsyncStorage.setItem(NOTIF_LAST_SCHEDULED_KEY, String(Date.now()));
  } catch {}
}

export function schedulePrayerNotifications(
  ...args: Parameters<typeof performPrayerNotificationSchedule>
): Promise<void> {
  if (Platform.OS === "web") return Promise.resolve();
  return enqueueLatestNotificationMutation(async () => {
    try {
      await performPrayerNotificationSchedule(...args);
    } catch (error) {
      // Never leave a partial rolling schedule behind. The identifier index is
      // updated after each creation, so this removes everything created before
      // the failed request and lets the next foreground retry start cleanly.
      await cancelManagedScheduledNotifications().catch(() => {});
      throw error;
    }
  });
}

export function cancelAllPrayerNotifications(): Promise<void> {
  if (Platform.OS === "web") return Promise.resolve();
  return enqueueLatestNotificationMutation(cancelManagedScheduledNotifications);
}
