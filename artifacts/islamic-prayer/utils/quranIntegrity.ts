// Quran content integrity helpers.
//
// The bundled quranIndex.json is an offline continuity and integrity anchor:
// network/cache data must match its Arabic text exactly after deterministic
// normalisation. Its historical upstream provenance was not recorded, so this
// module deliberately does not describe it as independently certified. See
// assets/quran-content-provenance.json for the release-facing record.

export interface QuranIntegrityVerse {
  number: number;
  numberInQuran: number;
  text: string;
  translation: string;
  transliteration: string;
}

type BundledQuranRow = [
  surahNumber: number,
  verseNumber: number,
  arabic: string,
  translation: string,
];

const BUNDLED_QURAN_ROWS = require("../assets/quranIndex.json") as BundledQuranRow[];

/** Standard Hafs verse numbering used by the bundled Uthmani reader. */
export const SURAH_VERSE_COUNTS = Object.freeze([
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
]);

export const QURAN_SURAH_COUNT = 114;
export const QURAN_VERSE_COUNT = 6236;

export type QuranIntegrityErrorCode =
  | "invalid-surah"
  | "invalid-shape"
  | "wrong-verse-count"
  | "wrong-verse-order"
  | "wrong-global-order"
  | "missing-arabic"
  | "missing-translation"
  | "arabic-mismatch"
  | "translation-mismatch";

export class QuranIntegrityError extends Error {
  constructor(
    public readonly code: QuranIntegrityErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "QuranIntegrityError";
  }
}

export function getExpectedVerseCount(surahNumber: number): number {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > QURAN_SURAH_COUNT) {
    throw new QuranIntegrityError("invalid-surah", `Invalid surah number: ${surahNumber}`);
  }
  return SURAH_VERSE_COUNTS[surahNumber - 1];
}

export function getExpectedFirstGlobalVerse(surahNumber: number): number {
  getExpectedVerseCount(surahNumber);
  let first = 1;
  for (let i = 0; i < surahNumber - 1; i++) first += SURAH_VERSE_COUNTS[i];
  return first;
}

/** Remove only transport/serialization differences, never Quranic letters. */
export function normalizeQuranArabic(text: string): string {
  return text
    .replace(/^\uFEFF/, "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");
}

// Surah 1 keeps Bismillah as ayah 1; surah 9 has no Bismillah. AlQuran Cloud
// prepends it to the first ayah of other surahs, while Nuur renders it as a
// separate heading. Strip only when the fourth word is recognisably ar-Rahim.
export function stripBismillah(text: string, surahNumber: number, verseNumber: number): string {
  const normalized = normalizeQuranArabic(text);
  if (surahNumber === 1 || surahNumber === 9 || verseNumber !== 1) return normalized;
  const words = normalized.split(/\s+/);
  if (words.length < 5) return normalized;
  const stripDiacritics = (value: string) =>
    value.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
  if (!/رحيم/.test(stripDiacritics(words[3]))) return normalized;
  const rest = words.slice(4).join(" ").trim();
  return rest || normalized;
}

function buildBundledSurahUnchecked(surahNumber: number): QuranIntegrityVerse[] {
  const firstGlobal = getExpectedFirstGlobalVerse(surahNumber);
  return BUNDLED_QURAN_ROWS
    .filter((row) => row[0] === surahNumber)
    .map((row, index) => ({
      number: row[1],
      numberInQuran: firstGlobal + index,
      text: stripBismillah(row[2], surahNumber, row[1]),
      translation: typeof row[3] === "string" ? row[3].trim() : "",
      transliteration: "",
    }));
}

export interface ValidateSurahOptions {
  /** Disable only when validating the bundled anchor itself. */
  compareArabicWithBundle?: boolean;
}

/**
 * Validate exact verse count, local/global order, schema, and Arabic content.
 * Returns a fresh normalised array so malformed cache objects are never passed
 * through by reference.
 */
