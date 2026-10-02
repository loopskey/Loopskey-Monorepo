# Feature: Dynamic Content catalogue filters

## Status

Draft

## Objective

Make the existing filters on the public `/content` page reflect the catalogue
records users can actually open instead of showing every value declared in the
GraphQL enums. Category, level, event type, and Course star options must be
calculated from published, non-deleted database content and update without a
frontend constant change when the catalogue changes.

## User Value

As a catalogue visitor, I want each selector to contain only choices backed by
available content so that the filters remain relevant as crawler/provider data
changes and do not present unused or artificial options.

## Current-Implementation Audit

| Area | Current behavior | Required action |
| --- | --- | --- |
| Course filters | `useContentPage` expands all `CourseCategory` and `CourseLevel` enum values. Rating is hard-coded as `4.5+`, `4.0+`, `3.5+`, and `3.0+`. | Load category, level, and rating facets from public Course rows. |
| Event filters | All `EventCategory` and `EventType` enum values are shown whether matching Events exist or not. | Load category and type facets from public Event rows. |
| Podcast filter | All `PodcastCategory` enum values are shown. | Load category facets from public Podcast rows so the shared page follows one rule. |
| YouTube filter | All `YouTubeCategory` enum values are shown. | Load category facets from public YouTube channel rows. |
| List visibility | The existing public list services default to `PUBLISHED` and `deletedAt = null`. | Apply exactly the same visibility invariant to facets. |
| Crawler taxonomy | Ingestion normalizes crawler category/type/level strings into Prisma enums and preserves raw values separately. Recognized technology aliases become `TECHNOLOGY`; unknown values become `OTHER`. | Use normalized columns as facet values so every option is valid for the existing list filters. |
| Ratings | `rating` and `ratingCount` are LoopsKey `ContentReview` aggregates. Crawler ratings are deliberately not canonical and are currently dropped/recorded as unmapped. | Build star facets only from valid rating aggregates already stored in the catalogue. |

## Scope

- Add public, read-only facet queries owned by the existing Course, Events,
  Podcast, and YouTube modules.
- Populate every existing selector on `/content` from those facet responses:
  - Courses: category, level, and minimum star rating;
  - Events: category and event type;
  - Podcasts: category; and
  - YouTube channels: category.
- Return only options represented by at least one public record and include an
  aggregate count for each option.
- Keep normalized enum values as API values and reuse the current localized
  English/French enum labels in the frontend.
- Preserve existing list filters, cards, pagination, search, routes, and detail
  contracts.

## Non-goals

- Do not clean, delete, archive, or otherwise modify current database rows.
- Do not change Faker/demo seed files or seed orchestration.
- Do not replace normalized enums with arbitrary raw crawler strings.
- Do not change crawler normalization or the meaning of `OTHER`.
- Do not import or mix third-party crawler ratings with LoopsKey review
  aggregates. A source-rating policy is a separate feature.
- Do not add new filter dimensions or add rating filters to non-Course tabs.
- Do not redesign the Content page/cards or change search, sorting, pagination,
  ingestion, publication, or detail pages.

## Functional Requirements

### 1. Facet source and visibility

1. Each facet query reads its complete owning catalogue table, not the current
   paginated client response.
2. A record contributes only when its status is `PUBLISHED` and `deletedAt` is
   `null`, matching the corresponding public list query.
3. Category, level, and type facets group by the normalized enum column and
   return only values with `count > 0`.
4. Facets are global to the active content tab. Search text and current filter
   selections do not cause options to jump or disappear while the user types or
   selects another filter; the list query remains responsible for combined
   filter results.
5. Enum declaration order must not determine display order. The API returns
   values/counts; the frontend sorts categorical labels with the active locale
   and star thresholds numerically descending.
6. Draft, archived, cancelled, soft-deleted, provider-private, or otherwise
   non-public records never contribute to an option or its count.
