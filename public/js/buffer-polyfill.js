
import { Buffer } from 'https://cdn.skypack.dev/buffer';
window.Buffer = Buffer;
// Buffer polyfill for browser environment
(function(global) {
  if (global.Buffer) return;

  const Buffer = require('buffer/').Buffer;
  global.Buffer = Buffer;
})(typeof window !== 'undefined' ? window : global);
