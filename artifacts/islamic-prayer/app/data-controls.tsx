import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import { isStorageMaintenanceActive } from '@/utils/AppStorage';
import { chooseBackupToRestore, clearPersonalData, exportEncryptedBackup, reloadAfterDataChange, restorePersonalData, supportsDataControls } from '@/utils/dataControls';

function confirm(title: string, message: string, action: string): Promise<boolean> {
  return new Promise(resolve => Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
    { text: action, style: 'destructive', onPress: () => resolve(true) },
  ], { cancelable: false }));
}

export default function DataControlsScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [deleteText, setDeleteText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const working = useRef(false);
  const available = supportsDataControls();
  const paused = isStorageMaintenanceActive();
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') { setPassword(''); setConfirmation(''); }
    });
    return () => subscription.remove();
  }, []);

  const run = async (operation: () => Promise<void>) => {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setMessage(null);
    try { await operation(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'The data operation could not finish.'); }
    finally {
      setPassword(''); setConfirmation('');
      working.current = false; setBusy(false);
    }
  };
  const textStyle = { color: colors.text, fontSize: 16, lineHeight: 24 };
  const inputStyle = { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 14, minHeight: 52, fontSize: 17 };
  const Button = ({ title, onPress, danger = false, disabled = false }: { title: string; onPress: () => void; danger?: boolean; disabled?: boolean }) => <Pressable
    accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={{ padding: 14, minHeight: 50, justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: danger ? colors.red : colors.tint, opacity: disabled ? 0.5 : 1 }}>
    <Text style={{ color: danger ? colors.red : colors.text, fontSize: 17, fontWeight: '600', textAlign: 'center' }}>{title}</Text>
  </Pressable>;

  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <Stack.Screen options={{ headerShown: false, gestureEnabled: !busy && !paused }} />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 22, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40, gap: 16 }}>
      <Button title="Back to Settings" disabled={busy || paused} onPress={() => router.back()} />
      <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>Your data</Text>
      <Text style={textStyle}>Nuur has no account-based cloud backup. Create a password-encrypted file and choose where to save it. Nuur cannot recover a forgotten backup password.</Text>
      <Text style={textStyle}>Backups include prayer settings, saved location, prayer and qada records, Sunnah history, bookmarks, Quran reading position, dhikr selections and Zakat entries. They exclude purchase or installation identity, downloaded content, audio files, notification queues and today's shared widget adhkar counts.</Text>
      <Text style={textStyle}>The password is not saved. Keep the encrypted file and password safe. Sharing it may send the file to the service you choose.</Text>
      {!available && <Text accessibilityRole="alert" style={textStyle}>These controls require the current Nuur iPhone build.</Text>}
      {message && <Text accessibilityRole="alert" selectable style={[textStyle, { color: colors.red }]}>{message}</Text>}
      {busy && <ActivityIndicator accessibilityLabel="Data operation in progress" color={colors.tint} />}
      {paused ? <>
        <Text style={textStyle}>Data changes are paused safely. Restart Nuur to finish or recover the operation. Do not uninstall the app.</Text>
        <Button title="Restart Nuur" disabled={busy} onPress={() => { void run(reloadAfterDataChange); }} />
      </> : <>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 21, fontWeight: '600' }}>Encrypted backup</Text>
        <TextInput accessibilityLabel="Backup password, at least 12 characters" placeholder="Backup password (12+ characters)" placeholderTextColor={colors.textSecondary}
          style={inputStyle} secureTextEntry autoCorrect={false} autoCapitalize="none" textContentType="none" maxLength={1024} value={password} onChangeText={setPassword} editable={!busy && available} />
        <TextInput accessibilityLabel="Confirm password for export" placeholder="Confirm password for export" placeholderTextColor={colors.textSecondary}
          style={inputStyle} secureTextEntry autoCorrect={false} autoCapitalize="none" textContentType="none" maxLength={1024} value={confirmation} onChangeText={setConfirmation} editable={!busy && available} />
        <Button title="Export encrypted backup" disabled={busy || !available} onPress={() => { void run(async () => {
          if (password !== confirmation) throw new Error('The passwords do not match.');
          await exportEncryptedBackup(password);
          setMessage('The share sheet has closed. Check your chosen destination to confirm that your encrypted backup was saved.');
        }); }} />
        <Button title="Choose backup to restore" disabled={busy || !available} onPress={() => { void run(async () => {
          const payload = await chooseBackupToRestore(password);
          if (!payload) return;
          const accepted = await confirm('Replace your personal data?', `This validated backup was created on ${new Date(payload.createdAt).toLocaleDateString()} and contains ${Object.keys(payload.values).length} saved data groups. It will replace the personal data listed above, stop audio and clear widget data and all scheduled alerts. Reminders stay off until you enable them again. Export your current data first if you want to keep it.`, 'Restore and restart');
          if (accepted) await restorePersonalData(payload);
        }); }} />
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 21, fontWeight: '600', marginTop: 12 }}>Clear personal data</Text>
        <Text style={textStyle}>This removes Nuur's personal settings, saved location, prayer history, bookmarks, Zakat entries, cached Quran text and shared widget data from this device. It stops audio and cancels Nuur's alerts. Existing exported files, system permissions and purchase/installation identity are not deleted. There is no undo without a backup.</Text>
        <TextInput accessibilityLabel="Type DELETE to enable clearing personal data" placeholder="Type DELETE" placeholderTextColor={colors.textSecondary}
          style={inputStyle} autoCorrect={false} autoCapitalize="characters" value={deleteText} onChangeText={setDeleteText} editable={!busy && available} />
        <Button title="Clear personal data" danger disabled={busy || !available || deleteText !== 'DELETE'} onPress={() => { void run(async () => {
          if (await confirm('Clear Nuur personal data?', 'This permanently clears the listed data on this device and restarts Nuur. Export a backup first if you want to keep it.', 'Clear and restart')) await clearPersonalData();
        }); }} />
      </>}
    </ScrollView>
  </View>;
}
