# Fix Specification: CI Gate for Develop Pull Requests

## Objective

Restore CI coverage for the repository's normal integration workflow so pull
requests targeting `develop` run the mandatory verification gates, while
preserving CI coverage for release pull requests targeting `main`.

## Context

The repository workflow in `.github/workflows/ci.yml` currently listens to
`pull_request` and `push` events for `main` only. Project policy routes normal
feature, fix, and chore pull requests into `develop`. As a result, PR #1 and any
other `develop`-targeted pull request receive no GitHub Actions CI run.

The detailed audit and execution guidance is recorded in
`context/prompts/claude-ci-cd-audit-and-fix.md`.

## Goals

- Confirm the missing `develop` trigger is the cause of absent checks on normal
  pull requests.
- Make the smallest workflow change that runs CI for pull requests targeting
  `develop`.
- Preserve CI coverage for pull requests targeting `main`.
- Preserve lint, type-check, test, build, and GraphQL generated-code drift
  gates.
- Validate the workflow locally and prove it with a real GitHub Actions run
  after approved commit, push, and PR creation.
- Report GitHub-hosted configuration still required for branch protection and
  required checks.
- Produce a separate CD readiness decision without inventing deployment
  infrastructure.

## Non-Goals

- Continuing Modular Monolith Phase 2 or any later product feature.
- Modifying PR #1 or adding this fix to its branch.
- Implementing deployment/CD without an approved deployment architecture.
- Changing application runtime behavior, dependencies, database schema, or
  generated application contracts.
- Changing GitHub branch protection, rulesets, environments, permissions, or
  secrets without explicit approval.
- Refactoring unrelated workflow or application code.

## Acceptance Criteria

- [ ] The root cause of missing checks on `develop` pull requests is confirmed
      with local and, where authentication permits, GitHub evidence.
- [ ] A pull request targeting `develop` matches the CI workflow trigger.
- [ ] A pull request targeting `main` remains covered by the CI workflow.
- [ ] The intended `push` event policy for `develop` and `main` is explicitly
      documented, with duplicate-run and post-merge-gate trade-offs considered.
- [ ] lint, check-types, test, build, and GraphQL generated-code drift remain
      enforced.
- [ ] Turborepo `--affected` has valid Git history and comparison behavior and
      cannot silently report green because no change was detected incorrectly.
- [ ] Workflow YAML parses, `git diff --check` passes, and the mandatory local
      repository verification gate passes.
- [ ] A real CI run is observed on the dedicated fix PR after explicit approval
      for remote Git operations; any failure is diagnosed from its Actions log.
- [ ] Only the workflow, this specification, its run record, the compatibility
      pointer, and directly relevant documentation are changed.
- [ ] No secret, environment file, local Claude setting, deployment behavior,
      application runtime behavior, or dependency version is changed.
- [ ] GitHub-hosted settings and any manual follow-up actions are reported
      separately from repository-file changes.
- [ ] CD is marked either ready with an independently approved architecture or,
      by default for this scope, not ready with the missing decisions listed.

## Verification Requirements

- Validate workflow YAML with an already available trusted mechanism.
- Run `git diff --check`.
- Run `npm run lint`.
- Run `npm run check-types`.
- Run `npm run test`.
- Run `npm run build`.
- Run `npm run codegen --workspace front` and confirm no drift in
  `apps/front/src/lib/graphql/generated.ts`.
- Inspect the final scoped diff.
- After approved remote submission, verify an actual GitHub Actions run for a
  PR whose base is `develop`.

## Open Policy Decision

The audit must determine whether direct pushes to `develop` should also trigger
CI. Enabling them provides a post-merge gate but may duplicate pull-request
validation. Do not silently decide this without checking repository rulesets and
documenting the trade-off.

## Rollback

Revert the focused workflow commit. No application or database rollback should
be necessary because this fix must not change runtime or persistence behavior.
