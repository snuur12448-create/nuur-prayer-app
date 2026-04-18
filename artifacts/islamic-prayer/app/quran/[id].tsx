import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import type { ThemeColors } from "@/constants/themes";
import { useQuranPlayer } from "@/context/QuranPlayerContext";
import { SURAHS } from "@/utils/islamicData";
import { RECITERS, getVerseAudioUrl, Reciter } from "@/utils/audioData";
import { loadVerses, loadWords, prefetchNextSurahs } from "@/utils/quranCache";
import AyahShareSheet from "@/components/AyahShareSheet";

interface Verse {
  number: number;
  text: string;
  translation: string;
  transliteration: string;
  numberInQuran: number;
}

interface WordInfo {
  position: number;
  location: string;
  arabic: string;
  transliteration: string;
  meaning: string;
}

// ── Hafidh Mode placeholder — gold dashes simulating hidden Arabic lines ───────
function HafidhPlaceholder({ colors }: { colors: ThemeColors }) {
  const lines = [
    { widths: [55, 40, 70, 50, 35, 60], opacity: "70" },
    { widths: [45, 65, 30, 55, 45, 40], opacity: "55" },
    { widths: [60, 35, 50, 40, 65],     opacity: "40" },
    { widths: [30, 55, 45, 35, 50, 30], opacity: "30" },
  ];
  return (
    <View style={{ gap: 14, paddingVertical: 14, paddingHorizontal: 2, minHeight: 100 }}>
      {lines.map((line, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap", gap: 8 }}>
          {line.widths.map((w, j) => (
            <View
              key={j}
              style={{
                width: w,
                height: 9,
                borderRadius: 4,
                backgroundColor: colors.gold + line.opacity,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Word-by-word chip ─────────────────────────────────────────────────────────
function WordChip({
  word,
  colors,
  onTap,
}: {
  word: WordInfo;
  colors: ThemeColors;
  onTap: (w: WordInfo) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => onTap(word)}
      activeOpacity={0.72}
      style={{
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: colors.gold + "18",
        borderWidth: 1,
        borderColor: colors.gold + "3C",
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 16,
          color: colors.gold,
          writingDirection: "rtl",
        }}
      >
        {word.arabic}
      </Text>
    </TouchableOpacity>
  );
}

// ── Memoized verse card — prevents full-list re-renders on playback/copy state changes ──
interface VerseCardProps {
  verse: Verse;
  isActive: boolean;
  isHighlighted: boolean;
  playIcon: string;
  isCopied: boolean;
  showTransliteration: boolean;
  showTranslation: boolean;
  colors: ThemeColors;
  onPlay: () => void;
  onCopy: () => void;
  onShare: () => void;
  hafidhMode: boolean;
  hafidhDifficulty: "easy" | "medium" | "hard";
  isRevealed: boolean;
  onReveal: () => void;
  words: WordInfo[];
  onWordTap: (w: WordInfo) => void;
  showWordByWord: boolean;
  quranFontLoaded: boolean;
}

const VerseCard = React.memo(function VerseCard({
  verse,
  isActive,
  isHighlighted,
  playIcon,
  isCopied,
  showTransliteration,
  showTranslation,
  colors,
  onPlay,
  onCopy,
  onShare,
  hafidhMode,
  hafidhDifficulty,
  isRevealed,
  onReveal,
  words,
  onWordTap,
  showWordByWord,
  quranFontLoaded,
}: VerseCardProps) {
  const isHidden = hafidhMode && !isRevealed;
  const firstWord = verse.text.trim().split(/\s+/)[0] ?? "";

  return (
    <View
      style={[
        styles.verseCard,
        {
          backgroundColor: isActive ? colors.tint + "18" : isHighlighted ? "#C9933A18" : colors.surface,
          borderColor: isActive
            ? colors.tint + "60"
            : isHighlighted
            ? "#C9933A"
            : isCopied
            ? colors.gold
            : hafidhMode
            ? colors.gold + "30"
            : colors.border,
          borderWidth: isHighlighted ? 2 : 1,
        },
      ]}
    >
      <View style={styles.verseHeader}>
        <View style={styles.verseHeaderLeft}>
          {hafidhDifficulty !== "hard" && (
            <TouchableOpacity
              style={[
                styles.playBtn,
                {
                  backgroundColor: isActive ? colors.tint : colors.surfaceElevated,
                  borderColor: isActive ? colors.tint : colors.border,
                },
              ]}
              onPress={onPlay}
            >
              {playIcon === "loader" ? (
                <ActivityIndicator size="small" color={isActive ? "#fff" : colors.tint} />
              ) : (
                <Feather name={playIcon as any} size={11} color={isActive ? "#fff" : colors.tint} />
              )}
            </TouchableOpacity>
          )}
          {!hafidhMode && (
            <>
              <TouchableOpacity
                onPress={onCopy}
                style={[styles.copyBtn, { backgroundColor: isCopied ? colors.gold + "20" : "transparent" }]}
                hitSlop={8}
              >
                <Feather name={isCopied ? "check" : "copy"} size={12} color={isCopied ? colors.gold : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onShare} style={[styles.copyBtn, { backgroundColor: "transparent" }]} hitSlop={8}>
                <Feather name="share-2" size={12} color={colors.textSecondary} />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isHidden && hafidhDifficulty !== "hard" && (
            <TouchableOpacity
              onPress={onReveal}
              hitSlop={10}
              style={[styles.eyeBtn, { borderColor: colors.gold + "55", backgroundColor: colors.gold + "15" }]}
            >
              <Feather name="eye" size={13} color={colors.gold} />
            </TouchableOpacity>
          )}
          {isRevealed && hafidhMode && (
            <View style={[styles.revealedBadge, { backgroundColor: colors.tint + "20", borderColor: colors.tint + "50" }]}>
              <Feather name="check" size={10} color={colors.tint} />
            </View>
          )}
          <View style={[styles.verseNumberBadge, { backgroundColor: isActive ? colors.tint : hafidhMode ? colors.gold + "25" : colors.prayerCard }]}>
            <Text style={[styles.verseNumber, { color: isActive ? "#fff" : colors.gold }]}>{verse.number}</Text>
          </View>
        </View>
      </View>

      {/* Arabic text or hafidh placeholder.
          When the Uthmanic font hasn't finished loading, show the shimmer
          placeholder so there is zero chance of rendering text in a fallback font. */}
      {!quranFontLoaded ? (
        <HafidhPlaceholder colors={colors} />
      ) : isHidden ? (
        hafidhDifficulty === "easy" && firstWord ? (
          <View>
            <Text style={[styles.arabicVerse, { color: colors.text }]}>{firstWord}</Text>
            <HafidhPlaceholder colors={colors} />
          </View>
        ) : (
          <HafidhPlaceholder colors={colors} />
        )
      ) : (
        <Text style={[styles.arabicVerse, { color: colors.text }]}>{verse.text}</Text>
      )}

      {/* Word-by-word chips — Reading Mode only, shown when toggle is on */}
      {!hafidhMode && !isHidden && showWordByWord && words.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {words.map((w) => (
            <WordChip key={w.position} word={w} colors={colors} onTap={onWordTap} />
          ))}
        </View>
      )}

      {/* Transliteration & translation — always hidden in hafidh mode */}
      {!hafidhMode && showTransliteration && verse.transliteration ? (
        <Text style={[styles.transliterationVerse, { color: colors.gold, borderTopColor: colors.border }]}>
          {verse.transliteration}
        </Text>
      ) : null}

      {!hafidhMode && showTranslation && (
        <Text style={[styles.translationVerse, { color: colors.textSecondary, borderTopColor: colors.border }]}>
          {verse.translation}
        </Text>
      )}
    </View>
  );
});

// ── Word-by-word bottom sheet ──────────────────────────────────────────────────
function WordSheet({
  word,
  root,
  rootLoading,
  colors,
  bottomInset,
  onClose,
  onAudio,
}: {
  word: WordInfo | null;
  root: string | null;
  rootLoading: boolean;
  colors: ThemeColors;
  bottomInset: number;
  onClose: () => void;
  onAudio: () => void;
}) {
  if (!word) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.prayerCard,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingBottom: Math.max(bottomInset, 20) + 12,
              gap: 0,
            },
          ]}
          onPress={() => {}}
        >
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

          {/* Close */}
          <TouchableOpacity
            onPress={onClose}
            hitSlop={10}
            style={{ position: "absolute", top: 18, right: 20 }}
          >
            <Feather name="x" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Arabic word */}
          <Text style={[wbwStyles.sheetArabic, { color: colors.gold }]}>
            {word.arabic}
          </Text>

          {/* Transliteration */}
          {!!word.transliteration && (
            <Text style={[wbwStyles.sheetTranslit, { color: colors.gold }]}>
              {word.transliteration}
            </Text>
          )}

          {/* Meaning */}
          {!!word.meaning && (
            <Text style={[wbwStyles.sheetMeaning, { color: colors.text }]}>
              {word.meaning}
            </Text>
          )}

          {/* Divider */}
          <View style={[wbwStyles.sheetDivider, { backgroundColor: colors.border }]} />

          {/* Root */}
          <View style={wbwStyles.sheetRootRow}>
            <Text style={[wbwStyles.sheetRootLabel, { color: colors.textSecondary }]}>
              Root
            </Text>
            {rootLoading ? (
              <ActivityIndicator size="small" color={colors.gold} />
            ) : (
              <Text style={[wbwStyles.sheetRootValue, { color: colors.text }]}>
                {root ?? "—"}
              </Text>
            )}
          </View>

          {/* Audio button */}
          <TouchableOpacity
            onPress={onAudio}
            activeOpacity={0.8}
            style={[
              wbwStyles.sheetAudioBtn,
              { backgroundColor: colors.gold + "20", borderColor: colors.gold + "55" },
            ]}
          >
            <Feather name="volume-2" size={16} color={colors.gold} />
            <Text style={[wbwStyles.sheetAudioText, { color: colors.gold }]}>
              Hear word
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const wbwStyles = StyleSheet.create({
  sheetArabic: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
    writingDirection: "rtl",
  },
  sheetTranslit: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 6,
  },
  sheetMeaning: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginBottom: 18,
  },
  sheetDivider: {
    width: 56,
    height: 1,
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetRootRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 22,
  },
  sheetRootLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sheetRootValue: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    writingDirection: "rtl",
  },
  sheetAudioBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: "center",
  },
  sheetAudioText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});

function stripBismillah(text: string, surahNum: number, verseNum: number): string {
  if (surahNum === 1 || surahNum === 9 || verseNum !== 1) return text;
  const words = text.trim().split(/\s+/);
  if (words.length > 4) {
    const rest = words.slice(4).join(" ").trim();
    if (rest.length > 0) return rest;
  }
  return text;
}

export default function QuranDetailScreen() {
  const { id, initialVerse } = useLocalSearchParams<{ id: string; initialVerse?: string }>();
  const surahNumber = parseInt(id || "1", 10);
  const initialVerseNum = initialVerse ? parseInt(initialVerse, 10) : null;
  const surah = SURAHS.find((s) => s.number === surahNumber);

  // Synchronous check — the font was already loaded in _layout.tsx before any
  // screen rendered. Font.isLoaded() reads the cached registry immediately,
  // unlike useFonts() which always returns false on the first native render
  // before its async effect has had a chance to update state.
  const quranFontLoaded = Font.isLoaded("AmiriQuran_400Regular");

  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { bookmarkedSurahs, toggleBookmark, themeColors: colors } = useAppContext();

  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [shareVerse, setShareVerse] = useState<Verse | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [versesError, setVersesError] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);

  // ── Hafidh Mode ────────────────────────────────────────────────────────────
  const [hafidhMode, setHafidhMode] = useState(false);
  const [hafidhDifficulty, setHafidhDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [revealedAyahs, setRevealedAyahs] = useState<Set<number>>(new Set());

  // ── Word-by-word ────────────────────────────────────────────────────────────
  const [wordsByVerse, setWordsByVerse] = useState<Record<number, WordInfo[]>>({});
  const [wordSheetWord, setWordSheetWord] = useState<WordInfo | null>(null);
  const [wordRoot, setWordRoot] = useState<string | null>(null);
  const [wordRootLoading, setWordRootLoading] = useState(false);
  const wordAudioRef = useRef<any>(null);

  // ── Item height constants ──────────────────────────────────────────────────
  // Used for the onScrollToIndexFailed fallback offset estimation (rough guess),
  // and as a fixed getItemLayout for Hafidh mode (all cards are uniform).
  // Reading mode no longer uses getItemLayout — FlatList measures each card
  // naturally, which prevents scroll jumps caused by varying verse lengths.
  const ITEM_H_AR_ONLY = 206;
  const ITEM_H_TRANSLIT = 96;
  const ITEM_H_TRANSLATION = 108;
  const LIST_HEADER_H = 72;
  const ITEM_H_HAFIDH = 200;

  // The estimated height of one verse card given current toggle state.
  // Recomputed whenever toggles change so the offset calculation stays accurate.
  const estimatedItemHeight = useMemo(() => {
    let h = ITEM_H_AR_ONLY;
    if (showTranslation) h += ITEM_H_TRANSLATION;
    if (showTransliteration) h += ITEM_H_TRANSLIT;
    return h;
  }, [showTranslation, showTransliteration]);

  // Which FlatList index to jump to on first render (search navigation).
  // undefined → start at top (normal navigation).
  const targetIndex = useMemo(() => {
    if (!initialVerseNum || !verses) return undefined;
    const idx = verses.findIndex((v) => v.number === initialVerseNum);
    return idx > 0 ? idx : undefined;
  }, [initialVerseNum, verses]);

  // estimatedItemHeightRef is kept for the onScrollToIndexFailed fallback offset calculation.
  const estimatedItemHeightRef = useRef(estimatedItemHeight);
  useEffect(() => { estimatedItemHeightRef.current = estimatedItemHeight; }, [estimatedItemHeight]);

  const getHafidhItemLayout = useCallback(
    (_data: ArrayLike<Verse> | null | undefined, index: number) => ({
      length: ITEM_H_HAFIDH,
      offset: LIST_HEADER_H + ITEM_H_HAFIDH * index,
      index,
    }),
    []
  );

  // Audio — lifted to global QuranPlayerContext so playback outlives navigation
  const {
    playState,
    playingVerse,
    playbackRate,
    selectedReciter,
    currentSurahNum: playingSurahNum,
    lastPlayingSurahNum,
    lastPlayingVerseNum,
    autoAdvance,
    setAutoAdvance,
    playVerse: ctxPlayVerse,
    stopAudio,
    togglePlayPause: ctxTogglePlayPause,
    setSelectedReciter,
    setPlaybackRate,
  } = useQuranPlayer();

  const [showReciterModal, setShowReciterModal] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [reciterListAtBottom, setReciterListAtBottom] = useState(false);
  const previewAudioRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const flatListRef = useRef<FlatList>(null);

  // ── Last-read position ─────────────────────────────────────────────────────
  const LAST_READ_KEY = "nuur_last_read_position";
  const saveLastRead = useCallback(
    (ayahNum: number) => {
      if (!surah) return;
      const pos = {
        surahNum: surahNumber,
        surahNameEn: surah.englishName,
        surahNameAr: surah.name,
        ayahNum,
      };
      AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(pos)).catch(() => {});
    },
    [surah, surahNumber]
  );

  // Stable refs required by FlatList for onViewableItemsChanged
  const saveLastReadRef = useRef(saveLastRead);
  useEffect(() => { saveLastReadRef.current = saveLastRead; }, [saveLastRead]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: Verse; isViewable: boolean }> }) => {
      if (viewableItems.length === 0) return;
      const topVisible = viewableItems[0];
      if (topVisible?.isViewable && topVisible.item) {
        saveLastReadRef.current(topVisible.item.number);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;
  const isBookmarked = bookmarkedSurahs.includes(surahNumber);

  // Load verses — cache first (instant), then network if not cached.
  // After verses are on screen, silently prefetch the next two surahs so the
  // next "next" tap is instant even on a flight or in a masjid basement.
  useEffect(() => {
    isMountedRef.current = true;
    setVerses(null);
    setVersesError(false);
    setLoadingVerses(true);

    const controller = new AbortController();
    loadVerses(surahNumber, controller.signal)
      .then((mapped) => {
        if (!isMountedRef.current) return;
        setVerses(mapped as Verse[]);
        setLoadingVerses(false);
        // Quietly warm up neighbours after current surah is on screen.
        prefetchNextSurahs(surahNumber);
      })
      .catch((err) => {
        if (!isMountedRef.current || err?.name === "AbortError") return;
        setVersesError(true);
        setLoadingVerses(false);
      });

    return () => {
      controller.abort();
      isMountedRef.current = false;
    };
  }, [surahNumber]);

  // Load word-by-word — cache first, network fallback.
  useEffect(() => {
    setWordsByVerse({});
    const ctrl = new AbortController();
    loadWords(surahNumber, ctrl.signal)
      .then((byVerse) => setWordsByVerse(byVerse as Record<number, WordInfo[]>))
      .catch(() => {});
    return () => ctrl.abort();
  }, [surahNumber]);

  // After verses load, scroll to the currently playing verse if this is the active surah.
  // We track the last verse we scrolled to in a ref so layout-induced re-renders
  // (e.g. toggling Word-by-Word or Transliteration) cannot re-trigger an animated
  // scroll for a verse the list is already aligned to. The effect should only
  // produce a scroll when the *playing verse itself* changes.
  const lastScrolledPlayingVerseRef = useRef<{ surah: number; verse: number } | null>(null);
  useEffect(() => {
    if (!verses || !playingVerse || playingSurahNum !== surahNumber) return;
    const last = lastScrolledPlayingVerseRef.current;
    if (last && last.surah === surahNumber && last.verse === playingVerse) return;
    const idx = verses.findIndex((v) => v.number === playingVerse);
    if (idx < 0) return;
    lastScrolledPlayingVerseRef.current = { surah: surahNumber, verse: playingVerse };
    // Small delay lets the FlatList finish its initial render before scrolling
    const t = setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
    }, 350);
    return () => clearTimeout(t);
  }, [verses, playingVerse, playingSurahNum, surahNumber]);

  // Reset the dedupe ref when the user pauses or stops, so the next playback
  // session can scroll to its first verse even if it happens to be the same one.
  useEffect(() => {
    if (!playingVerse) lastScrolledPlayingVerseRef.current = null;
  }, [playingVerse]);

  // If audio has stopped (playingVerse is null) but we know the last verse that
  // was playing in this surah, scroll there so the user picks up where they left
  // off instead of seeing the top of the surah.
  useEffect(() => {
    if (!verses) return;
    if (playingVerse) return; // active playback scroll takes priority
    if (lastPlayingSurahNum !== surahNumber) return;
    if (!lastPlayingVerseNum || lastPlayingVerseNum <= 1) return;
    const idx = verses.findIndex((v) => v.number === lastPlayingVerseNum);
    if (idx < 0) return;
    const t = setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: idx, animated: false, viewPosition: 0.3 });
    }, 400);
    return () => clearTimeout(t);
  }, [verses, playingVerse, lastPlayingSurahNum, lastPlayingVerseNum, surahNumber]);

  // Scroll to the target verse after search navigation, then flash-highlight it.
  // We do this via a useEffect (not initialScrollIndex) so that FlatList has no
  // getItemLayout dependency in reading mode — avoiding scroll jumps caused by
  // height estimation errors.
  useEffect(() => {
    if (!verses || !targetIndex || hafidhMode) return;
    const doScroll = () => {
      flatListRef.current?.scrollToIndex({ index: targetIndex, animated: false, viewPosition: 0.15 });
    };
    // Wait for the first render batch to complete before jumping
    const t = setTimeout(doScroll, 300);
    return () => clearTimeout(t);
  }, [verses, targetIndex, hafidhMode]);

  useEffect(() => {
    if (!verses || !initialVerseNum) return;
    const t1 = setTimeout(() => setHighlightedVerse(initialVerseNum), 400);
    const t2 = setTimeout(() => setHighlightedVerse(null), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [verses, initialVerseNum]);

  useEffect(() => {
    // Only stop the reciter preview on unmount — main audio continues in the background
    return () => { stopPreview(); };
  }, []);

  // Load persisted hafidh difficulty on mount
  useEffect(() => {
    AsyncStorage.getItem("nuur_hafidh_difficulty").then((val) => {
      if (val === "easy" || val === "medium" || val === "hard") {
        setHafidhDifficulty(val);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (showReciterModal) {
      setReciterListAtBottom(false);
    } else {
      stopPreview();
    }
  }, [showReciterModal]);

  /** Stop any active reciter preview */
  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      try {
        if (Platform.OS === "web") {
          previewAudioRef.current.pause();
          previewAudioRef.current.src = "";
        } else {
          previewAudioRef.current.stopAsync?.();
          previewAudioRef.current.unloadAsync?.();
        }
      } catch {}
      previewAudioRef.current = null;
    }
    setPreviewingId(null);
  }, []);

  /** Play a short sample of a reciter (Surah 1, Verse 1) */
  const togglePreview = useCallback((reciter: Reciter) => {
    if (previewingId === reciter.id) {
      stopPreview();
      return;
    }
    stopPreview();
    const url = getVerseAudioUrl(reciter, 1, 1, 1);
    setPreviewingId(reciter.id);
    if (Platform.OS === "web") {
      const audio = new Audio(url);
      audio.onended = () => setPreviewingId(null);
      audio.onerror = () => setPreviewingId(null);
      previewAudioRef.current = audio;
      audio.play().catch(() => setPreviewingId(null));
    } else {
      (async () => {
        try {
          const { Audio } = await import("expo-av");
          const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
          previewAudioRef.current = sound;
          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.didJustFinish) setPreviewingId(null);
          });
        } catch {
          setPreviewingId(null);
        }
      })();
    }
  }, [previewingId, stopPreview]);

  const togglePlayPause = useCallback(
    async (verse: Verse) => {
      if (!surah) return;
      saveLastRead(verse.number);
      await ctxTogglePlayPause(verse, surahNumber, surah.name, surah.englishName, verses ?? []);
    },
    [ctxTogglePlayPause, surah, surahNumber, verses, saveLastRead]
  );

  const playAllVerses = useCallback(async () => {
    if (!verses || !surah) return;
    if (playState === "playing" || playState === "loading") {
      await stopAudio();
    } else {
      setAutoAdvance(true);
      await ctxPlayVerse(verses[0], surahNumber, surah.name, surah.englishName, verses);
    }
  }, [verses, surah, surahNumber, playState, ctxPlayVerse, stopAudio, setAutoAdvance]);

  const copyVerse = (verse: Verse) => {
    const text = `${verse.text}\n\n${verse.translation}\n— ${surah?.englishName} ${surahNumber}:${verse.number}`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setStringAsync(text).catch(() => {});
    }
    setCopiedVerse(verse.number);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  const getPlayIcon = (v: Verse) => {
    if (playingVerse !== v.number) return "play";
    if (playState === "loading") return "loader";
    if (playState === "playing") return "pause";
    return "play";
  };

  const revealAyah = useCallback((verseNum: number) => {
    setRevealedAyahs((prev) => new Set([...prev, verseNum]));
  }, []);

  const resetHafidh = useCallback(() => {
    setRevealedAyahs(new Set());
  }, []);

  const toggleHafidhMode = useCallback(() => {
    setHafidhMode((v) => {
      if (!v) setRevealedAyahs(new Set());
      return !v;
    });
  }, []);

  const updateDifficulty = useCallback((level: "easy" | "medium" | "hard") => {
    setHafidhDifficulty(level);
    setRevealedAyahs(new Set());
    AsyncStorage.setItem("nuur_hafidh_difficulty", level).catch(() => {});
  }, []);

  const hafidhProgress = verses && verses.length > 0 ? revealedAyahs.size / verses.length : 0;

  // ── Word-by-word callbacks ─────────────────────────────────────────────────
  const handleWordTap = useCallback(async (w: WordInfo) => {
    setWordSheetWord(w);
    setWordRoot(null);
    setWordRootLoading(true);
    try {
      const r = await fetch(`https://api.qurancdn.com/api/qdc/morphology/${w.location}`);
      const json = await r.json();
      // Try multiple paths the API might return the root at
      const root =
        json?.words?.[0]?.word_segments?.[0]?.root_arabic ??
        json?.words?.[0]?.root_arabic ??
        json?.root_arabic ??
        null;
      setWordRoot(root);
    } catch {
      setWordRoot(null);
    }
    setWordRootLoading(false);
  }, []);

  const closeWordSheet = useCallback(() => {
    setWordSheetWord(null);
    setWordRoot(null);
    // Stop any playing word audio
    try {
      if (Platform.OS === "web") {
        wordAudioRef.current?.pause();
      } else {
        wordAudioRef.current?.stopAsync?.();
        wordAudioRef.current?.unloadAsync?.();
      }
    } catch {}
    wordAudioRef.current = null;
  }, []);

  const playWordAudio = useCallback(async () => {
    if (!wordSheetWord) return;
    const [ch, v, w] = wordSheetWord.location.split(":").map((n) => n.padStart(3, "0"));
    const url = `https://audio.qurancdn.com/wbw/${ch}_${v}_${w}.mp3`;
    // Stop previous word audio
    try {
      if (Platform.OS === "web") {
        wordAudioRef.current?.pause();
      } else {
        wordAudioRef.current?.stopAsync?.();
        wordAudioRef.current?.unloadAsync?.();
      }
    } catch {}
    wordAudioRef.current = null;
    if (Platform.OS === "web") {
      const audio = new Audio(url);
      wordAudioRef.current = audio;
      audio.play().catch(() => {});
    } else {
      try {
        const { Audio } = await import("expo-av");
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
        wordAudioRef.current = sound;
        sound.setOnPlaybackStatusUpdate((s: any) => {
          if (s.didJustFinish) sound.unloadAsync().catch(() => {});
        });
      } catch {}
    }
  }, [wordSheetWord]);

  const renderItem = useCallback(
    ({ item: verse }: { item: Verse }) => (
      <VerseCard
        verse={verse}
        isActive={playingVerse === verse.number}
        isHighlighted={highlightedVerse === verse.number}
        playIcon={getPlayIcon(verse)}
        isCopied={copiedVerse === verse.number}
        showTransliteration={showTransliteration}
        showTranslation={showTranslation}
        colors={colors}
        onPlay={() => togglePlayPause(verse)}
        onCopy={() => copyVerse(verse)}
        onShare={() => setShareVerse(verse)}
        hafidhMode={hafidhMode}
        hafidhDifficulty={hafidhDifficulty}
        isRevealed={revealedAyahs.has(verse.number)}
        onReveal={() => revealAyah(verse.number)}
        words={wordsByVerse[verse.number] ?? []}
        onWordTap={handleWordTap}
        showWordByWord={showWordByWord}
        quranFontLoaded={!!quranFontLoaded}
      />
    ),
    [playingVerse, playState, copiedVerse, highlightedVerse, showTransliteration, showTranslation, showWordByWord, colors, togglePlayPause, copyVerse, hafidhMode, hafidhDifficulty, revealedAyahs, revealAyah, wordsByVerse, handleWordTap, quranFontLoaded]
  );

  const keyExtractor = useCallback((v: Verse) => String(v.number), []);

  if (!surah) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Surah not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.prayerCard }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerArabic, { color: colors.text }]}>{surah.name}</Text>
            <Text style={[styles.headerEnglish, { color: colors.textSecondary }]}>{surah.englishName}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleBookmark(surahNumber)} style={styles.bookmarkBtn}>
            <Feather name="bookmark" size={22} color={isBookmarked ? colors.gold : colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerMeta}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaValue, { color: colors.text }]}>{surah.verses}</Text>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Verses</Text>
          </View>
          <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
          <View style={styles.metaItem}>
            <Text style={[styles.metaValue, { color: colors.text }]}>{surah.revelationType}</Text>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Revelation</Text>
          </View>
          <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
          <View style={styles.metaItem}>
            <Text style={[styles.metaValue, { color: colors.text }]}>Juz {surah.juz}</Text>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Location</Text>
          </View>
        </View>
      </View>

      {/* Controls bar */}
      <View style={[styles.controlsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.reciterBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          onPress={() => setShowReciterModal(true)}
        >
          <Feather name="mic" size={15} color={colors.tint} />
        </TouchableOpacity>

        <View style={styles.controlsRight}>
          {/* Hafidh Mode toggle */}
          <TouchableOpacity
            style={[styles.hafidhToggleBtn, {
              backgroundColor: hafidhMode ? colors.gold + "22" : colors.surfaceElevated,
              borderColor: hafidhMode ? colors.gold : colors.border,
            }]}
            onPress={toggleHafidhMode}
          >
            <MaterialCommunityIcons name="brain" size={16} color={hafidhMode ? colors.gold : colors.textSecondary} />
          </TouchableOpacity>
          {!hafidhMode && verses && (
            <TouchableOpacity
              style={[styles.playAllBtn, { backgroundColor: colors.tint }]}
              onPress={playAllVerses}
            >
              <Feather name={(playState === "playing" || playState === "loading") ? "square" : "play"} size={13} color="#fff" />
              <Text style={styles.playAllText}>
                {(playState === "playing" || playState === "loading") ? "Stop" : "Play All"}
              </Text>
            </TouchableOpacity>
          )}
          {/* Speed selector */}
          {!hafidhMode && (
            <TouchableOpacity
              style={[styles.toggleChip, {
                backgroundColor: playbackRate !== 1.0 ? colors.tint + "20" : colors.surfaceElevated,
                borderColor: playbackRate !== 1.0 ? colors.tint + "60" : colors.border,
              }]}
              onPress={() => setShowSpeedMenu(true)}
            >
              <Text style={[styles.toggleChipText, { color: playbackRate !== 1.0 ? colors.tint : colors.textSecondary }]}>
                {playbackRate === 0.75 ? "¾×" : playbackRate === 1.0 ? "1×" : `${playbackRate}×`}
              </Text>
            </TouchableOpacity>
          )}
          {/* Auto-advance toggle */}
          {!hafidhMode && (
            <TouchableOpacity
              style={[styles.toggleChip, {
                backgroundColor: autoAdvance ? colors.tint + "20" : colors.surfaceElevated,
                borderColor: autoAdvance ? colors.tint + "60" : colors.border,
              }]}
              onPress={() => setAutoAdvance(!autoAdvance)}
            >
              <Feather name="repeat" size={13} color={autoAdvance ? colors.tint : colors.textSecondary} />
            </TouchableOpacity>
          )}
          {/* Transliteration toggle — hidden in hafidh mode */}
          {!hafidhMode && (
            <TouchableOpacity
              style={[styles.toggleChip, {
                backgroundColor: showTransliteration ? colors.gold + "20" : colors.surfaceElevated,
                borderColor: showTransliteration ? colors.gold + "60" : colors.border,
              }]}
              onPress={() => setShowTransliteration((v) => !v)}
            >
              <Text style={[styles.toggleChipText, { color: showTransliteration ? colors.gold : colors.textSecondary }]}>
                A-B-C
              </Text>
            </TouchableOpacity>
          )}
          {/* Word-by-word toggle — hidden in hafidh mode */}
          {!hafidhMode && (
            <TouchableOpacity
              style={[styles.toggleChip, {
                backgroundColor: showWordByWord ? colors.gold + "20" : colors.surfaceElevated,
                borderColor: showWordByWord ? colors.gold + "60" : colors.border,
              }]}
              onPress={() => setShowWordByWord((v) => !v)}
            >
              <Text style={[styles.toggleChipText, { color: showWordByWord ? colors.gold : colors.textSecondary }]}>
                W·W
              </Text>
            </TouchableOpacity>
          )}
          {/* Translation toggle — hidden in hafidh mode */}
          {!hafidhMode && (
            <>
              <Pressable
                style={[styles.toggle, { backgroundColor: showTranslation ? colors.tint : colors.border }]}
                onPress={() => setShowTranslation((v) => !v)}
              >
                <View style={[styles.toggleThumb, { transform: [{ translateX: showTranslation ? 20 : 0 }] }]} />
              </Pressable>
              <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>EN</Text>
            </>
          )}
        </View>
      </View>

      {/* Hafidh Mode banner */}
      {hafidhMode && (
        <View style={[styles.hafidhBanner, { backgroundColor: colors.surface, borderBottomColor: colors.gold + "40" }]}>
          {/* Top row: label + difficulty chips */}
          <View style={styles.hafidhTopRow}>
            <View style={styles.hafidhLabelRow}>
              <MaterialCommunityIcons name="brain" size={14} color={colors.gold} />
              <Text style={[styles.hafidhModeLabel, { color: colors.gold }]}>HAFIDH MODE</Text>
            </View>
            <View style={styles.hafidhChips}>
              {(["easy", "medium", "hard"] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => updateDifficulty(level)}
                  style={[
                    styles.hafidhChip,
                    {
                      backgroundColor: hafidhDifficulty === level ? colors.gold : "transparent",
                      borderColor: hafidhDifficulty === level ? colors.gold : colors.gold + "55",
                    },
                  ]}
                >
                  <Text style={[styles.hafidhChipText, { color: hafidhDifficulty === level ? "#fff" : colors.gold }]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom row: progress bar + count + reset */}
          <View style={styles.hafidhProgressRow}>
            {hafidhDifficulty !== "hard" ? (
              <>
                <View style={[styles.hafidhProgressTrack, { backgroundColor: colors.gold + "22" }]}>
                  <View
                    style={[
                      styles.hafidhProgressFill,
                      { backgroundColor: colors.gold, width: `${hafidhProgress * 100}%` as any },
                    ]}
                  />
                </View>
                <Text style={[styles.hafidhProgressText, { color: colors.textSecondary }]}>
                  {revealedAyahs.size} of {verses?.length ?? 0} revealed
                </Text>
              </>
            ) : (
              <Text style={[styles.hafidhProgressText, { color: colors.textSecondary, flex: 1 }]}>
                Pure memory — no hints, no reveals
              </Text>
            )}
            <TouchableOpacity
              onPress={resetHafidh}
              style={[styles.hafidhResetBtn, { borderColor: colors.gold + "55", backgroundColor: colors.gold + "12" }]}
            >
              <Feather name="refresh-cw" size={11} color={colors.gold} />
              <Text style={[styles.hafidhResetText, { color: colors.gold }]}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Body */}
      {loadingVerses ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading verses…</Text>
        </View>
      ) : versesError ? (
        <View style={styles.centered}>
          <Feather name="wifi-off" size={40} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load verses</Text>
          <Text style={[styles.errorSub, { color: colors.textSecondary }]}>Check your internet connection</Text>
        </View>
      ) : (
        <FlatList
          key={hafidhMode ? "hafidh" : "reading"}
          style={styles.verseList}
          ref={flatListRef}
          data={verses}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={hafidhMode ? getHafidhItemLayout : undefined}
          contentContainerStyle={{ padding: 16, paddingBottom: isWeb ? 34 : insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={hafidhMode ? 15 : 12}
          maxToRenderPerBatch={hafidhMode ? 20 : 15}
          windowSize={hafidhMode ? 11 : 21}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={false}
          // Keep currently-visible verses anchored when items above the viewport
          // change height — e.g. the user toggles A-B-C (transliteration) or
          // Word-by-Word during playback. Without this prop, every re-rendered
          // item above the anchor shifts the scroll offset by its delta-height,
          // making the page appear to drift / "scroll in a confused way".
          // Hafidh mode has fixed-height rows + getItemLayout, so it does not
          // need this anchor (and turning it on there can fight getItemLayout).
          maintainVisibleContentPosition={
            hafidhMode ? undefined : { minIndexForVisible: 0 }
          }
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={({ index }) => {
            // Jump to the estimated offset so items near the target render, then retry.
            flatListRef.current?.scrollToOffset({
              offset: LIST_HEADER_H + estimatedItemHeightRef.current * index,
              animated: false,
            });
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.15 });
            }, 200);
          }}
          ListHeaderComponent={
            <>
              {playingVerse !== null && (
                <View style={[styles.nowPlayingBar, { backgroundColor: colors.tint + "15", borderColor: colors.tint + "40" }]}>
                  <View style={styles.nowPlayingLeft}>
                    <View style={[styles.playingDot, { backgroundColor: colors.tint }]} />
                    <Text style={[styles.nowPlayingText, { color: colors.tint }]} numberOfLines={1}>
                      {playState === "loading" ? "Loading…" : `Verse ${playingVerse} · ${selectedReciter.name}`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={stopAudio} hitSlop={8}>
                    <Feather name="x" size={15} color={colors.tint} />
                  </TouchableOpacity>
                </View>
              )}
              {surahNumber !== 9 && surahNumber !== 1 && quranFontLoaded && (
                <Text style={[styles.bismillah, { color: colors.text }]}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </Text>
              )}
            </>
          }
        />
      )}

      {/* Reciter Modal */}
      <Modal
        visible={showReciterModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          stopPreview();
          setShowReciterModal(false);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            stopPreview();
            setShowReciterModal(false);
          }}
        >
          <Pressable>
            <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Reciter</Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                Tap a name to select · tap play to sample
              </Text>

              {/* Scrollable list with fade hint */}
              <View style={styles.reciterScrollWrap}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.reciterScrollView}
                  onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    setReciterListAtBottom(layoutMeasurement.height + contentOffset.y >= contentSize.height - 8);
                  }}
                  scrollEventThrottle={16}
                >
                  {RECITERS.map((reciter) => {
                    const isSelected = selectedReciter.id === reciter.id;
                    const isPreviewing = previewingId === reciter.id;
                    return (
                      <TouchableOpacity
                        key={reciter.id}
                        style={[
                          styles.reciterRow,
                          {
                            backgroundColor: isSelected ? colors.tint + "20" : "transparent",
                            borderColor: isSelected ? colors.tint + "40" : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedReciter(reciter);
                          stopAudio();
                          stopPreview();
                          setShowReciterModal(false);
                        }}
                      >
                        <View style={styles.reciterInfo}>
                          <View
                            style={[
                              styles.reciterIcon,
                              { backgroundColor: isSelected ? colors.tint : colors.tint + "28" },
                            ]}
                          >
                            <Feather name="mic" size={14} color={isSelected ? "#fff" : colors.tint} />
                          </View>
                          <View style={styles.reciterDetails}>
                            <View style={styles.reciterNameRow}>
                              <Text style={[styles.reciterName, { color: colors.text }]}>{reciter.name}</Text>
                              {reciter.language === "english" && (
                                <View style={[styles.langBadge, { backgroundColor: colors.tint + "22", borderColor: colors.tint + "55" }]}>
                                  <Text style={[styles.langBadgeText, { color: colors.tint }]}>EN</Text>
                                </View>
                              )}
                            </View>
                            <Text style={[styles.reciterArabic, { color: colors.textSecondary }]}>
                              {reciter.arabicName}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.reciterRowRight}>
                          <TouchableOpacity
                            style={[
                              styles.previewBtn,
                              {
                                backgroundColor: isPreviewing ? colors.tint + "30" : colors.surfaceElevated,
                                borderColor: isPreviewing ? colors.tint : colors.border,
                              },
                            ]}
                            onPress={() => togglePreview(reciter)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Feather
                              name={isPreviewing ? "square" : "play"}
                              size={11}
                              color={isPreviewing ? colors.tint : colors.text}
                            />
                          </TouchableOpacity>
                          {isSelected ? (
                            <Feather name="check" size={16} color={colors.tint} />
                          ) : (
                            <View style={{ width: 16 }} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Scroll-more fade hint */}
                {!reciterListAtBottom && (
                  <View
                    style={[
                      styles.scrollFadeHint,
                      { backgroundColor: "transparent" },
                    ]}
                    pointerEvents="none"
                  >
                    <View style={[styles.scrollFadeGradient, { backgroundColor: colors.surface }]} />
                    <View style={[styles.scrollFadeChip, { backgroundColor: colors.border }]}>
                      <Feather name="chevron-down" size={12} color={colors.textSecondary} />
                      <Text style={[styles.scrollFadeText, { color: colors.textSecondary }]}>
                        more
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Word-by-word sheet ──────────────────────────────────────────── */}
      <WordSheet
        word={wordSheetWord}
        root={wordRoot}
        rootLoading={wordRootLoading}
        colors={colors}
        bottomInset={insets.bottom}
        onClose={closeWordSheet}
        onAudio={playWordAudio}
      />

      {/* ── Ayah share sheet ────────────────────────────────────────────── */}
      {shareVerse && (
        <AyahShareSheet
          visible={shareVerse !== null}
          verseNumber={shareVerse.number}
          arabicText={shareVerse.text}
          translation={shareVerse.translation}
          surahName={surah.name}
          surahEnglish={surah.englishName}
          surahNumber={surahNumber}
          onClose={() => setShareVerse(null)}
        />
      )}

      {/* ── Speed picker modal ──────────────────────────────────────────── */}
      <Modal
        visible={showSpeedMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSpeedMenu(false)}
      >
        <Pressable style={styles.speedBackdrop} onPress={() => setShowSpeedMenu(false)}>
          <Pressable>
            <View style={[styles.speedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.speedHandle, { backgroundColor: colors.border }]} />
              <Text style={[styles.speedTitle, { color: colors.textSecondary }]}>Playback Speed</Text>
              <View style={styles.speedGrid}>
                {([0.75, 1.0, 1.5, 2.0] as const).map((speed) => {
                  const active = playbackRate === speed;
                  const label = speed === 0.75 ? "¾×" : speed === 1.0 ? "1×" : `${speed}×`;
                  const sublabel = speed === 0.75 ? "Slow" : speed === 1.0 ? "Normal" : speed === 1.5 ? "Fast" : "Fastest";
                  return (
                    <Pressable
                      key={speed}
                      onPress={() => { setPlaybackRate(speed); setShowSpeedMenu(false); }}
                      style={[
                        styles.speedOption,
                        {
                          backgroundColor: active ? colors.tint + "20" : colors.surfaceElevated,
                          borderColor: active ? colors.tint : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.speedOptionValue, { color: active ? colors.tint : colors.text }]}>
                        {label}
                      </Text>
                      <Text style={[styles.speedOptionSub, { color: active ? colors.tint + "BB" : colors.textSecondary }]}>
                        {sublabel}
                      </Text>
                      {active && (
                        <View style={[styles.speedActiveDot, { backgroundColor: colors.tint }]} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  verseList: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  errorTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  errorSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center", flex: 1 },
  headerArabic: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerEnglish: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  bookmarkBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerMeta: { flexDirection: "row", justifyContent: "center", gap: 16, alignItems: "center" },
  metaItem: { alignItems: "center", gap: 2, flex: 1 },
  metaValue: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  metaLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Inter_400Regular" },
  metaDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.15)" },
  controlsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  reciterBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controlsRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  playAllText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  toggleChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleChipText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  toggle: { width: 44, height: 24, borderRadius: 12, padding: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
  toggleLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  nowPlayingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  nowPlayingLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  playingDot: { width: 7, height: 7, borderRadius: 4 },
  nowPlayingText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  bismillah: { fontSize: 26, textAlign: "center", marginBottom: 20, lineHeight: 52, fontFamily: "AmiriQuran_400Regular" },
  verseCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  verseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  verseHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  playBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  copyBtn: { width: 26, height: 26, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  verseNumberBadge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  verseNumber: { fontSize: 12, fontFamily: "Inter_700Bold" },
  arabicVerse: { fontSize: 26, textAlign: "right", lineHeight: 52, letterSpacing: 0, writingDirection: "rtl", fontFamily: "AmiriQuran_400Regular" },
  transliterationVerse: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 22,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  translationVerse: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    color: "rgba(0,0,0,0.5)",
  },
  errorText: { fontSize: 16, fontFamily: "Inter_400Regular", textAlign: "center", margin: 20 },

  /* ── Hafidh Mode ──────────────────────────────────────────────── */
  hafidhToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hafidhBanner: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  hafidhTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  hafidhLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  hafidhModeLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
  },
  hafidhChips: {
    flexDirection: "row",
    gap: 6,
  },
  hafidhChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  hafidhChipText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  hafidhProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hafidhProgressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  hafidhProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  hafidhProgressText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  hafidhResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  hafidhResetText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  eyeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  revealedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingTop: 12, gap: 4 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 2 },
  modalSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12 },
  reciterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  reciterInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  reciterIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  reciterDetails: { gap: 2 },
  reciterNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  reciterName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reciterArabic: { fontSize: 12, fontFamily: "Inter_400Regular" },
  langBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  langBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  reciterRowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  previewBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reciterScrollWrap: { position: "relative", maxHeight: 360 },
  reciterScrollView: { flexGrow: 0 },
  scrollFadeHint: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 4,
  },
  scrollFadeGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    opacity: 0.92,
  },
  scrollFadeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    opacity: 0.85,
  },
  scrollFadeText: { fontSize: 11, fontFamily: "Inter_500Medium" },

  /* Speed picker */
  speedBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  speedCard: {
    width: 280,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },
  speedHandle: { width: 36, height: 4, borderRadius: 2, marginBottom: 14 },
  speedTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  speedGrid: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  speedOption: {
    width: 110,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
    position: "relative",
  },
  speedOptionValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  speedOptionSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  speedActiveDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
