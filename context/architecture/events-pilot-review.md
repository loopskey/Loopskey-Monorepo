# Events Vertical-Slice Pilot Review

## Pattern proved

The Events pilot separates responsibilities without changing the GraphQL
contract:

- Resolvers remain transport adapters and delegate every operation.
- `EventService` coordinates use cases, ownership, and domain policies.
- `EventRepository` is the only Events class that accesses `PrismaService`.
- `events/public/` exposes one intent-based port for the confirmed Engagement
  consumer; the Nest module exports its token rather than `EventService`.
- `EventPublished.v1` carries identifiers, version, occurrence time, and
  correlation ID. It is emitted after persistence succeeds.

Engagement now asks Events to register or cancel an attendee. The Event
aggregate owns both `EventRegistration` and the attendee counter, so EXC-001 is
removed and the exception count falls from 45 to 44.

## Retain

- Public interfaces plus DI tokens for synchronous cross-context use cases.
- Minimal projections that contain no Prisma or GraphQL types.
- One persistence adapter per owned aggregate.
- Pure domain policies for state-dependent decisions.
- Versioned facts published only after the owning transaction commits.
- Architecture tests that enforce the intended boundary rather than relying on
  folder names alone.

## Simplify before reuse

- Do not require every module to reproduce the exact Events folders. Introduce
  a layer only when it has a real responsibility and test.
- The handler-array provider is sufficient for this pilot but should become a
  small shared in-process event registry only after a second domain proves the
  repeated need.
- Keep query mapping in the repository while it is Event-specific. Introduce
  separate query objects only when query complexity or independent consumers
  justify them.

## Reject for now

- Generic CRUD repositories or a universal base use-case class.
- A broker, worker, or transactional outbox before Phase 7.
- Publishing complete database rows in domain events.
- Treating best-effort handlers as durable delivery. The current dispatcher
  logs a handler failure and does not roll back the already committed Event;
  required side effects must wait for an outbox.
- Mechanical migration of every module merely to match the pilot's directory
  tree.

## Phase 4 guidance

Start with each actual catalog/engagement coupling. Use a synchronous public
port when the caller needs the result, a read projection for display-only data,
and a domain event only for a post-commit side effect that may currently be
best-effort. Add the dependency edge and remove its exception in the same
change so the enforced graph remains truthful and acyclic.
