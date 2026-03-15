import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
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
import { useAppContext } from "@/context/AppContext";
import { HADITHS, Hadith } from "@/utils/hadithData";

const SUNNAH_API_KEY = "SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk";
const SUNNAH_RANDOM_URL = "https://api.sunnah.com/v1/hadiths/random";

const SAHIH_COLLECTIONS = ["bukhari", "muslim", "riyadussalihin", "nawawi40"];

type CollectionFilter = "all" | "Bukhari" | "Muslim" | "Both";

const TOPICS = [
  "All", "Intentions", "Prayer", "Quran", "Fasting", "Dhikr", "Dua",
  "Kindness", "Family", "Brotherhood", "Knowledge",
  "Patience", "Gratitude", "Repentance", "Trust in Allah", "The Heart",
  "Modesty", "Anger", "Wealth", "Paradise",
];

interface LiveHadith {
  id: string;
  arabic: string;
  translation: string;
  narrator: string;
  source: string;
  topic: string;
  collection: string;
  grade: string;
  isLive: true;
}

function collectionLabel(name: string): string {
  const map: Record<string, string> = {
    bukhari: "Bukhari",
    muslim: "Muslim",
    riyadussalihin: "Riyadh al-Salihin",
    nawawi40: "Forty Hadiths",
    abudawud: "Abu Dawud",
    tirmidhi: "al-Tirmidhi",
    ibnmajah: "Ibn Majah",
    nasai: "al-Nasa'i",
  };
  return map[name] ?? name;
}

function stripHtml(str: string): string {
  return str?.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").trim() ?? "";
}

export default function HadithsScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const [activeTopic, setActiveTopic] = useState("All");
  const [activeCollection, setActiveCollection] = useState<CollectionFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [liveHadith, setLiveHadith] = useState<LiveHadith | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLiveHadith = useCallback(async () => {
    setLiveLoading(true);
    setLiveError("");
    try {
      const res = await fetch(SUNNAH_RANDOM_URL, {
        headers: { "x-api-key": SUNNAH_API_KEY },
      });
      const data = await res.json();
      const en = data.hadith?.find((h: any) => h.lang === "en");
      if (en && SAHIH_COLLECTIONS.includes(data.collection)) {
        setLiveHadith({
          id: `live-${data.hadithNumber}-${data.bookNumber}`,
          arabic: "",
          translation: stripHtml(en.body),
          narrator: "",
          source: `${collectionLabel(data.collection)} · Book ${data.bookNumber}, Hadith ${data.hadithNumber}`,
          topic: en.chapterTitle ? stripHtml(en.chapterTitle).substring(0, 40) : "Hadith",
          collection: collectionLabel(data.collection),
          grade: "Sahih",
          isLive: true,
        });
      } else {
        setLiveError("The random result wasn't from a Sahih collection — tap again to try another.");
      }
    } catch {
      setLiveError("Couldn't reach Sunnah.com. Check your connection and try again.");
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveHadith();
  }, []);

  const filteredHadiths = HADITHS.filter((h) => {
    const matchTopic = activeTopic === "All" || h.topic === activeTopic;
    const matchCollection =
      activeCollection === "all" ||
      h.collection === activeCollection ||
      (activeCollection === "Both" && h.collection === "Both");
    const matchSearch =
      !searchText ||
      h.translation.toLowerCase().includes(searchText.toLowerCase()) ||
      h.topic.toLowerCase().includes(searchText.toLowerCase()) ||
      h.narrator.toLowerCase().includes(searchText.toLowerCase());
    return matchTopic && matchCollection && matchSearch;
  });

  const handleCopy = (h: Hadith | LiveHadith) => {
    const text = "arabic" in h && h.arabic
      ? `${h.arabic}\n\n"${h.translation}"\n\n— ${"narrator" in h ? h.narrator : ""}\n${h.source}`
      : `"${h.translation}"\n\n${h.source}`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setString(text);
    }
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.prayerCard, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Feather name="chevron-left" size={24} color={colors.tint} />
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Sahih Hadiths</Text>
            <Text style={[styles.headerArabic, { color: colors.tint }]}>الأحاديث الصحيحة</Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: colors.tint + "20", borderColor: colors.tint + "55" }]}>
            <Text style={[styles.headerBadgeText, { color: colors.tint }]}>SAHIH ONLY</Text>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Feather name="search" size={15} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search hadiths…"
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")} hitSlop={8}>
              <Feather name="x" size={14} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Collection filter */}
        <View style={styles.collectionRow}>
          {(["all", "Bukhari", "Muslim", "Both"] as CollectionFilter[]).map((c) => (
            <Pressable
              key={c}
              onPress={() => setActiveCollection(c)}
              style={[
                styles.collChip,
                {
                  backgroundColor: activeCollection === c ? colors.tint : colors.surface,
                  borderColor: activeCollection === c ? colors.tint : colors.border,
                },
              ]}
            >
              <Text style={[styles.collChipText, { color: activeCollection === c ? "#fff" : colors.textSecondary }]}>
                {c === "all" ? "All" : c === "Both" ? "Both Sahihs" : `Sahih ${c}`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredHadiths}
        keyExtractor={(h) => h.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Topic pills */}
            <FlatList
              data={TOPICS}
              keyExtractor={(t) => t}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.topicList}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setActiveTopic(item)}
                  style={[
                    styles.topicChip,
                    {
                      backgroundColor: activeTopic === item ? colors.tint : colors.surface,
                      borderColor: activeTopic === item ? colors.tint : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.topicChipText, { color: activeTopic === item ? "#fff" : colors.textSecondary }]}>
                    {item}
                  </Text>
                </Pressable>
              )}
            />

            {/* Live Sunnah.com hadith */}
            <LiveHadithCard
              hadith={liveHadith}
              loading={liveLoading}
              error={liveError}
              onRefresh={fetchLiveHadith}
              copied={copiedId === liveHadith?.id}
              bookmarked={liveHadith ? bookmarks.has(liveHadith.id) : false}
              onCopy={() => liveHadith && handleCopy(liveHadith)}
              onBookmark={() => liveHadith && toggleBookmark(liveHadith.id)}
              colors={colors}
            />

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              CURATED COLLECTION · {filteredHadiths.length} HADITHS
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <HadithCard
            hadith={item}
            copied={copiedId === item.id}
            bookmarked={bookmarks.has(item.id)}
            onCopy={() => handleCopy(item)}
            onBookmark={() => toggleBookmark(item.id)}
            colors={colors}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 32 }}>📖</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hadiths match your filters</Text>
          </View>
        }
      />
    </View>
  );
}

