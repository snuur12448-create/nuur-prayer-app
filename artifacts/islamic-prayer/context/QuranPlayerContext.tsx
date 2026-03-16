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
  setSelectedReciter: (reciter: Reciter) => void;
  setPlaybackRate: (rate: number) => void;
}

const QuranPlayerContext = createContext<QuranPlayerContextType | null>(null);

export function QuranPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [selectedReciter, setSelectedReciterState] = useState<Reciter>(DEFAULT_RECITER);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [currentSurahNum, setCurrentSurahNum] = useState<number | null>(null);
  const [currentSurahName, setCurrentSurahName] = useState<string | null>(null);
  const [currentSurahArabic, setCurrentSurahArabic] = useState<string | null>(null);

  const soundRef = useRef<any>(null);
  const preloadRef = useRef<{ verseNum: number; audio: HTMLAudioElement } | null>(null);
  const playbackRateRef = useRef<number>(1.0);
  const reciterRef = useRef<Reciter>(DEFAULT_RECITER);
  const surahNumRef = useRef<number | null>(null);
  const surahArabicRef = useRef<string>("");
  const surahNameRef = useRef<string>("");
  const versesRef = useRef<PlayerVerse[] | null>(null);

  // Sync rate ref and apply to current audio
  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (!soundRef.current) return;
    if (Platform.OS === "web") {
      try { (soundRef.current as HTMLAudioElement).playbackRate = playbackRate; } catch {}
    } else {
      soundRef.current.setRateAsync?.(playbackRate, true).catch(() => {});
    }
  }, [playbackRate]);

  const stopAudio = useCallback(async () => {
    if (soundRef.current) {
      try {
        if (Platform.OS === "web") {
          const audio = soundRef.current as HTMLAudioElement;
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
          audio.src = "";
        } else {
          await soundRef.current.stopAsync?.();
          await soundRef.current.unloadAsync?.();
        }
      } catch {}
      soundRef.current = null;
    }
    if (preloadRef.current) {
      try { preloadRef.current.audio.src = ""; } catch {}
      preloadRef.current = null;
    }
    if (Platform.OS === "web" && "mediaSession" in navigator) {
      try { navigator.mediaSession.playbackState = "none"; } catch {}
    }
    setPlayingVerse(null);
    setPlayState("idle");
  }, []);

  const preloadNext = useCallback((verse: PlayerVerse, currentVerses: PlayerVerse[]) => {
    if (Platform.OS !== "web") return;
    // Surah-level reciters use one file for the whole surah — no per-verse preloading needed
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

      if (!isAutoAdvance && soundRef.current) {
        try {
          if (Platform.OS === "web") {
            const audio = soundRef.current as HTMLAudioElement;
            audio.onended = null;
            audio.onerror = null;
            audio.pause();
            audio.src = "";
          } else {
            await soundRef.current.stopAsync?.();
            await soundRef.current.unloadAsync?.();
          }
        } catch {}
        soundRef.current = null;
      }

      setCurrentSurahNum(surahNum);
      setCurrentSurahArabic(surahArabic);
      setCurrentSurahName(surahName);
      setPlayingVerse(verse.number);
      if (!isAutoAdvance) setPlayState("loading");

      const url = getVerseAudioUrl(reciterRef.current, surahNum, verse.number, verse.numberInQuran);

      const onEnded = () => {
        soundRef.current = null;
        const currentVerses = versesRef.current;
        const currentSurahNum = surahNumRef.current!;
        const currentSurahArabic = surahArabicRef.current;
        const currentSurahName = surahNameRef.current;
        const reciter = reciterRef.current;
        // Surah-level reciters play the full surah as one file — don't auto-advance verses
        if (!isSurahLevelReciter(reciter) && currentVerses) {
          const next = currentVerses.find((v) => v.number === verse.number + 1);
          if (next) {
            playVerse(next, currentSurahNum, currentSurahArabic, currentSurahName, currentVerses, true);
            return;
          }
        }
        setPlayingVerse(null);
        setPlayState("idle");
        if (Platform.OS === "web" && "mediaSession" in navigator) {
          try { navigator.mediaSession.playbackState = "none"; } catch {}
        }
      };

      if (Platform.OS === "web") {
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

          soundRef.current = audio;
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
        try {
          const { Audio } = await import("expo-av");
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
          });
          const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
          soundRef.current = sound;
          try { await sound.setRateAsync(playbackRateRef.current, true); } catch {}
          setPlayState("playing");
          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.didJustFinish) {
              soundRef.current = null;
              onEnded();
            }
          });
        } catch {
          setPlayState("idle");
        }
      }
    },
    [preloadNext, stopAudio]
  );

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
            (soundRef.current as HTMLAudioElement)?.pause();
            if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
          } else {
            await soundRef.current?.pauseAsync();
          }
          setPlayState("paused");
        } catch {}
      } else if (playingVerse === verse.number && playState === "paused") {
        try {
          if (Platform.OS === "web") {
            await (soundRef.current as HTMLAudioElement)?.play();
            if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
          } else {
            await soundRef.current?.playAsync();
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
