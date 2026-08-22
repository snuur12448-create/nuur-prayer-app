import {
  Coordinates,
  CalculationMethod,
  HighLatitudeRule,
  Madhab,
  PolarCircleResolution,
  PrayerTimes,
} from 'adhan';

export interface PrayerTime {
  name: string;
  arabicName: string;
  time: Date;
  timeString: string;
}

export interface PrayerTimesResult {
  fajr: PrayerTime;
  sunrise: PrayerTime;
  dhuhr: PrayerTime;
  asr: PrayerTime;
  maghrib: PrayerTime;
  isha: PrayerTime;
  date: Date;
  /** Present only when a polar-day/night estimate replaced unavailable solar values. */
  polarFallback: PolarFallbackInfo | null;
}

export type CalcMethodId =
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Turkey'
  | 'Tehran';

export type MadhabId = 'Shafi' | 'Hanafi';

export type HighLatRuleId = 'TwilightAngle' | 'MiddleOfNight' | 'SeventhOfNight';

export type PolarResolutionId = 'AqrabBalad' | 'AqrabYaum' | 'Unresolved';

export interface PolarFallbackInfo {
  applied: true;
  resolution: Exclude<PolarResolutionId, 'Unresolved'>;
  label: string;
}

export type TimeFormat = '12h' | '24h';

export interface CalcMethodInfo {
  id: CalcMethodId;
  label: string;
  region: string;
  detail: string;
}

export const CALC_METHODS: CalcMethodInfo[] = [
  { id: 'MoonsightingCommittee', label: 'Nuur (UK)',             region: 'United Kingdom',     detail: 'Fajr 18° · Isha 18° · Moonsighting Committee' },
  { id: 'NorthAmerica',         label: 'ISNA',                  region: 'North America',      detail: 'Fajr 15° · Isha 15°' },
  { id: 'MuslimWorldLeague',    label: 'Muslim World League',   region: 'Europe & Far East',  detail: 'Fajr 18° · Isha 17°' },
  { id: 'Egyptian',             label: 'Egyptian',              region: 'Africa & Asia',      detail: 'Fajr 19.5° · Isha 17.5°' },
  { id: 'Karachi',              label: 'University of Karachi', region: 'Pakistan & South Asia', detail: 'Fajr 18° · Isha 18°' },
  { id: 'UmmAlQura',            label: 'Umm al-Qura',          region: 'Saudi Arabia',       detail: 'Fajr 18.5° · Isha 90 min' },
  { id: 'Dubai',                label: 'Dubai',                 region: 'UAE',                detail: 'Fajr 18.2° · Isha 18.2°' },
  { id: 'Kuwait',               label: 'Kuwait',                region: 'Kuwait',             detail: 'Fajr 18° · Isha 17.5°' },
  { id: 'Qatar',                label: 'Qatar',                 region: 'Qatar',              detail: 'Fajr 18° · Isha 90 min' },
  { id: 'Singapore',            label: 'Singapore',             region: 'Singapore & SE Asia', detail: 'Fajr 20° · Isha 18°' },
  { id: 'Turkey',               label: 'Turkey',                region: 'Turkey',             detail: 'Fajr 18° · Isha 17°' },
  { id: 'Tehran',               label: 'Tehran',                region: 'Iran & Shia regions', detail: 'Fajr 17.7° · Isha 14°' },
];

export const HIGH_LAT_RULES: { id: HighLatRuleId; label: string; detail: string }[] = [
  { id: 'TwilightAngle',  label: 'Twilight Angle', detail: 'Bounds Fajr and Isha using their twilight angles' },
  { id: 'MiddleOfNight',  label: 'Middle of Night', detail: 'Bounds both prayers to half of the night' },
  { id: 'SeventhOfNight', label: 'Seventh of Night', detail: 'Bounds both prayers to one seventh of the night' },
];

export const POLAR_RESOLUTIONS: { id: PolarResolutionId; label: string; detail: string }[] = [
  {
    id: 'AqrabBalad',
    label: 'Nearest Latitude',
    detail: 'Recommended · estimates from the nearest latitude with valid sunrise and sunset',
  },
  {
    id: 'AqrabYaum',
    label: 'Nearest Date',
    detail: 'Estimates from the closest date with valid sunrise and sunset',
  },
  {
    id: 'Unresolved',
    label: 'No Estimate',
    detail: 'Shows unavailable times so you can follow a trusted local timetable',
  },
];

