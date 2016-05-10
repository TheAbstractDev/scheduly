var Agenda = require('agenda')
var agenda = new Agenda({db: {address: process.env.MONGO_URL}})
var rp = require('request-promise')
var humanInterval = require('./human-interval')
var ObjectId = require('mongodb').ObjectId
var CronJob = require('cron').CronJob

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

function paginate (offset, limit, data) {
  limit = (limit <= data.length) ? limit : (data.length < 10 ? data.length : 10)
  offset = offset || 0
  var paginatedData = []
  for (var i = offset; i < limit; i++) paginatedData.push(data[i])
  return paginatedData
}

module.exports = {
  createJob: function (req, res) {
    if (req.body.url && req.body.scheduling && req.body.body) {
      var webhook = agenda.create('webhook', {url: req.body.url, body: req.body.body})
      try {
        var cron = new CronJob(req.body.scheduling)
        if (cron) {
          webhook.repeatEvery(req.body.scheduling)
          webhook.computeNextRunAt()
          webhook.save(function (err) {
            if (err) res.status(400).send('Job not created')
            else res.status(200).json({
              name: webhook.attrs.name,
              id: webhook.attrs._id,
              url: webhook.attrs.data.url,
              body: JSON.stringify(webhook.attrs.data.body),
              lastRunAt: webhook.attrs.lastRunAt || '...',
              lastFinishedAt: webhook.attrs.lastFinishedAt || '...',
              nextRunAt: webhook.attrs.nextRunAt,
              repeatInterval: webhook.attrs.repeatInterval || '...'
            })
          })
        }
      } catch (err) {
        if (!isNaN(humanInterval(req.body.scheduling)) && humanInterval(req.body.scheduling) !== '') {
          webhook.schedule(req.body.scheduling)
          webhook.save(function (err) {
            if (err) res.status(400).send('Job not created')
            else res.status(200).json({
              name: webhook.attrs.name,
              id: webhook.attrs._id,
              url: webhook.attrs.data.url,
              body: JSON.stringify(webhook.attrs.data.body),
              lastRunAt: webhook.attrs.lastRunAt || '...',
              lastFinishedAt: webhook.attrs.lastFinishedAt || '...',
              nextRunAt: webhook.attrs.nextRunAt,
              repeatInterval: webhook.attrs.repeatInterval || '...'
            })
          })
        }
        if (isNaN(humanInterval(req.body.scheduling))) res.status(400).send(req.body.scheduling + ' is not a valid time inteval !')
      }
    } else {
      res.status(400).send('Missing required parameters')
    }
  },
  getJobs: function (req, res) {
    var jobsArray = []
    agenda.jobs((req.params.id) ? {_id: new ObjectId(req.params.id)} : {}, function (err, jobs) {
      if (jobs.length !== 0) {
        if (req.params.id) {
          if (jobs[0].attrs.data) {
            if (jobs[0].attrs.failReason) {
              jobsArray = [{
                name: jobs[0].attrs.name,
                id: jobs[0].attrs._id,
                url: jobs[0].attrs.data.url,
                body: JSON.stringify(jobs[0].attrs.data.body),
                lastRunAt: jobs[0].attrs.lastRunAt || '...',
                lastFinishedAt: jobs[0].attrs.lastFinishedAt || '...',
                nextRunAt: jobs[0].attrs.nextRunAt,
                status: 'failed - ' + jobs[0].attrs.failReason
              }]
            } else {
              if (jobs[0].attrs.nextRunAt === jobs[0].attrs.lastFinishedAt) {
                agenda.stop()
                jobsArray = [{
                  name: jobs[0].attrs.name,
                  id: jobs[0].attrs._id,
                  url: jobs[0].attrs.data.url,
                  body: JSON.stringify(jobs[0].attrs.data.body),
                  lastRunAt: jobs[0].attrs.lastRunAt || '...',
                  lastFinishedAt: jobs[0].attrs.lastFinishedAt || '...',
                  nextRunAt: '...',
                  status: 'completed'
                }]
              } else {
                jobsArray = [{
                  name: jobs[0].attrs.name,
                  id: jobs[0].attrs._id,
                  url: jobs[0].attrs.data.url,
                  body: JSON.stringify(jobs[0].attrs.data.body),
                  lastRunAt: jobs[0].attrs.lastRunAt || '...',
                  lastFinishedAt: jobs[0].attrs.lastFinishedAt || '...',
                  nextRunAt: jobs[0].attrs.nextRunAt,
                  repeatInterval: jobs[0].attrs.repeatInterval || '...',
                  status: 'scheduled'
                }]
              }
            }
          }
        } else {
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
        }
      }
      if (req.url === '/') jobsArray.length === 0 ? res.render('index', {title: 'No jobs'}) : res.render('index', {jobs: jobsArray})
      if (req.url === '/' + req._parsedUrl.search) jobsArray.length === 0 ? res.render('index', {title: 'No jobs'}) : res.render('index', {jobs: paginate(req.query.offset, req.query.limit, jobsArray)})
      if (req.url === '/webhooks') jobsArray.length === 0 ? res.status(400).send('No jobs') : res.status(200).json(jobsArray)
      if (req.url === '/webhooks/' + req.params.id) jobsArray.length === 0 ? res.status(400).send('No job') : res.status(200).json(jobsArray)
      if (req.url === '/webhooks' + req._parsedUrl.search) jobsArray.length === 0 ? res.status(400).send('No jobs') : res.status(200).json(paginate(req.query.offset, req.query.limit, jobsArray))
      if (req.url === '/webhooks/' + req._parsedUrl.search) jobsArray.length === 0 ? res.status(400).send('No jobs') : res.status(200).json(paginate(req.query.offset, req.query.limit, jobsArray))
    })
  },
  updateJob: function (req, res) {
    if (req.params.id) {
      agenda.jobs({_id: new ObjectId(req.params.id)}, function (err, jobs) {
        if (jobs.length !== 0) {
          if (req.body) {
            jobs[0].attrs.data.url = req.body.url
            jobs[0].attrs.data.body = req.body.body
            jobs[0].attrs.repeatInterval = req.body.scheduling
            jobs[0].save()
          }
          res.status(200).json({
            name: jobs[0].attrs.name,
            id: jobs[0].attrs._id,
            url: jobs[0].attrs.data.url,
            body: JSON.stringify(jobs[0].attrs.data.body),
            lastRunAt: jobs[0].attrs.lastRunAt || '...',
            lastFinishedAt: jobs[0].attrs.lastFinishedAt || '...',
            nextRunAt: jobs[0].attrs.nextRunAt,
            repeatInterval: jobs[0].attrs.repeatInterval || '...'
          })
        } else {
          res.status(400).send('No job to update')
        }
      })
    }
  },
  removeJobs: function (req, res) {
    if (req.params.id) {
      agenda.jobs({_id: new ObjectId(req.params.id)}, function (err, jobs) {
        if (jobs.length !== 0) {
          jobs[0].remove()
          res.sendStatus(200)
        } else {
          res.status(400).send('No job to remove')
        }
      })
    } else {
      agenda.jobs({}, function (err, jobs) {
        if (jobs.length !== 0) {
          for (var i = 0; i < jobs.length; i++) {
            jobs[i].remove(function (err) {
              if (err) console.log(err)
              agenda.purge(function (err, numRemoved) {
                if (err) console.log(err)
                return
              })
            })
          }
          res.sendStatus(200)
        } else {
          res.status(400).send('No jobs to remove')
        }
      })
    }
  },
  graceful: function () {
    console.log('\nbye')
    agenda.stop(function () {
      process.exit(0)
    })
  },
  start: function () {
    agenda.on('ready', function () {
      agenda.start()
    })
  }
}
