# seo-01-public-catalog-boundary

- Scope: `api`
- Model: `High reasoning — publication authorization crosses four domains and can break authenticated workflows if applied indiscriminately (selected per context/model-selection.md; the active model is chosen by the client, not this record).`
- Branch: `feature/seo-01-public-catalog-boundary`
- Base: `553f084`
- Status: `Ready`

## Acceptance

- [x] For each content kind, unknown, draft, archived and deleted detail records are indistinguishable through public by-ID and by-slug responses.
- [x] Anonymous public lists/searches cannot select `DRAFT` or `ARCHIVED`.
- [x] Featured lists, facets and children cannot disclose hidden records.
- [x] Correct-owner management works; anonymous, wrong-role and wrong-owner management access fails.
- [x] Existing published content and explicit assignment/enrollment readers work.
- [x] API tests and regenerated contract checks pass (no GraphQL schema or frontend document changed, so no regeneration was needed).

## Verification

- `npm run lint --workspace api` — pass
- `npm run check-types --workspace api` — pass
- `npm run test --workspace api` — pass (145 suites, 2046 tests)
- `npm run build --workspace api` — pass
- `npx tsc --noEmit -p test/tsconfig.json` — pass
- `npm run test:e2e --workspace api` (`test/public-catalog-boundary.e2e-spec.ts`) — not run locally: the only configured database is the development one, which the E2E safety guard refuses. CI is the authoritative run.

## Submission

- Commit:
- PR:
- CI:
