# Load Action

Read `../references/state-machine.md`, `../references/git-policy.md`, and
`../references/run-record-schema.md`.

## Input

Require exactly one feature spec name after `load`.

Resolve it in this order:

1. Exact path supplied by the user
2. `context/features/<name>.md`
3. `context/fixes/<name>.md`

Do not use fuzzy matching when multiple files could match. Inline feature
descriptions must first be saved as a proper specification in `context/features`
or `context/fixes`.

## Preflight

1. Read the project context files named in the parent skill.
2. Read the complete spec.
3. Require an objective, scope/goals, and acceptance criteria or definition of
   done. Report missing sections instead of inventing them.
4. Derive a lowercase hyphenated slug and branch type:
   - Feature: `feature/<slug>`
   - Fix: `fix/<slug>`
   - Tooling/docs: `chore/<slug>`
5. Check for an existing active/completed run and matching branch.
6. Require a clean worktree except files the user explicitly identifies as
   belonging to this new run. Never absorb unrelated changes.
7. Verify `develop` exists locally and as `origin/develop`. If either is missing,
   stop and explain that repository initialization is required.
8. Fetch and confirm local `develop` is not ahead/diverged from
   `origin/develop`. Do not pull or rewrite without permission.

## Create

1. Create the feature branch from the verified `origin/develop`.
2. Create `context/feature-runs/active/<slug>.md` from the run-record schema.
3. Record the exact spec, owner if known, branch, base branch, base commit,
   timestamps, extracted goals, non-goals, and acceptance criteria.
4. Set status to `Loaded`.
5. Update `context/current-feature.md` only as a compatibility pointer containing
   the run path and branch. Do not put implementation history there.

## Idempotency

If the run and branch already exist and match, switch to the registered branch,
report the existing state, and make no duplicate record. If they disagree, stop
and report the conflict.

## Result

Report the loaded spec, created/reused branch, run record, base commit, goals,
and the next command: `/feature start`.
