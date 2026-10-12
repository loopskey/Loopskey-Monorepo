# Search telemetry: what is collected, and the privacy decision it waits for

This page is the inventory behind the SEO-12 telemetry. Collection is **off by
default** in both applications and stays off until an operator records the
decision in the release checklist.

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

## Consent inventory

Findings from reading the repository, recorded before enabling anything:

1. The frontend has no consent component, no cookie banner and no stored
   consent state.
2. The privacy policy copy (`privacyPage.sections[8]`) says users can control
   cookies "via our cookie banner". No such banner exists in the code. Someone
   needs to reconcile the text with reality before relying on it.
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

## Rolling back

Set `TELEMETRY_ENABLED=false` on the API; intake then writes nothing and
acknowledges every batch as dropped. Rebuild the frontend with
`NEXT_PUBLIC_TELEMETRY_ENABLED=false` to stop the browser sending at all. Pages
and registration do not depend on either. The migration is additive and its
tables can stay in place.
