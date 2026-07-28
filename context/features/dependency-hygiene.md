# Dependency Hygiene

> Source: `context/monorepo-audit.md` — **MONO-10**, findings **D-13**, **D-14**,
> **D-15**. No prerequisite.

## Objective

Fourteen declared dependencies are never imported, five shared packages drift
between the two apps, and one package is used without being declared.

## Status

Not Started

## Goals

- Remove dependencies that nothing imports.
- Align the versions of packages both apps share, `@types/node` above all.
- Declare `@graphql-codegen/typed-document-node`.
- Leave each `package.json` an honest description of what the app actually uses.

## Evidence

### Unused in `apps/api` (zero references in `apps/api/src` or `apps/api/prisma`)

```text
@heroicons/react        @tanstack/react-query    @nestjs/swagger
@prisma/adapter-pg      @sendgrid/mail           stripe
puppeteer               googleapis
```

Two are frontend libraries sitting in a backend package. `@prisma/adapter-pg` is
the Prisma 6 / adapter 7 compatibility risk `context/project-overview.md` already
flags — carried for a package nothing imports.

### Unused in `apps/front` (zero references in `apps/front/src`)

```text
html2canvas    reactflow    @tanstack/react-query    jspdf    graphql-tag
```

`dotenv` has no `src` references but **is** used by `apps/front/codegen.ts:2`; it
belongs in `devDependencies`.

`@tanstack/react-query` is declared in **both** apps and used in **neither** — no
`QueryClient`, no `react-query` import anywhere, and
`apps/front/src/providers/app-provider.tsx` wires only Theme and Language. The
note in `context/current-feature.md` claiming it is "installed and
provider-wired" is stale and should be corrected.

### Version drift

| Package | `apps/front` | `apps/api` |
| --- | --- | --- |
| `@types/node` | `^20` | `^22.19.17` |
| `typescript` | `^5` | `^5.7.3` |
| `graphql` | `^16.13.2` | `^16.11.0` |
| `eslint` | `^9` | `^9.18.0` |
| `@eslint/eslintrc` | `^3` | `^3.2.0` |

`@types/node` is the one with teeth: two TypeScript projects in one repository
compiling against different Node type definitions. The frontend's bare `^5` /
`^9` / `^3` ranges also let the two apps silently resolve to different majors
after any `npm install`.

### Phantom dependency

`apps/front/codegen.ts:11` requests `typed-document-node`;
`apps/front/package.json` does not declare
`@graphql-codegen/typed-document-node`. It resolves only via npm hoisting from
`@graphql-codegen/cli`.

## Scope

Three independent steps, each verifiable on its own. Do them as separate commits.

1. **Remove unused dependencies.** API first (8), then frontend (5), then move
   `dotenv` to `devDependencies`.
2. **Align versions.** Pin `@types/node` to one major across both apps; give the
   frontend explicit ranges for `typescript`, `eslint` and `@eslint/eslintrc`.
3. **Declare the phantom.** Add `@graphql-codegen/typed-document-node` to
   `apps/front/devDependencies`.

### Out of scope

- Upgrading any dependency to a new major beyond what alignment requires.
- Removing `@firecms/neat`, `ogl`, `three`, or `GalaxyBackground` — those are
  orphaned *application* code from earlier phases, listed in
  `current-feature.md` as awaiting a dedicated cleanup decision. Different
  question, different feature.

## Before removing anything

A static import search cannot see a dynamically `require()`d package. Before
removing, confirm each is genuinely dead:

- `puppeteer` — check for PDF generation or headless-browser paths.
- `@sendgrid/mail` — the app uses Resend; confirm SendGrid is not a fallback.
- `stripe` — confirm no payment webhook path loads it lazily.
- `googleapis` — the app uses `passport-google-oauth20` and has a Google Calendar
  redirect configured; confirm `googleapis` itself is not used by that path.
- `@nestjs/swagger` — confirm no decorator from it is used for schema metadata.

If any turns out to be needed, leave it and record why in the history.

## Verification

After each removal group:

- `npm install` succeeds and the lockfile updates.
- `npm run build` passes for both apps.
- `npm run check-types` and `npm run lint` pass.
- API Jest 157 passing; frontend Vitest 112 passing.

After the `@types/node` alignment specifically:

- `npm run check-types` in `apps/front` — this is where new errors will surface.
  Do it as its own commit so it can be reverted alone.

After declaring the phantom:

- Delete `node_modules/@graphql-codegen/typed-document-node`, reinstall the
  frontend workspace, and confirm `npm run codegen --workspace front` still
  works.

Live smoke test before considering the API removals final: exercise email
delivery, and any PDF or payment path that exists, against the running API.

## Risks

- A dynamically-loaded package removed by mistake fails only at runtime, in the
  one code path nobody tested. The pre-removal checklist above is the mitigation.
- Bumping `apps/front`'s `@types/node` from 20 to 22 may surface new type errors.
  Separate commit.

## Acceptance Criteria

- Every remaining dependency in both `package.json` files is imported somewhere,
  or has a recorded reason for staying.
- `@types/node` resolves to the same major in both apps.
- `@graphql-codegen/typed-document-node` is declared and codegen survives a clean
  reinstall.
- All gates pass after every step.
- The stale "TanStack Query is provider-wired" note in `current-feature.md` is
  corrected.

## History

<!-- Keep this updated. Earliest to latest -->
