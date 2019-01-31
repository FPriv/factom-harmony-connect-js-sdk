/* eslint-disable no-param-reassign */
export default class CommonUtil {
  static decodeResponse(response = {}) {
    if (response.data) {
      const arrarDecode = ['external_ids', 'content', 'name'];

      arrarDecode.forEach((o) => {
        if (Object.prototype.hasOwnProperty.call(response.data, o)) {
          if (Array.isArray(response.data[o])) {
            const decoded = [];
            response.data[o].forEach((i, index) => {
              if (o === 'external_ids' && index === 1) {
                decoded.push(`0x${Buffer.from(i, 'base64').toString('hex')}`);
              } else if (o === 'external_ids' && index === 4) {
                decoded.push(Buffer.from(i, 'base64').toString('hex'));
              } else {
                decoded.push(Buffer.from(i, 'base64').toString('utf-8'));
              }
            });

            response.data[o] = decoded;
          } else {
            response.data[o] = Buffer.from(response.data[o], 'base64').toString('utf-8');
          }
        }
      });
    }
    return response;
  }

  static isEmptyString(value) {
    const type = typeof value;
    return (type === 'string' && value.trim() === '') || type !== 'string';
  }
}
