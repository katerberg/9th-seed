#!/bin/bash
set -e

# By default the deploy detaches from the terminal so you can disconnect from SSH.
# Pass --foreground to run it attached instead.
cd "$(dirname "$0")"
SCRIPT="$PWD/$(basename "$0")"

if [[ "$1" != "--foreground" && -z "$DEPLOY_DETACHED" ]]; then
  mkdir -p logs
  LOG="$PWD/logs/deploy-$(date +%Y%m%d-%H%M%S).log"
  DEPLOY_DETACHED=1 nohup setsid "$SCRIPT" > "$LOG" 2>&1 < /dev/null &
  echo "Deploy running in the background; safe to disconnect."
  echo "Follow it with: tail -f $LOG"
  exit 0
fi

trap 'status=$?; echo "=== Deploy $([ $status -eq 0 ] && echo succeeded || echo "FAILED (exit $status)") at $(date) ==="' EXIT
echo "=== Deploy started at $(date) ==="

# Zero-downtime rollout needs https://github.com/wowu/docker-rollout installed as a docker CLI plugin
if ! docker rollout --help > /dev/null 2>&1; then
  echo "docker-rollout is not installed: see https://github.com/wowu/docker-rollout#installation"
  exit 1
fi

docker system prune --volumes -f
export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;
nvm use
npm run db:fetchCardList
docker-compose build

# Seed the DB once with the new image while the old http container keeps serving
docker-compose up -d --no-deps mysqldb
docker-compose run --rm http npm run db:docker

# Start new http alongside old, wait for healthy, then remove old
docker rollout http

# Caddy handles TLS certs itself; twitch is a plain recreate (two bots would double-post)
docker-compose up -d --no-deps caddy twitch
