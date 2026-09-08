# Role overviews

- Scope: `front`
- Branch: `feature/role-overviews`
- Base: `fae0433`
- Status: `Submitted`

Phase 4 of `context/features/course-visual-restoration/04-role-overviews.md`.

## Acceptance

- [x] All five overviews render on a pure white canvas with simple bordered
      cards.
- [x] No glass, backdrop blur, translucent surface or oversized radius remains
      in any overview subtree.
- [x] The primary call to action is the solid blue button; gradient variants are
      gone from the overviews.
- [x] Chart status colour comes from the data's key, never an array index.
- [x] Chart tooltips, bar radii and area fills follow the shared contract.
- [x] No raw hex or raw Tailwind colour remains in overview code.
- [x] Data, links, refetch, mutation and empty/error behaviour are unchanged.
- [x] No horizontal overflow at 375 or 1440.

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — pass

Browser verification against the running stack, all five overviews at 375 and
1440, measured from the live DOM inside `main`:

| role | blur | translucent | radius over 16px | horizontal overflow |
| --- | ---: | ---: | ---: | --- |
| Professional | 0 | 0 | 0 | none |
| Provider | 0 | 0 | 0 | none |
| Organization | 0 | 0 | 0 | none |
| Admin | 0 | 0 | 0 | none |
| Association | 0 | 0 | 0 | none |

`main` is pure white in all ten combinations.

Raw hex across `apps/front/src`, excluding the token file and the dev showcase
labels: **0**. Three constants in `professional-overview.helper.ts` were the
last holdouts and were not visible to the earlier TSX-only audit because they
live in a `.ts` file.

## Notes

Three charts were still choosing status colour by array position, which the
plan forbids because re-sorting a series silently changes what a colour means:

- Organization compliance distribution now maps `compliant`, `atRisk` and
  `nonCompliant` to the success, warning and danger tokens by key.
- Admin request status distribution now maps `pending`, `approved` and
  `rejected` the same way; the data gained a stable `key` field to map on.
- Admin request trend was drawn with `currentColor`, so it inherited whatever
  text colour surrounded it. It now uses the primary series colour explicitly.

The Professional donut builders are pure functions and cannot call a hook, so
they take a `DonutColors` argument instead of importing colour constants. The
Provider registrations area lost its two-stop gradient for a flat fill at 10%
opacity.

Scope decisions:

- `DashboardContentSkeleton` was cleaned as well. It is shared layout rather
  than overview code, but it renders on every dashboard load and was still
  painting glass panels behind the white overviews.
- Four Provider overview parts and the shared `DashboardStatCard` needed the
  same treatment; they sit in `parts/` but only the overviews consume them here.
- `variant="brand"` was removed from eight overview call sites. The variant and
  its gradient CSS stay in place for the tabs that phases 5 and 6 still own.
- Categorical fills that index into the palette are unchanged and allowed: event
  types, departments and PDU categories carry no status meaning.
- Feature-local overrides outside the overview subtrees are untouched and remain
  phase 5 work.

## Submission

- Commit: `7641561`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/77
- CI:
