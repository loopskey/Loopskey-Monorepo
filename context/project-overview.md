# Loopskey Course Platform — Project Overview

> This document describes the repository as it exists today. Treat the Prisma
> schema, generated GraphQL schema, and application code as the final source of
> truth when this document and the implementation disagree.

## Product Purpose

Loopskey is a multi-role continuing professional development (CPD) and learning
platform. It brings courses, events, podcasts, YouTube content, professional
roadmaps, certifications, PDU/CPD tracking, providers, and organizations into a
single application.

The platform serves four roles:

| Role | Primary responsibility |
| --- | --- |
| `PROFESSIONAL` | Discover learning content, maintain a professional profile, track PDU/CPD progress, credentials, certificates, payments, roadmaps, and external learning. |
| `PROVIDER` | Publish and manage courses, events, podcasts, YouTube channels, provider settings, attendees, analytics, and promotion requests. |
| `ORGANIZATION` | Manage members, departments, organization CPD categories, assignments, compliance reporting, events, and organization settings. |
| `ADMIN` | Manage users, organizations and access requests, platform content, promotion requests, taxonomy, analytics, and platform settings. |

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
│   └── front/
│       ├── public/                 # Static images, icons, and SVG sprite
│       ├── scripts/                # Frontend maintenance scripts
│       └── src/
│           ├── app/                # Next.js App Router routes and layouts
│           ├── components/         # UI, elements, guards, layouts, and modules
│           ├── hooks/              # Page and feature behavior
│           ├── i18n/               # English and French translations
│           ├── lib/                # GraphQL, RTK Query, validation, and utilities
│           ├── providers/          # Theme, language, and Redux providers
│           ├── types/              # Frontend contracts
│           └── utils/              # Constants and focused helpers
├── context/                        # Persistent project/AI documentation
├── package.json                    # Workspace commands
└── turbo.json                      # Task graph and cache configuration
```

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
  Framer Motion, GSAP, Swiper, React Flow, and Lucide
- Vitest and Testing Library dependencies (test coverage is not yet comprehensive)

### Backend

- NestJS 11 and strict TypeScript
- Apollo GraphQL, code-first schema generation
- Prisma 6 and PostgreSQL
- JWT, Passport, Argon2, cookie-based access/refresh sessions
- Email and OAuth integrations (Google, LinkedIn, and Facebook-related support)
- Stripe, SendGrid/Resend, spreadsheet/PDF, Puppeteer, and upload dependencies
  used by or available to feature modules

### Workspace

- npm 10 workspaces
- Turborepo 2
- ESLint 9 and Prettier 3
- Jest and Supertest for the API

## System Architecture

```text
Browser
  └─ Next.js frontend
      └─ RTK Query endpoints
          └─ credentialed GraphQL requests
              └─ NestJS resolvers
                  └─ feature services
                      └─ Prisma
                          └─ PostgreSQL
```

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
2. `npm run codegen --workspace front` generates
   `src/lib/graphql/generated.ts`.
3. Feature endpoints in `src/lib/rtk/endpoints` use those typed documents.
4. `graphqlBaseQuery` sends cookies, maps GraphQL errors, performs a
   single-flight refresh on `401`, and retries the original operation once.

`generated.ts` is generated code and must not be edited manually.

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

The API applies globally:

- configuration from `apps/api/.env`;
- cookie parsing;
- CORS for the configured frontend origin with credentials;
- a strict `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`);
- `JwtAuthGuard` followed by `RolesGuard`.

Operations are authenticated by default. Anonymous operations require
`@Public()`, and restricted operations declare allowed Prisma roles with
`@Roles(...)`.

The backend uses aliases such as `@app`, `@auth`, `@admin`, `@course`,
`@events`, `@professional`, `@provider`, `@org`, `@prisma`, `@common`, and
`@utils`.

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

### Commands

Run from the repository root:

```bash
npm install
npm run dev
npm run build
npm run lint
```

Workspace-specific commands:

```bash
npm run dev --workspace front
npm run dev --workspace api
npm run codegen --workspace front
npm run test --workspace api
npm run test:e2e --workspace api
npm run db:seed --workspace api
```

The frontend defaults to `http://localhost:3000`. The API defaults to
`http://localhost:5700`, with GraphQL at `/graphql`.

For Prisma work:

```bash
npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma migrate dev --schema apps/api/prisma/schema.prisma --name <name>
npx prisma migrate status --schema apps/api/prisma/schema.prisma
```

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

Only non-sensitive browser configuration may use the `NEXT_PUBLIC_` prefix.
The repository should maintain sanitized `.env.example` files and explicitly
ignore real `.env` files before secrets are committed.

## Known Constraints and Technical Debt

- The root `README.md` is incomplete and contains stale setup guidance (including
  pnpm and an obsolete repository structure); this overview is more reliable.
- Some source/log text and older context files contain mojibake and should be
  normalized to UTF-8 when touched.
- The root Turbo graph declares `check-types`, but workspace packages do not
  currently expose matching `check-types` scripts.
- The frontend `lint` script uses `next lint`, which is no longer the preferred
  Next.js 16 lint entry point and should be updated deliberately.
- The frontend package uses Next.js 16 while `eslint-config-next` is still on
  version 15; keep framework/tooling versions aligned during dependency work.
- The API declares both Prisma 6 packages and `@prisma/adapter-pg` 7; verify
  compatibility before adopting the adapter.
- Automated tests are sparse relative to the number of modules. A successful
  build does not prove role, ownership, payment, upload, or CPD behavior.
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
- Reuse existing components, hooks, endpoints, types, and validation schemas
  before adding equivalents.
- Update this document when roles, architecture, setup, data model, or a major
  integration changes.
