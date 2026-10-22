# Publication quality and probe cleanup

This runbook covers withdrawing test content that reached the public catalog,
and the rules that now stop the ingestion path from publishing it again. The
code ships the prevention, the review signals and a read-only inventory. Every
production write is a separate step taken by an administrator after reviewing
the inventory, and nothing here is recorded as done until there is execution
evidence.

## The two known records

| Slug                                      | Title seen on 2026-10-13 | Description seen          |
| ----------------------------------------- | ------------------------ | ------------------------- |
| `crawler-ingest-4c8b043ae6d9cee62fc4edd8` | probe                    | connectivity probe        |
| `crawler-ingest-616e0bc13633115ede949ec5` | probe via tunnel         | tunnel connectivity probe |

A title alone is not proof of identity. Resolve both with the inventory below
and confirm the catalogue id, the ingestion source and the creation time before
acting.

## How they could have been published

A catalogue slug made by ingestion is `<source slug>-<external id>`. The genuine
crawled courses in the same listing have slugs of the form
`crawler-<external id>`, so they and the probes most likely came from one
ingestion source whose slug starts with `crawler`. The probes were probably sent
with `externalId` values `ingest-<hex>`. Neither provisioning script in
`apps/api/scripts` creates such a source: both create sources with
`autoPublish: false` and different slugs. The source was therefore set up some
other way, most likely in the admin ingestion screen, where `autoPublish` can be
switched on.

Before this release, ingestion could publish an item through three paths:

1. **Auto-publishing source.** A source with `autoPublish` publishes every
   accepted item at once. A connectivity probe sent without `dryRun: true`
   becomes a live course.
2. **Bulk approval.** Approving the whole review queue publishes every pending
   item, including a probe nobody opened.
3. **Changed re-crawl after a withdrawal.** An item a reviewer had rejected was
   published again as soon as the source re-sent it with any change, when the
   source auto-publishes. Withdrawing through the ordinary controls was not
   durable.

Which of the first two happened is in the database, not in the code. The
inventory prints it as `trace` for each record: published without a reviewer
from source X (path 1), or published by reviewer Y at time T (path 2).

## What now prevents it

- **Placeholder content and links are held for review.** An accepted item from
  an auto-publishing source stays a draft in the review queue instead of going
  live when:
  - the title consists only of placeholder words (`probe`, `test`, `sample`,
    `lorem ipsum`, `connectivity`, `tunnel` and similar) and the description is
    empty, short or also placeholder text; or
  - the external link is not a usable public URL (`example.com`, `localhost`,
    `*.test`, `*.invalid`, a loopback address, a non-HTTP scheme).

  A title only counts as placeholder when every word in it is placeholder
  vocabulary. "Software Testing Fundamentals", "Sample Size and Statistical
  Power" and titles in any other language are published as before.

- **A reviewer's rejection is durable.** When the source re-sends a rejected
  item with changed content, it returns to the review queue as a draft marked
  "Rejected before, changed since". It is not republished.
- **Bulk approval skips held items.** An item with a hold reason needs a
  reviewer to approve it on its own. Neither the queue nor a selection in bulk
  approval includes it.
- **A missing description is a recommendation, not a hold.** It is shown to
  reviewers and never blocks publication.
- **Reviews are audited.** Every approval and rejection writes an `AuditLog` row
  (`INGESTION_ITEM_APPROVED` / `INGESTION_ITEM_REJECTED`) in the same
  transaction as the status change.
- **Reviewers see the reasons.** The review queue shows the reasons on each
  item and has a "Held for review" filter.

A dry run (`"dryRun": true` in the envelope) still writes nothing. Crawler
connectivity checks must use it, and the crawler team should be told so.

## 1. Inventory (read-only)

Run it from `apps/api`, with `DATABASE_URL` pointing at the target database
through a read-only role if you have one:

```bash
cd apps/api
npx ts-node -r tsconfig-paths/register scripts/publication-quality-inventory.ts --out inventory.json
npx ts-node -r tsconfig-paths/register scripts/publication-quality-inventory.ts --scan --limit 500 --out scan.json
```

- With no `--slug`, it resolves the two known probe slugs. Add `--slug <slug>`
  for any other exact record.
- `--scan` walks published ingested rows of every kind, `--limit` rows per kind
  at a time, and lists only the rows the publication checks would hold. Continue
  with `--cursor <nextCursors value>`.
- It only reads, and reports `"writes": 0`. Each record lists:
  - the catalogue id, kind, slug, status and `updatedAt`;
  - the ingestion item, its source and `autoPublish` setting, and its batch;
  - the audit rows;
  - the `trace`;
  - a `proposal` naming the exact control to use and the state it expects to
    find.

Keep the JSON with the change record. It holds ids and public titles only: no
credentials, payloads or private drafts.

## 2. Review

For each proposed record, confirm in the admin dashboard that the title, the
source and the creation time match the inventory. A scan result is a suggestion
for a reviewer, never an instruction to withdraw. Record who approved the list
and when.

## 3. Withdraw through the existing control

For an ingested record (`REJECT_INGESTION_ITEM`):

1. Admin dashboard → Ingestion → Review queue.
2. Set State to `ACCEPTED` and search for the title.
3. Check that the item id matches the inventory.
4. Reject it with a reason, for example "Connectivity probe published by
   mistake".

The catalogue row becomes a draft immediately. The rejection only applies if the
item is still in the state it was read in, so a concurrent change by another
reviewer is reported as a conflict, not overwritten. Rejecting it again does no
harm.

A record with no ingestion item (`ARCHIVE_COURSE`) is archived by an
administrator through the existing `archiveCourse` mutation.

Nothing is deleted. The slug stays reserved and the history is kept.

## 4. Evidence

After withdrawing, record:

- The audit rows: rerun the inventory. Each target should show
  `status: DRAFT` and an `INGESTION_ITEM_REJECTED` review with the actor and
  time.
- The public checks:

  ```bash
  curl -s -o /dev/null -w '%{http_code}\n' https://www.loopskey.com/courses/crawler-ingest-4c8b043ae6d9cee62fc4edd8   # 404
  curl -s -o /dev/null -w '%{http_code}\n' https://www.loopskey.com/courses/crawler-ingest-616e0bc13633115ede949ec5   # 404
  curl -s 'https://www.loopskey.com/content?search=probe' | grep -c 'crawler-ingest-'                                  # 0
  ```

- That neither URL appears in any sitemap shard once the 300-second cache has
  expired.

## Rolling back

A withdrawal is undone only deliberately: approve that exact item again in the
review queue, which is audited too. Never reverse statuses in bulk.

## Pending operator steps

- [ ] Run the inventory against production and keep `inventory.json`.
- [ ] Record the trace of both probes: source slug, `autoPublish`, batch time,
      reviewer if any.
- [ ] Decide whether that source should keep `autoPublish`. With the new holds
      it is safer, but it still publishes without a reviewer.
- [ ] Withdraw both probes through the review queue after review, and record the
      audit rows and the public checks.
- [ ] Tell the crawler team to use `dryRun: true` for connectivity checks.
- [ ] Run `--scan` once and review any further flagged records individually.
