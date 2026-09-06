# Docker deployment pipeline

- Scope: `full`
- Branch: `feature/docker-deployment-pipeline`
- Base: `47c3436a2141a085117bfbe6dab8226b494d5991`
- Status: `Ready`

## Acceptance

- [x] `compose.production.yaml` is versioned instead of living only on the
      deployment host, where it had accumulated `.bak` and `.save` copies.
- [x] Production compose fails loudly on a missing required value rather than
      falling back to a development default.
- [x] `ASSOCIATION_LOGIN_URL`, `ASSOCIATION_ACTIVATION_URL`, `LOGO_UPLOAD_DIR`
      and `REPORT_STORAGE_DIR` are set, so association activation mail links to
      the frontend and generated exports land in the uploads volume.
- [x] `CORS_ORIGIN` is deployment-controlled instead of pinned to the single
      `PUBLIC_FRONTEND_URL` origin, which rejected every request from the apex
      host.
- [x] `.env.docker.example` lists every key a deployment supplies, and states
      which keys the compose file owns instead.
- [x] `apps/front/.env.example` is tracked; only the API template was.
- [x] A push to `main` publishes both images to GHCR, so a host can deploy
      without building.
- [x] `scripts/deploy.sh` backs up, refuses to run while a migration is
      unresolved, deploys, waits for both health checks, and restores the
      previous images on failure.
- [x] The frontend has a health check; only the API and database had one.

## Verification

- `docker compose -f compose.production.yaml --env-file <filled example> config` — pass
- `bash -n scripts/deploy.sh` — pass
- `npx prettier --check` on every touched file — pass
- `npx turbo run lint check-types --affected` — pass
- Rehearsed against a restored production dump on the host: 12 pending
  migrations applied, 0 unresolved, 12 association tables created.
- Deployed to production from this configuration: `/health` 200, `/ready`
  database up, apex and `www` both 200, apex accepted by CORS.

## Submission

- Commit:
- PR:
- CI:
