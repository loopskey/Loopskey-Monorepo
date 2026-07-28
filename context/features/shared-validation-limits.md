# Shared Validation Limits

> Source: `context/monorepo-audit.md` — **MONO-14**, finding **D-9**.
> Prerequisite: **MONO-01**.

## Objective

Field-length limits are written twice — as named constants in the frontend Zod
schema and as inline numbers in the backend DTO. A tightened backend limit
rejects input the frontend accepted, after the user has filled the form; a
loosened one leaves the frontend rejecting valid input.

The audit also found a genuine validation **gap** while making this comparison,
which this feature should close.

## Status

Not Started

## Goals

- Share the numeric limits through `packages/api-contracts`.
- Keep Zod on the frontend and class-validator on the backend.
- Close the `validUntil >= issueDate` gap, which currently exists only in the
  browser.
- Make the frontend/backend rule comparison visible and reviewable.

## Evidence

| Field | Frontend | Backend |
| --- | --- | --- |
| `title` max | `CERTIFICATE_TITLE_MAX = 200` (`apps/front/src/utils/certificate.constant.ts:17`) | `@MaxLength(200)` (`create-certificate.input.ts:12`) |
| `issuer` max | `CERTIFICATE_ISSUER_MAX = 200` (`:18`) | `@MaxLength(200)` (`:18`) |
| `certificateNumber` max | `CERTIFICATE_NUMBER_MAX = 120` (`:19`) | `@MaxLength(120)` (`:25`) |

Files: `apps/front/src/lib/validations/certificate.schema.ts` and
`apps/api/src/modules/professional/dtos/create-certificate.input.ts`.

The frontend at least names its constants; the backend inlines the numbers.
Values agree today.

### The gap

`apps/front/src/lib/validations/certificate.schema.ts:51-58` enforces:

```ts
new Date(values.validUntil).getTime() >= new Date(values.issueDate).getTime()
```

The backend validates both fields as `@IsDateString()` and **nothing more**. A
certificate whose expiry precedes its issue date can be created through the API
directly. This is a validation hole regardless of any sharing work, and the
project's own standard is that "backend validation remains authoritative".

## Scope

### In scope

- `packages/api-contracts/src/validation/limits.ts` with the numeric bounds.
- Rewiring the certificate and PDU-activity schemas and DTOs to use them.
- Adding the `validUntil >= issueDate` check to the backend certificate service
  or DTO, with a test.

### Out of scope — and this matters

- **Sharing Zod schemas themselves, or deriving DTOs from them.** NestJS DTOs
  need decorators for GraphQL schema generation as well as validation, so a
  Zod-derived DTO would still need a hand-written `@InputType` twin. That
  replaces one duplication with a more complex one. The audit recommends against
  it explicitly.
- **Error messages.** The frontend's are user-facing and translated; the
  backend's are not. They stay in their apps.
- Migrating all 109 backend `.input.ts` files. Scope to certificate and PDU
  first and let the pattern spread with normal feature work.

## Design Notes

Keep the package to plain numbers and, where a rule is genuinely shared, a
predicate:

```ts
export const CERTIFICATE_LIMITS = {
  titleMax: 200,
  issuerMax: 200,
  certificateNumberMax: 120,
} as const;
```

The frontend passes these to `.max()`; the backend passes them to
`@MaxLength()`. Decorators accept a computed value, so
`@MaxLength(CERTIFICATE_LIMITS.titleMax)` works without ceremony.

For the cross-field date rule, the shared piece is the predicate, not the
message:

```ts
export const isExpiryOnOrAfterIssue = (issue: string, expiry: string) => ...
```

Each side supplies its own message.

## Verification

- API Jest 157 passing plus a new test asserting the backend rejects an expiry
  before the issue date.
- Frontend Vitest 112 passing — `certificate.schema.test.ts` already covers
  expiry-before-issue and must stay green.
- `npm run check-types`, `npm run lint`, `npm run build` pass.
- **Negative test:** change one limit in the shared package and confirm both the
  Zod schema and the GraphQL input reject at the new bound without any other
  change. Revert.
- **Live:** submit a certificate through the GraphQL API directly (bypassing the
  form) with `validUntil` before `issueDate` and confirm it is now rejected.
  Confirm the browser form is unaffected.

## Risks

- **Validation changes can reject previously-accepted input.** Check whether any
  existing `Certificate` rows have `validUntil < issuedAt` before adding the
  backend rule — if so, the rule blocks *updates* to those rows too, and that
  needs a decision.
- Tempting to over-share. Messages must stay in the apps; the moment translated
  copy enters the package it becomes a place where product decisions are made.
- 109 DTOs is too large for one feature. Resist widening beyond certificate and
  PDU.

## Acceptance Criteria

- Certificate and PDU length limits exist in exactly one place.
- The backend rejects expiry-before-issue, proven by test and live.
- Zod stays on the frontend and class-validator on the backend.
- No error message moved into the shared package.
- All gates pass.

## History

<!-- Keep this updated. Earliest to latest -->
