# Public discovery and publication lifecycle

How search engines find public content, and what guarantees the sitemap makes
about freshness. Read this before adding a cache in front of any public surface.

## Surfaces

| Surface | Route | Contents |
| --- | --- | --- |
| Sitemap index | `/sitemap.xml` | One entry per shard, plus the static shard |
| Static shard | `/sitemaps/static.xml` | `CANONICAL_STATIC_PAGE_PATHS` |
| Content shard | `/sitemaps/<kind>-<n>.xml` | Up to one shard of eligible detail URLs |
| Robots | `/robots.txt` | Allow-all plus the canonical sitemap URL |

`<kind>` is `courses`, `events`, `podcasts` or `youtube`; `<n>` is 1-based.
Every surface returns 404 unless `DEPLOYMENT_ENV=production`, so staging and
preview deployments are excluded from discovery and their `robots.txt` keeps
disallowing everything.

## Eligibility

A detail URL is in the sitemap when its row is `PUBLISHED` and not soft-deleted.
Draft, archived, cancelled and deleted rows are absent, which is the same
boundary the public detail readers enforce. Search, filter and cursor pages,
private areas, the developer showcase and the social-card routes are never
listed.

## Sharding

The API returns the shard layout from `publicUrlShards`: for each kind, the
shard size and, per shard, its URL count, its newest public change, and the
keyset cursors that bound it. A shard is the half-open range
`[startCursor, endCursor)` over `(createdAt, id)` ascending, so:

- a shard never exceeds `PUBLIC_URL_SHARD_SIZE` URLs at the moment the layout is
  read (default 10,000, hard maximum 50,000 by the sitemap protocol);
- a row's shard changes only when an **earlier-created** eligible row is
  published or withdrawn, because the ordering is append-only;
- a row inserted or withdrawn while a crawl is in progress is still seen at most
  once: the windows are anchor-to-anchor, not anchor-plus-count, so a row never
  slips between two shards or appears in both;
- a shard URL whose shard no longer exists returns 404. The crawler re-reads
  `/sitemap.xml`, which is always the entry point.

The frontend walks each shard in `publicUrlPage` calls of at most 2,500 URLs and
stops at 50,000 URLs per shard, so one response is bounded regardless of how far
the catalogue has grown since the layout was read.

## lastmod

`lastmod` is `publicContentUpdatedAt`, a column owned by each catalogue domain.
It moves when a visitor-visible change is committed and not otherwise:

| Moves it | Does not move it |
| --- | --- |
| Create, update, publish, archive, cancel | Event view counting (`recordEventView`) |
| Soft delete and restore | Rating recomputation |
| Episode or video added, edited, removed | Attendee reconciliation |
| Ingestion writing changed crawled content | Ingestion seeing an unchanged hash |

The write happens in the same statement — and so the same transaction — as the
change that caused it. `updatedAt` was unusable for this: the view counter, the
rating writer and the attendee reconciler all move it, so publishing it as
`lastmod` would claim freshness no visitor could observe.

The sitemap index reports each shard's own newest public change, so a crawler
re-reads only the shards that actually changed.

## Cache layers

| Layer | Key | TTL | How it clears |
| --- | --- | --- | --- |
| Browser / CDN, sitemap index and shards | Absolute URL | 300 s (`max-age` and `s-maxage`) | Expiry only; there is no purge hook |
| Next route cache | — | none | Routes are `force-dynamic`; the upstream fetch is `no-store` |
| Request-scoped shard layout | React `cache()` per request | one request | Ends with the request |
| Detail pages, metadata, social cards | — | none | `force-dynamic` and `no-store` on every response |
| Static assets | Path | 1 day, 1 week stale-while-revalidate | Content-hashed or immutable files only |

Public index staleness is therefore at most **300 seconds** after a committed
change: one cache layer with a 300-second lifetime and nothing behind it. Adding
a second layer with its own TTL would add its TTL to that bound; anything placed
in front of these routes must keep the total at or under 300 seconds.

Detail pages, their metadata and their social cards hold **no persistent shared
cache** on purpose. A withdrawn row stops being disclosed on the next fresh
origin request, on every instance, with no invalidation to propagate. A
persistent HTML or card cache may not be introduced on a TTL alone: it needs a
documented revocation path across API writes, Next instances and the CDN,
including out-of-order and duplicate events, before it is safe.

## Failure behaviour

- The API failing, timing out or answering outside its contract produces
  `503` with `Retry-After: 60` and `Cache-Control: no-store`. An outage is never
  recorded as an empty but successful sitemap, and a valid cached index is never
  replaced by one.
- A single kind failing fails the whole index. A partial index that silently
  drops a kind would look like a mass withdrawal to a crawler.
- Following a stale sitemap link is safe: the detail route re-checks publication
  on every request and answers 404 for anything hidden.
- Third-party copies already taken by crawlers and social platforms are outside
  this promise. Nothing here removes them.

## Operations

Every response logs one structured line: `sitemap.index`, `sitemap.shard`,
`sitemap.shard-missing`, `sitemap.shard-empty`, `sitemap.shard-truncated`,
`sitemap.shard-set-truncated`, `sitemap.index-unavailable` or
`sitemap.shard-unavailable`, with the kind, shard index, URL count and latency.
The API logs `Public URL enumeration` with the kind, counts and duration, and
warns past `PUBLIC_URL_SLOW_QUERY_MS`.

| Variable | Where | Default | Effect |
| --- | --- | --- | --- |
| `PUBLIC_URL_SHARD_SIZE` | API | `10000` | URLs per shard; 1 to 50,000. A bad value stops the enumeration, loudly |
| `PUBLIC_URL_SLOW_QUERY_MS` | API | `500` | Enumeration slow-query warning threshold |

Only the shard name, kind, URL count and latency are logged; a slug is already
public and an unpublished row never reaches these paths. The correlation id for
an upstream failure is on the `public-content.upstream-failure` line the server
GraphQL client writes for the same request.

Rollout order: the additive migration and the API first, then the frontend.
Until the API serves `publicUrlShards` the sitemap answers 503, which is the
safe direction; the reverse order would publish a sitemap of a schema that does
not exist yet. Verify every API replica answers the new query before the
frontend rolls out, because the index fails as a whole if one replica does not.

Recovery:

1. A 503 means the API or its database is the problem, not the sitemap. Fix the
   upstream; no cache purge is needed because the bound is 300 seconds.
2. `sitemap.shard-truncated` or `shard-set-truncated` means a kind outgrew
   either the 50,000-URL shard ceiling or the 1,000-shard ceiling. Lower
   `PUBLIC_URL_SHARD_SIZE` and the shard count rises to match.
3. Withdrawn content still appearing in a search result is a third-party cache.
   Confirm the origin by requesting the URL directly: it must answer 404.

## Maintaining the static list

`CANONICAL_STATIC_PAGE_PATHS` in `src/lib/sitemap/static-pages.ts` is written by
hand, because a public static page is a deliberate choice rather than every file
under `app/`. Add a path when a new indexable static page ships, and leave
noindex routes, redirect sources and parameterised pages out. The static shard
carries no `lastmod`: a deploy date is not a content change, and an invented one
would be the false freshness this feature exists to avoid.
