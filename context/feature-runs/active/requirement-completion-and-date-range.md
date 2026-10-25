# Requirement completion flow, date ranges and uploads

- Scope: `full`
- Model: `High reasoning — changes how association credits are attributed, a GraphQL contract, and every authenticated upload path`
- Branch: `feature/requirement-completion-and-date-range`
- Base: `15b40c5ca155696ff05e7c14452170da6426d593`
- Status: `Ready`

## Acceptance

- [x] Rules › Credit categories no longer shows the Total required / Category minimum / Flexible credit summary; the overflow validation stays.
- [x] Every start/end date pair in the app prevents choosing an end before the start (and a start after the end), and its schema rejects an inverted range.
- [x] Mark as complete, opened for association content, shows the requirement and its accepted date window, locks the credit type, the association-set credits, the provider and the category, and only accepts a completion date inside the window and not after today.
- [x] A completion linked to association content earns the credits and category the association set, regardless of the value typed.
- [x] The requirement view explains activities that did not count (outside the window, wrong credit type, missing evidence) and shows an error state instead of an empty one when its detail fails to load.
- [x] Every authenticated REST upload/download refreshes an expired session once and reports a specific failure; a failed evidence upload after a saved completion can be retried without re-saving.
- [x] English and French copy for every new string; API changes covered by Jest.

## Verification

- `npx jest src/modules/association` (api, rerun after refactor) — pass, 32 suites / 497 tests; full run earlier: 175 suites / 2,531 tests
- API `tsc --noEmit` and `eslint src` — pass
- Front `tsc --noEmit` and `eslint src` — pass
- `check-i18n` and public i18n slice check — pass; slices regenerated
- GraphQL schema regenerated from the built API; front codegen clean
- `npm run build --workspace front` — pass
- `bundle-report --check-targets --check-ceilings` — pass, all 23 public routes
- `/security-review` — no findings
- Not done: browser check of the association → professional flow and uploads against a running API. The local database is a Docker container and Docker is not running. API E2E (`test:e2e`) also needs it; CI runs it.
- Not verifiable here: production proxy body-size limit and upload volume ownership; documented in README as operator checks.

## Submission

- Commit:
- PR:
- CI:
