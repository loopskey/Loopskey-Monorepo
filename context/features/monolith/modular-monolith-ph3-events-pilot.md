# Modular Monolith Phase 3 — Events Vertical-Slice Pilot

## Status

Not Started

## Depends On

Phase 2 completed.

## Objective

Use the `events` module as a controlled pilot to prove the target modular
architecture before applying it to larger domains.

## Scope

- Separate event transport, application logic, domain rules and persistence.
- Restrict Event-domain Prisma access to its owned models.
- Define a minimal public application API only for confirmed consumers.
- Introduce one same-process versioned domain event.
- Add unit, integration, contract and E2E tests.

Do not redesign event product behavior or split the module into a service.

## Target Structure

```text
apps/api/src/modules/events/
  public/
    events-api.ts
    events-api.token.ts
    index.ts
  application/
    use-cases/
    queries/
  domain/
    events/
    policies/
  infrastructure/
    persistence/
  transport/
    graphql/
  events.module.ts
```

Existing files may move incrementally. Avoid empty abstraction layers.

## Public API Rules

The public API must:

- Represent use cases, not CRUD internals.
- Return minimal projections.
- Avoid Prisma inputs and GraphQL-decorated entities.
- Be injected through a token.
- Exist only for actual cross-domain consumers.

## Pilot Domain Event

Select one fact that has a real consumer, preferably:

```text
EventPublished.v1
```

It must include:

- Event ID
- Provider/owner ID
- Occurred-at time
- Event ID and schema version
- Correlation ID

Do not include complete database rows. Event publication remains in-process in
this phase.

## Tests

- Pure policy tests for event publication/update rules
- Application use-case tests
- Real Prisma integration tests for owned persistence
- Public API contract tests
- E2E tests for authorized create/update/publish and forbidden role access
- Architecture tests proving no Event internal is imported cross-domain

## Acceptance Criteria

- [ ] Event resolvers contain no business or persistence logic.
- [ ] Event writes occur through application use cases.
- [ ] Event Prisma access is isolated behind Event-owned persistence code.
- [ ] Confirmed consumers use the public API.
- [ ] One versioned event has a real tested handler.
- [ ] Event handler failure behavior is explicit.
- [ ] Event-related Phase 1 exceptions are removed.
- [ ] GraphQL behavior remains compatible.
- [ ] Common validation gate passes.

## Exit Gate

Document pilot lessons in `context/architecture/events-pilot-review.md`,
including abstractions to retain, simplify or reject. Phase 4 must use the
reviewed pattern rather than copying the pilot mechanically.

