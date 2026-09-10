# Content image policy — storage namespace, host cleanup and the social card

- Scope: `full`
- Model: `High reasoning — a server route that rasterises untrusted title text with an embedded multi-script font, a change to the image-host allow-list, and a new object-storage namespace whose path-traversal guard must hold.`
- Branch: `feature/content-image-policy`
- Base: `1bcb489` (stacked on `feature/additional-content-kinds` / phase 05, which is not yet merged)
- Status: `Ready`

Specification: `context/features/content-ingestion/06-content-image-policy.md`

## Decisions taken

- **Scope: reduced, image fetching OFF.** Per the spec's "Decision needed" and
  the safe default it names, this run does not build the outbound HTTP fetch
  pipeline (SSRF-hardened consumer, byte-signature validation, re-encode,
  image-outcome migration, `sharp`). It ships: the `"content"` object-storage
  namespace, the `next.config.ts` host cleanup, and the EN/FR/ZH social card.
  A crawled image URL therefore stays a candidate that is never written to
  `imageUrl`; ingested content renders the phase 00 generated card, which is a
  normal state.
- **Serving route deferred.** The public route that streams a stored content
  image (spec req 11) belongs with the fetch pipeline: nothing writes to the
  `"content"` namespace in this run, so an unauthenticated serving route would
  be attack surface with nothing to serve. The namespace is added so the later
  fetch phase has a home; the route lands with it.
- **Per-source fetch switch and image-outcome columns deferred** for the same
  reason — they only gate a pipeline that is not built here. No migration in
  this run.
- **Base: stacked on phase 05.** Phase 06 covers all four kinds and consumes the
  kind-aware `ingestion.item.published` event, so it needs phase 05's code. As
  directed, `feature/content-image-policy` branches from the phase 05 branch
  (committed at `fe82bb2`) rather than from `develop`. Its PR will show phase
  05's diff until phase 05 merges.
- **Social card renderer: `next/og` `ImageResponse`**, Node runtime, generated
  per request and cached (`revalidate`), never stored. No new dependency —
  `next/og` (Satori + resvg) ships with Next. A server motif registry mirrors
  the fifteen phase 00 category motifs as standalone SVG; each is rasterised by
  resvg. A `renderable` flag per category lets any motif that proves
  unrasterisable fall back to the flat kind ground colour with the title.
- **Font: one face covering all three scripts.** Noto Sans SC includes Latin and
  Latin-1 Supplement (French accents) alongside Simplified Chinese, so a single
  font satisfies req 14. It is fetched once at runtime from `fonts.gstatic.com`
  and cached in module scope; a fetch failure still renders the card (Latin is
  covered by the built-in fallback). This is a static asset fetch, not a content
  CDN, so it does not conflict with the "no CDN / image proxy" non-goal.
- **Unpublished content**: the card renders the generic card for the kind with
  no title.
- **Stored image wins**: when a content row's `imageUrl` is a real
  platform-served image, the card returns that image instead of the generated
  composition.

## Acceptance

- [x] An item with no candidate keeps `imageUrl` null and renders the generated card.
      Nothing in this run writes `imageUrl` for a crawled row; phase 03/05 never
      set it, and no fetch pipeline is added, so a crawled course/event/podcast/
      channel keeps `imageUrl` null and `ContentThumbnail` (phase 00) renders
      the generated card. Confirmed unchanged in the front build and by the
      unaltered `content-thumbnail.tsx`.
- [x] `next.config.ts` after this phase has no third-party content host in `remotePatterns`.
      `coursera-course-photos.s3.amazonaws.com` and
      `d3njjcbhbojbot.cloudfront.net` removed. What remains — pravatar, unsplash,
      picsum, `avatars.githubusercontent.com`, `cdn.jsdelivr.net`,
      `lh3.googleusercontent.com`, `example.com` — is avatar/OAuth/test imagery,
      not crawled catalog artwork. No code referenced the removed hosts (grep).
