# CLAUDE.md

Guidance for Claude Code and other AI coding assistants working in this repository.

## Project Overview

Loopskey is a full-stack learning and CPD platform organized as an npm workspace monorepo.

- Backend: NestJS 11, GraphQL code-first, Prisma, PostgreSQL, JWT cookies, OAuth, RBAC.
- Frontend: Next.js App Router, React 19, TypeScript, Tailwind CSS, Radix UI/shadcn-style components, RTK Query over GraphQL.
- Workspace tooling: npm workspaces with Turbo for root-level orchestration.

The product supports role-specific experiences for `ADMIN`, `PROFESSIONAL`, `PROVIDER`, and `ORGANIZATION` users. Core domains include authentication, courses, events, podcasts, YouTube content, content interactions, CPD/PDU tracking, roadmaps, provider dashboards, organization dashboards, and admin management.

## Repository Layout

```text
.
|-- apps/
|   |-- api/                  # NestJS GraphQL API
|   |   |-- prisma/           # Prisma schema, migrations, seed entrypoint
|   |   `-- src/
|   |       |-- common/       # Shared API types and utilities
|   |       |-- graphql/      # Generated GraphQL schema output
|   |       |-- main.ts       # API bootstrap
|   |       `-- modules/      # Feature modules
|   `-- front/                # Next.js frontend
|       `-- src/
|           |-- app/          # App Router route groups and pages
|           |-- components/   # UI, layout, guard, and feature components
|           |-- hooks/        # Feature and form hooks
|           |-- i18n/         # en/fr translation JSON
|           |-- lib/          # GraphQL docs/generated types, RTK, validations
|           |-- providers/    # Redux, theme, language providers
|           |-- types/        # Frontend TypeScript types
|           `-- utils/        # Constants and helpers
|-- package.json              # Root Turbo scripts and workspaces
|-- package-lock.json
`-- turbo.json
```

There is no active `packages/` directory in this repo. Do not assume shared package paths exist unless you create them intentionally.

## Commands

Run commands from the repository root unless a command explicitly says otherwise.

```bash
npm install
npm run dev
npm run build
npm run lint
```

Workspace-specific commands:

```bash
# API
npm run dev --workspace api
npm run build --workspace api
npm run lint --workspace api
npm test --workspace api
npm run test:e2e --workspace api
npm run db:seed --workspace api

# Frontend
npm run dev --workspace front
npm run build --workspace front
npm run lint --workspace front
npm run codegen --workspace front
npm run svg-spritor --workspace front
```

The API defaults to `APP_PORT=5700`. The frontend defaults to Next's `3000` unless the port is occupied.

## Backend Architecture

The API lives in `apps/api` and uses NestJS modules grouped by domain:

- `auth`: registration, login, JWT cookies, refresh tokens, OAuth, guards, decorators.
- `user`: user profile and account operations.
- `course`, `events`, `podcast`, `youtube`: learning content domains.
- `content-interaction`: wishlist, cart, enrollment, reviews, and related user/content actions.
- `professional`: professional dashboard, CPD/PDU, certificates, roadmap, payments.
- `provider`: provider profile, events, analytics, promotion requests.
- `organization`: organization users, departments, assignments, compliance/reporting.
- `admin`: admin dashboard, user/org management, access requests.
- `landing`, `external-learning`, `mail`, `prisma`: support and integration modules.

Important backend conventions:

- `AppModule` registers global `JwtAuthGuard` and `RolesGuard`. Public endpoints must use the local `@Public()` decorator.
- Role-restricted resolvers should use the existing `@Roles(...)` decorator and enum types already present in the auth module.
- GraphQL is code-first with schema output controlled by `GRAPHQL_SCHEMA_PATH`, defaulting to `src/graphql/schema.gql`.
- Resolvers should stay thin: validate/authorize via decorators and delegate business logic to services.
- Prisma access should go through `PrismaService` from `@prisma/prisma.service`.
- `ValidationPipe` is global with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled. DTOs should use `class-validator` decorators.
- API path aliases are defined in `apps/api/tsconfig.json`; prefer existing aliases such as `@auth/*`, `@course/*`, `@provider/*`, `@org/*`, and `@professional/*`.

When changing the database:

1. Update `apps/api/prisma/schema.prisma`.
2. Create a migration with Prisma from `apps/api` or by passing the schema path.
3. Update seed data in `apps/api/prisma/seed.ts` or `apps/api/prisma/seeds/` when needed.
4. Regenerate Prisma Client if the workflow did not do it automatically.

## Frontend Architecture

The frontend lives in `apps/front` and uses Next.js App Router.

Route groups:

- `src/app/(auth)`: authentication screens.
- `src/app/(dashboards)`: role-specific dashboards under `/dashboard/...`.
- `src/app/(pages)`: public informational/content pages.

Key frontend conventions:

