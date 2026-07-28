# Modular Monolith Implementation Roadmap

## Status

Not Started

## Purpose

This file is the execution index for converting Loopskey into a governed modular
monolith. The architectural source specification remains
`context/features/modular-monolith-hardening.md`.

Implement the following features in order. A phase may start only after the
previous phase meets its exit gate and is merged.

## Ordered Features

| Order | Feature | Outcome |
| --- | --- | --- |
| 1 | [Phase 1 — Architecture Baseline and Domain Ownership](modular-monolith-ph1-baseline-ownership.md) | Approved bounded contexts, ADRs, model ownership and violation baseline |
| 2 | [Phase 2 — Automated Boundary Enforcement](modular-monolith-ph2-boundary-enforcement.md) | Architecture tests and lint rules prevent new coupling |
| 3 | [Phase 3 — Events Vertical-Slice Pilot](modular-monolith-ph3-events-pilot.md) | One complete module proves the target internal architecture |
| 4 | [Phase 4 — Catalog and Engagement Boundaries](modular-monolith-ph4-catalog-engagement.md) | Catalog, interaction and public-read responsibilities are separated |
| 5 | [Phase 5 — Identity, Organization and Administration](modular-monolith-ph5-identity-organization.md) | Security-sensitive domains communicate through explicit contracts |
| 6 | [Phase 6 — Professional Development Decomposition](modular-monolith-ph6-professional-development.md) | The largest module is separated into coherent internal capabilities |
| 7 | [Phase 7 — Reliability, Storage and Operations](modular-monolith-ph7-reliability-operations.md) | Outbox, storage abstraction, observability and final exception removal |

## Program Rules

- Keep one NestJS API, one GraphQL endpoint and one PostgreSQL database.
- Do not add internal HTTP, GraphQL, gRPC or broker calls between modules.
- Do not combine phases into one large pull request.
- Preserve GraphQL behavior unless a separate contract change is approved.
- Every phase must reduce or preserve the boundary-exception count; it may never
  increase silently.
- Existing user changes and unrelated worktree files must remain untouched.
- Update `context/project-overview.md` after each phase to describe the actual
  implemented state.

## Common Validation Gate

Every phase must run:

```bash
npm run lint
npm run check-types
npm run test
npm run build
npm run codegen
npx prisma validate --schema apps/api/prisma/schema.prisma
git diff --check
```

From Phase 2 onward, also run:

```bash
npm run test:e2e --workspace api
```

When Prisma changes:

```bash
npx prisma migrate status --schema apps/api/prisma/schema.prisma
```

When GraphQL changes, regenerate and commit both `schema.gql` and
`apps/front/src/lib/graphql/generated.ts`.

## Completion

The program is complete only when all seven feature files are marked Completed,
all architecture exceptions are resolved or explicitly accepted as permanent
read projections, and the final architecture review confirms that the
bounded-context dependency graph is acyclic.

