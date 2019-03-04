import ChainUtil from '../utils/chain/chainUtil';

/**
 * @classdesc Represents the Chain.
 * @class
 */
export default class Chain {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * @param  {String} params.chainId='' The chain id of the desired Chain Info.
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */
  async get(params = {}) {
    const data = params;
    data.options = this.options;
    const chain = await new ChainUtil(data);

    return chain;
  }
}
