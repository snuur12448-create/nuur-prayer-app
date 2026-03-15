import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import { calculatePrayerTimes, PrayerTimesResult } from "@/utils/prayerTimes";
import { getIslamicDateForDate } from "@/utils/islamicData";

const STORAGE_KEY = "nuur_prayer_tracker";
const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
type PrayerKey = typeof PRAYERS[number];
type DayRecord = Partial<Record<PrayerKey, boolean>>;
type TrackerData = Record<string, DayRecord>;

const PRAYER_LABELS: Record<PrayerKey, { en: string; ar: string; color: string }> = {
  fajr:    { en: "Fajr",    ar: "الفجر",  color: "#6366f1" },
  dhuhr:   { en: "Dhuhr",   ar: "الظهر",  color: "#f59e0b" },
  asr:     { en: "Asr",     ar: "العصر",  color: "#10b981" },
  maghrib: { en: "Maghrib", ar: "المغرب", color: "#f97316" },
  isha:    { en: "Isha",    ar: "العشاء", color: "#8b5cf6" },
};

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayKey(): string {
  return dateKey(new Date());
}

function countCompleted(record: DayRecord): number {
  return PRAYERS.filter((p) => record[p]).length;
}

function getWeekStrip(anchor: string): string[] {
  const base = keyToDate(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - 3 + i);
    return dateKey(d);
  });
}

function calcStreak(data: TrackerData): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dateKey(d);
    if (countCompleted(data[k] || {}) === 5) streak++;
    else break;
  }
  return streak;
}

function calcWeekTotal(data: TrackerData): number {
  let total = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    total += countCompleted(data[dateKey(d)] || {});
  }
  return total;
}

