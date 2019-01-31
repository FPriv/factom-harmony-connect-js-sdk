/* eslint-env jest */
import axios from 'axios';
import Chains from '../lib/resources/chains';

jest.mock('axios');
describe('CHAINS Test', () => {
  describe('Get Chain Info', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when chain id is missing', async () => {
      try {
        await chains.getChainInfo();
      } catch (error) {
        expect(error).toEqual(new Error('chain id is required.'));
      }
    });
    it('should return a chain object.', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.getChainInfo({ chainId: '123456', signatureValidation: false });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Create a Chain', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await chains.createAChain();
      } catch (error) {
        expect(error).toEqual(new Error('external ids is a required array.'));
      }
    });
    it('should return error message when content is missing', async () => {
      try {
        const data = {
          externalIds: ['1'],
        };

        await chains.createAChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('content is required.'));
      }
    });
    it('should return error message when callback url is invalid', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          callbackUrl: 'callback.com',
        };

        await chains.createAChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('invalid url: missing URL scheme.'));
      }
    });
    it('should return error message when callback stages is not array', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          callbackUrl: 'http://callback.com',
          callbackStages: '123',
        };

        await chains.createAChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('callback stages must be in array format.'));
      }
    });
    it('should create a chain successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };

      const data = {
        externalIds: ['1'],
        content: '123',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
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
      const response = await chains.createAChain(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual(resp.data);
    });
  });
  describe('Create a Signed Chain', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when content is missing', async () => {
      try {
        await chains.createASignedChain();
      } catch (error) {
        expect(error).toEqual(new Error('content is required.'));
      }
    });
    it('should return error message when private key is missing', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
        };

        await chains.createASignedChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('private key is required.'));
      }
    });
    it('should return error message when private key is invalid', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec',
        };

        await chains.createASignedChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('private key is invalid.'));
      }
    });
    it('should return error message when signer chain id is missing', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
        };

        await chains.createASignedChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('signer chain id is required.'));
      }
    });
    it('should return error message when callback url is invalid', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          signerChainId: '12345',
          callbackUrl: 'callback.com',
        };

        await chains.createASignedChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('invalid url: missing URL scheme.'));
      }
    });
    it('should return error message when callback stages is not array', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          signerChainId: '12345',
          callbackUrl: 'http://callback.com',
          callbackStages: '123',
        };

        await chains.createASignedChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('callback stages must be in array format.'));
      }
    });
    it('should return error message when external ids is not array', async () => {
      try {
        const data = {
          externalIds: '1',
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          signerChainId: '12345',
          callbackUrl: 'http://callback.com',
          callbackStages: ['factom'],
        };

        await chains.createASignedChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('external ids is a required array.'));
      }
    });
    it('should create a chain successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };

      const data = {
        content: '123',
        signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
        signerChainId: '12345',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.createASignedChain(data);
      expect(response).toEqual(resp.data);
    });
  });
  describe('Get All Chains', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when limit is not number', async () => {
      try {
        const data = {
          limit: 'a',
          offset: 1,
          stages: '123',
        };

        await chains.getAllChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('limit must be number.'));
      }
    });
    it('should return error message when offset is not number', async () => {
      try {
        const data = {
          limit: 15,
          offset: '1',
          stages: '123',
        };

        await chains.getAllChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('offset must be number.'));
      }
    });
    it('should return error message when stages is not array', async () => {
      try {
        const data = {
          limit: 10,
          offset: 1,
          stages: '123',
        };

        await chains.getAllChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('stages must be in array format.'));
      }
    });
    it('should return all chain object.', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.getAllChains();
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Search Chains', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await chains.searchChains();
      } catch (error) {
        expect(error).toEqual(new Error('external ids is a required array.'));
      }
    });
    it('should return error message when limit is not number', async () => {
      try {
        const data = {
          externalIds: ['123'],
          limit: '1',
        };

        await chains.searchChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('limit must be number.'));
      }
    });
    it('should return error message when offset is not number', async () => {
      try {
        const data = {
          externalIds: ['123'],
          limit: 15,
          offset: '1',
        };

        await chains.searchChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('offset must be number.'));
      }
    });
    it('should return all chain object.', async () => {
      const data = {
        externalIds: ['123'],
      };

      const dataPostAPI = {
        external_ids: [
          Buffer.from('123').toString('base64'),
        ],
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.searchChains(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/search', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
});
