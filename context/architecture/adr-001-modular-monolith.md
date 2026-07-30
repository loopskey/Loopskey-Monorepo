# ADR-001 — Keep one deployable modular monolith

- Status: Proposed (awaiting the Phase 1 exit-gate review)
- Date: 2026-07-30
- Deciders: Loopskey engineering
- Supersedes: none

## Context

Loopskey runs as one NestJS API against one PostgreSQL database, with 14 feature
modules and 54 Prisma models. The Phase 1 baseline
(`context/modular-monolith-baseline.md`) measured how those modules actually
depend on each other rather than how the folder layout suggests they do, and the
result reframes the problem:

- **The module graph is nearly empty.** Across ~40 exported services, exactly
  four cross-context service injections exist in the entire application:
  `MailService` into `auth`, `organization` and `admin`, and
  `AuthOrganizationActivationService` into `admin`.
- **The coupling is in the database.** 27 of the 43 recorded violations are
  direct Prisma reads and writes into another context's tables, and 5 more are
  transactions whose atomicity spans two contexts. Fourteen models are written by
  a context that does not own them, and three contexts can each create the same
  role profile.
- **Nothing is distributed yet.** There is one process, one schema, one
  transaction boundary, and no message broker, queue or worker.

So the question this ADR answers is not "monolith or microservices" in the
abstract. It is: given coupling that lives almost entirely at the database
layer, what topology makes that coupling cheapest to fix?

## Decision

Loopskey stays a **single deployable modular monolith**: one NestJS process, one
GraphQL endpoint, one PostgreSQL database. Boundaries are enforced _inside_ the
process — by an ownership manifest, architecture tests and lint rules — not by
network hops.

No internal HTTP, GraphQL, gRPC or broker call may be introduced between
modules. Modules communicate through in-process published contracts, and (from
Phase 7) an outbox for asynchronous work.

## Why not microservices

Extracting services would make the current problems worse rather than better:

1. **It would convert compile-time errors into runtime errors.** Every violation
   in the register is caught today by TypeScript and Prisma. Behind a network
   boundary the same mistake becomes a 500 in production.
2. **The transactional workflows would have to be rewritten first anyway.**
   Organization approval writes `User`, `Organization`, `OrganizationProfile`,
   `OrganizationSettings`, `OrganizationMember`, `OrganizationAccessRequest` and
   `AuditLog` in one `$transaction`. Splitting the owning contexts turns that
   into a distributed saga with compensation. That work — separating the
   invariants — is precisely Phases 3 to 7. Doing it in a monolith is the same
   work minus the failure modes.
3. **There is no scaling pressure pointing that way.** No module has a
   distinct load profile, availability target or release cadence today.
4. **Team size does not justify it.** Independent deployability buys team
   autonomy. The repository shows a small team on one release train.
5. **A shared database would survive the split.** Since the coupling is in the
   schema, extracting services without first assigning model ownership produces
   distributed services on a shared database — the worst of both models.

The honest summary: the monolith is not the problem. Unowned data is. Fixing
ownership is a prerequisite for extraction, so it is worth doing whether or not
extraction ever happens.

## Consequences

**Positive**

- Refactors stay atomic and type-checked; a boundary change is one PR.
- Multi-model workflows keep real ACID transactions during the migration.
- Boundary violations can be made build-breaking (Phase 2) with no runtime cost.
- Extraction stays available later: after Phase 7 each context owns its models
  and talks through published contracts, which is the actual precondition.

**Negative**

- Enforcement is advisory unless tooling backs it. Nothing stops
  `this.prismaService.user.update()` from any file today — hence Phase 2.
- One deployment unit means one blast radius and one release cadence.
- The shared Prisma client makes cross-domain access convenient, so discipline
  must be automated rather than remembered.

**Neutral**

- Ownership is recorded in `apps/api/src/architecture/domain-ownership.ts`, which
  is framework-free so tooling can read it without booting Nest.

## Related

- [ADR-002 — Domain boundaries](adr-002-domain-boundaries.md)
- [ADR-003 — Cross-domain communication](adr-003-cross-domain-communication.md)
- `context/modular-monolith-baseline.md`
- `context/features/monolith/monolith-roadmap.md`
