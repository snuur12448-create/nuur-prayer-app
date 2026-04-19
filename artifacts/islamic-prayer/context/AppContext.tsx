import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, Linking, Platform, useColorScheme } from "react-native";
import {
  calculatePrayerTimes,
  applyPrayerOffsets,
  PrayerTimesResult,
  PrayerOffsets,
  DEFAULT_PRAYER_OFFSETS,
  CalcMethodId,
  MadhabId,
  HighLatRuleId,
  TimeFormat,
  DEFAULT_CALC_METHOD,
  DEFAULT_MADHAB,
  DEFAULT_HIGH_LAT_RULE,
  DEFAULT_TIME_FORMAT,
} from "@/utils/prayerTimes";
import { suggestCalcMethod, getCalcMethodLabel } from "@/utils/calcMethodByCountry";
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
  requestNotificationPermission,
  requestNotificationPermissionDetailed,
  schedulePrayerNotifications,
} from "@/utils/notifications";
import {
  DEFAULT_PRAYER_NOTIF_CONFIG,
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

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  timezone: number;
}

interface AppContextType {
  location: LocationData | null;
  prayerTimes: PrayerTimesResult | null;
  locationError: string | null;
  isLoadingLocation: boolean;
  usingDefaultLocation: boolean;
  isLocationPermDenied: boolean;
  refreshPrayerTimes: () => void;
  requestLocation: () => Promise<void>;
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
  toggleNotifications: () => Promise<void>;
  calcMethod: CalcMethodId;
  setCalcMethod: (method: CalcMethodId) => void;
  calcMethodAutoSetLabel: string | null;
  dismissCalcMethodNotice: () => void;
  madhab: MadhabId;
  setMadhab: (madhab: MadhabId) => void;
  highLatRule: HighLatRuleId;
  setHighLatRule: (rule: HighLatRuleId) => void;
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
  BOOKMARKS: "bookmarked_surahs",
  THEME: "app_theme",
  DISPLAY_MODE: "display_mode",
  NOTIFICATIONS: "notifications_enabled",
  CALC_METHOD: "calc_method",
  MADHAB: "madhab",
  HIGH_LAT_RULE: "high_lat_rule",
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

function getTimezoneOffset(): number {
  return -new Date().getTimezoneOffset() / 60;
}

const DEFAULT_LOCATION: LocationData = {
  latitude: 21.4225,
  longitude: 39.8262,
  city: "Makkah",
  timezone: 3,
};

function extractCity(geocode: Location.LocationGeocodedAddress | null | undefined): string | null {
  if (!geocode) return null;
  return geocode.city || geocode.subregion || geocode.district || geocode.region || null;
}

async function nominatimCity(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address;
    if (!addr) return null;
    return (
      addr.city || addr.town || addr.village ||
      addr.municipality || addr.county ||
      addr.state_district || addr.state || null
    );
  } catch {
    return null;
  }
}

