# NuurWidget — replacement stubs

Apple's `Add Target → Widget Extension` flow generates 4 placeholder Swift
files inside `ios/NuurWidget/` (on the Mac, after `expo prebuild`):

- `AppIntent.swift`
- `NuurWidget.swift`
- `NuurWidgetBundle.swift`
- `NuurWidgetLiveActivity.swift`

The 4 files in this folder are **drop-in replacements** that wire up the real
Nuur card (sky gradient, dashed arc, sun/moon glyph, countdown, Live Activity,
Dynamic Island).

## How to apply on the Mac

1. Pull the latest from GitHub.
2. In Xcode, open each Apple stub file in turn.
3. Open the matching file in this folder (e.g. via Finder).
4. Select-all (`⌘A`) → copy (`⌘C`) → paste over the Xcode file (`⌘A`, `⌘V`).
5. Save (`⌘S`).
6. Repeat for all 4 files.
7. Add the 4 NEW shared files to Xcode (NuurAttributes, SkyBand, CountdownText,
   LiveActivityCard) — right-click `NuurWidget` group → **Add Files to "Nuur"…**
   → navigate to `native/NuurShared`, pick the 4 new files, tick BOTH targets
   (Nuur AND NuurWidgetExtension).
8. Build (`⌘B`) — should succeed.

## Why a separate folder?

Putting these next to the seed files in `native/NuurShared/` would force them
into both targets, but `@main WidgetBundle`, `WidgetConfiguration`, and
`ActivityConfiguration` only compile inside the Widget Extension target.
Keeping them separate avoids "ambiguous reference" errors.
