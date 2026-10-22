# Loopskey monorepo

@AGENTS.md

Use `.claude/skills/feature/SKILL.md` for feature work.

Pick any other skill with [`context/skills-policy.md`](context/skills-policy.md).
It maps task types to skills and lists where this repository overrides them.

## Prisma migrations

Use `prisma migrate deploy` to apply migrations, or `prisma migrate dev
--create-only` to author one. Never run bare `prisma migrate dev`: the GIN
trigram search indexes are hand-written SQL that Prisma cannot see, so it
auto-generates a migration that drops them. Read any generated migration for
stray `DROP INDEX` before applying it.
