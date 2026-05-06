import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import { usePrayerTracker } from "@/context/PrayerTrackerContext";
import {
  applyPrayerOffsets,
  calculatePrayerTimes,
  PrayerTimesResult,
} from "@/utils/prayerTimes";
import { getIslamicDateForDate } from "@/utils/islamicData";

// ─── Constants ──────────────────────────────────────────────────────────────

const MILESTONE_KEY = "nuur_streak_milestones";
const PERFECT_DAY_KEY = "nuur_perfect_day_celebrated";
const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100] as const;
const MILESTONE_MESSAGES: Record<number, string> = {
  3:   "MashaAllah! 🌟 3 day prayer streak — keep going!",
  7:   "Subhanallah! 🔥 One full week of prayers — you're building a beautiful habit",
  14:  "AlhamduliLlah! ✨ Two weeks strong — consistency is worship",
  30:  "MashaAllah! 🏆 30 day streak — a full month of dedication",
  60:  "Subhanallah! 💫 60 days — you are truly committed",
  100: "AlhamduliLlah! 👑 100 day streak — this is remarkable dedication",
};
const MILESTONE_HEADLINES: Record<number, string> = {
  3: "Three days of light",
  7: "One week strong",
  14: "Two weeks of light",
  30: "A full month",
  60: "Sixty days",
  100: "One hundred days",
};

const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
type PrayerKey = typeof PRAYERS[number];
type DayRecord = Partial<Record<PrayerKey, boolean>>;
type TrackerData = Record<string, DayRecord>;

const PRAYER_LABELS: Record<PrayerKey, { en: string; ar: string }> = {
  fajr:    { en: "Fajr",    ar: "ٱلْفَجْر" },
  dhuhr:   { en: "Dhuhr",   ar: "ٱلظُّهْر" },
  asr:     { en: "Asr",     ar: "ٱلْعَصْر" },
  maghrib: { en: "Maghrib", ar: "ٱلْمَغْرِب" },
  isha:    { en: "Isha",    ar: "ٱلْعِشَاء" },
};

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const HIJRI_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

// ─── Helpers ────────────────────────────────────────────────────────────────

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function todayKey(): string { return dateKey(new Date()); }
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
    if (countCompleted(data[dateKey(d)] || {}) === 5) streak++;
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
function get28Day(data: TrackerData): { key: string; count: number; isToday: boolean }[] {
  const today = new Date();
  const todayK = dateKey(today);
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const k = dateKey(d);
    return { key: k, count: countCompleted(data[k] || {}), isToday: k === todayK };
  });
}
function nextMilestone(streak: number): number {
  for (const m of MILESTONE_DAYS) if (streak < m) return m;
  return MILESTONE_DAYS[MILESTONE_DAYS.length - 1];
}
function withAlpha(hex: string, a: string): string {
  return hex.length === 7 ? `${hex}${a}` : hex;
}
function toArabicDigits(n: number): string {
  return String(n).split("").map((c) => HIJRI_DIGITS[Number(c)] ?? c).join("");
}
function perfectDaysIn(data: TrackerData, days: number): number {
  let n = 0;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (countCompleted(data[dateKey(d)] || {}) === 5) n++;
  }
  return n;
}

// Parse "HH:MM" or "HH:MM AM/PM" to today's Date for next-prayer logic.
function parseTimeToToday(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, mm, 0, 0);
  return d;
}

// ─── SVG primitives (ported from Mihrab mockup) ─────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Floret({ cx, cy, gold }: { cx: number; cy: number; gold: string }) {
  return (
    <G transform={`translate(${cx} ${cy})`} opacity={0.7}>
      <Circle cx={0} cy={0} r={2.2} fill={gold} opacity={0.9} />
      <Path d="M0 -8 Q 3 -3 0 0 Q -3 -3 0 -8 Z" fill={gold} opacity={0.5} />
      <Path d="M0 8 Q 3 3 0 0 Q -3 3 0 8 Z" fill={gold} opacity={0.5} />
      <Path d="M-8 0 Q -3 3 0 0 Q -3 -3 -8 0 Z" fill={gold} opacity={0.5} />
      <Path d="M8 0 Q 3 3 0 0 Q 3 -3 8 0 Z" fill={gold} opacity={0.5} />
    </G>
  );
}

