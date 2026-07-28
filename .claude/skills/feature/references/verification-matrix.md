# Verification Matrix

## Always

```bash
git diff --check
npm run lint
npm run check-types
npm run test
npm run build
```

Run focused checks during iteration; run the complete gate before review and
again immediately before completion.

## Frontend Changes

- Exercise the behavior in a browser.
- Verify loading, empty, error, success, responsive and keyboard states when
  applicable.
- Run relevant Vitest tests.
- Verify English and French translations for user-facing text.

## API Changes

- Exercise GraphQL or REST behavior against the API.
- Verify anonymous, allowed-role, forbidden-role, owner, and cross-owner cases.
- Run relevant Jest tests.
- Confirm transaction and failure behavior.

## GraphQL Changes

```bash
npm run codegen
git diff --exit-code -- apps/api/src/graphql/schema.gql apps/front/src/lib/graphql/generated.ts
```

Generated drift must be understood and committed when intentional.

## Prisma Changes

```bash
npx prisma validate --schema apps/api/prisma/schema.prisma
npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma migrate status --schema apps/api/prisma/schema.prisma
```

Require a named migration and verify migration order. Never use `db push` as
the production migration workflow.

## Shared Package Changes

- Build the package before consumers.
- Run contract drift and boundary tests.
- Confirm both real consumers and the GraphQL-not-expressible rule.

## Evidence

Record exact commands, exit results, timestamp, commit/worktree fingerprint,
environment limitations, and unverified behavior. A build is not functional
verification.
