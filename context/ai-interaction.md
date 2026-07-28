# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

Use the project `feature` skill for every feature and fix:

1. **Load** — validate the specification, create an independent run record, and
   create a branch from `origin/develop`.
2. **Start** — implement the approved scope and tests.
3. **Verify** — exercise the real behavior and run lint, types, tests, build, and
   applicable drift checks.
4. **Review** — review the verified revision before any commit or merge.
5. **Iterate** — findings return through Start, Verify, and Review.
6. **Complete** — after explicit approval, commit only feature files, push the
   branch, open a PR to `develop`, wait for required checks/review, merge, archive
   the run record, and delete the branch only after verified integration.

Feature state is stored per feature:

```text
context/feature-runs/active/<slug>.md
context/feature-runs/completed/<slug>.md
```

`context/current-feature.md` is a compatibility pointer, not shared workflow
state. This prevents multiple developers from overwriting one another.

Do not commit, push, create/merge a PR, or delete a branch without the explicit
approval required by the Complete action. Reviewing after merge is too late.

## Branching

Create a new branch for every feature/fix, branched from the verified
`origin/develop`.

Name branches by type: **feature/[feature]**, **fix/[fix]**,
**chore/[chore]**, and **hotfix/[hotfix]**.

Example: `feature/contract-upload`, `fix/session-rotation`, `chore/env-example`.

Hotfixes branch from `origin/main` and require an explicit back-merge to
`develop`. Ask before deleting any branch after merge.

Note: existing branches use an older person-prefixed convention (`neda-auth`,
`mohammad-names`). Leave those as they are; use the `type/name` form for new work.

## Merge Targets

- `main` is the protected production/release branch.
- `develop` is the protected integration branch and normal PR target.
- Feature, fix, and chore branches merge into `develop`.
- Release promotion from `develop` to `main` is a separate reviewed workflow.
- Hotfixes target `main` and must be reconciled back into `develop`.

Never commit directly to `main` or `develop`. Prefer a pull request with required
CI and human review over a local merge.

## Verification

A successful build is not evidence that behavior works. Exercise the actual
change and add proportional automated tests.

- **Frontend** (`apps/front`) - verify in the browser at `http://localhost:3000`.
- **API** (`apps/api`) - there is no browser surface. Verify by running the
  operation against the GraphQL endpoint at `http://localhost:5700/graphql`.
- **Schema changes** - regenerate the Prisma client and create a migration;
  confirm the generated GraphQL schema reflects the change.

## Commits and Shared Git Actions

- Ask before committing, pushing, creating or merging a PR, or deleting a branch.
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Keep commits focused (one feature/fix per commit)
- Stage only the reviewed feature manifest; do not use an unexamined `git add .`.
- Do not force-push shared branches.
- No Claude attribution in commit messages. No "Generated With Claude" banner and
  no `Co-Authored-By: Claude` trailer. Commits are authored by the human.

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features
- Preserve existing patterns in the codebase

## Code Review

Review AI-generated code before committing, and periodically on demand.

General:

- Security (auth checks, input validation)
- Performance (unnecessary re-renders, N+1 queries)
- Logic errors (edge cases)
- Patterns (matches existing codebase?)

This project in particular:

- **Auth scope** - global-user and project-account auth are deliberately separate.
  Check that a change hasn't mixed the two.
- **Guarded by default** - `AppAuthGuard` is registered globally, so every operation
  is protected unless explicitly marked public. For any new operation, confirm the
  public/role decision was made on purpose rather than inherited by accident.
- **Project boundaries** - project-scoped queries and mutations must not leak across
  projects.
- **Secret exposure** - password hashes and refresh-token hashes must never reach a
  response.

The architectural rules these draw on live in @context/project-overview.md under
"Guidance for Future Changes" — read there rather than restating them here.
