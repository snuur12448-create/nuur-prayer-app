import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import integrityModule from "../utils/quranIntegrity.ts";
import audioFallbackModule from "../utils/quranAudioFallback.ts";
import audioDataModule from "../utils/audioData.ts";

const {
  QURAN_SURAH_COUNT,
  QURAN_VERSE_COUNT,
  SURAH_VERSE_COUNTS,
  getBundledSurahVerses,
  getExpectedFirstGlobalVerse,
  normalizeQuranArabic,
  stripBismillah,
  validateBundledQuran,
  validateSurahVerses,
} = integrityModule;
const { getSameReciterAudioCandidates } = audioFallbackModule;
const { RECITERS } = audioDataModule;

validateBundledQuran();
assert.equal(QURAN_SURAH_COUNT, 114);
assert.equal(SURAH_VERSE_COUNTS.length, 114);
assert.equal(SURAH_VERSE_COUNTS.reduce((sum, count) => sum + count, 0), QURAN_VERSE_COUNT);
assert.equal(QURAN_VERSE_COUNT, 6236);

let globalAyah = 1;
const normalizedRows = [];
const normalizedTranslationRows = [];
for (let surah = 1; surah <= QURAN_SURAH_COUNT; surah++) {
  const verses = getBundledSurahVerses(surah);
  assert.equal(verses.length, SURAH_VERSE_COUNTS[surah - 1]);
  assert.equal(verses[0].numberInQuran, getExpectedFirstGlobalVerse(surah));
  for (let index = 0; index < verses.length; index++) {
    const verse = verses[index];
    assert.equal(verse.number, index + 1);
    assert.equal(verse.numberInQuran, globalAyah++);
    normalizedRows.push(`${surah}:${verse.number}:${normalizeQuranArabic(verse.text)}`);
    normalizedTranslationRows.push(
      `${surah}:${verse.number}:${verse.translation.trim().replace(/\s+/g, " ")}`,
    );
  }
}
assert.equal(globalAyah - 1, QURAN_VERSE_COUNT);

// Corrupt/truncated/reordered or Arabic-mismatched content must never pass the
// same validator used for network and cache reads.
const baqarah = getBundledSurahVerses(2);
assert.throws(
  () => validateSurahVerses(2, baqarah.slice(0, -1)),
  (error) => error?.code === "wrong-verse-count",
);
const reordered = baqarah.map((verse) => ({ ...verse }));
[reordered[0], reordered[1]] = [reordered[1], reordered[0]];
assert.throws(
  () => validateSurahVerses(2, reordered),
  (error) => error?.code === "wrong-verse-order",
);
const alteredArabic = baqarah.map((verse) => ({ ...verse }));
alteredArabic[0].text += " ا";
assert.throws(
  () => validateSurahVerses(2, alteredArabic),
  (error) => error?.code === "arabic-mismatch",
);
const missingTranslation = baqarah.map((verse) => ({ ...verse }));
missingTranslation[0].translation = "";
assert.throws(
  () => validateSurahVerses(2, missingTranslation),
  (error) => error?.code === "missing-translation",
);
const alteredTranslation = baqarah.map((verse) => ({ ...verse }));
alteredTranslation[0].translation += " altered";
assert.throws(
  () => validateSurahVerses(2, alteredTranslation),
  (error) => error?.code === "translation-mismatch",
);

const provenanceUrl = new URL("../assets/quran-content-provenance.json", import.meta.url);
const provenance = JSON.parse(await readFile(provenanceUrl, "utf8"));
const bundledBytes = await readFile(new URL("../assets/quranIndex.json", import.meta.url));
assert.equal(
  createHash("sha256").update(bundledBytes).digest("hex"),
  provenance.bundledDataset.rawFileSha256,
  "bundled Quran file checksum must match its provenance record",
);
assert.equal(
  createHash("sha256").update(normalizedRows.join("\n"), "utf8").digest("hex"),
  provenance.bundledDataset.normalizedArabicSha256,
  "normalized Arabic checksum must match its provenance record",
);
assert.equal(
  createHash("sha256").update(normalizedTranslationRows.join("\n"), "utf8").digest("hex"),
  provenance.bundledDataset.normalizedSahihTranslationSha256,
  "normalized Sahih International checksum must match its provenance record",
);
assert.equal(provenance.verificationEvidence.arabicResult.ayahsCompared, QURAN_VERSE_COUNT);
assert.equal(provenance.verificationEvidence.arabicResult.allMatched, true);
assert.equal(
  provenance.verificationEvidence.arabicResult.normalizedSha256,
  provenance.bundledDataset.normalizedArabicSha256,
);
assert.equal(provenance.verificationEvidence.translationResult.ayahsCompared, QURAN_VERSE_COUNT);
assert.equal(provenance.verificationEvidence.translationResult.allMatched, true);
assert.equal(
  provenance.verificationEvidence.translationResult.normalizedSha256,
  provenance.bundledDataset.normalizedSahihTranslationSha256,
);
assert.match(
  provenance.bundledDataset.certificationStatus,
  /not independently scholarly certified/i,
  "provenance must not claim scholarly certification that has not been established",
);

