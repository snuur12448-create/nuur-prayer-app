import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

import { pushWidgetSnapshot } from "@/utils/nuurBridge";
import {
  applyPrayerOffsets,
  calculatePrayerTimes,
  DEFAULT_CALC_METHOD,
  DEFAULT_HIGH_LAT_RULE,
  DEFAULT_MADHAB,
  DEFAULT_PRAYER_OFFSETS,
  DEFAULT_TIME_FORMAT,
  normalizeHighLatRule,
  normalizePolarResolution,
  type CalcMethodId,
  type HighLatRuleId,
  type MadhabId,
  type PrayerOffsets,
  type TimeFormat,
} from "@/utils/prayerTimes";
import { calculateQiblaDirection } from "@/utils/qibla";
import { buildWidgetPrayerSchedule } from "@/utils/widgetPrayerSchedule";
import type { TimeZoneValue } from "@/utils/timeZone";

const TASK_NAME = "com.nuur.widget-refresh";

const STORAGE_KEYS = {
  LOCATION: "location_data",
  CALC_METHOD: "calc_method",
  MADHAB: "madhab",
  HIGH_LAT_RULE: "high_lat_rule",
  POLAR_RESOLUTION: "polar_resolution",
  TIME_FORMAT: "time_format",
  THEME: "app_theme",
  TRACKER: "nuur_prayer_tracker",
  PRAYER_OFFSETS: "prayer_offsets",
} as const;

const TRACKER_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
type TrackerPrayerKey = typeof TRACKER_PRAYERS[number];
type DayRecord = Partial<Record<TrackerPrayerKey, boolean>>;
type TrackerData = Record<string, DayRecord>;

interface StoredLocation {
  latitude: number;
  longitude: number;
  city: string;
  timezone: TimeZoneValue;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function countCompleted(record: DayRecord): number {
  return TRACKER_PRAYERS.filter((p) => record[p]).length;
}

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

function computeWeekPct(
  trackerData: TrackerData,
  todayPrayerTimes?: { fajr: Date; dhuhr: Date; asr: Date; maghrib: Date; isha: Date },
  now: Date = new Date(),
): number {
  const today = new Date(now);
  let done = 0;
  let total = 0;
  // Past 6 full days: every prayer has occurred.
  for (let i = 1; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const rec = trackerData[dateKey(d)] || {};
    done += countCompleted(rec);
    total += TRACKER_PRAYERS.length;
  }
  // Today: only count prayers whose start time has already passed, so the
  // denominator doesn't punish the user for prayers they couldn't pray yet.
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
    // Fallback when prayer times aren't available — count what's marked done.
    const todayDone = countCompleted(todayRec);
    done += todayDone;
    total += todayDone; // never punish, only credit
  }
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

async function readSnapshotInputs() {
  const [
    locRaw,
    calcRaw,
    madhabRaw,
    highLatRaw,
    polarResolutionRaw,
    timeFmtRaw,
    themeRaw,
    trackerRaw,
    prayerOffsetsRaw,
  ] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.LOCATION),
    AsyncStorage.getItem(STORAGE_KEYS.CALC_METHOD),
    AsyncStorage.getItem(STORAGE_KEYS.MADHAB),
    AsyncStorage.getItem(STORAGE_KEYS.HIGH_LAT_RULE),
    AsyncStorage.getItem(STORAGE_KEYS.POLAR_RESOLUTION),
    AsyncStorage.getItem(STORAGE_KEYS.TIME_FORMAT),
    AsyncStorage.getItem(STORAGE_KEYS.THEME),
    AsyncStorage.getItem(STORAGE_KEYS.TRACKER),
    AsyncStorage.getItem(STORAGE_KEYS.PRAYER_OFFSETS),
  ]);

  let location: StoredLocation | null = null;
  if (locRaw) {
    try { location = JSON.parse(locRaw) as StoredLocation; } catch { /* ignore */ }
  }
  let trackerData: TrackerData = {};
  if (trackerRaw) {
    try { trackerData = JSON.parse(trackerRaw) as TrackerData; } catch { /* ignore */ }
  }
  let prayerOffsets: PrayerOffsets = DEFAULT_PRAYER_OFFSETS;
  if (prayerOffsetsRaw) {
    try {
      prayerOffsets = {
        ...DEFAULT_PRAYER_OFFSETS,
        ...(JSON.parse(prayerOffsetsRaw) as Partial<PrayerOffsets>),
      };
    } catch { /* ignore */ }
  }

  return {
    location,
    calcMethod: (calcRaw as CalcMethodId) || DEFAULT_CALC_METHOD,
    madhab: (madhabRaw as MadhabId) || DEFAULT_MADHAB,
    highLatRule: normalizeHighLatRule(highLatRaw),
    polarResolution: normalizePolarResolution(polarResolutionRaw),
    timeFormat: (timeFmtRaw as TimeFormat) || DEFAULT_TIME_FORMAT,
    themeName: themeRaw || undefined,
    trackerData,
    prayerOffsets,
  };
}

