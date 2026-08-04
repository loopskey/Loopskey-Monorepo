# Complete Action

Read `../references/state-machine.md`, `../references/git-policy.md`,
`../references/verification-matrix.md`, and
`../references/run-record-schema.md`.

This action has an approval boundary. Prepare everything first, show the exact
operations, and obtain explicit user approval before commit/push/PR creation.

This action ends after CI completes. Never merge the PR, enable auto-merge, or
delete the local or remote feature branch, even if the user previously approved
those operations. The repository owner performs final review, merge, and branch
cleanup manually.

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
- Wait for all PR CI checks and report their results

No approval means no external or destructive action.

## Submit

After approval:

1. Stage only the approved file manifest; never use an unexamined `git add .`.
2. Commit with the approved conventional message and no AI attribution.
3. Push the feature branch.
4. Create a PR targeting `develop`.
5. Wait until every CI check reaches a terminal state. Do not treat a queued or
   running check as success, and do not bypass protection.
6. Verify every required check passed. Record each check name, conclusion, and
   URL when available.
7. If any check fails or is cancelled, set `Verification Failed`, report the
   failing checks, and return fixes through the normal implementation loop.
8. If all checks pass, set status `Submitted` and keep the run record under
   `context/feature-runs/active/`. Record the commit, PR URL, CI results, and
   submission timestamp.
9. Report the branch, commit, PR URL, target branch, and CI status. State that
   manual review, merge, and branch cleanup remain for the repository owner.

Never call a merge command or API, enable auto-merge, update the base branch to
simulate integration, close the PR, or delete either branch. If the Git provider
cannot create the PR or expose CI status, stop after the last successful step
and provide the exact manual next step.
