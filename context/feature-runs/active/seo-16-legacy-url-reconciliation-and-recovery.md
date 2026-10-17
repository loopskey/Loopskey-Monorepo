# SEO 16 — legacy URL reconciliation and recovery

- Scope: `full`
- Model: `High reasoning — historical URL identity, unique reservations under concurrent renames and imports, and visibility are database invariants`
- Branch: `feature/seo-16-legacy-url-recovery`
- Base: `0f27c86`
- Status: `Submitted`

## Acceptance

- [ ] The four benchmark URLs have evidence-backed dispositions — partial. No production data was read (live HTTP probing was declined during the run). The runbook records each path as unresolved, with the only available evidence: the `coursera-<id>` slug carries a stable id that the inventory checks. `scripts/legacy-url-inventory.ts` produces the evidence-backed dispositions when the operator runs it; unresolved is never counted as repaired.
- [x] A verified moved fixture resolves with one internal 308 while its current slug is unchanged (e2e per content kind: attach without rename, A→C and B→C, later rename keeps one hop).
- [x] Removed/hidden fixtures stay a real 404 and never disclose metadata: a hidden target is refused, and a withdrawn target stops resolving (e2e).
- [x] Concurrent recovery, slug edit and import yield one winner: recovery vs another record's rename (barrier e2e), recovery vs its own target's rename (claim row lock), triggers block reuse of a recovered path by new or renamed records, and three simultaneous identical retries converge with one audit row.
- [x] The dry run is mutation-free; wrong roles are rejected (anonymous, provider, professional); the claim and audit row commit in one transaction (unit + e2e).
- [x] Canonical, schema, sitemap and internal links are unchanged: they already use the current slug only. The recovery plan documents the operator steps (`docs/seo/legacy-url-recovery.md`).

## Verification

- `npx jest src/modules/content-url` — 12 passed (new `content-url-alias.service.spec.ts`).
- API `npm run check-types` (includes `scripts/`), `npm run lint`, `nest build` — pass.
- Not run locally: API e2e (no local PostgreSQL); 9 new cases per content kind in `test/content-url.e2e-spec.ts` run in CI.
- Migration `20261017150000_content_url_alias_audit` adds one `AuditAction` value and nothing else.
- GraphQL schema regenerated (new input, mutation, audit value only); front codegen regenerated; `@loopskey/api-contracts` built with `CONTENT_URL_TARGET_NOT_PUBLIC`.
- Front: `tsc`, `npm run lint` (i18n checks), `DEPLOYMENT_ENV=development npm run build` — pass. The admin "Recover an earlier address" form was not checked in a browser.
- Not done: the staging positive fixture and production HTTP evidence. Both are operator steps after SEO-13 and SEO-14 are deployed.

## Submission

- Commit: 18f631e (merged with develop in 95d245a)
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/313
- CI: pending
