# ADR-003 — How contexts talk to each other

- Status: Proposed (awaiting the Phase 1 exit-gate review)
- Date: 2026-07-30
- Deciders: Loopskey engineering

## Context

ADR-002 assigns every model one write owner. That immediately raises the
question the baseline exposed: today a context that needs another context's data
just queries its tables. 27 of 43 recorded violations are exactly that, and 5
more are transactions that commit across a boundary.

The concrete cases that must keep working:

- Approving an organization creates a `User`, an `Organization` and its
  membership in one transaction spanning three contexts.
- Registering for an event creates an `EventRegistration` and increments
  `Event.attendees` — one invariant, currently two contexts.
- Submitting a review recomputes an average and writes it onto four catalog
  tables.
- The admin, provider and professional dashboards each read across three or four
  contexts to render one screen.
- Four services write `AuditLog`, a table owned by administration.
- Registration creates a `User` and its `ProfessionalProfile` or
  `ProviderProfile` in one nested write, so Identity defines what an empty role
  profile contains.

## Decision

Four mechanisms, in order of preference. Nothing else is permitted — in
particular, no internal HTTP/GraphQL/gRPC/broker calls (ADR-001).

### 1. Published contracts (synchronous, in-process)

A context that needs another's behavior calls a **published port**: an interface
plus DTOs exported from the owning module's public surface, injected through
Nest DI.

- The port is an interface, not a concrete service class. Today every module
  exports concrete classes, so `admin` importing
  `AuthOrganizationActivationService` gets Identity's entire internal surface
  (EXC-025).
- Ports expose intent (`provisionOrganizationOwner`), not persistence
  (`updateUserRow`).
- A module's public surface is only what its `exports` array lists. Deep imports
  into another context's `services/`, `dtos/` or `entities/` are violations —
  see EXC-021 and EXC-022, both scheduled for Phase 2.

Use for: a caller that needs a result, or needs the work to fail its own
operation.

### 2. Domain events (asynchronous, in-process now, outbox in Phase 7)

The owner publishes a fact after committing; interested contexts subscribe.
Events are named in the past tense (`OrganizationApproved`), carry identifiers
and immutable values rather than entity references, and must never be used where
the caller needs the outcome synchronously.

Until Phase 7 delivers the outbox, events are best-effort in-process. **A
side-effect that must not be lost may not use an event yet** — this is why
`AuditLog` writes (EXC-007, EXC-008) stay direct until Phase 7 rather than being
converted early into a fire-and-forget listener that silently drops rows.

Use for: notifications, audit, derived counters, projection refresh.

### 3. Read models (queries across contexts)

A context that only needs to _display_ another's data consumes a read model the
owner publishes — an explicit, versioned projection — rather than querying the
owner's tables.

This is the mechanism for the dashboards, and it is the largest category in the
register: EXC-009 through EXC-020 plus EXC-030 through EXC-032. Read models may
be computed on demand at first; materialization is an optimization, not a
requirement.

Read models are read-only by construction. A screen that needs to _change_
another context's data uses mechanism 1.

### 4. Shared kernel (`platform-shared`)

A deliberately small set of genuinely universal concerns: the Prisma client,
pagination shapes, `AuthUser`/`@CurrentUser()`/`@Roles()`/guards, error
formatting.

The bar is high, and matches the rule already in force for
`@loopskey/api-contracts`: more than one context must genuinely consume it
today, and it must be domain-free. `platform-shared` must never become a
dumping ground — a type used by one context belongs to that context.

Two current violations are really misplaced shared-kernel members:
`@auth/decorators/*` and `@auth/guards/*`, used by 32 files across seven
contexts (EXC-024 and EXC-033 to EXC-038), and `@org/dtos/org-pagination.input`
used by `external-learning` (EXC-021). Both are fixed by moving the code to
`platform-shared`, not by deleting the usage.

### Transactions across contexts

The rule: **one transaction, one context.**

Where a workflow currently spans contexts, the owner of the primary invariant
commits its own transaction and everything else follows by event. Organization
approval becomes: Identity provisions the account, Organization provisions the
organization, each in its own transaction, coordinated by events, with a
compensating path for partial failure.

The five `transaction` entries in the register (EXC-039 to EXC-043) are exactly
the places this rule bites, and each names the guarantee at stake.

This is a real reduction in atomicity and must be an explicit decision per
workflow, not a side effect of moving code. Two guarantees that exist today and
must be preserved as guarantees rather than accidents:

- Approving an access request either creates the whole organization or leaves
  the request `PENDING`.
- The concurrent-review guard means exactly one reviewer wins.

Phase 5 owns that workflow and must state, in its own spec, what replaces each
guarantee. Until then the transaction stays intact and the violation stays in
the register — an unowned invariant is worse than a recorded exception.

## Consequences

**Positive**

- Each context can change its schema without breaking another's queries.
- Ports and read models are testable in isolation with a fake instead of a
  database.
- The dependency graph becomes checkable, because dependencies become imports of
  declared contracts rather than incidental table access.

**Negative**

- Indirection: a port plus a DTO plus a mapper where a Prisma call used to do.
  Justified for cross-context calls; not to be applied inside a context.
- Eventual consistency arrives with the outbox, so some screens will read
  slightly stale projections.
- Losing multi-context ACID transactions is the single largest risk in the
  program and is concentrated in Phase 5.

**Neutral**

- Mechanism choice is recorded per exception: the `kind` field on each register
  entry maps to a mechanism — `read` to 3, `write` to 1 or 2, `import` to 4, and
  `transaction` to the one-transaction-one-context rule below.
- The register uses four kinds, not the two the Phase 1 specification first
  named. `import` covers a compile-time dependency with no database access;
  `transaction` covers a `$transaction` whose atomicity spans two contexts. The
  second is deliberately distinct from `write`: the row write and the atomicity
  guarantee are removed by different work, and only the latter forces a decision
  about what replaces the guarantee.

## Related

- [ADR-001 — Modular monolith](adr-001-modular-monolith.md)
- [ADR-002 — Domain boundaries](adr-002-domain-boundaries.md)
- `apps/api/src/architecture/boundary-exceptions.ts`
