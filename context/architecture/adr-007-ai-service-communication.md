# ADR-007 — How the AI service communicates

- Status: Accepted
- Date: 2026-08-07
- Deciders: Loopskey engineering
- Amends: [ADR-001](adr-001-modular-monolith.md) (scope, not decision)

## Context

Loopskey adds a third application: `apps/service-ai`, a FastAPI service owning
model inference, embeddings, retrieval and any other work that needs the Python
ML ecosystem. It is the first component that is not a NestJS module and not a
browser.

That raises a question the existing record does not answer. ADR-001 forbids
"internal HTTP, GraphQL, gRPC or broker calls" — but reading the decision in
full, the subject is **modules inside one deployable**. Its argument is that a
network hop between `auth` and `admin` converts compile-time errors into runtime
errors while buying nothing, because those modules share a schema, a
transaction boundary and a release cadence.

`service-ai` shares none of those. It has a different runtime, a different
dependency tree, a different failure mode (a model provider timing out is
normal, not exceptional) and a different scaling profile (GPU/throughput-bound
rather than request-bound). ADR-001's reasoning does not reach it. This ADR
states the boundary explicitly so the rule is not read as either a prohibition
on the new service or a licence to add network calls between existing modules.

Three constraints come from the repository as it stands:

- The client contract is mature and machine-enforced. `apps/api` is code-first,
  emits `apps/api/src/graphql/schema.gql`, the frontend generates
  `apps/front/src/lib/graphql/generated.ts` from that committed file, and CI
  fails on drift (`.github/workflows/ci.yml`). Roughly 1,011 types and 75 enums
  depend on it.
- REST already exists in `apps/api` for multipart upload and OAuth callbacks.
  "Everything is GraphQL" was never true; the real rule, recorded in
  `context/coding-standards.md`, is that REST needs an intentional transport
  reason.
- Asynchronous, retried, idempotent side effects already have a home:
  the versioned transactional outbox in `apps/api/src/infrastructure/outbox`.

## Decision

### 1. One contract per boundary type, not one protocol everywhere

| Boundary                | Contract          | Reason                                                        |
| ----------------------- | ----------------- | ------------------------------------------------------------- |
| Browser → `apps/api`    | GraphQL           | Many screens, per-view field selection, one round trip         |
| `apps/api` → AI service | REST over OpenAPI | One consumer, coarse verbs, long-running and streaming work    |
| Deferred/at-least-once  | Outbox events     | Already built, already idempotent, already bounded on retries  |

Protocol uniformity pays off when the same consumers use both surfaces. A
browser and a NestJS service have no shared needs, so uniformity here would be
cosmetic. The invariant worth holding is that each boundary has exactly one
contract, expressed in one artifact, checked by CI.

### 2. `apps/api` is the only public edge

The AI service is never reachable from the browser. It binds to a private
interface, and every browser-originating AI request enters through a GraphQL
operation on `apps/api`, which authenticates it, authorizes it, and calls the AI
service on the user's behalf.

This is the load-bearing part of the decision. Authentication is cookie-based
JWT with a global `JwtAuthGuard` and `RolesGuard`; ownership and role rules live
in `apps/api` services. A second public origin would mean reimplementing CORS,
cookie handling, refresh rotation and every ownership check in Python — three
of which have already caused incidents once (see the `ACCESS_TOKEN_COOKIE_NAME`
note in `context/project-overview.md`).

Calls from `apps/api` carry a service credential (`SERVICE_AI_API_KEY`) plus the
`x-correlation-id` of the originating request. The AI service trusts the caller
for identity and never re-derives authorization from a client-supplied user ID —
the same rule the core API already follows.

### 3. The REST contract is generated, committed and drift-checked

Plain REST with a hand-written client is not acceptable, because it reintroduces
exactly the failure the GraphQL drift gate was built to prevent: a contract that
diverges silently until production.

So the AI boundary reuses the pattern that already works here:

```text
FastAPI route + Pydantic models          (source of truth)
  └─ scripts/export_openapi.py
      └─ apps/service-ai/openapi.json    (committed artifact)
          └─ openapi-typescript
              └─ generated client types in apps/api   (committed)
```

