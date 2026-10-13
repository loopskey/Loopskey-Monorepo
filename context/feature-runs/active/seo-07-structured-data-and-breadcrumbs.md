# seo-07-structured-data-and-breadcrumbs

- Scope: `front`
- Model: `Standard development — a bounded server-rendered presentation layer over the existing public projections; no API field, contract or data ownership change.`
- Branch: `feature/seo-07-structured-data-and-breadcrumbs`
- Base: `28222d4ce963541c991796b0d35516f2f37c33b0`
- Status: `Submitted`

## Acceptance

- [x] JSON-LD parses safely in raw HTML for eligible pages and hostile text cannot escape its script element.
      A course titled `Evil </script><script>alert(1)</script> & <b>x</b>` with a
      U+2028 and an `<img onerror>` in its description, and an episode named
      `Episode </script> one`: the raw block parses as JSON, contains no `<`,
      `>`, `&`, U+2028 or U+2029, nothing executes and no injected element
      reaches the DOM. The visible breadcrumb shows the same title as text.
- [x] Breadcrumb links are navigable and match schema positions/URLs exactly.
      One trail object feeds both the visible `nav` and the `BreadcrumbList`.
      English: `/`, `/content`, `/content?tab=events`, `/content?tab=podcasts`,
      `/content?tab=youtube`; French: `/fr`, `/fr/content`. Keyboard Tab and Enter
      from the Courses crumb reach `/content`.
- [x] Entity names, dates, prices, locale and canonical match visible content.
      A paid in-person event stored as 08:30 UTC in `Europe/Paris` emits
      `2031-07-01T10:30:00+02:00`, `49.50 EUR` and the displayed location and
      organizer. Entity URL, WebPage `@id`, breadcrumb last item and the
      `<link rel="canonical">` are one URL, and the sitemap uses the same one.
- [x] Missing facts suppress inappropriate types; no invented ratings/reviews.
      No rating, review, provider, video, address, join link, status or
      undisplayed date is emitted; a free-or-priced offer appears only when the
      page shows a price; an unsafe audio URL (`javascript:`) is dropped.
- [x] Draft, error, missing-translation and private pages emit no public entity.
      `/fr/courses/<draft>` and unknown slugs are 404 with no block, a stopped
      API gives 500 with no block on detail, event and catalogue pages, and a
      filtered or searched catalogue request has none. Private routes are
      untouched.
- [x] Representative supported types pass validation with warnings documented.
      Zero vocabulary problems against the current schema.org vocabulary on
      home and about in both locales, the four English catalogue tabs, and all
      four detail kinds (French where a variant exists: the course). Google-side warnings are in `apps/front/docs/structured-data.md`;
      Google's Rich Results Test is a hosted tool and was not run here.
- [x] Responsive/keyboard breadcrumb behavior and frontend gates pass.
      360 px and 1280 px: no horizontal overflow, a long title wraps, a
      visible focus ring on links, `aria-current="page"` on the last crumb and no
      page errors.

## Verification

- `npm run lint` (root) — pass
- `npm run check-types` (root) — pass
- `npm run build` (root) — pass
- `npm run bundle-report --workspace front` — pass; static public routes are
  unchanged (`/en/about` 1513.6 KB, `/en/faq` 1549 KB) and no JSON-LD or
  structured-data module appears in a client chunk
- No frontend test was added; no API field, GraphQL document or codegen output
  changed
- Production build served against the real API and a seeded PostgreSQL
  database, inspected by raw HTML and in Edge: home, about, catalogue tabs,
  detail pages in both locales, hostile text, paid in-person event, online
  event, podcast with episodes, missing and draft variants, API outage
- Vocabulary check: a script walks each emitted graph against
  `schemaorg-current-https.jsonld` (types, property domains, property ranges,
  untyped objects). It found one defect during development, `episode` on a
  `PodcastSeries`, now `hasPart`; the final run reports zero problems

## Behaviour notes

- The identity nodes live on the home and about pages; detail pages refer to
  `<origin>/#website`.
- `ItemList` positions are one-based within the page, and each item is the URL
  the card links to, so a French list points to the French page only when that
  variant is published.
- A missing event start date logs `structured-data.omitted` with kind, locale
  and reason, and omits only the `Event` node.

## Submission

- Commit: `6247490`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/288
- CI: pending
