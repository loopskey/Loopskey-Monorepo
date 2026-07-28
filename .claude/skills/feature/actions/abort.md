# Abort Action

Read `../references/state-machine.md` and `../references/git-policy.md`.

1. Resolve the active run.
2. Require a reason from the user.
3. Inspect and report uncommitted, committed, and pushed work.
4. Set status:
   - `Blocked` when work may resume after a decision or external change
   - `Cancelled` when the feature is intentionally ended
5. Record the reason, actor, timestamp, branch, and recoverability.
6. Preserve all code and Git history by default.

Never reset, discard changes, delete files, close a PR, or delete a branch
without separate explicit approval naming the exact target.

For cancellation, offer a follow-up cleanup plan. Do not execute it
automatically.