7. Adding, publishing, archiving, restoring, or deleting catalogue content must
   be reflected after the facet query refetches, without a frontend deployment.

### 2. Course star facets

1. Only Courses with `ratingCount > 0` and a finite stored `rating` in the
   inclusive range 1 through 5 contribute to star options.
2. Ratings are grouped into half-star minimum thresholds with
   `floor(rating * 2) / 2`; examples are `4.5+`, `4.0+`, and `3.5+`.
3. Emit a threshold only when at least one public Course exists in that
   half-star bucket. Its returned count is cumulative and equals the number of
   public reviewed Courses satisfying `rating >= threshold`.
4. Zero/default ratings and Courses without reviews do not produce a `0+`
   option.
5. Selecting an option continues to send the existing `minRating` input, so
   list-query compatibility is preserved.
6. Crawler-provided star values do not contribute unless a separately approved
   future feature stores them with explicit source provenance and defines how
   they differ from LoopsKey reviews.

### 3. Frontend behavior

1. Only the active tab requests its matching list and facet operations. A tab
   switch may reuse RTK Query cache and fetches the newly active tab when its
   facets are absent or stale.
2. While facets are loading, search and cards remain usable. Unresolved
   selector triggers use a non-blocking loading/disabled state and must not
   flash the old full-enum list.
3. A facet with no options is omitted from both desktop and mobile layouts.
   Search and other non-empty facets remain available.
4. If a previously selected value disappears after a refetch because its last
   public record was archived/deleted, clear only that value, reset that tab to
   page one, and issue one updated list request.
5. A facet request failure does not fail the content list. Keep search/cards
   usable, show a localized recoverable filter error or retry affordance, and
   never fall back to all enum values.
6. Successful create/publish/archive/delete/restore operations in the same
   browser session invalidate the relevant list and facet cache tag. External
   crawler changes become visible on mount, focus/reconnect refetch, or an
   explicit refresh; realtime push is not required.
7. Desktop and mobile selectors retain accessible labels, keyboard operation,
   focus behavior, localized text, and the existing `All` reset behavior.

## Roles and Permissions

| Actor | Allowed | Forbidden |
| ----- | ------- | --------- |
| Anonymous visitor | Read public facet values/counts and filter public content | Infer draft, deleted, private, or ingestion-provenance data |
| Authenticated user | Use the same public facets | Use facets to bypass catalogue visibility rules |
| Provider/admin | Cause facet cache refresh through existing authorized catalogue workflows | Supply counts or weaken public visibility through the facet contract |

- Authentication: facet queries are public, matching the current public list
  queries.
- Ownership rule: every backend domain computes facets from its own model and
  enforces public visibility internally.
- Sensitive data: output contains only normalized enum/threshold values and
  aggregate counts. Do not expose provider IDs, raw ingestion fields, source
  URLs, unpublished values, titles, or review data.

## UX Requirements

- Entry point: existing public `/content` page and `FilterPanel` desktop/mobile
  layouts.
- Loading: disable only unresolved selectors; do not block search, tabs, or
  content cards.
- Empty: omit an empty selector and retain the existing list empty state for a
  valid combination that has no results.
- Error: show a localized, retryable facet-loading state while keeping the
  content list usable; never substitute static enum options.
- Success: selectors show only public-data-backed values and update after a safe
  refetch without requiring a new frontend build.
- Responsive and keyboard behavior: preserve Radix Select/Sheet semantics,
  logical focus order, trigger labels, and mobile reset/show-results actions.
- Internationalization: reuse `content.enums.*` and `content.filters.*`; add
  matching English/French loading/error keys only where needed. Transport enum
  values must never be used as user-facing labels.

## Contract Changes

- Transport: add four public GraphQL queries owned by the existing modules,
  provisionally:
  - `courseFilterFacets: CourseFilterFacets!`;
  - `eventFilterFacets: EventFilterFacets!`;
  - `podcastFilterFacets: PodcastFilterFacets!`; and
  - `youtubeChannelFilterFacets: YouTubeChannelFilterFacets!`.
