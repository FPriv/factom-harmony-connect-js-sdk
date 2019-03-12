/* eslint-disable  */
// Will be changed to require ('FactomSDK') after publish
const FactomConnectSDK = require("../dist/factomHarmonyConnectSdk.cjs");
const sha256 = require("js-sha256"); // Using any external library for hash data
const fs = require("fs");
const configure = require("./configure");

// Handle node response
const responseData = (response, data) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data), "utf-8");
};

const calculateState = (identitiesKeys) => {
  const result = [];
  identitiesKeys.activeKeys.forEach((item) => {
    let state = "";
    if (item.activated_height == null) {
      // "Pending" if the activated height is null
      // "Pending and Replacement Pending" if activated_height is null and there is a pending key replacement for the same priority
      state = identitiesKeys.pendingKey && item.priority == identitiesKeys.pendingKey.priority ? "Pending and Replacement Pending" : "Pending";
    } else {
      // "Active" if activated_height is not null and retired_height is null
      // "Active and Replacement Pending" if activated_height is not null, retired_height is null and there is a pending key replacement for the same priority
      // "Retired/replaced" if retired_height is not null
      state = item.retired_height ? "Retired/replaced" : (identitiesKeys.pendingKey && item.priority == identitiesKeys.pendingKey.priority ? "Active and Replacement Pending" : "Active");
    }

    result.push({
      key: item.key,
      priority: item.priority,
      activatedHeight: item.activated_height,
      state: state
    })
  });

  if (identitiesKeys.pendingKey) {
    result.push({
      key: identitiesKeys.pendingKey.key,
      priority: identitiesKeys.pendingKey.priority,
      activatedHeight: identitiesKeys.pendingKey.activated_height,
      state: "Pending"
    })
  }

  return result.sort((a, b) => a.priority - b.priority);
}

