export const MANAGED_NOTIFICATION_ID_PREFIX = "nuur-managed-v2-";

const LEGACY_MANAGED_ID_PREFIXES = ["nuur-managed-v1-", MANAGED_NOTIFICATION_ID_PREFIX];
const PRAYER_KEYS = new Set(["fajr", "dhuhr", "asr", "maghrib", "isha", "sunrise", "tahajjud"]);
const MANAGED_TYPES = new Set([
  "prayer",
  "prayer-pre-reminder",
  "sunrise-reminder",
  "tahajjud-reminder",
  "jummah-reminder",
  "ayah-reminder",
  "hadith-reminder",
  "islamic-event",
]);
const LEGACY_ISLAMIC_EVENT_TITLES = new Set([
  "🌙 Islamic New Year",
  "💧 Day of Ashura",
  "💛 Mawlid al-Nabi ﷺ",
  "🌟 Laylat al-Mi'raj",
  "✨ Laylat al-Bara'ah",
  "🌙 First Day of Ramadan",
  "✨ Possible Laylatul Qadr",
  "🎉 Eid ul-Fitr",
  "🤲 Day of Arafah",
  "🎉 Eid ul-Adha",
  "🌙 Tomorrow: Islamic New Year",
  "🌙 Tomorrow: Day of Ashura",
  "🌙 Tomorrow: First Day of Ramadan",
  "🌙 Tomorrow: Eid ul-Fitr",
  "🌙 Tomorrow: Day of Arafah",
  "🌙 Tomorrow: Eid ul-Adha",
]);

export interface NotificationOwnershipCandidate {
  identifier?: string;
  content?: {
    title?: string | null;
    body?: string | null;
    data?: Record<string, unknown> | null;
  } | null;
}

function stableHash(value: string): string {
  // FNV-1a keeps identifiers compact and deterministic across JS runtimes.
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/**
 * A stable identifier for one logical delivery. Scheduling the same event from
 * a foreground and a background JS runtime therefore replaces/converges on the
 * same pending request instead of creating a second copy.
 */
export function buildManagedNotificationIdentifier(
  kind: string,
  key: string,
  fireTimeMs: number,
): string {
  const safeKind = kind.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "reminder";
  return `${MANAGED_NOTIFICATION_ID_PREFIX}${safeKind}-${stableHash(`${kind}|${key}|${fireTimeMs}`)}`;
}

/**
 * Recognize both current requests and the UUID-identified requests created by
 * older Nuur releases. This deliberately does not match the app's separate
 * streak/test notifications, so migrating a prayer schedule never deletes
 * unrelated alerts.
 */
export function isNuurManagedNotification(request: NotificationOwnershipCandidate): boolean {
  const identifier = request.identifier ?? "";
  if (LEGACY_MANAGED_ID_PREFIXES.some((prefix) => identifier.startsWith(prefix))) return true;

  const data = request.content?.data;
  if (data?.nuurManaged === true) return true;
  if (typeof data?.type === "string" && MANAGED_TYPES.has(data.type)) {
    if (data.type !== "prayer" && data.type !== "prayer-pre-reminder") return true;
    return typeof data.key === "string" && PRAYER_KEYS.has(data.key);
  }

  // Pre-ownership releases omitted data from optional reminders. Use their
  // exact, app-specific titles/bodies to migrate only Nuur's old requests.
  const title = request.content?.title ?? "";
  const body = request.content?.body ?? "";
  const oldPrayerTitle = title.match(/^[🌙🕛🕓🌆🌃🕌]\s(Fajr|Dhuhr|Asr|Maghrib|Isha) Prayer$/u);
  if (oldPrayerTitle && body.startsWith(`It is time for ${oldPrayerTitle[1]} in `)) return true;
  if (/^(?:[^A-Za-z0-9]+\s*)?(?:Fajr|Dhuhr|Asr|Maghrib|Isha) (?:at|in \d+ min)/.test(title)) return true;
  if (/^(?:[^A-Za-z0-9]+\s*)?Sunrise in \d+ minutes/.test(title)) return true;
  if (/^(?:[^A-Za-z0-9]+\s*)?Tahajjud window in \d+ min/.test(title)) return true;
  if (title === "Jummah Mubarak 🕌" && /(?:Friday prayer|Prayer) begins soon/.test(body)) return true;
  if (title === "☀️ Ayah of the Day" || title === "📖 Hadith of the Day") return true;
  if (LEGACY_ISLAMIC_EVENT_TITLES.has(title)) return true;
  if (body === "Prepare your heart, intentions, and du'a") return true;
  if (body.includes("Seek forgiveness and worship tonight")) return true;
  return false;
}
