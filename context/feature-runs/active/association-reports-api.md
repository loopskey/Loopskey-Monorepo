# Association reports analytics API

- Scope: `api`
- Branch: `feature/association-reports-api`
- Base: `aee2196`
- Status: `Submitted`
- Spec: `context/features/association-dashboard/08-reports-analytics-api.md`

Phases 05, 06 and 07 have all landed on `develop`, so this branches from it
cleanly. No frontend in this phase — phase 09 consumes these queries and phase
10 exports them.

## The completion rule, now settled

Phase 08's specification demanded a credit-weighted completion figure — a
member holding a ten-credit and a ninety-credit requirement with ten credits
earned in the small one is at **ten percent** — while the `overallFor` merged in
phases 05 and 06 averaged capped assignment percentages and made the same member
**fifty percent**. Shipping both would have put two different numbers for one
member on adjacent screens.

**The user chose the weighted rule, so this run adopts it everywhere rather than
only in the reports.** `weightedCompletionFor` moved into
`compliance-attribution.util.ts`, which phase 05 established as the place
nothing else restates the definition, and `overallFor` now computes from summed
credits rather than averaged percents. The report util re-exports it instead of
carrying a second copy.

What that changed, deliberately:

- **The roster band and the member detail header** now read the weighted figure.
  `memberComplianceList` had to select `requirement.totalRequiredCredits`,
  because averaging percents needed no credits and weighting does.
- **The member header's credit totals** come from `overallFor`'s own sums rather
  than being added up a second time beside it, so the percent and the credits it
  is computed from cannot disagree.
- **Two phase 06 tests encoded the old rule and were rewritten**, not deleted:
  the one that asserted percent 50 for a 25/75 pair now asserts 41.67, and
  "caps a requirement over a hundred percent before averaging" — meaningless
  under weighting, since there is nothing to average — became two tests that pin
  the weighted behaviour against the specification's own example.
- **`association-compliance-read.service.spec.ts` is new.** The roster reduction
  had no test at all, which is exactly the surface that would have drifted back
  silently. Six tests now hold it to the weighted rule and to agreement with the
  header.

Rounding is unchanged in kind but now shared: `round2` lives beside the rule, so
the roster, the header, the reports and phase 10's exports all round once and
identically.

## Decisions

- **Every report is an aggregation over one as-of projection.** `projectAt`
  builds, for one association and one instant, the per-member and per-assignment
  figures; all ten queries then reduce that single structure. This is what makes
  the agreement criterion true by construction rather than by ten queries
  happening to round the same way, and it is why the summary, the distribution,
  the group report and the member report cannot drift apart.
- **As-of is what makes the trend historical.** Credits are summed from
  attributions whose `activityDate` falls on or before the point being computed,
  so a month's point reflects the learning that had happened by then. Today's
  cached aggregate on the assignment is never read for a past point.
  - **The limit of that, honestly stated:** an attribution's *state* is today's
    decision. An activity approved last week counts from its activity date, not
    from its approval date, because the row does not record when it was settled.
    A trend is therefore accurate about when learning happened and optimistic
    about when it was approved. Recording a settled-at timestamp on the
    attribution is the fix, and it belongs to whichever phase next writes that
    table.
- **Nothing here recomputes attribution.** The service sums rows phase 05
  already decided; it never calls `attributionFor`. The non-goal is respected —
  what it forbids is re-deciding whether an activity counts, not summing the
  decisions.
- **The projection is bounded by the association in the query, not after it.**
  Members are read with `associationId`, assignments with
  `requirement.associationId` plus `PUBLISHED`, attributions by those assignment
  ids. A second association's rows are unreachable rather than filtered out, and
  three specs assert the `where` shapes rather than the results.
- **`associationId` is only ever an administrator's argument.** For an owner it
  is `undefined` and the association comes from the authenticated user, which
  `requireReadable` enforces and a spec pins.
- **Ungrouped is a row, not a gap.** Members with no group collect under a row
  whose `groupId` is null, so the group counts sum to the total. Dropping them
  would make the group report quietly disagree with the summary.
- **Rounding happens once.** `round2`, `shareOf` and `weightedCompletionFor` are
  the only places a number is rounded, at the API boundary, so phase 09's cards
  and phase 10's files cannot round differently. They sit in
  `compliance-attribution.util.ts` with the rule itself.
- **Percent is not capped at a hundred.** A member who overshoots reads above
  it, which is information the association should see; the *band* still caps at
  renewal-ready. Only the share figures are bounded, because a share of a total
  cannot exceed it.
- **The period cap is one constant.** `REPORT_PERIOD_MAX_MONTHS` is thirty-six,
  checked once in `resolvePeriod`, so the trend's point count is bounded without
  the cap being restated in ten queries.

