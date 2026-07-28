# Modular Monolith Architecture Hardening

## Feature Name

Modular Monolith Architecture Hardening

## Status

Not Started

## Priority

High

## Objective

Evolve the Loopskey backend from a structurally modular NestJS application into
an explicitly governed, production-ready modular monolith.

The result must preserve:

- One deployable NestJS API
- One public GraphQL endpoint
- One PostgreSQL database
- One Prisma client and migration history
- The existing Next.js frontend contract
- The existing npm-workspaces and Turborepo workflow

The feature must introduce clear domain ownership, enforceable dependency
boundaries, explicit cross-domain APIs, reliable internal domain events, and
integration tests around those boundaries.

This is not a microservice migration. It is the architectural preparation that
keeps the current system simple while making selected capabilities extractable
later if operational evidence justifies it.

---

## Scope

- Define and enforce bounded-context and Prisma-model ownership.
- Introduce explicit public application contracts for proven cross-domain use.
- Standardize synchronous workflows, domain events, and reliable side effects.
- Add architecture and E2E tests for critical boundaries.
- Abstract upload storage and establish an observability baseline.
- Migrate incrementally while preserving one API and one PostgreSQL database.

---

## Goals

- [ ] Assign every active backend module to one bounded context.
- [ ] Assign every Prisma model to exactly one write owner.
- [ ] Prevent undocumented cross-domain imports and writes automatically.
- [ ] Make cross-domain workflows explicit, typed, and testable.
- [ ] Establish reliable, idempotent handling for non-critical side effects.
- [ ] Add functional, architectural, and operational verification.
- [ ] Preserve existing public behavior throughout the migration.

---

## Non-goals

- Splitting the API into independently deployed microservices.
- Introducing multiple databases or database-per-service.
- Replacing NestJS, GraphQL, Prisma, PostgreSQL, Next.js, or Turborepo.
- Rewriting all backend modules in one change.
- Introducing internal HTTP, gRPC, GraphQL, or broker calls between modules.
- Performing unrelated product or UI redesign.

---

## Executive Decision

Loopskey should remain a modular monolith at its current scale.

The backend currently contains approximately:

- 15 active feature modules
- 410 TypeScript files under `apps/api/src/modules`
- 48 service files
- 54 Prisma models
- 61 Prisma enums
- One shared PostgreSQL schema

The domains are already separated into NestJS modules, but data ownership is
implicit. Every feature can inject the global `PrismaService`, and the single
Prisma client exposes every model. The application therefore has directory
boundaries but not yet enforceable domain boundaries.

The correct next step is to strengthen these boundaries without introducing
network calls, distributed transactions, multiple databases, service discovery,
or independent deployments.

---

## Business Outcomes

- Reduce the risk that a change in one domain silently breaks another.
- Make domain ownership understandable to new developers.
- Keep deployments, transactions, debugging, and local development simple.
- Make long-running and failure-prone side effects separable from core requests.
- Allow future teams to extract a bounded capability without rewriting the whole
  backend.
- Establish measurable criteria for deciding whether a future microservice is
  justified.

---

## Current Architecture

```text
Browser
  -> Next.js frontend
      -> RTK Query
          -> NestJS GraphQL API
              -> Resolvers
                  -> Feature services
                      -> Global PrismaService
                          -> One PostgreSQL database
```

The API composition root is:

```text
apps/api/src/modules/app/app.module.ts
```

It currently registers:

- `auth`
- `user`
- `admin`
- `course`
- `events`
- `podcast`
- `youtube`
- `landing`
- `professional`
- `provider`
- `organization`
- `content-interaction`
- `external-learning`
- `mail`
- `prisma`

GraphQL is code-first. The generated schema remains the frontend-facing
contract:

```text
apps/api/src/graphql/schema.gql
  -> GraphQL Code Generator
      -> apps/front/src/lib/graphql/generated.ts
```

The database source of truth remains:

```text
apps/api/prisma/schema.prisma
```

---

## Problems to Solve

### 1. Domain ownership is not explicit

Folders indicate likely ownership, but there is no authoritative document or
machine-readable rule assigning Prisma models and business operations to a
domain.

