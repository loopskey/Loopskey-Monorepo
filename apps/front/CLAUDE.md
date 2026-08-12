# Frontend scope

Load this file only for `apps/front` work.

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4.
- Use existing components, RTK Query, generated GraphQL types, and i18n patterns.
- Cover loading, empty, error, success, responsive, and keyboard states when relevant.
- Do not hand-edit generated GraphQL types.

Run from repository root:

```text
npm run lint --workspace front
npm run check-types --workspace front
npm run test --workspace front
npm run build --workspace front
```

Run `npm run codegen --workspace front` when GraphQL documents or schema change.
See `README.md` for local frontend setup.

## Performance

Standards live in `context/features/performance-optimization.md`.

After a build, `npm run bundle-report --workspace front` prints first-load
JavaScript per prerendered route. Check it when a change adds a dependency or a
client component, and keep heavy libraries (charts, calendar, spreadsheet,
WebGL, maps) behind `next/dynamic` or a deferred `import()`.

Two rules keep the shared shell small; both are easy to undo by accident.

- **Import GraphQL from the module that declares it**, not from the
  `@/lib/graphql/generated` barrel: `@/lib/graphql/base` for schema types and
  enums, `@/lib/graphql/operations/<domain>` for documents and operation
  types. The barrel re-exports everything, so one value import of it puts all
  fifteen domains in the route. `import type` from the barrel is free.
- **A `.types.ts` file imports with `import type`.** A plain `import` there is
  a runtime edge, and type modules are reachable from nearly every component,
  so one of them pulled the whole GraphQL surface into every static page.

Codegen writes `base.ts`, `operations/*.ts` and the `generated.ts` barrel, then
runs `scripts/graphql-postprocess.js`. None of them are hand-edited.
