import { AmiriQuran_400Regular } from "@expo-google-fonts/amiri-quran";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AdhanOverlay } from "@/components/AdhanOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NuurSplash } from "@/components/NuurSplash";
import { Onboarding, ONBOARDING_KEY } from "@/components/Onboarding";
import { PrayerNotifOnboarding, NOTIF_RITUAL_KEY } from "@/components/PrayerNotifOnboarding";
import { ToastProvider } from "@/components/Toast";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { PrayerTrackerProvider } from "@/context/PrayerTrackerContext";
import { QuranPlayerProvider } from "@/context/QuranPlayerContext";
import { configurePurchases } from "@/utils/iap";
import { recordFirstLaunch, maybeRequestReview } from "@/utils/reviewPrompt";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quran/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="calendar" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="qada" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="sunnah-prayers" options={{ headerShown: false, presentation: "card" }} />
      {/* Promoted from (tabs)/ — these are reachable from More and Home QuickActions,
          but they are not tabs and now push on top of the tab navigator. */}
      <Stack.Screen name="tracker" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="names" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="tasbeeh" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="settings" options={{ headerShown: false, presentation: "card" }} />
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
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    AmiriQuran_400Regular,
  });

  // Three-gate system: splash hides only when animation, fonts, AND onboarding
  // status are all resolved — prevents a flash between splash and onboarding.
  const [animDone, setAnimDone] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [notifRitualDone, setNotifRitualDone] = useState<boolean | null>(null);
  const fontsReady = fontsLoaded || !!fontError;

  // Load onboarding status from storage immediately on mount.
  useEffect(() => {
    recordFirstLaunch();
    // Dormant by default — no-op until RevenueCat keys are provided.
    configurePurchases();
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      setOnboardingDone(v === "true");
    }).catch(() => {
      setOnboardingDone(true); // fail open — don't block the app
    });
    AsyncStorage.getItem(NOTIF_RITUAL_KEY).then((v) => {
      setNotifRitualDone(v === "true");
    }).catch(() => {
      setNotifRitualDone(true); // fail open
    });
  }, []);

  useEffect(() => {
    if (animDone && fontsReady && onboardingDone !== null) {
      setSplashDone(true);
    }
  }, [animDone, fontsReady, onboardingDone]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <PrayerTrackerProvider>
                <QuranPlayerProvider>
                <ToastProvider>
                  {/* Main app — only rendered once fonts are ready to prevent FOUT.
                      Contexts (AppProvider, QuranPlayerProvider) warm up above this,
                      so data loading is NOT blocked — only screen rendering is. */}
                  {fontsReady && <RootLayoutNav />}
                  <ReviewGate />
                  <AdhanGate />
                  {/* Onboarding overlay — shown once after first-launch splash */}
                  {splashDone && onboardingDone === false && (
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
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
