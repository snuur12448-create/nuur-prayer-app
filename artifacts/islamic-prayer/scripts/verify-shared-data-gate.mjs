import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

if (process.platform !== "darwin") {
  throw new Error("Shared app/widget data-gate verification requires macOS/Xcode.");
}
const source = readFileSync(new URL("../native/NuurShared/AdhkarState.swift", import.meta.url), "utf8");
const start = source.indexOf("public enum SharedDataGate {");
const end = source.indexOf("\n/// Persistence contract", start);
assert.ok(start >= 0 && end > start, "extract the actual production gate, never a test reimplementation");
const temporary = mkdtempSync(join(tmpdir(), "nuur-shared-data-gate-"));
const swiftFile = join(temporary, "main.swift");
const executable = join(temporary, "verify-shared-data-gate");
writeFileSync(swiftFile, `import Foundation
import Darwin
${source.slice(start, end)}

let directory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let action = CommandLine.arguments[2]
func put(_ name: String, _ value: String) throws {
    try Data(value.utf8).write(to: directory.appendingPathComponent(name), options: .atomic)
}
switch action {
case "increment":
    for _ in 0..<50 {
        try SharedDataGate.withLock(directory: directory) { _ in
            let url = directory.appendingPathComponent("counter")
            let count = Int((try? String(contentsOf: url, encoding: .utf8)) ?? "0")!
            usleep(500)
            try put("counter", String(count + 1))
        }
    }
case "hold":
    try SharedDataGate.withLock(directory: directory) { _ in
        try put("holder-ready", "1")
        let deadline = Date().addingTimeInterval(10)
        while !FileManager.default.fileExists(atPath: directory.appendingPathComponent("release-holder").path) {
            guard Date() < deadline else { fatalError("holder timed out") }
            usleep(5000)
        }
    }
case "begin":
    try put("begin-requested", "1")
    try SharedDataGate.withLock(directory: directory) { try $0.begin() }
    try put("begin-finished", "1")
case "end":
    try SharedDataGate.withLock(directory: directory) { try $0.end() }
case "epoch":
    print(try SharedDataGate.withLock(directory: directory) { $0.epoch })
case "write":
    let expectedEpoch = CommandLine.arguments[3]
    let allowed = try SharedDataGate.withLock(directory: directory) { gate in
        guard !gate.active, expectedEpoch == gate.epoch else { return false }
        try put("accepted-write", expectedEpoch)
        return true
    }
    print(allowed ? "allowed" : "blocked")
default:
    fatalError("unknown action")
}
`);
const compile = spawnSync("xcrun", ["swiftc", "-module-cache-path", join(temporary, "module-cache"), swiftFile, "-o", executable], { encoding: "utf8" });
assert.equal(compile.status, 0, `${compile.stderr}\n${compile.stdout}`);
function worker(action, ...args) {
  const child = spawn(executable, [temporary, action, ...args]);
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", chunk => { stdout += chunk; });
  child.stderr.on("data", chunk => { stderr += chunk; });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", code => {
      if (code !== 0) reject(new Error(`${action} failed (${code}): ${stderr}`));
      else resolve(stdout.trim());
    });
  });
}
async function waitFor(name) {
  const deadline = Date.now() + 10_000;
  while (!existsSync(join(temporary, name))) {
    assert.ok(Date.now() < deadline, `timed out waiting for ${name}`);
    await delay(5);
  }
}

// Six independent processes contend on the same production flock/inode.
await Promise.all(Array.from({ length: 6 }, () => worker("increment")));
assert.equal(readFileSync(join(temporary, "counter"), "utf8"), "300", "no lost writes between app/widget processes");
const oldEpoch = await worker("epoch");
assert.equal(await worker("write", oldEpoch), "allowed");

const holding = worker("hold");
await waitFor("holder-ready");
const beginning = worker("begin");
await waitFor("begin-requested");
await delay(40);
assert.equal(existsSync(join(temporary, "begin-finished")), false, "maintenance cannot cross an existing native writer's lock");
writeFileSync(join(temporary, "release-holder"), "1");
await Promise.all([holding, beginning]);
const newEpoch = await worker("epoch");
assert.notEqual(newEpoch, oldEpoch);
assert.equal(await worker("write", newEpoch), "blocked", "a new process sees the durable closed gate");
await worker("end");
assert.equal(await worker("write", oldEpoch), "blocked", "an intent that read before reset cannot resurrect data after reopening");
assert.equal(await worker("write", newEpoch), "allowed");
await worker("end");
assert.equal(await worker("epoch"), newEpoch, "reopening is idempotent and never resets the epoch");

// The shared Adhkar callers must retain this epoch, including midnight reset.
assert.match(source, /state\.maintenanceEpoch = gate\.epoch/);
assert.match(source, /\(state\.maintenanceEpoch \?\? ""\) == gate\.epoch/);
assert.match(source, /maintenanceEpoch: state\.maintenanceEpoch/);
for (const path of ["../ios/NuurWidget/NuurAdhkarWidget.swift", "../native/NuurWidget-replacements/NuurAdhkarWidget.swift"]) {
  assert.match(readFileSync(new URL(path, import.meta.url), "utf8"), /maintenanceEpoch: persisted\.maintenanceEpoch/);
}
console.log("Shared data gate passed: six-process mutual exclusion, durable maintenance, writer draining, stale-intent epochs and widget midnight propagation.");
