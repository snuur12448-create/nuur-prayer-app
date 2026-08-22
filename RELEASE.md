# Reproducible release check

Nuur releases are built from a clean Git commit. The JavaScript and iOS dependency graphs are locked by `pnpm-lock.yaml` and `artifacts/islamic-prayer/ios/Podfile.lock`.

## Required tools

- Node.js 24
- pnpm 11.0.7
- Xcode with an iOS simulator runtime
- CocoaPods

## Verification

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --dir artifacts/islamic-prayer run typecheck
pnpm --dir artifacts/islamic-prayer run qa:polar
pnpm --dir artifacts/islamic-prayer exec expo export --platform ios --output-dir /tmp/nuur-ios-export
```

Then verify the locked native project:

```sh
cd artifacts/islamic-prayer/ios
pod install --deployment
cd ..
xcodebuild -workspace ios/Nuur.xcworkspace -scheme Nuur -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/nuur-derived-data CODE_SIGNING_ALLOWED=NO build
```

The same sequence runs in `.github/workflows/release-readiness.yml`. Submit only a commit for which both jobs pass.
