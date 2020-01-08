import base58 from 'base-58';
import KeyCommon from './keyCommon';

export default class Utils {
  /**
   * @return  {Object} Returns a key pair object
   */
  static generateKeyPair() {
    return KeyCommon.createKeyPair();
  }

  /**
   * @param  {String} params.signerKey='' - A base58 string in idpub or idsec format
   * @return  {Buffer} Returns key bytes array
   */
  static convertToRaw(params) {
    return KeyCommon.getKeyBytesFromKey(params);
  }

  /**
   * @param  {String} params.signerKey='' - A base58 string in idpub or idsec format
   * @return  {Buffer} Returns key bytes array
   */
  static convertRawToKeyPair(params) {
    return KeyCommon.getKeyBytesFromKey(params);
  }
}
