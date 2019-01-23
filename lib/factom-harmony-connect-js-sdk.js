import Identity from './resources/identity';
import KeyUtil from './utils/keyUtil';

export default class FactomSDK {
  constructor(options) {
    this.identity = new Identity(options);
    this.keyUtil = KeyUtil;
  }
}
