/* eslint-env jest */
import axios from 'axios';
import Chain from '../lib/resources/Chain';

jest.mock('axios');
describe('CHAIN Test', () => {
  let chain;
  beforeAll(async () => {
    chain = new Chain({
      baseUrl: 'https://apicast.io/',
      accessToken: {
        appId: '123456',
        appKey: '123456789',
      },
    });
  });
  it('should return error message when chain id is missing', async () => {
    try {
      // eslint-disable-next-line no-new
      await chain.get();
    } catch (error) {
      expect(error).toEqual(new Error('chainId is required.'));
    }
  });
  it('should return a chain info', async () => {
    const data = {
      chainId: '123456',
      signatureValidation: false,
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
    const _ = await chain.get(data);
    expect(axios).toHaveBeenCalledWith('https://apicast.io/chains/123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
    expect(_.data).toEqual(respDecoded);
  });
});
