import APICall from '../api';
import CommonUtil from '../utils/commonUtil';
import EntryUtil from '../utils/entryUtil';
import KeyUtil from '../utils/keyUtil';

const getMethod = 'GET';
const chainsUrl = 'chains';
const identitiesUrl = 'identities';
const keysString = 'keys';

export default class Chain {
  constructor(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }
    this.apiCall = new APICall(params.options);
    this.automaticSigning = params.automaticSigning;
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
      const activatedHeight = params.chain.data.dblock.height;

      const data = {
        active_at_height: activatedHeight,
      };

      const keyResponse = await this.apiCall.send(getMethod, `${identitiesUrl}/${signerChainId}/${keysString}`, data);
      if (!keyResponse.data.filter(item => item.key === signerPublicKey).length > 0) {
        status = 'inactive_key';
      } else {
        const contentResponse = await EntryUtil.getFirstEntry({
          chainId: params.chain.data.chain_id,
          apiCall: this.apiCall,
        });
        const { content } = contentResponse.data;
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

  async getEntryInfo(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntryInfo(data);

    return response;
  }

  async createEntry(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.automaticSigning = this.automaticSigning;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.createEntry(data);

    return response;
  }

  async getEntries(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntries(data);

    return response;
  }

  async getFirstEntry() {
    const data = {
      chainId: this.data.chain_id,
      apiCall: this.apiCall,
    };

    const response = await EntryUtil.getFirstEntry(data);

    return response;
  }

  async getLastEntry() {
    const data = {
      chainId: this.data.chain_id,
      apiCall: this.apiCall,
    };

    const response = await EntryUtil.getLastEntry(data);

    return response;
  }

  async searchEntries(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.searchEntries(data);

    return response;
  }
}
