# Shared Auth Constants (and the cookie-name defect)

> Source: `context/monorepo-audit.md` — **MONO-04**, findings **D-7** and **D-8**.
> Part 1 has no prerequisite. Part 2 requires **MONO-01**.

## Objective

Fix a live authentication defect found while auditing constant duplication, then
remove the duplication that allowed it.

`ACCESS_TOKEN_COOKIE_NAME` is honoured when the access cookie is **written** and
ignored when it is **read**. Setting that documented environment variable to any
non-default value makes every authenticated request fail with 401, in an
environment-specific way that never reproduces locally.

## Status

Not Started

## Goals

**Part 1 — the defect (ship independently, do not wait on packages):**

- `cookieExtractor` reads the configured cookie name, not a hardcoded literal.
- The same check applied to the refresh cookie.

**Part 2 — the duplication:**

- Cookie-name defaults defined once in `packages/api-contracts`.
- `apps/front/proxy.ts` uses the generated `Role` enum instead of role string
  literals.

## Evidence

### Part 1

```ts
// apps/api/src/common/utils/cookie-extractor.ts:5   — ignores the env var
return req.cookies["access_token"] ?? null;
```

```ts
// apps/api/src/modules/auth/services/auth-session.service.ts:252-253, 296-297
this.config.get("ACCESS_TOKEN_COOKIE_NAME", "access_token")
```

`cookieExtractor` is wired into `apps/api/src/modules/auth/strategies/jwt.strategy.ts:19`,
which is the entry point for **every authenticated request**.

`ACCESS_TOKEN_COOKIE_NAME` is a documented, advertised key — it is present in
`apps/api/.env.production`. The refresh cookie has the same shape at
`apps/api/src/modules/auth/resolvers/auth.resolver.ts:113`.

### Part 2

```ts
// apps/front/proxy.ts:8-25
const ROLE_ROUTES = [
  { prefix: "/dashboard/professional", roles: ["PROFESSIONAL"] },
  { prefix: "/dashboard/provider",     roles: ["PROVIDER"] },
  { prefix: "/dashboard/organization", roles: ["ORGANIZATION"] },
  { prefix: "/dashboard/admin",        roles: ["ADMIN"] },
] as const;
```

`Role` is generated and available, and is used correctly at
`apps/front/src/utils/function-helper.ts:14`,
`apps/front/src/utils/constant.ts:5` and
`apps/front/src/utils/oauth.constant.ts:71`. `proxy.ts` is the authorization
middleware — the worst file in the codebase to hold unchecked literals.

The same pattern appears in
`apps/front/src/components/modules/OrgDashboard/parts/org-assignment-form.tsx`
and `org-event-assign-form.tsx`.

## Scope

### In scope

- `apps/api/src/common/utils/cookie-extractor.ts` and its caller.
- The refresh-cookie read path.
- `packages/api-contracts/src/auth/cookies.ts` and `roles.ts`.
- `apps/front/proxy.ts` and the two OrgDashboard form components.

### Out of scope

- Cookie `secure` / `sameSite` / `domain` policy — configuration, not duplication.
- Session rotation, revocation, or refresh semantics.
- Any change to what the cookies contain.

## Design Notes

`cookieExtractor` currently takes only `req`. Reading configuration inside it
means either injecting `ConfigService` (which changes it from a plain function to
a factory) or reading `process.env` directly. The factory form is cleaner and
matches how Passport strategies are constructed:

```ts
export const cookieExtractor = (cookieName: string) =>
  (req: Request): string | null =>
    req?.cookies?.[cookieName] ?? null;
```

with `jwt.strategy.ts` supplying the configured name it already has access to.

For Part 2, the package should **re-export** the role vocabulary, not redefine
it. `Role` originates from generated GraphQL output; a hand-written duplicate in
the package would recreate exactly the problem this feature removes.

## Verification

- API Jest 157 passing.
- Frontend Vitest 112 passing.
- `npm run check-types`, `npm run lint`, `npm run build` pass.
- **Live, and this is the critical one:** set `ACCESS_TOKEN_COOKIE_NAME` to a
  non-default value in `apps/api/.env`, restart the API, then confirm login,
  an authenticated query, token refresh, and logout all still work. Repeat for
  `REFRESH_TOKEN_COOKIE_NAME`. Restore the default afterwards.
- Add a unit test asserting the extractor honours a non-default name.
- Confirm role routing still works for all four dashboards after the `proxy.ts`
  change.

## Risks

- Cookie handling touches every request, so a mistake is total rather than
  partial. Low code volume, high blast radius — the live verification above is
  not optional.
- Changing `cookieExtractor`'s signature affects its one caller; confirm no other
  strategy or guard imports it.

## Acceptance Criteria

- Setting `ACCESS_TOKEN_COOKIE_NAME` to a custom value no longer breaks
  authentication, proven live.
- A regression test covers it.
- `"access_token"` appears as a literal in at most one place.
- `apps/front/proxy.ts` contains no role string literals.
- All gates pass.

## History

<!-- Keep this updated. Earliest to latest -->
