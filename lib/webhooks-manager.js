var Agenda = require('agenda')
var agenda = new Agenda({db: {address: process.env.MONGO_URL || 'mongodb://localhost/agenda'}})
var rp = require('request-promise')
var humanInterval = require('human-interval')
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

function paginate (previous_cursor, next_cursor, limit, data) {
  limit = (limit <= data.length) ? limit : (data.length < 10 ? data.length : 10)
  var paginatedData = []
  for (var i = 0; i < limit; i++) {
    if (data[i].id.toString().match(previous_cursor)) continue
    paginatedData.push(data[i])
    // if (data[i].id.toString() === previous_cursor) continue
    // paginatedData.push(data[i])
    // console.log(paginatedData)
    if (data[i].id.toString().match(next_cursor)) break
  }
  return paginatedData
}

module.exports = {
  createWebhooks: function (req, res) {
    if (req.body.url && req.body.scheduling && req.body.body) {
      var webhook = agenda.create('webhook', {url: req.body.url, body: req.body.body})
      try {
        var cron = new CronJob(req.body.scheduling)
        if (cron) {
          webhook.repeatEvery(req.body.scheduling)
          webhook.computeNextRunAt()
          webhook.save(function (err) {
            if (err) res.status(400).send({'error': {
              message: 'Webhooks not created',
              status: 400
            }})
            else res.status(201).json({
              id: webhook.attrs._id,
              url: webhook.attrs.data.url,
              body: JSON.stringify(webhook.attrs.data.body),
              lastRunAt: webhook.attrs.lastRunAt || null,
              lastFinishedAt: webhook.attrs.lastFinishedAt || null,
              nextRunAt: webhook.attrs.nextRunAt,
              repeatInterval: webhook.attrs.repeatInterval || null
            })
          })
        }
      } catch (err) {
        if (!isNaN(humanInterval(req.body.scheduling)) && humanInterval(req.body.scheduling) !== '') {
          webhook.schedule(req.body.scheduling)
          webhook.save(function (err) {
            if (err) res.status(400).send({'error': {
              message: 'Webhooks not created',
              status: 400
            }})
            else res.status(201).json({
              id: webhook.attrs._id,
              url: webhook.attrs.data.url,
              body: JSON.stringify(webhook.attrs.data.body),
              lastRunAt: webhook.attrs.lastRunAt || null,
              lastFinishedAt: webhook.attrs.lastFinishedAt || null,
              nextRunAt: webhook.attrs.nextRunAt,
              repeatInterval: webhook.attrs.repeatInterval || null
            })
          })
        }
        if (isNaN(humanInterval(req.body.scheduling))) res.status(400).send({'error': {
          message: req.body.scheduling + ' is not a valid time inteval !',
          status: 403
        }})
      }
    } else if (!req.body.url && !req.body.scheduling || !req.body.url || !req.body.scheduling ) {
      res.status(400).send({'error': {
        message: 'Missing required parameter',
        status: 403
      }})
    }
  },
  getWebhooks: function (req, res) {
    var jobsArray = []
    agenda.jobs((req.params.id) ? {_id: new ObjectId(req.params.id)} : {}, function (err, jobs) {
      if (jobs.length !== 0) {
        if (req.params.id) {
          if (jobs[0].attrs.data) {
            if (jobs[0].attrs.failReason) {
              jobsArray = [{
                id: jobs[0].attrs._id,
                url: jobs[0].attrs.data.url,
                body: JSON.stringify(jobs[0].attrs.data.body),
                lastRunAt: jobs[0].attrs.lastRunAt || null,
                lastFinishedAt: jobs[0].attrs.lastFinishedAt || null,
                nextRunAt: jobs[0].attrs.nextRunAt,
                status: 'failed - ' + jobs[0].attrs.failReason
              }]
            } else {
              if (jobs[0].attrs.nextRunAt === jobs[0].attrs.lastFinishedAt) {
                agenda.stop()
                jobsArray = [{
                  id: jobs[0].attrs._id,
                  url: jobs[0].attrs.data.url,
                  body: JSON.stringify(jobs[0].attrs.data.body),
                  lastRunAt: jobs[0].attrs.lastRunAt || null,
                  lastFinishedAt: jobs[0].attrs.lastFinishedAt || null,
                  nextRunAt: null,
                  status: 'completed'
                }]
              } else {
                jobsArray = [{
                  id: jobs[0].attrs._id,
                  url: jobs[0].attrs.data.url,
                  body: JSON.stringify(jobs[0].attrs.data.body),
                  lastRunAt: jobs[0].attrs.lastRunAt || null,
                  lastFinishedAt: jobs[0].attrs.lastFinishedAt || null,
                  nextRunAt: jobs[0].attrs.nextRunAt,
                  repeatInterval: jobs[0].attrs.repeatInterval || null,
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
                  id: jobs[i].attrs._id,
                  url: jobs[i].attrs.data.url,
                  body: JSON.stringify(jobs[i].attrs.data.body),
                  lastRunAt: jobs[i].attrs.lastRunAt || null,
                  lastFinishedAt: jobs[i].attrs.lastFinishedAt || null,
                  nextRunAt: jobs[i].attrs.nextRunAt,
                  status: 'failed - ' + jobs[i].attrs.failReason
                }
              } else {
                if (jobs[i].attrs.nextRunAt === jobs[i].attrs.lastFinishedAt) {
                  agenda.stop()
                  jobsArray[i] = {
                    id: jobs[i].attrs._id,
                    url: jobs[i].attrs.data.url,
                    body: JSON.stringify(jobs[i].attrs.data.body),
                    lastRunAt: jobs[i].attrs.lastRunAt || null,
                    lastFinishedAt: jobs[i].attrs.lastFinishedAt || null,
                    nextRunAt: null,
                    status: 'completed'
                  }
                } else {
                  jobsArray[i] = {
                    id: jobs[i].attrs._id,
                    url: jobs[i].attrs.data.url,
                    body: JSON.stringify(jobs[i].attrs.data.body),
                    lastRunAt: jobs[i].attrs.lastRunAt || null,
                    lastFinishedAt: jobs[i].attrs.lastFinishedAt || null,
                    nextRunAt: jobs[i].attrs.nextRunAt,
                    repeatInterval: jobs[i].attrs.repeatInterval || null,
                    status: 'scheduled'
                  }
                }
              }
            }
          }
        }
      }
      if (req.url === '/') jobsArray.length === 0 ? res.render('index', {title: 'No webhooks'}) : res.render('index', {jobs: jobsArray})
      if (req.url === '/' + req._parsedUrl.search) jobsArray.length === 0 ? res.render('index', {title: 'No webhooks'}) : res.render('index', {jobs: paginate(req.query.previous_cursor, req.query.next_cursor, req.query.limit, jobsArray)})
      if (req.url === '/webhooks') jobsArray.length === 0 ? res.status(200).send([{}]) : res.status(200).json(jobsArray)
      if (req.url === '/webhooks/' + req.params.id) jobsArray.length === 0 ? res.status(200).send([{}]) : res.status(200).json(jobsArray)
      if (req.url === '/webhooks' + req._parsedUrl.search) jobsArray.length === 0 ? res.status(200).send([{}]) : res.status(200).json(paginate(req.query.previous_cursor, req.query.next_cursor, req.query.limit, jobsArray))
      if (req.url === '/webhooks/' + req._parsedUrl.search) jobsArray.length === 0 ? res.status(200).send([{}]) : res.status(200).json(paginate(req.query.previous_cursor, req.query.next_cursor, req.query.limit, jobsArray))
    })
  },
  updateWebhooks: function (req, res) {
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
            id: jobs[0].attrs._id,
            url: jobs[0].attrs.data.url,
            body: JSON.stringify(jobs[0].attrs.data.body),
            lastRunAt: jobs[0].attrs.lastRunAt || null,
            lastFinishedAt: jobs[0].attrs.lastFinishedAt || null,
            nextRunAt: jobs[0].attrs.nextRunAt,
            repeatInterval: jobs[0].attrs.repeatInterval || null
          })
        } else {
          res.status(404).send({'error': {
            message: 'No webhooks to update',
            status: 404
          }})
        }
      })
    }
  },
  removeWebhooks: function (req, res) {
    if (req.params.id) {
      agenda.jobs({_id: new ObjectId(req.params.id)}, function (err, jobs) {
        if (jobs.length !== 0) {
          jobs[0].remove()
          res.status(200).send({
            id: jobs[0].attrs._id,
            url: jobs[0].attrs.data.url,
            body: JSON.stringify(jobs[0].attrs.data.body),
            lastRunAt: jobs[0].attrs.lastRunAt || null,
            lastFinishedAt: jobs[0].attrs.lastFinishedAt || null,
            nextRunAt: jobs[0].attrs.nextRunAt,
            repeatInterval: jobs[0].attrs.repeatInterval || null
          })
        } else {
          res.status(404).send({'error': {
            message: 'No webhooks to remove',
            status: 404
          }})
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
          res.status(404).send({'error': {
            message: 'No webhooks to remove',
            status: 404
          }})
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
