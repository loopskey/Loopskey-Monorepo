# Claude Prompt — Audit and Repair CI/CD Before the Next Feature

## Purpose

Use this prompt in Claude Code from the repository root. It is deliberately
phased: diagnose first, then create a dedicated fix workflow, implement the
smallest justified CI repair, verify it, and stop at every Git approval
boundary.

## Known repository context

- Repository: `loopskey/Loopskey-Monorepo`
- Monorepo: npm workspaces + Turborepo
- Normal integration flow: feature/fix/chore branches → `develop`
- Production promotion flow: `develop` → `main`
- Current PR: `#1`, branch `chore/monolith-ph1-baseline-ownership` → `develop`
- Existing workflow: `.github/workflows/ci.yml`
- Observed defect: the workflow listens only to `pull_request` and `push` events
  targeting `main`, so PRs targeting `develop` receive no CI checks.
- Current workflow gates: install, lint, type-check, test, build, and generated
  GraphQL type drift.
- The current workflow uses Node.js 22, npm cache, full Git history,
  Turborepo cache, and `turbo --affected`.
- The project currently has CI configuration, but no confirmed deployment/CD
  workflow. Do not call CI “CD” and do not invent a deployment target.
- PR #1 belongs to Modular Monolith Phase 1. The CI configuration gap is
  pre-existing and must be fixed in a separate branch/run, not folded into that
  feature.
- Do not modify, stage, or expose `.claude/settings.local.json` or any `.env`
  file.

## Copy/paste prompt for Claude Code

