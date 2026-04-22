import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
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

const BG = "#0F0E14";
const GOLD = "#C9933A";
const GOLD_GLOW = "rgba(201,147,58,0.06)";
const TEXT = "rgba(255,255,255,0.92)";
const TEXT_DIM = "rgba(255,255,255,0.45)";
const TEXT_FAINT = "rgba(255,255,255,0.30)";
const SURFACE = "rgba(26,24,34,0.55)";
const SURFACE_ACTIVE = "rgba(201,147,58,0.06)";
const BORDER_DIM = "rgba(255,255,255,0.05)";
const BORDER_GOLD = "rgba(201,147,58,0.40)";

const SERIF = Platform.OS === "ios" ? "Times New Roman" : "serif";
const ARABIC_SERIF = Platform.OS === "ios" ? "Geeza Pro" : "serif";

const DAILY_PRAYERS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

type AlertChoice = PrayerNotifType;

interface OptionDef {
  id: AlertChoice;
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  desc: string;
}

const ALERT_OPTIONS: OptionDef[] = [
  { id: "silent", icon: "bell-off", title: "Silent", desc: "Listen with your heart" },
  { id: "notification", icon: "bell", title: "Gentle Notification", desc: "A soft chime" },
  { id: "adhan", icon: "volume-2", title: "Full Adhan", desc: "The full call to prayer" },
];

interface Props {
  onComplete: () => void;
}

