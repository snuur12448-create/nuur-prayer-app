import AsyncStorage from "@/utils/AppStorage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CurrencyCode,
  NisabType,
  NISAB_THRESHOLDS,
} from "./zakatData";

/* ─────────────────────────────────────────────────────────────────────────
 * Live Nisab thresholds.
 *
 * The Nisab is the wealth threshold above which Zakat becomes obligatory.
 * It is anchored to physical metal — 85 g of pure gold OR 612 g of silver —
 * so its currency value tracks the spot market.
 *
 * We pull two free, no-key endpoints:
 *   • gold-api.com → spot XAU / XAG in USD per troy ounce
 *   • frankfurter.dev → USD → GBP FX rate
 *
 * Both calls are issued in parallel behind an 8 s AbortController. The
 * resulting per-currency Nisab snapshot is cached in AsyncStorage for 24 h.
 * On any failure we surface the most recent (stale) cache, then ultimately
 * fall back to the editorially-curated NISAB_THRESHOLDS constants — so the
 * calculator always renders something sensible even fully offline.
 *
 * Conversions use the strict troy ounce (31.1034768 g) so 85 g gold and
 * 612 g silver align with the canonical scholarly definitions.
 * ──────────────────────────────────────────────────────────────────────── */

const GRAMS_PER_TROY_OUNCE = 31.1034768;
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 612;

const CACHE_KEY = "nuur_nisab_cache_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h
const REQUEST_TIMEOUT_MS = 8000;

export type NisabSource = "live" | "cache" | "stale-cache" | "fallback";

export interface NisabSnapshot {
  thresholds: Record<CurrencyCode, Record<NisabType, number>>;
  fetchedAt: number;     // epoch ms; 0 when source === "fallback"
  source: NisabSource;
  goldUsdPerOz: number;  // 0 in fallback
  silverUsdPerOz: number;
  fxUsdToGbp: number;
}

interface CachedPayload {
  thresholds: Record<CurrencyCode, Record<NisabType, number>>;
  fetchedAt: number;
  goldUsdPerOz: number;
  silverUsdPerOz: number;
  fxUsdToGbp: number;
}

const FALLBACK_SNAPSHOT: NisabSnapshot = {
  thresholds: NISAB_THRESHOLDS,
  fetchedAt: 0,
  source: "fallback",
  goldUsdPerOz: 0,
  silverUsdPerOz: 0,
  fxUsdToGbp: 0,
};

function isFinitePositive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function isValidThresholdMap(t: any): t is Record<CurrencyCode, Record<NisabType, number>> {
  if (!t || typeof t !== "object") return false;
  for (const cur of ["USD", "GBP"] as CurrencyCode[]) {
    const row = t[cur];
    if (!row || typeof row !== "object") return false;
    if (!isFinitePositive(row.gold) || !isFinitePositive(row.silver)) return false;
  }
  return true;
}

async function readCache(): Promise<CachedPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedPayload>;
    // Defensive: validate every numeric and reject any payload outside sane
    // bounds. A tampered/corrupt cache must fall through to the static
    // constants, not crash downstream `formatCurrency` / `toFixed`.
    if (
      !parsed ||
      typeof parsed.fetchedAt !== "number" ||
      !Number.isFinite(parsed.fetchedAt) ||
      parsed.fetchedAt <= 0 ||
      parsed.fetchedAt > Date.now() + 60_000 || // disallow far-future timestamps
      !isFinitePositive(parsed.goldUsdPerOz) ||
      !isFinitePositive(parsed.silverUsdPerOz) ||
      !isFinitePositive(parsed.fxUsdToGbp) ||
      !isValidThresholdMap(parsed.thresholds)
    ) {
      return null;
    }
    return parsed as CachedPayload;
  } catch {
    return null;
  }
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as T;
}

/**
 * Fetch the latest Nisab snapshot.
 *
 * @param force        if true, bypass the 24 h fresh-cache check (still
 *                     used as a stale fallback if the network call fails).
 * @param externalSignal optional AbortSignal — when aborted (e.g. on
 *                     component unmount or supersession), the in-flight
 *                     request is cancelled and we resolve from cache.
 */
