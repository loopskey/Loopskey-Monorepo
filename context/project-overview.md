# Loopskey Course Platform — Project Overview

## Reliability and operations

Business reactions use the versioned transactional outbox in
`apps/api/src/infrastructure/outbox`. Mail delivery is asynchronous, bounded to
ten attempts, and idempotency is recorded per event and handler. Evidence files
use the shared `ObjectStoragePort`, with local disk as the initial adapter.
Production logs are JSON; requests carry `x-correlation-id`; `/health` reports
liveness and `/ready` verifies required database connectivity. Operational
procedures live in `context/architecture/outbox-operations.md`.

> This document describes the repository as it exists today. Treat the Prisma
> schema, generated GraphQL schema, and application code as the final source of
> truth when this document and the implementation disagree.

## Product Purpose

Loopskey is a multi-role continuing professional development (CPD) and learning
platform. It brings courses, events, podcasts, YouTube content, professional
roadmaps, certifications, PDU/CPD tracking, providers, and organizations into a
single application.

The platform serves four roles:

| Role           | Primary responsibility                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROFESSIONAL` | Discover learning content, maintain a professional profile, track PDU/CPD progress, credentials, certificates, payments, roadmaps, and external learning. |
| `PROVIDER`     | Publish and manage courses, events, podcasts, YouTube channels, provider settings, attendees, analytics, and promotion requests.                          |
| `ORGANIZATION` | Manage members, departments, organization CPD categories, assignments, compliance reporting, events, and organization settings.                           |
| `ADMIN`        | Manage users, organizations and access requests, platform content, promotion requests, taxonomy, analytics, and platform settings.                        |

Public visitors can browse the landing pages and published content. Authenticated
users are routed to a role-specific dashboard.

## Repository Structure

This is an npm-workspaces monorepo orchestrated by Turborepo.

```text
Course1/
├── apps/
│   ├── api/
│   │   ├── prisma/                 # PostgreSQL schema, migrations, and seeders
│   │   └── src/
│   │       ├── common/             # Shared types and utilities
│   │       ├── graphql/            # Generated GraphQL schema
│   │       └── modules/            # NestJS feature modules
│   ├── front/
│   │   ├── public/                 # Static images, icons, and SVG sprite
│   │   ├── scripts/                # Frontend maintenance scripts
│   │   └── src/
│   │       ├── app/                # Next.js App Router routes and layouts
│   │       ├── components/         # UI, elements, guards, layouts, and modules
│   │       ├── hooks/              # Page and feature behavior
│   │       ├── i18n/               # English and French translations
│   │       ├── lib/                # GraphQL, RTK Query, validation, and utilities
│   │       ├── providers/          # Theme, language, and Redux providers
│   │       ├── types/              # Frontend contracts
│   │       └── utils/              # Constants and focused helpers
│   └── service-ai/                 # FastAPI AI service (Python 3.12, uv)
│       ├── openapi.json            # Committed contract; generated, never edited
│       ├── scripts/                # export_openapi.py
│       ├── src/service_ai/
│       │   ├── main.py             # App factory, middleware, routers
│       │   ├── core/               # Config, logging, correlation, errors, auth
│       │   ├── api/                # ops (/health, /ready) and versioned v1
│       │   ├── domain/             # Framework-free types and Protocol ports
│       │   ├── services/           # Use cases
│       │   └── adapters/           # Provider clients, core-API callback client
│       └── tests/
├── packages/                       # Internal workspace packages (private)
│   ├── api-contracts/              # Values both apps must agree on
│   ├── typescript-config/          # base / nextjs / nestjs compiler presets
│   └── eslint-config/              # Shared rules + dependency-boundary rules
├── context/                        # Persistent project/AI documentation
├── .github/workflows/ci.yml        # Lint, types, tests, build (--affected)
├── package.json                    # Workspace globs and commands
└── turbo.json                      # Task graph and cache configuration
```

The workspace globs are `apps/*` and `packages/*`. Packages are private, never
published, and referenced as `"@loopskey/<name>": "*"`.

`apps/service-ai` is a Python project, not an npm package. Its `package.json` is
a thin wrapper whose scripts shell out to uv, which is what puts it in the
Turborepo task graph so root `npm run dev|lint|check-types|test|build|codegen`
covers all three applications. uv must be on `PATH` for those root commands to
succeed, including for frontend-only work.

## Shared Packages

Added 2026-07-27 by the monorepo roadmap (`context/monorepo-audit.md`). Three
packages exist; the reasons other candidates were rejected are recorded in the
audit and should be read before proposing a fourth.

### `@loopskey/api-contracts`

Carries the values both applications must agree on that **the GraphQL schema
cannot express**. Everything the schema _can_ express is already shared through
code generation and must not be duplicated here.

It compiles to `dist/` (CommonJS + declarations). A build step is required, not
optional: NestJS resolves modules with `node10`, which ignores the `exports`
field, so `nest build` would otherwise emit `require()` calls pointing at `.ts`
files.

Four subpath entry points, plus the package root:

| Entry point    | Contents                                                          | Why it cannot live in the schema                                         |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/error-codes` | 174 keys across 9 domain enums                                    | Codes are an error vocabulary, not a data type                           |
| `/upload`      | MIME allowlist, extension map, file/byte caps, REST path builders | Upload is multipart REST, not GraphQL                                    |
| `/auth`        | Access/refresh cookie name defaults, `PLATFORM_ROLES`             | Cookie names are transport config; the proxy reads them before any query |
| `/validation`  | Certificate field bounds, `isExpiryOnOrAfterIssue`                | Bounds live in decorators and Zod, neither of which the schema carries   |

**Where each is consumed.** 25 files import the package directly, and every one
of them is a boundary file — an enum shim, a constant file, a validation schema,
an auth strategy, or the routing proxy. Those 25 serve roughly 80 more. No
service, resolver or React component imports the package itself, which is what
keeps the blast radius of a contract change small; preserve that when adding a
consumer.

_Message codes_ (174 keys, 172 distinct values — a few names recur across
domains). Each backend module's `enums/message-code.enum.ts` is now a
one-line re-export, so existing `@auth/enums/message-code.enum` imports are
unchanged:

```text
apps/api/src/modules/{auth,professional,admin,course,events,
                      podcast,provider,youtube,external-learning}/enums/message-code.enum.ts
```

Those shims are consumed by 46 backend files, concentrated in `auth` (25) and
`professional` (12). On the frontend the direct consumers are
`utils/auth-error.ts`, `utils/oauth.constant.ts`,
`hooks/useOrganizationActivation.ts` and `hooks/useCpdPduProgress.ts`, which in
turn serve the OAuth buttons, the registration form and the activation screens.

_Upload rules._ `apps/api/src/modules/professional/enums/pdu-file.constant.ts`
and `certificate-file.constant.ts` (7 backend files: both upload controllers and
their services); `apps/front/src/utils/pdu.constant.ts` (18 files — the whole
evidence-upload UI) and `utils/certificate.constant.ts`.

_Auth constants._ `auth/strategies/jwt.strategy.ts`,
`auth/services/auth-session.service.ts`, `auth/resolvers/auth.resolver.ts`, and
`apps/front/proxy.ts`. The cookie name must match on both sides — reading it
from a literal on one side is what previously broke authentication whenever
`ACCESS_TOKEN_COOKIE_NAME` was set.

_Validation._ `professional/dtos/create-certificate.input.ts` and
`professional/services/professional-certificate.service.ts`;
`apps/front/src/lib/validations/certificate.schema.ts`.

`PLATFORM_ROLES` restates the Prisma `Role` enum because the package may not
import `@prisma/client`. `apps/api/src/common/contract-drift.spec.ts` fails if
the two diverge — Prisma wins.

### `@loopskey/typescript-config`

`base.json`, `nextjs.json`, `nestjs.json`. Both apps extend the relevant preset
and keep only their own `paths` and overrides. `paths` must never move into the
package: they resolve relative to the config that declares `baseUrl`.

### `@loopskey/eslint-config`

`base` holds rules that apply everywhere, including the leading-underscore
unused-vars convention. `boundaries` holds the dependency-direction rules and is
consumed by `packages/api-contracts/eslint.config.mjs`; each app carries the
matching no-cross-app rule. Both invariants are covered by negative tests.

## Technology Stack

### Frontend

- Next.js 16, App Router, and Turbopack
- React 19 and strict TypeScript
- Tailwind CSS 4
- Radix UI primitives and shadcn-style components
- Redux Toolkit and RTK Query for server-state access
- GraphQL Code Generator and typed document nodes
- React Hook Form and Zod 4
- `next-themes`, i18next/next-intl, Sonner, Recharts, FullCalendar, Leaflet,
  Framer Motion, GSAP, Swiper, Three/OGL, and Lucide
- Vitest and Testing Library (112 tests; coverage is not yet comprehensive)

### Backend

- NestJS 11 and strict TypeScript
- Apollo GraphQL, code-first schema generation
- Prisma 6 and PostgreSQL
- JWT, Passport, Argon2, cookie-based access/refresh sessions
- Resend for email; Google and LinkedIn OAuth
- ExcelJS for spreadsheet import; multer and local disk for uploads
- Jest unit and architecture suites plus PostgreSQL-backed GraphQL E2E tests

Payment, SendGrid, Puppeteer, Swagger and `googleapis` dependencies were
declared but never imported, and were removed on 2026-07-27. Reintroduce one
only alongside code that uses it.

### AI backend

Added 2026-08-07. See `apps/service-ai/README.md` and ADR-007.

- FastAPI on Python 3.12, managed with uv
- Pydantic v2 and pydantic-settings for schemas and typed configuration
- ruff for lint and formatting, mypy in strict mode, pytest for tests
- httpx for outbound calls, with an explicit timeout budget
- No database client and no ORM: the service receives what it needs in the
  request and holds no persistence credentials

It is a private service reachable only from `apps/api`. It configures no CORS,
performs no end-user authentication, and never re-derives authorization from a
client-supplied identifier.

### Workspace

- npm 10 workspaces (`apps/*`, `packages/*`)
- Turborepo 2 — `build`, `test`, `lint`, `check-types`, `codegen`, `dev`
- Local build caching; remote caching is not configured
- GitHub Actions running the four gates with `--affected`
- ESLint 9 flat config and Prettier 3, both shared through
  `@loopskey/eslint-config`
- TypeScript settings shared through `@loopskey/typescript-config`

## System Architecture

```text
Browser
  └─ Next.js frontend
      └─ RTK Query endpoints
          └─ credentialed GraphQL requests
              └─ NestJS resolvers
                  └─ feature services
                      ├─ Prisma
                      │   └─ PostgreSQL
                      └─ AI client (REST over the committed OpenAPI contract)
                          └─ FastAPI routes
                              └─ AI services
                                  └─ model provider
```

### Communication Architecture

Decided in `context/architecture/adr-007-ai-service-communication.md`. The rule
is **one contract per boundary type**, not one protocol everywhere: protocol
uniformity only pays off when the same consumers use both surfaces, and a
browser and a NestJS service share no needs.

| Boundary                        | Contract               | Artifact                          |
| ------------------------------- | ---------------------- | --------------------------------- |
| Browser → `apps/api`            | GraphQL                | `apps/api/src/graphql/schema.gql` |
| `apps/api` → `apps/service-ai`  | REST over OpenAPI      | `apps/service-ai/openapi.json`    |
| Deferred / at-least-once        | Outbox domain events   | `apps/api/src/infrastructure/outbox` |
| Between NestJS modules          | In-process contracts   | published ports (ADR-003)         |

Two rules follow, and neither is negotiable without a superseding ADR:

- **`apps/api` is the only public edge.** The browser never reaches the AI
  service. Authentication is cookie-based JWT with global guards, and role and
  ownership rules live in `apps/api` services; a second public origin would mean
  reimplementing all of it in Python.
- **No internal network calls between NestJS modules.** ADR-001 is unchanged for
  `apps/api` internals. The only new network boundary in the system is
  `apps/api` → `service-ai`.

gRPC was evaluated and deliberately deferred rather than rejected: its wins need
call volume that AI workloads, dominated by multi-second model latency, do not
produce. ADR-007 records the three conditions that should trigger a revisit.

### Dependency Direction

Enforced by `no-restricted-imports` in each workspace's ESLint config, and
covered by negative tests:

```text
apps/front     ─┐
apps/api       ─┴─► packages/api-contracts
                    packages/typescript-config   (build-time)
                    packages/eslint-config       (build-time)

apps/service-ai ─► nothing in this repository (separate runtime)

packages/*      ─► nothing
```

Rules:

- A package must not import from `apps/*`.
- A package must not import `@prisma/client`, `@nestjs/*`, `next`, `react` or
  `react-dom`. Framework code stays in the application that owns it.
- No application may import another.
- `apps/service-ai` shares no code with the TypeScript workspaces. It cannot
  consume `packages/api-contracts` — a different language makes that impossible
  rather than merely discouraged — so a value both sides need is carried by the
  OpenAPI contract, not duplicated by hand.

One intentional exception, and it is a **build input rather than a module
import**: `apps/front` generates its GraphQL types from
`apps/api/src/graphql/schema.gql`. That dependency is declared in `turbo.json`
and is invisible to ESLint.

A second one of the same shape is planned but **not yet built**: `apps/api` will
generate its AI client types from `apps/service-ai/openapi.json`. It arrives
with the first feature that calls the AI service, because a generated client
with no consumer would be unused code (`context/coding-standards.md`). The
contract it will read from is already committed and drift-tested today.

### Frontend Architecture

The App Router is divided into:

- `(auth)`: role-specific authentication and the OAuth bridge.
- `(dashboards)`: admin, organization, professional, and provider dashboards.
- `(pages)`: public/static pages and course, event, podcast, and YouTube details.

Feature UI is normally split between a component in
`src/components/modules`, behavior in `src/hooks`, types in `src/types`, and
validation in `src/lib/validations`. Low-level reusable primitives belong in
`src/components/ui`; project-wide composites belong in `elements` or `layouts`.

The frontend API flow is:

1. GraphQL operations live in `src/lib/graphql/documents/*.graphql`.
2. `npm run codegen` generates `src/lib/graphql/generated.ts` **from the
   committed `apps/api/src/graphql/schema.gql`**, not from a running server. It
   needs no API and no database, and it is a cached Turbo task.
3. Feature endpoints in `src/lib/rtk/endpoints` use those typed documents.
4. `graphqlBaseQuery` sends cookies, maps GraphQL errors, performs a
   single-flight refresh on `401`, and retries the original operation once.

`generated.ts` is generated code and must not be edited manually. CI regenerates
it and fails on a diff, so a resolver change committed without a regenerated
`schema.gql` is caught rather than silently typing the frontend against a stale
API.

Frontend path aliases map `@/*` to `src/*`; focused aliases include `@lib`,
`@types`, `@hooks`, `@utils`, `@ui`, `@providers`, `@components`, `@guards`,
`@layouts`, `@modules`, `@elements`, and `@templates`.

### Backend Architecture

`AppModule` registers GraphQL and the active domain modules:

- `auth`, `user`, `admin`
- `course`, `events`, `podcast`, `youtube`, `landing`
- `professional`, `provider`, `organization`
- `content-interaction`, `external-learning`
- `mail`, `prisma`

Most feature modules use:

```text
modules/<feature>/
├── dtos/          # Validated GraphQL inputs
├── entities/      # GraphQL output types
├── enums/         # Feature enums, GraphQL names, registration
├── resolvers/     # Transport and authorization boundary
├── services/      # Business rules and persistence
├── types/         # Internal TypeScript contracts
├── utils/         # Focused helpers/errors, where needed
└── <feature>.module.ts
```

GraphQL is code-first and generates `apps/api/src/graphql/schema.gql`.
GraphQL operation/type name enums and Prisma enum registration are feature-local
under each module's `enums` directory.

One file in that directory is no longer feature-local:
`enums/message-code.enum.ts` is a one-line re-export from
`@loopskey/api-contracts/error-codes`, so the frontend branches on the same
values the API throws. Import paths are unchanged. **Add a new message code to
the package, not to the shim** — and never change an existing value, because the
value is the wire contract.

The API applies globally:

- configuration from `apps/api/.env`;
- cookie parsing;
- CORS for the configured frontend origin with credentials;
- a strict `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`);
- `JwtAuthGuard` followed by `RolesGuard`.

Operations are authenticated by default. Anonymous operations require
`@Public()`, and restricted operations declare allowed Prisma roles with
`@Roles(...)`.

The backend declares 19 path aliases in `apps/api/tsconfig.json`: `@common`,
`@modules`, `@utils`, `@prisma`, and one per module (`@app`, `@auth`, `@mail`,
`@user`, `@admin`, `@events`, `@course`, `@podcast`, `@youtube`, `@landing`,
`@org`, `@provider`, `@ext`, `@professional`, `@contentAction`).

`apps/api/jest.config.js` derives its `moduleNameMapper` from those `paths`
rather than restating them, so a new alias works in tests immediately. The one
hand-written entry is `@prisma/*`, deliberately narrowed to
`prisma.service`/`prisma.module` so that `@prisma/client` still resolves to the
real package — a derived catch-all would swallow it and break every spec that
touches the database. `apps/api/src/common/alias-resolution.spec.ts` guards
both halves.

## Main Domains

The Prisma schema at `apps/api/prisma/schema.prisma` is the persistence source
of truth.

### Identity and access

`User`, `AuthAccount`, `AuthSession`, `OtpCode`, and `PendingRegistration`
support email/password registration, OAuth identities, verification/reset OTPs,
refresh-token sessions, account status, and role-based access.

### Role profiles

- `ProfessionalProfile`, credentials, settings, taxonomy terms
- `ProviderProfile` and provider settings
- `OrganizationProfile`, access requests, and owned organization

### Learning catalog

- Courses with curriculum sections and lessons
- Events with schedules and registrations
- Podcasts with episodes
- YouTube channels and videos
- Roadmaps with phases, steps, and enrollments
- Certifications and certification categories

### Engagement and commerce

Wishlists, enrollments, reviews, carts, cart items, certificates, and payments
connect users to content and completion records.

### CPD/PDU

PDU targets, activities, evidence files, CPD plans, plan categories, reminder
settings, reports, external learning activities, certificates, and calendar
events support professional development tracking.

### Organizations and administration

Organizations contain settings, departments, members, custom CPD categories,
assignments and recipients. Audit logs and promotion requests support
administrative governance.

## Authentication Flow

1. A public registration/login/OAuth operation establishes identity.
2. The API writes the access and refresh tokens as cookies.
3. The browser sends cookies with GraphQL calls using `credentials: "include"`.
4. The global JWT guard resolves the current user; `RolesGuard` enforces any
   declared role metadata.
5. On an expired access token, the frontend coordinates one refresh request,
   then retries the failed GraphQL operation once.
6. Logout/revocation invalidates the server-side session and clears cookies.

Identity must always come from the authenticated request. A client-supplied
user ID or role is never proof of ownership or permission.

## Local Development

### Prerequisites

- Node.js compatible with Next.js 16 and the workspace packages
- npm 10.8.1 (declared by the root package)
- PostgreSQL
- Python 3.12 and uv, required for the root Turborepo commands even when the
  task touches only TypeScript

### Commands

Run from the repository root. All are Turborepo tasks, so they are cached and
dependency-ordered — `packages/api-contracts` builds before either app.

```bash
npm install
npm run dev
npm run build
npm run test          # 188 API + 112 frontend
npm run lint
npm run check-types
npm run codegen       # regenerates from the committed schema; no server needed
```

Workspace-specific commands:

```bash
npm run dev --workspace front
npm run dev --workspace api
npm run dev --workspace service-ai
npm run codegen --workspace front
npm run codegen --workspace service-ai
npm run test --workspace api
npm run test --workspace service-ai
npm run test:e2e --workspace api
npm run db:seed --workspace api
```

The frontend defaults to `http://localhost:3000`. The API defaults to
`http://localhost:5700`, with GraphQL at `/graphql`. The AI service defaults to
`http://127.0.0.1:5800`, with interactive docs at `/docs` outside production.

`npm run codegen` now regenerates two artifacts: the frontend GraphQL types and
`apps/service-ai/openapi.json`. Note that the AI service's `test` task
deliberately does not depend on its `codegen` task — regenerating the contract
before asserting against it would make the drift test pass unconditionally.

For Prisma work:

```bash
npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma migrate dev --schema apps/api/prisma/schema.prisma --name <name>
npx prisma migrate status --schema apps/api/prisma/schema.prisma
```

## Collaborative Feature Workflow

Normal feature, fix, and maintenance branches start from `origin/develop` and
merge back through a reviewed pull request to `develop`. `main` is the
production/release branch; hotfixes are the only normal work based on `main`,
and they must be reconciled back to `develop`.

Each active feature has an independent execution record:

```text
context/feature-runs/active/<slug>.md
```

Completed records move to `context/feature-runs/completed/`. The legacy
`context/current-feature.md` file is only a compatibility pointer, preventing
parallel developers from overwriting a single shared feature state. The
canonical lifecycle and approval rules are in `context/ai-interaction.md` and
the `.claude/skills/feature` workflow.

## Environment Configuration

Environment files are local and sensitive. Never copy their values into source,
documentation, logs, screenshots, or commits.

Important backend configuration includes:

- `DATABASE_URL`
- `NODE_ENV`, `APP_NAME`, `APP_HOST`, `APP_PORT`
- `FRONTEND_URL`
- `GRAPHQL_SCHEMA_PATH`, `GRAPHQL_PLAYGROUND`
- JWT secrets/expiration and access/refresh cookie settings
- OAuth client credentials and callback URLs
- email provider configuration
- upload directories and any payment/integration credentials

Important frontend configuration includes:

- `NEXT_PUBLIC_GRAPHQL_URL`
- `NEXT_PUBLIC_NEAT_LICENSE_KEY` when the licensed visual effect is enabled
- `SESSION_SECRET_KEY` for server-only session helpers

AI service configuration uses the `SERVICE_AI_` prefix so it stays unambiguous
when the three applications share an environment or secret store:

- `SERVICE_AI_ENVIRONMENT`, `SERVICE_AI_LOG_LEVEL`
- `SERVICE_AI_HOST`, `SERVICE_AI_PORT` — a private interface, never public
- `SERVICE_AI_API_KEY` — the credential `apps/api` presents; optional in
  development, required elsewhere, and a deployment that requires it without
  setting it fails closed rather than serving unauthenticated traffic
- `SERVICE_AI_CORE_API_URL`, `SERVICE_AI_REQUEST_TIMEOUT_SECONDS`

No `SERVICE_AI_` value may ever carry the `NEXT_PUBLIC_` prefix or reach the
browser. Nothing in the AI service is browser-facing.

Only non-sensitive browser configuration may use the `NEXT_PUBLIC_` prefix.
The repository should maintain sanitized `.env.example` files and explicitly
ignore real `.env` files before secrets are committed.

## Known Constraints and Technical Debt

> Five entries were removed here on 2026-07-27 because the monorepo roadmap
> resolved them: the mojibake `README.md` (rewritten as UTF-8), the missing
> `check-types` scripts and the `next lint` failure (both already fixed in
> `8f66b6e`), and the unused `@prisma/adapter-pg` 7 alongside Prisma 6 (removed
> with the other dead dependencies). Do not reintroduce them from memory.

- The frontend package uses Next.js 16 while `eslint-config-next` is still on
  version 15; keep framework/tooling versions aligned during dependency work.
- Automated tests are sparse relative to the number of modules. A successful
  build does not prove role, ownership, payment, upload, or CPD behavior.
- `npm run test:e2e --workspace api` points at `./test/jest-e2e.json`; the
  `apps/api/test` directory has never existed. Either create it or drop the
  script.
- The API has REST controllers for selected upload/OAuth flows in addition to
  GraphQL. Do not assume every backend interaction is GraphQL; confirm the
  existing feature contract.

## Rules for Future Changes

- Preserve the four role boundaries and guard every privileged operation.
- Scope reads and writes to the authenticated owner/provider/organization.
- Keep resolvers/controllers thin and business logic in services.
- Use transactions for multi-record business operations.
- Never expose password hashes, refresh-token hashes, OAuth tokens, secrets, or
  private evidence/payment data.
- Keep Prisma schema changes paired with a named migration and regenerated
  client.
- Keep `.graphql` documents, generated frontend types, and backend schema in
  sync.
- Keep `apps/service-ai/openapi.json` in sync with its routes and Pydantic
  models; regenerate with `npm run codegen` and commit it alongside the change.
- Never expose the AI service to the browser, and never add a fourth
  communication contract without a superseding ADR.
- Reuse existing components, hooks, endpoints, types, and validation schemas
  before adding equivalents.
- Put a value in `@loopskey/api-contracts` only when both applications genuinely
  consume it and the GraphQL schema cannot carry it. Single-app duplication gets
  an app-local fix.
- Never change an existing message-code _value_. The value is the wire contract;
  add a new key instead.
- Keep shared packages framework-free. No Prisma, Nest, React or Next — lint
  enforces it, and breaking it makes the package unshareable.
- Update this document when roles, architecture, setup, data model, shared
  packages, or a major integration changes.
