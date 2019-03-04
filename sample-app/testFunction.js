/* eslint-disable  */
// Will be changed to require ('FactomSDK') after publish
const FactomConnectSDK = require("../dist/factomHarmonyConnectSdk.cjs");
const sha256 = require("js-sha256"); // Using any external library for hash data
const fs = require("fs");

(async () => {
  const factomConnectSDK = new FactomConnectSDK({
    baseURL: "YOUR API URL",
    accessToken: {
      appId: "YOUR APP ID",
      appKey: "YOUR APP KEY"
    }
  });

  try {
    console.log("==============INFO==============");
    console.log("factomConnectSDK.info.get");
    await factomConnectSDK.info.get()

    console.log("==============IDENTITY==============");
    console.log("factomConnectSDK.identity.createKeyPairs");
    const originalKeyPairs = factomConnectSDK.identity.createKeyPairs();
    const keyToSign = originalKeyPairs[0];
    const publicKeyArr = [];
    originalKeyPairs.forEach(item => {
      publicKeyArr.push(item.publicKey);
    });

    console.log("factomConnectSDK.identity.create");
    const createIdentityChainResponse = await factomConnectSDK.identity.create(
      {
        name: ["NotarySimulation", new Date().toISOString()],
        keys: [...publicKeyArr]
      }
    );
    
    const identityChainId = createIdentityChainResponse.chain_id;

    console.log("factomConnectSDK.identity.get");
    await factomConnectSDK.identity.get({
      identityChainId: identityChainId
    });

    console.log("factomConnectSDK.identity.getKeys");
    const identityKeys = await factomConnectSDK.identity.getKeys({
      identityChainId: identityChainId
    });

    console.log("factomConnectSDK.identity.createKeyReplacement");
    const replacementKeyPairs = factomConnectSDK.identity.createKeyPairs();
    const replacementEntryResponses = [];
    for (let index = 0; index < replacementKeyPairs.length; index++) {
      const newKeyPair = replacementKeyPairs[index];
      const originalKeyPair = originalKeyPairs[index];
      const replacementEntryResponse= await factomConnectSDK.identity.createKeyReplacement({
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
    
    console.log("factomConnectSDK.chains.getChain");
    await factomConnectSDK.chains.getChain({
      chainId: chainId
    })

    console.log("factomConnectSDK.chains.get");
    await factomConnectSDK.chains.get();

    console.log("factomConnectSDK.chains.search");
    await factomConnectSDK.chains.search({
      externalIds: ["TestFunction", "CustomerChain", "cust123"]
    });
    
    console.log("==============ENTRIES==============");
    const documentBuffer = fs.readFileSync("./Factom_Whitepaper_v1.2.pdf");
    const documentHash = sha256(documentBuffer);
    console.log("factomConnectSDK.entries.create");
    const createEntryResponse = await factomConnectSDK.entries.create({
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

    console.log("factomConnectSDK.entries.getEntry");
    await factomConnectSDK.entries.getEntry({
      chainId: chainId,
      entryHash: entryHash
    });
    
    console.log("factomConnectSDK.entries.get");
    await factomConnectSDK.entries.get({
      chainId: chainId
    });

    console.log("factomConnectSDK.entries.getFirst");
    await factomConnectSDK.entries.getFirst({
      chainId: chainId
    });

    console.log("factomConnectSDK.entries.getLast");
    await factomConnectSDK.entries.getLast({
      chainId: chainId
    });

    console.log("factomConnectSDK.entries.search");
    await factomConnectSDK.entries.search({
      chainId: chainId,
      externalIds: ["TestFunction", "DocumentEntry", "doc987"]
    });

    console.log("==============CHAIN==============");
    console.log("factomConnectSDK.chain.get");
    const chain = await factomConnectSDK.chain.get({
      chainId: chainId
    });
    
    console.log("==============CHAIN-ENTRY==============");
    console.log("chain.entry.get");
    await chain.entry.get({
      entryHash: entryHash
    })

    console.log("==============CHAIN-ENTRIES==============");
    console.log("chain.entries.create");
    await chain.entries.create({
      signerPrivateKey: keyToSign.privateKey,
      signerChainId: identityChainId,
      externalIds: ["TestFunction2", "DocumentEntry2", "doc9872"],
      content: JSON.stringify({
        document_hash: documentHash,
        hash_type: "sha256"
      })
    });

    console.log("chain.entries.get");
    await chain.entries.get();

    console.log("chain.entries.getFirst");
    await chain.entries.getFirst({
      chainId: chainId
    });

    console.log("chain.entries.getLast");
    await chain.entries.getLast({
      chainId: chainId
    });

    console.log("chain.entries.search");
    await chain.entries.search({
      chainId: chainId,
      externalIds: ["TestFunction2", "DocumentEntry2", "doc9872"]
    });
  } catch (error) {
    console.log(error);
  }
})();
