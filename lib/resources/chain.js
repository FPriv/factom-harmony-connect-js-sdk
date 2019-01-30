import APICall from '../api';
import CommonUtil from '../utils/commonUtil';
import EntryUtil from '../utils/entryUtil';

const getMethod = 'GET';
const chainsUrl = 'chains';

export default class Chain {
  constructor(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }
    this.apiCall = new APICall(params.options);
    return (async () => {
      const response = await this.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}`);
      this.data = response.data;
      return this;
    })();
  }

  async entryInfo(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.entryInfo(data);

    return response;
  }

  async createAnEntry(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.createAnEntry(data);

    return response;
  }

  async createAnSignedEntry(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.createAnSignedEntry(data);

    return response;
  }

  async getEntries(params = {}) {
    const data = params;
    data.chainId = this.data.chain_id;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntries(data);

    return response;
  }

  async firstEntry() {
    const data = {
      chainId: this.data.chain_id,
      apiCall: this.apiCall,
    };

    const response = await EntryUtil.firstEntry(data);

    return response;
  }

  async lastEntry() {
    const data = {
      chainId: this.data.chain_id,
      apiCall: this.apiCall,
    };

    const response = await EntryUtil.lastEntry(data);

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
