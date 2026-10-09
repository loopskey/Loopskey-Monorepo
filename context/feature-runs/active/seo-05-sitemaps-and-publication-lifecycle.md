# seo-05-sitemaps-and-publication-lifecycle

- Scope: `full`
- Model: `High reasoning — sitemap scale, visibility revocation, a new public enumeration contract and an additive Prisma migration touch data integrity and public disclosure.`
- Branch: `feature/seo-05-sitemaps-and-publication-lifecycle`
- Base: `cf98feee9852b9b535a73dab9e57faa4611ed603`
- Status: `Submitted`

## Acceptance

- [x] Sitemap is valid XML and contains only absolute canonical eligible URLs.
      `/sitemap.xml` and every shard pass `xmllint`; every `<loc>` is an
      absolute URL on the configured origin.
- [x] Every published fixture across all four kinds is covered exactly once.
      90,054 URLs across 13 shards, 90,054 unique: 90,000 courses, 20 events,
      10 podcasts, 7 channels, 17 static pages. Draft and archived fixtures and
      soft-deleted rows are absent.
- [x] Large fixtures produce bounded compliant shards without unbounded memory.
      Nine course shards of exactly 10,000 URLs; one shard is 1.21 MB and 307 ms
      against the 50,000-URL and 50 MB protocol limits, built from four bounded
      keyset pages of 2,500.
- [x] View-only writes do not alter lastmod; actual public edits do. Covered by
      focused specs per domain and by an E2E case that counts a real view.
- [x] Publish/withdraw/delete/restore changes discovery within 300 seconds.
      Each transition is reflected on the next fresh origin request; the only
      cache in front of the sitemap is a 300-second `s-maxage`.
- [x] Fresh detail/metadata/card requests after withdrawal disclose no hidden
      content even with multiple app instances and previously warmed caches.
      Two instances warmed on the same row, then withdrawn: both answered 404
      for the page and the card and dropped the URL from the shard.
- [x] API outage is not persisted as an empty successful sitemap. A suspended
      API produced `503` with `no-store` and `Retry-After: 60` for the index and
      for a shard, and the index recovered on the next request.
- [x] Robots references the canonical production sitemap; staging is excluded.

## Verification

- `npm run lint` (root) — pass
- `npm run check-types` (root) — pass
- `npm run test --workspace api` — pass (154 suites, 2,142 tests)
- `npm run test:e2e --workspace api` on a local PostgreSQL 17 at UTC — pass,
  34 suites, 378 tests; the new `public-url-discovery.e2e-spec.ts` has 14 cases.
  `concurrency/association-message` failed one run on a 5-second `beforeAll`
  app-boot timeout while a build was competing for the CPU, and passes on its
  own in 4.7 s
- `npm run build` (root) — pass; `/sitemap.xml` and `/sitemaps/[shard]` are
  dynamic routes and `/robots.txt` stays prerendered
- `npm run bundle-report --workspace front` — pass; no sitemap or discovery
  module appears in any client chunk, and no client component was added
- `npm run codegen --workspace front` — run; `schema.gql` differs from develop
  by exactly the four discovery types, the one input and the two queries
- Prisma: `migrate deploy` applied the new migration to a fresh database and
  `migrate status` reports no drift; all 59 trigram GIN indexes survive, and the
  45 `DROP INDEX` statements Prisma generated were removed before applying
- Production build served against the real API and a seeded database (90,000
  published courses of 100,000), requests by curl:
  - `/robots.txt`: allow-all plus `Sitemap: https://.../sitemap.xml`
  - `/sitemap.xml`: 200, `application/xml`, `public, max-age=300, s-maxage=300`,
    13 entries each with its own shard `lastmod`
  - `/sitemaps/static.xml`: 17 canonical static pages, no `lastmod`
  - unknown, out-of-range, zero-indexed, extensionless, wrong-extension and
    path-traversal shard names: 404 with `no-store`
  - withdrawal, deletion and restoration: the URL leaves and re-enters the shard
    on the next request, on both instances
  - API suspended: 503 with `no-store` and `Retry-After` for the index and the
    shard; the static shard still serves because it needs no upstream
  - staging build (`DEPLOYMENT_ENV=staging`): disallow-all `robots.txt` with no
    sitemap line, and 404 for the index and every shard
  - every one of the 17 static sitemap URLs answers 200
  - `courses-01.xml` (a non-canonical leading zero) and `courses-9999999.xml`
    are 404, so a shard has exactly one name
- Query plans at 100,000 courses, 90,000 eligible (`EXPLAIN (ANALYZE)`, local
  PostgreSQL 17): the shard aggregate is an `Index Scan` on
  `Course_createdAt_idx` at 93–201 ms, and a 2,500-URL page is the same index
  scan at 1.4–2.5 ms. A composite `(status, deletedAt, createdAt, id)` index and
  a partial index on the eligibility predicate were both built and measured; the
  planner chose neither, so no index ships. The measurement and the partial-index
  recipe are recorded in the migration.

## Behaviour notes

- A shard is the half-open keyset range `[startCursor, endCursor)` over
  `(createdAt, id)` ascending, not an anchor plus a count. A row inserted or
  withdrawn mid-crawl is therefore seen at most once, which two E2E cases assert
  directly. Ascending creation order also means a row's shard moves only when an
  earlier-created eligible row is published or withdrawn.
- `publicUrlShards` reads all four kinds and fails as a whole if any kind fails.
  A partial index that silently dropped a kind would read as a mass withdrawal.
- Shard names are 1-based (`courses-1`). A shard URL whose shard no longer
  exists answers 404 and the crawler re-reads `/sitemap.xml`.
- The sitemap has no persistent body cache and no last-known-good output: the
  routes are `force-dynamic` and the upstream read is `no-store`, so the 300
  second bound is one cache layer deep and provable.
- Detail pages, metadata and social cards were already uncached by feature 03;
  this feature keeps them that way and documents why a persistent card cache
  cannot ship on a TTL alone.

## Contract changes

- GraphQL, additive: `publicUrlShards: [PublicUrlShardSet!]!` and
  `publicUrlPage(input: PublicUrlPageInput!): PublicUrlPage!`, both `@Public()`,
  plus the `PublicUrl`, `PublicUrlPage`, `PublicUrlShard` and
  `PublicUrlShardSet` types. The kind selector reuses the existing `ContentType`
  enum. No existing operation changed.
- Errors: `PUBLIC_URL_CURSOR_INVALID` for a malformed, oversized or cross-kind
  cursor and `PUBLIC_URL_SELECTOR_INVALID` for an out-of-range page size, both
  bad requests and both distinct from a temporary upstream failure.
- Prisma, additive: `publicContentUpdatedAt` on `Course`, `Event`, `Podcast` and
  `YouTubeChannel`, `NOT NULL DEFAULT CURRENT_TIMESTAMP`, backfilled once to
  `GREATEST(createdAt, LEAST(updatedAt, COALESCE(lastUpdatedAt, updatedAt)))`.
  No slug is touched and nothing is dropped.
- New `discovery` module, registered in the domain-ownership manifest under
  `learning-catalog`, consuming one public port per catalogue domain. Its
  resolver joins the existing EXC-033 `@auth/decorators` exception.
- Operations: `PUBLIC_URL_SHARD_SIZE` and `PUBLIC_URL_SLOW_QUERY_MS`, documented
  in `.env.example` and `apps/front/docs/public-discovery.md`.

## Submission

- Commit: `075462c`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/286
- CI: pending
