# Complete the production SEO follow-up

- Scope: `full` — public content text, public rendering, canonical host configuration and bounded operator/release tooling
- Model: `High reasoning — publication integrity, sanitization, deployment policy and server/client rendering boundaries must remain consistent`
- Branch: `feature/seo-production-follow-up`
- Base: `b39e3a6f` (fast-forwarded during the requested transfer to the main workspace; original implementation base `5f167b4696207a9fa22bc783783b05aee1629b66`)
- Status: `Submitted`

## Acceptance

- [x] Known production probe/host regressions are detected by a bounded public check and cannot silently pass acceptance.
- [x] The trusted www hostname pair is normalized consistently at build and runtime; arbitrary hosts never become redirect destinations.
- [x] Public content text is decoded correctly for both existing and newly ingested records, without changing identities, slugs or escaping guarantees.
- [x] Demonstrated initial rendering costs are reduced without hiding primary content or weakening locale/auth/publication behavior; before/after artifacts are retained.
- [x] Existing admin publication/recovery controls have a reviewable, tested operator plan; no guessed legacy mappings or invented provider facts are published.
- [x] Missing editorial ownership and Google account evidence remain explicit and fail complete acceptance rather than becoming successful skips.
- [x] Relevant API, root, lint, types, production build, bundle and browser checks pass; any unmet performance target remains accurately recorded.

## Verification

- Switched the main workspace to `feature/seo-production-follow-up` at the user's request. Original phase-21 staged binary diff and unrelated unstaged diffs were compared byte-for-byte with the backup and preserved. The previous worktree remains detached as a backup; it is not the active implementation.
- `npm run test --workspace api -- --runInBand --silent --json ...` — pass, 175 suites / 2514 tests on final application code; retained `reports/seo/2026-10-22/follow-up/api-unit.json`.
- GraphQL E2E — pass, 2 suites / 140 tests using disposable `seo_followup_test`; public detail/list text tested for all four content kinds with and without locale. The initial failing no-locale case was fixed before this final pass.
- Root lint and type-check — pass; final frontend and API production builds — pass. No schema, migration, dependency or GraphQL document changes.
- Bundle targets and ceilings — pass, all 23 public routes; home 223.6 → 219.0 KiB, catalog 180.2 → 177.3 KiB, course 211.1 → 211.2 KiB gzip. Deferred chunks 1607.9 → 1614.1 KiB; full reports retained.
- Browser — pass: English/French SSR, unpublished French variant 404, 360px layout, keyboard skip link, anonymous private-query absence, provider/organization role-specific queries, and loading/empty/error/success states.
- Focused security review — no new HTML sink; text stays escaped by React/JSON-LD; origins reject credentials; checks are read-only and bounded; aliases redirect only to configured trusted canonical origin. Backend authorization remains unchanged.
- `production-seo-check.mjs --self-test`, deployment policy/configuration checks, SEO diagnostic self-test and phase-21 evidence self-test/map check — pass.
- Public production technical check — correctly FAILS before this release: two probes still 200 and linked/listed; apex redirects absent. No production mutation performed. Withdraw the reviewed probes through admin before releasing the new mandatory smoke gate.
- Performance — final native/native comparison completed with five cold profiles per route/build and the same fixture API, with no concurrent build/test jobs: home LCP 2556 → 2556 ms, TBT 1398 → 1106 ms; catalog LCP 1956 → 1984 ms, TBT 494 → 467 ms; CLS 0 throughout. TBT target 200 ms remains unmet for both routes, home LCP misses 2500 ms. This is lab evidence, not field INP. All samples retained in `perf-mobile-native-pair.json`. Earlier sandbox failure and mixed-runtime measurements are retained separately and do not establish the final comparison.
- `Ready` refers to implementation and local code gates. It does not certify publication cleanup, final-image CI, deployment, all performance targets, editorial readiness, indexing or Google ranking. The user will deploy and request a fresh public audit afterwards.
- Operator handoff: `docs/seo/production-remediation.md` and `production-remediation.handoff.json`; Persian delivery evidence: `reports/seo/2026-10-22/follow-up/HANDOFF.fa.md`.
- User confirmed no provider identity or historic URL evidence is currently available; complete the tools/workflow and retain these as owner-review items.
- Production cleanup and deployment remain pending; this PR does not mutate production.

## Submission

- Commit: `75d1bec6` — `feat(seo): complete production follow-up safeguards`
- PR: [#322](https://github.com/loopskey/Loopskey-Monorepo/pull/322)
- CI: Pending