module.exports = async (request, response) => {
  // Init factom sdk with your appId and appKey, which can be found or generated at https://account.factom.com
  const factomConnectSDK = new FactomConnectSDK(configure);

  try {
    // Create identity without keys. System automatic generating 3 key pairs.
    const createIdentityChainResponse = await factomConnectSDK.identities.create(
      {
        names: ["NotarySimulation", new Date().toISOString()]
      }
    );
    const originalKeyPairs = createIdentityChainResponse.key_pairs;

    //We'll use this later for sign chain/entry
    const identityChainId = createIdentityChainResponse.chain_id;

    //In this sample we will use the identity’s lowest priority key to sign
    const keyToSign = originalKeyPairs[2];
    //Create a chain, by default the chain will be signed so you need to pass in the private key and the identity chain id
    const createChainResponse = await factomConnectSDK.chains.create({
      signerPrivateKey: keyToSign.private_key,
      signerChainId: identityChainId,
      externalIds: ["NotarySimulation", "CustomerChain", "cust123"],
      content:
        "This chain represents a notary service's customer in the NotarySimulation, a sample implementation provided as part of the Factom Harmony SDKs. Learn more here: https://docs.harmony.factom.com/docs/sdks-clients"
    });

    /**
    * Get chain info to show external Ids have been passed to the API.
    * External Ids processed by SDK automatically when creating new chain/entry. External Ids will include:
    * [
    *  "Chain Type",
    *  "Chain Schema Version",
    *  "Your Identity Chain ID",
    *  "Signature Public Key"
    *  "Signature"
    *  "Time stamp"
    *  "Additional external Ids"
    * ]
    * In order to display the External Ids array then we need to get chain. However, we don't need to validate the signature so in this step pass in signatureValidation: false
    */
    const chain = await factomConnectSDK.chains.get({
      chainId: createChainResponse.chain_id,
      signatureValidation: false
    });
    const chainCreatedTime = chain.data.external_ids[5];

    /**
    * This is the document from the customer, it should be stored in a secure location such as an Amazon S3 bucket for later retrieval.
    * The blockchain is your means for ensuring it has not been tampered with.
    */

    const documentBuffer = fs.readFileSync("./Factom_Whitepaper_v1.2.pdf");
    // You can use any hash library on this step
    const documentHash = sha256(documentBuffer);
    const document = {
      link: "/document",
      hash: documentHash
    };

    //Create an entry, by default the chain will be signed so you need to pass in the private key and the identity chain id
    const createEntryResponse = await factomConnectSDK.chains.entries.create({
      chainId: chain.data.chain_id,
      signerPrivateKey: keyToSign.private_key,
      signerChainId: identityChainId,
      externalIds: ["NotarySimulation", "DocumentEntry", "doc987"],
      content: JSON.stringify({
        document_hash: documentHash,
        hash_type: "sha256"
      })
    });
    /**
    * Get entry info to show external Ids have been passed to the API.
    * External Ids processed by SDK automatically when creating new entry. External Ids will include:
    * [
    *  "Entry Type",
    *  "Entry Schema Version",
    *  "Your Identity Chain ID",
    *  "Signature Public Key"
    *  "Signature"
    *  "Time stamp"
    *  "Additional external Ids"
    * ]
    * In order to display the External Ids array then we need to get entry. However, we don't need to validate the signature so in this step pass in signatureValidation: false
    */
    const getEntryResponse = await factomConnectSDK.chains.entries.get({
      chainId: chain.data.chain_id,
      entryHash: createEntryResponse.entry_hash,
      signatureValidation: false
    });
    const entryCreatedTime = getEntryResponse.data.external_ids[5];

    //Search chain
    //Currently we only have 1 identityChainId to work with so pass in chainCreatedTime to make sure search function only return one result
    const chainSearchInput = [identityChainId, "cust123", chainCreatedTime];
    const chainSearchResult = await factomConnectSDK.chains.search({
      externalIds: chainSearchInput
    });

    //Get Chain with signature validation, by default all get chain/entry request will be automatically validating the signature
    const chainWValidation = await factomConnectSDK.chains.get({
      chainId: chainSearchResult.data['0'].chain_id
    });

    //Search entry
    //Currently we only have 1 identityChainId to work with so pass in entryCreatedTime to make sure search function only return one result
    const entrySearchInput = ["DocumentEntry", "doc987", entryCreatedTime];
    const searchEntryResults = await factomConnectSDK.chains.entries.search({
      chainId: chainWValidation.chain.data.chain_id,
      externalIds: ["DocumentEntry", "doc987", entryCreatedTime]
    });

    /**
     * Retrieve Blockchain Data aren't always necessary because it is common practice to store the chain_id and entry_hash within your own database.
     * Get Entry with signature validation, by default all get chain/entry request will be automatically validating the signature
     */
    const entryWValidation = await factomConnectSDK.chains.entries.get({
      chainId: chainWValidation.chain.data.chain_id,
      entryHash: searchEntryResults.data['0'].entry_hash
    })
    const entryContentJSON = JSON.parse(entryWValidation.entry.data.content)

    /**
     * This is the document that was stored in your system and you are now retrieving to verify that it has not been tampered with.
     */
    const documentBufferAfter = fs.readFileSync("./Factom_Whitepaper_v1.2.pdf");
    // You can use any hash library on this step
    const documentHashAfter = sha256(documentBufferAfter);
    const documentAfter = {
      hash: documentHashAfter,
      link: "/document",
    };

    // Proactive Security
    // To replace a key, you need to sign this request with the private key of the same level or above. In this case we are using one of the same level.
    const originalKeyPair = originalKeyPairs[1];
    const replacementEntryResponse = await factomConnectSDK.identities.keys.replace({
      identityChainId: identityChainId,
      oldPublicKey: originalKeyPair.public_key,
      signerPrivateKey: originalKeyPair.private_key,
    })

    //Get all keys and caculate key's state
    const identityChain = await factomConnectSDK.identities.get({ identityChainId: identityChainId });
    identityKeys = calculateState({
      activeKeys: identityChain.data.active_keys,
      pendingKey: identityChain.data.pending_key
    });

    responseData(response, {
      originalKeyPairs: originalKeyPairs,
      identityChainId: identityChainId,
      document: document,
      createdChainInfo: {
        externalIds: chain.data.external_ids,
        chainId: chain.data.chain_id
      },
      createdEntryInfo: {
        externalIds: getEntryResponse.data.external_ids,
        entryHash: getEntryResponse.data.entry_hash
      },
      chainSearchInput: chainSearchInput,
      chainSearchResult: chainSearchResult.data,
      chainWValidation: {
        chainId: chainWValidation.chain.data.chain_id,
        externalIds: chainWValidation.chain.data.external_ids,
        status: chainWValidation.status
      },
      entrySearchInput: entrySearchInput,
      searchEntryResults: searchEntryResults,
      entryWValidation: {
        entryHash: entryWValidation.entry.data.entry_hash,
        external_ids: entryWValidation.entry.data.external_ids,
        content: entryWValidation.entry.data.content,
        status: entryWValidation.status,
        entryContentJSON: entryContentJSON,
      },
      documentAfter: documentAfter,
      replaceKeyPair: replacementEntryResponse.key_pair,
      replacementEntryResponse: replacementEntryResponse,
      identityKeys: identityKeys,
    });
  } catch (error) {
    console.log(error);
  }
};
