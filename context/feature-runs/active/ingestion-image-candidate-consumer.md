# A consumer for the ingestion.item.published event (image fetching off)

- Scope: `api`
- Model: `High reasoning — model-selection routes outbox work here; implemented on Sonnet 5. The handler holds no transaction, makes no outbound request, adds no dependency and no schema change, so the residual risk is a single new outbox consumer registration.`
- Branch: `feature/ingestion-image-candidate-consumer`
- Base: `f9681ee` (origin/develop)
- Status: `Ready`

## Why this run exists

Phase 03 emits the outbox event `ingestion.item.published` for every accepted
ingestion item "for phase 06 to consume". Phase 06 shipped in its reduced form
(the user chose image fetching OFF) and never added the consumer. So today the
event has **no registered handler**: `OutboxProcessor` throws
`No handler for ingestion.item.published@1`, retries to the cap, and the event
becomes a terminal `OutboxEvent`. Confirmed at runtime during the phase 07 live
test — accepted items accrued failed attempts.

This run closes that gap the minimal way, keeping fetching OFF:

- It adds one `OutboxHandler` for `ingestion.item.published` so the event is
  consumed and no terminal failure accrues.
- The handler does the non-network half of the spec's image contract
  ("the platform validates and re-hosts or discards it"): it validates the
  candidate URL's shape and **discards** an unusable one (clears
  `imageCandidateUrl` on the item), with **no HTTP request**, no re-encode, no
  `sharp`, no migration, no `imageUrl` write.
- The SSRF-hardened fetch + re-encode + store pipeline, the per-source fetch
  switch, the image-outcome columns and the serving route remain deferred to a
  later phase that turns fetching on deliberately.

## Acceptance

- [x] `ingestion.item.published` has a registered `OutboxHandler`; a batch's
      events reach `processedAt` instead of a terminal failure.
      `IngestionItemPublishedHandler` (`handlerName = "ingestion-image-candidate-v1"`)
      registers on `onModuleInit`; `test/ingestion-kinds.e2e-spec.ts` submits a
      batch and asserts both `ingestion.item.published` rows reach
      `processedAt != null` via the app's own poller.
- [x] A well-formed public `https` image candidate is left in place; the handler
      makes no outbound request. Same e2e case: the `https://cdn.example.com/ok.jpg`
      item keeps its `imageCandidateUrl`. The handler touches only Prisma.
- [x] A candidate that is not `https`, is an IP literal, or is a loopback/link-
      local host is discarded (`imageCandidateUrl` set null) and logged.
      `unfetchableReason` unit table (13 cases) + the e2e's `http://` item is
      cleared to null.
- [x] An event whose item no longer exists, or whose item has no candidate, is
      processed without error and without a write. Handler unit spec covers the
      missing-item, no-candidate, and non-string-`itemId` paths.
- [x] No `imageUrl` is ever written by this run; no new column, dependency, or
      outbound call is added. `git diff` touches no `schema.prisma`, no
      `package.json`; the handler has no `fetch`/`http` import.

## Verification

- `npx turbo run lint check-types --filter=api` — pass
- `npx jest` (api unit) — pass, 103 suites / 1134 tests (was 1115; +19 from the
  new handler spec)
- `npx jest --config ./test/jest-e2e.json --testPathPattern "ingestion|outbox"`
  — pass, 7 suites / 50 tests, incl. the new `ingestion-kinds` consumer case and
  an unchanged `outbox-delivery` suite
- `npx turbo run build --filter=api` — pass
- `npx prisma migrate status` — "Database schema is up to date!", no migration
- `schema.gql` / generated types — unchanged; no GraphQL contract touched

## Submission

- Commit:
- PR:
- CI:
