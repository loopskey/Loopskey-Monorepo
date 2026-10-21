# Search measurement: operator manifest

This is the dated record of what the business has decided and what has actually
been done outside the repository. It is the single place the release checklist
and the Search Console runbook point to.

How to read it:

- A value is filled in only when someone with the authority did the thing and
  can show the evidence. Until then the row says **pending** and stays that way.
- The repository can show defaults and code. It cannot show what a production
  server, a DNS zone or a Search Console property currently contains. Rows about
  those say so.
- Never put a credential, a verification token, a private mailbox password or a
  personal identifier here. Names and shared mailboxes only.
- When a row changes, add a new dated line below it instead of overwriting the
  old one.

Manifest created: 2026-10-21 (from the repository; nothing below was verified
against a live system).

## 1. Telemetry switches and the privacy decision

| Item | Value | Recorded by | Date | Evidence |
| --- | --- | --- | --- | --- |
| Frontend build flag `NEXT_PUBLIC_TELEMETRY_ENABLED` on the deployed build | pending | | | Admin, Search health shows "Website build" |
| API runtime flag `TELEMETRY_ENABLED` on the deployed API | pending | | | Admin, Search health shows the collection status |
| Page speed sampling, frontend `NEXT_PUBLIC_TELEMETRY_VITALS_SAMPLE_RATE` | pending | | | Build arguments of the deployed image |
| Page speed sampling, API `TELEMETRY_VITALS_SAMPLE_RATE` | pending | | | Admin, Search health shows the sampling rate |
| Deployed commit and time | pending | | | Release checklist, step 2 |
| Public origin | pending | | | Release checklist, step 2 |
| Privacy decision: do first-party, cookieless, aggregate counts need prior consent under the adopted policy | pending | | | |
| Person who approved enabling collection | pending | | | |
| Date of the approval | pending | | | |

What the repository shows, not what production holds:

- Both flags default to `false` in `apps/api/.env.example`,
  `apps/front/.env.example`, `Dockerfile.front` and `compose.production.yaml`.
- The release workflow passes the repository variables
  `NEXT_PUBLIC_TELEMETRY_ENABLED` and `NEXT_PUBLIC_TELEMETRY_VITALS_SAMPLE_RATE`
  to the frontend build. Anything other than the exact text `true` leaves the
  browser silent.
- The production benchmark of 2026-10-13 saw no telemetry request. That is
  consistent with a flag being off, but it is not proof of either flag: it can
  equally mean the build flag is off while the API flag is on, or the visitor
  sent a privacy signal.

### Open policy item: the privacy page mentions a cookie banner

`privacyPage.sections[8]` in `apps/front/src/i18n/en.json` (and its French
counterpart) tells visitors they can control cookies "via our cookie banner".
The frontend has no banner, no consent component and no stored consent state.
This is not edited here, because the right wording depends on the privacy
decision above:

- If the decision is that cookieless aggregate counts need no prior consent, the
  sentence should stop promising a banner. Owner of the copy: pending.
- If the decision is that prior consent is needed, a consent flow must be built
  before either flag is switched on. That is a separate feature, accessible in
  English and French, and it must not store anything before consent.

Either way, collection stays off until this is settled and recorded.

### Conditions that must all hold before collection is switched on

1. The privacy decision above is recorded with an approver and a date.
2. The privacy page and cookie statement match that decision.
3. The Search health page has been checked on staging with both flags on, and
   shows "Browsers report events" and the API as collecting.
4. The release owner is named and the rollback below has been read.

Nothing is switched on to make a test pass.

### Rolling back

Set `TELEMETRY_ENABLED=false` on the API. Intake then writes nothing and
acknowledges every batch as dropped. Rebuild the frontend with
`NEXT_PUBLIC_TELEMETRY_ENABLED=false` to stop browsers sending at all. Pages,
sign-in and registration do not depend on either flag, and the additive tables
stay in place.

