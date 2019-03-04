import Chain from './resources/Chain';
import Chains from './resources/Chains';
import Entries from './resources/Entries';
import Identity from './resources/Identity';
import Info from './resources/Info';
import KeyUtil from './utils/keyUtil';

export default class FactomSDK {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   * @param  {String} options.baseUrl - The URL with the account domain
   * @param  {String} options.accessToken.appId - The App Id
   * @param  {String} options.accessToken.appKey - The App Key
   */
  constructor(options) {
    let { automaticSigning } = options;
    if (typeof automaticSigning !== 'boolean') {
      automaticSigning = true;
    }

    this.options = {
      baseUrl: options.baseUrl,
      accessToken: {
        appId: options.accessToken.appId,
        appKey: options.accessToken.appKey,
      },
      automaticSigning: automaticSigning,
    };

    this.identity = new Identity(this.options);
    this.info = new Info(this.options);
    this.chains = new Chains(this.options);
    this.entries = new Entries(this.options);
    this.keyUtil = KeyUtil;
    this.chain = new Chain(this.options);
  }
}
