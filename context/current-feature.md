# Current Feature

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Completed -->

## Goals

<!-- Goals and requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

### 2026-07-17 — Initial setup

- Established the AI context system: `CLAUDE.md` plus `context/`
  (`project-overview.md`, `coding-standards.md`, `ai-interaction.md`,
  `current-feature.md`). Scaffolding committed in `ea51c98`; contents filled in
  afterwards.
- Adapted `ai-interaction.md` from a generic template to this repo: merge target
  corrected to `develop` (`main` is a vestigial 3-commit stub), review moved ahead
  of commit/merge, `feature/*` branch naming adopted for new work, verification
  split by app (browser for `front`, `/graphql` for `api`), build gate extended to
  `lint` and `check-types`, and no Claude attribution in commit messages.
- Frontend RTK Query data layer (`apps/front/src/stores/`) removed in `ea51c98`.
  Backend integration is to be rebuilt; TanStack Query is installed and
  provider-wired.
