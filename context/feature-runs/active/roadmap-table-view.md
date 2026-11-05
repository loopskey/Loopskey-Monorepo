# Roadmap table view

- Scope: `front`
- Model: `Standard development — a frontend rework of the roadmap tab on existing data and endpoints`
- Branch: `feature/roadmap-table-view`
- Base: `5b299bf9`
- Status: `Submitted`

## Acceptance

- [x] The roadmap tab is one table of every roadmap (search, status filters with counts, sort), with a Continue / Start / Review button and an actions menu (Edit, Unenroll) on each row
- [x] Opening a row (arrow or name) shows that roadmap's details inside the table: description and Edit roadmap, the "Up next" card, the learning path, a progress card and recommended content; one row is open at a time
- [x] Continue opens the row and moves focus to its "Up next" card; the open roadmap is kept in `?roadmapId=` without dropping other parameters
- [x] The roadmap switcher, the separate all-roadmaps view (`view=all`) and the side cards are removed; catalog roadmaps sit below the table
- [x] Phone: rows become cards with progress, next step and a full-width Continue
- [x] Orphaned translation keys removed

## Verification

- `npx tsc --noEmit` — pass
- `npm run lint` (eslint, i18n checks, public slice) — pass
- `next build` + `bundle-report --check-targets --check-ceilings` — pass
- Headless Chrome against a local GraphQL stub with 10 roadmaps: desktop 1440 (default open row, Continue on another roadmap opens it and focuses Up next, collapse), phone 390 — no sideways scroll

## Submission

- Commit: `d702bfde`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/354
- CI: pending
