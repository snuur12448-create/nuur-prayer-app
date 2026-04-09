import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { DEFAULT_RECITER, getVerseAudioUrl, isSurahLevelReciter, Reciter } from "@/utils/audioData";

const AUTO_ADVANCE_KEY = "nuur_quran_auto_advance";

// react-native-track-player requires a custom native build and is NOT available
// in Expo Go (executionEnvironment === "storeClient"). Importing it in Expo Go
// causes an invariant crash at the module level, so we skip it entirely.
const isExpoGo = Constants.executionEnvironment === "storeClient";

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
  playingVerse: number | null;
  playbackRate: number;
  selectedReciter: Reciter;
  currentSurahNum: number | null;
  currentSurahName: string | null;
  currentSurahArabic: string | null;
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
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [selectedReciter, setSelectedReciterState] = useState<Reciter>(DEFAULT_RECITER);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [currentSurahNum, setCurrentSurahNum] = useState<number | null>(null);
  const [currentSurahName, setCurrentSurahName] = useState<string | null>(null);
  const [currentSurahArabic, setCurrentSurahArabic] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvanceState] = useState<boolean>(true);
  const autoAdvanceRef = useRef<boolean>(true);

  // Web-only refs
  const webSoundRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<{ verseNum: number; audio: HTMLAudioElement } | null>(null);

  // Expo Go refs — expo-av Sound (no native track player, no lock-screen controls)
  const expoAvSoundRef = useRef<any>(null);

  // Shared refs
  const playbackRateRef = useRef<number>(1.0);
  const reciterRef = useRef<Reciter>(DEFAULT_RECITER);
  const surahNumRef = useRef<number | null>(null);
  const surahArabicRef = useRef<string>("");
  const surahNameRef = useRef<string>("");
  const versesRef = useRef<PlayerVerse[] | null>(null);
  const tpReadyRef = useRef(false);
  // Tracks the verse currently playing so skipNext can advance without relying
  // on the playingVerse state (which is stale inside useCallback closures).
  const currentVerseRef = useRef<PlayerVerse | null>(null);
  // Stable ref to playVerse — lets skipNext call it without a forward-reference
  // in the deps array (which causes a TDZ crash under the React Compiler).
  const playVerseRef = useRef<
    ((verse: PlayerVerse, surahNum: number, surahArabic: string, surahName: string, allVerses: PlayerVerse[], isAutoAdvance?: boolean) => Promise<void>) | null
  >(null);

  // ── 1. Initialise TrackPlayer once (native only, not Expo Go) ───────────────
  useEffect(() => {
    if (Platform.OS === "web" || isExpoGo) return;
    (async () => {
      try {
        const TrackPlayer = (await import("react-native-track-player")).default;
        const { Capability, AppKilledPlaybackBehavior } = await import("react-native-track-player");
        await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
          progressUpdateEventInterval: 1,
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
        });
        tpReadyRef.current = true;
      } catch (e: any) {
        // "Already been initialized" on hot reload — still usable
        const msg = e?.message ?? "";
        if (msg.includes("already") || msg.includes("initialized")) {
          tpReadyRef.current = true;
        }
        // Otherwise native module is missing (e.g. Expo Go) — leave tpReadyRef false
      }
    })();
  }, []);

  // ── 2. Configure expo-av audio session (all native — Expo Go + standalone) ──
  // Must be called before ANY Sound.createAsync, otherwise iOS silently
  // drops playback.  Expo Go cannot hold background audio, so we only set
  // staysActiveInBackground=true for real standalone builds.
  useEffect(() => {
    if (Platform.OS === "web") return;
    (async () => {
      try {
        const { Audio, InterruptionModeIOS, InterruptionModeAndroid } = await import("expo-av");
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: !isExpoGo,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch {}
    })();
  }, []);

  // ── 3. Subscribe to TrackPlayer events (native only, not Expo Go) ──────────
  useEffect(() => {
    if (Platform.OS === "web" || isExpoGo) return;
    let subs: Array<{ remove(): void }> = [];
    (async () => {
      try {
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
            if (nextTrack !== null && nextTrack !== undefined) {
              try {
                const track = await TrackPlayer.getActiveTrack();
                if (track?.id) setPlayingVerse(Number(track.id));
              } catch {}
            }
          })
        );

        subs.push(
          TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
            setPlayingVerse(null);
            setPlayState("idle");
            setCurrentSurahNum(null);
            setCurrentSurahName(null);
            setCurrentSurahArabic(null);
          })
        );
      } catch {
        // react-native-track-player native module unavailable (e.g. Expo Go)
        // Audio playback via TrackPlayer is disabled; app continues without it
      }
    })();

    return () => { subs.forEach((s) => s.remove()); };
  }, []);

  // ── 4. Sync playback rate ────────────────────────────────────────────────────
  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (Platform.OS === "web") {
      if (webSoundRef.current) {
        try { webSoundRef.current.playbackRate = playbackRate; } catch {}
      }
    } else if (isExpoGo) {
      try { expoAvSoundRef.current?.setRateAsync(playbackRate, true); } catch {}
    } else {
      (async () => {
        try {
          const TrackPlayer = (await import("react-native-track-player")).default;
          await TrackPlayer.setRate(playbackRate);
        } catch {}
      })();
    }
  }, [playbackRate]);

  // ── 5. Load persisted autoAdvance preference ─────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(AUTO_ADVANCE_KEY)
      .then((val) => {
        if (val === "false") {
          autoAdvanceRef.current = false;
          setAutoAdvanceState(false);
        }
      })
      .catch(() => {});
  }, []);

  const setAutoAdvance = useCallback((value: boolean) => {
    autoAdvanceRef.current = value;
    setAutoAdvanceState(value);
    AsyncStorage.setItem(AUTO_ADVANCE_KEY, String(value)).catch(() => {});
    // When turning OFF on native TrackPlayer, reset the queue to single current verse
    if (!value && Platform.OS !== "web" && !isExpoGo) {
      (async () => {
        try {
          const TrackPlayer = (await import("react-native-track-player")).default;
          const track = await TrackPlayer.getActiveTrack();
          if (track) {
            const queue = await TrackPlayer.getQueue();
            const activeIdx = await TrackPlayer.getActiveTrackIndex();
            if (activeIdx !== null && activeIdx !== undefined && queue.length > activeIdx + 1) {
              // Remove all tracks after the current one
              const removeCount = queue.length - activeIdx - 1;
              for (let i = 0; i < removeCount; i++) {
                try { await TrackPlayer.remove(activeIdx + 1); } catch {}
              }
            }
          }
        } catch {}
      })();
    }
  }, []);

  // ── stopAudio ────────────────────────────────────────────────────────────────
  const stopAudio = useCallback(async () => {
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
      try {
        if (expoAvSoundRef.current) {
          await expoAvSoundRef.current.stopAsync();
          await expoAvSoundRef.current.unloadAsync();
          expoAvSoundRef.current = null;
        }
      } catch {}
    } else {
      try {
        const TrackPlayer = (await import("react-native-track-player")).default;
        await TrackPlayer.reset();
      } catch {}
    }
    setPlayingVerse(null);
    setPlayState("idle");
  }, []);

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
      // stopAsync() does NOT trigger didJustFinish, so we cannot rely on the
      // playback-status callback for the advance. Stop the sound manually and
      // advance using the same refs the auto-advance path uses.
      try {
        if (expoAvSoundRef.current) {
          await expoAvSoundRef.current.stopAsync();
          await expoAvSoundRef.current.unloadAsync();
          expoAvSoundRef.current = null;
        }
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
      try {
        const TrackPlayer = (await import("react-native-track-player")).default;
        await TrackPlayer.skipToNext();
      } catch {}
    }
  }, []);

  const skipPrevious = useCallback(async () => {
    if (Platform.OS === "web") {
      if (webSoundRef.current) {
        webSoundRef.current.currentTime = 0;
        webSoundRef.current.play().catch(() => {});
      }
    } else if (isExpoGo) {
      try { await expoAvSoundRef.current?.setPositionAsync(0); } catch {}
    } else {
      try {
        const TrackPlayer = (await import("react-native-track-player")).default;
        await TrackPlayer.skipToPrevious();
      } catch {}
    }
  }, []);

  // ── playVerse ────────────────────────────────────────────────────────────────
  const playVerse = useCallback(
    async (
      verse: PlayerVerse,
      surahNum: number,
      surahArabic: string,
      surahName: string,
      allVerses: PlayerVerse[],
      isAutoAdvance = false
    ) => {
      surahNumRef.current = surahNum;
      surahArabicRef.current = surahArabic;
      surahNameRef.current = surahName;
      versesRef.current = allVerses;
      currentVerseRef.current = verse;

      setCurrentSurahNum(surahNum);
      setCurrentSurahArabic(surahArabic);
      setCurrentSurahName(surahName);
      setPlayingVerse(verse.number);
      if (!isAutoAdvance) setPlayState("loading");

      const url = getVerseAudioUrl(reciterRef.current, surahNum, verse.number, verse.numberInQuran);

      if (Platform.OS === "web") {
        // ── WEB PATH (unchanged HTMLAudioElement logic) ─────────────────────
        const onEnded = () => {
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

        if (!isAutoAdvance && webSoundRef.current) {
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
          if (preloadRef.current?.verseNum === verse.number) {
            audio = preloadRef.current.audio;
            preloadRef.current = null;
          } else {
            preloadRef.current = null;
            audio = new Audio(url);
            audio.preload = "auto";
            audio.load();
          }

          webSoundRef.current = audio;
          audio.onerror = () => { setPlayState("idle"); };
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
              audio.play().catch(() => {});
              setPlayState("playing");
              navigator.mediaSession.playbackState = "playing";
            });
            navigator.mediaSession.setActionHandler("nexttrack", onEnded);
            navigator.mediaSession.setActionHandler("stop", () => { stopAudio(); });
          }

          setPlayState("playing");
          audio.play().catch(() => { setPlayState("idle"); });
          preloadNext(verse, allVerses);
        } catch {
          setPlayState("idle");
        }
      } else if (isExpoGo) {
        // ── EXPO GO PATH (expo-av Audio.Sound — no lock-screen controls) ──────
        try {
          const { Audio } = await import("expo-av");
          // Unload any previous sound
          if (expoAvSoundRef.current) {
            try {
              await expoAvSoundRef.current.stopAsync();
              await expoAvSoundRef.current.unloadAsync();
            } catch {}
            expoAvSoundRef.current = null;
          }
          const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: true, volume: 1.0 }
          );
          // Apply playback rate after creation; rate in initial options can
          // silently throw on some iOS SDK versions.
          if (playbackRateRef.current !== 1.0) {
            try { await sound.setRateAsync(playbackRateRef.current, true); } catch {}
          }
          expoAvSoundRef.current = sound;
          setPlayState("playing");
          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (!status.isLoaded) return;
            if (status.didJustFinish) {
              expoAvSoundRef.current = null;
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
              setCurrentSurahNum(null);
              setCurrentSurahName(null);
              setCurrentSurahArabic(null);
            }
          });
        } catch {
          setPlayState("idle");
        }
      } else {
        // ── NATIVE PATH (react-native-track-player) ─────────────────────────
        try {
          const TrackPlayer = (await import("react-native-track-player")).default;
          const reciter = reciterRef.current;
          const surahLevel = isSurahLevelReciter(reciter);

          let tracks: Array<{
            id: string; url: string; title: string; artist: string; album: string; artwork: any;
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
              },
            ];
          } else if (autoAdvanceRef.current) {
            // Queue all remaining verses so TrackPlayer advances automatically
            tracks = allVerses
              .filter((v) => v.number >= verse.number)
              .map((v) => ({
                id: String(v.number),
                url: getVerseAudioUrl(reciter, surahNum, v.number, v.numberInQuran),
                title: `${surahArabic} — Ayah ${v.number}`,
                artist: reciter.name,
                album: "Quran · Nuur",
                artwork: APP_ICON,
              }));
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
              },
            ];
          }

          await TrackPlayer.reset();
          await TrackPlayer.add(tracks);
          if (playbackRateRef.current !== 1.0) {
            await TrackPlayer.setRate(playbackRateRef.current);
          }
          await TrackPlayer.play();
          setPlayState("playing");
          setPlayingVerse(verse.number);
        } catch {
          setPlayState("idle");
        }
      }
    },
    [preloadNext, stopAudio]
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
      if (playingVerse === verse.number && playState === "playing") {
        try {
          if (Platform.OS === "web") {
            webSoundRef.current?.pause();
            if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
          } else if (isExpoGo) {
            await expoAvSoundRef.current?.pauseAsync();
          } else {
            const TrackPlayer = (await import("react-native-track-player")).default;
            await TrackPlayer.pause();
          }
          setPlayState("paused");
        } catch {}
      } else if (playingVerse === verse.number && playState === "paused") {
        try {
          if (Platform.OS === "web") {
            await webSoundRef.current?.play();
            if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
          } else if (isExpoGo) {
            await expoAvSoundRef.current?.playAsync();
          } else {
            const TrackPlayer = (await import("react-native-track-player")).default;
            await TrackPlayer.play();
          }
          setPlayState("playing");
        } catch {}
      } else {
        await playVerse(verse, surahNum, surahArabic, surahName, allVerses);
      }
    },
    [playingVerse, playState, playVerse]
  );

  const setSelectedReciter = useCallback((reciter: Reciter) => {
    reciterRef.current = reciter;
    setSelectedReciterState(reciter);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playbackRateRef.current = rate;
    setPlaybackRateState(rate);
  }, []);

  return (
    <QuranPlayerContext.Provider
      value={{
        playState,
        playingVerse,
        playbackRate,
        selectedReciter,
        currentSurahNum,
        currentSurahName,
        currentSurahArabic,
        playVerse,
        stopAudio,
        togglePlayPause,
        skipNext,
        skipPrevious,
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
  const { playState, currentSurahNum } = useQuranPlayer();
  const isVisible =
    (playState === "playing" || playState === "paused") &&
    currentSurahNum !== null;
  return isVisible ? MINI_PLAYER_HEIGHT : 0;
}
