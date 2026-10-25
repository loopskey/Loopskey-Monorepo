# Active-only member pickers and requirement progress resync

- Scope: `front`
- Model: `Standard development — bounded frontend change in established patterns (a query filter and a cache refetch); no contract, auth or data change.`
- Branch: `feature/active-members-and-progress-sync`
- Base: `1a3453950017bd08011ce2d7c24a4986a9b2e8b3`
- Status: `Ready`

## Acceptance

- [x] The Specific members pickers in the learning content assign wizard, the add-members dialog and the Members tab assign dialog list only Active members, filtered by the API, not Pending activation or Inactive.
- [x] After a professional creates, edits or deletes a PDU activity, or uploads or removes evidence, the requirement progress is refetched again after the server's background recompute, so the bar shows the new total without a manual refresh.

## Verification

- Front `tsc --noEmit` and `eslint` on touched files — pass
- `check-i18n` — pass
- Prettier on touched regions — pass (files keep their existing CRLF working copy)
- `DEPLOYMENT_ENV=development npm run build --workspace front` — pass
- `bundle-report --check-targets --check-ceilings` — pass, all 23 public routes
- Not done: browser check against a running API (no local database); no frontend tests by repository rule.

## Submission

- Commit:
- PR:
- CI:
