
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
