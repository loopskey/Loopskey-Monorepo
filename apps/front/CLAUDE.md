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

Standards live in `context/features/performance/performance-optimization.md`.

After a build, `npm run bundle-report --workspace front` prints first-load
JavaScript per prerendered route. Check it when a change adds a dependency or a
client component, and keep heavy libraries (charts, calendar, spreadsheet,
WebGL, maps) behind `next/dynamic` or a deferred `import()`.
