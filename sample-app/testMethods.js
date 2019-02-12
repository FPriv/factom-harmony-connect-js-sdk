/* eslint-disable  */
// Will be changed to require ('FactomSDK') after publish
const FactomConnectSDK = require("../dist/factomHarmonyConnectSdk.cjs");
const sha256 = require("js-sha256"); // Using any external library for hash data
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

// Handle node response
const responseData = (response, data) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data), "utf-8");
};

module.exports = async (request, response) => {
  // Init factom sdk with your app_id and app_key
  const factomConnectSDK = new FactomConnectSDK({
    baseURL: "https://api-2445582615332.production.gw.apicast.io/v1",
    accessToken: {
      appId: "64bb7326",
      appKey: "df09c517466930d80d8ea68debec94ad"
    },
    automaticSigning: false
  });

  try {
    // return;
    // // Create initial key pairs, sdk will create 3 key pairs by default, you can change the number of key pair by passing {numberOfKeyPair: } to the params
    // // Create single key pair by using factomConnectSDK.keyUtil.createKeyPair()
    // let originalKeyPairs = factomConnectSDK.identity.createIdentityKeyPair();
    // //For now Identity API is not completed so hardcode 3 key pairs from API document
    // originalKeyPairs = [
    //   {
    //     privateKey: "idsec1rxvt6BX7KJjaqUhVMQNBGzaa1H4oy43njXSW171HftLnTyvhZ",
    //     publicKey: "idpub2Cktw6EgcBVMHMXmfcCyTHndcFvG7fJKyBpy3sTYcdTmdTuKya"
    //   },
    //   {
    //     privateKey: "idsec2bH9PmKVsqsGHqBCydjvK6BESQNQY7rqErq1EAV84Tx3NWRiyb",
    //     publicKey: "idpub2JegfdBQBnqbXGKMMD89v8N81e4DpvERHWTJp6zvWaoAVi8Jnj"
    //   },
    //   {
    //     privateKey: "idsec35TeMDfgZMfTzinqEqHxt4BFLSAbwQBwsZeXmFG3otjfkDBF8u",
    //     publicKey: "idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9"
    //   }
    // ];
    // const publicKeyArr = [];
    // for (let index = 0; index < originalKeyPairs.length; index++) {
    //   publicKeyArr.push(originalKeyPairs[index].publicKey);
    // }

    // // Create identity with originalKeyPairs created above
    // const createIdentityChainResponse = await factomConnectSDK.identity.createIdentity(
    //   {
    //     name: ["NotarySimulation", new Date().toISOString()],
    //     keys: [...publicKeyArr]
    //   }
    // );

    //We'll use this later for sign chain/entry
    // const identityChainId = createIdentityChainResponse.chain_id;

    // //In this sample we will use the identity’s lowest priority key to sign
    // const keyToSign = originalKeyPairs[2];
    // //Create a chain, by default the chain will be signed so you need to pass in the private key and the identity chain id
    // const createChainResponse = await factomConnectSDK.chains.createChain({
    //   // signerPrivateKey: keyToSign.privateKey,
    //   // signerChainId: identityChainId,
    //   externalIds: ["NotarySimulation", "CustomerChain", "cust123"],
    //   content:
    //     "This chain represents a notary service’s customer in the NotarySimulation, a sample implementation provided as part of the Factom Harmony SDKs. Learn more here: https://docs.harmony.factom.com/docs/sdks-clients"
    // });


    originalKeyPairs = [
      {
        privateKey: "idsec1rxvt6BX7KJjaqUhVMQNBGzaa1H4oy43njXSW171HftLnTyvhZ",
        publicKey: "idpub2Cktw6EgcBVMHMXmfcCyTHndcFvG7fJKyBpy3sTYcdTmdTuKya"
      }
    ];

    // const getInfoResponse = await factomConnectSDK.info.getInfo();
    const createChainResponse = await factomConnectSDK.chains.createChain({
        externalIds: ['doronAGAIN', '44', 'texas', '111'],
        content: 'I am an awesome guy'
      });
    // const getAllChainsResponse = await factomConnectSDK.chains.getAllChains();

    // const chainSearchInput = ["111"];
    // const chainSearchResult = await factomConnectSDK.chains.searchChains({
    //   externalIds: chainSearchInput
    // });

    // const entryData =  await factomConnectSDK.entries.getEntryInfo({
      //   entryHash: '82e1e1d1c96d5a1af1d941de91f763e764c58ca4a86f3648bd1c4ed0102f8ace',
      //   chainId: '71c013c0fd9dc287735518b63ac283d51798b44391985f2ab21f542b288c5211'
      // });

      const chain = await factomConnectSDK.chain({
        chainId: createChainResponse.chain_id,
        signatureValidation: false
      });

        const createEntryResponse = await factomConnectSDK.entries.createEntry({
          externalIds: ["NotarySimulation", "DocumentEntry", "doc987", "111", "44"],
          content: JSON.stringify({
            name: 'Doron',
            car: 'Lamborghini'
          }),
          chainId: '71c013c0fd9dc287735518b63ac283d51798b44391985f2ab21f542b288c5211'
        });

        // const chain = await chain.getChainInfo({
        //   chainId: '71c013c0fd9dc287735518b63ac283d51798b44391985f2ab21f542b288c5211'
        // });
        // const lastEntryInfo = await chainInfo.getlastEntry();
        // const firstEntryInfo = await chainInfo.getFirstEntry();
        // const entriesList = await chainInfo.getEntries();

        const getEntrgetEntriesResponse = await chain.getEntries({
          entryHash: createEntryResponse.entry_hash
        });


        const getEntryResponse = await chain.getEntryInfo({
          entryHash: createEntryResponse.entry_hash,
        });

        responseData(response, {
      // originalKeyPairs: originalKeyPairs,
      // chain: chain,
      getEntryResponse: getEntryResponse
      // createEntryResponse: createEntryResponse
      // createChainResponse: createChainResponse,
      // chainSearchResult: chainSearchResult,
      // getAllChainsResponse: getAllChainsResponse,
      // entryData: entryData
      // originalKeyPairs: originalKeyPairs,
      // identityChainId: identityChainId,
      // document: document,
      // createdChainInfo: {
      //   externalIds: chain.data.external_ids,
      //   chainId: chain.data.chain_id
      // }
      // createdEntryInfo: {
      //   externalIds: getEntryResponse.data.external_ids,
      //   entryHash: getEntryResponse.data.entry_hash
      // },
      // chainSearchResult: chainSearchResult.data,
      // chainWValidation: {
      //   chainId: chainWValidation.data.chain_id,
      //   externalIds: chainWValidation.data.external_ids,
      //   status: chainWValidation.status
      // },
      // entrySearchInput: entrySearchInput,
      // searchEntryResults: searchEntryResults,
      // entryWValidation: {
      //   entryHash: entryWValidation.entry.data.entry_hash,
      //   external_ids: entryWValidation.entry.data.external_ids,
      //   content: entryWValidation.entry.data.content,
      //   status: entryWValidation.status,
      //   entryContentJSON: entryContentJSON,
      // },
      // documentAfter: documentAfter,
      // replaceKeyPairs: replaceKeyPairs,
      // replacementEntryResponses: replacementEntryResponses,
      // identityKeys: identityKeys,
    });
  } catch (error) {
    console.log(error);
  }
};
