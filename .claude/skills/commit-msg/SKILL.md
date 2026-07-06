---
name: commit-msg
description: Legacy compatibility wrapper for commit message generation. Use when the user invokes commit-msg, asks to write a commit message, or uses the old commit workflow; prefer the commit-safe skill for the full safe commit process.
---

# Commit Msg

Use `commit-safe` for the full workflow.

## Minimal Workflow

1. Inspect staged changes:

```bash
git status --short
git diff --staged
```

2. If nothing is staged, stop and ask whether to stage intended changes.
3. Generate a conventional commit message:

```text
type(scope): subject

- concise bullet describing what changed
- concise bullet describing why or impact
```

4. Do not commit secrets, unrelated changes, or unstaged work unless explicitly requested.
