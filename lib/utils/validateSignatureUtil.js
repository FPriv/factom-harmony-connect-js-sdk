import KeyUtil from './keyUtil';
import constants from './constants';

export default class ValidateSignatureUtil {
  /**
   * @param  {Object} obj
   * @param  {Boolean} validateForChain
   * @param  {Object} apiCall
   * @return {String} status = [not_signed/invalid_chain_format (not_signed/invalid_entry_format) |
   * inactive_key | invalid_signature | valid_signature]
   */
  static async validateSignature({ obj = {}, validateForChain = true, apiCall } = {}) {
    const externalIds = obj.data.external_ids;
    let typeName = 'SignedChain';
    let invalidFormat = 'not_signed/invalid_chain_format';

    if (!validateForChain) {
      typeName = 'SignedEntry';
      invalidFormat = 'not_signed/invalid_entry_format';
    }

    if (externalIds.length < 6 || externalIds[0] !== typeName || externalIds[1] !== '0x01') {
      return invalidFormat;
    }

    const signerChainId = externalIds[2];
    const signerPublicKey = externalIds[3];
    const signature = Buffer.from(externalIds[4], 'hex').toString('base64');
    const timeStamp = externalIds[5];

    let data = {};
    if (obj.data.dblock != null) {
      const activatedHeight = obj.data.dblock.height;

      data = {
        active_at_height: activatedHeight,
      };
    }

    const keyResponse = await apiCall.send(constants.GET_METHOD, `${constants.IDENTITIES_URL}/${signerChainId}/${constants.KEYS_STRING}`, data);
    if (!keyResponse.data.filter(item => item.key === signerPublicKey).length > 0) {
      return 'inactive_key';
    }

    const message = `${signerChainId}${obj.data.content}${timeStamp}`;

    if (!KeyUtil.validateSignature({
      signerPublicKey: signerPublicKey,
      signature: signature,
      message: message,
    })) {
      return 'invalid_signature';
    }

    return 'valid_signature';
  }
}
