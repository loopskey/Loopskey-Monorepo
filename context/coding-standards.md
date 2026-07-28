# Loopskey Coding Standards

These rules apply to new code and files being actively changed. Do not perform
unrelated refactors just to make old code conform. When existing patterns
conflict, prefer the rule below unless compatibility requires the old pattern.

## Core Principles

- Keep changes focused, typed, testable, and easy to review.
- Prefer clear domain code over clever or premature abstractions.
- Reuse existing components, hooks, endpoints, DTOs, enums, and utilities.
- Separate UI, transport, business rules, and persistence.
- Validate at every trust boundary; frontend validation is never authorization.
- Do not leave unused imports, commented-out code, placeholders, debug logs, or
  unexplained magic values in completed work.
- Do not add a speculative export to a shared package. An export with no
  consumer is unused code that is harder to delete later, because removing it
  looks like a breaking change.

## Multi-Developer Feature Workflow

- Treat the feature specification as scope and the matching
  `context/feature-runs/active/<slug>.md` file as execution state.
- Never use `context/current-feature.md` as shared mutable state.
- Branch from the verified `origin/develop`; merge normal work through a reviewed
  PR to `develop`.
- Record the base commit so review and explanation use a stable diff.
- A code change after verification invalidates that verification. A code change
  after review invalidates both review and verification.
- Do not commit unrelated working-tree files with a feature.
- Do not commit, push, merge, or delete a branch before the required approval.
- Preserve an immutable completed run record under
  `context/feature-runs/completed/`.

## Shared Packages

Three private workspace packages exist under `packages/`. Their contents,
consumers and rationale are documented in `context/project-overview.md`; this
section is the rule set for changing them.

### When a value belongs in `@loopskey/api-contracts`

**All** of these must hold. If any fails, fix it inside the application instead:

1. **Both applications genuinely consume it.** Not "might later" — today. Every
   candidate for a `packages/utils` was rejected on this test alone: `slugify`,
   `trimToNull`, `humanizeEnumValue` and `formatFileSize` each had consumers in
   exactly one app, so the duplication was intra-app and was fixed there.
2. **The GraphQL schema cannot carry it.** Types, enums, inputs and payloads are
   already shared through code generation — 1,011 types and 75 enums. Restating
   any of them in the package creates a second source of truth for something
   that already has one.
3. **It is framework-free.** No `@prisma/client`, `@nestjs/*`, `next`, `react`
   or `react-dom`. Lint enforces this and a negative test proves the rule fires.

What qualifies today: message codes, multipart upload rules, cookie-name
defaults, and field bounds — precisely the surfaces the schema does not reach.

### Rules for the contract package

- **Never change an existing message-code value.** The value is the wire
  contract: the API publishes it as `extensions.code` and the frontend routes
  users on it. Add a new key instead. Two known-awkward values
  (`AdminDashboardMessageCode.ADMIN_ONLY = "AminOnly"`, and
  `PASSWORD_STRENGTH_MESSAGE`, whose value is an English sentence) are preserved
  for exactly this reason.
- **Consume it at a boundary, not everywhere.** Services and components import
  the app's own constant or enum file; only that file imports the package. This
  is why a contract change touches ~15 files rather than the ~80 they serve.
- **Share the value, never the enforcement.** The package supplies the MIME
  allowlist; the API still validates every upload independently. Frontend
  validation remains a UX affordance.
- **Share limits and predicates, not messages.** Error and validation messages
  are user-facing and translated on the frontend, and are not on the backend —
  they stay in their own application.
- **Anything the package restates needs a drift test.** `PLATFORM_ROLES` mirrors
  the Prisma `Role` enum because the package may not import Prisma;
  `apps/api/src/common/contract-drift.spec.ts` fails if they diverge.
- Adding an entry point means adding it to `exports` **and** `typesVersions`, so
  both `bundler` and `node10` resolution find it.

### Proposing a fourth package

The audit evaluated and rejected `packages/ui`, `packages/api-client`,
`packages/domain`, `packages/database`, `packages/env`, `packages/test-utils`
and `packages/utils`. Read those sections in `context/monorepo-audit.md` before
proposing one — most were rejected for having a single consumer, which is still
true.

## Formatting and Imports

- Use TypeScript for application code.
- Use two-space indentation, double quotes, semicolons, and trailing commas.
- Let Prettier control whitespace and wrapping.
- Prefer guard clauses over deep nesting.
- Use the configured path aliases instead of long relative imports.
- Order imports as: framework/external packages and `@loopskey/*` workspace
  packages, blank line, aliased/internal modules, blank line, relative files.
