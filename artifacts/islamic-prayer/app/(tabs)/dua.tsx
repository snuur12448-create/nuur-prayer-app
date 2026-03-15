import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { DUA_CATEGORIES, DuaCategory, Dua, ISLAMIC_REMINDERS } from "@/utils/islamicData";

export default function DuaScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [selectedCategory, setSelectedCategory] = useState<DuaCategory>(DUA_CATEGORIES[0]);
  const [expandedDua, setExpandedDua] = useState<string | null>(null);

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const CATEGORY_ICONS: Record<string, string> = {
    sunrise: "wb-sunny",
    moon: "nightlight-round",
    "hands-praying": "front-hand",
    heart: "favorite",
    shield: "shield",
  };

  const renderDua = ({ item }: { item: Dua }) => {
    const isExpanded = expandedDua === item.id;

    return (
      <Pressable
        style={[styles.duaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setExpandedDua(isExpanded ? null : item.id)}
      >
        <View style={styles.duaHeader}>
          <Text style={[styles.duaTitle, { color: colors.text }]}>{item.title}</Text>
          <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
        </View>

        {/* Always show Arabic */}
        <Text style={[styles.arabicText, { color: colors.text }]}>{item.arabic}</Text>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.transliterationText, { color: colors.gold }]}>
              {item.transliteration}
            </Text>
            <Text style={[styles.translationText, { color: colors.textSecondary }]}>
              {item.translation}
            </Text>
            {item.reference && (
              <View style={[styles.referenceBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }]}>
                <Feather name="book-open" size={11} color={colors.textSecondary} />
                <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
                  {item.reference}
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>الأدعية</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Duas & Adhkar
        </Text>
      </View>

      {/* Category tabs */}
      <View style={[styles.categoryRow, { borderBottomColor: colors.border }]}>
        <FlatList
          data={DUA_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedCategory.id === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: isSelected ? colors.tint : "transparent",
                    borderColor: isSelected ? colors.tint : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(item);
                  setExpandedDua(null);
                }}
              >
                <Feather
                  name={item.icon as any}
                  size={14}
                  color={isSelected ? "#fff" : colors.textSecondary}
                />
                <Text style={[styles.categoryTabText, { color: isSelected ? "#fff" : colors.textSecondary }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Duas list */}
      <FlatList
        data={selectedCategory.duas}
        keyExtractor={(item) => item.id}
        renderItem={renderDua}
        contentContainerStyle={[styles.listContent, {
          paddingBottom: isWeb ? 34 + 84 : 100 + insets.bottom
        }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.categoryHeaderCard}>
            <Text style={[styles.categoryHeaderTitle, { color: colors.text }]}>
              {selectedCategory.name}
            </Text>
            <Text style={[styles.categoryHeaderCount, { color: colors.textSecondary }]}>
              {selectedCategory.duas.length} duas
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  categoryRow: {
    borderBottomWidth: 1,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryTabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  listContent: {
    padding: 16,
  },
  categoryHeaderCard: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryHeaderTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  categoryHeaderCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  duaCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  duaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  duaTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    marginRight: 8,
  },
  arabicText: {
    fontSize: 20,
    textAlign: "right",
    lineHeight: 34,
    letterSpacing: 0.5,
    writingDirection: "rtl",
  },
  expandedContent: {
    gap: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  transliterationText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
    lineHeight: 22,
  },
  translationText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  referenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  referenceText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
