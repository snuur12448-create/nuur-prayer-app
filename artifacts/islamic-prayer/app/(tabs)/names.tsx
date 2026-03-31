import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import { ALLAH_NAMES, AllahName } from "@/utils/namesData";
import ContentShareSheet from "@/components/ContentShareSheet";

const { width } = Dimensions.get("window");
const NUM_COLS = width >= 600 ? 3 : 2;

const CARD_GRADIENTS = [
  ["#1a1a2e", "#16213e"],
  ["#1a2a1a", "#162116"],
  ["#2a1a1a", "#211616"],
  ["#1a1a2a", "#16162b"],
  ["#2a1e10", "#211808"],
  ["#101e2a", "#081621"],
];

function NameCard({ item, colors, onPress }: { item: AllahName; colors: any; onPress: (item: AllahName) => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: false, speed: 30 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 20 }).start();
  };

  const gradIdx = (item.number - 1) % CARD_GRADIENTS.length;

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.tint + "33" }]}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.cardNumBadge, { backgroundColor: colors.tint + "22" }]}>
          <Text style={[styles.cardNum, { color: colors.tint }]}>{item.number}</Text>
        </View>
        <Text style={[styles.cardArabic, { color: colors.text }]}>{item.arabic}</Text>
        <Text style={[styles.cardTranslit, { color: colors.tint }]} numberOfLines={1}>{item.transliteration}</Text>
        <View style={[styles.cardDivider, { backgroundColor: colors.tint + "33" }]} />
        <Text style={[styles.cardMeaning, { color: colors.textSecondary }]} numberOfLines={2}>{item.meaning}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DetailSheet({ item, colors, onClose, onShare, miniPlayerH = 0 }: { item: AllahName; colors: any; onClose: () => void; onShare: () => void; miniPlayerH?: number }) {
  const slideY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: false, speed: 20, bounciness: 4 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: 80, duration: 180, useNativeDriver: false }),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: false }),
    ]).start(() => onClose());
  };

  return (
    <Animated.View
      style={[styles.sheetOverlay, { opacity }]}
      pointerEvents="box-none"
    >
      <TouchableOpacity style={styles.sheetBackdrop} onPress={handleClose} activeOpacity={1} />
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, transform: [{ translateY: slideY }] },
        ]}
      >
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={[styles.sheetScroll, { paddingBottom: 40 + miniPlayerH }]}
        >
          <View style={[styles.sheetNumBadge, { backgroundColor: colors.tint + "22" }]}>
            <Text style={[styles.sheetNum, { color: colors.tint }]}>#{item.number}</Text>
          </View>

          <Text style={[styles.sheetArabic, { color: colors.text }]}>{item.arabic}</Text>
          <Text style={[styles.sheetTranslit, { color: colors.tint }]}>{item.transliteration}</Text>

          <View style={[styles.sheetPronRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Feather name="volume-2" size={14} color={colors.textSecondary} />
            <Text style={[styles.sheetPronLabel, { color: colors.textSecondary }]}>Pronunciation: </Text>
            <Text style={[styles.sheetPron, { color: colors.text }]}>{item.pronunciation}</Text>
          </View>

          <View style={[styles.sheetMeaningBox, { backgroundColor: colors.background, borderColor: colors.tint + "33" }]}>
            <Text style={[styles.sheetMeaningTitle, { color: colors.textSecondary }]}>Meaning</Text>
            <Text style={[styles.sheetMeaning, { color: colors.text }]}>{item.meaning}</Text>
          </View>

          <View style={[styles.sheetDescBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.sheetDescTitle, { color: colors.textSecondary }]}>Description</Text>
            <Text style={[styles.sheetDesc, { color: colors.text }]}>{item.description}</Text>
          </View>

          <View style={styles.sheetBtnRow}>
            <TouchableOpacity
              style={[styles.sheetShareBtn, { borderColor: colors.tint }]}
              onPress={onShare}
              activeOpacity={0.82}
            >
              <Feather name="share" size={15} color={colors.tint} />
              <Text style={[styles.sheetShareBtnText, { color: colors.tint }]}>Share Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sheetCloseBtn, { backgroundColor: colors.tint }]}
              onPress={handleClose}
              activeOpacity={0.85}
            >
              <Text style={styles.sheetCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

export default function NamesScreen() {
  const insets = useSafeAreaInsets();
  const { themeColors: colors } = useAppContext();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AllahName | null>(null);
  const [shareItem, setShareItem] = useState<AllahName | null>(null);

  const topInset = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const miniPlayerH = useMiniPlayerHeight();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ALLAH_NAMES;
    return ALLAH_NAMES.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q) ||
        n.arabic.includes(q) ||
        String(n.number) === q
    );
  }, [query]);

  const renderItem = ({ item }: { item: AllahName }) => (
    <NameCard item={item} colors={colors} onPress={setSelected} />
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, backgroundColor: colors.surface }]}>
        <Pressable onPress={() => router.navigate("/(tabs)/more")} style={styles.backBtn} hitSlop={10}>
          <Feather name="chevron-left" size={24} color={colors.tint} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={[styles.headerAr, { color: colors.tint }]}>أَسْمَاءُ اللّٰهِ الْحُسْنَىٰ</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>The 99 Names of Allah</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Tap any name to learn its meaning and pronunciation
          </Text>
        </View>

        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, meaning or number…"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {query.length > 0 && (
          <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
            {filtered.length} {filtered.length === 1 ? "name" : "names"} found
          </Text>
        )}
      </View>

      {/* Grid */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.number)}
        numColumns={NUM_COLS}
        key={NUM_COLS}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 + miniPlayerH }]}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={NUM_COLS > 1 ? styles.row : undefined}
        initialNumToRender={16}
        maxToRenderPerBatch={20}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No names match your search</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={[styles.countBanner, { backgroundColor: colors.surface + "88" }]}>
            <Text style={[styles.countBannerText, { color: colors.textSecondary }]}>
              {query ? `${filtered.length} of 99 names` : "99 Beautiful Names"}
            </Text>
          </View>
        }
      />

      {/* Detail Sheet */}
      {selected && (
        <DetailSheet
          item={selected}
          colors={colors}
          onClose={() => setSelected(null)}
          onShare={() => setShareItem(selected)}
          miniPlayerH={miniPlayerH}
        />
      )}

      {shareItem && (
        <ContentShareSheet
          visible={true}
          onClose={() => setShareItem(null)}
          theme="name"
          sheetTitle="Share Name"
          shareTitle={shareItem.transliteration}
          label={`NAME #${shareItem.number}  ·  ASMA AL-HUSNA`}
          secondaryTitle={shareItem.transliteration}
          arabicText={shareItem.arabic}
          bodyItalic={shareItem.pronunciation}
          bodyText={`${shareItem.meaning}\n\n${shareItem.description}`}
        />
      )}
    </View>
  );
}

