# Association requirement completion prefill and validation feedback

- Scope: `front`
- Model: `Standard development — bounded frontend form and data-flow correction using existing API contracts.`
- Branch: `feature/association-completion-prefill`
- Base: `8ce8c3d56a803fce008b1e2584d441c85463dbe3`
- Status: `Ready`

## Acceptance

- [x] Association name, credit type, and linked content credits appear in the completion dialog.
- [x] Background query refreshes preserve entered values and selected evidence.
- [x] The dialog explains invalid fields and prevents completion before the association acceptance window opens.
- [x] Evidence upload remains retryable after the activity is saved.

## Verification

- Front type-check — pass
- Front lint and i18n — pass
- Front production build — pass
- Front bundle report target and ceiling checks — pass (23 public routes)
- `git diff --check` — pass
- Production browser baseline — reproduced empty provider/date and incorrect credit before this change; no activity was saved.
- Local browser with API — unavailable without a local API and database; CI verifies the submitted build.

## Submission

- Commit:
- PR:
- CI:
