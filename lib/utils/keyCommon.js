import secureRandom from 'secure-random';
import base58 from 'base-58';
import sha256 from 'js-sha256';
import elliptic from 'elliptic';
import constants from './constants';

const EdDSA = elliptic.eddsa;
const ec = new EdDSA('ed25519');
const privatePrefixBytes = [0x03, 0x45, 0xf3, 0xd0, 0xd6];
const publicPrefixBytes = [0x03, 0x45, 0xef, 0x9d, 0xe0];

/**
 * @classdesc Represents the Key Common.
 * @class
 */
export default class KeyCommon {
  /**
   * @return  {Object} Returns an Key Pair Object with Private and Public keys
   */
  static createKeyPair({rawPrivateKey = ''} = {}) {
    let privateKeyBytes;

    if (rawPrivateKey) {
        if (typeof rawPrivateKey === 'string' && rawPrivateKey.length === 32) {
            privateKeyBytes = rawPrivateKey;
        } else {
            throw new Error('provided ed25519 private key is invalid.');
        }
    } else {
      privateKeyBytes = secureRandom.randomUint8Array(32);
    }

    let tmp;
    let checkSum;

    tmp = sha256.digest((sha256.digest([...privatePrefixBytes, ...privateKeyBytes])));
    checkSum = tmp.slice(0, 4);
    const generatedPrivateKey = base58.encode([...privatePrefixBytes, ...privateKeyBytes, ...checkSum]);
    const publicKeyBytes = ec.keyFromSecret(privateKeyBytes).getPublic();
    tmp = sha256.digest((sha256.digest([...publicPrefixBytes, ...publicKeyBytes])));
    checkSum = tmp.slice(0, 4);
    const generatedPublicKey = base58.encode([...publicPrefixBytes, ...publicKeyBytes, ...checkSum]);
    return {
        privateKey: generatedPrivateKey,
        publicKey: generatedPublicKey
    };
  }

  /**
   * @param  {String} params.signerKey='' - A base58 string in idpub or idsec format
   * @return  {Boolean} Validate checkSum. Will returns true if checkSum is equal.
   */
  static validateCheckSum({ signerKey = '' } = {}) {
    if (!signerKey) {
      return false;
    }

    const signerKeyBytes = base58.decode(signerKey);
    if (signerKeyBytes.length !== 41) {
      return false;
    }

    const prefixBytes = signerKeyBytes.slice(0, 5);
    const keyBytes = signerKeyBytes.slice(5, 37);
    const checkSum = signerKeyBytes.slice(37, 41);

    const tmp = sha256.digest((sha256.digest([...prefixBytes, ...keyBytes])));
    const tmpCheckSum = tmp.slice(0, 4);

    if (Buffer.compare(Buffer.from(checkSum), Buffer.from(tmpCheckSum)) !== 0) {
      return false;
    }

    return true;
  }

  /**
   * @param  {String[]} params.signerKeys=[] - Array base58 string in idpub or idsec format
   * @return  {Object[]} Returns errors array when keys have at least 1 invalid item.
   */
  static getInvalidKeys({ signerKeys = [] } = {}) {
    const errors = [];
    signerKeys.forEach((o) => {
      if (!this.validateCheckSum({ signerKey: o })) {
        errors.push({ key: o, error: 'key is invalid' });
      }
    });

    return errors;
  }

  /**
   * @param  {String[]} params.signerKeys=[] - Array base58 string in idpub or idsec format
   * @return  {Object[]} Returns duplicate array when keys have at least 1 duplicate item.
   */
  static getDuplicateKeys({ signerKeys = [] } = {}) {
    const duplicates = [];
    const unique = [];
    signerKeys.forEach((i) => {
      if (unique.indexOf(i) === -1) {
        unique.push(i);
      } else if (!duplicates.find(x => x.key === i)) {
        duplicates.push({
          key: i,
          error: 'key is duplicated, keys must be unique.',
        });
      }
    });

    return duplicates;
  }

  /**
   * @param  {String} params.signerKey='' - A base58 string in idpub or idsec format
   * @return  {Buffer} Returns key bytes array
   */
  static getKeyBytesFromKey({ signerKey = '' }) {
    if (!this.validateCheckSum({ signerKey: signerKey })) {
      throw new Error('key is invalid.');
    }

    const signerKeyBytes = base58.decode(signerKey);

    return signerKeyBytes.slice(5, 37);
  }

  /**
   * @param  {String} params.signerPrivateKey='' - A base58 string in idpub or idsec format
   * @return  {String} Returns a base58 string in idpub format
   */
  static getPublicKeyFromPrivateKey({ signerPrivateKey = '' } = {}) {
    if (!this.validateCheckSum({ signerKey: signerPrivateKey })) {
      throw new Error('signerPrivateKey is invalid.');
    }

    const privateKeyBytes = this.getKeyBytesFromKey({ signerKey: signerPrivateKey });
    const publicKeyBytes = ec.keyFromSecret(privateKeyBytes).getPublic();
    const tmp = sha256.digest((sha256.digest([...publicPrefixBytes, ...publicKeyBytes])));
    const checkSum = tmp.slice(0, 4);
    return base58.encode([...publicPrefixBytes, ...publicKeyBytes, ...checkSum]);
  }

  /**
   * @param  {String} params.privateKey='' - A base58 string in idsec format
   * @param  {String} params.message='' - A plain text.
   * @return  {String} Returns a base64 signature string format
   */
  static signContent({ signerPrivateKey = '', message = '' } = {}) {
    if (!signerPrivateKey) {
      throw new Error('signerPrivateKey is required.');
    }

    if (!KeyCommon.validateCheckSum({ signerKey: signerPrivateKey })) {
      throw new Error('signerPrivateKey is invalid.');
    }

    if (!message) {
      throw new Error('message is required.');
    }

    const privateKeyBytes = this.getKeyBytesFromKey({ signerKey: signerPrivateKey });
    const secretKey = ec.keyFromSecret(privateKeyBytes);
    const msgBytes = Buffer.from(message, constants.UTF8_ENCODE);

    return Buffer.from(secretKey.sign(msgBytes).toBytes()).toString(constants.BASE64_ENCODE);
  }

  /**
   * @param  {String} params.signerPublicKey='' - A base58 string in idpub format
   * @param  {String} params.signature='' - A base 64 string format
   * @param  {String} params.message='' - A plain text
   * @return  {Boolean} Validate signature
   */
  static validateSignature({ signerPublicKey = '', signature = '', message = '' } = {}) {
    if (!signerPublicKey) {
      throw new Error('signerPublicKey is required.');
    }

    if (!KeyCommon.validateCheckSum({ signerKey: signerPublicKey })) {
      throw new Error('signerPublicKey is invalid.');
    }

    if (!signature) {
      throw new Error('signature is required.');
    }

    if (!message) {
      throw new Error('message is required.');
    }

    const signatureBytes = Buffer.from(signature, constants.BASE64_ENCODE);
    const msgBytes = Buffer.from(message, constants.UTF8_ENCODE);
    const keyBytes = this.getKeyBytesFromKey({ signerKey: signerPublicKey });
    const secretKey = ec.keyFromPublic([...keyBytes]);

    return secretKey.verify(msgBytes, [...signatureBytes]);
  }
}
