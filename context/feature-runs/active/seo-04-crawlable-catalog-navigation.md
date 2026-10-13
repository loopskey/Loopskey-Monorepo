# seo-04-crawlable-catalog-navigation

- Scope: `full`
- Model: `High reasoning — cursor contracts, search/sort plans and URL policy cross the API/frontend boundary and can create unbounded crawl or query work.`
- Branch: `feature/seo-04-crawlable-catalog-navigation`
- Base: `92ec74c`
- Status: `Submitted`

## Acceptance

- [x] All four tabs work through fresh direct requests and existing landing URLs.
- [x] Initial cards and forward/previous links are present in raw server HTML.
- [x] A second page opens directly and supplies working previous navigation.
- [x] Reload and Back/Forward preserve filters, tab and pagination correctly.
- [x] Deterministic cursor traversal has no duplicate/skipped rows on an unchanged fixture; concurrent mutations have documented, bounded behavior.
- [x] Paginated pages self-canonicalize; search/filter pages are noindex.
- [x] Invalid/stale cursors, zero results and upstream failures remain distinct.
- [x] Search reaches required indexes at representative scale.

## Verification

- `npm run lint`, `npm run check-types` (root) — pass
- `npm run build` (root, `DEPLOYMENT_ENV=ci`, https site origin) — pass; `/content` is now a dynamic route
- `npm run bundle-report --workspace front` — pass; `/content` entry JavaScript is 675 KB raw / 208 KB gzip (a plain static page is 655 KB / 203 KB), no dependency added
- `npm run test --workspace api` — pass (148 suites, 2079 tests)
- `npm run test:e2e --workspace api` on a local PostgreSQL 17 — pass, 33 suites; the new `catalog-pagination.e2e-spec.ts` has 58 cases. Three concurrency suites (registration OTP, outbox lanes, outbox delivery) fail only when the database timezone is not UTC, which was the local default; they pass with `timezone=UTC`, as in CI
- `npm test --workspace front` — pass (existing suite, 27 tests); no frontend test added
- `npm run codegen --workspace front` — run; `schema.gql` differs from develop by exactly `hasPreviousPage`/`previousCursor` on the four page-info types
- Production build served against the real API and a seeded database, requests by curl:
  - all four tabs and the landing `?tab=` URLs: 200, 12 cards and 12 detail `<a href>` in raw HTML, `rel="next"` link, disabled previous at the boundary
  - page two opens directly with `rel="prev"` pointing at the bare URL; page three's previous reproduces page two exactly; 30 of 30 rows seen once across three pages for listing and search on courses, events and podcasts
  - `tab=courses`, tracking parameters, empty values, duplicated `tab` and `rating=4.0`: 308 to the normalized URL
  - search and filters: 200 with `noindex, follow` and a self-canonical; cursor pages carry `after` in their canonical
  - unknown tab, unknown category, malformed or oversized input, a cursor of another kind: invalid notice, `noindex`; a well-formed cursor whose row is gone: restart notice, `noindex`; zero results: empty state with a reset link
  - upstream unreachable: 500 with `no-store` for `/content` and for a cursor page, never a zero-result success
- Browser (Microsoft Edge through a local Playwright script, not committed):
  - JS enabled: tab click moves focus to the results heading and marks the tab current; Next, Back, Forward, reload and Previous restore the exact URL and 12 cards; a select change and a search submit send normalized URLs and drop the cursor; Back restores select and search box values
  - JS disabled: tab links, Next, Previous and the filter form all navigate through plain GET
  - 390 px viewport: no horizontal overflow, pagination reachable; no console or page errors in any run
- Query plans at 100,000 rows per kind (`EXPLAIN (ANALYZE)`, local PostgreSQL 17):
  - listing first, deep (anchor at row 50,000) and backward pages: `Index Scan` on `*_createdAt_idx` with an incremental sort for the id tiebreaker, 0.05 to 0.14 ms; no migration needed
  - search window: `BitmapOr` over the title, instructor and description trigram indexes; 0.9 ms for a selective term and 52 ms for a term matching 14% of the table (500-row candidate cap), count 26 ms
  - the unfiltered `totalCount` is a 26 ms sequential count at 100,000 rows, unchanged from before this feature
- Catalogue page reads log kind, mode, whether paged, duration and outcome (never the search text), and warn above `CATALOG_PAGE_SLOW_QUERY_MS` (default 500)

## Behaviour notes

- A listing cursor is a row id inside an opaque, versioned token. A page that is read after a cursor costs one primary-key existence check and one bounded backward read for the previous link. A search page re-evaluates the capped candidate set (at most two evaluations per deep page).
- Search results are reachable only within the 500-row candidate cap, and their `totalCount` is clamped to it.
- Fixed before this feature: search pagination used `id > cursor` against a rank ordering and counted only rows after the cursor, and the course search ignored `minRating`.
- The old client-side filter sheet on small screens is replaced by an always-visible GET form.
- Event cards now format their date in the event's own time zone (UTC when absent) so the server and the browser render the same text.

## Contract and URL policy

- GraphQL: additive `hasPreviousPage`/`previousCursor` on the four public page-info types; `cursor` is now an opaque versioned token bound to kind and sort (or the search order); `search` is capped at 200 characters. Existing operations stay valid.
- Errors: `CATALOG_CURSOR_INVALID` (bad request, also a cursor minted for another kind or sort) and `CATALOG_CURSOR_EXPIRED` (gone, the anchor row is no longer visible under the same filters).
- `/content` parameters: `tab`, `q`, `category`, `level`, `rating`, `eventType`, `after`. Everything else, repeats, empty values, one-character searches and `tab=courses` are removed by a 308 to the normalized URL.

## Submission

- Commit: 5d0e730
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/285
- CI: pending
