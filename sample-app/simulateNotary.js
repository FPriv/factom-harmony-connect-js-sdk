// Will be changed to require ('FactomSDK') after publish
const FactomConnectSDK = require('../dist/factomHarmonyConnectSdk.cjs');
const sha256 = require('js-sha256'); // Using any extenal libarary for hash data
const globalTunnel = require('global-tunnel-ng');
const fs = require('fs');

//FPT Dev-Env
globalTunnel.initialize({
  host: '10.133.93.63',
  port: 8080,
});

// Handle node response
const responseData = (response, data) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(data), 'utf-8');
};

module.exports = async (request, response) => {
  // Init factom sdk with your app_id and app_key
  const factomConnectSDK = new FactomConnectSDK({
    baseURL: 'https://durable.sandbox.harmony.factom.com/v1',
    accessToken: {
      app_id: 'aabe7d81',
      app_key: '502a5c77f8f600b9ec32e94fbe008f11',
    },
  });

  try {
    // Create initial key pairs, sdk will create 3 key pairs by default
    const originalKeyPairs = factomConnectSDK.identity.createIdentityKeyPair();

    // Create identity with originalKeyPairs created above
    const createIdentityChainResponse = await factomConnectSDK.identity.createAnIdentity({
      name: [
        'NotarySimulation',
        (new Date()).toISOString(),
      ],
      keys: [
        originalKeyPairs[0].publicKey,
        originalKeyPairs[1].publicKey,
        originalKeyPairs[2].publicKey,
      ]
    });

    // Using a document from Customer as input for hash process
    const documentBuffer = fs.readFileSync('./NotaryDoc.pdf');
    const documentHash = sha256(documentBuffer);

    const document = {
      link: '/document',
      hash: documentHash,
    };

    responseData(response, {
      originalKeyPairs: originalKeyPairs,
      identityChainId: createIdentityChainResponse.chain_id,
      document: document,
    });
  } catch (error) {
    console.log(error);
  }
};
