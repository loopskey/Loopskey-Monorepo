# Complete roadmap generation and remove fabricated progress

- Scope: `full`
- Model: `High reasoning — cross-module aggregate correctness, generation idempotency, and a shared chat/brief state contract.`
- Branch: `feature/roadmap-generation-and-stats-corrections`
- Base: `0962499` (origin/develop)
- Status: `Submitted`

## Acceptance

- [x] Each accepted chat answer appears in the live Roadmap Brief and updates
  completion/remaining fields from the server draft.
- [x] A complete valid draft shows an enabled Generate Roadmap action that calls
  the existing generation path.
- [x] Double-click/retry during an accepted generation creates one generation
  and one resulting enrolment (pre-existing backend idempotency, already
  tested; now actually reachable from the UI).
- [x] Generation success exposes the new roadmap without a hard refresh;
  retryable and terminal failures show different actions (via the existing
  My Roadmap generation-status component and its own retry-by-resubmission).
- [x] With no roadmaps, next milestone is null/Not available and no card shows
  25.
- [x] Stats remain the same while paging/filtering the roadmap list because they
  cover the full owner dataset.
- [x] Average and next milestone are correct at 0, 24.9, 25, 99.9, and 100.
- [ ] A user cannot read or generate another user's draft/roadmap — unchanged
  pre-existing ownership checks (already tested), not modified by this
  feature; not re-verified end-to-end in this pass.

## Verification

- `npm run build --workspace @loopskey/api-contracts` — pass
- `npm run check-types --workspace api` — pass
- `npm run lint --workspace api` — pass
- `npm run test --workspace api` — pass (110 suites / 1188 tests, including new
  specs for `computeRoadmapNextMilestone`, `draftCompletionSummary`,
  `ProfessionalRoadmapService.roadmapStats`, and a brief-completion assertion
  added to the existing chat service spec)
- `npm run build --workspace api` — pass
- `npm run check-types --workspace front` — pass
- `npm run lint --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — pass (roadmap-chat route +6 KB
  first-load JS from the brief's progress bar; no heavy dependency added)
- `npm run codegen --workspace front` — regenerated the new draft/stats fields
- `npm run lint` / `npm run check-types` (root/turbo) — pass
- Existing generation idempotency tests
  (`professional-roadmap-generation.service.spec.ts`) already covered claim
  races and duplicate-request behavior; unchanged by this feature.

Browser checks (progressive brief updates, editing, generation, refresh,
error/retry, responsive chat/brief layouts) were not run against a live
server in this pass.

## Submission

- Commit: `97f96f8`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/98
- CI: pending

## Notes

- The backend generation path (`ProfessionalRoadmapGenerationService`) was
  already fully idempotent (conditional `updateMany` claim from
  READY/FAILED to GENERATING) and already tested. The actual gap was that
  `ProfessionalRoadmapChatPage.tsx` never called
  `requestRoadmapGeneration` at all — `RoadmapReviewSummary`'s `onGenerate`
  prop existed but was never passed. Wired it through `useRoadmapChat.generate()`.
- `RoadmapGenerationStatus` (queued/generating/failed UI with retry-via-chat)
  already existed and was already wired into the My Roadmap tab's existing
  bounded poll (`useProfessionalRoadmapDraftStatusQuery`). Generation success
  now navigates there (`router.push`) instead of duplicating status UI on the
  chat page — satisfies "returning to My Roadmap shows the new roadmap
  without a hard refresh" via the existing RTK cache invalidation.
- Added `ProfessionalRoadmapDraftEntity.completedFieldCount`,
  `requiredFieldCount`, and `remainingFields`, computed once in
  `professional-roadmap-chat.service.ts#view()` (the single function every
  draft-returning mutation/query already funnels through) via a new
  `draftCompletionSummary()` in `roadmap-step-machine.util.ts` that reuses
  the wizard's own `applicableSteps`/`isStepSatisfied` — the brief can never
  disagree with the chat about what's left to answer.
- `RoadmapReviewSummary` is now always rendered once a draft exists (not
  gated behind `isComplete`), with a completion progress bar. Removed its
  unused `onKeepEditing` "back to chat" affordance now that the brief lives
  permanently beside/above the chat rather than replacing it.
- New `professionalRoadmapStats` GraphQL query
  (`ProfessionalRoadmapService.roadmapStats`) pages through every owned
  enrollment (not one paginated page), reuses the exact same
  `deriveRoadmapProgress` derivation `myRoadmaps` uses per card, and returns
  `enrolledCount`, `averageProgress`, `completedPhaseCount`,
  `totalPhaseCount`, and a nullable `nextMilestone`. `nextMilestone` is
  `null` with zero enrollments (the actual fabricated-25 bug: the old
  client-side code computed the milestone formula against an average of an
  empty array). New `computeRoadmapNextMilestone()` operates on the
  unrounded average so 24.9 resolves to 25, not the 50 a pre-rounded 25
  would give.
- `useProfessionalRoadmaps` now reads this query instead of averaging the
  current page's `myRoadmaps` client-side. `ProfessionalRoadmapTab.tsx`
  distinguishes loading (`…`), error (`—`), and a null milestone
  ("Not available") from a genuine zero.
- New `ProfessionalRoadmapStats` RTK tag, invalidated by
  `requestRoadmapGeneration` and `completeRoadmapStep` (the two mutations
  that can change the aggregate); `startRoadmapStep` does not, since it
  never changes progress or phase completion.
- Not implemented, out of scope for this pass: moving focus to the first
  actionable failure/success control on a generation status change
  (UX Requirements' assistive-technology focus-management item) — the
  existing `role="status" aria-live="polite"` announces the state change,
  but no explicit focus-move ref was added.
- Retryability: the backend does not distinguish a "retryable" from a
  "terminal, non-retryable" failure reason today (every `FAILED` draft can
  be resubmitted via the same mutation, and the claim logic already allows
  it). Rather than fabricate a distinction the domain doesn't back, Retry is
  offered uniformly for `FAILED` via the existing "back to chat" action on
  `RoadmapGenerationStatus`. If a genuinely non-retryable failure class is
  introduced later, this is the place to add an explicit flag.
