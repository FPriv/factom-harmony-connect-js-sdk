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
  async createIdentity(params = {}) {
    if (CommonUtil.isEmptyArray(params.name)) {
      throw new Error('name is required.');
    }
    if (!Array.isArray(params.name)) {
      throw new Error('name must be an array.');
    }
    if (CommonUtil.isEmptyArray(params.keys)) {
      throw new Error('at least 1 key is required.');
    }
    if (!Array.isArray(params.keys)) {
      throw new Error('keys must be an array.');
    }

    if (params.callbackStages && !Array.isArray(params.callbackStages)) {
      throw new Error('callbackStages must be an array.');
    }

    const keysInvalid = KeyUtil.getInvalidKeys({ signerKeys: params.keys });
    if (keysInvalid.length) {
      throw new Error(keysInvalid);
    }

    const dupicates = KeyUtil.getDuplicateKeys({ signerKeys: params.keys });
    if (dupicates.length) {
      throw new Error(dupicates);
    }

    if (
      !CommonUtil.isEmptyString(params.callbackUrl)
      && !isUrl(params.callbackUrl)
    ) {
      throw new Error('callbackUrl is an invalid url format.');
    }

    let nameByteCounts = 0;
    params.name.forEach((o) => {
      nameByteCounts += Buffer.from(o).length;
    });

    // 2 bytes for the size of extid + 13 for actual IdentityChain ext-id text
    // 2 bytes per name for size * (number of names) + size of all names
    // 23 bytes for `{"keys":[],"version":1}`
    // 58 bytes per `"idpub2PHPArpDF6S86ys314D3JDiKD8HLqJ4HMFcjNJP6gxapoNsyFG",` array element
    // -1 byte because last key element has no comma
    // = 37 + name_byte_count + 2(number_of_names) + 58(number_of_keys)
    const totalBytes = 37 + nameByteCounts + 2 * params.name.length + params.keys.length * 58;

    if (totalBytes > 10240) {
      throw new Error(`calculated bytes of name and keys is ${totalBytes}. It must be less than 10240, use less/shorter name or less keys.`);
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
   * @param  {String} params.identityChainId='' The chain id of the desired Identity.
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Identity or an Error with the problem.
   */
  async getIdentity({ identityChainId = '' } = {}) {
    if (!identityChainId) {
      throw new Error('identityChainId is required.');
    }
    const response = await this.apiCall.send(
      getMethod,
      `${identitiesUrl}/${identityChainId}`,
    );

    return response;
  }

  /**
   * @param  {String} params.identityChainId='' The chain id of the desired Identity Keys.
   * @param  {Number} params.activeAtHeight
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Identity Keys or an Error with the problem.
   */
  async getAllIdentityKeys({ identityChainId = '', ...params } = {}) {
    if (!identityChainId) {
      throw new Error('identityChainId is required.');
    }

    const { activeAtHeight, limit, offset } = params;
    const data = {};

    if (activeAtHeight) {
      if (!Number.isInteger(activeAtHeight)) {
        throw new Error('activeAtHeight must be an integer.');
      }
      data.active_at_height = activeAtHeight;
    }
    if (limit) {
      if (!Number.isInteger(limit)) {
        throw new Error('limit must be an integer.');
      }
      data.limit = limit;
    }
    if (offset) {
      if (!Number.isInteger(offset)) {
        throw new Error('offset must be an integer.');
      }
      data.offset = offset;
    }

    const response = await this.apiCall.send(
      getMethod,
      `${identitiesUrl}/${identityChainId}/${keysString}`,
      data,
    );

    return response;
  }

  /**
   * @param  {String} params.identityChainId='' The chain id of the desired Identity Keys.
   * @param  {String} params.oldPublicKey=''
   * @param  {String} params.newPublicKey=''
   * @param  {String} params.signerPrivateKey=''
   * @param  {String} params.callbackUrl=''
   * @param  {String[]} params.callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the entry hash or an Error with the problem
   */
  async createIdentityKeyReplacement({
    identityChainId = '',
    ...params
  } = {}) {
    if (CommonUtil.isEmptyString(identityChainId)) {
      throw new Error('identityChainId is required.');
    }
    if (CommonUtil.isEmptyString(params.oldPublicKey)) {
      throw new Error('oldPublicKey is required.');
    }
    if (CommonUtil.isEmptyString(params.newPublicKey)) {
      throw new Error('newPublicKey is required.');
    }
    if (CommonUtil.isEmptyString(params.signerPrivateKey)) {
      throw new Error('signerPrivateKey is required.');
    }
    if (!KeyUtil.validateCheckSum({ signerKey: params.oldPublicKey })) {
      throw new Error('oldPublicKey is an invalid public key.');
    }
    if (!KeyUtil.validateCheckSum({ signerKey: params.newPublicKey })) {
      throw new Error('newPublicKey is an invalid public key.');
    }
    if (!KeyUtil.validateCheckSum({ signerKey: params.signerPrivateKey })) {
      throw new Error('signerPrivateKey is invalid.');
    }
    if (params.callbackStages && !Array.isArray(params.callbackStages)) {
      throw new Error('callbackStages must be an array.');
    }
    if (
      !CommonUtil.isEmptyString(params.callbackUrl)
      && !isUrl(params.callbackUrl)
    ) {
      throw new Error('callbackUrl is an invalid url format.');
    }

    const msgHash = Buffer.from(
      `${identityChainId + params.oldPublicKey + params.newPublicKey}`,
      utf8Encode,
    );
    const signature = KeyUtil.signContent({
      signerPrivateKey: params.signerPrivateKey,
      message: msgHash,
    });
    const signerKey = KeyUtil.getPublicKeyFromPrivateKey({
      signerPrivateKey: params.signerPrivateKey,
    });
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

    const response = await this.apiCall.send(
      postMethod,
      `${identitiesUrl}/${identityChainId}/${keysString}`,
      data,
    );

    return response;
  }
}
