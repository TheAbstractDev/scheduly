var Agenda = require('agenda')
var mongoConnectionString = 'mongodb://mongo-agenda/agenda'
var agenda = new Agenda({db: {address: mongoConnectionString}})
var rp = require('request-promise')
var state

module.exports = {
  requestState: function (data) {
    if (data) { state = data }
    return state
  },
  defineJob: function (jobID, url, body, scheduling) {
    agenda.define(jobID, function (job, done) {
      var options = {
        method: 'POST',
        uri: url,
        body: body,
        json: true
      }
      rp(options)
        .then(function () {
          this.requestState('completed')
        })
        .catch(function (err) {
          this.requestState('failed: ' + err)
        })
      done()
    })
  },
  getAllJobs: function (callback) {
    var jobsArray = []
    agenda.jobs({}, function (err, jobs) {
      if (err) { console.log(err) }
      for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].attrs.lastRunAt && jobs[i].attrs.lastFinishedAt) {
          if (jobs[i].attrs.data) {
            jobsArray[i] = {
              name: jobs[i].attrs.name,
              url: jobs[i].attrs.data.url,
              lastRunAt: jobs[i].attrs.lastRunAt,
              nextRunAt: jobs[i].attrs.nextRunAt,
              state: jobs[i].attrs.data.state
            }
          } else {
            jobsArray[i] = {
              name: jobs[i].attrs.name,
              lastRunAt: jobs[i].attrs.lastRunAt,
              nextRunAt: jobs[i].attrs.nextRunAt
            }
          }
        } else {
          if (jobs[i].attrs.data) {
            jobsArray[i] = {
              name: jobs[i].attrs.name,
              url: jobs[i].attrs.data.url,
              nextRunAt: jobs[i].attrs.nextRunAt,
              state: jobs[i].attrs.data.state
            }
          } else {
            jobsArray[i] = {
              name: jobs[i].attrs.name,
              nextRunAt: jobs[i].attrs.nextRunAt
            }
          }
        }
      }
      return callback(jobsArray)
    })
  },
  removeAllJobs: function () {
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
  },
  removeJob: function (name) {
    agenda.jobs({name: name}, function (err, jobs) {
      if (err) { console.log(err) }
      jobs[0].remove()
    })
  },
  scheduleJob: function (jobID, url, body, scheduling) {
    this.defineJob(jobID, url, body, scheduling)
    agenda.every(scheduling, jobID, {url: url, state: 'test'})
  // var state = this.requestState()
  // newJob.repeatEvery(scheduling, {
  //   timezone: 'Europe/Paris'
  // }).save()
  }
}

agenda.on('ready', function () {
  agenda.start()
})
