import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Per-prayer probability that this specific prayer was the one missed,
  // given that the user missed `dm` of the 5 on average.
  // Weights sum to 1, so multiplying by `dm` keeps probabilities ≤ 1.
  const weights: Record<QadaPrayerKey, number> = {
    fajr:    0.30,
    asr:     0.25,
    dhuhr:   0.20,
    isha:    0.15,
    maghrib: 0.10,
  };
  for (const k of QADA_PRAYERS) {
    out[k] = Math.round(days * weights[k] * dm);
  }
  return out;
}
