import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import loaderModule from "../utils/wordByWordLoader.ts";

const { createWordByWordLoader } = loaderModule;
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const result = { words: { 1: [] }, storage: "session-only" };
const requests = [];
const states = [];
const loader = createWordByWordLoader((surahNumber, signal) => {
  const request = { ...deferred(), surahNumber, signal };
  requests.push(request);
  return request.promise;
}, (state) => states.push(state));

loader.start(1);
await tick();
assert.equal(states.at(-1).status, "loading");
requests[0].reject(new TypeError("Network request failed"));
await tick();
assert.equal(states.at(-1).status, "error", "offline must produce a visible error");
loader.start(1);
await tick();
requests[1].resolve(result);
await tick();
assert.equal(states.at(-1).status, "ready", "retry must recover");
assert.equal(states.at(-1).result.storage, "session-only");

loader.start(2);
await tick();
loader.start(3);
await tick();
assert.equal(requests[2].signal.aborted, true);
requests[3].resolve(result);
await tick();
requests[2].resolve(result); // a response may complete despite cancellation
await tick();
assert.equal(states.at(-1).surahNumber, 3, "late old surah must not replace new text");
assert.equal(states.at(-1).result.storage, "session-only", "ordinary QF responses must not claim offline availability");
loader.start(4);
await tick();
loader.cancel();
const stateCount = states.length;
requests[4].resolve(result);
await tick();
assert.equal(states.length, stateCount, "unmounted or toggled-off reader must not update");
assert.equal(requests[4].signal.aborted, true);
loader.start(5);
loader.cancel();
await tick();
assert.equal(requests.length, 5, "cancel before asynchronous work starts must avoid downloading");

const timeoutStates = [];
let timeoutSignal;
const hanging = deferred();
const timeoutLoader = createWordByWordLoader((_n, signal) => {
  timeoutSignal = signal;
  return hanging.promise;
}, (state) => timeoutStates.push(state), 5);
timeoutLoader.start(108);
await new Promise((resolve) => setTimeout(resolve, 20));
assert.equal(timeoutStates.at(-1).status, "error", "hung request must offer retry");
assert.equal(timeoutSignal.aborted, true);
hanging.resolve(result);
await tick();
assert.equal(timeoutStates.at(-1).status, "error", "timed-out result must be ignored");
timeoutLoader.cancel();

// Exercise real online loaders and legacy purge with deterministic storage/network.
const runtimeRequire = createRequire(import.meta.url);
const NodeModule = runtimeRequire("node:module");
const originalLoad = NodeModule._load;
const originalFetch = globalThis.fetch;
const storage = new Map([
  ["nuur_quran_words_v3_108", "legacy"],
  ["nuur_quran_words_v4_108", "legacy"],
  ["nuur_tafsir_ibnkathir_v1_108", "legacy"],
  ["nuur_saved_ayahs", '["108:1"]'],
  ["nuur_quran_verses_v4_108", "AlQuran Cloud text"],
  ["nuur_prayer_tracker", "worship history"],
  ["nuur_quran_words_v4_108_backup", "unrelated key must remain"],
]);
let storageReads = 0;
let storageWrites = 0;
let failRemoval = false;
const storageMock = {
  async getItem(key) { storageReads++; return storage.get(key) ?? null; },
  async setItem(key, value) { storageWrites++; storage.set(key, value); },
  async removeItem(key) { storage.delete(key); },
  async getAllKeys() { return [...storage.keys()]; },
  async multiRemove(keys) { if (failRemoval) throw new Error("storage unavailable"); for (const key of keys) storage.delete(key); },
};
NodeModule._load = function (name, parent, isMain) {
  if (name === "@react-native-async-storage/async-storage") return storageMock;
  return originalLoad.apply(this, arguments);
};
let cache, tafsir, qfCache;
try {
  cache = runtimeRequire("../utils/quranCache.ts");
  tafsir = runtimeRequire("../utils/tafsirCache.ts");
  qfCache = runtimeRequire("../utils/quranFoundationCache.ts");
}
finally { NodeModule._load = originalLoad; }
const networkWords = {
  verses: [1, 2, 3].map((verse_number) => ({ verse_number, words: [{
    char_type_name: "word", position: 1, location: `108:${verse_number}:1`,
    text_uthmani: "قُلْ", translation: { text: "Say" }, transliteration: { text: "qul" },
  }] })),
};
try {
  globalThis.fetch = async () => { throw new TypeError("offline"); };
  await assert.rejects(cache.loadWordsWithStatus(108), /offline/);
  await assert.rejects(tafsir.loadSurahTafsir(108), /offline/);
  assert.equal(storageReads, 0, "neither loader may reuse a legacy durable QF cache");
  globalThis.fetch = async () => ({ ok: true, json: async () => networkWords });
  const downloaded = await cache.loadWordsWithStatus(108);
  assert.equal(downloaded.storage, "session-only");
  assert.equal(Object.keys(downloaded.words).length, 3);
  globalThis.fetch = async () => { throw new TypeError("connection lost"); };
  await assert.rejects(cache.loadWordsWithStatus(108), /connection lost/, "a new session must fetch online, never fall back to stored words");
  const aborted = new AbortController();
  aborted.abort();
  await assert.rejects(cache.loadWordsWithStatus(108, aborted.signal), /aborted/);
  await assert.rejects(tafsir.loadSurahTafsir(108, aborted.signal), /aborted/);
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ tafsirs: [{ verse_key: "108:1", text: "<p>Test commentary</p>" }] }) });
  assert.equal((await tafsir.loadSurahTafsir(108))[1].blocks[0].text, "Test commentary");
  globalThis.fetch = async () => { throw new TypeError("connection lost"); };
  await assert.rejects(tafsir.loadSurahTafsir(108), /connection lost/);
  const invalidWords = structuredClone(networkWords);
  invalidWords.verses[0].words[0].location = "109:1:1";
  globalThis.fetch = async () => ({ ok: true, json: async () => invalidWords });
  await assert.rejects(cache.loadWordsWithStatus(108), /bad-word-location/);
  assert.equal(storageWrites, 0, "valid and invalid QF responses must never be persisted");
  assert.equal(storageReads, 0, "legacy caches must never be read by online loaders");
  failRemoval = true;
  await assert.rejects(qfCache.purgeLegacyQuranFoundationCaches(), /storage unavailable/);
  failRemoval = false;
  assert.equal(await qfCache.purgeLegacyQuranFoundationCaches(), 3);
  assert.equal(await qfCache.purgeLegacyQuranFoundationCaches(), 0, "purge is idempotent");
  assert.equal(storage.size, 4);
  assert.equal(storage.get("nuur_saved_ayahs"), '["108:1"]');
  assert.equal(storage.get("nuur_quran_verses_v4_108"), "AlQuran Cloud text");
  assert.equal(storage.get("nuur_prayer_tracker"), "worship history");
  assert.ok(storage.has("nuur_quran_words_v4_108_backup"));
} finally { globalThis.fetch = originalFetch; }

