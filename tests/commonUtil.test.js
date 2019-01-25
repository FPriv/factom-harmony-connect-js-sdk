/* eslint-env jest */
import CommonUtil from '../lib/utils/commonUtil';

describe('CommonUtil TEST', () => {
  describe('Is Empty String', () => {
    it('should return true.', () => {
      expect(CommonUtil.isEmptyString()).toBe(true);
    });
    it('should return false.', () => {
      expect(CommonUtil.isEmptyString('This is string')).toBe(false);
    });
  });
  describe('Decode Response', () => {
    it('should return data with external_ids has been decoded.', () => {
      const data = {
        version: 1,
        stage: 'anchored',
        created_height: 118460,
        chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        all_keys_href: '/v1/identities/<chain_id>/keys',
        external_ids: [
          'U2lnbmVkRW50cnk=',
          'MTcxZTU4NTE0NTFjZTZmMmQ5NzMwYzE1MzdkYTQzNzVmZWI0NDI4NzBkODM1YzU0YTFiY2E4ZmZhN2UyYmRhNw==',
          'aWRwdWIzTmVnR01LbjJDRGN4M0E5Smtwb01tMmpFOUt4Y2h4cUhUbVhQdkpubVVKR2l6ZnJiNw==',
          'MjAxOS0wMS0xOFQxNDoxNzo1MFo=',
        ],
      };

      const dataDecoded = {
        version: 1,
        stage: 'anchored',
        created_height: 118460,
        chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        all_keys_href: '/v1/identities/<chain_id>/keys',
        external_ids: [
          'SignedEntry',
          '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
          '2019-01-18T14:17:50Z',
        ],
      };

      expect(CommonUtil.decodeResponse(data)).toEqual(dataDecoded);
    });
    it('should return data with name has been decoded.', () => {
      const data = {
        version: 1,
        stage: 'anchored',
        created_height: 118460,
        chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        all_keys_href: '/v1/identities/<chain_id>/keys',
        name: ['RU1QTE9ZRUU=', 'QUJDMTIz'],
      };

      const dataDecoded = {
        version: 1,
        stage: 'anchored',
        created_height: 118460,
        chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        all_keys_href: '/v1/identities/<chain_id>/keys',
        name: ['EMPLOYEE', 'ABC123'],
      };

      expect(CommonUtil.decodeResponse(data)).toEqual(dataDecoded);
    });
    it('should return data with content has been decoded.', () => {
      const data = {
        version: 1,
        stage: 'anchored',
        created_height: 118460,
        chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        all_keys_href: '/v1/identities/<chain_id>/keys',
        content: 'aGVsbG8sIHdvcmxkIQ==',
      };

      const dataDecoded = {
        version: 1,
        stage: 'anchored',
        created_height: 118460,
        chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
        all_keys_href: '/v1/identities/<chain_id>/keys',
        content: 'hello, world!',
      };

      expect(CommonUtil.decodeResponse(data)).toEqual(dataDecoded);
    });
  });
});
