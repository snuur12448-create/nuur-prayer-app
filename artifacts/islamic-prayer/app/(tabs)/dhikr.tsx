import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
// Types
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

type DhikrStep = ReciteStep | CountStep;

// ─────────────────────────────────────────────
// Dhikr data
// ─────────────────────────────────────────────

const CORE_STEPS: DhikrStep[] = [
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

function buildSteps(prayer: PrayerName): DhikrStep[] {
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

  return [...CORE_STEPS, ...surahSteps];
}

// ─────────────────────────────────────────────
// Prayer selector screen
// ─────────────────────────────────────────────

const PRAYERS: { name: PrayerName; arabic: string; emoji: string; color: string }[] = [
  { name: "Fajr",    arabic: "الفجر",    emoji: "🌙", color: "#4A6FA5" },
  { name: "Dhuhr",   arabic: "الظهر",   emoji: "☀️", color: "#C9933A" },
  { name: "Asr",     arabic: "العصر",    emoji: "🌤", color: "#6BAF92" },
  { name: "Maghrib", arabic: "المغرب", emoji: "🌆", color: "#E07840" },
  { name: "Isha",    arabic: "العشاء",   emoji: "🌃", color: "#9C88D4" },
];

function PrayerSelector({
  colors,
  onSelect,
}: {
  colors: any;
  onSelect: (p: PrayerName) => void;
}) {
  return (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorTitle, { color: colors.text }]}>
        أذكار بعد الصلاة
      </Text>
      <Text style={[styles.selectorSubtitle, { color: colors.textSecondary }]}>
        Which prayer did you just complete?
      </Text>

      <View style={styles.prayerGrid}>
        {PRAYERS.map((p) => (
          <TouchableOpacity
            key={p.name}
            onPress={() => onSelect(p.name)}
            style={[
              styles.prayerBtn,
              {
                backgroundColor: p.color + "18",
                borderColor: p.color + "55",
              },
            ]}
            activeOpacity={0.75}
          >
            <Text style={styles.prayerEmoji}>{p.emoji}</Text>
            <Text style={[styles.prayerBtnName, { color: p.color }]}>{p.name}</Text>
            <Text style={[styles.prayerBtnArabic, { color: colors.textSecondary }]}>
              {p.arabic}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.tint + "0C", borderColor: colors.tint + "30" }]}>
        <MaterialCommunityIcons name="information-outline" size={14} color={colors.tint} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Al-Ikhlāṣ, al-Falaq, and al-Nās are recited 3× after Fajr and Maghrib, and 1× after the remaining prayers.
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Count step component
// ─────────────────────────────────────────────

function CountStepView({
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
    <View style={styles.countStepContainer}>
      <Text style={[styles.stepTitle, { color: colors.textSecondary }]}>{step.title}</Text>

      <Text style={[styles.arabicText, { color: colors.text }]}>{step.arabic}</Text>
      <Text style={[styles.translitText, { color: colors.tint }]}>{step.transliteration}</Text>
      <Text style={[styles.transText, { color: colors.textSecondary }]}>{step.translation}</Text>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handleTap}
          activeOpacity={0.85}
          disabled={done}
          style={[
            styles.countCircle,
            {
              backgroundColor: done ? step.color + "22" : step.color + "18",
              borderColor: done ? step.color : step.color + "55",
              borderWidth: done ? 2 : 1.5,
            },
          ]}
        >
          <Text style={[styles.countNumber, { color: done ? step.color : colors.text }]}>
            {count}
          </Text>
          <Text style={[styles.countTarget, { color: colors.textSecondary }]}>
            / {step.target}
          </Text>
          {done ? (
            <View style={[styles.doneBadge, { backgroundColor: step.color }]}>
              <Feather name="check" size={13} color="#fff" />
            </View>
          ) : (
            <Text style={[styles.tapHint, { color: colors.textSecondary }]}>tap to count</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: step.color,
              width: `${pct * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Recite step component
// ─────────────────────────────────────────────

function ReciteStepView({ step, colors }: { step: ReciteStep; colors: any }) {
  return (
    <ScrollView
      style={styles.reciteScroll}
      contentContainerStyle={styles.reciteContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.stepTitle, { color: colors.textSecondary }]}>
        {step.title}
      </Text>

      {step.source && (
        <View style={[styles.sourcePill, { backgroundColor: colors.gold + "18", borderColor: colors.gold + "44" }]}>
          <Feather name="book" size={10} color={colors.gold} />
          <Text style={[styles.sourcePillText, { color: colors.gold }]}>{step.source}</Text>
        </View>
      )}

      <Text style={[styles.arabicText, styles.arabicRecite, { color: colors.text }]}>
        {step.arabic}
      </Text>

      {step.transliteration && (
        <Text style={[styles.translitText, styles.translitRecite, { color: colors.tint }]}>
          {step.transliteration}
        </Text>
      )}

      <Text style={[styles.transText, styles.transRecite, { color: colors.textSecondary }]}>
        {step.translation}
      </Text>

      {step.note && (
        <View style={[styles.noteBox, { backgroundColor: colors.tint + "0C", borderColor: colors.tint + "30" }]}>
          <MaterialCommunityIcons name="information-outline" size={13} color={colors.tint} />
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>{step.note}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// Completion screen
// ─────────────────────────────────────────────

function CompletionView({ prayer, colors, onRestart }: { prayer: PrayerName; colors: any; onRestart: () => void }) {
  return (
    <View style={styles.completionContainer}>
      <Text style={styles.completionEmoji}>✨</Text>
      <Text style={[styles.completionTitle, { color: colors.text }]}>
        Mā Shā Allāh
      </Text>
      <Text style={[styles.completionSubtitle, { color: colors.textSecondary }]}>
        You have completed the post-{prayer} adhkār
      </Text>

      <View style={[styles.closingDuaBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.closingDuaArabic, { color: colors.text }]}>
          رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
        </Text>
        <Text style={[styles.closingDuaTranslit, { color: colors.tint }]}>
          Rabbana taqabbal minna, innaka anta al-Samī' al-'Alīm
        </Text>
        <Text style={[styles.closingDuaTrans, { color: colors.textSecondary }]}>
          Our Lord, accept from us. Indeed, You are the All-Hearing, the All-Knowing.
        </Text>
      </View>

      <TouchableOpacity
        onPress={onRestart}
        style={[styles.restartBtn, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "44" }]}
        activeOpacity={0.75}
      >
        <Feather name="refresh-ccw" size={15} color={colors.tint} />
        <Text style={[styles.restartBtnText, { color: colors.tint }]}>Start Again</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────

export default function DhikrGuideScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const miniPlayerH = useMiniPlayerHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);

  const steps = selectedPrayer ? buildSteps(selectedPrayer) : [];
  const step = steps[currentStep];

  const handleCount = useCallback((stepId: string) => {
    setCounts((prev) => {
      const next = (prev[stepId] ?? 0) + 1;
      return { ...prev, [stepId]: next };
    });
  }, []);

  const canAdvance = () => {
    if (!step) return false;
    if (step.type === "count") {
      return (counts[step.id] ?? 0) >= step.target;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setSelectedPrayer(null);
    setCurrentStep(0);
    setCounts({});
    setCompleted(false);
  };

  const progressPct = steps.length > 0 ? (currentStep / steps.length) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            if (selectedPrayer && !completed) {
              handleRestart();
            } else {
              router.navigate("/(tabs)/more");
            }
          }}
          style={styles.backBtn}
          hitSlop={10}
        >
          <Feather name="chevron-left" size={24} color={colors.tint} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {selectedPrayer ? `After ${selectedPrayer}` : "Post-Prayer Dhikr"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {selectedPrayer
              ? `Step ${currentStep + 1} of ${steps.length}`
              : "أذكار بعد الصلاة"}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar (shown when guide is active) */}
      {selectedPrayer && !completed && (
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              { backgroundColor: colors.tint, width: `${progressPct * 100}%` },
            ]}
          />
        </View>
      )}

      {/* Content */}
      <View style={[styles.content, { paddingBottom: insets.bottom + miniPlayerH + 80 }]}>
        {!selectedPrayer ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <PrayerSelector colors={colors} onSelect={(p) => setSelectedPrayer(p)} />
          </ScrollView>
        ) : completed ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <CompletionView prayer={selectedPrayer} colors={colors} onRestart={handleRestart} />
          </ScrollView>
        ) : step ? (
          <View style={styles.stepWrapper}>
            {/* Step pill row */}
            <View style={styles.stepPillRow}>
              {steps.map((s, i) => (
                <View
                  key={s.id}
                  style={[
                    styles.stepPill,
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

            {step.type === "count" ? (
              <View style={styles.countWrapper}>
                <CountStepView
                  step={step}
                  count={counts[step.id] ?? 0}
                  colors={colors}
                  onCount={() => handleCount(step.id)}
                />
              </View>
            ) : (
              <ReciteStepView step={step} colors={colors} />
            )}
          </View>
        ) : null}
      </View>

      {/* Next button (shown when guide is active and not completed) */}
      {selectedPrayer && !completed && step && (
        <View
          style={[
            styles.nextBtnContainer,
            {
              paddingBottom: insets.bottom + miniPlayerH + 16,
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          {step.type === "count" && (counts[step.id] ?? 0) < step.target && (
            <Text style={[styles.countHint, { color: colors.textSecondary }]}>
              {(step as CountStep).target - (counts[step.id] ?? 0)} remaining
            </Text>
          )}
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canAdvance()}
            activeOpacity={0.8}
            style={[
              styles.nextBtn,
              {
                backgroundColor: canAdvance() ? colors.tint : colors.border,
              },
            ]}
          >
            <Text style={[styles.nextBtnText, { color: canAdvance() ? "#fff" : colors.textSecondary }]}>
              {currentStep === steps.length - 1 ? "Complete" : "Next"}
            </Text>
            <Feather
              name={currentStep === steps.length - 1 ? "check" : "arrow-right"}
              size={18}
              color={canAdvance() ? "#fff" : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  progressBar: {
    height: 3,
    width: "100%",
  },
  progressBarFill: {
    height: 3,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },

  // ── Selector ──
  selectorContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    gap: 4,
    alignItems: "center",
  },
  selectorTitle: {
    fontSize: 28,
    fontFamily: "Amiri_700Bold",
    textAlign: "center",
    marginBottom: 6,
  },
  selectorSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 28,
  },
  prayerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    width: "100%",
    marginBottom: 28,
  },
  prayerBtn: {
    width: "44%",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 4,
  },
  prayerEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  prayerBtnName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  prayerBtnArabic: {
    fontSize: 14,
    fontFamily: "Amiri_400Regular",
    marginTop: 2,
  },
  infoBox: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "flex-start",
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },

  // ── Step wrapper ──
  stepWrapper: {
    flex: 1,
  },
  stepPillRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 4,
    flexWrap: "wrap",
  },
  stepPill: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    minWidth: 8,
  },

  // ── Count step ──
  countWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  countStepContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 8,
  },
  countCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 8,
    gap: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  countNumber: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    lineHeight: 56,
  },
  countTarget: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  tapHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    opacity: 0.7,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: "75%",
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },

  // ── Recite step ──
  reciteScroll: {
    flex: 1,
  },
  reciteContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
    alignItems: "center",
  },
  sourcePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  sourcePillText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  noteBox: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "flex-start",
    width: "100%",
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },

  // ── Shared text ──
  stepTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 4,
  },
  arabicText: {
    fontSize: 26,
    fontFamily: "Amiri_700Bold",
    textAlign: "center",
    lineHeight: 44,
  },
  arabicRecite: {
    fontSize: 22,
    lineHeight: 38,
  },
  translitText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    fontStyle: "italic",
  },
  translitRecite: {
    fontSize: 13,
  },
  transText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  transRecite: {
    lineHeight: 24,
  },

  // ── Completion ──
  completionContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 40,
    gap: 12,
  },
  completionEmoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  completionTitle: {
    fontSize: 30,
    fontFamily: "Amiri_700Bold",
    textAlign: "center",
  },
  completionSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 16,
  },
  closingDuaBox: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 10,
    alignItems: "center",
  },
  closingDuaArabic: {
    fontSize: 22,
    fontFamily: "Amiri_700Bold",
    textAlign: "center",
    lineHeight: 36,
  },
  closingDuaTranslit: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    fontStyle: "italic",
  },
  closingDuaTrans: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  restartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  restartBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },

  // ── Next button ──
  nextBtnContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
    alignItems: "center",
  },
  countHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
