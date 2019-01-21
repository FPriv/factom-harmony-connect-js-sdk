import axios from 'axios';
import isUrl from 'is-url';
import joinUrl from 'proper-url-join';

const createAuthHeader = accessToken => ({
  app_id: accessToken.app_id,
  app_key: accessToken.app_key,
  'Content-Type': 'application/json',
});

export default class APICall {
  constructor(options) {
    if (!isUrl(options.baseURL)) throw new Error('The base URL provided is not valid.');
    if (!options.accessToken) throw new Error('The accessToken is required.');

    this.baseURL = options.baseURL;
    this.accessToken = options.accessToken;
  }

  async send(method, url, data = {}) {
    let callURL = joinUrl(this.baseURL, url);
    const headers = createAuthHeader(this.accessToken);
    let body = '';

    if (method === 'POST') {
      body = data;
    } else if (Object.keys(data).length && data.constructor === Object) {
      callURL = joinUrl(callURL, { trailingSlash: false, query: data });
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
