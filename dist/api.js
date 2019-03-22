'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _isUrl = require('is-url');

var _isUrl2 = _interopRequireDefault(_isUrl);

var _properUrlJoin = require('proper-url-join');

var _properUrlJoin2 = _interopRequireDefault(_properUrlJoin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createAuthHeader = function createAuthHeader(accessToken) {
  return {
    app_id: accessToken.app_id,
    app_key: accessToken.app_key,
    'Content-Type': 'application/json'
  };
};

var APICall = function () {
  function APICall(options) {
    _classCallCheck(this, APICall);

    if (!(0, _isUrl2.default)(options.baseURL)) throw new Error('The base URL provided is not valid.');
    if (!options.accessToken) throw new Error('The accessToken is required.');

    this.baseURL = options.baseURL;
    this.accessToken = options.accessToken;
  }

  _createClass(APICall, [{
    key: 'send',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(method, url) {
        var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var callURL, headers, body, response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                callURL = (0, _properUrlJoin2.default)(this.baseURL, url);
                headers = createAuthHeader(this.accessToken);
                body = '';


                if (method === 'POST') {
                  body = data;
                } else if (Object.keys(data).length && data.constructor === Object) {
                  callURL = (0, _properUrlJoin2.default)(callURL, { trailingSlash: false, query: data });
                }
                _context.prev = 4;
                _context.next = 7;
                return (0, _axios2.default)(callURL, {
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

                return _context.abrupt('return', response.data);

              case 10:
                if (!(response.status >= 400)) {
                  _context.next = 12;
                  break;
                }

                return _context.abrupt('return', Promise.reject(new Error({
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

      function send(_x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return send;
    }()
  }]);

  return APICall;
}();

exports.default = APICall;