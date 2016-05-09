# Siz Agenda
Siz Agenda is a Lightweight NodeJS POST Webhooks scheduler

### Prerequisite
- [Docker] (https://www.docker.com)

### Example Usage
- Using Express
```javascript
var express = require('express')
var app = express()
var JobManger = require('job-manager')

process.on('SIGTERM', JobManger.graceful)
process.on('SIGINT', JobManger.graceful)

JobManger.start()

app.get('/', JobManger.getAllJobs)

app.get('/webhooks', JobManger.getAllJobs)

app.get('/webhooks/:id', JobManger.getAllJobs)

app.post('/webhooks', JobManger.createJob)

app.put('/webhooks/:id', JobManger.updateJob)

app.delete('/webhooks/:id', JobManger.removeJobs)

app.delete('/webhooks', JobManger.removeJobs)

app.listen(3000, function () {
  console.log('Server running on http://localhost:3000')
})
```

# Full documentation
## Table of Contents
- [Creating jobs](#creating-jobs)
- [Updating jobs](#updating-jobs)
- [Removing jobs](#removing-jobs)
- [Paginate data](#paginate-data)
- [Getting jobs](#getting-jobs)

# Note
All functions excepted `paginate` are only getting `req` and `res` in parameter.

## Creating Jobs
### JobManager.createJob
Creates a webhook with the given data
#### Required data: An Object who contains:
- Url
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

## Updating Jobs
### JobManger.updateJob
Updates a given webhooks with the new data
##### Required data: An Object who contains:
- Url
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

## Removing Jobs
### JobManger.removeJobs
Removes the given webhooks if a query parameter (`id`) is given or removes all webhooks

## Paginate Data
### JobManger.paginate(offset, limit, data)
- `offset`: `number` is the beginning object number
- `limit`: `number` maximum number of objects
- `data`: `array` data to paginate

## Getting Jobs
### JobManger.getAllJobs
If a query parameters (`offset` and `limit`) are given, returns paginated jobs or returns all jobs

# Environment variables
- `NODE_ENV (possible values: production or developpement)`
- `IP (default localhost)`

# Deployement
## In development
### Build
- `docker build -t siz-agenda .`
- `docker run --name mongo-agenda -d mongo`

### Install modules
`docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app siz-agenda npm install`
### Render minified files
`docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app siz-agenda ./build.sh`
### Run
- `docker start mongo-agenda`
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --link mongo-agenda:mongo node:onbuild`

## In production
### Build
- `docker build -t siz-agenda .`
- `docker run --name mongo-agenda -d mongo`

### Render minified files
`docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app siz-agenda ./build.sh`
### Run
- `docker start mongo-agenda`
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app -e "NODE_ENV=production" --link mongo-agenda:mongo siz-agenda`
