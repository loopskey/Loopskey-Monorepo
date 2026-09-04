# Association learning content

- Scope: `full`
- Branch: `feature/association-learning-content`
- Base: `00e2f37`
- Status: `Submitted`
- Spec: `context/features/association-dashboard/07-learning-content.md`

`origin/develop` carries phases 05 and 06 now, so this run branches from it
cleanly — unlike phase 06, which had to sit on an unmerged branch.

## Decisions

- **The catalogue is referenced, never copied.** The row keeps a `ContentType`
  and an id and nothing else; the title, image, provider and availability are
  resolved on every read through the learning-catalog module. That is what makes
  the acceptance criterion "the list shows the course's current title" true by
  construction rather than by a sync job, and the spec test asserts the written
  row contains no title at all.
- **`association-management` gained `learning-catalog` as a declared domain
  dependency, not a per-file exception.** `organization-management` already has
  it for the event catalogue, and the direction is safe because
  `learning-catalog` depends only on `platform-shared`. The specification asked
  for "no new boundary exception" and there is none: `boundary-exceptions.ts` is
  untouched, and both the architecture spec and the eslint rule read the same
  `DOMAIN_DEPENDENCIES` table.
- **A new port rather than a wider one.** `CATALOG_ENDORSEMENT_API` sits beside
  the existing `CATALOG_ORGANIZATION_API` in the landing module. Widening a port
  named for the organization module so the association could use it would have
  made both callers harder to read; the new one exposes exactly two methods,
  `searchCatalog` and `resolveCatalogItems`, and the second batches one query per
  content type rather than one per item.
- **A failing catalogue degrades the tab, it does not break it.**
  `resolveCatalog` returns `null` when the port throws, logs a warning, and the
  projection then falls back to association-owned columns with availability read
  as unknown-but-present. The alternative — letting the read fail — would take
  the whole tab down because one endorsed course's provider is having a bad day.
- **Availability distinguishes three states, not two.** Content the catalogue
  returns as unpublished is unavailable; content the catalogue no longer has at
  all is also unavailable and keeps an empty title, so the association sees that
  something is wrong and can replace it; and when the port itself failed,
  nothing is marked unavailable, because absence of an answer is not evidence.
- **The duplicate endorsement is arbitrated by the index, then recovered.** The
  partial unique index is the correctness boundary. `create` catches `P2002`,
  reads the winning row, and applies the caller's input to it as an update, so
  two simultaneous endorsements of the same course leave one row and the loser
  still gets the item it asked for. No Prisma error reaches the client.
- **Deleting is a conditional `deleteMany` naming `DRAFT`.** A count of zero is
  then disambiguated by re-reading: a missing item is a not-found, an existing
  one is refused with `LEARNING_CONTENT_NOT_DELETABLE` and pointed at
  withdrawal. The read is for the message, not for the decision.
- **A library is published to everyone or to one group, never to a member
  list.** `SPECIFIC_MEMBERS` is refused. A requirement is an obligation and can
  be addressed to named people; a reading list is not, and per-member curation
  would be a different feature.
- **Engagement is counted for catalogue items only.** `PDUActivity` already
  carries `contentType` and `contentId`, which is the linkage the specification
  points at. An external resource has no such link, so its engagement is `null`
  and the detail view says why rather than showing a misleading zero.

## Notes

- The migration adds the partial unique index unmanaged, exactly as
  `AssociationMember` does for member numbers, and both the model docstring and
  the migration comment tell the next person to refuse `prisma migrate dev`'s
  offer to drop it.
- Title search is applied after the catalogue resolves, because a catalogue
  item's title is not in the database to filter on. Category, status, source and
  requirement filters are all database predicates.
