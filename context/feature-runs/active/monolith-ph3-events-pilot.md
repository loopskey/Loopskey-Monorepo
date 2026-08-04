# Modular Monolith Phase 3 — Events Vertical-Slice Pilot

- Status: Ready
- Risk: High
- Spec: `context/features/monolith/monolith-ph3-events-pilot.md`
- Branch: `chore/monolith-ph3-events-pilot`
- Base: `develop@b2cd18f65dea089bb48b8a3aa05900a7bae53a6d`
- Updated: 2026-08-03

## Scope

- Prove layered Events architecture without changing GraphQL behavior.
- Replace Engagement's Event writes with an Events-owned public use-case API.
- Add one versioned, in-process event with explicit best-effort failure behavior.
- Remove Phase 3 Event boundary exceptions and document pilot lessons.

## Progress

- [x] Layer Event transport, application, domain, and persistence responsibilities.
- [x] Publish the minimal API and migrate the confirmed Engagement consumer.
- [x] Add and consume one versioned domain event.
- [x] Run the compiled GraphQL E2E additions against an isolated test database.
- [x] Remove Phase 3 exceptions and document lessons.

## Decisions

- Preserve existing GraphQL operation names, DTOs, and output entities.
- Preserve the unrelated `.claude/settings.local.json` file outside task scope.
- Event handlers are explicitly best-effort until Phase 7 adds durable delivery.
- ADR-004 records the new acyclic Engagement-to-Learning-Catalog public-port edge.

## Evidence

- Baseline: 46 architecture tests and API type check passed at `b2cd18f`.
- Focused implementation: API type check, lint, and 50 focused tests passed
  before persistence extraction; final rerun pending.
- Final non-database evidence: API type check passed; 56 focused Events and
  architecture tests passed; all 243 API tests passed; API lint and production
  build passed; the E2E TypeScript project compiles; `git diff --check` passed.
- The new E2E cases cover provider create/update/publish and forbidden
  professional create through HTTP GraphQL. The provider flow also enrolls a
  professional through `enrollContent`, exercising the Engagement-to-Events
  public port and real Prisma transaction.
- Final gate: workspace lint passed; workspace type checks passed; API 244/244
  and frontend 112/112 tests passed; workspace production builds passed;
  GraphQL codegen has zero tracked drift; Prisma schema validation passed;
  `git diff --check` passed.
- Isolated PostgreSQL 17 replayed all 13 migrations and GraphQL HTTP E2E passed
  5/5. The cluster was stopped and its temporary directory was removed.

## Blockers

- None.

## Delivery

- Commit / PR / merge pending Ship approval.
