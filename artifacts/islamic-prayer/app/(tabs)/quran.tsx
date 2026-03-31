import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { SURAHS, Surah } from "@/utils/islamicData";
import {
  searchQuranVerses,
  highlightSegments,
  QuranSearchResult,
} from "@/utils/quranSearch";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";

const GOLD = "#C9933A";
const MIN_VERSE_QUERY = 2;

type ListItem =
  | { type: "surahSection"; count: number }
  | { type: "surah"; surah: Surah }
  | { type: "verseSection"; count: number }
  | { type: "verse"; result: QuranSearchResult }
  | { type: "emptyState" };

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
  const segments = useMemo(
    () => highlightSegments(text, query),
    [text, query]
  );
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

export default function QuranScreen() {
  const { bookmarkedSurahs, toggleBookmark, themeColors: colors } = useAppContext();
  const miniPlayerHeight = useMiniPlayerHeight();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "bookmarked">("all");

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

    if (items.length === 0) {
      items.push({ type: "emptyState" });
    }

    return items;
  }, [isSearchMode, matchingSurahs, verseResults]);

  const renderSurah = (item: Surah) => {
    const isBookmarked = bookmarkedSurahs.includes(item.number);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.surahCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={() =>
          router.push({ pathname: "/quran/[id]", params: { id: item.number.toString() } })
        }
      >
        <View style={[styles.numberBadge, { backgroundColor: colors.prayerCard }]}>
          <Text style={[styles.numberText, { color: colors.gold }]}>{item.number}</Text>
        </View>
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
                      ? `${colors.gold}26`
                      : `${colors.tint}26`,
                },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  {
                    color:
                      item.revelationType === "Meccan" ? colors.gold : colors.tint,
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
            color={isBookmarked ? colors.gold : colors.textSecondary}
          />
          {isBookmarked && (
            <View style={[styles.bookmarkFill, { backgroundColor: colors.gold }]} />
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
            <Text style={[styles.verseSurahNum, { color: colors.gold }]}>
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
        <View style={[styles.ayahBadge, { backgroundColor: `${colors.tint}20`, borderColor: `${colors.tint}40` }]}>
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
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No results found
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Try a different word or phrase
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>القرآن الكريم</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            The Holy Quran
          </Text>
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
            placeholder="Search surahs or verses..."
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
        data={listData}
        keyExtractor={(item, index) => {
          if (item.type === "surah") return `surah-${item.surah.number}`;
          if (item.type === "verse") return `verse-${item.result.surahNum}-${item.result.verseNum}`;
          return `${item.type}-${index}`;
        }}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              miniPlayerHeight +
              (isWeb ? 34 + 84 : 100 + insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !isSearchMode ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="book-open-page-variant-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {filter === "bookmarked" ? "No bookmarked surahs yet" : "No surahs found"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleRow: { marginBottom: 12 },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 13,
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
    gap: 8,
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
  surahCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  surahInfo: {
    flex: 1,
    gap: 2,
  },
  surahNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  surahEnglish: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  surahArabic: {
    fontSize: 18,
  },
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
  typeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  statText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
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
  verseSurahNum: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  verseSurahName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  verseSurahNameAr: {
    fontSize: 13,
  },
  ayahBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  ayahBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
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
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
