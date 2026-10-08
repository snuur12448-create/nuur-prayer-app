import { z } from 'zod';
import { getExpectedVerseCount } from './quranIntegrity';

export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
export const MAX_ENCRYPTED_BACKUP_BYTES = 3 * 1024 * 1024;
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
});
const short = z.string().max(256);
const id = z.string().min(1).max(128);
const bool = z.enum(['true', 'false']);
const count = z.number().int().min(0).max(1_000_000);
const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const prayerCounts = z.object(Object.fromEntries(prayerKeys.map(key => [key, count]))).strict();
const stringIds = z.array(id).max(20_000);
const prayerSettings = z.object({
  enabled: z.boolean(), type: z.enum(['silent', 'notification', 'adhan']),
  adhanStyleId: id, adhanMode: z.enum(['short', 'full', 'silent']),
  days: z.array(z.number().int().min(0).max(6)).max(7),
  minutesBefore: z.union([z.literal(10), z.literal(20), z.literal(30)]).optional(),
}).strict();
const finiteOffset = z.number().finite().min(-180).max(180);
const json = (schema: z.ZodTypeAny) => (raw: string): boolean => {
  try { return schema.safeParse(JSON.parse(raw)).success; } catch { return false; }
};
const scalar = (schema: z.ZodTypeAny) => (raw: string) => schema.safeParse(raw).success;
const numberString = (min: number, max: number) => (raw: string) => /^\d+$/.test(raw) && Number(raw) >= min && Number(raw) <= max;
const validZone = z.union([z.number().finite().min(-12).max(14), z.string().max(100).refine(value => {
  try { new Intl.DateTimeFormat('en', { timeZone: value }).format(); return true; } catch { return false; }
})]);