export async function fetchNisabSnapshot(
  force = false,
  externalSignal?: AbortSignal,
): Promise<NisabSnapshot> {
  const cached = await readCache();

  // Honour the 24 h cache unless caller asked for a forced refresh.
  if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached, source: "cache" };
  }

  // Compose a private timeout controller with the caller's abort signal so
  // either source (timeout, unmount, supersession) cancels the request.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", onExternalAbort);
  }
  const cleanup = () => {
    clearTimeout(timer);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  };

  try {
    const [gold, silver, fx] = await Promise.all([
      fetchJson<{ price: number }>("https://api.gold-api.com/price/XAU", controller.signal),
      fetchJson<{ price: number }>("https://api.gold-api.com/price/XAG", controller.signal),
      fetchJson<{ rates: { GBP: number } }>(
        "https://api.frankfurter.dev/latest?base=USD&symbols=GBP",
        controller.signal,
      ),
    ]);
    cleanup();

    const goldUsdPerOz = Number(gold?.price);
    const silverUsdPerOz = Number(silver?.price);
    const fxUsdToGbp = Number(fx?.rates?.GBP);

    if (
      !Number.isFinite(goldUsdPerOz) || goldUsdPerOz <= 0 ||
      !Number.isFinite(silverUsdPerOz) || silverUsdPerOz <= 0 ||
      !Number.isFinite(fxUsdToGbp) || fxUsdToGbp <= 0
    ) {
      throw new Error("invalid price payload");
    }

    const goldUsd = (goldUsdPerOz / GRAMS_PER_TROY_OUNCE) * GOLD_NISAB_GRAMS;
    const silverUsd = (silverUsdPerOz / GRAMS_PER_TROY_OUNCE) * SILVER_NISAB_GRAMS;

    const thresholds: Record<CurrencyCode, Record<NisabType, number>> = {
      USD: { gold: Math.round(goldUsd), silver: Math.round(silverUsd) },
      GBP: {
        gold: Math.round(goldUsd * fxUsdToGbp),
        silver: Math.round(silverUsd * fxUsdToGbp),
      },
    };

    const payload: CachedPayload = {
      thresholds,
      fetchedAt: Date.now(),
      goldUsdPerOz,
      silverUsdPerOz,
      fxUsdToGbp,
    };

    // Fire-and-forget — a failed write must not block returning live data.
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload)).catch(() => {});

    return { ...payload, source: "live" };
  } catch {
    cleanup();
    // Network/parse failed — prefer a stale cache over the static constants.
    if (cached) return { ...cached, source: "stale-cache" };
    return FALLBACK_SNAPSHOT;
  }
}

export interface UseLiveNisabResult {
  snapshot: NisabSnapshot;
  loading: boolean;
  refresh: () => void;
}

/**
 * React hook that yields the current Nisab snapshot and a forced-refresh
 * callback. Renders the offline fallback synchronously on first paint so
 * the calculator never shows a blank threshold.
 *
 * Concurrency guarantees:
 *   • Single-flight: a new refresh aborts any in-flight request and
 *     supersedes it via a monotonic request token, so older responses
 *     can never overwrite newer state (last-write-wins).
 *   • Unmount-safe: the controlling AbortController is aborted on
 *     unmount, preventing setState after teardown.
 *   • `loading` reflects only the latest request — earlier completions
 *     can no longer flip it back to false.
 */
export function useLiveNisab(): UseLiveNisabResult {
  const [snapshot, setSnapshot] = useState<NisabSnapshot>(FALLBACK_SNAPSHOT);
  const [loading, setLoading] = useState(true);

  const reqIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async (force: boolean) => {
    // Supersede any in-flight request.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const myId = ++reqIdRef.current;

    setLoading(true);
    const next = await fetchNisabSnapshot(force, controller.signal);

    // Last-write-wins: only the most recent request may commit state, and
    // only while the component is still mounted.
    if (!mountedRef.current) return;
    if (myId !== reqIdRef.current) return;
    setSnapshot(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load(false).catch(() => {});
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [load]);

  const refresh = useCallback(() => {
    load(true).catch(() => {});
  }, [load]);

  return { snapshot, loading, refresh };
}

/**
 * Format "updated Xh ago" / "just now" for the given epoch ms timestamp.
 * Returns null when the snapshot has no real timestamp (offline fallback).
 */
export function formatUpdatedAgo(fetchedAt: number, now: number = Date.now()): string | null {
  if (!fetchedAt) return null;
  const diff = Math.max(0, now - fetchedAt);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
