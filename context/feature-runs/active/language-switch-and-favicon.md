# Language switch and favicon colour

- Scope: `front`
- Model: `Standard development — a bounded header control and static icon assets in an established pattern, no data or auth impact`
- Branch: `feature/language-switch-and-favicon`
- Base: `36227154`
- Status: `Submitted`

## Acceptance

- [x] The header language control is an EN | FR switch with no menu: the current language is filled with the primary colour, the other is one click away
- [x] Public routes link to the other language (`/fr`, `/en`, keeping the catalog query); app routes switch the interface language directly; a page that exists in one language shows the other segment disabled with a "Not available in this language" hint
- [x] Same control in the public header, dashboard bar and focused bar; fits at 320 px; keyboard focus ring; screen readers get a labelled group, the language name and the current language
- [x] Old icon-with-badge button, dropdown menu and their wrappers removed
- [x] Browser-tab icon (`icon.svg`) uses the global primary colour (`#1F1F8E`, from `--primary`), switching to the brand sky blue when the browser is in dark mode; `favicon.ico` fallback is the primary squirrel on a white rounded tile; the home-screen icon (`apple-icon.png`) is a white squirrel on a primary tile; the orange dot stays as the brand accent

## Verification

- `npx tsc --noEmit` — pass
- `npm run lint` (eslint, i18n checks, public slice) — pass
- `next build` + `bundle-report --check-targets --check-ceilings` — pass; homepage 209.2 KiB, `/contact` 198.5 KiB
- Headless Chrome: guest landing at 1440 / 390 / 320 (links to `/fr`), dashboard at 1440 / 390 / 320 against a local GraphQL stub (switching to FR flips the interface and the active segment), favicon assets rendered in light and dark browser modes — no sideways scroll

## Submission

- Commit: `e4f51200`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/357
- CI: pending
