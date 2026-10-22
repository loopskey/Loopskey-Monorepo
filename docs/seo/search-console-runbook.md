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

The named owners, the property, the DNS method and the review calendar are kept
in `docs/seo/operator-manifest.md`. Every item there reads pending until the
action has really been done and can be evidenced.

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

### Producing the 7 and 28 day review

The review is made from the exports an authorised owner downloads. No Search
Console API connection is needed, and none should be added for this.

1. Export the current window and the equal-length window before it. Use
   complete days only: the last day must be at least two days old. Each export
   is a folder with `Queries.csv`, `Pages.csv`, `Countries.csv` and
   `Devices.csv`. Keep the folders under `reports/seo/<review date>/` on the
   owner's machine; they are not committed.
2. Write a manifest beside them. Every field is required except `evidence`:

   ```json
   {
     "property": "sc-domain:<registrable domain>",
     "owner": "<named review owner>",
     "windowDays": 7,
     "releaseDate": "YYYY-MM-DD",
     "reviewedOn": "YYYY-MM-DD",
     "dataLagDays": 2,
     "current": {
       "directory": "current",
       "start": "YYYY-MM-DD",
       "end": "YYYY-MM-DD",
       "exportedBy": "<person who exported>",
       "exportedOn": "YYYY-MM-DD"
     },
     "previous": {
       "directory": "previous",
       "start": "YYYY-MM-DD",
       "end": "YYYY-MM-DD",
       "exportedBy": "<person who exported>",
       "exportedOn": "YYYY-MM-DD"
     },
     "evidence": [
       {
         "kind": "first-party-field",
         "status": "insufficient",
         "label": "LCP, home, mobile",
         "sampleSize": 40
       }
     ]
   }
   ```

3. Run it:

   ```
   node scripts/search-console-review.mjs --manifest <manifest.json> --out review.json --markdown review.md
   ```

   `windowDays` is 7 or 28. `evidence` is for speed results and each entry is
   `lab`, `first-party-field` or `search-console-core-web-vitals`, with a status
   of `available`, `insufficient`, `pending` or `unavailable`. First-party field
   data under 100 measured page loads cannot be recorded as available, and a lab
   result must say how it was run.

What the artifact guarantees:

- A missing export file is **unavailable**, an export with no rows is **empty**,
  and neither is ever shown as zero.
- Change figures appear only when the two windows have the same length, do not
  overlap and end outside the data lag. Otherwise the artifact says why and
  shows none.
- The release date is stated against both windows, so a window that straddles
  it is not presented as a clean baseline.
- Lab results, first-party field data and the Search Console Core Web Vitals
  report sit under separate headings and never fill each other's gaps.
- The artifact carries `"claim": "none"`. It does not say growth or uplift.

Attach the generated `review.json` and `review.md` to the release record. The
raw exports stay with the owner unless they approve sharing them.

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
