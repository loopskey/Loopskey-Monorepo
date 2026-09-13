# Load benchmark

Measures how the API behaves at 1,000 users and ~1.3M rows. Every script targets
a dedicated `loopskey_bench` database and refuses to run against anything else —
`bench-url.js` derives the connection string from `apps/api/.env` by swapping the
database name, and `guardBenchDatabase` throws if the target is not
`loopskey_bench`. Development and production data are never touched.

## Running

```bash
npm run bench:setup       --workspace api   # create loopskey_bench, apply migrations
npm run bench:seed        --workspace api   # ~1.3M rows, ~490 MB (about 7 minutes)
npm run bench:queries     --workspace api   # per-query p50/max plus EXPLAIN ANALYZE
npm run bench:concurrency --workspace api   # 1,000 concurrent callers per hot path
npm run bench:pool        --workspace api   # connection_limit sweep
npm run bench:report      --workspace api   # replays the reports overview page load
npm run bench:memory      --workspace api   # heap cost of one report projection
npm run bench:ingestion   --workspace api   # ingestion review queue at 200,000+ rows
```

`bench:setup` shells out to `docker exec` against the container named by
`BENCH_PG_CONTAINER` (default `loopskey-dev-db`). Point it elsewhere, or create
the database by hand, when Postgres is not in that container.

## Scale knobs

`seed-bench.js` reads its shape from the environment, so the same harness can
model a larger tenant:

| Variable                    | Default | Meaning                          |
| --------------------------- | ------- | -------------------------------- |
| `BENCH_USERS`               | 1000    | users, and members per association |
| `BENCH_ASSOCIATIONS`        | 5       | associations                     |
| `BENCH_REQUIREMENTS`        | 6       | requirements per association     |
| `BENCH_ATTR_PER_ASSIGNMENT` | 30      | credit attributions per assignment |
| `BENCH_PDU_PER_USER`        | 120     | PDU activities per user          |
| `BENCH_AUDIT_LOGS`          | 200000  | audit log rows                   |
| `BENCH_OUTBOX`              | 50000   | outbox events, 2% unprocessed    |

The other scripts take `BENCH_RUNS`, `BENCH_CONCURRENCY`, `BENCH_POOLS`,
`BENCH_POOL` and `BENCH_TREND_MONTHS`.

## Measured on 8 CPUs, Postgres 17 in Docker, 1,000 users / 1,301,568 rows

| Path                                          | Result   |
| --------------------------------------------- | -------- |
| Reports overview page, one admin               | 42.3 s   |
| One report projection (995 members)            | 3.3 s    |
| 10 admins opening the report at once           | 15.5 s p95 |
| 1,000 concurrent PDU dashboards                | 2.4 s p95 |
| 1,000 concurrent compliance pages              | 3.9 s p95 |
| Roster search, 200 concurrent                  | 1.1 s p95 |
| Requirement materialisation                    | 172 upserts/s |
| Outbox drain ceiling                           | 1 event/s/instance |

Raising `connection_limit` above the default made every number worse and started
returning `P2037` at 100, because the ceiling is Postgres and the event loop
rather than the pool.

## Ingestion review queue at 200,000 `IngestionItem` rows

`bench-ingestion-review-queue.js` grows `Course`/`Event`/`Podcast`/`YouTubeChannel`
to `BENCH_CATALOG_PER_KIND` rows each (default 50,000; 200,000 combined) and
`IngestionItem` to match 1:1, with a controlled 2.5% of catalog titles
containing the common term "guide" (5,000 true matches) and one narrow term
("zzyzxquilibrium") matching 4 rows, to test both a broad and a realistic
search. `IngestionItem.state` is skewed 70/20/8/2 across
ACCEPTED/PENDING/REJECTED/STALE, so a state-only filter (the admin console's
default view) exercises a genuinely large candidate set.

### Measured on Postgres 17 in Docker, 200,000 `IngestionItem` rows, 200,000 catalog rows

| Query                                                      | Before        | After        | Plan before | Plan after |
| ----------------------------------------------------------- | ------------- | ------------ | ----------- | ---------- |
| Page read, `state = PENDING` only (no `sourceId`)            | 52 ms         | 4 ms         | Seq Scan    | Index Scan Backward (`IngestionItem_state_createdAt_id_idx`) |
| Count, `state = PENDING` only                                 | —             | 10 ms        | —           | Index Only Scan (`IngestionItem_state_createdAt_id_idx`) |
| Page read, `sourceId` + `state = ACCEPTED`                    | —             | <1 ms        | —           | Index Scan Backward (`IngestionItem_sourceId_state_createdAt_id_idx`) |
| Search join, term matching 4,000/200,000 catalog rows (narrow) | —           | <1 ms        | —           | Index Scan (`IngestionItem_catalogId_idx`) |
| Search join, term matching 5,000/200,000 catalog rows (2.5%)  | —             | 117 ms page / 90 ms count | — | Parallel Seq Scan + Hash Join |
| Old `matchingCatalogIds` shape (`LIMIT 500` on the UNION)     | 159 ms        | n/a (removed) | Hash Join on 500 of 5,000 true matches | — |

The `sourceId_state` index that shipped before this feature covered only a
`sourceId`-first filter; a `state`-only query — the console's default view —
could not use it at all and fell back to a parallel sequential scan. The two
replacement indexes (`sourceId_state_createdAt_id`, `state_createdAt_id`) each
lead with a column the review queue filters by alone, and both carry the
`orderBy` columns, so the page read needs no extra sort step either.

The old `matchingCatalogIds` capped an *unordered* `UNION` at 500 rows before
using it to filter `IngestionItem`: at 5,000 true matches for "guide," it
silently dropped 4,500 of them from candidacy, in no defined order — a
different, arbitrary 500 could appear on every reload. The replacement joins
`IngestionItem` to the matching-catalog-ids subquery directly in one query, so
the true count is always exact (confirmed: 5,000, not 500) and every match is
reachable through the review queue's ordinary cursor pagination.

For a narrow, realistic admin search (a handful of true matches),
`IngestionItem_catalogId_idx` is used directly — Index Scan, not a sequential
scan, satisfying that shape cleanly. For a broad term matching 2.5% of the
200,000-row catalog, Postgres instead chooses a parallel sequential scan on
`IngestionItem` plus a hash join against the matched ids. This is the
cost-based planner correctly judging that scanning `IngestionItem` once for a
5,000-row hash probe is cheaper than 5,000 individual index lookups, not a
missing or unreachable index — the join still completes in 117 ms (page) and
90 ms (count) against 200,000 rows, and both numbers stay well within an
interactive admin request. A term with a broader real-world match rate should
be re-measured once the real crawled catalog exists; nothing about this
finding requires a code change.
