# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack **monorepo** for a course/learning platform built with:
- **Backend**: NestJS + GraphQL (code-first) + Prisma ORM + PostgreSQL
- **Frontend**: Next.js 16+ with React 19, TypeScript, Tailwind CSS, Radix UI
- **Build tool**: Turbo for monorepo orchestration
- **Package manager**: npm workspaces

The platform supports multiple user roles (`ADMIN`, `PROFESSIONAL`, `PROVIDER`) with role-based access control (RBAC), authentication (email/password and Google OAuth), and learning features (courses, videos, podcasts, roadmaps, external content).

## Monorepo Structure

```
apps/
  api/              # NestJS backend with GraphQL
    src/
      modules/      # Feature modules (auth, user, course, podcast, provider, etc.)
      common/       # Shared utilities and types
      graphql/      # Generated GraphQL schema
      main.ts       # NestJS bootstrap
  front/            # Next.js frontend
    src/
      app/          # Next.js app router (auth, dashboards, pages groups)
      components/   # Reusable React components
      hooks/        # Custom React hooks
      lib/          # Utilities and helpers
      providers/    # Context providers
      types/        # TypeScript type definitions
      utils/        # Helper functions
```

## Common Commands

### Root level (Turbo)
```bash
npm run dev      # Start dev servers for all apps (watch mode)
npm run build    # Build all apps
npm run lint     # Lint all apps
```

### Backend only (apps/api)
```bash
npm run dev           # Start NestJS dev server with watch (port 5700)
npm run build         # Compile TypeScript to dist/
npm run start:prod    # Run compiled production build
npm run lint          # Fix linting issues with ESLint
npm test              # Run unit tests (*.spec.ts files)
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Generate coverage reports
npm run test:e2e      # Run e2e tests
npm run db:seed       # Seed database with sample data
```

### Frontend only (apps/front)
```bash
npm run dev       # Start Next.js dev server with Turbopack (port 3000)
npm run build     # Build production bundle
npm run start     # Serve production build
npm run lint      # Check code quality with ESLint
npm run codegen   # Generate TypeScript types from GraphQL schema
```

## Architecture Patterns

### Backend (NestJS + GraphQL)

**Module-based organization**: Each feature lives in its own module (e.g., `modules/auth`, `modules/user`, `modules/course`). Modules export services that are consumed by GraphQL resolvers.

**Authentication & Authorization**:
- JWT-based auth with HTTP-only cookies
- Global `JwtAuthGuard` applied to all routes (except public endpoints decorated with `@Public()`)
- `RolesGuard` enforces role-based access control via `@Roles()` decorator
- Google OAuth integration with Passport strategies
- Session verification and token refresh logic

**GraphQL**:
- Code-first approach using decorators (`@ObjectType`, `@Query`, `@Mutation`)
- Schema auto-generated to `src/graphql/schema.gql`
- Resolvers in dedicated `*.resolver.ts` files
- Type definitions use class-based GraphQL objects

**Database**: Prisma ORM with PostgreSQL. Schema migrations live in `prisma/migrations/`. Always run `prisma migrate` after schema changes.

**Key modules**:
- `auth`: Authentication, JWT tokens, OAuth strategies
- `user`: User management, profile, roles
- `course`: Course content and curriculum
- `podcast`: Podcast content
- `youtube`: External YouTube content integration
- `professional`: Professional user features
- `provider`: Provider user features
- `admin`: Admin dashboard and management tools
- `external-learning`: Integration with external learning resources

### Frontend (Next.js 16)

**App Router**: Uses Next.js app directory with route groups for organizing layouts.
- `(auth)` — Authentication pages
- `(dashboards)` — Role-based dashboards
- `(pages)` — General pages

**GraphQL Client**: Uses TanStack Query (React Query) with Apollo Client for data fetching.

**Component library**: Radix UI primitives + custom Tailwind CSS styling.

**State management**: Redux Toolkit (via Redux store in providers).

**Internationalization**: i18next for multi-language support.

## Development Workflow

### When working on a feature:
1. **Backend first**: Add GraphQL types and resolvers in the relevant module
2. **Run codegen** (`npm run codegen` in front/) to generate TypeScript types
3. **Frontend**: Build components and hooks using the generated types
4. **Test locally**: Start both servers (`npm run dev` from root)

### When modifying the database:
1. Update Prisma schema in `apps/api/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name <name>`
3. If needed, update seed file in `prisma/seed.ts`

### When adding a new API endpoint:
1. Create resolver method in the appropriate module's `.resolver.ts`
2. Decorate with `@Query`, `@Mutation`, and `@Roles` if needed
3. Use `@Public()` for unauthenticated endpoints
4. Run `npm run codegen` in frontend to regenerate types

## Environment Variables

Backend (`.env` in `apps/api/`):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET`, `JWT_EXPIRES_IN` — JWT configuration
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` — OAuth
- `APP_PORT`, `APP_HOST` — Server configuration
- `FRONTEND_URL` — CORS and redirect target
- `SENDGRID_API_KEY` or `RESEND_API_KEY` — Email service (for OTP, password reset)

Frontend (`.env` in `apps/front/`):
- `BACKEND_URL` — GraphQL endpoint (passed via proxy.ts)

## Testing

- **Unit tests**: Use Jest with ts-jest. Place test files next to source as `*.spec.ts`
- **E2E tests**: Configure in `test/jest-e2e.json`
- **Test data**: Use `@faker-js/faker` for generating realistic test data
- Coverage reports go to `coverage/` at root level

## Key Technologies & Versions

- Node.js ≥ 18
- NestJS 11, GraphQL 16, Apollo Server 4
- Next.js 16 with React 19
- Prisma 6 with PostgreSQL adapter
- TypeScript 5.7
- ESLint 9, Prettier 3
- Jest 29 for testing

## Common Gotchas & Tips

1. **GraphQL schema generation**: Always run `npm run codegen` in frontend after modifying resolvers
2. **Database migrations**: Never manually edit `prisma/migrations/` — use `prisma migrate`
3. **CORS**: Ensure `FRONTEND_URL` env var matches your frontend origin in backend
4. **Authentication**: Public routes must be decorated with `@Public()` to bypass JWT guard
5. **Role-based routes**: Use `@Roles(UserRole.ADMIN)` to restrict resolvers; frontend routing also checks user role in auth middleware
6. **Module path aliases**: Backend uses `@<alias>` for imports (configured in `tsconfig.json` and `nest-cli.json`). Frontend uses standard `@` alias.
