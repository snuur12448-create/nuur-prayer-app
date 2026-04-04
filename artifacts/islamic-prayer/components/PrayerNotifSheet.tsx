import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
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
  PRAYER_EMOJI,
  PrayerKey,
  PrayerNotifSettings,
} from "@/utils/prayerNotifData";

interface Props {
  visible: boolean;
  prayerKey: PrayerKey;
  prayerName: string;
  settings: PrayerNotifSettings;
  colors: any;
  onSave: (settings: PrayerNotifSettings) => void;
  onClose: () => void;
}

export function PrayerNotifSheet({
  visible,
  prayerKey,
  prayerName,
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

  // Reset local state when opened
  useEffect(() => {
    if (visible) {
      setEnabled(settings.enabled);
      setType(isSunrise ? (settings.type === "adhan" ? "notification" : settings.type) : settings.type);
      setAdhanStyleId(settings.adhanStyleId);
      setAdhanMode(settings.adhanMode);
      setDays([...settings.days]);
      setMinutesBefore((settings.minutesBefore as SunriseMinutesBefore) ?? 20);
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

  // Swipe-down-to-dismiss: attach panHandlers to the drag-handle area so the
  // user can grab the pill and pull the sheet down to close it.
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

  const emoji = PRAYER_EMOJI[prayerKey];
  const arabic = PRAYER_ARABIC[prayerKey];
  const GOLD = colors.gold ?? "#C9933A";

  const typeOptions = isSunrise ? SUNRISE_NOTIF_TYPES : NOTIF_TYPES;

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
          {/* Drag handle — tap or swipe down to dismiss */}
          <View style={styles.handleArea} {...panResponder.panHandlers}>
            <Pressable onPress={handleClose} hitSlop={16}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </Pressable>
          </View>

          {/* Header */}
          <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.prayerBadge, { backgroundColor: GOLD + "22", borderColor: GOLD + "55" }]}>
                <Text style={styles.prayerEmoji}>{emoji}</Text>
              </View>
              <View style={{ gap: 1 }}>
                <Text style={[styles.prayerName, { color: colors.text }]}>{prayerName}</Text>
                <Text style={[styles.prayerArabic, { color: GOLD }]}>{arabic}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={12} style={[styles.closeBtn, { backgroundColor: colors.border }]}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* ── Purpose hint for sunrise ── */}
            {isSunrise && (
              <View style={[styles.hintBox, { backgroundColor: GOLD + "12", borderColor: GOLD + "35" }]}>
                <Feather name="sunrise" size={14} color={GOLD} />
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  Get a reminder before sunrise so you can complete Fajr prayer in time.
                </Text>
              </View>
            )}

            {/* ── Master toggle ── */}
            <View style={[styles.toggleRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.toggleLeft}>
                <View style={[styles.toggleIconWrap, { backgroundColor: enabled ? GOLD + "25" : colors.border }]}>
                  <Feather name={enabled ? "bell" : "bell-off"} size={16} color={enabled ? GOLD : colors.textSecondary} />
                </View>
                <View>
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>Notifications</Text>
                  <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                    {enabled ? formatDays(days) : "Off"}
                  </Text>
                </View>
              </View>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ false: colors.border, true: GOLD + "88" }}
                thumbColor={enabled ? GOLD : colors.textSecondary}
                ios_backgroundColor={colors.border}
              />
            </View>

            {enabled && (
              <>
                {/* ── Minutes before (sunrise only) ── */}
                {isSunrise && (
                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Remind Me Before Sunrise</Text>
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
                                backgroundColor: sel ? GOLD + "18" : colors.background,
                                borderColor: sel ? GOLD : colors.border,
                                borderWidth: sel ? 1.5 : 1,
                              },
                            ]}
                          >
                            <Text style={[styles.minutesNum, { color: sel ? GOLD : colors.text }]}>{min}</Text>
                            <Text style={[styles.minutesUnit, { color: sel ? GOLD : colors.textSecondary }]}>min</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {/* Preview message */}
                    <View style={[styles.previewBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <Feather name="message-square" size={12} color={colors.textSecondary} />
                      <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                        "Fajr ends in {minutesBefore} minutes — pray before sunrise"
                      </Text>
                    </View>
                  </View>
                )}

                {/* ── Alert type cards ── */}
                <View style={styles.sectionBlock}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Alert Type</Text>
                  <View style={styles.typeCards}>
                    {typeOptions.map((t: NotifTypeInfo) => {
                      const selected = type === t.id;
                      return (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => setType(t.id)}
                          activeOpacity={0.75}
                          style={[
                            styles.typeCard,
                            {
                              backgroundColor: selected ? GOLD + "15" : colors.background,
                              borderColor: selected ? GOLD : colors.border,
                            },
                          ]}
                        >
                          <View style={styles.typeCardTop}>
                            <View style={[styles.typeIconCircle, { backgroundColor: selected ? GOLD + "30" : colors.border }]}>
                              <Feather name={t.icon as any} size={15} color={selected ? GOLD : colors.textSecondary} />
                            </View>
                            {selected && (
                              <View style={[styles.selectedDot, { backgroundColor: GOLD }]} />
                            )}
                          </View>
                          <Text style={[styles.typeCardLabel, { color: selected ? GOLD : colors.text }]}>{t.label}</Text>
                          <Text style={[styles.typeCardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{t.description}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* ── Adhan options (only when type=adhan, never for sunrise) ── */}
                {!isSunrise && type === "adhan" && (
                  <>
                    {/* Reciter picker */}
                    <View style={styles.sectionBlock}>
                      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Adhan Reciter</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reciterRow}>
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
                                  backgroundColor: sel ? GOLD + "20" : colors.background,
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
                    </View>

                    {/* Adhan length */}
                    <View style={styles.sectionBlock}>
                      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Adhan Length</Text>
                      <View style={[styles.modeRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        {(["full", "short"] as const).map((m) => {
                          const sel = adhanMode === m;
                          return (
                            <TouchableOpacity
                              key={m}
                              onPress={() => setAdhanMode(m)}
                              style={[
                                styles.modeChip,
                                { backgroundColor: sel ? GOLD + "20" : "transparent", borderColor: sel ? GOLD : "transparent" },
                              ]}
                            >
                              <Feather name={m === "full" ? "volume-2" : "volume-1"} size={14} color={sel ? GOLD : colors.textSecondary} />
                              <Text style={[styles.modeLabel, { color: sel ? GOLD : colors.textSecondary }]}>
                                {m === "full" ? "Full (~3–5 min)" : "Short (~2 min)"}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </>
                )}

                {/* ── Days of week ── */}
                <View style={styles.sectionBlock}>
                  <View style={styles.daysHeader}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Repeat</Text>
                    <Text style={[styles.daysFormatted, { color: GOLD }]}>{formatDays(days)}</Text>
                  </View>
                  <View style={styles.daysRow}>
                    {DAY_LABELS.map((label, idx) => {
                      const active = days.includes(idx);
                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => toggleDay(idx)}
                          activeOpacity={0.75}
                          style={[
                            styles.dayCircle,
                            {
                              backgroundColor: active ? GOLD : colors.background,
                              borderColor: active ? GOLD : colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.dayLabel, { color: active ? "#fff" : colors.textSecondary }]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {days.includes(5) && (
                    <View style={[styles.jummahBadge, { backgroundColor: GOLD + "18", borderColor: GOLD + "44" }]}>
                      <Text style={[styles.jummahText, { color: GOLD }]}>☾  Friday — Jumu'ah included</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* ── Save button ── */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              style={[styles.saveBtn, { backgroundColor: GOLD }]}
            >
              <Feather name="check" size={16} color="#fff" />
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </TouchableOpacity>
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
  handleArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 60,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },

  /* Header */
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prayerBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerEmoji: { fontSize: 22 },
  prayerName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  prayerArabic: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    padding: 20,
    gap: 20,
  },

  /* Sunrise hint */
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },

  /* Master toggle */
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  toggleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  toggleSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },

  /* Section */
  sectionBlock: { gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },

  /* Minutes before (sunrise) */
  minutesRow: {
    flexDirection: "row",
    gap: 10,
  },
  minutesChip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  minutesNum: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  minutesUnit: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* Preview message */
  previewBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  previewText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 18,
  },

  /* Type cards */
  typeCards: {
    flexDirection: "row",
    gap: 10,
  },
  typeCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    gap: 6,
    minHeight: 100,
  },
  typeCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeCardLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  typeCardDesc: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    lineHeight: 14,
  },

  /* Reciter */
  reciterRow: {
    gap: 8,
    paddingRight: 4,
  },
  reciterChip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 100,
    gap: 2,
  },
  reciterName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  reciterLoc: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },

  /* Adhan mode */
  modeRow: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    gap: 0,
  },
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    margin: 4,
    borderWidth: 1.5,
  },
  modeLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  /* Days */
  daysHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  daysFormatted: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  dayLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  jummahBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
  },
  jummahText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },

  /* Save */
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
});
