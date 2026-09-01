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
pnpm --dir artifacts/islamic-prayer run typecheck
pnpm --dir artifacts/islamic-prayer run qa:polar
pnpm --dir artifacts/islamic-prayer run qa:timezone
pnpm --dir artifacts/islamic-prayer run qa:widget
pnpm --dir artifacts/islamic-prayer run qa:notifications
pnpm --dir artifacts/islamic-prayer run qa:hijri
pnpm --dir artifacts/islamic-prayer run qa:release
pnpm --dir artifacts/islamic-prayer exec expo export --platform ios --output-dir /tmp/nuur-ios-export
```

Then verify the locked native project:

```sh
bundle install
cd artifacts/islamic-prayer/ios
bundle exec pod install --deployment
cd ..
xcodebuild -workspace ios/Nuur.xcworkspace -scheme Nuur -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/nuur-derived-data CODE_SIGNING_ALLOWED=NO build
```

The same sequence runs in `.github/workflows/release-readiness.yml`. Submit only a commit for which both jobs pass.
