/* eslint-disable no-param-reassign */
export default class CommonUtil {
  static decodeResponse(response = {}) {
    if (response.data) {
      const arrayDecode = ['external_ids', 'content', 'name'];

      if (Array.isArray(response.data)) {
        response.data.forEach((item) => {
          arrayDecode.forEach((o) => {
            if (Object.prototype.hasOwnProperty.call(item, o)) {
              if (Array.isArray(item[o])) {
                const decoded = [];

                if (o === 'external_ids'
                  && item[o].length >= 6
                  && (Buffer.from(item[o][0], 'base64').toString('utf-8') === 'SignedChain' || Buffer.from(item[o][0], 'base64').toString('utf-8') === 'SignedEntry')
                  && Buffer.from(item[o][1], 'base64').toString('hex') === '01') {
                  item[o].forEach((i, index) => {
                    if (index === 1) {
                      decoded.push(`0x${Buffer.from(i, 'base64').toString('hex')}`);
                    } else if (index === 4) {
                      decoded.push(Buffer.from(i, 'base64').toString('hex'));
                    } else {
                      decoded.push(Buffer.from(i, 'base64').toString('utf-8'));
                    }
                  });
                } else {
                  item[o].forEach((i) => {
                    decoded.push(Buffer.from(i, 'base64').toString('utf-8'));
                  });
                }

                item[o] = decoded;
              } else {
                item[o] = Buffer.from(item[o], 'base64').toString('utf-8');
              }
            }
          });
        });
      } else {
        arrayDecode.forEach((o) => {
          if (Object.prototype.hasOwnProperty.call(response.data, o)) {
            if (Array.isArray(response.data[o])) {
              const decoded = [];

              if (o === 'external_ids'
                && response.data[o].length >= 6
                && (Buffer.from(response.data[o][0], 'base64').toString('utf-8') === 'SignedChain' || Buffer.from(response.data[o][0], 'base64').toString('utf-8') === 'SignedEntry')
                && Buffer.from(response.data[o][1], 'base64').toString('hex') === '01') {
                response.data[o].forEach((i, index) => {
                  if (index === 1) {
                    decoded.push(`0x${Buffer.from(i, 'base64').toString('hex')}`);
                  } else if (index === 4) {
                    decoded.push(Buffer.from(i, 'base64').toString('hex'));
                  } else {
                    decoded.push(Buffer.from(i, 'base64').toString('utf-8'));
                  }
                });
              } else {
                response.data[o].forEach((i) => {
                  decoded.push(Buffer.from(i, 'base64').toString('utf-8'));
                });
              }

              response.data[o] = decoded;
            } else {
              response.data[o] = Buffer.from(response.data[o], 'base64').toString('utf-8');
            }
          }
        });
      }
    }

    return response;
  }

  static isEmptyString(value) {
    const type = typeof value;
    return (type === 'string' && value.trim() === '') || type !== 'string';
  }

  static isEmptyArray(arr) {
    return typeof arr === 'undefined' || (Array.isArray(arr) && !arr.length);
  }
}
