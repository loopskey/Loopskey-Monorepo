# Public accessibility and navigation

The public pages are checked with `scripts/a11y-audit.mjs`, which runs axe-core
inside headless Chrome against a production build and stores one record per
state: a route at one viewport in one locale. It also measures what axe does not
report — landmark counts, the heading outline, tabbable controls that are
invisible or under the target minimum, the document status and horizontal
overflow.

```bash
npm run build --workspace front
node scripts/perf-fixture-api.mjs --port 5700 &
npm run start --workspace front -- --port 3100 &
node scripts/a11y-audit.mjs --base-url http://localhost:3100 --out report.json
node scripts/a11y-audit.mjs --compare before.json --after report.json
```

The build and the fixture API are the same ones the performance lab uses, so
detail, topic and provider routes render deterministic content without a
database. `--self-test` checks the aggregation arithmetic without a browser.

An axe pass is not a complete accessibility assessment. It covers the states
listed in `scripts/a11y-audit.config.json` and the rules in its `tags`, and it
cannot judge whether a label is the right label. Keyboard order, focus
restoration, zoom and screen-reader semantics are checked by hand in the
browser.

## Rules this product holds itself to

- One `main` landmark per public view, inside the shared chrome's
  `#main-content` wrapper, which the skip link targets.
- Ordinary text at 4.5:1 and large text at 3:1 against the surface it sits on,
  not against white. `--muted-foreground` and `--warning-soft-foreground` are
  set so they still pass over `bg-muted`, `bg-primary/5` and `bg-warning-soft`.
- 24×24 CSS pixels for a target that the 2.5.8 spacing exception does not
  already cover. Buttons carry `max-md:min-h-11`, so touch targets are 44 px
  tall on phones.
- Native elements over ARIA. A disabled control is a `<button disabled>`; a
  non-interactive label is plain text. `aria-disabled` is not a global ARIA
  attribute and does not belong on a `<span>`.
- Nothing is focusable while it is invisible. A control hidden by opacity is
  either `inert` or becomes visible on `focus-within`.

The before/after evidence for the first full pass is in
`reports/a11y/2026-10-19/`, together with the accepted deviations and what the
automated pass does not establish.

## Documented exceptions

- The contact page's Leaflet map ships its own zoom and attribution controls.
  Its attribution links are about 14 px tall and its controls are invisible
  until the map loads. They are third-party markup, not reachable from this
  codebase without forking the widget, and they are excluded from the target
  and visibility rules.
- Light is the only theme the product ships. There is no dark palette in
  `globals.css`, so no dark-mode contrast is claimed.
- The landing hero splits its heading into per-character spans to animate them.
  The animated spans are `aria-hidden` and the `h1` carries the full heading as
  its accessible name, which is the same text the page renders.
- The FAQ and static pages keep an `<aside>` beside the article inside `main`.
  axe reports `landmark-complementary-is-top-level` for it as a best practice;
  the markup is valid HTML for tangential content and is left alone.
- Text behind the open mobile navigation is measured through its scrim, which
  lowers its contrast in the `+menu` states. It is not meant to be read while
  the panel is open.
