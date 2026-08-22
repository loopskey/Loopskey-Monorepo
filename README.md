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

The frontend serves on `http://localhost:3000`, the core API on
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

Documentation is scoped per application. Frontend work loads
`apps/front/CLAUDE.md`, core backend work loads `apps/api/CLAUDE.md`, and
repository-wide work loads only the
scopes it affects. Shared context — the project overview, coding standards and
ADRs — stays at the root in `context/`.

## Continuous integration

GitHub Actions validates pull requests and pushes to `develop` and `main`.
Turborepo runs affected lint, type, test, and build tasks across both
applications; PostgreSQL-backed API E2E tests and GraphQL generated-type drift
checks run in the same required job.
Deployment is intentionally not automated because this repository does not
define a deployment target or environment credentials.

## Docker deployment

The production stack contains PostgreSQL, the NestJS API, and the Next.js
frontend. From the repository root:

```bash
cp .env.docker.example .env.docker
# Replace every change-me value and set the public production URLs.
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
```

The frontend is exposed on port `3000` and the API on `5700` by default.
PostgreSQL is intentionally reachable only by other containers.
Prisma migrations run automatically before each API start. Database data and
uploaded files live in named Docker volumes and survive container replacement.

For a real deployment, set `PUBLIC_FRONTEND_URL` and
`NEXT_PUBLIC_GRAPHQL_URL` to the public HTTPS origins, enable
`COOKIE_SECURE=true`, and put a TLS reverse proxy or platform load balancer in
front of the exposed services. Because `NEXT_PUBLIC_GRAPHQL_URL` is embedded at
build time, rebuild the frontend after changing it.

Useful operations:

```bash
docker compose --env-file .env.docker logs -f
docker compose --env-file .env.docker pull
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker down
```

`docker compose down` keeps the named volumes. Adding `--volumes` deletes the
database and uploads and should only be used when that data is no longer needed.

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
packages, packages may not import applications, and no application may import
another.

## How the applications talk to each other

The browser communicates with the core API through GraphQL.

```text
Browser ──GraphQL──► apps/api
                     (only public edge)
```

**Browser ↔ core API — GraphQL.** The backend is code-first: NestJS decorators
generate `apps/api/src/graphql/schema.gql`, which is committed. The frontend
runs GraphQL Code Generator **against that committed file** — not against a
running server — producing `apps/front/src/lib/graphql/generated.ts`. Codegen
therefore needs no API and no database, and CI fails if the generated file
drifts.

Anything the schema cannot express — message codes, multipart upload rules,
cookie names, field bounds — lives in `packages/api-contracts` so both sides
reference one value.

`generated.ts` is generated. Never edit it by hand; fix the schema or the
`.graphql` document and re-run `npm run codegen`.

## Further reading

`context/` is the authoritative documentation and is kept current:

- [`project-overview.md`](context/project-overview.md) — architecture, domains, data model
- [`coding-standards.md`](context/coding-standards.md) — conventions for both applications
- [`architecture/`](context/architecture/README.md) — architecture decisions
- [`monorepo-audit.md`](context/monorepo-audit.md) — monorepo audit and improvement roadmap
