/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createIdentityKeyPair"] }] */

import isUrl from 'is-url';
import APICall from '../api';
import KeyUtil from '../utils/keyUtil';
import CommonUtil from '../utils/commonUtil';

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
   * @param  {Number} [params.numberOfKeyPair = 3] - Number of the desired to create key pair
   * @return  {Object[]} Returns an array key pair object
   */
  createIdentityKeyPair({ numberOfKeyPair = 3 } = {}) {
    const result = [];
    let n = 0;
    while (n < numberOfKeyPair) {
      result.push(KeyUtil.createKeyPair());
      n += 1;
    }
    return result;
  }

  /**
   * @param  {String[]} params.name=[]
   * @param  {String[]} params.keys=[]
   * @param  {String} params.callbackURL=''
   * @param  {String[]} params.callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the chain or an Error with the problem
   */
  async createAnIdentity(params = {}) {
    if (!Array.isArray(params.name) || !params.name.length) {
      throw new Error('name is required.');
    }

    if (!Array.isArray(params.keys) || !params.keys.length) {
      throw new Error('keys are required.');
    }

    const keysInvalid = KeyUtil.getInvalidKeys({ signerKeys: params.keys });
    if (keysInvalid.length) {
      throw new Error(keysInvalid);
    }

    if (params.keys.length !== [...new Set(params.keys)].length) {
      throw new Error('keys item is duplicated.');
    }

    if (!CommonUtil.isEmptyString(params.callbackURL) && !isUrl(params.callbackURL)) {
      throw new Error('invalid url: missing URL scheme.');
    }

    const nameBase64 = [];
    params.name.forEach((o) => {
      nameBase64.push(Buffer.from(o.trim()).toString('base64'));
    });
    const data = {
      name: nameBase64,
      keys: params.keys,
      callback_stages: params.callbackStages,
      callback_url: params.callbackURL,
    };

    const response = await this.apiCall.send(postMethod, identitiesString, data);

    return response;
  }

  /**
   * @param  {String} params.chainId='' The chain id of the desired Identity.
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Identity or an Error with the problem.
   */
  async getAnIdentity({ chainId = '' } = {}) {
    if (!chainId) {
      throw new Error('chain id is required.');
    }
    const response = await this.apiCall.send(getMethod, `${identitiesString}/${chainId}`);

    return response;
  }

  /**
   * @param  {String} params.chainId='' The chain id of the desired Identity Keys.
   * @param  {Number} params.activeAtHeight=0
   * @param  {Number} params.limit=15
   * @param  {Number} params.offset=0
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Identity Keys or an Error with the problem.
   */
  async getAllIdentityKeys({ chainId = '', ...params } = {}) {
    if (!chainId) {
      throw new Error('chain id is required.');
    }

    let { activeAtHeight, limit, offset } = params;

    if (!activeAtHeight) {
      activeAtHeight = 0;
    }
    if (!limit) {
      limit = 15;
    }
    if (!offset) {
      offset = 0;
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
   * @param  {} params.chainId='' The chain id of the desired Identity Keys.
   * @param  {} params.oldPublicKey=''
   * @param  {} params.newPublicKey=''
   * @param  {} params.privateKey=''
   * @param  {} params.callbackURL=''
   * @param  {} params.callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the entry hash or an Error with the problem
   */
  async createAnIdentityKeyReplacement({ chainId = '', ...params } = {}) {
    if (CommonUtil.isEmptyString(chainId)) {
      throw new Error('chain id is required.');
    }
    if (CommonUtil.isEmptyString(params.oldPublicKey)) {
      throw new Error('old public key is required.');
    }
    if (CommonUtil.isEmptyString(params.newPublicKey)) {
      throw new Error('new public key is required.');
    }
    if (CommonUtil.isEmptyString(params.privateKey)) {
      throw new Error('private key is required.');
    }
    if (!KeyUtil.validateCheckSum({ signerKey: params.oldPublicKey })) {
      throw new Error('old public key is invalid.');
    }
    if (!KeyUtil.validateCheckSum({ signerKey: params.newPublicKey })) {
      throw new Error('new public key is invalid.');
    }
    if (!KeyUtil.validateCheckSum({ signerKey: params.privateKey })) {
      throw new Error('private key is invalid.');
    }

    const cbURL = `${params.callbackURL}`.trim();
    if (!isUrl(cbURL) && cbURL.length) {
      throw new Error('invalid url: missing URL scheme.');
    }

    const msgHash = Buffer.from(`${chainId + params.oldPublicKey + params.newPublicKey}`, utf8Encode);
    const signature = KeyUtil.signContent({ privateKey: params.privateKey, message: msgHash });
    const signerKey = KeyUtil.getPublicKeyFromPrivateKey({ privateKey: params.privateKey });
    const data = {
      old_key: params.oldPublicKey,
      new_key: params.newPublicKey,
      signature: signature,
      signer_key: signerKey,
      callback_stages: params.callbackStages,
      callback_url: cbURL,
    };

    const response = await this.apiCall.send(postMethod, `${identitiesString}/${chainId}/${keysString}`, data);

    return response;
  }
}
