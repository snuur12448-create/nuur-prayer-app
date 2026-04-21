import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "nuur_daily_sunnah_v1";
const STREAK_KEY = "nuur_sunnah_streak_v1";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Stored {
  date: string;
  ids: string[];
}

interface StreakStored {
  current: number;
  lastDate: string;
}

/**
 * Tracks which sunnah-prayer IDs the user has marked "prayed today" plus a
 * simple consecutive-day streak. Mirrors useDailyAdhkar's race-safety model:
 * authoritative midnight check on every write, midnight poll while open,
 * union-merge on hydration.
 */
export function useDailySunnah() {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState<number>(0);
  const lastDateRef = useRef<string>(todayKey());

  // Hydrate
  useEffect(() => {
    let cancelled = false;
    Promise.all([AsyncStorage.getItem(KEY), AsyncStorage.getItem(STREAK_KEY)])
      .then(([val, streakVal]) => {
        if (cancelled) return;
        const today = todayKey();
        let persisted: string[] = [];
        if (val) {
          try {
            const parsed = JSON.parse(val) as Stored;
            if (parsed.date === today) {
              persisted = parsed.ids ?? [];
            } else {
              AsyncStorage.removeItem(KEY).catch(() => {});
            }
          } catch {
            AsyncStorage.removeItem(KEY).catch(() => {});
          }
        }
        if (streakVal) {
          try {
            const s = JSON.parse(streakVal) as StreakStored;
            // Keep streak only if last activity was today or yesterday
            if (s.lastDate === today || s.lastDate === yesterdayKey()) {
              setStreak(s.current);
            } else {
              setStreak(0);
              AsyncStorage.removeItem(STREAK_KEY).catch(() => {});
            }
          } catch {
            AsyncStorage.removeItem(STREAK_KEY).catch(() => {});
          }
        }
        setDoneIds((prev) => {
          if (persisted.length === 0 && prev.size === 0) return prev;
          const merged = new Set<string>(persisted);
          prev.forEach((id) => merged.add(id));
          AsyncStorage
            .setItem(KEY, JSON.stringify({ date: today, ids: [...merged] } satisfies Stored))
            .catch(() => {});
          return merged;
        });
        lastDateRef.current = today;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Midnight poll
  useEffect(() => {
    const interval = setInterval(() => {
      const t = todayKey();
      if (t !== lastDateRef.current) {
        lastDateRef.current = t;
        setDoneIds(new Set());
        AsyncStorage.removeItem(KEY).catch(() => {});
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const bumpStreak = useCallback(() => {
    const today = todayKey();
    AsyncStorage.getItem(STREAK_KEY)
      .then((val) => {
        let next = 1;
        if (val) {
          try {
            const s = JSON.parse(val) as StreakStored;
            if (s.lastDate === today) {
              return; // Already counted today
            }
            if (s.lastDate === yesterdayKey()) {
              next = (s.current || 0) + 1;
            } else {
              next = 1;
            }
          } catch {
            next = 1;
          }
        }
        setStreak(next);
        AsyncStorage
          .setItem(STREAK_KEY, JSON.stringify({ current: next, lastDate: today } satisfies StreakStored))
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback((id: string) => {
    const today = todayKey();
    setDoneIds((prev) => {
      const base = lastDateRef.current === today ? prev : new Set<string>();
      lastDateRef.current = today;
      const next = new Set(base);
      const wasEmpty = next.size === 0;
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      AsyncStorage
        .setItem(KEY, JSON.stringify({ date: today, ids: [...next] } satisfies Stored))
        .catch(() => {});
      // First check-in of the day → bump streak
      if (wasEmpty && next.size > 0) {
        bumpStreak();
      }
      return next;
    });
  }, [bumpStreak]);

  return { doneIds, toggle, streak };
}
