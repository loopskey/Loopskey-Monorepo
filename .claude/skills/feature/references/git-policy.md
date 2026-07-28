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
- Never delete a branch before its merge is verified remotely.
- Fetch before integration decisions.
- Record base branch and base commit in the run record.

## Integration

Default to a PR targeting `develop`. Require CI and human review. Use the merge
method configured by repository policy; do not invent a different history
strategy in the skill.

Commit messages use Conventional Commits and contain no AI attribution.

Commit, push, PR creation, merge, PR close, and branch deletion require explicit
approval because they change shared or recoverability-sensitive state.