const DAY_LETTERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function CheckBox({ checked, color, onPress }: { checked: boolean; color: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const bg = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(bg, { toValue: checked ? 1 : 0, useNativeDriver: false, speed: 20 }).start();
  }, [checked]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.85, useNativeDriver: false, speed: 40 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 20 }),
    ]).start();
    onPress();
  };

  const bgColor = bg.interpolate({ inputRange: [0, 1], outputRange: ["transparent", color] });
  const borderColor = checked ? color : "#555";

  return (
    <Pressable onPress={handlePress} hitSlop={12}>
      <Animated.View
        style={[
          styles.checkbox,
          { backgroundColor: bgColor, borderColor, transform: [{ scale }] },
        ]}
      >
        {checked && <Feather name="check" size={14} color="#fff" />}
      </Animated.View>
    </Pressable>
  );
}

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const { themeColors: colors, location, calcMethod, madhab, highLatRule, timeFormat } = useAppContext();
  const [selectedKey, setSelectedKey] = useState(todayKey());
  const [trackerData, setTrackerData] = useState<TrackerData>({});
  const [loaded, setLoaded] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);

  const today = todayKey();
  const isToday = selectedKey === today;
  const weekStrip = useMemo(() => getWeekStrip(selectedKey), [selectedKey]);
  const selectedDate = keyToDate(selectedKey);
  const islamicDate = getIslamicDateForDate(selectedDate);
  const streak = calcStreak(trackerData);
  const weekTotal = calcWeekTotal(trackerData);

  const topInset = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setTrackerData(JSON.parse(raw));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trackerData));
  }, [trackerData, loaded]);

  useEffect(() => {
    if (!location) return;
    const result = calculatePrayerTimes(
      location.latitude, location.longitude, location.timezone,
      selectedDate, calcMethod, madhab, highLatRule, timeFormat
    );
    setPrayerTimes(result);
  }, [selectedKey, location, calcMethod, madhab, highLatRule, timeFormat]);

  const togglePrayer = useCallback((prayer: PrayerKey) => {
    setTrackerData((prev) => {
      const day = prev[selectedKey] || {};
      return { ...prev, [selectedKey]: { ...day, [prayer]: !day[prayer] } };
    });
  }, [selectedKey]);

  const navigateDay = (delta: number) => {
    const d = keyToDate(selectedKey);
    d.setDate(d.getDate() + delta);
    setSelectedKey(dateKey(d));
  };

  const dayRecord = trackerData[selectedKey] || {};
  const completedCount = countCompleted(dayRecord);

  const gregFormatted = selectedDate.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const prayerTimeMap: Record<PrayerKey, string> = {
    fajr:    prayerTimes?.fajr.timeString    ?? "--:--",
    dhuhr:   prayerTimes?.dhuhr.timeString   ?? "--:--",
    asr:     prayerTimes?.asr.timeString     ?? "--:--",
    maghrib: prayerTimes?.maghrib.timeString ?? "--:--",
    isha:    prayerTimes?.isha.timeString    ?? "--:--",
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: topInset + 16, backgroundColor: colors.surface }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Prayer Tracker</Text>
            <Text style={[styles.headerAr, { color: colors.tint }]}>متابعة الصلوات</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.statNum, { color: colors.tint }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.statNum, { color: colors.tint }]}>{weekTotal}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.statNum, { color: colors.tint }]}>{completedCount}/5</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today</Text>
            </View>
          </View>

          {/* Week Strip */}
          <View style={styles.weekStrip}>
            {weekStrip.map((key) => {
              const d = keyToDate(key);
              const count = countCompleted(trackerData[key] || {});
              const isSelected = key === selectedKey;
              const isTodayKey = key === today;
              const dotColor = count === 5 ? colors.tint : count > 0 ? colors.tint + "77" : colors.border;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.weekDay,
                    isSelected && { backgroundColor: colors.tint + "22", borderRadius: 12 },
                  ]}
                  onPress={() => setSelectedKey(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.weekDayLetter, { color: isTodayKey ? colors.tint : colors.textSecondary }]}>
                    {DAY_LETTERS[d.getDay()]}
                  </Text>
                  <Text style={[styles.weekDayNum, { color: isSelected ? colors.tint : colors.text, fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular" }]}>
                    {d.getDate()}
                  </Text>
                  <View style={styles.weekDots}>
                    {PRAYERS.map((p, i) => (
                      <View
                        key={p}
                        style={[styles.weekDot, {
                          backgroundColor: (trackerData[key] || {})[p] ? colors.tint : colors.border,
                        }]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Date Navigation ── */}
        <View style={[styles.dateNav, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigateDay(-1)} style={styles.navBtn} activeOpacity={0.7}>
            <Feather name="chevron-left" size={22} color={colors.tint} />
          </TouchableOpacity>

          <View style={styles.dateCenterCol}>
            <Text style={[styles.gregDate, { color: colors.text }]}>{gregFormatted}</Text>
            <Text style={[styles.hijriDate, { color: colors.tint }]}>
              {islamicDate.day} {islamicDate.month} {islamicDate.year} AH
            </Text>
          </View>

          <View style={styles.navRightGroup}>
            {!isToday && (
              <TouchableOpacity
                onPress={() => setSelectedKey(today)}
                style={[styles.todayBtn, { borderColor: colors.tint }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.todayBtnText, { color: colors.tint }]}>Today</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigateDay(1)} style={styles.navBtn} activeOpacity={0.7}>
              <Feather name="chevron-right" size={22} color={colors.tint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Completion Arc ── */}
        <View style={[styles.completionBar, { backgroundColor: colors.surface, marginTop: 12, marginHorizontal: 16, borderRadius: 16 }]}>
          <View style={styles.completionRow}>
            <Text style={[styles.completionLabel, { color: colors.textSecondary }]}>
              {completedCount === 0 ? "No prayers recorded" : completedCount === 5 ? "All 5 prayers completed" : `${completedCount} of 5 prayers recorded`}
            </Text>
            <Text style={[styles.completionPct, { color: colors.tint }]}>
              {Math.round((completedCount / 5) * 100)}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.tint, width: `${(completedCount / 5) * 100}%` as any }]} />
          </View>
        </View>

        {/* ── Prayer Rows ── */}
        <View style={styles.prayerList}>
          {PRAYERS.map((prayer) => {
            const { en, ar, color } = PRAYER_LABELS[prayer];
            const checked = !!dayRecord[prayer];
            const time = prayerTimeMap[prayer];
            return (
              <TouchableOpacity
                key={prayer}
                style={[
                  styles.prayerRow,
                  { backgroundColor: colors.surface, borderColor: checked ? color + "44" : colors.border },
                  checked && { backgroundColor: color + "12" },
                ]}
                onPress={() => togglePrayer(prayer)}
                activeOpacity={0.8}
              >
                <View style={[styles.prayerColorBar, { backgroundColor: color }]} />
                <View style={styles.prayerInfo}>
                  <Text style={[styles.prayerName, { color: checked ? color : colors.text }]}>{en}</Text>
                  <Text style={[styles.prayerAr, { color: colors.textSecondary }]}>{ar}</Text>
                </View>
                <Text style={[styles.prayerTime, { color: colors.textSecondary }]}>{time}</Text>
                <CheckBox checked={checked} color={color} onPress={() => togglePrayer(prayer)} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Motivational Footer ── */}
        {completedCount === 5 && (
          <View style={[styles.motivationBox, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "44" }]}>
            <Text style={[styles.motivationEmoji]}>✨</Text>
            <Text style={[styles.motivationText, { color: colors.tint }]}>
              MashaAllah! All five prayers completed for this day.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerAr: { fontSize: 16, fontFamily: "Inter_600SemiBold" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center" },
  statNum: { fontSize: 24, fontFamily: "Inter_700Bold", fontVariant: ["tabular-nums"] },
  statLabel: { fontSize: 11, marginTop: 2, fontFamily: "Inter_500Medium" },

  weekStrip: { flexDirection: "row", justifyContent: "space-between" },
  weekDay: { flex: 1, alignItems: "center", paddingVertical: 8, paddingHorizontal: 2 },
  weekDayLetter: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  weekDayNum: { fontSize: 15, fontFamily: "Inter_500Medium", marginBottom: 5 },
  weekDots: { flexDirection: "row", gap: 2 },
  weekDot: { width: 4, height: 4, borderRadius: 2 },

  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: { padding: 6 },
  dateCenterCol: { flex: 1, alignItems: "center" },
  gregDate: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  hijriDate: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  navRightGroup: { flexDirection: "row", alignItems: "center", gap: 4 },
  todayBtn: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 4 },
  todayBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  completionBar: { padding: 14 },
  completionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  completionLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  completionPct: { fontSize: 13, fontFamily: "Inter_700Bold" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },

  prayerList: { paddingHorizontal: 16, gap: 10, marginTop: 12 },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingRight: 16,
    paddingVertical: 14,
    gap: 14,
  },
  prayerColorBar: { width: 4, alignSelf: "stretch", borderRadius: 2, marginLeft: 2 },
  prayerInfo: { flex: 1 },
  prayerName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  prayerAr: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  prayerTime: { fontSize: 14, fontFamily: "Inter_500Medium", fontVariant: ["tabular-nums"], marginRight: 4 },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  motivationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  motivationEmoji: { fontSize: 22 },
  motivationText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
});
