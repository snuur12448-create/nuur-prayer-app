import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import { HADITHS, HADITH_TOPICS, Hadith } from "@/utils/hadithData";
import { useSavedItems } from "@/utils/useSavedItems";
import ContentShareSheet from "@/components/ContentShareSheet";
import { CornerFloret, NuurMark } from "@/components/share/ShareDecor";

const SUNNAH_API_KEY = process.env.EXPO_PUBLIC_SUNNAH_API_KEY ?? "";
const SUNNAH_RANDOM_URL = "https://api.sunnah.com/v1/hadiths/random";

const SAHIH_COLLECTIONS = ["bukhari", "muslim"];

type CollectionFilter = "all" | "Bukhari" | "Muslim" | "Both";

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

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Akhirah",
  "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah",
];

function approximateHijriToday(): string {
  const today = new Date();
  const jd = Math.floor((today.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  const safeMonth = Math.max(1, Math.min(12, month));
  const safeDay = Math.max(1, Math.min(30, day));
  return `${safeDay} ${HIJRI_MONTHS[safeMonth - 1]} ${year}`;
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

function collectionBadgeLabel(c: string): string {
  if (c === "Both") return "Bukhari & Muslim";
  return `Sahih ${c}`;
}

function shortNarrator(n: string): string {
  return n.replace(/^Narrated\s+by\s+/i, "").replace(/^Transmitted\s+by\s+/i, "").trim();
}

const ARABIC_PREF_KEY = "nuur:hadiths:showArabic";

function useShowArabic(): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(ARABIC_PREF_KEY)
      .then((raw) => {
        if (!cancelled && raw === "1") setValue(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const update = useCallback((next: boolean) => {
    setValue(next);
    AsyncStorage.setItem(ARABIC_PREF_KEY, next ? "1" : "0").catch(() => {});
  }, []);
  return [value, update];
}

export default function HadithsScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const [activeTopic, setActiveTopic] = useState("All");
  const [activeCollection, setActiveCollection] = useState<CollectionFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [liveHadith, setLiveHadith] = useState<LiveHadith | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveIsFeatured, setLiveIsFeatured] = useState(false);
  const { savedIds: bookmarks, toggle: toggleBookmark } = useSavedItems("nuur_saved_hadiths");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareHadith, setShareHadith] = useState<Hadith | LiveHadith | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showArabic, setShowArabic] = useShowArabic();

  const hijriToday = useMemo(() => approximateHijriToday(), []);

  const showLocalFeatured = useCallback(() => {
    setLiveIsFeatured(true);
    const h = HADITHS[Math.floor(Math.random() * HADITHS.length)];
    setLiveHadith({
      id: h.id, // canonical id so bookmarks sync with the curated list
      arabic: h.arabic,
      translation: h.translation,
      narrator: h.narrator,
      source: h.source,
      topic: h.topic,
      collection: h.collection === "Both" ? "Bukhari & Muslim" : `Sahih ${h.collection}`,
      grade: "Sahih",
      isLive: true,
    });
  }, []);

  const fetchLiveHadith = useCallback(async () => {
    setLiveLoading(true);
    setLiveIsFeatured(false);

    if (SUNNAH_API_KEY) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const res = await fetch(SUNNAH_RANDOM_URL, {
            headers: { "x-api-key": SUNNAH_API_KEY },
          });
          if (!res.ok) break;
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
            setLiveLoading(false);
            return;
          }
        } catch {
          break;
        }
      }
    }

    showLocalFeatured();
    setLiveLoading(false);
  }, [showLocalFeatured]);

  useEffect(() => {
    fetchLiveHadith();
  }, []);

  const isSaved = activeTopic === "Saved";
  const filteredHadiths = HADITHS.filter((h) => {
    if (isSaved && !bookmarks.has(h.id)) return false;
    const matchTopic = isSaved || activeTopic === "All" || h.topic === activeTopic;
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
      Clipboard.setStringAsync(text).catch(() => {});
    }
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.gold + "22" }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
            <Feather name="chevron-left" size={24} color={colors.gold} />
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Sahih Hadiths</Text>
            <Text style={[styles.headerArabic, { color: colors.gold, fontFamily: "AmiriQuran_400Regular" }]}>
              الأحاديث الصحيحة
            </Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: colors.gold + "10", borderColor: colors.gold + "55" }]}>
            <Text style={[styles.headerBadgeText, { color: colors.gold }]}>SAHIH ONLY</Text>
          </View>
        </View>

        {/* Search — underline style */}
        <View style={[styles.searchBox, { borderBottomColor: colors.gold + "44" }]}>
          <Feather name="search" size={14} color={colors.gold + "AA"} />
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

        {/* Collection filter — gold-bordered chips, with Arabic toggle on the right */}
        <View style={styles.collectionRow}>
          <View style={styles.collectionChips}>
            {(["all", "Bukhari", "Muslim", "Both"] as CollectionFilter[]).map((c) => {
              const active = activeCollection === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setActiveCollection(c)}
                  style={[
                    styles.collChip,
                    {
                      backgroundColor: active ? colors.gold : "transparent",
                      borderColor: active ? colors.gold : colors.gold + "44",
                    },
                  ]}
                >
                  <Text style={[styles.collChipText, { color: active ? colors.background : colors.textSecondary }]}>
                    {c === "all" ? "All" : c === "Both" ? "Both" : c}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => setShowArabic(!showArabic)}
            accessibilityRole="switch"
            accessibilityState={{ checked: showArabic }}
            accessibilityLabel={showArabic ? "Hide Arabic text" : "Show Arabic text"}
            style={[
              styles.arabicToggle,
              {
                backgroundColor: showArabic ? colors.gold : "transparent",
                borderColor: showArabic ? colors.gold : colors.gold + "55",
              },
            ]}
          >
            <Text
              style={[
                styles.arabicToggleGlyph,
                {
                  color: showArabic ? colors.background : colors.gold,
                  fontFamily: "AmiriQuran_400Regular",
                },
              ]}
            >
              أ
            </Text>
            <Text
              style={[
                styles.arabicToggleLabel,
                { color: showArabic ? colors.background : colors.gold + "CC" },
              ]}
            >
              {showArabic ? "ON" : "OFF"}
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredHadiths}
        keyExtractor={(h) => h.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 + miniPlayerH }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Topic medallions */}
            <FlatList
              data={["Saved", ...HADITH_TOPICS]}
              keyExtractor={(t) => t}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.topicList}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 14 }}
              renderItem={({ item }) => {
                const isActive = activeTopic === item;
                const isSavedChip = item === "Saved";
                return (
                  <Pressable
                    onPress={() => setActiveTopic(item)}
                    style={[
                      styles.topicChip,
                      {
                        backgroundColor: isActive ? colors.gold : "transparent",
                        borderColor: isActive ? colors.gold : colors.gold + "44",
                      },
                    ]}
                  >
                    {isSavedChip && (
                      <MaterialCommunityIcons
                        name="bookmark"
                        size={11}
                        color={isActive ? colors.background : colors.gold}
                      />
                    )}
                    <Text
                      style={[
                        styles.topicChipText,
                        { color: isActive ? colors.background : colors.textSecondary },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />

            {/* Hero — Today's Reading */}
            <FeaturedHadithCard
              hadith={liveHadith}
              loading={liveLoading}
              isFeatured={liveIsFeatured}
              hijriDate={hijriToday}
              onRefresh={liveIsFeatured ? showLocalFeatured : fetchLiveHadith}
              copied={copiedId === liveHadith?.id}
              bookmarked={liveHadith ? bookmarks.has(liveHadith.id) : false}
              onCopy={() => liveHadith && handleCopy(liveHadith)}
              onBookmark={() => liveHadith && toggleBookmark(liveHadith.id)}
              onShare={() => liveHadith && setShareHadith(liveHadith)}
              showArabic={showArabic}
              colors={colors}
            />

            {/* Section divider */}
            <View style={styles.sectionDivider}>
              <View style={[styles.dividerRule, { backgroundColor: colors.gold + "55" }]} />
              <Text style={[styles.sectionLabel, { color: colors.gold }]}>
                CURATED · {filteredHadiths.length} HADITHS
              </Text>
              <View style={[styles.dividerRule, { backgroundColor: colors.gold + "55" }]} />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <HadithListCard
            hadith={item}
            expanded={expandedId === item.id}
            onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
            copied={copiedId === item.id}
            bookmarked={bookmarks.has(item.id)}
            onCopy={() => handleCopy(item)}
            onBookmark={() => toggleBookmark(item.id)}
            onShare={() => setShareHadith(item)}
            showArabic={showArabic}
            colors={colors}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            {isSaved ? (
              <>
                <MaterialCommunityIcons name="bookmark-outline" size={44} color={colors.gold + "55"} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No saved hadiths yet. Tap the bookmark icon on any hadith to save your favourites.
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 32 }}>📖</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hadiths match your filters</Text>
              </>
            )}
          </View>
        }
      />

      {shareHadith && (
        <ContentShareSheet
          visible={true}
          onClose={() => setShareHadith(null)}
          theme="hadith"
          sheetTitle="Share Hadith"
          shareTitle={shareHadith.source}
          label={`HADITH  ·  ${shareHadith.topic.toUpperCase()}`}
          arabicText={shareHadith.arabic || undefined}
          bodyText={shareHadith.translation}
          source={shareHadith.source}
        />
      )}
    </View>
  );
}

