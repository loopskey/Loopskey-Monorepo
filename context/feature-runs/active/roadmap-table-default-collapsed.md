# Roadmap table default collapsed

- Scope: `front`
- Model: `Standard development — a bounded interaction-state change in the existing professional roadmap table`
- Branch: `feature/roadmap-table-default-collapsed`
- Base: `48b04f6c`
- Status: `Submitted`

## Acceptance

- [x] The professional roadmap table opens with every roadmap row collapsed when no `roadmapId` is present in the URL.
- [x] Clicking a roadmap row or its arrow toggles that row's details while keeping one row open at a time.
- [x] Start, Continue and Review open the selected roadmap and retain the existing focus movement to its next-step card.
- [x] Action buttons and the actions menu remain independent from the row toggle.
- [x] A valid `roadmapId` deep link still opens the requested roadmap.

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run bundle-report --workspace front -- --check-targets --check-ceilings` — pass; all 23 budgeted public routes remain within target and ceiling
- `NEXT_PUBLIC_SITE_URL=https://loopskey.com npm run build --workspace front` — pass
- Web Interface Guidelines review of the changed row interaction — pass; semantic row button, keyboard focus, independent nested actions, and URL-backed expansion retained

## Submission

- Commit: `c1fc5e6e`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/359
- CI: pending
