# ADR-006 — Provider Management may consume Events projections

- Status: Accepted
- Date: 2026-08-04
- Deciders: Loopskey engineering

## Context

Provider dashboards need Event analytics, attendee lists, event tables, and
owned-event validation. Direct Event and EventRegistration reads created
Phase 4 exception EXC-013.

## Decision

Allow `provider-management -> learning-catalog` only through explicit public
contracts. Events owns the persistence queries and returns provider-oriented
projections. Provider Management continues to own provider profiles, settings,
and promotion requests.

## Consequences

- Provider code no longer depends on Event persistence schemas.
- Event ownership and visibility predicates live with Events.
- The graph remains acyclic because Learning Catalog does not depend on
  Provider Management.
- The contract exposes projections and use-case intent, never Prisma clients or
  GraphQL DTOs.

## Related

- [ADR-003 — Cross-domain communication](adr-003-cross-domain-communication.md)
- [ADR-004 — Engagement may call the Events public port](adr-004-engagement-events-public-port.md)