## 2. Search Console

| Item | Value | Recorded by | Date | Evidence |
| --- | --- | --- | --- | --- |
| Domain property (registrable domain, not a URL prefix) | pending | | | |
| DNS verification method | pending (the runbook uses a TXT record) | | | |
| DNS owner | pending | | | |
| First owner | pending | | | |
| Second owner (at least two owners) | pending | | | |
| Other users and their permission level | pending | | | |
| Canonical sitemap submitted (`sitemap.xml` under the canonical origin) | pending | | | |
| URL Inspection of the home page and one course page | pending | | | |

Property creation, DNS and sitemap submission are operator actions on external
systems. They are done by the people named above, and each one is logged in the
action log at the bottom of `docs/seo/search-console-runbook.md` when it has
actually happened.

## 3. Release, review and alert owners

| Role | Name or shared mailbox | Authorized destination | Recorded on |
| --- | --- | --- | --- |
| Release owner (runs the checklist and the diagnostic) | pending | not applicable | |
| Post-release owner | pending | not applicable | |
| Search review owner (7 and 28 day reviews) | pending | not applicable | |
| Alert owner | pending | pending | |

Alert routing is deployment configuration, not code. Nothing in this repository
sends an email or a chat message. The routing is demonstrated once with a safe
test, sent only to the destination the alert owner has authorised for it, and
the result is logged below. An unsolicited message to anyone does not count as a
test.

| Safe routing test | Done on | Done by | Evidence |
| --- | --- | --- | --- |
| A test alert reached the authorised destination | | | |

### Thresholds (from the SEO-12 policy)

These are the proposed signals in `docs/seo/release-checklist.md`, section 5.
They apply once the destination exists.

| Signal | Threshold | Response |
| --- | --- | --- |
| A draft, withdrawn or hidden page appears in a public response or the sitemap | any occurrence | Immediate |
| Canonical origin differs from the configured origin | repeated | Immediate |
| A public page is `noindex` or its canonical is wrong | any content page | Immediate |
| Sitemap unavailable | 10 minutes | Actionable |
| Public 5xx rate | above 1% with at least 100 requests in 10 minutes | Inspect |
| A Web Vitals segment breaches its threshold | two consecutive daily windows, each with at least 100 page loads | Actionable |

A Web Vitals segment under 100 page loads is never rated and never alerts.

## 4. Review calendar

| Review | When | Source | Owner | Artifact |
| --- | --- | --- | --- | --- |
| Release annotation | on the deploy day | release checklist | release owner | the recorded commit and time |
| 7-day review | release date + 9 days (7 complete days plus the data lag) | Search Console exports, Admin Search health | pending | `search-console-review.mjs` output, window 7 |
| 28-day review | release date + 30 days | the same sources | pending | `search-console-review.mjs` output, window 28 |

Search Console trails real time by about two days, so a review is run only when
its last day is at least that old. Compare equal-length periods and write the
release date and the data lag on every comparison. A review that has not been
run yet is pending, not a pass.

How to produce the artifact is in `docs/seo/search-console-runbook.md`,
section 7.

## 5. Data provenance and coverage

Keep these three sources apart in every report. None of them fills a gap in
another.

| Source | What it is | Covers | Does not cover |
| --- | --- | --- | --- |
| Search Console performance export | queries, pages, countries, devices, clicks, impressions, CTR, position | search results | what visitors do after the click |
| First-party aggregates (Admin, Search health) | page speed by template, locale and device; anonymous conversion counts | visitors whose browser is measured | visitors who send Global Privacy Control or Do Not Track, dashboards, sign-in pages, signed-in providers and administrators |
| Lab runs | a controlled device and network | a repeatable comparison | real visitors |

Coverage of the first-party source is stated on the Search health page for every
window: the days with data, the sampling rate and whether collection was on.
Missing Search Console or field data is recorded as unavailable. It is never
read as zero traffic and never as a passing growth result.
