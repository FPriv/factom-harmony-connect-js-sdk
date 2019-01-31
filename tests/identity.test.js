/* eslint-env jest */
import axios from 'axios';
import Identity from '../lib/resources/identity';

jest.mock('axios');
describe('IDENTITY Test', () => {
  describe('Create an Identity Key Pair', () => {
    let identity;
    beforeAll(() => {
      identity = new Identity({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return array of 3 private and public key pairs', () => {
      identity.createIdentityKeyPair();
    });
  });
  describe('Create an Identity', () => {
    let identity;
    beforeAll(() => {
      identity = new Identity({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when name is missing', async () => {
      try {
        await identity.createAnIdentity();
      } catch (error) {
        expect(error).toEqual(new Error('name is a required array.'));
      }
    });
    it('should return error message when keys is missing', async () => {
      try {
        const data = { name: ['123'] };
        await identity.createAnIdentity(data);
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 key is required.'));
      }
    });
    it('should return error message when total bytes of name and key are lager than 10240 bytes', async () => {
      try {
        const data = {
          name: [
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
            'The primary benefit of using Identities within your application the ability to verify that a certain user/device/organization/etc. actually signed and published a certain message that you see in your chain. Let is go through an example of how this creation of a signed entry works for an identity we made already',
          ],
          keys: [
            'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          ],
        };
        await identity.createAnIdentity(data);
      } catch (error) {
        expect(error).toEqual(new Error('data overflow: use less/shorter names or less keys.'));
      }
    });
    it('should return error message when keys have at least 1 invalid item.', async () => {
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
        const data = {
          name: ['123'],
          keys: [
            '123',
            '123',
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          ],
        };
        await identity.createAnIdentity(data);
      } catch (error) {
        expect(error).toEqual(new Error(errors));
      }
    });
    it('should return error message when keys have at least 1 duplicated item.', async () => {
      try {
        const data = {
          name: ['123'],
          keys: [
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          ],
        };
        await identity.createAnIdentity(data);
      } catch (error) {
        expect(error).toEqual(new Error('keys item is duplicated.'));
      }
    });
    it('should return error message when callback url is missing URL scheme.', async () => {
      try {
        const data = {
          name: ['1'],
          keys: [
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
            'idpub2FEZg6PwVuDXfsxEMinnqVfgjuNS2GzMSQwJgTdmUFQaoYpTnv',
            'idpub1tkTRwxonwCfsvTkk5enWzbZgQSRpWDYtdzPUnq83AgQtecSgc',
          ],
          callbackUrl: 'callback.com',
          callbackStages: ['factom', 'replicated'],
        };
        await await identity.createAnIdentity(data);
      } catch (error) {
        expect(error).toEqual(new Error('invalid url: missing URL scheme.'));
      }
    });
    it('should return error message when callback stages is not array.', async () => {
      try {
        const data = {
          name: ['1'],
          keys: [
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
            'idpub2FEZg6PwVuDXfsxEMinnqVfgjuNS2GzMSQwJgTdmUFQaoYpTnv',
            'idpub1tkTRwxonwCfsvTkk5enWzbZgQSRpWDYtdzPUnq83AgQtecSgc',
          ],
          callbackUrl: 'http://callback.com',
          callbackStages: 'factom',
        };
        await await identity.createAnIdentity(data);
      } catch (error) {
        expect(error).toEqual(new Error('callback stages must be in array format.'));
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
        name: ['1'],
        keys: [
          'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          'idpub2FEZg6PwVuDXfsxEMinnqVfgjuNS2GzMSQwJgTdmUFQaoYpTnv',
          'idpub1tkTRwxonwCfsvTkk5enWzbZgQSRpWDYtdzPUnq83AgQtecSgc',
        ],
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
      };

      const dataPostAPI = {
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
      const response = await identity.createAnIdentity(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual(resp.data);
    });
  });
  describe('Get an Identity', () => {
    let identity;
    beforeAll(() => {
      identity = new Identity({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when identity chain id is missing', async () => {
      try {
        await identity.getAnIdentity();
      } catch (error) {
        expect(error).toEqual(new Error('identity chain id is required.'));
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
      const response = await identity.getAnIdentity({ identityChainId: '123456' });
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
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when identity chain id is missing', async () => {
      try {
        await identity.getAllIdentityKeys();
      } catch (error) {
        expect(error).toEqual(new Error('identity chain id is required.'));
      }
    });
    it('should return error message when active at height is not number', async () => {
      try {
        const data = {
          identityChainId: '123456',
          activeAtHeight: '1',
        };
        await identity.getAllIdentityKeys(data);
      } catch (error) {
        expect(error).toEqual(new Error('active at height must be number.'));
      }
    });
    it('should return error message when limit is not number', async () => {
      try {
        const data = {
          identityChainId: '123456',
          activeAtHeight: 1,
          limit: '1',
        };
        await identity.getAllIdentityKeys(data);
      } catch (error) {
        expect(error).toEqual(new Error('limit must be number.'));
      }
    });
    it('should return error message when offset is not number', async () => {
      try {
        const data = {
          identityChainId: '123456',
          activeAtHeight: 1,
          limit: 1,
          offset: '1',
        };
        await identity.getAllIdentityKeys(data);
      } catch (error) {
        expect(error).toEqual(new Error('offset must be number.'));
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
      const data = {
        identityChainId: '123456',
      };

      const response = await identity.getAllIdentityKeys(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities/123456/keys', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual(resp.data);
    });
  });
  describe('Create an Identity Key Replacement', () => {
    let identity;
    beforeAll(() => {
      identity = new Identity({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when identity chain id is missing', async () => {
      try {
        await identity.createAnIdentityKeyReplacement();
      } catch (error) {
        expect(error).toEqual(new Error('identity chain id is required.'));
      }
    });
    it('should return error message when old public key is missing', async () => {
      try {
        const data = {
          identityChainId: '123456',
        };
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('old public key is required.'));
      }
    });
    it('should return error message when new public key is missing', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldSignerPublicKey: 'idpub2',
        };
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('new public key is required.'));
      }
    });
    it('should return error message when private key is missing', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldSignerPublicKey: 'idpub2',
          newSignerPublicKey: 'idpub2',
        };
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('private key is required.'));
      }
    });
    it('should return error message when old public key bytes length is not equal 41', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldSignerPublicKey: 'idpub2',
          newSignerPublicKey: 'idpub2',
          signerPrivateKey: 'idsec2',
        };
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('old public key is invalid.'));
      }
    });
    it('should return error message when old public key is invalid', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldSignerPublicKey: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcx12',
          newSignerPublicKey: 'idpub2',
          signerPrivateKey: 'idsec2',
        };
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('old public key is invalid.'));
      }
    });
    it('should return error message when new public key bytes length is not equal 41', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldSignerPublicKey: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          newSignerPublicKey: 'idpub2',
          signerPrivateKey: 'idsec2',
        };
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('new public key is invalid.'));
      }
    });
    it('should return error message when new public key is invalid', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldSignerPublicKey: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          newSignerPublicKey: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zH12',
          signerPrivateKey: 'idsec2',
        };
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('new public key is invalid.'));
      }
    });
    it('should return error message when private key bytes length is not equal 41', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldSignerPublicKey: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          newSignerPublicKey: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          signerPrivateKey: 'idsec2',
        };
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('private key is invalid.'));
      }
    });
    it('should return error message when private key is invalid', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldSignerPublicKey: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          newSignerPublicKey: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          signerPrivateKey: 'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHo12',
        };
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('private key is invalid.'));
      }
    });
    it('should return error message when callback url is missing URL scheme.', async () => {
      const data = {
        identityChainId: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        oldSignerPublicKey: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9',
        newSignerPublicKey: 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
        signerPrivateKey: 'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHoy6',
        callbackUrl: 'callback.com',
        callbackStages: ['factom', 'replicated'],
      };
      try {
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('invalid url: missing URL scheme.'));
      }
    });
    it('should return error message when callback stages is not array.', async () => {
      const data = {
        identityChainId: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        oldSignerPublicKey: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9',
        newSignerPublicKey: 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
        signerPrivateKey: 'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHoy6',
        callbackUrl: 'http://callback.com',
        callbackStages: 'factom',
      };
      try {
        await identity.createAnIdentityKeyReplacement(data);
      } catch (error) {
        expect(error).toEqual(new Error('callback stages must be in array format.'));
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

      const data = {
        identityChainId: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        oldSignerPublicKey: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9',
        newSignerPublicKey: 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
        signerPrivateKey: 'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHoy6',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
      };

      const dataPostAPI = {
        old_key: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9',
        new_key: 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
        signature: 'Lob+cdrltvw0MvR17e9F0EnK4bXLaCFvDf4yUESPRhznp9lug9F77bZJR2K3UoBunJoE4CI7i39aXIlEZQN9DQ==',
        signer_key: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
        callback_stages: [
          'factom',
          'replicated',
        ],
        callback_url: 'http://callback.com',
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await identity.createAnIdentityKeyReplacement(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities/171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7/keys', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual(resp.data);
    });
  });
});
