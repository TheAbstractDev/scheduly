var Agenda = require('agenda')
var mongoConnectionString = "mongodb://mongo-agenda/agenda";
var agenda = new Agenda({db: {address: mongoConnectionString}})
var request = require('request')

module.exports = {
	createNewPostRequestWithData: function (jobID, url, body, callback) {
    agenda.define(jobID, function (job) {
      request.post(url, {form: body}, function (err) {
        if (!err) {
          return callback('completed')
        } else {
          return callback('failed: ' + err)
        }
      })
    })
  },
  schedulejobEvery: function (jobID, url, body, scheduling) {
    this.createNewPostRequestWithData(jobID, url, body, function (state) {
      var newJob = agenda.create(jobID, {url: url, state: state})
      newJob.save()
    })
    agenda.every(scheduling, jobID)
    agenda.start()
  },
  scheduleJobOnceAt: function (jobID, url, body, scheduling) {
    var requestState
    this.createNewPostRequestWithData(jobID, url, body, function (state) {
      var newJob = agenda.create(jobID, {url: url, state: state})
    })
    agenda.schedule(scheduling, jobID)
    agenda.start()
  },
  scheduleJobNow: function (jobID, url, body) {
    var requestState
    this.createNewPostRequestWithData(jobID, url, body, function (state) {
      requestState = state
    })
    agenda.now(jobID, {url: url, state: requestState})
	  agenda.start()
	},
	getAllJobs: function (callback) {
    var jobsArray = []
    agenda.jobs({}, function (err, jobs) {
			for (var i = 1; i < jobs.length; i++) {
        if (jobs[i].attrs.lastRunAt && jobs[i].attrs.lastFinishedAt) {
          if (jobs[i].attrs.data) {
            jobsArray[i] = {
              url: jobs[i].attrs.data.url,
              lastRunAt: jobs[i].attrs.lastRunAt,
              lastFinishedAt: jobs[i].attrs.lastFinishedAt,
              nextRunAt: jobs[i].attrs.nextRunAt,
              state: jobs[i].attrs.data.state
            }
          } else {
            jobsArray[i] = {
              lastRunAt: jobs[i].attrs.lastRunAt,
              lastFinishedAt: jobs[i].attrs.lastFinishedAt,
              nextRunAt: jobs[i].attrs.nextRunAt
            }
          }
        } else {
          if (jobs[i].attrs.data) {
            jobsArray[i] = {
              url: jobs[i].attrs.data.url,
              nextRunAt: jobs[i].attrs.nextRunAt,
              state: jobs[i].attrs.data.state
            }
          } else {
            jobsArray[i] = {
              nextRunAt: jobs[i].attrs.nextRunAt,
            }
          }
        }
			}
      return callback(jobsArray)
    })
	},
	removeAllJobs: function () {
		agenda.purge(function(err, numRemoved) {
			if (err) return err
			return
		})
	}
}