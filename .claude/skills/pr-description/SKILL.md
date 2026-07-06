---
name: pr-description
description: Draft a professional pull request description for Loopskey changes. Use when the user asks for PR text, pull request summary, merge request description, review notes, release notes, or a description based on local diffs/commits.
---

# PR Description

## Workflow

1. Inspect context:

```bash
git status --short
git diff --stat
git diff
git log --oneline -5
```

2. Prefer staged or branch diffs when the user names a scope.
3. Identify affected areas: API, frontend, GraphQL/codegen, Prisma, auth/RBAC, i18n, tests.
4. Write a concise PR body that reviewers can scan quickly.
5. Do not invent tests or screenshots. If not run, say `Not run`.

## Template

```markdown
## Summary
- 

## Changes
- 

## Testing
- 

## Notes
- 
```

Omit `Notes` when there is nothing useful to add.

## Review Focus

Call out risky areas explicitly:

- Auth, roles, cookies, or guards.
- Prisma schema or migrations.
- GraphQL schema, generated types, or RTK endpoints.
- Dashboard permissions or role navigation.
- i18n coverage.
