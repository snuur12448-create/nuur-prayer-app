import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(appRoot, "..", "..");
const read = (...parts) => readFileSync(join(appRoot, ...parts), "utf8");
const appConfig = JSON.parse(read("app.json")).expo;

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function pluginConfig(name) {
  const entry = appConfig.plugins.find((plugin) =>
    Array.isArray(plugin) ? plugin[0] === name : plugin === name,
  );
  return Array.isArray(entry) ? entry[1] ?? {} : {};
}

check(appConfig.userInterfaceStyle === "dark", "Release appearance must be explicitly dark.");
check(/^\d+\.\d+\.\d+$/.test(appConfig.version), "Expo version must use x.y.z format.");
check(/^\d+$/.test(appConfig.ios.buildNumber), "iOS buildNumber must be numeric.");
check(Number.isInteger(appConfig.android.versionCode) && appConfig.android.versionCode > 0,
  "Android versionCode must be a positive integer.");

const info = appConfig.ios.infoPlist;
check(info.NSLocationWhenInUseUsageDescription, "Foreground location purpose string is required.");
check(!("NSLocationAlwaysUsageDescription" in info), "Always-location access is not used.");
check(!("NSLocationAlwaysAndWhenInUseUsageDescription" in info), "Always-location access is not used.");
check(!("NSCameraUsageDescription" in info), "Camera access is not used.");
check(!("NSPhotoLibraryUsageDescription" in info), "Photo-library read access is not used.");
check(info.NSPhotoLibraryAddUsageDescription, "Photo add-only purpose string is required.");
check(JSON.stringify(info.UIBackgroundModes) === JSON.stringify(["audio", "fetch"]),
  "Only audio playback and the registered widget background fetch may run in the background.");
check(!("BGTaskSchedulerPermittedIdentifiers" in info),
  "BGTask identifiers must not be declared without a BGTaskScheduler implementation.");

const locationPlugin = pluginConfig("expo-location");
check(locationPlugin.locationAlwaysPermission === false, "Expo location plugin must disable Always access.");
check(locationPlugin.locationAlwaysAndWhenInUsePermission === false,
  "Expo location plugin must disable Always-and-When-in-Use access.");
const imagePickerPlugin = pluginConfig("expo-image-picker");
check(imagePickerPlugin.photosPermission === false, "Unused image picker must not request photo access.");
check(imagePickerPlugin.cameraPermission === false, "Unused image picker must not request camera access.");
check(imagePickerPlugin.microphonePermission === false, "Unused image picker must not request microphone access.");
const mediaPlugin = pluginConfig("expo-media-library");
check(mediaPlugin.photosPermission === false, "Media Library must not request photo read access.");
check(mediaPlugin.isAccessMediaLocationEnabled === false,
  "Media Library must not request embedded photo location access.");
check(Array.isArray(mediaPlugin.granularPermissions) && mediaPlugin.granularPermissions.length === 0,
  "Media Library must not request Android read-media permissions.");

const blocked = new Set(appConfig.android.blockedPermissions ?? []);
for (const permission of [
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.CAMERA",
  "android.permission.RECORD_AUDIO",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.READ_MEDIA_IMAGES",
  "android.permission.READ_MEDIA_VIDEO",
  "android.permission.READ_MEDIA_AUDIO",
  "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
  "android.permission.ACCESS_MEDIA_LOCATION",
]) {
  check(blocked.has(permission), `Android release must block unused permission ${permission}.`);
}
const cleanupPluginIndex = appConfig.plugins.indexOf("./plugins/withLocalNotificationsOnly");
const notificationsPluginIndex = appConfig.plugins.findIndex((plugin) =>
  Array.isArray(plugin) ? plugin[0] === "expo-notifications" : plugin === "expo-notifications",
);
check(cleanupPluginIndex >= 0, "Local-notification entitlement cleanup plugin is missing.");
check(notificationsPluginIndex >= 0, "Expo notifications plugin is missing.");
check(cleanupPluginIndex < notificationsPluginIndex,
  "Local-notification cleanup must be listed before expo-notifications so it runs last.");