- Import the narrowest entry point a workspace package offers
  (`@loopskey/api-contracts/upload`, not the root) so the dependency reads
  clearly at the call site.
- Use `import type` when an import is only a type.
- Do not reformat or reorder unrelated code in a focused change. Scope a
  Prettier run to the files you touched — a broad `--write` glob reflows
  unrelated files and buries the real diff.

```ts
import { Injectable } from "@nestjs/common";
import { CERTIFICATE_LIMITS } from "@loopskey/api-contracts/validation";
import type { User } from "@prisma/client";

import { PrismaService } from "@prisma/prisma.service";
```

Short guard clauses may be one line:

```ts
if (!user) throw UserErrors.notFound();
if (isPublic) return true;
```

Use braces for multiple statements, `else`, or non-obvious work.

## Naming

- Files and directories: `kebab-case`.
- React components, classes, GraphQL types, and Prisma models: `PascalCase`.
- Variables, functions, hooks, GraphQL fields, and class methods: `camelCase`.
- Environment variables and true constants: `UPPER_SNAKE_CASE`.
- Boolean names should read as predicates: `isLoading`, `hasAccess`,
  `canManageMember`.
- Hooks must start with `use`.
- Input DTO files and classes end in `.input.ts` / `Input`.
- GraphQL output files use `.entity.ts`; compound responses normally end in
  `Payload`.
- Do not prefix types with `I` or `T` in new code. Existing `T...` frontend
  types are legacy conventions, not a requirement to copy.
- Avoid vague names such as `data`, `item`, `handle`, or `utils` when a domain
  name is available.

## TypeScript

- Keep strict mode enabled in both applications.
- Do not add `any`. Use a domain type, generic, discriminated union, or `unknown`
  followed by narrowing.
- Prefer `type` for props, arguments, unions, and local data shapes.
- Use `interface` only for an intentionally extendable public contract.
- Prefer inferred local types and explicit types at module boundaries.
- Avoid non-null assertions and broad type assertions.
- Use `as const` for immutable literal collections.
- Import shared domain enums from `@prisma/client`; do not duplicate them as
  strings.
- Parse and narrow external values before use.

```ts
type UpdateProfileArgs = {
  actorId: string;
  input: UpdateProfessionalProfileInput;
};

const message =
  error instanceof Error ? error.message : "Unexpected request failure";
```

## Functions and Classes

Use arrow functions for React components, hooks, callbacks, event handlers, and
standalone helpers.

```tsx
export const CourseCard = ({ course }: CourseCardProps) => {
  return <article>{course.title}</article>;
};
```

NestJS constructors and decorated methods use normal class method syntax so
framework metadata remains on the prototype.

```ts
@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedBySlug(slug: string) {
    return this.prisma.course.findFirst({ where: { slug } });
  }
}
```

- Prefer named argument objects once a service method accepts multiple
  same-shaped or optional values.
- Keep functions focused. Extract validation, mapping, or persistence helpers
  when responsibilities become mixed.
- Avoid boolean parameters whose meaning is unclear at the call site.

## Frontend Standards

### Boundaries

- Pages and layouts compose features; they should not contain large business
  workflows.
- `components/ui` contains low-level reusable primitives.
- `components/elements` contains reusable project-specific composites.
- `components/layouts` contains shared page chrome.
- `components/modules` contains feature/dashboard UI.
- Hooks own reusable stateful behavior and orchestration.
- `lib/validations` owns Zod schemas.
- `types` owns frontend contracts, not API calls or runtime behavior.

Keep server components by default. Add `"use client"` only when the component
uses state, effects, browser APIs, event handlers, or a client-only provider.
Push the client boundary as low as practical.

### Components and State

- Define a named props type; avoid large inline prop types.
- Prefer composition over deeply configurable components.
- Do not copy props into state unless intentionally creating an editable draft.
- Derive values during render; use `useMemo` only for measured expensive work or
  referential stability that matters.
- Use `useEffect` only to synchronize with an external system.
- Keep temporary UI state local. Use Redux only for state shared across distant
  features; use RTK Query for API state.
- Never put secrets, access tokens, or refresh tokens in Redux/local storage.
- Give list elements stable domain keys, never array indexes when order changes.

### Forms

- Use React Hook Form with a Zod schema for non-trivial forms.
- Keep schema, TypeScript values, and backend input semantics aligned.
- Show field-level errors and disable or protect against duplicate submission.
- Normalize optional empty values deliberately (`undefined`, `null`, or empty
  string must match the API contract).
- Backend validation remains authoritative.

### Styling and Accessibility

