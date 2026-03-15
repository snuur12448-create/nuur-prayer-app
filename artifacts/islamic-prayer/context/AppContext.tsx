import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { calculatePrayerTimes, PrayerTimesResult } from "@/utils/prayerTimes";
import { DEFAULT_THEME, THEMES, ThemeColors, ThemeName } from "@/constants/themes";

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
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  LOCATION: "location_data",
  BOOKMARKS: "bookmarked_surahs",
  THEME: "app_theme",
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);
  const [bookmarkedSurahs, setBookmarkedSurahs] = useState<number[]>([]);
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME);

  const themeColors = THEMES[themeName].colors;

  useEffect(() => {
    loadBookmarks();
    loadTheme();
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

  const applyLocation = useCallback((loc: LocationData) => {
    setLocation(loc);
    const times = calculatePrayerTimes(loc.latitude, loc.longitude, loc.timezone);
    setPrayerTimes(times);
  }, []);

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

      let cityName = "Your Location";
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geocode) {
          cityName = geocode.city || geocode.region || "Your Location";
        }
      } catch {}

      const tz = getTimezoneOffset();
      const locationData: LocationData = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        city: cityName,
        timezone: tz,
      };

      setUsingDefaultLocation(false);
      applyLocation(locationData);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(locationData));
    } catch {
      setLocationError("Could not determine location. Using Makkah as default.");
      setUsingDefaultLocation(true);
      applyLocation(DEFAULT_LOCATION);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [applyLocation]);

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
