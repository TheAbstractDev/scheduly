/* global $ */
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
