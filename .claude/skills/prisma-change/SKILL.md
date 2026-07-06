---
name: prisma-change
description: Safely change Loopskey database models, enums, relationships, migrations, seeds, and Prisma-backed services. Use when editing apps/api/prisma/schema.prisma, migrations, seed data, Prisma queries, or persisted domain behavior.
---

# Prisma Change

## Workflow

1. Inspect `apps/api/prisma/schema.prisma` and the services that read/write the affected model.
2. Map downstream impact: GraphQL entities/DTOs, frontend documents, generated types, filters, dashboards, seeds, and tests.
3. Make the schema change in `schema.prisma`.
4. Create a migration with Prisma. Prefer a descriptive migration name.
5. Regenerate Prisma Client if the migration flow did not do it automatically.
6. Update seed files in `apps/api/prisma/seed.ts` or `apps/api/prisma/seeds/` when needed.
7. Update API services and GraphQL types.
8. Use `graphql-sync` if frontend contracts changed.

## Guardrails

- Do not hand-edit existing migrations unless repairing a local uncommitted migration before it has been shared.
- Be careful with enum value renames; they affect persisted data and generated GraphQL types.
- Consider nullability and defaults before adding required fields.
- Preserve relational integrity and cascade behavior intentionally.
- Avoid broad seed rewrites unrelated to the requested change.

## Verification

```bash
npm run build --workspace api
npm test --workspace api
```

If GraphQL/frontend contracts changed:

```bash
npm run codegen --workspace front
npm run build --workspace front
```
