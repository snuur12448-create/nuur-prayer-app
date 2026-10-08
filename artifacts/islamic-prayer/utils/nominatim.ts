import { Platform } from "react-native";

const CONTACT_EMAIL = "nuurapps@gmail.com";
const USER_AGENT = `Nuur/1.0 (${CONTACT_EMAIL})`;
const MIN_REQUEST_INTERVAL_MS = 1_100;

export interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  state?: string;
  country?: string;
  country_code?: string;
}

export interface NominatimSearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
}

export interface NominatimReverseResult {
  address: NominatimAddress;
}

const searchCache = new Map<string, NominatimSearchResult[]>();
const reverseCache = new Map<string, NominatimReverseResult | null>();
let lastRequestAt = 0;
let requestChain: Promise<void> = Promise.resolve();

async function requestJson(url: string): Promise<unknown> {
  let result: unknown;
  let failure: unknown;
  const run = requestChain.then(async () => {
    const waitMs = Math.max(0, MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (waitMs > 0) await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
    lastRequestAt = Date.now();
    const headers: Record<string, string> = { "Accept-Language": "en" };
    // Native requests do not automatically send a browser Referer.
    if (Platform.OS !== "web") headers["User-Agent"] = USER_AGENT;
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Nominatim request failed (${response.status})`);
      result = await response.json();
    } catch (error) {
      failure = error;
    }
  });
  requestChain = run.then(() => undefined, () => undefined);
  await run;
  if (failure) throw failure;
  return result;
}

function isAddress(value: unknown): value is NominatimAddress {
  return !!value && typeof value === "object";
}

export async function searchNominatim(query: string): Promise<NominatimSearchResult[]> {
  const trimmed = query.trim();
  const cacheKey = trimmed.toLocaleLowerCase("en");
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}` +
    `&format=json&limit=6&addressdetails=1&featuretype=city&email=${encodeURIComponent(CONTACT_EMAIL)}`;
  const data = await requestJson(url);
  if (!Array.isArray(data)) return [];
  const results = data.filter((item): item is NominatimSearchResult => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<NominatimSearchResult>;
    return typeof candidate.place_id === "number" &&
      typeof candidate.lat === "string" && Number.isFinite(Number(candidate.lat)) &&
      typeof candidate.lon === "string" && Number.isFinite(Number(candidate.lon)) &&
      typeof candidate.display_name === "string" &&
      isAddress(candidate.address);
  });
  searchCache.set(cacheKey, results);
  return results;
}

export async function reverseNominatim(
  latitude: number,
  longitude: number,
): Promise<NominatimReverseResult | null> {
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (reverseCache.has(cacheKey)) return reverseCache.get(cacheKey) ?? null;

  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(latitude))}` +
    `&lon=${encodeURIComponent(String(longitude))}&format=json&zoom=10&addressdetails=1` +
    `&email=${encodeURIComponent(CONTACT_EMAIL)}`;
  const data = await requestJson(url);
  const candidate = data && typeof data === "object"
    ? data as Partial<NominatimReverseResult>
    : null;
  const result = candidate && isAddress(candidate.address)
    ? { address: candidate.address }
    : null;
  reverseCache.set(cacheKey, result);
  return result;
}
