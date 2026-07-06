---
name: ui-feature
description: Build or modify Loopskey frontend features in apps/front. Use when changing Next.js pages, dashboards, React components, hooks, RTK Query endpoints, GraphQL documents, translations, layouts, forms, or UI behavior.
---

# UI Feature

## Workflow

1. Read `CLAUDE.md`, then inspect the relevant route, module component, hook, and RTK endpoint.
2. Use App Router conventions under `apps/front/src/app`:
   - `(auth)` for auth screens.
   - `(dashboards)` for role dashboards.
   - `(pages)` for public pages.
3. Prefer existing aliases: `@/*`, `@components/*`, `@modules/*`, `@ui/*`, `@hooks/*`, `@lib/*`, `@utils/*`.
4. Reuse components from `src/components/ui`, `elements`, and `layouts` before adding new primitives.
5. Put feature UI in `src/components/modules/<Feature>` and orchestration/state in `src/hooks/use<Feature>.ts` when logic grows.
6. Keep visible text translatable. Update both `src/i18n/en.json` and `src/i18n/fr.json`.
7. Use generated GraphQL documents and types from `@/lib/graphql/generated`.
8. Keep role navigation consistent with `src/utils/constant.ts` and `src/utils/dashboard-nav.config.ts`.

## Design Rules

- Match the existing Loopskey visual system; avoid unrelated design language.
- Keep dashboard screens dense, scannable, and role-specific.
- Use existing form patterns with React Hook Form, Zod, floating inputs/selects, and shadcn/Radix controls.
- Ensure loading, empty, error, success, disabled, and permission states are handled for data-driven UI.
- Do not manually edit `src/lib/graphql/generated.ts`; regenerate it.

## Verification

Run the checks that match the change:

```bash
npm run codegen --workspace front
npm run build --workspace front
npm run lint --workspace front
```
