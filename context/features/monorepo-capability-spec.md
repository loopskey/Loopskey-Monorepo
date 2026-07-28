# Monorepo Capability Audit and Improvement Roadmap

## Feature Name

Monorepo Capability Audit

## Objective

The project currently uses a monorepo structure, but it is unclear whether the core benefits of a monorepo are being used effectively.

This feature must analyze the current repository and determine how the project can better use monorepo capabilities such as:

- Shared TypeScript types
- Shared API contracts
- Shared validation schemas
- Shared configuration
- Shared UI components
- Shared utilities
- Dependency boundaries
- Build caching
- Selective builds and tests
- Code generation
- CI/CD optimization

The purpose of this feature is to inspect the current implementation and create an actionable improvement roadmap.

This feature must not implement all recommendations immediately. Each recommendation should be converted into a separate feature that can be selected and developed later.

---

## Status

Not Started

---

## Goals

- Identify the current monorepo tool and workspace structure.
- Review all existing applications, services, libraries, and internal packages.
- Analyze dependencies between the frontend, backend, and internal packages.
- Identify duplicated code across applications and packages.
- Find opportunities for type sharing between frontend and backend.
- Review opportunities for shared validation schemas.
- Review the current API contract structure.
- Identify packages that should be created, merged, or improved.
- Review shared TypeScript, ESLint, Prettier, Tailwind, and testing configurations.
- Review build caching and task pipeline capabilities.
- Review whether commands can run only for affected applications or packages.
- Identify dependency boundary problems.
- Create a prioritized monorepo improvement roadmap.
- Convert each recommendation into an independent feature for future development.

---

## Important Constraint

This feature is limited to:

1. Inspecting the current repository
2. Identifying architectural problems and opportunities
3. Producing recommendations
4. Creating an implementation roadmap
5. Defining independent follow-up features

Do not perform a large refactor during this feature.

Only make a very small, non-destructive change when it is strictly necessary to validate or demonstrate a finding.

---

## Audit Scope

### 1. Monorepo Tooling

Identify the current monorepo management tool.

Possible tools include:

- npm workspaces
- pnpm workspaces
- Yarn workspaces
- Turborepo
- Nx
- Lerna
- A custom workspace solution

Review the following:

- Where is the workspace configuration defined?
- How are applications defined?
- How are internal packages defined?
- How are build, development, test, lint, and type-check commands executed?
- Is there a task pipeline?
- Is local build caching available?
- Is remote caching available?
- Are dependencies built before dependent applications?
- Can tasks run only for changed applications and packages?
- Can multiple independent tasks run in parallel?

---

### 2. Current Repository Structure

Inspect and document the repository structure.

Possible directories may include:

```text
apps/
packages/
services/
libs/
shared/
tools/
config/
```

For every relevant directory, explain:

- Its current responsibility
- Whether its responsibility is clearly defined
- Whether applications and libraries are properly separated
- Whether some packages exist without a clear purpose
- Whether reusable code is located inside individual applications
- Whether applications directly import internal files from other applications
- Whether package boundaries are respected

---

### 3. Shared TypeScript Types

Identify TypeScript types and interfaces that are duplicated between frontend and backend.

Examples may include:

- User
- Employee
- Organization
- Role
- Permission
- Authentication payloads
- API request types
- API response types
- Pagination types
- Filter types
- Sorting types
- Error response types
- Form models
- Enums
- Status definitions

For every duplicated type, determine:

- Where it is currently defined
- Whether frontend and backend versions are identical
- Whether the type should be shared
- Whether it belongs in a shared package
- Whether it represents an API contract or an internal domain model
- Whether sharing it would create unwanted coupling

Possible package options:

```text
packages/shared-types
```

or:

```text
packages/contracts
```

Type sharing must not expose database entities or private backend models directly to the frontend.

Shared types should preferably represent stable API contracts.

---

### 4. Shared API Contracts

Review whether frontend and backend use a clearly defined API contract.

Inspect:

- Request DTOs
- Response DTOs
- Query parameters
- Pagination contracts
- Error contracts
- Success response structures
- Authentication responses
- File upload responses
- Date serialization
- Nullable fields
- Enum serialization

