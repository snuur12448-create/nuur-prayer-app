import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Run on an exported .app (unzip the exported IPA first), not an unsigned
// simulator product. A development-signed archive may be re-signed on export.
const argument = process.argv[2];
if (!argument || argument === "--help") {
  console.log("Usage: node scripts/verify-ios-distribution.mjs /path/to/Payload/Nuur.app");
  process.exit(argument ? 0 : 1);
}
assert.equal(process.platform, "darwin", "Distribution verification requires macOS.");
const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(appRoot, "app.json"), "utf8")).expo;
const appPath = resolve(argument);
assert(appPath.endsWith(".app") && existsSync(appPath), "Supply the exported Nuur.app path.");
const run = (command, args, input) => execFileSync(command, args, { encoding: "utf8", input });
const plist = (path) => JSON.parse(run("plutil", ["-convert", "json", "-o", "-", path]));
const decode = (xml) => JSON.parse(run("plutil", ["-convert", "json", "-o", "-", "--", "-"], xml));

function verifyBundle(path, bundleId, isApp) {
  const info = plist(join(path, "Info.plist"));
  assert.equal(info.CFBundleIdentifier, bundleId, "Unexpected bundle identifier.");
  assert.equal(info.CFBundleShortVersionString, config.version, "Marketing version differs from tracked release.");
  assert.equal(info.CFBundleVersion, config.ios.buildNumber, "Build number differs from tracked release.");
  run("codesign", ["--verify", "--deep", "--strict", path]);
  const entitlements = decode(run("codesign", ["--display", "--entitlements", ":-", path]));
  const profileXml = run("security", ["cms", "-D", "-i", join(path, "embedded.mobileprovision")]);
  // A full provisioning profile contains date/data values that plutil cannot
  // convert to JSON. Extract the specific typed fields before decoding.
  const profileField = (key, format) => run("plutil", ["-extract", key, format, "-o", "-", "--", "-"], profileXml);
  const hasProfileField = (key) => spawnSync("plutil", ["-extract", key, "xml1", "-o", "-", "--", "-"], {
    input: profileXml, encoding: "utf8",
  }).status === 0;
  assert(new Date(profileField("ExpirationDate", "raw").trim()).getTime() > Date.now(), "Provisioning profile has expired.");
  assert(!hasProfileField("ProvisionedDevices") && !hasProfileField("ProvisionsAllDevices"),
    "Export must use App Store distribution, not development, ad hoc or enterprise signing.");
  const allowed = decode(profileField("Entitlements", "xml1"));
  assert.equal(allowed["get-task-allow"], false, "Provisioning profile permits debugging.");
  assert(!entitlements["get-task-allow"], "Exported app permits debugging.");
  assert.equal(entitlements["com.apple.developer.team-identifier"], "FFD8LPJSCS", "Unexpected signing team.");
  assert.equal(allowed["application-identifier"], `FFD8LPJSCS.${bundleId}`, "Profile does not match this app.");
  for (const source of [entitlements, allowed]) {
    assert(source["com.apple.security.application-groups"]?.includes("group.com.nuur.shared"),
      `${bundleId}: shared widget App Group is missing from signature or profile.`);
    if (isApp) {
      assert.equal(source["com.apple.developer.usernotifications.time-sensitive"], true,
        "Time Sensitive Notifications capability is missing.");
      assert.equal(source["com.apple.developer.weatherkit"], true, "WeatherKit capability is missing.");
    }
  }
  assert(existsSync(join(path, "PrivacyInfo.xcprivacy")), "Bundled privacy manifest is missing.");
  console.log(`Verified distribution signature, profile, capabilities and version: ${bundleId}`);
}

verifyBundle(appPath, config.ios.bundleIdentifier, true);
const extensions = readdirSync(join(appPath, "PlugIns")).filter((name) => name.endsWith(".appex"));
assert.equal(extensions.length, 1, "Expected one widget extension.");
verifyBundle(join(appPath, "PlugIns", extensions[0]), `${config.ios.bundleIdentifier}.NuurWidget`, false);
console.log("Distribution verification passed. App Store validation and physical-device QA are separate gates.");