`tests/test_openapi_contract.py` fails when the application and the committed
`openapi.json` diverge. This mirrors the `schema.gql` → `generated.ts` chain
one-for-one, including the rule that generated files are never hand-edited.

The `apps/api` half of that chain lands with the first feature that calls the
service. Generating a client before anything consumes it would add unused code,
which `context/coding-standards.md` forbids for exactly the reason that applies
here: it is harder to delete later because removing it looks breaking. The
contract itself is committed and gated from day one, so that feature starts from
a checked artifact rather than a guess.

### 4. Long-running work is asynchronous; streaming is SSE

Model calls run from ~200 ms to tens of seconds. Two shapes are permitted:

- **Deferred.** `apps/api` appends an outbox event, the handler calls the AI
  service, and the result returns through a callback endpoint on `apps/api`
  secured by the same service credential. Retries and idempotency come from the
  existing outbox; handlers must stay idempotent per event and handler.
- **Streaming.** The AI service streams Server-Sent Events, `apps/api` proxies
  them to the browser as SSE. Token streaming stays out of GraphQL: it is not a
  query result, and subscriptions would put a websocket in front of an
  already-solved problem.

A synchronous blocking call is allowed only when the operation is bounded well
under the request timeout, and it must declare an explicit client-side timeout.

### 5. Nothing changes between existing modules

ADR-001 stands unamended for `apps/api` internals. Modules still communicate
through published contracts, domain events, read models and `platform-shared`.
Introducing an HTTP call between two NestJS modules remains a build failure.
The only new network boundary in the system is `apps/api` → `service-ai`.

## Why not the alternatives

**gRPC between backends.** The strongest technical alternative, and the right
answer later rather than now. Its wins — per-call serialization efficiency and
bidirectional streaming — need high call volume to matter. AI calls are bursty
and dominated by model latency, so saving milliseconds of JSON parsing is noise
against a multi-second model response. Against that, it adds a `protoc`/`buf`
toolchain, code generation for two languages in CI, weaker debuggability, and
no browser path without grpc-web. One caller, one callee, one small team.

Revisit gRPC when any of these becomes true, and supersede this ADR rather than
amending it:

- a third internal service appears, making point-to-point REST clients an N²
  problem;
- profiling shows per-call overhead is a measurable share of latency;
- a workflow genuinely needs bidirectional streaming between services.

**GraphQL everywhere (Strawberry + federation).** Buys uniformity at the cost of
a gateway — a fourth deployable and a new failure point — plus a federation
refactor of a working code-first schema. GraphQL also fits AI workloads poorly:
streaming needs subscriptions, long jobs do not map onto request/response, and
binary payloads are awkward. Most decisively, federation naturally exposes the
AI subgraph at the public edge, which contradicts decision 2.

**Migrating off GraphQL.** Rejected without hesitation. ~1,011 types, 75 enums,
a full RTK Query layer and a working CI contract gate, against no problem that a
migration solves.

## Consequences

**Positive**

- The public contract is unchanged; no frontend work is required to add the
  service.
- The AI service can adopt Python-native tooling without negotiating with the
  Node toolchain, and can scale on its own profile.
- The core/AI contract is as machine-checked as the core/frontend contract.
- Because `apps/api` owns the edge, an AI outage degrades a feature rather than
  breaking authentication or the dashboards.

**Negative**

- Two interface definition languages in one repository (GraphQL SDL and
  OpenAPI). This is the accepted cost of decision 1.
- One extra hop for browser-originating AI calls, and a genuine partial-failure
  mode that did not exist under the monolith. Every call site must define a
  timeout and a degraded path.
- The first cross-language contract: a Python change can break a TypeScript
  build. The drift gate makes that a CI failure rather than a runtime one, which
  is the point, but it does lengthen the feedback loop.

**Neutral**

- `openapi.json` joins `schema.gql` as a committed generated artifact. Both are
  regenerated by CI and neither is edited by hand.
- The AI service holds no database credentials in this phase. It receives the
  data it needs in the request. Giving it its own store is a separate decision
  and a separate ADR.

## Related

- [ADR-001 — Modular monolith](adr-001-modular-monolith.md)
- [ADR-003 — Cross-domain communication](adr-003-cross-domain-communication.md)
- `apps/service-ai/README.md`
- `context/project-overview.md`
