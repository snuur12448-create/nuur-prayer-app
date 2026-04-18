// ─────────────────────────────────────────────────────────────────────────────
// Quran offline cache + smart prefetch
// ─────────────────────────────────────────────────────────────────────────────
//
// Persists per-surah verse text (Arabic + translation + transliteration) and
// word-by-word data into AsyncStorage so the Quran reader works in airplane
// mode, the masjid basement, on the train through a tunnel — anywhere with no
// signal. When the user opens a surah, we silently prefetch the next two so
// they can keep reading without ever hitting the network again.
//
// Sources mirrored:
//   • api.alquran.cloud      → verses (quran-uthmani + en.sahih + en.transliteration)
//   • api.qurancdn.com       → word-by-word morphology
//
// Storage shape:
//   nuur_quran_verses_v2_<n>  → { t: <ms>, d: Verse[] }
//   nuur_quran_words_v2_<n>   → { t: <ms>, d: Record<verseNum, WordInfo[]> }
//
// Cache is treated as fresh forever (the Qur'ān doesn't change) but we still
// stamp the timestamp so we can invalidate later if the schema needs to evolve.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Types (kept loose; the screen owns the canonical shapes) ────────────────

export interface CachedVerse {
  number: number;
  numberInQuran: number;
  text: string;
  translation: string;
  transliteration: string;
}

export interface CachedWord {
  position: number;
  location: string;
  arabic: string;
  transliteration: string;
  meaning: string;
}

export type CachedWordsByVerse = Record<number, CachedWord[]>;

const VERSES_KEY = (n: number) => `nuur_quran_verses_v2_${n}`;
const WORDS_KEY  = (n: number) => `nuur_quran_words_v2_${n}`;

// ── Bismillah stripper (mirrors the screen's logic) ──────────────────────────
// Surahs 1 (Fatiha) keeps Bismillah as the first verse; surah 9 (Tawbah) has
// no Bismillah. For every other surah, the Bismillah is prepended to the first
// verse text by the API and we strip it.
function stripBismillah(text: string, surahNum: number, verseNum: number): string {
  if (surahNum === 1 || surahNum === 9 || verseNum !== 1) return text;
  return text.replace(/^بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/u, "");
}

// ── Read helpers ────────────────────────────────────────────────────────────

export async function getCachedVerses(n: number): Promise<CachedVerse[] | null> {
  try {
    const raw = await AsyncStorage.getItem(VERSES_KEY(n));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; d: CachedVerse[] };
    if (!parsed?.d || !Array.isArray(parsed.d)) return null;
    return parsed.d;
  } catch {
    return null;
  }
}

export async function getCachedWords(n: number): Promise<CachedWordsByVerse | null> {
  try {
    const raw = await AsyncStorage.getItem(WORDS_KEY(n));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; d: CachedWordsByVerse };
    if (!parsed?.d || typeof parsed.d !== "object") return null;
    return parsed.d;
  } catch {
    return null;
  }
}

// ── Network → cache ─────────────────────────────────────────────────────────

async function fetchAndCacheVerses(
  n: number,
  signal?: AbortSignal,
): Promise<CachedVerse[]> {
  const res = await fetch(
    `https://api.alquran.cloud/v1/surah/${n}/editions/quran-uthmani,en.sahih,en.transliteration`,
    { signal },
  );
  const json = await res.json();
  const arabic       = json?.data?.[0]?.ayahs as any[];
  const english      = json?.data?.[1]?.ayahs as any[];
  const transliterat = json?.data?.[2]?.ayahs as any[];
  if (!arabic || !english) throw new Error("bad-verses-response");
  const mapped: CachedVerse[] = arabic.map((a: any, i: number) => ({
    number: a.numberInSurah,
    numberInQuran: a.number,
    text: stripBismillah(a.text, n, a.numberInSurah),
    translation: english[i]?.text ?? "",
    transliteration: transliterat?.[i]?.text ?? "",
  }));
  try {
    await AsyncStorage.setItem(
      VERSES_KEY(n),
      JSON.stringify({ t: Date.now(), d: mapped }),
    );
  } catch { /* storage full or quota — ignore, screen still works */ }
  return mapped;
}