export function PrayerNotifOnboarding({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const { setPrayerNotifSettings, prayerNotifConfig } = useAppContext();

  const [step, setStep] = useState(0); // 0: alert, 1: reciter, 2: confirm
  const [alert, setAlert] = useState<AlertChoice>("adhan");
  const [reciterId, setReciterId] = useState<string>(DEFAULT_ADHAN_STYLE_ID);
  const [applying, setApplying] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop any in-flight preview when the onboarding unmounts or the user
  // leaves the reciter step — otherwise the audio keeps blasting after the
  // user moves on. Also clears the auto-stop timer.
  const stopPreview = React.useCallback(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    stopAdhanAudio().catch(() => {});
    setPreviewingId(null);
  }, []);

  useEffect(() => {
    return () => { stopPreview(); };
  }, [stopPreview]);

  useEffect(() => {
    // Leaving the reciter step? Cut the audio.
    if (step !== 1) stopPreview();
  }, [step, stopPreview]);

  const togglePreview = React.useCallback(
    async (style: { id: string; audioUrl: string }) => {
      if (previewingId === style.id) {
        stopPreview();
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setPreviewingId(style.id);
      try {
        await previewAdhan(style.audioUrl);
      } catch {}
      // ~3s audition window; user can also tap again to stop early.
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => {
        stopAdhanAudio().catch(() => {});
        setPreviewingId(null);
        previewTimerRef.current = null;
      }, 3000);
    },
    [previewingId, stopPreview],
  );

  const fade = useRef(new Animated.Value(0)).current;
  const stepFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const animateStep = (next: number) => {
    Animated.timing(stepFade, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setStep(next);
      Animated.timing(stepFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  const goNext = () => {
    Haptics.selectionAsync().catch(() => {});
    if (step < 2) animateStep(step + 1);
    else handleApply();
  };

  const goBack = () => {
    Haptics.selectionAsync().catch(() => {});
    if (step > 0) animateStep(step - 1);
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

    Animated.timing(fade, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      setApplying(false);
      if (persisted) onComplete();
      // If persistence failed, leave the overlay up — user can tap Apply again.
    });
  };

  const reciter = ADHAN_STYLES.find((s) => s.id === reciterId) ?? ADHAN_STYLES[0];

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { backgroundColor: BG, opacity: fade, zIndex: 998 }]}
    >
      {/* Candlelight glow */}
      <View pointerEvents="none" style={styles.glow} />

      {/* Header breadcrumb */}
      <View style={[styles.header, { paddingTop: insets.top + 28 }]}>
        <View style={styles.breadcrumb}>
          <View style={styles.bcLineL} />
          <View style={styles.bcCenter}>
            <Text style={styles.bcLabel}>NUUR</Text>
            <Text style={styles.bcDot}>·</Text>
            <Text style={styles.bcArabic}>نور</Text>
          </View>
          <View style={styles.bcLineR} />
        </View>

        {/* Pagination dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => {
            const active = i === step;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  active && styles.dotActive,
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Body */}
      <Animated.View style={[styles.body, { opacity: stepFade }]}>
        {step === 0 && (
          <StepFrame
            title="How shall we call you?"
            subtitle="Choose how you'd like to be reminded for the five daily prayers."
          >
            <View style={styles.optionList}>
              {ALERT_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  icon={opt.icon}
                  title={opt.title}
                  desc={opt.desc}
                  selected={alert === opt.id}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setAlert(opt.id);
                  }}
                />
              ))}
            </View>
          </StepFrame>
        )}

        {step === 1 && (
          <StepFrame
            title={alert === "adhan" ? "Choose your reciter" : "Pick a reciter"}
            subtitle={
              alert === "adhan"
                ? "The voice that will call you to prayer."
                : "Saved for when you switch to the full adhan."
            }
          >
            <View style={styles.reciterList}>
              {ADHAN_STYLES.map((s) => {
                const sel = reciterId === s.id;
                const isPreviewing = previewingId === s.id;
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
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View style={styles.reciterTextWrap}>
                      <Text style={[styles.reciterName, sel && { color: GOLD }]}>{s.name}</Text>
                      <Text style={styles.reciterLoc} numberOfLines={1}>
                        {s.location}
                      </Text>
                    </View>

                    {/* Preview button — auditions ~3 seconds. Stops on
                        re-tap, on leaving the step, or on unmount. */}
                    <TouchableOpacity
                      onPress={() => togglePreview(s)}
                      hitSlop={10}
                      style={[
                        styles.previewBtn,
                        isPreviewing && styles.previewBtnActive,
                      ]}
                    >
                      <Feather
                        name={isPreviewing ? "square" : "play"}
                        size={12}
                        color={isPreviewing ? GOLD : TEXT}
                      />
                    </TouchableOpacity>

                    {sel ? (
                      <View style={styles.checkDot}>
                        <Feather name="check" size={12} color="#1A1822" />
                      </View>
                    ) : (
                      <View style={styles.checkDotEmpty} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </StepFrame>
        )}

        {step === 2 && (
          <StepFrame title="Ready" subtitle="Your prayers will be honoured this way.">
            <View style={styles.summary}>
              <SummaryRow
                label="Five daily prayers"
                value={
                  alert === "silent"
                    ? "Silent"
                    : alert === "notification"
                    ? "Gentle notification"
                    : "Full adhan"
                }
              />
              {alert === "adhan" && (
                <SummaryRow label="Reciter" value={reciter.name} subValue={reciter.location} />
              )}
              <SummaryRow label="Days" value="Every day" />
              <SummaryRow label="Sunrise" value="Off (set later)" muted />
            </View>
            <Text style={styles.summaryHint}>
              You can fine-tune any prayer individually from the home screen.
            </Text>
          </StepFrame>
        )}
      </Animated.View>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 18 }]}>
        {step > 0 ? (
          <TouchableOpacity onPress={goBack} hitSlop={12} style={styles.backBtn}>
            <Feather name="arrow-left" size={16} color={TEXT_DIM} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSkip} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.stepLabel}>STEP {step + 1} OF 3</Text>

        <TouchableOpacity
          onPress={goNext}
          disabled={applying}
          activeOpacity={0.85}
          style={[styles.continueBtn, applying && { opacity: 0.7 }]}
        >
          <Text style={styles.continueText}>
            {step === 2 ? (applying ? "Applying…" : "Apply") : "Continue"}
          </Text>
          {!applying && step < 2 && <Feather name="arrow-right" size={14} color="#0F0E14" />}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.frame}>
      <View style={styles.frameHeader}>
        <Text style={styles.ornament}>✦</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.frameBody}>{children}</View>
    </View>
  );
}

