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

Comprehensive Islamic prayer mobile app built with Expo (React Native). Serves at previewPath `/`.

**Features:**
- **Prayer Times** (tab: Prayer / index.tsx): Accurate 5 daily prayer times + Sunrise using MWL method (Fajr 18°, Isha 17°, using `-sin(angle)` formula from PrayTimes.org algorithm). Defaults to Makkah (UTC+3) when location permission not granted. Shows next prayer, countdown, and a progress bar for elapsed time between prayers. Islamic date display (Hijri calendar).
- **Quran Reader** (tab: Quran): Browse 35 surahs, search by name/meaning/Arabic. Bookmarks via AsyncStorage. Detail screen shows Arabic verse + English translation for 17 surahs (Al-Fatihah, surahs 99–114). Copy-to-clipboard on each verse.
- **Qibla Compass** (tab: Qibla): SVG compass showing Qibla direction (bearing to Makkah) using great-circle formula. Animated gold needle. Shows distance to Kaaba in km.
- **Duas & Adhkar** (tab: Dua): 5 categories (Morning, Evening, After Prayer, Daily Supplications, Protection). Expand/collapse cards showing Arabic, transliteration, translation, source reference. Copy-to-clipboard button.

**Key files:**
- `utils/prayerTimes.ts` — Prayer time algorithm (PrayTimes.org convention: `-sin(angle)` where angle is depression for below-horizon, negative for above-horizon like Asr)
- `utils/islamicData.ts` — Quran surah list, Dua categories (5 cats, 15 duas), 12 Islamic reminders, Hijri date conversion
- `utils/qibla.ts` — Qibla bearing + haversine distance to Kaaba
- `context/AppContext.tsx` — GPS location (fallback: Makkah 21.4225°N, 39.8262°E, UTC+3), prayer times, surah bookmarks, AsyncStorage persistence
- `constants/colors.ts` — Islamic green (#1B4332), gold (#D4A017), full dark mode

**Prayer time notes:**
- Formula: `cosVal = (-sin(angle) - sin(lat)*sin(decl)) / (cos(lat)*cos(decl))`
- Positive angle = depression (Fajr=18°, Isha=17°, Sunrise/Maghrib=0.833°)
- Negative angle = altitude above horizon (Asr uses `-arctan(1/(factor+tan(|lat-decl|)))`)
- `useNativeDriver: false` required for all Animated calls (web compatibility)
