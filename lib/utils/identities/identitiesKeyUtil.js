import isUrl from 'is-url';
import APICall from '../../api';
import constants from '../constants';
import CommonUtil from '../commonUtil';
import KeyCommon from '../keyCommon';

export default class IdentitiesKeyUtil {
  constructor(options) {
    this.apiCall = new APICall(options);
  }

  /**
   * @param  {String} params.identityChainId='' The chain id of the desired Identity Keys.
   * @param  {String} params.key
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Identity Key or an Error with the problem.
   */
  async get(params = {}) {
    if (CommonUtil.isEmptyString(params.identityChainId)) {
      throw new Error('identityChainId is required.');
    }
    if (CommonUtil.isEmptyString(params.key)) {
      throw new Error('key is required.');
    }
    if (!KeyCommon.validateCheckSum({ signerKey: params.key })) {
      throw new Error('key is invalid.');
    }

    const response = await this.apiCall.send(
      constants.GET_METHOD,
      `${constants.IDENTITIES_URL}/${params.identityChainId}/${constants.KEYS_STRING}/${params.key}`,
      {},
      params.clientOverrides,
    );

    return response;
  }

  /**
   * @param  {String} params.identityChainId='' The chain id of the desired Identity Keys.
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Identity Keys or an Error with the problem.
   */
  async list({ identityChainId = '', ...params } = {}) {
    if (!identityChainId) {
      throw new Error('identityChainId is required.');
    }

    const { limit, offset } = params;
    const data = {};

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
      constants.GET_METHOD,
      `${constants.IDENTITIES_URL}/${identityChainId}/${constants.KEYS_STRING}`,
      data,
      params.clientOverrides,
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
  async replace({ identityChainId = '', ...params } = {}) {
    if (CommonUtil.isEmptyString(identityChainId)) {
      throw new Error('identityChainId is required.');
    }
    if (CommonUtil.isEmptyString(params.oldPublicKey)) {
      throw new Error('oldPublicKey is required.');
    }
    let newKey;
    let keyPair;
    if (typeof params.newPublicKey !== 'undefined') {
      if (CommonUtil.isEmptyString(params.newPublicKey)) {
        throw new Error('newPublicKey is required.');
      }
      newKey = params.newPublicKey;
    } else {
      keyPair = KeyCommon.createKeyPair();
      newKey = keyPair.publicKey;
    }
    if (CommonUtil.isEmptyString(params.signerPrivateKey)) {
      throw new Error('signerPrivateKey is required.');
    }
    if (!KeyCommon.validateCheckSum({ signerKey: params.oldPublicKey })) {
      throw new Error('oldPublicKey is an invalid public key.');
    }
    if (!KeyCommon.validateCheckSum({ signerKey: newKey })) {
      throw new Error('newPublicKey is an invalid public key.');
    }
    if (!KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey })) {
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
      `${identityChainId + params.oldPublicKey + newKey}`,
      constants.UTF8_ENCODE,
    );
    const signature = KeyCommon.signContent({
      signerPrivateKey: params.signerPrivateKey,
      message: msgHash,
    });
    const signerKey = KeyCommon.getPublicKeyFromPrivateKey({
      signerPrivateKey: params.signerPrivateKey,
    });
    const data = {
      old_key: params.oldPublicKey,
      new_key: newKey,
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
      constants.POST_METHOD,
      `${constants.IDENTITIES_URL}/${identityChainId}/${constants.KEYS_STRING}`,
      data,
      params.clientOverrides,
    );

    if (typeof params.newPublicKey === 'undefined') {
      response.key_pair = {
        public_key: keyPair.publicKey,
        private_key: keyPair.privateKey,
      };
    }

    return response;
  }
}
