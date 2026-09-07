# Course visual audit and scope

- Scope: `front`
- Branch: `feature/course-visual-audit-and-scope`
- Base: `6984893` (`origin/develop`)
- Status: `Submitted`

## Acceptance

- [x] Capture a visual baseline for all five dashboard roles at `375x812` and `1440x900` across the required representative tabs and states.
- [x] Reconcile every role and tab with `dashboard-nav.config.ts` and record the protected behavior scope.
- [x] Inventory shared dashboard component consumers, raw feature/chart colors, and all direct Recharts consumers and data builders that emit `fill`.
- [x] Record the route, role, and state impact matrix for central components and confirm that no active dark theme is in scope.
- [x] Confirm the white product canvas and surface decision in global tokens.
- [x] Confirm the categorical and semantic chart-color contract.
- [x] Record the responsive navigation decision: icon-only vertical rail below `md`, labeled sidebar from `md`, and no bottom navigation.
- [x] Pass the frontend documentation/asset verification appropriate to this audit-only phase.

## Verification

This phase is documentation and assets only; it changes no application source, so
the lint/type-check/build gate does not apply. Verification was performed against
the repository instead:

- Baseline captured: 40 screenshots under
  `context/features/course-visual-restoration/baseline/course1/`, covering all
  five roles across 20 representative pages at `375` and `1440`.
- Audit numbers verified against `apps/front/src`: 467 TSX files, 166 `GlassCard`
  consumers, 120 files carrying glass/large-radius appearance, 18 direct Recharts
  consumers, 13 raw hex values, 77 raw Tailwind color classes, 13 `--brand-teal`
  consumers, and no active dark theme (`globals.css` has no `.dark`,
  `data-theme`, or `prefers-color-scheme` selector).
- `utils/constant.ts` confirmed as a second colour source via its eight-hex
  `CHART_COLORS`; queued for phase 3.
- `galaxy-background.tsx` confirmed to have zero consumers; queued for phase 6
  cleanup.
- All internal document links resolve.

Scope decisions recorded during the audit:

- Loading, empty, and error captures were deliberately excluded from the
  baseline. Those states are verified by preserving the existing code branches
  during migration, which is cheaper and more reliable than reproducing them in a
  browser. Recorded in `rules.md`.
- No screenshots were taken of the legacy `Course` project. Its visual
  specification is recorded numerically in the phase documents instead, so the
  old codebase does not need to be reopened during implementation.

## Submission

- Commit: `96970f0`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/72
- CI:
