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
   "scheduling": "* * * * *"
}
```
- Response type: `Missing required parameters`
- Status: `400`

---------------------------------------
- `POST http://localhost:3000/webhooks`
- Body :
``` javascript
{
   "url": "myurl.com",
   "scheduling": "test",
   "body": {  
      "hello":"world"
   }
}
```
- Response type: `test is not a valid time inteval !`
- Status: `400`

## Updating Jobs
- `PUT http://localhost:3000/webhooks/azerty`
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
- Response type: `Unable to update the job`
- Status: `400`

## Removing Data
- `DELETE http://localhost:3000/webhooks/azerty`
- Response type: `Unable to remove the job`
- Status: `400`

---------------------------------------
- `DELETE http://localhost:3000/webhooks`
- Response type: `Unable to remove jobs`
- Status: `400`

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
