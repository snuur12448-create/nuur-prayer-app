/**
 * Nuur — In-App Purchases (RevenueCat)
 *
 * DORMANT INFRASTRUCTURE.
 *
 * This module wires up the RevenueCat SDK so monetization can be flipped on
 * later (Nuur+ tier) without scrambling. By default, no paywalls are shown
 * anywhere in the app — `isPremium()` always resolves to `false` until both:
 *
 *   1. Platform API keys are provided via the env vars below, AND
 *   2. UI gates are added that actually call `isPremium()`.
 *
 * Required env (set later, when ready to launch monetization):
 *   - EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
 *   - EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
 *
 * Server-side scripts (e.g. seeding products, querying customer data) use the
 * `@replit/revenuecat-sdk` package via the Replit RevenueCat connector — see
 * .local/skills/revenuecat for that side.
 */

import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  LOG_LEVEL,
} from "react-native-purchases";

export const PREMIUM_ENTITLEMENT_ID = "pro";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

let configured = false;
let configuring: Promise<void> | null = null;

function pickApiKey(): string | null {
  if (Platform.OS === "ios") return IOS_KEY ?? null;
  if (Platform.OS === "android") return ANDROID_KEY ?? null;
  return null;
}

/**
 * Initialize the RevenueCat SDK. Safe to call multiple times.
 * No-ops silently when API keys are absent — the dormant default.
 */
export async function configurePurchases(): Promise<void> {
  if (configured) return;
  if (configuring) return configuring;

  const apiKey = pickApiKey();
  if (!apiKey) {
    if (__DEV__) {
      console.log(
        "[iap] RevenueCat keys not set — running in dormant mode (no premium features).",
      );
    }
    return;
  }

  configuring = (async () => {
    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.WARN);
      }
      Purchases.configure({ apiKey });
      configured = true;
    } catch (err) {
      console.warn("[iap] Failed to configure RevenueCat:", err);
    } finally {
      configuring = null;
    }
  })();

  return configuring;
}

export function isConfigured(): boolean {
  return configured;
}

/**
 * Check whether the current user has the premium entitlement.
 * Returns false in dormant mode (no keys) or on any error.
 */
export async function checkPremium(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info: CustomerInfo = await Purchases.getCustomerInfo();
    const ent = info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    return !!ent;
  } catch {
    return false;
  }
}

/**
 * Fetch the current offering (set of available packages). Returns null in
 * dormant mode — call sites should handle null gracefully.
 */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to entitlement changes. Returns an unsubscribe function.
 * No-op in dormant mode.
 */
export function addPremiumListener(
  cb: (isPremium: boolean) => void,
): () => void {
  if (!configured) return () => {};
  const listener = (info: CustomerInfo) => {
    cb(!!info.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
  };
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}
