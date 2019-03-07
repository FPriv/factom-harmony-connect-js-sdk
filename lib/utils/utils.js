import KeyCommon from './keyCommon';

export default class Utils {
  /**
   * @return  {Object} Returns a key pair object
   */
  static generatePair() {
    return KeyCommon.createKeyPair();
  }
}
