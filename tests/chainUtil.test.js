/* eslint-env jest */
import axios from 'axios';
import ChainUtil from '../lib/utils/chain/chainUtil';

jest.mock('axios');
describe('CHAIN UTIL Test', () => {
  describe('constructor', () => {
    it('should return error message when chain id is missing', async () => {
      try {
        // eslint-disable-next-line no-new
        await new ChainUtil();
      } catch (error) {
        expect(error).toEqual(new Error('chainId is required.'));
      }
    });
    // it('should return a chain object without validate signature', async () => {
    //   const data = {
    //     chainId: '123456',
    //     signatureValidation: false,
    //     options: {
    //       baseUrl: 'https://apicast.io/',
    //       accessToken: {
    //         appId: '123456',
    //         appKey: '123456789',
    //       },
    //     },
    //   };

    //   const chain = await new ChainUtil(data);
    //   expect(chain.chainId).toMatch('123456');
    // });
    it('should return a chain info', async () => {
      const data = {
        chainId: '123456',
        signatureValidation: false,
        options: {
          baseUrl: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      };

      const resp = {
        status: 200,
        data: {
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
        },
      };

      const respDecoded = {
        chain_id: '123456',
        entries: {
          href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
        },
        external_ids: [
          'asdfdas',
          'asfds',
          'fasdfsfdf',
        ],
        stage: 'factom',
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const chain = await new ChainUtil(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(chain.data).toEqual(respDecoded);
    });
    it('should return a chain object with validate signature', async () => {
      const data = {
        chainId: '123456',
        options: {
          baseUrl: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      };

      const resp = {
        status: 200,
        data: {
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
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await new ChainUtil(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.status).toMatch('not_signed/invalid_chain_format');
    });
    it('should return a chain object with validate signature is a function', async () => {
      const data = {
        chainId: '123456',
        signatureValidation: () => 'valid_signature',
        options: {
          baseUrl: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      };

      const resp = {
        status: 200,
        data: {
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
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await new ChainUtil(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.status).toMatch('valid_signature');
    });
  });
});
