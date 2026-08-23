import { gregorianToHijri, HIJRI_MONTHS_EN } from "./hijriCalendar";
import {
  applyPrayerOffsets,
  calculatePrayerTimes,
  type CalcMethodId,
  type HighLatRuleId,
  type MadhabId,
  type PolarResolutionId,
  type PrayerOffsets,
  type TimeFormat,
} from "./prayerTimes";
import { verseForDate } from "./widgetVerses";
import {
  dateByAddingDaysInTimeZone,
  dateKeyInTimeZone,
  type TimeZoneValue,
} from "./timeZone";

export const WIDGET_PRAYER_CACHE_DAYS = 35;

export interface WidgetPrayerDay {
  dateKey: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  hijri: string;
  verseAr: string;
  verseRef: string;
}

interface BuildWidgetPrayerScheduleInput {
  latitude: number;
  longitude: number;
  timezone: TimeZoneValue;
  startDate?: Date;
  days?: number;
  calcMethod: CalcMethodId;
  madhab: MadhabId;
  highLatRule: HighLatRuleId;
  polarResolution: PolarResolutionId;
  timeFormat: TimeFormat;
  prayerOffsets: PrayerOffsets;
}

/**
 * Precompute predictable prayer times for the widget extension. WidgetKit can
 * advance through this cache itself, so correct times do not depend on iOS
 * granting the JavaScript app a background-fetch window every day.
 */
export function buildWidgetPrayerSchedule({
  latitude,
  longitude,
  timezone,
  startDate = new Date(),
  days = WIDGET_PRAYER_CACHE_DAYS,
  calcMethod,
  madhab,
  highLatRule,
  polarResolution,
  timeFormat,
  prayerOffsets,
}: BuildWidgetPrayerScheduleInput): WidgetPrayerDay[] {
  const result: WidgetPrayerDay[] = [];

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const target = dateByAddingDaysInTimeZone(startDate, timezone, dayOffset);

    const raw = calculatePrayerTimes(
      latitude,
      longitude,
      timezone,
      target,
      calcMethod,
      madhab,
      highLatRule,
      timeFormat,
      polarResolution,
    );
    const times = applyPrayerOffsets(raw, prayerOffsets, timezone, timeFormat);
    const h = gregorianToHijri(raw.date);
    const verse = verseForDate(raw.date);

    result.push({
      dateKey: dateKeyInTimeZone(target, timezone),
      fajr: isoOrEmpty(times.fajr.time),
      sunrise: isoOrEmpty(times.sunrise.time),
      dhuhr: isoOrEmpty(times.dhuhr.time),
      asr: isoOrEmpty(times.asr.time),
      maghrib: isoOrEmpty(times.maghrib.time),
      isha: isoOrEmpty(times.isha.time),
      hijri: `${h.hDay} ${HIJRI_MONTHS_EN[h.hMonth - 1]} ${h.hYear}`,
      verseAr: verse.ar,
      verseRef: verse.ref,
    });
  }

  return result;
}

function isoOrEmpty(date: Date): string {
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
