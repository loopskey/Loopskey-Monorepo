# i18n-placeholder-interpolation-fix

- Scope: `front`
- Model: `Fast utility — narrow, mechanical, reversible copy/call-site edits with a clear expected diff; no security, data, or contract risk`
- Branch: `feature/i18n-placeholder-interpolation-fix`
- Base: `9052d972a26775ac73cec5f8ed762cf552677f89`
- Status: `Submitted`

## Acceptance

- [x] Every locale value that contains a placeholder uses `{{name}}` (en and fr).
- [x] Every `t()` call that renders such a key passes the matching parameters.
- [x] No component interpolates translation output by hand with `.replace("{…}")`.
- [x] English and French keep the same placeholder names per shared key (guard
      script; a full key-set diff between locales is a pre-existing, separate
      concern out of this feature's scope).
- [x] Roadmap tab, Roadmap chat counters/retryIn/fieldUpdated, overview welcome,
      association activation dialogs now build their strings through `t()`
      with params — no literal `{`/`}` can reach the UI for these keys.
- [x] Placeholder guard script added (`scripts/check-i18n-placeholders.js`):
      fails on single-brace placeholders, fails on en/fr placeholder-name
      mismatch, wired into `npm run lint` via a new `check-i18n` script.

Found and fixed 20 single-brace keys in `en.json` and 21 in `fr.json` (fr also
had `providerDashboard.settings.stepLabel` wrong on its own), matching the
spec's current-state estimate. Five call sites built strings by hand and were
converted to pass params to `t()`: `ProfessionalOverviewTab.tsx` (welcome
title), `useProfessionalRoadmap.ts` (`formatWeeks`), `RoadmapChatComposer.tsx`
(`remaining`/`overLimit`/`retryIn`), `RoadmapWidgetControl.tsx`
(`selectedOfMax`), `RoadmapChatTranscript.tsx` (`fieldUpdated`). All other
keys already passed params to `t()` correctly and only needed the JSON fix.

## Verification

- `node scripts/check-i18n-placeholders.js` — pass
- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass
- Browser pass (Roadmap tab, Roadmap chat, overview welcome, association
  activation dialog, en + fr) — not run: no browser tool was available in this
  session (Playwright MCP failed to connect). Every changed call site was
  traced by hand against its JSON key and confirmed to pass the exact param
  names the key now expects.

## Submission

- Commit: faaf87c
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/219
- CI: pending
