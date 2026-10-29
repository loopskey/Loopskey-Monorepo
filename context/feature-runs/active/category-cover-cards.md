# category-cover-cards

- Scope: `front`
- Model: `Standard development — a bounded frontend redesign of one shared card and its thumbnail inside established element and Tailwind patterns, with no contract, routing or data change.`
- Branch: `feature/category-cover-cards`
- Base: `d461a99c`
- Status: `Submitted`

## Acceptance

- [x] All 30 category covers and the General fallback use the white LoopsKey design (grid, rings, navy tile with icon, orange badge, full-colour logo) with no category text.
- [x] `ContentCard` shows the cover in a full 16:9 frame above the card text, so the whole cover is visible at every width; the 3:4 frame and 440 px minimum height are gone and rows stay even.
- [x] Every placement that renders a cover uses the new art: catalog, topic hubs, provider profiles, overview recommendations, wishlist, detail sidebars, organization event cards, learning shelf, hero mini card and roadmap art.
- [x] Content without a known category shows the General cover; the per-kind and wishlist artwork is removed together with the props that selected it.
- [x] Wishlist and recommendation cards pass the category key, so they show their own category cover.
- [x] The landing "Suggested for you" shelf (stage, spine, tabs, autoplay hook, constants, keyframes, dictionary keys, types) is removed.
- [x] The landing learning hub has two rows, "Recommended for you" and "Most popular", of four shared cards each, with a "View all" link per row; below 1280 px each row scrolls horizontally with snap, from 1280 px it is a four column grid.
- [x] Each row has its own loading skeleton and error retry; with no content at all one empty state shows.

## Verification

- `npx tsc --noEmit` (apps/front) — pass
- `npm run lint` (apps/front: eslint, i18n placeholders, public i18n slices) — pass
- `npm run build` (apps/front, development environment values) — pass
- `npm run bundle-report -- --check-targets --check-ceilings` (apps/front) — pass, all 23 budgeted routes within target and ceiling
- `web-design-guidelines` review of `content-card-view.tsx` and `content-thumbnail.tsx` — no findings
- Browser check of the card grid on a temporary preview route (removed afterwards) at 360, 390, 768, 1024, 1280 and 1536 px: 1, 2, 3 and 4 columns, cover ratio 1.778 at every width, no overflowing card, equal heights within a row; a card with a photo, with no category, with an unknown category and without a link rendered correctly; the other thumbnail sizes (64 px square, shelf strips and panel, detail sidebar, organization event card) rendered with the tile centred
- Landing hub, browser check against a local GraphQL stub (production build) at 390, 768, 1024, 1280 and 1440 px: two rows of four cards, cover ratio 1.778, horizontal scroll with no page-level overflow below 1280 px, four column grid from 1280 px, loading, error (per-row retry) and empty states rendered; no "Suggested" text left
- `npm run bundle-report -- --check-targets --check-ceilings` after the hub change — home 216.4 KiB gzip, within target (300) and ceiling (237)
- Browser check of the live pages against a running API — not run, no API or database in this session

## Submission

- Commit: `94eb0863`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/332
- CI: pending
