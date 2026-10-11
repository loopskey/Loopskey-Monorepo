# Security controls

What the API enforces beyond the guards in `AppModule`, where each control lives, and the settings that change it.

## Tokens

| Token | Secret | Audience | `tokenType` | Verified by |
| --- | --- | --- | --- | --- |
| Access | `JWT_ACCESS_SECRET` | `loopskey-access` | `access` | `JwtStrategy`, and `apps/front/proxy.ts` for routing |
| Refresh | `JWT_REFRESH_SECRET` | `loopskey-refresh` | `refresh` | `AuthSessionService.verifyRefreshToken` |
| OAuth state | `OAUTH_STATE_SECRET` | `loopskey-oauth-state` | `oauth-state` | `AuthOAuthStateService` |

- Every token carries the issuer `loopskey-api`, is signed with HS256 and is verified with that algorithm, issuer and audience. The constants live in `@loopskey/api-contracts/auth`.
- `JwtStrategy` refuses a token without a string `sub`, a `sessionId` and `tokenType: access` before any query. It then loads the `AuthSession` row (active, not revoked, not expired, owned by `sub`) and the user, so logout, a password reset and an administrator disabling the account take effect on the next request.
- The API refuses to start when a secret is missing, when two of the three secrets are equal, when a production secret is shorter than 32 characters, when `COOKIE_SECURE` is not `true` in production, or when `COOKIE_SAME_SITE=none` (`AuthConfigValidator`).

## Abuse limits

- `RateLimitGuard` reads `@RateLimit(...)` metadata. The policies are in `infrastructure/rate-limit/rate-limit.policies.ts`. Each public authentication operation is limited by client address and, where the input names one, by normalised email.
- Counters live in `RateLimitBucket`, one fixed window per key, updated by a single `INSERT … ON CONFLICT DO UPDATE`, so the limit holds across instances and under concurrent requests. Keys are SHA-256 hashes of scope and subject. Stale rows are removed opportunistically.
- A refused request answers with the GraphQL error code `RATE_LIMITED`, `details.retryAfterSeconds` and a `Retry-After` header.
- The client address is `req.ip`. Set `TRUST_PROXY` to the number of reverse proxies in front of the API or to a list of their addresses; leave it empty when none exists. `TRUST_PROXY=true` is refused. Without it, every client behind a proxy shares one address and the per-address limit becomes a global limit.
- `RATE_LIMIT_DISABLED=true` disables the limiter only when `NODE_ENV=test`.

## One-time codes

- Codes are drawn with `crypto.randomInt`.
- Password reset and email change issue one outstanding code per user, with an enforced cooldown; issuing a new code consumes the previous one.
- An attempt is spent in the same statement that tests the limit, before the hash is compared. Every failure to reset a password answers `OTP_INVALID`, and `forgotPassword` answers the same way whether or not the account exists.

## Request surface

- `securityHeadersMiddleware` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`, adds HSTS when `COOKIE_SECURE=true`, and a restrictive Content-Security-Policy whenever the GraphQL playground is off.
- `originGuardMiddleware` refuses a state-changing request whose `Origin` is not in `CORS_ORIGIN`, or that a browser marks `Sec-Fetch-Site: cross-site`, except under `/v1/ingest`, which authenticates by API key and carries no cookie.
- GraphQL introspection is off when `NODE_ENV=production` unless `GRAPHQL_INTROSPECTION=true`. `operationLimitsRule` rejects operations deeper than 14 levels, with more than 25 aliases, or more than 600 fields.

## Identity administration

- `UserService` checks for an administrator actor in every method, not only in the resolver. `createUser`, `updateUser` and the other user-administration operations are `@Roles(Role.ADMIN)`.
- Platform roles change only through the administrator operations. Organization member operations never write `User.role` and never rewrite an existing account; adding an email that belongs to a non-professional or deleted account is refused with `UserRoleConflict`.
- PDU `status` is written only by the association review path (`settleReview`, which acts on `PENDING` rows only). Editing a reviewed activity returns it to `PENDING`.
