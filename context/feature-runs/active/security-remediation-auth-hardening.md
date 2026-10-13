# security-remediation-auth-hardening

- Scope: `full`
- Model: `High reasoning — authentication, authorization, privilege escalation fixes, token and session handling, concurrency and a likely GraphQL contract change.`
- Branch: `feature/security-remediation-auth-hardening`
- Base: `9683fbb16ffdcf22cf4af063df2627e8d3fb101f`
- Status: `Submitted`

## Acceptance

- [x] Anonymous ADMIN creation is impossible (SEC-003).
- [x] Organization members cannot be given a platform role and no existing account is rewritten through the organization module (SEC-004).
- [x] OAuth state tokens cannot authenticate as access tokens (SEC-001).
- [x] Reset OTP is cryptographically generated, cooled down, atomically attempt-limited (SEC-002).
- [x] Professionals cannot self-approve PDU records (SEC-005).
- [x] Revoked sessions cannot keep using access tokens; public auth endpoints are throttled (SEC-007, SEC-008).
- [x] Remaining findings handled or documented in `security-reports/2026-10-11-security-audit/`.

## Verification

- `npm run lint` — pass
- `npm run check-types` — pass
- `npm run build` (with `NEXT_PUBLIC_SITE_URL` and `DEPLOYMENT_ENV` set as CI does) — pass
- `npm run test --workspace api` — pass (162 suites, 2,239 tests)
- `npm run test:e2e --workspace api` on PostgreSQL 17 at UTC, fresh database — pass (43 suites, 553 tests; 7 new security suites)
- `npm run codegen --workspace front` — run; only the three intended field removals
- Prisma: `20261011122333_rate_limit_buckets` applies to a fresh database; the 45 generated `DROP INDEX` statements were removed
- `npm audit --omit=dev` — critical 2 to 0, high 28 to 7; remaining items in `REMAINING_RISKS.md`
- No frontend test was added; the browser was not used

## Submission

- Commit: `97f6684`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/290
- CI:
