import secureRandom from 'secure-random';
import base58 from 'base-58';
import sha256 from 'js-sha256';
import elliptic from 'elliptic';

const EdDSA = elliptic.eddsa;
const ec = new EdDSA('ed25519');
const privatePrefixBytes = [0x03, 0x45, 0xf3, 0xd0, 0xd6];
const publicPrefixBytes = [0x03, 0x45, 0xef, 0x9d, 0xe0];
const base64Encode = 'base64';

export default class KeyUtil {
  /**
   * @return {Object} Key pair
   */
  static createKeyPair() {
    const privateKeyBytes = secureRandom.randomUint8Array(32);
    let tmp;
    let checkSum;

    tmp = sha256.digest((sha256.digest([...privatePrefixBytes, ...privateKeyBytes])));
    checkSum = tmp.slice(0, 4);
    const privateKey = base58.encode([...privatePrefixBytes, ...privateKeyBytes, ...checkSum]);
    const publicKeyBytes = ec.keyFromSecret(privateKeyBytes).getPublic();
    tmp = sha256.digest((sha256.digest([...publicPrefixBytes, ...publicKeyBytes])));
    checkSum = tmp.slice(0, 4);
    const publicKey = base58.encode([...publicPrefixBytes, ...publicKeyBytes, ...checkSum]);
    return {
      privateKey: privateKey,
      publicKey: publicKey,
    };
  }

  /**
   * @param  {String} signerKey=''
   * @return {Boolean} validate check sum
   */
  static validateCheckSum(signerKey = '') {
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

    if (Buffer.compare(checkSum, Uint8Array.from(tmpCheckSum)) !== 0) {
      return false;
    }

    return true;
  }

  static validateKeys(signerKeys = []) {
    const errors = [];
    signerKeys.forEach((o) => {
      if (!this.validateCheckSum(o)) {
        errors.push({ key: `${o}`, error: 'key is invalid' });
      }
    });

    if (!errors.length) {
      return true;
    }

    return errors;
  }

  static getKeyBytesFromKey(signerKey = '') {
    if (!this.validateCheckSum(signerKey)) {
      throw new Error('key is invalid.');
    }

    const signerKeyBytes = base58.decode(signerKey);

    return signerKeyBytes.slice(5, 37);
  }

  static getPublicKeyFromPrivateKey(privateKey = '') {
    if (!this.validateCheckSum(privateKey)) {
      throw new Error('private key is invalid.');
    }

    const privateKeyBytes = this.getKeyBytesFromKey(privateKey);
    const publicKeyBytes = ec.keyFromSecret(privateKeyBytes).getPublic();
    const tmp = sha256.digest((sha256.digest([...publicPrefixBytes, ...publicKeyBytes])));
    const checkSum = tmp.slice(0, 4);
    return base58.encode([...publicPrefixBytes, ...publicKeyBytes, ...checkSum]);
  }

  static signContent(privateKey = '', message = '') {
    if (!privateKey) {
      throw new Error('private key is required.');
    }

    if (!KeyUtil.validateCheckSum(privateKey)) {
      throw new Error('private key is invalid.');
    }

    if (!message) {
      throw new Error('message is required.');
    }

    const privateKeyBytes = this.getKeyBytesFromKey(privateKey);
    const secretKey = ec.keyFromSecret(privateKeyBytes);

    return Buffer.from(secretKey.sign(message).toBytes()).toString(base64Encode);
  }

  static validatingSignature(publicKey = '', signature = '', message = '') {
    if (!publicKey) {
      throw new Error('public key is required.');
    }

    if (!KeyUtil.validateCheckSum(publicKey)) {
      throw new Error('public key is invalid.');
    }

    if (!signature) {
      throw new Error('signature is required.');
    }

    if (!message) {
      throw new Error('message is required.');
    }

    const signatureBytes = Buffer.from(signature, base64Encode);
    const msgHashBytes = Buffer.from(message, base64Encode);
    const keyBytes = this.getKeyBytesFromKey(publicKey);
    const secretKey = ec.keyFromPublic([...keyBytes]);

    return secretKey.verify(msgHashBytes, [...signatureBytes]);
  }
}
