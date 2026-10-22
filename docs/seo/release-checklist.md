# Public release checklist and review schedule

Use this for every release that touches public pages, the sitemap, structured
data, or telemetry. A box is ticked only when the step was done and the evidence
exists. A step that needs access nobody has stays unticked and is written down
as pending.

## 1. Before merging

- [ ] CI is green: lint, types, unit tests, API end-to-end tests, build, the
      generated GraphQL check and the SEO diagnostic self-test.
- [ ] `npm run bundle-report --workspace front -- --check-targets --check-ceilings`
      reports every public route within its target and its ceiling.
- [ ] Any Prisma migration was read for stray `DROP INDEX` lines before it was
      applied.
- [ ] A change to the sitemap, canonical, hreflang, robots or structured data was
      checked in a browser at 360px and with the keyboard where the page changed.

## 2. Deploy

- [ ] Record the deployment SHA and the public origin: `______`.
- [ ] Apply the migration, then deploy the API, then the frontend. The frontend
      calls new API fields, so the API goes first.
- [ ] The frontend was built for this environment. `DEPLOYMENT_ENV` and
      `NEXT_PUBLIC_SITE_URL` are baked in at build time, so a staging artifact is
      rebuilt, never relabelled, before it reaches production.
- [ ] The server `.env.docker` sets `DEPLOYMENT_ENV` explicitly (production for
      the live site) and `PUBLIC_FRONTEND_URL` is the same origin as the
      repository variable `NEXT_PUBLIC_SITE_URL`. The container refuses to start
      when either disagrees with the image; see
      `docs/seo/production-indexing-recovery.md`.
- [ ] A change to host aliases, HTTPS redirects or the ingress follows
      `docs/seo/canonical-host-and-redirects.md`: one layer owns each redirect,
      cookie and OAuth settings were confirmed first, and the outside redirect
      checks were recorded.
- [ ] The deployment output shows `Smoke check of the public site` passing. The
      reason for a failure is kept in `$LOOPSKEY_BACKUP_DIR/smoke-<stamp>.log`.
- [ ] Production smoke includes a checked eligible course detail; missing
      fixtures and incomplete sitemap-shard coverage must fail the check.
- [ ] The telemetry decision in `docs/seo/telemetry-and-privacy.md` is recorded
      in `docs/seo/operator-manifest.md` (approver and date), or both telemetry
      flags are `false`.
- [ ] Admin, Search health, on this deployment, shows the website build and the
      API in the state the manifest says. A mismatch is a defect, not a result.

## 3. Staging (must be unindexable)

Run the diagnostic against the staging URL, with the canonical origin the
staging build was made for:

```
node scripts/seo-audit.mjs --base-url <staging-url> --site-origin <staging-canonical-origin> --environment staging --profile full --require-all --out seo-audit-staging.json
```

- [ ] Every page sends `noindex` in the header and the robots meta tag.
- [ ] `robots.txt` disallows everything.
- [ ] The full profile passed with no skipped fixture. Fill the fixture slugs in
      `scripts/seo-audit.config.json` locally for this run and do not commit
      environment slugs.
- [ ] Keep `seo-audit-staging.json` as the release artifact. It contains no
      secrets.

The mutating cases (draft, withdrawn, outage, rename) belong to the API
end-to-end tests. Never create or change production data to exercise the
diagnostic.

## 4. Production, after the deploy

```
node scripts/seo-audit.mjs --base-url https://<production-origin> --environment production --profile full --require-all --out seo-audit-production.json
```

- [ ] No route is `noindex` except the private ones, and `robots.txt` allows the
      site and advertises the sitemap.
- [ ] Every canonical and hreflang alternate is on the production origin.
- [ ] The sitemap index and its shards parse, stay under 50,000 URLs each, and
      list no private or foreign URL.
- [ ] A controlled historic slug redirects with 308 to the current page.
- [ ] A post-release owner is named and reachable: `______`.

## 5. Search Console and monitoring (operator)

Follow `docs/seo/search-console-runbook.md` and record the results in
`docs/seo/operator-manifest.md`. These stay unticked until done.

- [ ] Domain property verified.
- [ ] Sitemap submitted.
- [ ] Alert owner and destination configured and tested with a safe test.

Alerts, owner and destination are deployment configuration. Proposed thresholds:

| Signal                                                                        | Threshold                                                   | Response   |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| A draft, withdrawn or hidden page appears in a public response or the sitemap | any occurrence                                              | Immediate  |
| Canonical origin differs from the configured origin                           | repeated                                                    | Immediate  |
| Sitemap unavailable                                                           | 10 minutes                                                  | Actionable |
| Public 5xx rate                                                               | above 1% with at least 100 requests in 10 minutes           | Inspect    |
| Web Vitals segment breaches its threshold                                     | two consecutive daily windows, with at least 100 page loads | Actionable |

## 6. Review schedule

Write the release date and the data lag on every comparison. Search Console data
trails by about two days, and our own telemetry only covers visitors who were
measured. Compare equal-length periods with a similar traffic mix and do not
attribute every change to search work.

| When   | Compare                                                                               | Source               | Owner       |
| ------ | ------------------------------------------------------------------------------------- | -------------------- | ----------- |
| Day 7  | Impressions, clicks, CTR, indexed canonical pages, sitemap discovered count           | Search Console       | to be named |
| Day 7  | The same measures for queries, pages, countries and devices, as one artifact          | `scripts/search-console-review.mjs` | to be named |
| Day 7  | Organic registration starts and completions, content page opens, external link clicks | Admin, Search health | to be named |
| Day 7  | 75th percentile and sample size for LCP, INP, CLS by device and template              | Admin, Search health | to be named |
| Day 28 | The same measures against the previous 28 days                                        | Same sources         | to be named |
| Day 28 | The same artifact with `windowDays` 28                                                | `scripts/search-console-review.mjs` | to be named |
| Day 28 | Core Web Vitals report and any indexing issue trend                                   | Search Console       | to be named |

Thresholds for action:

- A segment under 100 page loads is not rated and is never reported as passing.
- A 75th percentile above the Good threshold (LCP 2500 ms, INP 200 ms, CLS 0.1)
  in two consecutive windows gets an owner and a ticket.
- Do not claim an uplift without the equivalent-period comparison above.

## 7. Rolling back

- [ ] Telemetry: set `TELEMETRY_ENABLED=false` on the API; rebuild the frontend
      with `NEXT_PUBLIC_TELEMETRY_ENABLED=false` to stop the browser too.
- [ ] Application rollback keeps the additive tables. Do not drop them.
- [ ] Publication and canonical safety (draft and withdrawn content, noindex on
      private routes) must hold in whichever version is serving.
