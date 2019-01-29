/* eslint-disable */

function onSimulation() {
  $("#loading").show();
  $.get('/simulate', function (data) {
    console.log(data);

    $.each(data.originalKeyPairs, function(i,keypair) {
      $("#keypairs tbody").append("<tr><th scope='row'>" + (i + 1) +"</th><td>"+ keypair.privateKey + "</td><td>" + keypair.publicKey + "</td></tr>");
    });
    $('#identityChainId').html(data.identityChainId);


    $("#loading").hide();
    $('#first-step').hide();
    $('#result').show();
  });
}