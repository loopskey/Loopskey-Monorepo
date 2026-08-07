# AI backend scope

Load this file only for `apps/service-ai` work.

- FastAPI on Python 3.12, uv, Pydantic v2, strict mypy, ruff.
- Private service. No browser calls it; `apps/api` is the only caller and the
  only public edge. Never add CORS or end-user authentication here.
- Never re-derive authorization from a client-supplied user ID. `apps/api`
  already decided; this service authenticates its caller, not a person.
- Respect the layer direction: `api → services → domain ← adapters`. `domain`
  imports no framework; `services` reach outward only through its `Protocol`
  ports.
- Read configuration through `get_settings()`, never `os.environ`.
- Every failure leaves through `core.errors.ErrorResponse`. An `ErrorCode`
  value is the wire contract — add a member, never change an existing value.
- Give every outbound call an explicit timeout and map provider failures in the
  adapter. A raw provider exception must not reach a route.
- Never log credentials, prompts containing personal data, or provider tokens.

Run from repository root:

```text
npm run lint --workspace service-ai
npm run check-types --workspace service-ai
npm run test --workspace service-ai
npm run build --workspace service-ai
```

Changing a route or Pydantic schema changes the contract: run
`npm run codegen --workspace service-ai` and commit `openapi.json` in the same
change. `tests/test_openapi_contract.py` fails otherwise. Never hand-edit
`openapi.json`.

Adding a field to a `v1` response is compatible; renaming or removing one is
not — add `v2` instead.

See `apps/service-ai/README.md` for setup, layout and layer rules, and
`context/architecture/adr-007-ai-service-communication.md` for why the boundary
is shaped this way.
