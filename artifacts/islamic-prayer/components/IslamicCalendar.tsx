import { Feather } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from "react-native-svg";
import { useAppContext } from "@/context/AppContext";
import {
  getDaysInHijriMonth,
  getFirstWeekdayOfHijriMonth,
  getIslamicEventsForMonth,
  gregorianToHijri,
  hijriMonthToGregorianRange,
  hijriToJD,
  HIJRI_MONTHS_AR,
  HIJRI_MONTHS_EN,
  IslamicEvent,
  jdToDate,
  RAW_EVENTS,
} from "@/utils/hijriCalendar";

const GOLD = "#C9933A";
const GOLD_SOFT = "#E8D88A";
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayCell {
  hDay: number;
  gDay: number;
  gMonth: number;
  gYear: number;
  isToday: boolean;
  isFriday: boolean;
  isCurrentMonth: boolean;
  event: IslamicEvent | null;
}

interface Props {
  onClose?: () => void;
}

// ── Moon phase ─────────────────────────────────────────────────────────────
// Approximation based on Hijri day-of-month (1 = new, ~14-15 = full).
function moonPhaseForHijriDay(d: number): { illum: number; waxing: boolean; label: string } {
  // 29.53 day cycle; Hijri month is 29 or 30. Use d as proxy from 1..30.
  const cycle = 29.53;
  const phase = ((d - 1) / cycle) * 2 * Math.PI; // 0..~2π
  const illum = (1 - Math.cos(phase)) / 2; // 0..1
  const waxing = d <= 15;
  let label = "Waxing Crescent";
  if (d === 1) label = "New Moon";
  else if (d < 7) label = "Waxing Crescent";
  else if (d < 9) label = "First Quarter";
  else if (d < 14) label = "Waxing Gibbous";
  else if (d <= 16) label = "Full Moon";
  else if (d < 22) label = "Waning Gibbous";
  else if (d < 24) label = "Last Quarter";
  else if (d < 29) label = "Waning Crescent";
  else label = "New Moon";
  return { illum, waxing, label };
}

function MoonPhaseSvg({ size, illum, waxing }: { size: number; illum: number; waxing: boolean }) {
  // Draw a circle then mask the dark side using an offset ellipse approach.
  const r = size / 2;
  const cx = r;
  const cy = r;
  // Width of the lit ellipse (negative when crescent on opposite side)
  const k = Math.abs(1 - 2 * illum); // 0 at full, 1 at new
  const ellipseRx = r * k;
  // For waxing, lit side is right; for waning, lit side is left.
  return (
    <Svg width={size} height={size}>
      <Defs>
        <ClipPath id="moonClip">
          <Circle cx={cx} cy={cy} r={r - 0.5} />
        </ClipPath>
      </Defs>
      {/* Dark base disc */}
      <Circle cx={cx} cy={cy} r={r - 0.5} fill="#1A2A1F" stroke={GOLD + "55"} strokeWidth={0.5} />
      <G clipPath="url(#moonClip)">
        {illum > 0.04 && illum < 0.96 ? (
          <>
            {/* Lit half-disc */}
            <Path
              d={
                waxing
                  ? `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`
                  : `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`
              }
              fill={GOLD_SOFT}
            />
            {/* Subtract/add an ellipse to create the terminator */}
            <Path
              d={`M ${cx} ${cy - r} A ${ellipseRx} ${r} 0 0 ${illum < 0.5 ? (waxing ? 1 : 0) : (waxing ? 0 : 1)} ${cx} ${cy + r} A ${r} ${r} 0 0 ${waxing ? 0 : 1} ${cx} ${cy - r} Z`}
              fill={illum < 0.5 ? "#1A2A1F" : GOLD_SOFT}
            />
          </>
        ) : illum >= 0.96 ? (
          <Circle cx={cx} cy={cy} r={r - 0.5} fill={GOLD_SOFT} />
        ) : null}
      </G>
      {/* Soft glow rim */}
      <Circle cx={cx} cy={cy} r={r - 0.5} fill="none" stroke={GOLD + "33"} strokeWidth={0.8} />
    </Svg>
  );
}

// Tiny decorative 8-point star
function Star8({ size, color, opacity = 1 }: { size: number; color: string; opacity?: number }) {
  const r = size / 2;
  const c = r;
  return (
    <Svg width={size} height={size} opacity={opacity}>
      <G transform={`translate(${c} ${c})`}>
        <Rect x={-r * 0.7} y={-r * 0.7} width={r * 1.4} height={r * 1.4} fill={color} transform="rotate(0)" />
        <Rect x={-r * 0.7} y={-r * 0.7} width={r * 1.4} height={r * 1.4} fill={color} transform="rotate(45)" />
      </G>
    </Svg>
  );
}

