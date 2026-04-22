import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
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
import Svg, { Circle as SvgCircle, Defs, RadialGradient as SvgRadialGradient, Stop } from "react-native-svg";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import { ALLAH_NAMES, AllahName } from "@/utils/namesData";
import ContentShareSheet from "@/components/ContentShareSheet";

const { width, height: SCREEN_H } = Dimensions.get("window");
const NUM_COLS = width >= 600 ? 3 : 2;
// Sheet takes 82% of screen — explicit height so flex:1 on ScrollView works reliably.
const SHEET_H = Math.round(SCREEN_H * 0.82);

// Soft gradient surface tints — cycle through deep jewel tones so 99 cards
// don't feel monotonous. Kept very dark so gold/text always pop.
const CARD_GRADIENTS: [string, string][] = [
  ["#1a2a23", "#0f1c17"], // emerald
  ["#1f1f2e", "#13131f"], // indigo
  ["#2a1f1f", "#1c1414"], // garnet
  ["#1a2330", "#101820"], // sapphire
  ["#2a221a", "#1c1610"], // bronze
  ["#1f2a26", "#13201c"], // jade
];

// Gold halo that sits behind the Arabic name — gives a subtle "noor" glow.
function NameHalo({ color, size = 110 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} style={{ position: "absolute" }} pointerEvents="none">
      <Defs>
        <SvgRadialGradient id="halo" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <Stop offset="55%" stopColor={color} stopOpacity={0.05} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </SvgRadialGradient>
      </Defs>
      <SvgCircle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#halo)" />
    </Svg>
  );
}

