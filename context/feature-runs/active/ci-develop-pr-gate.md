# Feature Run: CI Gate for Develop Pull Requests

## Metadata

- Spec: `context/fixes/ci-develop-pr-gate.md`
- Owner: Hasan Moosavi
- Branch: `fix/ci-develop-pr-gate`
- Base branch: `develop`
- Base commit: `c7111a5ef3cf7b131b84f3fdb06d0afedc22705f`
- Created at: 2026-07-30T13:54:54Z
- Updated at: 2026-07-30T14:30:05Z

## Status

Completing

## Goals

- [x] Confirm the missing `develop` trigger is the cause of absent checks.
- [x] Add CI coverage for pull requests targeting `develop`.
- [x] Preserve CI coverage for pull requests targeting `main`.
- [x] Preserve all existing mandatory verification and generated-code gates.
- [ ] Prove the fix with local verification and an approved real Actions run.
- [x] Report GitHub-hosted follow-ups and a separate CD readiness decision.

## Non-Goals

- Continuing later modular-monolith or product features.
- Modifying PR #1 or its branch.
- Implementing unapproved deployment/CD infrastructure.
- Changing runtime behavior, dependencies, database schema, secrets, GitHub
  settings, or unrelated code.

## Acceptance Criteria

- [x] The missing-check root cause is confirmed with evidence.
- [x] Pull requests targeting `develop` match the CI trigger.
- [x] Pull requests targeting `main` remain covered.
- [x] Push-event policy is explicitly decided and documented.
- [x] Existing lint, check-types, test, build, and codegen drift gates remain.
- [x] `--affected` comparison behavior cannot silently false-green.
- [x] Workflow syntax and all mandatory local gates pass.
- [ ] An approved fix PR produces a real GitHub Actions run.
- [x] The diff remains within the approved file and behavior scope.
- [x] GitHub-hosted settings are reported separately.
- [x] CD readiness is reported without inventing infrastructure.

## Implementation Progress

- Added `develop` alongside `main` to both pull-request and push triggers.
- Added explicit `contents: read` permission; the workflow does not write
  repository state and consumes no secrets.
- Pinned Turborepo's affected comparison to event revisions:
  pull-request base/head SHAs for PRs and before/current SHAs for pushes.
- Preserved checkout history, Node/npm setup, caches, and every existing lint,
  type-check, test, build, and GraphQL codegen-drift step.

## Decisions and Assumptions

- Classified as a `fix` because normal `develop` pull requests currently miss a
  documented mandatory repository gate.
- The detailed prompt at
  `context/prompts/claude-ci-cd-audit-and-fix.md` is supporting guidance, while
  `context/fixes/ci-develop-pr-gate.md` is the canonical scope specification.
- Direct-push coverage for `develop` was resolved during the audit from the
  repository's required post-merge CI/build gate; see the evidence below.
- No deployment target is confirmed, so CD implementation is outside this run.
- `.claude/settings.local.json` is unrelated local state and must remain
  untouched and untracked by this run.
- PR #1 was confirmed through the connected GitHub app as open and mergeable,
  with base `develop` at `c7111a5` and head
  `chore/monolith-ph1-baseline-ownership@3673ed6`. The local `gh` token is
  invalid, so Actions check/log evidence remains unavailable until
  re-authentication.
- Project completion policy requires a post-merge CI/build gate. Therefore push
  coverage includes `develop` as well as `main`; the PR run is the pre-merge
  gate and the push run validates the integrated revision.
- Turborepo 2.5.4 documents `main...HEAD` as the default affected comparison and
  uses GitHub PR context when available. Pushes lack a PR base ref, so this
  workflow now supplies explicit event SHAs to avoid a no-work false green.
- The existing concurrency group is retained: PR refs isolate separate PRs,
  while repeated runs for the same PR or protected branch cancel obsolete work.
- Cache/action-version changes and timeouts were not added because the audit
  found no defect requiring them.
- GitHub-hosted follow-up: after the fix PR creates a stable check name, inspect
  the `develop` and `main` rulesets/branch protection and require
  `Lint, types, tests, build` as appropriate. No hosted setting is changed here.
- CD readiness: **not ready for implementation**. Deployment provider,
  staging/production environments, artifact promotion, Prisma migration
  execution, secrets, health checks, rollback, and approval policy remain
  unspecified and require a separate specification.

## Verification

