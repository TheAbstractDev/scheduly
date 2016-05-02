/* global $, moment */

var data = {}
var lang = window.navigator.userLanguage || window.navigator.language
moment.lang(lang)

$('.next').hide()
$('.last-run').hide()
$('.last-finished').hide()

function localeDate (element) {
  var localTime = moment.utc(element.text()).toDate()
  return moment(localTime).calendar()
}

$('.next').each(function () {
  $(this).text(localeDate($(this)))
})

$('.next').show()

$('.last-run').each(function () {
  if ($(this) && $(this).text() !== '' && $(this).text() !== '...') {
    $(this).text(localeDate($(this)))
  }
})

$('.last-run').show()

$('.last-finished').each(function () {
  if ($(this) && $(this).text() !== '' && $(this).text() !== '...') {
    $(this).text(localeDate($(this)))
  }
})

$('.last-finished').show()

$('.status').each(function () {
  if ($(this).text() === 'completed') $('.status').addClass('success')
  if ($(this).text() === 'scheduled') $('.status').addClass('pending')
  if ($(this).text()[0] === 'f') $('.status').addClass('failed')
})

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
    url: 'http://localhost:8080/webhook/' + $(this).data('id'),
    type: 'DELETE'
  })
  setInterval(function () {
    window.location = '/'
  }, 10000)
})

$('.edit').click(function (e) {
  e.preventDefault()
  id = $(this).data('id')
  
  $('.edit-url').attr('placeholder', $('.url').text())
  $('.edit-body').attr('placeholder', $('.body').text().replace(/"/g, "'"))
  $('.edit-scheduling').attr('placeholder', $('.interval').text())
  $('.ask').show()
})

$('.editBtn').click(function (e) {
  $.ajax({
    url: 'http://localhost:8080/webhook/' + id,
    type: 'PUT',
    data: {
      url: $('.edit-url').val() !== '' ? $('.edit-url').val() : $('.edit-url').attr('placeholder'),
      scheduling: $('.edit-scheduling').val() !== '' ? $('.edit-scheduling').val() : $('.edit-scheduling').attr('placeholder'),
      body: $('.edit-body').val() !== '' ? $('.edit-body').val() : $('.edit-body').attr('placeholder')
    }
  })
  $('.ask').hide()
})

$('.cancel').click(function (e) {
  $('.ask').hide()
})

$('.create').click(function (e) {
  e.preventDefault($('.body').val())
  $.ajax({
    url: 'http://localhost:8080/webhook/',
    type: 'POST',
    data: {
      url: $('.url').val(),
      scheduling: $('.scheduling').val(),
      body: $('.body').val()
    }
  })
  setInterval(function () {
    window.location = '/'
  }, 10000)
})
