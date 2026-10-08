import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const base = new URL("../", import.meta.url);

// Execute the real TypeScript modules with deterministic native boundaries.
// This checks lifecycle/races, not audible output or physical iOS interruption
// delivery (those remain explicit real-device release checks).
function loadModule(relative, mocks, globals = {}) {
  const filename = fileURLToPath(new URL(relative, base));
  const source = readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  const localRequire = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    throw new Error(`Unexpected dependency in audio regression: ${id}`);
  };
  new Function("require", "module", "exports", ...Object.keys(globals), compiled)(
    localRequire, module, module.exports, ...Object.values(globals),
  );
  return module.exports;
}

const gate = () => {
  let release;
  const promise = new Promise((resolve) => { release = resolve; });
  return { promise, release };
};
const flush = async () => { for (let n = 0; n < 30; n++) await Promise.resolve(); };
const focusModule = loadModule("utils/audioFocus.ts", {});

// Interruption invalidates the previous owner synchronously and waits for ALL
// outstanding cleanup, even when a third owner replaces the second mid-stop.
{
  const acquire = focusModule.createAudioFocusCoordinator();
  const stopping = gate();
  const events = [];
  const quran = await acquire("quran", () => { events.push("stop-quran"); return stopping.promise; });
  const adhanPromise = acquire("adhan", () => { events.push("stop-adhan"); });
  assert.equal(quran.isCurrent(), false);
  assert.deepEqual(events, ["stop-quran"]);
  let wordStarted = false;
  const wordPromise = acquire("word", () => undefined).then((lease) => { wordStarted = true; return lease; });
  await flush();
  assert.equal(wordStarted, false, "later audio must wait for the first native stop too");
  stopping.release();
  const [adhan, word] = await Promise.all([adhanPromise, wordPromise]);
  assert.equal(adhan.isCurrent(), false);
  assert.equal(word.isCurrent(), true);
  adhan.release();
  assert.equal(word.isCurrent(), true, "stale cleanup must not release the newest owner");
  word.release();
  assert.equal(word.isCurrent(), false);
}
{
  const acquire = focusModule.createAudioFocusCoordinator();
  let stopped = 0;
  const first = await acquire("quran", () => { stopped++; });
  const second = await acquire("quran", () => { stopped++; });
  assert.equal(stopped, 0, "same-owner queue replacement handles its own cleanup");
  assert.equal(first.isCurrent(), false);
  assert.equal(second.isCurrent(), true);
  await acquire.suspend();
  assert.equal(stopped, 1);
  assert.equal(second.isCurrent(), false);
  assert.equal(acquire.isSuspended(), true);
  await assert.rejects(acquire("adhan", () => undefined), /Restart Nuur/);
}
{
  const enqueue = focusModule.createAudioCommandQueue();
  const wait = gate();
  const events = [];
  const old = enqueue(async () => { events.push("old-reset"); await wait.promise; events.push("old-done"); });
  const current = enqueue(async () => { events.push("new-reset"); events.push("new-add"); events.push("new-play"); });
  await flush();
  assert.deepEqual(events, ["old-reset"]);
  wait.release();
  await Promise.all([old, current]);
  assert.deepEqual(events, ["old-reset", "old-done", "new-reset", "new-add", "new-play"]);
  await assert.rejects(enqueue(async () => { throw new Error("native failure"); }));
  assert.equal(await enqueue(async () => "recovered"), "recovered");
}
{
  const acquire = focusModule.createAudioFocusCoordinator();
  await acquire("quran", async () => { throw new Error("native reset failed"); });
  await assert.rejects(acquire("adhan", () => undefined), /native reset failed/);
  assert.equal(acquire.isSuspended(), true, "failed native stop must fail closed");
  await assert.rejects(acquire("word", () => undefined), /Restart Nuur/);
}

