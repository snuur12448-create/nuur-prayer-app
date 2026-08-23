import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import type { WidgetPrayerDay } from "./widgetPrayerSchedule";

const { NuurBridge } = NativeModules as {
  NuurBridge?: {
    writeWidgetData: (json: string) => Promise<void>;
    reloadWidget: () => Promise<void>;
    refreshWeather?: (latitude: number, longitude: number) => Promise<void>;
    readAdhkarState?: () => Promise<AdhkarStateNative>;
    markAdhkarRecited?: (id: string) => Promise<AdhkarStateNative>;
    // RCTEventEmitter required methods — present on the native module object
    // when the Swift class inherits from RCTEventEmitter. We never call them
    // directly; they exist so the NativeEventEmitter doesn't warn.
    addListener?: (eventName: string) => void;
    removeListeners?: (count: number) => void;
  };
};

export interface WidgetSnapshot {
  /** ISO 8601 UTC timestamps for today's prayers. */
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  /** ISO 8601 timestamp for tomorrow's Fajr (lets the widget keep counting
   *  down accurately through the night after Isha passes, instead of using
   *  a synthetic today-Fajr+24h placeholder). */
  fajrTomorrow: string;
  /** Rolling cache used by WidgetKit to remain accurate when iOS does not
   *  grant the containing app a background refresh. */
  prayerDays?: WidgetPrayerDay[];
  /** IANA timezone for rendering and calendar matching inside WidgetKit. */
  timeZone?: string;
  /** Display label for the widget header, e.g. "London, UK". */
  location: string;
  /** Formatted Hijri date, e.g. "18 Dhū al-Qaʿdah 1446". */
  hijri: string;
  /** User's preferred time format ("12h" or "24h") — drives AM/PM display
   *  in the Timetable widget. Optional; older snapshots default to 12h. */
  timeFormat?: string;
  /** App theme name ("emerald" / "midnight" / "gold" / "slate" / "burgundy")
   *  — drives the chrome accent on the small Square widget. */
  themeName?: string;
  /** Qibla bearing from the user's location to the Kaaba, in degrees
   *  clockwise from true north (0–360). Drives the Qibla compass widget. */
  qiblaBearing?: number;
  /** Consecutive days where all 5 prayers are recorded (Large widget). */
  streakDays: number;
  /** Last 7 days completion percentage (0–100, integer; Large widget). */
  weekPct: number;
  /** Daily-rotating verse, Arabic text + reference (Large widget). */
  verseAr: string;
  verseRef: string;
}

/**
 * Push today's prayer-time snapshot to the iOS Live Activity / Widget via
 * App Group shared storage, then ask iOS to refresh widget timelines.
 *
 * Silently no-ops on non-iOS platforms or if the native module isn't linked
 * (e.g. running in Expo Go without a custom dev client).
 */
export async function pushWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  if (Platform.OS !== "ios") return;
  if (!NuurBridge) {
    if (__DEV__) {
      console.warn(
        "[NuurBridge] native module not found. Rebuild the app after adding " +
          "NuurBridge.swift + NuurBridge.m to the Nuur target in Xcode.",
      );
    }
    return;
  }
  try {
    await NuurBridge.writeWidgetData(JSON.stringify(snapshot));
    await NuurBridge.reloadWidget();
    if (__DEV__) {
      console.log("[NuurBridge] snapshot pushed:", snapshot.location, snapshot.hijri);
    }
  } catch (e) {
    if (__DEV__) console.warn("[NuurBridge] push failed:", e);
  }
}

/**
 * Refresh cached weather for the user's location via WeatherKit. Powers the
 * Verse of the Moment's rain / thunderstorm / snow contextual triggers on the
 * Large widget. The widget reads the cached condition — it never fetches
 * WeatherKit itself (rate limit). Call on app launch and roughly hourly.
 *
 * No-ops silently on non-iOS, on iOS < 16, if the native module is missing,
 * or if the WeatherKit entitlement isn't enabled yet — the widget just falls
 * back to no-weather-trigger in that case.
 */
