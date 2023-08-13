#!/bin/bash

cp /etc/letsencrypt/live/api.stlotus.org/* ./creds/
nvm use
npm run db:fetchCardList
docker-compose build
docker-compose up -d
