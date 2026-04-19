import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "nuur_daily_adhkar_v1";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Stored {
  date: string;
  ids: string[];
}

/**
 * Tracks which adhkar IDs the user has marked "recited today". The set is
 * persisted to AsyncStorage and automatically resets at midnight (both via a
 * 60s poll while the app is open and at write time, which is the authoritative
 * check — never trust the in-memory date alone).
 *
 * Race-safety:
 *  - On mount we load persisted IDs and *merge* with any in-memory toggles
 *    that happened before hydration finished, then write the merged set back.
 *    Pre-hydration, doneIds is empty so the only possible user action is an
 *    additive toggle, which makes union-merge correct.
 *  - Every toggle re-validates the current date and resets the in-memory set
 *    if the day has changed since the last persisted snapshot.
 */
export function useDailyAdhkar() {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const lastDateRef = useRef<string>(todayKey());
  const hydratedRef = useRef(false);

  // ---- Hydrate from storage (once) ----
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEY)
      .then((val) => {
        if (cancelled) return;
        const today = todayKey();
        let persisted: string[] = [];
        if (val) {
          try {
            const parsed = JSON.parse(val) as Stored;
            if (parsed.date === today) {
              persisted = parsed.ids ?? [];
            } else {
              // Stored for a different day → drop it.
              AsyncStorage.removeItem(KEY).catch(() => {});
            }
          } catch {
            AsyncStorage.removeItem(KEY).catch(() => {});
          }
        }
        // Merge persisted with anything user toggled before hydration.
        setDoneIds((prev) => {
          if (persisted.length === 0 && prev.size === 0) return prev;
          const merged = new Set<string>(persisted);
          prev.forEach((id) => merged.add(id));
          // Persist the merged result so storage and memory agree.
          AsyncStorage
            .setItem(KEY, JSON.stringify({ date: today, ids: [...merged] } satisfies Stored))
            .catch(() => {});
          return merged;
        });
        lastDateRef.current = today;
        hydratedRef.current = true;
      })
      .catch(() => {
        hydratedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Midnight poll (best-effort while app is foregrounded) ----
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

  // ---- Toggle (authoritative midnight check) ----
  const toggle = useCallback((id: string) => {
    const today = todayKey();
    setDoneIds((prev) => {
      // If the day has rolled over since the last write, start a fresh set.
      const base = lastDateRef.current === today ? prev : new Set<string>();
      lastDateRef.current = today;

      const next = new Set(base);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage
        .setItem(KEY, JSON.stringify({ date: today, ids: [...next] } satisfies Stored))
        .catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const today = todayKey();
    lastDateRef.current = today;
    setDoneIds(new Set());
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  return { doneIds, toggle, reset };
}