if (process.argv.includes("--live")) {
  for (const [surahNumber, expectedCount] of [[1, 7], [2, 286], [108, 3]]) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const downloaded = await cache.loadWordsWithStatus(surahNumber, controller.signal);
      assert.equal(Object.keys(downloaded.words).length, expectedCount);
      assert.equal(downloaded.storage, "session-only");
      assert.ok(Object.values(downloaded.words).every((words) => words.length > 0));
      console.log(`Live word provider validated: surah ${surahNumber}, ${expectedCount} verses.`);
    } finally { clearTimeout(timer); }
  }
}

// Source contracts complement runtime request tests; native VoiceOver/large-text
// visual checks remain a separate device QA step, not simulated by these checks.
const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const tracker = await source("components/home/NowNextCard.tsx");
assert.equal((tracker.match(/accessibilityRole="checkbox"/g) ?? []).length, 2);
assert.match(tracker, /accessibilityState=\{\{ checked: filled \}\}/);
assert.match(tracker, /accessibilityState=\{\{ checked: isPrayedNow \}\}/);
assert.match(tracker, /budTarget: \{ width: 44, height: 44/);
assert.match(tracker, /yesterdayLabel \?\? "yesterday"/);
for (const path of ["components/home/VerseOfDayCard.tsx", "components/MushafLeafVerse.tsx"]) {
  const card = await source(path);
  assert.match(card, /accessibilityLabel=.*Copy verse/);
  assert.match(card, /accessibilityLabel="Share verse"/);
  assert.match(card, /(?:minWidth|width): 44/);
  assert.match(card, /(?:minHeight|height): 44/);
}
const mushaf = await source("components/MushafLeafVerse.tsx");
assert.doesNotMatch(mushaf, /allowFontScaling=\{false\}/);
const hadith = await source("components/HadithScholarsLeaf.tsx");
assert.doesNotMatch(hadith, /styles\.(arabic|isnadHonorific)[^>]*allowFontScaling=\{false\}/);
const reader = await source("app/quran/[id].tsx");
assert.match(reader, /Retry online word-by-word/);
assert.match(reader, /wordLoader\.cancel\(\)/);
assert.match(reader, /Word-by-word · online-only, not saved offline/);
assert.doesNotMatch(reader, /Word-by-word downloaded · available offline/);
assert.match(reader, /accessibilityRole="switch"/);
const tafsirSheet = await source("components/TafsirSheet.tsx");
assert.match(tafsirSheet, /Retry online tafsir/);
assert.match(tafsirSheet, /Online-only · commentary is not saved for offline use/);
assert.match(tafsirSheet, /accessibilityRole="button"/);
assert.match(tafsirSheet, /onAccessibilityEscape=\{onClose\}/);
assert.ok(tafsirSheet.indexOf('<ScrollView style={styles.scroll}') < tafsirSheet.indexOf('style={styles.header}'), "tafsir header must scroll at large text sizes");
assert.ok(tafsirSheet.indexOf('</ScrollView>') > tafsirSheet.indexOf('TAFSIR_SOURCE_ATTRIBUTION}{'), "attribution must remain reachable within the same scroll");
const tafsirHook = await source("hooks/useTafsir.ts");
assert.match(tafsirHook, /createOnlineContentLoader/);
assert.match(tafsirHook, /loader\.cancel\(\)/);
const recoveryGate = await source("context/DataRecoveryContext.tsx");
assert.match(recoveryGate, /initializeDataControls\(\)\.then\(async result => \{[\s\S]*?await purgeLegacyQuranFoundationCaches\(\);[\s\S]*?setReady\(true\)/);
assert.match(recoveryGate, /setError\(reason[\s\S]*?SplashScreen\.hideAsync\(\)/, "recovery errors must reveal Retry even while native splash is held");
console.log("Reader QA passed: online-only word/tafsir, no durable reads/writes, targeted legacy purge, offline/retry/cancellation/timeout/stale-surah and accessibility contracts.");
