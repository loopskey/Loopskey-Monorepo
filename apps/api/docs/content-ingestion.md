# Loopskey content ingestion — integration guide

This document is everything a crawler team needs to send crawled learning
content to Loopskey. If something here cannot be reconciled with the API's
behaviour, the API is wrong — tell us (see [Support](#17-support)); do not work
around it.

Audience: an engineer integrating a crawler. The
[operational runbook](#operational-runbook) at the end is for a Loopskey
administrator and is not needed to integrate.

---

## 1. What this API is for

The ingestion API accepts learning content that your crawler has fetched from a
third-party site — a course, an event, a podcast, or a YouTube channel — and
places it into the Loopskey catalogue as a draft for editorial review. It is the
**only** supported way to put crawled content into the platform. There is no
bulk import, no spreadsheet upload, and no database access.

You submit **batches** of **items**. Each item is one entity you crawled,
identified by an id that is stable for the life of that entity on the source
site. The platform normalises each item to a fixed canonical shape, stores it,
and queues it for an editor. Accepted content is **not** publicly visible until
an editor approves it.

The endpoint is REST, not GraphQL — it is the one crawler-facing exception to
Loopskey's GraphQL edge, because a crawler is a machine-to-machine batch client.

---

## 2. Getting a credential

1. **You are onboarded by a Loopskey administrator.** Tell us which kinds you
   will send (course / event / podcast / YouTube) and the site(s) you crawl. We
   create one **source** per kind for you — a source is one stream of one kind
   from one team.
2. **Develop against the sandbox first.** A permanent sandbox source exists for
   every kind, with automatic publication turned **off**, so nothing you send
   while integrating can ever reach the live catalogue. Ask us for a sandbox key
   and build the whole integration against it before a production source is
   created.
3. **The secret is shown exactly once.** When we issue a key, the response
   contains the full credential string. We cannot retrieve it later — only its
   public prefix is stored in a readable form. If you lose it, we revoke it and
   issue a new one.
4. **Credential format.** The credential is

   ```
   lk_ing_<prefix>_<secret>
   ```

   `<prefix>` is 12 hex characters and is safe to log or quote in a support
   request. `<secret>` is an opaque URL-safe string; treat it like a password.
   Store the whole string in a secret manager.

---

## 3. Authenticating

Send the credential as a bearer token on every request:

```
Authorization: Bearer lk_ing_<prefix>_<secret>
```

- The source is derived from the credential. **Do not** send a `sourceId` in the
  body, the query string, or an `X-Ingestion-Source-Id` header — a request that
  does is rejected with `INGESTION_SOURCE_NOT_CALLER_SUPPLIED`.
- **Every authentication failure returns the same response by design**:
  HTTP `401` with code `INGESTION_UNAUTHORIZED` and the body
  `{"code":"INGESTION_UNAUTHORIZED","message":"Invalid ingestion credential."}`.
  A missing header, a malformed credential, an unknown prefix, a wrong secret, a
  revoked key, and an expired key are indistinguishable. This is deliberate: it
  denies an attacker any signal about which part was wrong.
- Two conditions are reported distinctly because they are not authentication
  failures and you must react to them differently:
  - the credential is valid but its **source is deactivated** → `403`
    `INGESTION_SOURCE_INACTIVE`;
  - the credential is valid but you are **over your rate allowance** → `429`
    `INGESTION_RATE_LIMITED` with a `Retry-After` header.

---

## 4. Identity — `externalId` and `canonicalUrl`

Every item **must** carry:

| Field | Rule |
| --- | --- |
| `externalId` | A string, 1–500 characters, that your crawler assigns to this entity and **never changes for the life of that entity**. It is scoped to your source, so it only has to be unique within your own stream. |
| `canonicalUrl` | The absolute `https://` URL of the entity on the source site. Used for de-duplication hints and shown to editors. Required, up to 2048 characters. |

**`externalId` stability is the single most important rule in this document.**

The platform keys the stored catalogue row on `(<your source>, externalId)`.
When you re-send an item with an `externalId` it has seen before, the platform
updates the existing row. When the `externalId` is new, it creates a new row.

If your crawler changes the `externalId` for an entity it already sent — for
example, it switches from the site's numeric id to a slug, or it starts
prefixing a locale — the platform cannot tell that the new item is the same
entity. It creates a **second catalogue row** for that entity. Both rows now
exist, both may be reviewed and published, and **there is no automatic merge**.
An editor has to notice the duplicate and archive one by hand, which also
discards any edits made to the losing row.

Pick an id that the source site guarantees is permanent (its primary key,
usually), write it down in your integration notes, and never derive it from
anything a marketing team can rename.

---

## 5. Submitting a batch

### Route

| Kind | Submit a batch |
| --- | --- |
| Course | `POST /v1/ingest/course/batches` |
| Event | `POST /v1/ingest/event/batches` |
| Podcast | `POST /v1/ingest/podcast/batches` |
| YouTube channel | `POST /v1/ingest/youtube/batches` |

The `kind` in the route, the `kind` in the envelope, and the kind of the source
behind your credential must all agree, or the batch is rejected with
`INGESTION_KIND_MISMATCH`. A course key cannot post to `/v1/ingest/event/batches`.

### Headers

| Header | Required | Notes |
| --- | --- | --- |
| `Authorization` | yes | `Bearer lk_ing_…` |
| `Content-Type` | yes | `application/json` |
| `Idempotency-Key` | yes | A string you choose, ≤ 200 characters, unique per distinct batch. Missing or blank → `INGESTION_IDEMPOTENCY_KEY_REQUIRED`. See [§6](#6-reading-the-result) and [§13](#13-errors-and-retries). |
| `Content-Encoding: gzip` | optional | The body may be gzip-compressed; the server inflates it transparently. |
| `Content-Length` | sent by your client | If present it is checked against the compressed-body cap before the body is read. |

### Envelope

```json
{
  "contractVersion": "1.0",
  "kind": "COURSE",
  "mode": "INCREMENTAL",
  "dryRun": false,
  "items": [ { "externalId": "…", "canonicalUrl": "https://…", "...": "..." } ]
}
```

| Field | Type | Rule |
| --- | --- | --- |
| `contractVersion` | string | Must be exactly `"1.0"`. Any other value → `INGESTION_CONTRACT_VERSION_UNSUPPORTED`. |
| `kind` | string | One of `COURSE`, `EVENT`, `PODCAST`, `YOUTUBE`; must match the route and the credential. |
| `mode` | string | `INCREMENTAL` (you are sending items that changed) or `FULL` (this batch is part of a complete re-crawl). Any other value → `INGESTION_ENVELOPE_INVALID`. `mode` is recorded on the batch; it does not by itself delete anything. |
| `dryRun` | boolean | Optional, defaults `false`. See [§7](#7-validating-first). |
| `items` | array | 1–100 entries. More than 100 → `INGESTION_BATCH_TOO_LARGE`. Not an array → `INGESTION_ENVELOPE_INVALID`. |

### Caps

| Cap | Value | Exceeded → |
| --- | --- | --- |
| Items per batch | **100** | `413 INGESTION_BATCH_TOO_LARGE` |
| Compressed request body | **1048576 bytes** (1 MiB), measured from `Content-Length` | `413 INGESTION_BODY_TOO_LARGE` |
| `Idempotency-Key` length | **200** characters | `400 INGESTION_ENVELOPE_INVALID` |

If 100 items do not fit in 1 MiB compressed, send more batches with fewer items.
There is no penalty for small batches.

### Worked example (`curl`)

Only `$BASE_URL` and `$CRED` change between environments:

```bash
BASE_URL="https://api.example.loopskey.com/v1/ingest"
CRED="lk_ing_0123456789ab_EXAMPLE_SECRET_VALUE_NOT_REAL"

curl -sS -X POST "$BASE_URL/course/batches" \
  -H "Authorization: Bearer $CRED" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: example-2026-09-10-001" \
  -d '{
        "contractVersion": "1.0",
        "kind": "COURSE",
        "mode": "INCREMENTAL",
        "dryRun": true,
        "items": [
          {
            "externalId": "sample-course-1001",
            "canonicalUrl": "https://example.com/courses/intro-to-widgets",
            "title": "Introduction to Widgets",
            "description": "A short synthetic course.",
            "instructor": "Jordan Rivera",
            "category": "TECHNOLOGY",
            "level": "BEGINNER",
            "currency": "USD",
            "isFree": true,
            "requirements": ["A computer"],
            "learnings": ["What a widget is"]
          }
        ]
      }'
```

Flip `"dryRun"` to `false` and keep the `Idempotency-Key` stable across retries.

A complete runnable client that does dry-run → submit → read is at
[`apps/api/docs/examples/ingest-example.mjs`](examples/ingest-example.mjs). It
takes `LOOPSKEY_INGEST_BASE_URL` and `LOOPSKEY_INGEST_CREDENTIAL` from the
environment and hard-codes nothing else.

---

## 6. Reading the result

A successful submission returns `201` with a **receipt**:

```json
{
  "batchId": "clz…",
  "dryRun": false,
  "mode": "INCREMENTAL",
  "status": "COMPLETED",
  "receivedCount": 3,
  "acceptedCount": 2,
  "rejectedCount": 1,
  "createdCount": 1,
  "updatedCount": 1,
  "unchangedCount": 0,
  "items": [
    { "externalId": "c-1001", "state": "created",   "catalogId": "cat_…", "reason": null, "unmappedFields": [] },
    { "externalId": "c-1002", "state": "unchanged",  "catalogId": "cat_…", "reason": null, "unmappedFields": ["rating"] },
    { "externalId": "c-1003", "state": "rejected",   "catalogId": null,    "reason": "category: category must be a valid enum value", "unmappedFields": [] }
  ]
}
```

Per-item `state`:

| `state` | Meaning |
| --- | --- |
| `created` | A new catalogue row was created for this `externalId`. |
| `updated` | An existing row for this `externalId` was updated. |
| `unchanged` | The canonical shape is byte-identical to what is already stored; nothing was written and no event was emitted. |
| `rejected` | The item was not stored. `reason` says why. Other items in the batch are unaffected. |

`catalogId` is the platform's id for the catalogue row; it is stable across
resubmissions and is what you quote in a support request about a specific item.

### Fetching a batch later

| Kind | Read a batch |
| --- | --- |
| Course | `GET /v1/ingest/batches/<batchId>` |
| Event | `GET /v1/ingest/event/batches/<batchId>` |
| Podcast | `GET /v1/ingest/podcast/batches/<batchId>` |
| YouTube channel | `GET /v1/ingest/youtube/batches/<batchId>` |

> The course read path has no `course/` segment; the other three kinds do. This
> is an inconsistency in the shipped API, documented here rather than silently
> corrected.

The read is scoped to your source: a `batchId` that belongs to another source,
or does not exist, returns the same `404 INGESTION_BATCH_NOT_FOUND`. The
response body is the same receipt shape as the submission returned.

### Idempotent replay

`(source, Idempotency-Key)` is unique. Re-POST the same batch with the same key
and you get the **original** receipt back — no second batch, no duplicate
writes. Use a fresh key for a genuinely new batch, and reuse the key when
retrying one that failed in transit (see [§13](#13-errors-and-retries)).

---

## 7. Validating first

Set `"dryRun": true` in the envelope. This is the normal first step of any
integration, not only a debugging aid.

A dry run:

- runs the full mapping, coercion, and validation for every item;
- returns a receipt with the same shape, with `status: "DRY_RUN"` and every
  accepted item reported as `created` or `updated` as it *would* be;
- additionally includes, per item, an `unmappedValues` object showing the actual
  values that were dropped (a real run records only the field **names**);
- **writes nothing** — no batch row, no catalogue row, no event, and it does not
  consume an `Idempotency-Key`.

Run every item set through `dryRun` once, confirm the `state` and
`unmappedFields` are what you expect, then flip the flag.

---

## 8. The canonical shape, per kind

Notes that apply to every kind:

- **Field names and the field map.** Your source has a **field map** that renames
  your crawler's own field names onto the canonical names below and picks which
  fields cross — anything not named in the map is an unmapped field
  ([§10](#10-unmapped-fields)). The **sandbox sources ship with an identity map**,
  so the payloads in this guide (which already use the canonical names) work
  against the sandbox unchanged. For a production source, send us your field
  names once and we set the map; until it is set, every field is unmapped and
  every item is rejected.
- **Where the JSON Schema fits.** The published schema for each kind
  (`apps/api/docs/schemas/<kind>-ingestion-item.v1.schema.json`,
  `$id: https://api.loopskey.com/schemas/<kind>-ingestion-item.v1.schema.json`)
  is deliberately permissive: it accepts a string where a number or boolean is
  wanted, and does not require fields the platform can default. That is the
  **wire gate** — use it to catch a missing `externalId` or a malformed item
  before you send. The tables below are the **canonical contract**: the shape an
  item must satisfy *after* the platform coerces types, applies defaults, and
  normalises enums. If the schema accepts an item but this table does not, the
  item is rejected with a `reason`.

  Validate every item locally before the first request — for example with
  [`ajv`](https://ajv.js.org/):

  ```bash
  npx ajv-cli validate \
    -s course-ingestion-item.v1.schema.json \
    -d 'items/*.json' --spec=draft2020
  ```

  An item with no `externalId` fails here, offline, before you send anything.
- **Types.** `string` fields are trimmed and HTML-sanitised. Number-like fields
  accept a JSON number or a numeric string. Date-time fields are ISO 8601
  strings. Enum fields accept the exact enum value or a close synonym; an
  unrecognised value normalises to `OTHER` (or the kind's first enum member) and
  the raw text is kept in the matching `raw*` field.
- **Null and empty.** A scalar field that is optional may be omitted or sent as
  `null` — both mean "no value". An empty string is treated as `null`. For the
  **child arrays** (`scheduleItems`, `episodes`, `videos`) omitting the field
  and sending `[]` mean **different** things — see each kind.
- **`imageCandidateUrl`** is always a *candidate* — see [§11](#11-images).
- The `raw*`, `crawledAt`, `updatedAt`, `lastUpdatedAt`, `sourcePlatform`, and
  `language` fields are carried through for editors and provenance; none affect
  how the item is categorised.

### 8.1 Course — `POST /v1/ingest/course/batches`

| Field | Type | Required | Bounds / notes |
| --- | --- | --- | --- |
| `externalId` | string | **yes** | 1–500 chars, stable forever |
| `canonicalUrl` | string (uri) | **yes** | `https://…`, ≤ 2048 |
| `title` | string | **yes** | 1–500 |
| `description` | string | **yes** | 1–50000 |
| `instructor` | string | **yes** | 1–500 |
| `category` | enum | **yes** | `CPD, OTHER, DESIGN, FINANCE, BUSINESS, EDUCATION, MARKETING, TECHNOLOGY, LEADERSHIP, COMPLIANCE, HEALTHCARE, ENGINEERING` |
| `level` | enum | **yes** | `BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS` |
| `currency` | string | **yes** | ISO 4217, ≤ 3 chars; defaults to `USD` if absent |
| `isFree` | boolean | **yes** | if absent, derived from `price` |
| `requirements` | string[] | **yes** | ≤ 100 items, each ≤ 2000 chars; `[]` allowed |
| `learnings` | string[] | **yes** | ≤ 100 items, each ≤ 2000 chars; `[]` allowed |
| `price` | number ≥ 0 | no | max 2 decimals; ignored when `isFree` |
| `durationMinutes` | integer ≥ 0 | no | |
| `sourcePlatform` | string | no | ≤ 100 |
| `imageCandidateUrl` | string (uri) | no | ≤ 2048 |
| `language` | string | no | ≤ 8 (e.g. `en`, `en-GB`) |
| `contentType` | string | no | only `"COURSE"` accepted |
| `internalCategory` | string | no | ≤ 500 |
| `offersCertificate` | boolean | no | |
| `creditValue` | number ≥ 0 | no | |
| `creditSource` | string | no | ≤ 200 |
| `creditConfidence` | number 0–1 | no | |
| `rawCategory` / `rawLevel` / `rawDuration` | string | no | ≤ 500, provenance |
| `lastUpdatedAt` / `crawledAt` / `updatedAt` | date-time | no | |

Course has no child arrays.

### 8.2 Event — `POST /v1/ingest/event/batches`

| Field | Type | Required | Bounds / notes |
| --- | --- | --- | --- |
| `externalId` | string | **yes** | 1–500, stable forever |
| `canonicalUrl` | string (uri) | **yes** | ≤ 2048 |
| `title` | string | **yes** | 1–500 |
| `description` | string | **yes** | 1–50000 |
| `type` | enum | **yes** | `OTHER, COURSE, WEBINAR, SEMINAR, WORKSHOP, TRAINING, CONFERENCE, NETWORKING` |
| `deliveryMode` | enum | **yes** | `HYBRID, RECORDED, IN_PERSON, LIVE_ONLINE` |
| `category` | enum | **yes** | `CPD, OTHER, DESIGN, FINANCE, BUSINESS, EDUCATION, MARKETING, TECHNOLOGY, HEALTHCARE, LEADERSHIP, COMPLIANCE, ENGINEERING` |
| `startDate` | date-time | **yes** | ISO 8601 |
| `timezone` | string | **yes** | 1–64, IANA name (e.g. `Europe/London`); the crawl must state it — there is no default |
| `currency` | string | **yes** | ≤ 3; defaults `USD` |
| `isFree` | boolean | **yes** | derived from `price` if absent |
| `endDate` | date-time | no | if present it must not precede `startDate`, else the item is rejected with `INGESTION_EVENT_DATE_RANGE_INVALID` |
| `speaker` / `organizer` | string | no | ≤ 500 |
| `location` | string | no | ≤ 500 |
| `onlineUrl` | string (uri) | no | ≤ 2048 |
| `price` | number ≥ 0 | no | 2 decimals; ignored when `isFree` |
| `pdu` | number 0–1000 | no | |
| `topic` | string | no | ≤ 200 |
| `imageCandidateUrl` | string (uri) | no | ≤ 2048 |
| `sourcePlatform` / `language` | string | no | ≤ 100 / ≤ 8 |
| `rawType` / `rawDeliveryMode` / `rawCategory` | string | no | ≤ 500 |
| `lastUpdatedAt` / `crawledAt` / `updatedAt` | date-time | no | |
| `scheduleItems` | array or `null` | no | **child set — see below** |

`scheduleItems` entry: `dayNumber` (integer ≥ 1, **required**), `startTime` and
`endTime` (date-time, **required**, `endTime` ≥ `startTime`), `title` (1–500,
**required**), `description` (≤ 2000), `speaker` (≤ 500). Max 200 entries.

- **Omit** `scheduleItems` → the event's stored schedule is left untouched.
- Send `scheduleItems: []` (or `null`) → the stored schedule is **cleared**.
- Send a non-empty array → it **replaces** the schedule as a whole set.

Crawled events are **browse-only**: registration is always off for an ingested
event regardless of what you send.

### 8.3 Podcast — `POST /v1/ingest/podcast/batches`

| Field | Type | Required | Bounds / notes |
| --- | --- | --- | --- |
| `externalId` | string | **yes** | 1–500, stable forever |
| `canonicalUrl` | string (uri) | **yes** | ≤ 2048 |
| `title` | string | **yes** | 1–500 |
| `description` | string | **yes** | 1–50000 |
| `host` | string | **yes** | 1–500 |
| `category` | enum | **yes** | `AI, CPD, DATA, OTHER, CAREER, DESIGN, FINANCE, BUSINESS, EDUCATION, MARKETING, TECHNOLOGY, HEALTHCARE, LEADERSHIP, COMPLIANCE, ENGINEERING` |
| `durationMinutes` | integer ≥ 0 | no | typical episode length |
| `imageCandidateUrl` | string (uri) | no | ≤ 2048 |
| `sourcePlatform` / `language` | string | no | ≤ 100 / ≤ 8 |
| `rawCategory` | string | no | ≤ 500 |
| `lastUpdatedAt` / `crawledAt` / `updatedAt` | date-time | no | |
| `episodes` | array or `null` | no | **child set — see below** |

`episodes` entry: `episodeNumber` (integer ≥ 1, **required**), `title` (1–500,
**required**), `description` (≤ 50000), `audioUrl` (≤ 2048),
`durationMinutes` (≥ 0), `publishedAt` (date-time). Max 2000 entries.

- **Omit** `episodes` → stored episodes are left untouched.
- Send `episodes: []` (or `null`) → stored episodes are **cleared**.
- Send a non-empty array → it is the **authoritative set**, keyed on
  `episodeNumber`: numbers in the array are upserted, stored episodes whose
  number is **not** in the array are **deleted**.
- An episode object **without a number** is skipped. The podcast and its
  numbered episodes still land; `"episodes"` is added to that item's
  `unmappedFields` so you can see it happened. (`INGESTION_EPISODE_NUMBER_REQUIRED`
  is logged server-side.)
- The stored **episode count** is always recomputed from the rows that exist. It
  is never taken from the payload; see [§9](#9-what-the-platform-owns).

### 8.4 YouTube channel — `POST /v1/ingest/youtube/batches`

| Field | Type | Required | Bounds / notes |
| --- | --- | --- | --- |
| `externalId` | string | **yes** | 1–500, stable forever (the channel id) |
| `canonicalUrl` | string (uri) | **yes** | ≤ 2048 |
| `channelUrl` | string (uri) | **yes** | ≤ 2048 |
| `title` | string | **yes** | 1–500 |
| `category` | enum | **yes** | `AI, CPD, DATA, OTHER, DESIGN, CAREER, FINANCE, BUSINESS, EDUCATION, MARKETING, TECHNOLOGY, HEALTHCARE, LEADERSHIP, COMPLIANCE, ENGINEERING` |
| `description` | string | no | ≤ 50000 |
| `subscribers` | integer ≥ 0 | no | the channel's own public figure — accepted, not platform-owned |
| `views` | integer ≥ 0 | no | as above |
| `videoCount` | integer ≥ 0 | no | as above |
| `imageCandidateUrl` | string (uri) | no | ≤ 2048 |
| `sourcePlatform` / `language` | string | no | ≤ 100 / ≤ 8 |
| `rawCategory` | string | no | ≤ 500 |
| `lastUpdatedAt` / `crawledAt` / `updatedAt` | date-time | no | |
| `videos` | array or `null` | no | **child set — see below** |

`videos` entry: `externalId` (string 1–500, **required** — the video id within
the channel), `title` (1–500, **required**), `description` (≤ 50000),
`videoUrl` (≤ 2048), `durationMinutes` (≥ 0), `views` (≥ 0), `likes` (≥ 0),
`publishedAt` (date-time). Max 2000 entries.

- **Omit** `videos` → stored videos are left untouched.
- Send a `videos` array → each entry is **upserted** by its `externalId` within
  the channel. Unlike events and podcasts, a supplied array **does not delete**
  videos it omits. To remove a video, ask an editor.

---

## 9. What the platform owns

These fields are set by Loopskey, never by a crawler. **Sending one by name is a
rejection of that item**, with a `reason` naming the field — it is not silently
dropped, because a crawler that thinks it controls publication state is
misconfigured and needs to hear so.

- **Every kind:** `id`, `sourceId`, `status` (publication state), `autoPublish`,
  `providerId`, `provider`, `providerUser`, `userId`, `user`, `isFeatured`,
  `deletedAt`.
- **Event, additionally:** `capacity`, `attendees`, `views`,
  `registrationEnabled`, `registrations`, `earlyBirdDiscount`,
  `earlyBirdDiscountPercent`, `earlyBirdEndsAt`, `promotionVideoUrl`,
  `promotionalVideoUrl`, `promotionRequests`.
- **Podcast, additionally:** `episodeCount` (derived from stored episode rows),
  `listeners`.
- **YouTube channel:** only the every-kind list. `subscribers`, `views`, and
  `videoCount` **are** accepted here, because for a channel they are the
  source's own published numbers rather than platform state.

**Review aggregates** — `rating`, `ratingCount`, `averageRating` — are a special
case. They are neither canonical nor protected: if you send one, the value is
**dropped** and the field **name is recorded** in `unmappedFields` (as with any
unmapped field, [§10](#10-unmapped-fields)), and the platform's own review
figures are left to win. Sending them is harmless but pointless.

---

## 10. Unmapped fields

Anything in an item that is not in that kind's canonical shape (after your
source's field map is applied) is **dropped**. The platform records only the
**name** of each dropped field, in the item's `unmappedFields` array on the
receipt. **The value is never stored.**

If you are wondering where a field you sent went: if its name is in
`unmappedFields`, it was outside the schema and dropped. Run the item through
`dryRun` ([§7](#7-validating-first)) to see the dropped **values** in
`unmappedValues` and confirm you did not mean to map them.

If a field *should* be carried, it needs either a canonical field it maps to or
a change to your source's field map (ask an editor) — the platform will not
start storing an arbitrary field on request.

---

## 11. Images

- `imageCandidateUrl` is a **candidate**, never authoritative. The platform
  validates it and either re-hosts the image or discards the URL. A crawled URL
  is never served directly and never written straight onto the catalogue row.
- **A missing image is a fully supported, normal state.** Do not synthesise a
  placeholder; omit the field.
- **Whether the platform actually fetches candidate images is a per-source
  setting.** For every sandbox source, and unless we tell you otherwise for a
  production source, **image fetching is OFF**: the candidate URL is stored on
  the ingestion record for an editor to action, and nothing is downloaded. Send
  the best URL you have anyway — enabling fetch later is a switch on our side, no
  change on yours.

---

## 12. Change detection

- The platform stores a hash of each item's canonical shape. Re-submitting an
  item whose canonical shape has not changed costs you one request and reports
  `unchanged`: no write, no review churn, no event. **Resubmitting unchanged
  content is free and correct** — you do not need to compute deltas yourself.
- A **full re-crawl is a supported, cheap operation.** Send everything with
  `mode: "FULL"` in batches of ≤ 100. Unchanged items report `unchanged`;
  genuinely changed ones report `updated`. `mode: "FULL"` is recorded on the
  batch for the editors' context; it does not itself delete catalogue rows that
  were absent from the re-crawl — tell us if a source needs sweep-and-delete
  semantics.
- Child sets follow their own rules ([§8](#8-the-canonical-shape-per-kind)): an
  omitted `scheduleItems` / `episodes` / `videos` is not a deletion.

---

## 13. Errors and retries

### Rules

- A **`4xx` is a permanent rejection of the request as sent.** Never retry it
  unchanged — fix the request first.
- A **`429` or `5xx` is transient.** Retry with exponential backoff (e.g. 1s,
  2s, 4s, 8s, … with jitter) **using the same `Idempotency-Key`**, so a batch
  that actually did land is not processed twice.
- On `429`, honour the **`Retry-After`** response header (seconds) before the
  next attempt.
- A per-item `rejected` in an otherwise-`201` receipt is **not** a request
  error. Fix that item and include it in a later batch; do not retry the whole
  batch.

### Code table

Codes are returned as `{"code":"…","message":"…"}`. `Scope` tells you who a code
is for: **crawler** (you will see it), **item** (a per-item `reason` on a `201`
receipt), **admin** (only on the internal admin API — listed so the set is
complete).

| Code | HTTP | Scope | Meaning / fix |
| --- | --- | --- | --- |
| `INGESTION_UNAUTHORIZED` | 401 | crawler | Any credential problem — missing, malformed, unknown, wrong secret, revoked, or expired. Check the credential; ask us to reissue. |
| `INGESTION_RATE_LIMITED` | 429 | crawler | Over the allowance for this key. Back off; honour `Retry-After`. |
| `INGESTION_SOURCE_INACTIVE` | 403 | crawler | The credential is valid but its source is deactivated. Contact us — do not retry. |
| `INGESTION_SOURCE_NOT_CALLER_SUPPLIED` | 400 | crawler | You sent a `sourceId` (body, query, or `X-Ingestion-Source-Id`). Remove it. |
| `INGESTION_CONTRACT_VERSION_UNSUPPORTED` | 400 | crawler | `contractVersion` is not `"1.0"`. |
| `INGESTION_KIND_MISMATCH` | 400 | crawler | Route kind, envelope `kind`, and the credential's source kind do not all agree. |
| `INGESTION_ENVELOPE_INVALID` | 400 | crawler | `mode` not `INCREMENTAL`/`FULL`, `dryRun` not boolean, `items` not an array, `Content-Length` not a non-negative number, or `Idempotency-Key` over 200 chars. |
| `INGESTION_FIELD_MAP_INVALID` | 400 | crawler | Your source's stored field map is misconfigured. This is ours to fix — send us the batch id and source slug. |
| `INGESTION_IDEMPOTENCY_KEY_REQUIRED` | 400 | crawler | The `Idempotency-Key` header is missing or blank. |
| `INGESTION_BATCH_TOO_LARGE` | 413 | crawler | More than 100 items. Split the batch. |
| `INGESTION_BODY_TOO_LARGE` | 413 | crawler | Compressed body over 1 MiB. Send fewer items per batch. |
| `INGESTION_BATCH_NOT_FOUND` | 404 | crawler | `GET` for a batch id that does not belong to your source or does not exist. |
| `INGESTION_EVENT_DATE_RANGE_INVALID` | — | item | An event's `endDate` precedes its `startDate`. Fix the dates. |
| `INGESTION_EPISODE_NUMBER_REQUIRED` | — | item | A podcast episode object had no `episodeNumber`; it was skipped and `"episodes"` added to `unmappedFields`. The podcast still landed. |
| `INGESTION_SOURCE_NOT_FOUND` | 404 | admin | Admin referenced a source id that does not exist. |
| `INGESTION_SOURCE_SLUG_EXISTS` | 400 | admin | Admin tried to create a source with a slug already in use. |
| `INGESTION_API_KEY_NOT_FOUND` | 404 | admin | Admin referenced a key id that does not exist. |
| `INGESTION_ITEM_NOT_FOUND` | 404 | admin | Admin referenced an ingestion item id that does not exist. |
| `INGESTION_ITEM_HAS_NO_CATALOG_ROW` | 400 | admin | Admin tried to review an item that never produced a catalogue row. |
| `INGESTION_ITEM_NOT_ELIGIBLE_FOR_REVIEW` | — | admin | Reserved in the contract for an item not in a reviewable state; no code path emits it today. |
| `INGESTION_ITEM_REVIEW_CONFLICT` | 409 | admin | Two reviewers acted on the same item; the loser re-reads and retries. |

---

## 14. Rate limits

Each API key has its own allowance, enforced server-side across all instances:

- **600 requests per 60-second rolling window**, per key (the default; if we set
  a different limit for your key we will tell you the number).
- Over the limit → `429 INGESTION_RATE_LIMITED` with `Retry-After` in seconds.
- The window is per key, not per source: rotating to a second key
  ([runbook](#operational-runbook)) gives you a fresh allowance during a
  cutover.
- At 100 items per request this ceiling is 60000 items/minute per key, far above
  a normal crawl. If you are hitting it you are probably retrying too
  aggressively — widen your backoff.

---

## 15. Publication

- **Accepted content is not public.** A newly ingested item produces a catalogue
  row in a non-public **draft** state and an entry in the editorial **review
  queue**.
- An editor reviews each item and either **approves** it (the catalogue row is
  published) or **rejects** it (it stays unpublished, with a reason recorded).
- A sandbox source never auto-publishes; a production source only auto-publishes
  if we have explicitly enabled it for you, which we do not do by default.
- **Turnaround** is a business process, not an SLA in this document: expect a
  few business days for a new source's first batches while editors calibrate,
  faster once a source is trusted. Ask us if a specific batch is stuck.

---

## 16. Versioning

- The contract version is declared per batch as `contractVersion` and is `"1.0"`
  today. The matching JSON Schemas are versioned in their filename and `$id`
  (`…-item.v1.schema.json`).
- **Additive changes** — a new optional field, a new enum member, a new kind —
  do **not** bump the version. Your integration keeps working; adopt the new
  field when you want it.
- A **breaking change** — a removed or renamed field, a tightened bound, a new
  required field, changed semantics — ships as `contractVersion` `"2.0"` with a
  `v2` schema. Both versions run in parallel for a migration window announced by
  email to your team's technical contact, with the old version's retirement date
  stated up front.
- Your crawler should send the version it was built against explicitly and not
  "track latest".

---

## 17. Support

Contact: **ingestion@loopskey.com** (until we give your team a dedicated
channel).

Include, always:

- the **batch id** from the receipt (or the `Idempotency-Key` you used, if the
  request never returned one);
- your **source slug** (e.g. `sandbox-course`);
- the **correlation id** — every response carries an `X-Correlation-Id` header;
  quote it for the request you are asking about.

For a rejected item, also include its `externalId` and the `reason` string from
the receipt. Do not send us the full crawled payload unless we ask; the batch id
and correlation id let us find it.

---

# Operational runbook

For a Loopskey `ADMIN`. Each entry names the console screen or GraphQL operation
that performs it. Crawler teams do not need this section.

The admin surface is the GraphQL API under the `ADMIN` role (Ingestion console).
The operations referenced below:

- `ingestionSources`, `ingestionSource` — list / read sources
- `createIngestionSource`, `updateIngestionSource` — create / edit a source
- `activateIngestionSource`, `deactivateIngestionSource` — flip `isActive`
- `issueIngestionApiKey`, `revokeIngestionApiKey`, `ingestionApiKeys` — keys
- `ingestionBatches`, `ingestionBatch` — batch history and one batch's detail
- `ingestionItems` — the review queue, filterable by source and state
- `approveIngestionItem`, `rejectIngestionItem` — review decisions

### Onboarding a crawler team

1. **Ingestion console → Sources → New source**, once per kind they will send.
   `createIngestionSource` with `slug` (e.g. `acme-course`), `name`, `kind`,
   `autoPublish: false`. Leave `fieldMap` empty unless their crawler's field
   names differ from the canonical names, in which case set it now.
2. **Issue a sandbox key** — actually, point them at the shared sandbox source
   for that kind first (below). Only create their own source's key when they are
   ready for production.
3. When ready: **Sources → their source → Keys → Issue key**
   (`issueIngestionApiKey` with `sourceId`, `name` e.g. `acme-prod-2026-09`).
   **Copy the `credentialShownOnce` value from the response and send it to them
   over a secure channel — it is not recoverable.**
4. Send them this guide and the four schema files.

### Creating the permanent sandbox sources

Run once per environment that should have them. Not a migration and not part of
any deploy.

```
npx ts-node apps/api/scripts/create-ingestion-sandbox.ts
```

The script is idempotent: it creates `sandbox-course`, `sandbox-event`,
`sandbox-podcast`, `sandbox-youtube` (all `autoPublish: false`) if they are
absent and prints one freshly issued key per source. Re-running it issues fresh
keys without disturbing the sources. Equivalent by hand: four
`createIngestionSource` calls followed by four `issueIngestionApiKey` calls.

### Issuing a second key and revoking the first without an outage

1. **Sources → source → Keys → Issue key** (`issueIngestionApiKey`). Give it a
   dated name. Send the new `credentialShownOnce` to the team.
2. Wait for confirmation that their crawler is using the new key — check
   **Keys**, the old key's `lastUsedAt` stops advancing while the new key's
   starts.
3. **Keys → old key → Revoke** (`revokeIngestionApiKey` with the old `keyId`).
   Rate windows are per key, so the new key had its own full allowance
   throughout; there is no gap.

### Revoking a compromised key immediately

1. **Keys → the key → Revoke** (`revokeIngestionApiKey`) — takes effect on the
   next request; the key then returns the standard `401 INGESTION_UNAUTHORIZED`.
2. If the source itself should stop entirely, **Sources → Deactivate**
   (`deactivateIngestionSource`) — every key for it then fails with
   `403 INGESTION_SOURCE_INACTIVE` without deleting anything the source has
   submitted.
3. Issue a replacement key (as in onboarding step 3) and notify the team.

### A source whose rejection rate has risen

1. **Ingestion console → Batches**, filter to the source (`ingestionBatches`
   with `sourceId`). Each batch row shows `receivedCount` / `acceptedCount` /
   `rejectedCount`.
2. Open a recent high-rejection batch (`ingestionBatch` with `batchId`). Its
   `items` array lists every `rejected` item with its `reason` string.
3. Group the `reason` strings — the dominant one is the cause (a new required
   field the crawler stopped sending, an enum value that drifted, a protected
   field that appeared). The batch's `correlationId` ties it to the server logs.
4. Tell the team which `reason` dominates and for which `externalId`s. If it is a
   field-map problem, fix `fieldMap` via `updateIngestionSource`; if it is their
   crawler, they fix and resend those items.

### Finding what a specific batch did from its id alone

**Ingestion console → Batches → search by id**, or `ingestionBatch(batchId:)`.
The detail returns the full receipt (counts and every per-item `state` /
`reason` / `catalogId`), the `mode`, the `idempotencyKey`, the `correlationId`,
and the owning `sourceId`. From the `catalogId` on an accepted item you can open
the catalogue row it produced.
