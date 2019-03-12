/* eslint-env jest */
import CommonUtil from '../lib/utils/commonUtil';

describe('COMMON UTIL Test', () => {
  describe('Is Empty String', () => {
    it('should return true.', () => {
      expect(CommonUtil.isEmptyString()).toBe(true);
    });
    it('should return false.', () => {
      expect(CommonUtil.isEmptyString('This is string')).toBe(false);
    });
  });
  describe('Decode Response', () => {
    it('should return empty object.', () => {
      expect(CommonUtil.decodeResponse()).toEqual({});
    });
    it('should return data with external_ids has been decoded with data is array.', () => {
      const data = {
        data: [{
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          all_keys_href: '/v1/identities/<chain_id>/keys',
          external_ids: [
            'U2lnbmVkRW50cnk=',
            'AQ==',
            'MTcxZTU4NTE0NTFjZTZmMmQ5NzMwYzE1MzdkYTQzNzVmZWI0NDI4NzBkODM1YzU0YTFiY2E4ZmZhN2UyYmRhNw==',
            'aWRwdWIzTmVnR01LbjJDRGN4M0E5Smtwb01tMmpFOUt4Y2h4cUhUbVhQdkpubVVKR2l6ZnJiNw==',
            'd5Ip0jzbc4CGnmPlFWpUlxcLzuwTmzfnrypNGq4U0FPRn3Ym4I1LuwA9SwXZQfQ0AvEoivL/A5Gi3uSr8JGbBw==',
            'MjAxOS0wMS0xOFQxNDoxNzo1MFo=',
          ],
        }],
      };

      const dataDecoded = {
        data: [{
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          all_keys_href: '/v1/identities/<chain_id>/keys',
          external_ids: [
            'SignedEntry',
            '0x01',
            '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
            'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
            '779229d23cdb7380869e63e5156a5497170bceec139b37e7af2a4d1aae14d053d19f7626e08d4bbb003d4b05d941f43402f1288af2ff0391a2dee4abf0919b07',
            '2019-01-18T14:17:50Z',
          ],
        }],
      };

      expect(CommonUtil.decodeResponse(data)).toEqual(dataDecoded);
    });
    it('should return data with external_ids has been decoded with data is object.', () => {
      const data = {
        data: {
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          all_keys_href: '/v1/identities/<chain_id>/keys',
          external_ids: [
            'U2lnbmVkRW50cnk=',
            'AQ==',
            'MTcxZTU4NTE0NTFjZTZmMmQ5NzMwYzE1MzdkYTQzNzVmZWI0NDI4NzBkODM1YzU0YTFiY2E4ZmZhN2UyYmRhNw==',
            'aWRwdWIzTmVnR01LbjJDRGN4M0E5Smtwb01tMmpFOUt4Y2h4cUhUbVhQdkpubVVKR2l6ZnJiNw==',
            'd5Ip0jzbc4CGnmPlFWpUlxcLzuwTmzfnrypNGq4U0FPRn3Ym4I1LuwA9SwXZQfQ0AvEoivL/A5Gi3uSr8JGbBw==',
            'MjAxOS0wMS0xOFQxNDoxNzo1MFo=',
          ],
        },
      };

      const dataDecoded = {
        data: {
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          all_keys_href: '/v1/identities/<chain_id>/keys',
          external_ids: [
            'SignedEntry',
            '0x01',
            '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
            'idpub3NegGMKn2CDcx3A9JkpoMm2jE9KxchxqHTmXPvJnmUJGizfrb7',
            '779229d23cdb7380869e63e5156a5497170bceec139b37e7af2a4d1aae14d053d19f7626e08d4bbb003d4b05d941f43402f1288af2ff0391a2dee4abf0919b07',
            '2019-01-18T14:17:50Z',
          ],
        },
      };

      expect(CommonUtil.decodeResponse(data)).toEqual(dataDecoded);
    });
    it('should return data with names has been decoded.', () => {
      const data = {
        data: {
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          all_keys_href: '/v1/identities/<chain_id>/keys',
          names: 'RU1QTE9ZRUU=',
        },
      };

      const dataDecoded = {
        data: {
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          all_keys_href: '/v1/identities/<chain_id>/keys',
          names: 'EMPLOYEE',
        },
      };

      expect(CommonUtil.decodeResponse(data)).toEqual(dataDecoded);
    });
    it('should return data with content has been decoded.', () => {
      const data = {
        data: {
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          all_keys_href: '/v1/identities/<chain_id>/keys',
          content: 'aGVsbG8sIHdvcmxkIQ==',
        },
      };

      const dataDecoded = {
        data: {
          version: 1,
          stage: 'anchored',
          created_height: 118460,
          chain_id: '171e5851451ce6f2d9730c1537da4375feb442870d835c54a1bca8ffa7e2bda7',
          all_keys_href: '/v1/identities/<chain_id>/keys',
          content: 'hello, world!',
        },
      };

      expect(CommonUtil.decodeResponse(data)).toEqual(dataDecoded);
    });
  });
});
