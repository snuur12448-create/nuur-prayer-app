import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import {
  calculatePrayerTimes,
  PrayerTimesResult,
  CalcMethodId,
  MadhabId,
  HighLatRuleId,
  TimeFormat,
  DEFAULT_CALC_METHOD,
  DEFAULT_MADHAB,
  DEFAULT_HIGH_LAT_RULE,
  DEFAULT_TIME_FORMAT,
} from "@/utils/prayerTimes";
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
  schedulePrayerNotifications,
} from "@/utils/notifications";

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
  refreshPrayerTimes: () => void;
  requestLocation: () => Promise<void>;
  setManualLocation: (loc: LocationData) => Promise<void>;
  bookmarkedSurahs: number[];
  toggleBookmark: (surahNumber: number) => void;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  themeColors: ThemeColors;
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<void>;
  calcMethod: CalcMethodId;
  setCalcMethod: (method: CalcMethodId) => void;
  madhab: MadhabId;
  setMadhab: (madhab: MadhabId) => void;
  highLatRule: HighLatRuleId;
  setHighLatRule: (rule: HighLatRuleId) => void;
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);
  const [bookmarkedSurahs, setBookmarkedSurahs] = useState<number[]>([]);
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME);
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(DEFAULT_DISPLAY_MODE);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [calcMethod, setCalcMethodState] = useState<CalcMethodId>(DEFAULT_CALC_METHOD);
  const [madhab, setMadhabState] = useState<MadhabId>(DEFAULT_MADHAB);
  const [highLatRule, setHighLatRuleState] = useState<HighLatRuleId>(DEFAULT_HIGH_LAT_RULE);
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(DEFAULT_TIME_FORMAT);

  // Refs to always have latest values in async callbacks without stale closures
  const calcMethodRef = useRef(calcMethod);
  const madhabRef = useRef(madhab);
  const highLatRuleRef = useRef(highLatRule);
  const timeFormatRef = useRef(timeFormat);
  const notificationsRef = useRef(notificationsEnabled);

  useEffect(() => { calcMethodRef.current = calcMethod; }, [calcMethod]);
  useEffect(() => { madhabRef.current = madhab; }, [madhab]);
  useEffect(() => { highLatRuleRef.current = highLatRule; }, [highLatRule]);
  useEffect(() => { timeFormatRef.current = timeFormat; }, [timeFormat]);
  useEffect(() => { notificationsRef.current = notificationsEnabled; }, [notificationsEnabled]);

  const themeColors =
    displayMode === "dark"
      ? THEMES[themeName].colors
      : THEMES[themeName].lightColors;

  // ── Single source of truth: recalculate whenever location OR settings change ──
  useEffect(() => {
    if (location) {
      try {
        const times = calculatePrayerTimes(
          location.latitude, location.longitude, location.timezone,
          new Date(), calcMethod, madhab, highLatRule, timeFormat,
        );
        setPrayerTimes(times);
      } catch (e) {
        console.warn("Prayer time calculation failed:", e);
      }
    }
  }, [location, calcMethod, madhab, highLatRule, timeFormat]);

  // ── Initialisation ──
  useEffect(() => {
    loadPreferences();
    loadBookmarks();
    initLocation();
  }, []);

  const loadPreferences = async () => {
    try {
      const [theme, mode, notifs, method, madhabVal, latRule, fmt] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.CALC_METHOD),
        AsyncStorage.getItem(STORAGE_KEYS.MADHAB),
        AsyncStorage.getItem(STORAGE_KEYS.HIGH_LAT_RULE),
        AsyncStorage.getItem(STORAGE_KEYS.TIME_FORMAT),
      ]);
      if (theme && theme in THEMES) setThemeNameState(theme as ThemeName);
      if (mode === "dark" || mode === "light") setDisplayModeState(mode);
      if (notifs === "true") setNotificationsEnabled(true);
      if (method) setCalcMethodState(method as CalcMethodId);
      if (madhabVal === "Hanafi" || madhabVal === "Shafi") setMadhabState(madhabVal);
      if (latRule) setHighLatRuleState(latRule as HighLatRuleId);
      if (fmt === "12h" || fmt === "24h") setTimeFormatState(fmt);
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
    try { await AsyncStorage.setItem(STORAGE_KEYS.CALC_METHOD, method); } catch {}
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
      const granted = await requestNotificationPermission();
      if (!granted) return;
      setNotificationsEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "true");
      if (location) {
        await schedulePrayerNotifications(
          location.latitude, location.longitude, location.timezone, location.city
        );
      }
    } else {
      setNotificationsEnabled(false);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "false");
      await cancelAllPrayerNotifications();
    }
  }, [location]);

  // ── Location helpers — use refs so async callbacks always see latest settings ──
  const updateLocation = useCallback((loc: LocationData) => {
    setLocation(loc);
    // Prayer times recalculated automatically by the useEffect above
  }, []);

  // Internal GPS fetch — showLoading controls whether isLoadingLocation is updated
  const fetchGpsLocation = useCallback(async (showLoading: boolean) => {
    if (showLoading) {
      setIsLoadingLocation(true);
      setLocationError(null);
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (showLoading) {
          setLocationError("Location permission denied. Using Makkah as default.");
          setUsingDefaultLocation(true);
          updateLocation(DEFAULT_LOCATION);
        }
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      let cityName: string | null = null;
      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
        cityName = extractCity(geocode);
      } catch {}
      if (!cityName) cityName = await nominatimCity(latitude, longitude);
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
        await schedulePrayerNotifications(latitude, longitude, tz, locationData.city);
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

  // Public: user-initiated refresh — shows the loading spinner
  const requestLocation = useCallback(async () => {
    await fetchGpsLocation(true);
  }, [fetchGpsLocation]);

  // Public: manually set a location (city search)
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
    // Show default location immediately
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
    // Silently refresh GPS in the background — prayer list stays visible
    fetchGpsLocation(false);
  };

  const refreshPrayerTimes = useCallback(() => {
    if (location) {
      try {
        const times = calculatePrayerTimes(
          location.latitude, location.longitude, location.timezone,
          new Date(),
          calcMethodRef.current,
          madhabRef.current,
          highLatRuleRef.current,
          timeFormatRef.current,
        );
        setPrayerTimes(times);
      } catch (e) {
        console.warn("Prayer time refresh failed:", e);
      }
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
        refreshPrayerTimes,
        requestLocation,
        setManualLocation,
        bookmarkedSurahs,
        toggleBookmark,
        themeName,
        setThemeName,
        displayMode,
        setDisplayMode,
        themeColors,
        notificationsEnabled,
        toggleNotifications,
        calcMethod,
        setCalcMethod,
        madhab,
        setMadhab,
        highLatRule,
        setHighLatRule,
        timeFormat,
        setTimeFormat,
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
