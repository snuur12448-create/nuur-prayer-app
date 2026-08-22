import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import * as Clipboard from "expo-clipboard";
import {
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
import { ALL_DUA_CATEGORIES, DuaItem, searchDuas } from "@/utils/duaData";
import { useSavedItems } from "@/utils/useSavedItems";
import { useDailyAdhkar } from "@/utils/useDailyAdhkar";
import ContentShareSheet from "@/components/ContentShareSheet";
import { CornerFloret, NuurMark } from "@/components/share/ShareDecor";

/* ============================================================
   Helpers — shared visual language with the Hadith section
   ============================================================ */

function contrastOn(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length < 6) return "#fff";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#0A1612" : "#ffffff";
}

function stop(fn: () => void) {
  return (e: any) => {
    e?.stopPropagation?.();
    fn();
  };
}

/* Mushaf frame: double-line gold border + 4 corner florets — identical to Hadith */
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
      accessibilityLabel={bookmarked ? "Remove bookmark" : "Save dua"}
    >
      <MaterialCommunityIcons
        name={bookmarked ? "bookmark" : "bookmark-outline"}
        size={18}
        color={bookmarked ? gold : dim}
      />
    </Pressable>
  );
}

/* ============================================================
   Today's Adhkar — Featured hero (mushaf frame, hadith-style)
   ============================================================ */

function TodayHero({
  colors,
  morningPct,
  eveningPct,
  morningDone,
  morningTotal,
  eveningDone,
  eveningTotal,
  hijriDate,
  onJumpMorning,
  onJumpEvening,
}: {
  colors: any;
  morningPct: number;
  eveningPct: number;
  morningDone: number;
  morningTotal: number;
  eveningDone: number;
  eveningTotal: number;
  hijriDate: string;
  onJumpMorning: () => void;
  onJumpEvening: () => void;
}) {
  return (
    <View style={styles.heroWrap}>
      <MushafFrame color={colors.gold}>
        <View style={styles.heroPanel}>
          {/* Top frame */}
          <View style={styles.heroTopRow}>
            <Text style={[styles.heroDate, { color: colors.gold + "B3" }]}>{hijriDate}</Text>
            <View style={[styles.heroDateRule, { backgroundColor: colors.gold + "44" }]} />
            <View style={[styles.heroBadge, { backgroundColor: colors.gold + "1A", borderColor: colors.gold + "55" }]}>
              <NuurMark size={11} color={colors.gold} />
              <Text style={[styles.heroBadgeText, { color: colors.gold }]}>TODAY</Text>
            </View>
          </View>

          <Text style={[styles.heroEyebrow, { color: colors.gold + "CC" }]}>DAILY ADHKĀR</Text>
          <Text style={[styles.heroArabic, { color: colors.text }]} numberOfLines={1}>
            أذكار الصباح والمساء
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            The protection and remembrance of morning &amp; evening
          </Text>

          {/* Two pillars */}
          <View style={styles.heroPillarRow}>
            <Pressable onPress={onJumpMorning} style={styles.heroPillar} accessibilityRole="button" accessibilityLabel="Open Morning Adhkar">
              <View style={styles.heroPillarHead}>
                <Feather name="sunrise" size={14} color={colors.gold} />
                <Text style={[styles.heroPillarLabel, { color: colors.text }]}>MORNING</Text>
              </View>
              <View style={[styles.heroPillarBar, { backgroundColor: colors.gold + "22" }]}>
                <View style={{ width: `${Math.round(morningPct * 100)}%`, height: 3, backgroundColor: colors.gold }} />
              </View>
              <Text style={[styles.heroPillarMeta, { color: colors.textSecondary }]}>
                {morningDone}/{morningTotal} recited
              </Text>
            </Pressable>

            <View style={[styles.heroPillarDivider, { backgroundColor: colors.gold + "33" }]} />

            <Pressable onPress={onJumpEvening} style={styles.heroPillar} accessibilityRole="button" accessibilityLabel="Open Evening Adhkar">
              <View style={styles.heroPillarHead}>
                <Feather name="moon" size={14} color={colors.gold} />
                <Text style={[styles.heroPillarLabel, { color: colors.text }]}>EVENING</Text>
              </View>
              <View style={[styles.heroPillarBar, { backgroundColor: colors.gold + "22" }]}>
                <View style={{ width: `${Math.round(eveningPct * 100)}%`, height: 3, backgroundColor: colors.gold }} />
              </View>
              <Text style={[styles.heroPillarMeta, { color: colors.textSecondary }]}>
                {eveningDone}/{eveningTotal} recited
              </Text>
            </Pressable>
          </View>
        </View>
      </MushafFrame>
    </View>
  );
}

