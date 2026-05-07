# Nuur — Swift Widget & Live Activity Handoff

This doc maps the **mockup-sandbox/widget-v4** designs (the visual spec) to the
SwiftUI / WidgetKit / ActivityKit code you'll write in Xcode.

Mockup source of truth:
`artifacts/mockup-sandbox/src/components/mockups/widget-v4/`

---

## 1. Targets to add in Xcode

Add to the existing iOS app target produced by `expo prebuild`:

| Target                       | Type                       | Surfaces                                                    |
| ---------------------------- | -------------------------- | ----------------------------------------------------------- |
| `NuurWidgetExtension`        | Widget Extension           | Home_Small, Home_Medium, Home_Large, Home_Large_Arc, Lock_* |
| `NuurLiveActivity` (in same) | ActivityConfiguration      | LA_*, DI_Compact, DI_Expanded, DI_Minimal                   |
| `NuurShared`                 | Framework (or shared file) | Constants, palette, glyph views, `arcPoint`                 |

Use **App Group** `group.com.nuur.shared` so the Expo app can write the next
prayer state and the widget/LA can read it.

---

## 2. Component → SwiftUI mapping

### Lock-screen / banner Live Activity (`LA_*.tsx`)
- **SwiftUI:** `ActivityConfiguration<NuurAttributes>` → `View` returned from
  the closure.
- **Width:** matches lock-screen banner (~360 pt). Height ~160 pt, T-0 ~178 pt.
- **Body = `LiveActivityCard`** (one view, all 5 states + 2 skins).

### Dynamic Island
- `dynamicIsland: { region in ... }`
  - `expanded` → reuse `LiveActivityCard` (compressed height 130–140 pt).
  - `compactLeading` → SunGlyph/MoonGlyph (12 pt).
  - `compactTrailing` → countdown text only (e.g. `3h 22m`).
  - `minimal` → SunGlyph/MoonGlyph (10 pt) + 1-char accent dot.

### Home widgets (`WidgetConfiguration`)
- `Home_Small`   → `.systemSmall`
- `Home_Medium`  → `.systemMedium`
- `Home_Large`   → `.systemLarge` (timeline list)
- `Home_Large_Arc` → `.systemLarge` variant; user toggles via Configuration intent

---

## 3. Constants (port these verbatim)

From `_shared.tsx`. Keep names; prefix with `Nuur` in Swift.

```swift
enum NuurTheme {
    // Surface
    static let bg              = Color(hex: 0x0A1A0E)
    static let surface         = Color(hex: 0x111F14)
    static let surfaceElevated = Color(hex: 0x172B1B)
    static let prayerCard      = Color(hex: 0x152A1A)
    static let border          = Color(hex: 0x1F3526)
    // Text
    static let text            = Color(hex: 0xF0EDE5)
    static let textSecondary   = Color(hex: 0x8FA99A)
    static let textMute        = Color.white.opacity(0.45)
    // Accents (urgency ramp)
    static let gold            = Color(hex: 0xF4C842)
    static let goldLight       = Color(hex: 0xF9D97A)
    static let amber           = Color(hex: 0xF9A641)
    static let red             = Color(hex: 0xE55555)
}

enum NuurFont {
    // Bundle Fraunces + Manrope + Amiri Quran in the widget extension's
    // Info.plist UIAppFonts. SF fallback is fine for system rendering.
    static let serif  = "Fraunces"
    static let sans   = "Manrope"
    static let arabic = "AmiriQuran"
}
```

### Sky palettes (in-app dome, 4-stop gradients)

```swift
enum SkyPalette {
    static let fajr    = [0x06081C, 0x0E0F2A, 0x2D1A3A, 0x4A2A3E]
    static let sunrise = [0x1A2B4A, 0x3D4F70, 0xA87B5A, 0xE4A579]
    static let dhuhr   = [0x1B3A5E, 0x3A6B9E, 0x7BB0DC, 0xB5DBED]
    static let asr     = [0x2A2545, 0x5A3E5A, 0xA06840, 0xD89055]
    static let maghrib = [0x1A1530, 0x3A1F2E, 0x7A3826, 0xC26835]
    static let isha    = [0x02030E, 0x060820, 0x0A0E2A, 0x101638]
}
```

Apply with `LinearGradient(colors:, startPoint: .top, endPoint: .bottom)` at
stops `[0, 0.4, 0.8, 1]`. The bottom 30 % fades to transparent so the sky
bleeds into the card surface (no hard horizon line).

