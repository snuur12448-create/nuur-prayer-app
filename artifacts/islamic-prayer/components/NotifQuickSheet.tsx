import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
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
import { useAppContext } from "@/context/AppContext";
import { PrayerKey } from "@/utils/prayerNotifData";

interface Props {
  visible: boolean;
  onClose: () => void;
  nextPrayerTimeMs: number | null;
}

const FIVE: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const SOUND_MODES: { id: "silent" | "notification" | "adhan"; label: string; icon: keyof typeof Feather.glyphMap; description: string }[] = [
  { id: "silent",       label: "Silent",       icon: "bell-off", description: "No sound" },
  { id: "notification", label: "Notification", icon: "bell",     description: "Default sound" },
  { id: "adhan",        label: "Adhan",        icon: "volume-2", description: "Full adhan" },
];

const PRE_OPTIONS: (0 | 5 | 10 | 15)[] = [0, 5, 10, 15];

function formatSnoozeRemaining(ms: number): string {
  if (ms <= 0) return "";
  const minutes = Math.ceil(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes - hours * 60;
  return remMin > 0 ? `${hours}h ${remMin}m` : `${hours}h`;
}

export function NotifQuickSheet({ visible, onClose, nextPrayerTimeMs }: Props) {
  const {
    themeColors: colors,
    notificationsEnabled,
    toggleNotifications,
    prayerNotifConfig,
    setAllPrayersNotifType,
    notifSnoozeUntil,
    setNotifSnoozeUntil,
    prayerPreReminderMinutes,
    setPrayerPreReminderMinutes,
  } = useAppContext();

  const insets = useSafeAreaInsets();
  const slideY = useRef(new Animated.Value(700)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Compute the dominant sound mode across the 5 obligatory prayers.
  // If they all agree, show that mode; otherwise show "Mixed" via null.
  const types = FIVE.map((k) => prayerNotifConfig[k].type);
  const allEnabled = FIVE.every((k) => prayerNotifConfig[k].enabled);
  const dominantType: "silent" | "notification" | "adhan" | null =
    allEnabled && types.every((t) => t === types[0]) ? types[0] : null;

  const isSnoozed = notifSnoozeUntil > Date.now();
  const snoozeRemaining = isSnoozed ? formatSnoozeRemaining(notifSnoozeUntil - Date.now()) : "";

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: false, tension: 65, friction: 11 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, { toValue: 700, duration: 180, useNativeDriver: false }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    }
  }, [visible, slideY, backdropOpacity]);

  // Drag-down dismissal — same gesture pattern as PrayerNotifSheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6 && g.dy > 0,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.6) {
          onClose();
        } else {
          Animated.spring(slideY, { toValue: 0, useNativeDriver: false, tension: 70, friction: 11 }).start();
        }
      },
    }),
  ).current;

  const handleSnoozeMinutes = (mins: number) => {
    setNotifSnoozeUntil(Date.now() + mins * 60_000);
  };
  const handleSnoozeUntilNext = () => {
    if (!nextPrayerTimeMs) return;
    setNotifSnoozeUntil(nextPrayerTimeMs);
  };
  const handleUnsnooze = () => setNotifSnoozeUntil(0);

  const openFullSettings = () => {
    onClose();
    setTimeout(() => router.push("/(tabs)/settings"), 200);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.55)", opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateY: slideY }],
            borderColor: colors.border,
          },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isSnoozed
                ? `Snoozed for ${snoozeRemaining}`
                : !notificationsEnabled
                  ? "Off — tap below to enable"
                  : dominantType === "silent"
                    ? "All prayers silent"
                    : dominantType === "notification"
                      ? "Standard notifications"
                      : dominantType === "adhan"
                        ? "Full adhan playing"
                        : "Mixed per-prayer settings"}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Feather name="x" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {/* Master switch */}
          <View style={[styles.row, { borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>All notifications</Text>
              <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                Master switch for prayer alerts, daily ayah & hadith
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={() => { void toggleNotifications(); }}
              trackColor={{ false: colors.border, true: colors.tint + "AA" }}
              thumbColor={notificationsEnabled ? colors.tint : colors.textSecondary}
            />
          </View>

          {/* Sound mode — applies to all 5 obligatory prayers */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sound for all prayers</Text>
          <View style={styles.modeRow}>
            {SOUND_MODES.map((m) => {
              const active = dominantType === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setAllPrayersNotifType(m.id)}
                  style={[
                    styles.modeBtn,
                    {
                      backgroundColor: active ? colors.tint + "22" : colors.background,
                      borderColor: active ? colors.tint : colors.border,
                    },
                  ]}
                >
                  <Feather name={m.icon} size={18} color={active ? colors.tint : colors.textSecondary} />
                  <Text style={[styles.modeLabel, { color: active ? colors.tint : colors.text }]} numberOfLines={1}>
                    {m.label}
                  </Text>
                  <Text style={[styles.modeHint, { color: colors.textSecondary }]} numberOfLines={1}>
                    {m.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {dominantType === null && allEnabled && (
            <Text style={[styles.mixedNote, { color: colors.textSecondary }]}>
              Per-prayer overrides set — tap any mode to override all five
            </Text>
          )}

          {/* Pre-prayer reminder */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Pre-prayer reminder</Text>
          <View style={styles.pillRow}>
            {PRE_OPTIONS.map((mins) => {
              const active = prayerPreReminderMinutes === mins;
              return (
                <Pressable
                  key={mins}
                  onPress={() => setPrayerPreReminderMinutes(mins)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: active ? colors.tint + "22" : colors.background,
                      borderColor: active ? colors.tint : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.pillText, { color: active ? colors.tint : colors.text }]}>
                    {mins === 0 ? "Off" : `${mins} min`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Snooze controls */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Snooze</Text>
          {isSnoozed ? (
            <Pressable
              onPress={handleUnsnooze}
              style={[styles.unsnoozeBtn, { borderColor: colors.tint, backgroundColor: colors.tint + "1A" }]}
            >
              <Feather name="bell" size={16} color={colors.tint} />
              <Text style={[styles.unsnoozeText, { color: colors.tint }]}>
                Resume notifications (snoozed {snoozeRemaining})
              </Text>
            </Pressable>
          ) : (
            <View style={styles.snoozeRow}>
              <Pressable
                onPress={() => handleSnoozeMinutes(60)}
                style={[styles.snoozeBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              >
                <Feather name="clock" size={14} color={colors.textSecondary} />
                <Text style={[styles.snoozeText, { color: colors.text }]}>1 hour</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSnoozeMinutes(180)}
                style={[styles.snoozeBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              >
                <Feather name="clock" size={14} color={colors.textSecondary} />
                <Text style={[styles.snoozeText, { color: colors.text }]}>3 hours</Text>
              </Pressable>
              <Pressable
                onPress={handleSnoozeUntilNext}
                disabled={!nextPrayerTimeMs}
                style={[
                  styles.snoozeBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    opacity: nextPrayerTimeMs ? 1 : 0.4,
                  },
                ]}
              >
                <Feather name="skip-forward" size={14} color={colors.textSecondary} />
                <Text style={[styles.snoozeText, { color: colors.text }]}>Until next</Text>
              </Pressable>
            </View>
          )}

          {/* Footer link to full settings */}
          <Pressable onPress={openFullSettings} style={styles.linkRow}>
            <Feather name="settings" size={14} color={colors.tint} />
            <Text style={[styles.linkText, { color: colors.tint }]}>More notification settings</Text>
            <Feather name="chevron-right" size={16} color={colors.tint} />
          </Pressable>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingTop: 6,
    maxHeight: "85%",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 24 },
    }),
  },
  handleArea: { alignItems: "center", paddingVertical: 8 },
  handle: { width: 38, height: 4, borderRadius: 2 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 4,
    paddingBottom: 14,
  },
  title: { fontSize: 19, fontWeight: "700", letterSpacing: -0.2 },
  subtitle: { fontSize: 12.5, marginTop: 2 },
  closeBtn: { padding: 4, marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowHint: { fontSize: 12, marginTop: 2 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginTop: 18,
    marginBottom: 8,
  },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  modeLabel: { fontSize: 13, fontWeight: "600" },
  modeHint: { fontSize: 10.5 },
  mixedNote: { fontSize: 11, marginTop: 6, fontStyle: "italic" },
  pillRow: { flexDirection: "row", gap: 8 },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  pillText: { fontSize: 13, fontWeight: "600" },
  snoozeRow: { flexDirection: "row", gap: 8 },
  snoozeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  snoozeText: { fontSize: 12.5, fontWeight: "600" },
  unsnoozeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  unsnoozeText: { fontSize: 13.5, fontWeight: "600" },
  linkRow: {
    marginTop: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  linkText: { fontSize: 13.5, fontWeight: "600" },
});
