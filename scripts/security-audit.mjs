import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mitigations = {
  "GHSA-86w9-cpqp-85rv": { name: "node-forge", version: "1.4.0" },
  "GHSA-vfj7-8cjw-p6xm": { name: "braces", version: "3.0.3" },
  "GHSA-hp3w-g68c-fv3c": { name: "sprintf-js", version: "1.0.3" },
};

// A version-only npm audit cannot see pnpm backports. Never suppress those
// advisories globally: require the installed-code exploit regressions first,
// and accept only the exact advisory + package + pinned version below.
const regressions = spawnSync(process.execPath, [join(root, "scripts/verify-security-patches.mjs")], {
  cwd: root, stdio: "inherit",
});
assert.equal(regressions.status, 0, "Installed security backports failed regression checks.");
const workspace = readFileSync(join(root, "pnpm-workspace.yaml"), "utf8");
for (const mitigation of Object.values(mitigations)) {
  const file = `patches/${mitigation.name}@${mitigation.version}.patch`;
  assert(existsSync(join(root, file)) && workspace.includes(file),
    `Missing tracked patch configuration: ${file}`);
}

const result = spawnSync("pnpm", ["audit", "--json"], {
  cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
});
if (result.error) throw result.error;
let report;
try { report = JSON.parse(result.stdout); }
catch { throw new Error(`Dependency audit did not return JSON: ${result.stderr || result.stdout}`); }
assert(report.advisories && report.metadata?.vulnerabilities && !report.error,
  "Dependency audit could not retrieve a complete vulnerability report.");

const unmitigated = [];
for (const advisory of Object.values(report.advisories)) {
  const mitigation = mitigations[advisory.github_advisory_id];
  const findings = advisory.findings ?? [];
  const covered = mitigation && advisory.module_name === mitigation.name &&
    findings.length > 0 && findings.every((finding) => finding.version === mitigation.version);
  if (covered) {
    console.log(`Upstream advisory remains visible; installed backport verified: ${advisory.github_advisory_id} (${mitigation.name}@${mitigation.version})`);
  } else {
    unmitigated.push(`${advisory.severity}: ${advisory.module_name} — ${advisory.url}`);
  }
}
console.log("Raw npm advisory counts:", report.metadata.vulnerabilities);
assert.equal(unmitigated.length, 0, `Unmitigated dependency advisories:\n${unmitigated.join("\n")}`);
console.log("Security gate passed: no unmitigated advisories; local backports remain explicitly reported.");