function NameCard({ item, colors, onPress }: { item: AllahName; colors: any; onPress: (item: AllahName) => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: false, speed: 30 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 20 }).start();
  };

  const gradIdx = (item.number - 1) % CARD_GRADIENTS.length;
  const gold = colors.gold ?? colors.tint;

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.cardTouch}
      >
        <LinearGradient
          colors={CARD_GRADIENTS[gradIdx]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor: gold + "33" }]}
        >
          {/* Number medallion — small gold-rimmed circle, top-left */}
          <View style={[styles.cardNumBadge, { borderColor: gold + "55", backgroundColor: gold + "12" }]}>
            <Text style={[styles.cardNum, { color: gold }]}>{item.number}</Text>
          </View>

          {/* Arabic name with soft gold halo behind it */}
          <View style={styles.cardArabicWrap}>
            <NameHalo color={gold} size={110} />
            <Text style={[styles.cardArabic, { color: colors.text }]}>{item.arabic}</Text>
          </View>

          <Text style={[styles.cardTranslit, { color: gold }]} numberOfLines={1}>{item.transliteration}</Text>

          {/* Dot ornament instead of plain rule */}
          <View style={styles.cardOrnament}>
            <View style={[styles.cardDot, { backgroundColor: gold + "55" }]} />
            <View style={[styles.cardOrnamentLine, { backgroundColor: gold + "33" }]} />
            <View style={[styles.cardDot, { backgroundColor: gold + "55" }]} />
          </View>

          <Text style={[styles.cardMeaning, { color: colors.textSecondary }]} numberOfLines={2}>{item.meaning}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DetailSheet({ item, colors, onClose, onShare, miniPlayerH = 0 }: { item: AllahName; colors: any; onClose: () => void; onShare: () => void; miniPlayerH?: number }) {
  const slideY = useRef(new Animated.Value(SHEET_H)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: false, speed: 20, bounciness: 4 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: SHEET_H, duration: 220, useNativeDriver: false }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) dragY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.6) {
          dismiss();
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: false, speed: 25 }).start();
        }
      },
    })
  ).current;

  const translateY = Animated.add(slideY, dragY);

  return (
    <Animated.View
      style={[styles.sheetOverlay, { opacity }]}
      pointerEvents="box-none"
    >
      <TouchableOpacity style={styles.sheetBackdrop} onPress={dismiss} activeOpacity={1} />
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, transform: [{ translateY }] },
        ]}
      >
        {/* Drag handle — touch area is larger than the visual pill */}
        <View {...panResponder.panHandlers} style={styles.sheetHandleArea}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        </View>

        {/* Top action bar — always visible, outside scroll */}
        <View style={styles.sheetTopBar}>
          <View style={[styles.sheetNumBadge, { backgroundColor: colors.tint + "22" }]}>
            <Text style={[styles.sheetNum, { color: colors.tint }]}>#{item.number}</Text>
          </View>
          <View style={styles.sheetTopActions}>
            <TouchableOpacity
              style={[styles.sheetIconBtn, { borderColor: colors.tint }]}
              onPress={onShare}
              activeOpacity={0.82}
            >
              <Feather name="share-2" size={16} color={colors.tint} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sheetIconBtn, { backgroundColor: colors.tint, borderColor: colors.tint }]}
              onPress={dismiss}
              activeOpacity={0.85}
            >
              <Feather name="x" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable content — flex:1 so it fills remaining sheet height */}
        <ScrollView
          style={styles.sheetScrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentContainerStyle={[styles.sheetScroll, { paddingBottom: 32 + miniPlayerH }]}
        >
          {/* Arabic name with large halo glow */}
          <View style={styles.sheetArabicWrap}>
            <NameHalo color={(colors as any).gold ?? colors.tint} size={260} />
            <Text style={[styles.sheetArabic, { color: colors.text }]}>{item.arabic}</Text>
          </View>
          <Text style={[styles.sheetTranslit, { color: (colors as any).gold ?? colors.tint }]}>{item.transliteration}</Text>

          {/* Ornamental separator under transliteration */}
          <View style={styles.sheetRule}>
            <View style={[styles.ruleDot, { backgroundColor: ((colors as any).gold ?? colors.tint) + "88" }]} />
            <View style={[styles.ruleLine, { backgroundColor: ((colors as any).gold ?? colors.tint) + "44", width: 60 }]} />
            <View style={[styles.ruleDiamond, { borderColor: ((colors as any).gold ?? colors.tint) + "88" }]} />
            <View style={[styles.ruleLine, { backgroundColor: ((colors as any).gold ?? colors.tint) + "44", width: 60 }]} />
            <View style={[styles.ruleDot, { backgroundColor: ((colors as any).gold ?? colors.tint) + "88" }]} />
          </View>

          <View style={[styles.sheetPronRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Feather name="volume-2" size={14} color={colors.textSecondary} />
            <Text style={[styles.sheetPronLabel, { color: colors.textSecondary }]}>Pronunciation: </Text>
            <Text style={[styles.sheetPron, { color: colors.text }]}>{item.pronunciation}</Text>
          </View>

          <View style={[styles.sheetMeaningBox, { backgroundColor: colors.background, borderColor: colors.tint + "33" }]}>
            <Text style={[styles.sheetMeaningTitle, { color: colors.textSecondary }]}>MEANING</Text>
            <Text style={[styles.sheetMeaning, { color: colors.text }]}>{item.meaning}</Text>
          </View>

          <View style={[styles.sheetDescBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.sheetDescTitle, { color: colors.textSecondary }]}>DESCRIPTION</Text>
            <Text style={[styles.sheetDesc, { color: colors.text }]}>{item.description}</Text>
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
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Feather name="chevron-left" size={24} color={colors.tint} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={[styles.headerAr, { color: (colors.gold ?? colors.tint) }]}>أَسْمَاءُ اللّٰهِ الْحُسْنَىٰ</Text>
          {/* Ornamental rule: dot — line — diamond — line — dot */}
          <View style={styles.headerRule}>
            <View style={[styles.ruleDot, { backgroundColor: (colors.gold ?? colors.tint) + "88" }]} />
            <View style={[styles.ruleLine, { backgroundColor: (colors.gold ?? colors.tint) + "44" }]} />
            <View style={[styles.ruleDiamond, { borderColor: (colors.gold ?? colors.tint) + "88" }]} />
            <View style={[styles.ruleLine, { backgroundColor: (colors.gold ?? colors.tint) + "44" }]} />
            <View style={[styles.ruleDot, { backgroundColor: (colors.gold ?? colors.tint) + "88" }]} />
          </View>
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
          arabicFontSize={36}
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
  headerAr: { fontSize: 32, fontFamily: "AmiriQuran_400Regular", marginBottom: 8, textAlign: "center", lineHeight: 48 },
  headerRule: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  ruleDot: { width: 4, height: 4, borderRadius: 2 },
  ruleLine: { width: 40, height: 1 },
  ruleDiamond: { width: 6, height: 6, borderWidth: 1, transform: [{ rotate: "45deg" }] },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4, letterSpacing: -0.3 },
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
  cardTouch: { flex: 1, borderRadius: 18, overflow: "hidden" },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    paddingTop: 22,
    alignItems: "center",
    minHeight: 188,
    justifyContent: "center",
    gap: 6,
  },
  cardNumBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  cardArabicWrap: {
    width: 110,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  cardArabic: { fontSize: 30, fontFamily: "AmiriQuran_400Regular", textAlign: "center", lineHeight: 48 },
  cardTranslit: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center", marginTop: 2 },
  cardOrnament: { flexDirection: "row", alignItems: "center", gap: 4, marginVertical: 2 },
  cardDot: { width: 3, height: 3, borderRadius: 1.5 },
  cardOrnamentLine: { width: 28, height: 1 },
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
    height: SHEET_H,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 0,
    overflow: "hidden",
  },
  sheetHandleArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  sheetScrollView: {
    flex: 1,
  },
  sheetTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 6,
    marginBottom: 4,
  },
  sheetTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sheetScroll: {
    alignItems: "center",
    gap: 12,
    paddingTop: 4,
    width: "100%",
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, marginBottom: 8, alignSelf: "center" },
  sheetNumBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  sheetNum: { fontSize: 13, fontFamily: "Inter_700Bold" },
  sheetArabicWrap: {
    width: "100%",
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  sheetArabic: { fontSize: 56, fontFamily: "AmiriQuran_400Regular", textAlign: "center", lineHeight: 96 },
  sheetTranslit: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center", marginTop: 4 },
  sheetRule: { flexDirection: "row", alignItems: "center", gap: 6, marginVertical: 8 },

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

  sheetIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBox: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 16 },
});
