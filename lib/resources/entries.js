import APICall from '../api';
import EntryUtil from '../utils/entryUtil';

export default class Entries {
  constructor(options) {
    this.apiCall = new APICall(options);
  }

  async getEntryInfo(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.entryInfo(data);

    return response;
  }

  async createAnEntry(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.createAnEntry(data);

    return response;
  }

  async createAnSignedEntry(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.createAnSignedEntry(data);

    return response;
  }

  async getEntriesOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntries(data);

    return response;
  }

  async firstEntryOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.firstEntry(data);

    return response;
  }

  async lastEntryOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.lastEntry(data);

    return response;
  }

  async searchEntriesOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.searchEntries(data);

    return response;
  }
}