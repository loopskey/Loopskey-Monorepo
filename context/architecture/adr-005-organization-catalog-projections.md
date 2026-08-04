# ADR-005 — Organization may consume Catalog projections

- Status: Accepted
- Date: 2026-08-04
- Deciders: Loopskey engineering

## Context

Organization assignments must synchronously validate Course or Event targets,
and the organization dashboard lists published events that can be assigned.
Direct Prisma reads created Phase 4 exception EXC-015.

## Decision

Allow `organization-management -> learning-catalog` only through explicit
`public/` contracts. Learning Catalog owns assignment-target validation and the
published event projection. Organization retains ownership of assignments and
their recipients.

## Consequences

- Organization no longer depends on Course or Event persistence schemas.
- Catalog lifecycle and visibility rules remain with Learning Catalog.
- The dependency graph remains acyclic; Learning Catalog does not depend on
  Organization.
- Cross-context contracts expose intent and projections, not Prisma or GraphQL
  DTOs.

## Related

- [ADR-002 — Domain boundaries](adr-002-domain-boundaries.md)
- [ADR-003 — Cross-domain communication](adr-003-cross-domain-communication.md)
- [ADR-004 — Engagement may call the Events public port](adr-004-engagement-events-public-port.md)
