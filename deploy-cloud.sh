#!/bin/bash

cp /etc/letsencrypt/live/api.stlotus.org/* ./creds/
docker-compose build
docker-compose up -d