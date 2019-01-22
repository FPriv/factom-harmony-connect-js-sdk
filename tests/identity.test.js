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
    it('should return error message when name is missing', async () => {
      try {
        await identity.createAnIdentity();
      } catch (error) {
        expect(error).toEqual(new Error('name is required.'));
      }
    });
    it('should return error message when keys is missing', async () => {
      try {
        await identity.createAnIdentity(['123']);
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
  describe('Get an Identity', () => {
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
    it('should return error message when chain id is missing', async () => {
      try {
        await identity.getAnIdentity();
      } catch (error) {
        expect(error).toEqual(new Error('chain id is required.'));
      }
    });
    it('should get an Identity successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          name: ['RU1QTE9ZRUU=', 'QUJDMTIz'],
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await identity.getAnIdentity('123456');
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual(resp.data);
    });
  });
  describe('Get all Identity Keys', () => {
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
    it('should return error message when chain id is missing', async () => {
      try {
        await identity.getAllIdentityKeys();
      } catch (error) {
        expect(error).toEqual(new Error('chain id is required.'));
      }
    });
    it('should get all Identity Keys successfully.', async () => {
      const resp = {
        status: 200,
        data: [
          {
            key: 'idpub2Cktw6EgcBVMHMXmfcCyTHndcFvG7fJKyBpy3sTYcdTmdTuKya',
            activated_height: 118460,
            retired_height: null,
          },
          {
            key: 'idpub2JegfdBQBnqbXGKMMD89v8N81e4DpvERHWTJp6zvWaoAVi8Jnj',
            activated_height: 118460,
            retired_height: null,
          },
        ],
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await identity.getAllIdentityKeys('123456');
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities/123456/keys', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual(resp.data);
    });
  });
});
