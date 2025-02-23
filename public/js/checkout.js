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

  // node_modules/scheduler/cjs/scheduler.production.js
  var require_scheduler_production = __commonJS({
    "node_modules/scheduler/cjs/scheduler.production.js"(exports) {
      "use strict";
      function push(heap, node) {
        var index = heap.length;
        heap.push(node);
        a: for (; 0 < index; ) {
          var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
          if (0 < compare(parent, node))
            heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
          else break a;
        }
      }
      function peek(heap) {
        return 0 === heap.length ? null : heap[0];
      }
      function pop(heap) {
        if (0 === heap.length) return null;
        var first = heap[0], last = heap.pop();
        if (last !== first) {
          heap[0] = last;
          a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength; ) {
            var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
            if (0 > compare(left, last))
              rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
            else if (rightIndex < length && 0 > compare(right, last))
              heap[index] = right, heap[rightIndex] = last, index = rightIndex;
            else break a;
          }
        }
        return first;
      }
      function compare(a4, b) {
        var diff = a4.sortIndex - b.sortIndex;
        return 0 !== diff ? diff : a4.id - b.id;
      }
      exports.unstable_now = void 0;
      if ("object" === typeof performance && "function" === typeof performance.now) {
        localPerformance = performance;
        exports.unstable_now = function() {
          return localPerformance.now();
        };
      } else {
        localDate = Date, initialTime = localDate.now();
        exports.unstable_now = function() {
          return localDate.now() - initialTime;
        };
      }
      var localPerformance;
      var localDate;
      var initialTime;
      var taskQueue = [];
      var timerQueue = [];
      var taskIdCounter = 1;
      var currentTask = null;
      var currentPriorityLevel = 3;
      var isPerformingWork = false;
      var isHostCallbackScheduled = false;
      var isHostTimeoutScheduled = false;
      var localSetTimeout = "function" === typeof setTimeout ? setTimeout : null;
      var localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null;
      var localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
      function advanceTimers(currentTime) {
        for (var timer = peek(timerQueue); null !== timer; ) {
          if (null === timer.callback) pop(timerQueue);
          else if (timer.startTime <= currentTime)
            pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
          else break;
          timer = peek(timerQueue);
        }
      }
      function handleTimeout(currentTime) {
        isHostTimeoutScheduled = false;
        advanceTimers(currentTime);
        if (!isHostCallbackScheduled)
          if (null !== peek(taskQueue))
            isHostCallbackScheduled = true, requestHostCallback();
          else {
            var firstTimer = peek(timerQueue);
            null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
          }
      }
      var isMessageLoopRunning = false;
      var taskTimeoutID = -1;
      var frameInterval = 5;
      var startTime = -1;
      function shouldYieldToHost() {
        return exports.unstable_now() - startTime < frameInterval ? false : true;
      }
      function performWorkUntilDeadline() {
        if (isMessageLoopRunning) {
          var currentTime = exports.unstable_now();
          startTime = currentTime;
          var hasMoreWork = true;
          try {
            a: {
              isHostCallbackScheduled = false;
              isHostTimeoutScheduled && (isHostTimeoutScheduled = false, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
              isPerformingWork = true;
              var previousPriorityLevel = currentPriorityLevel;
              try {
                b: {
                  advanceTimers(currentTime);
                  for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost()); ) {
                    var callback = currentTask.callback;
                    if ("function" === typeof callback) {
                      currentTask.callback = null;
                      currentPriorityLevel = currentTask.priorityLevel;
                      var continuationCallback = callback(
                        currentTask.expirationTime <= currentTime
                      );
                      currentTime = exports.unstable_now();
                      if ("function" === typeof continuationCallback) {
                        currentTask.callback = continuationCallback;
                        advanceTimers(currentTime);
                        hasMoreWork = true;
                        break b;
                      }
                      currentTask === peek(taskQueue) && pop(taskQueue);
                      advanceTimers(currentTime);
                    } else pop(taskQueue);
                    currentTask = peek(taskQueue);
                  }
                  if (null !== currentTask) hasMoreWork = true;
                  else {
                    var firstTimer = peek(timerQueue);
                    null !== firstTimer && requestHostTimeout(
                      handleTimeout,
                      firstTimer.startTime - currentTime
                    );
                    hasMoreWork = false;
                  }
                }
                break a;
              } finally {
                currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = false;
              }
              hasMoreWork = void 0;
            }
          } finally {
            hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = false;
          }
        }
      }
      var schedulePerformWorkUntilDeadline;
      if ("function" === typeof localSetImmediate)
        schedulePerformWorkUntilDeadline = function() {
          localSetImmediate(performWorkUntilDeadline);
        };
      else if ("undefined" !== typeof MessageChannel) {
        channel = new MessageChannel(), port = channel.port2;
        channel.port1.onmessage = performWorkUntilDeadline;
        schedulePerformWorkUntilDeadline = function() {
          port.postMessage(null);
        };
      } else
        schedulePerformWorkUntilDeadline = function() {
          localSetTimeout(performWorkUntilDeadline, 0);
        };
      var channel;
      var port;
      function requestHostCallback() {
        isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline());
      }
      function requestHostTimeout(callback, ms) {
        taskTimeoutID = localSetTimeout(function() {
          callback(exports.unstable_now());
        }, ms);
      }
      exports.unstable_IdlePriority = 5;
      exports.unstable_ImmediatePriority = 1;
      exports.unstable_LowPriority = 4;
      exports.unstable_NormalPriority = 3;
      exports.unstable_Profiling = null;
      exports.unstable_UserBlockingPriority = 2;
      exports.unstable_cancelCallback = function(task) {
        task.callback = null;
      };
      exports.unstable_continueExecution = function() {
        isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, requestHostCallback());
      };
      exports.unstable_forceFrameRate = function(fps) {
        0 > fps || 125 < fps ? console.error(
          "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
        ) : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
      };
      exports.unstable_getCurrentPriorityLevel = function() {
        return currentPriorityLevel;
      };
      exports.unstable_getFirstCallbackNode = function() {
        return peek(taskQueue);
      };
      exports.unstable_next = function(eventHandler) {
        switch (currentPriorityLevel) {
          case 1:
          case 2:
          case 3:
            var priorityLevel = 3;
            break;
          default:
            priorityLevel = currentPriorityLevel;
        }
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = priorityLevel;
        try {
          return eventHandler();
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      };
      exports.unstable_pauseExecution = function() {
      };
      exports.unstable_requestPaint = function() {
      };
      exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
        switch (priorityLevel) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            priorityLevel = 3;
        }
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = priorityLevel;
        try {
          return eventHandler();
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      };
      exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
        var currentTime = exports.unstable_now();
        "object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
        switch (priorityLevel) {
          case 1:
            var timeout = -1;
            break;
          case 2:
            timeout = 250;
            break;
          case 5:
            timeout = 1073741823;
            break;
          case 4:
            timeout = 1e4;
            break;
          default:
            timeout = 5e3;
        }
        timeout = options + timeout;
        priorityLevel = {
          id: taskIdCounter++,
          callback,
          priorityLevel,
          startTime: options,
          expirationTime: timeout,
          sortIndex: -1
        };
        options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = true, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, requestHostCallback()));
        return priorityLevel;
      };
      exports.unstable_shouldYield = shouldYieldToHost;
      exports.unstable_wrapCallback = function(callback) {
        var parentPriorityLevel = currentPriorityLevel;
        return function() {
          var previousPriorityLevel = currentPriorityLevel;
          currentPriorityLevel = parentPriorityLevel;
          try {
            return callback.apply(this, arguments);
          } finally {
            currentPriorityLevel = previousPriorityLevel;
          }
        };
      };
    }
  });

  // node_modules/scheduler/index.js
  var require_scheduler = __commonJS({
    "node_modules/scheduler/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_scheduler_production();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react-dom/cjs/react-dom.production.js
  var require_react_dom_production = __commonJS({
    "node_modules/react-dom/cjs/react-dom.production.js"(exports) {
      "use strict";
      var React2 = require_react();
      function formatProdErrorMessage(code) {
        var url = "https://react.dev/errors/" + code;
        if (1 < arguments.length) {
          url += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var i8 = 2; i8 < arguments.length; i8++)
            url += "&args[]=" + encodeURIComponent(arguments[i8]);
        }
        return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      function noop() {
      }
      var Internals = {
        d: {
          f: noop,
          r: function() {
            throw Error(formatProdErrorMessage(522));
          },
          D: noop,
          C: noop,
          L: noop,
          m: noop,
          X: noop,
          S: noop,
          M: noop
        },
        p: 0,
        findDOMNode: null
      };
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      function createPortal$1(children, containerInfo, implementation) {
        var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
        return {
          $$typeof: REACT_PORTAL_TYPE,
          key: null == key ? null : "" + key,
          children,
          containerInfo,
          implementation
        };
      }
      var ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      function getCrossOriginStringAs(as, input) {
        if ("font" === as) return "";
        if ("string" === typeof input)
          return "use-credentials" === input ? input : "";
      }
      exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
      exports.createPortal = function(children, container2) {
        var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
        if (!container2 || 1 !== container2.nodeType && 9 !== container2.nodeType && 11 !== container2.nodeType)
          throw Error(formatProdErrorMessage(299));
        return createPortal$1(children, container2, null, key);
      };
      exports.flushSync = function(fn) {
        var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
        try {
          if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
        } finally {
          ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
        }
      };
      exports.preconnect = function(href, options) {
        "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
      };
      exports.prefetchDNS = function(href) {
        "string" === typeof href && Internals.d.D(href);
      };
      exports.preinit = function(href, options) {
        if ("string" === typeof href && options && "string" === typeof options.as) {
          var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
          "style" === as ? Internals.d.S(
            href,
            "string" === typeof options.precedence ? options.precedence : void 0,
            {
              crossOrigin,
              integrity,
              fetchPriority
            }
          ) : "script" === as && Internals.d.X(href, {
            crossOrigin,
            integrity,
            fetchPriority,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
          });
        }
      };
      exports.preinitModule = function(href, options) {
        if ("string" === typeof href)
          if ("object" === typeof options && null !== options) {
            if (null == options.as || "script" === options.as) {
              var crossOrigin = getCrossOriginStringAs(
                options.as,
                options.crossOrigin
              );
              Internals.d.M(href, {
                crossOrigin,
                integrity: "string" === typeof options.integrity ? options.integrity : void 0,
                nonce: "string" === typeof options.nonce ? options.nonce : void 0
              });
            }
          } else null == options && Internals.d.M(href);
      };
      exports.preload = function(href, options) {
        if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
          var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
          Internals.d.L(href, as, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
            type: "string" === typeof options.type ? options.type : void 0,
            fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
            referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
            imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
            imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
            media: "string" === typeof options.media ? options.media : void 0
          });
        }
      };
      exports.preloadModule = function(href, options) {
        if ("string" === typeof href)
          if (options) {
            var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
            Internals.d.m(href, {
              as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
              crossOrigin,
              integrity: "string" === typeof options.integrity ? options.integrity : void 0
            });
          } else Internals.d.m(href);
      };
      exports.requestFormReset = function(form) {
        Internals.d.r(form);
      };
      exports.unstable_batchedUpdates = function(fn, a4) {
        return fn(a4);
      };
      exports.useFormState = function(action, initialState, permalink) {
        return ReactSharedInternals.H.useFormState(action, initialState, permalink);
      };
      exports.useFormStatus = function() {
        return ReactSharedInternals.H.useHostTransitionStatus();
      };
      exports.version = "19.0.0";
    }
  });

  // node_modules/react-dom/index.js
  var require_react_dom = __commonJS({
    "node_modules/react-dom/index.js"(exports, module) {
      "use strict";
      function checkDCE() {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
          return;
        }
        if (false) {
          throw new Error("^_^");
        }
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
        } catch (err) {
          console.error(err);
        }
      }
      if (true) {
        checkDCE();
        module.exports = require_react_dom_production();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react-dom/cjs/react-dom-client.production.js
  var require_react_dom_client_production = __commonJS({
    "node_modules/react-dom/cjs/react-dom-client.production.js"(exports) {
      "use strict";
      var Scheduler = require_scheduler();
      var React2 = require_react();
      var ReactDOM = require_react_dom();
      function formatProdErrorMessage(code) {
        var url = "https://react.dev/errors/" + code;
        if (1 < arguments.length) {
          url += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var i8 = 2; i8 < arguments.length; i8++)
            url += "&args[]=" + encodeURIComponent(arguments[i8]);
        }
        return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      function isValidContainer(node) {
        return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
      }
      var REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element");
      var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
      var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
      var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
      var REACT_CONTEXT_TYPE = Symbol.for("react.context");
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
      var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
      var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
      var REACT_MEMO_TYPE = Symbol.for("react.memo");
      var REACT_LAZY_TYPE = Symbol.for("react.lazy");
      Symbol.for("react.scope");
      Symbol.for("react.debug_trace_mode");
      var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
      Symbol.for("react.legacy_hidden");
      Symbol.for("react.tracing_marker");
      var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
      var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PORTAL_TYPE:
            return "Portal";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
        }
        if ("object" === typeof type)
          switch (type.$$typeof) {
            case REACT_CONTEXT_TYPE:
              return (type.displayName || "Context") + ".Provider";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x3) {
              }
          }
        return null;
      }
      var ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      var assign = Object.assign;
      var prefix;
      var suffix;
      function describeBuiltInComponentFrame(name) {
        if (void 0 === prefix)
          try {
            throw Error();
          } catch (x3) {
            var match = x3.stack.trim().match(/\n( *(at )?)/);
            prefix = match && match[1] || "";
            suffix = -1 < x3.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x3.stack.indexOf("@") ? "@unknown:0:0" : "";
          }
        return "\n" + prefix + name + suffix;
      }
      var reentry = false;
      function describeNativeComponentFrame(fn, construct) {
        if (!fn || reentry) return "";
        reentry = true;
        var previousPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
          var RunInRootFrame = {
            DetermineComponentFrameRoot: function() {
              try {
                if (construct) {
                  var Fake = function() {
                    throw Error();
                  };
                  Object.defineProperty(Fake.prototype, "props", {
                    set: function() {
                      throw Error();
                    }
                  });
                  if ("object" === typeof Reflect && Reflect.construct) {
                    try {
                      Reflect.construct(Fake, []);
                    } catch (x3) {
                      var control = x3;
                    }
                    Reflect.construct(fn, [], Fake);
                  } else {
                    try {
                      Fake.call();
                    } catch (x$0) {
                      control = x$0;
                    }
                    fn.call(Fake.prototype);
                  }
                } else {
                  try {
                    throw Error();
                  } catch (x$1) {
                    control = x$1;
                  }
                  (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {
                  });
                }
              } catch (sample) {
                if (sample && control && "string" === typeof sample.stack)
                  return [sample.stack, control.stack];
              }
              return [null, null];
            }
          };
          RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
          var namePropDescriptor = Object.getOwnPropertyDescriptor(
            RunInRootFrame.DetermineComponentFrameRoot,
            "name"
          );
          namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(
            RunInRootFrame.DetermineComponentFrameRoot,
            "name",
            { value: "DetermineComponentFrameRoot" }
          );
          var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
          if (sampleStack && controlStack) {
            var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
            for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
              RunInRootFrame++;
            for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes(
              "DetermineComponentFrameRoot"
            ); )
              namePropDescriptor++;
            if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
              for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
                namePropDescriptor--;
            for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
              if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
                  do
                    if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                      var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                      fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                      return frame;
                    }
                  while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
                }
                break;
              }
          }
        } finally {
          reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
        }
        return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
      }
      function describeFiber(fiber) {
        switch (fiber.tag) {
          case 26:
          case 27:
          case 5:
            return describeBuiltInComponentFrame(fiber.type);
          case 16:
            return describeBuiltInComponentFrame("Lazy");
          case 13:
            return describeBuiltInComponentFrame("Suspense");
          case 19:
            return describeBuiltInComponentFrame("SuspenseList");
          case 0:
          case 15:
            return fiber = describeNativeComponentFrame(fiber.type, false), fiber;
          case 11:
            return fiber = describeNativeComponentFrame(fiber.type.render, false), fiber;
          case 1:
            return fiber = describeNativeComponentFrame(fiber.type, true), fiber;
          default:
            return "";
        }
      }
      function getStackByFiberInDevAndProd(workInProgress2) {
        try {
          var info = "";
          do
            info += describeFiber(workInProgress2), workInProgress2 = workInProgress2.return;
          while (workInProgress2);
          return info;
        } catch (x3) {
          return "\nError generating stack: " + x3.message + "\n" + x3.stack;
        }
      }
      function getNearestMountedFiber(fiber) {
        var node = fiber, nearestMounted = fiber;
        if (fiber.alternate) for (; node.return; ) node = node.return;
        else {
          fiber = node;
          do
            node = fiber, 0 !== (node.flags & 4098) && (nearestMounted = node.return), fiber = node.return;
          while (fiber);
        }
        return 3 === node.tag ? nearestMounted : null;
      }
      function getSuspenseInstanceFromFiber(fiber) {
        if (13 === fiber.tag) {
          var suspenseState = fiber.memoizedState;
          null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
          if (null !== suspenseState) return suspenseState.dehydrated;
        }
        return null;
      }
      function assertIsMounted(fiber) {
        if (getNearestMountedFiber(fiber) !== fiber)
          throw Error(formatProdErrorMessage(188));
      }
      function findCurrentFiberUsingSlowPath(fiber) {
        var alternate = fiber.alternate;
        if (!alternate) {
          alternate = getNearestMountedFiber(fiber);
          if (null === alternate) throw Error(formatProdErrorMessage(188));
          return alternate !== fiber ? null : fiber;
        }
        for (var a4 = fiber, b = alternate; ; ) {
          var parentA = a4.return;
          if (null === parentA) break;
          var parentB = parentA.alternate;
          if (null === parentB) {
            b = parentA.return;
            if (null !== b) {
              a4 = b;
              continue;
            }
            break;
          }
          if (parentA.child === parentB.child) {
            for (parentB = parentA.child; parentB; ) {
              if (parentB === a4) return assertIsMounted(parentA), fiber;
              if (parentB === b) return assertIsMounted(parentA), alternate;
              parentB = parentB.sibling;
            }
            throw Error(formatProdErrorMessage(188));
          }
          if (a4.return !== b.return) a4 = parentA, b = parentB;
          else {
            for (var didFindChild = false, child$2 = parentA.child; child$2; ) {
              if (child$2 === a4) {
                didFindChild = true;
                a4 = parentA;
                b = parentB;
                break;
              }
              if (child$2 === b) {
                didFindChild = true;
                b = parentA;
                a4 = parentB;
                break;
              }
              child$2 = child$2.sibling;
            }
            if (!didFindChild) {
              for (child$2 = parentB.child; child$2; ) {
                if (child$2 === a4) {
                  didFindChild = true;
                  a4 = parentB;
                  b = parentA;
                  break;
                }
                if (child$2 === b) {
                  didFindChild = true;
                  b = parentB;
                  a4 = parentA;
                  break;
                }
                child$2 = child$2.sibling;
              }
              if (!didFindChild) throw Error(formatProdErrorMessage(189));
            }
          }
          if (a4.alternate !== b) throw Error(formatProdErrorMessage(190));
        }
        if (3 !== a4.tag) throw Error(formatProdErrorMessage(188));
        return a4.stateNode.current === a4 ? fiber : alternate;
      }
      function findCurrentHostFiberImpl(node) {
        var tag = node.tag;
        if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
        for (node = node.child; null !== node; ) {
          tag = findCurrentHostFiberImpl(node);
          if (null !== tag) return tag;
          node = node.sibling;
        }
        return null;
      }
      var isArrayImpl = Array.isArray;
      var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      var sharedNotPendingObject = {
        pending: false,
        data: null,
        method: null,
        action: null
      };
      var valueStack = [];
      var index = -1;
      function createCursor(defaultValue) {
        return { current: defaultValue };
      }
      function pop(cursor) {
        0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
      }
      function push(cursor, value) {
        index++;
        valueStack[index] = cursor.current;
        cursor.current = value;
      }
      var contextStackCursor = createCursor(null);
      var contextFiberStackCursor = createCursor(null);
      var rootInstanceStackCursor = createCursor(null);
      var hostTransitionProviderCursor = createCursor(null);
      function pushHostContainer(fiber, nextRootInstance) {
        push(rootInstanceStackCursor, nextRootInstance);
        push(contextFiberStackCursor, fiber);
        push(contextStackCursor, null);
        fiber = nextRootInstance.nodeType;
        switch (fiber) {
          case 9:
          case 11:
            nextRootInstance = (nextRootInstance = nextRootInstance.documentElement) ? (nextRootInstance = nextRootInstance.namespaceURI) ? getOwnHostContext(nextRootInstance) : 0 : 0;
            break;
          default:
            if (fiber = 8 === fiber ? nextRootInstance.parentNode : nextRootInstance, nextRootInstance = fiber.tagName, fiber = fiber.namespaceURI)
              fiber = getOwnHostContext(fiber), nextRootInstance = getChildHostContextProd(fiber, nextRootInstance);
            else
              switch (nextRootInstance) {
                case "svg":
                  nextRootInstance = 1;
                  break;
                case "math":
                  nextRootInstance = 2;
                  break;
                default:
                  nextRootInstance = 0;
              }
        }
        pop(contextStackCursor);
        push(contextStackCursor, nextRootInstance);
      }
      function popHostContainer() {
        pop(contextStackCursor);
        pop(contextFiberStackCursor);
        pop(rootInstanceStackCursor);
      }
      function pushHostContext(fiber) {
        null !== fiber.memoizedState && push(hostTransitionProviderCursor, fiber);
        var context = contextStackCursor.current;
        var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
        context !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
      }
      function popHostContext(fiber) {
        contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
        hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
      }
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var scheduleCallback$3 = Scheduler.unstable_scheduleCallback;
      var cancelCallback$1 = Scheduler.unstable_cancelCallback;
      var shouldYield = Scheduler.unstable_shouldYield;
      var requestPaint = Scheduler.unstable_requestPaint;
      var now = Scheduler.unstable_now;
      var getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
      var ImmediatePriority = Scheduler.unstable_ImmediatePriority;
      var UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
      var NormalPriority$1 = Scheduler.unstable_NormalPriority;
      var LowPriority = Scheduler.unstable_LowPriority;
      var IdlePriority = Scheduler.unstable_IdlePriority;
      var log$1 = Scheduler.log;
      var unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;
      var rendererID = null;
      var injectedHook = null;
      function onCommitRoot(root3) {
        if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot)
          try {
            injectedHook.onCommitFiberRoot(
              rendererID,
              root3,
              void 0,
              128 === (root3.current.flags & 128)
            );
          } catch (err) {
          }
      }
      function setIsStrictModeForDevtools(newIsStrictMode) {
        "function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
        if (injectedHook && "function" === typeof injectedHook.setStrictMode)
          try {
            injectedHook.setStrictMode(rendererID, newIsStrictMode);
          } catch (err) {
          }
      }
      var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
      var log = Math.log;
      var LN2 = Math.LN2;
      function clz32Fallback(x3) {
        x3 >>>= 0;
        return 0 === x3 ? 32 : 31 - (log(x3) / LN2 | 0) | 0;
      }
      var nextTransitionLane = 128;
      var nextRetryLane = 4194304;
      function getHighestPriorityLanes(lanes) {
        var pendingSyncLanes = lanes & 42;
        if (0 !== pendingSyncLanes) return pendingSyncLanes;
        switch (lanes & -lanes) {
          case 1:
            return 1;
          case 2:
            return 2;
          case 4:
            return 4;
          case 8:
            return 8;
          case 16:
            return 16;
          case 32:
            return 32;
          case 64:
            return 64;
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return lanes & 4194176;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
            return lanes & 62914560;
          case 67108864:
            return 67108864;
          case 134217728:
            return 134217728;
          case 268435456:
            return 268435456;
          case 536870912:
            return 536870912;
          case 1073741824:
            return 0;
          default:
            return lanes;
        }
      }
      function getNextLanes(root3, wipLanes) {
        var pendingLanes = root3.pendingLanes;
        if (0 === pendingLanes) return 0;
        var nextLanes = 0, suspendedLanes = root3.suspendedLanes, pingedLanes = root3.pingedLanes, warmLanes = root3.warmLanes;
        root3 = 0 !== root3.finishedLanes;
        var nonIdlePendingLanes = pendingLanes & 134217727;
        0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : root3 || (warmLanes = nonIdlePendingLanes & ~warmLanes, 0 !== warmLanes && (nextLanes = getHighestPriorityLanes(warmLanes))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : root3 || (warmLanes = pendingLanes & ~warmLanes, 0 !== warmLanes && (nextLanes = getHighestPriorityLanes(warmLanes))));
        return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, warmLanes = wipLanes & -wipLanes, suspendedLanes >= warmLanes || 32 === suspendedLanes && 0 !== (warmLanes & 4194176)) ? wipLanes : nextLanes;
      }
      function checkIfRootIsPrerendering(root3, renderLanes2) {
        return 0 === (root3.pendingLanes & ~(root3.suspendedLanes & ~root3.pingedLanes) & renderLanes2);
      }
      function computeExpirationTime(lane, currentTime) {
        switch (lane) {
          case 1:
          case 2:
          case 4:
          case 8:
            return currentTime + 250;
          case 16:
          case 32:
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return currentTime + 5e3;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
            return -1;
          case 67108864:
          case 134217728:
          case 268435456:
          case 536870912:
          case 1073741824:
            return -1;
          default:
            return -1;
        }
      }
      function claimNextTransitionLane() {
        var lane = nextTransitionLane;
        nextTransitionLane <<= 1;
        0 === (nextTransitionLane & 4194176) && (nextTransitionLane = 128);
        return lane;
      }
      function claimNextRetryLane() {
        var lane = nextRetryLane;
        nextRetryLane <<= 1;
        0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
        return lane;
      }
      function createLaneMap(initial) {
        for (var laneMap = [], i8 = 0; 31 > i8; i8++) laneMap.push(initial);
        return laneMap;
      }
      function markRootUpdated$1(root3, updateLane) {
        root3.pendingLanes |= updateLane;
        268435456 !== updateLane && (root3.suspendedLanes = 0, root3.pingedLanes = 0, root3.warmLanes = 0);
      }
      function markRootFinished(root3, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
        var previouslyPendingLanes = root3.pendingLanes;
        root3.pendingLanes = remainingLanes;
        root3.suspendedLanes = 0;
        root3.pingedLanes = 0;
        root3.warmLanes = 0;
        root3.expiredLanes &= remainingLanes;
        root3.entangledLanes &= remainingLanes;
        root3.errorRecoveryDisabledLanes &= remainingLanes;
        root3.shellSuspendCounter = 0;
        var entanglements = root3.entanglements, expirationTimes = root3.expirationTimes, hiddenUpdates = root3.hiddenUpdates;
        for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes; ) {
          var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
          entanglements[index$7] = 0;
          expirationTimes[index$7] = -1;
          var hiddenUpdatesForLane = hiddenUpdates[index$7];
          if (null !== hiddenUpdatesForLane)
            for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
              var update = hiddenUpdatesForLane[index$7];
              null !== update && (update.lane &= -536870913);
            }
          remainingLanes &= ~lane;
        }
        0 !== spawnedLane && markSpawnedDeferredLane(root3, spawnedLane, 0);
        0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root3.tag && (root3.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
      }
      function markSpawnedDeferredLane(root3, spawnedLane, entangledLanes) {
        root3.pendingLanes |= spawnedLane;
        root3.suspendedLanes &= ~spawnedLane;
        var spawnedLaneIndex = 31 - clz32(spawnedLane);
        root3.entangledLanes |= spawnedLane;
        root3.entanglements[spawnedLaneIndex] = root3.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 4194218;
      }
      function markRootEntangled(root3, entangledLanes) {
        var rootEntangledLanes = root3.entangledLanes |= entangledLanes;
        for (root3 = root3.entanglements; rootEntangledLanes; ) {
          var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
          lane & entangledLanes | root3[index$8] & entangledLanes && (root3[index$8] |= entangledLanes);
          rootEntangledLanes &= ~lane;
        }
      }
      function lanesToEventPriority(lanes) {
        lanes &= -lanes;
        return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
      }
      function resolveUpdatePriority() {
        var updatePriority = ReactDOMSharedInternals.p;
        if (0 !== updatePriority) return updatePriority;
        updatePriority = window.event;
        return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
      }
      function runWithPriority(priority, fn) {
        var previousPriority = ReactDOMSharedInternals.p;
        try {
          return ReactDOMSharedInternals.p = priority, fn();
        } finally {
          ReactDOMSharedInternals.p = previousPriority;
        }
      }
      var randomKey = Math.random().toString(36).slice(2);
      var internalInstanceKey = "__reactFiber$" + randomKey;
      var internalPropsKey = "__reactProps$" + randomKey;
      var internalContainerInstanceKey = "__reactContainer$" + randomKey;
      var internalEventHandlersKey = "__reactEvents$" + randomKey;
      var internalEventHandlerListenersKey = "__reactListeners$" + randomKey;
      var internalEventHandlesSetKey = "__reactHandles$" + randomKey;
      var internalRootNodeResourcesKey = "__reactResources$" + randomKey;
      var internalHoistableMarker = "__reactMarker$" + randomKey;
      function detachDeletedInstance(node) {
        delete node[internalInstanceKey];
        delete node[internalPropsKey];
        delete node[internalEventHandlersKey];
        delete node[internalEventHandlerListenersKey];
        delete node[internalEventHandlesSetKey];
      }
      function getClosestInstanceFromNode(targetNode) {
        var targetInst = targetNode[internalInstanceKey];
        if (targetInst) return targetInst;
        for (var parentNode = targetNode.parentNode; parentNode; ) {
          if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
            parentNode = targetInst.alternate;
            if (null !== targetInst.child || null !== parentNode && null !== parentNode.child)
              for (targetNode = getParentSuspenseInstance(targetNode); null !== targetNode; ) {
                if (parentNode = targetNode[internalInstanceKey]) return parentNode;
                targetNode = getParentSuspenseInstance(targetNode);
              }
            return targetInst;
          }
          targetNode = parentNode;
          parentNode = targetNode.parentNode;
        }
        return null;
      }
      function getInstanceFromNode(node) {
        if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
          var tag = node.tag;
          if (5 === tag || 6 === tag || 13 === tag || 26 === tag || 27 === tag || 3 === tag)
            return node;
        }
        return null;
      }
      function getNodeFromInstance(inst) {
        var tag = inst.tag;
        if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
        throw Error(formatProdErrorMessage(33));
      }
      function getResourcesFromRoot(root3) {
        var resources = root3[internalRootNodeResourcesKey];
        resources || (resources = root3[internalRootNodeResourcesKey] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() });
        return resources;
      }
      function markNodeAsHoistable(node) {
        node[internalHoistableMarker] = true;
      }
      var allNativeEvents = /* @__PURE__ */ new Set();
      var registrationNameDependencies = {};
      function registerTwoPhaseEvent(registrationName, dependencies) {
        registerDirectEvent(registrationName, dependencies);
        registerDirectEvent(registrationName + "Capture", dependencies);
      }
      function registerDirectEvent(registrationName, dependencies) {
        registrationNameDependencies[registrationName] = dependencies;
        for (registrationName = 0; registrationName < dependencies.length; registrationName++)
          allNativeEvents.add(dependencies[registrationName]);
      }
      var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
      var VALID_ATTRIBUTE_NAME_REGEX = RegExp(
        "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
      );
      var illegalAttributeNameCache = {};
      var validatedAttributeNameCache = {};
      function isAttributeNameSafe(attributeName) {
        if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
          return true;
        if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return false;
        if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
          return validatedAttributeNameCache[attributeName] = true;
        illegalAttributeNameCache[attributeName] = true;
        return false;
      }
      function setValueForAttribute(node, name, value) {
        if (isAttributeNameSafe(name))
          if (null === value) node.removeAttribute(name);
          else {
            switch (typeof value) {
              case "undefined":
              case "function":
              case "symbol":
                node.removeAttribute(name);
                return;
              case "boolean":
                var prefix$10 = name.toLowerCase().slice(0, 5);
                if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
                  node.removeAttribute(name);
                  return;
                }
            }
            node.setAttribute(name, "" + value);
          }
      }
      function setValueForKnownAttribute(node, name, value) {
        if (null === value) node.removeAttribute(name);
        else {
          switch (typeof value) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
              node.removeAttribute(name);
              return;
          }
          node.setAttribute(name, "" + value);
        }
      }
      function setValueForNamespacedAttribute(node, namespace, name, value) {
        if (null === value) node.removeAttribute(name);
        else {
          switch (typeof value) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
              node.removeAttribute(name);
              return;
          }
          node.setAttributeNS(namespace, name, "" + value);
        }
      }
      function getToStringValue(value) {
        switch (typeof value) {
          case "bigint":
          case "boolean":
          case "number":
          case "string":
          case "undefined":
            return value;
          case "object":
            return value;
          default:
            return "";
        }
      }
      function isCheckable(elem) {
        var type = elem.type;
        return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
      }
      function trackValueOnNode(node) {
        var valueField = isCheckable(node) ? "checked" : "value", descriptor = Object.getOwnPropertyDescriptor(
          node.constructor.prototype,
          valueField
        ), currentValue = "" + node[valueField];
        if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
          var get = descriptor.get, set = descriptor.set;
          Object.defineProperty(node, valueField, {
            configurable: true,
            get: function() {
              return get.call(this);
            },
            set: function(value) {
              currentValue = "" + value;
              set.call(this, value);
            }
          });
          Object.defineProperty(node, valueField, {
            enumerable: descriptor.enumerable
          });
          return {
            getValue: function() {
              return currentValue;
            },
            setValue: function(value) {
              currentValue = "" + value;
            },
            stopTracking: function() {
              node._valueTracker = null;
              delete node[valueField];
            }
          };
        }
      }
      function track(node) {
        node._valueTracker || (node._valueTracker = trackValueOnNode(node));
      }
      function updateValueIfChanged(node) {
        if (!node) return false;
        var tracker = node._valueTracker;
        if (!tracker) return true;
        var lastValue = tracker.getValue();
        var value = "";
        node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
        node = value;
        return node !== lastValue ? (tracker.setValue(node), true) : false;
      }
      function getActiveElement(doc) {
        doc = doc || ("undefined" !== typeof document ? document : void 0);
        if ("undefined" === typeof doc) return null;
        try {
          return doc.activeElement || doc.body;
        } catch (e8) {
          return doc.body;
        }
      }
      var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
      function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
        return value.replace(
          escapeSelectorAttributeValueInsideDoubleQuotesRegex,
          function(ch) {
            return "\\" + ch.charCodeAt(0).toString(16) + " ";
          }
        );
      }
      function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
        element.name = "";
        null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
        if (null != value)
          if ("number" === type) {
            if (0 === value && "" === element.value || element.value != value)
              element.value = "" + getToStringValue(value);
          } else
            element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
        else
          "submit" !== type && "reset" !== type || element.removeAttribute("value");
        null != value ? setDefaultValue(element, type, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, type, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
        null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
        null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
        null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
      }
      function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating2) {
        null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
        if (null != value || null != defaultValue) {
          if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value))
            return;
          defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
          value = null != value ? "" + getToStringValue(value) : defaultValue;
          isHydrating2 || value === element.value || (element.value = value);
          element.defaultValue = value;
        }
        checked = null != checked ? checked : defaultChecked;
        checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
        element.checked = isHydrating2 ? element.checked : !!checked;
        element.defaultChecked = !!checked;
        null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
      }
      function setDefaultValue(node, type, value) {
        "number" === type && getActiveElement(node.ownerDocument) === node || node.defaultValue === "" + value || (node.defaultValue = "" + value);
      }
      function updateOptions(node, multiple, propValue, setDefaultSelected) {
        node = node.options;
        if (multiple) {
          multiple = {};
          for (var i8 = 0; i8 < propValue.length; i8++)
            multiple["$" + propValue[i8]] = true;
          for (propValue = 0; propValue < node.length; propValue++)
            i8 = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i8 && (node[propValue].selected = i8), i8 && setDefaultSelected && (node[propValue].defaultSelected = true);
        } else {
          propValue = "" + getToStringValue(propValue);
          multiple = null;
          for (i8 = 0; i8 < node.length; i8++) {
            if (node[i8].value === propValue) {
              node[i8].selected = true;
              setDefaultSelected && (node[i8].defaultSelected = true);
              return;
            }
            null !== multiple || node[i8].disabled || (multiple = node[i8]);
          }
          null !== multiple && (multiple.selected = true);
        }
      }
      function updateTextarea(element, value, defaultValue) {
        if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
          element.defaultValue !== value && (element.defaultValue = value);
          return;
        }
        element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
      }
      function initTextarea(element, value, defaultValue, children) {
        if (null == value) {
          if (null != children) {
            if (null != defaultValue) throw Error(formatProdErrorMessage(92));
            if (isArrayImpl(children)) {
              if (1 < children.length) throw Error(formatProdErrorMessage(93));
              children = children[0];
            }
            defaultValue = children;
          }
          null == defaultValue && (defaultValue = "");
          value = defaultValue;
        }
        defaultValue = getToStringValue(value);
        element.defaultValue = defaultValue;
        children = element.textContent;
        children === defaultValue && "" !== children && null !== children && (element.value = children);
      }
      function setTextContent(node, text) {
        if (text) {
          var firstChild = node.firstChild;
          if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
            firstChild.nodeValue = text;
            return;
          }
        }
        node.textContent = text;
      }
      var unitlessNumbers = new Set(
        "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
          " "
        )
      );
      function setValueForStyle(style2, styleName, value) {
        var isCustomProperty = 0 === styleName.indexOf("--");
        null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style2.setProperty(styleName, "") : "float" === styleName ? style2.cssFloat = "" : style2[styleName] = "" : isCustomProperty ? style2.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style2.cssFloat = value : style2[styleName] = ("" + value).trim() : style2[styleName] = value + "px";
      }
      function setValueForStyles(node, styles, prevStyles) {
        if (null != styles && "object" !== typeof styles)
          throw Error(formatProdErrorMessage(62));
        node = node.style;
        if (null != prevStyles) {
          for (var styleName in prevStyles)
            !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "");
          for (var styleName$16 in styles)
            styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && setValueForStyle(node, styleName$16, styleName);
        } else
          for (var styleName$17 in styles)
            styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
      }
      function isCustomElement(tagName) {
        if (-1 === tagName.indexOf("-")) return false;
        switch (tagName) {
          case "annotation-xml":
          case "color-profile":
          case "font-face":
          case "font-face-src":
          case "font-face-uri":
          case "font-face-format":
          case "font-face-name":
          case "missing-glyph":
            return false;
          default:
            return true;
        }
      }
      var aliases = /* @__PURE__ */ new Map([
        ["acceptCharset", "accept-charset"],
        ["htmlFor", "for"],
        ["httpEquiv", "http-equiv"],
        ["crossOrigin", "crossorigin"],
        ["accentHeight", "accent-height"],
        ["alignmentBaseline", "alignment-baseline"],
        ["arabicForm", "arabic-form"],
        ["baselineShift", "baseline-shift"],
        ["capHeight", "cap-height"],
        ["clipPath", "clip-path"],
        ["clipRule", "clip-rule"],
        ["colorInterpolation", "color-interpolation"],
        ["colorInterpolationFilters", "color-interpolation-filters"],
        ["colorProfile", "color-profile"],
        ["colorRendering", "color-rendering"],
        ["dominantBaseline", "dominant-baseline"],
        ["enableBackground", "enable-background"],
        ["fillOpacity", "fill-opacity"],
        ["fillRule", "fill-rule"],
        ["floodColor", "flood-color"],
        ["floodOpacity", "flood-opacity"],
        ["fontFamily", "font-family"],
        ["fontSize", "font-size"],
        ["fontSizeAdjust", "font-size-adjust"],
        ["fontStretch", "font-stretch"],
        ["fontStyle", "font-style"],
        ["fontVariant", "font-variant"],
        ["fontWeight", "font-weight"],
        ["glyphName", "glyph-name"],
        ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
        ["glyphOrientationVertical", "glyph-orientation-vertical"],
        ["horizAdvX", "horiz-adv-x"],
        ["horizOriginX", "horiz-origin-x"],
        ["imageRendering", "image-rendering"],
        ["letterSpacing", "letter-spacing"],
        ["lightingColor", "lighting-color"],
        ["markerEnd", "marker-end"],
        ["markerMid", "marker-mid"],
        ["markerStart", "marker-start"],
        ["overlinePosition", "overline-position"],
        ["overlineThickness", "overline-thickness"],
        ["paintOrder", "paint-order"],
        ["panose-1", "panose-1"],
        ["pointerEvents", "pointer-events"],
        ["renderingIntent", "rendering-intent"],
        ["shapeRendering", "shape-rendering"],
        ["stopColor", "stop-color"],
        ["stopOpacity", "stop-opacity"],
        ["strikethroughPosition", "strikethrough-position"],
        ["strikethroughThickness", "strikethrough-thickness"],
        ["strokeDasharray", "stroke-dasharray"],
        ["strokeDashoffset", "stroke-dashoffset"],
        ["strokeLinecap", "stroke-linecap"],
        ["strokeLinejoin", "stroke-linejoin"],
        ["strokeMiterlimit", "stroke-miterlimit"],
        ["strokeOpacity", "stroke-opacity"],
        ["strokeWidth", "stroke-width"],
        ["textAnchor", "text-anchor"],
        ["textDecoration", "text-decoration"],
        ["textRendering", "text-rendering"],
        ["transformOrigin", "transform-origin"],
        ["underlinePosition", "underline-position"],
        ["underlineThickness", "underline-thickness"],
        ["unicodeBidi", "unicode-bidi"],
        ["unicodeRange", "unicode-range"],
        ["unitsPerEm", "units-per-em"],
        ["vAlphabetic", "v-alphabetic"],
        ["vHanging", "v-hanging"],
        ["vIdeographic", "v-ideographic"],
        ["vMathematical", "v-mathematical"],
        ["vectorEffect", "vector-effect"],
        ["vertAdvY", "vert-adv-y"],
        ["vertOriginX", "vert-origin-x"],
        ["vertOriginY", "vert-origin-y"],
        ["wordSpacing", "word-spacing"],
        ["writingMode", "writing-mode"],
        ["xmlnsXlink", "xmlns:xlink"],
        ["xHeight", "x-height"]
      ]);
      var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
      function sanitizeURL(url) {
        return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
      }
      var currentReplayingEvent = null;
      function getEventTarget(nativeEvent) {
        nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
        nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
        return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
      }
      var restoreTarget = null;
      var restoreQueue = null;
      function restoreStateOfTarget(target) {
        var internalInstance = getInstanceFromNode(target);
        if (internalInstance && (target = internalInstance.stateNode)) {
          var props = target[internalPropsKey] || null;
          a: switch (target = internalInstance.stateNode, internalInstance.type) {
            case "input":
              updateInput(
                target,
                props.value,
                props.defaultValue,
                props.defaultValue,
                props.checked,
                props.defaultChecked,
                props.type,
                props.name
              );
              internalInstance = props.name;
              if ("radio" === props.type && null != internalInstance) {
                for (props = target; props.parentNode; ) props = props.parentNode;
                props = props.querySelectorAll(
                  'input[name="' + escapeSelectorAttributeValueInsideDoubleQuotes(
                    "" + internalInstance
                  ) + '"][type="radio"]'
                );
                for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
                  var otherNode = props[internalInstance];
                  if (otherNode !== target && otherNode.form === target.form) {
                    var otherProps = otherNode[internalPropsKey] || null;
                    if (!otherProps) throw Error(formatProdErrorMessage(90));
                    updateInput(
                      otherNode,
                      otherProps.value,
                      otherProps.defaultValue,
                      otherProps.defaultValue,
                      otherProps.checked,
                      otherProps.defaultChecked,
                      otherProps.type,
                      otherProps.name
                    );
                  }
                }
                for (internalInstance = 0; internalInstance < props.length; internalInstance++)
                  otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
              }
              break a;
            case "textarea":
              updateTextarea(target, props.value, props.defaultValue);
              break a;
            case "select":
              internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, false);
          }
        }
      }
      var isInsideEventHandler = false;
      function batchedUpdates$1(fn, a4, b) {
        if (isInsideEventHandler) return fn(a4, b);
        isInsideEventHandler = true;
        try {
          var JSCompiler_inline_result = fn(a4);
          return JSCompiler_inline_result;
        } finally {
          if (isInsideEventHandler = false, null !== restoreTarget || null !== restoreQueue) {
            if (flushSyncWork$1(), restoreTarget && (a4 = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a4), fn))
              for (a4 = 0; a4 < fn.length; a4++) restoreStateOfTarget(fn[a4]);
          }
        }
      }
      function getListener(inst, registrationName) {
        var stateNode = inst.stateNode;
        if (null === stateNode) return null;
        var props = stateNode[internalPropsKey] || null;
        if (null === props) return null;
        stateNode = props[registrationName];
        a: switch (registrationName) {
          case "onClick":
          case "onClickCapture":
          case "onDoubleClick":
          case "onDoubleClickCapture":
          case "onMouseDown":
          case "onMouseDownCapture":
          case "onMouseMove":
          case "onMouseMoveCapture":
          case "onMouseUp":
          case "onMouseUpCapture":
          case "onMouseEnter":
            (props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
            inst = !props;
            break a;
          default:
            inst = false;
        }
        if (inst) return null;
        if (stateNode && "function" !== typeof stateNode)
          throw Error(
            formatProdErrorMessage(231, registrationName, typeof stateNode)
          );
        return stateNode;
      }
      var passiveBrowserEventsSupported = false;
      if (canUseDOM)
        try {
          options = {};
          Object.defineProperty(options, "passive", {
            get: function() {
              passiveBrowserEventsSupported = true;
            }
          });
          window.addEventListener("test", options, options);
          window.removeEventListener("test", options, options);
        } catch (e8) {
          passiveBrowserEventsSupported = false;
        }
      var options;
      var root2 = null;
      var startText = null;
      var fallbackText = null;
      function getData() {
        if (fallbackText) return fallbackText;
        var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root2 ? root2.value : root2.textContent, endLength = endValue.length;
        for (start = 0; start < startLength && startValue[start] === endValue[start]; start++) ;
        var minEnd = startLength - start;
        for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++) ;
        return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
      }
      function getEventCharCode(nativeEvent) {
        var keyCode = nativeEvent.keyCode;
        "charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
        10 === nativeEvent && (nativeEvent = 13);
        return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
      }
      function functionThatReturnsTrue() {
        return true;
      }
      function functionThatReturnsFalse() {
        return false;
      }
      function createSyntheticEvent(Interface) {
        function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
          this._reactName = reactName;
          this._targetInst = targetInst;
          this.type = reactEventType;
          this.nativeEvent = nativeEvent;
          this.target = nativeEventTarget;
          this.currentTarget = null;
          for (var propName in Interface)
            Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
          this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : false === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
          this.isPropagationStopped = functionThatReturnsFalse;
          return this;
        }
        assign(SyntheticBaseEvent.prototype, {
          preventDefault: function() {
            this.defaultPrevented = true;
            var event = this.nativeEvent;
            event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = false), this.isDefaultPrevented = functionThatReturnsTrue);
          },
          stopPropagation: function() {
            var event = this.nativeEvent;
            event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = true), this.isPropagationStopped = functionThatReturnsTrue);
          },
          persist: function() {
          },
          isPersistent: functionThatReturnsTrue
        });
        return SyntheticBaseEvent;
      }
      var EventInterface = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function(event) {
          return event.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0
      };
      var SyntheticEvent = createSyntheticEvent(EventInterface);
      var UIEventInterface = assign({}, EventInterface, { view: 0, detail: 0 });
      var SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
      var lastMovementX;
      var lastMovementY;
      var lastMouseEvent;
      var MouseEventInterface = assign({}, UIEventInterface, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: getEventModifierState,
        button: 0,
        buttons: 0,
        relatedTarget: function(event) {
          return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
        },
        movementX: function(event) {
          if ("movementX" in event) return event.movementX;
          event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
          return lastMovementX;
        },
        movementY: function(event) {
          return "movementY" in event ? event.movementY : lastMovementY;
        }
      });
      var SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
      var DragEventInterface = assign({}, MouseEventInterface, { dataTransfer: 0 });
      var SyntheticDragEvent = createSyntheticEvent(DragEventInterface);
      var FocusEventInterface = assign({}, UIEventInterface, { relatedTarget: 0 });
      var SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface);
      var AnimationEventInterface = assign({}, EventInterface, {
        animationName: 0,
        elapsedTime: 0,
        pseudoElement: 0
      });
      var SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface);
      var ClipboardEventInterface = assign({}, EventInterface, {
        clipboardData: function(event) {
          return "clipboardData" in event ? event.clipboardData : window.clipboardData;
        }
      });
      var SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface);
      var CompositionEventInterface = assign({}, EventInterface, { data: 0 });
      var SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface);
      var normalizeKey = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified"
      };
      var translateToKey = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta"
      };
      var modifierKeyToProp = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey"
      };
      function modifierStateGetter(keyArg) {
        var nativeEvent = this.nativeEvent;
        return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : false;
      }
      function getEventModifierState() {
        return modifierStateGetter;
      }
      var KeyboardEventInterface = assign({}, UIEventInterface, {
        key: function(nativeEvent) {
          if (nativeEvent.key) {
            var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
            if ("Unidentified" !== key) return key;
          }
          return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
        },
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: getEventModifierState,
        charCode: function(event) {
          return "keypress" === event.type ? getEventCharCode(event) : 0;
        },
        keyCode: function(event) {
          return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
        },
        which: function(event) {
          return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
        }
      });
      var SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface);
      var PointerEventInterface = assign({}, MouseEventInterface, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0
      });
      var SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface);
      var TouchEventInterface = assign({}, UIEventInterface, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: getEventModifierState
      });
      var SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface);
      var TransitionEventInterface = assign({}, EventInterface, {
        propertyName: 0,
        elapsedTime: 0,
        pseudoElement: 0
      });
      var SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface);
      var WheelEventInterface = assign({}, MouseEventInterface, {
        deltaX: function(event) {
          return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
        },
        deltaY: function(event) {
          return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
        },
        deltaZ: 0,
        deltaMode: 0
      });
      var SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface);
      var ToggleEventInterface = assign({}, EventInterface, {
        newState: 0,
        oldState: 0
      });
      var SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface);
      var END_KEYCODES = [9, 13, 27, 32];
      var canUseCompositionEvent = canUseDOM && "CompositionEvent" in window;
      var documentMode = null;
      canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
      var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode;
      var useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode);
      var SPACEBAR_CHAR = String.fromCharCode(32);
      var hasSpaceKeypress = false;
      function isFallbackCompositionEnd(domEventName, nativeEvent) {
        switch (domEventName) {
          case "keyup":
            return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
          case "keydown":
            return 229 !== nativeEvent.keyCode;
          case "keypress":
          case "mousedown":
          case "focusout":
            return true;
          default:
            return false;
        }
      }
      function getDataFromCustomEvent(nativeEvent) {
        nativeEvent = nativeEvent.detail;
        return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
      }
      var isComposing = false;
      function getNativeBeforeInputChars(domEventName, nativeEvent) {
        switch (domEventName) {
          case "compositionend":
            return getDataFromCustomEvent(nativeEvent);
          case "keypress":
            if (32 !== nativeEvent.which) return null;
            hasSpaceKeypress = true;
            return SPACEBAR_CHAR;
          case "textInput":
            return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
          default:
            return null;
        }
      }
      function getFallbackBeforeInputChars(domEventName, nativeEvent) {
        if (isComposing)
          return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root2 = null, isComposing = false, domEventName) : null;
        switch (domEventName) {
          case "paste":
            return null;
          case "keypress":
            if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
              if (nativeEvent.char && 1 < nativeEvent.char.length)
                return nativeEvent.char;
              if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
            }
            return null;
          case "compositionend":
            return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
          default:
            return null;
        }
      }
      var supportedInputTypes = {
        color: true,
        date: true,
        datetime: true,
        "datetime-local": true,
        email: true,
        month: true,
        number: true,
        password: true,
        range: true,
        search: true,
        tel: true,
        text: true,
        time: true,
        url: true,
        week: true
      };
      function isTextInputElement(elem) {
        var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
        return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? true : false;
      }
      function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
        restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
        inst = accumulateTwoPhaseListeners(inst, "onChange");
        0 < inst.length && (nativeEvent = new SyntheticEvent(
          "onChange",
          "change",
          null,
          nativeEvent,
          target
        ), dispatchQueue.push({ event: nativeEvent, listeners: inst }));
      }
      var activeElement$1 = null;
      var activeElementInst$1 = null;
      function runEventInBatch(dispatchQueue) {
        processDispatchQueue(dispatchQueue, 0);
      }
      function getInstIfValueChanged(targetInst) {
        var targetNode = getNodeFromInstance(targetInst);
        if (updateValueIfChanged(targetNode)) return targetInst;
      }
      function getTargetInstForChangeEvent(domEventName, targetInst) {
        if ("change" === domEventName) return targetInst;
      }
      var isInputEventSupported = false;
      if (canUseDOM) {
        if (canUseDOM) {
          isSupported$jscomp$inline_418 = "oninput" in document;
          if (!isSupported$jscomp$inline_418) {
            element$jscomp$inline_419 = document.createElement("div");
            element$jscomp$inline_419.setAttribute("oninput", "return;");
            isSupported$jscomp$inline_418 = "function" === typeof element$jscomp$inline_419.oninput;
          }
          JSCompiler_inline_result$jscomp$283 = isSupported$jscomp$inline_418;
        } else JSCompiler_inline_result$jscomp$283 = false;
        isInputEventSupported = JSCompiler_inline_result$jscomp$283 && (!document.documentMode || 9 < document.documentMode);
      }
      var JSCompiler_inline_result$jscomp$283;
      var isSupported$jscomp$inline_418;
      var element$jscomp$inline_419;
      function stopWatchingForValueChange() {
        activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
      }
      function handlePropertyChange(nativeEvent) {
        if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
          var dispatchQueue = [];
          createAndAccumulateChangeEvent(
            dispatchQueue,
            activeElementInst$1,
            nativeEvent,
            getEventTarget(nativeEvent)
          );
          batchedUpdates$1(runEventInBatch, dispatchQueue);
        }
      }
      function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
        "focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
      }
      function getTargetInstForInputEventPolyfill(domEventName) {
        if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName)
          return getInstIfValueChanged(activeElementInst$1);
      }
      function getTargetInstForClickEvent(domEventName, targetInst) {
        if ("click" === domEventName) return getInstIfValueChanged(targetInst);
      }
      function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
        if ("input" === domEventName || "change" === domEventName)
          return getInstIfValueChanged(targetInst);
      }
      function is(x3, y3) {
        return x3 === y3 && (0 !== x3 || 1 / x3 === 1 / y3) || x3 !== x3 && y3 !== y3;
      }
      var objectIs = "function" === typeof Object.is ? Object.is : is;
      function shallowEqual(objA, objB) {
        if (objectIs(objA, objB)) return true;
        if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB)
          return false;
        var keysA = Object.keys(objA), keysB = Object.keys(objB);
        if (keysA.length !== keysB.length) return false;
        for (keysB = 0; keysB < keysA.length; keysB++) {
          var currentKey = keysA[keysB];
          if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
            return false;
        }
        return true;
      }
      function getLeafNode(node) {
        for (; node && node.firstChild; ) node = node.firstChild;
        return node;
      }
      function getNodeForCharacterOffset(root3, offset) {
        var node = getLeafNode(root3);
        root3 = 0;
        for (var nodeEnd; node; ) {
          if (3 === node.nodeType) {
            nodeEnd = root3 + node.textContent.length;
            if (root3 <= offset && nodeEnd >= offset)
              return { node, offset: offset - root3 };
            root3 = nodeEnd;
          }
          a: {
            for (; node; ) {
              if (node.nextSibling) {
                node = node.nextSibling;
                break a;
              }
              node = node.parentNode;
            }
            node = void 0;
          }
          node = getLeafNode(node);
        }
      }
      function containsNode(outerNode, innerNode) {
        return outerNode && innerNode ? outerNode === innerNode ? true : outerNode && 3 === outerNode.nodeType ? false : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : false : false;
      }
      function getActiveElementDeep(containerInfo) {
        containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
        for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement; ) {
          try {
            var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
          } catch (err) {
            JSCompiler_inline_result = false;
          }
          if (JSCompiler_inline_result) containerInfo = element.contentWindow;
          else break;
          element = getActiveElement(containerInfo.document);
        }
        return element;
      }
      function hasSelectionCapabilities(elem) {
        var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
        return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
      }
      function restoreSelection(priorSelectionInformation, containerInfo) {
        var curFocusedElem = getActiveElementDeep(containerInfo);
        containerInfo = priorSelectionInformation.focusedElem;
        var priorSelectionRange = priorSelectionInformation.selectionRange;
        if (curFocusedElem !== containerInfo && containerInfo && containerInfo.ownerDocument && containsNode(containerInfo.ownerDocument.documentElement, containerInfo)) {
          if (null !== priorSelectionRange && hasSelectionCapabilities(containerInfo)) {
            if (priorSelectionInformation = priorSelectionRange.start, curFocusedElem = priorSelectionRange.end, void 0 === curFocusedElem && (curFocusedElem = priorSelectionInformation), "selectionStart" in containerInfo)
              containerInfo.selectionStart = priorSelectionInformation, containerInfo.selectionEnd = Math.min(
                curFocusedElem,
                containerInfo.value.length
              );
            else if (curFocusedElem = (priorSelectionInformation = containerInfo.ownerDocument || document) && priorSelectionInformation.defaultView || window, curFocusedElem.getSelection) {
              curFocusedElem = curFocusedElem.getSelection();
              var length = containerInfo.textContent.length, start = Math.min(priorSelectionRange.start, length);
              priorSelectionRange = void 0 === priorSelectionRange.end ? start : Math.min(priorSelectionRange.end, length);
              !curFocusedElem.extend && start > priorSelectionRange && (length = priorSelectionRange, priorSelectionRange = start, start = length);
              length = getNodeForCharacterOffset(containerInfo, start);
              var endMarker = getNodeForCharacterOffset(
                containerInfo,
                priorSelectionRange
              );
              length && endMarker && (1 !== curFocusedElem.rangeCount || curFocusedElem.anchorNode !== length.node || curFocusedElem.anchorOffset !== length.offset || curFocusedElem.focusNode !== endMarker.node || curFocusedElem.focusOffset !== endMarker.offset) && (priorSelectionInformation = priorSelectionInformation.createRange(), priorSelectionInformation.setStart(length.node, length.offset), curFocusedElem.removeAllRanges(), start > priorSelectionRange ? (curFocusedElem.addRange(priorSelectionInformation), curFocusedElem.extend(endMarker.node, endMarker.offset)) : (priorSelectionInformation.setEnd(
                endMarker.node,
                endMarker.offset
              ), curFocusedElem.addRange(priorSelectionInformation)));
            }
          }
          priorSelectionInformation = [];
          for (curFocusedElem = containerInfo; curFocusedElem = curFocusedElem.parentNode; )
            1 === curFocusedElem.nodeType && priorSelectionInformation.push({
              element: curFocusedElem,
              left: curFocusedElem.scrollLeft,
              top: curFocusedElem.scrollTop
            });
          "function" === typeof containerInfo.focus && containerInfo.focus();
          for (containerInfo = 0; containerInfo < priorSelectionInformation.length; containerInfo++)
            curFocusedElem = priorSelectionInformation[containerInfo], curFocusedElem.element.scrollLeft = curFocusedElem.left, curFocusedElem.element.scrollTop = curFocusedElem.top;
        }
      }
      var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode;
      var activeElement = null;
      var activeElementInst = null;
      var lastSelection = null;
      var mouseDown = false;
      function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
        var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
        mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = { start: doc.selectionStart, end: doc.selectionEnd } : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
          anchorNode: doc.anchorNode,
          anchorOffset: doc.anchorOffset,
          focusNode: doc.focusNode,
          focusOffset: doc.focusOffset
        }), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent(
          "onSelect",
          "select",
          null,
          nativeEvent,
          nativeEventTarget
        ), dispatchQueue.push({ event: nativeEvent, listeners: doc }), nativeEvent.target = activeElement)));
      }
      function makePrefixMap(styleProp, eventName) {
        var prefixes = {};
        prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
        prefixes["Webkit" + styleProp] = "webkit" + eventName;
        prefixes["Moz" + styleProp] = "moz" + eventName;
        return prefixes;
      }
      var vendorPrefixes = {
        animationend: makePrefixMap("Animation", "AnimationEnd"),
        animationiteration: makePrefixMap("Animation", "AnimationIteration"),
        animationstart: makePrefixMap("Animation", "AnimationStart"),
        transitionrun: makePrefixMap("Transition", "TransitionRun"),
        transitionstart: makePrefixMap("Transition", "TransitionStart"),
        transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
        transitionend: makePrefixMap("Transition", "TransitionEnd")
      };
      var prefixedEventNames = {};
      var style = {};
      canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
      function getVendorPrefixedEventName(eventName) {
        if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
        if (!vendorPrefixes[eventName]) return eventName;
        var prefixMap = vendorPrefixes[eventName], styleProp;
        for (styleProp in prefixMap)
          if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
            return prefixedEventNames[eventName] = prefixMap[styleProp];
        return eventName;
      }
      var ANIMATION_END = getVendorPrefixedEventName("animationend");
      var ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration");
      var ANIMATION_START = getVendorPrefixedEventName("animationstart");
      var TRANSITION_RUN = getVendorPrefixedEventName("transitionrun");
      var TRANSITION_START = getVendorPrefixedEventName("transitionstart");
      var TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel");
      var TRANSITION_END = getVendorPrefixedEventName("transitionend");
      var topLevelEventsToReactNames = /* @__PURE__ */ new Map();
      var simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll scrollEnd toggle touchMove waiting wheel".split(
        " "
      );
      function registerSimpleEvent(domEventName, reactName) {
        topLevelEventsToReactNames.set(domEventName, reactName);
        registerTwoPhaseEvent(reactName, [domEventName]);
      }
      var concurrentQueues = [];
      var concurrentQueuesIndex = 0;
      var concurrentlyUpdatedLanes = 0;
      function finishQueueingConcurrentUpdates() {
        for (var endIndex = concurrentQueuesIndex, i8 = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i8 < endIndex; ) {
          var fiber = concurrentQueues[i8];
          concurrentQueues[i8++] = null;
          var queue = concurrentQueues[i8];
          concurrentQueues[i8++] = null;
          var update = concurrentQueues[i8];
          concurrentQueues[i8++] = null;
          var lane = concurrentQueues[i8];
          concurrentQueues[i8++] = null;
          if (null !== queue && null !== update) {
            var pending = queue.pending;
            null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
            queue.pending = update;
          }
          0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
        }
      }
      function enqueueUpdate$1(fiber, queue, update, lane) {
        concurrentQueues[concurrentQueuesIndex++] = fiber;
        concurrentQueues[concurrentQueuesIndex++] = queue;
        concurrentQueues[concurrentQueuesIndex++] = update;
        concurrentQueues[concurrentQueuesIndex++] = lane;
        concurrentlyUpdatedLanes |= lane;
        fiber.lanes |= lane;
        fiber = fiber.alternate;
        null !== fiber && (fiber.lanes |= lane);
      }
      function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
        enqueueUpdate$1(fiber, queue, update, lane);
        return getRootForUpdatedFiber(fiber);
      }
      function enqueueConcurrentRenderForLane(fiber, lane) {
        enqueueUpdate$1(fiber, null, null, lane);
        return getRootForUpdatedFiber(fiber);
      }
      function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
        sourceFiber.lanes |= lane;
        var alternate = sourceFiber.alternate;
        null !== alternate && (alternate.lanes |= lane);
        for (var isHidden = false, parent = sourceFiber.return; null !== parent; )
          parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
        isHidden && null !== update && 3 === sourceFiber.tag && (parent = sourceFiber.stateNode, isHidden = 31 - clz32(lane), parent = parent.hiddenUpdates, sourceFiber = parent[isHidden], null === sourceFiber ? parent[isHidden] = [update] : sourceFiber.push(update), update.lane = lane | 536870912);
      }
      function getRootForUpdatedFiber(sourceFiber) {
        if (50 < nestedUpdateCount)
          throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
        for (var parent = sourceFiber.return; null !== parent; )
          sourceFiber = parent, parent = sourceFiber.return;
        return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
      }
      var emptyContextObject = {};
      var CapturedStacks = /* @__PURE__ */ new WeakMap();
      function createCapturedValueAtFiber(value, source) {
        if ("object" === typeof value && null !== value) {
          var existing = CapturedStacks.get(value);
          if (void 0 !== existing) return existing;
          source = {
            value,
            source,
            stack: getStackByFiberInDevAndProd(source)
          };
          CapturedStacks.set(value, source);
          return source;
        }
        return {
          value,
          source,
          stack: getStackByFiberInDevAndProd(source)
        };
      }
      var forkStack = [];
      var forkStackIndex = 0;
      var treeForkProvider = null;
      var treeForkCount = 0;
      var idStack = [];
      var idStackIndex = 0;
      var treeContextProvider = null;
      var treeContextId = 1;
      var treeContextOverflow = "";
      function pushTreeFork(workInProgress2, totalChildren) {
        forkStack[forkStackIndex++] = treeForkCount;
        forkStack[forkStackIndex++] = treeForkProvider;
        treeForkProvider = workInProgress2;
        treeForkCount = totalChildren;
      }
      function pushTreeId(workInProgress2, totalChildren, index2) {
        idStack[idStackIndex++] = treeContextId;
        idStack[idStackIndex++] = treeContextOverflow;
        idStack[idStackIndex++] = treeContextProvider;
        treeContextProvider = workInProgress2;
        var baseIdWithLeadingBit = treeContextId;
        workInProgress2 = treeContextOverflow;
        var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
        baseIdWithLeadingBit &= ~(1 << baseLength);
        index2 += 1;
        var length = 32 - clz32(totalChildren) + baseLength;
        if (30 < length) {
          var numberOfOverflowBits = baseLength - baseLength % 5;
          length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
          baseIdWithLeadingBit >>= numberOfOverflowBits;
          baseLength -= numberOfOverflowBits;
          treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index2 << baseLength | baseIdWithLeadingBit;
          treeContextOverflow = length + workInProgress2;
        } else
          treeContextId = 1 << length | index2 << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress2;
      }
      function pushMaterializedTreeId(workInProgress2) {
        null !== workInProgress2.return && (pushTreeFork(workInProgress2, 1), pushTreeId(workInProgress2, 1, 0));
      }
      function popTreeContext(workInProgress2) {
        for (; workInProgress2 === treeForkProvider; )
          treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
        for (; workInProgress2 === treeContextProvider; )
          treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
      }
      var hydrationParentFiber = null;
      var nextHydratableInstance = null;
      var isHydrating = false;
      var hydrationErrors = null;
      var rootOrSingletonContext = false;
      var HydrationMismatchException = Error(formatProdErrorMessage(519));
      function throwOnHydrationMismatch(fiber) {
        var error = Error(formatProdErrorMessage(418, ""));
        queueHydrationError(createCapturedValueAtFiber(error, fiber));
        throw HydrationMismatchException;
      }
      function prepareToHydrateHostInstance(fiber) {
        var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
        instance[internalInstanceKey] = fiber;
        instance[internalPropsKey] = props;
        switch (type) {
          case "dialog":
            listenToNonDelegatedEvent("cancel", instance);
            listenToNonDelegatedEvent("close", instance);
            break;
          case "iframe":
          case "object":
          case "embed":
            listenToNonDelegatedEvent("load", instance);
            break;
          case "video":
          case "audio":
            for (type = 0; type < mediaEventTypes.length; type++)
              listenToNonDelegatedEvent(mediaEventTypes[type], instance);
            break;
          case "source":
            listenToNonDelegatedEvent("error", instance);
            break;
          case "img":
          case "image":
          case "link":
            listenToNonDelegatedEvent("error", instance);
            listenToNonDelegatedEvent("load", instance);
            break;
          case "details":
            listenToNonDelegatedEvent("toggle", instance);
            break;
          case "input":
            listenToNonDelegatedEvent("invalid", instance);
            initInput(
              instance,
              props.value,
              props.defaultValue,
              props.checked,
              props.defaultChecked,
              props.type,
              props.name,
              true
            );
            track(instance);
            break;
          case "select":
            listenToNonDelegatedEvent("invalid", instance);
            break;
          case "textarea":
            listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children), track(instance);
        }
        type = props.children;
        "string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || true === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = true) : instance = false;
        instance || throwOnHydrationMismatch(fiber);
      }
      function popToNextHostParent(fiber) {
        for (hydrationParentFiber = fiber.return; hydrationParentFiber; )
          switch (hydrationParentFiber.tag) {
            case 3:
            case 27:
              rootOrSingletonContext = true;
              return;
            case 5:
            case 13:
              rootOrSingletonContext = false;
              return;
            default:
              hydrationParentFiber = hydrationParentFiber.return;
          }
      }
      function popHydrationState(fiber) {
        if (fiber !== hydrationParentFiber) return false;
        if (!isHydrating) return popToNextHostParent(fiber), isHydrating = true, false;
        var shouldClear = false, JSCompiler_temp;
        if (JSCompiler_temp = 3 !== fiber.tag && 27 !== fiber.tag) {
          if (JSCompiler_temp = 5 === fiber.tag)
            JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
          JSCompiler_temp = !JSCompiler_temp;
        }
        JSCompiler_temp && (shouldClear = true);
        shouldClear && nextHydratableInstance && throwOnHydrationMismatch(fiber);
        popToNextHostParent(fiber);
        if (13 === fiber.tag) {
          fiber = fiber.memoizedState;
          fiber = null !== fiber ? fiber.dehydrated : null;
          if (!fiber) throw Error(formatProdErrorMessage(317));
          a: {
            fiber = fiber.nextSibling;
            for (shouldClear = 0; fiber; ) {
              if (8 === fiber.nodeType)
                if (JSCompiler_temp = fiber.data, "/$" === JSCompiler_temp) {
                  if (0 === shouldClear) {
                    nextHydratableInstance = getNextHydratable(fiber.nextSibling);
                    break a;
                  }
                  shouldClear--;
                } else
                  "$" !== JSCompiler_temp && "$!" !== JSCompiler_temp && "$?" !== JSCompiler_temp || shouldClear++;
              fiber = fiber.nextSibling;
            }
            nextHydratableInstance = null;
          }
        } else
          nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
        return true;
      }
      function resetHydrationState() {
        nextHydratableInstance = hydrationParentFiber = null;
        isHydrating = false;
      }
      function queueHydrationError(error) {
        null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
      }
      var SuspenseException = Error(formatProdErrorMessage(460));
      var SuspenseyCommitException = Error(formatProdErrorMessage(474));
      var noopSuspenseyCommitThenable = { then: function() {
      } };
      function isThenableResolved(thenable) {
        thenable = thenable.status;
        return "fulfilled" === thenable || "rejected" === thenable;
      }
      function noop$3() {
      }
      function trackUsedThenable(thenableState2, thenable, index2) {
        index2 = thenableState2[index2];
        void 0 === index2 ? thenableState2.push(thenable) : index2 !== thenable && (thenable.then(noop$3, noop$3), thenable = index2);
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            thenableState2 = thenable.reason;
            if (thenableState2 === SuspenseException)
              throw Error(formatProdErrorMessage(483));
            throw thenableState2;
          default:
            if ("string" === typeof thenable.status) thenable.then(noop$3, noop$3);
            else {
              thenableState2 = workInProgressRoot;
              if (null !== thenableState2 && 100 < thenableState2.shellSuspendCounter)
                throw Error(formatProdErrorMessage(482));
              thenableState2 = thenable;
              thenableState2.status = "pending";
              thenableState2.then(
                function(fulfilledValue) {
                  if ("pending" === thenable.status) {
                    var fulfilledThenable = thenable;
                    fulfilledThenable.status = "fulfilled";
                    fulfilledThenable.value = fulfilledValue;
                  }
                },
                function(error) {
                  if ("pending" === thenable.status) {
                    var rejectedThenable = thenable;
                    rejectedThenable.status = "rejected";
                    rejectedThenable.reason = error;
                  }
                }
              );
            }
            switch (thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                thenableState2 = thenable.reason;
                if (thenableState2 === SuspenseException)
                  throw Error(formatProdErrorMessage(483));
                throw thenableState2;
            }
            suspendedThenable = thenable;
            throw SuspenseException;
        }
      }
      var suspendedThenable = null;
      function getSuspendedThenable() {
        if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
        var thenable = suspendedThenable;
        suspendedThenable = null;
        return thenable;
      }
      var thenableState$1 = null;
      var thenableIndexCounter$1 = 0;
      function unwrapThenable(thenable) {
        var index2 = thenableIndexCounter$1;
        thenableIndexCounter$1 += 1;
        null === thenableState$1 && (thenableState$1 = []);
        return trackUsedThenable(thenableState$1, thenable, index2);
      }
      function coerceRef(workInProgress2, element) {
        element = element.props.ref;
        workInProgress2.ref = void 0 !== element ? element : null;
      }
      function throwOnInvalidObjectType(returnFiber, newChild) {
        if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
          throw Error(formatProdErrorMessage(525));
        returnFiber = Object.prototype.toString.call(newChild);
        throw Error(
          formatProdErrorMessage(
            31,
            "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber
          )
        );
      }
      function resolveLazy(lazyType2) {
        var init = lazyType2._init;
        return init(lazyType2._payload);
      }
      function createChildReconciler(shouldTrackSideEffects) {
        function deleteChild(returnFiber, childToDelete) {
          if (shouldTrackSideEffects) {
            var deletions = returnFiber.deletions;
            null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
          }
        }
        function deleteRemainingChildren(returnFiber, currentFirstChild) {
          if (!shouldTrackSideEffects) return null;
          for (; null !== currentFirstChild; )
            deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
          return null;
        }
        function mapRemainingChildren(currentFirstChild) {
          for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild; )
            null !== currentFirstChild.key ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
          return existingChildren;
        }
        function useFiber(fiber, pendingProps) {
          fiber = createWorkInProgress(fiber, pendingProps);
          fiber.index = 0;
          fiber.sibling = null;
          return fiber;
        }
        function placeChild(newFiber, lastPlacedIndex, newIndex) {
          newFiber.index = newIndex;
          if (!shouldTrackSideEffects)
            return newFiber.flags |= 1048576, lastPlacedIndex;
          newIndex = newFiber.alternate;
          if (null !== newIndex)
            return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 33554434, lastPlacedIndex) : newIndex;
          newFiber.flags |= 33554434;
          return lastPlacedIndex;
        }
        function placeSingleChild(newFiber) {
          shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 33554434);
          return newFiber;
        }
        function updateTextNode(returnFiber, current, textContent, lanes) {
          if (null === current || 6 !== current.tag)
            return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
          current = useFiber(current, textContent);
          current.return = returnFiber;
          return current;
        }
        function updateElement(returnFiber, current, element, lanes) {
          var elementType = element.type;
          if (elementType === REACT_FRAGMENT_TYPE)
            return updateFragment(
              returnFiber,
              current,
              element.props.children,
              lanes,
              element.key
            );
          if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type))
            return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
          current = createFiberFromTypeAndProps(
            element.type,
            element.key,
            element.props,
            null,
            returnFiber.mode,
            lanes
          );
          coerceRef(current, element);
          current.return = returnFiber;
          return current;
        }
        function updatePortal(returnFiber, current, portal, lanes) {
          if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
            return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
          current = useFiber(current, portal.children || []);
          current.return = returnFiber;
          return current;
        }
        function updateFragment(returnFiber, current, fragment, lanes, key) {
          if (null === current || 7 !== current.tag)
            return current = createFiberFromFragment(
              fragment,
              returnFiber.mode,
              lanes,
              key
            ), current.return = returnFiber, current;
          current = useFiber(current, fragment);
          current.return = returnFiber;
          return current;
        }
        function createChild(returnFiber, newChild, lanes) {
          if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
            return newChild = createFiberFromText(
              "" + newChild,
              returnFiber.mode,
              lanes
            ), newChild.return = returnFiber, newChild;
          if ("object" === typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return lanes = createFiberFromTypeAndProps(
                  newChild.type,
                  newChild.key,
                  newChild.props,
                  null,
                  returnFiber.mode,
                  lanes
                ), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
              case REACT_PORTAL_TYPE:
                return newChild = createFiberFromPortal(
                  newChild,
                  returnFiber.mode,
                  lanes
                ), newChild.return = returnFiber, newChild;
              case REACT_LAZY_TYPE:
                var init = newChild._init;
                newChild = init(newChild._payload);
                return createChild(returnFiber, newChild, lanes);
            }
            if (isArrayImpl(newChild) || getIteratorFn(newChild))
              return newChild = createFiberFromFragment(
                newChild,
                returnFiber.mode,
                lanes,
                null
              ), newChild.return = returnFiber, newChild;
            if ("function" === typeof newChild.then)
              return createChild(returnFiber, unwrapThenable(newChild), lanes);
            if (newChild.$$typeof === REACT_CONTEXT_TYPE)
              return createChild(
                returnFiber,
                readContextDuringReconciliation(returnFiber, newChild),
                lanes
              );
            throwOnInvalidObjectType(returnFiber, newChild);
          }
          return null;
        }
        function updateSlot(returnFiber, oldFiber, newChild, lanes) {
          var key = null !== oldFiber ? oldFiber.key : null;
          if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
            return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
          if ("object" === typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
              case REACT_PORTAL_TYPE:
                return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
              case REACT_LAZY_TYPE:
                return key = newChild._init, newChild = key(newChild._payload), updateSlot(returnFiber, oldFiber, newChild, lanes);
            }
            if (isArrayImpl(newChild) || getIteratorFn(newChild))
              return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
            if ("function" === typeof newChild.then)
              return updateSlot(
                returnFiber,
                oldFiber,
                unwrapThenable(newChild),
                lanes
              );
            if (newChild.$$typeof === REACT_CONTEXT_TYPE)
              return updateSlot(
                returnFiber,
                oldFiber,
                readContextDuringReconciliation(returnFiber, newChild),
                lanes
              );
            throwOnInvalidObjectType(returnFiber, newChild);
          }
          return null;
        }
        function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
          if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
            return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
          if ("object" === typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return existingChildren = existingChildren.get(
                  null === newChild.key ? newIdx : newChild.key
                ) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
              case REACT_PORTAL_TYPE:
                return existingChildren = existingChildren.get(
                  null === newChild.key ? newIdx : newChild.key
                ) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
              case REACT_LAZY_TYPE:
                var init = newChild._init;
                newChild = init(newChild._payload);
                return updateFromMap(
                  existingChildren,
                  returnFiber,
                  newIdx,
                  newChild,
                  lanes
                );
            }
            if (isArrayImpl(newChild) || getIteratorFn(newChild))
              return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
            if ("function" === typeof newChild.then)
              return updateFromMap(
                existingChildren,
                returnFiber,
                newIdx,
                unwrapThenable(newChild),
                lanes
              );
            if (newChild.$$typeof === REACT_CONTEXT_TYPE)
              return updateFromMap(
                existingChildren,
                returnFiber,
                newIdx,
                readContextDuringReconciliation(returnFiber, newChild),
                lanes
              );
            throwOnInvalidObjectType(returnFiber, newChild);
          }
          return null;
        }
        function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
          for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
            oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
            var newFiber = updateSlot(
              returnFiber,
              oldFiber,
              newChildren[newIdx],
              lanes
            );
            if (null === newFiber) {
              null === oldFiber && (oldFiber = nextOldFiber);
              break;
            }
            shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
            currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
            null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
          }
          if (newIdx === newChildren.length)
            return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
          if (null === oldFiber) {
            for (; newIdx < newChildren.length; newIdx++)
              oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(
                oldFiber,
                currentFirstChild,
                newIdx
              ), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
            isHydrating && pushTreeFork(returnFiber, newIdx);
            return resultingFirstChild;
          }
          for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++)
            nextOldFiber = updateFromMap(
              oldFiber,
              returnFiber,
              newIdx,
              newChildren[newIdx],
              lanes
            ), null !== nextOldFiber && (shouldTrackSideEffects && null !== nextOldFiber.alternate && oldFiber.delete(
              null === nextOldFiber.key ? newIdx : nextOldFiber.key
            ), currentFirstChild = placeChild(
              nextOldFiber,
              currentFirstChild,
              newIdx
            ), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
          shouldTrackSideEffects && oldFiber.forEach(function(child) {
            return deleteChild(returnFiber, child);
          });
          isHydrating && pushTreeFork(returnFiber, newIdx);
          return resultingFirstChild;
        }
        function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
          if (null == newChildren) throw Error(formatProdErrorMessage(151));
          for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
            oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
            var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
            if (null === newFiber) {
              null === oldFiber && (oldFiber = nextOldFiber);
              break;
            }
            shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
            currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
            null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
          }
          if (step.done)
            return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
          if (null === oldFiber) {
            for (; !step.done; newIdx++, step = newChildren.next())
              step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
            isHydrating && pushTreeFork(returnFiber, newIdx);
            return resultingFirstChild;
          }
          for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next())
            step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && null !== step.alternate && oldFiber.delete(null === step.key ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
          shouldTrackSideEffects && oldFiber.forEach(function(child) {
            return deleteChild(returnFiber, child);
          });
          isHydrating && pushTreeFork(returnFiber, newIdx);
          return resultingFirstChild;
        }
        function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
          "object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && (newChild = newChild.props.children);
          if ("object" === typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                a: {
                  for (var key = newChild.key; null !== currentFirstChild; ) {
                    if (currentFirstChild.key === key) {
                      key = newChild.type;
                      if (key === REACT_FRAGMENT_TYPE) {
                        if (7 === currentFirstChild.tag) {
                          deleteRemainingChildren(
                            returnFiber,
                            currentFirstChild.sibling
                          );
                          lanes = useFiber(
                            currentFirstChild,
                            newChild.props.children
                          );
                          lanes.return = returnFiber;
                          returnFiber = lanes;
                          break a;
                        }
                      } else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
                        deleteRemainingChildren(
                          returnFiber,
                          currentFirstChild.sibling
                        );
                        lanes = useFiber(currentFirstChild, newChild.props);
                        coerceRef(lanes, newChild);
                        lanes.return = returnFiber;
                        returnFiber = lanes;
                        break a;
                      }
                      deleteRemainingChildren(returnFiber, currentFirstChild);
                      break;
                    } else deleteChild(returnFiber, currentFirstChild);
                    currentFirstChild = currentFirstChild.sibling;
                  }
                  newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(
                    newChild.props.children,
                    returnFiber.mode,
                    lanes,
                    newChild.key
                  ), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(
                    newChild.type,
                    newChild.key,
                    newChild.props,
                    null,
                    returnFiber.mode,
                    lanes
                  ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
                }
                return placeSingleChild(returnFiber);
              case REACT_PORTAL_TYPE:
                a: {
                  for (key = newChild.key; null !== currentFirstChild; ) {
                    if (currentFirstChild.key === key)
                      if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
                        deleteRemainingChildren(
                          returnFiber,
                          currentFirstChild.sibling
                        );
                        lanes = useFiber(currentFirstChild, newChild.children || []);
                        lanes.return = returnFiber;
                        returnFiber = lanes;
                        break a;
                      } else {
                        deleteRemainingChildren(returnFiber, currentFirstChild);
                        break;
                      }
                    else deleteChild(returnFiber, currentFirstChild);
                    currentFirstChild = currentFirstChild.sibling;
                  }
                  lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
                  lanes.return = returnFiber;
                  returnFiber = lanes;
                }
                return placeSingleChild(returnFiber);
              case REACT_LAZY_TYPE:
                return key = newChild._init, newChild = key(newChild._payload), reconcileChildFibersImpl(
                  returnFiber,
                  currentFirstChild,
                  newChild,
                  lanes
                );
            }
            if (isArrayImpl(newChild))
              return reconcileChildrenArray(
                returnFiber,
                currentFirstChild,
                newChild,
                lanes
              );
            if (getIteratorFn(newChild)) {
              key = getIteratorFn(newChild);
              if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
              newChild = key.call(newChild);
              return reconcileChildrenIterator(
                returnFiber,
                currentFirstChild,
                newChild,
                lanes
              );
            }
            if ("function" === typeof newChild.then)
              return reconcileChildFibersImpl(
                returnFiber,
                currentFirstChild,
                unwrapThenable(newChild),
                lanes
              );
            if (newChild.$$typeof === REACT_CONTEXT_TYPE)
              return reconcileChildFibersImpl(
                returnFiber,
                currentFirstChild,
                readContextDuringReconciliation(returnFiber, newChild),
                lanes
              );
            throwOnInvalidObjectType(returnFiber, newChild);
          }
          return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
        }
        return function(returnFiber, currentFirstChild, newChild, lanes) {
          try {
            thenableIndexCounter$1 = 0;
            var firstChildFiber = reconcileChildFibersImpl(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            );
            thenableState$1 = null;
            return firstChildFiber;
          } catch (x3) {
            if (x3 === SuspenseException) throw x3;
            var fiber = createFiberImplClass(29, x3, null, returnFiber.mode);
            fiber.lanes = lanes;
            fiber.return = returnFiber;
            return fiber;
          } finally {
          }
        };
      }
      var reconcileChildFibers = createChildReconciler(true);
      var mountChildFibers = createChildReconciler(false);
      var currentTreeHiddenStackCursor = createCursor(null);
      var prevEntangledRenderLanesCursor = createCursor(0);
      function pushHiddenContext(fiber, context) {
        fiber = entangledRenderLanes;
        push(prevEntangledRenderLanesCursor, fiber);
        push(currentTreeHiddenStackCursor, context);
        entangledRenderLanes = fiber | context.baseLanes;
      }
      function reuseHiddenContextOnStack() {
        push(prevEntangledRenderLanesCursor, entangledRenderLanes);
        push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
      }
      function popHiddenContext() {
        entangledRenderLanes = prevEntangledRenderLanesCursor.current;
        pop(currentTreeHiddenStackCursor);
        pop(prevEntangledRenderLanesCursor);
      }
      var suspenseHandlerStackCursor = createCursor(null);
      var shellBoundary = null;
      function pushPrimaryTreeSuspenseHandler(handler) {
        var current = handler.alternate;
        push(suspenseStackCursor, suspenseStackCursor.current & 1);
        push(suspenseHandlerStackCursor, handler);
        null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
      }
      function pushOffscreenSuspenseHandler(fiber) {
        if (22 === fiber.tag) {
          if (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary) {
            var current = fiber.alternate;
            null !== current && null !== current.memoizedState && (shellBoundary = fiber);
          }
        } else reuseSuspenseHandlerOnStack(fiber);
      }
      function reuseSuspenseHandlerOnStack() {
        push(suspenseStackCursor, suspenseStackCursor.current);
        push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
      }
      function popSuspenseHandler(fiber) {
        pop(suspenseHandlerStackCursor);
        shellBoundary === fiber && (shellBoundary = null);
        pop(suspenseStackCursor);
      }
      var suspenseStackCursor = createCursor(0);
      function findFirstSuspended(row) {
        for (var node = row; null !== node; ) {
          if (13 === node.tag) {
            var state = node.memoizedState;
            if (null !== state && (state = state.dehydrated, null === state || "$?" === state.data || "$!" === state.data))
              return node;
          } else if (19 === node.tag && void 0 !== node.memoizedProps.revealOrder) {
            if (0 !== (node.flags & 128)) return node;
          } else if (null !== node.child) {
            node.child.return = node;
            node = node.child;
            continue;
          }
          if (node === row) break;
          for (; null === node.sibling; ) {
            if (null === node.return || node.return === row) return null;
            node = node.return;
          }
          node.sibling.return = node.return;
          node = node.sibling;
        }
        return null;
      }
      var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
        var listeners = [], signal = this.signal = {
          aborted: false,
          addEventListener: function(type, listener) {
            listeners.push(listener);
          }
        };
        this.abort = function() {
          signal.aborted = true;
          listeners.forEach(function(listener) {
            return listener();
          });
        };
      };
      var scheduleCallback$2 = Scheduler.unstable_scheduleCallback;
      var NormalPriority = Scheduler.unstable_NormalPriority;
      var CacheContext = {
        $$typeof: REACT_CONTEXT_TYPE,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0
      };
      function createCache() {
        return {
          controller: new AbortControllerLocal(),
          data: /* @__PURE__ */ new Map(),
          refCount: 0
        };
      }
      function releaseCache(cache) {
        cache.refCount--;
        0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
          cache.controller.abort();
        });
      }
      var currentEntangledListeners = null;
      var currentEntangledPendingCount = 0;
      var currentEntangledLane = 0;
      var currentEntangledActionThenable = null;
      function entangleAsyncAction(transition, thenable) {
        if (null === currentEntangledListeners) {
          var entangledListeners = currentEntangledListeners = [];
          currentEntangledPendingCount = 0;
          currentEntangledLane = requestTransitionLane();
          currentEntangledActionThenable = {
            status: "pending",
            value: void 0,
            then: function(resolve) {
              entangledListeners.push(resolve);
            }
          };
        }
        currentEntangledPendingCount++;
        thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
        return thenable;
      }
      function pingEngtangledActionScope() {
        if (0 === --currentEntangledPendingCount && null !== currentEntangledListeners) {
          null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
          var listeners = currentEntangledListeners;
          currentEntangledListeners = null;
          currentEntangledLane = 0;
          currentEntangledActionThenable = null;
          for (var i8 = 0; i8 < listeners.length; i8++) (0, listeners[i8])();
        }
      }
      function chainThenableValue(thenable, result) {
        var listeners = [], thenableWithOverride = {
          status: "pending",
          value: null,
          reason: null,
          then: function(resolve) {
            listeners.push(resolve);
          }
        };
        thenable.then(
          function() {
            thenableWithOverride.status = "fulfilled";
            thenableWithOverride.value = result;
            for (var i8 = 0; i8 < listeners.length; i8++) (0, listeners[i8])(result);
          },
          function(error) {
            thenableWithOverride.status = "rejected";
            thenableWithOverride.reason = error;
            for (error = 0; error < listeners.length; error++)
              (0, listeners[error])(void 0);
          }
        );
        return thenableWithOverride;
      }
      var prevOnStartTransitionFinish = ReactSharedInternals.S;
      ReactSharedInternals.S = function(transition, returnValue) {
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
        null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
      };
      var resumedCache = createCursor(null);
      function peekCacheFromPool() {
        var cacheResumedFromPreviousRender = resumedCache.current;
        return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
      }
      function pushTransition(offscreenWorkInProgress, prevCachePool) {
        null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
      }
      function getSuspendedCache() {
        var cacheFromPool = peekCacheFromPool();
        return null === cacheFromPool ? null : { parent: CacheContext._currentValue, pool: cacheFromPool };
      }
      var renderLanes = 0;
      var currentlyRenderingFiber$1 = null;
      var currentHook = null;
      var workInProgressHook = null;
      var didScheduleRenderPhaseUpdate = false;
      var didScheduleRenderPhaseUpdateDuringThisPass = false;
      var shouldDoubleInvokeUserFnsInHooksDEV = false;
      var localIdCounter = 0;
      var thenableIndexCounter = 0;
      var thenableState = null;
      var globalClientIdCounter = 0;
      function throwInvalidHookError() {
        throw Error(formatProdErrorMessage(321));
      }
      function areHookInputsEqual(nextDeps, prevDeps) {
        if (null === prevDeps) return false;
        for (var i8 = 0; i8 < prevDeps.length && i8 < nextDeps.length; i8++)
          if (!objectIs(nextDeps[i8], prevDeps[i8])) return false;
        return true;
      }
      function renderWithHooks(current, workInProgress2, Component, props, secondArg, nextRenderLanes) {
        renderLanes = nextRenderLanes;
        currentlyRenderingFiber$1 = workInProgress2;
        workInProgress2.memoizedState = null;
        workInProgress2.updateQueue = null;
        workInProgress2.lanes = 0;
        ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
        shouldDoubleInvokeUserFnsInHooksDEV = false;
        nextRenderLanes = Component(props, secondArg);
        shouldDoubleInvokeUserFnsInHooksDEV = false;
        didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(
          workInProgress2,
          Component,
          props,
          secondArg
        ));
        finishRenderingHooks(current);
        return nextRenderLanes;
      }
      function finishRenderingHooks(current) {
        ReactSharedInternals.H = ContextOnlyDispatcher;
        var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
        renderLanes = 0;
        workInProgressHook = currentHook = currentlyRenderingFiber$1 = null;
        didScheduleRenderPhaseUpdate = false;
        thenableIndexCounter = 0;
        thenableState = null;
        if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
        null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = true));
      }
      function renderWithHooksAgain(workInProgress2, Component, props, secondArg) {
        currentlyRenderingFiber$1 = workInProgress2;
        var numberOfReRenders = 0;
        do {
          didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
          thenableIndexCounter = 0;
          didScheduleRenderPhaseUpdateDuringThisPass = false;
          if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
          numberOfReRenders += 1;
          workInProgressHook = currentHook = null;
          if (null != workInProgress2.updateQueue) {
            var children = workInProgress2.updateQueue;
            children.lastEffect = null;
            children.events = null;
            children.stores = null;
            null != children.memoCache && (children.memoCache.index = 0);
          }
          ReactSharedInternals.H = HooksDispatcherOnRerender;
          children = Component(props, secondArg);
        } while (didScheduleRenderPhaseUpdateDuringThisPass);
        return children;
      }
      function TransitionAwareHostComponent() {
        var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
        maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
        dispatcher = dispatcher.useState()[0];
        (null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber$1.flags |= 1024);
        return maybeThenable;
      }
      function checkDidRenderIdHook() {
        var didRenderIdHook = 0 !== localIdCounter;
        localIdCounter = 0;
        return didRenderIdHook;
      }
      function bailoutHooks(current, workInProgress2, lanes) {
        workInProgress2.updateQueue = current.updateQueue;
        workInProgress2.flags &= -2053;
        current.lanes &= ~lanes;
      }
      function resetHooksOnUnwind(workInProgress2) {
        if (didScheduleRenderPhaseUpdate) {
          for (workInProgress2 = workInProgress2.memoizedState; null !== workInProgress2; ) {
            var queue = workInProgress2.queue;
            null !== queue && (queue.pending = null);
            workInProgress2 = workInProgress2.next;
          }
          didScheduleRenderPhaseUpdate = false;
        }
        renderLanes = 0;
        workInProgressHook = currentHook = currentlyRenderingFiber$1 = null;
        didScheduleRenderPhaseUpdateDuringThisPass = false;
        thenableIndexCounter = localIdCounter = 0;
        thenableState = null;
      }
      function mountWorkInProgressHook() {
        var hook = {
          memoizedState: null,
          baseState: null,
          baseQueue: null,
          queue: null,
          next: null
        };
        null === workInProgressHook ? currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
        return workInProgressHook;
      }
      function updateWorkInProgressHook() {
        if (null === currentHook) {
          var nextCurrentHook = currentlyRenderingFiber$1.alternate;
          nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
        } else nextCurrentHook = currentHook.next;
        var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber$1.memoizedState : workInProgressHook.next;
        if (null !== nextWorkInProgressHook)
          workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
        else {
          if (null === nextCurrentHook) {
            if (null === currentlyRenderingFiber$1.alternate)
              throw Error(formatProdErrorMessage(467));
            throw Error(formatProdErrorMessage(310));
          }
          currentHook = nextCurrentHook;
          nextCurrentHook = {
            memoizedState: currentHook.memoizedState,
            baseState: currentHook.baseState,
            baseQueue: currentHook.baseQueue,
            queue: currentHook.queue,
            next: null
          };
          null === workInProgressHook ? currentlyRenderingFiber$1.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
        }
        return workInProgressHook;
      }
      var createFunctionComponentUpdateQueue;
      createFunctionComponentUpdateQueue = function() {
        return { lastEffect: null, events: null, stores: null, memoCache: null };
      };
      function useThenable(thenable) {
        var index2 = thenableIndexCounter;
        thenableIndexCounter += 1;
        null === thenableState && (thenableState = []);
        thenable = trackUsedThenable(thenableState, thenable, index2);
        index2 = currentlyRenderingFiber$1;
        null === (null === workInProgressHook ? index2.memoizedState : workInProgressHook.next) && (index2 = index2.alternate, ReactSharedInternals.H = null === index2 || null === index2.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
        return thenable;
      }
      function use(usable) {
        if (null !== usable && "object" === typeof usable) {
          if ("function" === typeof usable.then) return useThenable(usable);
          if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
        }
        throw Error(formatProdErrorMessage(438, String(usable)));
      }
      function useMemoCache(size) {
        var memoCache = null, updateQueue = currentlyRenderingFiber$1.updateQueue;
        null !== updateQueue && (memoCache = updateQueue.memoCache);
        if (null == memoCache) {
          var current = currentlyRenderingFiber$1.alternate;
          null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
            data: current.data.map(function(array) {
              return array.slice();
            }),
            index: 0
          })));
        }
        null == memoCache && (memoCache = { data: [], index: 0 });
        null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber$1.updateQueue = updateQueue);
        updateQueue.memoCache = memoCache;
        updateQueue = memoCache.data[memoCache.index];
        if (void 0 === updateQueue)
          for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++)
            updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
        memoCache.index++;
        return updateQueue;
      }
      function basicStateReducer(state, action) {
        return "function" === typeof action ? action(state) : action;
      }
      function updateReducer(reducer) {
        var hook = updateWorkInProgressHook();
        return updateReducerImpl(hook, currentHook, reducer);
      }
      function updateReducerImpl(hook, current, reducer) {
        var queue = hook.queue;
        if (null === queue) throw Error(formatProdErrorMessage(311));
        queue.lastRenderedReducer = reducer;
        var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
        if (null !== pendingQueue) {
          if (null !== baseQueue) {
            var baseFirst = baseQueue.next;
            baseQueue.next = pendingQueue.next;
            pendingQueue.next = baseFirst;
          }
          current.baseQueue = baseQueue = pendingQueue;
          queue.pending = null;
        }
        pendingQueue = hook.baseState;
        if (null === baseQueue) hook.memoizedState = pendingQueue;
        else {
          current = baseQueue.next;
          var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$54 = false;
          do {
            var updateLane = update.lane & -536870913;
            if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
              var revertLane = update.revertLane;
              if (0 === revertLane)
                null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
                  lane: 0,
                  revertLane: 0,
                  action: update.action,
                  hasEagerState: update.hasEagerState,
                  eagerState: update.eagerState,
                  next: null
                }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$54 = true);
              else if ((renderLanes & revertLane) === revertLane) {
                update = update.next;
                revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$54 = true);
                continue;
              } else
                updateLane = {
                  lane: 0,
                  revertLane: update.revertLane,
                  action: update.action,
                  hasEagerState: update.hasEagerState,
                  eagerState: update.eagerState,
                  next: null
                }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber$1.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
              updateLane = update.action;
              shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
              pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
            } else
              revertLane = {
                lane: updateLane,
                revertLane: update.revertLane,
                action: update.action,
                hasEagerState: update.hasEagerState,
                eagerState: update.eagerState,
                next: null
              }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber$1.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
            update = update.next;
          } while (null !== update && update !== current);
          null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
          if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$54 && (reducer = currentEntangledActionThenable, null !== reducer)))
            throw reducer;
          hook.memoizedState = pendingQueue;
          hook.baseState = baseFirst;
          hook.baseQueue = newBaseQueueLast;
          queue.lastRenderedState = pendingQueue;
        }
        null === baseQueue && (queue.lanes = 0);
        return [hook.memoizedState, queue.dispatch];
      }
      function rerenderReducer(reducer) {
        var hook = updateWorkInProgressHook(), queue = hook.queue;
        if (null === queue) throw Error(formatProdErrorMessage(311));
        queue.lastRenderedReducer = reducer;
        var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
        if (null !== lastRenderPhaseUpdate) {
          queue.pending = null;
          var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
          do
            newState = reducer(newState, update.action), update = update.next;
          while (update !== lastRenderPhaseUpdate);
          objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
          hook.memoizedState = newState;
          null === hook.baseQueue && (hook.baseState = newState);
          queue.lastRenderedState = newState;
        }
        return [newState, dispatch];
      }
      function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
        var fiber = currentlyRenderingFiber$1, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
        if (isHydrating$jscomp$0) {
          if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
          getServerSnapshot = getServerSnapshot();
        } else getServerSnapshot = getSnapshot();
        var snapshotChanged = !objectIs(
          (currentHook || hook).memoizedState,
          getServerSnapshot
        );
        snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
        hook = hook.queue;
        updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [
          subscribe
        ]);
        if (hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && workInProgressHook.memoizedState.tag & 1) {
          fiber.flags |= 2048;
          pushEffect(
            9,
            updateStoreInstance.bind(
              null,
              fiber,
              hook,
              getServerSnapshot,
              getSnapshot
            ),
            { destroy: void 0 },
            null
          );
          if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
          isHydrating$jscomp$0 || 0 !== (renderLanes & 60) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
        }
        return getServerSnapshot;
      }
      function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
        fiber.flags |= 16384;
        fiber = { getSnapshot, value: renderedSnapshot };
        getSnapshot = currentlyRenderingFiber$1.updateQueue;
        null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber$1.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
      }
      function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
        inst.value = nextSnapshot;
        inst.getSnapshot = getSnapshot;
        checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
      }
      function subscribeToStore(fiber, inst, subscribe) {
        return subscribe(function() {
          checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
        });
      }
      function checkIfSnapshotChanged(inst) {
        var latestGetSnapshot = inst.getSnapshot;
        inst = inst.value;
        try {
          var nextValue = latestGetSnapshot();
          return !objectIs(inst, nextValue);
        } catch (error) {
          return true;
        }
      }
      function forceStoreRerender(fiber) {
        var root3 = enqueueConcurrentRenderForLane(fiber, 2);
        null !== root3 && scheduleUpdateOnFiber(root3, fiber, 2);
      }
      function mountStateImpl(initialState) {
        var hook = mountWorkInProgressHook();
        if ("function" === typeof initialState) {
          var initialStateInitializer = initialState;
          initialState = initialStateInitializer();
          if (shouldDoubleInvokeUserFnsInHooksDEV) {
            setIsStrictModeForDevtools(true);
            try {
              initialStateInitializer();
            } finally {
              setIsStrictModeForDevtools(false);
            }
          }
        }
        hook.memoizedState = hook.baseState = initialState;
        hook.queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: basicStateReducer,
          lastRenderedState: initialState
        };
        return hook;
      }
      function updateOptimisticImpl(hook, current, passthrough, reducer) {
        hook.baseState = passthrough;
        return updateReducerImpl(
          hook,
          currentHook,
          "function" === typeof reducer ? reducer : basicStateReducer
        );
      }
      function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
        if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
        fiber = actionQueue.action;
        if (null !== fiber) {
          var actionNode = {
            payload,
            action: fiber,
            next: null,
            isTransition: true,
            status: "pending",
            value: null,
            reason: null,
            listeners: [],
            then: function(listener) {
              actionNode.listeners.push(listener);
            }
          };
          null !== ReactSharedInternals.T ? setPendingState(true) : actionNode.isTransition = false;
          setState(actionNode);
          setPendingState = actionQueue.pending;
          null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
        }
      }
      function runActionStateAction(actionQueue, node) {
        var action = node.action, payload = node.payload, prevState = actionQueue.state;
        if (node.isTransition) {
          var prevTransition = ReactSharedInternals.T, currentTransition = {};
          ReactSharedInternals.T = currentTransition;
          try {
            var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
            null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
            handleActionReturnValue(actionQueue, node, returnValue);
          } catch (error) {
            onActionError(actionQueue, node, error);
          } finally {
            ReactSharedInternals.T = prevTransition;
          }
        } else
          try {
            prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
          } catch (error$60) {
            onActionError(actionQueue, node, error$60);
          }
      }
      function handleActionReturnValue(actionQueue, node, returnValue) {
        null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(
          function(nextState) {
            onActionSuccess(actionQueue, node, nextState);
          },
          function(error) {
            return onActionError(actionQueue, node, error);
          }
        ) : onActionSuccess(actionQueue, node, returnValue);
      }
      function onActionSuccess(actionQueue, actionNode, nextState) {
        actionNode.status = "fulfilled";
        actionNode.value = nextState;
        notifyActionListeners(actionNode);
        actionQueue.state = nextState;
        actionNode = actionQueue.pending;
        null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
      }
      function onActionError(actionQueue, actionNode, error) {
        var last = actionQueue.pending;
        actionQueue.pending = null;
        if (null !== last) {
          last = last.next;
          do
            actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
          while (actionNode !== last);
        }
        actionQueue.action = null;
      }
      function notifyActionListeners(actionNode) {
        actionNode = actionNode.listeners;
        for (var i8 = 0; i8 < actionNode.length; i8++) (0, actionNode[i8])();
      }
      function actionStateReducer(oldState, newState) {
        return newState;
      }
      function mountActionState(action, initialStateProp) {
        if (isHydrating) {
          var ssrFormState = workInProgressRoot.formState;
          if (null !== ssrFormState) {
            a: {
              var JSCompiler_inline_result = currentlyRenderingFiber$1;
              if (isHydrating) {
                if (nextHydratableInstance) {
                  b: {
                    var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
                    for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType; ) {
                      if (!inRootOrSingleton) {
                        JSCompiler_inline_result$jscomp$0 = null;
                        break b;
                      }
                      JSCompiler_inline_result$jscomp$0 = getNextHydratable(
                        JSCompiler_inline_result$jscomp$0.nextSibling
                      );
                      if (null === JSCompiler_inline_result$jscomp$0) {
                        JSCompiler_inline_result$jscomp$0 = null;
                        break b;
                      }
                    }
                    inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
                    JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
                  }
                  if (JSCompiler_inline_result$jscomp$0) {
                    nextHydratableInstance = getNextHydratable(
                      JSCompiler_inline_result$jscomp$0.nextSibling
                    );
                    JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
                    break a;
                  }
                }
                throwOnHydrationMismatch(JSCompiler_inline_result);
              }
              JSCompiler_inline_result = false;
            }
            JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
          }
        }
        ssrFormState = mountWorkInProgressHook();
        ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
        JSCompiler_inline_result = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: actionStateReducer,
          lastRenderedState: initialStateProp
        };
        ssrFormState.queue = JSCompiler_inline_result;
        ssrFormState = dispatchSetState.bind(
          null,
          currentlyRenderingFiber$1,
          JSCompiler_inline_result
        );
        JSCompiler_inline_result.dispatch = ssrFormState;
        JSCompiler_inline_result = mountStateImpl(false);
        inRootOrSingleton = dispatchOptimisticSetState.bind(
          null,
          currentlyRenderingFiber$1,
          false,
          JSCompiler_inline_result.queue
        );
        JSCompiler_inline_result = mountWorkInProgressHook();
        JSCompiler_inline_result$jscomp$0 = {
          state: initialStateProp,
          dispatch: null,
          action,
          pending: null
        };
        JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
        ssrFormState = dispatchActionState.bind(
          null,
          currentlyRenderingFiber$1,
          JSCompiler_inline_result$jscomp$0,
          inRootOrSingleton,
          ssrFormState
        );
        JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
        JSCompiler_inline_result.memoizedState = action;
        return [initialStateProp, ssrFormState, false];
      }
      function updateActionState(action) {
        var stateHook = updateWorkInProgressHook();
        return updateActionStateImpl(stateHook, currentHook, action);
      }
      function updateActionStateImpl(stateHook, currentStateHook, action) {
        currentStateHook = updateReducerImpl(
          stateHook,
          currentStateHook,
          actionStateReducer
        )[0];
        stateHook = updateReducer(basicStateReducer)[0];
        currentStateHook = "object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then ? useThenable(currentStateHook) : currentStateHook;
        var actionQueueHook = updateWorkInProgressHook(), actionQueue = actionQueueHook.queue, dispatch = actionQueue.dispatch;
        action !== actionQueueHook.memoizedState && (currentlyRenderingFiber$1.flags |= 2048, pushEffect(
          9,
          actionStateActionEffect.bind(null, actionQueue, action),
          { destroy: void 0 },
          null
        ));
        return [currentStateHook, dispatch, stateHook];
      }
      function actionStateActionEffect(actionQueue, action) {
        actionQueue.action = action;
      }
      function rerenderActionState(action) {
        var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
        if (null !== currentStateHook)
          return updateActionStateImpl(stateHook, currentStateHook, action);
        updateWorkInProgressHook();
        stateHook = stateHook.memoizedState;
        currentStateHook = updateWorkInProgressHook();
        var dispatch = currentStateHook.queue.dispatch;
        currentStateHook.memoizedState = action;
        return [stateHook, dispatch, false];
      }
      function pushEffect(tag, create, inst, deps) {
        tag = { tag, create, inst, deps, next: null };
        create = currentlyRenderingFiber$1.updateQueue;
        null === create && (create = createFunctionComponentUpdateQueue(), currentlyRenderingFiber$1.updateQueue = create);
        inst = create.lastEffect;
        null === inst ? create.lastEffect = tag.next = tag : (deps = inst.next, inst.next = tag, tag.next = deps, create.lastEffect = tag);
        return tag;
      }
      function updateRef() {
        return updateWorkInProgressHook().memoizedState;
      }
      function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
        var hook = mountWorkInProgressHook();
        currentlyRenderingFiber$1.flags |= fiberFlags;
        hook.memoizedState = pushEffect(
          1 | hookFlags,
          create,
          { destroy: void 0 },
          void 0 === deps ? null : deps
        );
      }
      function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
        var hook = updateWorkInProgressHook();
        deps = void 0 === deps ? null : deps;
        var inst = hook.memoizedState.inst;
        null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushEffect(hookFlags, create, inst, deps) : (currentlyRenderingFiber$1.flags |= fiberFlags, hook.memoizedState = pushEffect(1 | hookFlags, create, inst, deps));
      }
      function mountEffect(create, deps) {
        mountEffectImpl(8390656, 8, create, deps);
      }
      function updateEffect(create, deps) {
        updateEffectImpl(2048, 8, create, deps);
      }
      function updateInsertionEffect(create, deps) {
        return updateEffectImpl(4, 2, create, deps);
      }
      function updateLayoutEffect(create, deps) {
        return updateEffectImpl(4, 4, create, deps);
      }
      function imperativeHandleEffect(create, ref) {
        if ("function" === typeof ref) {
          create = create();
          var refCleanup = ref(create);
          return function() {
            "function" === typeof refCleanup ? refCleanup() : ref(null);
          };
        }
        if (null !== ref && void 0 !== ref)
          return create = create(), ref.current = create, function() {
            ref.current = null;
          };
      }
      function updateImperativeHandle(ref, create, deps) {
        deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
        updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
      }
      function mountDebugValue() {
      }
      function updateCallback(callback, deps) {
        var hook = updateWorkInProgressHook();
        deps = void 0 === deps ? null : deps;
        var prevState = hook.memoizedState;
        if (null !== deps && areHookInputsEqual(deps, prevState[1]))
          return prevState[0];
        hook.memoizedState = [callback, deps];
        return callback;
      }
      function updateMemo(nextCreate, deps) {
        var hook = updateWorkInProgressHook();
        deps = void 0 === deps ? null : deps;
        var prevState = hook.memoizedState;
        if (null !== deps && areHookInputsEqual(deps, prevState[1]))
          return prevState[0];
        prevState = nextCreate();
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(true);
          try {
            nextCreate();
          } finally {
            setIsStrictModeForDevtools(false);
          }
        }
        hook.memoizedState = [prevState, deps];
        return prevState;
      }
      function mountDeferredValueImpl(hook, value, initialValue) {
        if (void 0 === initialValue || 0 !== (renderLanes & 1073741824))
          return hook.memoizedState = value;
        hook.memoizedState = initialValue;
        hook = requestDeferredLane();
        currentlyRenderingFiber$1.lanes |= hook;
        workInProgressRootSkippedLanes |= hook;
        return initialValue;
      }
      function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
        if (objectIs(value, prevValue)) return value;
        if (null !== currentTreeHiddenStackCursor.current)
          return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
        if (0 === (renderLanes & 42))
          return didReceiveUpdate = true, hook.memoizedState = value;
        hook = requestDeferredLane();
        currentlyRenderingFiber$1.lanes |= hook;
        workInProgressRootSkippedLanes |= hook;
        return prevValue;
      }
      function startTransition(fiber, queue, pendingState, finishedState, callback) {
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        ReactSharedInternals.T = currentTransition;
        dispatchOptimisticSetState(fiber, false, queue, pendingState);
        try {
          var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) {
            var thenableForFinishedState = chainThenableValue(
              returnValue,
              finishedState
            );
            dispatchSetStateInternal(
              fiber,
              queue,
              thenableForFinishedState,
              requestUpdateLane(fiber)
            );
          } else
            dispatchSetStateInternal(
              fiber,
              queue,
              finishedState,
              requestUpdateLane(fiber)
            );
        } catch (error) {
          dispatchSetStateInternal(
            fiber,
            queue,
            { then: function() {
            }, status: "rejected", reason: error },
            requestUpdateLane()
          );
        } finally {
          ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
        }
      }
      function noop$2() {
      }
      function startHostTransition(formFiber, pendingState, action, formData) {
        if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
        var queue = ensureFormComponentIsStateful(formFiber).queue;
        startTransition(
          formFiber,
          queue,
          pendingState,
          sharedNotPendingObject,
          null === action ? noop$2 : function() {
            requestFormReset$1(formFiber);
            return action(formData);
          }
        );
      }
      function ensureFormComponentIsStateful(formFiber) {
        var existingStateHook = formFiber.memoizedState;
        if (null !== existingStateHook) return existingStateHook;
        existingStateHook = {
          memoizedState: sharedNotPendingObject,
          baseState: sharedNotPendingObject,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: basicStateReducer,
            lastRenderedState: sharedNotPendingObject
          },
          next: null
        };
        var initialResetState = {};
        existingStateHook.next = {
          memoizedState: initialResetState,
          baseState: initialResetState,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: basicStateReducer,
            lastRenderedState: initialResetState
          },
          next: null
        };
        formFiber.memoizedState = existingStateHook;
        formFiber = formFiber.alternate;
        null !== formFiber && (formFiber.memoizedState = existingStateHook);
        return existingStateHook;
      }
      function requestFormReset$1(formFiber) {
        var resetStateQueue = ensureFormComponentIsStateful(formFiber).next.queue;
        dispatchSetStateInternal(formFiber, resetStateQueue, {}, requestUpdateLane());
      }
      function useHostTransitionStatus() {
        return readContext(HostTransitionContext);
      }
      function updateId() {
        return updateWorkInProgressHook().memoizedState;
      }
      function updateRefresh() {
        return updateWorkInProgressHook().memoizedState;
      }
      function refreshCache(fiber) {
        for (var provider = fiber.return; null !== provider; ) {
          switch (provider.tag) {
            case 24:
            case 3:
              var lane = requestUpdateLane();
              fiber = createUpdate(lane);
              var root$63 = enqueueUpdate(provider, fiber, lane);
              null !== root$63 && (scheduleUpdateOnFiber(root$63, provider, lane), entangleTransitions(root$63, provider, lane));
              provider = { cache: createCache() };
              fiber.payload = provider;
              return;
          }
          provider = provider.return;
        }
      }
      function dispatchReducerAction(fiber, queue, action) {
        var lane = requestUpdateLane();
        action = {
          lane,
          revertLane: 0,
          action,
          hasEagerState: false,
          eagerState: null,
          next: null
        };
        isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
      }
      function dispatchSetState(fiber, queue, action) {
        var lane = requestUpdateLane();
        dispatchSetStateInternal(fiber, queue, action, lane);
      }
      function dispatchSetStateInternal(fiber, queue, action, lane) {
        var update = {
          lane,
          revertLane: 0,
          action,
          hasEagerState: false,
          eagerState: null,
          next: null
        };
        if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
        else {
          var alternate = fiber.alternate;
          if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate))
            try {
              var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
              update.hasEagerState = true;
              update.eagerState = eagerState;
              if (objectIs(eagerState, currentState))
                return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), false;
            } catch (error) {
            } finally {
            }
          action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
          if (null !== action)
            return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
        }
        return false;
      }
      function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
        action = {
          lane: 2,
          revertLane: requestTransitionLane(),
          action,
          hasEagerState: false,
          eagerState: null,
          next: null
        };
        if (isRenderPhaseUpdate(fiber)) {
          if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
        } else
          throwIfDuringRender = enqueueConcurrentHookUpdate(
            fiber,
            queue,
            action,
            2
          ), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
      }
      function isRenderPhaseUpdate(fiber) {
        var alternate = fiber.alternate;
        return fiber === currentlyRenderingFiber$1 || null !== alternate && alternate === currentlyRenderingFiber$1;
      }
      function enqueueRenderPhaseUpdate(queue, update) {
        didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
        var pending = queue.pending;
        null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
        queue.pending = update;
      }
      function entangleTransitionUpdate(root3, queue, lane) {
        if (0 !== (lane & 4194176)) {
          var queueLanes = queue.lanes;
          queueLanes &= root3.pendingLanes;
          lane |= queueLanes;
          queue.lanes = lane;
          markRootEntangled(root3, lane);
        }
      }
      var ContextOnlyDispatcher = {
        readContext,
        use,
        useCallback: throwInvalidHookError,
        useContext: throwInvalidHookError,
        useEffect: throwInvalidHookError,
        useImperativeHandle: throwInvalidHookError,
        useLayoutEffect: throwInvalidHookError,
        useInsertionEffect: throwInvalidHookError,
        useMemo: throwInvalidHookError,
        useReducer: throwInvalidHookError,
        useRef: throwInvalidHookError,
        useState: throwInvalidHookError,
        useDebugValue: throwInvalidHookError,
        useDeferredValue: throwInvalidHookError,
        useTransition: throwInvalidHookError,
        useSyncExternalStore: throwInvalidHookError,
        useId: throwInvalidHookError
      };
      ContextOnlyDispatcher.useCacheRefresh = throwInvalidHookError;
      ContextOnlyDispatcher.useMemoCache = throwInvalidHookError;
      ContextOnlyDispatcher.useHostTransitionStatus = throwInvalidHookError;
      ContextOnlyDispatcher.useFormState = throwInvalidHookError;
      ContextOnlyDispatcher.useActionState = throwInvalidHookError;
      ContextOnlyDispatcher.useOptimistic = throwInvalidHookError;
      var HooksDispatcherOnMount = {
        readContext,
        use,
        useCallback: function(callback, deps) {
          mountWorkInProgressHook().memoizedState = [
            callback,
            void 0 === deps ? null : deps
          ];
          return callback;
        },
        useContext: readContext,
        useEffect: mountEffect,
        useImperativeHandle: function(ref, create, deps) {
          deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
          mountEffectImpl(
            4194308,
            4,
            imperativeHandleEffect.bind(null, create, ref),
            deps
          );
        },
        useLayoutEffect: function(create, deps) {
          return mountEffectImpl(4194308, 4, create, deps);
        },
        useInsertionEffect: function(create, deps) {
          mountEffectImpl(4, 2, create, deps);
        },
        useMemo: function(nextCreate, deps) {
          var hook = mountWorkInProgressHook();
          deps = void 0 === deps ? null : deps;
          var nextValue = nextCreate();
          if (shouldDoubleInvokeUserFnsInHooksDEV) {
            setIsStrictModeForDevtools(true);
            try {
              nextCreate();
            } finally {
              setIsStrictModeForDevtools(false);
            }
          }
          hook.memoizedState = [nextValue, deps];
          return nextValue;
        },
        useReducer: function(reducer, initialArg, init) {
          var hook = mountWorkInProgressHook();
          if (void 0 !== init) {
            var initialState = init(initialArg);
            if (shouldDoubleInvokeUserFnsInHooksDEV) {
              setIsStrictModeForDevtools(true);
              try {
                init(initialArg);
              } finally {
                setIsStrictModeForDevtools(false);
              }
            }
          } else initialState = initialArg;
          hook.memoizedState = hook.baseState = initialState;
          reducer = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: reducer,
            lastRenderedState: initialState
          };
          hook.queue = reducer;
          reducer = reducer.dispatch = dispatchReducerAction.bind(
            null,
            currentlyRenderingFiber$1,
            reducer
          );
          return [hook.memoizedState, reducer];
        },
        useRef: function(initialValue) {
          var hook = mountWorkInProgressHook();
          initialValue = { current: initialValue };
          return hook.memoizedState = initialValue;
        },
        useState: function(initialState) {
          initialState = mountStateImpl(initialState);
          var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber$1, queue);
          queue.dispatch = dispatch;
          return [initialState.memoizedState, dispatch];
        },
        useDebugValue: mountDebugValue,
        useDeferredValue: function(value, initialValue) {
          var hook = mountWorkInProgressHook();
          return mountDeferredValueImpl(hook, value, initialValue);
        },
        useTransition: function() {
          var stateHook = mountStateImpl(false);
          stateHook = startTransition.bind(
            null,
            currentlyRenderingFiber$1,
            stateHook.queue,
            true,
            false
          );
          mountWorkInProgressHook().memoizedState = stateHook;
          return [false, stateHook];
        },
        useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
          var fiber = currentlyRenderingFiber$1, hook = mountWorkInProgressHook();
          if (isHydrating) {
            if (void 0 === getServerSnapshot)
              throw Error(formatProdErrorMessage(407));
            getServerSnapshot = getServerSnapshot();
          } else {
            getServerSnapshot = getSnapshot();
            if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
            0 !== (workInProgressRootRenderLanes & 60) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
          }
          hook.memoizedState = getServerSnapshot;
          var inst = { value: getServerSnapshot, getSnapshot };
          hook.queue = inst;
          mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
            subscribe
          ]);
          fiber.flags |= 2048;
          pushEffect(
            9,
            updateStoreInstance.bind(
              null,
              fiber,
              inst,
              getServerSnapshot,
              getSnapshot
            ),
            { destroy: void 0 },
            null
          );
          return getServerSnapshot;
        },
        useId: function() {
          var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
          if (isHydrating) {
            var JSCompiler_inline_result = treeContextOverflow;
            var idWithLeadingBit = treeContextId;
            JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
            identifierPrefix = ":" + identifierPrefix + "R" + JSCompiler_inline_result;
            JSCompiler_inline_result = localIdCounter++;
            0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
            identifierPrefix += ":";
          } else
            JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = ":" + identifierPrefix + "r" + JSCompiler_inline_result.toString(32) + ":";
          return hook.memoizedState = identifierPrefix;
        },
        useCacheRefresh: function() {
          return mountWorkInProgressHook().memoizedState = refreshCache.bind(
            null,
            currentlyRenderingFiber$1
          );
        }
      };
      HooksDispatcherOnMount.useMemoCache = useMemoCache;
      HooksDispatcherOnMount.useHostTransitionStatus = useHostTransitionStatus;
      HooksDispatcherOnMount.useFormState = mountActionState;
      HooksDispatcherOnMount.useActionState = mountActionState;
      HooksDispatcherOnMount.useOptimistic = function(passthrough) {
        var hook = mountWorkInProgressHook();
        hook.memoizedState = hook.baseState = passthrough;
        var queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: null,
          lastRenderedState: null
        };
        hook.queue = queue;
        hook = dispatchOptimisticSetState.bind(
          null,
          currentlyRenderingFiber$1,
          true,
          queue
        );
        queue.dispatch = hook;
        return [passthrough, hook];
      };
      var HooksDispatcherOnUpdate = {
        readContext,
        use,
        useCallback: updateCallback,
        useContext: readContext,
        useEffect: updateEffect,
        useImperativeHandle: updateImperativeHandle,
        useInsertionEffect: updateInsertionEffect,
        useLayoutEffect: updateLayoutEffect,
        useMemo: updateMemo,
        useReducer: updateReducer,
        useRef: updateRef,
        useState: function() {
          return updateReducer(basicStateReducer);
        },
        useDebugValue: mountDebugValue,
        useDeferredValue: function(value, initialValue) {
          var hook = updateWorkInProgressHook();
          return updateDeferredValueImpl(
            hook,
            currentHook.memoizedState,
            value,
            initialValue
          );
        },
        useTransition: function() {
          var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
          return [
            "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
            start
          ];
        },
        useSyncExternalStore: updateSyncExternalStore,
        useId: updateId
      };
      HooksDispatcherOnUpdate.useCacheRefresh = updateRefresh;
      HooksDispatcherOnUpdate.useMemoCache = useMemoCache;
      HooksDispatcherOnUpdate.useHostTransitionStatus = useHostTransitionStatus;
      HooksDispatcherOnUpdate.useFormState = updateActionState;
      HooksDispatcherOnUpdate.useActionState = updateActionState;
      HooksDispatcherOnUpdate.useOptimistic = function(passthrough, reducer) {
        var hook = updateWorkInProgressHook();
        return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
      };
      var HooksDispatcherOnRerender = {
        readContext,
        use,
        useCallback: updateCallback,
        useContext: readContext,
        useEffect: updateEffect,
        useImperativeHandle: updateImperativeHandle,
        useInsertionEffect: updateInsertionEffect,
        useLayoutEffect: updateLayoutEffect,
        useMemo: updateMemo,
        useReducer: rerenderReducer,
        useRef: updateRef,
        useState: function() {
          return rerenderReducer(basicStateReducer);
        },
        useDebugValue: mountDebugValue,
        useDeferredValue: function(value, initialValue) {
          var hook = updateWorkInProgressHook();
          return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(
            hook,
            currentHook.memoizedState,
            value,
            initialValue
          );
        },
        useTransition: function() {
          var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
          return [
            "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
            start
          ];
        },
        useSyncExternalStore: updateSyncExternalStore,
        useId: updateId
      };
      HooksDispatcherOnRerender.useCacheRefresh = updateRefresh;
      HooksDispatcherOnRerender.useMemoCache = useMemoCache;
      HooksDispatcherOnRerender.useHostTransitionStatus = useHostTransitionStatus;
      HooksDispatcherOnRerender.useFormState = rerenderActionState;
      HooksDispatcherOnRerender.useActionState = rerenderActionState;
      HooksDispatcherOnRerender.useOptimistic = function(passthrough, reducer) {
        var hook = updateWorkInProgressHook();
        if (null !== currentHook)
          return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
        hook.baseState = passthrough;
        return [passthrough, hook.queue.dispatch];
      };
      function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
        ctor = workInProgress2.memoizedState;
        getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
        getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
        workInProgress2.memoizedState = getDerivedStateFromProps;
        0 === workInProgress2.lanes && (workInProgress2.updateQueue.baseState = getDerivedStateFromProps);
      }
      var classComponentUpdater = {
        isMounted: function(component) {
          return (component = component._reactInternals) ? getNearestMountedFiber(component) === component : false;
        },
        enqueueSetState: function(inst, payload, callback) {
          inst = inst._reactInternals;
          var lane = requestUpdateLane(), update = createUpdate(lane);
          update.payload = payload;
          void 0 !== callback && null !== callback && (update.callback = callback);
          payload = enqueueUpdate(inst, update, lane);
          null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
        },
        enqueueReplaceState: function(inst, payload, callback) {
          inst = inst._reactInternals;
          var lane = requestUpdateLane(), update = createUpdate(lane);
          update.tag = 1;
          update.payload = payload;
          void 0 !== callback && null !== callback && (update.callback = callback);
          payload = enqueueUpdate(inst, update, lane);
          null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
        },
        enqueueForceUpdate: function(inst, callback) {
          inst = inst._reactInternals;
          var lane = requestUpdateLane(), update = createUpdate(lane);
          update.tag = 2;
          void 0 !== callback && null !== callback && (update.callback = callback);
          callback = enqueueUpdate(inst, update, lane);
          null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
        }
      };
      function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
        workInProgress2 = workInProgress2.stateNode;
        return "function" === typeof workInProgress2.shouldComponentUpdate ? workInProgress2.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
      }
      function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
        workInProgress2 = instance.state;
        "function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
        "function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
        instance.state !== workInProgress2 && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
      }
      function resolveClassComponentProps(Component, baseProps) {
        var newProps = baseProps;
        if ("ref" in baseProps) {
          newProps = {};
          for (var propName in baseProps)
            "ref" !== propName && (newProps[propName] = baseProps[propName]);
        }
        if (Component = Component.defaultProps) {
          newProps === baseProps && (newProps = assign({}, newProps));
          for (var propName$67 in Component)
            void 0 === newProps[propName$67] && (newProps[propName$67] = Component[propName$67]);
        }
        return newProps;
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
      function defaultOnUncaughtError(error) {
        reportGlobalError(error);
      }
      function defaultOnCaughtError(error) {
        console.error(error);
      }
      function defaultOnRecoverableError(error) {
        reportGlobalError(error);
      }
      function logUncaughtError(root3, errorInfo) {
        try {
          var onUncaughtError = root3.onUncaughtError;
          onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
        } catch (e$68) {
          setTimeout(function() {
            throw e$68;
          });
        }
      }
      function logCaughtError(root3, boundary, errorInfo) {
        try {
          var onCaughtError = root3.onCaughtError;
          onCaughtError(errorInfo.value, {
            componentStack: errorInfo.stack,
            errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
          });
        } catch (e$69) {
          setTimeout(function() {
            throw e$69;
          });
        }
      }
      function createRootErrorUpdate(root3, errorInfo, lane) {
        lane = createUpdate(lane);
        lane.tag = 3;
        lane.payload = { element: null };
        lane.callback = function() {
          logUncaughtError(root3, errorInfo);
        };
        return lane;
      }
      function createClassErrorUpdate(lane) {
        lane = createUpdate(lane);
        lane.tag = 3;
        return lane;
      }
      function initializeClassErrorUpdate(update, root3, fiber, errorInfo) {
        var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
        if ("function" === typeof getDerivedStateFromError) {
          var error = errorInfo.value;
          update.payload = function() {
            return getDerivedStateFromError(error);
          };
          update.callback = function() {
            logCaughtError(root3, fiber, errorInfo);
          };
        }
        var inst = fiber.stateNode;
        null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
          logCaughtError(root3, fiber, errorInfo);
          "function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
          var stack = errorInfo.stack;
          this.componentDidCatch(errorInfo.value, {
            componentStack: null !== stack ? stack : ""
          });
        });
      }
      function throwException(root3, returnFiber, sourceFiber, value, rootRenderLanes) {
        sourceFiber.flags |= 32768;
        if (null !== value && "object" === typeof value && "function" === typeof value.then) {
          returnFiber = sourceFiber.alternate;
          null !== returnFiber && propagateParentContextChanges(
            returnFiber,
            sourceFiber,
            rootRenderLanes,
            true
          );
          sourceFiber = suspenseHandlerStackCursor.current;
          if (null !== sourceFiber) {
            switch (sourceFiber.tag) {
              case 13:
                return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root3, value, rootRenderLanes)), false;
              case 22:
                return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
                  transitions: null,
                  markerInstances: null,
                  retryQueue: /* @__PURE__ */ new Set([value])
                }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root3, value, rootRenderLanes)), false;
            }
            throw Error(formatProdErrorMessage(435, sourceFiber.tag));
          }
          attachPingListener(root3, value, rootRenderLanes);
          renderDidSuspendDelayIfPossible();
          return false;
        }
        if (isHydrating)
          return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root3 = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root3, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), {
            cause: value
          }), queueHydrationError(
            createCapturedValueAtFiber(returnFiber, sourceFiber)
          )), root3 = root3.current.alternate, root3.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root3.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(
            root3.stateNode,
            value,
            rootRenderLanes
          ), enqueueCapturedUpdate(root3, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), false;
        var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
        wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
        null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
        4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
        if (null === returnFiber) return true;
        value = createCapturedValueAtFiber(value, sourceFiber);
        sourceFiber = returnFiber;
        do {
          switch (sourceFiber.tag) {
            case 3:
              return sourceFiber.flags |= 65536, root3 = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root3, root3 = createRootErrorUpdate(sourceFiber.stateNode, value, root3), enqueueCapturedUpdate(sourceFiber, root3), false;
            case 1:
              if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, 0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError))))
                return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(
                  rootRenderLanes,
                  root3,
                  sourceFiber,
                  value
                ), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
          }
          sourceFiber = sourceFiber.return;
        } while (null !== sourceFiber);
        return false;
      }
      var SelectiveHydrationException = Error(formatProdErrorMessage(461));
      var didReceiveUpdate = false;
      function reconcileChildren(current, workInProgress2, nextChildren, renderLanes2) {
        workInProgress2.child = null === current ? mountChildFibers(workInProgress2, null, nextChildren, renderLanes2) : reconcileChildFibers(
          workInProgress2,
          current.child,
          nextChildren,
          renderLanes2
        );
      }
      function updateForwardRef(current, workInProgress2, Component, nextProps, renderLanes2) {
        Component = Component.render;
        var ref = workInProgress2.ref;
        if ("ref" in nextProps) {
          var propsWithoutRef = {};
          for (var key in nextProps)
            "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
        } else propsWithoutRef = nextProps;
        prepareToReadContext(workInProgress2);
        nextProps = renderWithHooks(
          current,
          workInProgress2,
          Component,
          propsWithoutRef,
          ref,
          renderLanes2
        );
        key = checkDidRenderIdHook();
        if (null !== current && !didReceiveUpdate)
          return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        isHydrating && key && pushMaterializedTreeId(workInProgress2);
        workInProgress2.flags |= 1;
        reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
        return workInProgress2.child;
      }
      function updateMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
        if (null === current) {
          var type = Component.type;
          if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare)
            return workInProgress2.tag = 15, workInProgress2.type = type, updateSimpleMemoComponent(
              current,
              workInProgress2,
              type,
              nextProps,
              renderLanes2
            );
          current = createFiberFromTypeAndProps(
            Component.type,
            null,
            nextProps,
            workInProgress2,
            workInProgress2.mode,
            renderLanes2
          );
          current.ref = workInProgress2.ref;
          current.return = workInProgress2;
          return workInProgress2.child = current;
        }
        type = current.child;
        if (!checkScheduledUpdateOrContext(current, renderLanes2)) {
          var prevProps = type.memoizedProps;
          Component = Component.compare;
          Component = null !== Component ? Component : shallowEqual;
          if (Component(prevProps, nextProps) && current.ref === workInProgress2.ref)
            return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        }
        workInProgress2.flags |= 1;
        current = createWorkInProgress(type, nextProps);
        current.ref = workInProgress2.ref;
        current.return = workInProgress2;
        return workInProgress2.child = current;
      }
      function updateSimpleMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
        if (null !== current) {
          var prevProps = current.memoizedProps;
          if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress2.ref)
            if (didReceiveUpdate = false, workInProgress2.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes2))
              0 !== (current.flags & 131072) && (didReceiveUpdate = true);
            else
              return workInProgress2.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        }
        return updateFunctionComponent(
          current,
          workInProgress2,
          Component,
          nextProps,
          renderLanes2
        );
      }
      function updateOffscreenComponent(current, workInProgress2, renderLanes2) {
        var nextProps = workInProgress2.pendingProps, nextChildren = nextProps.children, nextIsDetached = 0 !== (workInProgress2.stateNode._pendingVisibility & 2), prevState = null !== current ? current.memoizedState : null;
        markRef(current, workInProgress2);
        if ("hidden" === nextProps.mode || nextIsDetached) {
          if (0 !== (workInProgress2.flags & 128)) {
            nextProps = null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2;
            if (null !== current) {
              nextChildren = workInProgress2.child = current.child;
              for (nextIsDetached = 0; null !== nextChildren; )
                nextIsDetached = nextIsDetached | nextChildren.lanes | nextChildren.childLanes, nextChildren = nextChildren.sibling;
              workInProgress2.childLanes = nextIsDetached & ~nextProps;
            } else workInProgress2.childLanes = 0, workInProgress2.child = null;
            return deferHiddenOffscreenComponent(
              current,
              workInProgress2,
              nextProps,
              renderLanes2
            );
          }
          if (0 !== (renderLanes2 & 536870912))
            workInProgress2.memoizedState = { baseLanes: 0, cachePool: null }, null !== current && pushTransition(
              workInProgress2,
              null !== prevState ? prevState.cachePool : null
            ), null !== prevState ? pushHiddenContext(workInProgress2, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress2);
          else
            return workInProgress2.lanes = workInProgress2.childLanes = 536870912, deferHiddenOffscreenComponent(
              current,
              workInProgress2,
              null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2,
              renderLanes2
            );
        } else
          null !== prevState ? (pushTransition(workInProgress2, prevState.cachePool), pushHiddenContext(workInProgress2, prevState), reuseSuspenseHandlerOnStack(workInProgress2), workInProgress2.memoizedState = null) : (null !== current && pushTransition(workInProgress2, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack(workInProgress2));
        reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
        return workInProgress2.child;
      }
      function deferHiddenOffscreenComponent(current, workInProgress2, nextBaseLanes, renderLanes2) {
        var JSCompiler_inline_result = peekCacheFromPool();
        JSCompiler_inline_result = null === JSCompiler_inline_result ? null : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
        workInProgress2.memoizedState = {
          baseLanes: nextBaseLanes,
          cachePool: JSCompiler_inline_result
        };
        null !== current && pushTransition(workInProgress2, null);
        reuseHiddenContextOnStack();
        pushOffscreenSuspenseHandler(workInProgress2);
        null !== current && propagateParentContextChanges(current, workInProgress2, renderLanes2, true);
        return null;
      }
      function markRef(current, workInProgress2) {
        var ref = workInProgress2.ref;
        if (null === ref)
          null !== current && null !== current.ref && (workInProgress2.flags |= 2097664);
        else {
          if ("function" !== typeof ref && "object" !== typeof ref)
            throw Error(formatProdErrorMessage(284));
          if (null === current || current.ref !== ref)
            workInProgress2.flags |= 2097664;
        }
      }
      function updateFunctionComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
        prepareToReadContext(workInProgress2);
        Component = renderWithHooks(
          current,
          workInProgress2,
          Component,
          nextProps,
          void 0,
          renderLanes2
        );
        nextProps = checkDidRenderIdHook();
        if (null !== current && !didReceiveUpdate)
          return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        isHydrating && nextProps && pushMaterializedTreeId(workInProgress2);
        workInProgress2.flags |= 1;
        reconcileChildren(current, workInProgress2, Component, renderLanes2);
        return workInProgress2.child;
      }
      function replayFunctionComponent(current, workInProgress2, nextProps, Component, secondArg, renderLanes2) {
        prepareToReadContext(workInProgress2);
        workInProgress2.updateQueue = null;
        nextProps = renderWithHooksAgain(
          workInProgress2,
          Component,
          nextProps,
          secondArg
        );
        finishRenderingHooks(current);
        Component = checkDidRenderIdHook();
        if (null !== current && !didReceiveUpdate)
          return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        isHydrating && Component && pushMaterializedTreeId(workInProgress2);
        workInProgress2.flags |= 1;
        reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
        return workInProgress2.child;
      }
      function updateClassComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
        prepareToReadContext(workInProgress2);
        if (null === workInProgress2.stateNode) {
          var context = emptyContextObject, contextType = Component.contextType;
          "object" === typeof contextType && null !== contextType && (context = readContext(contextType));
          context = new Component(nextProps, context);
          workInProgress2.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
          context.updater = classComponentUpdater;
          workInProgress2.stateNode = context;
          context._reactInternals = workInProgress2;
          context = workInProgress2.stateNode;
          context.props = nextProps;
          context.state = workInProgress2.memoizedState;
          context.refs = {};
          initializeUpdateQueue(workInProgress2);
          contextType = Component.contextType;
          context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
          context.state = workInProgress2.memoizedState;
          contextType = Component.getDerivedStateFromProps;
          "function" === typeof contextType && (applyDerivedStateFromProps(
            workInProgress2,
            Component,
            contextType,
            nextProps
          ), context.state = workInProgress2.memoizedState);
          "function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress2, nextProps, context, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress2.memoizedState);
          "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308);
          nextProps = true;
        } else if (null === current) {
          context = workInProgress2.stateNode;
          var unresolvedOldProps = workInProgress2.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
          context.props = oldProps;
          var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
          contextType = emptyContextObject;
          "object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
          var getDerivedStateFromProps = Component.getDerivedStateFromProps;
          contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
          unresolvedOldProps = workInProgress2.pendingProps !== unresolvedOldProps;
          contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(
            workInProgress2,
            context,
            nextProps,
            contextType
          );
          hasForceUpdate = false;
          var oldState = workInProgress2.memoizedState;
          context.state = oldState;
          processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
          suspendIfUpdateReadFromEntangledAsyncAction();
          oldContext = workInProgress2.memoizedState;
          unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(
            workInProgress2,
            Component,
            getDerivedStateFromProps,
            nextProps
          ), oldContext = workInProgress2.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(
            workInProgress2,
            Component,
            oldProps,
            nextProps,
            oldState,
            oldContext,
            contextType
          )) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), nextProps = false);
        } else {
          context = workInProgress2.stateNode;
          cloneUpdateQueue(current, workInProgress2);
          contextType = workInProgress2.memoizedProps;
          contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
          context.props = contextType$jscomp$0;
          getDerivedStateFromProps = workInProgress2.pendingProps;
          oldState = context.context;
          oldContext = Component.contextType;
          oldProps = emptyContextObject;
          "object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
          unresolvedOldProps = Component.getDerivedStateFromProps;
          (oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(
            workInProgress2,
            context,
            nextProps,
            oldProps
          );
          hasForceUpdate = false;
          oldState = workInProgress2.memoizedState;
          context.state = oldState;
          processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
          suspendIfUpdateReadFromEntangledAsyncAction();
          var newState = workInProgress2.memoizedState;
          contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(
            workInProgress2,
            Component,
            unresolvedOldProps,
            nextProps
          ), newState = workInProgress2.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(
            workInProgress2,
            Component,
            contextType$jscomp$0,
            nextProps,
            oldState,
            newState,
            oldProps
          ) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(
            nextProps,
            newState,
            oldProps
          )), "function" === typeof context.componentDidUpdate && (workInProgress2.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress2.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), nextProps = false);
        }
        context = nextProps;
        markRef(current, workInProgress2);
        nextProps = 0 !== (workInProgress2.flags & 128);
        context || nextProps ? (context = workInProgress2.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress2.flags |= 1, null !== current && nextProps ? (workInProgress2.child = reconcileChildFibers(
          workInProgress2,
          current.child,
          null,
          renderLanes2
        ), workInProgress2.child = reconcileChildFibers(
          workInProgress2,
          null,
          Component,
          renderLanes2
        )) : reconcileChildren(current, workInProgress2, Component, renderLanes2), workInProgress2.memoizedState = context.state, current = workInProgress2.child) : current = bailoutOnAlreadyFinishedWork(
          current,
          workInProgress2,
          renderLanes2
        );
        return current;
      }
      function mountHostRootWithoutHydrating(current, workInProgress2, nextChildren, renderLanes2) {
        resetHydrationState();
        workInProgress2.flags |= 256;
        reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
        return workInProgress2.child;
      }
      var SUSPENDED_MARKER = { dehydrated: null, treeContext: null, retryLane: 0 };
      function mountSuspenseOffscreenState(renderLanes2) {
        return { baseLanes: renderLanes2, cachePool: getSuspendedCache() };
      }
      function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes2) {
        current = null !== current ? current.childLanes & ~renderLanes2 : 0;
        primaryTreeDidDefer && (current |= workInProgressDeferredLane);
        return current;
      }
      function updateSuspenseComponent(current, workInProgress2, renderLanes2) {
        var nextProps = workInProgress2.pendingProps, showFallback = false, didSuspend = 0 !== (workInProgress2.flags & 128), JSCompiler_temp;
        (JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? false : 0 !== (suspenseStackCursor.current & 2));
        JSCompiler_temp && (showFallback = true, workInProgress2.flags &= -129);
        JSCompiler_temp = 0 !== (workInProgress2.flags & 32);
        workInProgress2.flags &= -33;
        if (null === current) {
          if (isHydrating) {
            showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress2) : reuseSuspenseHandlerOnStack(workInProgress2);
            if (isHydrating) {
              var nextInstance = nextHydratableInstance, JSCompiler_temp$jscomp$0;
              if (JSCompiler_temp$jscomp$0 = nextInstance) {
                c: {
                  JSCompiler_temp$jscomp$0 = nextInstance;
                  for (nextInstance = rootOrSingletonContext; 8 !== JSCompiler_temp$jscomp$0.nodeType; ) {
                    if (!nextInstance) {
                      nextInstance = null;
                      break c;
                    }
                    JSCompiler_temp$jscomp$0 = getNextHydratable(
                      JSCompiler_temp$jscomp$0.nextSibling
                    );
                    if (null === JSCompiler_temp$jscomp$0) {
                      nextInstance = null;
                      break c;
                    }
                  }
                  nextInstance = JSCompiler_temp$jscomp$0;
                }
                null !== nextInstance ? (workInProgress2.memoizedState = {
                  dehydrated: nextInstance,
                  treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
                  retryLane: 536870912
                }, JSCompiler_temp$jscomp$0 = createFiberImplClass(
                  18,
                  null,
                  null,
                  0
                ), JSCompiler_temp$jscomp$0.stateNode = nextInstance, JSCompiler_temp$jscomp$0.return = workInProgress2, workInProgress2.child = JSCompiler_temp$jscomp$0, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, JSCompiler_temp$jscomp$0 = true) : JSCompiler_temp$jscomp$0 = false;
              }
              JSCompiler_temp$jscomp$0 || throwOnHydrationMismatch(workInProgress2);
            }
            nextInstance = workInProgress2.memoizedState;
            if (null !== nextInstance && (nextInstance = nextInstance.dehydrated, null !== nextInstance))
              return "$!" === nextInstance.data ? workInProgress2.lanes = 16 : workInProgress2.lanes = 536870912, null;
            popSuspenseHandler(workInProgress2);
          }
          nextInstance = nextProps.children;
          nextProps = nextProps.fallback;
          if (showFallback)
            return reuseSuspenseHandlerOnStack(workInProgress2), showFallback = workInProgress2.mode, nextInstance = mountWorkInProgressOffscreenFiber(
              { mode: "hidden", children: nextInstance },
              showFallback
            ), nextProps = createFiberFromFragment(
              nextProps,
              showFallback,
              renderLanes2,
              null
            ), nextInstance.return = workInProgress2, nextProps.return = workInProgress2, nextInstance.sibling = nextProps, workInProgress2.child = nextInstance, showFallback = workInProgress2.child, showFallback.memoizedState = mountSuspenseOffscreenState(renderLanes2), showFallback.childLanes = getRemainingWorkInPrimaryTree(
              current,
              JSCompiler_temp,
              renderLanes2
            ), workInProgress2.memoizedState = SUSPENDED_MARKER, nextProps;
          pushPrimaryTreeSuspenseHandler(workInProgress2);
          return mountSuspensePrimaryChildren(workInProgress2, nextInstance);
        }
        JSCompiler_temp$jscomp$0 = current.memoizedState;
        if (null !== JSCompiler_temp$jscomp$0 && (nextInstance = JSCompiler_temp$jscomp$0.dehydrated, null !== nextInstance)) {
          if (didSuspend)
            workInProgress2.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags &= -257, workInProgress2 = retrySuspenseComponentWithoutHydrating(
              current,
              workInProgress2,
              renderLanes2
            )) : null !== workInProgress2.memoizedState ? (reuseSuspenseHandlerOnStack(workInProgress2), workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null) : (reuseSuspenseHandlerOnStack(workInProgress2), showFallback = nextProps.fallback, nextInstance = workInProgress2.mode, nextProps = mountWorkInProgressOffscreenFiber(
              { mode: "visible", children: nextProps.children },
              nextInstance
            ), showFallback = createFiberFromFragment(
              showFallback,
              nextInstance,
              renderLanes2,
              null
            ), showFallback.flags |= 2, nextProps.return = workInProgress2, showFallback.return = workInProgress2, nextProps.sibling = showFallback, workInProgress2.child = nextProps, reconcileChildFibers(
              workInProgress2,
              current.child,
              null,
              renderLanes2
            ), nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
              current,
              JSCompiler_temp,
              renderLanes2
            ), workInProgress2.memoizedState = SUSPENDED_MARKER, workInProgress2 = showFallback);
          else if (pushPrimaryTreeSuspenseHandler(workInProgress2), "$!" === nextInstance.data) {
            JSCompiler_temp = nextInstance.nextSibling && nextInstance.nextSibling.dataset;
            if (JSCompiler_temp) var digest = JSCompiler_temp.dgst;
            JSCompiler_temp = digest;
            nextProps = Error(formatProdErrorMessage(419));
            nextProps.stack = "";
            nextProps.digest = JSCompiler_temp;
            queueHydrationError({ value: nextProps, source: null, stack: null });
            workInProgress2 = retrySuspenseComponentWithoutHydrating(
              current,
              workInProgress2,
              renderLanes2
            );
          } else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), JSCompiler_temp = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || JSCompiler_temp) {
            JSCompiler_temp = workInProgressRoot;
            if (null !== JSCompiler_temp) {
              nextProps = renderLanes2 & -renderLanes2;
              if (0 !== (nextProps & 42)) nextProps = 1;
              else
                switch (nextProps) {
                  case 2:
                    nextProps = 1;
                    break;
                  case 8:
                    nextProps = 4;
                    break;
                  case 32:
                    nextProps = 16;
                    break;
                  case 128:
                  case 256:
                  case 512:
                  case 1024:
                  case 2048:
                  case 4096:
                  case 8192:
                  case 16384:
                  case 32768:
                  case 65536:
                  case 131072:
                  case 262144:
                  case 524288:
                  case 1048576:
                  case 2097152:
                  case 4194304:
                  case 8388608:
                  case 16777216:
                  case 33554432:
                    nextProps = 64;
                    break;
                  case 268435456:
                    nextProps = 134217728;
                    break;
                  default:
                    nextProps = 0;
                }
              nextProps = 0 !== (nextProps & (JSCompiler_temp.suspendedLanes | renderLanes2)) ? 0 : nextProps;
              if (0 !== nextProps && nextProps !== JSCompiler_temp$jscomp$0.retryLane)
                throw JSCompiler_temp$jscomp$0.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
            }
            "$?" === nextInstance.data || renderDidSuspendDelayIfPossible();
            workInProgress2 = retrySuspenseComponentWithoutHydrating(
              current,
              workInProgress2,
              renderLanes2
            );
          } else
            "$?" === nextInstance.data ? (workInProgress2.flags |= 128, workInProgress2.child = current.child, workInProgress2 = retryDehydratedSuspenseBoundary.bind(
              null,
              current
            ), nextInstance._reactRetry = workInProgress2, workInProgress2 = null) : (current = JSCompiler_temp$jscomp$0.treeContext, nextHydratableInstance = getNextHydratable(
              nextInstance.nextSibling
            ), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && (idStack[idStackIndex++] = treeContextId, idStack[idStackIndex++] = treeContextOverflow, idStack[idStackIndex++] = treeContextProvider, treeContextId = current.id, treeContextOverflow = current.overflow, treeContextProvider = workInProgress2), workInProgress2 = mountSuspensePrimaryChildren(
              workInProgress2,
              nextProps.children
            ), workInProgress2.flags |= 4096);
          return workInProgress2;
        }
        if (showFallback)
          return reuseSuspenseHandlerOnStack(workInProgress2), showFallback = nextProps.fallback, nextInstance = workInProgress2.mode, JSCompiler_temp$jscomp$0 = current.child, digest = JSCompiler_temp$jscomp$0.sibling, nextProps = createWorkInProgress(JSCompiler_temp$jscomp$0, {
            mode: "hidden",
            children: nextProps.children
          }), nextProps.subtreeFlags = JSCompiler_temp$jscomp$0.subtreeFlags & 31457280, null !== digest ? showFallback = createWorkInProgress(digest, showFallback) : (showFallback = createFiberFromFragment(
            showFallback,
            nextInstance,
            renderLanes2,
            null
          ), showFallback.flags |= 2), showFallback.return = workInProgress2, nextProps.return = workInProgress2, nextProps.sibling = showFallback, workInProgress2.child = nextProps, nextProps = showFallback, showFallback = workInProgress2.child, nextInstance = current.child.memoizedState, null === nextInstance ? nextInstance = mountSuspenseOffscreenState(renderLanes2) : (JSCompiler_temp$jscomp$0 = nextInstance.cachePool, null !== JSCompiler_temp$jscomp$0 ? (digest = CacheContext._currentValue, JSCompiler_temp$jscomp$0 = JSCompiler_temp$jscomp$0.parent !== digest ? { parent: digest, pool: digest } : JSCompiler_temp$jscomp$0) : JSCompiler_temp$jscomp$0 = getSuspendedCache(), nextInstance = {
            baseLanes: nextInstance.baseLanes | renderLanes2,
            cachePool: JSCompiler_temp$jscomp$0
          }), showFallback.memoizedState = nextInstance, showFallback.childLanes = getRemainingWorkInPrimaryTree(
            current,
            JSCompiler_temp,
            renderLanes2
          ), workInProgress2.memoizedState = SUSPENDED_MARKER, nextProps;
        pushPrimaryTreeSuspenseHandler(workInProgress2);
        renderLanes2 = current.child;
        current = renderLanes2.sibling;
        renderLanes2 = createWorkInProgress(renderLanes2, {
          mode: "visible",
          children: nextProps.children
        });
        renderLanes2.return = workInProgress2;
        renderLanes2.sibling = null;
        null !== current && (JSCompiler_temp = workInProgress2.deletions, null === JSCompiler_temp ? (workInProgress2.deletions = [current], workInProgress2.flags |= 16) : JSCompiler_temp.push(current));
        workInProgress2.child = renderLanes2;
        workInProgress2.memoizedState = null;
        return renderLanes2;
      }
      function mountSuspensePrimaryChildren(workInProgress2, primaryChildren) {
        primaryChildren = mountWorkInProgressOffscreenFiber(
          { mode: "visible", children: primaryChildren },
          workInProgress2.mode
        );
        primaryChildren.return = workInProgress2;
        return workInProgress2.child = primaryChildren;
      }
      function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
        return createFiberFromOffscreen(offscreenProps, mode, 0, null);
      }
      function retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
        reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
        current = mountSuspensePrimaryChildren(
          workInProgress2,
          workInProgress2.pendingProps.children
        );
        current.flags |= 2;
        workInProgress2.memoizedState = null;
        return current;
      }
      function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
        fiber.lanes |= renderLanes2;
        var alternate = fiber.alternate;
        null !== alternate && (alternate.lanes |= renderLanes2);
        scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
      }
      function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode) {
        var renderState = workInProgress2.memoizedState;
        null === renderState ? workInProgress2.memoizedState = {
          isBackwards,
          rendering: null,
          renderingStartTime: 0,
          last: lastContentRow,
          tail,
          tailMode
        } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode);
      }
      function updateSuspenseListComponent(current, workInProgress2, renderLanes2) {
        var nextProps = workInProgress2.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
        reconcileChildren(current, workInProgress2, nextProps.children, renderLanes2);
        nextProps = suspenseStackCursor.current;
        if (0 !== (nextProps & 2))
          nextProps = nextProps & 1 | 2, workInProgress2.flags |= 128;
        else {
          if (null !== current && 0 !== (current.flags & 128))
            a: for (current = workInProgress2.child; null !== current; ) {
              if (13 === current.tag)
                null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
              else if (19 === current.tag)
                scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
              else if (null !== current.child) {
                current.child.return = current;
                current = current.child;
                continue;
              }
              if (current === workInProgress2) break a;
              for (; null === current.sibling; ) {
                if (null === current.return || current.return === workInProgress2)
                  break a;
                current = current.return;
              }
              current.sibling.return = current.return;
              current = current.sibling;
            }
          nextProps &= 1;
        }
        push(suspenseStackCursor, nextProps);
        switch (revealOrder) {
          case "forwards":
            renderLanes2 = workInProgress2.child;
            for (revealOrder = null; null !== renderLanes2; )
              current = renderLanes2.alternate, null !== current && null === findFirstSuspended(current) && (revealOrder = renderLanes2), renderLanes2 = renderLanes2.sibling;
            renderLanes2 = revealOrder;
            null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null);
            initSuspenseListRenderState(
              workInProgress2,
              false,
              revealOrder,
              renderLanes2,
              tailMode
            );
            break;
          case "backwards":
            renderLanes2 = null;
            revealOrder = workInProgress2.child;
            for (workInProgress2.child = null; null !== revealOrder; ) {
              current = revealOrder.alternate;
              if (null !== current && null === findFirstSuspended(current)) {
                workInProgress2.child = revealOrder;
                break;
              }
              current = revealOrder.sibling;
              revealOrder.sibling = renderLanes2;
              renderLanes2 = revealOrder;
              revealOrder = current;
            }
            initSuspenseListRenderState(
              workInProgress2,
              true,
              renderLanes2,
              null,
              tailMode
            );
            break;
          case "together":
            initSuspenseListRenderState(workInProgress2, false, null, null, void 0);
            break;
          default:
            workInProgress2.memoizedState = null;
        }
        return workInProgress2.child;
      }
      function bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2) {
        null !== current && (workInProgress2.dependencies = current.dependencies);
        workInProgressRootSkippedLanes |= workInProgress2.lanes;
        if (0 === (renderLanes2 & workInProgress2.childLanes))
          if (null !== current) {
            if (propagateParentContextChanges(
              current,
              workInProgress2,
              renderLanes2,
              false
            ), 0 === (renderLanes2 & workInProgress2.childLanes))
              return null;
          } else return null;
        if (null !== current && workInProgress2.child !== current.child)
          throw Error(formatProdErrorMessage(153));
        if (null !== workInProgress2.child) {
          current = workInProgress2.child;
          renderLanes2 = createWorkInProgress(current, current.pendingProps);
          workInProgress2.child = renderLanes2;
          for (renderLanes2.return = workInProgress2; null !== current.sibling; )
            current = current.sibling, renderLanes2 = renderLanes2.sibling = createWorkInProgress(current, current.pendingProps), renderLanes2.return = workInProgress2;
          renderLanes2.sibling = null;
        }
        return workInProgress2.child;
      }
      function checkScheduledUpdateOrContext(current, renderLanes2) {
        if (0 !== (current.lanes & renderLanes2)) return true;
        current = current.dependencies;
        return null !== current && checkIfContextChanged(current) ? true : false;
      }
      function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2) {
        switch (workInProgress2.tag) {
          case 3:
            pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
            pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
            resetHydrationState();
            break;
          case 27:
          case 5:
            pushHostContext(workInProgress2);
            break;
          case 4:
            pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
            break;
          case 10:
            pushProvider(
              workInProgress2,
              workInProgress2.type,
              workInProgress2.memoizedProps.value
            );
            break;
          case 13:
            var state = workInProgress2.memoizedState;
            if (null !== state) {
              if (null !== state.dehydrated)
                return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags |= 128, null;
              if (0 !== (renderLanes2 & workInProgress2.child.childLanes))
                return updateSuspenseComponent(current, workInProgress2, renderLanes2);
              pushPrimaryTreeSuspenseHandler(workInProgress2);
              current = bailoutOnAlreadyFinishedWork(
                current,
                workInProgress2,
                renderLanes2
              );
              return null !== current ? current.sibling : null;
            }
            pushPrimaryTreeSuspenseHandler(workInProgress2);
            break;
          case 19:
            var didSuspendBefore = 0 !== (current.flags & 128);
            state = 0 !== (renderLanes2 & workInProgress2.childLanes);
            state || (propagateParentContextChanges(
              current,
              workInProgress2,
              renderLanes2,
              false
            ), state = 0 !== (renderLanes2 & workInProgress2.childLanes));
            if (didSuspendBefore) {
              if (state)
                return updateSuspenseListComponent(
                  current,
                  workInProgress2,
                  renderLanes2
                );
              workInProgress2.flags |= 128;
            }
            didSuspendBefore = workInProgress2.memoizedState;
            null !== didSuspendBefore && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
            push(suspenseStackCursor, suspenseStackCursor.current);
            if (state) break;
            else return null;
          case 22:
          case 23:
            return workInProgress2.lanes = 0, updateOffscreenComponent(current, workInProgress2, renderLanes2);
          case 24:
            pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
        }
        return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
      }
      function beginWork(current, workInProgress2, renderLanes2) {
        if (null !== current)
          if (current.memoizedProps !== workInProgress2.pendingProps)
            didReceiveUpdate = true;
          else {
            if (!checkScheduledUpdateOrContext(current, renderLanes2) && 0 === (workInProgress2.flags & 128))
              return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(
                current,
                workInProgress2,
                renderLanes2
              );
            didReceiveUpdate = 0 !== (current.flags & 131072) ? true : false;
          }
        else
          didReceiveUpdate = false, isHydrating && 0 !== (workInProgress2.flags & 1048576) && pushTreeId(workInProgress2, treeForkCount, workInProgress2.index);
        workInProgress2.lanes = 0;
        switch (workInProgress2.tag) {
          case 16:
            a: {
              current = workInProgress2.pendingProps;
              var lazyComponent = workInProgress2.elementType, init = lazyComponent._init;
              lazyComponent = init(lazyComponent._payload);
              workInProgress2.type = lazyComponent;
              if ("function" === typeof lazyComponent)
                shouldConstruct(lazyComponent) ? (current = resolveClassComponentProps(lazyComponent, current), workInProgress2.tag = 1, workInProgress2 = updateClassComponent(
                  null,
                  workInProgress2,
                  lazyComponent,
                  current,
                  renderLanes2
                )) : (workInProgress2.tag = 0, workInProgress2 = updateFunctionComponent(
                  null,
                  workInProgress2,
                  lazyComponent,
                  current,
                  renderLanes2
                ));
              else {
                if (void 0 !== lazyComponent && null !== lazyComponent) {
                  if (init = lazyComponent.$$typeof, init === REACT_FORWARD_REF_TYPE) {
                    workInProgress2.tag = 11;
                    workInProgress2 = updateForwardRef(
                      null,
                      workInProgress2,
                      lazyComponent,
                      current,
                      renderLanes2
                    );
                    break a;
                  } else if (init === REACT_MEMO_TYPE) {
                    workInProgress2.tag = 14;
                    workInProgress2 = updateMemoComponent(
                      null,
                      workInProgress2,
                      lazyComponent,
                      current,
                      renderLanes2
                    );
                    break a;
                  }
                }
                workInProgress2 = getComponentNameFromType(lazyComponent) || lazyComponent;
                throw Error(formatProdErrorMessage(306, workInProgress2, ""));
              }
            }
            return workInProgress2;
          case 0:
            return updateFunctionComponent(
              current,
              workInProgress2,
              workInProgress2.type,
              workInProgress2.pendingProps,
              renderLanes2
            );
          case 1:
            return lazyComponent = workInProgress2.type, init = resolveClassComponentProps(
              lazyComponent,
              workInProgress2.pendingProps
            ), updateClassComponent(
              current,
              workInProgress2,
              lazyComponent,
              init,
              renderLanes2
            );
          case 3:
            a: {
              pushHostContainer(
                workInProgress2,
                workInProgress2.stateNode.containerInfo
              );
              if (null === current) throw Error(formatProdErrorMessage(387));
              var nextProps = workInProgress2.pendingProps;
              init = workInProgress2.memoizedState;
              lazyComponent = init.element;
              cloneUpdateQueue(current, workInProgress2);
              processUpdateQueue(workInProgress2, nextProps, null, renderLanes2);
              var nextState = workInProgress2.memoizedState;
              nextProps = nextState.cache;
              pushProvider(workInProgress2, CacheContext, nextProps);
              nextProps !== init.cache && propagateContextChanges(
                workInProgress2,
                [CacheContext],
                renderLanes2,
                true
              );
              suspendIfUpdateReadFromEntangledAsyncAction();
              nextProps = nextState.element;
              if (init.isDehydrated)
                if (init = {
                  element: nextProps,
                  isDehydrated: false,
                  cache: nextState.cache
                }, workInProgress2.updateQueue.baseState = init, workInProgress2.memoizedState = init, workInProgress2.flags & 256) {
                  workInProgress2 = mountHostRootWithoutHydrating(
                    current,
                    workInProgress2,
                    nextProps,
                    renderLanes2
                  );
                  break a;
                } else if (nextProps !== lazyComponent) {
                  lazyComponent = createCapturedValueAtFiber(
                    Error(formatProdErrorMessage(424)),
                    workInProgress2
                  );
                  queueHydrationError(lazyComponent);
                  workInProgress2 = mountHostRootWithoutHydrating(
                    current,
                    workInProgress2,
                    nextProps,
                    renderLanes2
                  );
                  break a;
                } else
                  for (nextHydratableInstance = getNextHydratable(
                    workInProgress2.stateNode.containerInfo.firstChild
                  ), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = true, renderLanes2 = mountChildFibers(
                    workInProgress2,
                    null,
                    nextProps,
                    renderLanes2
                  ), workInProgress2.child = renderLanes2; renderLanes2; )
                    renderLanes2.flags = renderLanes2.flags & -3 | 4096, renderLanes2 = renderLanes2.sibling;
              else {
                resetHydrationState();
                if (nextProps === lazyComponent) {
                  workInProgress2 = bailoutOnAlreadyFinishedWork(
                    current,
                    workInProgress2,
                    renderLanes2
                  );
                  break a;
                }
                reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
              }
              workInProgress2 = workInProgress2.child;
            }
            return workInProgress2;
          case 26:
            return markRef(current, workInProgress2), null === current ? (renderLanes2 = getResource(
              workInProgress2.type,
              null,
              workInProgress2.pendingProps,
              null
            )) ? workInProgress2.memoizedState = renderLanes2 : isHydrating || (renderLanes2 = workInProgress2.type, current = workInProgress2.pendingProps, lazyComponent = getOwnerDocumentFromRootContainer(
              rootInstanceStackCursor.current
            ).createElement(renderLanes2), lazyComponent[internalInstanceKey] = workInProgress2, lazyComponent[internalPropsKey] = current, setInitialProperties(lazyComponent, renderLanes2, current), markNodeAsHoistable(lazyComponent), workInProgress2.stateNode = lazyComponent) : workInProgress2.memoizedState = getResource(
              workInProgress2.type,
              current.memoizedProps,
              workInProgress2.pendingProps,
              current.memoizedState
            ), null;
          case 27:
            return pushHostContext(workInProgress2), null === current && isHydrating && (lazyComponent = workInProgress2.stateNode = resolveSingletonInstance(
              workInProgress2.type,
              workInProgress2.pendingProps,
              rootInstanceStackCursor.current
            ), hydrationParentFiber = workInProgress2, rootOrSingletonContext = true, nextHydratableInstance = getNextHydratable(
              lazyComponent.firstChild
            )), lazyComponent = workInProgress2.pendingProps.children, null !== current || isHydrating ? reconcileChildren(
              current,
              workInProgress2,
              lazyComponent,
              renderLanes2
            ) : workInProgress2.child = reconcileChildFibers(
              workInProgress2,
              null,
              lazyComponent,
              renderLanes2
            ), markRef(current, workInProgress2), workInProgress2.child;
          case 5:
            if (null === current && isHydrating) {
              if (init = lazyComponent = nextHydratableInstance)
                lazyComponent = canHydrateInstance(
                  lazyComponent,
                  workInProgress2.type,
                  workInProgress2.pendingProps,
                  rootOrSingletonContext
                ), null !== lazyComponent ? (workInProgress2.stateNode = lazyComponent, hydrationParentFiber = workInProgress2, nextHydratableInstance = getNextHydratable(
                  lazyComponent.firstChild
                ), rootOrSingletonContext = false, init = true) : init = false;
              init || throwOnHydrationMismatch(workInProgress2);
            }
            pushHostContext(workInProgress2);
            init = workInProgress2.type;
            nextProps = workInProgress2.pendingProps;
            nextState = null !== current ? current.memoizedProps : null;
            lazyComponent = nextProps.children;
            shouldSetTextContent(init, nextProps) ? lazyComponent = null : null !== nextState && shouldSetTextContent(init, nextState) && (workInProgress2.flags |= 32);
            null !== workInProgress2.memoizedState && (init = renderWithHooks(
              current,
              workInProgress2,
              TransitionAwareHostComponent,
              null,
              null,
              renderLanes2
            ), HostTransitionContext._currentValue = init);
            markRef(current, workInProgress2);
            reconcileChildren(current, workInProgress2, lazyComponent, renderLanes2);
            return workInProgress2.child;
          case 6:
            if (null === current && isHydrating) {
              if (current = renderLanes2 = nextHydratableInstance)
                renderLanes2 = canHydrateTextInstance(
                  renderLanes2,
                  workInProgress2.pendingProps,
                  rootOrSingletonContext
                ), null !== renderLanes2 ? (workInProgress2.stateNode = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, current = true) : current = false;
              current || throwOnHydrationMismatch(workInProgress2);
            }
            return null;
          case 13:
            return updateSuspenseComponent(current, workInProgress2, renderLanes2);
          case 4:
            return pushHostContainer(
              workInProgress2,
              workInProgress2.stateNode.containerInfo
            ), lazyComponent = workInProgress2.pendingProps, null === current ? workInProgress2.child = reconcileChildFibers(
              workInProgress2,
              null,
              lazyComponent,
              renderLanes2
            ) : reconcileChildren(
              current,
              workInProgress2,
              lazyComponent,
              renderLanes2
            ), workInProgress2.child;
          case 11:
            return updateForwardRef(
              current,
              workInProgress2,
              workInProgress2.type,
              workInProgress2.pendingProps,
              renderLanes2
            );
          case 7:
            return reconcileChildren(
              current,
              workInProgress2,
              workInProgress2.pendingProps,
              renderLanes2
            ), workInProgress2.child;
          case 8:
            return reconcileChildren(
              current,
              workInProgress2,
              workInProgress2.pendingProps.children,
              renderLanes2
            ), workInProgress2.child;
          case 12:
            return reconcileChildren(
              current,
              workInProgress2,
              workInProgress2.pendingProps.children,
              renderLanes2
            ), workInProgress2.child;
          case 10:
            return lazyComponent = workInProgress2.pendingProps, pushProvider(workInProgress2, workInProgress2.type, lazyComponent.value), reconcileChildren(
              current,
              workInProgress2,
              lazyComponent.children,
              renderLanes2
            ), workInProgress2.child;
          case 9:
            return init = workInProgress2.type._context, lazyComponent = workInProgress2.pendingProps.children, prepareToReadContext(workInProgress2), init = readContext(init), lazyComponent = lazyComponent(init), workInProgress2.flags |= 1, reconcileChildren(current, workInProgress2, lazyComponent, renderLanes2), workInProgress2.child;
          case 14:
            return updateMemoComponent(
              current,
              workInProgress2,
              workInProgress2.type,
              workInProgress2.pendingProps,
              renderLanes2
            );
          case 15:
            return updateSimpleMemoComponent(
              current,
              workInProgress2,
              workInProgress2.type,
              workInProgress2.pendingProps,
              renderLanes2
            );
          case 19:
            return updateSuspenseListComponent(current, workInProgress2, renderLanes2);
          case 22:
            return updateOffscreenComponent(current, workInProgress2, renderLanes2);
          case 24:
            return prepareToReadContext(workInProgress2), lazyComponent = readContext(CacheContext), null === current ? (init = peekCacheFromPool(), null === init && (init = workInProgressRoot, nextProps = createCache(), init.pooledCache = nextProps, nextProps.refCount++, null !== nextProps && (init.pooledCacheLanes |= renderLanes2), init = nextProps), workInProgress2.memoizedState = {
              parent: lazyComponent,
              cache: init
            }, initializeUpdateQueue(workInProgress2), pushProvider(workInProgress2, CacheContext, init)) : (0 !== (current.lanes & renderLanes2) && (cloneUpdateQueue(current, workInProgress2), processUpdateQueue(workInProgress2, null, null, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction()), init = current.memoizedState, nextProps = workInProgress2.memoizedState, init.parent !== lazyComponent ? (init = { parent: lazyComponent, cache: lazyComponent }, workInProgress2.memoizedState = init, 0 === workInProgress2.lanes && (workInProgress2.memoizedState = workInProgress2.updateQueue.baseState = init), pushProvider(workInProgress2, CacheContext, lazyComponent)) : (lazyComponent = nextProps.cache, pushProvider(workInProgress2, CacheContext, lazyComponent), lazyComponent !== init.cache && propagateContextChanges(
              workInProgress2,
              [CacheContext],
              renderLanes2,
              true
            ))), reconcileChildren(
              current,
              workInProgress2,
              workInProgress2.pendingProps.children,
              renderLanes2
            ), workInProgress2.child;
          case 29:
            throw workInProgress2.pendingProps;
        }
        throw Error(formatProdErrorMessage(156, workInProgress2.tag));
      }
      var valueCursor = createCursor(null);
      var currentlyRenderingFiber = null;
      var lastContextDependency = null;
      function pushProvider(providerFiber, context, nextValue) {
        push(valueCursor, context._currentValue);
        context._currentValue = nextValue;
      }
      function popProvider(context) {
        context._currentValue = valueCursor.current;
        pop(valueCursor);
      }
      function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
        for (; null !== parent; ) {
          var alternate = parent.alternate;
          (parent.childLanes & renderLanes2) !== renderLanes2 ? (parent.childLanes |= renderLanes2, null !== alternate && (alternate.childLanes |= renderLanes2)) : null !== alternate && (alternate.childLanes & renderLanes2) !== renderLanes2 && (alternate.childLanes |= renderLanes2);
          if (parent === propagationRoot) break;
          parent = parent.return;
        }
      }
      function propagateContextChanges(workInProgress2, contexts, renderLanes2, forcePropagateEntireTree) {
        var fiber = workInProgress2.child;
        null !== fiber && (fiber.return = workInProgress2);
        for (; null !== fiber; ) {
          var list = fiber.dependencies;
          if (null !== list) {
            var nextFiber = fiber.child;
            list = list.firstContext;
            a: for (; null !== list; ) {
              var dependency = list;
              list = fiber;
              for (var i8 = 0; i8 < contexts.length; i8++)
                if (dependency.context === contexts[i8]) {
                  list.lanes |= renderLanes2;
                  dependency = list.alternate;
                  null !== dependency && (dependency.lanes |= renderLanes2);
                  scheduleContextWorkOnParentPath(
                    list.return,
                    renderLanes2,
                    workInProgress2
                  );
                  forcePropagateEntireTree || (nextFiber = null);
                  break a;
                }
              list = dependency.next;
            }
          } else if (18 === fiber.tag) {
            nextFiber = fiber.return;
            if (null === nextFiber) throw Error(formatProdErrorMessage(341));
            nextFiber.lanes |= renderLanes2;
            list = nextFiber.alternate;
            null !== list && (list.lanes |= renderLanes2);
            scheduleContextWorkOnParentPath(nextFiber, renderLanes2, workInProgress2);
            nextFiber = null;
          } else nextFiber = fiber.child;
          if (null !== nextFiber) nextFiber.return = fiber;
          else
            for (nextFiber = fiber; null !== nextFiber; ) {
              if (nextFiber === workInProgress2) {
                nextFiber = null;
                break;
              }
              fiber = nextFiber.sibling;
              if (null !== fiber) {
                fiber.return = nextFiber.return;
                nextFiber = fiber;
                break;
              }
              nextFiber = nextFiber.return;
            }
          fiber = nextFiber;
        }
      }
      function propagateParentContextChanges(current, workInProgress2, renderLanes2, forcePropagateEntireTree) {
        current = null;
        for (var parent = workInProgress2, isInsidePropagationBailout = false; null !== parent; ) {
          if (!isInsidePropagationBailout) {
            if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = true;
            else if (0 !== (parent.flags & 262144)) break;
          }
          if (10 === parent.tag) {
            var currentParent = parent.alternate;
            if (null === currentParent) throw Error(formatProdErrorMessage(387));
            currentParent = currentParent.memoizedProps;
            if (null !== currentParent) {
              var context = parent.type;
              objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
            }
          } else if (parent === hostTransitionProviderCursor.current) {
            currentParent = parent.alternate;
            if (null === currentParent) throw Error(formatProdErrorMessage(387));
            currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
          }
          parent = parent.return;
        }
        null !== current && propagateContextChanges(
          workInProgress2,
          current,
          renderLanes2,
          forcePropagateEntireTree
        );
        workInProgress2.flags |= 262144;
      }
      function checkIfContextChanged(currentDependencies) {
        for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies; ) {
          if (!objectIs(
            currentDependencies.context._currentValue,
            currentDependencies.memoizedValue
          ))
            return true;
          currentDependencies = currentDependencies.next;
        }
        return false;
      }
      function prepareToReadContext(workInProgress2) {
        currentlyRenderingFiber = workInProgress2;
        lastContextDependency = null;
        workInProgress2 = workInProgress2.dependencies;
        null !== workInProgress2 && (workInProgress2.firstContext = null);
      }
      function readContext(context) {
        return readContextForConsumer(currentlyRenderingFiber, context);
      }
      function readContextDuringReconciliation(consumer, context) {
        null === currentlyRenderingFiber && prepareToReadContext(consumer);
        return readContextForConsumer(consumer, context);
      }
      function readContextForConsumer(consumer, context) {
        var value = context._currentValue;
        context = { context, memoizedValue: value, next: null };
        if (null === lastContextDependency) {
          if (null === consumer) throw Error(formatProdErrorMessage(308));
          lastContextDependency = context;
          consumer.dependencies = { lanes: 0, firstContext: context };
          consumer.flags |= 524288;
        } else lastContextDependency = lastContextDependency.next = context;
        return value;
      }
      var hasForceUpdate = false;
      function initializeUpdateQueue(fiber) {
        fiber.updateQueue = {
          baseState: fiber.memoizedState,
          firstBaseUpdate: null,
          lastBaseUpdate: null,
          shared: { pending: null, lanes: 0, hiddenCallbacks: null },
          callbacks: null
        };
      }
      function cloneUpdateQueue(current, workInProgress2) {
        current = current.updateQueue;
        workInProgress2.updateQueue === current && (workInProgress2.updateQueue = {
          baseState: current.baseState,
          firstBaseUpdate: current.firstBaseUpdate,
          lastBaseUpdate: current.lastBaseUpdate,
          shared: current.shared,
          callbacks: null
        });
      }
      function createUpdate(lane) {
        return { lane, tag: 0, payload: null, callback: null, next: null };
      }
      function enqueueUpdate(fiber, update, lane) {
        var updateQueue = fiber.updateQueue;
        if (null === updateQueue) return null;
        updateQueue = updateQueue.shared;
        if (0 !== (executionContext & 2)) {
          var pending = updateQueue.pending;
          null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
          updateQueue.pending = update;
          update = getRootForUpdatedFiber(fiber);
          markUpdateLaneFromFiberToRoot(fiber, null, lane);
          return update;
        }
        enqueueUpdate$1(fiber, updateQueue, update, lane);
        return getRootForUpdatedFiber(fiber);
      }
      function entangleTransitions(root3, fiber, lane) {
        fiber = fiber.updateQueue;
        if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194176))) {
          var queueLanes = fiber.lanes;
          queueLanes &= root3.pendingLanes;
          lane |= queueLanes;
          fiber.lanes = lane;
          markRootEntangled(root3, lane);
        }
      }
      function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
        var queue = workInProgress2.updateQueue, current = workInProgress2.alternate;
        if (null !== current && (current = current.updateQueue, queue === current)) {
          var newFirst = null, newLast = null;
          queue = queue.firstBaseUpdate;
          if (null !== queue) {
            do {
              var clone = {
                lane: queue.lane,
                tag: queue.tag,
                payload: queue.payload,
                callback: null,
                next: null
              };
              null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
              queue = queue.next;
            } while (null !== queue);
            null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
          } else newFirst = newLast = capturedUpdate;
          queue = {
            baseState: current.baseState,
            firstBaseUpdate: newFirst,
            lastBaseUpdate: newLast,
            shared: current.shared,
            callbacks: current.callbacks
          };
          workInProgress2.updateQueue = queue;
          return;
        }
        workInProgress2 = queue.lastBaseUpdate;
        null === workInProgress2 ? queue.firstBaseUpdate = capturedUpdate : workInProgress2.next = capturedUpdate;
        queue.lastBaseUpdate = capturedUpdate;
      }
      var didReadFromEntangledAsyncAction = false;
      function suspendIfUpdateReadFromEntangledAsyncAction() {
        if (didReadFromEntangledAsyncAction) {
          var entangledActionThenable = currentEntangledActionThenable;
          if (null !== entangledActionThenable) throw entangledActionThenable;
        }
      }
      function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes2) {
        didReadFromEntangledAsyncAction = false;
        var queue = workInProgress$jscomp$0.updateQueue;
        hasForceUpdate = false;
        var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
        if (null !== pendingQueue) {
          queue.shared.pending = null;
          var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
          lastPendingUpdate.next = null;
          null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
          lastBaseUpdate = lastPendingUpdate;
          var current = workInProgress$jscomp$0.alternate;
          null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
        }
        if (null !== firstBaseUpdate) {
          var newState = queue.baseState;
          lastBaseUpdate = 0;
          current = firstPendingUpdate = lastPendingUpdate = null;
          pendingQueue = firstBaseUpdate;
          do {
            var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
            if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes2 & updateLane) === updateLane) {
              0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
              null !== current && (current = current.next = {
                lane: 0,
                tag: pendingQueue.tag,
                payload: pendingQueue.payload,
                callback: null,
                next: null
              });
              a: {
                var workInProgress2 = workInProgress$jscomp$0, update = pendingQueue;
                updateLane = props;
                var instance = instance$jscomp$0;
                switch (update.tag) {
                  case 1:
                    workInProgress2 = update.payload;
                    if ("function" === typeof workInProgress2) {
                      newState = workInProgress2.call(instance, newState, updateLane);
                      break a;
                    }
                    newState = workInProgress2;
                    break a;
                  case 3:
                    workInProgress2.flags = workInProgress2.flags & -65537 | 128;
                  case 0:
                    workInProgress2 = update.payload;
                    updateLane = "function" === typeof workInProgress2 ? workInProgress2.call(instance, newState, updateLane) : workInProgress2;
                    if (null === updateLane || void 0 === updateLane) break a;
                    newState = assign({}, newState, updateLane);
                    break a;
                  case 2:
                    hasForceUpdate = true;
                }
              }
              updateLane = pendingQueue.callback;
              null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
            } else
              isHiddenUpdate = {
                lane: updateLane,
                tag: pendingQueue.tag,
                payload: pendingQueue.payload,
                callback: pendingQueue.callback,
                next: null
              }, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
            pendingQueue = pendingQueue.next;
            if (null === pendingQueue)
              if (pendingQueue = queue.shared.pending, null === pendingQueue)
                break;
              else
                isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
          } while (1);
          null === current && (lastPendingUpdate = newState);
          queue.baseState = lastPendingUpdate;
          queue.firstBaseUpdate = firstPendingUpdate;
          queue.lastBaseUpdate = current;
          null === firstBaseUpdate && (queue.shared.lanes = 0);
          workInProgressRootSkippedLanes |= lastBaseUpdate;
          workInProgress$jscomp$0.lanes = lastBaseUpdate;
          workInProgress$jscomp$0.memoizedState = newState;
        }
      }
      function callCallback(callback, context) {
        if ("function" !== typeof callback)
          throw Error(formatProdErrorMessage(191, callback));
        callback.call(context);
      }
      function commitCallbacks(updateQueue, context) {
        var callbacks = updateQueue.callbacks;
        if (null !== callbacks)
          for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++)
            callCallback(callbacks[updateQueue], context);
      }
      function commitHookEffectListMount(flags, finishedWork) {
        try {
          var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
          if (null !== lastEffect) {
            var firstEffect = lastEffect.next;
            updateQueue = firstEffect;
            do {
              if ((updateQueue.tag & flags) === flags) {
                lastEffect = void 0;
                var create = updateQueue.create, inst = updateQueue.inst;
                lastEffect = create();
                inst.destroy = lastEffect;
              }
              updateQueue = updateQueue.next;
            } while (updateQueue !== firstEffect);
          }
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
        try {
          var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
          if (null !== lastEffect) {
            var firstEffect = lastEffect.next;
            updateQueue = firstEffect;
            do {
              if ((updateQueue.tag & flags) === flags) {
                var inst = updateQueue.inst, destroy = inst.destroy;
                if (void 0 !== destroy) {
                  inst.destroy = void 0;
                  lastEffect = finishedWork;
                  var nearestMountedAncestor = nearestMountedAncestor$jscomp$0;
                  try {
                    destroy();
                  } catch (error) {
                    captureCommitPhaseError(
                      lastEffect,
                      nearestMountedAncestor,
                      error
                    );
                  }
                }
              }
              updateQueue = updateQueue.next;
            } while (updateQueue !== firstEffect);
          }
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      function commitClassCallbacks(finishedWork) {
        var updateQueue = finishedWork.updateQueue;
        if (null !== updateQueue) {
          var instance = finishedWork.stateNode;
          try {
            commitCallbacks(updateQueue, instance);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
      }
      function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
        instance.props = resolveClassComponentProps(
          current.type,
          current.memoizedProps
        );
        instance.state = current.memoizedState;
        try {
          instance.componentWillUnmount();
        } catch (error) {
          captureCommitPhaseError(current, nearestMountedAncestor, error);
        }
      }
      function safelyAttachRef(current, nearestMountedAncestor) {
        try {
          var ref = current.ref;
          if (null !== ref) {
            var instance = current.stateNode;
            switch (current.tag) {
              case 26:
              case 27:
              case 5:
                var instanceToUse = instance;
                break;
              default:
                instanceToUse = instance;
            }
            "function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
          }
        } catch (error) {
          captureCommitPhaseError(current, nearestMountedAncestor, error);
        }
      }
      function safelyDetachRef(current, nearestMountedAncestor) {
        var ref = current.ref, refCleanup = current.refCleanup;
        if (null !== ref)
          if ("function" === typeof refCleanup)
            try {
              refCleanup();
            } catch (error) {
              captureCommitPhaseError(current, nearestMountedAncestor, error);
            } finally {
              current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
            }
          else if ("function" === typeof ref)
            try {
              ref(null);
            } catch (error$112) {
              captureCommitPhaseError(current, nearestMountedAncestor, error$112);
            }
          else ref.current = null;
      }
      function commitHostMount(finishedWork) {
        var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
        try {
          a: switch (type) {
            case "button":
            case "input":
            case "select":
            case "textarea":
              props.autoFocus && instance.focus();
              break a;
            case "img":
              props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
          }
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      function commitHostUpdate(finishedWork, newProps, oldProps) {
        try {
          var domElement = finishedWork.stateNode;
          updateProperties(domElement, finishedWork.type, oldProps, newProps);
          domElement[internalPropsKey] = newProps;
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      function isHostParent(fiber) {
        return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag || 4 === fiber.tag;
      }
      function getHostSibling(fiber) {
        a: for (; ; ) {
          for (; null === fiber.sibling; ) {
            if (null === fiber.return || isHostParent(fiber.return)) return null;
            fiber = fiber.return;
          }
          fiber.sibling.return = fiber.return;
          for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 27 !== fiber.tag && 18 !== fiber.tag; ) {
            if (fiber.flags & 2) continue a;
            if (null === fiber.child || 4 === fiber.tag) continue a;
            else fiber.child.return = fiber, fiber = fiber.child;
          }
          if (!(fiber.flags & 2)) return fiber.stateNode;
        }
      }
      function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
        var tag = node.tag;
        if (5 === tag || 6 === tag)
          node = node.stateNode, before ? 8 === parent.nodeType ? parent.parentNode.insertBefore(node, before) : parent.insertBefore(node, before) : (8 === parent.nodeType ? (before = parent.parentNode, before.insertBefore(node, parent)) : (before = parent, before.appendChild(node)), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1));
        else if (4 !== tag && 27 !== tag && (node = node.child, null !== node))
          for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling; null !== node; )
            insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
      }
      function insertOrAppendPlacementNode(node, before, parent) {
        var tag = node.tag;
        if (5 === tag || 6 === tag)
          node = node.stateNode, before ? parent.insertBefore(node, before) : parent.appendChild(node);
        else if (4 !== tag && 27 !== tag && (node = node.child, null !== node))
          for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling; null !== node; )
            insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
      }
      var offscreenSubtreeIsHidden = false;
      var offscreenSubtreeWasHidden = false;
      var needsFormReset = false;
      var PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set;
      var nextEffect = null;
      var shouldFireAfterActiveInstanceBlur = false;
      function commitBeforeMutationEffects(root3, firstChild) {
        root3 = root3.containerInfo;
        eventsEnabled = _enabled;
        root3 = getActiveElementDeep(root3);
        if (hasSelectionCapabilities(root3)) {
          if ("selectionStart" in root3)
            var JSCompiler_temp = {
              start: root3.selectionStart,
              end: root3.selectionEnd
            };
          else
            a: {
              JSCompiler_temp = (JSCompiler_temp = root3.ownerDocument) && JSCompiler_temp.defaultView || window;
              var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
              if (selection && 0 !== selection.rangeCount) {
                JSCompiler_temp = selection.anchorNode;
                var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
                selection = selection.focusOffset;
                try {
                  JSCompiler_temp.nodeType, focusNode.nodeType;
                } catch (e$20) {
                  JSCompiler_temp = null;
                  break a;
                }
                var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root3, parentNode = null;
                b: for (; ; ) {
                  for (var next; ; ) {
                    node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
                    node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
                    3 === node.nodeType && (length += node.nodeValue.length);
                    if (null === (next = node.firstChild)) break;
                    parentNode = node;
                    node = next;
                  }
                  for (; ; ) {
                    if (node === root3) break b;
                    parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
                    parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
                    if (null !== (next = node.nextSibling)) break;
                    node = parentNode;
                    parentNode = node.parentNode;
                  }
                  node = next;
                }
                JSCompiler_temp = -1 === start || -1 === end ? null : { start, end };
              } else JSCompiler_temp = null;
            }
          JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
        } else JSCompiler_temp = null;
        selectionInformation = { focusedElem: root3, selectionRange: JSCompiler_temp };
        _enabled = false;
        for (nextEffect = firstChild; null !== nextEffect; )
          if (firstChild = nextEffect, root3 = firstChild.child, 0 !== (firstChild.subtreeFlags & 1028) && null !== root3)
            root3.return = firstChild, nextEffect = root3;
          else
            for (; null !== nextEffect; ) {
              firstChild = nextEffect;
              focusNode = firstChild.alternate;
              root3 = firstChild.flags;
              switch (firstChild.tag) {
                case 0:
                  break;
                case 11:
                case 15:
                  break;
                case 1:
                  if (0 !== (root3 & 1024) && null !== focusNode) {
                    root3 = void 0;
                    JSCompiler_temp = firstChild;
                    anchorOffset = focusNode.memoizedProps;
                    focusNode = focusNode.memoizedState;
                    selection = JSCompiler_temp.stateNode;
                    try {
                      var resolvedPrevProps = resolveClassComponentProps(
                        JSCompiler_temp.type,
                        anchorOffset,
                        JSCompiler_temp.elementType === JSCompiler_temp.type
                      );
                      root3 = selection.getSnapshotBeforeUpdate(
                        resolvedPrevProps,
                        focusNode
                      );
                      selection.__reactInternalSnapshotBeforeUpdate = root3;
                    } catch (error) {
                      captureCommitPhaseError(
                        JSCompiler_temp,
                        JSCompiler_temp.return,
                        error
                      );
                    }
                  }
                  break;
                case 3:
                  if (0 !== (root3 & 1024)) {
                    if (root3 = firstChild.stateNode.containerInfo, JSCompiler_temp = root3.nodeType, 9 === JSCompiler_temp)
                      clearContainerSparingly(root3);
                    else if (1 === JSCompiler_temp)
                      switch (root3.nodeName) {
                        case "HEAD":
                        case "HTML":
                        case "BODY":
                          clearContainerSparingly(root3);
                          break;
                        default:
                          root3.textContent = "";
                      }
                  }
                  break;
                case 5:
                case 26:
                case 27:
                case 6:
                case 4:
                case 17:
                  break;
                default:
                  if (0 !== (root3 & 1024)) throw Error(formatProdErrorMessage(163));
              }
              root3 = firstChild.sibling;
              if (null !== root3) {
                root3.return = firstChild.return;
                nextEffect = root3;
                break;
              }
              nextEffect = firstChild.return;
            }
        resolvedPrevProps = shouldFireAfterActiveInstanceBlur;
        shouldFireAfterActiveInstanceBlur = false;
        return resolvedPrevProps;
      }
      function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
        var flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 15:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            flags & 4 && commitHookEffectListMount(5, finishedWork);
            break;
          case 1:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            if (flags & 4)
              if (finishedRoot = finishedWork.stateNode, null === current)
                try {
                  finishedRoot.componentDidMount();
                } catch (error) {
                  captureCommitPhaseError(finishedWork, finishedWork.return, error);
                }
              else {
                var prevProps = resolveClassComponentProps(
                  finishedWork.type,
                  current.memoizedProps
                );
                current = current.memoizedState;
                try {
                  finishedRoot.componentDidUpdate(
                    prevProps,
                    current,
                    finishedRoot.__reactInternalSnapshotBeforeUpdate
                  );
                } catch (error$111) {
                  captureCommitPhaseError(
                    finishedWork,
                    finishedWork.return,
                    error$111
                  );
                }
              }
            flags & 64 && commitClassCallbacks(finishedWork);
            flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 3:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            if (flags & 64 && (flags = finishedWork.updateQueue, null !== flags)) {
              finishedRoot = null;
              if (null !== finishedWork.child)
                switch (finishedWork.child.tag) {
                  case 27:
                  case 5:
                    finishedRoot = finishedWork.child.stateNode;
                    break;
                  case 1:
                    finishedRoot = finishedWork.child.stateNode;
                }
              try {
                commitCallbacks(flags, finishedRoot);
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            }
            break;
          case 26:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 27:
          case 5:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            null === current && flags & 4 && commitHostMount(finishedWork);
            flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 12:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            break;
          case 13:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
            break;
          case 22:
            prevProps = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
            if (!prevProps) {
              current = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
              var prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
              offscreenSubtreeIsHidden = prevProps;
              (offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                0 !== (finishedWork.subtreeFlags & 8772)
              ) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
              offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
              offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
            }
            flags & 512 && ("manual" === finishedWork.memoizedProps.mode ? safelyAttachRef(finishedWork, finishedWork.return) : safelyDetachRef(finishedWork, finishedWork.return));
            break;
          default:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        }
      }
      function detachFiberAfterEffects(fiber) {
        var alternate = fiber.alternate;
        null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
        fiber.child = null;
        fiber.deletions = null;
        fiber.sibling = null;
        5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
        fiber.stateNode = null;
        fiber.return = null;
        fiber.dependencies = null;
        fiber.memoizedProps = null;
        fiber.memoizedState = null;
        fiber.pendingProps = null;
        fiber.stateNode = null;
        fiber.updateQueue = null;
      }
      var hostParent = null;
      var hostParentIsContainer = false;
      function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
        for (parent = parent.child; null !== parent; )
          commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
      }
      function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
        if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount)
          try {
            injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
          } catch (err) {
          }
        switch (deletedFiber.tag) {
          case 26:
            offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
            break;
          case 27:
            offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
            var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
            hostParent = deletedFiber.stateNode;
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            deletedFiber = deletedFiber.stateNode;
            for (nearestMountedAncestor = deletedFiber.attributes; nearestMountedAncestor.length; )
              deletedFiber.removeAttributeNode(nearestMountedAncestor[0]);
            detachDeletedInstance(deletedFiber);
            hostParent = prevHostParent;
            hostParentIsContainer = prevHostParentIsContainer;
            break;
          case 5:
            offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
          case 6:
            prevHostParentIsContainer = hostParent;
            var prevHostParentIsContainer$119 = hostParentIsContainer;
            hostParent = null;
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            hostParent = prevHostParentIsContainer;
            hostParentIsContainer = prevHostParentIsContainer$119;
            if (null !== hostParent)
              if (hostParentIsContainer)
                try {
                  finishedRoot = hostParent, prevHostParent = deletedFiber.stateNode, 8 === finishedRoot.nodeType ? finishedRoot.parentNode.removeChild(prevHostParent) : finishedRoot.removeChild(prevHostParent);
                } catch (error) {
                  captureCommitPhaseError(
                    deletedFiber,
                    nearestMountedAncestor,
                    error
                  );
                }
              else
                try {
                  hostParent.removeChild(deletedFiber.stateNode);
                } catch (error) {
                  captureCommitPhaseError(
                    deletedFiber,
                    nearestMountedAncestor,
                    error
                  );
                }
            break;
          case 18:
            null !== hostParent && (hostParentIsContainer ? (nearestMountedAncestor = hostParent, deletedFiber = deletedFiber.stateNode, 8 === nearestMountedAncestor.nodeType ? clearSuspenseBoundary(
              nearestMountedAncestor.parentNode,
              deletedFiber
            ) : 1 === nearestMountedAncestor.nodeType && clearSuspenseBoundary(nearestMountedAncestor, deletedFiber), retryIfBlockedOn(nearestMountedAncestor)) : clearSuspenseBoundary(hostParent, deletedFiber.stateNode));
            break;
          case 4:
            prevHostParent = hostParent;
            prevHostParentIsContainer = hostParentIsContainer;
            hostParent = deletedFiber.stateNode.containerInfo;
            hostParentIsContainer = true;
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            hostParent = prevHostParent;
            hostParentIsContainer = prevHostParentIsContainer;
            break;
          case 0:
          case 11:
          case 14:
          case 15:
            offscreenSubtreeWasHidden || commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
            offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            break;
          case 1:
            offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(
              deletedFiber,
              nearestMountedAncestor,
              prevHostParent
            ));
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            break;
          case 21:
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            break;
          case 22:
            offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
            offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            offscreenSubtreeWasHidden = prevHostParent;
            break;
          default:
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
        }
      }
      function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
        if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot))))
          try {
            retryIfBlockedOn(finishedRoot);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
      }
      function getRetryCache(finishedWork) {
        switch (finishedWork.tag) {
          case 13:
          case 19:
            var retryCache = finishedWork.stateNode;
            null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
            return retryCache;
          case 22:
            return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
          default:
            throw Error(formatProdErrorMessage(435, finishedWork.tag));
        }
      }
      function attachSuspenseRetryListeners(finishedWork, wakeables) {
        var retryCache = getRetryCache(finishedWork);
        wakeables.forEach(function(wakeable) {
          var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
          retryCache.has(wakeable) || (retryCache.add(wakeable), wakeable.then(retry, retry));
        });
      }
      function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
        var deletions = parentFiber.deletions;
        if (null !== deletions)
          for (var i8 = 0; i8 < deletions.length; i8++) {
            var childToDelete = deletions[i8], root3 = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
            a: for (; null !== parent; ) {
              switch (parent.tag) {
                case 27:
                case 5:
                  hostParent = parent.stateNode;
                  hostParentIsContainer = false;
                  break a;
                case 3:
                  hostParent = parent.stateNode.containerInfo;
                  hostParentIsContainer = true;
                  break a;
                case 4:
                  hostParent = parent.stateNode.containerInfo;
                  hostParentIsContainer = true;
                  break a;
              }
              parent = parent.return;
            }
            if (null === hostParent) throw Error(formatProdErrorMessage(160));
            commitDeletionEffectsOnFiber(root3, returnFiber, childToDelete);
            hostParent = null;
            hostParentIsContainer = false;
            root3 = childToDelete.alternate;
            null !== root3 && (root3.return = null);
            childToDelete.return = null;
          }
        if (parentFiber.subtreeFlags & 13878)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
      }
      var currentHoistableRoot = null;
      function commitMutationEffectsOnFiber(finishedWork, root3) {
        var current = finishedWork.alternate, flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            recursivelyTraverseMutationEffects(root3, finishedWork);
            commitReconciliationEffects(finishedWork);
            flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
            break;
          case 1:
            recursivelyTraverseMutationEffects(root3, finishedWork);
            commitReconciliationEffects(finishedWork);
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
            flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (flags = finishedWork.callbacks, null !== flags && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === current ? flags : current.concat(flags))));
            break;
          case 26:
            var hoistableRoot = currentHoistableRoot;
            recursivelyTraverseMutationEffects(root3, finishedWork);
            commitReconciliationEffects(finishedWork);
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
            if (flags & 4) {
              var currentResource = null !== current ? current.memoizedState : null;
              flags = finishedWork.memoizedState;
              if (null === current)
                if (null === flags)
                  if (null === finishedWork.stateNode) {
                    a: {
                      flags = finishedWork.type;
                      current = finishedWork.memoizedProps;
                      hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
                      b: switch (flags) {
                        case "title":
                          currentResource = hoistableRoot.getElementsByTagName("title")[0];
                          if (!currentResource || currentResource[internalHoistableMarker] || currentResource[internalInstanceKey] || "http://www.w3.org/2000/svg" === currentResource.namespaceURI || currentResource.hasAttribute("itemprop"))
                            currentResource = hoistableRoot.createElement(flags), hoistableRoot.head.insertBefore(
                              currentResource,
                              hoistableRoot.querySelector("head > title")
                            );
                          setInitialProperties(currentResource, flags, current);
                          currentResource[internalInstanceKey] = finishedWork;
                          markNodeAsHoistable(currentResource);
                          flags = currentResource;
                          break a;
                        case "link":
                          var maybeNodes = getHydratableHoistableCache(
                            "link",
                            "href",
                            hoistableRoot
                          ).get(flags + (current.href || ""));
                          if (maybeNodes) {
                            for (var i8 = 0; i8 < maybeNodes.length; i8++)
                              if (currentResource = maybeNodes[i8], currentResource.getAttribute("href") === (null == current.href ? null : current.href) && currentResource.getAttribute("rel") === (null == current.rel ? null : current.rel) && currentResource.getAttribute("title") === (null == current.title ? null : current.title) && currentResource.getAttribute("crossorigin") === (null == current.crossOrigin ? null : current.crossOrigin)) {
                                maybeNodes.splice(i8, 1);
                                break b;
                              }
                          }
                          currentResource = hoistableRoot.createElement(flags);
                          setInitialProperties(currentResource, flags, current);
                          hoistableRoot.head.appendChild(currentResource);
                          break;
                        case "meta":
                          if (maybeNodes = getHydratableHoistableCache(
                            "meta",
                            "content",
                            hoistableRoot
                          ).get(flags + (current.content || ""))) {
                            for (i8 = 0; i8 < maybeNodes.length; i8++)
                              if (currentResource = maybeNodes[i8], currentResource.getAttribute("content") === (null == current.content ? null : "" + current.content) && currentResource.getAttribute("name") === (null == current.name ? null : current.name) && currentResource.getAttribute("property") === (null == current.property ? null : current.property) && currentResource.getAttribute("http-equiv") === (null == current.httpEquiv ? null : current.httpEquiv) && currentResource.getAttribute("charset") === (null == current.charSet ? null : current.charSet)) {
                                maybeNodes.splice(i8, 1);
                                break b;
                              }
                          }
                          currentResource = hoistableRoot.createElement(flags);
                          setInitialProperties(currentResource, flags, current);
                          hoistableRoot.head.appendChild(currentResource);
                          break;
                        default:
                          throw Error(formatProdErrorMessage(468, flags));
                      }
                      currentResource[internalInstanceKey] = finishedWork;
                      markNodeAsHoistable(currentResource);
                      flags = currentResource;
                    }
                    finishedWork.stateNode = flags;
                  } else
                    mountHoistable(
                      hoistableRoot,
                      finishedWork.type,
                      finishedWork.stateNode
                    );
                else
                  finishedWork.stateNode = acquireResource(
                    hoistableRoot,
                    flags,
                    finishedWork.memoizedProps
                  );
              else
                currentResource !== flags ? (null === currentResource ? null !== current.stateNode && (current = current.stateNode, current.parentNode.removeChild(current)) : currentResource.count--, null === flags ? mountHoistable(
                  hoistableRoot,
                  finishedWork.type,
                  finishedWork.stateNode
                ) : acquireResource(
                  hoistableRoot,
                  flags,
                  finishedWork.memoizedProps
                )) : null === flags && null !== finishedWork.stateNode && commitHostUpdate(
                  finishedWork,
                  finishedWork.memoizedProps,
                  current.memoizedProps
                );
            }
            break;
          case 27:
            if (flags & 4 && null === finishedWork.alternate) {
              hoistableRoot = finishedWork.stateNode;
              currentResource = finishedWork.memoizedProps;
              try {
                for (var node = hoistableRoot.firstChild; node; ) {
                  var nextNode = node.nextSibling, nodeName = node.nodeName;
                  node[internalHoistableMarker] || "HEAD" === nodeName || "BODY" === nodeName || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node.rel.toLowerCase() || hoistableRoot.removeChild(node);
                  node = nextNode;
                }
                for (var type = finishedWork.type, attributes = hoistableRoot.attributes; attributes.length; )
                  hoistableRoot.removeAttributeNode(attributes[0]);
                setInitialProperties(hoistableRoot, type, currentResource);
                hoistableRoot[internalInstanceKey] = finishedWork;
                hoistableRoot[internalPropsKey] = currentResource;
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            }
          case 5:
            recursivelyTraverseMutationEffects(root3, finishedWork);
            commitReconciliationEffects(finishedWork);
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
            if (finishedWork.flags & 32) {
              hoistableRoot = finishedWork.stateNode;
              try {
                setTextContent(hoistableRoot, "");
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            }
            flags & 4 && null != finishedWork.stateNode && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(
              finishedWork,
              hoistableRoot,
              null !== current ? current.memoizedProps : hoistableRoot
            ));
            flags & 1024 && (needsFormReset = true);
            break;
          case 6:
            recursivelyTraverseMutationEffects(root3, finishedWork);
            commitReconciliationEffects(finishedWork);
            if (flags & 4) {
              if (null === finishedWork.stateNode)
                throw Error(formatProdErrorMessage(162));
              flags = finishedWork.memoizedProps;
              current = finishedWork.stateNode;
              try {
                current.nodeValue = flags;
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            }
            break;
          case 3:
            tagCaches = null;
            hoistableRoot = currentHoistableRoot;
            currentHoistableRoot = getHoistableRoot(root3.containerInfo);
            recursivelyTraverseMutationEffects(root3, finishedWork);
            currentHoistableRoot = hoistableRoot;
            commitReconciliationEffects(finishedWork);
            if (flags & 4 && null !== current && current.memoizedState.isDehydrated)
              try {
                retryIfBlockedOn(root3.containerInfo);
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
            break;
          case 4:
            flags = currentHoistableRoot;
            currentHoistableRoot = getHoistableRoot(
              finishedWork.stateNode.containerInfo
            );
            recursivelyTraverseMutationEffects(root3, finishedWork);
            commitReconciliationEffects(finishedWork);
            currentHoistableRoot = flags;
            break;
          case 12:
            recursivelyTraverseMutationEffects(root3, finishedWork);
            commitReconciliationEffects(finishedWork);
            break;
          case 13:
            recursivelyTraverseMutationEffects(root3, finishedWork);
            commitReconciliationEffects(finishedWork);
            finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
            flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
            break;
          case 22:
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
            node = null !== finishedWork.memoizedState;
            nextNode = null !== current && null !== current.memoizedState;
            nodeName = offscreenSubtreeIsHidden;
            type = offscreenSubtreeWasHidden;
            offscreenSubtreeIsHidden = nodeName || node;
            offscreenSubtreeWasHidden = type || nextNode;
            recursivelyTraverseMutationEffects(root3, finishedWork);
            offscreenSubtreeWasHidden = type;
            offscreenSubtreeIsHidden = nodeName;
            commitReconciliationEffects(finishedWork);
            root3 = finishedWork.stateNode;
            root3._current = finishedWork;
            root3._visibility &= -3;
            root3._visibility |= root3._pendingVisibility & 2;
            if (flags & 8192 && (root3._visibility = node ? root3._visibility & -2 : root3._visibility | 1, node && (root3 = offscreenSubtreeIsHidden || offscreenSubtreeWasHidden, null === current || nextNode || root3 || recursivelyTraverseDisappearLayoutEffects(finishedWork)), null === finishedWork.memoizedProps || "manual" !== finishedWork.memoizedProps.mode))
              a: for (current = null, root3 = finishedWork; ; ) {
                if (5 === root3.tag || 26 === root3.tag || 27 === root3.tag) {
                  if (null === current) {
                    nextNode = current = root3;
                    try {
                      if (hoistableRoot = nextNode.stateNode, node)
                        currentResource = hoistableRoot.style, "function" === typeof currentResource.setProperty ? currentResource.setProperty(
                          "display",
                          "none",
                          "important"
                        ) : currentResource.display = "none";
                      else {
                        maybeNodes = nextNode.stateNode;
                        i8 = nextNode.memoizedProps.style;
                        var display = void 0 !== i8 && null !== i8 && i8.hasOwnProperty("display") ? i8.display : null;
                        maybeNodes.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
                      }
                    } catch (error) {
                      captureCommitPhaseError(nextNode, nextNode.return, error);
                    }
                  }
                } else if (6 === root3.tag) {
                  if (null === current) {
                    nextNode = root3;
                    try {
                      nextNode.stateNode.nodeValue = node ? "" : nextNode.memoizedProps;
                    } catch (error) {
                      captureCommitPhaseError(nextNode, nextNode.return, error);
                    }
                  }
                } else if ((22 !== root3.tag && 23 !== root3.tag || null === root3.memoizedState || root3 === finishedWork) && null !== root3.child) {
                  root3.child.return = root3;
                  root3 = root3.child;
                  continue;
                }
                if (root3 === finishedWork) break a;
                for (; null === root3.sibling; ) {
                  if (null === root3.return || root3.return === finishedWork) break a;
                  current === root3 && (current = null);
                  root3 = root3.return;
                }
                current === root3 && (current = null);
                root3.sibling.return = root3.return;
                root3 = root3.sibling;
              }
            flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (current = flags.retryQueue, null !== current && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
            break;
          case 19:
            recursivelyTraverseMutationEffects(root3, finishedWork);
            commitReconciliationEffects(finishedWork);
            flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
            break;
          case 21:
            break;
          default:
            recursivelyTraverseMutationEffects(root3, finishedWork), commitReconciliationEffects(finishedWork);
        }
      }
      function commitReconciliationEffects(finishedWork) {
        var flags = finishedWork.flags;
        if (flags & 2) {
          try {
            if (27 !== finishedWork.tag) {
              a: {
                for (var parent = finishedWork.return; null !== parent; ) {
                  if (isHostParent(parent)) {
                    var JSCompiler_inline_result = parent;
                    break a;
                  }
                  parent = parent.return;
                }
                throw Error(formatProdErrorMessage(160));
              }
              switch (JSCompiler_inline_result.tag) {
                case 27:
                  var parent$jscomp$0 = JSCompiler_inline_result.stateNode, before = getHostSibling(finishedWork);
                  insertOrAppendPlacementNode(finishedWork, before, parent$jscomp$0);
                  break;
                case 5:
                  var parent$113 = JSCompiler_inline_result.stateNode;
                  JSCompiler_inline_result.flags & 32 && (setTextContent(parent$113, ""), JSCompiler_inline_result.flags &= -33);
                  var before$114 = getHostSibling(finishedWork);
                  insertOrAppendPlacementNode(finishedWork, before$114, parent$113);
                  break;
                case 3:
                case 4:
                  var parent$115 = JSCompiler_inline_result.stateNode.containerInfo, before$116 = getHostSibling(finishedWork);
                  insertOrAppendPlacementNodeIntoContainer(
                    finishedWork,
                    before$116,
                    parent$115
                  );
                  break;
                default:
                  throw Error(formatProdErrorMessage(161));
              }
            }
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
          finishedWork.flags &= -3;
        }
        flags & 4096 && (finishedWork.flags &= -4097);
      }
      function recursivelyResetForms(parentFiber) {
        if (parentFiber.subtreeFlags & 1024)
          for (parentFiber = parentFiber.child; null !== parentFiber; ) {
            var fiber = parentFiber;
            recursivelyResetForms(fiber);
            5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset();
            parentFiber = parentFiber.sibling;
          }
      }
      function recursivelyTraverseLayoutEffects(root3, parentFiber) {
        if (parentFiber.subtreeFlags & 8772)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            commitLayoutEffectOnFiber(root3, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
      }
      function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          var finishedWork = parentFiber;
          switch (finishedWork.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
              commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
              recursivelyTraverseDisappearLayoutEffects(finishedWork);
              break;
            case 1:
              safelyDetachRef(finishedWork, finishedWork.return);
              var instance = finishedWork.stateNode;
              "function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(
                finishedWork,
                finishedWork.return,
                instance
              );
              recursivelyTraverseDisappearLayoutEffects(finishedWork);
              break;
            case 26:
            case 27:
            case 5:
              safelyDetachRef(finishedWork, finishedWork.return);
              recursivelyTraverseDisappearLayoutEffects(finishedWork);
              break;
            case 22:
              safelyDetachRef(finishedWork, finishedWork.return);
              null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork);
              break;
            default:
              recursivelyTraverseDisappearLayoutEffects(finishedWork);
          }
          parentFiber = parentFiber.sibling;
        }
      }
      function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
        includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 8772);
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
          switch (finishedWork.tag) {
            case 0:
            case 11:
            case 15:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                includeWorkInProgressEffects
              );
              commitHookEffectListMount(4, finishedWork);
              break;
            case 1:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                includeWorkInProgressEffects
              );
              current = finishedWork;
              finishedRoot = current.stateNode;
              if ("function" === typeof finishedRoot.componentDidMount)
                try {
                  finishedRoot.componentDidMount();
                } catch (error) {
                  captureCommitPhaseError(current, current.return, error);
                }
              current = finishedWork;
              finishedRoot = current.updateQueue;
              if (null !== finishedRoot) {
                var instance = current.stateNode;
                try {
                  var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
                  if (null !== hiddenCallbacks)
                    for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++)
                      callCallback(hiddenCallbacks[finishedRoot], instance);
                } catch (error) {
                  captureCommitPhaseError(current, current.return, error);
                }
              }
              includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
              safelyAttachRef(finishedWork, finishedWork.return);
              break;
            case 26:
            case 27:
            case 5:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                includeWorkInProgressEffects
              );
              includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
              safelyAttachRef(finishedWork, finishedWork.return);
              break;
            case 12:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                includeWorkInProgressEffects
              );
              break;
            case 13:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                includeWorkInProgressEffects
              );
              includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
              break;
            case 22:
              null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                includeWorkInProgressEffects
              );
              safelyAttachRef(finishedWork, finishedWork.return);
              break;
            default:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                includeWorkInProgressEffects
              );
          }
          parentFiber = parentFiber.sibling;
        }
      }
      function commitOffscreenPassiveMountEffects(current, finishedWork) {
        var previousCache = null;
        null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
        current = null;
        null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
        current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
      }
      function commitCachePassiveMountEffect(current, finishedWork) {
        current = null;
        null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
        finishedWork = finishedWork.memoizedState.cache;
        finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
      }
      function recursivelyTraversePassiveMountEffects(root3, parentFiber, committedLanes, committedTransitions) {
        if (parentFiber.subtreeFlags & 10256)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            commitPassiveMountOnFiber(
              root3,
              parentFiber,
              committedLanes,
              committedTransitions
            ), parentFiber = parentFiber.sibling;
      }
      function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
        var flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 15:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            flags & 2048 && commitHookEffectListMount(9, finishedWork);
            break;
          case 3:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            flags & 2048 && (finishedRoot = null, null !== finishedWork.alternate && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, null != finishedRoot && releaseCache(finishedRoot)));
            break;
          case 12:
            if (flags & 2048) {
              recursivelyTraversePassiveMountEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions
              );
              finishedRoot = finishedWork.stateNode;
              try {
                var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
                "function" === typeof onPostCommit && onPostCommit(
                  id,
                  null === finishedWork.alternate ? "mount" : "update",
                  finishedRoot.passiveEffectDuration,
                  -0
                );
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            } else
              recursivelyTraversePassiveMountEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions
              );
            break;
          case 23:
            break;
          case 22:
            _finishedWork$memoize2 = finishedWork.stateNode;
            null !== finishedWork.memoizedState ? _finishedWork$memoize2._visibility & 4 ? recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            ) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : _finishedWork$memoize2._visibility & 4 ? recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            ) : (_finishedWork$memoize2._visibility |= 4, recursivelyTraverseReconnectPassiveEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions,
              0 !== (finishedWork.subtreeFlags & 10256)
            ));
            flags & 2048 && commitOffscreenPassiveMountEffects(
              finishedWork.alternate,
              finishedWork
            );
            break;
          case 24:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
            break;
          default:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
        }
      }
      function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
        includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 10256);
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
          switch (finishedWork.tag) {
            case 0:
            case 11:
            case 15:
              recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              );
              commitHookEffectListMount(8, finishedWork);
              break;
            case 23:
              break;
            case 22:
              var instance = finishedWork.stateNode;
              null !== finishedWork.memoizedState ? instance._visibility & 4 ? recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              ) : recursivelyTraverseAtomicPassiveEffects(
                finishedRoot,
                finishedWork
              ) : (instance._visibility |= 4, recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              ));
              includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(
                finishedWork.alternate,
                finishedWork
              );
              break;
            case 24:
              recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              );
              includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
              break;
            default:
              recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              );
          }
          parentFiber = parentFiber.sibling;
        }
      }
      function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
        if (parentFiber.subtreeFlags & 10256)
          for (parentFiber = parentFiber.child; null !== parentFiber; ) {
            var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
            switch (finishedWork.tag) {
              case 22:
                recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
                flags & 2048 && commitOffscreenPassiveMountEffects(
                  finishedWork.alternate,
                  finishedWork
                );
                break;
              case 24:
                recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
                flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
                break;
              default:
                recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            }
            parentFiber = parentFiber.sibling;
          }
      }
      var suspenseyCommitFlag = 8192;
      function recursivelyAccumulateSuspenseyCommit(parentFiber) {
        if (parentFiber.subtreeFlags & suspenseyCommitFlag)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            accumulateSuspenseyCommitOnFiber(parentFiber), parentFiber = parentFiber.sibling;
      }
      function accumulateSuspenseyCommitOnFiber(fiber) {
        switch (fiber.tag) {
          case 26:
            recursivelyAccumulateSuspenseyCommit(fiber);
            fiber.flags & suspenseyCommitFlag && null !== fiber.memoizedState && suspendResource(
              currentHoistableRoot,
              fiber.memoizedState,
              fiber.memoizedProps
            );
            break;
          case 5:
            recursivelyAccumulateSuspenseyCommit(fiber);
            break;
          case 3:
          case 4:
            var previousHoistableRoot = currentHoistableRoot;
            currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
            recursivelyAccumulateSuspenseyCommit(fiber);
            currentHoistableRoot = previousHoistableRoot;
            break;
          case 22:
            null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(fiber), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(fiber));
            break;
          default:
            recursivelyAccumulateSuspenseyCommit(fiber);
        }
      }
      function detachAlternateSiblings(parentFiber) {
        var previousFiber = parentFiber.alternate;
        if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
          previousFiber.child = null;
          do
            previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
          while (null !== parentFiber);
        }
      }
      function recursivelyTraversePassiveUnmountEffects(parentFiber) {
        var deletions = parentFiber.deletions;
        if (0 !== (parentFiber.flags & 16)) {
          if (null !== deletions)
            for (var i8 = 0; i8 < deletions.length; i8++) {
              var childToDelete = deletions[i8];
              nextEffect = childToDelete;
              commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
                childToDelete,
                parentFiber
              );
            }
          detachAlternateSiblings(parentFiber);
        }
        if (parentFiber.subtreeFlags & 10256)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
      }
      function commitPassiveUnmountOnFiber(finishedWork) {
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 15:
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
            break;
          case 3:
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            break;
          case 12:
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            break;
          case 22:
            var instance = finishedWork.stateNode;
            null !== finishedWork.memoizedState && instance._visibility & 4 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -5, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
            break;
          default:
            recursivelyTraversePassiveUnmountEffects(finishedWork);
        }
      }
      function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
        var deletions = parentFiber.deletions;
        if (0 !== (parentFiber.flags & 16)) {
          if (null !== deletions)
            for (var i8 = 0; i8 < deletions.length; i8++) {
              var childToDelete = deletions[i8];
              nextEffect = childToDelete;
              commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
                childToDelete,
                parentFiber
              );
            }
          detachAlternateSiblings(parentFiber);
        }
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          deletions = parentFiber;
          switch (deletions.tag) {
            case 0:
            case 11:
            case 15:
              commitHookEffectListUnmount(8, deletions, deletions.return);
              recursivelyTraverseDisconnectPassiveEffects(deletions);
              break;
            case 22:
              i8 = deletions.stateNode;
              i8._visibility & 4 && (i8._visibility &= -5, recursivelyTraverseDisconnectPassiveEffects(deletions));
              break;
            default:
              recursivelyTraverseDisconnectPassiveEffects(deletions);
          }
          parentFiber = parentFiber.sibling;
        }
      }
      function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
        for (; null !== nextEffect; ) {
          var fiber = nextEffect;
          switch (fiber.tag) {
            case 0:
            case 11:
            case 15:
              commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
              break;
            case 23:
            case 22:
              if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
                var cache = fiber.memoizedState.cachePool.pool;
                null != cache && cache.refCount++;
              }
              break;
            case 24:
              releaseCache(fiber.memoizedState.cache);
          }
          cache = fiber.child;
          if (null !== cache) cache.return = fiber, nextEffect = cache;
          else
            a: for (fiber = deletedSubtreeRoot; null !== nextEffect; ) {
              cache = nextEffect;
              var sibling = cache.sibling, returnFiber = cache.return;
              detachFiberAfterEffects(cache);
              if (cache === fiber) {
                nextEffect = null;
                break a;
              }
              if (null !== sibling) {
                sibling.return = returnFiber;
                nextEffect = sibling;
                break a;
              }
              nextEffect = returnFiber;
            }
        }
      }
      function FiberNode(tag, pendingProps, key, mode) {
        this.tag = tag;
        this.key = key;
        this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
        this.index = 0;
        this.refCleanup = this.ref = null;
        this.pendingProps = pendingProps;
        this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
        this.mode = mode;
        this.subtreeFlags = this.flags = 0;
        this.deletions = null;
        this.childLanes = this.lanes = 0;
        this.alternate = null;
      }
      function createFiberImplClass(tag, pendingProps, key, mode) {
        return new FiberNode(tag, pendingProps, key, mode);
      }
      function shouldConstruct(Component) {
        Component = Component.prototype;
        return !(!Component || !Component.isReactComponent);
      }
      function createWorkInProgress(current, pendingProps) {
        var workInProgress2 = current.alternate;
        null === workInProgress2 ? (workInProgress2 = createFiberImplClass(
          current.tag,
          pendingProps,
          current.key,
          current.mode
        ), workInProgress2.elementType = current.elementType, workInProgress2.type = current.type, workInProgress2.stateNode = current.stateNode, workInProgress2.alternate = current, current.alternate = workInProgress2) : (workInProgress2.pendingProps = pendingProps, workInProgress2.type = current.type, workInProgress2.flags = 0, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null);
        workInProgress2.flags = current.flags & 31457280;
        workInProgress2.childLanes = current.childLanes;
        workInProgress2.lanes = current.lanes;
        workInProgress2.child = current.child;
        workInProgress2.memoizedProps = current.memoizedProps;
        workInProgress2.memoizedState = current.memoizedState;
        workInProgress2.updateQueue = current.updateQueue;
        pendingProps = current.dependencies;
        workInProgress2.dependencies = null === pendingProps ? null : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
        workInProgress2.sibling = current.sibling;
        workInProgress2.index = current.index;
        workInProgress2.ref = current.ref;
        workInProgress2.refCleanup = current.refCleanup;
        return workInProgress2;
      }
      function resetWorkInProgress(workInProgress2, renderLanes2) {
        workInProgress2.flags &= 31457282;
        var current = workInProgress2.alternate;
        null === current ? (workInProgress2.childLanes = 0, workInProgress2.lanes = renderLanes2, workInProgress2.child = null, workInProgress2.subtreeFlags = 0, workInProgress2.memoizedProps = null, workInProgress2.memoizedState = null, workInProgress2.updateQueue = null, workInProgress2.dependencies = null, workInProgress2.stateNode = null) : (workInProgress2.childLanes = current.childLanes, workInProgress2.lanes = current.lanes, workInProgress2.child = current.child, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null, workInProgress2.memoizedProps = current.memoizedProps, workInProgress2.memoizedState = current.memoizedState, workInProgress2.updateQueue = current.updateQueue, workInProgress2.type = current.type, renderLanes2 = current.dependencies, workInProgress2.dependencies = null === renderLanes2 ? null : {
          lanes: renderLanes2.lanes,
          firstContext: renderLanes2.firstContext
        });
        return workInProgress2;
      }
      function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
        var fiberTag = 0;
        owner = type;
        if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1);
        else if ("string" === typeof type)
          fiberTag = isHostHoistableType(
            type,
            pendingProps,
            contextStackCursor.current
          ) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
        else
          a: switch (type) {
            case REACT_FRAGMENT_TYPE:
              return createFiberFromFragment(pendingProps.children, mode, lanes, key);
            case REACT_STRICT_MODE_TYPE:
              fiberTag = 8;
              mode |= 24;
              break;
            case REACT_PROFILER_TYPE:
              return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
            case REACT_SUSPENSE_TYPE:
              return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
            case REACT_SUSPENSE_LIST_TYPE:
              return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
            case REACT_OFFSCREEN_TYPE:
              return createFiberFromOffscreen(pendingProps, mode, lanes, key);
            default:
              if ("object" === typeof type && null !== type)
                switch (type.$$typeof) {
                  case REACT_PROVIDER_TYPE:
                  case REACT_CONTEXT_TYPE:
                    fiberTag = 10;
                    break a;
                  case REACT_CONSUMER_TYPE:
                    fiberTag = 9;
                    break a;
                  case REACT_FORWARD_REF_TYPE:
                    fiberTag = 11;
                    break a;
                  case REACT_MEMO_TYPE:
                    fiberTag = 14;
                    break a;
                  case REACT_LAZY_TYPE:
                    fiberTag = 16;
                    owner = null;
                    break a;
                }
              fiberTag = 29;
              pendingProps = Error(
                formatProdErrorMessage(130, null === type ? "null" : typeof type, "")
              );
              owner = null;
          }
        key = createFiberImplClass(fiberTag, pendingProps, key, mode);
        key.elementType = type;
        key.type = owner;
        key.lanes = lanes;
        return key;
      }
      function createFiberFromFragment(elements, mode, lanes, key) {
        elements = createFiberImplClass(7, elements, key, mode);
        elements.lanes = lanes;
        return elements;
      }
      function createFiberFromOffscreen(pendingProps, mode, lanes, key) {
        pendingProps = createFiberImplClass(22, pendingProps, key, mode);
        pendingProps.elementType = REACT_OFFSCREEN_TYPE;
        pendingProps.lanes = lanes;
        var primaryChildInstance = {
          _visibility: 1,
          _pendingVisibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null,
          _current: null,
          detach: function() {
            var fiber = primaryChildInstance._current;
            if (null === fiber) throw Error(formatProdErrorMessage(456));
            if (0 === (primaryChildInstance._pendingVisibility & 2)) {
              var root3 = enqueueConcurrentRenderForLane(fiber, 2);
              null !== root3 && (primaryChildInstance._pendingVisibility |= 2, scheduleUpdateOnFiber(root3, fiber, 2));
            }
          },
          attach: function() {
            var fiber = primaryChildInstance._current;
            if (null === fiber) throw Error(formatProdErrorMessage(456));
            if (0 !== (primaryChildInstance._pendingVisibility & 2)) {
              var root3 = enqueueConcurrentRenderForLane(fiber, 2);
              null !== root3 && (primaryChildInstance._pendingVisibility &= -3, scheduleUpdateOnFiber(root3, fiber, 2));
            }
          }
        };
        pendingProps.stateNode = primaryChildInstance;
        return pendingProps;
      }
      function createFiberFromText(content, mode, lanes) {
        content = createFiberImplClass(6, content, null, mode);
        content.lanes = lanes;
        return content;
      }
      function createFiberFromPortal(portal, mode, lanes) {
        mode = createFiberImplClass(
          4,
          null !== portal.children ? portal.children : [],
          portal.key,
          mode
        );
        mode.lanes = lanes;
        mode.stateNode = {
          containerInfo: portal.containerInfo,
          pendingChildren: null,
          implementation: portal.implementation
        };
        return mode;
      }
      function markUpdate(workInProgress2) {
        workInProgress2.flags |= 4;
      }
      function preloadResourceAndSuspendIfNeeded(workInProgress2, resource) {
        if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4))
          workInProgress2.flags &= -16777217;
        else if (workInProgress2.flags |= 16777216, !preloadResource(resource)) {
          resource = suspenseHandlerStackCursor.current;
          if (null !== resource && ((workInProgressRootRenderLanes & 4194176) === workInProgressRootRenderLanes ? null !== shellBoundary : (workInProgressRootRenderLanes & 62914560) !== workInProgressRootRenderLanes && 0 === (workInProgressRootRenderLanes & 536870912) || resource !== shellBoundary))
            throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
          workInProgress2.flags |= 8192;
        }
      }
      function scheduleRetryEffect(workInProgress2, retryQueue) {
        null !== retryQueue && (workInProgress2.flags |= 4);
        workInProgress2.flags & 16384 && (retryQueue = 22 !== workInProgress2.tag ? claimNextRetryLane() : 536870912, workInProgress2.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
      }
      function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
        if (!isHydrating)
          switch (renderState.tailMode) {
            case "hidden":
              hasRenderedATailFallback = renderState.tail;
              for (var lastTailNode = null; null !== hasRenderedATailFallback; )
                null !== hasRenderedATailFallback.alternate && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
              null === lastTailNode ? renderState.tail = null : lastTailNode.sibling = null;
              break;
            case "collapsed":
              lastTailNode = renderState.tail;
              for (var lastTailNode$131 = null; null !== lastTailNode; )
                null !== lastTailNode.alternate && (lastTailNode$131 = lastTailNode), lastTailNode = lastTailNode.sibling;
              null === lastTailNode$131 ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$131.sibling = null;
          }
      }
      function bubbleProperties(completedWork) {
        var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
        if (didBailout)
          for (var child$132 = completedWork.child; null !== child$132; )
            newChildLanes |= child$132.lanes | child$132.childLanes, subtreeFlags |= child$132.subtreeFlags & 31457280, subtreeFlags |= child$132.flags & 31457280, child$132.return = completedWork, child$132 = child$132.sibling;
        else
          for (child$132 = completedWork.child; null !== child$132; )
            newChildLanes |= child$132.lanes | child$132.childLanes, subtreeFlags |= child$132.subtreeFlags, subtreeFlags |= child$132.flags, child$132.return = completedWork, child$132 = child$132.sibling;
        completedWork.subtreeFlags |= subtreeFlags;
        completedWork.childLanes = newChildLanes;
        return didBailout;
      }
      function completeWork(current, workInProgress2, renderLanes2) {
        var newProps = workInProgress2.pendingProps;
        popTreeContext(workInProgress2);
        switch (workInProgress2.tag) {
          case 16:
          case 15:
          case 0:
          case 11:
          case 7:
          case 8:
          case 12:
          case 9:
          case 14:
            return bubbleProperties(workInProgress2), null;
          case 1:
            return bubbleProperties(workInProgress2), null;
          case 3:
            renderLanes2 = workInProgress2.stateNode;
            newProps = null;
            null !== current && (newProps = current.memoizedState.cache);
            workInProgress2.memoizedState.cache !== newProps && (workInProgress2.flags |= 2048);
            popProvider(CacheContext);
            popHostContainer();
            renderLanes2.pendingContext && (renderLanes2.context = renderLanes2.pendingContext, renderLanes2.pendingContext = null);
            if (null === current || null === current.child)
              popHydrationState(workInProgress2) ? markUpdate(workInProgress2) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress2.flags & 256) || (workInProgress2.flags |= 1024, null !== hydrationErrors && (queueRecoverableErrors(hydrationErrors), hydrationErrors = null));
            bubbleProperties(workInProgress2);
            return null;
          case 26:
            return renderLanes2 = workInProgress2.memoizedState, null === current ? (markUpdate(workInProgress2), null !== renderLanes2 ? (bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, renderLanes2)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217)) : renderLanes2 ? renderLanes2 !== current.memoizedState ? (markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, renderLanes2)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217) : (current.memoizedProps !== newProps && markUpdate(workInProgress2), bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217), null;
          case 27:
            popHostContext(workInProgress2);
            renderLanes2 = rootInstanceStackCursor.current;
            var type = workInProgress2.type;
            if (null !== current && null != workInProgress2.stateNode)
              current.memoizedProps !== newProps && markUpdate(workInProgress2);
            else {
              if (!newProps) {
                if (null === workInProgress2.stateNode)
                  throw Error(formatProdErrorMessage(166));
                bubbleProperties(workInProgress2);
                return null;
              }
              current = contextStackCursor.current;
              popHydrationState(workInProgress2) ? prepareToHydrateHostInstance(workInProgress2, current) : (current = resolveSingletonInstance(type, newProps, renderLanes2), workInProgress2.stateNode = current, markUpdate(workInProgress2));
            }
            bubbleProperties(workInProgress2);
            return null;
          case 5:
            popHostContext(workInProgress2);
            renderLanes2 = workInProgress2.type;
            if (null !== current && null != workInProgress2.stateNode)
              current.memoizedProps !== newProps && markUpdate(workInProgress2);
            else {
              if (!newProps) {
                if (null === workInProgress2.stateNode)
                  throw Error(formatProdErrorMessage(166));
                bubbleProperties(workInProgress2);
                return null;
              }
              current = contextStackCursor.current;
              if (popHydrationState(workInProgress2))
                prepareToHydrateHostInstance(workInProgress2, current);
              else {
                type = getOwnerDocumentFromRootContainer(
                  rootInstanceStackCursor.current
                );
                switch (current) {
                  case 1:
                    current = type.createElementNS(
                      "http://www.w3.org/2000/svg",
                      renderLanes2
                    );
                    break;
                  case 2:
                    current = type.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      renderLanes2
                    );
                    break;
                  default:
                    switch (renderLanes2) {
                      case "svg":
                        current = type.createElementNS(
                          "http://www.w3.org/2000/svg",
                          renderLanes2
                        );
                        break;
                      case "math":
                        current = type.createElementNS(
                          "http://www.w3.org/1998/Math/MathML",
                          renderLanes2
                        );
                        break;
                      case "script":
                        current = type.createElement("div");
                        current.innerHTML = "<script><\/script>";
                        current = current.removeChild(current.firstChild);
                        break;
                      case "select":
                        current = "string" === typeof newProps.is ? type.createElement("select", { is: newProps.is }) : type.createElement("select");
                        newProps.multiple ? current.multiple = true : newProps.size && (current.size = newProps.size);
                        break;
                      default:
                        current = "string" === typeof newProps.is ? type.createElement(renderLanes2, { is: newProps.is }) : type.createElement(renderLanes2);
                    }
                }
                current[internalInstanceKey] = workInProgress2;
                current[internalPropsKey] = newProps;
                a: for (type = workInProgress2.child; null !== type; ) {
                  if (5 === type.tag || 6 === type.tag)
                    current.appendChild(type.stateNode);
                  else if (4 !== type.tag && 27 !== type.tag && null !== type.child) {
                    type.child.return = type;
                    type = type.child;
                    continue;
                  }
                  if (type === workInProgress2) break a;
                  for (; null === type.sibling; ) {
                    if (null === type.return || type.return === workInProgress2)
                      break a;
                    type = type.return;
                  }
                  type.sibling.return = type.return;
                  type = type.sibling;
                }
                workInProgress2.stateNode = current;
                a: switch (setInitialProperties(current, renderLanes2, newProps), renderLanes2) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    current = !!newProps.autoFocus;
                    break a;
                  case "img":
                    current = true;
                    break a;
                  default:
                    current = false;
                }
                current && markUpdate(workInProgress2);
              }
            }
            bubbleProperties(workInProgress2);
            workInProgress2.flags &= -16777217;
            return null;
          case 6:
            if (current && null != workInProgress2.stateNode)
              current.memoizedProps !== newProps && markUpdate(workInProgress2);
            else {
              if ("string" !== typeof newProps && null === workInProgress2.stateNode)
                throw Error(formatProdErrorMessage(166));
              current = rootInstanceStackCursor.current;
              if (popHydrationState(workInProgress2)) {
                current = workInProgress2.stateNode;
                renderLanes2 = workInProgress2.memoizedProps;
                newProps = null;
                type = hydrationParentFiber;
                if (null !== type)
                  switch (type.tag) {
                    case 27:
                    case 5:
                      newProps = type.memoizedProps;
                  }
                current[internalInstanceKey] = workInProgress2;
                current = current.nodeValue === renderLanes2 || null !== newProps && true === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes2) ? true : false;
                current || throwOnHydrationMismatch(workInProgress2);
              } else
                current = getOwnerDocumentFromRootContainer(current).createTextNode(
                  newProps
                ), current[internalInstanceKey] = workInProgress2, workInProgress2.stateNode = current;
            }
            bubbleProperties(workInProgress2);
            return null;
          case 13:
            newProps = workInProgress2.memoizedState;
            if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
              type = popHydrationState(workInProgress2);
              if (null !== newProps && null !== newProps.dehydrated) {
                if (null === current) {
                  if (!type) throw Error(formatProdErrorMessage(318));
                  type = workInProgress2.memoizedState;
                  type = null !== type ? type.dehydrated : null;
                  if (!type) throw Error(formatProdErrorMessage(317));
                  type[internalInstanceKey] = workInProgress2;
                } else
                  resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
                bubbleProperties(workInProgress2);
                type = false;
              } else
                null !== hydrationErrors && (queueRecoverableErrors(hydrationErrors), hydrationErrors = null), type = true;
              if (!type) {
                if (workInProgress2.flags & 256)
                  return popSuspenseHandler(workInProgress2), workInProgress2;
                popSuspenseHandler(workInProgress2);
                return null;
              }
            }
            popSuspenseHandler(workInProgress2);
            if (0 !== (workInProgress2.flags & 128))
              return workInProgress2.lanes = renderLanes2, workInProgress2;
            renderLanes2 = null !== newProps;
            current = null !== current && null !== current.memoizedState;
            if (renderLanes2) {
              newProps = workInProgress2.child;
              type = null;
              null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool);
              var cache$144 = null;
              null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (cache$144 = newProps.memoizedState.cachePool.pool);
              cache$144 !== type && (newProps.flags |= 2048);
            }
            renderLanes2 !== current && renderLanes2 && (workInProgress2.child.flags |= 8192);
            scheduleRetryEffect(workInProgress2, workInProgress2.updateQueue);
            bubbleProperties(workInProgress2);
            return null;
          case 4:
            return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress2.stateNode.containerInfo), bubbleProperties(workInProgress2), null;
          case 10:
            return popProvider(workInProgress2.type), bubbleProperties(workInProgress2), null;
          case 19:
            pop(suspenseStackCursor);
            type = workInProgress2.memoizedState;
            if (null === type) return bubbleProperties(workInProgress2), null;
            newProps = 0 !== (workInProgress2.flags & 128);
            cache$144 = type.rendering;
            if (null === cache$144)
              if (newProps) cutOffTailIfNeeded(type, false);
              else {
                if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128))
                  for (current = workInProgress2.child; null !== current; ) {
                    cache$144 = findFirstSuspended(current);
                    if (null !== cache$144) {
                      workInProgress2.flags |= 128;
                      cutOffTailIfNeeded(type, false);
                      current = cache$144.updateQueue;
                      workInProgress2.updateQueue = current;
                      scheduleRetryEffect(workInProgress2, current);
                      workInProgress2.subtreeFlags = 0;
                      current = renderLanes2;
                      for (renderLanes2 = workInProgress2.child; null !== renderLanes2; )
                        resetWorkInProgress(renderLanes2, current), renderLanes2 = renderLanes2.sibling;
                      push(
                        suspenseStackCursor,
                        suspenseStackCursor.current & 1 | 2
                      );
                      return workInProgress2.child;
                    }
                    current = current.sibling;
                  }
                null !== type.tail && now() > workInProgressRootRenderTargetTime && (workInProgress2.flags |= 128, newProps = true, cutOffTailIfNeeded(type, false), workInProgress2.lanes = 4194304);
              }
            else {
              if (!newProps)
                if (current = findFirstSuspended(cache$144), null !== current) {
                  if (workInProgress2.flags |= 128, newProps = true, current = current.updateQueue, workInProgress2.updateQueue = current, scheduleRetryEffect(workInProgress2, current), cutOffTailIfNeeded(type, true), null === type.tail && "hidden" === type.tailMode && !cache$144.alternate && !isHydrating)
                    return bubbleProperties(workInProgress2), null;
                } else
                  2 * now() - type.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes2 && (workInProgress2.flags |= 128, newProps = true, cutOffTailIfNeeded(type, false), workInProgress2.lanes = 4194304);
              type.isBackwards ? (cache$144.sibling = workInProgress2.child, workInProgress2.child = cache$144) : (current = type.last, null !== current ? current.sibling = cache$144 : workInProgress2.child = cache$144, type.last = cache$144);
            }
            if (null !== type.tail)
              return workInProgress2 = type.tail, type.rendering = workInProgress2, type.tail = workInProgress2.sibling, type.renderingStartTime = now(), workInProgress2.sibling = null, current = suspenseStackCursor.current, push(suspenseStackCursor, newProps ? current & 1 | 2 : current & 1), workInProgress2;
            bubbleProperties(workInProgress2);
            return null;
          case 22:
          case 23:
            return popSuspenseHandler(workInProgress2), popHiddenContext(), newProps = null !== workInProgress2.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress2.flags |= 8192) : newProps && (workInProgress2.flags |= 8192), newProps ? 0 !== (renderLanes2 & 536870912) && 0 === (workInProgress2.flags & 128) && (bubbleProperties(workInProgress2), workInProgress2.subtreeFlags & 6 && (workInProgress2.flags |= 8192)) : bubbleProperties(workInProgress2), renderLanes2 = workInProgress2.updateQueue, null !== renderLanes2 && scheduleRetryEffect(workInProgress2, renderLanes2.retryQueue), renderLanes2 = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes2 = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress2.memoizedState && null !== workInProgress2.memoizedState.cachePool && (newProps = workInProgress2.memoizedState.cachePool.pool), newProps !== renderLanes2 && (workInProgress2.flags |= 2048), null !== current && pop(resumedCache), null;
          case 24:
            return renderLanes2 = null, null !== current && (renderLanes2 = current.memoizedState.cache), workInProgress2.memoizedState.cache !== renderLanes2 && (workInProgress2.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress2), null;
          case 25:
            return null;
        }
        throw Error(formatProdErrorMessage(156, workInProgress2.tag));
      }
      function unwindWork(current, workInProgress2) {
        popTreeContext(workInProgress2);
        switch (workInProgress2.tag) {
          case 1:
            return current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
          case 3:
            return popProvider(CacheContext), popHostContainer(), current = workInProgress2.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
          case 26:
          case 27:
          case 5:
            return popHostContext(workInProgress2), null;
          case 13:
            popSuspenseHandler(workInProgress2);
            current = workInProgress2.memoizedState;
            if (null !== current && null !== current.dehydrated) {
              if (null === workInProgress2.alternate)
                throw Error(formatProdErrorMessage(340));
              resetHydrationState();
            }
            current = workInProgress2.flags;
            return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
          case 19:
            return pop(suspenseStackCursor), null;
          case 4:
            return popHostContainer(), null;
          case 10:
            return popProvider(workInProgress2.type), null;
          case 22:
          case 23:
            return popSuspenseHandler(workInProgress2), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
          case 24:
            return popProvider(CacheContext), null;
          case 25:
            return null;
          default:
            return null;
        }
      }
      function unwindInterruptedWork(current, interruptedWork) {
        popTreeContext(interruptedWork);
        switch (interruptedWork.tag) {
          case 3:
            popProvider(CacheContext);
            popHostContainer();
            break;
          case 26:
          case 27:
          case 5:
            popHostContext(interruptedWork);
            break;
          case 4:
            popHostContainer();
            break;
          case 13:
            popSuspenseHandler(interruptedWork);
            break;
          case 19:
            pop(suspenseStackCursor);
            break;
          case 10:
            popProvider(interruptedWork.type);
            break;
          case 22:
          case 23:
            popSuspenseHandler(interruptedWork);
            popHiddenContext();
            null !== current && pop(resumedCache);
            break;
          case 24:
            popProvider(CacheContext);
        }
      }
      var DefaultAsyncDispatcher = {
        getCacheForType: function(resourceType) {
          var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
          void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
          return cacheForType;
        }
      };
      var PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map;
      var executionContext = 0;
      var workInProgressRoot = null;
      var workInProgress = null;
      var workInProgressRootRenderLanes = 0;
      var workInProgressSuspendedReason = 0;
      var workInProgressThrownValue = null;
      var workInProgressRootDidSkipSuspendedSiblings = false;
      var workInProgressRootIsPrerendering = false;
      var workInProgressRootDidAttachPingListener = false;
      var entangledRenderLanes = 0;
      var workInProgressRootExitStatus = 0;
      var workInProgressRootSkippedLanes = 0;
      var workInProgressRootInterleavedUpdatedLanes = 0;
      var workInProgressRootPingedLanes = 0;
      var workInProgressDeferredLane = 0;
      var workInProgressSuspendedRetryLanes = 0;
      var workInProgressRootConcurrentErrors = null;
      var workInProgressRootRecoverableErrors = null;
      var workInProgressRootDidIncludeRecursiveRenderUpdate = false;
      var globalMostRecentFallbackTime = 0;
      var workInProgressRootRenderTargetTime = Infinity;
      var workInProgressTransitions = null;
      var legacyErrorBoundariesThatAlreadyFailed = null;
      var rootDoesHavePassiveEffects = false;
      var rootWithPendingPassiveEffects = null;
      var pendingPassiveEffectsLanes = 0;
      var pendingPassiveEffectsRemainingLanes = 0;
      var pendingPassiveTransitions = null;
      var nestedUpdateCount = 0;
      var rootWithNestedUpdates = null;
      function requestUpdateLane() {
        if (0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes)
          return workInProgressRootRenderLanes & -workInProgressRootRenderLanes;
        if (null !== ReactSharedInternals.T) {
          var actionScopeLane = currentEntangledLane;
          return 0 !== actionScopeLane ? actionScopeLane : requestTransitionLane();
        }
        return resolveUpdatePriority();
      }
      function requestDeferredLane() {
        0 === workInProgressDeferredLane && (workInProgressDeferredLane = 0 === (workInProgressRootRenderLanes & 536870912) || isHydrating ? claimNextTransitionLane() : 536870912);
        var suspenseHandler = suspenseHandlerStackCursor.current;
        null !== suspenseHandler && (suspenseHandler.flags |= 32);
        return workInProgressDeferredLane;
      }
      function scheduleUpdateOnFiber(root3, fiber, lane) {
        if (root3 === workInProgressRoot && 2 === workInProgressSuspendedReason || null !== root3.cancelPendingCommit)
          prepareFreshStack(root3, 0), markRootSuspended(
            root3,
            workInProgressRootRenderLanes,
            workInProgressDeferredLane,
            false
          );
        markRootUpdated$1(root3, lane);
        if (0 === (executionContext & 2) || root3 !== workInProgressRoot)
          root3 === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(
            root3,
            workInProgressRootRenderLanes,
            workInProgressDeferredLane,
            false
          )), ensureRootIsScheduled(root3);
      }
      function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
        if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
        var shouldTimeSlice = !forceSync && 0 === (lanes & 60) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
        do {
          if (0 === exitStatus) {
            workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
            break;
          } else if (6 === exitStatus)
            markRootSuspended(
              root$jscomp$0,
              lanes,
              0,
              !workInProgressRootDidSkipSuspendedSiblings
            );
          else {
            forceSync = root$jscomp$0.current.alternate;
            if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
              exitStatus = renderRootSync(root$jscomp$0, lanes, false);
              renderWasConcurrent = false;
              continue;
            }
            if (2 === exitStatus) {
              renderWasConcurrent = lanes;
              if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
                var JSCompiler_inline_result = 0;
              else
                JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
              if (0 !== JSCompiler_inline_result) {
                lanes = JSCompiler_inline_result;
                a: {
                  var root3 = root$jscomp$0;
                  exitStatus = workInProgressRootConcurrentErrors;
                  var wasRootDehydrated = root3.current.memoizedState.isDehydrated;
                  wasRootDehydrated && (prepareFreshStack(root3, JSCompiler_inline_result).flags |= 256);
                  JSCompiler_inline_result = renderRootSync(
                    root3,
                    JSCompiler_inline_result,
                    false
                  );
                  if (2 !== JSCompiler_inline_result) {
                    if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
                      root3.errorRecoveryDisabledLanes |= renderWasConcurrent;
                      workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
                      exitStatus = 4;
                      break a;
                    }
                    renderWasConcurrent = workInProgressRootRecoverableErrors;
                    workInProgressRootRecoverableErrors = exitStatus;
                    null !== renderWasConcurrent && queueRecoverableErrors(renderWasConcurrent);
                  }
                  exitStatus = JSCompiler_inline_result;
                }
                renderWasConcurrent = false;
                if (2 !== exitStatus) continue;
              }
            }
            if (1 === exitStatus) {
              prepareFreshStack(root$jscomp$0, 0);
              markRootSuspended(root$jscomp$0, lanes, 0, true);
              break;
            }
            a: {
              shouldTimeSlice = root$jscomp$0;
              switch (exitStatus) {
                case 0:
                case 1:
                  throw Error(formatProdErrorMessage(345));
                case 4:
                  if ((lanes & 4194176) === lanes) {
                    markRootSuspended(
                      shouldTimeSlice,
                      lanes,
                      workInProgressDeferredLane,
                      !workInProgressRootDidSkipSuspendedSiblings
                    );
                    break a;
                  }
                  break;
                case 2:
                  workInProgressRootRecoverableErrors = null;
                  break;
                case 3:
                case 5:
                  break;
                default:
                  throw Error(formatProdErrorMessage(329));
              }
              shouldTimeSlice.finishedWork = forceSync;
              shouldTimeSlice.finishedLanes = lanes;
              if ((lanes & 62914560) === lanes && (renderWasConcurrent = globalMostRecentFallbackTime + 300 - now(), 10 < renderWasConcurrent)) {
                markRootSuspended(
                  shouldTimeSlice,
                  lanes,
                  workInProgressDeferredLane,
                  !workInProgressRootDidSkipSuspendedSiblings
                );
                if (0 !== getNextLanes(shouldTimeSlice, 0)) break a;
                shouldTimeSlice.timeoutHandle = scheduleTimeout(
                  commitRootWhenReady.bind(
                    null,
                    shouldTimeSlice,
                    forceSync,
                    workInProgressRootRecoverableErrors,
                    workInProgressTransitions,
                    workInProgressRootDidIncludeRecursiveRenderUpdate,
                    lanes,
                    workInProgressDeferredLane,
                    workInProgressRootInterleavedUpdatedLanes,
                    workInProgressSuspendedRetryLanes,
                    workInProgressRootDidSkipSuspendedSiblings,
                    2,
                    -0,
                    0
                  ),
                  renderWasConcurrent
                );
                break a;
              }
              commitRootWhenReady(
                shouldTimeSlice,
                forceSync,
                workInProgressRootRecoverableErrors,
                workInProgressTransitions,
                workInProgressRootDidIncludeRecursiveRenderUpdate,
                lanes,
                workInProgressDeferredLane,
                workInProgressRootInterleavedUpdatedLanes,
                workInProgressSuspendedRetryLanes,
                workInProgressRootDidSkipSuspendedSiblings,
                0,
                -0,
                0
              );
            }
          }
          break;
        } while (1);
        ensureRootIsScheduled(root$jscomp$0);
      }
      function queueRecoverableErrors(errors) {
        null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = errors : workInProgressRootRecoverableErrors.push.apply(
          workInProgressRootRecoverableErrors,
          errors
        );
      }
      function commitRootWhenReady(root3, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
        var subtreeFlags = finishedWork.subtreeFlags;
        if (subtreeFlags & 8192 || 16785408 === (subtreeFlags & 16785408)) {
          if (suspendedState = { stylesheets: null, count: 0, unsuspend: noop }, accumulateSuspenseyCommitOnFiber(finishedWork), finishedWork = waitForCommitToBeReady(), null !== finishedWork) {
            root3.cancelPendingCommit = finishedWork(
              commitRoot.bind(
                null,
                root3,
                recoverableErrors,
                transitions,
                didIncludeRenderPhaseUpdate,
                spawnedLane,
                updatedLanes,
                suspendedRetryLanes,
                1,
                completedRenderStartTime,
                completedRenderEndTime
              )
            );
            markRootSuspended(root3, lanes, spawnedLane, !didSkipSuspendedSiblings);
            return;
          }
        }
        commitRoot(
          root3,
          recoverableErrors,
          transitions,
          didIncludeRenderPhaseUpdate,
          spawnedLane,
          updatedLanes,
          suspendedRetryLanes,
          suspendedCommitReason,
          completedRenderStartTime,
          completedRenderEndTime
        );
      }
      function isRenderConsistentWithExternalStores(finishedWork) {
        for (var node = finishedWork; ; ) {
          var tag = node.tag;
          if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag)))
            for (var i8 = 0; i8 < tag.length; i8++) {
              var check = tag[i8], getSnapshot = check.getSnapshot;
              check = check.value;
              try {
                if (!objectIs(getSnapshot(), check)) return false;
              } catch (error) {
                return false;
              }
            }
          tag = node.child;
          if (node.subtreeFlags & 16384 && null !== tag)
            tag.return = node, node = tag;
          else {
            if (node === finishedWork) break;
            for (; null === node.sibling; ) {
              if (null === node.return || node.return === finishedWork) return true;
              node = node.return;
            }
            node.sibling.return = node.return;
            node = node.sibling;
          }
        }
        return true;
      }
      function markRootSuspended(root3, suspendedLanes, spawnedLane, didAttemptEntireTree) {
        suspendedLanes &= ~workInProgressRootPingedLanes;
        suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
        root3.suspendedLanes |= suspendedLanes;
        root3.pingedLanes &= ~suspendedLanes;
        didAttemptEntireTree && (root3.warmLanes |= suspendedLanes);
        didAttemptEntireTree = root3.expirationTimes;
        for (var lanes = suspendedLanes; 0 < lanes; ) {
          var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
          didAttemptEntireTree[index$6] = -1;
          lanes &= ~lane;
        }
        0 !== spawnedLane && markSpawnedDeferredLane(root3, spawnedLane, suspendedLanes);
      }
      function flushSyncWork$1() {
        return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0, false), false) : true;
      }
      function resetWorkInProgressStack() {
        if (null !== workInProgress) {
          if (0 === workInProgressSuspendedReason)
            var interruptedWork = workInProgress.return;
          else
            interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
          for (; null !== interruptedWork; )
            unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
          workInProgress = null;
        }
      }
      function prepareFreshStack(root3, lanes) {
        root3.finishedWork = null;
        root3.finishedLanes = 0;
        var timeoutHandle = root3.timeoutHandle;
        -1 !== timeoutHandle && (root3.timeoutHandle = -1, cancelTimeout(timeoutHandle));
        timeoutHandle = root3.cancelPendingCommit;
        null !== timeoutHandle && (root3.cancelPendingCommit = null, timeoutHandle());
        resetWorkInProgressStack();
        workInProgressRoot = root3;
        workInProgress = timeoutHandle = createWorkInProgress(root3.current, null);
        workInProgressRootRenderLanes = lanes;
        workInProgressSuspendedReason = 0;
        workInProgressThrownValue = null;
        workInProgressRootDidSkipSuspendedSiblings = false;
        workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root3, lanes);
        workInProgressRootDidAttachPingListener = false;
        workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
        workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
        workInProgressRootDidIncludeRecursiveRenderUpdate = false;
        0 !== (lanes & 8) && (lanes |= lanes & 32);
        var allEntangledLanes = root3.entangledLanes;
        if (0 !== allEntangledLanes)
          for (root3 = root3.entanglements, allEntangledLanes &= lanes; 0 < allEntangledLanes; ) {
            var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
            lanes |= root3[index$4];
            allEntangledLanes &= ~lane;
          }
        entangledRenderLanes = lanes;
        finishQueueingConcurrentUpdates();
        return timeoutHandle;
      }
      function handleThrow(root3, thrownValue) {
        currentlyRenderingFiber$1 = null;
        ReactSharedInternals.H = ContextOnlyDispatcher;
        thrownValue === SuspenseException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
        workInProgressThrownValue = thrownValue;
        null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(
          root3,
          createCapturedValueAtFiber(thrownValue, root3.current)
        ));
      }
      function pushDispatcher() {
        var prevDispatcher = ReactSharedInternals.H;
        ReactSharedInternals.H = ContextOnlyDispatcher;
        return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
      }
      function pushAsyncDispatcher() {
        var prevAsyncDispatcher = ReactSharedInternals.A;
        ReactSharedInternals.A = DefaultAsyncDispatcher;
        return prevAsyncDispatcher;
      }
      function renderDidSuspendDelayIfPossible() {
        workInProgressRootExitStatus = 4;
        workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194176) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = true);
        0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(
          workInProgressRoot,
          workInProgressRootRenderLanes,
          workInProgressDeferredLane,
          false
        );
      }
      function renderRootSync(root3, lanes, shouldYieldForPrerendering) {
        var prevExecutionContext = executionContext;
        executionContext |= 2;
        var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
        if (workInProgressRoot !== root3 || workInProgressRootRenderLanes !== lanes)
          workInProgressTransitions = null, prepareFreshStack(root3, lanes);
        lanes = false;
        var exitStatus = workInProgressRootExitStatus;
        a: do
          try {
            if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
              var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
              switch (workInProgressSuspendedReason) {
                case 8:
                  resetWorkInProgressStack();
                  exitStatus = 6;
                  break a;
                case 3:
                case 2:
                case 6:
                  null === suspenseHandlerStackCursor.current && (lanes = true);
                  var reason = workInProgressSuspendedReason;
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root3, unitOfWork, thrownValue, reason);
                  if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
                    exitStatus = 0;
                    break a;
                  }
                  break;
                default:
                  reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root3, unitOfWork, thrownValue, reason);
              }
            }
            workLoopSync();
            exitStatus = workInProgressRootExitStatus;
            break;
          } catch (thrownValue$164) {
            handleThrow(root3, thrownValue$164);
          }
        while (1);
        lanes && root3.shellSuspendCounter++;
        lastContextDependency = currentlyRenderingFiber = null;
        executionContext = prevExecutionContext;
        ReactSharedInternals.H = prevDispatcher;
        ReactSharedInternals.A = prevAsyncDispatcher;
        null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
        return exitStatus;
      }
      function workLoopSync() {
        for (; null !== workInProgress; ) performUnitOfWork(workInProgress);
      }
      function renderRootConcurrent(root3, lanes) {
        var prevExecutionContext = executionContext;
        executionContext |= 2;
        var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
        workInProgressRoot !== root3 || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root3, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
          root3,
          lanes
        );
        a: do
          try {
            if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
              lanes = workInProgress;
              var thrownValue = workInProgressThrownValue;
              b: switch (workInProgressSuspendedReason) {
                case 1:
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root3, lanes, thrownValue, 1);
                  break;
                case 2:
                  if (isThenableResolved(thrownValue)) {
                    workInProgressSuspendedReason = 0;
                    workInProgressThrownValue = null;
                    replaySuspendedUnitOfWork(lanes);
                    break;
                  }
                  lanes = function() {
                    2 === workInProgressSuspendedReason && workInProgressRoot === root3 && (workInProgressSuspendedReason = 7);
                    ensureRootIsScheduled(root3);
                  };
                  thrownValue.then(lanes, lanes);
                  break a;
                case 3:
                  workInProgressSuspendedReason = 7;
                  break a;
                case 4:
                  workInProgressSuspendedReason = 5;
                  break a;
                case 7:
                  isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root3, lanes, thrownValue, 7));
                  break;
                case 5:
                  var resource = null;
                  switch (workInProgress.tag) {
                    case 26:
                      resource = workInProgress.memoizedState;
                    case 5:
                    case 27:
                      var hostFiber = workInProgress;
                      if (resource ? preloadResource(resource) : 1) {
                        workInProgressSuspendedReason = 0;
                        workInProgressThrownValue = null;
                        var sibling = hostFiber.sibling;
                        if (null !== sibling) workInProgress = sibling;
                        else {
                          var returnFiber = hostFiber.return;
                          null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
                        }
                        break b;
                      }
                  }
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root3, lanes, thrownValue, 5);
                  break;
                case 6:
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root3, lanes, thrownValue, 6);
                  break;
                case 8:
                  resetWorkInProgressStack();
                  workInProgressRootExitStatus = 6;
                  break a;
                default:
                  throw Error(formatProdErrorMessage(462));
              }
            }
            workLoopConcurrent();
            break;
          } catch (thrownValue$166) {
            handleThrow(root3, thrownValue$166);
          }
        while (1);
        lastContextDependency = currentlyRenderingFiber = null;
        ReactSharedInternals.H = prevDispatcher;
        ReactSharedInternals.A = prevAsyncDispatcher;
        executionContext = prevExecutionContext;
        if (null !== workInProgress) return 0;
        workInProgressRoot = null;
        workInProgressRootRenderLanes = 0;
        finishQueueingConcurrentUpdates();
        return workInProgressRootExitStatus;
      }
      function workLoopConcurrent() {
        for (; null !== workInProgress && !shouldYield(); )
          performUnitOfWork(workInProgress);
      }
      function performUnitOfWork(unitOfWork) {
        var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
        unitOfWork.memoizedProps = unitOfWork.pendingProps;
        null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
      }
      function replaySuspendedUnitOfWork(unitOfWork) {
        var next = unitOfWork;
        var current = next.alternate;
        switch (next.tag) {
          case 15:
          case 0:
            next = replayFunctionComponent(
              current,
              next,
              next.pendingProps,
              next.type,
              void 0,
              workInProgressRootRenderLanes
            );
            break;
          case 11:
            next = replayFunctionComponent(
              current,
              next,
              next.pendingProps,
              next.type.render,
              next.ref,
              workInProgressRootRenderLanes
            );
            break;
          case 5:
            resetHooksOnUnwind(next);
          default:
            unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
        }
        unitOfWork.memoizedProps = unitOfWork.pendingProps;
        null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
      }
      function throwAndUnwindWorkLoop(root3, unitOfWork, thrownValue, suspendedReason) {
        lastContextDependency = currentlyRenderingFiber = null;
        resetHooksOnUnwind(unitOfWork);
        thenableState$1 = null;
        thenableIndexCounter$1 = 0;
        var returnFiber = unitOfWork.return;
        try {
          if (throwException(
            root3,
            returnFiber,
            unitOfWork,
            thrownValue,
            workInProgressRootRenderLanes
          )) {
            workInProgressRootExitStatus = 1;
            logUncaughtError(
              root3,
              createCapturedValueAtFiber(thrownValue, root3.current)
            );
            workInProgress = null;
            return;
          }
        } catch (error) {
          if (null !== returnFiber) throw workInProgress = returnFiber, error;
          workInProgressRootExitStatus = 1;
          logUncaughtError(
            root3,
            createCapturedValueAtFiber(thrownValue, root3.current)
          );
          workInProgress = null;
          return;
        }
        if (unitOfWork.flags & 32768) {
          if (isHydrating || 1 === suspendedReason) root3 = true;
          else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912))
            root3 = false;
          else if (workInProgressRootDidSkipSuspendedSiblings = root3 = true, 2 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason)
            suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
          unwindUnitOfWork(unitOfWork, root3);
        } else completeUnitOfWork(unitOfWork);
      }
      function completeUnitOfWork(unitOfWork) {
        var completedWork = unitOfWork;
        do {
          if (0 !== (completedWork.flags & 32768)) {
            unwindUnitOfWork(
              completedWork,
              workInProgressRootDidSkipSuspendedSiblings
            );
            return;
          }
          unitOfWork = completedWork.return;
          var next = completeWork(
            completedWork.alternate,
            completedWork,
            entangledRenderLanes
          );
          if (null !== next) {
            workInProgress = next;
            return;
          }
          completedWork = completedWork.sibling;
          if (null !== completedWork) {
            workInProgress = completedWork;
            return;
          }
          workInProgress = completedWork = unitOfWork;
        } while (null !== completedWork);
        0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
      }
      function unwindUnitOfWork(unitOfWork, skipSiblings) {
        do {
          var next = unwindWork(unitOfWork.alternate, unitOfWork);
          if (null !== next) {
            next.flags &= 32767;
            workInProgress = next;
            return;
          }
          next = unitOfWork.return;
          null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
          if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
            workInProgress = unitOfWork;
            return;
          }
          workInProgress = unitOfWork = next;
        } while (null !== unitOfWork);
        workInProgressRootExitStatus = 6;
        workInProgress = null;
      }
      function commitRoot(root3, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
        var prevTransition = ReactSharedInternals.T, previousUpdateLanePriority = ReactDOMSharedInternals.p;
        try {
          ReactDOMSharedInternals.p = 2, ReactSharedInternals.T = null, commitRootImpl(
            root3,
            recoverableErrors,
            transitions,
            didIncludeRenderPhaseUpdate,
            previousUpdateLanePriority,
            spawnedLane,
            updatedLanes,
            suspendedRetryLanes,
            suspendedCommitReason,
            completedRenderStartTime,
            completedRenderEndTime
          );
        } finally {
          ReactSharedInternals.T = prevTransition, ReactDOMSharedInternals.p = previousUpdateLanePriority;
        }
      }
      function commitRootImpl(root3, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, renderPriorityLevel, spawnedLane, updatedLanes, suspendedRetryLanes) {
        do
          flushPassiveEffects();
        while (null !== rootWithPendingPassiveEffects);
        if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
        var finishedWork = root3.finishedWork;
        didIncludeRenderPhaseUpdate = root3.finishedLanes;
        if (null === finishedWork) return null;
        root3.finishedWork = null;
        root3.finishedLanes = 0;
        if (finishedWork === root3.current) throw Error(formatProdErrorMessage(177));
        root3.callbackNode = null;
        root3.callbackPriority = 0;
        root3.cancelPendingCommit = null;
        var remainingLanes = finishedWork.lanes | finishedWork.childLanes;
        remainingLanes |= concurrentlyUpdatedLanes;
        markRootFinished(
          root3,
          didIncludeRenderPhaseUpdate,
          remainingLanes,
          spawnedLane,
          updatedLanes,
          suspendedRetryLanes
        );
        root3 === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
        0 === (finishedWork.subtreeFlags & 10256) && 0 === (finishedWork.flags & 10256) || rootDoesHavePassiveEffects || (rootDoesHavePassiveEffects = true, pendingPassiveEffectsRemainingLanes = remainingLanes, pendingPassiveTransitions = transitions, scheduleCallback$1(NormalPriority$1, function() {
          flushPassiveEffects(true);
          return null;
        }));
        transitions = 0 !== (finishedWork.flags & 15990);
        0 !== (finishedWork.subtreeFlags & 15990) || transitions ? (transitions = ReactSharedInternals.T, ReactSharedInternals.T = null, spawnedLane = ReactDOMSharedInternals.p, ReactDOMSharedInternals.p = 2, updatedLanes = executionContext, executionContext |= 4, commitBeforeMutationEffects(root3, finishedWork), commitMutationEffectsOnFiber(finishedWork, root3), restoreSelection(selectionInformation, root3.containerInfo), _enabled = !!eventsEnabled, selectionInformation = eventsEnabled = null, root3.current = finishedWork, commitLayoutEffectOnFiber(root3, finishedWork.alternate, finishedWork), requestPaint(), executionContext = updatedLanes, ReactDOMSharedInternals.p = spawnedLane, ReactSharedInternals.T = transitions) : root3.current = finishedWork;
        rootDoesHavePassiveEffects ? (rootDoesHavePassiveEffects = false, rootWithPendingPassiveEffects = root3, pendingPassiveEffectsLanes = didIncludeRenderPhaseUpdate) : releaseRootPooledCache(root3, remainingLanes);
        remainingLanes = root3.pendingLanes;
        0 === remainingLanes && (legacyErrorBoundariesThatAlreadyFailed = null);
        onCommitRoot(finishedWork.stateNode, renderPriorityLevel);
        ensureRootIsScheduled(root3);
        if (null !== recoverableErrors)
          for (renderPriorityLevel = root3.onRecoverableError, finishedWork = 0; finishedWork < recoverableErrors.length; finishedWork++)
            remainingLanes = recoverableErrors[finishedWork], renderPriorityLevel(remainingLanes.value, {
              componentStack: remainingLanes.stack
            });
        0 !== (pendingPassiveEffectsLanes & 3) && flushPassiveEffects();
        remainingLanes = root3.pendingLanes;
        0 !== (didIncludeRenderPhaseUpdate & 4194218) && 0 !== (remainingLanes & 42) ? root3 === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root3) : nestedUpdateCount = 0;
        flushSyncWorkAcrossRoots_impl(0, false);
        return null;
      }
      function releaseRootPooledCache(root3, remainingLanes) {
        0 === (root3.pooledCacheLanes &= remainingLanes) && (remainingLanes = root3.pooledCache, null != remainingLanes && (root3.pooledCache = null, releaseCache(remainingLanes)));
      }
      function flushPassiveEffects() {
        if (null !== rootWithPendingPassiveEffects) {
          var root$170 = rootWithPendingPassiveEffects, remainingLanes = pendingPassiveEffectsRemainingLanes;
          pendingPassiveEffectsRemainingLanes = 0;
          var renderPriority = lanesToEventPriority(pendingPassiveEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
          try {
            ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
            ReactSharedInternals.T = null;
            if (null === rootWithPendingPassiveEffects)
              var JSCompiler_inline_result = false;
            else {
              renderPriority = pendingPassiveTransitions;
              pendingPassiveTransitions = null;
              var root3 = rootWithPendingPassiveEffects, lanes = pendingPassiveEffectsLanes;
              rootWithPendingPassiveEffects = null;
              pendingPassiveEffectsLanes = 0;
              if (0 !== (executionContext & 6))
                throw Error(formatProdErrorMessage(331));
              var prevExecutionContext = executionContext;
              executionContext |= 4;
              commitPassiveUnmountOnFiber(root3.current);
              commitPassiveMountOnFiber(root3, root3.current, lanes, renderPriority);
              executionContext = prevExecutionContext;
              flushSyncWorkAcrossRoots_impl(0, false);
              if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot)
                try {
                  injectedHook.onPostCommitFiberRoot(rendererID, root3);
                } catch (err) {
                }
              JSCompiler_inline_result = true;
            }
            return JSCompiler_inline_result;
          } finally {
            ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root$170, remainingLanes);
          }
        }
        return false;
      }
      function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
        sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
        sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
        rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
        null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
      }
      function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
        if (3 === sourceFiber.tag)
          captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
        else
          for (; null !== nearestMountedAncestor; ) {
            if (3 === nearestMountedAncestor.tag) {
              captureCommitPhaseErrorOnRoot(
                nearestMountedAncestor,
                sourceFiber,
                error
              );
              break;
            } else if (1 === nearestMountedAncestor.tag) {
              var instance = nearestMountedAncestor.stateNode;
              if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
                sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
                error = createClassErrorUpdate(2);
                instance = enqueueUpdate(nearestMountedAncestor, error, 2);
                null !== instance && (initializeClassErrorUpdate(
                  error,
                  instance,
                  nearestMountedAncestor,
                  sourceFiber
                ), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
                break;
              }
            }
            nearestMountedAncestor = nearestMountedAncestor.return;
          }
      }
      function attachPingListener(root3, wakeable, lanes) {
        var pingCache = root3.pingCache;
        if (null === pingCache) {
          pingCache = root3.pingCache = new PossiblyWeakMap();
          var threadIDs = /* @__PURE__ */ new Set();
          pingCache.set(wakeable, threadIDs);
        } else
          threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
        threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root3 = pingSuspendedRoot.bind(null, root3, wakeable, lanes), wakeable.then(root3, root3));
      }
      function pingSuspendedRoot(root3, wakeable, pingedLanes) {
        var pingCache = root3.pingCache;
        null !== pingCache && pingCache.delete(wakeable);
        root3.pingedLanes |= root3.suspendedLanes & pingedLanes;
        root3.warmLanes &= ~pingedLanes;
        workInProgressRoot === root3 && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) && prepareFreshStack(root3, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
        ensureRootIsScheduled(root3);
      }
      function retryTimedOutBoundary(boundaryFiber, retryLane) {
        0 === retryLane && (retryLane = claimNextRetryLane());
        boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
        null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
      }
      function retryDehydratedSuspenseBoundary(boundaryFiber) {
        var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
        null !== suspenseState && (retryLane = suspenseState.retryLane);
        retryTimedOutBoundary(boundaryFiber, retryLane);
      }
      function resolveRetryWakeable(boundaryFiber, wakeable) {
        var retryLane = 0;
        switch (boundaryFiber.tag) {
          case 13:
            var retryCache = boundaryFiber.stateNode;
            var suspenseState = boundaryFiber.memoizedState;
            null !== suspenseState && (retryLane = suspenseState.retryLane);
            break;
          case 19:
            retryCache = boundaryFiber.stateNode;
            break;
          case 22:
            retryCache = boundaryFiber.stateNode._retryCache;
            break;
          default:
            throw Error(formatProdErrorMessage(314));
        }
        null !== retryCache && retryCache.delete(wakeable);
        retryTimedOutBoundary(boundaryFiber, retryLane);
      }
      function scheduleCallback$1(priorityLevel, callback) {
        return scheduleCallback$3(priorityLevel, callback);
      }
      var firstScheduledRoot = null;
      var lastScheduledRoot = null;
      var didScheduleMicrotask = false;
      var mightHavePendingSyncWork = false;
      var isFlushingWork = false;
      var currentEventTransitionLane = 0;
      function ensureRootIsScheduled(root3) {
        root3 !== lastScheduledRoot && null === root3.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root3 : lastScheduledRoot = lastScheduledRoot.next = root3);
        mightHavePendingSyncWork = true;
        didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateTask(processRootScheduleInMicrotask));
      }
      function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
        if (!isFlushingWork && mightHavePendingSyncWork) {
          isFlushingWork = true;
          do {
            var didPerformSomeWork = false;
            for (var root$172 = firstScheduledRoot; null !== root$172; ) {
              if (!onlyLegacy)
                if (0 !== syncTransitionLanes) {
                  var pendingLanes = root$172.pendingLanes;
                  if (0 === pendingLanes) var JSCompiler_inline_result = 0;
                  else {
                    var suspendedLanes = root$172.suspendedLanes, pingedLanes = root$172.pingedLanes;
                    JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
                    JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
                    JSCompiler_inline_result = JSCompiler_inline_result & 201326677 ? JSCompiler_inline_result & 201326677 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
                  }
                  0 !== JSCompiler_inline_result && (didPerformSomeWork = true, performSyncWorkOnRoot(root$172, JSCompiler_inline_result));
                } else
                  JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(
                    root$172,
                    root$172 === workInProgressRoot ? JSCompiler_inline_result : 0
                  ), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$172, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root$172, JSCompiler_inline_result));
              root$172 = root$172.next;
            }
          } while (didPerformSomeWork);
          isFlushingWork = false;
        }
      }
      function processRootScheduleInMicrotask() {
        mightHavePendingSyncWork = didScheduleMicrotask = false;
        var syncTransitionLanes = 0;
        0 !== currentEventTransitionLane && (shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane), currentEventTransitionLane = 0);
        for (var currentTime = now(), prev = null, root3 = firstScheduledRoot; null !== root3; ) {
          var next = root3.next, nextLanes = scheduleTaskForRootDuringMicrotask(root3, currentTime);
          if (0 === nextLanes)
            root3.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
          else if (prev = root3, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3))
            mightHavePendingSyncWork = true;
          root3 = next;
        }
        flushSyncWorkAcrossRoots_impl(syncTransitionLanes, false);
      }
      function scheduleTaskForRootDuringMicrotask(root3, currentTime) {
        for (var suspendedLanes = root3.suspendedLanes, pingedLanes = root3.pingedLanes, expirationTimes = root3.expirationTimes, lanes = root3.pendingLanes & -62914561; 0 < lanes; ) {
          var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
          if (-1 === expirationTime) {
            if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes))
              expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
          } else expirationTime <= currentTime && (root3.expiredLanes |= lane);
          lanes &= ~lane;
        }
        currentTime = workInProgressRoot;
        suspendedLanes = workInProgressRootRenderLanes;
        suspendedLanes = getNextLanes(
          root3,
          root3 === currentTime ? suspendedLanes : 0
        );
        pingedLanes = root3.callbackNode;
        if (0 === suspendedLanes || root3 === currentTime && 2 === workInProgressSuspendedReason || null !== root3.cancelPendingCommit)
          return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root3.callbackNode = null, root3.callbackPriority = 0;
        if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root3, suspendedLanes)) {
          currentTime = suspendedLanes & -suspendedLanes;
          if (currentTime === root3.callbackPriority) return currentTime;
          null !== pingedLanes && cancelCallback$1(pingedLanes);
          switch (lanesToEventPriority(suspendedLanes)) {
            case 2:
            case 8:
              suspendedLanes = UserBlockingPriority;
              break;
            case 32:
              suspendedLanes = NormalPriority$1;
              break;
            case 268435456:
              suspendedLanes = IdlePriority;
              break;
            default:
              suspendedLanes = NormalPriority$1;
          }
          pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root3);
          suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
          root3.callbackPriority = currentTime;
          root3.callbackNode = suspendedLanes;
          return currentTime;
        }
        null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
        root3.callbackPriority = 2;
        root3.callbackNode = null;
        return 2;
      }
      function performWorkOnRootViaSchedulerTask(root3, didTimeout) {
        var originalCallbackNode = root3.callbackNode;
        if (flushPassiveEffects() && root3.callbackNode !== originalCallbackNode)
          return null;
        var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
        workInProgressRootRenderLanes$jscomp$0 = getNextLanes(
          root3,
          root3 === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0
        );
        if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
        performWorkOnRoot(root3, workInProgressRootRenderLanes$jscomp$0, didTimeout);
        scheduleTaskForRootDuringMicrotask(root3, now());
        return null != root3.callbackNode && root3.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root3) : null;
      }
      function performSyncWorkOnRoot(root3, lanes) {
        if (flushPassiveEffects()) return null;
        performWorkOnRoot(root3, lanes, true);
      }
      function scheduleImmediateTask(cb) {
        scheduleMicrotask(function() {
          0 !== (executionContext & 6) ? scheduleCallback$3(ImmediatePriority, cb) : cb();
        });
      }
      function requestTransitionLane() {
        0 === currentEventTransitionLane && (currentEventTransitionLane = claimNextTransitionLane());
        return currentEventTransitionLane;
      }
      function coerceFormActionProp(actionProp) {
        return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL("" + actionProp);
      }
      function createFormDataWithSubmitter(form, submitter) {
        var temp = submitter.ownerDocument.createElement("input");
        temp.name = submitter.name;
        temp.value = submitter.value;
        form.id && temp.setAttribute("form", form.id);
        submitter.parentNode.insertBefore(temp, submitter);
        form = new FormData(form);
        temp.parentNode.removeChild(temp);
        return form;
      }
      function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
        if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
          var action = coerceFormActionProp(
            (nativeEventTarget[internalPropsKey] || null).action
          ), submitter = nativeEvent.submitter;
          submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
          var event = new SyntheticEvent(
            "action",
            "action",
            null,
            nativeEvent,
            nativeEventTarget
          );
          dispatchQueue.push({
            event,
            listeners: [
              {
                instance: null,
                listener: function() {
                  if (nativeEvent.defaultPrevented) {
                    if (0 !== currentEventTransitionLane) {
                      var formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget);
                      startHostTransition(
                        maybeTargetInst,
                        {
                          pending: true,
                          data: formData,
                          method: nativeEventTarget.method,
                          action
                        },
                        null,
                        formData
                      );
                    }
                  } else
                    "function" === typeof action && (event.preventDefault(), formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget), startHostTransition(
                      maybeTargetInst,
                      {
                        pending: true,
                        data: formData,
                        method: nativeEventTarget.method,
                        action
                      },
                      action,
                      formData
                    ));
                },
                currentTarget: nativeEventTarget
              }
            ]
          });
        }
      }
      for (i$jscomp$inline_1439 = 0; i$jscomp$inline_1439 < simpleEventPluginEvents.length; i$jscomp$inline_1439++) {
        eventName$jscomp$inline_1440 = simpleEventPluginEvents[i$jscomp$inline_1439], domEventName$jscomp$inline_1441 = eventName$jscomp$inline_1440.toLowerCase(), capitalizedEvent$jscomp$inline_1442 = eventName$jscomp$inline_1440[0].toUpperCase() + eventName$jscomp$inline_1440.slice(1);
        registerSimpleEvent(
          domEventName$jscomp$inline_1441,
          "on" + capitalizedEvent$jscomp$inline_1442
        );
      }
      var eventName$jscomp$inline_1440;
      var domEventName$jscomp$inline_1441;
      var capitalizedEvent$jscomp$inline_1442;
      var i$jscomp$inline_1439;
      registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
      registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
      registerSimpleEvent(ANIMATION_START, "onAnimationStart");
      registerSimpleEvent("dblclick", "onDoubleClick");
      registerSimpleEvent("focusin", "onFocus");
      registerSimpleEvent("focusout", "onBlur");
      registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
      registerSimpleEvent(TRANSITION_START, "onTransitionStart");
      registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
      registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
      registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
      registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
      registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
      registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
      registerTwoPhaseEvent(
        "onChange",
        "change click focusin focusout input keydown keyup selectionchange".split(" ")
      );
      registerTwoPhaseEvent(
        "onSelect",
        "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
          " "
        )
      );
      registerTwoPhaseEvent("onBeforeInput", [
        "compositionend",
        "keypress",
        "textInput",
        "paste"
      ]);
      registerTwoPhaseEvent(
        "onCompositionEnd",
        "compositionend focusout keydown keypress keyup mousedown".split(" ")
      );
      registerTwoPhaseEvent(
        "onCompositionStart",
        "compositionstart focusout keydown keypress keyup mousedown".split(" ")
      );
      registerTwoPhaseEvent(
        "onCompositionUpdate",
        "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
      );
      var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " "
      );
      var nonDelegatedEvents = new Set(
        "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes)
      );
      function processDispatchQueue(dispatchQueue, eventSystemFlags) {
        eventSystemFlags = 0 !== (eventSystemFlags & 4);
        for (var i8 = 0; i8 < dispatchQueue.length; i8++) {
          var _dispatchQueue$i = dispatchQueue[i8], event = _dispatchQueue$i.event;
          _dispatchQueue$i = _dispatchQueue$i.listeners;
          a: {
            var previousInstance = void 0;
            if (eventSystemFlags)
              for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
                var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
                _dispatchListeners$i = _dispatchListeners$i.listener;
                if (instance !== previousInstance && event.isPropagationStopped())
                  break a;
                previousInstance = _dispatchListeners$i;
                event.currentTarget = currentTarget;
                try {
                  previousInstance(event);
                } catch (error) {
                  reportGlobalError(error);
                }
                event.currentTarget = null;
                previousInstance = instance;
              }
            else
              for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
                _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
                instance = _dispatchListeners$i.instance;
                currentTarget = _dispatchListeners$i.currentTarget;
                _dispatchListeners$i = _dispatchListeners$i.listener;
                if (instance !== previousInstance && event.isPropagationStopped())
                  break a;
                previousInstance = _dispatchListeners$i;
                event.currentTarget = currentTarget;
                try {
                  previousInstance(event);
                } catch (error) {
                  reportGlobalError(error);
                }
                event.currentTarget = null;
                previousInstance = instance;
              }
          }
        }
      }
      function listenToNonDelegatedEvent(domEventName, targetElement) {
        var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
        void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
        var listenerSetKey = domEventName + "__bubble";
        JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, false), JSCompiler_inline_result.add(listenerSetKey));
      }
      function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
        var eventSystemFlags = 0;
        isCapturePhaseListener && (eventSystemFlags |= 4);
        addTrappedEventListener(
          target,
          domEventName,
          eventSystemFlags,
          isCapturePhaseListener
        );
      }
      var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
      function listenToAllSupportedEvents(rootContainerElement) {
        if (!rootContainerElement[listeningMarker]) {
          rootContainerElement[listeningMarker] = true;
          allNativeEvents.forEach(function(domEventName) {
            "selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, false, rootContainerElement), listenToNativeEvent(domEventName, true, rootContainerElement));
          });
          var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
          null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = true, listenToNativeEvent("selectionchange", false, ownerDocument));
        }
      }
      function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
        switch (getEventPriority(domEventName)) {
          case 2:
            var listenerWrapper = dispatchDiscreteEvent;
            break;
          case 8:
            listenerWrapper = dispatchContinuousEvent;
            break;
          default:
            listenerWrapper = dispatchEvent;
        }
        eventSystemFlags = listenerWrapper.bind(
          null,
          domEventName,
          eventSystemFlags,
          targetContainer
        );
        listenerWrapper = void 0;
        !passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = true);
        isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
          capture: true,
          passive: listenerWrapper
        }) : targetContainer.addEventListener(domEventName, eventSystemFlags, true) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
          passive: listenerWrapper
        }) : targetContainer.addEventListener(domEventName, eventSystemFlags, false);
      }
      function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
        var ancestorInst = targetInst$jscomp$0;
        if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0)
          a: for (; ; ) {
            if (null === targetInst$jscomp$0) return;
            var nodeTag = targetInst$jscomp$0.tag;
            if (3 === nodeTag || 4 === nodeTag) {
              var container2 = targetInst$jscomp$0.stateNode.containerInfo;
              if (container2 === targetContainer || 8 === container2.nodeType && container2.parentNode === targetContainer)
                break;
              if (4 === nodeTag)
                for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag; ) {
                  var grandTag = nodeTag.tag;
                  if (3 === grandTag || 4 === grandTag) {
                    if (grandTag = nodeTag.stateNode.containerInfo, grandTag === targetContainer || 8 === grandTag.nodeType && grandTag.parentNode === targetContainer)
                      return;
                  }
                  nodeTag = nodeTag.return;
                }
              for (; null !== container2; ) {
                nodeTag = getClosestInstanceFromNode(container2);
                if (null === nodeTag) return;
                grandTag = nodeTag.tag;
                if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
                  targetInst$jscomp$0 = ancestorInst = nodeTag;
                  continue a;
                }
                container2 = container2.parentNode;
              }
            }
            targetInst$jscomp$0 = targetInst$jscomp$0.return;
          }
        batchedUpdates$1(function() {
          var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
          a: {
            var reactName = topLevelEventsToReactNames.get(domEventName);
            if (void 0 !== reactName) {
              var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
              switch (domEventName) {
                case "keypress":
                  if (0 === getEventCharCode(nativeEvent)) break a;
                case "keydown":
                case "keyup":
                  SyntheticEventCtor = SyntheticKeyboardEvent;
                  break;
                case "focusin":
                  reactEventType = "focus";
                  SyntheticEventCtor = SyntheticFocusEvent;
                  break;
                case "focusout":
                  reactEventType = "blur";
                  SyntheticEventCtor = SyntheticFocusEvent;
                  break;
                case "beforeblur":
                case "afterblur":
                  SyntheticEventCtor = SyntheticFocusEvent;
                  break;
                case "click":
                  if (2 === nativeEvent.button) break a;
                case "auxclick":
                case "dblclick":
                case "mousedown":
                case "mousemove":
                case "mouseup":
                case "mouseout":
                case "mouseover":
                case "contextmenu":
                  SyntheticEventCtor = SyntheticMouseEvent;
                  break;
                case "drag":
                case "dragend":
                case "dragenter":
                case "dragexit":
                case "dragleave":
                case "dragover":
                case "dragstart":
                case "drop":
                  SyntheticEventCtor = SyntheticDragEvent;
                  break;
                case "touchcancel":
                case "touchend":
                case "touchmove":
                case "touchstart":
                  SyntheticEventCtor = SyntheticTouchEvent;
                  break;
                case ANIMATION_END:
                case ANIMATION_ITERATION:
                case ANIMATION_START:
                  SyntheticEventCtor = SyntheticAnimationEvent;
                  break;
                case TRANSITION_END:
                  SyntheticEventCtor = SyntheticTransitionEvent;
                  break;
                case "scroll":
                case "scrollend":
                  SyntheticEventCtor = SyntheticUIEvent;
                  break;
                case "wheel":
                  SyntheticEventCtor = SyntheticWheelEvent;
                  break;
                case "copy":
                case "cut":
                case "paste":
                  SyntheticEventCtor = SyntheticClipboardEvent;
                  break;
                case "gotpointercapture":
                case "lostpointercapture":
                case "pointercancel":
                case "pointerdown":
                case "pointermove":
                case "pointerout":
                case "pointerover":
                case "pointerup":
                  SyntheticEventCtor = SyntheticPointerEvent;
                  break;
                case "toggle":
                case "beforetoggle":
                  SyntheticEventCtor = SyntheticToggleEvent;
              }
              var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
              inCapturePhase = [];
              for (var instance = targetInst, lastHostComponent; null !== instance; ) {
                var _instance = instance;
                lastHostComponent = _instance.stateNode;
                _instance = _instance.tag;
                5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(
                  createDispatchListener(instance, _instance, lastHostComponent)
                ));
                if (accumulateTargetOnly) break;
                instance = instance.return;
              }
              0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(
                reactName,
                reactEventType,
                null,
                nativeEvent,
                nativeEventTarget
              ), dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
            }
          }
          if (0 === (eventSystemFlags & 7)) {
            a: {
              reactName = "mouseover" === domEventName || "pointerover" === domEventName;
              SyntheticEventCtor = "mouseout" === domEventName || "pointerout" === domEventName;
              if (reactName && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey]))
                break a;
              if (SyntheticEventCtor || reactName) {
                reactName = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (reactName = nativeEventTarget.ownerDocument) ? reactName.defaultView || reactName.parentWindow : window;
                if (SyntheticEventCtor) {
                  if (reactEventType = nativeEvent.relatedTarget || nativeEvent.toElement, SyntheticEventCtor = targetInst, reactEventType = reactEventType ? getClosestInstanceFromNode(reactEventType) : null, null !== reactEventType && (accumulateTargetOnly = getNearestMountedFiber(reactEventType), inCapturePhase = reactEventType.tag, reactEventType !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase))
                    reactEventType = null;
                } else SyntheticEventCtor = null, reactEventType = targetInst;
                if (SyntheticEventCtor !== reactEventType) {
                  inCapturePhase = SyntheticMouseEvent;
                  _instance = "onMouseLeave";
                  reactEventName = "onMouseEnter";
                  instance = "mouse";
                  if ("pointerout" === domEventName || "pointerover" === domEventName)
                    inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
                  accumulateTargetOnly = null == SyntheticEventCtor ? reactName : getNodeFromInstance(SyntheticEventCtor);
                  lastHostComponent = null == reactEventType ? reactName : getNodeFromInstance(reactEventType);
                  reactName = new inCapturePhase(
                    _instance,
                    instance + "leave",
                    SyntheticEventCtor,
                    nativeEvent,
                    nativeEventTarget
                  );
                  reactName.target = accumulateTargetOnly;
                  reactName.relatedTarget = lastHostComponent;
                  _instance = null;
                  getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(
                    reactEventName,
                    instance + "enter",
                    reactEventType,
                    nativeEvent,
                    nativeEventTarget
                  ), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
                  accumulateTargetOnly = _instance;
                  if (SyntheticEventCtor && reactEventType)
                    b: {
                      inCapturePhase = SyntheticEventCtor;
                      reactEventName = reactEventType;
                      instance = 0;
                      for (lastHostComponent = inCapturePhase; lastHostComponent; lastHostComponent = getParent(lastHostComponent))
                        instance++;
                      lastHostComponent = 0;
                      for (_instance = reactEventName; _instance; _instance = getParent(_instance))
                        lastHostComponent++;
                      for (; 0 < instance - lastHostComponent; )
                        inCapturePhase = getParent(inCapturePhase), instance--;
                      for (; 0 < lastHostComponent - instance; )
                        reactEventName = getParent(reactEventName), lastHostComponent--;
                      for (; instance--; ) {
                        if (inCapturePhase === reactEventName || null !== reactEventName && inCapturePhase === reactEventName.alternate)
                          break b;
                        inCapturePhase = getParent(inCapturePhase);
                        reactEventName = getParent(reactEventName);
                      }
                      inCapturePhase = null;
                    }
                  else inCapturePhase = null;
                  null !== SyntheticEventCtor && accumulateEnterLeaveListenersForEvent(
                    dispatchQueue,
                    reactName,
                    SyntheticEventCtor,
                    inCapturePhase,
                    false
                  );
                  null !== reactEventType && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(
                    dispatchQueue,
                    accumulateTargetOnly,
                    reactEventType,
                    inCapturePhase,
                    true
                  );
                }
              }
            }
            a: {
              reactName = targetInst ? getNodeFromInstance(targetInst) : window;
              SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
              if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type)
                var getTargetInstFunc = getTargetInstForChangeEvent;
              else if (isTextInputElement(reactName))
                if (isInputEventSupported)
                  getTargetInstFunc = getTargetInstForInputOrChangeEvent;
                else {
                  getTargetInstFunc = getTargetInstForInputEventPolyfill;
                  var handleEventFunc = handleEventsForInputEventPolyfill;
                }
              else
                SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
              if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
                createAndAccumulateChangeEvent(
                  dispatchQueue,
                  getTargetInstFunc,
                  nativeEvent,
                  nativeEventTarget
                );
                break a;
              }
              handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
              "focusout" === domEventName && targetInst && "number" === reactName.type && null != targetInst.memoizedProps.value && setDefaultValue(reactName, "number", reactName.value);
            }
            handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
            switch (domEventName) {
              case "focusin":
                if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable)
                  activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
                break;
              case "focusout":
                lastSelection = activeElementInst = activeElement = null;
                break;
              case "mousedown":
                mouseDown = true;
                break;
              case "contextmenu":
              case "mouseup":
              case "dragend":
                mouseDown = false;
                constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
                break;
              case "selectionchange":
                if (skipSelectionChangeEvent) break;
              case "keydown":
              case "keyup":
                constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
            }
            var fallbackData;
            if (canUseCompositionEvent)
              b: {
                switch (domEventName) {
                  case "compositionstart":
                    var eventType = "onCompositionStart";
                    break b;
                  case "compositionend":
                    eventType = "onCompositionEnd";
                    break b;
                  case "compositionupdate":
                    eventType = "onCompositionUpdate";
                    break b;
                }
                eventType = void 0;
              }
            else
              isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
            eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root2 = nativeEventTarget, startText = "value" in root2 ? root2.value : root2.textContent, isComposing = true)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(
              eventType,
              domEventName,
              null,
              nativeEvent,
              nativeEventTarget
            ), dispatchQueue.push({ event: eventType, listeners: handleEventFunc }), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
            if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent))
              eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent(
                "onBeforeInput",
                "beforeinput",
                null,
                nativeEvent,
                nativeEventTarget
              ), dispatchQueue.push({
                event: handleEventFunc,
                listeners: eventType
              }), handleEventFunc.data = fallbackData);
            extractEvents$1(
              dispatchQueue,
              domEventName,
              targetInst,
              nativeEvent,
              nativeEventTarget
            );
          }
          processDispatchQueue(dispatchQueue, eventSystemFlags);
        });
      }
      function createDispatchListener(instance, listener, currentTarget) {
        return {
          instance,
          listener,
          currentTarget
        };
      }
      function accumulateTwoPhaseListeners(targetFiber, reactName) {
        for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber; ) {
          var _instance2 = targetFiber, stateNode = _instance2.stateNode;
          _instance2 = _instance2.tag;
          5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(
            createDispatchListener(targetFiber, _instance2, stateNode)
          ), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(
            createDispatchListener(targetFiber, _instance2, stateNode)
          ));
          targetFiber = targetFiber.return;
        }
        return listeners;
      }
      function getParent(inst) {
        if (null === inst) return null;
        do
          inst = inst.return;
        while (inst && 5 !== inst.tag && 27 !== inst.tag);
        return inst ? inst : null;
      }
      function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
        for (var registrationName = event._reactName, listeners = []; null !== target && target !== common; ) {
          var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
          _instance3 = _instance3.tag;
          if (null !== alternate && alternate === common) break;
          5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(
            createDispatchListener(target, stateNode, alternate)
          )) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(
            createDispatchListener(target, stateNode, alternate)
          )));
          target = target.return;
        }
        0 !== listeners.length && dispatchQueue.push({ event, listeners });
      }
      var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
      var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
      function normalizeMarkupForTextOrAttribute(markup) {
        return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
      }
      function checkForUnmatchedText(serverText, clientText) {
        clientText = normalizeMarkupForTextOrAttribute(clientText);
        return normalizeMarkupForTextOrAttribute(serverText) === clientText ? true : false;
      }
      function noop$1() {
      }
      function setProp(domElement, tag, key, value, props, prevValue) {
        switch (key) {
          case "children":
            "string" === typeof value ? "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && "body" !== tag && setTextContent(domElement, "" + value);
            break;
          case "className":
            setValueForKnownAttribute(domElement, "class", value);
            break;
          case "tabIndex":
            setValueForKnownAttribute(domElement, "tabindex", value);
            break;
          case "dir":
          case "role":
          case "viewBox":
          case "width":
          case "height":
            setValueForKnownAttribute(domElement, key, value);
            break;
          case "style":
            setValueForStyles(domElement, value, prevValue);
            break;
          case "data":
            if ("object" !== tag) {
              setValueForKnownAttribute(domElement, "data", value);
              break;
            }
          case "src":
          case "href":
            if ("" === value && ("a" !== tag || "href" !== key)) {
              domElement.removeAttribute(key);
              break;
            }
            if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
              domElement.removeAttribute(key);
              break;
            }
            value = sanitizeURL("" + value);
            domElement.setAttribute(key, value);
            break;
          case "action":
          case "formAction":
            if ("function" === typeof value) {
              domElement.setAttribute(
                key,
                "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
              );
              break;
            } else
              "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(
                domElement,
                tag,
                "formEncType",
                props.formEncType,
                props,
                null
              ), setProp(
                domElement,
                tag,
                "formMethod",
                props.formMethod,
                props,
                null
              ), setProp(
                domElement,
                tag,
                "formTarget",
                props.formTarget,
                props,
                null
              )) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
            if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
              domElement.removeAttribute(key);
              break;
            }
            value = sanitizeURL("" + value);
            domElement.setAttribute(key, value);
            break;
          case "onClick":
            null != value && (domElement.onclick = noop$1);
            break;
          case "onScroll":
            null != value && listenToNonDelegatedEvent("scroll", domElement);
            break;
          case "onScrollEnd":
            null != value && listenToNonDelegatedEvent("scrollend", domElement);
            break;
          case "dangerouslySetInnerHTML":
            if (null != value) {
              if ("object" !== typeof value || !("__html" in value))
                throw Error(formatProdErrorMessage(61));
              key = value.__html;
              if (null != key) {
                if (null != props.children) throw Error(formatProdErrorMessage(60));
                domElement.innerHTML = key;
              }
            }
            break;
          case "multiple":
            domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
            break;
          case "muted":
            domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
            break;
          case "suppressContentEditableWarning":
          case "suppressHydrationWarning":
          case "defaultValue":
          case "defaultChecked":
          case "innerHTML":
          case "ref":
            break;
          case "autoFocus":
            break;
          case "xlinkHref":
            if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
              domElement.removeAttribute("xlink:href");
              break;
            }
            key = sanitizeURL("" + value);
            domElement.setAttributeNS(
              "http://www.w3.org/1999/xlink",
              "xlink:href",
              key
            );
            break;
          case "contentEditable":
          case "spellCheck":
          case "draggable":
          case "value":
          case "autoReverse":
          case "externalResourcesRequired":
          case "focusable":
          case "preserveAlpha":
            null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "" + value) : domElement.removeAttribute(key);
            break;
          case "inert":
          case "allowFullScreen":
          case "async":
          case "autoPlay":
          case "controls":
          case "default":
          case "defer":
          case "disabled":
          case "disablePictureInPicture":
          case "disableRemotePlayback":
          case "formNoValidate":
          case "hidden":
          case "loop":
          case "noModule":
          case "noValidate":
          case "open":
          case "playsInline":
          case "readOnly":
          case "required":
          case "reversed":
          case "scoped":
          case "seamless":
          case "itemScope":
            value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
            break;
          case "capture":
          case "download":
            true === value ? domElement.setAttribute(key, "") : false !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
            break;
          case "cols":
          case "rows":
          case "size":
          case "span":
            null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
            break;
          case "rowSpan":
          case "start":
            null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
            break;
          case "popover":
            listenToNonDelegatedEvent("beforetoggle", domElement);
            listenToNonDelegatedEvent("toggle", domElement);
            setValueForAttribute(domElement, "popover", value);
            break;
          case "xlinkActuate":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:actuate",
              value
            );
            break;
          case "xlinkArcrole":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:arcrole",
              value
            );
            break;
          case "xlinkRole":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:role",
              value
            );
            break;
          case "xlinkShow":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:show",
              value
            );
            break;
          case "xlinkTitle":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:title",
              value
            );
            break;
          case "xlinkType":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:type",
              value
            );
            break;
          case "xmlBase":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/XML/1998/namespace",
              "xml:base",
              value
            );
            break;
          case "xmlLang":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/XML/1998/namespace",
              "xml:lang",
              value
            );
            break;
          case "xmlSpace":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/XML/1998/namespace",
              "xml:space",
              value
            );
            break;
          case "is":
            setValueForAttribute(domElement, "is", value);
            break;
          case "innerText":
          case "textContent":
            break;
          default:
            if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1])
              key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
        }
      }
      function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
        switch (key) {
          case "style":
            setValueForStyles(domElement, value, prevValue);
            break;
          case "dangerouslySetInnerHTML":
            if (null != value) {
              if ("object" !== typeof value || !("__html" in value))
                throw Error(formatProdErrorMessage(61));
              key = value.__html;
              if (null != key) {
                if (null != props.children) throw Error(formatProdErrorMessage(60));
                domElement.innerHTML = key;
              }
            }
            break;
          case "children":
            "string" === typeof value ? setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && setTextContent(domElement, "" + value);
            break;
          case "onScroll":
            null != value && listenToNonDelegatedEvent("scroll", domElement);
            break;
          case "onScrollEnd":
            null != value && listenToNonDelegatedEvent("scrollend", domElement);
            break;
          case "onClick":
            null != value && (domElement.onclick = noop$1);
            break;
          case "suppressContentEditableWarning":
          case "suppressHydrationWarning":
          case "innerHTML":
          case "ref":
            break;
          case "innerText":
          case "textContent":
            break;
          default:
            if (!registrationNameDependencies.hasOwnProperty(key))
              a: {
                if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), tag = key.slice(2, props ? key.length - 7 : void 0), prevValue = domElement[internalPropsKey] || null, prevValue = null != prevValue ? prevValue[key] : null, "function" === typeof prevValue && domElement.removeEventListener(tag, prevValue, props), "function" === typeof value)) {
                  "function" !== typeof prevValue && null !== prevValue && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
                  domElement.addEventListener(tag, value, props);
                  break a;
                }
                key in domElement ? domElement[key] = value : true === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
              }
        }
      }
      function setInitialProperties(domElement, tag, props) {
        switch (tag) {
          case "div":
          case "span":
          case "svg":
          case "path":
          case "a":
          case "g":
          case "p":
          case "li":
            break;
          case "img":
            listenToNonDelegatedEvent("error", domElement);
            listenToNonDelegatedEvent("load", domElement);
            var hasSrc = false, hasSrcSet = false, propKey;
            for (propKey in props)
              if (props.hasOwnProperty(propKey)) {
                var propValue = props[propKey];
                if (null != propValue)
                  switch (propKey) {
                    case "src":
                      hasSrc = true;
                      break;
                    case "srcSet":
                      hasSrcSet = true;
                      break;
                    case "children":
                    case "dangerouslySetInnerHTML":
                      throw Error(formatProdErrorMessage(137, tag));
                    default:
                      setProp(domElement, tag, propKey, propValue, props, null);
                  }
              }
            hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
            hasSrc && setProp(domElement, tag, "src", props.src, props, null);
            return;
          case "input":
            listenToNonDelegatedEvent("invalid", domElement);
            var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
            for (hasSrc in props)
              if (props.hasOwnProperty(hasSrc)) {
                var propValue$186 = props[hasSrc];
                if (null != propValue$186)
                  switch (hasSrc) {
                    case "name":
                      hasSrcSet = propValue$186;
                      break;
                    case "type":
                      propValue = propValue$186;
                      break;
                    case "checked":
                      checked = propValue$186;
                      break;
                    case "defaultChecked":
                      defaultChecked = propValue$186;
                      break;
                    case "value":
                      propKey = propValue$186;
                      break;
                    case "defaultValue":
                      defaultValue = propValue$186;
                      break;
                    case "children":
                    case "dangerouslySetInnerHTML":
                      if (null != propValue$186)
                        throw Error(formatProdErrorMessage(137, tag));
                      break;
                    default:
                      setProp(domElement, tag, hasSrc, propValue$186, props, null);
                  }
              }
            initInput(
              domElement,
              propKey,
              defaultValue,
              checked,
              defaultChecked,
              propValue,
              hasSrcSet,
              false
            );
            track(domElement);
            return;
          case "select":
            listenToNonDelegatedEvent("invalid", domElement);
            hasSrc = propValue = propKey = null;
            for (hasSrcSet in props)
              if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue))
                switch (hasSrcSet) {
                  case "value":
                    propKey = defaultValue;
                    break;
                  case "defaultValue":
                    propValue = defaultValue;
                    break;
                  case "multiple":
                    hasSrc = defaultValue;
                  default:
                    setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
                }
            tag = propKey;
            props = propValue;
            domElement.multiple = !!hasSrc;
            null != tag ? updateOptions(domElement, !!hasSrc, tag, false) : null != props && updateOptions(domElement, !!hasSrc, props, true);
            return;
          case "textarea":
            listenToNonDelegatedEvent("invalid", domElement);
            propKey = hasSrcSet = hasSrc = null;
            for (propValue in props)
              if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue))
                switch (propValue) {
                  case "value":
                    hasSrc = defaultValue;
                    break;
                  case "defaultValue":
                    hasSrcSet = defaultValue;
                    break;
                  case "children":
                    propKey = defaultValue;
                    break;
                  case "dangerouslySetInnerHTML":
                    if (null != defaultValue) throw Error(formatProdErrorMessage(91));
                    break;
                  default:
                    setProp(domElement, tag, propValue, defaultValue, props, null);
                }
            initTextarea(domElement, hasSrc, hasSrcSet, propKey);
            track(domElement);
            return;
          case "option":
            for (checked in props)
              if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc))
                switch (checked) {
                  case "selected":
                    domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
                    break;
                  default:
                    setProp(domElement, tag, checked, hasSrc, props, null);
                }
            return;
          case "dialog":
            listenToNonDelegatedEvent("cancel", domElement);
            listenToNonDelegatedEvent("close", domElement);
            break;
          case "iframe":
          case "object":
            listenToNonDelegatedEvent("load", domElement);
            break;
          case "video":
          case "audio":
            for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++)
              listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
            break;
          case "image":
            listenToNonDelegatedEvent("error", domElement);
            listenToNonDelegatedEvent("load", domElement);
            break;
          case "details":
            listenToNonDelegatedEvent("toggle", domElement);
            break;
          case "embed":
          case "source":
          case "link":
            listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
          case "area":
          case "base":
          case "br":
          case "col":
          case "hr":
          case "keygen":
          case "meta":
          case "param":
          case "track":
          case "wbr":
          case "menuitem":
            for (defaultChecked in props)
              if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc))
                switch (defaultChecked) {
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(formatProdErrorMessage(137, tag));
                  default:
                    setProp(domElement, tag, defaultChecked, hasSrc, props, null);
                }
            return;
          default:
            if (isCustomElement(tag)) {
              for (propValue$186 in props)
                props.hasOwnProperty(propValue$186) && (hasSrc = props[propValue$186], void 0 !== hasSrc && setPropOnCustomElement(
                  domElement,
                  tag,
                  propValue$186,
                  hasSrc,
                  props,
                  void 0
                ));
              return;
            }
        }
        for (defaultValue in props)
          props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
      }
      function updateProperties(domElement, tag, lastProps, nextProps) {
        switch (tag) {
          case "div":
          case "span":
          case "svg":
          case "path":
          case "a":
          case "g":
          case "p":
          case "li":
            break;
          case "input":
            var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
            for (propKey in lastProps) {
              var lastProp = lastProps[propKey];
              if (lastProps.hasOwnProperty(propKey) && null != lastProp)
                switch (propKey) {
                  case "checked":
                    break;
                  case "value":
                    break;
                  case "defaultValue":
                    lastDefaultValue = lastProp;
                  default:
                    nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
                }
            }
            for (var propKey$203 in nextProps) {
              var propKey = nextProps[propKey$203];
              lastProp = lastProps[propKey$203];
              if (nextProps.hasOwnProperty(propKey$203) && (null != propKey || null != lastProp))
                switch (propKey$203) {
                  case "type":
                    type = propKey;
                    break;
                  case "name":
                    name = propKey;
                    break;
                  case "checked":
                    checked = propKey;
                    break;
                  case "defaultChecked":
                    defaultChecked = propKey;
                    break;
                  case "value":
                    value = propKey;
                    break;
                  case "defaultValue":
                    defaultValue = propKey;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (null != propKey)
                      throw Error(formatProdErrorMessage(137, tag));
                    break;
                  default:
                    propKey !== lastProp && setProp(
                      domElement,
                      tag,
                      propKey$203,
                      propKey,
                      nextProps,
                      lastProp
                    );
                }
            }
            updateInput(
              domElement,
              value,
              defaultValue,
              lastDefaultValue,
              checked,
              defaultChecked,
              type,
              name
            );
            return;
          case "select":
            propKey = value = defaultValue = propKey$203 = null;
            for (type in lastProps)
              if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue)
                switch (type) {
                  case "value":
                    break;
                  case "multiple":
                    propKey = lastDefaultValue;
                  default:
                    nextProps.hasOwnProperty(type) || setProp(
                      domElement,
                      tag,
                      type,
                      null,
                      nextProps,
                      lastDefaultValue
                    );
                }
            for (name in nextProps)
              if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue))
                switch (name) {
                  case "value":
                    propKey$203 = type;
                    break;
                  case "defaultValue":
                    defaultValue = type;
                    break;
                  case "multiple":
                    value = type;
                  default:
                    type !== lastDefaultValue && setProp(
                      domElement,
                      tag,
                      name,
                      type,
                      nextProps,
                      lastDefaultValue
                    );
                }
            tag = defaultValue;
            lastProps = value;
            nextProps = propKey;
            null != propKey$203 ? updateOptions(domElement, !!lastProps, propKey$203, false) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, true) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", false));
            return;
          case "textarea":
            propKey = propKey$203 = null;
            for (defaultValue in lastProps)
              if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue))
                switch (defaultValue) {
                  case "value":
                    break;
                  case "children":
                    break;
                  default:
                    setProp(domElement, tag, defaultValue, null, nextProps, name);
                }
            for (value in nextProps)
              if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type))
                switch (value) {
                  case "value":
                    propKey$203 = name;
                    break;
                  case "defaultValue":
                    propKey = name;
                    break;
                  case "children":
                    break;
                  case "dangerouslySetInnerHTML":
                    if (null != name) throw Error(formatProdErrorMessage(91));
                    break;
                  default:
                    name !== type && setProp(domElement, tag, value, name, nextProps, type);
                }
            updateTextarea(domElement, propKey$203, propKey);
            return;
          case "option":
            for (var propKey$219 in lastProps)
              if (propKey$203 = lastProps[propKey$219], lastProps.hasOwnProperty(propKey$219) && null != propKey$203 && !nextProps.hasOwnProperty(propKey$219))
                switch (propKey$219) {
                  case "selected":
                    domElement.selected = false;
                    break;
                  default:
                    setProp(
                      domElement,
                      tag,
                      propKey$219,
                      null,
                      nextProps,
                      propKey$203
                    );
                }
            for (lastDefaultValue in nextProps)
              if (propKey$203 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$203 !== propKey && (null != propKey$203 || null != propKey))
                switch (lastDefaultValue) {
                  case "selected":
                    domElement.selected = propKey$203 && "function" !== typeof propKey$203 && "symbol" !== typeof propKey$203;
                    break;
                  default:
                    setProp(
                      domElement,
                      tag,
                      lastDefaultValue,
                      propKey$203,
                      nextProps,
                      propKey
                    );
                }
            return;
          case "img":
          case "link":
          case "area":
          case "base":
          case "br":
          case "col":
          case "embed":
          case "hr":
          case "keygen":
          case "meta":
          case "param":
          case "source":
          case "track":
          case "wbr":
          case "menuitem":
            for (var propKey$224 in lastProps)
              propKey$203 = lastProps[propKey$224], lastProps.hasOwnProperty(propKey$224) && null != propKey$203 && !nextProps.hasOwnProperty(propKey$224) && setProp(domElement, tag, propKey$224, null, nextProps, propKey$203);
            for (checked in nextProps)
              if (propKey$203 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$203 !== propKey && (null != propKey$203 || null != propKey))
                switch (checked) {
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (null != propKey$203)
                      throw Error(formatProdErrorMessage(137, tag));
                    break;
                  default:
                    setProp(
                      domElement,
                      tag,
                      checked,
                      propKey$203,
                      nextProps,
                      propKey
                    );
                }
            return;
          default:
            if (isCustomElement(tag)) {
              for (var propKey$229 in lastProps)
                propKey$203 = lastProps[propKey$229], lastProps.hasOwnProperty(propKey$229) && void 0 !== propKey$203 && !nextProps.hasOwnProperty(propKey$229) && setPropOnCustomElement(
                  domElement,
                  tag,
                  propKey$229,
                  void 0,
                  nextProps,
                  propKey$203
                );
              for (defaultChecked in nextProps)
                propKey$203 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$203 === propKey || void 0 === propKey$203 && void 0 === propKey || setPropOnCustomElement(
                  domElement,
                  tag,
                  defaultChecked,
                  propKey$203,
                  nextProps,
                  propKey
                );
              return;
            }
        }
        for (var propKey$234 in lastProps)
          propKey$203 = lastProps[propKey$234], lastProps.hasOwnProperty(propKey$234) && null != propKey$203 && !nextProps.hasOwnProperty(propKey$234) && setProp(domElement, tag, propKey$234, null, nextProps, propKey$203);
        for (lastProp in nextProps)
          propKey$203 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$203 === propKey || null == propKey$203 && null == propKey || setProp(domElement, tag, lastProp, propKey$203, nextProps, propKey);
      }
      var eventsEnabled = null;
      var selectionInformation = null;
      function getOwnerDocumentFromRootContainer(rootContainerElement) {
        return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
      }
      function getOwnHostContext(namespaceURI) {
        switch (namespaceURI) {
          case "http://www.w3.org/2000/svg":
            return 1;
          case "http://www.w3.org/1998/Math/MathML":
            return 2;
          default:
            return 0;
        }
      }
      function getChildHostContextProd(parentNamespace, type) {
        if (0 === parentNamespace)
          switch (type) {
            case "svg":
              return 1;
            case "math":
              return 2;
            default:
              return 0;
          }
        return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
      }
      function shouldSetTextContent(type, props) {
        return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
      }
      var currentPopstateTransitionEvent = null;
      function shouldAttemptEagerTransition() {
        var event = window.event;
        if (event && "popstate" === event.type) {
          if (event === currentPopstateTransitionEvent) return false;
          currentPopstateTransitionEvent = event;
          return true;
        }
        currentPopstateTransitionEvent = null;
        return false;
      }
      var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0;
      var cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0;
      var localPromise = "function" === typeof Promise ? Promise : void 0;
      var scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
        return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
      } : scheduleTimeout;
      function handleErrorInNextTick(error) {
        setTimeout(function() {
          throw error;
        });
      }
      function clearSuspenseBoundary(parentInstance, suspenseInstance) {
        var node = suspenseInstance, depth = 0;
        do {
          var nextNode = node.nextSibling;
          parentInstance.removeChild(node);
          if (nextNode && 8 === nextNode.nodeType)
            if (node = nextNode.data, "/$" === node) {
              if (0 === depth) {
                parentInstance.removeChild(nextNode);
                retryIfBlockedOn(suspenseInstance);
                return;
              }
              depth--;
            } else "$" !== node && "$?" !== node && "$!" !== node || depth++;
          node = nextNode;
        } while (node);
        retryIfBlockedOn(suspenseInstance);
      }
      function clearContainerSparingly(container2) {
        var nextNode = container2.firstChild;
        nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
        for (; nextNode; ) {
          var node = nextNode;
          nextNode = nextNode.nextSibling;
          switch (node.nodeName) {
            case "HTML":
            case "HEAD":
            case "BODY":
              clearContainerSparingly(node);
              detachDeletedInstance(node);
              continue;
            case "SCRIPT":
            case "STYLE":
              continue;
            case "LINK":
              if ("stylesheet" === node.rel.toLowerCase()) continue;
          }
          container2.removeChild(node);
        }
      }
      function canHydrateInstance(instance, type, props, inRootOrSingleton) {
        for (; 1 === instance.nodeType; ) {
          var anyProps = props;
          if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
            if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type))
              break;
          } else if (!inRootOrSingleton)
            if ("input" === type && "hidden" === instance.type) {
              var name = null == anyProps.name ? null : "" + anyProps.name;
              if ("hidden" === anyProps.type && instance.getAttribute("name") === name)
                return instance;
            } else return instance;
          else if (!instance[internalHoistableMarker])
            switch (type) {
              case "meta":
                if (!instance.hasAttribute("itemprop")) break;
                return instance;
              case "link":
                name = instance.getAttribute("rel");
                if ("stylesheet" === name && instance.hasAttribute("data-precedence"))
                  break;
                else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title))
                  break;
                return instance;
              case "style":
                if (instance.hasAttribute("data-precedence")) break;
                return instance;
              case "script":
                name = instance.getAttribute("src");
                if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop"))
                  break;
                return instance;
              default:
                return instance;
            }
          instance = getNextHydratable(instance.nextSibling);
          if (null === instance) break;
        }
        return null;
      }
      function canHydrateTextInstance(instance, text, inRootOrSingleton) {
        if ("" === text) return null;
        for (; 3 !== instance.nodeType; ) {
          if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
            return null;
          instance = getNextHydratable(instance.nextSibling);
          if (null === instance) return null;
        }
        return instance;
      }
      function getNextHydratable(node) {
        for (; null != node; node = node.nextSibling) {
          var nodeType = node.nodeType;
          if (1 === nodeType || 3 === nodeType) break;
          if (8 === nodeType) {
            nodeType = node.data;
            if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "F!" === nodeType || "F" === nodeType)
              break;
            if ("/$" === nodeType) return null;
          }
        }
        return node;
      }
      function getParentSuspenseInstance(targetInstance) {
        targetInstance = targetInstance.previousSibling;
        for (var depth = 0; targetInstance; ) {
          if (8 === targetInstance.nodeType) {
            var data = targetInstance.data;
            if ("$" === data || "$!" === data || "$?" === data) {
              if (0 === depth) return targetInstance;
              depth--;
            } else "/$" === data && depth++;
          }
          targetInstance = targetInstance.previousSibling;
        }
        return null;
      }
      function resolveSingletonInstance(type, props, rootContainerInstance) {
        props = getOwnerDocumentFromRootContainer(rootContainerInstance);
        switch (type) {
          case "html":
            type = props.documentElement;
            if (!type) throw Error(formatProdErrorMessage(452));
            return type;
          case "head":
            type = props.head;
            if (!type) throw Error(formatProdErrorMessage(453));
            return type;
          case "body":
            type = props.body;
            if (!type) throw Error(formatProdErrorMessage(454));
            return type;
          default:
            throw Error(formatProdErrorMessage(451));
        }
      }
      var preloadPropsMap = /* @__PURE__ */ new Map();
      var preconnectsSet = /* @__PURE__ */ new Set();
      function getHoistableRoot(container2) {
        return "function" === typeof container2.getRootNode ? container2.getRootNode() : container2.ownerDocument;
      }
      var previousDispatcher = ReactDOMSharedInternals.d;
      ReactDOMSharedInternals.d = {
        f: flushSyncWork,
        r: requestFormReset,
        D: prefetchDNS,
        C: preconnect,
        L: preload,
        m: preloadModule,
        X: preinitScript,
        S: preinitStyle,
        M: preinitModuleScript
      };
      function flushSyncWork() {
        var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
        return previousWasRendering || wasRendering;
      }
      function requestFormReset(form) {
        var formInst = getInstanceFromNode(form);
        null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
      }
      var globalDocument = "undefined" === typeof document ? null : document;
      function preconnectAs(rel, href, crossOrigin) {
        var ownerDocument = globalDocument;
        if (ownerDocument && "string" === typeof href && href) {
          var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
          limitedEscapedHref = 'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
          "string" === typeof crossOrigin && (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
          preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = { rel, crossOrigin, href }, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
        }
      }
      function prefetchDNS(href) {
        previousDispatcher.D(href);
        preconnectAs("dns-prefetch", href, null);
      }
      function preconnect(href, crossOrigin) {
        previousDispatcher.C(href, crossOrigin);
        preconnectAs("preconnect", href, crossOrigin);
      }
      function preload(href, as, options2) {
        previousDispatcher.L(href, as, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && href && as) {
          var preloadSelector = 'link[rel="preload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"]';
          "image" === as ? options2 && options2.imageSrcSet ? (preloadSelector += '[imagesrcset="' + escapeSelectorAttributeValueInsideDoubleQuotes(
            options2.imageSrcSet
          ) + '"]', "string" === typeof options2.imageSizes && (preloadSelector += '[imagesizes="' + escapeSelectorAttributeValueInsideDoubleQuotes(
            options2.imageSizes
          ) + '"]')) : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]' : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]';
          var key = preloadSelector;
          switch (as) {
            case "style":
              key = getStyleKey(href);
              break;
            case "script":
              key = getScriptKey(href);
          }
          preloadPropsMap.has(key) || (href = assign(
            {
              rel: "preload",
              href: "image" === as && options2 && options2.imageSrcSet ? void 0 : href,
              as
            },
            options2
          ), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key)) || (as = ownerDocument.createElement("link"), setInitialProperties(as, "link", href), markNodeAsHoistable(as), ownerDocument.head.appendChild(as)));
        }
      }
      function preloadModule(href, options2) {
        previousDispatcher.m(href, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && href) {
          var as = options2 && "string" === typeof options2.as ? options2.as : "script", preloadSelector = 'link[rel="modulepreload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"][href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]', key = preloadSelector;
          switch (as) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
              key = getScriptKey(href);
          }
          if (!preloadPropsMap.has(key) && (href = assign({ rel: "modulepreload", href }, options2), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
            switch (as) {
              case "audioworklet":
              case "paintworklet":
              case "serviceworker":
              case "sharedworker":
              case "worker":
              case "script":
                if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
                  return;
            }
            as = ownerDocument.createElement("link");
            setInitialProperties(as, "link", href);
            markNodeAsHoistable(as);
            ownerDocument.head.appendChild(as);
          }
        }
      }
      function preinitStyle(href, precedence, options2) {
        previousDispatcher.S(href, precedence, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && href) {
          var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
          precedence = precedence || "default";
          var resource = styles.get(key);
          if (!resource) {
            var state = { loading: 0, preload: null };
            if (resource = ownerDocument.querySelector(
              getStylesheetSelectorFromKey(key)
            ))
              state.loading = 5;
            else {
              href = assign(
                { rel: "stylesheet", href, "data-precedence": precedence },
                options2
              );
              (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options2);
              var link = resource = ownerDocument.createElement("link");
              markNodeAsHoistable(link);
              setInitialProperties(link, "link", href);
              link._p = new Promise(function(resolve, reject) {
                link.onload = resolve;
                link.onerror = reject;
              });
              link.addEventListener("load", function() {
                state.loading |= 1;
              });
              link.addEventListener("error", function() {
                state.loading |= 2;
              });
              state.loading |= 4;
              insertStylesheet(resource, precedence, ownerDocument);
            }
            resource = {
              type: "stylesheet",
              instance: resource,
              count: 1,
              state
            };
            styles.set(key, resource);
          }
        }
      }
      function preinitScript(src, options2) {
        previousDispatcher.X(src, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && src) {
          var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
          resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
            type: "script",
            instance: resource,
            count: 1,
            state: null
          }, scripts.set(key, resource));
        }
      }
      function preinitModuleScript(src, options2) {
        previousDispatcher.M(src, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && src) {
          var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
          resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true, type: "module" }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
            type: "script",
            instance: resource,
            count: 1,
            state: null
          }, scripts.set(key, resource));
        }
      }
      function getResource(type, currentProps, pendingProps, currentResource) {
        var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
        if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
        switch (type) {
          case "meta":
          case "title":
            return null;
          case "style":
            return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (currentProps = getStyleKey(pendingProps.href), pendingProps = getResourcesFromRoot(
              JSCompiler_inline_result
            ).hoistableStyles, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
              type: "style",
              instance: null,
              count: 0,
              state: null
            }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
          case "link":
            if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
              type = getStyleKey(pendingProps.href);
              var styles$242 = getResourcesFromRoot(
                JSCompiler_inline_result
              ).hoistableStyles, resource$243 = styles$242.get(type);
              resource$243 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$243 = {
                type: "stylesheet",
                instance: null,
                count: 0,
                state: { loading: 0, preload: null }
              }, styles$242.set(type, resource$243), (styles$242 = JSCompiler_inline_result.querySelector(
                getStylesheetSelectorFromKey(type)
              )) && !styles$242._p && (resource$243.instance = styles$242, resource$243.state.loading = 5), preloadPropsMap.has(type) || (pendingProps = {
                rel: "preload",
                as: "style",
                href: pendingProps.href,
                crossOrigin: pendingProps.crossOrigin,
                integrity: pendingProps.integrity,
                media: pendingProps.media,
                hrefLang: pendingProps.hrefLang,
                referrerPolicy: pendingProps.referrerPolicy
              }, preloadPropsMap.set(type, pendingProps), styles$242 || preloadStylesheet(
                JSCompiler_inline_result,
                type,
                pendingProps,
                resource$243.state
              )));
              if (currentProps && null === currentResource)
                throw Error(formatProdErrorMessage(528, ""));
              return resource$243;
            }
            if (currentProps && null !== currentResource)
              throw Error(formatProdErrorMessage(529, ""));
            return null;
          case "script":
            return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (currentProps = getScriptKey(pendingProps), pendingProps = getResourcesFromRoot(
              JSCompiler_inline_result
            ).hoistableScripts, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
              type: "script",
              instance: null,
              count: 0,
              state: null
            }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
          default:
            throw Error(formatProdErrorMessage(444, type));
        }
      }
      function getStyleKey(href) {
        return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
      }
      function getStylesheetSelectorFromKey(key) {
        return 'link[rel="stylesheet"][' + key + "]";
      }
      function stylesheetPropsFromRawProps(rawProps) {
        return assign({}, rawProps, {
          "data-precedence": rawProps.precedence,
          precedence: null
        });
      }
      function preloadStylesheet(ownerDocument, key, preloadProps, state) {
        ownerDocument.querySelector('link[rel="preload"][as="style"][' + key + "]") ? state.loading = 1 : (key = ownerDocument.createElement("link"), state.preload = key, key.addEventListener("load", function() {
          return state.loading |= 1;
        }), key.addEventListener("error", function() {
          return state.loading |= 2;
        }), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key));
      }
      function getScriptKey(src) {
        return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
      }
      function getScriptSelectorFromKey(key) {
        return "script[async]" + key;
      }
      function acquireResource(hoistableRoot, resource, props) {
        resource.count++;
        if (null === resource.instance)
          switch (resource.type) {
            case "style":
              var instance = hoistableRoot.querySelector(
                'style[data-href~="' + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + '"]'
              );
              if (instance)
                return resource.instance = instance, markNodeAsHoistable(instance), instance;
              var styleProps = assign({}, props, {
                "data-href": props.href,
                "data-precedence": props.precedence,
                href: null,
                precedence: null
              });
              instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement(
                "style"
              );
              markNodeAsHoistable(instance);
              setInitialProperties(instance, "style", styleProps);
              insertStylesheet(instance, props.precedence, hoistableRoot);
              return resource.instance = instance;
            case "stylesheet":
              styleProps = getStyleKey(props.href);
              var instance$248 = hoistableRoot.querySelector(
                getStylesheetSelectorFromKey(styleProps)
              );
              if (instance$248)
                return resource.state.loading |= 4, resource.instance = instance$248, markNodeAsHoistable(instance$248), instance$248;
              instance = stylesheetPropsFromRawProps(props);
              (styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
              instance$248 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
              markNodeAsHoistable(instance$248);
              var linkInstance = instance$248;
              linkInstance._p = new Promise(function(resolve, reject) {
                linkInstance.onload = resolve;
                linkInstance.onerror = reject;
              });
              setInitialProperties(instance$248, "link", instance);
              resource.state.loading |= 4;
              insertStylesheet(instance$248, props.precedence, hoistableRoot);
              return resource.instance = instance$248;
            case "script":
              instance$248 = getScriptKey(props.src);
              if (styleProps = hoistableRoot.querySelector(
                getScriptSelectorFromKey(instance$248)
              ))
                return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
              instance = props;
              if (styleProps = preloadPropsMap.get(instance$248))
                instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
              hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
              styleProps = hoistableRoot.createElement("script");
              markNodeAsHoistable(styleProps);
              setInitialProperties(styleProps, "link", instance);
              hoistableRoot.head.appendChild(styleProps);
              return resource.instance = styleProps;
            case "void":
              return null;
            default:
              throw Error(formatProdErrorMessage(443, resource.type));
          }
        else
          "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
        return resource.instance;
      }
      function insertStylesheet(instance, precedence, root3) {
        for (var nodes = root3.querySelectorAll(
          'link[rel="stylesheet"][data-precedence],style[data-precedence]'
        ), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i8 = 0; i8 < nodes.length; i8++) {
          var node = nodes[i8];
          if (node.dataset.precedence === precedence) prior = node;
          else if (prior !== last) break;
        }
        prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root3.nodeType ? root3.head : root3, precedence.insertBefore(instance, precedence.firstChild));
      }
      function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
        null == stylesheetProps.crossOrigin && (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
        null == stylesheetProps.referrerPolicy && (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
        null == stylesheetProps.title && (stylesheetProps.title = preloadProps.title);
      }
      function adoptPreloadPropsForScript(scriptProps, preloadProps) {
        null == scriptProps.crossOrigin && (scriptProps.crossOrigin = preloadProps.crossOrigin);
        null == scriptProps.referrerPolicy && (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
        null == scriptProps.integrity && (scriptProps.integrity = preloadProps.integrity);
      }
      var tagCaches = null;
      function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
        if (null === tagCaches) {
          var cache = /* @__PURE__ */ new Map();
          var caches = tagCaches = /* @__PURE__ */ new Map();
          caches.set(ownerDocument, cache);
        } else
          caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
        if (cache.has(type)) return cache;
        cache.set(type, null);
        ownerDocument = ownerDocument.getElementsByTagName(type);
        for (caches = 0; caches < ownerDocument.length; caches++) {
          var node = ownerDocument[caches];
          if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
            var nodeKey = node.getAttribute(keyAttribute) || "";
            nodeKey = type + nodeKey;
            var existing = cache.get(nodeKey);
            existing ? existing.push(node) : cache.set(nodeKey, [node]);
          }
        }
        return cache;
      }
      function mountHoistable(hoistableRoot, type, instance) {
        hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
        hoistableRoot.head.insertBefore(
          instance,
          "title" === type ? hoistableRoot.querySelector("head > title") : null
        );
      }
      function isHostHoistableType(type, props, hostContext) {
        if (1 === hostContext || null != props.itemProp) return false;
        switch (type) {
          case "meta":
          case "title":
            return true;
          case "style":
            if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href)
              break;
            return true;
          case "link":
            if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError)
              break;
            switch (props.rel) {
              case "stylesheet":
                return type = props.disabled, "string" === typeof props.precedence && null == type;
              default:
                return true;
            }
          case "script":
            if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src)
              return true;
        }
        return false;
      }
      function preloadResource(resource) {
        return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? false : true;
      }
      var suspendedState = null;
      function noop() {
      }
      function suspendResource(hoistableRoot, resource, props) {
        if (null === suspendedState) throw Error(formatProdErrorMessage(475));
        var state = suspendedState;
        if ("stylesheet" === resource.type && ("string" !== typeof props.media || false !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
          if (null === resource.instance) {
            var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(
              getStylesheetSelectorFromKey(key)
            );
            if (instance) {
              hoistableRoot = instance._p;
              null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
              resource.state.loading |= 4;
              resource.instance = instance;
              markNodeAsHoistable(instance);
              return;
            }
            instance = hoistableRoot.ownerDocument || hoistableRoot;
            props = stylesheetPropsFromRawProps(props);
            (key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
            instance = instance.createElement("link");
            markNodeAsHoistable(instance);
            var linkInstance = instance;
            linkInstance._p = new Promise(function(resolve, reject) {
              linkInstance.onload = resolve;
              linkInstance.onerror = reject;
            });
            setInitialProperties(instance, "link", props);
            resource.instance = instance;
          }
          null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
          state.stylesheets.set(resource, hoistableRoot);
          (hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
        }
      }
      function waitForCommitToBeReady() {
        if (null === suspendedState) throw Error(formatProdErrorMessage(475));
        var state = suspendedState;
        state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
        return 0 < state.count ? function(commit) {
          var stylesheetTimer = setTimeout(function() {
            state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
            if (state.unsuspend) {
              var unsuspend = state.unsuspend;
              state.unsuspend = null;
              unsuspend();
            }
          }, 6e4);
          state.unsuspend = commit;
          return function() {
            state.unsuspend = null;
            clearTimeout(stylesheetTimer);
          };
        } : null;
      }
      function onUnsuspend() {
        this.count--;
        if (0 === this.count) {
          if (this.stylesheets) insertSuspendedStylesheets(this, this.stylesheets);
          else if (this.unsuspend) {
            var unsuspend = this.unsuspend;
            this.unsuspend = null;
            unsuspend();
          }
        }
      }
      var precedencesByRoot = null;
      function insertSuspendedStylesheets(state, resources) {
        state.stylesheets = null;
        null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
      }
      function insertStylesheetIntoRoot(root3, resource) {
        if (!(resource.state.loading & 4)) {
          var precedences = precedencesByRoot.get(root3);
          if (precedences) var last = precedences.get(null);
          else {
            precedences = /* @__PURE__ */ new Map();
            precedencesByRoot.set(root3, precedences);
            for (var nodes = root3.querySelectorAll(
              "link[data-precedence],style[data-precedence]"
            ), i8 = 0; i8 < nodes.length; i8++) {
              var node = nodes[i8];
              if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media"))
                precedences.set(node.dataset.precedence, node), last = node;
            }
            last && precedences.set(null, last);
          }
          nodes = resource.instance;
          node = nodes.getAttribute("data-precedence");
          i8 = precedences.get(node) || last;
          i8 === last && precedences.set(null, nodes);
          precedences.set(node, nodes);
          this.count++;
          last = onUnsuspend.bind(this);
          nodes.addEventListener("load", last);
          nodes.addEventListener("error", last);
          i8 ? i8.parentNode.insertBefore(nodes, i8.nextSibling) : (root3 = 9 === root3.nodeType ? root3.head : root3, root3.insertBefore(nodes, root3.firstChild));
          resource.state.loading |= 4;
        }
      }
      var HostTransitionContext = {
        $$typeof: REACT_CONTEXT_TYPE,
        Provider: null,
        Consumer: null,
        _currentValue: sharedNotPendingObject,
        _currentValue2: sharedNotPendingObject,
        _threadCount: 0
      };
      function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, formState) {
        this.tag = 1;
        this.containerInfo = containerInfo;
        this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
        this.timeoutHandle = -1;
        this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
        this.callbackPriority = 0;
        this.expirationTimes = createLaneMap(-1);
        this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.finishedLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
        this.entanglements = createLaneMap(0);
        this.hiddenUpdates = createLaneMap(null);
        this.identifierPrefix = identifierPrefix;
        this.onUncaughtError = onUncaughtError;
        this.onCaughtError = onCaughtError;
        this.onRecoverableError = onRecoverableError;
        this.pooledCache = null;
        this.pooledCacheLanes = 0;
        this.formState = formState;
        this.incompleteTransitions = /* @__PURE__ */ new Map();
      }
      function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, transitionCallbacks, formState) {
        containerInfo = new FiberRootNode(
          containerInfo,
          tag,
          hydrate,
          identifierPrefix,
          onUncaughtError,
          onCaughtError,
          onRecoverableError,
          formState
        );
        tag = 1;
        true === isStrictMode && (tag |= 24);
        isStrictMode = createFiberImplClass(3, null, null, tag);
        containerInfo.current = isStrictMode;
        isStrictMode.stateNode = containerInfo;
        tag = createCache();
        tag.refCount++;
        containerInfo.pooledCache = tag;
        tag.refCount++;
        isStrictMode.memoizedState = {
          element: initialChildren,
          isDehydrated: hydrate,
          cache: tag
        };
        initializeUpdateQueue(isStrictMode);
        return containerInfo;
      }
      function getContextForSubtree(parentComponent) {
        if (!parentComponent) return emptyContextObject;
        parentComponent = emptyContextObject;
        return parentComponent;
      }
      function updateContainerImpl(rootFiber, lane, element, container2, parentComponent, callback) {
        parentComponent = getContextForSubtree(parentComponent);
        null === container2.context ? container2.context = parentComponent : container2.pendingContext = parentComponent;
        container2 = createUpdate(lane);
        container2.payload = { element };
        callback = void 0 === callback ? null : callback;
        null !== callback && (container2.callback = callback);
        element = enqueueUpdate(rootFiber, container2, lane);
        null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
      }
      function markRetryLaneImpl(fiber, retryLane) {
        fiber = fiber.memoizedState;
        if (null !== fiber && null !== fiber.dehydrated) {
          var a4 = fiber.retryLane;
          fiber.retryLane = 0 !== a4 && a4 < retryLane ? a4 : retryLane;
        }
      }
      function markRetryLaneIfNotHydrated(fiber, retryLane) {
        markRetryLaneImpl(fiber, retryLane);
        (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
      }
      function attemptContinuousHydration(fiber) {
        if (13 === fiber.tag) {
          var root3 = enqueueConcurrentRenderForLane(fiber, 67108864);
          null !== root3 && scheduleUpdateOnFiber(root3, fiber, 67108864);
          markRetryLaneIfNotHydrated(fiber, 67108864);
        }
      }
      var _enabled = true;
      function dispatchDiscreteEvent(domEventName, eventSystemFlags, container2, nativeEvent) {
        var prevTransition = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        try {
          ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container2, nativeEvent);
        } finally {
          ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
        }
      }
      function dispatchContinuousEvent(domEventName, eventSystemFlags, container2, nativeEvent) {
        var prevTransition = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        try {
          ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container2, nativeEvent);
        } finally {
          ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
        }
      }
      function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
        if (_enabled) {
          var blockedOn = findInstanceBlockingEvent(nativeEvent);
          if (null === blockedOn)
            dispatchEventForPluginEventSystem(
              domEventName,
              eventSystemFlags,
              nativeEvent,
              return_targetInst,
              targetContainer
            ), clearIfContinuousEvent(domEventName, nativeEvent);
          else if (queueIfContinuousEvent(
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          ))
            nativeEvent.stopPropagation();
          else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
            for (; null !== blockedOn; ) {
              var fiber = getInstanceFromNode(blockedOn);
              if (null !== fiber)
                switch (fiber.tag) {
                  case 3:
                    fiber = fiber.stateNode;
                    if (fiber.current.memoizedState.isDehydrated) {
                      var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                      if (0 !== lanes) {
                        var root3 = fiber;
                        root3.pendingLanes |= 2;
                        for (root3.entangledLanes |= 2; lanes; ) {
                          var lane = 1 << 31 - clz32(lanes);
                          root3.entanglements[1] |= lane;
                          lanes &= ~lane;
                        }
                        ensureRootIsScheduled(fiber);
                        0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, false));
                      }
                    }
                    break;
                  case 13:
                    root3 = enqueueConcurrentRenderForLane(fiber, 2), null !== root3 && scheduleUpdateOnFiber(root3, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
                }
              fiber = findInstanceBlockingEvent(nativeEvent);
              null === fiber && dispatchEventForPluginEventSystem(
                domEventName,
                eventSystemFlags,
                nativeEvent,
                return_targetInst,
                targetContainer
              );
              if (fiber === blockedOn) break;
              blockedOn = fiber;
            }
            null !== blockedOn && nativeEvent.stopPropagation();
          } else
            dispatchEventForPluginEventSystem(
              domEventName,
              eventSystemFlags,
              nativeEvent,
              null,
              targetContainer
            );
        }
      }
      function findInstanceBlockingEvent(nativeEvent) {
        nativeEvent = getEventTarget(nativeEvent);
        return findInstanceBlockingTarget(nativeEvent);
      }
      var return_targetInst = null;
      function findInstanceBlockingTarget(targetNode) {
        return_targetInst = null;
        targetNode = getClosestInstanceFromNode(targetNode);
        if (null !== targetNode) {
          var nearestMounted = getNearestMountedFiber(targetNode);
          if (null === nearestMounted) targetNode = null;
          else {
            var tag = nearestMounted.tag;
            if (13 === tag) {
              targetNode = getSuspenseInstanceFromFiber(nearestMounted);
              if (null !== targetNode) return targetNode;
              targetNode = null;
            } else if (3 === tag) {
              if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
                return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
              targetNode = null;
            } else nearestMounted !== targetNode && (targetNode = null);
          }
        }
        return_targetInst = targetNode;
        return null;
      }
      function getEventPriority(domEventName) {
        switch (domEventName) {
          case "beforetoggle":
          case "cancel":
          case "click":
          case "close":
          case "contextmenu":
          case "copy":
          case "cut":
          case "auxclick":
          case "dblclick":
          case "dragend":
          case "dragstart":
          case "drop":
          case "focusin":
          case "focusout":
          case "input":
          case "invalid":
          case "keydown":
          case "keypress":
          case "keyup":
          case "mousedown":
          case "mouseup":
          case "paste":
          case "pause":
          case "play":
          case "pointercancel":
          case "pointerdown":
          case "pointerup":
          case "ratechange":
          case "reset":
          case "resize":
          case "seeked":
          case "submit":
          case "toggle":
          case "touchcancel":
          case "touchend":
          case "touchstart":
          case "volumechange":
          case "change":
          case "selectionchange":
          case "textInput":
          case "compositionstart":
          case "compositionend":
          case "compositionupdate":
          case "beforeblur":
          case "afterblur":
          case "beforeinput":
          case "blur":
          case "fullscreenchange":
          case "focus":
          case "hashchange":
          case "popstate":
          case "select":
          case "selectstart":
            return 2;
          case "drag":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "mousemove":
          case "mouseout":
          case "mouseover":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "scroll":
          case "touchmove":
          case "wheel":
          case "mouseenter":
          case "mouseleave":
          case "pointerenter":
          case "pointerleave":
            return 8;
          case "message":
            switch (getCurrentPriorityLevel()) {
              case ImmediatePriority:
                return 2;
              case UserBlockingPriority:
                return 8;
              case NormalPriority$1:
              case LowPriority:
                return 32;
              case IdlePriority:
                return 268435456;
              default:
                return 32;
            }
          default:
            return 32;
        }
      }
      var hasScheduledReplayAttempt = false;
      var queuedFocus = null;
      var queuedDrag = null;
      var queuedMouse = null;
      var queuedPointers = /* @__PURE__ */ new Map();
      var queuedPointerCaptures = /* @__PURE__ */ new Map();
      var queuedExplicitHydrationTargets = [];
      var discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
        " "
      );
      function clearIfContinuousEvent(domEventName, nativeEvent) {
        switch (domEventName) {
          case "focusin":
          case "focusout":
            queuedFocus = null;
            break;
          case "dragenter":
          case "dragleave":
            queuedDrag = null;
            break;
          case "mouseover":
          case "mouseout":
            queuedMouse = null;
            break;
          case "pointerover":
          case "pointerout":
            queuedPointers.delete(nativeEvent.pointerId);
            break;
          case "gotpointercapture":
          case "lostpointercapture":
            queuedPointerCaptures.delete(nativeEvent.pointerId);
        }
      }
      function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
        if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent)
          return existingQueuedEvent = {
            blockedOn,
            domEventName,
            eventSystemFlags,
            nativeEvent,
            targetContainers: [targetContainer]
          }, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
        existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
        blockedOn = existingQueuedEvent.targetContainers;
        null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
        return existingQueuedEvent;
      }
      function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
        switch (domEventName) {
          case "focusin":
            return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(
              queuedFocus,
              blockedOn,
              domEventName,
              eventSystemFlags,
              targetContainer,
              nativeEvent
            ), true;
          case "dragenter":
            return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(
              queuedDrag,
              blockedOn,
              domEventName,
              eventSystemFlags,
              targetContainer,
              nativeEvent
            ), true;
          case "mouseover":
            return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(
              queuedMouse,
              blockedOn,
              domEventName,
              eventSystemFlags,
              targetContainer,
              nativeEvent
            ), true;
          case "pointerover":
            var pointerId = nativeEvent.pointerId;
            queuedPointers.set(
              pointerId,
              accumulateOrCreateContinuousQueuedReplayableEvent(
                queuedPointers.get(pointerId) || null,
                blockedOn,
                domEventName,
                eventSystemFlags,
                targetContainer,
                nativeEvent
              )
            );
            return true;
          case "gotpointercapture":
            return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(
              pointerId,
              accumulateOrCreateContinuousQueuedReplayableEvent(
                queuedPointerCaptures.get(pointerId) || null,
                blockedOn,
                domEventName,
                eventSystemFlags,
                targetContainer,
                nativeEvent
              )
            ), true;
        }
        return false;
      }
      function attemptExplicitHydrationTarget(queuedTarget) {
        var targetInst = getClosestInstanceFromNode(queuedTarget.target);
        if (null !== targetInst) {
          var nearestMounted = getNearestMountedFiber(targetInst);
          if (null !== nearestMounted) {
            if (targetInst = nearestMounted.tag, 13 === targetInst) {
              if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
                queuedTarget.blockedOn = targetInst;
                runWithPriority(queuedTarget.priority, function() {
                  if (13 === nearestMounted.tag) {
                    var lane = requestUpdateLane(), root3 = enqueueConcurrentRenderForLane(nearestMounted, lane);
                    null !== root3 && scheduleUpdateOnFiber(root3, nearestMounted, lane);
                    markRetryLaneIfNotHydrated(nearestMounted, lane);
                  }
                });
                return;
              }
            } else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
              queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
              return;
            }
          }
        }
        queuedTarget.blockedOn = null;
      }
      function attemptReplayContinuousQueuedEvent(queuedEvent) {
        if (null !== queuedEvent.blockedOn) return false;
        for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length; ) {
          var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
          if (null === nextBlockedOn) {
            nextBlockedOn = queuedEvent.nativeEvent;
            var nativeEventClone = new nextBlockedOn.constructor(
              nextBlockedOn.type,
              nextBlockedOn
            );
            currentReplayingEvent = nativeEventClone;
            nextBlockedOn.target.dispatchEvent(nativeEventClone);
            currentReplayingEvent = null;
          } else
            return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, false;
          targetContainers.shift();
        }
        return true;
      }
      function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
        attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
      }
      function replayUnblockedEvents() {
        hasScheduledReplayAttempt = false;
        null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
        null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
        null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
        queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
        queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
      }
      function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
        queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = true, Scheduler.unstable_scheduleCallback(
          Scheduler.unstable_NormalPriority,
          replayUnblockedEvents
        )));
      }
      var lastScheduledReplayQueue = null;
      function scheduleReplayQueueIfNeeded(formReplayingQueue) {
        lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(
          Scheduler.unstable_NormalPriority,
          function() {
            lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
            for (var i8 = 0; i8 < formReplayingQueue.length; i8 += 3) {
              var form = formReplayingQueue[i8], submitterOrAction = formReplayingQueue[i8 + 1], formData = formReplayingQueue[i8 + 2];
              if ("function" !== typeof submitterOrAction)
                if (null === findInstanceBlockingTarget(submitterOrAction || form))
                  continue;
                else break;
              var formInst = getInstanceFromNode(form);
              null !== formInst && (formReplayingQueue.splice(i8, 3), i8 -= 3, startHostTransition(
                formInst,
                {
                  pending: true,
                  data: formData,
                  method: form.method,
                  action: submitterOrAction
                },
                submitterOrAction,
                formData
              ));
            }
          }
        ));
      }
      function retryIfBlockedOn(unblocked) {
        function unblock(queuedEvent) {
          return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
        }
        null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
        null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
        null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
        queuedPointers.forEach(unblock);
        queuedPointerCaptures.forEach(unblock);
        for (var i8 = 0; i8 < queuedExplicitHydrationTargets.length; i8++) {
          var queuedTarget = queuedExplicitHydrationTargets[i8];
          queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
        }
        for (; 0 < queuedExplicitHydrationTargets.length && (i8 = queuedExplicitHydrationTargets[0], null === i8.blockedOn); )
          attemptExplicitHydrationTarget(i8), null === i8.blockedOn && queuedExplicitHydrationTargets.shift();
        i8 = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
        if (null != i8)
          for (queuedTarget = 0; queuedTarget < i8.length; queuedTarget += 3) {
            var form = i8[queuedTarget], submitterOrAction = i8[queuedTarget + 1], formProps = form[internalPropsKey] || null;
            if ("function" === typeof submitterOrAction)
              formProps || scheduleReplayQueueIfNeeded(i8);
            else if (formProps) {
              var action = null;
              if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
                if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null)
                  action = formProps.formAction;
                else {
                  if (null !== findInstanceBlockingTarget(form)) continue;
                }
              else action = formProps.action;
              "function" === typeof action ? i8[queuedTarget + 1] = action : (i8.splice(queuedTarget, 3), queuedTarget -= 3);
              scheduleReplayQueueIfNeeded(i8);
            }
          }
      }
      function ReactDOMRoot(internalRoot) {
        this._internalRoot = internalRoot;
      }
      ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
        var root3 = this._internalRoot;
        if (null === root3) throw Error(formatProdErrorMessage(409));
        var current = root3.current, lane = requestUpdateLane();
        updateContainerImpl(current, lane, children, root3, null, null);
      };
      ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
        var root3 = this._internalRoot;
        if (null !== root3) {
          this._internalRoot = null;
          var container2 = root3.containerInfo;
          0 === root3.tag && flushPassiveEffects();
          updateContainerImpl(root3.current, 2, null, root3, null, null);
          flushSyncWork$1();
          container2[internalContainerInstanceKey] = null;
        }
      };
      function ReactDOMHydrationRoot(internalRoot) {
        this._internalRoot = internalRoot;
      }
      ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
        if (target) {
          var updatePriority = resolveUpdatePriority();
          target = { blockedOn: null, target, priority: updatePriority };
          for (var i8 = 0; i8 < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i8].priority; i8++) ;
          queuedExplicitHydrationTargets.splice(i8, 0, target);
          0 === i8 && attemptExplicitHydrationTarget(target);
        }
      };
      var isomorphicReactPackageVersion$jscomp$inline_1686 = React2.version;
      if ("19.0.0" !== isomorphicReactPackageVersion$jscomp$inline_1686)
        throw Error(
          formatProdErrorMessage(
            527,
            isomorphicReactPackageVersion$jscomp$inline_1686,
            "19.0.0"
          )
        );
      ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
        var fiber = componentOrElement._reactInternals;
        if (void 0 === fiber) {
          if ("function" === typeof componentOrElement.render)
            throw Error(formatProdErrorMessage(188));
          componentOrElement = Object.keys(componentOrElement).join(",");
          throw Error(formatProdErrorMessage(268, componentOrElement));
        }
        componentOrElement = findCurrentFiberUsingSlowPath(fiber);
        componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
        componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
        return componentOrElement;
      };
      var internals$jscomp$inline_2165 = {
        bundleType: 0,
        version: "19.0.0",
        rendererPackageName: "react-dom",
        currentDispatcherRef: ReactSharedInternals,
        findFiberByHostInstance: getClosestInstanceFromNode,
        reconcilerVersion: "19.0.0"
      };
      if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
        hook$jscomp$inline_2166 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!hook$jscomp$inline_2166.isDisabled && hook$jscomp$inline_2166.supportsFiber)
          try {
            rendererID = hook$jscomp$inline_2166.inject(
              internals$jscomp$inline_2165
            ), injectedHook = hook$jscomp$inline_2166;
          } catch (err) {
          }
      }
      var hook$jscomp$inline_2166;
      exports.createRoot = function(container2, options2) {
        if (!isValidContainer(container2)) throw Error(formatProdErrorMessage(299));
        var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, transitionCallbacks = null;
        null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError), void 0 !== options2.unstable_transitionCallbacks && (transitionCallbacks = options2.unstable_transitionCallbacks));
        options2 = createFiberRoot(
          container2,
          1,
          false,
          null,
          null,
          isStrictMode,
          identifierPrefix,
          onUncaughtError,
          onCaughtError,
          onRecoverableError,
          transitionCallbacks,
          null
        );
        container2[internalContainerInstanceKey] = options2.current;
        listenToAllSupportedEvents(
          8 === container2.nodeType ? container2.parentNode : container2
        );
        return new ReactDOMRoot(options2);
      };
      exports.hydrateRoot = function(container2, initialChildren, options2) {
        if (!isValidContainer(container2)) throw Error(formatProdErrorMessage(299));
        var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, transitionCallbacks = null, formState = null;
        null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError), void 0 !== options2.unstable_transitionCallbacks && (transitionCallbacks = options2.unstable_transitionCallbacks), void 0 !== options2.formState && (formState = options2.formState));
        initialChildren = createFiberRoot(
          container2,
          1,
          true,
          initialChildren,
          null != options2 ? options2 : null,
          isStrictMode,
          identifierPrefix,
          onUncaughtError,
          onCaughtError,
          onRecoverableError,
          transitionCallbacks,
          formState
        );
        initialChildren.context = getContextForSubtree(null);
        options2 = initialChildren.current;
        isStrictMode = requestUpdateLane();
        identifierPrefix = createUpdate(isStrictMode);
        identifierPrefix.callback = null;
        enqueueUpdate(options2, identifierPrefix, isStrictMode);
        initialChildren.current.lanes = isStrictMode;
        markRootUpdated$1(initialChildren, isStrictMode);
        ensureRootIsScheduled(initialChildren);
        container2[internalContainerInstanceKey] = initialChildren.current;
        listenToAllSupportedEvents(container2);
        return new ReactDOMHydrationRoot(initialChildren);
      };
      exports.version = "19.0.0";
    }
  });

  // node_modules/react-dom/client.js
  var require_client = __commonJS({
    "node_modules/react-dom/client.js"(exports, module) {
      "use strict";
      function checkDCE() {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
          return;
        }
        if (false) {
          throw new Error("^_^");
        }
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
        } catch (err) {
          console.error(err);
        }
      }
      if (true) {
        checkDCE();
        module.exports = require_react_dom_client_production();
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
  var import_react4 = __toESM(require_react(), 1);
  var import_client = __toESM(require_client(), 1);

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
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("templateId");
    const collectionId = params.get("collectionId");
    const clientId = window.CROSSMINT_CLIENT_API_KEY;
    return /* @__PURE__ */ import_react4.default.createElement("div", { className: "min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "relative py-3 sm:max-w-xl sm:mx-auto" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl" }), /* @__PURE__ */ import_react4.default.createElement("div", { className: "relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "max-w-md mx-auto" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "divide-y divide-gray-200" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7" }, /* @__PURE__ */ import_react4.default.createElement("h2", { className: "text-2xl font-bold mb-8" }, "Complete Your Purchase"), clientId && templateId && collectionId ? /* @__PURE__ */ import_react4.default.createElement(J, { apiKey: clientId }, /* @__PURE__ */ import_react4.default.createElement(
      z2,
      {
        lineItems: {
          collectionLocator: `crossmint:${collectionId}`,
          callData: {
            totalPrice: "0.0001",
            quantity: 1,
            templateId
          }
        },
        payment: {
          crypto: { enabled: true },
          fiat: { enabled: true }
        }
      }
    )) : /* @__PURE__ */ import_react4.default.createElement("p", null, "Missing required parameters")))))));
  }
  var container = document.getElementById("root");
  var root = (0, import_client.createRoot)(container);
  root.render(/* @__PURE__ */ import_react4.default.createElement(CheckoutPage, null));
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

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
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
