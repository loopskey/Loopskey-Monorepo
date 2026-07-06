---
name: project-quality
description: Verify Loopskey changes before finishing. Use when the user asks for checks, quality pass, validation, final review, regression scan, or when work touches build-sensitive areas such as API, frontend, GraphQL, Prisma, auth, or generated artifacts.
---

# Project Quality

## Verification Strategy

Pick the narrowest meaningful checks for the change. Do not run expensive broad checks when a targeted one is enough, but do not skip checks for auth, Prisma, GraphQL, or shared frontend behavior.

## Check Matrix

API changes:

```bash
npm run build --workspace api
npm test --workspace api
```

Frontend changes:

```bash
npm run build --workspace front
npm run lint --workspace front
```

GraphQL contract changes:

```bash
npm run codegen --workspace front
npm run build --workspace api
npm run build --workspace front
```

Root-wide confidence:

```bash
npm run build
npm run lint
```

## Manual Review

- Check `git diff --stat` and `git diff` before finalizing.
- Confirm generated files changed only when expected.
- Confirm `.env` values and secrets were not added to commits or output.
- Confirm i18n files are both updated for visible text.
- Confirm role-specific dashboards and guards were not weakened.

## Final Report

State which checks passed, which were not run, and why. Mention residual risk plainly.
