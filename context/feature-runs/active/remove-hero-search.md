# remove-hero-search

- Scope: `front`
- Model: `Standard development — removing a UI block and the code that only it used, inside established patterns`
- Branch: `feature/remove-hero-search`
- Base: `9fcdb076`
- Status: `Submitted`

## Acceptance

- [x] The landing hero no longer has a search box, category explorer, selected-category bar or inline results, since search now lives in the header.
- [x] Code used only by that block is gone: `useLandingHero`, the four `Hero*` parts, the `landing.api` RTK endpoint and its tag, hero-only types and constants.
- [x] The leftover `landing.hero.sampleCard` keys from the previous cleanup and the hero search keys are removed from English and French.
- [x] Header search still uses `landingCatalogSearch` through `lib/search/catalog-search.ts`, unchanged.
- [x] Hero stays balanced at 360 px and 1440 px.

## Verification

- `npx tsc --noEmit`, `eslint src`, `npm run check-i18n`, `npm run i18n-slice`, `npx vitest run` (19 tests) — pass
- `next build` — pass. Local `bundle-report` reads `/contact` at 200.4 KiB with and without the change (CI passed at the same code before), homepage 210.9 KiB against 300; CI is the authoritative budget gate
- Browser check of the landing hero at 1440 px and 360 px — pass

## Submission

- Commit: 2363b448
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/343
- CI: pending
