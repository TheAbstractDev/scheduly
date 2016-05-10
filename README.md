![Scheduly](./assets/img/Scheduly.png)

# Scheduly
Scheduly is a Lightweight NodeJS Webhooks scheduler

### Prerequisite
- [Docker] (https://www.docker.com)

# Full documentation
## Table of Contents
- [Creating jobs](#creating-jobs)
- [Updating jobs](#updating-jobs)
- [Removing jobs](#removing-jobs)
- [Getting jobs](#getting-jobs)
- [Errors](#errors)

## Creating Jobs
### createJob
Creates a webhook with the given body and returns the jobs.
##### Required body:
- URL
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

---------------------------------------
##### Note:
- If `scheduling interval` is at the cron format, the job will be executed every `scheduling interval`.
- If `scheduling inverval` is at the human interval format, the job will be executed once at `scheduling interval`.

## Updating Jobs
### updateJob
Updates a given webhooks with the new body and returns the jobs updated.
##### Required body:
- URL
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

---------------------------------------
##### Note:
- If `scheduling interval` is at the cron format, the job will be executed every `scheduling interval`.
- If `scheduling inverval` is at the human interval format, the job will be executed once at `scheduling interval`.

## Removing Jobs
### removeJobs
Removes the given webhooks if a query parameter (`id`) is given or removes all webhooks

## Getting Jobs
### getJobs
If a query parameters (`offset` and `limit`) are given, returns paginated jobs or returns all jobs

# Errors
## Creating a Job
- `POST http://localhost:8080/webhooks`
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
- `POST http://localhost:8080/webhooks`
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
- `PUT http://localhost:8080/webhooks/azerty`
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
- Response type: `No jobs to update`
- Status: `400`

## Removing Data
- `DELETE http://localhost:8080/webhooks/azerty`
- Response type: `No job to remove`
- Status: `400`

---------------------------------------
- `DELETE http://localhost:8080/webhooks`
- Response type: `No jobs to remove`
- Status: `400`

# Environment variables
- `NODE_ENV (possible values: production or developpement)`
- `IP (default localhost)`

# Deployement
## In development
### Build
`./build.sh`
### Run
- `docker start mongo-agenda`
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --link mongo-agenda:mongo node:onbuild`

## In production
### Build
`./build.sh`
### Run
- `docker start mongo-agenda`
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app -e "NODE_ENV=production" --link mongo-agenda:mongo scheduly`
