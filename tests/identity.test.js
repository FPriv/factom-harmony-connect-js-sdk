/* eslint-env jest */
import axios from 'axios';
import IDENTITY from '../lib/resources/identity';

jest.mock('axios');
describe('IDENTITY Test', () => {
  describe('Create an Identity Key Pair', () => {
    let identity;
    beforeAll(() => {
      identity = new IDENTITY({
        baseURL: 'https://apicast.io',
        accessToken: {
          app_id: '123456',
          app_key: '123456789',
        },
      });
    });
    it('should return array has 3 objects with private and public keys', () => {
      identity.createIdentityKeyPair();
    });
  });
  describe('Create an Identity', () => {
    let identity;
    beforeAll(() => {
      identity = new IDENTITY({
        baseURL: 'https://apicast.io',
        accessToken: {
          app_id: '123456',
          app_key: '123456789',
        },
      });
    });
    it('should return error message when name is missing', () => {
      try {
        identity.createAnIdentity();
      } catch (error) {
        expect(error).toEqual(new Error('name is required.'));
      }
    });
    it('should return error message when keys is missing', () => {
      try {
        identity.createAnIdentity(['123']);
      } catch (error) {
        expect(error).toEqual(new Error('keys is required.'));
      }
    });
    it('should create an Identity successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          entry_hash: '20a1a2f74579128bc2c631ee608d51345df4d75d84c54c9aaf74f30dfef6d951',
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          stage: 'replicated',
        },
      };

      const data = {
        callback_stages: [
          'factom',
          'replicated',
        ],
        callback_url: '',
        keys: [
          '1',
        ],
        name: [
          Buffer.from('1').toString('base64'),
        ],
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await identity.createAnIdentity(['1'], ['1'], '', ['factom', 'replicated']);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities', { data: data, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual(resp.data);
    });
  });
});
