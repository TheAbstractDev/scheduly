var Agenda = require('agenda')
var mongoConnectionString = "mongodb://mongo-agenda/agenda";
var agenda = new Agenda({db: {address: mongoConnectionString}})
var rp = require('request-promise')

module.exports = {
	createNewPostRequestWithData: function (jobID, url, body, scheduling) {
		agenda.define(jobID, function (job, done) {
      var options = {
        method: 'POST',
        uri: url,
        body: body,
        json: true
      }
      rp(options)
      .then(function () {
        console.log('success')
      })
      .catch(function (err) {
        res.render('error', {message: err})
      })
     	var newJob = agenda.create(jobID)
		  newJob.save()
		  done()
    })
	},
	performJobEvery: function (jobID, scheduling) {
	  agenda.every(scheduling, jobID)
	  agenda.start()
	},
	scheduleJobAt: function (jobID, scheduling) {
	  agenda.schedule(scheduling, jobID)
	  agenda.start()
	},
	performJobNow: function (jobID) {
	  agenda.now(jobID)
	  agenda.start()
	},
	getAllJobs: function () {
		agenda.jobs({}, function (err, jobs) {
			for (var i = 0; i < jobs.length; i++) {
				console.log(jobs[i].attrs.name)
			}
		})
	},
	removeAllJobs: function () {
		agenda.purge(function(err, numRemoved) {
			return
		})
	}
}