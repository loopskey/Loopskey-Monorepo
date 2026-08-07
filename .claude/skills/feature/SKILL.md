---
name: feature
description: "Run the Loopskey feature lifecycle with three commands: start implements and verifies a feature, review gives an optional concise summary, and complete commits, pushes, opens a PR to develop, and waits for CI without merging or deleting branches."
---

# Feature workflow

Use only `start`, `review`, and `complete`. Keep output short and load context progressively.

## Context selection

Always read only:

- this file;
- `CLAUDE.md` at the repository root;
- the matching run record under `context/feature-runs/active/`, when one exists;
- the user-named specification, when one is supplied.

Determine scope from the request and changed paths:

- frontend: read `apps/front/CLAUDE.md`;
- core backend: read `apps/api/CLAUDE.md`;
- AI backend: read `apps/service-ai/CLAUDE.md`;
- shared/root: read only the app files the change actually affects.

Search code before opening broad documentation. Read a section of
`context/project-overview.md`, `context/coding-standards.md`, architecture ADRs,
or feature roadmaps only when the task depends on it. Never load all active run
records or all project Markdown.

## `/feature start <spec-or-request>`

Treat this command as authorization to prepare the branch and implement the
feature completely.

1. Require a clean or explicitly scoped worktree; preserve unrelated changes.
2. Fetch `origin/develop`, create `feature/<slug>` from it, and never reuse a
   branch belonging to another run.
3. Detect `front`, `api`, `service-ai`, or `full` scope and record it.
4. Create `context/feature-runs/active/<slug>.md` containing only:
   name, scope, branch, base commit, status, acceptance checklist, verification,
   and submission fields. The run record is the current-feature context.
5. Implement autonomously until the acceptance criteria are met. Run focused
   checks while iterating and fix feature-caused failures.
6. Finish with the scope gate:
   - frontend: frontend lint, types, tests, build; browser behavior when relevant;
   - core backend: API lint, types, tests, build; E2E/Prisma/codegen when relevant;
   - AI backend: service-ai lint, types, tests, build; codegen when a route or
     Pydantic model changed, and commit the regenerated `openapi.json`;
   - full/shared: root lint, types, tests, and build plus relevant E2E/codegen.
7. Set status to `Ready` only when implementation and required checks pass.

Ask only when the feature request is materially ambiguous, the worktree cannot
be scoped safely, or external authority is required.

## `/feature review`

This is optional and read-only. Resolve the run by current branch and return at
most four bullets:

- implemented;
- changed files (grouped, not a long manifest);
- tests/checks;
- remaining issues, or `None`.

Do not reload broad project context or rerun checks unless evidence is stale.

## `/feature complete`

Treat this command as explicit authorization to commit the feature manifest,
push its branch, create a PR to `develop`, and monitor CI. It never authorizes
merge, auto-merge, PR closure, or branch deletion.

1. Require run status `Ready`, the recorded branch, and no unscoped files.
2. Fetch `origin/develop`; report and stop for conflicts that cannot be resolved
   safely without changing the feature.
3. Run only stale or missing final checks. CI is the authoritative full gate;
   do not repeat a fresh successful local gate merely for ceremony.
4. Stage only the feature manifest and commit with a Conventional Commit message.
5. Push the branch and open a ready-for-review PR targeting `develop` with a
   short summary, impact, tests, and migration note.
6. Record the PR URL and `Submitted` status in the run, append one short entry
   to `context/feature-history.md`, then push one metadata-only commit. Do this
   before waiting so metadata does not create a second CI cycle.
7. Wait for CI on the final metadata commit. If a check fails, fix it on the
   same branch, push, and wait again. Report the PR URL and final CI result.

Never merge the PR, enable auto-merge, delete a branch, or claim manual review
has occurred.

## Run record template

```markdown
# <feature>

- Scope: `front|api|service-ai|full`
- Branch: `feature/<slug>`
- Base: `<sha>`
- Status: `Working|Ready|Submitted|Blocked`

## Acceptance

- [ ] criterion

## Verification

- `<command>` — pass|fail

## Submission

- Commit:
- PR:
- CI:
```
