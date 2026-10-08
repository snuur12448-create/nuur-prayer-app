export type ObligatoryPrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type PrayerAlertKind = "prayer" | "prayer-pre-reminder";

export interface PrayerAlertCandidate {
  dayIndex: number;
  key: ObligatoryPrayerKey;
  fireTimeMs: number;
  dayOfWeek: number;
  enabled: boolean;
  allowedDays: number[];
}

export interface PlannedPrayerAlert {
  kind: PrayerAlertKind;
  dayIndex: number;
  key: ObligatoryPrayerKey;
  fireTimeMs: number;
}

/**
 * Produce the reliability-critical part of the schedule. Actual prayer alerts
 * always come first; optional preparation reminders are additive and can be
 * dropped at the platform cap without replacing the prayer itself.
 */
export function buildPrayerAlertPlan(
  candidates: PrayerAlertCandidate[],
  options: { nowMs: number; snoozeUntil: number; preReminderMinutes: number },
): PlannedPrayerAlert[] {
  const eligible = candidates.filter((candidate) =>
    Number.isFinite(candidate.fireTimeMs) &&
    candidate.fireTimeMs > options.nowMs &&
    candidate.fireTimeMs >= options.snoozeUntil &&
    candidate.enabled &&
    candidate.allowedDays.includes(candidate.dayOfWeek),
  );

  const actual: PlannedPrayerAlert[] = eligible.map((candidate) => ({
    kind: "prayer",
    dayIndex: candidate.dayIndex,
    key: candidate.key,
    fireTimeMs: candidate.fireTimeMs,
  }));

  if (options.preReminderMinutes <= 0) return actual;
  const leadMs = options.preReminderMinutes * 60_000;
  const preparation = eligible
    .map((candidate): PlannedPrayerAlert => ({
      kind: "prayer-pre-reminder",
      dayIndex: candidate.dayIndex,
      key: candidate.key,
      fireTimeMs: candidate.fireTimeMs - leadMs,
    }))
    .filter((alert) => alert.fireTimeMs > options.nowMs && alert.fireTimeMs >= options.snoozeUntil);

  return [...actual, ...preparation];
}

/** Take the nearest item from each enabled optional feature in fair rounds. */
export function takeRoundRobin<T>(buckets: T[][], limit: number): T[] {
  const queues = buckets.map((bucket) => [...bucket]);
  const result: T[] = [];
  while (result.length < limit) {
    let added = false;
    for (const queue of queues) {
      const item = queue.shift();
      if (item === undefined) continue;
      result.push(item);
      added = true;
      if (result.length >= limit) break;
    }
    if (!added) break;
  }
  return result;
}
