# Siz Agenda
Siz Agenda is a Lightweight NodeJS Webhooks scheduler

### Prerequisite
- [Docker] (https://www.docker.com)

# Full documentation
## Table of Contents
- [Creating jobs](#creating-jobs)
- [Updating jobs](#updating-jobs)
- [Removing jobs](#removing-jobs)
- [Getting jobs](#getting-jobs)
- [List of errors](#list-of-errors)
- [Examples](#examples)

# Note
All functions excepted are only getting `req` and `res` in parameter.

## Creating Jobs
### createJob
Creates a webhook with the given body
#### Required body: An Object who contains:
- URL
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

## Updating Jobs
### updateJob
Updates a given webhooks with the new body
##### Required body: An Object who contains:
- URL
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

## Removing Jobs
### removeJobs
Removes the given webhooks if a query parameter (`id`) is given or removes all webhooks

## Getting Jobs
### getAllJobs
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
## Creating a Job
- `POST http://localhost:3000/webhooks`
- Body :
``` javascript
{  
   "url": "myurl.com",
   "scheduling": "* * * * *",
   "body": {  
      "hello":"world"
   }
}
```
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
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  }
]
```

## Getting Jobs
- `GET http://localhost:3000/webhooks`
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

- `GET http://localhost:3000/webhooks/5730a487a3dc0e13009c0a45`
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

- `GET http://localhost:3000/webhooks?offset=4&limit=2`
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
- `PUT http://localhost:3000/webhooks/5730a487a3dc0e13009c0a45`
- Body :
``` javascript
{  
   "url": "myurl.com",
   "scheduling": "in 2 minutes",
   "body": {  
      "hello":"world"
   }
}
```
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
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  }
]
```

## Removing Data
- `DELETE http://localhost:3000/webhooks/5730a487a3dc0e13009c0a45`
- Response type: `OK`

- `DELETE http://localhost:3000/webhooks`
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
