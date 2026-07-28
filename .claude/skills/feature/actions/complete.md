# Complete Action

Read `../references/state-machine.md`, `../references/git-policy.md`,
`../references/verification-matrix.md`, and
`../references/run-record-schema.md`.

This action has an approval boundary. Prepare everything first, show the exact
operations, and obtain explicit user approval before commit/push/PR/merge.

## Preflight

1. Resolve the run and require status `Ready to Complete`.
2. Require the current branch to match the run.
3. Require the review to reference the current HEAD and current worktree
   fingerprint. Any change after review invalidates the verdict.
4. Re-run the mandatory final gate and record it.
5. Fetch remote state.
6. Require `origin/develop` and confirm the feature can be integrated without
   rewriting published history.
7. Enumerate every file to be committed. Exclude unrelated files explicitly.
8. Validate migration order, generated files, secrets, and large unexpected
   artifacts.
9. Prepare:
   - Conventional commit message
   - PR title and summary
   - Test evidence
   - Rollback/migration notes
   - Exact file manifest

## Approval

Ask one explicit question covering:

- Commit the listed files
- Push the feature branch
- Open a PR targeting `develop`
- Merge only after required CI/review passes
- Delete the remote/local branch after merge

No approval means no external or destructive action.

## Submit

After approval:

1. Stage only the approved file manifest; never use an unexamined `git add .`.
2. Commit with the approved conventional message and no AI attribution.
3. Push the feature branch.
4. Create a PR targeting `develop`.
5. Wait for required CI and human review. Do not bypass protection.
6. If checks fail, set `Verification Failed`, fix through the normal loop, and
   stop completion.
7. Merge using the repository's configured merge policy.
8. Verify `origin/develop` contains the merged commit.
9. Run or confirm the post-merge CI/build gate.
10. Move the run record to
    `context/feature-runs/completed/<slug>.md`, set status `Complete`, and record
    commit, PR, merge commit, checks, timestamps, and branch deletion.
11. Update the generated/history index without rewriting previous records.
12. Commit/push completion metadata through the same reviewed mechanism if it
    was not included in the PR.
13. Delete local and remote feature branches only after merge verification and
    approved deletion.
14. Reset the compatibility pointer to no active feature.

If the Git provider cannot create or merge a PR, stop after pushing and provide
the exact manual next step. Do not silently replace the PR workflow with a local
merge.
