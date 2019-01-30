/* eslint-env jest */
import axios from 'axios';
import Chain from '../lib/resources/chain';

jest.mock('axios');
describe('CHAIN Test', () => {
  describe('constructor', () => {
    it('should return error message when chain id is missing', () => {
      try {
        // eslint-disable-next-line no-new
        new Chain();
      } catch (error) {
        expect(error).toEqual(new Error('chain id is required.'));
      }
    });
    it('should return a chain object', async () => {
      const data = {
        chainId: '123456',
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      };

      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await new Chain(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.data).toEqual({ chain_id: '123456' });
    });
  });
  describe('Entry Info', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return error message when entry hash is missing', async () => {
      try {
        await chain.entryInfo();
      } catch (error) {
        expect(error).toEqual(new Error('entry hash is required.'));
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
      const response = await chain.entryInfo({ entryHash: 'sha256' });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/sha256', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Create An Entry', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
            entries: '/v1/chains/123456/entries',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await chain.createAnEntry();
      } catch (error) {
        expect(error).toEqual(new Error('external ids is a required array.'));
      }
    });
    it('should create an entry successfully', async () => {
      const data = {
        externalIds: ['1'],
        content: '123',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
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
      const response = await chain.createAnEntry(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ entry_hash: '123456' });
    });
  });
  describe('Create An Signed Entry', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
            entries: '/v1/chains/123456/entries',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return error message when content is missing', async () => {
      try {
        await chain.createAnSignedEntry();
      } catch (error) {
        expect(error).toEqual(new Error('content is required.'));
      }
    });
    it('should create an signed entry successfully', async () => {
      const data = {
        externalIds: ['1'],
        content: '123',
        privateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
        signerChainId: '12345',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
      };

      const resp = {
        status: 200,
        data: {
          entry_hash: '123456',
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chain.createAnSignedEntry(data);
      expect(response).toEqual({ entry_hash: '123456' });
    });
  });
  describe('Get Entries', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return entries info successfully', async () => {
      const data = {
        limit: 1,
        offset: 1,
        stages: ['factom'],
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chain.getEntries(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/sha256', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('First Entry', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return first entry successfully', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chain.firstEntry();
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/first', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Last Entry', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return last entry successfully', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chain.lastEntry();
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/last', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Search Entries', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return entries successfully', async () => {
      const data = {
        externalIds: ['1'],
        limit: 1,
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };

      const dataPostAPI = {
        external_ids: [
          Buffer.from('1').toString('base64'),
        ],
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chain.searchEntries(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/search?limit=1', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
});
