// ─────────────────────────────────────────────────────────────────────────────
// Tafsir cache — AsyncStorage persistence for whole-surah commentary
// ─────────────────────────────────────────────────────────────────────────────
//
// Mirrors the structure of utils/quranCache.ts:
//   • per-surah keys with the version suffix
//   • {t, d} envelope so we can invalidate later if the schema changes
//   • cache-fall-through loader (loadSurahTafsir) that populates on first read
//   • silent failures on storage write (out-of-quota → still works in-memory)
//
// We chose per-surah caching over per-ayah because the QDC by_chapter endpoint
// returns the entire surah in one round-trip (~50–500KB), and a typical
// reading session opens many ayahs in the same surah. One fetch beats N.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchSurahTafsir, TafsirByAyah } from "./tafsirData";

const TAFSIR_KEY = (n: number) => `nuur_tafsir_ibnkathir_v1_${n}`;
const KEY_PREFIX = "nuur_tafsir_ibnkathir_v1_";

// ── Read ────────────────────────────────────────────────────────────────────

export async function getCachedTafsir(
  surah: number,
): Promise<TafsirByAyah | null> {
  try {
    const raw = await AsyncStorage.getItem(TAFSIR_KEY(surah));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; d: TafsirByAyah };
    if (!parsed?.d || typeof parsed.d !== "object") return null;
    return parsed.d;
  } catch {
    return null;
  }
}

// ── Write ───────────────────────────────────────────────────────────────────

async function writeCache(surah: number, data: TafsirByAyah): Promise<void> {
  try {
    await AsyncStorage.setItem(
      TAFSIR_KEY(surah),
      JSON.stringify({ t: Date.now(), d: data }),
    );
  } catch {
    /* storage full or quota — ignore, sheet still works in-memory */
  }
}

// ── Public: load with cache ─────────────────────────────────────────────────

/**
 * Returns the surah's parsed tafsir, fetching from the network on first call
 * and serving from AsyncStorage thereafter. Throws on first-load failures so
 * the caller can render an error state.
 */
export async function loadSurahTafsir(
  surah: number,
  signal?: AbortSignal,
): Promise<TafsirByAyah> {
  const cached = await getCachedTafsir(surah);
  if (cached) return cached;
  const fresh = await fetchSurahTafsir(surah, signal);
  await writeCache(surah, fresh);
  return fresh;
}

// ── Cache management (for a future Settings → Storage screen) ───────────────

export async function clearTafsirCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(KEY_PREFIX));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch {
    /* ignore */
  }
}
