/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/index.js":
/*!*****************************!*\
  !*** ./src/client/index.js ***!
  \*****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n\n\nvar _buffer = require(\"buffer\");\nvar _moonshotSdk = require(\"@wen-moon-ser/moonshot-sdk\");\nvar _wallet = require(\"./services/wallet\");\nvar _token = require(\"./services/token\");\nvar _api = require(\"./services/api\");\nrequire(\"./ui/tabs\");\nrequire(\"./ui/content\");\n// Make Buffer available globally\nwindow.Buffer = _buffer.Buffer;\n\n// Initialize global state\nwindow.state = {\n  wallet: null,\n  activeTab: \"squad\",\n  loading: false,\n  socialSort: \"new\"\n};\n\n// Export functions to window object\nwindow.connectWallet = _wallet.connectWallet;\nwindow.createToken = _token.createToken;\nwindow.fetchJSON = _api.fetchJSON;\n\n// Initialize app\ndocument.addEventListener('DOMContentLoaded', function () {\n  loadContent();\n});\n\n//# sourceURL=webpack://cosyworld8/./src/client/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/client/index.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;