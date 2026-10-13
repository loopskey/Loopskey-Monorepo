# header-language-menu

- Scope: `front`
- Model: `Standard development — a small presentational change to one shared element inside the existing dropdown pattern, with no contract, routing or data change.`
- Branch: `feature/header-language-menu`
- Base: `94f6eb5c60e264c7e052805e43a16fbe429ba322`
- Status: `Submitted`

## Acceptance

- [x] On public pages the header language switcher is a dropdown again, with English and French as menu items.
- [x] Menu items stay real links to the other language's URL, keeping `hrefLang`, the query string, and disabled states for the current and untranslated languages.
- [x] The inline language list on content detail headers is unchanged.
- [x] `TabsList` has the muted background by default and the content tabs nav no longer paints its own.

## Verification

- `npx tsc --noEmit` (apps/front) — pass
- `npm run lint` (apps/front, includes i18n checks) — pass
- `npx prettier --check` on the four changed files — pass
- `npm run build` (apps/front, development environment values) — pass
- `npm run bundle-report` (apps/front) — pass, budgeted public routes unchanged
- Browser check on `/`: the trigger opens a menu with English and French linking to `/` and `/fr`, and French navigates to `/fr` — pass
- Browser check of the menu on a route with query string, and of the content tabs and `TabsList` backgrounds after the user's edit — not run

## Submission

- Commit: `28b2506`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/302
- CI: pending
