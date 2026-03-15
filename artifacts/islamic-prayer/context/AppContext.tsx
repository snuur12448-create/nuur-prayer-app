import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { calculatePrayerTimes, PrayerTimesResult } from "@/utils/prayerTimes";

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
  refreshPrayerTimes: () => void;
  bookmarkedSurahs: number[];
  toggleBookmark: (surahNumber: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  LOCATION: "location_data",
  BOOKMARKS: "bookmarked_surahs",
};

function getTimezoneOffset(): number {
  return -new Date().getTimezoneOffset() / 60;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [bookmarkedSurahs, setBookmarkedSurahs] = useState<number[]>([]);

  useEffect(() => {
    loadBookmarks();
    initLocation();
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

  const initLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    const defaultLocation: LocationData = {
      latitude: 21.4225,
      longitude: 39.8262,
      city: "Makkah",
      timezone: 3,
    };

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
      if (stored) {
        const cachedLocation: LocationData = JSON.parse(stored);
        setLocation(cachedLocation);
        const times = calculatePrayerTimes(
          cachedLocation.latitude,
          cachedLocation.longitude,
          getTimezoneOffset()
        );
        setPrayerTimes(times);
      } else {
        setLocation(defaultLocation);
        const times = calculatePrayerTimes(
          defaultLocation.latitude,
          defaultLocation.longitude,
          defaultLocation.timezone
        );
        setPrayerTimes(times);
      }
    } catch {
      setLocation(defaultLocation);
      const times = calculatePrayerTimes(
        defaultLocation.latitude,
        defaultLocation.longitude,
        defaultLocation.timezone
      );
      setPrayerTimes(times);
    }

    setIsLoadingLocation(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied. Using Makkah as default.");
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

      setLocation(locationData);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(locationData));

      const times = calculatePrayerTimes(
        locationData.latitude,
        locationData.longitude,
        tz
      );
      setPrayerTimes(times);
    } catch (err) {
      setLocationError("Could not determine location.");
    } finally {
      setIsLoadingLocation(false);
    }
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
        refreshPrayerTimes,
        bookmarkedSurahs,
        toggleBookmark,
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
