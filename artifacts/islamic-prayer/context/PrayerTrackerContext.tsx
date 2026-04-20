import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const TRACKER_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type TrackerPrayerKey = typeof TRACKER_PRAYERS[number];
export type DayRecord = Partial<Record<TrackerPrayerKey, boolean>>;
export type TrackerData = Record<string, DayRecord>;

const STORAGE_KEY = "nuur_prayer_tracker";

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function countCompleted(record: DayRecord): number {
  return TRACKER_PRAYERS.filter((p) => record[p]).length;
}

interface PrayerTrackerContextValue {
  trackerData: TrackerData;
  loaded: boolean;
  /** Replace the entire dataset (used by tracker screen if needed) */
  setTrackerData: React.Dispatch<React.SetStateAction<TrackerData>>;
  /** Toggle a single prayer's prayed state for a given date (defaults to today). */
  togglePrayer: (prayer: TrackerPrayerKey, dayKey?: string) => void;
  /** Set explicit prayed state. */
  setPrayed: (prayer: TrackerPrayerKey, prayed: boolean, dayKey?: string) => void;
  /** Read prayed state for a given prayer + date (defaults to today). */
  isPrayed: (prayer: TrackerPrayerKey, dayKey?: string) => boolean;
  /** Get the day record (defaults to today). */
  getDayRecord: (dayKey?: string) => DayRecord;
}

const PrayerTrackerContext = createContext<PrayerTrackerContextValue | null>(null);

export function PrayerTrackerProvider({ children }: { children: React.ReactNode }) {
  const [trackerData, setTrackerData] = useState<TrackerData>({});
  const [loaded, setLoaded] = useState(false);

  // Load on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setTrackerData(JSON.parse(raw));
          } catch {
            /* corrupted — start fresh */
          }
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  // Persist on change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trackerData)).catch(() => {});
  }, [trackerData, loaded]);

  const togglePrayer = useCallback((prayer: TrackerPrayerKey, dayKey?: string) => {
    const k = dayKey ?? todayKey();
    setTrackerData((prev) => {
      const day = prev[k] || {};
      return { ...prev, [k]: { ...day, [prayer]: !day[prayer] } };
    });
  }, []);

  const setPrayed = useCallback((prayer: TrackerPrayerKey, prayed: boolean, dayKey?: string) => {
    const k = dayKey ?? todayKey();
    setTrackerData((prev) => {
      const day = prev[k] || {};
      return { ...prev, [k]: { ...day, [prayer]: prayed } };
    });
  }, []);

  const isPrayed = useCallback(
    (prayer: TrackerPrayerKey, dayKey?: string) => {
      const k = dayKey ?? todayKey();
      return !!trackerData[k]?.[prayer];
    },
    [trackerData],
  );

  const getDayRecord = useCallback(
    (dayKey?: string) => trackerData[dayKey ?? todayKey()] || {},
    [trackerData],
  );

  const value = useMemo<PrayerTrackerContextValue>(
    () => ({ trackerData, loaded, setTrackerData, togglePrayer, setPrayed, isPrayed, getDayRecord }),
    [trackerData, loaded, togglePrayer, setPrayed, isPrayed, getDayRecord],
  );

  return <PrayerTrackerContext.Provider value={value}>{children}</PrayerTrackerContext.Provider>;
}

export function usePrayerTracker(): PrayerTrackerContextValue {
  const ctx = useContext(PrayerTrackerContext);
  if (!ctx) throw new Error("usePrayerTracker must be used within PrayerTrackerProvider");
  return ctx;
}
