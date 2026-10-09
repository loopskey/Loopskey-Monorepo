# seo-03-server-rendered-content-and-metadata

- Scope: `full`
- Model: `High reasoning — server/client boundaries, API error classification, HTTP status behavior and a view-accounting change cross both applications.`
- Branch: `feature/seo-03-server-rendered-content-and-metadata`
- Base: `18ef6c1`
- Status: `Ready`

## Acceptance

- [x] A fresh no-JavaScript request contains primary published content for all four kinds; HTML does not depend on an RTK Query browser request.
- [x] Title/description/canonical/OG/Twitter identify the same content as the H1.
- [x] Missing/draft/deleted records return 404 and noindex before streaming.
- [x] Upstream timeout/GraphQL failure returns a safe 5xx and is not cached as 404.
- [x] Metadata/body reuse a request-scoped read and expose no personal state.
- [x] Social-card generation and metadata reads do not increment event views.
- [ ] Existing wishlist/enrollment/calendar/completion and external-source actions work after hydration; two users never see each other's interaction state. Not verified in a browser: no browser tooling was available in this session. The action components are unchanged and still receive the same props; only the data source moved from RTK Query to server props.

## Verification

- `npm run lint`, `npm run check-types` (root) — pass
- `npm run build` (root, `DEPLOYMENT_ENV=ci`) and `npm run bundle-report --workspace front` — pass; the four detail routes are dynamic and no dependency was added
- `npm run test --workspace api` — pass (147 suites, 2057 tests)
- `npm test --workspace front` — pass (existing suite, 27 tests); two existing social-card tests were updated for the new not-found vs upstream-failure contract
- `npm run codegen --workspace front` — run; `schema.gql` regenerated through the Nest schema builder with a stubbed database and differs from develop by exactly the `recordEventView` mutation
- Production build served against a mock GraphQL upstream (`next start`, curl):
  - course/event/podcast/youtube published slugs: 200, content and metadata in server HTML
  - unknown slug, draft slug (upstream not-found) and malformed slug: 404 with `<meta name="robots" content="noindex">`, requested slug is the only identifier in the body
  - upstream GraphQL internal error, HTTP 500 and 4s timeout: 500, never 404, `Cache-Control: no-store`
  - one upstream call per page render for a success (metadata and body share the read); the upstream sees no cookie and a correlation id
  - social cards: 200 PNG, 404 PNG for missing, 503 for upstream failure, all `no-store`
- API E2E (`test/public-catalog-boundary.e2e-spec.ts`, new event-view cases) — not run locally (no isolated test database); CI is the authoritative run
- Browser checks (hydration, keyboard, responsive, action states) — not run, no browser tooling available

## View accounting transition

- Before: every public `eventById`/`eventBySlug` read incremented `Event.views`, including crawlers, prefetch, retries and any server reader.
- After: reads are side-effect-free. A new public mutation `recordEventView(eventId)` increments `views` only for a published, non-deleted event. The event detail page calls it once per browser session per event from a small client island (`EventViewSignal`).
- The API bounds it per viewer address: one count per event per 30 minutes and at most 60 events per hour, held in process memory. With several API instances the bound applies per instance, so the metric is "deduplicated view events", not exact unique humans, and can overcount by at most the number of instances. A database-backed dedupe would need a table and was left out of this feature.
- Provider dashboards (overview, my events, analytics) keep reading `views`; their numbers will drop to browser-reported views, not crawler or server reads.

## Submission

- Commit:
- PR:
- CI:
