/* eslint-disable */

function onSimulation() {
  $('#simulateBtn')
    .html('Simulating...')
    .addClass('spinning')
    .attr('disabled','disabled');
    
  $.get('/simulate', function (data) {
    console.log(data);

    data.originalKeyPairs.forEach((item, index) => {
      $('<div/>', {
        html: `<div class="row mt-3">
                <div class="col s2">
                  <p class="font-weight-bold">Public Key ${index + 1}</p>
                </div>
                <div class="col s10">
                  <p>${item.publicKey}</p>
                </div>
              </div>`,
      }).appendTo('#generatePublicKeys');
    });

    $('#identityChainId').html(data.identityChainId);
    //First Customer
    $('#chainId').html(data.createdChainInfo.chainId);
    $('#chainType').html(data.createdChainInfo.externalIds[0]);
    $('#chainSchemaVersion').html(data.createdChainInfo.externalIds[1]);
    $('#chainSignatureIdentity').html(data.createdChainInfo.externalIds[2]);
    $('#chainSignaturePublicKey').html(data.createdChainInfo.externalIds[3]);
    $('#chainSignature').html(data.createdChainInfo.externalIds[4]);
    $('#chainTimestamp').html(data.createdChainInfo.externalIds[5]);

    var additionalExternalIds = '';
    for (var index = 6; index < data.createdChainInfo.externalIds.length; index++) {
      if (index == data.createdChainInfo.externalIds.length - 1) additionalExternalIds += data.createdChainInfo.externalIds[index]
      else additionalExternalIds += data.createdChainInfo.externalIds[index] + ', ';
    }
    $('#chainAdditionalExternalIDs').html(additionalExternalIds);

    $('#docDownload').prop('href', data.document.link);
    $('#docSha256').html(data.document.hash);

    $('#entryHash').html(data.createdEntryInfo.entryHash);
    $('#entryType').html(data.createdEntryInfo.externalIds[0]);
    $('#entrySchemaVersion').html(data.createdEntryInfo.externalIds[1]);
    $('#entrySignatureIdentity').html(data.createdEntryInfo.externalIds[2]);
    $('#entrySignaturePublicKey').html(data.createdEntryInfo.externalIds[3]);
    $('#entrySignature').html(data.createdEntryInfo.externalIds[4]);
    $('#entryTimestamp').html(data.createdEntryInfo.externalIds[5]);
    additionalExternalIds = '';
    for (var index = 6; index < data.createdEntryInfo.externalIds.length; index++) {
      if (index == data.createdEntryInfo.externalIds.length - 1) additionalExternalIds += data.createdEntryInfo.externalIds[index]
      else additionalExternalIds += data.createdEntryInfo.externalIds[index] + ', ';
    }
    $('#entryAdditionalExternalIDs').html(additionalExternalIds);

    //Blockchain Data Retrieval

    var chainSearchBy = $('<ul/>').appendTo('#sc_chainSearchBy');
    data.chainSearchInput.forEach(item => {
      chainSearchBy.append(`<li>${item}</li>`);
    });
    $('#sc_ChainId').html(data.chainSearchResult[0].chain_id);
    $('#rc_ChainId').html(data.chainWValidation.chainId);
    $('#rc_chainType').html(data.chainWValidation.externalIds[0]);
    $('#rc_chainSchemaVersion').html(data.chainWValidation.externalIds[1]);
    $('#rc_chainSignatureIdentity').html(data.chainWValidation.externalIds[2]);
    $('#rc_chainSignaturePublicKey').html(data.chainWValidation.externalIds[3]);
    $('#rc_chainSignature').html(data.chainWValidation.externalIds[4]);
    $('#rc_chainTimestamp').html(data.chainWValidation.externalIds[5]);
    additionalExternalIds = '';
    for (var index = 6; index < data.chainWValidation.externalIds.length; index++) {
      if (index == data.chainWValidation.externalIds.length - 1) additionalExternalIds += data.chainWValidation.externalIds[index]
      else additionalExternalIds += data.chainWValidation.externalIds[index] + ', ';
    }
    $('#rc_chainAdditionalExternalIDs').html(additionalExternalIds);
    $('#rc_chainSignatureValidation').html(getStatus(data.chainWValidation.status));

    var entrySearchBy = $('<ul/>').appendTo('#sc_entrySearchBy');
    data.entrySearchInput.forEach(item => {
      entrySearchBy.append(`<li>${item}</li>`);
    });
    $('#sc_EntryHash').html(data.searchEntryResults.data[0].entry_hash);
    $('#rc_EntryHash').html(data.entryWValidation.entryHash);
    $('#rc_entryType').html(data.entryWValidation.external_ids[0]);
    $('#rc_entrySchemaVersion').html(data.entryWValidation.external_ids[1]);
    $('#rc_entrySignatureIdentity').html(data.entryWValidation.external_ids[2]);
    $('#rc_entrySignaturePublicKey').html(data.entryWValidation.external_ids[3]);
    $('#rc_entrySignature').html(data.entryWValidation.external_ids[4]);
    $('#rc_entryTimestamp').html(data.entryWValidation.external_ids[5]);
    additionalExternalIds = '';
    for (var index = 6; index < data.entryWValidation.external_ids.length; index++) {
      if (index == data.entryWValidation.external_ids.length - 1) additionalExternalIds += data.entryWValidation.external_ids[index]
      else additionalExternalIds += data.entryWValidation.external_ids[index] + ', ';
    }
    $('#rc_entryAdditionalExternalIDs').html(additionalExternalIds);
    $('#rc_entrySignatureValidation').html(getStatus(data.entryWValidation.status));
    $('#rc_entryContent').html(data.entryWValidation.content);

    //Validate Stored Document
    $('#vs_Document').prop('href', data.documentAfter.link);
    $('#vs_DocumentHash').html(data.documentAfter.hash);
    $('#vf_BlockchainDocument').html(data.entryWValidation.entryContentJSON.document_hash);
    $('#vf_DocumentHash').html(data.documentAfter.hash);
    var hashMatch = data.documentAfter.hash === data.entryWValidation.entryContentJSON.document_hash ? 'Valid' : 'Invalid';
    $('#vf_HashValidation').html(hashMatch);

    //Proactive Security
    data.replaceKeyPairs.forEach((item, index) => {
      $('<div/>', {
        html: `<div class="row mt-3">
                <div class="col s2">
                  <p class="font-weight-bold">New Public Key ${index + 1}</p>
                </div>
                <div class="col s10">
                  <p>${item.publicKey}</p>
                </div>
              </div>`,
      }).appendTo('#newPublicKeys');
    });

    data.replacementEntryResponses.forEach((item, index) => {
      $('<div/>', {
        html: `<div class="row mt-3">
                <div class="col s2">
                  <p class="font-weight-bold">Entry Hash ${index + 1}</p>
                </div>
                <div class="col s10">
                  <p>${item.entry_hash}</p>
                </div>
              </div>`,
      }).appendTo('#replaceKeys');
    });

    data.identityKeys.data.forEach((item, index) => {
      $('<div/>', {
        html: `<div class="row mt-3">
                <div class="col s2">
                  <p class="font-weight-bold">Public Key ${index + 1}</p>
                </div>
                <div class="col s10">
                  <p>${item.key}</p>
                  <p><b>Activated Height:</b> ${item.activated_height}</p>
                  <p><b>Retired Height:</b> ${item.retired_height}</p>
                </div>
              </div>`,
      }).appendTo('#retrievePublicKeys');
    });

    //Finish
    $("#loading").hide();
    $('#first-step').hide();
    $('#result').show();
  });
}

getStatus = (status) => {
  var result = '';
  switch (status) {
    case 'not_signed/invalid_chain_format':
      result = 'error';
      break;
    case 'invalid_signature':
    case 'inactive_key':
      result = 'Invalid';
      break;
    case 'valid_signature':
      result = 'Valid';
      break;
  }

  return result;
};