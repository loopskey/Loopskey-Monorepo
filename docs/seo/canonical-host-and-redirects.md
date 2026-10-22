# Canonical host and redirects

This is the operator runbook for sending every public host to the one canonical
origin, `https://www.loopskey.com`. The code ships the redirect rules, their
validation and the smoke checks. Changing nginx, DNS, `.env.docker`, repository
variables and OAuth provider settings is the operator's job, and nothing below
counts as done until someone runs it against the live host.

## Where things stand

The benchmark of 2026-10-13 and a recheck on 2026-10-17 give the same results:

| Request                     | Answer                             |
| --------------------------- | ---------------------------------- |
| `https://loopskey.com/`     | 200, canonical points at `www`     |
| `https://www.loopskey.com/` | 200                                |
| `http://loopskey.com/`      | 301 to `https://loopskey.com/`     |
| `http://www.loopskey.com/`  | 301 to `https://www.loopskey.com/` |

nginx terminates TLS for both hosts and passes the apex through unchanged, and
`SITE_CANONICAL_HOST_ALIASES` is not set. A visitor on the apex therefore stays
on the apex, and a plain-HTTP apex request takes two hops to reach `www`.

## Who owns which redirect

Only one layer owns each redirect. Pick one row and leave the other layer off.

| Redirect                   | Option A: nginx owns it                                                | Option B: the frontend owns it                                                |
| -------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| apex HTTPS to `www`        | `server_name loopskey.com` returns 308                                 | nginx passes the apex through; set `SITE_CANONICAL_HOST_ALIASES=loopskey.com` |
| HTTP to HTTPS (both hosts) | port 80 returns 308 straight to `https://www.loopskey.com$request_uri` | not available; nginx must still redirect HTTP                                 |
| `/en` prefix               | never; the frontend owns it                                            | the frontend                                                                  |

Leave `SITE_HTTPS_REDIRECT=false` for the current nginx topology. Turn it on only
when TLS terminates upstream, `X-Forwarded-Proto` is set on every request, and
nothing in front redirects HTTP itself. A proxy that forwards the wrong scheme
turns it into a redirect loop.

Option B is the smaller change: it needs one repository variable and a rebuild,
and the frontend's smoke check then proves the redirect on every deployment.
Option A keeps the redirect working even when the frontend is down. Either way,
the port 80 server block must send HTTP apex requests straight to
`https://www.loopskey.com$request_uri`, so that HTTP apex takes one hop instead
of two.

### Option A: nginx

```nginx
server {
  listen 80;
  server_name www.loopskey.com loopskey.com;
  return 308 https://www.loopskey.com$request_uri;
}

server {
  listen 443 ssl;
  server_name loopskey.com;
  return 308 https://www.loopskey.com$request_uri;
}

server {
  listen 443 ssl default_server;
  server_name www.loopskey.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

`$request_uri` keeps the encoded path and the whole query string. nginx sets
`Host`, `X-Forwarded-Host` and `X-Forwarded-Proto` itself, so a client cannot
supply its own values for them.

### Option B: the frontend

1. Set the repository variable `SITE_CANONICAL_HOST_ALIASES` to `loopskey.com`.
   Use a bare hostname: no scheme, no port, no path, and never the canonical
   host itself. The build, the image's policy record and the container start-up
   all reject anything else (`ALIASES_INVALID`).
2. Set the same value in the server `.env.docker`. The container refuses to start
   when the runtime value differs from the one the image was built with.
3. In the nginx `server` block for `loopskey.com:443`, proxy to the frontend
   exactly as for `www`, with the same three headers.
4. Release. The image is rebuilt with the new value; restarting is not enough.

The frontend then answers every apex request with one 308 to the same path and
query on `www`. An apex request for `/en/...` goes straight to the unprefixed
`www` URL rather than taking a second hop.

## What the redirect keeps and what it never does

- The encoded path and the whole query string stay as they are. Cursor, search,
  filter and locale parameters are not dropped. Normalizing the query (tracking
  parameters, `cursor` on the catalog) belongs to the page's own canonical
  policy on `www`. That is a separate, same-host redirect: one more hop.
- The destination is always the configured origin. It is never built from
  `Host`, `X-Forwarded-Host` or a query parameter. A request on an unlisted host
  is not redirected anywhere, and its canonical, Open Graph, hreflang,
  structured-data, robots and sitemap URLs still name `www`.
- The canonical host never redirects to itself.

### Hops that remain

| Entry                                                                   | Hops                                                            |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| `https://loopskey.com/<path>`                                           | 1                                                               |
| `https://loopskey.com/en/<path>`                                        | 1 (Option B), 2 (Option A: nginx, then the `/en` rule on `www`) |
| `http://loopskey.com/<path>` with the port 80 block above               | 1                                                               |
| a historic course slug on the apex                                      | 2: host, then the slug redirect on `www`                        |
| a catalog URL with a dropped tracking or `cursor` parameter on the apex | 2: host, then the canonical query redirect on `www`             |

