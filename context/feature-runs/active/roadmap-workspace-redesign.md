# Roadmap workspace redesign

- Scope: `full`
- Model: `High reasoning — a GraphQL contract change (recommendation slug) alongside a full rework of the roadmap tab`
- Branch: `feature/roadmap-workspace-redesign`
- Base: `2248f8c1`
- Status: `Submitted`

## Acceptance

- [x] The roadmap name is a switcher (popover on desktop, bottom sheet on phones) with search, status filters with counts, status groups, the roadmap being generated, Manage all and New roadmap — so ten roadmaps no longer push the workspace down
- [x] One progress strip (percent, steps, phase, per-phase segments, this week, phases done, streak, CPD credits, target date or duration) replaces the side summary
- [x] One "Up next" card holds the main action; the duplicate Continue button is gone
- [x] Learning path: phase cards, All / Remaining toggle, Expand all, inline Start / Mark complete on the next and in-progress steps, open icon, details menu
- [x] Recommended content links to its page (`contentSlug` added to `RoadmapRecommendation`), shown three at a time with See all
- [x] Edit roadmap as a button and side card; Unenroll in the roadmap menu
- [x] All roadmaps view (`view=all`): search, status filters, sort, table on desktop and cards on phones, Continue / Start / Review, Edit and Unenroll per row, paging past 50; catalog roadmaps below with search and an "Enrolling opens soon" label
- [x] The cropped category image is replaced with a tinted roadmap tile
- [x] Loading, empty, error and success states; keyboard open/close of the switcher

## Verification

- `npx jest src/modules/professional` (api) — pass, 40 suites / 1001 tests, including the new recommendation slug test
- `npx eslint` + `npx nest build` (api) — pass
- `npm run codegen --workspace front` — regenerated; schema.gql updated
- `npx tsc --noEmit`, `npm run lint` (front, i18n checks, public slice) — pass
- `next build` + `bundle-report --check-targets --check-ceilings` — pass; homepage 210.1 KiB, `/contact` 199.4 KiB
- Playwright against a local GraphQL stub with 10 roadmaps: workspace, switcher search and switching, inline Start, All roadmaps, mobile 390 (sheet, rows), empty, error, loading, keyboard — no overflow

## Submission

- Commit: `83cb2733`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/352
- CI: pending
