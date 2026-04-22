import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext, type LocationData } from "@/context/AppContext";
import { LocationModal } from "@/components/LocationModal";
import type { ThemeColors } from "@/constants/themes";
import type { MadhabId } from "@/utils/prayerTimes";

const { width: W } = Dimensions.get("window");
export const ONBOARDING_KEY = "nuur_onboarding_done";

const BG = "#09150D";
const GOLD = "#C9933A";
const TEXT = "#F0EDE4";
const TEXT_DIM = "rgba(240,237,228,0.5)";
const SURFACE = "rgba(255,255,255,0.05)";
const SURFACE_ACTIVE = "rgba(201,147,58,0.13)";
const BORDER_DIM = "rgba(255,255,255,0.1)";

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIcon({ icon, size = 52 }: { icon: string; size?: number }) {
  return (
    <View style={s.iconWrap}>
      <View style={s.iconGlow} />
      <View style={s.iconRing}>
        <MaterialCommunityIcons name={icon as any} size={size} color={GOLD} />
      </View>
    </View>
  );
}

function Dots({ current }: { current: number }) {
  return (
    <View style={s.dots}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            s.dot,
            i === current
              ? { backgroundColor: GOLD, width: 22 }
              : { backgroundColor: GOLD + "30", width: 8 },
          ]}
        />
      ))}
    </View>
  );
}

function MadhabCard({
  name, arabicName, desc, timing, selected, onPress,
}: {
  name: string; arabicName: string; desc: string; timing: string;
  selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        s.madhabCard,
        selected
          ? { borderColor: GOLD, backgroundColor: SURFACE_ACTIVE }
          : { borderColor: BORDER_DIM, backgroundColor: SURFACE },
      ]}
    >
      {selected && (
        <View style={s.madhabCheck}>
          <Feather name="check" size={10} color={GOLD} />
        </View>
      )}
      <Text style={[s.madhabAr, { color: selected ? GOLD : TEXT_DIM }]}>{arabicName}</Text>
      <Text style={[s.madhabEn, { color: selected ? TEXT : TEXT_DIM }]}>{name}</Text>
      <View style={s.madhabDivider} />
      <Text style={[s.madhabDesc, { color: selected ? TEXT_DIM : "rgba(240,237,228,0.25)" }]}>
        {desc}
      </Text>
      <Text style={[s.madhabTiming, { color: selected ? GOLD : GOLD + "50" }]}>{timing}</Text>
    </TouchableOpacity>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

