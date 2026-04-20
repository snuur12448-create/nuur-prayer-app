import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ADHAN_STYLES } from "@/utils/adhanData";
import {
  ALL_DAYS,
  DAY_LABELS,
  formatDays,
  NOTIF_TYPES,
  SUNRISE_NOTIF_TYPES,
  SUNRISE_MINUTES_OPTIONS,
  SunriseMinutesBefore,
  NotifTypeInfo,
  PRAYER_ARABIC,
  PrayerKey,
  PrayerNotifSettings,
} from "@/utils/prayerNotifData";

interface Props {
  visible: boolean;
  prayerKey: PrayerKey;
  prayerName: string;
  prayerTime?: string; // optional — shown in header (e.g. "5:42 PM")
  settings: PrayerNotifSettings;
  colors: any;
  onSave: (settings: PrayerNotifSettings) => void;
  onClose: () => void;
}

export function PrayerNotifSheet({
  visible,
  prayerKey,
  prayerName,
  prayerTime,
  settings,
  colors,
  onSave,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const slideY = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const isSunrise = prayerKey === "sunrise";

  // Local editable state
  const [enabled, setEnabled] = useState(settings.enabled);
  const [type, setType] = useState(settings.type);
  const [adhanStyleId, setAdhanStyleId] = useState(settings.adhanStyleId);
  const [adhanMode, setAdhanMode] = useState(settings.adhanMode);
  const [days, setDays] = useState<number[]>(settings.days);
  const [minutesBefore, setMinutesBefore] = useState<SunriseMinutesBefore>(
    (settings.minutesBefore as SunriseMinutesBefore) ?? 20
  );
  const [reciterExpanded, setReciterExpanded] = useState(false);

  // Reset local state when opened
  useEffect(() => {
    if (visible) {
      setEnabled(settings.enabled);
      setType(isSunrise ? (settings.type === "adhan" ? "notification" : settings.type) : settings.type);
      setAdhanStyleId(settings.adhanStyleId);
      setAdhanMode(settings.adhanMode);
      setDays([...settings.days]);
      setMinutesBefore((settings.minutesBefore as SunriseMinutesBefore) ?? 20);
      setReciterExpanded(false);
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: false, tension: 65, friction: 11 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: false }),
      ]).start();
    }
  }, [visible, settings]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: 600, duration: 260, useNativeDriver: false }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start(() => onClose());
  };

  // Swipe-down-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 4,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) slideY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 60 || gs.vy > 0.5) {
          Animated.parallel([
            Animated.timing(slideY, { toValue: 700, duration: 220, useNativeDriver: false }),
            Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
          ]).start(() => onClose());
        } else {
          Animated.spring(slideY, { toValue: 0, useNativeDriver: false, tension: 65, friction: 11 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(slideY, { toValue: 0, useNativeDriver: false, tension: 65, friction: 11 }).start();
      },
    })
  ).current;

  const handleSave = () => {
    const newDays = days.length === 0 ? [...ALL_DAYS] : days;
    onSave({
      enabled,
      type,
      adhanStyleId,
      adhanMode,
      days: newDays,
      ...(isSunrise ? { minutesBefore } : {}),
    });
    handleClose();
  };

  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d)
        ? prev.filter((x) => x !== d)
        : [...prev, d].sort((a, b) => a - b)
    );
  };

  const arabic = PRAYER_ARABIC[prayerKey];
  const GOLD = colors.gold ?? "#C9933A";
  const CARD_BG = colors.surfaceElevated ?? "#23202C";
  const INNER_BG = colors.background ?? "#1A1822";

  const typeOptions = isSunrise ? SUNRISE_NOTIF_TYPES : NOTIF_TYPES;

  // Live preview line — borrowed from "Stage" hypothesis: shows what will actually fire.
  const previewLine = useMemo(() => {
    if (!enabled) return { icon: "bell-off" as const, text: "Notifications off for this prayer" };
    if (isSunrise) {
      return {
        icon: type === "silent" ? ("bell-off" as const) : ("sunrise" as const),
        text:
          type === "silent"
            ? `Silent reminder ${minutesBefore} min before sunrise`
            : `Reminder ${minutesBefore} min before sunrise · default chime`,
      };
    }
    if (type === "silent") return { icon: "bell-off" as const, text: "Silent — vibrate only" };
    if (type === "notification") return { icon: "bell" as const, text: "Banner alert · default chime" };
    const reciter = ADHAN_STYLES.find((r) => r.id === adhanStyleId);
    const reciterName = reciter?.name ?? "Adhan";
    const length = adhanMode === "full" ? "Full ~3–5 min" : "Short ~2 min";
    return { icon: "volume-2" as const, text: `${reciterName} · ${length}` };
  }, [enabled, type, adhanStyleId, adhanMode, minutesBefore, isSunrise]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetWrap,
          { transform: [{ translateY: slideY }], paddingBottom: insets.bottom + 12 },
        ]}
      >
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Top edge gold highlight (from Compose mockup) */}
          <View pointerEvents="none" style={[styles.topEdgeHighlight, { backgroundColor: GOLD + "33" }]} />

          {/* Drag handle — swipe down to dismiss */}
          <View style={styles.handleArea} {...panResponder.panHandlers}>
            <Pressable onPress={handleClose} hitSlop={16}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </Pressable>
          </View>

          {/* Tight inline header: crescent · Maghrib · المغرب · 5:42 PM   [X] */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Feather name="moon" size={14} color={GOLD} style={{ transform: [{ rotate: "-20deg" }] }} />
              <Text style={[styles.headerName, { color: colors.text }]}>{prayerName}</Text>
              <Text style={[styles.headerDot, { color: GOLD + "99" }]}>·</Text>
              <Text style={[styles.headerArabic, { color: GOLD }]}>{arabic}</Text>
              {prayerTime ? (
                <>
                  <Text style={[styles.headerDot, { color: GOLD + "99" }]}>·</Text>
                  <Text style={[styles.headerTime, { color: colors.textSecondary }]}>{prayerTime}</Text>
                </>
              ) : null}
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={12} style={[styles.closeBtn, { backgroundColor: colors.border }]}>
              <Feather name="x" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Live preview chip — borrowed from "Stage" hypothesis */}
          <View style={[styles.previewChip, { backgroundColor: INNER_BG, borderColor: colors.border }]}>
            <Feather
              name={previewLine.icon}
              size={12}
              color={enabled ? GOLD : colors.textSecondary}
            />
            <Text
              numberOfLines={1}
              style={[styles.previewText, { color: enabled ? colors.text : colors.textSecondary }]}
            >
              {previewLine.text}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* ── Single grouped card ── */}
            <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: colors.border }]}>
              {/* ROW 1 — master toggle + 7 day dots inline */}
              <View style={[styles.row, styles.rowDivider, { borderBottomColor: colors.border }]}>
                <View style={styles.rowLeft}>
                  <Switch
                    value={enabled}
                    onValueChange={setEnabled}
                    trackColor={{ false: colors.border, true: GOLD + "AA" }}
                    thumbColor={enabled ? GOLD : colors.textSecondary}
                    ios_backgroundColor={colors.border}
                    style={Platform.OS === "ios" ? undefined : { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                  <Text style={[styles.alertsLabel, { color: colors.text }]}>Alerts</Text>
                </View>

                {/* Day chips */}
                <View style={styles.daysInline}>
                  {DAY_LABELS.map((label, idx) => {
                    const active = enabled && days.includes(idx);
                    const isFriday = idx === 5;
                    return (
                      <View key={idx} style={styles.dayCol}>
                        <TouchableOpacity
                          onPress={() => toggleDay(idx)}
                          activeOpacity={0.7}
                          disabled={!enabled}
                          hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                          style={[
                            styles.dayDot,
                            {
                              backgroundColor: active ? GOLD : colors.border + "55",
                              opacity: enabled ? 1 : 0.5,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayDotLabel,
                              { color: active ? "#1A1822" : colors.textSecondary },
                            ]}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                        {/* Subtle gold underline for Jumu'ah */}
                        {isFriday && active ? (
                          <View style={[styles.jummahUnderline, { backgroundColor: GOLD }]} />
                        ) : (
                          <View style={styles.jummahUnderlineSpacer} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              {enabled && (
                <>
                  {/* ROW 2 — Alert Type segmented OR (sunrise) Reminder Before */}
                  {isSunrise ? (
                    <View style={[styles.rowDivider, styles.sectionPad, { borderBottomColor: colors.border }]}>
                      <View style={styles.miniLabelRow}>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Remind before sunrise</Text>
                      </View>
                      <View style={styles.minutesRow}>
                        {SUNRISE_MINUTES_OPTIONS.map((min) => {
                          const sel = minutesBefore === min;
                          return (
                            <TouchableOpacity
                              key={min}
                              onPress={() => setMinutesBefore(min)}
                              activeOpacity={0.75}
                              style={[
                                styles.minutesChip,
                                {
                                  backgroundColor: sel ? GOLD + "1F" : INNER_BG,
                                  borderColor: sel ? GOLD : colors.border,
                                },
                              ]}
                            >
                              <Text style={[styles.minutesNum, { color: sel ? GOLD : colors.text }]}>{min}</Text>
                              <Text style={[styles.minutesUnit, { color: sel ? GOLD : colors.textSecondary }]}>min</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {/* Type segmented (silent / notification) */}
                      <View style={[styles.segmented, { backgroundColor: INNER_BG, borderColor: colors.border, marginTop: 12 }]}>
                        {typeOptions.map((t: NotifTypeInfo) => {
                          const sel = type === t.id;
                          return (
                            <TouchableOpacity
                              key={t.id}
                              onPress={() => setType(t.id)}
                              activeOpacity={0.85}
                              style={[
                                styles.segment,
                                sel && { backgroundColor: colors.surface, borderColor: colors.border },
                              ]}
                            >
                              <Feather name={t.icon as any} size={13} color={sel ? colors.text : colors.textSecondary} />
                              <Text style={[styles.segmentLabel, { color: sel ? colors.text : colors.textSecondary }]}>
                                {t.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.sectionPad,
                        type === "adhan" ? styles.rowDivider : null,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={[styles.segmented, { backgroundColor: INNER_BG, borderColor: colors.border }]}>
                        {typeOptions.map((t: NotifTypeInfo) => {
                          const sel = type === t.id;
                          return (
                            <TouchableOpacity
                              key={t.id}
                              onPress={() => setType(t.id)}
                              activeOpacity={0.85}
                              style={[
                                styles.segment,
                                sel && { backgroundColor: colors.surface, borderColor: colors.border },
                              ]}
                            >
                              <Feather name={t.icon as any} size={13} color={sel ? colors.text : colors.textSecondary} />
                              <Text style={[styles.segmentLabel, { color: sel ? colors.text : colors.textSecondary }]}>
                                {t.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* ROW 3 — Adhan options (collapsible reciter + length toggle) */}
                  {!isSunrise && type === "adhan" && (
                    <View style={{ backgroundColor: INNER_BG + "66" }}>
                      {/* Reciter — single tappable row that expands inline */}
                      <TouchableOpacity
                        onPress={() => setReciterExpanded((v) => !v)}
                        activeOpacity={0.7}
                        style={[styles.row, styles.rowDivider, { borderBottomColor: colors.border + "66" }]}
                      >
                        <Text style={[styles.rowLabel, { color: colors.text }]}>Reciter</Text>
                        <View style={styles.rowRight}>
                          <Text style={[styles.rowValue, { color: GOLD }]} numberOfLines={1}>
                            {(ADHAN_STYLES.find((r) => r.id === adhanStyleId)?.name) ?? "Choose"}
                            <Text style={{ color: GOLD + "88" }}>
                              {"  · "}
                              {(ADHAN_STYLES.find((r) => r.id === adhanStyleId)?.location.split(",")[0]) ?? ""}
                            </Text>
                          </Text>
                          <Feather
                            name={reciterExpanded ? "chevron-down" : "chevron-right"}
                            size={14}
                            color={colors.textSecondary}
                          />
                        </View>
                      </TouchableOpacity>

                      {reciterExpanded && (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.reciterRow}
                          style={{ borderBottomWidth: 1, borderBottomColor: colors.border + "66" }}
                        >
                          {ADHAN_STYLES.map((style) => {
                            const sel = adhanStyleId === style.id;
                            return (
                              <TouchableOpacity
                                key={style.id}
                                onPress={() => setAdhanStyleId(style.id)}
                                activeOpacity={0.8}
                                style={[
                                  styles.reciterChip,
                                  {
                                    backgroundColor: sel ? GOLD + "20" : colors.surface,
                                    borderColor: sel ? GOLD : colors.border,
                                  },
                                ]}
                              >
                                <Text style={[styles.reciterName, { color: sel ? GOLD : colors.text }]} numberOfLines={1}>
                                  {style.name}
                                </Text>
                                <Text style={[styles.reciterLoc, { color: colors.textSecondary }]} numberOfLines={1}>
                                  {style.location.split(",")[0]}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      )}

                      {/* Length — 2-segment compact toggle */}
                      <View style={[styles.row]}>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>Length</Text>
                        <View style={[styles.miniSegmented, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          {(["full", "short"] as const).map((m) => {
                            const sel = adhanMode === m;
                            return (
                              <TouchableOpacity
                                key={m}
                                onPress={() => setAdhanMode(m)}
                                activeOpacity={0.85}
                                style={[
                                  styles.miniSegment,
                                  sel && { backgroundColor: CARD_BG, borderColor: colors.border },
                                ]}
                              >
                                <Feather
                                  name={m === "full" ? "volume-2" : "volume-1"}
                                  size={11}
                                  color={sel ? colors.text : colors.textSecondary}
                                />
                                <Text style={[styles.miniSegmentLabel, { color: sel ? colors.text : colors.textSecondary }]}>
                                  {m === "full" ? "Full" : "Short"}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* Inset Save button — lives inside the card */}
              <View style={[styles.savePad, { backgroundColor: INNER_BG + "33" }]}>
                <TouchableOpacity
                  onPress={handleSave}
                  activeOpacity={0.88}
                  style={[styles.saveBtn, { backgroundColor: GOLD, shadowColor: GOLD }]}
                >
                  <Text style={styles.saveBtnText}>Save Settings</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tertiary footer — repeat summary in plain language */}
            <View style={styles.footerSummary}>
              <Feather name="repeat" size={11} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {enabled ? formatDays(days) : "Off"}
              </Text>
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    maxHeight: "92%",
  },
  topEdgeHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 60,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  headerName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  headerArabic: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Geeza Pro" : "serif",
  },
  headerDot: {
    fontSize: 13,
  },
  headerTime: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    fontVariant: ["tabular-nums"],
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Live preview chip */
  previewChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  previewText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 16,
    gap: 12,
  },

  /* Single grouped card */
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },

  /* Row primitives */
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "65%",
  },
  rowLabel: {
    fontSize: 13.5,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  alertsLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  sectionPad: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  /* Days inline */
  daysInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dayCol: {
    alignItems: "center",
  },
  dayDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  dayDotLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  jummahUnderline: {
    width: 10,
    height: 2,
    borderRadius: 1,
    marginTop: 3,
  },
  jummahUnderlineSpacer: {
    width: 10,
    height: 2,
    marginTop: 3,
  },

  /* Segmented control (Alert Type) */
  segmented: {
    flexDirection: "row",
    borderRadius: 11,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  segmentLabel: {
    fontSize: 12.5,
    fontFamily: "Inter_600SemiBold",
  },

  /* Mini segmented (Length) */
  miniSegmented: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  miniSegment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  miniSegmentLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  /* Reciter expanded row */
  reciterRow: {
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reciterChip: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 110,
    gap: 1,
  },
  reciterName: {
    fontSize: 12.5,
    fontFamily: "Inter_600SemiBold",
  },
  reciterLoc: {
    fontSize: 10.5,
    fontFamily: "Inter_400Regular",
  },

  /* Sunrise minutes */
  miniLabelRow: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  miniLabel: {
    fontSize: 10.5,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  minutesRow: {
    flexDirection: "row",
    gap: 8,
  },
  minutesChip: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    borderWidth: 1,
  },
  minutesNum: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  minutesUnit: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* Inset Save */
  savePad: {
    padding: 10,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  saveBtnText: {
    color: "#1A1822",
    fontSize: 14.5,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.1,
  },

  /* Footer summary */
  footerSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 4,
  },
  footerText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.1,
  },
});
