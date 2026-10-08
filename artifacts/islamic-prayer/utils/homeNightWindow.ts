import type { PrayerTime, PrayerTimesResult } from "./prayerTimes";

/** Display-only view across two civil days. Today's tracker data stays separate. */
export type HomeNightWindow = Pick<PrayerTimesResult, "maghrib" | "isha" | "fajr" | "sunrise"> & {
  lastThird: Pick<PrayerTime, "time" | "timeString">;
};

export function buildHomeNightWindow(
  today: PrayerTimesResult,
  nowMs: number,
  adjacentDay: (offset: -1 | 1) => PrayerTimesResult,
  formatTime: (date: Date) => string,
): HomeNightWindow | null {
  const beforeMaghrib = nowMs < today.maghrib.time.getTime();
  const adjacent = adjacentDay(beforeMaghrib ? -1 : 1);
  const evening = beforeMaghrib ? adjacent : today;
  const morning = beforeMaghrib ? today : adjacent;
  const start = evening.maghrib.time.getTime();
  const isha = evening.isha.time.getTime();
  const fajr = morning.fajr.time.getTime();
  const sunrise = morning.sunrise.time.getTime();
  if (![start, isha, fajr, sunrise].every(Number.isFinite) ||
      !(start <= isha && isha < fajr && fajr < sunrise)) return null;
  const lastThird = new Date(start + (fajr - start) * 2 / 3);
  return {
    maghrib: evening.maghrib,
    isha: evening.isha,
    fajr: morning.fajr,
    sunrise: morning.sunrise,
    lastThird: { time: lastThird, timeString: formatTime(lastThird) },
  };
}
