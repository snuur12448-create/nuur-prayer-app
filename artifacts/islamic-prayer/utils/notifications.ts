import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { calculatePrayerTimes } from "./prayerTimes";
import { getDailyAyahForDate } from "./ayahData";
import { getDailyHadithForDate } from "./hadithData";

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
}

export async function cancelAllPrayerNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
