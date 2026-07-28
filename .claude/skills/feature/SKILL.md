---
name: feature
description: Manage the complete Loopskey feature lifecycle consistently across multiple developers. Use for loading a feature specification, creating its branch and run state, implementing it, checking status, verifying gates, reviewing changes, explaining the diff, completing through commit/PR/merge, or safely aborting work.
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
| `complete`    | Revalidate, obtain approval, commit, push, merge, and archive      |
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

Never commit, push, merge, create a PR, or delete a branch without the explicit
approval required by the matching action. Never stage unrelated files.

If no action is provided, show the available actions and current active runs.
