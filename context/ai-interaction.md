# AI workflow policy

Use `/feature start <spec-or-request>`, optional `/feature review`, and
`/feature complete`.

- `start` creates the branch, loads scope-specific context, implements, tests,
  fixes failures, and leaves the run `Ready`.
- `review` returns a four-bullet maximum summary.
- `complete` commits scoped files, pushes, opens a PR to `develop`, waits for CI,
  and reports the PR URL.

`complete` never merges, enables auto-merge, closes the PR, or deletes branches.
Those actions belong to the Team Lead after manual review.

Feature state is branch-specific under `context/feature-runs/active/`. Do not
load other runs. Use Conventional Commits and never stage unrelated files.
