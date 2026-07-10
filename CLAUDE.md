# CLAUDE.md

Guidance for Claude Code and other AI coding assistants working in this repository.

## Project Overview

Loopskey is a full-stack learning and CPD platform organized as an npm workspace monorepo.

- Backend: NestJS 11, GraphQL code-first, Prisma, PostgreSQL, JWT auth, OAuth, RBAC, httpOnly cookie sessions.
- Frontend: Next.js App Router, React 19, TypeScript, Tailwind CSS, Radix UI/shadcn-style components, RTK Query over GraphQL.
- Workspace tooling: npm workspaces with Turbo for root-level orchestration.

The product supports role-specific experiences for `ADMIN`, `PROFESSIONAL`, `PROVIDER`, and `ORGANIZATION` users. Core domains include authentication, courses, events, podcasts, YouTube content, content interactions, CPD/PDU tracking, roadmaps, provider dashboards, organization dashboards, and admin management.

Always inspect the existing implementation before changing architecture. Prefer the patterns already used in the touched module over introducing a new style.

## Repository Layout

```text
.
|-- apps/
|   |-- api/                              # NestJS GraphQL API
|   |   |-- prisma/
|   |   |   |-- schema.prisma             # Prisma data model
|   |   |   |-- migrations/               # Database migrations
|   |   |   `-- seeds/                    # Domain seed data
|   |   `-- src/
|   |       |-- common/
|   |       |   |-- types/                # Shared backend TypeScript types
|   |       |   `-- utils/                # Shared backend utilities/constants
|   |       |-- graphql/                  # Generated GraphQL schema output
|   |       |-- main.ts                   # API bootstrap
|   |       `-- modules/                  # Domain modules
|   |           `-- <domain>/
|   |               |-- controllers/       # REST/OAuth callbacks only when needed
|   |               |-- decorators/        # Domain decorators
|   |               |-- dtos/              # GraphQL inputs and validated DTOs
|   |               |-- entities/          # GraphQL object types
|   |               |-- enums/             # Domain enum and GraphQL name constants
|   |               |-- guards/            # Domain guards
|   |               |-- resolvers/         # GraphQL transport layer
|   |               |-- services/          # Business logic
|   |               `-- types/             # Domain TypeScript-only types/interfaces
|   `-- front/                            # Next.js frontend
|       `-- src/
|           |-- app/                      # App Router route groups and pages
|           |-- components/
|           |   |-- ui/                   # shadcn/Radix primitives
|           |   |-- elements/             # Reusable app UI elements
|           |   |-- layouts/              # Shells, headers, dashboard layouts
|           |   |-- guards/               # Route/access guards
|           |   `-- modules/              # Feature-specific UI modules
|           |-- hooks/                    # Component/page logic and data orchestration
|           |-- i18n/                     # en/fr translation JSON
|           |-- lib/
|           |   |-- graphql/
|           |   |   |-- documents/        # Source GraphQL operations
|           |   |   `-- generated.ts      # Generated GraphQL types/documents
|           |   |-- rtk/                  # RTK Query base API and endpoints
|           |   `-- validations/          # Zod schemas and inferred form types
|           |-- providers/                # Redux, theme, language providers
|           |-- types/                    # Frontend TypeScript-only types/interfaces
|           `-- utils/                    # Constants, config maps, helpers
|-- package.json                          # Root Turbo scripts and workspaces
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

## Frontend Architecture

The frontend lives in `apps/front` and uses Next.js App Router.

Route groups:

- `src/app/(auth)`: authentication screens.
- `src/app/(dashboards)`: role-specific dashboards under `/dashboard/...`.
- `src/app/(pages)`: public informational/content pages.

Path aliases are defined in `apps/front/tsconfig.json`. Prefer aliases such as `@/*`, `@components/*`, `@modules/*`, `@ui/*`, `@elements/*`, `@hooks/*`, `@lib/*`, `@types/*`, and `@utils/*` instead of deep relative imports.

### Frontend Folder Rules

- `src/components/ui`: shadcn/Radix primitive components. Reuse these before adding new primitives.
- `src/components/elements`: reusable Loopskey UI elements that can appear in multiple modules or pages. If a component is generic, reusable, or not tied to one feature, place it here.
- `src/components/modules/<Feature>`: feature-specific UI. Keep module components focused on rendering and composition.
- `src/components/modules/<Feature>/parts`: smaller pieces used only by that feature module.
- `src/components/layouts`: app shells, headers, footers, dashboard layout, sidebar, and navigation layout pieces.
- `src/components/guards`: route and role guards.
- `src/hooks`: all non-trivial frontend behavior, form orchestration, data fetching orchestration, UI state machines, and API mutation/query handling.
- `src/types`: dedicated frontend TypeScript types and interfaces. Do not define reusable app/domain types inside components or hooks.
- `src/lib/validations`: Zod schemas and inferred form/validation types.
- `src/lib/graphql/documents`: `.graphql` operation documents.
- `src/lib/graphql/generated.ts`: generated GraphQL types and typed documents. Do not hand-edit this file.
- `src/lib/rtk/endpoints`: RTK Query endpoint files grouped by domain.
- `src/utils`: constants, route helpers, option maps, icon maps, and small pure helpers.

TypeScript types must stay separated into dedicated type files/folders:

- Frontend shared/domain types belong in `apps/front/src/types/*.types.ts`.
- Backend shared types belong in `apps/api/src/common/types/*.types.ts`.
- Backend domain-only types belong in `apps/api/src/modules/<domain>/types/*.types.ts`.
- Generated GraphQL operation/result types must come from `@/lib/graphql/generated`.
- Zod form value types should be inferred beside the schema in `src/lib/validations/*.schema.ts`.
- Avoid exporting reusable interfaces from `.tsx` component files. Move them to a nearby `types` file or the global `src/types` folder.

Constants must stay in dedicated constant/config locations:

- Frontend constants should live in `src/utils/constant.ts`, `src/utils/*.constant.ts`, or another existing dedicated util/config file such as `dashboard-nav.config.ts`.
- Backend constants should live in `common/utils`, `common/types` only when type-only, or in module-local `enums`, `types`, or dedicated `*.constant.ts` files.
- Do not inline repeated routes, labels, enum maps, option arrays, GraphQL names, cookie names, role maps, or magic numbers inside components/services.

### Component Rules

- Before creating a component, decide whether it is feature-specific or reusable.
- Reusable UI belongs in `src/components/elements`.
- Feature-only UI belongs in `src/components/modules/<Feature>` or its `parts` folder.
- Page files in `src/app` should stay light and mostly compose modules/layouts.
- Do not put data fetching, mutations, form submit handlers, or complex state transitions directly inside components.
- If a component needs API data, mutations, derived state, validation state, filtering, pagination, tabs, or side effects, create or reuse a custom hook in `src/hooks/use<Feature>.ts`.
- Keep components presentational where possible: receive values, callbacks, loading/error states, and render UI.
- Use `lucide-react` icons when a matching icon exists, consistent with `components.json`.
- Keep visible text in i18n files when the surrounding feature uses translations. Update both `src/i18n/en.json` and `src/i18n/fr.json`.

### Forms and Validation

- Use `react-hook-form` for forms.
- Use Zod for every form, every validated field group, and any user input that needs validation.
- Put schemas in `src/lib/validations/*.schema.ts`.
- Use `zodResolver` from `@hookform/resolvers/zod`.
- Infer form types from schemas with `z.infer`, `z.input`, or `z.output`; do not duplicate schema types manually.
- Keep submit orchestration inside hooks, not in the JSX component.

### GraphQL and RTK Query

The frontend data layer uses RTK Query over generated GraphQL documents. Follow the existing code generation workflow.

- GraphQL documents live in `src/lib/graphql/documents/*.graphql`.
- Generated types and typed documents are written to `src/lib/graphql/generated.ts`.
- RTK Query base API lives in `src/lib/rtk/baseApi.ts`.
- GraphQL transport lives in `src/lib/rtk/graphqlBaseQuery.ts`.
- Domain endpoints live in `src/lib/rtk/endpoints/*.api.ts`.
- Endpoint files should use generated operation types from `@/lib/graphql/generated`.
- Endpoint files should inject into `baseApi` with `baseApi.injectEndpoints`.
- Hooks/components should call generated RTK hooks exported by endpoint files.
- Do not call `fetch` directly in components for application API data.
- Do not hand-write GraphQL response types when codegen can generate them.
- After API schema or frontend GraphQL document changes, run `npm run codegen --workspace front`.

Important existing behavior:

- `graphqlBaseQuery` sends `credentials: "include"` so browser requests include the auth cookies.
- On 401 responses, it retries once through the generated `RefreshTokenDocument`.
- Cache tags are centralized in `baseApi`; add domain tags there before using them in endpoint files.

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

Path aliases are defined in `apps/api/tsconfig.json`. Prefer aliases such as `@auth/*`, `@course/*`, `@events/*`, `@provider/*`, `@org/*`, `@professional/*`, `@admin/*`, `@prisma/*`, `@utils/*`, and `@types/*`.

### Backend Folder Rules

Each domain module should follow the existing Nest folder structure:

- `*.module.ts`: declare module imports, providers, controllers, and exports.
- `resolvers/`: GraphQL resolvers. Keep them thin.
- `controllers/`: REST or OAuth callback controllers only when GraphQL is not the right transport.
- `services/`: business logic, Prisma access, orchestration, and external integrations.
- `dtos/`: GraphQL input classes and validated DTOs.
- `entities/`: GraphQL object types returned by resolvers.
- `enums/`: GraphQL names, message codes, registration helpers, and domain enums.
- `guards/`: domain guards when needed.
- `decorators/`: domain decorators when needed.
- `types/`: TypeScript-only types/interfaces for service boundaries.

Backend conventions:

- `AppModule` registers global `JwtAuthGuard` and `RolesGuard`. Public endpoints must use the local `@Public()` decorator.
- Role-restricted resolvers should use the existing `@Roles(...)` decorator and Prisma/Nest enum types already present in the auth module.
- GraphQL is code-first with schema output controlled by `GRAPHQL_SCHEMA_PATH`, defaulting to `src/graphql/schema.gql`.
- Resolvers should validate/authorize via decorators and delegate business logic to services.
- Services should own Prisma queries and business rules.
- Prisma access should go through `PrismaService` from `@prisma/prisma.service`.
- `ValidationPipe` is global with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled.
- API DTOs should use `class-validator` and `class-transformer` decorators where validation/coercion is needed.
- Use GraphQL `@InputType`, `@ObjectType`, `@Field`, and related decorators consistently with existing modules.
- Return structured success/code/message payloads where the module already uses that pattern.
- Keep message codes and GraphQL names in dedicated enum/constant files instead of string literals.

When changing the database:

1. Update `apps/api/prisma/schema.prisma`.
2. Create a migration with Prisma from `apps/api` or by passing the schema path.
3. Update seed data in `apps/api/prisma/seed.ts` or `apps/api/prisma/seeds/` when needed.
4. Regenerate Prisma Client if the workflow did not do it automatically.
5. Update API entities/DTOs/resolvers/services.
6. Regenerate the GraphQL schema and frontend codegen if the API contract changed.

## Authentication and Security

Authentication uses secure httpOnly cookies.

- Login and refresh write access and refresh tokens to cookies in `AuthSessionService`.
- Cookies are set with `httpOnly: true`, configurable `secure`, `sameSite`, `domain`, `path`, and max-age options.
- The frontend should not read JWTs from JavaScript. Do not move tokens into localStorage, sessionStorage, Redux, or client-readable cookies.
- The JWT strategy extracts the access token from cookies through `cookieExtractor` and also supports bearer tokens as a fallback.
- Refresh tokens are hashed before being stored on auth sessions.
- Logout revokes the active session and clears auth cookies.
- Frontend GraphQL requests must keep `credentials: "include"`.
- API CORS must allow the configured `FRONTEND_URL` and `credentials: true`.
- Treat auth, roles, sessions, refresh, and cookie config as high-risk areas. Add targeted tests or manual verification when touching them.

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
3. Keep backend TypeScript types in `common/types` or module-local `types`.
4. Run the API build/tests for the touched area.
5. Update frontend `.graphql` documents.
6. Run `npm run codegen --workspace front`.
7. Use generated types and documents from `@/lib/graphql/generated`.
8. Add or update RTK endpoint files in `src/lib/rtk/endpoints`.
9. Move frontend orchestration into a custom hook in `src/hooks`.
10. Keep reusable UI in `src/components/elements` and feature UI in `src/components/modules`.
11. Build or type-check the touched workspace before finishing.

For frontend-only work:

1. Reuse existing components from `src/components/ui`, `elements`, and `layouts`.
2. Decide whether each new component is reusable or module-specific before placing it.
3. Keep module-specific UI in `src/components/modules`.
4. Move data fetching, mutations, form handling, and stateful behavior into custom hooks.
5. Keep TypeScript types in `src/types` or inferred from Zod schemas in `src/lib/validations`.
6. Keep constants in dedicated util/constant/config files.
7. Use Zod validation for forms and validated fields.
8. Update both translation files for visible strings when the feature is localized.
9. Verify responsive layouts and role-based navigation paths.

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
- Cookie auth requires API CORS `origin`, cookie same-site/secure/domain settings, and frontend URL/env values to match.
- The frontend depends on httpOnly cookies and `credentials: "include"`; token handling changes can break auth silently.
- When changing GraphQL names or enums, update API entities, schema generation, frontend documents, generated types, RTK endpoints, cache tags, and i18n labels together.
- Prisma enum values are used across API, generated GraphQL types, frontend route helpers, filters, and dashboards. Treat enum changes as cross-app changes.
- Do not hand-edit generated GraphQL output or Prisma migrations to quick-fix type issues.
- Keep organization/provider/professional/admin dashboard behavior role-scoped; avoid sharing mutations or cache tags casually across roles.
- Do not hide reusable types, constants, or validation schemas inside components.
- Do not put API calls directly in components when an RTK endpoint and custom hook should own that logic.

## Coding Style

- TypeScript strictness is enabled in both apps. Avoid `any` unless there is a local precedent and a clear boundary.
- Use existing aliases and naming patterns instead of deep relative imports.
- Keep services responsible for business logic, resolvers/controllers for transport, frontend hooks for orchestration, and components for rendering.
- Prefer generated GraphQL types, Zod-inferred types, and dedicated `types` folders over duplicated manual interfaces.
- Prefer arrow functions over regular function declarations, unless the existing code pattern or a specific technical reason requires otherwise.
- When an `if` condition has a single-line statement, omit curly braces to match the current style.
- Prefer small, focused changes over broad refactors.
- Add tests or targeted verification when touching auth, payments, role access, Prisma schema, token refresh, cookie behavior, or shared RTK behavior.
