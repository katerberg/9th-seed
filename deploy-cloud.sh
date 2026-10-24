#!/bin/bash
set -e

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
