# Modular Monolith Phase 6 — Professional Development Decomposition

## Status

Not Started

## Depends On

Phase 5 completed and security review accepted.

## Objective

Decompose the large `professional` module into coherent internal capabilities
while retaining one Professional Development bounded context and one deployment.

## Scope

- Separate the existing Professional module into coherent internal
  capabilities.
- Establish explicit ownership and workflows between those capabilities.
- Remove direct writes to Catalog, Engagement, Identity, and Organization data.
- Preserve professional GraphQL and REST contracts.
- Prepare evidence operations to depend on a storage port.
- Add focused tests for ownership, calculations, transactions, and failures.

## Goals

- [ ] Document and enforce ownership for every Professional capability.
- [ ] Remove undocumented internal cycles and cross-capability writes.
- [ ] Route foreign-domain operations through approved contracts.
- [ ] Keep overview and calendar services read-only.
- [ ] Preserve authenticated-owner derivation on every operation.
- [ ] Place file operations behind a storage port.
- [ ] Remove all Professional-related temporary boundary exceptions.
- [ ] Cover critical Professional workflows with unit, integration, and E2E
      tests.

## Non-goals

- Extracting Professional capabilities as independently deployed services.
- Redesigning professional dashboards or user-facing workflows.
- Replacing current CPD/PDU calculation rules without a separate specification.
- Migrating files to S3-compatible storage; Phase 7 provides the final adapter
  boundary and migration readiness.
- Introducing event sourcing or database-per-capability.

## Internal Capabilities

Harden in this order:

1. Profile, credentials and settings
2. PDU activities and evidence
3. CPD plans and categories
4. Certificates and evidence
5. Roadmaps and enrollments
6. Professional catalog/course projections
7. External learning
8. Payments
9. Overview and calendar read models

These are internal capability boundaries, not separate microservices.

## Target Rules

- Each capability owns its application use cases and persistence access.
- Cross-capability writes use an explicit Professional Development workflow.
- Overview and calendar services are read models and do not mutate aggregates.
- Professional catalog views do not write Catalog-owned models directly.
- Completion/enrollment interactions respect Engagement ownership.
- Evidence storage is accessed through a port prepared for Phase 7.
- Ownership always derives from the authenticated user, never client-supplied
  user IDs.

## Suggested Structure

```text
modules/professional/
  public/
  profile/
  pdu/
  cpd-plan/
  certificate/
  roadmap/
  payment/
  queries/
  professional.module.ts
```

Each capability may contain `application`, `domain`, `infrastructure` and
`transport` subdirectories where their size justifies it. Do not introduce
ceremonial directories with no behavior.

## Required Workflows

- Record content completion as professional progress.
- Link/unlink a certificate to an owned CPD plan.
- Upload/remove evidence while keeping database metadata consistent.
- Enroll in a roadmap.
- Record external learning and PDU implications.
- Generate overview/calendar projections without foreign writes.

## Tests

- Ownership and cross-user rejection
- CPD/PDU calculation policies
- Certificate status boundaries
- Cross-capability transaction behavior
- File metadata consistency on storage failure
- Engagement/catalog contract tests
- Existing professional GraphQL E2E journeys

## Acceptance Criteria

- [ ] The module has documented internal capability ownership.
- [ ] No capability bypasses another capability's write rules.
- [ ] Foreign domain writes use approved public APIs/workflows.
- [ ] Read models perform no aggregate writes.
- [ ] Cross-user access remains rejected on every tested surface.
- [ ] File operations depend on a storage port interface.
- [ ] Professional-related Phase 1 exceptions are removed.
- [ ] Existing professional GraphQL contracts remain compatible.
- [ ] Unit, integration and E2E tests cover critical workflows.
- [ ] Common validation gate passes.

## Exit Gate

The Professional Development module must have no undocumented internal cycles or
foreign writes. Record the completed dependency map before Phase 7.
