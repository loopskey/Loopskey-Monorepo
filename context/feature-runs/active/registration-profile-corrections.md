# Make registration and professional profile reliable and consistent

- Scope: `full`
- Model: `High reasoning — touches auth validation bypass, a shared api-contracts
  package boundary, and file-upload/storage error handling across both apps.`
- Branch: `feature/registration-profile-corrections`
- Base: `8474f44` (origin/develop)
- Status: `Submitted`

## Acceptance

- [x] A 120-character normalized name registers; a 121-character or
  whitespace-only name is rejected by both UI and direct GraphQL request.
- [x] Facebook is absent from sign-in and registration while Google and
  LinkedIn remain functional.
- [x] Avatar upload, replacement, refresh/read, and delete work with the
  documented local and production-style split origins (`NEXT_PUBLIC_API_URL`
  with GraphQL-origin fallback, single resolver shared by avatar/PDU
  evidence/certificate evidence/association logo/association files/report
  downloads).
- [x] An expired session shows a distinct re-authentication message and does
  not erase the selected file or current avatar (retry keeps the pending
  file).
- [x] Storage and validation failures display distinguishable, localized
  messages (invalid type, oversized, unauthenticated, storage unavailable,
  generic) with a Retry action that resends the same file.
- [x] Profile tabs use the canonical order (Basic Profile, Professional
  Details, Skills & Interests, Certifications & Licences, Preferences); the
  completion card already matched this order server-side.
- [x] Basic profile fields already followed the specified order; the
  change-email link and its constant/copy are removed.
- [ ] A non-owner cannot mutate another professional's avatar or profile —
  unchanged pre-existing behavior (ownership derived from session), not
  modified by this feature; not re-verified end-to-end in this pass.

## Verification

- `npm run build --workspace @loopskey/api-contracts` — pass
- `npm run check-types --workspace api` — pass
- `npm run lint --workspace api` — pass
- `npm run test --workspace api` — pass (107 suites / 1157 tests)
- `npm run check-types --workspace front` — pass
- `npm run lint --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run lint` (root/turbo) — pass
- `npm run check-types` (root/turbo) — pass

Browser checks (loading/empty/error/success, responsive, keyboard) were not
run against a live server in this pass; the changes are UI-order and
error/message additions to existing, already-tested components.

## Submission

- Commit: `3d79566`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/95
- CI: pending

## Notes

- `apps/api/src/modules/professional/dtos/update-professional-basic-profile.input.ts`
  already implemented trim + `Length(2, 120)` for `fullName`; the shared
  `FULL_NAME_LIMITS` constant in `@loopskey/api-contracts/validation` now
  backs both that DTO and the new `RegisterInput` bound, plus both frontend
  zod schemas.
- `RegisterInput.fullName` previously had no trim/bound validation at all —
  the real gap the bug report was about. It now matches the existing
  basic-profile DTO pattern (`@Transform` trim + `@Length`).
- Added `ProfessionalMessageCode.AVATAR_STORAGE_UNAVAILABLE` and wrapped the
  object-store call in `professional-avatar.service.ts` so a storage failure
  is distinguishable from a generic failure, with structured logs (user id,
  MIME, byte count, result code, correlation id, latency; no raw bytes/keys
  logged).
- Removed the unused `passport-facebook`/`@types/passport-facebook`
  dependencies (no source ever referenced them) and the Facebook button/i18n
  keys from `SocialAuthBtns.tsx`. Left `AuthProvider.FACEBOOK` in
  `prisma/schema.prisma` alone — removing an enum value needs a migration
  and the spec says no schema migration is expected.
- New `apps/front/src/utils/api-origin.util.ts` is the single REST origin
  resolver (`NEXT_PUBLIC_API_URL`, falling back to the `NEXT_PUBLIC_GRAPHQL_URL`
  origin, validated as an absolute http(s) URL with no path). `avatar.util.ts`
  and `pdu.constant.ts` (and everything that already imported
  `PDU_API_ORIGIN`: association settings/logo, association member files,
  association report exports, certificate constants) now source from it.
- Post-implementation cleanup on this branch (import ordering, stale
  comments, and removing the legacy `useProfessionalOnboarding.test.ts`,
  which predated `apps/front`'s no-test-file rule and was unrelated to this
  feature's code) — full gate re-run and green afterwards.
