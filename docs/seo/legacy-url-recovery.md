# Legacy URL recovery

This runbook gives every known broken historic public URL a recorded outcome. It
restores a one-hop redirect only where the same content still exists under
another address, and only after an administrator has reviewed the evidence. A URL
whose content was removed keeps answering a real 404. Nothing here writes to
production by itself: every write is an administrator action taken after the
dry-run plan has been reviewed.

## How old addresses work

Every content address is a claim in `ContentUrlClaim`. Each claim belongs to one
namespace and one slug, and that pair is unique. A record has one current claim
and keeps every earlier claim forever, so no other record can ever take an
earlier address.

- A request for an earlier address of a published record answers one 308 to the
  current address. The locale is kept and the query filtering of SEO-09
  applies.
- A request for the address of a hidden or deleted record answers 404, and
  reveals nothing about the record.

Canonical URLs, structured data, sitemaps and internal links only ever use the
current address.

Until now, an earlier address could only come from renaming a record. An address
that was lost in an older migration or import, while the same content lives on
under a new address, could not be reattached without renaming the live page
twice. `attachRetiredContentSlug` closes that gap. It is an administrator-only
operation that adds a verified earlier address to a published record without
touching its current address.

## The operation

`attachRetiredContentSlug(input: { kind, contentId, retiredSlug, expectedSlug, evidence })`

- **Who can call it:** administrators only. Providers and professionals get
  `FORBIDDEN`, and anonymous callers get `UNAUTHENTICATED`.
- **Version check:** `expectedSlug` must equal the record's current address. The
  record's current claim is locked for the duration, so a concurrent rename of
  that record either waits or makes the attachment fail with
  `CONTENT_URL_VERSION_CONFLICT`.
- **Visibility check:** the target must be published and not deleted, otherwise
  the call fails with `CONTENT_URL_TARGET_NOT_PUBLIC`. An address is never
  attached to hidden content.
- **Ownership check:** an address that is current or earlier for any other record
  fails with `CONTENT_URL_SLUG_TAKEN`. Another record's address is never
  reassigned.
- **Retries:** attaching the same address to the same record again succeeds and
  changes nothing. A race with another record claiming the same address leaves
  exactly one owner.
- **Atomicity:** the claim and an `AuditLog` row (`CONTENT_URL_ALIAS_ATTACHED`,
  with the address, the current slug and the evidence) are written in one
  transaction.
- **In the admin UI:** Admin dashboard → Search visibility → find the page → SEO →
  Page address → "Recover an earlier address". Enter the old address and the
  evidence, confirm, then attach. Earlier addresses are listed in the same
  section.

There is no input for an arbitrary redirect URL. The destination is always the
record's current address.

## Evidence rules

What proves identity:

- the same original source id, for example the crawler or platform course id the
  old slug was made from;
- an import or ingestion row that links the old slug to the record;
- written confirmation from the content's owner.

What does not prove identity: a similar title, matching words, a search result,
or a course "about the same topic". With no proof, the URL stays unresolved and
answers 404. An unresolved row is never counted as repaired.

## The four benchmark URLs

| Path                                        | Evidence available in this repository                                                                                                                            | Disposition until the inventory is run                          |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `/courses/risk-management-in-projects`      | None. A title-derived slug carries no stable id.                                                                                                                 | Unresolved                                                      |
| `/courses/client-relationship-management-3` | None. A title-derived slug with a collision suffix carries no stable id.                                                                                         | Unresolved                                                      |
| `/courses/stakeholder-management`           | None.                                                                                                                                                            | Unresolved                                                      |
| `/courses/coursera-jvq5nhtgee2jhw516rtnyq`  | The form `<source>-<id>` suggests source `coursera` with original id `jvq5nhtgee2jhw516rtnyq`. The inventory looks for an ingested record with that external id. | Unresolved until the inventory shows a match and it is reviewed |

These are honest starting points, not findings. Production data was not read
while building this feature. The inventory below, run against production, gives
each path its first evidence-backed disposition.

## 1. Dry run (read-only)

Run it from `apps/api`, with `DATABASE_URL` pointing at the target database,
through a read-only role where one exists:

```bash
cd apps/api
npx ts-node -r tsconfig-paths/register scripts/legacy-url-inventory.ts --out legacy-urls.json
```

