---
name: feature
description: Manage the Loopskey feature lifecycle consistently across multiple developers. Use for loading a feature specification, creating its branch and run state, implementing it, checking status, verifying gates, reviewing changes, explaining the diff, submitting through commit/push/PR/CI, or safely aborting work. Submission never merges the PR or deletes its branch.
argument-hint: load|start|status|verify|review|explain|complete|abort
---

# Feature Workflow

Execute the requested action from `$ARGUMENTS`.

| Action        | Purpose                                                            |
| ------------- | ------------------------------------------------------------------ |
| `load <spec>` | Validate a spec, create its run state, and create its branch       |
| `start`       | Implement the loaded feature on its registered branch              |
| `status`      | Report current state, progress, verification, review, and blockers |
| `verify`      | Exercise the change and run the proportional and final gates       |
| `review`      | Review goals, code, security, scope, and verification evidence     |
| `explain`     | Explain branch changes relative to the registered base             |
| `complete`    | Revalidate, commit, push, open a PR, and report completed CI       |
| `abort`       | Record cancellation/blocking without destructive Git operations    |

Read the matching file under `actions/` completely before acting.

Before every mutating action, read:

- `context/project-overview.md`
- `context/coding-standards.md`
- `context/ai-interaction.md`
- The selected feature specification
- The selected file under `context/feature-runs/active/`

Read these references when the action names them:

- `references/state-machine.md`
- `references/git-policy.md`
- `references/verification-matrix.md`
- `references/run-record-schema.md`

Use one run record per feature. Do not use `context/current-feature.md` as
shared mutable state; it is a compatibility pointer only.

Never commit, push, or create a PR without the explicit approval required by
the matching action. This skill never merges a PR or deletes its branch; those
are manual owner actions after review. Never stage unrelated files.

If no action is provided, show the available actions and current active runs.