function OptionCard({
  icon,
  title,
  desc,
  selected,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        selected && styles.optionCardActive,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={[styles.optionIconWrap, selected && styles.optionIconWrapActive]}>
        <Feather name={icon} size={18} color={selected ? GOLD : TEXT_DIM} />
      </View>
      <View style={styles.optionTextWrap}>
        <Text style={[styles.optionTitle, selected && { color: GOLD }]}>{title}</Text>
        <Text style={[styles.optionDesc, selected && { color: "rgba(201,147,58,0.7)" }]}>
          {desc}
        </Text>
      </View>
      {selected && (
        <View style={styles.optionMoon}>
          <Feather name="check" size={14} color={GOLD} />
        </View>
      )}
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  subValue,
  muted,
}: {
  label: string;
  value: string;
  subValue?: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <View style={{ alignItems: "flex-end", flexShrink: 1 }}>
        <Text style={[styles.summaryValue, muted && { color: TEXT_FAINT }]} numberOfLines={1}>
          {value}
        </Text>
        {subValue && <Text style={styles.summarySub}>{subValue}</Text>}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    top: "18%",
    alignSelf: "center",
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: GOLD_GLOW,
    opacity: 0.9,
  },

  header: {
    alignItems: "center",
    paddingBottom: 8,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    opacity: 0.85,
  },
  bcLineL: {
    width: 40,
    height: 1,
    backgroundColor: BORDER_GOLD,
    opacity: 0.6,
  },
  bcLineR: {
    width: 40,
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

  dots: { flexDirection: "row", gap: 10, marginTop: 32 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dotActive: {
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 96,
  },

  frame: {
    flex: 1,
    justifyContent: "center",
  },
  frameHeader: {
    alignItems: "center",
    marginBottom: 36,
  },
  ornament: {
    color: "rgba(201,147,58,0.45)",
    fontFamily: ARABIC_SERIF,
    fontSize: 26,
    marginBottom: 18,
  },
  title: {
    fontFamily: SERIF,
    fontSize: 30,
    color: TEXT,
    fontWeight: "500",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  subtitle: {
    color: TEXT_DIM,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 32,
  },
  frameBody: { width: "100%" },

  // Option card (alert type)
  optionList: { gap: 14 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER_DIM,
  },
  optionCardActive: {
    backgroundColor: SURFACE_ACTIVE,
    borderColor: BORDER_GOLD,
  },
  optionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconWrapActive: { backgroundColor: "rgba(201,147,58,0.18)" },
  optionTextWrap: { flex: 1 },
  optionTitle: {
    color: TEXT,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  optionDesc: {
    color: TEXT_DIM,
    fontSize: 13,
    fontStyle: "italic",
    fontFamily: SERIF,
  },
  optionMoon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201,147,58,0.16)",
  },

  // Reciter list
  reciterList: { gap: 10 },
  reciterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER_DIM,
  },
  reciterRowActive: {
    backgroundColor: SURFACE_ACTIVE,
    borderColor: BORDER_GOLD,
  },
  reciterTextWrap: { flex: 1, paddingRight: 10 },
  reciterName: {
    color: TEXT,
    fontSize: 15,
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
  },
  checkDotEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  // Reciter audition button
  previewBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  previewBtnActive: {
    backgroundColor: "rgba(201,147,58,0.18)",
    borderColor: BORDER_GOLD,
  },

  // Summary
  summary: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_DIM,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER_DIM,
  },
  summaryLabel: {
    color: TEXT_DIM,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  summaryValue: {
    color: TEXT,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  summarySub: {
    color: TEXT_FAINT,
    fontSize: 11,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  summaryHint: {
    color: TEXT_FAINT,
    fontSize: 12,
    fontFamily: SERIF,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 18,
    paddingHorizontal: 16,
    lineHeight: 18,
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
    backgroundColor: BG,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 80,
  },
  backText: { color: TEXT_DIM, fontSize: 13, fontFamily: "Inter_500Medium" },
  skipText: { color: TEXT_DIM, fontSize: 13, fontFamily: "Inter_500Medium" },
  stepLabel: {
    color: TEXT_FAINT,
    fontSize: 10,
    letterSpacing: 1.6,
    fontFamily: "Inter_500Medium",
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 20,
    minWidth: 110,
    justifyContent: "center",
    shadowColor: GOLD,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  continueText: {
    color: "#0F0E14",
    fontSize: 13.5,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
});
