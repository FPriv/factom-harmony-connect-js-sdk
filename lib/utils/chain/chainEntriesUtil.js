import EntryUtil from '../entriesUtil';

export default class ChainEntriesUtil {
  constructor(params = {}) {
    this.chainId = params.chainId;
    this.apiCall = params.apiCall;
    this.automaticSigning = params.automaticSigning;
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
  async create(params = {}) {
    const data = params;
    data.chainId = this.chainId;
    data.automaticSigning = this.automaticSigning;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.create(data);

    return response;
  }

  /**
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @param  {String[]} params.stages=[]
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entries or an Error with the problem.
   */
  async get(params = {}) {
    const data = params;
    data.chainId = this.chainId;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.get(data);

    return response;
  }

  /**
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the First Entry or an Error with the problem.
   */
  async getFirst(params = {}) {
    const data = params;
    data.chainId = this.chainId;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getFirst(data);

    return response;
  }

  /**
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Last Entry or an Error with the problem.
   */
  async getLast(params = {}) {
    const data = params;
    data.chainId = this.chainId;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.getLast(data);

    return response;
  }

  /**
   * @param  {String[]} params.externalIds=[]
   * @param  {Number} params.limit
   * @param  {Number} params.offset
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Entries Info or an Error with the problem.
   */
  async search(params = {}) {
    const data = params;
    data.chainId = this.chainId;
    data.apiCall = this.apiCall;

    const response = await EntryUtil.search(data);

    return response;
  }
}
