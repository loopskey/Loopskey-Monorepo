# Production indexing and sitemap recovery

This is the operator runbook for the release that restores indexing and the
sitemap on the live site. It separates what the code and CI prove from what only
the live deployment can prove. Nothing here changes server settings by itself:
every step that touches the server or production data is the operator's.

## What was wrong

The benchmark of 2026-10-13 showed one pattern: statically prerendered pages
(about, privacy) and `robots.txt` looked like production, while the dynamic home
page, catalog and detail pages sent `noindex` and `/sitemap.xml` answered 404.

The frontend decides its indexing policy twice. Statically prerendered output
uses the `DEPLOYMENT_ENV` the image was **built** with. Dynamic metadata and the
sitemap routes read `DEPLOYMENT_ENV` again at **request time**. The release
workflow builds the image with `DEPLOYMENT_ENV=production`, but
`compose.production.yaml` overrode the runtime value with
`${DEPLOYMENT_ENV:-staging}`. A server `.env.docker` without the variable
therefore ran a production build as staging, which produces exactly the observed
pattern.

This is the leading explanation, not a proven fact. Stale images, a stale
reverse-proxy cache or an old deployment are still possible until the evidence
below is collected.

## What the release changes

- `compose.production.yaml` no longer defaults to staging. `DEPLOYMENT_ENV` is
  required, both as a build argument and in the frontend runtime environment.
- Every frontend image records `deployment-policy.json`: the commit, the
  environment, the canonical origin and the redirect settings it was built
  with. The container compares that with its runtime environment before the web
  server starts, and refuses to start on a difference. No other environment
  value is read or printed.
- `scripts/deploy.sh` re-reads the compose file after the checkout is updated,
  validates `DEPLOYMENT_ENV` in `.env.docker`, and after the containers are
  healthy runs the smoke profile of `scripts/seo-audit.mjs` inside the frontend
  container: home in both languages, the catalog, one course detail page taken
  from the sitemap, a private route, an unknown route, `robots.txt` and the
  sitemap with every shard. A failed smoke check marks the deployment
  unsuccessful, writes the reason to `$LOOPSKEY_BACKUP_DIR/smoke-<stamp>.log`
  and uses the existing rollback to the previous images.
- Production smoke requires a course detail check. If no eligible course can
  be discovered from the sitemap or supplied in an approved fixture config,
  it fails with `FIXTURE_REQUIRED`; it cannot pass by skipping that check.
  Staging can skip the unavailable detail because its sitemap is intentionally
  absent. An advertised shard count beyond the configured request limit fails
  as incomplete coverage instead of silently accepting a partial sitemap audit.
- `scripts/check-deployment-config.mjs` rejects a staging fallback in the
  production path, a release build without `DEPLOYMENT_ENV=production` and
  `BUILD_SHA`, and an image whose start command skips the policy check. It has a
  `--self-test` that damages the real files and requires the check to notice.
- CI builds the real API and frontend images (production and staging) and runs
  `scripts/verify-front-image.mjs` against them, see "Code verification".

## Before you merge

1. On the server, confirm `.env.docker` sets `DEPLOYMENT_ENV=production`. If it
   is missing, add it **before** the merge. Without it the new compose file
   refuses to load; the running containers are not touched, but the deployment
   fails.
2. Confirm `PUBLIC_FRONTEND_URL` in `.env.docker` is the same origin as the
   repository variable `NEXT_PUBLIC_SITE_URL` (`https://www.loopskey.com`). The
   image is built from the variable, the container runs with the file; the
   start-up check refuses to start when the two origins differ.
3. If `SITE_HTTPS_REDIRECT` or `SITE_CANONICAL_HOST_ALIASES` are set as
   repository variables, they are baked into the image. Do not set a different
   value in the server environment; the container would refuse to start.
4. Handle the two probe records (next section) **before** you let the site be
   indexed. The release makes the site indexable.

The first deployment after this merge still runs the previous `deploy.sh`,
because the script that is running is the one already on the server. It has no
smoke check. Run the checkpoint commands below by hand after that first
deployment.

## The two probe records

