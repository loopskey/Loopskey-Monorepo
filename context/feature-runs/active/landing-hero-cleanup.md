# landing-hero-cleanup

- Scope: `front`
- Model: `Standard development — removing UI elements and recolouring a heading inside established patterns`
- Branch: `feature/landing-hero-cleanup`
- Base: `0970e396`
- Status: `Submitted`

## Acceptance

- [x] The "For" label before the audience tabs in the public role bar is gone.
- [x] The sample credits card over the landing hero illustration is gone, with its constant and i18n keys.
- [x] The hero title is three rows coloured with the brand tokens (sky, navy, orange) instead of hex values.
- [x] The "Core features are free for individual professionals" note under the hero actions is gone.
- [x] English and French copy updated; no layout overflow at 360 px or 1440 px.

## Verification

- `npx tsc --noEmit`, `eslint` (Landing, layouts, utils), `npm run check-i18n`, `npm run i18n-slice` — pass
- Browser check of the landing hero at 1440 px and 360 px — pass
- `next build` — pass. `bundle-report` locally reads `/contact` at 200.4 KiB both with this change and on a clean develop checkout (199.3 KiB when #339 was recorded), so the change is bundle-neutral; CI is the authoritative budget gate

## Submission

- Commit: 7d830ad3
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/341
- CI: pending
