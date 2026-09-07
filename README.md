# Loopskey

A multi-role continuing professional development (CPD) platform: courses,
events, podcasts, YouTube content, professional roadmaps, certifications, and
PDU/CPD tracking in one application.

Four roles, each with its own dashboard:

| Role           | Does what                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------- |
| `PROFESSIONAL` | Discovers learning content, tracks PDU/CPD progress, manages credentials and certificates |
| `PROVIDER`     | Publishes and manages courses, events, podcasts and channels                              |
| `ORGANIZATION` | Manages members, departments, assignments and compliance reporting                        |
| `ADMIN`        | Manages users, organizations, platform content and taxonomy                               |

## Prerequisites

- Node.js 22
- npm 10.8.1 (declared in `packageManager`)
- PostgreSQL

## Setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/front/.env.example apps/front/.env
# fill in DATABASE_URL and the JWT secrets at minimum

npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run dev
```

The frontend serves on `http://localhost:3000`, the core API on
`http://localhost:5700` with GraphQL at `/graphql`.

## Commands

Run from the repository root. Everything is orchestrated by Turborepo, so tasks
are cached and run in parallel.

```bash
npm run dev           # both applications in watch mode
npm run build         # production builds
npm run test          # every test suite
npm run lint          # every workspace
npm run check-types   # every workspace
npm run codegen       # regenerate frontend GraphQL types
```

Scoped to one workspace:

```bash
npm run dev --workspace api
npm run test --workspace front
npm run db:seed --workspace api
```

Prisma:

```bash
npx prisma generate       --schema apps/api/prisma/schema.prisma
npx prisma migrate dev    --schema apps/api/prisma/schema.prisma --name <name>
npx prisma migrate status --schema apps/api/prisma/schema.prisma
```

## Feature workflow

The repository uses one scope-aware feature skill:

```text
/feature start <spec-or-request>  # branch, implement, test, fix
/feature review                   # optional four-bullet summary
/feature complete                 # commit, push, PR, wait for CI
```

`complete` opens a PR to `develop` and stops after CI passes. It never merges
the PR or deletes a branch; the Team Lead performs those actions manually.

Documentation is scoped per application. Frontend work loads
`apps/front/CLAUDE.md`, core backend work loads `apps/api/CLAUDE.md`, and
repository-wide work loads only the
scopes it affects. Shared context — the project overview, coding standards and
ADRs — stays at the root in `context/`.

## Continuous integration

GitHub Actions validates pull requests and pushes to `develop` and `main`.
Turborepo runs affected lint, type, test, and build tasks across both
applications; PostgreSQL-backed API E2E tests and GraphQL generated-type drift
checks run in the same required job.
A push to `main` additionally builds the API and frontend images and publishes
them to GHCR. Deployment itself stays manual: a host runs `scripts/deploy.sh`.

## Docker deployment

The production stack is PostgreSQL, the NestJS API, and the Next.js frontend,
described by `compose.production.yaml`. `compose.yaml` is the local variant: it
carries development defaults for every value, while the production file fails
loudly when one is missing.

First deployment on a host:

```bash
cp .env.docker.example .env.docker
# Fill in every blank, and set the public HTTPS origins.
docker compose -f compose.production.yaml --env-file .env.docker up --build -d
```

After that a merge to `main` deploys on its own; see "Continuous deployment"
below. To deploy by hand:

```bash
scripts/deploy.sh
```

`deploy.sh` dumps the database, refuses to continue when a previous migration
was left unresolved, fast-forwards the checkout to `origin/main`, pulls or
builds the images, restarts the stack, waits for both health checks, and
restores the previous images if either one fails. It pulls when `API_IMAGE` is
set and builds otherwise; `--build` and `--pull` force one or the other, and
`--no-git` deploys the checkout as it is.

Prisma migrations run automatically before each API start. Database data and
uploaded files live in named Docker volumes and survive container replacement.

### Continuous deployment

`.github/workflows/release.yml` runs on every push to `main`. It publishes both
images to GHCR, then opens an SSH session to the host and deploys. A merge to
`main` is therefore the whole deployment.

The frontend bundle carries `NEXT_PUBLIC_GRAPHQL_URL`, baked in at build time,
so the workflow reads it from the repository variable of the same name and fails
when it is unset — an empty value ships a frontend that calls nothing. Changing
the public API origin means changing that variable and re-running the workflow.

Deployment is a single concurrency group, so two merges in quick succession
deploy one after the other rather than racing.

#### Host setup, once

Authenticate the host to GHCR and point `.env.docker` at the published images,
so deployments pull instead of building on a machine that is also serving
traffic:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u <github-user> --password-stdin
# in .env.docker
API_IMAGE=ghcr.io/loopskey/loopskey-monorepo/api:latest
FRONT_IMAGE=ghcr.io/loopskey/loopskey-monorepo/front:latest
```

Leaving both blank keeps the locally built `loopskey-api:latest` and
`loopskey-front:latest`, and `deploy.sh` builds instead of pulling.

Then create a key that can do nothing but deploy:

```bash
ssh-keygen -t ed25519 -N "" -C loopskey-ci -f ~/.ssh/loopskey_ci

