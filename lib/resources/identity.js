/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createIdentityKeyPair"] }] */

import isUrl from 'is-url';
import APICall from '../api';
import KeyUtil from '../utils/keyUtil';

const utf8Encode = 'utf-8';
const getMethod = 'GET';
const postMethod = 'POST';
const identitiesString = 'identities';
const keysString = 'keys';

/**
 * @classdesc Represents the Identity. It allows the user to make call to the Identity API
 * with a single function.
 * @class
 */
export default class Identity {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  constructor(options) {
    this.apiCall = new APICall(options);
  }

  /**
   * @param  {Number} [numberOfKeyPair=3] - Number of the desired to create key pair
   * @return  {Object[]} Returns an array key pair object
   */
  createIdentityKeyPair(numberOfKeyPair = 3) {
    const result = [];
    let n = 0;
    while (n < numberOfKeyPair) {
      result.push(KeyUtil.createKeyPair());
      n += 1;
    }
    return result;
  }

  /**
   * @param  {String[]} name=[]
   * @param  {String[]} keys=[]
   * @param  {String} callbackURL=''
   * @param  {String[]} callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the chain or an Error with the problem
   */
  async createAnIdentity(name = [], keys = [], callbackURL = '', callbackStages = []) {
    if (!Array.isArray(name) || !name.length) {
      throw new Error('name is required.');
    }

    if (!Array.isArray(keys) || !keys.length) {
      throw new Error('keys is required.');
    }

    const keysInvalid = KeyUtil.getInvalidKeys(keys);
    if (keysInvalid.length) {
      throw new Error(keysInvalid);
    }

    if (keys.length !== [...new Set(keys)].length) {
      throw new Error('keys item is duplicated.');
    }

    const cbURL = `${callbackURL}`.trim();
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

  /**
   * @param  {String} chainId='' The chain id of the desired Identity.
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Identity or an Error with the problem.
   */
  async getAnIdentity(chainId = '') {
    if (!chainId) {
      throw new Error('chain id is required.');
    }
    const response = await this.apiCall.send(getMethod, `${identitiesString}/${chainId}`);

    return response;
  }

  /**
   * @param  {String} chainId='' The chain id of the desired Identity Keys.
   * @param  {Number} activeAtHeight=0
   * @param  {Number} limit=15
   * @param  {Number} offset=0
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Identity Keys or an Error with the problem.
   */
  async getAllIdentityKeys(chainId = '', activeAtHeight = 0, limit = 15, offset = 0) {
    if (!chainId) {
      throw new Error('chain id is required.');
    }

    const data = {
      limit: limit,
    };
    if (activeAtHeight > 0) {
      data.activeAtHeight = activeAtHeight;
    }
    if (offset > 0) {
      data.offset = offset;
    }
    const response = await this.apiCall.send(getMethod, `${identitiesString}/${chainId}/${keysString}`, data);

    return response;
  }

  /**
   * @param  {} chainId='' The chain id of the desired Identity Keys.
   * @param  {} oldPublicKey=''
   * @param  {} newPublicKey=''
   * @param  {} privateKey=''
   * @param  {} callbackURL=''
   * @param  {} callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the entry hash or an Error with the problem
   */
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

    const cbURL = `${callbackURL}`.trim();
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
