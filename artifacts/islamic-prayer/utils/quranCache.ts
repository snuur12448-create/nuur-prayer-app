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
//   nuur_quran_verses_v4_<n>  → { v: 4, source, t: <ms>, d: Verse[] }
//   nuur_quran_words_v4_<n>   → { v: 4, source, t: <ms>, d: Record<verseNum, WordInfo[]> }
//
// Every cache and network response is structurally validated before use. Arabic
// must also match the immutable bundled integrity anchor. If the network is
// unavailable or rejected, the reader falls back to the bundled Arabic and
// Sahih International text rather than displaying incomplete content.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getBundledSurahVerses,
  getExpectedVerseCount,
  type QuranIntegrityVerse,
  validateSurahVerses,
} from "./quranIntegrity";

// ── Types (kept loose; the screen owns the canonical shapes) ────────────────

export interface CachedVerse extends QuranIntegrityVerse {}

export interface CachedWord {
  position: number;
  location: string;
  arabic: string;
  transliteration: string;
  meaning: string;
}

export type CachedWordsByVerse = Record<number, CachedWord[]>;

export const QURAN_CACHE_VERSION = 4;
const VERSES_PREFIX = `nuur_quran_verses_v${QURAN_CACHE_VERSION}_`;
const WORDS_PREFIX = `nuur_quran_words_v${QURAN_CACHE_VERSION}_`;
const VERSES_KEY = (n: number) => `${VERSES_PREFIX}${n}`;
const WORDS_KEY  = (n: number) => `${WORDS_PREFIX}${n}`;

interface VerseCachePayload {
  v: number;
  source: "network-validated";
  t: number;
  d: CachedVerse[];
}

interface WordCachePayload {
  v: number;
  source: "quran-foundation-qdc";
  t: number;
  d: CachedWordsByVerse;
}

function validateWordsByVerse(n: number, value: unknown): CachedWordsByVerse {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("bad-words-shape");
  }
  const expectedCount = getExpectedVerseCount(n);
  const input = value as Record<string, unknown>;
  const result: CachedWordsByVerse = {};
  for (let verseNumber = 1; verseNumber <= expectedCount; verseNumber++) {
    const rawWords = input[String(verseNumber)];
    if (!Array.isArray(rawWords) || rawWords.length === 0) {
      throw new Error(`bad-words-verse-${n}-${verseNumber}`);
    }
    result[verseNumber] = rawWords.map((raw, index) => {
      if (!raw || typeof raw !== "object") throw new Error("bad-word-shape");
      const word = raw as Partial<CachedWord>;
      if (!Number.isInteger(word.position) || (word.position as number) < 1) {
        throw new Error("bad-word-position");
      }
      if (typeof word.location !== "string" || !word.location) throw new Error("bad-word-location");
      if (typeof word.arabic !== "string" || !/[\u0600-\u06FF]/u.test(word.arabic)) {
        throw new Error("bad-word-arabic");
      }
      if (typeof word.transliteration !== "string" || typeof word.meaning !== "string") {
        throw new Error("bad-word-translation");
      }
      return {
        position: word.position as number,
        location: word.location,
        arabic: word.arabic.trim(),
        transliteration: word.transliteration.trim(),
        meaning: word.meaning.trim(),
      };
    });
    for (let index = 0; index < result[verseNumber].length; index++) {
      if (result[verseNumber][index].position !== index + 1) {
        throw new Error(`bad-word-order-${n}-${verseNumber}`);
      }
    }
  }
  return result;
}

// ── Read helpers ────────────────────────────────────────────────────────────

export async function getCachedVerses(n: number): Promise<CachedVerse[] | null> {
  const key = VERSES_KEY(n);
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<VerseCachePayload>;
    if (parsed?.v !== QURAN_CACHE_VERSION || parsed.source !== "network-validated") {
      throw new Error("stale-verses-cache");
    }
    return validateSurahVerses(n, parsed.d) as CachedVerse[];
  } catch {
    // Corrupt, partial, or pre-validation cache data must never be displayed.
    await AsyncStorage.removeItem(key).catch(() => {});
    return null;
  }
}