/* ============================================================
   Hijri date helper — shared with Hadith page
   ============================================================ */

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

/* ============================================================
   Dua list card — hadith-style: hairline rules + corner ticks
   ============================================================ */

interface DuaListCardProps {
  item: DuaItem & { categoryName?: string; categoryId?: string };
  accent: string;
  expanded: boolean;
  onToggleExpand: () => void;
  copied: boolean;
  bookmarked: boolean;
  doneToday: boolean;
  showCategory: boolean;
  onCopy: () => void;
  onShare: () => void;
  onBookmark: () => void;
  onToggleDone: () => void;
  colors: any;
}

const DuaListCard = React.memo(function DuaListCard({
  item, accent, expanded, onToggleExpand, copied, bookmarked, doneToday,
  showCategory, onCopy, onShare, onBookmark, onToggleDone, colors,
}: DuaListCardProps) {
  return (
    <View style={styles.cardWrap}>
      {/* Hairline gold rules + 4 corner ticks */}
      <View style={[styles.cardRuleTop, { backgroundColor: colors.gold + "55" }]} />
      <View style={[styles.cardRuleBottom, { backgroundColor: colors.gold + "55" }]} />
      <View style={[styles.tickTL, { borderColor: colors.gold }]} />
      <View style={[styles.tickTR, { borderColor: colors.gold }]} />
      <View style={[styles.tickBL, { borderColor: colors.gold }]} />
      <View style={[styles.tickBR, { borderColor: colors.gold }]} />

      <View style={styles.cardInner}>
        {/* Top row: ink stamp + category caps + bookmark/expand */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardTags}>
            <View style={[styles.inkStamp, { borderColor: accent + "66", backgroundColor: accent + "10" }]}>
              <Text style={[styles.inkStampText, { color: accent }]} numberOfLines={1}>
                {showCategory && item.categoryName ? item.categoryName.toUpperCase() : "DU'A"}
              </Text>
            </View>
            {(item as any).repeat && (
              <Text style={[styles.topicText, { color: colors.gold + "CC" }]}>
                {(item as any).repeat}
              </Text>
            )}
            {doneToday && (
              <View style={[styles.doneChip, { borderColor: accent + "66", backgroundColor: accent + "10" }]}>
                <Feather name="check" size={9} color={accent} />
                <Text style={[styles.doneChipText, { color: accent }]}>RECITED</Text>
              </View>
            )}
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
              accessibilityLabel={expanded ? "Collapse dua" : "Expand dua"}
            >
              <Feather
                name={expanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Tappable text region */}
        <Pressable onPress={onToggleExpand}>
          <Text
            style={[styles.cardArabic, { color: colors.text }]}
            numberOfLines={expanded ? undefined : 2}
          >
            {item.arabic}
          </Text>

          <Text
            style={[styles.cardTranslation, { color: colors.text }]}
            numberOfLines={expanded ? undefined : 2}
          >
            "{item.translation}"
          </Text>

          {!expanded && item.reference ? (
            <Text style={[styles.cardRefCollapsed, { color: colors.gold + "CC" }]} numberOfLines={1}>
              {item.reference.toUpperCase()}
            </Text>
          ) : null}
        </Pressable>

        {expanded && (
          <View style={styles.expandedBlock}>
            {/* Transliteration */}
            {item.transliteration ? (
              <Text style={[styles.cardTranslit, { color: accent }]}>
                {item.transliteration}
              </Text>
            ) : null}

            {/* Virtue strip — analogous to the hadith chain-of-narration box */}
            {(item as any).virtue && (
              <View style={[styles.virtueBox, { borderColor: colors.gold + "22", backgroundColor: colors.gold + "08" }]}>
                <Text style={[styles.virtueTitle, { color: colors.gold }]}>VIRTUE</Text>
                <View style={styles.virtueRow}>
                  <Feather name="star" size={11} color={colors.gold} />
                  <Text style={[styles.virtueText, { color: colors.text }]}>
                    {(item as any).virtue}
                  </Text>
                </View>
              </View>
            )}

            {/* Source line */}
            {item.reference ? (
              <Text style={[styles.cardSource, { color: colors.textSecondary }]}>
                {item.reference}
              </Text>
            ) : null}

            {/* Action row — recited pill (left) + copy/share (right) */}
            <View style={[styles.cardActions, { borderTopColor: colors.gold + "22" }]}>
              {(() => {
                const onAccent = contrastOn(accent);
                return (
                  <Pressable
                    onPress={stop(onToggleDone)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={doneToday ? "Unmark recited" : "Mark as recited"}
                    style={[
                      styles.recitedPill,
                      {
                        backgroundColor: doneToday ? accent : "transparent",
                        borderColor: doneToday ? accent : accent + "66",
                      },
                    ]}
                  >
                    <Feather
                      name={doneToday ? "check-circle" : "circle"}
                      size={11}
                      color={doneToday ? onAccent : accent}
                    />
                    <Text style={[styles.recitedPillText, { color: doneToday ? onAccent : accent }]}>
                      {doneToday ? "RECITED" : "MARK RECITED"}
                    </Text>
                  </Pressable>
                );
              })()}
              <View style={{ flexDirection: "row", gap: 18 }}>
                <Pressable onPress={stop(onCopy)} hitSlop={8} accessibilityRole="button" accessibilityLabel={copied ? "Copied" : "Copy dua"}>
                  <Feather
                    name={copied ? "check" : "copy"}
                    size={15}
                    color={copied ? colors.gold : colors.gold + "CC"}
                  />
                </Pressable>
                <Pressable onPress={stop(onShare)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Share dua">
                  <Feather name="share" size={15} color={colors.gold + "CC"} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
});

/* ============================================================
   Screen
   ============================================================ */

export default function DuaScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareDua, setShareDua] = useState<(DuaItem & { categoryName?: string }) | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // useTransition lets the heavy corpus filter run as a non-urgent update so
  // the TextInput stays responsive while results catch up.
  const [, startSearchTransition] = useTransition();
  const { savedIds: savedDuaIds, toggle: toggleDua } = useSavedItems("nuur_saved_duas");
  const { doneIds, toggle: toggleDone } = useDailyAdhkar();

  const hijriToday = useMemo(() => approximateHijriToday(), []);

  // Deep link from the home-screen widget: nuur://dua?window=morning|evening
  // jumps straight to the relevant adhkar list that the widget was showing.
  const { window: windowParam } = useLocalSearchParams<{ window?: string }>();
  useEffect(() => {
    if (windowParam === "morning" || windowParam === "evening") {
      setSelectedCategoryId(windowParam);
      // Clear any leftover search so the chosen list is actually visible.
      setSearchQuery("");
      setDebouncedQuery("");
    }
  }, [windowParam]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startSearchTransition(() => setDebouncedQuery(searchQuery));
    }, 120);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const selectedCategory = useMemo(
    () => ALL_DUA_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? ALL_DUA_CATEGORIES[0],
    [selectedCategoryId]
  );

  const allDuasFlat = useMemo(
    () => ALL_DUA_CATEGORIES.flatMap((c) => c.duas.map((d) => ({ ...d, categoryId: c.id, categoryName: c.name }))),
    []
  );

  const trimmed = debouncedQuery.trim();
  const isSearching = trimmed.length > 0;
  const searchResults = useMemo(() => (isSearching ? searchDuas(trimmed) : []), [trimmed, isSearching]);

  // Daily progress
  const morningCat = ALL_DUA_CATEGORIES.find((c) => c.id === "morning")!;
  const eveningCat = ALL_DUA_CATEGORIES.find((c) => c.id === "evening")!;
  const morningDone = useMemo(
    () => morningCat.duas.filter((d) => doneIds.has(d.id)).length,
    [doneIds, morningCat]
  );
  const eveningDone = useMemo(
    () => eveningCat.duas.filter((d) => doneIds.has(d.id)).length,
    [doneIds, eveningCat]
  );
  const morningPct = morningCat.duas.length === 0 ? 0 : morningDone / morningCat.duas.length;
  const eveningPct = eveningCat.duas.length === 0 ? 0 : eveningDone / eveningCat.duas.length;

  const copyDua = useCallback((item: DuaItem) => {
    const text = `${item.arabic}\n\n${item.transliteration}\n\n"${item.translation}"${item.reference ? `\n— ${item.reference}` : ""}`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setStringAsync(text).catch(() => {});
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 2000);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: DuaItem & { categoryName?: string; categoryId?: string } }) => {
      const catId = (item as any).categoryId ?? selectedCategoryId;
      const cat = ALL_DUA_CATEGORIES.find((c) => c.id === catId);
      const accent = cat?.accentColor ?? colors.gold;
      return (
        <DuaListCard
          item={item}
          accent={accent}
          expanded={expandedId === item.id}
          onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
          copied={copiedId === item.id}
          bookmarked={savedDuaIds.has(item.id)}
          doneToday={doneIds.has(item.id)}
          showCategory={isSearching || selectedCategoryId === "saved" || selectedCategoryId === "all"}
          onCopy={() => copyDua(item)}
          onShare={() => setShareDua(item)}
          onBookmark={() => toggleDua(item.id)}
          onToggleDone={() => toggleDone(item.id)}
          colors={colors}
        />
      );
    },
    [colors, selectedCategoryId, expandedId, copiedId, savedDuaIds, doneIds, isSearching, copyDua, toggleDua, toggleDone]
  );

  const keyExtractor = useCallback((item: DuaItem) => item.id, []);

  const listData = useMemo(() => {
    if (isSearching) return searchResults;
    if (selectedCategoryId === "saved") return allDuasFlat.filter((d) => savedDuaIds.has(d.id));
    if (selectedCategoryId === "all") return allDuasFlat;
    return selectedCategory.duas as (DuaItem & { categoryName?: string })[];
  }, [isSearching, searchResults, selectedCategoryId, allDuasFlat, savedDuaIds, selectedCategory]);

  const totalDuas = useMemo(
    () => ALL_DUA_CATEGORIES.reduce((sum, c) => sum + c.duas.length, 0),
    []
  );

  // Compose the unified topic rail: All + Saved + each category
  const topicChips = useMemo(
    () => [
      { id: "all", label: "All", icon: "list" as const },
      { id: "saved", label: "Saved", icon: "bookmark" as const },
      ...ALL_DUA_CATEGORIES.map((c) => ({ id: c.id, label: c.name, icon: c.icon as any })),
    ],
    []
  );

  const sectionLabel = isSearching
    ? `${searchResults.length} RESULT${searchResults.length === 1 ? "" : "S"}`
    : selectedCategoryId === "saved"
    ? `SAVED · ${savedDuaIds.size} DUA${savedDuaIds.size === 1 ? "" : "S"}`
    : selectedCategoryId === "all"
    ? `AUTHENTIC · ${totalDuas} DUAS`
    : `${selectedCategory.name.toUpperCase()} · ${selectedCategory.duas.length} DUAS`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.gold + "22" }]}>
        <View style={styles.headerTop}>
          {/* No back button — Adhkar is a top-level tab. */}
          <View style={styles.headerTitles}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Du'a &amp; Adhkār</Text>
            <Text style={[styles.headerArabic, { color: colors.gold, fontFamily: "AmiriQuran_400Regular" }]}>
              الأدعية والأذكار
            </Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: colors.gold + "10", borderColor: colors.gold + "55" }]}>
            <Text style={[styles.headerBadgeText, { color: colors.gold }]}>AUTHENTIC</Text>
          </View>
        </View>

        {/* Search — underline style */}
        <View style={[styles.searchBox, { borderBottomColor: colors.gold + "44" }]}>
          <Feather name="search" size={14} color={colors.gold + "AA"} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search duas… e.g. sleep, travel, anxiety"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => { setSearchQuery(""); startSearchTransition(() => setDebouncedQuery("")); }} hitSlop={8}>
              <Feather name="x" size={14} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={listData as any[]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 + miniPlayerH }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <>
            {/* Topic medallions — gold-bordered rounded chips */}
            {!isSearching && (
              <FlatList
                data={topicChips}
                keyExtractor={(t) => t.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.topicList}
                contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 14 }}
                renderItem={({ item }) => {
                  const isActive = selectedCategoryId === item.id;
                  return (
                    <Pressable
                      onPress={() => setSelectedCategoryId(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: isActive }}
                      style={[
                        styles.topicChip,
                        {
                          backgroundColor: isActive ? colors.gold : "transparent",
                          borderColor: isActive ? colors.gold : colors.gold + "44",
                        },
                      ]}
                    >
                      <Feather
                        name={item.icon}
                        size={11}
                        color={isActive ? colors.background : colors.gold}
                      />
                      <Text
                        style={[
                          styles.topicChipText,
                          { color: isActive ? colors.background : colors.textSecondary },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            )}

            {/* Featured hero — visible on top-level views; hidden during search and Saved */}
            {!isSearching && selectedCategoryId !== "saved" && (
              <TodayHero
                colors={colors}
                morningPct={morningPct}
                eveningPct={eveningPct}
                morningDone={morningDone}
                morningTotal={morningCat.duas.length}
                eveningDone={eveningDone}
                eveningTotal={eveningCat.duas.length}
                hijriDate={hijriToday}
                onJumpMorning={() => setSelectedCategoryId("morning")}
                onJumpEvening={() => setSelectedCategoryId("evening")}
              />
            )}

            {/* Section divider */}
            <View style={styles.sectionDivider}>
              <View style={[styles.dividerRule, { backgroundColor: colors.gold + "55" }]} />
              <Text style={[styles.sectionLabelText, { color: colors.gold }]}>{sectionLabel}</Text>
              <View style={[styles.dividerRule, { backgroundColor: colors.gold + "55" }]} />
            </View>
          </>
        }
        ListFooterComponent={
          (listData as any[]).length > 0 && !isSearching ? (
            <View style={styles.endOrnament}>
              <View style={[styles.endLine, { backgroundColor: colors.gold + "44" }]} />
              <Text style={[styles.endGlyph, { color: colors.gold }]}>﷽</Text>
              <View style={[styles.endLine, { backgroundColor: colors.gold + "44" }]} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isSearching ? (
            <View style={styles.emptyBox}>
              <Feather name="search" size={40} color={colors.gold + "55"} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No duas match. Try "breaking fast", "anxiety", "sleep", or "travel".
              </Text>
            </View>
          ) : selectedCategoryId === "saved" ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="bookmark-outline" size={44} color={colors.gold + "55"} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No saved duas yet. Tap the bookmark icon on any dua to save it here for quick access.
              </Text>
            </View>
          ) : null
        }
      />

      {shareDua &&
        (() => {
          const catId = (shareDua as any).categoryId ?? selectedCategoryId;
          const cat = ALL_DUA_CATEGORIES.find((c) => c.id === catId);
          const catName = shareDua.categoryName ?? cat?.name ?? "Dua";
          // Eyebrow shows the title alone (e.g. "DUA FOR BREAKING FAST") —
          // the actual meaning of the entry, not its bucket. Fall back to the
          // category name only when the title is missing or duplicates the
          // category (e.g. adhkar entries titled the same as their category).
          const norm = (s: string) =>
            s
              .toUpperCase()
              .replace(/[^\p{L}\p{N}]+/gu, " ")
              .trim();
          const catUpper = catName.toUpperCase().trim();
          const titleUpper = (shareDua.title ?? "").toUpperCase().trim();
          const label =
            !titleUpper || norm(titleUpper) === norm(catUpper)
              ? catUpper
              : titleUpper;
          return (
            <ContentShareSheet
              visible={true}
              onClose={() => setShareDua(null)}
              theme="dua"
              sheetTitle="Share Du'a"
              shareTitle={shareDua.title}
              label={label}
              arabicText={shareDua.arabic}
              bodyItalic={shareDua.transliteration}
              bodyText={shareDua.translation}
              source={shareDua.reference}
            />
          );
        })()}
    </View>
  );
}

