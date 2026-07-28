# Modular Monolith Phase 4 — Catalog and Engagement Boundaries

## Status

Not Started

## Depends On

Phase 3 completed and pilot review approved.

## Objective

Apply the validated module pattern to the Learning Catalog, Engagement,
Provider-facing publishing boundaries and public landing read models.

## Scope

Harden in this order:

1. `course`
2. `podcast`
3. `youtube`
4. `content-interaction`
5. Provider-to-catalog publishing interactions
6. `landing` cross-domain read models

`events` is already completed by Phase 3.

## Ownership Requirements

- Catalog domains own their content lifecycle and publication rules.
- Provider Management owns provider profiles and settings.
- Engagement owns wishlist, enrollment, reviews and carts as approved in
  Phase 1.
- Landing owns no foreign aggregate writes.
- Landing queries use explicit projections/query services.
- A provider identifier on content does not grant Provider Management permission
  to bypass catalog business rules.

## Deliverables

For each hardened module:

- Application use cases and query services
- Owned persistence adapter/repository
- Minimal public API when required
- Removal of direct foreign-owned writes
- Updated ownership and exception manifests
- Architecture, unit and integration tests

Create cross-content abstractions only for proven shared behavior. Do not force
Course, Event, Podcast and YouTube into one oversized generic content model.

## Cross-Domain Workflows

Document and implement explicit workflows for:

- Provider publishes content
- Professional enrolls in content
- Professional adds/removes a wishlist item
- Professional submits a review
- Landing retrieves mixed published content

Use synchronous APIs for validation required to complete a request. Events may
handle non-critical reactions after successful publication or enrollment.

## Acceptance Criteria

- [ ] Catalog lifecycle writes are owned by their catalog module.
- [ ] Engagement writes only Engagement-owned models.
- [ ] Provider code cannot directly mutate catalog-owned models.
- [ ] Landing performs no foreign aggregate writes.
- [ ] Mixed landing queries use documented read projections.
- [ ] No generic content abstraction weakens domain-specific validation.
- [ ] All Phase 4 boundary exceptions are removed.
- [ ] Existing frontend GraphQL operations remain compatible.
- [ ] Critical publishing and engagement paths have E2E coverage.
- [ ] Common validation gate passes.

## Exit Gate

The catalog/engagement dependency graph must be acyclic and all writes must have
one enforceable owner before security-sensitive Identity work begins.

