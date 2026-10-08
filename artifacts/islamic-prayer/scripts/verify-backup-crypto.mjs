import assert from "node:assert/strict";
import { createCipheriv, createDecipheriv, pbkdf2Sync } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

if (process.platform !== "darwin") {
  throw new Error("Native backup crypto verification requires macOS/Xcode; do not report it as passed on another platform.");
}
const temporary = mkdtempSync(join(tmpdir(), "nuur-backup-crypto-"));
const executable = join(temporary, "verify-backup-crypto");
const moduleCache = join(temporary, "module-cache");
const run = (command, args, input) => {
  const result = spawnSync(command, args, { input, encoding: "utf8", maxBuffer: 5 * 1024 * 1024 });
  assert.equal(result.status, 0, `${command} failed:\n${result.stderr}\n${result.stdout}`);
  return result.stdout;
};
run("xcrun", [
  "swiftc", "-module-cache-path", moduleCache,
  fileURLToPath(new URL("../ios/Nuur/NuurBackupCrypto.swift", import.meta.url)),
  fileURLToPath(new URL("./verify-backup-crypto.swift", import.meta.url)),
  "-o", executable,
]);
process.stdout.write(run(executable, []));

// Independent Node/OpenSSL reference vector, fixed salt/nonce for this test
// only. Production encryption always generates both with SecRandomCopyBytes.
const passphrase = "Nuur test 🔑 secret\0 exact UTF-8";
const plaintext = "{\"verse\":\"بِسْمِ اللَّهِ\",\"note\":\"e\u0301 Café 🤲\"}";
const salt = Buffer.from("000102030405060708090a0b0c0d0e0f", "hex");
const nonce = Buffer.from("101112131415161718191a1b", "hex");
const aad = Buffer.from("nuur-backup|1|PBKDF2-HMAC-SHA256|600000|AES-256-GCM");
const key = pbkdf2Sync(passphrase, salt, 600_000, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, nonce);
cipher.setAAD(aad);
const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
const reference = JSON.stringify({
  format: "nuur-backup", version: 1, cipher: "AES-256-GCM", kdf: "PBKDF2-HMAC-SHA256", iterations: 600_000,
  salt: salt.toString("base64"), nonce: nonce.toString("base64"), ciphertext: ciphertext.toString("base64"), tag: cipher.getAuthTag().toString("base64"),
});
assert.equal(run(executable, ["decrypt"], JSON.stringify({ envelope: reference, passphrase })), plaintext);

// Reverse interoperability proves the Swift KDF, UTF-8 and authenticated header
// are not merely self-consistent with a second copy of the same implementation.
const swiftEnvelope = JSON.parse(run(executable, ["encrypt"], JSON.stringify({ plaintext, passphrase })));
const swiftKey = pbkdf2Sync(passphrase, Buffer.from(swiftEnvelope.salt, "base64"), 600_000, 32, "sha256");
const decipher = createDecipheriv("aes-256-gcm", swiftKey, Buffer.from(swiftEnvelope.nonce, "base64"));
decipher.setAAD(aad);
decipher.setAuthTag(Buffer.from(swiftEnvelope.tag, "base64"));
assert.equal(Buffer.concat([decipher.update(Buffer.from(swiftEnvelope.ciphertext, "base64")), decipher.final()]).toString("utf8"), plaintext);
console.log("Backup crypto interoperability passed: independent Node/OpenSSL vector decrypts in Swift, and Swift encrypts for Node, with Unicode and embedded-NUL passphrases.");