- The frontend gained `AssociationRequirementOptions`, a minimal query over the
  existing `associationRequirements` field, because phase 04's requirements tab
  is still an open PR (#47) and the frontend has no requirements document yet.
  It is deliberately named differently from anything phase 04 is likely to add,
  so the two documents can coexist in one file.
- The tab is already behind `next/dynamic` in the dashboard shell from phase 02,
  so no new deferral was needed.

## Acceptance

- [x] Endorsing a published course stores only its type and id, and the list
      shows the course's current title.
- [x] An endorsed course that is later unpublished shows as unavailable rather
      than vanishing.
- [x] Two concurrent endorsements of the same course leave one item and no
      Prisma error reaches the client.
- [x] Deleting a published item is refused and withdrawal is offered instead.
- [x] An external item with no URL is refused.
- [x] Engagement counts match the activities members recorded against the item.
- [x] With the catalogue port down the tab still renders, availability unknown.
- [x] `prisma-ownership.spec.ts` passes with no new exception.
- [x] Tests and the full scope gate pass.

## Gaps

- **No browser check.** The project's Postgres on `127.0.0.1:15432` is down, so
  the API cannot serve the tab. The specification's "component test proving the
  unavailable state renders" cannot be written either — `apps/front` has no test
  suite and "Frontend tests" forbids adding one — so that behaviour is covered
  on the service instead, by the three availability specs, and the rendering of
  it has not been watched.
- **The migration has not run against a local database,** for the same reason.
  The SQL is hand-written and idempotent rather than diffed by Prisma. CI runs
  `prisma migrate deploy` before the E2E suite, so it is applied there.
- **No E2E was added.** This phase's focused checks name unit tests and the
  ownership spec, and the concurrency-relevant path — the duplicate endorsement
  — is arbitrated by an index this migration creates, so the meaningful proof is
  the migration running in CI plus the recovery unit test. A database-backed
  race test would be worth adding when a phase next touches this table.

## Verification

- `npx prisma validate` / `npx prisma generate` - pass; the generated client
  carries `AssociationLearningContentStatus`
- `npm run lint --workspace api` - pass
- `npm run lint --workspace front` - pass
- `npm run lint --workspace @loopskey/api-contracts` - pass
- `npm run check-types --workspace api` - pass
- `npm run check-types --workspace front` - pass
- `npx tsc --noEmit -p apps/api/test/tsconfig.json` - pass
- `npm run test --workspace api` - pass, 83 suites and 910 tests with no
  failures and no timeouts
- `npm run build --workspace api` - pass
- `npm run build --workspace front` - pass
- `npm run bundle-report --workspace front` - `/dashboard/association` at
  1411.2 KB over 23 chunks, up 4.6 KB from 1406.6 KB on `develop`; the tab
  itself was already behind `next/dynamic` from phase 02
- `src/architecture/*` - pass; `AssociationLearningContent` registered in
  `MODEL_OWNERSHIP`, `boundary-exceptions.ts` untouched
- `schema.gql` regenerated: three queries, five mutations, four object types,
  five inputs and one enum, as a 111-line pure addition
- `npm run codegen --workspace front` - pass; only `base.ts` and
  `operations/association-dashboard.ts` move
- `en.json` and `fr.json` gain the same 123 lines with no key drift
- Prettier scoped to the touched files; all clean
- New focused specs: `association-learning-content.service.spec.ts` (21 tests —
  endorsement storing no copied title, read-time resolution, the two catalogue
  refusals, duplicate recovery and its rethrow, external validation, the three
  availability states, the publish conditional write and its race loser, the two
  audience refusals, withdrawal, deletion and its refusal, engagement for
  catalogue and external items) and
  `catalog-endorsement-api.service.spec.ts` (13 tests — published-only search,
  batching one read per type, unpublished and soft-deleted content reported as
  unavailable while still named, missing content returning nothing, and the
  provider fallbacks for events and videos)

## Submission

- Commit: `eb4baca`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/50 (targets `develop`, ready for review)
- CI: see the PR checks on the final commit

The whole gate above was re-run after the user's post-verification refactor (an
import-ordering pass across the new files). Nothing behavioural moved: the
regenerated `schema.gql` was byte-identical, frontend codegen produced no new
diff, and the API suite stayed at 910 passing.
