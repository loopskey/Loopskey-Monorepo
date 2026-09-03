# Association compliance projection

- Scope: `api`
- Branch: `feature/association-compliance-projection`
- Base: `1e6c712`
- Status: `Submitted`
- Spec: `context/features/association-dashboard/05-compliance-projection.md`

Scope is `api`. No frontend consumes this yet — phases 06, 09, 11 and 12 do.
The GraphQL schema grows, so `schema.gql` and the generated `base.ts` move; no
frontend document changes and no other generated file does.

## Decisions

- **The band gap.** The specification defines `ON_TRACK` as "at or above the
  on-track threshold" and `AT_RISK` as "above zero but below the at-risk
  threshold", which leaves the range between the two thresholds unnamed. The
  user chose: `AT_RISK` owns it. Anything short of the on-track threshold that
  is not zero reads as at risk, so an association is never told a member is on
  track while they sit below the bar it set. `atRiskThreshold` therefore drives
  phase 11's nudge list rather than the band boundary. `bandFor` carries this
  reasoning and every other surface calls it rather than restating it.
- **The specification's stated defaults are wrong.** It says phase 00 created
  thresholds of "seventy and thirty"; the schema says 70 and 40. The schema
  wins — phase 00 already shipped, and changing a default now would silently
  reband every existing association.
- **The port is framework-free, so its enum-valued fields are plain strings.**
  `module-boundaries/internal-imports` refuses `@prisma/client` inside a
  `public/` contract, which is the same discipline `IDENTITY_PROFILE_API`
  follows with `role: string`. The attribution rule types the incoming activity
  as loosely as it arrives and keeps the requirement — which is the association's
  own row — strongly typed.
- **The rejection reason lives on the activity, not the projection.** The member
  reads it on their own dashboard, so it is correspondence and belongs with the
  row the member owns. `PDUActivity.reviewNote` is written through the port.

## Acceptance

- [x] A `PENDING` activity under a review policy does not count, raises the
      awaiting-review count, and sets the missing-evidence flag.
- [x] Approving it counts the credits once and clears the flag.
- [x] Two concurrent approvals leave one audit entry; the loser gets the
      already-settled code.
- [x] A rejection with no reason is refused.
- [x] A mapped activity counts toward its category and the requirement total,
      and toward no other category.
- [x] An activity satisfying two requirements counts in full for each.
- [x] Grace period and late submission decide whether a late activity counts,
      and it is marked late when it does.
- [x] Recomputation is idempotent.
- [x] A stale recomputation discards its result.
- [x] No activity of a non-member is reachable under any argument.
- [x] `prisma-ownership.spec.ts` and `module-boundaries.spec.ts` pass with no
      new boundary exception.
- [x] Tests and the API scope gate pass.

## Notes

- `AssociationCreditAttribution` is the whole design. One row per (assignment,
  activity), unique on that pair, which is what makes recomputation idempotent
  and what lets one activity count in full toward several requirements without
  any of them reducing another. `activityId` is a plain string rather than a
  foreign key: a constraint between an association-owned table and a
  professional-owned one would stop either module migrating alone, and a missing
  activity is a deleted submission rather than a broken constraint.
- The cached aggregate on the assignment is always derivable. Every write path
  recomputes it, the maintenance mutation rebuilds it, and `computedAt` is
  exposed so a stale figure is detectable rather than invisible.
- The stale guard is a conditional write, not a lock: the aggregate update names
  `computedAt IS NULL OR computedAt <= startedAt`, so a slow pass that finishes
  after a newer one matches nothing and is dropped. The service counts those as
  `discarded` rather than silently succeeding.
- The review decision is the professional module's `updateMany` naming
  `PENDING` with `count === 1`. The association side checks the attribution
  state first for a readable message, but that read is not the boundary — the
  conditional write is, and the loser of a race gets the already-settled code
  and writes no audit entry.
- Recomputation is driven by the outbox event, by publishing a requirement, by
  changing an audience and by settling a review. A lost event costs freshness,
  not correctness, because every other path repairs it and each is idempotent.
- The attribution rule and the bands are pure functions in
  `compliance-attribution.util.ts`. Every later phase reads the projection or
  calls these; nothing recomputes the definition.
- Four new invariants are recorded in `docs/concurrency-operations.md`.

## Gaps

- **No scheduler, so a cycle boundary is crossed on the next write, not at
  midnight.** The codebase has no `@nestjs/schedule`; the outbox processor uses
  a bare `setInterval`. Rather than invent a second scheduling mechanism for
  this phase, `rollOverDueCycles` is wired to the maintenance mutation, which is
  a real caller and gives an association a way to advance its own cycles. A
  periodic trigger is a small follow-up once any phase needs one.
- **The migration has not run against a local database.** The project's Postgres
  on 127.0.0.1:15432 is down and the server on 5432 is not ours, so the SQL is
  hand-written and idempotent rather than diffed by Prisma. Unlike phase 03,
  this is genuinely exercised in CI: the E2E global setup runs
  `prisma migrate deploy` before the suite, and the new E2E reads and writes
  every table this migration adds.
- **`atRiskThreshold` is now settings the projection does not read.** It is the
  phase 11 nudge threshold under the band decision above. Nothing is broken; it
  simply has no consumer until then.
- The `AssociationAttributionState` enum is not exposed through GraphQL. Nothing
  this phase renders needs it, so registering it would have been a speculative
  export; phase 09 can add it when it shows a member their own attributions.

## Verification

- Re-run in full after the user's comment-removal refactor, which had taken a
  method signature with a docblock; the signature was restored and every gate
  below re-run against the refactored tree.
- `npx prisma validate` / `npx prisma generate` - pass
- `npm run lint --workspace api` - pass
- `npm run check-types --workspace api` - pass
- `npx tsc --noEmit -p test/tsconfig.json` - pass (the new E2E type-checks)
- `npm run test --workspace api` - pass (78 suites, 844 tests; 57 new)
- `npm run build --workspace api` - pass
- `src/architecture/*` - pass (47 tests), no new boundary exception;
  `AssociationCreditAttribution` registered in `MODEL_OWNERSHIP`
- `schema.gql` regenerated: three queries, two mutations, six object types and
  one enum added
- `npm run codegen --workspace front` - pass; `base.ts` is a 116-line pure
  addition and no other generated file moves
- `npm run check-types --workspace front` - pass
- New focused specs: the attribution rule table-driven over every evidence
  policy, window edge, grace period and category mapping; the band boundaries at
  zero, between thresholds, at the on-track threshold and at a hundred percent
  with an unsettled review; recomputation idempotence and the stale guard; the
  review conditional write and its refusals; the port's ownership boundary
- New E2E (`test/concurrency/association-review.e2e-spec.ts`): approve, reject
  with the member's view of the reason, two simultaneous approvals leaving one
  audit entry, and a repeated recomputation changing nothing. Not run locally —
  no database — and first exercised in CI.

## Submission

- Commit: `ef919a9`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/48 (targets `develop`, ready for review)
- CI: see the PR checks on the final commit
