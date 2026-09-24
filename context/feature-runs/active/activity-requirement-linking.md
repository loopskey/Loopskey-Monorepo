# activity-requirement-linking

- Scope: `full`
- Model: `High reasoning — crosses the association/professional module boundary (new public-facing query), touches the exclusive cpdPlanId/associationRequirementId link invariant, and changes a shared GraphQL entity.`
- Branch: `feature/activity-requirement-linking`
- Base: `768a5e763cf6afdaa030f30ccd231e1b68a4eed1`
- Status: `Submitted`

## Acceptance

- [x] Given content endorsed by the professional's association for requirement R, when `Mark as complete` opens, then R is preselected with its explanation.
- [x] Given `None`, when the dialog is saved, then the activity has no link and appears only in My Learning Activities.
- [x] Given a personal plan, when the dialog is saved, then the plan's progress includes the activity.
- [x] Given an association requirement, when the dialog is saved, then the association sees the activity as counted or awaiting review, according to its evidence policy.
- [x] Given evidence is required and none is attached, when Save is clicked, then the save is blocked with a clear message.
- [x] Given content that was already completed, when the dialog opens, then the existing link is shown and can be changed.

## Design decisions

- Content endorsement lookup is a new professional-facing query owned by the
  association module (`myContentEndorsement`, next to the existing
  `myAssociationRequirements`/`myAssociationRequirement`), not an extension of
  the four separate content-detail queries (course/events/podcast/youtube).
  Those modules live in `learning-catalog`, which `domain-ownership.ts` does
  not allow to depend on `association-management`, so reaching the
  association's own tables from there is not available.
- Category restriction reuses the existing `myAssociationRequirement` detail
  query. `AssociationCategoryProgressEntity.categories` gains a `mappedCategory`
  field (backed by the already-stored `AssociationRequirementCategory.mappedCategory`)
  so the dialog can restrict the category select once a requirement is chosen.
- Rule 2 preselection (`?requirement=`/`?learningContent=`) is wired by having
  the requirement's learning-content list append those params to its internal
  "View" link, read back by `useMarkAsCompleted` via `useSearchParams`.
- Evidence-required enforcement is client-side only in the dialog (no new API
  validation), consistent with how evidence is already handled for personal
  PDU activities.

## Verification

- `npm run lint --workspace api` — pass
- `npm run check-types --workspace api` — pass
- `npm test --workspace api` — pass (117 suites, 1381 tests)
- `npm run lint --workspace front` — pass (incl. `check-i18n`)
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — no regression (`/dashboard/professional` ~1607 KB, in line with sibling dashboard routes)
- API e2e (`test/concurrency/pdu-activity-association-requirement.e2e-spec.ts`, real Postgres): content-linked activity accepted for an assigned requirement, rejected for an unassigned one — pass (added 2 new cases, 6/6 total)
- Live smoke test against the running dev API (seeded `professional.2@loopskey.dev`): inserted a temporary `AssociationLearningContent` row, confirmed `myContentEndorsement` resolves the direct link and the no-requirement fallback (`isDefaultRequirement`), confirmed `createProfessionalPduActivity` accepts `associationRequirementId` + `associationLearningContentId` together, then cleaned up all test rows.
- Browser (manual, Playwright MCP unavailable in this session): not run. The dialog itself was not clicked through in a live browser session — data-flow, type, lint, build and live-API checks above are what this run's confidence rests on. Flag this to the user before treating the UI as fully verified.

## Submission

- Commit: 2ee243a
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/221
- CI: pending