```text
Before continuing with any later product or modular-monolith feature, audit and
repair this repository's CI/CD setup using the repository's existing `/feature`
skill and project rules.

Work from the repository root. First read, in full:

- `CLAUDE.md`
- `.claude/skills/feature/SKILL.md`
- the action/reference files required by each `/feature` phase
- `context/project-overview.md`
- `context/coding-standards.md`
- `context/ai-interaction.md`
- `context/current-feature.md`
- all relevant active run records
- `.github/workflows/ci.yml`
- `package.json`, workspace package scripts, `turbo.json`, and the lockfile
- relevant GitHub/repository documentation

Known starting observation (verify it; do not blindly trust it):

- The normal PR target is `develop`.
- `.github/workflows/ci.yml` currently triggers only for `main`.
- PR #1 targets `develop`, so it appears to have no CI run/check.
- There is no confirmed deployment/CD workflow or deployment target.

Strict scope and safety rules:

1. Do not continue Modular Monolith Phase 2 or any later feature.
2. Do not add this fix to PR #1 or its branch.
3. Preserve unrelated tracked and untracked changes.
4. Never print, copy, edit, stage, or commit secrets, `.env` files, or
   `.claude/settings.local.json`.
5. Do not commit, push, create a PR, merge, change branch protection, configure
   repository secrets/environments, or delete a branch without the explicit
   approval required by the repository's `/feature complete` workflow.
6. Never push directly to `develop` or `main`, never force-push, and never bypass
   required checks.
7. Diagnose before editing. If GitHub authentication or permissions are missing,
   report the exact manual authentication/permission step instead of guessing.
8. Treat GitHub-hosted settings—branch protection, rulesets, required checks,
   Actions permissions, environments, secrets—as separate from files in Git.
   Read them when access permits; do not mutate them without explicit approval.
9. Make the smallest change supported by evidence. Do not opportunistically
   refactor application code, upgrade dependencies/actions, or add unrelated
   tooling.
10. Do not create deployment/CD automation until the deployment provider,
    environments, credentials, migration strategy, health check, and rollback
    policy are explicitly known and approved.

PHASE 0 — Read-only audit

A. Confirm the current branch, worktree state, remotes, default branch, and the
   relationship between `develop` and `main`.
B. Inspect PR #1 metadata, changed files, checks, workflow runs, and logs using
   `gh` where available. Confirm whether the absence of checks is caused by the
   workflow trigger rather than by a failing job.
C. Audit `.github/workflows/ci.yml` for:
   - trigger coverage for PRs into `develop` and `main`;
   - whether direct pushes should run on both protected branches;
   - least-privilege `permissions`;
   - concurrency grouping/cancellation correctness for PRs and pushes;
   - checkout history requirements for Turborepo `--affected`;
   - Node/npm version consistency;
   - npm and Turborepo cache correctness;
   - execution of lint, check-types, tests, build, and GraphQL codegen drift;
   - behavior when no package is affected;
   - fork-PR safety and secret usage;
   - timeouts and duplicate runs;
   - action version pinning/security, reported separately if changing it is not
     necessary for this defect.
D. Inspect the actual scripts/task graph and verify every CI command exists and
   has the required dependencies and outputs.
E. Distinguish:
   - CI defects that block normal `develop` PRs;
   - repository-host settings that may be missing;
   - optional hardening;
   - true CD/deployment work that cannot be designed without more information.
F. Produce a concise evidence table with: finding, severity, evidence, impact,
   proposed fix, and whether it is local-Git or GitHub-hosted configuration.

Do not edit anything during Phase 0.

PHASE 1 — Proposed fix and feature-workflow setup

If the trigger gap is confirmed, propose a focused specification for a separate
maintenance fix, for example:

- slug: `ci-develop-pr-gate`
- branch: `fix/ci-develop-pr-gate`
- base: verified `origin/develop`
- goal: ensure normal PRs into `develop` run the same mandatory CI gates while
  preserving release validation for `main`

Acceptance criteria must include at least:

1. A PR targeting `develop` creates a CI run.
2. A PR targeting `main` remains covered.
3. The intended push events are explicitly documented and tested.
4. lint, check-types, test, build, and GraphQL generated-code drift remain
   enforced.
5. `--affected` has a valid comparison base/event behavior; no false-green run
   caused by missing history or an incorrect base.
6. Workflow YAML parses and relevant local gates pass.
7. No application/runtime behavior, dependency version, secret, or deployment
   behavior changes.
8. The change is made through the repository's `/feature` lifecycle with its
   own spec and active run record.

Before creating/switching a branch or mutating files, show:

- the confirmed root cause;
- the exact proposed scope and file manifest;
- any ambiguity about whether pushes to `develop` should also run;
- the planned verification;
- any GitHub-hosted setting that cannot be changed in the repository.

Then follow `/feature load` as defined by this repository. If the active Phase 1
run/PR makes the compatibility pointer ambiguous, resolve runs by their branch
and independent run records; do not overwrite or archive the Phase 1 record.

PHASE 2 — Minimal implementation

After the feature workflow permits implementation:

1. Modify only the files required by the approved CI fix and its documentation/
   run record.
2. At minimum, correct the event coverage so PRs targeting `develop` are gated.
3. Preserve `main` coverage.
4. Add explicit least-privilege workflow permissions if the audit proves this is
   safe and appropriate.
5. Change concurrency, cache keys, affected-base logic, action versions, or
   timeout settings only when you can demonstrate a concrete defect or accepted
   hardening requirement. Record the rationale.
6. Do not add a fake deploy job. If no deployment target is configured, document
   “CD not configured” plus the decisions needed for a future CD specification.

PHASE 3 — Verification

Use `/feature verify` and record exact evidence. At minimum:

- validate workflow YAML/syntax with an available trusted local tool, without
  adding a dependency solely for this check unless approved;
- run `git diff --check`;
- run the mandatory repository gates:
  - `npm run lint`
  - `npm run check-types`
  - `npm run test`
  - `npm run build`
  - `npm run codegen --workspace front`, followed by a drift check for
    `apps/front/src/lib/graphql/generated.ts`
- inspect the final diff and confirm only approved files changed;
- verify trigger logic for PR base `develop` and `main`;
- document what cannot be proven locally: an actual GitHub Actions run and
  branch-protection behavior require a pushed PR.

Do not claim CI is working merely because local commands pass.

PHASE 4 — Review

Run `/feature review`. Review the verified revision for:

- false-green or skipped `--affected` runs;
- missing `develop` trigger;
- accidental loss of `main` trigger;
- excessive token permissions;
- unsafe secret use on fork PRs;
- cache poisoning/cross-branch cache concerns;
- duplicate or cancelled required runs;
- unrelated scope changes;
- consistency with the documented `develop` → `main` branching model.

If findings exist, return through `/feature start` → `/feature verify` →
`/feature review`. Do not fix issues inside the review phase.

PHASE 5 — Approval boundary and remote proof

When and only when status is Ready to Complete, run `/feature complete` preflight
and stop for explicit approval before commit/push/PR/merge operations. Present:

- exact files;
- conventional commit message;
- PR title/body;
- local test evidence;
- expected GitHub checks;
- rollback (revert the workflow commit);
- any required manual repository-setting steps.

Suggested commit:
`fix(ci): run verification for develop pull requests`

Suggested PR target:
`develop`

After explicit approval to commit/push/create the PR:

1. Push the dedicated fix branch and open a PR to `develop`.
2. Confirm that a real CI run is created for that PR.
3. Inspect every check and failing GitHub Actions log.
4. If CI fails, diagnose the observed failure, update the run to the appropriate
   state, and return through the normal implementation/verification/review loop.
5. Do not merge merely because the workflow started. Require all approved gates
   and human review.
6. Do not merge or delete branches without separate explicit authorization
   covering those operations.

PR #1 follow-up:

Once the CI fix is merged to `develop`, determine whether GitHub automatically
runs/re-runs the updated workflow for the still-open PR #1. If it does not,
propose the safest auditable way to trigger validation (for example an approved
branch update or rerun where supported). Do not create an empty commit, rebase,
merge `develop`, close/reopen the PR, or mutate PR #1 without explicit approval.
Then wait for PR #1 checks and report their actual results before calling that PR
CI-verified.

PHASE 6 — Separate CD decision report

Do not implement deployment in this task unless a separately approved
specification supplies all required information. Finish with a short CD gap
report listing:

- deployment provider/runtime;
- staging and production environments;
- trigger/promotion policy;
- build artifact ownership;
- database migration strategy;
- secrets and environment protection;
- health checks and smoke tests;
- rollback strategy;
- approval gates and production branch/tag policy.

If any item is unknown, mark CD as “not ready for implementation” and turn the
unknowns into explicit questions for a future spec.

Final response format:

1. Confirmed root cause
2. Audit findings by severity
3. Files changed and why
4. Verification evidence
5. Real GitHub Actions/PR evidence (or clearly stated unverified items)
6. GitHub-hosted settings/manual actions still required
7. CD readiness decision
8. Whether it is safe to resume later features

Never hide uncertainty. Separate observed facts, local verification, remote
verification, and recommendations.
```

## Expected minimal CI change

The exact patch must come from the audit, but the central defect likely requires
the pull-request trigger to cover both integration and release targets:

```yaml
on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [main]
```

Whether `push` should also include `develop` is a repository-policy decision:
running it provides a post-merge gate, but may duplicate the PR run. Claude must
inspect branch protection/rulesets and state the trade-off before selecting it.

## Human decisions before true CD

CI can be repaired without choosing a hosting platform. CD cannot. Before
creating a deployment workflow, decide:

1. Where the Next.js frontend, NestJS API, PostgreSQL database, and uploaded
   files will run.
2. Whether `develop` deploys to staging and `main` deploys to production.
3. How Prisma migrations are applied and rolled back.
4. Which smoke/health checks prove a deployment is usable.
5. Which GitHub environments, approvals, and secrets are required.
6. What artifact/image is promoted so production does not rebuild unreviewed
   source.
