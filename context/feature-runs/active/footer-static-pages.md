# Footer Static Pages

- Scope: `front`
- Branch: `feature/footer-static-pages`
- Base: `5d85857a9ad5d92526dd4da686bf791f2c28c62a`
- Status: `Ready`

## Acceptance

- [x] Footer renders exactly Solutions, Support, Legal, and Company in the approved link order.
- [x] Explorer, Resources, and the legacy contact/location information box are removed.
- [x] All fourteen canonical routes render their corresponding supplied content and support direct navigation.
- [x] Affected visible and linked email addresses use `loopskey.dev@gmail.com`.
- [x] Contact Us submission behavior and unrelated footer brand, social, bottom-bar, analytics, and responsive behavior remain compatible.
- [x] Static pages have valid metadata, semantic heading structure, responsive layout, and keyboard accessibility.
- [x] Tests cover footer structure, routes, content, email targets, and deprecated-content exclusions.
- [x] Frontend lint, types, tests, build, and relevant browser checks pass.
- [x] Legal release placeholders are resolved or explicitly retained behind the external production release gate.

## Verification

- `npm run check-types --workspace front` - pass
- `npm run lint --workspace front` - pass
- `npm run test --workspace front` - pass outside sandbox; sandbox cannot read the Vitest config ancestor path
- `npm run build --workspace front` - pass
- Local route checks against built app on `127.0.0.1:3007` - all 14 footer-linked routes returned 200
- Deprecated-content scan for `contact@loopskey.com`, `[Insert Date]`, `Explorer`, and `Resources` in affected files - clean

## Submission

- Commit: `8a3164b`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/12 (base `develop`)
- CI: pass - https://github.com/loopskey/Loopskey-Monorepo/actions/runs/31076908148
