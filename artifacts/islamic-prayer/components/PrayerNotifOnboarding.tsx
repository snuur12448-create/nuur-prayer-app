import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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
import { ADHAN_STYLES, DEFAULT_ADHAN_STYLE_ID } from "@/utils/adhanData";
import { previewAdhan, stopAdhanAudio } from "@/utils/adhanPlayer";
import {
  DEFAULT_PRAYER_NOTIF_CONFIG,
  DEFAULT_PRAYER_NOTIF_SETTINGS,
  type PrayerKey,
  type PrayerNotifConfig,
  type PrayerNotifSettings,
  type PrayerNotifType,
} from "@/utils/prayerNotifData";

export const NOTIF_RITUAL_KEY = "nuur_notif_ritual_done";
// Mirrors STORAGE_KEYS.PRAYER_NOTIF_CONFIG in AppContext.tsx — keep in sync.
const PRAYER_NOTIF_CONFIG_STORAGE_KEY = "prayer_notif_config";

const BG = "#050508";
const GOLD = "#C9933A";
const GOLD_DEEP = "#B37B24";
const TEXT = "rgba(255,255,255,0.92)";
const TEXT_DIM = "rgba(255,255,255,0.50)";
const TEXT_FAINT = "rgba(255,255,255,0.40)";
const BORDER_DIM = "rgba(255,255,255,0.05)";
const BORDER_GOLD = "rgba(201,147,58,0.40)";

const SERIF = Platform.OS === "ios" ? "Times New Roman" : "serif";
const ARABIC_SERIF = Platform.OS === "ios" ? "Geeza Pro" : "serif";

const DAILY_PRAYERS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

type AlertChoice = PrayerNotifType;

interface AlertTileDef {
  id: AlertChoice;
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
}

const ALERT_TILES: AlertTileDef[] = [
  { id: "silent", icon: "bell-off", label: "Silent" },
  { id: "notification", icon: "bell", label: "Gentle\nChime" },
  { id: "adhan", icon: "volume-2", label: "Full\nAdhan" },
];

interface Props {
  onComplete: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function PrayerNotifOnboarding({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const { setPrayerNotifSettings, prayerNotifConfig } = useAppContext();

  const [alert, setAlert] = useState<AlertChoice>("adhan");
  const [reciterId, setReciterId] = useState<string>(DEFAULT_ADHAN_STYLE_ID);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Token guards an out-of-order race in togglePreview: tapping reciter A
  // then B before A's previewAdhan() resolves. Each call increments the
  // token; only the most recent call's auto-stop timer is allowed to fire.
  const previewTokenRef = useRef(0);

  // Stop any in-flight preview when the onboarding unmounts or the user
  // leaves the reciter UI — otherwise the audio keeps blasting after the
  // user moves on. Also clears the auto-stop timer.
  const stopPreview = React.useCallback(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    // Bump the token so any in-flight togglePreview await that resolves
    // *after* this call won't schedule a fresh auto-stop timer.
    previewTokenRef.current += 1;
    stopAdhanAudio().catch(() => {});
    setPreviewingId(null);
  }, []);

  useEffect(() => {
    return () => { stopPreview(); };
  }, [stopPreview]);

  // Stop audio whenever the sheet closes or the alert type leaves "adhan".
  useEffect(() => {
    if (!sheetOpen) stopPreview();
  }, [sheetOpen, stopPreview]);

  useEffect(() => {
    if (alert !== "adhan") stopPreview();
  }, [alert, stopPreview]);

  const togglePreview = React.useCallback(
    async (style: { id: string; audioUrl: string }) => {
      if (previewingId === style.id) {
        stopPreview();
        return;
      }
      // Cancel any pending auto-stop from a previous reciter *before* the
      // await — otherwise the old timer can fire while we're starting the
      // new audio and kill it instantly.
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
      const token = ++previewTokenRef.current;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setPreviewingId(style.id);
      try {
        await previewAdhan(style.audioUrl);
      } catch {}
      // A newer tap (or a stopPreview) happened while we were awaiting —
      // bail so we don't schedule a timer for stale audio.
      if (previewTokenRef.current !== token) return;
      previewTimerRef.current = setTimeout(() => {
        if (previewTokenRef.current !== token) return;
        stopAdhanAudio().catch(() => {});
        setPreviewingId(null);
        previewTimerRef.current = null;
      }, 3000);
    },
    [previewingId, stopPreview],
  );

  const fade = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: sheetOpen ? 0 : SCREEN_HEIGHT,
        duration: sheetOpen ? 420 : 320,
        easing: Easing.bezier(0.32, 0.72, 0, 1),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: sheetOpen ? 1 : 0,
        duration: sheetOpen ? 280 : 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [sheetOpen, sheetY, backdropOpacity]);

