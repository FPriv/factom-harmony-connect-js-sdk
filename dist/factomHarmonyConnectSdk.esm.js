import isUrl from 'is-url';
import axios from 'axios';
import urlJoin from 'url-join';
import urlJoinQuery from 'url-join-query';
import secureRandom from 'secure-random';
import base58 from 'base-58';
import sha256 from 'js-sha256';
import elliptic from 'elliptic';

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

var toString = {}.toString;

var _cof = function (it) {
  return toString.call(it).slice(8, -1);
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

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO = _sharedKey('IE_PROTO');

var _objectKeysInternal = function (object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (_has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
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
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
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

var navigator = _global.navigator;

var _userAgent = navigator && navigator.userAgent || '';

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
_export(_export.S + _export.F * (_library), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return _promiseResolve(this === Wrapper ? $Promise : this, x);
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

unwrapExports(defineProperty$1);

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
  RECEIPTS_URL: 'receipts',
  ANCHORS_URL: 'anchors',
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
var toString$1 = {}.toString;

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
  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
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

unwrapExports(symbol$1);

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
        var arrayDecode = ['external_ids', 'content', 'names'];

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

    if (!isUrl(options.baseUrl)) throw new Error('The base URL provided is not valid.');
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
        var overrideBaseUrl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
        var overrideAccessToken = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var baseUrl, callURL, headers, body, response;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                baseUrl = overrideBaseUrl || this.baseUrl;

                if (isUrl(baseUrl)) {
                  _context.next = 3;
                  break;
                }

                throw new Error('The base URL provided for override is not valid.');

              case 3:
                callURL = urlJoin(baseUrl, url);
                headers = createAuthHeader(overrideAccessToken || this.accessToken);
                body = '';


                if (method === constants.POST_METHOD) {
                  body = data;
                } else if (_Object$keys(data).length && data.constructor === Object) {
                  callURL = urlJoinQuery(callURL, data);
                }
                _context.prev = 7;
                _context.next = 10;
                return axios(callURL, {
                  method: method,
                  data: body,
                  headers: headers
                });

              case 10:
                response = _context.sent;

                if (!(response.status >= 200 && response.status <= 202)) {
                  _context.next = 13;
                  break;
                }

                return _context.abrupt('return', CommonUtil.decodeResponse(response.data));

              case 13:
                if (!(response.status >= 400)) {
                  _context.next = 15;
                  break;
                }

                return _context.abrupt('return', _Promise.reject(new Error({
                  status: response.status,
                  message: response.statusText
                })));

              case 15:
                return _context.abrupt('return', {});

              case 18:
                _context.prev = 18;
                _context.t0 = _context['catch'](7);
                throw _context.t0;

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[7, 18]]);
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

var EdDSA = elliptic.eddsa;
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
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$rawPrivateKey = _ref.rawPrivateKey,
          rawPrivateKey = _ref$rawPrivateKey === undefined ? '' : _ref$rawPrivateKey;

      var privateKeyBytes = void 0;

      if (rawPrivateKey) {
        if (typeof rawPrivateKey === 'string' && rawPrivateKey.length === 32) {
          privateKeyBytes = Uint8Array.from(rawPrivateKey);
        } else {
          throw new Error('provided ed25519 private key is invalid.');
        }
      } else {
        privateKeyBytes = secureRandom.randomUint8Array(32);
      }

      var tmp = void 0;
      var checkSum = void 0;

      tmp = sha256.digest(sha256.digest([].concat(privatePrefixBytes, _toConsumableArray(privateKeyBytes))));
      checkSum = tmp.slice(0, 4);
      var generatedPrivateKey = base58.encode([].concat(privatePrefixBytes, _toConsumableArray(privateKeyBytes), _toConsumableArray(checkSum)));
      var publicKeyBytes = ec.keyFromSecret(privateKeyBytes).getPublic();
      tmp = sha256.digest(sha256.digest([].concat(publicPrefixBytes, _toConsumableArray(publicKeyBytes))));
      checkSum = tmp.slice(0, 4);
      var generatedPublicKey = base58.encode([].concat(publicPrefixBytes, _toConsumableArray(publicKeyBytes), _toConsumableArray(checkSum)));
      return {
        privateKey: generatedPrivateKey,
        publicKey: generatedPublicKey
      };
    }

    /**
     * @param  {String} params.signerKey='' - A base58 string in idpub or idsec format
     * @return  {Boolean} Validate checkSum. Will returns true if checkSum is equal.
     */

  }, {
    key: 'validateCheckSum',
    value: function validateCheckSum() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$signerKey = _ref2.signerKey,
          signerKey = _ref2$signerKey === undefined ? '' : _ref2$signerKey;

      if (!signerKey) {
        return false;
      }

      var signerKeyBytes = base58.decode(signerKey);
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

      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref3$signerKeys = _ref3.signerKeys,
          signerKeys = _ref3$signerKeys === undefined ? [] : _ref3$signerKeys;

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
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref4$signerKeys = _ref4.signerKeys,
          signerKeys = _ref4$signerKeys === undefined ? [] : _ref4$signerKeys;

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
    value: function getKeyBytesFromKey(_ref5) {
      var _ref5$signerKey = _ref5.signerKey,
          signerKey = _ref5$signerKey === undefined ? '' : _ref5$signerKey;

      if (!this.validateCheckSum({ signerKey: signerKey })) {
        throw new Error('key is invalid.');
      }

      var signerKeyBytes = base58.decode(signerKey);

      return signerKeyBytes.slice(5, 37);
    }

    /**
     * @param  {String} params.signerPrivateKey='' - A base58 string in idpub or idsec format
     * @return  {String} Returns a base58 string in idpub format
     */

  }, {
    key: 'getPublicKeyFromPrivateKey',
    value: function getPublicKeyFromPrivateKey() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref6$signerPrivateKe = _ref6.signerPrivateKey,
          signerPrivateKey = _ref6$signerPrivateKe === undefined ? '' : _ref6$signerPrivateKe;

      if (!this.validateCheckSum({ signerKey: signerPrivateKey })) {
        throw new Error('signerPrivateKey is invalid.');
      }

      var privateKeyBytes = this.getKeyBytesFromKey({ signerKey: signerPrivateKey });
      var publicKeyBytes = ec.keyFromSecret(privateKeyBytes).getPublic();
      var tmp = sha256.digest(sha256.digest([].concat(publicPrefixBytes, _toConsumableArray(publicKeyBytes))));
      var checkSum = tmp.slice(0, 4);
      return base58.encode([].concat(publicPrefixBytes, _toConsumableArray(publicKeyBytes), _toConsumableArray(checkSum)));
    }

    /**
     * @param  {String} params.privateKey='' - A base58 string in idsec format
     * @param  {String} params.message='' - A plain text.
     * @return  {String} Returns a base64 signature string format
     */

  }, {
    key: 'signContent',
    value: function signContent() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref7$signerPrivateKe = _ref7.signerPrivateKey,
          signerPrivateKey = _ref7$signerPrivateKe === undefined ? '' : _ref7$signerPrivateKe,
          _ref7$message = _ref7.message,
          message = _ref7$message === undefined ? '' : _ref7$message;

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
      var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref8$signerPublicKey = _ref8.signerPublicKey,
          signerPublicKey = _ref8$signerPublicKey === undefined ? '' : _ref8$signerPublicKey,
          _ref8$signature = _ref8.signature,
          signature = _ref8$signature === undefined ? '' : _ref8$signature,
          _ref8$message = _ref8.message,
          message = _ref8$message === undefined ? '' : _ref8$message;

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
            apiCall = _ref2.apiCall,
            baseUrl = _ref2.baseUrl,
            accessToken = _ref2.accessToken;

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

                // Hex signature always have length = 128.
                // And when convert it to base64, it always have length = 88

                if (!(externalIds.length < 6 || externalIds[0] !== typeName || externalIds[1] !== '0x01' || !KeyCommon.validateCheckSum({ signerKey: externalIds[3] }) || !(externalIds[4].length === 128 && Buffer.from(externalIds[4], 'hex').toString('base64').length === 88))) {
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
                return apiCall.send(constants.GET_METHOD, constants.IDENTITIES_URL + '/' + signerChainId + '/' + constants.KEYS_STRING + '/' + signerPublicKey, {}, baseUrl, accessToken);

              case 15:
                keyResponse = _context.sent;

                if (!(keyResponse.data.retired_height != null && !(keyResponse.data.activated_height <= keyHeight && keyHeight <= keyResponse.data.retired_height))) {
                  _context.next = 18;
                  break;
                }

                return _context.abrupt('return', 'retired_key');

              case 18:
                _context.next = 25;
                break;

              case 20:
                _context.prev = 20;
                _context.t0 = _context['catch'](12);

                if (!(_context.t0.response && _context.t0.response.status === 404)) {
                  _context.next = 24;
                  break;
                }

                return _context.abrupt('return', 'key_not_found');

              case 24:
                throw _context.t0;

              case 25:
                message = '' + signerChainId + obj.data.content + timeStamp;

                if (KeyCommon.validateSignature({
                  signerPublicKey: signerPublicKey,
                  signature: signature,
                  message: message
                })) {
                  _context.next = 28;
                  break;
                }

                return _context.abrupt('return', 'invalid_signature');

              case 28:
                return _context.abrupt('return', 'valid_signature');

              case 29:
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
                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL + '/' + params.entryHash, {}, params.baseUrl, params.accessToken);

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
                  apiCall: this.apiCall,
                  baseUrl: params.baseUrl,
                  accessToken: params.accessToken
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
                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL + '/' + constants.FIRST_URL, {}, params.baseUrl, params.accessToken);

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
                  apiCall: this.apiCall,
                  baseUrl: params.baseUrl,
                  accessToken: params.accessToken
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
                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL + '/' + constants.LAST_URL, {}, params.baseUrl, params.accessToken);

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
                  apiCall: this.apiCall,
                  baseUrl: params.baseUrl,
                  accessToken: params.accessToken
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
        var autoSign, idsBase64, timeStamp, message, signature, signerPublicKey, data, response;
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
                autoSign = this.automaticSigning;

                if (typeof params.automaticSigning === 'boolean') {
                  autoSign = params.automaticSigning;
                }

                if (!autoSign) {
                  _context4.next = 15;
                  break;
                }

                if (!(params.externalIds && !Array.isArray(params.externalIds))) {
                  _context4.next = 7;
                  break;
                }

                throw new Error('externalIds must be an array.');

              case 7:
                if (!CommonUtil.isEmptyString(params.signerPrivateKey)) {
                  _context4.next = 9;
                  break;
                }

                throw new Error('signerPrivateKey is required.');

              case 9:
                if (KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey })) {
                  _context4.next = 11;
                  break;
                }

                throw new Error('signerPrivateKey is invalid.');

              case 11:
                if (!CommonUtil.isEmptyString(params.signerChainId)) {
                  _context4.next = 13;
                  break;
                }

                throw new Error('signerChainId is required.');

              case 13:
                _context4.next = 25;
                break;

              case 15:
                if (!CommonUtil.isEmptyArray(params.externalIds)) {
                  _context4.next = 17;
                  break;
                }

                throw new Error('at least 1 externalId is required.');

              case 17:
                if (Array.isArray(params.externalIds)) {
                  _context4.next = 19;
                  break;
                }

                throw new Error('externalIds must be an array.');

              case 19:
                if (!(params.signerPrivateKey && CommonUtil.isEmptyString(params.signerChainId))) {
                  _context4.next = 21;
                  break;
                }

                throw new Error('signerChainId is required when passing a signerPrivateKey.');

              case 21:
                if (!(params.signerPrivateKey && !KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey }))) {
                  _context4.next = 23;
                  break;
                }

                throw new Error('signerPrivateKey is invalid.');

              case 23:
                if (!(params.signerChainId && CommonUtil.isEmptyString(params.signerPrivateKey))) {
                  _context4.next = 25;
                  break;
                }

                throw new Error('signerPrivateKey is required when passing a signerChainId.');

              case 25:
                if (!CommonUtil.isEmptyString(params.content)) {
                  _context4.next = 27;
                  break;
                }

                throw new Error('content is required.');

              case 27:
                if (!(!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl))) {
                  _context4.next = 29;
                  break;
                }

                throw new Error('callbackUrl is an invalid url format.');

              case 29:
                if (!(params.callbackStages && !Array.isArray(params.callbackStages))) {
                  _context4.next = 31;
                  break;
                }

                throw new Error('callbackStages must be an array.');

              case 31:
                idsBase64 = [];

                if (autoSign) {
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

                _context4.next = 39;
                return this.apiCall.send(constants.POST_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL, data, params.baseUrl, params.accessToken);

              case 39:
                response = _context4.sent;
                return _context4.abrupt('return', response);

              case 41:
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
                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId + '/' + constants.ENTRIES_URL, data, params.baseUrl, params.accessToken);

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
                return this.apiCall.send(constants.POST_METHOD, url, data, params.baseUrl, params.accessToken);

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
                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL + '/' + params.chainId, {}, params.baseUrl, params.accessToken);

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
                  apiCall: this.apiCall,
                  baseUrl: params.baseUrl,
                  accessToken: params.accessToken
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
        var autoSign, idsBase64, timeStamp, message, signature, signerPublicKey, data, response;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                autoSign = this.automaticSigning;

                if (typeof params.automaticSigning === 'boolean') {
                  autoSign = params.automaticSigning;
                }

                if (!autoSign) {
                  _context2.next = 13;
                  break;
                }

                if (!(params.externalIds && !Array.isArray(params.externalIds))) {
                  _context2.next = 5;
                  break;
                }

                throw new Error('externalIds must be an array.');

              case 5:
                if (!CommonUtil.isEmptyString(params.signerPrivateKey)) {
                  _context2.next = 7;
                  break;
                }

                throw new Error('signerPrivateKey is required.');

              case 7:
                if (KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey })) {
                  _context2.next = 9;
                  break;
                }

                throw new Error('signerPrivateKey is invalid.');

              case 9:
                if (!CommonUtil.isEmptyString(params.signerChainId)) {
                  _context2.next = 11;
                  break;
                }

                throw new Error('signerChainId is required.');

              case 11:
                _context2.next = 23;
                break;

              case 13:
                if (!CommonUtil.isEmptyArray(params.externalIds)) {
                  _context2.next = 15;
                  break;
                }

                throw new Error('at least 1 externalId is required.');

              case 15:
                if (Array.isArray(params.externalIds)) {
                  _context2.next = 17;
                  break;
                }

                throw new Error('externalIds must be an array.');

              case 17:
                if (!(params.signerPrivateKey && CommonUtil.isEmptyString(params.signerChainId))) {
                  _context2.next = 19;
                  break;
                }

                throw new Error('signerChainId is required when passing a signerPrivateKey.');

              case 19:
                if (!(params.signerPrivateKey && !KeyCommon.validateCheckSum({ signerKey: params.signerPrivateKey }))) {
                  _context2.next = 21;
                  break;
                }

                throw new Error('signerPrivateKey is invalid.');

              case 21:
                if (!(params.signerChainId && CommonUtil.isEmptyString(params.signerPrivateKey))) {
                  _context2.next = 23;
                  break;
                }

                throw new Error('signerPrivateKey is required when passing a signerChainId.');

              case 23:
                if (!CommonUtil.isEmptyString(params.content)) {
                  _context2.next = 25;
                  break;
                }

                throw new Error('content is required.');

              case 25:
                if (!(!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl))) {
                  _context2.next = 27;
                  break;
                }

                throw new Error('callbackUrl is an invalid url format.');

              case 27:
                if (!(params.callbackStages && !Array.isArray(params.callbackStages))) {
                  _context2.next = 29;
                  break;
                }

                throw new Error('callbackStages must be an array.');

              case 29:
                idsBase64 = [];


                if (autoSign) {
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

                _context2.next = 37;
                return this.apiCall.send(constants.POST_METHOD, constants.CHAINS_URL, data, params.baseUrl, params.accessToken);

              case 37:
                response = _context2.sent;
                return _context2.abrupt('return', response);

              case 39:
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
                return this.apiCall.send(constants.GET_METHOD, constants.CHAINS_URL, data, params.baseUrl, params.accessToken);

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
                return this.apiCall.send(constants.POST_METHOD, url, data, params.baseUrl, params.accessToken);

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
   * @param  {String} params.key
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
                if (!CommonUtil.isEmptyString(params.key)) {
                  _context.next = 4;
                  break;
                }

                throw new Error('key is required.');

              case 4:
                if (KeyCommon.validateCheckSum({ signerKey: params.key })) {
                  _context.next = 6;
                  break;
                }

                throw new Error('key is invalid.');

              case 6:
                _context.next = 8;
                return this.apiCall.send(constants.GET_METHOD, constants.IDENTITIES_URL + '/' + params.identityChainId + '/' + constants.KEYS_STRING + '/' + params.key, {}, params.baseUrl, params.accessToken);

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

        var limit, offset, data, response;
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
                limit = params.limit, offset = params.offset;
                data = {};

                if (!limit) {
                  _context2.next = 8;
                  break;
                }

                if (_Number$isInteger(limit)) {
                  _context2.next = 7;
                  break;
                }

                throw new Error('limit must be an integer.');

              case 7:
                data.limit = limit;

              case 8:
                if (!offset) {
                  _context2.next = 12;
                  break;
                }

                if (_Number$isInteger(offset)) {
                  _context2.next = 11;
                  break;
                }

                throw new Error('offset must be an integer.');

              case 11:
                data.offset = offset;

              case 12:
                _context2.next = 14;
                return this.apiCall.send(constants.GET_METHOD, constants.IDENTITIES_URL + '/' + identityChainId + '/' + constants.KEYS_STRING, data, params.baseUrl, params.accessToken);

              case 14:
                response = _context2.sent;
                return _context2.abrupt('return', response);

              case 16:
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
                if (!(!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl))) {
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
                return this.apiCall.send(constants.POST_METHOD, constants.IDENTITIES_URL + '/' + identityChainId + '/' + constants.KEYS_STRING, data, params.baseUrl, params.accessToken);

              case 34:
                response = _context3.sent;


                if (typeof params.newPublicKey === 'undefined') {
                  response.key_pair = {
                    public_key: keyPair.publicKey,
                    private_key: keyPair.privateKey
                  };
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
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var response;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (params.identityChainId) {
                  _context.next = 2;
                  break;
                }

                throw new Error('identityChainId is required.');

              case 2:
                _context.next = 4;
                return this.apiCall.send(constants.GET_METHOD, constants.IDENTITIES_URL + '/' + params.identityChainId, {}, params.baseUrl, params.accessToken);

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
     * @param  {String[]} params.names=[]
     * @param  {String[]} params.keys=[]
     * @param  {String} params.callbackUrl=''
     * @param  {String[]} params.callbackStages=[]
     * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
     * with the chain or an Error with the problem
     */

  }, {
    key: 'create',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var keyPairs, signerKeys, i, pair, keysInvalid, duplicates, nameByteCounts, totalBytes, namesBase64, data, response, pairs;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!CommonUtil.isEmptyArray(params.names)) {
                  _context2.next = 2;
                  break;
                }

                throw new Error('at least 1 name is required.');

              case 2:
                if (Array.isArray(params.names)) {
                  _context2.next = 4;
                  break;
                }

                throw new Error('names must be an array.');

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
                if (!(!CommonUtil.isEmptyString(params.callbackUrl) && !isUrl(params.callbackUrl))) {
                  _context2.next = 25;
                  break;
                }

                throw new Error('callbackUrl is an invalid url format.');

              case 25:
                nameByteCounts = 0;

                params.names.forEach(function (o) {
                  nameByteCounts += Buffer.from(o).length;
                });

                // 2 bytes for the size of extid + 13 for actual IdentityChain ext-id text
                // 2 bytes per name for size * (number of names) + size of all names
                // 23 bytes for `{"keys":[],"version":1}`
                // 58 bytes per `"idpub2PHPArpDF6S86ys314D3JDiKD8HLqJ4HMFcjNJP6gxapoNsyFG",` array element
                // -1 byte because last key element has no comma
                // = 37 + name_byte_count + 2(number_of_names) + 58(number_of_keys)
                totalBytes = 37 + nameByteCounts + 2 * params.names.length + signerKeys.length * 58;

                if (!(totalBytes > 10240)) {
                  _context2.next = 30;
                  break;
                }

                throw new Error('calculated bytes of names and keys is ' + totalBytes + '. It must be less than 10240, use less/shorter names or less keys.');

              case 30:
                namesBase64 = [];

                params.names.forEach(function (o) {
                  namesBase64.push(Buffer.from(o.trim()).toString('base64'));
                });

                data = {
                  names: namesBase64,
                  keys: signerKeys
                };


                if (!CommonUtil.isEmptyString(params.callbackUrl)) {
                  data.callback_url = params.callbackUrl;
                }
                if (Array.isArray(params.callbackStages)) {
                  data.callback_stages = params.callbackStages;
                }

                _context2.next = 37;
                return this.apiCall.send(constants.POST_METHOD, constants.IDENTITIES_URL, data, params.baseUrl, params.accessToken);

              case 37:
                response = _context2.sent;

                if (typeof params.keys === 'undefined') {
                  pairs = [];

                  keyPairs.forEach(function (i) {
                    pairs.push({
                      public_key: i.publicKey,
                      private_key: i.privateKey
                    });
                  });
                  response.key_pairs = pairs;
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
        return _ref2.apply(this, arguments);
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
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var response;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.apiCall.send(constants.GET_METHOD, '', {}, params.baseUrl, params.accessToken);

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

/**
 * @classdesc Represents the Receipts. It allows the user to make call to the Receipts API
 * with a single function.
 * @class
 */

var Receipts = function () {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  function Receipts(options) {
    _classCallCheck(this, Receipts);

    this.apiCall = new APICall(options);
    this.automaticSigning = options.automaticSigning;
  }

  /**
   * @param  {String} params.entryHash=''
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */


  _createClass(Receipts, [{
    key: 'get',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var response;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!CommonUtil.isEmptyString(params.entryHash)) {
                  _context.next = 2;
                  break;
                }

                throw new Error('entryHash is required.');

              case 2:
                _context.next = 4;
                return this.apiCall.send(constants.GET_METHOD, constants.RECEIPTS_URL + '/' + params.entryHash, {}, params.baseUrl, params.accessToken);

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
  }]);

  return Receipts;
}();

/**
 * @classdesc Represents the Anchors. It allows the user to make call to the Anchors API
 * with a single function.
 * @class
 */

var Anchors = function () {
  /**
   * @constructor
   * @param  {Object} options - An object containing the access token and the base URL
   */
  function Anchors(options) {
    _classCallCheck(this, Anchors);

    this.apiCall = new APICall(options);
    this.automaticSigning = options.automaticSigning;
  }

  /**
   * @param  {String} params.objectIdentifier = The entry hash, chain id, directory block height,
   * directory block keymr, entry block keymr, or facotid block keymr
   * being used to queryanchors
   * @param  {Boolean | Function} params.signatureValidation The signature validation may
   * be True/False or callback function
   * @return  {Promise} Returns a Promise that, when fulfilled, will either return an Object
   * with the Chain Info or an Error with the problem.
   */


  _createClass(Anchors, [{
    key: 'get',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var response;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!CommonUtil.isEmptyString(params.objectIdentifier)) {
                  _context.next = 2;
                  break;
                }

                throw new Error('objectIdentifier is required.');

              case 2:
                if (!(!(!isNaN(params.objectIdentifier) && Number(params.objectIdentifier) > 0) && params.objectIdentifier.length !== 64)) {
                  _context.next = 4;
                  break;
                }

                throw new Error('objectIdentifier is in an invalid format.');

              case 4:
                _context.next = 6;
                return this.apiCall.send(constants.GET_METHOD, constants.ANCHORS_URL + '/' + params.objectIdentifier, {}, params.baseUrl, params.accessToken);

              case 6:
                response = _context.sent;
                return _context.abrupt('return', response);

              case 8:
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

  return Anchors;
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

    /**
     * @param  {String} params.rawPrivateKey='' - A base58 string in idpub or idsec format
     * @return  {Buffer} Returns key bytes array
     */

  }, {
    key: 'convertRawToKeyPair',
    value: function convertRawToKeyPair(params) {
      return KeyCommon.createKeyPair(params);
    }

    /**
     * @param  {String} params.signerKey='' - A base58 string in idpub or idsec format
     * @return  {Buffer} Returns key bytes array
     */

  }, {
    key: 'convertToRaw',
    value: function convertToRaw(params) {
      return KeyCommon.getKeyBytesFromKey(params);
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
  this.receipts = new Receipts(this.options);
  this.anchors = new Anchors(this.options);
  this.utils = Utils;
};

export default FactomSDK;
