# Start Action

Read `../references/state-machine.md`, `../references/git-policy.md`, and
`../references/verification-matrix.md`.

1. Resolve the active run from the current branch or the compatibility pointer.
2. Require status `Loaded`, `In Progress`, `Verification Failed`, or
   `Changes Requested`.
3. Verify the current branch exactly matches the run record.
4. Verify the registered spec and base commit still exist.
5. Check the worktree. Preserve unrelated changes and stop if they overlap the
   feature.
6. Read the project context, full spec, and run record.
7. On the first start, run the proportional baseline commands and record
   pre-existing failures before editing.
8. Set status to `In Progress`.
9. Implement goals in dependency order with focused changes.
10. Update goal checkboxes only when evidence supports completion.
11. Add or update tests for changed behavior.
12. Record material decisions, assumptions, migrations, contract changes, and
    blockers in the run record.

Do not expand scope silently. If implementation requires a material spec change,
set status `Blocked`, document the decision needed, and ask the user.

Do not commit, push, merge, or delete branches in this action.

End by summarizing completed and remaining goals and recommending
`/feature verify`.
