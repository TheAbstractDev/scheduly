# siz-agenda
Siz Agenda is a Lightweight NodeJS POST request scheduler

## Prerequisite
- [Docker] (https://www.docker.com)

## Environment variables
- `NODE_ENV (possible values: production or developpement)`
- `IP (default localhost)`

## Commands
### In development
#### Build
- `docker build -t siz-agenda .`
- `docker run --name mongo-agenda -d mongo`

#### Install modules
`docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app siz-agenda npm install`
#### Render minified files
`docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app siz-agenda ./build.sh`
#### Run
- `docker start mongo-agenda`
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --link mongo-agenda:mongo node:onbuild`

### In production
#### Build
- `docker build -t siz-agenda .`
- `docker run --name mongo-agenda -d mongo`

#### Render minified files
`docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app siz-agenda ./build.sh`
#### Run
- `docker start mongo-agenda`
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app -e "NODE_ENV=production" --link mongo-agenda:mongo siz-agenda`
