# Modular Monolith Phase 2 — Automated Boundary Enforcement

## Status

Not Started

## Depends On

Phase 1 completed and its ownership decisions approved.

## Objective

Turn the Phase 1 architecture decisions into automated controls and establish a
safe E2E foundation before module refactoring begins.

## Scope

- Add backend feature-boundary lint rules.
- Add architecture tests.
- Validate Prisma ownership automatically.
- Block new violations while permitting only recorded legacy exceptions.
- Repair the API E2E test command.
- Add isolated test-database safety controls.

Do not migrate business modules or change GraphQL behavior in this phase.

## Goals

- [ ] Convert Phase 1 ownership decisions into automated checks.
- [ ] Block every new undocumented cross-domain dependency.
- [ ] Detect missing, duplicate, or stale Prisma ownership declarations.
- [ ] Prove the bounded-context dependency graph is acyclic.
- [ ] Establish safe API E2E infrastructure using an isolated database.
- [ ] Make all enforcement repeatable locally and in CI.

## Non-goals

- Refactoring feature-module internals.
- Removing all legacy boundary exceptions.
- Changing product behavior or GraphQL operations.
- Introducing a message broker, outbox, or background worker.
- Replacing the existing ESLint, Jest, Prisma, or CI toolchain.

## Deliverables

Create:

```text
apps/api/src/architecture/domain-ownership.spec.ts
apps/api/src/architecture/module-boundaries.spec.ts
apps/api/src/architecture/prisma-ownership.spec.ts
apps/api/test/jest-e2e.json
apps/api/test/setup/
apps/api/test/app.e2e-spec.ts
```

Modify the API ESLint configuration to enforce:

- A feature cannot import another feature's internal service, resolver,
  controller, DTO, entity, repository or utility.
- Approved future cross-domain imports may target only `public/`.
- Infrastructure cannot depend on business features.
- Application workflows may use public APIs but not internals.
- GraphQL entities and Prisma types cannot act as public cross-domain contracts.

Architecture tests must prove:

- Every Prisma model appears exactly once in the ownership manifest.
- Every active feature module is registered.
- Every detected violation has a matching exception.
- No undocumented exception exists.
- The bounded-context dependency graph is acyclic.

The E2E harness must:

- Refuse to run if the database URL matches development or production.
- Apply migrations deterministically.
- Use minimal fixtures.
- Clean data predictably.
- Exercise `/graphql` through HTTP.
- Prove one public query, one protected query and one role rejection.

## Implementation Notes

Prefer TypeScript compiler APIs and repository scripts already supported by the
workspace. Add an architecture dependency only if existing tooling cannot parse
imports reliably.

Legacy exceptions may remain, but CI must fail if:

- A new exception appears
- An exception expands to another file
- A removal phase is missing

## Acceptance Criteria

- [ ] New cross-domain internal imports fail validation.
- [ ] All Phase 1 exceptions are represented exactly.
- [ ] Prisma ownership drift fails a test.
- [ ] The domain dependency graph is automatically checked for cycles.
- [ ] `npm run test:e2e --workspace api` passes.
- [ ] E2E execution cannot target a non-test database.
- [ ] Existing GraphQL schema and generated frontend types do not drift.
- [ ] Common validation gate passes.

## Exit Gate

Phase 3 may start only when CI reliably detects a deliberately introduced
boundary violation and when the E2E suite runs repeatedly against an isolated
database.
