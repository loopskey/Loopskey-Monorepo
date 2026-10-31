# transactional-email-copy-refresh

- Scope: `api`
- Model: `High reasoning — authentication email, one-use links and versioned outbox delivery across several modules`
- Branch: `feature/transactional-email-copy-refresh`
- Base: `6f0b777f`
- Status: `Submitted`

Spec: `context/features/mail/transactional-email-copy-refresh.md`

## Acceptance

- [x] Items 1-20 render the catalogue copy through one shared layout (`email-layout.ts`): OTP, Organization, Association account and invitation mail, the manual and automatic Association notices, and the internal contact inquiry.
- [x] HTML and plain text come from the same blocks; every text value is escaped in HTML, subjects and user-derived values are one line, links are plain http(s) URLs, and a support address is linked only when it is a plain address.
- [x] OTP mail carries the real code and configured expiry; items 2 and 3 use the configured support address.
- [x] Activation and invitation mail keep their single-use link and expiry in the button and the plain text.
- [x] Items 13-19 render in English and French; deadline, requirement and certificate-expiry branches pick exactly one sentence; a certificate with no date is skipped, not called expired.
- [x] Version 1 queued rows keep their original copy; new rows are stamped version 2; the Association preview uses the current version and the same links.
- [x] Item 18 and 17 link to the requirements view, 13 and 19 to the dashboard, 14 to requirements, 15 to its requirement, 16 to its content or requirement.
- [x] Editorial safeguards applied: neutral welcome sentence, "has expired" subject for a past certificate date.
- [x] Mail code is organized under `application/`, `services/`, `templates/`, `types/`, and `utils/`; the outbox delivery handler is owned by the mail module, and consumers use the new aliases.
- [x] Outbox append, polling, retry, delivery identity, and database indexes reviewed; no query or schema change was needed for this feature.
- [ ] Staging inbox checks (Gmail, Outlook) and copy-owner approval of the two safeguards: not done here.
- [ ] Existing architecture debt: generic `mail.delivery.requested` events store rendered mail, including OTP and one-use URLs, in the outbox JSON payload. This predates the copy and folder changes and conflicts with the general secret-free payload rule. A separate encrypted mail-content store/key rotation and migration plan is required before changing this without breaking queued deliveries.

## Verification

Re-run after the author's refactor of the mail module (build, `tsc`, `eslint`, full `jest`, 178 suites); three call sites and specs that still used the old paths and names were updated.

- `npm run lint --workspace api`, `npm run check-types --workspace api`, `npm run build --workspace api` — pass
- `npx tsc --noEmit -p apps/api/test/tsconfig.json` — pass
- `npm run test --workspace api -- --runInBand --silent` — 179 suites, 2,628 tests pass
- Monorepo `npm run lint` and `npm run check-types` — pass; `npm run build` reports 3 successful tasks when `NEXT_PUBLIC_SITE_URL=https://loopskey.com` is set for the build process. Turbo did not exit after the success summary (also with `--no-daemon`), so the idle wrapper was interrupted. Without that variable, the front build stops at its existing site-origin configuration guard.
- HTML rendered in a browser at 390 px and 900 px for the OTP, activation and a French notice — pass; real mail clients not checked

## Submission

- Commit: f7887089
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/345
- CI: pending
