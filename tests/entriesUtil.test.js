/* eslint-env jest */
import axios from 'axios';
import ApiCall from '../lib/api';
import EntryUtil from '../lib/utils/entriesUtil';

jest.mock('axios');
describe('ENTRIES UTIL Test', () => {
  describe('Entry Info', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when chain id is missing', async () => {
      try {
        await EntryUtil.getEntry();
      } catch (error) {
        expect(error).toEqual(new Error('chainId is required.'));
      }
    });
    it('should return error message when entry hash is missing', async () => {
      try {
        await EntryUtil.getEntry({ chainId: '123456' });
      } catch (error) {
        expect(error).toEqual(new Error('entryHash is required.'));
      }
    });
    it('should return entry info successfully', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.getEntry({
        chainId: '123456',
        entryHash: 'sha256',
        signatureValidation: false,
        apiCall: apiCall,
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/sha256', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
    it('should return entry info successfully with signature validation is a function', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.getEntry({
        chainId: '123456',
        entryHash: 'sha256',
        signatureValidation: () => 'not_signed/invalid_chain_format',
        apiCall: apiCall,
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/sha256', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.status).toMatch('not_signed/invalid_chain_format');
    });
  });
  describe('Create An Entry without signing', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when chain id is missing', async () => {
      try {
        await EntryUtil.create();
      } catch (error) {
        expect(error).toEqual(new Error('chainId is required.'));
      }
    });
    it('should return error message when external ids is missing', async () => {
      try {
        const data = {
          chainId: '123456',
          automaticSigning: false,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 externalId is required.'));
      }
    });
    it('should return error message when external ids is not array', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: '1',
          automaticSigning: false,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('externalIds must be an array.'));
      }
    });
    it('should return error message when signer chain id is missing', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          signerPrivateKey: 'idsec',
          automaticSigning: false,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerChainId is required when passing a signerPrivateKey.'));
      }
    });
    it('should return error message when signer private key is invalid', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          signerPrivateKey: 'idsec',
          signerChainId: '123456',
          automaticSigning: false,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is invalid.'));
      }
    });
    it('should return error message when signer private key is missing', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          signerChainId: '123456',
          automaticSigning: false,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is required when passing a signerChainId.'));
      }
    });
    it('should return error message when content is missing', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          automaticSigning: false,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('content is required.'));
      }
    });
    it('should return error message when callback url is invalid', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          content: '123',
          callbackUrl: 'callback.com',
          automaticSigning: false,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackUrl is an invalid url format.'));
      }
    });
    it('should return error message when callback stages is not array', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          content: '123',
          callbackUrl: 'http://callback.com',
          callbackStages: '123',
          automaticSigning: false,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackStages must be an array.'));
      }
    });
    it('should create an entry successfully', async () => {
      const data = {
        chainId: '123456',
        externalIds: ['1'],
        content: '123',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
        apiCall: apiCall,
        automaticSigning: false,
      };

      const resp = {
        status: 200,
        data: {
          entry_hash: '123456',
        },
      };

      const dataPostAPI = {
        external_ids: [
          Buffer.from('1').toString('base64'),
        ],
        content: Buffer.from('123').toString('base64'),
        callback_url: 'http://callback.com',
        callback_stages: [
          'factom',
          'replicated',
        ],
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.create(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ entry_hash: '123456' });
    });
  });
  describe('Create An Entry with siging', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when private key is missing', async () => {
      try {
        const data = {
          chainId: '123456',
          automaticSigning: true,
        };
        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is required.'));
      }
    });
    it('should return error message when private key is invalid', async () => {
      try {
        const data = {
          chainId: '123456',
          signerPrivateKey: 'idsec',
          automaticSigning: true,
        };
        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is invalid.'));
      }
    });
    it('should return error message when signer chain id is missing', async () => {
      try {
        const data = {
          chainId: '123456',
          signerPrivateKey: 'idsec1rxvt6BX7KJjaqUhVMQNBGzaa1H4oy43njXSW171HftLnTyvhZ',
          automaticSigning: true,
        };
        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerChainId is required.'));
      }
    });
    it('should return error message when content is missing', async () => {
      try {
        const data = {
          chainId: '123456',
          signerPrivateKey: 'idsec1rxvt6BX7KJjaqUhVMQNBGzaa1H4oy43njXSW171HftLnTyvhZ',
          signerChainId: '12345',
          automaticSigning: true,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('content is required.'));
      }
    });
    it('should return error message when callback url is invalid', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          signerChainId: '12345',
          callbackUrl: 'callback.com',
          automaticSigning: true,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackUrl is an invalid url format.'));
      }
    });
    it('should return error message when callback stages is not array', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          signerChainId: '12345',
          callbackUrl: 'http://callback.com',
          callbackStages: 'factom',
          automaticSigning: true,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackStages must be an array.'));
      }
    });
    it('should return error message when external ids is not array', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: '1',
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          signerChainId: '12345',
          callbackUrl: 'http://callback.com',
          automaticSigning: true,
        };

        await EntryUtil.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('externalIds must be an array.'));
      }
    });
    it('should create an signed entry successfully', async () => {
      const data = {
        chainId: '123456',
        content: '123',
        signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
        signerChainId: '12345',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
        apiCall: apiCall,
        automaticSigning: true,
      };

      const resp = {
        status: 200,
        data: {
          entry_hash: '123456',
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.create(data);
      expect(response).toEqual({ entry_hash: '123456' });
    });
  });
  describe('Get Entries', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when chain id is missing', async () => {
      try {
        await EntryUtil.get();
      } catch (error) {
        expect(error).toEqual(new Error('chainId is required.'));
      }
    });
    it('should return error message when limit is not an integer', async () => {
      try {
        const data = {
          chainId: '123456',
          limit: '15',
        };
        await EntryUtil.get(data);
      } catch (error) {
        expect(error).toEqual(new Error('limit must be an integer.'));
      }
    });
    it('should return error message when offset is not an integer', async () => {
      try {
        const data = {
          chainId: '123456',
          limit: 15,
          offset: '1',
        };
        await EntryUtil.get(data);
      } catch (error) {
        expect(error).toEqual(new Error('offset must be an integer.'));
      }
    });
    it('should return error message when stages is not array', async () => {
      try {
        await EntryUtil.get({ chainId: '123456', stages: '123' });
      } catch (error) {
        expect(error).toEqual(new Error('stages must be an array.'));
      }
    });
    it('should return entries info successfully', async () => {
      const data = {
        chainId: '123456',
        limit: 1,
        offset: 1,
        apiCall: apiCall,
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.get(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries?limit=1&offset=1', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('First Entry', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when chain id is missing', async () => {
      try {
        await EntryUtil.getFirst();
      } catch (error) {
        expect(error).toEqual(new Error('chainId is required.'));
      }
    });
    it('should return entries info successfully', async () => {
      const data = {
        chainId: '123456',
        apiCall: apiCall,
        signatureValidation: false,
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.getFirst(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/first', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
    it('should return entries info successfully with signature validation is a function', async () => {
      const data = {
        chainId: '123456',
        apiCall: apiCall,
        signatureValidation: () => 'valid_signature',
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.getFirst(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/first', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.status).toMatch('valid_signature');
    });
  });
  describe('Last Entry', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when chain id is missing', async () => {
      try {
        await EntryUtil.getLast();
      } catch (error) {
        expect(error).toEqual(new Error('chainId is required.'));
      }
    });
    it('should return entries info successfully', async () => {
      const data = {
        chainId: '123456',
        apiCall: apiCall,
        signatureValidation: false,
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.getLast(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/last', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
    it('should return entries info successfully with signature validation is a function', async () => {
      const data = {
        chainId: '123456',
        apiCall: apiCall,
        signatureValidation: () => 'valid_signature',
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.getLast(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/last', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.status).toMatch('valid_signature');
    });
  });
  describe('Search Entries', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when chain id is missing', async () => {
      try {
        await EntryUtil.search();
      } catch (error) {
        expect(error).toEqual(new Error('chainId is required.'));
      }
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await EntryUtil.search({ chainId: '123456' });
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 externalId is required.'));
      }
    });
    it('should return error message when limit is not an integer', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          limit: '1',
          offset: 1,
        };

        await EntryUtil.search(data);
      } catch (error) {
        expect(error).toEqual(new Error('limit must be an integer.'));
      }
    });
    it('should return error message when offset is not an integer', async () => {
      try {
        const data = {
          chainId: '123456',
          externalIds: ['1'],
          limit: 1,
          offset: '1',
        };

        await EntryUtil.search(data);
      } catch (error) {
        expect(error).toEqual(new Error('offset must be an integer.'));
      }
    });
    it('should return entries info successfully', async () => {
      const data = {
        chainId: '123456',
        externalIds: ['1'],
        apiCall: apiCall,
      };

      const dataPostAPI = {
        external_ids: [
          Buffer.from('1').toString('base64'),
        ],
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await EntryUtil.search(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/search', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
});
