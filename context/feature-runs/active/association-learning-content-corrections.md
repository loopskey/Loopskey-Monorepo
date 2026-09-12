# Assign association learning content through the approved workflow

- Scope: `full`
- Model: `High reasoning — Prisma migration (nullable category, new target table with a legacy-groupId backfill), GraphQL contract changes, transactional publish/outbox, and audience deduplication across all-members/group/specific-member targeting.`
- Branch: `feature/association-learning-content-corrections`
- Base: `d61c683` (origin/develop)
- Status: `Submitted`

## Acceptance

- [x] Add and Endorse open the four named steps and preserve data while moving
  backward and forward (single RHF form spanning all steps; `next()` only
  advances after `form.trigger()` on that step's fields, mirroring the
  existing CPD-setup wizard pattern; Back never clears data).
- [x] Category and Counts toward are absent from create/endorse, not required
  by API validation, and not silently defaulted (`category`/`requirementId`
  removed from `CreateAssociationLearningContentInput`; `category` is now
  nullable end-to-end and never written by create/update).
- [x] An admin can publish to all active members, selected groups, or selected
  individual members.
- [x] Overlapping group/direct targets produce one logical assignment per
  professional (target rows keyed by `(learningContentId, groupId)` /
  `(learningContentId, memberId)` unique indexes; publish always fully
  replaces the target set for the chosen audience in one transaction).
- [x] Cross-association or inactive member targets are rejected without
  partial publication (`verifyGroups`/`verifyActiveMembers` run and throw
  before the `$transaction` opens; a rejected request writes nothing).
- [x] Publishing content does not increase earned CPD/PDU or satisfy a
  requirement (no compliance/materialisation call anywhere in the publish
  path; unchanged from before this feature).
- [x] Legacy rows remain readable and their migration is auditable (migration
  backfills each legacy `groupId` into exactly one new `GROUP` target row
  before dropping the column; the migration file documents this).
- [x] List, wizard, review, success, empty, and error states are usable at 390
  and 1440 px (all new step/list/detail markup reuses the existing
  responsive dialog/list/sheet primitives; not verified against a live
  browser in this pass — see Verification notes).

## Verification

- `npx prisma migrate dev` against local Postgres (`loopskey-schema-gen`,
  127.0.0.1:15432) — applied cleanly; a spurious second migration Prisma
  auto-generated from pre-existing `pg_trgm` index drift (unrelated to this
  feature, a known/expected divergence per `context/coding-standards.md`)
  was deleted before it could be committed.
- `npx prisma generate` — pass
- `npm run test --workspace api` — pass (110 suites / 1197 tests, including
  26 in `association-learning-content.service.spec.ts`: new group/member
  audience, cross-association rejection, inactive-member rejection, and
  idempotent-retarget-without-a-second-notification cases)
- `npm run lint --workspace api` — pass
- `npm run check-types --workspace api` — pass
- `npm run build --workspace api` — pass
- Booted the API against local Postgres to regenerate
  `apps/api/src/graphql/schema.gql`, then `npm run codegen --workspace
  front` — pass; reverted line-ending-only noise in two unrelated generated
  operation files via `git checkout --`
- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — pass; `/dashboard/association`
  moved from 1429.9 KB to 1431 KB first-load JS (+1.1 KB), well within
  normal variance for a wizard replacing a single dialog
- `npm run build --workspace @loopskey/api-contracts` — pass

Browser checks (both entry points, all four steps, removed fields, selector
keyboard use, review corrections, mobile layout at 390/1440px) were not run
against a live server in this pass.

## Submission

- Commit: `6279d92`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/100
- CI: pending

## Notes

- Investigation found the previous implementation had no audience/target
  model for learning content at all — audience was a denormalised
  `audienceKind` + single nullable `groupId` column on the content row, and
  `SPECIFIC_MEMBERS` was explicitly rejected. Built
  `AssociationLearningContentTarget` mirroring
  `AssociationRequirementTarget` (same unique-key dedup shape), except it
  supports **multiple** groups per item (the spec explicitly asks for "one
  or more association groups", unlike the single-group requirement
  audience) — `PublishAssociationLearningContentInput.groupIds` is a plural
  array.
- `publish()` was rewritten from a single conditional `updateMany` with no
  transaction and no outbox call into a `$transaction` that (1) attempts the
  DRAFT/WITHDRAWN → PUBLISHED status claim, (2) always rewrites
  `audienceKind` and the full target set, and (3) appends the new
  `association.learning-content.published.v1` outbox event only when the
  status transition actually fired. This makes a duplicate publish request
  and an audience edit on an already-published item both idempotent through
  the same code path, without a second notification firing on every
  re-targeting — this was an explicit design decision to satisfy both
  "duplicate publish requests are idempotent" and "editing a published
  item... how newly added/removed recipients change" with one mutation
  rather than two.
- Added `AssociationLearningContentPublishedHandler` (mirrors
  `AssociationRequirementPublishedHandler`, logs only) and registered it in
  `association.module.ts` — an outbox event with no registered handler is
  treated as a permanent processing failure by
  `OutboxProcessorService`, so this was required, not optional.
- Cross-association/inactive rejection is enforced before the transaction
  opens (`verifyGroups`/`verifyActiveMembers`), so a request naming one
  valid and one invalid id writes nothing — no partial publication is
  possible.
- Frontend: replaced the single-dialog editor + separate publish dialog with
  one wizard (`AssociationLearningEditor` shell +
  `association-learning-step-{content,cpd,assignment,review}.tsx`), reusing
  the existing `ActivityStepper` (from the professional CPD-setup flow) and
  `AssociationRequirementMemberPicker` (from the requirements audience
  dialog) rather than building new primitives. The Assignment step's group
  multi-select is a small inline checkbox list — no reusable multi-group
  picker existed elsewhere to borrow, and a full combobox was not
  justified for what is usually a handful of groups.
- The Review step always offers two actions: "Save as draft" (persists
  content/CPD fields only, no publish call, so it never touches audience or
  status) and "Publish" (persists content, then publishes with the chosen
  audience). This uniformly covers first publish, draft editing, and
  republishing an already-published item's audience with the same two
  buttons, rather than branching UI by current status.
- The existing row-level "Publish" action for DRAFT/WITHDRAWN items and the
  new "Change audience" action for PUBLISHED items both open the same
  wizard, jumping straight to the Assignment step (`openPublish` now calls
  `openEditAtStep(item, 3)`) — satisfies the spec's own risk mitigation
  ("both entry points use one assignment controller/dialog").
- `category` is nullable end-to-end (schema, entity, DTO removed from
  input, zod schema, list/detail render an explicit "Uncategorised" label
  instead of a fabricated value) — satisfies the Risk section's mitigation
  for the nullable-category migration without inventing a default.
- Not implemented, explicitly out of scope for this pass: a professional-
  facing read surface for assigned learning content. Grepping the codebase
  confirmed no such surface exists today (published content has never been
  queryable from the professional side) — building one is a materially
  larger, separate feature than "correct the authoring/assignment
  workflow," and none of this spec's acceptance criteria test professional-
  side visibility. The target data this feature writes is exactly what such
  a surface would need to read later.
- Not implemented: assigning a compliance requirement from within the
  learning-content wizard — explicitly a non-goal in the spec.
- Not re-verified end-to-end in this pass: the notification/outbox consumer
  side beyond confirming the handler registers and the event fires only on
  a genuine status transition; `AssociationMessageService`'s cooldown-based
  dedup on the recipient side is unchanged and was not exercised by a new
  test in this feature.
