import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { router } from "expo-router";

interface GuideStep {
  number: number;
  title: string;
  arabic?: string;
  description: string;
  tip?: string;
  dua?: string;
  duaTranslation?: string;
}

const WUDHU_STEPS: GuideStep[] = [
  {
    number: 1,
    title: "Make Intention (Niyyah)",
    arabic: "نِيَّة",
    description: "Make an internal intention in your heart to perform wudhu for the purpose of worship and prayer. The niyyah does not need to be spoken aloud.",
    tip: "Intention is the foundation — your action gains its reward through sincerity.",
  },
  {
    number: 2,
    title: "Say Bismillah",
    arabic: "بِسْمِ اللَّهِ",
    description: "Begin by saying 'Bismillah' (In the name of Allah). This is a confirmed Sunnah of the Prophet ﷺ before starting wudhu.",
    dua: "بِسْمِ اللَّهِ",
    duaTranslation: "In the name of Allah",
  },
  {
    number: 3,
    title: "Wash Hands",
    arabic: "غَسْلُ الْيَدَيْنِ",
    description: "Wash both hands up to and including the wrists three times, making sure water reaches between the fingers. Start with the right hand, then the left.",
    tip: "Ensure water passes between your fingers each time.",
  },
  {
    number: 4,
    title: "Rinse Mouth (Madmadah)",
    arabic: "الْمَضْمَضَة",
    description: "Take water into your mouth, swirl it around thoroughly, and spit it out. Do this three times.",
    tip: "Use your right hand to take water to your mouth.",
  },
  {
    number: 5,
    title: "Rinse Nose (Istinshaq)",
    arabic: "الاسْتِنْشَاق",
    description: "Sniff water gently into your nostrils using your right hand, then blow it out with your left hand. Do this three times.",
    tip: "During fasting, sniff gently to avoid water reaching the throat.",
  },
  {
    number: 6,
    title: "Wash Face",
    arabic: "غَسْلُ الْوَجْهِ",
    description: "Wash your entire face from the hairline to the chin, and from ear to ear. Do this three times, ensuring no part is left dry.",
    tip: "If you have a beard, pass wet fingers through it (khilal) on the third wash.",
  },
  {
    number: 7,
    title: "Wash Arms to Elbows",
    arabic: "غَسْلُ الذِّرَاعَيْنِ",
    description: "Wash your right arm from fingertips to and including the elbow three times, then repeat with the left arm. Make sure no dry patch is left.",
    tip: "Always start with the right side — this is the Sunnah in all acts of purity.",
  },
  {
    number: 8,
    title: "Wipe Head (Masah)",
    arabic: "مَسْحُ الرَّأْسِ",
    description: "Wet your hands and wipe over your entire head once — from the front hairline to the back of the neck and back again. This is done once, not three times.",
    tip: "Use both hands together and go from front to back, then back to front.",
  },
  {
    number: 9,
    title: "Wipe Ears",
    arabic: "مَسْحُ الأُذُنَيْنِ",
    description: "Using the same moisture from the head wipe, insert both index fingers into your ear canals and use your thumbs to wipe the outer ear. Do this once.",
  },
  {
    number: 10,
    title: "Wash Feet to Ankles",
    arabic: "غَسْلُ الْقَدَمَيْنِ",
    description: "Wash your right foot up to and including the ankle three times, passing water between your toes. Then wash the left foot the same way.",
    tip: "Use your left hand's little finger to pass water between the toes (khilal al-asabi').",
  },
  {
    number: 11,
    title: "Dua After Wudhu",
    arabic: "دُعَاءُ الطُّهُورِ",
    description: "After completing wudhu, face the qiblah and recite the following dua. It is narrated that whoever says it will have all eight gates of Paradise opened for them.",
    dua: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّداً عَبْدُهُ وَرَسُولُهُ",
    duaTranslation: "I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and messenger.",
  },
];

