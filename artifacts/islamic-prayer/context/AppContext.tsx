import AsyncStorage from "@/utils/AppStorage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, AppState, Linking, Platform, useColorScheme } from "react-native";
import {
  calculatePrayerTimes,
  applyPrayerOffsets,
  PrayerTimesResult,
  PrayerOffsets,
  DEFAULT_PRAYER_OFFSETS,
  CalcMethodId,
  MadhabId,
  HighLatRuleId,
  PolarResolutionId,
  TimeFormat,
  DEFAULT_CALC_METHOD,
  DEFAULT_MADHAB,
  DEFAULT_HIGH_LAT_RULE,
  DEFAULT_POLAR_RESOLUTION,
  DEFAULT_UMM_AL_QURA_ISHA_POLICY,
  normalizeUmmAlQuraIshaPolicy,
  type UmmAlQuraIshaPolicy,
  DEFAULT_TIME_FORMAT,
  normalizeHighLatRule,
  normalizePolarResolution,
} from "@/utils/prayerTimes";
import { suggestCalcMethod, getCalcMethodLabel } from "@/utils/calcMethodByCountry";
import { suggestMadhab, getMadhabLabel } from "@/utils/madhabByCountry";
import {
  DEFAULT_THEME,
  DEFAULT_DISPLAY_MODE,
  THEMES,
  ThemeColors,
  ThemeName,
  DisplayMode,
} from "@/constants/themes";
import {
  cancelAllPrayerNotifications,
  getNotificationPermissionState,
  getMillisSinceLastSchedule,
  requestNotificationPermissionDetailed,
  schedulePrayerNotifications,
} from "@/utils/notifications";
import {
  DEFAULT_PRAYER_NOTIF_CONFIG,
  normalizePrayerNotifConfig,
  OBLIGATORY_PRAYER_KEYS,
  patchObligatoryPrayerNotifications,
  shouldPresentForegroundAdhan,
  PrayerKey,
  PrayerNotifConfig,
  PrayerNotifSettings,
} from "@/utils/prayerNotifData";
import {
  ADHAN_STYLES,
  DEFAULT_ADHAN_STYLE_ID,
  DEFAULT_ADHAN_MODE,
  getAdhanStyle,
  resolveAdhanUrl,
  AdhanStyle,
  AdhanMode,
} from "@/utils/adhanData";
import { playAdhanAudio, stopAdhanAudio } from "@/utils/adhanPlayer";
import {
  dateKeyInTimeZone,
  dayOfWeekInTimeZone,
  getDeviceTimeZone,
  isValidIanaTimeZone,
  legacyOffsetForLongitude,
  timeZoneAtCoordinates,
  type TimeZoneValue,
} from "@/utils/timeZone";
import { reverseNominatim } from "@/utils/nominatim";

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  timezone: TimeZoneValue;
  /** Uppercase ISO 3166-1 alpha-2 code when known. */
  countryCode?: string;
}

interface AppContextType {
  location: LocationData | null;
  prayerTimes: PrayerTimesResult | null;
  locationError: string | null;
  isLoadingLocation: boolean;
  usingDefaultLocation: boolean;
  isLocationPermDenied: boolean;
  refreshPrayerTimes: () => void;
  // Resolves with `permanentlyDenied: true` when the OS reports the perm is
  // blocked (canAskAgain === false). Callers (e.g. onboarding) use this to
  // keep the user on the same screen so a recovery CTA can render instead
  // of silently advancing.
  requestLocation: () => Promise<{ permanentlyDenied: boolean }>;
  setManualLocation: (loc: LocationData) => Promise<void>;
  bookmarkedSurahs: number[];
  toggleBookmark: (surahNumber: number) => void;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  effectiveDisplayMode: "dark" | "light";
  themeColors: ThemeColors;
  notificationsEnabled: boolean;
  notifPermBlocked: boolean;
  // Resolves with `blocked: true` when iOS/Android has permanently denied
  // notification permission, so onboarding can keep the user on the screen
  // and render an "Open Settings" recovery card.
  toggleNotifications: () => Promise<{ blocked: boolean }>;
  calcMethod: CalcMethodId;
  setCalcMethod: (method: CalcMethodId) => void;
  calcMethodAutoSetLabel: string | null;
  dismissCalcMethodNotice: () => void;
  madhab: MadhabId;
  setMadhab: (madhab: MadhabId) => void;
  madhabAutoSetLabel: string | null;
  dismissMadhabNotice: () => void;
  highLatRule: HighLatRuleId;
  setHighLatRule: (rule: HighLatRuleId) => void;
  polarResolution: PolarResolutionId;
  setPolarResolution: (resolution: PolarResolutionId) => void;
  ummAlQuraIshaPolicy: UmmAlQuraIshaPolicy;
  setUmmAlQuraIshaPolicy: (policy: UmmAlQuraIshaPolicy) => Promise<void>;
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  adhanEnabled: boolean;
  adhanStyleId: string;
  adhanMode: AdhanMode;
  setAdhanStyleId: (id: string) => Promise<void>;
  setAdhanMode: (mode: AdhanMode) => Promise<void>;
  toggleAdhan: () => Promise<void>;
  adhanPlaying: boolean;
  adhanIsSilent: boolean;
  adhanPrayerName: string | null;
  adhanPrayerArabicName: string | null;
  adhanCurrentStyle: AdhanStyle;
  stopAdhan: () => Promise<void>;
  prayerNotifConfig: PrayerNotifConfig;
  setPrayerNotifSettings: (key: PrayerKey, settings: PrayerNotifSettings) => Promise<void>;
  toggleMasterPrayerBell: () => Promise<void>;
  // Quick-sheet controls
  notifSnoozeUntil: number; // unix ms; 0 means no snooze
  setNotifSnoozeUntil: (timestamp: number) => Promise<void>;
  prayerPreReminderMinutes: 0 | 5 | 10 | 15;
  setPrayerPreReminderMinutes: (minutes: 0 | 5 | 10 | 15) => Promise<void>;
  setAllPrayersNotifType: (type: "silent" | "notification" | "adhan") => Promise<void>;
  jummahReminderEnabled: boolean;
  jummahMinutesBefore: number;
  setJummahReminder: (enabled: boolean, minutes: number) => Promise<void>;
  ayahReminderEnabled: boolean;
  ayahReminderHour: number;
  ayahReminderMinute: number;
  setAyahReminder: (enabled: boolean, hour: number, minute: number) => Promise<void>;
  hadithReminderEnabled: boolean;
  hadithReminderHour: number;
  hadithReminderMinute: number;
  setHadithReminder: (enabled: boolean, hour: number, minute: number) => Promise<void>;
  islamicEventsEnabled: boolean;
  setIslamicEventsReminder: (enabled: boolean) => Promise<void>;
  prayerOffsets: PrayerOffsets;
  setPrayerOffsets: (offsets: PrayerOffsets) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  LOCATION: "location_data",
  LOCATION_SOURCE: "location_source",
  BOOKMARKS: "bookmarked_surahs",
  THEME: "app_theme",
  DISPLAY_MODE: "display_mode",
  NOTIFICATIONS: "notifications_enabled",
  CALC_METHOD: "calc_method",
  CALC_METHOD_SOURCE: "calc_method_source",
  MADHAB: "madhab",
  MADHAB_SOURCE: "madhab_source",
  HIGH_LAT_RULE: "high_lat_rule",
  POLAR_RESOLUTION: "polar_resolution",
  UMM_AL_QURA_ISHA_POLICY: "umm_al_qura_isha_policy",
  TIME_FORMAT: "time_format",
  ADHAN_ENABLED: "adhan_enabled",
  ADHAN_STYLE: "adhan_style",
  ADHAN_MODE: "adhan_mode",
  PRAYER_NOTIF_CONFIG: "prayer_notif_config",
  JUMMAH_REMINDER: "jummah_reminder_enabled",
  JUMMAH_MINUTES: "jummah_minutes_before",
  AYAH_REMINDER: "ayah_reminder_enabled",
  AYAH_HOUR: "ayah_reminder_hour",
  AYAH_MINUTE: "ayah_reminder_minute",
  HADITH_REMINDER: "hadith_reminder_enabled",
  HADITH_HOUR: "hadith_reminder_hour",
  HADITH_MINUTE: "hadith_reminder_minute",
  ISLAMIC_EVENTS_REMINDER: "islamic_events_reminder",
  PRAYER_OFFSETS: "prayer_offsets",
  NOTIF_SNOOZE_UNTIL: "notif_snooze_until",
  PRAYER_PRE_REMINDER: "prayer_pre_reminder_minutes",
};

const DEFAULT_LOCATION: LocationData = {
  latitude: 21.4225,
  longitude: 39.8262,
  city: "Makkah",
  timezone: "Asia/Riyadh",
  countryCode: "SA",
};

