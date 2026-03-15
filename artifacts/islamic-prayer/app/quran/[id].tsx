import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";
import { SURAHS } from "@/utils/islamicData";

interface Verse {
  number: number;
  text: string;
  translation: string;
}

const SURAH_VERSES: Record<number, Verse[]> = {
  1: [
    { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
    { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "All praise is due to Allah, Lord of the worlds -" },
    { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful," },
    { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ", translation: "Sovereign of the Day of Recompense." },
    { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
    { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path -" },
    { number: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those upon whom You have bestowed favor, not of those who have earned anger or of those who are astray." },
  ],
  112: [
    { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
    { number: 2, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, 'He is Allah, [Who is] One,'" },
    { number: 3, text: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge." },
    { number: 4, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born," },
    { number: 5, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent." },
  ],
  113: [
    { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
    { number: 2, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "Say, 'I seek refuge in the Lord of daybreak'" },
    { number: 3, text: "مِن شَرِّ مَا خَلَقَ", translation: "From the evil of that which He created" },
    { number: 4, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles" },
    { number: 5, text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", translation: "And from the evil of the blowers in knots" },
    { number: 6, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies." },
  ],
  114: [
    { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
    { number: 2, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", translation: "Say, 'I seek refuge in the Lord of mankind,'" },
    { number: 3, text: "مَلِكِ النَّاسِ", translation: "The Sovereign of mankind." },
    { number: 4, text: "إِلَٰهِ النَّاسِ", translation: "The God of mankind," },
    { number: 5, text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", translation: "From the evil of the retreating whisperer" },
    { number: 6, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", translation: "Who whispers [evil] into the breasts of mankind" },
    { number: 7, text: "مِنَ الْجِنَّةِ وَالنَّاسِ", translation: "From among the jinn and mankind." },
  ],
};

export default function QuranDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNumber = parseInt(id || "1", 10);
  const surah = SURAHS.find((s) => s.number === surahNumber);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { bookmarkedSurahs, toggleBookmark } = useAppContext();

  const [showTranslation, setShowTranslation] = useState(true);
  const verses = SURAH_VERSES[surahNumber] || null;
  const isBookmarked = bookmarkedSurahs.includes(surahNumber);
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  if (!surah) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Surah not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.prayerCard }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerArabic}>{surah.name}</Text>
            <Text style={styles.headerEnglish}>{surah.englishName}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleBookmark(surahNumber)} style={styles.bookmarkBtn}>
            <Feather name="bookmark" size={22} color={isBookmarked ? colors.gold : "rgba(255,255,255,0.5)"} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{surah.verses}</Text>
            <Text style={styles.metaLabel}>Verses</Text>
          </View>
          <View style={[styles.metaDivider]} />
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{surah.revelationType}</Text>
            <Text style={styles.metaLabel}>Revelation</Text>
          </View>
          <View style={[styles.metaDivider]} />
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{surah.englishMeaning}</Text>
            <Text style={styles.metaLabel}>Meaning</Text>
          </View>
        </View>
      </View>

      {/* Translation toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>Show Translation</Text>
        <Pressable
          style={[styles.toggle, { backgroundColor: showTranslation ? colors.tint : colors.border }]}
          onPress={() => setShowTranslation(!showTranslation)}
        >
          <View style={[styles.toggleThumb, { transform: [{ translateX: showTranslation ? 20 : 0 }] }]} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: isWeb ? 34 : insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Bismillah */}
        {surahNumber !== 9 && surahNumber !== 1 && (
          <Text style={[styles.bismillah, { color: colors.text }]}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        )}

        {verses ? (
          verses.map((verse) => (
            <View
              key={verse.number}
              style={[styles.verseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.verseHeader}>
                <View style={[styles.verseNumberBadge, { backgroundColor: colors.prayerCard }]}>
                  <Text style={[styles.verseNumber, { color: colors.gold }]}>{verse.number}</Text>
                </View>
              </View>
              <Text style={[styles.arabicVerse, { color: colors.text }]}>{verse.text}</Text>
              {showTranslation && (
                <Text style={[styles.translationVerse, { color: colors.textSecondary }]}>
                  {verse.translation}
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.comingSoon}>
            <Feather name="book-open" size={48} color={colors.textSecondary} />
            <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
              Full Surah Coming Soon
            </Text>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              This surah has {surah.verses} verses. Full text will be available in a future update.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerArabic: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  headerEnglish: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerMeta: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    alignItems: "center",
  },
  metaItem: {
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  metaValue: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  metaLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  metaDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  bismillah: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 36,
  },
  verseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  verseHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  verseNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  verseNumber: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  arabicVerse: {
    fontSize: 22,
    textAlign: "right",
    lineHeight: 38,
    letterSpacing: 0.3,
    writingDirection: "rtl",
    marginBottom: 10,
  },
  translationVerse: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 10,
  },
  comingSoon: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  comingSoonText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
});
