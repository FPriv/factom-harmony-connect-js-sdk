import isUrl from 'is-url';
import CommonUtil from './commonUtil';
import KeyUtil from './keyUtil';

const getMethod = 'GET';
const postMethod = 'POST';
const chainsUrl = 'chains';
const entriesUrl = 'entries';
const firstUrl = 'first';
const lastUrl = 'last';
const searchUrl = 'search';

export default class Entry {
  static async entryInfo(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }
    if (CommonUtil.isEmptyString(params.entryHash)) {
      throw new Error('entry hash is required.');
    }

    const response = await params.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}/${params.entryHash}`);

    return response;
  }

  static async createAnEntry(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }
    if (!Array.isArray(params.externalIds) || !params.externalIds.length) {
      throw new Error('external ids is a required array.');
    }
    if (CommonUtil.isEmptyString(params.content)) {
      throw new Error('content is required.');
    }
    if (!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl)) {
      throw new Error('invalid url: missing URL scheme.');
    }
    if (params.callbackStages && !Array.isArray(params.callbackStages)) {
      throw new Error('callback stages must be in array format.');
    }

    const idsBase64 = [];
    params.externalIds.forEach((o) => {
      idsBase64.push(Buffer.from(o).toString('base64'));
    });

    const data = {
      external_ids: idsBase64,
      content: Buffer.from(params.content).toString('base64'),
    };

    if (!CommonUtil.isEmptyString(params.callbackUrl)) {
      data.callback_url = params.callbackUrl;
    }
    if (Array.isArray(params.callbackStages)) {
      data.callback_stages = params.callbackStages;
    }

    const response = await params.apiCall.send(postMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}`, data);

    return response;
  }

  static async createAnSignedEntry(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }
    if (CommonUtil.isEmptyString(params.content)) {
      throw new Error('content is required.');
    }
    if (CommonUtil.isEmptyString(params.privateKey)) {
      throw new Error('private key is required.');
    }
    if (!KeyUtil.validateCheckSum({ signerKey: params.privateKey })) {
      throw new Error('private key is invalid.');
    }
    if (CommonUtil.isEmptyString(params.signerChainId)) {
      throw new Error('signer chain id is required.');
    }
    if (!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl)) {
      throw new Error('invalid url: missing URL scheme.');
    }
    if (params.callbackStages && !Array.isArray(params.callbackStages)) {
      throw new Error('callback stages must be in array format.');
    }
    const { externalIds } = params;
    if (externalIds) {
      if (!Array.isArray(externalIds)) {
        return new Error('external ids is a required array.');
      }
    }

    const idsBase64 = [];
    const timeStamp = (new Date()).toISOString();
    const message = `${params.signerChainId}${params.content}${timeStamp}`;
    const signature = KeyUtil.signContent({ privateKey: params.privateKey, message: message });
    const publicKey = KeyUtil.getPublicKeyFromPrivateKey({ privateKey: params.privateKey });

    idsBase64.push(Buffer.from('SignedEntry').toString('base64'));
    idsBase64.push(Buffer.from('0x01').toString('base64'));
    idsBase64.push(Buffer.from(params.signerChainId).toString('base64'));
    idsBase64.push(Buffer.from(publicKey).toString('base64'));
    idsBase64.push(signature);
    idsBase64.push(Buffer.from(timeStamp).toString('base64'));

    if (externalIds) {
      externalIds.forEach((o) => {
        idsBase64.push(Buffer.from(o).toString('base64'));
      });
    }

    const data = {
      external_ids: idsBase64,
      content: Buffer.from(params.content).toString('base64'),
    };

    if (!CommonUtil.isEmptyString(params.callbackUrl)) {
      data.callback_url = params.callbackUrl;
    }
    if (Array.isArray(params.callbackStages)) {
      data.callback_stages = params.callbackStages;
    }

    const response = await params.apiCall.send(postMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}`, data);

    return response;
  }

  static async getEntries(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }

    const { limit, offset, stages } = params;

    const data = {};

    if (limit) {
      if (!Number.isInteger(limit)) {
        throw new Error('limit must be number.');
      }
      data.limit = limit;
    }
    if (offset) {
      if (!Number.isInteger(offset)) {
        throw new Error('offset must be number.');
      }
      data.offset = offset;
    }
    if (stages) {
      if (!Array.isArray(stages)) {
        throw new Error('stages must be in array format.');
      }
      data.stages = stages.join(',');
    }

    const response = await params.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}`, data);

    return response;
  }

  static async firstEntry(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }

    const response = await params.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}/${firstUrl}`);

    return response;
  }

  static async lastEntry(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }

    const response = await params.apiCall.send(getMethod, `${chainsUrl}/${params.chainId}/${entriesUrl}/${lastUrl}`);

    return response;
  }

  static async searchEntries(params = {}) {
    if (CommonUtil.isEmptyString(params.chainId)) {
      throw new Error('chain id is required.');
    }
    if (!Array.isArray(params.externalIds) || !params.externalIds.length) {
      throw new Error('external ids is a required array.');
    }

    const { limit, offset } = params;
    let url = `${chainsUrl}/${params.chainId}/${entriesUrl}/${searchUrl}`;

    if (limit) {
      if (!Number.isInteger(limit)) {
        throw new Error('limit must be number.');
      }

      url += `?limit=${limit}`;
    }
    if (offset) {
      if (!Number.isInteger(offset)) {
        throw new Error('offset must be number.');
      }

      if (limit) {
        url += `&offset=${offset}`;
      } else {
        url += `?offset=${offset}`;
      }
    }

    const idsBase64 = [];
    params.externalIds.forEach((o) => {
      idsBase64.push(Buffer.from(o).toString('base64'));
    });

    const data = {
      external_ids: idsBase64,
    };

    const response = await params.apiCall.send(postMethod, url, data);

    return response;
  }
}
