# Architecture Decision Records

This directory holds the architectural decisions governing the Loopskey backend.
An ADR records a decision that is expensive to reverse, together with the
evidence and the trade-off accepted at the time.

## Index

| ADR                                             | Title                                       | Status   |
| ----------------------------------------------- | ------------------------------------------- | -------- |
| [001](adr-001-modular-monolith.md)              | Keep one deployable modular monolith        | Proposed |
| [002](adr-002-domain-boundaries.md)             | Bounded contexts and single write ownership | Proposed |
| [003](adr-003-cross-domain-communication.md)    | How contexts talk to each other             | Proposed |
| [004](adr-004-engagement-events-public-port.md) | Engagement calls the Events public port     | Accepted |
| [005](adr-005-organization-catalog-projections.md) | Organization consumes Catalog projections | Accepted |
| [006](adr-006-provider-events-projections.md) | Provider Management consumes Events projections | Accepted |

All three are **Proposed** until the Phase 1 exit-gate review accepts them.
Phase 2 treats them as enforceable architecture, so they must be accepted or
amended before Phase 2 starts.

## The rest of the architecture record

| Artifact                                             | What it is                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `context/modular-monolith-baseline.md`               | The measured evidence: dependency matrix, model readers/writers, transactions, risks |
| `apps/api/src/architecture/domain-ownership.ts`      | Typed manifest — contexts, module map, model owners, allowed dependency direction    |
| `apps/api/src/architecture/boundary-exceptions.ts`   | Every violation that exists today, with a removal phase                              |
| `apps/api/src/architecture/domain-ownership.spec.ts` | Drift tests that keep the manifests honest against Prisma and the filesystem         |
| `context/features/monolith/monolith-roadmap.md`      | Execution order for the seven phases                                                 |

The manifests are the enforceable form of ADR-002 and ADR-003. If a document and
a manifest disagree, the manifest is what tooling reads — fix the manifest, then
the prose.

## Writing a new ADR

Use the next free number and follow the existing shape: Context, Decision,
Consequences (positive, negative, neutral), Related. State what was measured, not
what was assumed — every claim in ADR-001 and ADR-002 traces to a file path in
the baseline report.

Status is one of `Proposed`, `Accepted`, `Superseded by ADR-NNN`, or
`Deprecated`. Never edit an accepted ADR to change its decision; write a new one
that supersedes it, so the reasoning trail survives.

## Rules that follow from these ADRs

- One NestJS API, one GraphQL endpoint, one PostgreSQL database.
- Every Prisma model has exactly one write owner (ADR-002).
- Cross-context access goes through a published contract, a domain event, a read
  model, or `platform-shared` — never a direct table read (ADR-003).
- One transaction never spans two contexts.
- No internal HTTP, GraphQL, gRPC or broker calls between modules.
- A new boundary violation is a build failure from Phase 2 onward. Adding an
  entry to the exception register to silence it is not permitted; the register
  only shrinks.
- Engagement may depend on Learning Catalog only through an enforced `public/`
  contract (ADR-004); the reverse dependency remains forbidden.