const nativeInfo = read("ios", "Nuur", "Info.plist");
for (const forbidden of [
  "NSCameraUsageDescription",
  "NSLocationAlwaysUsageDescription",
  "NSLocationAlwaysAndWhenInUseUsageDescription",
  "NSPhotoLibraryUsageDescription",
  "BGTaskSchedulerPermittedIdentifiers",
  "<string>processing</string>",
]) {
  check(!nativeInfo.includes(forbidden), `Native Info.plist still contains ${forbidden}.`);
}
check(nativeInfo.includes("<string>Dark</string>"), "Native release appearance must be dark.");
check(nativeInfo.includes(`<string>${appConfig.version}</string>`), "Native and Expo versions differ.");
check(nativeInfo.includes(`<string>${appConfig.ios.buildNumber}</string>`), "Native and Expo build numbers differ.");

const entitlements = read("ios", "Nuur", "Nuur.entitlements");
check(!entitlements.includes("aps-environment"), "Remote-push entitlement is unused by this local-notification app.");
check(entitlements.includes("group.com.nuur.shared"), "Main app App Group entitlement is missing.");
const widgetEntitlements = read("ios", "NuurWidgetExtension.entitlements");
check(widgetEntitlements.includes("group.com.nuur.shared"), "Widget App Group entitlement is missing.");

const appPrivacy = read("ios", "Nuur", "PrivacyInfo.xcprivacy");
check(appPrivacy.includes("1C8F.1"), "App privacy manifest must declare App Group UserDefaults reason 1C8F.1.");
check(!appPrivacy.includes("CA92.1"), "CA92.1 does not cover shared App Group UserDefaults.");
check(appPrivacy.includes("NSPrivacyCollectedDataTypePreciseLocation"),
  "App privacy manifest must disclose precise location sent for location-based services.");
const widgetPrivacy = read("ios", "NuurWidget", "PrivacyInfo.xcprivacy");
check(widgetPrivacy.includes("1C8F.1"), "Widget privacy manifest must declare App Group UserDefaults.");
check(!widgetPrivacy.includes("NSPrivacyCollectedDataTypePreciseLocation"),
  "Widget must not claim that it collects precise location.");

const project = read("ios", "Nuur.xcodeproj", "project.pbxproj");
check((project.match(/MARKETING_VERSION = 1\.0\.0;/g) ?? []).length === 4,
  "App and widget marketing versions must match in Debug and Release.");
check((project.match(/PrivacyInfo\.xcprivacy in Resources/g) ?? []).length === 2,
  "The app privacy manifest must have exactly one file and one resource entry.");

const notificationPlugin = pluginConfig("expo-notifications");
for (const sound of notificationPlugin.sounds ?? []) {
  check(existsSync(join(appRoot, sound)), `Notification sound is missing: ${sound}`);
}

const requiredTrackedFiles = [
  ...notificationPlugin.sounds,
  "native/NuurWidget-replacements/NuurWidget.swift",
  "native/NuurWidget-replacements/NuurWidgetBundle.swift",
  "native/NuurWidget-replacements/NuurWidgetLiveActivity.swift",
  "native/NuurWidget-replacements/NuurAdhkarWidget.swift",
  "native/NuurWidget-replacements/NuurLockWidget.swift",
  "native/NuurWidget-replacements/NuurTimetableWidget.swift",
  "native/NuurShared/DailyTimetable.swift",
  "native/NuurShared/AdhkarState.swift",
  "native/NuurShared/VerseOfMoment.swift",
];
execFileSync("git", ["-C", repoRoot, "ls-files", "--error-unmatch",
  ...requiredTrackedFiles.map((file) => `artifacts/islamic-prayer/${file}`)], { stdio: "ignore" });

console.log("Release configuration QA passed: permissions, privacy, metadata, sounds, and widget sources are consistent.");
