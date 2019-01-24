import Identity from './resources/identity';
import KeyUtil from './utils/keyUtil';

export default class FactomSDK {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   * @param  {String} options.baseURL - The URL with the account domain
   * @param  {String} options.accessToken.app_id - The App Id
   * @param  {String} options.accessToken.app_key - The App Key
   */
  constructor(options) {
    const opts = {
      baseURL: options.baseURL,
      accessToken: {
        app_id: options.accessToken.app_id,
        app_key: options.accessToken.app_key,
      },
    };

    this.identity = new Identity(opts);
    this.keyUtil = KeyUtil;
  }
}
