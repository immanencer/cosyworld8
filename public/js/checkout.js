var CheckoutPage = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
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

  // src/react/CheckoutPage.jsx
  var CheckoutPage_exports = {};
  __export(CheckoutPage_exports, {
    default: () => CheckoutPage_default
  });
  var import_react = __toESM(__require("react"), 1);
  var import_client_sdk_react_ui = __require("@crossmint/client-sdk-react-ui");
  function CheckoutPage() {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("templateId");
    const collectionId = params.get("collectionId");
    const clientId = window.CROSSMINT_CLIENT_API_KEY;
    if (!clientId) {
      return /* @__PURE__ */ import_react.default.createElement("div", null, "Missing API key");
    }
    if (!templateId || !collectionId) {
      return /* @__PURE__ */ import_react.default.createElement("div", null, "Missing template or collection ID");
    }
    return /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h1", null, "NFT Checkout"), /* @__PURE__ */ import_react.default.createElement(import_client_sdk_react_ui.CrossmintProvider, { apiKey: clientId }, /* @__PURE__ */ import_react.default.createElement(
      import_client_sdk_react_ui.CrossmintEmbeddedCheckout,
      {
        clientId,
        environment: "staging",
        lineItems: {
          collectionLocator: `crossmint:${collectionId}:${templateId}`,
          callData: {
            totalPrice: "0.001",
            quantity: 1
          }
        }
      }
    )));
  }
  var CheckoutPage_default = CheckoutPage;
  return __toCommonJS(CheckoutPage_exports);
})();
