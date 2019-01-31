/* eslint-disable */

function onSimulation() {
  $("#loading").show();
  $.get('/simulate', function (data) {
    console.log(data);

    $.each(data.originalKeyPairs, function(i,keypair) {
      $("#keypairs tbody").append("<tr><th scope='row'>" + (i + 1) +"</th><td>"+ keypair.privateKey + "</td><td>" + keypair.publicKey + "</td></tr>");
    });
    $('#identityChainId').html(data.identityChainId);
    //First Customer
    $('#chainId').html(data.chainInfo.chainId);
    $('#chainType').html(data.chainInfo.externalIds[0]);
    $('#chainSchemaVersion').html(data.chainInfo.externalIds[1]);
    $('#chainSignatureIdentity').html(data.chainInfo.externalIds[2]);
    $('#chainSignaturePublicKey').html(data.chainInfo.externalIds[3]);
    $('#chainSignature').html(data.chainInfo.externalIds[4]);
    $('#chainTimestamp').html(data.chainInfo.externalIds[5]);

    var additionalExternalIds = ''
    for (var index = 6; index < data.chainInfo.externalIds.length; index++) {
      if (index == data.chainInfo.externalIds.length - 1) additionalExternalIds += data.chainInfo.externalIds[index]
      else additionalExternalIds += data.chainInfo.externalIds[index] + ', ';
    }
    $('#chainAdditionalExternalIDs').html(additionalExternalIds);


    
    //Finish
    $("#loading").hide();
    $('#first-step').hide();
    $('#result').show();
  });
}