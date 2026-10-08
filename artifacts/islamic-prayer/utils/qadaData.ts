import AsyncStorage from "@/utils/AppStorage";

export const QADA_STORAGE_KEY = "nuur_qada_ledger_v1";

export const QADA_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type QadaPrayerKey = (typeof QADA_PRAYERS)[number];

export const QADA_LABELS: Record<QadaPrayerKey, { en: string; ar: string }> = {
  fajr:    { en: "Fajr",    ar: "الفجر" },
  dhuhr:   { en: "Dhuhr",   ar: "الظهر" },
  asr:     { en: "ʿAṣr",    ar: "العصر" },
  maghrib: { en: "Maghrib", ar: "المغرب" },
  isha:    { en: "ʿIshāʾ",  ar: "العشاء" },
};

/** Per-prayer counts. `initial` is the starting estimate the user committed to,
 *  `madeUp` is how many they have logged as complete. `remaining = initial - madeUp`
 *  (clamped at 0). The `(+)` extra-added case is supported by allowing initial to
 *  grow over time. */
export interface QadaState {
  /** Has the user finished setup? Used to gate ledger vs setup screen. */
  configured: boolean;
  initial: Record<QadaPrayerKey, number>;
  madeUp: Record<QadaPrayerKey, number>;
  /** ISO date string of when the ledger was first saved. */
  startedAt: string | null;
  /** Recent make-ups for the "today" indicator. ISO date strings (YYYY-MM-DD). */
  recentLog: string[];
}

export const EMPTY_COUNTS: Record<QadaPrayerKey, number> = {
  fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
};

export const DEFAULT_QADA_STATE: QadaState = {
  configured: false,
  initial: { ...EMPTY_COUNTS },
  madeUp: { ...EMPTY_COUNTS },
  startedAt: null,
  recentLog: [],
};

export async function loadQadaState(): Promise<QadaState> {
  try {
    const raw = await AsyncStorage.getItem(QADA_STORAGE_KEY);
    if (!raw) return DEFAULT_QADA_STATE;
    const parsed = JSON.parse(raw) as Partial<QadaState>;
    return {
      ...DEFAULT_QADA_STATE,
      ...parsed,
      initial: { ...EMPTY_COUNTS, ...(parsed.initial ?? {}) },
      madeUp:  { ...EMPTY_COUNTS, ...(parsed.madeUp  ?? {}) },
      recentLog: Array.isArray(parsed.recentLog) ? parsed.recentLog : [],
    };
  } catch {
    return DEFAULT_QADA_STATE;
  }
}

export async function saveQadaState(state: QadaState): Promise<void> {
  try {
    await AsyncStorage.setItem(QADA_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best effort
  }
}

export function remainingForPrayer(state: QadaState, key: QadaPrayerKey): number {
  return Math.max(0, state.initial[key] - state.madeUp[key]);
}

export function totalRemaining(state: QadaState): number {
  let t = 0;
  for (const k of QADA_PRAYERS) t += remainingForPrayer(state, k);
  return t;
}

export function totalInitial(state: QadaState): number {
  let t = 0;
  for (const k of QADA_PRAYERS) t += state.initial[k];
  return t;
}

export function totalMadeUp(state: QadaState): number {
  let t = 0;
  for (const k of QADA_PRAYERS) t += state.madeUp[k];
  return t;
}

export function todayLogCount(state: QadaState): number {
  const today = isoDate(new Date());
  return state.recentLog.filter((d) => d === today).length;
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Estimate based on wizard answers. `dailyMissed` is the average number
 *  of the 5 daily prayers the user used to miss per day.
 *
 *  - If they missed all 5/day → every prayer gets `days` (no skew).
 *  - If they missed fewer → distribute weighted toward prayers people
 *    typically miss most (Fajr first, Maghrib last), keeping the total
 *    equal to days × dailyMissed. */
export function estimateFromWizard(
  yearsMissed: number,
  dailyMissed: number,
): Record<QadaPrayerKey, number> {
  const days = Math.max(0, Math.round(yearsMissed * 365));
  const dm = Math.max(0, Math.min(5, dailyMissed));
  const out = { ...EMPTY_COUNTS };

  if (dm === 0 || days === 0) return out;

  if (dm >= 5) {
    for (const k of QADA_PRAYERS) out[k] = days;
    return out;
  }

  // Per-prayer relative likelihood that this specific prayer was missed.
  // Ordered by real-world tendency: Fajr first (early/sleep), ʿIshāʾ next
  // (late/tired), then Dhuhr/ʿAṣr (work hours), Maghrib last (short window).
  // Weights sum to 1.
  const weights: Record<QadaPrayerKey, number> = {
    fajr:    0.32,
    isha:    0.25,
    dhuhr:   0.18,
    asr:     0.15,
    maghrib: 0.10,
  };

  // Distribute the total missed mass (days × dm) across prayers proportional
  // to weights, but no single prayer can exceed `days` (max possible count).
  // Iteratively cap and redistribute overflow among the uncapped prayers.
  const remaining = new Set<QadaPrayerKey>(QADA_PRAYERS);
  const counts: Record<QadaPrayerKey, number> = { ...EMPTY_COUNTS };
  let pool = days * dm; // total mass to distribute (in floats)

  // Safety bound: at most 5 iterations needed (one per possible cap).
  for (let i = 0; i < 6 && remaining.size > 0; i++) {
    let weightSum = 0;
    for (const k of remaining) weightSum += weights[k];
    if (weightSum <= 0) break;

    let capped = false;
    let assignedThisRound = 0;
    for (const k of Array.from(remaining)) {
      const share = pool * (weights[k] / weightSum);
      if (counts[k] + share >= days) {
        // Cap this prayer at `days`; leftover stays in pool for next round
        const leftover = counts[k] + share - days;
        counts[k] = days;
        remaining.delete(k);
        assignedThisRound += share - leftover;
        capped = true;
      } else {
        counts[k] += share;
        assignedThisRound += share;
      }
    }
    pool -= assignedThisRound;
    if (!capped) break;
  }

  for (const k of QADA_PRAYERS) out[k] = Math.round(counts[k]);
  return out;
}
