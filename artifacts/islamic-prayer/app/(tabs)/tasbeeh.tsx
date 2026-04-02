import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Circle, Svg } from "react-native-svg";
import {
  Animated,
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
    target: 33,
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

  const handleTap = useCallback(() => {
    if (count >= step.target) return;
    onCount();
    if (Platform.OS !== "web") Vibration.vibrate(18);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 70, useNativeDriver: false }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
    ]).start();
  }, [count, step.target, onCount, scaleAnim]);

  const pct = Math.min(count / step.target, 1);
  const done = count >= step.target;

  return (
    <View style={gs.countStepContainer}>
      <Text style={[gs.stepTitle, { color: colors.textSecondary }]}>{step.title}</Text>
      <Text style={[gs.arabicText, { color: colors.text }]}>{step.arabic}</Text>
      <Text style={[gs.translitText, { color: colors.tint }]}>{step.transliteration}</Text>
      <Text style={[gs.transText, { color: colors.textSecondary }]}>{step.translation}</Text>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handleTap}
          activeOpacity={0.85}
          disabled={done}
          style={[
            gs.countCircle,
            {
              backgroundColor: done ? step.color + "22" : step.color + "18",
              borderColor: done ? step.color : step.color + "55",
              borderWidth: done ? 2 : 1.5,
            },
          ]}
        >
          <Text style={[gs.countNumber, { color: done ? step.color : colors.text }]}>{count}</Text>
          <Text style={[gs.countTarget, { color: colors.textSecondary }]}>/ {step.target}</Text>
          {done ? (
            <View style={[gs.doneBadge, { backgroundColor: step.color }]}>
              <Feather name="check" size={13} color="#fff" />
            </View>
          ) : (
            <Text style={[gs.tapHintSmall, { color: colors.textSecondary }]}>tap to count</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <View style={[gs.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[gs.progressFill, { backgroundColor: step.color, width: `${pct * 100}%` as any }]} />
      </View>
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

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  // ── Guide state ──
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [guideCounts, setGuideCounts] = useState<Record<string, number>>({});
  const [guideCompleted, setGuideCompleted] = useState(false);

  // ── Counter handlers ──
  const progress = selectedDhikr.target > 0 ? Math.min(count / selectedDhikr.target, 1) : 0;

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

  // ── SVG ring (counter) ──
  const RING_SIZE = 210;
  const RING_RADIUS = 97;
  const RING_STROKE = 6;
  const circumference = 2 * Math.PI * RING_RADIUS;
  const strokeDashoffset = circumference * (1 - progress);

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
            <TouchableOpacity
              style={[cs.fullResetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleFullReset}
            >
              <Feather name="refresh-cw" size={14} color={colors.textSecondary} />
              <Text style={[cs.fullResetText, { color: colors.textSecondary }]}>Reset All</Text>
            </TouchableOpacity>
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
              {DHIKR_PRESETS.map((dhikr) => (
                <Pressable
                  key={dhikr.id}
                  style={[
                    cs.dhikrOption,
                    {
                      backgroundColor: selectedDhikr.id === dhikr.id ? colors.surfaceElevated : "transparent",
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => selectDhikr(dhikr)}
                >
                  <View style={[cs.dhikrColorDot, { backgroundColor: dhikr.color }]} />
                  <View style={cs.dhikrOptionText}>
                    <Text style={[cs.dhikrOptionArabic, { color: colors.text }]}>{dhikr.arabic}</Text>
                    <Text style={[cs.dhikrOptionTranslit, { color: colors.textSecondary }]}>
                      {dhikr.transliteration} · {dhikr.target}×
                    </Text>
                  </View>
                  {selectedDhikr.id === dhikr.id && (
                    <Feather name="check" size={16} color={dhikr.color} />
                  )}
                </Pressable>
              ))}
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

            <View style={cs.ringContainer}>
              <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFillObject}>
                <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} stroke={colors.border} strokeWidth={RING_STROKE} fill="none" />
                <Circle
                  cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
                  stroke={selectedDhikr.color} strokeWidth={RING_STROKE} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                  opacity={progress > 0 ? 1 : 0}
                />
              </Svg>

              <Animated.View style={[cs.ripple, { backgroundColor: selectedDhikr.color, transform: [{ scale: rippleScale }], opacity: rippleOpacity }]} />

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                  style={[cs.counterBtn, { backgroundColor: selectedDhikr.color + "20", borderColor: selectedDhikr.color + "60" }]}
                  onPress={handleCount}
                >
                  <Text style={[cs.countNumber, { color: colors.text }]}>{count}</Text>
                  <Text style={[cs.countDivider, { color: colors.textSecondary }]}>/ {selectedDhikr.target}</Text>
                  <Text style={[cs.tapHint, { color: colors.textSecondary }]}>Tap to count</Text>
                </Pressable>
              </Animated.View>

              {justCompleted && (
                <Animated.View style={[cs.completionOverlay, { opacity: completionOpacity, transform: [{ scale: completionScale }] }]}>
                  <Text style={cs.completionCheck}>✓</Text>
                  <Text style={[cs.completionText, { color: "#fff" }]}>Round {rounds} complete!</Text>
                </Animated.View>
              )}
            </View>

            <Text style={[cs.arabicDisplay, { color: colors.text }]}>{selectedDhikr.arabic}</Text>
            <Text style={[cs.translationDisplay, { color: colors.textSecondary }]}>{selectedDhikr.translation}</Text>

            <TouchableOpacity
              style={[cs.resetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleReset}
            >
              <Feather name="rotate-ccw" size={15} color={colors.textSecondary} />
              <Text style={[cs.resetText, { color: colors.textSecondary }]}>Reset Count</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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

  counterArea: { flex: 1, alignItems: "center", gap: 16 },
  statsRow: { flexDirection: "row", gap: 10, width: "100%" },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 2 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
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
});

// Guide-specific styles
const gs = StyleSheet.create({
  stepOuter: { flex: 1 },
  stepPillRow: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 16, gap: 4, flexWrap: "wrap" },
  stepPill: { height: 4, flex: 1, borderRadius: 2, minWidth: 8 },

  // Prayer selector
  selectorContainer: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 16, gap: 4, alignItems: "center" },
  selectorTitle: { fontSize: 28, fontFamily: "Amiri_700Bold", textAlign: "center", marginBottom: 6 },
  selectorSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 28 },
  prayerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", width: "100%", marginBottom: 28 },
  prayerBtn: { width: "44%", borderRadius: 16, borderWidth: 1.5, paddingVertical: 18, paddingHorizontal: 12, alignItems: "center", gap: 4 },
  prayerEmoji: { fontSize: 26, marginBottom: 4 },
  prayerBtnName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  prayerBtnArabic: { fontSize: 14, fontFamily: "Amiri_400Regular", marginTop: 2 },
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
  completionTitle: { fontSize: 26, fontFamily: "Amiri_700Bold", textAlign: "center" },
  completionSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24 },
  closingDuaBox: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 20, gap: 8, alignItems: "center", marginTop: 8 },
  closingDuaArabic: { fontSize: 20, textAlign: "center", lineHeight: 36 },
  closingDuaTranslit: { fontSize: 13, fontFamily: "Inter_500Medium", fontStyle: "italic", textAlign: "center" },
  closingDuaTrans: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  restartBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  restartBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
