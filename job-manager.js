var Agenda = require('agenda')
var mongoConnectionString = "mongodb://mongo-agenda/agenda";
var agenda = new Agenda({db: {address: mongoConnectionString, options: {server: {auto_reconnect: true}}}})
var request = require('request')

module.exports = {
  defineJob: function (jobID, url, body, scheduling) {
    agenda.define(jobID, function (job, done) {
      console.log('lol')
      done()
    })
  },
	getAllJobs: function (callback) {
    var jobsArray = []
    agenda.jobs({}, function (err, jobs) {
			for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].attrs.lastRunAt && jobs[i].attrs.lastFinishedAt) {
          if (jobs[i].attrs.data) {
            jobsArray[i] = {
              name: jobs[i].attrs.name,
              url: jobs[i].attrs.data.url,
              lastRunAt: jobs[i].attrs.lastRunAt,
              lastFinishedAt: jobs[i].attrs.lastFinishedAt,
              nextRunAt: jobs[i].attrs.nextRunAt,
              state: jobs[i].attrs.data.state
            }
          } else {
            jobsArray[i] = {
              name: jobs[i].attrs.name,
              lastRunAt: jobs[i].attrs.lastRunAt,
              lastFinishedAt: jobs[i].attrs.lastFinishedAt,
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
      for (var i = 0; i < jobs.length; i++) {
        jobs[i].remove(function(err) {
          if(err) console.log(err)
          agenda.purge(function(err, numRemoved) {
            if (err) console.log(err)
            return
          })
        })
      }
    })
	},
  removeJob: function (name) {
    agenda.cancel({name: name}, function(err) {
      if (err) console.log(err)
      return
    })
  },
  scheduleJob: function (jobID, url, body, scheduling) {
    this.defineJob(jobID, url, body, scheduling)
    var newJob = agenda.create(jobID, {url: url, state: 'test'})
    newJob.repeatEvery(scheduling).save()
    // agenda.every(scheduling, jobID)
    agenda.start()
  }
}