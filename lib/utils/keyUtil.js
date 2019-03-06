import KeyCommon from './keyCommon';

export default class KeyUtil {
  /**
   * @param  {Number} [params.numberOfKeyPairs = 3] - Number of the desired to create key pair
   * @return  {Object[]} Returns an array key pair object
   */
  static generatePairs({ numberOfKeyPairs = 3 } = {}) {
    const result = [];
    for (let i = 0; i < numberOfKeyPairs; i += 1) {
      result.push(KeyCommon.createKeyPair());
    }
    return result;
  }
}
