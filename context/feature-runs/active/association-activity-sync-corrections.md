# Reliably synchronize member activity and evidence to associations

- Scope: `api`
- Model: `High reasoning — transactional outbox atomicity, idempotent/out-of-order event consumption, and reconciliation are exactly the concurrency/data-integrity risk class this tier exists for.`
- Branch: `feature/association-activity-sync-corrections`
- Base: `a312fcb` (origin/develop)
- Status: `Submitted`

## Acceptance

- [x] An invited/accepted professional records a qualifying activity and it
  appears in that association's member detail after outbox processing
  (unchanged read path; the fix closes the write-side event-loss window so
  the event this read path depends on is now reliably published).
- [x] Adding evidence later updates missing-evidence/review state without
  another activity edit (evidence add/remove now publish their own
  transactional event; already read live via the existing
  `hasEvidence`/`activitiesForMembers` snapshot).
- [x] Updating credits/category/date/status and deleting activity or evidence
  recalculates projection and reports correctly.
- [x] A database write cannot commit without its outbox row when an event is
  required; a rolled-back write publishes nothing (all seven mutation sites
  now use `$transaction` + `outbox.append(event, tx)`; proven by a test that
  asserts nothing is appended when the transaction throws).
- [x] Duplicate and out-of-order events converge to the current professional
  snapshot with no duplicate attribution (handler always recomputes from
  the live snapshot rather than applying a payload delta; verified the
  per-assignment claim-then-write guard also protects the attribution
  upsert/delete, not just the cached totals, closing a real ordering hole
  found during this feature).
- [x] A member of two associations updates each permitted projection without
  cross-association leakage (unchanged: `recomputeForUser` already scopes
  by `member.userId` per assignment/association; not modified).
- [x] Reconciliation repairs a deliberately stale projection and a second run
  makes no further changes (new bounded, keyset-paginated
  `AssociationComplianceReconciliationService`; covered by a test asserting
  a second pass reports zero repairs).
- [x] A non-member or inactive member's data is handled according to existing
  visibility rules and is not exposed accidentally (reconciliation's scan
  explicitly excludes `AssociationMemberStatus.INACTIVE`; the handler's
  recompute path is unchanged and pre-existing).

## Verification

- `npm run lint --workspace api` — pass
- `npx tsc --noEmit -p apps/api/tsconfig.json` — pass
- `npm run test --workspace api` — pass (112 suites / 1215 tests), including:
  - 4 new atomicity tests in `professional-pdu.service.spec.ts` (create,
    update, delete all use `$transaction`; a thrown create never appends)
  - updated `professional-pdu-file.service.spec.ts` /
    `professional-compliance-api.service.spec.ts` for the new
    `tx`/`changeKind` signatures
  - new `association-learning-activity.handler.spec.ts` (5 tests: registers
    for the new event, recomputes for every change kind, ignores a payload
    with no user id, redelivery and revision/ordering are both harmless)
  - 2 new tests on `AssociationComplianceService` confirming attribution
    upsert/delete never runs when the staleness claim is lost
  - 3 new tests on the new `previewAssignment` read-only comparison
  - new `association-compliance-reconciliation.service.spec.ts` (5 tests:
    scan scoping, dry-run vs apply, keyset paging, idempotent re-run)
  - `professional-architecture.spec.ts` and `architecture/domain-ownership.spec.ts`
    pass unchanged — no new cross-module Prisma access was added
- `npm run build --workspace api` — pass
- No Prisma schema/migration changes were needed: `OutboxDelivery`
  (`@@id([eventId, handlerName])`) already provides per-handler dedup, so no
  new idempotency storage was added.
- No frontend changes: this feature touches no resolver, entity, or DTO, so
  `schema.gql` is unchanged and no frontend codegen/type-check was required.
- E2E, run locally against a real Postgres (`loopskey-schema-gen` container,
  temporary `loopskey_test` database, dropped afterward) with the full Nest
  app bootstrapped:
  - `test/concurrency/pdu-activity.e2e-spec.ts` — pass
  - `test/concurrency/outbox-delivery.e2e-spec.ts` — pass (13/13 combined)
  The full `test:e2e` suite (all modules) was not run locally in this pass;
  CI runs it against its own Postgres service container.

## Submission

