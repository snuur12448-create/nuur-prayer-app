import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(appRoot, "..", "..");
const read = (...parts) => readFileSync(join(appRoot, ...parts), "utf8");
const appConfig = JSON.parse(read("app.json")).expo;
const easConfig = JSON.parse(read("eas.json"));

const RELEASE_IDENTITY = {
  iosBundleIdentifier: "com.nuur.islamicprayer",
  androidPackage: "com.nuur.islamicprayer",
  easProjectId: "a884ac11-7548-4c3a-9b03-da8203c70865",
};

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
check(appConfig.ios.bundleIdentifier === RELEASE_IDENTITY.iosBundleIdentifier,
  "Unexpected iOS bundle identifier.");
check(appConfig.android.package === RELEASE_IDENTITY.androidPackage,
  "Unexpected Android package identifier.");
check(appConfig.extra?.eas?.projectId === RELEASE_IDENTITY.easProjectId,
  "Unexpected EAS project identifier.");
check(!existsSync(join(repoRoot, "app.json")),
  "Repository root must not contain a competing Expo app.json.");
check(!existsSync(join(repoRoot, "eas.json")),
  "Repository root must not contain a competing EAS configuration.");
check(easConfig.cli?.version === ">= 18.3.0", "EAS CLI version requirement changed unexpectedly.");
check(easConfig.cli?.requireCommit === true, "EAS builds must require a committed worktree.");
check(easConfig.cli?.appVersionSource === "local",
  "Release versions must come from tracked local project files.");
check(!easConfig.build?.production?.autoIncrement,
  "Production build numbers must be explicitly committed, not auto-incremented remotely.");

const info = appConfig.ios.infoPlist;
check(info.NSLocationWhenInUseUsageDescription, "Foreground location purpose string is required.");
check(!("NSLocationAlwaysUsageDescription" in info), "Always-location access is not used.");
check(!("NSLocationAlwaysAndWhenInUseUsageDescription" in info), "Always-location access is not used.");
check(!("NSCameraUsageDescription" in info), "Camera access is not used.");
check(!("NSPhotoLibraryUsageDescription" in info), "Photo-library read access is not used.");
check(info.NSPhotoLibraryAddUsageDescription, "Photo add-only purpose string is required.");
check(JSON.stringify(info.UIBackgroundModes) === JSON.stringify(["audio", "processing"]),
  "Only audio playback and the registered widget background task may run in the background.");
check(JSON.stringify(info.BGTaskSchedulerPermittedIdentifiers) === JSON.stringify(["com.expo.modules.backgroundtask.processing"]),
  "The Expo background-task worker identifier must match the registered native implementation.");
check(appConfig.plugins.includes("expo-background-task"), "Background task config plugin is missing.");
check(pluginConfig("expo-audio").microphonePermission === false &&
  pluginConfig("expo-audio").recordAudioAndroid === false &&
  pluginConfig("expo-audio").enableBackgroundRecording === false,
  "Audio playback must not introduce recording permissions or background recording.");

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
  "<string>fetch</string>",
]) {
  check(!nativeInfo.includes(forbidden), `Native Info.plist still contains ${forbidden}.`);
}
check(nativeInfo.includes("<string>Dark</string>"), "Native release appearance must be dark.");
check(nativeInfo.includes("<string>processing</string>") &&
  nativeInfo.includes("com.expo.modules.backgroundtask.processing"), "Native background-task configuration is missing.");
check(nativeInfo.includes(`<string>${appConfig.version}</string>`), "Native and Expo versions differ.");
check(nativeInfo.includes(`<string>${appConfig.ios.buildNumber}</string>`), "Native and Expo build numbers differ.");

const entitlements = read("ios", "Nuur", "Nuur.entitlements");
check(appConfig.ios.entitlements["com.apple.developer.weatherkit"] === true &&
  entitlements.includes("com.apple.developer.weatherkit"), "WeatherKit must be declared in both native and Expo entitlements.");
check(!read("app", "hadiths.tsx").includes("EXPO_PUBLIC_SUNNAH_API_KEY"),
  "Private hadith credentials must not be embedded in the app.");
check(!pluginConfig("expo-router").origin, "Do not ship a development router origin.");
check(!entitlements.includes("aps-environment"), "Remote-push entitlement is unused by this local-notification app.");
check(entitlements.includes("group.com.nuur.shared"), "Main app App Group entitlement is missing.");
const widgetEntitlements = read("ios", "NuurWidgetExtension.entitlements");
check(widgetEntitlements.includes("group.com.nuur.shared"), "Widget App Group entitlement is missing.");

const appPrivacy = read("ios", "Nuur", "PrivacyInfo.xcprivacy");
check(appPrivacy.includes("1C8F.1"), "App privacy manifest must declare App Group UserDefaults reason 1C8F.1.");
// CocoaPods also merges CA92.1 for libraries' app-private preferences. That
// reason is valid alongside (but cannot replace) our App Group reason 1C8F.1.
check(appPrivacy.includes("NSPrivacyCollectedDataTypePreciseLocation"),
  "App privacy manifest must disclose precise location sent for location-based services.");
const widgetPrivacy = read("ios", "NuurWidget", "PrivacyInfo.xcprivacy");
check(widgetPrivacy.includes("1C8F.1"), "Widget privacy manifest must declare App Group UserDefaults.");
check(!widgetPrivacy.includes("NSPrivacyCollectedDataTypePreciseLocation"),
  "Widget must not claim that it collects precise location.");

const project = read("ios", "Nuur.xcodeproj", "project.pbxproj");
check(project.includes(String.raw`export PROJECT_ROOT=\"$(cd \"$PROJECT_DIR/..\" && pwd -P)\"`),
  "Xcode must canonicalize its project path to support symlinked clean checkouts.");
check(project.includes(String.raw`export ENTRY_FILE=\"$(cd \"$(dirname \"$ENTRY_FILE\")\" && pwd -P)/$(basename \"$ENTRY_FILE\")\"`),
  "Xcode must canonicalize absolute entry paths before invoking Metro.");
const metroConfig = read("metro.config.js");
check(metroConfig.includes("const projectRoot = __dirname;") && !metroConfig.includes("process.env.PROJECT_ROOT"),
  "Metro must retain Node's physical project root, not Xcode's symlink spelling.");
check((project.match(/PRODUCT_BUNDLE_IDENTIFIER = com\.nuur\.islamicprayer;/g) ?? []).length === 2,
  "Native iOS app bundle identifiers differ from the canonical release identity.");
check((project.match(/PRODUCT_BUNDLE_IDENTIFIER = com\.nuur\.islamicprayer\.NuurWidget;/g) ?? []).length === 2,
  "Native widget bundle identifiers differ from the canonical release identity.");
const nativeMarketingVersion = `MARKETING_VERSION = ${appConfig.version};`;
check(project.split(`CURRENT_PROJECT_VERSION = ${appConfig.ios.buildNumber};`).length - 1 === 4,
  "App and widget build numbers must match the Expo build number.");
check(!read("ios", "Nuur.xcodeproj", "xcshareddata", "xcschemes", "Nuur.xcscheme").includes("NuurTests.xctest"),
  "The shared scheme must not reference a nonexistent test target.");
check(project.split(nativeMarketingVersion).length - 1 === 4,
  "App and widget marketing versions must match the Expo version in Debug and Release.");
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
