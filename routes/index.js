var express = require('express')
var router = express.Router()
var JobManager = require('../job-manager')

router.route('/')
  .get(function (req, res) {
    JobManager.getAllJobs(function (data) {
      data.length === 0 ? res.render('index', {title: 'No jobs'}) : res.render('index', {jobs: data})
    })
  })

module.exports = router