const timers = new Map();
let timerId = 0;
const players = [];
const modes = [];
const sessionActivity = [];
let modeGate = null;
let seekGate = null;
let initiallyLoaded = true;
let autoPlayStatus = true;
const defaultStatus = () => ({
  id: 1, currentTime: 0, playbackState: "readyToPlay", timeControlStatus: "paused",
  reasonForWaitingToPlay: "", mute: false, duration: 20, playing: false,
  loop: false, didJustFinish: false, isBuffering: !initiallyLoaded,
  isLoaded: initiallyLoaded, playbackRate: 1, shouldCorrectPitch: true,
});
class FakePlayer {
  currentStatus = defaultStatus();
  plays = 0;
  pauses = 0;
  releases = 0;
  removals = 0;
  seeks = [];
  listener = null;
  play() {
    this.plays++;
    if (autoPlayStatus) this.emit({ playing: true, isBuffering: false, isLoaded: true });
  }
  pause() { this.pauses++; this.emit({ playing: false }); }
  release() { this.releases++; }
  setPlaybackRate(value) { this.rate = value; }
  async seekTo(seconds) { this.seeks.push(seconds); if (seekGate) await seekGate.promise; }
  addListener(_event, listener) {
    this.listener = listener;
    return { remove: () => { this.removals++; this.listener = null; } };
  }
  emit(patch) {
    this.currentStatus = { ...this.currentStatus, ...patch };
    this.listener?.(this.currentStatus);
  }
}
const playbackModule = loadModule("utils/audioPlayback.ts", {
  "expo-audio": {
    createAudioPlayer: (_source, options) => {
      assert.equal(options.keepAudioSessionActive, true, "native delayed session deactivation would race TrackPlayer");
      const player = new FakePlayer(); players.push(player); return player;
    },
    setAudioModeAsync: async (mode) => { modes.push(mode); if (modeGate) await modeGate.promise; },
    setIsAudioActiveAsync: async (active) => { sessionActivity.push(active); },
  },
  "react-native": { Platform: { OS: "ios" } },
}, {
  setTimeout: (fn, duration) => { assert.equal(duration, 30_000); const id = ++timerId; timers.set(id, fn); return id; },
  clearTimeout: (id) => timers.delete(id),
});

// An immediate stop, or stop while session configuration is pending, must
// never create/play a ghost native player and must not emit an error.
{
  let errors = 0;
  const before = players.length;
  const session = playbackModule.createAudioPlayback("https://example.test/first.mp3", { onError: () => errors++ });
  const starting = session.start();
  session.stop();
  await starting;
  assert.equal(players.length, before);
  assert.equal(errors, 0);
  modeGate = gate();
  const delayed = playbackModule.createAudioPlayback("https://example.test/second.mp3", { onError: () => errors++ });
  const pending = delayed.start();
  await flush();
  delayed.stop();
  modeGate.release();
  await pending;
  modeGate = null;
  assert.equal(players.length, before);
  assert.equal(errors, 0);
}
{
  const states = [];
  let finishes = 0;
  const session = playbackModule.createAudioPlayback("https://example.test/full.mp3", {
    background: true, rate: 1.25, onState: (state) => states.push(state), onFinish: () => finishes++,
  });
  await session.start();
  const player = players.at(-1);
  assert.deepEqual(states, ["loading", "playing"]);
  assert.equal(player.rate, 1.25);
  assert.equal(modes.at(-1).shouldPlayInBackground, true);
  assert.equal(modes.at(-1).interruptionMode, "doNotMix");
  assert.equal(modes.at(-1).allowsRecording, false);
  assert.equal(modes.at(-1).playsInSilentMode, true);
  session.pause();
  assert.equal(states.at(-1), "paused");
  await session.resume();
  assert.equal(states.at(-1), "playing");
  await session.seekTo(5);
  assert.deepEqual(player.seeks, [5]);
  session.setRate(4);
  assert.equal(player.rate, 2);
  player.emit({ didJustFinish: true, playing: false });
  player.emit({ didJustFinish: true });
  session.stop();
  assert.equal(finishes, 1);
  assert.equal(player.releases, 1);
  assert.equal(player.removals, 1);
  assert.equal(timers.size, 0);
  await playbackModule.flushAudioSessionChanges();
  assert.equal(sessionActivity.at(-1), false, "handoff barrier includes explicit session deactivation");
}
{
  seekGate = gate();
  const session = playbackModule.createAudioPlayback("https://example.test/offset.mp3", { startAtMs: 6000 });
  await session.start();
  const player = players.at(-1);
  assert.deepEqual(player.seeks, [6], "millisecond preview offsets must convert to seconds");
  assert.equal(player.plays, 0, "do not play intro before the seek resolves");
  session.stop();
  seekGate.release();
  await flush();
  seekGate = null;
  assert.equal(player.plays, 0, "stop during seek must prevent delayed playback");
  assert.equal(player.releases, 1);
}
{
  initiallyLoaded = false;
  autoPlayStatus = false;
  let errors = 0;
  const session = playbackModule.createAudioPlayback("https://example.test/offline.mp3", { onError: () => errors++ });
  await session.start();
  const player = players.at(-1);
  assert.equal(timers.size, 1, "unloaded streams need a bounded failure path");
  for (const fn of [...timers.values()]) fn();
  assert.equal(errors, 1);
  assert.equal(player.releases, 1);
  assert.equal(timers.size, 0);
  initiallyLoaded = true;
  autoPlayStatus = true;
}
{
  let errors = 0;
  const session = playbackModule.createAudioPlayback("https://example.test/stalled.mp3", { onError: () => errors++ });
  await session.start();
  const player = players.at(-1);
  player.emit({ playing: false, isBuffering: true });
  assert.equal(timers.size, 1, "mid-stream stalls must not leave a permanent spinner");
  player.emit({ playbackState: "failed" });
  assert.equal(errors, 1);
  assert.equal(player.releases, 1);
  assert.equal(timers.size, 0);
}