With no manifest it checks the four benchmark paths. To add more rows, or to
record reviewed decisions, pass a manifest:

```json
[
  {
    "namespace": "COURSE",
    "slug": "coursera-jvq5nhtgee2jhw516rtnyq",
    "targetId": "<course id>",
    "evidence": "Original Coursera id jvQ5NhTgEe2JHw516RtNyQ matches ingestion item <id> of source <slug>",
    "reviewer": "<name>"
  },
  {
    "namespace": "COURSE",
    "slug": "stakeholder-management",
    "disposition": "REMOVED",
    "evidence": "Owner confirmed the course was discontinued on <date>",
    "reviewer": "<name>"
  }
]
```

```bash
npx ts-node -r tsconfig-paths/register scripts/legacy-url-inventory.ts --manifest rows.json --out legacy-urls.json
```

The script never writes (`"writes": 0`). Every row gets one disposition:

| Disposition         | Meaning                                                                                                                                               | Expected HTTP      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `CURRENT`           | The path is the live address of a published record.                                                                                                   | 200                |
| `MOVED_SAME_ENTITY` | The path is already an earlier address of a published record. Nothing to do.                                                                          | 308                |
| `REMOVED`           | The path belongs to a hidden or deleted record, or a reviewer recorded a deliberate removal.                                                          | 404                |
| `PROPOSED_ATTACH`   | A reviewed manifest row names a published target with evidence. The row carries the exact `attachRetiredContentSlug` input, including `expectedSlug`. | 308 after applying |
| `CONFLICTING`       | The path is already reserved by a different record than the manifest names. Nothing can be reassigned.                                                | unchanged          |
| `UNRESOLVED`        | No reservation and no verified target. `identityHints` lists records sharing a stable original id; a hint is for review only.                         | 404                |
| `INVALID`           | Unknown namespace or malformed slug.                                                                                                                  | 404                |

Keep `legacy-urls.json` with the change record, and report the counts per
disposition.

## 2. Review and apply

For each `PROPOSED_ATTACH` row, a second administrator confirms the evidence.
Then apply it through the admin UI, or call the mutation with exactly the input
the plan printed. If the target was renamed since the dry run, the call fails
with `CONTENT_URL_VERSION_CONFLICT`: rerun the dry run instead of editing the
input by hand. Applying the same row again is harmless.

## 3. Evidence after applying

Rerun the dry run. Each applied row should now show `MOVED_SAME_ENTITY`. Then
check the live site:

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.loopskey.com/courses/<old-slug>      # 308 to /courses/<current-slug>
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.loopskey.com/fr/courses/<old-slug>   # 308 to /fr/courses/<current-slug>, when French is available
curl -s -o /dev/null -w '%{http_code}\n' https://www.loopskey.com/courses/<current-slug>                  # 200
curl -s -o /dev/null -w '%{http_code}\n' https://www.loopskey.com/courses/<unresolved-slug>               # 404
```

Confirm that no sitemap shard lists an old address, and record the audit rows.

## Staging fixture

Production acceptance needs one controlled positive case even if all four
production paths turn out to be removed. On staging:

1. Pick a published test course and note its current slug.
2. Attach `legacy-recovery-fixture` to it with the evidence "Staging fixture for
   legacy URL recovery".
3. Check that `/courses/legacy-recovery-fixture` answers one 308 to the current
   slug.
4. Unpublish the course and check that it answers 404.

The API end-to-end suite runs the same cases against PostgreSQL for every
content kind.

## Rolling back

To stop new repairs, simply stop applying them; there is no background job.
Attached addresses stay reserved, because releasing an address could hand an
indexed URL to unrelated content. A wrong mapping is corrected deliberately:

- withdraw the target if it should not be reachable, which turns the path into a
  404; or
- record a reviewed correction and contact engineering.

Do not delete a claim row in the database.

## Pending operator steps

- [ ] Run the dry run against production and keep `legacy-urls.json`.
- [ ] Review each row. Record evidence and a reviewer for every
      `PROPOSED_ATTACH` and every deliberate `REMOVED`.
- [ ] Apply the approved rows and record the audit rows and HTTP evidence.
- [ ] Run the staging fixture after SEO-13 and SEO-14 are deployed.