/** Build today's snapshot from persisted state and push it to the widget. */
export async function refreshWidgetSnapshotFromStorage(): Promise<boolean> {
  const inputs = await readSnapshotInputs();
  if (!inputs.location) return false;

  const { latitude, longitude, timezone, city } = inputs.location;
  const today = new Date();
  const todayRaw = calculatePrayerTimes(
    latitude, longitude, timezone, today,
    inputs.calcMethod, inputs.madhab, inputs.highLatRule, inputs.timeFormat, inputs.polarResolution,
  );
  const todayPT = applyPrayerOffsets(
    todayRaw,
    inputs.prayerOffsets,
    timezone,
    inputs.timeFormat,
  );

  const prayerDays = buildWidgetPrayerSchedule({
    latitude,
    longitude,
    timezone,
    startDate: today,
    calcMethod: inputs.calcMethod,
    madhab: inputs.madhab,
    highLatRule: inputs.highLatRule,
    polarResolution: inputs.polarResolution,
    timeFormat: inputs.timeFormat,
    prayerOffsets: inputs.prayerOffsets,
  });
  const todayDay = prayerDays[0];
  const tomorrowDay = prayerDays[1];

  await pushWidgetSnapshot({
    fajr: isoOrEmpty(todayPT.fajr.time),
    sunrise: isoOrEmpty(todayPT.sunrise.time),
    dhuhr: isoOrEmpty(todayPT.dhuhr.time),
    asr: isoOrEmpty(todayPT.asr.time),
    maghrib: isoOrEmpty(todayPT.maghrib.time),
    isha: isoOrEmpty(todayPT.isha.time),
    fajrTomorrow: tomorrowDay?.fajr || isoOrEmpty(new Date(todayPT.fajr.time.getTime() + 86_400_000)),
    prayerDays,
    timeZone: typeof timezone === "string" ? timezone : undefined,
    location: todayPT.polarFallback ? `${city} · Estimated` : city,
    hijri: todayDay.hijri,
    timeFormat: inputs.timeFormat,
    themeName: inputs.themeName,
    qiblaBearing: calculateQiblaDirection(latitude, longitude),
    streakDays: computeStreak(inputs.trackerData),
    weekPct: computeWeekPct(inputs.trackerData, {
      fajr: todayPT.fajr.time,
      dhuhr: todayPT.dhuhr.time,
      asr: todayPT.asr.time,
      maghrib: todayPT.maghrib.time,
      isha: todayPT.isha.time,
    }, today),
    verseAr: todayDay.verseAr,
    verseRef: todayDay.verseRef,
  });
  return true;
}

function isoOrEmpty(date: Date): string {
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

if (!TaskManager.isTaskDefined(TASK_NAME)) {
  TaskManager.defineTask(TASK_NAME, async () => {
    try {
      const ok = await refreshWidgetSnapshotFromStorage();
      return ok
        ? BackgroundFetch.BackgroundFetchResult.NewData
        : BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (e) {
      if (__DEV__) console.warn("[widgetBgTask] failed:", e);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export async function registerWidgetBackgroundTask(): Promise<void> {
  if (Platform.OS !== "ios") return;
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      if (__DEV__) console.log("[widgetBgTask] background fetch unavailable:", status);
      return;
    }
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 60 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    if (__DEV__) console.log("[widgetBgTask] registered");
  } catch (e) {
    if (__DEV__) console.warn("[widgetBgTask] register failed:", e);
  }
}
