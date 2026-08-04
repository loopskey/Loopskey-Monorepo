# Outbox operations

The API persists versioned integration events in `OutboxEvent` in the same
Prisma transaction as the originating write. The in-process processor is an
extraction seam: a future `apps/worker` can reuse the processor without changing
producers or the schema.

## Retry, inspection, and replay

- Rows are claimed with `FOR UPDATE SKIP LOCKED`; a one-minute lease makes a
  crashed claim available again.
- Failures use exponential backoff capped at one hour and stop automatically
  after ten attempts. `lastError`, `attemptCount`, and `correlationId` remain
  available for diagnosis.
- A replay operator must first correct the underlying cause, then set
  `processedAt = NULL`, `attemptCount = 0`, `lastError = NULL`, and
  `availableAt = NOW()` for an explicitly selected event ID. Do not bulk replay
  without reviewing whether the event version still has a registered handler.
- `OutboxDelivery` is the idempotency ledger. Do not delete its row when merely
  retrying a processed event; delete it only when intentionally replaying a
  handler whose side effect is independently known to be safe.

Retain processed events and deliveries for 30 days by default. Purge only rows
whose `processedAt` is older than the retention boundary, in bounded batches,
and delete through `OutboxEvent` so delivery rows cascade. Permanently failed
rows (`processedAt IS NULL AND attemptCount >= 10`) are never part of retention
cleanup.

## Payload and privacy policy

Payloads are small commands, not database snapshots. They must not contain
passwords, tokens, cookies, API keys, provider responses, or binary files.
Production logs are JSON, carry correlation IDs where request context exists,
and must pass structured metadata through the recursive secret redactor.

## Storage

`ObjectStoragePort` isolates avatar, PDU, and certificate consumers from the
filesystem. `LocalObjectStorageAdapter` preserves current directories. A later
S3-compatible adapter should implement the same port and change only provider
wiring; production data migration is intentionally outside this phase.

## Health

- `GET /health` is process liveness and performs no dependency I/O.
- `GET /ready` verifies PostgreSQL connectivity and fails when required
  persistence is unavailable.