For example, a developer cannot currently determine from an enforced contract
whether `ContentEnrollment`, `EventRegistration`, or `Payment` belongs to the
catalog, professional-development, or content-interaction domain.

### 2. Persistence access is globally available

Every feature imports `PrismaModule` and receives a `PrismaService` capable of
accessing all 54 models.

This makes it easy for one module to bypass another module's business rules and
write its tables directly.

### 3. Module exports are broader than necessary

Several modules export concrete service implementations. Consumers can become
coupled to implementation details instead of a small public application
contract.

### 4. Cross-domain workflows are not standardized

Workflows may need to coordinate identity, organizations, content, professional
progress, notifications, and audit records. There is no single rule defining
when to use:

- A synchronous application API
- A same-process domain event
- A database transaction
- A future asynchronous job

### 5. Side effects are mixed with core use cases

Email delivery and filesystem operations can fail for reasons unrelated to the
business transaction. These operations need explicit reliability and retry
semantics even while they remain inside the monorepo.

### 6. Architectural regression tests are incomplete

The repository enforces application-to-package dependency direction, but it does
not yet enforce backend feature-to-feature rules or model ownership.

### 7. End-to-end test infrastructure is incomplete

The `test:e2e` script references a test configuration that does not exist. A
modular architecture cannot be considered safe without tests that exercise
critical workflows through the public boundary.

---

## Architectural Principles

All implementation work under this feature must follow these principles.

### One deployable application

All feature modules run in the same NestJS process. Do not introduce HTTP,
GraphQL, gRPC, or message-broker communication between internal modules.

### Domain logic stays inside its owner

Only the owning domain may implement rules or writes for its aggregate. Another
domain must call the owner's public application API or publish a defined event.

### Synchronous calls are explicit

Use a synchronous cross-domain API when the caller requires the result before it
can complete safely.

Examples:

- Validate that a user exists and is active.
- Validate that a CPD plan belongs to a professional.
- Retrieve a content summary required for a response.

### Events describe completed facts

Use domain events for reactions that do not determine whether the originating
transaction is valid.

Examples:

- `UserRegistered`
- `OrganizationApproved`
- `CoursePublished`
- `ContentCompleted`
- `CertificateExpiringSoon`

Event names must use past tense. Events must not be commands disguised as facts.

### Transactions do not cross process boundaries

All atomic database work remains in the monolith and uses Prisma transactions.
An event intended for future asynchronous delivery must be written to an outbox
in the same database transaction.

### Public contracts are smaller than implementations

Feature consumers depend on tokens and TypeScript interfaces, not concrete
service classes, where cross-domain access is genuinely required.

### The GraphQL layer is transport only

Resolvers and controllers authenticate, authorize, validate, map transport
models, and invoke application use cases. They must not contain persistence or
business rules.

### No generic dumping grounds

Do not create broad directories or packages named `shared`, `common-service`,
`helpers`, or `domain` without a specific owner and dependency rule.

---

## Proposed Bounded Contexts

The following map is the initial target. It must be validated against every
Prisma relation and service query during Phase 1.

| Bounded context | Existing modules | Primary responsibility |
| --- | --- | --- |
| Identity and Access | `auth`, `user` | Accounts, sessions, credentials, OAuth, registration, role identity |
| Learning Catalog | `course`, `events`, `podcast`, `youtube`, `landing` | Published learning content, discovery, schedules and public catalogue reads |
| Professional Development | `professional`, `external-learning` | Profiles, PDU/CPD tracking, plans, certificates, roadmaps, payments and external learning |
| Organization Management | `organization` | Organizations, membership, departments, assignments and compliance |
| Provider Management | `provider` | Provider profile, settings, publishing ownership and provider operations |
| Engagement | `content-interaction` | Wishlist, enrollment, reviews, carts and completion interactions |
| Platform Administration | `admin` | Administrative orchestration, review, moderation and audit operations |
| Communications | `mail` | Email rendering and delivery; later notification job handling |
| Infrastructure | `prisma`, configuration, logging | Persistence and technical adapters without business policy |

`admin` and `landing` are composition/read-oriented modules. They may need
approved read models spanning domains, but must not become unrestricted
backdoors into every table.