const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

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
  const [calcMethod, setCalcMethodState] = useState<CalcMethodId>(DEFAULT_CALC_METHOD);
  const [calcMethodAutoSetLabel, setCalcMethodAutoSetLabel] = useState<string | null>(null);
  const calcMethodSavedRef = useRef(false);
  const [madhab, setMadhabState] = useState<MadhabId>(DEFAULT_MADHAB);
  const [highLatRule, setHighLatRuleState] = useState<HighLatRuleId>(DEFAULT_HIGH_LAT_RULE);
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
  const adhanEnabledRef = useRef(adhanEnabled);
  const adhanStyleIdRef = useRef(adhanStyleId);
  const adhanModeRef = useRef(adhanMode);
  const prayerTimesRef = useRef(prayerTimes);
  const prayerNotifConfigRef = useRef(prayerNotifConfig);
  const lastPlayedRef = useRef<string>(""); // "prayerKey_YYYY-MM-DD"

  useEffect(() => { calcMethodRef.current = calcMethod; }, [calcMethod]);
  useEffect(() => { madhabRef.current = madhab; }, [madhab]);
  useEffect(() => { highLatRuleRef.current = highLatRule; }, [highLatRule]);
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
  useEffect(() => { adhanEnabledRef.current = adhanEnabled; }, [adhanEnabled]);
  useEffect(() => { adhanStyleIdRef.current = adhanStyleId; }, [adhanStyleId]);
  useEffect(() => { adhanModeRef.current = adhanMode; }, [adhanMode]);
  useEffect(() => { prayerTimesRef.current = prayerTimes; }, [prayerTimes]);
  useEffect(() => { prayerNotifConfigRef.current = prayerNotifConfig; }, [prayerNotifConfig]);

  const effectiveDisplayMode: "dark" | "light" =
    displayMode === "auto"
      ? (systemColorScheme === "light" ? "light" : "dark")
      : displayMode;

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
          new Date(), calcMethod, madhab, highLatRule, timeFormat,
        );
        const adjusted = applyPrayerOffsets(raw, prayerOffsets, location.timezone, timeFormat);
        setPrayerTimes(adjusted);
      } catch (e) {
        console.warn("Prayer time calculation failed:", e);
      }
    }
  }, [location, calcMethod, madhab, highLatRule, timeFormat, prayerOffsets]);

  // ── Adhan prayer-time watcher ──
  useEffect(() => {
    const check = () => {
      if (!adhanEnabledRef.current) return;
      const times = prayerTimesRef.current;
      if (!times) return;

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const nowH = now.getHours();
      const nowM = now.getMinutes();
      const nowS = now.getSeconds();

      // Only fire in the first 45 seconds of the minute
      if (nowS > 45) return;

      for (const key of PRAYER_KEYS) {
        const prayer = times[key];
        const pH = prayer.time.getHours();
        const pM = prayer.time.getMinutes();

        if (pH === nowH && pM === nowM) {
          const token = `${key}_${todayStr}`;
          if (lastPlayedRef.current === token) break; // already played today
          lastPlayedRef.current = token;

          const style = getAdhanStyle(adhanStyleIdRef.current);
          const mode = adhanModeRef.current;
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
      // `response.notification.date` is seconds since epoch on iOS.
      const deliveredMs = response.notification.date * 1000;
      if (Date.now() - deliveredMs > 10 * 60 * 1000) return;

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
    loadPreferences();
    loadBookmarks();
    initLocation();
  }, []);

  const loadPreferences = async () => {
    try {
      const [theme, mode, notifs, method, madhabVal, latRule, fmt, adhanOn, adhanStyle, adhanModeVal, prayerNotifRaw, jummahRaw, jummahMinsRaw, ayahRaw, ayahHrRaw, ayahMinRaw, hadithRaw, hadithHrRaw, hadithMinRaw, islamicEventsRaw, locationRaw, prayerOffsetsRaw, snoozeRaw, preReminderRaw] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.CALC_METHOD),
          AsyncStorage.getItem(STORAGE_KEYS.MADHAB),
          AsyncStorage.getItem(STORAGE_KEYS.HIGH_LAT_RULE),
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
        ]);
      if (theme && theme in THEMES) setThemeNameState(theme as ThemeName);
      if (mode === "auto" || mode === "dark" || mode === "light") setDisplayModeState(mode);
      if (notifs === "true") setNotificationsEnabled(true);
      if (method) { setCalcMethodState(method as CalcMethodId); calcMethodSavedRef.current = true; }
      if (madhabVal === "Hanafi" || madhabVal === "Shafi") setMadhabState(madhabVal);
      if (latRule) setHighLatRuleState(latRule as HighLatRuleId);
      if (fmt === "12h" || fmt === "24h") setTimeFormatState(fmt);
      if (adhanOn === "true") setAdhanEnabled(true);
      if (adhanStyle && ADHAN_STYLES.find((s) => s.id === adhanStyle)) {
        setAdhanStyleIdState(adhanStyle);
      }
      if (adhanModeVal === "full" || adhanModeVal === "short" || adhanModeVal === "silent") {
        setAdhanModeState(adhanModeVal);
      }
      if (prayerNotifRaw) {
        try {
          const parsed = JSON.parse(prayerNotifRaw) as PrayerNotifConfig;
          setPrayerNotifConfigState({ ...DEFAULT_PRAYER_NOTIF_CONFIG, ...parsed });
        } catch {}
      }
      // jummahRaw null = never saved → default true; "false" → disabled
      if (jummahRaw === "false") setJummahReminderEnabledState(false);
      if (jummahMinsRaw) {
        const mins = Number(jummahMinsRaw);
        if (mins === 15 || mins === 30 || mins === 60) setJummahMinutesBeforeState(mins);
      }
      // null = never saved → default true; "false" → disabled
      if (ayahRaw === "false") setAyahReminderEnabledState(false);
      if (ayahHrRaw) { const h = Number(ayahHrRaw); if (h >= 0 && h <= 23) setAyahReminderHourState(h); }
      if (ayahMinRaw) { const m = Number(ayahMinRaw); if (m >= 0 && m <= 55) setAyahReminderMinuteState(m); }
      if (hadithRaw === "false") setHadithReminderEnabledState(false);
      if (hadithHrRaw) { const h = Number(hadithHrRaw); if (h >= 0 && h <= 23) setHadithReminderHourState(h); }
      if (hadithMinRaw) { const m = Number(hadithMinRaw); if (m >= 0 && m <= 55) setHadithReminderMinuteState(m); }
      if (islamicEventsRaw === "false") setIslamicEventsEnabledState(false);
      if (snoozeRaw) {
        const n = Number(snoozeRaw);
        if (Number.isFinite(n) && n > Date.now()) setNotifSnoozeUntilState(n);
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
      if (Platform.OS !== "web" && notifs === "true" && locationRaw) {
        try {
          const loc: LocationData = JSON.parse(locationRaw);
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
          const startupNotifConfig: PrayerNotifConfig = prayerNotifRaw
            ? { ...DEFAULT_PRAYER_NOTIF_CONFIG, ...(JSON.parse(prayerNotifRaw) as PrayerNotifConfig) }
            : DEFAULT_PRAYER_NOTIF_CONFIG;
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
            (latRule as HighLatRuleId) || DEFAULT_HIGH_LAT_RULE,
          );
        } catch {}
      }
    } catch {}
  };

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
    calcMethodSavedRef.current = true;
    setCalcMethodAutoSetLabel(null);
    try { await AsyncStorage.setItem(STORAGE_KEYS.CALC_METHOD, method); } catch {}
  }, []);

  const dismissCalcMethodNotice = useCallback(() => {
    setCalcMethodAutoSetLabel(null);
  }, []);

  const setMadhab = useCallback(async (m: MadhabId) => {
    setMadhabState(m);
    try { await AsyncStorage.setItem(STORAGE_KEYS.MADHAB, m); } catch {}
  }, []);

  const setHighLatRule = useCallback(async (rule: HighLatRuleId) => {
    setHighLatRuleState(rule);
    try { await AsyncStorage.setItem(STORAGE_KEYS.HIGH_LAT_RULE, rule); } catch {}
  }, []);

  const setTimeFormat = useCallback(async (fmt: TimeFormat) => {
    setTimeFormatState(fmt);
    try { await AsyncStorage.setItem(STORAGE_KEYS.TIME_FORMAT, fmt); } catch {}
  }, []);

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

  const toggleNotifications = useCallback(async () => {
    const next = !notificationsRef.current;
    if (next) {
      const result = await requestNotificationPermissionDetailed();
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
        return;
      }
      setNotificationsEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "true");
      if (location) {
        await schedulePrayerNotifications(
          location.latitude, location.longitude, location.timezone, location.city,
          jummahReminderRef.current, jummahMinutesRef.current,
          ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
          hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
          islamicEventsRef.current,
          prayerNotifConfigRef.current,
          prayerOffsetsRef.current,
          calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
        );
      }
    } else {
      setNotificationsEnabled(false);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "false");
      await cancelAllPrayerNotifications();
    }
  }, [location]);

  // ── Adhan callbacks ──
  const toggleAdhan = useCallback(async () => {
    const next = !adhanEnabledRef.current;
    setAdhanEnabled(next);
    try { await AsyncStorage.setItem(STORAGE_KEYS.ADHAN_ENABLED, next ? "true" : "false"); } catch {}
    if (!next) {
      await stopAdhanAudio();
      setAdhanPlaying(false);
      setAdhanPrayerName(null);
      setAdhanPrayerArabicName(null);
    }
  }, []);

  const setAdhanStyleId = useCallback(async (id: string) => {
    setAdhanStyleIdState(id);
    try { await AsyncStorage.setItem(STORAGE_KEYS.ADHAN_STYLE, id); } catch {}
  }, []);

  const setAdhanMode = useCallback(async (m: AdhanMode) => {
    setAdhanModeState(m);
    try { await AsyncStorage.setItem(STORAGE_KEYS.ADHAN_MODE, m); } catch {}
  }, []);

  const setPrayerNotifSettings = useCallback(async (key: PrayerKey, settings: PrayerNotifSettings) => {
    // Capture the updated config synchronously inside the setState updater so
    // the reschedule always uses the NEW value, not the stale ref.
    let capturedConfig: PrayerNotifConfig = prayerNotifConfigRef.current; // safe default
    setPrayerNotifConfigState((prev) => {
      capturedConfig = { ...prev, [key]: settings };
      AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(capturedConfig)).catch(() => {});
      return capturedConfig;
    });
    if (notificationsRef.current && location) {
      setTimeout(async () => {
        await schedulePrayerNotifications(
          location.latitude, location.longitude, location.timezone, location.city,
          jummahReminderRef.current, jummahMinutesRef.current,
          ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
          hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
          islamicEventsRef.current,
          capturedConfig, // the freshly-updated config, not the stale ref
          prayerOffsetsRef.current,
          calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
        );
      }, 50);
    }
  }, [location]);

  // Master bell: toggles all 5 prayer notifications (excludes Sunrise).
  // If all 5 are on → turns all off.
  // If any are off (mixed or all off) → turns all on, enabling global
  // notifications first if they were off.
  const FIVE_PRAYER_KEYS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  const toggleMasterPrayerBell = useCallback(async () => {
    if (Platform.OS === "web") return;
    const cfg = prayerNotifConfigRef.current;
    const allOn = FIVE_PRAYER_KEYS.every((k) => cfg[k].enabled);
    const nextEnabled = !allOn; // all-on → turn off; anything else → turn all on

    // If enabling and global notifications aren't on yet, request permission
    if (nextEnabled && !notificationsRef.current) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      setNotificationsEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "true");
    }

    // Update the 5 prayer enabled flags in one state update.
    // Capture the resulting config synchronously inside the setter so the
    // reschedule below always uses the NEW value, not the stale ref
    // (ref is only synced after the next render via useEffect).
    let capturedConfig: PrayerNotifConfig = prayerNotifConfigRef.current;
    setPrayerNotifConfigState((prev) => {
      const next = { ...prev };
      for (const k of FIVE_PRAYER_KEYS) {
        next[k] = { ...prev[k], enabled: nextEnabled };
      }
      capturedConfig = next;
      AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(next)).catch(() => {});
      return next;
    });

    // Reschedule if notifications are (or just became) active.
    // Use setTimeout so the setter runs before we schedule, and capturedConfig
    // (not the stale ref) so we use the just-set enabled values.
    const notifsActive = nextEnabled ? true : notificationsRef.current;
    if (notifsActive && location) {
      setTimeout(async () => {
        await schedulePrayerNotifications(
          location.latitude, location.longitude, location.timezone, location.city,
          jummahReminderRef.current, jummahMinutesRef.current,
          ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
          hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
          islamicEventsRef.current,
          capturedConfig,
          prayerOffsetsRef.current,
          calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
        );
      }, 50);
    }
  }, [location]);

  // ── Quick-sheet controls ──
  // Reschedule helper used by all three quick-sheet setters below
  const rescheduleAll = useCallback(async (cfg?: PrayerNotifConfig) => {
    if (!notificationsRef.current || !location) return;
    await schedulePrayerNotifications(
      location.latitude, location.longitude, location.timezone, location.city,
      jummahReminderRef.current, jummahMinutesRef.current,
      ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
      hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
      islamicEventsRef.current,
      cfg ?? prayerNotifConfigRef.current,
      prayerOffsetsRef.current,
      calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
    );
  }, [location]);

  const setNotifSnoozeUntil = useCallback(async (timestamp: number) => {
    setNotifSnoozeUntilState(timestamp);
    try {
      if (timestamp > Date.now()) {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIF_SNOOZE_UNTIL, String(timestamp));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.NOTIF_SNOOZE_UNTIL);
      }
    } catch {}
    // Reschedule reads the new value from storage
    setTimeout(() => { rescheduleAll(); }, 50);
  }, [rescheduleAll]);

  const setPrayerPreReminderMinutes = useCallback(async (minutes: 0 | 5 | 10 | 15) => {
    setPrayerPreReminderMinutesState(minutes);
    try { await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_PRE_REMINDER, String(minutes)); } catch {}
    setTimeout(() => { rescheduleAll(); }, 50);
  }, [rescheduleAll]);

  // Bulk-set the notification type for all 5 obligatory prayers (Sunrise unaffected).
  // Used by the quick-sheet's Sound mode selector.
  const setAllPrayersNotifType = useCallback(async (type: "silent" | "notification" | "adhan") => {
    if (Platform.OS === "web") return;
    const FIVE: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

    // If switching ON something and notifications are disabled, request permission first
    if (!notificationsRef.current) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      setNotificationsEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "true");
    }

    let captured: PrayerNotifConfig = prayerNotifConfigRef.current;
    setPrayerNotifConfigState((prev) => {
      const next: PrayerNotifConfig = { ...prev };
      for (const k of FIVE) {
        next[k] = { ...prev[k], type, enabled: true };
      }
      captured = next;
      AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIF_CONFIG, JSON.stringify(next)).catch(() => {});
      return next;
    });
    setTimeout(() => { rescheduleAll(captured); }, 50);
  }, [rescheduleAll]);

  const setJummahReminder = useCallback(async (enabled: boolean, minutes: number) => {
    setJummahReminderEnabledState(enabled);
    setJummahMinutesBeforeState(minutes);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.JUMMAH_REMINDER, enabled ? "true" : "false");
      await AsyncStorage.setItem(STORAGE_KEYS.JUMMAH_MINUTES, String(minutes));
    } catch {}
    if (notificationsRef.current && location) {
      await schedulePrayerNotifications(
        location.latitude, location.longitude, location.timezone, location.city,
        enabled, minutes,
        ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
        hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
        islamicEventsRef.current,
        prayerNotifConfigRef.current,
        prayerOffsetsRef.current,
        calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
      );
    }
  }, [location]);

  const setAyahReminder = useCallback(async (enabled: boolean, hour: number, minute: number) => {
    setAyahReminderEnabledState(enabled);
    setAyahReminderHourState(hour);
    setAyahReminderMinuteState(minute);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AYAH_REMINDER, enabled ? "true" : "false");
      await AsyncStorage.setItem(STORAGE_KEYS.AYAH_HOUR, String(hour));
      await AsyncStorage.setItem(STORAGE_KEYS.AYAH_MINUTE, String(minute));
    } catch {}
    if (notificationsRef.current && location) {
      await schedulePrayerNotifications(
        location.latitude, location.longitude, location.timezone, location.city,
        jummahReminderRef.current, jummahMinutesRef.current,
        enabled, hour, minute,
        hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
        islamicEventsRef.current,
        prayerNotifConfigRef.current,
        prayerOffsetsRef.current,
        calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
      );
    }
  }, [location]);

  const setHadithReminder = useCallback(async (enabled: boolean, hour: number, minute: number) => {
    setHadithReminderEnabledState(enabled);
    setHadithReminderHourState(hour);
    setHadithReminderMinuteState(minute);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HADITH_REMINDER, enabled ? "true" : "false");
      await AsyncStorage.setItem(STORAGE_KEYS.HADITH_HOUR, String(hour));
      await AsyncStorage.setItem(STORAGE_KEYS.HADITH_MINUTE, String(minute));
    } catch {}
    if (notificationsRef.current && location) {
      await schedulePrayerNotifications(
        location.latitude, location.longitude, location.timezone, location.city,
        jummahReminderRef.current, jummahMinutesRef.current,
        ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
        enabled, hour, minute,
        islamicEventsRef.current,
        prayerNotifConfigRef.current,
        prayerOffsetsRef.current,
        calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
      );
    }
  }, [location]);

  const setIslamicEventsReminder = useCallback(async (enabled: boolean) => {
    setIslamicEventsEnabledState(enabled);
    try { await AsyncStorage.setItem(STORAGE_KEYS.ISLAMIC_EVENTS_REMINDER, enabled ? "true" : "false"); } catch {}
    if (notificationsRef.current && location) {
      await schedulePrayerNotifications(
        location.latitude, location.longitude, location.timezone, location.city,
        jummahReminderRef.current, jummahMinutesRef.current,
        ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
        hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
        enabled,
        prayerNotifConfigRef.current,
        prayerOffsetsRef.current,
        calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
      );
    }
  }, [location]);

  const stopAdhan = useCallback(async () => {
    await stopAdhanAudio();
    setAdhanPlaying(false);
    setAdhanIsSilent(false);
    setAdhanPrayerName(null);
    setAdhanPrayerArabicName(null);
  }, []);

  // ── Location ──
  const updateLocation = useCallback((loc: LocationData) => {
    setLocation(loc);
  }, []);

  const fetchGpsLocation = useCallback(async (showLoading: boolean) => {
    if (showLoading) {
      setIsLoadingLocation(true);
      setLocationError(null);
    }
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
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
          setUsingDefaultLocation(true);
          updateLocation(DEFAULT_LOCATION);
        }
        return;
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
      if (!cityName) cityName = await nominatimCity(latitude, longitude);
      if (detectedCountryCode && !calcMethodSavedRef.current) {
        const suggested = suggestCalcMethod(detectedCountryCode);
        if (suggested) {
          setCalcMethodState(suggested);
          calcMethodRef.current = suggested;
          calcMethodSavedRef.current = true;
          try { await AsyncStorage.setItem(STORAGE_KEYS.CALC_METHOD, suggested); } catch {}
          setCalcMethodAutoSetLabel(getCalcMethodLabel(suggested));
        }
      }
      const tz = getTimezoneOffset();
      const locationData: LocationData = {
        latitude, longitude,
        city: cityName ?? "Your Location",
        timezone: tz,
      };
      setUsingDefaultLocation(false);
      updateLocation(locationData);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(locationData));
      if (Platform.OS !== "web" && notificationsRef.current) {
        await schedulePrayerNotifications(
          latitude, longitude, tz, locationData.city,
          jummahReminderRef.current, jummahMinutesRef.current,
          ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
          hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
          islamicEventsRef.current,
          prayerNotifConfigRef.current,
          prayerOffsetsRef.current,
          calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
        );
      }
    } catch {
      if (showLoading) {
        setLocationError("Could not determine location. Using Makkah as default.");
        setUsingDefaultLocation(true);
        updateLocation(DEFAULT_LOCATION);
      }
    } finally {
      if (showLoading) setIsLoadingLocation(false);
    }
  }, [updateLocation]);

  const requestLocation = useCallback(async () => {
    await fetchGpsLocation(true);
  }, [fetchGpsLocation]);

  const setManualLocation = useCallback(async (loc: LocationData) => {
    setUsingDefaultLocation(false);
    setLocationError(null);
    updateLocation(loc);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(loc));
    } catch {}
  }, [updateLocation]);

  const initLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    setLocation(DEFAULT_LOCATION);
    setUsingDefaultLocation(true);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
      if (stored) {
        const cachedLocation: LocationData = JSON.parse(stored);
        setLocation(cachedLocation);
        setUsingDefaultLocation(false);
      }
    } catch {}
    setIsLoadingLocation(false);
    fetchGpsLocation(false);
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
    if (notificationsRef.current && location) {
      await schedulePrayerNotifications(
        location.latitude, location.longitude, location.timezone, location.city,
        jummahReminderRef.current, jummahMinutesRef.current,
        ayahReminderRef.current, ayahHourRef.current, ayahMinuteRef.current,
        hadithReminderRef.current, hadithHourRef.current, hadithMinuteRef.current,
        islamicEventsRef.current,
        prayerNotifConfigRef.current,
        offsets,
        calcMethodRef.current, madhabRef.current, highLatRuleRef.current,
      );
    }
  }, [location]);

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
        toggleNotifications,
        calcMethod,
        setCalcMethod,
        calcMethodAutoSetLabel,
        dismissCalcMethodNotice,
        madhab,
        setMadhab,
        highLatRule,
        setHighLatRule,
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
