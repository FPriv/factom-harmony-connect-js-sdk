import isUrl from 'is-url';
import CommonUtil from './commonUtil';
import KeyUtil from './keyUtil';

const getMethod = 'GET';
const postMethod = 'POST';
const chainsUrl = 'chains';
const entriesUrl = 'entries';
const firstUrl = 'first';
const lastUrl = 'last';
const searchUrl = 'search';
const identitiesUrl = 'identities';
const keysString = 'keys';

/**
 * @classdesc Represents the Entry. It allows the user to make call to the Entries API
 * with a single function.
 * @class
 */
export default class Entry {
  /**
   * @param  {String} params.chainId=''
   * @param  {String} params.entryHash=''
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entry Info or an Error with the problem.
   */
  static async getEntryInfo(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }
    if (CommonUtil.isEmptyString(params.entryHash)) {
      throw new Error('entry hash is required.');
    }

    const response = await params.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}/${params.entryHash}`);

    let { signatureValidation } = params;
    if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
      signatureValidation = true;
    }

    if (signatureValidation === true) {
      const status = await this.validateSignature({
        entry: response,
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
   * @param  {Object} params.entry=''
   * @param  {Object} params.apiCall=''
   * @return {String} status = [not_signed/invalid_chain_format | inactive_key |
   * invalid_signature | valid_signature]
   */
  static async validateSignature(params = {}) {
    const externalIds = params.entry.data.external_ids;
    let status = 'valid_signature';

    if (externalIds.length < 6) {
      status = 'not_signed/invalid_entry_format';
    } else if (externalIds[0] !== 'SignedEntry') {
      status = 'not_signed/invalid_entry_format';
    } else if (externalIds[1] !== '0x01') {
      status = 'not_signed/invalid_entry_format';
    } else {
      const signerChainId = externalIds[2];
      const signerPublicKey = externalIds[3];
      const signature = Buffer.from(externalIds[4], 'hex').toString('base64');
      const timeStamp = externalIds[5];
      const activatedHeight = params.entry.data.dblock.height;

      const data = {
        active_at_height: activatedHeight,
      };

      const keyResponse = await params.apiCall.send(getMethod, `${identitiesUrl}/${signerChainId}/${keysString}`, data);
      if (!keyResponse.data.filter(item => item.key === signerPublicKey).length > 0) {
        status = 'inactive_key';
      } else {
        const { content } = params.entry.data;
        const message = `${signerChainId}${content}${timeStamp}`;

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
  static async createEntry(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }
    if (params.automaticSigning || params.signerPrivateKey || params.signerChainId) {
      if ((params.externalIds && !Array.isArray(params.externalIds))
        || (!params.automaticSigning
          && (!Array.isArray(params.externalIds) || !params.externalIds.length))) {
        throw new Error('external ids is a required array.');
      }
      if (CommonUtil.isEmptyString(params.signerPrivateKey)) {
        throw new Error('private key is required.');
      }
      if (!KeyUtil.validateCheckSum({ signerKey: params.signerPrivateKey })) {
        throw new Error('private key is invalid.');
      }
      if (CommonUtil.isEmptyString(params.signerChainId)) {
        throw new Error('signer chain id is required.');
      }
    } else if (!Array.isArray(params.externalIds) || !params.externalIds.length) {
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

    const response = await params.apiCall.send(postMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}`, data);

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
  static async getEntries(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }

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

    const response = await params.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}`, data);

    return response;
  }

  /**
   * @param  {String} params.chainId=''
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the First Entry or an Error with the problem.
   */
  static async getFirstEntry(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }

    const response = await params.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}/${firstUrl}`);

    return response;
  }

  /**
   * @param  {String} params.chainId=''
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Last Entry or an Error with the problem.
   */
  static async getLastEntry(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }

    const response = await params.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}/${lastUrl}`);

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
  static async searchEntries(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }
    if (!Array.isArray(params.externalIds) || !params.externalIds.length) {
      throw new Error('external ids is a required array.');
    }

    const { limit, offset } = params;
    let url = `${chainsUrl}/${params.chainId}/${entriesUrl}/${searchUrl}`;

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

    const response = await params.apiCall.send(postMethod, url, data);

    return response;
  }
}
