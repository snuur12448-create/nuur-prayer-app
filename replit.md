# Overview

This project is a pnpm workspace monorepo written in TypeScript, designed to build and deploy a comprehensive Islamic prayer mobile application, **Nuur / نور**, alongside its supporting API server. The core vision is to provide a feature-rich, accurate, and user-friendly mobile experience for Muslims worldwide, encompassing prayer times, Quran reading, Qibla direction, Duas, and more. The API server provides backend services and data synchronization for the mobile app.

The project aims to leverage modern web technologies to deliver a high-quality, performant application with potential for future monetization through premium features, while ensuring core religious functionalities remain freely accessible.

# User Preferences

I prefer iterative development with clear communication at each stage. Please ask before making any major architectural changes or introducing new external dependencies. I value concise explanations and well-documented code.

# System Architecture

The project is structured as a pnpm monorepo, separating deployable applications (`artifacts/`) from shared libraries (`lib/`) and utility scripts (`scripts/`).

**Core Technologies:**
- **Monorepo:** pnpm workspaces
- **Backend:** Node.js 24, Express 5, PostgreSQL, Drizzle ORM, Zod for validation.
- **Frontend (Mobile):** Expo (React Native).
- **TypeScript:** Version 5.9, utilizing composite projects for efficient type-checking across packages.
- **API Codegen:** Orval generates React Query hooks and Zod schemas from an OpenAPI spec.
- **Build Tool:** esbuild for CJS bundles.

**UI/UX Decisions (Nuur App):**
- **Theming:** Dark/Light modes with 5 accent color themes (Emerald, Midnight, Desert, Amber, Royal, Rose).
- **Navigation:** Tab-based navigation for core features (Prayer Times, Quran, Qibla, Dua, Tracker, Names, Tasbeeh, Settings).
- **Visuals:** Custom splash screen with branding. Use of SVG for Qibla compass. Gold highlighting for Quran search results. Color-coded checkboxes for prayer tracking.
- **Audio:** Integrated audio playback for Quran recitation and Adhan, with lock screen controls on native platforms via `react-native-track-player`.
- **Accessibility:** Haptic feedback for Tasbeeh counter.

**Feature Specifications (Nuur App):**
- **Prayer Times:** Accurate calculation using `adhan` library (v4.4.3), configurable methods, juristic methods, and high latitude rules. Displays next prayer, countdown, Islamic date.
- **Quran Reader:** Offline browsing of 114 surahs, comprehensive verse search (Arabic, English, surah names), 8 reciters with verse-by-verse audio, transliteration, and bookmarks (AsyncStorage).
- **Qibla Compass:** SVG-based compass with animated needle, showing direction and distance to Kaaba.
- **Duas & Adhkar:** Categorized collection with Arabic, transliteration, translation, and source.
- **Prayer Tracker:** Daily tracking of 5 prayers, 7-day week strip, Gregorian and Hijri dates, daily and weekly stats.
- **99 Names of Allah:** Searchable grid with detailed descriptions for each name.
- **Tasbeeh Counter:** Tap counter with haptic feedback and preset dhikr.
- **Zakat Calculator:** Annual Zakat calculator with Gold (85g) / Silver (612g) Nisab toggle, GBP/USD currency switch, asset and debt inputs, parchment-styled result card, share via the existing share-card system, and AsyncStorage persistence.
- **Tafsir Layer (Ibn Kathir Abridged, English):** Bottom sheet on every Quran verse card, opened via a `book-open` icon next to share. Surah-scoped fetch + per-surah AsyncStorage cache (key `nuur_tafsir_ibnkathir_v1_{n}`) sourced from Quran.com QDC API (resource id 169). HTML payload parsed in-app by a small block-level regex parser (`utils/tafsirData.ts → parseTafsirHtml`) into `{kind: 'h1'|'h2'|'p', text}` blocks rendered with React Native `<Text>` — no HTML renderer dependency. Hook (`hooks/useTafsir.ts`) loads on surah mount; `getEntry(ayah)` is synchronous after the first round-trip. Sheet (`components/TafsirSheet.tsx`) handles loading / network-error / no-coverage states distinctly, footer always shows the source attribution. Cache survives the abridged edition's per-verse-coverage gaps (some verses legitimately have no entry).
- **Settings:** Comprehensive customization for display mode, themes, prayer calculation methods, Adhan toggles and styles (with preview), and prayer notifications.
- **Adhan System:** 5 distinct Adhan styles with audio playback, full-screen overlay for visual cue. Timer-based notification.
- **Localization:** Automatic suggestion of prayer calculation method based on country code.

