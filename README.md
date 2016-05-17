![Scheduly](./assets/img/Scheduly.png)

# Scheduly
Scheduly is a Lightweight NodeJS Webhooks scheduler

# Prerequisite
- [Docker] (https://www.docker.com)

# Deploy in production
## Environment variables
- `MONGO_URL` (default: `mongodb://localhost/agenda`)
- `NODE_ENV` (values: `production` or `developpement`)
- `IP` (default: `localhost`)
- `PORT` (default: `8080`)

## In production
### Build
- `docker build -t scheduly .`

### Run
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --net host -e "NODE_ENV=production" scheduly`

# Full documentation
## Table of Contents
- [Creating jobs](#creating-jobs)
- [Updating jobs](#updating-jobs)
- [Getting jobs](#getting-jobs)
- [Removing jobs](#removing-jobs)
- [Errors](#errors)
- [Deploy in development](#deploy-in-development)

## Creating Jobs
Creates a webhook with the given body and returns the jobs.
##### Required body:
- URL
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

### Example
- `POST http://localhost:8080/webhooks`
- Body :
``` javascript
{  
   "url": "http://requestb.in/17jzptz1",
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
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/17jzptz1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  }
]
```
- Status: `200`

---------------------------------------
##### Note:
- If `scheduling interval` is at the cron format, the job will be executed every `scheduling interval`.
- If `scheduling inverval` is at the human interval format, the job will be executed once at `scheduling interval`.

### Errors
- `POST http://localhost:8080/webhooks`
- Body :
``` javascript
{  
   "url": "http://requestb.in/17jzptz1",
   "scheduling": "* * * * *"
}
```
- Response type: 
``` javascript
[
  'error': {
    message: 'Missing required parameter',
    status: 403
  }
```

---------------------------------------
- `POST http://localhost:8080/webhooks`
- Body :
``` javascript
{
   "url": "http://requestb.in/17jzptz1",
   "scheduling": "test",
   "body": {  
      "hello":"world"
   }
}
```
- Response type:
``` javascript
[
  'error': {
    message: 'test is not a valid time interval !',
    status: 400
  }
```

## Updating Jobs
Updates a given webhooks with the new body and returns the jobs updated.
##### Required body:
- URL
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

### Example
- `PUT http://localhost:8080/webhooks/5730a487a3dc0e13009c0a45`
- Body :
``` javascript
{  
   "url": "http://requestb.in/17jzptz1",
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
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/17jzptz1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  }
]
```
- Status: `200`

---------------------------------------
##### Note:
- If `scheduling interval` is at the cron format, the job will be executed every `scheduling interval`.
- If `scheduling inverval` is at the human interval format, the job will be executed once at `scheduling interval`.

### Errors
- `PUT http://localhost:8080/webhooks/azerty`
- Body :
``` javascript
{  
   "url": "http://requestb.in/17jzptz1",
   "scheduling": "in 2 minutes",
   "body": {  
      "hello":"world"
   }
}
```
- Response type:
``` javascript
[
  'error': {
    message: 'No job to update',
    status: 404
  }
```

## Getting Jobs
If a query parameters (`offset` and `limit`) are given, returns paginated jobs or returns all jobs

### Example
- `GET http://localhost:8080/webhooks`
- Response type:
``` javascript
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/17jzptz1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z",
    "status": "scheduled"
  }
]
```
- Status: `200`

---------------------------------------
- `GET http://localhost:8080/webhooks/5730a487a3dc0e13009c0a45`
- Response type:
``` javascript
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/17jzptz1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z",
    "status": "scheduled"
  }
]
```
- Status: `200`

---------------------------------------
- `GET http://localhost:8080/webhooks?offset=4&limit=2`
- Response type:
``` javascript
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/17jzptz1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z",
    "status": "scheduled"
  },
  {
    "id": "5730a487a3dc0e13009c0a46",
    "url": "http://requestb.in/17jzptz1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z",
    "status": "scheduled"
  }
]
```
- Status: `200`

## Removing Jobs
Removes the given webhooks if a query parameter (`id`) is given or removes all webhooks

### Example
- `DELETE http://localhost:8080/webhooks`
- Response type:
``` javascript
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/17jzptz1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  },
  {
    "id": "5730a487a3dc0e13009c0a46",
    "url": "http://requestb.in/17jzptz1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z",
    "status": "scheduled"
  }
]
```
- Status: `200`

---------------------------------------
- `DELETE http://localhost:8080/webhooks/5730a487a3dc0e13009c0a45`
``` javascript
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/17jzptz1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  }
]
```
- Status: `200`

### Errors
- `DELETE http://localhost:8080/webhooks/azerty`
- Response type:
``` javascript
[
  'error': {
    message: 'No job to remove',
    status: 404
  }
```

---------------------------------------
- `DELETE http://localhost:8080/webhooks`
- Response type:
``` javascript
[
  'error': {
    message: 'No jobs to remove',
    status: 404
  }
```

# Deploy in development

## Prerequisite
- [NodeJS] (https://nodejs.org)
- [MongoDB] (https://www.mongodb.com/) <br/>
or
- [Docker] (https://www.docker.com)

## Environment variables
- `MONGO_URL` (default: `mongodb://localhost/agenda`)
- `NODE_ENV` (values: `production` or `developpement`)
- `IP` (default: `localhost`)
- `PORT` (default: `8080`)

## NodeJS
### Build
- `npm install`
- `npm run build-minified-files`

## Run
- `mongod` (on an other terminal)
- `npm start`

## Docker
### Build
- `docker build -t scheduly .`

### Run
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app scheduly npm install`
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --net host scheduly`
