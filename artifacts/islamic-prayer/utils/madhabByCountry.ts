import { MadhabId } from "./prayerTimes";

// Hanafi-majority regions (Asr = shadow x 2). Everywhere else defaults to
// Shafi'i (Asr = shadow x 1), which is the majority globally and the position
// of the Shafi'i, Maliki, and Hanbali schools.
const HANAFI_COUNTRIES = new Set<string>([
  // South Asia
  "PK", "IN", "BD", "AF", "LK",
  // Central Asia (Hanafi heartland historically)
  "KZ", "UZ", "TM", "KG", "TJ", "AZ",
  // Turkey + Turkic-influenced
  "TR",
  // Balkans (Ottoman Hanafi tradition)
  "BA", "AL", "XK", "MK",
  // China (Hui community is largely Hanafi)
  "CN",
]);

export function suggestMadhab(isoCountryCode: string): MadhabId | null {
  if (!isoCountryCode) return null;
  const code = isoCountryCode.toUpperCase();
  return HANAFI_COUNTRIES.has(code) ? "Hanafi" : "Shafi";
}

export function getMadhabLabel(madhabId: MadhabId): string {
  return madhabId === "Hanafi" ? "Hanafi" : "Shafi'i";
}
