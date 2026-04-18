import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Linking, Platform } from "react-native";

const STORAGE_KEYS = {
  INSTALL_DATE: "nuur_install_date",
  REVIEW_REQUESTED: "nuur_review_requested",
};

const MIN_DAYS = 5;
const MAX_DAYS = 7;

// ── Store URLs for the post-publish fallback ────────────────────────────────
// Once Nuur is approved on the App Store, replace APPLE_APP_ID with the
// numeric Apple ID shown in App Store Connect (e.g. 6478123456). Until then
// the iOS fallback is disabled and the in-app review sheet is the only path.
// Android uses the bundle id directly so it works the moment the listing is
// live — no value to update.
const APPLE_APP_ID: string | null = null; // TODO: set after App Store approval
const ANDROID_PACKAGE = "com.nuur.islamicprayer";

function getStoreReviewUrl(): string | null {
  if (Platform.OS === "ios") {
    if (!APPLE_APP_ID) return null;
    return `https://apps.apple.com/app/id${APPLE_APP_ID}?action=write-review`;
  }
  if (Platform.OS === "android") {
    return `market://details?id=${ANDROID_PACKAGE}&showAllReviews=true`;
  }
  return null;
}

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

    // expo-store-review wraps the native in-app review APIs:
    //   • iOS  → SKStoreReviewController (real submissions only on App Store
    //            builds; TestFlight / dev builds show the sheet but cannot
    //            submit. Apple caps at 3 prompts per 365 days per user.)
    //   • Android → Google Play In-App Review API (real submissions on Play
    //               Store builds; sideloaded builds may no-op silently.)
    // When the in-app sheet isn't available (older Android, missing Play
    // Services, or Apple cap reached), we open the public store listing so
    // the user can still leave a review — but only after the app is live.
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_REQUESTED, "true");
      return;
    }

    const fallbackUrl = getStoreReviewUrl();
    if (!fallbackUrl) return; // App not yet published — nothing to fall back to
    const supported = await Linking.canOpenURL(fallbackUrl);
    if (!supported) return;
    await Linking.openURL(fallbackUrl);
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_REQUESTED, "true");
  } catch {}
}

/**
 * Manual entry point for "Rate Nuur" buttons in Settings / About screens.
 * Always tries the in-app sheet first, then falls back to the public store
 * listing. Does NOT respect the install-date window — the user is explicitly
 * asking to leave a review.
 */
export async function openReviewSheet(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
      return;
    }
    const fallbackUrl = getStoreReviewUrl();
    if (fallbackUrl) {
      const supported = await Linking.canOpenURL(fallbackUrl);
      if (supported) await Linking.openURL(fallbackUrl);
    }
  } catch {}
}
