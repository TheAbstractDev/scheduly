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
var ObjectId = require('mongodb').ObjectId
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

function createJob (req, res) {
  if (req.body.url && req.body.scheduling && req.body.body) {
    var webhook = agenda.create('webhook', {url: req.body.url, body: req.body.body})
    try {
      var cron = new CronJob(req.body.scheduling)
      if (cron) {
        webhook.repeatEvery(req.body.scheduling)
        webhook.computeNextRunAt()
        webhook.save(function (err) {
          if (err) console.log('Job not created')
        })
      }
    } catch (err) {
      if (humanInterval(req.body.scheduling) !== '') {
        webhook.schedule(req.body.scheduling)
        webhook.save(function (err) {
          if (err) console.log('Job not created')
        })
      }
    }
    res.sendStatus(200)
  } else {
    res.render('error', {message: 'no parameters'})
  }
}

function getAllJobs (req, res) {
  var jobsArray = []
  agenda.jobs({}, function (err, jobs) {
    if (err) console.log(err)
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].attrs.data) {
        if (jobs[i].attrs.failReason) {
          jobsArray[i] = {
            name: jobs[i].attrs.name,
            id: jobs[i].attrs._id,
            url: jobs[i].attrs.data.url,
            body: JSON.stringify(jobs[i].attrs.data.body),
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
              id: jobs[i].attrs._id,
              url: jobs[i].attrs.data.url,
              body: JSON.stringify(jobs[i].attrs.data.body),
              lastRunAt: jobs[i].attrs.lastRunAt || '...',
              lastFinishedAt: jobs[i].attrs.lastFinishedAt || '...',
              nextRunAt: '...',
              status: 'completed'
            }
          } else {
            jobsArray[i] = {
              name: jobs[i].attrs.name,
              id: jobs[i].attrs._id,
              url: jobs[i].attrs.data.url,
              body: JSON.stringify(jobs[i].attrs.data.body),
              lastRunAt: jobs[i].attrs.lastRunAt || '...',
              lastFinishedAt: jobs[i].attrs.lastFinishedAt || '...',
              nextRunAt: jobs[i].attrs.nextRunAt,
              repeatInterval: jobs[i].attrs.repeatInterval || '...',
              status: 'scheduled'
            }
          }
        }
      }
    }
    if (req.url === '/') jobsArray.length === 0 ? res.render('index', {title: 'No jobs'}) : res.render('index', {jobs: jobsArray})
    if (req.url === '/webhooks') jobsArray.length === 0 ? res.json({}) : res.json(jobsArray)
  })
}

function updateJob (req, res) {
  if (req.params.id) {
    agenda.jobs({_id: new ObjectId(req.params.id)}, function (err, jobs) {
      if (err) console.log(err)
      if (req.body) {
        jobs[0].attrs.data.url = req.body.url
        jobs[0].attrs.data.body = req.body.body
        jobs[0].attrs.repeatInterval = req.body.scheduling
        jobs[0].save()
      }
    })
  }
}

function removeJobs (req, res) {
  if (req.params.id) {
    agenda.jobs({_id: new ObjectId(req.params.id)}, function (err, jobs) {
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

app.get('/', getAllJobs)

app.get('/webhooks', getAllJobs)

app.post('/webhook', createJob)

app.put('/webhook/:id', updateJob)

app.delete('/webhook', removeJobs)

app.delete('/webhook/:id', removeJobs)


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
