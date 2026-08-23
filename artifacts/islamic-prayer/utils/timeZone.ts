import tzLookup from "tz-lookup";

/**
 * IANA timezone identifiers are the canonical representation. Numeric values
 * remain accepted only so locations saved by older Nuur releases keep working
 * offline until they can be upgraded.
 */
export type TimeZoneValue = string | number;

interface CivilParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function isValidIanaTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getDeviceTimeZone(): string | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidIanaTimeZone(zone) ? zone : null;
  } catch {
    return null;
  }
}

export function legacyOffsetForLongitude(longitude: number): number {
  return Math.max(-12, Math.min(14, Math.round(longitude / 15)));
}

/** Resolve the canonical IANA zone locally; precise coordinates never leave the device. */
export function timeZoneAtCoordinates(
  latitude: number,
  longitude: number,
): string | null {
  try {
    const zone = tzLookup(latitude, longitude);
    return isValidIanaTimeZone(zone) ? zone : null;
  } catch {
    return null;
  }
}

function numericParts(date: Date, offsetHours: number): CivilParts {
  const shifted = new Date(date.getTime() + offsetHours * 3_600_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
  };
}

function ianaParts(date: Date, timeZone: string): CivilParts {
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const values: Record<string, number> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

export function civilPartsInTimeZone(date: Date, timeZone: TimeZoneValue): CivilParts {
  return typeof timeZone === "string" && isValidIanaTimeZone(timeZone)
    ? ianaParts(date, timeZone)
    : numericParts(date, typeof timeZone === "number" ? timeZone : 0);
}

export function timeZoneOffsetHours(timeZone: TimeZoneValue, date: Date): number {
  if (typeof timeZone === "number") return timeZone;
  if (!isValidIanaTimeZone(timeZone)) return 0;
  const p = ianaParts(date, timeZone);
  const representedAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (representedAsUtc - Math.floor(date.getTime() / 1000) * 1000) / 3_600_000;
}

export function formatTimeInTimeZone(
  date: Date,
  timeZone: TimeZoneValue,
  format: "12h" | "24h" = "12h",
): string {
  if (!date || Number.isNaN(date.getTime())) return "--:--";
  if (typeof timeZone === "string" && isValidIanaTimeZone(timeZone)) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: format === "12h",
      hourCycle: format === "24h" ? "h23" : undefined,
    }).format(date);
  }

  const p = numericParts(date, typeof timeZone === "number" ? timeZone : 0);
  const mm = String(p.minute).padStart(2, "0");
  if (format === "24h") return `${String(p.hour).padStart(2, "0")}:${mm}`;
  return `${p.hour % 12 || 12}:${mm} ${p.hour >= 12 ? "PM" : "AM"}`;
}

export function dateKeyInTimeZone(date: Date, timeZone: TimeZoneValue): string {
  const p = civilPartsInTimeZone(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function dayOfWeekInTimeZone(date: Date, timeZone: TimeZoneValue): number {
  const p = civilPartsInTimeZone(date, timeZone);
  return new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
}

/**
 * Convert an instant to a device-local Date carrying the target zone's civil
 * Y/M/D. adhan.js reads those local calendar fields rather than a timezone.
 */
export function civilDateInTimeZone(date: Date, timeZone: TimeZoneValue): Date {
  const p = civilPartsInTimeZone(date, timeZone);
  return new Date(p.year, p.month - 1, p.day, 12, 0, 0, 0);
}

function instantForWallTime(parts: CivilParts, timeZone: TimeZoneValue): Date {
  const wallUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  if (typeof timeZone === "number") {
    return new Date(wallUtc - timeZone * 3_600_000);
  }

  // Two passes handle the rare case where the first offset guess straddles a
  // DST boundary. Noon is deliberately used by callers because it is safely
  // away from almost every civil-time transition.
  let candidate = new Date(wallUtc);
  for (let i = 0; i < 2; i++) {
    candidate = new Date(wallUtc - timeZoneOffsetHours(timeZone, candidate) * 3_600_000);
  }
  return candidate;
}

export function dateForCivilDateInTimeZone(
  year: number,
  month: number,
  day: number,
  timeZone: TimeZoneValue,
): Date {
  return instantForWallTime({ year, month, day, hour: 12, minute: 0, second: 0 }, timeZone);
}

/** Return target-zone noon on the civil day `dayOffset` from `base`. */
export function dateByAddingDaysInTimeZone(
  base: Date,
  timeZone: TimeZoneValue,
  dayOffset: number,
): Date {
  const baseParts = civilPartsInTimeZone(base, timeZone);
  const shifted = new Date(Date.UTC(baseParts.year, baseParts.month - 1, baseParts.day + dayOffset, 12));
  return instantForWallTime({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: 12,
    minute: 0,
    second: 0,
  }, timeZone);
}
