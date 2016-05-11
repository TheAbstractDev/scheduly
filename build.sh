#!/usr/bin/env bash
docker build -t scheduly .
# docker run --name mongo-scheduly -d mongo
docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app scheduly npm install
docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app scheduly ./minify.sh