  const openSheet = () => {
    Haptics.selectionAsync().catch(() => {});
    setSheetOpen(true);
  };

  const closeSheet = () => {
    Haptics.selectionAsync().catch(() => {});
    setSheetOpen(false);
  };

  const handleSelectAlert = (type: AlertChoice) => {
    Haptics.selectionAsync().catch(() => {});
    setAlert(type);
    if (type === "adhan") {
      // Tapping "Full Adhan" opens the sheet so the user can pick a reciter.
      setSheetOpen(true);
    } else if (sheetOpen) {
      setSheetOpen(false);
    }
  };

  const handleSkip = async () => {
    Haptics.selectionAsync().catch(() => {});
    await AsyncStorage.setItem(NOTIF_RITUAL_KEY, "true").catch(() => {});
    Animated.timing(fade, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => onComplete());
  };

  const handleApply = async () => {
    if (applying) return;
    setApplying(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Build the merged config for the 5 daily prayers, preserving sunrise + any
    // existing days/minutesBefore on each prayer.
    const baseCfg: PrayerNotifConfig = { ...DEFAULT_PRAYER_NOTIF_CONFIG, ...prayerNotifConfig };
    const merged: PrayerNotifConfig = { ...baseCfg };
    for (const key of DAILY_PRAYERS) {
      const existing: PrayerNotifSettings = baseCfg[key] ?? DEFAULT_PRAYER_NOTIF_SETTINGS;
      merged[key] = {
        ...existing,
        enabled: true,
        type: alert,
        adhanStyleId: alert === "adhan" ? reciterId : existing.adhanStyleId,
      };
    }

    // Persist durably FIRST (awaited) so the flag below truly reflects committed state.
    // Only mark the ritual complete on confirmed storage success; on failure we
    // bail out without setting the flag so the user is re-prompted next launch.
    let persisted = false;
    try {
      await AsyncStorage.setItem(PRAYER_NOTIF_CONFIG_STORAGE_KEY, JSON.stringify(merged));
      await AsyncStorage.setItem(NOTIF_RITUAL_KEY, "true");
      persisted = true;
    } catch {
      // leave persisted=false → flag not set, user will see Ritual again
    }

    // Update in-memory state + reschedule notifications via context (best-effort).
    if (persisted) {
      try {
        for (const key of DAILY_PRAYERS) {
          await setPrayerNotifSettings(key, merged[key]);
        }
      } catch {}
    }

    if (!persisted) {
      // Storage failed: keep the overlay fully visible & interactive so the
      // user can retry. Just clear the in-flight guard.
      setApplying(false);
      return;
    }

    Animated.timing(fade, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      setApplying(false);
      onComplete();
    });
  };

  const selectedReciter = ADHAN_STYLES.find((s) => s.id === reciterId) ?? ADHAN_STYLES[0];

