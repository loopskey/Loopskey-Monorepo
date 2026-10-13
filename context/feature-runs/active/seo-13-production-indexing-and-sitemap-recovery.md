# SEO-13 Production indexing and sitemap recovery

- Scope: `front` (root deployment, Docker, Compose, CI and diagnostics; no API change)
- Model: `High reasoning — build/runtime visibility policy, deployment failure handling and production rollout cross several boundaries`
- Branch: `feature/seo-13-production-indexing-and-sitemap-recovery`
- Base: `2247d33`
- Status: `Submitted`

## Acceptance

- [x] A production-profile standalone container serves eligible home/catalog/detail without noindex and valid sitemap index/shards with 200.
- [x] Staging-profile build remains noindex, disallows crawling and follows its existing sitemap exclusion policy.
- [x] Missing production configuration and build/runtime policy drift fail before readiness with safe actionable output.
- [x] Private routes, filtered search, admin exclusions and missing translations retain the correct policy.
- [x] A scaled isolated fixture reconciles sitemap membership and lastmod; outage returns uncached 503.
- [x] The smoke check fails on deliberately injected noindex/sitemap errors and passes the good production fixture.
- [x] Operator release instructions identify exact probe records for review and distinguish code verification from live acceptance.

## Verification

- `node scripts/check-deployment-config.mjs` and `--self-test` — pass; seven damaged deployment configurations are rejected.
- `node scripts/deployment-policy.mjs --self-test` — pass; malformed origin paths, query/fragment, credentials, schemes and deployed local hosts are rejected before comparison. The persisted artifact is validated too.
- `node scripts/seed-sitemap-fixture.cjs --self-test` — pass; nine unsafe environments and six invalid counts are rejected without loading Prisma. A separate mocked-module-loader check confirms zero Prisma loads for a production-like environment.
- `node scripts/seo-audit.mjs --self-test` — pass; a missing production detail fixture now fails with FIXTURE_REQUIRED even without --require-all, while staging keeps its intentional skip. A controlled extra-shard fixture independently confirms SITEMAP_COVERAGE instead of a partial successful audit.
- Real Dockerfile.api and Dockerfile.front production/staging builds — pass. Verification tags: loopskey-seo13-api:verify, loopskey-seo13-front:verify-production and loopskey-seo13-front:verify-staging. Images record the base SHA 2247d33c7325472c223059b205cf54e51e4a134b as a test-build marker; this is working-tree verification, not a submitted/deployed commit. SHA-256 of the policy, audit and config files in the production image matches the workspace.
- `node scripts/verify-front-image.mjs --front-production loopskey-seo13-front:verify-production --front-staging loopskey-seo13-front:verify-staging --api-image loopskey-seo13-api:verify --courses 12053 --site-origin https://www.matrix.invalid --keep` — 81 checks passed, zero failed. Eleven invalid/mismatched runtime configurations never serve traffic; matching production/staging policies work. All 12,053 eligible courses reconcile once with correct lastmod, excluded/draft/archived/deleted rows stay absent, API outage produces uncached503 and recovery returns200. The seed uses its own seo_matrix_test database and NODE_ENV=test only for the seed process; the API still runs production mode.
- `npm.cmd run lint` and `npm.cmd run check-types` — pass at root, including API/frontend and public i18n slice checks. No application API/frontend source or GraphQL contract was changed; the meaningful changed-tooling self-tests and actual-image checks above cover the new behavior.
- Bundle report --check against the actual production image — pass; all23 public routes are within recorded ceilings. Original target budgets remain unmet and belong to follow-up17; no budget/ceiling was raised.
- Browser at360x800 — eligible home/fr/catalog/course have no noindex; excluded/search pages retain noindex; draft/missing-French return404; auth and staging retain noindex; no horizontal overflow in the scoped pages. Tab reaches navigation. Client GraphQL was blocked to avoid unrelated localhost services; SSR used the isolated real API. This does not claim authenticated interaction acceptance. Evidence: .tmp/seo13-verification/browser.json and catalog-mobile.png.
- `bash -n scripts/deploy.sh`, changed-script node --check, scoped Prettier and git diff --check — pass. The actual server deployment/rollback path was not executed.
- Image matrix log: .tmp/seo13-verification/image-matrix.log. Temporary verification containers/network are cleaned up after browser evidence; existing services are untouched.
- Live acceptance (actual host, deployment SHA/env tuple, public shards and probe withdrawal) — pending. Operator steps are in docs/seo/production-indexing-recovery.md; no production deployment or publication action occurred during this continuation.

## Submission

- Commit: 07b2d57
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/304
- CI: pending