- [x] The `"content"` object-storage namespace exists in the port and the local adapter, and a key that escapes its root is rejected by `resolve`.
      Added to `ObjectStorageNamespace` and `local-object-storage.adapter.ts`
      (`CONTENT_IMAGE_DIR` → `uploads/content`). `local-object-storage.adapter.spec.ts`
      asserts a plain key resolves inside the root, a `../`-climbing key throws
      "Invalid object storage key.", and an absolute-looking key is folded to a
      sub-path rather than escaping.
- [x] A published course, event, podcast and channel each expose a social card route from their metadata that renders the title.
      `generateMetadata` on all four `[slug]/page.tsx` sets `openGraph.images`
      and `twitter` (`summary_large_image`) to `/api/social-card/<kind>/<slug>`,
      resolved against the new `metadataBase` in the root layout. Browser: the
      route returned `200 image/png` 1200x630 for a published course with the
      title rendered.
- [x] A social card for a title in English, one in French and one in Chinese each renders every glyph — no blank boxes, no overflow.
      Browser: three published courses titled in EN, FR (accented — "Ingénierie",
      "données", "qualité") and ZH ("现代数据平台工程：架构、质量与治理实践") each
      rendered every glyph cleanly, wrapping within the card. The route fetches a
      `&text=`-subset of Noto Sans SC per request, so any script is covered with
      a few kilobytes and no vendored font.
- [x] A category whose motif the renderer cannot rasterise falls back to the flat kind colour with the title, not a failure or a blank.
      `UNRENDERABLE_MOTIFS` is empty (resvg draws all fifteen phase-00 motifs).
      Browser: with `DESIGN` temporarily added to the set, the card rendered the
      flat blue ground with the eyebrow and full title and no motif, then the
      set was restored. A unit test covers `resolveSocialCardMotif`.
- [x] A social card for unpublished content does not disclose the title.
      Browser: a `DRAFT` course's card rendered "Course" (the kind label) with no
      motif and no title. The route gates on `published` from the GraphQL
      `status`; the route test asserts `published: false` reaches the renderer.
- [x] A content row with a real stored image gets that image as its card.
      Browser: a published course with `imageUrl` set returned
      `307 -> https://images.unsplash.com/photo-redir`. The route test covers the
      redirect branch.
- [x] No image fetch occurs on an ingestion request or inside a transaction.
      Trivially satisfied: this run adds no image fetch anywhere. The only new
      outbound request is the per-request Noto Sans SC subset fetch inside the
      social card route, which is not on any ingestion path.

## Verification

- `npx turbo run lint check-types --filter=front --filter=api` — pass (front
  re-run `--force` after the two `render.tsx` Satori fixes, since the
  `social-card/` directory is untracked and Turbo's input hash missed it)
- `npx jest` (api) — pass (102 suites / 1115 tests, incl. the new
  `local-object-storage.adapter.spec.ts`)
- `npx jest --config ./test/jest-e2e.json` (api) — pass (20 suites / 136 tests;
  no e2e path touched by this phase)
- `npx turbo run build --filter=front --filter=api` — pass; front re-run
  `--force`; the new `ƒ /api/social-card/[kind]/[slug]` route builds; api build
  clean after a one-off Windows `dist` lock cleared
- `npm run bundle-report --workspace front` — pass. `grep` of `.next/static`
  finds no social-card code in any client chunk: the route, `render.tsx`
  (`next/og`), `content.ts` and `metadata.ts` are all server-only, so first-load
  client JS for every route is unchanged.
- `npx vitest run` (front) — pass (65 tests; the new
  `social-card.test.ts` and `route.test.ts` add 12)
- Browser — social card fetched directly at 1200x630 for EN / FR / ZH titles
  (every glyph), a forced unrenderable-motif category (flat fallback),
  unpublished content (no title), a stored-image row (307 redirect), an unknown
  kind (404) and a missing slug (generic card). Detail-page heroes are phase 00
  `ContentThumbnail`, unchanged here; the app is light-theme only, so "both
  themes" is one theme.

## Notes

- The four seeded `p6-card-*` courses used for the browser check live only in
  the local dev database (never committed, not in the CI/test DB). The dev
  Postgres container stopped mid-cleanup; the rows are harmless local noise.

## Submission

- Commit:
- PR:
- CI:
