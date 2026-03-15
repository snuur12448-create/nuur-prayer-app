import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";

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

export default function TasbeehScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [selectedDhikr, setSelectedDhikr] = useState<DhikrPreset>(DHIKR_PRESETS[0]);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [showSelector, setShowSelector] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const progress = selectedDhikr.target > 0 ? Math.min(count / selectedDhikr.target, 1) : 0;

  const handleCount = useCallback(() => {
    // Haptic feedback on mobile
    if (Platform.OS !== "web") {
      Vibration.vibrate(30);
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: false }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
    ]).start();

    // Ripple
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();

    setCount((prev) => {
      const next = prev + 1;
      if (next >= selectedDhikr.target) {
        // Completed a round
        setRounds((r) => r + 1);
        setJustCompleted(true);
        Animated.sequence([
          Animated.timing(completionAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.delay(1200),
          Animated.timing(completionAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]).start(() => setJustCompleted(false));
        setTotalCount((t) => t + 1);
        return 0;
      }
      setTotalCount((t) => t + 1);
      return next;
    });
  }, [selectedDhikr.target, scaleAnim, completionAnim, rippleAnim]);

  const handleReset = () => {
    setCount(0);
  };

  const handleFullReset = () => {
    setCount(0);
    setTotalCount(0);
    setRounds(0);
  };

  const selectDhikr = (dhikr: DhikrPreset) => {
    setSelectedDhikr(dhikr);
    setCount(0);
    setRounds(0);
    setShowSelector(false);
  };

  // Arc path for progress ring
  const size = 240;
  const cx = size / 2;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const completionScale = completionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const completionOpacity = completionAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.3, 0.1, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>التسبيح</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Tasbeeh Counter
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.fullResetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleFullReset}
          >
            <Feather name="refresh-cw" size={14} color={colors.textSecondary} />
            <Text style={[styles.fullResetText, { color: colors.textSecondary }]}>Reset All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.content, { paddingBottom: isWeb ? 34 + 84 : 100 + insets.bottom }]}>
        {/* Dhikr selector */}
        <Pressable
          style={[styles.dhikrSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowSelector(!showSelector)}
        >
          <View style={[styles.dhikrColorDot, { backgroundColor: selectedDhikr.color }]} />
          <View style={styles.dhikrSelectorText}>
            <Text style={[styles.dhikrSelectorArabic, { color: colors.text }]}>
              {selectedDhikr.transliteration}
            </Text>
            <Text style={[styles.dhikrSelectorTranslation, { color: colors.textSecondary }]}>
              {selectedDhikr.translation} · Target: {selectedDhikr.target}
            </Text>
          </View>
          <Feather name={showSelector ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
        </Pressable>

        {/* Dhikr list */}
        {showSelector && (
          <View style={[styles.dhikrList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {DHIKR_PRESETS.map((dhikr) => (
              <Pressable
                key={dhikr.id}
                style={[
                  styles.dhikrOption,
                  {
                    backgroundColor: selectedDhikr.id === dhikr.id
                      ? "rgba(255,255,255,0.06)"
                      : "transparent",
                    borderBottomColor: colors.border,
                  }
                ]}
                onPress={() => selectDhikr(dhikr)}
              >
                <View style={[styles.dhikrColorDot, { backgroundColor: dhikr.color }]} />
                <View style={styles.dhikrOptionText}>
                  <Text style={[styles.dhikrOptionArabic, { color: colors.text }]}>{dhikr.arabic}</Text>
                  <Text style={[styles.dhikrOptionTranslit, { color: colors.textSecondary }]}>
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
        <View style={styles.counterArea}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{rounds}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rounds</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.gold }]}>{totalCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.tint }]}>{selectedDhikr.target - count}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Remaining</Text>
            </View>
          </View>

          {/* Main counter button with ring */}
          <View style={styles.ringContainer}>
            {/* Background ring */}
            <View style={[styles.ringTrack, {
              borderColor: colors.border,
            }]} />

            {/* Progress ring (SVG-like overlay using transforms) */}
            <View style={[styles.progressRingWrap, {
              borderColor: selectedDhikr.color,
              borderTopColor: progress < 0.125 ? "transparent" : selectedDhikr.color,
              borderRightColor: progress < 0.375 ? "transparent" : selectedDhikr.color,
              borderBottomColor: progress < 0.625 ? "transparent" : selectedDhikr.color,
              borderLeftColor: progress < 0.875 ? "transparent" : selectedDhikr.color,
              opacity: progress > 0 ? 1 : 0,
            }]} />

            {/* Ripple */}
            <Animated.View style={[
              styles.ripple,
              {
                backgroundColor: selectedDhikr.color,
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              }
            ]} />

            {/* Main tap button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                style={[styles.counterBtn, { backgroundColor: selectedDhikr.color + "20", borderColor: selectedDhikr.color + "60" }]}
                onPress={handleCount}
              >
                <Text style={[styles.countNumber, { color: colors.text }]}>{count}</Text>
                <Text style={[styles.countDivider, { color: colors.textSecondary }]}>/ {selectedDhikr.target}</Text>
                <Text style={[styles.tapHint, { color: colors.textSecondary }]}>Tap to count</Text>
              </Pressable>
            </Animated.View>

            {/* Completion overlay */}
            {justCompleted && (
              <Animated.View style={[
                styles.completionOverlay,
                { opacity: completionOpacity, transform: [{ scale: completionScale }] }
              ]}>
                <Text style={styles.completionEmoji}>✓</Text>
                <Text style={[styles.completionText, { color: "#fff" }]}>Round {rounds} complete!</Text>
              </Animated.View>
            )}
          </View>

          {/* Arabic text */}
          <Text style={[styles.arabicDisplay, { color: colors.text }]}>
            {selectedDhikr.arabic}
          </Text>
          <Text style={[styles.translationDisplay, { color: colors.textSecondary }]}>
            {selectedDhikr.translation}
          </Text>

          {/* Reset button */}
          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleReset}
          >
            <Feather name="rotate-ccw" size={15} color={colors.textSecondary} />
            <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset Count</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 28,
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
  fullResetText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  dhikrSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  dhikrColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dhikrSelectorText: { flex: 1 },
  dhikrSelectorArabic: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  dhikrSelectorTranslation: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  dhikrList: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  dhikrOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dhikrOptionText: { flex: 1 },
  dhikrOptionArabic: {
    fontSize: 16,
    marginBottom: 2,
  },
  dhikrOptionTranslit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  counterArea: {
    flex: 1,
    alignItems: "center",
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  ringContainer: {
    width: 210,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringTrack: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
  },
  progressRingWrap: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
  },
  ripple: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  counterBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  countNumber: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    lineHeight: 56,
  },
  countDivider: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  tapHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  completionOverlay: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(76, 175, 125, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  completionEmoji: {
    fontSize: 36,
    color: "#fff",
  },
  completionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  arabicDisplay: {
    fontSize: 26,
    textAlign: "center",
    lineHeight: 44,
  },
  translationDisplay: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: -8,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
