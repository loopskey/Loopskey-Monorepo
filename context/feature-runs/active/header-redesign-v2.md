# header-redesign-v2

- Scope: `front`
- Model: `Standard development — restyling shared header controls inside established patterns; the public JavaScript budgets are checked rather than assumed`
- Branch: `feature/header-redesign-v2`
- Base: `78f971a9`
- Status: `Submitted`

## Acceptance

- [x] The header search is a wide, bold field (46 px, primary-tinted border, primary icon, filled submit button, `/` hint) from the lg breakpoint, up to 520 px, in the public and dashboard headers; its result panel is as wide as the field.
- [x] About and Contact leave the header bar (the footer has them); the mobile drawer still lists all five.
- [x] On narrow screens the public header keeps a full-width search row under the top bar; the dashboard keeps its toggle, with the row laid over the page.
- [x] The account button is the avatar alone with a soft ring and a chevron badge; hover strengthens the ring, keyboard focus gets an offset ring, and open fills the ring and turns the chevron up. The three dots are gone.
- [x] Submitting from the field's button behaves like Enter; a term under two characters just focuses the field.

## Verification

- `npx tsc --noEmit`, `eslint src`, `npm run check-i18n`, i18n public slice, `npx vitest run` (19 tests) — pass
- `next build` + `bundle-report --check-targets --check-ceilings` — pass (`/contact` 199.4 KiB, homepage 209.9 KiB)
- Browser against a local GraphQL stub, signed in and as a guest: landing and FAQ at 1440 and 1100 px, search with typed text, account menu open, dashboard at 1440 and 320 px, public mobile at 390 px — pass

## Submission

- Commit: f9ef4f6f
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/348
- CI: pending
