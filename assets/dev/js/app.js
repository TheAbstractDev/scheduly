$('.removeAll').click(function (e) {
	e.preventDefault()
	$.ajax({
		url: 'http://localhost:8080/webhook',
		type: 'DELETE',
	})
	window.location.href = '/'
})

$('.remove').click(function (e) {
  e.preventDefault()
  $.ajax({
    url: 'http://localhost:8080/webhook/' + $(this).attr('data-id'),
    type: 'DELETE',
  })
  window.location.href = '/'
})
