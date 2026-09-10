# Ingestion for events, podcasts and YouTube channels

- Scope: `api`
- Model: `High reasoning — a Prisma migration, transactional parent+child writes with lock-order-sensitive concurrency, and platform-owned-field rejection across three new content kinds.`
- Branch: `feature/additional-content-kinds`
- Base: `a41f806` (origin/develop, includes the phase 04 admin console)
- Status: `Ready`

Specification: `context/features/content-ingestion/05-additional-content-kinds.md`

## Unblock

The spec's Status was `Blocked` on crawler-contract question 2 (do events,
podcasts and YouTube channels get crawled at all). The user confirmed on
2026-09-10 that they have event, podcast and YouTube crawlers whose data maps
onto the existing `Event` / `Podcast` / `YouTubeChannel` schema, and directed
that all three be built like courses. That answer is the external authority the
spec required.

## Acceptance

- [x] Given a batch of each kind, rows and their child rows are created and the report names each item.
      `test/concurrency/kind-ingestion.e2e-spec.ts` — "creates each kind's row and its child rows and names each item".
- [x] Given the same batch resubmitted unchanged, every item reports unchanged and no child row is duplicated.
      `kind-ingestion.e2e-spec.ts` — "reports unchanged on a re-submission and duplicates no child rows".
- [x] A key issued for podcasts is rejected on the event route.
      Covered at the service layer (`kind-ingestion.e2e-spec.ts`) and over HTTP (`test/ingestion-kinds.e2e-spec.ts` — "rejects a podcast key used on the event route", `INGESTION_KIND_MISMATCH`).
- [x] An event whose end date precedes its start is rejected individually; the rest of the batch lands.
      `kind-ingestion.e2e-spec.ts` + `event-ingestion-pipeline.service.spec.ts`.
- [x] A podcast crawl omitting the episodes field leaves existing episodes; an empty array clears them.
      `kind-ingestion.e2e-spec.ts` — "leaves podcast episodes on omission and clears them on an empty array".
- [x] A podcast crawl with an episode missing its number rejects that episode; the podcast and its other episodes still land.
      `kind-ingestion.e2e-spec.ts` + `podcast-ingestion-pipeline.service.spec.ts`.
- [x] A payload setting `providerId` / `isFeatured` / event capacity / attendee counts is rejected, not ignored.
      `kind-ingestion.e2e-spec.ts` — "rejects a payload that sets a platform-owned field rather than ignoring it"; per-kind pipeline specs.
- [x] A podcast's stored `episodeCount` equals the number of episode rows, whatever the crawler sent.
      `episodeCount` is in `PODCAST_PROTECTED_INPUT_FIELDS` (a crawled value is rejected) and is recomputed via `tx.podcastEpisode.count` after every write; asserted in three `kind-ingestion.e2e-spec.ts` cases.
- [x] Two concurrent crawls of one podcast with different episode sets, from a shared PostgreSQL barrier, converge on one of the two sets with no orphan rows and no deadlock.
      `kind-ingestion.e2e-spec.ts` — "converges on one episode set when two crawls of one podcast race" (uses `runTogether` / the shared barrier).
- [x] The review queue and batch report render all four kinds.
      The phase 04 admin `listItems` / `getBatch` are kind-agnostic; this run makes the admin service's catalog summary, approve and reject switch on `source.kind` so a row of any kind reads from and publishes to the right table. No GraphQL contract change; `catalogSummaries` flattens each kind's status onto the shared DRAFT/PUBLISHED/ARCHIVED enum. Existing `ingestion-admin.e2e-spec.ts` still passes.
- [x] `externalRef` confirmed present on `Event`, `Podcast`, `YouTubeChannel` (phase 01); a migration adds it to `YouTubeVideo` for per-video keying.
      Verified in `schema.prisma`. Migration `20260910120000_ingestion_additional_kinds` adds `YouTubeVideo.externalRef` + its unique index; applied to dev and test DBs, `prisma migrate status` clean.

## Verification

- `npx turbo run lint check-types --filter=api` — pass
- `npx jest` (api) — pass (101 suites / 1111 tests), including the three new
  per-kind pipeline specs and the updated `ingestion-admin.service.spec.ts`
- `npx jest --config ./test/jest-e2e.json` (api) — pass (20 suites / 136 tests),
  including `test/concurrency/kind-ingestion.e2e-spec.ts` and
  `test/ingestion-kinds.e2e-spec.ts`; no regression in the phase 03/04 suites
- `npx turbo run build --filter=api` — pass
- `npx prisma migrate status` — pass ("Database schema is up to date")
- `schema.gql` / `generated.ts` — unchanged; this phase adds no GraphQL contract

## Notes

- Design: a new kind-agnostic `IngestionBatchRunnerService` owns the mechanics
  that are identical to phase 03 (content-length / idempotency validation,
  envelope parse, batch claim, dry-run, per-item loop, batch progress, receipt
  building, unique-violation recovery, structured log). It delegates catalog
  writes to a per-kind handler. `CourseIngestionService` is left untouched, per
  the spec's non-goal "do not change the pipeline"; the shared pure helpers are
  extracted to `utils/ingestion-batch.util.ts` and the runner uses them, while
  course keeps its own copies.
- Child rows: `EventScheduleItem` is set-replaced (delete + create in the
  transaction) — omitted field leaves the set, empty array clears it.
  `PodcastEpisode` is upserted on the existing `(podcastId, episodeNumber)`
  unique key; when the episodes field is present, episodes absent from the
  incoming set are deleted; when omitted, they are left. `YouTubeVideo` is
  upserted on a new `externalRef`; an omitted videos field leaves existing
  videos.
- Lock order on every path: parent row `SELECT … FOR UPDATE` by `externalRef`
  first, then child rows by their key ascending, so two crawls of one parent
  cannot deadlock.
- New message codes: `INGESTION_EVENT_DATE_RANGE_INVALID` is the stated reason
  on a rejected event whose end precedes its start.
  `INGESTION_EPISODE_NUMBER_REQUIRED` is log-only: an episode with no number is
  dropped from the set (the podcast and its numbered episodes still land), the
  item report carries `episodes` in `unmappedFields`, and the podcast service
  logs a warn with this code and the skipped count. Everything else reuses
  phase 03's codes.
- The batch receipt and per-item report shape are unchanged from phase 03; the
  new `IngestionBatchRunnerService` and `AbstractKindIngestionService` reproduce
  that flow for the new kinds without touching `CourseIngestionService`.
- Field maps: phase 04's admin console rejected any non-course field map. This
  run generalises `validateFieldMap` to validate a map against each kind's
  canonical field list, so an EVENT/PODCAST/YOUTUBE source can now carry one.
  Its phase-04 unit test that asserted the old restriction is updated.
- Platform-owned fields rejected per kind: `providerId`, `isFeatured`, `status`,
  `autoPublish`, `userId`, plus `capacity`/`attendees`/`views`/
  `registrationEnabled` for events and `episodeCount`/`listeners` for podcasts.
  YouTube subscriber/view/video counts are accepted — for that kind they are the
  channel's own public figures, per requirement 7. Crawled `rating`/
  `ratingCount` are dropped where they would collide with the platform's
  `ContentReview` aggregates, with the field name recorded.
- Crawled events ship browse-only: `registrationEnabled` is forced `false` on an
  ingested `Event` (a crawled row cannot support the registration workflow),
  resolving the spec's open decision.
- JSON Schemas: committed artifacts under `apps/api/docs/schemas/`, matching the
  existing `course-ingestion-item.v1.schema.json`.

## Submission

- Commit:
- PR:
- CI:
