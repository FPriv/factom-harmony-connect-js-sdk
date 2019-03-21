import KeyCommon from './keyCommon';
import constants from './constants';

export default class ValidateSignatureUtil {
  /**
   * @param  {Object} obj
   * @param  {Boolean} validateForChain
   * @param  {Object} apiCall
   * @return {String} status = [not_signed/invalid_chain_format (not_signed/invalid_entry_format) |
   * retired_key | invalid_signature | valid_signature]
   */
  static async validateSignature({ obj = {}, validateForChain = true, apiCall } = {}) {
    const externalIds = obj.data.external_ids;
    let typeName = 'SignedChain';
    let invalidFormat = 'not_signed/invalid_chain_format';

    if (!validateForChain) {
      typeName = 'SignedEntry';
      invalidFormat = 'not_signed/invalid_entry_format';
    }

    // Hex signature always have length = 128.
    // And when convert it to base64, it always have length = 88
    if (externalIds.length < 6
      || externalIds[0] !== typeName
      || externalIds[1] !== '0x01'
      || !KeyCommon.validateCheckSum({ signerKey: externalIds[3] })
      || !(externalIds[4].length === 128 && Buffer.from(externalIds[4], 'hex').toString('base64').length === 88)) {
      return invalidFormat;
    }

    const signerChainId = externalIds[2];
    const signerPublicKey = externalIds[3];
    const signature = Buffer.from(externalIds[4], 'hex').toString('base64');
    const timeStamp = externalIds[5];

    let keyHeight = 0;
    if (obj.data.dblock != null) {
      keyHeight = obj.data.dblock.height;
    }

    try {
      const keyResponse = await apiCall.send(constants.GET_METHOD, `${constants.IDENTITIES_URL}/${signerChainId}/${constants.KEYS_STRING}/${signerPublicKey}`);
      if (keyResponse.data.retired_height != null
        && !((keyResponse.data.activated_height <= keyHeight)
         && (keyHeight <= keyResponse.data.retired_height))) {
        return 'retired_key';
      }
    } catch (error) {
      return 'retired_key';
    }

    const message = `${signerChainId}${obj.data.content}${timeStamp}`;

    if (!KeyCommon.validateSignature({
      signerPublicKey: signerPublicKey,
      signature: signature,
      message: message,
    })) {
      return 'invalid_signature';
    }

    return 'valid_signature';
  }
}
