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
var humanInterval = require('human-interval')
var CronJob = require('cron').CronJob

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

agenda.define('webhook', function (job, done) {
  return rp({
    method: 'POST',
    uri: job.attrs.data.url,
    body: job.attrs.data.body,
    json: true
  }).then(function () {
    done()
  }).catch(function (err) {
    done(err)
  })
})

function createJob (scheduling, data) {
  var webhook = agenda.create('webhook', data)
  try {
    var cron = new CronJob(scheduling)
    if (cron) {
      webhook.repeatEvery(scheduling)
      webhook.computeNextRunAt()
      webhook.save(function (err) {
        if (err) console.log('Job not created')
      })
    }
  } catch (err) {
    if (humanInterval(scheduling) !== '') {
      webhook.schedule(scheduling)
      webhook.save(function (err) {
        if (err) console.log('Job not created')
      })
    }
  }
}

function getAllJobs (callback) {
  var jobsArray = []
  agenda.jobs({}, function (err, jobs) {
    if (err) console.log(err)
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].attrs.data) {
        if (jobs[i].attrs.failReason) {
          jobsArray[i] = {
            name: jobs[i].attrs.name,
            url: jobs[i].attrs.data.url,
            lastRunAt: jobs[i].attrs.lastRunAt || '...',
            lastFinishedAt: jobs[i].attrs.lastFinishedAt || '...',
            nextRunAt: jobs[i].attrs.nextRunAt,
            status: 'failed - ' + jobs[i].attrs.failReason
          }
        } else {
          if (jobs[i].attrs.nextRunAt === jobs[i].attrs.lastFinishedAt) {
            agenda.stop()
            jobsArray[i] = {
              name: jobs[i].attrs.name,
              url: jobs[i].attrs.data.url,
              lastRunAt: jobs[i].attrs.lastRunAt || '...',
              lastFinishedAt: jobs[i].attrs.lastFinishedAt || '...',
              nextRunAt: '...',
              status: 'completed'
            }
          } else {
            jobsArray[i] = {
              name: jobs[i].attrs.name,
              url: jobs[i].attrs.data.url,
              lastRunAt: jobs[i].attrs.lastRunAt || '...',
              lastFinishedAt: jobs[i].attrs.lastFinishedAt || '...',
              nextRunAt: jobs[i].attrs.nextRunAt,
              status: 'scheduled'
            }
          }
        }
      }
    }
    return callback(jobsArray)
  })
}

function updateJob (name, data) {
  if (name) {
    agenda.jobs({name: name}, function (err, jobs) {
      if (err) console.log(err)
      jobs[0].attrs.data = data
    })
  }
}

function removeJobs (name) {
  if (name) {
    agenda.jobs({name: name}, function (err, jobs) {
      if (err) console.log(err)
      jobs[0].remove()
    })
  } else {
    agenda.jobs({}, function (err, jobs) {
      if (err) console.log(err)
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
  agenda.start()
})

app.get('/', function (req, res) {
  getAllJobs(function (data) {
    data.length === 0 ? res.render('index', {title: 'No jobs'}) : res.render('index', {jobs: data})
  })
})

app.get('/webhooks', function (req, res) {
  getAllJobs(function (data) {
    data.length === 0 ? res.json({}) : res.json(data)
  })
})

app.post('/webhook', function (req, res) {
  if (req.body.url && req.body.scheduling && req.body.body) {
    createJob(req.body.scheduling, {url: req.body.url, body: req.body.body})
    res.sendStatus(200)
  } else {
    res.render('error', {message: 'no parameters'})
  }
})

// app.put('/webhook/:name', function (req, res) {
//   if (req.params.name) updateJob(req.params.name, {})
// })

app.delete('/webhook', function (req, res) {
  removeJobs()
})

app.delete('/webhook/:name', function (req, res) {
  if (req.params.name) removeJobs(req.params.name)
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
