![Scheduly](./assets/img/Scheduly.png)

# Scheduly
Scheduly is a Lightweight NodeJS webhooks scheduler

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
- [Creating webhooks](#creating-webhooks)
- [Updating webhooks](#updating-webhooks)
- [Getting webhooks](#getting-webhooks)
- [Removing webhooks](#removing-webhooks)
- [Deploy in development](#deploy-in-development)

## Creating Webhooks
Creates a webhooks with the given body.
##### Required body:
- URL
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

### Example
- `POST http://localhost:8080/webhooks`
- Body :
``` javascript
{  
   "url": "http://requestb.in/1nlqxcr1",
   "scheduling": "* * * * *",
   "body": {  
      "hello":"world"
   }
}
```
- Response:
``` javascript
Status: 201 <br/>
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/1nlqxcr1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  }
]
```

---------------------------------------
##### Note:
- If `scheduling interval` is at the cron format, the webhooks will be executed every `scheduling interval`.
- If `scheduling inverval` is at the human interval format, the webhooks will be executed once at `scheduling interval`.

### Errors
- `POST http://localhost:8080/webhooks`
- Body :
``` javascript
{  
   "url": "http://requestb.in/1nlqxcr1",
   "body": {  
      "hello":"world"
   }
}
```
- Response: 
``` javascript
Status: 400 <br/>
{
  'error': {
    message: 'Missing required parameter'
  }
}
```

---------------------------------------
- `POST http://localhost:8080/webhooks`
- Body :
``` javascript
{
   "scheduling": "* * * * *",
   "body": {  
      "hello":"world"
   }
}
```
- Response: 
``` javascript
Status: 400 <br/>
{
  'error': {
    message: 'Missing required parameter'
  }
}
```

---------------------------------------
- `POST http://localhost:8080/webhooks`
- Body :
``` javascript
{
   "url": "http://requestb.in/1nlqxcr1",
   "scheduling": "test",
   "body": {  
      "hello":"world"
   }
}
```
- Response:
``` javascript
Status: 400 <br/>
{
  'error': {
    message: 'test is not a valid time interval !'
  }
}
```

## Updating Webhooks
Updates a given webhooks with the new body.
##### Required body:
- URL
- Scheduling Interval ([cron format] (http://www.nncron.ru/help/EN/working/cron-format.htm) or [human interval] (https://github.com/rschmukler/human-interval))
- Body

### Example
- `PUT http://localhost:8080/webhooks/5730a487a3dc0e13009c0a45`
- Body :
``` javascript
{  
   "url": "http://requestb.in/1nlqxcr1",
   "scheduling": "in 2 minutes",
   "body": {  
      "hello":"world"
   }
}
```
- Response:
``` javascript
Status: 200 <br/>
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/1nlqxcr1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  }
]
```

---------------------------------------
##### Note:
- If `scheduling interval` is at the cron format, the webhooks will be executed every `scheduling interval`.
- If `scheduling inverval` is at the human interval format, the webhooks will be executed once at `scheduling interval`.

### Errors
- `PUT http://localhost:8080/webhooks/azerty`
- Body :
``` javascript
{  
   "url": "http://requestb.in/1nlqxcr1",
   "scheduling": "in 2 minutes",
   "body": {  
      "hello":"world"
   }
}
```
- Response:
``` javascript
Status: 404 <br/>
{
  'error': {
    message: 'No webhooks to update'
  }
}
```

## Getting Webhooks
If a query parameters (`offset` and `limit`) are given, returns paginated webhooks or returns all webhooks

### Example
- `GET http://localhost:8080/webhooks`
- Response:
``` javascript
Status: 200 <br/>
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/1nlqxcr1",
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

---------------------------------------
- `GET http://localhost:8080/webhooks/5730a487a3dc0e13009c0a45`
- Response:
``` javascript
Status: 200 <br/>
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/1nlqxcr1",
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

---------------------------------------
- `GET http://localhost:8080/webhooks?offset=4&limit=2`
- Response:
``` javascript
Status: 200 <br/>
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/1nlqxcr1",
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
    "url": "http://requestb.in/1nlqxcr1",
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

## Removing Webhooks
Removes the given webhooks if a query parameter (`id`) is given or removes all webhooks

### Example
- `DELETE http://localhost:8080/webhooks`
- Response:
``` javascript
Status: 200 <br/>
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/1nlqxcr1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  },
  {
    "id": "5730a487a3dc0e13009c0a46",
    "url": "http://requestb.in/1nlqxcr1",
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

---------------------------------------
- `DELETE http://localhost:8080/webhooks/5730a487a3dc0e13009c0a45`
``` javascript
[
  {
    "id": "5730a487a3dc0e13009c0a45",
    "url": "http://requestb.in/1nlqxcr1",
    "body": {
      "hello": "world"
    },
    "lastRunAt": null,
    "lastFinishedAt": null,
    "nextRunAt": "2016-05-09T14:56:00.246Z"
  }
]
```

### Errors
- `DELETE http://localhost:8080/webhooks/azerty`
- Response:
``` javascript
Status: 404 <br/>
{
  'error': {
    message: 'No webhooks to remove'
  }
}
```

---------------------------------------
- `DELETE http://localhost:8080/webhooks`
- Response:
``` javascript
Status: 404 <br/>
{
  'error': {
    message: 'No webhooks to remove'
  }
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
- `npm run build`

## Run
- `mongod` (on an other terminal)
- `npm start`

## Docker
### Build
- `docker build -t scheduly .`

### Install node modules
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app node:onbuild npm install`

### Run
- `docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --net host scheduly`
