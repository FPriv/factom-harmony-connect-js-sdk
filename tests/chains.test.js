/* eslint-env jest */
import axios from 'axios';
import Chains from '../lib/resources/Chains';

jest.mock('axios');
describe('CHAINS Test', () => {
  describe('Get Chain Info', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when chain id is missing', async () => {
      try {
        await chains.getChainInfo();
      } catch (error) {
        expect(error).toEqual(new Error('chainId is required.'));
      }
    });
    it('should return a chain object without validate signature.', async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            stage: 'factom',
            external_ids: [
              'YXNkZmRhcw==',
              'YXNmZHM=',
              'ZmFzZGZzZmRm',
              'c3N4',
            ],
            entries: {
              href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
            },
            chain_id: '123456',
          },
        },
      };

      const dataCompare = {
        chain_id: '123456',
        entries: {
          href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
        },
        external_ids: ['asdfdas', 'asfds', 'fasdfsfdf', 'ssx'],
        stage: 'factom',
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.getChainInfo({ chainId: '123456', signatureValidation: false });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.data).toEqual(dataCompare);
    });
    it('should return a chain object with validate signature is a function.', async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            stage: 'factom',
            external_ids: [
              'YXNkZmRhcw==',
              'YXNmZHM=',
              'ZmFzZGZzZmRm',
              'c3N4',
            ],
            entries: {
              href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
            },
            chain_id: '123456',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.getChainInfo({ chainId: '123456789', signatureValidation: () => 'not_signed/invalid_chain_format' });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456789', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.status).toMatch('not_signed/invalid_chain_format');
    });
  });
  describe('Validating Signature', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return a chain object with invalid chain format status when length of external ids less than 6.', async () => {
      const data = {
        data: {
          stage: 'factom',
          external_ids: [
            'YXNkZmRhcw==',
            'YXNmZHM=',
            'ZmFzZGZzZmRm',
          ],
          entries: {
            href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
          },
          chain_id: '123456',
        },
      };
      const response = await chains.validateSignature({ chain: data });
      expect(response).toMatch('not_signed/invalid_chain_format');
    });
    it('should return a chain object with invalid chain format status when first external ids is not equal SignedChain.', async () => {
      const data = {
        data: {
          stage: 'factom',
          external_ids: [
            'YXNkZmRhcw==',
            'YXNmZHM=',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
          ],
          entries: {
            href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
          },
          chain_id: '123456',
        },
      };
      const response = await chains.validateSignature({ chain: data });
      expect(response).toMatch('not_signed/invalid_chain_format');
    });
    it('should return a chain object with invalid chain format status when second external ids is not equal 0x01.', async () => {
      const data = {
        data: {
          stage: 'factom',
          external_ids: [
            'SignedChain',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
          ],
          entries: {
            href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
          },
          chain_id: '123456',
        },
      };
      const response = await chains.validateSignature({ chain: data });
      expect(response).toMatch('not_signed/invalid_chain_format');
    });
    it('should return a chain object with inactive key status.', async () => {
      const resp = {
        status: 200,
        data: {
          data: [{
            key: 'idpub',
          }],
        },
      };
      const data = {
        data: {
          stage: 'factom',
          external_ids: [
            'SignedChain',
            '0x01',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
          ],
          entries: {
            href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
          },
          chain_id: '123456',
          dblock: {
            height: 10000,
          },
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.validateSignature({ chain: data });
      expect(response).toMatch('inactive_key');
    });
  });
  describe('Create a Chain without siging', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
        automaticSigning: false,
      });
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await chains.createChain();
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 externalId is required.'));
      }
    });
    it('should return error message when external ids is not array', async () => {
      try {
        const data = {
          externalIds: '1',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('externalIds must be an array.'));
      }
    });
    it('should return error message when signer chain id is missing', async () => {
      try {
        const data = {
          externalIds: ['1'],
          signerPrivateKey: 'idsec',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerChainId is required when passing a signerPrivateKey.'));
      }
    });
    it('should return error message when signer private key is invalid', async () => {
      try {
        const data = {
          externalIds: ['1'],
          signerPrivateKey: 'idsec',
          signerChainId: '123456',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is invalid.'));
      }
    });
    it('should return error message when signer private key is missing', async () => {
      try {
        const data = {
          externalIds: ['1'],
          signerChainId: '123456',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is required when passing a signerChainId.'));
      }
    });
    it('should return error message when content is missing', async () => {
      try {
        const data = {
          externalIds: ['1'],
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('content is required.'));
      }
    });
    it('should return error message when callback url is invalid', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          callbackUrl: 'callback.com',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackUrl is an invalid url format.'));
      }
    });
    it('should return error message when callback stages is not array', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          callbackUrl: 'http://callback.com',
          callbackStages: '123',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackStages must be an array.'));
      }
    });
    it('should create a chain successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };

      const data = {
        externalIds: ['1'],
        content: '123',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
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
      const response = await chains.createChain(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual(resp.data);
    });
  });
  describe('Create a Chain with signing', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
        automaticSigning: true,
      });
    });
    it('should return error message when private key is missing', async () => {
      try {
        await chains.createChain();
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is required.'));
      }
    });
    it('should return error message when private key is invalid', async () => {
      try {
        const data = {
          signerPrivateKey: 'idsec',
        };
        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is invalid.'));
      }
    });
    it('should return error message when signer chain id is missing', async () => {
      try {
        const data = {
          signerPrivateKey: 'idsec1rxvt6BX7KJjaqUhVMQNBGzaa1H4oy43njXSW171HftLnTyvhZ',
        };
        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerChainId is required.'));
      }
    });
    it('should return error message when content is missing', async () => {
      try {
        const data = {
          signerPrivateKey: 'idsec1rxvt6BX7KJjaqUhVMQNBGzaa1H4oy43njXSW171HftLnTyvhZ',
          signerChainId: '123',
        };
        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('content is required.'));
      }
    });
    it('should return error message when private key is missing', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is required.'));
      }
    });
    it('should return error message when private key is invalid', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerPrivateKey is invalid.'));
      }
    });
    it('should return error message when signer chain id is missing', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('signerChainId is required.'));
      }
    });
    it('should return error message when callback url is invalid', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          signerChainId: '12345',
          callbackUrl: 'callback.com',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackUrl is an invalid url format.'));
      }
    });
    it('should return error message when callback stages is not array', async () => {
      try {
        const data = {
          externalIds: ['1'],
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          signerChainId: '12345',
          callbackUrl: 'http://callback.com',
          callbackStages: '123',
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackStages must be an array.'));
      }
    });
    it('should return error message when external ids is not array', async () => {
      try {
        const data = {
          externalIds: '1',
          content: '123',
          signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
          signerChainId: '12345',
          callbackUrl: 'http://callback.com',
          callbackStages: ['factom'],
        };

        await chains.createChain(data);
      } catch (error) {
        expect(error).toEqual(new Error('externalIds must be an array.'));
      }
    });
    it('should create a chain successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };

      const data = {
        content: '123',
        signerPrivateKey: 'idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB',
        signerChainId: '12345',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.createChain(data);
      expect(response).toEqual(resp.data);
    });
  });
  describe('Get All Chains', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when limit is not an integer', async () => {
      try {
        const data = {
          limit: 'a',
          offset: 1,
          stages: '123',
        };

        await chains.getAllChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('limit must be an integer.'));
      }
    });
    it('should return error message when offset is not an integer', async () => {
      try {
        const data = {
          limit: 15,
          offset: '1',
          stages: '123',
        };

        await chains.getAllChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('offset must be an integer.'));
      }
    });
    it('should return error message when stages is not array', async () => {
      try {
        const data = {
          limit: 10,
          offset: 1,
          stages: '123',
        };

        await chains.getAllChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('stages must be an array.'));
      }
    });
    it('should return all chain object.', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.getAllChains();
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Search Chains', () => {
    let chains;
    beforeAll(() => {
      chains = new Chains({
        baseURL: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await chains.searchChains();
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 externalId is required.'));
      }
    });
    it('should return error message when limit is not an integer', async () => {
      try {
        const data = {
          externalIds: ['123'],
          limit: '1',
        };

        await chains.searchChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('limit must be an integer.'));
      }
    });
    it('should return error message when offset is not an integer', async () => {
      try {
        const data = {
          externalIds: ['123'],
          limit: 15,
          offset: '1',
        };

        await chains.searchChains(data);
      } catch (error) {
        expect(error).toEqual(new Error('offset must be an integer.'));
      }
    });
    it('should return all chain object.', async () => {
      const data = {
        externalIds: ['123'],
      };

      const dataPostAPI = {
        external_ids: [
          Buffer.from('123').toString('base64'),
        ],
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chains.searchChains(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/search', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
});
