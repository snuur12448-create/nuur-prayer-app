import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
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
import { SURAHS } from "@/utils/islamicData";
import {
  DEFAULT_RECITER,
  getVerseAudioUrl,
  RECITERS,
  Reciter,
} from "@/utils/audioData";

interface Verse {
  number: number;
  text: string;
  translation: string;
  transliteration: string;
  numberInQuran: number;
}

type PlayState = "idle" | "loading" | "playing" | "paused";

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNumber = parseInt(id || "1", 10);
  const surah = SURAHS.find((s) => s.number === surahNumber);

  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { bookmarkedSurahs, toggleBookmark, themeColors: colors } = useAppContext();

  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [versesError, setVersesError] = useState(false);

  // Audio state
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(DEFAULT_RECITER);
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [reciterListAtBottom, setReciterListAtBottom] = useState(false);
  const soundRef = useRef<any>(null);
  const previewAudioRef = useRef<any>(null);
  // Preloaded next audio (web only)
  const preloadRef = useRef<{ verseNum: number; audio: HTMLAudioElement } | null>(null);
  const isMountedRef = useRef(true);

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;
  const isBookmarked = bookmarkedSurahs.includes(surahNumber);

  // Fetch verses with Arabic + translation + transliteration
  useEffect(() => {
    isMountedRef.current = true;
    setVerses(null);
    setVersesError(false);
    setLoadingVerses(true);
    stopAudio();

    const controller = new AbortController();
    fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,en.transliteration`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((json) => {
        if (!isMountedRef.current) return;
        const arabicAyahs = json?.data?.[0]?.ayahs as any[];
        const englishAyahs = json?.data?.[1]?.ayahs as any[];
        const translitAyahs = json?.data?.[2]?.ayahs as any[];
        if (!arabicAyahs || !englishAyahs) throw new Error("Bad response");
        const mapped: Verse[] = arabicAyahs.map((a: any, i: number) => ({
          number: a.numberInSurah,
          numberInQuran: a.number,
          text: stripBismillah(a.text, surahNumber, a.numberInSurah),
          translation: englishAyahs[i]?.text ?? "",
          transliteration: translitAyahs?.[i]?.text ?? "",
        }));
        setVerses(mapped);
        setLoadingVerses(false);
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

  useEffect(() => {
    return () => { stopAudio(); stopPreview(); };
  }, []);

  useEffect(() => {
    if (showReciterModal) {
      setReciterListAtBottom(false);
    } else {
      stopPreview();
    }
  }, [showReciterModal]);

  const stopAudio = useCallback(async () => {
    if (soundRef.current) {
      try {
        if (Platform.OS === "web") {
          const audio = soundRef.current as HTMLAudioElement;
          audio.onended = null;
          audio.oncanplaythrough = null;
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
    // Clear preload
    if (preloadRef.current) {
      try {
        preloadRef.current.audio.src = "";
      } catch {}
      preloadRef.current = null;
    }
    if (isMountedRef.current) {
      setPlayingVerse(null);
      setPlayState("idle");
    }
  }, []);

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
          const { Sound } = await import("expo-av");
          const { sound } = await Sound.createAsync({ uri: url }, { shouldPlay: true });
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

  /** Preload the audio for the next verse and the one after (web only) */
  const preloadNext = useCallback((verse: Verse, currentVerses: Verse[]) => {
    if (Platform.OS !== "web") return;
    const next = currentVerses.find((v) => v.number === verse.number + 1);
    if (!next) return;

    // Only replace the preload slot if it's not already the right verse
    if (preloadRef.current?.verseNum !== next.number) {
      try { preloadRef.current?.audio.src && (preloadRef.current.audio.src = ""); } catch {}
      const urlNext = getVerseAudioUrl(selectedReciter, surahNumber, next.number, next.numberInQuran);
      const audioNext = new Audio(urlNext);
      audioNext.preload = "auto";
      audioNext.load(); // aggressively start fetching
      preloadRef.current = { verseNum: next.number, audio: audioNext };
    }

    // Also kick off N+2 in a throwaway element so the browser caches it
    const afterNext = currentVerses.find((v) => v.number === next.number + 1);
    if (afterNext) {
      const url2 = getVerseAudioUrl(selectedReciter, surahNumber, afterNext.number, afterNext.numberInQuran);
      const a2 = new Audio(url2);
      a2.preload = "auto";
      a2.load();
      // We don't store this one — the browser's HTTP cache retains it,
      // so when we create a new Audio(url2) at transition time it starts instantly
    }
  }, [selectedReciter, surahNumber]);

  const playVerse = useCallback(
    async (verse: Verse, currentVerses?: Verse[], isAutoAdvance = false) => {
      const versesToUse = currentVerses || verses;

      // Stop existing audio (manual play only — auto-advance reuses the preloaded element)
      if (!isAutoAdvance && soundRef.current) {
        try {
          if (Platform.OS === "web") {
            const audio = soundRef.current as HTMLAudioElement;
            audio.onended = null;
            audio.oncanplaythrough = null;
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

      if (!isMountedRef.current) return;
      setPlayingVerse(verse.number);
      // Don't flash "loading" on auto-advance — go straight to playing
      if (!isAutoAdvance) setPlayState("loading");

      const url = getVerseAudioUrl(selectedReciter, surahNumber, verse.number, verse.numberInQuran);

      const onEnded = () => {
        if (!isMountedRef.current) return;
        soundRef.current = null;
        if (versesToUse) {
          const next = versesToUse.find((v) => v.number === verse.number + 1);
          if (next) {
            playVerse(next, versesToUse, true); // auto-advance — seamless
          } else {
            setPlayingVerse(null);
            setPlayState("idle");
          }
        } else {
          setPlayingVerse(null);
          setPlayState("idle");
        }
      };

      if (Platform.OS === "web") {
        try {
          let audio: HTMLAudioElement;

          // Use preloaded element if available — it's already been buffering
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
          audio.onerror = () => { if (isMountedRef.current) setPlayState("idle"); };
          audio.onended = onEnded;

          // Play immediately — no canplaythrough gate
          // Preloaded audio starts near-instantly; fresh audio buffers in background
          setPlayState("playing");
          audio.play().catch(() => { if (isMountedRef.current) setPlayState("idle"); });

          // Kick off preload for N+1 (and N+2 inside preloadNext)
          if (versesToUse) preloadNext(verse, versesToUse);
        } catch {
          if (isMountedRef.current) setPlayState("idle");
        }
      } else {
        try {
          const { Audio } = await import("expo-av");
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
          const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
          soundRef.current = sound;
          if (isMountedRef.current) setPlayState("playing");
          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (!isMountedRef.current) return;
            if (status.didJustFinish) {
              soundRef.current = null;
              onEnded();
            }
          });
        } catch {
          if (isMountedRef.current) setPlayState("idle");
        }
      }
    },
    [selectedReciter, surahNumber, verses, preloadNext]
  );

  const togglePlayPause = useCallback(
    async (verse: Verse) => {
      if (playingVerse === verse.number && playState === "playing") {
        try {
          if (Platform.OS === "web") (soundRef.current as HTMLAudioElement)?.pause();
          else await soundRef.current?.pauseAsync();
          setPlayState("paused");
        } catch {}
      } else if (playingVerse === verse.number && playState === "paused") {
        try {
          if (Platform.OS === "web") await (soundRef.current as HTMLAudioElement)?.play();
          else await soundRef.current?.playAsync();
          setPlayState("playing");
        } catch {}
      } else {
        await playVerse(verse);
      }
    },
    [playingVerse, playState, playVerse]
  );

  const playAllVerses = useCallback(async () => {
    if (!verses) return;
    if (playState === "playing" || playState === "loading") {
      await stopAudio();
    } else {
      await playVerse(verses[0], verses);
    }
  }, [verses, playState, playVerse, stopAudio]);

  const copyVerse = (verse: Verse) => {
    const text = `${verse.text}\n\n${verse.translation}\n— ${surah?.englishName} ${surahNumber}:${verse.number}`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setString(text);
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
          <TouchableOpacity onPress={() => { stopAudio(); router.back(); }} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerArabic}>{surah.name}</Text>
            <Text style={styles.headerEnglish}>{surah.englishName}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleBookmark(surahNumber)} style={styles.bookmarkBtn}>
            <Feather name="bookmark" size={22} color={isBookmarked ? colors.gold : "rgba(255,255,255,0.5)"} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{surah.verses}</Text>
            <Text style={styles.metaLabel}>Verses</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{surah.revelationType}</Text>
            <Text style={styles.metaLabel}>Revelation</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>Juz {surah.juz}</Text>
            <Text style={styles.metaLabel}>Location</Text>
          </View>
        </View>
      </View>

      {/* Controls bar */}
      <View style={[styles.controlsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.reciterBtn, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: colors.border }]}
          onPress={() => setShowReciterModal(true)}
        >
          <Feather name="mic" size={13} color={colors.tint} />
          <Text style={[styles.reciterBtnText, { color: colors.text }]} numberOfLines={1}>
            {selectedReciter.name.split(" ").slice(0, 2).join(" ")}
          </Text>
          <Feather name="chevron-down" size={13} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.controlsRight}>
          {verses && (
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
          {/* Transliteration toggle */}
          <TouchableOpacity
            style={[styles.toggleChip, {
              backgroundColor: showTransliteration ? colors.gold + "20" : "rgba(255,255,255,0.05)",
              borderColor: showTransliteration ? colors.gold + "60" : colors.border,
            }]}
            onPress={() => setShowTransliteration((v) => !v)}
          >
            <Text style={[styles.toggleChipText, { color: showTransliteration ? colors.gold : colors.textSecondary }]}>
              A-B-C
            </Text>
          </TouchableOpacity>
          {/* Translation toggle */}
          <Pressable
            style={[styles.toggle, { backgroundColor: showTranslation ? colors.tint : colors.border }]}
            onPress={() => setShowTranslation((v) => !v)}
          >
            <View style={[styles.toggleThumb, { transform: [{ translateX: showTranslation ? 20 : 0 }] }]} />
          </Pressable>
          <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>EN</Text>
        </View>
      </View>

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
          data={verses}
          keyExtractor={(v) => String(v.number)}
          contentContainerStyle={{ padding: 16, paddingBottom: isWeb ? 34 : insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
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
              {surahNumber !== 9 && surahNumber !== 1 && (
                <Text style={[styles.bismillah, { color: colors.text }]}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </Text>
              )}
            </>
          }
          renderItem={({ item: verse }) => {
            const isActive = playingVerse === verse.number;
            const playIcon = getPlayIcon(verse);
            return (
              <View
                style={[
                  styles.verseCard,
                  {
                    backgroundColor: isActive
                      ? colors.tint + "18"
                      : colors.surface,
                    borderColor: isActive
                      ? colors.tint + "60"
                      : copiedVerse === verse.number
                      ? colors.gold
                      : colors.border,
                  },
                ]}
              >
                <View style={styles.verseHeader}>
                  <View style={styles.verseHeaderLeft}>
                    <TouchableOpacity
                      style={[
                        styles.playBtn,
                        {
                          backgroundColor: isActive ? colors.tint : "rgba(255,255,255,0.08)",
                          borderColor: isActive ? colors.tint : colors.border,
                        },
                      ]}
                      onPress={() => togglePlayPause(verse)}
                    >
                      {playIcon === "loader" ? (
                        <ActivityIndicator size="small" color={isActive ? "#fff" : colors.tint} />
                      ) : (
                        <Feather name={playIcon as any} size={11} color={isActive ? "#fff" : colors.tint} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => copyVerse(verse)}
                      style={[styles.copyBtn, { backgroundColor: copiedVerse === verse.number ? colors.gold + "20" : "transparent" }]}
                      hitSlop={8}
                    >
                      <Feather
                        name={copiedVerse === verse.number ? "check" : "copy"}
                        size={12}
                        color={copiedVerse === verse.number ? colors.gold : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.verseNumberBadge, { backgroundColor: isActive ? colors.tint : colors.prayerCard }]}>
                    <Text style={[styles.verseNumber, { color: isActive ? "#fff" : colors.gold }]}>{verse.number}</Text>
                  </View>
                </View>

                <Text style={[styles.arabicVerse, { color: colors.text }]}>{verse.text}</Text>

                {showTransliteration && verse.transliteration ? (
                  <Text style={[styles.transliterationVerse, { color: colors.gold, borderTopColor: colors.border }]}>
                    {verse.transliteration}
                  </Text>
                ) : null}

                {showTranslation && (
                  <Text style={[styles.translationVerse, { color: colors.textSecondary, borderTopColor: colors.border }]}>
                    {verse.translation}
                  </Text>
                )}
              </View>
            );
          }}
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
                            <Text style={[styles.reciterName, { color: colors.text }]}>{reciter.name}</Text>
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
                                backgroundColor: isPreviewing ? colors.tint + "30" : "rgba(255,255,255,0.07)",
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    maxWidth: 180,
  },
  reciterBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
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
  bismillah: { fontSize: 22, textAlign: "center", marginBottom: 20, lineHeight: 36 },
  verseCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  verseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  verseHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  playBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  copyBtn: { width: 26, height: 26, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  verseNumberBadge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  verseNumber: { fontSize: 12, fontFamily: "Inter_700Bold" },
  arabicVerse: { fontSize: 22, textAlign: "right", lineHeight: 40, letterSpacing: 0.3, writingDirection: "rtl" },
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
  reciterName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reciterArabic: { fontSize: 12, fontFamily: "Inter_400Regular" },
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
});