export const DEFAULT_CALC_METHOD: CalcMethodId = 'MoonsightingCommittee';
export const DEFAULT_MADHAB: MadhabId = 'Shafi';
export const DEFAULT_HIGH_LAT_RULE: HighLatRuleId = 'TwilightAngle';
export const DEFAULT_POLAR_RESOLUTION: PolarResolutionId = 'AqrabBalad';
export const DEFAULT_TIME_FORMAT: TimeFormat = '12h';

const HIGH_LAT_RULE_IDS = new Set<HighLatRuleId>([
  'TwilightAngle',
  'MiddleOfNight',
  'SeventhOfNight',
]);

/** Migrate unsupported or stale persisted values to the app default. */
export function normalizeHighLatRule(value: unknown): HighLatRuleId {
  return typeof value === 'string' && HIGH_LAT_RULE_IDS.has(value as HighLatRuleId)
    ? value as HighLatRuleId
    : DEFAULT_HIGH_LAT_RULE;
}

const POLAR_RESOLUTION_IDS = new Set<PolarResolutionId>([
  'AqrabBalad',
  'AqrabYaum',
  'Unresolved',
]);

/** Migrate unsupported or stale persisted values to the recommended fallback. */
export function normalizePolarResolution(value: unknown): PolarResolutionId {
  return typeof value === 'string' && POLAR_RESOLUTION_IDS.has(value as PolarResolutionId)
    ? value as PolarResolutionId
    : DEFAULT_POLAR_RESOLUTION;
}

/**
 * Format a UTC Date using the target location's UTC offset.
 * adhan returns absolute UTC timestamps, so we offset manually for display
 * rather than relying on the browser's local timezone (which may differ from
 * the prayer location).
 */
function fmtWithTz(d: Date, tz: number, format: TimeFormat = '12h'): string {
  if (!d || isNaN(d.getTime())) return '--:--';
  const totalMins = d.getUTCHours() * 60 + d.getUTCMinutes() + Math.round(tz * 60);
  const h24 = ((Math.floor(totalMins / 60)) % 24 + 24) % 24;
  const m = ((totalMins % 60) + 60) % 60;
  const mm = m.toString().padStart(2, '0');
  if (format === '24h') {
    return `${h24.toString().padStart(2, '0')}:${mm}`;
  }
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const hh = h24 % 12 || 12;
  return `${hh}:${mm} ${ampm}`;
}

function buildParams(
  methodId: CalcMethodId,
  madhabId: MadhabId,
  highLatRuleId: HighLatRuleId,
  polarResolutionId: PolarResolutionId,
) {
  let params;

  switch (methodId) {
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'MuslimWorldLeague':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'Kuwait':
      params = CalculationMethod.Kuwait();
      break;
    case 'Qatar':
      params = CalculationMethod.Qatar();
      break;
    case 'Singapore':
      params = CalculationMethod.Singapore();
      break;
    case 'Turkey':
      params = CalculationMethod.Turkey();
      break;
    case 'Tehran':
      params = CalculationMethod.Tehran();
      break;
    case 'MoonsightingCommittee':
      params = CalculationMethod.MoonsightingCommittee();
      break;
    default:
      params = CalculationMethod.NorthAmerica();
      params.fajrAngle = 15.5;
  }

  params.madhab = madhabId === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  // adhan.js gives MoonsightingCommittee its own seasonal/one-seventh
  // overrides, which silently bypass `highLatitudeRule`. Preserve the
  // method's angles and minute adjustments while using the library's normal
  // high-latitude path so the rule selected in Nuur actually takes effect.
  if (methodId === 'MoonsightingCommittee') {
    params.method = 'Other';
  }

  switch (highLatRuleId) {
    case 'MiddleOfNight':
      params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
      break;
    case 'SeventhOfNight':
      params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
      break;
    case 'TwilightAngle':
      params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
      break;
    default:
      break;
  }

  switch (polarResolutionId) {
    case 'AqrabBalad':
      params.polarCircleResolution = PolarCircleResolution.AqrabBalad;
      break;
    case 'AqrabYaum':
      params.polarCircleResolution = PolarCircleResolution.AqrabYaum;
      break;
    case 'Unresolved':
      params.polarCircleResolution = PolarCircleResolution.Unresolved;
      break;
  }

  return params;
}

function hasUnavailableSolarTimes(pt: PrayerTimes): boolean {
  return [pt.fajr, pt.sunrise, pt.maghrib, pt.isha]
    .some((time) => !time || Number.isNaN(time.getTime()));
}

