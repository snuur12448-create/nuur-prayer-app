import AsyncStorage from "@react-native-async-storage/async-storage";

/* ─────────────────────────────────────────────────────────────────────────
 * Zakat calculator — pure data, defaults, persistence.
 *
 * Zakat (الزكاة) is the obligatory annual alms in Islam: 2.5 % of one's
 * zakatable wealth, due once the wealth has remained above the Nisab
 * threshold for one full lunar year (Hawl).
 *
 * Two valid Nisab thresholds exist:
 *   • Gold   — 85 g of pure gold
 *   • Silver — 612 g (≈ 21 oz) of pure silver
 * Most contemporary scholars recommend the silver Nisab as it is the
 * lower of the two, which expands eligibility for receiving aid and
 * narrows the pool of people exempt from giving.
 *
 * Spot prices fluctuate daily; we ship sensible static defaults as a
 * starting point. The user can verify with their local market.
 * ──────────────────────────────────────────────────────────────────────── */

export type CurrencyCode = "GBP" | "USD";
export type NisabType = "gold" | "silver";

export const ZAKAT_RATE = 0.025;

export const CURRENCIES: Record<CurrencyCode, { symbol: string; label: string }> = {
  GBP: { symbol: "£", label: "GBP" },
  USD: { symbol: "$", label: "USD" },
};

/**
 * Static Nisab thresholds. Approximate, conservative spot values rounded
 * to whole units — refreshed editorially, not at runtime.
 */
export const NISAB_THRESHOLDS: Record<CurrencyCode, Record<NisabType, number>> = {
  GBP: { gold: 6500, silver: 380 },
  USD: { gold: 8250, silver: 485 },
};

/**
 * The set of input fields shown in the calculator. Order is significant —
 * it is the rendering order on screen.
 */
export const ASSET_FIELDS = [
  { key: "cash",        label: "Cash & Bank Savings",     hint: "Current, savings, ISAs, e-wallets" },
  { key: "metals",      label: "Gold & Silver Value",     hint: "Jewellery, bullion, coins (market value)" },
  { key: "investments", label: "Investments & Shares",    hint: "Stocks, funds, crypto (current value)" },
  { key: "business",    label: "Business Stock & Goods",  hint: "Inventory, raw materials, work-in-progress" },
  { key: "receivables", label: "Money Owed to You",       hint: "Loans you've made, expected refunds" },
  { key: "other",       label: "Other Assets",            hint: "Anything else of zakatable value" },
] as const;

export const DEDUCTION_FIELDS = [
  { key: "debts", label: "Debts & Money You Owe", hint: "Bills due, loans owed, immediate liabilities" },
] as const;

export type AssetKey = typeof ASSET_FIELDS[number]["key"];
export type DeductionKey = typeof DEDUCTION_FIELDS[number]["key"];
export type ZakatInputKey = AssetKey | DeductionKey;

export type ZakatInputs = Record<ZakatInputKey, string>;

export const EMPTY_INPUTS: ZakatInputs = {
  cash: "",
  metals: "",
  investments: "",
  business: "",
  receivables: "",
  other: "",
  debts: "",
};

export interface ZakatComputation {
  totalAssets: number;
  totalDebts: number;
  zakatableWealth: number;
  nisabThreshold: number;
  isAboveNisab: boolean;
  zakatDue: number;
}

/** Parse a permissive numeric string ("1,234.56", "£500", "  ") → number. */
function parseAmount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function computeZakat(
  inputs: ZakatInputs,
  currency: CurrencyCode,
  nisabType: NisabType,
  // Live snapshot from `useLiveNisab` is preferred; falls back to the
  // static constants when offline / mid-fetch.
  thresholds: Record<CurrencyCode, Record<NisabType, number>> = NISAB_THRESHOLDS,
): ZakatComputation {
  const totalAssets = ASSET_FIELDS.reduce(
    (sum, f) => sum + parseAmount(inputs[f.key]),
    0,
  );
  const totalDebts = DEDUCTION_FIELDS.reduce(
    (sum, f) => sum + parseAmount(inputs[f.key]),
    0,
  );
  const zakatableWealth = Math.max(0, totalAssets - totalDebts);
  const nisabThreshold = thresholds[currency][nisabType];
  const isAboveNisab = zakatableWealth >= nisabThreshold;
  const zakatDue = isAboveNisab ? zakatableWealth * ZAKAT_RATE : 0;
  return {
    totalAssets,
    totalDebts,
    zakatableWealth,
    nisabThreshold,
    isAboveNisab,
    zakatDue,
  };
}

/** Format a number as a currency amount with the provided symbol. */
export function formatCurrency(value: number, currency: CurrencyCode): string {
  const sym = CURRENCIES[currency].symbol;
  const fixed = value.toFixed(2).replace(/\.00$/, "");
  // Add thousands separators.
  const [whole, frac] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${sym}${grouped}.${frac}` : `${sym}${grouped}`;
}

/* ── Persistence ─────────────────────────────────────────────────────────
 *  All keys are namespaced under `nuur_zakat_*` to match the rest of the
 *  app's AsyncStorage convention.
 * ──────────────────────────────────────────────────────────────────────── */

const KEY_INPUTS    = "nuur_zakat_inputs";
const KEY_CURRENCY  = "nuur_zakat_currency";
const KEY_NISAB     = "nuur_zakat_nisab_type";

export interface ZakatPreferences {
  inputs: ZakatInputs;
  currency: CurrencyCode;
  nisabType: NisabType;
}

export const DEFAULT_PREFERENCES: ZakatPreferences = {
  inputs: { ...EMPTY_INPUTS },
  currency: "GBP",
  nisabType: "silver",
};

export async function loadZakatPreferences(): Promise<ZakatPreferences> {
  try {
    const [rawInputs, rawCurrency, rawNisab] = await Promise.all([
      AsyncStorage.getItem(KEY_INPUTS),
      AsyncStorage.getItem(KEY_CURRENCY),
      AsyncStorage.getItem(KEY_NISAB),
    ]);

    let inputs: ZakatInputs = { ...EMPTY_INPUTS };
    if (rawInputs) {
      try {
        const parsed = JSON.parse(rawInputs) as Partial<ZakatInputs>;
        // Only adopt known keys, coerce values to strings.
        for (const k of Object.keys(EMPTY_INPUTS) as ZakatInputKey[]) {
          if (typeof parsed[k] === "string") inputs[k] = parsed[k]!;
        }
      } catch {
        /* ignore corrupted blob */
      }
    }
    const currency: CurrencyCode =
      rawCurrency === "USD" || rawCurrency === "GBP" ? rawCurrency : "GBP";
    const nisabType: NisabType =
      rawNisab === "gold" || rawNisab === "silver" ? rawNisab : "silver";

    return { inputs, currency, nisabType };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export async function saveZakatInputs(inputs: ZakatInputs): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_INPUTS, JSON.stringify(inputs));
  } catch {
    /* swallow — storage failures shouldn't break the UI */
  }
}

export async function saveZakatCurrency(currency: CurrencyCode): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_CURRENCY, currency);
  } catch { /* noop */ }
}

export async function saveZakatNisabType(nisabType: NisabType): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_NISAB, nisabType);
  } catch { /* noop */ }
}
