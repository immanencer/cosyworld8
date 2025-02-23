var Checkout = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x3) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x3, {
    get: (a4, b) => (typeof require !== "undefined" ? require : a4)[b]
  }) : x3)(function(x3) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x3 + '" is not supported');
  });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/react/cjs/react.production.js
  var require_react_production = __commonJS({
    "node_modules/react/cjs/react.production.js"(exports) {
      "use strict";
      var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
      var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
      var REACT_CONTEXT_TYPE = Symbol.for("react.context");
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
      var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
      var REACT_MEMO_TYPE = Symbol.for("react.memo");
      var REACT_LAZY_TYPE = Symbol.for("react.lazy");
      var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      var ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function() {
        },
        enqueueReplaceState: function() {
        },
        enqueueSetState: function() {
        }
      };
      var assign = Object.assign;
      var emptyObject = {};
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      function ComponentDummy() {
      }
      ComponentDummy.prototype = Component.prototype;
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
      pureComponentPrototype.constructor = PureComponent;
      assign(pureComponentPrototype, Component.prototype);
      pureComponentPrototype.isPureReactComponent = true;
      var isArrayImpl = Array.isArray;
      var ReactSharedInternals = { H: null, A: null, T: null, S: null };
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      function ReactElement(type, key, self2, source, owner, props) {
        self2 = props.ref;
        return {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          ref: void 0 !== self2 ? self2 : null,
          props
        };
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        return ReactElement(
          oldElement.type,
          newKey,
          void 0,
          void 0,
          void 0,
          oldElement.props
        );
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      var userProvidedKeyEscapeRegex = /\/+/g;
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
      }
      function noop$1() {
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop$1, noop$1) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback)
          return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c2) {
            return c2;
          })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + invokeCallback
          )), array.push(callback)), 1;
        invokeCallback = 0;
        var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i8 = 0; i8 < children.length; i8++)
            nameSoFar = children[i8], type = nextNamePrefix + getElementKey(nameSoFar, i8), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i8 = getIteratorFn(children), "function" === typeof i8)
          for (children = i8.call(children), i8 = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i8++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ctor = payload._result;
          ctor = ctor();
          ctor.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status)
                payload._status = 1, payload._result = moduleObject;
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status)
                payload._status = 2, payload._result = error;
            }
          );
          -1 === payload._status && (payload._status = 0, payload._result = ctor);
        }
        if (1 === payload._status) return payload._result.default;
        throw payload._result;
      }
      var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      };
      function noop() {
      }
      exports.Children = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n7 = 0;
          mapChildren(children, function() {
            n7++;
          });
          return n7;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.act = function() {
        throw Error("act(...) is not supported in production builds of React.");
      };
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = void 0;
        if (null != config)
          for (propName in void 0 !== config.ref && (owner = void 0), void 0 !== config.key && (key = "" + config.key), config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          for (var childArray = Array(propName), i8 = 0; i8 < propName; i8++)
            childArray[i8] = arguments[i8 + 2];
          props.children = childArray;
        }
        return ReactElement(element.type, key, void 0, void 0, owner, props);
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        var propName, props = {}, key = null;
        if (null != config)
          for (propName in void 0 !== config.key && (key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) props.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), i8 = 0; i8 < childrenLength; i8++)
            childArray[i8] = arguments[i8 + 2];
          props.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === props[propName] && (props[propName] = childrenLength[propName]);
        return ReactElement(type, key, void 0, void 0, null, props);
      };
      exports.createRef = function() {
        return { current: null };
      };
      exports.forwardRef = function(render) {
        return { $$typeof: REACT_FORWARD_REF_TYPE, render };
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        return {
          $$typeof: REACT_LAZY_TYPE,
          _payload: { _status: -1, _result: ctor },
          _init: lazyInitializer
        };
      };
      exports.memo = function(type, compare) {
        return {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
      };
      exports.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
        } catch (error) {
          reportGlobalError(error);
        } finally {
          ReactSharedInternals.T = prevTransition;
        }
      };
      exports.unstable_useCacheRefresh = function() {
        return ReactSharedInternals.H.useCacheRefresh();
      };
      exports.use = function(usable) {
        return ReactSharedInternals.H.use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return ReactSharedInternals.H.useActionState(action, initialState, permalink);
      };
      exports.useCallback = function(callback, deps) {
        return ReactSharedInternals.H.useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        return ReactSharedInternals.H.useContext(Context);
      };
      exports.useDebugValue = function() {
      };
      exports.useDeferredValue = function(value, initialValue) {
        return ReactSharedInternals.H.useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create, deps) {
        return ReactSharedInternals.H.useEffect(create, deps);
      };
      exports.useId = function() {
        return ReactSharedInternals.H.useId();
      };
      exports.useImperativeHandle = function(ref, create, deps) {
        return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
      };
      exports.useInsertionEffect = function(create, deps) {
        return ReactSharedInternals.H.useInsertionEffect(create, deps);
      };
      exports.useLayoutEffect = function(create, deps) {
        return ReactSharedInternals.H.useLayoutEffect(create, deps);
      };
      exports.useMemo = function(create, deps) {
        return ReactSharedInternals.H.useMemo(create, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return ReactSharedInternals.H.useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return ReactSharedInternals.H.useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return ReactSharedInternals.H.useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return ReactSharedInternals.H.useTransition();
      };
      exports.version = "19.0.0";
    }
  });

  // node_modules/react/index.js
  var require_react = __commonJS({
    "node_modules/react/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_production();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/@crossmint/client-sdk-react-ui/dist/chunk-PXDN3KFO.js
  var o, p, q, f, k, l, j, r, s, t;
  var init_chunk_PXDN3KFO = __esm({
    "node_modules/@crossmint/client-sdk-react-ui/dist/chunk-PXDN3KFO.js"() {
      o = Object.defineProperty;
      p = Object.defineProperties;
      q = Object.getOwnPropertyDescriptors;
      f = Object.getOwnPropertySymbols;
      k = Object.prototype.hasOwnProperty;
      l = Object.prototype.propertyIsEnumerable;
      j = (a4, c2, b) => c2 in a4 ? o(a4, c2, { enumerable: true, configurable: true, writable: true, value: b }) : a4[c2] = b;
      r = (a4, c2) => {
        for (var b in c2 || (c2 = {})) k.call(c2, b) && j(a4, b, c2[b]);
        if (f) for (var b of f(c2)) l.call(c2, b) && j(a4, b, c2[b]);
        return a4;
      };
      s = (a4, c2) => p(a4, q(c2));
      t = (a4, c2) => {
        var b = {};
        for (var d4 in a4) k.call(a4, d4) && c2.indexOf(d4) < 0 && (b[d4] = a4[d4]);
        if (a4 != null && f) for (var d4 of f(a4)) c2.indexOf(d4) < 0 && l.call(a4, d4) && (b[d4] = a4[d4]);
        return b;
      };
    }
  });

  // node_modules/@crossmint/client-sdk-react-ui/dist/chunk-JTKHTX3B.js
  var s2, r2;
  var init_chunk_JTKHTX3B = __esm({
    "node_modules/@crossmint/client-sdk-react-ui/dist/chunk-JTKHTX3B.js"() {
      s2 = "1.14.9";
      r2 = s2;
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-22GIA4MK.js
  var m, n, o2, h, p2, q2, i, r3, s3, t2;
  var init_chunk_22GIA4MK = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-22GIA4MK.js"() {
      m = Object.defineProperty;
      n = Object.defineProperties;
      o2 = Object.getOwnPropertyDescriptors;
      h = Object.getOwnPropertySymbols;
      p2 = Object.prototype.hasOwnProperty;
      q2 = Object.prototype.propertyIsEnumerable;
      i = (c2, b, a4) => b in c2 ? m(c2, b, { enumerable: true, configurable: true, writable: true, value: a4 }) : c2[b] = a4;
      r3 = (c2, b) => {
        for (var a4 in b || (b = {})) p2.call(b, a4) && i(c2, a4, b[a4]);
        if (h) for (var a4 of h(b)) q2.call(b, a4) && i(c2, a4, b[a4]);
        return c2;
      };
      s3 = (c2, b) => n(c2, o2(b));
      t2 = (c2, b, a4) => new Promise((j4, g5) => {
        var k5 = (d4) => {
          try {
            e8(a4.next(d4));
          } catch (f3) {
            g5(f3);
          }
        }, l5 = (d4) => {
          try {
            e8(a4.throw(d4));
          } catch (f3) {
            g5(f3);
          }
        }, e8 = (d4) => d4.done ? j4(d4.value) : Promise.resolve(d4.value).then(k5, l5);
        e8((a4 = a4.apply(c2, b)).next());
      });
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-4RWQEYZX.js
  var o3, _;
  var init_chunk_4RWQEYZX = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-4RWQEYZX.js"() {
      o3 = "3hSfN4dWSwgCg1uf2yytBtK6KxK3ySFKasd2h9J2vSK5";
      _ = "8erZh8YApGck3iUSUHqATBxqMTM1Ukp9mHmvGgUWHtkK";
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-WBULM2SU.js
  function I(t21) {
    switch (t21) {
      case "development":
      case "staging":
        return o3;
      case "production":
        return _;
      default:
        return null;
    }
  }
  var init_chunk_WBULM2SU = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-WBULM2SU.js"() {
      init_chunk_4RWQEYZX();
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-U4QEE6R5.js
  function g(e8) {
    return e8 === "client" ? "ck" : "sk";
  }
  var init_chunk_U4QEE6R5 = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-U4QEE6R5.js"() {
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-XAJGDBTH.js
  var r4, n2, t3;
  var init_chunk_XAJGDBTH = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-XAJGDBTH.js"() {
      r4 = { CLIENT: "ck", SERVER: "sk" };
      n2 = { DEVELOPMENT: "development", STAGING: "staging", PRODUCTION: "production" };
      t3 = { CLIENT: "client", SERVER: "server" };
    }
  });

  // node_modules/@crossmint/common-sdk-base/node_modules/base-x/src/index.js
  var require_src = __commonJS({
    "node_modules/@crossmint/common-sdk-base/node_modules/base-x/src/index.js"(exports, module) {
      "use strict";
      function base(ALPHABET) {
        if (ALPHABET.length >= 255) {
          throw new TypeError("Alphabet too long");
        }
        var BASE_MAP = new Uint8Array(256);
        for (var j4 = 0; j4 < BASE_MAP.length; j4++) {
          BASE_MAP[j4] = 255;
        }
        for (var i8 = 0; i8 < ALPHABET.length; i8++) {
          var x3 = ALPHABET.charAt(i8);
          var xc = x3.charCodeAt(0);
          if (BASE_MAP[xc] !== 255) {
            throw new TypeError(x3 + " is ambiguous");
          }
          BASE_MAP[xc] = i8;
        }
        var BASE = ALPHABET.length;
        var LEADER = ALPHABET.charAt(0);
        var FACTOR = Math.log(BASE) / Math.log(256);
        var iFACTOR = Math.log(256) / Math.log(BASE);
        function encode(source) {
          if (source instanceof Uint8Array) {
          } else if (ArrayBuffer.isView(source)) {
            source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
          } else if (Array.isArray(source)) {
            source = Uint8Array.from(source);
          }
          if (!(source instanceof Uint8Array)) {
            throw new TypeError("Expected Uint8Array");
          }
          if (source.length === 0) {
            return "";
          }
          var zeroes = 0;
          var length = 0;
          var pbegin = 0;
          var pend = source.length;
          while (pbegin !== pend && source[pbegin] === 0) {
            pbegin++;
            zeroes++;
          }
          var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
          var b58 = new Uint8Array(size);
          while (pbegin !== pend) {
            var carry = source[pbegin];
            var i9 = 0;
            for (var it1 = size - 1; (carry !== 0 || i9 < length) && it1 !== -1; it1--, i9++) {
              carry += 256 * b58[it1] >>> 0;
              b58[it1] = carry % BASE >>> 0;
              carry = carry / BASE >>> 0;
            }
            if (carry !== 0) {
              throw new Error("Non-zero carry");
            }
            length = i9;
            pbegin++;
          }
          var it2 = size - length;
          while (it2 !== size && b58[it2] === 0) {
            it2++;
          }
          var str = LEADER.repeat(zeroes);
          for (; it2 < size; ++it2) {
            str += ALPHABET.charAt(b58[it2]);
          }
          return str;
        }
        function decodeUnsafe(source) {
          if (typeof source !== "string") {
            throw new TypeError("Expected String");
          }
          if (source.length === 0) {
            return new Uint8Array();
          }
          var psz = 0;
          var zeroes = 0;
          var length = 0;
          while (source[psz] === LEADER) {
            zeroes++;
            psz++;
          }
          var size = (source.length - psz) * FACTOR + 1 >>> 0;
          var b256 = new Uint8Array(size);
          while (source[psz]) {
            var carry = BASE_MAP[source.charCodeAt(psz)];
            if (carry === 255) {
              return;
            }
            var i9 = 0;
            for (var it3 = size - 1; (carry !== 0 || i9 < length) && it3 !== -1; it3--, i9++) {
              carry += BASE * b256[it3] >>> 0;
              b256[it3] = carry % 256 >>> 0;
              carry = carry / 256 >>> 0;
            }
            if (carry !== 0) {
              throw new Error("Non-zero carry");
            }
            length = i9;
            psz++;
          }
          var it4 = size - length;
          while (it4 !== size && b256[it4] === 0) {
            it4++;
          }
          var vch = new Uint8Array(zeroes + (size - it4));
          var j5 = zeroes;
          while (it4 !== size) {
            vch[j5++] = b256[it4++];
          }
          return vch;
        }
        function decode(string) {
          var buffer = decodeUnsafe(string);
          if (buffer) {
            return buffer;
          }
          throw new Error("Non-base" + BASE + " character");
        }
        return {
          encode,
          decodeUnsafe,
          decode
        };
      }
      module.exports = base;
    }
  });

  // node_modules/@crossmint/common-sdk-base/node_modules/bs58/index.js
  var require_bs58 = __commonJS({
    "node_modules/@crossmint/common-sdk-base/node_modules/bs58/index.js"(exports, module) {
      var basex = require_src();
      var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      module.exports = basex(ALPHABET);
    }
  });

  // (disabled):crypto
  var require_crypto = __commonJS({
    "(disabled):crypto"() {
    }
  });

  // node_modules/tweetnacl/nacl-fast.js
  var require_nacl_fast = __commonJS({
    "node_modules/tweetnacl/nacl-fast.js"(exports, module) {
      (function(nacl) {
        "use strict";
        var gf = function(init) {
          var i8, r17 = new Float64Array(16);
          if (init) for (i8 = 0; i8 < init.length; i8++) r17[i8] = init[i8];
          return r17;
        };
        var randombytes = function() {
          throw new Error("no PRNG");
        };
        var _0 = new Uint8Array(16);
        var _9 = new Uint8Array(32);
        _9[0] = 9;
        var gf0 = gf(), gf1 = gf([1]), _121665 = gf([56129, 1]), D2 = gf([30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139, 11119, 27886, 20995]), D22 = gf([61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239, 55772, 9222]), X = gf([54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502, 52590, 14035, 8553]), Y = gf([26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214]), I4 = gf([41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099, 20417, 9344, 11139]);
        function ts64(x3, i8, h4, l5) {
          x3[i8] = h4 >> 24 & 255;
          x3[i8 + 1] = h4 >> 16 & 255;
          x3[i8 + 2] = h4 >> 8 & 255;
          x3[i8 + 3] = h4 & 255;
          x3[i8 + 4] = l5 >> 24 & 255;
          x3[i8 + 5] = l5 >> 16 & 255;
          x3[i8 + 6] = l5 >> 8 & 255;
          x3[i8 + 7] = l5 & 255;
        }
        function vn(x3, xi, y3, yi, n7) {
          var i8, d4 = 0;
          for (i8 = 0; i8 < n7; i8++) d4 |= x3[xi + i8] ^ y3[yi + i8];
          return (1 & d4 - 1 >>> 8) - 1;
        }
        function crypto_verify_16(x3, xi, y3, yi) {
          return vn(x3, xi, y3, yi, 16);
        }
        function crypto_verify_32(x3, xi, y3, yi) {
          return vn(x3, xi, y3, yi, 32);
        }
        function core_salsa20(o9, p5, k5, c2) {
          var j0 = c2[0] & 255 | (c2[1] & 255) << 8 | (c2[2] & 255) << 16 | (c2[3] & 255) << 24, j1 = k5[0] & 255 | (k5[1] & 255) << 8 | (k5[2] & 255) << 16 | (k5[3] & 255) << 24, j22 = k5[4] & 255 | (k5[5] & 255) << 8 | (k5[6] & 255) << 16 | (k5[7] & 255) << 24, j32 = k5[8] & 255 | (k5[9] & 255) << 8 | (k5[10] & 255) << 16 | (k5[11] & 255) << 24, j4 = k5[12] & 255 | (k5[13] & 255) << 8 | (k5[14] & 255) << 16 | (k5[15] & 255) << 24, j5 = c2[4] & 255 | (c2[5] & 255) << 8 | (c2[6] & 255) << 16 | (c2[7] & 255) << 24, j6 = p5[0] & 255 | (p5[1] & 255) << 8 | (p5[2] & 255) << 16 | (p5[3] & 255) << 24, j7 = p5[4] & 255 | (p5[5] & 255) << 8 | (p5[6] & 255) << 16 | (p5[7] & 255) << 24, j8 = p5[8] & 255 | (p5[9] & 255) << 8 | (p5[10] & 255) << 16 | (p5[11] & 255) << 24, j9 = p5[12] & 255 | (p5[13] & 255) << 8 | (p5[14] & 255) << 16 | (p5[15] & 255) << 24, j10 = c2[8] & 255 | (c2[9] & 255) << 8 | (c2[10] & 255) << 16 | (c2[11] & 255) << 24, j11 = k5[16] & 255 | (k5[17] & 255) << 8 | (k5[18] & 255) << 16 | (k5[19] & 255) << 24, j12 = k5[20] & 255 | (k5[21] & 255) << 8 | (k5[22] & 255) << 16 | (k5[23] & 255) << 24, j13 = k5[24] & 255 | (k5[25] & 255) << 8 | (k5[26] & 255) << 16 | (k5[27] & 255) << 24, j14 = k5[28] & 255 | (k5[29] & 255) << 8 | (k5[30] & 255) << 16 | (k5[31] & 255) << 24, j15 = c2[12] & 255 | (c2[13] & 255) << 8 | (c2[14] & 255) << 16 | (c2[15] & 255) << 24;
          var x0 = j0, x1 = j1, x22 = j22, x3 = j32, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u4;
          for (var i8 = 0; i8 < 20; i8 += 2) {
            u4 = x0 + x12 | 0;
            x4 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x4 + x0 | 0;
            x8 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x8 + x4 | 0;
            x12 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x12 + x8 | 0;
            x0 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x5 + x1 | 0;
            x9 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x9 + x5 | 0;
            x13 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x13 + x9 | 0;
            x1 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x1 + x13 | 0;
            x5 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x10 + x6 | 0;
            x14 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x14 + x10 | 0;
            x22 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x22 + x14 | 0;
            x6 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x6 + x22 | 0;
            x10 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x15 + x11 | 0;
            x3 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x3 + x15 | 0;
            x7 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x7 + x3 | 0;
            x11 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x11 + x7 | 0;
            x15 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x0 + x3 | 0;
            x1 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x1 + x0 | 0;
            x22 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x22 + x1 | 0;
            x3 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x3 + x22 | 0;
            x0 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x5 + x4 | 0;
            x6 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x6 + x5 | 0;
            x7 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x7 + x6 | 0;
            x4 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x4 + x7 | 0;
            x5 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x10 + x9 | 0;
            x11 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x11 + x10 | 0;
            x8 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x8 + x11 | 0;
            x9 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x9 + x8 | 0;
            x10 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x15 + x14 | 0;
            x12 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x12 + x15 | 0;
            x13 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x13 + x12 | 0;
            x14 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x14 + x13 | 0;
            x15 ^= u4 << 18 | u4 >>> 32 - 18;
          }
          x0 = x0 + j0 | 0;
          x1 = x1 + j1 | 0;
          x22 = x22 + j22 | 0;
          x3 = x3 + j32 | 0;
          x4 = x4 + j4 | 0;
          x5 = x5 + j5 | 0;
          x6 = x6 + j6 | 0;
          x7 = x7 + j7 | 0;
          x8 = x8 + j8 | 0;
          x9 = x9 + j9 | 0;
          x10 = x10 + j10 | 0;
          x11 = x11 + j11 | 0;
          x12 = x12 + j12 | 0;
          x13 = x13 + j13 | 0;
          x14 = x14 + j14 | 0;
          x15 = x15 + j15 | 0;
          o9[0] = x0 >>> 0 & 255;
          o9[1] = x0 >>> 8 & 255;
          o9[2] = x0 >>> 16 & 255;
          o9[3] = x0 >>> 24 & 255;
          o9[4] = x1 >>> 0 & 255;
          o9[5] = x1 >>> 8 & 255;
          o9[6] = x1 >>> 16 & 255;
          o9[7] = x1 >>> 24 & 255;
          o9[8] = x22 >>> 0 & 255;
          o9[9] = x22 >>> 8 & 255;
          o9[10] = x22 >>> 16 & 255;
          o9[11] = x22 >>> 24 & 255;
          o9[12] = x3 >>> 0 & 255;
          o9[13] = x3 >>> 8 & 255;
          o9[14] = x3 >>> 16 & 255;
          o9[15] = x3 >>> 24 & 255;
          o9[16] = x4 >>> 0 & 255;
          o9[17] = x4 >>> 8 & 255;
          o9[18] = x4 >>> 16 & 255;
          o9[19] = x4 >>> 24 & 255;
          o9[20] = x5 >>> 0 & 255;
          o9[21] = x5 >>> 8 & 255;
          o9[22] = x5 >>> 16 & 255;
          o9[23] = x5 >>> 24 & 255;
          o9[24] = x6 >>> 0 & 255;
          o9[25] = x6 >>> 8 & 255;
          o9[26] = x6 >>> 16 & 255;
          o9[27] = x6 >>> 24 & 255;
          o9[28] = x7 >>> 0 & 255;
          o9[29] = x7 >>> 8 & 255;
          o9[30] = x7 >>> 16 & 255;
          o9[31] = x7 >>> 24 & 255;
          o9[32] = x8 >>> 0 & 255;
          o9[33] = x8 >>> 8 & 255;
          o9[34] = x8 >>> 16 & 255;
          o9[35] = x8 >>> 24 & 255;
          o9[36] = x9 >>> 0 & 255;
          o9[37] = x9 >>> 8 & 255;
          o9[38] = x9 >>> 16 & 255;
          o9[39] = x9 >>> 24 & 255;
          o9[40] = x10 >>> 0 & 255;
          o9[41] = x10 >>> 8 & 255;
          o9[42] = x10 >>> 16 & 255;
          o9[43] = x10 >>> 24 & 255;
          o9[44] = x11 >>> 0 & 255;
          o9[45] = x11 >>> 8 & 255;
          o9[46] = x11 >>> 16 & 255;
          o9[47] = x11 >>> 24 & 255;
          o9[48] = x12 >>> 0 & 255;
          o9[49] = x12 >>> 8 & 255;
          o9[50] = x12 >>> 16 & 255;
          o9[51] = x12 >>> 24 & 255;
          o9[52] = x13 >>> 0 & 255;
          o9[53] = x13 >>> 8 & 255;
          o9[54] = x13 >>> 16 & 255;
          o9[55] = x13 >>> 24 & 255;
          o9[56] = x14 >>> 0 & 255;
          o9[57] = x14 >>> 8 & 255;
          o9[58] = x14 >>> 16 & 255;
          o9[59] = x14 >>> 24 & 255;
          o9[60] = x15 >>> 0 & 255;
          o9[61] = x15 >>> 8 & 255;
          o9[62] = x15 >>> 16 & 255;
          o9[63] = x15 >>> 24 & 255;
        }
        function core_hsalsa20(o9, p5, k5, c2) {
          var j0 = c2[0] & 255 | (c2[1] & 255) << 8 | (c2[2] & 255) << 16 | (c2[3] & 255) << 24, j1 = k5[0] & 255 | (k5[1] & 255) << 8 | (k5[2] & 255) << 16 | (k5[3] & 255) << 24, j22 = k5[4] & 255 | (k5[5] & 255) << 8 | (k5[6] & 255) << 16 | (k5[7] & 255) << 24, j32 = k5[8] & 255 | (k5[9] & 255) << 8 | (k5[10] & 255) << 16 | (k5[11] & 255) << 24, j4 = k5[12] & 255 | (k5[13] & 255) << 8 | (k5[14] & 255) << 16 | (k5[15] & 255) << 24, j5 = c2[4] & 255 | (c2[5] & 255) << 8 | (c2[6] & 255) << 16 | (c2[7] & 255) << 24, j6 = p5[0] & 255 | (p5[1] & 255) << 8 | (p5[2] & 255) << 16 | (p5[3] & 255) << 24, j7 = p5[4] & 255 | (p5[5] & 255) << 8 | (p5[6] & 255) << 16 | (p5[7] & 255) << 24, j8 = p5[8] & 255 | (p5[9] & 255) << 8 | (p5[10] & 255) << 16 | (p5[11] & 255) << 24, j9 = p5[12] & 255 | (p5[13] & 255) << 8 | (p5[14] & 255) << 16 | (p5[15] & 255) << 24, j10 = c2[8] & 255 | (c2[9] & 255) << 8 | (c2[10] & 255) << 16 | (c2[11] & 255) << 24, j11 = k5[16] & 255 | (k5[17] & 255) << 8 | (k5[18] & 255) << 16 | (k5[19] & 255) << 24, j12 = k5[20] & 255 | (k5[21] & 255) << 8 | (k5[22] & 255) << 16 | (k5[23] & 255) << 24, j13 = k5[24] & 255 | (k5[25] & 255) << 8 | (k5[26] & 255) << 16 | (k5[27] & 255) << 24, j14 = k5[28] & 255 | (k5[29] & 255) << 8 | (k5[30] & 255) << 16 | (k5[31] & 255) << 24, j15 = c2[12] & 255 | (c2[13] & 255) << 8 | (c2[14] & 255) << 16 | (c2[15] & 255) << 24;
          var x0 = j0, x1 = j1, x22 = j22, x3 = j32, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u4;
          for (var i8 = 0; i8 < 20; i8 += 2) {
            u4 = x0 + x12 | 0;
            x4 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x4 + x0 | 0;
            x8 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x8 + x4 | 0;
            x12 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x12 + x8 | 0;
            x0 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x5 + x1 | 0;
            x9 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x9 + x5 | 0;
            x13 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x13 + x9 | 0;
            x1 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x1 + x13 | 0;
            x5 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x10 + x6 | 0;
            x14 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x14 + x10 | 0;
            x22 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x22 + x14 | 0;
            x6 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x6 + x22 | 0;
            x10 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x15 + x11 | 0;
            x3 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x3 + x15 | 0;
            x7 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x7 + x3 | 0;
            x11 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x11 + x7 | 0;
            x15 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x0 + x3 | 0;
            x1 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x1 + x0 | 0;
            x22 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x22 + x1 | 0;
            x3 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x3 + x22 | 0;
            x0 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x5 + x4 | 0;
            x6 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x6 + x5 | 0;
            x7 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x7 + x6 | 0;
            x4 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x4 + x7 | 0;
            x5 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x10 + x9 | 0;
            x11 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x11 + x10 | 0;
            x8 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x8 + x11 | 0;
            x9 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x9 + x8 | 0;
            x10 ^= u4 << 18 | u4 >>> 32 - 18;
            u4 = x15 + x14 | 0;
            x12 ^= u4 << 7 | u4 >>> 32 - 7;
            u4 = x12 + x15 | 0;
            x13 ^= u4 << 9 | u4 >>> 32 - 9;
            u4 = x13 + x12 | 0;
            x14 ^= u4 << 13 | u4 >>> 32 - 13;
            u4 = x14 + x13 | 0;
            x15 ^= u4 << 18 | u4 >>> 32 - 18;
          }
          o9[0] = x0 >>> 0 & 255;
          o9[1] = x0 >>> 8 & 255;
          o9[2] = x0 >>> 16 & 255;
          o9[3] = x0 >>> 24 & 255;
          o9[4] = x5 >>> 0 & 255;
          o9[5] = x5 >>> 8 & 255;
          o9[6] = x5 >>> 16 & 255;
          o9[7] = x5 >>> 24 & 255;
          o9[8] = x10 >>> 0 & 255;
          o9[9] = x10 >>> 8 & 255;
          o9[10] = x10 >>> 16 & 255;
          o9[11] = x10 >>> 24 & 255;
          o9[12] = x15 >>> 0 & 255;
          o9[13] = x15 >>> 8 & 255;
          o9[14] = x15 >>> 16 & 255;
          o9[15] = x15 >>> 24 & 255;
          o9[16] = x6 >>> 0 & 255;
          o9[17] = x6 >>> 8 & 255;
          o9[18] = x6 >>> 16 & 255;
          o9[19] = x6 >>> 24 & 255;
          o9[20] = x7 >>> 0 & 255;
          o9[21] = x7 >>> 8 & 255;
          o9[22] = x7 >>> 16 & 255;
          o9[23] = x7 >>> 24 & 255;
          o9[24] = x8 >>> 0 & 255;
          o9[25] = x8 >>> 8 & 255;
          o9[26] = x8 >>> 16 & 255;
          o9[27] = x8 >>> 24 & 255;
          o9[28] = x9 >>> 0 & 255;
          o9[29] = x9 >>> 8 & 255;
          o9[30] = x9 >>> 16 & 255;
          o9[31] = x9 >>> 24 & 255;
        }
        function crypto_core_salsa20(out, inp, k5, c2) {
          core_salsa20(out, inp, k5, c2);
        }
        function crypto_core_hsalsa20(out, inp, k5, c2) {
          core_hsalsa20(out, inp, k5, c2);
        }
        var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
        function crypto_stream_salsa20_xor(c2, cpos, m5, mpos, b, n7, k5) {
          var z3 = new Uint8Array(16), x3 = new Uint8Array(64);
          var u4, i8;
          for (i8 = 0; i8 < 16; i8++) z3[i8] = 0;
          for (i8 = 0; i8 < 8; i8++) z3[i8] = n7[i8];
          while (b >= 64) {
            crypto_core_salsa20(x3, z3, k5, sigma);
            for (i8 = 0; i8 < 64; i8++) c2[cpos + i8] = m5[mpos + i8] ^ x3[i8];
            u4 = 1;
            for (i8 = 8; i8 < 16; i8++) {
              u4 = u4 + (z3[i8] & 255) | 0;
              z3[i8] = u4 & 255;
              u4 >>>= 8;
            }
            b -= 64;
            cpos += 64;
            mpos += 64;
          }
          if (b > 0) {
            crypto_core_salsa20(x3, z3, k5, sigma);
            for (i8 = 0; i8 < b; i8++) c2[cpos + i8] = m5[mpos + i8] ^ x3[i8];
          }
          return 0;
        }
        function crypto_stream_salsa20(c2, cpos, b, n7, k5) {
          var z3 = new Uint8Array(16), x3 = new Uint8Array(64);
          var u4, i8;
          for (i8 = 0; i8 < 16; i8++) z3[i8] = 0;
          for (i8 = 0; i8 < 8; i8++) z3[i8] = n7[i8];
          while (b >= 64) {
            crypto_core_salsa20(x3, z3, k5, sigma);
            for (i8 = 0; i8 < 64; i8++) c2[cpos + i8] = x3[i8];
            u4 = 1;
            for (i8 = 8; i8 < 16; i8++) {
              u4 = u4 + (z3[i8] & 255) | 0;
              z3[i8] = u4 & 255;
              u4 >>>= 8;
            }
            b -= 64;
            cpos += 64;
          }
          if (b > 0) {
            crypto_core_salsa20(x3, z3, k5, sigma);
            for (i8 = 0; i8 < b; i8++) c2[cpos + i8] = x3[i8];
          }
          return 0;
        }
        function crypto_stream(c2, cpos, d4, n7, k5) {
          var s7 = new Uint8Array(32);
          crypto_core_hsalsa20(s7, n7, k5, sigma);
          var sn = new Uint8Array(8);
          for (var i8 = 0; i8 < 8; i8++) sn[i8] = n7[i8 + 16];
          return crypto_stream_salsa20(c2, cpos, d4, sn, s7);
        }
        function crypto_stream_xor(c2, cpos, m5, mpos, d4, n7, k5) {
          var s7 = new Uint8Array(32);
          crypto_core_hsalsa20(s7, n7, k5, sigma);
          var sn = new Uint8Array(8);
          for (var i8 = 0; i8 < 8; i8++) sn[i8] = n7[i8 + 16];
          return crypto_stream_salsa20_xor(c2, cpos, m5, mpos, d4, sn, s7);
        }
        var poly1305 = function(key) {
          this.buffer = new Uint8Array(16);
          this.r = new Uint16Array(10);
          this.h = new Uint16Array(10);
          this.pad = new Uint16Array(8);
          this.leftover = 0;
          this.fin = 0;
          var t0, t1, t22, t32, t42, t52, t62, t72;
          t0 = key[0] & 255 | (key[1] & 255) << 8;
          this.r[0] = t0 & 8191;
          t1 = key[2] & 255 | (key[3] & 255) << 8;
          this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
          t22 = key[4] & 255 | (key[5] & 255) << 8;
          this.r[2] = (t1 >>> 10 | t22 << 6) & 7939;
          t32 = key[6] & 255 | (key[7] & 255) << 8;
          this.r[3] = (t22 >>> 7 | t32 << 9) & 8191;
          t42 = key[8] & 255 | (key[9] & 255) << 8;
          this.r[4] = (t32 >>> 4 | t42 << 12) & 255;
          this.r[5] = t42 >>> 1 & 8190;
          t52 = key[10] & 255 | (key[11] & 255) << 8;
          this.r[6] = (t42 >>> 14 | t52 << 2) & 8191;
          t62 = key[12] & 255 | (key[13] & 255) << 8;
          this.r[7] = (t52 >>> 11 | t62 << 5) & 8065;
          t72 = key[14] & 255 | (key[15] & 255) << 8;
          this.r[8] = (t62 >>> 8 | t72 << 8) & 8191;
          this.r[9] = t72 >>> 5 & 127;
          this.pad[0] = key[16] & 255 | (key[17] & 255) << 8;
          this.pad[1] = key[18] & 255 | (key[19] & 255) << 8;
          this.pad[2] = key[20] & 255 | (key[21] & 255) << 8;
          this.pad[3] = key[22] & 255 | (key[23] & 255) << 8;
          this.pad[4] = key[24] & 255 | (key[25] & 255) << 8;
          this.pad[5] = key[26] & 255 | (key[27] & 255) << 8;
          this.pad[6] = key[28] & 255 | (key[29] & 255) << 8;
          this.pad[7] = key[30] & 255 | (key[31] & 255) << 8;
        };
        poly1305.prototype.blocks = function(m5, mpos, bytes) {
          var hibit = this.fin ? 0 : 1 << 11;
          var t0, t1, t22, t32, t42, t52, t62, t72, c2;
          var d0, d1, d22, d32, d4, d5, d6, d7, d8, d9;
          var h0 = this.h[0], h1 = this.h[1], h22 = this.h[2], h32 = this.h[3], h4 = this.h[4], h5 = this.h[5], h6 = this.h[6], h7 = this.h[7], h8 = this.h[8], h9 = this.h[9];
          var r0 = this.r[0], r1 = this.r[1], r22 = this.r[2], r32 = this.r[3], r42 = this.r[4], r52 = this.r[5], r62 = this.r[6], r72 = this.r[7], r82 = this.r[8], r92 = this.r[9];
          while (bytes >= 16) {
            t0 = m5[mpos + 0] & 255 | (m5[mpos + 1] & 255) << 8;
            h0 += t0 & 8191;
            t1 = m5[mpos + 2] & 255 | (m5[mpos + 3] & 255) << 8;
            h1 += (t0 >>> 13 | t1 << 3) & 8191;
            t22 = m5[mpos + 4] & 255 | (m5[mpos + 5] & 255) << 8;
            h22 += (t1 >>> 10 | t22 << 6) & 8191;
            t32 = m5[mpos + 6] & 255 | (m5[mpos + 7] & 255) << 8;
            h32 += (t22 >>> 7 | t32 << 9) & 8191;
            t42 = m5[mpos + 8] & 255 | (m5[mpos + 9] & 255) << 8;
            h4 += (t32 >>> 4 | t42 << 12) & 8191;
            h5 += t42 >>> 1 & 8191;
            t52 = m5[mpos + 10] & 255 | (m5[mpos + 11] & 255) << 8;
            h6 += (t42 >>> 14 | t52 << 2) & 8191;
            t62 = m5[mpos + 12] & 255 | (m5[mpos + 13] & 255) << 8;
            h7 += (t52 >>> 11 | t62 << 5) & 8191;
            t72 = m5[mpos + 14] & 255 | (m5[mpos + 15] & 255) << 8;
            h8 += (t62 >>> 8 | t72 << 8) & 8191;
            h9 += t72 >>> 5 | hibit;
            c2 = 0;
            d0 = c2;
            d0 += h0 * r0;
            d0 += h1 * (5 * r92);
            d0 += h22 * (5 * r82);
            d0 += h32 * (5 * r72);
            d0 += h4 * (5 * r62);
            c2 = d0 >>> 13;
            d0 &= 8191;
            d0 += h5 * (5 * r52);
            d0 += h6 * (5 * r42);
            d0 += h7 * (5 * r32);
            d0 += h8 * (5 * r22);
            d0 += h9 * (5 * r1);
            c2 += d0 >>> 13;
            d0 &= 8191;
            d1 = c2;
            d1 += h0 * r1;
            d1 += h1 * r0;
            d1 += h22 * (5 * r92);
            d1 += h32 * (5 * r82);
            d1 += h4 * (5 * r72);
            c2 = d1 >>> 13;
            d1 &= 8191;
            d1 += h5 * (5 * r62);
            d1 += h6 * (5 * r52);
            d1 += h7 * (5 * r42);
            d1 += h8 * (5 * r32);
            d1 += h9 * (5 * r22);
            c2 += d1 >>> 13;
            d1 &= 8191;
            d22 = c2;
            d22 += h0 * r22;
            d22 += h1 * r1;
            d22 += h22 * r0;
            d22 += h32 * (5 * r92);
            d22 += h4 * (5 * r82);
            c2 = d22 >>> 13;
            d22 &= 8191;
            d22 += h5 * (5 * r72);
            d22 += h6 * (5 * r62);
            d22 += h7 * (5 * r52);
            d22 += h8 * (5 * r42);
            d22 += h9 * (5 * r32);
            c2 += d22 >>> 13;
            d22 &= 8191;
            d32 = c2;
            d32 += h0 * r32;
            d32 += h1 * r22;
            d32 += h22 * r1;
            d32 += h32 * r0;
            d32 += h4 * (5 * r92);
            c2 = d32 >>> 13;
            d32 &= 8191;
            d32 += h5 * (5 * r82);
            d32 += h6 * (5 * r72);
            d32 += h7 * (5 * r62);
            d32 += h8 * (5 * r52);
            d32 += h9 * (5 * r42);
            c2 += d32 >>> 13;
            d32 &= 8191;
            d4 = c2;
            d4 += h0 * r42;
            d4 += h1 * r32;
            d4 += h22 * r22;
            d4 += h32 * r1;
            d4 += h4 * r0;
            c2 = d4 >>> 13;
            d4 &= 8191;
            d4 += h5 * (5 * r92);
            d4 += h6 * (5 * r82);
            d4 += h7 * (5 * r72);
            d4 += h8 * (5 * r62);
            d4 += h9 * (5 * r52);
            c2 += d4 >>> 13;
            d4 &= 8191;
            d5 = c2;
            d5 += h0 * r52;
            d5 += h1 * r42;
            d5 += h22 * r32;
            d5 += h32 * r22;
            d5 += h4 * r1;
            c2 = d5 >>> 13;
            d5 &= 8191;
            d5 += h5 * r0;
            d5 += h6 * (5 * r92);
            d5 += h7 * (5 * r82);
            d5 += h8 * (5 * r72);
            d5 += h9 * (5 * r62);
            c2 += d5 >>> 13;
            d5 &= 8191;
            d6 = c2;
            d6 += h0 * r62;
            d6 += h1 * r52;
            d6 += h22 * r42;
            d6 += h32 * r32;
            d6 += h4 * r22;
            c2 = d6 >>> 13;
            d6 &= 8191;
            d6 += h5 * r1;
            d6 += h6 * r0;
            d6 += h7 * (5 * r92);
            d6 += h8 * (5 * r82);
            d6 += h9 * (5 * r72);
            c2 += d6 >>> 13;
            d6 &= 8191;
            d7 = c2;
            d7 += h0 * r72;
            d7 += h1 * r62;
            d7 += h22 * r52;
            d7 += h32 * r42;
            d7 += h4 * r32;
            c2 = d7 >>> 13;
            d7 &= 8191;
            d7 += h5 * r22;
            d7 += h6 * r1;
            d7 += h7 * r0;
            d7 += h8 * (5 * r92);
            d7 += h9 * (5 * r82);
            c2 += d7 >>> 13;
            d7 &= 8191;
            d8 = c2;
            d8 += h0 * r82;
            d8 += h1 * r72;
            d8 += h22 * r62;
            d8 += h32 * r52;
            d8 += h4 * r42;
            c2 = d8 >>> 13;
            d8 &= 8191;
            d8 += h5 * r32;
            d8 += h6 * r22;
            d8 += h7 * r1;
            d8 += h8 * r0;
            d8 += h9 * (5 * r92);
            c2 += d8 >>> 13;
            d8 &= 8191;
            d9 = c2;
            d9 += h0 * r92;
            d9 += h1 * r82;
            d9 += h22 * r72;
            d9 += h32 * r62;
            d9 += h4 * r52;
            c2 = d9 >>> 13;
            d9 &= 8191;
            d9 += h5 * r42;
            d9 += h6 * r32;
            d9 += h7 * r22;
            d9 += h8 * r1;
            d9 += h9 * r0;
            c2 += d9 >>> 13;
            d9 &= 8191;
            c2 = (c2 << 2) + c2 | 0;
            c2 = c2 + d0 | 0;
            d0 = c2 & 8191;
            c2 = c2 >>> 13;
            d1 += c2;
            h0 = d0;
            h1 = d1;
            h22 = d22;
            h32 = d32;
            h4 = d4;
            h5 = d5;
            h6 = d6;
            h7 = d7;
            h8 = d8;
            h9 = d9;
            mpos += 16;
            bytes -= 16;
          }
          this.h[0] = h0;
          this.h[1] = h1;
          this.h[2] = h22;
          this.h[3] = h32;
          this.h[4] = h4;
          this.h[5] = h5;
          this.h[6] = h6;
          this.h[7] = h7;
          this.h[8] = h8;
          this.h[9] = h9;
        };
        poly1305.prototype.finish = function(mac, macpos) {
          var g5 = new Uint16Array(10);
          var c2, mask, f3, i8;
          if (this.leftover) {
            i8 = this.leftover;
            this.buffer[i8++] = 1;
            for (; i8 < 16; i8++) this.buffer[i8] = 0;
            this.fin = 1;
            this.blocks(this.buffer, 0, 16);
          }
          c2 = this.h[1] >>> 13;
          this.h[1] &= 8191;
          for (i8 = 2; i8 < 10; i8++) {
            this.h[i8] += c2;
            c2 = this.h[i8] >>> 13;
            this.h[i8] &= 8191;
          }
          this.h[0] += c2 * 5;
          c2 = this.h[0] >>> 13;
          this.h[0] &= 8191;
          this.h[1] += c2;
          c2 = this.h[1] >>> 13;
          this.h[1] &= 8191;
          this.h[2] += c2;
          g5[0] = this.h[0] + 5;
          c2 = g5[0] >>> 13;
          g5[0] &= 8191;
          for (i8 = 1; i8 < 10; i8++) {
            g5[i8] = this.h[i8] + c2;
            c2 = g5[i8] >>> 13;
            g5[i8] &= 8191;
          }
          g5[9] -= 1 << 13;
          mask = (c2 ^ 1) - 1;
          for (i8 = 0; i8 < 10; i8++) g5[i8] &= mask;
          mask = ~mask;
          for (i8 = 0; i8 < 10; i8++) this.h[i8] = this.h[i8] & mask | g5[i8];
          this.h[0] = (this.h[0] | this.h[1] << 13) & 65535;
          this.h[1] = (this.h[1] >>> 3 | this.h[2] << 10) & 65535;
          this.h[2] = (this.h[2] >>> 6 | this.h[3] << 7) & 65535;
          this.h[3] = (this.h[3] >>> 9 | this.h[4] << 4) & 65535;
          this.h[4] = (this.h[4] >>> 12 | this.h[5] << 1 | this.h[6] << 14) & 65535;
          this.h[5] = (this.h[6] >>> 2 | this.h[7] << 11) & 65535;
          this.h[6] = (this.h[7] >>> 5 | this.h[8] << 8) & 65535;
          this.h[7] = (this.h[8] >>> 8 | this.h[9] << 5) & 65535;
          f3 = this.h[0] + this.pad[0];
          this.h[0] = f3 & 65535;
          for (i8 = 1; i8 < 8; i8++) {
            f3 = (this.h[i8] + this.pad[i8] | 0) + (f3 >>> 16) | 0;
            this.h[i8] = f3 & 65535;
          }
          mac[macpos + 0] = this.h[0] >>> 0 & 255;
          mac[macpos + 1] = this.h[0] >>> 8 & 255;
          mac[macpos + 2] = this.h[1] >>> 0 & 255;
          mac[macpos + 3] = this.h[1] >>> 8 & 255;
          mac[macpos + 4] = this.h[2] >>> 0 & 255;
          mac[macpos + 5] = this.h[2] >>> 8 & 255;
          mac[macpos + 6] = this.h[3] >>> 0 & 255;
          mac[macpos + 7] = this.h[3] >>> 8 & 255;
          mac[macpos + 8] = this.h[4] >>> 0 & 255;
          mac[macpos + 9] = this.h[4] >>> 8 & 255;
          mac[macpos + 10] = this.h[5] >>> 0 & 255;
          mac[macpos + 11] = this.h[5] >>> 8 & 255;
          mac[macpos + 12] = this.h[6] >>> 0 & 255;
          mac[macpos + 13] = this.h[6] >>> 8 & 255;
          mac[macpos + 14] = this.h[7] >>> 0 & 255;
          mac[macpos + 15] = this.h[7] >>> 8 & 255;
        };
        poly1305.prototype.update = function(m5, mpos, bytes) {
          var i8, want;
          if (this.leftover) {
            want = 16 - this.leftover;
            if (want > bytes)
              want = bytes;
            for (i8 = 0; i8 < want; i8++)
              this.buffer[this.leftover + i8] = m5[mpos + i8];
            bytes -= want;
            mpos += want;
            this.leftover += want;
            if (this.leftover < 16)
              return;
            this.blocks(this.buffer, 0, 16);
            this.leftover = 0;
          }
          if (bytes >= 16) {
            want = bytes - bytes % 16;
            this.blocks(m5, mpos, want);
            mpos += want;
            bytes -= want;
          }
          if (bytes) {
            for (i8 = 0; i8 < bytes; i8++)
              this.buffer[this.leftover + i8] = m5[mpos + i8];
            this.leftover += bytes;
          }
        };
        function crypto_onetimeauth(out, outpos, m5, mpos, n7, k5) {
          var s7 = new poly1305(k5);
          s7.update(m5, mpos, n7);
          s7.finish(out, outpos);
          return 0;
        }
        function crypto_onetimeauth_verify(h4, hpos, m5, mpos, n7, k5) {
          var x3 = new Uint8Array(16);
          crypto_onetimeauth(x3, 0, m5, mpos, n7, k5);
          return crypto_verify_16(h4, hpos, x3, 0);
        }
        function crypto_secretbox(c2, m5, d4, n7, k5) {
          var i8;
          if (d4 < 32) return -1;
          crypto_stream_xor(c2, 0, m5, 0, d4, n7, k5);
          crypto_onetimeauth(c2, 16, c2, 32, d4 - 32, c2);
          for (i8 = 0; i8 < 16; i8++) c2[i8] = 0;
          return 0;
        }
        function crypto_secretbox_open(m5, c2, d4, n7, k5) {
          var i8;
          var x3 = new Uint8Array(32);
          if (d4 < 32) return -1;
          crypto_stream(x3, 0, 32, n7, k5);
          if (crypto_onetimeauth_verify(c2, 16, c2, 32, d4 - 32, x3) !== 0) return -1;
          crypto_stream_xor(m5, 0, c2, 0, d4, n7, k5);
          for (i8 = 0; i8 < 32; i8++) m5[i8] = 0;
          return 0;
        }
        function set25519(r17, a4) {
          var i8;
          for (i8 = 0; i8 < 16; i8++) r17[i8] = a4[i8] | 0;
        }
        function car25519(o9) {
          var i8, v8, c2 = 1;
          for (i8 = 0; i8 < 16; i8++) {
            v8 = o9[i8] + c2 + 65535;
            c2 = Math.floor(v8 / 65536);
            o9[i8] = v8 - c2 * 65536;
          }
          o9[0] += c2 - 1 + 37 * (c2 - 1);
        }
        function sel25519(p5, q5, b) {
          var t21, c2 = ~(b - 1);
          for (var i8 = 0; i8 < 16; i8++) {
            t21 = c2 & (p5[i8] ^ q5[i8]);
            p5[i8] ^= t21;
            q5[i8] ^= t21;
          }
        }
        function pack25519(o9, n7) {
          var i8, j4, b;
          var m5 = gf(), t21 = gf();
          for (i8 = 0; i8 < 16; i8++) t21[i8] = n7[i8];
          car25519(t21);
          car25519(t21);
          car25519(t21);
          for (j4 = 0; j4 < 2; j4++) {
            m5[0] = t21[0] - 65517;
            for (i8 = 1; i8 < 15; i8++) {
              m5[i8] = t21[i8] - 65535 - (m5[i8 - 1] >> 16 & 1);
              m5[i8 - 1] &= 65535;
            }
            m5[15] = t21[15] - 32767 - (m5[14] >> 16 & 1);
            b = m5[15] >> 16 & 1;
            m5[14] &= 65535;
            sel25519(t21, m5, 1 - b);
          }
          for (i8 = 0; i8 < 16; i8++) {
            o9[2 * i8] = t21[i8] & 255;
            o9[2 * i8 + 1] = t21[i8] >> 8;
          }
        }
        function neq25519(a4, b) {
          var c2 = new Uint8Array(32), d4 = new Uint8Array(32);
          pack25519(c2, a4);
          pack25519(d4, b);
          return crypto_verify_32(c2, 0, d4, 0);
        }
        function par25519(a4) {
          var d4 = new Uint8Array(32);
          pack25519(d4, a4);
          return d4[0] & 1;
        }
        function unpack25519(o9, n7) {
          var i8;
          for (i8 = 0; i8 < 16; i8++) o9[i8] = n7[2 * i8] + (n7[2 * i8 + 1] << 8);
          o9[15] &= 32767;
        }
        function A(o9, a4, b) {
          for (var i8 = 0; i8 < 16; i8++) o9[i8] = a4[i8] + b[i8];
        }
        function Z(o9, a4, b) {
          for (var i8 = 0; i8 < 16; i8++) o9[i8] = a4[i8] - b[i8];
        }
        function M(o9, a4, b) {
          var v8, c2, t0 = 0, t1 = 0, t22 = 0, t32 = 0, t42 = 0, t52 = 0, t62 = 0, t72 = 0, t82 = 0, t92 = 0, t102 = 0, t112 = 0, t122 = 0, t132 = 0, t142 = 0, t152 = 0, t162 = 0, t172 = 0, t182 = 0, t192 = 0, t202 = 0, t21 = 0, t222 = 0, t23 = 0, t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0, b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
          v8 = a4[0];
          t0 += v8 * b0;
          t1 += v8 * b1;
          t22 += v8 * b2;
          t32 += v8 * b3;
          t42 += v8 * b4;
          t52 += v8 * b5;
          t62 += v8 * b6;
          t72 += v8 * b7;
          t82 += v8 * b8;
          t92 += v8 * b9;
          t102 += v8 * b10;
          t112 += v8 * b11;
          t122 += v8 * b12;
          t132 += v8 * b13;
          t142 += v8 * b14;
          t152 += v8 * b15;
          v8 = a4[1];
          t1 += v8 * b0;
          t22 += v8 * b1;
          t32 += v8 * b2;
          t42 += v8 * b3;
          t52 += v8 * b4;
          t62 += v8 * b5;
          t72 += v8 * b6;
          t82 += v8 * b7;
          t92 += v8 * b8;
          t102 += v8 * b9;
          t112 += v8 * b10;
          t122 += v8 * b11;
          t132 += v8 * b12;
          t142 += v8 * b13;
          t152 += v8 * b14;
          t162 += v8 * b15;
          v8 = a4[2];
          t22 += v8 * b0;
          t32 += v8 * b1;
          t42 += v8 * b2;
          t52 += v8 * b3;
          t62 += v8 * b4;
          t72 += v8 * b5;
          t82 += v8 * b6;
          t92 += v8 * b7;
          t102 += v8 * b8;
          t112 += v8 * b9;
          t122 += v8 * b10;
          t132 += v8 * b11;
          t142 += v8 * b12;
          t152 += v8 * b13;
          t162 += v8 * b14;
          t172 += v8 * b15;
          v8 = a4[3];
          t32 += v8 * b0;
          t42 += v8 * b1;
          t52 += v8 * b2;
          t62 += v8 * b3;
          t72 += v8 * b4;
          t82 += v8 * b5;
          t92 += v8 * b6;
          t102 += v8 * b7;
          t112 += v8 * b8;
          t122 += v8 * b9;
          t132 += v8 * b10;
          t142 += v8 * b11;
          t152 += v8 * b12;
          t162 += v8 * b13;
          t172 += v8 * b14;
          t182 += v8 * b15;
          v8 = a4[4];
          t42 += v8 * b0;
          t52 += v8 * b1;
          t62 += v8 * b2;
          t72 += v8 * b3;
          t82 += v8 * b4;
          t92 += v8 * b5;
          t102 += v8 * b6;
          t112 += v8 * b7;
          t122 += v8 * b8;
          t132 += v8 * b9;
          t142 += v8 * b10;
          t152 += v8 * b11;
          t162 += v8 * b12;
          t172 += v8 * b13;
          t182 += v8 * b14;
          t192 += v8 * b15;
          v8 = a4[5];
          t52 += v8 * b0;
          t62 += v8 * b1;
          t72 += v8 * b2;
          t82 += v8 * b3;
          t92 += v8 * b4;
          t102 += v8 * b5;
          t112 += v8 * b6;
          t122 += v8 * b7;
          t132 += v8 * b8;
          t142 += v8 * b9;
          t152 += v8 * b10;
          t162 += v8 * b11;
          t172 += v8 * b12;
          t182 += v8 * b13;
          t192 += v8 * b14;
          t202 += v8 * b15;
          v8 = a4[6];
          t62 += v8 * b0;
          t72 += v8 * b1;
          t82 += v8 * b2;
          t92 += v8 * b3;
          t102 += v8 * b4;
          t112 += v8 * b5;
          t122 += v8 * b6;
          t132 += v8 * b7;
          t142 += v8 * b8;
          t152 += v8 * b9;
          t162 += v8 * b10;
          t172 += v8 * b11;
          t182 += v8 * b12;
          t192 += v8 * b13;
          t202 += v8 * b14;
          t21 += v8 * b15;
          v8 = a4[7];
          t72 += v8 * b0;
          t82 += v8 * b1;
          t92 += v8 * b2;
          t102 += v8 * b3;
          t112 += v8 * b4;
          t122 += v8 * b5;
          t132 += v8 * b6;
          t142 += v8 * b7;
          t152 += v8 * b8;
          t162 += v8 * b9;
          t172 += v8 * b10;
          t182 += v8 * b11;
          t192 += v8 * b12;
          t202 += v8 * b13;
          t21 += v8 * b14;
          t222 += v8 * b15;
          v8 = a4[8];
          t82 += v8 * b0;
          t92 += v8 * b1;
          t102 += v8 * b2;
          t112 += v8 * b3;
          t122 += v8 * b4;
          t132 += v8 * b5;
          t142 += v8 * b6;
          t152 += v8 * b7;
          t162 += v8 * b8;
          t172 += v8 * b9;
          t182 += v8 * b10;
          t192 += v8 * b11;
          t202 += v8 * b12;
          t21 += v8 * b13;
          t222 += v8 * b14;
          t23 += v8 * b15;
          v8 = a4[9];
          t92 += v8 * b0;
          t102 += v8 * b1;
          t112 += v8 * b2;
          t122 += v8 * b3;
          t132 += v8 * b4;
          t142 += v8 * b5;
          t152 += v8 * b6;
          t162 += v8 * b7;
          t172 += v8 * b8;
          t182 += v8 * b9;
          t192 += v8 * b10;
          t202 += v8 * b11;
          t21 += v8 * b12;
          t222 += v8 * b13;
          t23 += v8 * b14;
          t24 += v8 * b15;
          v8 = a4[10];
          t102 += v8 * b0;
          t112 += v8 * b1;
          t122 += v8 * b2;
          t132 += v8 * b3;
          t142 += v8 * b4;
          t152 += v8 * b5;
          t162 += v8 * b6;
          t172 += v8 * b7;
          t182 += v8 * b8;
          t192 += v8 * b9;
          t202 += v8 * b10;
          t21 += v8 * b11;
          t222 += v8 * b12;
          t23 += v8 * b13;
          t24 += v8 * b14;
          t25 += v8 * b15;
          v8 = a4[11];
          t112 += v8 * b0;
          t122 += v8 * b1;
          t132 += v8 * b2;
          t142 += v8 * b3;
          t152 += v8 * b4;
          t162 += v8 * b5;
          t172 += v8 * b6;
          t182 += v8 * b7;
          t192 += v8 * b8;
          t202 += v8 * b9;
          t21 += v8 * b10;
          t222 += v8 * b11;
          t23 += v8 * b12;
          t24 += v8 * b13;
          t25 += v8 * b14;
          t26 += v8 * b15;
          v8 = a4[12];
          t122 += v8 * b0;
          t132 += v8 * b1;
          t142 += v8 * b2;
          t152 += v8 * b3;
          t162 += v8 * b4;
          t172 += v8 * b5;
          t182 += v8 * b6;
          t192 += v8 * b7;
          t202 += v8 * b8;
          t21 += v8 * b9;
          t222 += v8 * b10;
          t23 += v8 * b11;
          t24 += v8 * b12;
          t25 += v8 * b13;
          t26 += v8 * b14;
          t27 += v8 * b15;
          v8 = a4[13];
          t132 += v8 * b0;
          t142 += v8 * b1;
          t152 += v8 * b2;
          t162 += v8 * b3;
          t172 += v8 * b4;
          t182 += v8 * b5;
          t192 += v8 * b6;
          t202 += v8 * b7;
          t21 += v8 * b8;
          t222 += v8 * b9;
          t23 += v8 * b10;
          t24 += v8 * b11;
          t25 += v8 * b12;
          t26 += v8 * b13;
          t27 += v8 * b14;
          t28 += v8 * b15;
          v8 = a4[14];
          t142 += v8 * b0;
          t152 += v8 * b1;
          t162 += v8 * b2;
          t172 += v8 * b3;
          t182 += v8 * b4;
          t192 += v8 * b5;
          t202 += v8 * b6;
          t21 += v8 * b7;
          t222 += v8 * b8;
          t23 += v8 * b9;
          t24 += v8 * b10;
          t25 += v8 * b11;
          t26 += v8 * b12;
          t27 += v8 * b13;
          t28 += v8 * b14;
          t29 += v8 * b15;
          v8 = a4[15];
          t152 += v8 * b0;
          t162 += v8 * b1;
          t172 += v8 * b2;
          t182 += v8 * b3;
          t192 += v8 * b4;
          t202 += v8 * b5;
          t21 += v8 * b6;
          t222 += v8 * b7;
          t23 += v8 * b8;
          t24 += v8 * b9;
          t25 += v8 * b10;
          t26 += v8 * b11;
          t27 += v8 * b12;
          t28 += v8 * b13;
          t29 += v8 * b14;
          t30 += v8 * b15;
          t0 += 38 * t162;
          t1 += 38 * t172;
          t22 += 38 * t182;
          t32 += 38 * t192;
          t42 += 38 * t202;
          t52 += 38 * t21;
          t62 += 38 * t222;
          t72 += 38 * t23;
          t82 += 38 * t24;
          t92 += 38 * t25;
          t102 += 38 * t26;
          t112 += 38 * t27;
          t122 += 38 * t28;
          t132 += 38 * t29;
          t142 += 38 * t30;
          c2 = 1;
          v8 = t0 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t0 = v8 - c2 * 65536;
          v8 = t1 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t1 = v8 - c2 * 65536;
          v8 = t22 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t22 = v8 - c2 * 65536;
          v8 = t32 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t32 = v8 - c2 * 65536;
          v8 = t42 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t42 = v8 - c2 * 65536;
          v8 = t52 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t52 = v8 - c2 * 65536;
          v8 = t62 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t62 = v8 - c2 * 65536;
          v8 = t72 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t72 = v8 - c2 * 65536;
          v8 = t82 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t82 = v8 - c2 * 65536;
          v8 = t92 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t92 = v8 - c2 * 65536;
          v8 = t102 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t102 = v8 - c2 * 65536;
          v8 = t112 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t112 = v8 - c2 * 65536;
          v8 = t122 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t122 = v8 - c2 * 65536;
          v8 = t132 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t132 = v8 - c2 * 65536;
          v8 = t142 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t142 = v8 - c2 * 65536;
          v8 = t152 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t152 = v8 - c2 * 65536;
          t0 += c2 - 1 + 37 * (c2 - 1);
          c2 = 1;
          v8 = t0 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t0 = v8 - c2 * 65536;
          v8 = t1 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t1 = v8 - c2 * 65536;
          v8 = t22 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t22 = v8 - c2 * 65536;
          v8 = t32 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t32 = v8 - c2 * 65536;
          v8 = t42 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t42 = v8 - c2 * 65536;
          v8 = t52 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t52 = v8 - c2 * 65536;
          v8 = t62 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t62 = v8 - c2 * 65536;
          v8 = t72 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t72 = v8 - c2 * 65536;
          v8 = t82 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t82 = v8 - c2 * 65536;
          v8 = t92 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t92 = v8 - c2 * 65536;
          v8 = t102 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t102 = v8 - c2 * 65536;
          v8 = t112 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t112 = v8 - c2 * 65536;
          v8 = t122 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t122 = v8 - c2 * 65536;
          v8 = t132 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t132 = v8 - c2 * 65536;
          v8 = t142 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t142 = v8 - c2 * 65536;
          v8 = t152 + c2 + 65535;
          c2 = Math.floor(v8 / 65536);
          t152 = v8 - c2 * 65536;
          t0 += c2 - 1 + 37 * (c2 - 1);
          o9[0] = t0;
          o9[1] = t1;
          o9[2] = t22;
          o9[3] = t32;
          o9[4] = t42;
          o9[5] = t52;
          o9[6] = t62;
          o9[7] = t72;
          o9[8] = t82;
          o9[9] = t92;
          o9[10] = t102;
          o9[11] = t112;
          o9[12] = t122;
          o9[13] = t132;
          o9[14] = t142;
          o9[15] = t152;
        }
        function S4(o9, a4) {
          M(o9, a4, a4);
        }
        function inv25519(o9, i8) {
          var c2 = gf();
          var a4;
          for (a4 = 0; a4 < 16; a4++) c2[a4] = i8[a4];
          for (a4 = 253; a4 >= 0; a4--) {
            S4(c2, c2);
            if (a4 !== 2 && a4 !== 4) M(c2, c2, i8);
          }
          for (a4 = 0; a4 < 16; a4++) o9[a4] = c2[a4];
        }
        function pow2523(o9, i8) {
          var c2 = gf();
          var a4;
          for (a4 = 0; a4 < 16; a4++) c2[a4] = i8[a4];
          for (a4 = 250; a4 >= 0; a4--) {
            S4(c2, c2);
            if (a4 !== 1) M(c2, c2, i8);
          }
          for (a4 = 0; a4 < 16; a4++) o9[a4] = c2[a4];
        }
        function crypto_scalarmult(q5, n7, p5) {
          var z3 = new Uint8Array(32);
          var x3 = new Float64Array(80), r17, i8;
          var a4 = gf(), b = gf(), c2 = gf(), d4 = gf(), e8 = gf(), f3 = gf();
          for (i8 = 0; i8 < 31; i8++) z3[i8] = n7[i8];
          z3[31] = n7[31] & 127 | 64;
          z3[0] &= 248;
          unpack25519(x3, p5);
          for (i8 = 0; i8 < 16; i8++) {
            b[i8] = x3[i8];
            d4[i8] = a4[i8] = c2[i8] = 0;
          }
          a4[0] = d4[0] = 1;
          for (i8 = 254; i8 >= 0; --i8) {
            r17 = z3[i8 >>> 3] >>> (i8 & 7) & 1;
            sel25519(a4, b, r17);
            sel25519(c2, d4, r17);
            A(e8, a4, c2);
            Z(a4, a4, c2);
            A(c2, b, d4);
            Z(b, b, d4);
            S4(d4, e8);
            S4(f3, a4);
            M(a4, c2, a4);
            M(c2, b, e8);
            A(e8, a4, c2);
            Z(a4, a4, c2);
            S4(b, a4);
            Z(c2, d4, f3);
            M(a4, c2, _121665);
            A(a4, a4, d4);
            M(c2, c2, a4);
            M(a4, d4, f3);
            M(d4, b, x3);
            S4(b, e8);
            sel25519(a4, b, r17);
            sel25519(c2, d4, r17);
          }
          for (i8 = 0; i8 < 16; i8++) {
            x3[i8 + 16] = a4[i8];
            x3[i8 + 32] = c2[i8];
            x3[i8 + 48] = b[i8];
            x3[i8 + 64] = d4[i8];
          }
          var x32 = x3.subarray(32);
          var x16 = x3.subarray(16);
          inv25519(x32, x32);
          M(x16, x16, x32);
          pack25519(q5, x16);
          return 0;
        }
        function crypto_scalarmult_base(q5, n7) {
          return crypto_scalarmult(q5, n7, _9);
        }
        function crypto_box_keypair(y3, x3) {
          randombytes(x3, 32);
          return crypto_scalarmult_base(y3, x3);
        }
        function crypto_box_beforenm(k5, y3, x3) {
          var s7 = new Uint8Array(32);
          crypto_scalarmult(s7, x3, y3);
          return crypto_core_hsalsa20(k5, _0, s7, sigma);
        }
        var crypto_box_afternm = crypto_secretbox;
        var crypto_box_open_afternm = crypto_secretbox_open;
        function crypto_box(c2, m5, d4, n7, y3, x3) {
          var k5 = new Uint8Array(32);
          crypto_box_beforenm(k5, y3, x3);
          return crypto_box_afternm(c2, m5, d4, n7, k5);
        }
        function crypto_box_open(m5, c2, d4, n7, y3, x3) {
          var k5 = new Uint8Array(32);
          crypto_box_beforenm(k5, y3, x3);
          return crypto_box_open_afternm(m5, c2, d4, n7, k5);
        }
        var K = [
          1116352408,
          3609767458,
          1899447441,
          602891725,
          3049323471,
          3964484399,
          3921009573,
          2173295548,
          961987163,
          4081628472,
          1508970993,
          3053834265,
          2453635748,
          2937671579,
          2870763221,
          3664609560,
          3624381080,
          2734883394,
          310598401,
          1164996542,
          607225278,
          1323610764,
          1426881987,
          3590304994,
          1925078388,
          4068182383,
          2162078206,
          991336113,
          2614888103,
          633803317,
          3248222580,
          3479774868,
          3835390401,
          2666613458,
          4022224774,
          944711139,
          264347078,
          2341262773,
          604807628,
          2007800933,
          770255983,
          1495990901,
          1249150122,
          1856431235,
          1555081692,
          3175218132,
          1996064986,
          2198950837,
          2554220882,
          3999719339,
          2821834349,
          766784016,
          2952996808,
          2566594879,
          3210313671,
          3203337956,
          3336571891,
          1034457026,
          3584528711,
          2466948901,
          113926993,
          3758326383,
          338241895,
          168717936,
          666307205,
          1188179964,
          773529912,
          1546045734,
          1294757372,
          1522805485,
          1396182291,
          2643833823,
          1695183700,
          2343527390,
          1986661051,
          1014477480,
          2177026350,
          1206759142,
          2456956037,
          344077627,
          2730485921,
          1290863460,
          2820302411,
          3158454273,
          3259730800,
          3505952657,
          3345764771,
          106217008,
          3516065817,
          3606008344,
          3600352804,
          1432725776,
          4094571909,
          1467031594,
          275423344,
          851169720,
          430227734,
          3100823752,
          506948616,
          1363258195,
          659060556,
          3750685593,
          883997877,
          3785050280,
          958139571,
          3318307427,
          1322822218,
          3812723403,
          1537002063,
          2003034995,
          1747873779,
          3602036899,
          1955562222,
          1575990012,
          2024104815,
          1125592928,
          2227730452,
          2716904306,
          2361852424,
          442776044,
          2428436474,
          593698344,
          2756734187,
          3733110249,
          3204031479,
          2999351573,
          3329325298,
          3815920427,
          3391569614,
          3928383900,
          3515267271,
          566280711,
          3940187606,
          3454069534,
          4118630271,
          4000239992,
          116418474,
          1914138554,
          174292421,
          2731055270,
          289380356,
          3203993006,
          460393269,
          320620315,
          685471733,
          587496836,
          852142971,
          1086792851,
          1017036298,
          365543100,
          1126000580,
          2618297676,
          1288033470,
          3409855158,
          1501505948,
          4234509866,
          1607167915,
          987167468,
          1816402316,
          1246189591
        ];
        function crypto_hashblocks_hl(hh, hl, m5, n7) {
          var wh = new Int32Array(16), wl = new Int32Array(16), bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7, bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7, th, tl, i8, j4, h4, l5, a4, b, c2, d4;
          var ah0 = hh[0], ah1 = hh[1], ah2 = hh[2], ah3 = hh[3], ah4 = hh[4], ah5 = hh[5], ah6 = hh[6], ah7 = hh[7], al0 = hl[0], al1 = hl[1], al2 = hl[2], al3 = hl[3], al4 = hl[4], al5 = hl[5], al6 = hl[6], al7 = hl[7];
          var pos = 0;
          while (n7 >= 128) {
            for (i8 = 0; i8 < 16; i8++) {
              j4 = 8 * i8 + pos;
              wh[i8] = m5[j4 + 0] << 24 | m5[j4 + 1] << 16 | m5[j4 + 2] << 8 | m5[j4 + 3];
              wl[i8] = m5[j4 + 4] << 24 | m5[j4 + 5] << 16 | m5[j4 + 6] << 8 | m5[j4 + 7];
            }
            for (i8 = 0; i8 < 80; i8++) {
              bh0 = ah0;
              bh1 = ah1;
              bh2 = ah2;
              bh3 = ah3;
              bh4 = ah4;
              bh5 = ah5;
              bh6 = ah6;
              bh7 = ah7;
              bl0 = al0;
              bl1 = al1;
              bl2 = al2;
              bl3 = al3;
              bl4 = al4;
              bl5 = al5;
              bl6 = al6;
              bl7 = al7;
              h4 = ah7;
              l5 = al7;
              a4 = l5 & 65535;
              b = l5 >>> 16;
              c2 = h4 & 65535;
              d4 = h4 >>> 16;
              h4 = (ah4 >>> 14 | al4 << 32 - 14) ^ (ah4 >>> 18 | al4 << 32 - 18) ^ (al4 >>> 41 - 32 | ah4 << 32 - (41 - 32));
              l5 = (al4 >>> 14 | ah4 << 32 - 14) ^ (al4 >>> 18 | ah4 << 32 - 18) ^ (ah4 >>> 41 - 32 | al4 << 32 - (41 - 32));
              a4 += l5 & 65535;
              b += l5 >>> 16;
              c2 += h4 & 65535;
              d4 += h4 >>> 16;
              h4 = ah4 & ah5 ^ ~ah4 & ah6;
              l5 = al4 & al5 ^ ~al4 & al6;
              a4 += l5 & 65535;
              b += l5 >>> 16;
              c2 += h4 & 65535;
              d4 += h4 >>> 16;
              h4 = K[i8 * 2];
              l5 = K[i8 * 2 + 1];
              a4 += l5 & 65535;
              b += l5 >>> 16;
              c2 += h4 & 65535;
              d4 += h4 >>> 16;
              h4 = wh[i8 % 16];
              l5 = wl[i8 % 16];
              a4 += l5 & 65535;
              b += l5 >>> 16;
              c2 += h4 & 65535;
              d4 += h4 >>> 16;
              b += a4 >>> 16;
              c2 += b >>> 16;
              d4 += c2 >>> 16;
              th = c2 & 65535 | d4 << 16;
              tl = a4 & 65535 | b << 16;
              h4 = th;
              l5 = tl;
              a4 = l5 & 65535;
              b = l5 >>> 16;
              c2 = h4 & 65535;
              d4 = h4 >>> 16;
              h4 = (ah0 >>> 28 | al0 << 32 - 28) ^ (al0 >>> 34 - 32 | ah0 << 32 - (34 - 32)) ^ (al0 >>> 39 - 32 | ah0 << 32 - (39 - 32));
              l5 = (al0 >>> 28 | ah0 << 32 - 28) ^ (ah0 >>> 34 - 32 | al0 << 32 - (34 - 32)) ^ (ah0 >>> 39 - 32 | al0 << 32 - (39 - 32));
              a4 += l5 & 65535;
              b += l5 >>> 16;
              c2 += h4 & 65535;
              d4 += h4 >>> 16;
              h4 = ah0 & ah1 ^ ah0 & ah2 ^ ah1 & ah2;
              l5 = al0 & al1 ^ al0 & al2 ^ al1 & al2;
              a4 += l5 & 65535;
              b += l5 >>> 16;
              c2 += h4 & 65535;
              d4 += h4 >>> 16;
              b += a4 >>> 16;
              c2 += b >>> 16;
              d4 += c2 >>> 16;
              bh7 = c2 & 65535 | d4 << 16;
              bl7 = a4 & 65535 | b << 16;
              h4 = bh3;
              l5 = bl3;
              a4 = l5 & 65535;
              b = l5 >>> 16;
              c2 = h4 & 65535;
              d4 = h4 >>> 16;
              h4 = th;
              l5 = tl;
              a4 += l5 & 65535;
              b += l5 >>> 16;
              c2 += h4 & 65535;
              d4 += h4 >>> 16;
              b += a4 >>> 16;
              c2 += b >>> 16;
              d4 += c2 >>> 16;
              bh3 = c2 & 65535 | d4 << 16;
              bl3 = a4 & 65535 | b << 16;
              ah1 = bh0;
              ah2 = bh1;
              ah3 = bh2;
              ah4 = bh3;
              ah5 = bh4;
              ah6 = bh5;
              ah7 = bh6;
              ah0 = bh7;
              al1 = bl0;
              al2 = bl1;
              al3 = bl2;
              al4 = bl3;
              al5 = bl4;
              al6 = bl5;
              al7 = bl6;
              al0 = bl7;
              if (i8 % 16 === 15) {
                for (j4 = 0; j4 < 16; j4++) {
                  h4 = wh[j4];
                  l5 = wl[j4];
                  a4 = l5 & 65535;
                  b = l5 >>> 16;
                  c2 = h4 & 65535;
                  d4 = h4 >>> 16;
                  h4 = wh[(j4 + 9) % 16];
                  l5 = wl[(j4 + 9) % 16];
                  a4 += l5 & 65535;
                  b += l5 >>> 16;
                  c2 += h4 & 65535;
                  d4 += h4 >>> 16;
                  th = wh[(j4 + 1) % 16];
                  tl = wl[(j4 + 1) % 16];
                  h4 = (th >>> 1 | tl << 32 - 1) ^ (th >>> 8 | tl << 32 - 8) ^ th >>> 7;
                  l5 = (tl >>> 1 | th << 32 - 1) ^ (tl >>> 8 | th << 32 - 8) ^ (tl >>> 7 | th << 32 - 7);
                  a4 += l5 & 65535;
                  b += l5 >>> 16;
                  c2 += h4 & 65535;
                  d4 += h4 >>> 16;
                  th = wh[(j4 + 14) % 16];
                  tl = wl[(j4 + 14) % 16];
                  h4 = (th >>> 19 | tl << 32 - 19) ^ (tl >>> 61 - 32 | th << 32 - (61 - 32)) ^ th >>> 6;
                  l5 = (tl >>> 19 | th << 32 - 19) ^ (th >>> 61 - 32 | tl << 32 - (61 - 32)) ^ (tl >>> 6 | th << 32 - 6);
                  a4 += l5 & 65535;
                  b += l5 >>> 16;
                  c2 += h4 & 65535;
                  d4 += h4 >>> 16;
                  b += a4 >>> 16;
                  c2 += b >>> 16;
                  d4 += c2 >>> 16;
                  wh[j4] = c2 & 65535 | d4 << 16;
                  wl[j4] = a4 & 65535 | b << 16;
                }
              }
            }
            h4 = ah0;
            l5 = al0;
            a4 = l5 & 65535;
            b = l5 >>> 16;
            c2 = h4 & 65535;
            d4 = h4 >>> 16;
            h4 = hh[0];
            l5 = hl[0];
            a4 += l5 & 65535;
            b += l5 >>> 16;
            c2 += h4 & 65535;
            d4 += h4 >>> 16;
            b += a4 >>> 16;
            c2 += b >>> 16;
            d4 += c2 >>> 16;
            hh[0] = ah0 = c2 & 65535 | d4 << 16;
            hl[0] = al0 = a4 & 65535 | b << 16;
            h4 = ah1;
            l5 = al1;
            a4 = l5 & 65535;
            b = l5 >>> 16;
            c2 = h4 & 65535;
            d4 = h4 >>> 16;
            h4 = hh[1];
            l5 = hl[1];
            a4 += l5 & 65535;
            b += l5 >>> 16;
            c2 += h4 & 65535;
            d4 += h4 >>> 16;
            b += a4 >>> 16;
            c2 += b >>> 16;
            d4 += c2 >>> 16;
            hh[1] = ah1 = c2 & 65535 | d4 << 16;
            hl[1] = al1 = a4 & 65535 | b << 16;
            h4 = ah2;
            l5 = al2;
            a4 = l5 & 65535;
            b = l5 >>> 16;
            c2 = h4 & 65535;
            d4 = h4 >>> 16;
            h4 = hh[2];
            l5 = hl[2];
            a4 += l5 & 65535;
            b += l5 >>> 16;
            c2 += h4 & 65535;
            d4 += h4 >>> 16;
            b += a4 >>> 16;
            c2 += b >>> 16;
            d4 += c2 >>> 16;
            hh[2] = ah2 = c2 & 65535 | d4 << 16;
            hl[2] = al2 = a4 & 65535 | b << 16;
            h4 = ah3;
            l5 = al3;
            a4 = l5 & 65535;
            b = l5 >>> 16;
            c2 = h4 & 65535;
            d4 = h4 >>> 16;
            h4 = hh[3];
            l5 = hl[3];
            a4 += l5 & 65535;
            b += l5 >>> 16;
            c2 += h4 & 65535;
            d4 += h4 >>> 16;
            b += a4 >>> 16;
            c2 += b >>> 16;
            d4 += c2 >>> 16;
            hh[3] = ah3 = c2 & 65535 | d4 << 16;
            hl[3] = al3 = a4 & 65535 | b << 16;
            h4 = ah4;
            l5 = al4;
            a4 = l5 & 65535;
            b = l5 >>> 16;
            c2 = h4 & 65535;
            d4 = h4 >>> 16;
            h4 = hh[4];
            l5 = hl[4];
            a4 += l5 & 65535;
            b += l5 >>> 16;
            c2 += h4 & 65535;
            d4 += h4 >>> 16;
            b += a4 >>> 16;
            c2 += b >>> 16;
            d4 += c2 >>> 16;
            hh[4] = ah4 = c2 & 65535 | d4 << 16;
            hl[4] = al4 = a4 & 65535 | b << 16;
            h4 = ah5;
            l5 = al5;
            a4 = l5 & 65535;
            b = l5 >>> 16;
            c2 = h4 & 65535;
            d4 = h4 >>> 16;
            h4 = hh[5];
            l5 = hl[5];
            a4 += l5 & 65535;
            b += l5 >>> 16;
            c2 += h4 & 65535;
            d4 += h4 >>> 16;
            b += a4 >>> 16;
            c2 += b >>> 16;
            d4 += c2 >>> 16;
            hh[5] = ah5 = c2 & 65535 | d4 << 16;
            hl[5] = al5 = a4 & 65535 | b << 16;
            h4 = ah6;
            l5 = al6;
            a4 = l5 & 65535;
            b = l5 >>> 16;
            c2 = h4 & 65535;
            d4 = h4 >>> 16;
            h4 = hh[6];
            l5 = hl[6];
            a4 += l5 & 65535;
            b += l5 >>> 16;
            c2 += h4 & 65535;
            d4 += h4 >>> 16;
            b += a4 >>> 16;
            c2 += b >>> 16;
            d4 += c2 >>> 16;
            hh[6] = ah6 = c2 & 65535 | d4 << 16;
            hl[6] = al6 = a4 & 65535 | b << 16;
            h4 = ah7;
            l5 = al7;
            a4 = l5 & 65535;
            b = l5 >>> 16;
            c2 = h4 & 65535;
            d4 = h4 >>> 16;
            h4 = hh[7];
            l5 = hl[7];
            a4 += l5 & 65535;
            b += l5 >>> 16;
            c2 += h4 & 65535;
            d4 += h4 >>> 16;
            b += a4 >>> 16;
            c2 += b >>> 16;
            d4 += c2 >>> 16;
            hh[7] = ah7 = c2 & 65535 | d4 << 16;
            hl[7] = al7 = a4 & 65535 | b << 16;
            pos += 128;
            n7 -= 128;
          }
          return n7;
        }
        function crypto_hash(out, m5, n7) {
          var hh = new Int32Array(8), hl = new Int32Array(8), x3 = new Uint8Array(256), i8, b = n7;
          hh[0] = 1779033703;
          hh[1] = 3144134277;
          hh[2] = 1013904242;
          hh[3] = 2773480762;
          hh[4] = 1359893119;
          hh[5] = 2600822924;
          hh[6] = 528734635;
          hh[7] = 1541459225;
          hl[0] = 4089235720;
          hl[1] = 2227873595;
          hl[2] = 4271175723;
          hl[3] = 1595750129;
          hl[4] = 2917565137;
          hl[5] = 725511199;
          hl[6] = 4215389547;
          hl[7] = 327033209;
          crypto_hashblocks_hl(hh, hl, m5, n7);
          n7 %= 128;
          for (i8 = 0; i8 < n7; i8++) x3[i8] = m5[b - n7 + i8];
          x3[n7] = 128;
          n7 = 256 - 128 * (n7 < 112 ? 1 : 0);
          x3[n7 - 9] = 0;
          ts64(x3, n7 - 8, b / 536870912 | 0, b << 3);
          crypto_hashblocks_hl(hh, hl, x3, n7);
          for (i8 = 0; i8 < 8; i8++) ts64(out, 8 * i8, hh[i8], hl[i8]);
          return 0;
        }
        function add(p5, q5) {
          var a4 = gf(), b = gf(), c2 = gf(), d4 = gf(), e8 = gf(), f3 = gf(), g5 = gf(), h4 = gf(), t21 = gf();
          Z(a4, p5[1], p5[0]);
          Z(t21, q5[1], q5[0]);
          M(a4, a4, t21);
          A(b, p5[0], p5[1]);
          A(t21, q5[0], q5[1]);
          M(b, b, t21);
          M(c2, p5[3], q5[3]);
          M(c2, c2, D22);
          M(d4, p5[2], q5[2]);
          A(d4, d4, d4);
          Z(e8, b, a4);
          Z(f3, d4, c2);
          A(g5, d4, c2);
          A(h4, b, a4);
          M(p5[0], e8, f3);
          M(p5[1], h4, g5);
          M(p5[2], g5, f3);
          M(p5[3], e8, h4);
        }
        function cswap(p5, q5, b) {
          var i8;
          for (i8 = 0; i8 < 4; i8++) {
            sel25519(p5[i8], q5[i8], b);
          }
        }
        function pack(r17, p5) {
          var tx = gf(), ty = gf(), zi = gf();
          inv25519(zi, p5[2]);
          M(tx, p5[0], zi);
          M(ty, p5[1], zi);
          pack25519(r17, ty);
          r17[31] ^= par25519(tx) << 7;
        }
        function scalarmult(p5, q5, s7) {
          var b, i8;
          set25519(p5[0], gf0);
          set25519(p5[1], gf1);
          set25519(p5[2], gf1);
          set25519(p5[3], gf0);
          for (i8 = 255; i8 >= 0; --i8) {
            b = s7[i8 / 8 | 0] >> (i8 & 7) & 1;
            cswap(p5, q5, b);
            add(q5, p5);
            add(p5, p5);
            cswap(p5, q5, b);
          }
        }
        function scalarbase(p5, s7) {
          var q5 = [gf(), gf(), gf(), gf()];
          set25519(q5[0], X);
          set25519(q5[1], Y);
          set25519(q5[2], gf1);
          M(q5[3], X, Y);
          scalarmult(p5, q5, s7);
        }
        function crypto_sign_keypair(pk, sk, seeded) {
          var d4 = new Uint8Array(64);
          var p5 = [gf(), gf(), gf(), gf()];
          var i8;
          if (!seeded) randombytes(sk, 32);
          crypto_hash(d4, sk, 32);
          d4[0] &= 248;
          d4[31] &= 127;
          d4[31] |= 64;
          scalarbase(p5, d4);
          pack(pk, p5);
          for (i8 = 0; i8 < 32; i8++) sk[i8 + 32] = pk[i8];
          return 0;
        }
        var L = new Float64Array([237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16]);
        function modL(r17, x3) {
          var carry, i8, j4, k5;
          for (i8 = 63; i8 >= 32; --i8) {
            carry = 0;
            for (j4 = i8 - 32, k5 = i8 - 12; j4 < k5; ++j4) {
              x3[j4] += carry - 16 * x3[i8] * L[j4 - (i8 - 32)];
              carry = Math.floor((x3[j4] + 128) / 256);
              x3[j4] -= carry * 256;
            }
            x3[j4] += carry;
            x3[i8] = 0;
          }
          carry = 0;
          for (j4 = 0; j4 < 32; j4++) {
            x3[j4] += carry - (x3[31] >> 4) * L[j4];
            carry = x3[j4] >> 8;
            x3[j4] &= 255;
          }
          for (j4 = 0; j4 < 32; j4++) x3[j4] -= carry * L[j4];
          for (i8 = 0; i8 < 32; i8++) {
            x3[i8 + 1] += x3[i8] >> 8;
            r17[i8] = x3[i8] & 255;
          }
        }
        function reduce(r17) {
          var x3 = new Float64Array(64), i8;
          for (i8 = 0; i8 < 64; i8++) x3[i8] = r17[i8];
          for (i8 = 0; i8 < 64; i8++) r17[i8] = 0;
          modL(r17, x3);
        }
        function crypto_sign(sm, m5, n7, sk) {
          var d4 = new Uint8Array(64), h4 = new Uint8Array(64), r17 = new Uint8Array(64);
          var i8, j4, x3 = new Float64Array(64);
          var p5 = [gf(), gf(), gf(), gf()];
          crypto_hash(d4, sk, 32);
          d4[0] &= 248;
          d4[31] &= 127;
          d4[31] |= 64;
          var smlen = n7 + 64;
          for (i8 = 0; i8 < n7; i8++) sm[64 + i8] = m5[i8];
          for (i8 = 0; i8 < 32; i8++) sm[32 + i8] = d4[32 + i8];
          crypto_hash(r17, sm.subarray(32), n7 + 32);
          reduce(r17);
          scalarbase(p5, r17);
          pack(sm, p5);
          for (i8 = 32; i8 < 64; i8++) sm[i8] = sk[i8];
          crypto_hash(h4, sm, n7 + 64);
          reduce(h4);
          for (i8 = 0; i8 < 64; i8++) x3[i8] = 0;
          for (i8 = 0; i8 < 32; i8++) x3[i8] = r17[i8];
          for (i8 = 0; i8 < 32; i8++) {
            for (j4 = 0; j4 < 32; j4++) {
              x3[i8 + j4] += h4[i8] * d4[j4];
            }
          }
          modL(sm.subarray(32), x3);
          return smlen;
        }
        function unpackneg(r17, p5) {
          var t21 = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
          set25519(r17[2], gf1);
          unpack25519(r17[1], p5);
          S4(num, r17[1]);
          M(den, num, D2);
          Z(num, num, r17[2]);
          A(den, r17[2], den);
          S4(den2, den);
          S4(den4, den2);
          M(den6, den4, den2);
          M(t21, den6, num);
          M(t21, t21, den);
          pow2523(t21, t21);
          M(t21, t21, num);
          M(t21, t21, den);
          M(t21, t21, den);
          M(r17[0], t21, den);
          S4(chk, r17[0]);
          M(chk, chk, den);
          if (neq25519(chk, num)) M(r17[0], r17[0], I4);
          S4(chk, r17[0]);
          M(chk, chk, den);
          if (neq25519(chk, num)) return -1;
          if (par25519(r17[0]) === p5[31] >> 7) Z(r17[0], gf0, r17[0]);
          M(r17[3], r17[0], r17[1]);
          return 0;
        }
        function crypto_sign_open(m5, sm, n7, pk) {
          var i8;
          var t21 = new Uint8Array(32), h4 = new Uint8Array(64);
          var p5 = [gf(), gf(), gf(), gf()], q5 = [gf(), gf(), gf(), gf()];
          if (n7 < 64) return -1;
          if (unpackneg(q5, pk)) return -1;
          for (i8 = 0; i8 < n7; i8++) m5[i8] = sm[i8];
          for (i8 = 0; i8 < 32; i8++) m5[i8 + 32] = pk[i8];
          crypto_hash(h4, m5, n7);
          reduce(h4);
          scalarmult(p5, q5, h4);
          scalarbase(q5, sm.subarray(32));
          add(p5, q5);
          pack(t21, p5);
          n7 -= 64;
          if (crypto_verify_32(sm, 0, t21, 0)) {
            for (i8 = 0; i8 < n7; i8++) m5[i8] = 0;
            return -1;
          }
          for (i8 = 0; i8 < n7; i8++) m5[i8] = sm[i8 + 64];
          return n7;
        }
        var crypto_secretbox_KEYBYTES = 32, crypto_secretbox_NONCEBYTES = 24, crypto_secretbox_ZEROBYTES = 32, crypto_secretbox_BOXZEROBYTES = 16, crypto_scalarmult_BYTES = 32, crypto_scalarmult_SCALARBYTES = 32, crypto_box_PUBLICKEYBYTES = 32, crypto_box_SECRETKEYBYTES = 32, crypto_box_BEFORENMBYTES = 32, crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES, crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES, crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES, crypto_sign_BYTES = 64, crypto_sign_PUBLICKEYBYTES = 32, crypto_sign_SECRETKEYBYTES = 64, crypto_sign_SEEDBYTES = 32, crypto_hash_BYTES = 64;
        nacl.lowlevel = {
          crypto_core_hsalsa20,
          crypto_stream_xor,
          crypto_stream,
          crypto_stream_salsa20_xor,
          crypto_stream_salsa20,
          crypto_onetimeauth,
          crypto_onetimeauth_verify,
          crypto_verify_16,
          crypto_verify_32,
          crypto_secretbox,
          crypto_secretbox_open,
          crypto_scalarmult,
          crypto_scalarmult_base,
          crypto_box_beforenm,
          crypto_box_afternm,
          crypto_box,
          crypto_box_open,
          crypto_box_keypair,
          crypto_hash,
          crypto_sign,
          crypto_sign_keypair,
          crypto_sign_open,
          crypto_secretbox_KEYBYTES,
          crypto_secretbox_NONCEBYTES,
          crypto_secretbox_ZEROBYTES,
          crypto_secretbox_BOXZEROBYTES,
          crypto_scalarmult_BYTES,
          crypto_scalarmult_SCALARBYTES,
          crypto_box_PUBLICKEYBYTES,
          crypto_box_SECRETKEYBYTES,
          crypto_box_BEFORENMBYTES,
          crypto_box_NONCEBYTES,
          crypto_box_ZEROBYTES,
          crypto_box_BOXZEROBYTES,
          crypto_sign_BYTES,
          crypto_sign_PUBLICKEYBYTES,
          crypto_sign_SECRETKEYBYTES,
          crypto_sign_SEEDBYTES,
          crypto_hash_BYTES,
          gf,
          D: D2,
          L,
          pack25519,
          unpack25519,
          M,
          A,
          S: S4,
          Z,
          pow2523,
          add,
          set25519,
          modL,
          scalarmult,
          scalarbase
        };
        function checkLengths(k5, n7) {
          if (k5.length !== crypto_secretbox_KEYBYTES) throw new Error("bad key size");
          if (n7.length !== crypto_secretbox_NONCEBYTES) throw new Error("bad nonce size");
        }
        function checkBoxLengths(pk, sk) {
          if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error("bad public key size");
          if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error("bad secret key size");
        }
        function checkArrayTypes() {
          for (var i8 = 0; i8 < arguments.length; i8++) {
            if (!(arguments[i8] instanceof Uint8Array))
              throw new TypeError("unexpected type, use Uint8Array");
          }
        }
        function cleanup(arr) {
          for (var i8 = 0; i8 < arr.length; i8++) arr[i8] = 0;
        }
        nacl.randomBytes = function(n7) {
          var b = new Uint8Array(n7);
          randombytes(b, n7);
          return b;
        };
        nacl.secretbox = function(msg, nonce, key) {
          checkArrayTypes(msg, nonce, key);
          checkLengths(key, nonce);
          var m5 = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
          var c2 = new Uint8Array(m5.length);
          for (var i8 = 0; i8 < msg.length; i8++) m5[i8 + crypto_secretbox_ZEROBYTES] = msg[i8];
          crypto_secretbox(c2, m5, m5.length, nonce, key);
          return c2.subarray(crypto_secretbox_BOXZEROBYTES);
        };
        nacl.secretbox.open = function(box, nonce, key) {
          checkArrayTypes(box, nonce, key);
          checkLengths(key, nonce);
          var c2 = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
          var m5 = new Uint8Array(c2.length);
          for (var i8 = 0; i8 < box.length; i8++) c2[i8 + crypto_secretbox_BOXZEROBYTES] = box[i8];
          if (c2.length < 32) return null;
          if (crypto_secretbox_open(m5, c2, c2.length, nonce, key) !== 0) return null;
          return m5.subarray(crypto_secretbox_ZEROBYTES);
        };
        nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
        nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
        nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;
        nacl.scalarMult = function(n7, p5) {
          checkArrayTypes(n7, p5);
          if (n7.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
          if (p5.length !== crypto_scalarmult_BYTES) throw new Error("bad p size");
          var q5 = new Uint8Array(crypto_scalarmult_BYTES);
          crypto_scalarmult(q5, n7, p5);
          return q5;
        };
        nacl.scalarMult.base = function(n7) {
          checkArrayTypes(n7);
          if (n7.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
          var q5 = new Uint8Array(crypto_scalarmult_BYTES);
          crypto_scalarmult_base(q5, n7);
          return q5;
        };
        nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
        nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;
        nacl.box = function(msg, nonce, publicKey, secretKey) {
          var k5 = nacl.box.before(publicKey, secretKey);
          return nacl.secretbox(msg, nonce, k5);
        };
        nacl.box.before = function(publicKey, secretKey) {
          checkArrayTypes(publicKey, secretKey);
          checkBoxLengths(publicKey, secretKey);
          var k5 = new Uint8Array(crypto_box_BEFORENMBYTES);
          crypto_box_beforenm(k5, publicKey, secretKey);
          return k5;
        };
        nacl.box.after = nacl.secretbox;
        nacl.box.open = function(msg, nonce, publicKey, secretKey) {
          var k5 = nacl.box.before(publicKey, secretKey);
          return nacl.secretbox.open(msg, nonce, k5);
        };
        nacl.box.open.after = nacl.secretbox.open;
        nacl.box.keyPair = function() {
          var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
          crypto_box_keypair(pk, sk);
          return { publicKey: pk, secretKey: sk };
        };
        nacl.box.keyPair.fromSecretKey = function(secretKey) {
          checkArrayTypes(secretKey);
          if (secretKey.length !== crypto_box_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
          crypto_scalarmult_base(pk, secretKey);
          return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
        };
        nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
        nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
        nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
        nacl.box.nonceLength = crypto_box_NONCEBYTES;
        nacl.box.overheadLength = nacl.secretbox.overheadLength;
        nacl.sign = function(msg, secretKey) {
          checkArrayTypes(msg, secretKey);
          if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var signedMsg = new Uint8Array(crypto_sign_BYTES + msg.length);
          crypto_sign(signedMsg, msg, msg.length, secretKey);
          return signedMsg;
        };
        nacl.sign.open = function(signedMsg, publicKey) {
          checkArrayTypes(signedMsg, publicKey);
          if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
            throw new Error("bad public key size");
          var tmp = new Uint8Array(signedMsg.length);
          var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
          if (mlen < 0) return null;
          var m5 = new Uint8Array(mlen);
          for (var i8 = 0; i8 < m5.length; i8++) m5[i8] = tmp[i8];
          return m5;
        };
        nacl.sign.detached = function(msg, secretKey) {
          var signedMsg = nacl.sign(msg, secretKey);
          var sig = new Uint8Array(crypto_sign_BYTES);
          for (var i8 = 0; i8 < sig.length; i8++) sig[i8] = signedMsg[i8];
          return sig;
        };
        nacl.sign.detached.verify = function(msg, sig, publicKey) {
          checkArrayTypes(msg, sig, publicKey);
          if (sig.length !== crypto_sign_BYTES)
            throw new Error("bad signature size");
          if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
            throw new Error("bad public key size");
          var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
          var m5 = new Uint8Array(crypto_sign_BYTES + msg.length);
          var i8;
          for (i8 = 0; i8 < crypto_sign_BYTES; i8++) sm[i8] = sig[i8];
          for (i8 = 0; i8 < msg.length; i8++) sm[i8 + crypto_sign_BYTES] = msg[i8];
          return crypto_sign_open(m5, sm, sm.length, publicKey) >= 0;
        };
        nacl.sign.keyPair = function() {
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
          crypto_sign_keypair(pk, sk);
          return { publicKey: pk, secretKey: sk };
        };
        nacl.sign.keyPair.fromSecretKey = function(secretKey) {
          checkArrayTypes(secretKey);
          if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          for (var i8 = 0; i8 < pk.length; i8++) pk[i8] = secretKey[32 + i8];
          return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
        };
        nacl.sign.keyPair.fromSeed = function(seed) {
          checkArrayTypes(seed);
          if (seed.length !== crypto_sign_SEEDBYTES)
            throw new Error("bad seed size");
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
          for (var i8 = 0; i8 < 32; i8++) sk[i8] = seed[i8];
          crypto_sign_keypair(pk, sk, true);
          return { publicKey: pk, secretKey: sk };
        };
        nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
        nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
        nacl.sign.seedLength = crypto_sign_SEEDBYTES;
        nacl.sign.signatureLength = crypto_sign_BYTES;
        nacl.hash = function(msg) {
          checkArrayTypes(msg);
          var h4 = new Uint8Array(crypto_hash_BYTES);
          crypto_hash(h4, msg, msg.length);
          return h4;
        };
        nacl.hash.hashLength = crypto_hash_BYTES;
        nacl.verify = function(x3, y3) {
          checkArrayTypes(x3, y3);
          if (x3.length === 0 || y3.length === 0) return false;
          if (x3.length !== y3.length) return false;
          return vn(x3, 0, y3, 0, x3.length) === 0 ? true : false;
        };
        nacl.setPRNG = function(fn) {
          randombytes = fn;
        };
        (function() {
          var crypto = typeof self !== "undefined" ? self.crypto || self.msCrypto : null;
          if (crypto && crypto.getRandomValues) {
            var QUOTA = 65536;
            nacl.setPRNG(function(x3, n7) {
              var i8, v8 = new Uint8Array(n7);
              for (i8 = 0; i8 < n7; i8 += QUOTA) {
                crypto.getRandomValues(v8.subarray(i8, i8 + Math.min(n7 - i8, QUOTA)));
              }
              for (i8 = 0; i8 < n7; i8++) x3[i8] = v8[i8];
              cleanup(v8);
            });
          } else if (typeof __require !== "undefined") {
            crypto = require_crypto();
            if (crypto && crypto.randomBytes) {
              nacl.setPRNG(function(x3, n7) {
                var i8, v8 = crypto.randomBytes(n7);
                for (i8 = 0; i8 < n7; i8++) x3[i8] = v8[i8];
                cleanup(v8);
              });
            }
          }
        })();
      })(typeof module !== "undefined" && module.exports ? module.exports : self.nacl = self.nacl || {});
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-JVMPPRNZ.js
  function R2(t21, e8) {
    if (v(t21)) return { isValid: false, message: "Old API key format detected. Please create a new API key from the Crossmint console." };
    let i8 = O(t21);
    if (i8 == null) return { isValid: false, message: `Malformed API key. Must start with '${r4.CLIENT}' or '${r4.SERVER}'.` };
    if ((e8 == null ? void 0 : e8.usageOrigin) != null && i8 !== e8.usageOrigin) return { isValid: false, message: `Disallowed API key. You passed a ${i8} API key, but a ${e8.usageOrigin} API key is required.` };
    let r17 = _2(t21);
    return r17 == null ? { isValid: false, message: `Malformed API key. Must have a valid environment: '${n2.DEVELOPMENT}', '${n2.STAGING}' or '${n2.PRODUCTION}'.` } : (e8 == null ? void 0 : e8.environment) != null && r17 !== e8.environment ? { isValid: false, message: `Disallowed API key. You passed a ${r17} API key, but a ${e8.environment} API key is required.` } : { isValid: true, usageOrigin: i8, environment: r17, prefix: `${g(i8)}_${r17}` };
  }
  function v(t21) {
    return t21.startsWith("sk_live") || t21.startsWith("sk_test");
  }
  function O(t21) {
    return t21.startsWith(r4.CLIENT + "_") ? t3.CLIENT : t21.startsWith(r4.SERVER + "_") ? t3.SERVER : null;
  }
  function _2(t21) {
    let e8 = t21.slice(3);
    return e8.startsWith(n2.DEVELOPMENT + "_") ? n2.DEVELOPMENT : e8.startsWith(n2.STAGING + "_") ? n2.STAGING : e8.startsWith(n2.PRODUCTION + "_") ? n2.PRODUCTION : null;
  }
  function S(t21, e8) {
    let i8 = R2(t21, e8);
    if (!i8.isValid) return i8;
    let { prefix: r17 } = i8, { keyData: n7, keyDataWithoutPrefix: s7, signature: l5 } = T(t21, r17);
    if (!k2(n7, l5, e8)) return { isValid: false, message: "Invalid API key. Failed to validate signature" };
    let [u4] = s7.split(".");
    return s3(r3({}, i8), { projectId: u4 });
  }
  function T(t21, e8) {
    let i8 = t21.slice(`${e8}_`.length), r17 = import_bs58.default.decode(i8), n7 = new TextDecoder().decode(r17), [s7, l5] = n7.split(":");
    return { keyData: `${e8}.${s7}`, keyDataWithoutPrefix: s7, signature: l5 };
  }
  function k2(t21, e8, i8) {
    let r17 = I(i8 == null ? void 0 : i8.environment);
    function n7(s7) {
      try {
        let l5 = import_bs58.default.decode(e8), P2 = new TextEncoder().encode(t21), u4 = import_bs58.default.decode(s7);
        return import_tweetnacl.default.sign.detached.verify(P2, l5, u4);
      } catch (l5) {
        return console.error("Failed to validate API key signature"), false;
      }
    }
    return r17 != null ? n7(r17) : n7(_) || n7(o3);
  }
  var import_bs58, import_tweetnacl;
  var init_chunk_JVMPPRNZ = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-JVMPPRNZ.js"() {
      init_chunk_WBULM2SU();
      init_chunk_U4QEE6R5();
      init_chunk_4RWQEYZX();
      init_chunk_XAJGDBTH();
      init_chunk_22GIA4MK();
      import_bs58 = __toESM(require_bs58(), 1);
      import_tweetnacl = __toESM(require_nacl_fast(), 1);
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-PSRMLT7J.js
  function y(r17, s7) {
    let { apiKey: e8, jwt: a4, overrideBaseUrl: o9 } = r17, t21 = S(e8, s7);
    if (!t21.isValid) throw new Error(t21.message);
    return { apiKey: e8, jwt: a4, overrideBaseUrl: o9 };
  }
  var init_chunk_PSRMLT7J = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-PSRMLT7J.js"() {
      init_chunk_JVMPPRNZ();
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-YNKYEHBW.js
  var n3;
  var init_chunk_YNKYEHBW = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-YNKYEHBW.js"() {
      init_chunk_22GIA4MK();
      n3 = class i2 {
        makeRequest(t21, e8) {
          return t2(this, null, function* () {
            return yield fetch(this.buildUrl(t21), s3(r3({}, e8), { headers: r3(r3({}, this.authHeaders), e8.headers) }));
          });
        }
        buildUrl(t21) {
          return `${i2.normalizePath(this.baseUrl)}/${i2.normalizePath(t21)}`;
        }
        get(t21, e8) {
          return t2(this, null, function* () {
            return yield this.makeRequest(t21, s3(r3({}, e8), { method: "GET" }));
          });
        }
        post(t21, e8) {
          return t2(this, null, function* () {
            return yield this.makeRequest(t21, s3(r3({}, e8), { method: "POST" }));
          });
        }
        put(t21, e8) {
          return t2(this, null, function* () {
            return yield this.makeRequest(t21, s3(r3({}, e8), { method: "PUT" }));
          });
        }
        delete(t21, e8) {
          return t2(this, null, function* () {
            return yield this.makeRequest(t21, s3(r3({}, e8), { method: "DELETE" }));
          });
        }
        patch(t21, e8) {
          return t2(this, null, function* () {
            return yield this.makeRequest(t21, s3(r3({}, e8), { method: "PATCH" }));
          });
        }
        static normalizePath(t21) {
          return t21 = t21.startsWith("/") ? t21.slice(1) : t21, t21 = t21.endsWith("/") ? t21.slice(0, -1) : t21, t21;
        }
      };
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-LTUL7WZA.js
  function t4(e8, n7) {
    switch (e8) {
      case "development":
        return (n7 == null ? void 0 : n7.development) || "http://localhost:3000";
      case "staging":
        return (n7 == null ? void 0 : n7.staging) || "https://staging.crossmint.com";
      case "production":
        return (n7 == null ? void 0 : n7.production) || "https://www.crossmint.com";
    }
  }
  var init_chunk_LTUL7WZA = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-LTUL7WZA.js"() {
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/chunk-V5BF3X7P.js
  var o4;
  var init_chunk_V5BF3X7P = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/chunk-V5BF3X7P.js"() {
      init_chunk_YNKYEHBW();
      init_chunk_JVMPPRNZ();
      init_chunk_LTUL7WZA();
      init_chunk_22GIA4MK();
      o4 = class extends n3 {
        constructor(t21, { internalConfig: r17 }) {
          let i8 = S(t21.apiKey, r17.apiKeyExpectations);
          if (!i8.isValid) throw new Error(i8.message);
          super();
          this.crossmint = t21;
          this.parsedAPIKey = i8, this.internalConfig = r17;
        }
        get baseUrl() {
          if (this.crossmint.overrideBaseUrl) return n3.normalizePath(this.crossmint.overrideBaseUrl);
          let t21 = t4(this.parsedAPIKey.environment);
          return n3.normalizePath(t21);
        }
        get authHeaders() {
          return r3({ "x-api-key": this.crossmint.apiKey }, this.crossmint.jwt ? { Authorization: `Bearer ${this.crossmint.jwt}` } : {});
        }
      };
    }
  });

  // node_modules/@crossmint/common-sdk-base/dist/index.js
  var init_dist = __esm({
    "node_modules/@crossmint/common-sdk-base/dist/index.js"() {
      init_chunk_PSRMLT7J();
      init_chunk_V5BF3X7P();
    }
  });

  // node_modules/@crossmint/client-sdk-react-ui/dist/chunk-6VJKARU5.js
  function m2(t21, i8) {
    return new o4(t21, { internalConfig: { sdkMetadata: { name: "@crossmint/client-sdk-react-ui", version: r2 }, apiKeyExpectations: i8 } });
  }
  var init_chunk_6VJKARU5 = __esm({
    "node_modules/@crossmint/client-sdk-react-ui/dist/chunk-6VJKARU5.js"() {
      init_chunk_JTKHTX3B();
      init_dist();
    }
  });

  // node_modules/react/cjs/react-jsx-runtime.production.js
  var require_react_jsx_runtime_production = __commonJS({
    "node_modules/react/cjs/react-jsx-runtime.production.js"(exports) {
      "use strict";
      var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      function jsxProd(type, config, maybeKey) {
        var key = null;
        void 0 !== maybeKey && (key = "" + maybeKey);
        void 0 !== config.key && (key = "" + config.key);
        if ("key" in config) {
          maybeKey = {};
          for (var propName in config)
            "key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        config = maybeKey.ref;
        return {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          ref: void 0 !== config ? config : null,
          props: maybeKey
        };
      }
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.jsx = jsxProd;
      exports.jsxs = jsxProd;
    }
  });

  // node_modules/react/jsx-runtime.js
  var require_jsx_runtime = __commonJS({
    "node_modules/react/jsx-runtime.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_jsx_runtime_production();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/@crossmint/client-sdk-react-ui/dist/chunk-ROJ6HFVK.js
  function J({ children: t21, apiKey: e8, overrideBaseUrl: c2 }) {
    let [m5, C] = (0, import_react.useState)(0), n7 = (0, import_react.useRef)(new Proxy(y({ apiKey: e8, overrideBaseUrl: c2 }), { set(r17, s7, i8) {
      return s7 === "jwt" && r17.jwt !== i8 && C((f3) => f3 + 1), Reflect.set(r17, s7, i8);
    } })), o9 = (0, import_react.useCallback)((r17) => {
      r17 !== n7.current.jwt && (n7.current.jwt = r17);
    }, []), d4 = (0, import_react.useMemo)(() => ({ get crossmint() {
      return n7.current;
    }, setJwt: o9 }), [o9, m5]);
    return (0, import_jsx_runtime.jsx)(u.Provider, { value: d4, children: t21 });
  }
  function N(t21) {
    let e8 = (0, import_react.useContext)(u);
    if (e8 == null) throw new Error(t21 != null ? t21 : "useCrossmint must be used within a CrossmintProvider");
    return e8;
  }
  var import_react, import_jsx_runtime, u;
  var init_chunk_ROJ6HFVK = __esm({
    "node_modules/@crossmint/client-sdk-react-ui/dist/chunk-ROJ6HFVK.js"() {
      import_react = __toESM(require_react(), 1);
      init_dist();
      import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
      u = (0, import_react.createContext)(null);
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-ES3ZGSIN.js
  function d(n7, i8) {
    for (let [t21, e8] of Object.entries(i8)) if (!(!e8 || typeof e8 == "function")) if (typeof e8 == "object") n7.append(t21, JSON.stringify(e8, (f3, o9) => typeof o9 == "function" ? "function" : o9));
    else if (typeof e8 == "string") {
      if (e8 === "undefined") continue;
      n7.append(t21, e8);
    } else ["boolean", "number"].includes(typeof e8) && n7.append(t21, e8.toString());
  }
  var init_chunk_ES3ZGSIN = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-ES3ZGSIN.js"() {
    }
  });

  // node_modules/@crossmint/client-sdk-window/dist/chunk-3D4ECMN2.js
  var r5;
  var init_chunk_3D4ECMN2 = __esm({
    "node_modules/@crossmint/client-sdk-window/dist/chunk-3D4ECMN2.js"() {
      r5 = () => Math.random().toString(36).substring(2, 15);
    }
  });

  // node_modules/@crossmint/client-sdk-window/dist/chunk-2NN7LKDP.js
  var o5, p4, q3, f2, k3, l3, j2, t5, u2, v3, x2;
  var init_chunk_2NN7LKDP = __esm({
    "node_modules/@crossmint/client-sdk-window/dist/chunk-2NN7LKDP.js"() {
      o5 = Object.defineProperty;
      p4 = Object.defineProperties;
      q3 = Object.getOwnPropertyDescriptors;
      f2 = Object.getOwnPropertySymbols;
      k3 = Object.prototype.hasOwnProperty;
      l3 = Object.prototype.propertyIsEnumerable;
      j2 = (a4, c2, b) => c2 in a4 ? o5(a4, c2, { enumerable: true, configurable: true, writable: true, value: b }) : a4[c2] = b;
      t5 = (a4, c2) => {
        for (var b in c2 || (c2 = {})) k3.call(c2, b) && j2(a4, b, c2[b]);
        if (f2) for (var b of f2(c2)) l3.call(c2, b) && j2(a4, b, c2[b]);
        return a4;
      };
      u2 = (a4, c2) => p4(a4, q3(c2));
      v3 = (a4, c2) => {
        var b = {};
        for (var d4 in a4) k3.call(a4, d4) && c2.indexOf(d4) < 0 && (b[d4] = a4[d4]);
        if (a4 != null && f2) for (var d4 of f2(a4)) c2.indexOf(d4) < 0 && l3.call(a4, d4) && (b[d4] = a4[d4]);
        return b;
      };
      x2 = (a4, c2, b) => new Promise((d4, i8) => {
        var m5 = (e8) => {
          try {
            g5(b.next(e8));
          } catch (h4) {
            i8(h4);
          }
        }, n7 = (e8) => {
          try {
            g5(b.throw(e8));
          } catch (h4) {
            i8(h4);
          }
        }, g5 = (e8) => e8.done ? d4(e8.value) : Promise.resolve(e8.value).then(m5, n7);
        g5((b = b.apply(a4, c2)).next());
      });
    }
  });

  // node_modules/@crossmint/client-sdk-window/dist/chunk-NOUALDXW.js
  var m3;
  var init_chunk_NOUALDXW = __esm({
    "node_modules/@crossmint/client-sdk-window/dist/chunk-NOUALDXW.js"() {
      init_chunk_3D4ECMN2();
      init_chunk_2NN7LKDP();
      m3 = class {
        constructor(t21, e8, i8, n7) {
          this.otherWindow = t21;
          this.targetOrigin = e8;
          this.incomingEvents = i8;
          this.outgoingEvents = n7;
          this.listeners = /* @__PURE__ */ new Map();
          this.otherWindow = t21, this.targetOrigin = e8;
        }
        send(t21, e8) {
          var n7;
          let i8 = this.outgoingEvents[t21].safeParse(e8);
          i8.success ? Array.isArray(this.targetOrigin) ? this.targetOrigin.forEach((r17) => {
            var s7;
            (s7 = this.otherWindow) == null || s7.postMessage({ event: t21, data: e8 }, r17);
          }) : (n7 = this.otherWindow) == null || n7.postMessage({ event: t21, data: e8 }, this.targetOrigin) : console.error("Invalid data for event", t21, i8.error);
        }
        on(t21, e8) {
          let i8 = (r17) => {
            if (r17.data.event === t21 && this.isTargetOrigin(r17.origin)) {
              let s7 = this.incomingEvents[t21].safeParse(r17.data.data);
              s7.success ? e8(s7.data) : console.error("Invalid data for event", t21, s7.error);
            }
          }, n7 = r5();
          return this.listeners.set(n7, i8), window.addEventListener("message", i8), n7;
        }
        sendAction({ event: t21, data: e8, responseEvent: i8, options: n7 }) {
          var s7;
          let r17 = (s7 = n7 == null ? void 0 : n7.timeoutMs) != null ? s7 : 7e3;
          return new Promise((c2, v8) => {
            let g5, a4 = setTimeout(() => {
              v8(`Timed out waiting for ${String(i8)} event${n7 != null && n7.condition ? ", with condition," : ""} after ${r17 / 1e3}s`);
            }, r17), d4 = this.on(i8, (o9) => {
              n7 != null && n7.condition && !n7.condition(o9) || (g5 && clearInterval(g5), clearTimeout(a4), this.off(d4), c2(o9));
            });
            this.send(t21, e8), n7 != null && n7.intervalMs && (g5 = setInterval(() => this.send(t21, e8), n7 == null ? void 0 : n7.intervalMs));
          });
        }
        onAction(n7) {
          return x2(this, null, function* () {
            var r17 = n7, { event: t21, options: e8 } = r17, i8 = v3(r17, ["event", "options"]);
            var c2;
            let s7 = (c2 = e8 == null ? void 0 : e8.timeoutMs) != null ? c2 : 7e3;
            return new Promise((v8, g5) => {
              let a4 = setTimeout(() => {
                g5(`Timed out waiting for ${String(t21)} event${e8 != null && e8.condition ? ", with condition," : ""} after ${s7 / 1e3}s`);
              }, s7), d4 = this.on(t21, (o9) => {
                if (!(e8 != null && e8.condition && !e8.condition(o9))) {
                  if ("callback" in i8 && i8.callback != null) {
                    let l5 = i8.callback(o9);
                    this.send(i8.responseEvent, l5);
                  }
                  this.off(d4), clearTimeout(a4), v8(o9);
                }
              });
            });
          });
        }
        off(t21) {
          let e8 = this.listeners.get(t21);
          e8 && (window.removeEventListener("message", e8), this.listeners.delete(t21));
        }
        isTargetOrigin(t21) {
          return Array.isArray(this.targetOrigin) ? this.targetOrigin.includes(t21) : this.targetOrigin === "*" ? true : this.targetOrigin === t21;
        }
      };
    }
  });

  // node_modules/@crossmint/client-sdk-window/node_modules/zod/lib/index.mjs
  function setErrorMap(map) {
    overrideErrorMap = map;
  }
  function getErrorMap() {
    return overrideErrorMap;
  }
  function addIssueToContext(ctx, issueData) {
    const issue = makeIssue({
      issueData,
      data: ctx.data,
      path: ctx.path,
      errorMaps: [
        ctx.common.contextualErrorMap,
        ctx.schemaErrorMap,
        getErrorMap(),
        errorMap
        // then global default map
      ].filter((x3) => !!x3)
    });
    ctx.common.issues.push(issue);
  }
  function processCreateParams(params) {
    if (!params)
      return {};
    const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
    if (errorMap2 && (invalid_type_error || required_error)) {
      throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap2)
      return { errorMap: errorMap2, description };
    const customMap = (iss, ctx) => {
      if (iss.code !== "invalid_type")
        return { message: ctx.defaultError };
      if (typeof ctx.data === "undefined") {
        return { message: required_error !== null && required_error !== void 0 ? required_error : ctx.defaultError };
      }
      return { message: invalid_type_error !== null && invalid_type_error !== void 0 ? invalid_type_error : ctx.defaultError };
    };
    return { errorMap: customMap, description };
  }
  function isValidIP(ip, version) {
    if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
      return true;
    }
    if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
      return true;
    }
    return false;
  }
  function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
    return valInt % stepInt / Math.pow(10, decCount);
  }
  function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
      const newShape = {};
      for (const key in schema.shape) {
        const fieldSchema = schema.shape[key];
        newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
      }
      return new ZodObject({
        ...schema._def,
        shape: () => newShape
      });
    } else if (schema instanceof ZodArray) {
      return new ZodArray({
        ...schema._def,
        type: deepPartialify(schema.element)
      });
    } else if (schema instanceof ZodOptional) {
      return ZodOptional.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodNullable) {
      return ZodNullable.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodTuple) {
      return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    } else {
      return schema;
    }
  }
  function mergeValues(a4, b) {
    const aType = getParsedType(a4);
    const bType = getParsedType(b);
    if (a4 === b) {
      return { valid: true, data: a4 };
    } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
      const bKeys = util.objectKeys(b);
      const sharedKeys = util.objectKeys(a4).filter((key) => bKeys.indexOf(key) !== -1);
      const newObj = { ...a4, ...b };
      for (const key of sharedKeys) {
        const sharedValue = mergeValues(a4[key], b[key]);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newObj[key] = sharedValue.data;
      }
      return { valid: true, data: newObj };
    } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
      if (a4.length !== b.length) {
        return { valid: false };
      }
      const newArray = [];
      for (let index = 0; index < a4.length; index++) {
        const itemA = a4[index];
        const itemB = b[index];
        const sharedValue = mergeValues(itemA, itemB);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newArray.push(sharedValue.data);
      }
      return { valid: true, data: newArray };
    } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a4 === +b) {
      return { valid: true, data: a4 };
    } else {
      return { valid: false };
    }
  }
  function createZodEnum(values, params) {
    return new ZodEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      ...processCreateParams(params)
    });
  }
  var util, objectUtil, ZodParsedType, getParsedType, ZodIssueCode, quotelessJson, ZodError, errorMap, overrideErrorMap, makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid, isAsync, errorUtil, ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv6Regex, datetimeRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, custom, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER, z;
  var init_lib = __esm({
    "node_modules/@crossmint/client-sdk-window/node_modules/zod/lib/index.mjs"() {
      (function(util2) {
        util2.assertEqual = (val) => val;
        function assertIs(_arg) {
        }
        util2.assertIs = assertIs;
        function assertNever(_x) {
          throw new Error();
        }
        util2.assertNever = assertNever;
        util2.arrayToEnum = (items) => {
          const obj = {};
          for (const item of items) {
            obj[item] = item;
          }
          return obj;
        };
        util2.getValidEnumValues = (obj) => {
          const validKeys = util2.objectKeys(obj).filter((k5) => typeof obj[obj[k5]] !== "number");
          const filtered = {};
          for (const k5 of validKeys) {
            filtered[k5] = obj[k5];
          }
          return util2.objectValues(filtered);
        };
        util2.objectValues = (obj) => {
          return util2.objectKeys(obj).map(function(e8) {
            return obj[e8];
          });
        };
        util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
          const keys = [];
          for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
              keys.push(key);
            }
          }
          return keys;
        };
        util2.find = (arr, checker) => {
          for (const item of arr) {
            if (checker(item))
              return item;
          }
          return void 0;
        };
        util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
        function joinValues(array, separator = " | ") {
          return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
        }
        util2.joinValues = joinValues;
        util2.jsonStringifyReplacer = (_3, value) => {
          if (typeof value === "bigint") {
            return value.toString();
          }
          return value;
        };
      })(util || (util = {}));
      (function(objectUtil2) {
        objectUtil2.mergeShapes = (first, second) => {
          return {
            ...first,
            ...second
            // second overwrites first
          };
        };
      })(objectUtil || (objectUtil = {}));
      ZodParsedType = util.arrayToEnum([
        "string",
        "nan",
        "number",
        "integer",
        "float",
        "boolean",
        "date",
        "bigint",
        "symbol",
        "function",
        "undefined",
        "null",
        "array",
        "object",
        "unknown",
        "promise",
        "void",
        "never",
        "map",
        "set"
      ]);
      getParsedType = (data) => {
        const t21 = typeof data;
        switch (t21) {
          case "undefined":
            return ZodParsedType.undefined;
          case "string":
            return ZodParsedType.string;
          case "number":
            return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
          case "boolean":
            return ZodParsedType.boolean;
          case "function":
            return ZodParsedType.function;
          case "bigint":
            return ZodParsedType.bigint;
          case "symbol":
            return ZodParsedType.symbol;
          case "object":
            if (Array.isArray(data)) {
              return ZodParsedType.array;
            }
            if (data === null) {
              return ZodParsedType.null;
            }
            if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
              return ZodParsedType.promise;
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
              return ZodParsedType.map;
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
              return ZodParsedType.set;
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
              return ZodParsedType.date;
            }
            return ZodParsedType.object;
          default:
            return ZodParsedType.unknown;
        }
      };
      ZodIssueCode = util.arrayToEnum([
        "invalid_type",
        "invalid_literal",
        "custom",
        "invalid_union",
        "invalid_union_discriminator",
        "invalid_enum_value",
        "unrecognized_keys",
        "invalid_arguments",
        "invalid_return_type",
        "invalid_date",
        "invalid_string",
        "too_small",
        "too_big",
        "invalid_intersection_types",
        "not_multiple_of",
        "not_finite"
      ]);
      quotelessJson = (obj) => {
        const json = JSON.stringify(obj, null, 2);
        return json.replace(/"([^"]+)":/g, "$1:");
      };
      ZodError = class extends Error {
        constructor(issues) {
          super();
          this.issues = [];
          this.addIssue = (sub) => {
            this.issues = [...this.issues, sub];
          };
          this.addIssues = (subs = []) => {
            this.issues = [...this.issues, ...subs];
          };
          const actualProto = new.target.prototype;
          if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
          } else {
            this.__proto__ = actualProto;
          }
          this.name = "ZodError";
          this.issues = issues;
        }
        get errors() {
          return this.issues;
        }
        format(_mapper) {
          const mapper = _mapper || function(issue) {
            return issue.message;
          };
          const fieldErrors = { _errors: [] };
          const processError = (error) => {
            for (const issue of error.issues) {
              if (issue.code === "invalid_union") {
                issue.unionErrors.map(processError);
              } else if (issue.code === "invalid_return_type") {
                processError(issue.returnTypeError);
              } else if (issue.code === "invalid_arguments") {
                processError(issue.argumentsError);
              } else if (issue.path.length === 0) {
                fieldErrors._errors.push(mapper(issue));
              } else {
                let curr = fieldErrors;
                let i8 = 0;
                while (i8 < issue.path.length) {
                  const el = issue.path[i8];
                  const terminal = i8 === issue.path.length - 1;
                  if (!terminal) {
                    curr[el] = curr[el] || { _errors: [] };
                  } else {
                    curr[el] = curr[el] || { _errors: [] };
                    curr[el]._errors.push(mapper(issue));
                  }
                  curr = curr[el];
                  i8++;
                }
              }
            }
          };
          processError(this);
          return fieldErrors;
        }
        toString() {
          return this.message;
        }
        get message() {
          return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
        }
        get isEmpty() {
          return this.issues.length === 0;
        }
        flatten(mapper = (issue) => issue.message) {
          const fieldErrors = {};
          const formErrors = [];
          for (const sub of this.issues) {
            if (sub.path.length > 0) {
              fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
              fieldErrors[sub.path[0]].push(mapper(sub));
            } else {
              formErrors.push(mapper(sub));
            }
          }
          return { formErrors, fieldErrors };
        }
        get formErrors() {
          return this.flatten();
        }
      };
      ZodError.create = (issues) => {
        const error = new ZodError(issues);
        return error;
      };
      errorMap = (issue, _ctx) => {
        let message;
        switch (issue.code) {
          case ZodIssueCode.invalid_type:
            if (issue.received === ZodParsedType.undefined) {
              message = "Required";
            } else {
              message = `Expected ${issue.expected}, received ${issue.received}`;
            }
            break;
          case ZodIssueCode.invalid_literal:
            message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
            break;
          case ZodIssueCode.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
            break;
          case ZodIssueCode.invalid_union:
            message = `Invalid input`;
            break;
          case ZodIssueCode.invalid_union_discriminator:
            message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
            break;
          case ZodIssueCode.invalid_enum_value:
            message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
            break;
          case ZodIssueCode.invalid_arguments:
            message = `Invalid function arguments`;
            break;
          case ZodIssueCode.invalid_return_type:
            message = `Invalid function return type`;
            break;
          case ZodIssueCode.invalid_date:
            message = `Invalid date`;
            break;
          case ZodIssueCode.invalid_string:
            if (typeof issue.validation === "object") {
              if ("includes" in issue.validation) {
                message = `Invalid input: must include "${issue.validation.includes}"`;
                if (typeof issue.validation.position === "number") {
                  message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
                }
              } else if ("startsWith" in issue.validation) {
                message = `Invalid input: must start with "${issue.validation.startsWith}"`;
              } else if ("endsWith" in issue.validation) {
                message = `Invalid input: must end with "${issue.validation.endsWith}"`;
              } else {
                util.assertNever(issue.validation);
              }
            } else if (issue.validation !== "regex") {
              message = `Invalid ${issue.validation}`;
            } else {
              message = "Invalid";
            }
            break;
          case ZodIssueCode.too_small:
            if (issue.type === "array")
              message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
            else if (issue.type === "string")
              message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
            else if (issue.type === "number")
              message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
            else if (issue.type === "date")
              message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
            else
              message = "Invalid input";
            break;
          case ZodIssueCode.too_big:
            if (issue.type === "array")
              message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
            else if (issue.type === "string")
              message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
            else if (issue.type === "number")
              message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
            else if (issue.type === "bigint")
              message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
            else if (issue.type === "date")
              message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
            else
              message = "Invalid input";
            break;
          case ZodIssueCode.custom:
            message = `Invalid input`;
            break;
          case ZodIssueCode.invalid_intersection_types:
            message = `Intersection results could not be merged`;
            break;
          case ZodIssueCode.not_multiple_of:
            message = `Number must be a multiple of ${issue.multipleOf}`;
            break;
          case ZodIssueCode.not_finite:
            message = "Number must be finite";
            break;
          default:
            message = _ctx.defaultError;
            util.assertNever(issue);
        }
        return { message };
      };
      overrideErrorMap = errorMap;
      makeIssue = (params) => {
        const { data, path, errorMaps, issueData } = params;
        const fullPath = [...path, ...issueData.path || []];
        const fullIssue = {
          ...issueData,
          path: fullPath
        };
        let errorMessage = "";
        const maps = errorMaps.filter((m5) => !!m5).slice().reverse();
        for (const map of maps) {
          errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
        }
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message || errorMessage
        };
      };
      EMPTY_PATH = [];
      ParseStatus = class _ParseStatus {
        constructor() {
          this.value = "valid";
        }
        dirty() {
          if (this.value === "valid")
            this.value = "dirty";
        }
        abort() {
          if (this.value !== "aborted")
            this.value = "aborted";
        }
        static mergeArray(status, results) {
          const arrayValue = [];
          for (const s7 of results) {
            if (s7.status === "aborted")
              return INVALID;
            if (s7.status === "dirty")
              status.dirty();
            arrayValue.push(s7.value);
          }
          return { status: status.value, value: arrayValue };
        }
        static async mergeObjectAsync(status, pairs) {
          const syncPairs = [];
          for (const pair of pairs) {
            syncPairs.push({
              key: await pair.key,
              value: await pair.value
            });
          }
          return _ParseStatus.mergeObjectSync(status, syncPairs);
        }
        static mergeObjectSync(status, pairs) {
          const finalObject = {};
          for (const pair of pairs) {
            const { key, value } = pair;
            if (key.status === "aborted")
              return INVALID;
            if (value.status === "aborted")
              return INVALID;
            if (key.status === "dirty")
              status.dirty();
            if (value.status === "dirty")
              status.dirty();
            if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
              finalObject[key.value] = value.value;
            }
          }
          return { status: status.value, value: finalObject };
        }
      };
      INVALID = Object.freeze({
        status: "aborted"
      });
      DIRTY = (value) => ({ status: "dirty", value });
      OK = (value) => ({ status: "valid", value });
      isAborted = (x3) => x3.status === "aborted";
      isDirty = (x3) => x3.status === "dirty";
      isValid = (x3) => x3.status === "valid";
      isAsync = (x3) => typeof Promise !== "undefined" && x3 instanceof Promise;
      (function(errorUtil2) {
        errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
        errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
      })(errorUtil || (errorUtil = {}));
      ParseInputLazyPath = class {
        constructor(parent, value, path, key) {
          this._cachedPath = [];
          this.parent = parent;
          this.data = value;
          this._path = path;
          this._key = key;
        }
        get path() {
          if (!this._cachedPath.length) {
            if (this._key instanceof Array) {
              this._cachedPath.push(...this._path, ...this._key);
            } else {
              this._cachedPath.push(...this._path, this._key);
            }
          }
          return this._cachedPath;
        }
      };
      handleResult = (ctx, result) => {
        if (isValid(result)) {
          return { success: true, data: result.value };
        } else {
          if (!ctx.common.issues.length) {
            throw new Error("Validation failed but no issues detected.");
          }
          return {
            success: false,
            get error() {
              if (this._error)
                return this._error;
              const error = new ZodError(ctx.common.issues);
              this._error = error;
              return this._error;
            }
          };
        }
      };
      ZodType = class {
        constructor(def) {
          this.spa = this.safeParseAsync;
          this._def = def;
          this.parse = this.parse.bind(this);
          this.safeParse = this.safeParse.bind(this);
          this.parseAsync = this.parseAsync.bind(this);
          this.safeParseAsync = this.safeParseAsync.bind(this);
          this.spa = this.spa.bind(this);
          this.refine = this.refine.bind(this);
          this.refinement = this.refinement.bind(this);
          this.superRefine = this.superRefine.bind(this);
          this.optional = this.optional.bind(this);
          this.nullable = this.nullable.bind(this);
          this.nullish = this.nullish.bind(this);
          this.array = this.array.bind(this);
          this.promise = this.promise.bind(this);
          this.or = this.or.bind(this);
          this.and = this.and.bind(this);
          this.transform = this.transform.bind(this);
          this.brand = this.brand.bind(this);
          this.default = this.default.bind(this);
          this.catch = this.catch.bind(this);
          this.describe = this.describe.bind(this);
          this.pipe = this.pipe.bind(this);
          this.readonly = this.readonly.bind(this);
          this.isNullable = this.isNullable.bind(this);
          this.isOptional = this.isOptional.bind(this);
        }
        get description() {
          return this._def.description;
        }
        _getType(input) {
          return getParsedType(input.data);
        }
        _getOrReturnCtx(input, ctx) {
          return ctx || {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          };
        }
        _processInputParams(input) {
          return {
            status: new ParseStatus(),
            ctx: {
              common: input.parent.common,
              data: input.data,
              parsedType: getParsedType(input.data),
              schemaErrorMap: this._def.errorMap,
              path: input.path,
              parent: input.parent
            }
          };
        }
        _parseSync(input) {
          const result = this._parse(input);
          if (isAsync(result)) {
            throw new Error("Synchronous parse encountered promise.");
          }
          return result;
        }
        _parseAsync(input) {
          const result = this._parse(input);
          return Promise.resolve(result);
        }
        parse(data, params) {
          const result = this.safeParse(data, params);
          if (result.success)
            return result.data;
          throw result.error;
        }
        safeParse(data, params) {
          var _a;
          const ctx = {
            common: {
              issues: [],
              async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
              contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
            },
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: getParsedType(data)
          };
          const result = this._parseSync({ data, path: ctx.path, parent: ctx });
          return handleResult(ctx, result);
        }
        async parseAsync(data, params) {
          const result = await this.safeParseAsync(data, params);
          if (result.success)
            return result.data;
          throw result.error;
        }
        async safeParseAsync(data, params) {
          const ctx = {
            common: {
              issues: [],
              contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
              async: true
            },
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: getParsedType(data)
          };
          const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
          const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
          return handleResult(ctx, result);
        }
        refine(check, message) {
          const getIssueProperties = (val) => {
            if (typeof message === "string" || typeof message === "undefined") {
              return { message };
            } else if (typeof message === "function") {
              return message(val);
            } else {
              return message;
            }
          };
          return this._refinement((val, ctx) => {
            const result = check(val);
            const setError = () => ctx.addIssue({
              code: ZodIssueCode.custom,
              ...getIssueProperties(val)
            });
            if (typeof Promise !== "undefined" && result instanceof Promise) {
              return result.then((data) => {
                if (!data) {
                  setError();
                  return false;
                } else {
                  return true;
                }
              });
            }
            if (!result) {
              setError();
              return false;
            } else {
              return true;
            }
          });
        }
        refinement(check, refinementData) {
          return this._refinement((val, ctx) => {
            if (!check(val)) {
              ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
              return false;
            } else {
              return true;
            }
          });
        }
        _refinement(refinement) {
          return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "refinement", refinement }
          });
        }
        superRefine(refinement) {
          return this._refinement(refinement);
        }
        optional() {
          return ZodOptional.create(this, this._def);
        }
        nullable() {
          return ZodNullable.create(this, this._def);
        }
        nullish() {
          return this.nullable().optional();
        }
        array() {
          return ZodArray.create(this, this._def);
        }
        promise() {
          return ZodPromise.create(this, this._def);
        }
        or(option) {
          return ZodUnion.create([this, option], this._def);
        }
        and(incoming) {
          return ZodIntersection.create(this, incoming, this._def);
        }
        transform(transform) {
          return new ZodEffects({
            ...processCreateParams(this._def),
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "transform", transform }
          });
        }
        default(def) {
          const defaultValueFunc = typeof def === "function" ? def : () => def;
          return new ZodDefault({
            ...processCreateParams(this._def),
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodDefault
          });
        }
        brand() {
          return new ZodBranded({
            typeName: ZodFirstPartyTypeKind.ZodBranded,
            type: this,
            ...processCreateParams(this._def)
          });
        }
        catch(def) {
          const catchValueFunc = typeof def === "function" ? def : () => def;
          return new ZodCatch({
            ...processCreateParams(this._def),
            innerType: this,
            catchValue: catchValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodCatch
          });
        }
        describe(description) {
          const This = this.constructor;
          return new This({
            ...this._def,
            description
          });
        }
        pipe(target) {
          return ZodPipeline.create(this, target);
        }
        readonly() {
          return ZodReadonly.create(this);
        }
        isOptional() {
          return this.safeParse(void 0).success;
        }
        isNullable() {
          return this.safeParse(null).success;
        }
      };
      cuidRegex = /^c[^\s-]{8,}$/i;
      cuid2Regex = /^[a-z][a-z0-9]*$/;
      ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
      uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
      _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
      ipv4Regex = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
      ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
      datetimeRegex = (args) => {
        if (args.precision) {
          if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
          } else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`);
          }
        } else if (args.precision === 0) {
          if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
          } else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
          }
        } else {
          if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
          } else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`);
          }
        }
      };
      ZodString = class _ZodString extends ZodType {
        _parse(input) {
          if (this._def.coerce) {
            input.data = String(input.data);
          }
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.string) {
            const ctx2 = this._getOrReturnCtx(input);
            addIssueToContext(
              ctx2,
              {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.string,
                received: ctx2.parsedType
              }
              //
            );
            return INVALID;
          }
          const status = new ParseStatus();
          let ctx = void 0;
          for (const check of this._def.checks) {
            if (check.kind === "min") {
              if (input.data.length < check.value) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: false,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "max") {
              if (input.data.length > check.value) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: false,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "length") {
              const tooBig = input.data.length > check.value;
              const tooSmall = input.data.length < check.value;
              if (tooBig || tooSmall) {
                ctx = this._getOrReturnCtx(input, ctx);
                if (tooBig) {
                  addIssueToContext(ctx, {
                    code: ZodIssueCode.too_big,
                    maximum: check.value,
                    type: "string",
                    inclusive: true,
                    exact: true,
                    message: check.message
                  });
                } else if (tooSmall) {
                  addIssueToContext(ctx, {
                    code: ZodIssueCode.too_small,
                    minimum: check.value,
                    type: "string",
                    inclusive: true,
                    exact: true,
                    message: check.message
                  });
                }
                status.dirty();
              }
            } else if (check.kind === "email") {
              if (!emailRegex.test(input.data)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  validation: "email",
                  code: ZodIssueCode.invalid_string,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "emoji") {
              if (!emojiRegex) {
                emojiRegex = new RegExp(_emojiRegex, "u");
              }
              if (!emojiRegex.test(input.data)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  validation: "emoji",
                  code: ZodIssueCode.invalid_string,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "uuid") {
              if (!uuidRegex.test(input.data)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  validation: "uuid",
                  code: ZodIssueCode.invalid_string,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "cuid") {
              if (!cuidRegex.test(input.data)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  validation: "cuid",
                  code: ZodIssueCode.invalid_string,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "cuid2") {
              if (!cuid2Regex.test(input.data)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  validation: "cuid2",
                  code: ZodIssueCode.invalid_string,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "ulid") {
              if (!ulidRegex.test(input.data)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  validation: "ulid",
                  code: ZodIssueCode.invalid_string,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "url") {
              try {
                new URL(input.data);
              } catch (_a) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  validation: "url",
                  code: ZodIssueCode.invalid_string,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "regex") {
              check.regex.lastIndex = 0;
              const testResult = check.regex.test(input.data);
              if (!testResult) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  validation: "regex",
                  code: ZodIssueCode.invalid_string,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "trim") {
              input.data = input.data.trim();
            } else if (check.kind === "includes") {
              if (!input.data.includes(check.value, check.position)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.invalid_string,
                  validation: { includes: check.value, position: check.position },
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "toLowerCase") {
              input.data = input.data.toLowerCase();
            } else if (check.kind === "toUpperCase") {
              input.data = input.data.toUpperCase();
            } else if (check.kind === "startsWith") {
              if (!input.data.startsWith(check.value)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.invalid_string,
                  validation: { startsWith: check.value },
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "endsWith") {
              if (!input.data.endsWith(check.value)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.invalid_string,
                  validation: { endsWith: check.value },
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "datetime") {
              const regex = datetimeRegex(check);
              if (!regex.test(input.data)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.invalid_string,
                  validation: "datetime",
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "ip") {
              if (!isValidIP(input.data, check.version)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  validation: "ip",
                  code: ZodIssueCode.invalid_string,
                  message: check.message
                });
                status.dirty();
              }
            } else {
              util.assertNever(check);
            }
          }
          return { status: status.value, value: input.data };
        }
        _regex(regex, validation, message) {
          return this.refinement((data) => regex.test(data), {
            validation,
            code: ZodIssueCode.invalid_string,
            ...errorUtil.errToObj(message)
          });
        }
        _addCheck(check) {
          return new _ZodString({
            ...this._def,
            checks: [...this._def.checks, check]
          });
        }
        email(message) {
          return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
        }
        url(message) {
          return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
        }
        emoji(message) {
          return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
        }
        uuid(message) {
          return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
        }
        cuid(message) {
          return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
        }
        cuid2(message) {
          return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
        }
        ulid(message) {
          return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
        }
        ip(options) {
          return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
        }
        datetime(options) {
          var _a;
          if (typeof options === "string") {
            return this._addCheck({
              kind: "datetime",
              precision: null,
              offset: false,
              message: options
            });
          }
          return this._addCheck({
            kind: "datetime",
            precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
            offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
            ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
          });
        }
        regex(regex, message) {
          return this._addCheck({
            kind: "regex",
            regex,
            ...errorUtil.errToObj(message)
          });
        }
        includes(value, options) {
          return this._addCheck({
            kind: "includes",
            value,
            position: options === null || options === void 0 ? void 0 : options.position,
            ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
          });
        }
        startsWith(value, message) {
          return this._addCheck({
            kind: "startsWith",
            value,
            ...errorUtil.errToObj(message)
          });
        }
        endsWith(value, message) {
          return this._addCheck({
            kind: "endsWith",
            value,
            ...errorUtil.errToObj(message)
          });
        }
        min(minLength, message) {
          return this._addCheck({
            kind: "min",
            value: minLength,
            ...errorUtil.errToObj(message)
          });
        }
        max(maxLength, message) {
          return this._addCheck({
            kind: "max",
            value: maxLength,
            ...errorUtil.errToObj(message)
          });
        }
        length(len, message) {
          return this._addCheck({
            kind: "length",
            value: len,
            ...errorUtil.errToObj(message)
          });
        }
        /**
         * @deprecated Use z.string().min(1) instead.
         * @see {@link ZodString.min}
         */
        nonempty(message) {
          return this.min(1, errorUtil.errToObj(message));
        }
        trim() {
          return new _ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "trim" }]
          });
        }
        toLowerCase() {
          return new _ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toLowerCase" }]
          });
        }
        toUpperCase() {
          return new _ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toUpperCase" }]
          });
        }
        get isDatetime() {
          return !!this._def.checks.find((ch) => ch.kind === "datetime");
        }
        get isEmail() {
          return !!this._def.checks.find((ch) => ch.kind === "email");
        }
        get isURL() {
          return !!this._def.checks.find((ch) => ch.kind === "url");
        }
        get isEmoji() {
          return !!this._def.checks.find((ch) => ch.kind === "emoji");
        }
        get isUUID() {
          return !!this._def.checks.find((ch) => ch.kind === "uuid");
        }
        get isCUID() {
          return !!this._def.checks.find((ch) => ch.kind === "cuid");
        }
        get isCUID2() {
          return !!this._def.checks.find((ch) => ch.kind === "cuid2");
        }
        get isULID() {
          return !!this._def.checks.find((ch) => ch.kind === "ulid");
        }
        get isIP() {
          return !!this._def.checks.find((ch) => ch.kind === "ip");
        }
        get minLength() {
          let min = null;
          for (const ch of this._def.checks) {
            if (ch.kind === "min") {
              if (min === null || ch.value > min)
                min = ch.value;
            }
          }
          return min;
        }
        get maxLength() {
          let max = null;
          for (const ch of this._def.checks) {
            if (ch.kind === "max") {
              if (max === null || ch.value < max)
                max = ch.value;
            }
          }
          return max;
        }
      };
      ZodString.create = (params) => {
        var _a;
        return new ZodString({
          checks: [],
          typeName: ZodFirstPartyTypeKind.ZodString,
          coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
          ...processCreateParams(params)
        });
      };
      ZodNumber = class _ZodNumber extends ZodType {
        constructor() {
          super(...arguments);
          this.min = this.gte;
          this.max = this.lte;
          this.step = this.multipleOf;
        }
        _parse(input) {
          if (this._def.coerce) {
            input.data = Number(input.data);
          }
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.number) {
            const ctx2 = this._getOrReturnCtx(input);
            addIssueToContext(ctx2, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.number,
              received: ctx2.parsedType
            });
            return INVALID;
          }
          let ctx = void 0;
          const status = new ParseStatus();
          for (const check of this._def.checks) {
            if (check.kind === "int") {
              if (!util.isInteger(input.data)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.invalid_type,
                  expected: "integer",
                  received: "float",
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "min") {
              const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
              if (tooSmall) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "number",
                  inclusive: check.inclusive,
                  exact: false,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "max") {
              const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
              if (tooBig) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "number",
                  inclusive: check.inclusive,
                  exact: false,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "multipleOf") {
              if (floatSafeRemainder(input.data, check.value) !== 0) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.not_multiple_of,
                  multipleOf: check.value,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "finite") {
              if (!Number.isFinite(input.data)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.not_finite,
                  message: check.message
                });
                status.dirty();
              }
            } else {
              util.assertNever(check);
            }
          }
          return { status: status.value, value: input.data };
        }
        gte(value, message) {
          return this.setLimit("min", value, true, errorUtil.toString(message));
        }
        gt(value, message) {
          return this.setLimit("min", value, false, errorUtil.toString(message));
        }
        lte(value, message) {
          return this.setLimit("max", value, true, errorUtil.toString(message));
        }
        lt(value, message) {
          return this.setLimit("max", value, false, errorUtil.toString(message));
        }
        setLimit(kind, value, inclusive, message) {
          return new _ZodNumber({
            ...this._def,
            checks: [
              ...this._def.checks,
              {
                kind,
                value,
                inclusive,
                message: errorUtil.toString(message)
              }
            ]
          });
        }
        _addCheck(check) {
          return new _ZodNumber({
            ...this._def,
            checks: [...this._def.checks, check]
          });
        }
        int(message) {
          return this._addCheck({
            kind: "int",
            message: errorUtil.toString(message)
          });
        }
        positive(message) {
          return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message)
          });
        }
        negative(message) {
          return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message)
          });
        }
        nonpositive(message) {
          return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message)
          });
        }
        nonnegative(message) {
          return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message)
          });
        }
        multipleOf(value, message) {
          return this._addCheck({
            kind: "multipleOf",
            value,
            message: errorUtil.toString(message)
          });
        }
        finite(message) {
          return this._addCheck({
            kind: "finite",
            message: errorUtil.toString(message)
          });
        }
        safe(message) {
          return this._addCheck({
            kind: "min",
            inclusive: true,
            value: Number.MIN_SAFE_INTEGER,
            message: errorUtil.toString(message)
          })._addCheck({
            kind: "max",
            inclusive: true,
            value: Number.MAX_SAFE_INTEGER,
            message: errorUtil.toString(message)
          });
        }
        get minValue() {
          let min = null;
          for (const ch of this._def.checks) {
            if (ch.kind === "min") {
              if (min === null || ch.value > min)
                min = ch.value;
            }
          }
          return min;
        }
        get maxValue() {
          let max = null;
          for (const ch of this._def.checks) {
            if (ch.kind === "max") {
              if (max === null || ch.value < max)
                max = ch.value;
            }
          }
          return max;
        }
        get isInt() {
          return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
        }
        get isFinite() {
          let max = null, min = null;
          for (const ch of this._def.checks) {
            if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
              return true;
            } else if (ch.kind === "min") {
              if (min === null || ch.value > min)
                min = ch.value;
            } else if (ch.kind === "max") {
              if (max === null || ch.value < max)
                max = ch.value;
            }
          }
          return Number.isFinite(min) && Number.isFinite(max);
        }
      };
      ZodNumber.create = (params) => {
        return new ZodNumber({
          checks: [],
          typeName: ZodFirstPartyTypeKind.ZodNumber,
          coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
          ...processCreateParams(params)
        });
      };
      ZodBigInt = class _ZodBigInt extends ZodType {
        constructor() {
          super(...arguments);
          this.min = this.gte;
          this.max = this.lte;
        }
        _parse(input) {
          if (this._def.coerce) {
            input.data = BigInt(input.data);
          }
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.bigint) {
            const ctx2 = this._getOrReturnCtx(input);
            addIssueToContext(ctx2, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.bigint,
              received: ctx2.parsedType
            });
            return INVALID;
          }
          let ctx = void 0;
          const status = new ParseStatus();
          for (const check of this._def.checks) {
            if (check.kind === "min") {
              const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
              if (tooSmall) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  type: "bigint",
                  minimum: check.value,
                  inclusive: check.inclusive,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "max") {
              const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
              if (tooBig) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  type: "bigint",
                  maximum: check.value,
                  inclusive: check.inclusive,
                  message: check.message
                });
                status.dirty();
              }
            } else if (check.kind === "multipleOf") {
              if (input.data % check.value !== BigInt(0)) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.not_multiple_of,
                  multipleOf: check.value,
                  message: check.message
                });
                status.dirty();
              }
            } else {
              util.assertNever(check);
            }
          }
          return { status: status.value, value: input.data };
        }
        gte(value, message) {
          return this.setLimit("min", value, true, errorUtil.toString(message));
        }
        gt(value, message) {
          return this.setLimit("min", value, false, errorUtil.toString(message));
        }
        lte(value, message) {
          return this.setLimit("max", value, true, errorUtil.toString(message));
        }
        lt(value, message) {
          return this.setLimit("max", value, false, errorUtil.toString(message));
        }
        setLimit(kind, value, inclusive, message) {
          return new _ZodBigInt({
            ...this._def,
            checks: [
              ...this._def.checks,
              {
                kind,
                value,
                inclusive,
                message: errorUtil.toString(message)
              }
            ]
          });
        }
        _addCheck(check) {
          return new _ZodBigInt({
            ...this._def,
            checks: [...this._def.checks, check]
          });
        }
        positive(message) {
          return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message)
          });
        }
        negative(message) {
          return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message)
          });
        }
        nonpositive(message) {
          return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message)
          });
        }
        nonnegative(message) {
          return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message)
          });
        }
        multipleOf(value, message) {
          return this._addCheck({
            kind: "multipleOf",
            value,
            message: errorUtil.toString(message)
          });
        }
        get minValue() {
          let min = null;
          for (const ch of this._def.checks) {
            if (ch.kind === "min") {
              if (min === null || ch.value > min)
                min = ch.value;
            }
          }
          return min;
        }
        get maxValue() {
          let max = null;
          for (const ch of this._def.checks) {
            if (ch.kind === "max") {
              if (max === null || ch.value < max)
                max = ch.value;
            }
          }
          return max;
        }
      };
      ZodBigInt.create = (params) => {
        var _a;
        return new ZodBigInt({
          checks: [],
          typeName: ZodFirstPartyTypeKind.ZodBigInt,
          coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
          ...processCreateParams(params)
        });
      };
      ZodBoolean = class extends ZodType {
        _parse(input) {
          if (this._def.coerce) {
            input.data = Boolean(input.data);
          }
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.boolean) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.boolean,
              received: ctx.parsedType
            });
            return INVALID;
          }
          return OK(input.data);
        }
      };
      ZodBoolean.create = (params) => {
        return new ZodBoolean({
          typeName: ZodFirstPartyTypeKind.ZodBoolean,
          coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
          ...processCreateParams(params)
        });
      };
      ZodDate = class _ZodDate extends ZodType {
        _parse(input) {
          if (this._def.coerce) {
            input.data = new Date(input.data);
          }
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.date) {
            const ctx2 = this._getOrReturnCtx(input);
            addIssueToContext(ctx2, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.date,
              received: ctx2.parsedType
            });
            return INVALID;
          }
          if (isNaN(input.data.getTime())) {
            const ctx2 = this._getOrReturnCtx(input);
            addIssueToContext(ctx2, {
              code: ZodIssueCode.invalid_date
            });
            return INVALID;
          }
          const status = new ParseStatus();
          let ctx = void 0;
          for (const check of this._def.checks) {
            if (check.kind === "min") {
              if (input.data.getTime() < check.value) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  message: check.message,
                  inclusive: true,
                  exact: false,
                  minimum: check.value,
                  type: "date"
                });
                status.dirty();
              }
            } else if (check.kind === "max") {
              if (input.data.getTime() > check.value) {
                ctx = this._getOrReturnCtx(input, ctx);
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  message: check.message,
                  inclusive: true,
                  exact: false,
                  maximum: check.value,
                  type: "date"
                });
                status.dirty();
              }
            } else {
              util.assertNever(check);
            }
          }
          return {
            status: status.value,
            value: new Date(input.data.getTime())
          };
        }
        _addCheck(check) {
          return new _ZodDate({
            ...this._def,
            checks: [...this._def.checks, check]
          });
        }
        min(minDate, message) {
          return this._addCheck({
            kind: "min",
            value: minDate.getTime(),
            message: errorUtil.toString(message)
          });
        }
        max(maxDate, message) {
          return this._addCheck({
            kind: "max",
            value: maxDate.getTime(),
            message: errorUtil.toString(message)
          });
        }
        get minDate() {
          let min = null;
          for (const ch of this._def.checks) {
            if (ch.kind === "min") {
              if (min === null || ch.value > min)
                min = ch.value;
            }
          }
          return min != null ? new Date(min) : null;
        }
        get maxDate() {
          let max = null;
          for (const ch of this._def.checks) {
            if (ch.kind === "max") {
              if (max === null || ch.value < max)
                max = ch.value;
            }
          }
          return max != null ? new Date(max) : null;
        }
      };
      ZodDate.create = (params) => {
        return new ZodDate({
          checks: [],
          coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
          typeName: ZodFirstPartyTypeKind.ZodDate,
          ...processCreateParams(params)
        });
      };
      ZodSymbol = class extends ZodType {
        _parse(input) {
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.symbol) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.symbol,
              received: ctx.parsedType
            });
            return INVALID;
          }
          return OK(input.data);
        }
      };
      ZodSymbol.create = (params) => {
        return new ZodSymbol({
          typeName: ZodFirstPartyTypeKind.ZodSymbol,
          ...processCreateParams(params)
        });
      };
      ZodUndefined = class extends ZodType {
        _parse(input) {
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.undefined,
              received: ctx.parsedType
            });
            return INVALID;
          }
          return OK(input.data);
        }
      };
      ZodUndefined.create = (params) => {
        return new ZodUndefined({
          typeName: ZodFirstPartyTypeKind.ZodUndefined,
          ...processCreateParams(params)
        });
      };
      ZodNull = class extends ZodType {
        _parse(input) {
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.null) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.null,
              received: ctx.parsedType
            });
            return INVALID;
          }
          return OK(input.data);
        }
      };
      ZodNull.create = (params) => {
        return new ZodNull({
          typeName: ZodFirstPartyTypeKind.ZodNull,
          ...processCreateParams(params)
        });
      };
      ZodAny = class extends ZodType {
        constructor() {
          super(...arguments);
          this._any = true;
        }
        _parse(input) {
          return OK(input.data);
        }
      };
      ZodAny.create = (params) => {
        return new ZodAny({
          typeName: ZodFirstPartyTypeKind.ZodAny,
          ...processCreateParams(params)
        });
      };
      ZodUnknown = class extends ZodType {
        constructor() {
          super(...arguments);
          this._unknown = true;
        }
        _parse(input) {
          return OK(input.data);
        }
      };
      ZodUnknown.create = (params) => {
        return new ZodUnknown({
          typeName: ZodFirstPartyTypeKind.ZodUnknown,
          ...processCreateParams(params)
        });
      };
      ZodNever = class extends ZodType {
        _parse(input) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.never,
            received: ctx.parsedType
          });
          return INVALID;
        }
      };
      ZodNever.create = (params) => {
        return new ZodNever({
          typeName: ZodFirstPartyTypeKind.ZodNever,
          ...processCreateParams(params)
        });
      };
      ZodVoid = class extends ZodType {
        _parse(input) {
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.void,
              received: ctx.parsedType
            });
            return INVALID;
          }
          return OK(input.data);
        }
      };
      ZodVoid.create = (params) => {
        return new ZodVoid({
          typeName: ZodFirstPartyTypeKind.ZodVoid,
          ...processCreateParams(params)
        });
      };
      ZodArray = class _ZodArray extends ZodType {
        _parse(input) {
          const { ctx, status } = this._processInputParams(input);
          const def = this._def;
          if (ctx.parsedType !== ZodParsedType.array) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.array,
              received: ctx.parsedType
            });
            return INVALID;
          }
          if (def.exactLength !== null) {
            const tooBig = ctx.data.length > def.exactLength.value;
            const tooSmall = ctx.data.length < def.exactLength.value;
            if (tooBig || tooSmall) {
              addIssueToContext(ctx, {
                code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
                minimum: tooSmall ? def.exactLength.value : void 0,
                maximum: tooBig ? def.exactLength.value : void 0,
                type: "array",
                inclusive: true,
                exact: true,
                message: def.exactLength.message
              });
              status.dirty();
            }
          }
          if (def.minLength !== null) {
            if (ctx.data.length < def.minLength.value) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: def.minLength.value,
                type: "array",
                inclusive: true,
                exact: false,
                message: def.minLength.message
              });
              status.dirty();
            }
          }
          if (def.maxLength !== null) {
            if (ctx.data.length > def.maxLength.value) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: def.maxLength.value,
                type: "array",
                inclusive: true,
                exact: false,
                message: def.maxLength.message
              });
              status.dirty();
            }
          }
          if (ctx.common.async) {
            return Promise.all([...ctx.data].map((item, i8) => {
              return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i8));
            })).then((result2) => {
              return ParseStatus.mergeArray(status, result2);
            });
          }
          const result = [...ctx.data].map((item, i8) => {
            return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i8));
          });
          return ParseStatus.mergeArray(status, result);
        }
        get element() {
          return this._def.type;
        }
        min(minLength, message) {
          return new _ZodArray({
            ...this._def,
            minLength: { value: minLength, message: errorUtil.toString(message) }
          });
        }
        max(maxLength, message) {
          return new _ZodArray({
            ...this._def,
            maxLength: { value: maxLength, message: errorUtil.toString(message) }
          });
        }
        length(len, message) {
          return new _ZodArray({
            ...this._def,
            exactLength: { value: len, message: errorUtil.toString(message) }
          });
        }
        nonempty(message) {
          return this.min(1, message);
        }
      };
      ZodArray.create = (schema, params) => {
        return new ZodArray({
          type: schema,
          minLength: null,
          maxLength: null,
          exactLength: null,
          typeName: ZodFirstPartyTypeKind.ZodArray,
          ...processCreateParams(params)
        });
      };
      ZodObject = class _ZodObject extends ZodType {
        constructor() {
          super(...arguments);
          this._cached = null;
          this.nonstrict = this.passthrough;
          this.augment = this.extend;
        }
        _getCached() {
          if (this._cached !== null)
            return this._cached;
          const shape = this._def.shape();
          const keys = util.objectKeys(shape);
          return this._cached = { shape, keys };
        }
        _parse(input) {
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.object) {
            const ctx2 = this._getOrReturnCtx(input);
            addIssueToContext(ctx2, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.object,
              received: ctx2.parsedType
            });
            return INVALID;
          }
          const { status, ctx } = this._processInputParams(input);
          const { shape, keys: shapeKeys } = this._getCached();
          const extraKeys = [];
          if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
            for (const key in ctx.data) {
              if (!shapeKeys.includes(key)) {
                extraKeys.push(key);
              }
            }
          }
          const pairs = [];
          for (const key of shapeKeys) {
            const keyValidator = shape[key];
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
              alwaysSet: key in ctx.data
            });
          }
          if (this._def.catchall instanceof ZodNever) {
            const unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
              for (const key of extraKeys) {
                pairs.push({
                  key: { status: "valid", value: key },
                  value: { status: "valid", value: ctx.data[key] }
                });
              }
            } else if (unknownKeys === "strict") {
              if (extraKeys.length > 0) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.unrecognized_keys,
                  keys: extraKeys
                });
                status.dirty();
              }
            } else if (unknownKeys === "strip") ;
            else {
              throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
            }
          } else {
            const catchall = this._def.catchall;
            for (const key of extraKeys) {
              const value = ctx.data[key];
              pairs.push({
                key: { status: "valid", value: key },
                value: catchall._parse(
                  new ParseInputLazyPath(ctx, value, ctx.path, key)
                  //, ctx.child(key), value, getParsedType(value)
                ),
                alwaysSet: key in ctx.data
              });
            }
          }
          if (ctx.common.async) {
            return Promise.resolve().then(async () => {
              const syncPairs = [];
              for (const pair of pairs) {
                const key = await pair.key;
                syncPairs.push({
                  key,
                  value: await pair.value,
                  alwaysSet: pair.alwaysSet
                });
              }
              return syncPairs;
            }).then((syncPairs) => {
              return ParseStatus.mergeObjectSync(status, syncPairs);
            });
          } else {
            return ParseStatus.mergeObjectSync(status, pairs);
          }
        }
        get shape() {
          return this._def.shape();
        }
        strict(message) {
          errorUtil.errToObj;
          return new _ZodObject({
            ...this._def,
            unknownKeys: "strict",
            ...message !== void 0 ? {
              errorMap: (issue, ctx) => {
                var _a, _b, _c, _d;
                const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
                if (issue.code === "unrecognized_keys")
                  return {
                    message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError
                  };
                return {
                  message: defaultError
                };
              }
            } : {}
          });
        }
        strip() {
          return new _ZodObject({
            ...this._def,
            unknownKeys: "strip"
          });
        }
        passthrough() {
          return new _ZodObject({
            ...this._def,
            unknownKeys: "passthrough"
          });
        }
        // const AugmentFactory =
        //   <Def extends ZodObjectDef>(def: Def) =>
        //   <Augmentation extends ZodRawShape>(
        //     augmentation: Augmentation
        //   ): ZodObject<
        //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
        //     Def["unknownKeys"],
        //     Def["catchall"]
        //   > => {
        //     return new ZodObject({
        //       ...def,
        //       shape: () => ({
        //         ...def.shape(),
        //         ...augmentation,
        //       }),
        //     }) as any;
        //   };
        extend(augmentation) {
          return new _ZodObject({
            ...this._def,
            shape: () => ({
              ...this._def.shape(),
              ...augmentation
            })
          });
        }
        /**
         * Prior to zod@1.0.12 there was a bug in the
         * inferred type of merged objects. Please
         * upgrade if you are experiencing issues.
         */
        merge(merging) {
          const merged = new _ZodObject({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: () => ({
              ...this._def.shape(),
              ...merging._def.shape()
            }),
            typeName: ZodFirstPartyTypeKind.ZodObject
          });
          return merged;
        }
        // merge<
        //   Incoming extends AnyZodObject,
        //   Augmentation extends Incoming["shape"],
        //   NewOutput extends {
        //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
        //       ? Augmentation[k]["_output"]
        //       : k extends keyof Output
        //       ? Output[k]
        //       : never;
        //   },
        //   NewInput extends {
        //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
        //       ? Augmentation[k]["_input"]
        //       : k extends keyof Input
        //       ? Input[k]
        //       : never;
        //   }
        // >(
        //   merging: Incoming
        // ): ZodObject<
        //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
        //   Incoming["_def"]["unknownKeys"],
        //   Incoming["_def"]["catchall"],
        //   NewOutput,
        //   NewInput
        // > {
        //   const merged: any = new ZodObject({
        //     unknownKeys: merging._def.unknownKeys,
        //     catchall: merging._def.catchall,
        //     shape: () =>
        //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
        //     typeName: ZodFirstPartyTypeKind.ZodObject,
        //   }) as any;
        //   return merged;
        // }
        setKey(key, schema) {
          return this.augment({ [key]: schema });
        }
        // merge<Incoming extends AnyZodObject>(
        //   merging: Incoming
        // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
        // ZodObject<
        //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
        //   Incoming["_def"]["unknownKeys"],
        //   Incoming["_def"]["catchall"]
        // > {
        //   // const mergedShape = objectUtil.mergeShapes(
        //   //   this._def.shape(),
        //   //   merging._def.shape()
        //   // );
        //   const merged: any = new ZodObject({
        //     unknownKeys: merging._def.unknownKeys,
        //     catchall: merging._def.catchall,
        //     shape: () =>
        //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
        //     typeName: ZodFirstPartyTypeKind.ZodObject,
        //   }) as any;
        //   return merged;
        // }
        catchall(index) {
          return new _ZodObject({
            ...this._def,
            catchall: index
          });
        }
        pick(mask) {
          const shape = {};
          util.objectKeys(mask).forEach((key) => {
            if (mask[key] && this.shape[key]) {
              shape[key] = this.shape[key];
            }
          });
          return new _ZodObject({
            ...this._def,
            shape: () => shape
          });
        }
        omit(mask) {
          const shape = {};
          util.objectKeys(this.shape).forEach((key) => {
            if (!mask[key]) {
              shape[key] = this.shape[key];
            }
          });
          return new _ZodObject({
            ...this._def,
            shape: () => shape
          });
        }
        /**
         * @deprecated
         */
        deepPartial() {
          return deepPartialify(this);
        }
        partial(mask) {
          const newShape = {};
          util.objectKeys(this.shape).forEach((key) => {
            const fieldSchema = this.shape[key];
            if (mask && !mask[key]) {
              newShape[key] = fieldSchema;
            } else {
              newShape[key] = fieldSchema.optional();
            }
          });
          return new _ZodObject({
            ...this._def,
            shape: () => newShape
          });
        }
        required(mask) {
          const newShape = {};
          util.objectKeys(this.shape).forEach((key) => {
            if (mask && !mask[key]) {
              newShape[key] = this.shape[key];
            } else {
              const fieldSchema = this.shape[key];
              let newField = fieldSchema;
              while (newField instanceof ZodOptional) {
                newField = newField._def.innerType;
              }
              newShape[key] = newField;
            }
          });
          return new _ZodObject({
            ...this._def,
            shape: () => newShape
          });
        }
        keyof() {
          return createZodEnum(util.objectKeys(this.shape));
        }
      };
      ZodObject.create = (shape, params) => {
        return new ZodObject({
          shape: () => shape,
          unknownKeys: "strip",
          catchall: ZodNever.create(),
          typeName: ZodFirstPartyTypeKind.ZodObject,
          ...processCreateParams(params)
        });
      };
      ZodObject.strictCreate = (shape, params) => {
        return new ZodObject({
          shape: () => shape,
          unknownKeys: "strict",
          catchall: ZodNever.create(),
          typeName: ZodFirstPartyTypeKind.ZodObject,
          ...processCreateParams(params)
        });
      };
      ZodObject.lazycreate = (shape, params) => {
        return new ZodObject({
          shape,
          unknownKeys: "strip",
          catchall: ZodNever.create(),
          typeName: ZodFirstPartyTypeKind.ZodObject,
          ...processCreateParams(params)
        });
      };
      ZodUnion = class extends ZodType {
        _parse(input) {
          const { ctx } = this._processInputParams(input);
          const options = this._def.options;
          function handleResults(results) {
            for (const result of results) {
              if (result.result.status === "valid") {
                return result.result;
              }
            }
            for (const result of results) {
              if (result.result.status === "dirty") {
                ctx.common.issues.push(...result.ctx.common.issues);
                return result.result;
              }
            }
            const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_union,
              unionErrors
            });
            return INVALID;
          }
          if (ctx.common.async) {
            return Promise.all(options.map(async (option) => {
              const childCtx = {
                ...ctx,
                common: {
                  ...ctx.common,
                  issues: []
                },
                parent: null
              };
              return {
                result: await option._parseAsync({
                  data: ctx.data,
                  path: ctx.path,
                  parent: childCtx
                }),
                ctx: childCtx
              };
            })).then(handleResults);
          } else {
            let dirty = void 0;
            const issues = [];
            for (const option of options) {
              const childCtx = {
                ...ctx,
                common: {
                  ...ctx.common,
                  issues: []
                },
                parent: null
              };
              const result = option._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              });
              if (result.status === "valid") {
                return result;
              } else if (result.status === "dirty" && !dirty) {
                dirty = { result, ctx: childCtx };
              }
              if (childCtx.common.issues.length) {
                issues.push(childCtx.common.issues);
              }
            }
            if (dirty) {
              ctx.common.issues.push(...dirty.ctx.common.issues);
              return dirty.result;
            }
            const unionErrors = issues.map((issues2) => new ZodError(issues2));
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_union,
              unionErrors
            });
            return INVALID;
          }
        }
        get options() {
          return this._def.options;
        }
      };
      ZodUnion.create = (types, params) => {
        return new ZodUnion({
          options: types,
          typeName: ZodFirstPartyTypeKind.ZodUnion,
          ...processCreateParams(params)
        });
      };
      getDiscriminator = (type) => {
        if (type instanceof ZodLazy) {
          return getDiscriminator(type.schema);
        } else if (type instanceof ZodEffects) {
          return getDiscriminator(type.innerType());
        } else if (type instanceof ZodLiteral) {
          return [type.value];
        } else if (type instanceof ZodEnum) {
          return type.options;
        } else if (type instanceof ZodNativeEnum) {
          return Object.keys(type.enum);
        } else if (type instanceof ZodDefault) {
          return getDiscriminator(type._def.innerType);
        } else if (type instanceof ZodUndefined) {
          return [void 0];
        } else if (type instanceof ZodNull) {
          return [null];
        } else {
          return null;
        }
      };
      ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
        _parse(input) {
          const { ctx } = this._processInputParams(input);
          if (ctx.parsedType !== ZodParsedType.object) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.object,
              received: ctx.parsedType
            });
            return INVALID;
          }
          const discriminator = this.discriminator;
          const discriminatorValue = ctx.data[discriminator];
          const option = this.optionsMap.get(discriminatorValue);
          if (!option) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_union_discriminator,
              options: Array.from(this.optionsMap.keys()),
              path: [discriminator]
            });
            return INVALID;
          }
          if (ctx.common.async) {
            return option._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
          } else {
            return option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
          }
        }
        get discriminator() {
          return this._def.discriminator;
        }
        get options() {
          return this._def.options;
        }
        get optionsMap() {
          return this._def.optionsMap;
        }
        /**
         * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
         * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
         * have a different value for each object in the union.
         * @param discriminator the name of the discriminator property
         * @param types an array of object schemas
         * @param params
         */
        static create(discriminator, options, params) {
          const optionsMap = /* @__PURE__ */ new Map();
          for (const type of options) {
            const discriminatorValues = getDiscriminator(type.shape[discriminator]);
            if (!discriminatorValues) {
              throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
            }
            for (const value of discriminatorValues) {
              if (optionsMap.has(value)) {
                throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
              }
              optionsMap.set(value, type);
            }
          }
          return new _ZodDiscriminatedUnion({
            typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
            discriminator,
            options,
            optionsMap,
            ...processCreateParams(params)
          });
        }
      };
      ZodIntersection = class extends ZodType {
        _parse(input) {
          const { status, ctx } = this._processInputParams(input);
          const handleParsed = (parsedLeft, parsedRight) => {
            if (isAborted(parsedLeft) || isAborted(parsedRight)) {
              return INVALID;
            }
            const merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_intersection_types
              });
              return INVALID;
            }
            if (isDirty(parsedLeft) || isDirty(parsedRight)) {
              status.dirty();
            }
            return { status: status.value, value: merged.data };
          };
          if (ctx.common.async) {
            return Promise.all([
              this._def.left._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
              }),
              this._def.right._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
              })
            ]).then(([left, right]) => handleParsed(left, right));
          } else {
            return handleParsed(this._def.left._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }), this._def.right._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }));
          }
        }
      };
      ZodIntersection.create = (left, right, params) => {
        return new ZodIntersection({
          left,
          right,
          typeName: ZodFirstPartyTypeKind.ZodIntersection,
          ...processCreateParams(params)
        });
      };
      ZodTuple = class _ZodTuple extends ZodType {
        _parse(input) {
          const { status, ctx } = this._processInputParams(input);
          if (ctx.parsedType !== ZodParsedType.array) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.array,
              received: ctx.parsedType
            });
            return INVALID;
          }
          if (ctx.data.length < this._def.items.length) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: this._def.items.length,
              inclusive: true,
              exact: false,
              type: "array"
            });
            return INVALID;
          }
          const rest = this._def.rest;
          if (!rest && ctx.data.length > this._def.items.length) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: this._def.items.length,
              inclusive: true,
              exact: false,
              type: "array"
            });
            status.dirty();
          }
          const items = [...ctx.data].map((item, itemIndex) => {
            const schema = this._def.items[itemIndex] || this._def.rest;
            if (!schema)
              return null;
            return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
          }).filter((x3) => !!x3);
          if (ctx.common.async) {
            return Promise.all(items).then((results) => {
              return ParseStatus.mergeArray(status, results);
            });
          } else {
            return ParseStatus.mergeArray(status, items);
          }
        }
        get items() {
          return this._def.items;
        }
        rest(rest) {
          return new _ZodTuple({
            ...this._def,
            rest
          });
        }
      };
      ZodTuple.create = (schemas, params) => {
        if (!Array.isArray(schemas)) {
          throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
        }
        return new ZodTuple({
          items: schemas,
          typeName: ZodFirstPartyTypeKind.ZodTuple,
          rest: null,
          ...processCreateParams(params)
        });
      };
      ZodRecord = class _ZodRecord extends ZodType {
        get keySchema() {
          return this._def.keyType;
        }
        get valueSchema() {
          return this._def.valueType;
        }
        _parse(input) {
          const { status, ctx } = this._processInputParams(input);
          if (ctx.parsedType !== ZodParsedType.object) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.object,
              received: ctx.parsedType
            });
            return INVALID;
          }
          const pairs = [];
          const keyType = this._def.keyType;
          const valueType = this._def.valueType;
          for (const key in ctx.data) {
            pairs.push({
              key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
              value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key))
            });
          }
          if (ctx.common.async) {
            return ParseStatus.mergeObjectAsync(status, pairs);
          } else {
            return ParseStatus.mergeObjectSync(status, pairs);
          }
        }
        get element() {
          return this._def.valueType;
        }
        static create(first, second, third) {
          if (second instanceof ZodType) {
            return new _ZodRecord({
              keyType: first,
              valueType: second,
              typeName: ZodFirstPartyTypeKind.ZodRecord,
              ...processCreateParams(third)
            });
          }
          return new _ZodRecord({
            keyType: ZodString.create(),
            valueType: first,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(second)
          });
        }
      };
      ZodMap = class extends ZodType {
        get keySchema() {
          return this._def.keyType;
        }
        get valueSchema() {
          return this._def.valueType;
        }
        _parse(input) {
          const { status, ctx } = this._processInputParams(input);
          if (ctx.parsedType !== ZodParsedType.map) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.map,
              received: ctx.parsedType
            });
            return INVALID;
          }
          const keyType = this._def.keyType;
          const valueType = this._def.valueType;
          const pairs = [...ctx.data.entries()].map(([key, value], index) => {
            return {
              key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
              value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
            };
          });
          if (ctx.common.async) {
            const finalMap = /* @__PURE__ */ new Map();
            return Promise.resolve().then(async () => {
              for (const pair of pairs) {
                const key = await pair.key;
                const value = await pair.value;
                if (key.status === "aborted" || value.status === "aborted") {
                  return INVALID;
                }
                if (key.status === "dirty" || value.status === "dirty") {
                  status.dirty();
                }
                finalMap.set(key.value, value.value);
              }
              return { status: status.value, value: finalMap };
            });
          } else {
            const finalMap = /* @__PURE__ */ new Map();
            for (const pair of pairs) {
              const key = pair.key;
              const value = pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          }
        }
      };
      ZodMap.create = (keyType, valueType, params) => {
        return new ZodMap({
          valueType,
          keyType,
          typeName: ZodFirstPartyTypeKind.ZodMap,
          ...processCreateParams(params)
        });
      };
      ZodSet = class _ZodSet extends ZodType {
        _parse(input) {
          const { status, ctx } = this._processInputParams(input);
          if (ctx.parsedType !== ZodParsedType.set) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.set,
              received: ctx.parsedType
            });
            return INVALID;
          }
          const def = this._def;
          if (def.minSize !== null) {
            if (ctx.data.size < def.minSize.value) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: def.minSize.value,
                type: "set",
                inclusive: true,
                exact: false,
                message: def.minSize.message
              });
              status.dirty();
            }
          }
          if (def.maxSize !== null) {
            if (ctx.data.size > def.maxSize.value) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: def.maxSize.value,
                type: "set",
                inclusive: true,
                exact: false,
                message: def.maxSize.message
              });
              status.dirty();
            }
          }
          const valueType = this._def.valueType;
          function finalizeSet(elements2) {
            const parsedSet = /* @__PURE__ */ new Set();
            for (const element of elements2) {
              if (element.status === "aborted")
                return INVALID;
              if (element.status === "dirty")
                status.dirty();
              parsedSet.add(element.value);
            }
            return { status: status.value, value: parsedSet };
          }
          const elements = [...ctx.data.values()].map((item, i8) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i8)));
          if (ctx.common.async) {
            return Promise.all(elements).then((elements2) => finalizeSet(elements2));
          } else {
            return finalizeSet(elements);
          }
        }
        min(minSize, message) {
          return new _ZodSet({
            ...this._def,
            minSize: { value: minSize, message: errorUtil.toString(message) }
          });
        }
        max(maxSize, message) {
          return new _ZodSet({
            ...this._def,
            maxSize: { value: maxSize, message: errorUtil.toString(message) }
          });
        }
        size(size, message) {
          return this.min(size, message).max(size, message);
        }
        nonempty(message) {
          return this.min(1, message);
        }
      };
      ZodSet.create = (valueType, params) => {
        return new ZodSet({
          valueType,
          minSize: null,
          maxSize: null,
          typeName: ZodFirstPartyTypeKind.ZodSet,
          ...processCreateParams(params)
        });
      };
      ZodFunction = class _ZodFunction extends ZodType {
        constructor() {
          super(...arguments);
          this.validate = this.implement;
        }
        _parse(input) {
          const { ctx } = this._processInputParams(input);
          if (ctx.parsedType !== ZodParsedType.function) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.function,
              received: ctx.parsedType
            });
            return INVALID;
          }
          function makeArgsIssue(args, error) {
            return makeIssue({
              data: args,
              path: ctx.path,
              errorMaps: [
                ctx.common.contextualErrorMap,
                ctx.schemaErrorMap,
                getErrorMap(),
                errorMap
              ].filter((x3) => !!x3),
              issueData: {
                code: ZodIssueCode.invalid_arguments,
                argumentsError: error
              }
            });
          }
          function makeReturnsIssue(returns, error) {
            return makeIssue({
              data: returns,
              path: ctx.path,
              errorMaps: [
                ctx.common.contextualErrorMap,
                ctx.schemaErrorMap,
                getErrorMap(),
                errorMap
              ].filter((x3) => !!x3),
              issueData: {
                code: ZodIssueCode.invalid_return_type,
                returnTypeError: error
              }
            });
          }
          const params = { errorMap: ctx.common.contextualErrorMap };
          const fn = ctx.data;
          if (this._def.returns instanceof ZodPromise) {
            const me = this;
            return OK(async function(...args) {
              const error = new ZodError([]);
              const parsedArgs = await me._def.args.parseAsync(args, params).catch((e8) => {
                error.addIssue(makeArgsIssue(args, e8));
                throw error;
              });
              const result = await Reflect.apply(fn, this, parsedArgs);
              const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e8) => {
                error.addIssue(makeReturnsIssue(result, e8));
                throw error;
              });
              return parsedReturns;
            });
          } else {
            const me = this;
            return OK(function(...args) {
              const parsedArgs = me._def.args.safeParse(args, params);
              if (!parsedArgs.success) {
                throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
              }
              const result = Reflect.apply(fn, this, parsedArgs.data);
              const parsedReturns = me._def.returns.safeParse(result, params);
              if (!parsedReturns.success) {
                throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
              }
              return parsedReturns.data;
            });
          }
        }
        parameters() {
          return this._def.args;
        }
        returnType() {
          return this._def.returns;
        }
        args(...items) {
          return new _ZodFunction({
            ...this._def,
            args: ZodTuple.create(items).rest(ZodUnknown.create())
          });
        }
        returns(returnType) {
          return new _ZodFunction({
            ...this._def,
            returns: returnType
          });
        }
        implement(func) {
          const validatedFunc = this.parse(func);
          return validatedFunc;
        }
        strictImplement(func) {
          const validatedFunc = this.parse(func);
          return validatedFunc;
        }
        static create(args, returns, params) {
          return new _ZodFunction({
            args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
            returns: returns || ZodUnknown.create(),
            typeName: ZodFirstPartyTypeKind.ZodFunction,
            ...processCreateParams(params)
          });
        }
      };
      ZodLazy = class extends ZodType {
        get schema() {
          return this._def.getter();
        }
        _parse(input) {
          const { ctx } = this._processInputParams(input);
          const lazySchema = this._def.getter();
          return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
        }
      };
      ZodLazy.create = (getter, params) => {
        return new ZodLazy({
          getter,
          typeName: ZodFirstPartyTypeKind.ZodLazy,
          ...processCreateParams(params)
        });
      };
      ZodLiteral = class extends ZodType {
        _parse(input) {
          if (input.data !== this._def.value) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
              received: ctx.data,
              code: ZodIssueCode.invalid_literal,
              expected: this._def.value
            });
            return INVALID;
          }
          return { status: "valid", value: input.data };
        }
        get value() {
          return this._def.value;
        }
      };
      ZodLiteral.create = (value, params) => {
        return new ZodLiteral({
          value,
          typeName: ZodFirstPartyTypeKind.ZodLiteral,
          ...processCreateParams(params)
        });
      };
      ZodEnum = class _ZodEnum extends ZodType {
        _parse(input) {
          if (typeof input.data !== "string") {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            addIssueToContext(ctx, {
              expected: util.joinValues(expectedValues),
              received: ctx.parsedType,
              code: ZodIssueCode.invalid_type
            });
            return INVALID;
          }
          if (this._def.values.indexOf(input.data) === -1) {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            addIssueToContext(ctx, {
              received: ctx.data,
              code: ZodIssueCode.invalid_enum_value,
              options: expectedValues
            });
            return INVALID;
          }
          return OK(input.data);
        }
        get options() {
          return this._def.values;
        }
        get enum() {
          const enumValues = {};
          for (const val of this._def.values) {
            enumValues[val] = val;
          }
          return enumValues;
        }
        get Values() {
          const enumValues = {};
          for (const val of this._def.values) {
            enumValues[val] = val;
          }
          return enumValues;
        }
        get Enum() {
          const enumValues = {};
          for (const val of this._def.values) {
            enumValues[val] = val;
          }
          return enumValues;
        }
        extract(values) {
          return _ZodEnum.create(values);
        }
        exclude(values) {
          return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)));
        }
      };
      ZodEnum.create = createZodEnum;
      ZodNativeEnum = class extends ZodType {
        _parse(input) {
          const nativeEnumValues = util.getValidEnumValues(this._def.values);
          const ctx = this._getOrReturnCtx(input);
          if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
            const expectedValues = util.objectValues(nativeEnumValues);
            addIssueToContext(ctx, {
              expected: util.joinValues(expectedValues),
              received: ctx.parsedType,
              code: ZodIssueCode.invalid_type
            });
            return INVALID;
          }
          if (nativeEnumValues.indexOf(input.data) === -1) {
            const expectedValues = util.objectValues(nativeEnumValues);
            addIssueToContext(ctx, {
              received: ctx.data,
              code: ZodIssueCode.invalid_enum_value,
              options: expectedValues
            });
            return INVALID;
          }
          return OK(input.data);
        }
        get enum() {
          return this._def.values;
        }
      };
      ZodNativeEnum.create = (values, params) => {
        return new ZodNativeEnum({
          values,
          typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
          ...processCreateParams(params)
        });
      };
      ZodPromise = class extends ZodType {
        unwrap() {
          return this._def.type;
        }
        _parse(input) {
          const { ctx } = this._processInputParams(input);
          if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.promise,
              received: ctx.parsedType
            });
            return INVALID;
          }
          const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
          return OK(promisified.then((data) => {
            return this._def.type.parseAsync(data, {
              path: ctx.path,
              errorMap: ctx.common.contextualErrorMap
            });
          }));
        }
      };
      ZodPromise.create = (schema, params) => {
        return new ZodPromise({
          type: schema,
          typeName: ZodFirstPartyTypeKind.ZodPromise,
          ...processCreateParams(params)
        });
      };
      ZodEffects = class extends ZodType {
        innerType() {
          return this._def.schema;
        }
        sourceType() {
          return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
        }
        _parse(input) {
          const { status, ctx } = this._processInputParams(input);
          const effect = this._def.effect || null;
          const checkCtx = {
            addIssue: (arg) => {
              addIssueToContext(ctx, arg);
              if (arg.fatal) {
                status.abort();
              } else {
                status.dirty();
              }
            },
            get path() {
              return ctx.path;
            }
          };
          checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
          if (effect.type === "preprocess") {
            const processed = effect.transform(ctx.data, checkCtx);
            if (ctx.common.issues.length) {
              return {
                status: "dirty",
                value: ctx.data
              };
            }
            if (ctx.common.async) {
              return Promise.resolve(processed).then((processed2) => {
                return this._def.schema._parseAsync({
                  data: processed2,
                  path: ctx.path,
                  parent: ctx
                });
              });
            } else {
              return this._def.schema._parseSync({
                data: processed,
                path: ctx.path,
                parent: ctx
              });
            }
          }
          if (effect.type === "refinement") {
            const executeRefinement = (acc) => {
              const result = effect.refinement(acc, checkCtx);
              if (ctx.common.async) {
                return Promise.resolve(result);
              }
              if (result instanceof Promise) {
                throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
              }
              return acc;
            };
            if (ctx.common.async === false) {
              const inner = this._def.schema._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
              });
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              executeRefinement(inner.value);
              return { status: status.value, value: inner.value };
            } else {
              return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
                if (inner.status === "aborted")
                  return INVALID;
                if (inner.status === "dirty")
                  status.dirty();
                return executeRefinement(inner.value).then(() => {
                  return { status: status.value, value: inner.value };
                });
              });
            }
          }
          if (effect.type === "transform") {
            if (ctx.common.async === false) {
              const base = this._def.schema._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
              });
              if (!isValid(base))
                return base;
              const result = effect.transform(base.value, checkCtx);
              if (result instanceof Promise) {
                throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
              }
              return { status: status.value, value: result };
            } else {
              return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
                if (!isValid(base))
                  return base;
                return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
              });
            }
          }
          util.assertNever(effect);
        }
      };
      ZodEffects.create = (schema, effect, params) => {
        return new ZodEffects({
          schema,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect,
          ...processCreateParams(params)
        });
      };
      ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
        return new ZodEffects({
          schema,
          effect: { type: "preprocess", transform: preprocess },
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          ...processCreateParams(params)
        });
      };
      ZodOptional = class extends ZodType {
        _parse(input) {
          const parsedType = this._getType(input);
          if (parsedType === ZodParsedType.undefined) {
            return OK(void 0);
          }
          return this._def.innerType._parse(input);
        }
        unwrap() {
          return this._def.innerType;
        }
      };
      ZodOptional.create = (type, params) => {
        return new ZodOptional({
          innerType: type,
          typeName: ZodFirstPartyTypeKind.ZodOptional,
          ...processCreateParams(params)
        });
      };
      ZodNullable = class extends ZodType {
        _parse(input) {
          const parsedType = this._getType(input);
          if (parsedType === ZodParsedType.null) {
            return OK(null);
          }
          return this._def.innerType._parse(input);
        }
        unwrap() {
          return this._def.innerType;
        }
      };
      ZodNullable.create = (type, params) => {
        return new ZodNullable({
          innerType: type,
          typeName: ZodFirstPartyTypeKind.ZodNullable,
          ...processCreateParams(params)
        });
      };
      ZodDefault = class extends ZodType {
        _parse(input) {
          const { ctx } = this._processInputParams(input);
          let data = ctx.data;
          if (ctx.parsedType === ZodParsedType.undefined) {
            data = this._def.defaultValue();
          }
          return this._def.innerType._parse({
            data,
            path: ctx.path,
            parent: ctx
          });
        }
        removeDefault() {
          return this._def.innerType;
        }
      };
      ZodDefault.create = (type, params) => {
        return new ZodDefault({
          innerType: type,
          typeName: ZodFirstPartyTypeKind.ZodDefault,
          defaultValue: typeof params.default === "function" ? params.default : () => params.default,
          ...processCreateParams(params)
        });
      };
      ZodCatch = class extends ZodType {
        _parse(input) {
          const { ctx } = this._processInputParams(input);
          const newCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            }
          };
          const result = this._def.innerType._parse({
            data: newCtx.data,
            path: newCtx.path,
            parent: {
              ...newCtx
            }
          });
          if (isAsync(result)) {
            return result.then((result2) => {
              return {
                status: "valid",
                value: result2.status === "valid" ? result2.value : this._def.catchValue({
                  get error() {
                    return new ZodError(newCtx.common.issues);
                  },
                  input: newCtx.data
                })
              };
            });
          } else {
            return {
              status: "valid",
              value: result.status === "valid" ? result.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          }
        }
        removeCatch() {
          return this._def.innerType;
        }
      };
      ZodCatch.create = (type, params) => {
        return new ZodCatch({
          innerType: type,
          typeName: ZodFirstPartyTypeKind.ZodCatch,
          catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
          ...processCreateParams(params)
        });
      };
      ZodNaN = class extends ZodType {
        _parse(input) {
          const parsedType = this._getType(input);
          if (parsedType !== ZodParsedType.nan) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.nan,
              received: ctx.parsedType
            });
            return INVALID;
          }
          return { status: "valid", value: input.data };
        }
      };
      ZodNaN.create = (params) => {
        return new ZodNaN({
          typeName: ZodFirstPartyTypeKind.ZodNaN,
          ...processCreateParams(params)
        });
      };
      BRAND = Symbol("zod_brand");
      ZodBranded = class extends ZodType {
        _parse(input) {
          const { ctx } = this._processInputParams(input);
          const data = ctx.data;
          return this._def.type._parse({
            data,
            path: ctx.path,
            parent: ctx
          });
        }
        unwrap() {
          return this._def.type;
        }
      };
      ZodPipeline = class _ZodPipeline extends ZodType {
        _parse(input) {
          const { status, ctx } = this._processInputParams(input);
          if (ctx.common.async) {
            const handleAsync = async () => {
              const inResult = await this._def.in._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
              });
              if (inResult.status === "aborted")
                return INVALID;
              if (inResult.status === "dirty") {
                status.dirty();
                return DIRTY(inResult.value);
              } else {
                return this._def.out._parseAsync({
                  data: inResult.value,
                  path: ctx.path,
                  parent: ctx
                });
              }
            };
            return handleAsync();
          } else {
            const inResult = this._def.in._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return {
                status: "dirty",
                value: inResult.value
              };
            } else {
              return this._def.out._parseSync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          }
        }
        static create(a4, b) {
          return new _ZodPipeline({
            in: a4,
            out: b,
            typeName: ZodFirstPartyTypeKind.ZodPipeline
          });
        }
      };
      ZodReadonly = class extends ZodType {
        _parse(input) {
          const result = this._def.innerType._parse(input);
          if (isValid(result)) {
            result.value = Object.freeze(result.value);
          }
          return result;
        }
      };
      ZodReadonly.create = (type, params) => {
        return new ZodReadonly({
          innerType: type,
          typeName: ZodFirstPartyTypeKind.ZodReadonly,
          ...processCreateParams(params)
        });
      };
      custom = (check, params = {}, fatal) => {
        if (check)
          return ZodAny.create().superRefine((data, ctx) => {
            var _a, _b;
            if (!check(data)) {
              const p5 = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
              const _fatal = (_b = (_a = p5.fatal) !== null && _a !== void 0 ? _a : fatal) !== null && _b !== void 0 ? _b : true;
              const p22 = typeof p5 === "string" ? { message: p5 } : p5;
              ctx.addIssue({ code: "custom", ...p22, fatal: _fatal });
            }
          });
        return ZodAny.create();
      };
      late = {
        object: ZodObject.lazycreate
      };
      (function(ZodFirstPartyTypeKind2) {
        ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
        ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
        ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
        ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
        ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
        ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
        ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
        ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
        ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
        ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
        ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
        ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
        ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
        ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
        ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
        ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
        ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
        ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
        ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
        ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
        ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
        ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
        ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
        ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
        ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
        ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
        ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
        ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
        ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
        ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
        ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
        ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
        ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
        ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
        ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
        ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
      })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
      instanceOfType = (cls, params = {
        message: `Input not instance of ${cls.name}`
      }) => custom((data) => data instanceof cls, params);
      stringType = ZodString.create;
      numberType = ZodNumber.create;
      nanType = ZodNaN.create;
      bigIntType = ZodBigInt.create;
      booleanType = ZodBoolean.create;
      dateType = ZodDate.create;
      symbolType = ZodSymbol.create;
      undefinedType = ZodUndefined.create;
      nullType = ZodNull.create;
      anyType = ZodAny.create;
      unknownType = ZodUnknown.create;
      neverType = ZodNever.create;
      voidType = ZodVoid.create;
      arrayType = ZodArray.create;
      objectType = ZodObject.create;
      strictObjectType = ZodObject.strictCreate;
      unionType = ZodUnion.create;
      discriminatedUnionType = ZodDiscriminatedUnion.create;
      intersectionType = ZodIntersection.create;
      tupleType = ZodTuple.create;
      recordType = ZodRecord.create;
      mapType = ZodMap.create;
      setType = ZodSet.create;
      functionType = ZodFunction.create;
      lazyType = ZodLazy.create;
      literalType = ZodLiteral.create;
      enumType = ZodEnum.create;
      nativeEnumType = ZodNativeEnum.create;
      promiseType = ZodPromise.create;
      effectsType = ZodEffects.create;
      optionalType = ZodOptional.create;
      nullableType = ZodNullable.create;
      preprocessType = ZodEffects.createWithPreprocess;
      pipelineType = ZodPipeline.create;
      ostring = () => stringType().optional();
      onumber = () => numberType().optional();
      oboolean = () => booleanType().optional();
      coerce = {
        string: (arg) => ZodString.create({ ...arg, coerce: true }),
        number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
        boolean: (arg) => ZodBoolean.create({
          ...arg,
          coerce: true
        }),
        bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
        date: (arg) => ZodDate.create({ ...arg, coerce: true })
      };
      NEVER = INVALID;
      z = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        defaultErrorMap: errorMap,
        setErrorMap,
        getErrorMap,
        makeIssue,
        EMPTY_PATH,
        addIssueToContext,
        ParseStatus,
        INVALID,
        DIRTY,
        OK,
        isAborted,
        isDirty,
        isValid,
        isAsync,
        get util() {
          return util;
        },
        get objectUtil() {
          return objectUtil;
        },
        ZodParsedType,
        getParsedType,
        ZodType,
        ZodString,
        ZodNumber,
        ZodBigInt,
        ZodBoolean,
        ZodDate,
        ZodSymbol,
        ZodUndefined,
        ZodNull,
        ZodAny,
        ZodUnknown,
        ZodNever,
        ZodVoid,
        ZodArray,
        ZodObject,
        ZodUnion,
        ZodDiscriminatedUnion,
        ZodIntersection,
        ZodTuple,
        ZodRecord,
        ZodMap,
        ZodSet,
        ZodFunction,
        ZodLazy,
        ZodLiteral,
        ZodEnum,
        ZodNativeEnum,
        ZodPromise,
        ZodEffects,
        ZodTransformer: ZodEffects,
        ZodOptional,
        ZodNullable,
        ZodDefault,
        ZodCatch,
        ZodNaN,
        BRAND,
        ZodBranded,
        ZodPipeline,
        ZodReadonly,
        custom,
        Schema: ZodType,
        ZodSchema: ZodType,
        late,
        get ZodFirstPartyTypeKind() {
          return ZodFirstPartyTypeKind;
        },
        coerce,
        any: anyType,
        array: arrayType,
        bigint: bigIntType,
        boolean: booleanType,
        date: dateType,
        discriminatedUnion: discriminatedUnionType,
        effect: effectsType,
        "enum": enumType,
        "function": functionType,
        "instanceof": instanceOfType,
        intersection: intersectionType,
        lazy: lazyType,
        literal: literalType,
        map: mapType,
        nan: nanType,
        nativeEnum: nativeEnumType,
        never: neverType,
        "null": nullType,
        nullable: nullableType,
        number: numberType,
        object: objectType,
        oboolean,
        onumber,
        optional: optionalType,
        ostring,
        pipeline: pipelineType,
        preprocess: preprocessType,
        promise: promiseType,
        record: recordType,
        set: setType,
        strictObject: strictObjectType,
        string: stringType,
        symbol: symbolType,
        transformer: effectsType,
        tuple: tupleType,
        "undefined": undefinedType,
        union: unionType,
        unknown: unknownType,
        "void": voidType,
        NEVER,
        ZodIssueCode,
        quotelessJson,
        ZodError
      });
    }
  });

  // node_modules/@crossmint/client-sdk-window/dist/chunk-CXO3V73M.js
  var g2, E, i3;
  var init_chunk_CXO3V73M = __esm({
    "node_modules/@crossmint/client-sdk-window/dist/chunk-CXO3V73M.js"() {
      init_chunk_NOUALDXW();
      init_chunk_3D4ECMN2();
      init_chunk_2NN7LKDP();
      init_lib();
      g2 = class extends m3 {
        constructor(t21, s7, e8) {
          let h4 = t5(t5({}, e8 == null ? void 0 : e8.incomingEvents), i3.fromChild), p5 = t5(t5({}, e8 == null ? void 0 : e8.outgoingEvents), i3.fromParent);
          super(t21, s7, h4, p5);
          this.isConnected = false;
          this.handshakeOptions = t5(t5({}, E), e8 == null ? void 0 : e8.handshakeOptions), this.targetOrigin = s7;
        }
        handshakeWithChild() {
          return x2(this, null, function* () {
            if (this.isConnected) {
              console.log("[server] Already connected to child");
              return;
            }
            let t21 = r5();
            yield this._sendAction({ event: "handshakeRequest", data: { requestVerificationId: t21 }, responseEvent: "handshakeResponse", options: { timeoutMs: this.handshakeOptions.timeoutMs, intervalMs: this.handshakeOptions.intervalMs, condition: (s7) => s7.requestVerificationId === t21 } }), this._send("handshakeComplete", { requestVerificationId: t21 }), this.isConnected = true;
          });
        }
        _send(t21, s7) {
          return super.send(t21, s7);
        }
        _sendAction(t21) {
          return super.sendAction(u2(t5({}, t21), { options: t21.options }));
        }
      };
      E = { timeoutMs: 1e4, intervalMs: 100 };
      i3 = { fromChild: { handshakeResponse: z.object({ requestVerificationId: z.string() }) }, fromParent: { handshakeRequest: z.object({ requestVerificationId: z.string() }), handshakeComplete: z.object({ requestVerificationId: z.string() }) } };
    }
  });

  // node_modules/@crossmint/client-sdk-window/dist/chunk-F6D7LZZG.js
  function e(r17) {
    return new URL(r17).origin;
  }
  var init_chunk_F6D7LZZG = __esm({
    "node_modules/@crossmint/client-sdk-window/dist/chunk-F6D7LZZG.js"() {
    }
  });

  // node_modules/@crossmint/client-sdk-window/dist/chunk-JJRP2HSP.js
  function E2(i8) {
    let o9 = window.open(i8, "_blank");
    if (!o9) throw new Error("Failed to open new tab window");
    return o9;
  }
  function v4(i8, o9) {
    let n7 = E2(i8);
    return o9.awaitToLoad === false ? n7 : new Promise((t21, e8) => {
      n7.onload = () => t21(n7), n7.onerror = () => e8("Failed to load new tab window");
    });
  }
  var g3;
  var init_chunk_JJRP2HSP = __esm({
    "node_modules/@crossmint/client-sdk-window/dist/chunk-JJRP2HSP.js"() {
      init_chunk_CXO3V73M();
      init_chunk_F6D7LZZG();
      init_chunk_2NN7LKDP();
      g3 = class i4 extends g2 {
        constructor(n7, t21, e8) {
          super(n7, t21, e8);
          this.window = n7;
        }
        static init(n7, t21) {
          return x2(this, null, function* () {
            let e8 = yield v4(n7, t21);
            return new i4(e8, (t21 == null ? void 0 : t21.targetOrigin) || e(n7), t21);
          });
        }
        static initSync(n7, t21) {
          let e8 = E2(n7);
          return new i4(e8, t21.targetOrigin || e(n7), t21);
        }
      };
    }
  });

  // node_modules/@crossmint/client-sdk-window/dist/chunk-J7WBHF26.js
  var o6, r6, t6;
  var init_chunk_J7WBHF26 = __esm({
    "node_modules/@crossmint/client-sdk-window/dist/chunk-J7WBHF26.js"() {
      o6 = class {
        constructor(e8) {
          this.createPopupService = e8 ? new r6() : new t6();
        }
        getTop(e8) {
          return this.createPopupService.getTop(e8);
        }
        getLeft(e8) {
          return this.createPopupService.getLeft(e8);
        }
      };
      r6 = class {
        getTop(e8) {
          return (screen.height - e8) / 2;
        }
        getLeft(e8) {
          return (screen.width - e8) / 2;
        }
      };
      t6 = class {
        getTop(e8) {
          return (window == null ? void 0 : window.top) != null ? window.top.outerHeight / 2 + window.top.screenY - e8 / 2 : window.outerHeight / 2 + window.screenY - e8 / 2;
        }
        getLeft(e8) {
          return (window == null ? void 0 : window.top) != null ? window.top.outerWidth / 2 + window.top.screenX - e8 / 2 : window.outerWidth / 2 + window.screenX - e8 / 2;
        }
      };
    }
  });

  // node_modules/@crossmint/client-sdk-window/dist/chunk-663GZEU3.js
  function u3(e8, o9) {
    let n7 = window.open(e8, "popupWindow", E3(o9.width, o9.height, (o9 == null ? void 0 : o9.crossOrigin) || false));
    if (!n7) throw new Error("Failed to open popup window");
    return n7;
  }
  function m4(e8, o9) {
    let n7 = u3(e8, o9);
    return o9.awaitToLoad === false ? n7 : new Promise((t21, r17) => {
      n7.onload = () => t21(n7), n7.onerror = () => r17("Failed to load popup window");
    });
  }
  function E3(e8, o9, n7) {
    let t21 = new o6(n7), r17 = d2(), c2 = r17 != null && r17 > 99;
    return `${v5() || c2 ? "popup=true," : ""}height=${o9},width=${e8},left=${t21.getLeft(e8)},top=${t21.getTop(o9)},resizable=yes,scrollbars=yes,toolbar=yes,menubar=true,location=no,directories=no,status=yes`;
  }
  function d2() {
    let e8 = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return e8 ? parseInt(e8[2]) : null;
  }
  function v5() {
    return navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  }
  var g4;
  var init_chunk_663GZEU3 = __esm({
    "node_modules/@crossmint/client-sdk-window/dist/chunk-663GZEU3.js"() {
      init_chunk_CXO3V73M();
      init_chunk_J7WBHF26();
      init_chunk_F6D7LZZG();
      init_chunk_2NN7LKDP();
      g4 = class e2 extends g2 {
        constructor(n7, t21, r17) {
          super(n7, t21, r17);
          this.window = n7;
        }
        static init(n7, t21) {
          return x2(this, null, function* () {
            let r17 = yield m4(n7, t21);
            return new e2(r17, (t21 == null ? void 0 : t21.targetOrigin) || e(n7), t21);
          });
        }
        static initSync(n7, t21) {
          let r17 = u3(n7, t21);
          return new e2(r17, t21.targetOrigin || e(n7), t21);
        }
      };
    }
  });

  // node_modules/@crossmint/client-sdk-window/dist/index.js
  var init_dist2 = __esm({
    "node_modules/@crossmint/client-sdk-window/dist/index.js"() {
      init_chunk_JJRP2HSP();
      init_chunk_663GZEU3();
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-SZ45B6M5.js
  var t7, r7;
  var init_chunk_SZ45B6M5 = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-SZ45B6M5.js"() {
      t7 = { crossmintPayButtonService: { CONNECTING: "\u041F\u0456\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044F...", BUY: "\u041A\u0443\u043F\u0438\u0442\u0438 \u0437\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u043E\u044E Crossmint", BUY_WITH_ETH: "\u041A\u0443\u043F\u0438\u0442\u0438 \u0437\u0430 ETH", BUY_WITH_SOL: "\u041A\u0443\u043F\u0438\u0442\u0438 \u0437\u0430 SOL", BUY_WITH_CREDIT_CARD: "\u041A\u0443\u043F\u0438\u0442\u0438 \u0437\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u043E\u044E \u043A\u0440\u0435\u0434\u0438\u0442\u043D\u043E\u0457 \u043A\u0430\u0440\u0442\u043A\u0438" }, hostedCheckoutV3: { paymentVariant: { pay: "\u041E\u043F\u043B\u0430\u0442\u0438\u0442\u0438 \u0437\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u043E\u044E {0}", buy: "\u041A\u0443\u043F\u0438\u0442\u0438 \u0437\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u043E\u044E {0}", subscribe: "\u041F\u0456\u0434\u043F\u0438\u0441\u0430\u0442\u0438\u0441\u044F \u0437\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u043E\u044E {0}" }, crossmint: "\u041A\u0440\u043E\u0441\u043C\u0456\u043D\u0442", crypto: "\u041A\u0440\u0438\u043F\u0442\u043E", card: "\u041A\u0430\u0440\u0442\u043A\u0430" } };
      r7 = t7;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-ZOMFJMTO.js
  var n4, o7;
  var init_chunk_ZOMFJMTO = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-ZOMFJMTO.js"() {
      n4 = { crossmintPayButtonService: { CONNECTING: "\u0110ang k\u1EBFt n\u1ED1i", BUY_WITH_ETH: "Mua b\u1EB1ng ETH", BUY_WITH_SOL: "Mua b\u1EB1ng SOL", BUY_WITH_CREDIT_CARD: "Mua b\u1EB1ng th\u1EBB t\xEDn d\u1EE5ng" }, hostedCheckoutV3: { paymentVariant: { pay: "Thanh to\xE1n b\u1EB1ng {0}", buy: "Mua b\u1EB1ng {0}", subscribe: "\u0110\u0103ng k\xFD b\u1EB1ng {0}" }, crossmint: "Crossmint", crypto: "Ti\u1EC1n \u0111i\u1EC7n t\u1EED", card: "Th\u1EBB" } };
      o7 = n4;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-FAHAC5M6.js
  var t8, r8;
  var init_chunk_FAHAC5M6 = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-FAHAC5M6.js"() {
      t8 = { crossmintPayButtonService: { CONNECTING: "\u8FDE\u63A5\u4E2D...", BUY: "\u4F7F\u7528Crossmint\u8D2D\u4E70", BUY_WITH_ETH: "\u4F7F\u7528ETH\u8D2D\u4E70", BUY_WITH_SOL: "\u4F7F\u7528SOL\u8D2D\u4E70", BUY_WITH_CREDIT_CARD: "\u4F7F\u7528\u4FE1\u7528\u5361\u8D2D\u4E70" }, hostedCheckoutV3: { paymentVariant: { pay: "\u4F7F\u7528 {0} \u652F\u4ED8", buy: "\u4F7F\u7528 {0} \u8D2D\u4E70", subscribe: "\u4F7F\u7528 {0} \u8BA2\u9605" }, crossmint: "Crossmint", crypto: "\u52A0\u5BC6\u8D27\u5E01", card: "\u5361\u7247" } };
      r8 = t8;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-2FW2UJJD.js
  var t9, r9;
  var init_chunk_2FW2UJJD = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-2FW2UJJD.js"() {
      t9 = { crossmintPayButtonService: { CONNECTING: "\u9023\u63A5\u4E2D...", BUY: "\u7528Crossmint\u8CFC\u8CB7", BUY_WITH_ETH: "\u7528ETH\u8CFC\u8CB7", BUY_WITH_SOL: "\u7528SOL\u8CFC\u8CB7", BUY_WITH_CREDIT_CARD: "\u7528\u4FE1\u7528\u5361\u8CFC\u8CB7" }, hostedCheckoutV3: { paymentVariant: { pay: "\u4F7F\u7528 {0} \u4ED8\u6B3E", buy: "\u4F7F\u7528 {0} \u8CFC\u8CB7", subscribe: "\u4F7F\u7528 {0} \u8A02\u95B1" }, crossmint: "Crossmint", crypto: "\u52A0\u5BC6\u8CA8\u5E63", card: "\u5361\u7247" } };
      r9 = t9;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-DFGTJD7R.js
  var e3, r10;
  var init_chunk_DFGTJD7R = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-DFGTJD7R.js"() {
      e3 = { crossmintPayButtonService: { CONNECTING: "Connexion...", BUY: "Acheter avec Crossmint", BUY_WITH_ETH: "Acheter avec ETH", BUY_WITH_SOL: "Acheter avec SOL", BUY_WITH_CREDIT_CARD: "Acheter avec une carte de cr\xE9dit" }, hostedCheckoutV3: { paymentVariant: { pay: "Payer avec {0}", buy: "Acheter avec {0}", subscribe: "S'abonner avec {0}" }, crossmint: "Crossmint", crypto: "Crypto", card: "Carte" } };
      r10 = e3;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-24EKXXTK.js
  var t10, a2;
  var init_chunk_24EKXXTK = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-24EKXXTK.js"() {
      t10 = { crossmintPayButtonService: { CONNECTING: "Connessione...", BUY: "Acquista con Crossmint", BUY_WITH_ETH: "Acquista con ETH", BUY_WITH_SOL: "Acquista con SOL", BUY_WITH_CREDIT_CARD: "Acquista con carta di credito" }, hostedCheckoutV3: { paymentVariant: { pay: "Paga con {0}", buy: "Compra con {0}", subscribe: "Abbonati con {0}" }, crossmint: "Crossmint", crypto: "Cripto", card: "Carta" } };
      a2 = t10;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-DWFI4UYM.js
  var t11, r11;
  var init_chunk_DWFI4UYM = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-DWFI4UYM.js"() {
      t11 = { crossmintPayButtonService: { CONNECTING: "\u63A5\u7D9A\u4E2D...", BUY: "Crossmint\u3067\u8CFC\u5165", BUY_WITH_ETH: "ETH\u3067\u8CFC\u5165", BUY_WITH_SOL: "SOL\u3067\u8CFC\u5165", BUY_WITH_CREDIT_CARD: "\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9\u3067\u8CFC\u5165" }, hostedCheckoutV3: { paymentVariant: { pay: "{0}\u3067\u652F\u6255\u3046", buy: "{0}\u3067\u8CFC\u5165\u3059\u308B", subscribe: "{0}\u3067\u8CFC\u8AAD\u3059\u308B" }, crossmint: "\u30AF\u30ED\u30B9\u30DF\u30F3\u30C8", crypto: "\u6697\u53F7\u8CC7\u7523", card: "\u30AB\u30FC\u30C9" } };
      r11 = t11;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-AV4FTVNP.js
  var t12, e4;
  var init_chunk_AV4FTVNP = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-AV4FTVNP.js"() {
      t12 = { crossmintPayButtonService: { CONNECTING: "\uC5F0\uACB0 \uC911...", BUY: "\uD06C\uB85C\uC2A4\uBBFC\uD2B8\uB85C \uAD6C\uB9E4", BUY_WITH_ETH: "\uC774\uB354\uB9AC\uC6C0\uC73C\uB85C \uAD6C\uB9E4", BUY_WITH_SOL: "\uC194\uB77C\uB098\uB85C \uAD6C\uB9E4", BUY_WITH_CREDIT_CARD: "\uC2E0\uC6A9\uCE74\uB4DC\uB85C \uAD6C\uB9E4" }, hostedCheckoutV3: { paymentVariant: { pay: "{0}\uB85C \uACB0\uC81C\uD558\uAE30", buy: "{0}\uB85C \uAD6C\uB9E4\uD558\uAE30", subscribe: "{0}\uB85C \uAD6C\uB3C5\uD558\uAE30" }, crossmint: "\uD06C\uB85C\uC2A4\uBBFC\uD2B8", crypto: "\uC554\uD638\uD654\uD3D0", card: "\uCE74\uB4DC" } };
      e4 = t12;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-KULDJBMG.js
  var r12, t13;
  var init_chunk_KULDJBMG = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-KULDJBMG.js"() {
      r12 = { crossmintPayButtonService: { CONNECTING: "A conectar...", BUY: "Comprar com Crossmint", BUY_WITH_ETH: "Comprar com ETH", BUY_WITH_SOL: "Comprar com SOL", BUY_WITH_CREDIT_CARD: "Comprar com cart\xE3o de cr\xE9dito" }, hostedCheckoutV3: { paymentVariant: { pay: "Pagar com {0}", buy: "Comprar com {0}", subscribe: "Subscrever com {0}" }, crossmint: "Crossmint", crypto: "Cripto", card: "Cart\xE3o" } };
      t13 = r12;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-FXGJZ6WV.js
  var t14, o8;
  var init_chunk_FXGJZ6WV = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-FXGJZ6WV.js"() {
      t14 = { crossmintPayButtonService: { CONNECTING: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435...", BUY: "\u041A\u0443\u043F\u0438\u0442\u044C \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E Crossmint", BUY_WITH_ETH: "\u041A\u0443\u043F\u0438\u0442\u044C \u0437\u0430 ETH", BUY_WITH_SOL: "\u041A\u0443\u043F\u0438\u0442\u044C \u0437\u0430 SOL", BUY_WITH_CREDIT_CARD: "\u041A\u0443\u043F\u0438\u0442\u044C \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u043A\u0440\u0435\u0434\u0438\u0442\u043D\u043E\u0439 \u043A\u0430\u0440\u0442\u044B" }, hostedCheckoutV3: { paymentVariant: { pay: "\u041E\u043F\u043B\u0430\u0442\u0438\u0442\u044C \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E {0}", buy: "\u041A\u0443\u043F\u0438\u0442\u044C \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E {0}", subscribe: "\u041F\u043E\u0434\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E {0}" }, crossmint: "\u041A\u0440\u043E\u0441\u0441\u043C\u0438\u043D\u0442", crypto: "\u041A\u0440\u0438\u043F\u0442\u043E\u0432\u0430\u043B\u044E\u0442\u0430", card: "\u041A\u0430\u0440\u0442\u0430" } };
      o8 = t14;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-4VC4BSJZ.js
  var t15, r13;
  var init_chunk_4VC4BSJZ = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-4VC4BSJZ.js"() {
      t15 = { crossmintPayButtonService: { CONNECTING: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D...", BUY: "\u0E0B\u0E37\u0E49\u0E2D\u0E14\u0E49\u0E27\u0E22 Crossmint", BUY_WITH_ETH: "\u0E0B\u0E37\u0E49\u0E2D\u0E14\u0E49\u0E27\u0E22 ETH", BUY_WITH_SOL: "\u0E0B\u0E37\u0E49\u0E2D\u0E14\u0E49\u0E27\u0E22 SOL", BUY_WITH_CREDIT_CARD: "\u0E0B\u0E37\u0E49\u0E2D\u0E14\u0E49\u0E27\u0E22\u0E1A\u0E31\u0E15\u0E23\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15" }, hostedCheckoutV3: { paymentVariant: { pay: "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E14\u0E49\u0E27\u0E22 {0}", buy: "\u0E0B\u0E37\u0E49\u0E2D\u0E14\u0E49\u0E27\u0E22 {0}", subscribe: "\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E2A\u0E21\u0E32\u0E0A\u0E34\u0E01\u0E14\u0E49\u0E27\u0E22 {0}" }, crossmint: "\u0E04\u0E23\u0E2D\u0E2A\u0E21\u0E34\u0E49\u0E19\u0E15\u0E4C", crypto: "\u0E04\u0E23\u0E34\u0E1B\u0E42\u0E15", card: "\u0E1A\u0E31\u0E15\u0E23" } };
      r13 = t15;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-LJGZGWX4.js
  var t16, i5;
  var init_chunk_LJGZGWX4 = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-LJGZGWX4.js"() {
      t16 = { crossmintPayButtonService: { CONNECTING: "Ba\u011Flan\u0131yor...", BUY: "Crossmint ile Sat\u0131n Al", BUY_WITH_ETH: "ETH ile Sat\u0131n Al", BUY_WITH_SOL: "SOL ile Sat\u0131n Al", BUY_WITH_CREDIT_CARD: "Kredi Kart\u0131 ile Sat\u0131n Al" }, hostedCheckoutV3: { paymentVariant: { pay: "{0} ile \xF6de", buy: "{0} ile sat\u0131n al", subscribe: "{0} ile abone ol" }, crossmint: "Crossmint", crypto: "Kripto", card: "Kart" } };
      i5 = t16;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-EWUNWF32.js
  var t17, h2;
  var init_chunk_EWUNWF32 = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-EWUNWF32.js"() {
      t17 = { crossmintPayButtonService: { CONNECTING: "yImej...", BUY: "Crossmint vItlhutlh", BUY_WITH_ETH: "ETH vItlhutlh", BUY_WITH_SOL: "SOL vItlhutlh", BUY_WITH_CREDIT_CARD: "QelI'qam vItlhutlh" } };
      h2 = t17;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-TUEQFX7P.js
  var t18, i6;
  var init_chunk_TUEQFX7P = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-TUEQFX7P.js"() {
      t18 = { crossmintPayButtonService: { CONNECTING: "Verbindung wird hergestellt...", BUY: "Mit Crossmint kaufen", BUY_WITH_ETH: "Mit ETH kaufen", BUY_WITH_SOL: "Mit SOL kaufen", BUY_WITH_CREDIT_CARD: "Mit Kreditkarte kaufen" }, hostedCheckoutV3: { paymentVariant: { pay: "Bezahlen mit {0}", buy: "Kaufen mit {0}", subscribe: "Abonnieren mit {0}" }, crossmint: "Crossmint", crypto: "Krypto", card: "Karte" } };
      i6 = t18;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-NUC37KX3.js
  var t19, s5;
  var init_chunk_NUC37KX3 = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-NUC37KX3.js"() {
      t19 = { crossmintPayButtonService: { CONNECTING: "Connecting...", BUY: "Buy with Crossmint", BUY_WITH_ETH: "Buy with ETH", BUY_WITH_SOL: "Buy with SOL", BUY_WITH_CREDIT_CARD: "Buy with credit card" }, hostedCheckoutV3: { paymentVariant: { pay: "Pay with {0}", buy: "Buy with {0}", subscribe: "Subscribe with {0}" }, crossmint: "Crossmint", crypto: "Crypto", card: "Card" } };
      s5 = t19;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-GWMJGPO7.js
  var r14, a3;
  var init_chunk_GWMJGPO7 = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-GWMJGPO7.js"() {
      r14 = { crossmintPayButtonService: { CONNECTING: "Conectando...", BUY: "Comprar con Crossmint", BUY_WITH_ETH: "Comprar con ETH", BUY_WITH_SOL: "Comprar con SOL", BUY_WITH_CREDIT_CARD: "Comprar con tarjeta de cr\xE9dito" }, hostedCheckoutV3: { paymentVariant: { pay: "Pagar con {0}", buy: "Comprar con {0}", subscribe: "Suscribirse con {0}" }, crossmint: "Crossmint", crypto: "Cripto", card: "Tarjeta" } };
      a3 = r14;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-2GLCONRC.js
  function w3(t21, o9, r17) {
    var i8;
    let m5 = (i8 = S2[o9]) != null ? i8 : s5, p5 = t21.split(".").reduce((P2, N2) => P2[N2], m5);
    return r17 ? k4(p5, r17) : p5;
  }
  var S2, k4;
  var init_chunk_2GLCONRC = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-2GLCONRC.js"() {
      init_chunk_SZ45B6M5();
      init_chunk_ZOMFJMTO();
      init_chunk_FAHAC5M6();
      init_chunk_2FW2UJJD();
      init_chunk_DFGTJD7R();
      init_chunk_24EKXXTK();
      init_chunk_DWFI4UYM();
      init_chunk_AV4FTVNP();
      init_chunk_KULDJBMG();
      init_chunk_FXGJZ6WV();
      init_chunk_4VC4BSJZ();
      init_chunk_LJGZGWX4();
      init_chunk_EWUNWF32();
      init_chunk_TUEQFX7P();
      init_chunk_NUC37KX3();
      init_chunk_GWMJGPO7();
      S2 = { "en-US": s5, "es-ES": a3, "fr-FR": r10, "it-IT": a2, "ja-JP": r11, "ko-KR": e4, "pt-PT": t13, "zh-CN": r8, "zh-TW": r9, "de-DE": i6, "ru-RU": o8, "tr-TR": i5, "uk-UA": r7, "th-TH": r13, "vi-VN": o7, Klingon: h2 };
      k4 = (t21, o9) => t21.replace(/{(\d+)}/g, (r17, m5) => o9[m5] || r17);
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-3FGZMCW4.js
  function H(i8) {
    var a4, u4;
    let t21 = ((u4 = (a4 = i8.appearance) == null ? void 0 : a4.theme) == null ? void 0 : u4.button) || "dark";
    function C() {
      return [g5(), f3()].join(`
`);
    }
    function g5() {
      return "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');";
    }
    function f3() {
      return [b(), F()].join(`
`);
    }
    function b() {
      return `.${c} {
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: -0.015em;
            padding: 14px 24px;
            border-radius: 12px;
            border: none;
            outline: none;
            cursor: pointer;
            transition: background 0.15s ease, border 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
        }`;
    }
    function F() {
      return { light: { css: `.${e5[t21]} {
                background-color: #FFFFFF;
                color: #000000;
                }
                .${e5[t21]}:hover:enabled {
                    background-color: #e8e8e8;
                }
                ` }, dark: { css: `.${e5[t21]} {
                background-color: #000000;
                color: #FFFFFF;
                }
                .${e5[t21]}:hover:enabled {
                    background-color: #3C4043;
                }
                .${e5[t21]} #${s6} .logoGradient .stop-0 {
                    stop-color: #00FF85;
                }
                .${e5[t21]} #${s6} .logoGradient .stop-1 {
                    stop-color: #00E0FF;
                }
                ` }, crossmint: { css: `.${e5[t21]} {
                background-color: #05B959;
                color: #FFFFFF;
                }
                .${e5[t21]}:hover:enabled {
                    background-color: #0BAF5C;
                }
                .${e5[t21]} #${s6} .logoGradient .stop-0 {
                    stop-color: currentColor;
                }
                .${e5[t21]} #${s6} .logoGradient .stop-1 {
                    stop-color: currentColor;
                }
                ` } }[t21].css;
    }
    function y3(o9) {
      let n7 = document.createElement("style");
      return n7.innerHTML = o9, document.head.appendChild(n7), { cleanup: () => {
        document.head.removeChild(n7);
      } };
    }
    function k5() {
      var l5, p5, m5, h4;
      let o9 = i8.locale || "en-US", n7 = (p5 = (l5 = i8.payment) == null ? void 0 : l5.crypto) == null ? void 0 : p5.enabled, d4 = (h4 = (m5 = i8.payment) == null ? void 0 : m5.fiat) == null ? void 0 : h4.enabled, $ = (() => {
        if (n7 && d4) return w3("hostedCheckoutV3.crossmint", o9);
        if (n7) return w3("hostedCheckoutV3.crypto", o9);
        if (d4) return w3("hostedCheckoutV3.card", o9);
        throw new Error("Neither `payment.crypto.enabled` or `payment.fiat.enabled` is true");
      })();
      return w3("hostedCheckoutV3.paymentVariant.pay", o9, [$]);
    }
    return { identifiers: { buttonClassNames: `${c} ${e5[t21]}`, logoId: s6 }, getButtonText: k5, generateCss: C, injectCss: y3 };
  }
  var c, s6, e5;
  var init_chunk_3FGZMCW4 = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-3FGZMCW4.js"() {
      init_chunk_2GLCONRC();
      c = "CrossmintHostedCheckoutButton";
      s6 = "CrossmintHostedCheckoutLogo";
      e5 = { light: `${c}--Light`, dark: `${c}--Dark`, crossmint: `${c}--Crossmint` };
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-JD4XNRHP.js
  function r15() {
    function o9(t21) {
      let e8 = document.createElement("div");
      e8.setAttribute("id", n5), Object.assign(e8.style, { width: "100vw", height: "100vh", "background-color": "rgba(0, 0, 0, 0.5)", inset: 0, position: "fixed", "z-index": "99999999", opacity: "0", transition: "opacity 0.25s ease-in-out", display: "flex", "flex-direction": "column", "justify-content": "center", "align-items": "center", padding: "20px" }), e8.innerHTML = l4, document.body.appendChild(e8), setTimeout(() => {
        e8.style.opacity = "1";
      }, 10);
      let c2 = setInterval(() => {
        t21.window.closed && (clearInterval(c2), i8());
      }, 250);
      e8.addEventListener("click", () => {
        clearInterval(c2), i8();
      });
    }
    function i8() {
      let t21 = document.getElementById(n5);
      t21 && (t21.style.opacity = "0", setTimeout(() => {
        t21.remove();
      }, 250));
    }
    return { create: o9, remove: i8 };
  }
  var n5, l4;
  var init_chunk_JD4XNRHP = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-JD4XNRHP.js"() {
      n5 = "crossmint-hosted-checkout-v3-overlay";
      l4 = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 459.2 86" style="width: 100%; max-width: 200px;">
        <g>
            <g>
        <path fill="white" d="M372.7 9.5c0-3.4 2.7-6.1 6-6.1S385 6 385 9.5s-2.8 6-6.2 6-6-2.6-6-6m77.7 1.9V24h8.6v8.8h-8.6V52q-.1 5.4 5.3 5.2c1.3 0 3-.2 3.4-.3v8.2c-.6.2-2.5 1-6 1-7.7 0-12.5-4.7-12.5-12.5V33H433v-9h8.5V11.4zm-338 44.4q3 5 7.8 7.9 5 2.8 11.3 2.8 4.5 0 8.4-1.5 3.7-1.7 6.6-4.4 2.8-2.9 4-6.4l-8.9-4a10.5 10.5 0 0 1-10.1 7 11 11 0 0 1-6-1.5q-2.4-1.7-4-4.5-1.5-2.9-1.4-6.6a12 12 0 0 1 1.4-6.5q1.5-3 4-4.5a11 11 0 0 1 6-1.6q3.5 0 6.2 2 2.8 1.9 4 5l8.8-3.8q-1.2-3.9-4-6.5-2.9-2.8-6.7-4.3-3.9-1.6-8.3-1.6-6.3 0-11.3 2.8a21 21 0 0 0-7.8 7.8q-2.8 5-2.8 11.2c0 6.2 1 7.9 2.8 11.2m53-32.1h-9.4v41.9h10V42.3q0-4.8 2.7-7.4 2.5-2.7 6.9-2.7h3.6v-9H177q-4.5 0-7.6 1.9a10 10 0 0 0-3.8 4.5z"/>
        <path d="M202.9 22.8c12.4 0 21.6 9.3 21.6 22s-9.1 22-21.6 22-21.5-9.2-21.5-22 9.1-22 21.5-22m0 35.2c6.1 0 11.6-4.5 11.6-13.2s-5.5-13-11.6-13-11.6 4.4-11.6 13S196.8 58 203 58" fill-rule="evenodd" fill="white"/>
        <path fill="white" d="m236.4 52-8.6 2.4c.5 4.6 5 12.5 17.1 12.5 10.6 0 15.7-7 15.7-13.3s-4.1-11-12-12.6l-6.3-1.3q-4-1-4.1-4.4c0-2.5 2.4-4.7 6-4.7 5.5 0 7.3 3.8 7.6 6.2l8.4-2.4c-.7-4.1-4.5-11.6-16-11.6-8.7 0-15.3 6.1-15.3 13.4 0 5.7 3.8 10.5 11.1 12l6.2 1.4q4.9 1.2 4.8 4.6c0 2.6-2 4.8-6.2 4.8-5.3 0-8-3.3-8.4-7m27.6 2.4 8.5-2.4c.4 3.7 3.2 7 8.5 7 4 0 6.2-2.2 6.2-4.7q.1-3.6-4.9-4.6l-6.1-1.4c-7.3-1.6-11.2-6.4-11.2-12.1 0-7.2 6.7-13.4 15.3-13.4 11.6 0 15.3 7.5 16 11.6l-8.4 2.4c-.3-2.4-2-6.2-7.6-6.2-3.5 0-6 2.2-6 4.7q.2 3.5 4.2 4.4l6.3 1.3c7.8 1.7 12 6.5 12 12.6s-5.2 13.3-15.8 13.3c-12 0-16.6-7.8-17-12.5m48.6-30.7h-9.5v41.9h10.1V41q0-2.7 1-4.8a8 8 0 0 1 7-4.2 8 8 0 0 1 7.2 4.2q1 2.1 1 4.8v24.6h10.1V41q0-2.7 1-4.8a8 8 0 0 1 7-4.2q2.6 0 4.4 1.2 1.8 1 2.8 3 1 2.1 1 4.8v24.6h10v-27q0-4.5-2-8.2a14 14 0 0 0-5.5-5.6q-3.5-2-8-2-5 0-8.8 2.5-2.4 1.6-4.1 4.2-1.4-2.3-3.9-4a16 16 0 0 0-9-2.7q-4.8 0-8.3 2.2-2.2 1.5-3.5 4zm71.1 41.9h-9.8V24.1h9.8zm8.8-41.6v41.6h10V41.3q0-2.8 1.1-4.8a8 8 0 0 1 7.3-4.2 8 8 0 0 1 7.4 4.2q1 2 1 4.7v24.4h10V38.9q0-4.6-2-8.2a14 14 0 0 0-5.5-5.6q-3.4-2-8.1-2c-4.7 0-5.5.7-7.8 2q-2.5 1.6-4 4v-5z"/> 
        <path d="M70 48.3A62 62 0 0 0 47.5 43c7.7-.6 22.8-2.7 29-10.4C86.6 25.2 86 .3 86 .3S62.3-2.4 52 9.4c-6.5 6.4-8.4 17.5-9 25.2-.6-7.7-2.6-18.8-9-25.2C23.7-2.4 0 .3 0 .3S-.3 15.8 4.4 26C6.8 31 11 35.1 16 37.6c7.2 3.7 16.8 5 22.4 5.4-5.6.4-15.2 1.7-22.4 5.3C11 51 6.8 55 4.4 60-.3 70.2 0 85.7 0 85.7s23.7 2.6 34-9.2c6.4-6.3 8.4-17.5 9-25.2.6 7.8 2.6 18.9 9 25.3 10.3 11.7 34 9.1 34 9.1s.3-15.6-4.5-25.7A25 25 0 0 0 70 48.3m.8 21.9c-.1 0-12.5-3.6-28.3-24.7A195 195 0 0 0 15 71.8l-.5.6.2-.8c0-.1 3.7-12.8 25.7-29C38.3 39.4 33.3 32.2 14 15l-.4-.4.6.1c.4 0 10.3 1.6 28.5 25l.6 1c2.6-1.8 10-7.1 26.7-26l.4-.4-.1.6c0 .4-1.6 10.3-24.9 28.4A193 193 0 0 0 71 69.9l.6.5z" fill="white" fill-rule="evenodd"/>
            </g>
        </g>
    </svg>
    <p style="color: white; font-size: 15px; text-align: center; max-width: 400px; font-family: Inter; letter-spacing: -0.015em;">Complete your purchase in the Crossmint window</p>
    `;
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/chunk-NSZRE7W7.js
  function v6({ apiClient: n7, hostedCheckoutProps: r17 }) {
    let d4 = r15();
    function u4(e8) {
      let o9 = n7.buildUrl("/sdk/2024-03-05/hosted-checkout"), t21 = new URLSearchParams();
      return d(t21, e8), t21.append("apiKey", n7.crossmint.apiKey), t21.append("sdkMetadata", JSON.stringify(n7.internalConfig.sdkMetadata)), `${o9}?${t21.toString()}`;
    }
    function m5(e8) {
      return g4.initSync(e8, { width: 450, height: 750, crossOrigin: true });
    }
    function y3(e8) {
      return g3.initSync(e8, {});
    }
    function f3(e8) {
      window.location.href = e8;
    }
    function l5() {
      var i8, s7, a4;
      let e8 = ((i8 = r17.appearance) == null ? void 0 : i8.display) || "popup", o9 = u4(r17);
      if (e8 === "same-tab") {
        f3(o9);
        return;
      }
      let t21;
      switch (e8) {
        case "popup":
          t21 = m5(o9);
          break;
        case "new-tab":
          t21 = y3(o9);
          break;
        default:
          throw new Error(`Invalid display type: ${e8}`);
      }
      ((a4 = (s7 = r17.appearance) == null ? void 0 : s7.overlay) == null ? void 0 : a4.enabled) !== false && d4.create(t21);
    }
    return { createWindow: l5 };
  }
  var init_chunk_NSZRE7W7 = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/chunk-NSZRE7W7.js"() {
      init_chunk_JD4XNRHP();
      init_chunk_ES3ZGSIN();
      init_dist2();
    }
  });

  // node_modules/@crossmint/client-sdk-base/dist/index.js
  var init_dist3 = __esm({
    "node_modules/@crossmint/client-sdk-base/dist/index.js"() {
      init_chunk_3FGZMCW4();
      init_chunk_NSZRE7W7();
    }
  });

  // node_modules/clsx/dist/clsx.mjs
  function r16(e8) {
    var t21, f3, n7 = "";
    if ("string" == typeof e8 || "number" == typeof e8) n7 += e8;
    else if ("object" == typeof e8) if (Array.isArray(e8)) {
      var o9 = e8.length;
      for (t21 = 0; t21 < o9; t21++) e8[t21] && (f3 = r16(e8[t21])) && (n7 && (n7 += " "), n7 += f3);
    } else for (f3 in e8) e8[f3] && (n7 && (n7 += " "), n7 += f3);
    return n7;
  }
  function clsx() {
    for (var e8, t21, f3 = 0, n7 = "", o9 = arguments.length; f3 < o9; f3++) (e8 = arguments[f3]) && (t21 = r16(e8)) && (n7 && (n7 += " "), n7 += t21);
    return n7;
  }
  var clsx_default;
  var init_clsx = __esm({
    "node_modules/clsx/dist/clsx.mjs"() {
      clsx_default = clsx;
    }
  });

  // src/react/CheckoutPage.jsx
  var CheckoutPage_exports = {};
  __export(CheckoutPage_exports, {
    default: () => CheckoutPage_default
  });
  var import_react4 = __toESM(require_react(), 1);

  // node_modules/@crossmint/client-sdk-react-ui/dist/chunk-KFL42A3A.js
  var t20 = { light: { icon: { type: "gradient", from: "#5edd4d", to: "#05ce6c" }, text: "#222" }, dark: { icon: { type: "gradient", from: "#5edd4d", to: "#05ce6c" }, text: "#fff" } };
  var e6 = { colors: t20.light, displayType: "icon-and-text" };
  var n6 = { "icon-only": "0 0 86 86", "icon-and-text": "0 0 459.2 86" };

  // node_modules/@crossmint/client-sdk-react-ui/dist/chunk-EA7H4AXL.js
  init_chunk_PXDN3KFO();
  var import_react2 = __toESM(require_react(), 1);
  var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
  function T2(u4) {
    var l5 = u4, { colors: t21, displayType: n7 = "icon-and-text" } = l5, o9 = t(l5, ["colors", "displayType"]);
    let { icon: C, text: f3 } = { icon: (t21 == null ? void 0 : t21.icon) || e6.colors.icon, text: (t21 == null ? void 0 : t21.text) || t20.light.text }, s7 = { colors: { icon: C, text: f3 }, displayType: n7 };
    o9.width == null && o9.height == null && (o9.width = 144);
    let r17 = (0, import_react2.useId)();
    return (0, import_jsx_runtime2.jsxs)("svg", s(r({ viewBox: n6[n7] }, o9), { children: [q4(s7, r17), (0, import_jsx_runtime2.jsx)("g", { children: (0, import_jsx_runtime2.jsxs)("g", { children: [y2(s7), v7(s7, r17)] }) })] }));
  }
  function q4(t21, n7) {
    let { icon: o9 } = t21.colors;
    return o9.type !== "gradient" ? null : (0, import_jsx_runtime2.jsx)("defs", { children: (0, import_jsx_runtime2.jsxs)("linearGradient", { id: `logoGradient-${n7}`, className: "logoGradient", x1: ".1", y1: ".1", x2: "85.8", y2: "85.8", gradientUnits: "userSpaceOnUse", children: [(0, import_jsx_runtime2.jsx)("stop", { className: "stop-0", offset: "0", stopColor: o9.from }), (0, import_jsx_runtime2.jsx)("stop", { className: "stop-1", offset: "1", stopColor: o9.to })] }) });
  }
  function y2({ colors: t21, displayType: n7 }) {
    if (n7 === "icon-only") return null;
    let { text: o9 } = t21;
    return (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [(0, import_jsx_runtime2.jsx)("path", { fill: o9, d: "M372.7 9.5c0-3.4 2.7-6.1 6-6.1S385 6 385 9.5s-2.8 6-6.2 6-6-2.6-6-6m77.7 1.9V24h8.6v8.8h-8.6V52q-.1 5.4 5.3 5.2c1.3 0 3-.2 3.4-.3v8.2c-.6.2-2.5 1-6 1-7.7 0-12.5-4.7-12.5-12.5V33H433v-9h8.5V11.4zm-338 44.4q3 5 7.8 7.9 5 2.8 11.3 2.8 4.5 0 8.4-1.5 3.7-1.7 6.6-4.4 2.8-2.9 4-6.4l-8.9-4a10.5 10.5 0 0 1-10.1 7 11 11 0 0 1-6-1.5q-2.4-1.7-4-4.5-1.5-2.9-1.4-6.6a12 12 0 0 1 1.4-6.5q1.5-3 4-4.5a11 11 0 0 1 6-1.6q3.5 0 6.2 2 2.8 1.9 4 5l8.8-3.8q-1.2-3.9-4-6.5-2.9-2.8-6.7-4.3-3.9-1.6-8.3-1.6-6.3 0-11.3 2.8a21 21 0 0 0-7.8 7.8q-2.8 5-2.8 11.2c0 6.2 1 7.9 2.8 11.2m53-32.1h-9.4v41.9h10V42.3q0-4.8 2.7-7.4 2.5-2.7 6.9-2.7h3.6v-9H177q-4.5 0-7.6 1.9a10 10 0 0 0-3.8 4.5z" }), (0, import_jsx_runtime2.jsx)("path", { d: "M202.9 22.8c12.4 0 21.6 9.3 21.6 22s-9.1 22-21.6 22-21.5-9.2-21.5-22 9.1-22 21.5-22m0 35.2c6.1 0 11.6-4.5 11.6-13.2s-5.5-13-11.6-13-11.6 4.4-11.6 13S196.8 58 203 58", fillRule: "evenodd", fill: o9 }), (0, import_jsx_runtime2.jsx)("path", { fill: o9, d: "m236.4 52-8.6 2.4c.5 4.6 5 12.5 17.1 12.5 10.6 0 15.7-7 15.7-13.3s-4.1-11-12-12.6l-6.3-1.3q-4-1-4.1-4.4c0-2.5 2.4-4.7 6-4.7 5.5 0 7.3 3.8 7.6 6.2l8.4-2.4c-.7-4.1-4.5-11.6-16-11.6-8.7 0-15.3 6.1-15.3 13.4 0 5.7 3.8 10.5 11.1 12l6.2 1.4q4.9 1.2 4.8 4.6c0 2.6-2 4.8-6.2 4.8-5.3 0-8-3.3-8.4-7m27.6 2.4 8.5-2.4c.4 3.7 3.2 7 8.5 7 4 0 6.2-2.2 6.2-4.7q.1-3.6-4.9-4.6l-6.1-1.4c-7.3-1.6-11.2-6.4-11.2-12.1 0-7.2 6.7-13.4 15.3-13.4 11.6 0 15.3 7.5 16 11.6l-8.4 2.4c-.3-2.4-2-6.2-7.6-6.2-3.5 0-6 2.2-6 4.7q.2 3.5 4.2 4.4l6.3 1.3c7.8 1.7 12 6.5 12 12.6s-5.2 13.3-15.8 13.3c-12 0-16.6-7.8-17-12.5m48.6-30.7h-9.5v41.9h10.1V41q0-2.7 1-4.8a8 8 0 0 1 7-4.2 8 8 0 0 1 7.2 4.2q1 2.1 1 4.8v24.6h10.1V41q0-2.7 1-4.8a8 8 0 0 1 7-4.2q2.6 0 4.4 1.2 1.8 1 2.8 3 1 2.1 1 4.8v24.6h10v-27q0-4.5-2-8.2a14 14 0 0 0-5.5-5.6q-3.5-2-8-2-5 0-8.8 2.5-2.4 1.6-4.1 4.2-1.4-2.3-3.9-4a16 16 0 0 0-9-2.7q-4.8 0-8.3 2.2-2.2 1.5-3.5 4zm71.1 41.9h-9.8V24.1h9.8zm8.8-41.6v41.6h10V41.3q0-2.8 1.1-4.8a8 8 0 0 1 7.3-4.2 8 8 0 0 1 7.4 4.2q1 2 1 4.7v24.4h10V38.9q0-4.6-2-8.2a14 14 0 0 0-5.5-5.6q-3.4-2-8.1-2c-4.7 0-5.5.7-7.8 2q-2.5 1.6-4 4v-5z" })] });
  }
  function v7(t21, n7) {
    let { icon: o9 } = t21.colors;
    return (0, import_jsx_runtime2.jsx)("path", { d: "M70 48.3A62 62 0 0 0 47.5 43c7.7-.6 22.8-2.7 29-10.4C86.6 25.2 86 .3 86 .3S62.3-2.4 52 9.4c-6.5 6.4-8.4 17.5-9 25.2-.6-7.7-2.6-18.8-9-25.2C23.7-2.4 0 .3 0 .3S-.3 15.8 4.4 26C6.8 31 11 35.1 16 37.6c7.2 3.7 16.8 5 22.4 5.4-5.6.4-15.2 1.7-22.4 5.3C11 51 6.8 55 4.4 60-.3 70.2 0 85.7 0 85.7s23.7 2.6 34-9.2c6.4-6.3 8.4-17.5 9-25.2.6 7.8 2.6 18.9 9 25.3 10.3 11.7 34 9.1 34 9.1s.3-15.6-4.5-25.7A25 25 0 0 0 70 48.3m.8 21.9c-.1 0-12.5-3.6-28.3-24.7A195 195 0 0 0 15 71.8l-.5.6.2-.8c0-.1 3.7-12.8 25.7-29C38.3 39.4 33.3 32.2 14 15l-.4-.4.6.1c.4 0 10.3 1.6 28.5 25l.6 1c2.6-1.8 10-7.1 26.7-26l.4-.4-.1.6c0 .4-1.6 10.3-24.9 28.4A193 193 0 0 0 71 69.9l.6.5z", fill: o9.type === "gradient" ? `url(#logoGradient-${n7})` : o9.color, fillRule: "evenodd" });
  }

  // node_modules/@crossmint/client-sdk-react-ui/dist/chunk-7GZKNQXY.js
  init_chunk_6VJKARU5();
  init_chunk_ROJ6HFVK();
  init_chunk_PXDN3KFO();
  init_dist3();
  init_clsx();
  var import_react3 = __toESM(require_react(), 1);
  var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
  function z2(f3) {
    let [h4, k5] = (0, import_react3.useState)(false), { crossmint: y3 } = N(), P2 = m2(y3), c2 = f3, { recipient: g5, locale: H2, lineItems: S4, payment: V, appearance: v8 } = c2, b = t(c2, ["recipient", "locale", "lineItems", "payment", "appearance"]), n7 = { recipient: g5, locale: H2, lineItems: S4, payment: V, appearance: v8 }, x3 = v6({ apiClient: P2, hostedCheckoutProps: n7 }), t21 = H(n7), p5 = b, { onClick: r17, className: E4, children: e8 } = p5, I4 = t(p5, ["onClick", "className", "children"]);
    function B(o9) {
      o9.preventDefault(), o9.stopPropagation(), x3.createWindow(), r17 && r17(o9);
    }
    let i8 = t21.generateCss();
    return (0, import_react3.useEffect)(() => {
      let { cleanup: o9 } = t21.injectCss(i8);
      return k5(true), o9;
    }, [i8]), h4 ? (0, import_jsx_runtime3.jsxs)("button", s(r({ onClick: B, className: clsx_default(t21.identifiers.buttonClassNames, E4) }, I4), { children: [(0, import_jsx_runtime3.jsx)(T2, { style: { marginRight: "12px", flex: "none" }, displayType: "icon-only", id: t21.identifiers.logoId, height: 16, width: 16 }), e8 != null ? e8 : (0, import_jsx_runtime3.jsx)("p", { style: { margin: 0 }, children: t21.getButtonText() })] })) : null;
  }

  // node_modules/@crossmint/client-sdk-react-ui/dist/index.js
  init_chunk_ROJ6HFVK();

  // src/react/CheckoutPage.jsx
  function CheckoutPage() {
    const [avatar, setAvatar] = (0, import_react4.useState)(null);
    const urlParams = new URLSearchParams(window.location.search);
    const avatarId = urlParams.get("avatarId");
    const templateId = urlParams.get("templateId");
    const collectionId = urlParams.get("collectionId");
    (0, import_react4.useEffect)(() => {
      if (avatarId) {
        fetch(`/api/avatars/${avatarId}`).then((res) => res.json()).then((data) => setAvatar(data)).catch((err) => console.error("Error fetching avatar:", err));
      }
    }, [avatarId]);
    if (!avatar) {
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "p-8 text-center" }, "Loading...");
    }
    return /* @__PURE__ */ import_react4.default.createElement("div", { className: "min-h-screen bg-gray-900 text-white p-8" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "max-w-2xl mx-auto bg-gray-800 rounded-lg overflow-hidden shadow-xl" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "p-8" }, /* @__PURE__ */ import_react4.default.createElement("h1", { className: "text-3xl font-bold mb-6 text-center" }, "Collect ", avatar.name), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex flex-col md:flex-row gap-8 items-center mb-8" }, /* @__PURE__ */ import_react4.default.createElement(
      "img",
      {
        src: avatar.imageUrl,
        alt: avatar.name,
        className: "w-64 h-64 object-cover rounded-lg shadow-lg"
      }
    ), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react4.default.createElement("h2", { className: "text-xl font-semibold mb-2" }, avatar.name), /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-gray-300 mb-4" }, avatar.description), /* @__PURE__ */ import_react4.default.createElement("div", { className: "bg-gray-700 p-4 rounded-lg" }, /* @__PURE__ */ import_react4.default.createElement("h3", { className: "font-medium mb-2" }, "Personality"), /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-gray-300" }, avatar.personality)))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "border-t border-gray-700 pt-6" }, /* @__PURE__ */ import_react4.default.createElement(J, { apiKey: "ck_staging_21j2UbKYUM7wam4MbDspgk7E7XvnLGdf34YDrE67TFa5eMpBJNab8UCwLhPZFHjrUtUwy2N8x7uDCs6TKszdwHUAKoNzcKNk12drQQzCHuhQMniQdQPzReSat9sGr47Yk8mZnLy4bKe6tVmVP8khy2NdZpa2VUYPLRUHQ4KuLrNaj5VyGWyHSXdE4eGQ1LNpAXvsdfnn5u3dyTwBWuityYN" }, /* @__PURE__ */ import_react4.default.createElement(
      z2,
      {
        lineItems: {
          collectionLocator: `crossmint:${collectionId}`,
          callData: {
            totalPrice: "0.001",
            quantity: 1,
            templateId,
            avatarId
          }
        },
        payment: {
          crypto: { enabled: true },
          fiat: { enabled: true }
        },
        appearance: {
          theme: {
            button: "dark",
            checkout: "dark"
          }
        }
      }
    ))))));
  }
  var CheckoutPage_default = CheckoutPage;
  return __toCommonJS(CheckoutPage_exports);
})();
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
