var FactomHarmonyConnectSDK = (function () {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var classCallCheck = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	});

	var _classCallCheck = unwrapExports(classCallCheck);

	var global$1 = (typeof global !== "undefined" ? global :
	            typeof self !== "undefined" ? self :
	            typeof window !== "undefined" ? window : {});

	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
	var inited = false;
	function init () {
	  inited = true;
	  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	  for (var i = 0, len = code.length; i < len; ++i) {
	    lookup[i] = code[i];
	    revLookup[code.charCodeAt(i)] = i;
	  }

	  revLookup['-'.charCodeAt(0)] = 62;
	  revLookup['_'.charCodeAt(0)] = 63;
	}

	function toByteArray (b64) {
	  if (!inited) {
	    init();
	  }
	  var i, j, l, tmp, placeHolders, arr;
	  var len = b64.length;

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

	  // base64 is 4/3 + up to two characters of the original data
	  arr = new Arr(len * 3 / 4 - placeHolders);

	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len;

	  var L = 0;

	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
	    arr[L++] = (tmp >> 16) & 0xFF;
	    arr[L++] = (tmp >> 8) & 0xFF;
	    arr[L++] = tmp & 0xFF;
	  }

	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
	    arr[L++] = tmp & 0xFF;
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
	    arr[L++] = (tmp >> 8) & 0xFF;
	    arr[L++] = tmp & 0xFF;
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  if (!inited) {
	    init();
	  }
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var output = '';
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    output += lookup[tmp >> 2];
	    output += lookup[(tmp << 4) & 0x3F];
	    output += '==';
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
	    output += lookup[tmp >> 10];
	    output += lookup[(tmp >> 4) & 0x3F];
	    output += lookup[(tmp << 2) & 0x3F];
	    output += '=';
	  }

	  parts.push(output);

	  return parts.join('')
	}

	function read (buffer, offset, isLE, mLen, nBytes) {
	  var e, m;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = -7;
	  var i = isLE ? (nBytes - 1) : 0;
	  var d = isLE ? -1 : 1;
	  var s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	function write (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
	  var i = isLE ? 0 : (nBytes - 1);
	  var d = isLE ? 1 : -1;
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128;
	}

	var toString = {}.toString;

	var isArray = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};

	var INSPECT_MAX_BYTES = 50;

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
	  ? global$1.TYPED_ARRAY_SUPPORT
	  : true;

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length);
	    that.__proto__ = Buffer.prototype;
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length);
	    }
	    that.length = length;
	  }

	  return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}

	Buffer.poolSize = 8192; // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype;
	  return arr
	};

	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }

	  return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	};

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype;
	  Buffer.__proto__ = Uint8Array;
	}

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}

	function alloc (that, size, fill, encoding) {
	  assertSize(size);
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	};

	function allocUnsafe (that, size) {
	  assertSize(size);
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0;
	    }
	  }
	  return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	};
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	};

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8';
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  var length = byteLength(string, encoding) | 0;
	  that = createBuffer(that, length);

	  var actual = that.write(string, encoding);

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual);
	  }

	  return that
	}

	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0;
	  that = createBuffer(that, length);
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255;
	  }
	  return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }

	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array);
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset);
	  } else {
	    array = new Uint8Array(array, byteOffset, length);
	  }

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array;
	    that.__proto__ = Buffer.prototype;
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array);
	  }
	  return that
	}

	function fromObject (that, obj) {
	  if (internalIsBuffer(obj)) {
	    var len = checked(obj.length) | 0;
	    that = createBuffer(that, len);

	    if (that.length === 0) {
	      return that
	    }

	    obj.copy(that, 0, 0, len);
	    return that
	  }

	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }

	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }

	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	Buffer.isBuffer = isBuffer;
	function internalIsBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length;
	  var y = b.length;

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i];
	      y = b[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	};

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }

	  var i;
	  if (length === undefined) {
	    length = 0;
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length;
	    }
	  }

	  var buffer = Buffer.allocUnsafe(length);
	  var pos = 0;
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i];
	    if (!internalIsBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos);
	    pos += buf.length;
	  }
	  return buffer
	};

	function byteLength (string, encoding) {
	  if (internalIsBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string;
	  }

	  var len = string.length;
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	}
	Buffer.byteLength = byteLength;

	function slowToString (encoding, start, end) {
	  var loweredCase = false;

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0;
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length;
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0;
	  start >>>= 0;

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8';

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase();
	        loweredCase = true;
	    }
	  }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true;

	function swap (b, n, m) {
	  var i = b[n];
	  b[n] = b[m];
	  b[m] = i;
	}

	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length;
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1);
	  }
	  return this
	};

	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length;
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3);
	    swap(this, i + 1, i + 2);
	  }
	  return this
	};

	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length;
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7);
	    swap(this, i + 1, i + 6);
	    swap(this, i + 2, i + 5);
	    swap(this, i + 3, i + 4);
	  }
	  return this
	};

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0;
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	};

	Buffer.prototype.equals = function equals (b) {
	  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	};

	Buffer.prototype.inspect = function inspect () {
	  var str = '';
	  var max = INSPECT_MAX_BYTES;
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
	    if (this.length > max) str += ' ... ';
	  }
	  return '<Buffer ' + str + '>'
	};

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!internalIsBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }

	  if (start === undefined) {
	    start = 0;
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0;
	  }
	  if (thisStart === undefined) {
	    thisStart = 0;
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length;
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0;
	  end >>>= 0;
	  thisStart >>>= 0;
	  thisEnd >>>= 0;

	  if (this === target) return 0

	  var x = thisEnd - thisStart;
	  var y = end - start;
	  var len = Math.min(x, y);

	  var thisCopy = this.slice(thisStart, thisEnd);
	  var targetCopy = target.slice(start, end);

	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i];
	      y = targetCopy[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset;
	    byteOffset = 0;
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff;
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000;
	  }
	  byteOffset = +byteOffset;  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1);
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1;
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0;
	    else return -1
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding);
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (internalIsBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF; // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1;
	  var arrLength = arr.length;
	  var valLength = val.length;

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase();
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2;
	      arrLength /= 2;
	      valLength /= 2;
	      byteOffset /= 2;
	    }
	  }

	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  var i;
	  if (dir) {
	    var foundIndex = -1;
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i;
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex;
	        foundIndex = -1;
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true;
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false;
	          break
	        }
	      }
	      if (found) return i
	    }
	  }

	  return -1
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	};

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	};

	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	};

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0;
	  var remaining = buf.length - offset;
	  if (!length) {
	    length = remaining;
	  } else {
	    length = Number(length);
	    if (length > remaining) {
	      length = remaining;
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length;
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2;
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16);
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed;
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8';
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset;
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0;
	    if (isFinite(length)) {
	      length = length | 0;
	      if (encoding === undefined) encoding = 'utf8';
	    } else {
	      encoding = length;
	      length = undefined;
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  var remaining = this.length - offset;
	  if (length === undefined || length > remaining) length = remaining;

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8';

	  var loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	};

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	};

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return fromByteArray(buf)
	  } else {
	    return fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end);
	  var res = [];

	  var i = start;
	  while (i < end) {
	    var firstByte = buf[i];
	    var codePoint = null;
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1;

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint;

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte;
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1];
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          fourthByte = buf[i + 3];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint;
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD;
	      bytesPerSequence = 1;
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000;
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
	      codePoint = 0xDC00 | codePoint & 0x3FF;
	    }

	    res.push(codePoint);
	    i += bytesPerSequence;
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000;

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length;
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = '';
	  var i = 0;
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    );
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = '';
	  end = Math.min(buf.length, end);

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F);
	  }
	  return ret
	}

	function latin1Slice (buf, start, end) {
	  var ret = '';
	  end = Math.min(buf.length, end);

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i]);
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length;

	  if (!start || start < 0) start = 0;
	  if (!end || end < 0 || end > len) end = len;

	  var out = '';
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i]);
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end);
	  var res = '';
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length;
	  start = ~~start;
	  end = end === undefined ? len : ~~end;

	  if (start < 0) {
	    start += len;
	    if (start < 0) start = 0;
	  } else if (start > len) {
	    start = len;
	  }

	  if (end < 0) {
	    end += len;
	    if (end < 0) end = 0;
	  } else if (end > len) {
	    end = len;
	  }

	  if (end < start) end = start;

	  var newBuf;
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end);
	    newBuf.__proto__ = Buffer.prototype;
	  } else {
	    var sliceLen = end - start;
	    newBuf = new Buffer(sliceLen, undefined);
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start];
	    }
	  }

	  return newBuf
	};

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var val = this[offset];
	  var mul = 1;
	  var i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }

	  return val
	};

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length);
	  }

	  var val = this[offset + --byteLength];
	  var mul = 1;
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul;
	  }

	  return val
	};

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  return this[offset]
	};

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return this[offset] | (this[offset + 1] << 8)
	};

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return (this[offset] << 8) | this[offset + 1]
	};

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	};

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	};

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var val = this[offset];
	  var mul = 1;
	  var i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var i = byteLength;
	  var mul = 1;
	  var val = this[offset + --i];
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	};

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  var val = this[offset] | (this[offset + 1] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  var val = this[offset + 1] | (this[offset] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	};

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	};

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return read(this, offset, true, 23, 4)
	};

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return read(this, offset, false, 23, 4)
	};

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return read(this, offset, true, 52, 8)
	};

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return read(this, offset, false, 52, 8)
	};

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  var mul = 1;
	  var i = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  var i = byteLength - 1;
	  var mul = 1;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1;
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8;
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	  } else {
	    objectWriteUInt16(this, value, offset, true);
	  }
	  return offset + 2
	};

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8);
	    this[offset + 1] = (value & 0xff);
	  } else {
	    objectWriteUInt16(this, value, offset, false);
	  }
	  return offset + 2
	};

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1;
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24);
	    this[offset + 2] = (value >>> 16);
	    this[offset + 1] = (value >>> 8);
	    this[offset] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, true);
	  }
	  return offset + 4
	};

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24);
	    this[offset + 1] = (value >>> 16);
	    this[offset + 2] = (value >>> 8);
	    this[offset + 3] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, false);
	  }
	  return offset + 4
	};

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  var i = 0;
	  var mul = 1;
	  var sub = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  var i = byteLength - 1;
	  var mul = 1;
	  var sub = 0;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
	  if (value < 0) value = 0xff + value + 1;
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	  } else {
	    objectWriteUInt16(this, value, offset, true);
	  }
	  return offset + 2
	};

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8);
	    this[offset + 1] = (value & 0xff);
	  } else {
	    objectWriteUInt16(this, value, offset, false);
	  }
	  return offset + 2
	};

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	    this[offset + 2] = (value >>> 16);
	    this[offset + 3] = (value >>> 24);
	  } else {
	    objectWriteUInt32(this, value, offset, true);
	  }
	  return offset + 4
	};

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  if (value < 0) value = 0xffffffff + value + 1;
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24);
	    this[offset + 1] = (value >>> 16);
	    this[offset + 2] = (value >>> 8);
	    this[offset + 3] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, false);
	  }
	  return offset + 4
	};

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
	  }
	  write(buf, value, offset, littleEndian, 23, 4);
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	};

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	};

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
	  }
	  write(buf, value, offset, littleEndian, 52, 8);
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	};

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	};

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0;
	  if (!end && end !== 0) end = this.length;
	  if (targetStart >= target.length) targetStart = target.length;
	  if (!targetStart) targetStart = 0;
	  if (end > 0 && end < start) end = start;

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length;
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start;
	  }

	  var len = end - start;
	  var i;

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start];
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start];
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    );
	  }

	  return len
	};

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start;
	      start = 0;
	      end = this.length;
	    } else if (typeof end === 'string') {
	      encoding = end;
	      end = this.length;
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0);
	      if (code < 256) {
	        val = code;
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255;
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0;
	  end = end === undefined ? this.length : end >>> 0;

	  if (!val) val = 0;

	  var i;
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val;
	    }
	  } else {
	    var bytes = internalIsBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString());
	    var len = bytes.length;
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len];
	    }
	  }

	  return this
	};

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '=';
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity;
	  var codePoint;
	  var length = string.length;
	  var leadSurrogate = null;
	  var bytes = [];

	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i);

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint;

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	        leadSurrogate = codePoint;
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	    }

	    leadSurrogate = null;

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint);
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = [];
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF);
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo;
	  var byteArray = [];
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i);
	    hi = c >> 8;
	    lo = c % 256;
	    byteArray.push(lo);
	    byteArray.push(hi);
	  }

	  return byteArray
	}


	function base64ToBytes (str) {
	  return toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i];
	  }
	  return i
	}

	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}


	// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
	// The _isBuffer check is for Safari 5-7 support, because it's missing
	// Object.prototype.constructor. Remove this eventually
	function isBuffer(obj) {
	  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
	}

	function isFastBuffer (obj) {
	  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	}

	// For Node v0.10 support. Remove this eventually.
	function isSlowBuffer (obj) {
	  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
	}

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
	});

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = { version: '2.6.5' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
	});
	var _core_1 = _core.version;

	var _aFunction = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

	// optional / simple context binding

	var _ctx = function (fn, that, length) {
	  _aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var _anObject = function (it) {
	  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

	var _fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var document$1 = _global.document;
	// typeof document.createElement is 'object' in old IE
	var is = _isObject(document$1) && _isObject(document$1.createElement);
	var _domCreate = function (it) {
	  return is ? document$1.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function () {
	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
	});

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive = function (it, S) {
	  if (!_isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var dP = Object.defineProperty;

	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  _anObject(O);
	  P = _toPrimitive(P, true);
	  _anObject(Attributes);
	  if (_ie8DomDefine) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var _objectDp = {
		f: f
	};

	var _propertyDesc = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var _hide = _descriptors ? function (object, key, value) {
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var IS_WRAP = type & $export.W;
	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
	  var expProto = exports[PROTOTYPE];
	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
	  var key, own, out;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if (own && _has(exports, key)) continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? _ctx(out, _global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function (C) {
	      var F = function (a, b, c) {
	        if (this instanceof C) {
	          switch (arguments.length) {
	            case 0: return new C();
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if (IS_PROTO) {
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	// 20.1.2.3 Number.isInteger(number)

	var floor = Math.floor;
	var _isInteger = function isInteger(it) {
	  return !_isObject(it) && isFinite(it) && floor(it) === it;
	};

	// 20.1.2.3 Number.isInteger(number)


	_export(_export.S, 'Number', { isInteger: _isInteger });

	var isInteger = _core.Number.isInteger;

	var isInteger$1 = createCommonjsModule(function (module) {
	module.exports = { "default": isInteger, __esModule: true };
	});

	var _Number$isInteger = unwrapExports(isInteger$1);

	var runtime = createCommonjsModule(function (module) {
	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	!(function(global) {

	  var Op = Object.prototype;
	  var hasOwn = Op.hasOwnProperty;
	  var undefined$1; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
	  var runtime = global.regeneratorRuntime;
	  if (runtime) {
	    {
	      // If regeneratorRuntime is defined globally and we're in a module,
	      // make the exports object identical to regeneratorRuntime.
	      module.exports = runtime;
	    }
	    // Don't bother evaluating the rest of this file if the runtime was
	    // already defined globally.
	    return;
	  }

	  // Define the runtime globally (as expected by generated code) as either
	  // module.exports (if we're in a module) or a new, empty object.
	  runtime = global.regeneratorRuntime = module.exports;

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	    var generator = Object.create(protoGenerator.prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  runtime.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  // This is a polyfill for %IteratorPrototype% for environments that
	  // don't natively support it.
	  var IteratorPrototype = {};
	  IteratorPrototype[iteratorSymbol] = function () {
	    return this;
	  };

	  var getProto = Object.getPrototypeOf;
	  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	  if (NativeIteratorPrototype &&
	      NativeIteratorPrototype !== Op &&
	      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	    // This environment has a native %IteratorPrototype%; use it instead
	    // of the polyfill.
	    IteratorPrototype = NativeIteratorPrototype;
	  }

	  var Gp = GeneratorFunctionPrototype.prototype =
	    Generator.prototype = Object.create(IteratorPrototype);
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunctionPrototype[toStringTagSymbol] =
	    GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      prototype[method] = function(arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  runtime.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  runtime.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      if (!(toStringTagSymbol in genFun)) {
	        genFun[toStringTagSymbol] = "GeneratorFunction";
	      }
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `hasOwn.call(value, "__await")` to determine if the yielded value is
	  // meant to be awaited.
	  runtime.awrap = function(arg) {
	    return { __await: arg };
	  };

	  function AsyncIterator(generator) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value &&
	            typeof value === "object" &&
	            hasOwn.call(value, "__await")) {
	          return Promise.resolve(value.__await).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return Promise.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration. If the Promise is rejected, however, the
	          // result for this iteration will be rejected with the same
	          // reason. Note that rejections of yielded Promises are not
	          // thrown back into the generator function, as is the case
	          // when an awaited Promise is rejected. This difference in
	          // behavior between yield and await is important, because it
	          // allows the consumer to decide what to do with the yielded
	          // rejection (swallow it and continue, manually .throw it back
	          // into the generator, abandon iteration, whatever). With
	          // await, by contrast, there is no opportunity to examine the
	          // rejection reason outside the generator function, so the
	          // only option is to throw it from the await expression, and
	          // let the generator function handle the exception.
	          result.value = unwrapped;
	          resolve(result);
	        }, reject);
	      }
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new Promise(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);
	  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	    return this;
	  };
	  runtime.AsyncIterator = AsyncIterator;

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList)
	    );

	    return runtime.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      context.method = method;
	      context.arg = arg;

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var delegateResult = maybeInvokeDelegate(delegate, context);
	          if (delegateResult) {
	            if (delegateResult === ContinueSentinel) continue;
	            return delegateResult;
	          }
	        }

	        if (context.method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = context.arg;

	        } else if (context.method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw context.arg;
	          }

	          context.dispatchException(context.arg);

	        } else if (context.method === "return") {
	          context.abrupt("return", context.arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          if (record.arg === ContinueSentinel) {
	            continue;
	          }

	          return {
	            value: record.arg,
	            done: context.done
	          };

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(context.arg) call above.
	          context.method = "throw";
	          context.arg = record.arg;
	        }
	      }
	    };
	  }

	  // Call delegate.iterator[context.method](context.arg) and handle the
	  // result, either by returning a { value, done } result from the
	  // delegate iterator, or by modifying context.method and context.arg,
	  // setting context.delegate to null, and returning the ContinueSentinel.
	  function maybeInvokeDelegate(delegate, context) {
	    var method = delegate.iterator[context.method];
	    if (method === undefined$1) {
	      // A .throw or .return when the delegate iterator has no .throw
	      // method always terminates the yield* loop.
	      context.delegate = null;

	      if (context.method === "throw") {
	        if (delegate.iterator.return) {
	          // If the delegate iterator has a return method, give it a
	          // chance to clean up.
	          context.method = "return";
	          context.arg = undefined$1;
	          maybeInvokeDelegate(delegate, context);

	          if (context.method === "throw") {
	            // If maybeInvokeDelegate(context) changed context.method from
	            // "return" to "throw", let that override the TypeError below.
	            return ContinueSentinel;
	          }
	        }

	        context.method = "throw";
	        context.arg = new TypeError(
	          "The iterator does not provide a 'throw' method");
	      }

	      return ContinueSentinel;
	    }

	    var record = tryCatch(method, delegate.iterator, context.arg);

	    if (record.type === "throw") {
	      context.method = "throw";
	      context.arg = record.arg;
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    var info = record.arg;

	    if (! info) {
	      context.method = "throw";
	      context.arg = new TypeError("iterator result is not an object");
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    if (info.done) {
	      // Assign the result of the finished delegate to the temporary
	      // variable specified by delegate.resultName (see delegateYield).
	      context[delegate.resultName] = info.value;

	      // Resume execution at the desired location (see delegateYield).
	      context.next = delegate.nextLoc;

	      // If context.method was "throw" but the delegate handled the
	      // exception, let the outer generator proceed normally. If
	      // context.method was "next", forget context.arg since it has been
	      // "consumed" by the delegate iterator. If context.method was
	      // "return", allow the original .return call to continue in the
	      // outer generator.
	      if (context.method !== "return") {
	        context.method = "next";
	        context.arg = undefined$1;
	      }

	    } else {
	      // Re-yield the result returned by the delegate method.
	      return info;
	    }

	    // The delegate iterator is finished, so forget it and continue with
	    // the outer generator.
	    context.delegate = null;
	    return ContinueSentinel;
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[toStringTagSymbol] = "Generator";

	  // A Generator should always return itself as the iterator object when the
	  // @@iterator function is called on it. Some browsers' implementations of the
	  // iterator prototype chain incorrectly implement this, causing the Generator
	  // object to not be returned from this call. This ensures that doesn't happen.
	  // See https://github.com/facebook/regenerator/issues/274 for more details.
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  runtime.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined$1;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  runtime.values = values;

	  function doneResult() {
	    return { value: undefined$1, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined$1;
	      this.done = false;
	      this.delegate = null;

	      this.method = "next";
	      this.arg = undefined$1;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined$1;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;

	        if (caught) {
	          // If the dispatched exception was caught by a catch block,
	          // then let that catch block handle the exception normally.
	          context.method = "next";
	          context.arg = undefined$1;
	        }

	        return !! caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.method = "next";
	        this.next = finallyEntry.finallyLoc;
	        return ContinueSentinel;
	      }

	      return this.complete(record);
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = this.arg = record.arg;
	        this.method = "return";
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }

	      return ContinueSentinel;
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      if (this.method === "next") {
	        // Deliberately forget the last sent value so that we don't
	        // accidentally pass it on to the delegate.
	        this.arg = undefined$1;
	      }

	      return ContinueSentinel;
	    }
	  };
	})(
	  // In sloppy mode, unbound `this` refers to the global object, fallback to
	  // Function constructor if we're in global strict mode. That is sadly a form
	  // of indirect eval which violates Content Security Policy.
	  (function() { return this })() || Function("return this")()
	);
	});

	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	// This method of obtaining a reference to the global object needs to be
	// kept identical to the way it is obtained in runtime.js
	var g = (function() { return this })() || Function("return this")();

	// Use `getOwnPropertyNames` because not all browsers support calling
	// `hasOwnProperty` on the global `self` object in a worker. See #183.
	var hadRuntime = g.regeneratorRuntime &&
	  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

	// Save the old regeneratorRuntime in case it needs to be restored later.
	var oldRuntime = hadRuntime && g.regeneratorRuntime;

	// Force reevalutation of runtime.js.
	g.regeneratorRuntime = undefined;

	var runtimeModule = runtime;

	if (hadRuntime) {
	  // Restore the original runtime.
	  g.regeneratorRuntime = oldRuntime;
	} else {
	  // Remove the global property added by runtime.js.
	  try {
	    delete g.regeneratorRuntime;
	  } catch(e) {
	    g.regeneratorRuntime = undefined;
	  }
	}

	var regenerator = runtimeModule;

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor$1 = Math.floor;
	var _toInteger = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor$1 : ceil)(it);
	};

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};

	// true  -> String#at
	// false -> String#codePointAt
	var _stringAt = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(_defined(that));
	    var i = _toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

	var _library = true;

	var _redefine = _hide;

	var _iterators = {};

	var toString$1 = {}.toString;

	var _cof = function (it) {
	  return toString$1.call(it).slice(8, -1);
	};

	// fallback for non-array-like ES3 and non-enumerable old V8 strings

	// eslint-disable-next-line no-prototype-builtins
	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return _cof(it) == 'String' ? it.split('') : Object(it);
	};

	// to indexed object, toObject with fallback for non-array-like ES3 strings


	var _toIobject = function (it) {
	  return _iobject(_defined(it));
	};

	// 7.1.15 ToLength

	var min = Math.min;
	var _toLength = function (it) {
	  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;
	var _toAbsoluteIndex = function (index, length) {
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min$1(index, length);
	};

	// false -> Array#indexOf
	// true  -> Array#includes



	var _arrayIncludes = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = _toIobject($this);
	    var length = _toLength(O.length);
	    var index = _toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var _shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = _global[SHARED] || (_global[SHARED] = {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: _core.version,
	  mode: 'pure',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var px = Math.random();
	var _uid = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

	var shared = _shared('keys');

	var _sharedKey = function (key) {
	  return shared[key] || (shared[key] = _uid(key));
	};

	var arrayIndexOf$1 = _arrayIncludes(false);
	var IE_PROTO = _sharedKey('IE_PROTO');

	var _objectKeysInternal = function (object, names) {
	  var O = _toIobject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (_has(O, key = names[i++])) {
	    ~arrayIndexOf$1(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE 8- don't enum bug keys
	var _enumBugKeys = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)



	var _objectKeys = Object.keys || function keys(O) {
	  return _objectKeysInternal(O, _enumBugKeys);
	};

	var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  _anObject(O);
	  var keys = _objectKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

	var document$2 = _global.document;
	var _html = document$2 && document$2.documentElement;

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



	var IE_PROTO$1 = _sharedKey('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE$1 = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = _domCreate('iframe');
	  var i = _enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  _html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
	  return createDict();
	};

	var _objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE$1] = _anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE$1] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : _objectDps(result, Properties);
	};

	var _wks = createCommonjsModule(function (module) {
	var store = _shared('wks');

	var Symbol = _global.Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
	};

	$exports.store = store;
	});

	var def = _objectDp.f;

	var TAG = _wks('toStringTag');

	var _setToStringTag = function (it, tag, stat) {
	  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
	};

	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

	var _iterCreate = function (Constructor, NAME, next) {
	  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
	  _setToStringTag(Constructor, NAME + ' Iterator');
	};

	// 7.1.13 ToObject(argument)

	var _toObject = function (it) {
	  return Object(_defined(it));
	};

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


	var IE_PROTO$2 = _sharedKey('IE_PROTO');
	var ObjectProto = Object.prototype;

	var _objectGpo = Object.getPrototypeOf || function (O) {
	  O = _toObject(O);
	  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

	var ITERATOR = _wks('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  _iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      _setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (!_library && typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
	    _hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  _iterators[NAME] = $default;
	  _iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) _redefine(proto, key, methods[key]);
	    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

	var $at = _stringAt(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	_iterDefine(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var index = this._i;
	  var point;
	  if (index >= O.length) return { value: undefined, done: true };
	  point = $at(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});

	var _iterStep = function (done, value) {
	  return { value: value, done: !!done };
	};

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
	  this._t = _toIobject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return _iterStep(1);
	  }
	  if (kind == 'keys') return _iterStep(0, index);
	  if (kind == 'values') return _iterStep(0, O[index]);
	  return _iterStep(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	_iterators.Arguments = _iterators.Array;

	var TO_STRING_TAG = _wks('toStringTag');

	var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
	  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
	  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
	  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
	  'TextTrackList,TouchList').split(',');

	for (var i = 0; i < DOMIterables.length; i++) {
	  var NAME = DOMIterables[i];
	  var Collection = _global[NAME];
	  var proto = Collection && Collection.prototype;
	  if (proto && !proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
	  _iterators[NAME] = _iterators.Array;
	}

	// getting tag from 19.1.3.6 Object.prototype.toString()

	var TAG$1 = _wks('toStringTag');
	// ES3 wrong here
	var ARG = _cof(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (e) { /* empty */ }
	};

	var _classof = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
	    // builtinTag case
	    : ARG ? _cof(O)
	    // ES3 arguments fallback
	    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

	var _anInstance = function (it, Constructor, name, forbiddenField) {
	  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

	// call something on iterator step with safe closing on error

	var _iterCall = function (iterator, fn, value, entries) {
	  try {
	    return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (e) {
	    var ret = iterator['return'];
	    if (ret !== undefined) _anObject(ret.call(iterator));
	    throw e;
	  }
	};

	// check on default Array iterator

	var ITERATOR$1 = _wks('iterator');
	var ArrayProto = Array.prototype;

	var _isArrayIter = function (it) {
	  return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR$1] === it);
	};

	var ITERATOR$2 = _wks('iterator');

	var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$2]
	    || it['@@iterator']
	    || _iterators[_classof(it)];
	};

	var _forOf = createCommonjsModule(function (module) {
	var BREAK = {};
	var RETURN = {};
	var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
	  var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
	  var f = _ctx(fn, that, entries ? 2 : 1);
	  var index = 0;
	  var length, step, iterator, result;
	  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
	    result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if (result === BREAK || result === RETURN) return result;
	  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
	    result = _iterCall(iterator, f, step.value, entries);
	    if (result === BREAK || result === RETURN) return result;
	  }
	};
	exports.BREAK = BREAK;
	exports.RETURN = RETURN;
	});

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)


	var SPECIES = _wks('species');
	var _speciesConstructor = function (O, D) {
	  var C = _anObject(O).constructor;
	  var S;
	  return C === undefined || (S = _anObject(C)[SPECIES]) == undefined ? D : _aFunction(S);
	};

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	var _invoke = function (fn, args, that) {
	  var un = that === undefined;
	  switch (args.length) {
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return fn.apply(that, args);
	};

	var process = _global.process;
	var setTask = _global.setImmediate;
	var clearTask = _global.clearImmediate;
	var MessageChannel = _global.MessageChannel;
	var Dispatch = _global.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;
	var run = function () {
	  var id = +this;
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function (event) {
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!setTask || !clearTask) {
	  setTask = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      _invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (_cof(process) == 'process') {
	    defer = function (id) {
	      process.nextTick(_ctx(run, id, 1));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(_ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if (MessageChannel) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = _ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
	    defer = function (id) {
	      _global.postMessage(id + '', '*');
	    };
	    _global.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in _domCreate('script')) {
	    defer = function (id) {
	      _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
	        _html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(_ctx(run, id, 1), 0);
	    };
	  }
	}
	var _task = {
	  set: setTask,
	  clear: clearTask
	};

	var macrotask = _task.set;
	var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
	var process$1 = _global.process;
	var Promise$1 = _global.Promise;
	var isNode = _cof(process$1) == 'process';

	var _microtask = function () {
	  var head, last, notify;

	  var flush = function () {
	    var parent, fn;
	    if (isNode && (parent = process$1.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (e) {
	        if (head) notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // Node.js
	  if (isNode) {
	    notify = function () {
	      process$1.nextTick(flush);
	    };
	  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
	  } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
	    var toggle = true;
	    var node = document.createTextNode('');
	    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    var promise = Promise$1.resolve(undefined);
	    notify = function () {
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(_global, flush);
	    };
	  }

	  return function (fn) {
	    var task = { fn: fn, next: undefined };
	    if (last) last.next = task;
	    if (!head) {
	      head = task;
	      notify();
	    } last = task;
	  };
	};

	// 25.4.1.5 NewPromiseCapability(C)


	function PromiseCapability(C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = _aFunction(resolve);
	  this.reject = _aFunction(reject);
	}

	var f$1 = function (C) {
	  return new PromiseCapability(C);
	};

	var _newPromiseCapability = {
		f: f$1
	};

	var _perform = function (exec) {
	  try {
	    return { e: false, v: exec() };
	  } catch (e) {
	    return { e: true, v: e };
	  }
	};

	var navigator$1 = _global.navigator;

	var _userAgent = navigator$1 && navigator$1.userAgent || '';

	var _promiseResolve = function (C, x) {
	  _anObject(C);
	  if (_isObject(x) && x.constructor === C) return x;
	  var promiseCapability = _newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var _redefineAll = function (target, src, safe) {
	  for (var key in src) {
	    if (safe && target[key]) target[key] = src[key];
	    else _hide(target, key, src[key]);
	  } return target;
	};

	var SPECIES$1 = _wks('species');

	var _setSpecies = function (KEY) {
	  var C = typeof _core[KEY] == 'function' ? _core[KEY] : _global[KEY];
	  if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
	    configurable: true,
	    get: function () { return this; }
	  });
	};

	var ITERATOR$3 = _wks('iterator');
	var SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR$3]();
	  riter['return'] = function () { SAFE_CLOSING = true; };
	} catch (e) { /* empty */ }

	var _iterDetect = function (exec, skipClosing) {
	  if (!skipClosing && !SAFE_CLOSING) return false;
	  var safe = false;
	  try {
	    var arr = [7];
	    var iter = arr[ITERATOR$3]();
	    iter.next = function () { return { done: safe = true }; };
	    arr[ITERATOR$3] = function () { return iter; };
	    exec(arr);
	  } catch (e) { /* empty */ }
	  return safe;
	};

	var task = _task.set;
	var microtask = _microtask();




	var PROMISE = 'Promise';
	var TypeError$1 = _global.TypeError;
	var process$2 = _global.process;
	var versions = process$2 && process$2.versions;
	var v8 = versions && versions.v8 || '';
	var $Promise = _global[PROMISE];
	var isNode$1 = _classof(process$2) == 'process';
	var empty = function () { /* empty */ };
	var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
	var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

	var USE_NATIVE = !!function () {
	  try {
	    // correct subclassing with @@species support
	    var promise = $Promise.resolve(1);
	    var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
	      exec(empty, empty);
	    };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode$1 || typeof PromiseRejectionEvent == 'function')
	      && promise.then(empty) instanceof FakePromise
	      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	      // we can't detect it synchronously, so just check versions
	      && v8.indexOf('6.6') !== 0
	      && _userAgent.indexOf('Chrome/66') === -1;
	  } catch (e) { /* empty */ }
	}();

	// helpers
	var isThenable = function (it) {
	  var then;
	  return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify = function (promise, isReject) {
	  if (promise._n) return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function () {
	    var value = promise._v;
	    var ok = promise._s == 1;
	    var i = 0;
	    var run = function (reaction) {
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (promise._h == 2) onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value); // may throw
	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }
	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (e) {
	        if (domain && !exited) domain.exit();
	        reject(e);
	      }
	    };
	    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if (isReject && !promise._h) onUnhandled(promise);
	  });
	};
	var onUnhandled = function (promise) {
	  task.call(_global, function () {
	    var value = promise._v;
	    var unhandled = isUnhandled(promise);
	    var result, handler, console;
	    if (unhandled) {
	      result = _perform(function () {
	        if (isNode$1) {
	          process$2.emit('unhandledRejection', value, promise);
	        } else if (handler = _global.onunhandledrejection) {
	          handler({ promise: promise, reason: value });
	        } else if ((console = _global.console) && console.error) {
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if (unhandled && result.e) throw result.v;
	  });
	};
	var isUnhandled = function (promise) {
	  return promise._h !== 1 && (promise._a || promise._c).length === 0;
	};
	var onHandleUnhandled = function (promise) {
	  task.call(_global, function () {
	    var handler;
	    if (isNode$1) {
	      process$2.emit('rejectionHandled', promise);
	    } else if (handler = _global.onrejectionhandled) {
	      handler({ promise: promise, reason: promise._v });
	    }
	  });
	};
	var $reject = function (value) {
	  var promise = this;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if (!promise._a) promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function (value) {
	  var promise = this;
	  var then;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    if (then = isThenable(value)) {
	      microtask(function () {
	        var wrapper = { _w: promise, _d: false }; // wrap
	        try {
	          then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
	        } catch (e) {
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch (e) {
	    $reject.call({ _w: promise, _d: false }, e); // wrap
	  }
	};

	// constructor polyfill
	if (!USE_NATIVE) {
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor) {
	    _anInstance(this, $Promise, PROMISE, '_h');
	    _aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
	    } catch (err) {
	      $reject.call(this, err);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = _redefineAll($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected) {
	      var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode$1 ? process$2.domain : undefined;
	      this._c.push(reaction);
	      if (this._a) this._a.push(reaction);
	      if (this._s) notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    this.promise = promise;
	    this.resolve = _ctx($resolve, promise, 1);
	    this.reject = _ctx($reject, promise, 1);
	  };
	  _newPromiseCapability.f = newPromiseCapability = function (C) {
	    return C === $Promise || C === Wrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
	_setToStringTag($Promise, PROMISE);
	_setSpecies(PROMISE);
	Wrapper = _core[PROMISE];

	// statics
	_export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r) {
	    var capability = newPromiseCapability(this);
	    var $$reject = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	_export(_export.S + _export.F * (_library || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x) {
	    return _promiseResolve(_library && this === Wrapper ? $Promise : this, x);
	  }
	});
	_export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = _perform(function () {
	      var values = [];
	      var index = 0;
	      var remaining = 1;
	      _forOf(iterable, false, function (promise) {
	        var $index = index++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var reject = capability.reject;
	    var result = _perform(function () {
	      _forOf(iterable, false, function (promise) {
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  }
	});

	_export(_export.P + _export.R, 'Promise', { 'finally': function (onFinally) {
	  var C = _speciesConstructor(this, _core.Promise || _global.Promise);
	  var isFunction = typeof onFinally == 'function';
	  return this.then(
	    isFunction ? function (x) {
	      return _promiseResolve(C, onFinally()).then(function () { return x; });
	    } : onFinally,
	    isFunction ? function (e) {
	      return _promiseResolve(C, onFinally()).then(function () { throw e; });
	    } : onFinally
	  );
	} });

	// https://github.com/tc39/proposal-promise-try




	_export(_export.S, 'Promise', { 'try': function (callbackfn) {
	  var promiseCapability = _newPromiseCapability.f(this);
	  var result = _perform(callbackfn);
	  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
	  return promiseCapability.promise;
	} });

	var promise = _core.Promise;

	var promise$1 = createCommonjsModule(function (module) {
	module.exports = { "default": promise, __esModule: true };
	});

	var _Promise = unwrapExports(promise$1);

	var asyncToGenerator = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var _promise2 = _interopRequireDefault(promise$1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (fn) {
	  return function () {
	    var gen = fn.apply(this, arguments);
	    return new _promise2.default(function (resolve, reject) {
	      function step(key, arg) {
	        try {
	          var info = gen[key](arg);
	          var value = info.value;
	        } catch (error) {
	          reject(error);
	          return;
	        }

	        if (info.done) {
	          resolve(value);
	        } else {
	          return _promise2.default.resolve(value).then(function (value) {
	            step("next", value);
	          }, function (err) {
	            step("throw", err);
	          });
	        }
	      }

	      return step("next");
	    });
	  };
	};
	});

	var _asyncToGenerator = unwrapExports(asyncToGenerator);

	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	_export(_export.S + _export.F * !_descriptors, 'Object', { defineProperty: _objectDp.f });

	var $Object = _core.Object;
	var defineProperty = function defineProperty(it, key, desc) {
	  return $Object.defineProperty(it, key, desc);
	};

	var defineProperty$1 = createCommonjsModule(function (module) {
	module.exports = { "default": defineProperty, __esModule: true };
	});

	var _Object$defineProperty = unwrapExports(defineProperty$1);

	var createClass = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var _defineProperty2 = _interopRequireDefault(defineProperty$1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();
	});

	var _createClass = unwrapExports(createClass);

	/**
	 * Expose `isUrl`.
	 */

	var isUrl_1 = isUrl;

	/**
	 * RegExps.
	 * A URL must match #1 and then at least one of #2/#3.
	 * Use two levels of REs to avoid REDOS.
	 */

	var protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;

	var localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
	var nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;

	/**
	 * Loosely validate a URL `string`.
	 *
	 * @param {String} string
	 * @return {Boolean}
	 */

	function isUrl(string){
	  if (typeof string !== 'string') {
	    return false;
	  }

	  var match = string.match(protocolAndDomainRE);
	  if (!match) {
	    return false;
	  }

	  var everythingAfterProtocol = match[1];
	  if (!everythingAfterProtocol) {
	    return false;
	  }

	  if (localhostDomainRE.test(everythingAfterProtocol) ||
	      nonLocalhostDomainRE.test(everythingAfterProtocol)) {
	    return true;
	  }

	  return false;
	}

	var _meta = createCommonjsModule(function (module) {
	var META = _uid('meta');


	var setDesc = _objectDp.f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !_fails(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
	  setDesc(it, META, { value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  } });
	};
	var fastKey = function (it, create) {
	  // return primitive with prefix
	  if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function (it, create) {
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};
	});
	var _meta_1 = _meta.KEY;
	var _meta_2 = _meta.NEED;
	var _meta_3 = _meta.fastKey;
	var _meta_4 = _meta.getWeak;
	var _meta_5 = _meta.onFreeze;

	// most Object methods by ES6 should accept primitives



	var _objectSap = function (KEY, exec) {
	  var fn = (_core.Object || {})[KEY] || Object[KEY];
	  var exp = {};
	  exp[KEY] = exec(fn);
	  _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
	};

	// 19.1.2.5 Object.freeze(O)

	var meta = _meta.onFreeze;

	_objectSap('freeze', function ($freeze) {
	  return function freeze(it) {
	    return $freeze && _isObject(it) ? $freeze(meta(it)) : it;
	  };
	});

	var freeze = _core.Object.freeze;

	var freeze$1 = createCommonjsModule(function (module) {
	module.exports = { "default": freeze, __esModule: true };
	});

	var _Object$freeze = unwrapExports(freeze$1);

	var constants = _Object$freeze({
	  GET_METHOD: 'GET',
	  POST_METHOD: 'POST',
	  CHAINS_URL: 'chains',
	  SEARCH_URL: 'search',
	  ENTRIES_URL: 'entries',
	  FIRST_URL: 'first',
	  LAST_URL: 'last',
	  IDENTITIES_URL: 'identities',
	  KEYS_STRING: 'keys',
	  UTF8_ENCODE: 'utf-8',
	  BASE64_ENCODE: 'base64'
	});

	// 19.1.2.14 Object.keys(O)



	_objectSap('keys', function () {
	  return function keys(it) {
	    return _objectKeys(_toObject(it));
	  };
	});

	var keys = _core.Object.keys;

	var keys$1 = createCommonjsModule(function (module) {
	module.exports = { "default": keys, __esModule: true };
	});

	var _Object$keys = unwrapExports(keys$1);

	var bind = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};

	/*!
	 * Determine if an object is a Buffer
	 *
	 * @author   Feross Aboukhadijeh <https://feross.org>
	 * @license  MIT
	 */

	// The _isBuffer check is for Safari 5-7 support, because it's missing
	// Object.prototype.constructor. Remove this eventually
	var isBuffer_1 = function (obj) {
	  return obj != null && (isBuffer$1(obj) || isSlowBuffer$1(obj) || !!obj._isBuffer)
	};

	function isBuffer$1 (obj) {
	  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	}

	// For Node v0.10 support. Remove this eventually.
	function isSlowBuffer$1 (obj) {
	  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer$1(obj.slice(0, 0))
	}

	/*global toString:true*/

	// utils is a library of generic helper functions non-specific to axios

	var toString$2 = Object.prototype.toString;

	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray$1(val) {
	  return toString$2.call(val) === '[object Array]';
	}

	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString$2.call(val) === '[object ArrayBuffer]';
	}

	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}

	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
	  }
	  return result;
	}

	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}

	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}

	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}

	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}

	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString$2.call(val) === '[object Date]';
	}

	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString$2.call(val) === '[object File]';
	}

	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString$2.call(val) === '[object Blob]';
	}

	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString$2.call(val) === '[object Function]';
	}

	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}

	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
	  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}

	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}

	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  navigator.product -> 'ReactNative'
	 */
	function isStandardBrowserEnv() {
	  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
	    return false;
	  }
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined'
	  );
	}

	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }

	  // Force an array if not already something iterable
	  if (typeof obj !== 'object') {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }

	  if (isArray$1(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}

	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (typeof result[key] === 'object' && typeof val === 'object') {
	      result[key] = merge(result[key], val);
	    } else {
	      result[key] = val;
	    }
	  }

	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}

	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}

	var utils = {
	  isArray: isArray$1,
	  isArrayBuffer: isArrayBuffer,
	  isBuffer: isBuffer_1,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim
	};

	// shim for using process in browser
	// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	var cachedSetTimeout = defaultSetTimout;
	var cachedClearTimeout = defaultClearTimeout;
	if (typeof global$1.setTimeout === 'function') {
	    cachedSetTimeout = setTimeout;
	}
	if (typeof global$1.clearTimeout === 'function') {
	    cachedClearTimeout = clearTimeout;
	}

	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue$1 = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue$1 = currentQueue.concat(queue$1);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue$1.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue$1.length;
	    while(len) {
	        currentQueue = queue$1;
	        queue$1 = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue$1.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	function nextTick(fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue$1.push(new Item(fun, args));
	    if (queue$1.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	}
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	var title = 'browser';
	var platform = 'browser';
	var browser = true;
	var env = {};
	var argv = [];
	var version = ''; // empty string to avoid regexp issues
	var versions$1 = {};
	var release = {};
	var config = {};

	function noop() {}

	var on = noop;
	var addListener = noop;
	var once = noop;
	var off = noop;
	var removeListener = noop;
	var removeAllListeners = noop;
	var emit = noop;

	function binding(name) {
	    throw new Error('process.binding is not supported');
	}

	function cwd () { return '/' }
	function chdir (dir) {
	    throw new Error('process.chdir is not supported');
	}function umask() { return 0; }

	// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
	var performance = global$1.performance || {};
	var performanceNow =
	  performance.now        ||
	  performance.mozNow     ||
	  performance.msNow      ||
	  performance.oNow       ||
	  performance.webkitNow  ||
	  function(){ return (new Date()).getTime() };

	// generate timestamp or delta
	// see http://nodejs.org/api/process.html#process_process_hrtime
	function hrtime(previousTimestamp){
	  var clocktime = performanceNow.call(performance)*1e-3;
	  var seconds = Math.floor(clocktime);
	  var nanoseconds = Math.floor((clocktime%1)*1e9);
	  if (previousTimestamp) {
	    seconds = seconds - previousTimestamp[0];
	    nanoseconds = nanoseconds - previousTimestamp[1];
	    if (nanoseconds<0) {
	      seconds--;
	      nanoseconds += 1e9;
	    }
	  }
	  return [seconds,nanoseconds]
	}

	var startTime = new Date();
	function uptime() {
	  var currentTime = new Date();
	  var dif = currentTime - startTime;
	  return dif / 1000;
	}

	var process$3 = {
	  nextTick: nextTick,
	  title: title,
	  browser: browser,
	  env: env,
	  argv: argv,
	  version: version,
	  versions: versions$1,
	  on: on,
	  addListener: addListener,
	  once: once,
	  off: off,
	  removeListener: removeListener,
	  removeAllListeners: removeAllListeners,
	  emit: emit,
	  binding: binding,
	  cwd: cwd,
	  chdir: chdir,
	  umask: umask,
	  hrtime: hrtime,
	  platform: platform,
	  release: release,
	  config: config,
	  uptime: uptime
	};

	var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};

	/**
	 * Update an Error with the specified config, error code, and response.
	 *
	 * @param {Error} error The error to update.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 * @param {Object} [request] The request.
	 * @param {Object} [response] The response.
	 * @returns {Error} The error.
	 */
	var enhanceError = function enhanceError(error, config, code, request, response) {
	  error.config = config;
	  if (code) {
	    error.code = code;
	  }
	  error.request = request;
	  error.response = response;
	  return error;
	};

	/**
	 * Create an Error with the specified message, config, error code, request and response.
	 *
	 * @param {string} message The error message.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 * @param {Object} [request] The request.
	 * @param {Object} [response] The response.
	 * @returns {Error} The created error.
	 */
	var createError = function createError(message, config, code, request, response) {
	  var error = new Error(message);
	  return enhanceError(error, config, code, request, response);
	};

	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	var settle = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  // Note: status is not exposed by XDomainRequest
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(createError(
	      'Request failed with status code ' + response.status,
	      response.config,
	      null,
	      response.request,
	      response
	    ));
	  }
	};

	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%40/gi, '@').
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}

	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	var buildURL = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }

	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];

	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }

	      if (utils.isArray(val)) {
	        key = key + '[]';
	      } else {
	        val = [val];
	      }

	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });

	    serializedParams = parts.join('&');
	  }

	  if (serializedParams) {
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }

	  return url;
	};

	// Headers whose duplicates are ignored by node
	// c.f. https://nodejs.org/api/http.html#http_message_headers
	var ignoreDuplicateOf = [
	  'age', 'authorization', 'content-length', 'content-type', 'etag',
	  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
	  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
	  'referer', 'retry-after', 'user-agent'
	];

	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	var parseHeaders = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;

	  if (!headers) { return parsed; }

	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));

	    if (key) {
	      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
	        return;
	      }
	      if (key === 'set-cookie') {
	        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
	      } else {
	        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	      }
	    }
	  });

	  return parsed;
	};

	var isURLSameOrigin = (
	  utils.isStandardBrowserEnv() ?

	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	  (function standardBrowserEnv() {
	    var msie = /(msie|trident)/i.test(navigator.userAgent);
	    var urlParsingNode = document.createElement('a');
	    var originURL;

	    /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	    function resolveURL(url) {
	      var href = url;

	      if (msie) {
	        // IE needs attribute set twice to normalize properties
	        urlParsingNode.setAttribute('href', href);
	        href = urlParsingNode.href;
	      }

	      urlParsingNode.setAttribute('href', href);

	      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	      return {
	        href: urlParsingNode.href,
	        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	        host: urlParsingNode.host,
	        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	        hostname: urlParsingNode.hostname,
	        port: urlParsingNode.port,
	        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	                  urlParsingNode.pathname :
	                  '/' + urlParsingNode.pathname
	      };
	    }

	    originURL = resolveURL(window.location.href);

	    /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	    return function isURLSameOrigin(requestURL) {
	      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	      return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	    };
	  })() :

	  // Non standard browser envs (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return function isURLSameOrigin() {
	      return true;
	    };
	  })()
	);

	// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	function E() {
	  this.message = 'String contains an invalid character';
	}
	E.prototype = new Error;
	E.prototype.code = 5;
	E.prototype.name = 'InvalidCharacterError';

	function btoa(input) {
	  var str = String(input);
	  var output = '';
	  for (
	    // initialize result and counter
	    var block, charCode, idx = 0, map = chars;
	    // if the next str index does not exist:
	    //   change the mapping table to "="
	    //   check if d has no fractional digits
	    str.charAt(idx | 0) || (map = '=', idx % 1);
	    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	  ) {
	    charCode = str.charCodeAt(idx += 3 / 4);
	    if (charCode > 0xFF) {
	      throw new E();
	    }
	    block = block << 8 | charCode;
	  }
	  return output;
	}

	var btoa_1 = btoa;

	var cookies = (
	  utils.isStandardBrowserEnv() ?

	  // Standard browser envs support document.cookie
	  (function standardBrowserEnv() {
	    return {
	      write: function write(name, value, expires, path, domain, secure) {
	        var cookie = [];
	        cookie.push(name + '=' + encodeURIComponent(value));

	        if (utils.isNumber(expires)) {
	          cookie.push('expires=' + new Date(expires).toGMTString());
	        }

	        if (utils.isString(path)) {
	          cookie.push('path=' + path);
	        }

	        if (utils.isString(domain)) {
	          cookie.push('domain=' + domain);
	        }

	        if (secure === true) {
	          cookie.push('secure');
	        }

	        document.cookie = cookie.join('; ');
	      },

	      read: function read(name) {
	        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	        return (match ? decodeURIComponent(match[3]) : null);
	      },

	      remove: function remove(name) {
	        this.write(name, '', Date.now() - 86400000);
	      }
	    };
	  })() :

	  // Non standard browser env (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return {
	      write: function write() {},
	      read: function read() { return null; },
	      remove: function remove() {}
	    };
	  })()
	);

	var btoa$1 = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || btoa_1;

	var xhr = function xhrAdapter(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    var requestData = config.data;
	    var requestHeaders = config.headers;

	    if (utils.isFormData(requestData)) {
	      delete requestHeaders['Content-Type']; // Let the browser set it
	    }

	    var request = new XMLHttpRequest();
	    var loadEvent = 'onreadystatechange';
	    var xDomain = false;

	    // For IE 8/9 CORS support
	    // Only supports POST and GET calls and doesn't returns the response headers.
	    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
	    if (typeof window !== 'undefined' &&
	        window.XDomainRequest && !('withCredentials' in request) &&
	        !isURLSameOrigin(config.url)) {
	      request = new window.XDomainRequest();
	      loadEvent = 'onload';
	      xDomain = true;
	      request.onprogress = function handleProgress() {};
	      request.ontimeout = function handleTimeout() {};
	    }

	    // HTTP basic authentication
	    if (config.auth) {
	      var username = config.auth.username || '';
	      var password = config.auth.password || '';
	      requestHeaders.Authorization = 'Basic ' + btoa$1(username + ':' + password);
	    }

	    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

	    // Set the request timeout in MS
	    request.timeout = config.timeout;

	    // Listen for ready state
	    request[loadEvent] = function handleLoad() {
	      if (!request || (request.readyState !== 4 && !xDomain)) {
	        return;
	      }

	      // The request errored out and we didn't get a response, this will be
	      // handled by onerror instead
	      // With one exception: request that using file: protocol, most browsers
	      // will return status as 0 even though it's a successful request
	      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
	        return;
	      }

	      // Prepare the response
	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
	      var response = {
	        data: responseData,
	        // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
	        status: request.status === 1223 ? 204 : request.status,
	        statusText: request.status === 1223 ? 'No Content' : request.statusText,
	        headers: responseHeaders,
	        config: config,
	        request: request
	      };

	      settle(resolve, reject, response);

	      // Clean up request
	      request = null;
	    };

	    // Handle low level network errors
	    request.onerror = function handleError() {
	      // Real errors are hidden from us by the browser
	      // onerror should only fire if it's a network error
	      reject(createError('Network Error', config, null, request));

	      // Clean up request
	      request = null;
	    };

	    // Handle timeout
	    request.ontimeout = function handleTimeout() {
	      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
	        request));

	      // Clean up request
	      request = null;
	    };

	    // Add xsrf header
	    // This is only done if running in a standard browser environment.
	    // Specifically not if we're in a web worker, or react-native.
	    if (utils.isStandardBrowserEnv()) {
	      var cookies$1 = cookies;

	      // Add xsrf header
	      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
	          cookies$1.read(config.xsrfCookieName) :
	          undefined;

	      if (xsrfValue) {
	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
	      }
	    }

	    // Add headers to the request
	    if ('setRequestHeader' in request) {
	      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	          // Remove Content-Type if data is undefined
	          delete requestHeaders[key];
	        } else {
	          // Otherwise add header to the request
	          request.setRequestHeader(key, val);
	        }
	      });
	    }

	    // Add withCredentials to request if needed
	    if (config.withCredentials) {
	      request.withCredentials = true;
	    }

	    // Add responseType to request if needed
	    if (config.responseType) {
	      try {
	        request.responseType = config.responseType;
	      } catch (e) {
	        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
	        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
	        if (config.responseType !== 'json') {
	          throw e;
	        }
	      }
	    }

	    // Handle progress if needed
	    if (typeof config.onDownloadProgress === 'function') {
	      request.addEventListener('progress', config.onDownloadProgress);
	    }

	    // Not all browsers support upload events
	    if (typeof config.onUploadProgress === 'function' && request.upload) {
	      request.upload.addEventListener('progress', config.onUploadProgress);
	    }

	    if (config.cancelToken) {
	      // Handle cancellation
	      config.cancelToken.promise.then(function onCanceled(cancel) {
	        if (!request) {
	          return;
	        }

	        request.abort();
	        reject(cancel);
	        // Clean up request
	        request = null;
	      });
	    }

	    if (requestData === undefined) {
	      requestData = null;
	    }

	    // Send the request
	    request.send(requestData);
	  });
	};

	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};

	function setContentTypeIfUnset(headers, value) {
	  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}

	function getDefaultAdapter() {
	  var adapter;
	  if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = xhr;
	  } else if (typeof process$3 !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = xhr;
	  }
	  return adapter;
	}

	var defaults = {
	  adapter: getDefaultAdapter(),

	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Content-Type');
	    if (utils.isFormData(data) ||
	      utils.isArrayBuffer(data) ||
	      utils.isBuffer(data) ||
	      utils.isStream(data) ||
	      utils.isFile(data) ||
	      utils.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	    if (utils.isObject(data)) {
	      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
	      return JSON.stringify(data);
	    }
	    return data;
	  }],

	  transformResponse: [function transformResponse(data) {
	    /*eslint no-param-reassign:0*/
	    if (typeof data === 'string') {
	      try {
	        data = JSON.parse(data);
	      } catch (e) { /* Ignore */ }
	    }
	    return data;
	  }],

	  /**
	   * A timeout in milliseconds to abort a request. If set to 0 (default) a
	   * timeout is not created.
	   */
	  timeout: 0,

	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',

	  maxContentLength: -1,

	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};

	defaults.headers = {
	  common: {
	    'Accept': 'application/json, text/plain, */*'
	  }
	};

	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  defaults.headers[method] = {};
	});

	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
	});

	var defaults_1 = defaults;

	function InterceptorManager() {
	  this.handlers = [];
	}

	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected
	  });
	  return this.handlers.length - 1;
	};

	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};

	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};

	var InterceptorManager_1 = InterceptorManager;

	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	var transformData = function transformData(data, headers, fns) {
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn(data, headers);
	  });

	  return data;
	};

	var isCancel = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};

	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	var isAbsoluteURL = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	};

	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	var combineURLs = function combineURLs(baseURL, relativeURL) {
	  return relativeURL
	    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
	    : baseURL;
	};

	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }
	}

	/**
	 * Dispatch a request to the server using the configured adapter.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	var dispatchRequest = function dispatchRequest(config) {
	  throwIfCancellationRequested(config);

	  // Support baseURL config
	  if (config.baseURL && !isAbsoluteURL(config.url)) {
	    config.url = combineURLs(config.baseURL, config.url);
	  }

	  // Ensure headers exist
	  config.headers = config.headers || {};

	  // Transform request data
	  config.data = transformData(
	    config.data,
	    config.headers,
	    config.transformRequest
	  );

	  // Flatten headers
	  config.headers = utils.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers || {}
	  );

	  utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );

	  var adapter = config.adapter || defaults_1.adapter;

	  return adapter(config).then(function onAdapterResolution(response) {
	    throwIfCancellationRequested(config);

	    // Transform response data
	    response.data = transformData(
	      response.data,
	      response.headers,
	      config.transformResponse
	    );

	    return response;
	  }, function onAdapterRejection(reason) {
	    if (!isCancel(reason)) {
	      throwIfCancellationRequested(config);

	      // Transform response data
	      if (reason && reason.response) {
	        reason.response.data = transformData(
	          reason.response.data,
	          reason.response.headers,
	          config.transformResponse
	        );
	      }
	    }

	    return Promise.reject(reason);
	  });
	};

	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} instanceConfig The default config for the instance
	 */
	function Axios(instanceConfig) {
	  this.defaults = instanceConfig;
	  this.interceptors = {
	    request: new InterceptorManager_1(),
	    response: new InterceptorManager_1()
	  };
	}

	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = utils.merge({
	      url: arguments[0]
	    }, arguments[1]);
	  }

	  config = utils.merge(defaults_1, {method: 'get'}, this.defaults, config);
	  config.method = config.method.toLowerCase();

	  // Hook up interceptors middleware
	  var chain = [dispatchRequest, undefined];
	  var promise = Promise.resolve(config);

	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });

	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    chain.push(interceptor.fulfilled, interceptor.rejected);
	  });

	  while (chain.length) {
	    promise = promise.then(chain.shift(), chain.shift());
	  }

	  return promise;
	};

	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url
	    }));
	  };
	});

	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, data, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	});

	var Axios_1 = Axios;

	/**
	 * A `Cancel` is an object that is thrown when an operation is canceled.
	 *
	 * @class
	 * @param {string=} message The message.
	 */
	function Cancel(message) {
	  this.message = message;
	}

	Cancel.prototype.toString = function toString() {
	  return 'Cancel' + (this.message ? ': ' + this.message : '');
	};

	Cancel.prototype.__CANCEL__ = true;

	var Cancel_1 = Cancel;

	/**
	 * A `CancelToken` is an object that can be used to request cancellation of an operation.
	 *
	 * @class
	 * @param {Function} executor The executor function.
	 */
	function CancelToken(executor) {
	  if (typeof executor !== 'function') {
	    throw new TypeError('executor must be a function.');
	  }

	  var resolvePromise;
	  this.promise = new Promise(function promiseExecutor(resolve) {
	    resolvePromise = resolve;
	  });

	  var token = this;
	  executor(function cancel(message) {
	    if (token.reason) {
	      // Cancellation has already been requested
	      return;
	    }

	    token.reason = new Cancel_1(message);
	    resolvePromise(token.reason);
	  });
	}

	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	CancelToken.prototype.throwIfRequested = function throwIfRequested() {
	  if (this.reason) {
	    throw this.reason;
	  }
	};

	/**
	 * Returns an object that contains a new `CancelToken` and a function that, when called,
	 * cancels the `CancelToken`.
	 */
	CancelToken.source = function source() {
	  var cancel;
	  var token = new CancelToken(function executor(c) {
	    cancel = c;
	  });
	  return {
	    token: token,
	    cancel: cancel
	  };
	};

	var CancelToken_1 = CancelToken;

	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	var spread = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};

	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios_1(defaultConfig);
	  var instance = bind(Axios_1.prototype.request, context);

	  // Copy axios.prototype to instance
	  utils.extend(instance, Axios_1.prototype, context);

	  // Copy context to instance
	  utils.extend(instance, context);

	  return instance;
	}

	// Create the default instance to be exported
	var axios = createInstance(defaults_1);

	// Expose Axios class to allow class inheritance
	axios.Axios = Axios_1;

	// Factory for creating new instances
	axios.create = function create(instanceConfig) {
	  return createInstance(utils.merge(defaults_1, instanceConfig));
	};

	// Expose Cancel & CancelToken
	axios.Cancel = Cancel_1;
	axios.CancelToken = CancelToken_1;
	axios.isCancel = isCancel;

	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = spread;

	var axios_1 = axios;

	// Allow use of default import syntax in TypeScript
	var default_1 = axios;
	axios_1.default = default_1;

	var axios$1 = axios_1;

	var urlJoin = createCommonjsModule(function (module) {
	(function (name, context, definition) {
	  if (module.exports) module.exports = definition();
	  else context[name] = definition();
	})('urljoin', commonjsGlobal, function () {

	  function normalize (strArray) {
	    var resultArray = [];

	    // If the first part is a plain protocol, we combine it with the next part.
	    if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
	      var first = strArray.shift();
	      strArray[0] = first + strArray[0];
	    }

	    // There must be two or three slashes in the file protocol, two slashes in anything else.
	    if (strArray[0].match(/^file:\/\/\//)) {
	      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
	    } else {
	      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
	    }

	    for (var i = 0; i < strArray.length; i++) {
	      var component = strArray[i];

	      if (typeof component !== 'string') {
	        throw new TypeError('Url must be a string. Received ' + component);
	      }

	      if (component === '') { continue; }

	      if (i > 0) {
	        // Removing the starting slashes for each component but the first.
	        component = component.replace(/^[\/]+/, '');
	      }
	      if (i < strArray.length - 1) {
	        // Removing the ending slashes for each component but the last.
	        component = component.replace(/[\/]+$/, '');
	      } else {
	        // For the last component we will combine multiple slashes to a single one.
	        component = component.replace(/[\/]+$/, '/');
	      }

	      resultArray.push(component);

	    }

	    var str = resultArray.join('/');
	    // Each input component is now separated by a single slash except the possible first plain protocol part.

	    // remove trailing slash before parameters or hash
	    str = str.replace(/\/(\?|&|#[^!])/g, '$1');

	    // replace ? in parameters with &
	    var parts = str.split('?');
	    str = parts.shift() + (parts.length > 0 ? '?': '') + parts.join('&');

	    return str;
	  }

	  return function () {
	    var input;

	    if (typeof arguments[0] === 'object') {
	      input = arguments[0];
	    } else {
	      input = [].slice.call(arguments);
	    }

	    return normalize(input);
	  };

	});
	});

	/*! https://mths.be/punycode v1.4.1 by @mathias */


	/** Highest positive signed 32-bit float value */
	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\x20-\x7E]/; // unprintable ASCII chars + non-ASCII chars
	var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

	/** Error messages */
	var errors = {
	  'overflow': 'Overflow: input needs wider integers to process',
	  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	  'invalid-input': 'Invalid input'
	};

	/** Convenience shortcuts */
	var baseMinusTMin = base - tMin;
	var floor$2 = Math.floor;
	var stringFromCharCode = String.fromCharCode;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
	  throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
	  var length = array.length;
	  var result = [];
	  while (length--) {
	    result[length] = fn(array[length]);
	  }
	  return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
	  var parts = string.split('@');
	  var result = '';
	  if (parts.length > 1) {
	    // In email addresses, only the domain name should be punycoded. Leave
	    // the local part (i.e. everything up to `@`) intact.
	    result = parts[0] + '@';
	    string = parts[1];
	  }
	  // Avoid `split(regex)` for IE8 compatibility. See #17.
	  string = string.replace(regexSeparators, '\x2E');
	  var labels = string.split('.');
	  var encoded = map(labels, fn).join('.');
	  return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
	  var output = [],
	    counter = 0,
	    length = string.length,
	    value,
	    extra;
	  while (counter < length) {
	    value = string.charCodeAt(counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // high surrogate, and there is a next character
	      extra = string.charCodeAt(counter++);
	      if ((extra & 0xFC00) == 0xDC00) { // low surrogate
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // unmatched surrogate; only append this code unit, in case the next
	        // code unit is the high surrogate of a surrogate pair
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }
	  return output;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$2(delta / damp) : delta >> 1;
	  delta += floor$2(delta / numPoints);
	  for ( /* no initialization */ ; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor$2(delta / baseMinusTMin);
	  }
	  return floor$2(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode$1(input) {
	  var n,
	    delta,
	    handledCPCount,
	    basicLength,
	    bias,
	    j,
	    m,
	    q,
	    k,
	    t,
	    currentValue,
	    output = [],
	    /** `inputLength` will hold the number of code points in `input`. */
	    inputLength,
	    /** Cached calculation results */
	    handledCPCountPlusOne,
	    baseMinusT,
	    qMinusT;

	  // Convert the input in UCS-2 to Unicode
	  input = ucs2decode(input);

	  // Cache the length
	  inputLength = input.length;

	  // Initialize the state
	  n = initialN;
	  delta = 0;
	  bias = initialBias;

	  // Handle the basic code points
	  for (j = 0; j < inputLength; ++j) {
	    currentValue = input[j];
	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }

	  handledCPCount = basicLength = output.length;

	  // `handledCPCount` is the number of code points that have been handled;
	  // `basicLength` is the number of basic code points.

	  // Finish the basic string - if it is not empty - with a delimiter
	  if (basicLength) {
	    output.push(delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {

	    // All non-basic code points < n have been handled already. Find the next
	    // larger one:
	    for (m = maxInt, j = 0; j < inputLength; ++j) {
	      currentValue = input[j];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
	    // but guard against overflow
	    handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor$2((maxInt - delta) / handledCPCountPlusOne)) {
	      error('overflow');
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (j = 0; j < inputLength; ++j) {
	      currentValue = input[j];

	      if (currentValue < n && ++delta > maxInt) {
	        error('overflow');
	      }

	      if (currentValue == n) {
	        // Represent delta as a generalized variable-length integer
	        for (q = delta, k = base; /* no condition */ ; k += base) {
	          t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	          if (q < t) {
	            break;
	          }
	          qMinusT = q - t;
	          baseMinusT = base - t;
	          output.push(
	            stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
	          );
	          q = floor$2(qMinusT / baseMinusT);
	        }

	        output.push(stringFromCharCode(digitToBasic(q, 0)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }

	    ++delta;
	    ++n;

	  }
	  return output.join('');
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
	  return mapDomain(input, function(string) {
	    return regexNonASCII.test(string) ?
	      'xn--' + encode$1(string) :
	      string;
	  });
	}

	function isNull(arg) {
	  return arg === null;
	}

	function isNullOrUndefined(arg) {
	  return arg == null;
	}

	function isString$1(arg) {
	  return typeof arg === 'string';
	}

	function isObject$1(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty$1(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	var isArray$2 = Array.isArray || function (xs) {
	  return Object.prototype.toString.call(xs) === '[object Array]';
	};
	function stringifyPrimitive(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	}

	function stringify (obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return map$1(objectKeys(obj), function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (isArray$2(obj[k])) {
	        return map$1(obj[k], function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	}
	function map$1 (xs, f) {
	  if (xs.map) return xs.map(f);
	  var res = [];
	  for (var i = 0; i < xs.length; i++) {
	    res.push(f(xs[i], i));
	  }
	  return res;
	}

	var objectKeys = Object.keys || function (obj) {
	  var res = [];
	  for (var key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
	  }
	  return res;
	};

	function parse(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};

	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }

	  var regexp = /\+/g;
	  qs = qs.split(sep);

	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }

	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }

	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;

	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }

	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);

	    if (!hasOwnProperty$1(obj, k)) {
	      obj[k] = v;
	    } else if (isArray$2(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }

	  return obj;
	}var qs = {
	  encode: stringify,
	  stringify: stringify,
	  decode: parse,
	  parse: parse
	};

	// Copyright Joyent, Inc. and other Node contributors.
	var url = {
	  parse: urlParse,
	  resolve: urlResolve,
	  resolveObject: urlResolveObject,
	  format: urlFormat,
	  Url: Url
	};
	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	  portPattern = /:[0-9]*$/,

	  // Special case for a simple path URL
	  simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

	  // RFC 2396: characters reserved for delimiting URLs.
	  // We actually just auto-escape these.
	  delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

	  // RFC 2396: characters not allowed for various reasons.
	  unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

	  // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	  autoEscape = ['\''].concat(unwise),
	  // Characters that are never ever allowed in a hostname.
	  // Note that any invalid chars are also handled, but these
	  // are the ones that are *expected* to be seen, so we fast-path
	  // them.
	  nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	  hostEndingChars = ['/', '?', '#'],
	  hostnameMaxLen = 255,
	  hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	  hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	  // protocols that can allow "unsafe" and "unwise" chars.
	  unsafeProtocol = {
	    'javascript': true,
	    'javascript:': true
	  },
	  // protocols that never have a hostname.
	  hostlessProtocol = {
	    'javascript': true,
	    'javascript:': true
	  },
	  // protocols that always contain a // bit.
	  slashedProtocol = {
	    'http': true,
	    'https': true,
	    'ftp': true,
	    'gopher': true,
	    'file': true,
	    'http:': true,
	    'https:': true,
	    'ftp:': true,
	    'gopher:': true,
	    'file:': true
	  };

	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && isObject$1(url) && url instanceof Url) return url;

	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  return parse$1(this, url, parseQueryString, slashesDenoteHost);
	};

	function parse$1(self, url, parseQueryString, slashesDenoteHost) {
	  if (!isString$1(url)) {
	    throw new TypeError('Parameter \'url\' must be a string, not ' + typeof url);
	  }

	  // Copy chrome, IE, opera backslash-handling behavior.
	  // Back slashes before the query string get converted to forward slashes
	  // See: https://code.google.com/p/chromium/issues/detail?id=25916
	  var queryIndex = url.indexOf('?'),
	    splitter =
	    (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
	    uSplit = url.split(splitter),
	    slashRegex = /\\/g;
	  uSplit[0] = uSplit[0].replace(slashRegex, '/');
	  url = uSplit.join(splitter);

	  var rest = url;

	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();

	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      self.path = rest;
	      self.href = rest;
	      self.pathname = simplePath[1];
	      if (simplePath[2]) {
	        self.search = simplePath[2];
	        if (parseQueryString) {
	          self.query = parse(self.search.substr(1));
	        } else {
	          self.query = self.search.substr(1);
	        }
	      } else if (parseQueryString) {
	        self.search = '';
	        self.query = {};
	      }
	      return self;
	    }
	  }

	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    self.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }

	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      self.slashes = true;
	    }
	  }
	  var i, hec, l, p;
	  if (!hostlessProtocol[proto] &&
	    (slashes || (proto && !slashedProtocol[proto]))) {

	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c

	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.

	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (i = 0; i < hostEndingChars.length; i++) {
	      hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }

	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }

	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      self.auth = decodeURIComponent(auth);
	    }

	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (i = 0; i < nonHostChars.length; i++) {
	      hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;

	    self.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);

	    // pull out port.
	    parseHost(self);

	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    self.hostname = self.hostname || '';

	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = self.hostname[0] === '[' &&
	      self.hostname[self.hostname.length - 1] === ']';

	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = self.hostname.split(/\./);
	      for (i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            self.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }

	    if (self.hostname.length > hostnameMaxLen) {
	      self.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      self.hostname = self.hostname.toLowerCase();
	    }

	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a punycoded representation of "domain".
	      // It only converts parts of the domain name that
	      // have non-ASCII characters, i.e. it doesn't matter if
	      // you call it with a domain that already is ASCII-only.
	      self.hostname = toASCII(self.hostname);
	    }

	    p = self.port ? ':' + self.port : '';
	    var h = self.hostname || '';
	    self.host = h + p;
	    self.href += self.host;

	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      self.hostname = self.hostname.substr(1, self.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }

	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {

	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      if (rest.indexOf(ae) === -1)
	        continue;
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }


	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    self.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    self.search = rest.substr(qm);
	    self.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      self.query = parse(self.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    self.search = '';
	    self.query = {};
	  }
	  if (rest) self.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	    self.hostname && !self.pathname) {
	    self.pathname = '/';
	  }

	  //to support http.request
	  if (self.pathname || self.search) {
	    p = self.pathname || '';
	    var s = self.search || '';
	    self.path = p + s;
	  }

	  // finally, reconstruct the href based on what has been validated.
	  self.href = format(self);
	  return self;
	}

	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (isString$1(obj)) obj = parse$1({}, obj);
	  return format(obj);
	}

	function format(self) {
	  var auth = self.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }

	  var protocol = self.protocol || '',
	    pathname = self.pathname || '',
	    hash = self.hash || '',
	    host = false,
	    query = '';

	  if (self.host) {
	    host = auth + self.host;
	  } else if (self.hostname) {
	    host = auth + (self.hostname.indexOf(':') === -1 ?
	      self.hostname :
	      '[' + this.hostname + ']');
	    if (self.port) {
	      host += ':' + self.port;
	    }
	  }

	  if (self.query &&
	    isObject$1(self.query) &&
	    Object.keys(self.query).length) {
	    query = stringify(self.query);
	  }

	  var search = self.search || (query && ('?' + query)) || '';

	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (self.slashes ||
	    (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }

	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;

	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');

	  return protocol + host + pathname + search + hash;
	}

	Url.prototype.format = function() {
	  return format(this);
	};

	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}

	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};

	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}

	Url.prototype.resolveObject = function(relative) {
	  if (isString$1(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }

	  var result = new Url();
	  var tkeys = Object.keys(this);
	  for (var tk = 0; tk < tkeys.length; tk++) {
	    var tkey = tkeys[tk];
	    result[tkey] = this[tkey];
	  }

	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;

	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }

	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    var rkeys = Object.keys(relative);
	    for (var rk = 0; rk < rkeys.length; rk++) {
	      var rkey = rkeys[rk];
	      if (rkey !== 'protocol')
	        result[rkey] = relative[rkey];
	    }

	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	      result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }

	    result.href = result.format();
	    return result;
	  }
	  var relPath;
	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      var keys = Object.keys(relative);
	      for (var v = 0; v < keys.length; v++) {
	        var k = keys[v];
	        result[k] = relative[k];
	      }
	      result.href = result.format();
	      return result;
	    }

	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }

	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	    isRelAbs = (
	      relative.host ||
	      relative.pathname && relative.pathname.charAt(0) === '/'
	    ),
	    mustEndAbs = (isRelAbs || isSourceAbs ||
	      (result.host && relative.pathname)),
	    removeAllDots = mustEndAbs,
	    srcPath = result.pathname && result.pathname.split('/') || [],
	    psychotic = result.protocol && !slashedProtocol[result.protocol];
	  relPath = relative.pathname && relative.pathname.split('/') || [];
	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }
	  var authInHost;
	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	      relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especially happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      authInHost = result.host && result.host.indexOf('@') > 0 ?
	        result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!isNull(result.pathname) || !isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	        (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }

	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }

	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	    (result.host || relative.host || srcPath.length > 1) &&
	    (last === '.' || last === '..') || last === '');

	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last === '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }

	  if (mustEndAbs && srcPath[0] !== '' &&
	    (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }

	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }

	  var isAbsolute = srcPath[0] === '' ||
	    (srcPath[0] && srcPath[0].charAt(0) === '/');

	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	      srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especially happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    authInHost = result.host && result.host.indexOf('@') > 0 ?
	      result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }

	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }

	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }

	  //to support request.http
	  if (!isNull(result.pathname) || !isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	      (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};

	Url.prototype.parseHost = function() {
	  return parseHost(this);
	};

	function parseHost(self) {
	  var host = self.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      self.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) self.hostname = host;
	}

	var urlJoinQuery = function () {
	    if (arguments.length === 0) {
	        throw('miss params');
	        return;
	    } else if (arguments.length === 1) {
	        return arguments[0];
	    } else {
	        var paramsString = "";
	        if (arguments[1] || arguments[1] === null) {
	            if (typeof arguments[1] === "string") {
	                paramsString = qs.stringify(qs.parse(arguments[1]));
	            } else if (typeof arguments[1] === 'object') {
	                paramsString = qs.stringify(arguments[1]);
	            } else if (typeof arguments[1] === undefined) {
	                paramsString = "";
	            } else {
	                throw('prams type error');
	                return;
	            }
	            var hashString = "";
	            if (typeof arguments[2] === "string") {
	                //如果有=号
	                if (/=/.test(arguments[2])) {
	                    //说明要参数化hash
	                    hashString = qs.parse(arguments[2].split("#")[1] || "");
	                } else {
	                    hashString = arguments[2].split("#")[1] || "";
	                }
	            } else if (typeof arguments[2] === 'object') {
	                //如果是一个对象,也query化hash
	                hashString = arguments[2];
	            }

	            var baseUrl = url.parse(arguments[0], true);
	            var urlQueryString = qs.stringify(baseUrl.query);
	            var queryString = (paramsString || urlQueryString)
	                ? ((urlQueryString && paramsString)
	                    ? ("?" + urlQueryString + "&" + paramsString)
	                    : (urlQueryString
	                        ? ("?" + urlQueryString)
	                        : (paramsString
	                            ? ("?" + paramsString)
	                            : "")))
	                : "";
	            var urlHashString = ((baseUrl.hash || "").split('#')[1]) || ""; //url 本来有的#号

	            var hash = "";
	            if (typeof hashString === 'string') {
	                hash = urlHashString + hashString;
	            } else if (typeof hashString === 'object') {
	                if (urlHashString) {
	                    urlHashString = qs.stringify(qs.parse(urlHashString));
	                }
	                if(urlHashString){
	                    hash = urlHashString+"&"+qs.stringify(hashString);
	                }else{
	                    hash = qs.stringify(hashString);
	                }
	            }

	        }
	        var _url = "";
	        if (baseUrl.protocol) {
	            _url += baseUrl.protocol + "//";
	        }
	        if (baseUrl.host) {
	            _url += baseUrl.host;
	        }
	        if (baseUrl.port) {
	            _url += ":" + baseUrl.port;
	        }
	        if (baseUrl.pathname) {
	            _url += baseUrl.pathname;
	        }
	        if (hash) {
	            hash = "#" + hash;
	        }
	        return _url + queryString + hash;
	    }
	};

	var f$2 = _wks;

	var _wksExt = {
		f: f$2
	};

	var iterator = _wksExt.f('iterator');

	var iterator$1 = createCommonjsModule(function (module) {
	module.exports = { "default": iterator, __esModule: true };
	});

	unwrapExports(iterator$1);

	var defineProperty$2 = _objectDp.f;
	var _wksDefine = function (name) {
	  var $Symbol = _core.Symbol || (_core.Symbol = {});
	  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty$2($Symbol, name, { value: _wksExt.f(name) });
	};

	var f$3 = Object.getOwnPropertySymbols;

	var _objectGops = {
		f: f$3
	};

	var f$4 = {}.propertyIsEnumerable;

	var _objectPie = {
		f: f$4
	};

	// all enumerable object keys, includes symbols



	var _enumKeys = function (it) {
	  var result = _objectKeys(it);
	  var getSymbols = _objectGops.f;
	  if (getSymbols) {
	    var symbols = getSymbols(it);
	    var isEnum = _objectPie.f;
	    var i = 0;
	    var key;
	    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
	  } return result;
	};

	// 7.2.2 IsArray(argument)

	var _isArray = Array.isArray || function isArray(arg) {
	  return _cof(arg) == 'Array';
	};

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

	var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

	var f$5 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return _objectKeysInternal(O, hiddenKeys);
	};

	var _objectGopn = {
		f: f$5
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

	var gOPN = _objectGopn.f;
	var toString$3 = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return gOPN(it);
	  } catch (e) {
	    return windowNames.slice();
	  }
	};

	var f$6 = function getOwnPropertyNames(it) {
	  return windowNames && toString$3.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
	};

	var _objectGopnExt = {
		f: f$6
	};

	var gOPD = Object.getOwnPropertyDescriptor;

	var f$7 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = _toIobject(O);
	  P = _toPrimitive(P, true);
	  if (_ie8DomDefine) try {
	    return gOPD(O, P);
	  } catch (e) { /* empty */ }
	  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
	};

	var _objectGopd = {
		f: f$7
	};

	// ECMAScript 6 symbols shim





	var META = _meta.KEY;



















	var gOPD$1 = _objectGopd.f;
	var dP$1 = _objectDp.f;
	var gOPN$1 = _objectGopnExt.f;
	var $Symbol = _global.Symbol;
	var $JSON = _global.JSON;
	var _stringify = $JSON && $JSON.stringify;
	var PROTOTYPE$2 = 'prototype';
	var HIDDEN = _wks('_hidden');
	var TO_PRIMITIVE = _wks('toPrimitive');
	var isEnum = {}.propertyIsEnumerable;
	var SymbolRegistry = _shared('symbol-registry');
	var AllSymbols = _shared('symbols');
	var OPSymbols = _shared('op-symbols');
	var ObjectProto$1 = Object[PROTOTYPE$2];
	var USE_NATIVE$1 = typeof $Symbol == 'function';
	var QObject = _global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = _descriptors && _fails(function () {
	  return _objectCreate(dP$1({}, 'a', {
	    get: function () { return dP$1(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (it, key, D) {
	  var protoDesc = gOPD$1(ObjectProto$1, key);
	  if (protoDesc) delete ObjectProto$1[key];
	  dP$1(it, key, D);
	  if (protoDesc && it !== ObjectProto$1) dP$1(ObjectProto$1, key, protoDesc);
	} : dP$1;

	var wrap = function (tag) {
	  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE$1 && typeof $Symbol.iterator == 'symbol' ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D) {
	  if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
	  _anObject(it);
	  key = _toPrimitive(key, true);
	  _anObject(D);
	  if (_has(AllSymbols, key)) {
	    if (!D.enumerable) {
	      if (!_has(it, HIDDEN)) dP$1(it, HIDDEN, _propertyDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
	      D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
	    } return setSymbolDesc(it, key, D);
	  } return dP$1(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
	  _anObject(it);
	  var keys = _enumKeys(P = _toIobject(P));
	  var i = 0;
	  var l = keys.length;
	  var key;
	  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P) {
	  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
	  var E = isEnum.call(this, key = _toPrimitive(key, true));
	  if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
	  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
	  it = _toIobject(it);
	  key = _toPrimitive(key, true);
	  if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
	  var D = gOPD$1(it, key);
	  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
	  var names = gOPN$1(_toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
	  var IS_OP = it === ObjectProto$1;
	  var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE$1) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
	    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function (value) {
	      if (this === ObjectProto$1) $set.call(OPSymbols, value);
	      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, _propertyDesc(1, value));
	    };
	    if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
	    return wrap(tag);
	  };
	  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
	    return this._k;
	  });

	  _objectGopd.f = $getOwnPropertyDescriptor;
	  _objectDp.f = $defineProperty;
	  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
	  _objectPie.f = $propertyIsEnumerable;
	  _objectGops.f = $getOwnPropertySymbols;

	  if (_descriptors && !_library) {
	    _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  _wksExt.f = function (name) {
	    return wrap(_wks(name));
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE$1, { Symbol: $Symbol });

	for (var es6Symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), j = 0; es6Symbols.length > j;)_wks(es6Symbols[j++]);

	for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

	_export(_export.S + _export.F * !USE_NATIVE$1, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function (key) {
	    return _has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
	    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
	  },
	  useSetter: function () { setter = true; },
	  useSimple: function () { setter = false; }
	});

	_export(_export.S + _export.F * !USE_NATIVE$1, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && _export(_export.S + _export.F * (!USE_NATIVE$1 || _fails(function () {
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it) {
	    var args = [it];
	    var i = 1;
	    var replacer, $replacer;
	    while (arguments.length > i) args.push(arguments[i++]);
	    $replacer = replacer = args[1];
	    if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	    if (!_isArray(replacer)) replacer = function (key, value) {
	      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
	      if (!isSymbol(value)) return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	_setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	_setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	_setToStringTag(_global.JSON, 'JSON', true);

	_wksDefine('asyncIterator');

	_wksDefine('observable');

	var symbol = _core.Symbol;

	var symbol$1 = createCommonjsModule(function (module) {
	module.exports = { "default": symbol, __esModule: true };
	});

	var _Symbol = unwrapExports(symbol$1);

	var _typeof_1 = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var _iterator2 = _interopRequireDefault(iterator$1);



	var _symbol2 = _interopRequireDefault(symbol$1);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};
	});

	var _typeof = unwrapExports(_typeof_1);

	/* eslint-disable no-param-reassign */
	var CommonUtil = function () {
	  function CommonUtil() {
	    _classCallCheck(this, CommonUtil);
	  }

	  _createClass(CommonUtil, null, [{
	    key: 'decodeResponse',
	    value: function decodeResponse() {
	      var response = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	      if (response.data) {
	        var arrayDecode = ['external_ids', 'content', 'name'];

	        if (Array.isArray(response.data)) {
	          response.data.forEach(function (item) {
	            arrayDecode.forEach(function (o) {
	              if (Object.prototype.hasOwnProperty.call(item, o)) {
	                item[o] = CommonUtil.decode(o, item[o]);
	              }
	            });
	          });
	        } else {
	          arrayDecode.forEach(function (o) {
	            if (Object.prototype.hasOwnProperty.call(response.data, o)) {
	              response.data[o] = CommonUtil.decode(o, response.data[o]);
	            }
	          });
	        }
	      }

	      return response;
	    }
	  }, {
	    key: 'decode',
	    value: function decode(name, data) {
	      if (Array.isArray(data)) {
	        var decoded = [];

	        if (name === 'external_ids' && data.length >= 6 && (Buffer.from(data[0], 'base64').toString('utf-8') === 'SignedChain' || Buffer.from(data[0], 'base64').toString('utf-8') === 'SignedEntry') && Buffer.from(data[1], 'base64').toString('hex') === '01') {
	          data.forEach(function (i, index) {
	            if (index === 1) {
	              decoded.push('0x' + Buffer.from(i, 'base64').toString('hex'));
	            } else if (index === 4) {
	              decoded.push(Buffer.from(i, 'base64').toString('hex'));
	            } else {
	              decoded.push(Buffer.from(i, 'base64').toString('utf-8'));
	            }
	          });
	        } else {
	          data.forEach(function (i) {
	            decoded.push(Buffer.from(i, 'base64').toString('utf-8'));
	          });
	        }

	        return decoded;
	      }

	      return Buffer.from(data, 'base64').toString('utf-8');
	    }
	  }, {
	    key: 'isEmptyString',
	    value: function isEmptyString(value) {
	      var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
	      return type === 'string' && value.trim() === '' || type !== 'string';
	    }
	  }, {
	    key: 'isEmptyArray',
	    value: function isEmptyArray(arr) {
	      return typeof arr === 'undefined' || Array.isArray(arr) && !arr.length;
	    }
	  }]);

	  return CommonUtil;
	}();

	/**
	* Creates the Authorization header.
	* @return {Object} header - Returns an object with the Authorization header.
	*/
	var createAuthHeader = function createAuthHeader(accessToken) {
	  return {
	    app_id: accessToken.appId,
	    app_key: accessToken.appKey,
	    'Content-Type': 'application/json'
	  };
	};

	/**
	 * @classdesc Represents an API call.
	 * @class
	 */

	var APICall = function () {
	  /**
	   * @constructor
	   * @param  {Object} options - An object containing the access token and the base URL
	   * @param  {String} options.baseUrl - The URL with the account domain
	   * @param  {String} options.accessToken.appId - The App Id
	   * @param  {String} options.accessToken.appKey - The App Key
	   */
	  function APICall(options) {
	    _classCallCheck(this, APICall);

	    if (!isUrl_1(options.baseUrl)) throw new Error('The base URL provided is not valid.');
	    if (!options.accessToken) throw new Error('The accessToken is required.');

	    this.baseUrl = options.baseUrl;
	    this.accessToken = options.accessToken;
	  }

	  /**
	  * Fetch the information from the API.
	  * @return {Promise} - Returns a Promise that, when fulfilled, will either return an
	  * JSON Object with the requested
	  * data or an Error with the problem.
	  */


	  _createClass(APICall, [{
	    key: 'send',
	    value: function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(method) {
	        var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	        var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	        var callURL, headers, body, response;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                callURL = urlJoin(this.baseUrl, url);
	                headers = createAuthHeader(this.accessToken);
	                body = '';


	                if (method === constants.POST_METHOD) {
	                  body = data;
	                } else if (_Object$keys(data).length && data.constructor === Object) {
	                  callURL = urlJoinQuery(callURL, data);
	                }
	                _context.prev = 4;
	                _context.next = 7;
	                return axios$1(callURL, {
	                  method: method,
	                  data: body,
	                  headers: headers
	                });

	              case 7:
	                response = _context.sent;

	                if (!(response.status >= 200 && response.status <= 202)) {
	                  _context.next = 10;
	                  break;
	                }

	                return _context.abrupt('return', CommonUtil.decodeResponse(response.data));

	              case 10:
	                if (!(response.status >= 400)) {
	                  _context.next = 12;
	                  break;
	                }

	                return _context.abrupt('return', _Promise.reject(new Error({
	                  status: response.status,
	                  message: response.statusText
	                })));

	              case 12:
	                return _context.abrupt('return', {});

	              case 15:
	                _context.prev = 15;
	                _context.t0 = _context['catch'](4);
	                throw _context.t0;

	              case 18:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[4, 15]]);
	      }));

	      function send(_x) {
	        return _ref.apply(this, arguments);
	      }

	      return send;
	    }()
	  }]);

	  return APICall;
	}();

	var _createProperty = function (object, index, value) {
	  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
	  else object[index] = value;
	};

	_export(_export.S + _export.F * !_iterDetect(function (iter) { }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	    var O = _toObject(arrayLike);
	    var C = typeof this == 'function' ? this : Array;
	    var aLen = arguments.length;
	    var mapfn = aLen > 1 ? arguments[1] : undefined;
	    var mapping = mapfn !== undefined;
	    var index = 0;
	    var iterFn = core_getIteratorMethod(O);
	    var length, result, step, iterator;
	    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
	      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
	        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
	      }
	    } else {
	      length = _toLength(O.length);
	      for (result = new C(length); length > index; index++) {
	        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});

	var from_1 = _core.Array.from;

	var from_1$1 = createCommonjsModule(function (module) {
	module.exports = { "default": from_1, __esModule: true };
	});

	unwrapExports(from_1$1);

	var toConsumableArray = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var _from2 = _interopRequireDefault(from_1$1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
	      arr2[i] = arr[i];
	    }

	    return arr2;
	  } else {
	    return (0, _from2.default)(arr);
	  }
	};
	});

	var _toConsumableArray = unwrapExports(toConsumableArray);

	var require$$0 = {};

	var secureRandom = createCommonjsModule(function (module) {
	!function(globals){

	//*** UMD BEGIN
	if (module.exports) { //CommonJS
	  module.exports = secureRandom;
	} else { //script / browser
	  globals.secureRandom = secureRandom;
	}
	//*** UMD END

	//options.type is the only valid option
	function secureRandom(count, options) {
	  options = options || {type: 'Array'};
	  //we check for process.pid to prevent browserify from tricking us
	  if (typeof process$3 != 'undefined' && typeof process$3.pid == 'number') {
	    return nodeRandom(count, options)
	  } else {
	    var crypto = window.crypto || window.msCrypto;
	    if (!crypto) throw new Error("Your browser does not support window.crypto.")
	    return browserRandom(count, options)
	  }
	}

	function nodeRandom(count, options) {
	  var crypto = require$$0;
	  var buf = crypto.randomBytes(count);

	  switch (options.type) {
	    case 'Array':
	      return [].slice.call(buf)
	    case 'Buffer':
	      return buf
	    case 'Uint8Array':
	      var arr = new Uint8Array(count);
	      for (var i = 0; i < count; ++i) { arr[i] = buf.readUInt8(i); }
	      return arr
	    default:
	      throw new Error(options.type + " is unsupported.")
	  }
	}

	function browserRandom(count, options) {
	  var nativeArr = new Uint8Array(count);
	  var crypto = window.crypto || window.msCrypto;
	  crypto.getRandomValues(nativeArr);

	  switch (options.type) {
	    case 'Array':
	      return [].slice.call(nativeArr)
	    case 'Buffer':
	      try { var b = new Buffer(1); } catch(e) { throw new Error('Buffer not supported in this environment. Use Node.js or Browserify for browser support.')}
	      return new Buffer(nativeArr)
	    case 'Uint8Array':
	      return nativeArr
	    default:
	      throw new Error(options.type + " is unsupported.")
	  }
	}

	secureRandom.randomArray = function(byteCount) {
	  return secureRandom(byteCount, {type: 'Array'})
	};

	secureRandom.randomUint8Array = function(byteCount) {
	  return secureRandom(byteCount, {type: 'Uint8Array'})
	};

	secureRandom.randomBuffer = function(byteCount) {
	  return secureRandom(byteCount, {type: 'Buffer'})
	};


	}(commonjsGlobal);
	});

	var Base58 = createCommonjsModule(function (module) {
	// Generated by CoffeeScript 1.8.0
	(function() {
	  var ALPHABET, ALPHABET_MAP, Base58, i;

	  Base58 = (module !== null ? module.exports : void 0) || (window.Base58 = {});

	  ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

	  ALPHABET_MAP = {};

	  i = 0;

	  while (i < ALPHABET.length) {
	    ALPHABET_MAP[ALPHABET.charAt(i)] = i;
	    i++;
	  }

	  Base58.encode = function(buffer) {
	    var carry, digits, j;
	    if (buffer.length === 0) {
	      return "";
	    }
	    i = void 0;
	    j = void 0;
	    digits = [0];
	    i = 0;
	    while (i < buffer.length) {
	      j = 0;
	      while (j < digits.length) {
	        digits[j] <<= 8;
	        j++;
	      }
	      digits[0] += buffer[i];
	      carry = 0;
	      j = 0;
	      while (j < digits.length) {
	        digits[j] += carry;
	        carry = (digits[j] / 58) | 0;
	        digits[j] %= 58;
	        ++j;
	      }
	      while (carry) {
	        digits.push(carry % 58);
	        carry = (carry / 58) | 0;
	      }
	      i++;
	    }
	    i = 0;
	    while (buffer[i] === 0 && i < buffer.length - 1) {
	      digits.push(0);
	      i++;
	    }
	    return digits.reverse().map(function(digit) {
	      return ALPHABET[digit];
	    }).join("");
	  };

	  Base58.decode = function(string) {
	    var bytes, c, carry, j;
	    if (string.length === 0) {
	      return new (typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(0);
	    }
	    i = void 0;
	    j = void 0;
	    bytes = [0];
	    i = 0;
	    while (i < string.length) {
	      c = string[i];
	      if (!(c in ALPHABET_MAP)) {
	        throw "Base58.decode received unacceptable input. Character '" + c + "' is not in the Base58 alphabet.";
	      }
	      j = 0;
	      while (j < bytes.length) {
	        bytes[j] *= 58;
	        j++;
	      }
	      bytes[0] += ALPHABET_MAP[c];
	      carry = 0;
	      j = 0;
	      while (j < bytes.length) {
	        bytes[j] += carry;
	        carry = bytes[j] >> 8;
	        bytes[j] &= 0xff;
	        ++j;
	      }
	      while (carry) {
	        bytes.push(carry & 0xff);
	        carry >>= 8;
	      }
	      i++;
	    }
	    i = 0;
	    while (string[i] === "1" && i < string.length - 1) {
	      bytes.push(0);
	      i++;
	    }
	    return new (typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(bytes.reverse());
	  };

	}).call(commonjsGlobal);
	});

	var sha256 = createCommonjsModule(function (module) {
	/**
	 * [js-sha256]{@link https://github.com/emn178/js-sha256}
	 *
	 * @version 0.9.0
	 * @author Chen, Yi-Cyuan [emn178@gmail.com]
	 * @copyright Chen, Yi-Cyuan 2014-2017
	 * @license MIT
	 */
	/*jslint bitwise: true */
	(function () {

	  var ERROR = 'input is invalid type';
	  var WINDOW = typeof window === 'object';
	  var root = WINDOW ? window : {};
	  if (root.JS_SHA256_NO_WINDOW) {
	    WINDOW = false;
	  }
	  var WEB_WORKER = !WINDOW && typeof self === 'object';
	  var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process$3 === 'object' && process$3.versions && process$3.versions.node;
	  if (NODE_JS) {
	    root = commonjsGlobal;
	  } else if (WEB_WORKER) {
	    root = self;
	  }
	  var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && 'object' === 'object' && module.exports;
	  var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
	  var HEX_CHARS = '0123456789abcdef'.split('');
	  var EXTRA = [-2147483648, 8388608, 32768, 128];
	  var SHIFT = [24, 16, 8, 0];
	  var K = [
	    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
	    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
	    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
	    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
	    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
	    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
	    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
	    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
	  ];
	  var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

	  var blocks = [];

	  if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
	    Array.isArray = function (obj) {
	      return Object.prototype.toString.call(obj) === '[object Array]';
	    };
	  }

	  if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
	    ArrayBuffer.isView = function (obj) {
	      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
	    };
	  }

	  var createOutputMethod = function (outputType, is224) {
	    return function (message) {
	      return new Sha256(is224, true).update(message)[outputType]();
	    };
	  };

	  var createMethod = function (is224) {
	    var method = createOutputMethod('hex', is224);
	    if (NODE_JS) {
	      method = nodeWrap(method, is224);
	    }
	    method.create = function () {
	      return new Sha256(is224);
	    };
	    method.update = function (message) {
	      return method.create().update(message);
	    };
	    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
	      var type = OUTPUT_TYPES[i];
	      method[type] = createOutputMethod(type, is224);
	    }
	    return method;
	  };

	  var nodeWrap = function (method, is224) {
	    var crypto = eval("require('crypto')");
	    var Buffer = eval("require('buffer').Buffer");
	    var algorithm = is224 ? 'sha224' : 'sha256';
	    var nodeMethod = function (message) {
	      if (typeof message === 'string') {
	        return crypto.createHash(algorithm).update(message, 'utf8').digest('hex');
	      } else {
	        if (message === null || message === undefined) {
	          throw new Error(ERROR);
	        } else if (message.constructor === ArrayBuffer) {
	          message = new Uint8Array(message);
	        }
	      }
	      if (Array.isArray(message) || ArrayBuffer.isView(message) ||
	        message.constructor === Buffer) {
	        return crypto.createHash(algorithm).update(new Buffer(message)).digest('hex');
	      } else {
	        return method(message);
	      }
	    };
	    return nodeMethod;
	  };

	  var createHmacOutputMethod = function (outputType, is224) {
	    return function (key, message) {
	      return new HmacSha256(key, is224, true).update(message)[outputType]();
	    };
	  };

	  var createHmacMethod = function (is224) {
	    var method = createHmacOutputMethod('hex', is224);
	    method.create = function (key) {
	      return new HmacSha256(key, is224);
	    };
	    method.update = function (key, message) {
	      return method.create(key).update(message);
	    };
	    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
	      var type = OUTPUT_TYPES[i];
	      method[type] = createHmacOutputMethod(type, is224);
	    }
	    return method;
	  };

	  function Sha256(is224, sharedMemory) {
	    if (sharedMemory) {
	      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
	        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
	        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
	        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	      this.blocks = blocks;
	    } else {
	      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	    }

	    if (is224) {
	      this.h0 = 0xc1059ed8;
	      this.h1 = 0x367cd507;
	      this.h2 = 0x3070dd17;
	      this.h3 = 0xf70e5939;
	      this.h4 = 0xffc00b31;
	      this.h5 = 0x68581511;
	      this.h6 = 0x64f98fa7;
	      this.h7 = 0xbefa4fa4;
	    } else { // 256
	      this.h0 = 0x6a09e667;
	      this.h1 = 0xbb67ae85;
	      this.h2 = 0x3c6ef372;
	      this.h3 = 0xa54ff53a;
	      this.h4 = 0x510e527f;
	      this.h5 = 0x9b05688c;
	      this.h6 = 0x1f83d9ab;
	      this.h7 = 0x5be0cd19;
	    }

	    this.block = this.start = this.bytes = this.hBytes = 0;
	    this.finalized = this.hashed = false;
	    this.first = true;
	    this.is224 = is224;
	  }

	  Sha256.prototype.update = function (message) {
	    if (this.finalized) {
	      return;
	    }
	    var notString, type = typeof message;
	    if (type !== 'string') {
	      if (type === 'object') {
	        if (message === null) {
	          throw new Error(ERROR);
	        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
	          message = new Uint8Array(message);
	        } else if (!Array.isArray(message)) {
	          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
	            throw new Error(ERROR);
	          }
	        }
	      } else {
	        throw new Error(ERROR);
	      }
	      notString = true;
	    }
	    var code, index = 0, i, length = message.length, blocks = this.blocks;

	    while (index < length) {
	      if (this.hashed) {
	        this.hashed = false;
	        blocks[0] = this.block;
	        blocks[16] = blocks[1] = blocks[2] = blocks[3] =
	          blocks[4] = blocks[5] = blocks[6] = blocks[7] =
	          blocks[8] = blocks[9] = blocks[10] = blocks[11] =
	          blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	      }

	      if (notString) {
	        for (i = this.start; index < length && i < 64; ++index) {
	          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
	        }
	      } else {
	        for (i = this.start; index < length && i < 64; ++index) {
	          code = message.charCodeAt(index);
	          if (code < 0x80) {
	            blocks[i >> 2] |= code << SHIFT[i++ & 3];
	          } else if (code < 0x800) {
	            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
	          } else if (code < 0xd800 || code >= 0xe000) {
	            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
	          } else {
	            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
	            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
	          }
	        }
	      }

	      this.lastByteIndex = i;
	      this.bytes += i - this.start;
	      if (i >= 64) {
	        this.block = blocks[16];
	        this.start = i - 64;
	        this.hash();
	        this.hashed = true;
	      } else {
	        this.start = i;
	      }
	    }
	    if (this.bytes > 4294967295) {
	      this.hBytes += this.bytes / 4294967296 << 0;
	      this.bytes = this.bytes % 4294967296;
	    }
	    return this;
	  };

	  Sha256.prototype.finalize = function () {
	    if (this.finalized) {
	      return;
	    }
	    this.finalized = true;
	    var blocks = this.blocks, i = this.lastByteIndex;
	    blocks[16] = this.block;
	    blocks[i >> 2] |= EXTRA[i & 3];
	    this.block = blocks[16];
	    if (i >= 56) {
	      if (!this.hashed) {
	        this.hash();
	      }
	      blocks[0] = this.block;
	      blocks[16] = blocks[1] = blocks[2] = blocks[3] =
	        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
	        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
	        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	    }
	    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
	    blocks[15] = this.bytes << 3;
	    this.hash();
	  };

	  Sha256.prototype.hash = function () {
	    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
	      h = this.h7, blocks = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

	    for (j = 16; j < 64; ++j) {
	      // rightrotate
	      t1 = blocks[j - 15];
	      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
	      t1 = blocks[j - 2];
	      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
	      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
	    }

	    bc = b & c;
	    for (j = 0; j < 64; j += 4) {
	      if (this.first) {
	        if (this.is224) {
	          ab = 300032;
	          t1 = blocks[0] - 1413257819;
	          h = t1 - 150054599 << 0;
	          d = t1 + 24177077 << 0;
	        } else {
	          ab = 704751109;
	          t1 = blocks[0] - 210244248;
	          h = t1 - 1521486534 << 0;
	          d = t1 + 143694565 << 0;
	        }
	        this.first = false;
	      } else {
	        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
	        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
	        ab = a & b;
	        maj = ab ^ (a & c) ^ bc;
	        ch = (e & f) ^ (~e & g);
	        t1 = h + s1 + ch + K[j] + blocks[j];
	        t2 = s0 + maj;
	        h = d + t1 << 0;
	        d = t1 + t2 << 0;
	      }
	      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
	      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
	      da = d & a;
	      maj = da ^ (d & b) ^ ab;
	      ch = (h & e) ^ (~h & f);
	      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
	      t2 = s0 + maj;
	      g = c + t1 << 0;
	      c = t1 + t2 << 0;
	      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
	      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
	      cd = c & d;
	      maj = cd ^ (c & a) ^ da;
	      ch = (g & h) ^ (~g & e);
	      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
	      t2 = s0 + maj;
	      f = b + t1 << 0;
	      b = t1 + t2 << 0;
	      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
	      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
	      bc = b & c;
	      maj = bc ^ (b & d) ^ cd;
	      ch = (f & g) ^ (~f & h);
	      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
	      t2 = s0 + maj;
	      e = a + t1 << 0;
	      a = t1 + t2 << 0;
	    }

	    this.h0 = this.h0 + a << 0;
	    this.h1 = this.h1 + b << 0;
	    this.h2 = this.h2 + c << 0;
	    this.h3 = this.h3 + d << 0;
	    this.h4 = this.h4 + e << 0;
	    this.h5 = this.h5 + f << 0;
	    this.h6 = this.h6 + g << 0;
	    this.h7 = this.h7 + h << 0;
	  };

	  Sha256.prototype.hex = function () {
	    this.finalize();

	    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
	      h6 = this.h6, h7 = this.h7;

	    var hex = HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
	      HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
	      HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
	      HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
	      HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
	      HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
	      HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
	      HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
	      HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
	      HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
	      HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
	      HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
	      HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] +
	      HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
	      HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
	      HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
	      HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] +
	      HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] +
	      HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] +
	      HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
	      HEX_CHARS[(h5 >> 28) & 0x0F] + HEX_CHARS[(h5 >> 24) & 0x0F] +
	      HEX_CHARS[(h5 >> 20) & 0x0F] + HEX_CHARS[(h5 >> 16) & 0x0F] +
	      HEX_CHARS[(h5 >> 12) & 0x0F] + HEX_CHARS[(h5 >> 8) & 0x0F] +
	      HEX_CHARS[(h5 >> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
	      HEX_CHARS[(h6 >> 28) & 0x0F] + HEX_CHARS[(h6 >> 24) & 0x0F] +
	      HEX_CHARS[(h6 >> 20) & 0x0F] + HEX_CHARS[(h6 >> 16) & 0x0F] +
	      HEX_CHARS[(h6 >> 12) & 0x0F] + HEX_CHARS[(h6 >> 8) & 0x0F] +
	      HEX_CHARS[(h6 >> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];
	    if (!this.is224) {
	      hex += HEX_CHARS[(h7 >> 28) & 0x0F] + HEX_CHARS[(h7 >> 24) & 0x0F] +
	        HEX_CHARS[(h7 >> 20) & 0x0F] + HEX_CHARS[(h7 >> 16) & 0x0F] +
	        HEX_CHARS[(h7 >> 12) & 0x0F] + HEX_CHARS[(h7 >> 8) & 0x0F] +
	        HEX_CHARS[(h7 >> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
	    }
	    return hex;
	  };

	  Sha256.prototype.toString = Sha256.prototype.hex;

	  Sha256.prototype.digest = function () {
	    this.finalize();

	    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
	      h6 = this.h6, h7 = this.h7;

	    var arr = [
	      (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
	      (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
	      (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
	      (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
	      (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
	      (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
	      (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF
	    ];
	    if (!this.is224) {
	      arr.push((h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF);
	    }
	    return arr;
	  };

	  Sha256.prototype.array = Sha256.prototype.digest;

	  Sha256.prototype.arrayBuffer = function () {
	    this.finalize();

	    var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
	    var dataView = new DataView(buffer);
	    dataView.setUint32(0, this.h0);
	    dataView.setUint32(4, this.h1);
	    dataView.setUint32(8, this.h2);
	    dataView.setUint32(12, this.h3);
	    dataView.setUint32(16, this.h4);
	    dataView.setUint32(20, this.h5);
	    dataView.setUint32(24, this.h6);
	    if (!this.is224) {
	      dataView.setUint32(28, this.h7);
	    }
	    return buffer;
	  };

	  function HmacSha256(key, is224, sharedMemory) {
	    var i, type = typeof key;
	    if (type === 'string') {
	      var bytes = [], length = key.length, index = 0, code;
	      for (i = 0; i < length; ++i) {
	        code = key.charCodeAt(i);
	        if (code < 0x80) {
	          bytes[index++] = code;
	        } else if (code < 0x800) {
	          bytes[index++] = (0xc0 | (code >> 6));
	          bytes[index++] = (0x80 | (code & 0x3f));
	        } else if (code < 0xd800 || code >= 0xe000) {
	          bytes[index++] = (0xe0 | (code >> 12));
	          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
	          bytes[index++] = (0x80 | (code & 0x3f));
	        } else {
	          code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
	          bytes[index++] = (0xf0 | (code >> 18));
	          bytes[index++] = (0x80 | ((code >> 12) & 0x3f));
	          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
	          bytes[index++] = (0x80 | (code & 0x3f));
	        }
	      }
	      key = bytes;
	    } else {
	      if (type === 'object') {
	        if (key === null) {
	          throw new Error(ERROR);
	        } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
	          key = new Uint8Array(key);
	        } else if (!Array.isArray(key)) {
	          if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
	            throw new Error(ERROR);
	          }
	        }
	      } else {
	        throw new Error(ERROR);
	      }
	    }

	    if (key.length > 64) {
	      key = (new Sha256(is224, true)).update(key).array();
	    }

	    var oKeyPad = [], iKeyPad = [];
	    for (i = 0; i < 64; ++i) {
	      var b = key[i] || 0;
	      oKeyPad[i] = 0x5c ^ b;
	      iKeyPad[i] = 0x36 ^ b;
	    }

	    Sha256.call(this, is224, sharedMemory);

	    this.update(iKeyPad);
	    this.oKeyPad = oKeyPad;
	    this.inner = true;
	    this.sharedMemory = sharedMemory;
	  }
	  HmacSha256.prototype = new Sha256();

	  HmacSha256.prototype.finalize = function () {
	    Sha256.prototype.finalize.call(this);
	    if (this.inner) {
	      this.inner = false;
	      var innerHash = this.array();
	      Sha256.call(this, this.is224, this.sharedMemory);
	      this.update(this.oKeyPad);
	      this.update(innerHash);
	      Sha256.prototype.finalize.call(this);
	    }
	  };

	  var exports = createMethod();
	  exports.sha256 = exports;
	  exports.sha224 = createMethod(true);
	  exports.sha256.hmac = createHmacMethod();
	  exports.sha224.hmac = createHmacMethod(true);

	  if (COMMON_JS) {
	    module.exports = exports;
	  } else {
	    root.sha256 = exports.sha256;
	    root.sha224 = exports.sha224;
	  }
	})();
	});

	// 20.2.2.18 Math.imul(x, y)

	var $imul = Math.imul;

	// some WebKit versions fails with big numbers, some has wrong arity
	_export(_export.S + _export.F * _fails(function () {
	  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
	}), 'Math', {
	  imul: function imul(x, y) {
	    var UINT16 = 0xffff;
	    var xn = +x;
	    var yn = +y;
	    var xl = UINT16 & xn;
	    var yl = UINT16 & yn;
	    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
	  }
	});

	var imul = _core.Math.imul;

	var imul$1 = createCommonjsModule(function (module) {
	module.exports = { "default": imul, __esModule: true };
	});

	var _Math$imul = unwrapExports(imul$1);

	// 20.2.2.11 Math.clz32(x)


	_export(_export.S, 'Math', {
	  clz32: function clz32(x) {
	    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
	  }
	});

	var clz32 = _core.Math.clz32;

	var clz32$1 = createCommonjsModule(function (module) {
	module.exports = { "default": clz32, __esModule: true };
	});

	var _Math$clz = unwrapExports(clz32$1);

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	_export(_export.S, 'Object', { create: _objectCreate });

	var $Object$1 = _core.Object;
	var create = function create(P, D) {
	  return $Object$1.create(P, D);
	};

	var create$1 = createCommonjsModule(function (module) {
	module.exports = { "default": create, __esModule: true };
	});

	var _Object$create = unwrapExports(create$1);

	var toStringTag = _wksExt.f('toStringTag');

	var toStringTag$1 = createCommonjsModule(function (module) {
	module.exports = { "default": toStringTag, __esModule: true };
	});

	var _Symbol$toStringTag = unwrapExports(toStringTag$1);

	var elliptic = createCommonjsModule(function (module) {
	  module.exports =
	  /******/function (modules) {
	    // webpackBootstrap
	    /******/ // The module cache
	    /******/var installedModules = {};
	    /******/
	    /******/ // The require function
	    /******/function __webpack_require__(moduleId) {
	      /******/
	      /******/ // Check if module is in cache
	      /******/if (installedModules[moduleId]) {
	        /******/return installedModules[moduleId].exports;
	        /******/
	      }
	      /******/ // Create a new module (and put it into the cache)
	      /******/var module = installedModules[moduleId] = {
	        /******/i: moduleId,
	        /******/l: false,
	        /******/exports: {}
	        /******/ };
	      /******/
	      /******/ // Execute the module function
	      /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	      /******/
	      /******/ // Flag the module as loaded
	      /******/module.l = true;
	      /******/
	      /******/ // Return the exports of the module
	      /******/return module.exports;
	      /******/
	    }
	    /******/
	    /******/
	    /******/ // expose the modules object (__webpack_modules__)
	    /******/__webpack_require__.m = modules;
	    /******/
	    /******/ // expose the module cache
	    /******/__webpack_require__.c = installedModules;
	    /******/
	    /******/ // define getter function for harmony exports
	    /******/__webpack_require__.d = function (exports, name, getter) {
	      /******/if (!__webpack_require__.o(exports, name)) {
	        /******/_Object$defineProperty(exports, name, { enumerable: true, get: getter });
	        /******/
	      }
	      /******/
	    };
	    /******/
	    /******/ // define __esModule on exports
	    /******/__webpack_require__.r = function (exports) {
	      /******/if (typeof _Symbol !== 'undefined' && _Symbol$toStringTag) {
	        /******/_Object$defineProperty(exports, _Symbol$toStringTag, { value: 'Module' });
	        /******/
	      }
	      /******/Object.defineProperty(exports, '__esModule', { value: true });
	      /******/
	    };
	    /******/
	    /******/ // create a fake namespace object
	    /******/ // mode & 1: value is a module id, require it
	    /******/ // mode & 2: merge all properties of value into the ns
	    /******/ // mode & 4: return value when already ns object
	    /******/ // mode & 8|1: behave like require
	    /******/__webpack_require__.t = function (value, mode) {
	      /******/if (mode & 1) value = __webpack_require__(value);
	      /******/if (mode & 8) return value;
	      /******/if (mode & 4 && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value && value.__esModule) return value;
	      /******/var ns = _Object$create(null);
	      /******/__webpack_require__.r(ns);
	      /******/Object.defineProperty(ns, 'default', { enumerable: true, value: value });
	      /******/if (mode & 2 && typeof value != 'string') for (var key in value) {
	        __webpack_require__.d(ns, key, function (key) {
	          return value[key];
	        }.bind(null, key));
	      } /******/return ns;
	      /******/
	    };
	    /******/
	    /******/ // getDefaultExport function for compatibility with non-harmony modules
	    /******/__webpack_require__.n = function (module) {
	      /******/var getter = module && module.__esModule ?
	      /******/function getDefault() {
	        return module['default'];
	      } :
	      /******/function getModuleExports() {
	        return module;
	      };
	      /******/__webpack_require__.d(getter, 'a', getter);
	      /******/return getter;
	      /******/
	    };
	    /******/
	    /******/ // Object.prototype.hasOwnProperty.call
	    /******/__webpack_require__.o = function (object, property) {
	      return Object.prototype.hasOwnProperty.call(object, property);
	    };
	    /******/
	    /******/ // __webpack_public_path__
	    /******/__webpack_require__.p = "";
	    /******/
	    /******/
	    /******/ // Load entry module and return exports
	    /******/return __webpack_require__(__webpack_require__.s = 0);
	    /******/
	  }(
	  /************************************************************************/
	  /******/[
	  /* 0 */
	  /***/function (module, exports, __webpack_require__) {

	    var elliptic = exports;

	    elliptic.version = __webpack_require__(12).version;
	    elliptic.utils = __webpack_require__(13);
	    elliptic.rand = __webpack_require__(16);
	    elliptic.curve = __webpack_require__(5);
	    elliptic.curves = __webpack_require__(22);

	    // Protocols
	    elliptic.ec = __webpack_require__(30);
	    elliptic.eddsa = __webpack_require__(34);

	    /***/
	  },
	  /* 1 */
	  /***/function (module, exports, __webpack_require__) {

	    var assert = __webpack_require__(3);
	    var inherits = __webpack_require__(6);

	    exports.inherits = inherits;

	    function isSurrogatePair(msg, i) {
	      if ((msg.charCodeAt(i) & 0xFC00) !== 0xD800) {
	        return false;
	      }
	      if (i < 0 || i + 1 >= msg.length) {
	        return false;
	      }
	      return (msg.charCodeAt(i + 1) & 0xFC00) === 0xDC00;
	    }

	    function toArray(msg, enc) {
	      if (Array.isArray(msg)) return msg.slice();
	      if (!msg) return [];
	      var res = [];
	      if (typeof msg === 'string') {
	        if (!enc) {
	          // Inspired by stringToUtf8ByteArray() in closure-library by Google
	          // https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js#L117-L143
	          // Apache License 2.0
	          // https://github.com/google/closure-library/blob/master/LICENSE
	          var p = 0;
	          for (var i = 0; i < msg.length; i++) {
	            var c = msg.charCodeAt(i);
	            if (c < 128) {
	              res[p++] = c;
	            } else if (c < 2048) {
	              res[p++] = c >> 6 | 192;
	              res[p++] = c & 63 | 128;
	            } else if (isSurrogatePair(msg, i)) {
	              c = 0x10000 + ((c & 0x03FF) << 10) + (msg.charCodeAt(++i) & 0x03FF);
	              res[p++] = c >> 18 | 240;
	              res[p++] = c >> 12 & 63 | 128;
	              res[p++] = c >> 6 & 63 | 128;
	              res[p++] = c & 63 | 128;
	            } else {
	              res[p++] = c >> 12 | 224;
	              res[p++] = c >> 6 & 63 | 128;
	              res[p++] = c & 63 | 128;
	            }
	          }
	        } else if (enc === 'hex') {
	          msg = msg.replace(/[^a-z0-9]+/ig, '');
	          if (msg.length % 2 !== 0) msg = '0' + msg;
	          for (i = 0; i < msg.length; i += 2) {
	            res.push(parseInt(msg[i] + msg[i + 1], 16));
	          }
	        }
	      } else {
	        for (i = 0; i < msg.length; i++) {
	          res[i] = msg[i] | 0;
	        }
	      }
	      return res;
	    }
	    exports.toArray = toArray;

	    function toHex(msg) {
	      var res = '';
	      for (var i = 0; i < msg.length; i++) {
	        res += zero2(msg[i].toString(16));
	      }return res;
	    }
	    exports.toHex = toHex;

	    function htonl(w) {
	      var res = w >>> 24 | w >>> 8 & 0xff00 | w << 8 & 0xff0000 | (w & 0xff) << 24;
	      return res >>> 0;
	    }
	    exports.htonl = htonl;

	    function toHex32(msg, endian) {
	      var res = '';
	      for (var i = 0; i < msg.length; i++) {
	        var w = msg[i];
	        if (endian === 'little') w = htonl(w);
	        res += zero8(w.toString(16));
	      }
	      return res;
	    }
	    exports.toHex32 = toHex32;

	    function zero2(word) {
	      if (word.length === 1) return '0' + word;else return word;
	    }
	    exports.zero2 = zero2;

	    function zero8(word) {
	      if (word.length === 7) return '0' + word;else if (word.length === 6) return '00' + word;else if (word.length === 5) return '000' + word;else if (word.length === 4) return '0000' + word;else if (word.length === 3) return '00000' + word;else if (word.length === 2) return '000000' + word;else if (word.length === 1) return '0000000' + word;else return word;
	    }
	    exports.zero8 = zero8;

	    function join32(msg, start, end, endian) {
	      var len = end - start;
	      assert(len % 4 === 0);
	      var res = new Array(len / 4);
	      for (var i = 0, k = start; i < res.length; i++, k += 4) {
	        var w;
	        if (endian === 'big') w = msg[k] << 24 | msg[k + 1] << 16 | msg[k + 2] << 8 | msg[k + 3];else w = msg[k + 3] << 24 | msg[k + 2] << 16 | msg[k + 1] << 8 | msg[k];
	        res[i] = w >>> 0;
	      }
	      return res;
	    }
	    exports.join32 = join32;

	    function split32(msg, endian) {
	      var res = new Array(msg.length * 4);
	      for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
	        var m = msg[i];
	        if (endian === 'big') {
	          res[k] = m >>> 24;
	          res[k + 1] = m >>> 16 & 0xff;
	          res[k + 2] = m >>> 8 & 0xff;
	          res[k + 3] = m & 0xff;
	        } else {
	          res[k + 3] = m >>> 24;
	          res[k + 2] = m >>> 16 & 0xff;
	          res[k + 1] = m >>> 8 & 0xff;
	          res[k] = m & 0xff;
	        }
	      }
	      return res;
	    }
	    exports.split32 = split32;

	    function rotr32(w, b) {
	      return w >>> b | w << 32 - b;
	    }
	    exports.rotr32 = rotr32;

	    function rotl32(w, b) {
	      return w << b | w >>> 32 - b;
	    }
	    exports.rotl32 = rotl32;

	    function sum32(a, b) {
	      return a + b >>> 0;
	    }
	    exports.sum32 = sum32;

	    function sum32_3(a, b, c) {
	      return a + b + c >>> 0;
	    }
	    exports.sum32_3 = sum32_3;

	    function sum32_4(a, b, c, d) {
	      return a + b + c + d >>> 0;
	    }
	    exports.sum32_4 = sum32_4;

	    function sum32_5(a, b, c, d, e) {
	      return a + b + c + d + e >>> 0;
	    }
	    exports.sum32_5 = sum32_5;

	    function sum64(buf, pos, ah, al) {
	      var bh = buf[pos];
	      var bl = buf[pos + 1];

	      var lo = al + bl >>> 0;
	      var hi = (lo < al ? 1 : 0) + ah + bh;
	      buf[pos] = hi >>> 0;
	      buf[pos + 1] = lo;
	    }
	    exports.sum64 = sum64;

	    function sum64_hi(ah, al, bh, bl) {
	      var lo = al + bl >>> 0;
	      var hi = (lo < al ? 1 : 0) + ah + bh;
	      return hi >>> 0;
	    }
	    exports.sum64_hi = sum64_hi;

	    function sum64_lo(ah, al, bh, bl) {
	      var lo = al + bl;
	      return lo >>> 0;
	    }
	    exports.sum64_lo = sum64_lo;

	    function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
	      var carry = 0;
	      var lo = al;
	      lo = lo + bl >>> 0;
	      carry += lo < al ? 1 : 0;
	      lo = lo + cl >>> 0;
	      carry += lo < cl ? 1 : 0;
	      lo = lo + dl >>> 0;
	      carry += lo < dl ? 1 : 0;

	      var hi = ah + bh + ch + dh + carry;
	      return hi >>> 0;
	    }
	    exports.sum64_4_hi = sum64_4_hi;

	    function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
	      var lo = al + bl + cl + dl;
	      return lo >>> 0;
	    }
	    exports.sum64_4_lo = sum64_4_lo;

	    function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
	      var carry = 0;
	      var lo = al;
	      lo = lo + bl >>> 0;
	      carry += lo < al ? 1 : 0;
	      lo = lo + cl >>> 0;
	      carry += lo < cl ? 1 : 0;
	      lo = lo + dl >>> 0;
	      carry += lo < dl ? 1 : 0;
	      lo = lo + el >>> 0;
	      carry += lo < el ? 1 : 0;

	      var hi = ah + bh + ch + dh + eh + carry;
	      return hi >>> 0;
	    }
	    exports.sum64_5_hi = sum64_5_hi;

	    function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
	      var lo = al + bl + cl + dl + el;

	      return lo >>> 0;
	    }
	    exports.sum64_5_lo = sum64_5_lo;

	    function rotr64_hi(ah, al, num) {
	      var r = al << 32 - num | ah >>> num;
	      return r >>> 0;
	    }
	    exports.rotr64_hi = rotr64_hi;

	    function rotr64_lo(ah, al, num) {
	      var r = ah << 32 - num | al >>> num;
	      return r >>> 0;
	    }
	    exports.rotr64_lo = rotr64_lo;

	    function shr64_hi(ah, al, num) {
	      return ah >>> num;
	    }
	    exports.shr64_hi = shr64_hi;

	    function shr64_lo(ah, al, num) {
	      var r = ah << 32 - num | al >>> num;
	      return r >>> 0;
	    }
	    exports.shr64_lo = shr64_lo;

	    /***/
	  },
	  /* 2 */
	  /***/function (module, exports, __webpack_require__) {

	    /* WEBPACK VAR INJECTION */(function (module) {
	      (function (module, exports) {

	        // Utils

	        function assert(val, msg) {
	          if (!val) throw new Error(msg || 'Assertion failed');
	        }

	        // Could use `inherits` module, but don't want to move from single file
	        // architecture yet.
	        function inherits(ctor, superCtor) {
	          ctor.super_ = superCtor;
	          var TempCtor = function TempCtor() {};
	          TempCtor.prototype = superCtor.prototype;
	          ctor.prototype = new TempCtor();
	          ctor.prototype.constructor = ctor;
	        }

	        // BN

	        function BN(number, base, endian) {
	          if (BN.isBN(number)) {
	            return number;
	          }

	          this.negative = 0;
	          this.words = null;
	          this.length = 0;

	          // Reduction context
	          this.red = null;

	          if (number !== null) {
	            if (base === 'le' || base === 'be') {
	              endian = base;
	              base = 10;
	            }

	            this._init(number || 0, base || 10, endian || 'be');
	          }
	        }
	        if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object') {
	          module.exports = BN;
	        } else {
	          exports.BN = BN;
	        }

	        BN.BN = BN;
	        BN.wordSize = 26;

	        var Buffer;
	        try {
	          Buffer = __webpack_require__(15).Buffer;
	        } catch (e) {}

	        BN.isBN = function isBN(num) {
	          if (num instanceof BN) {
	            return true;
	          }

	          return num !== null && (typeof num === 'undefined' ? 'undefined' : _typeof(num)) === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
	        };

	        BN.max = function max(left, right) {
	          if (left.cmp(right) > 0) return left;
	          return right;
	        };

	        BN.min = function min(left, right) {
	          if (left.cmp(right) < 0) return left;
	          return right;
	        };

	        BN.prototype._init = function init(number, base, endian) {
	          if (typeof number === 'number') {
	            return this._initNumber(number, base, endian);
	          }

	          if ((typeof number === 'undefined' ? 'undefined' : _typeof(number)) === 'object') {
	            return this._initArray(number, base, endian);
	          }

	          if (base === 'hex') {
	            base = 16;
	          }
	          assert(base === (base | 0) && base >= 2 && base <= 36);

	          number = number.toString().replace(/\s+/g, '');
	          var start = 0;
	          if (number[0] === '-') {
	            start++;
	          }

	          if (base === 16) {
	            this._parseHex(number, start);
	          } else {
	            this._parseBase(number, base, start);
	          }

	          if (number[0] === '-') {
	            this.negative = 1;
	          }

	          this.strip();

	          if (endian !== 'le') return;

	          this._initArray(this.toArray(), base, endian);
	        };

	        BN.prototype._initNumber = function _initNumber(number, base, endian) {
	          if (number < 0) {
	            this.negative = 1;
	            number = -number;
	          }
	          if (number < 0x4000000) {
	            this.words = [number & 0x3ffffff];
	            this.length = 1;
	          } else if (number < 0x10000000000000) {
	            this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff];
	            this.length = 2;
	          } else {
	            assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
	            this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff, 1];
	            this.length = 3;
	          }

	          if (endian !== 'le') return;

	          // Reverse the bytes
	          this._initArray(this.toArray(), base, endian);
	        };

	        BN.prototype._initArray = function _initArray(number, base, endian) {
	          // Perhaps a Uint8Array
	          assert(typeof number.length === 'number');
	          if (number.length <= 0) {
	            this.words = [0];
	            this.length = 1;
	            return this;
	          }

	          this.length = Math.ceil(number.length / 3);
	          this.words = new Array(this.length);
	          for (var i = 0; i < this.length; i++) {
	            this.words[i] = 0;
	          }

	          var j, w;
	          var off = 0;
	          if (endian === 'be') {
	            for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
	              w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
	              this.words[j] |= w << off & 0x3ffffff;
	              this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
	              off += 24;
	              if (off >= 26) {
	                off -= 26;
	                j++;
	              }
	            }
	          } else if (endian === 'le') {
	            for (i = 0, j = 0; i < number.length; i += 3) {
	              w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
	              this.words[j] |= w << off & 0x3ffffff;
	              this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
	              off += 24;
	              if (off >= 26) {
	                off -= 26;
	                j++;
	              }
	            }
	          }
	          return this.strip();
	        };

	        function parseHex(str, start, end) {
	          var r = 0;
	          var len = Math.min(str.length, end);
	          for (var i = start; i < len; i++) {
	            var c = str.charCodeAt(i) - 48;

	            r <<= 4;

	            // 'a' - 'f'
	            if (c >= 49 && c <= 54) {
	              r |= c - 49 + 0xa;

	              // 'A' - 'F'
	            } else if (c >= 17 && c <= 22) {
	              r |= c - 17 + 0xa;

	              // '0' - '9'
	            } else {
	              r |= c & 0xf;
	            }
	          }
	          return r;
	        }

	        BN.prototype._parseHex = function _parseHex(number, start) {
	          // Create possibly bigger array to ensure that it fits the number
	          this.length = Math.ceil((number.length - start) / 6);
	          this.words = new Array(this.length);
	          for (var i = 0; i < this.length; i++) {
	            this.words[i] = 0;
	          }

	          var j, w;
	          // Scan 24-bit chunks and add them to the number
	          var off = 0;
	          for (i = number.length - 6, j = 0; i >= start; i -= 6) {
	            w = parseHex(number, i, i + 6);
	            this.words[j] |= w << off & 0x3ffffff;
	            // NOTE: `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb
	            this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
	            off += 24;
	            if (off >= 26) {
	              off -= 26;
	              j++;
	            }
	          }
	          if (i + 6 !== start) {
	            w = parseHex(number, start, i + 6);
	            this.words[j] |= w << off & 0x3ffffff;
	            this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
	          }
	          this.strip();
	        };

	        function parseBase(str, start, end, mul) {
	          var r = 0;
	          var len = Math.min(str.length, end);
	          for (var i = start; i < len; i++) {
	            var c = str.charCodeAt(i) - 48;

	            r *= mul;

	            // 'a'
	            if (c >= 49) {
	              r += c - 49 + 0xa;

	              // 'A'
	            } else if (c >= 17) {
	              r += c - 17 + 0xa;

	              // '0' - '9'
	            } else {
	              r += c;
	            }
	          }
	          return r;
	        }

	        BN.prototype._parseBase = function _parseBase(number, base, start) {
	          // Initialize as zero
	          this.words = [0];
	          this.length = 1;

	          // Find length of limb in base
	          for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
	            limbLen++;
	          }
	          limbLen--;
	          limbPow = limbPow / base | 0;

	          var total = number.length - start;
	          var mod = total % limbLen;
	          var end = Math.min(total, total - mod) + start;

	          var word = 0;
	          for (var i = start; i < end; i += limbLen) {
	            word = parseBase(number, i, i + limbLen, base);

	            this.imuln(limbPow);
	            if (this.words[0] + word < 0x4000000) {
	              this.words[0] += word;
	            } else {
	              this._iaddn(word);
	            }
	          }

	          if (mod !== 0) {
	            var pow = 1;
	            word = parseBase(number, i, number.length, base);

	            for (i = 0; i < mod; i++) {
	              pow *= base;
	            }

	            this.imuln(pow);
	            if (this.words[0] + word < 0x4000000) {
	              this.words[0] += word;
	            } else {
	              this._iaddn(word);
	            }
	          }
	        };

	        BN.prototype.copy = function copy(dest) {
	          dest.words = new Array(this.length);
	          for (var i = 0; i < this.length; i++) {
	            dest.words[i] = this.words[i];
	          }
	          dest.length = this.length;
	          dest.negative = this.negative;
	          dest.red = this.red;
	        };

	        BN.prototype.clone = function clone() {
	          var r = new BN(null);
	          this.copy(r);
	          return r;
	        };

	        BN.prototype._expand = function _expand(size) {
	          while (this.length < size) {
	            this.words[this.length++] = 0;
	          }
	          return this;
	        };

	        // Remove leading `0` from `this`
	        BN.prototype.strip = function strip() {
	          while (this.length > 1 && this.words[this.length - 1] === 0) {
	            this.length--;
	          }
	          return this._normSign();
	        };

	        BN.prototype._normSign = function _normSign() {
	          // -0 = 0
	          if (this.length === 1 && this.words[0] === 0) {
	            this.negative = 0;
	          }
	          return this;
	        };

	        BN.prototype.inspect = function inspect() {
	          return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
	        };

	        /*
	         var zeros = [];
	        var groupSizes = [];
	        var groupBases = [];
	         var s = '';
	        var i = -1;
	        while (++i < BN.wordSize) {
	          zeros[i] = s;
	          s += '0';
	        }
	        groupSizes[0] = 0;
	        groupSizes[1] = 0;
	        groupBases[0] = 0;
	        groupBases[1] = 0;
	        var base = 2 - 1;
	        while (++base < 36 + 1) {
	          var groupSize = 0;
	          var groupBase = 1;
	          while (groupBase < (1 << BN.wordSize) / base) {
	            groupBase *= base;
	            groupSize += 1;
	          }
	          groupSizes[base] = groupSize;
	          groupBases[base] = groupBase;
	        }
	         */

	        var zeros = ['', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000', '000000000', '0000000000', '00000000000', '000000000000', '0000000000000', '00000000000000', '000000000000000', '0000000000000000', '00000000000000000', '000000000000000000', '0000000000000000000', '00000000000000000000', '000000000000000000000', '0000000000000000000000', '00000000000000000000000', '000000000000000000000000', '0000000000000000000000000'];

	        var groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

	        var groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];

	        BN.prototype.toString = function toString(base, padding) {
	          base = base || 10;
	          padding = padding | 0 || 1;

	          var out;
	          if (base === 16 || base === 'hex') {
	            out = '';
	            var off = 0;
	            var carry = 0;
	            for (var i = 0; i < this.length; i++) {
	              var w = this.words[i];
	              var word = ((w << off | carry) & 0xffffff).toString(16);
	              carry = w >>> 24 - off & 0xffffff;
	              if (carry !== 0 || i !== this.length - 1) {
	                out = zeros[6 - word.length] + word + out;
	              } else {
	                out = word + out;
	              }
	              off += 2;
	              if (off >= 26) {
	                off -= 26;
	                i--;
	              }
	            }
	            if (carry !== 0) {
	              out = carry.toString(16) + out;
	            }
	            while (out.length % padding !== 0) {
	              out = '0' + out;
	            }
	            if (this.negative !== 0) {
	              out = '-' + out;
	            }
	            return out;
	          }

	          if (base === (base | 0) && base >= 2 && base <= 36) {
	            // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
	            var groupSize = groupSizes[base];
	            // var groupBase = Math.pow(base, groupSize);
	            var groupBase = groupBases[base];
	            out = '';
	            var c = this.clone();
	            c.negative = 0;
	            while (!c.isZero()) {
	              var r = c.modn(groupBase).toString(base);
	              c = c.idivn(groupBase);

	              if (!c.isZero()) {
	                out = zeros[groupSize - r.length] + r + out;
	              } else {
	                out = r + out;
	              }
	            }
	            if (this.isZero()) {
	              out = '0' + out;
	            }
	            while (out.length % padding !== 0) {
	              out = '0' + out;
	            }
	            if (this.negative !== 0) {
	              out = '-' + out;
	            }
	            return out;
	          }

	          assert(false, 'Base should be between 2 and 36');
	        };

	        BN.prototype.toNumber = function toNumber() {
	          var ret = this.words[0];
	          if (this.length === 2) {
	            ret += this.words[1] * 0x4000000;
	          } else if (this.length === 3 && this.words[2] === 0x01) {
	            // NOTE: at this stage it is known that the top bit is set
	            ret += 0x10000000000000 + this.words[1] * 0x4000000;
	          } else if (this.length > 2) {
	            assert(false, 'Number can only safely store up to 53 bits');
	          }
	          return this.negative !== 0 ? -ret : ret;
	        };

	        BN.prototype.toJSON = function toJSON() {
	          return this.toString(16);
	        };

	        BN.prototype.toBuffer = function toBuffer(endian, length) {
	          assert(typeof Buffer !== 'undefined');
	          return this.toArrayLike(Buffer, endian, length);
	        };

	        BN.prototype.toArray = function toArray(endian, length) {
	          return this.toArrayLike(Array, endian, length);
	        };

	        BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
	          var byteLength = this.byteLength();
	          var reqLength = length || Math.max(1, byteLength);
	          assert(byteLength <= reqLength, 'byte array longer than desired length');
	          assert(reqLength > 0, 'Requested array length <= 0');

	          this.strip();
	          var littleEndian = endian === 'le';
	          var res = new ArrayType(reqLength);

	          var b, i;
	          var q = this.clone();
	          if (!littleEndian) {
	            // Assume big-endian
	            for (i = 0; i < reqLength - byteLength; i++) {
	              res[i] = 0;
	            }

	            for (i = 0; !q.isZero(); i++) {
	              b = q.andln(0xff);
	              q.iushrn(8);

	              res[reqLength - i - 1] = b;
	            }
	          } else {
	            for (i = 0; !q.isZero(); i++) {
	              b = q.andln(0xff);
	              q.iushrn(8);

	              res[i] = b;
	            }

	            for (; i < reqLength; i++) {
	              res[i] = 0;
	            }
	          }

	          return res;
	        };

	        if (_Math$clz) {
	          BN.prototype._countBits = function _countBits(w) {
	            return 32 - _Math$clz(w);
	          };
	        } else {
	          BN.prototype._countBits = function _countBits(w) {
	            var t = w;
	            var r = 0;
	            if (t >= 0x1000) {
	              r += 13;
	              t >>>= 13;
	            }
	            if (t >= 0x40) {
	              r += 7;
	              t >>>= 7;
	            }
	            if (t >= 0x8) {
	              r += 4;
	              t >>>= 4;
	            }
	            if (t >= 0x02) {
	              r += 2;
	              t >>>= 2;
	            }
	            return r + t;
	          };
	        }

	        BN.prototype._zeroBits = function _zeroBits(w) {
	          // Short-cut
	          if (w === 0) return 26;

	          var t = w;
	          var r = 0;
	          if ((t & 0x1fff) === 0) {
	            r += 13;
	            t >>>= 13;
	          }
	          if ((t & 0x7f) === 0) {
	            r += 7;
	            t >>>= 7;
	          }
	          if ((t & 0xf) === 0) {
	            r += 4;
	            t >>>= 4;
	          }
	          if ((t & 0x3) === 0) {
	            r += 2;
	            t >>>= 2;
	          }
	          if ((t & 0x1) === 0) {
	            r++;
	          }
	          return r;
	        };

	        // Return number of used bits in a BN
	        BN.prototype.bitLength = function bitLength() {
	          var w = this.words[this.length - 1];
	          var hi = this._countBits(w);
	          return (this.length - 1) * 26 + hi;
	        };

	        function toBitArray(num) {
	          var w = new Array(num.bitLength());

	          for (var bit = 0; bit < w.length; bit++) {
	            var off = bit / 26 | 0;
	            var wbit = bit % 26;

	            w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
	          }

	          return w;
	        }

	        // Number of trailing zero bits
	        BN.prototype.zeroBits = function zeroBits() {
	          if (this.isZero()) return 0;

	          var r = 0;
	          for (var i = 0; i < this.length; i++) {
	            var b = this._zeroBits(this.words[i]);
	            r += b;
	            if (b !== 26) break;
	          }
	          return r;
	        };

	        BN.prototype.byteLength = function byteLength() {
	          return Math.ceil(this.bitLength() / 8);
	        };

	        BN.prototype.toTwos = function toTwos(width) {
	          if (this.negative !== 0) {
	            return this.abs().inotn(width).iaddn(1);
	          }
	          return this.clone();
	        };

	        BN.prototype.fromTwos = function fromTwos(width) {
	          if (this.testn(width - 1)) {
	            return this.notn(width).iaddn(1).ineg();
	          }
	          return this.clone();
	        };

	        BN.prototype.isNeg = function isNeg() {
	          return this.negative !== 0;
	        };

	        // Return negative clone of `this`
	        BN.prototype.neg = function neg() {
	          return this.clone().ineg();
	        };

	        BN.prototype.ineg = function ineg() {
	          if (!this.isZero()) {
	            this.negative ^= 1;
	          }

	          return this;
	        };

	        // Or `num` with `this` in-place
	        BN.prototype.iuor = function iuor(num) {
	          while (this.length < num.length) {
	            this.words[this.length++] = 0;
	          }

	          for (var i = 0; i < num.length; i++) {
	            this.words[i] = this.words[i] | num.words[i];
	          }

	          return this.strip();
	        };

	        BN.prototype.ior = function ior(num) {
	          assert((this.negative | num.negative) === 0);
	          return this.iuor(num);
	        };

	        // Or `num` with `this`
	        BN.prototype.or = function or(num) {
	          if (this.length > num.length) return this.clone().ior(num);
	          return num.clone().ior(this);
	        };

	        BN.prototype.uor = function uor(num) {
	          if (this.length > num.length) return this.clone().iuor(num);
	          return num.clone().iuor(this);
	        };

	        // And `num` with `this` in-place
	        BN.prototype.iuand = function iuand(num) {
	          // b = min-length(num, this)
	          var b;
	          if (this.length > num.length) {
	            b = num;
	          } else {
	            b = this;
	          }

	          for (var i = 0; i < b.length; i++) {
	            this.words[i] = this.words[i] & num.words[i];
	          }

	          this.length = b.length;

	          return this.strip();
	        };

	        BN.prototype.iand = function iand(num) {
	          assert((this.negative | num.negative) === 0);
	          return this.iuand(num);
	        };

	        // And `num` with `this`
	        BN.prototype.and = function and(num) {
	          if (this.length > num.length) return this.clone().iand(num);
	          return num.clone().iand(this);
	        };

	        BN.prototype.uand = function uand(num) {
	          if (this.length > num.length) return this.clone().iuand(num);
	          return num.clone().iuand(this);
	        };

	        // Xor `num` with `this` in-place
	        BN.prototype.iuxor = function iuxor(num) {
	          // a.length > b.length
	          var a;
	          var b;
	          if (this.length > num.length) {
	            a = this;
	            b = num;
	          } else {
	            a = num;
	            b = this;
	          }

	          for (var i = 0; i < b.length; i++) {
	            this.words[i] = a.words[i] ^ b.words[i];
	          }

	          if (this !== a) {
	            for (; i < a.length; i++) {
	              this.words[i] = a.words[i];
	            }
	          }

	          this.length = a.length;

	          return this.strip();
	        };

	        BN.prototype.ixor = function ixor(num) {
	          assert((this.negative | num.negative) === 0);
	          return this.iuxor(num);
	        };

	        // Xor `num` with `this`
	        BN.prototype.xor = function xor(num) {
	          if (this.length > num.length) return this.clone().ixor(num);
	          return num.clone().ixor(this);
	        };

	        BN.prototype.uxor = function uxor(num) {
	          if (this.length > num.length) return this.clone().iuxor(num);
	          return num.clone().iuxor(this);
	        };

	        // Not ``this`` with ``width`` bitwidth
	        BN.prototype.inotn = function inotn(width) {
	          assert(typeof width === 'number' && width >= 0);

	          var bytesNeeded = Math.ceil(width / 26) | 0;
	          var bitsLeft = width % 26;

	          // Extend the buffer with leading zeroes
	          this._expand(bytesNeeded);

	          if (bitsLeft > 0) {
	            bytesNeeded--;
	          }

	          // Handle complete words
	          for (var i = 0; i < bytesNeeded; i++) {
	            this.words[i] = ~this.words[i] & 0x3ffffff;
	          }

	          // Handle the residue
	          if (bitsLeft > 0) {
	            this.words[i] = ~this.words[i] & 0x3ffffff >> 26 - bitsLeft;
	          }

	          // And remove leading zeroes
	          return this.strip();
	        };

	        BN.prototype.notn = function notn(width) {
	          return this.clone().inotn(width);
	        };

	        // Set `bit` of `this`
	        BN.prototype.setn = function setn(bit, val) {
	          assert(typeof bit === 'number' && bit >= 0);

	          var off = bit / 26 | 0;
	          var wbit = bit % 26;

	          this._expand(off + 1);

	          if (val) {
	            this.words[off] = this.words[off] | 1 << wbit;
	          } else {
	            this.words[off] = this.words[off] & ~(1 << wbit);
	          }

	          return this.strip();
	        };

	        // Add `num` to `this` in-place
	        BN.prototype.iadd = function iadd(num) {
	          var r;

	          // negative + positive
	          if (this.negative !== 0 && num.negative === 0) {
	            this.negative = 0;
	            r = this.isub(num);
	            this.negative ^= 1;
	            return this._normSign();

	            // positive + negative
	          } else if (this.negative === 0 && num.negative !== 0) {
	            num.negative = 0;
	            r = this.isub(num);
	            num.negative = 1;
	            return r._normSign();
	          }

	          // a.length > b.length
	          var a, b;
	          if (this.length > num.length) {
	            a = this;
	            b = num;
	          } else {
	            a = num;
	            b = this;
	          }

	          var carry = 0;
	          for (var i = 0; i < b.length; i++) {
	            r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
	            this.words[i] = r & 0x3ffffff;
	            carry = r >>> 26;
	          }
	          for (; carry !== 0 && i < a.length; i++) {
	            r = (a.words[i] | 0) + carry;
	            this.words[i] = r & 0x3ffffff;
	            carry = r >>> 26;
	          }

	          this.length = a.length;
	          if (carry !== 0) {
	            this.words[this.length] = carry;
	            this.length++;
	            // Copy the rest of the words
	          } else if (a !== this) {
	            for (; i < a.length; i++) {
	              this.words[i] = a.words[i];
	            }
	          }

	          return this;
	        };

	        // Add `num` to `this`
	        BN.prototype.add = function add(num) {
	          var res;
	          if (num.negative !== 0 && this.negative === 0) {
	            num.negative = 0;
	            res = this.sub(num);
	            num.negative ^= 1;
	            return res;
	          } else if (num.negative === 0 && this.negative !== 0) {
	            this.negative = 0;
	            res = num.sub(this);
	            this.negative = 1;
	            return res;
	          }

	          if (this.length > num.length) return this.clone().iadd(num);

	          return num.clone().iadd(this);
	        };

	        // Subtract `num` from `this` in-place
	        BN.prototype.isub = function isub(num) {
	          // this - (-num) = this + num
	          if (num.negative !== 0) {
	            num.negative = 0;
	            var r = this.iadd(num);
	            num.negative = 1;
	            return r._normSign();

	            // -this - num = -(this + num)
	          } else if (this.negative !== 0) {
	            this.negative = 0;
	            this.iadd(num);
	            this.negative = 1;
	            return this._normSign();
	          }

	          // At this point both numbers are positive
	          var cmp = this.cmp(num);

	          // Optimization - zeroify
	          if (cmp === 0) {
	            this.negative = 0;
	            this.length = 1;
	            this.words[0] = 0;
	            return this;
	          }

	          // a > b
	          var a, b;
	          if (cmp > 0) {
	            a = this;
	            b = num;
	          } else {
	            a = num;
	            b = this;
	          }

	          var carry = 0;
	          for (var i = 0; i < b.length; i++) {
	            r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
	            carry = r >> 26;
	            this.words[i] = r & 0x3ffffff;
	          }
	          for (; carry !== 0 && i < a.length; i++) {
	            r = (a.words[i] | 0) + carry;
	            carry = r >> 26;
	            this.words[i] = r & 0x3ffffff;
	          }

	          // Copy rest of the words
	          if (carry === 0 && i < a.length && a !== this) {
	            for (; i < a.length; i++) {
	              this.words[i] = a.words[i];
	            }
	          }

	          this.length = Math.max(this.length, i);

	          if (a !== this) {
	            this.negative = 1;
	          }

	          return this.strip();
	        };

	        // Subtract `num` from `this`
	        BN.prototype.sub = function sub(num) {
	          return this.clone().isub(num);
	        };

	        function smallMulTo(self, num, out) {
	          out.negative = num.negative ^ self.negative;
	          var len = self.length + num.length | 0;
	          out.length = len;
	          len = len - 1 | 0;

	          // Peel one iteration (compiler can't do it, because of code complexity)
	          var a = self.words[0] | 0;
	          var b = num.words[0] | 0;
	          var r = a * b;

	          var lo = r & 0x3ffffff;
	          var carry = r / 0x4000000 | 0;
	          out.words[0] = lo;

	          for (var k = 1; k < len; k++) {
	            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	            // note that ncarry could be >= 0x3ffffff
	            var ncarry = carry >>> 26;
	            var rword = carry & 0x3ffffff;
	            var maxJ = Math.min(k, num.length - 1);
	            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
	              var i = k - j | 0;
	              a = self.words[i] | 0;
	              b = num.words[j] | 0;
	              r = a * b + rword;
	              ncarry += r / 0x4000000 | 0;
	              rword = r & 0x3ffffff;
	            }
	            out.words[k] = rword | 0;
	            carry = ncarry | 0;
	          }
	          if (carry !== 0) {
	            out.words[k] = carry | 0;
	          } else {
	            out.length--;
	          }

	          return out.strip();
	        }

	        // TODO(indutny): it may be reasonable to omit it for users who don't need
	        // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
	        // multiplication (like elliptic secp256k1).
	        var comb10MulTo = function comb10MulTo(self, num, out) {
	          var a = self.words;
	          var b = num.words;
	          var o = out.words;
	          var c = 0;
	          var lo;
	          var mid;
	          var hi;
	          var a0 = a[0] | 0;
	          var al0 = a0 & 0x1fff;
	          var ah0 = a0 >>> 13;
	          var a1 = a[1] | 0;
	          var al1 = a1 & 0x1fff;
	          var ah1 = a1 >>> 13;
	          var a2 = a[2] | 0;
	          var al2 = a2 & 0x1fff;
	          var ah2 = a2 >>> 13;
	          var a3 = a[3] | 0;
	          var al3 = a3 & 0x1fff;
	          var ah3 = a3 >>> 13;
	          var a4 = a[4] | 0;
	          var al4 = a4 & 0x1fff;
	          var ah4 = a4 >>> 13;
	          var a5 = a[5] | 0;
	          var al5 = a5 & 0x1fff;
	          var ah5 = a5 >>> 13;
	          var a6 = a[6] | 0;
	          var al6 = a6 & 0x1fff;
	          var ah6 = a6 >>> 13;
	          var a7 = a[7] | 0;
	          var al7 = a7 & 0x1fff;
	          var ah7 = a7 >>> 13;
	          var a8 = a[8] | 0;
	          var al8 = a8 & 0x1fff;
	          var ah8 = a8 >>> 13;
	          var a9 = a[9] | 0;
	          var al9 = a9 & 0x1fff;
	          var ah9 = a9 >>> 13;
	          var b0 = b[0] | 0;
	          var bl0 = b0 & 0x1fff;
	          var bh0 = b0 >>> 13;
	          var b1 = b[1] | 0;
	          var bl1 = b1 & 0x1fff;
	          var bh1 = b1 >>> 13;
	          var b2 = b[2] | 0;
	          var bl2 = b2 & 0x1fff;
	          var bh2 = b2 >>> 13;
	          var b3 = b[3] | 0;
	          var bl3 = b3 & 0x1fff;
	          var bh3 = b3 >>> 13;
	          var b4 = b[4] | 0;
	          var bl4 = b4 & 0x1fff;
	          var bh4 = b4 >>> 13;
	          var b5 = b[5] | 0;
	          var bl5 = b5 & 0x1fff;
	          var bh5 = b5 >>> 13;
	          var b6 = b[6] | 0;
	          var bl6 = b6 & 0x1fff;
	          var bh6 = b6 >>> 13;
	          var b7 = b[7] | 0;
	          var bl7 = b7 & 0x1fff;
	          var bh7 = b7 >>> 13;
	          var b8 = b[8] | 0;
	          var bl8 = b8 & 0x1fff;
	          var bh8 = b8 >>> 13;
	          var b9 = b[9] | 0;
	          var bl9 = b9 & 0x1fff;
	          var bh9 = b9 >>> 13;

	          out.negative = self.negative ^ num.negative;
	          out.length = 19;
	          /* k = 0 */
	          lo = _Math$imul(al0, bl0);
	          mid = _Math$imul(al0, bh0);
	          mid = mid + _Math$imul(ah0, bl0) | 0;
	          hi = _Math$imul(ah0, bh0);
	          var w0 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
	          w0 &= 0x3ffffff;
	          /* k = 1 */
	          lo = _Math$imul(al1, bl0);
	          mid = _Math$imul(al1, bh0);
	          mid = mid + _Math$imul(ah1, bl0) | 0;
	          hi = _Math$imul(ah1, bh0);
	          lo = lo + _Math$imul(al0, bl1) | 0;
	          mid = mid + _Math$imul(al0, bh1) | 0;
	          mid = mid + _Math$imul(ah0, bl1) | 0;
	          hi = hi + _Math$imul(ah0, bh1) | 0;
	          var w1 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
	          w1 &= 0x3ffffff;
	          /* k = 2 */
	          lo = _Math$imul(al2, bl0);
	          mid = _Math$imul(al2, bh0);
	          mid = mid + _Math$imul(ah2, bl0) | 0;
	          hi = _Math$imul(ah2, bh0);
	          lo = lo + _Math$imul(al1, bl1) | 0;
	          mid = mid + _Math$imul(al1, bh1) | 0;
	          mid = mid + _Math$imul(ah1, bl1) | 0;
	          hi = hi + _Math$imul(ah1, bh1) | 0;
	          lo = lo + _Math$imul(al0, bl2) | 0;
	          mid = mid + _Math$imul(al0, bh2) | 0;
	          mid = mid + _Math$imul(ah0, bl2) | 0;
	          hi = hi + _Math$imul(ah0, bh2) | 0;
	          var w2 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
	          w2 &= 0x3ffffff;
	          /* k = 3 */
	          lo = _Math$imul(al3, bl0);
	          mid = _Math$imul(al3, bh0);
	          mid = mid + _Math$imul(ah3, bl0) | 0;
	          hi = _Math$imul(ah3, bh0);
	          lo = lo + _Math$imul(al2, bl1) | 0;
	          mid = mid + _Math$imul(al2, bh1) | 0;
	          mid = mid + _Math$imul(ah2, bl1) | 0;
	          hi = hi + _Math$imul(ah2, bh1) | 0;
	          lo = lo + _Math$imul(al1, bl2) | 0;
	          mid = mid + _Math$imul(al1, bh2) | 0;
	          mid = mid + _Math$imul(ah1, bl2) | 0;
	          hi = hi + _Math$imul(ah1, bh2) | 0;
	          lo = lo + _Math$imul(al0, bl3) | 0;
	          mid = mid + _Math$imul(al0, bh3) | 0;
	          mid = mid + _Math$imul(ah0, bl3) | 0;
	          hi = hi + _Math$imul(ah0, bh3) | 0;
	          var w3 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
	          w3 &= 0x3ffffff;
	          /* k = 4 */
	          lo = _Math$imul(al4, bl0);
	          mid = _Math$imul(al4, bh0);
	          mid = mid + _Math$imul(ah4, bl0) | 0;
	          hi = _Math$imul(ah4, bh0);
	          lo = lo + _Math$imul(al3, bl1) | 0;
	          mid = mid + _Math$imul(al3, bh1) | 0;
	          mid = mid + _Math$imul(ah3, bl1) | 0;
	          hi = hi + _Math$imul(ah3, bh1) | 0;
	          lo = lo + _Math$imul(al2, bl2) | 0;
	          mid = mid + _Math$imul(al2, bh2) | 0;
	          mid = mid + _Math$imul(ah2, bl2) | 0;
	          hi = hi + _Math$imul(ah2, bh2) | 0;
	          lo = lo + _Math$imul(al1, bl3) | 0;
	          mid = mid + _Math$imul(al1, bh3) | 0;
	          mid = mid + _Math$imul(ah1, bl3) | 0;
	          hi = hi + _Math$imul(ah1, bh3) | 0;
	          lo = lo + _Math$imul(al0, bl4) | 0;
	          mid = mid + _Math$imul(al0, bh4) | 0;
	          mid = mid + _Math$imul(ah0, bl4) | 0;
	          hi = hi + _Math$imul(ah0, bh4) | 0;
	          var w4 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
	          w4 &= 0x3ffffff;
	          /* k = 5 */
	          lo = _Math$imul(al5, bl0);
	          mid = _Math$imul(al5, bh0);
	          mid = mid + _Math$imul(ah5, bl0) | 0;
	          hi = _Math$imul(ah5, bh0);
	          lo = lo + _Math$imul(al4, bl1) | 0;
	          mid = mid + _Math$imul(al4, bh1) | 0;
	          mid = mid + _Math$imul(ah4, bl1) | 0;
	          hi = hi + _Math$imul(ah4, bh1) | 0;
	          lo = lo + _Math$imul(al3, bl2) | 0;
	          mid = mid + _Math$imul(al3, bh2) | 0;
	          mid = mid + _Math$imul(ah3, bl2) | 0;
	          hi = hi + _Math$imul(ah3, bh2) | 0;
	          lo = lo + _Math$imul(al2, bl3) | 0;
	          mid = mid + _Math$imul(al2, bh3) | 0;
	          mid = mid + _Math$imul(ah2, bl3) | 0;
	          hi = hi + _Math$imul(ah2, bh3) | 0;
	          lo = lo + _Math$imul(al1, bl4) | 0;
	          mid = mid + _Math$imul(al1, bh4) | 0;
	          mid = mid + _Math$imul(ah1, bl4) | 0;
	          hi = hi + _Math$imul(ah1, bh4) | 0;
	          lo = lo + _Math$imul(al0, bl5) | 0;
	          mid = mid + _Math$imul(al0, bh5) | 0;
	          mid = mid + _Math$imul(ah0, bl5) | 0;
	          hi = hi + _Math$imul(ah0, bh5) | 0;
	          var w5 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
	          w5 &= 0x3ffffff;
	          /* k = 6 */
	          lo = _Math$imul(al6, bl0);
	          mid = _Math$imul(al6, bh0);
	          mid = mid + _Math$imul(ah6, bl0) | 0;
	          hi = _Math$imul(ah6, bh0);
	          lo = lo + _Math$imul(al5, bl1) | 0;
	          mid = mid + _Math$imul(al5, bh1) | 0;
	          mid = mid + _Math$imul(ah5, bl1) | 0;
	          hi = hi + _Math$imul(ah5, bh1) | 0;
	          lo = lo + _Math$imul(al4, bl2) | 0;
	          mid = mid + _Math$imul(al4, bh2) | 0;
	          mid = mid + _Math$imul(ah4, bl2) | 0;
	          hi = hi + _Math$imul(ah4, bh2) | 0;
	          lo = lo + _Math$imul(al3, bl3) | 0;
	          mid = mid + _Math$imul(al3, bh3) | 0;
	          mid = mid + _Math$imul(ah3, bl3) | 0;
	          hi = hi + _Math$imul(ah3, bh3) | 0;
	          lo = lo + _Math$imul(al2, bl4) | 0;
	          mid = mid + _Math$imul(al2, bh4) | 0;
	          mid = mid + _Math$imul(ah2, bl4) | 0;
	          hi = hi + _Math$imul(ah2, bh4) | 0;
	          lo = lo + _Math$imul(al1, bl5) | 0;
	          mid = mid + _Math$imul(al1, bh5) | 0;
	          mid = mid + _Math$imul(ah1, bl5) | 0;
	          hi = hi + _Math$imul(ah1, bh5) | 0;
	          lo = lo + _Math$imul(al0, bl6) | 0;
	          mid = mid + _Math$imul(al0, bh6) | 0;
	          mid = mid + _Math$imul(ah0, bl6) | 0;
	          hi = hi + _Math$imul(ah0, bh6) | 0;
	          var w6 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
	          w6 &= 0x3ffffff;
	          /* k = 7 */
	          lo = _Math$imul(al7, bl0);
	          mid = _Math$imul(al7, bh0);
	          mid = mid + _Math$imul(ah7, bl0) | 0;
	          hi = _Math$imul(ah7, bh0);
	          lo = lo + _Math$imul(al6, bl1) | 0;
	          mid = mid + _Math$imul(al6, bh1) | 0;
	          mid = mid + _Math$imul(ah6, bl1) | 0;
	          hi = hi + _Math$imul(ah6, bh1) | 0;
	          lo = lo + _Math$imul(al5, bl2) | 0;
	          mid = mid + _Math$imul(al5, bh2) | 0;
	          mid = mid + _Math$imul(ah5, bl2) | 0;
	          hi = hi + _Math$imul(ah5, bh2) | 0;
	          lo = lo + _Math$imul(al4, bl3) | 0;
	          mid = mid + _Math$imul(al4, bh3) | 0;
	          mid = mid + _Math$imul(ah4, bl3) | 0;
	          hi = hi + _Math$imul(ah4, bh3) | 0;
	          lo = lo + _Math$imul(al3, bl4) | 0;
	          mid = mid + _Math$imul(al3, bh4) | 0;
	          mid = mid + _Math$imul(ah3, bl4) | 0;
	          hi = hi + _Math$imul(ah3, bh4) | 0;
	          lo = lo + _Math$imul(al2, bl5) | 0;
	          mid = mid + _Math$imul(al2, bh5) | 0;
	          mid = mid + _Math$imul(ah2, bl5) | 0;
	          hi = hi + _Math$imul(ah2, bh5) | 0;
	          lo = lo + _Math$imul(al1, bl6) | 0;
	          mid = mid + _Math$imul(al1, bh6) | 0;
	          mid = mid + _Math$imul(ah1, bl6) | 0;
	          hi = hi + _Math$imul(ah1, bh6) | 0;
	          lo = lo + _Math$imul(al0, bl7) | 0;
	          mid = mid + _Math$imul(al0, bh7) | 0;
	          mid = mid + _Math$imul(ah0, bl7) | 0;
	          hi = hi + _Math$imul(ah0, bh7) | 0;
	          var w7 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
	          w7 &= 0x3ffffff;
	          /* k = 8 */
	          lo = _Math$imul(al8, bl0);
	          mid = _Math$imul(al8, bh0);
	          mid = mid + _Math$imul(ah8, bl0) | 0;
	          hi = _Math$imul(ah8, bh0);
	          lo = lo + _Math$imul(al7, bl1) | 0;
	          mid = mid + _Math$imul(al7, bh1) | 0;
	          mid = mid + _Math$imul(ah7, bl1) | 0;
	          hi = hi + _Math$imul(ah7, bh1) | 0;
	          lo = lo + _Math$imul(al6, bl2) | 0;
	          mid = mid + _Math$imul(al6, bh2) | 0;
	          mid = mid + _Math$imul(ah6, bl2) | 0;
	          hi = hi + _Math$imul(ah6, bh2) | 0;
	          lo = lo + _Math$imul(al5, bl3) | 0;
	          mid = mid + _Math$imul(al5, bh3) | 0;
	          mid = mid + _Math$imul(ah5, bl3) | 0;
	          hi = hi + _Math$imul(ah5, bh3) | 0;
	          lo = lo + _Math$imul(al4, bl4) | 0;
	          mid = mid + _Math$imul(al4, bh4) | 0;
	          mid = mid + _Math$imul(ah4, bl4) | 0;
	          hi = hi + _Math$imul(ah4, bh4) | 0;
	          lo = lo + _Math$imul(al3, bl5) | 0;
	          mid = mid + _Math$imul(al3, bh5) | 0;
	          mid = mid + _Math$imul(ah3, bl5) | 0;
	          hi = hi + _Math$imul(ah3, bh5) | 0;
	          lo = lo + _Math$imul(al2, bl6) | 0;
	          mid = mid + _Math$imul(al2, bh6) | 0;
	          mid = mid + _Math$imul(ah2, bl6) | 0;
	          hi = hi + _Math$imul(ah2, bh6) | 0;
	          lo = lo + _Math$imul(al1, bl7) | 0;
	          mid = mid + _Math$imul(al1, bh7) | 0;
	          mid = mid + _Math$imul(ah1, bl7) | 0;
	          hi = hi + _Math$imul(ah1, bh7) | 0;
	          lo = lo + _Math$imul(al0, bl8) | 0;
	          mid = mid + _Math$imul(al0, bh8) | 0;
	          mid = mid + _Math$imul(ah0, bl8) | 0;
	          hi = hi + _Math$imul(ah0, bh8) | 0;
	          var w8 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
	          w8 &= 0x3ffffff;
	          /* k = 9 */
	          lo = _Math$imul(al9, bl0);
	          mid = _Math$imul(al9, bh0);
	          mid = mid + _Math$imul(ah9, bl0) | 0;
	          hi = _Math$imul(ah9, bh0);
	          lo = lo + _Math$imul(al8, bl1) | 0;
	          mid = mid + _Math$imul(al8, bh1) | 0;
	          mid = mid + _Math$imul(ah8, bl1) | 0;
	          hi = hi + _Math$imul(ah8, bh1) | 0;
	          lo = lo + _Math$imul(al7, bl2) | 0;
	          mid = mid + _Math$imul(al7, bh2) | 0;
	          mid = mid + _Math$imul(ah7, bl2) | 0;
	          hi = hi + _Math$imul(ah7, bh2) | 0;
	          lo = lo + _Math$imul(al6, bl3) | 0;
	          mid = mid + _Math$imul(al6, bh3) | 0;
	          mid = mid + _Math$imul(ah6, bl3) | 0;
	          hi = hi + _Math$imul(ah6, bh3) | 0;
	          lo = lo + _Math$imul(al5, bl4) | 0;
	          mid = mid + _Math$imul(al5, bh4) | 0;
	          mid = mid + _Math$imul(ah5, bl4) | 0;
	          hi = hi + _Math$imul(ah5, bh4) | 0;
	          lo = lo + _Math$imul(al4, bl5) | 0;
	          mid = mid + _Math$imul(al4, bh5) | 0;
	          mid = mid + _Math$imul(ah4, bl5) | 0;
	          hi = hi + _Math$imul(ah4, bh5) | 0;
	          lo = lo + _Math$imul(al3, bl6) | 0;
	          mid = mid + _Math$imul(al3, bh6) | 0;
	          mid = mid + _Math$imul(ah3, bl6) | 0;
	          hi = hi + _Math$imul(ah3, bh6) | 0;
	          lo = lo + _Math$imul(al2, bl7) | 0;
	          mid = mid + _Math$imul(al2, bh7) | 0;
	          mid = mid + _Math$imul(ah2, bl7) | 0;
	          hi = hi + _Math$imul(ah2, bh7) | 0;
	          lo = lo + _Math$imul(al1, bl8) | 0;
	          mid = mid + _Math$imul(al1, bh8) | 0;
	          mid = mid + _Math$imul(ah1, bl8) | 0;
	          hi = hi + _Math$imul(ah1, bh8) | 0;
	          lo = lo + _Math$imul(al0, bl9) | 0;
	          mid = mid + _Math$imul(al0, bh9) | 0;
	          mid = mid + _Math$imul(ah0, bl9) | 0;
	          hi = hi + _Math$imul(ah0, bh9) | 0;
	          var w9 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
	          w9 &= 0x3ffffff;
	          /* k = 10 */
	          lo = _Math$imul(al9, bl1);
	          mid = _Math$imul(al9, bh1);
	          mid = mid + _Math$imul(ah9, bl1) | 0;
	          hi = _Math$imul(ah9, bh1);
	          lo = lo + _Math$imul(al8, bl2) | 0;
	          mid = mid + _Math$imul(al8, bh2) | 0;
	          mid = mid + _Math$imul(ah8, bl2) | 0;
	          hi = hi + _Math$imul(ah8, bh2) | 0;
	          lo = lo + _Math$imul(al7, bl3) | 0;
	          mid = mid + _Math$imul(al7, bh3) | 0;
	          mid = mid + _Math$imul(ah7, bl3) | 0;
	          hi = hi + _Math$imul(ah7, bh3) | 0;
	          lo = lo + _Math$imul(al6, bl4) | 0;
	          mid = mid + _Math$imul(al6, bh4) | 0;
	          mid = mid + _Math$imul(ah6, bl4) | 0;
	          hi = hi + _Math$imul(ah6, bh4) | 0;
	          lo = lo + _Math$imul(al5, bl5) | 0;
	          mid = mid + _Math$imul(al5, bh5) | 0;
	          mid = mid + _Math$imul(ah5, bl5) | 0;
	          hi = hi + _Math$imul(ah5, bh5) | 0;
	          lo = lo + _Math$imul(al4, bl6) | 0;
	          mid = mid + _Math$imul(al4, bh6) | 0;
	          mid = mid + _Math$imul(ah4, bl6) | 0;
	          hi = hi + _Math$imul(ah4, bh6) | 0;
	          lo = lo + _Math$imul(al3, bl7) | 0;
	          mid = mid + _Math$imul(al3, bh7) | 0;
	          mid = mid + _Math$imul(ah3, bl7) | 0;
	          hi = hi + _Math$imul(ah3, bh7) | 0;
	          lo = lo + _Math$imul(al2, bl8) | 0;
	          mid = mid + _Math$imul(al2, bh8) | 0;
	          mid = mid + _Math$imul(ah2, bl8) | 0;
	          hi = hi + _Math$imul(ah2, bh8) | 0;
	          lo = lo + _Math$imul(al1, bl9) | 0;
	          mid = mid + _Math$imul(al1, bh9) | 0;
	          mid = mid + _Math$imul(ah1, bl9) | 0;
	          hi = hi + _Math$imul(ah1, bh9) | 0;
	          var w10 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
	          w10 &= 0x3ffffff;
	          /* k = 11 */
	          lo = _Math$imul(al9, bl2);
	          mid = _Math$imul(al9, bh2);
	          mid = mid + _Math$imul(ah9, bl2) | 0;
	          hi = _Math$imul(ah9, bh2);
	          lo = lo + _Math$imul(al8, bl3) | 0;
	          mid = mid + _Math$imul(al8, bh3) | 0;
	          mid = mid + _Math$imul(ah8, bl3) | 0;
	          hi = hi + _Math$imul(ah8, bh3) | 0;
	          lo = lo + _Math$imul(al7, bl4) | 0;
	          mid = mid + _Math$imul(al7, bh4) | 0;
	          mid = mid + _Math$imul(ah7, bl4) | 0;
	          hi = hi + _Math$imul(ah7, bh4) | 0;
	          lo = lo + _Math$imul(al6, bl5) | 0;
	          mid = mid + _Math$imul(al6, bh5) | 0;
	          mid = mid + _Math$imul(ah6, bl5) | 0;
	          hi = hi + _Math$imul(ah6, bh5) | 0;
	          lo = lo + _Math$imul(al5, bl6) | 0;
	          mid = mid + _Math$imul(al5, bh6) | 0;
	          mid = mid + _Math$imul(ah5, bl6) | 0;
	          hi = hi + _Math$imul(ah5, bh6) | 0;
	          lo = lo + _Math$imul(al4, bl7) | 0;
	          mid = mid + _Math$imul(al4, bh7) | 0;
	          mid = mid + _Math$imul(ah4, bl7) | 0;
	          hi = hi + _Math$imul(ah4, bh7) | 0;
	          lo = lo + _Math$imul(al3, bl8) | 0;
	          mid = mid + _Math$imul(al3, bh8) | 0;
	          mid = mid + _Math$imul(ah3, bl8) | 0;
	          hi = hi + _Math$imul(ah3, bh8) | 0;
	          lo = lo + _Math$imul(al2, bl9) | 0;
	          mid = mid + _Math$imul(al2, bh9) | 0;
	          mid = mid + _Math$imul(ah2, bl9) | 0;
	          hi = hi + _Math$imul(ah2, bh9) | 0;
	          var w11 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
	          w11 &= 0x3ffffff;
	          /* k = 12 */
	          lo = _Math$imul(al9, bl3);
	          mid = _Math$imul(al9, bh3);
	          mid = mid + _Math$imul(ah9, bl3) | 0;
	          hi = _Math$imul(ah9, bh3);
	          lo = lo + _Math$imul(al8, bl4) | 0;
	          mid = mid + _Math$imul(al8, bh4) | 0;
	          mid = mid + _Math$imul(ah8, bl4) | 0;
	          hi = hi + _Math$imul(ah8, bh4) | 0;
	          lo = lo + _Math$imul(al7, bl5) | 0;
	          mid = mid + _Math$imul(al7, bh5) | 0;
	          mid = mid + _Math$imul(ah7, bl5) | 0;
	          hi = hi + _Math$imul(ah7, bh5) | 0;
	          lo = lo + _Math$imul(al6, bl6) | 0;
	          mid = mid + _Math$imul(al6, bh6) | 0;
	          mid = mid + _Math$imul(ah6, bl6) | 0;
	          hi = hi + _Math$imul(ah6, bh6) | 0;
	          lo = lo + _Math$imul(al5, bl7) | 0;
	          mid = mid + _Math$imul(al5, bh7) | 0;
	          mid = mid + _Math$imul(ah5, bl7) | 0;
	          hi = hi + _Math$imul(ah5, bh7) | 0;
	          lo = lo + _Math$imul(al4, bl8) | 0;
	          mid = mid + _Math$imul(al4, bh8) | 0;
	          mid = mid + _Math$imul(ah4, bl8) | 0;
	          hi = hi + _Math$imul(ah4, bh8) | 0;
	          lo = lo + _Math$imul(al3, bl9) | 0;
	          mid = mid + _Math$imul(al3, bh9) | 0;
	          mid = mid + _Math$imul(ah3, bl9) | 0;
	          hi = hi + _Math$imul(ah3, bh9) | 0;
	          var w12 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
	          w12 &= 0x3ffffff;
	          /* k = 13 */
	          lo = _Math$imul(al9, bl4);
	          mid = _Math$imul(al9, bh4);
	          mid = mid + _Math$imul(ah9, bl4) | 0;
	          hi = _Math$imul(ah9, bh4);
	          lo = lo + _Math$imul(al8, bl5) | 0;
	          mid = mid + _Math$imul(al8, bh5) | 0;
	          mid = mid + _Math$imul(ah8, bl5) | 0;
	          hi = hi + _Math$imul(ah8, bh5) | 0;
	          lo = lo + _Math$imul(al7, bl6) | 0;
	          mid = mid + _Math$imul(al7, bh6) | 0;
	          mid = mid + _Math$imul(ah7, bl6) | 0;
	          hi = hi + _Math$imul(ah7, bh6) | 0;
	          lo = lo + _Math$imul(al6, bl7) | 0;
	          mid = mid + _Math$imul(al6, bh7) | 0;
	          mid = mid + _Math$imul(ah6, bl7) | 0;
	          hi = hi + _Math$imul(ah6, bh7) | 0;
	          lo = lo + _Math$imul(al5, bl8) | 0;
	          mid = mid + _Math$imul(al5, bh8) | 0;
	          mid = mid + _Math$imul(ah5, bl8) | 0;
	          hi = hi + _Math$imul(ah5, bh8) | 0;
	          lo = lo + _Math$imul(al4, bl9) | 0;
	          mid = mid + _Math$imul(al4, bh9) | 0;
	          mid = mid + _Math$imul(ah4, bl9) | 0;
	          hi = hi + _Math$imul(ah4, bh9) | 0;
	          var w13 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
	          w13 &= 0x3ffffff;
	          /* k = 14 */
	          lo = _Math$imul(al9, bl5);
	          mid = _Math$imul(al9, bh5);
	          mid = mid + _Math$imul(ah9, bl5) | 0;
	          hi = _Math$imul(ah9, bh5);
	          lo = lo + _Math$imul(al8, bl6) | 0;
	          mid = mid + _Math$imul(al8, bh6) | 0;
	          mid = mid + _Math$imul(ah8, bl6) | 0;
	          hi = hi + _Math$imul(ah8, bh6) | 0;
	          lo = lo + _Math$imul(al7, bl7) | 0;
	          mid = mid + _Math$imul(al7, bh7) | 0;
	          mid = mid + _Math$imul(ah7, bl7) | 0;
	          hi = hi + _Math$imul(ah7, bh7) | 0;
	          lo = lo + _Math$imul(al6, bl8) | 0;
	          mid = mid + _Math$imul(al6, bh8) | 0;
	          mid = mid + _Math$imul(ah6, bl8) | 0;
	          hi = hi + _Math$imul(ah6, bh8) | 0;
	          lo = lo + _Math$imul(al5, bl9) | 0;
	          mid = mid + _Math$imul(al5, bh9) | 0;
	          mid = mid + _Math$imul(ah5, bl9) | 0;
	          hi = hi + _Math$imul(ah5, bh9) | 0;
	          var w14 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
	          w14 &= 0x3ffffff;
	          /* k = 15 */
	          lo = _Math$imul(al9, bl6);
	          mid = _Math$imul(al9, bh6);
	          mid = mid + _Math$imul(ah9, bl6) | 0;
	          hi = _Math$imul(ah9, bh6);
	          lo = lo + _Math$imul(al8, bl7) | 0;
	          mid = mid + _Math$imul(al8, bh7) | 0;
	          mid = mid + _Math$imul(ah8, bl7) | 0;
	          hi = hi + _Math$imul(ah8, bh7) | 0;
	          lo = lo + _Math$imul(al7, bl8) | 0;
	          mid = mid + _Math$imul(al7, bh8) | 0;
	          mid = mid + _Math$imul(ah7, bl8) | 0;
	          hi = hi + _Math$imul(ah7, bh8) | 0;
	          lo = lo + _Math$imul(al6, bl9) | 0;
	          mid = mid + _Math$imul(al6, bh9) | 0;
	          mid = mid + _Math$imul(ah6, bl9) | 0;
	          hi = hi + _Math$imul(ah6, bh9) | 0;
	          var w15 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
	          w15 &= 0x3ffffff;
	          /* k = 16 */
	          lo = _Math$imul(al9, bl7);
	          mid = _Math$imul(al9, bh7);
	          mid = mid + _Math$imul(ah9, bl7) | 0;
	          hi = _Math$imul(ah9, bh7);
	          lo = lo + _Math$imul(al8, bl8) | 0;
	          mid = mid + _Math$imul(al8, bh8) | 0;
	          mid = mid + _Math$imul(ah8, bl8) | 0;
	          hi = hi + _Math$imul(ah8, bh8) | 0;
	          lo = lo + _Math$imul(al7, bl9) | 0;
	          mid = mid + _Math$imul(al7, bh9) | 0;
	          mid = mid + _Math$imul(ah7, bl9) | 0;
	          hi = hi + _Math$imul(ah7, bh9) | 0;
	          var w16 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
	          w16 &= 0x3ffffff;
	          /* k = 17 */
	          lo = _Math$imul(al9, bl8);
	          mid = _Math$imul(al9, bh8);
	          mid = mid + _Math$imul(ah9, bl8) | 0;
	          hi = _Math$imul(ah9, bh8);
	          lo = lo + _Math$imul(al8, bl9) | 0;
	          mid = mid + _Math$imul(al8, bh9) | 0;
	          mid = mid + _Math$imul(ah8, bl9) | 0;
	          hi = hi + _Math$imul(ah8, bh9) | 0;
	          var w17 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
	          w17 &= 0x3ffffff;
	          /* k = 18 */
	          lo = _Math$imul(al9, bl9);
	          mid = _Math$imul(al9, bh9);
	          mid = mid + _Math$imul(ah9, bl9) | 0;
	          hi = _Math$imul(ah9, bh9);
	          var w18 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
	          c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
	          w18 &= 0x3ffffff;
	          o[0] = w0;
	          o[1] = w1;
	          o[2] = w2;
	          o[3] = w3;
	          o[4] = w4;
	          o[5] = w5;
	          o[6] = w6;
	          o[7] = w7;
	          o[8] = w8;
	          o[9] = w9;
	          o[10] = w10;
	          o[11] = w11;
	          o[12] = w12;
	          o[13] = w13;
	          o[14] = w14;
	          o[15] = w15;
	          o[16] = w16;
	          o[17] = w17;
	          o[18] = w18;
	          if (c !== 0) {
	            o[19] = c;
	            out.length++;
	          }
	          return out;
	        };

	        // Polyfill comb
	        if (!_Math$imul) {
	          comb10MulTo = smallMulTo;
	        }

	        function bigMulTo(self, num, out) {
	          out.negative = num.negative ^ self.negative;
	          out.length = self.length + num.length;

	          var carry = 0;
	          var hncarry = 0;
	          for (var k = 0; k < out.length - 1; k++) {
	            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	            // note that ncarry could be >= 0x3ffffff
	            var ncarry = hncarry;
	            hncarry = 0;
	            var rword = carry & 0x3ffffff;
	            var maxJ = Math.min(k, num.length - 1);
	            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
	              var i = k - j;
	              var a = self.words[i] | 0;
	              var b = num.words[j] | 0;
	              var r = a * b;

	              var lo = r & 0x3ffffff;
	              ncarry = ncarry + (r / 0x4000000 | 0) | 0;
	              lo = lo + rword | 0;
	              rword = lo & 0x3ffffff;
	              ncarry = ncarry + (lo >>> 26) | 0;

	              hncarry += ncarry >>> 26;
	              ncarry &= 0x3ffffff;
	            }
	            out.words[k] = rword;
	            carry = ncarry;
	            ncarry = hncarry;
	          }
	          if (carry !== 0) {
	            out.words[k] = carry;
	          } else {
	            out.length--;
	          }

	          return out.strip();
	        }

	        function jumboMulTo(self, num, out) {
	          var fftm = new FFTM();
	          return fftm.mulp(self, num, out);
	        }

	        BN.prototype.mulTo = function mulTo(num, out) {
	          var res;
	          var len = this.length + num.length;
	          if (this.length === 10 && num.length === 10) {
	            res = comb10MulTo(this, num, out);
	          } else if (len < 63) {
	            res = smallMulTo(this, num, out);
	          } else if (len < 1024) {
	            res = bigMulTo(this, num, out);
	          } else {
	            res = jumboMulTo(this, num, out);
	          }

	          return res;
	        };

	        // Cooley-Tukey algorithm for FFT
	        // slightly revisited to rely on looping instead of recursion

	        function FFTM(x, y) {
	          this.x = x;
	          this.y = y;
	        }

	        FFTM.prototype.makeRBT = function makeRBT(N) {
	          var t = new Array(N);
	          var l = BN.prototype._countBits(N) - 1;
	          for (var i = 0; i < N; i++) {
	            t[i] = this.revBin(i, l, N);
	          }

	          return t;
	        };

	        // Returns binary-reversed representation of `x`
	        FFTM.prototype.revBin = function revBin(x, l, N) {
	          if (x === 0 || x === N - 1) return x;

	          var rb = 0;
	          for (var i = 0; i < l; i++) {
	            rb |= (x & 1) << l - i - 1;
	            x >>= 1;
	          }

	          return rb;
	        };

	        // Performs "tweedling" phase, therefore 'emulating'
	        // behaviour of the recursive algorithm
	        FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
	          for (var i = 0; i < N; i++) {
	            rtws[i] = rws[rbt[i]];
	            itws[i] = iws[rbt[i]];
	          }
	        };

	        FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
	          this.permute(rbt, rws, iws, rtws, itws, N);

	          for (var s = 1; s < N; s <<= 1) {
	            var l = s << 1;

	            var rtwdf = Math.cos(2 * Math.PI / l);
	            var itwdf = Math.sin(2 * Math.PI / l);

	            for (var p = 0; p < N; p += l) {
	              var rtwdf_ = rtwdf;
	              var itwdf_ = itwdf;

	              for (var j = 0; j < s; j++) {
	                var re = rtws[p + j];
	                var ie = itws[p + j];

	                var ro = rtws[p + j + s];
	                var io = itws[p + j + s];

	                var rx = rtwdf_ * ro - itwdf_ * io;

	                io = rtwdf_ * io + itwdf_ * ro;
	                ro = rx;

	                rtws[p + j] = re + ro;
	                itws[p + j] = ie + io;

	                rtws[p + j + s] = re - ro;
	                itws[p + j + s] = ie - io;

	                /* jshint maxdepth : false */
	                if (j !== l) {
	                  rx = rtwdf * rtwdf_ - itwdf * itwdf_;

	                  itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
	                  rtwdf_ = rx;
	                }
	              }
	            }
	          }
	        };

	        FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
	          var N = Math.max(m, n) | 1;
	          var odd = N & 1;
	          var i = 0;
	          for (N = N / 2 | 0; N; N = N >>> 1) {
	            i++;
	          }

	          return 1 << i + 1 + odd;
	        };

	        FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
	          if (N <= 1) return;

	          for (var i = 0; i < N / 2; i++) {
	            var t = rws[i];

	            rws[i] = rws[N - i - 1];
	            rws[N - i - 1] = t;

	            t = iws[i];

	            iws[i] = -iws[N - i - 1];
	            iws[N - i - 1] = -t;
	          }
	        };

	        FFTM.prototype.normalize13b = function normalize13b(ws, N) {
	          var carry = 0;
	          for (var i = 0; i < N / 2; i++) {
	            var w = Math.round(ws[2 * i + 1] / N) * 0x2000 + Math.round(ws[2 * i] / N) + carry;

	            ws[i] = w & 0x3ffffff;

	            if (w < 0x4000000) {
	              carry = 0;
	            } else {
	              carry = w / 0x4000000 | 0;
	            }
	          }

	          return ws;
	        };

	        FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
	          var carry = 0;
	          for (var i = 0; i < len; i++) {
	            carry = carry + (ws[i] | 0);

	            rws[2 * i] = carry & 0x1fff;carry = carry >>> 13;
	            rws[2 * i + 1] = carry & 0x1fff;carry = carry >>> 13;
	          }

	          // Pad with zeroes
	          for (i = 2 * len; i < N; ++i) {
	            rws[i] = 0;
	          }

	          assert(carry === 0);
	          assert((carry & ~0x1fff) === 0);
	        };

	        FFTM.prototype.stub = function stub(N) {
	          var ph = new Array(N);
	          for (var i = 0; i < N; i++) {
	            ph[i] = 0;
	          }

	          return ph;
	        };

	        FFTM.prototype.mulp = function mulp(x, y, out) {
	          var N = 2 * this.guessLen13b(x.length, y.length);

	          var rbt = this.makeRBT(N);

	          var _ = this.stub(N);

	          var rws = new Array(N);
	          var rwst = new Array(N);
	          var iwst = new Array(N);

	          var nrws = new Array(N);
	          var nrwst = new Array(N);
	          var niwst = new Array(N);

	          var rmws = out.words;
	          rmws.length = N;

	          this.convert13b(x.words, x.length, rws, N);
	          this.convert13b(y.words, y.length, nrws, N);

	          this.transform(rws, _, rwst, iwst, N, rbt);
	          this.transform(nrws, _, nrwst, niwst, N, rbt);

	          for (var i = 0; i < N; i++) {
	            var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
	            iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
	            rwst[i] = rx;
	          }

	          this.conjugate(rwst, iwst, N);
	          this.transform(rwst, iwst, rmws, _, N, rbt);
	          this.conjugate(rmws, _, N);
	          this.normalize13b(rmws, N);

	          out.negative = x.negative ^ y.negative;
	          out.length = x.length + y.length;
	          return out.strip();
	        };

	        // Multiply `this` by `num`
	        BN.prototype.mul = function mul(num) {
	          var out = new BN(null);
	          out.words = new Array(this.length + num.length);
	          return this.mulTo(num, out);
	        };

	        // Multiply employing FFT
	        BN.prototype.mulf = function mulf(num) {
	          var out = new BN(null);
	          out.words = new Array(this.length + num.length);
	          return jumboMulTo(this, num, out);
	        };

	        // In-place Multiplication
	        BN.prototype.imul = function imul(num) {
	          return this.clone().mulTo(num, this);
	        };

	        BN.prototype.imuln = function imuln(num) {
	          assert(typeof num === 'number');
	          assert(num < 0x4000000);

	          // Carry
	          var carry = 0;
	          for (var i = 0; i < this.length; i++) {
	            var w = (this.words[i] | 0) * num;
	            var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
	            carry >>= 26;
	            carry += w / 0x4000000 | 0;
	            // NOTE: lo is 27bit maximum
	            carry += lo >>> 26;
	            this.words[i] = lo & 0x3ffffff;
	          }

	          if (carry !== 0) {
	            this.words[i] = carry;
	            this.length++;
	          }

	          return this;
	        };

	        BN.prototype.muln = function muln(num) {
	          return this.clone().imuln(num);
	        };

	        // `this` * `this`
	        BN.prototype.sqr = function sqr() {
	          return this.mul(this);
	        };

	        // `this` * `this` in-place
	        BN.prototype.isqr = function isqr() {
	          return this.imul(this.clone());
	        };

	        // Math.pow(`this`, `num`)
	        BN.prototype.pow = function pow(num) {
	          var w = toBitArray(num);
	          if (w.length === 0) return new BN(1);

	          // Skip leading zeroes
	          var res = this;
	          for (var i = 0; i < w.length; i++, res = res.sqr()) {
	            if (w[i] !== 0) break;
	          }

	          if (++i < w.length) {
	            for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
	              if (w[i] === 0) continue;

	              res = res.mul(q);
	            }
	          }

	          return res;
	        };

	        // Shift-left in-place
	        BN.prototype.iushln = function iushln(bits) {
	          assert(typeof bits === 'number' && bits >= 0);
	          var r = bits % 26;
	          var s = (bits - r) / 26;
	          var carryMask = 0x3ffffff >>> 26 - r << 26 - r;
	          var i;

	          if (r !== 0) {
	            var carry = 0;

	            for (i = 0; i < this.length; i++) {
	              var newCarry = this.words[i] & carryMask;
	              var c = (this.words[i] | 0) - newCarry << r;
	              this.words[i] = c | carry;
	              carry = newCarry >>> 26 - r;
	            }

	            if (carry) {
	              this.words[i] = carry;
	              this.length++;
	            }
	          }

	          if (s !== 0) {
	            for (i = this.length - 1; i >= 0; i--) {
	              this.words[i + s] = this.words[i];
	            }

	            for (i = 0; i < s; i++) {
	              this.words[i] = 0;
	            }

	            this.length += s;
	          }

	          return this.strip();
	        };

	        BN.prototype.ishln = function ishln(bits) {
	          // TODO(indutny): implement me
	          assert(this.negative === 0);
	          return this.iushln(bits);
	        };

	        // Shift-right in-place
	        // NOTE: `hint` is a lowest bit before trailing zeroes
	        // NOTE: if `extended` is present - it will be filled with destroyed bits
	        BN.prototype.iushrn = function iushrn(bits, hint, extended) {
	          assert(typeof bits === 'number' && bits >= 0);
	          var h;
	          if (hint) {
	            h = (hint - hint % 26) / 26;
	          } else {
	            h = 0;
	          }

	          var r = bits % 26;
	          var s = Math.min((bits - r) / 26, this.length);
	          var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
	          var maskedWords = extended;

	          h -= s;
	          h = Math.max(0, h);

	          // Extended mode, copy masked part
	          if (maskedWords) {
	            for (var i = 0; i < s; i++) {
	              maskedWords.words[i] = this.words[i];
	            }
	            maskedWords.length = s;
	          }

	          if (s === 0) ; else if (this.length > s) {
	            this.length -= s;
	            for (i = 0; i < this.length; i++) {
	              this.words[i] = this.words[i + s];
	            }
	          } else {
	            this.words[0] = 0;
	            this.length = 1;
	          }

	          var carry = 0;
	          for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
	            var word = this.words[i] | 0;
	            this.words[i] = carry << 26 - r | word >>> r;
	            carry = word & mask;
	          }

	          // Push carried bits as a mask
	          if (maskedWords && carry !== 0) {
	            maskedWords.words[maskedWords.length++] = carry;
	          }

	          if (this.length === 0) {
	            this.words[0] = 0;
	            this.length = 1;
	          }

	          return this.strip();
	        };

	        BN.prototype.ishrn = function ishrn(bits, hint, extended) {
	          // TODO(indutny): implement me
	          assert(this.negative === 0);
	          return this.iushrn(bits, hint, extended);
	        };

	        // Shift-left
	        BN.prototype.shln = function shln(bits) {
	          return this.clone().ishln(bits);
	        };

	        BN.prototype.ushln = function ushln(bits) {
	          return this.clone().iushln(bits);
	        };

	        // Shift-right
	        BN.prototype.shrn = function shrn(bits) {
	          return this.clone().ishrn(bits);
	        };

	        BN.prototype.ushrn = function ushrn(bits) {
	          return this.clone().iushrn(bits);
	        };

	        // Test if n bit is set
	        BN.prototype.testn = function testn(bit) {
	          assert(typeof bit === 'number' && bit >= 0);
	          var r = bit % 26;
	          var s = (bit - r) / 26;
	          var q = 1 << r;

	          // Fast case: bit is much higher than all existing words
	          if (this.length <= s) return false;

	          // Check bit and return
	          var w = this.words[s];

	          return !!(w & q);
	        };

	        // Return only lowers bits of number (in-place)
	        BN.prototype.imaskn = function imaskn(bits) {
	          assert(typeof bits === 'number' && bits >= 0);
	          var r = bits % 26;
	          var s = (bits - r) / 26;

	          assert(this.negative === 0, 'imaskn works only with positive numbers');

	          if (this.length <= s) {
	            return this;
	          }

	          if (r !== 0) {
	            s++;
	          }
	          this.length = Math.min(s, this.length);

	          if (r !== 0) {
	            var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
	            this.words[this.length - 1] &= mask;
	          }

	          return this.strip();
	        };

	        // Return only lowers bits of number
	        BN.prototype.maskn = function maskn(bits) {
	          return this.clone().imaskn(bits);
	        };

	        // Add plain number `num` to `this`
	        BN.prototype.iaddn = function iaddn(num) {
	          assert(typeof num === 'number');
	          assert(num < 0x4000000);
	          if (num < 0) return this.isubn(-num);

	          // Possible sign change
	          if (this.negative !== 0) {
	            if (this.length === 1 && (this.words[0] | 0) < num) {
	              this.words[0] = num - (this.words[0] | 0);
	              this.negative = 0;
	              return this;
	            }

	            this.negative = 0;
	            this.isubn(num);
	            this.negative = 1;
	            return this;
	          }

	          // Add without checks
	          return this._iaddn(num);
	        };

	        BN.prototype._iaddn = function _iaddn(num) {
	          this.words[0] += num;

	          // Carry
	          for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
	            this.words[i] -= 0x4000000;
	            if (i === this.length - 1) {
	              this.words[i + 1] = 1;
	            } else {
	              this.words[i + 1]++;
	            }
	          }
	          this.length = Math.max(this.length, i + 1);

	          return this;
	        };

	        // Subtract plain number `num` from `this`
	        BN.prototype.isubn = function isubn(num) {
	          assert(typeof num === 'number');
	          assert(num < 0x4000000);
	          if (num < 0) return this.iaddn(-num);

	          if (this.negative !== 0) {
	            this.negative = 0;
	            this.iaddn(num);
	            this.negative = 1;
	            return this;
	          }

	          this.words[0] -= num;

	          if (this.length === 1 && this.words[0] < 0) {
	            this.words[0] = -this.words[0];
	            this.negative = 1;
	          } else {
	            // Carry
	            for (var i = 0; i < this.length && this.words[i] < 0; i++) {
	              this.words[i] += 0x4000000;
	              this.words[i + 1] -= 1;
	            }
	          }

	          return this.strip();
	        };

	        BN.prototype.addn = function addn(num) {
	          return this.clone().iaddn(num);
	        };

	        BN.prototype.subn = function subn(num) {
	          return this.clone().isubn(num);
	        };

	        BN.prototype.iabs = function iabs() {
	          this.negative = 0;

	          return this;
	        };

	        BN.prototype.abs = function abs() {
	          return this.clone().iabs();
	        };

	        BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
	          var len = num.length + shift;
	          var i;

	          this._expand(len);

	          var w;
	          var carry = 0;
	          for (i = 0; i < num.length; i++) {
	            w = (this.words[i + shift] | 0) + carry;
	            var right = (num.words[i] | 0) * mul;
	            w -= right & 0x3ffffff;
	            carry = (w >> 26) - (right / 0x4000000 | 0);
	            this.words[i + shift] = w & 0x3ffffff;
	          }
	          for (; i < this.length - shift; i++) {
	            w = (this.words[i + shift] | 0) + carry;
	            carry = w >> 26;
	            this.words[i + shift] = w & 0x3ffffff;
	          }

	          if (carry === 0) return this.strip();

	          // Subtraction overflow
	          assert(carry === -1);
	          carry = 0;
	          for (i = 0; i < this.length; i++) {
	            w = -(this.words[i] | 0) + carry;
	            carry = w >> 26;
	            this.words[i] = w & 0x3ffffff;
	          }
	          this.negative = 1;

	          return this.strip();
	        };

	        BN.prototype._wordDiv = function _wordDiv(num, mode) {
	          var shift = this.length - num.length;

	          var a = this.clone();
	          var b = num;

	          // Normalize
	          var bhi = b.words[b.length - 1] | 0;
	          var bhiBits = this._countBits(bhi);
	          shift = 26 - bhiBits;
	          if (shift !== 0) {
	            b = b.ushln(shift);
	            a.iushln(shift);
	            bhi = b.words[b.length - 1] | 0;
	          }

	          // Initialize quotient
	          var m = a.length - b.length;
	          var q;

	          if (mode !== 'mod') {
	            q = new BN(null);
	            q.length = m + 1;
	            q.words = new Array(q.length);
	            for (var i = 0; i < q.length; i++) {
	              q.words[i] = 0;
	            }
	          }

	          var diff = a.clone()._ishlnsubmul(b, 1, m);
	          if (diff.negative === 0) {
	            a = diff;
	            if (q) {
	              q.words[m] = 1;
	            }
	          }

	          for (var j = m - 1; j >= 0; j--) {
	            var qj = (a.words[b.length + j] | 0) * 0x4000000 + (a.words[b.length + j - 1] | 0);

	            // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
	            // (0x7ffffff)
	            qj = Math.min(qj / bhi | 0, 0x3ffffff);

	            a._ishlnsubmul(b, qj, j);
	            while (a.negative !== 0) {
	              qj--;
	              a.negative = 0;
	              a._ishlnsubmul(b, 1, j);
	              if (!a.isZero()) {
	                a.negative ^= 1;
	              }
	            }
	            if (q) {
	              q.words[j] = qj;
	            }
	          }
	          if (q) {
	            q.strip();
	          }
	          a.strip();

	          // Denormalize
	          if (mode !== 'div' && shift !== 0) {
	            a.iushrn(shift);
	          }

	          return {
	            div: q || null,
	            mod: a
	          };
	        };

	        // NOTE: 1) `mode` can be set to `mod` to request mod only,
	        //       to `div` to request div only, or be absent to
	        //       request both div & mod
	        //       2) `positive` is true if unsigned mod is requested
	        BN.prototype.divmod = function divmod(num, mode, positive) {
	          assert(!num.isZero());

	          if (this.isZero()) {
	            return {
	              div: new BN(0),
	              mod: new BN(0)
	            };
	          }

	          var div, mod, res;
	          if (this.negative !== 0 && num.negative === 0) {
	            res = this.neg().divmod(num, mode);

	            if (mode !== 'mod') {
	              div = res.div.neg();
	            }

	            if (mode !== 'div') {
	              mod = res.mod.neg();
	              if (positive && mod.negative !== 0) {
	                mod.iadd(num);
	              }
	            }

	            return {
	              div: div,
	              mod: mod
	            };
	          }

	          if (this.negative === 0 && num.negative !== 0) {
	            res = this.divmod(num.neg(), mode);

	            if (mode !== 'mod') {
	              div = res.div.neg();
	            }

	            return {
	              div: div,
	              mod: res.mod
	            };
	          }

	          if ((this.negative & num.negative) !== 0) {
	            res = this.neg().divmod(num.neg(), mode);

	            if (mode !== 'div') {
	              mod = res.mod.neg();
	              if (positive && mod.negative !== 0) {
	                mod.isub(num);
	              }
	            }

	            return {
	              div: res.div,
	              mod: mod
	            };
	          }

	          // Both numbers are positive at this point

	          // Strip both numbers to approximate shift value
	          if (num.length > this.length || this.cmp(num) < 0) {
	            return {
	              div: new BN(0),
	              mod: this
	            };
	          }

	          // Very short reduction
	          if (num.length === 1) {
	            if (mode === 'div') {
	              return {
	                div: this.divn(num.words[0]),
	                mod: null
	              };
	            }

	            if (mode === 'mod') {
	              return {
	                div: null,
	                mod: new BN(this.modn(num.words[0]))
	              };
	            }

	            return {
	              div: this.divn(num.words[0]),
	              mod: new BN(this.modn(num.words[0]))
	            };
	          }

	          return this._wordDiv(num, mode);
	        };

	        // Find `this` / `num`
	        BN.prototype.div = function div(num) {
	          return this.divmod(num, 'div', false).div;
	        };

	        // Find `this` % `num`
	        BN.prototype.mod = function mod(num) {
	          return this.divmod(num, 'mod', false).mod;
	        };

	        BN.prototype.umod = function umod(num) {
	          return this.divmod(num, 'mod', true).mod;
	        };

	        // Find Round(`this` / `num`)
	        BN.prototype.divRound = function divRound(num) {
	          var dm = this.divmod(num);

	          // Fast case - exact division
	          if (dm.mod.isZero()) return dm.div;

	          var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

	          var half = num.ushrn(1);
	          var r2 = num.andln(1);
	          var cmp = mod.cmp(half);

	          // Round down
	          if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;

	          // Round up
	          return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
	        };

	        BN.prototype.modn = function modn(num) {
	          assert(num <= 0x3ffffff);
	          var p = (1 << 26) % num;

	          var acc = 0;
	          for (var i = this.length - 1; i >= 0; i--) {
	            acc = (p * acc + (this.words[i] | 0)) % num;
	          }

	          return acc;
	        };

	        // In-place division by number
	        BN.prototype.idivn = function idivn(num) {
	          assert(num <= 0x3ffffff);

	          var carry = 0;
	          for (var i = this.length - 1; i >= 0; i--) {
	            var w = (this.words[i] | 0) + carry * 0x4000000;
	            this.words[i] = w / num | 0;
	            carry = w % num;
	          }

	          return this.strip();
	        };

	        BN.prototype.divn = function divn(num) {
	          return this.clone().idivn(num);
	        };

	        BN.prototype.egcd = function egcd(p) {
	          assert(p.negative === 0);
	          assert(!p.isZero());

	          var x = this;
	          var y = p.clone();

	          if (x.negative !== 0) {
	            x = x.umod(p);
	          } else {
	            x = x.clone();
	          }

	          // A * x + B * y = x
	          var A = new BN(1);
	          var B = new BN(0);

	          // C * x + D * y = y
	          var C = new BN(0);
	          var D = new BN(1);

	          var g = 0;

	          while (x.isEven() && y.isEven()) {
	            x.iushrn(1);
	            y.iushrn(1);
	            ++g;
	          }

	          var yp = y.clone();
	          var xp = x.clone();

	          while (!x.isZero()) {
	            for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {}
	            if (i > 0) {
	              x.iushrn(i);
	              while (i-- > 0) {
	                if (A.isOdd() || B.isOdd()) {
	                  A.iadd(yp);
	                  B.isub(xp);
	                }

	                A.iushrn(1);
	                B.iushrn(1);
	              }
	            }

	            for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {}
	            if (j > 0) {
	              y.iushrn(j);
	              while (j-- > 0) {
	                if (C.isOdd() || D.isOdd()) {
	                  C.iadd(yp);
	                  D.isub(xp);
	                }

	                C.iushrn(1);
	                D.iushrn(1);
	              }
	            }

	            if (x.cmp(y) >= 0) {
	              x.isub(y);
	              A.isub(C);
	              B.isub(D);
	            } else {
	              y.isub(x);
	              C.isub(A);
	              D.isub(B);
	            }
	          }

	          return {
	            a: C,
	            b: D,
	            gcd: y.iushln(g)
	          };
	        };

	        // This is reduced incarnation of the binary EEA
	        // above, designated to invert members of the
	        // _prime_ fields F(p) at a maximal speed
	        BN.prototype._invmp = function _invmp(p) {
	          assert(p.negative === 0);
	          assert(!p.isZero());

	          var a = this;
	          var b = p.clone();

	          if (a.negative !== 0) {
	            a = a.umod(p);
	          } else {
	            a = a.clone();
	          }

	          var x1 = new BN(1);
	          var x2 = new BN(0);

	          var delta = b.clone();

	          while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
	            for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {}
	            if (i > 0) {
	              a.iushrn(i);
	              while (i-- > 0) {
	                if (x1.isOdd()) {
	                  x1.iadd(delta);
	                }

	                x1.iushrn(1);
	              }
	            }

	            for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {}
	            if (j > 0) {
	              b.iushrn(j);
	              while (j-- > 0) {
	                if (x2.isOdd()) {
	                  x2.iadd(delta);
	                }

	                x2.iushrn(1);
	              }
	            }

	            if (a.cmp(b) >= 0) {
	              a.isub(b);
	              x1.isub(x2);
	            } else {
	              b.isub(a);
	              x2.isub(x1);
	            }
	          }

	          var res;
	          if (a.cmpn(1) === 0) {
	            res = x1;
	          } else {
	            res = x2;
	          }

	          if (res.cmpn(0) < 0) {
	            res.iadd(p);
	          }

	          return res;
	        };

	        BN.prototype.gcd = function gcd(num) {
	          if (this.isZero()) return num.abs();
	          if (num.isZero()) return this.abs();

	          var a = this.clone();
	          var b = num.clone();
	          a.negative = 0;
	          b.negative = 0;

	          // Remove common factor of two
	          for (var shift = 0; a.isEven() && b.isEven(); shift++) {
	            a.iushrn(1);
	            b.iushrn(1);
	          }

	          do {
	            while (a.isEven()) {
	              a.iushrn(1);
	            }
	            while (b.isEven()) {
	              b.iushrn(1);
	            }

	            var r = a.cmp(b);
	            if (r < 0) {
	              // Swap `a` and `b` to make `a` always bigger than `b`
	              var t = a;
	              a = b;
	              b = t;
	            } else if (r === 0 || b.cmpn(1) === 0) {
	              break;
	            }

	            a.isub(b);
	          } while (true);

	          return b.iushln(shift);
	        };

	        // Invert number in the field F(num)
	        BN.prototype.invm = function invm(num) {
	          return this.egcd(num).a.umod(num);
	        };

	        BN.prototype.isEven = function isEven() {
	          return (this.words[0] & 1) === 0;
	        };

	        BN.prototype.isOdd = function isOdd() {
	          return (this.words[0] & 1) === 1;
	        };

	        // And first word and num
	        BN.prototype.andln = function andln(num) {
	          return this.words[0] & num;
	        };

	        // Increment at the bit position in-line
	        BN.prototype.bincn = function bincn(bit) {
	          assert(typeof bit === 'number');
	          var r = bit % 26;
	          var s = (bit - r) / 26;
	          var q = 1 << r;

	          // Fast case: bit is much higher than all existing words
	          if (this.length <= s) {
	            this._expand(s + 1);
	            this.words[s] |= q;
	            return this;
	          }

	          // Add bit and propagate, if needed
	          var carry = q;
	          for (var i = s; carry !== 0 && i < this.length; i++) {
	            var w = this.words[i] | 0;
	            w += carry;
	            carry = w >>> 26;
	            w &= 0x3ffffff;
	            this.words[i] = w;
	          }
	          if (carry !== 0) {
	            this.words[i] = carry;
	            this.length++;
	          }
	          return this;
	        };

	        BN.prototype.isZero = function isZero() {
	          return this.length === 1 && this.words[0] === 0;
	        };

	        BN.prototype.cmpn = function cmpn(num) {
	          var negative = num < 0;

	          if (this.negative !== 0 && !negative) return -1;
	          if (this.negative === 0 && negative) return 1;

	          this.strip();

	          var res;
	          if (this.length > 1) {
	            res = 1;
	          } else {
	            if (negative) {
	              num = -num;
	            }

	            assert(num <= 0x3ffffff, 'Number is too big');

	            var w = this.words[0] | 0;
	            res = w === num ? 0 : w < num ? -1 : 1;
	          }
	          if (this.negative !== 0) return -res | 0;
	          return res;
	        };

	        // Compare two numbers and return:
	        // 1 - if `this` > `num`
	        // 0 - if `this` == `num`
	        // -1 - if `this` < `num`
	        BN.prototype.cmp = function cmp(num) {
	          if (this.negative !== 0 && num.negative === 0) return -1;
	          if (this.negative === 0 && num.negative !== 0) return 1;

	          var res = this.ucmp(num);
	          if (this.negative !== 0) return -res | 0;
	          return res;
	        };

	        // Unsigned comparison
	        BN.prototype.ucmp = function ucmp(num) {
	          // At this point both numbers have the same sign
	          if (this.length > num.length) return 1;
	          if (this.length < num.length) return -1;

	          var res = 0;
	          for (var i = this.length - 1; i >= 0; i--) {
	            var a = this.words[i] | 0;
	            var b = num.words[i] | 0;

	            if (a === b) continue;
	            if (a < b) {
	              res = -1;
	            } else if (a > b) {
	              res = 1;
	            }
	            break;
	          }
	          return res;
	        };

	        BN.prototype.gtn = function gtn(num) {
	          return this.cmpn(num) === 1;
	        };

	        BN.prototype.gt = function gt(num) {
	          return this.cmp(num) === 1;
	        };

	        BN.prototype.gten = function gten(num) {
	          return this.cmpn(num) >= 0;
	        };

	        BN.prototype.gte = function gte(num) {
	          return this.cmp(num) >= 0;
	        };

	        BN.prototype.ltn = function ltn(num) {
	          return this.cmpn(num) === -1;
	        };

	        BN.prototype.lt = function lt(num) {
	          return this.cmp(num) === -1;
	        };

	        BN.prototype.lten = function lten(num) {
	          return this.cmpn(num) <= 0;
	        };

	        BN.prototype.lte = function lte(num) {
	          return this.cmp(num) <= 0;
	        };

	        BN.prototype.eqn = function eqn(num) {
	          return this.cmpn(num) === 0;
	        };

	        BN.prototype.eq = function eq(num) {
	          return this.cmp(num) === 0;
	        };

	        //
	        // A reduce context, could be using montgomery or something better, depending
	        // on the `m` itself.
	        //
	        BN.red = function red(num) {
	          return new Red(num);
	        };

	        BN.prototype.toRed = function toRed(ctx) {
	          assert(!this.red, 'Already a number in reduction context');
	          assert(this.negative === 0, 'red works only with positives');
	          return ctx.convertTo(this)._forceRed(ctx);
	        };

	        BN.prototype.fromRed = function fromRed() {
	          assert(this.red, 'fromRed works only with numbers in reduction context');
	          return this.red.convertFrom(this);
	        };

	        BN.prototype._forceRed = function _forceRed(ctx) {
	          this.red = ctx;
	          return this;
	        };

	        BN.prototype.forceRed = function forceRed(ctx) {
	          assert(!this.red, 'Already a number in reduction context');
	          return this._forceRed(ctx);
	        };

	        BN.prototype.redAdd = function redAdd(num) {
	          assert(this.red, 'redAdd works only with red numbers');
	          return this.red.add(this, num);
	        };

	        BN.prototype.redIAdd = function redIAdd(num) {
	          assert(this.red, 'redIAdd works only with red numbers');
	          return this.red.iadd(this, num);
	        };

	        BN.prototype.redSub = function redSub(num) {
	          assert(this.red, 'redSub works only with red numbers');
	          return this.red.sub(this, num);
	        };

	        BN.prototype.redISub = function redISub(num) {
	          assert(this.red, 'redISub works only with red numbers');
	          return this.red.isub(this, num);
	        };

	        BN.prototype.redShl = function redShl(num) {
	          assert(this.red, 'redShl works only with red numbers');
	          return this.red.shl(this, num);
	        };

	        BN.prototype.redMul = function redMul(num) {
	          assert(this.red, 'redMul works only with red numbers');
	          this.red._verify2(this, num);
	          return this.red.mul(this, num);
	        };

	        BN.prototype.redIMul = function redIMul(num) {
	          assert(this.red, 'redMul works only with red numbers');
	          this.red._verify2(this, num);
	          return this.red.imul(this, num);
	        };

	        BN.prototype.redSqr = function redSqr() {
	          assert(this.red, 'redSqr works only with red numbers');
	          this.red._verify1(this);
	          return this.red.sqr(this);
	        };

	        BN.prototype.redISqr = function redISqr() {
	          assert(this.red, 'redISqr works only with red numbers');
	          this.red._verify1(this);
	          return this.red.isqr(this);
	        };

	        // Square root over p
	        BN.prototype.redSqrt = function redSqrt() {
	          assert(this.red, 'redSqrt works only with red numbers');
	          this.red._verify1(this);
	          return this.red.sqrt(this);
	        };

	        BN.prototype.redInvm = function redInvm() {
	          assert(this.red, 'redInvm works only with red numbers');
	          this.red._verify1(this);
	          return this.red.invm(this);
	        };

	        // Return negative clone of `this` % `red modulo`
	        BN.prototype.redNeg = function redNeg() {
	          assert(this.red, 'redNeg works only with red numbers');
	          this.red._verify1(this);
	          return this.red.neg(this);
	        };

	        BN.prototype.redPow = function redPow(num) {
	          assert(this.red && !num.red, 'redPow(normalNum)');
	          this.red._verify1(this);
	          return this.red.pow(this, num);
	        };

	        // Prime numbers with efficient reduction
	        var primes = {
	          k256: null,
	          p224: null,
	          p192: null,
	          p25519: null
	        };

	        // Pseudo-Mersenne prime
	        function MPrime(name, p) {
	          // P = 2 ^ N - K
	          this.name = name;
	          this.p = new BN(p, 16);
	          this.n = this.p.bitLength();
	          this.k = new BN(1).iushln(this.n).isub(this.p);

	          this.tmp = this._tmp();
	        }

	        MPrime.prototype._tmp = function _tmp() {
	          var tmp = new BN(null);
	          tmp.words = new Array(Math.ceil(this.n / 13));
	          return tmp;
	        };

	        MPrime.prototype.ireduce = function ireduce(num) {
	          // Assumes that `num` is less than `P^2`
	          // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
	          var r = num;
	          var rlen;

	          do {
	            this.split(r, this.tmp);
	            r = this.imulK(r);
	            r = r.iadd(this.tmp);
	            rlen = r.bitLength();
	          } while (rlen > this.n);

	          var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
	          if (cmp === 0) {
	            r.words[0] = 0;
	            r.length = 1;
	          } else if (cmp > 0) {
	            r.isub(this.p);
	          } else {
	            r.strip();
	          }

	          return r;
	        };

	        MPrime.prototype.split = function split(input, out) {
	          input.iushrn(this.n, 0, out);
	        };

	        MPrime.prototype.imulK = function imulK(num) {
	          return num.imul(this.k);
	        };

	        function K256() {
	          MPrime.call(this, 'k256', 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
	        }
	        inherits(K256, MPrime);

	        K256.prototype.split = function split(input, output) {
	          // 256 = 9 * 26 + 22
	          var mask = 0x3fffff;

	          var outLen = Math.min(input.length, 9);
	          for (var i = 0; i < outLen; i++) {
	            output.words[i] = input.words[i];
	          }
	          output.length = outLen;

	          if (input.length <= 9) {
	            input.words[0] = 0;
	            input.length = 1;
	            return;
	          }

	          // Shift by 9 limbs
	          var prev = input.words[9];
	          output.words[output.length++] = prev & mask;

	          for (i = 10; i < input.length; i++) {
	            var next = input.words[i] | 0;
	            input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
	            prev = next;
	          }
	          prev >>>= 22;
	          input.words[i - 10] = prev;
	          if (prev === 0 && input.length > 10) {
	            input.length -= 10;
	          } else {
	            input.length -= 9;
	          }
	        };

	        K256.prototype.imulK = function imulK(num) {
	          // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
	          num.words[num.length] = 0;
	          num.words[num.length + 1] = 0;
	          num.length += 2;

	          // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
	          var lo = 0;
	          for (var i = 0; i < num.length; i++) {
	            var w = num.words[i] | 0;
	            lo += w * 0x3d1;
	            num.words[i] = lo & 0x3ffffff;
	            lo = w * 0x40 + (lo / 0x4000000 | 0);
	          }

	          // Fast length reduction
	          if (num.words[num.length - 1] === 0) {
	            num.length--;
	            if (num.words[num.length - 1] === 0) {
	              num.length--;
	            }
	          }
	          return num;
	        };

	        function P224() {
	          MPrime.call(this, 'p224', 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
	        }
	        inherits(P224, MPrime);

	        function P192() {
	          MPrime.call(this, 'p192', 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
	        }
	        inherits(P192, MPrime);

	        function P25519() {
	          // 2 ^ 255 - 19
	          MPrime.call(this, '25519', '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
	        }
	        inherits(P25519, MPrime);

	        P25519.prototype.imulK = function imulK(num) {
	          // K = 0x13
	          var carry = 0;
	          for (var i = 0; i < num.length; i++) {
	            var hi = (num.words[i] | 0) * 0x13 + carry;
	            var lo = hi & 0x3ffffff;
	            hi >>>= 26;

	            num.words[i] = lo;
	            carry = hi;
	          }
	          if (carry !== 0) {
	            num.words[num.length++] = carry;
	          }
	          return num;
	        };

	        // Exported mostly for testing purposes, use plain name instead
	        BN._prime = function prime(name) {
	          // Cached version of prime
	          if (primes[name]) return primes[name];

	          var prime;
	          if (name === 'k256') {
	            prime = new K256();
	          } else if (name === 'p224') {
	            prime = new P224();
	          } else if (name === 'p192') {
	            prime = new P192();
	          } else if (name === 'p25519') {
	            prime = new P25519();
	          } else {
	            throw new Error('Unknown prime ' + name);
	          }
	          primes[name] = prime;

	          return prime;
	        };

	        //
	        // Base reduction engine
	        //
	        function Red(m) {
	          if (typeof m === 'string') {
	            var prime = BN._prime(m);
	            this.m = prime.p;
	            this.prime = prime;
	          } else {
	            assert(m.gtn(1), 'modulus must be greater than 1');
	            this.m = m;
	            this.prime = null;
	          }
	        }

	        Red.prototype._verify1 = function _verify1(a) {
	          assert(a.negative === 0, 'red works only with positives');
	          assert(a.red, 'red works only with red numbers');
	        };

	        Red.prototype._verify2 = function _verify2(a, b) {
	          assert((a.negative | b.negative) === 0, 'red works only with positives');
	          assert(a.red && a.red === b.red, 'red works only with red numbers');
	        };

	        Red.prototype.imod = function imod(a) {
	          if (this.prime) return this.prime.ireduce(a)._forceRed(this);
	          return a.umod(this.m)._forceRed(this);
	        };

	        Red.prototype.neg = function neg(a) {
	          if (a.isZero()) {
	            return a.clone();
	          }

	          return this.m.sub(a)._forceRed(this);
	        };

	        Red.prototype.add = function add(a, b) {
	          this._verify2(a, b);

	          var res = a.add(b);
	          if (res.cmp(this.m) >= 0) {
	            res.isub(this.m);
	          }
	          return res._forceRed(this);
	        };

	        Red.prototype.iadd = function iadd(a, b) {
	          this._verify2(a, b);

	          var res = a.iadd(b);
	          if (res.cmp(this.m) >= 0) {
	            res.isub(this.m);
	          }
	          return res;
	        };

	        Red.prototype.sub = function sub(a, b) {
	          this._verify2(a, b);

	          var res = a.sub(b);
	          if (res.cmpn(0) < 0) {
	            res.iadd(this.m);
	          }
	          return res._forceRed(this);
	        };

	        Red.prototype.isub = function isub(a, b) {
	          this._verify2(a, b);

	          var res = a.isub(b);
	          if (res.cmpn(0) < 0) {
	            res.iadd(this.m);
	          }
	          return res;
	        };

	        Red.prototype.shl = function shl(a, num) {
	          this._verify1(a);
	          return this.imod(a.ushln(num));
	        };

	        Red.prototype.imul = function imul(a, b) {
	          this._verify2(a, b);
	          return this.imod(a.imul(b));
	        };

	        Red.prototype.mul = function mul(a, b) {
	          this._verify2(a, b);
	          return this.imod(a.mul(b));
	        };

	        Red.prototype.isqr = function isqr(a) {
	          return this.imul(a, a.clone());
	        };

	        Red.prototype.sqr = function sqr(a) {
	          return this.mul(a, a);
	        };

	        Red.prototype.sqrt = function sqrt(a) {
	          if (a.isZero()) return a.clone();

	          var mod3 = this.m.andln(3);
	          assert(mod3 % 2 === 1);

	          // Fast case
	          if (mod3 === 3) {
	            var pow = this.m.add(new BN(1)).iushrn(2);
	            return this.pow(a, pow);
	          }

	          // Tonelli-Shanks algorithm (Totally unoptimized and slow)
	          //
	          // Find Q and S, that Q * 2 ^ S = (P - 1)
	          var q = this.m.subn(1);
	          var s = 0;
	          while (!q.isZero() && q.andln(1) === 0) {
	            s++;
	            q.iushrn(1);
	          }
	          assert(!q.isZero());

	          var one = new BN(1).toRed(this);
	          var nOne = one.redNeg();

	          // Find quadratic non-residue
	          // NOTE: Max is such because of generalized Riemann hypothesis.
	          var lpow = this.m.subn(1).iushrn(1);
	          var z = this.m.bitLength();
	          z = new BN(2 * z * z).toRed(this);

	          while (this.pow(z, lpow).cmp(nOne) !== 0) {
	            z.redIAdd(nOne);
	          }

	          var c = this.pow(z, q);
	          var r = this.pow(a, q.addn(1).iushrn(1));
	          var t = this.pow(a, q);
	          var m = s;
	          while (t.cmp(one) !== 0) {
	            var tmp = t;
	            for (var i = 0; tmp.cmp(one) !== 0; i++) {
	              tmp = tmp.redSqr();
	            }
	            assert(i < m);
	            var b = this.pow(c, new BN(1).iushln(m - i - 1));

	            r = r.redMul(b);
	            c = b.redSqr();
	            t = t.redMul(c);
	            m = i;
	          }

	          return r;
	        };

	        Red.prototype.invm = function invm(a) {
	          var inv = a._invmp(this.m);
	          if (inv.negative !== 0) {
	            inv.negative = 0;
	            return this.imod(inv).redNeg();
	          } else {
	            return this.imod(inv);
	          }
	        };

	        Red.prototype.pow = function pow(a, num) {
	          if (num.isZero()) return new BN(1).toRed(this);
	          if (num.cmpn(1) === 0) return a.clone();

	          var windowSize = 4;
	          var wnd = new Array(1 << windowSize);
	          wnd[0] = new BN(1).toRed(this);
	          wnd[1] = a;
	          for (var i = 2; i < wnd.length; i++) {
	            wnd[i] = this.mul(wnd[i - 1], a);
	          }

	          var res = wnd[0];
	          var current = 0;
	          var currentLen = 0;
	          var start = num.bitLength() % 26;
	          if (start === 0) {
	            start = 26;
	          }

	          for (i = num.length - 1; i >= 0; i--) {
	            var word = num.words[i];
	            for (var j = start - 1; j >= 0; j--) {
	              var bit = word >> j & 1;
	              if (res !== wnd[0]) {
	                res = this.sqr(res);
	              }

	              if (bit === 0 && current === 0) {
	                currentLen = 0;
	                continue;
	              }

	              current <<= 1;
	              current |= bit;
	              currentLen++;
	              if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

	              res = this.mul(res, wnd[current]);
	              currentLen = 0;
	              current = 0;
	            }
	            start = 26;
	          }

	          return res;
	        };

	        Red.prototype.convertTo = function convertTo(num) {
	          var r = num.umod(this.m);

	          return r === num ? r.clone() : r;
	        };

	        Red.prototype.convertFrom = function convertFrom(num) {
	          var res = num.clone();
	          res.red = null;
	          return res;
	        };

	        //
	        // Montgomery method engine
	        //

	        BN.mont = function mont(num) {
	          return new Mont(num);
	        };

	        function Mont(m) {
	          Red.call(this, m);

	          this.shift = this.m.bitLength();
	          if (this.shift % 26 !== 0) {
	            this.shift += 26 - this.shift % 26;
	          }

	          this.r = new BN(1).iushln(this.shift);
	          this.r2 = this.imod(this.r.sqr());
	          this.rinv = this.r._invmp(this.m);

	          this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
	          this.minv = this.minv.umod(this.r);
	          this.minv = this.r.sub(this.minv);
	        }
	        inherits(Mont, Red);

	        Mont.prototype.convertTo = function convertTo(num) {
	          return this.imod(num.ushln(this.shift));
	        };

	        Mont.prototype.convertFrom = function convertFrom(num) {
	          var r = this.imod(num.mul(this.rinv));
	          r.red = null;
	          return r;
	        };

	        Mont.prototype.imul = function imul(a, b) {
	          if (a.isZero() || b.isZero()) {
	            a.words[0] = 0;
	            a.length = 1;
	            return a;
	          }

	          var t = a.imul(b);
	          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	          var u = t.isub(c).iushrn(this.shift);
	          var res = u;

	          if (u.cmp(this.m) >= 0) {
	            res = u.isub(this.m);
	          } else if (u.cmpn(0) < 0) {
	            res = u.iadd(this.m);
	          }

	          return res._forceRed(this);
	        };

	        Mont.prototype.mul = function mul(a, b) {
	          if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

	          var t = a.mul(b);
	          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	          var u = t.isub(c).iushrn(this.shift);
	          var res = u;
	          if (u.cmp(this.m) >= 0) {
	            res = u.isub(this.m);
	          } else if (u.cmpn(0) < 0) {
	            res = u.iadd(this.m);
	          }

	          return res._forceRed(this);
	        };

	        Mont.prototype.invm = function invm(a) {
	          // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
	          var res = this.imod(a._invmp(this.m).mul(this.r2));
	          return res._forceRed(this);
	        };
	      })(module, this);

	      /* WEBPACK VAR INJECTION */
	    }).call(this, __webpack_require__(14)(module));

	    /***/
	  },
	  /* 3 */
	  /***/function (module, exports) {

	    module.exports = assert;

	    function assert(val, msg) {
	      if (!val) throw new Error(msg || 'Assertion failed');
	    }

	    assert.equal = function assertEqual(l, r, msg) {
	      if (l != r) throw new Error(msg || 'Assertion failed: ' + l + ' != ' + r);
	    };

	    /***/
	  },
	  /* 4 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = __webpack_require__(1);
	    var assert = __webpack_require__(3);

	    function BlockHash() {
	      this.pending = null;
	      this.pendingTotal = 0;
	      this.blockSize = this.constructor.blockSize;
	      this.outSize = this.constructor.outSize;
	      this.hmacStrength = this.constructor.hmacStrength;
	      this.padLength = this.constructor.padLength / 8;
	      this.endian = 'big';

	      this._delta8 = this.blockSize / 8;
	      this._delta32 = this.blockSize / 32;
	    }
	    exports.BlockHash = BlockHash;

	    BlockHash.prototype.update = function update(msg, enc) {
	      // Convert message to array, pad it, and join into 32bit blocks
	      msg = utils.toArray(msg, enc);
	      if (!this.pending) this.pending = msg;else this.pending = this.pending.concat(msg);
	      this.pendingTotal += msg.length;

	      // Enough data, try updating
	      if (this.pending.length >= this._delta8) {
	        msg = this.pending;

	        // Process pending data in blocks
	        var r = msg.length % this._delta8;
	        this.pending = msg.slice(msg.length - r, msg.length);
	        if (this.pending.length === 0) this.pending = null;

	        msg = utils.join32(msg, 0, msg.length - r, this.endian);
	        for (var i = 0; i < msg.length; i += this._delta32) {
	          this._update(msg, i, i + this._delta32);
	        }
	      }

	      return this;
	    };

	    BlockHash.prototype.digest = function digest(enc) {
	      this.update(this._pad());
	      assert(this.pending === null);

	      return this._digest(enc);
	    };

	    BlockHash.prototype._pad = function pad() {
	      var len = this.pendingTotal;
	      var bytes = this._delta8;
	      var k = bytes - (len + this.padLength) % bytes;
	      var res = new Array(k + this.padLength);
	      res[0] = 0x80;
	      for (var i = 1; i < k; i++) {
	        res[i] = 0;
	      } // Append length
	      len <<= 3;
	      if (this.endian === 'big') {
	        for (var t = 8; t < this.padLength; t++) {
	          res[i++] = 0;
	        }res[i++] = 0;
	        res[i++] = 0;
	        res[i++] = 0;
	        res[i++] = 0;
	        res[i++] = len >>> 24 & 0xff;
	        res[i++] = len >>> 16 & 0xff;
	        res[i++] = len >>> 8 & 0xff;
	        res[i++] = len & 0xff;
	      } else {
	        res[i++] = len & 0xff;
	        res[i++] = len >>> 8 & 0xff;
	        res[i++] = len >>> 16 & 0xff;
	        res[i++] = len >>> 24 & 0xff;
	        res[i++] = 0;
	        res[i++] = 0;
	        res[i++] = 0;
	        res[i++] = 0;

	        for (t = 8; t < this.padLength; t++) {
	          res[i++] = 0;
	        }
	      }

	      return res;
	    };

	    /***/
	  },
	  /* 5 */
	  /***/function (module, exports, __webpack_require__) {

	    var curve = exports;

	    curve.base = __webpack_require__(18);
	    curve.short = __webpack_require__(19);
	    curve.mont = __webpack_require__(20);
	    curve.edwards = __webpack_require__(21);

	    /***/
	  },
	  /* 6 */
	  /***/function (module, exports) {

	    if (typeof _Object$create === 'function') {
	      // implementation from standard node.js 'util' module
	      module.exports = function inherits(ctor, superCtor) {
	        ctor.super_ = superCtor;
	        ctor.prototype = _Object$create(superCtor.prototype, {
	          constructor: {
	            value: ctor,
	            enumerable: false,
	            writable: true,
	            configurable: true
	          }
	        });
	      };
	    } else {
	      // old school shim for old browsers
	      module.exports = function inherits(ctor, superCtor) {
	        ctor.super_ = superCtor;
	        var TempCtor = function TempCtor() {};
	        TempCtor.prototype = superCtor.prototype;
	        ctor.prototype = new TempCtor();
	        ctor.prototype.constructor = ctor;
	      };
	    }

	    /***/
	  },
	  /* 7 */
	  /***/function (module, exports, __webpack_require__) {

	    var hash = exports;

	    hash.utils = __webpack_require__(1);
	    hash.common = __webpack_require__(4);
	    hash.sha = __webpack_require__(23);
	    hash.ripemd = __webpack_require__(27);
	    hash.hmac = __webpack_require__(28);

	    // Proxy hash functions to the main object
	    hash.sha1 = hash.sha.sha1;
	    hash.sha256 = hash.sha.sha256;
	    hash.sha224 = hash.sha.sha224;
	    hash.sha384 = hash.sha.sha384;
	    hash.sha512 = hash.sha.sha512;
	    hash.ripemd160 = hash.ripemd.ripemd160;

	    /***/
	  },
	  /* 8 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = exports;

	    function toArray(msg, enc) {
	      if (Array.isArray(msg)) return msg.slice();
	      if (!msg) return [];
	      var res = [];
	      if (typeof msg !== 'string') {
	        for (var i = 0; i < msg.length; i++) {
	          res[i] = msg[i] | 0;
	        }return res;
	      }
	      if (enc === 'hex') {
	        msg = msg.replace(/[^a-z0-9]+/ig, '');
	        if (msg.length % 2 !== 0) msg = '0' + msg;
	        for (var i = 0; i < msg.length; i += 2) {
	          res.push(parseInt(msg[i] + msg[i + 1], 16));
	        }
	      } else {
	        for (var i = 0; i < msg.length; i++) {
	          var c = msg.charCodeAt(i);
	          var hi = c >> 8;
	          var lo = c & 0xff;
	          if (hi) res.push(hi, lo);else res.push(lo);
	        }
	      }
	      return res;
	    }
	    utils.toArray = toArray;

	    function zero2(word) {
	      if (word.length === 1) return '0' + word;else return word;
	    }
	    utils.zero2 = zero2;

	    function toHex(msg) {
	      var res = '';
	      for (var i = 0; i < msg.length; i++) {
	        res += zero2(msg[i].toString(16));
	      }return res;
	    }
	    utils.toHex = toHex;

	    utils.encode = function encode(arr, enc) {
	      if (enc === 'hex') return toHex(arr);else return arr;
	    };

	    /***/
	  },
	  /* 9 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = __webpack_require__(1);
	    var rotr32 = utils.rotr32;

	    function ft_1(s, x, y, z) {
	      if (s === 0) return ch32(x, y, z);
	      if (s === 1 || s === 3) return p32(x, y, z);
	      if (s === 2) return maj32(x, y, z);
	    }
	    exports.ft_1 = ft_1;

	    function ch32(x, y, z) {
	      return x & y ^ ~x & z;
	    }
	    exports.ch32 = ch32;

	    function maj32(x, y, z) {
	      return x & y ^ x & z ^ y & z;
	    }
	    exports.maj32 = maj32;

	    function p32(x, y, z) {
	      return x ^ y ^ z;
	    }
	    exports.p32 = p32;

	    function s0_256(x) {
	      return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
	    }
	    exports.s0_256 = s0_256;

	    function s1_256(x) {
	      return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
	    }
	    exports.s1_256 = s1_256;

	    function g0_256(x) {
	      return rotr32(x, 7) ^ rotr32(x, 18) ^ x >>> 3;
	    }
	    exports.g0_256 = g0_256;

	    function g1_256(x) {
	      return rotr32(x, 17) ^ rotr32(x, 19) ^ x >>> 10;
	    }
	    exports.g1_256 = g1_256;

	    /***/
	  },
	  /* 10 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = __webpack_require__(1);
	    var common = __webpack_require__(4);
	    var shaCommon = __webpack_require__(9);
	    var assert = __webpack_require__(3);

	    var sum32 = utils.sum32;
	    var sum32_4 = utils.sum32_4;
	    var sum32_5 = utils.sum32_5;
	    var ch32 = shaCommon.ch32;
	    var maj32 = shaCommon.maj32;
	    var s0_256 = shaCommon.s0_256;
	    var s1_256 = shaCommon.s1_256;
	    var g0_256 = shaCommon.g0_256;
	    var g1_256 = shaCommon.g1_256;

	    var BlockHash = common.BlockHash;

	    var sha256_K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

	    function SHA256() {
	      if (!(this instanceof SHA256)) return new SHA256();

	      BlockHash.call(this);
	      this.h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
	      this.k = sha256_K;
	      this.W = new Array(64);
	    }
	    utils.inherits(SHA256, BlockHash);
	    module.exports = SHA256;

	    SHA256.blockSize = 512;
	    SHA256.outSize = 256;
	    SHA256.hmacStrength = 192;
	    SHA256.padLength = 64;

	    SHA256.prototype._update = function _update(msg, start) {
	      var W = this.W;

	      for (var i = 0; i < 16; i++) {
	        W[i] = msg[start + i];
	      }for (; i < W.length; i++) {
	        W[i] = sum32_4(g1_256(W[i - 2]), W[i - 7], g0_256(W[i - 15]), W[i - 16]);
	      }var a = this.h[0];
	      var b = this.h[1];
	      var c = this.h[2];
	      var d = this.h[3];
	      var e = this.h[4];
	      var f = this.h[5];
	      var g = this.h[6];
	      var h = this.h[7];

	      assert(this.k.length === W.length);
	      for (i = 0; i < W.length; i++) {
	        var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i], W[i]);
	        var T2 = sum32(s0_256(a), maj32(a, b, c));
	        h = g;
	        g = f;
	        f = e;
	        e = sum32(d, T1);
	        d = c;
	        c = b;
	        b = a;
	        a = sum32(T1, T2);
	      }

	      this.h[0] = sum32(this.h[0], a);
	      this.h[1] = sum32(this.h[1], b);
	      this.h[2] = sum32(this.h[2], c);
	      this.h[3] = sum32(this.h[3], d);
	      this.h[4] = sum32(this.h[4], e);
	      this.h[5] = sum32(this.h[5], f);
	      this.h[6] = sum32(this.h[6], g);
	      this.h[7] = sum32(this.h[7], h);
	    };

	    SHA256.prototype._digest = function digest(enc) {
	      if (enc === 'hex') return utils.toHex32(this.h, 'big');else return utils.split32(this.h, 'big');
	    };

	    /***/
	  },
	  /* 11 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = __webpack_require__(1);
	    var common = __webpack_require__(4);
	    var assert = __webpack_require__(3);

	    var rotr64_hi = utils.rotr64_hi;
	    var rotr64_lo = utils.rotr64_lo;
	    var shr64_hi = utils.shr64_hi;
	    var shr64_lo = utils.shr64_lo;
	    var sum64 = utils.sum64;
	    var sum64_hi = utils.sum64_hi;
	    var sum64_lo = utils.sum64_lo;
	    var sum64_4_hi = utils.sum64_4_hi;
	    var sum64_4_lo = utils.sum64_4_lo;
	    var sum64_5_hi = utils.sum64_5_hi;
	    var sum64_5_lo = utils.sum64_5_lo;

	    var BlockHash = common.BlockHash;

	    var sha512_K = [0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd, 0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc, 0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019, 0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118, 0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe, 0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2, 0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1, 0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694, 0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3, 0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65, 0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483, 0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5, 0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210, 0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4, 0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725, 0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70, 0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926, 0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df, 0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8, 0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b, 0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001, 0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30, 0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910, 0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8, 0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53, 0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8, 0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb, 0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3, 0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60, 0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec, 0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9, 0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b, 0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207, 0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178, 0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6, 0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b, 0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493, 0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c, 0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a, 0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817];

	    function SHA512() {
	      if (!(this instanceof SHA512)) return new SHA512();

	      BlockHash.call(this);
	      this.h = [0x6a09e667, 0xf3bcc908, 0xbb67ae85, 0x84caa73b, 0x3c6ef372, 0xfe94f82b, 0xa54ff53a, 0x5f1d36f1, 0x510e527f, 0xade682d1, 0x9b05688c, 0x2b3e6c1f, 0x1f83d9ab, 0xfb41bd6b, 0x5be0cd19, 0x137e2179];
	      this.k = sha512_K;
	      this.W = new Array(160);
	    }
	    utils.inherits(SHA512, BlockHash);
	    module.exports = SHA512;

	    SHA512.blockSize = 1024;
	    SHA512.outSize = 512;
	    SHA512.hmacStrength = 192;
	    SHA512.padLength = 128;

	    SHA512.prototype._prepareBlock = function _prepareBlock(msg, start) {
	      var W = this.W;

	      // 32 x 32bit words
	      for (var i = 0; i < 32; i++) {
	        W[i] = msg[start + i];
	      }for (; i < W.length; i += 2) {
	        var c0_hi = g1_512_hi(W[i - 4], W[i - 3]); // i - 2
	        var c0_lo = g1_512_lo(W[i - 4], W[i - 3]);
	        var c1_hi = W[i - 14]; // i - 7
	        var c1_lo = W[i - 13];
	        var c2_hi = g0_512_hi(W[i - 30], W[i - 29]); // i - 15
	        var c2_lo = g0_512_lo(W[i - 30], W[i - 29]);
	        var c3_hi = W[i - 32]; // i - 16
	        var c3_lo = W[i - 31];

	        W[i] = sum64_4_hi(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo);
	        W[i + 1] = sum64_4_lo(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo);
	      }
	    };

	    SHA512.prototype._update = function _update(msg, start) {
	      this._prepareBlock(msg, start);

	      var W = this.W;

	      var ah = this.h[0];
	      var al = this.h[1];
	      var bh = this.h[2];
	      var bl = this.h[3];
	      var ch = this.h[4];
	      var cl = this.h[5];
	      var dh = this.h[6];
	      var dl = this.h[7];
	      var eh = this.h[8];
	      var el = this.h[9];
	      var fh = this.h[10];
	      var fl = this.h[11];
	      var gh = this.h[12];
	      var gl = this.h[13];
	      var hh = this.h[14];
	      var hl = this.h[15];

	      assert(this.k.length === W.length);
	      for (var i = 0; i < W.length; i += 2) {
	        var c0_hi = hh;
	        var c0_lo = hl;
	        var c1_hi = s1_512_hi(eh, el);
	        var c1_lo = s1_512_lo(eh, el);
	        var c2_hi = ch64_hi(eh, el, fh, fl, gh, gl);
	        var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
	        var c3_hi = this.k[i];
	        var c3_lo = this.k[i + 1];
	        var c4_hi = W[i];
	        var c4_lo = W[i + 1];

	        var T1_hi = sum64_5_hi(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo, c4_hi, c4_lo);
	        var T1_lo = sum64_5_lo(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo, c4_hi, c4_lo);

	        c0_hi = s0_512_hi(ah, al);
	        c0_lo = s0_512_lo(ah, al);
	        c1_hi = maj64_hi(ah, al, bh, bl, ch, cl);
	        c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);

	        var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo);
	        var T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);

	        hh = gh;
	        hl = gl;

	        gh = fh;
	        gl = fl;

	        fh = eh;
	        fl = el;

	        eh = sum64_hi(dh, dl, T1_hi, T1_lo);
	        el = sum64_lo(dl, dl, T1_hi, T1_lo);

	        dh = ch;
	        dl = cl;

	        ch = bh;
	        cl = bl;

	        bh = ah;
	        bl = al;

	        ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo);
	        al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
	      }

	      sum64(this.h, 0, ah, al);
	      sum64(this.h, 2, bh, bl);
	      sum64(this.h, 4, ch, cl);
	      sum64(this.h, 6, dh, dl);
	      sum64(this.h, 8, eh, el);
	      sum64(this.h, 10, fh, fl);
	      sum64(this.h, 12, gh, gl);
	      sum64(this.h, 14, hh, hl);
	    };

	    SHA512.prototype._digest = function digest(enc) {
	      if (enc === 'hex') return utils.toHex32(this.h, 'big');else return utils.split32(this.h, 'big');
	    };

	    function ch64_hi(xh, xl, yh, yl, zh) {
	      var r = xh & yh ^ ~xh & zh;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function ch64_lo(xh, xl, yh, yl, zh, zl) {
	      var r = xl & yl ^ ~xl & zl;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function maj64_hi(xh, xl, yh, yl, zh) {
	      var r = xh & yh ^ xh & zh ^ yh & zh;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function maj64_lo(xh, xl, yh, yl, zh, zl) {
	      var r = xl & yl ^ xl & zl ^ yl & zl;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function s0_512_hi(xh, xl) {
	      var c0_hi = rotr64_hi(xh, xl, 28);
	      var c1_hi = rotr64_hi(xl, xh, 2); // 34
	      var c2_hi = rotr64_hi(xl, xh, 7); // 39

	      var r = c0_hi ^ c1_hi ^ c2_hi;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function s0_512_lo(xh, xl) {
	      var c0_lo = rotr64_lo(xh, xl, 28);
	      var c1_lo = rotr64_lo(xl, xh, 2); // 34
	      var c2_lo = rotr64_lo(xl, xh, 7); // 39

	      var r = c0_lo ^ c1_lo ^ c2_lo;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function s1_512_hi(xh, xl) {
	      var c0_hi = rotr64_hi(xh, xl, 14);
	      var c1_hi = rotr64_hi(xh, xl, 18);
	      var c2_hi = rotr64_hi(xl, xh, 9); // 41

	      var r = c0_hi ^ c1_hi ^ c2_hi;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function s1_512_lo(xh, xl) {
	      var c0_lo = rotr64_lo(xh, xl, 14);
	      var c1_lo = rotr64_lo(xh, xl, 18);
	      var c2_lo = rotr64_lo(xl, xh, 9); // 41

	      var r = c0_lo ^ c1_lo ^ c2_lo;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function g0_512_hi(xh, xl) {
	      var c0_hi = rotr64_hi(xh, xl, 1);
	      var c1_hi = rotr64_hi(xh, xl, 8);
	      var c2_hi = shr64_hi(xh, xl, 7);

	      var r = c0_hi ^ c1_hi ^ c2_hi;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function g0_512_lo(xh, xl) {
	      var c0_lo = rotr64_lo(xh, xl, 1);
	      var c1_lo = rotr64_lo(xh, xl, 8);
	      var c2_lo = shr64_lo(xh, xl, 7);

	      var r = c0_lo ^ c1_lo ^ c2_lo;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function g1_512_hi(xh, xl) {
	      var c0_hi = rotr64_hi(xh, xl, 19);
	      var c1_hi = rotr64_hi(xl, xh, 29); // 61
	      var c2_hi = shr64_hi(xh, xl, 6);

	      var r = c0_hi ^ c1_hi ^ c2_hi;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    function g1_512_lo(xh, xl) {
	      var c0_lo = rotr64_lo(xh, xl, 19);
	      var c1_lo = rotr64_lo(xl, xh, 29); // 61
	      var c2_lo = shr64_lo(xh, xl, 6);

	      var r = c0_lo ^ c1_lo ^ c2_lo;
	      if (r < 0) r += 0x100000000;
	      return r;
	    }

	    /***/
	  },
	  /* 12 */
	  /***/function (module) {

	    module.exports = { "_from": "elliptic@6.4.1", "_id": "elliptic@6.4.1", "_inBundle": false, "_integrity": "sha512-BsXLz5sqX8OHcsh7CqBMztyXARmGQ3LWPtGjJi6DiJHq5C/qvi9P3OqgswKSDftbu8+IoI/QDTAm2fFnQ9SZSQ==", "_location": "/elliptic", "_phantomChildren": {}, "_requested": { "type": "version", "registry": true, "raw": "elliptic@6.4.1", "name": "elliptic", "escapedName": "elliptic", "rawSpec": "6.4.1", "saveSpec": null, "fetchSpec": "6.4.1" }, "_requiredBy": ["#USER", "/"], "_resolved": "https://registry.npmjs.org/elliptic/-/elliptic-6.4.1.tgz", "_shasum": "c2d0b7776911b86722c632c3c06c60f2f819939a", "_spec": "elliptic@6.4.1", "_where": "/Users/DoronHomeFolder/Sites/factom/factom-harmony-connect-js-sdk", "author": { "name": "Fedor Indutny", "email": "fedor@indutny.com" }, "bugs": { "url": "https://github.com/indutny/elliptic/issues" }, "bundleDependencies": false, "dependencies": { "bn.js": "^4.4.0", "brorand": "^1.0.1", "hash.js": "^1.0.0", "hmac-drbg": "^1.0.0", "inherits": "^2.0.1", "minimalistic-assert": "^1.0.0", "minimalistic-crypto-utils": "^1.0.0" }, "deprecated": false, "description": "EC cryptography", "devDependencies": { "brfs": "^1.4.3", "coveralls": "^2.11.3", "grunt": "^0.4.5", "grunt-browserify": "^5.0.0", "grunt-cli": "^1.2.0", "grunt-contrib-connect": "^1.0.0", "grunt-contrib-copy": "^1.0.0", "grunt-contrib-uglify": "^1.0.1", "grunt-mocha-istanbul": "^3.0.1", "grunt-saucelabs": "^8.6.2", "istanbul": "^0.4.2", "jscs": "^2.9.0", "jshint": "^2.6.0", "mocha": "^2.1.0" }, "files": ["lib"], "homepage": "https://github.com/indutny/elliptic", "keywords": ["EC", "Elliptic", "curve", "Cryptography"], "license": "MIT", "main": "lib/elliptic.js", "name": "elliptic", "repository": { "type": "git", "url": "git+ssh://git@github.com/indutny/elliptic.git" }, "scripts": { "jscs": "jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js", "jshint": "jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js", "lint": "npm run jscs && npm run jshint", "test": "npm run lint && npm run unit", "unit": "istanbul test _mocha --reporter=spec test/index.js", "version": "grunt dist && git add dist/" }, "version": "6.4.1" };

	    /***/
	  },
	  /* 13 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = exports;
	    var BN = __webpack_require__(2);
	    var minAssert = __webpack_require__(3);
	    var minUtils = __webpack_require__(8);

	    utils.assert = minAssert;
	    utils.toArray = minUtils.toArray;
	    utils.zero2 = minUtils.zero2;
	    utils.toHex = minUtils.toHex;
	    utils.encode = minUtils.encode;

	    // Represent num in a w-NAF form
	    function getNAF(num, w) {
	      var naf = [];
	      var ws = 1 << w + 1;
	      var k = num.clone();
	      while (k.cmpn(1) >= 0) {
	        var z;
	        if (k.isOdd()) {
	          var mod = k.andln(ws - 1);
	          if (mod > (ws >> 1) - 1) z = (ws >> 1) - mod;else z = mod;
	          k.isubn(z);
	        } else {
	          z = 0;
	        }
	        naf.push(z);

	        // Optimization, shift by word if possible
	        var shift = k.cmpn(0) !== 0 && k.andln(ws - 1) === 0 ? w + 1 : 1;
	        for (var i = 1; i < shift; i++) {
	          naf.push(0);
	        }k.iushrn(shift);
	      }

	      return naf;
	    }
	    utils.getNAF = getNAF;

	    // Represent k1, k2 in a Joint Sparse Form
	    function getJSF(k1, k2) {
	      var jsf = [[], []];

	      k1 = k1.clone();
	      k2 = k2.clone();
	      var d1 = 0;
	      var d2 = 0;
	      while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {

	        // First phase
	        var m14 = k1.andln(3) + d1 & 3;
	        var m24 = k2.andln(3) + d2 & 3;
	        if (m14 === 3) m14 = -1;
	        if (m24 === 3) m24 = -1;
	        var u1;
	        if ((m14 & 1) === 0) {
	          u1 = 0;
	        } else {
	          var m8 = k1.andln(7) + d1 & 7;
	          if ((m8 === 3 || m8 === 5) && m24 === 2) u1 = -m14;else u1 = m14;
	        }
	        jsf[0].push(u1);

	        var u2;
	        if ((m24 & 1) === 0) {
	          u2 = 0;
	        } else {
	          var m8 = k2.andln(7) + d2 & 7;
	          if ((m8 === 3 || m8 === 5) && m14 === 2) u2 = -m24;else u2 = m24;
	        }
	        jsf[1].push(u2);

	        // Second phase
	        if (2 * d1 === u1 + 1) d1 = 1 - d1;
	        if (2 * d2 === u2 + 1) d2 = 1 - d2;
	        k1.iushrn(1);
	        k2.iushrn(1);
	      }

	      return jsf;
	    }
	    utils.getJSF = getJSF;

	    function cachedProperty(obj, name, computer) {
	      var key = '_' + name;
	      obj.prototype[name] = function cachedProperty() {
	        return this[key] !== undefined ? this[key] : this[key] = computer.call(this);
	      };
	    }
	    utils.cachedProperty = cachedProperty;

	    function parseBytes(bytes) {
	      return typeof bytes === 'string' ? utils.toArray(bytes, 'hex') : bytes;
	    }
	    utils.parseBytes = parseBytes;

	    function intFromLE(bytes) {
	      return new BN(bytes, 'hex', 'le');
	    }
	    utils.intFromLE = intFromLE;

	    /***/
	  },
	  /* 14 */
	  /***/function (module, exports) {

	    module.exports = function (module) {
	      if (!module.webpackPolyfill) {
	        module.deprecate = function () {};
	        module.paths = [];
	        // module.parent = undefined by default
	        if (!module.children) module.children = [];
	        Object.defineProperty(module, "loaded", {
	          enumerable: true,
	          get: function get() {
	            return module.l;
	          }
	        });
	        Object.defineProperty(module, "id", {
	          enumerable: true,
	          get: function get() {
	            return module.i;
	          }
	        });
	        module.webpackPolyfill = 1;
	      }
	      return module;
	    };

	    /***/
	  },
	  /* 15 */
	  /***/function (module, exports) {

	    /* (ignored) */

	    /***/},
	  /* 16 */
	  /***/function (module, exports, __webpack_require__) {

	    var r;

	    module.exports = function rand(len) {
	      if (!r) r = new Rand(null);

	      return r.generate(len);
	    };

	    function Rand(rand) {
	      this.rand = rand;
	    }
	    module.exports.Rand = Rand;

	    Rand.prototype.generate = function generate(len) {
	      return this._rand(len);
	    };

	    // Emulate crypto API using randy
	    Rand.prototype._rand = function _rand(n) {
	      if (this.rand.getBytes) return this.rand.getBytes(n);

	      var res = new Uint8Array(n);
	      for (var i = 0; i < res.length; i++) {
	        res[i] = this.rand.getByte();
	      }return res;
	    };

	    if ((typeof self === 'undefined' ? 'undefined' : _typeof(self)) === 'object') {
	      if (self.crypto && self.crypto.getRandomValues) {
	        // Modern browsers
	        Rand.prototype._rand = function _rand(n) {
	          var arr = new Uint8Array(n);
	          self.crypto.getRandomValues(arr);
	          return arr;
	        };
	      } else if (self.msCrypto && self.msCrypto.getRandomValues) {
	        // IE
	        Rand.prototype._rand = function _rand(n) {
	          var arr = new Uint8Array(n);
	          self.msCrypto.getRandomValues(arr);
	          return arr;
	        };

	        // Safari's WebWorkers do not have `crypto`
	      } else if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
	        // Old junk
	        Rand.prototype._rand = function () {
	          throw new Error('Not implemented yet');
	        };
	      }
	    } else {
	      // Node.js or Web worker with no crypto support
	      try {
	        var crypto = __webpack_require__(17);
	        if (typeof crypto.randomBytes !== 'function') throw new Error('Not supported');

	        Rand.prototype._rand = function _rand(n) {
	          return crypto.randomBytes(n);
	        };
	      } catch (e) {}
	    }

	    /***/
	  },
	  /* 17 */
	  /***/function (module, exports) {

	    /* (ignored) */

	    /***/},
	  /* 18 */
	  /***/function (module, exports, __webpack_require__) {

	    var BN = __webpack_require__(2);
	    var elliptic = __webpack_require__(0);
	    var utils = elliptic.utils;
	    var getNAF = utils.getNAF;
	    var getJSF = utils.getJSF;
	    var assert = utils.assert;

	    function BaseCurve(type, conf) {
	      this.type = type;
	      this.p = new BN(conf.p, 16);

	      // Use Montgomery, when there is no fast reduction for the prime
	      this.red = conf.prime ? BN.red(conf.prime) : BN.mont(this.p);

	      // Useful for many curves
	      this.zero = new BN(0).toRed(this.red);
	      this.one = new BN(1).toRed(this.red);
	      this.two = new BN(2).toRed(this.red);

	      // Curve configuration, optional
	      this.n = conf.n && new BN(conf.n, 16);
	      this.g = conf.g && this.pointFromJSON(conf.g, conf.gRed);

	      // Temporary arrays
	      this._wnafT1 = new Array(4);
	      this._wnafT2 = new Array(4);
	      this._wnafT3 = new Array(4);
	      this._wnafT4 = new Array(4);

	      // Generalized Greg Maxwell's trick
	      var adjustCount = this.n && this.p.div(this.n);
	      if (!adjustCount || adjustCount.cmpn(100) > 0) {
	        this.redN = null;
	      } else {
	        this._maxwellTrick = true;
	        this.redN = this.n.toRed(this.red);
	      }
	    }
	    module.exports = BaseCurve;

	    BaseCurve.prototype.point = function point() {
	      throw new Error('Not implemented');
	    };

	    BaseCurve.prototype.validate = function validate() {
	      throw new Error('Not implemented');
	    };

	    BaseCurve.prototype._fixedNafMul = function _fixedNafMul(p, k) {
	      assert(p.precomputed);
	      var doubles = p._getDoubles();

	      var naf = getNAF(k, 1);
	      var I = (1 << doubles.step + 1) - (doubles.step % 2 === 0 ? 2 : 1);
	      I /= 3;

	      // Translate into more windowed form
	      var repr = [];
	      for (var j = 0; j < naf.length; j += doubles.step) {
	        var nafW = 0;
	        for (var k = j + doubles.step - 1; k >= j; k--) {
	          nafW = (nafW << 1) + naf[k];
	        }repr.push(nafW);
	      }

	      var a = this.jpoint(null, null, null);
	      var b = this.jpoint(null, null, null);
	      for (var i = I; i > 0; i--) {
	        for (var j = 0; j < repr.length; j++) {
	          var nafW = repr[j];
	          if (nafW === i) b = b.mixedAdd(doubles.points[j]);else if (nafW === -i) b = b.mixedAdd(doubles.points[j].neg());
	        }
	        a = a.add(b);
	      }
	      return a.toP();
	    };

	    BaseCurve.prototype._wnafMul = function _wnafMul(p, k) {
	      var w = 4;

	      // Precompute window
	      var nafPoints = p._getNAFPoints(w);
	      w = nafPoints.wnd;
	      var wnd = nafPoints.points;

	      // Get NAF form
	      var naf = getNAF(k, w);

	      // Add `this`*(N+1) for every w-NAF index
	      var acc = this.jpoint(null, null, null);
	      for (var i = naf.length - 1; i >= 0; i--) {
	        // Count zeroes
	        for (var k = 0; i >= 0 && naf[i] === 0; i--) {
	          k++;
	        }if (i >= 0) k++;
	        acc = acc.dblp(k);

	        if (i < 0) break;
	        var z = naf[i];
	        assert(z !== 0);
	        if (p.type === 'affine') {
	          // J +- P
	          if (z > 0) acc = acc.mixedAdd(wnd[z - 1 >> 1]);else acc = acc.mixedAdd(wnd[-z - 1 >> 1].neg());
	        } else {
	          // J +- J
	          if (z > 0) acc = acc.add(wnd[z - 1 >> 1]);else acc = acc.add(wnd[-z - 1 >> 1].neg());
	        }
	      }
	      return p.type === 'affine' ? acc.toP() : acc;
	    };

	    BaseCurve.prototype._wnafMulAdd = function _wnafMulAdd(defW, points, coeffs, len, jacobianResult) {
	      var wndWidth = this._wnafT1;
	      var wnd = this._wnafT2;
	      var naf = this._wnafT3;

	      // Fill all arrays
	      var max = 0;
	      for (var i = 0; i < len; i++) {
	        var p = points[i];
	        var nafPoints = p._getNAFPoints(defW);
	        wndWidth[i] = nafPoints.wnd;
	        wnd[i] = nafPoints.points;
	      }

	      // Comb small window NAFs
	      for (var i = len - 1; i >= 1; i -= 2) {
	        var a = i - 1;
	        var b = i;
	        if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
	          naf[a] = getNAF(coeffs[a], wndWidth[a]);
	          naf[b] = getNAF(coeffs[b], wndWidth[b]);
	          max = Math.max(naf[a].length, max);
	          max = Math.max(naf[b].length, max);
	          continue;
	        }

	        var comb = [points[a], /* 1 */
	        null, /* 3 */
	        null, /* 5 */
	        points[b] /* 7 */
	        ];

	        // Try to avoid Projective points, if possible
	        if (points[a].y.cmp(points[b].y) === 0) {
	          comb[1] = points[a].add(points[b]);
	          comb[2] = points[a].toJ().mixedAdd(points[b].neg());
	        } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
	          comb[1] = points[a].toJ().mixedAdd(points[b]);
	          comb[2] = points[a].add(points[b].neg());
	        } else {
	          comb[1] = points[a].toJ().mixedAdd(points[b]);
	          comb[2] = points[a].toJ().mixedAdd(points[b].neg());
	        }

	        var index = [-3, /* -1 -1 */
	        -1, /* -1 0 */
	        -5, /* -1 1 */
	        -7, /* 0 -1 */
	        0, /* 0 0 */
	        7, /* 0 1 */
	        5, /* 1 -1 */
	        1, /* 1 0 */
	        3 /* 1 1 */
	        ];

	        var jsf = getJSF(coeffs[a], coeffs[b]);
	        max = Math.max(jsf[0].length, max);
	        naf[a] = new Array(max);
	        naf[b] = new Array(max);
	        for (var j = 0; j < max; j++) {
	          var ja = jsf[0][j] | 0;
	          var jb = jsf[1][j] | 0;

	          naf[a][j] = index[(ja + 1) * 3 + (jb + 1)];
	          naf[b][j] = 0;
	          wnd[a] = comb;
	        }
	      }

	      var acc = this.jpoint(null, null, null);
	      var tmp = this._wnafT4;
	      for (var i = max; i >= 0; i--) {
	        var k = 0;

	        while (i >= 0) {
	          var zero = true;
	          for (var j = 0; j < len; j++) {
	            tmp[j] = naf[j][i] | 0;
	            if (tmp[j] !== 0) zero = false;
	          }
	          if (!zero) break;
	          k++;
	          i--;
	        }
	        if (i >= 0) k++;
	        acc = acc.dblp(k);
	        if (i < 0) break;

	        for (var j = 0; j < len; j++) {
	          var z = tmp[j];
	          var p;
	          if (z === 0) continue;else if (z > 0) p = wnd[j][z - 1 >> 1];else if (z < 0) p = wnd[j][-z - 1 >> 1].neg();

	          if (p.type === 'affine') acc = acc.mixedAdd(p);else acc = acc.add(p);
	        }
	      }
	      // Zeroify references
	      for (var i = 0; i < len; i++) {
	        wnd[i] = null;
	      }if (jacobianResult) return acc;else return acc.toP();
	    };

	    function BasePoint(curve, type) {
	      this.curve = curve;
	      this.type = type;
	      this.precomputed = null;
	    }
	    BaseCurve.BasePoint = BasePoint;

	    BasePoint.prototype.eq = function eq() /*other*/{
	      throw new Error('Not implemented');
	    };

	    BasePoint.prototype.validate = function validate() {
	      return this.curve.validate(this);
	    };

	    BaseCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
	      bytes = utils.toArray(bytes, enc);

	      var len = this.p.byteLength();

	      // uncompressed, hybrid-odd, hybrid-even
	      if ((bytes[0] === 0x04 || bytes[0] === 0x06 || bytes[0] === 0x07) && bytes.length - 1 === 2 * len) {
	        if (bytes[0] === 0x06) assert(bytes[bytes.length - 1] % 2 === 0);else if (bytes[0] === 0x07) assert(bytes[bytes.length - 1] % 2 === 1);

	        var res = this.point(bytes.slice(1, 1 + len), bytes.slice(1 + len, 1 + 2 * len));

	        return res;
	      } else if ((bytes[0] === 0x02 || bytes[0] === 0x03) && bytes.length - 1 === len) {
	        return this.pointFromX(bytes.slice(1, 1 + len), bytes[0] === 0x03);
	      }
	      throw new Error('Unknown point format');
	    };

	    BasePoint.prototype.encodeCompressed = function encodeCompressed(enc) {
	      return this.encode(enc, true);
	    };

	    BasePoint.prototype._encode = function _encode(compact) {
	      var len = this.curve.p.byteLength();
	      var x = this.getX().toArray('be', len);

	      if (compact) return [this.getY().isEven() ? 0x02 : 0x03].concat(x);

	      return [0x04].concat(x, this.getY().toArray('be', len));
	    };

	    BasePoint.prototype.encode = function encode(enc, compact) {
	      return utils.encode(this._encode(compact), enc);
	    };

	    BasePoint.prototype.precompute = function precompute(power) {
	      if (this.precomputed) return this;

	      var precomputed = {
	        doubles: null,
	        naf: null,
	        beta: null
	      };
	      precomputed.naf = this._getNAFPoints(8);
	      precomputed.doubles = this._getDoubles(4, power);
	      precomputed.beta = this._getBeta();
	      this.precomputed = precomputed;

	      return this;
	    };

	    BasePoint.prototype._hasDoubles = function _hasDoubles(k) {
	      if (!this.precomputed) return false;

	      var doubles = this.precomputed.doubles;
	      if (!doubles) return false;

	      return doubles.points.length >= Math.ceil((k.bitLength() + 1) / doubles.step);
	    };

	    BasePoint.prototype._getDoubles = function _getDoubles(step, power) {
	      if (this.precomputed && this.precomputed.doubles) return this.precomputed.doubles;

	      var doubles = [this];
	      var acc = this;
	      for (var i = 0; i < power; i += step) {
	        for (var j = 0; j < step; j++) {
	          acc = acc.dbl();
	        }doubles.push(acc);
	      }
	      return {
	        step: step,
	        points: doubles
	      };
	    };

	    BasePoint.prototype._getNAFPoints = function _getNAFPoints(wnd) {
	      if (this.precomputed && this.precomputed.naf) return this.precomputed.naf;

	      var res = [this];
	      var max = (1 << wnd) - 1;
	      var dbl = max === 1 ? null : this.dbl();
	      for (var i = 1; i < max; i++) {
	        res[i] = res[i - 1].add(dbl);
	      }return {
	        wnd: wnd,
	        points: res
	      };
	    };

	    BasePoint.prototype._getBeta = function _getBeta() {
	      return null;
	    };

	    BasePoint.prototype.dblp = function dblp(k) {
	      var r = this;
	      for (var i = 0; i < k; i++) {
	        r = r.dbl();
	      }return r;
	    };

	    /***/
	  },
	  /* 19 */
	  /***/function (module, exports, __webpack_require__) {

	    var curve = __webpack_require__(5);
	    var elliptic = __webpack_require__(0);
	    var BN = __webpack_require__(2);
	    var inherits = __webpack_require__(6);
	    var Base = curve.base;

	    var assert = elliptic.utils.assert;

	    function ShortCurve(conf) {
	      Base.call(this, 'short', conf);

	      this.a = new BN(conf.a, 16).toRed(this.red);
	      this.b = new BN(conf.b, 16).toRed(this.red);
	      this.tinv = this.two.redInvm();

	      this.zeroA = this.a.fromRed().cmpn(0) === 0;
	      this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0;

	      // If the curve is endomorphic, precalculate beta and lambda
	      this.endo = this._getEndomorphism(conf);
	      this._endoWnafT1 = new Array(4);
	      this._endoWnafT2 = new Array(4);
	    }
	    inherits(ShortCurve, Base);
	    module.exports = ShortCurve;

	    ShortCurve.prototype._getEndomorphism = function _getEndomorphism(conf) {
	      // No efficient endomorphism
	      if (!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1) return;

	      // Compute beta and lambda, that lambda * P = (beta * Px; Py)
	      var beta;
	      var lambda;
	      if (conf.beta) {
	        beta = new BN(conf.beta, 16).toRed(this.red);
	      } else {
	        var betas = this._getEndoRoots(this.p);
	        // Choose the smallest beta
	        beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1];
	        beta = beta.toRed(this.red);
	      }
	      if (conf.lambda) {
	        lambda = new BN(conf.lambda, 16);
	      } else {
	        // Choose the lambda that is matching selected beta
	        var lambdas = this._getEndoRoots(this.n);
	        if (this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta)) === 0) {
	          lambda = lambdas[0];
	        } else {
	          lambda = lambdas[1];
	          assert(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta)) === 0);
	        }
	      }

	      // Get basis vectors, used for balanced length-two representation
	      var basis;
	      if (conf.basis) {
	        basis = conf.basis.map(function (vec) {
	          return {
	            a: new BN(vec.a, 16),
	            b: new BN(vec.b, 16)
	          };
	        });
	      } else {
	        basis = this._getEndoBasis(lambda);
	      }

	      return {
	        beta: beta,
	        lambda: lambda,
	        basis: basis
	      };
	    };

	    ShortCurve.prototype._getEndoRoots = function _getEndoRoots(num) {
	      // Find roots of for x^2 + x + 1 in F
	      // Root = (-1 +- Sqrt(-3)) / 2
	      //
	      var red = num === this.p ? this.red : BN.mont(num);
	      var tinv = new BN(2).toRed(red).redInvm();
	      var ntinv = tinv.redNeg();

	      var s = new BN(3).toRed(red).redNeg().redSqrt().redMul(tinv);

	      var l1 = ntinv.redAdd(s).fromRed();
	      var l2 = ntinv.redSub(s).fromRed();
	      return [l1, l2];
	    };

	    ShortCurve.prototype._getEndoBasis = function _getEndoBasis(lambda) {
	      // aprxSqrt >= sqrt(this.n)
	      var aprxSqrt = this.n.ushrn(Math.floor(this.n.bitLength() / 2));

	      // 3.74
	      // Run EGCD, until r(L + 1) < aprxSqrt
	      var u = lambda;
	      var v = this.n.clone();
	      var x1 = new BN(1);
	      var y1 = new BN(0);
	      var x2 = new BN(0);
	      var y2 = new BN(1);

	      // NOTE: all vectors are roots of: a + b * lambda = 0 (mod n)
	      var a0;
	      var b0;
	      // First vector
	      var a1;
	      var b1;
	      // Second vector
	      var a2;
	      var b2;

	      var prevR;
	      var i = 0;
	      var r;
	      var x;
	      while (u.cmpn(0) !== 0) {
	        var q = v.div(u);
	        r = v.sub(q.mul(u));
	        x = x2.sub(q.mul(x1));
	        var y = y2.sub(q.mul(y1));

	        if (!a1 && r.cmp(aprxSqrt) < 0) {
	          a0 = prevR.neg();
	          b0 = x1;
	          a1 = r.neg();
	          b1 = x;
	        } else if (a1 && ++i === 2) {
	          break;
	        }
	        prevR = r;

	        v = u;
	        u = r;
	        x2 = x1;
	        x1 = x;
	        y2 = y1;
	        y1 = y;
	      }
	      a2 = r.neg();
	      b2 = x;

	      var len1 = a1.sqr().add(b1.sqr());
	      var len2 = a2.sqr().add(b2.sqr());
	      if (len2.cmp(len1) >= 0) {
	        a2 = a0;
	        b2 = b0;
	      }

	      // Normalize signs
	      if (a1.negative) {
	        a1 = a1.neg();
	        b1 = b1.neg();
	      }
	      if (a2.negative) {
	        a2 = a2.neg();
	        b2 = b2.neg();
	      }

	      return [{ a: a1, b: b1 }, { a: a2, b: b2 }];
	    };

	    ShortCurve.prototype._endoSplit = function _endoSplit(k) {
	      var basis = this.endo.basis;
	      var v1 = basis[0];
	      var v2 = basis[1];

	      var c1 = v2.b.mul(k).divRound(this.n);
	      var c2 = v1.b.neg().mul(k).divRound(this.n);

	      var p1 = c1.mul(v1.a);
	      var p2 = c2.mul(v2.a);
	      var q1 = c1.mul(v1.b);
	      var q2 = c2.mul(v2.b);

	      // Calculate answer
	      var k1 = k.sub(p1).sub(p2);
	      var k2 = q1.add(q2).neg();
	      return { k1: k1, k2: k2 };
	    };

	    ShortCurve.prototype.pointFromX = function pointFromX(x, odd) {
	      x = new BN(x, 16);
	      if (!x.red) x = x.toRed(this.red);

	      var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);
	      var y = y2.redSqrt();
	      if (y.redSqr().redSub(y2).cmp(this.zero) !== 0) throw new Error('invalid point');

	      // XXX Is there any way to tell if the number is odd without converting it
	      // to non-red form?
	      var isOdd = y.fromRed().isOdd();
	      if (odd && !isOdd || !odd && isOdd) y = y.redNeg();

	      return this.point(x, y);
	    };

	    ShortCurve.prototype.validate = function validate(point) {
	      if (point.inf) return true;

	      var x = point.x;
	      var y = point.y;

	      var ax = this.a.redMul(x);
	      var rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
	      return y.redSqr().redISub(rhs).cmpn(0) === 0;
	    };

	    ShortCurve.prototype._endoWnafMulAdd = function _endoWnafMulAdd(points, coeffs, jacobianResult) {
	      var npoints = this._endoWnafT1;
	      var ncoeffs = this._endoWnafT2;
	      for (var i = 0; i < points.length; i++) {
	        var split = this._endoSplit(coeffs[i]);
	        var p = points[i];
	        var beta = p._getBeta();

	        if (split.k1.negative) {
	          split.k1.ineg();
	          p = p.neg(true);
	        }
	        if (split.k2.negative) {
	          split.k2.ineg();
	          beta = beta.neg(true);
	        }

	        npoints[i * 2] = p;
	        npoints[i * 2 + 1] = beta;
	        ncoeffs[i * 2] = split.k1;
	        ncoeffs[i * 2 + 1] = split.k2;
	      }
	      var res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2, jacobianResult);

	      // Clean-up references to points and coefficients
	      for (var j = 0; j < i * 2; j++) {
	        npoints[j] = null;
	        ncoeffs[j] = null;
	      }
	      return res;
	    };

	    function Point(curve, x, y, isRed) {
	      Base.BasePoint.call(this, curve, 'affine');
	      if (x === null && y === null) {
	        this.x = null;
	        this.y = null;
	        this.inf = true;
	      } else {
	        this.x = new BN(x, 16);
	        this.y = new BN(y, 16);
	        // Force redgomery representation when loading from JSON
	        if (isRed) {
	          this.x.forceRed(this.curve.red);
	          this.y.forceRed(this.curve.red);
	        }
	        if (!this.x.red) this.x = this.x.toRed(this.curve.red);
	        if (!this.y.red) this.y = this.y.toRed(this.curve.red);
	        this.inf = false;
	      }
	    }
	    inherits(Point, Base.BasePoint);

	    ShortCurve.prototype.point = function point(x, y, isRed) {
	      return new Point(this, x, y, isRed);
	    };

	    ShortCurve.prototype.pointFromJSON = function pointFromJSON(obj, red) {
	      return Point.fromJSON(this, obj, red);
	    };

	    Point.prototype._getBeta = function _getBeta() {
	      if (!this.curve.endo) return;

	      var pre = this.precomputed;
	      if (pre && pre.beta) return pre.beta;

	      var beta = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
	      if (pre) {
	        var curve = this.curve;
	        var endoMul = function endoMul(p) {
	          return curve.point(p.x.redMul(curve.endo.beta), p.y);
	        };
	        pre.beta = beta;
	        beta.precomputed = {
	          beta: null,
	          naf: pre.naf && {
	            wnd: pre.naf.wnd,
	            points: pre.naf.points.map(endoMul)
	          },
	          doubles: pre.doubles && {
	            step: pre.doubles.step,
	            points: pre.doubles.points.map(endoMul)
	          }
	        };
	      }
	      return beta;
	    };

	    Point.prototype.toJSON = function toJSON() {
	      if (!this.precomputed) return [this.x, this.y];

	      return [this.x, this.y, this.precomputed && {
	        doubles: this.precomputed.doubles && {
	          step: this.precomputed.doubles.step,
	          points: this.precomputed.doubles.points.slice(1)
	        },
	        naf: this.precomputed.naf && {
	          wnd: this.precomputed.naf.wnd,
	          points: this.precomputed.naf.points.slice(1)
	        }
	      }];
	    };

	    Point.fromJSON = function fromJSON(curve, obj, red) {
	      if (typeof obj === 'string') obj = JSON.parse(obj);
	      var res = curve.point(obj[0], obj[1], red);
	      if (!obj[2]) return res;

	      function obj2point(obj) {
	        return curve.point(obj[0], obj[1], red);
	      }

	      var pre = obj[2];
	      res.precomputed = {
	        beta: null,
	        doubles: pre.doubles && {
	          step: pre.doubles.step,
	          points: [res].concat(pre.doubles.points.map(obj2point))
	        },
	        naf: pre.naf && {
	          wnd: pre.naf.wnd,
	          points: [res].concat(pre.naf.points.map(obj2point))
	        }
	      };
	      return res;
	    };

	    Point.prototype.inspect = function inspect() {
	      if (this.isInfinity()) return '<EC Point Infinity>';
	      return '<EC Point x: ' + this.x.fromRed().toString(16, 2) + ' y: ' + this.y.fromRed().toString(16, 2) + '>';
	    };

	    Point.prototype.isInfinity = function isInfinity() {
	      return this.inf;
	    };

	    Point.prototype.add = function add(p) {
	      // O + P = P
	      if (this.inf) return p;

	      // P + O = P
	      if (p.inf) return this;

	      // P + P = 2P
	      if (this.eq(p)) return this.dbl();

	      // P + (-P) = O
	      if (this.neg().eq(p)) return this.curve.point(null, null);

	      // P + Q = O
	      if (this.x.cmp(p.x) === 0) return this.curve.point(null, null);

	      var c = this.y.redSub(p.y);
	      if (c.cmpn(0) !== 0) c = c.redMul(this.x.redSub(p.x).redInvm());
	      var nx = c.redSqr().redISub(this.x).redISub(p.x);
	      var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
	      return this.curve.point(nx, ny);
	    };

	    Point.prototype.dbl = function dbl() {
	      if (this.inf) return this;

	      // 2P = O
	      var ys1 = this.y.redAdd(this.y);
	      if (ys1.cmpn(0) === 0) return this.curve.point(null, null);

	      var a = this.curve.a;

	      var x2 = this.x.redSqr();
	      var dyinv = ys1.redInvm();
	      var c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv);

	      var nx = c.redSqr().redISub(this.x.redAdd(this.x));
	      var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
	      return this.curve.point(nx, ny);
	    };

	    Point.prototype.getX = function getX() {
	      return this.x.fromRed();
	    };

	    Point.prototype.getY = function getY() {
	      return this.y.fromRed();
	    };

	    Point.prototype.mul = function mul(k) {
	      k = new BN(k, 16);

	      if (this._hasDoubles(k)) return this.curve._fixedNafMul(this, k);else if (this.curve.endo) return this.curve._endoWnafMulAdd([this], [k]);else return this.curve._wnafMul(this, k);
	    };

	    Point.prototype.mulAdd = function mulAdd(k1, p2, k2) {
	      var points = [this, p2];
	      var coeffs = [k1, k2];
	      if (this.curve.endo) return this.curve._endoWnafMulAdd(points, coeffs);else return this.curve._wnafMulAdd(1, points, coeffs, 2);
	    };

	    Point.prototype.jmulAdd = function jmulAdd(k1, p2, k2) {
	      var points = [this, p2];
	      var coeffs = [k1, k2];
	      if (this.curve.endo) return this.curve._endoWnafMulAdd(points, coeffs, true);else return this.curve._wnafMulAdd(1, points, coeffs, 2, true);
	    };

	    Point.prototype.eq = function eq(p) {
	      return this === p || this.inf === p.inf && (this.inf || this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0);
	    };

	    Point.prototype.neg = function neg(_precompute) {
	      if (this.inf) return this;

	      var res = this.curve.point(this.x, this.y.redNeg());
	      if (_precompute && this.precomputed) {
	        var pre = this.precomputed;
	        var negate = function negate(p) {
	          return p.neg();
	        };
	        res.precomputed = {
	          naf: pre.naf && {
	            wnd: pre.naf.wnd,
	            points: pre.naf.points.map(negate)
	          },
	          doubles: pre.doubles && {
	            step: pre.doubles.step,
	            points: pre.doubles.points.map(negate)
	          }
	        };
	      }
	      return res;
	    };

	    Point.prototype.toJ = function toJ() {
	      if (this.inf) return this.curve.jpoint(null, null, null);

	      var res = this.curve.jpoint(this.x, this.y, this.curve.one);
	      return res;
	    };

	    function JPoint(curve, x, y, z) {
	      Base.BasePoint.call(this, curve, 'jacobian');
	      if (x === null && y === null && z === null) {
	        this.x = this.curve.one;
	        this.y = this.curve.one;
	        this.z = new BN(0);
	      } else {
	        this.x = new BN(x, 16);
	        this.y = new BN(y, 16);
	        this.z = new BN(z, 16);
	      }
	      if (!this.x.red) this.x = this.x.toRed(this.curve.red);
	      if (!this.y.red) this.y = this.y.toRed(this.curve.red);
	      if (!this.z.red) this.z = this.z.toRed(this.curve.red);

	      this.zOne = this.z === this.curve.one;
	    }
	    inherits(JPoint, Base.BasePoint);

	    ShortCurve.prototype.jpoint = function jpoint(x, y, z) {
	      return new JPoint(this, x, y, z);
	    };

	    JPoint.prototype.toP = function toP() {
	      if (this.isInfinity()) return this.curve.point(null, null);

	      var zinv = this.z.redInvm();
	      var zinv2 = zinv.redSqr();
	      var ax = this.x.redMul(zinv2);
	      var ay = this.y.redMul(zinv2).redMul(zinv);

	      return this.curve.point(ax, ay);
	    };

	    JPoint.prototype.neg = function neg() {
	      return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
	    };

	    JPoint.prototype.add = function add(p) {
	      // O + P = P
	      if (this.isInfinity()) return p;

	      // P + O = P
	      if (p.isInfinity()) return this;

	      // 12M + 4S + 7A
	      var pz2 = p.z.redSqr();
	      var z2 = this.z.redSqr();
	      var u1 = this.x.redMul(pz2);
	      var u2 = p.x.redMul(z2);
	      var s1 = this.y.redMul(pz2.redMul(p.z));
	      var s2 = p.y.redMul(z2.redMul(this.z));

	      var h = u1.redSub(u2);
	      var r = s1.redSub(s2);
	      if (h.cmpn(0) === 0) {
	        if (r.cmpn(0) !== 0) return this.curve.jpoint(null, null, null);else return this.dbl();
	      }

	      var h2 = h.redSqr();
	      var h3 = h2.redMul(h);
	      var v = u1.redMul(h2);

	      var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
	      var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
	      var nz = this.z.redMul(p.z).redMul(h);

	      return this.curve.jpoint(nx, ny, nz);
	    };

	    JPoint.prototype.mixedAdd = function mixedAdd(p) {
	      // O + P = P
	      if (this.isInfinity()) return p.toJ();

	      // P + O = P
	      if (p.isInfinity()) return this;

	      // 8M + 3S + 7A
	      var z2 = this.z.redSqr();
	      var u1 = this.x;
	      var u2 = p.x.redMul(z2);
	      var s1 = this.y;
	      var s2 = p.y.redMul(z2).redMul(this.z);

	      var h = u1.redSub(u2);
	      var r = s1.redSub(s2);
	      if (h.cmpn(0) === 0) {
	        if (r.cmpn(0) !== 0) return this.curve.jpoint(null, null, null);else return this.dbl();
	      }

	      var h2 = h.redSqr();
	      var h3 = h2.redMul(h);
	      var v = u1.redMul(h2);

	      var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
	      var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
	      var nz = this.z.redMul(h);

	      return this.curve.jpoint(nx, ny, nz);
	    };

	    JPoint.prototype.dblp = function dblp(pow) {
	      if (pow === 0) return this;
	      if (this.isInfinity()) return this;
	      if (!pow) return this.dbl();

	      if (this.curve.zeroA || this.curve.threeA) {
	        var r = this;
	        for (var i = 0; i < pow; i++) {
	          r = r.dbl();
	        }return r;
	      }

	      // 1M + 2S + 1A + N * (4S + 5M + 8A)
	      // N = 1 => 6M + 6S + 9A
	      var a = this.curve.a;
	      var tinv = this.curve.tinv;

	      var jx = this.x;
	      var jy = this.y;
	      var jz = this.z;
	      var jz4 = jz.redSqr().redSqr();

	      // Reuse results
	      var jyd = jy.redAdd(jy);
	      for (var i = 0; i < pow; i++) {
	        var jx2 = jx.redSqr();
	        var jyd2 = jyd.redSqr();
	        var jyd4 = jyd2.redSqr();
	        var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

	        var t1 = jx.redMul(jyd2);
	        var nx = c.redSqr().redISub(t1.redAdd(t1));
	        var t2 = t1.redISub(nx);
	        var dny = c.redMul(t2);
	        dny = dny.redIAdd(dny).redISub(jyd4);
	        var nz = jyd.redMul(jz);
	        if (i + 1 < pow) jz4 = jz4.redMul(jyd4);

	        jx = nx;
	        jz = nz;
	        jyd = dny;
	      }

	      return this.curve.jpoint(jx, jyd.redMul(tinv), jz);
	    };

	    JPoint.prototype.dbl = function dbl() {
	      if (this.isInfinity()) return this;

	      if (this.curve.zeroA) return this._zeroDbl();else if (this.curve.threeA) return this._threeDbl();else return this._dbl();
	    };

	    JPoint.prototype._zeroDbl = function _zeroDbl() {
	      var nx;
	      var ny;
	      var nz;
	      // Z = 1
	      if (this.zOne) {
	        // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
	        //     #doubling-mdbl-2007-bl
	        // 1M + 5S + 14A

	        // XX = X1^2
	        var xx = this.x.redSqr();
	        // YY = Y1^2
	        var yy = this.y.redSqr();
	        // YYYY = YY^2
	        var yyyy = yy.redSqr();
	        // S = 2 * ((X1 + YY)^2 - XX - YYYY)
	        var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
	        s = s.redIAdd(s);
	        // M = 3 * XX + a; a = 0
	        var m = xx.redAdd(xx).redIAdd(xx);
	        // T = M ^ 2 - 2*S
	        var t = m.redSqr().redISub(s).redISub(s);

	        // 8 * YYYY
	        var yyyy8 = yyyy.redIAdd(yyyy);
	        yyyy8 = yyyy8.redIAdd(yyyy8);
	        yyyy8 = yyyy8.redIAdd(yyyy8);

	        // X3 = T
	        nx = t;
	        // Y3 = M * (S - T) - 8 * YYYY
	        ny = m.redMul(s.redISub(t)).redISub(yyyy8);
	        // Z3 = 2*Y1
	        nz = this.y.redAdd(this.y);
	      } else {
	        // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
	        //     #doubling-dbl-2009-l
	        // 2M + 5S + 13A

	        // A = X1^2
	        var a = this.x.redSqr();
	        // B = Y1^2
	        var b = this.y.redSqr();
	        // C = B^2
	        var c = b.redSqr();
	        // D = 2 * ((X1 + B)^2 - A - C)
	        var d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
	        d = d.redIAdd(d);
	        // E = 3 * A
	        var e = a.redAdd(a).redIAdd(a);
	        // F = E^2
	        var f = e.redSqr();

	        // 8 * C
	        var c8 = c.redIAdd(c);
	        c8 = c8.redIAdd(c8);
	        c8 = c8.redIAdd(c8);

	        // X3 = F - 2 * D
	        nx = f.redISub(d).redISub(d);
	        // Y3 = E * (D - X3) - 8 * C
	        ny = e.redMul(d.redISub(nx)).redISub(c8);
	        // Z3 = 2 * Y1 * Z1
	        nz = this.y.redMul(this.z);
	        nz = nz.redIAdd(nz);
	      }

	      return this.curve.jpoint(nx, ny, nz);
	    };

	    JPoint.prototype._threeDbl = function _threeDbl() {
	      var nx;
	      var ny;
	      var nz;
	      // Z = 1
	      if (this.zOne) {
	        // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html
	        //     #doubling-mdbl-2007-bl
	        // 1M + 5S + 15A

	        // XX = X1^2
	        var xx = this.x.redSqr();
	        // YY = Y1^2
	        var yy = this.y.redSqr();
	        // YYYY = YY^2
	        var yyyy = yy.redSqr();
	        // S = 2 * ((X1 + YY)^2 - XX - YYYY)
	        var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
	        s = s.redIAdd(s);
	        // M = 3 * XX + a
	        var m = xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a);
	        // T = M^2 - 2 * S
	        var t = m.redSqr().redISub(s).redISub(s);
	        // X3 = T
	        nx = t;
	        // Y3 = M * (S - T) - 8 * YYYY
	        var yyyy8 = yyyy.redIAdd(yyyy);
	        yyyy8 = yyyy8.redIAdd(yyyy8);
	        yyyy8 = yyyy8.redIAdd(yyyy8);
	        ny = m.redMul(s.redISub(t)).redISub(yyyy8);
	        // Z3 = 2 * Y1
	        nz = this.y.redAdd(this.y);
	      } else {
	        // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html#doubling-dbl-2001-b
	        // 3M + 5S

	        // delta = Z1^2
	        var delta = this.z.redSqr();
	        // gamma = Y1^2
	        var gamma = this.y.redSqr();
	        // beta = X1 * gamma
	        var beta = this.x.redMul(gamma);
	        // alpha = 3 * (X1 - delta) * (X1 + delta)
	        var alpha = this.x.redSub(delta).redMul(this.x.redAdd(delta));
	        alpha = alpha.redAdd(alpha).redIAdd(alpha);
	        // X3 = alpha^2 - 8 * beta
	        var beta4 = beta.redIAdd(beta);
	        beta4 = beta4.redIAdd(beta4);
	        var beta8 = beta4.redAdd(beta4);
	        nx = alpha.redSqr().redISub(beta8);
	        // Z3 = (Y1 + Z1)^2 - gamma - delta
	        nz = this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);
	        // Y3 = alpha * (4 * beta - X3) - 8 * gamma^2
	        var ggamma8 = gamma.redSqr();
	        ggamma8 = ggamma8.redIAdd(ggamma8);
	        ggamma8 = ggamma8.redIAdd(ggamma8);
	        ggamma8 = ggamma8.redIAdd(ggamma8);
	        ny = alpha.redMul(beta4.redISub(nx)).redISub(ggamma8);
	      }

	      return this.curve.jpoint(nx, ny, nz);
	    };

	    JPoint.prototype._dbl = function _dbl() {
	      var a = this.curve.a;

	      // 4M + 6S + 10A
	      var jx = this.x;
	      var jy = this.y;
	      var jz = this.z;
	      var jz4 = jz.redSqr().redSqr();

	      var jx2 = jx.redSqr();
	      var jy2 = jy.redSqr();

	      var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

	      var jxd4 = jx.redAdd(jx);
	      jxd4 = jxd4.redIAdd(jxd4);
	      var t1 = jxd4.redMul(jy2);
	      var nx = c.redSqr().redISub(t1.redAdd(t1));
	      var t2 = t1.redISub(nx);

	      var jyd8 = jy2.redSqr();
	      jyd8 = jyd8.redIAdd(jyd8);
	      jyd8 = jyd8.redIAdd(jyd8);
	      jyd8 = jyd8.redIAdd(jyd8);
	      var ny = c.redMul(t2).redISub(jyd8);
	      var nz = jy.redAdd(jy).redMul(jz);

	      return this.curve.jpoint(nx, ny, nz);
	    };

	    JPoint.prototype.trpl = function trpl() {
	      if (!this.curve.zeroA) return this.dbl().add(this);

	      // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#tripling-tpl-2007-bl
	      // 5M + 10S + ...

	      // XX = X1^2
	      var xx = this.x.redSqr();
	      // YY = Y1^2
	      var yy = this.y.redSqr();
	      // ZZ = Z1^2
	      var zz = this.z.redSqr();
	      // YYYY = YY^2
	      var yyyy = yy.redSqr();
	      // M = 3 * XX + a * ZZ2; a = 0
	      var m = xx.redAdd(xx).redIAdd(xx);
	      // MM = M^2
	      var mm = m.redSqr();
	      // E = 6 * ((X1 + YY)^2 - XX - YYYY) - MM
	      var e = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
	      e = e.redIAdd(e);
	      e = e.redAdd(e).redIAdd(e);
	      e = e.redISub(mm);
	      // EE = E^2
	      var ee = e.redSqr();
	      // T = 16*YYYY
	      var t = yyyy.redIAdd(yyyy);
	      t = t.redIAdd(t);
	      t = t.redIAdd(t);
	      t = t.redIAdd(t);
	      // U = (M + E)^2 - MM - EE - T
	      var u = m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t);
	      // X3 = 4 * (X1 * EE - 4 * YY * U)
	      var yyu4 = yy.redMul(u);
	      yyu4 = yyu4.redIAdd(yyu4);
	      yyu4 = yyu4.redIAdd(yyu4);
	      var nx = this.x.redMul(ee).redISub(yyu4);
	      nx = nx.redIAdd(nx);
	      nx = nx.redIAdd(nx);
	      // Y3 = 8 * Y1 * (U * (T - U) - E * EE)
	      var ny = this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));
	      ny = ny.redIAdd(ny);
	      ny = ny.redIAdd(ny);
	      ny = ny.redIAdd(ny);
	      // Z3 = (Z1 + E)^2 - ZZ - EE
	      var nz = this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);

	      return this.curve.jpoint(nx, ny, nz);
	    };

	    JPoint.prototype.mul = function mul(k, kbase) {
	      k = new BN(k, kbase);

	      return this.curve._wnafMul(this, k);
	    };

	    JPoint.prototype.eq = function eq(p) {
	      if (p.type === 'affine') return this.eq(p.toJ());

	      if (this === p) return true;

	      // x1 * z2^2 == x2 * z1^2
	      var z2 = this.z.redSqr();
	      var pz2 = p.z.redSqr();
	      if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0) return false;

	      // y1 * z2^3 == y2 * z1^3
	      var z3 = z2.redMul(this.z);
	      var pz3 = pz2.redMul(p.z);
	      return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
	    };

	    JPoint.prototype.eqXToP = function eqXToP(x) {
	      var zs = this.z.redSqr();
	      var rx = x.toRed(this.curve.red).redMul(zs);
	      if (this.x.cmp(rx) === 0) return true;

	      var xc = x.clone();
	      var t = this.curve.redN.redMul(zs);
	      for (;;) {
	        xc.iadd(this.curve.n);
	        if (xc.cmp(this.curve.p) >= 0) return false;

	        rx.redIAdd(t);
	        if (this.x.cmp(rx) === 0) return true;
	      }
	    };

	    JPoint.prototype.inspect = function inspect() {
	      if (this.isInfinity()) return '<EC JPoint Infinity>';
	      return '<EC JPoint x: ' + this.x.toString(16, 2) + ' y: ' + this.y.toString(16, 2) + ' z: ' + this.z.toString(16, 2) + '>';
	    };

	    JPoint.prototype.isInfinity = function isInfinity() {
	      // XXX This code assumes that zero is always zero in red
	      return this.z.cmpn(0) === 0;
	    };

	    /***/
	  },
	  /* 20 */
	  /***/function (module, exports, __webpack_require__) {

	    var curve = __webpack_require__(5);
	    var BN = __webpack_require__(2);
	    var inherits = __webpack_require__(6);
	    var Base = curve.base;

	    var elliptic = __webpack_require__(0);
	    var utils = elliptic.utils;

	    function MontCurve(conf) {
	      Base.call(this, 'mont', conf);

	      this.a = new BN(conf.a, 16).toRed(this.red);
	      this.b = new BN(conf.b, 16).toRed(this.red);
	      this.i4 = new BN(4).toRed(this.red).redInvm();
	      this.two = new BN(2).toRed(this.red);
	      this.a24 = this.i4.redMul(this.a.redAdd(this.two));
	    }
	    inherits(MontCurve, Base);
	    module.exports = MontCurve;

	    MontCurve.prototype.validate = function validate(point) {
	      var x = point.normalize().x;
	      var x2 = x.redSqr();
	      var rhs = x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x);
	      var y = rhs.redSqrt();

	      return y.redSqr().cmp(rhs) === 0;
	    };

	    function Point(curve, x, z) {
	      Base.BasePoint.call(this, curve, 'projective');
	      if (x === null && z === null) {
	        this.x = this.curve.one;
	        this.z = this.curve.zero;
	      } else {
	        this.x = new BN(x, 16);
	        this.z = new BN(z, 16);
	        if (!this.x.red) this.x = this.x.toRed(this.curve.red);
	        if (!this.z.red) this.z = this.z.toRed(this.curve.red);
	      }
	    }
	    inherits(Point, Base.BasePoint);

	    MontCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
	      return this.point(utils.toArray(bytes, enc), 1);
	    };

	    MontCurve.prototype.point = function point(x, z) {
	      return new Point(this, x, z);
	    };

	    MontCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
	      return Point.fromJSON(this, obj);
	    };

	    Point.prototype.precompute = function precompute() {
	      // No-op
	    };

	    Point.prototype._encode = function _encode() {
	      return this.getX().toArray('be', this.curve.p.byteLength());
	    };

	    Point.fromJSON = function fromJSON(curve, obj) {
	      return new Point(curve, obj[0], obj[1] || curve.one);
	    };

	    Point.prototype.inspect = function inspect() {
	      if (this.isInfinity()) return '<EC Point Infinity>';
	      return '<EC Point x: ' + this.x.fromRed().toString(16, 2) + ' z: ' + this.z.fromRed().toString(16, 2) + '>';
	    };

	    Point.prototype.isInfinity = function isInfinity() {
	      // XXX This code assumes that zero is always zero in red
	      return this.z.cmpn(0) === 0;
	    };

	    Point.prototype.dbl = function dbl() {
	      // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#doubling-dbl-1987-m-3
	      // 2M + 2S + 4A

	      // A = X1 + Z1
	      var a = this.x.redAdd(this.z);
	      // AA = A^2
	      var aa = a.redSqr();
	      // B = X1 - Z1
	      var b = this.x.redSub(this.z);
	      // BB = B^2
	      var bb = b.redSqr();
	      // C = AA - BB
	      var c = aa.redSub(bb);
	      // X3 = AA * BB
	      var nx = aa.redMul(bb);
	      // Z3 = C * (BB + A24 * C)
	      var nz = c.redMul(bb.redAdd(this.curve.a24.redMul(c)));
	      return this.curve.point(nx, nz);
	    };

	    Point.prototype.add = function add() {
	      throw new Error('Not supported on Montgomery curve');
	    };

	    Point.prototype.diffAdd = function diffAdd(p, diff) {
	      // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#diffadd-dadd-1987-m-3
	      // 4M + 2S + 6A

	      // A = X2 + Z2
	      var a = this.x.redAdd(this.z);
	      // B = X2 - Z2
	      var b = this.x.redSub(this.z);
	      // C = X3 + Z3
	      var c = p.x.redAdd(p.z);
	      // D = X3 - Z3
	      var d = p.x.redSub(p.z);
	      // DA = D * A
	      var da = d.redMul(a);
	      // CB = C * B
	      var cb = c.redMul(b);
	      // X5 = Z1 * (DA + CB)^2
	      var nx = diff.z.redMul(da.redAdd(cb).redSqr());
	      // Z5 = X1 * (DA - CB)^2
	      var nz = diff.x.redMul(da.redISub(cb).redSqr());
	      return this.curve.point(nx, nz);
	    };

	    Point.prototype.mul = function mul(k) {
	      var t = k.clone();
	      var a = this; // (N / 2) * Q + Q
	      var b = this.curve.point(null, null); // (N / 2) * Q
	      var c = this; // Q

	      for (var bits = []; t.cmpn(0) !== 0; t.iushrn(1)) {
	        bits.push(t.andln(1));
	      }for (var i = bits.length - 1; i >= 0; i--) {
	        if (bits[i] === 0) {
	          // N * Q + Q = ((N / 2) * Q + Q)) + (N / 2) * Q
	          a = a.diffAdd(b, c);
	          // N * Q = 2 * ((N / 2) * Q + Q))
	          b = b.dbl();
	        } else {
	          // N * Q = ((N / 2) * Q + Q) + ((N / 2) * Q)
	          b = a.diffAdd(b, c);
	          // N * Q + Q = 2 * ((N / 2) * Q + Q)
	          a = a.dbl();
	        }
	      }
	      return b;
	    };

	    Point.prototype.mulAdd = function mulAdd() {
	      throw new Error('Not supported on Montgomery curve');
	    };

	    Point.prototype.jumlAdd = function jumlAdd() {
	      throw new Error('Not supported on Montgomery curve');
	    };

	    Point.prototype.eq = function eq(other) {
	      return this.getX().cmp(other.getX()) === 0;
	    };

	    Point.prototype.normalize = function normalize() {
	      this.x = this.x.redMul(this.z.redInvm());
	      this.z = this.curve.one;
	      return this;
	    };

	    Point.prototype.getX = function getX() {
	      // Normalize coordinates
	      this.normalize();

	      return this.x.fromRed();
	    };

	    /***/
	  },
	  /* 21 */
	  /***/function (module, exports, __webpack_require__) {

	    var curve = __webpack_require__(5);
	    var elliptic = __webpack_require__(0);
	    var BN = __webpack_require__(2);
	    var inherits = __webpack_require__(6);
	    var Base = curve.base;

	    var assert = elliptic.utils.assert;

	    function EdwardsCurve(conf) {
	      // NOTE: Important as we are creating point in Base.call()
	      this.twisted = (conf.a | 0) !== 1;
	      this.mOneA = this.twisted && (conf.a | 0) === -1;
	      this.extended = this.mOneA;

	      Base.call(this, 'edwards', conf);

	      this.a = new BN(conf.a, 16).umod(this.red.m);
	      this.a = this.a.toRed(this.red);
	      this.c = new BN(conf.c, 16).toRed(this.red);
	      this.c2 = this.c.redSqr();
	      this.d = new BN(conf.d, 16).toRed(this.red);
	      this.dd = this.d.redAdd(this.d);

	      assert(!this.twisted || this.c.fromRed().cmpn(1) === 0);
	      this.oneC = (conf.c | 0) === 1;
	    }
	    inherits(EdwardsCurve, Base);
	    module.exports = EdwardsCurve;

	    EdwardsCurve.prototype._mulA = function _mulA(num) {
	      if (this.mOneA) return num.redNeg();else return this.a.redMul(num);
	    };

	    EdwardsCurve.prototype._mulC = function _mulC(num) {
	      if (this.oneC) return num;else return this.c.redMul(num);
	    };

	    // Just for compatibility with Short curve
	    EdwardsCurve.prototype.jpoint = function jpoint(x, y, z, t) {
	      return this.point(x, y, z, t);
	    };

	    EdwardsCurve.prototype.pointFromX = function pointFromX(x, odd) {
	      x = new BN(x, 16);
	      if (!x.red) x = x.toRed(this.red);

	      var x2 = x.redSqr();
	      var rhs = this.c2.redSub(this.a.redMul(x2));
	      var lhs = this.one.redSub(this.c2.redMul(this.d).redMul(x2));

	      var y2 = rhs.redMul(lhs.redInvm());
	      var y = y2.redSqrt();
	      if (y.redSqr().redSub(y2).cmp(this.zero) !== 0) throw new Error('invalid point');

	      var isOdd = y.fromRed().isOdd();
	      if (odd && !isOdd || !odd && isOdd) y = y.redNeg();

	      return this.point(x, y);
	    };

	    EdwardsCurve.prototype.pointFromY = function pointFromY(y, odd) {
	      y = new BN(y, 16);
	      if (!y.red) y = y.toRed(this.red);

	      // x^2 = (y^2 - c^2) / (c^2 d y^2 - a)
	      var y2 = y.redSqr();
	      var lhs = y2.redSub(this.c2);
	      var rhs = y2.redMul(this.d).redMul(this.c2).redSub(this.a);
	      var x2 = lhs.redMul(rhs.redInvm());

	      if (x2.cmp(this.zero) === 0) {
	        if (odd) throw new Error('invalid point');else return this.point(this.zero, y);
	      }

	      var x = x2.redSqrt();
	      if (x.redSqr().redSub(x2).cmp(this.zero) !== 0) throw new Error('invalid point');

	      if (x.fromRed().isOdd() !== odd) x = x.redNeg();

	      return this.point(x, y);
	    };

	    EdwardsCurve.prototype.validate = function validate(point) {
	      if (point.isInfinity()) return true;

	      // Curve: A * X^2 + Y^2 = C^2 * (1 + D * X^2 * Y^2)
	      point.normalize();

	      var x2 = point.x.redSqr();
	      var y2 = point.y.redSqr();
	      var lhs = x2.redMul(this.a).redAdd(y2);
	      var rhs = this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));

	      return lhs.cmp(rhs) === 0;
	    };

	    function Point(curve, x, y, z, t) {
	      Base.BasePoint.call(this, curve, 'projective');
	      if (x === null && y === null && z === null) {
	        this.x = this.curve.zero;
	        this.y = this.curve.one;
	        this.z = this.curve.one;
	        this.t = this.curve.zero;
	        this.zOne = true;
	      } else {
	        this.x = new BN(x, 16);
	        this.y = new BN(y, 16);
	        this.z = z ? new BN(z, 16) : this.curve.one;
	        this.t = t && new BN(t, 16);
	        if (!this.x.red) this.x = this.x.toRed(this.curve.red);
	        if (!this.y.red) this.y = this.y.toRed(this.curve.red);
	        if (!this.z.red) this.z = this.z.toRed(this.curve.red);
	        if (this.t && !this.t.red) this.t = this.t.toRed(this.curve.red);
	        this.zOne = this.z === this.curve.one;

	        // Use extended coordinates
	        if (this.curve.extended && !this.t) {
	          this.t = this.x.redMul(this.y);
	          if (!this.zOne) this.t = this.t.redMul(this.z.redInvm());
	        }
	      }
	    }
	    inherits(Point, Base.BasePoint);

	    EdwardsCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
	      return Point.fromJSON(this, obj);
	    };

	    EdwardsCurve.prototype.point = function point(x, y, z, t) {
	      return new Point(this, x, y, z, t);
	    };

	    Point.fromJSON = function fromJSON(curve, obj) {
	      return new Point(curve, obj[0], obj[1], obj[2]);
	    };

	    Point.prototype.inspect = function inspect() {
	      if (this.isInfinity()) return '<EC Point Infinity>';
	      return '<EC Point x: ' + this.x.fromRed().toString(16, 2) + ' y: ' + this.y.fromRed().toString(16, 2) + ' z: ' + this.z.fromRed().toString(16, 2) + '>';
	    };

	    Point.prototype.isInfinity = function isInfinity() {
	      // XXX This code assumes that zero is always zero in red
	      return this.x.cmpn(0) === 0 && (this.y.cmp(this.z) === 0 || this.zOne && this.y.cmp(this.curve.c) === 0);
	    };

	    Point.prototype._extDbl = function _extDbl() {
	      // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
	      //     #doubling-dbl-2008-hwcd
	      // 4M + 4S

	      // A = X1^2
	      var a = this.x.redSqr();
	      // B = Y1^2
	      var b = this.y.redSqr();
	      // C = 2 * Z1^2
	      var c = this.z.redSqr();
	      c = c.redIAdd(c);
	      // D = a * A
	      var d = this.curve._mulA(a);
	      // E = (X1 + Y1)^2 - A - B
	      var e = this.x.redAdd(this.y).redSqr().redISub(a).redISub(b);
	      // G = D + B
	      var g = d.redAdd(b);
	      // F = G - C
	      var f = g.redSub(c);
	      // H = D - B
	      var h = d.redSub(b);
	      // X3 = E * F
	      var nx = e.redMul(f);
	      // Y3 = G * H
	      var ny = g.redMul(h);
	      // T3 = E * H
	      var nt = e.redMul(h);
	      // Z3 = F * G
	      var nz = f.redMul(g);
	      return this.curve.point(nx, ny, nz, nt);
	    };

	    Point.prototype._projDbl = function _projDbl() {
	      // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
	      //     #doubling-dbl-2008-bbjlp
	      //     #doubling-dbl-2007-bl
	      // and others
	      // Generally 3M + 4S or 2M + 4S

	      // B = (X1 + Y1)^2
	      var b = this.x.redAdd(this.y).redSqr();
	      // C = X1^2
	      var c = this.x.redSqr();
	      // D = Y1^2
	      var d = this.y.redSqr();

	      var nx;
	      var ny;
	      var nz;
	      if (this.curve.twisted) {
	        // E = a * C
	        var e = this.curve._mulA(c);
	        // F = E + D
	        var f = e.redAdd(d);
	        if (this.zOne) {
	          // X3 = (B - C - D) * (F - 2)
	          nx = b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two));
	          // Y3 = F * (E - D)
	          ny = f.redMul(e.redSub(d));
	          // Z3 = F^2 - 2 * F
	          nz = f.redSqr().redSub(f).redSub(f);
	        } else {
	          // H = Z1^2
	          var h = this.z.redSqr();
	          // J = F - 2 * H
	          var j = f.redSub(h).redISub(h);
	          // X3 = (B-C-D)*J
	          nx = b.redSub(c).redISub(d).redMul(j);
	          // Y3 = F * (E - D)
	          ny = f.redMul(e.redSub(d));
	          // Z3 = F * J
	          nz = f.redMul(j);
	        }
	      } else {
	        // E = C + D
	        var e = c.redAdd(d);
	        // H = (c * Z1)^2
	        var h = this.curve._mulC(this.z).redSqr();
	        // J = E - 2 * H
	        var j = e.redSub(h).redSub(h);
	        // X3 = c * (B - E) * J
	        nx = this.curve._mulC(b.redISub(e)).redMul(j);
	        // Y3 = c * E * (C - D)
	        ny = this.curve._mulC(e).redMul(c.redISub(d));
	        // Z3 = E * J
	        nz = e.redMul(j);
	      }
	      return this.curve.point(nx, ny, nz);
	    };

	    Point.prototype.dbl = function dbl() {
	      if (this.isInfinity()) return this;

	      // Double in extended coordinates
	      if (this.curve.extended) return this._extDbl();else return this._projDbl();
	    };

	    Point.prototype._extAdd = function _extAdd(p) {
	      // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
	      //     #addition-add-2008-hwcd-3
	      // 8M

	      // A = (Y1 - X1) * (Y2 - X2)
	      var a = this.y.redSub(this.x).redMul(p.y.redSub(p.x));
	      // B = (Y1 + X1) * (Y2 + X2)
	      var b = this.y.redAdd(this.x).redMul(p.y.redAdd(p.x));
	      // C = T1 * k * T2
	      var c = this.t.redMul(this.curve.dd).redMul(p.t);
	      // D = Z1 * 2 * Z2
	      var d = this.z.redMul(p.z.redAdd(p.z));
	      // E = B - A
	      var e = b.redSub(a);
	      // F = D - C
	      var f = d.redSub(c);
	      // G = D + C
	      var g = d.redAdd(c);
	      // H = B + A
	      var h = b.redAdd(a);
	      // X3 = E * F
	      var nx = e.redMul(f);
	      // Y3 = G * H
	      var ny = g.redMul(h);
	      // T3 = E * H
	      var nt = e.redMul(h);
	      // Z3 = F * G
	      var nz = f.redMul(g);
	      return this.curve.point(nx, ny, nz, nt);
	    };

	    Point.prototype._projAdd = function _projAdd(p) {
	      // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
	      //     #addition-add-2008-bbjlp
	      //     #addition-add-2007-bl
	      // 10M + 1S

	      // A = Z1 * Z2
	      var a = this.z.redMul(p.z);
	      // B = A^2
	      var b = a.redSqr();
	      // C = X1 * X2
	      var c = this.x.redMul(p.x);
	      // D = Y1 * Y2
	      var d = this.y.redMul(p.y);
	      // E = d * C * D
	      var e = this.curve.d.redMul(c).redMul(d);
	      // F = B - E
	      var f = b.redSub(e);
	      // G = B + E
	      var g = b.redAdd(e);
	      // X3 = A * F * ((X1 + Y1) * (X2 + Y2) - C - D)
	      var tmp = this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d);
	      var nx = a.redMul(f).redMul(tmp);
	      var ny;
	      var nz;
	      if (this.curve.twisted) {
	        // Y3 = A * G * (D - a * C)
	        ny = a.redMul(g).redMul(d.redSub(this.curve._mulA(c)));
	        // Z3 = F * G
	        nz = f.redMul(g);
	      } else {
	        // Y3 = A * G * (D - C)
	        ny = a.redMul(g).redMul(d.redSub(c));
	        // Z3 = c * F * G
	        nz = this.curve._mulC(f).redMul(g);
	      }
	      return this.curve.point(nx, ny, nz);
	    };

	    Point.prototype.add = function add(p) {
	      if (this.isInfinity()) return p;
	      if (p.isInfinity()) return this;

	      if (this.curve.extended) return this._extAdd(p);else return this._projAdd(p);
	    };

	    Point.prototype.mul = function mul(k) {
	      if (this._hasDoubles(k)) return this.curve._fixedNafMul(this, k);else return this.curve._wnafMul(this, k);
	    };

	    Point.prototype.mulAdd = function mulAdd(k1, p, k2) {
	      return this.curve._wnafMulAdd(1, [this, p], [k1, k2], 2, false);
	    };

	    Point.prototype.jmulAdd = function jmulAdd(k1, p, k2) {
	      return this.curve._wnafMulAdd(1, [this, p], [k1, k2], 2, true);
	    };

	    Point.prototype.normalize = function normalize() {
	      if (this.zOne) return this;

	      // Normalize coordinates
	      var zi = this.z.redInvm();
	      this.x = this.x.redMul(zi);
	      this.y = this.y.redMul(zi);
	      if (this.t) this.t = this.t.redMul(zi);
	      this.z = this.curve.one;
	      this.zOne = true;
	      return this;
	    };

	    Point.prototype.neg = function neg() {
	      return this.curve.point(this.x.redNeg(), this.y, this.z, this.t && this.t.redNeg());
	    };

	    Point.prototype.getX = function getX() {
	      this.normalize();
	      return this.x.fromRed();
	    };

	    Point.prototype.getY = function getY() {
	      this.normalize();
	      return this.y.fromRed();
	    };

	    Point.prototype.eq = function eq(other) {
	      return this === other || this.getX().cmp(other.getX()) === 0 && this.getY().cmp(other.getY()) === 0;
	    };

	    Point.prototype.eqXToP = function eqXToP(x) {
	      var rx = x.toRed(this.curve.red).redMul(this.z);
	      if (this.x.cmp(rx) === 0) return true;

	      var xc = x.clone();
	      var t = this.curve.redN.redMul(this.z);
	      for (;;) {
	        xc.iadd(this.curve.n);
	        if (xc.cmp(this.curve.p) >= 0) return false;

	        rx.redIAdd(t);
	        if (this.x.cmp(rx) === 0) return true;
	      }
	    };

	    // Compatibility with BaseCurve
	    Point.prototype.toP = Point.prototype.normalize;
	    Point.prototype.mixedAdd = Point.prototype.add;

	    /***/
	  },
	  /* 22 */
	  /***/function (module, exports, __webpack_require__) {

	    var curves = exports;

	    var hash = __webpack_require__(7);
	    var elliptic = __webpack_require__(0);

	    var assert = elliptic.utils.assert;

	    function PresetCurve(options) {
	      if (options.type === 'short') this.curve = new elliptic.curve.short(options);else if (options.type === 'edwards') this.curve = new elliptic.curve.edwards(options);else this.curve = new elliptic.curve.mont(options);
	      this.g = this.curve.g;
	      this.n = this.curve.n;
	      this.hash = options.hash;

	      assert(this.g.validate(), 'Invalid curve');
	      assert(this.g.mul(this.n).isInfinity(), 'Invalid curve, G*N != O');
	    }
	    curves.PresetCurve = PresetCurve;

	    function defineCurve(name, options) {
	      _Object$defineProperty(curves, name, {
	        configurable: true,
	        enumerable: true,
	        get: function get() {
	          var curve = new PresetCurve(options);
	          _Object$defineProperty(curves, name, {
	            configurable: true,
	            enumerable: true,
	            value: curve
	          });
	          return curve;
	        }
	      });
	    }

	    defineCurve('p192', {
	      type: 'short',
	      prime: 'p192',
	      p: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff',
	      a: 'ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc',
	      b: '64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1',
	      n: 'ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831',
	      hash: hash.sha256,
	      gRed: false,
	      g: ['188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012', '07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811']
	    });

	    defineCurve('p224', {
	      type: 'short',
	      prime: 'p224',
	      p: 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001',
	      a: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe',
	      b: 'b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4',
	      n: 'ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d',
	      hash: hash.sha256,
	      gRed: false,
	      g: ['b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21', 'bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34']
	    });

	    defineCurve('p256', {
	      type: 'short',
	      prime: null,
	      p: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff',
	      a: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc',
	      b: '5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b',
	      n: 'ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551',
	      hash: hash.sha256,
	      gRed: false,
	      g: ['6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296', '4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5']
	    });

	    defineCurve('p384', {
	      type: 'short',
	      prime: null,
	      p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' + 'fffffffe ffffffff 00000000 00000000 ffffffff',
	      a: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' + 'fffffffe ffffffff 00000000 00000000 fffffffc',
	      b: 'b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f ' + '5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef',
	      n: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 ' + 'f4372ddf 581a0db2 48b0a77a ecec196a ccc52973',
	      hash: hash.sha384,
	      gRed: false,
	      g: ['aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 ' + '5502f25d bf55296c 3a545e38 72760ab7', '3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 ' + '0a60b1ce 1d7e819d 7a431d7c 90ea0e5f']
	    });

	    defineCurve('p521', {
	      type: 'short',
	      prime: null,
	      p: '000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ' + 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' + 'ffffffff ffffffff ffffffff ffffffff ffffffff',
	      a: '000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ' + 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' + 'ffffffff ffffffff ffffffff ffffffff fffffffc',
	      b: '00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b ' + '99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd ' + '3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00',
	      n: '000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ' + 'ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 ' + 'f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409',
	      hash: hash.sha512,
	      gRed: false,
	      g: ['000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 ' + '053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 ' + 'a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66', '00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 ' + '579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 ' + '3fad0761 353c7086 a272c240 88be9476 9fd16650']
	    });

	    defineCurve('curve25519', {
	      type: 'mont',
	      prime: 'p25519',
	      p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
	      a: '76d06',
	      b: '1',
	      n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
	      hash: hash.sha256,
	      gRed: false,
	      g: ['9']
	    });

	    defineCurve('ed25519', {
	      type: 'edwards',
	      prime: 'p25519',
	      p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
	      a: '-1',
	      c: '1',
	      // -121665 * (121666^(-1)) (mod P)
	      d: '52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3',
	      n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
	      hash: hash.sha256,
	      gRed: false,
	      g: ['216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a',

	      // 4/5
	      '6666666666666666666666666666666666666666666666666666666666666658']
	    });

	    var pre;
	    try {
	      pre = __webpack_require__(29);
	    } catch (e) {
	      pre = undefined;
	    }

	    defineCurve('secp256k1', {
	      type: 'short',
	      prime: 'k256',
	      p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f',
	      a: '0',
	      b: '7',
	      n: 'ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141',
	      h: '1',
	      hash: hash.sha256,

	      // Precomputed endomorphism
	      beta: '7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee',
	      lambda: '5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72',
	      basis: [{
	        a: '3086d221a7d46bcde86c90e49284eb15',
	        b: '-e4437ed6010e88286f547fa90abfe4c3'
	      }, {
	        a: '114ca50f7a8e2f3f657c1108d9d44cfd8',
	        b: '3086d221a7d46bcde86c90e49284eb15'
	      }],

	      gRed: false,
	      g: ['79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8', pre]
	    });

	    /***/
	  },
	  /* 23 */
	  /***/function (module, exports, __webpack_require__) {

	    exports.sha1 = __webpack_require__(24);
	    exports.sha224 = __webpack_require__(25);
	    exports.sha256 = __webpack_require__(10);
	    exports.sha384 = __webpack_require__(26);
	    exports.sha512 = __webpack_require__(11);

	    /***/
	  },
	  /* 24 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = __webpack_require__(1);
	    var common = __webpack_require__(4);
	    var shaCommon = __webpack_require__(9);

	    var rotl32 = utils.rotl32;
	    var sum32 = utils.sum32;
	    var sum32_5 = utils.sum32_5;
	    var ft_1 = shaCommon.ft_1;
	    var BlockHash = common.BlockHash;

	    var sha1_K = [0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6];

	    function SHA1() {
	      if (!(this instanceof SHA1)) return new SHA1();

	      BlockHash.call(this);
	      this.h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
	      this.W = new Array(80);
	    }

	    utils.inherits(SHA1, BlockHash);
	    module.exports = SHA1;

	    SHA1.blockSize = 512;
	    SHA1.outSize = 160;
	    SHA1.hmacStrength = 80;
	    SHA1.padLength = 64;

	    SHA1.prototype._update = function _update(msg, start) {
	      var W = this.W;

	      for (var i = 0; i < 16; i++) {
	        W[i] = msg[start + i];
	      }for (; i < W.length; i++) {
	        W[i] = rotl32(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
	      }var a = this.h[0];
	      var b = this.h[1];
	      var c = this.h[2];
	      var d = this.h[3];
	      var e = this.h[4];

	      for (i = 0; i < W.length; i++) {
	        var s = ~~(i / 20);
	        var t = sum32_5(rotl32(a, 5), ft_1(s, b, c, d), e, W[i], sha1_K[s]);
	        e = d;
	        d = c;
	        c = rotl32(b, 30);
	        b = a;
	        a = t;
	      }

	      this.h[0] = sum32(this.h[0], a);
	      this.h[1] = sum32(this.h[1], b);
	      this.h[2] = sum32(this.h[2], c);
	      this.h[3] = sum32(this.h[3], d);
	      this.h[4] = sum32(this.h[4], e);
	    };

	    SHA1.prototype._digest = function digest(enc) {
	      if (enc === 'hex') return utils.toHex32(this.h, 'big');else return utils.split32(this.h, 'big');
	    };

	    /***/
	  },
	  /* 25 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = __webpack_require__(1);
	    var SHA256 = __webpack_require__(10);

	    function SHA224() {
	      if (!(this instanceof SHA224)) return new SHA224();

	      SHA256.call(this);
	      this.h = [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4];
	    }
	    utils.inherits(SHA224, SHA256);
	    module.exports = SHA224;

	    SHA224.blockSize = 512;
	    SHA224.outSize = 224;
	    SHA224.hmacStrength = 192;
	    SHA224.padLength = 64;

	    SHA224.prototype._digest = function digest(enc) {
	      // Just truncate output
	      if (enc === 'hex') return utils.toHex32(this.h.slice(0, 7), 'big');else return utils.split32(this.h.slice(0, 7), 'big');
	    };

	    /***/
	  },
	  /* 26 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = __webpack_require__(1);

	    var SHA512 = __webpack_require__(11);

	    function SHA384() {
	      if (!(this instanceof SHA384)) return new SHA384();

	      SHA512.call(this);
	      this.h = [0xcbbb9d5d, 0xc1059ed8, 0x629a292a, 0x367cd507, 0x9159015a, 0x3070dd17, 0x152fecd8, 0xf70e5939, 0x67332667, 0xffc00b31, 0x8eb44a87, 0x68581511, 0xdb0c2e0d, 0x64f98fa7, 0x47b5481d, 0xbefa4fa4];
	    }
	    utils.inherits(SHA384, SHA512);
	    module.exports = SHA384;

	    SHA384.blockSize = 1024;
	    SHA384.outSize = 384;
	    SHA384.hmacStrength = 192;
	    SHA384.padLength = 128;

	    SHA384.prototype._digest = function digest(enc) {
	      if (enc === 'hex') return utils.toHex32(this.h.slice(0, 12), 'big');else return utils.split32(this.h.slice(0, 12), 'big');
	    };

	    /***/
	  },
	  /* 27 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = __webpack_require__(1);
	    var common = __webpack_require__(4);

	    var rotl32 = utils.rotl32;
	    var sum32 = utils.sum32;
	    var sum32_3 = utils.sum32_3;
	    var sum32_4 = utils.sum32_4;
	    var BlockHash = common.BlockHash;

	    function RIPEMD160() {
	      if (!(this instanceof RIPEMD160)) return new RIPEMD160();

	      BlockHash.call(this);

	      this.h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
	      this.endian = 'little';
	    }
	    utils.inherits(RIPEMD160, BlockHash);
	    exports.ripemd160 = RIPEMD160;

	    RIPEMD160.blockSize = 512;
	    RIPEMD160.outSize = 160;
	    RIPEMD160.hmacStrength = 192;
	    RIPEMD160.padLength = 64;

	    RIPEMD160.prototype._update = function update(msg, start) {
	      var A = this.h[0];
	      var B = this.h[1];
	      var C = this.h[2];
	      var D = this.h[3];
	      var E = this.h[4];
	      var Ah = A;
	      var Bh = B;
	      var Ch = C;
	      var Dh = D;
	      var Eh = E;
	      for (var j = 0; j < 80; j++) {
	        var T = sum32(rotl32(sum32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)), s[j]), E);
	        A = E;
	        E = D;
	        D = rotl32(C, 10);
	        C = B;
	        B = T;
	        T = sum32(rotl32(sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)), sh[j]), Eh);
	        Ah = Eh;
	        Eh = Dh;
	        Dh = rotl32(Ch, 10);
	        Ch = Bh;
	        Bh = T;
	      }
	      T = sum32_3(this.h[1], C, Dh);
	      this.h[1] = sum32_3(this.h[2], D, Eh);
	      this.h[2] = sum32_3(this.h[3], E, Ah);
	      this.h[3] = sum32_3(this.h[4], A, Bh);
	      this.h[4] = sum32_3(this.h[0], B, Ch);
	      this.h[0] = T;
	    };

	    RIPEMD160.prototype._digest = function digest(enc) {
	      if (enc === 'hex') return utils.toHex32(this.h, 'little');else return utils.split32(this.h, 'little');
	    };

	    function f(j, x, y, z) {
	      if (j <= 15) return x ^ y ^ z;else if (j <= 31) return x & y | ~x & z;else if (j <= 47) return (x | ~y) ^ z;else if (j <= 63) return x & z | y & ~z;else return x ^ (y | ~z);
	    }

	    function K(j) {
	      if (j <= 15) return 0x00000000;else if (j <= 31) return 0x5a827999;else if (j <= 47) return 0x6ed9eba1;else if (j <= 63) return 0x8f1bbcdc;else return 0xa953fd4e;
	    }

	    function Kh(j) {
	      if (j <= 15) return 0x50a28be6;else if (j <= 31) return 0x5c4dd124;else if (j <= 47) return 0x6d703ef3;else if (j <= 63) return 0x7a6d76e9;else return 0x00000000;
	    }

	    var r = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13];

	    var rh = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11];

	    var s = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6];

	    var sh = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];

	    /***/
	  },
	  /* 28 */
	  /***/function (module, exports, __webpack_require__) {

	    var utils = __webpack_require__(1);
	    var assert = __webpack_require__(3);

	    function Hmac(hash, key, enc) {
	      if (!(this instanceof Hmac)) return new Hmac(hash, key, enc);
	      this.Hash = hash;
	      this.blockSize = hash.blockSize / 8;
	      this.outSize = hash.outSize / 8;
	      this.inner = null;
	      this.outer = null;

	      this._init(utils.toArray(key, enc));
	    }
	    module.exports = Hmac;

	    Hmac.prototype._init = function init(key) {
	      // Shorten key, if needed
	      if (key.length > this.blockSize) key = new this.Hash().update(key).digest();
	      assert(key.length <= this.blockSize);

	      // Add padding to key
	      for (var i = key.length; i < this.blockSize; i++) {
	        key.push(0);
	      }for (i = 0; i < key.length; i++) {
	        key[i] ^= 0x36;
	      }this.inner = new this.Hash().update(key);

	      // 0x36 ^ 0x5c = 0x6a
	      for (i = 0; i < key.length; i++) {
	        key[i] ^= 0x6a;
	      }this.outer = new this.Hash().update(key);
	    };

	    Hmac.prototype.update = function update(msg, enc) {
	      this.inner.update(msg, enc);
	      return this;
	    };

	    Hmac.prototype.digest = function digest(enc) {
	      this.outer.update(this.inner.digest());
	      return this.outer.digest(enc);
	    };

	    /***/
	  },
	  /* 29 */
	  /***/function (module, exports) {

	    module.exports = {
	      doubles: {
	        step: 4,
	        points: [['e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a', 'f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821'], ['8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508', '11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf'], ['175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739', 'd3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695'], ['363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640', '4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9'], ['8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c', '4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36'], ['723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda', '96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f'], ['eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa', '5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999'], ['100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0', 'cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09'], ['e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d', '9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d'], ['feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d', 'e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088'], ['da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1', '9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d'], ['53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0', '5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8'], ['8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047', '10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a'], ['385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862', '283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453'], ['6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7', '7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160'], ['3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd', '56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0'], ['85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83', '7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6'], ['948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a', '53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589'], ['6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8', 'bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17'], ['e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d', '4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda'], ['e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725', '7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd'], ['213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754', '4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2'], ['4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c', '17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6'], ['fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6', '6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f'], ['76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39', 'c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01'], ['c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891', '893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3'], ['d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b', 'febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f'], ['b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03', '2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7'], ['e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d', 'eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78'], ['a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070', '7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1'], ['90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4', 'e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150'], ['8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da', '662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82'], ['e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11', '1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc'], ['8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e', 'efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b'], ['e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41', '2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51'], ['b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef', '67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45'], ['d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8', 'db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120'], ['324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d', '648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84'], ['4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96', '35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d'], ['9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd', 'ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d'], ['6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5', '9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8'], ['a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266', '40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8'], ['7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71', '34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac'], ['928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac', 'c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f'], ['85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751', '1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962'], ['ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e', '493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907'], ['827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241', 'c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec'], ['eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3', 'be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d'], ['e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f', '4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414'], ['1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19', 'aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd'], ['146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be', 'b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0'], ['fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9', '6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811'], ['da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2', '8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1'], ['a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13', '7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c'], ['174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c', 'ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73'], ['959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba', '2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd'], ['d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151', 'e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405'], ['64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073', 'd99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589'], ['8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458', '38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e'], ['13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b', '69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27'], ['bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366', 'd3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1'], ['8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa', '40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482'], ['8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0', '620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945'], ['dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787', '7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573'], ['f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e', 'ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82']]
	      },
	      naf: {
	        wnd: 7,
	        points: [['f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9', '388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672'], ['2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4', 'd8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6'], ['5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc', '6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da'], ['acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe', 'cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37'], ['774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb', 'd984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b'], ['f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8', 'ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81'], ['d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e', '581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58'], ['defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34', '4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77'], ['2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c', '85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a'], ['352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5', '321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c'], ['2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f', '2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67'], ['9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714', '73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402'], ['daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729', 'a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55'], ['c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db', '2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482'], ['6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4', 'e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82'], ['1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5', 'b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396'], ['605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479', '2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49'], ['62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d', '80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf'], ['80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f', '1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a'], ['7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb', 'd0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7'], ['d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9', 'eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933'], ['49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963', '758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a'], ['77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74', '958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6'], ['f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530', 'e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37'], ['463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b', '5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e'], ['f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247', 'cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6'], ['caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1', 'cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476'], ['2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120', '4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40'], ['7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435', '91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61'], ['754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18', '673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683'], ['e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8', '59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5'], ['186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb', '3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b'], ['df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f', '55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417'], ['5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143', 'efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868'], ['290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba', 'e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a'], ['af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45', 'f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6'], ['766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a', '744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996'], ['59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e', 'c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e'], ['f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8', 'e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d'], ['7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c', '30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2'], ['948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519', 'e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e'], ['7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab', '100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437'], ['3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca', 'ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311'], ['d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf', '8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4'], ['1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610', '68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575'], ['733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4', 'f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d'], ['15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c', 'd56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d'], ['a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940', 'edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629'], ['e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980', 'a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06'], ['311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3', '66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374'], ['34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf', '9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee'], ['f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63', '4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1'], ['d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448', 'fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b'], ['32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf', '5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661'], ['7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5', '8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6'], ['ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6', '8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e'], ['16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5', '5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d'], ['eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99', 'f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc'], ['78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51', 'f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4'], ['494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5', '42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c'], ['a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5', '204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b'], ['c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997', '4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913'], ['841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881', '73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154'], ['5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5', '39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865'], ['36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66', 'd2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc'], ['336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726', 'ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224'], ['8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede', '6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e'], ['1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94', '60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6'], ['85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31', '3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511'], ['29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51', 'b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b'], ['a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252', 'ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2'], ['4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5', 'cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c'], ['d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b', '6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3'], ['ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4', '322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d'], ['af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f', '6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700'], ['e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889', '2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4'], ['591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246', 'b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196'], ['11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984', '998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4'], ['3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a', 'b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257'], ['cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030', 'bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13'], ['c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197', '6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096'], ['c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593', 'c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38'], ['a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef', '21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f'], ['347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38', '60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448'], ['da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a', '49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a'], ['c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111', '5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4'], ['4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502', '7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437'], ['3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea', 'be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7'], ['cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26', '8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d'], ['b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986', '39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a'], ['d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e', '62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54'], ['48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4', '25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77'], ['dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda', 'ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517'], ['6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859', 'cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10'], ['e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f', 'f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125'], ['eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c', '6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e'], ['13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942', 'fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1'], ['ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a', '1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2'], ['b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80', '5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423'], ['ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d', '438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8'], ['8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1', 'cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758'], ['52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63', 'c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375'], ['e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352', '6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d'], ['7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193', 'ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec'], ['5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00', '9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0'], ['32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58', 'ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c'], ['e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7', 'd3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4'], ['8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8', 'c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f'], ['4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e', '67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649'], ['3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d', 'cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826'], ['674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b', '299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5'], ['d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f', 'f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87'], ['30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6', '462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b'], ['be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297', '62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc'], ['93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a', '7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c'], ['b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c', 'ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f'], ['d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52', '4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a'], ['d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb', 'bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46'], ['463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065', 'bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f'], ['7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917', '603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03'], ['74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9', 'cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08'], ['30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3', '553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8'], ['9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57', '712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373'], ['176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66', 'ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3'], ['75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8', '9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8'], ['809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721', '9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1'], ['1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180', '4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9']]
	      }
	    };

	    /***/
	  },
	  /* 30 */
	  /***/function (module, exports, __webpack_require__) {

	    var BN = __webpack_require__(2);
	    var HmacDRBG = __webpack_require__(31);
	    var elliptic = __webpack_require__(0);
	    var utils = elliptic.utils;
	    var assert = utils.assert;

	    var KeyPair = __webpack_require__(32);
	    var Signature = __webpack_require__(33);

	    function EC(options) {
	      if (!(this instanceof EC)) return new EC(options);

	      // Shortcut `elliptic.ec(curve-name)`
	      if (typeof options === 'string') {
	        assert(elliptic.curves.hasOwnProperty(options), 'Unknown curve ' + options);

	        options = elliptic.curves[options];
	      }

	      // Shortcut for `elliptic.ec(elliptic.curves.curveName)`
	      if (options instanceof elliptic.curves.PresetCurve) options = { curve: options };

	      this.curve = options.curve.curve;
	      this.n = this.curve.n;
	      this.nh = this.n.ushrn(1);
	      this.g = this.curve.g;

	      // Point on curve
	      this.g = options.curve.g;
	      this.g.precompute(options.curve.n.bitLength() + 1);

	      // Hash for function for DRBG
	      this.hash = options.hash || options.curve.hash;
	    }
	    module.exports = EC;

	    EC.prototype.keyPair = function keyPair(options) {
	      return new KeyPair(this, options);
	    };

	    EC.prototype.keyFromPrivate = function keyFromPrivate(priv, enc) {
	      return KeyPair.fromPrivate(this, priv, enc);
	    };

	    EC.prototype.keyFromPublic = function keyFromPublic(pub, enc) {
	      return KeyPair.fromPublic(this, pub, enc);
	    };

	    EC.prototype.genKeyPair = function genKeyPair(options) {
	      if (!options) options = {};

	      // Instantiate Hmac_DRBG
	      var drbg = new HmacDRBG({
	        hash: this.hash,
	        pers: options.pers,
	        persEnc: options.persEnc || 'utf8',
	        entropy: options.entropy || elliptic.rand(this.hash.hmacStrength),
	        entropyEnc: options.entropy && options.entropyEnc || 'utf8',
	        nonce: this.n.toArray()
	      });

	      var bytes = this.n.byteLength();
	      var ns2 = this.n.sub(new BN(2));
	      do {
	        var priv = new BN(drbg.generate(bytes));
	        if (priv.cmp(ns2) > 0) continue;

	        priv.iaddn(1);
	        return this.keyFromPrivate(priv);
	      } while (true);
	    };

	    EC.prototype._truncateToN = function truncateToN(msg, truncOnly) {
	      var delta = msg.byteLength() * 8 - this.n.bitLength();
	      if (delta > 0) msg = msg.ushrn(delta);
	      if (!truncOnly && msg.cmp(this.n) >= 0) return msg.sub(this.n);else return msg;
	    };

	    EC.prototype.sign = function sign(msg, key, enc, options) {
	      if ((typeof enc === 'undefined' ? 'undefined' : _typeof(enc)) === 'object') {
	        options = enc;
	        enc = null;
	      }
	      if (!options) options = {};

	      key = this.keyFromPrivate(key, enc);
	      msg = this._truncateToN(new BN(msg, 16));

	      // Zero-extend key to provide enough entropy
	      var bytes = this.n.byteLength();
	      var bkey = key.getPrivate().toArray('be', bytes);

	      // Zero-extend nonce to have the same byte size as N
	      var nonce = msg.toArray('be', bytes);

	      // Instantiate Hmac_DRBG
	      var drbg = new HmacDRBG({
	        hash: this.hash,
	        entropy: bkey,
	        nonce: nonce,
	        pers: options.pers,
	        persEnc: options.persEnc || 'utf8'
	      });

	      // Number of bytes to generate
	      var ns1 = this.n.sub(new BN(1));

	      for (var iter = 0; true; iter++) {
	        var k = options.k ? options.k(iter) : new BN(drbg.generate(this.n.byteLength()));
	        k = this._truncateToN(k, true);
	        if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0) continue;

	        var kp = this.g.mul(k);
	        if (kp.isInfinity()) continue;

	        var kpX = kp.getX();
	        var r = kpX.umod(this.n);
	        if (r.cmpn(0) === 0) continue;

	        var s = k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg));
	        s = s.umod(this.n);
	        if (s.cmpn(0) === 0) continue;

	        var recoveryParam = (kp.getY().isOdd() ? 1 : 0) | (kpX.cmp(r) !== 0 ? 2 : 0);

	        // Use complement of `s`, if it is > `n / 2`
	        if (options.canonical && s.cmp(this.nh) > 0) {
	          s = this.n.sub(s);
	          recoveryParam ^= 1;
	        }

	        return new Signature({ r: r, s: s, recoveryParam: recoveryParam });
	      }
	    };

	    EC.prototype.verify = function verify(msg, signature, key, enc) {
	      msg = this._truncateToN(new BN(msg, 16));
	      key = this.keyFromPublic(key, enc);
	      signature = new Signature(signature, 'hex');

	      // Perform primitive values validation
	      var r = signature.r;
	      var s = signature.s;
	      if (r.cmpn(1) < 0 || r.cmp(this.n) >= 0) return false;
	      if (s.cmpn(1) < 0 || s.cmp(this.n) >= 0) return false;

	      // Validate signature
	      var sinv = s.invm(this.n);
	      var u1 = sinv.mul(msg).umod(this.n);
	      var u2 = sinv.mul(r).umod(this.n);

	      if (!this.curve._maxwellTrick) {
	        var p = this.g.mulAdd(u1, key.getPublic(), u2);
	        if (p.isInfinity()) return false;

	        return p.getX().umod(this.n).cmp(r) === 0;
	      }

	      // NOTE: Greg Maxwell's trick, inspired by:
	      // https://git.io/vad3K

	      var p = this.g.jmulAdd(u1, key.getPublic(), u2);
	      if (p.isInfinity()) return false;

	      // Compare `p.x` of Jacobian point with `r`,
	      // this will do `p.x == r * p.z^2` instead of multiplying `p.x` by the
	      // inverse of `p.z^2`
	      return p.eqXToP(r);
	    };

	    EC.prototype.recoverPubKey = function (msg, signature, j, enc) {
	      assert((3 & j) === j, 'The recovery param is more than two bits');
	      signature = new Signature(signature, enc);

	      var n = this.n;
	      var e = new BN(msg);
	      var r = signature.r;
	      var s = signature.s;

	      // A set LSB signifies that the y-coordinate is odd
	      var isYOdd = j & 1;
	      var isSecondKey = j >> 1;
	      if (r.cmp(this.curve.p.umod(this.curve.n)) >= 0 && isSecondKey) throw new Error('Unable to find sencond key candinate');

	      // 1.1. Let x = r + jn.
	      if (isSecondKey) r = this.curve.pointFromX(r.add(this.curve.n), isYOdd);else r = this.curve.pointFromX(r, isYOdd);

	      var rInv = signature.r.invm(n);
	      var s1 = n.sub(e).mul(rInv).umod(n);
	      var s2 = s.mul(rInv).umod(n);

	      // 1.6.1 Compute Q = r^-1 (sR -  eG)
	      //               Q = r^-1 (sR + -eG)
	      return this.g.mulAdd(s1, r, s2);
	    };

	    EC.prototype.getKeyRecoveryParam = function (e, signature, Q, enc) {
	      signature = new Signature(signature, enc);
	      if (signature.recoveryParam !== null) return signature.recoveryParam;

	      for (var i = 0; i < 4; i++) {
	        var Qprime;
	        try {
	          Qprime = this.recoverPubKey(e, signature, i);
	        } catch (e) {
	          continue;
	        }

	        if (Qprime.eq(Q)) return i;
	      }
	      throw new Error('Unable to find valid recovery factor');
	    };

	    /***/
	  },
	  /* 31 */
	  /***/function (module, exports, __webpack_require__) {

	    var hash = __webpack_require__(7);
	    var utils = __webpack_require__(8);
	    var assert = __webpack_require__(3);

	    function HmacDRBG(options) {
	      if (!(this instanceof HmacDRBG)) return new HmacDRBG(options);
	      this.hash = options.hash;
	      this.predResist = !!options.predResist;

	      this.outLen = this.hash.outSize;
	      this.minEntropy = options.minEntropy || this.hash.hmacStrength;

	      this._reseed = null;
	      this.reseedInterval = null;
	      this.K = null;
	      this.V = null;

	      var entropy = utils.toArray(options.entropy, options.entropyEnc || 'hex');
	      var nonce = utils.toArray(options.nonce, options.nonceEnc || 'hex');
	      var pers = utils.toArray(options.pers, options.persEnc || 'hex');
	      assert(entropy.length >= this.minEntropy / 8, 'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');
	      this._init(entropy, nonce, pers);
	    }
	    module.exports = HmacDRBG;

	    HmacDRBG.prototype._init = function init(entropy, nonce, pers) {
	      var seed = entropy.concat(nonce).concat(pers);

	      this.K = new Array(this.outLen / 8);
	      this.V = new Array(this.outLen / 8);
	      for (var i = 0; i < this.V.length; i++) {
	        this.K[i] = 0x00;
	        this.V[i] = 0x01;
	      }

	      this._update(seed);
	      this._reseed = 1;
	      this.reseedInterval = 0x1000000000000; // 2^48
	    };

	    HmacDRBG.prototype._hmac = function hmac() {
	      return new hash.hmac(this.hash, this.K);
	    };

	    HmacDRBG.prototype._update = function update(seed) {
	      var kmac = this._hmac().update(this.V).update([0x00]);
	      if (seed) kmac = kmac.update(seed);
	      this.K = kmac.digest();
	      this.V = this._hmac().update(this.V).digest();
	      if (!seed) return;

	      this.K = this._hmac().update(this.V).update([0x01]).update(seed).digest();
	      this.V = this._hmac().update(this.V).digest();
	    };

	    HmacDRBG.prototype.reseed = function reseed(entropy, entropyEnc, add, addEnc) {
	      // Optional entropy enc
	      if (typeof entropyEnc !== 'string') {
	        addEnc = add;
	        add = entropyEnc;
	        entropyEnc = null;
	      }

	      entropy = utils.toArray(entropy, entropyEnc);
	      add = utils.toArray(add, addEnc);

	      assert(entropy.length >= this.minEntropy / 8, 'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');

	      this._update(entropy.concat(add || []));
	      this._reseed = 1;
	    };

	    HmacDRBG.prototype.generate = function generate(len, enc, add, addEnc) {
	      if (this._reseed > this.reseedInterval) throw new Error('Reseed is required');

	      // Optional encoding
	      if (typeof enc !== 'string') {
	        addEnc = add;
	        add = enc;
	        enc = null;
	      }

	      // Optional additional data
	      if (add) {
	        add = utils.toArray(add, addEnc || 'hex');
	        this._update(add);
	      }

	      var temp = [];
	      while (temp.length < len) {
	        this.V = this._hmac().update(this.V).digest();
	        temp = temp.concat(this.V);
	      }

	      var res = temp.slice(0, len);
	      this._update(add);
	      this._reseed++;
	      return utils.encode(res, enc);
	    };

	    /***/
	  },
	  /* 32 */
	  /***/function (module, exports, __webpack_require__) {

	    var BN = __webpack_require__(2);
	    var elliptic = __webpack_require__(0);
	    var utils = elliptic.utils;
	    var assert = utils.assert;

	    function KeyPair(ec, options) {
	      this.ec = ec;
	      this.priv = null;
	      this.pub = null;

	      // KeyPair(ec, { priv: ..., pub: ... })
	      if (options.priv) this._importPrivate(options.priv, options.privEnc);
	      if (options.pub) this._importPublic(options.pub, options.pubEnc);
	    }
	    module.exports = KeyPair;

	    KeyPair.fromPublic = function fromPublic(ec, pub, enc) {
	      if (pub instanceof KeyPair) return pub;

	      return new KeyPair(ec, {
	        pub: pub,
	        pubEnc: enc
	      });
	    };

	    KeyPair.fromPrivate = function fromPrivate(ec, priv, enc) {
	      if (priv instanceof KeyPair) return priv;

	      return new KeyPair(ec, {
	        priv: priv,
	        privEnc: enc
	      });
	    };

	    KeyPair.prototype.validate = function validate() {
	      var pub = this.getPublic();

	      if (pub.isInfinity()) return { result: false, reason: 'Invalid public key' };
	      if (!pub.validate()) return { result: false, reason: 'Public key is not a point' };
	      if (!pub.mul(this.ec.curve.n).isInfinity()) return { result: false, reason: 'Public key * N != O' };

	      return { result: true, reason: null };
	    };

	    KeyPair.prototype.getPublic = function getPublic(compact, enc) {
	      // compact is optional argument
	      if (typeof compact === 'string') {
	        enc = compact;
	        compact = null;
	      }

	      if (!this.pub) this.pub = this.ec.g.mul(this.priv);

	      if (!enc) return this.pub;

	      return this.pub.encode(enc, compact);
	    };

	    KeyPair.prototype.getPrivate = function getPrivate(enc) {
	      if (enc === 'hex') return this.priv.toString(16, 2);else return this.priv;
	    };

	    KeyPair.prototype._importPrivate = function _importPrivate(key, enc) {
	      this.priv = new BN(key, enc || 16);

	      // Ensure that the priv won't be bigger than n, otherwise we may fail
	      // in fixed multiplication method
	      this.priv = this.priv.umod(this.ec.curve.n);
	    };

	    KeyPair.prototype._importPublic = function _importPublic(key, enc) {
	      if (key.x || key.y) {
	        // Montgomery points only have an `x` coordinate.
	        // Weierstrass/Edwards points on the other hand have both `x` and
	        // `y` coordinates.
	        if (this.ec.curve.type === 'mont') {
	          assert(key.x, 'Need x coordinate');
	        } else if (this.ec.curve.type === 'short' || this.ec.curve.type === 'edwards') {
	          assert(key.x && key.y, 'Need both x and y coordinate');
	        }
	        this.pub = this.ec.curve.point(key.x, key.y);
	        return;
	      }
	      this.pub = this.ec.curve.decodePoint(key, enc);
	    };

	    // ECDH
	    KeyPair.prototype.derive = function derive(pub) {
	      return pub.mul(this.priv).getX();
	    };

	    // ECDSA
	    KeyPair.prototype.sign = function sign(msg, enc, options) {
	      return this.ec.sign(msg, this, enc, options);
	    };

	    KeyPair.prototype.verify = function verify(msg, signature) {
	      return this.ec.verify(msg, signature, this);
	    };

	    KeyPair.prototype.inspect = function inspect() {
	      return '<Key priv: ' + (this.priv && this.priv.toString(16, 2)) + ' pub: ' + (this.pub && this.pub.inspect()) + ' >';
	    };

	    /***/
	  },
	  /* 33 */
	  /***/function (module, exports, __webpack_require__) {

	    var BN = __webpack_require__(2);

	    var elliptic = __webpack_require__(0);
	    var utils = elliptic.utils;
	    var assert = utils.assert;

	    function Signature(options, enc) {
	      if (options instanceof Signature) return options;

	      if (this._importDER(options, enc)) return;

	      assert(options.r && options.s, 'Signature without r or s');
	      this.r = new BN(options.r, 16);
	      this.s = new BN(options.s, 16);
	      if (options.recoveryParam === undefined) this.recoveryParam = null;else this.recoveryParam = options.recoveryParam;
	    }
	    module.exports = Signature;

	    function Position() {
	      this.place = 0;
	    }

	    function getLength(buf, p) {
	      var initial = buf[p.place++];
	      if (!(initial & 0x80)) {
	        return initial;
	      }
	      var octetLen = initial & 0xf;
	      var val = 0;
	      for (var i = 0, off = p.place; i < octetLen; i++, off++) {
	        val <<= 8;
	        val |= buf[off];
	      }
	      p.place = off;
	      return val;
	    }

	    function rmPadding(buf) {
	      var i = 0;
	      var len = buf.length - 1;
	      while (!buf[i] && !(buf[i + 1] & 0x80) && i < len) {
	        i++;
	      }
	      if (i === 0) {
	        return buf;
	      }
	      return buf.slice(i);
	    }

	    Signature.prototype._importDER = function _importDER(data, enc) {
	      data = utils.toArray(data, enc);
	      var p = new Position();
	      if (data[p.place++] !== 0x30) {
	        return false;
	      }
	      var len = getLength(data, p);
	      if (len + p.place !== data.length) {
	        return false;
	      }
	      if (data[p.place++] !== 0x02) {
	        return false;
	      }
	      var rlen = getLength(data, p);
	      var r = data.slice(p.place, rlen + p.place);
	      p.place += rlen;
	      if (data[p.place++] !== 0x02) {
	        return false;
	      }
	      var slen = getLength(data, p);
	      if (data.length !== slen + p.place) {
	        return false;
	      }
	      var s = data.slice(p.place, slen + p.place);
	      if (r[0] === 0 && r[1] & 0x80) {
	        r = r.slice(1);
	      }
	      if (s[0] === 0 && s[1] & 0x80) {
	        s = s.slice(1);
	      }

	      this.r = new BN(r);
	      this.s = new BN(s);
	      this.recoveryParam = null;

	      return true;
	    };

	    function constructLength(arr, len) {
	      if (len < 0x80) {
	        arr.push(len);
	        return;
	      }
	      var octets = 1 + (Math.log(len) / Math.LN2 >>> 3);
	      arr.push(octets | 0x80);
	      while (--octets) {
	        arr.push(len >>> (octets << 3) & 0xff);
	      }
	      arr.push(len);
	    }

	    Signature.prototype.toDER = function toDER(enc) {
	      var r = this.r.toArray();
	      var s = this.s.toArray();

	      // Pad values
	      if (r[0] & 0x80) r = [0].concat(r);
	      // Pad values
	      if (s[0] & 0x80) s = [0].concat(s);

	      r = rmPadding(r);
	      s = rmPadding(s);

	      while (!s[0] && !(s[1] & 0x80)) {
	        s = s.slice(1);
	      }
	      var arr = [0x02];
	      constructLength(arr, r.length);
	      arr = arr.concat(r);
	      arr.push(0x02);
	      constructLength(arr, s.length);
	      var backHalf = arr.concat(s);
	      var res = [0x30];
	      constructLength(res, backHalf.length);
	      res = res.concat(backHalf);
	      return utils.encode(res, enc);
	    };

	    /***/
	  },
	  /* 34 */
	  /***/function (module, exports, __webpack_require__) {

	    var hash = __webpack_require__(7);
	    var elliptic = __webpack_require__(0);
	    var utils = elliptic.utils;
	    var assert = utils.assert;
	    var parseBytes = utils.parseBytes;
	    var KeyPair = __webpack_require__(35);
	    var Signature = __webpack_require__(36);

	    function EDDSA(curve) {
	      assert(curve === 'ed25519', 'only tested with ed25519 so far');

	      if (!(this instanceof EDDSA)) return new EDDSA(curve);

	      var curve = elliptic.curves[curve].curve;
	      this.curve = curve;
	      this.g = curve.g;
	      this.g.precompute(curve.n.bitLength() + 1);

	      this.pointClass = curve.point().constructor;
	      this.encodingLength = Math.ceil(curve.n.bitLength() / 8);
	      this.hash = hash.sha512;
	    }

	    module.exports = EDDSA;

	    /**
	    * @param {Array|String} message - message bytes
	    * @param {Array|String|KeyPair} secret - secret bytes or a keypair
	    * @returns {Signature} - signature
	    */
	    EDDSA.prototype.sign = function sign(message, secret) {
	      message = parseBytes(message);
	      var key = this.keyFromSecret(secret);
	      var r = this.hashInt(key.messagePrefix(), message);
	      var R = this.g.mul(r);
	      var Rencoded = this.encodePoint(R);
	      var s_ = this.hashInt(Rencoded, key.pubBytes(), message).mul(key.priv());
	      var S = r.add(s_).umod(this.curve.n);
	      return this.makeSignature({ R: R, S: S, Rencoded: Rencoded });
	    };

	    /**
	    * @param {Array} message - message bytes
	    * @param {Array|String|Signature} sig - sig bytes
	    * @param {Array|String|Point|KeyPair} pub - public key
	    * @returns {Boolean} - true if public key matches sig of message
	    */
	    EDDSA.prototype.verify = function verify(message, sig, pub) {
	      message = parseBytes(message);
	      sig = this.makeSignature(sig);
	      var key = this.keyFromPublic(pub);
	      var h = this.hashInt(sig.Rencoded(), key.pubBytes(), message);
	      var SG = this.g.mul(sig.S());
	      var RplusAh = sig.R().add(key.pub().mul(h));
	      return RplusAh.eq(SG);
	    };

	    EDDSA.prototype.hashInt = function hashInt() {
	      var hash = this.hash();
	      for (var i = 0; i < arguments.length; i++) {
	        hash.update(arguments[i]);
	      }return utils.intFromLE(hash.digest()).umod(this.curve.n);
	    };

	    EDDSA.prototype.keyFromPublic = function keyFromPublic(pub) {
	      return KeyPair.fromPublic(this, pub);
	    };

	    EDDSA.prototype.keyFromSecret = function keyFromSecret(secret) {
	      return KeyPair.fromSecret(this, secret);
	    };

	    EDDSA.prototype.makeSignature = function makeSignature(sig) {
	      if (sig instanceof Signature) return sig;
	      return new Signature(this, sig);
	    };

	    /**
	    * * https://tools.ietf.org/html/draft-josefsson-eddsa-ed25519-03#section-5.2
	    *
	    * EDDSA defines methods for encoding and decoding points and integers. These are
	    * helper convenience methods, that pass along to utility functions implied
	    * parameters.
	    *
	    */
	    EDDSA.prototype.encodePoint = function encodePoint(point) {
	      var enc = point.getY().toArray('le', this.encodingLength);
	      enc[this.encodingLength - 1] |= point.getX().isOdd() ? 0x80 : 0;
	      return enc;
	    };

	    EDDSA.prototype.decodePoint = function decodePoint(bytes) {
	      bytes = utils.parseBytes(bytes);

	      var lastIx = bytes.length - 1;
	      var normed = bytes.slice(0, lastIx).concat(bytes[lastIx] & ~0x80);
	      var xIsOdd = (bytes[lastIx] & 0x80) !== 0;

	      var y = utils.intFromLE(normed);
	      return this.curve.pointFromY(y, xIsOdd);
	    };

	    EDDSA.prototype.encodeInt = function encodeInt(num) {
	      return num.toArray('le', this.encodingLength);
	    };

	    EDDSA.prototype.decodeInt = function decodeInt(bytes) {
	      return utils.intFromLE(bytes);
	    };

	    EDDSA.prototype.isPoint = function isPoint(val) {
	      return val instanceof this.pointClass;
	    };

	    /***/
	  },
	  /* 35 */
	  /***/function (module, exports, __webpack_require__) {

	    var elliptic = __webpack_require__(0);
	    var utils = elliptic.utils;
	    var assert = utils.assert;
	    var parseBytes = utils.parseBytes;
	    var cachedProperty = utils.cachedProperty;

	    /**
	    * @param {EDDSA} eddsa - instance
	    * @param {Object} params - public/private key parameters
	    *
	    * @param {Array<Byte>} [params.secret] - secret seed bytes
	    * @param {Point} [params.pub] - public key point (aka `A` in eddsa terms)
	    * @param {Array<Byte>} [params.pub] - public key point encoded as bytes
	    *
	    */
	    function KeyPair(eddsa, params) {
	      this.eddsa = eddsa;
	      this._secret = parseBytes(params.secret);
	      if (eddsa.isPoint(params.pub)) this._pub = params.pub;else this._pubBytes = parseBytes(params.pub);
	    }

	    KeyPair.fromPublic = function fromPublic(eddsa, pub) {
	      if (pub instanceof KeyPair) return pub;
	      return new KeyPair(eddsa, { pub: pub });
	    };

	    KeyPair.fromSecret = function fromSecret(eddsa, secret) {
	      if (secret instanceof KeyPair) return secret;
	      return new KeyPair(eddsa, { secret: secret });
	    };

	    KeyPair.prototype.secret = function secret() {
	      return this._secret;
	    };

	    cachedProperty(KeyPair, 'pubBytes', function pubBytes() {
	      return this.eddsa.encodePoint(this.pub());
	    });

	    cachedProperty(KeyPair, 'pub', function pub() {
	      if (this._pubBytes) return this.eddsa.decodePoint(this._pubBytes);
	      return this.eddsa.g.mul(this.priv());
	    });

	    cachedProperty(KeyPair, 'privBytes', function privBytes() {
	      var eddsa = this.eddsa;
	      var hash = this.hash();
	      var lastIx = eddsa.encodingLength - 1;

	      var a = hash.slice(0, eddsa.encodingLength);
	      a[0] &= 248;
	      a[lastIx] &= 127;
	      a[lastIx] |= 64;

	      return a;
	    });

	    cachedProperty(KeyPair, 'priv', function priv() {
	      return this.eddsa.decodeInt(this.privBytes());
	    });

	    cachedProperty(KeyPair, 'hash', function hash() {
	      return this.eddsa.hash().update(this.secret()).digest();
	    });

	    cachedProperty(KeyPair, 'messagePrefix', function messagePrefix() {
	      return this.hash().slice(this.eddsa.encodingLength);
	    });

	    KeyPair.prototype.sign = function sign(message) {
	      assert(this._secret, 'KeyPair can only verify');
	      return this.eddsa.sign(message, this);
	    };

	    KeyPair.prototype.verify = function verify(message, sig) {
	      return this.eddsa.verify(message, sig, this);
	    };

	    KeyPair.prototype.getSecret = function getSecret(enc) {
	      assert(this._secret, 'KeyPair is public only');
	      return utils.encode(this.secret(), enc);
	    };

	    KeyPair.prototype.getPublic = function getPublic(enc) {
	      return utils.encode(this.pubBytes(), enc);
	    };

	    module.exports = KeyPair;

	    /***/
	  },
	  /* 36 */
	  /***/function (module, exports, __webpack_require__) {

	    var BN = __webpack_require__(2);
	    var elliptic = __webpack_require__(0);
	    var utils = elliptic.utils;
	    var assert = utils.assert;
	    var cachedProperty = utils.cachedProperty;
	    var parseBytes = utils.parseBytes;

	    /**
	    * @param {EDDSA} eddsa - eddsa instance
	    * @param {Array<Bytes>|Object} sig -
	    * @param {Array<Bytes>|Point} [sig.R] - R point as Point or bytes
	    * @param {Array<Bytes>|bn} [sig.S] - S scalar as bn or bytes
	    * @param {Array<Bytes>} [sig.Rencoded] - R point encoded
	    * @param {Array<Bytes>} [sig.Sencoded] - S scalar encoded
	    */
	    function Signature(eddsa, sig) {
	      this.eddsa = eddsa;

	      if ((typeof sig === 'undefined' ? 'undefined' : _typeof(sig)) !== 'object') sig = parseBytes(sig);

	      if (Array.isArray(sig)) {
	        sig = {
	          R: sig.slice(0, eddsa.encodingLength),
	          S: sig.slice(eddsa.encodingLength)
	        };
	      }

	      assert(sig.R && sig.S, 'Signature without R or S');

	      if (eddsa.isPoint(sig.R)) this._R = sig.R;
	      if (sig.S instanceof BN) this._S = sig.S;

	      this._Rencoded = Array.isArray(sig.R) ? sig.R : sig.Rencoded;
	      this._Sencoded = Array.isArray(sig.S) ? sig.S : sig.Sencoded;
	    }

	    cachedProperty(Signature, 'S', function S() {
	      return this.eddsa.decodeInt(this.Sencoded());
	    });

	    cachedProperty(Signature, 'R', function R() {
	      return this.eddsa.decodePoint(this.Rencoded());
	    });

	    cachedProperty(Signature, 'Rencoded', function Rencoded() {
	      return this.eddsa.encodePoint(this.R());
	    });

	    cachedProperty(Signature, 'Sencoded', function Sencoded() {
	      return this.eddsa.encodeInt(this.S());
	    });

	    Signature.prototype.toBytes = function toBytes() {
	      return this.Rencoded().concat(this.Sencoded());
	    };

	    Signature.prototype.toHex = function toHex() {
	      return utils.encode(this.toBytes(), 'hex').toUpperCase();
	    };

	    module.exports = Signature;

	    /***/
	  }]
	  /******/);
	});

	var elliptic$1 = unwrapExports(elliptic);

	var EdDSA = elliptic$1.eddsa;
	var ec = new EdDSA('ed25519');
	var privatePrefixBytes = [0x03, 0x45, 0xf3, 0xd0, 0xd6];
	var publicPrefixBytes = [0x03, 0x45, 0xef, 0x9d, 0xe0];

	/**
	 * @classdesc Represents the Key Common.
	 * @class
	 */

	var KeyCommon = function () {
	  function KeyCommon() {
	    _classCallCheck(this, KeyCommon);
	  }

	  _createClass(KeyCommon, null, [{
	    key: 'createKeyPair',

	    /**
	     * @return  {Object} Returns an Key Pair Object with Private and Public keys
	     */
	    value: function createKeyPair() {
	      var privateKeyBytes = secureRandom.randomUint8Array(32);
	      var tmp = void 0;
	      var checkSum = void 0;

	      tmp = sha256.digest(sha256.digest([].concat(privatePrefixBytes, _toConsumableArray(privateKeyBytes))));
	      checkSum = tmp.slice(0, 4);
	      var privateKey = Base58.encode([].concat(privatePrefixBytes, _toConsumableArray(privateKeyBytes), _toConsumableArray(checkSum)));
	      var publicKeyBytes = ec.keyFromSecret(privateKeyBytes).getPublic();
	      tmp = sha256.digest(sha256.digest([].concat(publicPrefixBytes, _toConsumableArray(publicKeyBytes))));
	      checkSum = tmp.slice(0, 4);
	      var publicKey = Base58.encode([].concat(publicPrefixBytes, _toConsumableArray(publicKeyBytes), _toConsumableArray(checkSum)));
	      return {
	        privateKey: privateKey,
	        publicKey: publicKey
	      };
	    }

	    /**
	     * @param  {String} params.signerKey='' - A base58 string in idpub or idsec format
	     * @return  {Boolean} Validate checkSum. Will returns true if checkSum is equal.
	     */

	  }, {
	    key: 'validateCheckSum',
	    value: function validateCheckSum() {
	      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	          _ref$signerKey = _ref.signerKey,
	          signerKey = _ref$signerKey === undefined ? '' : _ref$signerKey;

	      if (!signerKey) {
	        return false;
	      }

	      var signerKeyBytes = Base58.decode(signerKey);
	      if (signerKeyBytes.length !== 41) {
	        return false;
	      }

	      var prefixBytes = signerKeyBytes.slice(0, 5);
	      var keyBytes = signerKeyBytes.slice(5, 37);
	      var checkSum = signerKeyBytes.slice(37, 41);

	      var tmp = sha256.digest(sha256.digest([].concat(_toConsumableArray(prefixBytes), _toConsumableArray(keyBytes))));
	      var tmpCheckSum = tmp.slice(0, 4);

	      if (Buffer.compare(Buffer.from(checkSum), Buffer.from(tmpCheckSum)) !== 0) {
	        return false;
	      }

	      return true;
	    }

	    /**
	     * @param  {String[]} params.signerKeys=[] - Array base58 string in idpub or idsec format
	     * @return  {Object[]} Returns errors array when keys have at least 1 invalid item.
	     */

	  }, {
	    key: 'getInvalidKeys',
	    value: function getInvalidKeys() {
	      var _this = this;

	      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	          _ref2$signerKeys = _ref2.signerKeys,
	          signerKeys = _ref2$signerKeys === undefined ? [] : _ref2$signerKeys;

	      var errors = [];
	      signerKeys.forEach(function (o) {
	        if (!_this.validateCheckSum({ signerKey: o })) {
	          errors.push({ key: o, error: 'key is invalid' });
	        }
	      });

	      return errors;
	    }

	    /**
	     * @param  {String[]} params.signerKeys=[] - Array base58 string in idpub or idsec format
	     * @return  {Object[]} Returns duplicate array when keys have at least 1 duplicate item.
	     */

	  }, {
	    key: 'getDuplicateKeys',
	    value: function getDuplicateKeys() {
	      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	          _ref3$signerKeys = _ref3.signerKeys,
	          signerKeys = _ref3$signerKeys === undefined ? [] : _ref3$signerKeys;

	      var duplicates = [];
	      var unique = [];
	      signerKeys.forEach(function (i) {
	        if (unique.indexOf(i) === -1) {
	          unique.push(i);
	        } else if (!duplicates.find(function (x) {
	          return x.key === i;
	        })) {
	          duplicates.push({
	            key: i,
	            error: 'key is duplicated, keys must be unique.'
	          });
	        }
	      });

	      return duplicates;
	    }

	    /**
	     * @param  {String} params.signerKey='' - A base58 string in idpub or idsec format
	     * @return  {Buffer} Returns key bytes array
	     */

	  }, {
	    key: 'getKeyBytesFromKey',
	    value: function getKeyBytesFromKey(_ref4) {
	      var _ref4$signerKey = _ref4.signerKey,
	          signerKey = _ref4$signerKey === undefined ? '' : _ref4$signerKey;

	      if (!this.validateCheckSum({ signerKey: signerKey })) {
	        throw new Error('key is invalid.');
	      }

	      var signerKeyBytes = Base58.decode(signerKey);

	      return signerKeyBytes.slice(5, 37);
	    }

	    /**
	     * @param  {String} params.signerPrivateKey='' - A base58 string in idpub or idsec format
	     * @return  {String} Returns a base58 string in idpub format
	     */

	  }, {
	    key: 'getPublicKeyFromPrivateKey',
	    value: function getPublicKeyFromPrivateKey() {
	      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	          _ref5$signerPrivateKe = _ref5.signerPrivateKey,
	          signerPrivateKey = _ref5$signerPrivateKe === undefined ? '' : _ref5$signerPrivateKe;

	      if (!this.validateCheckSum({ signerKey: signerPrivateKey })) {
	        throw new Error('signerPrivateKey is invalid.');
	      }

	      var privateKeyBytes = this.getKeyBytesFromKey({ signerKey: signerPrivateKey });
	      var publicKeyBytes = ec.keyFromSecret(privateKeyBytes).getPublic();
	      var tmp = sha256.digest(sha256.digest([].concat(publicPrefixBytes, _toConsumableArray(publicKeyBytes))));
	      var checkSum = tmp.slice(0, 4);
	      return Base58.encode([].concat(publicPrefixBytes, _toConsumableArray(publicKeyBytes), _toConsumableArray(checkSum)));
	    }

	    /**
	     * @param  {String} params.privateKey='' - A base58 string in idsec format
	     * @param  {String} params.message='' - A plain text.
	     * @return  {String} Returns a base64 signature string format
	     */

	  }, {
	    key: 'signContent',
	    value: function signContent() {
	      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	          _ref6$signerPrivateKe = _ref6.signerPrivateKey,
	          signerPrivateKey = _ref6$signerPrivateKe === undefined ? '' : _ref6$signerPrivateKe,
	          _ref6$message = _ref6.message,
	          message = _ref6$message === undefined ? '' : _ref6$message;

	      if (!signerPrivateKey) {
	        throw new Error('signerPrivateKey is required.');
	      }

	      if (!KeyCommon.validateCheckSum({ signerKey: signerPrivateKey })) {
	        throw new Error('signerPrivateKey is invalid.');
	      }

	      if (!message) {
	        throw new Error('message is required.');
	      }

	      var privateKeyBytes = this.getKeyBytesFromKey({ signerKey: signerPrivateKey });
	      var secretKey = ec.keyFromSecret(privateKeyBytes);
	      var msgBytes = Buffer.from(message, constants.UTF8_ENCODE);

	      return Buffer.from(secretKey.sign(msgBytes).toBytes()).toString(constants.BASE64_ENCODE);
	    }

	    /**
	     * @param  {String} params.signerPublicKey='' - A base58 string in idpub format
	     * @param  {String} params.signature='' - A base 64 string format
	     * @param  {String} params.message='' - A plain text
	     * @return  {Boolean} Validate signature
	     */

	  }, {
	    key: 'validateSignature',
	    value: function validateSignature() {
	      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	          _ref7$signerPublicKey = _ref7.signerPublicKey,
	          signerPublicKey = _ref7$signerPublicKey === undefined ? '' : _ref7$signerPublicKey,
	          _ref7$signature = _ref7.signature,
	          signature = _ref7$signature === undefined ? '' : _ref7$signature,
	          _ref7$message = _ref7.message,
	          message = _ref7$message === undefined ? '' : _ref7$message;

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

	      var signatureBytes = Buffer.from(signature, constants.BASE64_ENCODE);
	      var msgBytes = Buffer.from(message, constants.UTF8_ENCODE);
	      var keyBytes = this.getKeyBytesFromKey({ signerKey: signerPublicKey });
	      var secretKey = ec.keyFromPublic([].concat(_toConsumableArray(keyBytes)));

	      return secretKey.verify(msgBytes, [].concat(_toConsumableArray(signatureBytes)));
	    }
	  }]);

	  return KeyCommon;
	}();

	var ValidateSignatureUtil = function () {
	  function ValidateSignatureUtil() {
	    _classCallCheck(this, ValidateSignatureUtil);
	  }

	  _createClass(ValidateSignatureUtil, null, [{
	    key: 'validateSignature',

	    /**
	     * @param  {Object} obj
	     * @param  {Boolean} validateForChain
	     * @param  {Object} apiCall
	     * @return {String} status = [not_signed/invalid_chain_format (not_signed/invalid_entry_format) |
	     * retired_key | invalid_signature | valid_signature]
	     */
	    value: function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
	        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	            _ref2$obj = _ref2.obj,
	            obj = _ref2$obj === undefined ? {} : _ref2$obj,
	            _ref2$validateForChai = _ref2.validateForChain,
	            validateForChain = _ref2$validateForChai === undefined ? true : _ref2$validateForChai,
	            apiCall = _ref2.apiCall;

	        var externalIds, typeName, invalidFormat, signerChainId, signerPublicKey, signature, timeStamp, keyHeight, keyResponse, message;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                externalIds = obj.data.external_ids;
	                typeName = 'SignedChain';
	                invalidFormat = 'not_signed/invalid_chain_format';


	                if (!validateForChain) {
	                  typeName = 'SignedEntry';
	                  invalidFormat = 'not_signed/invalid_entry_format';
	                }

	                if (!(externalIds.length < 6 || externalIds[0] !== typeName || externalIds[1] !== '0x01')) {
	                  _context.next = 6;
	                  break;
	                }

	                return _context.abrupt('return', invalidFormat);

	              case 6:
	                signerChainId = externalIds[2];
	                signerPublicKey = externalIds[3];
	                signature = Buffer.from(externalIds[4], 'hex').toString('base64');
	                timeStamp = externalIds[5];
	                keyHeight = 0;

	                if (obj.data.dblock != null) {
	                  keyHeight = obj.data.dblock.height;
	                }

	                _context.prev = 12;
	                _context.next = 15;
	                return apiCall.send(constants.GET_METHOD, constants.IDENTITIES_URL + '/' + signerChainId + '/' + constants.KEYS_STRING + '/' + signerPublicKey);

	              case 15:
	                keyResponse = _context.sent;

	                if (!(keyResponse.data.retired_height != null && !(keyResponse.data.activated_height <= keyHeight && keyHeight <= keyResponse.data.retired_height))) {
	                  _context.next = 18;
	                  break;
	                }

	                return _context.abrupt('return', 'retired_key');

	              case 18:
	                _context.next = 23;
	                break;

	              case 20:
	                _context.prev = 20;
	                _context.t0 = _context['catch'](12);
	                return _context.abrupt('return', 'retired_key');

	              case 23:
	                message = '' + signerChainId + obj.data.content + timeStamp;

	                if (KeyCommon.validateSignature({
	                  signerPublicKey: signerPublicKey,
	                  signature: signature,
	                  message: message
	                })) {
	                  _context.next = 26;
	                  break;
	                }

	                return _context.abrupt('return', 'invalid_signature');

	              case 26:
	                return _context.abrupt('return', 'valid_signature');

	              case 27:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[12, 20]]);
	      }));

	      function validateSignature() {
	        return _ref.apply(this, arguments);
	      }

	      return validateSignature;
	    }()
	  }]);

	  return ValidateSignatureUtil;
	}();

	/**
	 * @classdesc Represents the Entries. It allows the user to make call to the Entries API
	 * with a single function.
	 * @class
	 */

	var Entries = function () {
	  /**
	   * @constructor
	   * @param  {Object} options - An object containing the access token and the base URL
	   */
	  function Entries(options) {
	    _classCallCheck(this, Entries);

	    this.apiCall = new APICall(options);
	    this.automaticSigning = options.automaticSigning;
	  }

	  /**
	   * @param  {String} params.chainId=''
	   * @param  {String} params.entryHash=''
	   * @param  {Boolean | Function} params.signatureValidation The signature validation may
	   * be True/False or callback function
	   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	   * with the Chain Info or an Error with the problem.
	   */


	  _createClass(Entries, [{
	    key: 'get',
	    value: function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var response, signatureValidation, status;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!CommonUtil.isEmptyString(params.chainId)) {
	                  _context.next = 2;
	                  break;
	                }

	                throw new Error('chainId is required.');

	              case 2:
	                if (!CommonUtil.isEmptyString(params.entryHash)) {
	                  _context.next = 4;
	                  break;
	                }

	                throw new Error('entryHash is required.');

	              case 4:
	                _context.next = 6;
	                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL + '/' + params.entryHash);

	              case 6:
	                response = _context.sent;
	                signatureValidation = params.signatureValidation;

	                if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
	                  signatureValidation = true;
	                }

	                if (!(signatureValidation === true)) {
	                  _context.next = 14;
	                  break;
	                }

	                _context.next = 12;
	                return ValidateSignatureUtil.validateSignature({
	                  obj: response,
	                  validateForChain: false,
	                  apiCall: this.apiCall
	                });

	              case 12:
	                status = _context.sent;
	                return _context.abrupt('return', {
	                  entry: response,
	                  status: status
	                });

	              case 14:
	                if (!(typeof signatureValidation === 'function')) {
	                  _context.next = 16;
	                  break;
	                }

	                return _context.abrupt('return', {
	                  entry: response,
	                  status: signatureValidation(response)
	                });

	              case 16:
	                return _context.abrupt('return', response);

	              case 17:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function get() {
	        return _ref.apply(this, arguments);
	      }

	      return get;
	    }()

	    /**
	     * @param  {String} params.chainId=''
	     * @param  {Boolean | Function} params.signatureValidation The signature validation may
	     * be True/False or callback function
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the First Entry or an Error with the problem.
	     */

	  }, {
	    key: 'getFirst',
	    value: function () {
	      var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var response, signatureValidation, status;
	        return regenerator.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!CommonUtil.isEmptyString(params.chainId)) {
	                  _context2.next = 2;
	                  break;
	                }

	                throw new Error('chainId is required.');

	              case 2:
	                _context2.next = 4;
	                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL + '/' + constants.FIRST_URL);

	              case 4:
	                response = _context2.sent;
	                signatureValidation = params.signatureValidation;

	                if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
	                  signatureValidation = true;
	                }

	                if (!(signatureValidation === true)) {
	                  _context2.next = 12;
	                  break;
	                }

	                _context2.next = 10;
	                return ValidateSignatureUtil.validateSignature({
	                  obj: response,
	                  validateForChain: false,
	                  apiCall: this.apiCall
	                });

	              case 10:
	                status = _context2.sent;
	                return _context2.abrupt('return', {
	                  entry: response,
	                  status: status
	                });

	              case 12:
	                if (!(typeof signatureValidation === 'function')) {
	                  _context2.next = 14;
	                  break;
	                }

	                return _context2.abrupt('return', {
	                  entry: response,
	                  status: signatureValidation(response)
	                });

	              case 14:
	                return _context2.abrupt('return', response);

	              case 15:
	              case 'end':
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function getFirst() {
	        return _ref2.apply(this, arguments);
	      }

	      return getFirst;
	    }()

	    /**
	     * @param  {String} params.chainId=''
	     * @param  {Boolean | Function} params.signatureValidation The signature validation may
	     * be True/False or callback function
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the Last Entry or an Error with the problem.
	     */

	  }, {
	    key: 'getLast',
	    value: function () {
	      var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var response, signatureValidation, status;
	        return regenerator.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                if (!CommonUtil.isEmptyString(params.chainId)) {
	                  _context3.next = 2;
	                  break;
	                }

	                throw new Error('chainId is required.');

	              case 2:
	                _context3.next = 4;
	                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL + '/' + constants.LAST_URL);

	              case 4:
	                response = _context3.sent;
	                signatureValidation = params.signatureValidation;

	                if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
	                  signatureValidation = true;
	                }

	                if (!(signatureValidation === true)) {
	                  _context3.next = 12;
	                  break;
	                }

	                _context3.next = 10;
	                return ValidateSignatureUtil.validateSignature({
	                  obj: response,
	                  validateForChain: false,
	                  apiCall: this.apiCall
	                });

	              case 10:
	                status = _context3.sent;
	                return _context3.abrupt('return', {
	                  entry: response,
	                  status: status
	                });

	              case 12:
	                if (!(typeof signatureValidation === 'function')) {
	                  _context3.next = 14;
	                  break;
	                }

	                return _context3.abrupt('return', {
	                  entry: response,
	                  status: signatureValidation(response)
	                });

	              case 14:
	                return _context3.abrupt('return', response);

	              case 15:
	              case 'end':
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function getLast() {
	        return _ref3.apply(this, arguments);
	      }

	      return getLast;
	    }()

	    /**
	     * @param  {String} params.chainId=''
	     * @param  {String} params.content=''
	     * @param  {String[]} params.externalIds=[]
	     * @param  {String} params.signerPrivateKey=''
	     * @param  {String} params.signerChainId=''
	     * @param  {String} params.callbackUrl=''
	     * @param  {String[]} params.callbackStages=[]
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the Entry Info or an Error with the problem.
	     */

	  }, {
	    key: 'create',
	    value: function () {
	      var _ref4 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var idsBase64, timeStamp, message, signature, signerPublicKey, data, response;
	        return regenerator.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                if (!CommonUtil.isEmptyString(params.chainId)) {
	                  _context4.next = 2;
	                  break;
	                }

	                throw new Error('chainId is required.');

	              case 2:
	                if (!this.automaticSigning) {
	                  _context4.next = 13;
	                  break;
	                }

	                if (!(params.externalIds && !Array.isArray(params.externalIds))) {
	                  _context4.next = 5;
	                  break;
	                }

	                throw new Error('externalIds must be an array.');

	              case 5:
	                if (!CommonUtil.isEmptyString(params.signerPrivateKey)) {
	                  _context4.next = 7;
	                  break;
	                }

	                throw new Error('signerPrivateKey is required.');

	              case 7:
	                if (KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey })) {
	                  _context4.next = 9;
	                  break;
	                }

	                throw new Error('signerPrivateKey is invalid.');

	              case 9:
	                if (!CommonUtil.isEmptyString(params.signerChainId)) {
	                  _context4.next = 11;
	                  break;
	                }

	                throw new Error('signerChainId is required.');

	              case 11:
	                _context4.next = 23;
	                break;

	              case 13:
	                if (!CommonUtil.isEmptyArray(params.externalIds)) {
	                  _context4.next = 15;
	                  break;
	                }

	                throw new Error('at least 1 externalId is required.');

	              case 15:
	                if (Array.isArray(params.externalIds)) {
	                  _context4.next = 17;
	                  break;
	                }

	                throw new Error('externalIds must be an array.');

	              case 17:
	                if (!(params.signerPrivateKey && CommonUtil.isEmptyString(params.signerChainId))) {
	                  _context4.next = 19;
	                  break;
	                }

	                throw new Error('signerChainId is required when passing a signerPrivateKey.');

	              case 19:
	                if (!(params.signerPrivateKey && !KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey }))) {
	                  _context4.next = 21;
	                  break;
	                }

	                throw new Error('signerPrivateKey is invalid.');

	              case 21:
	                if (!(params.signerChainId && CommonUtil.isEmptyString(params.signerPrivateKey))) {
	                  _context4.next = 23;
	                  break;
	                }

	                throw new Error('signerPrivateKey is required when passing a signerChainId.');

	              case 23:
	                if (!CommonUtil.isEmptyString(params.content)) {
	                  _context4.next = 25;
	                  break;
	                }

	                throw new Error('content is required.');

	              case 25:
	                if (!(!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl_1(params.callbackUrl))) {
	                  _context4.next = 27;
	                  break;
	                }

	                throw new Error('callbackUrl is an invalid url format.');

	              case 27:
	                if (!(params.callbackStages && !Array.isArray(params.callbackStages))) {
	                  _context4.next = 29;
	                  break;
	                }

	                throw new Error('callbackStages must be an array.');

	              case 29:
	                idsBase64 = [];

	                if (this.automaticSigning) {
	                  timeStamp = new Date().toISOString();
	                  message = '' + params.signerChainId + params.content + timeStamp;
	                  signature = KeyCommon.signContent({
	                    signerPrivateKey: params.signerPrivateKey,
	                    message: message
	                  });
	                  signerPublicKey = KeyCommon.getPublicKeyFromPrivateKey({
	                    signerPrivateKey: params.signerPrivateKey
	                  });


	                  idsBase64.push(Buffer.from('SignedEntry').toString('base64'));
	                  idsBase64.push(Buffer.from([0x01]).toString('base64'));
	                  idsBase64.push(Buffer.from(params.signerChainId).toString('base64'));
	                  idsBase64.push(Buffer.from(signerPublicKey).toString('base64'));
	                  idsBase64.push(signature);
	                  idsBase64.push(Buffer.from(timeStamp).toString('base64'));
	                }

	                if (params.externalIds) {
	                  params.externalIds.forEach(function (o) {
	                    idsBase64.push(Buffer.from(o).toString('base64'));
	                  });
	                }

	                data = {
	                  external_ids: idsBase64,
	                  content: Buffer.from(params.content).toString('base64')
	                };


	                if (!CommonUtil.isEmptyString(params.callbackUrl)) {
	                  data.callback_url = params.callbackUrl;
	                }
	                if (Array.isArray(params.callbackStages)) {
	                  data.callback_stages = params.callbackStages;
	                }

	                _context4.next = 37;
	                return this.apiCall.send(constants.POST_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL, data);

	              case 37:
	                response = _context4.sent;
	                return _context4.abrupt('return', response);

	              case 39:
	              case 'end':
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));

	      function create() {
	        return _ref4.apply(this, arguments);
	      }

	      return create;
	    }()

	    /**
	     * @param  {String} params.chainId=''
	     * @param  {Number} params.limit
	     * @param  {Number} params.offset
	     * @param  {String[]} params.stages=[]
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the Entries or an Error with the problem.
	     */

	  }, {
	    key: 'list',
	    value: function () {
	      var _ref5 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var limit, offset, stages, data, response;
	        return regenerator.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                if (!CommonUtil.isEmptyString(params.chainId)) {
	                  _context5.next = 2;
	                  break;
	                }

	                throw new Error('chainId is required.');

	              case 2:
	                limit = params.limit, offset = params.offset, stages = params.stages;
	                data = {};

	                if (!limit) {
	                  _context5.next = 8;
	                  break;
	                }

	                if (_Number$isInteger(limit)) {
	                  _context5.next = 7;
	                  break;
	                }

	                throw new Error('limit must be an integer.');

	              case 7:
	                data.limit = limit;

	              case 8:
	                if (!offset) {
	                  _context5.next = 12;
	                  break;
	                }

	                if (_Number$isInteger(offset)) {
	                  _context5.next = 11;
	                  break;
	                }

	                throw new Error('offset must be an integer.');

	              case 11:
	                data.offset = offset;

	              case 12:
	                if (!stages) {
	                  _context5.next = 16;
	                  break;
	                }

	                if (Array.isArray(stages)) {
	                  _context5.next = 15;
	                  break;
	                }

	                throw new Error('stages must be an array.');

	              case 15:
	                data.stages = stages.join(',');

	              case 16:
	                _context5.next = 18;
	                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL, data);

	              case 18:
	                response = _context5.sent;
	                return _context5.abrupt('return', response);

	              case 20:
	              case 'end':
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));

	      function list() {
	        return _ref5.apply(this, arguments);
	      }

	      return list;
	    }()

	    /**
	     * @param  {String} params.chainId=''
	     * @param  {String[]} params.externalIds=[]
	     * @param  {Number} params.limit
	     * @param  {Number} params.offset
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the Entries Info or an Error with the problem.
	     */

	  }, {
	    key: 'search',
	    value: function () {
	      var _ref6 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee6() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var limit, offset, url, idsBase64, data, response;
	        return regenerator.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                if (!CommonUtil.isEmptyString(params.chainId)) {
	                  _context6.next = 2;
	                  break;
	                }

	                throw new Error('chainId is required.');

	              case 2:
	                if (!CommonUtil.isEmptyArray(params.externalIds)) {
	                  _context6.next = 4;
	                  break;
	                }

	                throw new Error('at least 1 externalId is required.');

	              case 4:
	                if (Array.isArray(params.externalIds)) {
	                  _context6.next = 6;
	                  break;
	                }

	                throw new Error('externalIds must be an array.');

	              case 6:
	                limit = params.limit, offset = params.offset;
	                url = constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL + '/' + constants.SEARCH_URL;

	                if (!limit) {
	                  _context6.next = 12;
	                  break;
	                }

	                if (_Number$isInteger(limit)) {
	                  _context6.next = 11;
	                  break;
	                }

	                throw new Error('limit must be an integer.');

	              case 11:

	                url += '?limit=' + limit;

	              case 12:
	                if (!offset) {
	                  _context6.next = 16;
	                  break;
	                }

	                if (_Number$isInteger(offset)) {
	                  _context6.next = 15;
	                  break;
	                }

	                throw new Error('offset must be an integer.');

	              case 15:

	                if (limit) {
	                  url += '&offset=' + offset;
	                } else {
	                  url += '?offset=' + offset;
	                }

	              case 16:
	                idsBase64 = [];

	                params.externalIds.forEach(function (o) {
	                  idsBase64.push(Buffer.from(o).toString('base64'));
	                });

	                data = {
	                  external_ids: idsBase64
	                };
	                _context6.next = 21;
	                return this.apiCall.send(constants.POST_METHOD, url, data);

	              case 21:
	                response = _context6.sent;
	                return _context6.abrupt('return', response);

	              case 23:
	              case 'end':
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));

	      function search() {
	        return _ref6.apply(this, arguments);
	      }

	      return search;
	    }()
	  }]);

	  return Entries;
	}();

	/**
	 * @classdesc Represents the Chains. It allows the user to make call to the Chains API
	 * with a single function.
	 * @class
	 */

	var Chains = function () {
	  /**
	   * @constructor
	   * @param  {Object} options - An object containing the access token and the base URL
	   */
	  function Chains(options) {
	    _classCallCheck(this, Chains);

	    this.apiCall = new APICall(options);
	    this.automaticSigning = options.automaticSigning;
	    this.entries = new Entries(options);
	  }

	  /**
	   * @param  {String} params.chainId='' The chain id of the desired Chain Info.
	   * @param  {Boolean | Function} params.signatureValidation The signature validation may
	   * be True/False or callback function
	   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	   * with the Chain Info or an Error with the problem.
	   */


	  _createClass(Chains, [{
	    key: 'get',
	    value: function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var response, signatureValidation, status;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!CommonUtil.isEmptyString(params.chainId)) {
	                  _context.next = 2;
	                  break;
	                }

	                throw new Error('chainId is required.');

	              case 2:
	                _context.next = 4;
	                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId);

	              case 4:
	                response = _context.sent;
	                signatureValidation = params.signatureValidation;

	                if (typeof signatureValidation !== 'boolean' && typeof signatureValidation !== 'function') {
	                  signatureValidation = true;
	                }

	                if (!(signatureValidation === true)) {
	                  _context.next = 12;
	                  break;
	                }

	                _context.next = 10;
	                return ValidateSignatureUtil.validateSignature({
	                  obj: response,
	                  validateForChain: true,
	                  apiCall: this.apiCall
	                });

	              case 10:
	                status = _context.sent;
	                return _context.abrupt('return', {
	                  chain: response,
	                  status: status
	                });

	              case 12:
	                if (!(typeof signatureValidation === 'function')) {
	                  _context.next = 14;
	                  break;
	                }

	                return _context.abrupt('return', {
	                  chain: response,
	                  status: signatureValidation(response)
	                });

	              case 14:
	                return _context.abrupt('return', response);

	              case 15:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function get() {
	        return _ref.apply(this, arguments);
	      }

	      return get;
	    }()

	    /**
	     * @param  {String[]} params.externalIds=[]
	     * @param  {String} params.signerPrivateKey=''
	     * @param  {String} params.signerChainId=''
	     * @param  {String} params.content={}
	     * @param  {String} params.callbackUrl={}
	     * @param  {String[]} params.callbackStages=[]
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the chain or an Error with the problem.
	     */

	  }, {
	    key: 'create',
	    value: function () {
	      var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var idsBase64, timeStamp, message, signature, signerPublicKey, data, response;
	        return regenerator.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!this.automaticSigning) {
	                  _context2.next = 11;
	                  break;
	                }

	                if (!(params.externalIds && !Array.isArray(params.externalIds))) {
	                  _context2.next = 3;
	                  break;
	                }

	                throw new Error('externalIds must be an array.');

	              case 3:
	                if (!CommonUtil.isEmptyString(params.signerPrivateKey)) {
	                  _context2.next = 5;
	                  break;
	                }

	                throw new Error('signerPrivateKey is required.');

	              case 5:
	                if (KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey })) {
	                  _context2.next = 7;
	                  break;
	                }

	                throw new Error('signerPrivateKey is invalid.');

	              case 7:
	                if (!CommonUtil.isEmptyString(params.signerChainId)) {
	                  _context2.next = 9;
	                  break;
	                }

	                throw new Error('signerChainId is required.');

	              case 9:
	                _context2.next = 21;
	                break;

	              case 11:
	                if (!CommonUtil.isEmptyArray(params.externalIds)) {
	                  _context2.next = 13;
	                  break;
	                }

	                throw new Error('at least 1 externalId is required.');

	              case 13:
	                if (Array.isArray(params.externalIds)) {
	                  _context2.next = 15;
	                  break;
	                }

	                throw new Error('externalIds must be an array.');

	              case 15:
	                if (!(params.signerPrivateKey && CommonUtil.isEmptyString(params.signerChainId))) {
	                  _context2.next = 17;
	                  break;
	                }

	                throw new Error('signerChainId is required when passing a signerPrivateKey.');

	              case 17:
	                if (!(params.signerPrivateKey && !KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey }))) {
	                  _context2.next = 19;
	                  break;
	                }

	                throw new Error('signerPrivateKey is invalid.');

	              case 19:
	                if (!(params.signerChainId && CommonUtil.isEmptyString(params.signerPrivateKey))) {
	                  _context2.next = 21;
	                  break;
	                }

	                throw new Error('signerPrivateKey is required when passing a signerChainId.');

	              case 21:
	                if (!CommonUtil.isEmptyString(params.content)) {
	                  _context2.next = 23;
	                  break;
	                }

	                throw new Error('content is required.');

	              case 23:
	                if (!(!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl_1(params.callbackUrl))) {
	                  _context2.next = 25;
	                  break;
	                }

	                throw new Error('callbackUrl is an invalid url format.');

	              case 25:
	                if (!(params.callbackStages && !Array.isArray(params.callbackStages))) {
	                  _context2.next = 27;
	                  break;
	                }

	                throw new Error('callbackStages must be an array.');

	              case 27:
	                idsBase64 = [];


	                if (this.automaticSigning) {
	                  timeStamp = new Date().toISOString();
	                  message = '' + params.signerChainId + params.content + timeStamp;
	                  signature = KeyCommon.signContent({
	                    signerPrivateKey: params.signerPrivateKey,
	                    message: message
	                  });
	                  signerPublicKey = KeyCommon.getPublicKeyFromPrivateKey({
	                    signerPrivateKey: params.signerPrivateKey
	                  });


	                  idsBase64.push(Buffer.from('SignedChain').toString('base64'));
	                  idsBase64.push(Buffer.from([0x01]).toString('base64'));
	                  idsBase64.push(Buffer.from(params.signerChainId).toString('base64'));
	                  idsBase64.push(Buffer.from(signerPublicKey).toString('base64'));
	                  idsBase64.push(signature);
	                  idsBase64.push(Buffer.from(timeStamp).toString('base64'));
	                }

	                if (params.externalIds) {
	                  params.externalIds.forEach(function (o) {
	                    idsBase64.push(Buffer.from(o).toString('base64'));
	                  });
	                }

	                data = {
	                  external_ids: idsBase64,
	                  content: Buffer.from(params.content).toString('base64')
	                };


	                if (!CommonUtil.isEmptyString(params.callbackUrl)) {
	                  data.callback_url = params.callbackUrl;
	                }
	                if (Array.isArray(params.callbackStages)) {
	                  data.callback_stages = params.callbackStages;
	                }

	                _context2.next = 35;
	                return this.apiCall.send(constants.POST_METHOD, constants.CHAINS_URL, data);

	              case 35:
	                response = _context2.sent;
	                return _context2.abrupt('return', response);

	              case 37:
	              case 'end':
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function create() {
	        return _ref2.apply(this, arguments);
	      }

	      return create;
	    }()

	    /**
	     * @param  {Number} params.limit
	     * @param  {Number} params.offset
	     * @param  {String[]} params.stages=[]
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with all chain or an Error with the problem.
	     */

	  }, {
	    key: 'list',
	    value: function () {
	      var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var limit, offset, stages, data, response;
	        return regenerator.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                limit = params.limit, offset = params.offset, stages = params.stages;
	                data = {};

	                if (!limit) {
	                  _context3.next = 6;
	                  break;
	                }

	                if (_Number$isInteger(limit)) {
	                  _context3.next = 5;
	                  break;
	                }

	                throw new Error('limit must be an integer.');

	              case 5:
	                data.limit = limit;

	              case 6:
	                if (!offset) {
	                  _context3.next = 10;
	                  break;
	                }

	                if (_Number$isInteger(offset)) {
	                  _context3.next = 9;
	                  break;
	                }

	                throw new Error('offset must be an integer.');

	              case 9:
	                data.offset = offset;

	              case 10:
	                if (!stages) {
	                  _context3.next = 14;
	                  break;
	                }

	                if (Array.isArray(stages)) {
	                  _context3.next = 13;
	                  break;
	                }

	                throw new Error('stages must be an array.');

	              case 13:
	                data.stages = stages.join(',');

	              case 14:
	                _context3.next = 16;
	                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL, data);

	              case 16:
	                response = _context3.sent;
	                return _context3.abrupt('return', response);

	              case 18:
	              case 'end':
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function list() {
	        return _ref3.apply(this, arguments);
	      }

	      return list;
	    }()

	    /**
	     * @param  {String[]} params.externalIds=[]
	     * @param  {Number} params.limit
	     * @param  {Number} params.offset
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the chain or an Error with the problem.
	     */

	  }, {
	    key: 'search',
	    value: function () {
	      var _ref4 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var limit, offset, url, idsBase64, data, response;
	        return regenerator.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                if (!CommonUtil.isEmptyArray(params.externalIds)) {
	                  _context4.next = 2;
	                  break;
	                }

	                throw new Error('at least 1 externalId is required.');

	              case 2:
	                if (Array.isArray(params.externalIds)) {
	                  _context4.next = 4;
	                  break;
	                }

	                throw new Error('externalIds must be an array.');

	              case 4:
	                limit = params.limit, offset = params.offset;
	                url = constants.CHAINS_URL + '/' + constants.SEARCH_URL;

	                if (!limit) {
	                  _context4.next = 10;
	                  break;
	                }

	                if (_Number$isInteger(limit)) {
	                  _context4.next = 9;
	                  break;
	                }

	                throw new Error('limit must be an integer.');

	              case 9:

	                url += '?limit=' + limit;

	              case 10:
	                if (!offset) {
	                  _context4.next = 14;
	                  break;
	                }

	                if (_Number$isInteger(offset)) {
	                  _context4.next = 13;
	                  break;
	                }

	                throw new Error('offset must be an integer.');

	              case 13:

	                if (limit) {
	                  url += '&offset=' + offset;
	                } else {
	                  url += '?offset=' + offset;
	                }

	              case 14:
	                idsBase64 = [];

	                params.externalIds.forEach(function (o) {
	                  idsBase64.push(Buffer.from(o).toString('base64'));
	                });

	                data = {
	                  external_ids: idsBase64
	                };
	                _context4.next = 19;
	                return this.apiCall.send(constants.POST_METHOD, url, data);

	              case 19:
	                response = _context4.sent;
	                return _context4.abrupt('return', response);

	              case 21:
	              case 'end':
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));

	      function search() {
	        return _ref4.apply(this, arguments);
	      }

	      return search;
	    }()
	  }]);

	  return Chains;
	}();

	var objectWithoutProperties = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;

	exports.default = function (obj, keys) {
	  var target = {};

	  for (var i in obj) {
	    if (keys.indexOf(i) >= 0) continue;
	    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
	    target[i] = obj[i];
	  }

	  return target;
	};
	});

	var _objectWithoutProperties = unwrapExports(objectWithoutProperties);

	var IdentitiesKeyUtil = function () {
	  function IdentitiesKeyUtil(options) {
	    _classCallCheck(this, IdentitiesKeyUtil);

	    this.apiCall = new APICall(options);
	  }

	  /**
	   * @param  {String} params.identityChainId='' The chain id of the desired Identity Keys.
	   * @param  {String} params.keyString
	   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	   * with the Identity Key or an Error with the problem.
	   */


	  _createClass(IdentitiesKeyUtil, [{
	    key: 'get',
	    value: function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var response;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!CommonUtil.isEmptyString(params.identityChainId)) {
	                  _context.next = 2;
	                  break;
	                }

	                throw new Error('identityChainId is required.');

	              case 2:
	                if (!CommonUtil.isEmptyString(params.keyString)) {
	                  _context.next = 4;
	                  break;
	                }

	                throw new Error('keyString is required.');

	              case 4:
	                if (KeyCommon.validateCheckSum({ signerKey: params.keyString })) {
	                  _context.next = 6;
	                  break;
	                }

	                throw new Error('keyString is invalid.');

	              case 6:
	                _context.next = 8;
	                return this.apiCall.send(constants.GET_METHOD, constants.IDENTITIES_URL + '/' + params.identityChainId + '/' + constants.KEYS_STRING + '/' + params.keyString);

	              case 8:
	                response = _context.sent;
	                return _context.abrupt('return', response);

	              case 10:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function get() {
	        return _ref.apply(this, arguments);
	      }

	      return get;
	    }()

	    /**
	     * @param  {String} params.identityChainId='' The chain id of the desired Identity Keys.
	     * @param  {Number} params.activeAtHeight
	     * @param  {Number} params.limit
	     * @param  {Number} params.offset
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the Identity Keys or an Error with the problem.
	     */

	  }, {
	    key: 'list',
	    value: function () {
	      var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
	        var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	        var _ref3$identityChainId = _ref3.identityChainId,
	            identityChainId = _ref3$identityChainId === undefined ? '' : _ref3$identityChainId,
	            params = _objectWithoutProperties(_ref3, ['identityChainId']);

	        var activeAtHeight, limit, offset, data, response;
	        return regenerator.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (identityChainId) {
	                  _context2.next = 2;
	                  break;
	                }

	                throw new Error('identityChainId is required.');

	              case 2:
	                activeAtHeight = params.activeAtHeight, limit = params.limit, offset = params.offset;
	                data = {};

	                if (!activeAtHeight) {
	                  _context2.next = 8;
	                  break;
	                }

	                if (_Number$isInteger(activeAtHeight)) {
	                  _context2.next = 7;
	                  break;
	                }

	                throw new Error('activeAtHeight must be an integer.');

	              case 7:
	                data.active_at_height = activeAtHeight;

	              case 8:
	                if (!limit) {
	                  _context2.next = 12;
	                  break;
	                }

	                if (_Number$isInteger(limit)) {
	                  _context2.next = 11;
	                  break;
	                }

	                throw new Error('limit must be an integer.');

	              case 11:
	                data.limit = limit;

	              case 12:
	                if (!offset) {
	                  _context2.next = 16;
	                  break;
	                }

	                if (_Number$isInteger(offset)) {
	                  _context2.next = 15;
	                  break;
	                }

	                throw new Error('offset must be an integer.');

	              case 15:
	                data.offset = offset;

	              case 16:
	                _context2.next = 18;
	                return this.apiCall.send(constants.GET_METHOD, constants.IDENTITIES_URL + '/' + identityChainId + '/' + constants.KEYS_STRING, data);

	              case 18:
	                response = _context2.sent;
	                return _context2.abrupt('return', response);

	              case 20:
	              case 'end':
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function list() {
	        return _ref2.apply(this, arguments);
	      }

	      return list;
	    }()

	    /**
	     * @param  {String} params.identityChainId='' The chain id of the desired Identity Keys.
	     * @param  {String} params.oldPublicKey=''
	     * @param  {String} params.newPublicKey=''
	     * @param  {String} params.signerPrivateKey=''
	     * @param  {String} params.callbackUrl=''
	     * @param  {String[]} params.callbackStages=[]
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the entry hash or an Error with the problem
	     */

	  }, {
	    key: 'replace',
	    value: function () {
	      var _ref4 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
	        var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	        var _ref5$identityChainId = _ref5.identityChainId,
	            identityChainId = _ref5$identityChainId === undefined ? '' : _ref5$identityChainId,
	            params = _objectWithoutProperties(_ref5, ['identityChainId']);

	        var newKey, keyPair, msgHash, signature, signerKey, data, response;
	        return regenerator.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                if (!CommonUtil.isEmptyString(identityChainId)) {
	                  _context3.next = 2;
	                  break;
	                }

	                throw new Error('identityChainId is required.');

	              case 2:
	                if (!CommonUtil.isEmptyString(params.oldPublicKey)) {
	                  _context3.next = 4;
	                  break;
	                }

	                throw new Error('oldPublicKey is required.');

	              case 4:
	                newKey = void 0;
	                keyPair = void 0;

	                if (!(typeof params.newPublicKey !== 'undefined')) {
	                  _context3.next = 12;
	                  break;
	                }

	                if (!CommonUtil.isEmptyString(params.newPublicKey)) {
	                  _context3.next = 9;
	                  break;
	                }

	                throw new Error('newPublicKey is required.');

	              case 9:
	                newKey = params.newPublicKey;
	                _context3.next = 14;
	                break;

	              case 12:
	                keyPair = KeyCommon.createKeyPair();
	                newKey = keyPair.publicKey;

	              case 14:
	                if (!CommonUtil.isEmptyString(params.signerPrivateKey)) {
	                  _context3.next = 16;
	                  break;
	                }

	                throw new Error('signerPrivateKey is required.');

	              case 16:
	                if (KeyCommon.validateCheckSum({ signerKey: params.oldPublicKey })) {
	                  _context3.next = 18;
	                  break;
	                }

	                throw new Error('oldPublicKey is an invalid public key.');

	              case 18:
	                if (KeyCommon.validateCheckSum({ signerKey: newKey })) {
	                  _context3.next = 20;
	                  break;
	                }

	                throw new Error('newPublicKey is an invalid public key.');

	              case 20:
	                if (KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey })) {
	                  _context3.next = 22;
	                  break;
	                }

	                throw new Error('signerPrivateKey is invalid.');

	              case 22:
	                if (!(params.callbackStages && !Array.isArray(params.callbackStages))) {
	                  _context3.next = 24;
	                  break;
	                }

	                throw new Error('callbackStages must be an array.');

	              case 24:
	                if (!(!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl_1(params.callbackUrl))) {
	                  _context3.next = 26;
	                  break;
	                }

	                throw new Error('callbackUrl is an invalid url format.');

	              case 26:
	                msgHash = Buffer.from('' + (identityChainId + params.oldPublicKey + newKey), constants.UTF8_ENCODE);
	                signature = KeyCommon.signContent({
	                  signerPrivateKey: params.signerPrivateKey,
	                  message: msgHash
	                });
	                signerKey = KeyCommon.getPublicKeyFromPrivateKey({
	                  signerPrivateKey: params.signerPrivateKey
	                });
	                data = {
	                  old_key: params.oldPublicKey,
	                  new_key: newKey,
	                  signature: signature,
	                  signer_key: signerKey
	                };


	                if (!CommonUtil.isEmptyString(params.callbackUrl)) {
	                  data.callback_url = params.callbackUrl;
	                }
	                if (Array.isArray(params.callbackStages)) {
	                  data.callback_stages = params.callbackStages;
	                }

	                _context3.next = 34;
	                return this.apiCall.send(constants.POST_METHOD, constants.IDENTITIES_URL + '/' + identityChainId + '/' + constants.KEYS_STRING, data);

	              case 34:
	                response = _context3.sent;


	                if (typeof params.newPublicKey === 'undefined') {
	                  response.key_pair = keyPair;
	                }

	                return _context3.abrupt('return', response);

	              case 37:
	              case 'end':
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function replace() {
	        return _ref4.apply(this, arguments);
	      }

	      return replace;
	    }()
	  }]);

	  return IdentitiesKeyUtil;
	}();

	/**
	 * @classdesc Represents the Identity. It allows the user to make call to the Identity API
	 * with a single function.
	 * @class
	 */

	var Identity = function () {
	  /**
	   * @constructor
	   * @param  {Object} options - An object containing the access token and the base URL
	   */
	  function Identity(options) {
	    _classCallCheck(this, Identity);

	    this.apiCall = new APICall(options);
	    this.keys = new IdentitiesKeyUtil(options);
	  }

	  /**
	   * @param  {String} params.identityChainId='' The chain id of the desired Identity.
	   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	   * with the Identity or an Error with the problem.
	   */


	  _createClass(Identity, [{
	    key: 'get',
	    value: function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
	        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	            _ref2$identityChainId = _ref2.identityChainId,
	            identityChainId = _ref2$identityChainId === undefined ? '' : _ref2$identityChainId;

	        var response;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (identityChainId) {
	                  _context.next = 2;
	                  break;
	                }

	                throw new Error('identityChainId is required.');

	              case 2:
	                _context.next = 4;
	                return this.apiCall.send(constants.GET_METHOD, constants.IDENTITIES_URL + '/' + identityChainId);

	              case 4:
	                response = _context.sent;
	                return _context.abrupt('return', response);

	              case 6:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function get() {
	        return _ref.apply(this, arguments);
	      }

	      return get;
	    }()

	    /**
	     * @param  {String[]} params.name=[]
	     * @param  {String[]} params.keys=[]
	     * @param  {String} params.callbackUrl=''
	     * @param  {String[]} params.callbackStages=[]
	     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	     * with the chain or an Error with the problem
	     */

	  }, {
	    key: 'create',
	    value: function () {
	      var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
	        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var keyPairs, signerKeys, i, pair, keysInvalid, duplicates, nameByteCounts, totalBytes, nameBase64, data, response;
	        return regenerator.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!CommonUtil.isEmptyArray(params.name)) {
	                  _context2.next = 2;
	                  break;
	                }

	                throw new Error('name is required.');

	              case 2:
	                if (Array.isArray(params.name)) {
	                  _context2.next = 4;
	                  break;
	                }

	                throw new Error('name must be an array.');

	              case 4:
	                keyPairs = [];
	                signerKeys = [];

	                if (!(typeof params.keys !== 'undefined')) {
	                  _context2.next = 14;
	                  break;
	                }

	                if (!CommonUtil.isEmptyArray(params.keys)) {
	                  _context2.next = 9;
	                  break;
	                }

	                throw new Error('at least 1 key is required.');

	              case 9:
	                if (Array.isArray(params.keys)) {
	                  _context2.next = 11;
	                  break;
	                }

	                throw new Error('keys must be an array.');

	              case 11:
	                signerKeys = params.keys;
	                _context2.next = 15;
	                break;

	              case 14:
	                for (i = 0; i < 3; i += 1) {
	                  pair = KeyCommon.createKeyPair();

	                  keyPairs.push(pair);
	                  signerKeys.push(pair.publicKey);
	                }

	              case 15:
	                if (!(params.callbackStages && !Array.isArray(params.callbackStages))) {
	                  _context2.next = 17;
	                  break;
	                }

	                throw new Error('callbackStages must be an array.');

	              case 17:
	                keysInvalid = KeyCommon.getInvalidKeys({ signerKeys: signerKeys });

	                if (!keysInvalid.length) {
	                  _context2.next = 20;
	                  break;
	                }

	                throw new Error(keysInvalid);

	              case 20:
	                duplicates = KeyCommon.getDuplicateKeys({ signerKeys: signerKeys });

	                if (!duplicates.length) {
	                  _context2.next = 23;
	                  break;
	                }

	                throw new Error(duplicates);

	              case 23:
	                if (!(!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl_1(params.callbackUrl))) {
	                  _context2.next = 25;
	                  break;
	                }

	                throw new Error('callbackUrl is an invalid url format.');

	              case 25:
	                nameByteCounts = 0;

	                params.name.forEach(function (o) {
	                  nameByteCounts += Buffer.from(o).length;
	                });

	                // 2 bytes for the size of extid + 13 for actual IdentityChain ext-id text
	                // 2 bytes per name for size * (number of names) + size of all names
	                // 23 bytes for `{"keys":[],"version":1}`
	                // 58 bytes per `"idpub2PHPArpDF6S86ys314D3JDiKD8HLqJ4HMFcjNJP6gxapoNsyFG",` array element
	                // -1 byte because last key element has no comma
	                // = 37 + name_byte_count + 2(number_of_names) + 58(number_of_keys)
	                totalBytes = 37 + nameByteCounts + 2 * params.name.length + signerKeys.length * 58;

	                if (!(totalBytes > 10240)) {
	                  _context2.next = 30;
	                  break;
	                }

	                throw new Error('calculated bytes of name and keys is ' + totalBytes + '. It must be less than 10240, use less/shorter name or less keys.');

	              case 30:
	                nameBase64 = [];

	                params.name.forEach(function (o) {
	                  nameBase64.push(Buffer.from(o.trim()).toString('base64'));
	                });

	                data = {
	                  name: nameBase64,
	                  keys: signerKeys
	                };


	                if (!CommonUtil.isEmptyString(params.callbackUrl)) {
	                  data.callback_url = params.callbackUrl;
	                }
	                if (Array.isArray(params.callbackStages)) {
	                  data.callback_stages = params.callbackStages;
	                }

	                _context2.next = 37;
	                return this.apiCall.send(constants.POST_METHOD, constants.IDENTITIES_URL, data);

	              case 37:
	                response = _context2.sent;

	                if (typeof params.keys === 'undefined') {
	                  response.key_pairs = keyPairs;
	                }

	                return _context2.abrupt('return', response);

	              case 40:
	              case 'end':
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function create() {
	        return _ref3.apply(this, arguments);
	      }

	      return create;
	    }()
	  }]);

	  return Identity;
	}();

	/**
	 * @classdesc Represents the Info. It allows the user to make call to the Info API
	 * with a single function.
	 * @class
	 */

	var Info = function () {
	  /**
	   * @constructor
	   * @param  {Object} options - An object containing the access token and the base URL
	   */
	  function Info(options) {
	    _classCallCheck(this, Info);

	    this.apiCall = new APICall(options);
	  }

	  /**
	   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
	   * with the Info or an Error with the problem.
	   */


	  _createClass(Info, [{
	    key: 'get',
	    value: function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
	        var response;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return this.apiCall.send(constants.GET_METHOD);

	              case 2:
	                response = _context.sent;
	                return _context.abrupt('return', response);

	              case 4:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function get() {
	        return _ref.apply(this, arguments);
	      }

	      return get;
	    }()
	  }]);

	  return Info;
	}();

	var Utils = function () {
	  function Utils() {
	    _classCallCheck(this, Utils);
	  }

	  _createClass(Utils, null, [{
	    key: 'generateKeyPair',

	    /**
	     * @return  {Object} Returns a key pair object
	     */
	    value: function generateKeyPair() {
	      return KeyCommon.createKeyPair();
	    }
	  }]);

	  return Utils;
	}();

	var FactomSDK =
	/**
	 * @constructor
	 * @param  {Object} options - An object containing the access token and the base URL
	 * @param  {String} options.baseUrl - The URL with the account domain
	 * @param  {String} options.accessToken.appId - The App Id
	 * @param  {String} options.accessToken.appKey - The App Key
	 */
	function FactomSDK(options) {
	  _classCallCheck(this, FactomSDK);

	  var automaticSigning = options.automaticSigning;

	  if (typeof automaticSigning !== 'boolean') {
	    automaticSigning = true;
	  }

	  this.options = {
	    baseUrl: options.baseUrl,
	    accessToken: {
	      appId: options.accessToken.appId,
	      appKey: options.accessToken.appKey
	    },
	    automaticSigning: automaticSigning
	  };

	  this.apiInfo = new Info(this.options);
	  this.chains = new Chains(this.options);
	  this.identities = new Identity(this.options);
	  this.utils = Utils;
	};

	return FactomSDK;

}());
