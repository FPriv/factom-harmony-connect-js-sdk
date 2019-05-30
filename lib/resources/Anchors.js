import constants from '../utils/constants';
import CommonUtil from '../utils/commonUtil';
import APICall from '../api';

/**
 * @classdesc Represents the Anchors. It allows the user to make call to the Anchors API
 * with a single function.
 * @class
 */

export default class Anchors {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  constructor(options) {
    this.apiCall = new APICall(options);
    this.automaticSigning = options.automaticSigning;
  }

  /**
   * @param  {String} params.objectIdentifier = The entry hash, chain id, directory block height,
   * directory block keymr, entry block keymr, or facotid block keymr
   * being used to queryanchors
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */
  async get(params = {}) {
    if (CommonUtil.isEmptyString(params.objectIdentifier)) {
      throw new Error('objectIdentifier is required.');
    }

    // Checks that objectIdentifier is a hash of length 64 or a positive integer
    if (!(!isNaN(params.objectIdentifier) && Number(params.objectIdentifier) > 0)
    && params.objectIdentifier.length !== 64) {
      throw new Error('objectIdentifier is in an invalid format.');
    }

    const response = await this.apiCall.send(constants.GET_METHOD,
      `${constants.ANCHORS_URL}/${params.objectIdentifier}`, {}, params.baseUrl, params.accessToken);

    return response;
  }
}
