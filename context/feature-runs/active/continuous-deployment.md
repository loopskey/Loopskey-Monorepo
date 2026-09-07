# Continuous deployment

- Scope: `full`
- Branch: `feature/continuous-deployment`
- Base: `7dc93b7048aa3cb4a8737ef1e0fb6dc90bfb73a1`
- Status: `Submitted`

## Acceptance

- [x] A merge to `main` deploys the host without a manual step.
- [x] The image build fails when `NEXT_PUBLIC_GRAPHQL_URL` is unset instead of
      publishing a frontend built against an empty origin. Both previously
      published frontend images carried that empty value.
- [x] The deployment key can run nothing but the deployment: `ci-deploy.sh` is
      installed as a forced `command=` in `authorized_keys`.
- [x] `deploy.sh` chooses between pulling and building instead of failing on a
      host that has no published images.
- [x] `deploy.sh` refuses to run when the checkout is on a branch other than the
      one being deployed, rather than failing inside `git merge --ff-only`.
- [x] Deployments serialise: two merges in quick succession run in order.
- [x] Host-specific settings live in `/etc/loopskey/deploy.env`, not in the
      repository.

## Verification

- `bash -n scripts/deploy.sh scripts/ci-deploy.sh` — pass
- `docker compose -f compose.production.yaml --env-file <filled example> config` — pass
- The `authorized_keys` snippet in the README, executed — produces a valid
  forced-command line
- `npx prettier --check` on every touched file — pass
- `npx turbo run lint check-types` — 7/7 pass (no application code changed,
  so `--affected` selects nothing)

## Submission

- Commit: `a014238`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/66
- CI:
