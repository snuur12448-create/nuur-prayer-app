# NuurShared — Swift seed files

These files are **starter Swift code** for the iOS Widget Extension. They live
in `native/NuurShared/` (outside any folder called `ios/`) so they (a) survive
future `expo prebuild --clean` runs and (b) aren't blocked by the project's
`.gitignore` rule that excludes any `ios/` folder.

## How to use on the Mac

1. Open `ios/Nuur.xcworkspace` in Xcode.
2. File → New → Target → **Widget Extension**, name it `NuurWidget`,
   check **Include Live Activity**.
3. In the Project Navigator, right-click the `NuurWidget` group →
   **Add Files to "Nuur"…** and pick this entire `NuurShared` folder.
   In the dialog: **uncheck** "Copy items if needed", check **NuurWidget**
   AND **Nuur** under "Add to targets" (so both can use it).
4. Build. Should compile without changes.

After that, follow `SWIFT_WIDGET_HANDOFF.md` (in the islamic-prayer artifact
root) for the full porting plan.

## What's in here

- `NuurTheme.swift` — colors, fonts, app group identifier
- `SkyPalette.swift` — the 6 prayer-time gradient palettes + blend math
- `NuurState.swift` — State / Skin enums, accent/eyebrow/glyph-t tables
- `ArcMath.swift` — `arcPoint(width:skyHeight:t:)` — the arc curve formula
- `Glyphs.swift` — `SunGlyph` and `MoonGlyph` SwiftUI views

That's the entire "Shared" layer from §11 of the handoff doc. Once these
compile, you can start building `LiveActivityCard`, `SkyBand`, etc. on top.
