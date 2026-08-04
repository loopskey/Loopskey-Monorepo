# Monorepo Audit

> Audit performed 2026-07-26 against branch `chore/monorepo-shared-packages-audit`
> at commit `8f66b6e`. Every finding below was verified against the working tree
> or by executing a command; nothing is inferred from general monorepo practice.
> No application code was changed *during the audit*.
>
> **Implementation followed on 2026-07-27** and corrected three things this
> report got wrong. They are marked inline where they occur, and summarised
> here so nobody acts on the original text:
>
> 1. **D-9's "validation gap" does not exist.** The backend *does* reject an
>    expiry before its issue date — in `professional-certificate.service.ts:53`,
>    not the DTO. The audit inspected the DTO and wrongly concluded the rule was
>    missing.
> 2. **MONO-11's `packages/utils` was not built, and should not be.** None of
>    the candidate utilities has a consumer in both applications, so the
>    duplication is intra-`apps/api`, not cross-app. It was fixed app-locally
>    instead.
> 3. **MONO-01's "no build step" recommendation was wrong** and was reversed
>    during implementation. NestJS resolves modules with `node10`, which ignores
>    the `exports` field, and `nest build` emits `require()` calls that would
>    point at `.ts` files. The package compiles to `dist/`.

---

## Executive Summary

This repository is a **two-application npm-workspaces monorepo orchestrated by
Turborepo**, and it uses roughly the *build-tooling* half of what that gives it
while using almost none of the *code-sharing* half.

The single most important structural fact is this:

```json
"workspaces": ["apps/*"]
```

The workspace glob in `package.json:13-15` matches `apps/*` only. There is no
`packages/` directory, no `libs/`, no `shared/`, and no internal package of any
kind. A directory created at `packages/foo` today would not be linked by npm and
could not be imported. **Every code-sharing opportunity in this report is blocked
behind a one-line change to that glob.** That is why MONO-01 is the recommended
first feature.

What is genuinely working well is the GraphQL contract. `apps/api` generates
`schema.gql` from code-first NestJS decorators, and `apps/front` runs GraphQL
Code Generator to produce 1,011 types and 75 enums in
`apps/front/src/lib/graphql/generated.ts`. Frontend types such as
`TWishlistContentTypeFilter = "ALL" | API.ContentType` compose the generated
types rather than restating them. As a result **the class of duplication this
audit was most expecting to find — hand-copied `User`, `Role`, `CourseStatus`,
pagination and filter types — largely does not exist.** Three independent probes
confirmed the boundary is clean: no file in either app imports from the other,
`apps/front` never imports `@prisma/client`, and `apps/api` never imports React
or Next. Prisma entities are not exposed to the browser.

The duplication that does exist sits precisely in the gaps the GraphQL schema
does not cover, and it is concrete:

- **169 backend error codes** across nine `message-code.enum.ts` files never
  reach the schema. The frontend re-declares **25 of them as bare string
  literals**. A rename on either side fails silently at runtime.
- **File-upload rules are written out four times** — the same five-entry MIME
  allowlist, the same 5-file cap, the same 20 MB limit — twice in each app.
- **`slugify` is implemented six times** in `apps/api`, byte-for-byte identical
  in five of them.
- **The cookie name `"access_token"` is hardcoded in both apps**, and this one is
  not merely untidy: `ACCESS_TOKEN_COOKIE_NAME` is honoured when the cookie is
  *written* (`auth-session.service.ts:252`) but ignored when it is *read*
  (`cookie-extractor.ts:5`). Setting that variable breaks all authentication.

On the tooling side the picture is better than the project's own notes claim.
`context/project-overview.md` and the `current-feature.md` history both record
that `npm run lint` fails on the removed Next 16 `next lint` and that no
workspace defines `check-types`. **Both were fixed in commit `8f66b6e` and both
now pass**; those notes are stale and are corrected here. Baseline: lint, types,
both builds and all 269 tests pass.

The remaining tooling gaps are gaps of *absence* rather than breakage. There is
no `.github/` directory, so nothing runs in CI. `test` is not a Turbo task, so
`npm test` at the root fails with "Missing script" and the 269 tests are never
executed by the pipeline. Turbo's `--affected` flag works correctly when invoked
by hand but nothing invokes it. Remote caching is off. And local caching is
already earning its keep — a cold build is **3m42s**, a warm one **37s**.

Two findings deserve to be called out as risks rather than opportunities:

1. `apps/api/.env.production` is **tracked in git**. Its 48 keys are empty
   placeholders today (only `NODE_ENV`, `COOKIE_SECURE`, `GRAPHQL_PLAYGROUND`
   carry values), so nothing has leaked — but `apps/api/.gitignore:39` ignores
   `.env` and `.env.production.local` while missing `.env.production`, so the
   file that has the production name is the one git is watching.
2. `apps/api/src/modules/course/**` and nine other module trees are **untestable
   under Jest today**. The Jest `moduleNameMapper` maps 10 of the tsconfig's 26
   path aliases; 130 source files import through the 16 that are unmapped. This
   was proven, not inferred — a throwaway spec importing `@course/...` failed
   with `Cannot find module`, then was deleted.

Sixteen opportunities are recorded below as MONO-01 … MONO-16, each scored and
each convertible into an independent feature. Four categories are argued as **not
applicable** with reasons, most notably a shared UI package: there is exactly one
frontend application, so `packages/ui` would add a build boundary and buy nothing.

---

## Current Monorepo Tooling

| Question | Answer |
| --- | --- |
| Package manager | **npm 10.8.1** workspaces (`package.json:12`) |
| Task orchestrator | **Turborepo 2.5.4** (`turbo.json`, `turbo@^2.5.4`) |
| Other tools | None. No pnpm, Yarn, Nx, Lerna, or custom runner. |
| Workspace config | `package.json:13-15` — `"workspaces": ["apps/*"]` |
| Applications defined | Directory convention under `apps/`; `apps/api`, `apps/front` |
| Internal packages | **None exist, and none can** — the glob excludes `packages/*` |
| Task pipeline | `turbo.json` defines four tasks: `build`, `lint`, `check-types`, `dev` |
| Local caching | **Yes, working.** Cold build 3m42s → warm `>>> FULL TURBO` 37s |
| Remote caching | **No.** `npm run lint` prints `• Remote caching disabled`; no `.turbo/config.json` |
| Dependency-ordered builds | Declared (`"dependsOn": ["^build"]`) but a **no-op** — see below |
| Affected-only tasks | **Supported but unused.** `turbo run build --affected` resolves correctly by hand; no script or CI uses it |
| Parallel execution | Yes — both packages run concurrently |

### The task graph is flat

`turbo run build --dry=json` reports:

```text
packages: ["api","front"]
api#build   | cache: HIT | deps: [] | outputs: [".next/**","dist/**"]
front#build | cache: HIT | deps: [] | outputs: [".next/**","dist/**"]
```

`dependencies: []` on both tasks. `dependsOn: ["^build"]` in `turbo.json:7` has
nothing to resolve because neither app depends on the other and there are no
internal packages. The topological ordering Turborepo exists to provide is
currently ordering a set of one. This is not a misconfiguration — it is correct
for the current graph — but it means the pipeline delivers caching and
parallelism only, not build ordering.

Note also that both tasks declare the union of both apps' outputs
(`.next/**` *and* `dist/**`). `apps/api` never produces `.next`, and `apps/front`
never produces `dist`. Harmless, but imprecise.

### Missing pipeline tasks

`turbo.json` has no `test` task and no `codegen` task. The root `package.json`
has no `test` script, so:

```text
$ npm test
npm error Missing script: "test"
```

269 passing tests exist and the pipeline cannot run them.

---

## Repository Structure

```text
Course1/
├── apps/
│   ├── api/                     NestJS 11 + Apollo + Prisma 6 backend
│   │   ├── prisma/              schema.prisma (2,066 lines), 14 migrations, seeds
│   │   └── src/
│   │       ├── common/          utils (6 files), types (2 files)
│   │       ├── graphql/         schema.gql — generated, committed
│   │       └── modules/         17 feature modules, 420 .ts files
│   └── front/                   Next.js 16 + React 19 + RTK Query frontend
│       ├── public/, scripts/
│       └── src/                 484 .ts/.tsx files
│           ├── app/             App Router: (auth), (dashboards), (pages)
│           ├── components/      ui (43), modules (224), elements (22), layouts (9), guards (3)
│           ├── hooks/           ~75 feature hooks
│           ├── i18n/            en.json 171 KB, fr.json 193 KB
│           ├── lib/             graphql/ (documents + generated.ts), rtk/, validations/
│           ├── types/           18 contract files
│           └── utils/           ~25 constant/helper files
├── context/                     Project + AI documentation (this file)
├── package.json                 workspaces: ["apps/*"], 4 turbo scripts
├── turbo.json                   build, lint, check-types, dev
├── .prettierrc.json             { "endOfLine": "auto" } — 3 lines, root only
└── README.md                    UTF-16LE, mojibake, describes a structure that does not exist
```

**Directories that do not exist:** `packages/`, `libs/`, `shared/`, `services/`,
`tools/`, `config/`, `.github/`, `apps/api/test/`. No `docker-compose.*` and no
`Dockerfile`.

### Responsibility assessment

| Area | Responsibility | Clearly defined? |
| --- | --- | --- |
| `apps/api/src/modules/*` | 17 feature modules, each `dtos/ entities/ enums/ resolvers/ services/ types/ utils/` | **Yes** — the convention is followed consistently |
| `apps/api/src/common` | Cross-module helpers | **Partly** — only 8 files, and it is duplicated by feature-local `utils/` (see D-2) |
| `apps/api/prisma` | Persistence source of truth | **Yes** |
| `apps/front/src/components/{ui,elements,layouts,modules}` | Documented four-tier split | **Yes** — the layering in `coding-standards.md` is respected |
| `apps/front/src/lib/graphql` | Documents + generated types | **Yes** |
| `apps/front/src/utils` | Constants + helpers | **No** — `function-helper.ts` is a 305-line, 40-export grab bag mixing i18n dictionaries, OAuth role guards, GraphQL printing, currency formatting and a server-only `getSessionSecret` |
| `apps/front/src/types` | Frontend contracts | **Yes** — composes generated API types rather than restating them |

**Are applications and libraries properly separated?** There are no libraries, so
trivially yes. **Do applications import each other's internals?** No — verified
by search, zero matches. **Are package boundaries respected?** There are no
package boundaries to respect; the two apps are hermetic and communicate only
over HTTP.

---

## Current Strengths

These are real and should not be traded away by any of the recommendations below.

1. **The GraphQL contract is genuinely shared and typed.** Code-first NestJS →
   `apps/api/src/graphql/schema.gql` (3,446 lines) → GraphQL Code Generator →
   `apps/front/src/lib/graphql/generated.ts` (6,640 lines, 1,011 types, 75
   enums). This is the single biggest reason the expected type duplication is
   absent.
2. **Frontend types compose, rather than copy, the generated ones.** Examples:
   `apps/front/src/types/hooks.types.ts:20` —
   `export type TWishlistContentTypeFilter = "ALL" | API.ContentType;`
   `apps/front/src/types/professional-dashboard.types.ts:128` —
   `export type TPduActivityType = "ALL" | API.PduSource;`
3. **Zero cross-application imports.** No file in `apps/front/src` imports from
   `apps/api`, and no file in `apps/api/src` imports from `apps/front`.
4. **Database entities never reach the browser.** `@prisma/client` has zero
   references in `apps/front/src`.
5. **The backend carries no frontend runtime.** No `react`, `next`, or JSX
   imports in `apps/api/src` — despite `@heroicons/react` being declared as a
   dependency (see D-8).
6. **The API's 17 modules follow one consistent internal structure**, which is
   the precondition for extracting anything later.
7. **Turborepo's local cache is already paying for itself** — 3m42s cold vs 37s
   warm is an 83% reduction.
8. **The lint and type-check gates are real and green.** Both were repaired in
   `8f66b6e`; the project's own notes have not caught up.
9. **269 tests pass** (API 157/17 suites, frontend 112/11 files).
10. **One canonical error formatter.** `apps/api/src/common/utils/graphql-error-formatter.ts`
    strips stack traces and publishes a domain code, giving the frontend a single
    predictable error envelope.

---

## Current Problems

Ordered by consequence, not by category.

