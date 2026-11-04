# Landing header in the dashboard style

- Scope: `front`
- Model: `Standard development — a bounded header layout change in an established pattern, no data or auth impact`
- Branch: `feature/landing-header-dashboard-style`
- Base: `2248f8c1`
- Status: `Submitted`

## Acceptance

- [x] The public header has no Content / Services / FAQ links; it reads logo, search beside it, then language and account or join, like the dashboard bar
- [x] Below lg the guest menu holds only the role choice and the join button; signed-in users get no empty menu button
- [x] Content and Services stay reachable from the footer (Company column)
- [x] Unused nav type and i18n keys removed; public i18n slice regenerated

## Verification

- `npx tsc --noEmit` — pass
- `npm run lint` (eslint, check-i18n, i18n slice) — pass
- `npx vitest run` — pass (19)
- `next build` + `scripts/bundle-report.js` — pass; homepage 209.6 KiB, `/contact` 199.1 KiB, all within targets
- Headless Chrome against the local GraphQL stub at 1440/1100/390/320, guest, guest menu open, signed in — no overflow

## Submission

- Commit: `1c0cab7d`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/351
- CI: pending
