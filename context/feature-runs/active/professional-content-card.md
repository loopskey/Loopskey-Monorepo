# professional-content-card

- Scope: `front`
- Model: `High reasoning — production caching root cause plus a shared card used on public and dashboard surfaces`
- Branch: `feature/professional-content-card`
- Base: `97af4272`
- Status: `Submitted`

## Acceptance

- [x] Root cause of stale covers found: `/category-art-*.svg` kept its URL while the content changed, and `next.config.ts` serves public SVGs with `max-age=86400, stale-while-revalidate=604800`, so browsers kept old covers for up to eight days.
- [x] The 31 covers live in `src/assets/category-art/` and are statically imported, so each is served from a content-hashed `/_next/static/media/` URL.
- [x] The approved card replaces the old one everywhere `ContentCard`/`ContentCardView` render: catalog, landing hub, topic hubs, provider profiles, wishlist and dashboard recommendations.
- [x] The card shows kind on the cover, the event date badge, category with level bars, byline, rating with count and a light footer link; no price is shown anywhere, including the wishlist.
- [x] Card and landing skeletons match the new anatomy; card height at 280 px dropped from 421 to 362.

## Verification

- `npx tsc --noEmit`, `eslint` on changed files, `npm run check-i18n`, i18n public slice — pass
- `npx vitest run` — pass (19 tests)
- `next build` + `bundle-report --check-targets --check-ceilings` — pass (`/contact` 199.4 KiB)
- `next start`: hashed SVG served with matching content; old public URL returns 404
- Browser against a local GraphQL stub: catalog courses, events, podcasts and YouTube at 1440 and 390 px, landing hub at 360 and 1536 px; no horizontal page scroll, no overflowing text, no price, no remote images

## Submission

- Commit: 66c75228
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/337
- CI: pending
