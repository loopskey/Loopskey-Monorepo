# Feature: <short outcome-oriented name>

> Copy this file to `context/features/<domain>/<slug>.md`. Replace examples,
> delete guidance quotes, and remove conditional sections that do not apply.

## Status

Draft

<!-- Use Draft or Approved. Working/Ready/Submitted belong in the run record. -->

## Objective

Describe the single outcome this feature must achieve in two or three
sentences. Explain the current problem and the intended result, not the coding
steps.

## User Value

As a `<role>`, I want `<capability>` so that `<measurable benefit>`.

## Scope

<!-- Expected application scope: front, api, or full. The skill confirms it. -->

- Add `<user-visible or domain capability>`.
- Update `<existing workflow or contract>`.
- Preserve `<important compatibility or behavior>`.

## Non-goals

- Do not redesign `<adjacent workflow>`.
- Do not refactor `<unrelated module>`.
- Do not add `<future capability>`.

## Functional Requirements

1. When `<precondition>`, the user/system can `<action>`.
2. The system validates `<business invariant>`.
3. On success, the system `<observable result>`.
4. On a known failure, the system `<safe and actionable behavior>`.

## Roles and Permissions (when relevant)

| Actor | Allowed | Forbidden |
| ----- | ------- | --------- |
| `<role>` | `<read/write action>` | `<restricted action>` |

- Authentication: `<public or authenticated by default>`
- Ownership rule: `<how the API derives and verifies ownership>`
- Sensitive data: `<fields/files that must never be exposed or logged>`

## UX Requirements (frontend when relevant)

- Entry point: `<route, page, dialog, or existing component>`
- Loading: `<expected feedback>`
- Empty: `<expected message/action>`
- Error: `<recoverable behavior and safe message>`
- Success: `<result, redirect, toast, or cache update>`
- Responsive and keyboard behavior: `<requirements>`
- Internationalization: `<new or reused en/fr keys and locale-aware values>`

## Contract Changes (API or full scope when relevant)

- Transport: `<GraphQL query/mutation, existing REST exception, or none>`
- Input: `<fields, validation, and null/empty semantics>`
- Output: `<fields exposed to the client>`
- Stable error/message codes: `<new codes or reused codes>`
- Compatibility: `<existing operations/clients that must remain valid>`

<!--
GraphQL is code-first. Do not hand-edit schema.gql or generated.ts. New shared
message codes belong in @loopskey/api-contracts/error-codes without changing
the value of an existing code.
-->

## Data and Domain Rules (when relevant)

- Owning module: `<backend domain that owns the write>`
- Models/relations affected: `<Prisma models or none>`
- Invariants and concurrency: `<constraints/transaction requirements>`
- Migration/backfill: `<named migration, backfill plan, or none>`
- Delete/retention behavior: `<expected behavior>`

## Dependencies and Side Effects (when relevant)

- Cross-domain interaction: `<public port/projection/event or none>`
- External provider/object storage: `<integration and failure behavior>`
- Outbox event: `<versioned event and idempotent consumer or none>`
- Retry/idempotency: `<duplicate request and terminal failure behavior>`

## Observability and Operations (when relevant)

- Structured logs/metrics: `<signals, with correlation ID and redaction>`
- Operational failure handling: `<inspection/recovery path>`
- Rollout/feature flag: `<strategy or none>`

## Acceptance Criteria

- [ ] Given `<initial state>`, when `<action>`, then `<observable result>`.
- [ ] Unauthorized or non-owning actors cannot `<protected action>`.
- [ ] Invalid input produces `<safe validation behavior>` without persistence.
- [ ] Existing `<named workflow/contract>` remains compatible.
- [ ] Relevant UI states and accessibility requirements are covered.
- [ ] Relevant automated tests and scope verification gates pass.

<!-- Remove criteria that genuinely do not apply; add feature-specific edges. -->

## Verification

### Focused checks

- `<unit/component/architecture test that proves the core behavior>`
- `<manual browser behavior only when automation is not practical>`

### Scope gate

- Front: lint, type-check, tests, build; codegen/browser checks when affected.
- API: lint, type-check, tests, build; E2E/Prisma/codegen when affected.
- Full/shared: root lint, type-check, tests, build plus relevant checks above.

## Risks and Decisions

- Risk: `<security, compatibility, migration, performance, or operational risk>`
  - Mitigation: `<how acceptance/implementation reduces it>`
- Decision needed: `<material unresolved choice, or None>`

## References

- Existing implementation: `<path or None>`
- Architecture decision: `<context/architecture/... or None>`
- Issue/design: `<link or None>`