Compare possible approaches:

- A shared TypeScript contract package
- Zod-based contracts
- OpenAPI-generated clients
- tRPC
- ts-rest
- Manual DTO sharing
- Generated SDKs

Recommend the most appropriate approach for the current project and explain why.

---

### 5. Shared Validation Schemas

Review how validation is implemented in frontend and backend.

Possible validation tools include:

- Zod
- class-validator
- Joi
- Yup
- Valibot
- Custom validation logic

Review:

- Whether validation rules are duplicated
- Whether frontend and backend use inconsistent validation rules
- Whether schemas can safely be shared
- Whether backend validation remains authoritative
- Whether Zod can be used for runtime validation and type inference
- Whether conversion between Zod schemas and backend DTOs is required

Possible package options:

```text
packages/validation
```

or:

```text
packages/contracts
```

The backend must continue to validate all incoming data independently.

Frontend validation must only improve user experience and must not replace backend validation.

---

### 6. Shared Constants and Enums

Identify duplicated constants and enums, including:

- Role names
- Permission names
- Route names
- API paths
- Feature flags
- Status values
- Country codes
- Language codes
- Date formats
- Storage keys
- Cookie names
- Header names
- Error codes

Determine which constants should be shared and which should remain application-specific.

Possible package:

```text
packages/constants
```

Avoid placing unrelated values into one oversized shared constants package.

---

### 7. Shared Authorization Definitions

Review the current role-based or permission-based access-control structure.

Inspect:

- Where roles are defined
- Where permissions are defined
- Whether frontend and backend use the same role and permission names
- Whether permissions are duplicated
- Whether the frontend uses permissions only for UI visibility
- Whether the backend remains the final authority for authorization
- Whether a shared permission catalog is useful

Possible package:

```text
packages/auth-contracts
```

Sharing permission names must not make frontend checks authoritative.

Every protected action must still be validated by the backend.

---

### 8. Shared Utility Functions

Identify duplicated utility functions, such as:

- Date formatting
- Name formatting
- Phone-number normalization
- Number formatting
- Slug generation
- Query-string serialization
- Pagination calculation
- File-size formatting
- String normalization
- Search normalization
- Locale handling
- Error mapping

For every utility, determine:

- Whether it is browser-specific
- Whether it is Node.js-specific
- Whether it can safely be shared
- Whether it has side effects
- Whether it should be implemented as a pure function
- Whether it has tests

Possible packages:

```text
packages/utils
packages/utils-browser
packages/utils-server
```

Avoid creating a large, undefined package named `common` or `shared`.

Every package should have a clear responsibility and dependency boundary.

---

### 9. Shared UI Components

Determine whether the monorepo contains multiple frontend applications or is expected to contain multiple frontend applications in the future.

Review whether the following can be moved into a shared design-system package:

- Buttons
- Inputs
- Select components
- Modals
- Tables
- Data-grid wrappers
- Form controls
- Layout components
- Theme tokens
- Typography
- Icons
- Loading states
- Empty states
- Error states

Possible package:

```text
packages/ui
```

Also review:

- Whether shadcn/ui components are copied across applications
- Whether Tailwind configuration is duplicated
- Whether design tokens are shared
- Whether the UI package should expose source code or compiled output
- Whether framework-specific components should be separated from generic UI components

---

### 10. Shared Configuration Packages

Identify duplicated project configuration.

Review:

- TypeScript configuration
- ESLint configuration
- Prettier configuration
- Tailwind configuration
- PostCSS configuration
- Vitest configuration
- Jest configuration
- Playwright configuration
- tsup configuration
- Vite configuration
- Next.js conventions

Possible packages:

```text
packages/typescript-config
packages/eslint-config
packages/tailwind-config
packages/test-config
```

For each configuration area, determine:

- Which rules are truly shared
- Which settings must remain application-specific
- Whether the current configuration can use `extends`
- Whether path aliases are standardized
- Whether configuration duplication causes inconsistent behavior

---

### 11. Environment Variable Management

Review how environment variables are managed.

Inspect:

- `.env` files
- Environment-variable validation
- Public and private variables
- Duplicate variable names
- Secret leakage risks
- Development, test, staging, and production environments
- Naming conventions
- Runtime and build-time variables

Determine whether a shared environment validation package is useful.

Possible package:

```text
packages/env
```

Backend secrets must never be exposed through packages that can be imported by frontend applications.

Frontend and backend environment schemas may need to remain separate.

---

### 12. Database and Domain Boundaries

Review the database and domain architecture.

Inspect:

- Where database schemas are defined
- Which ORM is used
- Whether Prisma, TypeORM, Drizzle, or another tool is used
- Whether database entities are imported directly into frontend applications
- Whether domain models and persistence models are mixed
- Whether backend modules have clear boundaries
- Whether reusable backend domain packages are justified

Possible packages:

```text
packages/domain
packages/database
packages/repository
```

Before recommending domain extraction, verify that the logic is actually reused by multiple services or applications.

Do not move backend-only business logic into a shared package without a clear architectural benefit.

---

### 13. Generated API Client

Review how the frontend communicates with the backend.

Possible implementations include:

- Direct `fetch` calls
- Axios
- React Query
- Server Actions
- A custom API client
- An OpenAPI-generated SDK
- GraphQL clients

Determine whether the current client:

- Is type-safe
- Validates responses
- Uses consistent error mapping
- Handles authentication consistently
- Manages base URLs and headers consistently
- Supports cancellation and request timeouts
- Prevents repeated request logic

Possible package:

```text
packages/api-client
```

Also evaluate whether generating a client from OpenAPI would be more reliable than manually sharing request and response types.

---

### 14. Testing Utilities

Review the testing structure.

Possible tools include:

- Vitest
- Jest
- Playwright
- React Testing Library
- Testcontainers
- Mock Service Worker
- Custom database test utilities

Identify duplicated testing code, such as:

- Test factories
- Mock data
- Authentication mocks
- API mocks
- Database setup
- Test-user builders
- Permission fixtures
- Request builders
- Shared assertions

Possible package:

```text
packages/test-utils
```

The test utilities package must not be included in production bundles.

---

### 15. Build and Task Optimization

Review whether the monorepo uses:

- Incremental builds
- Local caching
- Remote caching
- Parallel task execution
- Dependency-aware task execution
- Affected-project detection
- Build graphs
- Selective deployment
- Selective testing
- Selective linting
- Selective type checking

For each capability, document:

- Current status
- Whether it is applicable
- Required tooling
- Implementation complexity
- Expected CI/CD improvement
- Migration risks
- Prerequisites

---

### 16. Dependency Management

Review dependency management across the workspace.

Inspect:

- Whether shared dependencies use different versions
- Whether peer dependencies are configured correctly
- Whether internal packages have appropriate versioning
- Whether circular dependencies exist
- Whether applications import package-internal files directly
- Whether dependency direction is respected
- Whether low-level packages depend on applications
- Whether packages rely on undeclared transitive dependencies

Possible analysis tools include:

- dependency-cruiser
- Madge
- Nx graph
- Turborepo graph
- ESLint boundary rules

Do not install a new tool unless its value is justified in the report.

---

### 17. Package Boundary Rules

Recommend a clear dependency direction for the repository.

Example:

```text
apps/web
  -> packages/ui
  -> packages/api-client
  -> packages/contracts
  -> packages/utils

apps/api
  -> packages/contracts
  -> packages/validation
  -> packages/domain
  -> packages/database

packages/ui
  -> packages/utils
  -> packages/constants

packages/api-client
  -> packages/contracts

packages/contracts
  -> must not depend on apps or database packages
```

Report:

- Invalid dependency directions
- Circular dependencies
- Direct cross-application imports
- Packages with excessive responsibilities
- Packages that depend on framework-specific infrastructure unnecessarily

---

## Required Investigation Process

### Step 1: Read Project Context

Read the following files first:

```text
CLAUDE.md
context/project-overview.md
context/coding-standards.md
context/ai-interaction.md
context/current-feature.md
```

Then locate and inspect relevant monorepo configuration files, including:

