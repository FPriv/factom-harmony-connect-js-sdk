import APICall from '../api';
import CommonUtil from '../utils/commonUtil';
import EntryUtil from '../utils/entryUtil';
import KeyUtil from '../utils/keyUtil';

const getMethod = 'GET';
const chainsUrl = 'chains';
const identitiesUrl = 'identities';
const keysString = 'keys';

/**
 * @classdesc Represents the Chain. It allows the user to make call to the Chains and Entries API
 * with a single function.
 * @class
 */
export default class Chain {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  constructor(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }
    this.apiCall = new APICall(params.options);
    this.automaticSigning = params.options.automaticSigning;
    return (async () => {
      const response = await this.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}`);
      this.data = response.data;

      let { signatureValidation } = params;
      if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
        signatureValidation = true;
      }

      if (signatureValidation === true) {
        this.status = await this.validateSignature({
          chain: response,
          apiCall: this.apiCall,
        });
      }

      if (typeof signatureValidation === 'function') {
        this.status = signatureValidation(response);
      }

      return this;
    })();
  }

  /**
   * @param  {Object} params.chain=''
   * @param  {Object} params.apiCall=''
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
   * @param  {String} params.entryHash=''
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entry Info or an Error with the problem.
   */
  async getEntryInfo(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntryInfo(data);

    return response;
  }

  /**
   * @param  {String} params.content=''
   * @param  {String[]} params.externalIds=[]
   * @param  {String} params.signerPrivateKey=''
   * @param  {String} params.signerChainId=''
   * @param  {String} params.callbackUrl=''
   * @param  {String[]} params.callbackStages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entry Info or an Error with the problem.
   */
  async createEntry(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.automaticSigning = this.automaticSigning;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.createEntry(data);

    return response;
  }

  /**
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @param  {String[]} params.stages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entries or an Error with the problem.
   */
  async getEntries(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntries(data);

    return response;
  }

  /**
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the First Entry or an Error with the problem.
   */
  async getFirstEntry() {
    const data = {
      chainId: this.data.chain_id,
      apiCall: this.apiCall,
    };

    const response = await EntryUtil.getFirstEntry(data);

    return response;
  }

  /**
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Last Entry or an Error with the problem.
   */
  async getLastEntry() {
    const data = {
      chainId: this.data.chain_id,
      apiCall: this.apiCall,
    };

    const response = await EntryUtil.getLastEntry(data);

    return response;
  }

  /**
   * @param  {String[]} params.externalIds=[]
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entries Info or an Error with the problem.
   */
  async searchEntries(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.searchEntries(data);

    return response;
  }
}