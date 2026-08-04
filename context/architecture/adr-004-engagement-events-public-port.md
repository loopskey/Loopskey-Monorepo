# ADR-004 — Engagement may call the Events public port

- Status: Accepted
- Date: 2026-08-03
- Deciders: Loopskey engineering

## Context

ADR-002 initially allowed Engagement to depend only on `platform-shared`, while
also assigning `EventRegistration` and the Event attendee counter to Learning
Catalog. That left Engagement as a foreign writer under EXC-001. Phase 3 cannot
remove the foreign write unless Engagement can ask the owning context to perform
the registration use case.

## Decision

Allow the directed dependency `engagement -> learning-catalog`, but only through
Learning Catalog's enforced `public/` contracts. The first contract is the
Events API for enrolling in and cancelling an event. It exposes intent and a
minimal projection; it exposes no Prisma, GraphQL, entity, or DTO internals.

The reverse dependency is not allowed, so the graph remains acyclic. Direct
imports of Learning Catalog internals and direct access to its Prisma models
remain violations.

## Consequences

- Event registration and attendee-count invariants have one writer.
- Engagement can complete a synchronous request and receive its result without
  internal HTTP or a broker.
- The dependency is broader at the context level than the one Events use case;
  architecture tests therefore continue to enforce the smaller `public/`
  surface at file level.

## Related

- [ADR-002 — Domain boundaries](adr-002-domain-boundaries.md)
- [ADR-003 — Cross-domain communication](adr-003-cross-domain-communication.md)
- `apps/api/src/architecture/domain-ownership.ts`
- `apps/api/src/modules/events/public/`
