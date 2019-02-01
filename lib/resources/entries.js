import APICall from '../api';
import EntryUtil from '../utils/entryUtil';

/**
 * @classdesc Represents the Entries. It allows the user to make call to the Entries API
 * with a single function.
 * @class
 */
export default class Entries {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  constructor(options) {
    this.apiCall = new APICall(options);
    this.automaticSigning = options.automaticSigning;
  }

  /**
   * @param  {String} params.chainId=''
   * @param  {String} params.entryHash=''
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */
  async getEntryInfo(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntryInfo(data);

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
  async createEntry(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;
    data.automaticSigning = this.automaticSigning;

    const response = await EntryUtil.createEntry(data);

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
  async getEntriesOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntries(data);

    return response;
  }

  /**
   * @param  {String} params.chainId=''
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the First Entry or an Error with the problem.
   */
  async getFirstEntryOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getFirstEntry(data);

    return response;
  }

  /**
   * @param  {String} params.chainId=''
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Last Entry or an Error with the problem.
   */
  async getLastEntryOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getLastEntry(data);

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
  async searchEntriesOfChain(params = {}) {
    const data = params;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.searchEntries(data);

    return response;
  }
}
