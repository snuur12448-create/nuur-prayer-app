import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function loadModule(path, mocks = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id === "zod") return require(id);
    throw new Error(`Unexpected data-control test dependency: ${id}`);
  };
  new Function("require", "module", "exports", compiled)(localRequire, module, module.exports);
  return module.exports;
}
const quranIntegrity = loadModule("utils/quranIntegrity.ts", { "../assets/quranIndex.json": require("../assets/quranIndex.json") });
const schema = loadModule("utils/backupSchema.ts", { "./quranIntegrity": quranIntegrity });
const transaction = loadModule("utils/dataTransaction.ts", { "./backupSchema": schema });
const payload = (values) => ({ format: "nuur-personal-data", version: 1, createdAt: "2026-10-09T00:00:00.000Z", values });
const validLocation = JSON.stringify({ latitude: 51.5, longitude: -0.12, city: "London", timezone: "Europe/London", countryCode: "GB" });
const validValues = { app_theme: "emerald", location_data: validLocation, location_source: "gps", adhan_mode: "silent", nuur_saved_ayahs: '["1:1","2:255"]' };
assert.deepEqual(schema.validateBackupPayload(payload(validValues)).values, validValues);

for (const [key, value] of [
  ["notifications_enabled", "true"], ["nuur_install_id", "other-device"], ["revenuecat_user_id", "paid-user"],
  ["nuur_managed_notification_ids_v1", '["old-os-request"]'], ["nuur_quran_verses_v4_1", "cache"],
  ["constructor", "attack"], ["prototype", "attack"], ["nuur_unknown_future_data", "not-owned"],
  ["location_data", '{"latitude":91,"longitude":0,"city":"bad","timezone":"UTC"}'],
  ["location_data", '{"latitude":0,"longitude":0,"city":"bad","timezone":"Invalid/Zone"}'],
  ["app_theme", "unknown"], ["prayer_pre_reminder_minutes", "60"], ["bookmarked_surahs", "[115]"],
  ["nuur_prayer_tracker", '{"2026-10-09":{"fajr":"true"}}'],
  ["nuur_saved_ayahs", '["0:1"]'], ["nuur_saved_ayahs", '["114:286"]'], ["nuur_quran_auto_advance", true],
  ["nuur_quran_last_playing", '{"surahNum":114,"verseNum":286}'],
  ["nuur_last_read_position", '{"surahNum":114,"ayahNum":286,"surahNameEn":"An-Nas","surahNameAr":"الناس"}'],
  ["nuur_prayer_tracker", '{"2026-02-30":{"fajr":true}}'],
  ["nuur_daily_sunnah_v1", '{"date":"2026-99-99","ids":[]}'],
]) {
  assert.throws(() => schema.validateBackupPayload(payload({ [key]: value })), undefined, `${key} must be rejected`);
}
assert.throws(() => schema.validateBackupPayload(JSON.parse('{"format":"nuur-personal-data","version":1,"createdAt":"2026-10-09T00:00:00.000Z","values":{"__proto__":"attack"}}')));
assert.throws(() => schema.validateBackupPayload({ ...payload({}), version: 2 }));
assert.throws(() => schema.validateBackupPayload({ ...payload({}), surprise: true }));
assert.throws(() => schema.validateBackupPayload(payload({ app_theme: "a".repeat(schema.MAX_BACKUP_BYTES + 1) })));
assert.equal(schema.utf8ByteLength("نور🤲"), Buffer.byteLength("نور🤲"));
assert.throws(() => schema.utf8ByteLength("\ud800"));