```text
package.json
pnpm-workspace.yaml
turbo.json
nx.json
lerna.json
tsconfig.json
tsconfig.base.json
eslint.config.*
.env.example
docker-compose.*
.github/workflows/*
apps/*
packages/*
libs/*
```

Only inspect files and directories that actually exist in the repository.

Do not assume that a specific monorepo tool is being used.

---

### Step 2: Build a Repository Map

Create a map of the repository that includes:

- Applications
- Backend services
- Internal packages
- Shared libraries
- Database layer
- UI layer
- Configuration files
- Testing structure
- CI/CD structure
- Deployment-related files

Explain the responsibility of each major area.

---

### Step 3: Detect Duplication

Identify duplicated:

- Types
- Interfaces
- Validation schemas
- Constants
- Enums
- Utility functions
- API clients
- UI components
- Configuration files
- Test setup logic

For every duplication finding, include exact file paths.

Avoid vague findings such as:

```text
Some types are duplicated.
```

Use evidence-based findings such as:

```text
apps/web/src/types/user.ts
apps/api/src/modules/users/types/user.ts

Both files define similar UserStatus and UserRole types, but one uses `status`
while the other uses `accountStatus`.
```

---

### Step 4: Identify Monorepo Opportunities

Assign a unique identifier to every opportunity.

Use the following format:

```text
MONO-01
MONO-02
MONO-03
```

Every opportunity must include:

- Title
- Current state
- Problem
- Evidence and file paths
- Recommended solution
- Proposed package or structure
- Affected applications
- Benefits
- Risks
- Prerequisites
- Complexity
- Priority
- Suggested independent feature

---

## Opportunity Categories

At minimum, evaluate the following categories:

1. Shared Types
2. API Contracts
3. Validation Schemas
4. Constants and Enums
5. Authorization Definitions
6. Shared Utilities
7. UI Component Library
8. Shared Configuration
9. Environment Validation
10. API Client
11. Testing Utilities
12. Domain Packages
13. Database Packages
14. Build Cache
15. Task Pipelines
16. Affected Commands
17. Dependency Boundaries
18. CI/CD Optimization
19. Code Generation
20. Documentation and Developer Experience

When a category is not applicable, explain why.

---

## Evaluation Criteria

For every opportunity, assign scores from 1 to 5.

### Impact

- 1: Very low impact
- 2: Limited impact
- 3: Moderate impact
- 4: High impact
- 5: Very high impact

### Effort

- 1: Very small change
- 2: Limited change
- 3: Medium-sized feature
- 4: Significant refactor
- 5: Large migration

### Risk

- 1: Very low risk
- 2: Low risk
- 3: Moderate risk
- 4: High risk
- 5: Very high risk

### Priority

Assign one of the following priorities based on impact, effort, risk, and dependencies:

- Critical
- High
- Medium
- Low

---

## Required Output

Create the following report:

```text
context/monorepo-audit.md
```

The report must use this structure:

```markdown
# Monorepo Audit

## Executive Summary

## Current Monorepo Tooling

## Repository Structure

## Current Strengths

## Current Problems

## Code Duplication Findings

## Dependency Findings

## Monorepo Opportunities

### MONO-01: Opportunity Name

#### Current State

#### Evidence

#### Problem

#### Recommendation

#### Proposed Packages

#### Affected Applications

#### Benefits

#### Risks

#### Prerequisites

#### Impact

#### Effort

#### Risk Level

#### Priority

#### Suggested Feature

## Recommended Target Structure

## Dependency Direction

## Implementation Roadmap

## Recommended First Feature

## Available Next Features

## Questions and Decisions Required
```

---

## Roadmap Requirements

Create a three-phase roadmap.

### Phase 1: Foundations

Prioritize low-risk and high-value improvements, such as:

- Shared TypeScript configuration
- Shared ESLint configuration
- Shared constants
- API response types
- Validation foundations
- Dependency boundary rules

### Phase 2: Shared Application Capabilities

Possible items include:

- Shared API contracts
- Shared validation schemas
- Generated API clients
- Shared UI components
- Authentication contracts
- Testing utilities

