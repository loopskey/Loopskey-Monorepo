# Loopskey agent instructions

An npm-workspaces monorepo: a Next.js frontend (`apps/front`), a NestJS backend
(`apps/api`), and shared packages under `packages/`.

Read these two documents before implementing or reviewing code. They hold every
rule; nothing is restated here.

- [`context/project-overview.md`](context/project-overview.md) — architecture,
  domains, data model, stack, repository structure, application boundaries.
- [`context/coding-standards.md`](context/coding-standards.md) — the rules:
  concurrency, comments, tests, workflow, frontend and backend standards, text
  search and indexing, verification, definition of done.

Before feature implementation or review, select the model tier using
[`context/model-selection.md`](context/model-selection.md). It guides the model
request; it cannot change the active model by itself.

## Design & UI Skills

Before touching UI code under `apps/front/src/app/**` or
`apps/front/src/components/{ui,modules,elements,layouts,templates,guards}/`,
read [`DESIGN.md`](DESIGN.md) for aesthetic direction and
[`context/skills-policy.md`](context/skills-policy.md) for which design skill a
task needs and in what order — that file is the single source of truth for
this, not restated here. `DESIGN.md` is inspiration only: this product's real
tokens are the CSS variables in `apps/front/src/app/globals.css`, and they
always win over anything `DESIGN.md` suggests. Skip this section entirely for
backend, API, database, or other non-UI work.

Open anything else under `context/` only when the current task depends on it.
