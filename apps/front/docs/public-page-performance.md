# Public page performance

Engineering budgets and the measurement they rest on. These are this
repository's own budgets, not a search-engine requirement, and nothing here
may be relaxed by editing a number without recording the evidence and the
review that accepted it.

`context/features/performance-optimization.md`, referenced by
`context/coding-standards.md`, does not exist in this repository. The two rules
the standards quote from it are real and still enforced, and this document is
the measured record that replaces the missing baseline. No historical numbers
were assumed.

## Budgets and ceilings

First-load JavaScript per public route, gzip, counting each shared chunk once:

| Route class | Target budget |
| --- | --- |
| Homepage | 300 KiB |
| Catalog and content detail | 250 KiB |
| Static information page | 200 KiB |

A future hub or provider route uses the catalog and detail budget.

No public route meets its target yet. The targets are deliberately left in place
and every report run prints the remaining gap; the run record for
`seo-11-public-page-performance` holds the evidence and the amendment proposal.

Alongside each target the report carries a **recorded ceiling**: the measured
value plus about two per cent. `--check` fails on a ceiling, not on a target, so
the gap stays visible while no change may quietly make a public route heavier.
Lowering a ceiling after an improvement is expected; raising one needs the same
evidence a budget amendment needs.

Two figures are deliberately outside every budget:

- The `noModule` core-js chunk. It carries a `noModule` attribute, so a
  module-capable browser never downloads it. Counting it overstated every route
  by 38.5 KiB gzip before this was corrected.
- Chunks a route fetches after hydration rather than before interactivity, such
  as the toast surface and the completion dialog.

## Reproducing the measurement

```bash
DEPLOYMENT_ENV=ci NEXT_PUBLIC_SITE_URL=https://www.loopskey.com \
  npm run build --workspace front
npm run bundle-report --workspace front
```

`bundle-report` reads each route's `page_client-reference-manifest.js` and unions
its `entryJSFiles` with `rootMainFiles` from `build-manifest.json`. That union
reproduces the script set of a prerendered route's HTML exactly, and unlike the
HTML it also covers the routes that are server-rendered on demand — which is
every budgeted route except the static information pages. It reports gzip at
level 9, the form `compress: true` delivers.

`--json` prints machine output. `--check` exits non-zero when a budgeted public
route is over budget.

## The public dictionary slice

`src/i18n/en.json` and `fr.json` are the authored source of truth and are
247 KiB of strings. Shipping them to the browser cost 149.6 KiB gzip on every
public route, about a third of its first-load JavaScript, because a client
module imported each one statically.

`scripts/i18n-public-slice.js` generates `src/i18n/generated/public.<locale>.json`
holding only the key paths the public client graph can reach. It walks imports
from the public route roots, marks everything below a `"use client"` module as
client code, and keeps every string literal in that graph that resolves to a real
dictionary path plus the static prefix of every template key. Dynamic imports are
followed, so a deferred island's copy is still included.

Regenerate with `npm run i18n-slice --workspace front`. `npm run lint` fails when
the committed slices no longer match the source dictionaries, so a new key cannot
silently reach the browser or silently go missing from it. The same run asserts
that every required key path is actually reachable in each emitted slice, which
catches a pruning or copy bug rather than only a stale file.

Adding a public page that reads a namespace no public page read before changes
the slice. Review the regenerated diff rather than assuming it is noise.

## Deferred islands

- The toast surface. `hooks/notify.ts` holds no reference to `sonner`; it
  publishes a request and queues it when nothing is listening. `AppToaster`
  loads the `sonner`-backed surface on the first request and replays the queue,
  so a visit that raises no toast never downloads it.
- The completion dialog on a content detail page. It renders only for a signed-in
  professional and only once opened, so it is behind `next/dynamic` and mounts on
  first open.

## Images

`priority` belongs only on a measured LCP candidate. The header logo carried it
on every route, which preloaded an 8-pixel-tall SVG ahead of the real candidate;
it no longer does.