export async function getCachedWords(n: number): Promise<CachedWordsByVerse | null> {
  const key = WORDS_KEY(n);
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WordCachePayload>;
    if (parsed?.v !== QURAN_CACHE_VERSION || parsed.source !== "quran-foundation-qdc") {
      throw new Error("stale-words-cache");
    }
    return validateWordsByVerse(n, parsed.d);
  } catch {
    await AsyncStorage.removeItem(key).catch(() => {});
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
  if (!res.ok) throw new Error(`verses-http-${res.status}`);
  const json = await res.json();
  const arabic       = json?.data?.[0]?.ayahs as unknown;
  const english      = json?.data?.[1]?.ayahs as unknown;
  const transliterat = json?.data?.[2]?.ayahs as unknown;
  const expectedCount = getExpectedVerseCount(n);
  if (
    !Array.isArray(json?.data) || json.data.length !== 3 ||
    json.data[0]?.edition?.identifier !== "quran-uthmani" ||
    json.data[1]?.edition?.identifier !== "en.sahih" ||
    json.data[2]?.edition?.identifier !== "en.transliteration" ||
    !Array.isArray(arabic) || !Array.isArray(english) || !Array.isArray(transliterat) ||
    arabic.length !== expectedCount || english.length !== expectedCount ||
    transliterat.length !== expectedCount
  ) {
    throw new Error("bad-verses-response");
  }
  for (let index = 0; index < expectedCount; index++) {
    const expectedVerse = index + 1;
    const a = arabic[index] as any;
    const e = english[index] as any;
    const t = transliterat[index] as any;
    if (
      a?.numberInSurah !== expectedVerse || e?.numberInSurah !== expectedVerse ||
      t?.numberInSurah !== expectedVerse || e?.number !== a?.number || t?.number !== a?.number
    ) {
      throw new Error("bad-verses-order");
    }
  }
  const mapped = arabic.map((a: any, i: number) => ({
    number: a.numberInSurah,
    numberInQuran: a.number,
    text: a.text,
    translation: (english[i] as any)?.text,
    transliteration: (transliterat[i] as any)?.text,
  }));
  const validated = validateSurahVerses(n, mapped) as CachedVerse[];
  try {
    await AsyncStorage.setItem(
      VERSES_KEY(n),
      JSON.stringify({
        v: QURAN_CACHE_VERSION,
        source: "network-validated",
        t: Date.now(),
        d: validated,
      } satisfies VerseCachePayload),
    );
  } catch { /* storage full or quota — ignore, screen still works */ }
  return validated;
}

async function fetchAndCacheWords(
  n: number,
  signal?: AbortSignal,
): Promise<CachedWordsByVerse> {
  const res = await fetch(
    `https://api.qurancdn.com/api/qdc/verses/by_chapter/${n}?words=true&word_fields=text_uthmani,transliteration,translation&per_page=300&page=1`,
    { signal },
  );
  if (!res.ok) throw new Error(`words-http-${res.status}`);
  const json = await res.json();
  const expectedCount = getExpectedVerseCount(n);
  if (!Array.isArray(json?.verses) || json.verses.length !== expectedCount) {
    throw new Error("bad-words-response");
  }
  const byVerse: CachedWordsByVerse = {};
  json.verses.forEach((v: any, index: number) => {
    if (v?.verse_number !== index + 1 || !Array.isArray(v.words)) {
      throw new Error("bad-words-order");
    }
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
  const validated = validateWordsByVerse(n, byVerse);
  try {
    await AsyncStorage.setItem(
      WORDS_KEY(n),
      JSON.stringify({
        v: QURAN_CACHE_VERSION,
        source: "quran-foundation-qdc",
        t: Date.now(),
        d: validated,
      } satisfies WordCachePayload),
    );
  } catch { /* ignore */ }
  return validated;
}

// ── Public: fetch with cache ────────────────────────────────────────────────

export async function loadVerses(
  n: number,
  signal?: AbortSignal,
): Promise<CachedVerse[]> {
  const cached = await getCachedVerses(n);
  if (cached) return cached;
  try {
    return await fetchAndCacheVerses(n, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    // Reading the Quran must not depend on a mutable network response. The
    // bundled copy is validated on every construction and remains available
    // offline; transliteration is the only field it intentionally lacks.
    return getBundledSurahVerses(n) as CachedVerse[];
  }
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
      const m = k.match(new RegExp(`^${VERSES_PREFIX}(\\d+)$`));
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
      (k) => /^nuur_quran_(verses|words)_v\d+_\d+$/.test(k),
    );
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch { /* ignore */ }
}
