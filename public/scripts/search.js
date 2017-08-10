$('#baba-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  $.get('/babas?' + search, function(data) {
    $('#baba-grid').html('');
    data.forEach(function(baba) {
      $('#baba-grid').append(`
        <div class="col-md-3 col-sm-6">
          <div class="thumbnail">
            <img src="${ baba.image }">
            <div class="caption">
              <h4>${ baba.name }</h4>
            </div>
            <p>
              <a href="/babas/${ baba._id }" class="btn btn-primary">More Info</a>
            </p>
          </div>
        </div>
      `);
    });
  });
});

$('#baba-search').submit(function(event) {
  event.preventDefault();
});