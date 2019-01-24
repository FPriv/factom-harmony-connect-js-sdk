/* eslint-env jest */
import axios from 'axios';
import Identity from '../lib/resources/identity';

jest.mock('axios');
describe('Identity Test', () => {
  describe('Create an Identity Key Pair', () => {
    let identity;
    beforeAll(() => {
      identity = new Identity({
        baseURL: 'https://apicast.io',
        accessToken: {
          app_id: '123456',
          app_key: '123456789',
        },
      });
    });
    it('should return array of 3 private and public keys pair', () => {
      identity.createIdentityKeyPair();
    });
  });
  describe('Create an Identity', () => {
    let identity;
    beforeAll(() => {
      identity = new Identity({
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
    it('should return error message when keys have at least 1 item(s) is invalid.', async () => {
      const errors = [
        {
          key: '123',
          error: 'key is invalid',
        },
        {
          key: '123',
          error: 'key is invalid',
        },
      ];

      try {
        await identity.createAnIdentity(['123'], ['123', '123', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9']);
      } catch (error) {
        expect(error).toEqual(new Error(errors));
      }
    });
    it('should return error message when keys have at least 1 item(s) is duplicated.', async () => {
      try {
        await identity.createAnIdentity(['123'], ['idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9']);
      } catch (error) {
        expect(error).toEqual(new Error('keys item is duplicated.'));
      }
    });
    it('should return error message when callback url is missing URL scheme.', async () => {
      try {
        await await identity.createAnIdentity(['1'], ['idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idpub2FEZg6PwVuDXfsxEMinnqVfgjuNS2GzMSQwJgTdmUFQaoYpTnv', 'idpub1tkTRwxonwCfsvTkk5enWzbZgQSRpWDYtdzPUnq83AgQtecSgc'], 'callback.com', ['factom', 'replicated']);
      } catch (error) {
        expect(error).toEqual(new Error('invalid url: missing URL scheme.'));
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
        callback_url: 'http://callback.com',
        keys: [
          'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          'idpub2FEZg6PwVuDXfsxEMinnqVfgjuNS2GzMSQwJgTdmUFQaoYpTnv',
          'idpub1tkTRwxonwCfsvTkk5enWzbZgQSRpWDYtdzPUnq83AgQtecSgc',
        ],
        name: [
          Buffer.from('1').toString('base64'),
        ],
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await identity.createAnIdentity(['1'], ['idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idpub2FEZg6PwVuDXfsxEMinnqVfgjuNS2GzMSQwJgTdmUFQaoYpTnv', 'idpub1tkTRwxonwCfsvTkk5enWzbZgQSRpWDYtdzPUnq83AgQtecSgc'], 'http://callback.com', ['factom', 'replicated']);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities', { data: data, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual(resp.data);
    });
  });
  describe('Get an Identity', () => {
    let identity;
    beforeAll(() => {
      identity = new Identity({
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
      identity = new Identity({
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
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities/123456/keys?limit=15', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual(resp.data);
    });
  });
  describe('Create an Identity Key Replacement', () => {
    let identity;
    beforeAll(() => {
      identity = new Identity({
        baseURL: 'https://apicast.io',
        accessToken: {
          app_id: '123456',
          app_key: '123456789',
        },
      });
    });
    it('should return error message when chain id is missing', async () => {
      try {
        await identity.createAnIdentityKeyReplacement();
      } catch (error) {
        expect(error).toEqual(new Error('chain id is required.'));
      }
    });
    it('should return error message when old public key is missing', async () => {
      try {
        await identity.createAnIdentityKeyReplacement('123456');
      } catch (error) {
        expect(error).toEqual(new Error('old public key is required.'));
      }
    });
    it('should return error message when new public key is missing', async () => {
      try {
        await identity.createAnIdentityKeyReplacement('123456', 'idpub2');
      } catch (error) {
        expect(error).toEqual(new Error('new public key is required.'));
      }
    });
    it('should return error message when private key is missing', async () => {
      try {
        await identity.createAnIdentityKeyReplacement('123456', 'idpub2', 'idpub2');
      } catch (error) {
        expect(error).toEqual(new Error('private key is required.'));
      }
    });
    it('should return error message when old public key bytes length is not equal 41', async () => {
      try {
        await identity.createAnIdentityKeyReplacement('123456', 'idpub2', 'idpub2', 'idsec2');
      } catch (error) {
        expect(error).toEqual(new Error('old public key is invalid.'));
      }
    });
    it('should return error message when old public key is invalid', async () => {
      try {
        await identity.createAnIdentityKeyReplacement('123456', 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcx12', 'idpub2', 'idsec2');
      } catch (error) {
        expect(error).toEqual(new Error('old public key is invalid.'));
      }
    });
    it('should return error message when new public key bytes length is not equal 41', async () => {
      try {
        await identity.createAnIdentityKeyReplacement('123456', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idpub2', 'idsec2');
      } catch (error) {
        expect(error).toEqual(new Error('new public key is invalid.'));
      }
    });
    it('should return error message when new public key is invalid', async () => {
      try {
        await identity.createAnIdentityKeyReplacement('123456', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zH12', 'idsec2');
      } catch (error) {
        expect(error).toEqual(new Error('new public key is invalid.'));
      }
    });
    it('should return error message when private key bytes length is not equal 41', async () => {
      try {
        await identity.createAnIdentityKeyReplacement('123456', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idsec2');
      } catch (error) {
        expect(error).toEqual(new Error('private key is invalid.'));
      }
    });
    it('should return error message when private key is invalid', async () => {
      try {
        await identity.createAnIdentityKeyReplacement('123456', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9', 'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHo12');
      } catch (error) {
        expect(error).toEqual(new Error('private key is invalid.'));
      }
    });
    it('should return error message when callback url is missing URL scheme.', async () => {
      const chainId = '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7';
      const oldKey = 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9';
      const newKey = 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7';
      const privateKey = 'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHoy6';

      try {
        await identity.createAnIdentityKeyReplacement(chainId, oldKey, newKey, privateKey, 'callback.com', ['factom', 'replicated']);
      } catch (error) {
        expect(error).toEqual(new Error('invalid url: missing URL scheme.'));
      }
    });
    it('should create an Identity Key Replacement with callback url successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          entry_hash: '20a1a2f74579128bc2c631ee608d51345df4d75d84c54c9aaf74f30dfef6d951',
          stage: 'replicated',
        },
      };

      const chainId = '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7';
      const oldKey = 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9';
      const newKey = 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7';
      const privateKey = 'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHoy6';
      const data = {
        old_key: oldKey,
        new_key: newKey,
        signature: 'Lob+cdrltvw0MvR17e9F0EnK4bXLaCFvDf4yUESPRhznp9lug9F77bZJR2K3UoBunJoE4CI7i39aXIlEZQN9DQ==',
        signer_key: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
        callback_stages: [
          'factom',
          'replicated',
        ],
        callback_url: 'http://callback.com',
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await identity.createAnIdentityKeyReplacement(chainId, oldKey, newKey, privateKey, 'http://callback.com', ['factom', 'replicated']);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities/171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7/keys', { data: data, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual(resp.data);
    });
  });
});
