# Repository Documentation

> Source: `context/monorepo-audit.md` — **MONO-16**. No prerequisite.
> Cheap; can be done at any point.

## Objective

The first file a new contributor opens is actively wrong about the package
manager and the directory layout.

`README.md` is UTF-16LE-encoded, renders as mojibake in every normal tool, and
describes a repository that does not exist.

## Status

Not Started

## Goals

- Rewrite `README.md` as UTF-8, accurate and short.
- Point readers at `context/` for depth rather than duplicating it.
- Correct two stale "Known Constraints" entries in
  `context/project-overview.md`.

## Evidence

Raw bytes render as:

```text
# =؀�  C o u r s e   P l a t f o r m   M o n o r e p o
```

Its content claims:

- a `packages/prisma/` and `packages/common/` layout — **neither has ever
  existed**;
- **pnpm** as the recommended package manager — the repository uses npm 10.8.1
  and declares `"packageManager": "npm@10.8.1"`;
- three roles (`ADMIN`, `PROFESSIONAL`, `provider`) — there are **four**, and
  `ORGANIZATION` is missing;
- no mention of `apps/front`, Turborepo, or the GraphQL codegen workflow.

### The two stale context notes

`context/project-overview.md` under "Known Constraints and Technical Debt" states:

1. *"The root Turbo graph declares `check-types`, but workspace packages do not
   currently expose matching `check-types` scripts."* — **Both now do**
   (`apps/front/package.json:11`, `apps/api/package.json:16`) and
   `npm run check-types` passes.
2. *"The frontend `lint` script uses `next lint`, which is no longer the
   preferred Next.js 16 lint entry point."* — `apps/front/package.json:10` now
   reads `"lint": "eslint src"` and `npm run lint` passes.

Both were fixed by commit `8f66b6e`. The related claim, repeated throughout
`current-feature.md`, that the API workspace has no ESLint 9 flat config is also
false — `apps/api/eslint.config.mjs` exists and works.

## Scope

### In scope

- `README.md`, rewritten in UTF-8.
- The two "Known Constraints" corrections in `context/project-overview.md`.
- Correcting the API-has-no-ESLint-config claim where it appears in
  `context/project-overview.md`.

### Out of scope

- Rewriting `context/project-overview.md` wholesale — it is accurate and
  well-maintained apart from the noted entries.
- Editing the `## History` entries in `context/current-feature.md`. Those are a
  dated log of what was believed at the time; correcting history retroactively
  destroys its value. The corrections belong in the living documents.
- Adding architecture diagrams or extended documentation.

## Suggested README contents

Keep it short. `context/project-overview.md` already does the long form well.

- What Loopskey is, in two or three sentences.
- The four roles.
- Prerequisites: Node, npm 10.8.1, PostgreSQL.
- Install and the four root commands (`dev`, `build`, `lint`, `check-types`),
  plus `test` if MONO-09 has landed.
- Per-workspace commands, including `codegen`.
- The `apps/` layout as it actually is.
- A pointer to `context/` for architecture, coding standards, and workflow.

Do not restate the coding standards or the data model — link to them.

## Verification

- `file README.md` reports UTF-8, and the file renders correctly on GitHub and in
  a plain editor.
- Every command listed in the README is executed and confirmed to work. This is
  the actual test: a README that lists a command nobody ran is how the current
  one got wrong.
- No reference remains to pnpm, `packages/prisma`, or `packages/common`.
- All four roles are named.
- `git diff --check` is clean.

## Risks

None. No application code is touched.

One caution: if this feature is done *before* the roadmap items, the README will
describe a repository with no `packages/` and no CI, and will need updating
again. That is fine — an accurate document that needs updating beats an
inaccurate one — but consider doing it last if the roadmap is being worked
through continuously.

## Acceptance Criteria

- `README.md` is valid UTF-8 and renders correctly.
- Every command it lists has been run and works.
- The pnpm and `packages/` claims are gone; all four roles are named; `apps/front`
  and Turborepo are described.
- The two stale "Known Constraints" entries and the ESLint-config claim in
  `context/project-overview.md` are corrected.

## History

<!-- Keep this updated. Earliest to latest -->