// Dark palette for the manual city picker so the modal blends into the
// onboarding background instead of flashing the user's saved theme.
const ONBOARDING_PICKER_COLORS: ThemeColors = {
  text: TEXT,
  textSecondary: TEXT_DIM,
  background: BG,
  surface: "#121C16",
  surfaceElevated: "#172620",
  border: BORDER_DIM,
  tint: GOLD,
  tintLight: GOLD + "33",
  gold: GOLD,
  goldLight: GOLD + "33",
  goldGradient: [GOLD, "#8C6420"],
  glow: GOLD + "22",
  tabIconDefault: TEXT_DIM,
  tabIconSelected: GOLD,
  prayerCard: SURFACE,
  prayerTime: TEXT,
  accent: GOLD,
  red: "#D9534F",
};

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const insets = useSafeAreaInsets();
  const {
    requestLocation,
    setManualLocation,
    isLocationPermDenied,
    toggleNotifications,
    notificationsEnabled,
    notifPermBlocked,
    madhab,
    setMadhab,
  } = useAppContext();

  const [step, setStep] = useState(0);
  const [locLoading, setLocLoading] = useState(false);
  const [locDone, setLocDone] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifDone, setNotifDone] = useState(false);
  const [selectedMadhab, setSelectedMadhab] = useState<MadhabId>(madhab);
  const [finishing, setFinishing] = useState(false);

  const slideX = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 380, useNativeDriver: false }).start();
  }, []);

  const goTo = (n: number) => {
    Animated.spring(slideX, {
      toValue: -n * W,
      useNativeDriver: false,
      tension: 68,
      friction: 13,
    }).start();
    setStep(n);
  };

  const handleLocation = async () => {
    setLocLoading(true);
    try { await requestLocation(); } catch {}
    setLocLoading(false);
    setLocDone(true);
    setTimeout(() => goTo(1), 380);
  };

  const handleManualCity = async (loc: LocationData) => {
    try { await setManualLocation(loc); } catch {}
    setPickerVisible(false);
    setLocDone(true);
    setTimeout(() => goTo(1), 380);
  };

  const handleNotif = async () => {
    setNotifLoading(true);
    try {
      if (!notificationsEnabled) await toggleNotifications();
    } catch {}
    setNotifLoading(false);
    setNotifDone(true);
    setTimeout(() => goTo(2), 380);
  };

  const handleDone = async () => {
    setFinishing(true);
    setMadhab(selectedMadhab);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    Animated.timing(fadeIn, { toValue: 0, duration: 380, useNativeDriver: false }).start(() =>
      onComplete(),
    );
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: BG, opacity: fadeIn, zIndex: 999 }]}>
      {/* Back button — fixed on screen above slides */}
      {step > 0 && (
        <TouchableOpacity
          onPress={() => goTo(step - 1)}
          hitSlop={12}
          style={[s.backBtn, { top: insets.top + 10 }]}
        >
          <Feather name="chevron-left" size={24} color={TEXT_DIM} />
        </TouchableOpacity>
      )}

      {/* Horizontal slide strip */}
      <Animated.View
        style={{ flexDirection: "row", width: W * 3, flex: 1, transform: [{ translateX: slideX }] }}
      >
        {/* ── Step 0 : Location ── */}
        <View style={[s.slide, { width: W, paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 }]}>
          <View style={s.upper}>
            <StepIcon icon="mosque" />
            <Text style={s.nuurLogo}>نور</Text>
            <Text style={s.title}>Welcome to Nuur</Text>
            <Text style={s.subtitle}>Your complete Islamic companion</Text>
            <View style={s.divider} />
            <Text style={s.body}>
              Accurate prayer times are calculated using your location. It stays on your device and is never sent to any server.
            </Text>
          </View>

          <View style={s.lower}>
            {isLocationPermDenied && !locDone ? (
              <>
                {/* Denial recovery card — the primary button would otherwise
                    just sit there doing nothing once iOS/Android has
                    permanently denied. */}
                <View style={s.deniedCard}>
                  <View style={s.deniedIcon}>
                    <Feather name="alert-circle" size={16} color="#E8B86A" />
                  </View>
                  <Text style={s.deniedText}>
                    Location is blocked for Nuur. Open Settings to allow it, or pick your city manually.
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.primary}
                  onPress={() => Linking.openSettings().catch(() => {})}
                  activeOpacity={0.82}
                >
                  <Feather name="external-link" size={16} color="#fff" />
                  <Text style={s.primaryText}>Open Settings</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[s.primary, locDone && s.primaryDone]}
                onPress={handleLocation}
                disabled={locLoading || locDone}
                activeOpacity={0.82}
              >
                {locLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather name={locDone ? "check" : "map-pin"} size={16} color="#fff" />
                    <Text style={s.primaryText}>{locDone ? "Location set" : "Allow Location Access"}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={s.ghost}
              onPress={() => setPickerVisible(true)}
              disabled={locDone}
            >
              <Text style={s.ghostLink}>Pick city manually</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.ghostSmall} onPress={() => goTo(1)}>
              <Text style={s.ghostText}>Skip for now</Text>
            </TouchableOpacity>

            <Dots current={0} />
          </View>
        </View>

        {/* ── Step 1 : Notifications ── */}
        <View style={[s.slide, { width: W, paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 }]}>
          <View style={s.upper}>
            <StepIcon icon="bell-ring-outline" />
            <Text style={s.title}>Never Miss a Prayer</Text>
            <Text style={s.subtitle}>Stay connected to your prayers every day</Text>
            <View style={s.divider} />
            <Text style={s.body}>
              Get notified at each prayer time, receive a Jummah reminder every Friday, and celebrate your prayer streak milestones.
            </Text>
          </View>

          <View style={s.lower}>
            {notifPermBlocked && !notifDone ? (
              <>
                <View style={s.deniedCard}>
                  <View style={s.deniedIcon}>
                    <Feather name="bell-off" size={16} color="#E8B86A" />
                  </View>
                  <Text style={s.deniedText}>
                    Notifications are blocked for Nuur. Open Settings to enable prayer alerts.
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.primary}
                  onPress={() => Linking.openSettings().catch(() => {})}
                  activeOpacity={0.82}
                >
                  <Feather name="external-link" size={16} color="#fff" />
                  <Text style={s.primaryText}>Open Settings</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[s.primary, notifDone && s.primaryDone]}
                onPress={handleNotif}
                disabled={notifLoading || notifDone}
                activeOpacity={0.82}
              >
                {notifLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather name={notifDone ? "check" : "bell"} size={16} color="#fff" />
                    <Text style={s.primaryText}>
                      {notifDone ? "Notifications enabled" : "Enable Notifications"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={s.ghost} onPress={() => goTo(2)}>
              <Text style={s.ghostText}>{notifPermBlocked ? "Continue without alerts" : "Maybe later"}</Text>
            </TouchableOpacity>

            <Dots current={1} />
          </View>
        </View>

        {/* ── Step 2 : Madhab ── */}
        <View style={[s.slide, { width: W, paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 }]}>
          <View style={s.upper}>
            <StepIcon icon="star-crescent" size={48} />
            <Text style={s.title}>Asr Calculation</Text>
            <Text style={s.subtitle}>Choose your school of thought</Text>
            <View style={s.divider} />
            <Text style={s.body}>
              Your madhab determines when Asr begins. This can be changed at any time in Settings.
            </Text>

            <View style={s.madhabRow}>
              <MadhabCard
                name="Hanafi"
                arabicName="حنفي"
                desc="Shadow = 2× height"
                timing="Later Asr"
                selected={selectedMadhab === "Hanafi"}
                onPress={() => setSelectedMadhab("Hanafi")}
              />
              <MadhabCard
                name="Shafi"
                arabicName="شافعي"
                desc="Shadow = 1× height"
                timing="Earlier Asr"
                selected={selectedMadhab === "Shafi"}
                onPress={() => setSelectedMadhab("Shafi")}
              />
            </View>
          </View>

          <View style={s.lower}>
            <TouchableOpacity
              style={[s.primary, finishing && s.primaryDone]}
              onPress={handleDone}
              disabled={finishing}
              activeOpacity={0.82}
            >
              {finishing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
                  <Text style={s.primaryText}>Get Started</Text>
                </>
              )}
            </TouchableOpacity>

            <Dots current={2} />
          </View>
        </View>
      </Animated.View>

      {/* Manual city picker — opens when the user can't / won't grant GPS. */}
      <LocationModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onRequestGps={handleLocation}
        onSelectManual={handleManualCity}
        colors={ONBOARDING_PICKER_COLORS}
        isLoadingGps={locLoading}
      />
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  upper: {
    alignItems: "center",
    width: "100%",
    flex: 1,
    justifyContent: "center",
  },
  lower: {
    width: "100%",
    alignItems: "center",
    gap: 0,
  },

  // Icon
  iconWrap: { alignItems: "center", justifyContent: "center", marginBottom: 22 },
  iconGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: GOLD + "14",
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: GOLD + "40",
    backgroundColor: GOLD + "0E",
    alignItems: "center",
    justifyContent: "center",
  },

  // Text
  nuurLogo: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: GOLD,
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: TEXT,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: TEXT_DIM,
    textAlign: "center",
    marginTop: 6,
  },
  divider: {
    width: 36,
    height: 1.5,
    backgroundColor: GOLD + "55",
    borderRadius: 1,
    marginVertical: 18,
  },
  body: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: TEXT_DIM,
    textAlign: "center",
    lineHeight: 22,
  },

  // Buttons
  primary: {
    width: "100%",
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  primaryDone: { backgroundColor: "#2A7A4F" },
  primaryText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  ghost: { paddingVertical: 11, paddingHorizontal: 16 },
  ghostSmall: { paddingVertical: 6, paddingHorizontal: 16 },
  ghostText: { color: TEXT_DIM, fontSize: 14, fontFamily: "Inter_400Regular" },
  ghostLink: {
    color: GOLD,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textDecorationLine: "underline",
    textDecorationColor: GOLD + "55",
  },

  // Permission-denied recovery card
  deniedCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(232,184,106,0.08)",
    borderWidth: 1,
    borderColor: "rgba(232,184,106,0.30)",
    marginBottom: 12,
  },
  deniedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(232,184,106,0.14)",
    marginTop: 1,
  },
  deniedText: {
    flex: 1,
    color: "rgba(240,237,228,0.85)",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  // Back button
  backBtn: {
    position: "absolute",
    left: 12,
    zIndex: 10,
    padding: 10,
  },

  // Dots
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginTop: 20,
  },
  dot: { height: 8, borderRadius: 4 },

  // Madhab cards
  madhabRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 20,
  },
  madhabCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    alignItems: "center",
    position: "relative",
    gap: 3,
  },
  madhabCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: GOLD + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  madhabAr: { fontSize: 22, fontFamily: "Inter_700Bold" },
  madhabEn: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  madhabDivider: { width: 24, height: 1, backgroundColor: GOLD + "30", marginVertical: 6 },
  madhabDesc: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  madhabTiming: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 2 },
});
