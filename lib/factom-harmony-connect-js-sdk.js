import Chain from './resources/chain';
import Chains from './resources/chains';
import Entries from './resources/entries';
import Identity from './resources/identity';
import Info from './resources/info';
import KeyUtil from './utils/keyUtil';

export default class FactomSDK {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   * @param  {String} options.baseURL - The URL with the account domain
   * @param  {String} options.accessToken.appId - The App Id
   * @param  {String} options.accessToken.appKey - The App Key
   */
  constructor(options) {
    let { automaticSigning } = options;
    if (typeof automaticSigning !== 'boolean') {
      automaticSigning = true;
    }

    this.options = {
      baseURL: options.baseURL,
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
  }

  async chain(params = {}) {
    const data = params;
    data.options = this.options;
    const chain = await new Chain(data);

    return chain;
  }
}