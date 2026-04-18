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
- **Settings:** Comprehensive customization for display mode, themes, prayer calculation methods, Adhan toggles and styles (with preview), and prayer notifications.
- **Adhan System:** 5 distinct Adhan styles with audio playback, full-screen overlay for visual cue. Timer-based notification.
- **Localization:** Automatic suggestion of prayer calculation method based on country code.

**System Design Choices:**
- **Data Persistence:** Drizzle ORM for PostgreSQL in the API, AsyncStorage for local mobile app data.
- **API Design:** RESTful API with Zod for robust request/response validation.
- **Cross-package Dependencies:** TypeScript project references for type safety and efficient builds.
- **Build Process:** `tsc --build --emitDeclarationOnly` for type-checking, esbuild for production bundles.
- **Monetization (Dormant):** RevenueCat integration is pre-wired but inactive, allowing future toggling of premium features without core functionality being paywalled.
- **Home-screen Verse of the Day:** Rendered as a "Mushaf leaf" — cream parchment LinearGradient with a hairline gold-brown inset frame, surah-band header, optional bismillah line, Amiri Quran verse text, and an ornate U+FD3E/U+FD3F ﴿n﴾ stamp wrapping an Eastern Arabic numeral. Component is `MushafLeafVerse` (memoized; verse changes once daily). Outer hairline + shadow are theme-tinted (`colors.tint`/`colors.glow`) so the constant cream paper reads cleanly across all 5 accent themes.

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