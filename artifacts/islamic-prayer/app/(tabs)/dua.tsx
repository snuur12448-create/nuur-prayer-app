import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Clipboard,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { DUA_CATEGORIES, DuaCategory, Dua } from "@/utils/islamicData";
import { getDailyHadith, Hadith } from "@/utils/hadithData";

const DAILY_HADITH = getDailyHadith();

function HadithCard({ hadith, colors }: { hadith: Hadith; colors: any }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${hadith.arabic}\n\n"${hadith.translation}"\n\n— ${hadith.narrator}\n${hadith.source}`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setString(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Pressable
      style={[styles.hadithCard, { backgroundColor: colors.prayerCard, borderColor: colors.gold + "44" }]}
      onPress={() => setExpanded((v) => !v)}
    >
      {/* Gold left accent */}
      <View style={[styles.hadithAccent, { backgroundColor: colors.gold }]} />

      <View style={styles.hadithInner}>
        {/* Label row */}
        <View style={styles.hadithLabelRow}>
          <View style={styles.hadithLabelLeft}>
            <View style={[styles.hadithBadge, { backgroundColor: colors.gold + "22", borderColor: colors.gold + "55" }]}>
              <Feather name="sun" size={10} color={colors.gold} />
              <Text style={[styles.hadithBadgeText, { color: colors.gold }]}>HADITH OF THE DAY</Text>
            </View>
            <Text style={[styles.hadithTopic, { color: colors.textSecondary }]}>{hadith.topic}</Text>
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textSecondary}
          />
        </View>

        {/* Arabic text */}
        <Text style={[styles.hadithArabic, { color: colors.text }]}>{hadith.arabic}</Text>

        {/* Translation — always visible */}
        <Text style={[styles.hadithTranslation, { color: colors.textSecondary }]}>
          "{hadith.translation}"
        </Text>

        {/* Expanded section */}
        {expanded && (
          <View style={styles.hadithExpandedSection}>
            <View style={[styles.hadithDivider, { backgroundColor: colors.gold + "33" }]} />

            {/* Transliteration */}
            {hadith.transliteration ? (
              <Text style={[styles.hadithTranslit, { color: colors.gold }]}>
                {hadith.transliteration}
              </Text>
            ) : null}

            {/* Narrator */}
            <View style={styles.hadithMetaRow}>
              <Feather name="user" size={11} color={colors.textSecondary} />
              <Text style={[styles.hadithMeta, { color: colors.textSecondary }]}>
                {hadith.narrator}
              </Text>
            </View>

            {/* Source + Grade */}
            <View style={styles.hadithFooter}>
              <View style={[styles.hadithSourceBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Feather name="book-open" size={10} color={colors.textSecondary} />
                <Text style={[styles.hadithSourceText, { color: colors.textSecondary }]}>
                  {hadith.source}
                </Text>
              </View>
              <View style={styles.hadithFooterRight}>
                <View style={[styles.hadithGradeBadge, { backgroundColor: colors.tint + "22", borderColor: colors.tint + "55" }]}>
                  <Text style={[styles.hadithGradeText, { color: colors.tint }]}>{hadith.grade}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCopy}
                  style={[styles.hadithCopyBtn, { backgroundColor: copied ? colors.gold + "22" : colors.surfaceElevated }]}
                  hitSlop={8}
                >
                  <Feather name={copied ? "check" : "copy"} size={12} color={copied ? colors.gold : colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function DuaScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [selectedCategory, setSelectedCategory] = useState<DuaCategory>(DUA_CATEGORIES[0]);
  const [expandedDua, setExpandedDua] = useState<string | null>(null);
  const [copiedDua, setCopiedDua] = useState<string | null>(null);

  const copyDua = (item: Dua) => {
    const text = `${item.arabic}\n\n${item.transliteration}\n\n"${item.translation}"${item.reference ? `\n— ${item.reference}` : ""}`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setString(text);
    }
    setCopiedDua(item.id);
    setTimeout(() => setCopiedDua(null), 2000);
  };

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

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
            <View style={styles.expandedFooter}>
              {item.reference && (
                <View style={[styles.referenceBadge, { backgroundColor: colors.surfaceElevated }]}>
                  <Feather name="book-open" size={11} color={colors.textSecondary} />
                  <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
                    {item.reference}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => copyDua(item)}
                style={[
                  styles.copyBtn,
                  { backgroundColor: copiedDua === item.id ? colors.gold + "20" : colors.surfaceElevated },
                ]}
                hitSlop={8}
              >
                <Feather
                  name={copiedDua === item.id ? "check" : "copy"}
                  size={13}
                  color={copiedDua === item.id ? colors.gold : colors.textSecondary}
                />
                <Text style={[styles.copyText, { color: copiedDua === item.id ? colors.gold : colors.textSecondary }]}>
                  {copiedDua === item.id ? "Copied!" : "Copy"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>الأدعية والأحاديث</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Duas, Adhkar & Hadiths
        </Text>
      </View>

      {/* Category tabs */}
      <View style={[styles.categoryRow, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {DUA_CATEGORIES.map((item) => {
            const isSelected = selectedCategory.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
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
          })}
        </ScrollView>
      </View>

      {/* Main list */}
      <FlatList
        data={selectedCategory.duas}
        keyExtractor={(item) => item.id}
        renderItem={renderDua}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: isWeb ? 34 + 84 : 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Hadith of the Day */}
            <HadithCard hadith={DAILY_HADITH} colors={colors} />

            {/* Section divider */}
            <View style={styles.sectionDivider}>
              <View style={[styles.sectionDividerLine, { backgroundColor: colors.border }]} />
              <View style={[styles.sectionLabel, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "44" }]}>
                <Feather name="heart" size={11} color={colors.tint} />
                <Text style={[styles.sectionLabelText, { color: colors.tint }]}>
                  {selectedCategory.name} · {selectedCategory.duas.length} duas
                </Text>
              </View>
              <View style={[styles.sectionDividerLine, { backgroundColor: colors.border }]} />
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  categoryRow: { borderBottomWidth: 1 },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginRight: 8,
  },
  categoryTabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  listContent: { padding: 16 },
  listHeader: { marginBottom: 4 },

  /* Hadith Card */
  hadithCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 20,
  },
  hadithAccent: {
    width: 4,
  },
  hadithInner: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  hadithLabelRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  hadithLabelLeft: { gap: 4 },
  hadithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  hadithBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  hadithTopic: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginLeft: 2,
  },
  hadithArabic: {
    fontSize: 22,
    textAlign: "right",
    lineHeight: 38,
    writingDirection: "rtl",
  },
  hadithTranslation: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    fontStyle: "italic",
  },
  hadithExpandedSection: { gap: 10 },
  hadithDivider: { height: 1 },
  hadithTranslit: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
    lineHeight: 20,
  },
  hadithMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hadithMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  hadithFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  hadithSourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  hadithSourceText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  hadithFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hadithGradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  hadithGradeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  hadithCopyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Section divider */
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
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
    padding: 16,
    marginBottom: 10,
  },
  duaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  duaTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 8 },
  arabicText: {
    fontSize: 20,
    textAlign: "right",
    lineHeight: 34,
    letterSpacing: 0.5,
    writingDirection: "rtl",
  },
  expandedContent: { gap: 12, marginTop: 4 },
  divider: { height: 1, marginVertical: 4 },
  transliterationText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
    lineHeight: 22,
  },
  translationText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  expandedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
    gap: 8,
  },
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
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
