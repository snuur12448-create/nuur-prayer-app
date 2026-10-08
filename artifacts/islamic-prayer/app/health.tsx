import React, { useCallback, useState } from "react";
import { ActivityIndicator, AppState, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { useAppContext } from "@/context/AppContext";
import { CALC_METHODS } from "@/utils/prayerTimes";
import { readNotificationScheduleStatus, type NotificationScheduleStatus } from "@/utils/notifications";
import { readWidgetDiagnostics, type WidgetDiagnostics } from "@/utils/nuurBridge";
import { WIDGET_BACKGROUND_TASK_NAME } from "@/utils/widgetBackgroundTask";
import { alertHealth, notificationSoundHealth, widgetHealth } from "@/utils/healthStatus";
import { readWithDeadline } from "@/utils/readWithDeadline";

const timestamp = (value: string | null | undefined) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString() : "Not available";
export default function HealthScreen() {
  const { themeColors: colors, location, usingDefaultLocation, calcMethod, madhab, ummAlQuraIshaPolicy } = useAppContext();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<NotificationScheduleStatus | null>(null);
  const [widget, setWidget] = useState<WidgetDiagnostics | null>(null);
  const [background, setBackground] = useState("Checking…");
  const [sound, setSound] = useState("Checking…");
  const [busy, setBusy] = useState(true);
  const [sampledAt, setSampledAt] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setBusy(true);
    void (async () => {
      const [a, w, b, p] = await Promise.allSettled([
        readWithDeadline(readNotificationScheduleStatus), readWithDeadline(readWidgetDiagnostics),
        Platform.OS === "web" ? Promise.resolve(null) : readWithDeadline(() => Promise.all([
          BackgroundTask.getStatusAsync(), TaskManager.isTaskRegisteredAsync(WIDGET_BACKGROUND_TASK_NAME),
        ])),
        Platform.OS === "web" ? Promise.resolve(null) : readWithDeadline(() => Notifications.getPermissionsAsync()),
      ]);
      if (!active) return;
      setAlerts(a.status === "fulfilled" ? a.value : null);
      setWidget(w.status === "fulfilled" ? w.value : null);
      setBackground(b.status !== "fulfilled" || !b.value ? "Unavailable" :
        b.value[0] === BackgroundTask.BackgroundTaskStatus.Restricted ? "Restricted by the system" :
        b.value[1] ? "Registered · iOS chooses when it runs" : "Not registered");
      setSound(notificationSoundHealth(p.status !== "fulfilled" || !p.value ? null : {
        granted: p.value.granted,
        provisional: p.value.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
        allowsSound: p.value.ios?.allowsSound,
      }));
      setSampledAt(new Date().toISOString());
      setBusy(false);
    })();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") setRefresh(value => value + 1);
    });
    return () => { active = false; subscription.remove(); };
  }, [refresh]));
  const alertSummary = alertHealth(alerts);
  const widgetSummary = widgetHealth(widget);
  const row = (label: string, value: string | number) => <View style={styles.row} key={label}>
    <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    <Text selectable style={[styles.value, { color: colors.text }]}>{value}</Text>
  </View>;
  const card = (title: string, content: React.ReactNode) => <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <Text accessibilityRole="header" style={[styles.title, { color: colors.gold }]}>{title}</Text>{content}
  </View>;
  return <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.button}>
        <Text style={{ color: colors.gold }}>‹ Back</Text>
      </Pressable>
      <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>App health</Text>
    </View>
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }}>
      <Text style={{ color: colors.textSecondary }}>Read-only status from this device. Timestamps below use your phone’s local time.</Text>
      {busy ? <ActivityIndicator accessibilityLabel="Reading app health" color={colors.gold} /> : <>
        {card("Prayer alerts", <>
          <Text accessibilityRole={alertSummary.level === "warning" ? "alert" : undefined} style={{ color: alertSummary.level === "good" ? colors.text : colors.gold }}>{alertSummary.message}</Text>
          {row("Next prayer alert", alerts?.nextPrayerLabel ?? "None found")}
          {row("Next prayer alert time", timestamp(alerts?.nextPrayerAt))}
          {row("Next reminder of any kind", `${alerts?.nextAlertLabel ?? "None found"} · ${timestamp(alerts?.nextAlertAt)}`)}
          {row("Actual prayer alerts / advance reminders", `${alerts?.actualPrayerCount ?? "?"} / ${alerts?.preReminderCount ?? "?"}`)}
          {row("Duplicate requests", alerts?.duplicateCount ?? "Unknown")}
          {row("Prayer schedule covers until", timestamp(alerts?.scheduledThrough))}
          {row("Schedule last rebuilt", timestamp(alerts?.lastScheduledAt))}
          {row("Notification sound", sound)}
          <Text style={{ color: colors.textSecondary }}>A queued request is not proof of delivery. Test an actual prayer time with the phone locked. iOS limits notification sounds to short clips; full adhan playback is an in-app feature.</Text>
        </>)}
        {card("Widget data", <>
          <Text accessibilityRole={widgetSummary.level === "warning" ? "alert" : undefined} style={{ color: widgetSummary.level === "good" ? colors.text : colors.gold }}>{widgetSummary.message}</Text>
          {row("Data last saved", timestamp(widget?.generatedAt))}
          {row("Cache valid through", timestamp(widget?.validThrough))}
          {row("Saved prayer days", widget?.prayerDayCount ?? "Unknown")}
          {row("Cached location", widget?.location ?? "Unknown")}
          {row("Background refresh", background)}
          <Text style={{ color: colors.textSecondary }}>Widgets require iOS 17 or later. iOS controls timeline reloads. Force-quitting, disabling background refresh, and travelling without opening Nuur can prevent fresh data from reaching widgets.</Text>
        </>)}
        {card("Calculation and build", <>
          {row("Selected location", `${location?.city ?? "Not set"}${usingDefaultLocation ? " · default location" : ""}`)}
          {row("Location time zone", String(location?.timezone ?? "Unknown"))}
          {row("Calculation method", CALC_METHODS.find(m => m.id === calcMethod)?.label ?? calcMethod)}
          {row("Asr method", madhab)}
          {calcMethod === "UmmAlQura" && row("Isha policy", ummAlQuraIshaPolicy === "calendar" ? "Calculated Ramadan calendar (90/120 min)" : ummAlQuraIshaPolicy === "fixed120" ? "Always 120 min" : "Always 90 min")}
          {row("Version", `${Constants.expoConfig?.version ?? "Unknown"} (build ${Constants.nativeBuildVersion ?? Constants.expoConfig?.ios?.buildNumber ?? "?"})`)}
          {row("Checked at", timestamp(sampledAt))}
        </>)}
      </>}
      <Pressable accessibilityRole="button" accessibilityLabel="Read app health again" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={() => setRefresh(v => v + 1)} style={[styles.refresh, { backgroundColor: colors.gold, opacity: busy ? 0.5 : 1 }]}>
        <Text style={{ color: colors.background, fontWeight: "700" }}>Refresh status</Text>
      </Pressable>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 12 },
  button: { minHeight: 48, minWidth: 60, justifyContent: "center", paddingHorizontal: 8 },
  heading: { fontSize: 24, fontWeight: "700", flexShrink: 1 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  title: { fontSize: 19, fontWeight: "600" },
  row: { gap: 3 }, label: { fontSize: 13 }, value: { fontSize: 16 },
  refresh: { minHeight: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", padding: 12 },
});