const CARD_W = (width - 48) / NUM_COLS;

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { alignSelf: "flex-start", marginBottom: 4 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: { alignItems: "center", marginBottom: 16 },
  headerAr: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 6, textAlign: "center" },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, textAlign: "center" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  resultCount: { fontSize: 12, textAlign: "center" },

  countBanner: { marginHorizontal: 16, marginBottom: 8, marginTop: 12, borderRadius: 10, padding: 8, alignItems: "center" },
  countBannerText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  listContent: { paddingHorizontal: 16, paddingTop: 4 },
  row: { gap: 10, marginBottom: 10 },

  cardWrapper: { flex: 1 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    minHeight: 170,
    justifyContent: "center",
    gap: 6,
  },
  cardNumBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cardNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  cardArabic: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center", marginTop: 16 },
  cardTranslit: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  cardDivider: { width: 36, height: 1, borderRadius: 1 },
  cardMeaning: { fontSize: 11, textAlign: "center", lineHeight: 15 },

  /* Sheet */
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 100,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    maxHeight: "90%",
  },
  sheetScroll: {
    alignItems: "center",
    gap: 12,
    paddingTop: 4,
    width: "100%",
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, marginBottom: 4 },
  sheetNumBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  sheetNum: { fontSize: 13, fontFamily: "Inter_700Bold" },
  sheetArabic: { fontSize: 52, fontFamily: "Inter_700Bold", textAlign: "center", lineHeight: 70 },
  sheetTranslit: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },

  sheetPronRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    alignSelf: "stretch",
  },
  sheetPronLabel: { fontSize: 13 },
  sheetPron: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  sheetMeaningBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignSelf: "stretch",
  },
  sheetMeaningTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 },
  sheetMeaning: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },

  sheetDescBox: {
    borderRadius: 14,
    padding: 14,
    alignSelf: "stretch",
  },
  sheetDescTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 },
  sheetDesc: { fontSize: 14, lineHeight: 21 },

  sheetBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  sheetShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  sheetShareBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sheetCloseBtn: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  sheetCloseBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  emptyBox: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 16 },
});