// The production Adhan module must not leak or replay stale previews, and a
// system interruption must clear the overlay rather than unexpectedly resume.
{
  const focus = loadModule("utils/audioFocus.ts", {});
  const sessions = [];
  const adhan = loadModule("utils/adhanPlayer.ts", {
    "react-native": { Platform: { OS: "ios" } },
    "./audioFocus": focus,
    "./audioPlayback": {
      createAudioPlayback: (_url, options) => {
        const session = { options, stops: 0, start: async () => options.onState("playing"), stop() { this.stops++; } };
        sessions.push(session);
        return session;
      },
    },
  });
  let firstFinished = 0;
  let secondStarted = 0;
  const first = adhan.previewAdhan("first", { onFinishOrError: () => firstFinished++ });
  const second = adhan.previewAdhan("second", { onPlaybackStarted: () => secondStarted++ });
  await Promise.all([first, second]);
  assert.equal(sessions.length, 1, "same-turn preview replacement starts only the latest");
  assert.equal(secondStarted, 1);
  assert.equal(firstFinished, 0);
  let finished = 0;
  await adhan.playAdhanAudio("full", () => finished++);
  const full = sessions.at(-1);
  assert.equal(full.options.background, true);
  full.options.onState("paused");
  assert.equal(finished, 1);
  assert.equal(full.stops, 1);
  full.options.onFinish();
  assert.equal(finished, 1, "stale completion cannot clear a newer Adhan overlay");
  await adhan.previewAdhan("word-preview");
  assert.equal(sessions.at(-1).options.background, false);
  await focus.acquireAudioFocus("quran", () => undefined);
  assert.equal(sessions.at(-1).stops, 1, "Quran replaces preview rather than mixing voices");
}