async function fetchAndCacheWords(
  n: number,
  signal?: AbortSignal,
): Promise<CachedWordsByVerse> {
  const res = await fetch(
    `https://api.qurancdn.com/api/qdc/verses/by_chapter/${n}?words=true&word_fields=text_uthmani,transliteration,translation&per_page=300&page=1`,
    { signal },
  );
  const json = await res.json();
  const byVerse: CachedWordsByVerse = {};
  (json.verses ?? []).forEach((v: any) => {
    byVerse[v.verse_number] = (v.words ?? [])
      .filter((w: any) => w.char_type_name === "word")
      .map((w: any) => ({
        position: w.position,
        location: w.location ?? `${n}:${v.verse_number}:${w.position}`,
        arabic: w.text_uthmani ?? w.text ?? "",
        transliteration: w.transliteration?.text ?? "",
        meaning: w.translation?.text ?? "",
      }));
  });
  try {
    await AsyncStorage.setItem(
      WORDS_KEY(n),
      JSON.stringify({ t: Date.now(), d: byVerse }),
    );
  } catch { /* ignore */ }
  return byVerse;
}

// ── Public: fetch with cache ────────────────────────────────────────────────

export async function loadVerses(
  n: number,
  signal?: AbortSignal,
): Promise<CachedVerse[]> {
  const cached = await getCachedVerses(n);
  if (cached) return cached;
  return fetchAndCacheVerses(n, signal);
}

export async function loadWords(
  n: number,
  signal?: AbortSignal,
): Promise<CachedWordsByVerse> {
  const cached = await getCachedWords(n);
  if (cached) return cached;
  return fetchAndCacheWords(n, signal);
}

// ── Smart prefetch (silent, deduped) ────────────────────────────────────────
// When the user opens surah N, we quietly prepare N+1 and N+2 in the
// background. Failures are swallowed — if the user was already offline,
// there's nothing useful to do anyway.

const inFlight = new Set<number>();

async function prefetchOne(n: number): Promise<void> {
  if (n < 1 || n > 114) return;
  if (inFlight.has(n)) return;
  inFlight.add(n);
  try {
    const [haveV, haveW] = await Promise.all([
      getCachedVerses(n),
      getCachedWords(n),
    ]);
    const jobs: Promise<unknown>[] = [];
    if (!haveV) jobs.push(fetchAndCacheVerses(n).catch(() => null));
    if (!haveW) jobs.push(fetchAndCacheWords(n).catch(() => null));
    if (jobs.length) await Promise.all(jobs);
  } finally {
    inFlight.delete(n);
  }
}

/**
 * Quietly cache the next two surahs after `currentSurah` so the next time
 * the user taps "next", the screen is instant — even on a flight or in a
 * masjid basement with no signal.
 *
 * Fire-and-forget; never throws; never blocks the caller.
 */
export function prefetchNextSurahs(currentSurah: number): void {
  // Slight delay so we don't compete with the current surah's network/render.
  setTimeout(() => {
    void prefetchOne(currentSurah + 1);
    // Stagger the second one a touch further so the first finishes first
    // on slow links.
    setTimeout(() => void prefetchOne(currentSurah + 2), 1500);
  }, 1200);
}

// ── Optional: cache stats / clear (useful for a future Settings screen) ─────

export async function getCachedSurahNumbers(): Promise<number[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const nums = new Set<number>();
    for (const k of keys) {
      const m = k.match(/^nuur_quran_verses_v2_(\d+)$/);
      if (m) nums.add(parseInt(m[1], 10));
    }
    return Array.from(nums).sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export async function clearQuranCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter(
      (k) => k.startsWith("nuur_quran_verses_v2_") || k.startsWith("nuur_quran_words_v2_"),
    );
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch { /* ignore */ }
}
