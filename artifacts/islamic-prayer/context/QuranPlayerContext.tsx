import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@/utils/AppStorage";
import Constants from "expo-constants";
import { DEFAULT_RECITER, getVerseAudioUrl, isSurahLevelReciter, Reciter } from "@/utils/audioData";
import { getSameReciterAudioCandidates } from "@/utils/quranAudioFallback";
import { createAudioPlayback, flushAudioSessionChanges, type AudioPlayback } from "@/utils/audioPlayback";
import { acquireAudioFocus, runTrackPlayerCommand, type AudioFocusLease } from "@/utils/audioFocus";

const AUTO_ADVANCE_KEY = "nuur_quran_auto_advance";
const LAST_PLAYING_KEY = "nuur_quran_last_playing";
// Max tracks to load into the TrackPlayer queue at one time. iOS becomes
// unstable with hundreds of queued items; we add more dynamically as we play.
const QUEUE_WINDOW = 40;

// react-native-track-player requires a custom native build and is NOT available
// in Expo Go (executionEnvironment === "storeClient"). Importing it in Expo Go
// causes an invariant crash at the module level, so we skip it entirely.
const isExpoGo = Constants.executionEnvironment === "storeClient";

// One shared setup promise removes the first-tap race between provider mount
// and TrackPlayer initialisation. Failed setup is reset so an explicit retry
// can make a fresh attempt after a transient native/audio-session failure.
let trackPlayerSetupPromise: Promise<void> | null = null;

function isAlreadyInitializedTrackPlayerError(error: unknown): boolean {
  const nativeError = error as { code?: unknown; message?: unknown } | null;
  if (nativeError?.code === "player_already_initialized") return true;
  const message = String(nativeError?.message ?? "").toLowerCase();
  return /\balready(?: been)? initialized\b/.test(message);
}

