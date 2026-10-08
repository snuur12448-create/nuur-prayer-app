import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = new URL("../../../", import.meta.url);
const rights = JSON.parse(await readFile(new URL("release/content-rights.json", root), "utf8"));
const store = JSON.parse(await readFile(new URL("release/store-readiness.json", root), "utf8"));
for (const manifest of [rights, store]) {
  assert.equal(manifest.schemaVersion, 1);
  assert.match(manifest.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(manifest.scope.length > 20);
}
const itemIds = new Set(rights.items.map((item) => item.id));
for (const id of ["quran-arabic", "quran-sahih-translation", "quran-transliteration", "quran-word-data", "tafsir-ibn-kathir", "quran-recitations", "adhan-recordings", "curated-islamic-text", "fonts", "visual-assets"]) {
  assert.ok(itemIds.has(id), `missing content category: ${id}`);
}
assert.equal(itemIds.size, rights.items.length, "duplicate inventory item");
for (const item of rights.items) {
  assert.ok(["unverified", "license-evidence-found", "owner-approved"].includes(item.rightsStatus));
  assert.ok(item.sourceFiles.length > 0);
  assert.ok(item.evidence.length > 20);
  assert.ok(item.requiredOwnerAction.length > 20);
  for (const path of item.sourceFiles) await access(new URL(path, root));
  for (const url of [...item.attributionUrls, ...item.evidenceUrls]) assert.match(url, /^https:\/\//);
  if (item.rightsStatus === "owner-approved") {
    assert.ok(item.approvalEvidence?.reviewer && item.approvalEvidence?.reviewedAt && item.approvalEvidence?.record, `${item.id} needs actual owner approval evidence`);
  }
}
assert.equal(rights.bundledAdhanAssets.length, 5);
for (const asset of rights.bundledAdhanAssets) {
  const bytes = await readFile(new URL(asset.path, root));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256, `audio asset changed: ${asset.path}; review its provenance`);
}
assert.equal(store.platform.minimumAppIOS, "16.2");
assert.equal(store.platform.minimumWidgetIOS, "17.0");
assert.equal(store.monetization.intendedRelease, "free-no-pro");
assert.ok(store.encryptionEvidence.backupImplementation.includes("CryptoKit"));
assert.ok(store.encryptionEvidence.backupImplementation.includes("CommonCrypto"));
assert.ok(store.encryptionEvidence.technicalExemptionInference.includes("inference"));
assert.ok(store.encryptionEvidence.evidenceUrls.length >= 2);
for (const path of store.encryptionEvidence.sourceFiles) await access(new URL(path, root));
if (store.encryptionEvidence.ownerConfirmed) {
  const approval = store.encryptionEvidence.approvalEvidence;
  assert.ok(approval?.reviewer && approval?.reviewedAt && approval?.record, "encryption owner confirmation needs an actual evidence record");
}
for (const service of store.networkServices) {
  assert.ok(service.hosts.length && service.transmitted.length);
  for (const path of service.sourceFiles) await access(new URL(path, root));
}
for (const id of ["content-rights", "quran-foundation-offline", "public-policy", "support-and-domain", "privacy-labels", "export-compliance", "store-metadata", "free-build-environment", "physical-device-soak", "physical-audio-accessibility", "religious-content-review"]) {
  assert.ok(store.gates.some((gate) => gate.id === id), `missing publishing gate ${id}`);
}
for (const gate of store.gates) {
  assert.ok(["unverified", "approved"].includes(gate.status));
  if (gate.status === "approved") assert.ok(gate.approvalEvidence?.reviewer && gate.approvalEvidence?.reviewedAt && gate.approvalEvidence?.record, `${gate.id} needs a reviewer, date and evidence record`);
}
const unresolved = store.gates.filter((gate) => gate.status !== "approved");
const uncleared = rights.items.filter((item) => item.rightsStatus !== "owner-approved");
const ready = unresolved.length === 0 && uncleared.length === 0 && rights.ownerRightsConfirmed === true && store.encryptionEvidence.ownerConfirmed === true;
assert.equal(store.releaseReady, ready, "releaseReady must agree with documented owner gates and rights");
console.log(`Inventory structure/source paths/audio checksums verified. Publishing ${ready ? "has documented approvals" : "BLOCKED"}: ${unresolved.length} unresolved gates and ${uncleared.length} uncleared content categories.`);
if (!ready) {
  console.log(unresolved.map((gate) => `- ${gate.id}: ${gate.ownerAction}`).join("\n"));
  if (!process.argv.includes("--inventory-only")) process.exitCode = 2;
}
