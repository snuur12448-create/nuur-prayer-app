import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import { usePrayerTracker } from "@/context/PrayerTrackerContext";
import { calculatePrayerTimes, applyPrayerOffsets, PrayerTimesResult } from "@/utils/prayerTimes";
import { getIslamicDateForDate } from "@/utils/islamicData";

const MILESTONE_KEY = "nuur_streak_milestones";

const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100] as const;
const MILESTONE_MESSAGES: Record<number, string> = {
  3:   "MashaAllah! 🌟 3 day prayer streak — keep going!",
  7:   "Subhanallah! 🔥 One full week of prayers — you're building a beautiful habit",
  14:  "AlhamduliLlah! ✨ Two weeks strong — consistency is worship",
  30:  "MashaAllah! 🏆 30 day streak — a full month of dedication",
  60:  "Subhanallah! 💫 60 days — you are truly committed",
  100: "AlhamduliLlah! 👑 100 day streak — this is remarkable dedication",
};

const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
type PrayerKey = typeof PRAYERS[number];
type DayRecord = Partial<Record<PrayerKey, boolean>>;
type TrackerData = Record<string, DayRecord>;

const PRAYER_LABELS: Record<PrayerKey, { en: string; ar: string; color: string; icon: string; moment: string }> = {
  fajr:    { en: "Fajr",    ar: "الفجر",  color: "#6366f1", icon: "sunrise",  moment: "Dawn" },
  dhuhr:   { en: "Dhuhr",   ar: "الظهر",  color: "#f59e0b", icon: "sun",      moment: "Midday" },
  asr:     { en: "Asr",     ar: "العصر",  color: "#10b981", icon: "cloud",    moment: "Afternoon" },
  maghrib: { en: "Maghrib", ar: "المغرب", color: "#f97316", icon: "sunset",   moment: "Sunset" },
  isha:    { en: "Isha",    ar: "العشاء", color: "#8b5cf6", icon: "moon",     moment: "Night" },
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
  const todayComplete = countCompleted(data[dateKey(today)] || {}) === 5;
  const startOffset = todayComplete ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
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

/** Last 28 days, oldest first, aligned so today is the last cell. */
function get28DayHeatmap(data: TrackerData): { key: string; count: number; isToday: boolean; isFuture: boolean }[] {
  const today = new Date();
  const todayK = dateKey(today);
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const k = dateKey(d);
    return {
      key: k,
      count: countCompleted(data[k] || {}),
      isToday: k === todayK,
      isFuture: false,
    };
  });
}

/** Pick next milestone above current streak (or 100 if past all). */
function nextMilestone(streak: number): number {
  for (const m of MILESTONE_DAYS) if (streak < m) return m;
  return MILESTONE_DAYS[MILESTONE_DAYS.length - 1];
}

/**
 * Compute the visual fill % (0..1) for the milestone bar so that the fill reaches
 * each tick's visual position when the streak hits that milestone. Ticks are laid
 * out at positions (i+1)/N of the bar (with 0 days at the left edge), and progress
 * is interpolated linearly between adjacent ticks. This avoids the prior bug where
 * `streak / nextMilestone` was applied to the full bar width and visually overshot
 * every tick.
 */
function milestoneFillPct(streak: number): number {
  if (streak <= 0) return 0;
  const N = MILESTONE_DAYS.length;
  if (streak >= MILESTONE_DAYS[N - 1]) return 1;
  let prevDays = 0;
  let prevPos = 0;
  for (let i = 0; i < N; i++) {
    const tickDays = MILESTONE_DAYS[i];
    const tickPos = (i + 1) / N;
    if (streak < tickDays) {
      const span = tickDays - prevDays;
      return prevPos + ((streak - prevDays) / span) * (tickPos - prevPos);
    }
    prevDays = tickDays;
    prevPos = tickPos;
  }
  return 1;
}

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

/** ──────────────────────────────────────────────────────────
 *  Visual helpers
 *  ────────────────────────────────────────────────────────── */

function withAlpha(hex: string, alphaHex: string): string {
  // hex like "#RRGGBB", alphaHex like "22"
  return hex.length === 7 ? `${hex}${alphaHex}` : hex;
}

