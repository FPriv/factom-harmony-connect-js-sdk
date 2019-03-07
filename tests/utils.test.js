/* eslint-env jest */
import Utils from '../lib/utils/utils';

describe('UTILS Test', () => {
  describe('Generate Pair', () => {
    it('should return an object with private and public keys.', () => {
      const pairs = Utils.generateKeyPair();
      expect(pairs.publicKey).toContain('idpub');
    });
  });
});
