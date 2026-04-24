import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";

import { THEMES } from "./themes";
import type { ShareThemeId } from "./types";

const STORAGE_KEY = "nuur:share:lastTheme";

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