/** Lantern node — large circle that "lights up" in prayer color when checked. */
function LanternNode({
  checked,
  color,
  icon,
  onPress,
  goldAccent,
  bgColor,
  borderColor,
}: {
  checked: boolean;
  color: string;
  icon: string;
  onPress: () => void;
  goldAccent: string;
  bgColor: string;
  borderColor: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: false, speed: 40 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 18 }),
    ]).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={10}>
      <Animated.View
        style={{
          width: 54,
          height: 54,
          borderRadius: 27,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: checked ? color : bgColor,
          borderWidth: 2,
          borderColor: checked ? color : borderColor,
          shadowColor: checked ? color : "transparent",
          shadowOpacity: checked ? 0.55 : 0,
          shadowRadius: checked ? 12 : 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: checked ? 6 : 0,
          transform: [{ scale }],
        }}
      >
        <Feather name={icon as any} size={22} color={checked ? "#fff" : borderColor} />
        {checked && (
          <View style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: goldAccent,
            borderWidth: 2,
            borderColor: bgColor,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Feather name="check" size={9} color="#0A1612" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

/** ──────────────────────────────────────────────────────────
 *  Screen
 *  ────────────────────────────────────────────────────────── */

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const miniPlayerH = useMiniPlayerHeight();
  const { themeColors: colors, location, calcMethod, madhab, highLatRule, timeFormat, prayerOffsets } = useAppContext();
  const { trackerData, loaded, togglePrayer: ctxTogglePrayer } = usePrayerTracker();
  const [selectedKey, setSelectedKey] = useState(todayKey());
  const [milestonesLoaded, setMilestonesLoaded] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);
  const [firedMilestones, setFiredMilestones] = useState<number[]>([]);

  const today = todayKey();
  const isToday = selectedKey === today;
  const weekStrip = useMemo(() => getWeekStrip(selectedKey), [selectedKey]);
  const selectedDate = keyToDate(selectedKey);
  const islamicDate = getIslamicDateForDate(selectedDate);
  const streak = calcStreak(trackerData);
  const weekTotal = calcWeekTotal(trackerData);
  const heatmap = useMemo(() => get28DayHeatmap(trackerData), [trackerData]);
  const monthTotal = useMemo(() => heatmap.reduce((s, c) => s + c.count, 0), [heatmap]);
  const milestone = nextMilestone(streak);
  const milestonePct = milestoneFillPct(streak);

  const topInset = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const goldAccent = colors.tint;

  // ── Persistence ──
  // Tracker data is owned by PrayerTrackerContext (load + save handled there).
  // We only own milestone notification state here.
  useEffect(() => {
    AsyncStorage.getItem(MILESTONE_KEY).then((raw) => {
      if (raw) {
        try { setFiredMilestones(JSON.parse(raw)); } catch { /* corrupted */ }
      }
      setMilestonesLoaded(true);
    });
  }, []);

  // ── Streak milestone notifications ──
  useEffect(() => {
    if (!loaded || !milestonesLoaded || Platform.OS === "web") return;
    const currentStreak = calcStreak(trackerData);
    const newMilestones = MILESTONE_DAYS.filter(
      (m) => currentStreak >= m && !firedMilestones.includes(m),
    );
    if (newMilestones.length === 0) return;

    newMilestones.forEach((m, idx) => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Prayer Streak 🕌",
          body: MILESTONE_MESSAGES[m],
          sound: true,
          interruptionLevel: "timeSensitive",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1 + idx * 3,
          repeats: false,
        },
      }).catch(() => {});
    });

    const next = [...firedMilestones, ...newMilestones];
    setFiredMilestones(next);
    AsyncStorage.setItem(MILESTONE_KEY, JSON.stringify(next)).catch(() => {});
  }, [trackerData, loaded, firedMilestones]);

  // ── Prayer times for selected date ──
  useEffect(() => {
    if (!location) return;
    const raw = calculatePrayerTimes(
      location.latitude, location.longitude, location.timezone,
      selectedDate, calcMethod, madhab, highLatRule, timeFormat,
    );
    const adjusted = applyPrayerOffsets(raw, prayerOffsets, location.timezone, timeFormat);
    setPrayerTimes(adjusted);
  }, [selectedKey, location, calcMethod, madhab, highLatRule, timeFormat, prayerOffsets]);

  const togglePrayer = useCallback((prayer: PrayerKey) => {
    ctxTogglePrayer(prayer, selectedKey);
  }, [selectedKey, ctxTogglePrayer]);

  const navigateDay = (delta: number) => {
    const d = keyToDate(selectedKey);
    d.setDate(d.getDate() + delta);
    setSelectedKey(dateKey(d));
  };

  const dayRecord = trackerData[selectedKey] || {};
  const completedCount = countCompleted(dayRecord);
  const completedPct = completedCount / 5;

  const gregFormatted = selectedDate.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const prayerTimeMap: Record<PrayerKey, string> = {
    fajr:    prayerTimes?.fajr.timeString    ?? "--:--",
    dhuhr:   prayerTimes?.dhuhr.timeString   ?? "--:--",
    asr:     prayerTimes?.asr.timeString     ?? "--:--",
    maghrib: prayerTimes?.maghrib.timeString ?? "--:--",
    isha:    prayerTimes?.isha.timeString    ?? "--:--",
  };

  const goldSoft = withAlpha(goldAccent, "22");
  const goldFaint = withAlpha(goldAccent, "14");
  const goldBorder = withAlpha(goldAccent, "44");

  // Heatmap colour ramp
  const heatColor = (n: number, isToday: boolean): string => {
    if (n === 0) return colors.border;
    if (n <= 2) return withAlpha(goldAccent, "33");
    if (n <= 3) return withAlpha(goldAccent, "66");
    if (n === 4) return withAlpha(goldAccent, "AA");
    return goldAccent;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 + miniPlayerH }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero: streak ember ── */}
        <View style={[styles.hero, { paddingTop: topInset + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {/* Back chevron — tracker is a stack screen (not a tab), so without
              this the only escape is the OS back gesture, which web users and
              first-time iOS users don't always discover. */}
          <View style={styles.backRow}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={[styles.backBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              <Feather name="chevron-left" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.eyebrowRow}>
            <Text style={[styles.eyebrow, { color: goldAccent }]}>PRAYER · TRACKER</Text>
            <Text style={[styles.headerAr, { color: goldAccent }]}>متابعة الصلوات</Text>
          </View>

          {/* Ember + streak number */}
          <View style={styles.emberRow}>
            <View style={styles.emberWrap}>
              <View style={[styles.emberGlow, { shadowColor: "#F77F2E" }]} />
              <View style={[styles.ember, { shadowColor: "#F77F2E" }]}>
                <Feather name="zap" size={28} color="#FFF8E7" />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.streakNumRow}>
                <Text style={[styles.streakNum, { color: colors.text }]}>{streak}</Text>
                <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>day streak</Text>
              </View>
              <Text style={[styles.milestoneText, { color: goldAccent }]}>
                ✦ {streak >= 100 ? "100-day milestone reached" : `Next milestone: ${milestone} days`}
              </Text>

              {/* Milestone progress bar */}
              <View style={[styles.milestoneTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.milestoneFill, { width: `${milestonePct * 100}%` as any, backgroundColor: goldAccent }]} />
              </View>

              {/* Milestone tick row — each tick absolutely positioned at (i+1)/N of the bar
                  so the visual position matches the milestoneFillPct() math. */}
              <View style={styles.milestoneTicks}>
                {MILESTONE_DAYS.map((m, i) => {
                  const reached = streak >= m;
                  const isCurrent = m === milestone;
                  const leftPct = ((i + 1) / MILESTONE_DAYS.length) * 100;
                  return (
                    <View
                      key={m}
                      style={[
                        styles.tickCol,
                        { left: `${leftPct}%` as any, marginLeft: -14 },
                      ]}
                    >
                      <View style={[
                        styles.tickDot,
                        {
                          backgroundColor: reached ? goldAccent : colors.border,
                          borderColor: isCurrent ? goldAccent : "transparent",
                          borderWidth: isCurrent ? 1.5 : 0,
                        },
                      ]} />
                      <Text style={[
                        styles.tickLabel,
                        { color: reached || isCurrent ? goldAccent : colors.textSecondary, fontFamily: isCurrent ? "Inter_700Bold" : "Inter_500Medium" },
                      ]}>{m}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Date pill */}
          <View style={styles.datePillRow}>
            <TouchableOpacity onPress={() => navigateDay(-1)} style={[styles.navBtn, { backgroundColor: colors.background, borderColor: colors.border }]} activeOpacity={0.7}>
              <Feather name="chevron-left" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.dateCenter}>
              <Text style={[styles.dateGreg, { color: colors.text }]}>{gregFormatted}</Text>
              <Text style={[styles.dateHijri, { color: goldAccent }]}>
                {islamicDate.day} {islamicDate.month} {islamicDate.year} AH
              </Text>
            </View>

            <View style={styles.dateRight}>
              {!isToday && (
                <TouchableOpacity
                  onPress={() => setSelectedKey(today)}
                  style={[styles.todayBtn, { borderColor: goldAccent }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.todayBtnText, { color: goldAccent }]}>Today</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => navigateDay(1)} style={[styles.navBtn, { backgroundColor: colors.background, borderColor: colors.border }]} activeOpacity={0.7}>
                <Feather name="chevron-right" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.dayCountChip, { backgroundColor: goldSoft, borderColor: goldBorder }]}>
            <Text style={[styles.dayCountChipText, { color: goldAccent }]}>{completedCount}/5 today</Text>
          </View>
        </View>

        {/* ── Week garden strip ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>THIS WEEK</Text>
            <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>{weekTotal} / 35 prayers</Text>
          </View>
          <View style={styles.weekStrip}>
            {weekStrip.map((key) => {
              const d = keyToDate(key);
              const count = countCompleted(trackerData[key] || {});
              const isSelected = key === selectedKey;
              const isTodayKey = key === today;
              const filled = count === 5;
              const partial = count > 0 && count < 5;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.weekDay,
                    isSelected && { backgroundColor: goldFaint, borderColor: goldBorder, borderWidth: 1 },
                  ]}
                  onPress={() => setSelectedKey(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.weekDayLetter, { color: isTodayKey || isSelected ? goldAccent : colors.textSecondary }]}>
                    {DAY_LETTERS[d.getDay()]}
                  </Text>
                  <Text style={[styles.weekDayNum, { color: colors.text, fontFamily: isSelected ? "Inter_700Bold" : "Inter_500Medium" }]}>
                    {d.getDate()}
                  </Text>
                  <View style={[
                    styles.rosebud,
                    {
                      backgroundColor: filled ? goldAccent : (partial ? withAlpha(goldAccent, "55") : colors.border),
                      borderColor: filled ? withAlpha(goldAccent, "AA") : colors.border,
                      shadowColor: filled ? goldAccent : "transparent",
                      shadowOpacity: filled ? 0.6 : 0,
                      shadowRadius: filled ? 4 : 0,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: filled ? 3 : 0,
                    },
                  ]}>
                    {filled && <View style={styles.rosebudInner} />}
                  </View>
                  <Text style={[styles.weekDayCount, { color: colors.textSecondary }]}>{count}/5</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Today's path: vertical lantern path ── */}
        <View style={[styles.section, { paddingTop: 4 }]}>
          <View style={styles.sectionHeadRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{isToday ? "Today's path" : "Prayer path"}</Text>
            <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>{Math.round(completedPct * 100)}% lit</Text>
          </View>

          <View style={styles.pathWrap}>
            {/* vertical path line, gradient via two layers */}
            <View style={[styles.pathRail, { backgroundColor: colors.border }]} />
            <View style={[
              styles.pathRailLit,
              { backgroundColor: goldAccent, height: `${Math.max(completedPct * 100, 4)}%` as any },
            ]} />

            {PRAYERS.map((p) => {
              const { en, ar, color, icon, moment } = PRAYER_LABELS[p];
              const checked = !!dayRecord[p];
              const time = prayerTimeMap[p];
              return (
                <View key={p} style={styles.pathRow}>
                  <LanternNode
                    checked={checked}
                    color={color}
                    icon={icon}
                    onPress={() => togglePrayer(p)}
                    goldAccent={goldAccent}
                    bgColor={colors.surface}
                    borderColor={colors.border}
                  />

                  <TouchableOpacity
                    onPress={() => togglePrayer(p)}
                    activeOpacity={0.85}
                    style={[
                      styles.prayerCard,
                      {
                        backgroundColor: checked ? withAlpha(color, "12") : colors.surface,
                        borderColor: checked ? withAlpha(color, "55") : colors.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.prayerNameRow}>
                        <Text style={[styles.prayerName, { color: checked ? color : colors.text }]}>{en}</Text>
                        <Text style={[styles.prayerAr, { color: colors.textSecondary }]}>{ar}</Text>
                      </View>
                      <Text style={[styles.prayerMoment, { color: colors.textSecondary }]}>{moment}</Text>
                    </View>
                    <Text style={[styles.prayerTime, { color: checked ? color : colors.textSecondary }]}>{time}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── 28-day heatmap ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Last 4 weeks</Text>
            <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>{monthTotal} / 140 prayers</Text>
          </View>

          <View style={[styles.heatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.heatHeaderRow}>
              {DAY_LETTERS.map((l, i) => (
                <Text key={i} style={[styles.heatHeader, { color: colors.textSecondary }]}>{l}</Text>
              ))}
            </View>
            <View style={styles.heatGrid}>
              {heatmap.map((cell, i) => (
                <View
                  key={cell.key}
                  style={[
                    styles.heatCell,
                    {
                      backgroundColor: heatColor(cell.count, cell.isToday),
                      borderColor: cell.isToday ? goldAccent : colors.border,
                      borderWidth: cell.isToday ? 1.5 : StyleSheet.hairlineWidth,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.heatLegendRow}>
              <Text style={[styles.heatLegendText, { color: colors.textSecondary }]}>less</Text>
              <View style={styles.heatLegendDots}>
                {[0, 2, 3, 4, 5].map((n) => (
                  <View key={n} style={[styles.heatLegendDot, { backgroundColor: heatColor(n, false), borderColor: colors.border }]} />
                ))}
              </View>
              <Text style={[styles.heatLegendText, { color: colors.textSecondary }]}>more</Text>
            </View>
          </View>
        </View>

        {/* ── Sunnah Prayers entry ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/sunnah-prayers")}
          style={[styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.linkIcon, { backgroundColor: goldSoft, borderColor: goldBorder }]}>
            <Feather name="moon" size={16} color={goldAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>Sunnah prayers</Text>
            <Text style={[styles.linkSub, { color: colors.textSecondary }]}>Rawātib, Ḍuḥā, Tahajjud, Witr & more</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* ── Qaḍā / Make-Up Prayers entry ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/qada")}
          style={[styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 10 }]}
        >
          <View style={[styles.linkIcon, { backgroundColor: goldSoft, borderColor: goldBorder }]}>
            <Feather name="bookmark" size={16} color={goldAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>Make-up prayers</Text>
            <Text style={[styles.linkSub, { color: colors.textSecondary }]}>A quiet ledger for qaḍā · private to you</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* ── Motivational footer ── */}
        {completedCount === 5 && (
          <View style={[styles.motivationBox, { backgroundColor: goldSoft, borderColor: goldBorder }]}>
            <Text style={styles.motivationEmoji}>✨</Text>
            <Text style={[styles.motivationText, { color: goldAccent }]}>
              MashaAllah! All five prayers completed for this day.
            </Text>
          </View>
        )}

        {/* ── Ornamental footer ── */}
        <View style={styles.ornament}>
          <View style={[styles.ornamentLine, { backgroundColor: goldBorder }]} />
          <Text style={[styles.ornamentGlyph, { color: goldAccent }]}>﷽</Text>
          <View style={[styles.ornamentLine, { backgroundColor: goldBorder }]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backRow: { marginBottom: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  eyebrow: { fontSize: 10, letterSpacing: 3, fontFamily: "Inter_600SemiBold" },
  headerAr: { fontSize: 16, fontFamily: "AmiriQuran_400Regular" },

  emberRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  emberWrap: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  emberGlow: {
    position: "absolute", width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(247,127,46,0.25)",
    shadowOpacity: 0.7, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  ember: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#F77F2E",
    alignItems: "center", justifyContent: "center",
    shadowOpacity: 0.6, shadowRadius: 18, shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  streakNumRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  streakNum: { fontSize: 38, fontFamily: "Inter_700Bold", letterSpacing: -1, fontVariant: ["tabular-nums"] },
  streakLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  milestoneText: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  milestoneTrack: { height: 5, borderRadius: 3, overflow: "hidden", marginTop: 8 },
  milestoneFill: { height: 5, borderRadius: 3 },
  milestoneTicks: { position: "relative", height: 22, marginTop: 6 },
  tickCol: { position: "absolute", top: 0, width: 28, alignItems: "center" },
  tickDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 3 },
  tickLabel: { fontSize: 9, fontVariant: ["tabular-nums"] },

  datePillRow: { flexDirection: "row", alignItems: "center", marginTop: 18, gap: 8 },
  navBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  dateCenter: { flex: 1, alignItems: "center" },
  dateGreg: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dateHijri: { fontSize: 11, fontFamily: "AmiriQuran_400Regular", marginTop: 1 },
  dateRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  todayBtn: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  todayBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  dayCountChip: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  dayCountChipText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  // Sections
  section: { paddingHorizontal: 20, marginTop: 18 },
  sectionHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionEyebrow: { fontSize: 10, letterSpacing: 2, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  sectionMeta: { fontSize: 11, fontFamily: "Inter_500Medium" },

  // Week strip
  weekStrip: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  weekDay: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 8, borderRadius: 12, borderColor: "transparent" },
  weekDayLetter: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  weekDayNum: { fontSize: 14 },
  rosebud: {
    width: 13, height: 13, borderRadius: 7, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  rosebudInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#FFEEC2", position: "absolute", top: 2.5, left: 4 },
  weekDayCount: { fontSize: 8, fontFamily: "Inter_500Medium", fontVariant: ["tabular-nums"] },

  // Path
  pathWrap: { position: "relative", paddingLeft: 0 },
  pathRail: {
    position: "absolute", left: 26, top: 14, bottom: 14, width: 2, borderRadius: 1,
  },
  pathRailLit: {
    position: "absolute", left: 26, top: 14, width: 2, borderRadius: 1,
  },
  pathRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  prayerCard: {
    flex: 1, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 16, borderWidth: 1,
  },
  prayerNameRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  prayerName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  prayerAr: { fontSize: 13, fontFamily: "AmiriQuran_400Regular" },
  prayerMoment: { fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 2, letterSpacing: 0.3 },
  prayerTime: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontVariant: ["tabular-nums"] },

  // Heatmap
  heatCard: { borderRadius: 16, borderWidth: 1, padding: 12 },
  heatHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6, paddingHorizontal: 1 },
  heatHeader: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, flex: 1, textAlign: "center" },
  heatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  heatCell: {
    width: `${(100 - 5 * 6) / 7}%` as any,
    aspectRatio: 1,
    borderRadius: 5,
  },
  heatLegendRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  heatLegendText: { fontSize: 9, fontFamily: "Inter_500Medium" },
  heatLegendDots: { flexDirection: "row", gap: 3 },
  heatLegendDot: { width: 11, height: 11, borderRadius: 3, borderWidth: StyleSheet.hairlineWidth },

  // Link cards (Sunnah / Qada)
  linkCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 20, marginTop: 14, padding: 14,
    borderRadius: 16, borderWidth: 1,
  },
  linkIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  linkTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  linkSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },

  // Motivation
  motivationBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 20, marginTop: 14, padding: 14,
    borderRadius: 16, borderWidth: 1,
  },
  motivationEmoji: { fontSize: 22 },
  motivationText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 19 },

  // Ornament
  ornament: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 22, paddingHorizontal: 60 },
  ornamentLine: { flex: 1, height: StyleSheet.hairlineWidth },
  ornamentGlyph: { fontSize: 22, fontFamily: "AmiriQuran_400Regular" },
});
