import { CalcMethodId, CALC_METHODS } from "./prayerTimes";

const COUNTRY_METHOD_MAP: Record<string, CalcMethodId> = {
  // North America
  US: "NorthAmerica",
  CA: "NorthAmerica",
  MX: "NorthAmerica",
  PR: "NorthAmerica",
  GU: "NorthAmerica",

  // United Kingdom & Ireland → Moonsighting Committee (Nuur UK default)
  GB: "MoonsightingCommittee",
  IE: "MoonsightingCommittee",

  // Europe (high-latitude, MWL is the consensus)
  DE: "MuslimWorldLeague",
  FR: "MuslimWorldLeague",
  NL: "MuslimWorldLeague",
  BE: "MuslimWorldLeague",
  AT: "MuslimWorldLeague",
  CH: "MuslimWorldLeague",
  IT: "MuslimWorldLeague",
  ES: "MuslimWorldLeague",
  PT: "MuslimWorldLeague",
  SE: "MuslimWorldLeague",
  NO: "MuslimWorldLeague",
  DK: "MuslimWorldLeague",
  FI: "MuslimWorldLeague",
  PL: "MuslimWorldLeague",
  CZ: "MuslimWorldLeague",
  SK: "MuslimWorldLeague",
  HU: "MuslimWorldLeague",
  RO: "MuslimWorldLeague",
  BG: "MuslimWorldLeague",
  HR: "MuslimWorldLeague",
  RS: "MuslimWorldLeague",
  BA: "MuslimWorldLeague",
  GR: "MuslimWorldLeague",
  LU: "MuslimWorldLeague",
  IS: "MuslimWorldLeague",
  EE: "MuslimWorldLeague",
  LV: "MuslimWorldLeague",
  LT: "MuslimWorldLeague",
  UA: "MuslimWorldLeague",
  RU: "MuslimWorldLeague",
  BY: "MuslimWorldLeague",

  // Australia & New Zealand
  AU: "MuslimWorldLeague",
  NZ: "MuslimWorldLeague",

  // Saudi Arabia
  SA: "UmmAlQura",

  // UAE
  AE: "Dubai",

  // Kuwait
  KW: "Kuwait",

  // Qatar
  QA: "Qatar",

  // Bahrain → Kuwait (similar peninsula method)
  BH: "Kuwait",

  // Oman & Yemen → Umm al-Qura (Arabian peninsula)
  OM: "UmmAlQura",
  YE: "UmmAlQura",

  // Jordan, Syria, Lebanon, Palestine, Iraq → MWL (used in Levant & Iraq)
  JO: "MuslimWorldLeague",
  SY: "MuslimWorldLeague",
  LB: "MuslimWorldLeague",
  PS: "MuslimWorldLeague",
  IQ: "MuslimWorldLeague",

  // Iran
  IR: "Tehran",

  // Turkey
  TR: "Turkey",

  // Egypt, Libya
  EG: "Egyptian",
  LY: "Egyptian",

  // North Africa
  TN: "Egyptian",
  DZ: "Egyptian",
  MA: "Egyptian",
  SD: "Egyptian",

  // Sub-Saharan Africa
  NG: "Egyptian",
  ET: "Egyptian",
  SO: "Egyptian",
  TZ: "Egyptian",
  KE: "Egyptian",
  UG: "Egyptian",
  GH: "Egyptian",
  CI: "Egyptian",
  SN: "Egyptian",
  ML: "Egyptian",
  MR: "Egyptian",
  NE: "Egyptian",
  CM: "Egyptian",

  // Pakistan & Afghanistan → Karachi
  PK: "Karachi",
  AF: "Karachi",

  // Bangladesh
  BD: "Karachi",

  // India
  IN: "Karachi",

  // Sri Lanka
  LK: "Karachi",

  // Central Asia
  KZ: "Karachi",
  UZ: "Karachi",
  TM: "Karachi",
  KG: "Karachi",
  TJ: "Karachi",
  AZ: "Karachi",

  // Southeast Asia → Singapore
  SG: "Singapore",
  MY: "Singapore",
  ID: "Singapore",
  BN: "Singapore",
  PH: "Singapore",
  TH: "Singapore",
  MM: "Singapore",
  KH: "Singapore",
  VN: "Singapore",

  // East Asia
  CN: "MuslimWorldLeague",
  JP: "MuslimWorldLeague",
  KR: "MuslimWorldLeague",

  // South America
  BR: "NorthAmerica",
  AR: "NorthAmerica",
  CO: "NorthAmerica",
  VE: "NorthAmerica",
  CL: "NorthAmerica",
  PE: "NorthAmerica",
};

export function suggestCalcMethod(isoCountryCode: string): CalcMethodId | null {
  const code = isoCountryCode.toUpperCase();
  return COUNTRY_METHOD_MAP[code] ?? null;
}

export function getCalcMethodLabel(methodId: CalcMethodId): string {
  return CALC_METHODS.find((m) => m.id === methodId)?.label ?? methodId;
}