const PRAYER_STEPS: GuideStep[] = [
  {
    number: 1,
    title: "Make Wudhu",
    arabic: "الطَّهَارَة",
    description: "Ensure you are in a state of purity. Perform wudhu if needed. Prayer is not accepted without purity.",
    tip: "Check the Wudhu guide tab if you are unsure of the steps.",
  },
  {
    number: 2,
    title: "Face the Qiblah",
    arabic: "اسْتِقْبَالُ الْقِبْلَة",
    description: "Stand facing the direction of the Ka'bah in Makkah. Use the Qibla compass in this app to find the correct direction.",
    tip: "Place a clean prayer mat and ensure your place of prayer is free of impurities.",
  },
  {
    number: 3,
    title: "Make Intention (Niyyah)",
    arabic: "نِيَّة",
    description: "Make the intention in your heart for the specific prayer you are about to perform (e.g., 'I intend to pray two raka'ah of Fajr prayer'). The intention does not need to be spoken aloud.",
  },
  {
    number: 4,
    title: "Takbir al-Ihram",
    arabic: "تَكْبِيرَةُ الإِحْرَام",
    description: "Raise both hands to ear level (palms facing forward) and say 'Allahu Akbar' (Allah is the Greatest). This marks the official beginning of the prayer.",
    dua: "اللَّهُ أَكْبَر",
    duaTranslation: "Allah is the Greatest",
    tip: "After the takbir, place your right hand over your left hand on your chest.",
  },
  {
    number: 5,
    title: "Opening Dua & Al-Fatihah",
    arabic: "الاسْتِفْتَاح وَالْفَاتِحَة",
    description: "Recite the opening supplication (Subhanakal-Lahumma wa bihamdik), then recite Surah Al-Fatihah. After Al-Fatihah, say 'Ameen' aloud (audibly or silently, according to madhab).",
    dua: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    duaTranslation: "Begin Surah Al-Fatihah with Bismillah",
    tip: "Reciting Al-Fatihah is a pillar (rukn) of the prayer — it is obligatory in every raka'ah.",
  },
  {
    number: 6,
    title: "Recite a Surah or Verses",
    arabic: "قِرَاءَةُ السُّورَة",
    description: "After Al-Fatihah in the first two raka'ahs, recite any surah or a minimum of three verses from the Quran. Common choices include Al-Ikhlas, Al-Falaq, An-Nas, or Al-Kawthar.",
    tip: "Recitation is done aloud in Fajr, Maghrib and Isha (for the imam), and silently in Dhuhr and Asr.",
  },
  {
    number: 7,
    title: "Ruku (Bowing)",
    arabic: "الرُّكُوع",
    description: "Say 'Allahu Akbar' and bow from the waist, placing both hands on your knees with fingers spread. Your back should be flat and parallel to the ground.",
    dua: "سُبْحَانَ رَبِّيَ الْعَظِيم",
    duaTranslation: "Glory be to my Lord, the Magnificent (×3)",
  },
  {
    number: 8,
    title: "Rising from Ruku (I'tidal)",
    arabic: "الاعْتِدَال",
    description: "Rise from ruku saying 'Sami'a Allahu liman hamidah' (Allah hears those who praise Him). When fully upright, say 'Rabbana wa lakal-hamd'.",
    dua: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ · رَبَّنَا وَلَكَ الْحَمْد",
    duaTranslation: "Allah hears those who praise Him · Our Lord, and to You is the praise",
  },
  {
    number: 9,
    title: "First Sujud (Prostration)",
    arabic: "السُّجُودُ الأَوَّل",
    description: "Say 'Allahu Akbar' and go into prostration. Place your forehead, nose, both palms, both knees, and the balls of both feet on the ground (seven limbs).",
    dua: "سُبْحَانَ رَبِّيَ الأَعْلَى",
    duaTranslation: "Glory be to my Lord, the Most High (×3)",
    tip: "Your elbows should be raised off the ground. Keep your gaze at the point of prostration.",
  },
  {
    number: 10,
    title: "Sitting between Sajdahs (Jalsa)",
    arabic: "الْجَلْسَة",
    description: "Rise from sujud saying 'Allahu Akbar' and sit upright briefly. Say 'Rabbighfir li' (My Lord, forgive me). Then go into the second sujud.",
    dua: "رَبِّ اغْفِرْ لِي",
    duaTranslation: "My Lord, forgive me",
  },
  {
    number: 11,
    title: "Second Sujud",
    arabic: "السُّجُودُ الثَّانِي",
    description: "Perform the second prostration exactly like the first, saying 'Subhana Rabbiyal-A'la' three times. This completes one raka'ah.",
    dua: "سُبْحَانَ رَبِّيَ الأَعْلَى",
    duaTranslation: "Glory be to my Lord, the Most High (×3)",
  },
  {
    number: 12,
    title: "Tashahhud",
    arabic: "التَّشَهُّد",
    description: "After the second raka'ah (and the final raka'ah of longer prayers), sit and recite the Tashahhud. In the final sitting, add the Salawat (Ibrahimiyyah) and duas.",
    dua: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ",
    duaTranslation: "All greetings, prayers and goodness are for Allah. Peace be upon you, O Prophet, and the mercy and blessings of Allah…",
    tip: "Raise your index finger when saying 'Ash-hadu an la ilaha illallah' and keep it raised until salaam.",
  },
  {
    number: 13,
    title: "Tasleem (Salutation)",
    arabic: "التَّسْلِيم",
    description: "End the prayer by turning your head to the right and saying 'As-salamu alaykum wa rahmatullah', then to the left and repeating. This marks the official end of the prayer.",
    dua: "السَّلامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    duaTranslation: "Peace and mercy of Allah be upon you",
    tip: "After salaam, it is Sunnah to recite Astaghfirullah ×3, then the post-prayer adhkar.",
  },
];

