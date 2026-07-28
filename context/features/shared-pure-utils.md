# Shared Pure Utilities

> Source: `context/monorepo-audit.md` — **MONO-11**, findings **D-1** and **D-2**.
> Prerequisite: **MONO-01**. Best paired with **MONO-08** for the boundary rules.

## Objective

Two distinct problems, both about code with no home.

`slugify` is implemented **six times** in `apps/api` — byte-for-byte identical in
five of them — and the one properly exported version is imported by nobody. Slugs
become public URLs, so a fix applied to one copy and not the others produces
divergent, already-indexed URLs.

Separately, `apps/front/src/utils/function-helper.ts` is a 305-line, 40-export
grab bag with no responsibility boundary.

## Status

Not Started

## Goals

- One `slugify`, with tests, used by all six call sites.
- One `trimToNull`.
- A `packages/utils` with a **strict admission rule** so it does not become the
  `shared` package the specification warns against.
- Split `function-helper.ts` along its actual seams, isolating the server-only
  secret accessor.

## Evidence

### D-1 — six `slugify` implementations

```text
apps/api/src/common/utils/seed-helpers.ts:3               export const slugify   (canonical, imported by nobody)
apps/api/src/modules/course/services/course.service.ts:432          private slugify
apps/api/src/modules/course/services/course-import.service.ts:423   private slugify
apps/api/src/modules/events/services/event.service.ts:533           private slugify
apps/api/src/modules/podcast/services/podcast.service.ts:427        private slugify
apps/api/src/modules/youtube/services/youtbue.service.ts:443        private slugify
```

Five are identical:

```ts
value.toLowerCase().trim()
  .replace(/['"]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
```

`course-import.service.ts:423` differs only by throwing
`InternalServerErrorException` on an empty result.

*(`youtbue.service.ts` is a real filename typo in the repository, reproduced
verbatim.)*

### D-2 — `trimToNull` twice, in files one character apart

```text
apps/api/src/common/utils/functions-helper.ts:1                export const trimToNull
apps/api/src/modules/professional/utils/function-helper.ts:4   export const trimToNull
```

Byte-identical. The near-identical filenames (`functions-helper` vs
`function-helper`) are how the second came to exist.

### `function-helper.ts` has no boundary

Among its 40 exports: `isRole`, `documentToString`, `dictionaries` (the entire
en/fr i18n JSON), `getInitials`, `formatCurrency`, `humanizeEnumValue`,
`faqCategories`, and **`getSessionSecret`** — a server-only secret accessor
sitting in the same module as browser formatters.

Nothing has leaked; Next tree-shakes and no client component calls it. But the
file is one careless import away from a problem.

## The admission rule

**This is the most important part of the feature.** A `packages/utils` with no
admission rule becomes a dumping ground.

A function may live in `packages/utils` only if **all** of these hold:

- It is pure — same input, same output, no side effects.
- It imports nothing: no `react`, no `next`, no `@prisma/client`, no `node:*`, no
  third-party package, no browser or Node global.
- It has a unit test.
- It has at least two call sites, or one call site in each app.

Anything failing this stays in its app. The MONO-08 boundary lint rules should
enforce the import half mechanically.

## Scope

### In scope — moving to `packages/utils`

```text
packages/utils/src/
├── slug.ts       slugify
├── string.ts     trimToNull, humanizeEnumValue
└── format.ts     formatFileSize
```

- Delete the five private `slugify` methods; route all six call sites through the
  shared one. Preserve `course-import.service.ts`'s empty-result throw as a thin
  wrapper, **not** a second implementation.
- Delete one of the two `trimToNull` definitions.

### In scope — splitting `function-helper.ts`

Split along actual seams, and move `getSessionSecret` into a `server-only`
module.

### Explicitly staying put

- `getSessionSecret` — server-only, `apps/front`.
- `documentToString` — depends on `graphql`.
- `dictionaries`, `faqCategories`, `translateWithFallback` — frontend i18n.
- `isRole`, `getPromotionTypeLabel` — depend on generated GraphQL types.
- `formatCurrency`, `formatDate`, `formatTime` — depend on `Intl` and locale
  context; they are presentation, not utility.

### Explicitly not proposed

`packages/utils-browser` and `packages/utils-server`. There is one browser app
and one server app; a browser-only utility belongs in `apps/front` and a
server-only one in `apps/api` until a second consumer exists.

## Verification

- **Slug behaviour must not change.** Existing slugs are in the database and in
  indexed URLs. Add a unit test asserting the shared implementation produces
  byte-identical output to the current one for a spread of inputs: accents,
  quotes, punctuation, leading/trailing separators, empty string, all-symbols.
  Write this test **before** deleting the copies.
- API Jest 157 passing; frontend Vitest 112 passing, plus the new util tests.
- `npm run check-types`, `npm run lint`, `npm run build` pass.
- Confirm no `slugify` definition remains outside the package:
  `grep -rn "slugify" apps/api/src` should show imports and call sites only.
- **Live:** create a course, an event, a podcast and a YouTube entry through the
  API and confirm each generated slug matches what the old code would have
  produced.

## Risks

- **Scope creep is the main risk.** The admission rule above is the defence and
  should be quoted in the PR description.
- A behavioural change in `slugify` silently produces different URLs for new
  content while existing rows keep the old form. The byte-identical test is not
  optional.
- Splitting `function-helper.ts` touches many importers. Keep it mechanical —
  re-export from the old path during the move if that keeps the diff reviewable,
  then remove the shim.

## Acceptance Criteria

- Exactly one `slugify` and one `trimToNull` exist in the repository.
- Slug output is proven identical to the current behaviour.
- Every export in `packages/utils` satisfies the admission rule.
- `getSessionSecret` no longer shares a module with browser formatters.
- All gates pass.

## History

<!-- Keep this updated. Earliest to latest -->