interface NotificationScheduleOverrides {
  jummahEnabled?: boolean;
  jummahMinutes?: number;
  ayahEnabled?: boolean;
  ayahHour?: number;
  ayahMinute?: number;
  hadithEnabled?: boolean;
  hadithHour?: number;
  hadithMinute?: number;
  eventsEnabled?: boolean;
  offsets?: PrayerOffsets;
  calcMethod?: CalcMethodId;
  madhab?: MadhabId;
  highLatRule?: HighLatRuleId;
  polarResolution?: PolarResolutionId;
  ummAlQuraIshaPolicy?: UmmAlQuraIshaPolicy;
}

function normalizeStoredLocation(value: unknown): LocationData | null {
  if (!value || typeof value !== "object") return null;
  const loc = value as Partial<LocationData>;
  if (!Number.isFinite(loc.latitude) || !Number.isFinite(loc.longitude) || typeof loc.city !== "string") {
    return null;
  }
  const timezone = isValidIanaTimeZone(loc.timezone)
    ? loc.timezone
    : typeof loc.timezone === "number" && Number.isFinite(loc.timezone)
      ? loc.timezone
      : legacyOffsetForLongitude(loc.longitude as number);
  return {
    latitude: loc.latitude as number,
    longitude: loc.longitude as number,
    city: loc.city,
    timezone,
    ...(typeof loc.countryCode === "string" && /^[A-Za-z]{2}$/.test(loc.countryCode)
      ? { countryCode: loc.countryCode.toUpperCase() }
      : {}),
  };
}

function extractCity(geocode: Location.LocationGeocodedAddress | null | undefined): string | null {
  if (!geocode) return null;
  return geocode.city || geocode.subregion || geocode.district || geocode.region || null;
}

async function nominatimLocation(
  lat: number,
  lng: number,
): Promise<{ city: string | null; countryCode: string | null } | null> {
  try {
    const addr = (await reverseNominatim(lat, lng))?.address;
    if (!addr) return null;
    const city = addr.city || addr.town || addr.village ||
      addr.municipality || addr.county || addr.state_district || addr.state || null;
    const countryCode = typeof addr.country_code === "string"
      ? addr.country_code.toUpperCase()
      : null;
    return { city, countryCode };
  } catch {
    return null;
  }
}

