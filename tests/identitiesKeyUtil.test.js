/* eslint-env jest */
import axios from 'axios';
import Keys from '../lib/utils/identities/identitiesKeyUtil';

jest.mock('axios');
describe('IDENTITIES KEY UTIL Test', () => {
  describe('Get Identity Key', () => {
    let keys;
    beforeAll(() => {
      keys = new Keys({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when identity chain id is missing', async () => {
      try {
        await keys.get();
      } catch (error) {
        expect(error).toEqual(new Error('identityChainId is required.'));
      }
    });
    it('should return error message when key is missing', async () => {
      try {
        await keys.get({ identityChainId: '123456' });
      } catch (error) {
        expect(error).toEqual(new Error('key is required.'));
      }
    });
    it('should return error message when key is invalid', async () => {
      try {
        await keys.get({ identityChainId: '123456', key: 'idpub' });
      } catch (error) {
        expect(error).toEqual(new Error('key is invalid.'));
      }
    });
    it('should get Identity Key successfully', async () => {
      const resp = {
        status: 200,
        data: {
          key: 'idpub2Cktw6EgcBVMHMXmfcCyTHndcFvG7fJKyBpy3sTYcdTmdTuKya',
          activated_height: 118460,
          retired_height: null,
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const data = {
        identityChainId: '123456',
        key: 'idpub2Cktw6EgcBVMHMXmfcCyTHndcFvG7fJKyBpy3sTYcdTmdTuKya',
      };

      const response = await keys.get(data);
      expect(axios).toHaveBeenCalledWith(
        'https://apicast.io/identities/123456/keys/idpub2Cktw6EgcBVMHMXmfcCyTHndcFvG7fJKyBpy3sTYcdTmdTuKya',
        {
          data: '',
          headers: {
            'Content-Type': 'application/json',
            app_id: '123456',
            app_key: '123456789',
          },
          method: 'GET',
        },
      );
      expect(response).toEqual(resp.data);
    });
  });
  describe('Get all Identity Keys', () => {
    let keys;
    beforeAll(() => {
      keys = new Keys({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when identity chain id is missing', async () => {
      try {
        await keys.list();
      } catch (error) {
        expect(error).toEqual(new Error('identityChainId is required.'));
      }
    });
    it('should return error message when limit is not an integer', async () => {
      try {
        const data = {
          identityChainId: '123456',
          limit: '1',
        };
        await keys.list(data);
      } catch (error) {
        expect(error).toEqual(new Error('limit must be an integer.'));
      }
    });
    it('should return error message when offset is not an integer', async () => {
      try {
        const data = {
          identityChainId: '123456',
          limit: 1,
          offset: '1',
        };
        await keys.list(data);
      } catch (error) {
        expect(error).toEqual(new Error('offset must be an integer.'));
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

      const response = await keys.list(data);
      expect(axios).toHaveBeenCalledWith(
        'https://apicast.io/identities/123456/keys',
        {
          data: '',
          headers: {
            'Content-Type': 'application/json',
            app_id: '123456',
            app_key: '123456789',
          },
          method: 'GET',
        },
      );
      expect(response).toEqual(resp.data);
    });
  });
  describe('Create an Identity Key Replacement', () => {
    let keys;
    beforeAll(() => {
      keys = new Keys({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when identity chain id is missing', async () => {
      try {
        await keys.replace();
      } catch (error) {
        expect(error).toEqual(new Error('identityChainId is required.'));
      }
    });
    it('should return error message when old public key is missing', async () => {
      try {
        const data = {
          identityChainId: '123456',
        };
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('oldPublicKey is required.'));
      }
    });
    it('should return error message when new public key is missing', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldPublicKey: 'idpub2',
          newPublicKey: '',
        };
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('newPublicKey is required.'));
      }
    });
    it('should return error message when private key is missing', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldPublicKey: 'idpub2',
          newPublicKey: 'idpub2',
        };
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is required.'));
      }
    });
    it('should return error message when old public key bytes length is not equal 41', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldPublicKey: 'idpub2',
          signerPrivateKey: 'idsec2',
        };
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('oldPublicKey is an invalid public key.'));
      }
    });
    it('should return error message when old public key is invalid', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldPublicKey: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcx12',
          newPublicKey: 'idpub2',
          signerPrivateKey: 'idsec2',
        };
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('oldPublicKey is an invalid public key.'));
      }
    });
    it('should return error message when new public key bytes length is not equal 41', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldPublicKey: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          newPublicKey: 'idpub2',
          signerPrivateKey: 'idsec2',
        };
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('newPublicKey is an invalid public key.'));
      }
    });
    it('should return error message when new public key is invalid', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldPublicKey:
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          newPublicKey:
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zH12',
          signerPrivateKey: 'idsec2',
        };
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('newPublicKey is an invalid public key.'));
      }
    });
    it('should return error message when private key bytes length is not equal 41', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldPublicKey:
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          newPublicKey:
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          signerPrivateKey: 'idsec2',
        };
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is invalid.'));
      }
    });
    it('should return error message when private key is invalid', async () => {
      try {
        const data = {
          identityChainId: '123456',
          oldPublicKey:
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          newPublicKey:
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          signerPrivateKey:
            'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHo12',
        };
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is invalid.'));
      }
    });
    it('should return error message when callback url is missing URL scheme.', async () => {
      const data = {
        identityChainId:
          '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        oldPublicKey: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9',
        newPublicKey: 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
        signerPrivateKey:
          'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHoy6',
        callbackUrl: 'callback.com',
        callbackStages: ['factom', 'replicated'],
      };
      try {
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackUrl is an invalid url format.'));
      }
    });
    it('should return error message when callback stages is not array.', async () => {
      const data = {
        identityChainId:
          '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        oldPublicKey: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9',
        newPublicKey: 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
        signerPrivateKey:
          'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHoy6',
        callbackUrl: 'http://callback.com',
        callbackStages: 'factom',
      };
      try {
        await keys.replace(data);
      } catch (error) {
        expect(error).toEqual(
          new Error('callbackStages must be an array.'),
        );
      }
    });
    it('should create an Identity Key Replacement with callback url successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          entry_hash:
            '20a1a2f74579128bc2c631ee608d51345df4d75d84c54c9aaf74f30dfef6d951',
          stage: 'replicated',
        },
      };

      const data = {
        identityChainId:
          '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        oldPublicKey: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9',
        newPublicKey: 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
        signerPrivateKey:
          'idsec1Xbja4exmHFNgVSsk7VipNi4mwt6BjQFEZFCohs4Y7TzfhHoy6',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
      };

      const dataPostAPI = {
        old_key: 'idpub2SrEYac7YQd6xQJKHt7hMWTgzBLDeyPYsK9jwJyQx5bfZvcxE9',
        new_key: 'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
        signature:
          'Lob+cdrltvw0MvR17e9F0EnK4bXLaCFvDf4yUESPRhznp9lug9F77bZJR2K3UoBunJoE4CI7i39aXIlEZQN9DQ==',
        signer_key: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
        callback_stages: ['factom', 'replicated'],
        callback_url: 'http://callback.com',
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await keys.replace(data);
      expect(axios).toHaveBeenCalledWith(
        'https://apicast.io/identities/171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7/keys',
        {
          data: dataPostAPI,
          headers: {
            'Content-Type': 'application/json',
            app_id: '123456',
            app_key: '123456789',
          },
          method: 'POST',
        },
      );
      expect(response).toEqual(resp.data);
    });
  });
});
