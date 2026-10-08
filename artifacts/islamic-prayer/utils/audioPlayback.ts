import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync, type AudioPlayer, type AudioStatus } from "expo-audio";
import { Platform } from "react-native";

export type AudioPlaybackState = "loading" | "playing" | "paused";
export interface AudioPlaybackOptions {
  background?: boolean;
  startAtMs?: number;
  rate?: number;
  onState?: (state: AudioPlaybackState) => void;
  onFinish?: () => void;
  onError?: () => void;
}
export interface AudioPlayback {
  start(): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): Promise<void>;
  seekTo(seconds: number): Promise<void>;
  setRate(rate: number): void;
}

const LOAD_TIMEOUT_MS = 30_000;
let audioModeQueue: Promise<void> = Promise.resolve();

/** Wait before handing the shared iOS audio session back to TrackPlayer. */
export const flushAudioSessionChanges = (): Promise<void> => audioModeQueue;

/**
 * A disposable streaming session. Stop is synchronous and invalidates pending
 * mode/seek/play work. Completion, errors and stop always release the player.
 * TrackPlayer remains responsible for production Quran/background controls.
 */
export function createAudioPlayback(url: string, options: AudioPlaybackOptions = {}): AudioPlayback {
  let native: AudioPlayer | null = null;
  let web: HTMLAudioElement | null = null;
  let subscription: { remove(): void } | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  let started = false;
  let hasPlayed = false;
  let seeking = false;
  let manuallyPaused = false;
  let offsetApplied = !(options.startAtMs && options.startAtMs > 0);
  let rate = options.rate ?? 1;
  let lastState: AudioPlaybackState | null = null;

  const emit = (state: AudioPlaybackState) => {
    if (stopped || state === lastState) return;
    lastState = state;
    options.onState?.(state);
  };
  const clearTimer = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
  };
  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearTimer();
    subscription?.remove();
    subscription = null;
    const oldNative = native;
    native = null;
    try { oldNative?.pause(); } catch {}
    try { oldNative?.release(); } catch {}
    if (Platform.OS !== "web" && started) {
      // Expo's default pause/finish schedules a GLOBAL session deactivation
      // 100 ms later, without knowing about TrackPlayer. Disable that native
      // behavior below and instead complete cleanup before the next owner plays.
      audioModeQueue = audioModeQueue.then(() => setIsAudioActiveAsync(false)).catch(() => undefined);
    }
    if (web) {
      web.onended = null;
      web.onerror = null;
      web.onplaying = null;
      web.onpause = null;
      web.onwaiting = null;
      web.onloadedmetadata = null;
      web.pause();
      web.removeAttribute("src");
      web.load();
      web = null;
    }
  };
  const fail = () => {
    if (stopped) return;
    stop();
    options.onError?.();
  };
  const finish = () => {
    if (stopped) return;
    stop();
    options.onFinish?.();
  };
  const armTimer = () => {
    if (!timeout && !stopped && !manuallyPaused) timeout = setTimeout(fail, LOAD_TIMEOUT_MS);
  };
  const onStatus = (status: AudioStatus) => {
    if (stopped) return;
    if (/error|failed/i.test(status.playbackState)) { fail(); return; }
    if (status.didJustFinish) { finish(); return; }
    if (!offsetApplied && status.isLoaded && native && !seeking) {
      seeking = true;
      const player = native;
      void player.seekTo((options.startAtMs ?? 0) / 1000, 0, 0).then(() => {
        if (stopped || native !== player) return;
        offsetApplied = true;
        seeking = false;
        if (!manuallyPaused) player.play();
      }).catch(fail);
      return;
    }
    if (status.playing) {
      hasPlayed = true;
      clearTimer();
      emit("playing");
    } else if (status.isBuffering || !status.isLoaded) {
      if (!manuallyPaused) { armTimer(); emit("loading"); }
    } else if (hasPlayed || manuallyPaused) {
      clearTimer();
      emit("paused");
    }
  };

  const start = async () => {
    if (stopped || started) return;
    started = true;
    emit("loading");
    armTimer();
    try {
      if (Platform.OS === "web") {
        const audio = new Audio(url);
        web = audio;
        audio.playbackRate = rate;
        audio.onended = finish;
        audio.onerror = fail;
        audio.onplaying = () => { hasPlayed = true; clearTimer(); emit("playing"); };
        audio.onpause = () => { clearTimer(); emit("paused"); };
        audio.onwaiting = () => { armTimer(); emit("loading"); };
        audio.onloadedmetadata = () => {
          if (!offsetApplied && !stopped) {
            audio.currentTime = (options.startAtMs ?? 0) / 1000;
            offsetApplied = true;
          }
        };
        await audio.play();
        if (stopped) audio.pause();
        return;
      }
      // Serialise session changes too: a cancelled preview must not overwrite
      // the new owner's background mode after the new owner has started.
      const configure = audioModeQueue.then(async () => {
        if (stopped) return;
        await setIsAudioActiveAsync(true);
        if (stopped) return;
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
          shouldPlayInBackground: options.background ?? false,
          shouldRouteThroughEarpiece: false,
          interruptionMode: "doNotMix",
        });
      });
      audioModeQueue = configure.catch(() => undefined);
      await configure;
      if (stopped) return;
      const player = createAudioPlayer({ uri: url }, { updateInterval: 200, keepAudioSessionActive: true });
      native = player;
      player.volume = 1;
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(rate);
      subscription = player.addListener("playbackStatusUpdate", onStatus);
      if (offsetApplied && !manuallyPaused) player.play();
      // Local/cache sources can already be loaded before the listener exists.
      onStatus(player.currentStatus);
    } catch {
      fail();
    }
  };

  return {
    start,
    stop,
    pause: () => {
      if (stopped) return;
      manuallyPaused = true;
      clearTimer();
      native?.pause();
      web?.pause();
      emit("paused");
    },
    resume: async () => {
      if (stopped) return;
      manuallyPaused = false;
      armTimer();
      try {
        if (native && offsetApplied) native.play();
        if (web) await web.play();
      } catch { fail(); }
    },
    seekTo: async (seconds) => {
      if (stopped) return;
      const position = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
      if (native) await native.seekTo(position, 0, 0);
      if (web) web.currentTime = position;
    },
    setRate: (nextRate) => {
      if (stopped || !Number.isFinite(nextRate)) return;
      rate = Math.max(0.5, Math.min(2, nextRate));
      native?.setPlaybackRate(rate);
      if (web) web.playbackRate = rate;
    },
  };
}
