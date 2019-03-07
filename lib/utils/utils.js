import KeyCommon from './keyCommon';

export default class Utils {
  /**
   * @return  {Object} Returns a key pair object
   */
  static generateKeyPair() {
    return KeyCommon.createKeyPair();
  }
}