/* ─── Bookmark button (animated) ─────────────────────────────────────────── */

function BookmarkBtn({
  bookmarked, onPress, gold, dim,
}: { bookmarked: boolean; onPress: () => void; gold: string; dim: string }) {
  return (
    <Pressable
      onPress={(e: any) => { e?.stopPropagation?.(); onPress(); }}
      hitSlop={14}
      style={({ pressed }) => ({
        padding: 6,
        opacity: pressed ? 0.5 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={bookmarked ? "Remove bookmark" : "Save hadith"}
    >
      <MaterialCommunityIcons
        name={bookmarked ? "bookmark" : "bookmark-outline"}
        size={18}
        color={bookmarked ? gold : dim}
      />
    </Pressable>
  );
}

function stop(fn: () => void) {
  return (e: any) => {
    e?.stopPropagation?.();
    fn();
  };
}

/* ─── Mushaf frame (double-line gold border + 4 corner florets) ──────────── */

function MushafFrame({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <View style={[styles.mushafOuter, { borderColor: color + "55" }]}>
      <View style={[styles.mushafInner, { borderColor: color + "22" }]}>
        <View style={styles.cornerTL}><CornerFloret size={22} /></View>
        <View style={styles.cornerTR}><CornerFloret size={22} /></View>
        <View style={styles.cornerBL}><CornerFloret size={22} /></View>
        <View style={styles.cornerBR}><CornerFloret size={22} /></View>
        {children}
      </View>
    </View>
  );
}

/* ─── Featured hero card ─────────────────────────────────────────────────── */

function FeaturedHadithCard({
  hadith, loading, isFeatured, hijriDate, onRefresh, copied, bookmarked, onCopy, onBookmark, onShare, showArabic, colors,
}: {
  hadith: LiveHadith | null;
  loading: boolean;
  isFeatured: boolean;
  hijriDate: string;
  onRefresh: () => void;
  copied: boolean;
  bookmarked: boolean;
  onCopy: () => void;
  onBookmark: () => void;
  onShare: () => void;
  showArabic: boolean;
  colors: any;
}) {
  return (
    <View style={styles.heroWrap}>
      <MushafFrame color={colors.gold}>
        <View style={styles.heroPanel}>
          {/* Top frame: hijri date · rule · featured badge */}
          <View style={styles.heroTopRow}>
            <Text style={[styles.heroDate, { color: colors.gold + "B3" }]}>{hijriDate}</Text>
            <View style={[styles.heroDateRule, { backgroundColor: colors.gold + "44" }]} />
            <View style={[styles.heroBadge, { backgroundColor: colors.gold + "1A", borderColor: colors.gold + "55" }]}>
              <NuurMark size={11} />
              <Text style={[styles.heroBadgeText, { color: colors.gold }]}>
                {isFeatured ? "FEATURED" : "LIVE"}
              </Text>
            </View>
          </View>

          {loading && !hadith ? (
            <View style={styles.heroLoading}>
              <ActivityIndicator size="small" color={colors.gold} />
              <Text style={[styles.heroLoadingText, { color: colors.textSecondary }]}>Fetching an authentic hadith…</Text>
            </View>
          ) : hadith ? (
            <>
              {showArabic && hadith.arabic ? (
                <Text
                  style={[styles.heroArabic, { color: colors.text }]}
                  numberOfLines={4}
                >
                  {hadith.arabic}
                </Text>
              ) : null}

              <Text style={[styles.heroTranslation, { color: colors.text }]} numberOfLines={6}>
                "{hadith.translation}"
              </Text>

              {hadith.narrator ? (
                <Text style={[styles.heroNarrator, { color: colors.gold + "CC" }]}>
                  {shortNarrator(hadith.narrator).toUpperCase()}
                </Text>
              ) : null}
              <Text style={[styles.heroSource, { color: colors.textSecondary }]}>
                {hadith.source}
              </Text>

              {/* Action row */}
              <View style={[styles.heroActions, { borderTopColor: colors.gold + "33" }]}>
                <BookmarkBtn
                  bookmarked={bookmarked}
                  onPress={onBookmark}
                  gold={colors.gold}
                  dim={colors.textSecondary}
                />
                <View style={{ flexDirection: "row", gap: 18, alignItems: "center" }}>
                  <Pressable onPress={stop(onCopy)} hitSlop={10} accessibilityRole="button" accessibilityLabel={copied ? "Copied" : "Copy hadith"}>
                    <Feather
                      name={copied ? "check" : "copy"}
                      size={16}
                      color={copied ? colors.gold : colors.gold + "CC"}
                    />
                  </Pressable>
                  <Pressable onPress={stop(onShare)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Share hadith">
                    <Feather name="share" size={16} color={colors.gold + "CC"} />
                  </Pressable>
                  <Pressable onPress={stop(onRefresh)} hitSlop={10} disabled={loading} accessibilityRole="button" accessibilityLabel="New featured hadith">
                    {loading
                      ? <ActivityIndicator size="small" color={colors.gold} />
                      : <Feather name="refresh-cw" size={15} color={colors.gold + "CC"} />}
                  </Pressable>
                </View>
              </View>
            </>
          ) : null}
        </View>
      </MushafFrame>
    </View>
  );
}

/* ─── List card ──────────────────────────────────────────────────────────── */

function collectionAccent(coll: string, fallback: string): string {
  if (coll === "Bukhari") return "#1F8A5F";
  if (coll === "Muslim") return "#3F6FB5";
  return fallback;
}

function HadithListCard({
  hadith, expanded, onToggleExpand, copied, bookmarked, onCopy, onBookmark, onShare, showArabic, colors,
}: {
  hadith: Hadith;
  expanded: boolean;
  onToggleExpand: () => void;
  copied: boolean;
  bookmarked: boolean;
  onCopy: () => void;
  onBookmark: () => void;
  onShare: () => void;
  showArabic: boolean;
  colors: any;
}) {
  const accent = collectionAccent(hadith.collection, colors.gold);

  return (
    <View style={styles.cardWrap}>
      {/* Hairline gold rules + 4 corner ticks (manual View borders) */}
      <View style={[styles.cardRuleTop, { backgroundColor: colors.gold + "55" }]} />
      <View style={[styles.cardRuleBottom, { backgroundColor: colors.gold + "55" }]} />
      <View style={[styles.tickTL, { borderColor: colors.gold }]} />
      <View style={[styles.tickTR, { borderColor: colors.gold }]} />
      <View style={[styles.tickBL, { borderColor: colors.gold }]} />
      <View style={[styles.tickBR, { borderColor: colors.gold }]} />

      <View style={styles.cardInner}>
        {/* Top row */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardTags}>
            <View style={[styles.inkStamp, { borderColor: accent + "66", backgroundColor: accent + "10" }]}>
              <Text style={[styles.inkStampText, { color: accent }]}>
                {collectionBadgeLabel(hadith.collection)}
              </Text>
            </View>
            <Text style={[styles.topicText, { color: colors.textSecondary }]}>
              {hadith.topic.toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardTopRight}>
            <BookmarkBtn
              bookmarked={bookmarked}
              onPress={onBookmark}
              gold={colors.gold}
              dim={colors.textSecondary}
            />
            <Pressable
              onPress={onToggleExpand}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={expanded ? "Collapse hadith" : "Expand hadith"}
            >
              <Feather
                name={expanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* Tappable text region — toggles expand */}
        <Pressable onPress={onToggleExpand}>
          {showArabic && hadith.arabic ? (
            <Text
              style={[styles.cardArabic, { color: colors.text }]}
              numberOfLines={expanded ? undefined : 1}
            >
              {hadith.arabic}
            </Text>
          ) : null}

          <Text
            style={[styles.cardTranslation, { color: colors.text }]}
            numberOfLines={expanded ? undefined : 2}
          >
            "{hadith.translation}"
          </Text>

          {!expanded && (
            <Text style={[styles.cardNarratorCollapsed, { color: colors.gold + "CC" }]}>
              {shortNarrator(hadith.narrator).toUpperCase()}
            </Text>
          )}
        </Pressable>

        {expanded && (
          <View style={styles.expandedBlock}>
            {/* Isnad strip — minimal honest chain */}
            <View style={[styles.isnadBox, { borderColor: colors.gold + "22", backgroundColor: colors.gold + "08" }]}>
              <Text style={[styles.isnadTitle, { color: colors.gold }]}>CHAIN OF NARRATION</Text>
              <View style={styles.isnadRow}>
                <Text style={[styles.isnadGlyph, { color: colors.gold }]}>ﷺ</Text>
                <View style={[styles.isnadDot, { backgroundColor: colors.gold }]} />
                <View style={[styles.isnadLine, { backgroundColor: colors.gold + "55" }]} />
                <View style={[styles.isnadDot, { backgroundColor: colors.gold }]} />
                <Text
                  style={[styles.isnadName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {shortNarrator(hadith.narrator)}
                </Text>
                <View style={[styles.isnadLine, { backgroundColor: colors.gold + "55" }]} />
                <View style={[styles.isnadDot, { backgroundColor: colors.gold }]} />
                <Text
                  style={[styles.isnadName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {hadith.collection === "Both" ? "Bukhari & Muslim" : `Sahih ${hadith.collection}`}
                </Text>
              </View>
            </View>

            {/* Source line */}
            <Text style={[styles.cardSource, { color: colors.textSecondary }]}>
              {hadith.source}
            </Text>

            {/* Transliteration if present */}
            {hadith.transliteration ? (
              <Text style={[styles.cardTranslit, { color: colors.textSecondary }]}>
                {hadith.transliteration}
              </Text>
            ) : null}

            {/* Action row */}
            <View style={[styles.cardActions, { borderTopColor: colors.gold + "22" }]}>
              <Text style={[styles.gradePill, { color: colors.gold, borderColor: colors.gold + "55" }]}>
                SAHIH
              </Text>
              <View style={{ flexDirection: "row", gap: 18 }}>
                <Pressable onPress={stop(onCopy)} hitSlop={8} accessibilityRole="button" accessibilityLabel={copied ? "Copied" : "Copy hadith"}>
                  <Feather
                    name={copied ? "check" : "copy"}
                    size={15}
                    color={copied ? colors.gold : colors.gold + "CC"}
                  />
                </Pressable>
                <Pressable onPress={stop(onShare)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Share hadith">
                  <Feather name="share" size={15} color={colors.gold + "CC"} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerArabic: { fontSize: 18, marginTop: 2, opacity: 0.95 },
  headerBadge: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  /* Search */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },

  /* Collection chips */
  collectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  collectionChips: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  collChip: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  collChipText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  /* Arabic toggle pill */
  arabicToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  arabicToggleGlyph: {
    fontSize: 16,
    lineHeight: 18,
  },
  arabicToggleLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
  },

  /* Topic rail */
  topicList: {},
  topicChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  topicChipText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  /* Hero */
  heroWrap: { paddingHorizontal: 16, paddingTop: 6 },
  mushafOuter: {
    borderWidth: 1.2,
    padding: 4,
    borderRadius: 2,
  },
  mushafInner: {
    borderWidth: 0.6,
    padding: 18,
    position: "relative",
    overflow: "hidden",
  },
  cornerTL: { position: "absolute", top: -2, left: -2 },
  cornerTR: { position: "absolute", top: -2, right: -2, transform: [{ scaleX: -1 }] },
  cornerBL: { position: "absolute", bottom: -2, left: -2, transform: [{ scaleY: -1 }] },
  cornerBR: { position: "absolute", bottom: -2, right: -2, transform: [{ scaleX: -1 }, { scaleY: -1 }] },
  heroPanel: {},
  heroMedallion: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 260,
    height: 260,
    marginLeft: -130,
    marginTop: -130,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  heroDate: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  heroDateRule: { flex: 1, height: 1 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  heroBadgeText: { fontSize: 8, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  heroArabic: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 22,
    lineHeight: 44,
    textAlign: "center",
    marginBottom: 14,
    writingDirection: "rtl",
  },
  heroTranslation: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  heroNarrator: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 4,
  },
  heroSource: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 4,
  },
  heroLoading: { paddingVertical: 28, alignItems: "center", gap: 10 },
  heroLoadingText: { fontSize: 13, fontFamily: "Inter_400Regular" },

  /* Section divider */
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 4,
  },
  dividerRule: { flex: 1, height: 1 },
  sectionLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2 },

  /* List card */
  cardWrap: {
    marginHorizontal: 16,
    marginBottom: 14,
    position: "relative",
  },
  cardInner: { paddingVertical: 14, paddingHorizontal: 14 },
  cardRuleTop: { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
  cardRuleBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: 1 },
  tickTL: { position: "absolute", top: 0, left: 0, width: 8, height: 8, borderLeftWidth: 1, borderTopWidth: 1 },
  tickTR: { position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRightWidth: 1, borderTopWidth: 1 },
  tickBL: { position: "absolute", bottom: 0, left: 0, width: 8, height: 8, borderLeftWidth: 1, borderBottomWidth: 1 },
  tickBR: { position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRightWidth: 1, borderBottomWidth: 1 },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  cardTags: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, flexWrap: "wrap" },
  inkStamp: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  inkStampText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  topicText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  cardTopRight: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 0 },

  cardArabic: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 18,
    lineHeight: 34,
    textAlign: "right",
    marginBottom: 10,
    writingDirection: "rtl",
  },
  cardTranslation: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 8,
  },
  cardNarratorCollapsed: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginTop: 2,
  },

  /* Expanded */
  expandedBlock: { marginTop: 6, gap: 10 },
  isnadBox: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 2,
  },
  isnadTitle: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  isnadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  isnadGlyph: { fontSize: 15, fontFamily: "AmiriQuran_400Regular", marginRight: 2 },
  isnadDot: { width: 5, height: 5, borderRadius: 3 },
  isnadLine: { width: 10, height: 1 },
  isnadName: { fontSize: 11, fontFamily: "Inter_500Medium", flexShrink: 1 },

  cardSource: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  cardTranslit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 19,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  gradePill: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },

  /* List + empty */
  listContent: { paddingTop: 0 },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
});