RESTRICT='command="'$(pwd)'/scripts/ci-deploy.sh",no-agent-forwarding,'
RESTRICT="${RESTRICT}no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding"
echo "$RESTRICT $(cat ~/.ssh/loopskey_ci.pub)" >> ~/.ssh/authorized_keys
```

The `command=` prefix is what makes the key safe to hand to CI: the server
ignores whatever the client asks for and runs `scripts/ci-deploy.sh` instead, so
a leaked key can deploy and nothing else.

Host settings that do not belong in the repository go in
`/etc/loopskey/deploy.env`, which `ci-deploy.sh` sources:

```bash
install -d /etc/loopskey
echo 'LOOPSKEY_BACKUP_DIR=/root/backups' > /etc/loopskey/deploy.env
```

#### Repository secrets

| Secret               | Required | Value                                                |
| -------------------- | -------- | ---------------------------------------------------- |
| `DEPLOY_HOST`        | yes      | Host or IP of the deployment machine                 |
| `DEPLOY_SSH_KEY`     | yes      | The private key generated above                      |
| `DEPLOY_USER`        | no       | Defaults to `root`                                   |
| `DEPLOY_PORT`        | no       | Defaults to `22`                                     |
| `DEPLOY_KNOWN_HOSTS` | no       | Pins the host key; `ssh-keyscan` is used when absent |

```bash
gh secret set DEPLOY_HOST --body "<host>"
gh secret set DEPLOY_SSH_KEY < ~/.ssh/loopskey_ci
gh secret set DEPLOY_KNOWN_HOSTS --body "$(ssh-keyscan -H <host> 2>/dev/null)"
```

#### Requiring an approval before a deployment

The `deploy` job takes no approval by design. To add one, create a GitHub
Environment named `production` with required reviewers and add
`environment: production` to that job; the workflow then waits for a click after
the images are published.

### Ports and TLS

Every published port binds to `127.0.0.1`, so a TLS reverse proxy in front of
the host is required. `CORS_ORIGIN` must list every hostname the frontend is
reachable on — serving both the apex and the `www` host while allowing only
`www` fails every request from the apex.

### Recovering a failed migration

`prisma migrate deploy` refuses to apply anything once a migration is recorded
as started but unfinished, so the API will not start until that row is
resolved. Check what the migration actually applied, then mark it accordingly:

```bash
DC="docker compose -f compose.production.yaml --env-file .env.docker"
$DC run --rm api sh -c '
  P=$(node -p "encodeURIComponent(process.env.POSTGRES_PASSWORD)")
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${P}@db:5432/${POSTGRES_DB}"
  export DIRECT_DATABASE_URL="$DATABASE_URL"
  npx prisma migrate resolve --rolled-back <migration_name> --schema apps/api/prisma/schema.prisma
'
```

Use `--rolled-back` when the migration applied nothing and should run again, and
`--applied` when it completed but was not recorded. Rehearse the run against a
restored dump before touching production.

### Useful operations

```bash
DC="docker compose -f compose.production.yaml --env-file .env.docker"
$DC logs -f api
$DC ps
$DC down
```

`down` keeps the named volumes. Adding `--volumes` deletes the database and
uploads and should only be used when that data is no longer needed.

## Layout

```text
apps/
  api/                    NestJS 11, Apollo GraphQL (code-first), Prisma 6
  front/                  Next.js 16, React 19, RTK Query, Tailwind 4
packages/
  api-contracts/          values both apps must agree on but the GraphQL
                          schema does not carry: message codes, upload rules,
                          auth constants, validation limits
  typescript-config/      base / nextjs / nestjs compiler presets
  eslint-config/          shared rules and dependency-boundary rules
context/                  architecture, coding standards, workflow, features
```

Dependency direction is one-way and lint-enforced: applications may import
packages, packages may not import applications, and no application may import
another.

## How the applications talk to each other

The browser communicates with the core API through GraphQL.

```text
Browser ──GraphQL──► apps/api
                     (only public edge)
```

**Browser ↔ core API — GraphQL.** The backend is code-first: NestJS decorators
generate `apps/api/src/graphql/schema.gql`, which is committed. The frontend
runs GraphQL Code Generator **against that committed file** — not against a
running server — producing `apps/front/src/lib/graphql/generated.ts`. Codegen
therefore needs no API and no database, and CI fails if the generated file
drifts.

Anything the schema cannot express — message codes, multipart upload rules,
cookie names, field bounds — lives in `packages/api-contracts` so both sides
reference one value.

`generated.ts` is generated. Never edit it by hand; fix the schema or the
`.graphql` document and re-run `npm run codegen`.

## Further reading

`context/` is the authoritative documentation and is kept current:

- [`project-overview.md`](context/project-overview.md) — architecture, domains, data model
- [`coding-standards.md`](context/coding-standards.md) — conventions for both applications
- [`feature-runs/`](context/feature-runs) — execution state for in-flight features
