import APICall from '../api';

const getMethod = 'GET';

/**
 * @classdesc Represents the Info. It allows the user to make call to the Info API
 * with a single function.
 * @class
 */
export default class Info {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  constructor(options) {
    this.apiCall = new APICall(options);
  }

  /**
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Info or an Error with the problem.
   */
  async getInfo() {
    const response = await this.apiCall.send(getMethod);

    return response;
  }
}