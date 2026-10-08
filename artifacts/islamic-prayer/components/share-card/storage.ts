import AsyncStorage from "@/utils/AppStorage";
import { useEffect, useState, useCallback } from "react";

import { THEMES } from "./themes";
import type { ShareContentKind, ShareThemeId } from "./types";

/**
 * Per-kind storage. The user's last-picked theme is remembered separately
 * for each content kind so a frame chosen for a dua never re-applies to a
 * Quran share, and a midnight chosen for hadith never sneaks into a name
 * share. The legacy single-key value (if any) is migrated transparently
 * the first time the new key is written.
 */
const KIND_KEY = (kind: ShareContentKind) => `nuur:share:lastTheme:${kind}`;
const LEGACY_KEY = "nuur:share:lastTheme";
const ARABIC_KEY  = "nuur:share:showArabic";
const ENGLISH_KEY = "nuur:share:showEnglish";

/**
 * Read/write the user's last manually-picked share theme **for the given
 * content kind**. Returns `null` until the value is loaded, so callers can
 * fall back to auto-select.
 *
 *   const [last, setLast, ready] = useLastShareTheme(kind);
 */
export function useLastShareTheme(
  kind: ShareContentKind,
): [ShareThemeId | null, (id: ShareThemeId) => void, boolean] {
  const [value, setValue] = useState<ShareThemeId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setValue(null);
    setReady(false);

    (async () => {
      try {
        // Prefer the per-kind value; fall back to the legacy single-key
        // value once (so existing users don't lose their preference).
        let raw = await AsyncStorage.getItem(KIND_KEY(kind));
        if (!raw) raw = await AsyncStorage.getItem(LEGACY_KEY);
        if (cancelled) return;
        if (raw && raw in THEMES) setValue(raw as ShareThemeId);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind]);

  const update = useCallback(
    (id: ShareThemeId) => {
      setValue(id);
      AsyncStorage.setItem(KIND_KEY(kind), id).catch(() => {});
    },
    [kind],
  );

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

/**
 * Read/write the user's preference for showing English text (translation,
 * transliteration, source) in the share card. Default is `true`. Persisted
 * across app launches.
 */
export function useShowEnglishInShare(): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState(true);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(ENGLISH_KEY)
      .then((raw) => {
        // Only flip to false when we have an explicit "0" written by the user.
        if (!cancelled && raw === "0") setValue(false);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((next: boolean) => {
    setValue(next);
    AsyncStorage.setItem(ENGLISH_KEY, next ? "1" : "0").catch(() => {});
  }, []);

  return [value, update];
}
