# API scope

Load this file only for `apps/api` work.

- NestJS 11, GraphQL, Prisma, PostgreSQL, strict TypeScript.
- Preserve module ownership and public-port boundaries.
- Authentication is global by default; make public/role/owner decisions explicit.
- Never expose secrets, password hashes, refresh-token hashes, or private files.
- Use named Prisma migrations; never use `db push` for feature delivery.

Run from repository root:

```text
npm run lint --workspace api
npm run check-types --workspace api
npm run test --workspace api
npm run build --workspace api
```

Add E2E, Prisma validation/generation, and GraphQL codegen only when affected.
See `README.md` for local API setup.
