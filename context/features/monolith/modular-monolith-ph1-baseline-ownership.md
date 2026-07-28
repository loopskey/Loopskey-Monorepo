# Modular Monolith Phase 1 — Architecture Baseline and Domain Ownership

## Status

Not Started

## Depends On

None.

## Objective

Establish an evidence-based architecture baseline and assign every active
backend module and Prisma model to exactly one bounded context before changing
application behavior.

## Scope

- Inventory module imports and exports.
- Inventory Prisma-model reads and writes per module.
- Identify multi-domain transactions and workflows.
- Approve bounded contexts and their dependency direction.
- Record architectural decisions.
- Create a typed ownership manifest.
- Record all existing violations as temporary exceptions.

No service, resolver, Prisma model, GraphQL operation or runtime behavior should
be refactored in this phase.

## Goals

- [ ] Produce a complete module dependency and Prisma-usage baseline.
- [ ] Assign every active module to one bounded context.
- [ ] Assign every Prisma model to exactly one proposed write owner.
- [ ] Identify every existing cross-domain read, write, transaction, and import.
- [ ] Record approved decisions as ADRs and typed manifests.
- [ ] Give every temporary violation an owner and removal phase.

## Non-goals

- Refactoring business services or moving application files.
- Changing the GraphQL schema or frontend contract.
- Adding database models or migrations.
- Enforcing boundaries in CI; that belongs to Phase 2.
- Creating events, an outbox, workers, or microservices.

## Target Bounded Contexts

1. Identity and Access — `auth`, `user`
2. Learning Catalog — `course`, `events`, `podcast`, `youtube`, `landing`
3. Professional Development — `professional`, `external-learning`
4. Organization Management — `organization`
5. Provider Management — `provider`
6. Engagement — `content-interaction`
7. Platform Administration — `admin`
8. Communications — `mail`
9. Infrastructure — `prisma`, configuration, storage and events

These are proposals. The phase audit must confirm or amend them using actual
model usage and business workflows.

## Deliverables

Create:

```text
context/modular-monolith-baseline.md
context/architecture/README.md
context/architecture/adr-001-modular-monolith.md
context/architecture/adr-002-domain-boundaries.md
context/architecture/adr-003-cross-domain-communication.md
apps/api/src/architecture/domain-ownership.ts
apps/api/src/architecture/boundary-exceptions.ts
```

The baseline report must contain:

- Complete module dependency matrix
- Every Prisma model and its readers/writers
- Proposed owner for every model
- Cross-domain transactions
- Cross-domain internal imports
- Exported concrete services
- Read-model requirements for `admin` and `landing`
- Initial exception count
- Risks and recommended migration order

Each exception must include:

- Unique ID
- Source domain
- Target domain
- Exact files
- Reason
- Read or write classification
- Removal phase

The ownership manifest must remain framework-free and typed with `as const`.

## Decisions Required

- Final owner of `EventRegistration`
- Final owner of wishlist, enrollment, reviews and carts
- Boundary between provider publishing and catalog content
- Ownership of payments and roadmaps
- Which admin and landing queries are legitimate cross-domain read projections

Do not resolve ambiguity by assigning shared ownership. Every model has one
write owner.

## Acceptance Criteria

- [ ] Every active NestJS feature module has one bounded context.
- [ ] All 54 current Prisma models have exactly one proposed owner.
- [ ] Every model reader and writer is recorded.
- [ ] All cross-domain writes are identified.
- [ ] The domain dependency graph is documented.
- [ ] Every current violation has a finite exception record.
- [ ] ADRs explain why microservices are not being introduced.
- [ ] No runtime behavior or public contract changed.
- [ ] Common validation gate passes.

## Exit Gate

The bounded-context map, ownership manifest and violation list must receive
human review before Phase 2. Phase 2 treats these decisions as enforceable
architecture, so unresolved ownership questions block progression.