---

## Required Deliverables

### Deliverable 1: Domain ownership manifest

Create:

```text
apps/api/src/architecture/domain-ownership.ts
```

The manifest must assign:

- Every active NestJS feature module to one bounded context
- Every Prisma model to exactly one owner
- Approved read-only cross-domain projections
- Approved temporary exceptions with an owner and removal issue

The manifest must be typed and usable by architecture tests. It must not import
NestJS or instantiate application classes.

An indicative shape is:

```ts
export const DOMAIN_OWNERSHIP = {
  identity: {
    modules: ["auth", "user"],
    models: ["User", "AuthAccount", "AuthSession"],
  },
  catalog: {
    modules: ["course", "events", "podcast", "youtube", "landing"],
    models: ["Course", "Event", "Podcast", "PodcastEpisode"],
  },
} as const;
```

The final list must be derived from the actual Prisma schema; the example is not
complete.

### Deliverable 2: Architecture decision records

Create:

```text
context/architecture/
  README.md
  adr-001-modular-monolith.md
  adr-002-domain-boundaries.md
  adr-003-cross-domain-communication.md
  adr-004-domain-events-and-outbox.md
```

Each ADR must contain:

- Status
- Context
- Decision
- Alternatives considered
- Consequences
- Migration implications
- Conditions that would justify revisiting the decision

### Deliverable 3: Public application contracts

Add a `public/` directory only to a module with a confirmed cross-domain
consumer:

```text
modules/<feature>/public/
  <feature>-api.ts
  <feature>-api.token.ts
  index.ts
```

The public API must:

- Expose use-case-oriented methods
- Accept domain-neutral input types
- Return minimal projections
- Avoid Prisma-generated input types
- Avoid GraphQL entities and decorators
- Avoid leaking concrete service implementations

Do not create public APIs for modules that have no consumers.

### Deliverable 4: Explicit composition layer

Cross-domain workflows that genuinely coordinate multiple owners must live in an
application orchestration layer:

```text
apps/api/src/application/
  workflows/
```

This directory may depend on public module APIs. Feature modules must not depend
back on workflows.

Admin dashboard queries that aggregate multiple domains should use dedicated
read-model/query services rather than write access to foreign aggregates.

### Deliverable 5: Same-process domain event mechanism

Create a small framework-owned event abstraction under:

```text
apps/api/src/infrastructure/events/
```

Required concepts:

- `DomainEvent`
- `DomainEventPublisher`
- `DomainEventHandler`
- Stable event name
- Schema version
- Event ID
- Occurred-at timestamp
- Correlation/request ID
- Actor ID when applicable
- Typed payload

Initial delivery remains in-process. Do not add a broker during the first
implementation phase.

Handler failures must have an explicit policy:

- Critical invariant: use a synchronous public API instead of an event.
- Non-critical reaction: log failure and make it retryable through the outbox.
- Never silently swallow an event-handler error.

### Deliverable 6: Transactional outbox foundation

Add one Prisma model through a normal migration:

```text
OutboxEvent
```

Minimum fields:

- `id`
- `eventName`
- `eventVersion`
- `aggregateType`
- `aggregateId`
- `payload`
- `occurredAt`
- `availableAt`
- `processedAt`
- `attemptCount`
- `lastError`
- `correlationId`

Requirements:

- The business write and outbox write occur in one Prisma transaction.
- Payloads contain identifiers and stable values, not secrets or complete
  database records.
- Processing is idempotent.
- Failed events remain inspectable and retryable.
- Concurrent processors cannot deliver the same row simultaneously.
- A retention strategy is documented.

The outbox is infrastructure for reliable internal reactions and a future
worker. It must not force every synchronous internal call to become an event.

### Deliverable 7: Module-boundary lint rules

Extend the API ESLint configuration to enforce:

- Feature modules may not import another feature's internal directories.
- Cross-domain imports may only target the other module's `public/` entry point.
- Infrastructure may not import feature modules.
- Feature modules may depend on approved infrastructure abstractions.
- GraphQL entities and DTOs may not be imported as cross-domain contracts.
- Application workflows may import public APIs but not internal services.

