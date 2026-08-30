# Loopskey API

NestJS GraphQL API backed by Prisma and PostgreSQL.

From the repository root:

```text
npm ci
npm run dev --workspace api
npm run test --workspace api
npm run test:e2e --workspace api
```

The API listens on the configured port (normally `5700`) and exposes GraphQL at
`/graphql`. Copy `.env.example` to `.env` for local development; never commit
credentials. E2E tests require an isolated database whose name contains a
standalone `test` marker.

Organization email delivery uses Resend. Configure `RESEND_API_KEY`,
`EMAIL_FROM`, the application URLs, and activation limits described in
`.env.example`.

Operational runbooks live in `docs/`. `docs/concurrency-operations.md` covers
where each concurrency invariant is enforced, the duplicate audit to run before
deploying `20260828140000_concurrency_safety`, how to reconcile event attendee
counts, and how to inspect and retry terminal outbox failures.
