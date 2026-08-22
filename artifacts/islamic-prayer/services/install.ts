import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";

const KEY_INSTALL_ID = "nuur.install.id";
const KEY_FIRST_LAUNCH_DATE = "nuur.install.firstLaunchDate";
const KEY_FIRST_VERSION = "nuur.install.firstVersion";
const KEY_LAST_LAUNCH_DATE = "nuur.install.lastLaunchDate";
const KEY_CURRENT_VERSION = "nuur.install.currentVersion";

export interface InstallInfo {
  installId: string;
  firstLaunchDate: string;
  firstVersion: string;
  lastLaunchDate: string;
  currentVersion: string;
}

function getCurrentVersion(): string {
  // expo-constants exposes the app version from app.json under expoConfig.version.
  const v = Constants.expoConfig?.version;
  return typeof v === "string" && v.length > 0 ? v : "0.0.0";
}

/**
 * Idempotent. Safe to call multiple times — never overwrites firstLaunchDate,
 * firstVersion, or installId once they've been set. Always updates
 * lastLaunchDate and currentVersion.
 *
 * Fully defensive: any AsyncStorage error is swallowed and logged so the app
 * can never fail to launch because of this service.
 */
export async function initializeInstallTracking(): Promise<void> {
  try {
    const nowIso = new Date().toISOString();
    const currentVersion = getCurrentVersion();

    const [existingId, existingFirstDate, existingFirstVersion] =
      await Promise.all([
        AsyncStorage.getItem(KEY_INSTALL_ID),
        AsyncStorage.getItem(KEY_FIRST_LAUNCH_DATE),
        AsyncStorage.getItem(KEY_FIRST_VERSION),
      ]);

    const firstLaunchWrites: [string, string][] = [];

    if (!existingId) {
      const newId = Crypto.randomUUID();
      firstLaunchWrites.push([KEY_INSTALL_ID, newId]);
    }
    if (!existingFirstDate) {
      firstLaunchWrites.push([KEY_FIRST_LAUNCH_DATE, nowIso]);
    }
    if (!existingFirstVersion) {
      firstLaunchWrites.push([KEY_FIRST_VERSION, currentVersion]);
    }

    const everyLaunchWrites: [string, string][] = [
      [KEY_LAST_LAUNCH_DATE, nowIso],
      [KEY_CURRENT_VERSION, currentVersion],
    ];

    await AsyncStorage.multiSet([...firstLaunchWrites, ...everyLaunchWrites]);
  } catch (err) {
    console.warn("[install-tracking] init failed:", err);
  }
}

/**
 * Returns the full InstallInfo, or null if any required field is missing
 * (e.g. tracking has not been initialized yet, or AsyncStorage threw).
 */
export async function getInstallInfo(): Promise<InstallInfo | null> {
  try {
    const pairs = await AsyncStorage.multiGet([
      KEY_INSTALL_ID,
      KEY_FIRST_LAUNCH_DATE,
      KEY_FIRST_VERSION,
      KEY_LAST_LAUNCH_DATE,
      KEY_CURRENT_VERSION,
    ]);
    const map = new Map(pairs.map(([k, v]) => [k, v]));

    const installId = map.get(KEY_INSTALL_ID);
    const firstLaunchDate = map.get(KEY_FIRST_LAUNCH_DATE);
    const firstVersion = map.get(KEY_FIRST_VERSION);
    const lastLaunchDate = map.get(KEY_LAST_LAUNCH_DATE);
    const currentVersion = map.get(KEY_CURRENT_VERSION);

    if (
      !installId ||
      !firstLaunchDate ||
      !firstVersion ||
      !lastLaunchDate ||
      !currentVersion
    ) {
      return null;
    }

    return {
      installId,
      firstLaunchDate,
      firstVersion,
      lastLaunchDate,
      currentVersion,
    };
  } catch (err) {
    console.warn("[install-tracking] read failed:", err);
    return null;
  }
}