### Phase 3: Build and Architecture Optimization

Possible items include:

- Build caching
- Affected builds
- Selective deployment
- Domain packages
- CI/CD optimization
- Code generation
- Remote caching

These phases are examples.

The final roadmap must be based on the actual repository findings.

---

## Suggested Feature Generation

For every recommendation, define an independent follow-up feature.

Example:

```text
MONO-01 — Create Shared API Contracts Package
File: context/features/shared-api-contracts.md

MONO-02 — Create Shared Validation Package
File: context/features/shared-validation-schemas.md

MONO-03 — Centralize TypeScript Configuration
File: context/features/shared-typescript-config.md

MONO-04 — Add Dependency Boundary Rules
File: context/features/dependency-boundary-rules.md

MONO-05 — Add Monorepo Build Cache
File: context/features/monorepo-build-cache.md
```

For every suggested feature, provide a command:

```text
/feature load shared-api-contracts
```

Also include a decision question:

```text
Would you like to implement the Shared API Contracts feature?
```

---

## Recommended Question Format

At the end of the report, present all follow-up opportunities in a format that allows the user to select them individually.

Example:

```markdown
## Available Next Features

### MONO-01 — Shared API Contracts

The frontend and backend currently maintain separate API contracts.

Recommendation:

Create `packages/contracts` for request types, response types, pagination
contracts, and API error contracts.

Feature file:

`context/features/shared-api-contracts.md`

Command:

`/feature load shared-api-contracts`

Question:

Would you like to implement the Shared API Contracts feature?
```

---

## Acceptance Criteria

This feature is complete when:

- The current monorepo tool has been identified.
- The workspace structure has been documented.
- All applications and packages have been mapped.
- Dependencies between applications and packages have been reviewed.
- Duplicated types have been identified with exact file paths.
- Duplicated validation schemas have been identified with exact file paths.
- Duplicated constants and enums have been identified.
- Shareable utility functions have been identified.
- The possibility of a shared UI package has been evaluated.
- Shared configuration opportunities have been evaluated.
- The current API client structure has been reviewed.
- Build caching capabilities have been reviewed.
- Affected-task execution has been reviewed.
- Dependency boundary issues have been identified.
- At least one target monorepo structure has been proposed.
- Every recommendation includes impact, effort, risk, and priority.
- Every recommendation has been converted into a potential independent feature.
- One recommendation has been identified as the best starting point.
- The file `context/monorepo-audit.md` has been created.
- No large refactor has been performed.

---

## Test and Validation

This is primarily an analysis feature, so new unit tests are not required.

However, execute the existing project validation commands to establish the current baseline.

Use commands such as:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Use the appropriate package-manager command if the repository does not use npm.

Record the result of each command.

When a command does not exist or fails:

- Report the reason.
- Do not add a new command unless it is genuinely required.
- Record the issue as an audit finding.

---

## Scope Control

Do not perform the following during this feature:

- Move all types into shared packages
- Completely restructure repository folders
- Change the application framework
- Change the package manager
- Migrate from Turborepo to Nx
- Migrate from Nx to Turborepo
- Build a complete design system
- Generate a complete API SDK
- Fully refactor the backend
- Change the database schema
- Change authentication behavior
- Change business logic
- Delete existing packages without analysis
- Install new tools without documenting and justifying them
- Implement all identified opportunities

---

## Notes

- Recommendations must be based on the actual repository, not generic monorepo best practices.
- Every important finding must include evidence and file paths.
- Avoid creating packages that are too small to provide meaningful value.
- Avoid creating one generic package called `shared` that contains unrelated code.
- Every shared package must have a clear responsibility.
- Every shared package must have a clear dependency boundary.
- The backend must remain authoritative for validation, authorization, and security.
- Database entities must not be directly exposed to frontend applications.
- Type sharing should focus on API contracts rather than private backend structures.
- Recommendations must follow the existing project coding standards.
- Unresolved architectural decisions must be listed under `Questions and Decisions Required`.
- Only the audit report should be committed during this feature.
- Do not implement the proposed follow-up features during this audit.

---

## History

<!-- Keep this updated. Earliest to latest -->
