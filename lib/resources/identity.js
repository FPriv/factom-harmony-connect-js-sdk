import secureRandom from 'secure-random';
import base58 from 'base-58';
import sha256 from 'js-sha256';
import elliptic from 'elliptic';
import APICall from '../api';

const EdDSA = elliptic.eddsa;
const ec = new EdDSA('ed25519');
const privatePrefixBytes = [0x03, 0x45, 0xf3, 0xd0, 0xd6];
const publicPrefixBytes = [0x03, 0x45, 0xef, 0x9d, 0xe0];
let apiCall;

const createKeyPair = () => {
  const privateKeyBytes = secureRandom.randomUint8Array(32);
  let tmp;
  let checkSum;

  tmp = sha256.digest((sha256.digest([...privatePrefixBytes, ...privateKeyBytes])));
  checkSum = tmp.slice(0, 4);
  const privateKey = base58.encode([...privatePrefixBytes, ...privateKeyBytes, ...checkSum]);
  const publicKeyBytes = ec.keyFromSecret(privateKeyBytes).getPublic();
  tmp = sha256.digest((sha256.digest([...publicPrefixBytes, ...publicKeyBytes])));
  checkSum = tmp.slice(0, 4);
  const publicKey = base58.encode([...publicPrefixBytes, ...publicKeyBytes, ...checkSum]);
  return {
    privateKey: privateKey,
    publicKey: publicKey,
  };
};

export default class IDENTITY {
  // eslint-disable-next-line no-useless-constructor
  constructor(options) {
    apiCall = new APICall(options);
  }

  // eslint-disable-next-line class-methods-use-this
  createIdentityKeyPair() {
    const result = [];
    let n = 0;
    while (n < 3) {
      result.push(createKeyPair());
      // eslint-disable-next-line no-plusplus
      n++;
    }
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  async createAnIdentity(name = [], keys = [], callbackURL = '', callbackStages = []) {
    if (!Array.isArray(name) || !name.length) {
      throw new Error('name is required.');
    }
    if (!Array.isArray(keys) || !keys.length) {
      throw new Error('keys is required.');
    }

    name.forEach((o, i, a) => {
      // eslint-disable-next-line no-param-reassign
      a[i] = Buffer.from(o).toString('base64');
    });
    const data = {
      name: name,
      keys: keys,
      callback_url: callbackURL,
      callback_stages: callbackStages,
    };

    const response = await apiCall.send('POST', 'identities', data);

    return response;
  }
}
