var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var ip = process.env.IP || 'localhost'
var hbs = require('hbs')
var path = require('path')
var _ = require('lodash')
var fs = require('fs')
var md5 = require('md5')
var Agenda = require('agenda')
var app = express()
var mongoConnectionString = "mongodb://mongo-agenda/agenda";
var agenda = new Agenda({db: {address: mongoConnectionString}})
var rp = require('request-promise')
// var MongoClient = require('mongodb').MongoClient
// var assert = require('assert')

// MongoClient.connect(mongoConnectionString, function(err, db) {
//   console.log("Connected correctly to server.");
// })

function performJob(jobID, scheduling) {
  agenda.schedule(scheduling, jobID)
  agenda.start()
}

// view engine setup
hbs.registerHelper('assets', (process.env.NODE_ENV === 'production' ? _.memoize : _.identity)(function (filePath) {
  var file = fs.readFileSync('assets' + (process.env.NODE_ENV === 'production' ? '/prod' : '/dev') + filePath, 'utf8')
  return '/assets' + filePath + '?v=' + md5(file).substring(10, 0)
}))

app.use('/assets/', express.static(path.join(__dirname, '/assets', process.env.NODE_ENV === 'production' ? 'prod' : 'dev')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'hbs')

app.get('/', function (req, res) {
  res.render('index', {'title': 'Express'})
})

app.post('/webhook', function (req, res) {
  if (req.body.url && req.body.scheduling && req.body.body) {
    var url = req.body.url
    var scheduling = req.body.scheduling
    var body = req.body.body
    var jobID = md5(url).substring(5, 0)
    
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

    performJob(jobID, scheduling)
    res.sendStatus(200)
  } else {
    res.render('error', {message: 'no parameters'})
  }
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})


app.listen(8080, function () {
  if (ip === 'localhost' || ip[0] === '1') {
    console.log('Server running on http://' + ip + ':8080')
  } else if (ip !== 'localhost' && ip[0] !== '1') {
    console.error('Your ip address is not valid')
    process.exit(1)
  }
})