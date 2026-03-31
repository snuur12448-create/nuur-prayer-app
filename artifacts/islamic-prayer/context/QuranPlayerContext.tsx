import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { DEFAULT_RECITER, getVerseAudioUrl, isSurahLevelReciter, Reciter } from "@/utils/audioData";

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

  // Web-only refs
  const webSoundRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<{ verseNum: number; audio: HTMLAudioElement } | null>(null);

  // Shared refs
  const playbackRateRef = useRef<number>(1.0);
  const reciterRef = useRef<Reciter>(DEFAULT_RECITER);
  const surahNumRef = useRef<number | null>(null);
  const surahArabicRef = useRef<string>("");
  const surahNameRef = useRef<string>("");
  const versesRef = useRef<PlayerVerse[] | null>(null);
  const tpReadyRef = useRef(false);

  // ── 1. Initialise TrackPlayer once (native only) ────────────────────────────
  useEffect(() => {
    if (Platform.OS === "web") return;
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

  // ── 2. Configure expo-av audio session for background playback (native) ─────
  useEffect(() => {
    if (Platform.OS === "web") return;
    (async () => {
      try {
        const { Audio, InterruptionModeIOS, InterruptionModeAndroid } = await import("expo-av");
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch {}
    })();
  }, []);

  // ── 3. Subscribe to TrackPlayer events (native only) ────────────────────────
  useEffect(() => {
    if (Platform.OS === "web") return;
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
    } else {
      (async () => {
        try {
          const TrackPlayer = (await import("react-native-track-player")).default;
          await TrackPlayer.setRate(playbackRate);
        } catch {}
      })();
    }
  }, [playbackRate]);

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
      // Trigger onended of the current web audio to auto-advance
      if (webSoundRef.current) {
        webSoundRef.current.dispatchEvent(new Event("ended"));
      }
    } else {
      try {
        const TrackPlayer = (await import("react-native-track-player")).default;
        await TrackPlayer.skipToNext();
      } catch {}
    }
  }, []);

  const skipPrevious = useCallback(async () => {
    if (Platform.OS === "web") {
      // Restart current verse on web
      if (webSoundRef.current) {
        webSoundRef.current.currentTime = 0;
        webSoundRef.current.play().catch(() => {});
      }
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
          if (!isSurahLevelReciter(reciter) && currentVerses) {
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
            // One audio file covers the whole surah — add a single track
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
          } else {
            // Verse-level reciter — queue this verse and every subsequent verse
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
