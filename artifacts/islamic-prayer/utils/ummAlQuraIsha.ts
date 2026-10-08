import { civilPartsInTimeZone, type TimeZoneValue } from './timeZone';

export type UmmAlQuraIshaPolicy = 'calendar' | 'fixed90' | 'fixed120';

// Preserve the former interval on existing installations until the user
// explicitly chooses the calendar policy or a local-authority override.
export const DEFAULT_UMM_AL_QURA_ISHA_POLICY: UmmAlQuraIshaPolicy = 'fixed90';

export interface UmmAlQuraIshaInfo {
  policy: UmmAlQuraIshaPolicy;
  intervalMinutes: 90 | 120;
  calendarStatus: 'used' | 'unavailable' | 'not-used';
  ramadanNight: boolean | null;
}

export function normalizeUmmAlQuraIshaPolicy(value: unknown): UmmAlQuraIshaPolicy {
  return value === 'calendar' || value === 'fixed90' || value === 'fixed120'
    ? value
    : DEFAULT_UMM_AL_QURA_ISHA_POLICY;
}

/**
 * The Umm al-Qura method uses 90 minutes, with 30 additional minutes during
 * Ramadan (Adhan's calculation-parameter guide). Ramadan's actual beginning
 * and end still depend on the authority followed by the user.
 *
 * In calendar mode this is an estimated *night* policy: Isha after sunset
 * belongs to the Islamic date represented by the following Gregorian daytime.
 * Thus the evening before the first calendar fasting day receives 120 minutes,
 * and the evening before calendar Eid returns to 90. Only the selected prayer
 * location's civil date is used; neither the phone zone nor its current hour
 * can alter a precomputed day's Isha.
 *
 * Use the runtime's explicit islamic-umalqura calendar, never the app's tabular
 * display calendar. Unsupported runtimes retain 90 minutes and expose metadata
 * for a visible warning; they must not silently substitute another calendar.
 */
export function resolveUmmAlQuraIsha(
  date: Date,
  timezone: TimeZoneValue,
  policyValue: unknown = DEFAULT_UMM_AL_QURA_ISHA_POLICY,
): UmmAlQuraIshaInfo {
  const policy = normalizeUmmAlQuraIshaPolicy(policyValue);
  if (policy !== 'calendar') {
    return {
      policy,
      intervalMinutes: policy === 'fixed120' ? 120 : 90,
      calendarStatus: 'not-used',
      ramadanNight: null,
    };
  }

  try {
    const civil = civilPartsInTimeZone(date, timezone);
    const nextDay = new Date(Date.UTC(civil.year, civil.month - 1, civil.day + 1, 12));
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', {
      calendar: 'islamic-umalqura',
      timeZone: 'UTC',
      month: 'numeric',
    });
    if (formatter.resolvedOptions().calendar !== 'islamic-umalqura') {
      throw new Error('Umm al-Qura calendar is unavailable');
    }
    const month = Number(formatter.formatToParts(nextDay).find(part => part.type === 'month')?.value);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error('Invalid Umm al-Qura calendar month');
    }
    const ramadanNight = month === 9;
    return { policy, intervalMinutes: ramadanNight ? 120 : 90, calendarStatus: 'used', ramadanNight };
  } catch {
    return { policy, intervalMinutes: 90, calendarStatus: 'unavailable', ramadanNight: null };
  }
}
