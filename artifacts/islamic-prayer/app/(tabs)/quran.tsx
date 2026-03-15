import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
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

export default function QuranScreen() {
  const { bookmarkedSurahs, toggleBookmark, themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "bookmarked">("all");

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const filtered = SURAHS.filter((s) => {
    const matchSearch =
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.englishMeaning.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      s.number.toString().includes(search);
    const matchFilter = filter === "all" || bookmarkedSurahs.includes(s.number);
    return matchSearch && matchFilter;
  });

  const renderSurah = ({ item }: { item: Surah }) => {
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
        onPress={() => router.push({ pathname: "/quran/[id]", params: { id: item.number.toString() } })}
      >
        <View style={[styles.numberBadge, { backgroundColor: colors.prayerCard }]}>
          <Text style={[styles.numberText, { color: colors.gold }]}>{item.number}</Text>
        </View>
        <View style={styles.surahInfo}>
          <View style={styles.surahNameRow}>
            <Text style={[styles.surahEnglish, { color: colors.text }]}>{item.englishName}</Text>
            <Text style={[styles.surahArabic, { color: colors.text }]}>{item.name}</Text>
          </View>
          <View style={styles.surahMeta}>
            <Text style={[styles.surahMeaning, { color: colors.textSecondary }]}>
              {item.englishMeaning}
            </Text>
            <View style={[styles.typeBadge, {
              backgroundColor: item.revelationType === "Meccan"
                ? `${colors.gold}26`
                : `${colors.tint}26`
            }]}>
              <Text style={[styles.typeText, {
                color: item.revelationType === "Meccan" ? colors.gold : colors.tint
              }]}>
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>القرآن الكريم</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>The Holy Quran</Text>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search surahs..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

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
              <Text style={[styles.filterText, { color: filter === f ? "#fff" : colors.textSecondary }]}>
                {f === "all" ? "All Surahs" : "Bookmarked"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderSurah}
        contentContainerStyle={[styles.listContent, {
          paddingBottom: isWeb ? 34 + 84 : 100 + insets.bottom
        }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {filter === "bookmarked" ? "No bookmarked surahs yet" : "No surahs found"}
            </Text>
          </View>
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
  listContent: {
    padding: 16,
    gap: 8,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
