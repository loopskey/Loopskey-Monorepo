---
name: graphql-sync
description: Keep Loopskey GraphQL API and frontend in sync. Use when changing GraphQL resolvers, DTOs, object types, enums, schema.gql, frontend .graphql documents, generated.ts, RTK Query endpoints, or codegen behavior.
---

# GraphQL Sync

## Workflow

1. Start from the API contract: inspect resolver, DTO, entity, enum, and service changes in `apps/api/src/modules`.
2. Confirm schema output path from `GRAPHQL_SCHEMA_PATH`; default is `apps/api/src/graphql/schema.gql`.
3. Update frontend documents in `apps/front/src/lib/graphql/documents/*.graphql`.
4. Run:

```bash
npm run codegen --workspace front
```

5. Update RTK endpoints under `apps/front/src/lib/rtk/endpoints`.
6. Update hooks/components to consume the generated operation types and documents.
7. Check cache tags in `baseApi.ts` and endpoint invalidation/provides behavior.

## Guardrails

- Do not manually edit `apps/front/src/lib/graphql/generated.ts`.
- Keep enum names and values consistent across Prisma, API GraphQL entities, frontend filters, route helpers, and i18n labels.
- Preserve `credentials: "include"` and refresh-token retry behavior in `graphqlBaseQuery`.
- Treat removed fields as breaking changes: search the whole frontend before deleting or renaming.

## Verification

```bash
npm run build --workspace api
npm run codegen --workspace front
npm run build --workspace front
```
