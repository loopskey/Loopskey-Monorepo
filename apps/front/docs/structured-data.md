# Structured data and breadcrumbs

How public pages describe themselves to machines, and the rules that keep that
description true. Read this before adding a public page type, a catalogue field
or a link on a detail page.

## What is emitted

Every block is one `<script type="application/ld+json">` holding a single
`@graph`, rendered on the server by `components/elements/json-ld.tsx`. Nothing
is stored: the graph is a projection of the same public data the page renders.

| Page | Nodes |
| --- | --- |
| `/`, `/fr` | `Organization`, `WebSite`, `WebPage` |
| `/about`, `/fr/about` | `Organization`, `WebSite`, `AboutPage` |
| `/content` tab without filters, any locale | `CollectionPage`, `ItemList` of that page's items |
| course detail | `WebPage`, `BreadcrumbList`, `Course` |
| event detail | `WebPage`, `BreadcrumbList`, `Event` |
| podcast detail | `WebPage`, `BreadcrumbList`, `PodcastSeries`, one `PodcastEpisode` per listed episode |
| YouTube channel detail | `WebPage`, `BreadcrumbList`, `CreativeWorkSeries` |

Identifiers are absolute and stable: `<origin>/#organization`,
`<origin>/#website`, and `<canonical page URL>#webpage`, `#breadcrumb`,
`#course`, `#event`, `#podcast`, `#channel`, `#itemlist`. A detail page refers
to `<origin>/#website`, which the home and about pages define.

## When nothing is emitted

A page emits no markup, and no entity, when it renders no public content: a
missing, draft, withdrawn or untranslated variant (404), an upstream failure
(500), a filtered, searched or invalid catalogue request, and every private,
auth or dashboard route. An event without a valid start date keeps its page and
breadcrumb but drops the `Event` node and logs `structured-data.omitted` with
the kind, locale and reason only.

## Facts that are never inferred

- No ratings, reviews or `aggregateRating`. The projections carry legacy
  default values that were never displayed as reviews.
- No `Course.provider`: a course exposes an instructor name and no provider
  organization. The course carousel enhancement therefore needs a provider fact
  the API does not publish yet.
- No `VideoObject` anywhere. A channel page links out to YouTube and embeds
  nothing.
- No `sameAs` from a source URL, no phone number, no postal address and no
  social profile: the maintained public content has no real values for them.
- No event location address and no online `VirtualLocation` URL. The join link
  is not shown to visitors, so it is not published either.
- No `eventStatus`: the public projection has no cancelled or postponed state.
- No `dateModified`, `datePublished` or other date the page does not show.
- Offers appear only when the page shows a price: free (`isFree`) or a positive
  amount, with the currency the page displays.

## Visible text equals markup

`lib/structured-data/trail.ts` builds the breadcrumb once. The visible
`components/elements/breadcrumbs.tsx` and the `BreadcrumbList` both render that
one object, so labels, order, links and positions cannot drift. The trail is
Home, the catalogue tab and the detail page; a curated hub extends it only when
hubs are published. Item URLs come from `localizedUrl`, the function that also
builds the canonical and the sitemap entry.

Event times are written with the event's own UTC offset
(`2031-07-01T10:30:00+02:00`), computed from the stored instant and the event
time zone, which is what the page shows.

## Escaping

`serializeJsonLd` escapes `<`, `>`, `&`, U+2028 and U+2029 as `\uXXXX` after
`JSON.stringify`, so no text can close the script element or start a comment.
`facts.ts` strips control characters, collapses whitespace, caps long text and
accepts only `http:` and `https:` URLs for images and media.

## Validation evidence

The emitted graphs were checked against the current schema.org vocabulary
(`schemaorg-current-https.jsonld`): every type exists, every property is defined
for its type or an ancestor, and every nested type is inside the property range.
All pages in the table above report zero vocabulary problems. The only references
outside a page are the site-level `#website` identifier.

Google's Rich Results Test is a hosted tool and was not run from this
environment. Valid schema.org is not a promise of a rich result. Expected
Google-side notes:

- `Event` without an address: location is optional in the markup, and the Event
  enhancement may not be offered until the API publishes a venue address.
- `Course` without `provider`: not eligible for the course carousel.
- `PodcastSeries`, `CollectionPage`, `AboutPage` and `Organization` have no
  dedicated enhancement; they are semantics only.
- `BreadcrumbList` follows the current breadcrumb guideline.

Run the Rich Results Test and the schema.org validator against the deployed
templates after release and record the outcome with the release notes.

## Rollback

Remove the `<JsonLd>` element from a page and the markup disappears without
touching the content. The breadcrumb row is independent of it.
