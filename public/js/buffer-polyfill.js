
// Buffer polyfill for browser environment
(function(global) {
  if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || require('buffer/').Buffer;
    window.process = window.process || { env: {} };
    window.global = window;
  }
})(typeof window !== 'undefined' ? window : global);
