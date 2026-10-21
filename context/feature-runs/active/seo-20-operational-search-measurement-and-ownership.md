# SEO 20: Operational search and conversion measurement with named ownership

- Scope: `full` (API telemetry report and intake; admin Search health view; root tooling and operational documentation)
- Model: `High reasoning — privacy decisions, public telemetry limits, registration truth and aggregate reporting cross trust boundaries, and the sink must not starve the business database pool`
- Branch: `feature/seo-20-search-measurement-and-ownership`
- Base: `2ae03f9`
- Status: `Ready`

## Acceptance

- [x] An authorized operator sees collection disabled, partial coverage from sampling, no data in the window, insufficient samples, delivery or storage failure and available aggregates as separate states, with only sanitized configuration status exposed (`searchHealthReport.collection`, ADMIN only, no environment values).
- [x] The browser lifecycle (en/fr public views, catalog-detail open, external action, registration start, pagehide flush, retry, dedup, GPC/DNT, offline, role exclusion, signed-out without auth cookies) was exercised against a real API and a scratch database and recorded below.
- [x] Payloads stay sanitized, retry stays bounded and concurrent dedup and limits hold; a blocked sink drops bounded telemetry without holding the shared database pool or delaying business reads. The new isolation tests fail against the previous sink and pass now.
- [x] Registration completion is confirmed by the backend once for both the email and the OAuth path, is separate from click and start events, and a forged completed event from a browser is rejected.
- [x] Reports show window, sample count, coverage and an insufficient status below 100 loads, per route template, locale and device (conversions now carry locale too).
- [x] The operator manifest and Search Console runbook record owners, destinations and results as explicit pending items; nothing operator-owned is presented as done.
- [x] A 7/28-day Search Console review artifact can be produced from authorized exports (`scripts/search-console-review.mjs`) and keeps unavailable data distinct from zero and lab data distinct from field data.
- [x] Enablement conditions and rollback are documented; no production tracking was switched on, and the open privacy-page copy item is recorded rather than edited.

## Verification

The gates below were re-run after the author's refactor, on the branch at `origin/develop` (`2ae03f9`). The browser evidence further down was taken before the refactor and covers behaviour the refactor did not change; the database suites that cover the same paths were re-run.

- `npx tsc --noEmit -p tsconfig.check.json` and `npx eslint src` (apps/api) — pass
- `npx jest` (apps/api) — 174 suites, 2,507 tests pass, including new specs for the notice rules, the sampling rate and the sink gate
- `npx jest --config ./test/jest-e2e.json` against a fresh throwaway PostgreSQL 17 (UTC), all 77 migrations applied — 51 suites, 841 tests pass, including the extended `telemetry.e2e-spec.ts` (43 tests): the collection status and notices, the OAuth registration path, a start never counting as a completion, 30 simultaneous batches against a locked aggregate table, and recovery after the lock clears
- The two sink-isolation tests were run against the previous sink code and failed (batches blocked for 10 to 13 seconds); they pass with the bounded sink
- `npm run codegen`, `npm run i18n-slice`, `npx tsc --noEmit` and `npm run lint` (apps/front) — pass, no generated drift
- `npm run build` and `npm run bundle-report -- --check-targets --check-ceilings` (apps/front) — pass with collection disabled (home 222.8 KiB gzip) and with collection enabled (home 223.0 KiB gzip); targets 300, ceiling 237
- `node scripts/search-console-review.mjs --self-test` — 28 checks pass; the self-test is added to the CI "SEO diagnostic self-test" step. It caught and fixed a calendar-date bug (`2026-02-31` was accepted)
- Browser lifecycle (headless Chrome, real API, scratch database, collection on, 37 checks pass): signed-out English desktop and French mobile views send only allowlisted fields with the right template, locale and device; a sentinel cookie for the host is absent from telemetry requests while ordinary API calls carry it; a search-referred content page records one open with the `ORGANIC_SEARCH` category and no referrer; an external link clicked just before leaving is delivered on pagehide; the real registration form records a start with the role only (the register request was answered by a stand-in, so no email was sent); GPC and DNT visitors send nothing; offline sends nothing and raises no error, and only the new action is delivered after reconnecting; a refused first attempt is retried once with the same ids and counted once, and replaying the body is recognised as already counted; the aggregate tables hold no column for a URL, session or user
- Browser, admin Search health (real sign-in as a scratch administrator): data present (partial coverage, insufficient samples, aggregates available), API flag off while the build is on (disabled and mismatch notices), the report request failing then retried, desktop and 390 px with no overflow, French with no untranslated keys; a signed-in administrator opening a content page was not counted as acquisition

Not run:

- Real Search Console exports, DNS verification, property ownership, sitemap submission and the alert routing test: these are operator actions on external systems and are pending in `docs/seo/operator-manifest.md`
- Any production or staging deployment, and the production values of both telemetry flags
- A keyboard-only pass of the admin Search health tab beyond its native buttons, and a screen reader pass
- The privacy decision and the privacy-page copy reconciliation: owner decisions, recorded as open

## Submission

- Commit:
- PR:
- CI:
