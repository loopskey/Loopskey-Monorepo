---
name: api-feature
description: Build or modify Loopskey backend features in apps/api. Use when adding or changing NestJS modules, GraphQL resolvers, DTOs, entities, services, guards, mail behavior, external integrations, or API-side business logic.
---

# API Feature

## Workflow

1. Read `CLAUDE.md`, then inspect the relevant module under `apps/api/src/modules`.
2. Follow the existing module shape: `dtos`, `entities`, `enums`, `resolvers`, `services`, `types`, and `<feature>.module.ts`.
3. Keep resolvers thin. Put business rules, Prisma queries, and integration logic in services.
4. Use existing path aliases from `apps/api/tsconfig.json` instead of deep relative imports.
5. Use class-based GraphQL types and DTOs with `@ObjectType`, `@InputType`, `@ArgsType`, `@Field`, and `class-validator`.
6. Respect global guards: add `@Public()` only for intentionally unauthenticated endpoints and `@Roles(...)` for role-scoped behavior.
7. Use `PrismaService` from `@prisma/prisma.service`; do not instantiate Prisma clients directly.
8. Update GraphQL schema and frontend artifacts when resolver inputs, outputs, names, or enums change.

## Module Checklist

- Register new providers/resolvers in the module file.
- Export services only when another module needs them.
- Add enum registration where local patterns require GraphQL enum exposure.
- Prefer existing pagination, cursor, filter, and search result types from nearby modules.
- Keep API errors consistent with the existing service style.
- Avoid weakening auth to make frontend calls pass.

## Verification

Run the narrowest useful checks:

```bash
npm run build --workspace api
npm test --workspace api
```

If GraphQL documents or frontend types are affected, also run:

```bash
npm run codegen --workspace front
```