// ── Find next upcoming event across months ────────────────────────────────
function findNextEvent(
  todayY: number,
  todayM: number,
  todayD: number
): { hYear: number; hMonth: number; hDay: number; ev: IslamicEvent; daysAway: number } | null {
  // Look up to 13 months ahead.
  const todayJD = hijriToJD(todayY, todayM, todayD);
  let best: { hYear: number; hMonth: number; hDay: number; ev: IslamicEvent; daysAway: number } | null = null;
  for (let offset = 0; offset < 13; offset++) {
    let m = todayM + offset;
    let y = todayY;
    while (m > 12) { m -= 12; y += 1; }
    for (const e of RAW_EVENTS) {
      if (e.month !== m) continue;
      const evJD = hijriToJD(y, m, e.day);
      if (evJD < todayJD) continue;
      const days = evJD - todayJD;
      if (!best || days < best.daysAway) {
        best = {
          hYear: y, hMonth: m, hDay: e.day,
          ev: { name: e.name, arabic: e.arabic, color: e.color },
          daysAway: days,
        };
      }
    }
    if (best && best.daysAway < 30) break;
  }
  return best;
}

export function IslamicCalendar({ onClose }: Props) {
  const { themeColors: colors } = useAppContext();

  const today = useMemo(() => gregorianToHijri(new Date()), []);
  const [hYear, setHYear] = useState(today.hYear);
  const [hMonth, setHMonth] = useState(today.hMonth);
  const [selectedEvent, setSelectedEvent] = useState<IslamicEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);

  const { days, events } = useMemo(() => {
    const totalDays = getDaysInHijriMonth(hYear, hMonth);
    const firstWeekday = getFirstWeekdayOfHijriMonth(hYear, hMonth);
    const events = getIslamicEventsForMonth(hYear, hMonth);
    const cells: DayCell[] = [];

    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ hDay: 0, gDay: 0, gMonth: 0, gYear: 0, isToday: false, isFriday: false, isCurrentMonth: false, event: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      const jd = hijriToJD(hYear, hMonth, d);
      const gDate = jdToDate(jd);
      const gWeekday = gDate.getUTCDay();
      const isToday = hYear === today.hYear && hMonth === today.hMonth && d === today.hDay;
      cells.push({
        hDay: d,
        gDay: gDate.getUTCDate(),
        gMonth: gDate.getUTCMonth() + 1,
        gYear: gDate.getUTCFullYear(),
        isToday,
        isFriday: gWeekday === 5,
        isCurrentMonth: true,
        event: events.get(d) ?? null,
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ hDay: 0, gDay: 0, gMonth: 0, gYear: 0, isToday: false, isFriday: false, isCurrentMonth: false, event: null });
    }
    return { days: cells, events };
  }, [hYear, hMonth, today]);

  const gRange = useMemo(() => hijriMonthToGregorianRange(hYear, hMonth), [hYear, hMonth]);
  const eventDays = events.size;

  const moon = useMemo(() => moonPhaseForHijriDay(today.hDay), [today]);
  const nextEvent = useMemo(
    () => findNextEvent(today.hYear, today.hMonth, today.hDay),
    [today]
  );

  const prevMonth = useCallback(() => {
    if (hMonth === 1) { setHMonth(12); setHYear(y => y - 1); }
    else setHMonth(m => m - 1);
  }, [hMonth]);
  const nextMonth = useCallback(() => {
    if (hMonth === 12) { setHMonth(1); setHYear(y => y + 1); }
    else setHMonth(m => m + 1);
  }, [hMonth]);
  const goToToday = useCallback(() => {
    setHYear(today.hYear); setHMonth(today.hMonth);
  }, [today]);

  const onDayPress = useCallback((cell: DayCell) => {
    if (!cell.isCurrentMonth || !cell.event) return;
    setSelectedEvent(cell.event);
    setEventModalVisible(true);
  }, []);

  const rows: DayCell[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));

  const isCurrentViewingMonth = hYear === today.hYear && hMonth === today.hMonth;
  const todayJD = hijriToJD(today.hYear, today.hMonth, today.hDay);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <View style={styles.topLeft}>
          <Text style={[styles.topTitle, { color: colors.text }]}>Calendar</Text>
          <Text style={[styles.topArabic, { color: GOLD }]}>التقويم الهجري</Text>
        </View>
        <View style={styles.topRight}>
          {!isCurrentViewingMonth && (
            <TouchableOpacity
              onPress={goToToday}
              style={[styles.todayBtn, { borderColor: GOLD + "60" }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Return to the current Hijri month"
            >
              <Feather name="corner-up-left" size={12} color={GOLD} />
              <Text style={[styles.todayBtnText, { color: GOLD }]}>Today</Text>
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close calendar"
            >
              <Text style={[styles.closeBtnText, { color: colors.text }]}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero: Today's Hijri date + Moon phase ───────────────────── */}
        <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: GOLD + "33" }]}>
          {/* corner stars */}
          <View style={styles.heroCornerTL}><Star8 size={10} color={GOLD} opacity={0.5} /></View>
          <View style={styles.heroCornerTR}><Star8 size={10} color={GOLD} opacity={0.5} /></View>
          <View style={styles.heroCornerBL}><Star8 size={10} color={GOLD} opacity={0.5} /></View>
          <View style={styles.heroCornerBR}><Star8 size={10} color={GOLD} opacity={0.5} /></View>

          <View style={styles.heroLeft}>
            <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>TODAY</Text>
            <View style={styles.heroDateRow}>
              <Text style={[styles.heroDay, { color: colors.text }]}>{today.hDay}</Text>
              <View style={styles.heroDateMeta}>
                <Text style={[styles.heroMonthEn, { color: colors.text }]}>
                  {HIJRI_MONTHS_EN[today.hMonth - 1]}
                </Text>
                <Text style={[styles.heroYear, { color: colors.textSecondary }]}>
                  {today.hYear} AH
                </Text>
              </View>
            </View>
            <Text style={[styles.heroArabic, { color: GOLD }]}>
              {today.hDay} {HIJRI_MONTHS_AR[today.hMonth - 1]}
            </Text>
          </View>

          <View style={styles.heroRight}>
            <MoonPhaseSvg size={56} illum={moon.illum} waxing={moon.waxing} />
            <Text style={[styles.heroMoonLabel, { color: colors.textSecondary }]}>{moon.label}</Text>
          </View>
        </View>

        {/* ── Up Next event ─────────────────────────────────────────── */}
        {nextEvent && (
          <Pressable
            onPress={() => {
              setHYear(nextEvent.hYear);
              setHMonth(nextEvent.hMonth);
            }}
            style={({ pressed }) => [
              styles.nextEventCard,
              {
                backgroundColor: (nextEvent.ev.color ?? GOLD) + "14",
                borderColor: (nextEvent.ev.color ?? GOLD) + "55",
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${nextEvent.ev.name}, ${nextEvent.daysAway === 0 ? "today" : `in ${nextEvent.daysAway} days`}`}
          >
            <View style={[styles.nextEventBadge, { backgroundColor: nextEvent.ev.color ?? GOLD }]}>
              <Text style={styles.nextEventBadgeNum}>{nextEvent.hDay}</Text>
              <Text style={styles.nextEventBadgeMonth}>
                {HIJRI_MONTHS_EN[nextEvent.hMonth - 1].slice(0, 3).toUpperCase()}
              </Text>
            </View>
            <View style={styles.nextEventBody}>
              <Text style={[styles.nextEventLabel, { color: colors.textSecondary }]}>
                {nextEvent.daysAway === 0 ? "TODAY" : nextEvent.daysAway === 1 ? "TOMORROW" : `IN ${nextEvent.daysAway} DAYS`}
              </Text>
              <Text style={[styles.nextEventName, { color: colors.text }]} numberOfLines={1}>
                {nextEvent.ev.name}
              </Text>
              <Text style={[styles.nextEventArabic, { color: nextEvent.ev.color ?? GOLD }]} numberOfLines={1}>
                {nextEvent.ev.arabic}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </Pressable>
        )}

        {/* ── Month navigator ───────────────────────────────────────── */}
        <View style={[styles.monthNav, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={prevMonth}
            style={[styles.navArrow, { borderColor: colors.border }]}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="Previous Hijri month"
          >
            <Feather name="chevron-left" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.monthCenter}>
            <View style={styles.monthOrnamentRow}>
              <View style={[styles.ornamentLine, { backgroundColor: GOLD + "55" }]} />
              <View style={[styles.ornamentDot, { backgroundColor: GOLD }]} />
              <View style={[styles.ornamentLine, { backgroundColor: GOLD + "55" }]} />
            </View>
            <Text style={[styles.monthArabic, { color: GOLD }]}>{HIJRI_MONTHS_AR[hMonth - 1]}</Text>
            <Text style={[styles.monthEnglish, { color: colors.text }]}>
              {HIJRI_MONTHS_EN[hMonth - 1]} {hYear} AH
            </Text>
            <Text style={[styles.monthGregorian, { color: colors.textSecondary }]}>{gRange}</Text>
          </View>

          <TouchableOpacity
            onPress={nextMonth}
            style={[styles.navArrow, { borderColor: colors.border }]}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="Next Hijri month"
          >
            <Feather name="chevron-right" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Day-of-week headers ───────────────────────────────────── */}
        <View style={styles.dayHeaders}>
          {DAY_LABELS.map((d) => {
            const isFri = d === "Fri";
            return (
              <View key={d} style={styles.dayHeaderCell}>
                <Text style={[styles.dayHeaderText, { color: isFri ? GOLD : colors.textSecondary }]}>
                  {d}
                </Text>
                {isFri && <View style={[styles.fridayUnderline, { backgroundColor: GOLD }]} />}
              </View>
            );
          })}
        </View>

        {/* ── Calendar grid ─────────────────────────────────────────── */}
        <View style={[styles.grid, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          {rows.map((row, ri) => (
            <View key={ri} style={[styles.gridRow, ri < rows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
              {row.map((cell, ci) => {
                if (!cell.isCurrentMonth) {
                  return (
                    <View
                      key={ci}
                      style={[
                        styles.gridCell,
                        ci < 6 && { borderRightColor: colors.border, borderRightWidth: StyleSheet.hairlineWidth },
                      ]}
                    />
                  );
                }

                const hasEvent = !!cell.event;
                const eventColor = cell.event?.color ?? GOLD;
                const fridayBg = cell.isFriday && !cell.isToday ? GOLD + "0E" : "transparent";

                return (
                  <Pressable
                    key={ci}
                    onPress={() => onDayPress(cell)}
                    style={({ pressed }) => [
                      styles.gridCell,
                      { backgroundColor: pressed && hasEvent ? colors.surfaceElevated : fridayBg },
                      ci < 6 && { borderRightColor: colors.border, borderRightWidth: StyleSheet.hairlineWidth },
                    ]}
                    disabled={!hasEvent}
                    accessibilityRole={hasEvent ? "button" : undefined}
                    accessibilityLabel={hasEvent ? `${cell.event?.name}, ${cell.hDay} ${HIJRI_MONTHS_EN[hMonth - 1]} ${hYear}` : undefined}
                  >
                    {/* Hijri day with optional ring */}
                    <View
                      style={[
                        styles.dayBubble,
                        cell.isToday && { backgroundColor: GOLD },
                        hasEvent && !cell.isToday && {
                          borderWidth: 1.5,
                          borderColor: eventColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.hijriDay,
                          { color: cell.isToday ? "#0B1F1A" : colors.text },
                          hasEvent && !cell.isToday && { color: eventColor },
                        ]}
                      >
                        {cell.hDay}
                      </Text>
                    </View>

                    {/* Gregorian day */}
                    <Text style={[
                      styles.gregDay,
                      { color: cell.isToday ? "#0B1F1A" : colors.textSecondary },
                      cell.isFriday && !cell.isToday && { color: GOLD, opacity: 0.85 },
                    ]}>
                      {cell.gDay}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* ── Legend for grid ─────────────────────────────────────── */}
        <View style={styles.gridLegend}>
          <View style={styles.gridLegendItem}>
            <View style={[styles.gridLegendSwatch, { backgroundColor: GOLD }]} />
            <Text style={[styles.gridLegendText, { color: colors.textSecondary }]}>Today</Text>
          </View>
          <View style={styles.gridLegendItem}>
            <View style={[styles.gridLegendSwatch, { borderWidth: 1.5, borderColor: GOLD, backgroundColor: "transparent" }]} />
            <Text style={[styles.gridLegendText, { color: colors.textSecondary }]}>Holy day</Text>
          </View>
          <View style={styles.gridLegendItem}>
            <View style={[styles.gridLegendSwatch, { backgroundColor: GOLD + "1A" }]} />
            <Text style={[styles.gridLegendText, { color: colors.textSecondary }]}>Jumuʿah</Text>
          </View>
        </View>

        {/* ── Events this month ────────────────────────────────────── */}
        {eventDays > 0 && (
          <View style={[styles.legendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.legendHeader}>
              <Text style={styles.legendCrescent}>☽</Text>
              <Text style={[styles.legendTitle, { color: colors.textSecondary }]}>
                EVENTS THIS MONTH
              </Text>
            </View>
            {Array.from(events.entries())
              .sort(([a], [b]) => a - b)
              .map(([day, ev]) => {
                const evJD = hijriToJD(hYear, hMonth, day);
                const days = evJD - todayJD;
                let when = "";
                if (days === 0) when = "Today";
                else if (days === 1) when = "Tomorrow";
                else if (days > 0 && days < 30) when = `In ${days} days`;
                else if (days < 0 && days > -30) when = `${-days} day${days === -1 ? "" : "s"} ago`;
                return (
                  <View key={day} style={[styles.legendRow, { borderTopColor: colors.border }]}>
                    <View style={[styles.legendBadge, { backgroundColor: (ev.color ?? GOLD) + "1F", borderColor: (ev.color ?? GOLD) + "66" }]}>
                      <Text style={[styles.legendBadgeNum, { color: ev.color ?? GOLD }]}>{day}</Text>
                    </View>
                    <View style={styles.legendText}>
                      <Text style={[styles.legendName, { color: colors.text }]}>{ev.name}</Text>
                      <Text style={[styles.legendArabic, { color: ev.color ?? GOLD }]}>{ev.arabic}</Text>
                      {when ? (
                        <Text style={[styles.legendWhen, { color: colors.textSecondary }]}>{when}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        {/* ── Disclaimer ───────────────────────────────────────────── */}
        <View style={styles.disclaimer}>
          <Feather name="info" size={11} color={colors.textSecondary} style={styles.disclaimerIcon} />
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            Islamic event dates are calculated estimates. Actual dates may vary by 1–2 days subject to moon sighting in your region.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Event popup */}
      <Modal
        visible={eventModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEventModalVisible(false)}
        statusBarTranslucent
        presentationStyle="overFullScreen"
      >
        <Pressable style={styles.eventModalBg} onPress={() => setEventModalVisible(false)}>
          <Pressable
            style={[styles.eventModalCard, { backgroundColor: colors.surface, borderColor: GOLD + "50" }]}
            onPress={() => {}}
            accessibilityViewIsModal
            onAccessibilityEscape={() => setEventModalVisible(false)}
          >
            <Text style={styles.eventModalIcon}>☽</Text>
            <Text style={[styles.eventModalArabic, { color: GOLD }]}>{selectedEvent?.arabic}</Text>
            <Text style={[styles.eventModalName, { color: colors.text }]}>{selectedEvent?.name}</Text>
            <View style={[styles.eventModalDivider, { backgroundColor: GOLD + "40" }]} />
            <Text style={[styles.eventModalMonth, { color: colors.textSecondary }]}>
              {HIJRI_MONTHS_EN[hMonth - 1]} {hYear} AH
            </Text>
            <TouchableOpacity
              onPress={() => setEventModalVisible(false)}
              style={[styles.eventModalClose, { backgroundColor: GOLD }]}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Close event details"
            >
              <Text style={styles.eventModalCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const CELL_MIN_HEIGHT = 60;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },

  /* Top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topLeft: { gap: 2 },
  topTitle: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  topArabic: { fontSize: 13, fontFamily: "Inter_500Medium" },
  topRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  todayBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderRadius: 22, paddingHorizontal: 12, minHeight: 44,
  },
  todayBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  closeBtn: {
    minWidth: 64,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  /* Hero */
  hero: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 14,
    overflow: "hidden",
    position: "relative",
  },
  heroCornerTL: { position: "absolute", top: 8, left: 8 },
  heroCornerTR: { position: "absolute", top: 8, right: 8 },
  heroCornerBL: { position: "absolute", bottom: 8, left: 8 },
  heroCornerBR: { position: "absolute", bottom: 8, right: 8 },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2, marginBottom: 6 },
  heroDateRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  heroDay: {
    fontSize: 48, fontFamily: "Inter_700Bold", letterSpacing: -2,
    fontVariant: ["tabular-nums"], includeFontPadding: false, lineHeight: 50,
  },
  heroDateMeta: { paddingBottom: 6 },
  heroMonthEn: { fontSize: 17, fontFamily: "Inter_600SemiBold", letterSpacing: -0.3 },
  heroYear: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  heroArabic: { fontSize: 16, fontFamily: "Inter_500Medium", marginTop: 6 },
  heroRight: { alignItems: "center", gap: 6, paddingLeft: 12 },
  heroMoonLabel: { fontSize: 9, fontFamily: "Inter_500Medium", letterSpacing: 0.5, textAlign: "center", maxWidth: 70 },

  /* Up next event */
  nextEventCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 14,
  },
  nextEventBadge: {
    width: 52, height: 56, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  nextEventBadgeNum: {
    fontSize: 22, fontFamily: "Inter_700Bold", color: "#0B1F1A",
    fontVariant: ["tabular-nums"], lineHeight: 24,
  },
  nextEventBadgeMonth: {
    fontSize: 9, fontFamily: "Inter_700Bold", color: "#0B1F1A",
    letterSpacing: 1, opacity: 0.8, marginTop: 2,
  },
  nextEventBody: { flex: 1, gap: 2 },
  nextEventLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  nextEventName: { fontSize: 15, fontFamily: "Inter_600SemiBold", letterSpacing: -0.2 },
  nextEventArabic: { fontSize: 14, fontFamily: "Inter_500Medium" },

  /* Month navigator */
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  navArrow: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
    marginHorizontal: 4,
  },
  monthCenter: { flex: 1, alignItems: "center", gap: 3 },
  monthOrnamentRow: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4,
  },
  ornamentLine: { width: 24, height: 1 },
  ornamentDot: { width: 4, height: 4, borderRadius: 2, transform: [{ rotate: "45deg" }] },
  monthArabic: { fontSize: 24, fontFamily: "Inter_700Bold" },
  monthEnglish: { fontSize: 16, fontFamily: "Inter_600SemiBold", letterSpacing: -0.2 },
  monthGregorian: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  /* Day headers */
  dayHeaders: { flexDirection: "row", marginBottom: 6 },
  dayHeaderCell: { flex: 1, alignItems: "center", paddingVertical: 6 },
  dayHeaderText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  fridayUnderline: { width: 14, height: 2, borderRadius: 1, marginTop: 3, opacity: 0.7 },

  /* Grid */
  grid: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 14,
  },
  gridRow: { flexDirection: "row" },
  gridCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minHeight: CELL_MIN_HEIGHT,
    gap: 3,
  },
  dayBubble: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  hijriDay: {
    fontSize: 16, fontFamily: "Inter_600SemiBold",
    fontVariant: ["tabular-nums"], includeFontPadding: false,
  },
  gregDay: {
    fontSize: 10, fontFamily: "Inter_500Medium",
    fontVariant: ["tabular-nums"], includeFontPadding: false,
  },

  /* Grid legend */
  gridLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  gridLegendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  gridLegendSwatch: { width: 14, height: 14, borderRadius: 7 },
  gridLegendText: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },

  /* Events legend */
  legendCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  legendHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  legendCrescent: { fontSize: 16, color: GOLD },
  legendTitle: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  legendBadge: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  legendBadgeNum: { fontSize: 15, fontFamily: "Inter_700Bold", fontVariant: ["tabular-nums"] },
  legendText: { flex: 1, gap: 2 },
  legendName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  legendArabic: { fontSize: 13, fontFamily: "Inter_500Medium" },
  legendWhen: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },

  /* Event popup */
  eventModalBg: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center", paddingHorizontal: 32,
  },
  eventModalCard: {
    width: "100%", maxWidth: 340,
    borderRadius: 24, borderWidth: 1,
    paddingHorizontal: 28, paddingVertical: 32,
    alignItems: "center", gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  eventModalIcon: { fontSize: 36, marginBottom: 4, color: GOLD },
  eventModalArabic: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  eventModalName: {
    fontSize: 17, fontFamily: "Inter_600SemiBold",
    textAlign: "center", letterSpacing: -0.2,
  },
  eventModalDivider: { width: 48, height: 1, marginVertical: 4 },
  eventModalMonth: { fontSize: 12, fontFamily: "Inter_400Regular" },
  eventModalClose: {
    marginTop: 12, borderRadius: 24,
    paddingHorizontal: 40, paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  eventModalCloseText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0B1F1A" },

  /* Disclaimer */
  disclaimer: {
    flexDirection: "row", alignItems: "flex-start", gap: 7,
    paddingHorizontal: 4, marginBottom: 4,
  },
  disclaimerIcon: { marginTop: 1, opacity: 0.5 },
  disclaimerText: {
    flex: 1, fontSize: 11, fontFamily: "Inter_400Regular",
    lineHeight: 16, opacity: 0.7,
  },
});