- Use existing path aliases from `apps/front/tsconfig.json`, especially `@/*`, `@components/*`, `@modules/*`, `@ui/*`, `@hooks/*`, `@lib/*`, and `@utils/*`.
- Prefer existing shadcn/Radix-style components in `src/components/ui` before introducing new primitives.
- Feature UI belongs under `src/components/modules/<Feature>`.
- Data and behavior for larger components usually belongs in `src/hooks/use<Feature>.ts`.
- Global providers are wired in `src/app/layout.tsx`, `src/providers/app-provider.tsx`, and `src/providers/rtk-provider.tsx`.
- Translation keys live in `src/i18n/en.json` and `src/i18n/fr.json`; keep both files in sync when adding user-facing text.
- Constants, route helpers, options, and icon maps belong in `src/utils/constant.ts` or a nearby existing util file.

GraphQL frontend flow:

- GraphQL documents live in `src/lib/graphql/documents/*.graphql`.
- Generated types/documents are written to `src/lib/graphql/generated.ts`.
- RTK Query endpoints live in `src/lib/rtk/endpoints/*.api.ts`.
- The shared `graphqlBaseQuery` posts to `NEXT_PUBLIC_GRAPHQL_URL` with `credentials: "include"` and retries once through `RefreshTokenDocument` on 401.
- After API schema or GraphQL document changes, run `npm run codegen --workspace front`.

## Environment Variables

Do not commit secrets. The repo currently uses app-local `.env` files.

API variables seen in this project include:

```text
DATABASE_URL
APP_NAME
APP_HOST
APP_PORT
FRONTEND_URL
GRAPHQL_PLAYGROUND
GRAPHQL_SCHEMA_PATH
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN_DAYS
ACCESS_TOKEN_COOKIE_NAME
REFRESH_TOKEN_COOKIE_NAME
ACCESS_TOKEN_COOKIE_MAX_AGE_MS
COOKIE_SECURE
COOKIE_DOMAIN
COOKIE_SAME_SITE
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
OAUTH_REDIRECT_URL
GOOGLE_CALENDAR_REDIRECT
RESEND_API_KEY
EMAIL_FROM
ADMIN_EMAIL
ADMIN_PASSWORD
SEED_TEST_PASSWORD
```

Frontend variables seen in this project:

```text
NEXT_PUBLIC_GRAPHQL_URL
JWT_ACCESS_SECRET
```

`NEXT_PUBLIC_GRAPHQL_URL` should point at the API GraphQL endpoint, commonly `http://localhost:5700/graphql` in local development.

## Implementation Workflow

For backend-to-frontend GraphQL work:

1. Add or update Prisma models/enums if persistence changes are needed.
2. Add API DTOs/entities/resolver/service methods inside the relevant Nest module.
3. Run the API build/tests for the touched area.
4. Update frontend `.graphql` documents.
5. Run `npm run codegen --workspace front`.
6. Use generated types and documents from `@/lib/graphql/generated`.
7. Add or update RTK endpoints and hooks/components.
8. Build or type-check the touched workspace before finishing.

For frontend-only work:

1. Reuse existing components from `src/components/ui`, `elements`, and `layouts`.
2. Keep module-specific UI in `src/components/modules`.
3. Keep page components light; move stateful logic into hooks when it grows.
4. Update both translation files for visible strings.
5. Verify responsive layouts and role-based navigation paths.

## Quality Checks

Prefer the narrowest meaningful verification:

```bash
npm run build --workspace api
npm test --workspace api
npm run build --workspace front
npm run codegen --workspace front
npm run lint --workspace front
```

Notes:

- API lint runs ESLint with `--fix`, so it can modify files.
- Frontend `generated.ts`, `.next/`, `dist/`, `node_modules/`, and `tsconfig.tsbuildinfo` are generated artifacts; avoid manual edits unless the task specifically requires them.
- Root `npm run build` invokes Turbo and may build both apps.

## Common Pitfalls

- The root README and app READMEs may be stale or boilerplate; trust source code and package scripts first.
- Because auth guards are global, missing `@Public()` is a common cause of unexpected authentication failures.
- Cookie auth requires API CORS `origin` and frontend URL/env values to match.
- When changing GraphQL names or enums, update API entities, schema generation, frontend documents, generated types, RTK endpoints, and i18n labels together.
- Prisma enum values are used across API, generated GraphQL types, frontend route helpers, filters, and dashboards. Treat enum changes as cross-app changes.
- Do not hand-edit generated GraphQL output or Prisma migrations to "quick fix" type issues.
- Keep organization/provider/professional/admin dashboard behavior role-scoped; avoid sharing mutations or cache tags casually across roles.

## Coding Style

- TypeScript strictness is enabled in both apps. Avoid `any` unless there is a local precedent and a clear boundary.
- Use existing aliases and naming patterns instead of deep relative imports.
- Keep services responsible for business logic, resolvers/controllers for transport, and frontend hooks for orchestration.
- Prefer arrow functions over regular function declarations, unless the existing code pattern or a specific technical reason requires otherwise.
- When an `if` condition has a single-line statement, omit curly braces.
- Prefer small, focused changes over broad refactors.
- Add tests or targeted verification when touching auth, payments, role access, Prisma schema, token refresh, or shared RTK behavior.
