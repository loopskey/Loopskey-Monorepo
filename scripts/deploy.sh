#!/usr/bin/env bash
#
# Deploy the Loopskey production stack.
#
#   scripts/deploy.sh              pull images from the registry, then restart
#   scripts/deploy.sh --build      build images on this host instead of pulling
#   scripts/deploy.sh --no-git     deploy the checkout as it is, without pulling
#   scripts/deploy.sh --ref <ref>  fast-forward to a specific ref instead of main
#
# Backups land in $LOOPSKEY_BACKUP_DIR (default ./backups). A failed health
# check restores the previous images automatically; the database dump taken at
# the start is the recovery point for anything a migration changed.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

COMPOSE_FILE="compose.production.yaml"
ENV_FILE=".env.docker"
BACKUP_DIR="${LOOPSKEY_BACKUP_DIR:-$REPO_ROOT/backups}"
BACKUPS_KEPT=10
HEALTH_TIMEOUT_SECONDS=300
GIT_REF="main"
DO_GIT=1
DO_BUILD=0

while [ $# -gt 0 ]; do
  case "$1" in
    --build) DO_BUILD=1 ;;
    --no-git) DO_GIT=0 ;;
    --ref) GIT_REF="${2:?--ref needs a value}"; shift ;;
    -h|--help) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

log() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[31mFAILED: %s\033[0m\n' "$*" >&2; exit 1; }

[ -f "$COMPOSE_FILE" ] || fail "$COMPOSE_FILE not found"
[ -f "$ENV_FILE" ] || fail "$ENV_FILE not found. Copy .env.docker.example and fill it in."
command -v docker >/dev/null || fail "docker is not installed"

DC=(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE")

read_env() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '\r"' || true; }

PGUSER_VALUE="$(read_env POSTGRES_USER)"
PGDB_VALUE="$(read_env POSTGRES_DB)"
API_IMG="$(read_env API_IMAGE)"; API_IMG="${API_IMG:-loopskey-api:latest}"
FRONT_IMG="$(read_env FRONT_IMAGE)"; FRONT_IMG="${FRONT_IMG:-loopskey-front:latest}"
[ -n "$PGUSER_VALUE" ] && [ -n "$PGDB_VALUE" ] || fail "POSTGRES_USER and POSTGRES_DB must be set in $ENV_FILE"

"${DC[@]}" config >/dev/null || fail "compose configuration is invalid"

STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

log "Backing up the database and $ENV_FILE"
DB_CONTAINER="$("${DC[@]}" ps -q db)"
[ -n "$DB_CONTAINER" ] || fail "the db service is not running; start the stack before deploying"
docker exec "$DB_CONTAINER" pg_dump -U "$PGUSER_VALUE" -d "$PGDB_VALUE" -Fc > "$BACKUP_DIR/db-$STAMP.dump"
cp "$ENV_FILE" "$BACKUP_DIR/env.docker-$STAMP"
ls -1t "$BACKUP_DIR"/db-*.dump 2>/dev/null | tail -n +$((BACKUPS_KEPT + 1)) | xargs -r rm -f
ls -1t "$BACKUP_DIR"/env.docker-* 2>/dev/null | tail -n +$((BACKUPS_KEPT + 1)) | xargs -r rm -f
echo "  $BACKUP_DIR/db-$STAMP.dump ($(du -h "$BACKUP_DIR/db-$STAMP.dump" | cut -f1))"

log "Checking for an unresolved migration"
STUCK="$(docker exec "$DB_CONTAINER" psql -U "$PGUSER_VALUE" -d "$PGDB_VALUE" -tAc \
  "select migration_name from _prisma_migrations where finished_at is null and rolled_back_at is null;" || true)"
if [ -n "$STUCK" ]; then
  cat >&2 <<MSG

A previous migration never finished, so 'prisma migrate deploy' will refuse to
run and the API will not start:

  $STUCK

Inspect what it applied, then mark it either rolled back (nothing was applied)
or applied (everything was), and run this script again:

  ${DC[*]} run --rm api sh -c '
    P=\$(node -p "encodeURIComponent(process.env.POSTGRES_PASSWORD)")
    export DATABASE_URL="postgresql://\${POSTGRES_USER}:\${P}@db:5432/\${POSTGRES_DB}"
    export DIRECT_DATABASE_URL="\$DATABASE_URL"
    npx prisma migrate resolve --rolled-back $STUCK --schema apps/api/prisma/schema.prisma
  '
MSG
  exit 1
fi

if [ "$DO_GIT" -eq 1 ]; then
  log "Fast-forwarding to origin/$GIT_REF"
  git fetch origin "$GIT_REF"
  git merge --ff-only "origin/$GIT_REF"
  echo "  now at $(git rev-parse --short HEAD) $(git log -1 --format=%s)"
fi

log "Tagging the running images for rollback"
docker tag "$API_IMG" loopskey-api:previous
docker tag "$FRONT_IMG" loopskey-front:previous

if [ "$DO_BUILD" -eq 1 ]; then
  log "Building images"
  "${DC[@]}" build
else
  log "Pulling images"
  "${DC[@]}" pull api front
fi

rollback() {
  log "Rolling back to the previous images"
  docker tag loopskey-api:previous "$API_IMG"
  docker tag loopskey-front:previous "$FRONT_IMG"
  "${DC[@]}" up -d
  fail "deploy rolled back. Database dump: $BACKUP_DIR/db-$STAMP.dump"
}

log "Starting the stack"
"${DC[@]}" up -d || rollback

wait_healthy() {
  local service="$1" container deadline status
  container="$("${DC[@]}" ps -q "$service")"
  [ -n "$container" ] || return 1
  deadline=$((SECONDS + HEALTH_TIMEOUT_SECONDS))
  while [ "$SECONDS" -lt "$deadline" ]; do
    status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container")"
    [ "$status" = "healthy" ] && return 0
    [ "$status" = "none" ] && return 0
    sleep 5
  done
  return 1
}

log "Waiting for health checks"
for service in api front; do
  if wait_healthy "$service"; then
    echo "  $service healthy"
  else
    echo "  $service did not become healthy" >&2
    "${DC[@]}" logs --tail 40 "$service" >&2 || true
    rollback
  fi
done

log "Migration state"
docker exec "$DB_CONTAINER" psql -U "$PGUSER_VALUE" -d "$PGDB_VALUE" -c \
  "select count(*) filter (where finished_at is not null) as applied,
          count(*) filter (where finished_at is null and rolled_back_at is null) as unresolved
   from _prisma_migrations;"

log "Deployed"
"${DC[@]}" ps
echo
echo "Rollback images kept as loopskey-api:previous and loopskey-front:previous."
echo "Database dump: $BACKUP_DIR/db-$STAMP.dump"