- Commit: `4ac2934`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/101
- CI: pass (https://github.com/loopskey/Loopskey-Monorepo/actions/runs/34708964718/job/103594127441)

## Notes

- The core bug was exactly as the spec described: `ProfessionalPduService`,
  `ProfessionalPduFileService`, and `ProfessionalComplianceApiService.settleReview`
  each committed their `PDUActivity`/`PDUActivityFile` write first and only
  then called `OutboxService.append(event)` with the default writer (a
  separate implicit transaction) — a crash between the two lost the event
  forever with no trace. All seven mutation sites (activity create ×2,
  content-linked update, activity update, activity delete, evidence upload
  per-file, evidence delete, review settle) now open one `$transaction` and
  pass its `tx` into `outbox.append`, mirroring the pattern already used
  correctly by five other modules in this codebase
  (`association-requirement.service.ts`, `association-settings.service.ts`,
  `association-learning-content.service.ts`, `association-message.service.ts`,
  ingestion services).
- The event contract was renamed `professional.learning-activity.recorded.v1`
  → `professional.learning-activity.changed.v1` and gained `changeKind`
  (`CREATED|UPDATED|DELETED|STATUS_CHANGED|EVIDENCE_ADDED|EVIDENCE_REMOVED`),
  `revision` (ISO timestamp — the row's `updatedAt` where a row still exists
  after the write, else the transaction's capture time for deletes), and
  `occurredAt`. `AssociationLearningActivityHandler`'s `handlerName` moved to
  `-v2` alongside it. This is a breaking rename, not an additive version:
  any outbox rows already queued under the old event name at deploy time
  would have no registered handler and fail permanently. Given the low
  volume this event sees and that reconciliation now exists as a bounded
  safety net for exactly this kind of gap, a coordinated rename was judged
  simpler and clearer than carrying two parallel event names.
- Investigation surfaced a genuine ordering hole beyond what the spec named:
  in `AssociationComplianceService`, the per-assignment `computedAt`
  staleness guard protected only the cached total/band update, not the
  credit-attribution upsert/delete that ran unconditionally beforehand. A
  slow, stale recompute could still overwrite attribution rows a faster,
  newer recompute had already written, even though its own total/band
  update was correctly discarded. Fixed by claiming the assignment under
  the staleness guard *first*, inside the same transaction, and skipping
  the attribution writes entirely when the claim is lost.
- Reconciliation (`AssociationComplianceReconciliationService`) is modelled
  directly on the existing `AssociationReportRetentionService` sweep pattern
  (`OnModuleInit` + `setInterval(...).unref()`, a `running` re-entry guard).
  It scans `AssociationRequirementAssignment` rows for published
  requirements and non-inactive, targeted members via keyset pagination
  (`cursor: {id}, skip: 1`, ordered by `id`), and for each row calls a new
  read-only `AssociationComplianceService.previewAssignment()` (extracted
  the existing pure attribution/totals/band computation into a shared
  `computeTotals()` helper so preview and the real write share one source
  of truth) to decide whether a repair is needed before calling the
  existing `recomputeAssignment()` to apply it. `dryRun` skips the apply
  call; both modes report `{scanned, repaired, nextCursor}` per page, and
  `reconcileAll()` walks every page to completion for a manual/scheduled
  full sweep. Configurable via `COMPLIANCE_RECONCILE_SWEEP_MS` (default 6h).
- No dedicated CLI/nest-commander command was added to trigger a manual
  dry-run or replay beyond calling `reconcile()`/`reconcileAll()` directly;
  the codebase has no existing command-runner precedent to extend (checked:
  no `nest-commander` or CLI entrypoint exists anywhere in `apps/api`), and
  building one from scratch was judged out of proportion to this bug fix.
  The scheduled sweep plus the service's own public methods satisfy "safe
  to run twice" and bounded pagination; wiring a CLI/admin trigger on top is
  a reasonable follow-up if manual on-demand reconciliation is needed sooner
  than the 6-hour default.
- Not implemented: a dedicated `abandon()` hook on
  `AssociationLearningActivityHandler` for terminally-failed events beyond
  what `OutboxProcessorService` already does generically (stops reclaiming
  at `attemptCount >= 10`, logs, remains inspectable/resettable) — no other
  handler in the codebase implements `abandon()` either, so this preserves
  existing convention rather than introducing a one-off pattern.

## Environment note (unrelated to this feature)

`git status` on this branch also shows uncommitted working-tree modifications
to `apps/front/src/components/elements/content-motifs/{business,career,cpd,finance,leadership}.tsx`
and `apps/front/src/lib/social-card/motifs.ts` (SVG redesign content) that
this feature never touched and did not create. The worktree was confirmed
clean before this branch was cut from `origin/develop`, so these appeared
during this session from an unknown source. They were left untouched and are
not part of this feature's commit — flagged here rather than silently staged
or discarded, per instructions to preserve unfamiliar in-progress work.
