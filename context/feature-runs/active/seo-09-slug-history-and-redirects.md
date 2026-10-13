# seo-09-slug-history-and-redirects

- Scope: `full`
- Model: `High reasoning — a new persisted URL registry with database-level uniqueness across four content kinds, a Prisma migration with backfill and triggers, ownership and optimistic-concurrency rules, concurrent claims, and public redirect behaviour across API and frontend.`
- Branch: `feature/seo-09-slug-history-and-redirects`
- Base: `3b12c5c945e15750af00063bc0977af62b209dbc`
- Status: `Submitted`

## Acceptance

- [x] Existing slugs remain byte-compatible after migration.
      The migration backfills one current `ContentUrlClaim` per course, event,
      podcast and channel with the stored slug unchanged and touches no content
      row; the audit queries in `concurrency-operations.md` compare counts.
- [x] A deliberate change preserves old links with one 308 to the current URL.
      Raw requests to a real API and the production build: the original, second
      and third slug of one event each answered `308` with
      `location: /events/<current>`; the current slug answered `200`.
- [x] Two concurrent claims for the same namespace/slug have one winner; final
      DB contains no ambiguous current/historic identity.
      Barrier-driven specs for all four kinds: two records claiming one slug end
      with one `OK` and one `CONTENT_URL_SLUG_TAKEN`, one claim row and one
      current claim per record; six edits of one record end with one winner and
      five `CONTENT_URL_VERSION_CONFLICT`.
- [x] Create/import/ingest cannot reuse another record's historic slug.
      Management creation (four kinds), ingestion (four kinds) and the course
      import skip a retired slug, and a direct write of a retired slug fails
      with a Prisma `P2002` naming `slug`.
- [x] A > B > C and return-to-own-old-slug create no loop or redirect chain.
      A and B both resolve straight to C; returning to A leaves three claims and
      one current, and B and C resolve to A.
- [x] Hidden/deleted/missing-language target returns safe 404 from old paths.
      A draft or soft-deleted target answers 404 from the old and current path
      and `resolveContentUrl` returns null. An event with no French variant
      answered 404 on `/fr/events/<old>` rather than redirecting.
- [x] Malformed/open-redirect/wrong-owner/stale-version requests fail safely.
      13 invalid-slug cases, anonymous, wrong role, wrong owner, unknown and
      deleted record, a stale expected slug; `?next=`/`?returnTo=`/tracking
      parameters are dropped from the redirect location; `..%2f`, `%2F` and
      upper-case paths answer 404.
- [x] Sitemap/schema/metadata/new links use only the current canonical URL.
      `publicUrlPage` listed only the current slug after two renames; the SEO
      preview and every detail page read `slug` from the record.

## Verification

- `npm run lint` (root) — pass
- `npm run check-types` (root) — pass
- `npm run build` (root, `NEXT_PUBLIC_SITE_URL` and `DEPLOYMENT_ENV` set as CI does) — pass
- `npm run bundle-report --workspace front` — pass; static public routes unchanged
- `npm run test --workspace api` — pass (163 suites, 2,269 tests, 60 s timeout)
- `npm run test:e2e --workspace api` on PostgreSQL 17, fresh database set to
  `TimeZone=UTC`: 45 suites, 682 tests pass, including `content-url` (120 cases
  over four kinds) and `content-url-creation-paths` (9). A first run on a database
  left at the server's local time zone failed `registration-otp`, `outbox-lanes`
  and `outbox-delivery`; they pass on a UTC database, as the suites require.
- `npm run codegen --workspace front` — run; `content-url` added to the domain list
- Prisma: `20261011170323_content_url_claims` applies to a fresh database;
  `migrate status` reports up to date and `migrate diff` shows only the
  existing trigram `DROP INDEX` noise, no `ContentUrlClaim` drift. The 45
  generated `DROP INDEX` statements were removed from the migration.
- No frontend test was added
- Browser (Chromium, production build against the real API and a seeded database):
  administrator opens the search and sharing dialog, the Page address section
  loads, shows English and French addresses and earlier addresses; Change address
  stays disabled until the warning checkbox is ticked, an invalid slug shows the
  invalid message, editing clears the confirmation, a valid slug is saved and the
  list and preview update, old paths then redirect; at 360 px nothing overflows;
  focus order reaches the controls from the field.

## Behaviour notes

- Registry: `ContentUrlClaim`, unique `(namespace, slug)`, partial unique
  `(namespace, targetId)` where current, kept in step by the
  `content_url_claim_sync` trigger on the four content tables, so every write
  path claims through one door and `slug` updates rotate history atomically.
- The expected version of a change is the slug the editor read, compared in the
  `updateMany` that writes it; repeating a completed change is a no-op.
- Claims are never deleted; soft or hard deletion keeps the reservation.
- Public resolution returns the current slug only for a published, undeleted
  target; the frontend then re-reads the localized detail with the normal reader
  and redirects only if that succeeds, so a missing translation or an outage is
  never turned into a redirect.

## Contract changes

- GraphQL, additive: `contentUrl`, `changeContentSlug` (provider owner or admin),
  public `resolveContentUrl`; `ContentUrlKind`, `ContentUrlSettings`,
  `ContentUrlResolution`, `ChangeContentSlugInput`; `AuditAction`
  `CONTENT_SLUG_CHANGED`.
- Prisma, additive: `ContentUrlClaim`, `ContentUrlNamespace`, the triggers.
- `@loopskey/api-contracts`: `ContentUrlMessageCode`, `CONTENT_SLUG_LIMITS`.

## Submission

- Commit: `d70e4b1`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/293
- CI: pending
