import APICall from '../../api';
import constants from '../constants';
import CommonUtil from '../commonUtil';
import ValidateSignatureUtil from '../validateSignatureUtil';
import ChainEntriesUtil from './chainEntriesUtil';
import ChainEntryUtil from './chainEntryUtil';

/**
 * @classdesc Represents the ChainUtil.
 * @class
 */
export default class ChainUtil {
  /**
   * @constructor
   * @param  {Object} params.options - An object containing the access token and the base URL
   * @param  {String} params.chainId='' The chain id of the desired Chain Info.
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   */
  constructor(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chainId is required.');
    }
    this.chainId = params.chainId;
    this.apiCall = new APICall(params.options);
    this.automaticSigning = params.options.automaticSigning;
    this.entry = new ChainEntryUtil({
      chainId: this.chainId,
      apiCall: this.apiCall,
      automaticSigning: this.automaticSigning,
    });
    this.entries = new ChainEntriesUtil({
      chainId: this.chainId,
      apiCall: this.apiCall,
      automaticSigning: this.automaticSigning,
    });

    return (async () => {
      const response = await this.apiCall.send(constants.GET_METHOD, `${constants.CHAINS_URL}/${this.chainId}`);
      this.data = response.data;

      let { signatureValidation } = params;
      if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
        signatureValidation = true;
      }

      if (signatureValidation === true) {
        this.status = await ValidateSignatureUtil.validateSignature({
          obj: response,
          validateForChain: true,
          apiCall: this.apiCall,
        });
      }

      if (typeof signatureValidation === 'function') {
        this.status = signatureValidation(response);
      }

      return this;
    })();
  }
}
