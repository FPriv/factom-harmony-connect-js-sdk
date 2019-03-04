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
      const response = await ValidateSignatureUtil.validateSignature({
        obj: data,
        validateForChain: true,
        apiCall: apiCall,
      });
      expect(response).toMatch('inactive_key');
    });
  });
});
