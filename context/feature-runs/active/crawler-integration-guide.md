# The crawler integration guide

- Scope: `api`
- Model: `Standard development — a documentation deliverable plus one mechanical drift test and a dev-only sandbox helper; it restates the security-relevant ingestion surface (auth, rate limits, protected fields) so accuracy matters, but changes no contract, migration, or runtime path.`
- Branch: `feature/crawler-integration-guide`
- Base: `f9681ee` (origin/develop)
- Status: `Submitted`

Specification: `context/features/content-ingestion/07-crawler-integration-guide.md`

## Decisions

- **Publication tone.** The spec leaves open whether the guide is public,
  shared with named partners, or internal. It is written for *private sharing
  with a named crawler team*: no internal module, model, or table name appears
  in it; the operational runbook is a separate section aimed at an `ADMIN`, so
  the partner-facing sections can be sent without it.
- **Sandbox sources.** The spec forbids a migration or a production seed. The
  four permanent sandbox sources are created by
  `apps/api/scripts/create-ingestion-sandbox.ts`, a one-shot operator script
  that calls the phase 04 admin service directly and is not wired into any
  deploy step. The runbook documents both the script and the equivalent GraphQL
  mutations.
- **Schemas already ship.** Phase 03/05 committed all four
  `apps/api/docs/schemas/<kind>-ingestion-item.v1.schema.json` files with stable
  `$id`s. This phase does not modify them; the guide references them as the
  local-validation artifact and states plainly that they are deliberately
  permissive (pre-coercion wire shape) while the field tables reflect the
  post-normalisation DTO contract.
- **Documented caps are the shipped caps.** Phase 03 recorded 100 items and a
  1 MiB compressed body as placeholders. They are unchanged in code, so the
  guide publishes them as the confirmed configuration and the drift test binds
  the guide's numbers to the constants.
- **Route inconsistency documented, not fixed.** Course batch reads are
  `GET /v1/ingest/batches/:batchId`; the other three kinds are
  `GET /v1/ingest/<kind>/batches/:batchId`. The guide states this per non-goal
  "document what shipped"; changing it is a separate phase.

## Acceptance

- [ ] Given the guide alone, an outsider authenticates against the sandbox,
      runs a `dryRun` batch, a real batch, and reads its receipt with no
      clarifying question. **Human-in-the-loop acceptance test — cannot be run
      here; left for a real outsider before the guide is sent.**
- [x] Given the published JSON Schema, a valid item validates and an item
      missing `externalId` fails validation locally. Each
      `<kind>-ingestion-item.v1.schema.json` lists `externalId` in `required`
      with `minLength: 1`; the guide's "Validating first" section shows the
      `ajv` invocation.
- [x] Given the example client, it runs unmodified against the sandbox except
      for the credential. `apps/api/docs/examples/ingest-example.mjs` reads the
      credential and base URL from the environment and hard-codes nothing else.
- [x] Given the code table in the guide, every code it lists exists in
      `@loopskey/api-contracts/error-codes` and every ingestion code in the
      package appears in the table.
      `src/modules/ingestion/content-ingestion-guide-drift.spec.ts` parses the
      table out of the Markdown and asserts set equality with
      `IngestionMessageCode`.
- [x] Given the documented rate limits, item cap, and body cap, each matches the
      shipped configuration. The drift spec asserts the guide's numbers against
      `KIND_INGESTION_ITEM_LIMIT`, `KIND_INGESTION_COMPRESSED_BODY_LIMIT_BYTES`,
      `KIND_INGESTION_IDEMPOTENCY_KEY_LIMIT`, and the `IngestionApiKey`
      `rateLimit` / `rateWindowSeconds` schema defaults (600 / 60 s).
- [x] Given each documented field, its required flag, bounds, and null
      semantics match the shipped DTO. Field tables were written from
      `canonical-<kind>.input.ts`; the omit-vs-empty distinction for
      `scheduleItems` / `episodes` / `videos` is stated per kind.
- [ ] Given the runbook, each entry is executed once against the sandbox and
      works as written. **Human-in-the-loop — cannot be run here.**
