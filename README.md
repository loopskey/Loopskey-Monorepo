# Loopskey

A multi-role continuing professional development (CPD) platform: courses,
events, podcasts, YouTube content, professional roadmaps, certifications, and
PDU/CPD tracking in one application.

Four roles, each with its own dashboard:

| Role           | Does what                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------- |
| `PROFESSIONAL` | Discovers learning content, tracks PDU/CPD progress, manages credentials and certificates |
| `PROVIDER`     | Publishes and manages courses, events, podcasts and channels                              |
| `ORGANIZATION` | Manages members, departments, assignments and compliance reporting                        |
| `ADMIN`        | Manages users, organizations, platform content and taxonomy                               |

## Prerequisites

- Node.js 22
- npm 10.8.1 (declared in `packageManager`)
- PostgreSQL

## Setup

```bash
npm install

cp apps/api/.env.example apps/api/.env
cp apps/front/.env.example apps/front/.env
# fill in DATABASE_URL and the JWT secrets at minimum

npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run dev
```

The frontend serves on `http://localhost:3000`, the API on
`http://localhost:5700` with GraphQL at `/graphql`.

## Commands

Run from the repository root. Everything is orchestrated by Turborepo, so tasks
are cached and run in parallel.

```bash
npm run dev           # both applications in watch mode
npm run build         # production builds
npm run test          # every test suite
npm run lint          # every workspace
npm run check-types   # every workspace
npm run codegen       # regenerate frontend GraphQL types
```

Scoped to one workspace:

```bash
npm run dev --workspace api
npm run test --workspace front
npm run db:seed --workspace api
```

Prisma:

```bash
npx prisma generate       --schema apps/api/prisma/schema.prisma
npx prisma migrate dev    --schema apps/api/prisma/schema.prisma --name <name>
npx prisma migrate status --schema apps/api/prisma/schema.prisma
```

## Feature workflow

The repository uses one scope-aware feature skill:

```text
/feature start <spec-or-request>  # branch, implement, test, fix
/feature review                   # optional four-bullet summary
/feature complete                 # commit, push, PR, wait for CI
```

`complete` opens a PR to `develop` and stops after CI passes. It never merges
the PR or deletes a branch; the Team Lead performs those actions manually.

Frontend work loads `apps/front/CLAUDE.md`, backend work loads
`apps/api/CLAUDE.md`, and repository-wide work loads only the scopes it affects.

## Continuous integration

GitHub Actions validates pull requests and pushes to `develop` and `main`.
Turborepo runs affected lint, type, test, and build tasks; PostgreSQL-backed API
E2E tests and GraphQL generated-type drift checks run in the same required job.
Deployment is intentionally not automated because this repository does not
define a deployment target or environment credentials.

## Layout

```text
apps/
  api/                    NestJS 11, Apollo GraphQL (code-first), Prisma 6
  front/                  Next.js 16, React 19, RTK Query, Tailwind 4
packages/
  api-contracts/          values both apps must agree on but the GraphQL
                          schema does not carry: message codes, upload rules,
                          auth constants, validation limits
  typescript-config/      base / nextjs / nestjs compiler presets
  eslint-config/          shared rules and dependency-boundary rules
context/                  architecture, coding standards, workflow, features
```

Dependency direction is one-way and lint-enforced: applications may import
packages, packages may not import applications, and the two applications must
never import each other.

## How the API contract works

The backend is code-first: NestJS decorators generate
`apps/api/src/graphql/schema.gql`, which is committed. The frontend runs GraphQL
Code Generator **against that committed file** — not against a running server —
producing `apps/front/src/lib/graphql/generated.ts`. Codegen therefore needs no
API and no database, and CI fails if the generated file drifts.

Anything the schema cannot express — message codes, multipart upload rules,
cookie names, field bounds — lives in `packages/api-contracts` so both sides
reference one value.

`generated.ts` is generated. Never edit it by hand; fix the schema or the
`.graphql` document and re-run `npm run codegen`.

## Further reading

`context/` is the authoritative documentation and is kept current:

- [`project-overview.md`](context/project-overview.md) — architecture, domains, data model
- [`coding-standards.md`](context/coding-standards.md) — conventions for both applications
- [`ai-interaction.md`](context/ai-interaction.md) — concise AI workflow policy
- [`monorepo-audit.md`](context/monorepo-audit.md) — monorepo audit and improvement roadmap
