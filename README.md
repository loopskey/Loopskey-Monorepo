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
- Python 3.12 and [uv](https://docs.astral.sh/uv/getting-started/installation/)
  — required even for frontend-only work, because Turborepo runs the AI
  service's tasks as part of the root commands

## Setup

```bash
npm install
uv sync --all-groups --project apps/service-ai

cp apps/api/.env.example apps/api/.env
cp apps/front/.env.example apps/front/.env
cp apps/service-ai/.env.example apps/service-ai/.env
# fill in DATABASE_URL and the JWT secrets at minimum

npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run dev
```

The frontend serves on `http://localhost:3000`, the core API on
`http://localhost:5700` with GraphQL at `/graphql`, and the AI service on
`http://127.0.0.1:5800`.

## Commands

Run from the repository root. Everything is orchestrated by Turborepo, so tasks
are cached and run in parallel.

```bash
npm run dev           # all three applications in watch mode
npm run build         # production builds
npm run test          # every test suite
npm run lint          # every workspace
npm run check-types   # every workspace
npm run codegen       # regenerate frontend GraphQL types and the AI OpenAPI contract
```

Scoped to one workspace:

```bash
npm run dev --workspace api
npm run test --workspace front
npm run test --workspace service-ai
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
`apps/front/CLAUDE.md`, core backend work loads `apps/api/CLAUDE.md`, AI backend
work loads `apps/service-ai/CLAUDE.md`, and repository-wide work loads only the
scopes it affects. Shared context — the project overview, coding standards and
ADRs — stays at the root in `context/`.

## Continuous integration

GitHub Actions validates pull requests and pushes to `develop` and `main`.
Turborepo runs affected lint, type, test, and build tasks across all three
applications; PostgreSQL-backed API E2E tests and GraphQL generated-type drift
checks run in the same required job. The OpenAPI equivalent of that drift check
is a pytest case inside the AI service, so it runs with the normal test task.
Deployment is intentionally not automated because this repository does not
define a deployment target or environment credentials.

## Docker deployment

The production stack contains PostgreSQL, the NestJS API, the private FastAPI
service, and the Next.js frontend. From the repository root:

```bash
cp .env.docker.example .env.docker
# Replace every change-me value and set the public production URLs.
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
```

The frontend is exposed on port `3000` and the API on `5700` by default. The AI
service and PostgreSQL are intentionally reachable only by other containers.
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
  service-ai/             FastAPI, Python 3.12, uv — private AI service
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
another. `apps/service-ai` is a separate runtime and shares no code with the
TypeScript workspaces — only a contract.

## How the applications talk to each other

One contract per boundary, each expressed in one committed artifact and checked
by CI. The reasoning is in
[ADR-007](context/architecture/adr-007-ai-service-communication.md).

```text
Browser ──GraphQL──► apps/api ──REST/OpenAPI──► apps/service-ai
                     (only public edge)          (private, no browser access)
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

**Core API ↔ AI service — REST over OpenAPI.** The same arrangement, one layer
down: FastAPI routes and Pydantic models generate
`apps/service-ai/openapi.json`, which is committed, and a pytest case fails when
the file and the application diverge. The AI service is never exposed to the
browser, so authentication, roles and ownership stay in one place.

**Deferred work — the outbox.** Long-running AI calls go through the existing
transactional outbox in `apps/api/src/infrastructure/outbox`, which already
provides bounded retries and per-handler idempotency. Token streaming uses SSE
and stays out of GraphQL.

`generated.ts` and `openapi.json` are both generated. Never edit either by hand;
fix the schema, the `.graphql` document, or the Pydantic model, and re-run
`npm run codegen`.

## Further reading

`context/` is the authoritative documentation and is kept current:

- [`project-overview.md`](context/project-overview.md) — architecture, domains, data model
- [`coding-standards.md`](context/coding-standards.md) — conventions for all three applications
- [`architecture/`](context/architecture/README.md) — ADRs, including
  [ADR-007](context/architecture/adr-007-ai-service-communication.md) on how the
  three applications communicate
- [`ai-interaction.md`](context/ai-interaction.md) — concise AI workflow policy
- [`monorepo-audit.md`](context/monorepo-audit.md) — monorepo audit and improvement roadmap
