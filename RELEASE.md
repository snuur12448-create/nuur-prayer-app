# Reproducible release check

Nuur releases are built from a clean Git commit. The JavaScript, Ruby, and iOS dependency graphs are locked by `pnpm-lock.yaml`, `Gemfile.lock`, and `artifacts/islamic-prayer/ios/Podfile.lock`.

`artifacts/islamic-prayer` is the only Expo/EAS app root. Run every `expo` and `eas` command from that directory. The repository root intentionally has no `app.json` or `eas.json`; adding either would create a competing app identity and fail release QA.

## Required tools

- Node.js 24
- pnpm 11.0.7
- Ruby 3.3.12
- Bundler
- Xcode with an iOS simulator runtime
- CocoaPods 1.16.2 (installed through Bundler)

## Verification

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm run qa:security
pnpm --dir artifacts/islamic-prayer run typecheck
pnpm --dir artifacts/islamic-prayer run qa:polar
pnpm --dir artifacts/islamic-prayer run qa:timezone
pnpm --dir artifacts/islamic-prayer run qa:prayer-reference
pnpm --dir artifacts/islamic-prayer run qa:widget
pnpm --dir artifacts/islamic-prayer run qa:notifications
pnpm --dir artifacts/islamic-prayer run qa:quran
pnpm --dir artifacts/islamic-prayer run qa:hijri
pnpm --dir artifacts/islamic-prayer run qa:reader
pnpm --dir artifacts/islamic-prayer run qa:audio
pnpm --dir artifacts/islamic-prayer run qa:background
pnpm --dir artifacts/islamic-prayer run qa:ramadan
pnpm --dir artifacts/islamic-prayer run qa:health
pnpm --dir artifacts/islamic-prayer run qa:data-controls
pnpm --dir artifacts/islamic-prayer run qa:store-readiness --inventory-only
pnpm --dir artifacts/islamic-prayer run qa:release
pnpm --dir artifacts/islamic-prayer exec expo export --platform ios --output-dir /tmp/nuur-ios-export
```

Then verify the locked native project:

```sh
bundle install
cd artifacts/islamic-prayer/ios
bundle exec pod install --deployment
cd ..
pnpm run qa:backup-crypto
pnpm run qa:shared-data
xcodebuild -workspace ios/Nuur.xcworkspace -scheme Nuur -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/nuur-derived-data CODE_SIGNING_ALLOWED=NO build
```

The same sequence runs in `.github/workflows/release-readiness.yml`. Submit only a commit for which both jobs pass. A simulator build is not evidence of distribution signing or delivery of notifications on a phone.

## Signed iOS release

Use a fresh clone of the release commit. The development checkout can contain local Swift replacements and patch archives that must not be included in the release upload.

The app supports iOS 16.2 and later; its home/lock screen widgets require iOS 17 or later. Keep that distinction in the store listing. Current release candidate: 1.0.0, build 3. Confirm that this build number has not already been uploaded before submission; update the Expo configuration, native Info.plist and both native targets together for subsequent builds.

In Apple Developer, both `com.nuur.islamicprayer` and `com.nuur.islamicprayer.NuurWidget` need `group.com.nuur.shared`. The main app also needs Time Sensitive Notifications and WeatherKit. Development signing alone does not establish App Store distribution readiness.

From the app directory, with the release team's account configured in Xcode:

```sh
xcodebuild -workspace ios/Nuur.xcworkspace -scheme Nuur -configuration Release -destination 'generic/platform=iOS' -archivePath /tmp/Nuur-build3.xcarchive -allowProvisioningUpdates archive
xcodebuild -exportArchive -archivePath /tmp/Nuur-build3.xcarchive -exportPath /tmp/Nuur-build3-export -exportOptionsPlist ios/ExportOptions.plist -allowProvisioningUpdates
```

Extract the exported IPA to a temporary directory, then verify the exported distribution app:

```sh
pnpm run qa:distribution /path/to/extracted/Payload/Nuur.app
```

This checks the actual app and extension signatures, non-development profiles, profile expiry, team, bundle/build identifiers, privacy manifests, App Group, Time Sensitive Notifications and WeatherKit. Validate the export in App Store Connect before uploading to TestFlight. Exporting does not publish the app.

## Physical-device release gate

Record device/iOS version, app build, selected location, calculation method, and test time. Test both an upgrade over an existing Xcode build and a fresh TestFlight install on a separate device/simulator; do not delete someone's existing app data to simulate a fresh install.

- Onboarding: location allowed, denied and skipped; manual city search; relaunch before completion; notification permission allowed and denied. Confirm the fallback location and method are visible and appropriate.
- Prayer times: compare against the chosen local authority using the same method, madhab and offsets. Check remote location/timezone, DST, midnight, Ramadan and polar estimates. A finite-time test is not scholarly approval of a calculation method.
- Notifications: upgrade with legacy UUID reminders queued, open once, then use Settings → Check Prayer Alerts. Require zero duplicates and nonzero actual prayer alerts. With advance reminders Off, receive one alert at the prayer time. With 15 minutes enabled, receive one preparation alert and one actual prayer alert. Change method/location/offsets, revoke permission in Settings, toggle alerts rapidly, and verify the new queue and sounds while locked.
- Widgets: install all home and lock screen families, cross Isha→Fajr and midnight with the app unopened for 48 hours, then continue for eight days to cross the seven-day timeline reload. Repeat relevant cases with Low Power Mode, Background App Refresh off, reboot and force-quit. Verify countdown at the exact prayer boundary. Automated Swift tests cover expired countdowns and cache expiry; real time testing remains necessary.
- Quran: offline text, all surah boundaries, rapid play/skip/pause, reciter change, network loss/retry, background audio, calls/headphone interruptions and lock-screen controls. The content provenance manifest records precisely what was checked and must not be represented as independent scholarly certification.
- Privacy: confirm only intended permissions are requested; check city/mosque/weather disclosures and the public privacy-policy link. Ensure App Store Connect declarations match the current app and third-party services.
- Data controls: on a disposable test installation, export an encrypted backup, restore it, reject a wrong password and modified file, and interrupt a restore/reset then relaunch. Never use a user's real installation to test destructive reset. Confirm reminders remain off after restore and that the widget does not repopulate stale data before onboarding finishes.

iOS decides whether to grant background execution. Prayer alerts are a finite rolling queue, replenished on foreground and when background work runs. Widgets save 35 days and preload seven-day native timelines; exhausted caches show a refresh prompt. Neither feature promises indefinite updates after force-quit, disabled background refresh, or travel without opening the app.

Build 3 uses Expo BackgroundTask (not deprecated BackgroundFetch). Its 60-minute minimum interval is a request, not a timer guarantee. App Health reports the native pending notification queue and shared widget cache, not proof of notification delivery or when iOS last rendered a widget.

Encrypted backup/restore and clear-data controls require the native iOS build. Backup files contain allowlisted personal data encrypted through Apple CryptoKit/CommonCrypto; they exclude installation/purchase identity, downloaded content, audio, native alert requests and shared widget adhkar counts. Passwords are never stored. Restore/reset drains audio and notification work, blocks late writes, journals the change and reloads JavaScript before resuming providers. File sharing saves only encrypted temporary data; users control its destination. An exported file is not deleted by resetting Nuur.

Quran Foundation word-by-word and tafsir are explicitly online-only in this candidate; the old provider-specific caches are removed, not user bookmarks or bundled Quran text. Offline support for those resources requires developer access and a Content Sync implementation that follows the provider's correction/synchronization rules. Online-only operation does not resolve independent rights or API-access approval gates.

## Store and content information requiring owner confirmation

- App Store description, subtitle, screenshots, age rating, support URL, privacy URL, review contact/notes and export-compliance answers.
- Privacy nutrition labels consistent with the actual third-party services receiving coordinates, searches, IP addresses and requested content.
- Rights and attribution for bundled adhan recordings, English translations, tafsir and other third-party content. Existing attribution does not establish permission to redistribute.
- Regional prayer references and Hijri/moon-sighting guidance. Calendar event dates are calculated estimates and users should follow their local authority.
- Umm al-Qura preserves the existing fixed 90-minute Isha interval by default. Settings offers fixed 90, fixed 120, or an explicitly labelled Umm al-Qura calendar estimate (120 on Ramadan nights, 90 otherwise). Calendar selection uses the night beginning at Maghrib, not the previous daytime date. Unsupported calendar engines disclose a 90-minute fallback. Local moon-sighting/timetable guidance remains authoritative; changing this setting does not require an app update.

`release/content-rights.json` inventories sources, asset hashes and missing rights evidence. `release/store-readiness.json` records owner and real-device gates. `qa:store-readiness --inventory-only` verifies the records, not publishing permission. Before any public upload, run the strict command without that flag; it intentionally fails while approvals are unresolved. Rights are currently unconfirmed, so public release is blocked regardless of build success.

Do not mark these external gates passed merely because automated CI is green.
