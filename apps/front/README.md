# Loopskey frontend

Next.js application for public content and role-based dashboards.

From the repository root:

```text
npm ci
npm run dev --workspace front
npm run test --workspace front
npm run codegen --workspace front
```

The development server normally runs at `http://localhost:3000`. GraphQL types
in `src/lib/graphql/generated.ts` are generated; update the documents or API
schema and rerun codegen instead of editing that file manually.
