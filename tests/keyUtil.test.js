/* eslint-env jest */
import KeyUtil from '../lib/utils/keyUtil';

describe('KEY UTIL Test', () => {
  describe('Generate Pairs', () => {
    it('should return an object with private and public keys.', () => {
      const pairs = KeyUtil.generatePairs();
      expect(pairs.length).toBe(3);
    });
  });
});