Existing path aliases can remain during migration, but aliases must not bypass
the boundary rules.

### Deliverable 8: Architecture tests

Add tests under:

```text
apps/api/src/architecture/
  domain-ownership.spec.ts
  module-boundaries.spec.ts
  prisma-ownership.spec.ts
```

Tests must prove:

- Every Prisma model has exactly one owner.
- Every active feature module belongs to a bounded context.
- No feature imports another feature's resolver, DTO, entity, repository, or
  internal service.
- Approved exceptions are explicit and finite.
- Public contracts do not import Prisma or GraphQL transport types.
- The application dependency graph is acyclic at the domain level.

Prefer a focused repository script or TypeScript AST/compiler API already
available through TypeScript. Do not add a large architecture dependency unless
the standard tooling cannot reliably enforce the rules.

### Deliverable 9: End-to-end test foundation

Repair:

```text
npm run test:e2e --workspace api
```

Add:

```text
apps/api/test/jest-e2e.json
apps/api/test/
```

The test environment must:

- Use a dedicated test database
- Never run against development or production data
- Apply migrations deterministically
- Seed only the minimum required records
- Clean up predictably
- Exercise requests through HTTP/GraphQL
- Verify authentication and authorization

Initial critical workflows:

1. Register/login/refresh/logout
2. Create and publish content as an authorized provider
3. Enroll or wishlist content as a professional
4. Complete content and update professional progress
5. Organization approval and activation
6. Cross-user and cross-role access rejection

### Deliverable 10: Observability baseline

Introduce:

- Structured JSON logging outside local development
- Request/correlation ID propagation
- Domain name and use-case name in relevant log context
- Health endpoint
- Readiness endpoint that checks required infrastructure
- Standard error classification
- Timing for GraphQL operations and outbox processing

Do not log:

- Passwords
- JWTs or refresh tokens
- OAuth tokens
- OTP values
- Raw cookies
- Uploaded document content
- Sensitive profile fields

OpenTelemetry-compatible trace identifiers are preferred, but a full external
collector is not required by this feature.

### Deliverable 11: Upload storage abstraction

Introduce a backend-owned abstraction:

```text
apps/api/src/infrastructure/storage/
  object-storage.port.ts
  local-object-storage.adapter.ts
```

Professional modules must depend on the port rather than `fs` directly.

The first adapter may preserve local-disk behavior. The abstraction must make an
S3-compatible adapter possible without changing professional business services.

Storage records must continue to expose only safe metadata and opaque object
keys. Filesystem paths must never become public GraphQL contracts.

### Deliverable 12: Developer documentation

Update:

```text
README.md
context/project-overview.md
context/coding-standards.md
```

Document:

- The bounded-context map
- How to choose a module for new behavior
- How to request another domain's data or operation
- When to use a synchronous API versus an event
- How to add and version an event
- How to add a Prisma model and declare its owner
- How to run architecture and E2E tests
- How temporary exceptions are recorded and removed

---

## Target Dependency Direction

```text
Transport
  resolvers/controllers
        |
        v
Feature application layer
  use cases / public APIs
        |
        v
Feature domain rules
        |
        v
Owned persistence access ports
        |
        v
Infrastructure adapters
  Prisma / mail / storage / events

Application workflows
  -> feature public APIs only

Feature A internals
  -X-> Feature B internals

Infrastructure
  -X-> Feature modules
```

Within a feature, a pragmatic layered structure is:

```text
modules/<feature>/
  public/              # Cross-domain contract, only when required
  application/         # Use cases and orchestration owned by the feature
  domain/              # Pure rules, policies and domain values
  infrastructure/      # Prisma repository/adapter implementations
  transport/
    graphql/
    http/
  <feature>.module.ts
```

Do not mechanically move all 410 existing files at once. Apply this structure
incrementally when a module is hardened. File movement without boundary
improvement is not a goal.

---

## Prisma Ownership Strategy

This feature keeps one physical database and one Prisma schema.

Logical ownership is enforced as follows:

1. Every Prisma model has one owner in the ownership manifest.
2. Writes are performed only through the owning domain.
3. Cross-domain writes through raw Prisma access are forbidden.
4. Cross-domain reads use one of:
   - The owner's public application API
   - A documented read projection
   - An application-level query service
