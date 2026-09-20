# Loopskey monorepo

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
request; it cannot change the active Claude model by itself.

Use `.claude/skills/feature/SKILL.md` for feature work.

## Prisma migrations

Use `prisma migrate deploy` to apply migrations, or `prisma migrate dev
--create-only` to author one. Never run bare `prisma migrate dev`: the GIN
trigram search indexes are hand-written SQL that Prisma cannot see, so it
auto-generates a migration that drops them. Read any generated migration for
stray `DROP INDEX` before applying it.
