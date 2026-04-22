import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  calculatePrayerTimes, applyPrayerOffsets, DEFAULT_PRAYER_OFFSETS, PrayerOffsets,
  CalcMethodId, MadhabId, HighLatRuleId,
  DEFAULT_CALC_METHOD, DEFAULT_MADHAB, DEFAULT_HIGH_LAT_RULE,
} from "./prayerTimes";
import { getDailyAyahForDate } from "./ayahData";
import { getDailyHadithForDate } from "./hadithData";
import { RAW_EVENTS as ISLAMIC_RAW_EVENTS, hijriToJD, jdToDate, gregorianToHijri } from "./hijriCalendar";
import { getAdhanStyle } from "./adhanData";
import { PrayerNotifConfig, PrayerKey } from "./prayerNotifData";

// Storage keys for the home-screen notification quick-sheet controls.
// Read directly inside schedulePrayerNotifications so the existing 8+ callsites
// don't need new arguments — context writes here, scheduler reads here.
export const NOTIF_SNOOZE_UNTIL_KEY = "notif_snooze_until";
export const PRAYER_PRE_REMINDER_KEY = "prayer_pre_reminder_minutes";

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

const PRAYER_EMOJI: Record<string, string> = {
  Fajr: "🌙",
  Dhuhr: "🕛",
  Asr: "🕓",
  Maghrib: "🌆",
  Isha: "🌃",
};

const PRAYER_BODY: Record<string, string> = {
  Fajr: "The best deed is prayer at its proper time (Bukhari). Rise and pray 🌙",
  Dhuhr: "Beloved to Allah is prayer at its proper time (Muslim). Pray Dhuhr ☀️",
  Asr: "Guard your prayers, especially the middle prayer — Quran 2:238 🕌",
  Maghrib: "The Ummah remains upon goodness by not delaying Maghrib (Ahmad). Pray now 🌅",
  Isha: "Whoever prays Isha in congregation gets the reward of half the night (Muslim). Pray Isha 🌙",
};

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

  // Android: create a high-importance channel for prayer notifications so they
  // bypass DND and play their sound at full volume. Channels are idempotent —
  // safe to call on every launch. Without this, Android 8+ defaults all
  // notifications to a low-importance channel that suppresses sound.
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("prayer-times", {
        name: "Prayer Times",
        description: "Adhan and prayer time reminders",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        bypassDnd: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        enableVibrate: true,
        showBadge: false,
      });
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

/**
 * Resolve the iOS notification sound for a prayer based on its per-prayer config.
 *
 * Rules (iOS only — .caf files bundled via expo-notifications plugin):
 *   type === "silent"            → false  (vibrate only, no sound)
 *   type === "notification"      → true   (default system sound)
 *   type === "adhan"
 *     adhanMode === "silent"     → false  (adhan is silenced)
 *     adhanMode === "short"|"full" → "<id>.caf"  (28 s bundled clip)
 *       Full Adhan: notification plays the short clip; foreground still plays
 *       the full streaming adhan via react-native-track-player (unchanged).
 *
 * Android ignores this value and always uses its own channel sound.
 */
