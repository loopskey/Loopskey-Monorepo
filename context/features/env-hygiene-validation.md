# Environment Hygiene and Validation

> Source: `context/monorepo-audit.md` — **MONO-12**. No prerequisite.
> Contains one item that should be treated as urgent.

## Objective

Close a secret-exposure trap, make onboarding possible, and turn silent
misconfiguration into a startup error.

`apps/api/.env.production` is **tracked in git**. Its 48 keys are empty
placeholders today — only `NODE_ENV`, `COOKIE_SECURE` and `GRAPHQL_PLAYGROUND`
carry values — so **nothing has leaked**. But it is the file a developer would
naturally paste real credentials into, and it is the one git is watching.

## Status

Not Started

## Goals

- Stop tracking `apps/api/.env.production` and close the gitignore gap that let
  it in.
- Regenerate `apps/api/.env.example` so it actually documents the API's
  configuration.
- Add `apps/front/.env.example`, which does not exist at all.
- Add startup validation to both apps, **per-app, not as a shared package**.

## Evidence

```text
$ git ls-files | grep "\.env"
apps/api/.env.example
apps/api/.env.production          ← tracked
```

`apps/api/.gitignore:39` ignores `.env`, and the lines below it ignore
`.env.development.local`, `.env.test.local`, `.env.production.local` and
`.env.local` — but **not** `.env.production`.

`apps/front/.gitignore:34` ignores `.env*`, so the frontend is covered. The two
gitignores disagree, and the API's is the permissive one.

### `.env.example` is unusable

It declares **10** keys. The real API needs **48**. The two files barely overlap:
`.env.example` has `ACTIVATION_*`, `ORGANIZATION_ACTIVATION_URL` and
`SUPPORT_EMAIL` which `.env.production` lacks, while omitting `DATABASE_URL`,
every JWT secret, every OAuth credential, and both upload directories.

`CERTIFICATE_UPLOAD_DIR` — required since Phase 6 — appears in **neither** file.

A new developer cannot start the API from `.env.example`.

### No validation

Access is scattered and unvalidated, each site with its own inline fallback:
`process.env.PDU_UPLOAD_DIR`, `process.env.CERTIFICATE_UPLOAD_DIR`,
`process.env.NEXT_PUBLIC_GRAPHQL_URL`, `process.env.ACCESS_TOKEN_COOKIE_NAME`.
A missing `JWT_ACCESS_SECRET` surfaces as a confusing runtime failure rather than
a startup error naming the variable.

## Scope, in priority order

### 1. Close the gitignore gaps — do this first, on its own

- Add `.env.production` (and preferably `.env*` with `!.env.example`) to
  `apps/api/.gitignore`.
- `git rm --cached apps/api/.env.production`.
- Verify `git check-ignore` now reports it ignored.

Then the same fix for a second instance of the identical root cause (audit
finding **D-17**): **25 Turbo cache and daemon logs are tracked** even though the
root `.gitignore` lists `.turbo/` and `**/.turbo/`. Git ignores `.gitignore` for
files that are already tracked, so the rule has never applied to them.

```text
$ git ls-files | grep "\.turbo" | wc -l
25
```

`.turbo/cookies/1.cookie`, `.turbo/preferences/tui.json`,
`apps/front/.turbo/turbo-lint.log`, and 22 daemon logs dated 2025-07-06 through
2026-07-23. Total 16 KB. No secrets, but they contain absolute local paths and
machine identifiers, and — more practically — every build produces a phantom diff
in a file nobody intends to change. This surfaced during the audit: running
`npm run lint` dirtied `apps/front/.turbo/turbo-lint.log`.

- `git rm -r --cached .turbo apps/front/.turbo`.
- Verify `npm run lint` and `npm run build` no longer dirty the working tree.

Doing both in one pass means the "already-tracked files ignore `.gitignore`"
lesson is learned once rather than twice.

### 2. Regenerate the example files

- `apps/api/.env.example` with all 48 keys, values blank, grouped and commented:
  application, database, JWT, cookies, OTP, OAuth, email, uploads, seeding.
  Include `CERTIFICATE_UPLOAD_DIR`.
- `apps/front/.env.example` with `NEXT_PUBLIC_GRAPHQL_URL`,
  `SESSION_SECRET_KEY`, `NEXT_PUBLIC_NEAT_LICENSE_KEY`, and
  `ACCESS_TOKEN_COOKIE_NAME` (read by `apps/front/proxy.ts:5`).
- Reconcile the keys `.env.example` has that `.env.production` lacks — determine
  which are still live and which are dead.

### 3. Add startup validation

**Per-app. A shared `packages/env` is explicitly not recommended** and the audit
argues why: the two schemas share no keys except `ACCESS_TOKEN_COOKIE_NAME`, the
backend's schema must never be importable by the browser, and `@nestjs/config` is
already wired. A shared package here buys coupling, not reuse.

- `apps/api`: validate at bootstrap using `@nestjs/config`'s `validate` hook.
  Fail fast with a message naming every missing or malformed variable.
- `apps/front`: a small server-only validated config module. Keep it out of any
  client bundle.

### Out of scope

- Changing any variable's value or name.
- Rotating credentials — see the decision below.
- Introducing a secrets manager.

## Decision required before starting

**`.env.production` git history.** The file contains only placeholders *in its
current version*. Should its full history be checked for previously-committed
real values? If any are found, rotation is usually cheaper and safer than
rewriting history. This is a human call — do not rewrite history unilaterally.

Suggested check:

```bash
git log --all --oneline -- apps/api/.env.production
git log -p --all -- apps/api/.env.production | grep -E "^\+[A-Z_]+=.+"
```

## Verification

- `git check-ignore -v apps/api/.env.production` reports it ignored.
- `git ls-files | grep "\.env"` lists only `.env.example` files.
- `git ls-files | grep "\.turbo"` returns nothing.
- `npm run lint` followed by `git status --short` leaves the tree clean.
- The API boots successfully with the existing `apps/api/.env`.
- **Negative test:** remove `JWT_ACCESS_SECRET` from a copy of the env file and
  confirm the API refuses to start with a message naming that variable. Restore.
- A fresh `.env` created from `.env.example` and filled with local values boots
  the API — this is the real onboarding test and the point of step 2.
- `npm run build`, `npm run lint`, `npm run check-types` pass.
- Both test suites pass (157 / 112).

## Risks

- `git rm --cached` on a tracked file breaks anyone whose local checkout relies
  on it being present. Announce it before landing.
- Strict validation can break deployments running on undocumented defaults.
  Introduce it in warn mode first, observe, then enforce.
- Enumerating keys in a public example file is safe only if values stay blank.
  Never copy a real value into `.env.example`.

## Acceptance Criteria

- No `.env` file other than `.env.example` files is tracked by git.
- No `.turbo` artifact is tracked by git, and a build no longer dirties the tree.
- Both apps have a complete, accurate `.env.example`.
- Both apps fail fast on missing required configuration, with the variable named.
- A decision on the git history is recorded.
- All gates pass.

## History

<!-- Keep this updated. Earliest to latest -->
