# Loopskey agent instructions

This repository contains a Next.js frontend and a NestJS backend. Inspect the
relevant code before making changes and load only the project context required
for the current task.

## Project context

- Read `context/project-overview.md` when a task depends on the architecture,
  domains, data model, or application boundaries.
- Read `context/coding-standards.md` before implementing or reviewing code.
- Read `context/feature-history.md` when prior feature decisions or completed
  work affect the current task.
- Do not preload the rest of `context/`; open individual files only when they
  are directly relevant.

## Repository rules

- Preserve unrelated user changes.
- Use npm workspaces and run project-level commands from the repository root.
- The browser communicates with `apps/api` through GraphQL.
- Keep NestJS module communication in-process; do not introduce internal HTTP,
  GraphQL, gRPC, or broker calls between modules.
- Do not commit directly to `main` or `develop`.
