import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import queueModule from "../utils/latestOnlyQueue.ts";

const { createLatestOnlyMutationQueue } = queueModule;

// Calls queued in the same turn are coalesced before any native mutation starts.
const enqueueSameTurn = createLatestOnlyMutationQueue();
const sameTurnEvents = [];
await Promise.all([
  enqueueSameTurn(async () => { sameTurnEvents.push("superseded"); }),
  enqueueSameTurn(async () => { sameTurnEvents.push("latest"); }),
]);
assert.deepEqual(sameTurnEvents, ["latest"]);

// If a replacement is already running, later requests wait for it. Only the
// newest waiting request runs, and cancel/create phases never overlap.
const enqueueDuringRun = createLatestOnlyMutationQueue();
const events = [];
let active = 0;
let maxActive = 0;
let releaseFirst;
let markFirstStarted;
const firstStarted = new Promise((resolve) => { markFirstStarted = resolve; });
const firstGate = new Promise((resolve) => { releaseFirst = resolve; });

const first = enqueueDuringRun(async () => {
  active += 1;
  maxActive = Math.max(maxActive, active);
  events.push("first:start");
  markFirstStarted();
  await firstGate;
  events.push("first:end");
  active -= 1;
});
await firstStarted;

const superseded = enqueueDuringRun(async () => { events.push("superseded"); });
const latest = enqueueDuringRun(async () => {
  active += 1;
  maxActive = Math.max(maxActive, active);
  events.push("latest:start");
  events.push("latest:end");
  active -= 1;
});
releaseFirst();
await Promise.all([first, superseded, latest]);

assert.equal(maxActive, 1, "notification replacement jobs must never interleave");
assert.deepEqual(events, ["first:start", "first:end", "latest:start", "latest:end"]);

const schedulerSource = await readFile(new URL("../utils/notifications.ts", import.meta.url), "utf8");
assert.match(schedulerSource, /await cancelManagedScheduledNotifications\(\);[\s\S]*scheduleNotificationAsync/, "old requests must be removed before replacements are created");
assert.match(schedulerSource, /identifier: req\.identifier \?\? `\$\{MANAGED_NOTIFICATION_ID_PREFIX\}/, "every prayer request must have an owned identifier");
assert.match(schedulerSource, /getAllScheduledNotificationsAsync/, "cleanup must discover requests after interrupted runs");
assert.match(schedulerSource, /catch \(error\)[\s\S]*cancelManagedScheduledNotifications/, "partial schedules must be cleaned up after failure");

console.log("Notification scheduler QA passed for coalescing, serialization, owned identifiers, and failure cleanup.");
