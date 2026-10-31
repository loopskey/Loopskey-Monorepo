# header-search-dashboard-language

- Scope: `front`
- Model: `Standard development — reshaping shared header controls inside established patterns; the public JavaScript budgets are checked rather than assumed`
- Branch: `feature/header-search-dashboard-language`
- Base: `5cfd3bf6`
- Status: `Submitted`

## Acceptance

- [x] The header search field (same component, panel, `/` shortcut and mobile row) also appears in the dashboard header, from a shared control used by the public and dashboard headers.
- [x] A navbar link shows an underline that grows from the middle on hover and focus, and stays full for the active page.
- [x] Content detail pages no longer carry their own language switcher; the page reports which languages it is published in and the header menu greys out the others.
- [x] One language control everywhere: the globe icon with the language code, a checked menu, in the public header, the dashboard header, the focused top bar and the app chrome.

## Verification

Re-run after the author's refactor (types moved into `layouts.types`): `tsc`, `eslint`, `check-i18n`, `vitest`, `next build` and the bundle check all pass.

- `npx tsc --noEmit`, `eslint src`, `npm run check-i18n`, i18n public slice, `npx vitest run` (19 tests) — pass
- `next build` + `bundle-report --check-targets --check-ceilings` — pass (`/contact` 199.1 KiB, homepage 209.7 KiB)
- Browser against a local GraphQL stub, signed in: course detail (French greyed out, in-page switcher gone), dashboard header at 1440 px and 320 px (search, language menu, account menu, mobile search row), navbar hover underline — pass

## Submission

- Commit: 07511b47
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/346
- CI: pending
