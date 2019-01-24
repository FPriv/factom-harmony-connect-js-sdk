import axios from 'axios';
import isUrl from 'is-url';
import urlJoin from 'url-join';
import urlJoinQuery from 'url-join-query';


/**
* Creates the Authorization header.
* @return {Object} header - Returns an object with the Authorization header.
*/
const createAuthHeader = accessToken => ({
  app_id: accessToken.app_id,
  app_key: accessToken.app_key,
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
   * @param  {String} options.baseURL - The URL with the account domain
   * @param  {String} options.accessToken.app_id - The App Id
   * @param  {String} options.accessToken.app_key - The App Key
   */
  constructor(options) {
    if (!isUrl(options.baseURL)) throw new Error('The base URL provided is not valid.');
    if (!options.accessToken) throw new Error('The accessToken is required.');

    this.baseURL = options.baseURL;
    this.accessToken = options.accessToken;
  }

  /**
  * Fetch the information from the API.
  * @return {Promise} - Returns a Promise that, when fulfilled, will either return an
  * JSON Object with the requested
  * data or an Error with the problem.
  */
  async send(method, url = '', data = {}) {
    let callURL = urlJoin(this.baseURL, url);
    const headers = createAuthHeader(this.accessToken);
    let body = '';

    if (method === 'POST') {
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
        return response.data;
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
