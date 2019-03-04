/* eslint-env jest */
import axios from 'axios';
import ApiCall from '../lib/api';
import ChainEntriesUtil from '../lib/utils/chain/chainEntriesUtil';

jest.mock('axios');
describe('CHAIN ENTRIES UTIL Test', () => {
  describe('Create An Entry without signing', () => {
    let entries;
    let apiCall;
    beforeAll(async () => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
      entries = new ChainEntriesUtil({
        chainId: '123456',
        automaticSigning: false,
        apiCall: apiCall,
      });
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await entries.create();
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 externalId is required.'));
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
      const response = await entries.create(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ entry_hash: '123456' });
    });
  });
  describe('Get Entries', () => {
    let entries;
    let apiCall;
    beforeAll(async () => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
      entries = new ChainEntriesUtil({
        chainId: '123456',
        automaticSigning: false,
        apiCall: apiCall,
      });
    });
    it('should return entries info successfully', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await entries.get();
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('First Entry', () => {
    let entries;
    let apiCall;
    beforeAll(async () => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
      entries = new ChainEntriesUtil({
        chainId: '123456',
        automaticSigning: false,
        apiCall: apiCall,
      });
    });
    it('should return first entry successfully', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await entries.getFirst({ signatureValidation: false });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/first', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Last Entry', () => {
    let entries;
    let apiCall;
    beforeAll(async () => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
      entries = new ChainEntriesUtil({
        chainId: '123456',
        automaticSigning: false,
        apiCall: apiCall,
      });
    });
    it('should return last entry successfully', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await entries.getLast({ signatureValidation: false });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/last', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Search Entries', () => {
    let entries;
    let apiCall;
    beforeAll(async () => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
      entries = new ChainEntriesUtil({
        chainId: '123456',
        automaticSigning: false,
        apiCall: apiCall,
      });
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await entries.search();
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 externalId is required.'));
      }
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
      const response = await entries.search(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/search?limit=1', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
});
