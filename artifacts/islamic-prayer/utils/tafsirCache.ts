// Kept at the existing import path; this is now an ONLINE-ONLY loader.
// Ordinary QF API responses are never written to or restored from storage.
// Offline availability requires approved Content Sync integration.
import { fetchSurahTafsir, type TafsirByAyah } from "./tafsirData";

export async function loadSurahTafsir(
  surah: number,
  signal?: AbortSignal,
): Promise<TafsirByAyah> {
  if (signal?.aborted) throw new Error("tafsir-load-aborted");
  return fetchSurahTafsir(surah, signal);
}
