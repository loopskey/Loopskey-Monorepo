---
name: commit-safe
description: Review local changes and create a safe conventional commit. Use when the user asks to commit, generate a commit message, prepare staged changes, inspect the diff before commit, or replace the old commit-msg workflow.
---

# Commit Safe

## Safety Rules

- Never commit secrets from `.env` files.
- Never stage or revert unrelated user changes unless the user explicitly asks.
- Inspect `git status --short` before deciding scope.
- If changes are unstaged, ask before staging unless the user clearly requested committing all current work.
- If staged changes are empty, stop and explain what needs staging.

## Workflow

1. Run:

```bash
git status --short
git diff --staged
```

2. If the staged diff is empty, inspect unstaged changes with `git diff` and ask whether to stage them.
3. Confirm the commit scope matches the user's request.
4. Generate a conventional commit message:

```text
type(scope): subject

- concise bullet describing what changed
- concise bullet describing why or the impact
```

5. Commit only the intended staged changes.

## Message Rules

- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `build`, `ci`.
- Subject: imperative mood, lowercase, no trailing period, around 60 characters or less.
- Scope: use app/domain names such as `api`, `front`, `auth`, `graphql`, `prisma`, `ui`, `docs`.
- Body: 1-3 bullets when useful.
- No trailers such as `Co-Authored-By` unless the user explicitly requests them.

## Final Response

Report the commit hash and exact message. Mention any uncommitted changes left behind.
