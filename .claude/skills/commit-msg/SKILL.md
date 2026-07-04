---
name: commit-msg
description: Generate and commit staged changes with conventional commit message. Use when you have staged changes ready to commit.
---

# Commit Message Generator

Generates a conventional commit message based on your staged changes and commits them to git.

## Workflow

### Step 1: Check for Staged Changes

First, verify that you have staged changes:

```bash
git diff --staged
```

If the output is empty (no staged changes), stop here and ask the user to stage changes first using `git add`.

### Step 2: Analyze the Diff

Read the output from `git diff --staged` to understand what was changed:
- What files were modified, added, or deleted
- What lines/sections changed
- Whether changes are feature additions, bug fixes, refactoring, documentation, etc.

### Step 3: Generate Commit Message

Create a conventional commit message following this format:

```
type(scope): subject

- bullet point describing what changed
- bullet point explaining why
```

**Rules:**
- **type**: Must be one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`
- **scope**: The area affected (e.g., auth, user, course, ui, database). Can be omitted if change is broad.
- **subject**: Concise description, under 60 characters, lowercase, imperative mood (e.g., "add favorites filter", "fix auth guard", not "added" or "fixed")
- **body**: Optional but encouraged. 2-3 bullet points describing what and why. Keep bullets brief.
- **NO trailers**: Never include `Co-Authored-By:` or other git trailers in the message.

**Examples:**
```
feat(favorites): add star/unstar functionality

- allow users to star coins from list
- persist selection to localStorage

fix(auth): correct JWT expiration handling

docs: update CLAUDE.md with environment setup

refactor(api): simplify user service methods
```

### Step 4: Commit

Run git commit with the generated message using a heredoc:

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject

- bullet
- bullet
EOF
)"
```

## Trigger Phrases

Use this skill when you say:
- "write a commit message"
- "generate a commit"
- "commit my changes"
- Or invoke directly with `/commit-msg`
