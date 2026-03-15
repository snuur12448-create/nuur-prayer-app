import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Clipboard,
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
    { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "All praise is due to Allah, Lord of the worlds —" },
    { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful," },
    { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ", translation: "Sovereign of the Day of Recompense." },
    { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
    { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path —" },
    { number: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those upon whom You have bestowed favor, not of those who have earned anger or of those who are astray." },
  ],
  99: [
    { number: 1, text: "إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا", translation: "When the earth is shaken with its [final] earthquake" },
    { number: 2, text: "وَأَخْرَجَتِ الْأَرْضُ أَثْقَالَهَا", translation: "And the earth discharges its burdens" },
    { number: 3, text: "وَقَالَ الْإِنسَانُ مَا لَهَا", translation: "And man says, 'What is [wrong] with it?'" },
    { number: 4, text: "يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا", translation: "That Day, it will report its news" },
    { number: 5, text: "بِأَنَّ رَبَّكَ أَوْحَىٰ لَهَا", translation: "Because your Lord has commanded it." },
    { number: 6, text: "يَوْمَئِذٍ يَصْدُرُ النَّاسُ أَشْتَاتًا لِّيُرَوْا أَعْمَالَهُمْ", translation: "That Day, the people will depart separated [into categories] to be shown [the result of] their deeds." },
    { number: 7, text: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", translation: "So whoever does an atom's weight of good will see it," },
    { number: 8, text: "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ", translation: "And whoever does an atom's weight of evil will see it." },
  ],
  100: [
    { number: 1, text: "وَالْعَادِيَاتِ ضَبْحًا", translation: "By the racers, panting," },
    { number: 2, text: "فَالْمُورِيَاتِ قَدْحًا", translation: "And the producers of sparks [when] striking" },
    { number: 3, text: "فَالْمُغِيرَاتِ صُبْحًا", translation: "And the chargers at dawn," },
    { number: 4, text: "فَأَثَرْنَ بِهِ نَقْعًا", translation: "Stirring up thereby [clouds of] dust," },
    { number: 5, text: "فَوَسَطْنَ بِهِ جَمْعًا", translation: "Arriving thereby in the center collectively," },
    { number: 6, text: "إِنَّ الْإِنسَانَ لِرَبِّهِ لَكَنُودٌ", translation: "Indeed mankind, to his Lord, is ungrateful." },
    { number: 7, text: "وَإِنَّهُ عَلَىٰ ذَٰلِكَ لَشَهِيدٌ", translation: "And indeed, he is to that a witness." },
    { number: 8, text: "وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ", translation: "And indeed he is, in love of wealth, intense." },
    { number: 9, text: "أَفَلَا يَعْلَمُ إِذَا بُعْثِرَ مَا فِي الْقُبُورِ", translation: "But does he not know that when the contents of the graves are scattered" },
    { number: 10, text: "وَحُصِّلَ مَا فِي الصُّدُورِ", translation: "And that within the breasts is obtained," },
    { number: 11, text: "إِنَّ رَبَّهُم بِهِمْ يَوْمَئِذٍ لَّخَبِيرٌ", translation: "Indeed, their Lord with them, that Day, is [fully] Aware." },
  ],
  101: [
    { number: 1, text: "الْقَارِعَةُ", translation: "The Striking Calamity —" },
    { number: 2, text: "مَا الْقَارِعَةُ", translation: "What is the Striking Calamity?" },
    { number: 3, text: "وَمَا أَدْرَاكَ مَا الْقَارِعَةُ", translation: "And what can make you know what is the Striking Calamity?" },
    { number: 4, text: "يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ", translation: "It is the Day when people will be like moths, dispersed," },
    { number: 5, text: "وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ", translation: "And the mountains will be like wool, fluffed up." },
    { number: 6, text: "فَأَمَّا مَن ثَقُلَتْ مَوَازِينُهُ", translation: "Then as for one whose scales are heavy [with good deeds]," },
    { number: 7, text: "فَهُوَ فِي عِيشَةٍ رَّاضِيَةٍ", translation: "He will be in a pleasant life." },
    { number: 8, text: "وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ", translation: "But as for one whose scales are light," },
    { number: 9, text: "فَأُمُّهُ هَاوِيَةٌ", translation: "His refuge will be an abyss." },
    { number: 10, text: "وَمَا أَدْرَاكَ مَا هِيَهْ", translation: "And what can make you know what that is?" },
    { number: 11, text: "نَارٌ حَامِيَةٌ", translation: "It is a Fire, intensely hot." },
  ],
  102: [
    { number: 1, text: "أَلْهَاكُمُ التَّكَاثُرُ", translation: "Competition in [worldly] increase diverts you" },
    { number: 2, text: "حَتَّىٰ زُرْتُمُ الْمَقَابِرَ", translation: "Until you visit the graveyards." },
    { number: 3, text: "كَلَّا سَوْفَ تَعْلَمُونَ", translation: "No! You are going to know." },
    { number: 4, text: "ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ", translation: "Then, no! You are going to know." },
    { number: 5, text: "كَلَّا لَوْ تَعْلَمُونَ عِلْمَ الْيَقِينِ", translation: "No! If you only knew with knowledge of certainty..." },
    { number: 6, text: "لَتَرَوُنَّ الْجَحِيمَ", translation: "You will surely see the Hellfire." },
    { number: 7, text: "ثُمَّ لَتَرَوُنَّهَا عَيْنَ الْيَقِينِ", translation: "Then you will surely see it with the eye of certainty." },
    { number: 8, text: "ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ", translation: "Then you will surely be asked that Day about pleasure." },
  ],
  103: [
    { number: 1, text: "وَالْعَصْرِ", translation: "By time," },
    { number: 2, text: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", translation: "Indeed, mankind is in loss," },
    { number: 3, text: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ", translation: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience." },
  ],
  104: [
    { number: 1, text: "وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ", translation: "Woe to every scorner and mocker" },
    { number: 2, text: "الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ", translation: "Who collects wealth and [continuously] counts it." },
    { number: 3, text: "يَحْسَبُ أَنَّ مَالَهُ أَخْلَدَهُ", translation: "He thinks that his wealth will make him immortal." },
    { number: 4, text: "كَلَّا لَيُنبَذَنَّ فِي الْحُطَمَةِ", translation: "No! He will surely be thrown into the Crusher." },
    { number: 5, text: "وَمَا أَدْرَاكَ مَا الْحُطَمَةُ", translation: "And what can make you know what is the Crusher?" },
    { number: 6, text: "نَارُ اللَّهِ الْمُوقَدَةُ", translation: "It is the fire of Allah, [eternally] fueled," },
    { number: 7, text: "الَّتِي تَطَّلِعُ عَلَى الْأَفْئِدَةِ", translation: "Which mounts directed at the hearts." },
    { number: 8, text: "إِنَّهَا عَلَيْهِم مُّؤْصَدَةٌ", translation: "Indeed, it [Hellfire] will be closed down upon them" },
    { number: 9, text: "فِي عَمَدٍ مُّمَدَّدَةٍ", translation: "In extended columns." },
  ],
  105: [
    { number: 1, text: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ", translation: "Have you not considered, [O Muhammad], how your Lord dealt with the companions of the elephant?" },
    { number: 2, text: "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ", translation: "Did He not make their plan into misguidance?" },
    { number: 3, text: "وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ", translation: "And He sent against them birds in flocks," },
    { number: 4, text: "تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ", translation: "Striking them with stones of hard clay," },
    { number: 5, text: "فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ", translation: "And He made them like eaten straw." },
  ],
  106: [
    { number: 1, text: "لِإِيلَافِ قُرَيْشٍ", translation: "For the accustomed security of the Quraysh —" },
    { number: 2, text: "إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ", translation: "Their accustomed security [in] the caravan of winter and summer —" },
    { number: 3, text: "فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ", translation: "Let them worship the Lord of this House," },
    { number: 4, text: "الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ", translation: "Who has fed them, [saving them] from hunger and made them safe, [saving them] from fear." },
  ],
  107: [
    { number: 1, text: "أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ", translation: "Have you seen the one who denies the Recompense?" },
    { number: 2, text: "فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ", translation: "For that is the one who drives away the orphan" },
    { number: 3, text: "وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ", translation: "And does not encourage the feeding of the poor." },
    { number: 4, text: "فَوَيْلٌ لِّلْمُصَلِّينَ", translation: "So woe to those who pray" },
    { number: 5, text: "الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ", translation: "[But] who are heedless of their prayer —" },
    { number: 6, text: "الَّذِينَ هُمْ يُرَاءُونَ", translation: "Those who make show [of their deeds]" },
    { number: 7, text: "وَيَمْنَعُونَ الْمَاعُونَ", translation: "And withhold [simple] assistance." },
  ],
  108: [
    { number: 1, text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", translation: "Indeed, We have granted you, [O Muhammad], al-Kawthar." },
    { number: 2, text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", translation: "So pray to your Lord and sacrifice [to Him alone]." },
    { number: 3, text: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", translation: "Indeed, your enemy is the one cut off." },
  ],
  109: [
    { number: 1, text: "قُلْ يَا أَيُّهَا الْكَافِرُونَ", translation: "Say, 'O disbelievers,'" },
    { number: 2, text: "لَا أَعْبُدُ مَا تَعْبُدُونَ", translation: "I do not worship what you worship." },
    { number: 3, text: "وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ", translation: "Nor are you worshippers of what I worship." },
    { number: 4, text: "وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ", translation: "Nor will I be a worshipper of what you worship." },
    { number: 5, text: "وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ", translation: "Nor will you be worshippers of what I worship." },
    { number: 6, text: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ", translation: "For you is your religion, and for me is my religion." },
  ],
  110: [
    { number: 1, text: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", translation: "When the victory of Allah has come and the conquest," },
    { number: 2, text: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا", translation: "And you see the people entering into the religion of Allah in multitudes," },
    { number: 3, text: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا", translation: "Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance." },
  ],
  111: [
    { number: 1, text: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ", translation: "May the hands of Abu Lahab be ruined, and ruined is he." },
    { number: 2, text: "مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ", translation: "His wealth will not avail him or that which he gained." },
    { number: 3, text: "سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ", translation: "He will [enter to] burn in a Fire of [blazing] flame" },
    { number: 4, text: "وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ", translation: "And his wife [as well] — the carrier of firewood." },
    { number: 5, text: "فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ", translation: "Around her neck is a rope of [twisted] fiber." },
  ],
  112: [
    { number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, 'He is Allah, [Who is] One,'" },
    { number: 2, text: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge." },
    { number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born," },
    { number: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent." },
  ],
  113: [
    { number: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "Say, 'I seek refuge in the Lord of daybreak'" },
    { number: 2, text: "مِن شَرِّ مَا خَلَقَ", translation: "From the evil of that which He created" },
    { number: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles" },
    { number: 4, text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", translation: "And from the evil of the blowers in knots" },
    { number: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies." },
  ],
  114: [
    { number: 1, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", translation: "Say, 'I seek refuge in the Lord of mankind,'" },
    { number: 2, text: "مَلِكِ النَّاسِ", translation: "The Sovereign of mankind." },
    { number: 3, text: "إِلَٰهِ النَّاسِ", translation: "The God of mankind," },
    { number: 4, text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", translation: "From the evil of the retreating whisperer" },
    { number: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", translation: "Who whispers [evil] into the breasts of mankind" },
    { number: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ", translation: "From among the jinn and mankind." },
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
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const verses = SURAH_VERSES[surahNumber] || null;
  const isBookmarked = bookmarkedSurahs.includes(surahNumber);
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const copyVerse = (verse: Verse) => {
    const text = `${verse.text}\n\n${verse.translation}\n— Surah ${surah?.englishName} (${surah?.number}:${verse.number})`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setString(text);
    }
    setCopiedVerse(verse.number);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  if (!surah) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Surah not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{surah.revelationType}</Text>
            <Text style={styles.metaLabel}>Revelation</Text>
          </View>
          <View style={styles.metaDivider} />
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
              style={[styles.verseCard, { backgroundColor: colors.surface, borderColor: copiedVerse === verse.number ? colors.gold : colors.border }]}
            >
              <View style={styles.verseHeader}>
                <TouchableOpacity
                  onPress={() => copyVerse(verse)}
                  style={[styles.copyBtn, { backgroundColor: copiedVerse === verse.number ? colors.gold + "20" : "transparent" }]}
                  hitSlop={8}
                >
                  <Feather
                    name={copiedVerse === verse.number ? "check" : "copy"}
                    size={13}
                    color={copiedVerse === verse.number ? colors.gold : colors.textSecondary}
                  />
                </TouchableOpacity>
                <View style={[styles.verseNumberBadge, { backgroundColor: colors.prayerCard }]}>
                  <Text style={[styles.verseNumber, { color: colors.gold }]}>{verse.number}</Text>
                </View>
              </View>
              <Text style={[styles.arabicVerse, { color: colors.text }]}>{verse.text}</Text>
              {showTranslation && (
                <Text style={[styles.translationVerse, { color: colors.textSecondary, borderTopColor: colors.border }]}>
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
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center", flex: 1 },
  headerArabic: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  headerEnglish: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  bookmarkBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerMeta: { flexDirection: "row", justifyContent: "center", gap: 16, alignItems: "center" },
  metaItem: { alignItems: "center", gap: 2, flex: 1 },
  metaValue: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  metaLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Inter_400Regular" },
  metaDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.15)" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  toggle: { width: 44, height: 24, borderRadius: 12, padding: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
  bismillah: { fontSize: 22, textAlign: "center", marginBottom: 24, lineHeight: 36 },
  verseCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  verseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  copyBtn: { borderRadius: 8, padding: 6 },
  verseNumberBadge: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  verseNumber: { fontSize: 13, fontFamily: "Inter_700Bold" },
  arabicVerse: { fontSize: 22, textAlign: "right", lineHeight: 38, letterSpacing: 0.3, writingDirection: "rtl", marginBottom: 10 },
  translationVerse: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, borderTopWidth: 1, paddingTop: 10 },
  comingSoon: { alignItems: "center", paddingVertical: 60, gap: 12 },
  comingSoonTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  comingSoonText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, maxWidth: 280 },
  errorText: { fontSize: 16, textAlign: "center", marginTop: 100 },
});
