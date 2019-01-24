/* eslint-disable no-param-reassign */
export default class ResponseUtil {
  static decodeBase64(data = {}) {
    const arrarDecode = ['external_ids', 'content', 'name'];

    arrarDecode.forEach((o) => {
      if (Object.prototype.hasOwnProperty.call(data, o)) {
        if (Array.isArray(data[o])) {
          const base64 = [];
          data[o].forEach((i) => {
            base64.push(Buffer.from(i, 'base64').toString('utf-8'));
          });

          data[o] = base64;
        } else if (typeof data[o] === 'string') {
          data[o] = Buffer.from(data[o], 'base64').toString('utf-8');
        }
      }
    });
  }
}
