# SEO-17 performance evidence, 2026-10-18

Baseline: `origin/develop` at `7671090`, built before any SEO-17 edit. After:
the `feature/seo-17-mobile-performance` working tree. Both were built with
`DEPLOYMENT_ENV=ci NEXT_PUBLIC_SITE_URL=https://www.loopskey.com
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5700/graphql next build` and served by
`next start` against `scripts/perf-fixture-api.mjs`. The fixture is an anonymous
visitor with deterministic data; no production or staging host was contacted.

Machine: Intel Core i5-1145G7 laptop, 8 threads, 16 GiB, Windows 11,
Chrome 155, Node 24. Its speed drifted by more than 2× during the day; every
sample records its unthrottled benchmark index.

| File                                        | What it is                                                                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bundle-before.json`, `bundle-after.json`   | `bundle-report --json` of the two builds: first-load JS per route, document size, deferred chunks                                                                  |
| `lab-mobile-paired.json`                    | **Comparison of record.** Twelve routes, mobile profile, five cold samples per build, alternating between the builds                                               |
| `lab-desktop-paired.json`                   | Same, desktop profile, four representative routes                                                                                                                  |
| `lab-mobile-paired-slow-api.json`           | Same, mobile, with 800 ms added to every fixture API response                                                                                                      |
| `lab-{mobile,desktop}-{before,after}*.json` | Earlier back-to-back runs of each build. Valid samples, but the machine was 1.7× faster during the baseline half, so they are not used for before/after comparison |

Reproduce with `scripts/perf-lab.mjs --compare-url`; see
`apps/front/docs/public-page-performance.md`.
