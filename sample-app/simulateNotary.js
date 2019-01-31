/* eslint-disable  */
// Will be changed to require ('FactomSDK') after publish
const FactomConnectSDK = require("../dist/factomHarmonyConnectSdk.cjs");
const sha256 = require("js-sha256"); // Using any external library for hash data
const globalTunnel = require("global-tunnel-ng");
const fs = require("fs");
const axios = require("axios");

//This part will be remove after Connect API updated
axios.interceptors.response.use(response => {
  // Do something with response data
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
// globalTunnel.initialize({
//   host: '10.133.93.63',
//   port: 8080,
// });

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
    // Create initial key pairs, sdk will create 3 key pairs by default change the number of create key by passing {numberOfKeyPair: } to the params
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

    //Get chain info to show extenal Ids have been pass to the API since we don't need to validate the signature here pass in signatureValidation: false
    const chain = await factomConnectSDK.chain({
      chainId: createChainResponse.chain_id,
      signatureValidation: false
    });

    const chainCreatedTime = chain.data.external_ids[5];
    // This is the document from the customer, it should be stored in a secure location such as an Amazon S3 bucket for later retrieval.
    // The blockchain is your means for ensuring it has not been tampered with.
    const documentBuffer = fs.readFileSync("./NotaryDoc.pdf");
    // You can use any hash library on this step
    const documentHash = sha256(documentBuffer);
    const document = {
      link: "/document",
      hash: documentHash
    };

    //Create Entry
    const createEntryResponse = await chain.createEntry({
      signerPrivateKey: keyToSign.privateKey,
      signerChainId: identityChainId,
      externalIds: ["NotarySimulation", "DocumentEntry", "doc987"],
      content: JSON.stringify({
        documen_hash: documentHash,
        hash_type: "sha256"
      })
    });
    //Get entry info to show extenal Ids have been pass to the API ince we don't need to validate the signature here pass in signatureValidation: false
    const getEntryResponse = await chain.getEntryInfo({
      entryHash: createEntryResponse.entry_hash,
      signatureValidation: false
    });

    const entryCreatedTime = getEntryResponse.data.external_ids[5];

    //Search chain
    const chainSearchResult = await factomConnectSDK.chains.searchChains({
      externalIds: [identityChainId, "cust123", chainCreatedTime]
    });

    //Get Chain with singnature validation
    const chainWValidation = await factomConnectSDK.chain({
      chainId: chainSearchResult.data['0'].chain_id
    });

    //Search entry
    const searchEntryResults = await chainWValidation.searchEntries({
      externalIds: ["DocumentEntry", "doc987", entryCreatedTime]
    });

    //Get Entry with singnature validation
    const entryWValidation =  await chainWValidation.getEntryInfo({
      entryHash: searchEntryResults.data['0'].entry_hash
    })

    responseData(response, {
      originalKeyPairs: originalKeyPairs,
      identityChainId: identityChainId,
      document: document,
      createdchainInfo: {
        externalIds: chain.data.external_ids,
        chainId: chain.data.chain_id
      },
      createdEntryInfo: {
        externalIds: getEntryResponse.data.external_ids,
        entryHash: getEntryResponse.data.entry_hash
      },
      chainSearchResult: chainSearchResult.data,
      chainWValidation: {
        chainId: chainWValidation.data.chain_id,
        externalIds: chainWValidation.data.external_ids,
        status: chainWValidation.status
      },
      searchEntryResults: searchEntryResults,
      entryWValidation: {
        entryHash: entryWValidation.entry.data.entry_hash,
        external_ids: entryWValidation.entry.data.external_ids,
        content: entryWValidation.entry.data.content,
        status: entryWValidation.status
      }
    });
  } catch (error) {
    console.log(error);
  }
};
