var express = require('express')
var router = express.Router()
var md5 = require('md5')
var JobManager = require('../job-manager')

router.route('/')
  .post(function (req, res) {
    if (req.body.url && req.body.scheduling && req.body.body) {
      var url = req.body.url
      var scheduling = req.body.scheduling
      var body = req.body.body
      var jobID = md5(url + Math.floor(Math.random() * (45 - 1 + 1)) + 1).substring(5, 0)

      JobManager.scheduleJob(jobID, url, body, scheduling)
      res.sendStatus(200)
    } else {
      res.render('error', {message: 'no parameters'})
    }
  })

  .delete(function (req, res) {
    JobManager.removeAllJobs()
  })

router.route('/:name')
  .delete(function (req, res) {
    if (req.params.name) {
      var jobName = req.params.name
      JobManager.removeJob(jobName)
    }
  })

module.exports = router