if (process.argv.includes("--live")) {
  const editions = [
    {
      id: "quran-uthmani",
      expectedHash: provenance.bundledDataset.normalizedArabicSha256,
      valueFor: (ayah, surah, verse) => stripBismillah(ayah.text, surah, verse),
    },
    {
      id: "en.sahih",
      expectedHash: provenance.bundledDataset.normalizedSahihTranslationSha256,
      valueFor: (ayah) => String(ayah.text).trim().replace(/\s+/g, " "),
    },
  ];

  for (const edition of editions) {
    const response = await fetch(`https://api.alquran.cloud/v1/quran/${edition.id}`);
    assert.equal(response.ok, true, `${edition.id} provider request failed: ${response.status}`);
    const payload = await response.json();
    assert.equal(payload?.data?.edition?.identifier, edition.id);
    assert.equal(payload?.data?.surahs?.length, QURAN_SURAH_COUNT);
    const rows = [];
    let ayahCount = 0;
    for (const remoteSurah of payload.data.surahs) {
      const bundled = getBundledSurahVerses(remoteSurah.number);
      assert.equal(remoteSurah.ayahs.length, bundled.length);
      for (let index = 0; index < remoteSurah.ayahs.length; index++) {
        const verseNumber = index + 1;
        const remoteValue = edition.valueFor(
          remoteSurah.ayahs[index],
          remoteSurah.number,
          verseNumber,
        );
        const bundledValue = edition.id === "quran-uthmani"
          ? normalizeQuranArabic(bundled[index].text)
          : bundled[index].translation.trim().replace(/\s+/g, " ");
        assert.equal(remoteValue, bundledValue, `${edition.id} mismatch at ${remoteSurah.number}:${verseNumber}`);
        rows.push(`${remoteSurah.number}:${verseNumber}:${remoteValue}`);
        ayahCount += 1;
      }
    }
    assert.equal(ayahCount, QURAN_VERSE_COUNT);
    assert.equal(createHash("sha256").update(rows.join("\n"), "utf8").digest("hex"), edition.expectedHash);
    console.log(`Live provider match passed: ${edition.id}, ${ayahCount} ayahs.`);
  }
}

// Only derive automatic alternatives that keep the selected reciter/edition.
const sudais = RECITERS.find((reciter) => reciter.id === "sudais");
const alafasy = RECITERS.find((reciter) => reciter.id === "alafasy");
assert.ok(sudais && alafasy);
const sudaisCandidates = getSameReciterAudioCandidates(sudais, 1, 1, 1);
assert.ok(sudaisCandidates.length >= 2);
assert.equal(new Set(sudaisCandidates).size, sudaisCandidates.length);
assert.ok(sudaisCandidates.every((url) => url.includes(`/${sudais.edition}/1.mp3`)));
assert.equal(getSameReciterAudioCandidates(alafasy, 1, 1, 1).length, 1);

const cacheSource = await readFile(new URL("../utils/quranCache.ts", import.meta.url), "utf8");
assert.match(cacheSource, /QURAN_CACHE_VERSION = 4/);
assert.match(cacheSource, /validateSurahVerses\(n, parsed\.d\)/, "cached verses must be validated");
assert.match(cacheSource, /validateSurahVerses\(n, mapped\)/, "network verses must be validated");
assert.match(cacheSource, /getBundledSurahVerses\(n\)/, "network failure must have an offline fallback");
assert.match(
  cacheSource,
  /\^nuur_quran_\(verses\|words\)_v\\d\+_\\d\+\$/,
  "cache clearing must cover every versioned Quran cache key",
);

const playerSource = await readFile(new URL("../context/QuranPlayerContext.tsx", import.meta.url), "utf8");
assert.match(
  playerSource,
  /let trackPlayerSetupPromise: Promise<void> \| null = null/,
  "concurrent native setup calls must share one readiness promise",
);
assert.match(
  playerSource,
  /nativeError\?\.code === "player_already_initialized"/,
  "only the native already-initialized setup error may be treated as success",
);
assert.doesNotMatch(
  playerSource,
  /message\.includes\("initialized"\)/,
  "generic initialization failures must not be swallowed",
);
assert.match(playerSource, /await ensureTrackPlayerReady\(\)/, "playback must await native setup");
assert.match(playerSource, /Event\.PlaybackError/, "native stream errors must be observed");
assert.match(playerSource, /recoverFromPlaybackFailure/, "playback errors must enter recovery");
assert.match(playerSource, /retryPlayback/, "the player must expose a user retry action");
assert.match(
  playerSource,
  /generation !== playGenRef\.current/,
  "stale async failures must not replace a newer playback request",
);
assert.match(
  playerSource,
  /handledFailureGenerationRef\.current === generation/,
  "duplicate error callbacks must not consume multiple fallback candidates",
);
assert.match(
  playerSource,
  /lastPlayRequestRef\.current\?\.generation !== generation/,
  "delayed native errors must be tied to the active request generation",
);

console.log(
  "Quran integrity QA passed: 114 surahs / 6236 ayahs, checksums, tamper rejection, cache validation, offline fallback, and playback recovery.",
);