---

## 4. State machine (mirror `State` + `Skin` exactly)

```swift
enum Skin { case day, night }
enum NuurState { case normal, t30, t10, t1, t0 }
```

| State    | Eyebrow                         | Accent      | Sky blend (day)        | Sky blend (night)        | Glyph t |
| -------- | ------------------------------- | ----------- | ---------------------- | ------------------------ | ------- |
| normal   | `TO ASR` / `TO FAJR`            | gold        | dhuhr                  | isha                     | 0.55    |
| t30      | same                            | amber       | dhuhr→asr × 0.35       | isha→fajr × 0.40         | 0.68    |
| t10      | same                            | goldLight   | dhuhr→asr × 0.70       | isha→fajr × 0.75         | 0.78    |
| t1       | same                            | gold        | asr                    | fajr                     | 0.86    |
| t0       | `● NOW · TIME TO PRAY`          | gold        | asr→maghrib × 0.35     | fajr→sunrise × 0.35      | 0.92    |

Glow ring (`accent` color, soft) ONLY on **t1** and **t30**.

Sky band height per state: 62 / 80 / 68 / 74 / 102 pt (normal/t30/t10/t1/t0).

---

## 5. Arc geometry (Home_Large_Arc + sky-band glyph)

The dashed arc is a shallow slice of a huge circle whose true apex is **above**
the visible band. The glyph rides a **clean inverted parabola** that hugs what
the eye reads as the arc:

```swift
/// t in [0, 1]  →  point in (width × skyHeight)
func arcPoint(width w: CGFloat, skyHeight h: CGFloat, t: CGFloat) -> CGPoint {
    let x = w * (0.08 + 0.84 * t)
    let k = 2 * t - 1                           // -1 at left, 0 apex, +1 right
    let y = h * (0.15 + 0.55 * k * k)
    return CGPoint(x: x, y: y)
}
```

For `Home_Large_Arc`: 6 prayer dots at `t = [0.04, 0.22, 0.50, 0.72, 0.88, 0.99]`,
`NOW_T` is computed live from current time / next prayer time. Highlight the
next prayer's dot in `accent(state)` and label it gold.

Dashed arc stroke: `strokeDasharray = [2, 5]`, opacity 0.85, color
`day: rgba(255,228,181,0.22)` / `night: rgba(201,212,240,0.20)`.

---

## 6. Glyphs (SunGlyph / MoonGlyph)

24×24 SwiftUI views, three concentric circles + `RadialGradient`. Port directly
from `_shared.tsx` lines 59–96. `intensity` scales the inner stop opacities
(1.0 normal → 1.35 at t0). MoonGlyph uses an offset cut-circle filled with the
top-of-sky color (`getSkyHorizon(skin, state)`) to carve the crescent.

---

## 7. ActivityAttributes (the Expo ↔ Live Activity contract)

```swift
struct NuurAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var prayerEn: String        // "Asr"
        var prayerAr: String        // "العصر"
        var nextAtISO: String       // "2026-05-07T16:34:00+01:00"
        var skin: String            // "day" | "night"
        var state: String           // "normal" | "t30" | "t10" | "t1" | "t0"
    }
    var location: String            // "London, UK"
    var hijri: String               // "18 Dhū al-Qaʿdah 1446"
}
```

The Expo side computes `state` from `nextAt - now`:
- `> 30 min` → `normal`
- `≤ 30 min` → `t30`
- `≤ 10 min` → `t10`
- `≤ 1 min`  → `t1`
- `≤ 0`     → `t0` (fires for 90 s, then ends activity)

`skin` is `day` if current time is between sunrise and maghrib, else `night`.

---

## 8. Widget timeline (Home_*)

`TimelineProvider` returns one entry per **state transition** for the next
24 h:
- `now`, `next - 30m`, `next - 10m`, `next - 1m`, `next` (= t0), `next + 90s`.

Use `entry.date` so iOS schedules the redraw. No per-second updates; the
countdown text is static per snapshot, matching the mockups.

---

## 9. Shared data path (Expo → Swift)

1. Expo writes JSON to App Group via `expo-shared-group-preferences` (or a
   tiny native module wrapping `UserDefaults(suiteName:)`).
2. Widget reads in `getTimeline` from `UserDefaults(suiteName: "group.com.nuur.shared")`.
3. When prayer settings or location change, Expo calls
   `WidgetCenter.reloadAllTimelines()` via the same native module.

