/* eslint-disable  */
// Will be changed to require ('FactomSDK') after publish
const FactomConnectSDK = require("../dist/factomHarmonyConnectSdk.cjs");
const sha256 = require("js-sha256"); // Using any external library for hash data
const globalTunnel = require("global-tunnel-ng");
const fs = require("fs");
const axios = require("axios");

//This part will be remove after Connect API updated
axios.interceptors.response.use(response => {
  if (response.config.url.includes("chains")) {
    response.data.data = {
      ...response.data.data,
      dblock: {
        height: 121115,
        keymr:
          "0fc6fc4c48b45b0d82638717d2b7de327ec5f2eea485c0c5e41999f6f0f5349e",
        href:
          "/v1/dblocks/0fc6fc4c48b45b0d82638717d2b7de327ec5f2eea485c0c5e41999f6f0f5349e"
      }
    };
  }
  return response;
});

//FPT Dev-Env
globalTunnel.initialize({
  host: '10.133.93.63',
  port: 8080,
});

// Handle node response
const responseData = (response, data) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data), "utf-8");
};

module.exports = async (request, response) => {
  // Init factom sdk with your app_id and app_key
  const factomConnectSDK = new FactomConnectSDK({
    baseURL: "https://durable.sandbox.harmony.factom.com/v1",
    accessToken: {
      appId: "aabe7d81",
      appKey: "502a5c77f8f600b9ec32e94fbe008f11"
    }
  });

  try {
    // Create initial key pairs, sdk will create 3 key pairs by default, you can change the number of key pair by passing {numberOfKeyPair: } to the params
    // Create single key pair by using factomConnectSDK.keyUtil.createKeyPair()
    let originalKeyPairs = factomConnectSDK.identity.createIdentityKeyPair();
    //For now Identity API is not completed so hardcode 3 key pairs from API document
    originalKeyPairs = [
      {
        privateKey: "idsec1rxvt6BX7KJjaqUhVMQNBGzaa1H4oy43njXSW171HftLnTyvhZ",
        publicKey: "idpub2Cktw6EgcBVMHMXmfcCyTHndcFvG7fJKyBpy3sTYcdTmdTuKya"
      },
      {
        privateKey: "idsec2bH9PmKVsqsGHqBCydjvK6BESQNQY7rqErq1EAV84Tx3NWRiyb",
        publicKey: "idpub2JegfdBQBnqbXGKMMD89v8N81e4DpvERHWTJp6zvWaoAVi8Jnj"
      },
      {
        privateKey: "idsec35TeMDfgZMfTzinqEqHxt4BFLSAbwQBwsZeXmFG3otjfkDBF8u",
        publicKey: "idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9"
      }
    ];
    const publicKeyArr = [];
    for (let index = 0; index < originalKeyPairs.length; index++) {
      publicKeyArr.push(originalKeyPairs[index].publicKey);
    }

    // Create identity with originalKeyPairs created above
    const createIdentityChainResponse = await factomConnectSDK.identity.createIdentity(
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
    const createChainResponse = await factomConnectSDK.chains.createChain({
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
    const chain = await factomConnectSDK.chain({
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
    const createEntryResponse = await chain.createEntry({
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
    const getEntryResponse = await chain.getEntryInfo({
      entryHash: createEntryResponse.entry_hash,
      signatureValidation: false
    });
    const entryCreatedTime = getEntryResponse.data.external_ids[5];

    //Search chain
    //Currently we only have 1 identityChainId to work with so pass in chainCreatedTime to make sure search function only return one result
    const chainSearchInput = [identityChainId, "cust123", chainCreatedTime];
    const chainSearchResult = await factomConnectSDK.chains.searchChains({
      externalIds: chainSearchInput
    });

    //Get Chain with signature validation, by default all get chain/entry request will be automatically validating the signature
    const chainWValidation = await factomConnectSDK.chain({
      chainId: chainSearchResult.data['0'].chain_id
    });

    //Search entry
    //Currently we only have 1 identityChainId to work with so pass in entryCreatedTime to make sure search function only return one result
    const entrySearchInput = ["DocumentEntry", "doc987", entryCreatedTime];
    const searchEntryResults = await chainWValidation.searchEntries({
      externalIds: ["DocumentEntry", "doc987", entryCreatedTime]
    });

    /**
     * Retrieve Blockchain Data aren't always necessary because it is common practice to store the chain_id and entry_hash within your own database. 
     * Get Entry with signature validation, by default all get chain/entry request will be automatically validating the signature
     */
    const entryWValidation =  await chainWValidation.getEntryInfo({
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
    let replaceKeyPairs = factomConnectSDK.identity.createIdentityKeyPair();
    
    //To replace new key, you need to sign this request with above or same level private key. In this case we are using same level private key. 
    const replacementEntryResponses = [];
    for (let index = 0; index < replaceKeyPairs.length; index++) {
      const newKeyPair = replaceKeyPairs[index];
      const originalKeyPair = originalKeyPairs[index];
      const replacementEntryResponse= await factomConnectSDK.identity.createIdentityKeyReplacement({
        identityChainId: identityChainId,
        oldPublicKey: originalKeyPair.publicKey,
        newPublicKey: newKeyPair.publicKey,
        signerPrivateKey: originalKeyPair.privateKey,
      })
      replacementEntryResponses.push(replacementEntryResponse)
    }

    const identityKeys = await factomConnectSDK.identity.getAllIdentityKeys({
      identityChainId: identityChainId,
    })
    
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
        chainId: chainWValidation.data.chain_id,
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
