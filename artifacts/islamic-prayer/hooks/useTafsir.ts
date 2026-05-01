// ─────────────────────────────────────────────────────────────────────────────
// useTafsir — React hook around the per-surah tafsir cache
// ─────────────────────────────────────────────────────────────────────────────
//
// Loads the requested surah's commentary on mount / surah change, then serves
// per-ayah lookups synchronously from in-memory state. The whole-surah load
// is cached on disk by tafsirCache.ts, so subsequent opens of the same surah
// are instant.
//
// States surfaced to the caller:
//   loading  — first fetch in flight (no cached data available)
//   error    — fetch failed AND nothing cached (caller shows "unavailable")
//   getEntry — synchronous lookup; returns null if this verse has no tafsir
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { loadSurahTafsir } from "@/utils/tafsirCache";
import { TafsirByAyah, TafsirEntry } from "@/utils/tafsirData";

export interface UseTafsirResult {
  loading: boolean;
  error: boolean;
  /** Look up the parsed tafsir for a single ayah. Null = not covered. */
  getEntry: (ayah: number) => TafsirEntry | null;
}

export function useTafsir(surah: number | null | undefined): UseTafsirResult {
  const [data, setData] = useState<TafsirByAyah | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  // Track which surah the current `data` corresponds to so a fast surah swap
  // can't ever surface stale entries.
  const dataSurahRef = useRef<number | null>(null);

  useEffect(() => {
    if (surah == null || surah < 1 || surah > 114) {
      setData(null);
      setLoading(false);
      setError(false);
      dataSurahRef.current = null;
      return;
    }

    // Reset state for the new surah.
    setData(null);
    setError(false);
    setLoading(true);
    dataSurahRef.current = null;

    const ctrl = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const result = await loadSurahTafsir(surah, ctrl.signal);
        if (cancelled) return;
        dataSurahRef.current = surah;
        setData(result);
        setError(false);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [surah]);

  const getEntry = (ayah: number): TafsirEntry | null => {
    // Guard against the rare race where surah just changed and the new fetch
    // hasn't resolved yet.
    if (!data || dataSurahRef.current !== surah) return null;
    return data[ayah] ?? null;
  };

  return { loading, error, getEntry };
}
