/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createIdentityKeyPair"] }] */

import isUrl from 'is-url';
import APICall from '../api';
import KeyUtil from '../utils/keyUtil';
import CommonUtil from '../utils/commonUtil';

const utf8Encode = 'utf-8';
const getMethod = 'GET';
const postMethod = 'POST';
const identitiesUrl = 'identities';
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
   * @param  {String} params.callbackUrl=''
   * @param  {String[]} params.callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the chain or an Error with the problem
   */
  async createAnIdentity(params = {}) {
    if (!Array.isArray(params.name) || !params.name.length) {
      throw new Error('name is a required array.');
    }
    if (!Array.isArray(params.keys) || !params.keys.length) {
      throw new Error('at least 1 key is required.');
    }

    let nameByteCounts = 0;
    params.name.forEach((o) => {
      nameByteCounts += Buffer.from(o).length;
    });
    const totalBytes = 37 + nameByteCounts + (2 * params.name.length) + (params.keys.length * 58);
    if (totalBytes > 10240) {
      throw new Error('data overflow: use less/shorter names or less keys.');
    }

    if (params.callbackStages && !Array.isArray(params.callbackStages)) {
      throw new Error('callback stages must be in array format.');
    }

    const keysInvalid = KeyUtil.getInvalidKeys({ signerKeys: params.keys });
    if (keysInvalid.length) {
      throw new Error(keysInvalid);
    }

    if (params.keys.length !== [...new Set(params.keys)].length) {
      throw new Error('keys item is duplicated.');
    }

    if (!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl)) {
      throw new Error('invalid url: missing URL scheme.');
    }

    const nameBase64 = [];
    params.name.forEach((o) => {
      nameBase64.push(Buffer.from(o.trim()).toString('base64'));
    });
    const data = {
      name: nameBase64,
      keys: params.keys,
    };

    if (!CommonUtil.isEmptyString(params.callbackUrl)) {
      data.callback_url = params.callbackUrl;
    }
    if (Array.isArray(params.callbackStages)) {
      data.callback_stages = params.callbackStages;
    }

    const response = await this.apiCall.send(postMethod, identitiesUrl, data);

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
    const response = await this.apiCall.send(getMethod, `${identitiesUrl}/${chainId}`);

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

    const { activeAtHeight, limit, offset } = params;
    const data = {};

    if (activeAtHeight) {
      if (!Number.isInteger(activeAtHeight)) {
        throw new Error('active at height must be number.');
      }
      data.activeAtHeight = activeAtHeight;
    }
    if (limit) {
      if (!Number.isInteger(limit)) {
        throw new Error('limit must be number.');
      }
      data.limit = limit;
    }
    if (offset) {
      if (!Number.isInteger(offset)) {
        throw new Error('offset must be number.');
      }
      data.offset = offset;
    }

    const response = await this.apiCall.send(getMethod, `${identitiesUrl}/${chainId}/${keysString}`, data);

    return response;
  }

  /**
   * @param  {String} params.chainId='' The chain id of the desired Identity Keys.
   * @param  {String} params.oldPublicKey=''
   * @param  {String} params.newPublicKey=''
   * @param  {String} params.privateKey=''
   * @param  {String} params.callbackUrl=''
   * @param  {String[]} params.callbackStages=[]
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
    if (params.callbackStages && !Array.isArray(params.callbackStages)) {
      throw new Error('callback stages must be in array format.');
    }
    if (!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl)) {
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
    };

    if (!CommonUtil.isEmptyString(params.callbackUrl)) {
      data.callback_url = params.callbackUrl;
    }
    if (Array.isArray(params.callbackStages)) {
      data.callback_stages = params.callbackStages;
    }

    const response = await this.apiCall.send(postMethod, `${identitiesUrl}/${chainId}/${keysString}`, data);

    return response;
  }
}
