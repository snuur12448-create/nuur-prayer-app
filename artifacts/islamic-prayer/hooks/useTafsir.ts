// Commentary is online-only until approved Quran Foundation Content Sync access.
// In-memory content lasts only while the reader sheet is open.
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadSurahTafsir } from "@/utils/tafsirCache";
import type { TafsirByAyah, TafsirEntry } from "@/utils/tafsirData";
import { createOnlineContentLoader, type OnlineContentState } from "@/utils/wordByWordLoader";

export interface UseTafsirResult {
  loading: boolean;
  error: boolean;
  getEntry: (ayah: number) => TafsirEntry | null;
  retry: () => void;
}

export function useTafsir(surah: number | null | undefined): UseTafsirResult {
  const [state, setState] = useState<OnlineContentState<TafsirByAyah>>({ status: "idle" });
  const loader = useMemo(() => createOnlineContentLoader(loadSurahTafsir, setState), []);
  const activeSurah = Number.isInteger(surah) && surah! >= 1 && surah! <= 114 ? surah! : null;
  useEffect(() => {
    if (activeSurah) loader.start(activeSurah);
    else setState({ status: "idle" });
    return () => loader.cancel();
  }, [activeSurah, loader]);
  const current = "surahNumber" in state && state.surahNumber === activeSurah;
  const getEntry = (ayah: number): TafsirEntry | null => current && state.status === "ready" ? state.result[ayah] ?? null : null;
  const retry = useCallback(() => { if (activeSurah) loader.start(activeSurah); }, [activeSurah, loader]);
  return {
    loading: activeSurah !== null && (!current || state.status === "loading"),
    error: current && state.status === "error",
    getEntry,
    retry,
  };
}
