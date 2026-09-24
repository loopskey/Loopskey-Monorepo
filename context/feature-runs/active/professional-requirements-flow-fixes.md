# professional-requirements-flow-fixes

- Scope: `full`
- Model: `High reasoning — cross-module architecture (new professional/association public port), a security-sensitive ownership guard, Prisma migrations with backfill, and concurrency-safe data flow`
- Branch: `feature/professional-requirements-flow-fixes`
- Base: `d60f001708723ae4103c540860c407cce78431eb`
- Status: `Submitted`

## Acceptance

- [x] Given an association requirement for certification X and a roadmap draft that ran CPD setup for X, when the Requirements tab loads, then the association requirement appears once and no draft plan appears. (`upsertDraftPlan` now creates `DRAFT`; `myPlans`/`myCpdPlans` filter to `ACTIVE`; backfill migration moved existing unconfirmed roadmap-origin plans to `DRAFT`. Verified: unit tests + a dev-DB backfill sanity check.)
- [x] Given repeated roadmap resets with CPD setup, when the Requirements tab loads, then no new personal plans appear. (Same DRAFT filter — repeats stay hidden regardless of count.)
- [x] Given an association requirement, when `Log activity` is clicked ten times in a row across reloads, then the form opens with that requirement preselected every time. (FR12 refetch policy + FR13 per-navigation reset fixes the stale-options/stale-form root causes found in the spec. Verified by code path, not by 10 manual browser reloads.)
- [x] Given `Log activity` from Requirements, when the activity saves, then the primary action returns to Requirements with the same requirement selected. (`returnTo=cpd-pdu-progress` threaded through; success panel's primary action becomes "Back to Requirements".)
- [x] Given a requirement id not assigned to the caller, when an activity is created or updated with it, then the API rejects it and nothing is saved. (New ownership guard — verified by a real Postgres e2e test, not just mocks.)
- [x] Given the association `Add member` dialog, when requirements load, then no `Set by audience` rows appear, and the auto-applied count note is correct. (Applied to both the single-invite and bulk-import dialogs.)
- [x] Existing personal plans that have activities keep their activities and progress. (Backfill only moves plans with zero linked `PDUActivity` rows to `DRAFT`; `DRAFT` plans are still readable by id/progress, only excluded from the `myPlans` list.)
- [x] Given a professional with the dashboard open, when the association assigns a new requirement and the professional returns to the tab, then the requirement appears without a manual reload. (`refetchOnMountOrArgChange` + `refetchOnFocus` on the 5 requirement/plan queries.)
- [x] Given an older account that has used several tabs, when `Log activity` is clicked on requirement A, then on B, then the form opens clean each time. (FR13's navigation-identity reset effect.)
- [x] Given `Add learning activity` in My Learning Activities, after an earlier Requirements `Log activity`, then an empty form opens, and saving returns to My Learning Activities. (`returnTo=cpd-pdu-tracker` set explicitly at that call site; falls back there by default otherwise.)
- [x] Given a new requirement is created or edited, then the page stays on Requirements with that requirement selected. (Already true — `useCpdPduProgress`'s plan CRUD never navigates away; verified by reading, not changed.)

## What shipped, by functional requirement

1. **FR1/FR2 — draft plans.** `upsertDraftPlan` creates `CPDPlanStatus.DRAFT`; `myPlans`/`myCpdPlans` filter to `ACTIVE`; `createPlanFromSuggestion` promotes a matching `DRAFT` to `ACTIVE` instead of returning it hidden; new `activateCpdPlan` mutation and `myDraftCpdPlans` query let the professional promote a draft explicitly. Backfill migration `20260924090100_backfill_roadmap_draft_cpd_plans` moves existing unconfirmed roadmap-origin plans to `DRAFT` (0 plans matched on the dev DB — the seeded plans all have activities or aren't roadmap-origin).
   - **Deviation from the spec's suggestion:** the spec recommended prompting "Track `<cert>` in Requirements?" right when roadmap generation completes. I did not trace that far into the roadmap-chat completion screen (a large, separate component tree). Instead the Requirements tab itself shows a compact banner for any `DRAFT` plan with a "Track in Requirements" button, calling the same `activateCpdPlan` mutation. Same user value (a roadmap-coach plan can always be promoted to a real requirement), smaller blast radius. Revisit if the product wants the prompt at generation time instead.
2. **FR3 — coexistence hint / confirm-before-duplicate.** **Deferred.** Association requirements have no `certificationId` (`AssociationMyRequirementsService.project()` never selects one — they're free-text `name`/`description`), so matching a personal-plan suggestion against an association requirement can only be done by fuzzy name matching. The spec itself lists this as a "Decision needed," not a fixed design. Shipping a heuristic string-match confirm dialog felt worse than shipping nothing — false positives would train professionals to click through it. Left for a follow-up once there's a real match key (or a product decision to skip matching and always show both).
3. **FR4 — dedupe.** `buildRequirementOptions` now dedupes by key.
4. **FR5 — URL sync.** `useCpdPduProgress`'s `selectedKey` now re-syncs from `?requirement=` when the URL changes externally, and pushes back to the URL (via `router.replace`) when the professional changes the selection. The "unknown key" fallback relies on the existing `resolveActiveKey` (falls back to the first option) — no separate error banner was added.
5. **FR6/FR7 — Log activity navigation + success screen.** `logActivityHref` now appends `returnTo=cpd-pdu-progress`. The success panel's primary button becomes "Back to Requirements" (carrying the submitted requirement key) when `returnTo` resolves to Requirements; "View all activities" becomes a secondary button in that case. Without `returnTo`, the panel is unchanged.
6. **FR8 — sidebar parent mapping.** `add-activity` and `activity-detail` added to `DASHBOARD_TAB_PARENTS` (`certificate-form` was already there).
7. **FR9 — ownership guard (the main backend piece).** `professional` cannot import `association` (enforced by `src/architecture/domain-ownership.ts` + two automated boundary tests — confirmed by trying the direct-import approach first and watching `module-boundaries.spec.ts`'s intent become clear). Built a small professional-owned read-model instead: `ProfessionalAssociationRequirementLink` (new table), populated by `association`'s `AssociationRequirementAssignmentService` calling a new professional-owned public port (`PROFESSIONAL_REQUIREMENT_DIRECTORY_API`) every time assignment targeting is (re)materialised — the same three methods (`materialise`, `materialiseForMember`) that already keep `isTargeted` accurate. `ProfessionalPduService.createPduActivity`/`updatePduActivity` now reject an unassigned `associationRequirementId` with `PDU_ACTIVITY_ASSOCIATION_REQUIREMENT_NOT_ASSIGNED`. New migration backfills the table from current assignments (220 rows on the dev DB). Verified with unit tests (mocked) and a new real-Postgres e2e spec (`test/concurrency/pdu-activity-association-requirement.e2e-spec.ts`) that exercises the whole path: `materialise()` → cross-module push → accept/reject.
8. **FR10 — success screen shows attribution state.** **Deferred.** Would need the read-model in FR9 (or a similar mechanism) to also mirror `AssociationCreditAttribution.state`, which is a bigger, separate piece of cross-module state than "is this id assigned to me." Flagging rather than half-building it.
9. **FR11 — `Set by audience` rows.** Removed from both the single-invite and bulk-import `Add member` dialogs; both now show a one-line auto-applied count instead.
10. **FR12 — stale cache.** `refetchOnMountOrArgChange: true` + `refetchOnFocus: true` (via a shared `REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS` constant) on every call site of `myAssociationRequirements`, `myAssociationRequirement`, `myCpdPlans`, `cpdPlanProgress`, `cpdPlanActivities` — 13 call sites across `useCpdPduProgress`, `useProfessionalAddActivity`, `useProfessionalCpdPduTracker`, the certificate hooks, and the overview CPD card.
11. **FR13 — add-activity form reset.** New effect in `useProfessionalAddActivity` keyed on a `requirement|learningContent|id` identity string: resets the form, step, `isSubmitted`, upload stage, and both one-shot prefill refs whenever that identity changes while the component stays mounted (does not fire on first mount, so it doesn't fight the initial-prefill effects).
12. **FR14 — `returnTo` semantics.** `RETURN_TO_PARAM`/`RETURN_TO_TRACKER`/`RETURN_TO_REQUIREMENTS`/`resolveReturnTo`/`returnTargetHref` added to `professional-requirement.helper.ts`. `useProfessionalCpdPduTracker`'s `handleAddActivity`/`handleEditActivity` set `returnTo=cpd-pdu-tracker` explicitly; `logActivityHref` sets `returnTo=cpd-pdu-progress`. Cancel and the success screen's primary action both resolve through the same `goToReturnTarget`.
13. **FR15 — requirement CRUD stays on Requirements.** Already true by inspection — `persistPlan`/`confirmDelete` in `useCpdPduProgress` never call `router.push`. No change needed.
14. **FR16 — live refresh after logging an activity.** Already true by inspection — `createProfessionalPduActivity`/`updateProfessionalPduActivity` invalidate the `ProfessionalPdu` tag, and `cpdPlanProgress`/`cpdPlanActivities`/`myAssociationRequirement(s)` all provide it, so RTK Query refetches any mounted, subscribed query automatically. No frontend test was added for this — `apps/front` has no test suite per `context/coding-standards.md` ("Frontend tests"); this is a code-reading verification, not a browser one.

## Verification

- `npm run test --workspace api` — pass (117 suites / 1375 tests)
- `npm run lint --workspace api` — pass
- `npm run check-types --workspace api` — pass
- `DATABASE_URL=<isolated loopskey_test> npx jest --config ./test/jest-e2e.json` (from `apps/api`) — 21/22 suites, 146/147 tests pass. The one failure, `test/ingestion-kinds.e2e-spec.ts` › "consumes ingestion.item.published and screens the image candidate without fetching", is in the unrelated ingestion/image-screening outbox path (no ingestion file was touched on this branch) and reproduces in isolation on `develop`-derived code with no relation to this feature; it looks like a pre-existing environment dependency (an external screening call/timeout), not a regression from this branch.
- New e2e spec `test/concurrency/pdu-activity-association-requirement.e2e-spec.ts` (4 tests) — pass: proves the real `materialise()` → cross-module directory push → accept/reject path against Postgres.
- `npm run lint --workspace front` — pass (includes the i18n placeholder guard)
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — no new heavy dependency; worst route 1712 KB, consistent with the existing shared dashboard shell
- Dev-DB backfill sanity check: 0 plans moved to `DRAFT` (none of the seeded plans matched the "roadmap-origin, no activities" condition), 220 rows populated into `ProfessionalAssociationRequirementLink` from existing real assignments
- Browser pass — **not run**: no browser automation tool was available in this session (Playwright MCP failed to connect, noted in the earlier i18n feature too). Every acceptance criterion above is backed by either an automated test or an explicit code-path citation; none were rubber-stamped without one.

### Scope gate

- Full: root lint, type-check, tests, build — all pass (see above). Codegen was run after every GraphQL schema/document change (`schema.gql` regenerated via the documented boot-and-kill trick, `npm run codegen --workspace front` after).

## Risks and Decisions

- **Deferred, documented above:** FR3 (coexistence confirm — blocked on association requirements having no certification key) and FR10 (attribution state on the success screen — would need the FR9 read-model extended to mirror attribution, a separate piece of work).
- **Architecture decision made without asking:** professional cannot depend on association (enforced by two automated tests, `domain-ownership.spec.ts` and the module-boundaries ESLint rule, which is acyclic-graph-checked). FR9's ownership guard is built as a professional-owned push-based read-model instead of a direct read, kept in sync at the three points `AssociationRequirementAssignmentService` already recomputes `isTargeted`. This is the only architecturally consistent option short of adding a permanent boundary exception (the exception register is a fixed, tracked count of 11 with a removal roadmap — growing it for a new feature would be the wrong direction).
- **I stopped the locally running API dev server (port 5700)** mid-session to release a Windows file lock on the Prisma query engine DLL so `prisma generate` could run. It is safe to restart with `npm run dev` (or `npm run dev --workspace api`); nothing else was affected.

## References

- `apps/api/src/modules/professional/services/professional-cpd-plan.service.ts` (`myPlans`, `myDraftPlans`, `upsertDraftPlan`, `activateDraftPlan`, `createPlanFromSuggestion`)
- `apps/api/src/modules/professional/services/professional-pdu.service.ts` (ownership guard)
- `apps/api/src/modules/professional/public/professional-requirement-directory-api.ts`, `application/professional-requirement-directory-api.service.ts` (new port)
- `apps/api/src/modules/association/services/association-requirement-assignment.service.ts` (`syncDirectoryForMembers`)
- `apps/api/prisma/migrations/20260924090000_professional_association_requirement_link/`, `20260924090100_backfill_roadmap_draft_cpd_plans/`
- `apps/api/test/concurrency/pdu-activity-association-requirement.e2e-spec.ts`
- `apps/front/src/hooks/useCpdPduProgress.ts`, `useProfessionalAddActivity.ts`, `useProfessionalCpdPduTracker.ts`
- `apps/front/src/utils/professional-requirement.helper.ts` (dedupe, `returnTo` helpers)
- `apps/front/src/lib/rtk/endpoints/cpd-plan.api.ts` (`REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS`, new draft/activate operations)
- `apps/front/src/components/modules/AssociationDashboard/parts/association-member-invite-dialog.tsx`, `association-members-bulk-card.tsx`
- `apps/front/src/components/modules/ProfessionalDashboard/parts/activity-success-panel.tsx`

## Submission

- Commit: 3b7126c
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/220
- CI: pending
