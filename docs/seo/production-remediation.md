# Production SEO remediation

This follow-up implements the code fixes from the 2026-10-22 public audit. It
does not make up a provider, a translation, historic identity or Google results.
The user confirmed these editorial facts are currently unavailable. Complete
the reviewed handoff once the owner supplies them; an incomplete handoff fails
complete acceptance and is never counted as a successful skip.

## Order of work

1. An administrator runs the [publication inventory](publication-quality.md),
   checks the ids, source and revision of the two exact probes and rejects them
   through the existing review queue. This writes the existing domain audit
   trail and holds future changed re-ingestion for review. Do not delete rows,
   blacklist legitimate courses containing "test", or bypass publication rules.
2. After the existing sitemap cache expires (at most 300 seconds), verify both
   probes are 404, absent from public cards and absent from every shard. The new
   technical check runs after deployment and uses the existing rollback path
   on failure, so resolve these existing records before releasing this gate.
3. Release the reviewed code through the ordinary pipeline. When the canonical
   hostname starts with `www.`, its counterpart is now an implicit trusted
   alias in the frontend and the build/runtime artifact policy. Explicit extra
   aliases are still validated. No hostname from an incoming forwarded header
   is used as a destination. TLS and preserving the incoming Host at the proxy
   remain operator responsibilities. Older images must be rebuilt, not merely
   restarted with new environment values.
4. Run [legacy inventory](legacy-url-recovery.md), keep its read-only plan and
   review identity evidence. For verified matches, use the existing admin
   `attachRetiredContentSlug` control. For genuine removals, record `REMOVED`.
   Keep every other row `UNRESOLVED`; never redirect it to a similar title.
5. Use the existing editors for a genuine topic, the authorised provider's
   biography/website/logo and a reviewed French course translation. Reuse
   [editorial launch tooling](../../scripts/editorial-launch.mjs) for controlled
   development/staging verification only; its acceptance-account manifest must
   never be published to production. Publication uses the normal versioned
   save/review/approve controls; check all expected public URLs afterwards.
6. Complete the [Search Console runbook](search-console-runbook.md), submit the
   canonical sitemap, inspect one course and export the actual 7/28-day data.
   Use `scripts/search-console-review.mjs` on authorised exports. A tracking
   flag or the existence of a course URL proves neither indexing nor rank.

## Repeatable checks

Technical recovery (read-only, does not need authentication):

```bash
node scripts/production-seo-check.mjs --base-url https://www.example.com --site-origin https://www.example.com --environment production --out technical-seo.json
```

It checks every advertised sitemap shard up to its explicit bound, duplicate
and foreign URLs, exact withdrawn probes, catalog references and the actual
www alias redirects including query preservation. A local image is checked by
passing its HTTP origin as `--base-url`; hostname checks then send its trusted
alias through the HTTP Host header. A public-origin run additionally exercises
the deployed reverse proxy. Limits: ten shards, 3 MiB per response, ten seconds
per request; an exceeded limit fails instead of claiming full coverage.

Copy `production-remediation.handoff.json` to the operator's evidence directory.
Fill its canonical origin, named reviewer and ISO review date (`YYYY-MM-DD`); the three actual
editorial URL paths; each legacy disposition/evidence/reviewer and target path
where appropriate; and Search Console evidence references. Keep sensitive
exports and credentials outside version control. This file is a review record,
not an authentication credential and not independent proof of Google metrics.

```bash
node scripts/production-seo-check.mjs --base-url https://www.example.com --site-origin https://www.example.com --environment production --handoff /path/to/reviewed-handoff.json --out complete-seo.json
```

The unfilled template intentionally fails. A reviewed moved URL must produce
one 308 directly to the same published entity; its target must return 200 and
appear in the sitemap. A reviewed removal must remain 404. Editorial URLs must
return 200 and appear in the sitemap. Account ownership/export references must
be present before a complete handoff can pass. The script performs no writes.

## Existing text and performance

The API presents existing HTML-encoded content as text without rewriting ids,
slugs or provenance. New ingestion strips HTML and stores plain text. React
and JSON-LD output encoding stays in place; decoded text is never inserted as
HTML. No data migration or production backfill is required to fix public titles.

Public catalog card markup is rendered on the server with the URL-selected
dictionary. Interactive client uses retain the same shared card view and
appearance. Only interactive thumbnails remain client components in public
cards. Initial content and links are not hidden to improve a measurement.

Retain all before/after lab samples, failures and deferred-byte totals. Keep
LCP/CLS/TBT targets unchanged, and keep measured field INP separate from lab
TBT. Unmet targets and unavailable account evidence remain open in the run
record; neither is solved by raising a budget or fabricating a pass.
