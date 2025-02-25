// ES Module imports
import { Buffer } from 'buffer';

// Make Buffer and other Node.js globals available if needed
window.Buffer = Buffer;
window.global = window;
window.process = { env: {} };

import {
  Moonshot,
  CurveType,
  Environment,
  MigrationDex,
  SolanaSerializationService
} from '@wen-moon-ser/moonshot-sdk';

import { connectWallet } from './services/wallet';
import { createToken } from './services/token';
import { fetchJSON } from './services/api';
import './ui/tabs';
import './ui/content';

// Initialize global state
window.state = {
  wallet: null,
  activeTab: "squad",
  loading: false,
  socialSort: "new",
};

// Export functions to window object
window.connectWallet = connectWallet;
window.createToken = createToken;
window.fetchJSON = fetchJSON;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadContent();
});