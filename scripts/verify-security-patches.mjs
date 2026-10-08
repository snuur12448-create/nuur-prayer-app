import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expoCliPackage = realpathSync(
  resolve(root, "artifacts/islamic-prayer/node_modules/@expo/cli/package.json"),
);
const requireFromExpoCli = createRequire(expoCliPackage);
const reactNativePackage = realpathSync(
  resolve(root, "artifacts/islamic-prayer/node_modules/react-native/package.json"),
);
const requireFromReactNative = createRequire(reactNativePackage);
const communityCliPackage = realpathSync(
  requireFromReactNative.resolve("@react-native/community-cli-plugin/package.json"),
);
const requireFromCommunityCli = createRequire(communityCliPackage);

const forgePackage = requireFromExpoCli("node-forge/package.json");
const bracesPackage = requireFromExpoCli("braces/package.json");
const sprintfPackage = requireFromExpoCli("sprintf-js/package.json");
const metroPackage = requireFromExpoCli("metro/package.json");
const communityMetroPackage = requireFromCommunityCli("metro/package.json");

assert.equal(forgePackage.version, "1.4.0", "unexpected node-forge version");
assert.equal(bracesPackage.version, "3.0.3", "unexpected braces version");
assert.equal(sprintfPackage.version, "1.0.3", "unexpected sprintf-js version");
assert.equal(metroPackage.version, "0.83.3", "unexpected Metro version");
assert.equal(communityMetroPackage.version, "0.83.5", "unexpected community CLI Metro version");

const forge = requireFromExpoCli("node-forge");
const braces = requireFromExpoCli("braces");
const { sprintf } = requireFromExpoCli("sprintf-js");

const controlledRejection = (pattern) => (error) =>
  error instanceof RangeError && pattern.test(error.message);

// CVE-2026-85393 / GHSA-86w9-cpqp-85rv: node-forge used to accept an
// otherwise-valid DigestInfo containing extra children in DigestAlgorithm.
{
  const forgeRequire = createRequire(requireFromExpoCli.resolve("node-forge"));
  const { BigInteger } = forgeRequire("./jsbn");
  const asn1 = forge.asn1;
  const universal = asn1.Class.UNIVERSAL;
  const type = asn1.Type;

  const digest = forge.md.sha256.create().update("nuur-security-test", "utf8").digest().getBytes();
  const makeDigestInfo = (includeUnexpectedChild) => {
    const algorithm = [
      asn1.create(
        universal,
        type.OID,
        false,
        asn1.oidToDer(forge.pki.oids.sha256).getBytes(),
      ),
      asn1.create(universal, type.NULL, false, ""),
    ];

    if (includeUnexpectedChild) {
      algorithm.push(asn1.create(universal, type.OCTETSTRING, false, "unexpected"));
    }

    return asn1.toDer(
      asn1.create(universal, type.SEQUENCE, true, [
        asn1.create(universal, type.SEQUENCE, true, algorithm),
        asn1.create(universal, type.OCTETSTRING, false, digest),
      ]),
    ).getBytes();
  };

  const makeSignature = (digestInfo) => {
    const keyBytes = 256;
    const paddingLength = keyBytes - digestInfo.length - 3;
    assert.ok(paddingLength >= 8, "test DigestInfo must fit a PKCS#1 v1.5 block");
    return `\u0000\u0001${"\u00ff".repeat(paddingLength)}\u0000${digestInfo}`;
  };

  // Exponent 1 is intentionally used only to expose the encoded message to
  // the verifier without needing a private key in this deterministic test.
  const publicKey = forge.pki.rsa.setPublicKey(
    new BigInteger("ff".repeat(256), 16),
    new BigInteger("1", 10),
  );
  const validSignature = makeSignature(makeDigestInfo(false));
  const maliciousSignature = makeSignature(makeDigestInfo(true));

  assert.equal(publicKey.verify(digest, validSignature), true);
  assert.throws(
    () => publicKey.verify(digest, maliciousSignature),
    (error) =>
      error instanceof Error &&
      /valid RSASSA-PKCS1-v1_5 DigestInfo/.test(error.message),
    "node-forge must reject extra nested DigestAlgorithm elements",
  );
}

// CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm: bound both parsed patterns and
// caller-provided ASTs before recursive compile/expand/stringify operations.
{
  assert.deepEqual(braces.expand("a{b,c}d"), ["abd", "acd"]);

  const nestedPattern = `${"{".repeat(101)}x${"}".repeat(101)}`;
  assert.throws(
    () => braces.compile(nestedPattern),
    controlledRejection(/maximum nesting depth of 100/),
    "braces must reject excessive source nesting",
  );

  let deepAst = { type: "text", value: "x" };
  for (let index = 0; index < 5_000; index++) {
    const parent = { type: "root", nodes: [deepAst] };
    deepAst.parent = parent;
    deepAst = parent;
  }

  for (const [name, operation] of [
    ["compile", () => braces.compile(deepAst)],
    ["expand", () => braces.expand(deepAst)],
    ["stringify", () => braces.stringify(deepAst)],
  ]) {
    assert.throws(
      operation,
      controlledRejection(/maximum nesting depth of 100/),
      `braces.${name} must reject a deeply nested AST before recursion`,
    );
  }
}

// CVE-2026-97058 / GHSA-hp3w-g68c-fv3c: reject attacker-controlled width
// and precision values before toFixed/toExponential/toPrecision,
// JSON.stringify, padding, or truncation receives them.
{
  assert.equal(sprintf("%.2f", 1.234), "1.23");
  assert.equal(sprintf("%.0f", 1.6), "2");
  assert.equal(sprintf("%.3g", 12.345), "12.3");
  assert.equal(sprintf("%5s", "nuur"), " nuur");
  assert.equal(sprintf("%2j", { ok: true }), '{\n  "ok": true\n}');

  for (const format of ["%.101f", "%.101e", "%.101g", "%.0g", "%.101j", "%10001s", "%10001j"]) {
    assert.throws(
      () => sprintf(format, format.endsWith("j") ? { ok: true } : 1.25),
      (error) => error instanceof SyntaxError && /\[sprintf\].*(width|precision)/.test(error.message),
      `sprintf-js must reject ${format} with a controlled SyntaxError`,
    );
  }
}

// image-size@2 accepts image bytes, not the filename API removed in v2. Run
// Metro's real asset pipeline against a scaled image so a clean install cannot
// silently restore the incompatible pathname call in getAssetData.
{
  const fixtureDir = mkdtempSync(join(tmpdir(), "nuur-metro-asset-"));
  const fixturePath = join(fixtureDir, "nuur@2x.svg");
  try {
    writeFileSync(
      fixturePath,
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"></svg>',
    );
    for (const [label, metroRequire] of [
      ["Expo Metro 0.83.3", requireFromExpoCli],
      ["community CLI Metro 0.83.5", requireFromCommunityCli],
    ]) {
      const { getAssetData } = metroRequire("metro/private/Assets");
      const asset = await getAssetData(
        fixturePath,
        "assets/nuur@2x.svg",
        [],
        null,
        "/assets",
      );
      assert.equal(asset.width, 24, `${label} must read image bytes and apply the @2x scale`);
      assert.equal(asset.height, 12, `${label} must read image bytes and apply the @2x scale`);
      assert.equal(asset.type, "svg");
      assert.deepEqual(asset.scales, [2]);
    }
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
}

console.log(
  "Patch regressions passed for node-forge@1.4.0, braces@3.0.3, sprintf-js@1.0.3, metro@0.83.3, and metro@0.83.5.",
);