function LiveHadithCard({
  hadith, loading, error, onRefresh, copied, bookmarked, onCopy, onBookmark, colors,
}: {
  hadith: LiveHadith | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
  copied: boolean;
  bookmarked: boolean;
  onCopy: () => void;
  onBookmark: () => void;
  colors: any;
}) {
  return (
    <View style={[styles.liveCard, { backgroundColor: colors.prayerCard, borderColor: colors.gold + "66" }]}>
      <View style={[styles.liveAccent, { backgroundColor: colors.gold }]} />
      <View style={styles.liveInner}>
        <View style={styles.liveTitleRow}>
          <View style={[styles.liveBadge, { backgroundColor: colors.gold + "22", borderColor: colors.gold + "55" }]}>
            <Feather name="globe" size={9} color={colors.gold} />
            <Text style={[styles.liveBadgeText, { color: colors.gold }]}>LIVE FROM SUNNAH.COM</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} hitSlop={10} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color={colors.gold} />
              : <Feather name="refresh-cw" size={15} color={colors.gold} />}
          </TouchableOpacity>
        </View>

        {error ? (
          <Text style={[styles.liveError, { color: colors.textSecondary }]}>{error}</Text>
        ) : loading && !hadith ? (
          <View style={styles.liveLoadingBox}>
            <Text style={[styles.liveLoadingText, { color: colors.textSecondary }]}>Fetching an authentic hadith…</Text>
          </View>
        ) : hadith ? (
          <>
            <Text style={[styles.liveTranslation, { color: colors.text }]}>{hadith.translation}</Text>
            <View style={styles.liveMeta}>
              <View style={[styles.sourceBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sourceBadgeText, { color: colors.tint }]}>{hadith.collection}</Text>
              </View>
              <Text style={[styles.liveSource, { color: colors.textSecondary }]}>{hadith.source}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={onCopy} style={[styles.actionBtn, { backgroundColor: colors.surface }]} hitSlop={8}>
                <Feather name={copied ? "check" : "copy"} size={14} color={copied ? colors.tint : colors.textSecondary} />
                <Text style={[styles.actionBtnText, { color: copied ? colors.tint : colors.textSecondary }]}>
                  {copied ? "Copied" : "Copy"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onBookmark} style={[styles.actionBtn, { backgroundColor: colors.surface }]} hitSlop={8}>
                <Feather name={bookmarked ? "bookmark" : "bookmark"} size={14} color={bookmarked ? colors.gold : colors.textSecondary} />
                <Text style={[styles.actionBtnText, { color: bookmarked ? colors.gold : colors.textSecondary }]}>
                  {bookmarked ? "Saved" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

function HadithCard({
  hadith, copied, bookmarked, onCopy, onBookmark, colors,
}: {
  hadith: Hadith;
  copied: boolean;
  bookmarked: boolean;
  onCopy: () => void;
  onBookmark: () => void;
  colors: any;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFromBoth = hadith.collection === "Both";

  return (
    <Pressable
      style={[styles.hadithCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => setExpanded((v) => !v)}
    >
      {/* Left accent */}
      <View style={[styles.hadithAccent, {
        backgroundColor: hadith.collection === "Bukhari" ? "#4CAF50"
          : hadith.collection === "Muslim" ? "#2196F3"
          : colors.tint,
      }]} />

      <View style={styles.hadithInner}>
        {/* Top row */}
        <View style={styles.hadithTopRow}>
          <View style={styles.topicTagRow}>
            <View style={[styles.topicTag, { backgroundColor: colors.prayerCard, borderColor: colors.border }]}>
              <Text style={[styles.topicTagText, { color: colors.textSecondary }]}>{hadith.topic}</Text>
            </View>
            <View style={[styles.collTag, {
              backgroundColor: isFromBoth
                ? colors.tint + "20"
                : hadith.collection === "Bukhari"
                  ? "#4CAF5020"
                  : "#2196F320",
              borderColor: isFromBoth
                ? colors.tint + "55"
                : hadith.collection === "Bukhari"
                  ? "#4CAF5055"
                  : "#2196F355",
            }]}>
              <Text style={[styles.collTagText, {
                color: isFromBoth ? colors.tint
                  : hadith.collection === "Bukhari" ? "#4CAF50"
                  : "#2196F3",
              }]}>
                {isFromBoth ? "Bukhari & Muslim" : `Sahih ${hadith.collection}`}
              </Text>
            </View>
          </View>
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={15} color={colors.textSecondary} />
        </View>

        {/* Arabic */}
        {hadith.arabic ? (
          <Text style={[styles.hadithArabic, { color: colors.text }]}>{hadith.arabic}</Text>
        ) : null}

        {/* Translation */}
        <Text style={[styles.hadithTranslation, { color: colors.text }]} numberOfLines={expanded ? undefined : 3}>
          "{hadith.translation}"
        </Text>

        {/* Transliteration (expanded only) */}
        {expanded && hadith.transliteration ? (
          <Text style={[styles.hadithTranslit, { color: colors.textSecondary }]}>
            {hadith.transliteration}
          </Text>
        ) : null}

        {/* Narrator + source */}
        <Text style={[styles.hadithNarrator, { color: colors.textSecondary }]}>{hadith.narrator}</Text>
        <Text style={[styles.hadithSource, { color: colors.tint }]}>{hadith.source}</Text>

        {/* Actions */}
        {expanded && (
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={onCopy} style={[styles.actionBtn, { backgroundColor: colors.prayerCard }]} hitSlop={8}>
              <Feather name={copied ? "check" : "copy"} size={13} color={copied ? colors.tint : colors.textSecondary} />
              <Text style={[styles.actionBtnText, { color: copied ? colors.tint : colors.textSecondary }]}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBookmark} style={[styles.actionBtn, { backgroundColor: colors.prayerCard }]} hitSlop={8}>
              <Feather name="bookmark" size={13} color={bookmarked ? colors.gold : colors.textSecondary} />
              <Text style={[styles.actionBtnText, { color: bookmarked ? colors.gold : colors.textSecondary }]}>
                {bookmarked ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitles: { flex: 1 },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  headerArabic: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 1,
  },
  headerBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  collectionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  collChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  collChipText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  listContent: { paddingTop: 0 },
  topicList: { borderBottomWidth: StyleSheet.hairlineWidth },
  topicChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  topicChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  /* Live card */
  liveCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  liveAccent: { width: 4 },
  liveInner: { flex: 1, padding: 16, gap: 10 },
  liveTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  liveBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  liveTranslation: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 24,
  },
  liveMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  sourceBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourceBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  liveSource: { fontSize: 12, fontFamily: "Inter_400Regular" },
  liveError: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  liveLoadingBox: { paddingVertical: 12, alignItems: "center" },
  liveLoadingText: { fontSize: 13, fontFamily: "Inter_400Regular" },

  /* Hadith card */
  hadithCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  hadithAccent: { width: 4 },
  hadithInner: { flex: 1, padding: 14, gap: 8 },

  hadithTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  topicTagRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1 },
  topicTag: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  topicTagText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  collTag: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  collTagText: { fontSize: 10, fontFamily: "Inter_700Bold" },

  hadithArabic: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    lineHeight: 34,
  },
  hadithTranslation: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
  },
  hadithTranslit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 19,
  },
  hadithNarrator: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  hadithSource: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },

  emptyBox: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
