import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";

const ADDED_DHIKR_KEY = "nuur_added_dhikr";

// ─────────────────────────────────────────────
// Types & data — Counter presets
// ─────────────────────────────────────────────

interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  target: number;
  color: string;
}

const DHIKR_PRESETS: DhikrPreset[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "SubhanAllah",
    translation: "Glory be to Allah",
    target: 33,
    color: "#4CAF7D",
  },
  {
    id: "alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is for Allah",
    target: 33,
    color: "#2D6A4F",
  },
  {
    id: "allahuakbar",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    target: 34,
    color: "#D4A017",
  },
  {
    id: "lailahaillallah",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illallah",
    translation: "There is no deity except Allah",
    target: 100,
    color: "#1B4332",
  },
  {
    id: "astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    target: 100,
    color: "#6B4226",
  },
  {
    id: "salawat",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    transliteration: "Allahumma salli 'ala Muhammad",
    translation: "O Allah, send blessings upon Muhammad",
    target: 100,
    color: "#1565C0",
  },
  {
    id: "hasbunallah",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallah wa ni'mal wakeel",
    translation: "Allah is sufficient for us and He is the best guardian",
    target: 99,
    color: "#7B1FA2",
  },
];

// ─────────────────────────────────────────────
// Dhikr Library — curated additions
// ─────────────────────────────────────────────

const DHIKR_LIBRARY: DhikrPreset[] = [
  {
    id: "la_ilaha_illallah",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illallah",
    translation: "There is no god but Allah",
    target: 100,
    color: "#1B4332",
  },
  {
    id: "la_hawla",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "La hawla wala quwwata illa billah",
    translation: "There is no power except with Allah",
    target: 100,
    color: "#5C4033",
  },
  {
    id: "lib_astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    target: 100,
    color: "#6B4226",
  },
  {
    id: "lib_salawat",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    transliteration: "Allahumma salli ala Muhammad",
    translation: "O Allah, send blessings upon Muhammad",
    target: 100,
    color: "#1565C0",
  },
  {
    id: "bismillah",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the name of Allah",
    target: 33,
    color: "#00695C",
  },
  {
    id: "la_ilaha_illa_anta",
    arabic: "لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ",
    transliteration: "La ilaha illa anta subhanak",
    translation: "There is no god but You, glory be to You",
    target: 33,
    color: "#4527A0",
  },
  {
    id: "hasbiyallah",
    arabic: "حَسْبِيَ اللَّهُ",
    transliteration: "Hasbiyallah",
    translation: "Allah is sufficient for me",
    target: 33,
    color: "#AD1457",
  },
  {
    id: "ya_allah",
    arabic: "يَا اللَّهُ",
    transliteration: "Ya Allah",
    translation: "O Allah",
    target: 33,
    color: "#2E7D32",
  },
  {
    id: "ya_hayyu_ya_qayyum",
    arabic: "يَا حَيُّ يَا قَيُّومُ",
    transliteration: "Ya Hayyu Ya Qayyum",
    translation: "O Ever-Living, O Self-Sustaining",
    target: 33,
    color: "#6A1B9A",
  },
  {
    id: "inna_lillah",
    arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    transliteration: "Inna lillahi wa inna ilayhi raji'un",
    translation: "Indeed we belong to Allah, and indeed to Him we will return",
    target: 33,
    color: "#37474F",
  },
  {
    id: "rabbighfir",
    arabic: "رَبِّ اغْفِرْ لِي",
    transliteration: "Rabbighfir li",
    translation: "My Lord, forgive me",
    target: 33,
    color: "#BF360C",
  },
  {
    id: "salawat_ibrahim",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    transliteration: "Allahumma salli ala Muhammad wa ala ali Muhammad",
    translation: "O Allah, send blessings upon Muhammad and upon the family of Muhammad",
    target: 100,
    color: "#01579B",
  },
  {
    id: "subhanallahi_wa_bihamdihi",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhanallahi wa bihamdihi",
    translation: "Glory be to Allah and His praise",
    target: 100,
    color: "#1B5E20",
  },
  {
    id: "subhanallahil_azeem",
    arabic: "سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "Subhanallahil Azeem",
    translation: "Glory be to Allah the Magnificent",
    target: 33,
    color: "#004D40",
  },
  {
    id: "tahlil_full",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lahu lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadeer",
    translation: "There is no god but Allah alone, no partner has He, His is the dominion and His is the praise and He is over all things capable",
    target: 100,
    color: "#1A237E",
  },
  {
    id: "hasbunallah_wakeel",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakeel",
    translation: "Allah is sufficient for us and He is the best disposer of affairs",
    target: 33,
    color: "#4E342E",
  },
  {
    id: "rabbana_atina",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina azabannar",
    translation: "Our Lord, give us good in this world and good in the next and protect us from the punishment of the Fire",
    target: 33,
    color: "#B71C1C",
  },
  {
    id: "laylatul_qadr_dua",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    transliteration: "Allahumma innaka afuwwun tuhibbul afwa fa'fu anni",
    translation: "O Allah, You are the Pardoner, You love to pardon, so pardon me",
    target: 33,
    color: "#880E4F",
  },
  {
    id: "raditu_billah",
    arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا",
    transliteration: "Raditu billahi rabban wa bil-islami dinan wa bi-muhammadin nabiyya",
    translation: "I am pleased with Allah as my Lord, Islam as my religion and Muhammad as my Prophet",
    target: 3,
    color: "#E65100",
  },
];

// ─────────────────────────────────────────────
// Types & data — Post-Prayer Dhikr guide
// ─────────────────────────────────────────────

type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

interface ReciteStep {
  type: "recite";
  id: string;
  title: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  note?: string;
  source?: string;
  timesLabel?: string;
}

interface CountStep {
  type: "count";
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  target: number;
  color: string;
}

type GuideStep = ReciteStep | CountStep;

