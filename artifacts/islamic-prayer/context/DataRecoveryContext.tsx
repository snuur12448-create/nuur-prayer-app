import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { initializeDataControls } from '@/utils/dataControls';
import { purgeLegacyQuranFoundationCaches } from '@/utils/quranFoundationCache';

/** Intentionally outside all stateful providers and their persistence effects. */
export function DataRecoveryGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError(null);
    initializeDataControls().then(async result => {
      // Recovered snapshots may contain legacy provider caches. Remove only
      // those copies before any reader or provider can become active.
      await purgeLegacyQuranFoundationCaches();
      if (!active) return;
      setReady(true);
      if (result === 'rolled-back') Alert.alert('Data recovered', 'An interrupted data change was rolled back. Your personal data is restored; reminders remain off until you enable them again.');
      if (result === 'completed') Alert.alert('Data change completed', 'Your saved data change has finished. Reminders remain off until you review Settings and enable them again.');
    }).catch(reason => {
      if (active) {
        setError(reason instanceof Error ? reason.message : 'Data recovery could not finish.');
        // The normal splash transition lives inside the gated providers. On
        // failure it cannot run, so reveal this recovery UI and its retry.
        void SplashScreen.hideAsync().catch(() => {});
      }
    });
    return () => { active = false; };
  }, [attempt]);
  if (ready) return <>{children}</>;
  return <ScrollView style={{ flex: 1, backgroundColor: '#F4F6F2' }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28, gap: 16 }}>
    <Text accessibilityRole="header" style={{ color: '#172A21', fontSize: 24, fontWeight: '600' }}>{error ? 'Data recovery needs attention' : 'Preparing your data'}</Text>
    {error ? <>
      <Text selectable style={{ color: '#172A21', fontSize: 17 }}>{error}</Text>
      <Text style={{ color: '#172A21', fontSize: 17 }}>Nuur has paused to protect your data. Do not uninstall the app.</Text>
      <Pressable accessibilityRole="button" onPress={() => setAttempt(value => value + 1)} style={{ minHeight: 48, justifyContent: 'center', padding: 14, backgroundColor: '#173F2C', borderRadius: 12 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>Retry recovery</Text>
      </Pressable>
    </> : <ActivityIndicator accessibilityLabel="Checking data recovery" color="#173F2C" />}
  </ScrollView>;
}
