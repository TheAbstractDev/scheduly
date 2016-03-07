var Agenda = require('agenda')
var mongoConnectionString = "mongodb://mongo-agenda/agenda";
var agenda = new Agenda({db: {address: mongoConnectionString}})
var rp = require('request-promise')

module.exports = {
	createNewPostRequestWithData: function (jobID, url, body, callback) {
    agenda.define(jobID, function (job, done) {
      var options = {
        method: 'POST',
        uri: url,
        body: body,
        json: true
      }
      rp(options)
      .then(function () {
        callback('completed')
      })
      .catch(function (err) {
        callback('failed')
      })
		  done()
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
    this.createNewPostRequestWithData(jobID, url, body, function (state) {
      console.log(state)
      var newJob = agenda.create(jobID, {url: url, state: state})
      newJob.save()
    })
    agenda.schedule(scheduling, jobID)
	  agenda.start()
	},
	scheduleJobNow: function (jobID, url, body) {
    this.createNewPostRequestWithData(jobID, url, body, function (state) {
      var newJob = agenda.create(jobID, {url: url, state: state})
      newJob.save()
    })
    agenda.now(jobID)
	  agenda.start()
	},
	getAllJobs: function (callback) {
    var jobsArray = []
    agenda.jobs({}, function (err, jobs) {
			for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].attrs.lastRunAt && jobs[i].attrs.lastFinishedAt) {
  				if (i <= 0) {
            jobsArray[i] = {
              lastRunAt: jobs[i].attrs.lastRunAt,
              lastFinishedAt: jobs[i].attrs.lastFinishedAt,
              nextRunAt: jobs[i].attrs.nextRunAt
            }
          } else {
            jobsArray[i] = {
              url: jobs[i].attrs.data.url,
              lastRunAt: jobs[i].attrs.lastRunAt,
              lastFinishedAt: jobs[i].attrs.lastFinishedAt,
              nextRunAt: jobs[i].attrs.nextRunAt,
              state: jobs[i].attrs.data.state
            }
          }
        } else {
          if (i <= 0) {
            jobsArray[i] = {
              nextRunAt: jobs[i].attrs.nextRunAt
            }
          } else {
            jobsArray[i] = {
              url: jobs[i].attrs.data.url,
              nextRunAt: jobs[i].attrs.nextRunAt,
              state: jobs[i].attrs.data.state
            }
          }
        }
			}
      return callback(jobsArray)
    })
	},
	removeAllJobs: function () {
		agenda.purge(function(err, numRemoved) {
			if (err) {console.log(err)}
			return
		})
	}
}