5. Foreign-key relations may remain in PostgreSQL.
6. Multi-domain atomic workflows remain Prisma transactions coordinated by an
   application workflow.
7. Direct table separation or database-per-domain is explicitly out of scope.

Prisma-generated enums may be used inside the backend. They must not become
frontend contracts unless represented through the existing GraphQL schema or
`@loopskey/api-contracts` rules.

---

## Cross-Domain Communication Decision Matrix

| Need | Mechanism |
| --- | --- |
| Result is required to validate or complete the request | Synchronous public application API |
| Multiple writes must succeed or fail atomically | Application workflow plus Prisma transaction |
| A completed fact triggers non-critical reactions | Domain event |
| Reaction must survive process failure | Domain event plus transactional outbox |
| Read combines multiple domains without changing state | Dedicated read/query service |
| Long-running import, email or media operation | Outbox-backed background job in a later worker phase |
| Internal module-to-module GraphQL/HTTP request | Forbidden |

---

## Implementation Roadmap

### Phase 0: Baseline and inventory

1. Record the current commit and working-tree state.
2. Run lint, type checks, unit tests, build, codegen, Prisma validation, and the
   known E2E command.
3. Generate a feature-import inventory.
4. Inventory every Prisma model usage by module.
5. Identify transactions and workflows touching multiple owners.
6. Record existing violations without immediately changing behavior.

Output:

```text
context/modular-monolith-baseline.md
```

No architectural refactor should begin until this report is reviewed.

### Phase 1: Define and enforce ownership

1. Confirm bounded contexts.
2. Create ADRs and ownership manifest.
3. Add architecture tests.
4. Add lint restrictions for new violations.
5. Record existing violations as named temporary exceptions.
6. Fail CI on newly introduced violations.

Recommended migration policy:

- New violations are blocked immediately.
- Existing violations receive an owner and removal phase.
- The exception count may only decrease.

### Phase 2: Harden one vertical slice

Use a small, representative module before changing the largest domains.

Recommended pilot:

```text
events
```

The pilot must demonstrate:

- Public application API
- Transport/application/persistence separation
- Owned Prisma access
- One domain event
- Unit, integration, architecture and E2E tests
- No frontend contract regression

Do not use `auth` or `professional` as the first pilot because their blast radius
is substantially larger.

### Phase 3: Migrate catalog and engagement boundaries

Harden:

1. `course`
2. `podcast`
3. `youtube`
4. `content-interaction`
5. `landing` read models

Resolve ownership for wishlist, enrollment, reviews, carts, event registrations,
and provider-owned publishing operations.

### Phase 4: Migrate identity and organization boundaries

Harden:

1. `user`
2. `auth`
3. `organization`
4. Organization-related `admin` workflows

Authentication guards remain application-wide infrastructure but delegate user
and session policy to Identity and Access.

Email reactions to registration and organization approval should become
outbox-backed.

### Phase 5: Migrate professional-development boundaries

Harden:

1. Professional profile and settings
2. PDU activities and evidence
3. CPD plans
4. Certificates
5. Roadmaps
6. Professional catalogue views
7. External learning
8. Payments

The current `professional` module is large and must be divided into internal
subdomains before considering it fully hardened. It must remain one bounded
context unless evidence shows a stable internal boundary.

### Phase 6: Reliability and worker readiness

1. Add transactional outbox.
2. Add idempotent processing.
3. Move email delivery behind an outbox handler.
4. Put storage behind its port.
5. Add operational metrics and retry visibility.
6. Define `apps/worker` as a separate follow-up feature; do not silently add an
   independently deployed process within this feature.

### Phase 7: Close exceptions and review architecture

1. Remove all temporary cross-domain import exceptions.
2. Confirm every Prisma model has one owner.
3. Confirm critical workflows have E2E coverage.
4. Update architecture diagrams and developer instructions.
5. Measure build time, test time, coupling and defect rate.
6. Produce a final architecture review.

---

## Scope Control

### In scope

