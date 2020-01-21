import base58 from 'base-58';
import KeyCommon from './keyCommon';

export default class Utils {
  /**
   * @param {Object} keyGenOptions - An optional object to specify creating different key pair types
   * @param {string} keyGenOptions.keyType - The key pair type being generated, defaults to ed25519signature2018
   * @param {string} keyGenOptions.secretPassphrase - The required pass phrase used to generate a rsasignature2018 type key pair
   * @return  {Object} Returns a key pair object
   */
  static generateKeyPair(keyGenOptions) {
    return KeyCommon.createKeyPair(keyGenOptions);
  }

  /**
   * @param  {String} params.rawPrivateKey='' - A base58 string in idpub or idsec format
   * @return  {Buffer} Returns key bytes array
   */
  static convertRawToKeyPair(params) {
    return KeyCommon.createKeyPair(params);
  }

  /**
   * @param  {String} params.signerKey='' - A base58 string in idpub or idsec format
   * @return  {Buffer} Returns key bytes array
   */
  static convertToRaw(params) {
    return KeyCommon.getKeyBytesFromKey(params);
  }
}
