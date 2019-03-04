import isUrl from 'is-url';
import constants from './constants';
import CommonUtil from './commonUtil';
import KeyUtil from './keyUtil';
import ValidateSignatureUtil from './validateSignatureUtil';

/**
 * @classdesc Represents the EntriesUtil. It allows the user to make call to the Entries API
 * with a single function.
 * @class
 */
export default class EntriesUtil {
  /**
   * @param  {String} params.chainId=''
   * @param  {String} params.entryHash=''
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entry Info or an Error with the problem.
   */
  static async getEntry(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }
    if (CommonUtil.isEmptyString(params.entryHash)) {
      throw new Error('entryHash is required.');
    }

    const response = await params.apiCall.send(constants.GET_METHOD, `${constants.CHAINS_URL}/${params.chainId}/${constants.ENTRIES_URL}/${params.entryHash}`);

    let { signatureValidation } = params;
    if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
      signatureValidation = true;
    }

    if (signatureValidation === true) {
      const status = await ValidateSignatureUtil.validateSignature({
        obj: response,
        validateForChain: false,
        apiCall: params.apiCall,
      });

      return {
        entry: response,
        status: status,
      };
    }

    if (typeof signatureValidation === 'function') {
      return {
        entry: response,
        status: signatureValidation(response),
      };
    }

    return response;
  }

  /**
   * @param  {String} params.chainId=''
   * @param  {String} params.content=''
   * @param  {String[]} params.externalIds=[]
   * @param  {String} params.signerPrivateKey=''
   * @param  {String} params.signerChainId=''
   * @param  {String} params.callbackUrl=''
   * @param  {String[]} params.callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entry Info or an Error with the problem.
   */
  static async create(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }
    if (params.automaticSigning) {
      if (params.externalIds && !Array.isArray(params.externalIds)) {
        throw new Error('externalIds must be an array.');
      }
      if (CommonUtil.isEmptyString(params.signerPrivateKey)) {
        throw new Error('signerPrivateKey is required.');
      }
      if (!KeyUtil.validateCheckSum({ signerKey: params.signerPrivateKey })) {
        throw new Error('signerPrivateKey is invalid.');
      }
      if (CommonUtil.isEmptyString(params.signerChainId)) {
        throw new Error('signerChainId is required.');
      }
    } else {
      if (CommonUtil.isEmptyArray(params.externalIds)) {
        throw new Error('at least 1 externalId is required.');
      }
      if (!Array.isArray(params.externalIds)) {
        throw new Error('externalIds must be an array.');
      }
      if (params.signerPrivateKey && CommonUtil.isEmptyString(params.signerChainId)) {
        throw new Error('signerChainId is required when passing a signerPrivateKey.');
      }
      if (params.signerPrivateKey
        && !KeyUtil.validateCheckSum({ signerKey: params.signerPrivateKey })) {
        throw new Error('signerPrivateKey is invalid.');
      }
      if (params.signerChainId && CommonUtil.isEmptyString(params.signerPrivateKey)) {
        throw new Error('signerPrivateKey is required when passing a signerChainId.');
      }
    }
    if (CommonUtil.isEmptyString(params.content)) {
      throw new Error('content is required.');
    }
    if (!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl)) {
      throw new Error('callbackUrl is an invalid url format.');
    }
    if (params.callbackStages && !Array.isArray(params.callbackStages)) {
      throw new Error('callbackStages must be an array.');
    }

    const idsBase64 = [];
    if (params.automaticSigning) {
      const timeStamp = (new Date()).toISOString();
      const message = `${params.signerChainId}${params.content}${timeStamp}`;
      const signature = KeyUtil.signContent({
        signerPrivateKey: params.signerPrivateKey,
        message: message,
      });
      const signerPublicKey = KeyUtil.getPublicKeyFromPrivateKey({
        signerPrivateKey: params.signerPrivateKey,
      });

      idsBase64.push(Buffer.from('SignedEntry').toString('base64'));
      idsBase64.push(Buffer.from([0x01]).toString('base64'));
      idsBase64.push(Buffer.from(params.signerChainId).toString('base64'));
      idsBase64.push(Buffer.from(signerPublicKey).toString('base64'));
      idsBase64.push(signature);
      idsBase64.push(Buffer.from(timeStamp).toString('base64'));
    }

    if (params.externalIds) {
      params.externalIds.forEach((o) => {
        idsBase64.push(Buffer.from(o).toString('base64'));
      });
    }

    const data = {
      external_ids: idsBase64,
      content: Buffer.from(params.content).toString('base64'),
    };

    if (!CommonUtil.isEmptyString(params.callbackUrl)) {
      data.callback_url = params.callbackUrl;
    }
    if (Array.isArray(params.callbackStages)) {
      data.callback_stages = params.callbackStages;
    }

    const response = await params.apiCall.send(constants.POST_METHOD, `${constants.CHAINS_URL}/${params.chainId}/${constants.ENTRIES_URL}`, data);

    return response;
  }

  /**
   * @param  {String} params.chainId=''
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @param  {String[]} params.stages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entries or an Error with the problem.
   */
  static async get(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }

    const { limit, offset, stages } = params;

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
    if (stages) {
      if (!Array.isArray(stages)) {
        throw new Error('stages must be an array.');
      }
      data.stages = stages.join(',');
    }

    const response = await params.apiCall.send(constants.GET_METHOD, `${constants.CHAINS_URL}/${params.chainId}/${constants.ENTRIES_URL}`, data);

    return response;
  }

  /**
   * @param  {String} params.chainId=''
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the First Entry or an Error with the problem.
   */
  static async getFirst(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }

    const response = await params.apiCall.send(constants.GET_METHOD, `${constants.CHAINS_URL}/${params.chainId}/${constants.ENTRIES_URL}/${constants.FIRST_URL}`);

    let { signatureValidation } = params;
    if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
      signatureValidation = true;
    }

    if (signatureValidation === true) {
      const status = await ValidateSignatureUtil.validateSignature({
        obj: response,
        validateForChain: false,
        apiCall: params.apiCall,
      });

      return {
        entry: response,
        status: status,
      };
    }

    if (typeof signatureValidation === 'function') {
      return {
        entry: response,
        status: signatureValidation(response),
      };
    }

    return response;
  }

  /**
   * @param  {String} params.chainId=''
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Last Entry or an Error with the problem.
   */
  static async getLast(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }

    const response = await params.apiCall.send(constants.GET_METHOD, `${constants.CHAINS_URL}/${params.chainId}/${constants.ENTRIES_URL}/${constants.LAST_URL}`);

    let { signatureValidation } = params;
    if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
      signatureValidation = true;
    }

    if (signatureValidation === true) {
      const status = await ValidateSignatureUtil.validateSignature({
        obj: response,
        validateForChain: false,
        apiCall: params.apiCall,
      });

      return {
        entry: response,
        status: status,
      };
    }

    if (typeof signatureValidation === 'function') {
      return {
        entry: response,
        status: signatureValidation(response),
      };
    }

    return response;
  }

  /**
   * @param  {String} params.chainId=''
   * @param  {String[]} params.externalIds=[]
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entries Info or an Error with the problem.
   */
  static async search(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }
    if (CommonUtil.isEmptyArray(params.externalIds)) {
      throw new Error('at least 1 externalId is required.');
    }
    if (!Array.isArray(params.externalIds)) {
      throw new Error('externalIds must be an array.');
    }

    const { limit, offset } = params;
    let url = `${constants.CHAINS_URL}/${params.chainId}/${constants.ENTRIES_URL}/${constants.SEARCH_URL}`;

    if (limit) {
      if (!Number.isInteger(limit)) {
        throw new Error('limit must be an integer.');
      }

      url += `?limit=${limit}`;
    }
    if (offset) {
      if (!Number.isInteger(offset)) {
        throw new Error('offset must be an integer.');
      }

      if (limit) {
        url += `&offset=${offset}`;
      } else {
        url += `?offset=${offset}`;
      }
    }

    const idsBase64 = [];
    params.externalIds.forEach((o) => {
      idsBase64.push(Buffer.from(o).toString('base64'));
    });

    const data = {
      external_ids: idsBase64,
    };

    const response = await params.apiCall.send(constants.POST_METHOD, url, data);

    return response;
  }
}