const CORE_GUIDE_STEPS: GuideStep[] = [
  {
    type: "count",
    id: "istighfar",
    title: "Istighfar",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    target: 3,
    color: "#6BAF92",
  },
  {
    type: "recite",
    id: "taslim-dua",
    title: "Opening Du'a",
    arabic:
      "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration:
      "Allahumma anta al-salam wa minka al-salam, tabarakta ya Dhal Jalali wal-Ikram",
    translation:
      "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Honour.",
    source: "Ṣaḥīḥ Muslim 591",
  },
  {
    type: "recite",
    id: "ayat-al-kursi",
    title: "Āyat al-Kursī",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    translation:
      "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursī extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    note: "Whoever recites Āyat al-Kursī after every obligatory prayer, nothing prevents him from entering Paradise except death. — al-Nasā'ī 9928 (Ṣaḥīḥ)",
    source: "Al-Baqarah 2:255",
  },
  {
    type: "count",
    id: "subhanallah",
    title: "Tasbīḥ",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "SubḥānAllah",
    translation: "Glory be to Allah",
    target: 33,
    color: "#4CAF7D",
  },
  {
    type: "count",
    id: "alhamdulillah",
    title: "Taḥmīd",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alḥamdulillāh",
    translation: "All praise is for Allah",
    target: 33,
    color: "#C9933A",
  },
  {
    type: "count",
    id: "allahuakbar",
    title: "Takbīr",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allāhu Akbar",
    translation: "Allah is the Greatest",
    target: 34,
    color: "#9C88D4",
  },
  {
    type: "recite",
    id: "tahlil",
    title: "Closing Tahlīl",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "Lā ilāha illallāh, waḥdahu lā sharīka lah, lahul mulku wa lahul ḥamd, wa huwa ʿalā kulli shay'in qadīr",
    translation:
      "There is no deity except Allah alone, without partners. His is the kingdom, His is all praise, and He is over all things capable.",
    source: "Ṣaḥīḥ Muslim 597",
  },
];

function buildGuideSteps(prayer: PrayerName): GuideStep[] {
  const triple = prayer === "Fajr" || prayer === "Maghrib";
  const timesLabel = triple ? "× 3" : "× 1";
  const timesNote = triple
    ? "Recite 3× after Fajr and Maghrib"
    : "Recite 1× after Dhuhr, Asr, and Isha";

  const surahSteps: ReciteStep[] = [
    {
      type: "recite",
      id: "ikhlas",
      title: `Sūrat al-Ikhlāṣ ${timesLabel}`,
      arabic:
        "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾",
      translation:
        "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.",
      note: timesNote,
      source: "Al-Ikhlāṣ 112:1-4",
      timesLabel,
    },
    {
      type: "recite",
      id: "falaq",
      title: `Sūrat al-Falaq ${timesLabel}`,
      arabic:
        "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾",
      translation:
        "Say: I seek refuge in the Lord of daybreak, from the evil of what He has created, and from the evil of darkness when it settles, and from the evil of blowers in knots, and from the evil of an envier when he envies.",
      note: timesNote,
      source: "Al-Falaq 113:1-5",
      timesLabel,
    },
    {
      type: "recite",
      id: "nas",
      title: `Sūrat al-Nās ${timesLabel}`,
      arabic:
        "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾",
      translation:
        "Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer, who whispers in the breasts of mankind, from among jinn and mankind.",
      note: timesNote,
      source: "Al-Nās 114:1-6",
      timesLabel,
    },
  ];

  return [...CORE_GUIDE_STEPS, ...surahSteps];
}

const PRAYERS: { name: PrayerName; arabic: string; emoji: string; color: string }[] = [
  { name: "Fajr",    arabic: "الفجر",    emoji: "🌙", color: "#4A6FA5" },
  { name: "Dhuhr",   arabic: "الظهر",   emoji: "☀️", color: "#C9933A" },
  { name: "Asr",     arabic: "العصر",    emoji: "🌤", color: "#6BAF92" },
  { name: "Maghrib", arabic: "المغرب", emoji: "🌆", color: "#E07840" },
  { name: "Isha",    arabic: "العشاء",   emoji: "🌃", color: "#9C88D4" },
];

// ─────────────────────────────────────────────
// Sub-components — Dhikr Guide
// ─────────────────────────────────────────────