  const previewSubtitle =
    alert === "silent"
      ? "Your silent reminder for Maghrib prayer."
      : alert === "notification"
      ? "Gentle chime for Maghrib prayer."
      : `Full Adhan by ${selectedReciter.name}`;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { backgroundColor: BG, opacity: fade, zIndex: 998 }]}
    >
      {/* Background nocturnal scene */}
      <View pointerEvents="none" style={styles.bgWrap}>
        <LinearGradient
          colors={["#141b36", "#090b14", "#050508"]}
          style={styles.bgGradient}
        />
        {/* Soft golden moon glow */}
        <View style={styles.moonGlow} />
        {/* Stars */}
        <View style={[styles.star, { top: "12%", left: "20%", width: 2, height: 2, opacity: 0.6 }]} />
        <View style={[styles.star, { top: "20%", right: "25%", width: 3, height: 3, opacity: 0.4 }]} />
        <View style={[styles.star, { top: "30%", left: "30%", width: 2, height: 2, opacity: 0.5 }]} />
        <View style={[styles.star, { top: "8%", right: "15%", width: 1.5, height: 1.5, opacity: 0.8 }]} />
        <View style={[styles.star, { top: "25%", left: "70%", width: 2, height: 2, opacity: 0.45 }]} />
        <View style={[styles.star, { top: "16%", left: "55%", width: 1.5, height: 1.5, opacity: 0.55 }]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 18 }]}>
        {/* Header breadcrumb */}
        <View style={styles.breadcrumb}>
          <View style={styles.bcLine} />
          <View style={styles.bcCenter}>
            <Text style={styles.bcLabel}>NUUR</Text>
            <Text style={styles.bcDot}>·</Text>
            <Text style={styles.bcArabic}>نور</Text>
          </View>
          <View style={styles.bcLine} />
        </View>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Let your prayers{"\n"}find you</Text>
          <Text style={styles.subtitle}>
            How would you like to be gently reminded{"\n"}when it is time to pray?
          </Text>
        </View>

        {/* Notification preview card */}
        <View style={styles.previewCardWrap}>
          <BlurView intensity={20} tint="dark" style={styles.previewCard}>
            <View style={styles.previewOverlay} />
            <View style={styles.previewHeaderRow}>
              <View style={styles.previewBrand}>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>N</Text>
                </View>
                <Text style={styles.previewBrandLabel}>NUUR</Text>
              </View>
              <Text style={styles.previewTimestamp}>now</Text>
            </View>
            <View style={styles.previewBody}>
              <Text style={styles.previewTitle}>Time for Maghrib</Text>
              <Text style={styles.previewSubtitle} numberOfLines={2}>
                {previewSubtitle}
              </Text>
            </View>
          </BlurView>
        </View>

        {/* Three alert tiles */}
        <View style={styles.tilesRow}>
          {ALERT_TILES.map((tile) => {
            const active = alert === tile.id;
            return (
              <Pressable
                key={tile.id}
                onPress={() => handleSelectAlert(tile.id)}
                style={({ pressed }) => [
                  styles.tile,
                  active && styles.tileActive,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={[styles.tileIconWrap, active && styles.tileIconWrapActive]}>
                  <Feather
                    name={tile.icon}
                    size={16}
                    color={active ? GOLD : TEXT_FAINT}
                  />
                </View>
                <Text style={[styles.tileLabel, active && { color: GOLD }]}>
                  {tile.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Selected reciter hint */}
        {alert === "adhan" && !sheetOpen && (
          <Pressable
            onPress={openSheet}
            style={({ pressed }) => [styles.hintRow, pressed && { opacity: 0.85 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.hintLabel}>SELECTED RECITER</Text>
              <Text style={styles.hintName} numberOfLines={1}>
                {selectedReciter.name}
              </Text>
            </View>
            <Text style={styles.hintChange}>Change</Text>
          </Pressable>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* CTA stack */}
        <View style={styles.ctaStack}>
          <TouchableOpacity
            onPress={handleApply}
            disabled={applying}
            activeOpacity={0.9}
            style={[styles.ctaBtn, applying && { opacity: 0.7 }]}
          >
            <LinearGradient
              colors={[GOLD, GOLD_DEEP]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>
                {applying ? "Applying…" : "Allow Notifications"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
            <Text style={styles.skipText}>Not right now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reciter bottom sheet */}
      <Animated.View
        pointerEvents={sheetOpen ? "auto" : "none"}
        style={[StyleSheet.absoluteFillObject, styles.sheetLayer]}
      >
        <Animated.View
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 24, transform: [{ translateY: sheetY }] },
          ]}
        >
          <View style={styles.dragHandle} />
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={closeSheet} hitSlop={10} style={styles.sheetBack}>
              <Feather name="chevron-left" size={20} color={TEXT} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>Choose a reciter</Text>
              <Text style={styles.sheetSubtitle}>The voice that will call you to prayer.</Text>
            </View>
          </View>

          <ScrollView
            style={styles.sheetList}
            contentContainerStyle={{ paddingBottom: 12, gap: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {ADHAN_STYLES.map((s) => {
              const sel = reciterId === s.id;
              const isPlaying = previewingId === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setReciterId(s.id);
                  }}
                  style={({ pressed }) => [
                    styles.reciterRow,
                    sel && styles.reciterRowActive,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => togglePreview(s)}
                    hitSlop={8}
                    style={[styles.previewBtn, isPlaying && styles.previewBtnActive]}
                  >
                    <Feather
                      name={isPlaying ? "square" : "play"}
                      size={14}
                      color={isPlaying ? GOLD : TEXT}
                    />
                  </TouchableOpacity>

                  <View style={styles.reciterTextWrap}>
                    <Text
                      style={[styles.reciterName, sel && { color: GOLD }]}
                      numberOfLines={1}
                    >
                      {s.name}
                    </Text>
                    <Text style={styles.reciterLoc} numberOfLines={1}>
                      {s.location}
                    </Text>
                  </View>

                  {sel && (
                    <View style={styles.checkDot}>
                      <Feather name="check" size={12} color="#050508" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            onPress={closeSheet}
            activeOpacity={0.85}
            style={styles.confirmBtn}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ── Background ──
  bgWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    overflow: "hidden",
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  moonGlow: {
    position: "absolute",
    top: "8%",
    alignSelf: "center",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: GOLD,
    opacity: 0.18,
  },
  star: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 2,
  },

  // ── Content ──
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // ── Header breadcrumb ──
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    opacity: 0.85,
    marginBottom: 28,
  },
  bcLine: {
    width: 32,
    height: 1,
    backgroundColor: BORDER_GOLD,
    opacity: 0.6,
  },
  bcCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  bcLabel: {
    color: GOLD,
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Inter_700Bold",
  },
  bcDot: { color: "rgba(201,147,58,0.6)", fontSize: 12 },
  bcArabic: { color: GOLD, fontFamily: ARABIC_SERIF, fontSize: 14 },

  // ── Title block ──
  titleBlock: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: SERIF,
    fontSize: 32,
    color: TEXT,
    fontWeight: "500",
    letterSpacing: -0.4,
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 14,
  },
  subtitle: {
    color: TEXT_DIM,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },

  // ── Preview card ──
  previewCardWrap: {
    marginBottom: 24,
    borderRadius: 18,
    overflow: "hidden",
  },
  previewCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 16,
    gap: 10,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "rgba(201,147,58,0.20)",
    borderWidth: 1,
    borderColor: "rgba(201,147,58,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewBadgeText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: SERIF,
  },
  previewBrandLabel: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 10,
    letterSpacing: 1.2,
    fontFamily: "Inter_600SemiBold",
  },
  previewTimestamp: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  previewBody: { gap: 4 },
  previewTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  previewSubtitle: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  // ── Alert tiles ──
  tilesRow: {
    flexDirection: "row",
    gap: 10,
  },
  tile: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: BORDER_DIM,
    alignItems: "center",
    justifyContent: "center",
  },
  tileActive: {
    backgroundColor: "#1A1612",
    borderColor: BORDER_GOLD,
    shadowColor: GOLD,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  tileIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  tileIconWrapActive: {
    backgroundColor: "rgba(201,147,58,0.20)",
  },
  tileLabel: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 15,
    fontFamily: "Inter_500Medium",
  },

  // ── Hint row ──
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: BORDER_DIM,
    borderRadius: 14,
  },
  hintLabel: {
    color: GOLD,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  hintName: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  hintChange: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  // ── CTA ──
  ctaStack: {
    alignItems: "center",
    gap: 14,
    marginTop: 24,
  },
  ctaBtn: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: GOLD,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  ctaGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#050508",
    fontSize: 15,
    letterSpacing: 0.3,
    fontFamily: "Inter_700Bold",
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  skipText: {
    color: "rgba(255,255,255,0.30)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  // ── Sheet ──
  sheetLayer: {
    zIndex: 1000,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0a0a0f",
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
    paddingHorizontal: 24,
    maxHeight: "85%",
  },
  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignSelf: "center",
    marginBottom: 24,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  sheetBack: {
    padding: 6,
    marginLeft: -6,
    marginRight: 8,
    marginTop: 4,
    opacity: 0.6,
  },
  sheetTitle: {
    fontFamily: SERIF,
    fontSize: 24,
    color: TEXT,
    fontWeight: "500",
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    color: TEXT_FAINT,
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  sheetList: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },

  // ── Reciter row ──
  reciterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: BORDER_DIM,
  },
  reciterRowActive: {
    backgroundColor: "#1A1612",
    borderColor: "rgba(201,147,58,0.30)",
  },
  previewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  previewBtnActive: {
    backgroundColor: "rgba(201,147,58,0.20)",
    borderColor: BORDER_GOLD,
  },
  reciterTextWrap: { flex: 1, paddingRight: 8 },
  reciterName: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  reciterLoc: {
    color: TEXT_FAINT,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  confirmBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  confirmText: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
