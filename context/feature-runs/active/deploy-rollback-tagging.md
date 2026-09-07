# Deploy rollback tagging

- Scope: `full`
- Branch: `fix/deploy-rollback-tagging`
- Base: `7b447c3781066202c50ae36cdd8e5cbab8e48914`
- Status: `Ready`

## Acceptance

- [x] The rollback point is taken from the image the running container uses, not
      from the image name `.env.docker` configures. Pointing `API_IMAGE` at the
      registry made the first pull-based deployment fail at
      `docker tag ghcr.io/...:latest`, because the host had only ever built
      local images and the registry image was not present yet.
- [x] A service that is not running no longer aborts the deployment; it is
      reported and the rollback path refuses rather than restoring a tag that
      was never created.

## Verification

- `bash -n scripts/deploy.sh` — pass
- `docker compose -f compose.production.yaml --env-file <filled example> config` — pass
- `npx turbo run lint check-types` — pass
- Reproduced on the host: the deployment stopped at the tagging step with
  `No such image: ghcr.io/loopskey/loopskey-monorepo/api:latest`, before the
  stack was touched.

## Submission

- Commit:
- PR:
- CI:
