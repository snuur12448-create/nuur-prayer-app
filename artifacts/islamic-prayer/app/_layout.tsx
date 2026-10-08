import { AmiriQuran_400Regular } from "@expo-google-fonts/amiri-quran";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from "@expo-google-fonts/cormorant-garamond";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@/utils/AppStorage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, AppStateStatus, Pressable, ScrollView, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AdhanOverlay } from "@/components/AdhanOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NuurSplash } from "@/components/NuurSplash";
import { Onboarding, ONBOARDING_KEY } from "@/components/Onboarding";
import { PrayerNotifOnboarding, NOTIF_RITUAL_KEY } from "@/components/PrayerNotifOnboarding";
import { ToastProvider } from "@/components/Toast";
import { WidgetBridge } from "@/components/WidgetBridge";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { EntitlementsProvider } from "@/context/EntitlementsContext";
import { PrayerTrackerProvider } from "@/context/PrayerTrackerContext";
import { QuranPlayerProvider } from "@/context/QuranPlayerContext";
import { DataRecoveryGate } from "@/context/DataRecoveryContext";
import { configurePurchases } from "@/utils/iap";
import { recordFirstLaunch, maybeRequestReview } from "@/utils/reviewPrompt";
import { registerWidgetBackgroundTask } from "@/utils/widgetBackgroundTask";
import { readWithDeadline } from "@/utils/readWithDeadline";

void SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quran/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen
        name="calendar"
        options={{ headerShown: false, presentation: "fullScreenModal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="qada" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="sunnah-prayers" options={{ headerShown: false, presentation: "card" }} />
      {/* Promoted from (tabs)/ — these are reachable from More and Home QuickActions,
          but they are not tabs and now push on top of the tab navigator. */}
      <Stack.Screen name="tracker" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="names" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="tasbeeh" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="settings" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="health" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="data-controls" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="mosques" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="guide" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="hadiths" options={{ headerShown: false, presentation: "card" }} />
    </Stack>
  );
}

function ReviewGate() {
  const { prayerTimes } = useAppContext();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!prayerTimes || hasTriggered.current) return;
    hasTriggered.current = true;
    maybeRequestReview();
  }, [prayerTimes]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        maybeRequestReview();
      }
    });
    return () => sub.remove();
  }, []);

  return null;
}

function AdhanGate() {
  const {
    adhanPlaying, adhanIsSilent,
    adhanPrayerName, adhanPrayerArabicName,
    adhanCurrentStyle, stopAdhan,
  } = useAppContext();

  if (!adhanPlaying || !adhanPrayerName || !adhanPrayerArabicName) return null;

  return (
    <AdhanOverlay
      prayerName={adhanPrayerName}
      prayerArabicName={adhanPrayerArabicName}
      reciter={adhanCurrentStyle.reciter}
      styleName={adhanCurrentStyle.name}
      isSilent={adhanIsSilent}
      onStop={stopAdhan}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary onError={() => { void SplashScreen.hideAsync().catch(() => {}); }}>
        <DataRecoveryGate><ReadyApp /></DataRecoveryGate>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function ReadyApp() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    AmiriQuran_400Regular,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  // Three-gate system: splash hides only when animation, fonts, AND onboarding
  // status are all resolved — prevents a flash between splash and onboarding.
  const [animDone, setAnimDone] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [notifRitualDone, setNotifRitualDone] = useState<boolean | null>(null);
  const [startupError, setStartupError] = useState(false);
  const [startupAttempt, setStartupAttempt] = useState(0);
  const fontsReady = fontsLoaded || !!fontError;

  // Resolve both flags before mounting persistence effects. A failed read is
  // not evidence that onboarding was completed, particularly after a restore.
  useEffect(() => {
    let active = true;
    setStartupError(false);
    void readWithDeadline(() => Promise.all([
      AsyncStorage.getItem(ONBOARDING_KEY), AsyncStorage.getItem(NOTIF_RITUAL_KEY),
    ])).then(([onboarding, notifications]) => {
      if (!active) return;
      setOnboardingDone(onboarding === "true");
      setNotifRitualDone(notifications === "true");
    }).catch(() => {
      if (!active) return;
      setStartupError(true);
      void SplashScreen.hideAsync().catch(() => {});
    });
    return () => { active = false; };
  }, [startupAttempt]);

  useEffect(() => {
    if (onboardingDone === null || notifRitualDone === null) return;
    void recordFirstLaunch();
    // Dormant by default — no-op until RevenueCat keys are provided.
    void configurePurchases();
    // Wake up periodically to refresh widget snapshot even when the app is closed.
    if (onboardingDone) void registerWidgetBackgroundTask();
  }, [onboardingDone, notifRitualDone]);

  useEffect(() => {
    if (animDone && fontsReady && onboardingDone !== null) {
      setSplashDone(true);
    }
  }, [animDone, fontsReady, onboardingDone]);

  if (onboardingDone === null || notifRitualDone === null) {
    return <ScrollView style={{ flex: 1, backgroundColor: "#F4F6F2" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 32, gap: 16 }}>
      <Text accessibilityRole="header" style={{ color: "#172A21", fontSize: 24, fontWeight: "600" }}>{startupError ? "Your settings could not load" : "Preparing Nuur"}</Text>
      {startupError ? <>
        <Text style={{ color: "#172A21", fontSize: 17 }}>No settings have been replaced. Try again to load your saved setup.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Retry loading saved settings" onPress={() => setStartupAttempt(value => value + 1)} style={{ minHeight: 48, justifyContent: "center", padding: 14, borderRadius: 12, backgroundColor: "#173F2C" }}>
          <Text style={{ color: "#FFFFFF", fontSize: 17 }}>Retry</Text>
        </Pressable>
      </> : <ActivityIndicator accessibilityLabel="Loading saved settings" color="#173F2C" />}
    </ScrollView>;
  }

  return (
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <EntitlementsProvider>
              <AppProvider>
                <PrayerTrackerProvider>
                <QuranPlayerProvider>
                <ToastProvider>
                  {/* Main app — only rendered once fonts are ready to prevent FOUT,
                      AND once we know onboarding is complete. Skipping home while
                      onboarding is pending prevents the home from flashing through
                      behind the onboarding sheet as the splash dismisses.
                      Contexts (AppProvider, QuranPlayerProvider) warm up above this,
                      so data loading is NOT blocked — only screen rendering is. */}
                  {fontsReady && onboardingDone === true && <RootLayoutNav />}
                  {onboardingDone === true && <ReviewGate />}
                  <AdhanGate />
                  {onboardingDone === true && <WidgetBridge />}
                  {/* Onboarding overlay — mounted as soon as we know it's needed
                      (still hidden underneath the splash). This way it's already
                      on screen when the splash fades out — no home-screen flash. */}
                  {fontsReady && onboardingDone === false && (
                    <Onboarding onComplete={() => setOnboardingDone(true)} />
                  )}
                  {/* Prayer-notif Ritual — first-time setup after main onboarding */}
                  {splashDone &&
                    onboardingDone === true &&
                    notifRitualDone === false && (
                      <PrayerNotifOnboarding onComplete={() => setNotifRitualDone(true)} />
                    )}
                  {/* Custom splash overlay — covers everything until all gates pass */}
                  {!splashDone && (
                    <NuurSplash onComplete={() => setAnimDone(true)} />
                  )}
                </ToastProvider>
                </QuranPlayerProvider>
                </PrayerTrackerProvider>
              </AppProvider>
              </EntitlementsProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
  );
}
