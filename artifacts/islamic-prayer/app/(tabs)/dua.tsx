import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  Animated,
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
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import { ALL_DUA_CATEGORIES, DuaItem, searchDuas } from "@/utils/duaData";
import { useSavedItems } from "@/utils/useSavedItems";
import { useDailyAdhkar } from "@/utils/useDailyAdhkar";
import ContentShareSheet from "@/components/ContentShareSheet";

/* ============================================================
   Helpers
   ============================================================ */

/**
 * Pick a foreground color (white vs near-black) that has reasonable contrast
 * against the given hex background. Several category accents are very light
 * pastels (#F6C55A, #A5D6A7…) on which white text/icons are unreadable.
 */
function contrastOn(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length < 6) return "#fff";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#0A1612" : "#ffffff";
}

/* ============================================================
   Small visual primitives
   ============================================================ */

function ProgressRing({
  pct,
  color,
  trackColor,
  size = 26,
  strokeWidth = 2.5,
}: {
  pct: number;
  color: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const r = size / 2 - strokeWidth / 2 - 0.5;
  const c = 2 * Math.PI * r;
  const safePct = Math.max(0, Math.min(1, pct));
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor ?? color + "33"} strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={c * (1 - safePct)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

/** Illuminated calligraphic medallion — a numbered circle that gives each card a "page" feel. */
function Medallion({
  n,
  color,
  bg,
}: {
  n: number;
  color: string;
  bg: string;
}) {
  return (
    <View
      style={[
        styles.medallion,
        {
          borderColor: color + "66",
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.medallionInner, { color }]}>{n}</Text>
    </View>
  );
}

function BookmarkBtn({
  bookmarked,
  onPress,
  activeColor,
  grey,
}: {
  bookmarked: boolean;
  onPress: () => void;
  activeColor: string;
  grey: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.45, duration: 90, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 120, useNativeDriver: false }),
    ]).start();
    onPress();
  };
  return (
    <TouchableOpacity onPress={handlePress} hitSlop={12} accessibilityRole="button" accessibilityLabel={bookmarked ? "Remove bookmark" : "Save dua"}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <MaterialCommunityIcons
          name={bookmarked ? "bookmark" : "bookmark-outline"}
          size={19}
          color={bookmarked ? activeColor : grey}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

/* ============================================================
   Dua Card
   ============================================================ */

interface DuaCardProps {
  item: DuaItem & { categoryName?: string };
  index: number;
  colors: any;
  accentColor: string;
  showCategory?: boolean;
  bookmarked: boolean;
  doneToday: boolean;
  onCopyDua: (item: DuaItem) => void;
  onShareDua: (item: DuaItem) => void;
  onBookmarkDua: (item: DuaItem) => void;
  onToggleDone: (item: DuaItem) => void;
  collapseKey: string;
}

const DuaCard = React.memo(function DuaCard({
  item,
  index,
  colors,
  accentColor,
  showCategory,
  bookmarked,
  doneToday,
  onCopyDua,
  onShareDua,
  onBookmarkDua,
  onToggleDone,
  collapseKey,
}: DuaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const prevKey = useRef(collapseKey);
  if (prevKey.current !== collapseKey) {
    prevKey.current = collapseKey;
    if (expanded) setExpanded(false);
  }

  const handleToggle = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  const handleCopy = useCallback(() => {
    onCopyDua(item);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [item, onCopyDua]);

  const handleShare = useCallback(() => {
    onShareDua(item);
  }, [item, onShareDua]);

  const accentSoft = accentColor + "12";
  const accentBorder = accentColor + (expanded ? "66" : "33");

  return (
    <Pressable
      style={[
        styles.duaCard,
        {
          backgroundColor: colors.surface,
          borderColor: expanded ? accentBorder : colors.border,
          shadowColor: expanded ? accentColor : "#000",
        },
      ]}
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${expanded ? "collapse" : "expand"}`}
    >
      {/* Pearl seam */}
      <View style={[styles.pearlSeam, { backgroundColor: accentColor }]} />

      <View style={styles.duaInner}>
        <View style={styles.duaHeader}>
          {/* Illuminated medallion */}
          <Medallion n={index + 1} color={accentColor} bg={accentSoft} />

          <View style={styles.duaTitleWrap}>
            {showCategory && item.categoryName && (
              <Text style={[styles.duaCategoryLabel, { color: accentColor }]}>
                {item.categoryName}
              </Text>
            )}
            <Text style={[styles.duaTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <View style={styles.duaHeaderRight}>
            {(item as any).repeat && (
              <View style={[styles.repeatBadge, { backgroundColor: accentColor + "22", borderColor: accentColor + "55" }]}>
                <Text style={[styles.repeatText, { color: accentColor }]}>{(item as any).repeat}</Text>
              </View>
            )}
            <BookmarkBtn
              bookmarked={bookmarked}
              onPress={() => onBookmarkDua(item)}
              activeColor={colors.gold}
              grey={colors.textSecondary}
            />
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
          </View>
        </View>

        <Text style={[styles.arabicText, { color: colors.text }]}>{item.arabic}</Text>

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.transliterationText, { color: accentColor }]}>
              {item.transliteration}
            </Text>

            <Text style={[styles.translationText, { color: colors.textSecondary }]}>
              {item.translation}
            </Text>

            {(item as any).virtue && (
              <View style={[styles.virtueBox, { backgroundColor: accentColor + "12", borderColor: accentColor + "33" }]}>
                <Feather name="star" size={11} color={accentColor} />
                <Text style={[styles.virtueText, { color: accentColor }]}>
                  {(item as any).virtue}
                </Text>
              </View>
            )}

            <View style={styles.expandedFooter}>
              {item.reference && (
                <View style={[styles.referenceBadge, { backgroundColor: colors.surfaceElevated }]}>
                  <Feather name="book-open" size={11} color={colors.textSecondary} />
                  <Text style={[styles.referenceText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.reference}
                  </Text>
                </View>
              )}
              <View style={styles.footerActions}>
                <TouchableOpacity
                  onPress={handleCopy}
                  style={[styles.actionBtn, { backgroundColor: copied ? colors.gold + "20" : colors.surfaceElevated }]}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Copy dua"
                >
                  <Feather name={copied ? "check" : "copy"} size={13} color={copied ? colors.gold : colors.textSecondary} />
                  <Text style={[styles.actionBtnText, { color: copied ? colors.gold : colors.textSecondary }]}>
                    {copied ? "Copied!" : "Copy"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Share dua"
                >
                  <Feather name="share" size={13} color={colors.textSecondary} />
                  <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mark as recited today */}
            {(() => {
              const onAccent = contrastOn(accentColor);
              return (
                <TouchableOpacity
                  onPress={() => onToggleDone(item)}
                  style={[
                    styles.doneBtn,
                    {
                      backgroundColor: doneToday ? accentColor : "transparent",
                      borderColor: doneToday ? accentColor : accentColor + "66",
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={doneToday ? "Mark as not recited today" : "Mark as recited today"}
                >
                  <Feather
                    name={doneToday ? "check-circle" : "circle"}
                    size={14}
                    color={doneToday ? onAccent : accentColor}
                  />
                  <Text style={[styles.doneBtnText, { color: doneToday ? onAccent : accentColor }]}>
                    {doneToday ? "Recited today" : "Mark as recited"}
                  </Text>
                </TouchableOpacity>
              );
            })()}
          </View>
        )}

        {/* Compact "done today" indicator on collapsed card */}
        {!expanded && doneToday && (
          <View style={[styles.doneBadgeRow]}>
            <Feather name="check-circle" size={11} color={accentColor} />
            <Text style={[styles.doneBadgeText, { color: accentColor }]}>Recited today</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

/* ============================================================
   Today's Adhkar progress hero
   ============================================================ */

function ProgressHero({
  colors,
  morningPct,
  eveningPct,
  totalDone,
  totalTracked,
  accentColor,
  onJumpMorning,
  onJumpEvening,
}: {
  colors: any;
  morningPct: number;
  eveningPct: number;
  totalDone: number;
  totalTracked: number;
  accentColor: string;
  onJumpMorning: () => void;
  onJumpEvening: () => void;
}) {
  const morningCat = ALL_DUA_CATEGORIES.find((c) => c.id === "morning")!;
  const eveningCat = ALL_DUA_CATEGORIES.find((c) => c.id === "evening")!;

  return (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: colors.surface,
          borderColor: accentColor + "55",
          shadowColor: accentColor,
        },
      ]}
    >
      <View style={styles.heroTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroEyebrow, { color: accentColor }]}>TODAY'S ADHKĀR</Text>
          <View style={styles.heroCountRow}>
            <Text style={[styles.heroCount, { color: colors.text }]}>{totalDone}</Text>
            <Text style={[styles.heroCountTotal, { color: colors.textSecondary }]}> / {totalTracked} recited</Text>
          </View>
        </View>
        <ProgressRing pct={totalTracked === 0 ? 0 : totalDone / totalTracked} color={accentColor} size={50} strokeWidth={3.5} />
      </View>

      <View style={styles.heroPillarRow}>
        <Pressable
          onPress={onJumpMorning}
          style={[
            styles.heroPillar,
            { backgroundColor: morningCat.accentColor + "14", borderColor: morningCat.accentColor + "44" },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open Morning Adhkar"
        >
          <View style={[styles.heroPillarIcon, { backgroundColor: morningCat.accentColor + "22" }]}>
            <Feather name="sunrise" size={15} color={morningCat.accentColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroPillarLabel, { color: colors.textSecondary }]}>Morning</Text>
            <View style={[styles.heroPillarBar, { backgroundColor: morningCat.accentColor + "22" }]}>
              <View
                style={{
                  width: `${Math.round(morningPct * 100)}%`,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: morningCat.accentColor,
                }}
              />
            </View>
            <Text style={[styles.heroPillarMeta, { color: morningCat.accentColor }]}>
              {Math.round(morningPct * 100)}% done
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onJumpEvening}
          style={[
            styles.heroPillar,
            { backgroundColor: eveningCat.accentColor + "14", borderColor: eveningCat.accentColor + "44" },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open Evening Adhkar"
        >
          <View style={[styles.heroPillarIcon, { backgroundColor: eveningCat.accentColor + "22" }]}>
            <Feather name="moon" size={15} color={eveningCat.accentColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroPillarLabel, { color: colors.textSecondary }]}>Evening</Text>
            <View style={[styles.heroPillarBar, { backgroundColor: eveningCat.accentColor + "22" }]}>
              <View
                style={{
                  width: `${Math.round(eveningPct * 100)}%`,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: eveningCat.accentColor,
                }}
              />
            </View>
            <Text style={[styles.heroPillarMeta, { color: eveningCat.accentColor }]}>
              {Math.round(eveningPct * 100)}% done
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

/* ============================================================
   Screen
   ============================================================ */

export default function DuaScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [shareDua, setShareDua] = useState<(DuaItem & { categoryName?: string }) | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { savedIds: savedDuaIds, toggle: toggleDua } = useSavedItems("nuur_saved_duas");
  const { doneIds, toggle: toggleDone } = useDailyAdhkar();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 250);
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

  const collapseKey = `${selectedCategoryId}:${trimmed}:${savedDuaIds.size}`;

  // Track per-category accent for the active context (search → tint, saved → gold, single cat → its accent, all → tint)
  const activeAccent = useMemo(() => {
    if (isSearching) return colors.tint;
    if (selectedCategoryId === "saved") return colors.gold;
    if (selectedCategoryId === "all") return colors.tint;
    return selectedCategory.accentColor;
  }, [isSearching, selectedCategoryId, selectedCategory, colors]);

  // Daily progress — Morning + Evening categories are the canonical "tracked" adhkar.
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
  const totalTracked = morningCat.duas.length + eveningCat.duas.length;
  const totalDone = morningDone + eveningDone;
  const morningPct = morningCat.duas.length === 0 ? 0 : morningDone / morningCat.duas.length;
  const eveningPct = eveningCat.duas.length === 0 ? 0 : eveningDone / eveningCat.duas.length;

  const copyDua = useCallback((item: DuaItem) => {
    const text = `${item.arabic}\n\n${item.transliteration}\n\n"${item.translation}"${item.reference ? `\n— ${item.reference}` : ""}`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setStringAsync(text).catch(() => {});
    }
  }, []);

  const shareDuaItem = useCallback((item: DuaItem & { categoryName?: string }) => {
    setShareDua(item);
  }, []);

  const bookmarkDua = useCallback((item: DuaItem) => {
    toggleDua(item.id);
  }, [toggleDua]);

  const handleToggleDone = useCallback((item: DuaItem) => {
    toggleDone(item.id);
  }, [toggleDone]);

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const renderDua = useCallback(
    ({ item, index }: { item: DuaItem & { categoryName?: string; categoryId?: string }; index: number }) => {
      const catId = (item as any).categoryId ?? selectedCategoryId;
      const cat = ALL_DUA_CATEGORIES.find((c) => c.id === catId);
      const accent = cat?.accentColor ?? colors.tint;
      return (
        <DuaCard
          item={item}
          index={index}
          colors={colors}
          accentColor={accent}
          showCategory={isSearching || selectedCategoryId === "saved" || selectedCategoryId === "all"}
          bookmarked={savedDuaIds.has(item.id)}
          doneToday={doneIds.has(item.id)}
          onCopyDua={copyDua}
          onShareDua={shareDuaItem}
          onBookmarkDua={bookmarkDua}
          onToggleDone={handleToggleDone}
          collapseKey={collapseKey}
        />
      );
    },
    [
      colors,
      selectedCategoryId,
      isSearching,
      copyDua,
      shareDuaItem,
      bookmarkDua,
      handleToggleDone,
      collapseKey,
      savedDuaIds,
      doneIds,
    ]
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.navigate("/(tabs)/more")} style={styles.backBtn} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <Feather name="chevron-left" size={24} color={colors.tint} />
        </Pressable>
        <View style={styles.headerTextRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerEyebrow, { color: activeAccent }]}>DU'A · ADHKĀR</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>الأدعية والأذكار</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {totalDuas} authentic supplications
            </Text>
          </View>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: searchQuery.length > 0 ? activeAccent : colors.border,
            },
          ]}
        >
          <Feather name="search" size={16} color={searchQuery.length > 0 ? activeAccent : colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search duas… e.g. breaking fast, sleep, travel"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setDebouncedQuery("");
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Feather name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category tabs — hidden during search */}
      {!isSearching && (
        <View style={[styles.categoryRow, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {/* All */}
            {(() => {
              const isSelected = selectedCategoryId === "all";
              return (
                <TouchableOpacity
                  key="all"
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: isSelected ? colors.tint : "transparent",
                      borderColor: isSelected ? colors.tint : colors.border,
                      shadowColor: isSelected ? colors.tint : "transparent",
                    },
                  ]}
                  onPress={() => setSelectedCategoryId("all")}
                  accessibilityRole="button"
                  accessibilityLabel="All duas"
                >
                  <Feather name="list" size={13} color={isSelected ? "#fff" : colors.textSecondary} />
                  <Text style={[styles.categoryTabText, { color: isSelected ? "#fff" : colors.textSecondary }]}>All</Text>
                </TouchableOpacity>
              );
            })()}

            {/* Saved */}
            {(() => {
              const isSelected = selectedCategoryId === "saved";
              return (
                <TouchableOpacity
                  key="saved"
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: isSelected ? colors.gold : "transparent",
                      borderColor: isSelected ? colors.gold : colors.gold + "66",
                      shadowColor: isSelected ? colors.gold : "transparent",
                    },
                  ]}
                  onPress={() => setSelectedCategoryId("saved")}
                  accessibilityRole="button"
                  accessibilityLabel="Saved duas"
                >
                  <MaterialCommunityIcons name="bookmark" size={13} color={isSelected ? "#fff" : colors.gold} />
                  <Text style={[styles.categoryTabText, { color: isSelected ? "#fff" : colors.gold }]}>Saved</Text>
                </TouchableOpacity>
              );
            })()}

            {ALL_DUA_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const onAccent = contrastOn(cat.accentColor);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: isSelected ? cat.accentColor : "transparent",
                      borderColor: isSelected ? cat.accentColor : colors.border,
                      shadowColor: isSelected ? cat.accentColor : "transparent",
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  accessibilityRole="button"
                  accessibilityLabel={cat.name}
                >
                  <Feather name={cat.icon as any} size={13} color={isSelected ? onAccent : colors.textSecondary} />
                  <Text style={[styles.categoryTabText, { color: isSelected ? onAccent : colors.textSecondary }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main list */}
      <FlatList
        data={listData as any[]}
        keyExtractor={keyExtractor}
        renderItem={renderDua}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: isWeb ? 34 + 84 : 100 + insets.bottom + miniPlayerH },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View>
            {/* Today's Adhkar progress hero — only on top-level views, not search/saved */}
            {!isSearching && selectedCategoryId !== "saved" && (
              <ProgressHero
                colors={colors}
                morningPct={morningPct}
                eveningPct={eveningPct}
                totalDone={totalDone}
                totalTracked={totalTracked}
                accentColor={activeAccent}
                onJumpMorning={() => setSelectedCategoryId("morning")}
                onJumpEvening={() => setSelectedCategoryId("evening")}
              />
            )}

            {/* Section divider */}
            {isSearching ? (
              <View style={styles.searchHeader}>
                <Text style={[styles.searchResultCount, { color: colors.textSecondary }]}>
                  {searchResults.length === 0
                    ? "No duas found"
                    : `${searchResults.length} dua${searchResults.length === 1 ? "" : "s"} found`}
                </Text>
              </View>
            ) : (
              <View style={styles.sectionDivider}>
                <View style={[styles.sectionDividerLine, { backgroundColor: colors.border }]} />
                <View
                  style={[
                    styles.sectionLabel,
                    { backgroundColor: activeAccent + "22", borderColor: activeAccent + "55" },
                  ]}
                >
                  <Feather
                    name={
                      selectedCategoryId === "saved"
                        ? "bookmark"
                        : selectedCategoryId === "all"
                        ? "list"
                        : (selectedCategory.icon as any)
                    }
                    size={11}
                    color={activeAccent}
                  />
                  <Text style={[styles.sectionLabelText, { color: activeAccent }]}>
                    {selectedCategoryId === "saved"
                      ? `Saved Duas · ${savedDuaIds.size}`
                      : selectedCategoryId === "all"
                      ? `All Duas & Adhkar · ${totalDuas}`
                      : `${selectedCategory.name} · ${selectedCategory.duas.length} duas`}
                  </Text>
                </View>
                <View style={[styles.sectionDividerLine, { backgroundColor: colors.border }]} />
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          (listData as any[]).length > 0 && !isSearching ? (
            <View style={styles.endOrnament}>
              <View style={[styles.endLine, { backgroundColor: activeAccent + "44" }]} />
              <Text style={[styles.endGlyph, { color: activeAccent }]}>﷽</Text>
              <View style={[styles.endLine, { backgroundColor: activeAccent + "44" }]} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isSearching ? (
            <View style={styles.emptyWrap}>
              <Feather name="search" size={40} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No matches found</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Try searching in English — e.g. "breaking fast", "anxiety", "sleep", "travel"
              </Text>
            </View>
          ) : selectedCategoryId === "saved" ? (
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="bookmark-outline" size={40} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved duas yet</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Tap the bookmark icon on any dua to save it here for quick access.
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
          return (
            <ContentShareSheet
              visible={true}
              onClose={() => setShareDua(null)}
              theme="dua"
              sheetTitle="Share Du'a"
              shareTitle={shareDua.title}
              label={`${catName.toUpperCase()}  ·  ${shareDua.title.toUpperCase()}`}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { alignSelf: "flex-start", marginBottom: 4 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTextRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerEyebrow: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2.4, marginBottom: 4 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  headerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },

  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 20,
  },

  categoryRow: { borderBottomWidth: 1 },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
  },
  categoryTabText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  listContent: { padding: 16 },

  /* Hero */
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  heroEyebrow: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2.4 },
  heroCountRow: { flexDirection: "row", alignItems: "baseline", marginTop: 4 },
  heroCount: { fontSize: 26, fontFamily: "Inter_700Bold" },
  heroCountTotal: { fontSize: 13, fontFamily: "Inter_400Regular" },
  heroPillarRow: { flexDirection: "row", gap: 10 },
  heroPillar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  heroPillarIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPillarLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  heroPillarBar: { height: 3, borderRadius: 2, marginTop: 6, overflow: "hidden" },
  heroPillarMeta: { fontSize: 10, fontFamily: "Inter_600SemiBold", marginTop: 4 },

  searchHeader: { marginBottom: 8 },
  searchResultCount: { fontSize: 13, fontFamily: "Inter_400Regular" },

  emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },

  /* Section divider */
  sectionDivider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  sectionDividerLine: { flex: 1, height: 1 },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  sectionLabelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  /* Dua card */
  duaCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pearlSeam: { width: 3 },
  duaInner: { flex: 1, padding: 14 },
  duaHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  duaTitleWrap: { flex: 1, gap: 3 },
  duaCategoryLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  duaTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  duaHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  repeatBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  repeatText: { fontSize: 10, fontFamily: "Inter_700Bold" },

  /* Illuminated medallion */
  medallion: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  medallionInner: { fontSize: 13, fontFamily: "Inter_700Bold" },

  arabicText: { fontSize: 20, textAlign: "right", lineHeight: 34, letterSpacing: 0.5, writingDirection: "rtl" },
  expandedContent: { gap: 12, marginTop: 4 },
  divider: { height: 1, marginVertical: 2 },
  transliterationText: { fontSize: 14, fontFamily: "Inter_500Medium", fontStyle: "italic", lineHeight: 22 },
  translationText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  virtueBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  virtueText: { fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 18, flex: 1 },
  expandedFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, flexWrap: "wrap", gap: 8 },
  referenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flex: 1,
  },
  referenceText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  footerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionBtnText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  /* Mark-as-recited */
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  doneBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  doneBadgeRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  doneBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.4 },

  /* End-of-section ornament (borrowed from C · Library Shelf) */
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
