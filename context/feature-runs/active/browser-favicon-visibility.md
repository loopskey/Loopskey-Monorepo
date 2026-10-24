# Browser favicon visibility

- Scope: `front`
- Model: Standard development — a bounded, reversible frontend asset change with no data or API contract impact.
- Branch: `feature/browser-favicon-visibility`
- Base: `b39e3a6fc9dfabfc04d75471ddd070e2a5b8f662`
- Status: `Submitted`

## Acceptance

- [x] Remove the favicon background and color the existing mark `#F17815`.
- [x] Enlarge and center the mark without clipping it in the 64×64 SVG.
- [x] Publish matching ICO frames at 16×16, 32×32, 48×48, and 64×64.
- [x] Keep the browser title with the brand first; browser controls title font family and size.

## Verification

- `git diff --check` — pass
- Favicon SVG/ICO color, transparency, bounds, and dimensions — pass
- Light/dark browser preview at 16/32/48 px — pass
- `npm.cmd run lint --workspace front` — pass
- `npm.cmd run check-types --workspace front` — pass
- `NEXT_PUBLIC_SITE_URL=https://loopskey.com npm.cmd run build --workspace front` — pass; existing TopicHubs upstream configuration messages during static generation
- `npm.cmd run bundle-report --workspace front -- --check-targets --check-ceilings` — pass; all 23 budgeted public routes passed
- Production browser check: English and French home routes and icon endpoints — pass

## Submission

- Commit: `5a7fd76109eb7374f58bca8befce8e9463b01b08`
- PR: [#323](https://github.com/loopskey/Loopskey-Monorepo/pull/323)
- CI: queued for the metadata commit
