# Verify Action

Read `../references/state-machine.md` and
`../references/verification-matrix.md`.

1. Resolve the run and require its registered branch.
2. Require status `In Progress`, `Verification Failed`, or
   `Changes Requested`.
3. Read the spec, goals, acceptance criteria, coding standards, and project
   overview.
4. Inspect the branch diff from the registered base commit.
5. Exercise the changed behavior through the real boundary:
   - Browser for frontend behavior
   - GraphQL/REST endpoint for API behavior
   - Isolated database for persistence behavior
6. Run proportional checks first, then the mandatory final gate.
7. Fix failures caused by the feature when the fix is within scope.
8. Re-run every failed command after fixing it.
9. Record command, result, timestamp, current commit/worktree fingerprint, and
   any unverified behavior in the run record.
10. Set:
    - `Verification Passed` when all required evidence passes
    - `Verification Failed` when a feature-caused failure remains
    - `Blocked` when safe verification requires missing authority/infrastructure

Never claim a behavior works based only on compilation. Never hide or relabel a
feature-caused failure as pre-existing.

Do not commit, push, merge, or delete branches.
