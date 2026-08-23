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
| Contract version | 1.0.0 |
| OpenAPI | 3.1.0 |
| Auth | HTTP Bearer |
| Operations | `POST /v1/roadmap/chat-turn`, `POST /v1/roadmap/generate` |
| Ops endpoints | `GET /health`, `GET /ready` (both unauthenticated), `GET /internal/stats` (Bearer) |
| Base address | not declared in the document — configuration supplies it |

## Known gaps against this platform, as of 1.0.0

The provider has agreed to adopt this platform's enum values in a later version.
Until that version is vendored here, the client translates:

| Enum | Provider publishes | This platform stores |
| ---- | ------------------ | -------------------- |
| `SkillLevel` | 3 values | 4 — `EXPERT` has no target |
| `TimeCommitment` | 3 bands | 5, with different boundaries |
| `BudgetPreference` | `FREE_ONLY`, `LOW_COST`, `NO_PREFERENCE` | 4, different meanings |
| `LearningFormat` | 4 values | 6 — `WORKSHOP` and `ARTICLE` have no target |
| `ContentType` | identical | identical |

`CpdContext` in 1.0.0 carries no per-category breakdown; the provider has
agreed to add one.