export function calculatePrayerTimes(
  lat: number,
  lng: number,
  timezone: number,
  date: Date = new Date(),
  methodId: CalcMethodId = DEFAULT_CALC_METHOD,
  madhabId: MadhabId = DEFAULT_MADHAB,
  highLatRuleId: HighLatRuleId = DEFAULT_HIGH_LAT_RULE,
  timeFormat: TimeFormat = DEFAULT_TIME_FORMAT,
  polarResolutionId: PolarResolutionId = DEFAULT_POLAR_RESOLUTION,
): PrayerTimesResult {
  const coordinates = new Coordinates(lat, lng);
  const normalizedPolarResolution = normalizePolarResolution(polarResolutionId);
  const params = buildParams(
    methodId,
    madhabId,
    normalizeHighLatRule(highLatRuleId),
    normalizedPolarResolution,
  );
  const pt = new PrayerTimes(coordinates, date, params);

  // adhan.js does not expose whether its polar resolver was used. Compare
  // against the same calculation with resolution disabled so the UI can
  // disclose an estimate only on dates that genuinely needed one.
  let polarFallback: PolarFallbackInfo | null = null;
  if (normalizedPolarResolution !== 'Unresolved') {
    const unresolvedParams = buildParams(
      methodId,
      madhabId,
      normalizeHighLatRule(highLatRuleId),
      'Unresolved',
    );
    const unresolved = new PrayerTimes(coordinates, date, unresolvedParams);
    if (hasUnavailableSolarTimes(unresolved) && !hasUnavailableSolarTimes(pt)) {
      polarFallback = {
        applied: true,
        resolution: normalizedPolarResolution,
        label: normalizedPolarResolution === 'AqrabBalad'
          ? 'Estimated using the nearest viable latitude'
          : 'Estimated using the nearest valid date',
      };
    }
  }

  const mk = (name: string, arabic: string, d: Date): PrayerTime => ({
    name,
    arabicName: arabic,
    time: d,
    timeString: fmtWithTz(d, timezone, timeFormat),
  });

  return {
    fajr:    mk('Fajr',    'الفجر',  pt.fajr),
    sunrise: mk('Sunrise', 'الشروق', pt.sunrise),
    dhuhr:   mk('Dhuhr',   'الظهر',  pt.dhuhr),
    asr:     mk('Asr',     'العصر',  pt.asr),
    maghrib: mk('Maghrib', 'المغرب', pt.maghrib),
    isha:    mk('Isha',    'العشاء', pt.isha),
    date,
    polarFallback,
  };
}

// ── Prayer time offset types & helpers ───────────────────────────────────────

export type PrayerOffsets = {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
};

export const DEFAULT_PRAYER_OFFSETS: PrayerOffsets = {
  fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
};

/**
 * Returns a new PrayerTimesResult with each prayer's time and display string
 * shifted by the corresponding minute offset.  Zero-offset prayers are
 * returned unchanged (same object reference) so downstream memo comparisons
 * don't trigger unnecessarily.
 */
export function applyPrayerOffsets(
  result: PrayerTimesResult,
  offsets: PrayerOffsets,
  timezone: number,
  timeFormat: TimeFormat = '12h',
): PrayerTimesResult {
  const shift = (pt: PrayerTime, mins: number): PrayerTime => {
    if (mins === 0) return pt;
    const shifted = new Date(pt.time.getTime() + mins * 60_000);
    return { ...pt, time: shifted, timeString: fmtWithTz(shifted, timezone, timeFormat) };
  };
  return {
    ...result,
    fajr:    shift(result.fajr,    offsets.fajr),
    sunrise: shift(result.sunrise, offsets.sunrise),
    dhuhr:   shift(result.dhuhr,   offsets.dhuhr),
    asr:     shift(result.asr,     offsets.asr),
    maghrib: shift(result.maghrib, offsets.maghrib),
    isha:    shift(result.isha,    offsets.isha),
  };
}

export function getNextPrayer(prayers: PrayerTimesResult): PrayerTime | null {
  const now = new Date();
  const list = [prayers.fajr, prayers.dhuhr, prayers.asr, prayers.maghrib, prayers.isha];
  for (const p of list) {
    if (p.time > now) return p;
  }
  return null;
}

export function getTimeUntilPrayer(prayer: PrayerTime): string {
  const diff = prayer.time.getTime() - Date.now();
  if (diff <= 0) return 'Now';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