## Sessions, OAuth and email links

Settle these settings before the apex starts redirecting. All of them live in
the server `.env.docker` and the OAuth provider consoles, and none of them is a
secret to write down here.

- `COOKIE_DOMAIN=.loopskey.com`. The access and refresh cookies are then sent
  to both hosts, so a session started on the apex before the change survives the
  redirect. A host-only cookie strands those sessions; the user signs in again
  on `www`.
- `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=lax`. A top-level GET redirect keeps
  `lax` cookies.
- `OAUTH_REDIRECT_URL=https://www.loopskey.com/auth/oauth/bridge`. Google and
  LinkedIn call back to the API host (`GOOGLE_CALLBACK_URL`,
  `LINKEDIN_CALLBACK_URL`), which this change does not touch, so the provider
  consoles need no change.
- `PUBLIC_FRONTEND_URL=https://www.loopskey.com`. Activation, invitation and
  reset emails are built from it, so new links already point at `www`. Links
  sent earlier on the apex keep their token query through the 308.
- `CORS_ORIGIN` keeps both hosts until nothing is served from the apex any more.
  Removing the apex earlier breaks the requests a page loaded before the change
  still makes.

A 308 keeps the method and body. Sign-in, refresh and sign-out are GraphQL
requests to the API host (`NEXT_PUBLIC_GRAPHQL_URL`), so they never pass through
the host redirect.

## Rollout

1. Rehearse on staging, or on an isolated nginx in front of a production image
   built with the alias. Do not use the live host.
2. Confirm the cookie and OAuth settings above.
3. Apply the chosen option at both layers in one change. Option B means the
   variable, `.env.docker` and the nginx pass-through; Option A means nginx only,
   with the variable left empty.
4. Deploy. With Option B, `deploy.sh` runs the `hosts` profile inside the
   frontend container after the smoke profile. A failure rolls back to the
   previous images.
5. Run the checks below from outside and keep the output.

## Checks

Inside the frontend container (`deploy.sh` runs this one itself):

```
docker compose -f compose.production.yaml --env-file .env.docker exec -T front sh -c 'node scripts/seo-audit.mjs --base-url http://127.0.0.1:3000 --site-origin "$NEXT_PUBLIC_SITE_URL" --environment "$DEPLOYMENT_ENV" --profile hosts --alias-hosts "$SITE_CANONICAL_HOST_ALIASES" --https-redirect "$SITE_HTTPS_REDIRECT"'
```

It checks the following, one request each:

- the `/en` prefix;
- that the canonical host answers without redirecting;
- that a hostile `Host` and `X-Forwarded-Host` cannot change the canonical URL or
  a redirect target;
- each alias redirect: home, query, `/en`, `/fr`, an encoded path, and a hostile
  forwarded host;
- the forwarded-HTTP redirect, when it is enabled.

A check for a feature that is switched off is reported as `SKIP`. Every check
also fails a `Location` outside the canonical origin (`LOCATION_FOREIGN`).

From outside, against the public hosts (expected answer after `->`):

```
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://loopskey.com/                                -> 308 https://www.loopskey.com/
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' 'https://loopskey.com/content?q=pmp&lang=fr'         -> 308 https://www.loopskey.com/content?q=pmp&lang=fr
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://loopskey.com/en/about                        -> 308 https://www.loopskey.com/about (Option B)
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://loopskey.com/fr/about                        -> 308 https://www.loopskey.com/fr/about
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://loopskey.com/about                            -> 308 https://www.loopskey.com/about
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.loopskey.com/about                       -> 200
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.loopskey.com/en/about                    -> 308 https://www.loopskey.com/about
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.loopskey.com/this-page-does-not-exist    -> 404
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H 'X-Forwarded-Host: attacker.invalid' https://www.loopskey.com/about -> 200
```

Then follow each entry to its end (`curl -sIL`) and confirm that no chain loops
and that it ends on `www` over HTTPS.

Sign-in, refresh, sign-out, Google and LinkedIn sign-in, an activation link and
a reset link each need one test from the apex and one from `www`, with test
accounts made for the purpose. Never use a real member's account. Tokens are
part of those URLs, so keep them out of screenshots, tickets and logs: record
only the status and the path.

## Rolling back

Undo both layers together. With Option B, clear the repository variable and
`.env.docker` and release again; the container refuses to start while the two
disagree. With Option A, restore the previous nginx file and reload nginx.
Browsers cache a 308, so visitors who already followed it keep going to `www`.
That is harmless, because `www` keeps serving every route.

## Pending operator steps

- [ ] Choose Option A or B and record who decided and when.
- [ ] Confirm the cookie, OAuth and CORS settings above.
- [ ] Rehearse on staging or an isolated ingress.
- [ ] Apply the change in production and record the checks above.
- [ ] Run the sign-in and email-link checks from both hosts with test accounts.
