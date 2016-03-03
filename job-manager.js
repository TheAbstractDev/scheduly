var Agenda = require('agenda')
var mongoConnectionString = "mongodb://mongo-agenda/agenda";
var agenda = new Agenda({db: {address: mongoConnectionString}})
var rp = require('request-promise')

module.exports = {
	createNewPostRequestWithData: function (jobID, url, body) {
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
      done()
    })
	},
	performJob: function (jobID, scheduling) {
	  var newJob = agenda.create(jobID)
	  newJob.repeatEvery(scheduling).save()
	  agenda.start()
	  // agenda.jobs({'name': jobID}, function (err, jobs) {
	  // 	console.log(jobs)
	  // })
	},
	getJobs: function () {
	}
}