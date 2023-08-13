#!/bin/bash

cp /etc/letsencrypt/live/api.stlotus.org/* ./creds/
npm run db:fetchCardList
docker-compose build
docker-compose up -d
