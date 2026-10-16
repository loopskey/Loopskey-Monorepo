# Shared stat cards

- Scope: frontend and one GraphQL document; approved by the user on 2026-10-16 after reviewing the artifact design.
- Model tier: Standard reasoning, because the change is a presentational component migrated across existing tabs with no new backend behaviour.
- Branch: `feature/shared-stat-cards`
- Base: `b42d162` (`origin/develop`).
- Status: Ready.

## Acceptance

- One reusable stat card, grid, skeleton, split bar and error panel live in `components/elements/stat-card`.
- The Association overview shows Members, Requirements and Learning content with a split bar, status chip, guided empty card, touch feedback and error and loading states on desktop and mobile.
- Every headline card in the Professional, Association, Admin and Provider dashboards uses the shared component; the two old card components and their types are deleted.
- `AssociationOverviewCounts` returns published and draft totals through existing status filters; no API change.
- English and French strings are in sync, and unused overview card strings are removed.

## Verification

- `npx tsc --noEmit`, `npm run lint` (includes i18n placeholder and public slice checks) and `DEPLOYMENT_ENV=development npm run build` pass.
- `npm run bundle-report` runs; the public routes were already over target before this change.
- Browser: Association overview checked at 1440 and 390 widths in new, active, drafts-only, loading and error states with mocked data; Admin overview, Admin users and Association requirements and reports checked at both widths. No horizontal overflow.
- Not run: front unit tests (the front workspace has none by rule) and API checks (no API change).

## Submission

- Commit:
- PR:
- CI:
