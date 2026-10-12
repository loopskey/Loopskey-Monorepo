# seo-12-search-observability-and-release-gates

- Scope: `full`
- Model: `High reasoning — public unauthenticated intake that must stay privacy-safe and bounded, atomic multi-instance counters, a rate limit shared across instances, a Prisma migration, a cross-context registration event, and CI and deployment gates that span both applications.`
- Branch: `feature/seo-12-search-observability-and-release-gates`
- Base: `e36eb50cb1f81915a50c72679e42dc31d3b6a5b7`
- Status: `Submitted`

Collection is built but switched off: `TELEMETRY_ENABLED` and `NEXT_PUBLIC_TELEMETRY_ENABLED` default to `false`. Turning either on needs the operator decision recorded in `docs/seo/telemetry-and-privacy.md`. Everything that needs an external account (Search Console, alert routing, a staging site with fixture content) is documented and left pending; none of it is claimed as done.

## Acceptance

- [x] Public metrics/events contain only documented allowlisted fields; sensitive query/token/email data is rejected or stripped before storage/export.
      The mutation takes enums, a bounded number and a random id; a url field, an email-shaped or short id, a route path, an unknown metric, a string value, a negative value, a client-sent completion, an unattributed event and an unknown locale are each rejected before anything is written (10 e2e cases). Stored rows hold only dimensions and counts, and the dedup key is a 32 character hash. Browser network capture of a course page shows the three requests carry only allowlisted fields, no cookie and no authorization header.
- [x] Duplicate events, invalid values, oversize batches and sustained intake are bounded; multi-instance rate limiting is demonstrated.
      A retried event counts once; twenty identical requests at one instant add one; 40 concurrent batches lose no increment; 30 batches touching the same rows in opposite orders do not deadlock. Batches over 12 vitals or 8 conversions are rejected. Two API instances on one database accept exactly 300 of 340 simultaneous requests and the rest are counted as rate limited.
- [x] Consent-disabled, offline and sink-failure states leave user flows functional.
      Disabled: the API acknowledges and writes nothing. In the browser, Global Privacy Control sent no request, offline sent none and the page still rendered, and an aborted telemetry request left the page working. A failed write is answered as dropped, never an error, and the batch is retryable because its dedup claim rolled back.
- [x] Registration success counts are backend-confirmed and do not expose identity.
      The count comes from an outbox event appended in the transaction that creates the user (the email path is covered by the end-to-end test; the OAuth path appends the same event in its own user-creating transaction); a wrong code creates nothing and appends nothing; redelivery counts once; the event and the stored row contain the role only. A browser cannot send the completion event.
- [x] Reports show p75/sample/window and insufficient-data state honestly.
      Below 100 page loads a segment reads "Not enough data" with no value; at 100 it is rated from the estimated 75th percentile. The admin tab shows the window, days with data, counted-of-received events and the bucket-width caveat. Checked with real rows: a 120-load segment read 1965 ms Good and a 108-load segment 5509 ms Poor.
- [x] Production HTTP diagnostic catches known bad canonical/noindex/status/schema/alternate/sitemap fixtures and passes good fixtures in CI/staging.
      `node scripts/seo-audit.mjs --self-test` serves good and bad fixtures in-process: every bad one is caught by its own rule and the good ones pass; two mutations of the script made the self-test fail. It runs in CI, and a second CI step audits the production build. The static profile passed 13 of 13 against a real production build, and asserting production against a CI-labelled build failed with the expected noindex and robots findings.
- [x] API E2E handles mutating visibility/failure fixtures without production writes.
      All mutation, failure and rate cases live in the API end-to-end suite on a disposable database. The diagnostic issues GET requests only, refuses to leave the base origin and has a request budget.
- [x] Search Console runbook and release checklist name operator responsibilities; external verification/submission is recorded only when actually performed.
      `docs/seo/search-console-runbook.md` and `docs/seo/release-checklist.md` assign owners as "to be named" and carry an action log with every row blank.
- [x] 7/28-day reviews and thresholds have an owner; organic uplift is not fabricated.
      The checklist has the day 7 and day 28 review tables, thresholds and the equivalent-period and data-lag rules. The owners are placeholders until named, which the checklist says plainly; no result is claimed.
- [x] Required frontend browser evidence exists without new frontend test files.
      See the browser verification below. No `*.test.*` file was added under `apps/front`.

## Verification

- `npm run lint` (root) — pass, including the public i18n slice drift check
- `npm run check-types` (root) — pass
- `npm run build` (root, `NEXT_PUBLIC_SITE_URL=https://ci.loopskey.invalid`, `DEPLOYMENT_ENV=ci`) — pass
- `npm run test --workspace api` — pass (166 suites, 2,314 tests)
- `npm run test:e2e --workspace api` on PostgreSQL 17, fresh database set to `TimeZone=UTC` — pass (48 suites, 757 tests), including `telemetry` (34 cases). The first full run failed two tests: one was a race in my own registration test with the application's background outbox poller, fixed in the test; the other, `outbox-delivery › keeps a live lease out of a second worker's reach`, timed out at 120 s, passed alone in 235 ms and passed in the second full run. Its cause was not identified.
- `npm run codegen --workspace front` — run; `telemetry` added to the domain list, no drift afterwards
- `npm run bundle-report --workspace front -- --check` — exit 0, all 23 public routes within their recorded ceilings. Built with collection enabled, public routes grew by about 1.4 to 1.8 KiB gzip; the telemetry reporter is a separate lazily loaded chunk and loads only when allowed.
- `node scripts/seo-audit.mjs --self-test` — pass
- `node scripts/seo-audit.mjs ... --profile static` against a local production build, as the new CI step runs it — 13 passed, 0 failed
- `node scripts/check-deployment-config.mjs` — pass; removing one build argument from `compose.production.yaml` in a copy made it fail
- Prisma: `20261012124743_telemetry_aggregates` applies to a fresh database and matches the schema; the generated `DROP INDEX` statements were removed first
- Browser (Chromium, production build with collection enabled against the real API on a disposable database): English and French pages classified correctly (mobile viewport reported as MOBILE, French about as `ABOUT/FR`); a course page sent LCP, INP and CLS plus one `CATALOG_DETAIL_OPEN` with no cookie or authorization header; registration start fired once per email on a stubbed register response; the sign-in page, offline mode, Global Privacy Control and an aborted request produced no telemetry and no broken page; the admin Search health tab showed success, empty and collection-off, error with retry, the 7 and 28 day toggle, no horizontal overflow at 360 px, and the window buttons are native buttons with `aria-pressed`
- Re-verified after a refactor: root lint, type-check and build, API unit tests (166 suites, 2,314 tests), full e2e on a fresh UTC database (48 suites, 757 tests), Prettier check on touched files, the diagnostic self-test and the deployment-config check — pass
- No frontend test was added

## Behaviour notes

- The telemetry module `telemetry` is owned by platform-shared, next to the rate limiter and the outbox. It stores daily counters in fixed value buckets rather than events, so a visit cannot be reconstructed; the 30 day raw-event allowance is unused.
- Collection needs both flags. The browser also stays silent for visitors sending Global Privacy Control or Do Not Track, and signed-in providers and administrators are excluded from acquisition events.
- The registration completion count also sits behind the API flag.
- The repository's privacy policy copy says users can manage cookies "via our cookie banner", and no banner exists in the code. This is recorded in `docs/seo/telemetry-and-privacy.md` for the operator and was not changed here.
- The generated GraphQL check in CI now fails on any change under `apps/front/src/lib/graphql`, including new untracked operation files, instead of only the legacy barrel.

## Not included

- A consent flow. The specification forbids inventing one; the switches stay off until the operator decides.
- The API-backed profile of the diagnostic in CI. The fixture slugs for the four content kinds, topic guide, provider, historic slug and missing translation are environment data, so the `full` profile is run against staging by the operator with `--require-all`, as the release checklist says. CI runs the self-test and the static profile.
- Search Console verification and sitemap submission, alert routing, named owners for the reviews and a real 7 and 28 day comparison. All depend on external access and a released site.
- Mobile lab traces and field data; those belong to the performance work and to real traffic.

## Submission

- Commit: `7662890`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/295
- CI: pending