| # | Problem | Consequence |
| --- | --- | --- |
| P-1 | Workspace glob is `apps/*`; no `packages/` can exist | Nothing can be shared. Blocks MONO-02 … MONO-16 |
| P-2 | 169 backend error codes are invisible to the frontend; 25 re-typed as literals | Renaming a code silently breaks the UI; no compile-time check |
| P-3 | Jest resolves 10 of 26 path aliases; 130 files use the other 16 | 10 of 17 backend modules cannot be unit tested. **Proven** |
| P-4 | `ACCESS_TOKEN_COOKIE_NAME` honoured on write, ignored on read | Setting the variable breaks all authentication. **Live defect** |
| P-5 | No `.github/`, no CI of any kind | Nothing is verified on push; the green baseline is a local accident |
| P-6 | `apps/api/.env.production` is tracked in git | Placeholder values today; the gitignore gap is the risk |
| P-7 | `test` is not a Turbo task; root `npm test` does not exist | 269 tests never run in the pipeline |
| P-8 | Upload rules duplicated 4× across both apps | Frontend and backend limits can silently diverge |
| P-9 | 14 unused dependencies declared (8 API, 6 frontend) | Install weight, audit noise, false signal about the stack |
| P-10 | `@graphql-codegen/typed-document-node` used but undeclared | Phantom dependency; a hoist change breaks codegen |
| P-11 | Codegen reads a live URL, not the committed schema | Codegen needs a running API + database; cannot run in CI |
| P-12 | `slugify` duplicated 6× in `apps/api` | Divergence risk on a value that becomes a public URL |
| P-13 | Path aliases restated in 3 places (tsconfig, jest, vitest) | Guaranteed drift; already drifted (P-3) |
| P-14 | 7 tsconfig aliases declared but unused; `@types/*` shadows the npm scope | Dead config plus a resolution hazard |
| P-15 | `.env.example` documents 10 of 48 keys; no frontend example at all | New-developer setup is undocumented |
| P-16 | Root `README.md` is UTF-16LE mojibake describing pnpm and a `packages/` layout that never existed | Actively misleading |
| P-16b | 25 Turbo cache/daemon logs tracked in git despite `.gitignore` covering them | Phantom diffs on every build; trains people to ignore `git status` |
| P-17 | `test:e2e` points at `apps/api/test`, which has never existed | Broken script |
| P-18 | 5 shared dependencies drift between apps (`@types/node` ^20 vs ^22) | Two TypeScript projects compiling against different Node typings |

---

## Code Duplication Findings

Every finding below carries exact paths. Findings are labelled `D-n`.

### D-1 — `slugify` implemented six times in `apps/api`

```text
apps/api/src/common/utils/seed-helpers.ts:3               export const slugify   (exported, canonical)
apps/api/src/modules/course/services/course.service.ts:432          private slugify
apps/api/src/modules/course/services/course-import.service.ts:423   private slugify
apps/api/src/modules/events/services/event.service.ts:533           private slugify
apps/api/src/modules/podcast/services/podcast.service.ts:427        private slugify
apps/api/src/modules/youtube/services/youtbue.service.ts:443        private slugify
```

Five of the six are byte-for-byte identical:

```ts
value.toLowerCase().trim()
  .replace(/['"]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
```

`course-import.service.ts:423` differs only by throwing
`InternalServerErrorException` on an empty result. The exported canonical version
in `seed-helpers.ts` is imported by none of them. Slugs become public URLs, so a
future fix applied to one copy and not the others produces divergent,
already-indexed URLs.

*(The filename `youtbue.service.ts` is a typo in the repository, reproduced here
verbatim.)*

### D-2 — `trimToNull` duplicated across two "helper" files in the same app

```text
apps/api/src/common/utils/functions-helper.ts:1                     export const trimToNull
apps/api/src/modules/professional/utils/function-helper.ts:4        export const trimToNull
```

Byte-identical. The two files differ by one character in their names
(`functions-helper` vs `function-helper`), which is how the second came to exist.
`apps/api/src/modules/professional/dtos/create-certificate.input.ts:3` imports
the feature-local one.

### D-3 — File-upload rules written out four times

The same five-entry MIME allowlist, the same `MAX_*_FILES = 5`, and the same
`20 * 1024 * 1024` byte cap appear in four independent files, two per
application:

```text
apps/api/src/modules/professional/enums/pdu-file.constant.ts:3-4,8-19
apps/api/src/modules/professional/enums/certificate-file.constant.ts:3-4,12-23
apps/front/src/utils/pdu.constant.ts:118-131
apps/front/src/utils/certificate.constant.ts:3-14
```

The allowlist in all four:

```text
application/pdf, image/jpeg, image/png, application/msword,
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

The two backend copies additionally carry an extension map for MIME/extension
pairing; the two frontend copies carry a matching
`".pdf,.jpg,.jpeg,.png,.doc,.docx"` accept attribute. Values agree **today**.
Nothing enforces that they continue to. Because upload runs over multipart REST
rather than GraphQL, codegen cannot cover this surface — this is the largest
contract gap the generated schema leaves open.

### D-4 — REST route paths hardcoded on both sides

```text
apps/api/src/modules/professional/controllers/professional-certificate-file.controller.ts:19
    @Controller("professional/certificates")
apps/api/src/modules/professional/controllers/professional-pdu-file.controller.ts:19
    @Controller("professional/pdu-activities")

apps/front/src/utils/certificate.constant.ts:22,27
    `${PDU_API_ORIGIN}/professional/certificates/...`
apps/front/src/utils/pdu.constant.ts:176,179
    `${PDU_API_ORIGIN}/professional/pdu-activities/...`
```

The frontend also derives the REST origin by regex-stripping the GraphQL path:

```ts
// apps/front/src/utils/pdu.constant.ts:173
export const PDU_API_ORIGIN = graphqlUrl.replace(/\/graphql\/?$/, "");
```

This silently assumes REST and GraphQL are always co-hosted and that the GraphQL
URL always ends in `/graphql`.

### D-5 — 25 error codes duplicated as untyped string literals across the boundary

The backend defines **169 distinct codes** across nine files:

```text
apps/api/src/modules/auth/enums/message-code.enum.ts             50 codes
apps/api/src/modules/professional/enums/message-code.enum.ts     47
apps/api/src/modules/admin/enums/message-code.enum.ts            16
apps/api/src/modules/events/enums/message-code.enum.ts           13
apps/api/src/modules/podcast/enums/message-code.enum.ts          12
apps/api/src/modules/provider/enums/message-code.enum.ts         12
apps/api/src/modules/youtube/enums/message-code.enum.ts          12
apps/api/src/modules/course/enums/message-code.enum.ts           10
apps/api/src/modules/external-learning/enums/message-code.enum.ts 2
```

None appear in `schema.gql` or `generated.ts` — verified, zero matches for
`MessageCode`, `CPD_PLAN_DUPLICATE`, or `ACTIVATION_TOKEN_EXPIRED` in either
generated artifact. The frontend nonetheless branches on 25 of them as bare
literals:

```text
ACTIVATION_TOKEN_EXPIRED    ACTIVATION_TOKEN_INVALID   ACTIVATION_TOKEN_USED
CPD_PLAN_DUPLICATE          FORBIDDEN                  GOOGLE_EMAIL_NOT_FOUND
GOOGLE_EMAIL_NOT_VERIFIED   GOOGLE_OAUTH_ROLE_NOT_ALLOWED
GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE               INVALID_ROLE
LINKEDIN_ACCOUNT_CONFLICT   LINKEDIN_EMAIL_NOT_FOUND   LINKEDIN_EMAIL_NOT_VERIFIED
LINKEDIN_OAUTH_ROLE_NOT_ALLOWED                        LINKEDIN_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE
OAUTH_ACCESS_DENIED         OAUTH_INVALID_STATE        OAUTH_LOGIN_FAILED
OTP_ATTEMPTS_EXCEEDED       OTP_EXPIRED                OTP_INVALID
OTP_RESEND_TOO_SOON         PASSWORD_TOO_OBVIOUS       UNAUTHORIZED
USER_DISABLED
```

`apps/front/src/utils/auth-error.ts:3-8` even declares a `TAuthErrorCode` union
of four of them and then widens it with `| string`, which erases the check it
was written to provide.

### D-6 — The HTTP-status ↔ Apollo-code map is maintained as two hand-written inverses, and they already disagree

```ts
// apps/api/src/common/utils/graphql-error-formatter.ts:5-13
const APOLLO_CODE_BY_STATUS: Record<number, string> = {
  400: "BAD_REQUEST",  401: "UNAUTHENTICATED", 403: "FORBIDDEN",
  404: "NOT_FOUND",    409: "CONFLICT",        422: "UNPROCESSABLE_ENTITY",
  429: "TOO_MANY_REQUESTS",
};
```

```ts
// apps/front/src/lib/rtk/graphqlBaseQuery.ts:17-21
if (code === "UNAUTHENTICATED" || code === "UNAUTHORIZED") return 401;
if (code === "FORBIDDEN")      return 403;
if (code === "BAD_USER_INPUT") return 400;
if (code === "NOT_FOUND")      return 404;
```

Two concrete mismatches:

- The backend emits **`BAD_REQUEST`** for 400; the frontend maps **`BAD_USER_INPUT`**.
- The frontend handles **`UNAUTHORIZED`**, which the backend never emits.

Neither is fatal today — `originalError.statusCode` is checked first and wins —
but the fallback path these lines exist to serve is wrong in both directions, and
`CONFLICT`, `UNPROCESSABLE_ENTITY` and `TOO_MANY_REQUESTS` are unhandled.

### D-7 — The auth cookie name is duplicated, and the two copies behave differently

```ts
// apps/api/src/common/utils/cookie-extractor.ts:5   (used by jwt.strategy.ts:19)
return req.cookies["access_token"] ?? null;
```

```ts
// apps/api/src/modules/auth/services/auth-session.service.ts:252-253, 296-297
this.config.get("ACCESS_TOKEN_COOKIE_NAME", "access_token")
```

```ts
// apps/front/proxy.ts:5-6
const ACCESS_TOKEN_COOKIE_NAME =
  process.env.ACCESS_TOKEN_COOKIE_NAME ?? "access_token";
```

`ACCESS_TOKEN_COOKIE_NAME` is an advertised configuration key — it appears in
`apps/api/.env.production`. Setting it to any non-default value causes the API to
write a cookie under the configured name and then read a cookie under the
hardcoded one. **Authentication would fail entirely.** This is a live defect,
found while auditing constant duplication.

The refresh cookie has the same shape at `apps/api/src/modules/auth/resolvers/auth.resolver.ts:113`.

### D-8 — Role literals restated instead of using the generated `Role` enum

```ts
// apps/front/proxy.ts:8-25
const ROLE_ROUTES = [
  { prefix: "/dashboard/professional", roles: ["PROFESSIONAL"] },
  { prefix: "/dashboard/provider",     roles: ["PROVIDER"] },
  { prefix: "/dashboard/organization", roles: ["ORGANIZATION"] },
  { prefix: "/dashboard/admin",        roles: ["ADMIN"] },
] as const;
```

`Role` is generated and available (`apps/front/src/lib/graphql/generated.ts`), and
is used correctly elsewhere — `apps/front/src/utils/function-helper.ts:14`,
`apps/front/src/utils/constant.ts:5`, `apps/front/src/utils/oauth.constant.ts:71`.
`proxy.ts` is the authorization middleware, which makes it the worst file in the
codebase to hold unchecked literals. Same pattern in
`apps/front/src/components/modules/OrgDashboard/parts/org-assignment-form.tsx`
and `org-event-assign-form.tsx`.

### D-9 — Validation limits duplicated between Zod and class-validator

| Field | Frontend | Backend |
| --- | --- | --- |
| `title` max | `CERTIFICATE_TITLE_MAX = 200` (`apps/front/src/utils/certificate.constant.ts:17`) | `@MaxLength(200)` (`create-certificate.input.ts:12`) |
| `issuer` max | `CERTIFICATE_ISSUER_MAX = 200` (`:18`) | `@MaxLength(200)` (`:18`) |
| `certificateNumber` max | `CERTIFICATE_NUMBER_MAX = 120` (`:19`) | `@MaxLength(120)` (`:25`) |

Files: `apps/front/src/lib/validations/certificate.schema.ts` and
`apps/api/src/modules/professional/dtos/create-certificate.input.ts`. The
frontend at least names its constants; the backend inlines the numbers. Values
agree today.

> **Correction, 2026-07-27.** This finding originally claimed the cross-field
> rule `validUntil >= issueDate` existed only on the frontend and that the
> backend was missing it. **That was wrong.** The rule is enforced in
> `apps/api/src/modules/professional/services/professional-certificate.service.ts:53`,
> which throws `CERTIFICATE_EXPIRY_BEFORE_ISSUE`. The audit inspected
> `create-certificate.input.ts`, saw only `@IsDateString()`, and did not check
> the service. There is no validation gap.
>
> The duplication in the table above was real: the rule was implemented twice,
> once in Zod and once in the service. Both now call
> `isExpiryOnOrAfterIssue` from the shared contract.

### D-10 — Path aliases restated in three places, already drifted

| Source | Alias count |
| --- | --- |
| `apps/api/tsconfig.json:26-55` | 26 |
| `apps/api/package.json:117-128` (Jest `moduleNameMapper`) | 10 |
| `apps/front/tsconfig.json:21-36` | 14 |
| `apps/front/vitest.config.mjs:5-21` | 14 |

The frontend pair is in sync — and the vitest file says so in a comment
("Mirrors the tsconfig path aliases"), which is an admission that the
duplication is known and manual. The backend pair is **not** in sync; see D-11.

### D-11 — Jest cannot resolve 16 of 26 API path aliases (proven)

Unmapped in `moduleNameMapper`, with the number of source files importing
through each:

```text
@provider       21 files      @user            15 files
@course         17            @podcast         15
@contentAction  16            @youtube         15
@events         14            @ext             10
@landing         6            @app              1
@config @dto @enums @guards @entities @decorators     0 files (declared, unused)
```

**130 source files** across **10 of the 17 backend modules** import through an
alias Jest cannot resolve. Any spec that touches them — directly or transitively
— fails to run.

Verified rather than assumed. A temporary spec was written at
`apps/api/src/modules/course/services/__alias-probe.spec.ts`:

```ts
import { CourseService } from "@course/services/course.service";
```

Result:

```text
FAIL src/modules/course/services/__alias-probe.spec.ts
  ● Test suite failed to run
    Cannot find module '@course/services/course.service'
      from 'modules/course/services/__alias-probe.spec.ts'
