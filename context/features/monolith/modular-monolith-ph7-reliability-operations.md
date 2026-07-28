# Modular Monolith Phase 7 — Reliability, Storage and Operations

## Status

Not Started

## Depends On

Phase 6 completed.

## Objective

Complete the modular monolith with reliable side effects, storage abstraction,
observability, operational health checks and removal of remaining architecture
exceptions.

## Scope

- Versioned domain-event infrastructure
- Transactional outbox
- Idempotent event processing and retry policy
- Mail delivery through an outbox-backed reaction
- Object-storage port and local adapter
- Structured logging and correlation IDs
- Health/readiness endpoints
- Operational documentation and final architecture review

Creating and deploying `apps/worker` is a separate follow-up feature. Phase 7
must make that extraction straightforward without requiring it.

## Outbox Model

Add `OutboxEvent` through a reviewed Prisma migration with:

- `id`
- `eventName`
- `eventVersion`
- `aggregateType`
- `aggregateId`
- `payload`
- `occurredAt`
- `availableAt`
- `processedAt`
- `attemptCount`
- `lastError`
- `correlationId`

Requirements:

- Business and outbox writes share one transaction.
- Processors claim rows safely under concurrency.
- Handlers are idempotent.
- Failures use bounded retry/backoff.
- Permanently failed rows remain inspectable.
- Retention and replay procedures are documented.
- Payloads exclude secrets and oversized database snapshots.

## Storage

Create or finalize:

```text
apps/api/src/infrastructure/storage/
  object-storage.port.ts
  local-object-storage.adapter.ts
```

Avatar, certificate and PDU evidence services must use the port. Preserve current
local behavior initially; document a later S3-compatible adapter feature.

## Observability

Implement:

- Structured JSON production logs
- Request/correlation ID
- Domain and use-case context
- GraphQL operation timing
- Outbox attempt/failure metrics
- Health endpoint for process liveness
- Readiness checks for required infrastructure
- Secret redaction policy

## Final Cleanup

- Remove all expired temporary boundary exceptions.
- Classify any remaining cross-domain reads as explicit permanent projections.
- Confirm domain graph acyclicity.
- Update README, project overview and coding standards.
- Record before/after architecture metrics.
- Create `context/architecture/modular-monolith-final-review.md`.

## Acceptance Criteria

- [ ] Outbox writes are atomic with originating business writes.
- [ ] Duplicate delivery does not duplicate side effects.
- [ ] Failed mail delivery is retryable and does not roll back business state.
- [ ] Storage consumers contain no direct filesystem business dependency.
- [ ] Health and readiness endpoints are tested.
- [ ] Logs carry correlation IDs and redact secrets.
- [ ] No temporary architecture exception remains.
- [ ] Permanent read projections are documented and read-only.
- [ ] Domain dependency graph is acyclic.
- [ ] Before/after metrics and final review are published.
- [ ] All common validation commands pass with no schema or migration drift.

## Program Exit Gate

Mark the roadmap complete only after the final review confirms that domain
ownership, dependency rules, public contracts, critical workflows and
operational behavior are explicit and automatically verifiable.

Any future microservice proposal must use the decision gate in
`modular-monolith-hardening.md` and provide measured operational evidence.

