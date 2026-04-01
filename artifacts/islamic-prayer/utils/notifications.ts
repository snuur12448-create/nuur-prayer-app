import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { calculatePrayerTimes } from "./prayerTimes";
import { getDailyAyahForDate } from "./ayahData";
import { getDailyHadithForDate } from "./hadithData";
import { RAW_EVENTS as ISLAMIC_RAW_EVENTS, hijriToJD, jdToDate, gregorianToHijri } from "./hijriCalendar";

const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

const PRAYER_EMOJI: Record<string, string> = {
  Fajr: "🌙",
  Dhuhr: "🕛",
  Asr: "🕓",
  Maghrib: "🌆",
  Isha: "🌃",
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
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
): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();

  // ── Prayer notifications (next 7 days) ──
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);

    const times = calculatePrayerTimes(lat, lng, tz, targetDate);

    for (const key of PRAYER_KEYS) {
      const prayer = times[key];
      if (prayer.time > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${PRAYER_EMOJI[prayer.name] ?? "🕌"} ${prayer.name} Prayer`,
            body: `It is time for ${prayer.name} in ${city}`,
            sound: true,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: prayer.time },
        });
      }
    }
  }

  // ── Jummah reminder (next 4 Fridays = 28-day scan) ──
  if (jummahEnabled) {
    for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + dayOffset);
      if (targetDate.getDay() !== 5) continue;

      const times = calculatePrayerTimes(lat, lng, tz, targetDate);
      const reminderTime = new Date(
        times.dhuhr.time.getTime() - jummahMinutesBefore * 60_000,
      );
      if (reminderTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Jummah Mubarak 🕌",
            body: `Friday prayer begins soon`,
            sound: true,
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
        await Notifications.scheduleNotificationAsync({
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
        await Notifications.scheduleNotificationAsync({
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
          // Night events: notify at 9pm on the same calendar date
          const nightTime = new Date(eventDateUTC);
          nightTime.setHours(21, 0, 0, 0);
          if (nightTime > now && nightTime.getTime() - now.getTime() <= maxFutureMs) {
            scheduledEventKeys.add(eventKey);
            const emoji = EVENT_EMOJI[event.name] ?? "🌙";
            await Notifications.scheduleNotificationAsync({
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
          // Day events: notify at 7am on the day
          const morningTime = new Date(eventDateUTC);
          morningTime.setHours(7, 0, 0, 0);
          if (morningTime > now && morningTime.getTime() - now.getTime() <= maxFutureMs) {
            scheduledEventKeys.add(eventKey);
            const emoji = EVENT_EMOJI[event.name] ?? "🌙";
            await Notifications.scheduleNotificationAsync({
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

            // Major events also get an evening reminder the night before
            if (MAJOR_EVENTS.has(event.name)) {
              const eveTime = new Date(eventDateUTC);
              eveTime.setDate(eveTime.getDate() - 1);
              eveTime.setHours(20, 0, 0, 0);
              if (eveTime > now && eveTime.getTime() - now.getTime() <= maxFutureMs) {
                await Notifications.scheduleNotificationAsync({
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