function resolveNotifSound(
  type: "silent" | "notification" | "adhan",
  adhanMode: "full" | "short" | "silent",
  adhanStyleId: string,
): boolean | string {
  if (type === "silent") return false;
  if (type === "notification") return true;
  // type === "adhan"
  if (adhanMode === "silent") return false;
  const style = getAdhanStyle(adhanStyleId);
  return style.cafFilename; // e.g. "adhan_makkah.caf"
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

export async function schedulePrayerNotifications(
  lat: number,
  lng: number,
  tz: number,
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
): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
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
    await Notifications.scheduleNotificationAsync(req);
    scheduled++;
    return true;
  };

  // ── Prayer notifications (next 7 days) ──
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);

    const raw = calculatePrayerTimes(lat, lng, tz, targetDate, calcMethodId, madhabId, highLatRuleId);
    const times = applyPrayerOffsets(raw, offsets, tz, "12h");

    for (const key of PRAYER_KEYS) {
      const prayer = times[key];
      if (prayer.time <= now) continue;
      // Snooze: suppress any prayer notification scheduled before the snooze ends.
      if (snoozeUntil > prayer.time.getTime()) continue;

      const cfg = prayerNotifConfig?.[key];

      // If we have per-prayer config, respect it; fall back to plain sound: true
      if (cfg) {
        if (!cfg.enabled) continue;

        // Day-of-week filter
        const dow = prayer.time.getDay();
        if (!cfg.days.includes(dow)) continue;

        // Pre-prayer reminder — fires N minutes before the obligatory prayer.
        // Uses the silent "notification" sound so it doesn't double up with the
        // adhan that follows. Skipped if it would land in the past.
        if (preReminderMinutes > 0) {
          const reminderTime = new Date(prayer.time.getTime() - preReminderMinutes * 60_000);
          if (reminderTime > now && snoozeUntil <= reminderTime.getTime()) {
            await scheduleOne({
              content: {
                title: `⏰ ${prayer.name} in ${preReminderMinutes} min`,
                body: `Prepare for ${prayer.name} prayer at ${prayer.timeString}`,
                sound: true,
                interruptionLevel: "timeSensitive",
                ...(Platform.OS === "android" ? { channelId: "prayer-times" } : {}),
                data: { type: "prayer-pre-reminder", key },
              },
              trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime },
            });
          }
        }

        const sound = resolveNotifSound(cfg.type, cfg.adhanMode, cfg.adhanStyleId);

        await scheduleOne({
          content: {
            title: `${PRAYER_EMOJI[prayer.name] ?? "🕌"} ${prayer.name} at ${prayer.timeString}`,
            body: PRAYER_BODY[prayer.name] ?? `It is time for ${prayer.name} in ${city}`,
            sound,
            interruptionLevel: "timeSensitive",
            // Android: route to the high-importance "prayer-times" channel so
            // the notification bypasses DND and plays sound at full volume.
            // Ignored on iOS.
            ...(Platform.OS === "android" ? { channelId: "prayer-times" } : {}),
            // Structured data used by:
            //  • setNotificationHandler — suppresses .caf when adhan watcher
            //    will play full audio in the foreground
            //  • addNotificationResponseReceivedListener — plays adhan when
            //    user taps the notification to open the app
            data: {
              type: "prayer",
              key,
              notifType: cfg.type,
              adhanStyleId: cfg.adhanStyleId,
              adhanMode: cfg.adhanMode,
            },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: prayer.time },
        });
      } else {
        // Legacy fallback — no config saved yet, use default sound
        await scheduleOne({
          content: {
            title: `${PRAYER_EMOJI[prayer.name] ?? "🕌"} ${prayer.name} at ${prayer.timeString}`,
            body: PRAYER_BODY[prayer.name] ?? `It is time for ${prayer.name} in ${city}`,
            sound: true,
            interruptionLevel: "timeSensitive",
            ...(Platform.OS === "android" ? { channelId: "prayer-times" } : {}),
            data: { type: "prayer", key },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: prayer.time },
        });
      }
    }

    // ── Sunrise reminder (X minutes before, if enabled) ──
    const sunriseCfg = prayerNotifConfig?.sunrise;
    if (sunriseCfg?.enabled) {
      const minutesBefore = sunriseCfg.minutesBefore ?? 20;
      const reminderTime = new Date(times.sunrise.time.getTime() - minutesBefore * 60_000);
      if (reminderTime > now) {
        const dow = reminderTime.getDay();
        if (sunriseCfg.days.includes(dow)) {
          const sound = resolveNotifSound(sunriseCfg.type, sunriseCfg.adhanMode, sunriseCfg.adhanStyleId);
          await scheduleOne({
            content: {
              title: `⏰ Sunrise in ${minutesBefore} minutes`,
              body: "Fajr time is ending soon. Ensure you have prayed ⏰",
              sound,
              interruptionLevel: "timeSensitive",
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime },
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
      const tomorrow = new Date(targetDate);
      tomorrow.setDate(targetDate.getDate() + 1);
      const tomorrowRaw = calculatePrayerTimes(lat, lng, tz, tomorrow, calcMethodId, madhabId, highLatRuleId);
      const tomorrowTimes = applyPrayerOffsets(tomorrowRaw, offsets, tz, "12h");
      const maghribMs = times.maghrib.time.getTime();
      const nextFajrMs = tomorrowTimes.fajr.time.getTime();
      if (nextFajrMs > maghribMs) {
        const lastThirdMs = maghribMs + ((nextFajrMs - maghribMs) * 2) / 3;
        const reminderTime = new Date(lastThirdMs - minutesBefore * 60_000);
        if (reminderTime > now && snoozeUntil <= reminderTime.getTime()) {
          const dow = reminderTime.getDay();
          if (tahajjudCfg.days.includes(dow)) {
            const sound = resolveNotifSound(tahajjudCfg.type, tahajjudCfg.adhanMode, tahajjudCfg.adhanStyleId);
            await scheduleOne({
              content: {
                title: `🌌 Tahajjud window in ${minutesBefore} min`,
                body: "The last third of the night is approaching — the most beloved time for night prayer.",
                sound,
                interruptionLevel: "timeSensitive",
                ...(Platform.OS === "android" ? { channelId: "prayer-times" } : {}),
                data: { type: "prayer", key: "tahajjud", notifType: tahajjudCfg.type },
              },
              trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime },
            });
          }
        }
      }
    }
  }

  // ── Jummah reminder (next 4 Fridays = 28-day scan) ──
  if (jummahEnabled) {
    for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + dayOffset);
      if (targetDate.getDay() !== 5) continue;

      const times = calculatePrayerTimes(lat, lng, tz, targetDate, calcMethodId, madhabId, highLatRuleId);
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
}

export async function cancelAllPrayerNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