Review these two records by their exact identity. Confirm each one in the
administrator publication controls (title, source, creation time) before any
action, and use the existing authenticated unpublish or archive control. Do not
edit the database directly.

| Slug                                      | Title seen in the benchmark |
| ----------------------------------------- | --------------------------- |
| `crawler-ingest-4c8b043ae6d9cee62fc4edd8` | probe                       |
| `crawler-ingest-616e0bc13633115ede949ec5` | probe via tunnel            |

A title alone is not proof of identity; check the slug and the source. Durable
prevention (so test ingestion cannot produce live content) belongs to
feature 15 and does not block this release.

## Evidence to collect (operator checkpoint)

None of this is recorded as done until someone runs it against the live host.
Keep the output; it contains no secrets.

Before the release, to confirm or refute the diagnosis (run on the server in
the checkout directory):

```
docker compose -f compose.production.yaml --env-file .env.docker exec -T front printenv DEPLOYMENT_ENV NEXT_PUBLIC_SITE_URL
docker inspect -f '{{.Config.Image}} {{.Image}}' "$(docker compose -f compose.production.yaml --env-file .env.docker ps -q front)"
```

If `DEPLOYMENT_ENV` prints `staging` (or nothing), the diagnosis is confirmed.
If it prints `production`, the cause is something else (an old image, a cache);
do not rely on this release to fix it and send the output for investigation.

After the release:

```
docker compose -f compose.production.yaml --env-file .env.docker exec -T front node scripts/deployment-policy.mjs show
docker compose -f compose.production.yaml --env-file .env.docker exec -T front sh -c 'node scripts/seo-audit.mjs --base-url http://127.0.0.1:3000 --site-origin "$NEXT_PUBLIC_SITE_URL" --environment "$DEPLOYMENT_ENV" --profile smoke'
```

Then from outside, against the public host:

```
node scripts/seo-audit.mjs --base-url https://www.loopskey.com --environment production --profile smoke --out seo-audit-production.json
curl -sI https://www.loopskey.com/ | grep -i x-robots-tag
curl -s https://www.loopskey.com/robots.txt
curl -s https://www.loopskey.com/sitemap.xml
```

Record: the deployed commit (`sha` from `show`), the environment tuple, the
smoke result, one eligible course URL, the sitemap index and **every** advertised
shard (status and a URL count), and the response headers. If `x-robots-tag`
shows `noindex` on a page that should be indexable, stop and investigate before
submitting the sitemap anywhere.

## Code verification and live acceptance are different

The fixture seeder refuses to load Prisma unless `NODE_ENV=test`, the database
name contains a standalone `test` marker, and neither database URL identifies a
protected development/production database. The image verifier creates its own
`seo_matrix_test` database and overrides `NODE_ENV` only for the seed process;
the API server still runs in production mode. Its safety checks run without a
database using `node scripts/seed-sitemap-fixture.cjs --self-test`.

The startup policy also rejects non-HTTP(S) origins, credentials, path/query/
fragment values, non-HTTPS deployed origins and local deployed hostnames before
comparison. It never prints the rejected raw URL.

| Evidence                                                                        | Where it comes from                             | Status                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------- |
| Start-up check refuses every build/runtime mismatch                             | `verify-front-image` in CI, on the final images | Recorded in the PR                     |
| Production image serves eligible pages without noindex and valid sitemap shards | same, against a fixture of 12,053 courses       | Recorded in the PR                     |
| Staging image stays noindex with no sitemap                                     | same                                            | Recorded in the PR                     |
| Smoke check fails on injected noindex and a missing sitemap                     | same, and `seo-audit --self-test`               | Recorded in the PR                     |
| Live host serves the same                                                       | the checkpoint above                            | **Pending** until the operator runs it |
| Search engines have processed the sitemap                                       | Search Console, days later                      | **Pending**, owned by feature 20       |

## Rollback

A failed health or smoke check rolls back to the previous images automatically.
A rollback keeps every protection: it never edits publication state and never
forces a page to be indexable. If you must roll back by hand, use
`loopskey-front:previous` and `loopskey-api:previous` as the script does. If
the previous frontend is the one that served `noindex`, rolling back returns the
site to that state; that is the known behaviour, not a new fault.
