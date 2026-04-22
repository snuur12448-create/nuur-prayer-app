import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext, type LocationData } from "@/context/AppContext";
import { LocationModal } from "@/components/LocationModal";
import type { CalcMethodId, MadhabId } from "@/utils/prayerTimes";
import {
  BG,
  ONBOARDING_PICKER_COLORS,
  TEXT_DIM,
} from "./onboarding/_constants";
import { s } from "./onboarding/_styles";
import { LocationStep } from "./onboarding/steps/LocationStep";
import { NotificationStep } from "./onboarding/steps/NotificationStep";
import { CalcMethodStep } from "./onboarding/steps/CalcMethodStep";
import { CalcMethodSheet } from "./onboarding/CalcMethodSheet";

const { width: W } = Dimensions.get("window");
export const ONBOARDING_KEY = "nuur_onboarding_done";

/**
 * Onboarding orchestrator — owns the slide animation, permission/flow state,
 * and routes per-step rendering to the dedicated step components in
 * `onboarding/steps/`. Visual atoms live in `onboarding/atoms/` and shared
 * styles in `onboarding/_styles.ts`.
 */
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
    madhabAutoSetLabel,
    calcMethod,
    setCalcMethod,
    calcMethodAutoSetLabel,
    location,
  } = useAppContext();

  const [step, setStep] = useState(0);
  const [locLoading, setLocLoading] = useState(false);
  const [locDone, setLocDone] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifDone, setNotifDone] = useState(false);
  const [selectedMadhab, setSelectedMadhab] = useState<MadhabId>(madhab);
  const [selectedMethod, setSelectedMethod] = useState<CalcMethodId>(calcMethod);
  const [methodSheetVisible, setMethodSheetVisible] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Keep the local picker mirror in sync if the GPS-driven auto-suggest
  // arrives after this screen mounts (user landed on step 0, granted GPS,
  // context updated calcMethod, then user advanced to step 2).
  useEffect(() => { setSelectedMethod(calcMethod); }, [calcMethod]);
  // Same mirror for auto-detected madhab.
  useEffect(() => { setSelectedMadhab(madhab); }, [madhab]);

  const slideX = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 380, useNativeDriver: false }).start();
  }, []);

  // Tiny helper so the haptics calls don't drown out the actual flow code
  // and so a single missing API in Expo Go doesn't crash the screen.
  const haptic = {
    tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
    medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
    select: () => Haptics.selectionAsync().catch(() => {}),
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  };

  const goTo = (n: number) => {
    if (n !== step) haptic.tap();
    Animated.spring(slideX, {
      toValue: -n * W,
      useNativeDriver: false,
      tension: 68,
      friction: 13,
    }).start();
    setStep(n);
  };

  const handleLocation = async () => {
    haptic.medium();
    setLocLoading(true);
    let permanentlyDenied = false;
    try {
      const result = await requestLocation();
      permanentlyDenied = result.permanentlyDenied;
    } catch {}
    setLocLoading(false);
    // If the OS reports the perm is permanently blocked, stay on this screen
    // so the recovery card (which renders when isLocationPermDenied is true)
    // is actually visible. Advancing here would defeat that whole UX.
    if (permanentlyDenied) return;
    setLocDone(true);
    haptic.success();
    setTimeout(() => goTo(1), 380);
  };

  const handleManualCity = async (loc: LocationData) => {
    try { await setManualLocation(loc); } catch {}
    setPickerVisible(false);
    setLocDone(true);
    haptic.success();
    setTimeout(() => goTo(1), 380);
  };

  const handleNotif = async () => {
    haptic.medium();
    setNotifLoading(true);
    let blocked = false;
    try {
      if (!notificationsEnabled) {
        const result = await toggleNotifications();
        blocked = result.blocked;
      }
    } catch {}
    setNotifLoading(false);
    // Same reasoning as handleLocation: if the OS blocked notifs permanently,
    // stay so the inline "Open Settings" recovery card can render. Plain
    // first-tap "denied" still advances — they can re-prompt later from
    // settings, and the rest of onboarding is still useful without alerts.
    if (blocked) return;
    setNotifDone(true);
    haptic.success();
    setTimeout(() => goTo(2), 380);
  };

  const handleDone = async () => {
    haptic.success();
    setFinishing(true);
    setMadhab(selectedMadhab);
    if (selectedMethod !== calcMethod) setCalcMethod(selectedMethod);
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
        <LocationStep
          width={W}
          topInset={insets.top}
          bottomInset={insets.bottom}
          isLocationPermDenied={isLocationPermDenied}
          locDone={locDone}
          locLoading={locLoading}
          onAllowLocation={handleLocation}
          onPickCity={() => setPickerVisible(true)}
          onSkip={() => goTo(1)}
        />

        <NotificationStep
          width={W}
          topInset={insets.top}
          bottomInset={insets.bottom}
          notifPermBlocked={notifPermBlocked}
          notifDone={notifDone}
          notifLoading={notifLoading}
          onEnableNotif={handleNotif}
          onSkip={() => goTo(2)}
        />

        <CalcMethodStep
          width={W}
          topInset={insets.top}
          bottomInset={insets.bottom}
          selectedMethod={selectedMethod}
          calcMethod={calcMethod}
          calcMethodAutoSetLabel={calcMethodAutoSetLabel}
          selectedMadhab={selectedMadhab}
          madhab={madhab}
          madhabAutoSetLabel={madhabAutoSetLabel}
          locationCity={location?.city}
          finishing={finishing}
          onOpenMethodSheet={() => { haptic.tap(); setMethodSheetVisible(true); }}
          onSelectMadhab={(m) => { haptic.select(); setSelectedMadhab(m); }}
          onDone={handleDone}
        />
      </Animated.View>

      {/* Calculation method bottom sheet */}
      <CalcMethodSheet
        visible={methodSheetVisible}
        bottomInset={insets.bottom}
        selectedMethod={selectedMethod}
        onClose={() => setMethodSheetVisible(false)}
        onSelect={(id) => {
          haptic.select();
          setSelectedMethod(id);
          setMethodSheetVisible(false);
        }}
      />

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
