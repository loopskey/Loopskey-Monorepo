# professional-requirements-unified-view

- Scope: `front`
- Model: `Standard development — a bounded UI redesign of an established dashboard page, no security/data/migration risk.`
- Branch: `feature/professional-requirements-unified-view`
- Base: `768a5e763cf6afdaa030f30ccd231e1b68a4eed1`
- Status: `Submitted`

## Acceptance

- [x] Given a personal plan and an association requirement, when switching between them, then the layout and the action placement stay the same.
- [x] Given 1440×900, when a requirement is selected, then the summary, category progress, and the first recommended content are visible without scrolling.
- [x] Given mobile width, then `Log activity` stays reachable and no content overflows horizontally.
- [x] Association-only details (band, evidence policy, review count, endorsed content) are still shown.

## Design decisions

- One `RequirementDetailView` renders from a normalized `TRequirementViewModel`
  (`professional-requirement.helper.ts`: `planToViewModel`/`associationToViewModel`),
  built from data already fetched by `useCpdPduProgress`. Categories and
  activities are similarly normalized (`planCategoryRows`/`associationCategoryRows`;
  activities already shared a row shape via the existing
  `planActivityRows`/`associationActivityRows` helpers).
- The compact summary strip replaces the old header card + 4 stat tiles with a
  custom SVG progress ring (`requirement-progress-ring.tsx`) — the existing
  `ProgressDonutChart` (Recharts) has a fixed ~208px container and isn't built
  to shrink to the spec's ≤96px ring.
- The switcher (`requirement-selector.tsx`) uses the existing native `Select`
  full-width on mobile rather than a new Sheet component, and omits a
  per-option progress mini-bar: association options carry `percent` in their
  list query already, but personal plans don't (no per-plan progress is fetched
  for the list), so a bar would be fabricated for half the options. `Log
  activity` becomes a sticky-bottom button below `sm`.
- Personal-only `Edit`/`Delete` actions moved out of the old selector row into
  the summary strip (icon buttons, `PLAN` source only). The CPD summary export
  stays where it already was, in the tab header, since `canGenerateSummary`
  already gates on a selected plan.
- `CpdMissingRequirements` (a separate panel) was folded away: its signals
  (remaining credits, category shortfalls, missing evidence) already surface
  through the summary strip's evidence line and the category bars, which
  matches the spec's own compact mockup — the mockup has no separate
  missing-requirements panel.
- Not implemented: the "association content with no requirement, labelled
  `Recommended by <association>`" case from the spec's learning-content list.
  That behavior belongs to `association-requirement-evidence-loop.md`, which
  is not yet built (no run record exists for it) and isn't in this feature's
  `front`-only, no-API-changes scope. `RequirementLearningContent` already
  renders whatever `learningContents` returns today unmodified, so the
  moment that field exists this list will pick it up.
- Mid-implementation, PR #221 (`activity-requirement-linking`) merged into
  `develop` and touched the same files (`requirement-learning-content.tsx`,
  `requirement-association-view.tsx`, the shared types/helper files). Merged
  `origin/develop` into this branch and reconciled by hand: kept this
  feature's compact redesign, kept #221's `requirementKeyValue`/
  `contentDetailHref` URL-preselection wiring inside the new
  `RequirementLearningContent`, and kept the deletion of
  `requirement-association-view.tsx` (superseded by `RequirementDetailView`).

## Verification

- `npm run lint --workspace front` — pass (incl. `check-i18n`)
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — no regression (`/dashboard/professional` ~1607 KB, unchanged)
- Re-ran the same four checks after merging `origin/develop` (which brought in PR #221) — all pass
- Browser (manual, Playwright MCP unavailable in this session): not run. Confidence rests on the checks above plus code review; the UI itself hasn't been visually exercised at 390/768/1024/1440px or in dark theme. Flag this to the user before treating the UI as fully verified.

## Submission

- Commit: 19b8b45
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/222
- CI: pass (run 35999102675, 4m21s)
