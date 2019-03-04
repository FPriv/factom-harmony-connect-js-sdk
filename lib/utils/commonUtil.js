/* eslint-disable no-param-reassign */
export default class CommonUtil {
  static decodeResponse(response = {}) {
    if (response.data) {
      const arrayDecode = ['external_ids', 'content', 'name'];

      if (Array.isArray(response.data)) {
        response.data.forEach((item) => {
          arrayDecode.forEach((o) => {
            if (Object.prototype.hasOwnProperty.call(item, o)) {
              item[o] = CommonUtil.decode(o, item[o]);
            }
          });
        });
      } else {
        arrayDecode.forEach((o) => {
          if (Object.prototype.hasOwnProperty.call(response.data, o)) {
            response.data[o] = CommonUtil.decode(o, response.data[o]);
          }
        });
      }
    }

    return response;
  }

  static decode(name, data) {
    if (Array.isArray(data)) {
      const decoded = [];

      if (name === 'external_ids'
        && data.length >= 6
        && (Buffer.from(data[0], 'base64').toString('utf-8') === 'SignedChain' || Buffer.from(data[0], 'base64').toString('utf-8') === 'SignedEntry')
        && Buffer.from(data[1], 'base64').toString('hex') === '01') {
        data.forEach((i, index) => {
          if (index === 1) {
            decoded.push(`0x${Buffer.from(i, 'base64').toString('hex')}`);
          } else if (index === 4) {
            decoded.push(Buffer.from(i, 'base64').toString('hex'));
          } else {
            decoded.push(Buffer.from(i, 'base64').toString('utf-8'));
          }
        });
      } else {
        data.forEach((i) => {
          decoded.push(Buffer.from(i, 'base64').toString('utf-8'));
        });
      }

      return decoded;
    }

    return Buffer.from(data, 'base64').toString('utf-8');
  }

  static isEmptyString(value) {
    const type = typeof value;
    return (type === 'string' && value.trim() === '') || type !== 'string';
  }

  static isEmptyArray(arr) {
    return typeof arr === 'undefined' || (Array.isArray(arr) && !arr.length);
  }
}
