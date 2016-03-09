var express = require('express')
var router = express.Router()
var JobManager = require('../job-manager')

router.route('/')
	.post(function (req, res, next) {
	  if (req.body.url && req.body.scheduling && req.body.body) {
	    var url = req.body.url
	    var scheduling = req.body.scheduling
	    var body = req.body.body
	    var jobID = md5(url).substring(5, 0)

	    if (req.body.repeat === 'true') {
	      JobManager.schedulejobEvery(jobID, url, body, scheduling)
	    } else if (req.body.repeat === 'false') {
	      JobManager.scheduleJobOnceAt(jobID, url, body, scheduling)
	    } else {
	      res.render('error', {message: 'repeat must be true or false'})
	    }
	    res.sendStatus(200)
	  } else {
	    res.render('error', {message: 'no parameters'})
	  }
	})

  .delete(function (req, res, next) {
    JobManager.removeAllJobs()
  })

router.route('/:id')
  .delete(function (req, res, next) {
    console.log(req)
  })


module.exports = router