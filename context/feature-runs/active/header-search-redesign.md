# header-search-redesign

- Scope: `front`
- Model: `Standard development — a bounded redesign of the shared public header inside established patterns; the public JavaScript budgets are checked rather than assumed`
- Branch: `feature/header-search-redesign`
- Base: `0b5098c4`
- Status: `Submitted`

## Acceptance

- [x] Role bar redesigned: quiet underlined audience tabs with a one-line tagline for guests; for a signed-in user a "workspace" pill and a dashboard link replace the three disabled tabs.
- [x] Search lives in the header: same `landingCatalogSearch` query as the landing hero, grouped results with kind and meta, browse-by-type chips, per-viewer recent searches (localStorage, try/catch), keyboard support (`/`, arrows, Enter, Escape), a full-width row below `xl`.
- [x] Language is an icon button (EN/FR badge) with a checked dropdown; the account menu is only the avatar plus a vertical-dots affordance, with name, email and role inside the dropdown.
- [x] The main nav drops the filled active pill for a primary-colour underline; mobile keeps the drawer, which no longer repeats the account block.
- [x] The search field, panel and request code, and the mobile drawer, are lazy-loaded (a same-size button stands in for the field; the drawer mounts on first open or on hover/focus of its toggle), so no public route goes over its JavaScript target or ceiling (`/contact` 199.3 KiB against 200).
- [x] Layout prop types live in `src/types/layouts.types.ts` with type-only imports, as the repo rules ask.
- [x] No horizontal overflow from 320 px to 1440 px, signed in and as a guest.

## Verification

- `npx tsc --noEmit`, `eslint src`, `npm run check-i18n`, i18n public slice — pass
- `npx vitest run` — pass (19 tests)
- `next build` + `bundle-report --check-targets --check-ceilings` — pass (`/contact` 199.3 KiB). Two earlier versions failed it and were reworked instead of relaxing a number: eager search (`/contact` 203.1 KiB), then the type refactor reshuffled the shared chunks (201.3 KiB), which the lazy drawer fixed
- After the types refactor: fixed a missing `TPublicUserMenuProps` import in `public-user-menu.tsx` (the build failed on it)
- Browser against a local GraphQL stub (guest and signed in): search click and `/` activation, results, arrow keys, Enter to `/content?q=`, recent searches, language and account menus, French page, mobile search row and drawer at 320, 360, 390, 1024, 1100, 1280 and 1440 px

## Submission

- Commit: c0140c16
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/339
- CI: pending
