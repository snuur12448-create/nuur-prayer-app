import type { NotificationScheduleStatus } from "./notifications";
import type { WidgetDiagnostics } from "./nuurBridge";

export type HealthLevel = "good" | "notice" | "warning";
export function notificationSoundHealth(permission: { granted: boolean; provisional: boolean; allowsSound?: boolean | null } | null): string {
  if (!permission) return "Could not check";
  if (permission.provisional) return "Provisional permission · delivered quietly";
  if (!permission.granted) return "Notification permission not granted · check device Settings";
  if (permission.allowsSound === false) return "Sound disabled in iPhone Settings";
  if (permission.allowsSound === true) return "Sound allowed · Silent Mode and Focus still apply";
  return "Check your device notification sound settings";
}
export function alertHealth(status: NotificationScheduleStatus | null, now = Date.now()): { level: HealthLevel; message: string } {
  if (!status || status.error) return { level: "warning", message: "Could not read the device alert queue." };
  if (status.duplicateCount > 0) return { level: "warning", message: "Duplicate requests are still queued. Reopen Nuur and check again." };
  if (status.permission !== "granted") return { level: "warning", message: "Notification permission is not available. Check device Settings." };
  if (!status.configuredEnabled) return status.actualPrayerCount > 0 || status.preReminderCount > 0
    ? { level: "warning", message: "Prayer alerts are off in Nuur, but prayer requests remain queued. Reopen Nuur and check your alert settings." }
    : { level: "notice", message: "Prayer alerts are switched off in Nuur." };
  const nextTime = Date.parse(status.nextPrayerAt ?? "");
  const through = Date.parse(status.scheduledThrough ?? "");
  if (!status.actualPrayerCount || !Number.isFinite(nextTime) || nextTime <= now) {
    return { level: "warning", message: "No future prayer-time alert was found. Check your prayer alert settings." };
  }
  if (!Number.isFinite(through) || through < nextTime || through <= now + 86_400_000) {
    return { level: "warning", message: "Less than a day of prayer alerts remains. Open Nuur to replenish the schedule." };
  }
  return { level: "good", message: "Future prayer-time requests are queued with no duplicates. Delivery and sound still depend on iOS settings." };
}

export function widgetHealth(data: WidgetDiagnostics | null, now = Date.now()): { level: HealthLevel; message: string } {
  if (!data) return { level: "warning", message: "Could not read widget data." };
  if (!data.available) return { level: "notice", message: "Native widget diagnostics are unavailable in this build or on this platform." };
  if (!data.generatedAt || !data.validThrough || !Number.isInteger(data.prayerDayCount) || data.prayerDayCount <= 0) {
    return { level: "warning", message: "No complete prayer cache is saved for the widgets yet." };
  }
  const generated = Date.parse(data.generatedAt);
  const expiry = Date.parse(data.validThrough);
  if (!Number.isFinite(generated) || !Number.isFinite(expiry) || generated > now + 300_000 || expiry <= generated) {
    return { level: "warning", message: "Widget cache dates are invalid. Check your device clock and reopen Nuur." };
  }
  if (expiry <= now) return { level: "warning", message: "Widget prayer data has expired. Reopen Nuur to refresh it." };
  if (expiry <= now + 86_400_000) return { level: "warning", message: "Widget prayer data expires within a day. Reopen Nuur to refresh it." };
  return { level: "good", message: "Prayer data is saved ahead. This confirms the cache, not the time iOS last rendered your widget." };
}
