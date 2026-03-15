import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { calculatePrayerTimes, PrayerTimesResult } from "@/utils/prayerTimes";
import { DEFAULT_THEME, THEMES, ThemeColors, ThemeName } from "@/constants/themes";
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
  themeColors: ThemeColors;
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  LOCATION: "location_data",
  BOOKMARKS: "bookmarked_surahs",
  THEME: "app_theme",
  NOTIFICATIONS: "notifications_enabled",
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

/** Best-effort city name from expo-location geocode result */
function extractCity(geocode: Location.LocationGeocodedAddress | null | undefined): string | null {
  if (!geocode) return null;
  return geocode.city || geocode.subregion || geocode.district || geocode.region || null;
}

/** Nominatim reverse geocode fallback (no API key required, web-friendly) */
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
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      null
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const themeColors = THEMES[themeName].colors;

  useEffect(() => {
    loadBookmarks();
    loadTheme();
    loadNotificationsPref();
    initLocation();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (stored && stored in THEMES) {
        setThemeNameState(stored as ThemeName);
      }
    } catch {}
  };

  const setThemeName = useCallback(async (name: ThemeName) => {
    setThemeNameState(name);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, name);
    } catch {}
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

  const applyLocation = useCallback((loc: LocationData) => {
    setLocation(loc);
    const times = calculatePrayerTimes(loc.latitude, loc.longitude, loc.timezone);
    setPrayerTimes(times);
  }, []);

  /** Re-schedule notifications whenever location/times change (if enabled) */
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
          location.latitude,
          location.longitude,
          location.timezone,
          location.city
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

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;

      let cityName: string | null = null;

      // Try expo-location reverse geocode first (works well on native)
      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
        cityName = extractCity(geocode);
      } catch {}

      // Fall back to Nominatim (works on web, and as a safety net on native)
      if (!cityName) {
        cityName = await nominatimCity(latitude, longitude);
      }

      const tz = getTimezoneOffset();
      const locationData: LocationData = {
        latitude,
        longitude,
        city: cityName ?? "Your Location",
        timezone: tz,
      };

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
        location.latitude,
        location.longitude,
        location.timezone
      );
      setPrayerTimes(times);
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
        bookmarkedSurahs,
        toggleBookmark,
        themeName,
        setThemeName,
        themeColors,
        notificationsEnabled,
        toggleNotifications,
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