function Lamp({
  lit, glow, gold, goldLight, goldDark, mute, haloOp,
}: {
  lit: boolean;
  glow: boolean;
  gold: string;
  goldLight: string;
  goldDark: string;
  mute: string;
  haloOp?: Animated.Value;
}) {
  const stroke = lit ? gold : mute;
  return (
    <Svg width={26} height={30} viewBox="0 0 22 26">
      {glow && haloOp ? (
        <AnimatedCircle cx={11} cy={15} r={13} fill={gold} opacity={haloOp as any} />
      ) : null}
      {lit && !glow ? <Circle cx={11} cy={15} r={9} fill={gold} opacity={0.18} /> : null}
      <Line x1={11} y1={0} x2={11} y2={5} stroke={stroke} strokeWidth={0.6} opacity={0.6} />
      <Path d="M7 5 L15 5 L13.5 8 L8.5 8 Z" fill={lit ? goldDark : "transparent"} stroke={stroke} strokeWidth={0.7} />
      <Path
        d="M8 8 Q 5 13 7 18 Q 11 22 15 18 Q 17 13 14 8 Z"
        fill={lit ? gold : "transparent"}
        stroke={lit ? goldLight : mute}
        strokeWidth={0.7}
      />
      {lit ? <Circle cx={11} cy={14} r={1.6} fill={goldLight} /> : null}
      <Line x1={11} y1={22} x2={11} y2={25} stroke={stroke} strokeWidth={0.5} opacity={0.5} />
    </Svg>
  );
}

function Bead({
  count, ring, size = 14, gold, goldLight, surface, border, sparkle,
}: {
  count: number;
  ring?: boolean;
  size?: number;
  gold: string;
  goldLight: string;
  surface: string;
  border: string;
  sparkle?: boolean;
}) {
  const pct = count / 5;
  const r = size / 2;
  const c = r + 2;
  return (
    <Svg width={size + 4} height={size + 4} viewBox={`0 0 ${size + 4} ${size + 4}`}>
      <Circle cx={c} cy={c} r={r} fill={surface} stroke={border} strokeWidth={0.6} />
      {pct > 0 ? <Circle cx={c} cy={c} r={r - 1.5} fill={gold} opacity={0.25 + pct * 0.65} /> : null}
      {pct === 1 ? <Circle cx={c} cy={c} r={r - 3} fill={goldLight} opacity={0.7} /> : null}
      {ring ? <Circle cx={c} cy={c} r={r + 1} fill="none" stroke={gold} strokeWidth={0.8} opacity={0.9} /> : null}
      {sparkle && pct === 1 ? (
        <G transform={`translate(${c} ${c})`}>
          <Path
            d={`M 0 -${r - 1.5} L 0.6 -0.6 L ${r - 1.5} 0 L 0.6 0.6 L 0 ${r - 1.5} L -0.6 0.6 L -${r - 1.5} 0 L -0.6 -0.6 Z`}
            fill={goldLight}
            opacity={0.95}
          />
        </G>
      ) : null}
    </Svg>
  );
}

// ─── Mihrab niche ───────────────────────────────────────────────────────────

function MihrabSvg({
  W, H, gold, bg, surfaceHi,
}: {
  W: number; H: number; gold: string; bg: string; surfaceHi: string;
}) {
  const archRadius = W / 2 - 12;
  const archTop = 12;
  const archCenterY = archTop + archRadius;
  const innerOffset = 8;
  const outerPath =
    `M 12 ${H - 12} ` +
    `L 12 ${archCenterY} ` +
    `A ${archRadius} ${archRadius} 0 0 1 ${W - 12} ${archCenterY} ` +
    `L ${W - 12} ${H - 12} Z`;
  const innerR = archRadius - innerOffset;
  const innerPath =
    `M ${12 + innerOffset} ${H - 12 - innerOffset} ` +
    `L ${12 + innerOffset} ${archCenterY} ` +
    `A ${innerR} ${innerR} 0 0 1 ${W - 12 - innerOffset} ${archCenterY} ` +
    `L ${W - 12 - innerOffset} ${H - 12 - innerOffset} Z`;
  const dashedArc =
    `M ${12 + innerOffset + 6} ${archCenterY} ` +
    `A ${innerR - 6} ${innerR - 6} 0 0 1 ${W - 12 - innerOffset - 6} ${archCenterY}`;

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <Defs>
        <SvgLinearGradient id="nicheSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#1A2C46" />
          <Stop offset="40%" stopColor="#2A2238" />
          <Stop offset="80%" stopColor="#1A1A1A" />
          <Stop offset="100%" stopColor={bg} />
        </SvgLinearGradient>
        <RadialGradient id="nicheGlow" cx="0.5" cy="0.78" r="0.6">
          <Stop offset="0%" stopColor={gold} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={gold} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Path d={outerPath} fill="url(#nicheSky)" />
      <Path d={outerPath} fill="url(#nicheGlow)" />
      <Path d={outerPath} fill="none" stroke={gold} strokeWidth={1} opacity={0.55} />
      <Path d={innerPath} fill="none" stroke={gold} strokeWidth={0.8} opacity={0.4} />

      <Floret cx={20} cy={H - 20} gold={gold} />
      <Floret cx={W - 20} cy={H - 20} gold={gold} />
      <Floret cx={20} cy={archCenterY} gold={gold} />
      <Floret cx={W - 20} cy={archCenterY} gold={gold} />

      {/* Apex rosette w/ Hijri day */}
      <G transform={`translate(${W / 2} ${archTop + 30})`}>
        <Circle r={18} fill="none" stroke={gold} strokeWidth={0.6} opacity={0.45} />
        <Circle r={13} fill="none" stroke={gold} strokeWidth={0.6} opacity={0.55} />
        <Circle r={9} fill={surfaceHi} stroke={gold} strokeWidth={0.6} opacity={0.9} />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <Line
            key={a}
            x1={0}
            y1={-13}
            x2={0}
            y2={-18}
            stroke={gold}
            strokeWidth={0.6}
            opacity={0.45}
            transform={`rotate(${a})`}
          />
        ))}
      </G>

      <Path d={dashedArc} fill="none" stroke={gold} strokeWidth={0.6} strokeDasharray="2 5" opacity={0.35} />
    </Svg>
  );
}

