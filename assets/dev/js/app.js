/* global $, moment */

var lang = window.navigator.userLanguage || window.navigator.language
moment.lang(lang)
moment().format('LTS')

$('.next').hide()
$('.last-run').hide()
$('.last-finished').hide()

function localeDate (element) {
  var localTime = moment.utc(element.text()).toDate()
  return moment(localTime).calendar()
}

$('.next').text(localeDate($('.next')))
$('.next').show()

if ($('last-run') && $('.last-run').text() !== '') {
  $('.last-run').text(localeDate($('.last-run')))
  $('.last-run').show()
} else {
  $('.last-r').hide()
}

if ($('last-finished') && $('.last-finished').text() !== '') {
  $('.last-finished').text(localeDate($('.last-finished')))
  $('.last-finished').show()
} else {
  $('.last-f').hide()
}

if ($('.status').text() === 'completed') $('.status').addClass('success')
if ($('.status').text() === 'scheduled') $('.status').addClass('pending')
if ($('.status').text()[0] === 'f') $('.status').addClass('failed')

$('.removeAll').click(function (e) {
  e.preventDefault()
  $.ajax({
    url: 'http://localhost:8080/webhook',
    type: 'DELETE'
  })
  setInterval(function () {
    window.location = '/'
  }, 10000)
})

$('.remove').click(function (e) {
  e.preventDefault()
  $.ajax({
    url: 'http://localhost:8080/webhook/' + $(this).data('name'),
    type: 'DELETE'
  })
  setInterval(function () {
    window.location = '/'
  }, 10000)
})

$('.create').click(function (e) {
  e.preventDefault($('.body').val())
  $.ajax({
    url: 'http://localhost:8080/webhook/',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      'url': $('.url').val(),
      'scheduling': $('.scheduling').val(),
      'body': $('.body').val()
    })
  })
  setInterval(function () {
    window.location = '/'
  }, 10000)
})
