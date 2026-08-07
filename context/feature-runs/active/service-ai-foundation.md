# service-ai foundation

- Scope: `full`
- Branch: `feature/service-ai-foundation`
- Base: `102eb9dc0bdf4fd4b53494c6aaf96ecacce8af8c`
- Status: `Submitted`

## Acceptance

- [x] ADR-007 records the communication architecture for the third application
      and scopes ADR-001 rather than contradicting it.
- [x] `apps/service-ai` exists with a layered FastAPI structure, typed
      configuration, JSON logging with correlation IDs, and service-to-service
      authentication.
- [x] The service exposes `/health` and `/ready` with the same semantics the
      core API already uses.
- [x] `apps/service-ai/openapi.json` is committed and a test fails when the
      application and the committed contract diverge.
- [x] A thin `package.json` puts the service in the Turborepo task graph so
      root `npm run lint|check-types|test|build|dev|codegen` covers three
      applications.
- [x] CI runs the Python gate.
- [x] Root `CLAUDE.md` routes to three scopes; `apps/service-ai/CLAUDE.md`
      exists; `README.md` and `context/project-overview.md` describe three
      applications.

## Verification

Re-run in full after the docstring restore described under Notes.

- `npm run lint` — pass (4 workspaces)
- `npm run check-types` — pass (5 tasks; mypy strict clean on 22 files)
- `npm run test` — pass (api 295, front 112, service-ai 13)
- `npm run build` — pass (4 tasks)
- `npm run codegen` + `git diff --exit-code apps/front/.../generated.ts` — pass,
  no GraphQL drift
- `npx turbo run lint check-types test build codegen --filter=service-ai --force`
  — pass, 5/5 tasks

## Decisions

- Communication architecture chosen by the Team Lead from four evaluated
  options: GraphQL stays the sole client contract, `apps/api` remains the only
  public edge, and the core→AI boundary is REST over a committed, drift-checked
  OpenAPI contract. gRPC deferred with recorded revisit triggers (ADR-007).
- The Nest-side generated client is deliberately **not** built in this run. It
  lands with the first feature that calls the service, because a generated
  client with no consumer is unused code under `context/coding-standards.md`.
  The contract it will read is committed and gated today.
- `disallow_any_explicit` is not enabled in mypy: Pydantic's synthesized
  `__init__` makes it fire on every `class X(BaseModel)` line. `strict` is on.

## Notes

- Every module-level docstring was stripped from the Python sources by external
  tooling before submission, leaving nine `__init__.py` files at zero bytes and
  a stray leading blank line in 18 files. `ruff format --check` failed, so CI
  would have failed. The docstrings were restored on the Team Lead's
  instruction and `ruff format` was re-run. `openapi.json` never drifted:
  module docstrings do not reach the contract, and the class docstrings that do
  had survived.
- uv is now a prerequisite for the root Turborepo commands, including for
  frontend-only work. Recorded in `README.md` and `context/project-overview.md`.
- `starlette.testclient` emits a deprecation warning about httpx/httpx2 under
  Starlette 1.4. Harmless today; not pinned, because doing so would be a
  speculative dependency change.

## Submission

- Commit: `875d533`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/15
- CI: pending
