# content-card-redesign

- Scope: `front`
- Model: `Standard development — a bounded frontend redesign of one shared card inside established element and Tailwind patterns, with no contract, routing or data change.`
- Branch: `feature/content-card-redesign`
- Base: `883a3324fbd338ec1f18a5f4b41c04860fee73c5`
- Status: `Submitted`

## Acceptance

- [x] `ContentCard` in `components/elements` is image-first with a full-bleed image, a black gradient and progressive blur behind the text, no border, full-opacity text, the category at the top, a full-width call to action and 50% wider side spacing.
- [x] The call to action is always "View details"; the enroll action and the card `action` prop are gone.
- [x] The content catalog, topic hubs, provider profiles, the professional overview recommendations and the wishlist all render the shared card.
- [x] Content without an image renders one artwork per content kind (course, event, podcast, youtube) with no title text, replacing the fifteen per-category motifs.
- [x] Props and i18n keys left without a consumer are removed from both languages.

## Verification

- `npx tsc --noEmit` (apps/front) — pass
- `npm run lint` (apps/front: eslint, i18n placeholders, public i18n slices) — pass
- `npm run build` (apps/front, development environment values) — pass
- `npm run bundle-report` (apps/front) — pass, all 23 budgeted routes within their recorded ceiling
- Browser check of the card on a temporary preview route at desktop and 390px width — pass, run before the final refactor
- Browser check of the live content page and dashboard tabs against a running API — not run, no API or database in this workspace

## Submission

- Commit: `0da8c94`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/296
- CI: pending