**System Design Choices:**
- **Data Persistence:** Drizzle ORM for PostgreSQL in the API, AsyncStorage for local mobile app data.
- **API Design:** RESTful API with Zod for robust request/response validation.
- **Cross-package Dependencies:** TypeScript project references for type safety and efficient builds.
- **Build Process:** `tsc --build --emitDeclarationOnly` for type-checking, esbuild for production bundles.
- **Monetization (Dormant):** RevenueCat integration is pre-wired but inactive, allowing future toggling of premium features without core functionality being paywalled.
- **Premium Share-Card / Wallpaper System (Mockup Sandbox):** 32 components in `artifacts/mockup-sandbox/src/components/mockups/nuur-premium/` — 4 categories (Dua, Ayah, Hadith, Name) × 4 variants (V1/V2/V3/V4) × 2 formats (Share 1:1, Wallpaper 9:16). Shared chrome lives in `dua-templates/_base.tsx` which exports `NuurBrandFooter` (inline `NuurMarkSVG` — transparent gold sun-rays + ن glyph that tints to the `color` prop, so the same mark drops onto any background) and `autoHalo(ink, strength)` (computes a contrasting white/black text-shadow using luminance, so light-bg variants get a subtle white halo and dark-bg variants get a black one). Light-background variants (DuaShare V1/V2/V4, DuaWallpaper V1/V2/V4, HadithShare V3, HadithWallpaper V3, NameWallpaper V4, etc.) use a darkened ink palette (~#26302A / #2A1A0E) plus `autoHalo` for legibility against pastel/cream skies. Tagline alpha is clamped to ≥0.78 inside the footer so "Light for your daily deen" never washes out. Canvas thumbnails live at `artifacts/mockup-sandbox/public/canvas-thumbs/<Name>.jpg` and are referenced by image shapes on the canvas board.
- **Per-prayer Notification Sheet (Compose):** Single grouped card — master toggle + 7 day-chips inline (Friday gold underline), iOS-style segmented Alert Type, collapsible Reciter row + Length toggle, inset Save, live preview chip showing what will fire. Sunrise variant offers silent/notification only and a minutesBefore picker. Component: `PrayerNotifSheet`.
- **First-time Notification Setup (Ritual):** Full-screen 3-step wizard shown once after main onboarding (flag `nuur_notif_ritual_done`). Steps: alert type → reciter → confirm. Apply writes the chosen profile to all 5 daily prayers (sunrise untouched), persisting the merged config to AsyncStorage with awaited writes before flipping the flag (durability-confirmed); on storage failure the overlay stays up so the user can retry. Skip on step 1 also marks complete. Component: `PrayerNotifOnboarding`, mounted in `app/_layout.tsx`.

# Strategic Backlog

Long-running plans that are scoped but not yet implemented. Source: `docs/competitive-analysis.md` (cross-reference of Nuur vs. the 8 most-installed apps in the category).

- **Top-5 gap-closers** — see `docs/competitive-analysis.md` for the full ranked list. Status:
  1. iOS + Android home-screen widgets — scoped (in chat history; full plan to be saved to `docs/ios-widget-plan.md`); on hold pending 4 design decisions.
  2. Tafsir layer (Ibn Kathir EN) — scoped in `docs/tafsir-plan.md`; ready to start, ~2–2.5 days, fully in-Replit.
  3. Apple Watch app — not scoped; defer until iOS widget ships (shares App Group + prebuild plumbing).
  4. Zakat calculator — ✅ shipped.
  5. Ramadan dashboard — not scoped; hard deadline mid-Jan 2027 (Ramadan ~Feb 2027) to catch the install spike.
- **Home-screen Verse of the Day:** Rendered as a "Mushaf leaf" — cream parchment LinearGradient with a hairline gold-brown inset frame, surah-band header, optional bismillah line, Amiri Quran verse text, and an ornate U+FD3E/U+FD3F ﴿n﴾ stamp wrapping an Eastern Arabic numeral. Component is `MushafLeafVerse` (memoized; verse changes once daily). Outer hairline + shadow are theme-tinted (`colors.tint`/`colors.glow`) so the constant cream paper reads cleanly across all 5 accent themes.
- **Premium share / wallpaper library (`components/share-card/`):** 16 photographic theme presets (4 visual variants × 4 content kinds — `dua-v1..v4`, `ayah-v1..v4`, `hadith-v1..v4`, `name-v1..v4`) with 32 bundled background plates under `assets/share-premium/<kind>-<share|wallpaper>-vN.png`. Each theme renders as a 1 : 1 share card (1080×1080) or 9 : 16 wallpaper (1170×2080); the wallpaper aspect leaves room above the centred typographic cluster for the iOS lock-screen clock. `ShareCard.tsx` is a unified renderer that paints the photo plate, layers optional `expo-linear-gradient` overlays (linear or pseudo-radial scrims), draws an optional arched ornament for Names of Allah, lays out the content cluster in a kind-aware order (dua/ayah: Arabic → rule → English-italic → source · hadith: English → rule → Arabic → source · name: Arabic → Latin → meaning), and pins the NUUR brandmark + wordmark + tagline at the bottom. The brandmark is an inline `react-native-svg` port of the web `NuurMarkSVG`. Typography uses `AmiriQuran_400Regular` for Arabic, `CormorantGaramond_400/500/600/700` (incl. Italic) for serif/title text, and `Inter_*` for the eyebrow / source caps line. The picker (`ShareThemePicker`) is a swipeable horizontal pager with a Card / Wallpaper segmented toggle, dot indicator, Save / Share actions (`expo-media-library` + `expo-sharing`), and a per-kind theme bucket via `getThemesForKind` (adhkar→dua, quran→ayah). Default theme is auto-selected from `(kind, current prayer window)` in `autoSelect.ts` (Fajr→V1, Dhuhr→V4, Asr→V3, Maghrib/Isha→V2). Per-kind last-pick is persisted under `nuur:share:lastTheme:<kind>`; legacy single-key + legacy IDs are tolerated and silently fall back when unrecognised. Legacy `ContentShareSheet` and `AyahShareSheet` are unchanged thin wrappers — no call-site changes were required.
- **Premium share-card / wallpaper exploration (`artifacts/mockup-sandbox/src/components/mockups/nuur-premium/`):** Photographic-background designs (text floats directly on the photo — NO card panels) covering 4 categories × 2 formats: share cards (1:1) and wallpapers (9:16) for Dua/Adhkar, Ayahs, Hadiths, and 99 Names. Each of the 8 base components has 3 atmospheric variants (V2/V3/V4) sharing the original's typography/text/footer but swapping background image and overlay/ink tones for different times-of-day or moods (e.g. AyahShare → pre-dawn / milky way / sunset). Backgrounds live under `public/images/nuur-premium/{card}-vN-bg.png`. Rendered on the workshop canvas in a 4×4 grid (rows: Original, V2, V3, V4 × cols: Dua, Ayah, Hadith, Name) for both share and wallpaper sections. Components share a consistent template: full-bleed `<img>` background, radial-gradient vignette, content stack (Arabic + translation + source line), brand mark + "Light for your daily deen" tagline. These are exploration mockups, not yet integrated into the mobile share library.

# External Dependencies

- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **API Framework:** Express
- **Validation:** Zod
- **Mobile Framework:** Expo (React Native)
- **Prayer Time Calculations:** `adhan` library (v4.4.3)
- **API Codegen:** Orval
- **Audio Playback (Native):** `react-native-track-player`
- **Notifications:** `expo-notifications`
- **App Store Reviews:** `expo-linking` for `StoreReview`
- **Monetization (Dormant):** RevenueCat (`react-native-purchases`, `@replit/revenuecat-sdk`)
- **Asset Loading:** `expo-av`