- Use Tailwind CSS 4 utilities and the existing design tokens in
  `src/app/globals.css`.
- Merge conditional classes with the existing `cn` helper.
- Reuse Radix/shadcn primitives before creating a new accessible primitive.
- Avoid unexplained arbitrary colors and spacing when a token exists.
- Build responsive layouts mobile-first.
- Use semantic HTML, correctly associated labels, accessible names, keyboard
  support, visible focus, and adequate contrast.
- Use `next/image` for meaningful raster images when practical; provide useful
  `alt` text, or empty `alt` for decoration.
- Respect reduced-motion preferences for non-essential animation.
- All async screens must handle loading, empty, error, and success states.

### Internationalization

- Do not hard-code user-facing copy when the surrounding feature is translated.
- Add matching keys to `src/i18n/en.json` and `src/i18n/fr.json`.
- Use the existing language provider/hooks; do not introduce another i18n
  system for one feature.
- Keep dates, numbers, currency, and pluralization locale-aware.

## Frontend Data and GraphQL

- GraphQL documents belong in `src/lib/graphql/documents`.
- Generated output belongs in `src/lib/graphql/generated.ts` and is never
  manually edited.
- RTK Query endpoints belong in `src/lib/rtk/endpoints`; register them through
  the existing base API.
- Use generated operation/result/input types rather than handwritten copies.
- Include credentials through the shared GraphQL base query.
- Let the shared base query handle access-token refresh; do not add competing
  refresh logic per endpoint.
- Use tag invalidation or an intentional cache update after mutations.
- Never call Prisma from the frontend.
- Do not invent a REST endpoint when a GraphQL contract already exists. REST is
  appropriate only for an existing/intentional transport need such as multipart
  upload or an OAuth callback.

After changing a GraphQL operation or backend schema:

```bash
npm run codegen --workspace front
```

Review generated diffs, but fix the schema/document rather than generated code.

## Backend Module Standards

Follow the existing feature-local structure:

```text
modules/<feature>/
├── dtos/
├── entities/
├── enums/
├── resolvers/
├── services/
├── types/
├── utils/          # only when needed
└── <feature>.module.ts
```

- Resolvers/controllers translate the transport, apply auth metadata, and
  delegate.
- Services own business rules, ownership checks, Prisma access, and
  transactions.
- DTOs describe and validate external input.
- Entities describe GraphQL output.
- Feature-internal argument/result shapes belong in `types`.
- Avoid cross-feature deep imports. Export an intentional service/module
  contract if another module needs it.
- Keep Prisma access in backend services, not resolvers or entities.
- `enums/message-code.enum.ts` is a re-export shim over
  `@loopskey/api-contracts/error-codes`. Keep it a shim: add codes to the
  package. Services keep importing the module path as before.
- The upload constant files (`enums/pdu-file.constant.ts`,
  `enums/certificate-file.constant.ts`) name their domain's limits from the
  shared defaults. Keep the domain-specific names — PDU and certificate limits
  are equal today but are separate policies, and raising one must not move the
  other.

## GraphQL

The API is code-first. Do not edit
`apps/api/src/graphql/schema.gql` manually.

- Keep public GraphQL names in the feature's `enums/gql-names...` file.
- Keep Prisma enum registration in the feature's registration file.
- Use camelCase for fields/operations and PascalCase for inputs/types/payloads.
- Use noun-led queries and verb-led mutations.
- Use explicit `@InputType`, `@ObjectType`, and `@Field` decorators.
- Apply `class-validator` constraints to all untrusted input.
- Use nullable fields only when `null` is a valid domain state.
- Do not expose Prisma records directly when the public contract must hide
  fields or reshape relations.
- Paginated list operations should follow the existing feature pagination,
  filter, and sort patterns.

```ts
@Mutation(() => CoursePayload, { name: CourseGqlMutation.CREATE })
@Roles(Role.PROVIDER, Role.ADMIN)
createCourse(
  @CurrentUser() actor: AuthUser,
  @Args("input") input: CreateCourseInput,
) {
  return this.courseService.create({ actor, input });
}
```

## Authentication and Authorization

The API is guarded by default with `JwtAuthGuard` and `RolesGuard`.

- Mark an operation `@Public()` only after deciding anonymous access is safe.
- Declare allowed roles with `@Roles(Role...)`; never compare free-form role
  strings.
- Obtain identity from the authenticated request/current-user decorator.
- Verify ownership and role in the service before reading or changing
  user/provider/organization-owned data.
- An `ADMIN` allowance must be deliberate, not added automatically.
- Protect private PDU evidence, organization reports, payment records, member
  data, credentials, and unpublished content.
