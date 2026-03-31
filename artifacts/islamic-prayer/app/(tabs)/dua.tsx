import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Clipboard,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import { ALL_DUA_CATEGORIES, DuaItem, searchDuas } from "@/utils/duaData";
import { useSavedItems } from "@/utils/useSavedItems";
import ContentShareSheet from "@/components/ContentShareSheet";

function BookmarkBtn({ bookmarked, onPress, gold, grey }: { bookmarked: boolean; onPress: () => void; gold: string; grey: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.45, duration: 90, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 120, useNativeDriver: false }),
    ]).start();
    onPress();
  };
  return (
    <TouchableOpacity onPress={handlePress} hitSlop={12}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <MaterialCommunityIcons
          name={bookmarked ? "bookmark" : "bookmark-outline"}
          size={19}
          color={bookmarked ? gold : grey}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

interface DuaCardProps {
  item: DuaItem & { categoryName?: string };
  colors: any;
  accentColor?: string;
  showCategory?: boolean;
  bookmarked: boolean;
  onCopyDua: (item: DuaItem) => void;
  onShareDua: (item: DuaItem) => void;
  onBookmarkDua: (item: DuaItem) => void;
  collapseKey: string;
}

const DuaCard = React.memo(function DuaCard({
  item,
  colors,
  accentColor,
  showCategory,
  bookmarked,
  onCopyDua,
  onShareDua,
  onBookmarkDua,
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

  return (
    <Pressable
      style={[
        styles.duaCard,
        { backgroundColor: colors.surface, borderColor: expanded ? (accentColor ?? colors.tint) + "55" : colors.border },
      ]}
      onPress={handleToggle}
    >
      {accentColor && <View style={[styles.duaAccentBar, { backgroundColor: accentColor }]} />}
      <View style={styles.duaInner}>
        <View style={styles.duaHeader}>
          <View style={styles.duaTitleWrap}>
            {showCategory && item.categoryName && (
              <Text style={[styles.duaCategoryLabel, { color: accentColor ?? colors.tint }]}>
                {item.categoryName}
              </Text>
            )}
            <Text style={[styles.duaTitle, { color: colors.text }]}>{item.title}</Text>
          </View>
          <View style={styles.duaHeaderRight}>
            {(item as any).repeat && (
              <View style={[styles.repeatBadge, { backgroundColor: (accentColor ?? colors.tint) + "22", borderColor: (accentColor ?? colors.tint) + "55" }]}>
                <Text style={[styles.repeatText, { color: accentColor ?? colors.tint }]}>{(item as any).repeat}</Text>
              </View>
            )}
            <BookmarkBtn
              bookmarked={bookmarked}
              onPress={() => onBookmarkDua(item)}
              gold={colors.gold}
              grey={colors.textSecondary}
            />
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
          </View>
        </View>

        <Text style={[styles.arabicText, { color: colors.text }]}>{item.arabic}</Text>

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.transliterationText, { color: accentColor ?? colors.gold }]}>
              {item.transliteration}
            </Text>

            <Text style={[styles.translationText, { color: colors.textSecondary }]}>
              {item.translation}
            </Text>

            {(item as any).virtue && (
              <View style={[styles.virtueBox, { backgroundColor: (accentColor ?? colors.tint) + "12", borderColor: (accentColor ?? colors.tint) + "33" }]}>
                <Feather name="star" size={11} color={accentColor ?? colors.tint} />
                <Text style={[styles.virtueText, { color: accentColor ?? colors.tint }]}>
                  {(item as any).virtue}
                </Text>
              </View>
            )}

            <View style={styles.expandedFooter}>
              {item.reference && (
                <View style={[styles.referenceBadge, { backgroundColor: colors.surfaceElevated }]}>
                  <Feather name="book-open" size={11} color={colors.textSecondary} />
                  <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
                    {item.reference}
                  </Text>
                </View>
              )}
              <View style={styles.footerActions}>
                <TouchableOpacity
                  onPress={handleCopy}
                  style={[styles.copyBtn, { backgroundColor: copied ? colors.gold + "20" : colors.surfaceElevated }]}
                  hitSlop={8}
                >
                  <Feather name={copied ? "check" : "copy"} size={13} color={copied ? colors.gold : colors.textSecondary} />
                  <Text style={[styles.copyText, { color: copied ? colors.gold : colors.textSecondary }]}>
                    {copied ? "Copied!" : "Copy"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  style={[styles.copyBtn, { backgroundColor: colors.surfaceElevated }]}
                  hitSlop={8}
                >
                  <Feather name="share" size={13} color={colors.textSecondary} />
                  <Text style={[styles.copyText, { color: colors.textSecondary }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
});

export default function DuaScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();

  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_DUA_CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [shareDua, setShareDua] = useState<(DuaItem & { categoryName?: string }) | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { savedIds: savedDuaIds, toggle: toggleDua } = useSavedItems("nuur_saved_duas");

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
    () => ALL_DUA_CATEGORIES.flatMap(c => c.duas.map(d => ({ ...d, categoryId: c.id }))),
    []
  );

  const trimmed = debouncedQuery.trim();
  const isSearching = trimmed.length > 0;
  const searchResults = useMemo(() => (isSearching ? searchDuas(trimmed) : []), [trimmed, isSearching]);

  const collapseKey = `${selectedCategoryId}:${trimmed}:${savedDuaIds.size}`;

  const copyDua = useCallback((item: DuaItem) => {
    const text = `${item.arabic}\n\n${item.transliteration}\n\n"${item.translation}"${item.reference ? `\n— ${item.reference}` : ""}`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setString(text);
    }
  }, []);

  const shareDuaItem = useCallback((item: DuaItem & { categoryName?: string }) => {
    setShareDua(item);
  }, []);

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const bookmarkDua = useCallback((item: DuaItem) => {
    toggleDua(item.id);
  }, [toggleDua]);

  const renderDua = useCallback(
    ({ item }: { item: DuaItem & { categoryName?: string; categoryId?: string } }) => {
      const catId = (item as any).categoryId ?? selectedCategoryId;
      const cat = ALL_DUA_CATEGORIES.find((c) => c.id === catId);
      return (
        <DuaCard
          item={item}
          colors={colors}
          accentColor={cat?.accentColor}
          showCategory={isSearching || selectedCategoryId === "saved"}
          bookmarked={savedDuaIds.has(item.id)}
          onCopyDua={copyDua}
          onShareDua={shareDuaItem}
          onBookmarkDua={bookmarkDua}
          collapseKey={collapseKey}
        />
      );
    },
    [colors, selectedCategoryId, isSearching, copyDua, shareDuaItem, bookmarkDua, collapseKey, savedDuaIds]
  );

  const keyExtractor = useCallback((item: DuaItem) => item.id, []);

  const listData = useMemo(() => {
    if (isSearching) return searchResults;
    if (selectedCategoryId === "saved") return allDuasFlat.filter(d => savedDuaIds.has(d.id));
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
        <Pressable onPress={() => router.navigate("/(tabs)/more")} style={styles.backBtn} hitSlop={10}>
          <Feather name="chevron-left" size={24} color={colors.tint} />
        </Pressable>
        <View style={styles.headerTextRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>الأدعية والأذكار</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {totalDuas} authentic duas &amp; adhkar
            </Text>
          </View>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceElevated, borderColor: searchQuery.length > 0 ? colors.tint : colors.border }]}>
          <Feather name="search" size={16} color={searchQuery.length > 0 ? colors.tint : colors.textSecondary} />
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
            {/* Saved chip */}
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
                    },
                  ]}
                  onPress={() => setSelectedCategoryId("saved")}
                >
                  <MaterialCommunityIcons name="bookmark" size={13} color={isSelected ? "#fff" : colors.gold} />
                  <Text style={[styles.categoryTabText, { color: isSelected ? "#fff" : colors.gold }]}>
                    Saved
                  </Text>
                </TouchableOpacity>
              );
            })()}
            {ALL_DUA_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: isSelected ? cat.accentColor : "transparent",
                      borderColor: isSelected ? cat.accentColor : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Feather name={cat.icon as any} size={13} color={isSelected ? "#fff" : colors.textSecondary} />
                  <Text style={[styles.categoryTabText, { color: isSelected ? "#fff" : colors.textSecondary }]}>
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
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          isSearching ? (
            <View style={styles.searchHeader}>
              <Text style={[styles.searchResultCount, { color: colors.textSecondary }]}>
                {searchResults.length === 0
                  ? "No duas found"
                  : `${searchResults.length} dua${searchResults.length === 1 ? "" : "s"} found`}
              </Text>
            </View>
          ) : selectedCategoryId === "saved" ? (
            <View style={styles.listHeader}>
              <View style={styles.sectionDivider}>
                <View style={[styles.sectionDividerLine, { backgroundColor: colors.border }]} />
                <View style={[styles.sectionLabel, { backgroundColor: colors.gold + "22", borderColor: colors.gold + "55" }]}>
                  <MaterialCommunityIcons name="bookmark" size={11} color={colors.gold} />
                  <Text style={[styles.sectionLabelText, { color: colors.gold }]}>
                    Saved Duas · {savedDuaIds.size}
                  </Text>
                </View>
                <View style={[styles.sectionDividerLine, { backgroundColor: colors.border }]} />
              </View>
            </View>
          ) : (
            <View style={styles.listHeader}>
              <View style={styles.sectionDivider}>
                <View style={[styles.sectionDividerLine, { backgroundColor: colors.border }]} />
                <View style={[styles.sectionLabel, { backgroundColor: selectedCategory.accentColor + "22", borderColor: selectedCategory.accentColor + "55" }]}>
                  <Feather name={selectedCategory.icon as any} size={11} color={selectedCategory.accentColor} />
                  <Text style={[styles.sectionLabelText, { color: selectedCategory.accentColor }]}>
                    {selectedCategory.name} · {selectedCategory.duas.length} duas
                  </Text>
                </View>
                <View style={[styles.sectionDividerLine, { backgroundColor: colors.border }]} />
              </View>
            </View>
          )
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

      {shareDua && (() => {
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
  },
  categoryTabText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  listContent: { padding: 16 },
  listHeader: { marginBottom: 4 },

  searchHeader: { marginBottom: 8 },
  searchResultCount: { fontSize: 13, fontFamily: "Inter_400Regular" },

  emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },

  /* Section divider */
  sectionDivider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  sectionDividerLine: { flex: 1, height: 1 },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  sectionLabelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  /* Dua card */
  duaCard: { borderRadius: 16, borderWidth: 1, marginBottom: 10, flexDirection: "row", overflow: "hidden" },
  duaAccentBar: { width: 3 },
  duaInner: { flex: 1, padding: 16 },
  duaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  duaTitleWrap: { flex: 1, marginRight: 8, gap: 3 },
  duaCategoryLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  duaTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  duaHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  repeatBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  repeatText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  arabicText: { fontSize: 20, textAlign: "right", lineHeight: 34, letterSpacing: 0.5, writingDirection: "rtl" },
  expandedContent: { gap: 12, marginTop: 4 },
  divider: { height: 1, marginVertical: 2 },
  transliterationText: { fontSize: 14, fontFamily: "Inter_500Medium", fontStyle: "italic", lineHeight: 22 },
  translationText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  virtueBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  virtueText: { fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 18, flex: 1 },
  expandedFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, flexWrap: "wrap", gap: 8 },
  referenceBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flex: 1 },
  referenceText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  footerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  copyText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