- Input: none in this iteration. Facets describe the complete public catalogue
  of their content kind and are independent of search/pagination.
- Output:
  - enum facets expose a correctly typed enum `value` and non-negative
    `count: Int!`;
  - Course rating facets expose `minimum: Float!` and cumulative `count: Int!`;
  - all arrays are non-null and omit zero-count values.
- Stable error/message codes: no new business error code is expected. Safe
  GraphQL/network failures use the existing frontend request-error handling.
- Compatibility: `courses`, `events`, `podcasts`, and `youtubeChannels` and
  their inputs stay unchanged. Generate `schema.gql`, frontend typed documents,
  and GraphQL types through project codegen; never edit generated files by
  hand.

## Data and Domain Rules

- Owning modules: `course`, `events`, `podcast`, and `youtube` own their facet
  reads. The frontend composes the results only at the page level.
- Models/relations affected: read-only aggregation over `Course`, `Event`,
  `Podcast`, and `YouTubeChannel`; no data model relation changes.
- Invariants and concurrency: facet and public list services must share the
  same visibility predicate. Concurrent publication changes may produce normal
  read-committed snapshots and converge on the next refetch.
- Migration/backfill: none expected. If measured query plans require an index,
  add a named production-safe Prisma SQL migration based on `EXPLAIN`, not
  assumption. No content backfill is part of this feature.
- Delete/retention behavior: unchanged; all queries are read-only.

## Dependencies and Side Effects

- Cross-domain interaction: none in the API; every query remains inside its
  owning content module.
- External provider/object storage: none.
- Outbox event: none.
- Retry/idempotency: facet reads are side-effect free and RTK-cacheable. Failed
  reads can be retried without affecting catalogue data.

## Observability and Operations

- Record facet-query duration, content kind, and number of returned options
  using bounded labels. Never log individual titles, raw categories, provider
  identifiers, or review details.
- Measure each aggregate using `EXPLAIN (ANALYZE, BUFFERS)` on the current
  production-shaped catalogue before adding an index.
- Alert through the existing slow-query path if a facet aggregate exceeds the
  repository threshold; facet failure must not take down the content list.
- Rollout can be additive: deploy facet GraphQL operations first, then switch
  the frontend away from static enums. Existing list operations provide a
  straightforward rollback path.

## Acceptance Criteria

- [ ] Given only published Technology and Business Courses, the Course category selector shows only those normalized options with accurate counts.
- [ ] Given published Courses exist only at Beginner and Intermediate levels, Advanced and All Levels are absent until a matching public Course exists.
- [ ] Given reviewed Course ratings occupy only the 4.5 and 4.0 half-star buckets, only `4.5+` and `4.0+` are offered, ordered descending, and counts match `minRating` semantics.
- [ ] Course rows with `rating = 0`, `ratingCount = 0`, an invalid rating, or no public visibility do not create a star option.
- [ ] Draft, archived, cancelled, and soft-deleted content contributes to neither facets nor public lists for every content kind.
- [ ] Event category/type, Podcast category, and YouTube category selectors contain only values backed by public records of their own kind.
- [ ] Facets are calculated from all public rows, not only the current cursor page, and remain stable while search/current filters change.
- [ ] Publishing the first record for a value makes that option appear after refetch; removing the last public record makes it disappear and safely clears a stale selection.
- [ ] A facet failure leaves tabs, search, and cards usable and never exposes the old full-enum fallback.
- [ ] Desktop/mobile loading, empty, error, success, reset, keyboard, and English/French states meet the UX requirements.
- [ ] Existing list filtering, pagination, search, cards, detail links, publication workflows, and crawler ingestion remain compatible.
- [ ] No database row, seed file, or ingestion contract is modified by this feature.
- [ ] Relevant automated tests, codegen, query-plan checks, and full-scope verification gates pass.