## Notes

- The filter, the period presets and the month-end walk live in
  `association-report-period.util.ts` as pure functions, so the nineteen
  period tests need no database and no service.
- The summary's change figures compare the projection at the period end against
  the projection at the start of the equally long window before it — the same
  `projectAt`, called twice, so a change can never be computed a different way
  from the figure it changes.
- `computedAt` on the summary is the oldest `computedAt` across the assignments
  in scope, so the tab can say when the cached projection was last refreshed
  rather than implying the figures are live.
- Slow reports log a warning with the filter and the duration above a
  two-second threshold; every report logs the association, the filter, the row
  count and the duration.
- No new model and no migration. The reads are `associationMember`,
  `associationRequirementAssignment` and a `groupBy` over
  `associationCreditAttribution`, all of which are already indexed on the
  columns used — the spec asked that indexes be justified by a real plan rather
  than added speculatively, and none proved necessary to add blind. See Gaps.

## Acceptance

- [x] A member with a ten-credit and a ninety-credit requirement, ten credits
      earned in the small one, is at ten percent — not fifty.
- [x] Members with no group appear under "Ungrouped" and the group counts sum
      to the total.
- [x] A period whose end precedes its start is refused with the invalid-period
      code.
- [x] The summary, the distribution, the group report and the member report all
      agree on totals for one filter.
- [x] An association with no requirements gets empty datasets and zeroed
      totals, not an error.
- [x] A deactivated member appears in no count unless the flag asks for them.
- [x] Each trend point reflects the state at that month's end, not today's —
      within the settled-at limitation recorded above.
- [x] No row of a second association appears in any report: three specs assert
      the association bound is in the `where` of every read.
- [x] Tests and the API scope gate pass.
- [x] The weighted rule is the only completion rule in the module: the roster,
      the member header and all ten reports call one function.

## Gaps

- **No query-plan check.** The specification asks for a plan for the largest
  report against a seeded association, recorded here. The project's Postgres on
  `127.0.0.1:15432` is down, so no `EXPLAIN` could be run and no index is added
  on speculation. What is known statically: the three reads are by
  `associationId`, by `memberId IN (…)` with a requirement join, and a `groupBy`
  over `assignmentId IN (…)` — all covered by indexes phases 01, 03 and 05
  already created. The trend issues one `groupBy` per month, so a
  thirty-six-month period costs thirty-six of them; that is the first thing to
  measure when a plan can be taken.
- **No E2E.** This phase's focused checks name five unit tests and a query
  plan, all of which are covered above except the plan. The reports are reads
  with no write path and no concurrency boundary, so a database-backed test
  would prove the same aggregation the unit tests pin, against fixtures that
  are harder to read.

## Verification

- `npm run lint --workspace api` - pass
- `npm run lint --workspace @loopskey/api-contracts` - pass
- `npm run check-types --workspace api` - pass
- `npm run check-types --workspace front` - pass (only `base.ts` moved)
- `npx tsc --noEmit -p apps/api/test/tsconfig.json` - pass
- `npm run test --workspace api` - pass, 86 suites and 963 tests, no failures
  and no timeouts, re-run in full after the weighted-rule alignment
- `npm run build --workspace api` - pass
- `src/architecture/*` - pass; no new model, no boundary exception, no new
  domain dependency
- `schema.gql` regenerated: ten queries, twelve object types, two inputs and
  one enum, as a 202-line pure addition; regenerated again after the alignment
  and byte-identical, because the rule changed what the numbers are and not what
  the contract exposes
- `npm run codegen --workspace front` - pass; `base.ts` gains 278 lines and no
  other generated file moves, because no frontend document consumes these
  queries yet
- New focused specs: `association-report-period.util.spec.ts` (19 tests — the
  four presets, the equal-length previous window, five refusals including an
  unparseable date and the cap boundary, the month-end walk and its clamp, and
  the weighted rule's rounding) and `association-report.service.spec.ts`
  (27 tests — the weighted rule against the specification's own example, the
  ungrouped row, totals agreeing across four reports, bands partitioning the
  membership, the empty association across every query, three association-bound
  assertions, both filter-target refusals, the deactivated flag, both period
  refusals, the historical trend, missing evidence, renewal readiness, category
  averaging including an untouched category, and cursor pagination)
- New `association-compliance-read.service.spec.ts` (6 tests) covering the
  roster reduction, which had none before: the weighted rule, agreement with the
  member header, banding from the weighted figure, the not-started case, a
  complete member held back by an unsettled review, and several assignments
  collapsing into one row
- Two phase 06 profile tests rewritten for the weighted rule, as described
  above

## Submission

- Commit: `7cd3c3d`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/51 (targets `develop`, ready for review)
- CI: see the PR checks on the final commit
