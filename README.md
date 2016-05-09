# Siz Agenda
Siz Agenda is a Lightweight NodeJS POST Webhooks scheduler

### Prerequisite
- [Docker] (https://www.docker.com)

### Example Usage
- Using Express
```javascript
var express = require('express')
var app = express()
var JobManger = require('./lib/job-manager')

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
- [List of errors](#list-of-errors)

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

## Getting Jobs
### JobManger.getAllJobs
If a query parameters (`offset` and `limit`) are given, returns paginated jobs or returns all jobs

# List of errors
## Create jobs
- `Job Not created`
- `... is not a valid human readable time inteval !`
- `Missing required parameters`

## Update jobs
- `Unable to update the job`

## Remove jobs
- `Unable to remove the job`
- `Unable to remove jobs`

# Examples
## Create Job
- Making a POST Request to `http://localhost:3000/webhooks`
Data :
``` javascript
{  
   "url": "myurl.com",
   "scheduling": "* * * * *",
   "body": {  
      "hello":"world"
   }
}
```
- Response type: `OK`

## Getting Jobs
- Making a GET Request to `http://localhost:3000/webhooks` to get all data
- Response type:
``` javascript
[
  {
    "name": "webhook",
    "id": "5730a487a3dc0e13009c0a45",
    "url": "myurl.com",
    "body": {
      "hello": "world"
    },
    "lastRunAt": "...",
    "lastFinishedAt": "...",
    "nextRunAt": "2016-05-09T14:56:00.246Z",
    "status": "scheduled"
  }
]
```

- Making a GET Request to `http://localhost:3000/webhooks/5730a487a3dc0e13009c0a45` to get a specific job
- Response type:
``` javascript
[
  {
    "name": "webhook",
    "id": "5730a487a3dc0e13009c0a45",
    "url": "myurl.com",
    "body": {
      "hello": "world"
    },
    "lastRunAt": "...",
    "lastFinishedAt": "...",
    "nextRunAt": "2016-05-09T14:56:00.246Z",
    "status": "scheduled"
  }
]
```

- Making a GET Request to `http://localhost:3000/webhooks?offset=4&limit=2` to get paginated data
- Response type:
``` javascript
[
  {
    "name": "webhook",
    "id": "5730a487a3dc0e13009c0a45",
    "url": "myurl.com",
    "body": {
      "hello": "world"
    },
    "lastRunAt": "...",
    "lastFinishedAt": "...",
    "nextRunAt": "2016-05-09T14:56:00.246Z",
    "status": "scheduled"
  },
  {
    "name": "webhook",
    "id": "5730a487a3dc0e13009c0a46",
    "url": "myurl.com",
    "body": {
      "hello": "world"
    },
    "lastRunAt": "...",
    "lastFinishedAt": "...",
    "nextRunAt": "2016-05-09T14:56:00.246Z",
    "status": "scheduled"
  }
]
```

## Updating Jobs
- Making a PUT Request to `http://localhost:3000/webhooks/5730a487a3dc0e13009c0a45`
Data :
``` javascript
{  
   "url": "myurl.com",
   "scheduling": "in 2 minutes",
   "body": {  
      "hello":"world"
   }
}
```
- Response type: `OK`

## Removing Data
- Making a DELETE Request to `http://localhost:3000/webhooks/5730a487a3dc0e13009c0a45` to remove a specific job
- Response type: `OK`

- Making a DELETE Request to `http://localhost:3000/webhooks` to remove all jobs
- Response type: `OK`

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