// Representative real consumer structures, including runtime-exported defaults
// instead of test-only approximations that could hide schema drift.
const adhanData = loadModule("utils/adhanData.ts");
const prayerSettings = loadModule("utils/prayerNotifData.ts", { "./adhanData": adhanData });
const qadaData = loadModule("utils/qadaData.ts", { "@/utils/AppStorage": {} });
const actualValues = {
  ...validValues,
  prayer_notif_config: JSON.stringify(prayerSettings.DEFAULT_PRAYER_NOTIF_CONFIG),
  prayer_offsets: JSON.stringify({ fajr: -2, sunrise: 0, dhuhr: 1, asr: 0, maghrib: 3, isha: 0 }),
  nuur_qada_ledger_v1: JSON.stringify({ ...qadaData.DEFAULT_QADA_STATE, configured: true, initial: { fajr: 365, dhuhr: 365, asr: 365, maghrib: 365, isha: 365 }, madeUp: { ...qadaData.EMPTY_COUNTS, fajr: 1 }, startedAt: "2026-10-09T00:00:00.000Z", recentLog: ["2026-10-09"] }),
  nuur_prayer_tracker: JSON.stringify({ "2026-10-09": { fajr: true, dhuhr: false } }),
  nuur_daily_sunnah_v1: JSON.stringify({ date: "2026-10-09", ids: ["fajr-sunnah", "duha"] }),
  nuur_sunnah_streak_v1: JSON.stringify({ current: 4, lastDate: "2026-10-09" }),
  nuur_sunnah_history_v1: JSON.stringify([{ date: "2026-10-09", count: 2 }]),
  nuur_quran_last_playing: JSON.stringify({ surahNum: 2, verseNum: 286 }),
  nuur_last_read_position: JSON.stringify({ surahNum: 2, ayahNum: 286, surahNameEn: "Al-Baqarah", surahNameAr: "البقرة" }),
  bookmarked_surahs: "[1,2,114]", nuur_saved_hadiths: '["bukhari-1"]', nuur_saved_duas: '["morning"]', nuur_saved_mosques: '["12345678901"]',
  nuur_added_dhikr: JSON.stringify([{ id: "subhanallah", arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", translation: "Glory be to Allah", target: 33, color: "#4CAF7D" }]),
  nuur_zakat_inputs: JSON.stringify({ cash: "1,234.56", metals: "£500", investments: "", business: "", receivables: "", other: "", debts: "100" }),
  nuur_zakat_currency: "GBP", nuur_zakat_nisab_type: "gold",
  "nuur:share:lastTheme:quran": "ayah-v2", "nuur:share:lastTheme:hadith": "hadith-v4",
  "nuur:share:lastTheme:dua": "dua-v1", "nuur:share:lastTheme:name": "name-v3", "nuur:share:lastTheme:adhkar": "dua-v1",
};
assert.deepEqual(schema.createBackupPayload(Object.entries(actualValues)).values, actualValues);
assert.deepEqual(schema.validateBackupPayload(payload({ location_data: JSON.stringify({ latitude: 21.4, longitude: 39.8, city: "Makkah", timezone: 3 }) })).values.location_data,
  JSON.stringify({ latitude: 21.4, longitude: 39.8, city: "Makkah", timezone: 3 }), "supported legacy numeric timezone remains exportable");

const exported = schema.createBackupPayload([
  ["app_theme", "emerald"], ["location_data", validLocation], ["nuur_install_id", "preserve"],
  ["notifications_enabled", "true"], ["nuur_quran_verses_v4_1", "cached"], ["madhab", null],
]);
assert.deepEqual(Object.keys(exported.values).sort(), ["app_theme", "location_data"]);
for (const key of ["nuur_install_id", "nuur_purchase_identity", "library-unrelated", "nuur_future_data", "nuur_data_maintenance_v1", "nuur_data_transaction_v1"]) {
  assert.equal(schema.isClearableAppKey(key), false, `reset must not infer ownership of ${key}`);
}
for (const key of ["app_theme", "nuur_quran_verses_v4_114", "nuur_quran_words_v3_1", "nuur_tafsir_ibnkathir_v1_2"]) {
  assert.equal(schema.isClearableAppKey(key), true);
}

class MemoryStore {
  data;
  events = [];
  fault = null;
  constructor(entries) { this.data = new Map(Object.entries(entries)); }
  checkpoint(op, key) {
    this.events.push([op, key]);
    this.fault?.(op, key);
  }
  async getItem(key) { this.checkpoint("getItem", key); return this.data.get(key) ?? null; }
  async setItem(key, value) { this.checkpoint("setItem", key); this.data.set(key, value); }
  async removeItem(key) { this.checkpoint("removeItem", key); this.data.delete(key); }
  async getAllKeys() { this.checkpoint("getAllKeys", null); return [...this.data.keys()]; }
  async multiGet(keys) { this.checkpoint("multiGet", null); return keys.map((key) => [key, this.data.get(key) ?? null]); }
  async multiSet(entries) {
    this.checkpoint("multiSet", null);
    for (const [key, value] of entries) { this.data.set(key, value); this.checkpoint("multiSet:partial", key); }
  }
  async multiRemove(keys) {
    this.checkpoint("multiRemove", null);
    for (const key of keys) { this.data.delete(key); this.checkpoint("multiRemove:partial", key); }
  }
}
const initial = {
  app_theme: "gold", location_data: validLocation, nuur_saved_ayahs: '["2:255"]', notifications_enabled: "true",
  nuur_install_id: "original-phone", unrelated_library: "must-remain", nuur_quran_verses_v4_1: "disposable-cache",
  nuur_data_maintenance_v1: "1",
};
const journalKey = transaction.DATA_TRANSACTION_JOURNAL;
const assertIdentities = (store) => {
  assert.equal(store.data.get("nuur_install_id"), initial.nuur_install_id);
  assert.equal(store.data.get("unrelated_library"), initial.unrelated_library);
  assert.equal(store.data.get("nuur_data_maintenance_v1"), "1", "transaction must not reopen maintenance itself");
};

// Success changes only whitelisted personal values, disables alerts and treats
// a restored city as a manual choice, never implicit location permission.
{
  const store = new MemoryStore(initial);
  let cleared = 0;
  await transaction.applyDataTransaction(store, "restore", validValues, async () => { cleared++; });
  assert.equal(cleared, 1);
  assert.equal(store.data.get("app_theme"), "emerald");
  assert.equal(store.data.get("location_source"), "manual");
  assert.equal(store.data.get("notifications_enabled"), "false");
  assert.equal(store.data.get("nuur_onboarding_done"), "true");
  assert.equal(store.data.has(journalKey), false);
  assertIdentities(store);
}
{
  const store = new MemoryStore(initial);
  await transaction.applyDataTransaction(store, "clear", {}, async () => undefined);
  assert.equal(store.data.has("app_theme"), false);
  assert.equal(store.data.has("nuur_saved_ayahs"), false);
  assert.equal(store.data.has("nuur_quran_verses_v4_1"), false);
  assert.equal(store.data.get("notifications_enabled"), "false");
  assertIdentities(store);
}

// Failure during every storage mutation stage must rollback personal values,
// keep notifications off and never touch native data before the commit point.
for (const faultStage of ["multiRemove:partial", "multiSet:partial", "commit-write"]) {
  const store = new MemoryStore(initial);
  let fired = false;
  let journalWrites = 0;
  let nativeClears = 0;
  store.fault = (op, key) => {
    if (op === "setItem" && key === journalKey) journalWrites++;
    const shouldFail = faultStage === "commit-write" ? op === "setItem" && key === journalKey && journalWrites === 2 : op === faultStage;
    if (shouldFail && !fired) { fired = true; throw new Error("disk failure"); }
  };
  await assert.rejects(transaction.applyDataTransaction(store, "restore", validValues, async () => { nativeClears++; }), /personal data was restored/);
  assert.equal(fired, true);
  assert.equal(nativeClears, 0);
  assert.equal(store.data.get("app_theme"), "gold");
  assert.equal(store.data.get("nuur_saved_ayahs"), '["2:255"]');
  assert.equal(store.data.get("notifications_enabled"), "false");
  assert.equal(store.data.has(journalKey), false);
  assertIdentities(store);
}

// Failed rollback retains a prepared journal. A subsequent startup repeats the
// idempotent rollback before providers can hydrate half-written data.
{
  const store = new MemoryStore(initial);
  store.fault = (op) => { if (op === "multiRemove:partial") throw new Error("persistent disk failure"); };
  await assert.rejects(transaction.applyDataTransaction(store, "restore", validValues, async () => undefined), /recovery is still pending/);
  assert.equal(JSON.parse(store.data.get(journalKey)).phase, "prepared");
  store.fault = null;
  assert.equal(await transaction.recoverDataTransaction(store, async () => assert.fail("prepared rollback must not clear native data")), "rolled-back");
  assert.equal(store.data.get("app_theme"), "gold");
  assert.equal(store.data.get("notifications_enabled"), "false");
  assert.equal(store.data.has(journalKey), false);
  assertIdentities(store);
}

// Native cleanup failure happens AFTER personal-data commit. It must complete
// forward on restart, never restore old JS values and pretend native progress
// (which may already be removed) was restored too.
for (const failJournalRemoval of [false, true]) {
  const store = new MemoryStore(initial);
  let clears = 0;
  store.fault = failJournalRemoval ? (op, key) => { if (op === "removeItem" && key === journalKey) throw new Error("remove failed"); } : null;
  await assert.rejects(transaction.applyDataTransaction(store, "restore", validValues, async () => {
    clears++;
    if (!failJournalRemoval) throw new Error("native cleanup failed");
  }), /cleanup is still pending/);
  assert.equal(JSON.parse(store.data.get(journalKey)).phase, "committed");
  assert.equal(store.data.get("app_theme"), "emerald");
  store.fault = null;
  assert.equal(await transaction.recoverDataTransaction(store, async () => { clears++; }), "completed");
  assert.equal(clears, 2);
  assert.equal(store.data.get("app_theme"), "emerald");
  assert.equal(store.data.has(journalKey), false);
  assertIdentities(store);
}

for (const corrupt of [
  "invalid-json", JSON.stringify({ version: 2, phase: "prepared", keys: [], before: [] }),
  JSON.stringify({ version: 1, phase: "unknown", keys: [], before: [] }),
  JSON.stringify({ version: 1, phase: "prepared", keys: ["nuur_install_id"], before: [] }),
  JSON.stringify({ version: 1, phase: "prepared", keys: ["app_theme"], before: [["nuur_install_id", "attack"]] }),
  JSON.stringify({ version: 1, phase: "prepared", keys: ["app_theme", "app_theme"], before: [] }),
  JSON.stringify({ version: 1, phase: "prepared", keys: ["app_theme"], before: [["app_theme", "gold"], ["app_theme", "emerald"]] }),
  JSON.stringify({ version: 1, phase: "prepared", keys: ["app_theme"], before: [["app_theme", null]] }),
]) {
  const store = new MemoryStore({ ...initial, [journalKey]: corrupt });
  const before = [...store.data.entries()];
  await assert.rejects(transaction.recoverDataTransaction(store, async () => assert.fail("must not clear native on invalid journal")));
  assert.deepEqual([...store.data.entries()], before, "invalid journal must make no destructive changes");
}
{
  const store = new MemoryStore(initial);
  await assert.rejects(transaction.applyDataTransaction(store, "restore", { notifications_enabled: "true" }, async () => undefined));
  assert.deepEqual([...store.data.entries()], Object.entries(initial));
}

// Exercise the actual storage facade: an in-flight write is drained, waiting
// and late writes are suppressed, a persisted gate also protects fresh runtimes.
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const flush = async () => { for (let n = 0; n < 30; n++) await Promise.resolve(); };
{
  const native = new MemoryStore({});
  let reads = 0;
  native.fault = (operation, key) => {
    if (operation === "getItem" && key === "nuur_data_maintenance_v1" && ++reads === 1) {
      throw new Error("temporarily unavailable protected storage");
    }
  };
  const facade = loadModule("utils/AppStorage.ts", { "@react-native-async-storage/async-storage": native });
  await assert.rejects(facade.storageReady(), /temporarily unavailable/);
  assert.equal(facade.isStorageMaintenanceActive(), true, "an unreadable maintenance flag must fail closed");
  await facade.storageReady();
  assert.equal(reads, 2, "retry must read native storage again instead of inheriting a rejected initialization promise");
  await facade.default.setItem("late-before-recovery", "stale");
  assert.equal(native.data.has("late-before-recovery"), false);
  await facade.finishStorageRecovery();
  await facade.default.setItem("after-recovery", "fresh");
  assert.equal(native.data.get("after-recovery"), "fresh");
}
{
  const native = new MemoryStore({});
  const wait = deferred();
  const nativeSet = native.setItem.bind(native);
  native.setItem = async (key, value) => { if (key === "already-started") await wait.promise; return nativeSet(key, value); };
  const facade = loadModule("utils/AppStorage.ts", { "@react-native-async-storage/async-storage": native });
  await facade.storageReady();
  const oldWrite = facade.default.setItem("already-started", "old");
  await flush();
  const waitingWrite = facade.default.setItem("queued-stale", "old");
  let locked = false;
  const maintenance = facade.beginStorageMaintenance().then(() => { locked = true; });
  const lateWrite = facade.default.setItem("late-callback", "old");
  await flush();
  assert.equal(locked, false);
  assert.equal(facade.isStorageMaintenanceActive(), true);
  wait.resolve();
  await Promise.all([oldWrite, waitingWrite, maintenance, lateWrite]);
  assert.equal(native.data.get("already-started"), "old", "preexisting native write must finish before maintenance snapshot");
  assert.equal(native.data.has("queued-stale"), false);
  assert.equal(native.data.has("late-callback"), false);
  assert.equal(native.data.get("nuur_data_maintenance_v1"), "1");
  assert.equal(facade.maintenanceStorage(), native);
  await assert.rejects(facade.default.clear(), /Unscoped/);
  const restarted = loadModule("utils/AppStorage.ts", { "@react-native-async-storage/async-storage": native });
  await restarted.storageReady();
  await restarted.default.setItem("headless-worker", "stale");
  assert.equal(native.data.has("headless-worker"), false);
  await restarted.finishStorageRecovery();
  await restarted.default.setItem("new-provider", "fresh");
  assert.equal(native.data.get("new-provider"), "fresh");
}

{
  const native = new MemoryStore({});
  const facade = loadModule("utils/AppStorage.ts", { "@react-native-async-storage/async-storage": native });
  await facade.storageReady();
  const pending = deferred();
  let calls = 0;
  const auxiliary = loadModule("utils/auxiliaryNotifications.ts", {
    "./AppStorage": facade,
    "expo-notifications": { scheduleNotificationAsync: () => { calls++; return pending.promise; } },
  });
  const scheduling = auxiliary.scheduleAuxiliaryNotification({ content: { title: "Milestone" }, trigger: null });
  await flush();
  assert.equal(calls, 1);
  await facade.beginStorageMaintenance();
  let drained = false;
  const drain = auxiliary.drainAuxiliaryNotifications().then(() => { drained = true; });
  await flush();
  assert.equal(drained, false, "maintenance must wait for already-started native auxiliary schedules");
  assert.equal(await auxiliary.scheduleAuxiliaryNotification({}), null);
  assert.equal(calls, 1, "late auxiliary alert is suppressed by maintenance");
  pending.resolve("native-id");
  await Promise.all([scheduling, drain]);
  assert.equal(drained, true);
}

// Execute the real coordinator with native/file boundaries mocked. Verify gates
// stay closed through committed changes and only startup reopens providers.
function coordinatorFixture(store = new MemoryStore(initial)) {
  const events = [];
  let nativeGate = false;
  let failClear = false;
  let pending = [{ identifier: "legacy" }];
  const files = new Map();
  const plaintextWrites = [];
  const bridge = {
    beginDataMaintenance: async () => { events.push("native-gate:close"); nativeGate = true; },
    endDataMaintenance: async () => { events.push("native-gate:open"); nativeGate = false; },
    clearSharedData: async () => {
      assert.equal(nativeGate, true);
      events.push("native-clear");
      if (failClear) throw new Error("native clear failed");
    },
    encryptBackup: async (plaintext, passphrase) => { events.push("encrypt"); assert.equal(passphrase, "test-password-123"); assert.equal(JSON.parse(plaintext).format, "nuur-personal-data"); return "ENCRYPTED-ONLY"; },
    decryptBackup: async () => { events.push("decrypt"); return JSON.stringify(payload(validValues)); },
  };
  const nativeNotifications = {
    cancelAllScheduledNotificationsAsync: async () => { events.push("cancel-all"); pending = []; },
    getAllScheduledNotificationsAsync: async () => pending,
    dismissAllNotificationsAsync: async () => { events.push("dismiss"); },
  };
  const fileSystem = {
    cacheDirectory: "file:///app/cache/",
    EncodingType: { UTF8: "utf8" },
    makeDirectoryAsync: async () => undefined,
    writeAsStringAsync: async (uri, content) => { plaintextWrites.push(content); files.set(uri, content); },
    deleteAsync: async (uri) => { events.push(`delete:${uri}`); for (const key of files.keys()) if (key === uri || (uri.endsWith("/") && key.startsWith(uri))) files.delete(key); },
    getInfoAsync: async (uri) => ({ exists: files.has(uri), isDirectory: false, size: files.get(uri)?.length ?? 0 }),
    readAsStringAsync: async (uri) => files.get(uri),
  };
  let selected = { canceled: true };
  let facade;
  const load = () => {
    facade = loadModule("utils/AppStorage.ts", { "@react-native-async-storage/async-storage": store });
    return loadModule("utils/dataControls.ts", {
      "react-native": { NativeModules: { NuurBridge: bridge }, Platform: { OS: "ios" } },
      expo: { reloadAppAsync: async () => { events.push("reload"); assert.equal(nativeGate, true); assert.equal(facade.isStorageMaintenanceActive(), true); } },
      "expo-file-system/legacy": fileSystem,
      "expo-document-picker": { getDocumentAsync: async () => selected },
      "expo-sharing": { isAvailableAsync: async () => true, shareAsync: async (uri) => { assert.equal(files.get(uri), "ENCRYPTED-ONLY"); events.push("share"); } },
      "expo-crypto": { randomUUID: () => "test-random-id" },
      "expo-notifications": nativeNotifications,
      "./AppStorage": { __esModule: true, ...facade },
      "./audioFocus": { stopAllAudioForMaintenance: async () => { events.push("audio-drained"); } },
      "./notifications": { cancelAllPrayerNotifications: async () => { events.push("managed-drained"); } },
      "./auxiliaryNotifications": { drainAuxiliaryNotifications: async () => { events.push("auxiliary-drained"); } },
      "./backupSchema": schema,
      "./dataTransaction": transaction,
    });
  };
  return { store, events, files, plaintextWrites, load, setSelected: value => { selected = value; }, setFailClear: value => { failClear = value; }, gate: () => nativeGate, facade: () => facade };
}
{
  const fixture = coordinatorFixture();
  let coordinator = fixture.load();
  await coordinator.initializeDataControls();
  fixture.events.length = 0;
  await coordinator.restorePersonalData(payload(validValues));
  assert.deepEqual(fixture.events, ["native-gate:close", "audio-drained", "managed-drained", "auxiliary-drained", "cancel-all", "dismiss", "native-clear", "delete:file:///app/cache/nuur-encrypted-backups/", "reload"]);
  assert.equal(fixture.gate(), true);
  assert.equal(fixture.facade().isStorageMaintenanceActive(), true);
  assert.equal(fixture.store.data.get("notifications_enabled"), "false");
  await fixture.facade().default.setItem("app_theme", "stale-from-old-provider");
  assert.equal(fixture.store.data.get("app_theme"), "emerald");
  coordinator = fixture.load();
  assert.equal(await coordinator.initializeDataControls(), "none");
  assert.equal(fixture.gate(), false);
  assert.equal(fixture.facade().isStorageMaintenanceActive(), false);
}
{
  const fixture = coordinatorFixture();
  let coordinator = fixture.load();
  await coordinator.initializeDataControls();
  fixture.setFailClear(true);
  await assert.rejects(coordinator.clearPersonalData(), /cleanup is still pending/);
  assert.equal(fixture.gate(), true);
  assert.equal(fixture.facade().isStorageMaintenanceActive(), true);
  assert.equal(JSON.parse(fixture.store.data.get(journalKey)).phase, "committed");
  fixture.setFailClear(false);
  coordinator = fixture.load();
  assert.equal(await coordinator.initializeDataControls(), "completed");
  assert.equal(fixture.store.data.get("notifications_enabled"), "false");
  assert.equal(fixture.store.data.has(journalKey), false);
  assert.equal(fixture.gate(), false);
}
{
  const fixture = coordinatorFixture();
  const coordinator = fixture.load();
  fixture.files.set("file:///app/cache/nuur-encrypted-backups/crash-leftover.nuurbackup", "OLD-ENCRYPTED");
  fixture.files.set("file:///app/cache/unrelated-file", "unrelated");
  await coordinator.initializeDataControls();
  assert.equal(fixture.files.has("file:///app/cache/nuur-encrypted-backups/crash-leftover.nuurbackup"), false, "startup removes crashed export leftovers");
  assert.equal(fixture.files.get("file:///app/cache/unrelated-file"), "unrelated");
  fixture.files.delete("file:///app/cache/unrelated-file");
  await coordinator.exportEncryptedBackup("test-password-123");
  assert.deepEqual(fixture.plaintextWrites, ["ENCRYPTED-ONLY"]);
  assert.equal(fixture.files.size, 0, "export share completion removes the encrypted temp file");
  fixture.setSelected({ canceled: false, assets: [{ uri: "file:///app/cache/picked-backup", name: "backup.nuurbackup" }] });
  fixture.files.set("file:///app/cache/picked-backup", "ENCRYPTED-ONLY");
  const before = [...fixture.store.data];
  assert.deepEqual((await coordinator.chooseBackupToRestore("test-password-123")).values, validValues);
  assert.deepEqual([...fixture.store.data], before, "choosing/decrypting alone must not change any personal data");
  assert.equal(fixture.files.size, 0, "picker-owned temp is removed, not the external original");
  fixture.setSelected({ canceled: true });
  assert.equal(await coordinator.chooseBackupToRestore("test-password-123"), null);
}

console.log("Data-control QA passed: strict imports, identity exclusion, partial-write rollback, forward recovery, corrupt-journal rejection, late/headless-write gates, coordinator cleanup/reload ordering, encrypted-only temp export and non-mutating restore preview.");
