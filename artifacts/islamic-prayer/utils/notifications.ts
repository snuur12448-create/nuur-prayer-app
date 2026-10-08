import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  calculatePrayerTimes, applyPrayerOffsets, DEFAULT_PRAYER_OFFSETS, PrayerOffsets,
  CalcMethodId, MadhabId, HighLatRuleId, PolarResolutionId,
  DEFAULT_CALC_METHOD, DEFAULT_MADHAB, DEFAULT_HIGH_LAT_RULE, DEFAULT_POLAR_RESOLUTION,
  normalizeHighLatRule, normalizePolarResolution,
} from "./prayerTimes";
import { getDailyAyahForDate } from "./ayahData";
import { getDailyHadithForDate } from "./hadithData";
import { RAW_EVENTS as ISLAMIC_RAW_EVENTS, hijriToJD, jdToDate, gregorianToHijri } from "./hijriCalendar";
import { ADHAN_STYLES, getAdhanStyle } from "./adhanData";
import {
  DEFAULT_PRAYER_NOTIF_CONFIG,
  normalizePrayerNotifConfig,
  PrayerNotifConfig,
  PrayerKey,
} from "./prayerNotifData";
import {
  dateByAddingDaysInTimeZone,
  dayOfWeekInTimeZone,
  isValidIanaTimeZone,
  timeZoneOffsetHours,
  type TimeZoneValue,
} from "./timeZone";
import { createLatestOnlyMutationQueue } from "./latestOnlyQueue";
import {
  buildManagedNotificationIdentifier,
  isNuurManagedNotification,
} from "./notificationOwnership";
import { buildPrayerAlertPlan, takeRoundRobin } from "./notificationPlan";

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

// Scheduling is a replace operation (cancel old -> create new). Several UI
// settings can request that operation at nearly the same time, so serialize
// every mutation and coalesce jobs that have not started yet. Without this,
// two calls can interleave their cancel/create phases and leave duplicates or
// a half-empty schedule.
const enqueueLatestNotificationMutation = createLatestOnlyMutationQueue();

