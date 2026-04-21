import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { SURAHS, Surah } from "@/utils/islamicData";
import {
  searchQuranVerses,
  highlightSegments,
  QuranSearchResult,
} from "@/utils/quranSearch";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import { gregorianToHijri, HIJRI_MONTHS_EN } from "@/utils/hijriCalendar";
import type { ThemeName } from "@/constants/themes";

const LAST_READ_KEY = "nuur_last_read_position";

// ---------- Static Juz → starting-surah map ----------
// Many Juz begin in the middle of a surah (e.g. Juz 2 starts at Al-Baqarah:142,
// Juz 5 at An-Nisa:24). Walking SURAHS and recording each surah's `juz` field
// only finds Juz that align with a surah start, so chips like 2, 5, 6, 11, 13,
// 16, 19, 20, 22, 23, 24, 25, 27 never resolve. This explicit map covers all 30.
const JUZ_TO_SURAH: Record<number, number> = {
  1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
  11: 9, 12: 11, 13: 12, 14: 15, 15: 17, 16: 18, 17: 21, 18: 23, 19: 25, 20: 27,
  21: 29, 22: 33, 23: 36, 24: 39, 25: 41, 26: 46, 27: 51, 28: 58, 29: 67, 30: 78,
};

// ---------- Per-theme Quran accent ----------
// The default `accent` palette token is too close to `colors.tint` in
// several themes (gold/slate/burgundy/midnight) which makes the rosette and
// hero accents read as monochrome. This map gives the Quran tab a dedicated
// "premium" accent per theme — picked to contrast against both the background
// AND the primary tint, so the hero, rosette, and Continue pill always pop.
const QURAN_ACCENT: Record<ThemeName, { dark: string; light: string }> = {
  emerald:  { dark: "#F4C842", light: "#92400E" }, // warm gold on green
  midnight: { dark: "#F5C56C", light: "#B45309" }, // warm amber on blue
  gold:     { dark: "#FFE7A8", light: "#5A3500" }, // ivory cream on gold (avoid gold-on-gold)
  slate:    { dark: "#E0B274", light: "#7C5A1F" }, // burnished copper on slate
  burgundy: { dark: "#F4C842", light: "#7A4F0E" }, // gold on burgundy
};

interface LastReadPos {
  surahNum: number;
  surahNameEn: string;
  surahNameAr: string;
  ayahNum: number;
}

const GOLD = "#C9933A";
const MIN_VERSE_QUERY = 2;
const SURAH_ROW_HEIGHT = 88; // surahCard padding 12*2 + content ~64

type ListItem =
  | { type: "surahSection"; count: number }
  | { type: "surah"; surah: Surah }
  | { type: "verseSection"; count: number }
  | { type: "verse"; result: QuranSearchResult }
  | { type: "emptyState" };

// ---------- Surah number medallion (mushaf chapter mark) ----------
// Concentric gold rings with small radial tick marks at cardinal points,
// echoing classical Quran sūrah-heading medallions.
const ROSETTE_SIZE = 44;

const Rosette = React.memo(function Rosette({
  n,
  fill,
  stroke,
  numberColor,
}: {
  n: number;
  fill: string;
  stroke: string;
  numberColor: string;
}) {
  const s = ROSETTE_SIZE;
  const c = s / 2;
  const rOuter = c - 1;
  const rMid = rOuter - 3;
  const rInner = rOuter * 0.62;
  // 8 tick marks just outside the inner disc
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    return {
      x1: c + Math.cos(a) * (rInner + 1.5),
      y1: c + Math.sin(a) * (rInner + 1.5),
      x2: c + Math.cos(a) * (rInner + 4),
      y2: c + Math.sin(a) * (rInner + 4),
    };
  });
  return (
    <View
      style={{
        width: s,
        height: s,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={s} height={s} style={{ position: "absolute" }}>
        {/* outer ring */}
        <Circle cx={c} cy={c} r={rOuter} fill="none" stroke={stroke} strokeWidth={0.8} opacity={0.55} />
        {/* mid ring */}
        <Circle cx={c} cy={c} r={rMid} fill="none" stroke={stroke} strokeWidth={0.5} opacity={0.35} />
        {/* radial ticks */}
        {ticks.map((t, i) => (
          <Line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={stroke}
            strokeWidth={0.7}
            opacity={0.6}
          />
        ))}
        {/* inner filled disc */}
        <Circle cx={c} cy={c} r={rInner} fill={fill} stroke={stroke} strokeWidth={0.7} opacity={0.95} />
      </Svg>
      <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: numberColor }}>
        {n}
      </Text>
    </View>
  );
});

