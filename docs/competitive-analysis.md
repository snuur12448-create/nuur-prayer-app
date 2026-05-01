# Nuur — Competitive Analysis

> Source: cross-reference of the Nuur feature set against the eight most-installed apps in the Islamic-app category. Captured here so the recommendations survive chat compression and are visible to any future contributor or agent.

## Where Nuur is behind

Grouped by category and ordered by how often the gap shows up in competitor reviews and product copy.

### 1. Quran depth — biggest gap

Nuur ships Mushaf + Sahih translation only. Competitors go much deeper:

- **Tafsir layers** (Ibn Kathir, Saadi, Maududi) — Quran.com app
- **Word-by-word translation with per-word audio tap** — Sajda, Quran.com
- **AI recitation correction** — Tarteel. You recite into the mic, it highlights mistakes verse-by-verse. The single most "moat-y" feature in the category.
- **Voice search** — recite a verse to find it — Tarteel
- **Memorization mode that hides ayahs progressively** — Tarteel
- **Continuous Quran radio** — Quran.com

### 2. Home-screen presence — Nuur ships zero

- **iOS & Android home-screen widgets** for next-prayer countdown — Pillars, Athan Pro
- **Apple Watch / Wear OS app** with adhan on wrist — Pillars, Athan Pro
- **Live Activities / Dynamic Island countdown** — Pillars

This is "table stakes" now. Reviews on Pillars repeatedly praise widgets; reviews on Muslim Pro complain about the lack of a watch app.

### 3. Lifestyle utilities

- **Zakat calculator** — Muslim Pro, Sajda (universal expectation in 'all-in-one' apps) — ✅ shipped in Nuur
- **Halal food / restaurant finder** — Muslim Pro, Athan Pro. Nuur has mosques but not food.
- **Hajj / Umrah digital guides** with step-by-step rites — Muslim Pro
- **Charity / sadaqa gateway** with donation tracking — Muslim Pro, Salaam

### 4. Ramadan & seasonal

- **30-day Ramadan planner** with daily goals — Ramadan Legacy, Muslim Pro
- **Reflection journal / spiritual notes** — Ramadan Legacy, Pillars Plus
- **Iftar / suhoor countdown card** — Muslim Pro, Athan Pro

These drive a huge engagement spike each year. Nuur has Hijri events but no Ramadan-specific surface.

### 5. Content & learning

- **Video courses / Islamic streaming** (Qalbox, Quran Academy) — Muslim Pro
- **Audio lectures / podcasts** with offline download
- Nuur's "How to Pray" guide is text-only.

### 6. Community & social

- **Prayer-request feed** — Muslim Pro
- **Group Khatam** (collaborative Quran completion) — Sajda
- **Family / friend prayer streaks** with shared accountability — Pillars
- **Mosque check-ins** — Athan Pro

### 7. Polish on what Nuur already has

- **Pillars' tracker UI** is widely cited as the best in the market — heatmap calendar, gentler streak psychology, zero-shame missed-prayer recovery.
- **Athan Pro's adhan notification** uses rich-media notifications (artwork + reciter name) instead of plain text.

### 8. AI delighters (where the bar is moving)

- AI dua suggestions based on mood / situation
- AI dream interpretation (controversial but downloaded heavily)
- Personalized daily verse explanation — Muslim Pro is hiring for this; Tarteel ships it

## Where Nuur already wins

Honest counterweight:

- **Share cards** — Nuur's painted-frame share system is genuinely better than anything Muslim Pro / Pillars ship; their share output is plain Sahih-text on a flat colour.
- **Visual restraint** — no ads, no privacy scandals, no feature-bloat menu. Pillars is the only competitor in Nuur's league here.
- **Adhkar curation** — Nuur's morning/evening adhkar surface is cleaner than Muslim Pro's buried list.
- **Theme system** — 5 hand-tuned themes vs. competitors' 1–2.

## Top 5 to close the gap

| # | Feature | Why | Reference | Status |
|---|---|---|---|---|
| 1 | **iOS + Android home-screen widget** (next prayer) | Highest review-mentioned gap, lowest build cost | Pillars, Athan Pro | Scoped — see `docs/ios-widget-plan.md` (TBD), on hold |
| 2 | **Tafsir layer in Quran** (start with Ibn Kathir English) | Closes the biggest content gap vs Quran.com | Quran.com | Scoped — see `docs/tafsir-plan.md` |
| 3 | **Apple Watch app** (athan + tracker tap) | Pillars' #1 differentiator; cheap with Expo + WatchKit bridge | Pillars | Not scoped — defer until iOS widget ships (shares native plumbing) |
| 4 | **Zakat calculator** | Universal expectation | Muslim Pro, Sajda | ✅ Shipped |
| 5 | **Ramadan dashboard** (planner + iftar countdown + journal) | Drives the annual install spike | Muslim Pro, Ramadan Legacy | Not scoped — must ship before mid-Jan 2027 (Ramadan ~Feb 2027) |
