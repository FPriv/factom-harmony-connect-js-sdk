import isUrl from 'is-url';
import constants from '../utils/constants';
import CommonUtil from '../utils/commonUtil';
import ValidateSignatureUtil from '../utils/validateSignatureUtil';
import APICall from '../api';
import KeyCommon from '../utils/keyCommon';

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
   * @param  {String} params.height or params.entryHash= The entry hash or height being used to query anchors
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */
  async get(params = {}) {
    if (CommonUtil.isEmptyString(params.entryHash) && CommonUtil.isEmptyString(params.height)) {
      throw new Error ('entryHash or height is required.');
    }

    let finalParam = undefined;

    if(!CommonUtil.isEmptyString(params.entryHash)){
      finalParam = params.entryHash;
    }
    else {
      finalParam = params.height;
    }

    const response = await this.apiCall.send(constants.GET_METHOD, `${constants.ANCHORS_URL}/${finalParam}`);

    return response;
  }
}