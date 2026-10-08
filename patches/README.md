# Dependency security backports

These patches are temporary, version-pinned backports for advisories that do
not yet have patched npm releases. `pnpm install --frozen-lockfile` applies
them through `patchedDependencies` in `pnpm-workspace.yaml`.

| Package | Advisory | Backport |
| --- | --- | --- |
| `node-forge@1.4.0` | [CVE-2026-85393 / GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | Reject extra nested `DigestAlgorithm` elements instead of accepting a malformed PKCS#1 v1.5 signature. Mirrors upstream commit `ceba34402e329f0365134f23fe19898756527d65`. |
| `braces@3.0.3` | [CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Enforce a nesting limit of 100 across parsing, direct AST compilation/expansion/stringification, and recursive array flattening. |
| `sprintf-js@1.0.3` | [CVE-2026-97058 / GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) | Bound field width and per-conversion precision before native numeric formatting, JSON formatting, padding, or truncation. The advisory affects all releases through 1.1.3. |

## Build compatibility patch

`metro@0.83.3` and `metro@0.83.5` are patched to pass file bytes to
`image-size@2.0.4` from their asset-data pipelines. Metro's published
implementation passed a pathname for ordinary files, but `image-size` v2
intentionally removed that API. Keeping the secure v2 override without this
adapter breaks production asset bundling. Both installed Metro consumers are
covered so Expo and React Native community CLI bundle paths behave alike.

Run `pnpm qa:security-patches` after every dependency install. The test proves
that ordinary behavior remains intact, each malicious-input class is rejected
by the patched runtime, and Metro can extract dimensions through its real
`getAssetData` path. When an upstream patched release is
available, upgrade it, remove only its matching patch and
`patchedDependencies` entry, reinstall with pnpm, and rerun this regression.
