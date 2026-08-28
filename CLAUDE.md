# Loopskey monorepo

Two applications: a Next.js frontend and a NestJS core backend. Use
`.claude/skills/feature/SKILL.md` for feature work.

## Documentation scope

Read the root documents plus **only** the scope files the task actually
touches. Determine scope from the request and the changed paths.

| Task type        | Paths                | Load                       |
| ---------------- | -------------------- | -------------------------- |
| Frontend         | `apps/front/**`      | `apps/front/CLAUDE.md`      |
| Core backend     | `apps/api/**`        | `apps/api/CLAUDE.md`        |
| Shared / root    | `packages/**`, CI, deps, cross-app | only the scope files affected |

Shared project context stays at the root: `context/project-overview.md`,
`context/coding-standards.md`, `context/feature-history.md`, and
`context/architecture/`. Read a section of these only when the task depends on
it; do not preload `context/`.

Permanent repository rules:

- Preserve unrelated work and never commit directly to `main` or `develop`.
- Assume concurrent requests and multiple API instances. A business invariant
  must rest on a database constraint or a conditional write, never on a read
  performed before the write. Read "Concurrency and race conditions" in
  `context/coding-standards.md` before adding or changing one.
- Target feature PRs to `develop`; never merge or delete branches automatically.
- Use npm workspaces and run commands from the repository root. Turborepo drives
  both applications.
- Search code first. Read specific project/architecture documents only when the
  current task needs them.

Root scope includes shared packages, architecture, CI, dependency changes, and
changes spanning more than one application.

## Communication boundaries

- Browser → `apps/api`: **GraphQL**. The only public edge.
- Between NestJS modules: in-process contracts only. An internal HTTP, GraphQL,
  gRPC or broker call between modules remains a build failure (ADR-001).
