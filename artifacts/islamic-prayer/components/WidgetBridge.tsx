import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { useAppContext } from "@/context/AppContext";
import {
  countCompleted,
  dateKey,
  TRACKER_PRAYERS,
  TrackerData,
  usePrayerTracker,
} from "@/context/PrayerTrackerContext";
import { pushWidgetSnapshot, refreshWeather } from "@/utils/nuurBridge";
import { calculateQiblaDirection } from "@/utils/qibla";
import { buildWidgetPrayerSchedule } from "@/utils/widgetPrayerSchedule";

/** Walk back from today counting consecutive complete days (all 5 prayed).
 *  An incomplete *today* doesn't break the streak — yesterday and earlier do. */
function computeStreak(trackerData: TrackerData): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const rec = trackerData[dateKey(d)] || {};
    const done = countCompleted(rec);
    if (done >= TRACKER_PRAYERS.length) {
      streak++;
    } else {
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

/** Rolling 7-day completion percentage (today + previous 6).
 *  Today's denominator only includes prayers whose start time has passed,
 *  so the % isn't dragged down by future prayers the user couldn't have
 *  prayed yet (e.g. Isha showing as "missed" before Isha's adhan). */
function computeWeekPct(
  trackerData: TrackerData,
  todayPrayerTimes?: { fajr: Date; dhuhr: Date; asr: Date; maghrib: Date; isha: Date },
  now: Date = new Date(),
): number {
  const today = new Date(now);
  let done = 0;
  let total = 0;
  for (let i = 1; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const rec = trackerData[dateKey(d)] || {};
    done += countCompleted(rec);
    total += TRACKER_PRAYERS.length;
  }
  const todayRec = trackerData[dateKey(today)] || {};
  if (todayPrayerTimes) {
    const order: Array<{ key: typeof TRACKER_PRAYERS[number]; t: Date }> = [
      { key: "fajr", t: todayPrayerTimes.fajr },
      { key: "dhuhr", t: todayPrayerTimes.dhuhr },
      { key: "asr", t: todayPrayerTimes.asr },
      { key: "maghrib", t: todayPrayerTimes.maghrib },
      { key: "isha", t: todayPrayerTimes.isha },
    ];
    for (const p of order) {
      if (now.getTime() >= p.t.getTime()) {
        total += 1;
        if (todayRec[p.key]) done += 1;
      }
    }
  } else {
    const todayDone = countCompleted(todayRec);
    done += todayDone;
    total += todayDone;
  }
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

/**
 * Headless component — pushes the prayer-time snapshot (plus tracker stats
 * and the daily verse) to the iOS widget via NuurBridge. Re-runs whenever
 * prayer times, location, or tracker data change.
 */
export function WidgetBridge() {
  const {
    prayerTimes, location, calcMethod, madhab, highLatRule, polarResolution, timeFormat,
    themeName, prayerOffsets,
  } = useAppContext();
  const { trackerData, loaded } = usePrayerTracker();

  // Stash the latest push payload in a ref so the AppState listener can
  // re-push without re-subscribing every time inputs change.
  const pushNowRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!prayerTimes || !location || !loaded) {
      pushNowRef.current = () => {};
      return;
    }

    const buildAndPush = () => {
      const now = new Date();
      const prayerDays = buildWidgetPrayerSchedule({
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        startDate: now,
        calcMethod,
        madhab,
        highLatRule,
        polarResolution,
        timeFormat,
        prayerOffsets,
      });
      const today = prayerDays[0];
      const tomorrow = prayerDays[1];

      pushWidgetSnapshot({
        fajr: isoOrEmpty(prayerTimes.fajr.time),
        sunrise: isoOrEmpty(prayerTimes.sunrise.time),
        dhuhr: isoOrEmpty(prayerTimes.dhuhr.time),
        asr: isoOrEmpty(prayerTimes.asr.time),
        maghrib: isoOrEmpty(prayerTimes.maghrib.time),
        isha: isoOrEmpty(prayerTimes.isha.time),
        fajrTomorrow: tomorrow?.fajr || isoOrEmpty(new Date(prayerTimes.fajr.time.getTime() + 86_400_000)),
        prayerDays,
        location: prayerTimes.polarFallback ? `${location.city} · Estimated` : location.city,
        hijri: today.hijri,
        timeFormat,
        themeName,
        qiblaBearing: calculateQiblaDirection(location.latitude, location.longitude),
        streakDays: computeStreak(trackerData),
        weekPct: computeWeekPct(trackerData, {
          fajr: prayerTimes.fajr.time,
          dhuhr: prayerTimes.dhuhr.time,
          asr: prayerTimes.asr.time,
          maghrib: prayerTimes.maghrib.time,
          isha: prayerTimes.isha.time,
        }, now),
        verseAr: today.verseAr,
        verseRef: today.verseRef,
      });

      // Refresh cached weather alongside each snapshot push. Powers the
      // Verse of the Moment's rain / storm triggers. No-ops silently if
      // WeatherKit entitlement isn't enabled or on non-iOS.
      refreshWeather(location.latitude, location.longitude);
    };

    pushNowRef.current = buildAndPush;
    buildAndPush();
  }, [
    prayerTimes, location, trackerData, loaded,
    calcMethod, madhab, highLatRule, polarResolution, timeFormat, themeName, prayerOffsets,
  ]);

  // Re-push whenever the app comes back to the foreground. Keeps the widget
  // current even if the user only swipes back to Nuur briefly — without
  // depending on iOS's stingy BackgroundFetch scheduler.
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === "active") pushNowRef.current();
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, []);

  return null;
}

function isoOrEmpty(date: Date): string {
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
