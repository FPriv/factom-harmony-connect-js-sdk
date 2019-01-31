const globalTunnel = require('global-tunnel-ng');
const FactomConnectSDK = require('../dist/factomHarmonyConnectSdk.cjs');

//FPT Dev-Env
globalTunnel.initialize({
  host: '10.133.93.63',
  port: 8080,
});

const Factom = new FactomConnectSDK({
  baseURL: 'https://durable.sandbox.harmony.factom.com/v1',
  accessToken: {
    app_id: 'aabe7d81',
    app_key: '502a5c77f8f600b9ec32e94fbe008f11',
  },
});

async function getIdentity() {
  try {
    const identity = await Factom.identity.getAnIdentity({
      chainId: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bdc9'
    });
    console.log(identity);
  } catch (error) {
    console.log(error);
  }
}

(async () => {
  await getIdentity();
})();


