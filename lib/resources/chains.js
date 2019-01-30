import isUrl from 'is-url';
import APICall from '../api';
import CommonUtil from '../utils/commonUtil';
import KeyUtil from '../utils/keyUtil';

const getMethod = 'GET';
const postMethod = 'POST';
const chainsUrl = 'chains';
const searchUrl = 'search';

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
  }

  /**
   * @param  {String} params.chainId='' The chain id of the desired Chain Info.
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */
  async getChainInfo(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }

    const response = await this.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}`);

    return response;
  }

  /**
   * @param  {String[]} params.externalIds=[]
   * @param  {String} params.content={}
   * @param  {String} params.callbackUrl={}
   * @param  {String[]} params.callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the chain or an Error with the problem.
   */
  async createAChain(params = {}) {
    if (!Array.isArray(params.externalIds) || !params.externalIds.length) {
      throw new Error('external ids is a required array.');
    }
    if (CommonUtil.isEmptyString(params.content)) {
      throw new Error('content is required.');
    }
    if (!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl)) {
      throw new Error('invalid url: missing URL scheme.');
    }
    if (params.callbackStages && !Array.isArray(params.callbackStages)) {
      throw new Error('callback stages must be in array format.');
    }

    const idsBase64 = [];
    params.externalIds.forEach((o) => {
      idsBase64.push(Buffer.from(o).toString('base64'));
    });

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

  async createASignedChain(params = {}) {
    if (CommonUtil.isEmptyString(params.content)) {
      throw new Error('content is required.');
    }
    if (CommonUtil.isEmptyString(params.privateKey)) {
      throw new Error('private key is required.');
    }
    if (!KeyUtil.validateCheckSum({ signerKey: params.privateKey })) {
      throw new Error('private key is invalid.');
    }
    if (CommonUtil.isEmptyString(params.signerChainId)) {
      throw new Error('signer chain id is required.');
    }
    if (!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl)) {
      throw new Error('invalid url: missing URL scheme.');
    }
    if (params.callbackStages && !Array.isArray(params.callbackStages)) {
      throw new Error('callback stages must be in array format.');
    }
    const { externalIds } = params;
    if (externalIds) {
      if (!Array.isArray(externalIds)) {
        return new Error('external ids is a required array.');
      }
    }

    const idsBase64 = [];
    const timeStamp = (new Date()).toISOString();
    const message = `${params.signerChainId}${params.content}${timeStamp}`;
    const signature = KeyUtil.signContent({ privateKey: params.privateKey, message: message });
    const publicKey = KeyUtil.getPublicKeyFromPrivateKey({ privateKey: params.privateKey });

    idsBase64.push(Buffer.from('SignedChain').toString('base64'));
    idsBase64.push(Buffer.from('0x01').toString('base64'));
    idsBase64.push(Buffer.from(params.signerChainId).toString('base64'));
    idsBase64.push(Buffer.from(publicKey).toString('base64'));
    idsBase64.push(signature);
    idsBase64.push(Buffer.from(timeStamp).toString('base64'));

    if (externalIds) {
      externalIds.forEach((o) => {
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
   * @param  {Number} [params.limit=15]
   * @param  {Number} [params.offset=0]
   * @param  {String[]} [params.stages=['replicated', 'factom', 'anchored']]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with all chain or an Error with the problem.
   */
  async getAllChains(params = {}) {
    const { limit, offset, stages } = params;

    const data = {};

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
    if (stages) {
      if (!Array.isArray(stages)) {
        throw new Error('stages must be in array format.');
      }
      data.stages = stages.join(',');
    }

    const response = await this.apiCall.send(getMethod, chainsUrl, data);

    return response;
  }

  /**
   * @param  {String[]} params.externalIds=[]
   * @param  {Number} [params.limit=15]
   * @param  {Number} [params.offset=0]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the chain or an Error with the problem.
   */
  async searchChains(params = {}) {
    if (!Array.isArray(params.externalIds) || !params.externalIds.length) {
      throw new Error('external ids is a required array.');
    }

    const { limit, offset } = params;
    let url = `${chainsUrl}/${searchUrl}`;

    if (limit) {
      if (!Number.isInteger(limit)) {
        throw new Error('limit must be number.');
      }

      url += `?limit=${limit}`;
    }
    if (offset) {
      if (!Number.isInteger(offset)) {
        throw new Error('offset must be number.');
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
