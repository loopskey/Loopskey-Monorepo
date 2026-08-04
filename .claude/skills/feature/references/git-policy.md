# Git Policy

## Branch Model

```text
main       production/release
develop    integration and feature PR target
feature/*  product features
fix/*      non-emergency fixes
chore/*    tooling, documentation, maintenance
hotfix/*   emergency production fixes from main
```

Feature, fix, and chore branches start from the verified `origin/develop`.
Hotfixes start from `origin/main` and require a separately documented
back-merge to `develop`.

## Safety

- Require a clean or explicitly scoped worktree before branch creation.
- Never overwrite, reset, stash, or absorb another developer's work.
- Never force-push shared branches.
- Never commit directly to `main` or `develop`.
- Never stage an unreviewed wildcard set.
- Never merge a PR or enable auto-merge from this workflow.
- Never delete local or remote feature branches from this workflow.
- Fetch before integration decisions.
- Record base branch and base commit in the run record.

## Integration

Default to a PR targeting `develop`. Wait for all CI checks to finish and
require successful conclusions before reporting submission success. Leave the
PR open for human review and manual merge.

Commit messages use Conventional Commits and contain no AI attribution.

Commit, push, and PR creation require explicit approval because they change
shared state. PR merge, auto-merge, PR close, and branch deletion are outside
this workflow and remain manual owner actions.