function PrayerSelector({ colors, onSelect }: { colors: any; onSelect: (p: PrayerName) => void }) {
  return (
    <View style={gs.selectorContainer}>
      <Text style={[gs.selectorTitle, { color: colors.text }]}>أذكار بعد الصلاة</Text>
      <Text style={[gs.selectorSubtitle, { color: colors.textSecondary }]}>
        Which prayer did you just complete?
      </Text>
      <View style={gs.prayerGrid}>
        {PRAYERS.map((p) => (
          <TouchableOpacity
            key={p.name}
            onPress={() => onSelect(p.name)}
            style={[gs.prayerBtn, { backgroundColor: p.color + "18", borderColor: p.color + "55" }]}
            activeOpacity={0.75}
          >
            <Text style={gs.prayerEmoji}>{p.emoji}</Text>
            <Text style={[gs.prayerBtnName, { color: p.color }]}>{p.name}</Text>
            <Text style={[gs.prayerBtnArabic, { color: colors.textSecondary }]}>{p.arabic}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[gs.infoBox, { backgroundColor: colors.tint + "0C", borderColor: colors.tint + "30" }]}>
        <MaterialCommunityIcons name="information-outline" size={14} color={colors.tint} />
        <Text style={[gs.infoText, { color: colors.textSecondary }]}>
          Al-Ikhlāṣ, al-Falaq, and al-Nās are recited 3× after Fajr and Maghrib, and 1× after the remaining prayers.
        </Text>
      </View>
    </View>
  );
}

const STEP_BEAD_SPACING = 26;

function CountStepCard({
  step,
  count,
  colors,
  onCount,
}: {
  step: CountStep;
  count: number;
  colors: any;
  onCount: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const beadOffset = useRef(new Animated.Value(-STEP_BEAD_SPACING / 2)).current;
  const done = count >= step.target;

  // Slide the bead column so the active bead stays vertically centered.
  useEffect(() => {
    Animated.spring(beadOffset, {
      toValue: -(count * STEP_BEAD_SPACING) - STEP_BEAD_SPACING / 2,
      useNativeDriver: true,
      friction: 9,
      tension: 60,
    }).start();
  }, [count, beadOffset]);

  const handleTap = useCallback(() => {
    if (count >= step.target) return;
    onCount();
    if (Platform.OS !== "web") Vibration.vibrate(18);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 70, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();
  }, [count, step.target, onCount, scaleAnim]);

  return (
    <View style={gs.countStepContainer}>
      <Text style={[gs.stepTitle, { color: colors.textSecondary }]}>{step.title}</Text>
      <Text style={[gs.arabicText, { color: colors.text }]}>{step.arabic}</Text>
      <Text style={[gs.translitText, { color: colors.tint }]}>{step.transliteration}</Text>
      <Text style={[gs.transText, { color: colors.textSecondary }]}>{step.translation}</Text>

      {/* ── Bead string counter ── */}
      <Pressable
        onPress={handleTap}
        disabled={done}
        style={[
          gs.beadStepArea,
          {
            backgroundColor: colors.surface,
            borderColor: done ? step.color + "66" : colors.border,
          },
        ]}
      >
        {/* Cord */}
        <View
          pointerEvents="none"
          style={[gs.beadStepString, { backgroundColor: step.color + "55" }]}
        />

        {/* Bead column */}
        <Animated.View
          pointerEvents="none"
          style={[gs.beadStepColumn, { transform: [{ translateY: beadOffset }] }]}
        >
          {Array.from({ length: step.target + 1 }).map((_, i) => {
            const isCompleted = i < count;
            const isActive = i === count && !done;
            const isMarker =
              step.target >= 33 && i > 0 && i < step.target && i % 33 === 0;

            const baseSize = isMarker ? 16 : 12;
            const activeSize = isMarker ? 24 : 20;
            const size = isActive ? activeSize : baseSize;

            return (
              <View key={i} style={gs.beadStepCell}>
                <Animated.View
                  style={isActive ? { transform: [{ scale: scaleAnim }] } : undefined}
                >
                  <Bead
                    size={size}
                    color={step.color}
                    isMarker={isMarker}
                    isCompleted={isCompleted || done}
                    isActive={isActive}
                  />
                </Animated.View>
              </View>
            );
          })}
        </Animated.View>

        {/* Edge fades — match the card surface so beads soften out of view */}
        <View
          pointerEvents="none"
          style={[gs.beadStepFadeTop, { backgroundColor: colors.surface }]}
        />
        <View
          pointerEvents="none"
          style={[gs.beadStepFadeBottom, { backgroundColor: colors.surface }]}
        />

        {/* Inline count + done badge */}
        <View style={gs.beadStepCountRow} pointerEvents="none">
          <Text style={[gs.beadStepCount, { color: done ? step.color : colors.text }]}>
            {count}
          </Text>
          <Text style={[gs.beadStepCountDiv, { color: colors.textSecondary }]}>
            /{step.target}
          </Text>
          {done && (
            <View style={[gs.beadStepDoneDot, { backgroundColor: step.color }]}>
              <Feather name="check" size={11} color="#fff" />
            </View>
          )}
        </View>

        {!done && (
          <Text style={[gs.beadStepHint, { color: colors.textSecondary }]} pointerEvents="none">
            tap to count
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function ReciteStepCard({ step, colors }: { step: ReciteStep; colors: any }) {
  return (
    <View style={gs.reciteContainer}>
      <Text style={[gs.stepTitle, { color: colors.textSecondary }]}>{step.title}</Text>

      {step.source && (
        <View style={[gs.sourcePill, { backgroundColor: colors.gold + "18", borderColor: colors.gold + "44" }]}>
          <Feather name="book" size={10} color={colors.gold} />
          <Text style={[gs.sourcePillText, { color: colors.gold }]}>{step.source}</Text>
        </View>
      )}

      <Text style={[gs.arabicText, gs.arabicLarge, { color: colors.text }]}>{step.arabic}</Text>

      {step.transliteration && (
        <Text style={[gs.translitText, { color: colors.tint }]}>{step.transliteration}</Text>
      )}

      <Text style={[gs.transText, { color: colors.textSecondary }]}>{step.translation}</Text>

      {step.note && (
        <View style={[gs.noteBox, { backgroundColor: colors.tint + "0C", borderColor: colors.tint + "30" }]}>
          <MaterialCommunityIcons name="information-outline" size={13} color={colors.tint} />
          <Text style={[gs.noteText, { color: colors.textSecondary }]}>{step.note}</Text>
        </View>
      )}
    </View>
  );
}

function CompletionCard({ prayer, colors, onRestart }: { prayer: PrayerName; colors: any; onRestart: () => void }) {
  return (
    <View style={gs.completionContainer}>
      <Text style={gs.completionEmoji}>✨</Text>
      <Text style={[gs.completionTitle, { color: colors.text }]}>Mā Shā Allāh</Text>
      <Text style={[gs.completionSubtitle, { color: colors.textSecondary }]}>
        You have completed the post-{prayer} adhkār
      </Text>

      <View style={[gs.closingDuaBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[gs.closingDuaArabic, { color: colors.text }]}>
          رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
        </Text>
        <Text style={[gs.closingDuaTranslit, { color: colors.tint }]}>
          Rabbana taqabbal minna, innaka anta al-Samī' al-'Alīm
        </Text>
        <Text style={[gs.closingDuaTrans, { color: colors.textSecondary }]}>
          Our Lord, accept from us. Indeed, You are the All-Hearing, the All-Knowing.
        </Text>
      </View>

      <TouchableOpacity
        onPress={onRestart}
        style={[gs.restartBtn, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "44" }]}
        activeOpacity={0.75}
      >
        <Feather name="refresh-ccw" size={15} color={colors.tint} />
        <Text style={[gs.restartBtnText, { color: colors.tint }]}>Start Again</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Realistic bead — layered shading + specular highlight
// ─────────────────────────────────────────────
type BeadProps = {
  size: number;
  color: string;
  isMarker: boolean;
  isCompleted: boolean;
  isActive: boolean;
};

const Bead = React.memo(function Bead({ size, color, isMarker, isCompleted, isActive }: BeadProps) {
  // Lit beads (completed/active) are polished metal/stone in the dhikr color.
  // Unlit beads are the same color but very dim — like dark wood with a hint of tone.
  const lit = isCompleted || isActive;
  const baseColor = lit ? color : color + "26"; // ~15% alpha for unlit
  const radius = isMarker ? size * 0.22 : size / 2;
  const containerRotate = isMarker ? "45deg" : "0deg";

  return (
    <View
      style={{
        width: size,
        height: size,
        transform: [{ rotate: containerRotate }],
        // Soft drop shadow underneath the bead
        shadowColor: "#000",
        shadowOpacity: lit ? 0.45 : 0.25,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: lit ? 3 : 1,
      }}
    >
      {/* Base sphere */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: baseColor,
          borderRadius: radius,
        }}
      />

      {/* Spherical shading — light from top-left, shadow bottom-right */}
      <LinearGradient
        colors={
          lit
            ? ["rgba(255,255,255,0.55)", "rgba(255,255,255,0)", "rgba(0,0,0,0.45)"]
            : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0)", "rgba(0,0,0,0.55)"]
        }
        locations={[0, 0.55, 1]}
        start={{ x: 0.15, y: 0.1 }}
        end={{ x: 0.95, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: radius,
        }}
      />

      {/* Specular highlight — small bright sheen near top-left */}
      {lit && (
        <View
          style={{
            position: "absolute",
            top: size * 0.16,
            left: size * 0.18,
            width: size * 0.32,
            height: size * 0.22,
            borderRadius: size * 0.18,
            backgroundColor: "rgba(255,255,255,0.7)",
            opacity: isActive ? 0.95 : 0.55,
          }}
        />
      )}

      {/* Subtle rim — darkens the silhouette edge for roundness */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "rgba(0,0,0,0.35)",
        }}
      />
    </View>
  );
});

export default function TasbeehScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;
  const TAB_H = isWeb ? 84 : insets.bottom + 49;
  const bottomPad = TAB_H + miniPlayerH + 16;

  // ── Screen mode ──
  const [mode, setMode] = useState<"counter" | "guide">("counter");

  // ── Counter state ──
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrPreset>(DHIKR_PRESETS[0]);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [showSelector, setShowSelector] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // ── Dhikr Library state ──
  const [addedDhikr, setAddedDhikr] = useState<DhikrPreset[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  // Load persisted added dhikr
  useEffect(() => {
    AsyncStorage.getItem(ADDED_DHIKR_KEY).then((raw) => {
      if (raw) {
        try { setAddedDhikr(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const saveAddedDhikr = async (next: DhikrPreset[]) => {
    setAddedDhikr(next);
    try { await AsyncStorage.setItem(ADDED_DHIKR_KEY, JSON.stringify(next)); } catch {}
  };

  const addDhikrFromLibrary = (dhikr: DhikrPreset) => {
    if (addedDhikr.some((d) => d.id === dhikr.id)) return;
    saveAddedDhikr([...addedDhikr, dhikr]);
  };

  const removeDhikr = (id: string) => {
    const next = addedDhikr.filter((d) => d.id !== id);
    saveAddedDhikr(next);
    if (selectedDhikr.id === id) {
      setSelectedDhikr(DHIKR_PRESETS[0]);
      setCount(0);
      setRounds(0);
    }
  };

  const handleLongPressAdded = (dhikr: DhikrPreset) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Remove "${dhikr.transliteration}" from your list?`)) {
        removeDhikr(dhikr.id);
      }
    } else {
      Alert.alert(
        "Remove Dhikr",
        `Remove "${dhikr.transliteration}" from your list?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: () => removeDhikr(dhikr.id) },
        ],
      );
    }
  };

  const addedDhikrIds = new Set(addedDhikr.map((d) => d.id));
  const presetIds = new Set(DHIKR_PRESETS.map((d) => d.id));
  const allDhikr = [...DHIKR_PRESETS, ...addedDhikr];

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const beadOffset = useRef(new Animated.Value(0)).current;

  // ── Guide state ──
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [guideCounts, setGuideCounts] = useState<Record<string, number>>({});
  const [guideCompleted, setGuideCompleted] = useState(false);

  // ── Counter handlers ──
  const progress = selectedDhikr.target > 0 ? Math.min(count / selectedDhikr.target, 1) : 0;

  // Animate the bead column so the active bead stays centered.
  // Column is anchored at top:"50%" of the viewport, so translating by
  // -(count * spacing) - (spacing / 2) places bead `count`'s vertical
  // midpoint exactly at the viewport center.
  const BEAD_SPACING = 30;
  useEffect(() => {
    Animated.spring(beadOffset, {
      toValue: -(count * BEAD_SPACING) - BEAD_SPACING / 2,
      useNativeDriver: true,
      friction: 9,
      tension: 60,
    }).start();
  }, [count, beadOffset]);

  const handleCount = useCallback(() => {
    if (Platform.OS !== "web") Vibration.vibrate(30);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: false }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
    ]).start();

    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start();

    setCount((prev) => {
      const next = prev + 1;
      if (next >= selectedDhikr.target) {
        setRounds((r) => r + 1);
        setJustCompleted(true);
        Animated.sequence([
          Animated.timing(completionAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.delay(2000),
          Animated.timing(completionAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
        ]).start(() => setJustCompleted(false));
        setTotalCount((t) => t + 1);
        return 0;
      }
      setTotalCount((t) => t + 1);
      return next;
    });
  }, [selectedDhikr.target, scaleAnim, completionAnim, rippleAnim]);

  const handleReset = () => setCount(0);
  const handleFullReset = () => { setCount(0); setTotalCount(0); setRounds(0); };

  const selectDhikr = (dhikr: DhikrPreset) => {
    setSelectedDhikr(dhikr);
    setCount(0);
    setRounds(0);
    setShowSelector(false);
  };

  // ── Guide handlers ──
  const guideSteps = selectedPrayer ? buildGuideSteps(selectedPrayer) : [];
  const guideStep = guideSteps[currentStep];

  const handleGuideCount = useCallback((stepId: string) => {
    setGuideCounts((prev) => ({ ...prev, [stepId]: (prev[stepId] ?? 0) + 1 }));
  }, []);

  const canAdvance = (stepIdx: number, steps: GuideStep[], counts: Record<string, number>) => {
    const s = steps[stepIdx];
    if (!s) return false;
    if (s.type === "count") return (counts[s.id] ?? 0) >= s.target;
    return true;
  };

  const handleGuideNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setGuideCompleted(true);
    }
  };

  const handleGuideRestart = () => {
    setSelectedPrayer(null);
    setCurrentStep(0);
    setGuideCounts({});
    setGuideCompleted(false);
  };

  const switchMode = (m: "counter" | "guide") => {
    setMode(m);
  };

  const completionScale = completionAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const completionOpacity = completionAnim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const rippleScale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const rippleOpacity = rippleAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.3, 0.1, 0] });

  const progressPct = guideSteps.length > 0 ? currentStep / guideSteps.length : 0;
  const isReady = selectedPrayer && !guideCompleted && guideStep;
  const canGoNext = isReady ? canAdvance(currentStep, guideSteps, guideCounts) : false;

  return (
    <View style={[cs.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[cs.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <View style={cs.headerRow}>
          <Pressable onPress={() => router.navigate("/(tabs)/more")} hitSlop={10} style={cs.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.tint} />
          </Pressable>

          <View style={{ flex: 1 }}>
            {mode === "counter" ? (
              <>
                <Text style={[cs.headerTitle, { color: colors.text }]}>التسبيح</Text>
                <Text style={[cs.headerSubtitle, { color: colors.textSecondary }]}>Tasbeeh Counter</Text>
              </>
            ) : selectedPrayer && !guideCompleted ? (
              <>
                <Text style={[cs.headerTitle, { color: colors.text }]}>After {selectedPrayer}</Text>
                <Text style={[cs.headerSubtitle, { color: colors.textSecondary }]}>
                  Step {currentStep + 1} of {guideSteps.length}
                </Text>
              </>
            ) : (
              <>
                <Text style={[cs.headerTitle, { color: colors.text }]}>Post-Prayer Dhikr</Text>
                <Text style={[cs.headerSubtitle, { color: colors.textSecondary }]}>أذكار بعد الصلاة</Text>
              </>
            )}
          </View>

          {mode === "counter" ? (
            <View style={cs.headerRightRow}>
              <TouchableOpacity
                style={[cs.iconHeaderBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => { setShowSelector(false); setShowLibrary(true); }}
                hitSlop={8}
              >
                <Feather name="plus" size={18} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[cs.fullResetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleFullReset}
              >
                <Feather name="refresh-cw" size={14} color={colors.textSecondary} />
                <Text style={[cs.fullResetText, { color: colors.textSecondary }]}>Reset All</Text>
              </TouchableOpacity>
            </View>
          ) : selectedPrayer ? (
            <TouchableOpacity
              style={[cs.fullResetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleGuideRestart}
              hitSlop={8}
            >
              <Feather name="refresh-cw" size={14} color={colors.textSecondary} />
              <Text style={[cs.fullResetText, { color: colors.textSecondary }]}>Restart</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>

        {/* Mode toggle */}
        <View style={[cs.modeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[cs.modeTab, mode === "counter" && { backgroundColor: colors.tint }]}
            onPress={() => switchMode("counter")}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name="circle-multiple-outline"
              size={14}
              color={mode === "counter" ? "#fff" : colors.textSecondary}
            />
            <Text style={[cs.modeTabText, { color: mode === "counter" ? "#fff" : colors.textSecondary }]}>
              Counter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[cs.modeTab, mode === "guide" && { backgroundColor: colors.tint }]}
            onPress={() => switchMode("guide")}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name="hands-pray"
              size={14}
              color={mode === "guide" ? "#fff" : colors.textSecondary}
            />
            <Text style={[cs.modeTabText, { color: mode === "guide" ? "#fff" : colors.textSecondary }]}>
              Dhikr Guide
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Guide progress bar ── */}
      {mode === "guide" && selectedPrayer && !guideCompleted && (
        <View style={[cs.progressBar, { backgroundColor: colors.border }]}>
          <View style={[cs.progressBarFill, { backgroundColor: colors.tint, width: `${progressPct * 100}%` as any }]} />
        </View>
      )}

      {/* ══════════════════════════════════════
          COUNTER MODE
      ══════════════════════════════════════ */}
      {mode === "counter" && (
        <View style={[cs.modeContent, { paddingBottom: bottomPad }]}>
          {/* Dhikr selector */}
          <Pressable
            style={[cs.dhikrSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowSelector(!showSelector)}
          >
            <View style={[cs.dhikrColorDot, { backgroundColor: selectedDhikr.color }]} />
            <View style={cs.dhikrSelectorText}>
              <Text style={[cs.dhikrSelectorArabic, { color: colors.text }]}>{selectedDhikr.transliteration}</Text>
              <Text style={[cs.dhikrSelectorTranslation, { color: colors.textSecondary }]}>
                {selectedDhikr.translation} · Target: {selectedDhikr.target}
              </Text>
            </View>
            <Feather name={showSelector ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
          </Pressable>

          {showSelector && (
            <View style={[cs.dhikrList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {allDhikr.map((dhikr, idx) => {
                const isAdded = !presetIds.has(dhikr.id);
                const isSelected = selectedDhikr.id === dhikr.id;
                const isLast = idx === allDhikr.length - 1;
                return (
                  <TouchableOpacity
                    key={dhikr.id}
                    style={[
                      cs.dhikrOption,
                      {
                        backgroundColor: isSelected ? colors.surfaceElevated : "transparent",
                        borderBottomColor: isLast ? "transparent" : colors.border,
                      },
                    ]}
                    onPress={() => selectDhikr(dhikr)}
                    onLongPress={isAdded ? () => handleLongPressAdded(dhikr) : undefined}
                    delayLongPress={500}
                    activeOpacity={0.7}
                  >
                    <View style={[cs.dhikrColorDot, { backgroundColor: dhikr.color }]} />
                    <View style={cs.dhikrOptionText}>
                      <Text style={[cs.dhikrOptionArabic, { color: colors.text }]}>{dhikr.arabic}</Text>
                      <Text style={[cs.dhikrOptionTranslit, { color: colors.textSecondary }]}>
                        {dhikr.transliteration} · {dhikr.target}×
                      </Text>
                    </View>
                    {isAdded && (
                      <Feather name="bookmark" size={13} color={colors.tint} style={{ marginRight: 4, opacity: 0.7 }} />
                    )}
                    {isSelected && (
                      <Feather name="check" size={16} color={dhikr.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Counter area */}
          <View style={cs.counterArea}>
            <View style={cs.statsRow}>
              <View style={[cs.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[cs.statValue, { color: colors.text }]}>{rounds}</Text>
                <Text style={[cs.statLabel, { color: colors.textSecondary }]}>Rounds</Text>
              </View>
              <View style={[cs.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[cs.statValue, { color: colors.gold }]}>{totalCount}</Text>
                <Text style={[cs.statLabel, { color: colors.textSecondary }]}>Total</Text>
              </View>
              <View style={[cs.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[cs.statValue, { color: colors.tint }]}>{selectedDhikr.target - count}</Text>
                <Text style={[cs.statLabel, { color: colors.textSecondary }]}>Remaining</Text>
              </View>
            </View>

            <Text style={[cs.arabicDisplay, { color: colors.text }]}>{selectedDhikr.arabic}</Text>
            <Text style={[cs.translationDisplay, { color: colors.textSecondary }]}>{selectedDhikr.translation}</Text>

            {/* ── Misbaha bead string ── */}
            <View style={cs.beadArea}>
              {/* Vertical string */}
              <View
                pointerEvents="none"
                style={[cs.beadString, { backgroundColor: selectedDhikr.color + "33" }]}
              />

              {/* Active-bead glow */}
              <Animated.View
                pointerEvents="none"
                style={[
                  cs.beadGlow,
                  {
                    backgroundColor: selectedDhikr.color,
                    opacity: rippleOpacity,
                    transform: [{ scale: rippleScale }],
                  },
                ]}
              />

              {/* Bead column */}
              <Animated.View
                pointerEvents="none"
                style={[cs.beadColumn, { transform: [{ translateY: beadOffset }] }]}
              >
                {Array.from({ length: selectedDhikr.target + 1 }).map((_, i) => {
                  const isCompleted = i < count;
                  const isActive = i === count;
                  // Markers split a long string into 33-bead segments (canonical
                  // misbaha rhythm). Skip markers entirely for short dhikr (<33)
                  // and never put one on the very last bead — it'd double-up
                  // with the natural completion event.
                  const isMarker =
                    selectedDhikr.target >= 33 &&
                    i > 0 &&
                    i < selectedDhikr.target &&
                    i % 33 === 0;

                  const baseSize = isMarker ? 18 : 14;
                  const activeSize = isMarker ? 28 : 22;
                  const size = isActive ? activeSize : baseSize;

                  return (
                    <View key={i} style={cs.beadCell}>
                      <Animated.View
                        style={
                          isActive ? { transform: [{ scale: scaleAnim }] } : undefined
                        }
                      >
                        <Bead
                          size={size}
                          color={selectedDhikr.color}
                          isMarker={isMarker}
                          isCompleted={isCompleted}
                          isActive={isActive}
                        />
                      </Animated.View>
                    </View>
                  );
                })}
              </Animated.View>

              {/* Top + bottom fade masks */}
              <View pointerEvents="none" style={[cs.beadFadeTop, { backgroundColor: colors.background }]} />
              <View pointerEvents="none" style={[cs.beadFadeBottom, { backgroundColor: colors.background }]} />

              {/* Tap target — entire bead viewport */}
              <Pressable style={StyleSheet.absoluteFill} onPress={handleCount} android_ripple={null} />

              {/* Completion overlay */}
              {justCompleted && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    cs.beadCompletion,
                    { opacity: completionOpacity, transform: [{ scale: completionScale }] },
                  ]}
                >
                  <Text style={cs.completionCheck}>✓</Text>
                  <Text style={[cs.completionText, { color: "#fff" }]}>Round {rounds} complete!</Text>
                </Animated.View>
              )}
            </View>

            {/* Glass count pill + reset */}
            <View style={cs.countDock}>
              <TouchableOpacity
                style={[cs.dockSideBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleReset}
                hitSlop={8}
              >
                <Feather name="rotate-ccw" size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              <View
                style={[
                  cs.countPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Animated.Text
                  style={[
                    cs.countPillNum,
                    { color: colors.text, transform: [{ scale: scaleAnim }] },
                  ]}
                >
                  {count}
                </Animated.Text>
                <Text style={[cs.countPillDiv, { color: colors.textSecondary }]}>
                  /{selectedDhikr.target}
                </Text>
              </View>

              <TouchableOpacity
                style={[cs.dockSideBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowSelector((v) => !v)}
                hitSlop={8}
              >
                <Feather name="list" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════
          DHIKR LIBRARY MODAL
      ══════════════════════════════════════ */}
      <Modal
        visible={showLibrary}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLibrary(false)}
      >
        <View style={[cs.libraryContainer, { backgroundColor: colors.background }]}>
          {/* Library header */}
          <View style={[cs.libraryHeader, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[cs.libraryTitle, { color: colors.text }]}>Dhikr Library</Text>
              <Text style={[cs.librarySubtitle, { color: colors.textSecondary }]}>
                Tap Add to include in your Tasbeeh list
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowLibrary(false)}
              style={[cs.libraryCloseBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              hitSlop={8}
            >
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Library items */}
          <ScrollView contentContainerStyle={cs.libraryScroll} showsVerticalScrollIndicator={false}>
            {DHIKR_LIBRARY.map((dhikr) => {
              const alreadyAdded = addedDhikrIds.has(dhikr.id);
              const isPreset = presetIds.has(dhikr.id);
              const unavailable = alreadyAdded || isPreset;
              return (
                <View
                  key={dhikr.id}
                  style={[cs.libraryItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={[cs.libraryColorBar, { backgroundColor: dhikr.color }]} />
                  <View style={cs.libraryItemBody}>
                    <Text style={[cs.libraryArabic, { color: colors.text }]}>{dhikr.arabic}</Text>
                    <Text style={[cs.libraryTranslit, { color: colors.tint }]}>{dhikr.transliteration}</Text>
                    <Text style={[cs.libraryMeaning, { color: colors.textSecondary }]}>{dhikr.translation}</Text>
                    <View style={cs.libraryMeta}>
                      <View style={[cs.libraryTargetPill, { backgroundColor: dhikr.color + "18", borderColor: dhikr.color + "44" }]}>
                        <Feather name="repeat" size={10} color={dhikr.color} />
                        <Text style={[cs.libraryTargetText, { color: dhikr.color }]}>
                          {dhikr.target}×
                        </Text>
                      </View>
                      {isPreset && (
                        <View style={[cs.libraryInListPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                          <Feather name="check-circle" size={10} color={colors.textSecondary} />
                          <Text style={[cs.libraryInListText, { color: colors.textSecondary }]}>In presets</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => { if (!unavailable) addDhikrFromLibrary(dhikr); }}
                    disabled={unavailable}
                    style={[
                      cs.libraryAddBtn,
                      {
                        backgroundColor: alreadyAdded
                          ? colors.tint + "18"
                          : isPreset
                          ? colors.surfaceElevated
                          : colors.tint,
                        borderColor: unavailable ? colors.border : colors.tint,
                      },
                    ]}
                  >
                    {alreadyAdded ? (
                      <>
                        <Feather name="check" size={13} color={colors.tint} />
                        <Text style={[cs.libraryAddBtnText, { color: colors.tint }]}>Added</Text>
                      </>
                    ) : isPreset ? (
                      <Text style={[cs.libraryAddBtnText, { color: colors.textSecondary }]}>Preset</Text>
                    ) : (
                      <>
                        <Feather name="plus" size={13} color="#fff" />
                        <Text style={[cs.libraryAddBtnText, { color: "#fff" }]}>Add</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* ══════════════════════════════════════
          GUIDE MODE
      ══════════════════════════════════════ */}
      {mode === "guide" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        >
          {!selectedPrayer ? (
            <PrayerSelector colors={colors} onSelect={(p) => setSelectedPrayer(p)} />
          ) : guideCompleted ? (
            <CompletionCard prayer={selectedPrayer} colors={colors} onRestart={handleGuideRestart} />
          ) : guideStep ? (
            <View style={gs.stepOuter}>
              {/* Step pills */}
              <View style={gs.stepPillRow}>
                {guideSteps.map((s, i) => (
                  <View
                    key={s.id}
                    style={[
                      gs.stepPill,
                      {
                        backgroundColor:
                          i < currentStep
                            ? colors.tint
                            : i === currentStep
                            ? colors.tint + "50"
                            : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>

              {guideStep.type === "count" ? (
                <CountStepCard
                  step={guideStep as CountStep}
                  count={guideCounts[guideStep.id] ?? 0}
                  colors={colors}
                  onCount={() => handleGuideCount(guideStep.id)}
                />
              ) : (
                <ReciteStepCard step={guideStep as ReciteStep} colors={colors} />
              )}

              {/* Next button — inline (not fixed), always visible */}
              <View style={gs.nextBtnArea}>
                {guideStep.type === "count" && (guideCounts[guideStep.id] ?? 0) < (guideStep as CountStep).target && (
                  <Text style={[gs.countHint, { color: colors.textSecondary }]}>
                    {(guideStep as CountStep).target - (guideCounts[guideStep.id] ?? 0)} remaining — tap the circle to count
                  </Text>
                )}
                <TouchableOpacity
                  onPress={handleGuideNext}
                  disabled={!canGoNext}
                  activeOpacity={0.8}
                  style={[
                    gs.nextBtn,
                    { backgroundColor: canGoNext ? colors.tint : colors.border },
                  ]}
                >
                  <Text style={[gs.nextBtnText, { color: canGoNext ? "#fff" : colors.textSecondary }]}>
                    {currentStep === guideSteps.length - 1 ? "Complete" : "Next"}
                  </Text>
                  <Feather
                    name={currentStep === guideSteps.length - 1 ? "check" : "arrow-right"}
                    size={18}
                    color={canGoNext ? "#fff" : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const cs = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { marginRight: 12 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  fullResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  fullResetText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  modeToggle: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeTabText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  progressBar: { height: 3, width: "100%" },
  progressBarFill: { height: 3, borderRadius: 2 },

  modeContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Counter
  dhikrSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  dhikrColorDot: { width: 10, height: 10, borderRadius: 5 },
  dhikrSelectorText: { flex: 1 },
  dhikrSelectorArabic: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  dhikrSelectorTranslation: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  dhikrList: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 8 },
  dhikrOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dhikrOptionText: { flex: 1 },
  dhikrOptionArabic: { fontSize: 16, marginBottom: 2 },
  dhikrOptionTranslit: { fontSize: 12, fontFamily: "Inter_400Regular" },

  counterArea: { flex: 1, alignItems: "center", gap: 14 },
  statsRow: { flexDirection: "row", gap: 10, width: "100%" },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 2 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },

  // Misbaha bead string
  beadArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: 220,
  },
  beadString: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    alignSelf: "center",
    opacity: 0.55,
  },
  beadGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.18,
  },
  beadColumn: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  beadCell: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  bead: {
    elevation: 0,
  },
  beadFadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    opacity: 0.88,
  },
  beadFadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    opacity: 0.88,
  },
  beadCompletion: {
    position: "absolute",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "rgba(76,175,125,0.92)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  // Glass count dock
  countDock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  dockSideBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    minWidth: 110,
    justifyContent: "center",
  },
  countPillNum: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    lineHeight: 34,
    fontVariant: ["tabular-nums"],
  },
  countPillDiv: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontVariant: ["tabular-nums"],
  },

  // Legacy (unused) — kept to avoid breaking external imports
  ringContainer: { width: 210, height: 210, alignItems: "center", justifyContent: "center", position: "relative" },
  ripple: { position: "absolute", width: 160, height: 160, borderRadius: 80 },
  counterBtn: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, alignItems: "center", justifyContent: "center", gap: 2 },
  countNumber: { fontSize: 52, fontFamily: "Inter_700Bold", lineHeight: 56 },
  countDivider: { fontSize: 14, fontFamily: "Inter_400Regular" },
  tapHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  completionOverlay: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(76,175,125,0.92)", alignItems: "center", justifyContent: "center", gap: 4 },
  completionCheck: { fontSize: 36, color: "#fff" },
  completionText: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  arabicDisplay: { fontSize: 26, textAlign: "center", lineHeight: 44 },
  translationDisplay: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: -8 },
  resetBtn: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  resetText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  // Header right row (+ button + Reset All)
  headerRightRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconHeaderBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },

  // Library modal
  libraryContainer: { flex: 1 },
  libraryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  libraryTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  librarySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  libraryCloseBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  libraryScroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  libraryItem: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
  },
  libraryColorBar: { width: 4, alignSelf: "stretch" },
  libraryItemBody: { flex: 1, padding: 14, gap: 3 },
  libraryArabic: { fontSize: 20, lineHeight: 34, textAlign: "left" },
  libraryTranslit: { fontSize: 13, fontFamily: "Inter_500Medium", fontStyle: "italic" },
  libraryMeaning: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  libraryMeta: { flexDirection: "row", gap: 6, marginTop: 6, alignItems: "center", flexWrap: "wrap" },
  libraryTargetPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1,
  },
  libraryTargetText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  libraryInListPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1,
  },
  libraryInListText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  libraryAddBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    marginRight: 12, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, minWidth: 72, justifyContent: "center",
  },
  libraryAddBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});

// Guide-specific styles
const gs = StyleSheet.create({
  stepOuter: { flex: 1 },
  stepPillRow: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 16, gap: 4, flexWrap: "wrap" },
  stepPill: { height: 4, flex: 1, borderRadius: 2, minWidth: 8 },

  // Prayer selector
  selectorContainer: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 16, gap: 4, alignItems: "center" },
  selectorTitle: { fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 6 },
  selectorSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 28 },
  prayerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", width: "100%", marginBottom: 28 },
  prayerBtn: { width: "44%", borderRadius: 16, borderWidth: 1.5, paddingVertical: 18, paddingHorizontal: 12, alignItems: "center", gap: 4 },
  prayerEmoji: { fontSize: 26, marginBottom: 4 },
  prayerBtnName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  prayerBtnArabic: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 2 },
  infoBox: { flexDirection: "row", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "flex-start", width: "100%" },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  // Count step
  countStepContainer: { alignItems: "center", paddingHorizontal: 24, paddingTop: 20, gap: 8 },
  stepTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase" },
  arabicText: { fontSize: 30, textAlign: "center", lineHeight: 50 },
  arabicLarge: { fontSize: 24, lineHeight: 42 },
  translitText: { fontSize: 16, fontFamily: "Inter_500Medium", fontStyle: "italic", textAlign: "center" },
  transText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  countCircle: { width: 180, height: 180, borderRadius: 90, alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 8, gap: 2 },
  countNumber: { fontSize: 52, fontFamily: "Inter_700Bold", lineHeight: 56 },
  countTarget: { fontSize: 16, fontFamily: "Inter_400Regular", lineHeight: 20 },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 4 },
  tapHintSmall: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4, opacity: 0.7 },
  progressTrack: { height: 4, width: "100%", borderRadius: 2, marginTop: 8 },
  progressFill: { height: 4, borderRadius: 2 },

  // Bead string in step card
  beadStepArea: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  beadStepString: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    alignSelf: "center",
    opacity: 0.55,
  },
  beadStepColumn: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  beadStepCell: {
    height: STEP_BEAD_SPACING,
    alignItems: "center",
    justifyContent: "center",
  },
  beadStepFadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    opacity: 0.92,
  },
  beadStepFadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    opacity: 0.92,
  },
  beadStepCountRow: {
    position: "absolute",
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  beadStepCount: { fontSize: 22, fontFamily: "Inter_700Bold", fontVariant: ["tabular-nums"] },
  beadStepCountDiv: { fontSize: 14, fontFamily: "Inter_400Regular", fontVariant: ["tabular-nums"] },
  beadStepDoneDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  beadStepHint: {
    position: "absolute",
    top: 12,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
    textTransform: "uppercase",
    opacity: 0.6,
  },

  // Recite step
  reciteContainer: { paddingHorizontal: 24, paddingTop: 20, gap: 12, alignItems: "center" },
  sourcePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  sourcePillText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  noteBox: { flexDirection: "row", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "flex-start", width: "100%", marginTop: 4 },
  noteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  // Next button — inline in scroll
  nextBtnArea: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8, gap: 8, alignItems: "center" },
  countHint: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16, width: "100%" },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },

  // Completion
  completionContainer: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 40, gap: 12 },
  completionEmoji: { fontSize: 52 },
  completionTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  completionSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24 },
  closingDuaBox: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 20, gap: 8, alignItems: "center", marginTop: 8 },
  closingDuaArabic: { fontSize: 20, textAlign: "center", lineHeight: 36 },
  closingDuaTranslit: { fontSize: 13, fontFamily: "Inter_500Medium", fontStyle: "italic", textAlign: "center" },
  closingDuaTrans: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  restartBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  restartBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
