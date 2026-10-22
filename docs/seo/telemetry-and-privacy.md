# Search telemetry: what is collected, and the privacy decision it waits for

This page is the inventory behind the SEO-12 telemetry. Collection is **off by
default** in both applications and stays off until an operator records the
decision in `docs/seo/operator-manifest.md`. That manifest also holds the
owners, the Search Console state and the review calendar, with every item that
has not happened yet marked pending.

## Switches

| Setting | Application | When read | Default |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_TELEMETRY_ENABLED` | frontend | build time | `false` |
| `NEXT_PUBLIC_TELEMETRY_VITALS_SAMPLE_RATE` | frontend | build time | `1` |
| `TELEMETRY_ENABLED` | API | runtime | `false` |
| `TELEMETRY_VITALS_SAMPLE_RATE` | API | runtime | `1` |

Both enable flags must be `true` for anything to be measured. The frontend flag
is baked into the bundle, so changing it needs a rebuild; the API flag can be
flipped on a running deployment and is the quick way to stop all intake. The
registration count is also behind the API flag.

## What the browser may send

One GraphQL mutation, `recordTelemetry`, with at most 12 Web Vitals and 8
conversion events per request. Every field is an enum, a bounded number or a
random event id. There is no free-text field, no URL, and no query string.

| Field | Values |
| --- | --- |
| metric | `LCP`, `INP`, `CLS` |
| value | finite number inside a per-metric range (LCP and INP up to 60000 ms, CLS up to 10) |
| rating | `GOOD`, `NEEDS_IMPROVEMENT`, `POOR`; the API recomputes it from the value and drops a mismatch |
| navigation type | `NAVIGATE`, `RELOAD`, `BACK_FORWARD`, `RESTORE`, `PRERENDER` |
| route template | one of 16 fixed names such as `COURSE_DETAIL`; never a path or slug |
| device | `MOBILE` (viewport up to 767px) or `DESKTOP` |
| locale | `EN` or `FR` |
| conversion event | `CATALOG_DETAIL_OPEN`, `EXTERNAL_CONTENT_ACTION`, `REGISTRATION_START` |
| content kind / role | course, event, podcast, YouTube channel; professional or provider |
| attribution | `DIRECT`, `ORGANIC_SEARCH`, `SOCIAL`, `REFERRAL`, `INTERNAL` |
| event id | 12 to 64 characters from `A-Z a-z 0-9 _ -`, generated in memory per event |

The browser never sends the referrer, its host, the page URL, a search term, a
token, an email address or any account identifier. The request is made with
`credentials: "omit"`, so no cookie or authorization header travels with it.
The landing attribution is classified in the browser and only its category is
kept, in `sessionStorage` for the tab session.

`REGISTRATION_COMPLETED` cannot be sent by a browser; the API rejects it. It is
written by the API from an outbox event appended in the same transaction that
creates the account, carries only the role, and counts each account once.

## What is stored

Daily counters only. No row describes one visit.

| Table | Holds | Retention |
| --- | --- | --- |
| `TelemetryVitalBucket` | count per day, metric, device, route template, locale and value bucket | 395 days |
| `TelemetryConversionDaily` | count per day, event, content kind, role, attribution and locale | 395 days |
| `TelemetryIntakeDaily` | accepted, duplicate, invalid, rate limited, sampled out and failed counts | 395 days |
| `TelemetryDedupKey` | a 32 character hash of the event id and kind, to refuse a retry | 24 hours |

The specification allows raw events for up to 30 days; none are kept. Value
buckets line up with the Core Web Vitals thresholds, so the rating is exact and
the 75th percentile is an estimate accurate to its bucket width. A retention
sweep runs hourly in each API instance, deletes in batches of 5000, and logs
how many rows it removed.

## Limits

- 12 vitals and 8 conversions per request; unknown fields are rejected.
- 300 requests per client address per 5 minutes and 3000 requests per minute
  across everyone, both counted in PostgreSQL so every API instance shares them.
- An event id seen in the last 24 hours is counted once, including when the same
  batch arrives from several requests at the same instant.
- A failed write returns a "dropped" answer, never an error, and the batch can
  be retried because its dedup claim rolled back with it. The browser retries a
  failed batch once after 5 seconds and then drops it.
- The sink cannot hold the shared database pool. Each API instance writes at
  most 2 batches at a time, queues up to 100 more for at most 1.5 seconds, and
  drops the rest as a storage failure. A write that waits on a lock gives up
  after 1 second and one that runs longer is cancelled after 2 seconds, so a
  blocked or slow table costs bounded, dropped telemetry and nothing else. The
  registration count is written from the business outbox in its own lane and
  retries normally. The dropped batches are counted, never kept.

## What an operator sees

Admin, Search health shows a Collection status block above the tables. Each
state is a separate notice, so they can appear together:

| State | Meaning | Not to be read as |
| --- | --- | --- |
| The API is not collecting | The API flag is off. Older aggregates in the window are still listed. | Zero traffic |
| Page speed is sampled | Only part of the page loads are kept. Conversions are not sampled. | Real traffic volume |
| Collection is on but nothing was stored in this window | Missing data: the build sends nothing, no visitor was measured yet, or every batch failed. | Zero traffic |
| Some days in this window have no page speed data | Collection started or stopped inside the window. | A complete window |
| No segment has enough page loads to be rated | Every segment is under 100 page loads. | A passing result |
| Some events could not be stored | Storage failed or was saturated and batches were dropped. | A complete count |
| Some batches were rate limited | The intake limits turned batches away. | A complete count |
| Aggregates are available for this window | At least one aggregate row exists. | That coverage is complete |

The block also shows the window in UTC days, whether this website build sends
events (the frontend flag is baked into the build, so the page that reports it
is the same build that visitors receive), the sampling rate and the retention.
If the API flag and the build flag disagree, a separate notice says which side
is silent. The page never shows environment values, raw events or sessions, and
there is no public reporting endpoint.

Visitors who send Global Privacy Control or Do Not Track are never measured and
the browser cannot tell the API that it chose not to send, so a privacy
opt-out cannot be counted. The page states that its figures are a lower bound
of real traffic for that reason.

## Consent inventory

Findings from reading the repository, recorded before enabling anything:

1. The frontend has no consent component, no cookie banner and no stored
   consent state.
2. The privacy policy copy (`privacyPage.sections[8]`) says users can control
   cookies "via our cookie banner". No such banner exists in the code. Someone
   needs to reconcile the text with reality before relying on it. It is
   recorded as an open policy item in `docs/seo/operator-manifest.md` and is not
   edited until the privacy decision is made.
3. The Cookie Statement lists analytics cookies as a category and tells users to
   manage cookies in their browser.
4. Today the product sets only session cookies for sign-in and keeps the chosen
   language in `localStorage`.

Classification used by this feature (an engineering classification, not legal
advice):

| Event | Needed to run the service | Optional measurement | Condition before enabling |
| --- | --- | --- | --- |
| Web Vitals | no | yes | operator decision below |
| Content page opened | no | yes | operator decision below |
| External content link clicked | no | yes | operator decision below |
| Registration started | no | yes | operator decision below |
| Registration completed (API count) | no | yes | operator decision below; no visitor is tracked |

Optional means the feature stays disabled until the decision is made. The code
adds no consent flow of its own. It does honour two browser signals even after
the decision: a visitor who sends Global Privacy Control or Do Not Track is
never measured, and nothing is queued for them.

**Operator decision, not made in code:** whether first-party, cookieless,
aggregate counts need prior consent under the policy the business has adopted,
and who approved it. Record the answer, the approver and the date in the release
checklist before setting either flag to `true`.

## Not measured

Dashboards, sign-in and onboarding routes are never measured: the reporter is
mounted only in the public layout, and the route classifier returns nothing for
any private path. A signed-in provider or administrator opening a public page
does not count as acquisition.

## Verified in an isolated environment

On 2026-10-21 the lifecycle was exercised against a real API and a scratch
PostgreSQL database, with a frontend built with collection on. No production
system and no real account was involved, and the registration request was
answered by a stand-in so no email was sent.

- A signed-out English desktop view and a French mobile view each sent only
  allowlisted fields, with the right template, locale and device. A sentinel
  cookie set for the host did not travel with the telemetry request, while the
  same page's ordinary API calls did carry it.
- A content page opened from a search referrer recorded one open and kept the
  `ORGANIC_SEARCH` category without storing the referrer. An external link
  clicked just before leaving the page was still delivered when the page was
  hidden.
- The registration form recorded a start only after its request succeeded, with
  the role and nothing else. No browser batch ever contained a completed
  registration, and the API rejects one if forged. A completed registration was
  recorded once for both the email and the OAuth path, from the outbox event.
- Global Privacy Control and Do Not Track visitors triggered no telemetry
  request. Offline, nothing was sent and the page raised no error; after
  reconnecting, only the new action was delivered.
- A refused first attempt was retried once with the same event ids and counted
  once; replaying the delivered body was recognised as already counted.
- A signed-in administrator opening a content page was not counted as
  acquisition.
- With a table locked, 30 simultaneous batches were dropped within the bound,
  business reads on the same database stayed fast, and the next batch after the
  lock cleared was counted.

The admin Search health block was checked with data present, with the API flag
off while the build was on, and with the report request failing then retried,
on desktop and at 390 px, in English and French.

## Rolling back

Set `TELEMETRY_ENABLED=false` on the API; intake then writes nothing and
acknowledges every batch as dropped. Rebuild the frontend with
`NEXT_PUBLIC_TELEMETRY_ENABLED=false` to stop the browser sending at all. Pages
and registration do not depend on either. The migration is additive and its
tables can stay in place.
