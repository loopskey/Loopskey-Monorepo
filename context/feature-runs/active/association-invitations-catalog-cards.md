# Association invitations, library search and content cards

- Scope: API and frontend; approved by the user on 2026-10-14.
- Model tier: High reasoning, because this change crosses activation, asynchronous mail delivery, indexed database search and generated GraphQL contracts.
- Branch: `feature/association-invitations-catalog-cards`
- Base: `74e1997af3b2cf9a6d84a80e4bc60bb3f0e9ef6b` (`origin/develop`).
- Status: Submitted.
- Existing dashboard, table and translation changes are retained in the working tree.

## Acceptance

- Invitation feedback distinguishes queued mail from provider acceptance and failed delivery; pending members can request another invitation under existing limits.
- Invitation delivery keeps transactional outbox, ownership, single-use tokens and idempotency intact.
- Association library search supports relevant matches and backend cursor pagination across all assignable content kinds.
- Search changes use indexed predicates and expose total count, loading, error, empty and restart states.
- The shared content card has a visible call to action on touch devices and keyboard feedback.
- Generated GraphQL artifacts, translations, relevant backend tests and frontend verification stay synchronized.

## Verification

- Before implementation: 118 tests passed across five invitation and catalogue unit suites.
- Initial local database read failed with `ECONNREFUSED`; production delivery evidence is not available.
- Front: `npm run lint`, `tsc --noEmit` and `DEPLOYMENT_ENV=development npm run build` pass.
- API: `tsc` and unit suites for mail, lifecycle handler and catalogue search pass.
- Not run: `test:e2e` (no local test database, Docker off) and `bundle-report`; CI is the gate.
- Browser: data tables, charts and content card checked at 1440 and 390 widths with mocked data.

## Submission

- Commit: ec312a1
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/307
- CI: pending
