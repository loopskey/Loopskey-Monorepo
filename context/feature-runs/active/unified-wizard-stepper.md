# Unified wizard stepper and requirement cycle length

- Scope: `front`
- Model: `Standard development — a bounded frontend refactor onto an existing shared component, with no auth, data, API or schema change`
- Branch: `feature/unified-wizard-stepper`
- Base: `209e17ee6f1b7c0720e52084b6f1353081fcbfb3`
- Status: `Submitted`

## Acceptance

- [x] Selecting Multi-year in the requirement Basic Setup step shows the cycle length inside the cycle choice, as a 2–5 year segmented control with its own error state, instead of a field beside Deadline.
- [x] One shared `WizardStepper` in `components/elements` serves every stepped flow in the association, professional and provider dashboards, with full, condensed (sticky) and phone layouts.
- [x] Each step shows an upcoming, current, completed, locked or needs-attention state through icon and text, not colour alone, and exposes `aria-current` and a visible focus ring.
- [x] `ActivityStepper`, `ProviderEventStepper`, `OnboardingStepper` and the inline provider settings stepper are removed with their types, constants and unused i18n keys.
- [x] English and French copy exist for every new string and the public i18n slices are current.

## Verification

- `npm run check-types --workspace front` — pass
- `npx eslint src` (front) — pass
- `npm run check-i18n` and the public i18n slice check — pass; slices regenerated (+13 lines per locale)
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front -- --check-targets --check-ceilings` — pass, all 23 public routes within target and ceiling
- Browser, on a throwaway harness page that was removed afterwards: full and sticky layouts at 1280 px, phone layout at 390 px with the All steps list, locked step ignores Enter and shows a focus ring, needs-attention state, Multi-year panel with error and length selection, English only.
- Not exercised in a browser: the real requirement wizard, onboarding, provider and CPD flows against a running API, and French copy. The callers were verified by type-check, lint and build only.
- `web-design-guidelines` review run; findings fixed: current-step ring kept under reduced motion, hover state on steps, `aria-controls` only while the list is open, condensed titles truncate, length radios take focus on error.
- Prettier flags `cpd-setup-flow.tsx` for one `Button` that was already unformatted before this change; left as is to keep the diff focused.

## Submission

- Commit: `4fe7b320` — `feat(front): unify wizard steppers and redesign requirement cycle length`
- PR: [#324](https://github.com/loopskey/Loopskey-Monorepo/pull/324)
- CI: Pending
