# Plan: Tafsir Layer for the Nuur Quran Reader

Adds verse-level Quranic commentary to the Quran reader, starting with **Ibn Kathir (abridged, English)**. Closes the biggest content gap vs Quran.com / Tarteel and uses zero native code, so the entire build can happen in Replit.

## What the user gets in v1

While reading any surah, every verse card gets a small **"Tafsir"** affordance. Tapping it opens a bottom sheet (matching the existing word-by-word sheet pattern) with:

- The verse Arabic + Sahih translation at the top (anchor)
- The Ibn Kathir abridged English commentary below, scrollable
- A footer line: source attribution + "Tafsir Ibn Kathir (Abridged) — Mubarakpuri ed."
- A close handle

Out of scope for v1 (deliberately): multi-tafsir picker, search, bookmarking commentary, Arabic tafsir, audio tafsir, AI summaries.

## Architecture

Mirrors the existing Quran data flow exactly — fetch + AsyncStorage cache, no native code, no new bundled assets.

```
VerseCard (existing)
  └─ Tafsir button  →  opens TafsirSheet
                           │
                           ▼
                   useTafsir(surah, ayah)
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      AsyncStorage cache       Quran.com QDC API
      (tafsirCache.ts)         (resource id 169 = Ibn Kathir EN)
```

## Decisions to make before we start

1. **Source** — two real options:
   - **(A) Quran.com QDC public API** (`api.qurancdn.com/api/qdc/tafsirs/...`). Free, no key, well-maintained, matches existing fetch pattern. Recommended.
   - **(B) Bundle a static JSON dump** from `khaled-metwally/quran-data-json` or similar. ~6–10MB extra in the bundle, fully offline from day one. More work to update.
   - My recommendation: **(A)** with cache-on-read so it becomes offline after first use, just like the verses.

2. **Cache strategy**:
   - **(A) Per-verse cache** — fetch once per ayah viewed, cache forever. Tiny storage, more API calls.
   - **(B) Per-surah cache** — when the user opens a surah and taps any tafsir, fetch the whole surah's tafsir at once. ~50–500KB per surah, fewer round-trips.
   - My recommendation: **(B)** — better perceived perf, still small.

3. **UI surface** — bottom sheet (matches word-by-word) vs inline-expand vs separate route?
   - My recommendation: **bottom sheet**. Consistent, doesn't disrupt scroll position, easy to dismiss.

4. **Settings toggle** — should there be a "Show Tafsir button" preference?
   - My recommendation: **yes**, default on. One line in settings. Power-users who don't want the affordance can hide it.

## Phases

### Phase 1 — Data layer (~half a day, all in Replit)

Files:
- `utils/tafsirData.ts` — types (`TafsirEntry`, `TafsirResource`), fetch functions
- `utils/tafsirCache.ts` — AsyncStorage read/write with size cap (mirror `quranCache.ts`)
- `hooks/useTafsir.ts` — React hook that returns `{ tafsir, loading, error }` for a given surah+ayah

Key concerns:
- **Range entries**: some tafsir entries cover multiple ayahs (e.g. "verses 1–7"). The shape needs `from_ayah` / `to_ayah` and the hook needs to look up by inclusion, not equality.
- **HTML content**: QDC tafsir text contains `<sup>`, `<i>`, paragraph tags. Either render as plain text (strip tags) or use a minimal HTML renderer. Recommend strip-and-paragraph-split for v1 simplicity.
- **Error / empty states**: not every verse has tafsir text in the abridged edition. Show a friendly "No commentary available for this verse" rather than an error.

### Phase 2 — UI (~half to one day, all in Replit)

Files:
- `components/TafsirSheet.tsx` — bottom-sheet modal, matches `WordByWordSheet` styling
- `app/quran/[id].tsx` — add Tafsir button to `VerseCard` and wire it to open the sheet

Visual treatment:
- Button: small text-only "Tafsir" pill matching the existing word-by-word chip
- Sheet header: surah:ayah label + Arabic text in small caps
- Body: serif-ish English (use existing Inter family for consistency), proper paragraph spacing, source line in muted footer

### Phase 3 — Settings + polish (~half a day)

- Settings → Quran: "Show Tafsir button" toggle, persisted to AsyncStorage
- Loading skeleton while fetching first time
- Pull-to-refresh in the sheet to re-fetch (rare edge case if the API updates)
- Telemetry-free: no analytics added (consistent with Nuur's no-tracking stance)

### Phase 4 — Test + ship (~half a day)

- Type-check passes
- Playwright e2e: open a surah, tap Tafsir on verse 1 of Al-Fatihah, verify sheet shows commentary, close, verify cached on second open
- Architect code review
- `replit.md` update

## Total estimate

| Phase | Time |
|---|---|
| 1 — Data layer | 0.5 day |
| 2 — UI | 0.5–1 day |
| 3 — Settings + polish | 0.5 day |
| 4 — Test + ship | 0.5 day |
| **Total** | **2–2.5 working days** |

All in Replit. No Mac, no Apple Developer account, no native code.

## Risks

- **API stability** — Quran.com QDC is free but has occasional outages. Cache-on-read protects users who've opened the verse before. For users opening a verse cold during an outage, show a graceful "Tafsir unavailable, try again later" state.
- **Licensing** — Ibn Kathir abridged (Mubarakpuri ed.) is widely distributed. QDC publishes it under their own usage policy; we should display the source attribution prominently.
- **Translation quality** — the abridged edition is a digest; some users will want the full 10-volume version. v2 could add a "View full tafsir on Quran.com" deep link.

## Future v1.1+

Once v1 ships, easy adds:
- Second tafsir option (Saadi or Maududi) with a picker chip
- Arabic tafsir for Arabic-readers
- Per-tafsir bookmarks (re-using the existing bookmark UI)
- "Verse of the Day" enriched with one-paragraph tafsir snippet