```

The same import type-checks cleanly under `tsc`, so the failure is Jest-only.
**The probe file was deleted immediately after the run; the working tree is
clean.** This is the one small non-destructive change the audit made, taken under
the specification's allowance for demonstrating a finding.

The seven zero-usage aliases are dead configuration. `@types/*` is worse than
dead: declared in both apps' tsconfigs and in the Jest mapper, used by no file,
and it **shadows the npm `@types/` scope**.

### D-12 — Test-runner configuration duplicated and divergent

`apps/front/vitest.config.mjs` (Vitest 2, jsdom) and the inline Jest block at
`apps/api/package.json:101-134` (Jest 29, ts-jest, node) share no configuration
and cannot. Both restate their app's aliases. `apps/api/package.json:21` declares
`"test:e2e": "jest --config ./test/jest-e2e.json"` and **`apps/api/test` has
never existed** — confirmed by running it.

### D-13 — Duplicated and unused dependencies

**Declared in `apps/api/package.json` with zero references in `apps/api/src` or `apps/api/prisma`:**

```text
@heroicons/react        @tanstack/react-query    @nestjs/swagger
@prisma/adapter-pg      @sendgrid/mail           stripe
puppeteer               googleapis
```

Two of these are frontend libraries sitting in a backend package.
`@prisma/adapter-pg` is the version-conflict risk `context/project-overview.md`
already flags (adapter 7 alongside Prisma 6) — and it is not imported anywhere,
so the risk is being carried for nothing.

**Declared in `apps/front/package.json` with zero references in `apps/front/src`:**

```text
html2canvas    reactflow    @tanstack/react-query    jspdf    graphql-tag
```

`dotenv` has no `src` references either but *is* used by
`apps/front/codegen.ts:2`; it belongs in `devDependencies`, not `dependencies`.

`@tanstack/react-query` is declared in **both** applications and used in
**neither** — no `QueryClient`, no `react-query` import anywhere, and
`apps/front/src/providers/app-provider.tsx` wires only Theme and Language. The
claim in `context/current-feature.md` that "TanStack Query is installed and
provider-wired" is stale.

### D-14 — Version drift on shared dependencies

| Package | `apps/front` | `apps/api` |
| --- | --- | --- |
| `@types/node` | `^20` | `^22.19.17` |
| `typescript` | `^5` | `^5.7.3` |
| `graphql` | `^16.13.2` | `^16.11.0` |
| `eslint` | `^9` | `^9.18.0` |
| `@eslint/eslintrc` | `^3` | `^3.2.0` |

`@types/node` is the one that matters: two TypeScript projects in one repo
compiling against different Node type definitions. The frontend's bare `^5` /
`^9` / `^3` ranges also mean the two apps can silently resolve to different
majors of the same toolchain after any `npm install`.

### D-15 — Phantom dependency: codegen's third plugin is undeclared

`apps/front/codegen.ts:11` requests three plugins:

```ts
plugins: ["typescript", "typescript-operations", "typed-document-node"],
```

`apps/front/package.json` declares `@graphql-codegen/typescript` and
`@graphql-codegen/typescript-operations`. It does **not** declare
`@graphql-codegen/typed-document-node`. The package resolves only because npm
hoisted it to the root `node_modules/@graphql-codegen/typed-document-node` as a
transitive dependency of `@graphql-codegen/cli`. A dedupe, a CLI upgrade, or a
stricter installer breaks `npm run codegen` with no source change.

### D-16 — Codegen reads a live server instead of the committed schema

```ts
// apps/front/codegen.ts:7
schema: process.env.NEXT_PUBLIC_GRAPHQL_URL || "",
```

`apps/api/src/graphql/schema.gql` is generated *and committed* — it is tracked in
git — yet `apps/front` never references it. Nothing in the frontend mentions
`schema.gql`. Consequences: codegen requires a running API with a reachable
database; it cannot run in CI; it cannot be a cached Turbo task; and it can
silently generate against a *stale deployed* schema if the environment variable
points somewhere other than local. This is the clearest example of the repository
being a monorepo in layout while behaving like two separate repositories.

### D-17 — 25 Turbo cache and daemon logs are tracked in git

```text
$ git ls-files | grep "\.turbo" | wc -l
25
```

Including `.turbo/cookies/1.cookie`, `.turbo/preferences/tui.json`,
`apps/front/.turbo/turbo-lint.log`, and 22 daemon logs dated from 2025-07-06
through 2026-07-23.

The root `.gitignore` explicitly lists both `.turbo/` and `**/.turbo/` with the
comment *"Turborepo daemon logs and local cache (build output, not source)"*.
The intent is correct — but **git ignores `.gitignore` for files that are already
tracked**, so the pattern has no effect on any of these 25.

This is the same root cause as the tracked `apps/api/.env.production` recorded
under **P-6** and addressed by **MONO-12**: an ignore rule added after the file
was already committed. It surfaced during this audit because running
`npm run lint` modified `apps/front/.turbo/turbo-lint.log`, producing a spurious
working-tree change. That file was restored with `git checkout` and the tree is
clean.

Consequences are small — 16 KB total, and daemon logs contain no secrets, though
they do contain absolute local paths and machine identifiers. The real cost is
that every developer's build produces phantom diffs in files nobody intends to
change, which trains people to ignore `git status`.

Remediation is folded into MONO-12, which already handles the untrack-a-tracked-
file case.

---

## Dependency Findings

### Direction and cycles

- **Circular dependencies between packages:** none possible — there is one
  package per app and no internal packages.
- **Invalid dependency direction:** none — no low-level code depends on an app,
  because no low-level code exists.
- **Direct cross-application imports:** **none.** Verified by search across both
  `src` trees.
- **Database leakage into the frontend:** **none.** Zero `@prisma/client` imports
  in `apps/front/src`.
- **Framework leakage into the backend:** **none in code**, but present in
  `package.json` — see D-13.
- **Undeclared transitive dependencies:** one confirmed (D-15).

### Boundary enforcement

There is no enforcement mechanism. `apps/front/eslint.config.mjs` extends
`next/core-web-vitals` and `next/typescript`; `apps/api/eslint.config.mjs` uses
`typescript-eslint` recommended plus Prettier. Neither configures
`no-restricted-imports`, `eslint-plugin-boundaries`, or an import-graph rule. The
clean boundary today is the product of discipline, not tooling — which is fine
with two apps and will not survive the first shared package.

### Analysis tooling

No `dependency-cruiser`, `madge`, or equivalent is installed. **This audit does
not recommend installing one.** With two applications and zero internal packages
the import graph is trivially small, and every question such a tool would answer
was answered here with `grep`. The recommendation is deferred to MONO-08, where
ESLint boundary rules become worthwhile *only after* `packages/*` exists and
there is an actual direction to violate.

---

## API Contract Approach: Options Compared

The specification asks for an explicit comparison of contract mechanisms and a
single recommendation. The comparison matters here because the repository already
has a working one, and the temptation with a monorepo audit is to recommend
replacing it.

**Current mechanism:** code-first NestJS/Apollo → committed
`apps/api/src/graphql/schema.gql` → GraphQL Code Generator →
`apps/front/src/lib/graphql/generated.ts` (1,011 types, 75 enums) → RTK Query
endpoints with typed document nodes.

| Approach | Verdict for this repository |
| --- | --- |
| **Keep GraphQL codegen, add a narrow shared contract package** | **Recommended** |
| Zod-based contracts | Partially — limits only (MONO-14) |
| ts-rest | Rejected |
| OpenAPI-generated client | Rejected, revisit if REST grows |
| tRPC | Rejected |
| Manual DTO sharing | Rejected on principle |

### Why each was rejected

**tRPC.** It requires the backend to expose TypeScript RPC procedures. Adopting
it means deleting the GraphQL layer — 95 `.entity.ts` files, 109 `.input.ts`
files, a 3,446-line schema, and every resolver — and rewriting the frontend's
entire RTK Query layer. It also removes the schema artifact entirely: the
contract becomes an implicit TypeScript inference across the boundary, which
works only while both sides are one TypeScript codebase. The specification's own
"Scope Control" forbids changing the application framework, and this is that
change wearing a different hat.

**ts-rest.** REST-first. This API is GraphQL-first with exactly two REST
controllers (`professional/certificates`, `professional/pdu-activities`) plus
auth and course-import. Adopting ts-rest means either migrating GraphQL to REST —
a rewrite — or using it for those two controllers only. The second is the
interesting case, because those controllers *are* where the real contract gap
lives (finding D-3). But four multipart endpoints do not justify a new dependency
and a second contract paradigm; shared constants and path builders (MONO-03)
close the same gap with no new runtime.

**OpenAPI-generated client.** `@nestjs/swagger` is already a declared dependency —
and, per D-13, entirely unused. Generating OpenAPI for the REST surface is
therefore *cheaper here than usual*, which is why it deserves a real look rather
than a dismissal. It still loses: the surface is four endpoints, all multipart
upload, which is the case OpenAPI client generators handle worst. It would add a
second codegen pipeline alongside the GraphQL one for a handful of routes.
**Revisit this if the REST surface grows past roughly a dozen endpoints or gains
non-upload JSON routes** — at that point the calculus flips.

**Manual DTO sharing.** Exporting `apps/api`'s `.input.ts` and `.entity.ts`
classes to the frontend would directly violate the specification's rule that
"type sharing must not expose database entities or private backend models" — and
the project's own standard against exposing Prisma records. It would also drag
`class-validator` and `@nestjs/graphql` decorators into the browser bundle.
Rejected outright.

**Zod-based contracts, partially.** The frontend already uses Zod 4 and the
backend uses `class-validator`. Sharing whole schemas fails because NestJS DTOs
need decorators for **GraphQL schema generation**, not merely validation — so a
Zod-derived DTO would still require a hand-written `@InputType` twin, trading one
duplication for a more complex one. What *can* be shared is the numeric limits
and cross-field predicates, which is exactly MONO-14's scope.

### Why the recommendation is "keep and supplement"

The generated GraphQL contract already does the hard part, and does it well —
it is the reason this audit found almost none of the type duplication it went
looking for. Replacing it would be a large migration to reach a position the
repository already occupies.

What it does **not** cover is everything outside the schema:

| Uncovered surface | Finding | Opportunity |
| --- | --- | --- |
| Error codes | D-5 | MONO-02 |
| Upload rules and REST paths | D-3, D-4 | MONO-03 |
| Auth cookie names and roles | D-7, D-8 | MONO-04 |
| Validation limits | D-9 | MONO-14 |

A single small `packages/api-contracts` covers all four. That is the
recommendation: **one additional shared package, no framework change, no second
codegen pipeline.**

One improvement to the existing mechanism is worth making regardless, and it is
independent of any package: codegen currently reads a live server URL rather than
the committed schema file (D-16, MONO-05).

---

## Monorepo Opportunities

### MONO-01: Enable a `packages/*` workspace and scaffold the first shared package

#### Current State

`package.json:13-15` declares `"workspaces": ["apps/*"]`. No `packages/`
directory exists. Turborepo reports exactly two packages: `api`, `front`.

#### Evidence

```json
// package.json:13-15
"workspaces": [
  "apps/*"
],
```

```text
$ ls packages
(no packages dir)

$ npx turbo run build --dry=json
packages: ["api","front"]
```

#### Problem

No shared code can exist. A directory created at `packages/anything` would not be
symlinked into `node_modules` and could not be imported by either app. This
single line blocks MONO-02 through MONO-05 and MONO-11 outright.

Because `dependsOn: ["^build"]` currently resolves to nothing, the first shared
package will also be the first real test of the Turbo task graph — which is a
reason to do it once, deliberately, rather than as a side effect of a larger
feature.

#### Recommendation

Change the glob to `["apps/*", "packages/*"]`. Create exactly **one** package as
the pattern-setter, with a real consumer so the wiring is proven end to end.
Recommended first package: `@loopskey/api-contracts` carrying the error codes
from MONO-02, because it is pure TypeScript, has no runtime dependencies, and is
consumed by both apps.

Decisions to settle once, here, and then follow everywhere:

- **Scope name** — `@loopskey/*` recommended.
- **Build strategy** — for pure-TypeScript packages consumed by a bundler and by
  `ts-jest`, publish TypeScript source via the `exports` field and skip the build
  step entirely. No `tsup`, no `dist`, no `dependsOn: ["^build"]` complexity.
  Revisit only if a package ever needs to ship compiled output.
- **Versioning** — `"version": "0.0.0"` and `"private": true`; reference as
  `"@loopskey/api-contracts": "*"`. These are never published.

#### Proposed Packages

```text
packages/api-contracts/
├── package.json     private, "*" version, exports "./src/index.ts"
├── tsconfig.json
└── src/index.ts
```

#### Affected Applications

`apps/api`, `apps/front`, root `package.json`, `turbo.json`.

#### Benefits

- Unblocks every code-sharing recommendation in this report.
- Establishes the conventions once, cheaply, before five features need them.
- Gives the Turbo graph its first real edge, so `dependsOn: ["^build"]` and
  `--affected` start doing something.

#### Risks

- A wrong build-strategy choice is expensive to reverse once several packages
  exist. Mitigated by starting with source-only exports, the simplest option.
- `ts-jest` and Next's bundler must both resolve the workspace symlink. Both do
  by default, but this must be verified in the same feature rather than assumed.

#### Prerequisites

None. This is the entry point.

#### Impact

**4** — no direct user-visible change, but it is the gate on everything else.

#### Effort

**1** — one glob edit plus a three-file package.

#### Risk Level

**1** — additive; existing apps are untouched if the package has no importers yet.

#### Priority

**Critical**

#### Suggested Feature

`context/features/monorepo-workspace-foundation.md`

---

### MONO-02: Shared API error-code contract

#### Current State

169 distinct error codes live in nine backend `message-code.enum.ts` files. None
reach the GraphQL schema. The frontend branches on 25 of them as bare string
literals.

#### Evidence

See **D-5** in full. Key points:

- `apps/api/src/modules/auth/enums/message-code.enum.ts` — 50 codes;
  `apps/api/src/modules/professional/enums/message-code.enum.ts` — 47; seven more
  files totalling 72.
- Zero matches for `MessageCode`, `CPD_PLAN_DUPLICATE`, or
  `ACTIVATION_TOKEN_EXPIRED` in `apps/api/src/graphql/schema.gql` or
  `apps/front/src/lib/graphql/generated.ts`.
- `apps/front/src/utils/auth-error.ts:3-8` declares a four-member union and then
  widens it with `| string`.
- The `current-feature.md` history already records this class of breakage: a
  Phase 7 fix had to pin `useCpdPduProgress`, which matches on the literal
  `CPD_PLAN_DUPLICATE`, with a regression test — because nothing else could
  catch a rename.

#### Problem

The error code is a genuine part of the public API contract — the frontend routes
users to different screens based on it — but it is the one part of the contract
with no type safety at all. Renaming `ACTIVATION_TOKEN_EXPIRED` in the backend
compiles cleanly, passes all 269 tests, and silently drops the user on a generic
error page instead of the resend form.

#### Recommendation

Move the error-code enums into `packages/api-contracts` as `as const` objects
with derived union types. Have `apps/api` import them in place of its local enums
and `apps/front` import them in place of its literals. The backend keeps full
authority over which code it throws; the package only fixes the vocabulary.

Do **not** attempt to expose them through the GraphQL schema — they are not a
data type, they are an error vocabulary, and modelling them as a GraphQL enum
would force every mutation payload to reference them.

Migrate in slices, one module's codes at a time, starting with `auth` (50 codes,
and the source of 22 of the 25 frontend literals).

#### Proposed Packages

```text
packages/api-contracts/src/error-codes/
├── auth.ts            ├── professional.ts    ├── admin.ts
├── course.ts          ├── events.ts          ├── podcast.ts
├── provider.ts        ├── youtube.ts         ├── external-learning.ts
└── index.ts
```

#### Affected Applications

`apps/api` (9 enum files plus every service that throws), `apps/front`
(`utils/auth-error.ts`, `hooks/useOrganizationActivation.ts`,
`hooks/useCpdPduProgress.ts`, OAuth hooks).

#### Benefits

- A renamed code becomes a compile error in both apps.
- The 25 literals collapse to typed references.
- Exhaustive `switch` handling over a code union becomes possible.
- `| string` widening in `auth-error.ts` can be removed.

#### Risks

- Touching nine backend modules is broad. Mitigated by slicing per module — each
  slice is independently shippable and independently revertible.
- Over-sharing: only the *code strings* belong in the package. Messages,
  HTTP-status mapping, and i18n keys must stay in their respective apps, or the
  package becomes a second place to make product decisions.

#### Prerequisites

MONO-01.

#### Impact

**5** — the largest correctness gap the audit found.

#### Effort

**3** — mechanical but wide; 169 codes across 9 modules.

#### Risk Level

**2** — pure renaming of references; the compiler catches mistakes.

#### Priority

**High**

#### Suggested Feature

`context/features/shared-api-error-contract.md`

---

### MONO-03: Shared upload and REST-surface contract

#### Current State

Upload limits are written four times (twice per app) and REST route strings twice
more. The frontend derives the REST origin by regex-stripping `/graphql`.

#### Evidence

See **D-3** and **D-4**. Four files:
`apps/api/src/modules/professional/enums/pdu-file.constant.ts:3-19`,
`apps/api/src/modules/professional/enums/certificate-file.constant.ts:3-23`,
`apps/front/src/utils/pdu.constant.ts:118-131,173-179`,
`apps/front/src/utils/certificate.constant.ts:3-14,22-27`.

#### Problem

Multipart upload is the one production surface the GraphQL contract does not
cover, so it is the one surface where frontend and backend rules can diverge
without any generated artifact noticing. If the backend widens the MIME
allowlist, the frontend's Zod schema silently keeps rejecting the new type; if
the frontend widens it, users hit a server 400 after a full upload.

The `PDU_API_ORIGIN` regex is a related fragility — it hardcodes the assumption
that REST and GraphQL are co-hosted and that the GraphQL URL ends in `/graphql`.

#### Recommendation

Add an `upload/` module to `packages/api-contracts` holding the MIME allowlist,
extension map, file-count cap, byte cap, and the REST path builders. Both apps
import it. Keep the derived shapes each side needs (the backend's
`Record<mime, ext[]>` pairing map, the frontend's `accept` attribute string) as
functions *computed from* the shared allowlist rather than as separate literals.

The backend must keep validating independently — the shared package supplies the
values, not the enforcement.

#### Proposed Packages

```text
packages/api-contracts/src/upload/
├── mime.ts       allowlist + extension map + accept-attribute derivation
├── limits.ts     MAX_FILES, MAX_FILE_SIZE_BYTES
└── routes.ts     path builders for pdu-activities and certificates
```

#### Affected Applications

`apps/api` (2 constant files, 2 controllers, 2 services), `apps/front`
(2 constant files, `certificate.schema.ts`, evidence upload/download hooks).

#### Benefits

- One place to change an upload rule.
- Rejects the "frontend allows what the backend refuses" class of bug outright.
- REST paths become typed builders instead of template strings in two repos'
  worth of files.

#### Risks

- PDU and certificate limits are identical today but are conceptually separate
  policies. Share the *defaults* and let each domain name its own constants from
  them, rather than forcing one symbol on both — otherwise a future decision to
  allow larger certificates becomes a breaking change to PDU.

#### Prerequisites

MONO-01.

#### Impact

**4**

#### Effort

**2**

#### Risk Level

**2**

#### Priority

**High**

#### Suggested Feature

`context/features/shared-upload-contract.md`

---

### MONO-04: Shared auth constants, and fix the cookie-name divergence

#### Current State

`"access_token"` is hardcoded in three places across both apps. One of them
ignores the environment variable the others honour. Role strings are restated as
literals in the frontend's authorization middleware.

#### Evidence

See **D-7** and **D-8**.

```ts
// apps/api/src/common/utils/cookie-extractor.ts:5  — ignores the env var
return req.cookies["access_token"] ?? null;

// apps/api/src/modules/auth/services/auth-session.service.ts:252-253 — honours it
this.config.get("ACCESS_TOKEN_COOKIE_NAME", "access_token")
```

`ACCESS_TOKEN_COOKIE_NAME` is a documented key present in
`apps/api/.env.production`.

#### Problem

This is not a tidiness issue. `cookie-extractor` is wired into
`jwt.strategy.ts:19`, which is the entry point for every authenticated request.
Setting `ACCESS_TOKEN_COOKIE_NAME` to a non-default value makes the API write
under one name and read under another — **every authenticated request would fail
with 401**, in an environment-specific way that never reproduces locally.

Separately, `apps/front/proxy.ts` — the file that decides which role may reach
which dashboard — matches on `"PROFESSIONAL"` / `"PROVIDER"` / `"ORGANIZATION"` /
`"ADMIN"` string literals while the generated `Role` enum sits unused two imports
away.

#### Recommendation

Two parts, both small:

1. **Fix the defect first, in `apps/api`, independently of any package work.**
   `cookieExtractor` must read the configured name. This is a
   handful of lines and should not wait on MONO-01.
2. Add `packages/api-contracts/src/auth/` holding the cookie-name defaults and
   re-exporting the role vocabulary, and have `proxy.ts` use `Role` instead of
   literals.

#### Proposed Packages

```text
packages/api-contracts/src/auth/
├── cookies.ts    ACCESS_TOKEN_COOKIE_DEFAULT, REFRESH_TOKEN_COOKIE_DEFAULT
└── roles.ts      role vocabulary shared by proxy.ts and the API guards
```

#### Affected Applications

`apps/api` (`common/utils/cookie-extractor.ts`, `auth/strategies/jwt.strategy.ts`,
`auth/resolvers/auth.resolver.ts:113`), `apps/front` (`proxy.ts`, two OrgDashboard
form components).

#### Benefits

- Removes a real authentication defect.
- The authorization middleware gains compile-time role checking.
- A cookie-name change becomes a one-file change.

#### Risks

- Touching cookie handling touches every request. The fix must be verified
  against a live session — set `ACCESS_TOKEN_COOKIE_NAME` to a non-default value
  and confirm login, refresh, and logout all still work.
- `Role` currently originates from generated GraphQL output. Re-exporting it from
  a hand-written package risks two sources of truth; the package should
  re-export, not redefine.

#### Prerequisites

Part 1: none. Part 2: MONO-01.

#### Impact

**4** — contains a live defect.

#### Effort

**2**

#### Risk Level

**2** — low code volume, high blast radius; needs live verification.

#### Priority

**High**

#### Suggested Feature

`context/features/shared-auth-constants.md`

---

### MONO-05: Generate GraphQL types from the committed schema file

#### Current State

`apps/front/codegen.ts:7` points `schema` at `process.env.NEXT_PUBLIC_GRAPHQL_URL`
— a running server. The committed `apps/api/src/graphql/schema.gql` is never
referenced by the frontend.

#### Evidence

```ts
// apps/front/codegen.ts:7
schema: process.env.NEXT_PUBLIC_GRAPHQL_URL || "",
```

```text
$ git ls-files apps/api/src/graphql/
apps/api/src/graphql/schema.gql

$ grep -rn "schema.gql" apps/front --include=*.ts --include=*.mjs --include=*.json
(no reference — codegen uses the live URL)
```

Plus **D-15**: `typed-document-node` is requested at `codegen.ts:11` and declared
in no `package.json`.

#### Problem

Running `npm run codegen` requires a running API *and* a reachable database. The
history in `context/current-feature.md` shows this friction repeatedly — Phase 6
had to boot the API purely to regenerate the schema, and Phase 4 notes "re-ran
codegen against the live API".

Because the schema comes from a URL rather than a file, codegen cannot be a
cached Turbo task (nothing to hash), cannot run in CI, and can silently generate
against a *deployed* schema if the environment variable points remotely. The one
place where this repository's monorepo layout should pay off — one workspace
reading another's committed artifact — is exactly where it reaches for the
network instead.

#### Recommendation

Point `schema` at the sibling workspace file:

```ts
schema: "../api/src/graphql/schema.gql",
```

Then declare `codegen` as a Turbo task with `apps/api/src/graphql/schema.gql` as
a declared input, so it re-runs when and only when the schema changes. Add
`@graphql-codegen/typed-document-node` to `apps/front/devDependencies`, and move
`dotenv` from `dependencies` to `devDependencies` (it becomes unnecessary once
the URL is gone).

Optionally add a CI check that regenerating produces no diff, which catches a
`.graphql` document that was edited without re-running codegen.

#### Proposed Packages

None. This is a configuration change plus a `turbo.json` task.

#### Affected Applications

`apps/front` (`codegen.ts`, `package.json`), root `turbo.json`.

#### Benefits

- Codegen becomes hermetic: no server, no database, no network.
- Becomes cacheable and CI-runnable.
- Creates the first genuine `apps/front → apps/api` artifact dependency, which
  is what a monorepo is for.
- Removes the phantom dependency.

#### Risks

- The committed `schema.gql` must be kept current. It is generated on API boot,
  so a developer who changes a resolver and does not boot the API could commit a
  stale schema. The no-diff CI check is the mitigation and should ship with this.
- Creating a Turbo edge from `front` to `api` means `front#codegen` may need
  `api#build`. Keep the dependency on the *file*, not on the build, to avoid
  serialising the two builds unnecessarily.

#### Prerequisites

None.

#### Impact

**4**

#### Effort

**2**

#### Risk Level

**2**

#### Priority

**High**

#### Suggested Feature

`context/features/codegen-from-schema-file.md`

---

### MONO-06: Shared TypeScript configuration package

#### Current State

Two independent, unrelated `tsconfig.json` files. No `extends` anywhere. Seven
declared-but-unused aliases in the API config, one of which shadows an npm scope.

#### Evidence

`apps/front/tsconfig.json` — 14 aliases, `strict: true`, `target: ES2017`,
`moduleResolution: "bundler"`.
`apps/api/tsconfig.json` — 26 aliases, `strict: true` but
`strictPropertyInitialization: false`, `target: ES2021`, `module: commonjs`.

Aliases declared in `apps/api/tsconfig.json` with zero importing files:

```text
@config  @dto  @enums  @guards  @entities  @decorators  @types
```

`@types/*` is declared in **both** apps and shadows the npm `@types/` scope.

#### Problem

The two apps genuinely need different module systems, targets and libs, so a
single config is not the answer. But the settings that *should* be identical —
`strict`, `esModuleInterop`, `skipLibCheck`, `resolveJsonModule`,
`forceConsistentCasingInFileNames` — are maintained twice and can drift silently.
There is no shared base to hang a repo-wide decision on.

The `@types/*` alias is a latent hazard: any runtime `require("@types/...")`
resolves into `src/common/types`. Nothing does this today, and it is used by no
file, so it is pure downside.

#### Recommendation

Create `packages/typescript-config` exporting `base.json`, `nextjs.json`, and
`nestjs.json`. Each app's `tsconfig.json` extends the relevant one and keeps only
its `paths` and app-specific overrides. Delete the seven dead aliases and rename
`@types/*` to something that does not collide (`@apptypes/*`) or drop it, since
nothing uses it.

#### Proposed Packages

```text
packages/typescript-config/
├── base.json      strict, esModuleInterop, skipLibCheck, resolveJsonModule
├── nextjs.json    extends base — bundler resolution, jsx, DOM libs
└── nestjs.json    extends base — commonjs, decorators, ES2021
```

#### Affected Applications

`apps/api`, `apps/front`, plus every future package.

#### Benefits

- Compiler-strictness decisions made once.
- New packages inherit the house rules for free.
- Removes dead configuration and a resolution hazard.

#### Risks

- Extending a package config changes how relative paths inside it resolve;
  `paths` must stay in the app configs, not the base.
- Low value on its own with only two consumers — the payoff arrives with the
  third package. Sequence it after MONO-01 has created one.

#### Prerequisites

MONO-01.

#### Impact

**3**

#### Effort

**2**

#### Risk Level

**2**

#### Priority

**Medium**

#### Suggested Feature

`context/features/shared-typescript-config.md`

---

### MONO-07: One source of truth for path aliases, and repair Jest resolution

#### Current State

Aliases are restated in four places. The API's Jest mapper covers 10 of 26, and
130 source files import through the missing 16.

#### Evidence

See **D-10** and **D-11**, including the proven probe failure:

```text
Cannot find module '@course/services/course.service'
  from 'modules/course/services/__alias-probe.spec.ts'
```

Ten of seventeen backend modules — `course`, `events`, `podcast`, `youtube`,
`provider`, `user`, `landing`, `external-learning`, `content-interaction`, `app` —
are affected.

#### Problem

This is not a hypothetical. `context/current-feature.md` records that
"automated tests are sparse relative to the number of modules"; part of the
reason is that writing a test for the course module fails immediately with a
module-resolution error that looks like a broken import rather than a broken
config. The 10 mapped aliases are exactly the ones earlier phases needed, added
reactively one at a time.

#### Recommendation

Derive the Jest and Vitest mappings from the tsconfig `paths` instead of
restating them. On the API side, replace the hand-written `moduleNameMapper` with
`ts-jest`'s `pathsToModuleNameMapper(compilerOptions.paths)`. Move the Jest block
out of `package.json` into a `jest.config.ts` so it can read the tsconfig. On the
frontend, `vitest.config.mjs` can read the same source rather than mirroring it
by hand.

Delete the seven unused aliases first (MONO-06) so the derived mapping stays
small.

Ship with at least one new spec in a previously unreachable module — a `course`
service test — to prove the repair.

#### Proposed Packages

None. Configuration only.

#### Affected Applications

`apps/api` (`package.json` → new `jest.config.ts`), `apps/front`
(`vitest.config.mjs`).

#### Benefits

- Unblocks unit testing for 10 of 17 backend modules and 130 files.
- Removes an entire category of drift permanently.
- Makes the next test someone writes succeed instead of failing confusingly.

#### Risks

- `pathsToModuleNameMapper` needs the correct `prefix` for `rootDir: "src"`; a
  wrong prefix breaks *all* resolution rather than some. The existing 17 suites
  are the regression net and must be run before and after.
- The `@prisma/*` mapping is deliberately narrow — it maps only
  `@prisma/prisma.service` and `@prisma/prisma.module` so that `@prisma/client`
  still resolves to the real package. A naive derived mapping would break this.
  **This special case must be preserved explicitly.**

#### Prerequisites

None strictly; cleaner after MONO-06.

#### Impact

**4**

#### Effort

**2**

#### Risk Level

**1** — config-only, fully covered by the existing suite.

#### Priority

**High**

#### Suggested Feature

`context/features/unified-path-aliases.md`

---

### MONO-08: Shared ESLint configuration and dependency-boundary rules

#### Current State

Two unrelated flat configs. No import-boundary rules anywhere. A single 3-line
root `.prettierrc.json`.

#### Evidence

`apps/front/eslint.config.mjs` — `FlatCompat` extending `next/core-web-vitals`
and `next/typescript`, ignoring `generated.ts`.
`apps/api/eslint.config.mjs` — `typescript-eslint` recommended plus
`eslint-plugin-prettier/recommended`, with a custom `no-unused-vars` rule
honouring the `_` prefix convention.

The `_`-prefix `no-unused-vars` rule exists only in the API config. `prettier` is
declared only in `apps/api`. `eslint-config-next` is pinned at `15.3.5` while
`next` is `^16.2.4` — the version mismatch `project-overview.md` already flags.

#### Problem

Two overlapping-but-different lint contracts, and no mechanism to enforce
dependency direction once packages exist. The moment `packages/api-contracts`
lands, nothing prevents it from importing `@prisma/client` or from a component
reaching into another package's internals.

#### Recommendation

Create `packages/eslint-config` exporting `base`, `next`, and `nest` configs.
Move the shared `no-unused-vars` convention into `base`. Add
`no-restricted-imports` rules encoding the dependency direction from the
"Dependency Direction" section below — specifically, forbid `packages/*` from
importing `@prisma/client`, `next`, `react`, or `@nestjs/*`.

Align `eslint-config-next` with the installed Next major in the same feature.

#### Proposed Packages

```text
packages/eslint-config/
├── base.mjs       shared rules incl. the _ prefix convention + boundary rules
├── next.mjs       extends base
└── nest.mjs       extends base
```

#### Affected Applications

`apps/api`, `apps/front`, plus every future package.

#### Benefits

- One lint contract.
- Dependency direction becomes machine-enforced rather than aspirational.
- Prevents a shared package from accidentally depending on Prisma or React.

#### Risks

- Unifying rule sets will surface existing violations. Land the config with the
  new rules as `warn`, fix, then promote to `error` — otherwise the feature
  becomes an unbounded cleanup.
- Bumping `eslint-config-next` from 15 to 16 may introduce new rules; keep it a
  separate commit inside the feature so it can be reverted alone.

#### Prerequisites

MONO-01 (boundary rules are pointless without packages to bound).

#### Impact

**3**

#### Effort

**2**

#### Risk Level

**2**

#### Priority

**Medium**

#### Suggested Feature

`context/features/shared-eslint-boundaries.md`

---

### MONO-09: Complete the Turbo task pipeline

#### Current State

`turbo.json` defines `build`, `lint`, `check-types`, `dev`. There is no `test`
task and no root `test` script. 269 tests are never run by the pipeline.

#### Evidence

```text
$ npm test
npm error Missing script: "test"
```

Both workspaces define one:
`apps/api/package.json:17` → `"test": "jest"` (157 passing, 17 suites)
`apps/front/package.json:9` → `"test": "vitest run"` (112 passing, 11 files)

`turbo.json` also lacks a `codegen` task (see MONO-05), and both `build` tasks
declare the union of both apps' outputs.

#### Problem

The pipeline verifies types and lint but not behaviour. Any developer running the
documented root gate (`npm run build`, `npm run lint`, `npm run check-types`) gets
a green result while every test could be failing. Given `ai-interaction.md` makes
that gate a precondition for committing, this is a real hole in the workflow.

#### Recommendation

Add `test` to `turbo.json` with `"dependsOn": ["^build"]` and no outputs, and add
`"test": "turbo run test"` to the root `package.json`. Add the `codegen` task from
MONO-05. Split the `build` outputs so each app declares only what it produces.

#### Proposed Packages

None.

#### Affected Applications

Root `package.json`, `turbo.json`.

#### Benefits

- One command runs everything.
- Test results become cacheable — unchanged packages skip their suite.
- The documented commit gate starts meaning what it says.

#### Risks

- Caching test results means a flaky-but-passing run gets replayed. Acceptable
  for deterministic unit tests; revisit if integration tests with external
  dependencies are added later.

#### Prerequisites

None.

#### Impact

**4**

#### Effort

**1**

#### Risk Level

**1**

#### Priority

**High**

#### Suggested Feature

`context/features/turbo-pipeline-completion.md`

---

### MONO-10: Dependency hygiene

#### Current State

14 declared-but-unused dependencies (8 API, 6 frontend), 5 shared packages
drifting between apps, and one phantom dependency.

#### Evidence

See **D-13**, **D-14**, **D-15**. Notably `puppeteer`, `googleapis`, `stripe`,
`@sendgrid/mail`, `@nestjs/swagger` and `@prisma/adapter-pg` are declared in
`apps/api` with zero references; `@heroicons/react` and `@tanstack/react-query`
are frontend libraries declared in the backend; `@types/node` is `^20` in
`apps/front` and `^22.19.17` in `apps/api`.

#### Problem

Three separate costs. Install weight and audit surface for code nobody runs. A
false signal about the architecture — a reader of `apps/api/package.json`
reasonably concludes Stripe and Puppeteer are in use. And `@prisma/adapter-pg` 7
alongside Prisma 6 is a documented compatibility risk being carried for a package
that is never imported.

`@types/node` drift is the one with teeth: two TypeScript projects in one
repository compiling against different Node type definitions can accept code in
one app that fails in the other.

#### Recommendation

Three independent steps, verifiable one at a time:

1. Remove the 8 unused API dependencies and the 5 unused frontend ones; move
   `dotenv` to `devDependencies`. Re-run build and tests after each removal
   group.
2. Align the 5 drifting versions, pinning `@types/node` to one major across both
   apps.
3. Declare `@graphql-codegen/typed-document-node` (also covered by MONO-05).

Before removing, confirm each package is genuinely dead rather than
dynamically loaded — `puppeteer` in particular is the kind of dependency a PDF
export path might `require()` at runtime.

#### Proposed Packages

None. Consider adopting npm `overrides` in the root `package.json` to pin shared
toolchain versions once, rather than in each app.

#### Affected Applications

`apps/api/package.json`, `apps/front/package.json`, root `package.json`,
`package-lock.json`.

#### Benefits

- Smaller installs and a smaller vulnerability surface.
- `package.json` becomes an honest description of the stack.
- Removes the Prisma 6 / adapter 7 conflict risk at zero cost.
- Both apps type-check against the same Node definitions.

#### Risks

- A dynamically-required package would not show up in a static import search.
  Verify with a full build and a live smoke test of PDF export, email, and
  payment paths before removing `puppeteer`, `@sendgrid/mail`, and `stripe`.
- Bumping `@types/node` in `apps/front` from 20 to 22 may surface new type
  errors. Do it as its own commit.

#### Prerequisites

None. Independent of every other opportunity — it touches only `package.json`
files and the lockfile.

#### Impact

**4**

#### Effort

**2**

#### Risk Level

**2**

#### Priority

**High**

#### Suggested Feature

`context/features/dependency-hygiene.md`

---

### MONO-11: Shared pure utilities package

> **Correction, 2026-07-27 — `packages/utils` was rejected during
> implementation and does not exist.**
>
> Applying this opportunity's own admission rule to the candidates showed none
> of them qualifies, because none has a consumer in both applications:
>
> ```text
> slugify            apps/api 6 files   apps/front 0
> trimToNull         apps/api 7 files   apps/front 0
> humanizeEnumValue  apps/api 0 files   apps/front 4
> formatFileSize     apps/api 0 files   apps/front 5
> ```
>
> The duplication is real but it is **intra-application**, so it takes an
> app-local fix — the same reasoning MONO-15 uses to reject a shared test-utils
> package. What shipped instead: one `slugify` at
> `apps/api/src/common/utils/slug.util.ts`, consumed by all six call sites and
> covered by a 24-case test that asserts byte-identical output against the
> original implementation. `packages/utils` was created, then deleted before it
> gained a consumer.
>
> The `function-helper.ts` split remains outstanding and is frontend-local.

#### Current State

`slugify` exists six times in `apps/api`; `trimToNull` twice. The frontend's
`function-helper.ts` is a 305-line, 40-export grab bag.

#### Evidence

See **D-1** and **D-2**. Also
`apps/front/src/utils/function-helper.ts` exports, among 39 symbols: `isRole`,
`documentToString`, `dictionaries` (the full en/fr i18n JSON), `getInitials`,
`formatCurrency`, `humanizeEnumValue`, `faqCategories`, and **`getSessionSecret`**
— a server-only secret accessor sitting in the same module as browser formatters.

#### Problem

Two distinct issues.

The six `slugify` copies produce public URLs; a fix applied to one is a
divergence in the others, and the already-correct exported version in
`seed-helpers.ts` is imported by nobody.

`function-helper.ts` has no responsibility boundary. Importing `getInitials`
pulls the module that also reaches for `SESSION_SECRET_KEY`. Nothing has leaked —
Next's bundler tree-shakes and no client component calls it — but the file is one
careless import away from a problem, and it is exactly the "large undefined
package named `common`" the specification warns against, in file form.

#### Recommendation

Create `packages/utils` for **pure, dependency-free, environment-agnostic**
functions only: `slugify`, `trimToNull`, `formatFileSize`, `humanizeEnumValue`.
Every export must be a pure function with a unit test and no import of `react`,
`next`, `@prisma/client`, `node:*`, or any browser global.

Anything failing that test stays in its app. Explicitly: `getSessionSecret` stays
in `apps/front` and should be moved into a `server-only` module;
`documentToString` depends on `graphql` and stays; `dictionaries` is frontend i18n
and stays.

Delete the five private `slugify` methods and route all six call sites through
the shared one, preserving `course-import.service.ts`'s empty-result throw as a
wrapper rather than a second implementation.

#### Proposed Packages

```text
packages/utils/
└── src/
    ├── slug.ts        slugify
    ├── string.ts      trimToNull, humanizeEnumValue
    └── format.ts      formatFileSize
```

Explicitly **not** proposed: `packages/utils-browser` or `packages/utils-server`.
There is one browser app and one server app; a browser-only utility belongs in
`apps/front` and a server-only one in `apps/api` until a second consumer exists.

#### Affected Applications

`apps/api` (6 slugify sites, 2 trimToNull sites), `apps/front`
(`utils/function-helper.ts`, `utils/pdu.constant.ts`).

#### Benefits

- Slug generation has one definition, with tests.
- Establishes a purity rule that keeps the package from becoming a dumping
  ground.
- Splitting `function-helper.ts` isolates the server-only secret accessor.

#### Risks

- **The main risk is scope creep**: a `packages/utils` with no admission rule
  becomes the `shared` package the specification warns against. The purity test
  above is the rule and must be enforced by the boundary lint rules in MONO-08.
- Slug behaviour must not change. Existing slugs are in the database and in
  indexed URLs; the shared implementation must be byte-identical to the current
  five.

#### Prerequisites

MONO-01. Best paired with MONO-08 for the boundary rules.

#### Impact

**3**

#### Effort

**2**

#### Risk Level

**1**

#### Priority

**Medium**

#### Suggested Feature

`context/features/shared-pure-utils.md`

---

### MONO-12: Environment variable hygiene and validation

#### Current State

`apps/api/.env.production` is tracked in git. `.env.example` documents 10 of 48
keys. There is no frontend `.env.example`. The three `.gitignore` files disagree.
No environment validation exists in either app.

#### Evidence

```text
$ git ls-files | grep "\.env"
apps/api/.env.example
apps/api/.env.production          ← tracked
```

`apps/api/.gitignore:39` ignores `.env`, and lines below it ignore
`.env.development.local`, `.env.test.local`, `.env.production.local`,
`.env.local` — but **not** `.env.production`.
`apps/front/.gitignore:34` ignores `.env*`, so the frontend is covered.

Content of the tracked file: 48 keys, of which only `NODE_ENV`, `COOKIE_SECURE`
and `GRAPHQL_PLAYGROUND` carry values. **No secret has been committed.**

`apps/api/.env.example` declares 10 keys; the two files' key sets barely overlap —
`.env.example` has `ACTIVATION_*`, `ORGANIZATION_ACTIVATION_URL`,
`SUPPORT_EMAIL` which `.env.production` lacks, while missing `DATABASE_URL`,
every JWT secret, every OAuth credential, and both upload directories.
`CERTIFICATE_UPLOAD_DIR` — required by Phase 6 — appears in neither.

Access is unvalidated and scattered: `process.env.PDU_UPLOAD_DIR`,
`process.env.CERTIFICATE_UPLOAD_DIR`, `process.env.NEXT_PUBLIC_GRAPHQL_URL`,
`process.env.ACCESS_TOKEN_COOKIE_NAME`, each with its own inline fallback.

#### Problem

Ranked by severity:

1. **The gitignore gap.** Nothing has leaked, but the file named `.env.production`
   is precisely the one a developer would paste real credentials into, and it is
   the one git is tracking. This is a trap, not a leak — yet.
2. **`.env.example` is unusable for onboarding.** It omits `DATABASE_URL` and
   every secret. A new developer cannot start the API from it.
3. **No validation.** A missing `JWT_ACCESS_SECRET` surfaces as a confusing
   runtime failure rather than a startup error naming the variable.
4. **No frontend example at all.**

#### Recommendation

Sequenced by urgency:

1. Add `.env.production` and `.env*` (with `!.env.example`) to the API gitignore
   and `git rm --cached apps/api/.env.production`. Confirm the file's history
   contains no real values before deciding whether history rewriting is needed —
   this audit found placeholders only in the current version. Untrack the 25
   Turbo artifacts from **D-17** in the same pass — identical root cause, and
   doing both at once means the "already-tracked files ignore .gitignore" lesson
   is learned once.
2. Regenerate `apps/api/.env.example` from the real key set, with every key
   present, values blank, and a comment per group. Add
   `apps/front/.env.example`.
3. Add startup validation. **Recommendation: do this per-app rather than in a
   shared `packages/env`.** The two schemas share no keys except
   `ACCESS_TOKEN_COOKIE_NAME`, the backend's schema must never be importable by
   the browser, and Nest already has `@nestjs/config` wired. A shared package
   here buys coupling, not reuse. Revisit only if a third application appears.

#### Proposed Packages

**None recommended.** `packages/env` is explicitly argued against above.

#### Affected Applications

`apps/api` (`.gitignore`, `.env.example`, config module), `apps/front`
(`.env.example`, a small validated config module).

#### Benefits

- Closes the tracked-production-env trap.
- Onboarding becomes possible from the example file.
- Misconfiguration fails at boot with a named variable.

#### Risks

- `git rm --cached` on a tracked file will break anyone whose local checkout
  relies on it. Announce it.
- Strict validation can break existing deployments that were running on
  undocumented defaults. Introduce it in warn mode first, then enforce.

#### Prerequisites

None.

#### Impact

**4**

#### Effort

**3**

#### Risk Level

**3** — touches deployment configuration.

#### Priority

**High**

#### Suggested Feature

`context/features/env-hygiene-validation.md`

---

### MONO-13: CI pipeline with affected-only execution

#### Current State

No `.github/` directory. No CI configuration of any kind. Turbo's `--affected`
works but nothing calls it. Remote caching is off.

#### Evidence

```text
$ ls -a .github
(no .github)

$ npx turbo run build --affected --dry=json
affected packages: ["//"]
scm base: {"type":"git","sha":"8f66b6e...","branch":"chore/monorepo-shared-packages-audit"}

$ npm run lint
• Remote caching disabled
```

Measured build times: **cold 3m42s**, **warm cache hit 37s**.

#### Problem

Every quality gate in this repository runs only when a developer remembers to run
it. The workflow in `ai-interaction.md` requires build, lint and check-types
before committing, and nothing enforces it. The green baseline recorded in this
audit is a property of one machine at one moment.

This is also the opportunity where Turborepo's remaining value is concentrated:
caching and `--affected` are most valuable on a shared CI runner, and both are
currently unused there because there is no there.

#### Recommendation

Add a GitHub Actions workflow running `lint`, `check-types`, `test` and `build`
on pull requests to `main`. Use `--affected` against the merge base so a
frontend-only change does not rebuild the API. Cache `.turbo` between runs, and
evaluate Vercel Remote Cache once CI exists and the local-cache hit rate on the
runner is known.

Add the codegen no-diff check from MONO-05.

Do **not** add deployment to this feature. Getting verification green and trusted
is a complete unit of work; selective deployment is a later decision that depends
on where these apps are actually hosted — which this repository does not record.

#### Proposed Packages

None.

#### Affected Applications

New `.github/workflows/ci.yml`; no application code.

#### Benefits

- Every push verified.
- `--affected` and caching finally applied where they save the most time.
- Makes MONO-05's codegen-drift check enforceable.
- A precondition for trusting any of the larger refactors in this report.

#### Risks

- `--affected` needs full git history (`fetch-depth: 0`) and a correct base ref;
  a wrong base silently skips everything and reports green. Verify by pushing a
  deliberately broken commit and confirming CI fails.
- Windows-developed, Linux-CI: `.prettierrc.json` sets `endOfLine: "auto"`, so
  line-ending differences should not bite, but the first run will confirm.

#### Prerequisites

MONO-09 (so `test` is a Turbo task worth running).

#### Impact

**5**

#### Effort

**3**

#### Risk Level

**2**

#### Priority

**High**

#### Suggested Feature

`context/features/ci-affected-pipeline.md`

---

### MONO-14: Shared validation limits

#### Current State

Field-length limits are written twice — as named constants in the frontend Zod
schema and as inline `@MaxLength()` numbers in the backend DTO.

#### Evidence

See **D-9**. `CERTIFICATE_TITLE_MAX = 200` / `@MaxLength(200)`;
`CERTIFICATE_ISSUER_MAX = 200` / `@MaxLength(200)`;
`CERTIFICATE_NUMBER_MAX = 120` / `@MaxLength(120)`.

Also recorded there: the `validUntil >= issueDate` rule exists only in
`apps/front/src/lib/validations/certificate.schema.ts:51-58`. The backend accepts
any two valid date strings.

#### Problem

A tightened backend limit rejects input the frontend accepted, after the user has
filled the form. A loosened one leaves the frontend rejecting valid input. The
certificate domain is the proven case; the same shape recurs across 109 backend
`.input.ts` files and 10 frontend Zod schemas.

#### Recommendation

Share the **limits**, not the schemas. Add
`packages/api-contracts/src/validation/limits.ts` with the numeric bounds, import
them in the Zod schemas and pass them to `@MaxLength()`. Zod and class-validator
stay where they are.

An attempt to share Zod schemas themselves and derive DTOs from them is
explicitly **not** recommended: NestJS DTOs need decorators for GraphQL schema
generation as well as validation, so a Zod-derived DTO would still need a
hand-written `@InputType` twin — replacing one duplication with a more complex
one.

Close the `validUntil >= issueDate` gap in the backend service in the same
feature; it is a real validation hole regardless of sharing.

#### Proposed Packages

```text
packages/api-contracts/src/validation/limits.ts
```

#### Affected Applications

`apps/api` (109 `.input.ts` files — migrate incrementally), `apps/front`
(10 schemas in `lib/validations/`).

#### Benefits

- Length limits cannot diverge.
- Makes the frontend/backend rule comparison visible and reviewable.
- Closes a live cross-field validation gap.

#### Risks

- Tempting to over-share. Error *messages* must stay in the apps — the frontend's
  are user-facing and translated, the backend's are not.
- 109 DTOs is too large for one feature. Scope to the certificate and PDU domains
  first and let the pattern spread with normal feature work.

#### Prerequisites

MONO-01.

#### Impact

**3**

#### Effort

**4** — wide surface if taken beyond the first domain.

#### Risk Level

**3** — validation changes can reject previously-accepted input.

#### Priority

**Medium**

#### Suggested Feature

`context/features/shared-validation-limits.md`

---

### MONO-15: Shared test utilities

#### Current State

17 API spec files and 11 frontend test files, with no shared fixtures, factories,
or mocks. Two different runners.

#### Evidence

`apps/api` uses Jest 29 + ts-jest with hand-built Prisma mocks per spec — e.g.
`professional-certificate.service.spec.ts`,
`admin-org-access-request.service.spec.ts`, each constructing its own transaction
double. `apps/front` uses Vitest 2 + Testing Library, and its tests are
predominantly pure-helper tests (`certificates.helper.test.ts`,
`learning-activities.helper.test.ts`) needing no fixtures.

The history notes a `createApprovalTx` factory that was extracted and shared
*within* one spec file — evidence the need is real but currently local.

#### Problem

Genuine duplication exists in the API's Prisma-mock construction. It is not yet
large, and it does not cross the app boundary — the frontend has no use for a
Prisma mock, and the backend has no use for Testing Library.

#### Recommendation

**Defer.** A cross-app `packages/test-utils` is not justified: the two suites
share no runner, no environment, and no fixture shape. If the API's mock
construction keeps growing, extract it to `apps/api/src/testing/` — inside the
app that uses it — rather than to a workspace package.

Revisit only if a second backend service or a second frontend application
appears.

#### Proposed Packages

**None.** `apps/api/src/testing/` if and when the duplication justifies it.

#### Affected Applications

`apps/api` only.

#### Benefits

- Less per-spec boilerplate, making MONO-07's newly-testable modules cheaper to
  cover.

#### Risks

- Premature extraction creates a package that must not be bundled into
  production, for a benefit that does not yet exist.

#### Prerequisites

MONO-07 — the payoff arrives when 10 more modules become testable.

#### Impact

**2**

#### Effort

**3**

#### Risk Level

**2**

#### Priority

**Low**

#### Suggested Feature

`context/features/api-test-fixtures.md`

---

### MONO-16: Repository documentation

#### Current State

The root `README.md` is UTF-16LE-encoded, renders as mojibake, and describes a
repository that does not exist.

#### Evidence

Raw bytes render as `# =؀� C o u r s e   P l a t f o r m   M o n o r e p o`.
Its content claims:

- a `packages/prisma/` and `packages/common/` layout — neither has ever existed;
- **pnpm** as the recommended package manager — the repo uses npm 10.8.1;
- three roles (`ADMIN`, `PROFESSIONAL`, `provider`) — there are four;
- no mention of `apps/front`, Turborepo, or the GraphQL codegen workflow.

`context/project-overview.md` already flags this. Additionally, this audit found
two of that document's own notes to be stale: the root `lint` failure and the
missing `check-types` scripts were both fixed in commit `8f66b6e` and now pass.

#### Problem

The first file a new contributor opens is actively wrong about the package
manager and the directory layout. `context/` is accurate and far more useful, but
nothing points there.

#### Recommendation

Rewrite `README.md` as UTF-8: what the project is, prerequisites, install, the
four root commands, the per-workspace commands, the codegen workflow, and a
pointer to `context/` for depth. Keep it short — `context/project-overview.md`
already does the long form well.

Correct the two stale notes in `context/project-overview.md` under "Known
Constraints": `next lint` and the missing `check-types` scripts are both resolved.

#### Proposed Packages

None.

#### Affected Applications

`README.md`, `context/project-overview.md`.

#### Benefits

- Onboarding stops with a correct document.
- Removes the pnpm/`packages/` misdirection that contradicts the actual layout.

#### Risks

None.

#### Prerequisites

None. Best done last so it can describe the post-roadmap state — or done first
and updated, since it is cheap.

#### Impact

**2**

#### Effort

**1**

#### Risk Level

**1**

#### Priority

**Medium**

#### Suggested Feature

`context/features/repository-documentation.md`

---

## Category Coverage

The specification requires all twenty categories to be evaluated, with a reason
where a category does not apply.

| # | Category | Verdict |
| --- | --- | --- |
| 1 | Shared Types | **Largely already solved** — GraphQL codegen shares 1,011 types and 75 enums. Residual gaps only outside the schema: MONO-02, MONO-03 |
| 2 | API Contracts | MONO-02, MONO-03, MONO-05. Approaches (tRPC, ts-rest, OpenAPI, Zod, manual DTO, generated SDK) compared under "API Contract Approach: Options Compared"; recommendation is keep GraphQL codegen and supplement it |
| 3 | Validation Schemas | MONO-14 |
| 4 | Constants and Enums | MONO-03, MONO-04 |
| 5 | Authorization Definitions | MONO-04. A `packages/auth-contracts` is **not** recommended — roles already come from the generated `Role` enum and there is no permission catalogue to share; the gap is that `proxy.ts` ignores it |
| 6 | Shared Utilities | MONO-11 |
| 7 | UI Component Library | **Not applicable.** One frontend application. 43 shadcn primitives in `apps/front/src/components/ui` have exactly one consumer; Tailwind 4 is CSS-first with tokens in `src/app/globals.css` and no config file to duplicate. `packages/ui` would add a build boundary and an export surface for zero reuse. Revisit if a second frontend appears |
| 8 | Shared Configuration | MONO-06, MONO-07, MONO-08 |
| 9 | Environment Validation | MONO-12 — recommended **per-app**, not as a shared package |
| 10 | API Client | **Not applicable as a package.** RTK Query + `graphqlBaseQuery` + generated typed documents already give type safety, credentialed requests, single-flight refresh and consistent error mapping, with one consumer. Extracting `packages/api-client` would wrap a working layer for no second caller. Two gaps within it are real and covered elsewhere: no request timeouts or cancellation, and the error-code map in D-6 |
| 11 | Testing Utilities | MONO-15 — **deferred**, with reasoning |
| 12 | Domain Packages | **Not applicable.** One backend service. The specification requires verifying reuse by multiple services before extraction; there is exactly one, and no domain logic is shared with the frontend. Extraction would move business rules further from the resolvers that use them |
| 13 | Database Packages | **Not applicable.** One Prisma schema, one consumer, correctly located in `apps/api/prisma`. Zero `@prisma/client` imports in `apps/front`. `packages/database` would add indirection with no second consumer, and moving the schema risks the migration history |
| 14 | Build Cache | Working locally (3m42s → 37s). Remote caching: MONO-13 |
| 15 | Task Pipelines | MONO-09 |
| 16 | Affected Commands | Supported, unused: MONO-13 |
| 17 | Dependency Boundaries | MONO-08. Currently clean but unenforced |
| 18 | CI/CD Optimization | MONO-13 |
| 19 | Code Generation | MONO-05 |
| 20 | Documentation and DX | MONO-16 |

---

## Recommended Target Structure

Deliberately modest. This is the structure the findings justify — not a maximal
monorepo.

```text
Course1/
├── apps/
│   ├── api/                      unchanged in role
│   └── front/                    unchanged in role
├── packages/
│   ├── api-contracts/            error codes, upload rules, auth constants,
│   │                             validation limits. Pure TS. No runtime deps.
│   ├── utils/                    pure functions only: slugify, trimToNull,
│   │                             formatFileSize, humanizeEnumValue
│   ├── typescript-config/        base + nextjs + nestjs
│   └── eslint-config/            base + next + nest, incl. boundary rules
├── .github/workflows/ci.yml
├── context/
├── package.json                  workspaces: ["apps/*", "packages/*"]
└── turbo.json                    build, test, lint, check-types, codegen, dev
```

**Four packages, not twelve.** Explicitly rejected, each for a stated reason
above: `packages/ui` (one frontend), `packages/api-client` (one consumer),
`packages/domain` and `packages/database` (one backend service), `packages/env`
(no shared keys and a secret-exposure risk), `packages/test-utils` (no shared
runner or fixture shape), `packages/constants` as a standalone (too thin —
folded into `api-contracts`), and `packages/utils-browser` / `packages/utils-server`
(one app each; app-local is correct).

---

## Dependency Direction

The rule to encode in the MONO-08 boundary lint rules:

```text
apps/front
  -> packages/api-contracts
  -> packages/utils
  -> packages/typescript-config   (build-time)
  -> packages/eslint-config       (build-time)

apps/api
  -> packages/api-contracts
  -> packages/utils
  -> packages/typescript-config   (build-time)
  -> packages/eslint-config       (build-time)

packages/api-contracts
  -> (nothing)

packages/utils
  -> (nothing)
```

Invariants to enforce:

- No package may import from `apps/*`.
- No package may import `@prisma/client`, `@nestjs/*`, `next`, or `react`.
- `packages/api-contracts` and `packages/utils` must not import each other —
  keeping both leaf-level means either can be adopted first.
- `apps/api` and `apps/front` must never import each other. **This holds today**
  and should be locked in by lint before packages create new import paths.
- `apps/front` may read `apps/api/src/graphql/schema.gql` as a **build input**
  (MONO-05). This is a file dependency declared in `turbo.json`, not a module
  import, and is the one intentional exception.

### Current violations

**None.** The direction above is aspirational only in the sense that the packages
do not exist yet. No invalid direction, cycle, or cross-app import exists today —
the sole dependency-graph defect found is the undeclared transitive dependency in
D-15.

---

## Implementation Roadmap

### Phase 1 — Foundations (low risk, unblocks everything)

| Order | ID | Item | Impact / Effort / Risk |
| --- | --- | --- | --- |
| 1 | MONO-01 | Enable `packages/*`, scaffold the first package | 4 / 1 / 1 |
| 2 | MONO-09 | Complete the Turbo pipeline (`test`, `codegen`, outputs) | 4 / 1 / 1 |
| 3 | MONO-07 | Unify path aliases; repair Jest resolution | 4 / 2 / 1 |
| 4 | MONO-12 | Environment hygiene; untrack `.env.production` | 4 / 3 / 3 |
| 5 | MONO-10 | Dependency hygiene | 4 / 2 / 2 |
| 6 | MONO-05 | Codegen from the committed schema file | 4 / 2 / 2 |
| 7 | MONO-16 | Fix the README; correct stale context notes | 2 / 1 / 1 |

Phase 1 contains no shared-code migration. It makes the repository correct,
verifiable, and capable of hosting a package. MONO-04 part 1 — the
`cookie-extractor` fix — should be pulled into this phase as a standalone bug fix
regardless of sequencing.

### Phase 2 — Shared application capabilities

| Order | ID | Item | Impact / Effort / Risk |
| --- | --- | --- | --- |
| 8 | MONO-02 | Shared API error-code contract (slice by module) | 5 / 3 / 2 |
| 9 | MONO-04 | Shared auth constants; `proxy.ts` uses `Role` | 4 / 2 / 2 |
| 10 | MONO-03 | Shared upload and REST-surface contract | 4 / 2 / 2 |
| 11 | MONO-11 | Shared pure utilities; collapse 6 `slugify` copies | 3 / 2 / 1 |
| 12 | MONO-06 | Shared TypeScript config | 3 / 2 / 2 |
| 13 | MONO-08 | Shared ESLint config + boundary rules | 3 / 2 / 2 |

MONO-08 lands after the first packages exist so the boundary rules have something
to constrain, and before the roadmap's larger migrations so the constraints apply
to them.

### Phase 3 — Build, architecture, and long-tail

| Order | ID | Item | Impact / Effort / Risk |
| --- | --- | --- | --- |
| 14 | MONO-13 | CI with `--affected`, `.turbo` caching, codegen drift check | 5 / 3 / 2 |
| 15 | MONO-14 | Shared validation limits (certificate + PDU first) | 3 / 4 / 3 |
| 16 | MONO-15 | API test fixtures — reassess, do not assume | 2 / 3 / 2 |

MONO-13 is scored highest-impact in the report but sits in Phase 3 deliberately:
CI is most valuable once `test` is a pipeline task (MONO-09) and once the
repository is stable enough that a red build means something. If the team's
priority is safety over sequencing, MONO-13 can be pulled forward to immediately
after MONO-09 — it has no other prerequisite.

---

## Recommended First Feature

**MONO-01 — Enable a `packages/*` workspace and scaffold the first shared
package.**

Why this one:

- It is the only item that is a hard prerequisite for others. Six of the sixteen
  opportunities cannot begin until it lands.
- It is the cheapest item in the report — a one-line glob change plus a
  three-file package — so the conventions it sets (scope name, build strategy,
  versioning) are set at the point where changing your mind is still free.
- It carries essentially no risk: nothing imports the new package on day one, so
  the existing apps are untouched and the change is trivially revertible.
- It converts `dependsOn: ["^build"]` and `--affected` from decoration into
  working machinery, which makes MONO-13's value measurable rather than
  theoretical.

The obvious alternative first pick is MONO-09 (complete the Turbo pipeline),
which is equally cheap and independently valuable. Either is defensible; MONO-01
is recommended because it is the one that unblocks the most.

One item should be treated as out-of-band regardless of which feature is chosen
first: **the `cookie-extractor` defect in MONO-04 is a live bug**, small enough to
fix on its own, and it should not wait for a roadmap slot.

---

## Available Next Features

### MONO-01 — Monorepo Workspace Foundation

The workspace glob is `apps/*`, so no shared package can exist or be imported.

Recommendation: widen the glob to include `packages/*`, and scaffold one
pure-TypeScript package to establish scope naming, build strategy, and
versioning conventions.

Feature file: `context/features/monorepo-workspace-foundation.md`

Command: `/feature load monorepo-workspace-foundation`

Question: Would you like to implement the Monorepo Workspace Foundation feature?

---

### MONO-02 — Shared API Error Contract

169 backend error codes are invisible to the frontend, which re-declares 25 of
them as bare string literals.

Recommendation: move the error-code vocabulary into
`packages/api-contracts` so a rename becomes a compile error in both apps.

Feature file: `context/features/shared-api-error-contract.md`

Command: `/feature load shared-api-error-contract`

Question: Would you like to implement the Shared API Error Contract feature?

---

### MONO-03 — Shared Upload Contract

The same MIME allowlist, 5-file cap and 20 MB limit are written four times, and
REST route paths are hardcoded on both sides.

Recommendation: share upload limits, the MIME allowlist and REST path builders
through `packages/api-contracts`.

Feature file: `context/features/shared-upload-contract.md`

Command: `/feature load shared-upload-contract`

Question: Would you like to implement the Shared Upload Contract feature?

---

### MONO-04 — Shared Auth Constants

`ACCESS_TOKEN_COOKIE_NAME` is honoured when the cookie is written and ignored
when it is read, so setting it breaks all authentication. Role strings are
literals in the authorization middleware.

Recommendation: fix the extractor, then share cookie names and the role
vocabulary.

Feature file: `context/features/shared-auth-constants.md`

Command: `/feature load shared-auth-constants`

Question: Would you like to implement the Shared Auth Constants feature?

---

### MONO-05 — Codegen From Schema File

GraphQL codegen reads a live server URL, so it needs a running API and database
and cannot run in CI — while the schema sits committed in the sibling workspace.

Recommendation: point codegen at `apps/api/src/graphql/schema.gql`, make it a
cached Turbo task, and declare the phantom `typed-document-node` dependency.

Feature file: `context/features/codegen-from-schema-file.md`

Command: `/feature load codegen-from-schema-file`

Question: Would you like to implement the Codegen From Schema File feature?

---

### MONO-06 — Shared TypeScript Configuration

Two unrelated tsconfigs with no shared base, seven dead aliases, and an
`@types/*` alias shadowing the npm scope.

Recommendation: create `packages/typescript-config` with base, Next.js and
NestJS presets.

Feature file: `context/features/shared-typescript-config.md`

Command: `/feature load shared-typescript-config`

Question: Would you like to implement the Shared TypeScript Configuration feature?

---

### MONO-07 — Unified Path Aliases

Jest resolves 10 of 26 API aliases; 130 files across 10 of 17 modules import
through the missing 16 and cannot be unit tested. Proven, not inferred.

Recommendation: derive Jest and Vitest mappings from tsconfig `paths` instead of
restating them, preserving the deliberate narrow `@prisma/*` mapping.

Feature file: `context/features/unified-path-aliases.md`

Command: `/feature load unified-path-aliases`

Question: Would you like to implement the Unified Path Aliases feature?

---

### MONO-08 — Shared ESLint and Dependency Boundaries

Two unrelated lint configs, and no mechanism to enforce dependency direction once
packages exist.

Recommendation: create `packages/eslint-config` and encode the dependency
direction as `no-restricted-imports` rules.

Feature file: `context/features/shared-eslint-boundaries.md`

Command: `/feature load shared-eslint-boundaries`

Question: Would you like to implement the Shared ESLint and Dependency Boundaries
feature?

---

### MONO-09 — Turbo Pipeline Completion

`test` is not a Turbo task and the root has no `test` script, so 269 passing
tests never run in the pipeline.

Recommendation: add `test` and `codegen` tasks, add the root script, and split
the over-broad build outputs.

Feature file: `context/features/turbo-pipeline-completion.md`

Command: `/feature load turbo-pipeline-completion`

Question: Would you like to implement the Turbo Pipeline Completion feature?

---

### MONO-10 — Dependency Hygiene

14 unused dependencies, 5 drifting shared versions, and one phantom dependency.

Recommendation: remove the dead packages, align versions (notably `@types/node`
^20 vs ^22), and declare what codegen actually uses.

Feature file: `context/features/dependency-hygiene.md`

Command: `/feature load dependency-hygiene`

Question: Would you like to implement the Dependency Hygiene feature?

---

### MONO-11 — Shared Pure Utilities

`slugify` is implemented six times and `trimToNull` twice; the frontend's
`function-helper.ts` mixes 39 unrelated exports including a server-only secret
accessor.

Recommendation: create `packages/utils` under a strict purity rule and collapse
the duplicates.

Feature file: `context/features/shared-pure-utils.md`

Command: `/feature load shared-pure-utils`

Question: Would you like to implement the Shared Pure Utilities feature?

---

### MONO-12 — Environment Hygiene and Validation

`apps/api/.env.production` is tracked in git (placeholders only, no leak);
`.env.example` documents 10 of 48 keys; no frontend example exists; nothing is
validated at startup.

Recommendation: close the gitignore gap, regenerate both example files, and add
per-app startup validation — deliberately **not** a shared `packages/env`.

Feature file: `context/features/env-hygiene-validation.md`

Command: `/feature load env-hygiene-validation`

Question: Would you like to implement the Environment Hygiene and Validation
feature?

---

### MONO-13 — CI With Affected Execution

There is no CI at all. Turbo's `--affected` works but nothing calls it; remote
caching is off.

Recommendation: add a GitHub Actions workflow running lint, types, tests and
build with `--affected` and a cached `.turbo`.

Feature file: `context/features/ci-affected-pipeline.md`

Command: `/feature load ci-affected-pipeline`

Question: Would you like to implement the CI With Affected Execution feature?

---

### MONO-14 — Shared Validation Limits

Field-length limits are written twice, and the certificate expiry-after-issue
rule exists only in the browser.

Recommendation: share the numeric limits through `packages/api-contracts` — not
the schemas — and close the backend cross-field gap.

Feature file: `context/features/shared-validation-limits.md`

Command: `/feature load shared-validation-limits`

Question: Would you like to implement the Shared Validation Limits feature?

---

### MONO-15 — API Test Fixtures

Prisma mock construction is repeated across API specs. The need is real but
app-local; a cross-app package is not justified.

Recommendation: reassess after MONO-07 makes 10 more modules testable, then
extract to `apps/api/src/testing/` rather than a workspace package.

Feature file: `context/features/api-test-fixtures.md`

Command: `/feature load api-test-fixtures`

Question: Would you like to implement the API Test Fixtures feature?

---

### MONO-16 — Repository Documentation

The root `README.md` is UTF-16LE mojibake describing pnpm and a `packages/prisma`
layout that has never existed. Two "Known Constraints" notes in
`context/project-overview.md` are also stale — the lint and check-types failures
they describe were fixed in `8f66b6e`.

Recommendation: rewrite the README as UTF-8 pointing at `context/` for depth, and
correct the two stale notes.

Feature file: `context/features/repository-documentation.md`

Command: `/feature load repository-documentation`

Question: Would you like to implement the Repository Documentation feature?

---

## Validation Baseline

Every command below was executed on 2026-07-26 at commit `8f66b6e`. Results are
recorded as observed.

| Command | Result | Notes |
| --- | --- | --- |
| `npm run lint` | **PASS** | 2/2 tasks. Re-run with `--force`: 14.9s cold, both green |
| `npm run check-types` | **PASS** | 2/2 tasks. Re-run with `--force`: 12.5s cold, both green |
| `npm run build` | **PASS** | Cold `--force` **3m42s**; warm **37s** `>>> FULL TURBO` |
| `npm test` | **FAIL** | `npm error Missing script: "test"` — no root script, no Turbo task → MONO-09 |
| `npm run test --workspace api` | **PASS** | 157 tests, 17 suites, 17.8s |
| `npm run test --workspace front` | **PASS** | 112 tests, 11 files, 5.8s |
| `npm run test:e2e --workspace api` | **FAIL** | Points at `./test/jest-e2e.json`; `apps/api/test` has never existed |
| `npx turbo run build --affected` | **PASS** | Correctly resolved to `["//"]` against base `8f66b6e` |

### Corrections to previously recorded failures

Two failures documented repeatedly in `context/current-feature.md` and in
`context/project-overview.md` under "Known Constraints" **no longer occur**:

- *"Root `npm run lint` fails because the frontend script calls the removed
  Next 16 `next lint`."* — `apps/front/package.json:10` now reads
  `"lint": "eslint src"`. It passes.
- *"Turbo declares `check-types`, but workspace packages do not expose matching
  `check-types` scripts."* — both workspaces now define one
  (`apps/front/package.json:11`, `apps/api/package.json:16`). It passes.

Both were fixed by commit `8f66b6e` ("chore: update linting and type-checking
configurations across the project"). The API workspace **does** now have an
ESLint 9 flat config at `apps/api/eslint.config.mjs`, contradicting the
long-standing note that it has none.

Resolved after this audit: `test:e2e` now uses `apps/api/test/`, an isolated
PostgreSQL database safety guard, and migration setup in CI.

### Commands that do not exist

- `npm run typecheck` — the repository names this `check-types`.
- `npm test` at the root — see MONO-09. **Not added during this audit**, in
  keeping with the specification's instruction not to add commands unless
  genuinely required; it is recorded as a finding instead.

---

## Questions and Decisions Required

These need a human decision before the affected features can be specified.

1. **Package scope name.** `@loopskey/*` is recommended. The npm org does not
   need to exist — packages are private and never published — but the choice is
   permanent in practice. *Blocks MONO-01.*

2. ~~**Package build strategy.** Source-only exports…~~ **Settled 2026-07-27,
   and the recommendation was wrong.** Source-only does not work: `apps/api`
   resolves modules with `node10`, which ignores the `exports` field entirely,
   and `nest build` emits `require("@loopskey/api-contracts/error-codes")` that
   would resolve to a `.ts` file Node cannot execute. The package now compiles
   to `dist/` with plain `tsc` — no `tsup`, no new dependency — publishing
   CommonJS plus declarations. This is the escape hatch the MONO-01 spec named;
   it was reached on the first attempt, not later.

3. **`.env.production` history.** The tracked file contains only placeholders
   *in its current version*. Should its full git history be checked for
   previously-committed real values, and if any are found, should history be
   rewritten or should the credentials simply be rotated? Rotation is usually the
   cheaper and safer answer. *Blocks MONO-12.*

4. **Deployment target.** The repository records no hosting information — no
   Dockerfile, no `vercel.json`, no deploy workflow. MONO-13 proposes CI for
   verification only. Where do these apps actually deploy, and should CD be a
   later feature? *Affects MONO-13 scope.*

5. **Turborepo remote caching.** Vercel Remote Cache is free for the Hobby tier
   and roughly a 15-minute setup, but it sends build artifacts to a third party.
   Acceptable for this codebase? *Affects MONO-13.*

6. **`@types/node` alignment target.** `apps/api` is on `^22.19.17` and
   `apps/front` on `^20`. Aligning upward is the natural direction but may
   surface new type errors in the frontend. Align to 22, or pin both to 20 for
   now? *Affects MONO-10.*

7. **MONO-02 migration granularity.** 169 codes across 9 modules is too much for
   one commit. Confirm the per-module slicing approach, starting with `auth`
   (50 codes, 22 of the 25 frontend literals). *Affects MONO-02.*

8. **`UNDER_REVIEW` and other long-standing carry-overs.** Unrelated to this
   audit but still open in `current-feature.md`; noted so they are not lost.

---

## Scope Statement

Per the specification's "Important Constraint" and "Scope Control" sections, this
audit performed **no refactor**. Exactly one non-destructive change was made and
reverted: a temporary spec file at
`apps/api/src/modules/course/services/__alias-probe.spec.ts`, created to prove
finding D-11 and deleted immediately after the run. `git status` was confirmed
clean afterwards.

No package was created, no dependency added or removed, no configuration edited,
no schema or migration touched, and no follow-up feature implemented. The only
files this feature adds to the repository are this report and the follow-up
feature specifications it references.
