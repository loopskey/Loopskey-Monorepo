# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

This is the common workflow that we will use for every single feature/fix:

1. **Document** - Document the feature in @context/current-feature.md.
2. **Branch** - Create a new branch off `develop` for the feature, fix, etc.
3. **Implement** - Implement the feature/fix that I create in @context/current-feature.md
4. **Verify** - Confirm it actually works (see Verification below)
5. **Gate** - Run `npm run build`, `npm run lint`, and `npm run check-types`. Fix any errors.
6. **Iterate** - Iterate and change things if needed
7. **Review** - Review the code before it lands, not after (see Code Review below)
8. **Commit** - Only after the gate passes, review is done, and everything works
9. **Merge** - Merge to `develop`
10. **Delete Branch** - Ask before deleting the branch after merge
11. Mark as completed in @context/current-feature.md and add to history

Do NOT commit without permission and until the build passes. If the build fails, fix the issues first.

Review comes before commit and merge on purpose. Reviewing after a merge, with the
branch already deleted, is too late to act on anything it finds.

## Branching

Create a new branch for every feature/fix, branched from `develop`.

Name branches by type: **feature/[feature]**, **fix/[fix]**, **chore/[chore]**.

Example: `feature/contract-upload`, `fix/session-rotation`, `chore/env-example`.

Ask to delete the branch once merged.

Note: existing branches use an older person-prefixed convention (`neda-auth`,
`mohammad-names`). Leave those as they are; use the `type/name` form for new work.

## Merge Target

`develop` is the integration branch and the default branch on the remote.

**Never merge to `main`.** It is a vestigial 3-commit stub that `develop` has long
since diverged from. If `main` is ever promoted to a real release branch, update
this section first.

## Verification

There are no test files in the repo yet, so "it builds" is not evidence that it
works. Verify by exercising the actual change, then implement unit tests later.

- **Frontend** (`apps/front`) - verify in the browser at `http://localhost:3000`.
- **API** (`apps/api`) - there is no browser surface. Verify by running the
  operation against the GraphQL endpoint at `http://localhost:5700/graphql`.
- **Schema changes** - regenerate the Prisma client and create a migration;
  confirm the generated GraphQL schema reflects the change.

## Commits

- Ask before committing (don't auto-commit)
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Keep commits focused (one feature/fix per commit)
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
