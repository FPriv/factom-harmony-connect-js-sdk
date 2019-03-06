import isUrl from 'is-url';
import constants from '../utils/constants';
import APICall from '../api';
import CommonUtil from '../utils/commonUtil';
import KeyCommon from '../utils/keyCommon';
import ValidateSignatureUtil from '../utils/validateSignatureUtil';
import Entries from './Entries';

/**
 * @classdesc Represents the Chains. It allows the user to make call to the Chains API
 * with a single function.
 * @class
 */
export default class Chains {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  constructor(options) {
    this.apiCall = new APICall(options);
    this.automaticSigning = options.automaticSigning;
    this.entries = new Entries(options);
  }

  /**
   * @param  {String} params.chainId='' The chain id of the desired Chain Info.
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */
  async get(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }

    const response = await this.apiCall.send(constants.GET_METHOD, `${constants.CHAINS_URL}/${params.chainId}`);

    let { signatureValidation } = params;
    if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
      signatureValidation = true;
    }

    if (signatureValidation === true) {
      const status = await ValidateSignatureUtil.validateSignature({
        obj: response,
        validateForChain: true,
        apiCall: this.apiCall,
      });

      return {
        chain: response,
        status: status,
      };
    }

    if (typeof signatureValidation === 'function') {
      return {
        chain: response,
        status: signatureValidation(response),
      };
    }

    return response;
  }

  /**
   * @param  {String[]} params.externalIds=[]
   * @param  {String} params.signerPrivateKey=''
   * @param  {String} params.signerChainId=''
   * @param  {String} params.content={}
   * @param  {String} params.callbackUrl={}
   * @param  {String[]} params.callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the chain or an Error with the problem.
   */
  async create(params = {}) {
    if (this.automaticSigning) {
      if (params.externalIds && !Array.isArray(params.externalIds)) {
        throw new Error('externalIds must be an array.');
      }
      if (CommonUtil.isEmptyString(params.signerPrivateKey)) {
        throw new Error('signerPrivateKey is required.');
      }
      if (!KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey })) {
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
        && !KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey })) {
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

    if (this.automaticSigning) {
      const timeStamp = (new Date()).toISOString();
      const message = `${params.signerChainId}${params.content}${timeStamp}`;
      const signature = KeyCommon.signContent({
        signerPrivateKey: params.signerPrivateKey,
        message: message,
      });
      const signerPublicKey = KeyCommon.getPublicKeyFromPrivateKey({
        signerPrivateKey: params.signerPrivateKey,
      });

      idsBase64.push(Buffer.from('SignedChain').toString('base64'));
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

    const response = await this.apiCall.send(constants.POST_METHOD, constants.CHAINS_URL, data);

    return response;
  }

  /**
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @param  {String[]} params.stages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with all chain or an Error with the problem.
   */
  async list(params = {}) {
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

    const response = await this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL, data);

    return response;
  }

  /**
   * @param  {String[]} params.externalIds=[]
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the chain or an Error with the problem.
   */
  async search(params = {}) {
    if (CommonUtil.isEmptyArray(params.externalIds)) {
      throw new Error('at least 1 externalId is required.');
    }
    if (!Array.isArray(params.externalIds)) {
      throw new Error('externalIds must be an array.');
    }

    const { limit, offset } = params;
    let url = `${constants.CHAINS_URL}/${constants.SEARCH_URL}`;

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

    const response = await this.apiCall.send(constants.POST_METHOD, url, data);

    return response;
  }
}