- Backend module boundaries
- Domain ownership
- Internal application contracts
- Architecture tests
- Same-process domain events
- Transactional outbox foundation
- E2E test foundation
- Observability baseline
- Storage abstraction
- Documentation
- Refactors required to enforce the agreed boundaries

### Non-goals

- Splitting the API into independently deployed microservices
- Multiple databases or schemas per service
- Kubernetes
- Service discovery
- GraphQL federation
- Internal HTTP, gRPC, or broker calls between modules
- Replacing GraphQL
- Replacing Prisma
- Replacing PostgreSQL
- Rewriting the frontend
- Rewriting all backend modules in one pull request
- Introducing CQRS or event sourcing across the entire system
- Creating generic domain/shared packages without demonstrated reuse
- Moving Prisma schema or business logic into a cross-application package

---

## Non-Functional Requirements

### Compatibility

- Existing GraphQL operation names and semantics remain compatible unless an
  intentional contract change is separately approved.
- Existing cookies, role checks and OAuth flows remain compatible.
- Existing database records remain valid.
- Migrations must be additive or use a documented safe rollout.

### Security

- Backend authorization remains authoritative.
- Cross-domain APIs must not bypass guards or ownership rules.
- Events and logs must not contain secrets.
- Upload object keys must remain private.
- E2E tests must prove cross-user access rejection.

### Performance

- Internal communication must remain in-process.
- Avoid N+1 domain API calls.
- Read projections must be designed for bounded query counts.
- Event publication must not materially increase request latency.
- Outbox indexes must support pending-event polling.

### Reliability

- Critical invariants remain synchronous and transactional.
- Non-critical side effects are retryable.
- Consumers are idempotent.
- A failed email or notification must not roll back an already valid business
  operation.

### Maintainability

- No cyclic bounded-context dependencies.
- Public APIs remain small and use-case focused.
- Temporary exceptions must include a removal owner and deadline/phase.
- New Prisma models cannot merge without declared ownership.

---

## Testing Strategy

### Unit tests

Test pure domain rules and application use cases without GraphQL transport.

### Integration tests

Test:

- Prisma repository implementations
- Transactions
- Ownership-scoped queries
- Outbox persistence
- Event-handler idempotency
- Storage adapters

Use a real isolated PostgreSQL database for behavior that Prisma mocks cannot
prove.

### Contract tests

Test:

- Public application API behavior
- Stable domain-event payload schemas
- GraphQL schema/codegen drift
- `@loopskey/api-contracts` drift

### Architecture tests

Test dependencies and ownership as described in Deliverable 8.

### End-to-end tests

Test critical user journeys through the deployed API transport and real guards.

---

## Required Validation Commands

Run from the repository root:

```bash
npm run lint
npm run check-types
npm run test
npm run build
npm run codegen
npm run test:e2e --workspace api
npx prisma validate --schema apps/api/prisma/schema.prisma
npx prisma migrate status --schema apps/api/prisma/schema.prisma
git diff --check
```

When the GraphQL schema changes, regenerate and commit:

```text
apps/api/src/graphql/schema.gql
apps/front/src/lib/graphql/generated.ts
```

When the Prisma schema changes, include a reviewed migration. Never use
`prisma db push` as the production migration strategy.

---

## Acceptance Criteria

This feature is complete only when:

- [ ] The modular-monolith decision is recorded in an accepted ADR.
- [ ] Every active feature module belongs to one bounded context.
- [ ] Every Prisma model has exactly one documented owner.
- [ ] Domain ownership is enforced by automated tests.
- [ ] New cross-domain internal imports fail lint or architecture tests.
- [ ] Cross-domain consumers use documented public application APIs.
- [ ] No public module contract exposes Prisma inputs or GraphQL transport
      entities.
- [ ] The bounded-context dependency graph is acyclic.
- [ ] Cross-domain writes occur only through the owning domain or an approved
      application workflow.
- [ ] Critical multi-domain writes remain atomic.
- [ ] At least one representative vertical slice is fully hardened.
- [ ] At least one non-critical reaction is represented as a versioned domain
      event.
- [ ] The outbox write is atomic with its originating business write.
- [ ] Outbox processing is idempotent and retryable.
- [ ] E2E infrastructure runs against an isolated database.
- [ ] Critical authentication and authorization journeys have E2E coverage.
- [ ] Upload business services depend on a storage port rather than direct
      filesystem calls.
