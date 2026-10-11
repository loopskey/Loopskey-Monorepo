# seo-08-editorial-seo-controls

- Scope: `full`
- Model: `High reasoning — persisted editorial metadata with ownership and moderation rules, optimistic concurrency, an additive Prisma migration, a new upload and retirement path for images, and public disclosure and indexing effects across four content kinds.`
- Branch: `feature/seo-08-editorial-seo-controls`
- Base: `6121363062949dda2d35547d83e20a741cf1bc84`
- Status: `Submitted`

## Acceptance

- [x] Authorized editors can save, clear and preview locale-specific overrides.
      Provider and administrator save English and French overrides through the
      dialog; null and blank clear, an omitted field keeps its value, and the
      preview follows the form with the page's canonical URL and an
      "approximation" label. Verified in Edge and by 45 E2E cases.
- [x] Existing rows/clients render correct defaults with no manual backfill.
      The migration adds no override rows; a page with no row reads
      `seoTitle: null` and the generated title, description and card are
      unchanged. Existing create/update operations are untouched.
- [x] Anonymous/wrong-role/wrong-owner edits and previews fail.
      Anonymous is rejected, a professional gets `FORBIDDEN`, another provider
      gets `ACCESS_DENIED` for both the read and the save and no row is written.
      The editor preview is client-side on authenticated data; there is no
      draft URL or token.
- [x] Unsafe assets, oversize fields and arbitrary canonical/robots input fail.
      A 201-character title and 501-character description are refused; a
      `canonicalUrl`, `robots` or `noindex` input field is a `BAD_USER_INPUT`;
      a GIF, SVG, forged PNG signature and a 2 MB+ file are refused; a URL,
      `javascript:` or `data:` value in place of an image id, an unknown id and
      another account's image are all `CONTENT_SEO_IMAGE_NOT_FOUND`.
- [x] Admin index exclusion removes sitemap eligibility and emits noindex without
      changing publication or pretending to protect confidential content.
      An excluded page answers `noindex, follow`, loses its `hreflang`
      alternates and structured data in both languages, leaves the sitemap
      shard, stays `PUBLISHED`, and returns when restored. Only an administrator
      can change it; a repeat call writes one audit entry.
- [x] Concurrent stale saves conflict; ingestion preserves approved overrides.
      Six simultaneous saves from version 1 leave one winner, five
      `CONTENT_SEO_VERSION_CONFLICT`, version 2 in the database; six simultaneous
      first saves leave one row. An ingestion update changes the source
      description and leaves both language rows, their versions and
      `excludeFromIndex`.
- [x] Public rendering/language eligibility follows 03/05/06 and never changes slug.
      The French override applies only on the French page that feature 06
      already serves; the English page is unchanged by it; no operation touches a
      slug or status.

## Verification

- `npm run lint` (root) — pass
- `npm run check-types` (root) — pass
- `npm run build` (root) — pass
- `npm run bundle-report --workspace front` — pass; no SEO editor code in a
  public route (the dialog loads with the provider and admin dashboards)
- `npm run test --workspace api` — pass (156 suites, 2,195 tests; run with a 60 s
  test timeout because two argon2-bound auth specs exceed Jest's 5 s default
  under load and pass alone)
- `npm run test:e2e --workspace api` on PostgreSQL 17 at UTC, fresh database:
  36 suites, 479 tests pass, including `content-seo.e2e-spec.ts` (45 cases); re-run after the final refactor
- `npm run codegen --workspace front` — run; no drift from the committed schema
- No frontend test was added
- Prisma: `20261011065914_content_seo_overrides` applies to a fresh database and
  `migrate status` reports no drift; the 45 generated `DROP INDEX` statements
  were removed first and the 57 trigram indexes are unchanged
- Browser, production build against the real API and a seeded database:
  - provider dialog: generated placeholder, counters, preview following the form,
    image upload and alt text, save, reload persistence, Escape returning focus to
    the trigger, a stale-version conflict with a reload button and focus moved to
    the message, reset to generated text clearing the override and retiring the
    image (old image URL 404), over-length input capped, forged and oversize files
    refused with their own messages, 360 px with no overflow
  - provider sees no indexing control
  - raw HTML after save: `<title>`, description, `og:title`, `og:image:alt`
    follow the override while the JSON-LD entity name stays the page's real
    title; the social card redirects to the uploaded image and is the generated
    card again once cleared
  - administrator: unknown slug message, lookup, French override on the French
    page only, exclusion and restoration

## Behaviour notes

- Overrides live in `CourseSeo`, `EventSeo`, `PodcastSeo` and
  `YouTubeChannelSeo`, one row per content and language, with an optimistic
  `version` and CHECK constraints for the bounds. Generated metadata is the
  default and an override replaces only what it sets.
- `ContentSocialImage` holds uploads. SEO rows reference it with RESTRICT, so an
  image still used anywhere cannot be deleted; retirement deletes the row first
  and the file after.
- Index exclusion is a column on each content table, written only by an
  administrator and audited without any text.
- A public catalogue list and its `ItemList` still show an excluded page, since
  visitors can still read it.
- Provider editing exists for events, the only kind with a provider management
  screen; the API serves all four kinds, and the administrator tab reaches all
  four.

## Contract changes

- GraphQL, additive: `courseSeo`, `eventSeo`, `podcastSeo`, `youtubeChannelSeo`
  queries; `save*Seo` and `set*IndexExclusion` mutations; shared
  `ContentSeoSettings`, `ContentSeoLocale`, `SaveContentSeoInput` and
  `SetContentIndexExclusionInput`; `seoTitle`, `seoDescription`,
  `socialImagePath`, `socialImageAlt` and `excludeFromIndex` on the four public
  entities; `slug` on the provider event table row.
- REST: `POST /content-social-image` (provider, administrator) and
  `GET /content-social-image/:id`.
- Prisma, additive: four `*Seo` tables, `ContentSocialImage`, `excludeFromIndex`
  on the four content tables, two `AuditAction` values.
- `@loopskey/api-contracts`: `ContentSeoMessageCode`, `CONTENT_SEO_LIMITS`, the
  social image route helpers.

## Submission

- Commit: `723431e`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/289
- CI: pending
