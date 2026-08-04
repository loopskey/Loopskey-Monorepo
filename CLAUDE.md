# Loopskey monorepo

Use `.claude/skills/feature/SKILL.md` for feature work.

Permanent repository rules:

- Preserve unrelated work and never commit directly to `main` or `develop`.
- Target feature PRs to `develop`; never merge or delete branches automatically.
- Use npm workspaces and run commands from the repository root.
- Load `apps/front/CLAUDE.md` only for frontend work and
  `apps/api/CLAUDE.md` only for backend work.
- Search code first. Read specific project/architecture documents only when the
  current task needs them; do not preload `context/`.

Root scope includes shared packages, architecture, CI, dependency changes, and
changes spanning both applications.
