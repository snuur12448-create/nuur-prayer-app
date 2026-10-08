# adhan.js prayer-time reference fixtures

These eight JSON files are test-only copies of the published prayer-time fixtures in
[batoulapps/adhan-js](https://github.com/batoulapps/adhan-js), imported on
2026-10-08 from tag `v4.4.3` at commit
`b6e5ddff3c8f596434443bbeb0467f0eeff8b5af`.

They are independent reference observations used to regression-test Nuur's
`calculatePrayerTimes` wrapper. They were not generated from Nuur. Each file
retains the upstream coordinates, timezone, calculation method, madhab,
high-latitude rule, source citations, allowed minute variance, and expected
prayer times.

| Vendored file | Upstream file | Git blob | Vendored SHA-256 |
| --- | --- | --- | --- |
| `Ankara-Turkey.json` | [source](https://github.com/batoulapps/adhan-js/blob/v4.4.3/Shared/Times/Ankara-Turkey.json) | `cb7da2c8362256cc46e730a3c0d80476ac64d6c8` | `fe2936ccb68715ab969b35d3c1685c3c5824c7a8ef11e8598759c2464bf21638` |
| `Doha-Qatar.json` | [source](https://github.com/batoulapps/adhan-js/blob/v4.4.3/Shared/Times/Doha-Qatar.json) | `27d86d07699873d5f149171b96ae4284112390d8` | `dee4502f5addf059ac77227739ad98e9753f9c1ddc2259ef5f8cf849853b8008` |
| `Dubai-Gulf.json` | [source](https://github.com/batoulapps/adhan-js/blob/v4.4.3/Shared/Times/Dubai-Gulf.json) | `37435daf6d7c63fe64131c3477c612e77dcfe71c` | `54d47da3c7d104d16f021b288ca46b00510077cfd3f02d8c23d2fb20b488c029` |
| `Kuwait City-Kuwait.json` | [source](https://github.com/batoulapps/adhan-js/blob/v4.4.3/Shared/Times/Kuwait%20City-Kuwait.json) | `66203a8ca46ffcdabca37126d593c89a3c07d514` | `b0c5208795e8dc6e9a467af784351cbae08f1ca3eba6903e6e1b6d4ab3e7909b` |
| `London-MoonsightingCommittee.json` | [source](https://github.com/batoulapps/adhan-js/blob/v4.4.3/Shared/Times/London-MoonsightingCommittee.json) | `09ecb0740b0cbfd7b60e5bcba491166f73cf6cf1` | `959ca817d8918f031485b720b1cb8040d4c64c2614702f6b3818be8016894bff` |
| `Makkah-UmmAlQura.json` | [source](https://github.com/batoulapps/adhan-js/blob/v4.4.3/Shared/Times/Makkah-UmmAlQura.json) | `9dd69fb3d9c25540e6ccca78b34336e7c90d1afe` | `d283f8a2b616e3ccdeef5d6b0df0b667a6ab309ca1868f1e70da1f99c2bbb2d6` |
| `Singapore-Singapore.json` | [source](https://github.com/batoulapps/adhan-js/blob/v4.4.3/Shared/Times/Singapore-Singapore.json) | `354c44dbc4e0d05ff70f77c0c73cdf97436d2236` | `873e3f0a5b0d83f0fd39c10c58d7f9c51e7b47f544be58b27448326451bd103f` |
| `Tehran-Tehran.json` | [source](https://github.com/batoulapps/adhan-js/blob/v4.4.3/Shared/Times/Tehran-Tehran.json) | `ed8be5c9646c346d33e50cd8b45a27949b1b6a9d` | `6dcc82070c4324cbca01e204f426404e61ad4318882728e941af02492bc5cbf8` |

The upstream project distributes this material under the MIT License; its
license text is preserved in `LICENSE.adhan-js` in this directory. The fixture
source citations remain part of each JSON file.

## Known scope boundary

The pinned adhan.js `UmmAlQura` preset uses a fixed 90-minute Isha interval.
It does **not** automatically apply the customary Ramadan extension to 120
minutes (+30). The upstream Makkah fixture has no Ramadan date, so it does not
test that convention. Nuur continues to use the library's published preset;
this regression does not silently introduce a local jurisprudential policy.
