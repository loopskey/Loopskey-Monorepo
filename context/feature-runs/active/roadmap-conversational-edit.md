# roadmap-conversational-edit

- Scope: `full`
- Model: `High reasoning — adds a persisted edit state (likely a Prisma migration), concurrency control, ownership checks, two new AI service endpoints and an additive GraphQL contract, and routes regeneration through the transactional outbox while protecting completed progress`
- Branch: `feature/roadmap-conversational-edit`
- Base: `1f4b9463`
- Status: `Submitted`

Spec: `context/features/professional/roadmap-edit-regenerate.md`

## Acceptance

- [x] Edit opens the existing edit draft with the saved preferences in the sidebar and the original chat history shown read-only before the edit conversation; one edit-specific greeting, no Yes/No question, no duplicates on reopen.
- [x] Natural-language edits to draft fields and to existing phases or steps go through `POST /v1/roadmap/edit-turn`; extracted fields merge with the existing draft rules; change operations are validated against the user's roadmap; pending changes persist across turns and refreshes; stale AI responses cannot overwrite newer sidebar edits.
- [x] A review state shows updated preferences and a change summary; regeneration needs an explicit action and is blocked when the draft is invalid or there are no valid changes.
- [x] Edit drafts regenerate through `POST /v1/roadmap/regenerate`, new roadmaps still use `/generate`; the existing outbox, persistence and polling are reused; completed steps are protected, failure keeps the original roadmap and a recoverable edit draft.
- [x] Discard replaces Start Over in edit mode, asks for confirmation, and leaves the original roadmap and its conversation untouched.
- [x] Ownership is verified for roadmap, draft, enrollment and original transcript; the create-roadmap flow is unchanged; copy is localized (en, fr); responsive and accessible.

## Verification

Rerun after the user's refactor (2026-11-04):

- `npx tsc --noEmit` (api: tsconfig, spec, check, test) — pass after repointing the `EditContext` import to the types file
- `npx eslint src` (api) — pass
- `npx jest` (api, unit) — pass, 183 suites, 2894 tests, after regenerating `service-ai.types.ts` (the refactor had reformatted it and dropped its header) and updating two field-order expectations to the refactored order
- roadmap e2e on an isolated UTC PostgreSQL 17 (`roadmap-regenerate`, `roadmap-edit`, `roadmap-chat-message`, `roadmap-draft-reset`) — pass, 4 suites, 35 tests; `schema.gql` regenerated unchanged
- `npm run build` (api) — pass
- front `npx tsc --noEmit`, `eslint` on touched files, `npm run codegen` (no drift), `DEPLOYMENT_ENV=development npm run build` — pass
- Full e2e — left to CI (before the refactor: 864/865 locally, the one failure a flaky `outbox-delivery` case that passed standalone)
- Browser and real AI service — not run

## Submission

- Commit: `daa0367d`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/350
- CI: pending