export async function refreshWeather(latitude: number, longitude: number): Promise<void> {
  if (Platform.OS !== "ios") return;
  if (!NuurBridge || !NuurBridge.refreshWeather) return;
  try {
    await NuurBridge.refreshWeather(latitude, longitude);
    if (__DEV__) console.log("[NuurBridge] weather refreshed:", latitude, longitude);
  } catch (e) {
    if (__DEV__) console.warn("[NuurBridge] weather refresh failed:", e);
  }
}

// =============================================================================
// Adhkar shared state — Phase 4
//
// Bridges the App Group's `nuur.adhkarState` so the in-app counter and the
// home-screen widget stay in sync. Mutations from either side post a Darwin
// notification ("com.nuur.adhkar.didUpdate"); the native bridge forwards it
// to JS as the "NuurAdhkarDidUpdate" RN event.
// =============================================================================

/** Mirror of Swift `AdhkarState`. */
export interface AdhkarStateNative {
  dateISO: string;
  recitedIds: string[];
  inProgressId: string | null;
  inProgressCount: number;
  morningCompleted: boolean;
  eveningCompleted: boolean;
}

const EMPTY_ADHKAR_STATE: AdhkarStateNative = {
  dateISO: "",
  recitedIds: [],
  inProgressId: null,
  inProgressCount: 0,
  morningCompleted: false,
  eveningCompleted: false,
};

/** Read the current shared adhkar state. Returns an empty state on non-iOS
 *  or when the native module isn't linked (e.g. Expo Go). */
export async function readAdhkarState(): Promise<AdhkarStateNative> {
  if (Platform.OS !== "ios") return EMPTY_ADHKAR_STATE;
  if (!NuurBridge || !NuurBridge.readAdhkarState) return EMPTY_ADHKAR_STATE;
  try {
    const raw = await NuurBridge.readAdhkarState();
    return normalizeState(raw);
  } catch (e) {
    if (__DEV__) console.warn("[NuurBridge] readAdhkarState failed:", e);
    return EMPTY_ADHKAR_STATE;
  }
}

/** Mark a dhikr as recited. Idempotent. Resolves with the new state.
 *  No-ops with an empty state on non-iOS or when the native module is missing. */
export async function markAdhkarRecited(id: string): Promise<AdhkarStateNative> {
  if (Platform.OS !== "ios") return EMPTY_ADHKAR_STATE;
  if (!NuurBridge || !NuurBridge.markAdhkarRecited) return EMPTY_ADHKAR_STATE;
  try {
    const raw = await NuurBridge.markAdhkarRecited(id);
    return normalizeState(raw);
  } catch (e) {
    if (__DEV__) console.warn("[NuurBridge] markAdhkarRecited failed:", id, e);
    return EMPTY_ADHKAR_STATE;
  }
}

/**
 * Subscribe to adhkar state changes coming from any surface (widget tap, app
 * tap, day rollover). The callback fires with the fresh state included in the
 * event body. Returns an unsubscribe function — call it from the cleanup of
 * a `useEffect`.
 */
export function subscribeToAdhkarUpdates(
  callback: (state: AdhkarStateNative) => void,
): () => void {
  if (Platform.OS !== "ios" || !NuurBridge) return () => {};
  // The cast tells RN's NativeEventEmitter that this module conforms to the
  // event emitter interface (it does — Swift class inherits RCTEventEmitter).
  const emitter = new NativeEventEmitter(NuurBridge as unknown as never);
  const sub = emitter.addListener("NuurAdhkarDidUpdate", (raw: unknown) => {
    callback(normalizeState(raw));
  });
  return () => sub.remove();
}

function normalizeState(raw: unknown): AdhkarStateNative {
  if (!raw || typeof raw !== "object") return EMPTY_ADHKAR_STATE;
  const r = raw as Record<string, unknown>;
  return {
    dateISO: typeof r.dateISO === "string" ? r.dateISO : "",
    recitedIds: Array.isArray(r.recitedIds)
      ? (r.recitedIds.filter((x) => typeof x === "string") as string[])
      : [],
    inProgressId: typeof r.inProgressId === "string" ? r.inProgressId : null,
    inProgressCount: typeof r.inProgressCount === "number" ? r.inProgressCount : 0,
    morningCompleted: r.morningCompleted === true,
    eveningCompleted: r.eveningCompleted === true,
  };
}
