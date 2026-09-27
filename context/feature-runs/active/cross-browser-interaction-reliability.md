# Cross-browser interaction and hit-target reliability

- Scope: `front`
- Model: `High reasoning — global cross-browser hit-testing, portal layering, and same-route navigation require difficult debugging across shared frontend boundaries.`
- Branch: `feature/cross-browser-interaction-reliability`
- Base: `93704d2`
- Status: `Submitted`

## Acceptance

- [ ] New requirement always opens Basic Setup and never Members. Manual QA deferred to the requester.
- [ ] Choosing any Requirement selector option never changes the dashboard tab. Manual QA deferred to the requester.
- [ ] Configure > Add category appends one row and never navigates. Manual QA deferred to the requester.
- [ ] Every dashboard tab activates itself once with mouse, keyboard, and touch. Shared controls passed; authenticated dashboard QA deferred to the requester.
- [x] Closed mobile navigation has no hittable or focusable descendants.
- [x] Selects work inside and outside dialogs without click-through.
- [x] Results pass at 80%, 100%, 125%, 150%, and 200% zoom where supported.
- [ ] Results pass current Chrome, Edge, Firefox, Safari/WebKit, and a touch viewport. Chrome, Edge, and touch emulation passed; Firefox/Safari QA deferred to the requester.
- [ ] Loading, empty, and error behavior does not regress after shared primitive changes. Manual QA deferred to the requester.

## Verification

- `npm run lint --workspace front` — passed
- `npm run check-types --workspace front` — passed
- `npm run build --workspace front` — passed
- `npm run bundle-report --workspace front` — passed; 1,564.6 KB first-load JS for `/dashboard/association`
- Browser interaction matrix — Chrome 153.0.8010.53 and Edge 153.0.4234.48 passed mouse, keyboard, touch emulation, dialog/select layering, closed-drawer focus isolation, and 80/100/125/150/200% zoom. Firefox is not installed and Safari/WebKit is unavailable on this Windows host.
- Authenticated association scenarios — implementation and static flow reviewed; runtime verification is pending an authenticated API/data environment.
- Manual QA decision — on 2026-09-27 the requester asked to submit without further runtime testing and will verify the deferred authenticated, Firefox/Safari, and loading/empty/error scenarios.

## Submission

- Commit: `c2ddb54`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/239
- CI: Pending final metadata commit.