async function ensureTrackPlayerReady(): Promise<void> {
  if (Platform.OS === "web" || isExpoGo) return;
  if (!trackPlayerSetupPromise) {
    trackPlayerSetupPromise = (async () => {
      const module = await import("react-native-track-player");
      const TrackPlayer = module.default;
      try {
        // Interruption-end cannot tell whether the user paused meanwhile.
        // Our service pauses on interruption; resumption is an explicit Play.
        await TrackPlayer.setupPlayer({ autoHandleInterruptions: false });
      } catch (error: unknown) {
        if (!isAlreadyInitializedTrackPlayerError(error)) throw error;
      }
      await TrackPlayer.updateOptions({
        capabilities: [
          module.Capability.Play,
          module.Capability.Pause,
          module.Capability.SkipToNext,
          module.Capability.SkipToPrevious,
          module.Capability.Stop,
        ],
        compactCapabilities: [
          module.Capability.Play,
          module.Capability.Pause,
          module.Capability.SkipToNext,
        ],
        progressUpdateEventInterval: 1,
        android: {
          appKilledPlaybackBehavior:
            module.AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
      });
    })();
  }
  try {
    await trackPlayerSetupPromise;
  } catch (error) {
    trackPlayerSetupPromise = null;
    throw error;
  }
}

export interface PlayerVerse {
  number: number;
  text: string;
  translation: string;
  transliteration: string;
  numberInQuran: number;
}

export type PlayState = "idle" | "loading" | "playing" | "paused";

interface QuranPlayerContextType {
  playState: PlayState;
  playbackError: string | null;
  playingVerse: number | null;
  playbackRate: number;
  selectedReciter: Reciter;
  currentSurahNum: number | null;
  currentSurahName: string | null;
  currentSurahArabic: string | null;
  /** Last surah/verse that was playing — persisted across app restarts so the screen can scroll to it. */
  lastPlayingSurahNum: number | null;
  lastPlayingVerseNum: number | null;
  playVerse: (
    verse: PlayerVerse,
    surahNum: number,
    surahArabic: string,
    surahName: string,
    allVerses: PlayerVerse[],
    isAutoAdvance?: boolean
  ) => Promise<void>;
  stopAudio: () => Promise<void>;
  togglePlayPause: (
    verse: PlayerVerse,
    surahNum: number,
    surahArabic: string,
    surahName: string,
    allVerses: PlayerVerse[]
  ) => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  retryPlayback: () => Promise<void>;
  clearPlaybackError: () => void;
  autoAdvance: boolean;
  setAutoAdvance: (value: boolean) => void;
  setSelectedReciter: (reciter: Reciter) => void;
  setPlaybackRate: (rate: number) => void;
}

const QuranPlayerContext = createContext<QuranPlayerContextType | null>(null);

// ── Icon used as lock-screen / notification artwork ──────────────────────────
const APP_ICON = require("@/assets/images/icon.png");

export function QuranPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [selectedReciter, setSelectedReciterState] = useState<Reciter>(DEFAULT_RECITER);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [currentSurahNum, setCurrentSurahNum] = useState<number | null>(null);
  const [currentSurahName, setCurrentSurahName] = useState<string | null>(null);
  const [currentSurahArabic, setCurrentSurahArabic] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvanceState] = useState<boolean>(true);
  const autoAdvanceRef = useRef<boolean>(true);
  const [lastPlayingSurahNum, setLastPlayingSurahNum] = useState<number | null>(null);
  const [lastPlayingVerseNum, setLastPlayingVerseNum] = useState<number | null>(null);
  // Tracks the highest verse number that has been loaded into the TrackPlayer
  // queue for the current surah, so the dynamic window can add the right batch.
  const queuedUpToVerseRef = useRef<number | null>(null);

  // Web-only refs
  const webSoundRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<{ verseNum: number; audio: HTMLAudioElement } | null>(null);

  // Expo Go uses the SDK54 audio module; release builds keep TrackPlayer.
  const expoAudioRef = useRef<AudioPlayback | null>(null);
  const audioFocusRef = useRef<AudioFocusLease | null>(null);

  // Shared refs
  const playbackRateRef = useRef<number>(1.0);
  const reciterRef = useRef<Reciter>(DEFAULT_RECITER);
  const surahNumRef = useRef<number | null>(null);
  const surahArabicRef = useRef<string>("");
  const surahNameRef = useRef<string>("");
  const versesRef = useRef<PlayerVerse[] | null>(null);
  const handledFailureGenerationRef = useRef<number>(-1);
  // Tracks the verse currently playing so skipNext can advance without relying
  // on the playingVerse state (which is stale inside useCallback closures).
  const currentVerseRef = useRef<PlayerVerse | null>(null);
  // Stable ref to playVerse — lets skipNext call it without a forward-reference
  // in the deps array (which causes a TDZ crash under the React Compiler).
  const playVerseRef = useRef<
    ((verse: PlayerVerse, surahNum: number, surahArabic: string, surahName: string, allVerses: PlayerVerse[], isAutoAdvance?: boolean, candidateIndex?: number) => Promise<void>) | null
  >(null);
  // Generation token — incremented on every playVerse / stopAudio call so any
  // in-flight async work (audio preparation, TrackPlayer.reset/add/play)
  // from an older call can detect that a newer call has started and abort
  // before assigning a refs / starting playback. Prevents overlapping audio
  // streams when the user taps verses or skip buttons rapidly.
  const playGenRef = useRef<number>(0);

  const lastPlayRequestRef = useRef<{
    verse: PlayerVerse;
    surahNum: number;
    surahArabic: string;
    surahName: string;
    allVerses: PlayerVerse[];
    candidateIndex: number;
    candidateCount: number;
    generation: number;
  } | null>(null);

  const recoverFromPlaybackFailure = useCallback((generation: number) => {
    if (generation !== playGenRef.current) return;
    if (handledFailureGenerationRef.current === generation) return;
    handledFailureGenerationRef.current = generation;

    const request = lastPlayRequestRef.current;
    // A delayed native PlaybackError can arrive after the user explicitly
    // stopped playback. With no active request there is nothing to recover and
    // no error should be shown.
    if (!request) return;
    if (request.candidateIndex + 1 < request.candidateCount) {
      // Only candidates derived from the same reciter/edition are present.
      // Retry automatically before asking the user to intervene.
      setPlayState("loading");
      void playVerseRef.current?.(
        request.verse,
        request.surahNum,
        request.surahArabic,
        request.surahName,
        request.allVerses,
        true,
        request.candidateIndex + 1,
      );
      return;
    }

    setPlayState("idle");
    setPlaybackError("Audio could not be played. Check your connection, then try again.");
  }, []);

  const retryPlayback = useCallback(async () => {
    const request = lastPlayRequestRef.current;
    if (!request) return;
    setPlaybackError(null);
    await playVerseRef.current?.(
      request.verse,
      request.surahNum,
      request.surahArabic,
      request.surahName,
      request.allVerses,
      false,
      0,
    );
  }, []);

  const clearPlaybackError = useCallback(() => setPlaybackError(null), []);

  // ── 1. Initialise TrackPlayer once (native only, not Expo Go) ───────────────
  useEffect(() => {
    if (Platform.OS === "web" || isExpoGo) return;
    void ensureTrackPlayerReady().catch(() => {
      // playVerse will retry setup and surface a user-facing error if needed.
    });
  }, []);

  // Session mode is configured by the active audio owner, never on provider
  // mount (which could otherwise overwrite an Adhan or preview mid-playback).

  // ── 3. Subscribe to TrackPlayer events (native only, not Expo Go) ──────────
  useEffect(() => {
    if (Platform.OS === "web" || isExpoGo) return;
    let subs: Array<{ remove(): void }> = [];
    let disposed = false;

    // AppState listener — re-sync TrackPlayer state when the app comes to the
    // foreground so the UI reflects the true playback state after the OS may
    // have paused or stopped audio in the background.
    const appStateSub = AppState.addEventListener("change", async (nextState) => {
      if (nextState !== "active") return;
      try {
        await ensureTrackPlayerReady();
        if (disposed) return;
        const TrackPlayer = (await import("react-native-track-player")).default;
        const { State } = await import("react-native-track-player");
        const playerState = await TrackPlayer.getPlaybackState();
        const state = (playerState as any)?.state ?? playerState;
        if (state === State.Playing) setPlayState("playing");
        else if (state === State.Paused) setPlayState("paused");
        else if (state === State.Loading || state === State.Buffering) setPlayState("loading");
        else setPlayState("idle");
        const track = await TrackPlayer.getActiveTrack();
        if (track?.id) setPlayingVerse(Number(track.id));
      } catch {}
    });

    (async () => {
      try {
        await ensureTrackPlayerReady();
        if (disposed) return;
        const TrackPlayer = (await import("react-native-track-player")).default;
        const { Event, State } = await import("react-native-track-player");

        // Guard: only subscribe if the native module initialised successfully
        if (!TrackPlayer || typeof TrackPlayer.addEventListener !== "function") return;

        subs.push(
          TrackPlayer.addEventListener(Event.PlaybackState, ({ state }: { state: any }) => {
            if (state === State.Playing) setPlayState("playing");
            else if (state === State.Paused) setPlayState("paused");
            else if (state === State.Loading || state === State.Buffering)
              setPlayState("loading");
            else if (state === State.Stopped || state === State.None)
              setPlayState("idle");
            else if (state === State.Ended) {
              setPlayState("idle");
              setPlayingVerse(null);
            }
          })
        );

        subs.push(
          TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async ({ nextTrack }: { nextTrack: any }) => {
            const generation = playGenRef.current;
            if (nextTrack !== null && nextTrack !== undefined) {
              try {
                const track = await TrackPlayer.getActiveTrack();
                if (disposed || generation !== playGenRef.current) return;
                if (track?.id && track.nuurGeneration === generation) {
                  const verseNum = Number(track.id);
                  setPlayingVerse(verseNum);

                  // ── Dynamic queue expansion ──────────────────────────────
                  // When we're within 10 tracks of the end of the current
                  // window, append the next QUEUE_WINDOW batch so playback
                  // never hits a wall for long surahs like al-Baqarah.
                  const verses = versesRef.current;
                  const reciter = reciterRef.current;
                  const surahNum = surahNumRef.current;
                  const surahArabic = surahArabicRef.current;
                  const queuedUpTo = queuedUpToVerseRef.current;
                  const activeVerse = verses?.find((item) => item.number === verseNum);
                  if (activeVerse) {
                    currentVerseRef.current = activeVerse;
                    const previousRequest = lastPlayRequestRef.current;
                    if (previousRequest) {
                      lastPlayRequestRef.current = {
                        ...previousRequest,
                        verse: activeVerse,
                      };
                    }
                  }
                  if (
                    verses && surahNum && queuedUpTo &&
                    !isSurahLevelReciter(reciter) &&
                    autoAdvanceRef.current &&
                    verseNum >= queuedUpTo - 10
                  ) {
                    const nextBatchStart = queuedUpTo + 1;
                    const candidateIndex = lastPlayRequestRef.current?.candidateIndex ?? 0;
                    const nextBatch = verses
                      .filter((v) => v.number >= nextBatchStart && v.number < nextBatchStart + QUEUE_WINDOW)
                      .map((v) => {
                        const candidates = getSameReciterAudioCandidates(
                          reciter, surahNum, v.number, v.numberInQuran,
                        );
                        return {
                          id: String(v.number),
                          url: candidates[candidateIndex] ?? candidates[0],
                          title: `${surahArabic} — Ayah ${v.number}`,
                          artist: reciter.name,
                          album: "Quran · Nuur",
                          artwork: APP_ICON,
                          nuurGeneration: generation,
                        };
                      });
                    if (nextBatch.length > 0) {
                      try {
                        await runTrackPlayerCommand(async () => {
                          if (generation !== playGenRef.current || queuedUpToVerseRef.current !== queuedUpTo) return;
                          await TrackPlayer.add(nextBatch);
                          if (generation !== playGenRef.current) return;
                          queuedUpToVerseRef.current = Number(nextBatch[nextBatch.length - 1].id);
                        });
                      } catch {}
                    }
                  }
                }
              } catch {}
            }
          })
        );

        subs.push(
          TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
            const generation = playGenRef.current;
            // An end/reset event from the old queue can arrive after a rapid
            // verse/reciter change. Do not erase the new track's UI metadata.
            try {
              const track = await TrackPlayer.getActiveTrack();
              const playback = await TrackPlayer.getPlaybackState();
              if (disposed || generation !== playGenRef.current || track?.nuurGeneration !== generation) return;
              const state = (playback as any)?.state ?? playback;
              if (state !== State.Ended && state !== State.Stopped && state !== State.None) return;
            } catch { return; }
            setPlayingVerse(null);
            setPlayState("idle");
            setCurrentSurahNum(null);
            setCurrentSurahName(null);
            setCurrentSurahArabic(null);
          })
        );

        subs.push(
          TrackPlayer.addEventListener(Event.PlaybackError, async () => {
            // RNTP can deliver an error from the queue being replaced just
            // after a fallback starts. Give the current request a moment to
            // settle, then recover only if that same generation is still
            // active and the player is not healthy.
            const generation = lastPlayRequestRef.current?.generation;
            if (generation === undefined) return;
            await new Promise((resolve) => setTimeout(resolve, 400));
            if (disposed || lastPlayRequestRef.current?.generation !== generation) return;
            try {
              const playback = await TrackPlayer.getPlaybackState();
              const state = (playback as any)?.state ?? playback;
              if (
                state === State.Playing || state === State.Paused ||
                state === State.Loading || state === State.Buffering ||
                state === State.Ready
              ) {
                return;
              }
            } catch {
              // If state inspection itself fails, the visible retry path is
              // safer than silently leaving the UI stuck on Loading.
            }
            recoverFromPlaybackFailure(generation);
          })
        );
      } catch {
        // react-native-track-player native module unavailable (e.g. Expo Go)
        // Audio playback via TrackPlayer is disabled; app continues without it
      }
    })();

    return () => {
      disposed = true;
      subs.forEach((s) => s.remove());
      appStateSub.remove();
    };
  }, [recoverFromPlaybackFailure]);

  // ── 4. Sync playback rate ────────────────────────────────────────────────────
  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (Platform.OS === "web") {
      if (webSoundRef.current) {
        try { webSoundRef.current.playbackRate = playbackRate; } catch {}
      }
    } else if (isExpoGo) {
      try { expoAudioRef.current?.setRate(playbackRate); } catch {}
    } else {
      const generation = playGenRef.current;
      (async () => {
        try {
          await runTrackPlayerCommand(async () => {
            await ensureTrackPlayerReady();
            if (generation !== playGenRef.current) return;
            const TrackPlayer = (await import("react-native-track-player")).default;
            await TrackPlayer.setRate(playbackRate);
          });
        } catch {}
      })();
    }
  }, [playbackRate]);

  // ── 5. Load persisted preferences & last playing position ───────────────────
  useEffect(() => {
    AsyncStorage.getItem(AUTO_ADVANCE_KEY)
      .then((val) => {
        if (val === "false") {
          autoAdvanceRef.current = false;
          setAutoAdvanceState(false);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem(LAST_PLAYING_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const { surahNum, verseNum } = JSON.parse(raw);
          if (surahNum) setLastPlayingSurahNum(surahNum);
          if (verseNum) setLastPlayingVerseNum(verseNum);
        } catch {}
      })
      .catch(() => {});
  }, []);

  const setAutoAdvance = useCallback((value: boolean) => {
    autoAdvanceRef.current = value;
    setAutoAdvanceState(value);
    AsyncStorage.setItem(AUTO_ADVANCE_KEY, String(value)).catch(() => {});
    // When turning OFF on native TrackPlayer, reset the queue to single current verse
    if (!value && Platform.OS !== "web" && !isExpoGo) {
      const generation = playGenRef.current;
      (async () => {
        try {
          await runTrackPlayerCommand(async () => {
          await ensureTrackPlayerReady();
          if (generation !== playGenRef.current) return;
          const TrackPlayer = (await import("react-native-track-player")).default;
          const track = await TrackPlayer.getActiveTrack();
          if (track) {
            const queue = await TrackPlayer.getQueue();
            const activeIdx = await TrackPlayer.getActiveTrackIndex();
            if (activeIdx !== null && activeIdx !== undefined && queue.length > activeIdx + 1) {
              // Remove all tracks after the current one
              const removeCount = queue.length - activeIdx - 1;
              for (let i = 0; i < removeCount; i++) {
                if (generation !== playGenRef.current) return;
                try { await TrackPlayer.remove(activeIdx + 1); } catch {}
              }
            }
          }
          });
        } catch {}
      })();
    }
  }, []);

  // ── stopAudio ────────────────────────────────────────────────────────────────
  const stopAudio = useCallback(async (requireConfirmedStop = false) => {
    // Invalidate any in-flight playVerse — its post-await assignments and
    // play() calls will detect the bumped generation and abort.
    playGenRef.current += 1;
    audioFocusRef.current?.release();
    audioFocusRef.current = null;
    queuedUpToVerseRef.current = null;
    lastPlayRequestRef.current = null;
    setPlayingVerse(null);
    setPlayState("idle");
    setPlaybackError(null);
    if (Platform.OS === "web") {
      if (webSoundRef.current) {
        try {
          webSoundRef.current.onended = null;
          webSoundRef.current.onerror = null;
          webSoundRef.current.pause();
          webSoundRef.current.src = "";
        } catch {}
        webSoundRef.current = null;
      }
      if (preloadRef.current) {
        try { preloadRef.current.audio.src = ""; } catch {}
        preloadRef.current = null;
      }
      if ("mediaSession" in navigator) {
        try { navigator.mediaSession.playbackState = "none"; } catch {}
      }
    } else if (isExpoGo) {
      expoAudioRef.current?.stop();
      expoAudioRef.current = null;
    } else {
      try {
        await runTrackPlayerCommand(async () => {
          await ensureTrackPlayerReady();
          const TrackPlayer = (await import("react-native-track-player")).default;
          await TrackPlayer.reset();
        });
      } catch (error) {
        if (requireConfirmedStop) throw error;
        setPlaybackError("Audio could not be stopped. Close and reopen Nuur before starting another sound.");
      }
    }
  }, []);

  useEffect(() => () => { void stopAudio(); }, [stopAudio]);

  // ── Web-only: preload next verse ─────────────────────────────────────────────
  const preloadNext = useCallback((verse: PlayerVerse, currentVerses: PlayerVerse[]) => {
    if (Platform.OS !== "web") return;
    if (isSurahLevelReciter(reciterRef.current)) return;
    const next = currentVerses.find((v) => v.number === verse.number + 1);
    if (!next) return;
    const surahNum = surahNumRef.current!;
    const reciter = reciterRef.current;
    if (preloadRef.current?.verseNum !== next.number) {
      try { preloadRef.current?.audio.src && (preloadRef.current.audio.src = ""); } catch {}
      const url = getVerseAudioUrl(reciter, surahNum, next.number, next.numberInQuran);
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.load();
      preloadRef.current = { verseNum: next.number, audio };
    }
    const afterNext = currentVerses.find((v) => v.number === next.number + 1);
    if (afterNext) {
      const url2 = getVerseAudioUrl(reciter, surahNum, afterNext.number, afterNext.numberInQuran);
      const a2 = new Audio(url2);
      a2.preload = "auto";
      a2.load();
    }
  }, []);

  // ── skipNext / skipPrevious ──────────────────────────────────────────────────
  const skipNext = useCallback(async () => {
    if (Platform.OS === "web") {
      if (webSoundRef.current) {
        // Pause the old element FIRST so it goes silent immediately.
        // Without this, dispatchEvent("ended") starts the next verse while the
        // old audio keeps playing, causing two simultaneous streams.
        webSoundRef.current.pause();
        webSoundRef.current.dispatchEvent(new Event("ended"));
      }
    } else if (isExpoGo) {
      // Explicit stop does not trigger completion/auto-advance.
      try {
        expoAudioRef.current?.stop();
        expoAudioRef.current = null;
        const currentVerses = versesRef.current;
        const curVerse     = currentVerseRef.current;
        const curSurahNum  = surahNumRef.current!;
        const curSurahArabic = surahArabicRef.current;
        const curSurahName   = surahNameRef.current;
        const reciter = reciterRef.current;
        if (!isSurahLevelReciter(reciter) && currentVerses && curVerse) {
          const next = currentVerses.find((v) => v.number === curVerse.number + 1);
          if (next) {
            await playVerseRef.current?.(next, curSurahNum, curSurahArabic, curSurahName, currentVerses, true);
            return;
          }
        }
        // No next verse — reset to idle
        setPlayingVerse(null);
        setPlayState("idle");
        setCurrentSurahNum(null);
        setCurrentSurahName(null);
        setCurrentSurahArabic(null);
      } catch {}
    } else {
      const generation = playGenRef.current;
      try {
        await runTrackPlayerCommand(async () => {
          await ensureTrackPlayerReady();
          if (generation !== playGenRef.current) return;
          const TrackPlayer = (await import("react-native-track-player")).default;
          const activeIndex = await TrackPlayer.getActiveTrackIndex();
          const queue = await TrackPlayer.getQueue();
          if (generation !== playGenRef.current) return;
          if (activeIndex !== undefined && activeIndex + 1 < queue.length) await TrackPlayer.skipToNext();
        });
      } catch {
        recoverFromPlaybackFailure(playGenRef.current);
      }
    }
  }, [recoverFromPlaybackFailure]);

  const skipPrevious = useCallback(async () => {
    if (Platform.OS === "web") {
      if (webSoundRef.current) {
        webSoundRef.current.currentTime = 0;
        webSoundRef.current.play().catch(() => {});
      }
    } else if (isExpoGo) {
      try { await expoAudioRef.current?.seekTo(0); } catch {}
    } else {
      const generation = playGenRef.current;
      try {
        await runTrackPlayerCommand(async () => {
          await ensureTrackPlayerReady();
          if (generation !== playGenRef.current) return;
          const TrackPlayer = (await import("react-native-track-player")).default;
          const activeIndex = await TrackPlayer.getActiveTrackIndex();
          if (generation !== playGenRef.current) return;
          if (activeIndex && activeIndex > 0) await TrackPlayer.skipToPrevious();
          else await TrackPlayer.seekTo(0);
        });
      } catch {
        recoverFromPlaybackFailure(playGenRef.current);
      }
    }
  }, [recoverFromPlaybackFailure]);

  // ── playVerse ────────────────────────────────────────────────────────────────
  const playVerse = useCallback(
    async (
      verse: PlayerVerse,
      surahNum: number,
      surahArabic: string,
      surahName: string,
      allVerses: PlayerVerse[],
      isAutoAdvance = false,
      requestedCandidateIndex = 0,
    ) => {
      // Claim this generation. Any older in-flight playVerse will see a newer
      // value here after its awaits and abort before assigning sound refs or
      // calling play(), preventing overlapping audio streams from rapid taps.
      const myGen = ++playGenRef.current;
      surahNumRef.current = surahNum;
      surahArabicRef.current = surahArabic;
      surahNameRef.current = surahName;
      versesRef.current = allVerses;
      currentVerseRef.current = verse;

      setCurrentSurahNum(surahNum);
      setCurrentSurahArabic(surahArabic);
      setCurrentSurahName(surahName);
      setPlayingVerse(verse.number);
      // Persist last playing position so the screen can restore scroll on return
      setLastPlayingSurahNum(surahNum);
      setLastPlayingVerseNum(verse.number);
      AsyncStorage.setItem(LAST_PLAYING_KEY, JSON.stringify({ surahNum, verseNum: verse.number })).catch(() => {});
      setPlayState("loading");
      setPlaybackError(null);

      const reciterForRequest = reciterRef.current;
      const candidates = getSameReciterAudioCandidates(
        reciterForRequest,
        surahNum,
        verse.number,
        verse.numberInQuran,
      );
      const candidateIndex = Math.min(
        Math.max(0, requestedCandidateIndex),
        candidates.length - 1,
      );
      const url = candidates[candidateIndex];
      lastPlayRequestRef.current = {
        verse,
        surahNum,
        surahArabic,
        surahName,
        allVerses,
        candidateIndex,
        candidateCount: candidates.length,
        generation: myGen,
      };

      try {
        const focus = await acquireAudioFocus("quran", () => stopAudio(true));
        if (myGen !== playGenRef.current || !focus.isCurrent()) { focus.release(); return; }
        audioFocusRef.current = focus;
      } catch {
        recoverFromPlaybackFailure(myGen);
        return;
      }

      if (Platform.OS === "web") {
        // ── WEB PATH (unchanged HTMLAudioElement logic) ─────────────────────
        const onEnded = () => {
          if (myGen !== playGenRef.current) return;
          const finishedAudio = webSoundRef.current;
          if (finishedAudio) {
            finishedAudio.onended = null;
            finishedAudio.onerror = null;
            finishedAudio.pause();
            finishedAudio.src = "";
          }
          webSoundRef.current = null;
          const currentVerses = versesRef.current;
          const curSurahNum = surahNumRef.current!;
          const curSurahArabic = surahArabicRef.current;
          const curSurahName = surahNameRef.current;
          const reciter = reciterRef.current;
          if (autoAdvanceRef.current && !isSurahLevelReciter(reciter) && currentVerses) {
            const next = currentVerses.find((v) => v.number === verse.number + 1);
            if (next) {
              playVerse(next, curSurahNum, curSurahArabic, curSurahName, currentVerses, true);
              return;
            }
          }
          setPlayingVerse(null);
          setPlayState("idle");
          if ("mediaSession" in navigator) {
            try { navigator.mediaSession.playbackState = "none"; } catch {}
          }
        };

        if (webSoundRef.current) {
          try {
            webSoundRef.current.onended = null;
            webSoundRef.current.onerror = null;
            webSoundRef.current.pause();
            webSoundRef.current.src = "";
          } catch {}
          webSoundRef.current = null;
        }

        try {
          let audio: HTMLAudioElement;
          if (candidateIndex === 0 && preloadRef.current?.verseNum === verse.number) {
            audio = preloadRef.current.audio;
            preloadRef.current = null;
          } else {
            preloadRef.current = null;
            audio = new Audio(url);
            audio.preload = "auto";
            audio.load();
          }

          // If a newer playVerse started while we were preparing this audio
          // element, tear it down immediately and abort — otherwise the old
          // and new tracks would play simultaneously.
          if (myGen !== playGenRef.current) {
            try { audio.pause(); audio.src = ""; } catch {}
            return;
          }
          webSoundRef.current = audio;
          audio.onerror = () => recoverFromPlaybackFailure(myGen);
          audio.onended = onEnded;
          audio.playbackRate = playbackRateRef.current;

          if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: `${surahArabic} — Verse ${verse.number}`,
              artist: reciterRef.current.name,
              album: "Quran · Nuur",
            });
            navigator.mediaSession.playbackState = "playing";
            navigator.mediaSession.setActionHandler("pause", () => {
              audio.pause();
              setPlayState("paused");
              navigator.mediaSession.playbackState = "paused";
            });
            navigator.mediaSession.setActionHandler("play", () => {
              audio.play().catch(() => recoverFromPlaybackFailure(myGen));
              setPlayState("playing");
              navigator.mediaSession.playbackState = "playing";
            });
            navigator.mediaSession.setActionHandler("nexttrack", onEnded);
            navigator.mediaSession.setActionHandler("stop", () => { stopAudio(); });
          }

          setPlayState("playing");
          audio.play().catch(() => recoverFromPlaybackFailure(myGen));
          preloadNext(verse, allVerses);
        } catch {
          recoverFromPlaybackFailure(myGen);
        }
      } else if (isExpoGo) {
        // ── EXPO GO PATH (expo-audio — no production background controls) ────
        try {
          expoAudioRef.current?.stop();
          const session = createAudioPlayback(url, {
            background: false,
            rate: playbackRateRef.current,
            onState: (state) => { if (myGen === playGenRef.current) setPlayState(state); },
            onError: () => recoverFromPlaybackFailure(myGen),
            onFinish: () => {
              if (myGen !== playGenRef.current) return;
              expoAudioRef.current = null;
              const currentVerses = versesRef.current;
              const curSurahNum = surahNumRef.current!;
              const curSurahArabic = surahArabicRef.current;
              const curSurahName = surahNameRef.current;
              const reciter = reciterRef.current;
              if (autoAdvanceRef.current && !isSurahLevelReciter(reciter) && currentVerses) {
                const next = currentVerses.find((v) => v.number === verse.number + 1);
                if (next) {
                  void playVerse(next, curSurahNum, curSurahArabic, curSurahName, currentVerses, true);
                  return;
                }
              }
              setPlayingVerse(null);
              setPlayState("idle");
              setCurrentSurahNum(null);
              setCurrentSurahName(null);
              setCurrentSurahArabic(null);
            },
          });
          expoAudioRef.current = session;
          await session.start();
        } catch {
          recoverFromPlaybackFailure(myGen);
        }
      } else {
        // ── NATIVE PATH (react-native-track-player) ─────────────────────────
        try {
          await runTrackPlayerCommand(async () => {
          await ensureTrackPlayerReady();
          await flushAudioSessionChanges();
          if (myGen !== playGenRef.current) return;
          const TrackPlayer = (await import("react-native-track-player")).default;
          const reciter = reciterRef.current;
          const surahLevel = isSurahLevelReciter(reciter);

          let tracks: Array<{
            id: string; url: string; title: string; artist: string; album: string; artwork: any; nuurGeneration: number;
          }>;

          if (surahLevel) {
            tracks = [
              {
                id: String(verse.number),
                url,
                title: surahArabic,
                artist: reciter.name,
                album: "Quran · Nuur",
                artwork: APP_ICON,
                nuurGeneration: myGen,
              },
            ];
          } else if (autoAdvanceRef.current) {
            // Queue only the next QUEUE_WINDOW verses. The PlaybackTrackChanged
            // handler will append the next batch dynamically before the queue
            // runs out — this prevents iOS instability from large queues.
            const windowVerses = allVerses.filter(
              (v) => v.number >= verse.number && v.number < verse.number + QUEUE_WINDOW
            );
            tracks = windowVerses.map((v) => {
              const verseCandidates = getSameReciterAudioCandidates(
                reciter, surahNum, v.number, v.numberInQuran,
              );
              return {
                id: String(v.number),
                url: verseCandidates[candidateIndex] ?? verseCandidates[0],
                title: `${surahArabic} — Ayah ${v.number}`,
                artist: reciter.name,
                album: "Quran · Nuur",
                artwork: APP_ICON,
                nuurGeneration: myGen,
              };
            });
            // Track the highest verse number in the initial window
            queuedUpToVerseRef.current = windowVerses.length > 0
              ? windowVerses[windowVerses.length - 1].number
              : verse.number;
          } else {
            // Auto-advance is off — queue only the tapped verse
            tracks = [
              {
                id: String(verse.number),
                url,
                title: `${surahArabic} — Ayah ${verse.number}`,
                artist: reciter.name,
                album: "Quran · Nuur",
                artwork: APP_ICON,
                nuurGeneration: myGen,
              },
            ];
          }

          await TrackPlayer.reset();
          // Abort if a newer playVerse started while reset was in flight —
          // otherwise our add() + play() would race against the newer call's
          // queue and could leave two tracks active simultaneously.
          if (myGen !== playGenRef.current) return;
          await TrackPlayer.add(tracks);
          if (myGen !== playGenRef.current) return;
          if (playbackRateRef.current !== 1.0) {
            await TrackPlayer.setRate(playbackRateRef.current);
          }
          if (myGen !== playGenRef.current) return;
          await TrackPlayer.play();
          if (myGen !== playGenRef.current) return;
          setPlayState("playing");
          setPlayingVerse(verse.number);
          });
        } catch {
          recoverFromPlaybackFailure(myGen);
        }
      }
    },
    [preloadNext, recoverFromPlaybackFailure, stopAudio]
  );
  // Keep the ref in sync so skipNext can always call the latest playVerse.
  playVerseRef.current = playVerse;

  // ── togglePlayPause ──────────────────────────────────────────────────────────
  const togglePlayPause = useCallback(
    async (
      verse: PlayerVerse,
      surahNum: number,
      surahArabic: string,
      surahName: string,
      allVerses: PlayerVerse[]
    ) => {
      const generation = playGenRef.current;
      if (playingVerse === verse.number && playState === "playing") {
        try {
          if (Platform.OS === "web") {
            webSoundRef.current?.pause();
            if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
          } else if (isExpoGo) {
            expoAudioRef.current?.pause();
          } else {
            await runTrackPlayerCommand(async () => {
              await ensureTrackPlayerReady();
              if (generation !== playGenRef.current) return;
              const TrackPlayer = (await import("react-native-track-player")).default;
              await TrackPlayer.pause();
            });
          }
          if (generation !== playGenRef.current) return;
          setPlayState("paused");
        } catch {
          recoverFromPlaybackFailure(playGenRef.current);
        }
      } else if (playingVerse === verse.number && playState === "paused") {
        try {
          if (Platform.OS === "web") {
            await webSoundRef.current?.play();
            if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
          } else if (isExpoGo) {
            await expoAudioRef.current?.resume();
          } else {
            await runTrackPlayerCommand(async () => {
              await ensureTrackPlayerReady();
              if (generation !== playGenRef.current) return;
              const TrackPlayer = (await import("react-native-track-player")).default;
              await TrackPlayer.play();
            });
          }
          if (generation !== playGenRef.current) return;
          setPlayState("playing");
        } catch {
          recoverFromPlaybackFailure(playGenRef.current);
        }
      } else {
        await playVerse(verse, surahNum, surahArabic, surahName, allVerses);
      }
    },
    [playingVerse, playState, playVerse, recoverFromPlaybackFailure]
  );

  const setSelectedReciter = useCallback((reciter: Reciter) => {
    if (reciter.id !== reciterRef.current.id) void stopAudio();
    reciterRef.current = reciter;
    setSelectedReciterState(reciter);
  }, [stopAudio]);

  const setPlaybackRate = useCallback((rate: number) => {
    playbackRateRef.current = rate;
    setPlaybackRateState(rate);
  }, []);

  return (
    <QuranPlayerContext.Provider
      value={{
        playState,
        playbackError,
        playingVerse,
        playbackRate,
        selectedReciter,
        currentSurahNum,
        currentSurahName,
        currentSurahArabic,
        lastPlayingSurahNum,
        lastPlayingVerseNum,
        playVerse,
        stopAudio,
        togglePlayPause,
        skipNext,
        skipPrevious,
        retryPlayback,
        clearPlaybackError,
        autoAdvance,
        setAutoAdvance,
        setSelectedReciter,
        setPlaybackRate,
      }}
    >
      {children}
    </QuranPlayerContext.Provider>
  );
}

export function useQuranPlayer() {
  const ctx = useContext(QuranPlayerContext);
  if (!ctx) throw new Error("useQuranPlayer must be used within QuranPlayerProvider");
  return ctx;
}

/** Height of the mini player bar when it is visible. */
export const MINI_PLAYER_HEIGHT = 64;

/**
 * Returns the extra bottom offset that scrollable content must add so the
 * mini player never obscures the last item.  Returns 0 when the player is idle.
 */
export function useMiniPlayerHeight(): number {
  const { playState, currentSurahNum, playbackError } = useQuranPlayer();
  const isVisible =
    (playState === "playing" || playState === "paused" || playbackError !== null) &&
    currentSurahNum !== null;
  return isVisible ? MINI_PLAYER_HEIGHT : 0;
}