| Timestamp | Revision | Command/behavior | Result |
| --------- | -------- | ---------------- | ------ |
| 2026-07-30T14:02:00Z | `c7111a5` + loaded run files | `npm.cmd run lint` baseline | Pass; 3 tasks, all cache hits |
| 2026-07-30T14:02:00Z | `c7111a5` + loaded run files | Parse existing workflow with installed Node `yaml` package | Pass |
| 2026-07-30T14:04:14Z | `c7111a5` + worktree | Parse workflow and assert triggers, permissions, affected refs, and all gate steps | Pass |
| 2026-07-30T14:04:14Z | `c7111a5` + worktree | `git diff --check` | Pass |
| 2026-07-30T14:06:00Z | `c7111a5` + worktree | Turbo dry run with PR #1 base/head supplied as `TURBO_SCM_BASE`/`TURBO_SCM_HEAD` | Pass; affected API and dependency tasks selected |
| 2026-07-30T14:19:12Z | workflow SHA-256 `8a9b0bc7598f5a6b22e6425663eb436d76d0aab2e636eefee08fca0e02cac96b` | Parse YAML and assert PR/push triggers, read-only permission, explicit SCM refs, full checkout history, and all gate commands | Pass |
| 2026-07-30T14:19:12Z | same workflow | Turbo dry runs using PR-style and push-style base/head revisions | Pass; 10 tasks selected in each simulation |
| 2026-07-30T14:19:12Z | `c7111a5` + worktree | `npm.cmd run lint` | Pass; 3 tasks |
| 2026-07-30T14:19:12Z | `c7111a5` + worktree | `npm.cmd run check-types` | Pass; 4 tasks |
| 2026-07-30T14:19:12Z | `c7111a5` + worktree | `npm.cmd run test` | Pass; API 188/188, frontend 112/112 |
| 2026-07-30T14:19:12Z | `c7111a5` + worktree | `npm.cmd run build` | Pass; API and frontend production builds |
| 2026-07-30T14:19:12Z | `c7111a5` + worktree | `npm.cmd run codegen --workspace front` plus generated-file blob/diff check | Pass; zero drift, worktree/index/HEAD blob `71a2de5` |
| 2026-07-30T14:19:12Z | `c7111a5` + worktree | `git diff --check` and final scope inspection | Pass; no application, dependency, secret, environment, or generated-file diff |
| 2026-07-30T14:27:21Z | reviewed workflow SHA-256 `8a9b0bc7598f5a6b22e6425663eb436d76d0aab2e636eefee08fca0e02cac96b` | Complete preflight: fetch, review-fingerprint check, lint, check-types, tests, build, codegen drift, and diff check | Pass; `origin/develop` unchanged at `c7111a5`, API 188/188, frontend 112/112, zero generated drift |

### Unverified remote behavior

- A real Actions run for the new `develop` trigger cannot exist until this
  branch is committed, pushed, and opened as a PR through the approved Complete
  workflow.
- The local `gh` credential is invalid, so Actions logs/checks will require
  `gh auth login -h github.com` before remote submission verification.
- Branch protection/rulesets and the required-check selection remain
  GitHub-hosted follow-ups. They were not mutated by this verification.
- The existing frontend ThemeToggle test replayed an `act(...)` warning while
  all 112 frontend tests passed. It is pre-existing and unrelated to this
  workflow-only diff.

## Review

- Verdict: **Ready to Complete**
- Reviewed revision: base
  `c7111a5ef3cf7b131b84f3fdb06d0afedc22705f` plus worktree; substantive-content
  fingerprint `889abcbd6657a9070cee4177a8be162f5bc8775b`
- Workflow SHA-256:
  `8a9b0bc7598f5a6b22e6425663eb436d76d0aab2e636eefee08fca0e02cac96b`
- Findings: None.

### Review coverage

- Goals and locally provable acceptance criteria have evidence. The real
  Actions run is deliberately a Complete-stage gate because creating the fix PR
  requires explicit approval; it must pass before merge.
- PR and push triggers cover both `develop` and `main`.
- Pull requests compare base/head SHAs; pushes compare before/current SHAs.
  Full checkout history makes both comparisons available to Turborepo.
- `contents: read` is the only token permission. No workflow step reads secrets
  or writes repository state.
- Fork PR execution has no secret-bearing step. The existing cache stores build
  outputs only and action/cache scoping remains unchanged.
- Concurrency keeps separate PR refs independent and cancels obsolete reruns for
  the same PR or protected branch.
- All prior lint, type-check, test, build, and GraphQL drift gates remain.
- No application, GraphQL schema, generated output, Prisma file, dependency,
  environment file, or deployment behavior changed.
- `.claude/settings.local.json` is explicitly excluded from this run.
- Action SHA pinning and timeouts remain optional hardening, not defects in the
  requested fix; changing them would expand scope without observed failure.

## Blockers

Remote GitHub Actions evidence requires re-authenticating the local GitHub CLI
with `gh auth login -h github.com` and sufficient repository/workflow scopes
during verification/completion. The connected GitHub app can read PR metadata
but does not replace Actions log inspection. This does not block local
implementation.

## State History

- 2026-07-30T13:54:54Z — Loaded from verified
  `origin/develop@c7111a5ef3cf7b131b84f3fdb06d0afedc22705f`.
- 2026-07-30T14:04:14Z — In Progress; baseline passed, trigger and affected-base
  defects confirmed, and the focused workflow fix was implemented.
- 2026-07-30T14:19:12Z — Verification Passed; workflow assertions, both
  affected-revision simulations, the complete local gate, build, and codegen
  drift check passed. Real Actions execution remains a post-push proof.
- 2026-07-30T14:22:27Z — In Review; reviewing the verified workflow revision,
  all run documentation, security posture, failure paths, and scope.
- 2026-07-30T14:23:14Z — Ready to Complete; no actionable findings. Remote
  Actions execution and required-check configuration remain guarded completion
  steps, not bypassed review requirements.
- 2026-07-30T14:30:05Z — Completing; user explicitly approved committing the
  five-file manifest, pushing `fix/ci-develop-pr-gate`, opening a PR to
  `develop`, conditionally merging only after required CI/review passes, and
  deleting branches only after verified integration.

## Completion

- Commit:
- Pull request:
- Merge commit:
- Completed at:
- Branch deleted:
