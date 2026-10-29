# remove-requirement-credit-categories

- Scope: `front`
- Model: `Standard development — bounded UI removal; the GraphQL contract was inspected and deliberately left unchanged`
- Branch: `feature/remove-requirement-credit-categories`
- Base: `4adb245d`
- Status: `Submitted`

## Acceptance

- [x] The "Credit categories" card is gone from the professional dashboard Requirements tab (association and plan requirements).
- [x] Its component, props, types, helpers and i18n keys (en, fr) are removed.
- [x] The learning-content card fills the freed row and its loading skeleton matches.
- [x] `categories` stays in the GraphQL contract: Mark-as-completed (allowed categories) and attribution depend on it.

## Verification

- `npx tsc --noEmit` (apps/front) — pass
- `eslint` on changed files, `npm run check-i18n`, i18n public slice check — pass
- `npx vitest run` (apps/front) — pass (19 tests)

## Submission

- Commit: fc0a49ec
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/333
- CI: pending
