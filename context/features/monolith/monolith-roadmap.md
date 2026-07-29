# Modular Monolith Implementation Roadmap

## Status

Not Started

## Purpose

This file is the execution index for converting Loopskey into a governed modular
monolith. The architectural source specification remains
`context/features/monolith/monolith-hardening.md`.

Implement the following features in order. A phase may start only after the
previous phase meets its exit gate and is merged.

## Objective

Provide the authoritative execution order and shared quality gates for the
seven modular-monolith implementation features.

## Scope

- Define phase order and dependencies.
- Link every implementation specification.
- Establish program-wide Git, compatibility, validation, and documentation
  rules.
- Define when the overall modular-monolith program is complete.

## Goals

- [ ] Ensure every phase can be loaded and implemented independently.
- [ ] Prevent phases from starting before their prerequisites pass.
- [ ] Apply one consistent validation gate across the program.
- [ ] Preserve deployability and compatibility after every merged phase.
- [ ] Finish with zero temporary boundary exceptions and an acyclic domain
      graph.

## Non-goals

- Implementing application code directly from this roadmap.
- Replacing the detailed phase specifications.
- Combining all phases into one branch or pull request.
- Authorizing microservice extraction.
- Changing product requirements or frontend design.

## Acceptance Criteria

- [ ] All seven phase specifications exist and are linked in execution order.
- [ ] Every phase defines its own objective, scope, goals, non-goals, acceptance
      criteria, dependencies, and exit gate.
- [ ] Common validation commands are defined.
- [ ] Program rules preserve one API and one PostgreSQL database.
- [ ] Completion requires all phases to be marked Complete.

## Ordered Features

| Order | Feature | Outcome |
| --- | --- | --- |
| 1 | [Phase 1 — Architecture Baseline and Domain Ownership](monolith-ph1-baseline-ownership.md) | Approved bounded contexts, ADRs, model ownership and violation baseline |
| 2 | [Phase 2 — Automated Boundary Enforcement](monolith-ph2-boundary-enforcement.md) | Architecture tests and lint rules prevent new coupling |
| 3 | [Phase 3 — Events Vertical-Slice Pilot](monolith-ph3-events-pilot.md) | One complete module proves the target internal architecture |
| 4 | [Phase 4 — Catalog and Engagement Boundaries](monolith-ph4-catalog-engagement.md) | Catalog, interaction and public-read responsibilities are separated |
| 5 | [Phase 5 — Identity, Organization and Administration](monolith-ph5-identity-organization.md) | Security-sensitive domains communicate through explicit contracts |
| 6 | [Phase 6 — Professional Development Decomposition](monolith-ph6-professional-development.md) | The largest module is separated into coherent internal capabilities |
| 7 | [Phase 7 — Reliability, Storage and Operations](monolith-ph7-reliability-operations.md) | Outbox, storage abstraction, observability and final exception removal |

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
