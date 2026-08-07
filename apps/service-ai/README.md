# service-ai

The Loopskey AI service: model inference, embeddings, retrieval, and anything
else that needs the Python ML ecosystem. FastAPI on Python 3.12, managed with
[uv](https://docs.astral.sh/uv/).

**It is a private service.** The browser never calls it. Every request arrives
from `apps/api`, which has already authenticated and authorized the user. The
reasoning is in
[`context/architecture/adr-007-ai-service-communication.md`](../../context/architecture/adr-007-ai-service-communication.md).

```text
Browser ──GraphQL──► apps/api ──REST/OpenAPI──► service-ai ──► model provider
                     (only public edge)         (private)
```

## Prerequisites

- Python 3.12
- [uv](https://docs.astral.sh/uv/getting-started/installation/) on `PATH` —
  required even if you only work on the TypeScript applications, because
  Turborepo runs this workspace's tasks as part of the root commands.

## Setup

```bash
cp apps/service-ai/.env.example apps/service-ai/.env
uv sync --all-groups --project apps/service-ai
```

The service serves on `http://127.0.0.1:5800`, with interactive docs at `/docs`
outside production.

## Commands

Run from the repository root, like every other workspace:

```bash
npm run dev          --workspace service-ai   # uvicorn with reload
npm run lint         --workspace service-ai   # ruff check + format check
npm run format       --workspace service-ai   # ruff format
npm run check-types  --workspace service-ai   # mypy, strict
npm run test         --workspace service-ai   # pytest
npm run codegen      --workspace service-ai   # regenerate openapi.json
```

Root `npm run dev`, `test`, `lint`, `check-types` and `codegen` include this
workspace automatically — `package.json` here is a thin wrapper that shells out
to uv, so Turborepo orchestrates all three applications from one place.

## The contract

`openapi.json` is committed, generated, and never hand-edited — the same
arrangement `apps/api/src/graphql/schema.gql` has on the frontend boundary.

```text
FastAPI routes + Pydantic schemas     source of truth
  └─ scripts/export_openapi.py
      └─ openapi.json                 committed artifact
          └─ generated client types in apps/api   (planned — see below)
```

The `apps/api` half is not built yet. It arrives with the first feature that
actually calls this service, because a generated client with no consumer is
unused code by this repository's own standard. Everything on this side of the
boundary — the contract and its drift gate — is in place today.

`tests/test_openapi_contract.py` fails when the committed file and the
application disagree, so a forgotten `npm run codegen` is a red CI run rather
than a client that describes a service which no longer exists.

Note that `test` deliberately does **not** depend on `codegen`. Regenerating
before asserting would make the drift test pass unconditionally.

### Changing the contract

1. Change the route or Pydantic model.
2. `npm run codegen --workspace service-ai`.
3. Commit `openapi.json` with the code change.

Adding a field is compatible. Renaming or removing one is not: add `v2` under
`api/` rather than reshaping a released `v1` response.

## Layout

```text
apps/service-ai/
├── openapi.json              generated contract, committed, never hand-edited
├── pyproject.toml            deps, ruff, mypy, pytest — one config file
├── package.json              thin Turborepo wrapper over uv
├── scripts/
│   └── export_openapi.py     writes openapi.json
├── src/service_ai/
│   ├── main.py               app factory, middleware, router mounting
│   ├── core/                 config, logging, correlation, errors, security
│   ├── api/
│   │   ├── router.py         mounts ops + versioned surfaces
│   │   ├── ops/              /health and /ready — public, unversioned
│   │   └── v1/               authenticated, versioned, in the contract
│   │       ├── router.py     applies the service credential once
│   │       ├── routes/       one module per resource
│   │       └── schemas/      Pydantic request/response models
│   ├── domain/               framework-free types and Protocol ports
│   ├── services/             use cases, orchestration
│   └── adapters/             provider clients, core-API callback client
└── tests/
```

### Layer rules

Dependencies point one way, mirroring the direction rule the TypeScript
workspaces enforce with ESLint:

```text
api  ──►  services  ──►  domain  ◄──  adapters
 └────────────┴──────────► core ◄───────┘
```

- `domain` imports nothing — no FastAPI, no httpx, no provider SDK. That is
  what makes it testable without a network.
- `services` reach outward only through the `Protocol` ports in `domain`, so a
  test substitutes a fake instead of mocking HTTP.
- `adapters` own retries, timeouts, and translating provider failures into
  `core.errors`. A raw provider exception must never reach a route.
- `api` translates transport and delegates. No business rules.

## Conventions

- **Configuration** is read once, validated by `core/config.py`, and reached
  through `get_settings()`. Nothing calls `os.environ` directly, so a bad
  variable fails at startup rather than mid-request.
- **Logging** is JSON outside development and carries the `x-correlation-id`
  the core API sent, so one browser action is traceable across all three
  applications. Keys naming a credential are redacted.
- **Errors** all leave through `ErrorResponse`. The `code` is the wire
  contract — add a member, never change an existing value.
- **Authentication** is applied once on the `/v1` router, so a new route is
  guarded by default. `SERVICE_AI_API_KEY` is optional in development and
  required everywhere else; a deployment that requires it and lacks it fails
  closed and reports not-ready.

## Long-running and streaming work

Model calls run from milliseconds to tens of seconds, so two shapes exist:

- **Deferred** — `apps/api` appends an outbox event, its handler calls here,
  and the result returns through a callback on `apps/api`. Retries and
  idempotency come from the existing outbox.
- **Streaming** — this service emits Server-Sent Events and `apps/api` proxies
  them to the browser. Token streaming stays out of GraphQL.

A blocking synchronous call is acceptable only when the work is bounded well
under the request timeout, and it must set an explicit client-side timeout.

## What this service does not do

- It holds no database credentials and does not talk to PostgreSQL. It receives
  what it needs in the request. Giving it a store is a separate ADR.
- It performs no user authorization. Role and ownership rules live in
  `apps/api` and are not duplicated here.
- It configures no CORS, because no browser calls it.