function HighlightedText({
  text,
  query,
  style,
  highlightStyle,
  numberOfLines,
}: {
  text: string;
  query: string;
  style: any;
  highlightStyle?: any;
  numberOfLines?: number;
}) {
  const segments = useMemo(() => highlightSegments(text, query), [text, query]);
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <Text key={i} style={highlightStyle ?? { color: GOLD, fontFamily: "Inter_700Bold" }}>
            {seg.text}
          </Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        )
      )}
    </Text>
  );
}

// ---------- For Today recommendations ----------
type Recommendation = {
  id: string;
  surahNum: number;
  surahEn: string;
  surahAr: string;
  label: string;
  reason: string;
  iconName: keyof typeof Feather.glyphMap;
  highlight?: boolean;
};

function getTodaysRecommendations(): Recommendation[] {
  const day = new Date().getDay(); // 0 Sun ... 5 Fri ... 6 Sat
  const recs: Recommendation[] = [];
  if (day === 5) {
    recs.push({
      id: "kahf",
      surahNum: 18,
      surahEn: "Al-Kahf",
      surahAr: "ٱلْكَهْف",
      label: "Sunnah of Friday",
      reason: "Light between two Fridays",
      iconName: "sun",
      highlight: true,
    });
  }
  recs.push({
    id: "yaseen",
    surahNum: 36,
    surahEn: "Yaseen",
    surahAr: "يس",
    label: "After Fajr",
    reason: "Heart of the Quran",
    iconName: "sunrise",
  });
  recs.push({
    id: "mulk",
    surahNum: 67,
    surahEn: "Al-Mulk",
    surahAr: "ٱلْمُلْك",
    label: "Before sleep",
    reason: "Protection through the night",
    iconName: "moon",
  });
  return recs;
}

