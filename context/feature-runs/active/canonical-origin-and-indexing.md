# canonical-origin-and-indexing

- Scope: `front`
- Model: `High reasoning — build-time configuration, trusted hosts and indexing policy have security and deployment consequences.`
- Branch: `feature/canonical-origin-and-indexing`
- Base: `553f084`
- Status: `Submitted`

## Acceptance

- [x] Production with a missing or invalid origin fails the build before any public page is produced.
- [x] Docker-built public metadata contains no localhost or internal API origin.
- [x] Changing the origin invalidates the relevant Turbo build cache.
- [x] Every static public route has a title, description and self-canonical.
- [x] Private and utility routes and non-production deployments emit server-visible noindex.
- [x] Controlled host aliases normalize without loops; untrusted hosts never reach canonical or social output.
- [x] Auth, OAuth, activation and dashboard behavior is unchanged.
- [x] Public assets stay crawlable and the fallback social card is served.

## Verification

- `npm run lint`, `npm run check-types`, `npm run build`, `npm run bundle-report --workspace front` — pass (per PR #280)
- Invalid-configuration builds, staging robots/header output, Turbo cache miss on origin change and the standalone artifact smoke check — performed manually (per PR #280)
- CI on PR #280 — pass

## Submission

- Commit: 4bee7c5
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/280
- CI: pass
