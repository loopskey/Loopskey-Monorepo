#!/usr/bin/env bash
#
# The only command a CI deployment key is allowed to run.
#
# Installed in the deployment user's authorized_keys as
# command="/path/to/scripts/ci-deploy.sh", so whatever the client asks for is
# ignored and this runs instead. A leaked key can therefore deploy and nothing
# else. Host settings that do not belong in the repository — a backup directory
# outside the checkout, for instance — go in /etc/loopskey/deploy.env.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST_ENV_FILE="/etc/loopskey/deploy.env"

if [ -f "$HOST_ENV_FILE" ]; then
  set -a
  . "$HOST_ENV_FILE"
  set +a
fi

printf 'ci-deploy: requested %s at %s\n' \
  "${SSH_ORIGINAL_COMMAND:-<none>}" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

exec "$REPO_ROOT/scripts/deploy.sh"
