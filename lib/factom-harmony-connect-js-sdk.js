import Identity from './resources/identity';
import KeyUtil from './utils/keyUtil';
import Info from './resources/info';

export default class FactomSDK {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   * @param  {String} options.baseURL - The URL with the account domain
   * @param  {String} options.accessToken.appId - The App Id
   * @param  {String} options.accessToken.appKey - The App Key
   */
  constructor(options) {
    const opts = {
      baseURL: options.baseURL,
      accessToken: {
        appId: options.accessToken.appId,
        appKey: options.accessToken.appKey,
      },
    };

    this.identity = new Identity(opts);
    this.info = new Info(opts);
    this.keyUtil = KeyUtil;
  }
}
