/* eslint-disable */

function runTest() {
  $('#simulateBtn')
    .html('Simulating...')
    .addClass('spinning')
    .attr('disabled','disabled');

  $.get('/testMethods', function (data) {
    console.log(data);


    // $('#api-version').html(data.infoResponse.version);


    //Finish
    $("#loading").hide();
    $('#first-step').hide();
    $('#result').show();
  })
  .done(function(response) {
    console.log('done response', response);
  })
  .fail(function (response) {
    console.log('fail response', response);
  })
}