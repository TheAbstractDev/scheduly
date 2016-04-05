var express = require('express')
var bodyParser = require('body-parser')
var ip = process.env.IP || 'localhost'
var hbs = require('hbs')
var path = require('path')
var _ = require('lodash')
var fs = require('fs')
var md5 = require('md5')
var app = express()
var Agenda = require('agenda')
var mongoConnectionString = 'mongodb://mongo-agenda/agenda'
var agenda = new Agenda({db: {address: mongoConnectionString}})
var rp = require('request-promise')
var moment = require('moment')

// view engine setup
hbs.registerHelper('assets', (process.env.NODE_ENV === 'production' ? _.memoize : _.identity)(function (filePath) {
  var file = fs.readFileSync('assets' + (process.env.NODE_ENV === 'production' ? '/prod' : '/dev') + filePath, 'utf8')
  return '/assets' + filePath + '?v=' + md5(file).substring(10, 0)
}))

app.use('/assets/', express.static(path.join(__dirname, '/assets', process.env.NODE_ENV === 'production' ? 'prod' : 'dev')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'hbs')

function scheduleJob (jobID, url, body, scheduling) {
  agenda.define(jobID, function (job, done) {
    rp({
      method: 'POST',
      uri: url,
      body: body,
      json: true
    })
    done()
  })
  agenda.every(scheduling, jobID, {url: url, state: 'test'})
}

function getAllJobs (callback) {
  var jobsArray = []
  agenda.jobs({}, function (err, jobs) {
    if (err) { console.log(err) }
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].attrs.lastRunAt && jobs[i].attrs.lastFinishedAt) {
        if (jobs[i].attrs.data) {
          jobsArray[i] = {
            name: jobs[i].attrs.name,
            url: jobs[i].attrs.data.url,
            lastRunAt: moment(new Date(jobs[i].attrs.lastRunAt)).calendar(),
            nextRunAt: moment(new Date(jobs[i].attrs.nextRunAt)).calendar(),
            state: jobs[i].attrs.data.state
          }
        } else {
          jobsArray[i] = {
            name: jobs[i].attrs.name,
            lastRunAt: moment(new Date(jobs[i].attrs.lastRunAt)).calendar(),
            nextRunAt: moment(new Date(jobs[i].attrs.nextRunAt)).calendar()
          }
        }
      } else {
        if (jobs[i].attrs.data) {
          jobsArray[i] = {
            name: jobs[i].attrs.name,
            url: jobs[i].attrs.data.url,
            nextRunAt: moment(new Date(jobs[i].attrs.nextRunAt)).calendar(),
            state: jobs[i].attrs.data.state
          }
        } else {
          jobsArray[i] = {
            name: jobs[i].attrs.name,
            nextRunAt: moment(new Date(jobs[i].attrs.nextRunAt)).calendar()
          }
        }
      }
    }
    return callback(jobsArray)
  })
}

function removeAllJobs () {
  agenda.jobs({}, function (err, jobs) {
    if (err) { console.log(err) }
    for (var i = 0; i < jobs.length; i++) {
      jobs[i].remove(function (err) {
        if (err) console.log(err)
        agenda.purge(function (err, numRemoved) {
          if (err) console.log(err)
          return
        })
      })
    }
  })
}

function removeJob (name) {
  agenda.jobs({name: name}, function (err, jobs) {
    if (err) { console.log(err) }
    jobs[0].remove()
  })
}

function graceful () {
  console.log('\nbye')
  agenda.stop(function () {
    process.exit(0)
  })
}

process.on('SIGTERM', graceful)
process.on('SIGINT', graceful)

agenda.on('ready', function () {
  getAllJobs(function (data) {
    if (data.length > 0) agenda.start()
  })
})

app.post('/webhook', function (req, res) {
  if (req.body.url && req.body.scheduling && req.body.body) {
    var url = req.body.url
    var scheduling = req.body.scheduling
    var body = req.body.body
    var jobID = md5(url + Math.floor(Math.random() * (45 - 1 + 1)) + 1).substring(5, 0)

    scheduleJob(jobID, url, body, scheduling)
    res.sendStatus(200)
  } else {
    res.render('error', {message: 'no parameters'})
  }
})

app.delete('/webhook', function (req, res) {
  removeAllJobs()
})

app.delete('/webhook/:name', function (req, res) {
  if (req.params.name) { removeJob(req.params.name) }
})

app.get('/', function (req, res) {
  getAllJobs(function (data) {
    data.length === 0 ? res.render('index', {title: 'No jobs'}) : res.render('index', {jobs: data})
  })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

app.listen(8080, function () {
  if (ip === 'localhost' || ip[0] === '1') {
    console.log('Server running on http://' + ip + ':8080')
  } else if (ip !== 'localhost' && ip[0] !== '1') {
    console.error('Your ip address is not valid')
    process.exit(1)
  }
})
