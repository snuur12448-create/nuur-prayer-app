import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AdhanOverlay } from "@/components/AdhanOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NuurSplash } from "@/components/NuurSplash";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { QuranPlayerProvider } from "@/context/QuranPlayerContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quran/[id]" options={{ headerShown: false, presentation: "card" }} />
    </Stack>
  );
}

function AdhanGate() {
  const { adhanPlaying, adhanPrayerName, adhanPrayerArabicName, adhanCurrentStyle, stopAdhan } =
    useAppContext();

  if (!adhanPlaying || !adhanPrayerName || !adhanPrayerArabicName) return null;

  return (
    <AdhanOverlay
      prayerName={adhanPrayerName}
      prayerArabicName={adhanPrayerArabicName}
      reciter={adhanCurrentStyle.reciter}
      styleName={adhanCurrentStyle.name}
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
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <QuranPlayerProvider>
                  <RootLayoutNav />
                  <AdhanGate />
                  {!splashDone && (
                    <NuurSplash onComplete={() => setSplashDone(true)} />
                  )}
                </QuranPlayerProvider>
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
