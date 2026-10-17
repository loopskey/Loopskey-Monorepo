# SEO 14 — canonical host and redirect consistency

- Scope: `front` and root deployment (next.config, site origin, deployment policy, SEO audit, deploy/CI wiring, runbook)
- Model: `High reasoning — redirect ordering, forwarded-header trust and session/OAuth compatibility affect security and sign-in`
- Branch: `feature/seo-14-canonical-host-redirects`
- Base: `2b109b4`
- Status: `Ready`

## Acceptance

- [x] HTTPS apex public paths redirect once to canonical www with the encoded path and full query; alias `/en/...` lands on the unprefixed www URL in the same hop (previously two).
- [x] The canonical host does not redirect to itself; forwarded-HTTP and `/en` normalization converge in one hop without loops.
- [x] Hostile `Host`, `X-Forwarded-Host` and `X-Forwarded-Proto` never produce an external destination; canonical, hreflang, JSON-LD, robots and sitemap hosts stay canonical (`LOCATION_FOREIGN` check on every audited route).
- [x] Canonical, sitemap, schema and hreflang hosts agree for en/fr routes under a hostile Host.
- [ ] Auth/OAuth/session flows from both hosts — operator-owned; settings and test procedure documented, not executed (no isolated accounts or ingress here).
- [x] Alias misconfiguration (scheme, port, path, canonical host) fails the build, the image policy record and container start-up (`ALIASES_INVALID`); the runbook covers ingress ownership, rollout and rollback.

## Verification

- Live reproduction 2026-10-17: `https://loopskey.com/` and `https://www.loopskey.com/` both 200 behind nginx; HTTP apex 301s to HTTPS apex (two hops to www).
- Production build (`DEPLOYMENT_ENV=production`, aliases `matrix.invalid`, `SITE_HTTPS_REDIRECT=true`) raw matrix: 24 cases incl. query/cursor/encoded path, uppercase and ported Host, lookalike host, `/en`, `/fr`, forwarded HTTP, hostile headers, `//` paths — pass.
- `seo-audit --profile hosts` against that build: 12/12 pass; with aliases unset: 4 pass, 8 skipped as not configured.
- `node scripts/seo-audit.mjs --self-test` — pass (mutations of the alias and hostile-location handlers are caught).
- `node scripts/deployment-policy.mjs --self-test`, `check-deployment-config.mjs` (+ `--self-test`), `seed-sitemap-fixture.cjs --self-test` — pass.
- Front: `tsc --noEmit`, `npm run lint`, `DEPLOYMENT_ENV=development npm run build` — pass.
- Not run locally: `verify-front-image.mjs` (Docker unavailable); CI builds the images with the alias and HTTPS redirect and runs the hosts profile inside the production container.
- Found, out of scope: `apps/front/proxy.ts` sits outside `src/`, so Next never registers it (empty middleware manifest; unauthenticated `/dashboard/admin` answers 200 locally and in production). Role routing is client/API-enforced only. Needs a separate feature.

## Submission

- Commit:
- PR:
- CI:
