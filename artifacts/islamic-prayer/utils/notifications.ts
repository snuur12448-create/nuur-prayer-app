import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { calculatePrayerTimes } from "./prayerTimes";

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

export async function schedulePrayerNotifications(
  lat: number,
  lng: number,
  tz: number,
  city: string,
  jummahEnabled = false,
  jummahMinutesBefore = 30,
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
      if (targetDate.getDay() !== 5) continue; // skip non-Fridays

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
}

export async function cancelAllPrayerNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
