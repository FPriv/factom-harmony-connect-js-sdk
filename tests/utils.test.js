/* eslint-env jest */
import crypto from 'crypto';
import secp256k1 from 'secp256k1';
import Utils from '../lib/utils/utils';

describe('UTILS Test', () => {
  describe('Generate Pair', () => {
    it('should return an object with ed25519 private and public keys.', () => {
      const pairs = Utils.generateKeyPair();
      expect(pairs.publicKey).toContain('idpub');
    });

    it('should return an object with secp256k1 private and public keys.', () => {
      const pairs = Utils.generateKeyPair({
        keyType: 'ecdsasecp256k1signature2019',
      });

      expect(pairs.privateKey).not.toEqual(null);
      expect(pairs.publicKey).not.toEqual(null);
    });

    it('should return an object with rsa private and public keys.', () => {
      const pairs = Utils.generateKeyPair({
        keyType: 'rsasignature2018',
        secretPassphrase: 'mySecretPassphrase',
      });

      expect(pairs.privateKey).not.toEqual(null);
      expect(pairs.publicKey).not.toEqual(null);
    });

    it('should return error message when creating rsa keys with no secret passphrase.', () => {
      expect(() => (Utils.generateKeyPair({
        keyType: 'rsasignature2018',
        secretPassphrase: '',
      }))).toThrow();
    });
  });

  describe('Convert Raw to Key Pair', () => {
    it('should return an object with correctly converted private and public keys when a 32-byte private key is passed in as an argument.', () => {
      const pairs = Utils.convertRawToKeyPair({
        rawPrivateKey: 'abcdefghijklmnopqrstuvwxyz123456'
      });
      expect(pairs).toEqual({
        privateKey: 'idsec19zBQP2RjHg8Cb8xH2XHzhsB1a6ZkB23cbS21RjTAk6uvC5oDe',
        publicKey: 'idpub2CJqp8nKNrUzfyT3SZMqeHYmZFPsZApuPrqULS1kycrzgMUqvr'
      });
    });

    test('should throw an error when when given a value that is not a 32-byte private key passed in as an argument.', () => {
      expect(() =>
        Utils.convertRawToKeyPair({
          rawPrivateKey: 'abc'
        })
      ).toThrow();
    });
  });

  describe('Convert idsec/idpub to raw', () => {
    it('should return a key bytes array.', () => {
      const keyBytesArray = Utils.convertToRaw({
        signerKey: 'idsec2ioPQqJvJzzwqskEW67yrWd2GwQMs1oCuLHsLHxejmBbEFpEY8'
      });

      expect(keyBytesArray.toString()).toEqual(
        '206,52,64,7,230,61,24,192,43,186,215,44,182,4,8,81,1,203,226,186,148,125,4,67,251,60,240,170,194,252,23,203'
      );
    });

    it('should return error message when signer key is invalid.', () => {
      try {
        Utils.convertToRaw({signerKey: ''});
      } catch (error) {
        expect(error).toEqual(new Error('key is invalid.'));
      }
    });
  });
});
