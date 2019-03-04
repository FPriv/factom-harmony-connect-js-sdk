import EntryUtil from '../entriesUtil';

export default class ChainEntryUtil {
  constructor(params = {}) {
    this.chainId = params.chainId;
    this.apiCall = params.apiCall;
    this.automaticSigning = params.automaticSigning;
  }

  /**
   * @param  {String} params.entryHash=''
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entry Info or an Error with the problem.
   */
  async get(params = {}) {
    const data = params;
    data.chainId = this.chainId;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getEntry(data);

    return response;
  }
}