- [x] The guide contains no real credential and no real crawled value. Every
      example id, URL, and secret is synthetic (`lk_ing_sbxcrs_…`,
      `example.com`, `sandbox-*` slugs).
- [x] `context/project-overview.md` describes the ingestion edge, its REST
      exception, and the `ingestion` module's place in `learning-catalog`.

## Verification

- `npx turbo run lint check-types --filter=api` — pass
- `npx jest src/modules/ingestion` (api unit), 7 suites / 44 tests incl. the new
  `content-ingestion-guide-drift.spec.ts` (5 cases) — pass
- **Live smoke test** against a real running API (Postgres 17 in Docker,
  migrations deployed, `node dist/src/main.js` on :5700):
  - `create-ingestion-sandbox.ts` ran clean — four sources + four keys.
  - 12 `curl` cases against `/v1/ingest/*` all behaved per the guide: anon →
    401 `INGESTION_UNAUTHORIZED`; dryRun receipt (`status: "DRY_RUN"`, writes
    nothing); real course/event/podcast/YouTube batches → `created` with a
    `catalogId` and child rows (2 podcast episodes, 1 video) in the DB;
    `GET /v1/ingest/batches/:id` returns the receipt; replayed `Idempotency-Key`
    returns the same `batchId`; course key on `/event/batches` → 400
    `INGESTION_KIND_MISMATCH`; `providerId` in an item → per-item `rejected`
    with the stated reason; bad `contractVersion` → 400
    `INGESTION_CONTRACT_VERSION_UNSUPPORTED`; missing `Idempotency-Key` → 400
    `INGESTION_IDEMPOTENCY_KEY_REQUIRED`.
  - Fixed during the smoke test — see Notes: sandbox sources need a field map.

## Findings from the live test

- **Fixed in this run.** `create-ingestion-sandbox.ts` originally created sources
  with no field map. An empty `fieldMap` maps nothing, so every field of every
  item lands in `unmappedFields` and the item is rejected — the guide's example
  payloads (canonical field names) would have failed against the sandbox,
  breaking the "runs unmodified against the sandbox" criterion. The script now
  seeds an identity map from each kind's `*_CANONICAL_FIELDS`, and refreshes it
  on re-run; the guide's §8 states the field-map requirement up front. Re-tested:
  the guide's course example now returns `created` against a fresh sandbox.
- **Out of scope for this phase, pre-existing, needs its own fix.** Every
  accepted ingestion item emits the outbox event `ingestion.item.published`,
  which has **no registered handler**, so each one retries to the cap and
  becomes a terminal `OutboxEvent` (`lastError = "No handler for
  ingestion.item.published@1"`, observed at attempt 3–6 during the smoke test).
  Phase 03 emitted it deliberately "for phase 06"; phase 06 shipped reduced and
  never added the consumer. This is a real production defect once ingestion is
  live and belongs to a phase-06 follow-up, not the guide.
- No Markdown linter is configured (root has no markdownlint/remark; `turbo run
  lint` is `eslint src` per package). `context/*.md` and `apps/api/docs/*.md`
  are not prettier-clean in the repo today, so the guide follows the existing
  hand-wrapped ~78-col style rather than being reformatted.
- Scope gate (spec): docs-only change plus one TS drift spec — root/api lint and
  check-types are the gate; no build or browser check required. Met.

## Notes

- `apps/api/tsconfig.check.json` gains `scripts/**/*` in `include` so the new
  operator script is type-checked (it is outside the `nest build` input and the
  `eslint src` lint scope, matching how `benchmark/` scripts are treated).
- Two acceptance criteria are human-in-the-loop by the spec's own wording ("run
  it with a real person"): an outsider integration walkthrough and executing
  each runbook entry once against a live sandbox. They cannot be performed here
  and are the last gate before the guide is sent externally.

## Submission

- Commit: `6b603be`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/88 (base `develop`)
- CI: pass — run 34462529024 (`146d80e`). Re-validated after merging current develop and resolving a one-line `feature-history.md` conflict (PR #89 landed first): run 34467579344 (`767d35a`), pass.
