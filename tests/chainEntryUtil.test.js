/* eslint-env jest */
import axios from 'axios';
import ApiCall from '../lib/api';
import ChainEntryUtil from '../lib/utils/chain/chainEntryUtil';

jest.mock('axios');
describe('CHAIN ENTRY UTIL Test', () => {
  describe('Entry Info', () => {
    let entry;
    let apiCall;
    beforeAll(async () => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
      entry = new ChainEntryUtil({
        chainId: '123456',
        automaticSigning: false,
        apiCall: apiCall,
      });
    });
    it('should return error message when entry hash is missing', async () => {
      try {
        await entry.get();
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
      const response = await entry.get({ entryHash: 'sha256', signatureValidation: false });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/sha256', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
});
