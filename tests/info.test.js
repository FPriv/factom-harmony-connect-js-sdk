/* eslint-env jest */
import axios from 'axios';
import APICall from '../lib/api';

jest.mock('axios');
describe('Info TEST', () => {
  describe('Get Info', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new APICall({
        baseURL: 'https://apicast.io',
        accessToken: {
          app_id: '123456',
          app_key: '123456789',
        },
      });
    });
    it('should return an info object.', async () => {
      const resp = {
        status: 200,
        data: {
          api_version: 'v1',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await apiCall.send('GET');
      expect(axios).toHaveBeenCalledWith('https://apicast.io', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ api_version: 'v1' });
    });
  });
});
