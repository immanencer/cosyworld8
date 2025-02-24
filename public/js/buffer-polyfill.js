
(function() {
  if (typeof window !== 'undefined') {
    const buffer = require('buffer/');
    window.Buffer = buffer.Buffer;
    window.global = window;
    window.process = { env: {} };
  }
})();
