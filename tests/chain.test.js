/* eslint-env jest */
import axios from 'axios';
import Chain from '../lib/resources/chain';

jest.mock('axios');
describe('CHAIN Test', () => {
  describe('constructor', () => {
    it('should return error message when chain id is missing', () => {
      try {
        // eslint-disable-next-line no-new
        new Chain();
      } catch (error) {
        expect(error).toEqual(new Error('chainId is required.'));
      }
    });
    it('should return a chain object without validate signature', async () => {
      const data = {
        chainId: '123456',
        signatureValidation: false,
        options: {
          baseURL: 'https://apicast.io/',
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
            chain_id: '123456',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await new Chain(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.data).toEqual({ chain_id: '123456' });
    });
    it('should return a chain object with validate signature', async () => {
      const data = {
        chainId: '123456',
        options: {
          baseURL: 'https://apicast.io/',
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
      const response = await new Chain(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.status).toMatch('not_signed/invalid_chain_format');
    });
    it('should return a chain object with validate signature is a function', async () => {
      const data = {
        chainId: '123456',
        signatureValidation: () => 'valid_signature',
        options: {
          baseURL: 'https://apicast.io/',
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
            chain_id: '123456',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await new Chain(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response.status).toMatch('valid_signature');
    });
  });
  describe('Entry Info', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
            content: 'content',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        signatureValidation: false,
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return error message when entry hash is missing', async () => {
      try {
        await chain.getEntryInfo();
      } catch (error) {
        expect(error).toEqual(new Error('entry hash is required.'));
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
      const response = await chain.getEntryInfo({ entryHash: 'sha256', signatureValidation: false });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/sha256', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Create An Entry without signing', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
            entries: '/v1/chains/123456/entries',
            content: 'content',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        signatureValidation: false,
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
          automaticSigning: false,
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await chain.createEntry();
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 externalId is required.'));
      }
    });
    it('should create an entry successfully', async () => {
      const data = {
        externalIds: ['1'],
        content: '123',
        callbackUrl: 'http://callback.com',
        callbackStages: ['factom', 'replicated'],
      };

      const resp = {
        status: 200,
        data: {
          entry_hash: '123456',
        },
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
      const response = await chain.createEntry(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ entry_hash: '123456' });
    });
  });
  describe('Get Entries', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
            content: 'content',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        signatureValidation: false,
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return entries info successfully', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chain.getEntries();
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('First Entry', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
            content: 'content',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        signatureValidation: false,
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return first entry successfully', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chain.getFirstEntry();
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/first', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Last Entry', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
            content: 'content',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        signatureValidation: false,
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return last entry successfully', async () => {
      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chain.getLastEntry();
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/last', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Search Entries', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
            content: 'content',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        signatureValidation: false,
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    });
    it('should return error message when external ids is missing', async () => {
      try {
        await chain.searchEntries();
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 externalId is required.'));
      }
    });
    it('should return entries successfully', async () => {
      const data = {
        externalIds: ['1'],
        limit: 1,
      };

      const resp = {
        status: 200,
        data: {
          chain_id: '123456',
        },
      };

      const dataPostAPI = {
        external_ids: [
          Buffer.from('1').toString('base64'),
        ],
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await chain.searchEntries(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456/entries/search?limit=1', { data: dataPostAPI, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
      expect(response).toEqual({ chain_id: '123456' });
    });
  });
  describe('Validating Signature', () => {
    let chain;
    beforeAll(async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            chain_id: '123456',
            content: 'content',
          },
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      chain = await new Chain({
        chainId: '123456',
        signatureValidation: false,
        options: {
          baseURL: 'https://apicast.io/',
          accessToken: {
            appId: '123456',
            appKey: '123456789',
          },
        },
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
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
      const response = await chain.validateSignature({ chain: data });
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
      const response = await chain.validateSignature({ chain: data });
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
      const response = await chain.validateSignature({ chain: data });
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
      const response = await chain.validateSignature({ chain: data });
      expect(response).toMatch('inactive_key');
    });
    it('should return a chain object with invalid signature status.', async () => {
      const resp = {
        status: 200,
        data: {
          data: [{
            key: 'idpub2Cktw6EgcBVMHMXmfcCyTHndcFvG7fJKyBpy3sTYcdTmdTuKya',
          }],
        },
      };
      const entryResponse = {
        status: 200,
        data: {
          data: {
            content: '123',
          },
        },
      };
      const data = {
        data: {
          stage: 'factom',
          external_ids: [
            'SignedChain',
            '0x01',
            'ZmFzZGZzZmRm',
            'idpub2Cktw6EgcBVMHMXmfcCyTHndcFvG7fJKyBpy3sTYcdTmdTuKya',
            'd5Ip0jzbc4CGnmPlFWpUlxcLzuwTmzfnrypNGq4U0FPRn3Ym4I1LuwA9SwXZQfQ0AvEoivL/A5Gi3uSr8JGbBw==',
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
      axios.mockImplementationOnce(() => Promise.resolve(resp))
        .mockImplementationOnce(() => Promise.resolve(entryResponse));
      const response = await chain.validateSignature({ chain: data });
      expect(response).toMatch('invalid_signature');
    });
  });
});
