import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";

import { THEMES } from "./themes";
import type { ShareThemeId } from "./types";

const STORAGE_KEY = "nuur:share:lastTheme";
const ARABIC_KEY  = "nuur:share:showArabic";

/**
 * Read/write the user's last manually-picked share theme. Returns `null`
 * until the value is loaded, so callers can fall back to auto-select.
 *
 *   const [last, setLast, ready] = useLastShareTheme();
 */
export function useLastShareTheme(): [
  ShareThemeId | null,
  (id: ShareThemeId) => void,
  boolean,
] {
  const [value, setValue] = useState<ShareThemeId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw && raw in THEMES) setValue(raw as ShareThemeId);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((id: ShareThemeId) => {
    setValue(id);
    AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
  }, []);

  return [value, update, ready];
}

/**
 * Read/write the user's preference for showing Arabic text in the share card.
 * Default is `false` (English only). Persisted across app launches.
 */
export function useShowArabicInShare(): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(ARABIC_KEY)
      .then((raw) => {
        if (!cancelled && raw === "1") setValue(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((next: boolean) => {
    setValue(next);
    AsyncStorage.setItem(ARABIC_KEY, next ? "1" : "0").catch(() => {});
  }, []);

  return [value, update];
}
