/* eslint-env jest */
import axios from 'axios';
import Identities from '../lib/resources/Identities';

jest.mock('axios');
describe('IDENTITIES Test', () => {
  // describe('Create an Identity Key Pair', () => {
  //   let identities;
  //   beforeAll(() => {
  //     identities = new Identities({
  //       baseUrl: 'https://apicast.io',
  //       accessToken: {
  //         appId: '123456',
  //         appKey: '123456789',
  //       },
  //     });
  //   });
  //   it('should return array of 3 private and public key pairs', () => {
  //     identities.createKeyPairs();
  //   });
  // });
  describe('Create an Identity', () => {
    let identities;
    beforeAll(() => {
      identities = new Identities({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when name is missing', async () => {
      try {
        await identities.create();
      } catch (error) {
        expect(error).toEqual(new Error('name is required.'));
      }
    });
    it('should return error message when name is not array', async () => {
      try {
        await identities.create({ name: '123' });
      } catch (error) {
        expect(error).toEqual(new Error('name must be an array.'));
      }
    });
    it('should return error message when keys is missing', async () => {
      try {
        const data = { name: ['123'] };
        await identities.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('at least 1 key is required.'));
      }
    });
    it('should return error message when keys is not array', async () => {
      try {
        const data = { name: ['123'], keys: 'idpub' };
        await identities.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('keys must be an array.'));
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
          keys: ['idsec1xQLPp8bDpbaiDiZGiowSgLQ5cpBifJtDSdYX9XAqLrPPxwcvB'],
        };
        await identities.create(data);
      } catch (error) {
        expect(error).toEqual(
          new Error('calculated bytes of name and keys is 12655. It must be less than 10240, use less/shorter name or less keys.'),
        );
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
        await identities.create(data);
      } catch (error) {
        expect(error).toEqual(new Error(errors));
      }
    });
    it('should return error message when keys have at least 1 duplicated item.', async () => {
      const errors = [
        {
          key: 'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          error: 'key is duplicated, keys must be unique.',
        },
      ];
      try {
        const data = {
          name: ['123'],
          keys: [
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
            'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          ],
        };
        await identities.create(data);
      } catch (error) {
        expect(error).toEqual(new Error(errors));
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
        await await identities.create(data);
      } catch (error) {
        expect(error).toEqual(new Error('callbackUrl is an invalid url format.'));
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
        await await identities.create(data);
      } catch (error) {
        expect(error).toEqual(
          new Error('callbackStages must be an array.'),
        );
      }
    });
    it('should create an Identity successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          entry_hash:
            '20a1a2f74579128bc2c631ee608d51345df4d75d84c54c9aaf74f30dfef6d951',
          chain_id:
            '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
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
        callback_stages: ['factom', 'replicated'],
        callback_url: 'http://callback.com',
        keys: [
          'idpub2TWHFrWrJxVEmbeXnMRWeKBdFp7bEByosS1phV1bH7NS99zHF9',
          'idpub2FEZg6PwVuDXfsxEMinnqVfgjuNS2GzMSQwJgTdmUFQaoYpTnv',
          'idpub1tkTRwxonwCfsvTkk5enWzbZgQSRpWDYtdzPUnq83AgQtecSgc',
        ],
        name: [Buffer.from('1').toString('base64')],
      };
      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await identities.create(data);
      expect(axios).toHaveBeenCalledWith('https://apicast.io/identities', {
        data: dataPostAPI,
        headers: {
          'Content-Type': 'application/json',
          app_id: '123456',
          app_key: '123456789',
        },
        method: 'POST',
      });
      expect(response).toEqual(resp.data);
    });
  });
  describe('Get an Identity', () => {
    let identities;
    beforeAll(() => {
      identities = new Identities({
        baseUrl: 'https://apicast.io',
        accessToken: {
          appId: '123456',
          appKey: '123456789',
        },
      });
    });
    it('should return error message when identity chain id is missing', async () => {
      try {
        await identities.get();
      } catch (error) {
        expect(error).toEqual(new Error('identityChainId is required.'));
      }
    });
    it('should get an Identity successfully.', async () => {
      const resp = {
        status: 200,
        data: {
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id:
            '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          name: ['RU1QTE9ZRUU=', 'QUJDMTIz'],
        },
      };

      axios.mockImplementationOnce(() => Promise.resolve(resp));
      const response = await identities.get({
        identityChainId: '123456',
      });
      expect(axios).toHaveBeenCalledWith(
        'https://apicast.io/identities/123456',
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
});
