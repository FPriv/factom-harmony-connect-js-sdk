import axios from 'axios';
import isUrl from 'is-url';
import urlJoin from 'url-join';
import urlJoinQuery from 'url-join-query';
import CommonUtil from './utils/commonUtil';
import constants from './utils/constants';


/**
* Creates the Authorization header.
* @return {Object} header - Returns an object with the Authorization header.
*/
const createAuthHeader = accessToken => ({
  app_id: accessToken.appId,
  app_key: accessToken.appKey,
  'Content-Type': 'application/json',
});

/**
 * @classdesc Represents an API call.
 * @class
 */
export default class APICall {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   * @param  {String} options.baseUrl - The URL with the account domain
   * @param  {String} options.accessToken.appId - The App Id
   * @param  {String} options.accessToken.appKey - The App Key
   */
  constructor(options) {
    if (!isUrl(options.baseUrl)) throw new Error('The base URL provided is not valid.');
    if (!options.accessToken) throw new Error('The accessToken is required.');

    this.baseUrl = options.baseUrl;
    this.accessToken = options.accessToken;
  }

  /**
  * Fetch the information from the API.
  * @return {Promise} - Returns a Promise that, when fulfilled, will either return an
  * JSON Object with the requested
  * data or an Error with the problem.
  */
  async send(method, url = '', data = {}, clientOverrides = {}) {
    let callURL = urlJoin(clientOverrides.baseUrl || this.baseUrl, url);
    const headers = createAuthHeader(clientOverrides.accessToken || this.accessToken);
    let body = '';

    if (method === constants.POST_METHOD) {
      body = data;
    } else if (Object.keys(data).length && data.constructor === Object) {
      callURL = urlJoinQuery(callURL, data);
    }
    try {
      const response = await axios(callURL, {
        method: method,
        data: body,
        headers: headers,
      });
      if (response.status >= 200 && response.status <= 202) {
        return CommonUtil.decodeResponse(response.data);
      } if (response.status >= 400) {
        return Promise.reject(new Error({
          status: response.status,
          message: response.statusText,
        }));
      }
      return {};
    } catch (error) {
      throw error;
    }
  }
}
