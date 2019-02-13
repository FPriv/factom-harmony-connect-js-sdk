import isUrl from 'is-url';
import APICall from '../api';
import CommonUtil from '../utils/commonUtil';
import KeyUtil from '../utils/keyUtil';

const getMethod = 'GET';
const postMethod = 'POST';
const chainsUrl = 'chains';
const searchUrl = 'search';
const identitiesUrl = 'identities';
const keysString = 'keys';

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
  }

  /**
   * @param  {String} params.chainId='' The chain id of the desired Chain Info.
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */
  async getChainInfo(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }

    const response = await this.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}`);

    let { signatureValidation } = params;
    if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
      signatureValidation = true;
    }

    if (signatureValidation === true) {
      const status = await this.validateSignature({
        chain: response,
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
   * @param  {Object} params.chain={}
   * @return {String} status = [not_signed/invalid_chain_format | inactive_key |
   * invalid_signature | valid_signature]
   */
  async validateSignature(params = {}) {
    const externalIds = params.chain.data.external_ids;
    let status = 'valid_signature';

    if (externalIds.length < 6) {
      status = 'not_signed/invalid_chain_format';
    } else if (externalIds[0] !== 'SignedChain') {
      status = 'not_signed/invalid_chain_format';
    } else if (externalIds[1] !== '0x01') {
      status = 'not_signed/invalid_chain_format';
    } else {
      const signerChainId = externalIds[2];
      const signerPublicKey = externalIds[3];
      const signature = Buffer.from(externalIds[4], 'hex').toString('base64');
      const timeStamp = externalIds[5];
      let data = {};
      if (params.chain.data.dblock != null) {
        const activatedHeight = params.chain.data.dblock.height;

        data = {
          active_at_height: activatedHeight,
        };
      }

      const keyResponse = await this.apiCall.send(getMethod, `${identitiesUrl}/${signerChainId}/${keysString}`, data);
      if (!keyResponse.data.filter(item => item.key === signerPublicKey).length > 0) {
        status = 'inactive_key';
      } else {
        const message = `${signerChainId}${params.chain.data.content}${timeStamp}`;

        if (!KeyUtil.validateSignature({
          signerPublicKey: signerPublicKey,
          signature: signature,
          message: message,
        })) {
          status = 'invalid_signature';
        }
      }
    }

    return status;
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
  async createChain(params = {}) {
    if (this.automaticSigning) {
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

    if (this.automaticSigning) {
      const timeStamp = (new Date()).toISOString();
      const message = `${params.signerChainId}${params.content}${timeStamp}`;
      const signature = KeyUtil.signContent({
        signerPrivateKey: params.signerPrivateKey,
        message: message,
      });
      const signerPublicKey = KeyUtil.getPublicKeyFromPrivateKey({
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

    const response = await this.apiCall.send(postMethod, chainsUrl, data);

    return response;
  }

  /**
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @param  {String[]} params.stages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with all chain or an Error with the problem.
   */
  async getAllChains(params = {}) {
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

    const response = await this.apiCall.send(getMethod, chainsUrl, data);

    return response;
  }

  /**
   * @param  {String[]} params.externalIds=[]
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the chain or an Error with the problem.
   */
  async searchChains(params = {}) {
    if (CommonUtil.isEmptyArray(params.externalIds)) {
      throw new Error('at least 1 externalId is required.');
    }
    if (!Array.isArray(params.externalIds)) {
      throw new Error('externalIds must be an array.');
    }

    const { limit, offset } = params;
    let url = `${chainsUrl}/${searchUrl}`;

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

    const response = await this.apiCall.send(postMethod, url, data);

    return response;
  }
}
