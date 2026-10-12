# seo-10-content-hubs-and-provider-pages

- Scope: `full`
- Model: `High reasoning — new publication models, provider-data privacy, review and approval races, two Prisma models families with a migration and URL-registry triggers, cross-context ports and public sitemap and redirect behaviour across API and frontend.`
- Branch: `feature/seo-10-content-hubs-and-provider-pages`
- Base: `f22ded9b83d50b2db2b8c8da481aabdb759e38d2`
- Status: `Submitted`

## Acceptance

- [x] A reviewed substantive hub is reachable by real internal links and renders guidance plus only eligible content in server HTML.
      Browser against the production build and a real API: the hub created and published in the administrator editor is linked from the homepage section and from the course and event pages, and its server HTML contains the guidance, section text and only the two visible items; a draft or hidden item is absent. French is served only after the translation is published.
- [x] Provider editing creates a private draft; only explicit admin approval changes the public revision, and withdrawal removes public eligibility.
      22 provider specs: a draft has no public page, an edit of a live profile leaves the approved revision live, approval creates revision 2, withdrawal removes the page and a fresh approval is needed to return. In the browser the provider's draft answered 404 until the administrator approved it.
- [x] Public profile never exposes contact email/phone/settings/analytics or draft text unless a separately approved public field contract explicitly permits it.
      The public type has eight fields; a probe for `contactEmail` is a GraphQL error; the page HTML and the response contain none of the provider's settings email, organization name, account id or email, unpublished items or draft text.
- [x] Wrong-role/wrong-owner and concurrent stale approvals/edits fail safely.
      Anonymous, professional, other-provider and provider-as-reviewer calls fail with no write; an approval of a draft edited after submission is a version conflict; approval vs edit and withdrawal vs approval races end in one consistent state; hub publish vs edit from one version has one winner.
- [x] Hub/profile slugs, history, sitemap, locales and schema follow 05–09.
      Slugs are claimed in the shared registry by trigger (TOPIC and PROVIDER namespaces); an administrator rename keeps the old path resolving to the current one and a withdrawn target resolves to nothing; a provider cannot rename. The editorial sitemap queries list only published, indexable, eligible pages; hub locales come from published translations and profiles are English-only. JSON-LD and canonical come from the approved fields.
- [x] Related-content queries are bounded, avoid N+1 and preserve required indexes.
      A hub reads its references with one query and the catalog with at most four batched queries (24-link cap, tested at 24); the provider page uses four capped queries; detail pages add two optional calls. `TopicHubReference` has indexes on `(hubId, position)` and `(kind, targetId)`; `ProviderPublicProfile` is unique on `providerId` and `slug`. No new search path was added.
- [x] Missing/deleted/suspended parents, empty links and API outages are handled.
      A disabled or deleted provider account hides the profile, its sitemap entry and its slug resolution and blocks approval; a hub with no visible link stays public with an empty state and a review flag; the optional hub and byline reads return empty on an outage while the main read still fails as an outage.

## Verification

- `npm run lint` (root) — pass
- `npm run check-types` (root) — pass
- `npm run build` (root, `NEXT_PUBLIC_SITE_URL` and `DEPLOYMENT_ENV` set as CI does) — pass
- `npm run bundle-report --workspace front` — pass; the new routes are dynamic and the landing section is server-rendered
- `npm run test --workspace api` — pass (165 suites, 2,303 tests, 60 s timeout)
- `npm run test:e2e --workspace api` on PostgreSQL 17, fresh database set to `TimeZone=UTC` — pass (47 suites, 723 tests), including `topic-hub` (19 cases) and `provider-public-profile` (22 cases)
- `npm run codegen --workspace front` — run; `topic-hub` and `provider-public-profile` added to the domain list, no drift afterwards
- Prisma: `20261012051007_topic_hubs_and_provider_profiles` applies to a fresh database; the generated `DROP INDEX` statements were removed first
- No frontend test was added
- Re-verified after a refactor: lint, `check-types`, root build, API unit tests (165 suites, 2,303 tests) and full e2e on a fresh UTC database (47 suites, 723 tests) — pass; Prettier check on touched files — pass; Prisma `///` model comments removed
- Browser (Chromium, production build against the real API and a seeded database): provider tab empty, invalid input, saved and awaiting-review states; administrator review queue approve; administrator topic guide editor with link lookup failure, save, publish, French save and publish; public hub (EN and FR), provider page, homepage guides, course and event relations; 360 px with no horizontal overflow; the draft profile answered 404 and the French provider path 404

## Behaviour notes

- Hubs live in `topic-hub` (learning catalog): source-language copy on the row, a second full language in `TopicHubTranslation` that stays private until published, references as ids into the four catalog tables filtered to published content on every read.
- Provider profiles live in `provider`: a private draft on `ProviderPublicProfile`, immutable `ProviderPublicRevision` snapshots, and `publishedRevision` naming the revision the public page reads. The page is English-only, so no French canonical exists for it.
- Slug lifecycle reuses the SEO-09 registry; adapters for the two new namespaces register themselves with `ContentUrlKindRegistry`, which now holds all kinds. Only an administrator can rename a hub or profile.
- Shared pieces added: `ContentPublicApi` (published cards by id or provider), `ContentSocialImageApi`, `IdentityProfileApi.activeProviderIds`, the editorial sitemap queries and `@loopskey/api-contracts` codes and limits.

## Not included

- SEO text and image override tables for hubs and profiles (SEO-08 style). The hub copy and the approved profile fields are the editorial text, with generated metadata, and an administrator can hide a page from search; per-locale override rows would be a follow-up.
- A provider-profile address editor. The API supports it (administrator only); the dashboard has the control for topic guides only.
- An index page at `/topics`. Pages are reachable from the homepage, detail pages and the sitemap.
- Reviewed launch content. Nothing is seeded or published; the test fixtures and the browser data live only in disposable databases.

## Submission

- Commit: `a6adcea`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/294
- CI: pending
