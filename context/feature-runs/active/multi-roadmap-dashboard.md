# multi-roadmap-dashboard

- Scope: `full`
- Model: `High reasoning — removes a deliberate backend rule (generating a roadmap unenrolled every earlier generated roadmap) and changes what the list query returns; implemented in a Sonnet session, so an independent high-reasoning review of the backend change is still owed.`
- Branch: `feature/multi-roadmap-dashboard`
- Base: `9b05f4230d9bcedf443eade7f8b791997f5a9362`
- Status: `Submitted`

## Acceptance

- [x] A professional can generate more than one roadmap and every one stays enrolled; generating no longer sets earlier generated enrollments to `UNENROLLED`.
- [x] The roadmap list returns each roadmap's own CPD credit target (it was always `null`).
- [x] The Roadmap tab shows every roadmap as a card (progress ring, phase track, next phase, steps, weeks, target date with overdue state, CPD credits, close-match note) with continue, start or view actions.
- [x] The selected roadmap is highlighted and its workspace (hero, timeline, phases, recommendations) opens below the cards.
- [x] Unenrolling asks for confirmation.
- [x] The generation status card no longer replaces the roadmaps while a new roadmap is being generated.
- [x] New copy exists in English and French.
- [x] Roadmaps without an image show artwork for their category (twelve banners with a path motif and a category glyph) instead of a flat gradient.
- [x] Wishlist cards without an image show wishlist artwork per content kind (a saved card with a bookmark and heart) instead of the default content artwork.
- [x] `TabsList` no longer paints a default muted background (separate commit; its only consumer is the dev showcase page).

## Verification

- `npx jest src/modules/professional src/modules/content-interaction src/architecture` (apps/api) — pass, 40 suites, 784 tests
- `npx tsc --noEmit` (apps/api) — pass
- `npx eslint src/modules/professional src/modules/content-interaction` (apps/api) — pass
- `npx tsc --noEmit` (apps/front) — pass
- `npm run lint` (apps/front) — pass
- `npm run build` (apps/front, development environment values) — pass
- `npm run bundle-report` (apps/front) — pass, budgeted public routes unchanged
- All of the above, including `bundle-report`, rerun after the final refactor; a refactor had deleted the `createPrismaMock` declaration in the engagement spec, which was restored — pass
- Category and wishlist artwork: contact-sheet check of all sixteen SVGs in a browser, and the build output contains every new art class — pass; the cards themselves were not re-viewed with the new artwork
- Browser check of the real `RoadmapCard` on a temporary preview route (six states, selected state, unenroll dialog) — pass
- Browser check of the live Roadmap tab, generation of a second roadmap, and pagination against a running API — not run, no API or database in this workspace
- `npm run test:e2e --workspace api` — not run, no isolated PostgreSQL test database in this workspace

## Submission

- Commit: `15cc638`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/300
- CI: pending