- [ ] Logs include correlation identifiers and exclude secrets.
- [ ] Health and readiness endpoints exist and are tested.
- [ ] GraphQL codegen shows no drift.
- [ ] Prisma migrations show no drift.
- [ ] Lint, type checks, unit tests, E2E tests and production builds pass.
- [ ] Architecture and developer documentation reflect the implemented state.
- [ ] No independent microservice or second database was introduced.

---

## Pull Request and Delivery Strategy

Do not implement this specification as one pull request.

Recommended pull-request sequence:

1. Baseline report and ADRs
2. Ownership manifest and architecture tests
3. ESLint boundary enforcement
4. E2E test foundation
5. Events pilot vertical slice
6. Catalog modules
7. Engagement and landing read models
8. Identity and organization
9. Professional-development internal boundaries
10. Outbox and mail reliability
11. Storage abstraction
12. Observability and final exception removal

Every pull request must:

- Preserve deployability
- State which boundary violations it removes
- Add or update tests
- Avoid unrelated UI changes
- Include migration and rollback notes when persistence changes
- Update the baseline exception count

---

## Rollback Strategy

- Boundary lint rules can initially be warning/report-only for recorded legacy
  violations, while new violations fail CI.
- Public API adapters may delegate to existing services during migration.
- Domain events may initially have a single in-process handler.
- The storage port initially uses the existing local-disk adapter.
- Outbox processing can be disabled by configuration without removing persisted
  events.
- Database migrations must be backward-compatible with the previously deployed
  application during rollout.

Do not roll back by deleting migrations that have reached a shared environment.
Use a forward corrective migration.

---

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Mechanical folder movement creates large conflicts | Harden one vertical slice at a time |
| Interfaces merely mirror large services | Expose use cases and minimal projections only |
| Shared Prisma client defeats ownership | Enforce ownership through tests, lint and review |
| Too many internal events obscure control flow | Use synchronous calls for required outcomes |
| Event delivery produces duplicates | Require idempotent handlers and event IDs |
| Outbox grows without limit | Add indexes, retention and operational metrics |
| Admin becomes a cross-domain backdoor | Use explicit workflows and read projections |
| E2E tests damage real data | Require a dedicated test database and safety checks |
| Refactor changes GraphQL unintentionally | Run schema/codegen drift checks on every phase |
| Architecture work delays product delivery | Use incremental PRs and harden touched domains |

---

## Metrics

Record at the baseline and after completion:

- Number of cross-domain internal imports
- Number of approved boundary exceptions
- Number of Prisma models without an owner
- Number of domains directly writing foreign-owned models
- Number of cyclic domain dependencies
- Number of critical workflows covered by E2E tests
- API unit/integration/E2E test duration
- Production build duration
- GraphQL operation error rate
- Outbox retry and dead-letter count
- Email delivery failure rate
- Mean deployment frequency and rollback rate, when deployment data exists

These metrics provide the evidence needed for any future microservice decision.

---

## Future Microservice Decision Gate

Completing this feature does not imply that services should be extracted.

A capability may be proposed for extraction only when at least one measurable
driver exists:

- It requires independent scaling.
- It has a clearly independent release cadence and team owner.
- Its failures must be isolated from the primary API.
- It requires a substantially different runtime or persistence technology.
- Its deployment regularly blocks unrelated domains.
- A security or compliance boundary requires physical isolation.

The proposal must also prove:

- Stable public contract
- Clear data ownership
- No synchronous distributed transaction requirement
- Observability and operational ownership
- Deployment and rollback plan
- Cost comparison against keeping it in the monolith

Likely future candidates, in order:

1. Notification delivery worker
2. Media/file processing
3. Content ingestion and synchronization
4. Search and recommendation

Identity, Professional Development, Organization Management, and Engagement must
not be the first extraction candidates.

---

## Definition of Done

Loopskey is a professionally governed modular monolith when module folders are
not merely organizational conventions: domain ownership, allowed dependencies,
cross-domain communication, persistence access, events, tests, and operational
behavior are all explicit and automatically verifiable.