For Live Activity, Expo starts the activity with
`Activity<NuurAttributes>.request(...)` from a custom Expo module on first
prayer-due-soon event; updates with `activity.update(...)` on each state
transition; ends with `activity.end(.dismissalPolicy(.after(now + 90s)))`.

---

## 10. File map (suggested)

```
ios/NuurWidget/
  NuurWidgetBundle.swift          // @main WidgetBundle
  Home/
    HomeSmallWidget.swift         // ← Home_Small.tsx
    HomeMediumWidget.swift        // ← Home_Medium.tsx
    HomeLargeWidget.swift         // ← Home_Large.tsx
    HomeLargeArcWidget.swift      // ← Home_Large_Arc.tsx
    PrayerArcView.swift           // arc + dots, shared by both Large variants
  LiveActivity/
    NuurLiveActivity.swift        // ActivityConfiguration
    LiveActivityCard.swift        // ← LiveActivityCard in _shared.tsx
    DynamicIsland.swift           // expanded / compact / minimal regions
  Shared/
    NuurAttributes.swift          // ContentState (sec. 7)
    NuurTheme.swift               // colors + fonts (sec. 3)
    SkyPalette.swift              // gradients (sec. 3)
    SkyBand.swift                 // ← SkyBand in _shared.tsx
    SunGlyph.swift / MoonGlyph.swift
    ArcMath.swift                 // arcPoint, glyphForState (sec. 5)
    StateMachine.swift            // accent, eyebrow, palette blend (sec. 4)
    PrayerStore.swift             // App-Group reader
```

---

## 11. Build order (recommended)

1. **Shared/** layer — port constants, palettes, glyphs, `arcPoint`. Verify in
   an Xcode preview that one `LiveActivityCard` renders identically to the
   mockup at `state=normal, skin=day`.
2. Cycle through all 10 states (5 × 2 skins) in previews — match the mockup
   row screenshots one-by-one before touching anything else.
3. Wire `ActivityConfiguration` and trigger from a debug button in the Expo
   app via a tiny Expo native module.
4. Add Dynamic Island regions (cheapest visual win after LA works).
5. Home widgets — small first, then arc.
6. App Group plumbing + `WidgetCenter.reloadAllTimelines()`.
7. Real prayer-time engine integration (already exists in the Expo app —
   reuse Adhan.js results, write to App Group on every settings change).

---

## 12. Gotchas

- Widget extensions can't run JS — everything renders from cached App Group
  data. Compute prayer times in Expo, write the next 24 h of transitions.
- Live Activities have a **12-hour hard cap**; restart the activity if it's
  still alive at expiry.
- Custom fonts in widget extensions need `UIAppFonts` in the *extension's*
  Info.plist, not just the app's.
- `RadialGradient` in SwiftUI doesn't support per-stop opacity directly — use
  `Gradient.Stop(color: .white.opacity(x), location: y)`.
- Sky band has rounded top corners only (`borderTopLeftRadius`,
  `borderTopRightRadius`) — use `clipShape(.rect(topLeadingRadius:22, topTrailingRadius:22))`.
- The dashed arc uses `preserveAspectRatio="none"` (stretches horizontally) —
  in SwiftUI use a `Path` parameterised by the actual width.

---

## 13. Where to look for each spec

| Need                       | File                                           |
| -------------------------- | ---------------------------------------------- |
| Card layout, T-0 ceremony  | `_shared.tsx` `LiveActivityCard`               |
| All gradients              | `_shared.tsx` `SKY_PALETTE`, `paletteForState` |
| Sun/Moon SVG               | `_shared.tsx` `SunGlyph`, `MoonGlyph`          |
| Arc math                   | `_shared.tsx` `arcPoint`, `glyphForState`      |
| Per-state eyebrow/accent   | `_shared.tsx` `accent`, `eyebrow`              |
| Home Large timeline list   | `Home_Large.tsx`                               |
| Home Large arc variant     | `Home_Large_Arc.tsx`                           |
| Dynamic Island layouts     | `DI_Compact.tsx`, `DI_Expanded.tsx`, `DI_Minimal.tsx` |
| Lock-screen banner states  | `LA_Normal_Day.tsx` ... `LA_T0_Night.tsx`      |

Live previews on canvas (mockup-sandbox dev server) show every variant rendered
1:1 — use those as the visual diff target while building Swift.
