# Roadmap AI Service — vendored contract

`roadmap-openapi.json` in this folder is the **provider's** OpenAPI document,
committed here verbatim. The Roadmap AI Service is operated by a separate team
and is not part of this monorepo, so this file is the only version of the
contract that `apps/api` builds against.

## Rules

- **Never hand-edit `roadmap-openapi.json`.** It is a copy of what the provider
  published. If something in it is wrong, the fix belongs on their side and a
  new copy replaces this one.
- Replacing it is a reviewed change. Regenerate the client types in the same
  commit, so the diff shows both the contract change and its consequences.
- Record the contract version below whenever the copy is replaced. `apps/api`
  compares this value with the version the live service reports.

## Generated from this file

`src/infrastructure/service-ai/generated/service-ai.types.ts` — regenerate with
`npm run codegen --workspace api`. A test fails when regeneration produces a
diff, so a provider change cannot land silently.

## Current copy

| Field | Value |
| ----- | ----- |
| Contract version | 1.1.0 |
| OpenAPI | 3.1.0 |
| Auth | HTTP Bearer |
| Operations | `POST /v1/roadmap/chat-turn`, `POST /v1/roadmap/generate` |
| Ops endpoints | `GET /health`, `GET /ready` (both unauthenticated), `GET /internal/stats` (Bearer) |
| Base address | not declared in the document — configuration supplies it |

## Enum alignment, as of 1.1.0

1.1.0 adopted this platform's own enum values. All five enums now match member
for member, and `service-ai.translation.ts` maps each one to itself in both
directions.

| Enum | Members | Translation |
| ---- | ------- | ----------- |
| `SkillLevel` | 4 | identity |
| `TimeCommitment` | 5 | identity |
| `BudgetPreference` | 4 | identity |
| `LearningFormat` | 6 | identity |
| `ContentType` | 4 | identity |

**The translation layer stays even though every table is identity.** The two
vocabularies are separate type universes that currently coincide;
`Record<Platform…, Provider…>` is what stops compiling if the provider narrows
an enum again, which is a better failure than a runtime 422.

1.1.0 was breaking, not additive: it **removed** the 1.0.0 spellings
`FOUR_TO_SEVEN_HOURS`, `EIGHT_PLUS_HOURS`, `LOW_COST` and `NO_PREFERENCE`. A
consumer still sending those gets `422 VALIDATION_ERROR`. Nothing here stored
provider spellings — draft columns are Prisma enums and translation happens at
the boundary — so no migration was needed.

## Known gaps against this platform, as of 1.1.0

- **Budget is not a price tier.** Only `FREE_ONLY` selects content; it removes
  every candidate whose `is_free` is false. `MIXED_FREE_AND_PAID`, `PREMIUM`
  and `EMPLOYER_SPONSORED` are recorded and reach the planner as context but
  filter nothing, and behave identically to one another. Do not read `PREMIUM`
  as "prefer paid" or `EMPLOYER_SPONSORED` as a raised ceiling.
- **`ContentCandidate.level` does not accept `MIXED`,** which this platform's
  catalogue stores. Map it to `null` on the way out. A single `MIXED` item
  rejects the whole `generate` request with a 422, not just that candidate.
- **`CpdContext` still carries no per-category breakdown.** The provider has
  agreed to add one; unchanged from 1.0.0.
- **`ErrorResponse.code` is an unconstrained string,** not an enum, so the set
  of codes is documentation rather than contract. The provider adds codes
  without a contract version change, which is why `service-ai.failure.ts`
  branches on `retryable` and treats an unrecognised code as non-retryable.

## Limits the document declares

Extracted into `SERVICE_AI_LIMITS` by the generator, not copied by hand. The
ones that bite: 12 history messages, 2000 characters per user message, 100
subject options, 50 candidates per generate, 5 subjects, 6 formats, 4 content
types, 8 phases.

Time budgets are 30s for chat and 70s for generate, so the client timeout must
sit above 75s or it cuts the service off before the service gives up.
