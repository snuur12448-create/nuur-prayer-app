import {
  Coordinates,
  CalculationMethod,
  HighLatitudeRule,
  Madhab,
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
}

export type CalcMethodId =
  | 'NuurUK'
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
  | 'Tehran'
  | 'MoonsightingCommittee';

export type MadhabId = 'Shafi' | 'Hanafi';

export type HighLatRuleId = 'TwilightAngle' | 'MiddleOfNight' | 'SeventhOfNight' | 'None';

export type TimeFormat = '12h' | '24h';

export interface CalcMethodInfo {
  id: CalcMethodId;
  label: string;
  region: string;
  detail: string;
}

export const CALC_METHODS: CalcMethodInfo[] = [
  { id: 'NuurUK',               label: 'Nuur (UK)',             region: 'United Kingdom',     detail: 'Fajr 15.5° · Isha 15° · Best for UK/Ireland' },
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
  { id: 'MoonsightingCommittee', label: 'Moonsighting Committee', region: 'West',             detail: 'Fajr 18° · Isha 18°' },
];

export const HIGH_LAT_RULES: { id: HighLatRuleId; label: string; detail: string }[] = [
  { id: 'TwilightAngle',  label: 'Twilight Angle', detail: 'Best for UK & Europe (recommended)' },
  { id: 'MiddleOfNight',  label: 'Middle of Night', detail: 'Splits night between Maghrib & Fajr' },
  { id: 'SeventhOfNight', label: 'Seventh of Night', detail: 'Uses 1/7th of night duration' },
  { id: 'None',           label: 'None', detail: 'No adjustment applied' },
];

export const DEFAULT_CALC_METHOD: CalcMethodId = 'NuurUK';
export const DEFAULT_MADHAB: MadhabId = 'Shafi';
export const DEFAULT_HIGH_LAT_RULE: HighLatRuleId = 'TwilightAngle';
export const DEFAULT_TIME_FORMAT: TimeFormat = '12h';

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

function buildParams(methodId: CalcMethodId, madhabId: MadhabId, highLatRuleId: HighLatRuleId) {
  let params;

  switch (methodId) {
    case 'NuurUK':
      params = CalculationMethod.NorthAmerica();
      params.fajrAngle = 15.5;
      break;
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

  switch (highLatRuleId) {
    case 'MiddleOfNight':
      params.highLatitudeRule = HighLatitudeRule.MiddleOfNight;
      break;
    case 'SeventhOfNight':
      params.highLatitudeRule = HighLatitudeRule.SeventhOfNight;
      break;
    case 'TwilightAngle':
      params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
      break;
    case 'None':
    default:
      break;
  }

  return params;
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
): PrayerTimesResult {
  const coordinates = new Coordinates(lat, lng);
  const params = buildParams(methodId, madhabId, highLatRuleId);
  const pt = new PrayerTimes(coordinates, date, params);

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
