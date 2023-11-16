#!/bin/bash

sudo certbot renew
cp /etc/letsencrypt/live/api.stlotus.org/* ./creds/
docker system prune --volumes -f
export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;
nvm use
npm run db:fetchCardList
docker-compose build
docker-compose up -d
