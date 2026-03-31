import { Feather } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
} from "@/utils/hijriCalendar";

const GOLD = "#C9933A";
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayCell {
  hDay: number;
  gDay: number;
  gMonth: number; // 1-based
  gYear: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  event: IslamicEvent | null;
}

interface Props {
  /** Called when the user taps the × / back button */
  onClose?: () => void;
}

export function IslamicCalendar({ onClose }: Props) {
  const { themeColors: colors } = useAppContext();

  // ── today in Hijri ────────────────────────────────────────────────────────
  const today = useMemo(() => {
    const now = new Date();
    return gregorianToHijri(now);
  }, []);

  const [hYear, setHYear] = useState(today.hYear);
  const [hMonth, setHMonth] = useState(today.hMonth);
  const [selectedEvent, setSelectedEvent] = useState<IslamicEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);

  // ── derived calendar data ─────────────────────────────────────────────────
  const { days, totalDays, firstWeekday, events } = useMemo(() => {
    const totalDays = getDaysInHijriMonth(hYear, hMonth);
    const firstWeekday = getFirstWeekdayOfHijriMonth(hYear, hMonth);
    const events = getIslamicEventsForMonth(hYear, hMonth);

    const cells: DayCell[] = [];

    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ hDay: 0, gDay: 0, gMonth: 0, gYear: 0, isToday: false, isCurrentMonth: false, event: null });
    }

    for (let d = 1; d <= totalDays; d++) {
      const jd = hijriToJD(hYear, hMonth, d);
      const gDate = jdToDate(jd);
      const isToday =
        hYear === today.hYear && hMonth === today.hMonth && d === today.hDay;
      cells.push({
        hDay: d,
        gDay: gDate.getUTCDate(),
        gMonth: gDate.getUTCMonth() + 1,
        gYear: gDate.getUTCFullYear(),
        isToday,
        isCurrentMonth: true,
        event: events.get(d) ?? null,
      });
    }

    // Pad to complete the last row
    while (cells.length % 7 !== 0) {
      cells.push({ hDay: 0, gDay: 0, gMonth: 0, gYear: 0, isToday: false, isCurrentMonth: false, event: null });
    }

    return { days: cells, totalDays, firstWeekday, events };
  }, [hYear, hMonth, today]);

  const gRange = useMemo(() => hijriMonthToGregorianRange(hYear, hMonth), [hYear, hMonth]);
  const eventDays = useMemo(() => events.size, [events]);

  // ── navigation ────────────────────────────────────────────────────────────
  const prevMonth = useCallback(() => {
    if (hMonth === 1) { setHMonth(12); setHYear(y => y - 1); }
    else setHMonth(m => m - 1);
  }, [hMonth]);

  const nextMonth = useCallback(() => {
    if (hMonth === 12) { setHMonth(1); setHYear(y => y + 1); }
    else setHMonth(m => m + 1);
  }, [hMonth]);

  const goToToday = useCallback(() => {
    setHYear(today.hYear);
    setHMonth(today.hMonth);
  }, [today]);

  const onDayPress = useCallback((cell: DayCell) => {
    if (!cell.isCurrentMonth || !cell.event) return;
    setSelectedEvent(cell.event);
    setEventModalVisible(true);
  }, []);

  // ── render ────────────────────────────────────────────────────────────────
  const rows: DayCell[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }

  const isCurrentViewingMonth = hYear === today.hYear && hMonth === today.hMonth;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <View style={styles.topLeft}>
          <Text style={[styles.topTitle, { color: colors.text }]}>Islamic Calendar</Text>
          <Text style={[styles.topArabic, { color: GOLD }]}>التقويم الإسلامي</Text>
        </View>
        <View style={styles.topRight}>
          {!isCurrentViewingMonth && (
            <TouchableOpacity onPress={goToToday} style={[styles.todayBtn, { borderColor: GOLD + "60" }]} activeOpacity={0.7}>
              <Text style={[styles.todayBtnText, { color: GOLD }]}>Today</Text>
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12} activeOpacity={0.7}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Month navigator ───────────────────────────────────────── */}
        <View style={[styles.monthNav, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={prevMonth} hitSlop={14} style={styles.navArrow} activeOpacity={0.6}>
            <Feather name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.monthCenter}>
            <Text style={[styles.monthArabic, { color: GOLD }]}>{HIJRI_MONTHS_AR[hMonth - 1]}</Text>
            <Text style={[styles.monthEnglish, { color: colors.text }]}>
              {HIJRI_MONTHS_EN[hMonth - 1]} {hYear} AH
            </Text>
            <Text style={[styles.monthGregorian, { color: colors.textSecondary }]}>{gRange}</Text>
          </View>

          <TouchableOpacity onPress={nextMonth} hitSlop={14} style={styles.navArrow} activeOpacity={0.6}>
            <Feather name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Day-of-week headers ───────────────────────────────────── */}
        <View style={styles.dayHeaders}>
          {DAY_LABELS.map((d) => (
            <View key={d} style={styles.dayHeaderCell}>
              <Text style={[styles.dayHeaderText, { color: d === "Fri" ? GOLD : colors.textSecondary }]}>{d}</Text>
            </View>
          ))}
        </View>

        {/* ── Calendar grid ─────────────────────────────────────────── */}
        <View style={[styles.grid, { borderColor: colors.border }]}>
          {rows.map((row, ri) => (
            <View key={ri} style={[styles.gridRow, ri < rows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
              {row.map((cell, ci) => {
                if (!cell.isCurrentMonth) {
                  return <View key={ci} style={styles.gridCell} />;
                }

                const hasEvent = !!cell.event;
                const eventColor = cell.event?.color ?? GOLD;

                return (
                  <Pressable
                    key={ci}
                    onPress={() => onDayPress(cell)}
                    style={({ pressed }) => [
                      styles.gridCell,
                      cell.isToday && { backgroundColor: GOLD },
                      hasEvent && !cell.isToday && pressed && { backgroundColor: colors.surfaceElevated },
                      ci < 6 && { borderRightColor: colors.border, borderRightWidth: StyleSheet.hairlineWidth },
                    ]}
                    disabled={!hasEvent}
                  >
                    {/* Hijri day */}
                    <Text style={[
                      styles.hijriDay,
                      { color: cell.isToday ? "#0B1F1A" : colors.text },
                      hasEvent && !cell.isToday && { color: eventColor },
                    ]}>
                      {cell.hDay}
                    </Text>

                    {/* Gregorian day */}
                    <Text style={[
                      styles.gregDay,
                      { color: cell.isToday ? "#0B1F1A" + "CC" : colors.textSecondary },
                    ]}>
                      {cell.gDay}
                    </Text>

                    {/* Event dot */}
                    {hasEvent && (
                      <View style={[
                        styles.eventDot,
                        { backgroundColor: cell.isToday ? "#0B1F1A" : eventColor },
                      ]} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* ── Event legend for this month ────────────────────────────── */}
        {eventDays > 0 && (
          <View style={[styles.legendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.legendTitle, { color: colors.textSecondary }]}>
              EVENTS THIS MONTH
            </Text>
            {Array.from(events.entries()).map(([day, ev]) => (
              <View key={day} style={[styles.legendRow, { borderTopColor: colors.border }]}>
                <View style={[styles.legendDot, { backgroundColor: ev.color ?? GOLD }]} />
                <View style={styles.legendText}>
                  <Text style={[styles.legendDay, { color: colors.textSecondary }]}>
                    {day} {HIJRI_MONTHS_EN[hMonth - 1]}
                  </Text>
                  <Text style={[styles.legendName, { color: colors.text }]}>{ev.name}</Text>
                  <Text style={[styles.legendArabic, { color: ev.color ?? GOLD }]}>{ev.arabic}</Text>
                </View>
              </View>
            ))}
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

      {/* ── Event popup modal ─────────────────────────────────────────── */}
      <Modal
        visible={eventModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEventModalVisible(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.eventModalBg}
          onPress={() => setEventModalVisible(false)}
        >
          <Pressable
            style={[styles.eventModalCard, { backgroundColor: colors.surface, borderColor: GOLD + "50" }]}
            onPress={() => {}}
          >
            {/* Gold crescent decoration */}
            <Text style={styles.eventModalIcon}>☽</Text>

            <Text style={[styles.eventModalArabic, { color: GOLD }]}>
              {selectedEvent?.arabic}
            </Text>
            <Text style={[styles.eventModalName, { color: colors.text }]}>
              {selectedEvent?.name}
            </Text>

            <View style={[styles.eventModalDivider, { backgroundColor: GOLD + "40" }]} />

            <Text style={[styles.eventModalMonth, { color: colors.textSecondary }]}>
              {HIJRI_MONTHS_EN[hMonth - 1]} {hYear} AH
            </Text>

            <TouchableOpacity
              onPress={() => setEventModalVisible(false)}
              style={[styles.eventModalClose, { backgroundColor: GOLD }]}
              activeOpacity={0.8}
            >
              <Text style={styles.eventModalCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const CELL_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topLeft: {
    gap: 2,
  },
  topTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  topArabic: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  todayBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  todayBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  closeBtn: {
    padding: 4,
  },

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
    padding: 8,
  },
  monthCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  monthArabic: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  monthEnglish: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  monthGregorian: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  /* Day headers */
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  dayHeaderText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },

  /* Grid */
  grid: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: "row",
  },
  gridCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    minHeight: CELL_SIZE,
    gap: 1,
  },
  hijriDay: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  gregDay: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },

  /* Event legend */
  legendCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  legendText: {
    flex: 1,
    gap: 2,
  },
  legendDay: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  legendName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  legendArabic: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  /* Event popup */
  eventModalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  eventModalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: "center",
    gap: 10,
  },
  eventModalIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  eventModalArabic: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  eventModalName: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  eventModalDivider: {
    width: 48,
    height: 1,
    marginVertical: 4,
  },
  eventModalMonth: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  eventModalClose: {
    marginTop: 12,
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  eventModalCloseText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#0B1F1A",
  },

  /* Disclaimer */
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  disclaimerIcon: {
    marginTop: 1,
    opacity: 0.5,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
    opacity: 0.7,
  },
});
