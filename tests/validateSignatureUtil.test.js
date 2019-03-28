/* eslint-env jest */
import axios from 'axios';
import ApiCall from '../lib/api';
import ValidateSignatureUtil from '../lib/utils/validateSignatureUtil';

jest.mock('axios');
describe('Validate Signature Util Test', () => {
  describe('Validating Signature', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new ApiCall({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return a chain object with key not found', async () => {
      const resp = {
        status: 404,
        response: {
          status: 404,
          statusText: 'not found',
        },
      };
      const data = {
        data: {
          stage: 'factom',
          external_ids: [
            'SignedChain',
            '0x01',
            'ZmFzZGZzZmRm',
            'idpub2WL2aH5Y2s7atB1LwjEyaKa62pnuJXUaL5kcbahzwahc1Hiba6',
            '779229d23cdb7380869e63e5156a5497170bceec139b37e7af2a4d1aae14d053d19f7626e08d4bbb003d4b05d941f43402f1288af2ff0391a2dee4abf0919b07',
            'ZmFzZGZzZmRm',
          ],
          entries: {
            href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
          },
          chain_id: '123456',
          dblock: {
            height: 1000,
          },
        },
      };
      axios.mockImplementationOnce(() => Promise.reject(resp));
      const response = await ValidateSignatureUtil.validateSignature({
        obj: data,
        validateForChain: true,
        apiCall: apiCall,
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities/ZmFzZGZzZmRm/keys/idpub2WL2aH5Y2s7atB1LwjEyaKa62pnuJXUaL5kcbahzwahc1Hiba6', {
        data: '',
        headers: {
          'Content-Type': 'application/json',
          app_id: '123456',
          app_key: '123456789',
        },
        method: 'GET',
      });
      expect(response).toMatch('key_not_found');
    });
    it('should return error when encountering unexpected cases.', async () => {
      const resp = {
        status: 500,
        response: {
          status: 500,
          statusText: 'Server internal error',
        },
      };
      try {
        axios.mockImplementationOnce(() => Promise.resolve(resp));
        const data = {
          data: {
            stage: 'factom',
            external_ids: [
              'SignedChain',
              '0x01',
              'ZmFzZGZzZmRm',
              'idpub2WL2aH5Y2s7atB1LwjEyaKa62pnuJXUaL5kcbahzwahc1Hiba6',
              '779229d23cdb7380869e63e5156a5497170bceec139b37e7af2a4d1aae14d053d19f7626e08d4bbb003d4b05d941f43402f1288af2ff0391a2dee4abf0919b07',
              'ZmFzZGZzZmRm',
            ],
            entries: {
              href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
            },
            chain_id: '123456',
            dblock: {
              height: 1000,
            },
          },
        };
        await ValidateSignatureUtil.validateSignature({
          obj: data,
          validateForChain: true,
          apiCall: apiCall,
        });
        expect(axios).toHaveBeenCalledWith('https://apicast.io/identities/ZmFzZGZzZmRm/keys/idpub2WL2aH5Y2s7atB1LwjEyaKa62pnuJXUaL5kcbahzwahc1Hiba6', {
          data: '',
          headers: {
            'Content-Type': 'application/json',
            app_id: '123456',
            app_key: '123456789',
          },
          method: 'GET',
        });
      } catch (error) {
        expect(error).toEqual(new Error({
          status: 500,
          message: 'Server internal error',
        }));
      }
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
      const response = await ValidateSignatureUtil.validateSignature({
        obj: data,
        validateForChain: true,
        apiCall: apiCall,
      });
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
      const response = await ValidateSignatureUtil.validateSignature({
        obj: data,
        validateForChain: true,
        apiCall: apiCall,
      });
      expect(response).toMatch('not_signed/invalid_chain_format');
    });
    it('should return a chain object with invalid chain format status when second external ids is not equal 0x01.', async () => {
      const data = {
        data: {
          stage: 'factom',
          external_ids: [
            'SignedEntry',
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
      const response = await ValidateSignatureUtil.validateSignature({
        obj: data,
        validateForChain: false,
        apiCall: apiCall,
      });
      expect(response).toMatch('not_signed/invalid_entry_format');
    });
    it('should return a chain object with invalid chain format status when third external ids is invalid key.', async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            key: 'idpub',
            retired_height: 1001,
            activated_height: 1001,
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
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
            'ZmFzZGZzZmRm',
          ],
          entries: {
            href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
          },
          chain_id: '123456',
          dblock: {
            height: 1000,
          },
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await ValidateSignatureUtil.validateSignature({
        obj: data,
        validateForChain: true,
        apiCall: apiCall,
      });
      expect(response).toMatch('not_signed/invalid_chain_format');
    });
    it('should return a chain object with inactive key status.', async () => {
      const resp = {
        status: 200,
        data: {
          data: {
            key: 'idpub',
            retired_height: 1001,
            activated_height: 1001,
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
            'idpub2WL2aH5Y2s7atB1LwjEyaKa62pnuJXUaL5kcbahzwahc1Hiba6',
            '779229d23cdb7380869e63e5156a5497170bceec139b37e7af2a4d1aae14d053d19f7626e08d4bbb003d4b05d941f43402f1288af2ff0391a2dee4abf0919b07',
            'ZmFzZGZzZmRm',
          ],
          entries: {
            href: '/v1/chains/2475e1add69e4aae98ca325f883579c370d049f34cc6b4531c19b0f10c7c7094/entries',
          },
          chain_id: '123456',
          dblock: {
            height: 1000,
          },
        },
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await ValidateSignatureUtil.validateSignature({
        obj: data,
        validateForChain: true,
        apiCall: apiCall,
      });
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities/ZmFzZGZzZmRm/keys/idpub2WL2aH5Y2s7atB1LwjEyaKa62pnuJXUaL5kcbahzwahc1Hiba6', {
        data: '',
        headers: {
          'Content-Type': 'application/json',
          app_id: '123456',
          app_key: '123456789',
        },
        method: 'GET',
      });
      expect(response).toMatch('retired_key');
    });
  });
});
