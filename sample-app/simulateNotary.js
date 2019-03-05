/* eslint-disable  */
// Will be changed to require ('FactomSDK') after publish
const FactomConnectSDK = require("../dist/factomHarmonyConnectSdk.cjs");
const sha256 = require("js-sha256"); // Using any external library for hash data
const fs = require("fs");

// Handle node response
const responseData = (response, data) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data), "utf-8");
};

module.exports = async (request, response) => {
  // Init factom sdk with your appId and appKey, which can be found or generated at https://account.factom.com
  const factomConnectSDK = new FactomConnectSDK({
    baseUrl: "YOUR API URL",
    accessToken: {
      appId: "YOUR APP ID",
      appKey: "YOUR APP KEY"
    }
  });

  try {
    // Create initial key pairs, sdk will create 3 key pairs by default, you can change the number of key pair by passing {numberOfKeyPairs: } to the params
    let originalKeyPairs = factomConnectSDK.identity.createKeyPairs();
    
    const publicKeyArr = [];
    for (let index = 0; index < originalKeyPairs.length; index++) {
      publicKeyArr.push(originalKeyPairs[index].publicKey);
    }

    // Create identity with originalKeyPairs created above
    const createIdentityChainResponse = await factomConnectSDK.identity.create(
      {
        name: ["NotarySimulation", new Date().toISOString()],
        keys: [...publicKeyArr]
      }
    );

    //We'll use this later for sign chain/entry
    const identityChainId = createIdentityChainResponse.chain_id;

    //In this sample we will use the identity’s lowest priority key to sign
    const keyToSign = originalKeyPairs[2];
    //Create a chain, by default the chain will be signed so you need to pass in the private key and the identity chain id
    const createChainResponse = await factomConnectSDK.chains.create({
      signerPrivateKey: keyToSign.privateKey,
      signerChainId: identityChainId,
      externalIds: ["NotarySimulation", "CustomerChain", "cust123"],
      content:
        "This chain represents a notary service’s customer in the NotarySimulation, a sample implementation provided as part of the Factom Harmony SDKs. Learn more here: https://docs.harmony.factom.com/docs/sdks-clients"
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
    const chain = await factomConnectSDK.chain.get({
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
    const createEntryResponse = await chain.entries.create({
      signerPrivateKey: keyToSign.privateKey,
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
    const getEntryResponse = await chain.entry.get({
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
    const chainWValidation = await factomConnectSDK.chain.get({
      chainId: chainSearchResult.data['0'].chain_id
    });

    //Search entry
    //Currently we only have 1 identityChainId to work with so pass in entryCreatedTime to make sure search function only return one result
    const entrySearchInput = ["DocumentEntry", "doc987", entryCreatedTime];
    const searchEntryResults = await chainWValidation.entries.search({
      externalIds: ["DocumentEntry", "doc987", entryCreatedTime]
    });

    /**
     * Retrieve Blockchain Data aren't always necessary because it is common practice to store the chain_id and entry_hash within your own database.
     * Get Entry with signature validation, by default all get chain/entry request will be automatically validating the signature
     */
    const entryWValidation =  await chainWValidation.entry.get({
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
    let replaceKeyPairs = factomConnectSDK.identity.createKeyPairs();

    //To replace new key, you need to sign this request with above or same level private key. In this case we are using same level private key.
    const replacementEntryResponses = [];
    for (let index = 0; index < replaceKeyPairs.length; index++) {
      const newKeyPair = replaceKeyPairs[index];
      const originalKeyPair = originalKeyPairs[index];
      const replacementEntryResponse= await factomConnectSDK.identity.createKeyReplacement({
        identityChainId: identityChainId,
        oldPublicKey: originalKeyPair.publicKey,
        newPublicKey: newKeyPair.publicKey,
        signerPrivateKey: originalKeyPair.privateKey,
      })
      replacementEntryResponses.push(replacementEntryResponse)
    }

    const identityKeys = await factomConnectSDK.identity.getKeys({
      identityChainId: identityChainId,
    })

    responseData(response, {
      originalKeyPairs: originalKeyPairs,
      identityChainId: identityChainId,
      document: document,
      createdChainInfo: {
        externalIds: chain.data.external_ids,
        chainId: chain.chainId
      },
      createdEntryInfo: {
        externalIds: getEntryResponse.data.external_ids,
        entryHash: getEntryResponse.data.entry_hash
      },
      chainSearchInput: chainSearchInput,
      chainSearchResult: chainSearchResult.data,
      chainWValidation: {
        chainId: chainWValidation.chainId,
        externalIds: chainWValidation.data.external_ids,
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
      replaceKeyPairs: replaceKeyPairs,
      replacementEntryResponses: replacementEntryResponses,
      identityKeys: identityKeys,
    });
  } catch (error) {
    console.log(error);
  }
};