// ─── Celebration overlay ────────────────────────────────────────────────────

function CelebrationOverlay({
  visible, kind, headline, sub, gold, goldLight, surface, text, onDismiss,
}: {
  visible: boolean;
  kind: "perfect" | "milestone";
  headline: string;
  sub: string;
  gold: string;
  goldLight: string;
  surface: string;
  text: string;
  onDismiss: () => void;
}) {
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0.7)).current;
  const sparks = useRef(Array.from({ length: 12 }).map(() => ({
    t: new Animated.Value(0),
    angle: 0,
    dist: 0,
  }))).current;

  useEffect(() => {
    if (!visible) return;
    sparks.forEach((s, i) => {
      s.angle = (i / sparks.length) * Math.PI * 2;
      s.dist = 80 + Math.random() * 70;
      s.t.setValue(0);
    });
    op.setValue(0);
    sc.setValue(0.7);
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(sc, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      Animated.stagger(40, sparks.map((s) =>
        Animated.timing(s.t, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      )),
    ]).start();
    const dur = kind === "milestone" ? 3200 : 2400;
    const t = setTimeout(() => {
      Animated.timing(op, { toValue: 0, duration: 240, useNativeDriver: true }).start(onDismiss);
    }, dur);
    return () => clearTimeout(t);
  }, [visible, kind, op, sc, sparks, onDismiss]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(8,16,12,0.86)", opacity: op }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={{ alignItems: "center", transform: [{ scale: sc }], opacity: op }}>
            {/* Starbursts radiating from center */}
            {sparks.map((s, i) => {
              const tx = s.t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(s.angle) * s.dist] });
              const ty = s.t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(s.angle) * s.dist] });
              const o = s.t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] });
              const sz = 4 + (i % 3) * 2;
              return (
                <Animated.View
                  key={i}
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    width: sz, height: sz, borderRadius: sz / 2,
                    backgroundColor: i % 2 === 0 ? gold : goldLight,
                    transform: [{ translateX: tx }, { translateY: ty }],
                    opacity: o,
                  }}
                />
              );
            })}

            {/* Central rosette burst */}
            <Svg width={132} height={132} viewBox="0 0 132 132">
              <Defs>
                <RadialGradient id="celGlow" cx="0.5" cy="0.5" r="0.5">
                  <Stop offset="0%" stopColor={gold} stopOpacity={0.45} />
                  <Stop offset="100%" stopColor={gold} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={66} cy={66} r={66} fill="url(#celGlow)" />
              <Circle cx={66} cy={66} r={42} fill="none" stroke={gold} strokeWidth={0.8} opacity={0.5} />
              <Circle cx={66} cy={66} r={32} fill="none" stroke={gold} strokeWidth={0.6} opacity={0.6} />
              <Circle cx={66} cy={66} r={22} fill={surface} stroke={gold} strokeWidth={1} opacity={0.95} />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * 360;
                return (
                  <Line key={i} x1={66} y1={24} x2={66} y2={18} stroke={gold} strokeWidth={0.8} opacity={0.6}
                    transform={`rotate(${a} 66 66)`} />
                );
              })}
              <SvgText
                x={66} y={71}
                textAnchor="middle"
                fill={goldLight}
                fontSize={20}
                fontFamily="AmiriQuran_400Regular"
                fontWeight="700"
              >
                ﷽
              </SvgText>
            </Svg>

            <Text style={{
              fontFamily: "AmiriQuran_400Regular",
              fontSize: 26,
              color: goldLight,
              marginTop: 18,
              textAlign: "center",
              lineHeight: 38,
            }}>
              مَا شَاءَ ٱللَّٰه
            </Text>
            <Text style={{
              fontFamily: "Inter_700Bold",
              fontSize: 20,
              color: text,
              marginTop: 14,
              textAlign: "center",
              letterSpacing: 0.2,
            }}>
              {headline}
            </Text>
            <Text style={{
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              color: withAlpha(text, "AA"),
              marginTop: 8,
              textAlign: "center",
              maxWidth: 280,
              lineHeight: 18,
            }}>
              {sub}
            </Text>
            <View style={{
              marginTop: 22,
              paddingHorizontal: 14, paddingVertical: 7,
              borderRadius: 999, borderWidth: 1, borderColor: withAlpha(gold, "55"),
              backgroundColor: withAlpha(gold, "14"),
            }}>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 2, color: gold }}>
                TAP TO CONTINUE
              </Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const miniPlayerH = useMiniPlayerHeight();
  const {
    themeColors: colors,
    location, calcMethod, madhab, highLatRule, timeFormat, prayerOffsets,
    prayerPreReminderMinutes, setPrayerPreReminderMinutes,
  } = useAppContext();
  const { trackerData, loaded, togglePrayer: ctxTogglePrayer, setPrayed, isPrayed } = usePrayerTracker();

  const [selectedKey, setSelectedKey] = useState(todayKey());
  const [milestonesLoaded, setMilestonesLoaded] = useState(false);
  const [firedMilestones, setFiredMilestones] = useState<number[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);
  const [now, setNow] = useState(new Date());
  const [celebration, setCelebration] = useState<{
    kind: "perfect" | "milestone";
    headline: string;
    sub: string;
  } | null>(null);

  const prevCompletedRef = useRef<number>(-1);
  const perfectFiredKeyRef = useRef<string | null>(null);

  const today = todayKey();
  const isToday = selectedKey === today;
  const weekStrip = useMemo(() => getWeekStrip(selectedKey), [selectedKey]);
  const selectedDate = keyToDate(selectedKey);
  const islamicDate = getIslamicDateForDate(selectedDate);
  const streak = calcStreak(trackerData);
  const weekTotal = calcWeekTotal(trackerData);
  const heat = useMemo(() => get28Day(trackerData), [trackerData]);
  const milestone = nextMilestone(streak);
  const perfectThisWeek = useMemo(() => perfectDaysIn(trackerData, 7), [trackerData]);

  // Re-tick "now" once per minute so the next-prayer countdown stays fresh.
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(iv);
  }, []);

  // Theme-derived shorthands. We treat themeColors.gold as "the brand accent
  // gold" and derive lighter/darker shades + alpha helpers.
  const gold = colors.gold;
  const goldLight = colors.goldLight;
  const goldDark = colors.goldGradient[1];
  const goldSoft = withAlpha(gold, "22");
  const goldFaint = withAlpha(gold, "14");
  const goldBorder = withAlpha(gold, "44");
  const mute = withAlpha(colors.textSecondary, "AA");

  const topInset = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  // ─── Load + persist milestone notification state ───
  useEffect(() => {
    AsyncStorage.getItem(MILESTONE_KEY).then((raw) => {
      if (raw) {
        try { setFiredMilestones(JSON.parse(raw)); } catch { /* corrupted */ }
      }
      setMilestonesLoaded(true);
    });
    // Hydrate the "did we already celebrate today's perfect day?" flag so
    // un-checking + re-checking the 5th prayer doesn't re-fire the overlay,
    // and neither does a fresh app launch on a day already complete.
    AsyncStorage.getItem(PERFECT_DAY_KEY).then((k) => {
      if (k) perfectFiredKeyRef.current = k;
    });
  }, []);

  // ─── Streak milestone notifications + in-app celebration overlay ───
  useEffect(() => {
    if (!loaded || !milestonesLoaded) return;
    const newMilestones = MILESTONE_DAYS.filter(
      (m) => streak >= m && !firedMilestones.includes(m),
    );
    if (newMilestones.length === 0) return;

    if (Platform.OS !== "web") {
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
    }

    // In-app celebration for the highest just-crossed milestone.
    const top = newMilestones[newMilestones.length - 1];
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    setCelebration({
      kind: "milestone",
      headline: MILESTONE_HEADLINES[top] ?? `${top} day streak`,
      sub: MILESTONE_MESSAGES[top].replace(/^[^!]*!\s*[^\s]*\s*/, ""),
    });

    const next = [...firedMilestones, ...newMilestones];
    setFiredMilestones(next);
    AsyncStorage.setItem(MILESTONE_KEY, JSON.stringify(next)).catch(() => {});
  }, [streak, loaded, firedMilestones, milestonesLoaded]);

  // ─── Detect 5/5 perfect-day completion (today only) ───
  useEffect(() => {
    if (!loaded) return;
    const todayRecord = trackerData[today] || {};
    const c = countCompleted(todayRecord);
    const prev = prevCompletedRef.current;
    prevCompletedRef.current = c;
    if (prev === -1) return; // first render — don't fire on initial load
    if (prev < 5 && c === 5 && perfectFiredKeyRef.current !== today) {
      perfectFiredKeyRef.current = today;
      AsyncStorage.setItem(PERFECT_DAY_KEY, today).catch(() => {});
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      // Don't stack on top of milestone overlay
      setCelebration((cur) =>
        cur?.kind === "milestone" ? cur : {
          kind: "perfect",
          headline: "All five lit",
          sub: `Today is complete. ${streak >= 1 ? `That's ${streak} day${streak === 1 ? "" : "s"} of light.` : "May Allah accept it."}`,
        },
      );
    }
  }, [trackerData, loaded, today, streak]);

  // ─── Prayer times for selected date ───
  useEffect(() => {
    if (!location) return;
    const raw = calculatePrayerTimes(
      location.latitude, location.longitude, location.timezone,
      selectedDate, calcMethod, madhab, highLatRule, timeFormat,
    );
    const adjusted = applyPrayerOffsets(raw, prayerOffsets, location.timezone, timeFormat);
    setPrayerTimes(adjusted);
  }, [selectedKey, location, calcMethod, madhab, highLatRule, timeFormat, prayerOffsets]);

  const togglePrayer = useCallback((p: PrayerKey) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(
        isPrayed(p, selectedKey)
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium,
      ).catch(() => {});
    }
    ctxTogglePrayer(p, selectedKey);
  }, [ctxTogglePrayer, selectedKey, isPrayed]);

  const navigateDay = (delta: number) => {
    const d = keyToDate(selectedKey);
    d.setDate(d.getDate() + delta);
    setSelectedKey(dateKey(d));
  };

  const dayRecord = trackerData[selectedKey] || {};
  const completedCount = countCompleted(dayRecord);

  const prayerTimeMap: Record<PrayerKey, string> = {
    fajr:    prayerTimes?.fajr.timeString    ?? "--:--",
    dhuhr:   prayerTimes?.dhuhr.timeString   ?? "--:--",
    asr:     prayerTimes?.asr.timeString     ?? "--:--",
    maghrib: prayerTimes?.maghrib.timeString ?? "--:--",
    isha:    prayerTimes?.isha.timeString    ?? "--:--",
  };

  // Determine the "next" prayer for today (first un-prayed prayer whose time
  // is in the future). Only meaningful when selectedKey === today.
  const { nextPrayerKey, nextCountdown } = useMemo(() => {
    if (!isToday) return { nextPrayerKey: null as PrayerKey | null, nextCountdown: "" };
    for (const p of PRAYERS) {
      if (dayRecord[p]) continue;
      const t = parseTimeToToday(prayerTimeMap[p]);
      if (!t) continue;
      if (t.getTime() > now.getTime()) {
        const diffMs = t.getTime() - now.getTime();
        const mins = Math.max(1, Math.round(diffMs / 60000));
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return {
          nextPrayerKey: p,
          nextCountdown: h > 0 ? `IN ${h}H ${String(m).padStart(2, "0")}M` : `IN ${m}M`,
        };
      }
    }
    return { nextPrayerKey: null, nextCountdown: "" };
  }, [isToday, dayRecord, prayerTimeMap, now]);

  // Pulsing halo Animated.Value for the next-prayer lamp.
  const haloOp = useRef(new Animated.Value(0.18)).current;
  useEffect(() => {
    haloOp.stopAnimation();
    if (!nextPrayerKey) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloOp, { toValue: 0.42, duration: 1200, useNativeDriver: false }),
        Animated.timing(haloOp, { toValue: 0.18, duration: 1200, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [nextPrayerKey, haloOp]);

  // Candle flicker on streak chip.
  const flicker = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(flicker, { toValue: 0.5, duration: 800, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [flicker]);

  // Lamp ignite scale per-prayer (only animate the prayer just toggled).
  const lampScales = useRef<Record<PrayerKey, Animated.Value>>(
    PRAYERS.reduce((acc, p) => ({ ...acc, [p]: new Animated.Value(1) }), {} as any),
  ).current;
  const onLampPress = (p: PrayerKey) => {
    Animated.sequence([
      Animated.spring(lampScales[p], { toValue: 0.85, useNativeDriver: true, speed: 40, bounciness: 0 }),
      Animated.spring(lampScales[p], { toValue: 1, useNativeDriver: true, friction: 4, tension: 120 }),
    ]).start();
    togglePrayer(p);
  };

  // Backfill helper for past days the user forgot to log. Intentionally NOT
  // exposed on today — today should be marked one prayer at a time, in the
  // moment, since that's the whole point of the tracker. On past days we trust
  // the user to honestly recall whether they prayed.
  const backfillSelectedDay = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    PRAYERS.forEach((p) => setPrayed(p, true, selectedKey));
  }, [setPrayed, selectedKey]);

  const togglePreReminder = useCallback(() => {
    const next = prayerPreReminderMinutes === 0 ? 15 : 0;
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    setPrayerPreReminderMinutes(next).catch(() => {});
  }, [prayerPreReminderMinutes, setPrayerPreReminderMinutes]);

  // Mihrab geometry
  const W = 358;
  const H = 440;
  const archTop = 12;
  const archCenterY = archTop + (W / 2 - 12);

  // Time-of-day display for the mihrab interior (now if today, else --:--).
  const heroTime = isToday
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    : selectedDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

  // Date eyebrow (Tue · 21 Jumādā I)
  const eyebrowDate = `${selectedDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()} · ${islamicDate.day} ${islamicDate.month}`;
  const eyebrowGreg = `${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${islamicDate.year}`;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 + miniPlayerH }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Status bar: back, date, streak chip ── */}
        <View style={[styles.statusBar, { paddingTop: topInset + 6 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={[styles.backBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              <Feather name="chevron-left" size={18} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.eyebrowDate, { color: withAlpha(colors.textSecondary, "AA") }]}>
                {eyebrowDate}
              </Text>
              <Text style={[styles.eyebrowGreg, { color: colors.textSecondary }]}>{eyebrowGreg}</Text>
            </View>
          </View>
          <View
            style={[
              styles.streakChip,
              { borderColor: gold, backgroundColor: withAlpha(gold, "10") },
            ]}
          >
            <Svg width={11} height={15} viewBox="0 0 10 14">
              <Path d="M5 0 Q 7 2 5 4 Q 3 2 5 0 Z" fill={goldLight} />
              <Path d="M3.5 4 L 6.5 4 L 6.5 13 L 3.5 13 Z" fill={goldDark} stroke={gold} strokeWidth={0.4} />
              <AnimatedCircle cx={5} cy={2.5} r={2.3} fill={gold} opacity={flicker as any} />
            </Svg>
            <Text style={[styles.streakChipText, { color: gold }]}>
              {streak}{"  "}DAY LIGHT
            </Text>
          </View>
        </View>

        {/* ── Day navigation pill ── */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            onPress={() => navigateDay(-1)}
            style={[styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Feather name="chevron-left" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={[styles.dateGreg, { color: colors.text }]}>
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>
            <Text style={[styles.dateHijri, { color: gold }]}>
              {islamicDate.day} {islamicDate.month} · {islamicDate.year} AH
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {!isToday ? (
              <TouchableOpacity
                onPress={() => setSelectedKey(today)}
                style={[styles.todayBtn, { borderColor: gold }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.todayBtnText, { color: gold }]}>Today</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => navigateDay(1)}
              style={[styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Feather name="chevron-right" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── MIHRAB FRAME ── */}
        <View style={{ paddingHorizontal: (390 - W) / 2 - 4, marginTop: 12, alignItems: "center" }}>
          <View style={{ width: W, height: H }}>
            <MihrabSvg W={W} H={H} gold={gold} bg={colors.background} surfaceHi={colors.surfaceElevated} />

            {/* Apex Hijri day overlay (positioned over rosette) */}
            <Text
              style={[
                styles.apexDay,
                { color: goldLight, top: archTop + 25, fontFamily: "AmiriQuran_400Regular" },
              ]}
            >
              {toArabicDigits(islamicDate.day)}
            </Text>

            {/* Inside content */}
            <View style={[styles.nicheInside, { paddingTop: archTop + 70 }]}>
              <Text
                style={[
                  styles.heroTime,
                  { color: colors.text, textShadowColor: withAlpha(gold, "44") },
                ]}
              >
                {heroTime}
              </Text>
              <Text style={[styles.heroNow, { color: gold }]}>
                {isToday ? "NOW" : "VIEWING"}
              </Text>

              <View style={{ width: 120, height: 1, backgroundColor: gold, opacity: 0.3, marginTop: 12, marginBottom: 4 }} />

              {/* Lamp lines */}
              <View style={{ width: "100%", paddingHorizontal: 22, marginTop: 6 }}>
                {PRAYERS.map((p) => {
                  const checked = !!dayRecord[p];
                  const isNext = nextPrayerKey === p;
                  const time = prayerTimeMap[p];
                  const ar = PRAYER_LABELS[p].ar;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => onLampPress(p)}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        paddingVertical: 6,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: checked
                          ? withAlpha(gold, "66")
                          : isNext
                            ? withAlpha(gold, "88")
                            : withAlpha(gold, "20"),
                        opacity: pressed ? 0.85 : 1,
                      })}
                      hitSlop={4}
                    >
                      <Animated.View style={{ width: 30, alignItems: "center", transform: [{ scale: lampScales[p] }] }}>
                        <Lamp
                          lit={checked || isNext}
                          glow={isNext}
                          gold={gold}
                          goldLight={goldLight}
                          goldDark={goldDark}
                          mute={mute}
                          haloOp={isNext ? haloOp : undefined}
                        />
                      </Animated.View>
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                        <Text
                          style={[
                            styles.lampName,
                            {
                              color: checked
                                ? colors.text
                                : isNext ? goldLight : withAlpha(colors.text, "AA"),
                            },
                          ]}
                        >
                          {PRAYER_LABELS[p].en}
                        </Text>
                        <Text
                          style={[
                            styles.lampAr,
                            { color: withAlpha(colors.textSecondary, "BB") },
                          ]}
                        >
                          {ar}
                        </Text>
                        {isNext && nextCountdown ? (
                          <Text style={[styles.lampNext, { color: gold }]}>{nextCountdown}</Text>
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.lampTime,
                          { color: checked ? colors.text : isNext ? goldLight : withAlpha(colors.textSecondary, "DD") },
                        ]}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* In-niche progress / backfill action.
                  Today: passive lit-count.
                  Past day with gaps: tappable "I prayed all five" backfill. */}
              {!isToday && completedCount < 5 ? (
                <TouchableOpacity
                  onPress={backfillSelectedDay}
                  activeOpacity={0.85}
                  style={[styles.backfillBtn, { borderColor: gold, backgroundColor: withAlpha(gold, "18") }]}
                  hitSlop={6}
                >
                  <Feather name="check-circle" size={13} color={goldLight} />
                  <Text style={[styles.backfillText, { color: goldLight }]}>
                    I PRAYED ALL FIVE
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.litCount, { color: withAlpha(colors.textSecondary, "AA") }]}>
                  {completedCount} OF 5 LIT
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Quiet nudge toggle ── */}
        {Platform.OS !== "web" && isToday ? (
          <TouchableOpacity
            onPress={togglePreReminder}
            activeOpacity={0.85}
            style={[
              styles.nudgeRow,
              {
                backgroundColor: prayerPreReminderMinutes > 0 ? goldFaint : colors.surface,
                borderColor: prayerPreReminderMinutes > 0 ? goldBorder : colors.border,
              },
            ]}
          >
            <View style={[styles.nudgeIcon, { backgroundColor: prayerPreReminderMinutes > 0 ? goldSoft : colors.surfaceElevated }]}>
              <Feather name="bell" size={13} color={prayerPreReminderMinutes > 0 ? gold : colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nudgeTitle, { color: colors.text }]}>
                Quiet nudge before each prayer
              </Text>
              <Text style={[styles.nudgeSub, { color: colors.textSecondary }]}>
                {prayerPreReminderMinutes > 0
                  ? `On — ${prayerPreReminderMinutes} minutes before adhan`
                  : "Off — tap to remind 15 min before"}
              </Text>
            </View>
            <View
              style={[
                styles.toggleTrack,
                { backgroundColor: prayerPreReminderMinutes > 0 ? gold : colors.border },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  {
                    backgroundColor: colors.surface,
                    transform: [{ translateX: prayerPreReminderMinutes > 0 ? 16 : 0 }],
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ) : null}

        {/* ── Week strip (tasbih beads) ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={[styles.sectionEyebrow, { color: withAlpha(colors.textSecondary, "AA") }]}>
              THIS WEEK · {weekTotal}/35
            </Text>
            <Text style={[styles.sectionMeta, { color: gold }]}>
              {perfectThisWeek} perfect day{perfectThisWeek === 1 ? "" : "s"}
            </Text>
          </View>
          <View style={styles.weekStrip}>
            {weekStrip.map((key) => {
              const d = keyToDate(key);
              const count = countCompleted(trackerData[key] || {});
              const isSelected = key === selectedKey;
              const isTodayKey = key === today;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedKey(key)}
                  activeOpacity={0.7}
                  style={[
                    styles.weekDay,
                    isSelected && { backgroundColor: goldFaint, borderColor: goldBorder, borderWidth: 1 },
                  ]}
                >
                  <Bead
                    count={count}
                    ring={isTodayKey}
                    size={isTodayKey ? 22 : 16}
                    gold={gold}
                    goldLight={goldLight}
                    surface={colors.surfaceElevated}
                    border={colors.border}
                    sparkle={count === 5}
                  />
                  <Text
                    style={[
                      styles.weekDayLetter,
                      { color: isTodayKey || isSelected ? gold : colors.textSecondary },
                    ]}
                  >
                    {DAY_LETTERS[d.getDay()]}
                  </Text>
                  <Text
                    style={[
                      styles.weekDayNum,
                      { color: colors.text, fontFamily: isSelected ? "Inter_700Bold" : "Inter_500Medium" },
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 28-day tasbih grid ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={[styles.sectionEyebrow, { color: withAlpha(colors.textSecondary, "AA") }]}>
              28 DAYS · TASBĪḤ
            </Text>
            <Text style={[styles.sectionMeta, { color: goldDark }]}>
              {streak} → {milestone} STREAK
            </Text>
          </View>
          <View style={[styles.tasbihCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Connecting hairlines behind beads */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              {[0, 1, 2, 3].map((row) => (
                <View
                  key={row}
                  style={{
                    position: "absolute",
                    left: 18, right: 18,
                    top: 22 + row * 30,
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: gold,
                    opacity: 0.18,
                  }}
                />
              ))}
            </View>
            {[0, 1, 2, 3].map((row) => (
              <View key={row} style={styles.tasbihRow}>
                {Array.from({ length: 7 }).map((_, col) => {
                  const cell = heat[row * 7 + col];
                  if (!cell) return null;
                  return (
                    <TouchableOpacity
                      key={col}
                      onPress={() => setSelectedKey(cell.key)}
                      activeOpacity={0.7}
                      style={styles.tasbihBead}
                    >
                      <Bead
                        count={cell.count}
                        ring={cell.isToday}
                        size={cell.isToday ? 18 : 14}
                        gold={gold}
                        goldLight={goldLight}
                        surface={colors.surfaceElevated}
                        border={colors.border}
                        sparkle={cell.count === 5}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* ── Sunnah Prayers entry ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/sunnah-prayers")}
          style={[styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.linkIcon, { backgroundColor: goldSoft, borderColor: goldBorder }]}>
            <Feather name="moon" size={16} color={gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>Sunnah prayers</Text>
            <Text style={[styles.linkSub, { color: colors.textSecondary }]}>
              Rawātib, Ḍuḥā, Tahajjud, Witr & more
            </Text>
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
            <Feather name="bookmark" size={16} color={gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>Make-up prayers</Text>
            <Text style={[styles.linkSub, { color: colors.textSecondary }]}>
              A quiet ledger for qaḍā · private to you
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* ── Ornament ── */}
        <View style={styles.ornament}>
          <View style={[styles.ornamentLine, { backgroundColor: goldBorder }]} />
          <Text style={[styles.ornamentGlyph, { color: gold }]}>﷽</Text>
          <View style={[styles.ornamentLine, { backgroundColor: goldBorder }]} />
        </View>
      </ScrollView>

      <CelebrationOverlay
        visible={!!celebration}
        kind={celebration?.kind ?? "perfect"}
        headline={celebration?.headline ?? ""}
        sub={celebration?.sub ?? ""}
        gold={gold}
        goldLight={goldLight}
        surface={colors.surface}
        text={colors.text}
        onDismiss={() => setCelebration(null)}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Status bar
  statusBar: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", justifyContent: "center",
  },
  eyebrowDate: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.6 },
  eyebrowGreg: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  streakChip: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1,
    shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 0 },
  },
  streakChipText: {
    fontSize: 10, fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
  },

  // Date row
  dateRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 8, paddingHorizontal: 16,
  },
  navBtn: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  dateGreg: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dateHijri: { fontSize: 11, fontFamily: "AmiriQuran_400Regular", marginTop: 1 },
  todayBtn: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  todayBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  // Mihrab interior
  apexDay: {
    position: "absolute",
    left: 0, right: 0,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },
  nicheInside: {
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: "center",
  },
  heroTime: {
    fontSize: 40, fontFamily: "Inter_700Bold",
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  heroNow: {
    fontSize: 9, fontFamily: "Inter_700Bold",
    letterSpacing: 3,
    marginTop: 4,
  },
  lampName: { fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: 0.2 },
  lampAr: { fontSize: 12, fontFamily: "AmiriQuran_400Regular" },
  lampNext: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5, marginLeft: 4 },
  lampTime: { fontSize: 12, fontFamily: "Inter_600SemiBold", fontVariant: ["tabular-nums"] },
  litCount: {
    fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2.5,
    marginTop: 8,
  },
  backfillBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    marginTop: 10,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1,
  },
  backfillText: {
    fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.6,
  },

  // Quiet nudge
  nudgeRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 16, marginTop: 14, padding: 12,
    borderRadius: 14, borderWidth: 1,
  },
  nudgeIcon: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  nudgeTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  nudgeSub: { fontSize: 10.5, fontFamily: "Inter_400Regular", marginTop: 2 },
  toggleTrack: {
    width: 38, height: 22, borderRadius: 11,
    padding: 2,
  },
  toggleThumb: {
    width: 18, height: 18, borderRadius: 9,
    shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  // Sections
  section: { paddingHorizontal: 20, marginTop: 18 },
  sectionHeadRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 10,
  },
  sectionEyebrow: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.6 },
  sectionMeta: { fontSize: 10.5, fontFamily: "Inter_700Bold", letterSpacing: 1 },

  weekStrip: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  weekDay: {
    flex: 1, alignItems: "center", gap: 4,
    paddingVertical: 8, borderRadius: 12,
    borderColor: "transparent", borderWidth: 0,
  },
  weekDayLetter: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.4, marginTop: 2 },
  weekDayNum: { fontSize: 13 },

  tasbihCard: {
    paddingVertical: 8, paddingHorizontal: 4,
    borderRadius: 14, borderWidth: 1,
    position: "relative", overflow: "hidden",
  },
  tasbihRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 4,
  },
  tasbihBead: { alignItems: "center", padding: 2 },

  // Link cards
  linkCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 20, marginTop: 14, padding: 14,
    borderRadius: 16, borderWidth: 1,
  },
  linkIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  linkTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  linkSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },

  // Ornament
  ornament: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginTop: 22, paddingHorizontal: 60,
  },
  ornamentLine: { flex: 1, height: StyleSheet.hairlineWidth },
  ornamentGlyph: { fontSize: 22, fontFamily: "AmiriQuran_400Regular" },
});