const PRAYER_KEYS = OBLIGATORY_PRAYER_KEYS;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);
  const [isLocationPermDenied, setIsLocationPermDenied] = useState(false);
  const [bookmarkedSurahs, setBookmarkedSurahs] = useState<number[]>([]);
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME);
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(DEFAULT_DISPLAY_MODE);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifPermBlocked, setNotifPermBlocked] = useState(false);
  const [calcMethod, setCalcMethodState] = useState<CalcMethodId>(DEFAULT_CALC_METHOD);
  const [calcMethodAutoSetLabel, setCalcMethodAutoSetLabel] = useState<string | null>(null);
  const calcMethodSavedRef = useRef(false);
  const [madhab, setMadhabState] = useState<MadhabId>(DEFAULT_MADHAB);
  const [madhabAutoSetLabel, setMadhabAutoSetLabel] = useState<string | null>(null);
  const madhabSavedRef = useRef(false);
  const [highLatRule, setHighLatRuleState] = useState<HighLatRuleId>(DEFAULT_HIGH_LAT_RULE);
  const [polarResolution, setPolarResolutionState] = useState<PolarResolutionId>(DEFAULT_POLAR_RESOLUTION);
  const [ummAlQuraIshaPolicy, setUmmAlQuraIshaPolicyState] = useState<UmmAlQuraIshaPolicy>(DEFAULT_UMM_AL_QURA_ISHA_POLICY);
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(DEFAULT_TIME_FORMAT);

  // Per-prayer notification config
  const [prayerNotifConfig, setPrayerNotifConfigState] = useState<PrayerNotifConfig>(DEFAULT_PRAYER_NOTIF_CONFIG);

  // Jummah reminder
  const [jummahReminderEnabled, setJummahReminderEnabledState] = useState(true);
  const [jummahMinutesBefore, setJummahMinutesBeforeState] = useState(30);

  // Ayah of the Day reminder
  const [ayahReminderEnabled, setAyahReminderEnabledState] = useState(true);
  const [ayahReminderHour, setAyahReminderHourState] = useState(8);
  const [ayahReminderMinute, setAyahReminderMinuteState] = useState(0);

  // Hadith of the Day reminder
  const [hadithReminderEnabled, setHadithReminderEnabledState] = useState(true);
  const [hadithReminderHour, setHadithReminderHourState] = useState(9);
  const [hadithReminderMinute, setHadithReminderMinuteState] = useState(0);

  // Islamic Calendar Events reminder
  const [islamicEventsEnabled, setIslamicEventsEnabledState] = useState(true);

  // Per-prayer manual time offsets (±15 min)
  const [prayerOffsets, setPrayerOffsetsState] = useState<PrayerOffsets>(DEFAULT_PRAYER_OFFSETS);
  const prayerOffsetsRef = useRef<PrayerOffsets>(DEFAULT_PRAYER_OFFSETS);

  // Quick-sheet notification controls
  const [notifSnoozeUntil, setNotifSnoozeUntilState] = useState<number>(0);
  const [prayerPreReminderMinutes, setPrayerPreReminderMinutesState] = useState<0 | 5 | 10 | 15>(0);

  // Adhan state
  const [adhanEnabled, setAdhanEnabled] = useState(false);
  const [adhanStyleId, setAdhanStyleIdState] = useState<string>(DEFAULT_ADHAN_STYLE_ID);
  const [adhanMode, setAdhanModeState] = useState<AdhanMode>(DEFAULT_ADHAN_MODE);
  const [adhanPlaying, setAdhanPlaying] = useState(false);
  const [adhanIsSilent, setAdhanIsSilent] = useState(false);
  const [adhanPrayerName, setAdhanPrayerName] = useState<string | null>(null);
  const [adhanPrayerArabicName, setAdhanPrayerArabicName] = useState<string | null>(null);

  // Refs for latest values inside async/interval callbacks
  const calcMethodRef = useRef(calcMethod);
  const madhabRef = useRef(madhab);
  const highLatRuleRef = useRef(highLatRule);
  const polarResolutionRef = useRef(polarResolution);
  const ummAlQuraIshaPolicyRef = useRef(ummAlQuraIshaPolicy);
  const timeFormatRef = useRef(timeFormat);
  const notificationsRef = useRef(notificationsEnabled);
  const jummahReminderRef = useRef(jummahReminderEnabled);
  const jummahMinutesRef = useRef(jummahMinutesBefore);
  const ayahReminderRef = useRef(ayahReminderEnabled);
  const ayahHourRef = useRef(ayahReminderHour);
  const ayahMinuteRef = useRef(ayahReminderMinute);
  const hadithReminderRef = useRef(hadithReminderEnabled);
  const hadithHourRef = useRef(hadithReminderHour);
  const hadithMinuteRef = useRef(hadithReminderMinute);
  const islamicEventsRef = useRef(islamicEventsEnabled);
  // The adhan watcher (15s interval) reads enabled/style/mode together. Keeping
  // them in three independent refs let a tick observe a half-applied combo when
  // the user toggled a setting at the same instant the timer fired (e.g. new
  // styleId + old mode). Collapsing them into a single object ref lets us
  // update all three atomically with one assignment.
  const adhanConfigRef = useRef({
    enabled: adhanEnabled,
    styleId: adhanStyleId,
    mode: adhanMode,
  });
  const prayerTimesRef = useRef(prayerTimes);
  const prayerNotifConfigRef = useRef(prayerNotifConfig);
  const locationRef = useRef(location);
  const notifSnoozeUntilRef = useRef(notifSnoozeUntil);
  const locationRequestGenerationRef = useRef(0);
  const locationSourceRef = useRef<"gps" | "manual" | "default" | "unknown">("unknown");
  const lastPlayedRef = useRef<string>(""); // "prayerKey_YYYY-MM-DD"

  useEffect(() => { calcMethodRef.current = calcMethod; }, [calcMethod]);
  useEffect(() => { madhabRef.current = madhab; }, [madhab]);
  useEffect(() => { highLatRuleRef.current = highLatRule; }, [highLatRule]);
  useEffect(() => { polarResolutionRef.current = polarResolution; }, [polarResolution]);
  useEffect(() => { ummAlQuraIshaPolicyRef.current = ummAlQuraIshaPolicy; }, [ummAlQuraIshaPolicy]);
  useEffect(() => { timeFormatRef.current = timeFormat; }, [timeFormat]);
  useEffect(() => { notificationsRef.current = notificationsEnabled; }, [notificationsEnabled]);
  useEffect(() => { jummahReminderRef.current = jummahReminderEnabled; }, [jummahReminderEnabled]);
  useEffect(() => { jummahMinutesRef.current = jummahMinutesBefore; }, [jummahMinutesBefore]);
  useEffect(() => { ayahReminderRef.current = ayahReminderEnabled; }, [ayahReminderEnabled]);
  useEffect(() => { ayahHourRef.current = ayahReminderHour; }, [ayahReminderHour]);
  useEffect(() => { ayahMinuteRef.current = ayahReminderMinute; }, [ayahReminderMinute]);
  useEffect(() => { hadithReminderRef.current = hadithReminderEnabled; }, [hadithReminderEnabled]);
  useEffect(() => { hadithHourRef.current = hadithReminderHour; }, [hadithReminderHour]);
  useEffect(() => { hadithMinuteRef.current = hadithReminderMinute; }, [hadithReminderMinute]);
  useEffect(() => { islamicEventsRef.current = islamicEventsEnabled; }, [islamicEventsEnabled]);
  useEffect(() => { prayerOffsetsRef.current = prayerOffsets; }, [prayerOffsets]);
  // One effect, one assignment — the watcher always sees a consistent triple.
  useEffect(() => {
    adhanConfigRef.current = { enabled: adhanEnabled, styleId: adhanStyleId, mode: adhanMode };
  }, [adhanEnabled, adhanStyleId, adhanMode]);
  useEffect(() => { prayerTimesRef.current = prayerTimes; }, [prayerTimes]);
  useEffect(() => { prayerNotifConfigRef.current = prayerNotifConfig; }, [prayerNotifConfig]);
  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { notifSnoozeUntilRef.current = notifSnoozeUntil; }, [notifSnoozeUntil]);

  // Nuur is dark-only for the v1 release — the gold / mihrab brand language
  // is built for night. The `displayMode` state is still persisted so when we
  // re-expose Light / Auto in Settings later, the user's old preference is
  // remembered. To re-enable, revert to the commented branch below.
  // const effectiveDisplayMode: "dark" | "light" =
  //   displayMode === "auto"
  //     ? (systemColorScheme === "light" ? "light" : "dark")
  //     : displayMode;
  const effectiveDisplayMode: "dark" | "light" = "dark";

  const themeColors =
    effectiveDisplayMode === "dark"
      ? THEMES[themeName].colors
      : THEMES[themeName].lightColors;

  // ── Prayer time calculation ──
  useEffect(() => {
    if (location) {
      try {
        const raw = calculatePrayerTimes(
          location.latitude, location.longitude, location.timezone,
          new Date(), calcMethod, madhab, highLatRule, timeFormat, polarResolution, ummAlQuraIshaPolicy,
        );
        const adjusted = applyPrayerOffsets(raw, prayerOffsets, location.timezone, timeFormat);
        setPrayerTimes(adjusted);
      } catch (e) {
        console.warn("Prayer time calculation failed:", e);
      }
    }
  }, [location, calcMethod, madhab, highLatRule, timeFormat, polarResolution, ummAlQuraIshaPolicy, prayerOffsets]);

  // ── Push prayer-time snapshot to iOS widget ──
  // Now handled by <WidgetBridge /> mounted inside both AppProvider and
  // PrayerTrackerProvider so it can include streak/week% stats.

  // ── Adhan prayer-time watcher ──
  useEffect(() => {
    const check = () => {
      const times = prayerTimesRef.current;
      const activeLocation = locationRef.current;
      if (!times || !activeLocation || !notificationsRef.current) return;

      const now = new Date();
      const todayStr = dateKeyInTimeZone(now, activeLocation.timezone);
      const nowH = now.getHours();
      const nowM = now.getMinutes();
      const nowS = now.getSeconds();

      // Only fire in the first 45 seconds of the minute
      if (nowS > 45) return;

      for (const key of PRAYER_KEYS) {
        const prayer = times[key];
        const prayerCfg = prayerNotifConfigRef.current[key];
        if (!shouldPresentForegroundAdhan(prayerCfg, {
          notificationsEnabled: notificationsRef.current,
          prayerTimeMs: prayer.time.getTime(),
          snoozeUntil: notifSnoozeUntilRef.current,
          dayOfWeek: dayOfWeekInTimeZone(prayer.time, activeLocation.timezone),
        })) continue;
        const pH = prayer.time.getHours();
        const pM = prayer.time.getMinutes();

        if (pH === nowH && pM === nowM) {
          const token = `${key}_${todayStr}`;
          if (lastPlayedRef.current === token) break; // already played today
          lastPlayedRef.current = token;

          const style = getAdhanStyle(prayerCfg.adhanStyleId);
          const mode = prayerCfg.adhanMode;
          const isFajr = key === "fajr";
          const audioUrl = resolveAdhanUrl(style, mode, isFajr);

          setAdhanPrayerName(prayer.name);
          setAdhanPrayerArabicName(prayer.arabicName);
          setAdhanIsSilent(mode === "silent");
          setAdhanPlaying(true);

          const finish = () => {
            setAdhanPlaying(false);
            setAdhanIsSilent(false);
            setAdhanPrayerName(null);
            setAdhanPrayerArabicName(null);
          };

          if (audioUrl) {
            playAdhanAudio(audioUrl, finish);
          } else {
            // Silent mode: show overlay briefly then auto-dismiss
            setTimeout(finish, 5000);
          }
          break;
        }
      }
    };

    const interval = setInterval(check, 15_000);
    return () => clearInterval(interval);
  }, []);

  // ── Notification tap → adhan bridge ──
  // When the user taps a prayer notification to open the app (background or cold
  // start), the 15 s adhan watcher's window has usually already passed. This
  // listener fires the in-app adhan playback so the user still hears it.
  useEffect(() => {
    if (Platform.OS === "web") return;

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;

      // Only act on adhan-type prayer notifications
      if (data?.type !== "prayer" || data?.notifType !== "adhan") return;

      const mode = data.adhanMode as AdhanMode;
      const styleId = data.adhanStyleId as string;
      const key = data.key as string;

      if (mode === "silent") return;

      // Don't play adhan if the notification was delivered more than 10 minutes
      // ago — playing the call to prayer long after the time has passed is jarring.
      // Expo serializes this timestamp in seconds on iOS and milliseconds on
      // Android. Normalize by magnitude so the stale guard works on both.
      const deliveredAt = response.notification.date;
      const deliveredMs = deliveredAt < 10_000_000_000 ? deliveredAt * 1000 : deliveredAt;
      const deliveryAgeMs = Date.now() - deliveredMs;
      if (deliveryAgeMs < -60_000 || deliveryAgeMs > 10 * 60 * 1000) return;

      const style = getAdhanStyle(styleId);
      const isFajr = key === "fajr";
      const url = resolveAdhanUrl(style, mode, isFajr);

      // Derive prayer name from live prayer times if available, else from the key
      const times = prayerTimesRef.current;
      const prayerEntry = times?.[key as keyof PrayerTimesResult] as { name?: string; arabicName?: string } | undefined;
      const prayerName = prayerEntry?.name ?? (key.charAt(0).toUpperCase() + key.slice(1));
      const prayerArabicName = prayerEntry?.arabicName ?? "";

      setAdhanPrayerName(prayerName);
      setAdhanPrayerArabicName(prayerArabicName);
      setAdhanIsSilent(false);
      setAdhanPlaying(true);

      const finish = () => {
        setAdhanPlaying(false);
        setAdhanIsSilent(false);
        setAdhanPrayerName(null);
        setAdhanPrayerArabicName(null);
      };

      if (url) {
        playAdhanAudio(url, finish);
      } else {
        setTimeout(finish, 5000);
      }
    });

    return () => sub.remove();
  }, []);

  // ── Init ──
  useEffect(() => {
    let active = true;
    void (async () => {
      // Location-based auto recommendations must not race ahead of persisted
      // user choices. Hydrate preferences first, then resolve/refresh location.
      await Promise.all([loadPreferences(), loadBookmarks()]);
      if (active) await initLocation();
    })();
    return () => {
      active = false;
      // Invalidate pending GPS/geocoder responses during restore/reset or unmount.
      locationRequestGenerationRef.current += 1;
    };
  }, []);

  const loadPreferences = async () => {
    try {
      const [theme, mode, notifs, method, methodSource, madhabVal, madhabSource, latRule, polarResolutionRaw, fmt, adhanOn, adhanStyle, adhanModeVal, prayerNotifRaw, jummahRaw, jummahMinsRaw, ayahRaw, ayahHrRaw, ayahMinRaw, hadithRaw, hadithHrRaw, hadithMinRaw, islamicEventsRaw, locationRaw, prayerOffsetsRaw, snoozeRaw, preReminderRaw, ishaPolicyRaw] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.CALC_METHOD),
          AsyncStorage.getItem(STORAGE_KEYS.CALC_METHOD_SOURCE),
          AsyncStorage.getItem(STORAGE_KEYS.MADHAB),
          AsyncStorage.getItem(STORAGE_KEYS.MADHAB_SOURCE),
          AsyncStorage.getItem(STORAGE_KEYS.HIGH_LAT_RULE),
          AsyncStorage.getItem(STORAGE_KEYS.POLAR_RESOLUTION),
          AsyncStorage.getItem(STORAGE_KEYS.TIME_FORMAT),
          AsyncStorage.getItem(STORAGE_KEYS.ADHAN_ENABLED),
          AsyncStorage.getItem(STORAGE_KEYS.ADHAN_STYLE),
          AsyncStorage.getItem(STORAGE_KEYS.ADHAN_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG),
          AsyncStorage.getItem(STORAGE_KEYS.JUMMAH_REMINDER),
          AsyncStorage.getItem(STORAGE_KEYS.JUMMAH_MINUTES),
          AsyncStorage.getItem(STORAGE_KEYS.AYAH_REMINDER),
          AsyncStorage.getItem(STORAGE_KEYS.AYAH_HOUR),
          AsyncStorage.getItem(STORAGE_KEYS.AYAH_MINUTE),
          AsyncStorage.getItem(STORAGE_KEYS.HADITH_REMINDER),
          AsyncStorage.getItem(STORAGE_KEYS.HADITH_HOUR),
          AsyncStorage.getItem(STORAGE_KEYS.HADITH_MINUTE),
          AsyncStorage.getItem(STORAGE_KEYS.ISLAMIC_EVENTS_REMINDER),
          AsyncStorage.getItem(STORAGE_KEYS.LOCATION),
          AsyncStorage.getItem(STORAGE_KEYS.PRAYER_OFFSETS),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIF_SNOOZE_UNTIL),
          AsyncStorage.getItem(STORAGE_KEYS.PRAYER_PRE_REMINDER),
          AsyncStorage.getItem(STORAGE_KEYS.UMM_AL_QURA_ISHA_POLICY),
        ]);
      if (theme && theme in THEMES) setThemeNameState(theme as ThemeName);
      if (mode === "auto" || mode === "dark" || mode === "light") setDisplayModeState(mode);
      let canScheduleStoredNotifications = false;
      if (notifs === "true" && Platform.OS !== "web") {
        const permission = await getNotificationPermissionState();
        canScheduleStoredNotifications = permission === "granted";
        setNotifPermBlocked(permission === "blocked");
        setNotificationsEnabled(canScheduleStoredNotifications);
        notificationsRef.current = canScheduleStoredNotifications;
        // Reconcile a revoked OS permission with Nuur's master switch. Keep an
        // unsupported development client preference intact so a standalone
        // build can recover it, but don't pretend alerts are active now.
        if (permission === "denied" || permission === "blocked") {
          await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "false").catch(() => {});
        }
      }
      if (method) {
        setCalcMethodState(method as CalcMethodId);
        calcMethodRef.current = method as CalcMethodId;
        calcMethodSavedRef.current = methodSource !== "auto";
      }
      if (madhabVal === "Hanafi" || madhabVal === "Shafi") {
        setMadhabState(madhabVal);
        madhabRef.current = madhabVal;
        madhabSavedRef.current = madhabSource !== "auto";
      }
      const loadedHighLatRule = normalizeHighLatRule(latRule);
      const loadedPolarResolution = normalizePolarResolution(polarResolutionRaw);
      setHighLatRuleState(loadedHighLatRule);
      highLatRuleRef.current = loadedHighLatRule;
      setPolarResolutionState(loadedPolarResolution);
      polarResolutionRef.current = loadedPolarResolution;
      const loadedIshaPolicy = normalizeUmmAlQuraIshaPolicy(ishaPolicyRaw);
      setUmmAlQuraIshaPolicyState(loadedIshaPolicy);
      ummAlQuraIshaPolicyRef.current = loadedIshaPolicy;
      if (fmt === "12h" || fmt === "24h") setTimeFormatState(fmt);
      const loadedAdhanEnabled = adhanOn === "true";
      const loadedAdhanStyle = adhanStyle && ADHAN_STYLES.some((s) => s.id === adhanStyle)
        ? adhanStyle
        : DEFAULT_ADHAN_STYLE_ID;
      const loadedAdhanMode: AdhanMode = adhanModeVal === "full" || adhanModeVal === "short" || adhanModeVal === "silent"
        ? adhanModeVal
        : DEFAULT_ADHAN_MODE;
      setAdhanEnabled(loadedAdhanEnabled);
      setAdhanStyleIdState(loadedAdhanStyle);
      setAdhanModeState(loadedAdhanMode);
      adhanConfigRef.current = {
        enabled: loadedAdhanEnabled,
        styleId: loadedAdhanStyle,
        mode: loadedAdhanMode,
      };
      let startupNotifConfig = DEFAULT_PRAYER_NOTIF_CONFIG;
      try {
        startupNotifConfig = normalizePrayerNotifConfig(prayerNotifRaw ? JSON.parse(prayerNotifRaw) : null);
      } catch {
        startupNotifConfig = normalizePrayerNotifConfig(null);
      }
      startupNotifConfig = patchObligatoryPrayerNotifications(startupNotifConfig, {
        adhanStyleId: loadedAdhanStyle,
        adhanMode: loadedAdhanMode,
      });
      setPrayerNotifConfigState(startupNotifConfig);
      prayerNotifConfigRef.current = startupNotifConfig;
      AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(startupNotifConfig)).catch(() => {});
      // jummahRaw null = never saved → default true; "false" → disabled
      const loadedJummahEnabled = jummahRaw !== "false";
      setJummahReminderEnabledState(loadedJummahEnabled);
      jummahReminderRef.current = loadedJummahEnabled;
      if (jummahMinsRaw) {
        const mins = Number(jummahMinsRaw);
        if (mins === 15 || mins === 30 || mins === 60) {
          setJummahMinutesBeforeState(mins);
          jummahMinutesRef.current = mins;
        }
      }
      // null = never saved → default true; "false" → disabled
      const loadedAyahEnabled = ayahRaw !== "false";
      setAyahReminderEnabledState(loadedAyahEnabled);
      ayahReminderRef.current = loadedAyahEnabled;
      if (ayahHrRaw) { const h = Number(ayahHrRaw); if (h >= 0 && h <= 23) { setAyahReminderHourState(h); ayahHourRef.current = h; } }
      if (ayahMinRaw) { const m = Number(ayahMinRaw); if (m >= 0 && m <= 55) { setAyahReminderMinuteState(m); ayahMinuteRef.current = m; } }
      const loadedHadithEnabled = hadithRaw !== "false";
      setHadithReminderEnabledState(loadedHadithEnabled);
      hadithReminderRef.current = loadedHadithEnabled;
      if (hadithHrRaw) { const h = Number(hadithHrRaw); if (h >= 0 && h <= 23) { setHadithReminderHourState(h); hadithHourRef.current = h; } }
      if (hadithMinRaw) { const m = Number(hadithMinRaw); if (m >= 0 && m <= 55) { setHadithReminderMinuteState(m); hadithMinuteRef.current = m; } }
      const loadedEventsEnabled = islamicEventsRaw !== "false";
      setIslamicEventsEnabledState(loadedEventsEnabled);
      islamicEventsRef.current = loadedEventsEnabled;
      if (snoozeRaw) {
        const n = Number(snoozeRaw);
        if (Number.isFinite(n) && n > Date.now()) {
          notifSnoozeUntilRef.current = n;
          setNotifSnoozeUntilState(n);
        }
        else AsyncStorage.removeItem(STORAGE_KEYS.NOTIF_SNOOZE_UNTIL).catch(() => {});
      }
      if (preReminderRaw) {
        const n = Number(preReminderRaw);
        if (n === 0 || n === 5 || n === 10 || n === 15) setPrayerPreReminderMinutesState(n);
      }
      if (prayerOffsetsRaw) {
        try {
          const parsed = JSON.parse(prayerOffsetsRaw) as PrayerOffsets;
          const merged = { ...DEFAULT_PRAYER_OFFSETS, ...parsed };
          setPrayerOffsetsState(merged);
          prayerOffsetsRef.current = merged;
        } catch {}
      }

      // ── Startup reschedule ───────────────────────────────────────────────────
      // Reschedule immediately using the just-parsed local values rather than
      // refs, which aren't updated until after the next React render.  This
      // eliminates the race condition where fetchGpsLocation fires before refs
      // reflect the stored settings, causing Ayah/Hadith notifications to be
      // skipped. Using the cached location means this always works even when
      // GPS is unavailable (indoors, permission denied, etc.).
      if (canScheduleStoredNotifications && locationRaw) {
        try {
          const storedLoc = normalizeStoredLocation(JSON.parse(locationRaw));
          if (!storedLoc) throw new Error("Invalid stored location");
          const resolvedZone = timeZoneAtCoordinates(storedLoc.latitude, storedLoc.longitude);
          const loc = resolvedZone
            ? { ...storedLoc, timezone: resolvedZone }
            : storedLoc;
          const jEnabled = jummahRaw !== "false"; // null = never saved → default true
          const jMins    = (jummahMinsRaw && [15, 30, 60].includes(Number(jummahMinsRaw)))
                           ? Number(jummahMinsRaw) : 30;
          const ayEnabled = ayahRaw !== "false";   // null = never saved → default true
          const ayHr      = ayahHrRaw  ? Math.min(23, Math.max(0, Number(ayahHrRaw)))  : 8;
          const ayMin     = ayahMinRaw ? Math.min(55, Math.max(0, Number(ayahMinRaw))) : 0;
          const hdEnabled = hadithRaw !== "false";  // null = never saved → default true
          const hdHr      = hadithHrRaw  ? Math.min(23, Math.max(0, Number(hadithHrRaw)))  : 9;
          const hdMin     = hadithMinRaw ? Math.min(55, Math.max(0, Number(hadithMinRaw))) : 0;
          const evEnabled = islamicEventsRaw !== "false"; // null = never saved → default true
          await schedulePrayerNotifications(
            loc.latitude, loc.longitude, loc.timezone, loc.city,
            jEnabled, jMins,
            ayEnabled, ayHr, ayMin,
            hdEnabled, hdHr, hdMin,
            evEnabled,
            startupNotifConfig,
            prayerOffsetsRef.current,
            // Use local vars from storage — refs not yet synced at startup
            (method as CalcMethodId) || DEFAULT_CALC_METHOD,
            (madhabVal === "Hanafi" || madhabVal === "Shafi" ? madhabVal : DEFAULT_MADHAB) as MadhabId,
            normalizeHighLatRule(latRule),
            normalizePolarResolution(polarResolutionRaw),
            loadedIshaPolicy,
          );
        } catch (error) {
          console.warn("Startup notification schedule failed:", error);
        }
      }
    } catch {}
  };

  const rescheduleAll = useCallback(async (
    cfg: PrayerNotifConfig = prayerNotifConfigRef.current,
    overrides: NotificationScheduleOverrides = {},
    surfaceError = true,
  ): Promise<boolean> => {
    if (!notificationsRef.current || !location) return false;
    try {
      await schedulePrayerNotifications(
        location.latitude, location.longitude, location.timezone, location.city,
        overrides.jummahEnabled ?? jummahReminderRef.current,
        overrides.jummahMinutes ?? jummahMinutesRef.current,
        overrides.ayahEnabled ?? ayahReminderRef.current,
        overrides.ayahHour ?? ayahHourRef.current,
        overrides.ayahMinute ?? ayahMinuteRef.current,
        overrides.hadithEnabled ?? hadithReminderRef.current,
        overrides.hadithHour ?? hadithHourRef.current,
        overrides.hadithMinute ?? hadithMinuteRef.current,
        overrides.eventsEnabled ?? islamicEventsRef.current,
        cfg,
        overrides.offsets ?? prayerOffsetsRef.current,
        overrides.calcMethod ?? calcMethodRef.current,
        overrides.madhab ?? madhabRef.current,
        overrides.highLatRule ?? highLatRuleRef.current,
        overrides.polarResolution ?? polarResolutionRef.current,
        overrides.ummAlQuraIshaPolicy ?? ummAlQuraIshaPolicyRef.current,
      );
      return true;
    } catch (error) {
      console.warn("Prayer notification reschedule failed:", error);
      if (surfaceError) {
        Alert.alert(
          "Prayer alerts could not be updated",
          "Your setting was saved, but Nuur could not rebuild the device alert queue. Open Nuur again and use “Check prayer alerts” in Settings.",
        );
      }
      return false;
    }
  }, [location]);

  const setThemeName = useCallback(async (name: ThemeName) => {
    setThemeNameState(name);
    try { await AsyncStorage.setItem(STORAGE_KEYS.THEME, name); } catch {}
  }, []);

  const setDisplayMode = useCallback(async (mode: DisplayMode) => {
    setDisplayModeState(mode);
    try { await AsyncStorage.setItem(STORAGE_KEYS.DISPLAY_MODE, mode); } catch {}
  }, []);

  const setCalcMethod = useCallback(async (method: CalcMethodId) => {
    setCalcMethodState(method);
    calcMethodRef.current = method;
    calcMethodSavedRef.current = true;
    setCalcMethodAutoSetLabel(null);
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.CALC_METHOD, method],
        [STORAGE_KEYS.CALC_METHOD_SOURCE, "user"],
      ]);
    } catch {}
    await rescheduleAll(prayerNotifConfigRef.current, { calcMethod: method });
  }, [rescheduleAll]);

  const dismissCalcMethodNotice = useCallback(() => {
    setCalcMethodAutoSetLabel(null);
  }, []);

  const setMadhab = useCallback(async (m: MadhabId) => {
    setMadhabState(m);
    madhabRef.current = m;
    madhabSavedRef.current = true;
    setMadhabAutoSetLabel(null);
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.MADHAB, m],
        [STORAGE_KEYS.MADHAB_SOURCE, "user"],
      ]);
    } catch {}
    await rescheduleAll(prayerNotifConfigRef.current, { madhab: m });
  }, [rescheduleAll]);

  const dismissMadhabNotice = useCallback(() => {
    setMadhabAutoSetLabel(null);
  }, []);

  const setHighLatRule = useCallback(async (rule: HighLatRuleId) => {
    setHighLatRuleState(rule);
    highLatRuleRef.current = rule;
    try { await AsyncStorage.setItem(STORAGE_KEYS.HIGH_LAT_RULE, rule); } catch {}
    await rescheduleAll(prayerNotifConfigRef.current, { highLatRule: rule });
  }, [rescheduleAll]);

  const setPolarResolution = useCallback(async (resolution: PolarResolutionId) => {
    setPolarResolutionState(resolution);
    polarResolutionRef.current = resolution;
    try { await AsyncStorage.setItem(STORAGE_KEYS.POLAR_RESOLUTION, resolution); } catch {}
    await rescheduleAll(prayerNotifConfigRef.current, { polarResolution: resolution });
  }, [rescheduleAll]);

  const setTimeFormat = useCallback(async (fmt: TimeFormat) => {
    setTimeFormatState(fmt);
    try { await AsyncStorage.setItem(STORAGE_KEYS.TIME_FORMAT, fmt); } catch {}
  }, []);

  const setUmmAlQuraIshaPolicy = useCallback(async (value: UmmAlQuraIshaPolicy) => {
    const policy = normalizeUmmAlQuraIshaPolicy(value);
    // Persist before applying so a failed write never changes today's display
    // while leaving tomorrow's background calculation on the previous policy.
    await AsyncStorage.setItem(STORAGE_KEYS.UMM_AL_QURA_ISHA_POLICY, policy);
    ummAlQuraIshaPolicyRef.current = policy;
    setUmmAlQuraIshaPolicyState(policy);
    await rescheduleAll(prayerNotifConfigRef.current, { ummAlQuraIshaPolicy: policy });
  }, [rescheduleAll]);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (stored) setBookmarkedSurahs(JSON.parse(stored));
    } catch {}
  };

  const toggleBookmark = useCallback(async (surahNumber: number) => {
    setBookmarkedSurahs((prev) => {
      const next = prev.includes(surahNumber)
        ? prev.filter((n) => n !== surahNumber)
        : [...prev, surahNumber];
      AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleNotifications = useCallback(async (): Promise<{ blocked: boolean }> => {
    const next = !notificationsRef.current;
    if (next) {
      const result = await requestNotificationPermissionDetailed();
      // Track the blocked state so screens (e.g. onboarding) can swap their
      // CTA to an inline "Open Settings" recovery card instead of leaving a
      // dead "Enable" button.
      const blocked = result === "blocked";
      setNotifPermBlocked(blocked);
      if (result !== "granted") {
        // Don't silently no-op — tell the user *why* nothing happened so the
        // switch isn't a dead control. Three distinct cases get three messages.
        if (result === "blocked") {
          Alert.alert(
            "Notifications are blocked",
            "Prayer alerts need notification permission. Please enable Notifications for Nuur in your device Settings.",
            [
              { text: "Not now", style: "cancel" },
              { text: "Open Settings", onPress: () => { Linking.openSettings().catch(() => {}); } },
            ],
          );
        } else if (result === "unsupported") {
          // Most common cause: running in Expo Go on Android (SDK 53+ removed
          // push). Local scheduled notifications are still useful, so we
          // explain the limitation rather than blocking the toggle entirely.
          Alert.alert(
            "Notifications limited here",
            "Push notifications aren't fully supported in Expo Go. To receive prayer alerts reliably, install Nuur as a build from the App Store or a development build.",
            [{ text: "OK" }],
          );
        } else {
          Alert.alert(
            "Permission needed",
            "Allow notifications so Nuur can alert you at each prayer time.",
            [{ text: "OK" }],
          );
        }
        return { blocked };
      }
      notificationsRef.current = true;
      setNotificationsEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "true");
      await rescheduleAll();
      return { blocked: false };
    } else {
      notificationsRef.current = false;
      setNotificationsEnabled(false);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "false");
      try {
        await cancelAllPrayerNotifications();
      } catch (error) {
        console.warn("Prayer notification cancellation failed:", error);
        Alert.alert(
          "Some prayer alerts could not be removed",
          "Nuur turned alerts off, but the device queue could not be fully cleared. Use “Check prayer alerts” in Settings and try again.",
        );
      }
      return { blocked: false };
    }
  }, [rescheduleAll]);

  // ── Adhan callbacks ──
  // The "Play Adhan" switch in Settings and the "Adhan" sound mode in the
  // quick-sheet are presented to users as one unified setting. We keep them in
  // sync by writing to BOTH stores from BOTH entry points:
  //   • adhanEnabled boolean → records the global bulk-control state
  //   • per-prayer cfg.type → drives the OS notification sound (.caf)
  // Toggling here also bulk-updates the 5 obligatory prayers' notification
  // type, and setAllPrayersNotifType (below) mirrors back into adhanEnabled.
  const toggleAdhan = useCallback(async () => {
    const next = !adhanConfigRef.current.enabled;
    // Enabling Adhan requires a working native alert queue. Ask before changing
    // either persisted setting so a denial cannot leave the master switch and
    // per-prayer sound modes in contradictory states.
    if (next && !notificationsRef.current) {
      const permission = await requestNotificationPermissionDetailed();
      setNotifPermBlocked(permission === "blocked");
      if (permission !== "granted") {
        Alert.alert(
          permission === "blocked" ? "Notifications are blocked" : "Permission needed",
          permission === "blocked"
            ? "Enable Notifications for Nuur in device Settings, then try again."
            : "Allow notifications so Nuur can alert you at prayer time.",
        );
        return;
      }
      notificationsRef.current = true;
      setNotificationsEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "true");
    }

    const nextConfig = patchObligatoryPrayerNotifications(
      prayerNotifConfigRef.current,
      {
        type: next ? "adhan" : "notification",
        ...(next ? { enabled: true } : {}),
        adhanStyleId: adhanConfigRef.current.styleId,
        adhanMode: adhanConfigRef.current.mode,
      },
    );
    prayerNotifConfigRef.current = nextConfig;
    setPrayerNotifConfigState(nextConfig);
    try { await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(nextConfig)); } catch {}

    adhanConfigRef.current = { ...adhanConfigRef.current, enabled: next };
    setAdhanEnabled(next);
    try { await AsyncStorage.setItem(STORAGE_KEYS.ADHAN_ENABLED, next ? "true" : "false"); } catch {}
    if (!next) {
      await stopAdhanAudio();
      setAdhanPlaying(false);
      setAdhanPrayerName(null);
      setAdhanPrayerArabicName(null);
    }
    if (notificationsRef.current) await rescheduleAll(nextConfig);
  }, [rescheduleAll]);

  const setAdhanStyleId = useCallback(async (id: string) => {
    adhanConfigRef.current = { ...adhanConfigRef.current, styleId: id };
    setAdhanStyleIdState(id);
    try { await AsyncStorage.setItem(STORAGE_KEYS.ADHAN_STYLE, id); } catch {}
    const nextConfig = patchObligatoryPrayerNotifications(prayerNotifConfigRef.current, { adhanStyleId: id });
    prayerNotifConfigRef.current = nextConfig;
    setPrayerNotifConfigState(nextConfig);
    try { await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(nextConfig)); } catch {}
    await rescheduleAll(nextConfig);
  }, [rescheduleAll]);

  const setAdhanMode = useCallback(async (m: AdhanMode) => {
    adhanConfigRef.current = { ...adhanConfigRef.current, mode: m };
    setAdhanModeState(m);
    try { await AsyncStorage.setItem(STORAGE_KEYS.ADHAN_MODE, m); } catch {}
    const nextConfig = patchObligatoryPrayerNotifications(prayerNotifConfigRef.current, { adhanMode: m });
    prayerNotifConfigRef.current = nextConfig;
    setPrayerNotifConfigState(nextConfig);
    try { await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(nextConfig)); } catch {}
    await rescheduleAll(nextConfig);
  }, [rescheduleAll]);

  const setPrayerNotifSettings = useCallback(async (key: PrayerKey, settings: PrayerNotifSettings) => {
    const nextConfig = { ...prayerNotifConfigRef.current, [key]: settings };
    prayerNotifConfigRef.current = nextConfig;
    setPrayerNotifConfigState(nextConfig);
    try { await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(nextConfig)); } catch {}
    await rescheduleAll(nextConfig);
  }, [rescheduleAll]);

  // Master bell: toggles all 5 prayer notifications (excludes Sunrise).
  // If all 5 are on → turns all off.
  // If any are off (mixed or all off) → turns all on, enabling global
  // notifications first if they were off.
  const toggleMasterPrayerBell = useCallback(async () => {
    if (Platform.OS === "web") return;
    const cfg = prayerNotifConfigRef.current;
    const allOn = OBLIGATORY_PRAYER_KEYS.every((k) => cfg[k].enabled);
    const nextEnabled = !allOn; // all-on → turn off; anything else → turn all on

    // If enabling and global notifications aren't on yet, request permission
    if (nextEnabled && !notificationsRef.current) {
      const permission = await requestNotificationPermissionDetailed();
      setNotifPermBlocked(permission === "blocked");
      if (permission !== "granted") {
        Alert.alert(
          permission === "blocked" ? "Notifications are blocked" : "Permission needed",
          permission === "blocked"
            ? "Enable Notifications for Nuur in device Settings, then try again."
            : "Allow notifications so Nuur can alert you at prayer time.",
        );
        return;
      }
      notificationsRef.current = true;
      setNotificationsEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "true");
    }

    // Update the five prayer enabled flags and the ref atomically so the
    // replacement schedule always sees the just-saved value.
    const nextConfig = patchObligatoryPrayerNotifications(cfg, { enabled: nextEnabled });
    prayerNotifConfigRef.current = nextConfig;
    setPrayerNotifConfigState(nextConfig);
    try { await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(nextConfig)); } catch {}

    await rescheduleAll(nextConfig);
  }, [rescheduleAll]);

  // ── Foreground reschedule (rolling notification window) ──────────────────
  // The scheduler queues a platform-sized rolling window (10 days on iOS,
  // which hard-caps pending local notifications at 64, and 30 on Android).
  // Foreground refreshes keep that window topped up.
  //
  // To keep the queue topped up: every time the app comes to the foreground,
  // if the last successful schedule run is older than the threshold below,
  // we transparently reschedule using the current settings. The user sees
  // nothing — it's just a silent refresh that makes the rolling window real.
  //
  // Threshold rationale: 6 hours is short enough that a daily user always has
  // a fresh queue, but long enough that opening the app many times in a row
  // (e.g. flipping between tabs while idle) doesn't thrash the OS scheduler.
  const FOREGROUND_RESCHEDULE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
  useEffect(() => {
    if (Platform.OS === "web") return;
    let inFlight = false;
    const maybeReschedule = async () => {
      if (inFlight) return;
      if (!notificationsRef.current || !location) return;
      const permission = await getNotificationPermissionState();
      if (permission !== "granted") {
        notificationsRef.current = false;
        setNotificationsEnabled(false);
        setNotifPermBlocked(permission === "blocked");
        if (permission === "blocked" || permission === "denied") {
          await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "false").catch(() => {});
        }
        await cancelAllPrayerNotifications().catch(() => {});
        return;
      }
      const ageMs = await getMillisSinceLastSchedule();
      if (ageMs < FOREGROUND_RESCHEDULE_MAX_AGE_MS) return;
      inFlight = true;
      try {
        await rescheduleAll(prayerNotifConfigRef.current, {}, false);
      } finally {
        inFlight = false;
      }
    };
    // Run once on mount in case startup reschedule was skipped (e.g. notifs
    // were toggled on later) and the queue is now stale from a previous session.
    maybeReschedule();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void maybeReschedule();
    });
    return () => sub.remove();
  }, [location, notificationsEnabled, rescheduleAll]);

  const setNotifSnoozeUntil = useCallback(async (timestamp: number) => {
    notifSnoozeUntilRef.current = timestamp;
    setNotifSnoozeUntilState(timestamp);
    try {
      if (timestamp > Date.now()) {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIF_SNOOZE_UNTIL, String(timestamp));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.NOTIF_SNOOZE_UNTIL);
      }
    } catch {}
    // Reschedule reads the new value from storage.
    await rescheduleAll();
  }, [rescheduleAll]);

  const setPrayerPreReminderMinutes = useCallback(async (minutes: 0 | 5 | 10 | 15) => {
    setPrayerPreReminderMinutesState(minutes);
    try { await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_PRE_REMINDER, String(minutes)); } catch {}
    await rescheduleAll();
  }, [rescheduleAll]);

  // Bulk-set the notification type for all 5 obligatory prayers (Sunrise unaffected).
  // Used by the quick-sheet's Sound mode selector.
  const setAllPrayersNotifType = useCallback(async (type: "silent" | "notification" | "adhan") => {
    if (Platform.OS === "web") return;
    // If switching ON something and notifications are disabled, request permission first
    if (!notificationsRef.current) {
      const permission = await requestNotificationPermissionDetailed();
      setNotifPermBlocked(permission === "blocked");
      if (permission !== "granted") {
        Alert.alert(
          permission === "blocked" ? "Notifications are blocked" : "Permission needed",
          permission === "blocked"
            ? "Enable Notifications for Nuur in device Settings, then try again."
            : "Allow notifications so Nuur can alert you at prayer time.",
        );
        return;
      }
      notificationsRef.current = true;
      setNotificationsEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "true");
    }

    const nextConfig = patchObligatoryPrayerNotifications(
      prayerNotifConfigRef.current,
      {
        type,
        enabled: true,
        adhanStyleId: adhanConfigRef.current.styleId,
        adhanMode: adhanConfigRef.current.mode,
      },
    );
    prayerNotifConfigRef.current = nextConfig;
    setPrayerNotifConfigState(nextConfig);
    try { await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(nextConfig)); } catch {}

    // Mirror into the adhanEnabled boolean so Settings → "Play Adhan" agrees
    // with the quick-sheet sound mode. ON only when user explicitly chose
    // "adhan"; choosing silent/notification turns the in-app audio off too.
    const adhanNext = type === "adhan";
    if (adhanConfigRef.current.enabled !== adhanNext) {
      adhanConfigRef.current = { ...adhanConfigRef.current, enabled: adhanNext };
      setAdhanEnabled(adhanNext);
      try { await AsyncStorage.setItem(STORAGE_KEYS.ADHAN_ENABLED, adhanNext ? "true" : "false"); } catch {}
      if (!adhanNext) {
        await stopAdhanAudio();
        setAdhanPlaying(false);
        setAdhanPrayerName(null);
        setAdhanPrayerArabicName(null);
      }
    }

    await rescheduleAll(nextConfig);
  }, [rescheduleAll]);

  const setJummahReminder = useCallback(async (enabled: boolean, minutes: number) => {
    setJummahReminderEnabledState(enabled);
    setJummahMinutesBeforeState(minutes);
    jummahReminderRef.current = enabled;
    jummahMinutesRef.current = minutes;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.JUMMAH_REMINDER, enabled ? "true" : "false");
      await AsyncStorage.setItem(STORAGE_KEYS.JUMMAH_MINUTES, String(minutes));
    } catch {}
    await rescheduleAll(prayerNotifConfigRef.current, { jummahEnabled: enabled, jummahMinutes: minutes });
  }, [rescheduleAll]);

  const setAyahReminder = useCallback(async (enabled: boolean, hour: number, minute: number) => {
    setAyahReminderEnabledState(enabled);
    setAyahReminderHourState(hour);
    setAyahReminderMinuteState(minute);
    ayahReminderRef.current = enabled;
    ayahHourRef.current = hour;
    ayahMinuteRef.current = minute;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AYAH_REMINDER, enabled ? "true" : "false");
      await AsyncStorage.setItem(STORAGE_KEYS.AYAH_HOUR, String(hour));
      await AsyncStorage.setItem(STORAGE_KEYS.AYAH_MINUTE, String(minute));
    } catch {}
    await rescheduleAll(prayerNotifConfigRef.current, {
      ayahEnabled: enabled, ayahHour: hour, ayahMinute: minute,
    });
  }, [rescheduleAll]);

  const setHadithReminder = useCallback(async (enabled: boolean, hour: number, minute: number) => {
    setHadithReminderEnabledState(enabled);
    setHadithReminderHourState(hour);
    setHadithReminderMinuteState(minute);
    hadithReminderRef.current = enabled;
    hadithHourRef.current = hour;
    hadithMinuteRef.current = minute;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HADITH_REMINDER, enabled ? "true" : "false");
      await AsyncStorage.setItem(STORAGE_KEYS.HADITH_HOUR, String(hour));
      await AsyncStorage.setItem(STORAGE_KEYS.HADITH_MINUTE, String(minute));
    } catch {}
    await rescheduleAll(prayerNotifConfigRef.current, {
      hadithEnabled: enabled, hadithHour: hour, hadithMinute: minute,
    });
  }, [rescheduleAll]);

  const setIslamicEventsReminder = useCallback(async (enabled: boolean) => {
    setIslamicEventsEnabledState(enabled);
    islamicEventsRef.current = enabled;
    try { await AsyncStorage.setItem(STORAGE_KEYS.ISLAMIC_EVENTS_REMINDER, enabled ? "true" : "false"); } catch {}
    await rescheduleAll(prayerNotifConfigRef.current, { eventsEnabled: enabled });
  }, [rescheduleAll]);

  const stopAdhan = useCallback(async () => {
    await stopAdhanAudio();
    setAdhanPlaying(false);
    setAdhanIsSilent(false);
    setAdhanPrayerName(null);
    setAdhanPrayerArabicName(null);
  }, []);

  // ── Location ──
  const updateLocation = useCallback((loc: LocationData) => {
    locationRef.current = loc;
    setLocation(loc);
  }, []);

  const applyCountryPrayerDefaults = useCallback(async (countryCode?: string | null) => {
    if (!countryCode) return;
    const requestGeneration = locationRequestGenerationRef.current;
    const normalized = countryCode.toUpperCase();
    if (!calcMethodSavedRef.current) {
      const suggested = suggestCalcMethod(normalized);
      if (suggested) {
        if (suggested !== calcMethodRef.current) {
          setCalcMethodState(suggested);
          setCalcMethodAutoSetLabel(getCalcMethodLabel(suggested));
        }
        calcMethodRef.current = suggested;
        try {
          await AsyncStorage.multiSet([
            [STORAGE_KEYS.CALC_METHOD, suggested],
            [STORAGE_KEYS.CALC_METHOD_SOURCE, "auto"],
          ]);
        } catch {}
      }
    }
    if (requestGeneration !== locationRequestGenerationRef.current) return;
    if (!madhabSavedRef.current) {
      const suggested = suggestMadhab(normalized);
      if (suggested) {
        if (suggested !== madhabRef.current) {
          setMadhabState(suggested);
          setMadhabAutoSetLabel(getMadhabLabel(suggested));
        }
        madhabRef.current = suggested;
        try {
          await AsyncStorage.multiSet([
            [STORAGE_KEYS.MADHAB, suggested],
            [STORAGE_KEYS.MADHAB_SOURCE, "auto"],
          ]);
        } catch {}
      }
    }
  }, []);

  const scheduleForLocation = useCallback(async (loc: LocationData): Promise<boolean> => {
    if (Platform.OS === "web" || !notificationsRef.current) return false;
    try {
      await schedulePrayerNotifications(
        loc.latitude, loc.longitude, loc.timezone, loc.city,
        jummahReminderRef.current, jummahMinutesRef.current,
        ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
        hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
        islamicEventsRef.current,
        prayerNotifConfigRef.current,
        prayerOffsetsRef.current,
        calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
        polarResolutionRef.current,
        ummAlQuraIshaPolicyRef.current,
      );
      return true;
    } catch (error) {
      console.warn("Location notification reschedule failed:", error);
      Alert.alert(
        "Prayer alerts could not be updated",
        "Your location was saved, but Nuur could not rebuild the device alert queue. Use “Check prayer alerts” in Settings.",
      );
      return false;
    }
  }, []);

  const fetchGpsLocation = useCallback(async (showLoading: boolean): Promise<{ permanentlyDenied: boolean }> => {
    const requestGeneration = ++locationRequestGenerationRef.current;
    const isCurrentRequest = () => locationRequestGenerationRef.current === requestGeneration;
    if (showLoading) {
      setIsLoadingLocation(true);
      setLocationError(null);
    }
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (!isCurrentRequest()) return { permanentlyDenied: false };
      if (status !== "granted") {
        // canAskAgain is false when the user has permanently denied (iOS: after
        // first denial; Android: after "Don't ask again"). In that case we
        // surface a deep-link to Settings so they can unblock it manually.
        const permanentlyDenied = !canAskAgain;
        setIsLocationPermDenied(permanentlyDenied);
        if (showLoading) {
          setLocationError(
            permanentlyDenied
              ? "Location access is blocked. Open Settings to allow Nuur to use your location."
              : "Location permission denied. Using Makkah as default.",
          );
          await applyCountryPrayerDefaults(DEFAULT_LOCATION.countryCode);
          if (!isCurrentRequest()) return { permanentlyDenied };
          locationSourceRef.current = "default";
          setUsingDefaultLocation(true);
          updateLocation(DEFAULT_LOCATION);
          await AsyncStorage.multiSet([
            [STORAGE_KEYS.LOCATION, JSON.stringify(DEFAULT_LOCATION)],
            [STORAGE_KEYS.LOCATION_SOURCE, "default"],
          ]).catch(() => {});
          if (!isCurrentRequest()) return { permanentlyDenied };
          await scheduleForLocation(DEFAULT_LOCATION);
        }
        return { permanentlyDenied };
      }
      setIsLocationPermDenied(false);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      let cityName: string | null = null;
      let detectedCountryCode: string | null = null;
      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
        cityName = extractCity(geocode);
        detectedCountryCode = geocode?.isoCountryCode ?? null;
      } catch {}
      if (!cityName || !detectedCountryCode) {
        const nominatim = await nominatimLocation(latitude, longitude);
        cityName = cityName ?? nominatim?.city ?? null;
        detectedCountryCode = detectedCountryCode ?? nominatim?.countryCode ?? null;
      }
      if (!isCurrentRequest()) return { permanentlyDenied: false };
      detectedCountryCode = detectedCountryCode?.toUpperCase() ?? null;
      await applyCountryPrayerDefaults(detectedCountryCode);
      if (!isCurrentRequest()) return { permanentlyDenied: false };
      // Resolve on-device so precise GPS coordinates are never disclosed to
      // a third-party timezone service.
      const tz = timeZoneAtCoordinates(latitude, longitude)
        ?? getDeviceTimeZone()
        ?? -new Date().getTimezoneOffset() / 60;
      const locationData: LocationData = {
        latitude, longitude,
        city: cityName ?? "Your Location",
        timezone: tz,
        ...(detectedCountryCode ? { countryCode: detectedCountryCode } : {}),
      };
      locationSourceRef.current = "gps";
      setUsingDefaultLocation(false);
      updateLocation(locationData);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LOCATION, JSON.stringify(locationData)],
        [STORAGE_KEYS.LOCATION_SOURCE, "gps"],
      ]);
      if (!isCurrentRequest()) return { permanentlyDenied: false };
      await scheduleForLocation(locationData);
      return { permanentlyDenied: false };
    } catch {
      if (showLoading && isCurrentRequest()) {
        setLocationError("Could not determine location. Using Makkah as default.");
        await applyCountryPrayerDefaults(DEFAULT_LOCATION.countryCode);
        if (!isCurrentRequest()) return { permanentlyDenied: false };
        locationSourceRef.current = "default";
        setUsingDefaultLocation(true);
        updateLocation(DEFAULT_LOCATION);
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.LOCATION, JSON.stringify(DEFAULT_LOCATION)],
          [STORAGE_KEYS.LOCATION_SOURCE, "default"],
        ]).catch(() => {});
        if (!isCurrentRequest()) return { permanentlyDenied: false };
        await scheduleForLocation(DEFAULT_LOCATION);
      }
      // A thrown error is not a permission denial — it's a network/GPS
      // glitch. Don't surface the blocked-recovery card for those.
      return { permanentlyDenied: false };
    } finally {
      if (showLoading && isCurrentRequest()) setIsLoadingLocation(false);
    }
  }, [applyCountryPrayerDefaults, scheduleForLocation, updateLocation]);

  const requestLocation = useCallback(async (): Promise<{ permanentlyDenied: boolean }> => {
    return fetchGpsLocation(true);
  }, [fetchGpsLocation]);

  const setManualLocation = useCallback(async (loc: LocationData) => {
    // Invalidate a startup/explicit GPS lookup before any async country-default
    // work. A late geocoder result must never overwrite a city the user chose.
    const requestGeneration = ++locationRequestGenerationRef.current;
    locationSourceRef.current = "manual";
    setIsLoadingLocation(false);
    const normalizedLoc = {
      ...loc,
      ...(loc.countryCode ? { countryCode: loc.countryCode.toUpperCase() } : {}),
    };
    await applyCountryPrayerDefaults(normalizedLoc.countryCode);
    if (locationRequestGenerationRef.current !== requestGeneration) return;
    setUsingDefaultLocation(false);
    setLocationError(null);
    updateLocation(normalizedLoc);
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LOCATION, JSON.stringify(normalizedLoc)],
        [STORAGE_KEYS.LOCATION_SOURCE, "manual"],
      ]);
    } catch {}
    if (locationRequestGenerationRef.current !== requestGeneration) return;
    await scheduleForLocation(normalizedLoc);
  }, [applyCountryPrayerDefaults, scheduleForLocation, updateLocation]);

  const initLocation = async () => {
    const requestGeneration = ++locationRequestGenerationRef.current;
    setIsLoadingLocation(true);
    setLocationError(null);
    locationSourceRef.current = "default";
    updateLocation(DEFAULT_LOCATION);
    setUsingDefaultLocation(true);
    let shouldRefreshGps = false;
    try {
      const [stored, locationSource] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LOCATION),
        AsyncStorage.getItem(STORAGE_KEYS.LOCATION_SOURCE),
      ]);
      if (locationRequestGenerationRef.current !== requestGeneration) return;
      if (stored) {
        const cachedLocation = normalizeStoredLocation(JSON.parse(stored));
        if (cachedLocation) {
          const resolvedZone = timeZoneAtCoordinates(
            cachedLocation.latitude,
            cachedLocation.longitude,
          );
          const upgradedLocation = resolvedZone && cachedLocation.timezone !== resolvedZone
            ? { ...cachedLocation, timezone: resolvedZone }
            : cachedLocation;
          updateLocation(upgradedLocation);
          const isDefault = locationSource === "default";
          setUsingDefaultLocation(isDefault);
          const knownSource: "gps" | "manual" | "default" | "unknown" =
            locationSource === "gps" ? "gps" :
            locationSource === "manual" ? "manual" :
            isDefault ? "default" : "unknown";
          locationSourceRef.current = knownSource;
          shouldRefreshGps = knownSource === "gps";
          if (upgradedLocation !== cachedLocation) {
            await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(upgradedLocation));
          }
          if (!locationSource) {
            await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_SOURCE, "unknown").catch(() => {});
          }
        }
      }
    } catch {}
    if (locationRequestGenerationRef.current !== requestGeneration) return;
    setIsLoadingLocation(false);
    // Only auto-refresh a location explicitly recorded as GPS. A legacy record
    // with unknown provenance may have been manually selected, so preserve it
    // until the user taps Locate Me; also do not mistake the Makkah fallback
    // for granted permission.
    if (shouldRefreshGps) void fetchGpsLocation(false);
  };

  const refreshPrayerTimes = useCallback(() => {
    if (location) {
      try {
        const raw = calculatePrayerTimes(
          location.latitude, location.longitude, location.timezone,
          new Date(),
          calcMethodRef.current,
          madhabRef.current,
          highLatRuleRef.current,
          timeFormatRef.current,
          polarResolutionRef.current,
          ummAlQuraIshaPolicyRef.current,
        );
        const adjusted = applyPrayerOffsets(raw, prayerOffsetsRef.current, location.timezone, timeFormatRef.current);
        setPrayerTimes(adjusted);
      } catch (e) {
        console.warn("Prayer time refresh failed:", e);
      }
    }
  }, [location]);

  const setPrayerOffsets = useCallback(async (offsets: PrayerOffsets) => {
    setPrayerOffsetsState(offsets);
    prayerOffsetsRef.current = offsets;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_OFFSETS, JSON.stringify(offsets));
    } catch {}
    await rescheduleAll(prayerNotifConfigRef.current, { offsets });
  }, [rescheduleAll]);

  return (
    <AppContext.Provider
      value={{
        location,
        prayerTimes,
        locationError,
        isLoadingLocation,
        usingDefaultLocation,
        isLocationPermDenied,
        refreshPrayerTimes,
        requestLocation,
        setManualLocation,
        bookmarkedSurahs,
        toggleBookmark,
        themeName,
        setThemeName,
        displayMode,
        setDisplayMode,
        effectiveDisplayMode,
        themeColors,
        notificationsEnabled,
        notifPermBlocked,
        toggleNotifications,
        calcMethod,
        setCalcMethod,
        calcMethodAutoSetLabel,
        dismissCalcMethodNotice,
        madhab,
        setMadhab,
        madhabAutoSetLabel,
        dismissMadhabNotice,
        highLatRule,
        setHighLatRule,
        polarResolution,
        setPolarResolution,
        ummAlQuraIshaPolicy,
        setUmmAlQuraIshaPolicy,
        timeFormat,
        setTimeFormat,
        adhanEnabled,
        adhanStyleId,
        adhanMode,
        setAdhanStyleId,
        setAdhanMode,
        toggleAdhan,
        adhanPlaying,
        adhanIsSilent,
        adhanPrayerName,
        adhanPrayerArabicName,
        adhanCurrentStyle: getAdhanStyle(adhanStyleId),
        stopAdhan,
        prayerNotifConfig,
        setPrayerNotifSettings,
        toggleMasterPrayerBell,
        notifSnoozeUntil,
        setNotifSnoozeUntil,
        prayerPreReminderMinutes,
        setPrayerPreReminderMinutes,
        setAllPrayersNotifType,
        jummahReminderEnabled,
        jummahMinutesBefore,
        setJummahReminder,
        ayahReminderEnabled,
        ayahReminderHour,
        ayahReminderMinute,
        setAyahReminder,
        hadithReminderEnabled,
        hadithReminderHour,
        hadithReminderMinute,
        setHadithReminder,
        islamicEventsEnabled,
        setIslamicEventsReminder,
        prayerOffsets,
        setPrayerOffsets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
