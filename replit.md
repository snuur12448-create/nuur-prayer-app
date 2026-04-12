# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

### `artifacts/islamic-prayer` (`@workspace/islamic-prayer`)

Comprehensive Islamic prayer mobile app — **Nuur / نور** — built with Expo (React Native). Serves at previewPath `/`.

**Features:**
- **Prayer Times** (tab: Prayer): Accurate 5 daily prayer times + Sunrise using `adhan` v4.4.3 library. Default method: Nuur UK (ISNA base + Fajr 15.5°). Shows next prayer, countdown, progress bar, and Islamic date.
- **Quran Reader** (tab: Quran): Browse 114 surahs, filter by name/meaning/Arabic (1-char queries). **Verse search** (2+ chars): searches all 6,236 verses offline across English translation, Arabic text, and surah names; shows section headers "Surahs / Verses", gold-highlighted matches in results; tapping a verse result opens the surah and auto-scrolls to that ayah. 8 reciters. Verse-by-verse audio with preload. Transliteration. Bookmarks via AsyncStorage.
- **Qibla Compass** (tab: Qibla): SVG compass showing Qibla direction (bearing to Makkah). Animated needle. Distance to Kaaba in km.
- **Duas & Adhkar** (tab: Dua): 5 categories (Morning, Evening, After Prayer, Daily Supplications, Protection). Arabic, transliteration, translation, source.
- **Prayer Tracker** (tab: Tracker): Track 5 daily prayers for any date — past, present or future. Week strip (7-day) with per-prayer dot indicators. Navigate any day with ◄ ► arrows and "Today" shortcut. Shows both Gregorian date and Islamic (Hijri) date. Actual adhan prayer times displayed per row. Checkboxes with colour-coded animated toggle (indigo=Fajr, amber=Dhuhr, green=Asr, orange=Maghrib, violet=Isha). Stats: day streak, week total, daily 0–5 progress bar. Persisted to AsyncStorage under `nuur_prayer_tracker`.
- **99 Names of Allah** (tab: Names): All 99 Asmaul Husna in a searchable grid. Each card: number badge, large Arabic text, transliteration, English meaning. Tap any name to open a detail sheet with: large Arabic (52px), transliteration, phonetic pronunciation guide, meaning, and full description. Search by number, transliteration or meaning. Data in `utils/namesData.ts`.
- **Tasbeeh Counter** (tab: Tasbeeh): Tap counter with haptic feedback, preset dhikr, and reset.
- **Settings** (tab: Settings): All customisation in one place — see below.

**Settings features (`app/(tabs)/settings.tsx`):**
- Dark / Light display mode toggle (persisted)
- 5 accent colour themes: Emerald, Midnight, Desert, Amber, Royal, Rose (all have dark + light variants)
- 13 prayer calculation methods: Nuur UK, ISNA, MWL, Egyptian, Karachi, Umm al-Qura, Dubai, Kuwait, Qatar, Singapore, Turkey, Tehran, Moonsighting Committee
- Asr juristic method: Shafi/Standard or Hanafi
- High latitude rule: Twilight Angle, Middle of Night, Seventh of Night, None
- Time format: 12h or 24h
- **Adhan toggle + 5 style picker** (Makkah, Madinah, Mishari Al-Afasy, Egyptian, Turkish) with preview button
- Prayer notifications toggle (native only)
- About section

**Adhan system:**
- `utils/adhanData.ts` — 5 `AdhanStyle` objects with id, name, arabic, reciter, location, description, audioUrl (islamcan.com CDN)
- `utils/adhanPlayer.ts` — `playAdhanAudio(url, onFinish?)`, `stopAdhanAudio()`, `previewAdhan(url)`. Uses expo-av on native, `new Audio()` on web.
- `components/AdhanOverlay.tsx` — Full-screen overlay with crescent icon, pulsing ring, prayer name in Arabic/English, reciter, stop button. Shown via `AdhanGate` in `_layout.tsx`.
- `context/AppContext.tsx` — `adhanEnabled`, `adhanStyleId`, `toggleAdhan`, `setAdhanStyleId`, `adhanPlaying`, `adhanPrayerName`, `adhanPrayerArabicName`, `adhanCurrentStyle`, `stopAdhan`. Timer interval (15s) checks prayer times and fires adhan when minute matches.

**Key files:**
- `utils/prayerTimes.ts` — adhan.js wrapper. `CalcMethodId`, `MadhabId`, `HighLatRuleId`, `TimeFormat` types exported. `calculatePrayerTimes` accepts all settings as optional params with defaults.
- `utils/audioData.ts` — 8 reciters. CDN types: `verses-quran` (surah/verse path) and `islamic-network` (global ayah num). Sudais uses islamic-network 64kbps; Ibrahim Walk uses 192kbps.
- `context/QuranPlayerContext.tsx` — Native path uses **`react-native-track-player`** (v4) for lock screen / Control Center / AVAudioSession playback category. Web path uses `HTMLAudioElement` + `navigator.mediaSession`. TrackPlayer is dynamically imported (`await import("react-native-track-player")`) so the web bundle stays clean. Lock screen shows: surah Arabic name, verse number, reciter as artist, app icon as artwork. Remote commands: Play, Pause, Skip Next, Skip Previous, Stop all registered. Verse-level reciters pre-load the full queue from the tapped verse to end of surah so auto-advance and skip-next work. Surah-level reciters add a single track. Requires a development build (EAS) — not available in Expo Go.
- `utils/islamicData.ts` — Quran surah list, Dua categories, Islamic reminders, Hijri date conversion
- `utils/hadithData.ts` — 15 Sahih hadiths with Arabic, transliteration, translation, narrator, source, grade. `getDailyHadith()` rotates daily.
- `utils/notifications.ts` — expo-notifications: schedules all 5 prayers for next 7 days
- `utils/calcMethodByCountry.ts` — Maps 80+ ISO country codes → `CalcMethodId`. `suggestCalcMethod(isoCountryCode)` auto-selects the community-standard method on first GPS lock (one-time; never overrides manual choices). Dismissable banner shown on home screen.
- `utils/reviewPrompt.ts` — `recordFirstLaunch()` stores install timestamp on first run; `maybeRequestReview()` triggers native App Store / Play Store review dialog after 5–7 days (once only, platform-gated via `StoreReview.isAvailableAsync()`). Called from `ReviewGate` in `_layout.tsx` on prayer-times load and on AppState `active` events.
- `context/AppContext.tsx` — All app state: location, prayer times, bookmarks, theme, displayMode, calcMethod, madhab, highLatRule, timeFormat, notifications, adhan. All persisted to AsyncStorage.
- `constants/themes.ts` — 5 `ThemeDefinition`s each with `colors` (dark) and `lightColors` (light). `DisplayMode = "dark" | "light"`.
- `components/NuurSplash.tsx` — Branded splash with golden ن, rays, glow rings, "نور / NUUR" text. Shows on app open, fades out after ~2.5s.

**Prayer time notes:**
- adhan.js returns absolute UTC timestamps. `fmtWithTz(d, tz, format)` applies UTC offset manually to avoid browser timezone mismatch.
- NuurUK: `CalculationMethod.NorthAmerica()` + `fajrAngle = 15.5` + `HighLatitudeRule.TwilightAngle`
- `useNativeDriver: false` required for all Animated calls (web compatibility)
- Bismillah stripping: drop first 4 whitespace-split words from verse 1 (surahs ≠ 1 and ≠ 9)