type Tab = "wudhu" | "prayer";

export default function GuideScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;
  const [activeTab, setActiveTab] = useState<Tab>("wudhu");

  const steps = activeTab === "wudhu" ? WUDHU_STEPS : PRAYER_STEPS;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.prayerCard, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Feather name="chevron-left" size={24} color={colors.tint} />
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {activeTab === "wudhu" ? "Wudhu Guide" : "How to Pray"}
          </Text>
          <Text style={[styles.headerArabic, { color: colors.tint }]}>
            {activeTab === "wudhu" ? "دَلِيلُ الْوُضُوء" : "كَيْفِيَّةُ الصَّلَاة"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {activeTab === "wudhu"
              ? `${WUDHU_STEPS.length} steps · Following the Sunnah of the Prophet ﷺ`
              : `${PRAYER_STEPS.length} steps · Step-by-step Salah guide`}
          </Text>
        </View>

        {/* Tab switcher */}
        <View style={[styles.tabRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(["wudhu", "prayer"] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabBtn,
                activeTab === tab && { backgroundColor: colors.tint },
              ]}
            >
              <Text style={[
                styles.tabBtnText,
                { color: activeTab === tab ? "#fff" : colors.textSecondary },
              ]}>
                {tab === "wudhu" ? "🌊 Wudhu" : "🕌 Prayer"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Steps list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {steps.map((step, idx) => (
          <StepCard
            key={`${activeTab}-${step.number}`}
            step={step}
            isLast={idx === steps.length - 1}
            colors={colors}
          />
        ))}

        {/* Bottom note */}
        <View style={[styles.noteCard, { backgroundColor: colors.prayerCard, borderColor: colors.gold + "55" }]}>
          <View style={[styles.noteAccent, { backgroundColor: colors.gold }]} />
          <View style={styles.noteInner}>
            <Text style={[styles.noteTitle, { color: colors.gold }]}>
              {activeTab === "wudhu" ? "What Breaks Wudhu?" : "Common Mistakes to Avoid"}
            </Text>
            {activeTab === "wudhu" ? (
              <>
                <NoteItem colors={colors} text="Using the toilet (passing wind, urine, or stool)" />
                <NoteItem colors={colors} text="Deep sleep (lying down or unconscious)" />
                <NoteItem colors={colors} text="Loss of consciousness or intoxication" />
                <NoteItem colors={colors} text="Touching private parts directly (according to some scholars)" />
                <NoteItem colors={colors} text="Eating camel meat (according to some madhabs)" />
              </>
            ) : (
              <>
                <NoteItem colors={colors} text="Forgetting to recite Al-Fatihah in a raka'ah (it is a pillar)" />
                <NoteItem colors={colors} text="Not completing the seven prostration limbs in sujud" />
                <NoteItem colors={colors} text="Rushing through ruku or sujud without being still (tuma'ninah)" />
                <NoteItem colors={colors} text="Talking or laughing during prayer — it invalidates it" />
                <NoteItem colors={colors} text="Performing actions outside of prayer (eating, drinking) invalidates it" />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function NoteItem({ text, colors }: { text: string; colors: any }) {
  return (
    <View style={styles.noteItem}>
      <View style={[styles.noteDot, { backgroundColor: colors.gold }]} />
      <Text style={[styles.noteItemText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

function StepCard({ step, isLast, colors }: { step: GuideStep; isLast: boolean; colors: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.stepRow}>
      {/* Timeline */}
      <View style={styles.timeline}>
        <View style={[styles.stepBubble, { backgroundColor: colors.tint }]}>
          <Text style={styles.stepNum}>{step.number}</Text>
        </View>
        {!isLast && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
      </View>

      {/* Card */}
      <Pressable
        style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setExpanded((v) => !v)}
      >
        <View style={styles.stepCardHeader}>
          <View style={styles.stepTitleBlock}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
            {step.arabic && (
              <Text style={[styles.stepArabicLabel, { color: colors.tint }]}>{step.arabic}</Text>
            )}
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textSecondary}
          />
        </View>

        {/* Always visible: short description excerpt */}
        <Text
          style={[styles.stepDesc, { color: colors.textSecondary }]}
          numberOfLines={expanded ? undefined : 2}
        >
          {step.description}
        </Text>

        {expanded && (
          <View style={styles.stepExtra}>
            {step.dua && (
              <View style={[styles.duaBox, { backgroundColor: colors.prayerCard, borderColor: colors.tint + "44" }]}>
                <Text style={[styles.duaArabic, { color: colors.text }]}>{step.dua}</Text>
                <Text style={[styles.duaTranslation, { color: colors.textSecondary }]}>{step.duaTranslation}</Text>
              </View>
            )}
            {step.tip && (
              <View style={[styles.tipRow, { backgroundColor: colors.gold + "14", borderColor: colors.gold + "44" }]}>
                <Feather name="info" size={13} color={colors.gold} style={{ marginTop: 1 }} />
                <Text style={[styles.tipText, { color: colors.gold }]}>{step.tip}</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  headerContent: { gap: 2 },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  headerArabic: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  tabRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginTop: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  tabBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 0,
  },

  stepRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },

  timeline: {
    alignItems: "center",
    width: 32,
  },
  stepBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNum: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: 4,
    minHeight: 16,
    borderRadius: 1,
  },

  stepCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  stepCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  stepTitleBlock: { flex: 1, gap: 2 },
  stepTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  stepArabicLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  stepDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },

  stepExtra: { gap: 8, marginTop: 4 },

  duaBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  duaArabic: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    lineHeight: 30,
  },
  duaTranslation: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 18,
  },

  tipRow: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
  },

  noteCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 8,
  },
  noteAccent: { width: 4 },
  noteInner: { flex: 1, padding: 16, gap: 10 },
  noteTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  noteItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  noteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  noteItemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
