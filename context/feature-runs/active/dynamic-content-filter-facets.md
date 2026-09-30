# dynamic-content-filter-facets

- Spec: `context/features/dynamic-content-filter-facets.md`
- Scope: `full`
- Model: `High reasoning — four public GraphQL domains, rating semantics, generated contracts, RTK cache reconciliation and query-plan evidence.`
- Branch: `feature/dynamic-content-filter-facets`
- Base: `33c93842b7742c61ef7582a82ed3c35f5c462a80`
- Status: `Submitted`

## Acceptance

- [x] Given only published Technology and Business Courses, the Course category selector shows only those normalized options with accurate counts.
- [x] Given published Courses exist only at Beginner and Intermediate levels, Advanced and All Levels are absent until a matching public Course exists.
- [x] Given reviewed Course ratings occupy only the 4.5 and 4.0 half-star buckets, only `4.5+` and `4.0+` are offered, ordered descending, and counts match `minRating` semantics.
- [x] Course rows with `rating = 0`, `ratingCount = 0`, an invalid rating, or no public visibility do not create a star option.
- [x] Draft, archived, cancelled, and soft-deleted content contributes to neither facets nor public lists for every content kind.
- [x] Event category/type, Podcast category, and YouTube category selectors contain only values backed by public records of their own kind.
- [x] Facets are calculated from all public rows, not only the current cursor page, and remain stable while search/current filters change.
- [x] Publishing the first record for a value makes that option appear after refetch; removing the last public record makes it disappear and safely clears a stale selection.
- [x] A facet failure leaves tabs, search, and cards usable and never exposes the old full-enum fallback.
- [x] Desktop/mobile loading, empty, error, success, reset, keyboard, and English/French states meet the UX requirements.
- [x] Existing list filtering, pagination, search, cards, detail links, publication workflows, and crawler ingestion remain compatible.
- [x] No database row, seed file, or ingestion contract is modified by this feature.
- [x] Relevant automated tests, codegen, query-plan checks, and full-scope verification gates pass.

## Decisions

- Four public queries, one per owning module: `courseFilterFacets`, `eventFilterFacets`, `podcastFilterFacets`, `youtubeChannelFilterFacets`. Each aggregates its own model and hard-codes the same visibility predicate as its public list (`status = PUBLISHED`, `deletedAt IS NULL`); Course reuses `buildCourseWhere()` itself so the two cannot drift.
- Star thresholds come from `floor(rating * 2) / 2` over reviewed rows only (`ratingCount > 0`, rating within 1-5), and each count is cumulative, so a threshold's count is what `rating >= minimum` would return among reviewed courses.
- **Recorded divergence:** the list's `minRating` filter tests `rating >= minRating` without checking `ratingCount`, so a row with a rating but no reviews is listed and not counted. `rating` is only ever written by the review aggregate, so the two agree on real data; the e2e suite forces the case to keep this a decision rather than a surprise.
- Options carry a count but the selectors do not render it yet: the spec asks the API for counts and does not ask the UI to show them. The data is there when product wants it.
- Categorical options are sorted by their translated label in the active locale; star thresholds are sorted numerically descending. Enum declaration order is never used.
- A selector whose facets resolved with no options is removed from both layouts. It stays visible while loading (disabled, with a loading placeholder) and on failure (as a retry button), because those states carry the affordance the reader needs. A failure never falls back to the full enum list.
- A selection whose value is no longer offered is cleared once facets resolve, and the tab resets to page one. Clearing back to an unfiltered list is served from the RTK cache, so the reconciliation costs no extra list request.
- Facet queries opt into `refetchOnFocus`/`refetchOnReconnect` and share the existing content cache tags, so an in-session publish/archive invalidates them and an external crawler change appears on focus, reconnect or reload.
- No index and no migration: measured, not assumed. See the query plan below.

## Verification

- `npm run test --workspace api` — pass (138 suites, 1663 tests), including new specs for the shared facet util, the Course rating buckets, and the facet path of all four services
- `npm run test:e2e --workspace api` on isolated PostgreSQL 16 — pass (30 suites, 218 tests), including the new `content-filter-facets` suite: anonymous access, typed output, whole-catalogue counts against a one-item page, descending cumulative thresholds, and draft/archived/cancelled/soft-deleted exclusion for all four kinds
- `EXPLAIN (ANALYZE, BUFFERS)` on 50,000 courses: category group-by 10.6 ms (1,316 buffers), rating bucket group-by 11.5 ms — both far below the 500 ms facet threshold, so no index was added. A group-by over the whole published catalogue has to read those rows regardless.
- `npm run lint` — pass (includes the i18n placeholder check); `npm run check-types` — pass; `npm run build` — pass; `npm run codegen --workspace front` — pass, schema change is additive
- `npm run bundle-report --workspace front` — pass; `/content` 1304.8 KB, +0.1 KB
- Browser (Chrome, local API + isolated DB, EN and FR): only the active tab's facet query fires on load (verified in the network log); Course category offers only Technology and Business while Design exists as a draft; Level omits Advanced; Rating offers only `4.5+` and `4.0+`, descending, with no `0+`; selecting `4.5+` returns exactly the 2 courses the facet counted; Events omit the cancelled category and offer only Webinar and Workshop; Podcasts and YouTube omit the draft and soft-deleted categories; stopping the API shows a retry control on every selector with search, tabs and cards still usable and no enum fallback; restarting and clicking retry restores all three; archiving the last Business course and refocusing clears the stale selection with no extra list request; 375 px shows all three filters in the sheet with no horizontal overflow; French labels and options are complete
- Not covered: browsers other than Chrome, zoom levels, and a forced stale-response race

## Submission

- Commit: `dc32e57`
- PR: [#258](https://github.com/loopskey/Loopskey-Monorepo/pull/258)
- CI: pending on the metadata commit
