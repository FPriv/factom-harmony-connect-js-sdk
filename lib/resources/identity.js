/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createIdentityKeyPair"] }] */

import isUrl from 'is-url';
import APICall from '../api';
import KeyUtil from '../utils/keyUtil';

const utf8Encode = 'utf-8';
const getMethod = 'GET';
const postMethod = 'POST';
const identitiesString = 'identities';
const keysString = 'keys';

export default class Identity {
  constructor(options) {
    this.apiCall = new APICall(options);
  }

  createIdentityKeyPair() {
    const result = [];
    let n = 0;
    while (n < 3) {
      result.push(KeyUtil.createKeyPair());
      n += 1;
    }
    return result;
  }

  async createAnIdentity(name = [], keys = [], callbackURL = '', callbackStages = []) {
    if (!Array.isArray(name) || !name.length) {
      throw new Error('name is required.');
    }

    if (!Array.isArray(keys) || !keys.length) {
      throw new Error('keys is required.');
    }

    if (keys.length < 3) {
      throw new Error('keys should have at least 3 items.');
    }

    const keysValid = KeyUtil.validateKeys(keys);
    if (keysValid !== true) {
      throw new Error(keysValid);
    }

    if (keys.length !== [...new Set(keys)].length) {
      throw new Error('keys item is duplicated.');
    }

    const cbURL = callbackURL.trim() || '';
    if (!isUrl(cbURL) && cbURL.length) {
      throw new Error('invalid url: missing URL scheme.');
    }

    const nameBase64 = [];
    name.forEach((o) => {
      nameBase64.push(Buffer.from(o.trim()).toString('base64'));
    });
    const data = {
      name: nameBase64,
      keys: keys,
      callback_stages: callbackStages,
      callback_url: cbURL,
    };

    const response = await this.apiCall.send(postMethod, identitiesString, data);

    return response;
  }

  async getAnIdentity(chainId = '') {
    if (!chainId) {
      throw new Error('chain id is required.');
    }
    const response = await this.apiCall.send(getMethod, `${identitiesString}/${chainId}`);

    return response;
  }

  async getAllIdentityKeys(chainId = '') {
    if (!chainId) {
      throw new Error('chain id is required.');
    }
    const response = await this.apiCall.send(getMethod, `${identitiesString}/${chainId}/${keysString}`);

    return response;
  }

  async createAnIdentityKeyReplacement(chainId = '', oldPublicKey = '', newPublicKey = '', privateKey = '', callbackURL = '', callbackStages = []) {
    if (!chainId) {
      throw new Error('chain id is required.');
    }
    if (!oldPublicKey) {
      throw new Error('old public key is required.');
    }
    if (!newPublicKey) {
      throw new Error('new public key is required.');
    }
    if (!privateKey) {
      throw new Error('private key is required.');
    }
    if (!KeyUtil.validateCheckSum(oldPublicKey)) {
      throw new Error('old public key is invalid.');
    }
    if (!KeyUtil.validateCheckSum(newPublicKey)) {
      throw new Error('new public key is invalid.');
    }
    if (!KeyUtil.validateCheckSum(privateKey)) {
      throw new Error('private key is invalid.');
    }

    const cbURL = callbackURL.trim() || '';
    if (!isUrl(cbURL) && cbURL.length) {
      throw new Error('invalid url: missing URL scheme.');
    }

    const msgHash = Buffer.from(`${chainId + oldPublicKey + newPublicKey}`, utf8Encode);
    const signature = KeyUtil.signContent(privateKey, msgHash);
    const signerKey = KeyUtil.getPublicKeyFromPrivateKey(privateKey);
    const data = {
      old_key: oldPublicKey,
      new_key: newPublicKey,
      signature: signature,
      signer_key: signerKey,
      callback_stages: callbackStages,
      callback_url: cbURL,
    };

    const response = await this.apiCall.send(postMethod, `${identitiesString}/${chainId}/${keysString}`, data);

    return response;
  }
}
