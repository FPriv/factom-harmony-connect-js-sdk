import APICall from '../api';
import EntryUtil from '../utils/entryUtil';

export default class Entries {
  constructor(options) {
    this.apiCall = new APICall(options);
    this.automaticSigning = options.automaticSigning;
  }

  async getgetEntryInfo(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntryInfo(data);

    return response;
  }

  async createEntry(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;
    data.automaticSigning = this.automaticSigning;

    const response = await EntryUtil.createEntry(data);

    return response;
  }

  async getEntriesOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntries(data);

    return response;
  }

  async getFirstEntryOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getFirstEntry(data);

    return response;
  }

  async getLastEntryOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getLastEntry(data);

    return response;
  }

  async searchEntriesOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.searchEntries(data);

    return response;
  }
}
