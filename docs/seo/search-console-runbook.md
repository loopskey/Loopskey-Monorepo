# Google Search Console runbook

Everything here is an operator task. None of it can be done from the repository,
no credentials belong in it, and nothing is assumed to be connected. Record each
step in the log at the bottom only when it has actually been done.

## Who owns what

| Responsibility | Owner | Notes |
| --- | --- | --- |
| Search Console property owner (two people, at least) | to be named | Needs access to the domain's DNS |
| DNS for the production domain | to be named | Adds the verification record |
| Release owner | to be named | Runs the checklist and the diagnostic |
| Alert owner and destination | to be named | Deployment configuration, not code |

Name real people and a shared mailbox in the log before the first release. A
property with a single owner is lost when that person leaves.

## 1. Verify the domain

Use a **Domain property** for the canonical domain, for example `example.com`.
It covers `www`, the apex, every subdomain and both schemes in one property.

1. In Search Console choose Add property, then Domain, and enter the registrable
   domain.
2. Copy the TXT record Google shows.
3. The DNS owner adds it at the domain's DNS provider.
4. Choose Verify. DNS can take minutes to hours to propagate.

DNS verification does not need a meta tag or a file in this codebase. Do not add
a verification tag to the pages. Keep the TXT record in DNS for as long as the
property should stay verified.

## 2. Add owners and users

1. Settings, Users and permissions, Add user.
2. Add the second owner and give everyone else the lowest permission they need.
3. Review the list every quarter and remove people who left.

## 3. Submit the sitemap

Only submit after the production site is indexable (see the release checklist).

1. Sitemaps, Add a new sitemap.
2. Enter the path `sitemap.xml` under the property's canonical origin. That is
   the sitemap index; it lists the shard files.
3. Confirm the status reads Success and the discovered page count is plausible.
4. The robots.txt of an indexable deployment already advertises the sitemap.

A staging or preview deployment disallows everything in `robots.txt` and sends
`noindex`, so never add one as a property or submit its sitemap.

## 4. Inspect a URL

1. Paste a full canonical URL into the inspection bar.
2. Read Page indexing: is it indexed, and does Google's selected canonical match
   the user-declared canonical?
3. Use View crawled page to compare the rendered HTML, the canonical, the
   hreflang alternates and the structured data with what the diagnostic saw.
4. After a fix, choose Request indexing for a handful of key URLs. This is a
   convenience, not a guarantee, and has a daily quota.

## 5. Page indexing and canonical issues

Open Indexing, Pages, and read each reason on the right:

| Reason | What it usually means here | Action |
| --- | --- | --- |
| Excluded by noindex | A private route, a filtered catalog URL, or a withdrawn page | Expected for dashboards and filters; investigate on any public content page |
| Alternate page with proper canonical | The French or English variant, or a historic slug | Expected |
| Duplicate, Google chose a different canonical | Two URLs compete | Compare both with the diagnostic; fix the canonical or the redirect |
| Page with redirect | A historic slug redirecting to the current one | Expected; check the target is the current canonical |
| Not found (404) | A withdrawn or deleted page | Expected if intentional; otherwise restore it |
| Crawled, currently not indexed | Google saw it and chose not to index it | Improve content depth and internal links; do not resubmit repeatedly |
| Discovered, currently not indexed | Queued, not crawled yet | Wait; check the sitemap lists it |
| Blocked by robots.txt | Should never happen on production | Immediate: the robots rule is wrong |

Any content page that moves to a blocked, noindex or wrong-canonical reason is a
release incident, not a backlog item.

## 6. Enhancement and structured data reports

Open the reports listed under Enhancements, such as Breadcrumbs and any
structured data type the site emits (Course, Event, Podcast series). Open an
error, choose Validate fix after repairing it, and note the date. A report only
appears once Google has seen enough pages of that type.

## 7. Performance (queries, pages, countries, devices)

1. Performance, Search results. Set the date range to a full week or 28 days.
2. Turn on clicks, impressions, CTR and position.
3. Break down by Queries, Pages, Countries and Devices. Compare the same
   length of period; do not compare a weekend to a weekday.
4. Export the data for the review schedule in the release checklist.

Search Console data lags by about two days. Annotate the release date next to
every comparison.

## 8. Core Web Vitals

The Core Web Vitals report uses Chrome's field data for groups of similar
pages. It only reports a group once there is enough traffic, and it can disagree
with our own telemetry or with a lab run. Treat the three as separate evidence
and never fill a gap in one with another.

## Log of actions actually performed

Leave a row blank until the action has happened. Add the date, who did it and a
link or screenshot reference.

| Action | Done on | Done by | Evidence |
| --- | --- | --- | --- |
| Domain property created and DNS TXT record added | | | |
| Domain verified | | | |
| Second owner added | | | |
| Sitemap submitted | | | |
| First URL inspection of the home page and one course | | | |
| Alert owner and destination confirmed with a safe test | | | |