async function cancelManagedScheduledNotifications(): Promise<void> {
  let raw: string | null = null;
  try {
    raw = await AsyncStorage.getItem(MANAGED_NOTIFICATION_IDS_KEY);
  } catch {
    // Discovery below is the source of truth. Never delete unrelated app
    // notifications just because the optional ownership cache is unreadable.
  }

  let discoveredIdentifiers: string[] = [];
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    discoveredIdentifiers = pending
      .filter(isNuurManagedNotification)
      .map((request) => request.identifier);
  } catch {
    // We can still cancel identifiers from the persisted cache below.
  }

  let cachedIdentifiers: string[] = [];
  if (raw !== null) {
    try {
      const identifiers = JSON.parse(raw) as unknown;
      if (Array.isArray(identifiers) && identifiers.every((id) => typeof id === "string")) {
        cachedIdentifiers = identifiers;
      }
    } catch {
      // Ignore a corrupt cache; discovered request content is still safe.
    }
  }

  const ownedIdentifiers = Array.from(new Set([...cachedIdentifiers, ...discoveredIdentifiers]));
  const ownedIdentifierSet = new Set(ownedIdentifiers);
  await Promise.allSettled(
    ownedIdentifiers.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );

  // Never build a replacement on top of requests that failed to cancel. A
  // second query distinguishes harmless "already gone" rejections from a
  // real OS cancellation failure that would otherwise cause duplicates.
  let remaining: Notifications.NotificationRequest[] | null = null;
  try {
    remaining = (await Notifications.getAllScheduledNotificationsAsync())
      .filter((request) =>
        ownedIdentifierSet.has(request.identifier) || isNuurManagedNotification(request),
      );
  } catch (error) {
    // A replacement without verification could layer a new queue on top of an
    // unknown legacy queue. Fail visibly and retry later instead.
    throw new Error(
      `Could not verify the existing Nuur notification queue: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (remaining && remaining.length > 0) {
    throw new Error(`Could not remove ${remaining.length} existing Nuur notification(s)`);
  }

  // Mark migration complete before creating the replacement schedule. If the
  // process stops midway, each new request is still discoverable by its v2
  // prefix and `nuurManaged` payload on the next attempt.
  await AsyncStorage.setItem(MANAGED_NOTIFICATION_IDS_KEY, "[]");
  // A cancelled queue is never fresh. Clear this before replacement creation
  // so a failed/aborted rebuild is retried at the next foreground/background
  // opportunity instead of being masked by the previous run's timestamp.
  await AsyncStorage.removeItem(NOTIF_LAST_SCHEDULED_KEY);
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

function permitsNotifications(status: Notifications.NotificationPermissionsStatus): boolean {
  if (status.status === "granted") return true;
  // expo-notifications intentionally reports the general iOS permission as
  // undetermined for provisional/ephemeral authorization, even though iOS is
  // allowed to deliver those notifications. Follow Expo's documented check so
  // we do not disable a working queue after an app upgrade or migration.
  return Platform.OS === "ios" && (
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    status.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

/** Read the current OS permission without showing a prompt. */
export async function getNotificationPermissionState(): Promise<NotifPermissionResult> {
  if (Platform.OS === "web") return "unsupported";
  try {
    const status = await Notifications.getPermissionsAsync();
    if (permitsNotifications(status)) return "granted";
    return status.canAskAgain === false ? "blocked" : "denied";
  } catch {
    return "unsupported";
  }
}

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
  const current = await getNotificationPermissionState();
  if (current === "granted" || current === "blocked" || current === "unsupported") return current;

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
  if (permitsNotifications(next)) return "granted";
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

// iOS hard-limits scheduled local notifications to 64 per app. Nuur normally
// uses at most 60 managed slots, leaving four for its independent test/streak
// reminders. If more unrelated Nuur requests already exist, the managed budget
// shrinks further so the combined queue never exceeds the platform limit.
// Notifications are scheduled in priority order: prayers first, then
// Jummah, Ayah/Hadith, and Islamic events last.
const IOS_PLATFORM_NOTIF_CAP = 64;
const IOS_MANAGED_NOTIF_CAP = 60;
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

  let managedNotificationCap = Number.POSITIVE_INFINITY;
  if (Platform.OS === "ios") {
    let pending: Notifications.NotificationRequest[];
    try {
      pending = await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      throw new Error(
        `Could not inspect the iOS notification budget: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    const unexpectedManaged = pending.filter(isNuurManagedNotification);
    if (unexpectedManaged.length > 0) {
      throw new Error(`Found ${unexpectedManaged.length} Nuur notification(s) after cleanup`);
    }
    managedNotificationCap = Math.max(
      0,
      Math.min(IOS_MANAGED_NOTIF_CAP, IOS_PLATFORM_NOTIF_CAP - pending.length),
    );
  }

  const now = new Date();
  const offsets = prayerOffsets ?? DEFAULT_PRAYER_OFFSETS;
  let scheduled = 0; // running count — stops scheduling when IOS_NOTIF_CAP is reached
  const managedIdentifiers = new Set<string>();

  // Quick-sheet controls — snooze suppresses everything below the timestamp,
  // pre-reminder fires an extra "X in N min" alert before each obligatory prayer.
  const snoozeUntil = await readSnoozeUntil();
  const preReminderMinutes = await readPreReminderMinutes();

  // Helper: schedule one notification and track the count.
  // Returns false if the cap has been reached (caller should stop scheduling).
  const scheduleOne = async (req: Notifications.NotificationRequestInput): Promise<boolean> => {
    if (scheduled >= managedNotificationCap) return false;
    const data = req.content.data as Record<string, unknown> | undefined;
    const trigger = req.trigger as { date?: Date | number } | null;
    const rawDate = trigger?.date;
    const fireTimeMs = rawDate instanceof Date ? rawDate.getTime() : Number(rawDate);
    if (!Number.isFinite(fireTimeMs)) {
      throw new Error("Nuur managed notifications require a concrete date trigger");
    }
    const kind = typeof data?.type === "string" ? data.type : "reminder";
    const key = typeof data?.key === "string" ? data.key : req.content.title ?? kind;
    const identifier = req.identifier ?? buildManagedNotificationIdentifier(kind, key, fireTimeMs);
    await Notifications.scheduleNotificationAsync({
      ...req,
      identifier,
      content: {
        ...req.content,
        // Native iOS serializes a one-shot DATE trigger back as a relative
        // timeInterval, so its original absolute date cannot be recovered by
        // diagnostics. Persist the exact instant in the owned payload.
        data: { ...data, nuurManaged: true, nuurFireTimeMs: fireTimeMs },
      },
    });
    managedIdentifiers.add(identifier);
    scheduled++;
    return true;
  };

  // Optional reminders share the slots left after actual prayers. Queue them
  // by feature and drain round-robin at the end so one enabled feature (for
  // example 15-minute preparation reminders) cannot starve Jummah, Ayah,
  // Hadith, Sunrise, Tahajjud, or an upcoming Islamic event.
  const optionalBuckets = new Map<string, Notifications.NotificationRequestInput[]>();
  const requestFireTimeMs = (request: Notifications.NotificationRequestInput): number => {
    const trigger = request.trigger as { date?: Date | number } | null;
    const value = trigger?.date;
    const fireTimeMs = value instanceof Date ? value.getTime() : Number(value);
    if (!Number.isFinite(fireTimeMs)) {
      throw new Error("Nuur optional reminders require a concrete date trigger");
    }
    return fireTimeMs;
  };
  const queueOptional = (bucket: string, request: Notifications.NotificationRequestInput) => {
    // Snooze is app-wide in the UI, so it must cover every managed category,
    // not only obligatory prayer and Tahajjud alerts.
    if (requestFireTimeMs(request) < snoozeUntil) return;
    const queued = optionalBuckets.get(bucket) ?? [];
    queued.push(request);
    optionalBuckets.set(bucket, queued);
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

  const prayerPlan = buildPrayerAlertPlan(
    dayTimes.flatMap(({ times }, dayIndex) => PRAYER_KEYS.map((key) => {
      const prayer = times[key];
      const cfg = prayerNotifConfig?.[key];
      return {
        dayIndex,
        key,
        fireTimeMs: prayer.time.getTime(),
        dayOfWeek: Number.isNaN(prayer.time.getTime()) ? -1 : dayOfWeekInTimeZone(prayer.time, tz),
        enabled: cfg?.enabled ?? true,
        allowedDays: cfg?.days ?? [0, 1, 2, 3, 4, 5, 6],
      };
    })),
    { nowMs: now.getTime(), snoozeUntil, preReminderMinutes },
  );

  // ── PASS 1 + 2: actual prayers first, preparation reminders second ──
  // buildPrayerAlertPlan guarantees every eligible actual prayer precedes all
  // optional pre-reminders. On iOS, 5 × 10 = 50 primary slots, leaving 10 for
  // the additive reminders without ever replacing the prayer-time alert.
  for (const alert of prayerPlan) {
    const { times } = dayTimes[alert.dayIndex];
    const prayer = times[alert.key];
    const cfg = prayerNotifConfig?.[alert.key];
    const fireDate = new Date(alert.fireTimeMs);

    if (alert.kind === "prayer-pre-reminder") {
      queueOptional("pre-prayer", {
        content: {
          title: `${prayer.name} in ${preReminderMinutes} min${times.polarFallback ? ' · Estimated' : ''}`,
          body: `Prepare for ${prayer.name} prayer at ${prayer.timeString}`,
          sound: true,
          interruptionLevel: "timeSensitive",
          data: { type: "prayer-pre-reminder", key: alert.key },
        },
        trigger: dateTrigger(fireDate, ANDROID_DEFAULT_PRAYER_CHANNEL),
      });
      continue;
    }

    if (cfg) {
      const presentation = resolvePrayerNotificationPresentation(cfg.type, cfg.adhanMode, cfg.adhanStyleId);
      await scheduleOne({
        content: {
          title: `${prayer.name} at ${prayer.timeString}${times.polarFallback ? ' · Estimated' : ''}`,
          body: PRAYER_BODY[prayer.name] ?? `It is time for ${prayer.name} in ${city}`,
          sound: presentation.sound,
          interruptionLevel: "timeSensitive",
          data: {
            type: "prayer",
            key: alert.key,
            notifType: cfg.type,
            adhanStyleId: cfg.adhanStyleId,
            adhanMode: cfg.adhanMode,
          },
        },
        trigger: dateTrigger(fireDate, presentation.androidChannelId),
      });
    } else {
      await scheduleOne({
        content: {
          title: `${prayer.name} at ${prayer.timeString}${times.polarFallback ? ' · Estimated' : ''}`,
          body: PRAYER_BODY[prayer.name] ?? `It is time for ${prayer.name} in ${city}`,
          sound: true,
          interruptionLevel: "timeSensitive",
          data: { type: "prayer", key: alert.key },
        },
        trigger: dateTrigger(fireDate, ANDROID_DEFAULT_PRAYER_CHANNEL),
      });
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
          queueOptional("sunrise", {
          content: {
            title: `Sunrise in ${minutesBefore} minutes${times.polarFallback ? ' · Estimated' : ''}`,
            body: "Fajr time is ending soon. Ensure you have prayed.",
            sound: presentation.sound,
            interruptionLevel: "timeSensitive",
            data: { type: "sunrise-reminder", key: "sunrise" },
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
            queueOptional("tahajjud", {
              content: {
                title: `Tahajjud window in ${minutesBefore} min`,
                body: "The last third of the night is approaching — the most beloved time for night prayer.",
                sound: presentation.sound,
                interruptionLevel: "timeSensitive",
                data: { type: "tahajjud-reminder", key: "tahajjud", notifType: tahajjudCfg.type },
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
        queueOptional("jummah", {
          content: {
            title: "Jummah Mubarak 🕌",
            body: "The best day the sun rises upon is Friday (Abu Dawud). Prayer begins soon.",
            sound: true,
            interruptionLevel: "timeSensitive",
            data: { type: "jummah-reminder", key: "jummah" },
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
        queueOptional("ayah", {
          content: {
            title: "☀️ Ayah of the Day",
            body: `${truncate(ayah.translation, 110)} — ${ayah.surahName} ${ayah.surahNumber}:${ayah.ayahNumber}`,
            sound: false,
            data: { type: "ayah-reminder", key: "ayah" },
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
        queueOptional("hadith", {
          content: {
            title: "📖 Hadith of the Day",
            body: `${truncate(hadith.translation, 110)} — ${hadith.source}`,
            sound: false,
            data: { type: "hadith-reminder", key: "hadith" },
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
            queueOptional("islamic-event", {
              content: {
                title: `${emoji} ${event.name}`,
                body: `${event.arabic} — Seek forgiveness and worship tonight`,
                sound: false,
                data: { type: "islamic-event", key: eventKey },
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
            queueOptional("islamic-event", {
              content: {
                title: `${emoji} ${event.name}`,
                body: event.arabic,
                sound: false,
                data: { type: "islamic-event", key: eventKey },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: morningTime,
              },
            });
            if (MAJOR_EVENTS.has(event.name)) {
              const eveTime = new Date(eventDateUTC);
              eveTime.setDate(eveTime.getDate() - 1);
              eveTime.setHours(20, 0, 0, 0);
              if (eveTime > now && eveTime.getTime() - now.getTime() <= maxFutureMs) {
                queueOptional("islamic-event", {
                  content: {
                    title: `🌙 Tomorrow: ${event.name}`,
                    body: "Prepare your heart, intentions, and du'a",
                    sound: false,
                    data: { type: "islamic-event", key: `${eventKey}-eve` },
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

  const optionalLimit = Platform.OS === "ios"
    ? Math.max(0, managedNotificationCap - scheduled)
    : Number.POSITIVE_INFINITY;
  // Features build their queues independently. Sort each one before fair
  // round-robin draining so a source whose data is not chronological (notably
  // Hijri events and their preceding-evening reminders) offers its nearest
  // delivery first.
  const optionalQueues = [...optionalBuckets.values()].map((bucket) =>
    [...bucket].sort((left, right) => requestFireTimeMs(left) - requestFireTimeMs(right)),
  );
  const optionalPlan = takeRoundRobin(optionalQueues, optionalLimit);
  for (const request of optionalPlan) {
    if (!await scheduleOne(request)) {
      break;
    }
  }

  // Mark this schedule run so the foreground listener can decide when the
  // rolling window has gone stale (see getMillisSinceLastSchedule).
  // Wrapped in try/catch so AsyncStorage failures never bubble up — the
  // notifications themselves were already scheduled successfully above.
  try {
    await AsyncStorage.setItem(MANAGED_NOTIFICATION_IDS_KEY, JSON.stringify([...managedIdentifiers]));
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
      // supplemented by native queue discovery, so this removes everything
      // created before the failed request and lets the next retry start cleanly.
      await cancelManagedScheduledNotifications().catch(() => {});
      throw error;
    }
  });
}

export interface NotificationScheduleStatus {
  permission: NotifPermissionResult;
  configuredEnabled: boolean;
  pendingCount: number;
  managedCount: number;
  actualPrayerCount: number;
  preReminderCount: number;
  duplicateCount: number;
  duplicateGroups: Array<{ label: string; count: number }>;
  scheduledThrough: string | null;
  lastScheduledAt: string | null;
  error: string | null;
}

function notificationTriggerTimeMs(
  trigger: Notifications.NotificationTrigger,
  sampledAtMs: number,
): number | null {
  if (!trigger || typeof trigger !== "object") return null;
  const raw = trigger as unknown as Record<string, unknown>;
  const value = raw.date ?? raw.timestamp ?? raw.value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) {
    // Native serializers have used epoch seconds and epoch milliseconds.
    return value < 10_000_000_000 ? value * 1000 : value;
  }
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : null;
  }

  // A one-shot DATE trigger is currently represented on iOS as a
  // UNTimeIntervalNotificationTrigger. Its serialized `seconds` is relative;
  // this approximation is useful for legacy queues. New Nuur requests carry
  // exact `nuurFireTimeMs` metadata and do not depend on it.
  if (raw.type === "timeInterval" && raw.repeats !== true) {
    const seconds = Number(raw.seconds);
    return Number.isFinite(seconds) ? sampledAtMs + seconds * 1000 : null;
  }

  // Older Expo/iOS versions returned one-shot DATE requests as complete
  // UNCalendarNotificationTrigger components.
  if (raw.type === "calendar" && raw.repeats !== true && raw.dateComponents &&
      typeof raw.dateComponents === "object") {
    const parts = raw.dateComponents as Record<string, unknown>;
    const year = Number(parts.year);
    const month = Number(parts.month);
    const day = Number(parts.day);
    const hour = Number(parts.hour ?? 0);
    const minute = Number(parts.minute ?? 0);
    const second = Number(parts.second ?? 0);
    if ([year, month, day, hour, minute, second].every(Number.isFinite)) {
      const wallTimeMs = Date.UTC(year, month - 1, day, hour, minute, second);
      const zone = parts.timeZone;
      if (typeof zone === "string" && isValidIanaTimeZone(zone)) {
        let instant = new Date(wallTimeMs);
        for (let pass = 0; pass < 2; pass += 1) {
          instant = new Date(wallTimeMs - timeZoneOffsetHours(zone, instant) * 3_600_000);
        }
        return instant.getTime();
      }
      return new Date(year, month - 1, day, hour, minute, second).getTime();
    }
  }
  return null;
}

function notificationFireTimeMs(
  request: Notifications.NotificationRequest,
  sampledAtMs: number,
): number | null {
  const stored = Number(request.content.data?.nuurFireTimeMs);
  return Number.isFinite(stored)
    ? stored
    : notificationTriggerTimeMs(request.trigger, sampledAtMs);
}

/** Read the real device queue for a user-facing diagnostics screen. */
export async function readNotificationScheduleStatus(): Promise<NotificationScheduleStatus> {
  const [permission, configuredRaw, lastScheduledRaw] = await Promise.all([
    getNotificationPermissionState(),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.ENABLED).catch(() => null),
    AsyncStorage.getItem(NOTIF_LAST_SCHEDULED_KEY).catch(() => null),
  ]);
  const base = {
    permission,
    configuredEnabled: configuredRaw === "true",
    pendingCount: 0,
    managedCount: 0,
    actualPrayerCount: 0,
    preReminderCount: 0,
    duplicateCount: 0,
    duplicateGroups: [] as Array<{ label: string; count: number }>,
    scheduledThrough: null as string | null,
    lastScheduledAt: lastScheduledRaw && Number.isFinite(Number(lastScheduledRaw))
      ? new Date(Number(lastScheduledRaw)).toISOString()
      : null,
    error: null as string | null,
  };

  if (Platform.OS === "web") return base;
  let pending: Notifications.NotificationRequest[];
  try {
    pending = await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    return { ...base, error: error instanceof Error ? error.message : String(error) };
  }

  const managed = pending.filter(isNuurManagedNotification);
  const sampledAtMs = Date.now();
  const actual = managed.filter((request) => request.content.data?.type === "prayer");
  const pre = managed.filter((request) => request.content.data?.type === "prayer-pre-reminder");
  const signatures = new Map<string, { label: string; count: number }>();
  for (const request of managed) {
    const data = request.content.data ?? {};
    const fireTime = notificationFireTimeMs(request, sampledAtMs);
    const label = request.content.title ?? `${String(data.type ?? "reminder")} ${String(data.key ?? "")}`.trim();
    const signature = [
      String(data.type ?? "legacy"),
      String(data.key ?? label),
      fireTime ?? JSON.stringify(request.trigger),
      request.content.body ?? "",
    ].join("|");
    const existing = signatures.get(signature);
    signatures.set(signature, { label, count: (existing?.count ?? 0) + 1 });
  }
  const duplicateGroups = [...signatures.values()].filter((group) => group.count > 1);
  const actualTimes = actual
    .map((request) => notificationFireTimeMs(request, sampledAtMs))
    .filter((value): value is number => value !== null);

  return {
    ...base,
    pendingCount: pending.length,
    managedCount: managed.length,
    actualPrayerCount: actual.length,
    preReminderCount: pre.length,
    duplicateCount: duplicateGroups.reduce((total, group) => total + group.count - 1, 0),
    duplicateGroups,
    scheduledThrough: actualTimes.length > 0
      ? new Date(Math.max(...actualTimes)).toISOString()
      : null,
  };
}

export const BACKGROUND_NOTIFICATION_REFRESH_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const PERSISTED_NOTIFICATION_KEYS = {
  LOCATION: "location_data",
  ENABLED: "notifications_enabled",
  CALC_METHOD: "calc_method",
  MADHAB: "madhab",
  HIGH_LAT_RULE: "high_lat_rule",
  POLAR_RESOLUTION: "polar_resolution",
  PRAYER_CONFIG: "prayer_notif_config",
  JUMMAH_ENABLED: "jummah_reminder_enabled",
  JUMMAH_MINUTES: "jummah_minutes_before",
  AYAH_ENABLED: "ayah_reminder_enabled",
  AYAH_HOUR: "ayah_reminder_hour",
  AYAH_MINUTE: "ayah_reminder_minute",
  HADITH_ENABLED: "hadith_reminder_enabled",
  HADITH_HOUR: "hadith_reminder_hour",
  HADITH_MINUTE: "hadith_reminder_minute",
  EVENTS_ENABLED: "islamic_events_reminder",
  PRAYER_OFFSETS: "prayer_offsets",
} as const;

function storedNumber(raw: string | null, fallback: number, min: number, max: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback;
}

function storedDefaultOn(raw: string | null): boolean {
  return raw !== "false";
}

/**
 * Replenish the rolling alert window from persisted settings during an OS
 * background opportunity. iOS decides whether and when that opportunity runs,
 * so this complements (but cannot replace) foreground reconciliation.
 */
export async function refreshPrayerNotificationsFromStorage(
  options: { force?: boolean; maxAgeMs?: number } = {},
): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const enabled = await AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.ENABLED);
  if (enabled !== "true") return false;
  if (await getNotificationPermissionState() !== "granted") return false;

  const maxAgeMs = options.maxAgeMs ?? BACKGROUND_NOTIFICATION_REFRESH_MAX_AGE_MS;
  if (!options.force && await getMillisSinceLastSchedule() < maxAgeMs) return false;

  const [
    locationRaw,
    calcMethodRaw,
    madhabRaw,
    highLatRaw,
    polarRaw,
    prayerConfigRaw,
    jummahRaw,
    jummahMinutesRaw,
    ayahRaw,
    ayahHourRaw,
    ayahMinuteRaw,
    hadithRaw,
    hadithHourRaw,
    hadithMinuteRaw,
    eventsRaw,
    offsetsRaw,
  ] = await Promise.all([
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.LOCATION),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.CALC_METHOD),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.MADHAB),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.HIGH_LAT_RULE),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.POLAR_RESOLUTION),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.PRAYER_CONFIG),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.JUMMAH_ENABLED),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.JUMMAH_MINUTES),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.AYAH_ENABLED),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.AYAH_HOUR),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.AYAH_MINUTE),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.HADITH_ENABLED),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.HADITH_HOUR),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.HADITH_MINUTE),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.EVENTS_ENABLED),
    AsyncStorage.getItem(PERSISTED_NOTIFICATION_KEYS.PRAYER_OFFSETS),
  ]);

  if (!locationRaw) return false;
  let location: { latitude: number; longitude: number; city: string; timezone: TimeZoneValue };
  try {
    location = JSON.parse(locationRaw) as typeof location;
  } catch {
    return false;
  }
  if (!Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90 ||
      !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180 ||
      typeof location.city !== "string" ||
      (typeof location.timezone !== "string" && typeof location.timezone !== "number")) {
    return false;
  }

  let prayerConfig = DEFAULT_PRAYER_NOTIF_CONFIG;
  try {
    prayerConfig = normalizePrayerNotifConfig(prayerConfigRaw ? JSON.parse(prayerConfigRaw) : null);
  } catch {
    prayerConfig = normalizePrayerNotifConfig(null);
  }
  let offsets = DEFAULT_PRAYER_OFFSETS;
  try {
    const parsed = offsetsRaw ? JSON.parse(offsetsRaw) as Partial<PrayerOffsets> : {};
    offsets = { ...DEFAULT_PRAYER_OFFSETS, ...parsed };
  } catch {}

  await schedulePrayerNotifications(
    location.latitude,
    location.longitude,
    location.timezone,
    location.city,
    storedDefaultOn(jummahRaw),
    storedNumber(jummahMinutesRaw, 30, 0, 180),
    storedDefaultOn(ayahRaw),
    storedNumber(ayahHourRaw, 8, 0, 23),
    storedNumber(ayahMinuteRaw, 0, 0, 59),
    storedDefaultOn(hadithRaw),
    storedNumber(hadithHourRaw, 9, 0, 23),
    storedNumber(hadithMinuteRaw, 0, 0, 59),
    storedDefaultOn(eventsRaw),
    prayerConfig,
    offsets,
    (calcMethodRaw as CalcMethodId) || DEFAULT_CALC_METHOD,
    madhabRaw === "Hanafi" ? "Hanafi" : DEFAULT_MADHAB,
    normalizeHighLatRule(highLatRaw),
    normalizePolarResolution(polarRaw),
  );
  return true;
}

export function cancelAllPrayerNotifications(): Promise<void> {
  if (Platform.OS === "web") return Promise.resolve();
  return enqueueLatestNotificationMutation(cancelManagedScheduledNotifications);
}