// Native Quran: execute the real provider callbacks with lightweight hooks,
// block old queue add(), issue a newer tap, then assert only the new queue plays.
{
  const focus = loadModule("utils/audioFocus.ts", {});
  const oldAdd = gate();
  const events = [];
  let blockAdd = true;
  let queue = [];
  const trackPlayer = {
    setupPlayer: async (options) => { assert.equal(options.autoHandleInterruptions, false); },
    updateOptions: async () => undefined,
    reset: async () => { events.push("reset"); queue = []; },
    add: async (tracks) => { events.push(`add:${tracks[0].id}`); if (blockAdd) { blockAdd = false; await oldAdd.promise; } queue.push(...tracks); },
    play: async () => { events.push(`play:${queue[0]?.id}`); },
    setRate: async () => undefined,
  };
  const react = {
    createContext: () => ({ Provider: "Provider" }), useContext: () => null,
    useCallback: (fn) => fn, useEffect: () => undefined,
    useRef: (value) => ({ current: value }), useState: (value) => [value, () => undefined],
    createElement: (_kind, props) => ({ props }),
  };
  const reciter = { id: "first", name: "First" };
  const providerModule = loadModule("context/QuranPlayerContext.tsx", {
    react,
    "react-native": { Platform: { OS: "ios" }, AppState: {} },
    "@/utils/AppStorage": { setItem: async () => undefined },
    "expo-constants": { executionEnvironment: "standalone" },
    "@/utils/audioData": { DEFAULT_RECITER: reciter, isSurahLevelReciter: () => false },
    "@/utils/quranAudioFallback": { getSameReciterAudioCandidates: (r, _surah, verse) => [`https://example.test/${r.id}/${verse}.mp3`] },
    "@/utils/audioPlayback": playbackModule,
    "@/utils/audioFocus": focus,
    "@/assets/images/icon.png": 1,
    "react-native-track-player": {
      __esModule: true, default: trackPlayer,
      Capability: {}, AppKilledPlaybackBehavior: {},
    },
  });
  const api = providerModule.QuranPlayerProvider({ children: null }).props.value;
  const verses = [1, 2, 3].map((number) => ({ number, text: "", translation: "", transliteration: "", numberInQuran: number }));
  const first = api.playVerse(verses[0], 1, "الفاتحة", "Al-Fatihah", verses);
  await flush();
  assert.deepEqual(events, ["reset", "add:1"]);
  const second = api.playVerse(verses[1], 1, "الفاتحة", "Al-Fatihah", verses);
  await flush();
  oldAdd.release();
  await Promise.all([first, second]);
  assert.deepEqual(events, ["reset", "add:1", "reset", "add:2", "play:2"]);
  assert.equal(queue[0].id, "2");
  const prior = events.length;
  await focus.acquireAudioFocus("adhan", () => undefined);
  assert.deepEqual(events.slice(prior), ["reset"], "Adhan waits for Quran native reset");
  assert.equal(queue.length, 0);
  await api.playVerse(verses[1], 1, "الفاتحة", "Al-Fatihah", verses);
  api.setSelectedReciter({ id: "second", name: "Second" });
  await flush();
  assert.equal(queue.length, 0, "reciter selection must invalidate the old voice/queue");
}

// Background service must never resume from a RemoteDuck-end event; it cannot
// infer whether the user paused or another feature claimed audio meanwhile.
{
  const listeners = new Map();
  const calls = [];
  const Event = Object.fromEntries(["RemotePlay", "RemotePause", "RemoteStop", "RemoteNext", "RemotePrevious", "RemoteDuck", "RemoteSeek"].map((key) => [key, key]));
  const module = loadModule("utils/PlaybackService.ts", {
    "./audioFocus": focusModule,
    "react-native-track-player": {
      __esModule: true,
      default: { addEventListener: (event, callback) => listeners.set(event, callback), play: async () => calls.push("play"), pause: async () => calls.push("pause") },
      Event,
    },
  });
  await module.PlaybackService();
  await listeners.get(Event.RemoteDuck)({ permanent: false, paused: true });
  await listeners.get(Event.RemoteDuck)({ permanent: false, paused: false });
  await flush();
  assert.deepEqual(calls, ["pause"]);
}

console.log("Audio QA passed: focus handoff, SDK54 session flags, cancellation/seek races, disposal, bounded failures, Adhan modes, native Quran queue serialization and interruption safety.");