// ---------- Screen ----------
export default function QuranScreen() {
  const {
    bookmarkedSurahs,
    toggleBookmark,
    themeColors: colors,
    themeName,
    effectiveDisplayMode,
  } = useAppContext();
  // Per-theme premium accent (replaces blanket `accent` so non-emerald
  // themes don't read as monochrome — and gold theme isn't gold-on-gold).
  const accent =
    effectiveDisplayMode === "dark"
      ? QURAN_ACCENT[themeName].dark
      : QURAN_ACCENT[themeName].light;
  // Foreground that sits on top of the accent (e.g., Resume pill text, current
  // Juz chip text). Dark mode accents are warm/light → dark text. Light mode
  // accents are deep/saturated → light text.
  const accentText = effectiveDisplayMode === "dark" ? "#1A1207" : "#FFFFFF";
  const miniPlayerHeight = useMiniPlayerHeight();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "bookmarked">("all");
  const [lastRead, setLastRead] = useState<LastReadPos | null>(null);

  const listRef = useRef<FlatList<ListItem>>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(LAST_READ_KEY)
        .then((raw) => {
          if (!raw) {
            setLastRead(null);
            return;
          }
          try {
            setLastRead(JSON.parse(raw));
          } catch {
            setLastRead(null);
          }
        })
        .catch(() => setLastRead(null));
    }, [])
  );

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const trimmedQuery = search.trim();
  const isSearchMode = trimmedQuery.length >= MIN_VERSE_QUERY && filter === "all";

  const matchingSurahs = useMemo(() => {
    if (!trimmedQuery) {
      return filter === "bookmarked"
        ? SURAHS.filter((s) => bookmarkedSurahs.includes(s.number))
        : SURAHS;
    }
    const q = trimmedQuery.toLowerCase();
    return SURAHS.filter((s) => {
      const hit =
        s.englishName.toLowerCase().includes(q) ||
        s.englishMeaning.toLowerCase().includes(q) ||
        s.name.includes(trimmedQuery) ||
        s.number.toString() === trimmedQuery;
      if (filter === "bookmarked") return hit && bookmarkedSurahs.includes(s.number);
      return hit;
    });
  }, [trimmedQuery, filter, bookmarkedSurahs]);

  const verseResults = useMemo<QuranSearchResult[]>(() => {
    if (!isSearchMode) return [];
    return searchQuranVerses(trimmedQuery, 40);
  }, [isSearchMode, trimmedQuery]);

  const listData = useMemo<ListItem[]>(() => {
    if (!isSearchMode) {
      // In non-search mode, leave the array empty when there are no matches so
      // FlatList's ListEmptyComponent (which has filter-aware copy) takes over.
      return matchingSurahs.map((s) => ({ type: "surah", surah: s }));
    }

    const items: ListItem[] = [];
    if (matchingSurahs.length > 0) {
      items.push({ type: "surahSection", count: matchingSurahs.length });
      matchingSurahs.forEach((s) => items.push({ type: "surah", surah: s }));
    }
    if (verseResults.length > 0) {
      items.push({ type: "verseSection", count: verseResults.length });
      verseResults.forEach((r) => items.push({ type: "verse", result: r }));
    }
    if (items.length === 0) items.push({ type: "emptyState" });
    return items;
  }, [isSearchMode, matchingSurahs, verseResults]);

  // Compute index of starting surah for each Juz (1..30) in the visible list.
  // Uses JUZ_TO_SURAH so chips for Juz that begin mid-surah (2, 5, 6, 11, 13,
  // 16, 19, 20, 22, 23, 24, 25, 27) still resolve to the surah that contains
  // the start of that Juz.
  const juzFirstIndex = useMemo(() => {
    const surahNumberToIndex: Record<number, number> = {};
    listData.forEach((item, idx) => {
      if (item.type === "surah") {
        surahNumberToIndex[item.surah.number] = idx;
      }
    });
    const map: Record<number, number> = {};
    for (let j = 1; j <= 30; j++) {
      const surahNum = JUZ_TO_SURAH[j];
      const idx = surahNumberToIndex[surahNum];
      if (idx !== undefined) map[j] = idx;
    }
    return map;
  }, [listData]);

  const jumpToJuz = useCallback(
    (juz: number) => {
      const target = juzFirstIndex[juz];
      if (target === undefined || !listRef.current) return;
      // scrollToIndex is preferable because FlatList uses its own internal
      // layout knowledge (which already accounts for the variable-height
      // ListHeaderComponent). If a row hasn't been measured yet,
      // onScrollToIndexFailed below provides a fallback path.
      try {
        listRef.current.scrollToIndex({
          index: target,
          animated: true,
          viewPosition: 0,
          viewOffset: 8,
        });
      } catch {
        /* handled by onScrollToIndexFailed */
      }
    },
    [juzFirstIndex]
  );

  // ---------- Renderers ----------
  const renderSurah = (item: Surah) => {
    const isBookmarked = bookmarkedSurahs.includes(item.number);
    const isLastRead = lastRead?.surahNum === item.number;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.surahCard,
          {
            backgroundColor: colors.surface,
            borderColor: isLastRead ? `${accent}66` : colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={() =>
          router.push({ pathname: "/quran/[id]", params: { id: item.number.toString() } })
        }
      >
        <Rosette
          n={item.number}
          fill={`${accent}1f`}
          stroke={`${accent}88`}
          numberColor={accent}
        />
        <View style={styles.surahInfo}>
          <View style={styles.surahNameRow}>
            {isSearchMode ? (
              <HighlightedText
                text={item.englishName}
                query={trimmedQuery}
                style={[styles.surahEnglish, { color: colors.text }]}
              />
            ) : (
              <Text style={[styles.surahEnglish, { color: colors.text }]}>{item.englishName}</Text>
            )}
            <Text style={[styles.surahArabic, { color: colors.text }]}>{item.name}</Text>
          </View>
          <View style={styles.surahMeta}>
            <Text style={[styles.surahMeaning, { color: colors.textSecondary }]}>
              {item.englishMeaning}
            </Text>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    item.revelationType === "Meccan"
                      ? `${accent}26`
                      : `${colors.tint}26`,
                },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  {
                    color:
                      item.revelationType === "Meccan" ? accent : colors.tint,
                  },
                ]}
              >
                {item.revelationType}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.verses} verses
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              Juz {item.juz}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => toggleBookmark(item.number)}
          hitSlop={8}
          style={styles.bookmarkBtn}
        >
          <Feather
            name="bookmark"
            size={18}
            color={isBookmarked ? accent : colors.textSecondary}
          />
          {isBookmarked && (
            <View style={[styles.bookmarkFill, { backgroundColor: accent }]} />
          )}
        </TouchableOpacity>
      </Pressable>
    );
  };

  const renderVerseResult = (result: QuranSearchResult) => (
    <Pressable
      style={({ pressed }) => [
        styles.verseCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() =>
        router.push({
          pathname: "/quran/[id]",
          params: {
            id: result.surahNum.toString(),
            initialVerse: result.verseNum.toString(),
          },
        })
      }
    >
      <View style={styles.verseCardHeader}>
        <View style={styles.verseCardSurahRow}>
          <View style={[styles.verseSurahBadge, { backgroundColor: colors.prayerCard }]}>
            <Text style={[styles.verseSurahNum, { color: accent }]}>
              {result.surahNum}
            </Text>
          </View>
          <Text style={[styles.verseSurahName, { color: colors.text }]}>
            {result.surahNameEn}
          </Text>
          <Text style={[styles.verseSurahNameAr, { color: colors.textSecondary }]}>
            {result.surahNameAr}
          </Text>
        </View>
        <View
          style={[
            styles.ayahBadge,
            { backgroundColor: `${colors.tint}20`, borderColor: `${colors.tint}40` },
          ]}
        >
          <Text style={[styles.ayahBadgeText, { color: colors.tint }]}>
            Ayah {result.verseNum}
          </Text>
        </View>
      </View>
      <HighlightedText
        text={result.arabicText}
        query={/[\u0600-\u06FF]/.test(trimmedQuery) ? trimmedQuery : ""}
        style={[styles.verseArabic, { color: colors.text }]}
        numberOfLines={2}
      />
      <HighlightedText
        text={result.engText}
        query={/[\u0600-\u06FF]/.test(trimmedQuery) ? "" : trimmedQuery}
        style={[styles.verseTranslation, { color: colors.textSecondary }]}
        highlightStyle={{ color: GOLD, fontFamily: "Inter_600SemiBold" }}
        numberOfLines={3}
      />
    </Pressable>
  );

  // ---- Continue Reading hero (with progress) ----
  const renderContinueReading = () => {
    if (!lastRead || isSearchMode || filter === "bookmarked") return null;
    const surahMeta = SURAHS.find((s) => s.number === lastRead.surahNum);
    const totalVerses = surahMeta?.verses ?? 0;
    const pct = totalVerses > 0 ? Math.min(1, lastRead.ayahNum / totalVerses) : 0;
    return (
      <Pressable
        style={({ pressed }) => [
          crStyles.card,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: `${accent}66`,
            opacity: pressed ? 0.92 : 1,
            shadowColor: accent,
          },
        ]}
        onPress={() =>
          router.push({
            pathname: "/quran/[id]",
            params: {
              id: lastRead.surahNum.toString(),
              initialVerse: lastRead.ayahNum.toString(),
            },
          })
        }
      >
        <View style={crStyles.headerRow}>
          <Text style={[crStyles.eyebrow, { color: accent }]}>CONTINUE</Text>
          <Feather name="chevron-right" size={18} color={`${accent}cc`} />
        </View>
        <View style={crStyles.titleRow}>
          <Text style={[crStyles.nameEn, { color: colors.text }]} numberOfLines={1}>
            {lastRead.surahNameEn}
          </Text>
          <Text style={[crStyles.nameAr, { color: colors.text }]} numberOfLines={1}>
            {lastRead.surahNameAr}
          </Text>
        </View>
        <Text style={[crStyles.metaLine, { color: colors.textSecondary }]}>
          {surahMeta?.englishMeaning ? `${surahMeta.englishMeaning} · ` : ""}
          Ayah {lastRead.ayahNum}
          {totalVerses ? ` of ${totalVerses}` : ""}
        </Text>
        {totalVerses > 0 && (
          <>
            <View style={[crStyles.progressTrack, { backgroundColor: `${accent}1f` }]}>
              <View
                style={[
                  crStyles.progressFill,
                  { width: `${pct * 100}%`, backgroundColor: accent },
                ]}
              />
            </View>
            <View style={crStyles.progressMeta}>
              <Text style={[crStyles.progressMetaText, { color: colors.textSecondary }]}>
                {Math.round(pct * 100)}% read
              </Text>
              <View style={[crStyles.resumePill, { backgroundColor: accent }]}>
                <Feather name="play" size={11} color={accentText} />
                <Text style={[crStyles.resumePillText, { color: accentText }]}>Resume</Text>
              </View>
            </View>
          </>
        )}
      </Pressable>
    );
  };

  // ---- For Today strip ----
  const renderForToday = () => {
    if (isSearchMode || filter === "bookmarked") return null;
    const recs = getTodaysRecommendations();
    return (
      <View style={ftStyles.wrap}>
        <View style={ftStyles.headerRow}>
          <MaterialCommunityIcons name="star-four-points-outline" size={13} color={accent} />
          <Text style={[ftStyles.headerText, { color: colors.text }]}>For Today</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={ftStyles.scrollContent}
        >
          {recs.map((rec) => (
            <Pressable
              key={rec.id}
              accessibilityRole="button"
              accessibilityLabel={`${rec.label}: open ${rec.surahEn}`}
              accessibilityHint={rec.reason}
              onPress={() =>
                router.push({
                  pathname: "/quran/[id]",
                  params: { id: rec.surahNum.toString() },
                })
              }
              style={({ pressed }) => [
                ftStyles.card,
                {
                  backgroundColor: rec.highlight
                    ? `${colors.tint}1a`
                    : colors.surface,
                  borderColor: rec.highlight
                    ? `${colors.tint}66`
                    : colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View
                style={[
                  ftStyles.iconWrap,
                  {
                    backgroundColor: rec.highlight
                      ? colors.tint
                      : `${accent}22`,
                  },
                ]}
              >
                <Feather
                  name={rec.iconName}
                  size={14}
                  color={rec.highlight ? "#fff" : accent}
                />
              </View>
              <Text style={[ftStyles.cardLabel, { color: colors.textSecondary }]}>
                {rec.label}
              </Text>
              <View style={ftStyles.cardNameRow}>
                <Text style={[ftStyles.cardNameEn, { color: colors.text }]} numberOfLines={1}>
                  {rec.surahEn}
                </Text>
                <Text style={[ftStyles.cardNameAr, { color: colors.textSecondary }]} numberOfLines={1}>
                  {rec.surahAr}
                </Text>
              </View>
              <Text style={[ftStyles.cardReason, { color: colors.textSecondary }]} numberOfLines={1}>
                {rec.reason}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  // ---- Jump to Juz strip ----
  const renderJuzJumper = () => {
    if (isSearchMode || filter === "bookmarked" || matchingSurahs.length === 0) return null;
    const lastReadJuz = lastRead
      ? SURAHS.find((s) => s.number === lastRead.surahNum)?.juz
      : undefined;
    return (
      <View style={jjStyles.wrap}>
        <View style={jjStyles.headerRow}>
          <Text style={[jjStyles.label, { color: colors.textSecondary }]}>JUMP TO JUZ</Text>
          <Text style={[jjStyles.hint, { color: colors.textSecondary }]}>30 parts</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={jjStyles.scrollContent}
        >
          {Array.from({ length: 30 }).map((_, i) => {
            const j = i + 1;
            const enabled = juzFirstIndex[j] !== undefined;
            const isCurrent = j === lastReadJuz;
            return (
              <Pressable
                key={j}
                accessibilityRole="button"
                accessibilityLabel={`Jump to Juz ${j}`}
                accessibilityState={{ disabled: !enabled, selected: isCurrent }}
                onPress={() => jumpToJuz(j)}
                disabled={!enabled}
                style={({ pressed }) => [
                  jjStyles.chip,
                  {
                    backgroundColor: isCurrent
                      ? accent
                      : enabled
                      ? colors.surface
                      : "transparent",
                    borderColor: isCurrent
                      ? accent
                      : enabled
                      ? colors.border
                      : `${colors.border}55`,
                    opacity: pressed ? 0.7 : enabled ? 1 : 0.4,
                  },
                ]}
              >
                <Text
                  style={[
                    jjStyles.chipText,
                    {
                      color: isCurrent
                        ? accentText
                        : enabled
                        ? colors.text
                        : colors.textSecondary,
                      fontFamily: isCurrent ? "Inter_700Bold" : "Inter_600SemiBold",
                    },
                  ]}
                >
                  {j}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "surah") return renderSurah(item.surah);
    if (item.type === "verse") return renderVerseResult(item.result);
    if (item.type === "surahSection") {
      return (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Surahs</Text>
          <View style={[styles.sectionBadge, { backgroundColor: `${colors.tint}20` }]}>
            <Text style={[styles.sectionCount, { color: colors.tint }]}>{item.count}</Text>
          </View>
        </View>
      );
    }
    if (item.type === "verseSection") {
      return (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Verses</Text>
          <View style={[styles.sectionBadge, { backgroundColor: `${GOLD}20` }]}>
            <Text style={[styles.sectionCount, { color: GOLD }]}>{item.count}</Text>
          </View>
          {item.count === 40 && (
            <Text style={[styles.sectionNote, { color: colors.textSecondary }]}>
              (showing first 40)
            </Text>
          )}
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="book-search-outline"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Try a different word or phrase
        </Text>
      </View>
    );
  };

  // Hijri label for the small pill
  const hijriLabel = useMemo(() => {
    try {
      const { hDay, hMonth, hYear } = gregorianToHijri(new Date());
      const monthName = HIJRI_MONTHS_EN[hMonth - 1] ?? "";
      return `${hDay} ${monthName} ${hYear}`;
    } catch {
      return "";
    }
  }, []);

  // List header (Continue + For Today + Jump Juz + All Surahs label).
  const listHeader = (
    <View>
      {renderContinueReading()}
      {renderForToday()}
      {renderJuzJumper()}
      {!isSearchMode && matchingSurahs.length > 0 && (
        <View style={styles.allHeader}>
          <Text style={[styles.allHeaderTitle, { color: colors.text }]}>
            {filter === "bookmarked" ? "Bookmarked" : "All Surahs"}
          </Text>
          <View style={[styles.sectionBadge, { backgroundColor: `${accent}22` }]}>
            <Text style={[styles.sectionCount, { color: accent }]}>
              {matchingSurahs.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            {hijriLabel ? (
              <View style={[styles.hijriPill, { backgroundColor: `${accent}18`, borderColor: `${accent}44` }]}>
                <Text style={[styles.hijriPillText, { color: accent }]}>{hijriLabel}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>القرآن الكريم</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              The Holy Quran
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search surah, verse or ayah text…"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {!isSearchMode && (
          <View style={styles.filterRow}>
            {(["all", "bookmarked"] as const).map((f) => (
              <Pressable
                key={f}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: filter === f ? colors.tint : "transparent",
                    borderColor: filter === f ? colors.tint : colors.border,
                  },
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: filter === f ? "#fff" : colors.textSecondary },
                  ]}
                >
                  {f === "all" ? "All Surahs" : "Bookmarked"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {isSearchMode && (
          <View style={styles.searchModeBanner}>
            <Feather name="zap" size={12} color={GOLD} />
            <Text style={[styles.searchModeText, { color: colors.textSecondary }]}>
              Searching all 6,236 verses offline
            </Text>
          </View>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={listData}
        keyExtractor={(item, index) => {
          if (item.type === "surah") return `surah-${item.surah.number}`;
          if (item.type === "verse") return `verse-${item.result.surahNum}-${item.result.verseNum}`;
          return `${item.type}-${index}`;
        }}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              miniPlayerHeight + (isWeb ? 34 + 84 : 100 + insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={(info) => {
          // Fallback: estimate offset and try again on next frame
          const offset = info.averageItemLength * info.index;
          listRef.current?.scrollToOffset({ offset, animated: true });
          setTimeout(() => {
            try {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0,
                viewOffset: 8,
              });
            } catch {}
          }, 80);
        }}
        ListEmptyComponent={
          !isSearchMode ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={
                  filter === "bookmarked"
                    ? "bookmark-outline"
                    : "book-search-outline"
                }
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {filter === "bookmarked"
                  ? trimmedQuery
                    ? `No bookmarked surahs match "${trimmedQuery}"`
                    : "No bookmarked surahs yet"
                  : trimmedQuery
                  ? `No surahs match "${trimmedQuery}"`
                  : "No surahs found"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  hijriPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  hijriPillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  searchModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
  },
  searchModeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  sectionNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  allHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  allHeaderTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  surahCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  surahInfo: { flex: 1, gap: 2 },
  surahNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  surahEnglish: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  surahArabic: { fontSize: 18 },
  surahMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  surahMeaning: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  statText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  dot: { width: 3, height: 3, borderRadius: 1.5 },
  bookmarkBtn: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bookmarkFill: {
    position: "absolute",
    bottom: 4,
    width: 10,
    height: 6,
    borderRadius: 1,
  },
  verseCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  verseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  verseCardSurahRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  verseSurahBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  verseSurahNum: { fontSize: 12, fontFamily: "Inter_700Bold" },
  verseSurahName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  verseSurahNameAr: { fontSize: 13 },
  ayahBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  ayahBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  verseArabic: {
    fontSize: 18,
    lineHeight: 30,
    textAlign: "right",
    fontFamily: "Inter_400Regular",
  },
  verseTranslation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});

const crStyles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  nameEn: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    flexShrink: 1,
  },
  nameAr: {
    fontSize: 22,
  },
  metaLine: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  progressMetaText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  resumePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  resumePillText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});

const ftStyles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    paddingLeft: 2,
  },
  headerText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  scrollContent: {
    gap: 10,
    paddingRight: 8,
  },
  card: {
    width: 168,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 6,
  },
  cardNameEn: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    flexShrink: 1,
  },
  cardNameAr: {
    fontSize: 15,
  },
  cardReason: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});

const jjStyles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingLeft: 2,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  hint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  scrollContent: {
    gap: 6,
    paddingRight: 8,
  },
  chip: {
    minWidth: 38,
    height: 32,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
});
