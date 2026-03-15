import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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

interface LocationData {
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

  const themeColors =
    displayMode === "dark"
      ? THEMES[themeName].colors
      : THEMES[themeName].lightColors;

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

  const loadNotificationsPref = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored === "true") setNotificationsEnabled(true);
    } catch {}
  };

  const applyLocation = useCallback(
    (loc: LocationData, method?: CalcMethodId, m?: MadhabId, hlr?: HighLatRuleId, fmt?: TimeFormat) => {
      setLocation(loc);
      const times = calculatePrayerTimes(
        loc.latitude, loc.longitude, loc.timezone,
        new Date(),
        method ?? calcMethod,
        m ?? madhab,
        hlr ?? highLatRule,
        fmt ?? timeFormat,
      );
      setPrayerTimes(times);
    },
    [calcMethod, madhab, highLatRule, timeFormat]
  );

  const rescheduleIfEnabled = useCallback(
    async (loc: LocationData, enabled: boolean) => {
      if (!enabled || Platform.OS === "web") return;
      await schedulePrayerNotifications(loc.latitude, loc.longitude, loc.timezone, loc.city);
    },
    []
  );

  const toggleNotifications = useCallback(async () => {
    const next = !notificationsEnabled;
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
  }, [notificationsEnabled, location]);

  const requestLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied. Using Makkah as default.");
        setUsingDefaultLocation(true);
        applyLocation(DEFAULT_LOCATION);
        setIsLoadingLocation(false);
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
      const locationData: LocationData = { latitude, longitude, city: cityName ?? "Your Location", timezone: tz };
      setUsingDefaultLocation(false);
      applyLocation(locationData);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(locationData));
      await rescheduleIfEnabled(locationData, notificationsEnabled);
    } catch {
      setLocationError("Could not determine location. Using Makkah as default.");
      setUsingDefaultLocation(true);
      applyLocation(DEFAULT_LOCATION);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [applyLocation, notificationsEnabled, rescheduleIfEnabled]);

  const initLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    applyLocation(DEFAULT_LOCATION);
    setUsingDefaultLocation(true);
    setIsLoadingLocation(false);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
      if (stored) {
        const cachedLocation: LocationData = JSON.parse(stored);
        applyLocation(cachedLocation);
        setUsingDefaultLocation(false);
      }
    } catch {}
    await requestLocation();
  };

  const refreshPrayerTimes = useCallback(() => {
    if (location) {
      const times = calculatePrayerTimes(
        location.latitude, location.longitude, location.timezone,
        new Date(), calcMethod, madhab, highLatRule, timeFormat,
      );
      setPrayerTimes(times);
    }
  }, [location, calcMethod, madhab, highLatRule, timeFormat]);

  // Re-compute prayer times whenever calculation settings change
  useEffect(() => {
    if (location) {
      const times = calculatePrayerTimes(
        location.latitude, location.longitude, location.timezone,
        new Date(), calcMethod, madhab, highLatRule, timeFormat,
      );
      setPrayerTimes(times);
    }
  }, [calcMethod, madhab, highLatRule, timeFormat]);

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
