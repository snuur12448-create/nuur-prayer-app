import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Platform } from "react-native";

const STORAGE_KEYS = {
  INSTALL_DATE: "nuur_install_date",
  REVIEW_REQUESTED: "nuur_review_requested",
};

const MIN_DAYS = 5;
const MAX_DAYS = 7;

function daysElapsed(from: number): number {
  return (Date.now() - from) / (1000 * 60 * 60 * 24);
}

export async function recordFirstLaunch(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.INSTALL_DATE);
    if (!existing) {
      await AsyncStorage.setItem(STORAGE_KEYS.INSTALL_DATE, String(Date.now()));
    }
  } catch {}
}

export async function maybeRequestReview(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const [installDateRaw, reviewRequested] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.INSTALL_DATE),
      AsyncStorage.getItem(STORAGE_KEYS.REVIEW_REQUESTED),
    ]);

    if (reviewRequested === "true") return;
    if (!installDateRaw) return;

    const installDate = Number(installDateRaw);
    const elapsed = daysElapsed(installDate);

    if (elapsed < MIN_DAYS || elapsed > MAX_DAYS + 30) return;

    const available = await StoreReview.isAvailableAsync();
    if (!available) return;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_REQUESTED, "true");
  } catch {}
}