## Verification

### Focused checks

- API service tests for each facet: grouping/counts, published/non-deleted
  visibility, zero-option exclusion, deterministic output, and empty data.
- Course rating tests for half-star boundaries, descending order, cumulative
  counts, invalid/out-of-range values, and `ratingCount = 0`.
- Resolver/GraphQL E2E tests for anonymous access, typed output, unpublished
  exclusion, and a dataset larger than one page to prove facets are not page-
  derived.
- Direct aggregate comparison and `EXPLAIN (ANALYZE, BUFFERS)` on an isolated,
  production-shaped PostgreSQL database.
- Manual browser verification for all four tabs on desktop and mobile: initial
  load, tab switching/cache reuse, selection/reset, stale-selection clearing,
  facet failure/retry, keyboard navigation, and English/French labels.
- Browser/network verification that active-tab behavior does not issue all four
  facet queries at initial load and does not produce duplicate list requests
  when a stale selected value is cleared.

### Scope gate

- Full/shared: root lint, type-check, API tests, and build.
- API: focused unit/E2E tests, Prisma validation, schema generation, and facet
  query-plan evidence.
- Front: lint, type-check, build, GraphQL codegen, and the project browser
  verification workflow; do not add frontend test files contrary to project
  standards.

## Risks and Decisions

- Risk: deriving options from the current page hides valid values on later
  pages.
  - Mitigation: dedicated database aggregates independent of pagination.
- Risk: facets expose unpublished catalogue taxonomy/counts.
  - Mitigation: owning services hard-code the same public visibility invariant
    as their list operations and return bounded aggregate data only.
- Risk: a crawler rating is mistaken for a LoopsKey review score.
  - Decision: this feature uses only existing stored platform aggregates with
    `ratingCount > 0`; source ratings remain out of scope.
- Risk: refetching removes the selected item while Radix Select still holds its
  value, producing a stale/invalid control state.
  - Mitigation: reconcile each selected value against new facets, clear only
    invalid values, reset pagination, and cover the one-request behavior in the
    browser network check.
- Risk: separate facet calls increase API traffic.
  - Mitigation: fetch only for the active tab, cache through RTK Query, refetch
    on lifecycle events, and return small bounded aggregate payloads.
- Decision: facets represent stable tab-wide availability, not search-dependent
  or disjunctive counts. This removes phantom options without making selectors
  jump while the user types.
- Decision: the Podcast category becomes dynamic for consistency, but no
  Podcast data or seed behavior changes.
- Implementation tier: High reasoning because the feature spans four public
  GraphQL domains, generated contracts, rating semantics, RTK cache behavior,
  accessibility, and database query plans.

## References

- Content page hook: `apps/front/src/hooks/useContentPage.ts`
- Filter UI: `apps/front/src/components/modules/Content/FilterPanel.tsx`
- Content page types: `apps/front/src/types/content-module.types.ts`
- Course service/resolver:
  `apps/api/src/modules/course/services/course.service.ts`,
  `apps/api/src/modules/course/resolvers/course.resolver.ts`
- Event service/repository/resolver:
  `apps/api/src/modules/events/services/event.service.ts`,
  `apps/api/src/modules/events/infrastructure/persistence/event.repository.ts`,
  `apps/api/src/modules/events/resolvers/event.resolver.ts`
- Podcast service/resolver:
  `apps/api/src/modules/podcast/services/podcast.service.ts`,
  `apps/api/src/modules/podcast/resolvers/podcast.resolver.ts`
- YouTube service/resolver:
  `apps/api/src/modules/youtube/services/youtbue.service.ts`,
  `apps/api/src/modules/youtube/resolvers/youtube.resolver.ts`
- Crawler normalization: `apps/api/src/modules/ingestion`
- Data model: `apps/api/prisma/schema.prisma`
- Related catalogue search plan:
  `context/features/performance/landing-catalog-search-optimization.md`