- Keep access/refresh cookies `httpOnly`, secure in production, and configured
  with an appropriate `sameSite` policy.
- Store refresh tokens only in hashed form and preserve session revocation and
  rotation semantics.
- Never log passwords, OTPs, tokens, cookies, OAuth credentials, or sensitive
  personal data.

## Prisma and Database

- `apps/api/prisma/schema.prisma` is the persistence source of truth.
- Use the shared `PrismaService` through its alias.
- Select only the fields needed, especially for users, sessions, payments, and
  private evidence.
- Avoid N+1 reads by selecting relations, batching, or restructuring the query.
- Scope owned records with both record ID and authenticated owner/context where
  possible.
- Use a Prisma transaction when one business action writes multiple related
  records or changes balances/status/session state atomically.
- Prefer database constraints for invariants that must survive concurrency.
- Review indexes, unique constraints, nullability, and delete behavior.
- Use a named migration for persistent schema changes; do not use `db push` as
  the normal development workflow.
- Regenerate Prisma Client after schema changes.
- Never modify an existing applied migration to represent a new change.

## Errors and Logging

- Distinguish bad input, unauthenticated, forbidden, not found, conflict, rate
  limited, and internal failures.
- Expose safe, stable messages/codes to clients; do not leak SQL/Prisma errors,
  paths, secrets, or stack traces.
- Catch only to map a known failure, add useful context, clean up, or recover.
- Preserve the original error as a cause or in server-side logging when useful.
- Use Nest's logger on the API and user-friendly error states/toasts on the
  frontend.
- Avoid logging expected validation errors as server failures.

## Files, External Services, and Payments

- Validate file size, MIME type, extension/signature, ownership, and target path.
- Generate storage names server-side; prevent path traversal.
- Keep upload directories and credentials configurable.
- Treat OAuth, email, payment, and third-party API responses as untrusted.
- Add timeouts and map external failures without exposing credentials.
- Make webhook/payment processing idempotent and verify provider signatures.
- Store money in the database representation already established by the domain;
  never rely on floating-point arithmetic for financial decisions.

## Testing and Verification

Run the smallest relevant check first, then broaden:

```bash
npm run test --workspace api
npm run test --workspace front
npm run lint            # every workspace, including packages/api-contracts
npm run check-types     # every workspace
npm run test            # 188 API + 112 frontend
npm run build
```

The root commands are Turborepo tasks and are dependency-ordered, so
`packages/api-contracts` compiles before either app type-checks against it. A
stale `dist/` is the usual cause of a confusing "module has no exported member"
after editing the package.

`npm run test:e2e --workspace api` remains broken: it points at
`apps/api/test/`, a directory that has never existed. Report a stale script
separately; do not claim the underlying code passed.

Tests should cover:

- happy path and validation failures;
- anonymous, allowed-role, forbidden-role, and wrong-owner cases;
- session refresh/revocation behavior;
- multi-record transaction failure;
- frontend loading, empty, error, and success states;
- forms and keyboard-accessible interactions;
- payment/upload/external-service failure and retry/idempotency behavior.

Shared-package changes need two extra kinds of test, because their failure modes
are silent:

- **Drift tests** for anything the package restates from another source of
  truth (`contract-drift.spec.ts`).
- **Negative tests** for anything the package is supposed to prevent. A boundary
  rule that is never seen to fail is not known to work — the package-boundary
  rules sat unenforced for a whole feature because nothing consumed them and no
  test noticed.

A behaviour-preserving move must prove it preserved behaviour. `slug.util.spec.ts`
asserts the consolidated `slugify` matches a verbatim copy of the original across
twenty inputs, because slugs are already in the database and in indexed URLs.

Do not claim completion while relevant checks fail without clearly documenting
the failure and its impact.

## Definition of Done

A change is ready when:

- scope and architecture match the request;
- no new `any`, unused code, debug output, or secret exposure remains;
- inputs are typed and validated at the correct boundary;
- authentication, role, ownership, and status rules are enforced;
- database writes are atomic where needed;
- GraphQL documents, generated types, and schema are synchronized;
- loading/error/empty/success and accessibility states are handled;
- relevant tests, type checks, lint, and builds have been run;
- migrations and generated artifacts are included when required;
- every new shared-package export has a consumer, and anything the package
  restates has a drift test;
- the diff contains no unrelated reformatting;
- project/context documentation is updated for architectural or setup changes;
- no commit, push, merge, or destructive cleanup is performed without the
  workflow authorization defined in `context/ai-interaction.md`.
