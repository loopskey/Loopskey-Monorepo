# Loopskey monorepo

Three applications: a Next.js frontend, a NestJS core backend, and a FastAPI AI
backend. Use `.claude/skills/feature/SKILL.md` for feature work.

## Documentation scope

Read the root documents plus **only** the scope files the task actually
touches. Determine scope from the request and the changed paths.

| Task type        | Paths                | Load                       |
| ---------------- | -------------------- | -------------------------- |
| Frontend         | `apps/front/**`      | `apps/front/CLAUDE.md`      |
| Core backend     | `apps/api/**`        | `apps/api/CLAUDE.md`        |
| AI backend       | `apps/service-ai/**` | `apps/service-ai/CLAUDE.md` |
| Shared / root    | `packages/**`, CI, deps, cross-app | only the scope files affected |

Shared project context stays at the root: `context/project-overview.md`,
`context/coding-standards.md`, `context/architecture/`. Read a section of these
only when the task depends on it; do not preload `context/`.

Permanent repository rules:

- Preserve unrelated work and never commit directly to `main` or `develop`.
- Target feature PRs to `develop`; never merge or delete branches automatically.
- Use npm workspaces and run commands from the repository root. Turborepo drives
  all three applications, including the Python one.
- Search code first. Read specific project/architecture documents only when the
  current task needs them.

Root scope includes shared packages, architecture, CI, dependency changes, and
changes spanning more than one application.

## Communication boundaries

Fixed by `context/architecture/adr-007-ai-service-communication.md`. One
contract per boundary; do not introduce a fourth.

- Browser → `apps/api`: **GraphQL**. The only public edge.
- `apps/api` → `apps/service-ai`: **REST over a committed OpenAPI contract**.
- Deferred work: the existing transactional **outbox**.
- Between NestJS modules: in-process contracts only. An internal HTTP, GraphQL,
  gRPC or broker call between modules remains a build failure (ADR-001).

`apps/service-ai` is never reachable from the browser.
