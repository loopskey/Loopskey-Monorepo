# Make association member and requirement actions discoverable and usable

- Scope: `front`
- Model: `High reasoning — cross-association ownership/ID validation on member and requirement assignment flows is security-sensitive, even though this pass turned out to be pure frontend wiring.`
- Branch: `feature/association-members-requirements-corrections`
- Base: `840c153` (origin/develop)
- Status: `Submitted`

## Acceptance

- [x] An admin can open Add/Invite, Upload, Assign Requirement, and Manage
  Groups from Members without navigating through a hidden detail action.
- [x] A member can be viewed, edited, and assigned from its row; updates appear
  in row and detail without refresh (existing RTK cache invalidation, now
  reachable from the row menu).
- [x] From an empty Requirements tab, an admin can create, publish, and then
  select the requirement in Assign Requirement (already wired; verified by
  reading, not changed).
- [x] Invalid category totals or dates are rejected without partial persistence
  (pre-existing backend validation; unchanged).
- [x] Double-submit/concurrent assignment creates one active assignment
  (pre-existing `AssociationRequirementAssignmentService`/`setRequirements`
  idempotency; unchanged, not re-verified end-to-end in this pass).
- [x] Cross-association member or requirement IDs are rejected (pre-existing
  ownership checks in the association services; unchanged).
- [x] Roster composition is absent and no chart bundle is loaded for it.
- [x] All actions remain reachable and labelled at 390 px (header collapses
  secondary actions into a labelled dropdown below `sm`; row actions were
  already in an overflow menu).

## Verification

- `npx tsc --noEmit` (front) — pass
- `npm run lint --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — pass; grepped `.next/static/chunks`
  for `roster-composition`/`RosterComposition` — no matches, confirming the
  chart bundle is gone
- No backend files were changed, so `npm run test --workspace api` / codegen
  were not re-run for this feature; all backend services this feature depends
  on (`association-requirement.service`, `association-member.service`,
  `association-member-requirements.service`,
  `association-requirement-assignment.service`) already have spec coverage.

Browser checks (empty/populated Members and Requirements, row actions,
keyboard menus/dialogs, mobile action overflow) were not run against a live
server in this pass — per the user's explicit choice to proceed on written
rules + screenshots rather than wait for the referenced layout video, pixel-
level table layout was not re-verified.

## Submission

- Commit: `bc01dc6`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/99
- CI: pass (https://github.com/loopskey/Loopskey-Monorepo/actions/runs/34693642864/job/103553279974)

## Notes

- Investigation found this feature was already ~80% implemented: Edit Member,
  per-member Assign Requirement, per-requirement audience Assign, and Create
  Requirement (header + empty state) all already existed with working
  dialogs/mutations. The actual gaps were discoverability (no row-level
  Edit/Assign shortcuts, no Members-header Upload/Assign-Requirement buttons)
  and the roster composition chart the spec explicitly asks to remove.
- Added `goToMember(memberId, action?)` to `useAssociationMembersTab` — pushes
  `/dashboard/association?tab=members&memberId=<id>&action=<edit|assign>`.
  `useAssociationMemberDetail` reads that `action` param once `member` has
  loaded (ref-guarded so it fires once), opens the existing Edit or
  Requirements dialog, then strips `action` from the URL via `router.replace`
  so a refresh doesn't reopen it. This reuses the exact same dialogs/mutations
  the per-member detail page already used — no new mutation path, satisfying
  the spec's own risk mitigation ("one assignment controller/dialog and one
  cache invalidation path").
- Added a global, member-first "Assign Requirement" flow for the Members
  header: `AssociationMemberAssignPickerDialog` reuses the existing
  `AssociationRequirementMemberPicker` constrained to a single selection (the
  `onChange` handler keeps only the most-recently-toggled id), backed by a new
  `assignPickerQuery` (`useAssociationMembersQuery`, `skip` until the dialog is
  open). Deactivated members are filtered out client-side (backend does not
  support a multi-status membership filter for this one dialog). Confirming
  navigates to that member's detail page with `action=assign`, landing on the
  same per-member requirements dialog as the row-level shortcut.
- Bulk upload moved from an always-visible 420px column into
  `AssociationMembersUploadDialog`, a thin dialog wrapper around the unchanged
  `AssociationMembersBulkCard`. The Members grid is now a single full-width
  table area.
- Removed `AssociationRosterCompositionCard`,
  `association-roster-composition-chart.tsx`, and the backing
  `utils/association-roster-composition.ts` (`buildRosterComposition`) after
  confirming (via repo-wide grep) no other consumers. Removed the composition
  query (`compositionQuery`) and its derived state from
  `useAssociationMembersTab`, and the `chart.*` i18n keys (en/fr) that were
  exclusively used by the removed component.
- Row actions in `association-members-table.tsx` gained "Edit Member" (always)
  and "Assign Requirement" (hidden for `Inactive` members, matching the
  domain rule that a deactivated membership cannot receive a new assignment).
- Not re-implemented: optimistic-concurrency/versioning for `updateMember`
  beyond the existing `MEMBER_ALREADY_ACTIVE` conflict — judged sufficient for
  the reported discoverability bug; a full CAS/version field would be
  over-engineering beyond this spec's scope.
- Not implemented: the DOCX-referenced video for exact member table layout was
  not attached; per the user's explicit choice, this pass implemented against
  the written functional/UX rules and screenshots only. Pixel-level table
  layout is out of scope for this pass.
