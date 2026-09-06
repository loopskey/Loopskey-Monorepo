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
