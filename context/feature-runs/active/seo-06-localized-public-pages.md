# seo-06-localized-public-pages

- Scope: `full`
- Model: `High reasoning — a root-layout and route-tree change, a new domain-owned translation model with optimistic concurrency, an additive Prisma migration, and public disclosure/visibility rules across four content kinds.`
- Branch: `feature/seo-06-localized-public-pages`
- Base: `24b82fae70704cd4a419e0f1800934848f851f3b`
- Status: `Submitted`

## Acceptance

- [x] English legacy URLs retain their canonical identity; `/en` aliases normalize.
      `/en` and `/en/about` answer 308 to `/` and `/about`; every existing
      unprefixed English URL is served by a rewrite to the internal `/en` tree and
      keeps its canonical.
- [x] Direct French static requests contain French primary text and metadata
      before JavaScript; hydration does not change the locale.
      Raw `/fr/about` HTML has `<html lang="fr">`, a French title, a French
      canonical and reciprocal alternates. With a conflicting `fr` value in
      localStorage, `/about` stays English and records no `lang` mutation during
      hydration; 13 static pages hydrate with no React error.
- [x] Published translated details have reciprocal valid alternates and sitemap
      entries; missing/draft variants have neither and return noindex 404.
      `/courses/course-en-fr` and `/fr/courses/course-en-fr` each list `en`, `fr`
      and `x-default`; the draft and missing variants return 404 with
      `noindex, nofollow`, no alternate, and a link back to the original
      language. Sitemap shards carry `xhtml:link` alternates only for published
      variants.
- [x] Metadata-only or navigation-only translation is not treated as full content.
      Completeness is enforced per kind in the shared engine; incomplete rows
      cannot be published and a source-language page never claims a variant it
      does not have.
- [x] Parent withdrawal removes all public variants within the 05 contract.
      Variants are read through the parent's public eligibility, so withdrawal,
      deletion and archive remove the French page, its alternates and its sitemap
      entries on the next request.
- [x] Wrong-owner edits and stale-version overwrites fail safely.
      56 E2E cases, including barrier-driven simultaneous saves and publishes
      that leave one winning version and one persisted state, and the editor
      conflict flow in a browser.
- [x] Auth/OAuth/dashboard routes and preferences remain compatible.
      `/auth/admin` and `/dashboard/provider` answer 200 unprefixed; `/fr/auth/...`
      is 404; the root auth `proxy.ts` is untouched and the stored language
      preference still drives non-public routes.

## Verification

- `npm run lint` (root) — pass
- `npm run check-types` (root) — pass
- `npm run test --workspace api` — pass
- `npm test --workspace front` — pass (3 files, 27 tests, unchanged; no frontend
  test was added or edited)
- `npm run build` (root) — pass; the localized static pages prerender under
  `/en` and `/fr`, details stay dynamic
- `npm run bundle-report --workspace front` — pass
- `npm run codegen --workspace front` — run from the committed `schema.gql`
- Prisma: `20261010050310_localized_content_translations` applies to a fresh
  database; the Prisma-generated `DROP INDEX` statements were removed first
- `npm run test:e2e --workspace api` on PostgreSQL 17 at UTC, fresh database,
  re-run after the final refactor: 35 suites, 434 tests pass, including
  `content-translation.e2e-spec.ts` (56 cases) and `public-url-discovery`. An
  earlier full run failed `concurrency/outbox-delivery` (and, without the
  translation suite, `outbox-lanes`) on 120 s timeouts; the same failure
  reproduced on a clean clone of `24b82fa`, so it is an existing timing race
  between an in-flight outbox tick and app shutdown, not this change
- Browser, production build against the real API and a seeded database:
  conflicting localStorage, language switch with Back, catalog filters surviving
  a switch, French form submit staying under `/fr`, no-JS language links,
  mobile overflow 0, detail variants, draft and missing variants, not-found
  pages in both languages, and the authenticated events editor (load, save,
  publish, unpublish, blank, conflict with reload, Escape and focus return)
- Raw HTML and sitemap inspected with curl: alternates are reciprocal and
  absolute, the index and shards pass the 05 contract, and staging stays closed

## Behaviour notes

- English is unprefixed and French is `/fr`. No visitor is redirected by
  language; only the `/en` prefix is redirected.
- The route decides language. `LanguageProvider` is seeded from the route and
  ignores localStorage on public routes; the French dictionary is loaded only on
  French routes.
- Translations are optional, one row per parent and locale, with a unique
  constraint, an optimistic `version`, a publish switch and bounded fields.
  The source language is read from the parent; an unknown source language is
  never asserted as `en` or `fr`.
- Every successful translation write bumps the parent's public timestamp in the
  same transaction, so the sitemap `lastmod` moves with real edits only.
- A missing variant logs `public-content.variant-missing` with the operation and
  locale only: no slug, no visitor identity.
- The Header's active link strips either locale prefix, because server rendering
  of a rewritten static page reports the internal `/en/...` path while the
  browser reports `/about`; this was the cause of React error #418.

## Contract changes

- GraphQL, additive: optional `locale` on the public readers and lists,
  `contentLanguage` and `availableLocales` on the four content entities, one
  translation type, one save input and one publication input per kind, and
  matching save/set-publication mutations and list queries for owners. Discovery
  pages expose published locales.
- Prisma, additive: `CourseTranslation`, `EventTranslation`,
  `PodcastTranslation` and `YouTubeChannelTranslation`. Nothing is dropped.
- Routing: `/en` is permanently redirected; French public pages live under `/fr`.
- Sitemap: shard row cap is 25,000 to leave room for the variants.

## Submission

- Commit: `d66ff35`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/287
- CI: pending
