import constants from '../utils/constants';
import CommonUtil from '../utils/commonUtil';
import APICall from '../api';

/**
 * @classdesc Represents the Receipts. It allows the user to make call to the Receipts API
 * with a single function.
 * @class
 */

export default class Receipts {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  constructor(options) {
    this.apiCall = new APICall(options);
    this.automaticSigning = options.automaticSigning;
  }

  /**
   * @param  {String} params.entryHash=''
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */
  async get(params = {}) {
    if (CommonUtil.isEmptyString(params.entryHash)) {
      throw new Error('entryHash or height is required.');
    }

    const response = await this.apiCall.send(constants.GET_METHOD, `${constants.RECEIPTS_URL}/${params.entryHash}`);

    return response;
  }
}