export function validateSurahVerses(
  surahNumber: number,
  value: unknown,
  options: ValidateSurahOptions = {},
): QuranIntegrityVerse[] {
  const expectedCount = getExpectedVerseCount(surahNumber);
  if (!Array.isArray(value)) {
    throw new QuranIntegrityError("invalid-shape", `Surah ${surahNumber} is not an array`);
  }
  if (value.length !== expectedCount) {
    throw new QuranIntegrityError(
      "wrong-verse-count",
      `Surah ${surahNumber} expected ${expectedCount} verses, received ${value.length}`,
    );
  }

  const firstGlobal = getExpectedFirstGlobalVerse(surahNumber);
  const bundled = options.compareArabicWithBundle === false
    ? null
    : buildBundledSurahUnchecked(surahNumber);

  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object") {
      throw new QuranIntegrityError("invalid-shape", `Surah ${surahNumber}:${index + 1} is not an object`);
    }
    const verse = raw as Partial<QuranIntegrityVerse>;
    const expectedNumber = index + 1;
    const expectedGlobal = firstGlobal + index;
    if (verse.number !== expectedNumber) {
      throw new QuranIntegrityError(
        "wrong-verse-order",
        `Surah ${surahNumber} expected verse ${expectedNumber}, received ${String(verse.number)}`,
      );
    }
    if (verse.numberInQuran !== expectedGlobal) {
      throw new QuranIntegrityError(
        "wrong-global-order",
        `Surah ${surahNumber}:${expectedNumber} expected global ayah ${expectedGlobal}`,
      );
    }
    if (typeof verse.text !== "string") {
      throw new QuranIntegrityError("missing-arabic", `Missing Arabic at ${surahNumber}:${expectedNumber}`);
    }
    const text = stripBismillah(verse.text, surahNumber, expectedNumber);
    if (!text || !/[\u0600-\u06FF]/u.test(text)) {
      throw new QuranIntegrityError("missing-arabic", `Invalid Arabic at ${surahNumber}:${expectedNumber}`);
    }
    if (typeof verse.translation !== "string" || !verse.translation.trim()) {
      throw new QuranIntegrityError("missing-translation", `Missing translation at ${surahNumber}:${expectedNumber}`);
    }
    if (bundled && normalizeQuranArabic(text) !== normalizeQuranArabic(bundled[index].text)) {
      throw new QuranIntegrityError(
        "arabic-mismatch",
        `Arabic text did not match the bundled integrity anchor at ${surahNumber}:${expectedNumber}`,
      );
    }
    const translation = verse.translation.trim().replace(/\s+/g, " ");
    if (
      bundled &&
      translation !== bundled[index].translation.trim().replace(/\s+/g, " ")
    ) {
      throw new QuranIntegrityError(
        "translation-mismatch",
        `Translation did not match the bundled Sahih International anchor at ${surahNumber}:${expectedNumber}`,
      );
    }
    if (typeof verse.transliteration !== "string") {
      throw new QuranIntegrityError("invalid-shape", `Invalid transliteration at ${surahNumber}:${expectedNumber}`);
    }
    return {
      number: expectedNumber,
      numberInQuran: expectedGlobal,
      text,
      translation,
      transliteration: verse.transliteration.trim(),
    };
  });
}

/** Guaranteed local fallback: no network, cache, or mutable remote dependency. */
export function getBundledSurahVerses(surahNumber: number): QuranIntegrityVerse[] {
  return validateSurahVerses(
    surahNumber,
    buildBundledSurahUnchecked(surahNumber),
    { compareArabicWithBundle: false },
  );
}

/** Test/release helper for validating the full bundled dataset at once. */
export function validateBundledQuran(): void {
  if (BUNDLED_QURAN_ROWS.length !== QURAN_VERSE_COUNT) {
    throw new QuranIntegrityError(
      "wrong-verse-count",
      `Bundled Quran expected ${QURAN_VERSE_COUNT} verses, received ${BUNDLED_QURAN_ROWS.length}`,
    );
  }
  for (let surah = 1; surah <= QURAN_SURAH_COUNT; surah++) {
    getBundledSurahVerses(surah);
  }
}
