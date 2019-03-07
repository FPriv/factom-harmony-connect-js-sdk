/* eslint-disable  */
// Will be changed to require ('FactomSDK') after publish
const FactomConnectSDK = require("../dist/factomHarmonyConnectSdk.cjs");
const sha256 = require("js-sha256"); // Using any external library for hash data
const fs = require("fs");
const configure = require("./configure");

(async () => {
  const factomConnectSDK = new FactomConnectSDK(configure);

  try {
    console.log("==============INFO==============");
    console.log("factomConnectSDK.apiInfo.get");
    await factomConnectSDK.apiInfo.get();

    console.log("==============IDENTITIES==============");
    console.log("factomConnectSDK.identities.create");
    const createIdentityChainResponse = await factomConnectSDK.identities.create(
      {
        name: ["NotarySimulation", new Date().toISOString()]
      }
    );

    const originalKeyPairs = createIdentityChainResponse.key_pairs;
    const identityChainId = createIdentityChainResponse.chain_id;
    const keyToSign = originalKeyPairs[2];

    console.log("factomConnectSDK.identities.get");
    await factomConnectSDK.identities.get({
      identityChainId: identityChainId
    });

    // Temporary comment 
    console.log("factomConnectSDK.identities.keys.get");
    // await factomConnectSDK.identities.keys.get({
    //   identityChainId: identityChainId,
    //   signerPublicKey: keyToSign.publicKey
    // });

    console.log("factomConnectSDK.identities.keys.list");
    await factomConnectSDK.identities.keys.list({
      identityChainId: identityChainId
    });

    console.log("factomConnectSDK.identities.keys.replace");
    const replacementKeyPairs = [];
    for(let i = 0; i < 3; i++) {
      replacementKeyPairs.push(factomConnectSDK.utils.generateKeyPair());
    }
    const replacementEntryResponses = [];
    for (let index = 0; index < replacementKeyPairs.length; index++) {
      const newKeyPair = replacementKeyPairs[index];
      const originalKeyPair = originalKeyPairs[index];
      const replacementEntryResponse= await factomConnectSDK.identities.keys.replace({
        identityChainId: identityChainId,
        oldPublicKey: originalKeyPair.publicKey,
        newPublicKey: newKeyPair.publicKey,
        signerPrivateKey: originalKeyPair.privateKey,
      })
      replacementEntryResponses.push(replacementEntryResponse)
    }

    console.log("==============CHAINS==============");
    console.log("factomConnectSDK.chains.create");
    const createChainResponse = await factomConnectSDK.chains.create({
      signerPrivateKey: keyToSign.privateKey,
      signerChainId: identityChainId,
      externalIds: ["TestFunction", "CustomerChain", "cust123"],
      content:
        "This chain represents a notary service’s customer in the NotarySimulation, a sample implementation provided as part of the Factom Harmony SDKs. Learn more here: https://docs.harmony.factom.com/docs/sdks-clients"
    })
    const chainId = createChainResponse.chain_id;
    
    console.log("factomConnectSDK.chains.get");
    await factomConnectSDK.chains.get({
      chainId: chainId
    })

    console.log("factomConnectSDK.chains.list");
    await factomConnectSDK.chains.list();

    console.log("factomConnectSDK.chains.search");
    await factomConnectSDK.chains.search({
      externalIds: ["TestFunction", "CustomerChain", "cust123"]
    });
    
    console.log("==============ENTRIES==============");
    const documentBuffer = fs.readFileSync("./Factom_Whitepaper_v1.2.pdf");
    const documentHash = sha256(documentBuffer);
    console.log("factomConnectSDK.chains.entries.create");
    const createEntryResponse = await factomConnectSDK.chains.entries.create({
      chainId: chainId,
      signerPrivateKey: keyToSign.privateKey,
      signerChainId: identityChainId,
      externalIds: ["TestFunction", "DocumentEntry", "doc987"],
      content: JSON.stringify({
        document_hash: documentHash,
        hash_type: "sha256"
      })
    });
    const entryHash = createEntryResponse.entry_hash;

    console.log("factomConnectSDK.chains.entries.get");
    await factomConnectSDK.chains.entries.get({
      chainId: chainId,
      entryHash: entryHash
    });
    
    console.log("factomConnectSDK.chains.entries.list");
    await factomConnectSDK.chains.entries.list({
      chainId: chainId
    });

    console.log("factomConnectSDK.chains.entries.getFirst");
    await factomConnectSDK.chains.entries.getFirst({
      chainId: chainId
    });

    console.log("factomConnectSDK.chains.entries.getLast");
    await factomConnectSDK.chains.entries.getLast({
      chainId: chainId
    });

    console.log("factomConnectSDK.chains.entries.search");
    await factomConnectSDK.chains.entries.search({
      chainId: chainId,
      externalIds: ["TestFunction", "DocumentEntry", "doc987"]
    });
  } catch (error) {
    console.log(error);
  }
})();