// Each imported value is a string because that is AsyncStorage's contract.
// Validate the decoded value against its actual consumer, never import an
// arbitrary object/key or a device identity, entitlement, cache or OS request.
const validators: Record<string, (raw: string) => boolean> = {
  app_theme: scalar(z.enum(['emerald', 'midnight', 'gold', 'slate', 'burgundy'])),
  display_mode: scalar(z.enum(['auto', 'dark', 'light'])),
  calc_method: scalar(z.enum(['MoonsightingCommittee', 'NorthAmerica', 'MuslimWorldLeague', 'Egyptian', 'Karachi', 'UmmAlQura', 'Dubai', 'Kuwait', 'Qatar', 'Singapore', 'Turkey', 'Tehran'])),
  calc_method_source: scalar(z.enum(['auto', 'user'])),
  madhab: scalar(z.enum(['Shafi', 'Hanafi'])),
  madhab_source: scalar(z.enum(['auto', 'user'])),
  high_lat_rule: scalar(z.enum(['TwilightAngle', 'MiddleOfNight', 'SeventhOfNight'])),
  polar_resolution: scalar(z.enum(['AqrabBalad', 'AqrabYaum', 'Unresolved'])),
  umm_al_qura_isha_policy: scalar(z.enum(['fixed90', 'fixed120', 'calendar'])),
  time_format: scalar(z.enum(['12h', '24h'])),
  location_data: json(z.object({
    latitude: z.number().finite().min(-90).max(90), longitude: z.number().finite().min(-180).max(180),
    city: z.string().min(1).max(256), timezone: validZone, countryCode: z.string().regex(/^[A-Z]{2}$/).optional(),
  }).strict()),
  location_source: scalar(z.enum(['manual', 'gps', 'default', 'unknown'])),
  bookmarked_surahs: json(z.array(z.number().int().min(1).max(114)).max(114)),
  adhan_enabled: scalar(bool), adhan_style: scalar(id), adhan_mode: scalar(z.enum(['short', 'full', 'silent'])),
  prayer_notif_config: json(z.object(Object.fromEntries([...prayerKeys, 'sunrise', 'tahajjud'].map(key => [key, prayerSettings]))).strict()),
  prayer_offsets: json(z.object(Object.fromEntries([...prayerKeys, 'sunrise'].map(key => [key, finiteOffset]))).strict()),
  prayer_pre_reminder_minutes: scalar(z.enum(['0', '5', '10', '15'])),
  jummah_reminder_enabled: scalar(bool), jummah_minutes_before: numberString(0, 180),
  ayah_reminder_enabled: scalar(bool), ayah_reminder_hour: numberString(0, 23), ayah_reminder_minute: numberString(0, 59),
  hadith_reminder_enabled: scalar(bool), hadith_reminder_hour: numberString(0, 23), hadith_reminder_minute: numberString(0, 59),
  islamic_events_reminder: scalar(bool),
  nuur_prayer_tracker: json(z.record(day, z.object(Object.fromEntries(prayerKeys.map(key => [key, z.boolean().optional()]))).strict()).refine(value => Object.keys(value).length <= 40_000)),
  nuur_qada_ledger_v1: json(z.object({
    configured: z.boolean(), initial: prayerCounts, madeUp: prayerCounts,
    startedAt: z.string().max(40).refine(value => Number.isFinite(Date.parse(value))).nullable(),
    recentLog: z.array(day).max(20_000),
  }).strict()),
  nuur_daily_sunnah_v1: json(z.object({ date: day, ids: stringIds }).strict()),
  nuur_sunnah_streak_v1: json(z.object({ current: count, lastDate: day }).strict()),
  nuur_sunnah_history_v1: json(z.array(z.object({ date: day, count }).strict()).max(366)),
  nuur_streak_milestones: json(z.array(count).max(1000)),
  nuur_perfect_day_celebrated: scalar(day),
  nuur_saved_ayahs: json(z.array(z.string().regex(/^\d{1,3}:\d{1,3}$/).refine(value => {
    const [surah, ayah] = value.split(':').map(Number); return surah >= 1 && surah <= 114 && ayah >= 1 && ayah <= getExpectedVerseCount(surah);
  })).max(6236)),
  nuur_saved_hadiths: json(stringIds), nuur_saved_duas: json(stringIds), nuur_saved_mosques: json(stringIds),
  nuur_quran_auto_advance: scalar(bool),
  nuur_quran_last_playing: json(z.object({ surahNum: z.number().int().min(1).max(114), verseNum: z.number().int().min(1).max(286) }).strict().refine(value => value.verseNum <= getExpectedVerseCount(value.surahNum))),
  nuur_last_read_position: json(z.object({ surahNum: z.number().int().min(1).max(114), ayahNum: z.number().int().min(1).max(286), surahNameEn: short, surahNameAr: short }).strict().refine(value => value.ayahNum <= getExpectedVerseCount(value.surahNum))),
  nuur_hafidh_difficulty: scalar(z.enum(['easy', 'medium', 'hard'])),
  nuur_added_dhikr: json(z.array(z.object({ id, arabic: z.string().max(5000), transliteration: z.string().max(5000), translation: z.string().max(5000), target: count, color: z.string().regex(/^#[0-9A-Fa-f]{6}$/) }).strict()).max(500)),
  nuur_zakat_inputs: json(z.object(Object.fromEntries(['cash', 'metals', 'investments', 'business', 'receivables', 'other', 'debts'].map(key => [key, z.string().max(100)]))).strict()),
  nuur_zakat_currency: scalar(z.enum(['GBP', 'USD'])), nuur_zakat_nisab_type: scalar(z.enum(['gold', 'silver'])),
  'nuur:hadiths:showArabic': scalar(z.enum(['0', '1'])),
  'nuur:share:showArabic': scalar(z.enum(['0', '1'])), 'nuur:share:showEnglish': scalar(z.enum(['0', '1'])),
};
for (const key of ['nuur:share:lastTheme', ...['quran', 'hadith', 'dua', 'name', 'adhkar'].map(kind => `nuur:share:lastTheme:${kind}`)]) {
  validators[key] = scalar(z.string().regex(/^(dua|ayah|hadith|name)-v[1-4]$/));
}
export const BACKUP_KEYS = Object.freeze(Object.keys(validators));

export interface BackupPayload {
  format: 'nuur-personal-data';
  version: 1;
  createdAt: string;
  values: Record<string, string>;
}

export function utf8ByteLength(value: string): number {
  // encodeURIComponent counts UTF-8 without requiring a TextEncoder polyfill.
  try { return encodeURIComponent(value).replace(/%[A-F\d]{2}/gi, 'x').length; }
  catch { throw new Error('Backup contains invalid Unicode.'); }
}

export function validateBackupPayload(value: unknown): BackupPayload {
  if (value && typeof value === 'object' && 'values' in value) {
    const values = (value as { values: unknown }).values;
    if (values && typeof values === 'object' && Object.keys(values).some(key => !Object.hasOwn(validators, key))) {
      throw new Error('The backup contains an unsupported storage key.');
    }
  }
  const parsed = z.object({
    format: z.literal('nuur-personal-data'), version: z.literal(1),
    createdAt: z.string().datetime(), values: z.record(z.string()),
  }).strict().safeParse(value);
  if (!parsed.success) throw new Error('This is not a supported Nuur personal-data backup.');
  const data = parsed.data;
  if (utf8ByteLength(JSON.stringify(data)) > MAX_BACKUP_BYTES) throw new Error('The backup is too large.');
  for (const [key, raw] of Object.entries(data.values)) {
    if (!Object.hasOwn(validators, key) || raw.length > MAX_BACKUP_BYTES || !validators[key](raw)) {
      throw new Error(`Unsupported or invalid backup setting: ${key.slice(0, 80)}`);
    }
  }
  return data;
}

export function createBackupPayload(entries: readonly (readonly [string, string | null])[]): BackupPayload {
  const values = Object.fromEntries(entries.filter(([key, value]) => Object.hasOwn(validators, key) && value !== null)) as Record<string, string>;
  return validateBackupPayload({ format: 'nuur-personal-data', version: 1, createdAt: new Date().toISOString(), values });
}

// Reset is also explicit. Never clear unknown library storage or purchase /
// installation identity, and never infer ownership from the broad 'nuur' prefix.
const resetKeys = new Set([...BACKUP_KEYS, 'notifications_enabled', 'notif_snooze_until', 'notif_last_scheduled_at',
  'nuur_managed_notification_ids_v1', 'nuur_onboarding_done', 'nuur_notif_ritual_done', 'nuur_nisab_cache_v1']);
export function isClearableAppKey(key: string): boolean {
  return resetKeys.has(key) || /^nuur_quran_(verses|words)_v\d+_\d{1,3}$/.test(key) || /^nuur_tafsir_ibnkathir_v1_\d{1,3}$/.test(key);
}
