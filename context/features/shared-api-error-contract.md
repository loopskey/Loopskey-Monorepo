# Shared API Error Contract

> Source: `context/monorepo-audit.md` — **MONO-02** and finding **D-5**.
> Prerequisite: **MONO-01**.

## Objective

Give the frontend a compile-time link to the backend's error vocabulary.

The backend defines **169 distinct error codes** across nine
`message-code.enum.ts` files. None of them appear in `schema.gql` or in
`generated.ts`. The frontend nonetheless branches on **25 of them as bare string
literals** — routing users to different screens based on values no compiler
checks.

Renaming `ACTIVATION_TOKEN_EXPIRED` in the backend today compiles cleanly, passes
all 269 tests, and silently drops the user on a generic error page instead of the
resend form.

## Status

Not Started

## Goals

- Move the error-code vocabulary into `packages/api-contracts`.
- Have `apps/api` throw from the shared source instead of its local enums.
- Have `apps/front` compare against typed constants instead of string literals.
- Remove the `| string` widening in `apps/front/src/utils/auth-error.ts:3-8`,
  which currently erases the check that file was written to provide.
- Make a renamed code a compile error in both applications.

## Evidence

Backend definitions:

```text
apps/api/src/modules/auth/enums/message-code.enum.ts              50 codes
apps/api/src/modules/professional/enums/message-code.enum.ts      47
apps/api/src/modules/admin/enums/message-code.enum.ts             16
apps/api/src/modules/events/enums/message-code.enum.ts            13
apps/api/src/modules/podcast/enums/message-code.enum.ts           12
apps/api/src/modules/provider/enums/message-code.enum.ts          12
apps/api/src/modules/youtube/enums/message-code.enum.ts           12
apps/api/src/modules/course/enums/message-code.enum.ts            10
apps/api/src/modules/external-learning/enums/message-code.enum.ts  2
```

The 25 codes the frontend re-declares as literals are listed in full under
finding D-5 of the audit.

Frontend consumers include `apps/front/src/utils/auth-error.ts`,
`apps/front/src/hooks/useOrganizationActivation.ts`,
`apps/front/src/hooks/useCpdPduProgress.ts`, and the Google/LinkedIn OAuth hooks.

The `current-feature.md` history already records this failure mode: a Phase 7 fix
had to pin `useCpdPduProgress` — which matches on the literal
`CPD_PLAN_DUPLICATE` — with a regression test, because nothing else could catch a
rename.

## Scope

### In scope

- `packages/api-contracts/src/error-codes/` with one file per backend module.
- Replacing the nine backend enums with imports from the package.
- Replacing the 25 frontend literals with typed references.

### Out of scope

- **Error messages.** They stay in their apps — the frontend's are user-facing
  and translated, the backend's are not.
- **HTTP-status mapping.** Stays in
  `apps/api/src/common/utils/graphql-error-formatter.ts`.
- **i18n keys.** Stay in `apps/front/src/i18n/`.
- Exposing codes through the GraphQL schema — see below.

## Design Notes

Use `as const` objects with derived union types rather than TypeScript `enum`, so
the values stay plain strings across the wire and narrow correctly:

```ts
export const AuthErrorCode = {
  ACTIVATION_TOKEN_EXPIRED: "ACTIVATION_TOKEN_EXPIRED",
  // ...
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];
```

**Do not model these as a GraphQL enum.** They are an error vocabulary, not a
data type. Adding them to the schema would force every mutation payload to
reference them and would couple the error surface to schema versioning.

The backend keeps full authority over which code it throws for a given condition.
The package only fixes the spelling.

## Migration Plan

169 codes across 9 modules is too large for one commit. Slice by module. Each
slice is independently shippable and revertible:

1. `auth` — 50 codes, and the source of 22 of the 25 frontend literals. Highest
   value, do it first.
2. `professional` — 47 codes.
3. `admin`, `course`, `events`, `podcast`, `provider`, `youtube`,
   `external-learning` — 77 codes between them; these have few or no frontend
   consumers and can move in one or two passes.

## Verification

- `npm run check-types` passes in both apps after each slice.
- API Jest: 157 passing, and unchanged in count unless tests are added.
- Frontend Vitest: 112 passing.
- **Negative test:** temporarily rename one shared code and confirm both
  `apps/api` and `apps/front` fail to type-check. Revert. This is the whole point
  of the feature and must be demonstrated, not assumed.
- Live check on one flow: let an organization activation link expire and confirm
  the frontend still reaches the expired/resend screen.

## Risks

- Touching nine backend modules is broad. Mitigated by per-module slicing.
- Over-sharing. If messages or status mapping drift into the package, it stops
  being a vocabulary and becomes a second place to make product decisions.
  Keep it to strings.

## Acceptance Criteria

- All 169 codes live in `packages/api-contracts`, or the migrated subset does
  with the remainder explicitly listed as deferred.
- Zero bare error-code string literals remain in `apps/front/src` for migrated
  modules.
- `TAuthErrorCode`'s `| string` widening is gone.
- The negative rename test demonstrably fails to compile in both apps.
- All gates pass.

## History

<!-- Keep this updated. Earliest to latest -->