/* ============================================================
   Styles — mirror Hadith section
   ============================================================ */

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
  heroEyebrow: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2, textAlign: "center", marginBottom: 6 },
  heroArabic: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 22,
    lineHeight: 44,
    textAlign: "center",
    marginBottom: 6,
    writingDirection: "rtl",
  },
  heroSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  heroPillarRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
  heroPillar: { flex: 1, gap: 6 },
  heroPillarHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroPillarLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  heroPillarBar: { height: 3, borderRadius: 2, overflow: "hidden", marginTop: 2 },
  heroPillarMeta: { fontSize: 10, fontFamily: "Inter_400Regular" },
  heroPillarDivider: { width: 1, alignSelf: "stretch" },

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
  sectionLabelText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2 },

  /* List card */
  listContent: { paddingTop: 0 },
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
    marginBottom: 8,
  },
  cardTags: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, flexWrap: "wrap" },
  inkStamp: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    maxWidth: 200,
  },
  inkStampText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  topicText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  doneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
  },
  doneChipText: { fontSize: 8, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  cardTopRight: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 0 },

  cardTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginBottom: 8 },

  cardArabic: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 24,
    lineHeight: 44,
    textAlign: "right",
    marginBottom: 12,
    writingDirection: "rtl",
  },
  cardTranslation: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 8,
  },
  cardRefCollapsed: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginTop: 2,
  },

  /* Expanded */
  expandedBlock: { marginTop: 6, gap: 10 },
  cardTranslit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 19,
  },
  virtueBox: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 2,
  },
  virtueTitle: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  virtueRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  virtueText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, flex: 1 },
  cardSource: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  recitedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  recitedPillText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  /* Empty */
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 8, paddingHorizontal: 32 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },

  /* End-of-section ornament */
  endOrnament: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  endLine: { flex: 1, maxWidth: 70, height: 1 },
  endGlyph: { fontSize: 22, fontFamily: "Inter_400Regular", textAlign: "center" },
});
