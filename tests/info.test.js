/* eslint-env jest */
import axios from 'axios';
import Info from '../lib/resources/Info';

jest.mock('axios');
describe('INFO Test', () => {
  describe('Get Info', () => {
    let info;
    beforeAll(() => {
      info = new Info({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
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
      const response = await info.get();
      expect(axios).toHaveBeenCalledWith('https://apicast.io', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ api_version: 'v1' });
    });
  });
});
